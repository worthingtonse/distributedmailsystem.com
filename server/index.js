// 1. Load environment variables
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. Custom Base32 Conversion ---
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

// --- 2. Helper for Polling RAIDA Task ---
async function pollLockerKey(taskId) {
    const maxAttempts = 5;
    const delay = 1000; // 1 second between checks

    for (let i = 0; i < maxAttempts; i++) {
        try {
            // Adjust this URL to match your exact Task ID API endpoint
            const response = await axios.get(`http://localhost:8006/api/v1/task?id=${taskId}`);
            if (response.data.status === "success" && response.data.key) {
                return response.data.key;
            }
        } catch (err) {
            console.error("Polling attempt failed:", err.message);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
}

// --- 3. API Endpoint to Generate Mailbox Token ---
// Changed to /api/generate-mailbox to match your RegisterAddress.jsx
app.post('/api/generate-mailbox', async (req, res) => {
    const { firstName, lastName, amountPaid } = req.body;
    let lockerKey = "DY6-UYDM"; // Fallback key

    try {
        // Step A: Request Task ID from RAIDA
        const initialResponse = await axios.get('http://localhost:8006/api/v1/lockerkey', { timeout: 2000 });
        
        if (initialResponse.data.status === "success" && initialResponse.data.task_id) {
            // Step B: Poll for the actual key using the Task ID
            const resultKey = await pollLockerKey(initialResponse.data.task_id);
            if (resultKey) lockerKey = resultKey;
        }
    } catch (error) {
        console.warn("RAIDA service error. Using fallback key:", lockerKey);
    }

    // Step C: Determine Class based on amount paid
    let amountClass = 'bit';
    if (amountPaid >= 1000) amountClass = 'giga';
    else if (amountPaid >= 100) amountClass = 'mega';
    else if (amountPaid >= 50) amountClass = 'kilo';
    else if (amountPaid >= 20) amountClass = 'byte';

    // Step D: Placeholder Serial Logic
    const rawSerial = "12345"; 
    const customSerial = convertToCustomBase32(rawSerial);

    // Step E: Construct .ini string
    const iniContent = 
        `LockerKey=${lockerKey}\r\n` +
        `SerialNumber=${customSerial}\r\n` +
        `FirstName=${firstName}\r\n` +
        `LastName=${lastName}\r\n` +
        `Description=QMail Purchase\r\n` +
        `InboxFee=10\r\n` +
        `Class=${amountClass}`;

    // Step F: Encode to URL-Safe Base64
    const b64Code = Buffer.from(iniContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // Step G: Log to SoldCoins.txt
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 22);
    const logEntry = `${timestamp}, ${lastName}, ${firstName}, ${lockerKey}, ${b64Code}\n`;
    fs.appendFileSync(path.join(__dirname, 'SoldCoins.txt'), logEntry);

    res.json({ success: true, mailboxToken: b64Code });
});

// --- 4. Bundle Settings ---
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*all', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});