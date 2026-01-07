require('dotenv').config(); // Load PORT and other variables from .env

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// Global logger to see every request hitting the server
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
        return "ERROR_INVALID_SERIAL";
    }
}

// --- 3. Polling Helper for RAIDA transmit_code ---
async function pollLockerKey(taskId) {
    const maxAttempts = 15; 
    const delay = 1000; 

    for (let i = 0; i < maxAttempts; i++) {
        try {
            // Using the plural 'tasks' endpoint as per your requirement
            const response = await axios.get(`http://localhost:8006/api/v1/tasks?id=${taskId}`);
            
            // Check for 'transmit_code' inside the payload as per your screenshot
            if (response.data.status === "success" && response.data.payload?.transmit_code) {
                console.log(`LockerKey retrieved: ${response.data.payload.transmit_code}`);
                return response.data.payload.transmit_code;
            }
        } catch (err) {
            console.error(`Polling task ${taskId} attempt ${i+1} failed:`, err.message);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
}

// --- 4. API Endpoint: Generate Mailbox Token ---
app.post('/api/generate-mailbox', async (req, res) => {
    const { firstName, lastName, amountPaid } = req.body;
    let lockerKey = "DY6-UYDM"; // Fallback key

    console.log(`>>> Processing Registration for: ${firstName} ${lastName} ($${amountPaid})`);

    try {
        // Step A: Request Task ID from RAIDA Locker
        console.log("Connecting to RAIDA Locker at http://localhost:8006/api/v1/locker...");
        const lockerResponse = await axios.post('http://localhost:8006/api/v1/locker', {}, { timeout: 5000 });
        
        if (lockerResponse.data.status === "success" && lockerResponse.data.payload?.task_id) {
            const taskId = lockerResponse.data.payload.task_id;
            console.log(`Task ID [${taskId}] received. Polling RAIDA...`);

            // Step B: Poll for the transmit_code
            const resultKey = await pollLockerKey(taskId);
            if (resultKey) {
                lockerKey = resultKey;
            } else {
                console.warn("RAIDA polling timed out. Using fallback key.");
            }
        } else {
            console.error("RAIDA did not return a valid Task ID.");
        }
    } catch (error) {
        console.error("RAIDA Communication Error:", error.message);
        console.log("Proceeding with fallback LockerKey.");
    }

    // Step C: Determine Class based on payment tier
    let amountClass = 'bit';
    if (amountPaid >= 1000) amountClass = 'giga';
    else if (amountPaid >= 100) amountClass = 'mega';
    else if (amountPaid >= 50) amountClass = 'kilo';
    else if (amountPaid >= 20) amountClass = 'byte';

    const rawSerial = "12345"; 
    const customSerial = convertToCustomBase32(rawSerial);

    // Step D: Construct .ini content
    const iniContent = 
        `LockerKey=${lockerKey}\r\n` +
        `SerialNumber=${customSerial}\r\n` +
        `FirstName=${firstName}\r\n` +
        `LastName=${lastName}\r\n` +
        `Description=QMail Purchase\r\n` +
        `InboxFee=10\r\n` +
        `Class=${amountClass}`;

    // Step E: URL-Safe Base64 Encoding
    const b64Code = Buffer.from(iniContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // Step F: Write to SoldCoins.txt
    try {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 22);
        const logEntry = `${timestamp}, ${lastName}, ${firstName}, ${lockerKey}, ${b64Code}\n`;
        fs.appendFileSync(path.join(__dirname, 'SoldCoins.txt'), logEntry);
        console.log("Transaction successfully logged to SoldCoins.txt");
    } catch (fsError) {
        console.error("File System Error (SoldCoins.txt):", fsError.message);
    }

    // Return the token to the frontend
    res.json({ 
        success: true, 
        mailboxToken: b64Code,
        mailboxCode: b64Code // Providing both names for compatibility
    });
});

// --- 5. Static Files & Routing ---
// Serve the React build files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback: Send all non-API requests to index.html for React Router
app.get('*all', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- 6. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Backend fully operational. Checking local RAIDA on 8006...`);
});