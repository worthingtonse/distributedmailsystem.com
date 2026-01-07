require('dotenv').config(); // Load PORT from .env

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

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

// --- 2. Corrected Polling Helper ---
async function pollLockerKey(taskId) {
    const maxAttempts = 15; // Increased attempts for safety
    const delay = 1000; 

    for (let i = 0; i < maxAttempts; i++) {
        try {
            // Corrected plural tasks endpoint
            const response = await axios.get(`http://localhost:8006/api/v1/tasks?id=${taskId}`);
            
            // Per your screenshot, we look for 'transmit_code' inside the payload
            if (response.data.status === "success" && response.data.payload?.transmit_code) {
                console.log(`LockerKey found: ${response.data.payload.transmit_code}`);
                return response.data.payload.transmit_code;
            }
        } catch (err) {
            console.error(`Polling task ${taskId} attempt ${i+1} failed:`, err.message);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
}

// --- 3. API Endpoint to Generate Mailbox Token ---
app.post('/api/generate-mailbox', async (req, res) => {
    const { firstName, lastName, amountPaid } = req.body;
    let lockerKey = "DY6-UYDM"; // Fallback

    try {
        // Step A: POST to /api/v1/locker
        const lockerResponse = await axios.post('http://localhost:8006/api/v1/locker', {}, { timeout: 3000 });
        
        if (lockerResponse.data.status === "success" && lockerResponse.data.payload?.task_id) {
            const taskId = lockerResponse.data.payload.task_id;
            
            // Step B: Poll for the transmit_code
            const resultKey = await pollLockerKey(taskId);
            if (resultKey) {
                lockerKey = resultKey;
            }
        }
    } catch (error) {
        console.warn("RAIDA Error. Using fallback key:", lockerKey);
    }

    // Step C: Determine Class
    let amountClass = 'bit';
    if (amountPaid >= 1000) amountClass = 'giga';
    else if (amountPaid >= 100) amountClass = 'mega';
    else if (amountPaid >= 50) amountClass = 'kilo';
    else if (amountPaid >= 20) amountClass = 'byte';

    const rawSerial = "12345"; 
    const customSerial = convertToCustomBase32(rawSerial);

    // Step D: Construct .ini string
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

    // Step F: Log the sale
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 22);
    const logEntry = `${timestamp}, ${lastName}, ${firstName}, ${lockerKey}, ${b64Code}\n`;
    fs.appendFileSync(path.join(__dirname, 'SoldCoins.txt'), logEntry);

    res.json({ success: true, mailboxToken: b64Code });
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*all', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});