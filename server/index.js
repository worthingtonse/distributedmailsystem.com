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

// --- 2. Custom Base32 Conversion ---
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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

// --- 3. Polling Helper: RAIDA RESTful Path ---
async function pollLockerKey(taskId) {
    const maxAttempts = 15;
    const delay = 1000;

    for (let i = 0; i < maxAttempts; i++) {
        try {
            // FIXED: Using the RESTful path parameter format: /tasks/ID
            const response = await axios.get(`http://127.0.0.1:8006/api/v1/tasks/${taskId}`);
            
            const payload = response.data.payload;
            console.log(`Polling Task [${taskId}] - Status: ${payload?.status} - Progress: ${payload?.progress}%`);

            // If success, return the real key
            if (response.data.status === "success" && payload?.transmit_code) {
                return payload.transmit_code;
            }

            // If the task itself reports an error (e.g., Wallet not found), stop polling
            if (payload?.status === "error") {
                console.error(`RAIDA Task reported internal error: ${payload.message || 'Unknown error'}`);
                break;
            }
        } catch (err) {
            console.error(`Polling attempt ${i+1} failed to connect:`, err.message);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
}

// --- 4. Main API Endpoint ---
app.post('/api/generate-mailbox', async (req, res) => {
    const { firstName, lastName, amountPaid } = req.body;
    let lockerKey = "DY6-UYDM"; // Safety Fallback

    console.log(`>>> Processing Registration: ${firstName} ${lastName} ($${amountPaid})`);

    try {
        // Step A: Request Task ID with required JSON body (amount/name)
        console.log("Contacting RAIDA Locker at 127.0.0.1:8006...");
        const lockerResponse = await axios.post(
            'http://127.0.0.1:8006/api/v1/locker', 
            { 
                amount: amountPaid || 10, 
                name: `${firstName} ${lastName}` 
            }, 
            { 
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000 
            }
        );
        
        // FIXED: Accessing 'id' from payload as confirmed by your curl
        if (lockerResponse.data.status === "success" && lockerResponse.data.payload?.id) {
            const taskId = lockerResponse.data.payload.id;
            console.log(`Task ID [${taskId}] created. Waiting for transmit_code...`);

            // Step B: Poll for the result
            const resultKey = await pollLockerKey(taskId);
            if (resultKey) {
                lockerKey = resultKey;
                console.log("Real LockerKey obtained successfully.");
            } else {
                console.warn("Could not retrieve real key. Proceeding with fallback.");
            }
        }
    } catch (error) {
        console.error("RAIDA Connection failed:", error.message);
    }

    // Step C: Logic for Class and Serial
    let amountClass = 'bit';
    if (amountPaid >= 1000) amountClass = 'giga';
    else if (amountPaid >= 100) amountClass = 'mega';
    else if (amountPaid >= 50) amountClass = 'kilo';
    else if (amountPaid >= 20) amountClass = 'byte';

    const rawSerial = "12345"; 
    const customSerial = convertToCustomBase32(rawSerial);

    // Step D: Construct .ini
    const iniContent = 
        `LockerKey=${lockerKey}\r\n` +
        `SerialNumber=${customSerial}\r\n` +
        `FirstName=${firstName}\r\n` +
        `LastName=${lastName}\r\n` +
        `Description=QMail Purchase\r\n` +
        `InboxFee=10\r\n` +
        `Class=${amountClass}`;

    // Step E: URL-Safe Base64
    const b64Code = Buffer.from(iniContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // Step F: Write to Log File
    try {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const logEntry = `${timestamp}, ${lastName}, ${firstName}, ${lockerKey}, ${b64Code}\n`;
        fs.appendFileSync(path.join(__dirname, 'SoldCoins.txt'), logEntry);
    } catch (fsErr) {
        console.error("Failed to write to SoldCoins.txt:", fsErr.message);
    }

    // Response for Frontend (provides both keys for compatibility)
    res.json({ 
        success: true, 
        mailboxToken: b64Code,
        mailboxCode: b64Code 
    });
});

// --- 5. Frontend & Routing ---
// Serve the built React files
app.use(express.static(path.join(__dirname, 'dist')));

// FIXED: Using '/*' for modern Express/PM2 to prevent PathError
app.get('/*', (req, res) => {
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