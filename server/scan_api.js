const axios = require('axios');

const BASE_URL = 'http://localhost:8006';
const PREFIXES = ['/api/v1', '/api', '/v1', ''];
const ENDPOINTS = [
    'lockerkey',
    'locker_key',
    'getlockerkey',
    'get_locker_key',
    'generate/lockerkey',
    'cloudcoin/lockerkey',
    'vault/lockerkey',
    'mailbox/lockerkey',
    'generate_locker_key',
    'mailbox_code'
];

async function scan() {
    console.log(`--- Starting API Scan on ${BASE_URL} ---`);
    console.log(`Checking combinations of prefixes and endpoints...\n`);

    for (const prefix of PREFIXES) {
        for (const endpoint of ENDPOINTS) {
            const url = `${BASE_URL}${prefix}/${endpoint}`;
            
            try {
                // We use a timeout so it doesn't hang on broken routes
                const response = await axios.get(url, { timeout: 2000 });
                
                console.log(`[FOUND!] ✅ ${url}`);
                console.log(`   Response Data:`, JSON.stringify(response.data).substring(0, 100));
            } catch (error) {
                if (error.response) {
                    // Server responded with a status code (e.g., 404, 4153)
                    if (error.response.status !== 404 && error.response.data?.payload?.code !== 4153) {
                        console.log(`[INTERESTING] 🔍 ${url} (Status: ${error.response.status})`);
                        console.log(`   Message: ${error.response.data?.payload?.message || 'No message'}`);
                    }
                } else if (error.code === 'ECONNREFUSED') {
                    console.error(`ERROR: Cannot connect to ${BASE_URL}. Is CloudCoin Desktop running?`);
                    return;
                }
                // Silently skip standard 404s/4153s to keep the log clean
            }
        }
    }

    console.log(`\n--- Scan Complete ---`);
    console.log(`If nothing was "FOUND", the service is likely disabled in your Desktop settings.`);
}

scan();