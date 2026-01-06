const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. Custom Base32 Conversion (from Sean's Python script) ---
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

// --- 2. API Endpoint to Generate Mailbox Token ---
app.post('/api/generate-mailbox-code', async (req, res) => {
    const { firstName, lastName, amountPaid } = req.body;
    let lockerKey = "DY6-UYDM"; // Default fallback key from Sean's list

    try {
        // Step A: Attempt to get Locker Key from local RAIDA service (Port 8006)
        // We use the v1 prefix as confirmed by your 'info' call
        const lockerResponse = await axios.get('http://localhost:8006/api/v1/lockerkey', { timeout: 2000 });
        
        if (lockerResponse.data.status === "success") {
            lockerKey = lockerResponse.data.payload?.key || lockerResponse.data.key;
        }
    } catch (error) {
        console.warn("RAIDA LockerKey service 4153/Error. Using development fallback key:", lockerKey);
    }

    // Step B: Determine Class based on amount paid (Match Sean's Python logic)
    let amountClass = 'bit';
    if (amountPaid >= 1000) amountClass = 'giga';
    else if (amountPaid >= 100) amountClass = 'mega';
    else if (amountPaid >= 50) amountClass = 'kilo';
    else if (amountPaid >= 20) amountClass = 'byte';

    // Step C: Placeholder for Serial Number logic
    // The Python script scans /var/cc/; until that is mapped, we use a test serial
    const rawSerial = "12345"; 
    const customSerial = convertToCustomBase32(rawSerial);

    // Step D: Construct .ini string (Windows \r\n endings required by QMail)
    const iniContent = 
        `LockerKey=${lockerKey}\r\n` +
        `SerialNumber=${customSerial}\r\n` +
        `FirstName=${firstName}\r\n` +
        `LastName=${lastName}\r\n` +
        `Description=QMail Purchase\r\n` +
        `InboxFee=10\r\n` +
        `Class=${amountClass}`;

    // Step E: Encode to URL-Safe Base64
    const b64Code = Buffer.from(iniContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // Step F: Log the sale to SoldCoins.txt
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 22);
    const logEntry = `${timestamp}, ${lastName}, ${firstName}, ${lockerKey}, ${b64Code}\n`;
    fs.appendFileSync(path.join(__dirname, 'SoldCoins.txt'), logEntry);

    res.json({ success: true, mailboxToken: b64Code });
});

// --- 3. Bundle Settings (Serve React Frontend) ---

// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// The "Catch-All" route: handles React Router paths (like /success or /register)
// Using '*all' to avoid the PathError in newer path-to-regexp versions
app.get('*all', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Backend Bridge active with RAIDA Fallback support.`);
});