require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const fulfillment = require('./fulfillment');
const subscriptions = require('./subscriptions');
const { withLock } = require('./locks');

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
const OWNER_EMAIL = 'sean@raidatech.com';
const WALLET_WARNING_INTERVAL_MS = 24 * 60 * 60 * 1000;  // at most one warning per tier per day

// Authenticated SMTP via zeus (mailcow), credentials in .env.
// The mail server only accepts an envelope sender owned by the login
// (sean@raidatech.com), so that is the envelope; the visible From header
// is SMTP_FROM (support@cloudcoin.com) per sysadmin instructions.
// Falls back to the local MTA if SMTP fails, so warnings are never lost.
const nodemailer = require('nodemailer');

function sendEmailViaSendmail(to, subject, body) {
    try {
        const message =
            `To: ${to}\r\n` +
            `From: QMail Wallet Stock <support@cloudcoin.com>\r\n` +
            `Reply-To: sean@raidatech.com\r\n` +
            `Subject: ${subject}\r\n` +
            `Content-Type: text/plain; charset=UTF-8\r\n` +
            `\r\n` +
            body + `\r\n`;
        const proc = spawn('/usr/sbin/sendmail', ['-t', '-f', 'sean@raidatech.com']);
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
        replyTo: 'sean@raidatech.com',
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

// Locker-key inventory module needs the mailer for low-stock / low-balance alerts
fulfillment.init({ sendEmail });
subscriptions.init({ sendEmail, paypalEnv });

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

// Admin-managed data: influencer waitlist, bug-report dismissals, and the
// cross-site bug-report feed written by cloudcoin.org/bugs-submit.php.
const WAITLIST_PATH = path.join(__dirname, 'waitlist.json');
const BUG_DISMISSED_PATH = path.join(__dirname, 'bug_dismissed.json');
const BUG_REPORTS_PATH = '/var/www/cloudcoin.org/bug_reports.jsonl';

// Tiny JSON array store helpers (atomic write via temp+rename).
function loadJsonArray(file) {
    try { const v = JSON.parse(fs.readFileSync(file, 'utf8')); return Array.isArray(v) ? v : []; }
    catch { return []; }
}
function saveJsonArray(file, arr) {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(arr, null, 2));
    fs.renameSync(tmp, file);
}

// Admin gate for the management endpoints. Returns true when authorized;
// otherwise writes the response and returns false. Fail-closed like
// /api/admin/stats: no ADMIN_KEY in .env means nobody gets in.
function requireAdmin(req, res) {
    const adminKey = process.env.ADMIN_KEY;
    const provided = (req.body && req.body.key) || req.query.key;
    if (!adminKey) {
        res.status(503).json({ error: 'Admin access is not configured on this server.' });
        return false;
    }
    if (provided !== adminKey) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }
    return true;
}

// Reads stored bug reports (JSON-lines appended by cloudcoin.org's
// bugs-submit.php) minus any the admin has dismissed. Newest first.
function readBugReports() {
    let dismissed = [];
    try { dismissed = JSON.parse(fs.readFileSync(BUG_DISMISSED_PATH, 'utf8')); } catch { dismissed = []; }
    const dismissedSet = new Set(dismissed);
    let reports = [];
    try {
        const lines = fs.readFileSync(BUG_REPORTS_PATH, 'utf8').trim().split('\n').filter(Boolean);
        for (const line of lines) {
            try {
                const r = JSON.parse(line);
                if (r && r.id && !dismissedSet.has(r.id)) reports.push(r);
            } catch { /* skip malformed line */ }
        }
    } catch { /* file may not exist yet */ }
    return reports.reverse();
}

// Reads the influencer waitlist (newest first).
function readWaitlist() {
    return loadJsonArray(WAITLIST_PATH).slice().reverse();
}

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

// Rolls back a redemption when fulfillment delivered NOTHING, so a buyer who
// paid but got zero addresses (Core down, pools empty) can safely retry
// instead of being permanently replay-blocked.
function unmarkOrderRedeemed(orderID, purpose) {
    if (!orderID) return;
    let redeemed = {};
    try { redeemed = JSON.parse(fs.readFileSync(REDEEMED_ORDERS_PATH, 'utf8')); } catch {}
    if (redeemed[`${orderID}:${purpose}`]) {
        delete redeemed[`${orderID}:${purpose}`];
        fs.writeFileSync(REDEEMED_ORDERS_PATH, JSON.stringify(redeemed, null, 2));
        console.warn(`Rolled back redemption for order ${orderID} (${purpose}) - nothing delivered, buyer may retry.`);
    }
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

// --- 5aa. Multi-Address Order Fulfillment (locker-key delivery) ---
// The /register cart posts here after PayPal capture. Each unit consumes a
// pre-minted locker key (its coin's serial was recorded at mint time),
// derives the QMail address from that serial, and ships with its own
// 200 CC bonus locker. Pools are refilled in the background afterwards.
app.post('/api/fulfill-order', async (req, res) => {
    if (!readPaymentConfig().paymentsEnabled) {
        return res.status(503).json({ success: false, error: "Payments are temporarily disabled - coming soon." });
    }

    const { firstName, lastName, items, paypalOrderID, buyerEmail } = req.body;

    // Price the cart from server-side prices - the browser total is never trusted
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Cart is empty.' });
    }
    let totalUSD = 0, totalUnits = 0;
    for (const item of items) {
        const cls = fulfillment.CLASSES[item.class];
        const qty = parseInt(item.quantity, 10);
        if (!cls || !Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ success: false, error: 'Invalid cart item.' });
        }
        totalUSD += cls.priceUSD * qty;
        totalUnits += qty;
    }
    if (totalUnits > 20) {
        return res.status(400).json({ success: false, error: 'A single order is limited to 20 addresses.' });
    }

    // Serialize the whole verify-then-consume sequence per order ID so a
    // duplicate/replayed POST for one payment cannot pass the redemption
    // check twice and hand out two sets of keys.
    let result;
    try {
        result = await withLock(`order:${paypalOrderID || 'none'}`, async () => {
            const rejection = await requireVerifiedPayment(paypalOrderID, totalUSD, 'mailbox');
            if (rejection) return { httpCode: rejection.httpCode, body: { success: false, error: rejection.error } };

            console.log(`\n>>> Fulfilling order ${paypalOrderID || '(no id)'}: ${firstName} ${lastName}, ${totalUnits} address(es), $${totalUSD}`);

            const addresses = [];
            const consumedByClass = {};
            let bonusConsumed = 0;

            for (const item of items) {
                const qty = parseInt(item.quantity, 10);
                for (let i = 0; i < qty; i++) {
                    try {
                        const key = await fulfillment.getAddressKey(item.class);
                        // A missing bonus must not sink the address delivery
                        let bonusLockerKey = null;
                        try {
                            bonusLockerKey = await fulfillment.getBonusKey();
                        } catch (bonusErr) {
                            console.error(`Bonus key unavailable (${item.class} unit):`, bonusErr.message);
                        }
                        const qmail = canonicalAddress(key.serial, item.class);

                        addresses.push({ qmail, class: item.class, lockerKey: key.lockerKey, bonusLockerKey });
                        consumedByClass[item.class] = (consumedByClass[item.class] || 0) + 1;
                        if (bonusLockerKey) bonusConsumed++;

                        fulfillment.logIssued({
                            orderID: paypalOrderID || '', firstName, lastName,
                            qmail, class: item.class, lockerKey: key.lockerKey,
                            serial: key.serial, bonusLockerKey: bonusLockerKey || ''
                        });
                        logSoldCoin(firstName, lastName, key.lockerKey, qmail);
                    } catch (err) {
                        console.error(`SALE WITHOUT FULL DELIVERY: ${item.class} unit failed (order ${paypalOrderID}):`, err.message);
                        // Nothing delivered at all -> roll the redemption back so
                        // the buyer isn't paid-but-blocked; they can retry.
                        if (addresses.length === 0) unmarkOrderRedeemed(paypalOrderID, 'mailbox');
                        sendEmail('sean@raidatech.com',
                            'URGENT: DMS sale with incomplete delivery',
                            `Order ${paypalOrderID} (${firstName} ${lastName}) paid for ${totalUnits} address(es) ` +
                            `but only ${addresses.length} were delivered.\n\n` +
                            `Failed at: ${item.class} (${err.message})\n\n` +
                            `Delivered so far:\n${addresses.map(a => `  ${a.qmail}  key=${a.lockerKey}`).join('\n') || '  (none)'}\n\n` +
                            `Buyer email: ${buyerEmail || '(not provided)'}\n\n` +
                            `Deliver the remainder manually and reply to the buyer.`);
                        fulfillment.scheduleReplenish(consumedByClass, bonusConsumed);
                        if (addresses.length) emailOrderKeys(buyerEmail, addresses, true);
                        return {
                            httpCode: addresses.length ? 207 : 503,
                            body: {
                                success: addresses.length > 0,
                                partial: true,
                                addresses,
                                error: `We could only deliver ${addresses.length} of ${totalUnits} addresses. ` +
                                       `Your payment was received - please contact support and we will deliver the rest promptly.`
                            }
                        };
                    }
                }
            }

            fulfillment.scheduleReplenish(consumedByClass, bonusConsumed);
            emailOrderKeys(buyerEmail, addresses, false);
            sendEmail(OWNER_EMAIL,
                'DMS QMail purchase completed - order ' + (paypalOrderID || '(no PayPal ID)'),
                'A QMail purchase was completed and delivered.\n\n' +
                'Buyer: ' + (firstName || '') + ' ' + (lastName || '') + '\n' +
                'Buyer email: ' + (buyerEmail || '(not provided)') + '\n' +
                'PayPal order: ' + (paypalOrderID || '(not provided)') + '\n' +
                'Total: $' + totalUSD + ' USD\n' +
                'Addresses and locker keys:\n' +
                addresses.map(a => '  ' + a.qmail + ' (' + a.class + ') - mailbox=' + a.lockerKey +
                    (a.bonusLockerKey ? ', bonus=' + a.bonusLockerKey : '')).join('\n'));
            console.log(`Order fulfilled: ${addresses.map(a => a.qmail).join(', ')}`);
            return { httpCode: 200, body: { success: true, addresses } };
        });
    } catch (err) {
        console.error('fulfill-order failed unexpectedly:', err.message);
        return res.status(500).json({ success: false, error: 'Order processing error. Your payment was received - contact support.' });
    }

    res.status(result.httpCode).json(result.body);
});

// Emails the buyer their locker keys as an out-of-band backup, so a dropped
// HTTP response never strands them without the keys they paid for. PayPal
// supplies the payer email; if the buyer opted out or it's missing, skip.
function emailOrderKeys(buyerEmail, addresses, partial) {
    if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail) || addresses.length === 0) return;
    const lines = addresses.map(a =>
        `  ${a.qmail}  (.${a.class})\n` +
        `     Mailbox Locker Key: ${a.lockerKey}\n` +
        (a.bonusLockerKey ? `     Bonus Coins Locker Key: ${a.bonusLockerKey}\n` : ''));
    sendEmail(buyerEmail,
        'Your QMail address keys',
        `Thank you for your purchase. Here are your QMail address${addresses.length > 1 ? 'es' : ''} and locker keys:\n\n` +
        lines.join('\n') +
        `\nEnter each Mailbox Locker Key in the QMail software to claim your address coin, and put each\n` +
        `Bonus Coins Locker Key into the Wallet part of the software (200 CloudCoins each).\n\n` +
        (partial ? `NOTE: part of your order is still being prepared - support will deliver the rest shortly.\n\n` : '') +
        `Download QMail: https://CloudCoinConsortium.com/use.php\n` +
        `Getting started: https://www.distributedmailsystem.com/getting-started\n` +
        `Support: 20.123@giga or CloudCoin@Protonmail.com`);
}

// --- 5a. Stock Endpoint ---
// Lets the client grey out sold-out tiers BEFORE the buyer pays.
// Counts come from the pre-minted locker-key pools (plus "bonus").
app.get('/api/wallet-stock', (req, res) => {
    res.json(fulfillment.stockCounts());
});

// --- 5b. Make User Anonymous ---
// Strips FirstName/LastName from the issued-keys ledger (current sales) and
// from users.csv (legacy rows) for the given qmail address.
app.post('/api/make-anonymous', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    try {
        let found = fulfillment.anonymizeIssued(email);

        if (fs.existsSync(USERS_CSV_PATH)) {
            const lines = fs.readFileSync(USERS_CSV_PATH, 'utf8').split('\n');
            let foundLegacy = false;
            const updated = lines.map((line, i) => {
                if (i === 0) return line; // keep header
                if (!line.trim()) return line; // keep empty lines
                const cols = line.split(',');
                if (cols[0] === email || cols[0] === `"${email}"`) {
                    foundLegacy = true;
                    cols[1] = ''; // FirstName
                    cols[2] = ''; // LastName
                    return cols.join(',');
                }
                return line;
            });
            if (foundLegacy) {
                fs.writeFileSync(USERS_CSV_PATH, updated.join('\n'));
                found = true;
            }
        }

        if (!found) {
            return res.status(404).json({ success: false, error: 'Email not found in records.' });
        }

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

    // Policy: only high-stake .Giga or .Epic address holders may receive money
    // as an influencer. The stake cost ($1,000 / $10,000) is the anti-abuse
    // gate that keeps bad actors out until per-influencer KYC lands.
    if (!/@(giga|epic)$/i.test(String(qmailAddress).trim())) {
        return res.status(400).json({
            success: false,
            error: 'Influencer payouts require a .Giga or .Epic QMail address. Please register with a Giga or Epic address.'
        });
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
function logAffiliateSale(data) {
    const {
        influencerName, influencerAddress, influencerInboxFee,
        buyerFirstName, buyerLastName, buyerEmail,
        paymentAmount, cloudCoinsPurchased,
        createdEmailAddress, emailAddressCreated
    } = data;

    const csvPath = path.join(__dirname, 'affiliate_sales.csv');
    const headers = 'Timestamp,InfluencerName,InfluencerAddress,InfluencerInboxFee,BuyerFirstName,BuyerLastName,BuyerEmail,PaymentAmount,CloudCoinsPurchased,CreatedEmailAddress,EmailAddressCreated';

    if (!fs.existsSync(csvPath)) {
        fs.writeFileSync(csvPath, headers + '\n');
    }

    const escapeField = (field) => {
        const str = String(field || '').replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
    };

    const row = [
        escapeField(new Date().toISOString()),
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
}

app.post('/api/log-affiliate-sale', (req, res) => {
    const { influencerName, buyerFirstName, paymentAmount } = req.body;
    if (!influencerName || !buyerFirstName || !paymentAmount) {
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }
    try {
        logAffiliateSale(req.body);
        res.json({ success: true });
    } catch (err) {
        console.error("Failed to log affiliate sale:", err.message);
        res.status(500).json({ success: false, error: 'Failed to log sale.' });
    }
});

// --- 8b. Influencer Combined Fulfillment ---
// One PayPal payment on the /access page can cover (a) CloudCoins to message
// the influencer, (b) any address cart the visitor chose to buy, and (c) a
// free bonus .byte address. The payment is verified ONCE against the combined
// total (coins + paid addresses), so the same dollars can never be counted
// twice across purposes. Attribution is logged server-side.
app.post('/api/fulfill-influencer', async (req, res) => {
    if (!readPaymentConfig().paymentsEnabled) {
        return res.status(503).json({ success: false, error: "Payments are temporarily disabled - coming soon." });
    }

    const {
        firstName, lastName, buyerEmail, paypalOrderID,
        coinsDollars, items, wantBonusAddress,
        influencerName, influencerAddress, influencerInboxFee
    } = req.body;

    const coins$ = Number(coinsDollars) || 0;
    if (coins$ < 0 || coins$ > 1000) {
        return res.status(400).json({ success: false, error: 'Invalid coins amount.' });
    }

    // Price any paid address cart from server-side prices
    const cartItems = Array.isArray(items) ? items : [];
    let cartTotal = 0, cartUnits = 0;
    for (const item of cartItems) {
        const cls = fulfillment.CLASSES[item.class];
        const qty = parseInt(item.quantity, 10);
        if (!cls || !Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ success: false, error: 'Invalid address in cart.' });
        }
        cartTotal += cls.priceUSD * qty;
        cartUnits += qty;
    }
    if (cartUnits > 20) {
        return res.status(400).json({ success: false, error: 'A single order is limited to 20 addresses.' });
    }

    const grandTotal = coins$ + cartTotal;
    if (grandTotal <= 0) {
        return res.status(400).json({ success: false, error: 'Nothing to purchase.' });
    }

    let result;
    try {
        result = await withLock(`order:${paypalOrderID || 'none'}`, async () => {
            // Single verification against the combined total, single redemption
            const rejection = await requireVerifiedPayment(paypalOrderID, grandTotal, 'influencer');
            if (rejection) return { httpCode: rejection.httpCode, body: { success: false, error: rejection.error } };

            console.log(`\n>>> Influencer fulfill ${paypalOrderID || '(no id)'}: ${firstName} ${lastName}, $${coins$} coins + ${cartUnits} paid addr + ${wantBonusAddress ? '1 bonus' : 'no bonus'}`);

            const buyer = { firstName, lastName };
            let cloudCoins = 0, cloudCoinsLockerCode = null;
            const addresses = [];
            let delivered = false;
            let stuck = null;

            // 1. CloudCoins to message the influencer (amount-mode deposits the
            //    real coin count, unlike the single-coin legacy endpoint).
            if (coins$ > 0) {
                try {
                    cloudCoins = coins$ * 10;
                    cloudCoinsLockerCode = await fulfillment.mintAmountLocker(cloudCoins);
                    delivered = true;
                } catch (err) {
                    console.error('Influencer coins mint failed:', err.message);
                    stuck = `CloudCoins (${err.message})`;
                    cloudCoins = 0;
                }
            }

            // 2. Any paid addresses the visitor bought
            for (const item of cartItems) {
                const qty = parseInt(item.quantity, 10);
                for (let i = 0; i < qty && !stuck; i++) {
                    try {
                        const a = await fulfillment.issueAddressUnit(item.class, buyer, paypalOrderID);
                        logSoldCoin(firstName, lastName, a.lockerKey, a.qmail);
                        addresses.push(a);
                        delivered = true;
                    } catch (err) {
                        console.error(`Influencer paid address failed (${item.class}):`, err.message);
                        stuck = `${item.class} address (${err.message})`;
                    }
                }
            }

            // 3. Free bonus .byte address (the "get your own address free" perk)
            if (wantBonusAddress && !stuck) {
                try {
                    const a = await fulfillment.issueAddressUnit('byte', buyer, paypalOrderID);
                    logSoldCoin(firstName, lastName, a.lockerKey, a.qmail);
                    addresses.push({ ...a, free: true });
                    delivered = true;
                } catch (err) {
                    console.error('Influencer bonus address failed:', err.message);
                    stuck = `bonus address (${err.message})`;
                }
            }

            // Nothing delivered at all -> roll back so the buyer can retry
            if (!delivered) {
                unmarkOrderRedeemed(paypalOrderID, 'influencer');
                return { httpCode: 503, body: { success: false, error: 'We could not complete your order. Your payment was received - please contact support.' } };
            }

            // Attribution (server-side, reliable)
            try {
                logAffiliateSale({
                    influencerName, influencerAddress, influencerInboxFee,
                    buyerFirstName: firstName, buyerLastName: lastName, buyerEmail,
                    paymentAmount: grandTotal,
                    cloudCoinsPurchased: cloudCoins,
                    createdEmailAddress: addresses.length > 0,
                    emailAddressCreated: addresses.map(a => a.qmail).join('; ')
                });
            } catch (err) {
                console.error('Affiliate logging failed (non-fatal):', err.message);
            }

            fulfillment.scheduleReplenish(
                addresses.reduce((m, a) => { m[a.class] = (m[a.class] || 0) + 1; return m; }, {}),
                addresses.filter(a => a.bonusLockerKey).length
            );
            if (addresses.length && buyerEmail) emailOrderKeys(buyerEmail, addresses, !!stuck);

            if (stuck) {
                sendEmail('sean@raidatech.com',
                    'URGENT: DMS influencer sale partially delivered',
                    `Order ${paypalOrderID} (${firstName} ${lastName}) via ${influencerName}: ` +
                    `delivered coins=${cloudCoins} CC and ${addresses.length} address(es), ` +
                    `but failed at ${stuck}. Buyer email: ${buyerEmail || '(none)'}. Deliver the rest manually.`);
            }

            if (!stuck) {
                sendEmail(OWNER_EMAIL,
                    'DMS influencer purchase completed - order ' + (paypalOrderID || '(no PayPal ID)'),
                    'An influencer QMail/CloudCoin purchase was completed and delivered.\n\n' +
                    'Buyer: ' + (firstName || '') + ' ' + (lastName || '') + '\n' +
                    'Buyer email: ' + (buyerEmail || '(not provided)') + '\n' +
                    'PayPal order: ' + (paypalOrderID || '(not provided)') + '\n' +
                    'Total: $' + grandTotal + ' USD\n' +
                    'CloudCoins: ' + cloudCoins + '\n' +
                    'Addresses:\n' +
                    addresses.map(a => '  ' + a.qmail + ' (' + a.class + ') - mailbox=' + a.lockerKey +
                        (a.bonusLockerKey ? ', bonus=' + a.bonusLockerKey : '')).join('\n'));
            }

            return {
                httpCode: stuck ? 207 : 200,
                body: {
                    success: true,
                    partial: !!stuck,
                    cloudCoins,
                    cloudCoinsLockerCode,
                    addresses,
                    error: stuck ? 'Part of your order is still being prepared - your payment was received and support will deliver the rest promptly.' : undefined
                }
            };
        });
    } catch (err) {
        console.error('fulfill-influencer failed unexpectedly:', err.message);
        return res.status(500).json({ success: false, error: 'Order processing error. Your payment was received - contact support.' });
    }

    res.status(result.httpCode).json(result.body);
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
            `http://localhost:8080/api/transactions/locker/put-one-coin`,
            {
                params: {
                    locker_key: lockerKey,
                    denomination: bestDenom.coinDenomination,
                    wallet_path: fulfillment.FUNDING_WALLET
                },
                timeout: 30000
            }
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

// --- 9b. Subscription Recording Endpoint ---
// Called by Subscribe.jsx right after PayPal approves the subscription in
// the browser. Persists who gets topped up, where, and the backup email.
app.post('/api/record-subscription', async (req, res) => {
    // Same kill-switch as the address store — payments-enabled=false closes
    // subscription sales too, not just /register.
    if (!readPaymentConfig().paymentsEnabled) {
        return res.status(503).json({ success: false, error: "Payments are temporarily disabled - coming soon." });
    }

    const { subscriptionID, planKey, addresses, backupEmail, allowSubscriptionQmails } = req.body;

    if (!subscriptionID || typeof subscriptionID !== 'string' || subscriptionID.length > 64) {
        return res.status(400).json({ success: false, error: 'A valid subscriptionID is required.' });
    }
    if (!subscriptions.PLAN_DOLLARS[planKey]) {
        return res.status(400).json({ success: false, error: 'Unknown plan.' });
    }
    if (!Array.isArray(addresses) || addresses.length === 0 ||
        addresses.length > subscriptions.MAX_ADDRESSES_PER_SUB ||
        addresses.some(a => typeof a !== 'string' || !subscriptions.QMAIL_ADDRESS_RE.test(a.trim()))) {
        return res.status(400).json({ success: false, error: 'One or more QMail addresses are invalid.' });
    }
    // Email is no longer collected on the subscribe page — PayPal supplies the
    // buyer's email at purchase. If a backupEmail is ever passed, it must still
    // be well-formed, but it is optional.
    if (backupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(backupEmail)) {
        return res.status(400).json({ success: false, error: 'If provided, the backup email must be valid.' });
    }

    const v = await subscriptions.verifySubscription(subscriptionID);
    if (!v.verified) {
        console.warn(`SUBSCRIPTION REJECTED: ${subscriptionID} - ${v.reason}`);
        return res.status(402).json({ success: false, error: `PayPal did not confirm this subscription (${v.reason}).` });
    }

    try {
        const outcome = await subscriptions.recordSubscription({
            subscriptionID,
            planKey,
            addresses: addresses.map(a => a.trim()),
            backupEmail: backupEmail ? backupEmail.trim() : '',
            allowSubscriptionQmails: allowSubscriptionQmails !== false,
            // Captured from PayPal so a later self-service cancellation can be
            // matched by cardholder name + card last-four.
            subscriberName: (v.subscriber && v.subscriber.name) || '',
            subscriberEmail: (v.subscriber && v.subscriber.email) || '',
            cardLastDigits: (v.subscriber && v.subscriber.cardLastDigits) || ''
        });
        if (!outcome.ok && outcome.conflict) {
            // Anti-hijack: this ID is already recorded with different details.
            return res.status(409).json({
                success: false,
                error: 'This subscription is already registered. If you need to change its delivery addresses, contact support.'
            });
        }
        if (outcome.created) {
            sendEmail(OWNER_EMAIL,
                'DMS subscription started - ' + subscriptionID,
                'A new DMS subscription was started.\n\n' +
                'Subscription: ' + subscriptionID + '\n' +
                'Plan: ' + planKey + '\n' +
                'Subscriber: ' + ((v.subscriber && v.subscriber.name) || '(not provided)') + '\n' +
                'Subscriber email: ' + ((v.subscriber && v.subscriber.email) || '(not provided)') + '\n' +
                'QMail addresses:\n  ' + addresses.join('\n  '));
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to record subscription:', err.message);
        res.status(500).json({ success: false, error: 'Failed to save the subscription. Keep your subscription ID and contact support.' });
    }
});

// --- 9b². Self-service subscription cancellation ---
// One subscription (one PayPal payment) can cover several qmail addresses, so
// the customer only needs to enter ANY one of the addresses on it — we cancel
// the whole subscription (every address on it) at PayPal and drop our record.
app.post('/api/cancel-subscription', async (req, res) => {
    const qmail = (req.body && req.body.qmail ? String(req.body.qmail) : '').trim();

    // Permissive shape check (includes 'epic'); the real gate is whether it
    // matches an address on an active subscription.
    if (!/^\d{1,3}(\.\d{1,3}){0,2}@(bit|byte|kilo|mega|giga|epic)$/i.test(qmail)) {
        return res.status(400).json({
            success: false,
            error: 'Please enter one of the QMail addresses on your subscription (e.g. 38.88@bit).'
        });
    }

    try {
        const outcome = await subscriptions.cancelByQmailAddress({ qmail });
        if (outcome.ok) {
            return res.json({ success: true, addresses: outcome.addresses || [] });
        }
        // Found the subscription but PayPal wouldn't cancel it — don't tell the
        // customer we couldn't find it; point them at support instead.
        if (outcome.reason === 'paypal-error') {
            return res.status(502).json({
                success: false,
                error: "We found your subscription but couldn't reach PayPal to cancel it just now. Please try again shortly, or email CloudCoin@Protonmail.com and we'll take care of it."
            });
        }
        return res.status(404).json({
            success: false,
            error: "We couldn't find an active subscription for that QMail address."
        });
    } catch (err) {
        console.error('Cancel subscription failed:', err.message);
        return res.status(500).json({ success: false, error: 'Something went wrong while cancelling your subscription.' });
    }
});

// --- 9c. PayPal Webhook Receiver ---
// PayPal calls this on every subscription event. PAYMENT.SALE.COMPLETED is
// the monthly billing trigger that mints and delivers the coins. Configure
// the webhook in the PayPal developer dashboard pointing at this URL and put
// its ID in .env as PAYPAL_WEBHOOK_ID_SANDBOX / PAYPAL_WEBHOOK_ID_LIVE.
app.post('/api/paypal/webhook', async (req, res) => {
    const event = req.body || {};
    const { sandboxMode } = readPaymentConfig();

    const genuine = await subscriptions.verifyWebhookSignature(req.headers, event, sandboxMode);
    if (!genuine) {
        return res.status(400).json({ received: false });
    }

    // Durably record the billing event BEFORE acknowledging, so a crash
    // between the ACK and fulfillment can't lose it (PayPal never resends an
    // acknowledged delivery). retryPendingDeliveries then completes it.
    try {
        subscriptions.preRecordWebhook(event);
    } catch (err) {
        // Persisting failed - do NOT ack; let PayPal retry the delivery.
        console.error('Failed to persist webhook before ACK:', err.message);
        return res.status(500).json({ received: false });
    }

    // Acknowledge; fulfillment (minting + delivery) can take a while.
    res.json({ received: true });

    subscriptions.handleWebhookEvent(event).catch(err => {
        console.error(`Webhook handling failed for ${event.event_type}:`, err.message);
    });
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
app.get('/api/admin/stats', async (req, res) => {
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

        // --- Operations: live payment-system state (pools, wallet, subs, issued) ---
        // Each piece is guarded so one failure can't blank the whole dashboard.
        let pools = null, walletBalance = null, subSummary = null, issued = null;
        try { pools = fulfillment.stockCounts(); } catch (e) { console.error('stats pools:', e.message); }
        try { walletBalance = await fulfillment.fundingBalance(); } catch (e) { console.error('stats wallet:', e.message); }
        try { subSummary = subscriptions.summary(); } catch (e) { console.error('stats subs:', e.message); }
        try { issued = fulfillment.issuedSummary(); } catch (e) { console.error('stats issued:', e.message); }

        const operations = {
            pools,                                        // { bit, byte, kilo, mega, giga, bonus }
            walletBalance,                                // { balance, notes } | null
            lowBalanceThreshold: parseInt(process.env.WALLET_LOW_BALANCE_THRESHOLD || '25000', 10),
            subscriptions: subSummary,                    // status counts + MRR + pending deliveries
            issued,                                       // { total, byClass, lastIssuedAt }
            paymentsEnabled: readPaymentConfig().paymentsEnabled,
            sandboxMode: readPaymentConfig().sandboxMode,
        };

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
            operations,
            waitlist: readWaitlist(),
            bugs: readBugReports(),
        });
    } catch (err) {
        console.error("Failed to generate stats:", err.message);
        res.status(500).json({ error: 'Failed to generate stats.' });
    }
});

// --- Influencer waitlist ---
// Public: anyone interested in the (Phase II) influencer program can sign up.
app.post('/api/waitlist', (req, res) => {
    const name = String(req.body.name || '').trim().slice(0, 120);
    const email = String(req.body.email || '').trim().slice(0, 200);
    const social = String(req.body.social || '').trim().slice(0, 300);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'A valid email is required.' });
    }
    try {
        const list = loadJsonArray(WAITLIST_PATH);
        // De-dupe on email (case-insensitive) so repeat clicks don't pile up.
        if (list.some(e => (e.email || '').toLowerCase() === email.toLowerCase())) {
            return res.json({ success: true, message: "You're already on the list." });
        }
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        list.push({ id, timestamp: new Date().toISOString(), name, email, social });
        saveJsonArray(WAITLIST_PATH, list);
        res.json({ success: true, message: "You're on the waitlist!" });
    } catch (err) {
        console.error('Waitlist save failed:', err.message);
        res.status(500).json({ success: false, error: 'Could not save your signup.' });
    }
});

// Admin: remove a waitlist entry (e.g. after contacting them).
app.post('/api/admin/waitlist-delete', (req, res) => {
    if (!requireAdmin(req, res)) return;
    const id = String(req.body.id || '');
    try {
        const list = loadJsonArray(WAITLIST_PATH);
        const next = list.filter(e => e.id !== id);
        saveJsonArray(WAITLIST_PATH, next);
        res.json({ success: true, removed: list.length - next.length });
    } catch (err) {
        console.error('Waitlist delete failed:', err.message);
        res.status(500).json({ success: false, error: 'Delete failed.' });
    }
});

// Admin: dismiss a bug report (hides it from the dashboard; the underlying
// cloudcoin.org feed is append-only and owned by www-data, so we track
// dismissals on our side rather than editing that file).
app.post('/api/admin/bug-dismiss', (req, res) => {
    if (!requireAdmin(req, res)) return;
    const id = String(req.body.id || '');
    if (!id) return res.status(400).json({ success: false, error: 'id required.' });
    try {
        const dismissed = loadJsonArray(BUG_DISMISSED_PATH);
        if (!dismissed.includes(id)) dismissed.push(id);
        saveJsonArray(BUG_DISMISSED_PATH, dismissed);
        res.json({ success: true });
    } catch (err) {
        console.error('Bug dismiss failed:', err.message);
        res.status(500).json({ success: false, error: 'Dismiss failed.' });
    }
});

// Admin: clear all Conversion Funnel data (resets analytics_events.csv).
app.post('/api/admin/clear-funnel', (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        fs.writeFileSync(path.join(__dirname, 'analytics_events.csv'), 'Timestamp,Event,Props\n');
        res.json({ success: true });
    } catch (err) {
        console.error('Clear funnel failed:', err.message);
        res.status(500).json({ success: false, error: 'Clear failed.' });
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

// --- 14. Background Maintenance ---
// Hourly: retry subscription cycles that could not fully mint or deliver
// (Core or QMail down when the webhook arrived). Also a startup pass a
// minute after boot so a restart clears the backlog quickly.
setTimeout(() => {
    subscriptions.retryPendingDeliveries().catch(err =>
        console.error('Startup delivery retry failed:', err.message));
}, 60 * 1000);
setInterval(() => {
    subscriptions.retryPendingDeliveries().catch(err =>
        console.error('Hourly delivery retry failed:', err.message));
}, 60 * 60 * 1000);

// --- 9. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Core API expected at: http://localhost:8080`);
    console.log(`========================================`);
});
