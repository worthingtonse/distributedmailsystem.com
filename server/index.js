require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// Request Logger: Critical for PM2 monitoring
app.use((req, res, next) => {
    console.log(`>>> ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- 1b. PayPal Config Endpoint (reads paypal-mode.txt at runtime — no rebuild needed) ---
app.get('/api/paypal-config', (req, res) => {
    const modePath = path.join(__dirname, 'paypal-mode.txt');
    let sandboxMode = true; // default to sandbox for safety

    try {
        const content = fs.readFileSync(modePath, 'utf8').trim();
        sandboxMode = content.includes('sandbox-mode=true');
    } catch (err) {
        console.warn('paypal-mode.txt not found — defaulting to sandbox mode.');
    }

    const suffix = sandboxMode ? 'SANDBOX' : 'LIVE';
    const mode = sandboxMode ? 'sandbox' : 'live';

    res.json({
        clientId:      process.env[`PAYPAL_CLIENT_ID_${suffix}`]        || '',
        planIdCasual:  process.env[`PAYPAL_PLAN_ID_CASUAL_${suffix}`]   || '',
        planIdTypical: process.env[`PAYPAL_PLAN_ID_TYPICAL_${suffix}`]  || '',
        planIdPower:   process.env[`PAYPAL_PLAN_ID_POWER_${suffix}`]    || '',
        mode,
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

// --- Email Address Generation (adjective.noun.denomination) ---
const ADJECTIVES = fs.readFileSync(path.join(__dirname, '..', 'adjectives.txt'), 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
const NOUNS = fs.readFileSync(path.join(__dirname, '..', 'nouns.txt'), 'utf8').split('\n').map(l => l.trim()).filter(Boolean);

function generateEmailAddress(serialNumber, denominationClass) {
    // serialNumber is a 4-byte integer; extract last two bytes
    const nounByte = serialNumber & 0xFF;                       // last byte
    const preAdjectiveByte = (serialNumber >> 8) & 0xFF;        // second byte from end
    const adjectiveByte = (preAdjectiveByte + nounByte) % 256;  // the transform

    const adjective = ADJECTIVES[adjectiveByte] || 'unknown';
    const noun = NOUNS[nounByte] || 'unknown';

    return `@${adjective}.${noun}.${denominationClass}`;
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

// --- 5. Main API Endpoint (Updated for Core C API) ---

app.post('/api/generate-mailbox', async (req, res) => {
    const { firstName, lastName, amountPaid, inboxFee, description } = req.body;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`>>> Processing Registration: ${firstName} ${lastName}`);
    console.log(`    Amount: $${amountPaid}, InboxFee: $${inboxFee || 0}`);
    console.log("=".repeat(60));

    // Step 1: Validate amount and get mapping
    const mapping = AMOUNT_MAPPING[amountPaid];
    if (!mapping) {
        return res.status(400).json({ success: false, error: "Invalid amount paid." });
    }

    // Step 2: Generate unique locker key for Core API
    // Format: XXX-XXXX using custom base32 alphabet
    const genBase32Char = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const lockerKey = `${genBase32Char()}${genBase32Char()}${genBase32Char()}-${genBase32Char()}${genBase32Char()}${genBase32Char()}${genBase32Char()}`;

    try {
        // Step 3: Call Core API Locker Put-One-Coin (Port 8080)
        console.log(`Calling Core API put-one-coin at 8080 for denomination ${mapping.coinDenomination}...`);

        const coreResponse = await axios.get(
            `http://localhost:8080/api/transactions/locker/put-one-coin?locker_key=${lockerKey}&denomination=${mapping.coinDenomination}`,
            { timeout: 30000 }
        );

        const data = coreResponse.data;

        if (data.status === "success") {
            // Step 4: Extract serial number and denomination from response
            const serialNumber = data.serial_number;
            const amountClass = mapping.class;
            console.log(`Core API Success. Serial: ${serialNumber}, Class: ${amountClass}`);

            // Step 5: Generate email address using adjective.noun.denomination algorithm
            const email = generateEmailAddress(serialNumber, amountClass);

            // Step 6: Database Logging
            registerUser(email, firstName, lastName, description || "", inboxFee || 0);
            logSoldCoin(firstName, lastName, lockerKey, email);

            console.log(`Registration Complete: ${email}`);

            res.json({
                success: true,
                email: email,
                lockerCode: lockerKey
            });
        } else {
            // Core returned an error response (e.g. no coins of that denomination)
            const coreMsg = data.message || "Unknown error from Core service.";
            console.error("Core API returned error:", coreMsg);
            res.status(500).json({ success: false, error: coreMsg });
        }
    } catch (error) {
        // Distinguish timeout from connection failure
        if (error.code === 'ECONNREFUSED') {
            console.error("Core API not running:", error.message);
            res.status(503).json({
                success: false,
                error: "Could not connect to CloudCoin Core service. Please ensure Core is running on port 8080."
            });
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.error("Core API timed out:", error.message);
            res.status(504).json({
                success: false,
                error: "CloudCoin Core service timed out. The RAIDA network may be slow — please try again."
            });
        } else {
            console.error("Core API unexpected error:", error.message);
            res.status(500).json({
                success: false,
                error: `Core service error: ${error.message}`
            });
        }
    }
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
    const { dollarAmount, firstName, lastName } = req.body;

    if (!dollarAmount || !firstName) {
        return res.status(400).json({ success: false, error: 'dollarAmount and firstName are required.' });
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
    const adminKey = process.env.ADMIN_KEY || 'qmail-admin-2026';

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