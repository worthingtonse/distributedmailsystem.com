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

function registerUser(email, firstName, lastName, description, inboxFee) {
    const filePath = '/var/www/distributedmailsystem.com/users.csv';
    const headers = 'Email,FirstName,LastName,Description,InboxFee,Beacon,Backup_Beacon';

    try {
        const fileExists = fs.existsSync(filePath);

        if (!fileExists) {
            fs.writeFileSync(filePath, headers + '\n');
            console.log("Created users.csv with headers.");
        }

        // Escape commas in fields by wrapping in quotes if needed
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

        fs.appendFileSync(filePath, row);
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
    // Format: DMS-XXXXX
    const lockerKey = `DMS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
        // Step 3: Call Core API Locker Put-One-Coin (Port 8080)
        console.log(`Calling Core API put-one-coin at 8080 for denomination ${mapping.coinDenomination}...`);

        const coreResponse = await axios.get(
            `http://localhost:8080/api/transactions/locker/put-one-coin?locker_key=${lockerKey}&denomination=${mapping.coinDenomination}`,
            { timeout: 2000 }
        );

        if (coreResponse.data.status === "success") {
            // Step 4: Extract serial number and denomination from response
            const serialNumber = coreResponse.data.serial_number;
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
            console.error("Core API returned error:", coreResponse.data.message);
            res.status(500).json({ success: false, error: "CloudCoin Core failed to upload coin." });
        }
    } catch (error) {
        console.error("Core API Connection failed:", error.message);
        res.status(503).json({
            success: false,
            error: "Could not connect to CloudCoin Core service. Please ensure Core is running on port 8080."
        });
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

// --- 8. Static Routes ---
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