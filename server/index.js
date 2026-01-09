require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// Request Logger: Critical for PM2 monitoring
app.use((req, res, next) => {
    console.log(`>>> ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- 2. Configuration Constants ---
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Maps payment amount to class name, coin file prefix, and coin denomination
const AMOUNT_MAPPING = {
    10:   { class: "bit",  fileStart: "1.", coinDenomination: 1 },
    20:   { class: "byte", fileStart: "10.", coinDenomination: 10 },
    50:   { class: "kilo", fileStart: "100.", coinDenomination: 100 },
    100:  { class: "mega", fileStart: "1_000.", coinDenomination: 1000 },
    1000: { class: "giga", fileStart: "10_000.", coinDenomination: 10000 }
};

// Wallet directory paths
const BASE_DIR = "/var/cc/cloudcoin_desktop/Wallets";
const WALLETS = {
    distMailBank:    path.join(BASE_DIR, "distributed_mail_system", "Bank"),
    distMailFracked: path.join(BASE_DIR, "distributed_mail_system", "Fracked"),
    defaultBank:     path.join(BASE_DIR, "Default", "Bank"),
    defaultFracked:  path.join(BASE_DIR, "Default", "Fracked")
};

// Phase I hardcoded beacon
const DEFAULT_BEACON = "raida11";

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

// --- 4. Wallet Helper Functions ---

/**
 * Cleans up the distributed_mail_system wallet by moving all coins to Default/Fracked
 */
function cleanupDistMailWallet() {
    console.log("Cleaning up distributed_mail_system wallet...");
    const foldersToClean = [WALLETS.distMailBank, WALLETS.distMailFracked];
    let movedCount = 0;

    for (const folder of foldersToClean) {
        if (fs.existsSync(folder)) {
            const files = fs.readdirSync(folder).filter(f => f.endsWith('.bin'));
            for (const file of files) {
                try {
                    const src = path.join(folder, file);
                    const dest = path.join(WALLETS.defaultFracked, file);
                    fs.renameSync(src, dest);
                    movedCount++;
                    console.log(`  Moved: ${file} -> Default/Fracked`);
                } catch (err) {
                    console.error(`  Failed to move ${file}:`, err.message);
                }
            }
        }
    }
    console.log(`Cleanup complete. Moved ${movedCount} coin(s).`);
}

/**
 * Finds a matching coin in the Default wallet based on fileStart pattern
 * Coin filename format: "1.CloudCoin.1.12345678.bin" -> serial is element [3]
 */
function findMatchingCoin(fileStart) {
    console.log(`Searching for coin starting with "${fileStart}"...`);
    const searchDirs = [WALLETS.defaultBank, WALLETS.defaultFracked];

    for (const dir of searchDirs) {
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                if (file.startsWith(fileStart) && file.endsWith('.bin')) {
                    const parts = file.split('.');
                    // Coin filename format: denomination.00_000_000.BTC.authcodes.SERIAL.extra.0..bin
                    // Serial is at index [4]
                    if (parts.length >= 5) {
                        const serial = parts[4]; // 5th element (0-indexed: 4)
                        console.log(`  Found coin: ${file} (serial: ${serial})`);
                        return {
                            filePath: path.join(dir, file),
                            fileName: file,
                            serial
                        };
                    }
                }
            }
        }
    }
    console.log("  No matching coin found.");
    return null;
}

/**
 * Moves a coin file to the distributed_mail_system/Fracked folder
 */
function moveCoinToDistMail(sourceFile, fileName) {
    const dest = path.join(WALLETS.distMailFracked, fileName);

    // Ensure destination directory exists
    if (!fs.existsSync(WALLETS.distMailFracked)) {
        fs.mkdirSync(WALLETS.distMailFracked, { recursive: true });
    }

    fs.renameSync(sourceFile, dest);
    console.log(`Moved coin to: ${dest}`);
    return dest;
}

/**
 * Registers a user in the users.csv file
 */
function registerUser(customSerial, firstName, lastName, description, inboxFee, amountClass) {
    const filePath = '/var/www/distributedmailsystem.com/users.csv';
    const headers = 'CustomSerialNumber,FirstName,LastName,Description,InboxFee,Class,Beacon';

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
            escapeField(customSerial),
            escapeField(firstName),
            escapeField(lastName),
            escapeField(description),
            escapeField(inboxFee),
            escapeField(amountClass),
            escapeField(DEFAULT_BEACON)
        ].join(',') + '\n';

        fs.appendFileSync(filePath, row);
        console.log(`Registered user: ${firstName} ${lastName} -> users.csv`);
    } catch (err) {
        console.error("Failed to register user:", err.message);
    }
}

/**
 * Logs a sold coin transaction to SoldCoins.txt
 */
function logSoldCoin(firstName, lastName, lockerKey, email) {
    try {
        // Format: YYYY-MM-DD HH:MM:SS.mm (2 decimal places for ms)
        const now = new Date();
        const timestamp = now.toISOString()
            .replace('T', ' ')
            .replace('Z', '')
            .slice(0, -4); // Trim to 2 decimal places

        const logEntry = `${timestamp},${lastName},${firstName},${lockerKey},${email}\n`;
        fs.appendFileSync(path.join(__dirname, 'SoldCoins.txt'), logEntry);
        console.log(`Logged transaction to SoldCoins.txt`);
    } catch (err) {
        console.error("Failed to write to SoldCoins.txt:", err.message);
    }
}

// --- 5. Polling Helper: RAIDA RESTful Path ---
async function pollLockerKey(taskId) {
    const maxAttempts = 30; // Increased from 15
    const delay = 1000;

    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await axios.get(`http://127.0.0.1:8006/api/v1/tasks/${taskId}`);
            const payload = response.data.payload;

            console.log(`Polling Task [${taskId}] - Status: ${payload?.status} - Progress: ${payload?.progress}%`);

            // Check for completed status and get transmit_code from payload.data
            if (payload?.status === "completed" && payload?.data?.transmit_code) {
                console.log(`Got transmit_code: ${payload.data.transmit_code}`);
                return payload.data.transmit_code;
            }

            // If the task reports an error, stop polling
            if (payload?.status === "error") {
                console.error(`RAIDA Task error: ${payload.message || 'Unknown error'}`);
                break;
            }
        } catch (err) {
            console.error(`Polling attempt ${i+1} failed:`, err.message);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
}

// --- 6. Main API Endpoint ---
app.post('/api/generate-mailbox', async (req, res) => {
    const { firstName, lastName, amountPaid, inboxFee, description } = req.body;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`>>> Processing Registration: ${firstName} ${lastName}`);
    console.log(`    Amount: $${amountPaid}, InboxFee: $${inboxFee || 0}`);
    console.log(`    Description: ${description || "(none)"}`);
    console.log("=".repeat(60));

    // Step 1: Validate amount and get mapping
    const mapping = AMOUNT_MAPPING[amountPaid];
    if (!mapping) {
        console.error(`Invalid amount: ${amountPaid}`);
        return res.status(400).json({
            success: false,
            error: `Invalid amount. Must be one of: ${Object.keys(AMOUNT_MAPPING).join(', ')}`
        });
    }

    const { class: amountClass, fileStart, coinDenomination } = mapping;
    console.log(`Amount class: ${amountClass}, File pattern: ${fileStart}*, Coin denomination: ${coinDenomination}`);

    // Step 2: Clean up distributed_mail_system wallet
    try {
        cleanupDistMailWallet();
    } catch (err) {
        console.error("Wallet cleanup failed:", err.message);
        // Continue anyway - not fatal
    }

    // Step 3: Find matching coin in Default wallet
    const coin = findMatchingCoin(fileStart);
    if (!coin) {
        console.error("No matching coin available!");
        return res.status(503).json({
            success: false,
            error: "No coins available for this denomination. Please try again later."
        });
    }

    // Step 4: Move coin to distributed_mail_system wallet
    try {
        moveCoinToDistMail(coin.filePath, coin.fileName);
    } catch (err) {
        console.error("Failed to move coin:", err.message);
        return res.status(500).json({
            success: false,
            error: "Failed to process coin. Please try again."
        });
    }

    // Step 5: Call locker API
    let lockerKey = null;
    try {
        console.log("Contacting RAIDA Locker at 127.0.0.1:8006...");
        const lockerResponse = await axios.post(
            'http://127.0.0.1:8006/api/v1/locker',
            {
                name: "distributed_mail_system",  // Wallet name, NOT user name
                amount: coinDenomination,  // Use coin denomination, not dollar amount
                tag: `${firstName} ${lastName}`
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );

        if (lockerResponse.data.status === "success" && lockerResponse.data.payload?.id) {
            const taskId = lockerResponse.data.payload.id;
            console.log(`Task ID [${taskId}] created. Polling for transmit_code...`);

            // Step 6: Poll for transmit_code
            lockerKey = await pollLockerKey(taskId);

            if (!lockerKey) {
                console.error("Failed to get transmit_code from locker API");
                return res.status(500).json({
                    success: false,
                    error: "Failed to generate locker key. Please try again."
                });
            }
        } else {
            console.error("Locker API returned unexpected response:", lockerResponse.data);
            return res.status(500).json({
                success: false,
                error: "Locker service unavailable. Please try again."
            });
        }
    } catch (error) {
        console.error("RAIDA Connection failed:", error.message);
        return res.status(500).json({
            success: false,
            error: "Could not connect to locker service. Please try again."
        });
    }

    // Step 7: Convert serial to custom base32
    const customSerial = convertToCustomBase32(coin.serial);
    console.log(`Serial: ${coin.serial} -> Custom Base32: ${customSerial}`);

    // Step 8: Generate email address
    // Format: FirstName.LastName@Describer#serial.Class
    const describerPart = description ? `@${description}` : "";
    const email = `${firstName}.${lastName}${describerPart}#${customSerial}.${amountClass.charAt(0).toUpperCase() + amountClass.slice(1)}`;
    console.log(`Generated email: ${email}`);

    // Step 9: Register user in users.csv
    registerUser(customSerial, firstName, lastName, description || "", inboxFee || 0, amountClass);

    // Step 10: Log to SoldCoins.txt
    logSoldCoin(firstName, lastName, lockerKey, email);

    console.log(`\n>>> Registration Complete!`);
    console.log(`    Email: ${email}`);
    console.log(`    Locker Key: ${lockerKey}`);
    console.log("=".repeat(60) + "\n");

    // Response for Frontend
    res.json({
        success: true,
        email: email,
        lockerCode: lockerKey
    });
});

// --- 6.5. Influencer Payment Registration Endpoint ---
app.post('/api/register-influencer', (req, res) => {
    const { fullName, email, phone, qmailAddress, paypalEmail, alternativePayment } = req.body;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`>>> Influencer Registration: ${fullName}`);
    console.log(`    Email: ${email}`);
    console.log(`    Phone: ${phone}`);
    console.log(`    QMail: ${qmailAddress}`);
    console.log(`    PayPal: ${paypalEmail}`);
    console.log("=".repeat(60));

    // Validate required fields
    if (!fullName || !email || !phone || !qmailAddress || !paypalEmail) {
        return res.status(400).json({
            success: false,
            error: 'All required fields must be filled out.'
        });
    }

    // CSV file path (outside of dist folder to prevent overwriting)
    const csvPath = '/var/www/distributedmailsystem.com/influencer_payments.csv';
    const headers = 'Timestamp,FullName,Email,Phone,QMailAddress,PayPalEmail,AlternativePayment';

    try {
        const fileExists = fs.existsSync(csvPath);

        if (!fileExists) {
            fs.writeFileSync(csvPath, headers + '\n');
            console.log("Created influencer_payments.csv with headers.");
        }

        // Escape fields that might contain commas or quotes
        const escapeField = (field) => {
            const str = String(field || '').replace(/"/g, '""');
            return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        };

        const timestamp = new Date().toISOString();
        const row = [
            escapeField(timestamp),
            escapeField(fullName),
            escapeField(email),
            escapeField(phone),
            escapeField(qmailAddress),
            escapeField(paypalEmail),
            escapeField(alternativePayment || '')
        ].join(',') + '\n';

        fs.appendFileSync(csvPath, row);
        console.log(`Influencer registered: ${fullName} -> influencer_payments.csv`);

        res.json({
            success: true,
            message: 'Registration successful'
        });

    } catch (err) {
        console.error("Failed to register influencer:", err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save registration. Please try again.'
        });
    }
});

// --- 6.6. CloudCoins Locker Endpoint ---
app.post('/api/generate-cloudcoins-locker', async (req, res) => {
    const { dollarAmount, firstName, lastName } = req.body;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`>>> Processing CloudCoins Locker Request`);
    console.log(`    Amount: $${dollarAmount} = ${dollarAmount * 10} CloudCoins`);
    console.log(`    User: ${firstName} ${lastName}`);
    console.log("=".repeat(60));

    // Validate dollar amount
    if (!dollarAmount || dollarAmount < 1) {
        console.error(`Invalid dollar amount: ${dollarAmount}`);
        return res.status(400).json({
            success: false,
            error: 'Invalid dollar amount. Must be at least $1.'
        });
    }

    // Calculate CloudCoins (1 dollar = 10 CloudCoins)
    const cloudCoins = dollarAmount * 10;

    // Call locker API with Default wallet
    let lockerKey = null;
    try {
        console.log(`Contacting RAIDA Locker at 127.0.0.1:8006 for ${cloudCoins} CloudCoins...`);
        const lockerResponse = await axios.post(
            'http://127.0.0.1:8006/api/v1/locker',
            {
                name: "Default",  // Use Default wallet for CloudCoins
                amount: cloudCoins,
                tag: `CloudCoins for ${firstName} ${lastName}`
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );

        if (lockerResponse.data.status === "success" && lockerResponse.data.payload?.id) {
            const taskId = lockerResponse.data.payload.id;
            console.log(`Task ID [${taskId}] created. Polling for transmit_code...`);

            // Poll for transmit_code
            lockerKey = await pollLockerKey(taskId);

            if (!lockerKey) {
                console.error("Failed to get transmit_code from locker API");
                return res.status(500).json({
                    success: false,
                    error: "Failed to generate CloudCoins locker key. Please try again."
                });
            }
        } else {
            console.error("Locker API returned unexpected response:", lockerResponse.data);
            return res.status(500).json({
                success: false,
                error: "Locker service unavailable. Please try again."
            });
        }
    } catch (error) {
        console.error("RAIDA Connection failed:", error.message);
        return res.status(500).json({
            success: false,
            error: "Could not connect to locker service. Please try again."
        });
    }

    console.log(`\n>>> CloudCoins Locker Created!`);
    console.log(`    CloudCoins: ${cloudCoins}`);
    console.log(`    Locker Key: ${lockerKey}`);
    console.log("=".repeat(60) + "\n");

    // Response for Frontend
    res.json({
        success: true,
        cloudCoins: cloudCoins,
        cloudCoinsLockerCode: lockerKey
    });
});

// --- 6.7. Affiliate Sales Logging Endpoint ---
app.post('/api/log-affiliate-sale', (req, res) => {
    const {
        influencerName,
        influencerAddress,
        influencerInboxFee,
        buyerFirstName,
        buyerLastName,
        buyerEmail,
        paymentAmount,
        cloudCoinsPurchased,
        createdEmailAddress,
        emailAddressCreated
    } = req.body;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`>>> Logging Affiliate Sale`);
    console.log(`    Influencer: ${influencerName} (${influencerAddress})`);
    console.log(`    Buyer: ${buyerFirstName} ${buyerLastName}`);
    console.log(`    Amount: $${paymentAmount} (${cloudCoinsPurchased} CC)`);
    console.log("=".repeat(60));

    // CSV file path
    const csvPath = '/var/www/distributedmailsystem.com/affiliate_sales.csv';
    const headers = 'Timestamp,InfluencerName,InfluencerAddress,InfluencerInboxFee,BuyerFirstName,BuyerLastName,BuyerPayPalEmail,PaymentAmount,CloudCoinsPurchased,CreatedEmail,EmailAddressCreated';

    try {
        const fileExists = fs.existsSync(csvPath);

        if (!fileExists) {
            fs.writeFileSync(csvPath, headers + '\n');
            console.log("Created affiliate_sales.csv with headers.");
        }

        // Escape fields that might contain commas or quotes
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
            escapeField(createdEmailAddress ? 'Yes' : 'No'),
            escapeField(emailAddressCreated || '')
        ].join(',') + '\n';

        fs.appendFileSync(csvPath, row);
        console.log(`Affiliate sale logged -> affiliate_sales.csv`);

        res.json({
            success: true,
            message: 'Sale logged successfully'
        });

    } catch (err) {
        console.error("Failed to log affiliate sale:", err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to log sale.'
        });
    }
});

// --- 7. Frontend & Routing ---
// Serve downloads from a persistent folder (won't be overwritten during builds)
app.use('/downloads', express.static('/var/www/distributedmailsystem.com/downloads'));

// Serve the built React files
app.use(express.static(path.join(__dirname, 'dist')));


// Using a Regex match for all routes (captured as '0')
// This fixes the "Missing parameter name" error in newer Express versions
app.get(/^\/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- 6. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`Server running on port ${PORT}`);
    console.log(`RAIDA endpoint: http://127.0.0.1:8006`);
    console.log(`========================================`);
});