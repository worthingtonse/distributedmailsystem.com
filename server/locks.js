// Concurrency primitives for the single-process Express server plus the
// separate mint-pools.js CLI.
//
// withLock(key, fn): in-process keyed async mutex. Serializes async critical
//   sections that share a key (e.g. one PayPal order ID, one subscription
//   sale ID) so check-then-act sequences spanning awaited API calls cannot
//   interleave. Same-process only.
//
// withPoolFileLock(fn): cross-process advisory lock via an exclusive lock
//   file. Guards pool-file mutations so the live server and a concurrently
//   run `node server/mint-pools.js` cannot clobber each other's writes. fn
//   MUST be synchronous (no awaits) - the lock is held across the whole call.

const fs = require('fs');

// --- In-process keyed async mutex ---

const tails = new Map();

async function withLock(key, fn) {
    const prev = tails.get(key) || Promise.resolve();
    let release;
    const mine = new Promise(res => { release = res; });
    tails.set(key, mine);

    // Wait for whoever is ahead of us in this key's queue.
    await prev.catch(() => {});
    try {
        return await fn();
    } finally {
        release();
        // If nobody queued behind us, forget the key so the map can't grow
        // without bound.
        if (tails.get(key) === mine) tails.delete(key);
    }
}

// --- Cross-process file lock ---

function sleepMs(ms) {
    // Synchronous sleep so the lock can be held across sync fs ops without
    // yielding the event loop to another async critical section.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function withPoolFileLock(lockPath, fn) {
    let fd;
    const STALE_MS = 30000;
    for (let i = 0; i < 4000; i++) {   // ~ up to ~20s of 5ms spins
        try {
            fd = fs.openSync(lockPath, 'wx');
            break;
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
            // Break a stale lock left by a crashed process
            try {
                const st = fs.statSync(lockPath);
                if (Date.now() - st.mtimeMs > STALE_MS) {
                    fs.unlinkSync(lockPath);
                    continue;
                }
            } catch { /* lock vanished; retry immediately */ }
            sleepMs(5);
        }
    }
    if (fd === undefined) {
        throw new Error(`Could not acquire pool file lock at ${lockPath}`);
    }
    try {
        return fn();
    } finally {
        try { fs.closeSync(fd); } catch {}
        try { fs.unlinkSync(lockPath); } catch {}
    }
}

module.exports = { withLock, withPoolFileLock };
