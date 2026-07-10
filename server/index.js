require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// Request Logger: Critical for PM2 monitoring
app.use((req, res, next) => {
    console.log(`>>> ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- 1b. Runtime Payment Switches (server/paypal-mode.txt) ---
// Both switches are read from the file on EVERY request, so editing the
// file takes effect instantly - no rebuild, no restart, no code change.
// Defaults fail safe: missing/unreadable file means sandbox on, payments off.
function readPaymentConfig() {
    let sandboxMode = true;      // real money only when the file explicitly says so
    let paymentsEnabled = false; // store closed unless the file explicitly opens it
    try {
        const content = fs.readFileSync(path.join(__dirname, 'paypal-mode.txt'), 'utf8');
        sandboxMode = !content.includes('sandbox-mode=false');
        paymentsEnabled = content.includes('payments-enabled=true');
    } catch (err) {
        console.warn('paypal-mode.txt not found - defaulting to sandbox mode, payments disabled.');
    }
    return { sandboxMode, paymentsEnabled };
}

app.get('/api/paypal-config', (req, res) => {
    const { sandboxMode, paymentsEnabled } = readPaymentConfig();
    const suffix = sandboxMode ? 'SANDBOX' : 'LIVE';
    const mode = sandboxMode ? 'sandbox' : 'live';

    res.json({
        clientId:      process.env[`PAYPAL_CLIENT_ID_${suffix}`]        || '',
        planIdCasual:  process.env[`PAYPAL_PLAN_ID_CASUAL_${suffix}`]   || '',
        planIdTypical: process.env[`PAYPAL_PLAN_ID_TYPICAL_${suffix}`]  || '',
        planIdPower:   process.env[`PAYPAL_PLAN_ID_POWER_${suffix}`]    || '',
        mode,
        paymentsEnabled,
    });
});

// --- 2. Configuration Constants ---

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Maps payment amount to class name and coin denomination for Core API
const AMOUNT_MAPPING = {
    10:   { class: "bit",   coinDenomination: 1 },
    20:   { class: "byte",  coinDenomination: 10 },
    50:   { class: "kilo",  coinDenomination: 100 },
    100:  { class: "mega",  coinDenomination: 1000 },
    1000: { class: "giga",  coinDenomination: 10000 }
};

// Phase I hardcoded beacons
const DEFAULT_BEACON = "RAIDA11";
const BACKUP_BEACON = "RAIDA14";

// --- Email Address Generation (canonical: dotted-serial@tier) ---
// The QMail address IS the coin's identity: the serial number written as
// dot-separated base-256 bytes, @, the denomination tier - e.g. 39.233@bit.
// Matches canonical_address() in the wallet-generation script, so the
// address always equals the coin filename inside the buyer's zip.
// (The old adjective/noun word-list scheme is retired.)
function canonicalAddress(serialNumber, denominationClass) {
    let n = serialNumber;
    const bytes = [];
    while (n > 0) {
        bytes.unshift(n % 256);
        n = Math.floor(n / 256);
    }
    if (bytes.length === 0) bytes.push(0);
    return `${bytes.join('.')}@${denominationClass}`;
}

// --- Token Generation ---
// Generates a short HMAC token tied to qmail + fullName
// TOKEN_SECRET must be set in .env — keep it private
function generateInfluencerToken(qmail, fullName) {
    const secret = process.env.TOKEN_SECRET || 'dms-default-secret-change-in-production';
    return crypto
        .createHmac('sha256', secret)
        .update(`${qmail}:${fullName}`)
        .digest('hex')
        .slice(0, 24);
}

// --- 3. Custom Base32 Conversion ---
function convertToCustomBase32(decimalInt) {
    try {
        let tempN = BigInt(decimalInt);
        if (tempN === 0n) return ALPHABET[0];
        let chars = [];
        while (tempN > 0n) {
            let index = Number(tempN & 31n);
            chars.push(ALPHABET[index]);
            tempN >>= 5n;
        }
        return chars.reverse().join('');
    } catch (e) {
        return "ERROR_SERIAL";
    }
}

// --- 4. Database Helper Functions ---

const USERS_CSV_PATH = '/var/www/distributedmailsystem.com/users.csv';
const USERS_CSV_HEADERS = 'Email,FirstName,LastName,Description,InboxFee,Primary,Secondary';

function registerUser(email, firstName, lastName, description, inboxFee) {
    try {
        let needsHeader = false;
        if (!fs.existsSync(USERS_CSV_PATH)) {
            needsHeader = true;
        } else {
            const content = fs.readFileSync(USERS_CSV_PATH, 'utf8').trim();
            if (content.length === 0) {
                needsHeader = true;
            }
        }
        if (needsHeader) {
            fs.writeFileSync(USERS_CSV_PATH, USERS_CSV_HEADERS + '\n');
            console.log("Created users.csv with headers.");
        }

        const escapeField = (field) => {
            const str = String(field || '');
            return str.includes(',') ? `"${str}"` : str;
        };

        const row = [
            escapeField(email),
            escapeField(firstName),
            escapeField(lastName),
            escapeField(description),
            escapeField(inboxFee),
            escapeField(DEFAULT_BEACON),
            escapeField(BACKUP_BEACON)
        ].join(',') + '\n';

        fs.appendFileSync(USERS_CSV_PATH, row);
        console.log(`Registered user: ${firstName} ${lastName} (${email}) -> users.csv`);
    } catch (err) {
        console.error("Failed to register user:", err.message);
    }
}

function logSoldCoin(firstName, lastName, lockerKey, email) {
    try {
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').replace('Z', '').slice(0, -4);
        const logEntry = `${timestamp},${lastName},${firstName},${lockerKey},${email}\n`;
        fs.appendFileSync(path.join(__dirname, 'SoldCoins.txt'), logEntry);
        console.log(`Logged transaction to SoldCoins.txt`);
    } catch (err) {
        console.error("Failed to write to SoldCoins.txt:", err.message);
    }
}

// --- 4b. Preconfigured Wallet Zips ---
// Pools of uploaded zips live in qmail_preconfigured_wallets/{bit,byte,kilo,mega,giga}.
// On purchase one zip is moved to issued/ (so it can never be handed to a second
// buyer) and recorded in issued_wallets.json. The buyer downloads it through
// /api/download-wallet/<file>; after WALLET_MAX_DOWNLOADS downloads the zip is deleted.

const WALLETS_BASE = '/var/www/distributedmailsystem.com/qmail_preconfigured_wallets';
const WALLETS_ISSUED_DIR = path.join(WALLETS_BASE, 'issued');
const WALLET_REGISTRY_PATH = path.join(__dirname, 'issued_wallets.json');
const WALLET_WARNINGS_PATH = path.join(__dirname, 'wallet_stock_warnings.json');
const WALLET_MAX_DOWNLOADS = 5;
const WALLET_LOW_STOCK_THRESHOLD = 3;              // warn when a tier has this many zips or fewer
const WALLET_WARNING_EMAIL = 'sean@raidatech.com';
const WALLET_WARNING_INTERVAL_MS = 24 * 60 * 60 * 1000;  // at most one warning per tier per day

// Authenticated SMTP via zeus (mailcow), credentials in .env.
// The mail server only accepts an envelope sender owned by the login
// (sean@raidatech.com), so that is the envelope; the visible From header
// is SMTP_FROM (noreply@cloudcoin.com) per sysadmin instructions.
// Falls back to the local MTA if SMTP fails, so warnings are never lost.
const nodemailer = require('nodemailer');

function sendEmailViaSendmail(to, subject, body) {
    try {
        const message =
            `To: ${to}\r\n` +
            `From: QMail Wallet Stock <noreply@cloudcoin.org>\r\n` +
            `Subject: ${subject}\r\n` +
            `Content-Type: text/plain; charset=UTF-8\r\n` +
            `\r\n` +
            body + `\r\n`;
        const proc = spawn('/usr/sbin/sendmail', ['-t', '-f', 'noreply@cloudcoin.org']);
        proc.on('error', err => console.error('sendmail spawn failed:', err.message));
        proc.on('close', code => {
            if (code === 0) console.log(`Email sent to ${to} via sendmail fallback: ${subject}`);
            else console.error(`sendmail exited with code ${code} for: ${subject}`);
        });
        proc.stdin.write(message);
        proc.stdin.end();
    } catch (err) {
        console.error('Failed to send email via sendmail:', err.message);
    }
}

function sendEmail(to, subject, body) {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        console.warn('SMTP not configured - using local sendmail.');
        return sendEmailViaSendmail(to, subject, body);
    }

    const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,           // port 587 uses STARTTLS
        requireTLS: true,
        auth: { user, pass }
    });

    transporter.sendMail({
        from: `"QMail Wallet Stock" <${process.env.SMTP_FROM || user}>`,
        sender: user,            // envelope sender must be the authenticated user
        envelope: { from: user, to: to },
        to: to,
        subject: subject,
        text: body
    }, (err, info) => {
        if (err) {
            console.error(`SMTP send failed (${err.message}) - falling back to sendmail.`);
            sendEmailViaSendmail(to, subject, body);
        } else {
            console.log(`Email sent to ${to} via SMTP: ${subject} (${info.response})`);
        }
    });
}

function loadWalletRegistry() {
    try {
        return JSON.parse(fs.readFileSync(WALLET_REGISTRY_PATH, 'utf8'));
    } catch {
        return [];
    }
}

function saveWalletRegistry(registry) {
    fs.writeFileSync(WALLET_REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

function countAvailableWallets(className) {
    try {
        return fs.readdirSync(path.join(WALLETS_BASE, className))
            .filter(f => f.toLowerCase().endsWith('.zip')).length;
    } catch {
        return 0;
    }
}

// Emails a low-stock / out-of-stock warning, at most once per tier per day
function checkWalletStock(className) {
    const remaining = countAvailableWallets(className);
    if (remaining > WALLET_LOW_STOCK_THRESHOLD) return;

    let warnings = {};
    try { warnings = JSON.parse(fs.readFileSync(WALLET_WARNINGS_PATH, 'utf8')); } catch {}
    const lastWarned = warnings[className] || 0;
    if (Date.now() - lastWarned < WALLET_WARNING_INTERVAL_MS) return;

    warnings[className] = Date.now();
    try { fs.writeFileSync(WALLET_WARNINGS_PATH, JSON.stringify(warnings, null, 2)); }
    catch (err) { console.error('Failed to save warning state:', err.message); }

    const subject = remaining === 0
        ? `URGENT: qmail "${className}" wallet zips are OUT OF STOCK`
        : `Warning: qmail "${className}" wallet zips running low (${remaining} left)`;

    const counts = ['bit', 'byte', 'kilo', 'mega', 'giga']
        .map(c => `  ${c}: ${countAvailableWallets(c)}`).join('\n');

    const body =
        `The preconfigured wallet zip pool for the "${className}" tier is ${remaining === 0 ? 'EMPTY' : 'running low'}.\n\n` +
        `Remaining zips per tier:\n${counts}\n\n` +
        `Upload more zip files to:\n${WALLETS_BASE}/${className}/\n\n` +
        (remaining === 0 ? `Buyers of this tier are currently NOT receiving a wallet download link.\n\n` : '') +
        `Sent by distributedmailsystem.com server (${new Date().toISOString()})`;

    sendEmail(WALLET_WARNING_EMAIL, subject, body);
}

// Wallet zip filenames must encode the serial number of the mailbox coin
// inside (Client_Data/Wallets/Mail/Bank). Two accepted formats:
//   <dotted-serial>@<tier>.<random>.zip   e.g. 1.19.192@bit.o39v88rv.zip
//       (native QMail export naming; dotted groups are the serial bytes)
//   wallet_<serial>_<random>.zip          e.g. wallet_9501695_9f3a1c84.zip
// The QMail address is derived from that serial. Returns the serial as an
// integer, or null if the filename matches neither convention.
function parseWalletSerial(filename) {
    let m = /^wallet_(\d+)_[^_]+\.zip$/i.exec(filename);
    if (m) {
        const serial = parseInt(m[1], 10);
        return Number.isSafeInteger(serial) && serial > 0 ? serial : null;
    }

    m = /^(\d+(?:\.\d+)*)@[a-z]+\.[^.]+\.zip$/i.exec(filename);
    if (m) {
        const bytes = m[1].split('.').map(Number);
        if (bytes.length > 6 || bytes.some(b => !Number.isInteger(b) || b > 255)) return null;
        let serial = 0;
        for (const b of bytes) serial = serial * 256 + b;
        return Number.isSafeInteger(serial) && serial > 0 ? serial : null;
    }

    return null;
}

// Picks a random zip from the tier pool, moves it to issued/, records the buyer.
// Returns { url, file, serial }, or null if the pool is empty.
function assignWallet(className, buyerInfo) {
    const poolDir = path.join(WALLETS_BASE, className);
    let zips = [];
    try {
        zips = fs.readdirSync(poolDir).filter(f => f.toLowerCase().endsWith('.zip'));
    } catch (err) {
        console.error(`Cannot read wallet pool ${poolDir}:`, err.message);
    }

    if (zips.length === 0) {
        console.error(`No wallet zips available for tier "${className}"!`);
        checkWalletStock(className);
        return null;
    }

    const file = zips[Math.floor(Math.random() * zips.length)];

    try {
        if (!fs.existsSync(WALLETS_ISSUED_DIR)) fs.mkdirSync(WALLETS_ISSUED_DIR, { recursive: true });

        // Guard against a name collision with an already-issued file
        let issuedName = file;
        if (fs.existsSync(path.join(WALLETS_ISSUED_DIR, issuedName))) {
            issuedName = `${Date.now()}_${file}`;
        }

        fs.renameSync(path.join(poolDir, file), path.join(WALLETS_ISSUED_DIR, issuedName));

        const registry = loadWalletRegistry();
        registry.push({
            file: issuedName,
            class: className,
            buyer: buyerInfo.name || '',
            qmail: buyerInfo.qmail || '',
            issuedAt: new Date().toISOString(),
            downloads: 0,
            maxDownloads: WALLET_MAX_DOWNLOADS,
            deleted: false
        });
        saveWalletRegistry(registry);

        checkWalletStock(className);

        console.log(`Assigned wallet zip ${issuedName} (${className}) to ${buyerInfo.name}`);
        return {
            url: `/api/download-wallet/${encodeURIComponent(issuedName)}`,
            file: issuedName,
            serial: parseWalletSerial(file)
        };
    } catch (err) {
        console.error('Failed to assign wallet zip:', err.message);
        return null;
    }
}

// Backfills the buyer's qmail address on a registry entry once it is known
function updateWalletRegistryQmail(file, qmail) {
    try {
        const registry = loadWalletRegistry();
        const entry = registry.find(e => e.file === file);
        if (entry) {
            entry.qmail = qmail;
            saveWalletRegistry(registry);
        }
    } catch (err) {
        console.error('Failed to update wallet registry qmail:', err.message);
    }
}

// --- 4c. Server-Side PayPal Payment Verification ---
// The browser can lie; PayPal cannot. Before releasing a wallet zip we ask
// PayPal's API whether the order ID the browser sent was actually captured,
// and for how much. Requires PAYPAL_CLIENT_SECRET_LIVE / _SANDBOX in .env.
// While no secret is configured, verification is SKIPPED (logged loudly) so
// the store keeps working until the secret is added.

const REDEEMED_ORDERS_PATH = path.join(__dirname, 'redeemed_orders.json');

function paypalEnv() {
    // Same source of truth as /api/paypal-config
    const { sandboxMode } = readPaymentConfig();
    const suffix = sandboxMode ? 'SANDBOX' : 'LIVE';
    return {
        base: sandboxMode ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com',
        clientId: process.env[`PAYPAL_CLIENT_ID_${suffix}`] || '',
        secret: process.env[`PAYPAL_CLIENT_SECRET_${suffix}`] || ''
    };
}

// Each PayPal order may be redeemed once per purpose ('mailbox' or
// 'cloudcoins' - one payment on the influencer page legitimately covers both)
function isOrderRedeemed(orderID, purpose) {
    try {
        const redeemed = JSON.parse(fs.readFileSync(REDEEMED_ORDERS_PATH, 'utf8'));
        return !!redeemed[`${orderID}:${purpose}`];
    } catch {
        return false;
    }
}

function markOrderRedeemed(orderID, purpose) {
    let redeemed = {};
    try { redeemed = JSON.parse(fs.readFileSync(REDEEMED_ORDERS_PATH, 'utf8')); } catch {}
    redeemed[`${orderID}:${purpose}`] = new Date().toISOString();
    fs.writeFileSync(REDEEMED_ORDERS_PATH, JSON.stringify(redeemed, null, 2));
}

// Asks PayPal whether the order was captured. Returns:
//   { verified: true,  total: <captured USD> }
//   { verified: false, reason: <why> }
async function verifyPayPalOrder(orderID) {
    const env = paypalEnv();

    try {
        // OAuth token via client credentials
        const tokenResp = await axios.post(
            `${env.base}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                auth: { username: env.clientId, password: env.secret },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 20000
            }
        );
        const accessToken = tokenResp.data.access_token;

        // Look the order up
        const orderResp = await axios.get(
            `${env.base}/v2/checkout/orders/${encodeURIComponent(orderID)}`,
            { headers: { Authorization: `Bearer ${accessToken}` }, timeout: 20000 }
        );
        const order = orderResp.data;

        if (order.status !== 'COMPLETED') {
            return { verified: false, reason: `order status is ${order.status}, not COMPLETED` };
        }

        // Sum the captured USD amounts
        let total = 0;
        for (const unit of order.purchase_units || []) {
            for (const cap of (unit.payments && unit.payments.captures) || []) {
                if (cap.status === 'COMPLETED' && cap.amount && cap.amount.currency_code === 'USD') {
                    total += parseFloat(cap.amount.value);
                }
            }
        }

        if (total <= 0) {
            return { verified: false, reason: 'no completed USD captures on this order' };
        }

        return { verified: true, total };
    } catch (err) {
        const status = err.response ? err.response.status : null;
        if (status === 404) return { verified: false, reason: 'order not found at PayPal' };
        if (status === 401) return { verified: false, reason: 'PayPal API credentials rejected (check client secret)' };
        return { verified: false, reason: `PayPal API error: ${err.message}` };
    }
}

// Shared guard used by the purchase endpoints. Returns null when the
// purchase may proceed, or an { httpCode, error } object to reject with.
async function requireVerifiedPayment(paypalOrderID, minAmount, purpose) {
    const env = paypalEnv();

    if (!env.secret) {
        console.warn(`PayPal verification SKIPPED (${purpose}) - no client secret in .env yet!`);
        return null;
    }

    if (!paypalOrderID) {
        return { httpCode: 402, error: 'Missing PayPal order ID - payment could not be verified.' };
    }
    if (isOrderRedeemed(paypalOrderID, purpose)) {
        console.warn(`REPLAY BLOCKED: order ${paypalOrderID} already redeemed for ${purpose}`);
        return { httpCode: 402, error: 'This payment has already been used.' };
    }

    const v = await verifyPayPalOrder(paypalOrderID);
    if (!v.verified) {
        console.warn(`PAYMENT REJECTED (${purpose}): order ${paypalOrderID} - ${v.reason}`);
        return { httpCode: 402, error: `PayPal did not confirm this payment (${v.reason}).` };
    }
    if (v.total + 0.001 < minAmount) {
        console.warn(`AMOUNT MISMATCH (${purpose}): order ${paypalOrderID} paid $${v.total}, claimed $${minAmount}`);
        return { httpCode: 402, error: 'The amount paid does not match this purchase.' };
    }

    markOrderRedeemed(paypalOrderID, purpose);
    console.log(`Payment verified with PayPal: order ${paypalOrderID}, $${v.total} (${purpose})`);
    return null;
}

// --- 5. Main API Endpoint (Updated for Core C API) ---

app.post('/api/generate-mailbox', async (req, res) => {
    if (!readPaymentConfig().paymentsEnabled) {
        return res.status(503).json({ success: false, error: "Payments are temporarily disabled - coming soon." });
    }

    const { firstName, lastName, amountPaid, inboxFee, description, paypalOrderID } = req.body;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`>>> Processing Registration: ${firstName} ${lastName}`);
    console.log(`    Amount: $${amountPaid}, InboxFee: $${inboxFee || 0}, Order: ${paypalOrderID || 'none'}`);
    console.log("=".repeat(60));

    // Step 1: Validate amount and get mapping
    const mapping = AMOUNT_MAPPING[amountPaid];
    if (!mapping) {
        return res.status(400).json({ success: false, error: "Invalid amount paid." });
    }

    // Step 1b: Confirm with PayPal that this payment really happened
    const rejection = await requireVerifiedPayment(paypalOrderID, amountPaid, 'mailbox');
    if (rejection) {
        return res.status(rejection.httpCode).json({ success: false, error: rejection.error });
    }

    try {
        const amountClass = mapping.class;

        // Step 2: Assign a preconfigured wallet zip - this IS the deliverable.
        // (Lockers are no longer used; the coin ships inside the zip.)
        const wallet = assignWallet(amountClass, {
            name: `${firstName} ${lastName}`,
            qmail: ''
        });

        if (!wallet) {
            console.error(`SALE WITHOUT DELIVERY: no ${amountClass} zips for ${firstName} ${lastName}`);
            return res.status(503).json({
                success: false,
                error: "This tier is temporarily sold out. Your payment was received - " +
                       "please contact support and we will deliver your wallet promptly."
            });
        }

        // Step 3: Derive the QMail address from the serial number encoded in
        // the zip filename (wallet_<serial>_<random>.zip). If a zip was
        // uploaded without the convention, fall back to a random serial so
        // the buyer still gets a working address.
        let serialNumber = wallet.serial;
        if (!serialNumber) {
            serialNumber = crypto.randomInt(1, 0xFFFFFF);
            console.error(`Zip ${wallet.file} has no serial in its filename - ` +
                          `using random serial ${serialNumber}. Fix the zip naming!`);
        }

        // Step 4: The address is the zip's own canonical name (dotted-serial
        // @tier, minus the random suffix); computed from the serial when the
        // zip uses the legacy wallet_ naming.
        const addrFromFile = /^(.+@[a-z]+)\.[^.]+\.zip$/i.exec(wallet.file);
        const email = addrFromFile ? addrFromFile[1] : canonicalAddress(serialNumber, amountClass);

        // Step 5: Database Logging
        registerUser(email, firstName, lastName, description || "", inboxFee || 0);
        logSoldCoin(firstName, lastName, wallet.file, email);
        updateWalletRegistryQmail(wallet.file, email);

        console.log(`Registration Complete: ${email} (zip: ${wallet.file}, serial: ${serialNumber})`);

        res.json({
            success: true,
            email: email,
            walletDownloadUrl: wallet.url
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({
            success: false,
            error: `Registration error: ${error.message}`
        });
    }
});

// --- 5a. Wallet Stock Endpoint ---
// Lets the client grey out sold-out tiers BEFORE the buyer pays
app.get('/api/wallet-stock', (req, res) => {
    const stock = {};
    ['bit', 'byte', 'kilo', 'mega', 'giga'].forEach(c => {
        stock[c] = countAvailableWallets(c);
    });
    res.json(stock);
});

// --- 5b. Make User Anonymous ---
// Removes FirstName and LastName from users.csv for the given email address
app.post('/api/make-anonymous', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    try {
        if (!fs.existsSync(USERS_CSV_PATH)) {
            return res.status(404).json({ success: false, error: 'Users file not found.' });
        }

        const content = fs.readFileSync(USERS_CSV_PATH, 'utf8');
        const lines = content.split('\n');
        let found = false;

        const updated = lines.map((line, i) => {
            if (i === 0) return line; // keep header
            if (!line.trim()) return line; // keep empty lines
            const cols = line.split(',');
            if (cols[0] === email || cols[0] === `"${email}"`) {
                found = true;
                cols[1] = ''; // FirstName
                cols[2] = ''; // LastName
                return cols.join(',');
            }
            return line;
        });

        if (!found) {
            return res.status(404).json({ success: false, error: 'Email not found in records.' });
        }

        fs.writeFileSync(USERS_CSV_PATH, updated.join('\n'));
        console.log(`Made anonymous: ${email}`);
        res.json({ success: true });
    } catch (err) {
        console.error("Failed to make anonymous:", err.message);
        res.status(500).json({ success: false, error: 'Failed to update records.' });
    }
});

// --- 6. Influencer Registration Endpoint ---
// Accepts: fullName, qmailAddress, paypalEmail, alternativePayment, paypalVerified
// fullName + qmailAddress come from PayPal-verified registration flow.
// paypalEmail is either auto-filled from PayPal (paypalVerified=true) or manually entered.
// Returns a signed token that gets embedded in the influencer's link for anti-spoofing.
app.post('/api/register-influencer', (req, res) => {
    const { fullName, qmailAddress, paypalEmail, alternativePayment, paypalVerified } = req.body;

    if (!fullName || !qmailAddress || !paypalEmail) {
        return res.status(400).json({ success: false, error: 'fullName, qmailAddress, and paypalEmail are required.' });
    }

    const csvPath = '/var/www/distributedmailsystem.com/influencer_payments.csv';
    const headers = 'Timestamp,FullName,QMailAddress,PayPalEmail,PayPalVerified,Token,AlternativePayment';

    try {
        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, headers + '\n');
        }

        // Generate unique token for this influencer
        const token = generateInfluencerToken(qmailAddress, fullName);

        const escapeField = (field) => {
            const str = String(field || '').replace(/"/g, '""');
            return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        };

        const timestamp = new Date().toISOString();
        const row = [
            escapeField(timestamp),
            escapeField(fullName),
            escapeField(qmailAddress),
            escapeField(paypalEmail),
            escapeField(paypalVerified ? 'YES' : 'NO'),
            escapeField(token),
            escapeField(alternativePayment || '')
        ].join(',') + '\n';

        fs.appendFileSync(csvPath, row);
        console.log(`Influencer registered: ${fullName} | ${qmailAddress} | PayPal: ${paypalEmail} | Verified: ${paypalVerified ? 'YES' : 'NO'} | Token: ${token}`);

        // Return token to frontend — it gets embedded in influencer's shareable link
        res.json({ success: true, message: 'Registration successful', token });
    } catch (err) {
        console.error("Failed to register influencer:", err.message);
        res.status(500).json({ success: false, error: 'Failed to save registration.' });
    }
});

// --- 7. Influencer Link Verification Endpoint ---
// Called by /access page on load to confirm the link is genuine
// GET /api/verify-influencer?token=abc123&addr=John.Doe@CEO#123.Giga
app.get('/api/verify-influencer', (req, res) => {
    const { token, addr } = req.query;

    if (!token || !addr) {
        return res.status(400).json({ verified: false, reason: 'Missing token or addr parameter.' });
    }

    const csvPath = '/var/www/distributedmailsystem.com/influencer_payments.csv';

    try {
        if (!fs.existsSync(csvPath)) {
            return res.json({ verified: false, reason: 'No influencers registered yet.' });
        }

        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.trim().split('\n').slice(1); // skip header

        // Find matching row: token AND qmail must both match
        const match = lines.find(line => {
            const cols = line.split(',');
            // cols: Timestamp, FullName, QMailAddress, PayPalEmail, PayPalVerified, Token, AlternativePayment
            const rowQmail = cols[2]?.replace(/"/g, '').trim();
            const rowToken = cols[5]?.replace(/"/g, '').trim();
            return rowToken === token && rowQmail === decodeURIComponent(addr);
        });

        if (match) {
            const cols = match.split(',');
            const fullName = cols[1]?.replace(/"/g, '').trim();
            console.log(`Token verified for: ${fullName} | ${addr}`);
            res.json({ verified: true, fullName });
        } else {
            console.warn(`Token verification FAILED — token: ${token} | addr: ${addr}`);
            res.json({ verified: false, reason: 'Token does not match any registered influencer.' });
        }
    } catch (err) {
        console.error("Verification error:", err.message);
        res.status(500).json({ verified: false, reason: 'Server error during verification.' });
    }
});

// --- 8. Affiliate Sale Logging Endpoint ---
// Called by VerifiedAccess.jsx after successful payment
app.post('/api/log-affiliate-sale', (req, res) => {
    const {
        influencerName, influencerAddress, influencerInboxFee,
        buyerFirstName, buyerLastName, buyerEmail,
        paymentAmount, cloudCoinsPurchased,
        createdEmailAddress, emailAddressCreated
    } = req.body;

    if (!influencerName || !buyerFirstName || !paymentAmount) {
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    const csvPath = path.join(__dirname, 'affiliate_sales.csv');
    const headers = 'Timestamp,InfluencerName,InfluencerAddress,InfluencerInboxFee,BuyerFirstName,BuyerLastName,BuyerEmail,PaymentAmount,CloudCoinsPurchased,CreatedEmailAddress,EmailAddressCreated';

    try {
        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, headers + '\n');
        }

        const escapeField = (field) => {
            const str = String(field || '').replace(/"/g, '""');
            return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        };

        const timestamp = new Date().toISOString();
        const row = [
            escapeField(timestamp),
            escapeField(influencerName),
            escapeField(influencerAddress),
            escapeField(influencerInboxFee),
            escapeField(buyerFirstName),
            escapeField(buyerLastName),
            escapeField(buyerEmail),
            escapeField(paymentAmount),
            escapeField(cloudCoinsPurchased),
            escapeField(createdEmailAddress),
            escapeField(emailAddressCreated)
        ].join(',') + '\n';

        fs.appendFileSync(csvPath, row);
        console.log(`Affiliate sale logged: ${buyerFirstName} ${buyerLastName} -> ${influencerName} ($${paymentAmount})`);

        res.json({ success: true });
    } catch (err) {
        console.error("Failed to log affiliate sale:", err.message);
        res.status(500).json({ success: false, error: 'Failed to log sale.' });
    }
});

// --- 9. CloudCoins Locker Generation Endpoint ---
// Called by VerifiedAccess.jsx after payment to generate a CloudCoins locker for the buyer
app.post('/api/generate-cloudcoins-locker', async (req, res) => {
    if (!readPaymentConfig().paymentsEnabled) {
        return res.status(503).json({ success: false, error: "Payments are temporarily disabled - coming soon." });
    }

    const { dollarAmount, firstName, lastName, paypalOrderID } = req.body;

    if (!dollarAmount || !firstName) {
        return res.status(400).json({ success: false, error: 'dollarAmount and firstName are required.' });
    }

    // Confirm with PayPal that this payment really happened
    const rejection = await requireVerifiedPayment(paypalOrderID, dollarAmount, 'cloudcoins');
    if (rejection) {
        return res.status(rejection.httpCode).json({ success: false, error: rejection.error });
    }

    console.log(`\n>>> Generating CloudCoins locker: ${firstName} ${lastName} — $${dollarAmount}`);

    // Generate locker key
    const genBase32Char = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const lockerKey = `${genBase32Char()}${genBase32Char()}${genBase32Char()}-${genBase32Char()}${genBase32Char()}${genBase32Char()}${genBase32Char()}`;

    // CloudCoins = dollarAmount * 10
    const cloudCoins = dollarAmount * 10;

    // Determine denomination: use the largest denomination that fits the amount
    const denominations = [
        { threshold: 1000, coinDenomination: 10000 },
        { threshold: 100,  coinDenomination: 1000 },
        { threshold: 50,   coinDenomination: 100 },
        { threshold: 20,   coinDenomination: 10 },
        { threshold: 10,   coinDenomination: 1 },
    ];
    const bestDenom = denominations.find(d => dollarAmount >= d.threshold) || { coinDenomination: 1 };

    try {
        const coreResponse = await axios.get(
            `http://localhost:8080/api/transactions/locker/put-one-coin?locker_key=${lockerKey}&denomination=${bestDenom.coinDenomination}`,
            { timeout: 30000 }
        );

        const data = coreResponse.data;

        if (data.status === "success") {
            console.log(`CloudCoins locker created: ${lockerKey} — ${cloudCoins} CC`);
            res.json({
                success: true,
                cloudCoins,
                cloudCoinsLockerCode: lockerKey
            });
        } else {
            console.error("Core API error for cloudcoins locker:", data.message);
            res.status(500).json({ success: false, error: data.message || 'Core service error.' });
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error("Core API not running for cloudcoins locker");
            res.status(503).json({ success: false, error: 'CloudCoin Core service not available.' });
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.error("Core API timed out for cloudcoins locker");
            res.status(504).json({ success: false, error: 'CloudCoin Core service timed out.' });
        } else {
            console.error("Core API error:", error.message);
            res.status(500).json({ success: false, error: `Core service error: ${error.message}` });
        }
    }
});

// --- 10. Analytics Event Tracking Endpoint ---
// Receives funnel events from the client and logs them to analytics_events.csv
app.post('/api/track', (req, res) => {
    const { event, props } = req.body;

    if (!event) {
        return res.status(400).json({ success: false, error: 'Event name is required.' });
    }

    const csvPath = path.join(__dirname, 'analytics_events.csv');
    const headers = 'Timestamp,Event,Props';

    try {
        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, headers + '\n');
        }

        const escapeField = (field) => {
            const str = String(field || '').replace(/"/g, '""');
            return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        };

        const timestamp = new Date().toISOString();
        const propsJson = JSON.stringify(props || {});
        const row = [
            escapeField(timestamp),
            escapeField(event),
            escapeField(propsJson)
        ].join(',') + '\n';

        fs.appendFileSync(csvPath, row);
        res.json({ success: true });
    } catch (err) {
        console.error("Failed to log analytics event:", err.message);
        res.status(500).json({ success: false, error: 'Failed to log event.' });
    }
});

// --- 11. Analytics Dashboard Data Endpoint ---
// Returns aggregated stats from all data files for the admin dashboard
app.get('/api/admin/stats', (req, res) => {
    const password = req.query.key;
    const adminKey = process.env.ADMIN_KEY;

    // Fail closed: no ADMIN_KEY in .env means nobody gets in. Never add a
    // fallback value here - anything written in this file ends up on GitHub.
    if (!adminKey) {
        console.error('ADMIN_KEY is not set in .env - admin stats endpoint is disabled.');
        return res.status(503).json({ error: 'Admin access is not configured on this server.' });
    }

    if (password !== adminKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // --- Read SoldCoins.txt ---
        const soldCoinsPath = path.join(__dirname, 'SoldCoins.txt');
        let soldCoins = [];
        if (fs.existsSync(soldCoinsPath)) {
            soldCoins = fs.readFileSync(soldCoinsPath, 'utf8').trim().split('\n').filter(Boolean).map(line => {
                const cols = line.split(',');
                return { timestamp: cols[0], lastName: cols[1], firstName: cols[2], lockerKey: cols[3], email: cols[4] };
            });
        }

        // --- Read affiliate_sales.csv ---
        const affiliatePath = path.join(__dirname, 'affiliate_sales.csv');
        let affiliateSales = [];
        if (fs.existsSync(affiliatePath)) {
            const lines = fs.readFileSync(affiliatePath, 'utf8').trim().split('\n').slice(1).filter(Boolean);
            affiliateSales = lines.map(line => {
                const cols = line.split(',');
                return {
                    timestamp: cols[0]?.replace(/"/g, ''),
                    influencerName: cols[1]?.replace(/"/g, ''),
                    influencerAddress: cols[2]?.replace(/"/g, ''),
                    inboxFee: parseFloat(cols[3]?.replace(/"/g, '') || 0),
                    buyerFirstName: cols[4]?.replace(/"/g, ''),
                    buyerLastName: cols[5]?.replace(/"/g, ''),
                    paymentAmount: parseFloat(cols[7]?.replace(/"/g, '') || 0),
                };
            });
        }

        // --- Read influencer_payments.csv ---
        const influencerPath = '/var/www/distributedmailsystem.com/influencer_payments.csv';
        let influencers = [];
        if (fs.existsSync(influencerPath)) {
            const lines = fs.readFileSync(influencerPath, 'utf8').trim().split('\n').slice(1).filter(Boolean);
            influencers = lines.map(line => {
                const cols = line.split(',');
                return {
                    timestamp: cols[0]?.replace(/"/g, ''),
                    fullName: cols[1]?.replace(/"/g, ''),
                    qmailAddress: cols[2]?.replace(/"/g, ''),
                };
            });
        }

        // --- Read users.csv ---
        const usersPath = USERS_CSV_PATH;
        let users = [];
        if (fs.existsSync(usersPath)) {
            const lines = fs.readFileSync(usersPath, 'utf8').trim().split('\n').slice(1).filter(Boolean);
            users = lines.map(line => {
                const cols = line.split(',');
                return {
                    email: cols[0]?.replace(/"/g, ''),
                    firstName: cols[1]?.replace(/"/g, ''),
                    lastName: cols[2]?.replace(/"/g, ''),
                };
            });
        }

        // --- Read analytics_events.csv ---
        const eventsPath = path.join(__dirname, 'analytics_events.csv');
        let events = [];
        if (fs.existsSync(eventsPath)) {
            const lines = fs.readFileSync(eventsPath, 'utf8').trim().split('\n').slice(1).filter(Boolean);
            events = lines.map(line => {
                // Parse carefully — Props field contains JSON with commas
                const firstComma = line.indexOf(',');
                const secondComma = line.indexOf(',', firstComma + 1);
                return {
                    timestamp: line.substring(0, firstComma).replace(/"/g, ''),
                    event: line.substring(firstComma + 1, secondComma).replace(/"/g, ''),
                    props: line.substring(secondComma + 1).replace(/^"|"$/g, '').replace(/""/g, '"'),
                };
            });
        }

        // --- Aggregate stats ---
        const totalRevenue = affiliateSales.reduce((sum, s) => sum + s.paymentAmount, 0);
        const totalSales = affiliateSales.length;
        const avgOrderValue = totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0;

        // Revenue by influencer
        const revenueByInfluencer = {};
        affiliateSales.forEach(sale => {
            const name = sale.influencerName || 'Unknown';
            if (!revenueByInfluencer[name]) {
                revenueByInfluencer[name] = { sales: 0, revenue: 0 };
            }
            revenueByInfluencer[name].sales++;
            revenueByInfluencer[name].revenue += sale.paymentAmount;
        });

        // Funnel events summary
        const eventCounts = {};
        events.forEach(e => {
            eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
        });

        // Recent activity (last 20 events)
        const recentEvents = events.slice(-20).reverse();

        // Recent sales (last 10)
        const recentSales = affiliateSales.slice(-10).reverse();

        res.json({
            overview: {
                totalRevenue,
                totalSales,
                avgOrderValue: parseFloat(avgOrderValue),
                totalUsers: users.length,
                totalInfluencers: influencers.length,
                totalRegistrations: soldCoins.length,
            },
            revenueByInfluencer,
            eventCounts,
            recentEvents,
            recentSales,
            influencers,
        });
    } catch (err) {
        console.error("Failed to generate stats:", err.message);
        res.status(500).json({ error: 'Failed to generate stats.' });
    }
});

// --- 12. Public Social Proof Stats ---
// Returns non-sensitive aggregate stats for social proof on VerifiedAccess
app.get('/api/social-proof', (req, res) => {
    try {
        const soldCoinsPath = path.join(__dirname, 'SoldCoins.txt');
        let totalPurchases = 0;
        if (fs.existsSync(soldCoinsPath)) {
            totalPurchases = fs.readFileSync(soldCoinsPath, 'utf8').trim().split('\n').filter(Boolean).length;
        }

        const affiliatePath = path.join(__dirname, 'affiliate_sales.csv');
        let recentSales = 0;
        if (fs.existsSync(affiliatePath)) {
            const lines = fs.readFileSync(affiliatePath, 'utf8').trim().split('\n').slice(1).filter(Boolean);
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            recentSales = lines.filter(line => {
                const timestamp = line.split(',')[0]?.replace(/"/g, '');
                return new Date(timestamp) > oneWeekAgo;
            }).length;
        }

        res.json({ totalPurchases, recentSales });
    } catch {
        res.json({ totalPurchases: 0, recentSales: 0 });
    }
});

// --- 12b. Preconfigured Wallet Download Endpoint ---
// Single-use zips: only files recorded in issued_wallets.json can be fetched,
// each up to WALLET_MAX_DOWNLOADS times; the file is deleted after the last one.
app.get('/api/download-wallet/:file', (req, res) => {
    const file = path.basename(req.params.file);
    if (!file.toLowerCase().endsWith('.zip')) {
        return res.status(400).send('Invalid file.');
    }

    const registry = loadWalletRegistry();
    const entry = registry.find(e => e.file === file);

    if (!entry || entry.deleted) {
        return res.status(404).send('This download link is no longer available.');
    }
    if (entry.downloads >= entry.maxDownloads) {
        return res.status(410).send('Download limit reached. Contact support if you need your wallet again.');
    }

    const filePath = path.join(WALLETS_ISSUED_DIR, file);
    if (!fs.existsSync(filePath)) {
        entry.deleted = true;
        saveWalletRegistry(registry);
        return res.status(404).send('File not found.');
    }

    // The buyer's copy is named after their QMail address: the zip's own
    // name minus the random URL-guessing suffix, e.g.
    // 39.233@bit.038amd22.zip is downloaded as 39.233@bit.zip
    const addrMatch = /^(.+@[a-z]+)\.[^.]+\.zip$/i.exec(entry.file);
    const downloadName = addrMatch ? `${addrMatch[1]}.zip` : `qmail_wallet_${entry.class}.zip`;

    res.download(filePath, downloadName, (err) => {
        // Nothing in this callback may throw - an uncaught exception here
        // would take down the whole server.
        try {
            if (err) {
                // Transfer failed or was aborted - do not count it against the limit
                console.error(`Wallet download failed for ${file}:`, err.message);
                return;
            }

            // Re-read the registry to avoid clobbering concurrent updates
            const reg = loadWalletRegistry();
            const e = reg.find(x => x.file === file);
            if (!e) return;

            e.downloads += 1;
            console.log(`Wallet ${file} downloaded (${e.downloads}/${e.maxDownloads})`);

            if (e.downloads >= e.maxDownloads) {
                try {
                    fs.unlinkSync(filePath);
                    e.deleted = true;
                    console.log(`Deleted wallet zip ${file} after ${e.downloads} downloads`);
                } catch (delErr) {
                    console.error(`Failed to delete ${file}:`, delErr.message);
                }
            }
            saveWalletRegistry(reg);
        } catch (bookErr) {
            console.error(`Failed to record download of ${file}:`, bookErr.message);
        }
    });
});

// --- 13. Static Routes ---
app.use('/downloads', express.static('/var/www/distributedmailsystem.com/downloads'));
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/^\/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- 9. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Core API expected at: http://localhost:8080`);
    console.log(`========================================`);
});