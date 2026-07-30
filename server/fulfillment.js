// Locker-key inventory and order fulfillment for the DMS store.
//
// Delivery model (replaces the preconfigured wallet zips on /register):
// each QMail address is delivered as a LOCKER KEY. The locker holds exactly
// one coin whose denomination defines the address class; the coin's serial
// number IS the address (canonical dotted-serial@class). Serial numbers are
// captured at mint time from put-one-coin's response and stored in the pool
// file, because /locker/peek only reports aggregate totals, never serials.
//
// Pool files (git-ignored, one line per unissued key):
//   inventory/address-keys-<class>.txt   lockerKey,serial,mintedAt
//   inventory/bonus-keys.txt             lockerKey,mintedAt      (200 CC each)
// Consuming a key is fully synchronous (read + rewrite via temp file), so
// concurrent requests cannot hand the same key to two buyers.
//
// All coins are funded from the Core wallet at FUNDING_WALLET_PATH.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const { withPoolFileLock } = require('./locks');

const CORE_API = 'http://localhost:8080';
const FUNDING_WALLET = process.env.FUNDING_WALLET_PATH || '/opt/raidax/Client_Data/Wallets/Default';

// Class -> price and the single coin denomination that defines the class.
// (An "epic" class of 100,000 exists but is never sold through the website.)
const CLASSES = {
    bit:  { priceUSD: 10,   denomination: 1     },
    byte: { priceUSD: 20,   denomination: 10    },
    kilo: { priceUSD: 50,   denomination: 100   },
    mega: { priceUSD: 100,  denomination: 1000  },
    giga: { priceUSD: 1000, denomination: 10000 }
};

const BONUS_COIN_AMOUNT = 200;   // CC per bonus locker, one bonus per address

const INVENTORY_DIR = path.join(__dirname, 'inventory');
const POOL_LOCK_PATH = path.join(INVENTORY_DIR, '.pool.lock');
const BONUS_POOL_PATH = path.join(INVENTORY_DIR, 'bonus-keys.txt');

// Serializes every pool-file mutation (rewrite on consume, append on mint)
// across BOTH the server process and a concurrently run mint-pools.js, so a
// rename-vs-append race can never silently drop a freshly minted key.
function withPoolLock(fn) {
    return withPoolFileLock(POOL_LOCK_PATH, fn);
}
const ISSUED_LOG_PATH = path.join(INVENTORY_DIR, 'issued-keys.csv');
const ISSUED_HEADERS = 'Timestamp,OrderID,FirstName,LastName,Qmail,Class,LockerKey,Serial,BonusLockerKey';
const WARNINGS_PATH = path.join(INVENTORY_DIR, 'inventory_warnings.json');

const LOW_STOCK_THRESHOLD = 3;
const LOW_BALANCE_THRESHOLD = parseInt(process.env.WALLET_LOW_BALANCE_THRESHOLD || '25000', 10);
const WARNING_INTERVAL_MS = 24 * 60 * 60 * 1000;
const ALERT_EMAIL = 'sean@raidatech.com';
const MINT_RETRIES = 3;

// index.js injects its sendEmail (SMTP with sendmail fallback) at startup
let sendEmail = (to, subject, body) => {
    console.warn(`Email not wired up - dropping alert "${subject}"`);
};

function init(deps) {
    if (deps && deps.sendEmail) sendEmail = deps.sendEmail;
    fs.mkdirSync(INVENTORY_DIR, { recursive: true });
}

// --- Locker key generation (base32 XXX-XXXX, same alphabet as the rest of the site) ---

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function genLockerKey() {
    const c = () => ALPHABET[crypto.randomInt(ALPHABET.length)];
    return `${c()}${c()}${c()}-${c()}${c()}${c()}${c()}`;
}

// --- Pool file primitives ---

function poolPath(className) {
    return path.join(INVENTORY_DIR, `address-keys-${className}.txt`);
}

function readPoolLines(file) {
    try {
        return fs.readFileSync(file, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
    } catch {
        return [];
    }
}

// Rewrite through a temp file so a crash mid-write cannot corrupt the pool
function writePoolLines(file, lines) {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, lines.length ? lines.join('\n') + '\n' : '');
    fs.renameSync(tmp, file);
}

// Takes the oldest key out of a class pool. Returns { lockerKey, serial }
// or null when the pool is empty. Synchronous on purpose: no await between
// read and rewrite means two requests can never receive the same line.
function consumeAddressKey(className) {
    const file = poolPath(className);
    return withPoolLock(() => {
        while (true) {
            const lines = readPoolLines(file);
            if (lines.length === 0) return null;
            const [lockerKey, serialStr] = lines[0].split(',');
            writePoolLines(file, lines.slice(1));
            const serial = parseInt(serialStr, 10);
            if (lockerKey && Number.isSafeInteger(serial) && serial > 0) {
                return { lockerKey, serial };
            }
            console.error(`Corrupt line skipped in ${file}: "${lines[0]}"`);
        }
    });
}

function consumeBonusKey() {
    return withPoolLock(() => {
        while (true) {
            const lines = readPoolLines(BONUS_POOL_PATH);
            if (lines.length === 0) return null;
            const [lockerKey] = lines[0].split(',');
            writePoolLines(BONUS_POOL_PATH, lines.slice(1));
            if (lockerKey) return lockerKey;
            console.error(`Corrupt line skipped in ${BONUS_POOL_PATH}: "${lines[0]}"`);
        }
    });
}

function stockCounts() {
    const counts = {};
    for (const className of Object.keys(CLASSES)) {
        counts[className] = readPoolLines(poolPath(className)).length;
    }
    counts.bonus = readPoolLines(BONUS_POOL_PATH).length;
    return counts;
}

// --- Minting (Core API on localhost:8080) ---

// Uploads exactly one coin of the class's denomination into a fresh locker.
// put-one-coin (not plain upload) because its response includes the coin's
// serial number - the only place we can ever learn it.
async function mintAddressKey(className) {
    const cls = CLASSES[className];
    if (!cls) throw new Error(`Unknown class "${className}"`);

    const lockerKey = genLockerKey();
    const resp = await axios.get(`${CORE_API}/api/transactions/locker/put-one-coin`, {
        params: {
            locker_key: lockerKey,
            denomination: cls.denomination,
            wallet_path: FUNDING_WALLET
        },
        timeout: 60000
    });

    const data = resp.data;
    if (data.status !== 'success' || !data.serial_number) {
        throw new Error(`put-one-coin failed for ${className}: ${data.message || JSON.stringify(data)}`);
    }
    return { lockerKey, serial: data.serial_number };
}

async function mintAndPoolAddressKey(className) {
    // Mint (network) OUTSIDE the file lock; only the append is inside it.
    const minted = await mintAddressKey(className);
    withPoolLock(() => fs.appendFileSync(
        poolPath(className),
        `${minted.lockerKey},${minted.serial},${new Date().toISOString()}\n`
    ));
    console.log(`Minted ${className} address key ${minted.lockerKey} (serial ${minted.serial})`);
    return minted;
}

// Amount mode: coins totaling `amount` CC picked greedily from the funding
// wallet into a fresh locker. Used for bonus lockers and subscription top-ups.
async function mintAmountLocker(amount) {
    const lockerKey = genLockerKey();
    const resp = await axios.get(`${CORE_API}/api/transactions/locker/upload`, {
        params: {
            locker_key: lockerKey,
            amount: amount,
            wallet_path: FUNDING_WALLET
        },
        timeout: 60000
    });

    if (resp.data.status !== 'success') {
        throw new Error(`Locker upload of ${amount} CC failed: ${resp.data.message || JSON.stringify(resp.data)}`);
    }
    return lockerKey;
}

async function mintBonusKey() {
    return mintAmountLocker(BONUS_COIN_AMOUNT);
}

async function mintAndPoolBonusKey() {
    const lockerKey = await mintBonusKey();
    withPoolLock(() => fs.appendFileSync(BONUS_POOL_PATH, `${lockerKey},${new Date().toISOString()}\n`));
    console.log(`Minted bonus key ${lockerKey} (${BONUS_COIN_AMOUNT} CC)`);
    return lockerKey;
}

// The QMail address IS the coin's identity: serial as dot-separated base-256
// bytes, @, the class. Kept in sync with canonicalAddress() in index.js.
function canonicalAddress(serialNumber, denominationClass) {
    let n = serialNumber;
    const bytes = [];
    while (n > 0) { bytes.unshift(n % 256); n = Math.floor(n / 256); }
    if (bytes.length === 0) bytes.push(0);
    return `${bytes.join('.')}@${denominationClass}`;
}

// Issues one address: consumes a pooled key (its serial is the address),
// attaches a 200 CC bonus locker, and records it in the issued ledger.
// Throws if no address key can be obtained; a missing bonus is non-fatal.
async function issueAddressUnit(className, buyer, orderID) {
    const key = await getAddressKey(className);
    let bonusLockerKey = null;
    try {
        bonusLockerKey = await getBonusKey();
    } catch (err) {
        console.error(`Bonus key unavailable (${className} unit):`, err.message);
    }
    const qmail = canonicalAddress(key.serial, className);
    logIssued({
        orderID: orderID || '',
        firstName: buyer.firstName, lastName: buyer.lastName,
        qmail, class: className, lockerKey: key.lockerKey,
        serial: key.serial, bonusLockerKey: bonusLockerKey || ''
    });
    return { qmail, class: className, lockerKey: key.lockerKey, serial: key.serial, bonusLockerKey };
}

// --- Fulfillment: pool first, live mint as fallback ---

async function getAddressKey(className) {
    const fromPool = consumeAddressKey(className);
    if (fromPool) return fromPool;
    console.warn(`Pool empty for "${className}" - minting live during checkout.`);
    return mintAddressKey(className);
}

async function getBonusKey() {
    const fromPool = consumeBonusKey();
    if (fromPool) return fromPool;
    console.warn('Bonus pool empty - minting live during checkout.');
    return mintBonusKey();
}

// --- Issued ledger (replaces users.csv as the buyer/address record) ---

function csvEscape(field) {
    const str = String(field == null ? '' : field).replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
}

function logIssued(entry) {
    try {
        if (!fs.existsSync(ISSUED_LOG_PATH)) {
            fs.writeFileSync(ISSUED_LOG_PATH, ISSUED_HEADERS + '\n');
        }
        const row = [
            new Date().toISOString(),
            entry.orderID, entry.firstName, entry.lastName,
            entry.qmail, entry.class, entry.lockerKey, entry.serial, entry.bonusLockerKey
        ].map(csvEscape).join(',') + '\n';
        fs.appendFileSync(ISSUED_LOG_PATH, row);
    } catch (err) {
        console.error('Failed to write issued-keys.csv:', err.message);
    }
}

// Strips the buyer's name from every issued-ledger row for a qmail address.
// (The "Go Anonymous" button; users.csv is no longer written for new sales.)
function anonymizeIssued(qmail) {
    try {
        if (!fs.existsSync(ISSUED_LOG_PATH)) return false;
        const lines = fs.readFileSync(ISSUED_LOG_PATH, 'utf8').split('\n');
        let found = false;
        const updated = lines.map((line, i) => {
            if (i === 0 || !line.trim()) return line;
            const cols = line.split(',');
            // Qmail is column 4 and never contains commas or quotes
            if (cols[4] === qmail || cols[4] === `"${qmail}"`) {
                found = true;
                cols[2] = '';
                cols[3] = '';
                return cols.join(',');
            }
            return line;
        });
        if (found) fs.writeFileSync(ISSUED_LOG_PATH, updated.join('\n'));
        return found;
    } catch (err) {
        console.error('Failed to anonymize issued ledger:', err.message);
        return false;
    }
}

// --- Replenishment & alerts ---

async function replenishPool(className, count) {
    for (let i = 0; i < count; i++) {
        let lastErr = null;
        for (let attempt = 1; attempt <= MINT_RETRIES; attempt++) {
            try {
                await mintAndPoolAddressKey(className);
                lastErr = null;
                break;
            } catch (err) {
                lastErr = err;
                console.error(`Replenish ${className} attempt ${attempt}/${MINT_RETRIES} failed: ${err.message}`);
                await new Promise(r => setTimeout(r, attempt * 5000));
            }
        }
        if (lastErr) {
            console.error(`GIVING UP replenishing ${className} (${count - i} short) - will retry on next sale or stock check.`);
            return;
        }
    }
}

async function replenishBonusPool(count) {
    for (let i = 0; i < count; i++) {
        let lastErr = null;
        for (let attempt = 1; attempt <= MINT_RETRIES; attempt++) {
            try {
                await mintAndPoolBonusKey();
                lastErr = null;
                break;
            } catch (err) {
                lastErr = err;
                console.error(`Replenish bonus attempt ${attempt}/${MINT_RETRIES} failed: ${err.message}`);
                await new Promise(r => setTimeout(r, attempt * 5000));
            }
        }
        if (lastErr) {
            console.error(`GIVING UP replenishing bonus pool (${count - i} short).`);
            return;
        }
    }
}

// At most one email per pool per day, state kept in inventory_warnings.json
function throttledAlert(key, subject, body) {
    let warnings = {};
    try { warnings = JSON.parse(fs.readFileSync(WARNINGS_PATH, 'utf8')); } catch {}
    if (Date.now() - (warnings[key] || 0) < WARNING_INTERVAL_MS) return;
    warnings[key] = Date.now();
    try { fs.writeFileSync(WARNINGS_PATH, JSON.stringify(warnings, null, 2)); }
    catch (err) { console.error('Failed to save alert state:', err.message); }
    sendEmail(ALERT_EMAIL, subject, body);
}

function checkPoolStock() {
    const counts = stockCounts();
    const summary = Object.entries(counts).map(([k, v]) => `  ${k}: ${v}`).join('\n');

    for (const [pool, remaining] of Object.entries(counts)) {
        if (remaining > LOW_STOCK_THRESHOLD) continue;
        const subject = remaining === 0
            ? `URGENT: DMS "${pool}" locker-key pool is EMPTY`
            : `Warning: DMS "${pool}" locker-key pool low (${remaining} left)`;
        const body =
            `The pre-minted locker-key pool "${pool}" is ${remaining === 0 ? 'EMPTY' : 'running low'}.\n\n` +
            `Keys remaining per pool:\n${summary}\n\n` +
            `The server auto-replenishes after each sale; a low pool usually means the\n` +
            `Core API (localhost:8080) is failing or the funding wallet is short of coins.\n` +
            `Refill manually with: node server/mint-pools.js\n\n` +
            (remaining === 0 ? `Buyers hit live minting during checkout while this pool is empty.\n\n` : '') +
            `Sent by distributedmailsystem.com server (${new Date().toISOString()})`;
        throttledAlert(`pool:${pool}`, subject, body);
    }
}

// Emails Sean when the funding wallet can no longer cover upcoming mints.
// A single giga key costs 10,000 CC, so the default floor is 25,000.
async function checkFundingWalletBalance() {
    try {
        const resp = await axios.get(`${CORE_API}/api/wallets/balance`, {
            params: { wallet_path: FUNDING_WALLET },
            timeout: 30000
        });
        const data = resp.data;
        if (!data.success) throw new Error(data.message || 'balance call unsuccessful');

        if (data.total_value < LOW_BALANCE_THRESHOLD) {
            throttledAlert('wallet-balance',
                `Warning: DMS funding wallet down to ${data.total_value} CC`,
                `The Core wallet that funds address coins and bonus lockers is low.\n\n` +
                `Wallet: ${FUNDING_WALLET}\n` +
                `Balance: ${data.total_value} CC (${data.total_notes} notes)\n` +
                `Alert threshold: ${LOW_BALANCE_THRESHOLD} CC\n\n` +
                `A giga address consumes a 10,000 CC coin and every sold address ships a\n` +
                `${BONUS_COIN_AMOUNT} CC bonus locker. Please top the wallet up.\n\n` +
                `Sent by distributedmailsystem.com server (${new Date().toISOString()})`);
        }
        return data.total_value;
    } catch (err) {
        console.error('Funding wallet balance check failed:', err.message);
        return null;
    }
}

// Fire-and-forget after an order: replace exactly what was consumed, then
// run the stock and balance health checks.
function scheduleReplenish(consumedByClass, bonusCount) {
    setImmediate(async () => {
        try {
            for (const [className, count] of Object.entries(consumedByClass)) {
                if (count > 0) await replenishPool(className, count);
            }
            if (bonusCount > 0) await replenishBonusPool(bonusCount);
        } catch (err) {
            console.error('Background replenish failed:', err.message);
        }
        checkPoolStock();
        await checkFundingWalletBalance();
    });
}

// Pure funding-wallet balance read for the admin dashboard: returns
// { balance, notes } or null on error. Unlike checkFundingWalletBalance it
// never sends alert email, so it is safe to call on every dashboard view.
async function fundingBalance() {
    try {
        const resp = await axios.get(`${CORE_API}/api/wallets/balance`, {
            params: { wallet_path: FUNDING_WALLET },
            timeout: 30000
        });
        const data = resp.data;
        if (!data || !data.success) return null;
        return { balance: data.total_value, notes: data.total_notes };
    } catch (err) {
        console.error('fundingBalance read failed:', err.message);
        return null;
    }
}

// Summary of the issued-keys ledger for the admin dashboard:
// { total, byClass: {bit,...}, lastIssuedAt }. Reads the append-only CSV.
function issuedSummary() {
    try {
        if (!fs.existsSync(ISSUED_LOG_PATH)) return { total: 0, byClass: {}, lastIssuedAt: null };
        const lines = fs.readFileSync(ISSUED_LOG_PATH, 'utf8').trim().split('\n').slice(1).filter(Boolean);
        const byClass = {};
        let lastIssuedAt = null;
        for (const line of lines) {
            const cols = line.split(',');
            const cls = (cols[5] || '').replace(/"/g, '').trim();
            if (cls) byClass[cls] = (byClass[cls] || 0) + 1;
            const ts = (cols[0] || '').replace(/"/g, '').trim();
            if (ts) lastIssuedAt = ts; // append-only, so the last row is newest
        }
        return { total: lines.length, byClass, lastIssuedAt };
    } catch (err) {
        console.error('issuedSummary failed:', err.message);
        return { total: 0, byClass: {}, lastIssuedAt: null };
    }
}

module.exports = {
    CLASSES,
    BONUS_COIN_AMOUNT,
    FUNDING_WALLET,
    init,
    genLockerKey,
    stockCounts,
    fundingBalance,
    issuedSummary,
    canonicalAddress,
    issueAddressUnit,
    getAddressKey,
    getBonusKey,
    logIssued,
    anonymizeIssued,
    mintAmountLocker,
    mintAndPoolAddressKey,
    mintAndPoolBonusKey,
    replenishPool,
    replenishBonusPool,
    scheduleReplenish,
    checkPoolStock,
    checkFundingWalletBalance
};
