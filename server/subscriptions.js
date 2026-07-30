// Monthly CloudCoin subscriptions: subscriber ledger, PayPal webhook
// handling, and monthly top-up delivery.
//
// Flow: the /subscribe page creates a PayPal subscription in the browser and
// then POSTs it here (recordSubscription). Each month PayPal calls our
// webhook with PAYMENT.SALE.COMPLETED; we mint one locker per address (the
// month's coins divided across the subscriber's addresses), send each key in
// a QMail message to its address, and email all keys to the backup address.
//
// Data files (git-ignored):
//   subscriptions.json        subscriptionID -> { planKey, addresses, backupEmail, status, ... }
//   subscription_ledger.json  saleID -> per-cycle fulfillment record (idempotency + retry queue)

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fulfillment = require('./fulfillment');
const { withLock } = require('./locks');

const SUBS_PATH = path.join(__dirname, 'subscriptions.json');
const LEDGER_PATH = path.join(__dirname, 'subscription_ledger.json');

const PLAN_DOLLARS = { casual: 5, typical: 10, power: 20 };
const COINS_PER_DOLLAR = 10;
const MAX_ADDRESSES_PER_SUB = 20;
const QMAIL_ADDRESS_RE = /^\d+(\.\d+)*@(bit|byte|kilo|mega|giga)$/i;

// QMail delivery runs through the local QMail client API (upload_and_tell,
// async with its own Tell retry worker). Off until the server's QMail
// identity is set up and verified - email backup still delivers the keys.
const QMAIL_DELIVERY_ENABLED = process.env.QMAIL_DELIVERY_ENABLED === 'true';
const QMAIL_API_BASE = process.env.QMAIL_API_BASE || 'http://localhost:8081';

// Injected by index.js at startup
let sendEmail = () => { console.warn('subscriptions: mailer not wired up'); };
let paypalEnv = () => ({ base: '', clientId: '', secret: '' });

function init(deps) {
    if (deps && deps.sendEmail) sendEmail = deps.sendEmail;
    if (deps && deps.paypalEnv) paypalEnv = deps.paypalEnv;
}

// --- Small JSON stores (same conventions as the rest of the server) ---

function loadJson(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function saveJson(file, data) {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
}

// --- PayPal helpers ---

async function paypalAccessToken() {
    const env = paypalEnv();
    const resp = await axios.post(
        `${env.base}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
            auth: { username: env.clientId, password: env.secret },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 20000
        }
    );
    return resp.data.access_token;
}

// Confirms the subscription exists at PayPal and is (or is becoming) active.
// Mirrors requireVerifiedPayment's stance: with no client secret configured,
// verification is skipped loudly instead of blocking the store.
async function verifySubscription(subscriptionID) {
    const env = paypalEnv();
    if (!env.secret) {
        console.warn('Subscription verification SKIPPED - no PayPal client secret in .env yet!');
        return { verified: true, skipped: true };
    }
    try {
        const token = await paypalAccessToken();
        const resp = await axios.get(
            `${env.base}/v1/billing/subscriptions/${encodeURIComponent(subscriptionID)}`,
            { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 }
        );
        const status = resp.data.status;
        // Capture what PayPal knows about the payer so a later cancellation can
        // be matched by cardholder name + card last-four. last_digits is only
        // present for card-funded subscriptions (empty for wallet-funded ones).
        const sub = resp.data.subscriber || {};
        const subscriber = {
            name: [sub.name && sub.name.given_name, sub.name && sub.name.surname]
                .filter(Boolean).join(' ').trim(),
            email: sub.email_address || '',
            cardLastDigits: (sub.payment_source && sub.payment_source.card && sub.payment_source.card.last_digits) || ''
        };
        if (['ACTIVE', 'APPROVED', 'APPROVAL_PENDING'].includes(status)) {
            return { verified: true, status, subscriber };
        }
        return { verified: false, reason: `subscription status is ${status}`, subscriber };
    } catch (err) {
        const httpStatus = err.response ? err.response.status : null;
        if (httpStatus === 404) return { verified: false, reason: 'subscription not found at PayPal' };
        return { verified: false, reason: `PayPal API error: ${err.message}` };
    }
}

// Asks PayPal whether a webhook delivery is genuine. Requires
// PAYPAL_WEBHOOK_ID (from the developer dashboard) in .env; without it we
// accept in sandbox mode (loudly) and reject in live mode (fail safe).
async function verifyWebhookSignature(headers, event, sandboxMode) {
    const env = paypalEnv();
    const webhookId = process.env[sandboxMode ? 'PAYPAL_WEBHOOK_ID_SANDBOX' : 'PAYPAL_WEBHOOK_ID_LIVE'];

    if (!webhookId || !env.secret) {
        if (sandboxMode) {
            console.warn('Webhook signature verification SKIPPED (sandbox, PAYPAL_WEBHOOK_ID/secret not set).');
            return true;
        }
        console.error('Webhook REJECTED: PAYPAL_WEBHOOK_ID_LIVE / client secret not configured.');
        return false;
    }

    try {
        const token = await paypalAccessToken();
        const resp = await axios.post(
            `${env.base}/v1/notification/verify-webhook-signature`,
            {
                auth_algo: headers['paypal-auth-algo'],
                cert_url: headers['paypal-cert-url'],
                transmission_id: headers['paypal-transmission-id'],
                transmission_sig: headers['paypal-transmission-sig'],
                transmission_time: headers['paypal-transmission-time'],
                webhook_id: webhookId,
                webhook_event: event
            },
            { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 }
        );
        return resp.data.verification_status === 'SUCCESS';
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return false;
    }
}

// --- Subscription records ---

// First writer wins. A subscription ID appears in the confirmation screen and
// in every monthly backup email, so allowing overwrites would let anyone who
// sees an ID redirect a victim's future deliveries. Re-recording identical
// details is treated as an idempotent success; anything else is refused.
function recordSubscription({ subscriptionID, planKey, addresses, backupEmail = '', allowSubscriptionQmails = true, subscriberName = '', subscriberEmail = '', cardLastDigits = '' }) {
    return withLock(`subrec:${subscriptionID}`, async () => {
        const subs = loadJson(SUBS_PATH);
        const existing = subs[subscriptionID];
        if (existing) {
            const identical =
                existing.planKey === planKey &&
                existing.backupEmail === backupEmail &&
                JSON.stringify(existing.addresses) === JSON.stringify(addresses);
            if (identical) return { ok: true, created: false };
            console.warn(`Refused overwrite of existing subscription ${subscriptionID}.`);
            return { ok: false, conflict: true };
        }
        subs[subscriptionID] = {
            planKey,
            addresses,
            backupEmail,
            allowSubscriptionQmails,
            subscriberName,
            subscriberEmail,
            cardLastDigits,
            status: 'active',
            createdAt: new Date().toISOString(),
            cycles: 0
        };
        saveJson(SUBS_PATH, subs);
        console.log(`Subscription recorded: ${subscriptionID} (${planKey}) -> ${addresses.join(', ')}`);
        return { ok: true, created: true };
    });
}

// Tells PayPal to cancel the subscription at the source (stops all future
// billing). Returns { ok } — a 404/422 means it's already gone, still a success.
async function cancelAtPaypal(subscriptionID, reason = 'Customer requested cancellation') {
    const env = paypalEnv();
    if (!env.secret) {
        console.warn('PayPal cancel SKIPPED - no client secret configured.');
        return { ok: true, skipped: true };
    }
    try {
        const token = await paypalAccessToken();
        await axios.post(
            `${env.base}/v1/billing/subscriptions/${encodeURIComponent(subscriptionID)}/cancel`,
            { reason },
            { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 }
        );
        return { ok: true };
    } catch (err) {
        const httpStatus = err.response ? err.response.status : null;
        // Already cancelled / not found — treat as done rather than an error.
        if (httpStatus === 404 || httpStatus === 422) return { ok: true, alreadyGone: true };
        return { ok: false, error: err.message };
    }
}

function normalizeQmail(s) {
    return String(s || '').trim().toLowerCase();
}

// Self-service cancellation by qmail address. One subscription (one PayPal
// payment) can cover several addresses, so entering ANY one of them cancels the
// whole subscription — every address on it. We cancel at PayPal (stops billing)
// and delete the record so no further deliveries happen. Returns
// { ok:true, addresses:[...] } or { ok:false, reason }. Records are persisted
// after each successful PayPal cancel so a mid-loop failure can't leave a
// PayPal-cancelled subscription still sitting in our file.
function cancelByQmailAddress({ qmail }) {
    return withLock('subcancel', async () => {
        const subs = loadJson(SUBS_PATH);
        const want = normalizeQmail(qmail);

        const matches = Object.entries(subs).filter(([, s]) =>
            s.status === 'active' &&
            Array.isArray(s.addresses) &&
            s.addresses.some(a => normalizeQmail(a) === want)
        );

        if (matches.length === 0) return { ok: false, reason: 'no-match' };

        const cancelledAddresses = [];
        for (const [id, s] of matches) {
            const cancelled = await cancelAtPaypal(id);
            if (!cancelled.ok) {
                saveJson(SUBS_PATH, subs); // persist any already-removed entries
                return { ok: false, reason: 'paypal-error', error: cancelled.error };
            }
            cancelledAddresses.push(...(s.addresses || []));
            delete subs[id];
            console.log(`Subscription cancelled and removed via self-service (qmail ${want}): ${id}`);
        }
        saveJson(SUBS_PATH, subs);
        return { ok: true, addresses: cancelledAddresses };
    });
}

function setSubscriptionStatus(subscriptionID, status) {
    const subs = loadJson(SUBS_PATH);
    if (!subs[subscriptionID]) {
        console.warn(`Webhook for unknown subscription ${subscriptionID} (status -> ${status})`);
        return;
    }
    subs[subscriptionID].status = status;
    subs[subscriptionID].statusChangedAt = new Date().toISOString();
    saveJson(SUBS_PATH, subs);
    console.log(`Subscription ${subscriptionID} status -> ${status}`);
}

// --- Delivery ---

function splitCoins(total, count) {
    const share = Math.floor(total / count);
    return Array.from({ length: count }, (_, i) =>
        i === 0 ? total - share * (count - 1) : share);
}

// Sends the locker key to the subscriber's own QMail address via the local
// QMail client API. Async on the QMail side (task + Tell retry worker), so a
// 200 here means "accepted", not "read".
async function sendQmailTopUp(qmail, lockerKey, coins) {
    const resp = await axios.get(`${QMAIL_API_BASE}/api/qmail/net/messages/upload_and_tell`, {
        params: {
            to: qmail,
            subject: 'Your monthly CloudCoins have arrived',
            body:
                `Your DMS subscription top-up is here: ${coins} CloudCoins.\n\n` +
                `Locker Key: ${lockerKey}\n\n` +
                `Put this Locker Key into the Wallet part of your QMail software to ` +
                `deposit the coins. Questions? Message 20.123@giga or email CloudCoin@Protonmail.com.`
        },
        timeout: 30000
    });
    if (!resp.data.success) {
        throw new Error(resp.data.message || 'upload_and_tell reported failure');
    }
    return resp.data.task_id;
}

// Only ever sent once all locker keys for the cycle are actually minted, so
// it never ships "DELIVERY PENDING" placeholders. With QMAIL_DELIVERY_ENABLED
// off, this email IS the delivery channel, so it must carry real keys.
function sendBackupEmail(backupEmail, deliveries, subscriptionID) {
    const lines = deliveries.map(d =>
        `  ${d.qmail}  ->  ${d.coins} CC  ->  Locker Key: ${d.lockerKey}`);
    sendEmail(
        backupEmail,
        'Your monthly CloudCoins locker keys',
        `Your DMS subscription (${subscriptionID}) has been topped up.\n\n` +
        `This month's locker keys:\n\n${lines.join('\n')}\n\n` +
        `Put each Locker Key into the Wallet part of the QMail software for that address.\n` +
        `If QMail delivery is enabled, the same keys were also sent to each address directly.\n\n` +
        `Download QMail: https://CloudCoinConsortium.com/use.php\n` +
        `Support: 20.123@giga or CloudCoin@Protonmail.com`
    );
}

// One billing cycle's fulfillment. Serialized per saleID and idempotent, so a
// duplicate webhook or a retry overlapping a live webhook can never mint the
// month's coins twice.
function fulfillTopUp(subscriptionID, saleID, amountUSD) {
    return withLock(`sale:${saleID}`, () => _fulfillTopUp(subscriptionID, saleID, amountUSD));
}

async function _fulfillTopUp(subscriptionID, saleID, amountUSD) {
    const ledger = loadJson(LEDGER_PATH);
    const existing = ledger[saleID];
    if (existing && existing.done) {
        console.log(`Sale ${saleID} already fulfilled - skipping.`);
        return;
    }

    const subs = loadJson(SUBS_PATH);
    const sub = subs[subscriptionID];
    if (!sub) {
        // No subscriber record yet (webhook raced ahead of the browser's
        // record-subscription POST). Persist a pending marker carrying the
        // amount and let retry pick it up once the record lands.
        ledger[saleID] = {
            subscriptionID,
            pending: true,
            unknownSubscription: true,
            amountUSD: amountUSD != null ? amountUSD : (existing && existing.amountUSD) || null,
            timestamp: (existing && existing.timestamp) || new Date().toISOString()
        };
        saveJson(LEDGER_PATH, ledger);
        console.warn(`Sale ${saleID}: no subscriber record for ${subscriptionID} yet - will retry.`);
        if (!existing || !existing.opsAlerted) {
            ledger[saleID].opsAlerted = true;
            saveJson(LEDGER_PATH, ledger);
            sendEmail('sean@raidatech.com',
                'DMS: subscription payment ahead of subscriber record',
                `PayPal sale ${saleID} arrived for subscription ${subscriptionID}, but no record exists ` +
                `in subscriptions.json yet. The server will keep retrying automatically; if the subscriber ` +
                `never appears, deliver manually.`);
        }
        return;
    }

    const dollars = amountUSD != null ? amountUSD
        : (existing && existing.amountUSD != null ? existing.amountUSD : (PLAN_DOLLARS[sub.planKey] || 0));
    const totalCoins = Math.round(dollars * COINS_PER_DOLLAR);
    const shares = splitCoins(totalCoins, sub.addresses.length);

    // Resume a partial attempt; rebuild deliveries if the entry was only a
    // bare pending marker (webhook-first path had no deliveries array).
    let entry = existing;
    if (!entry || !Array.isArray(entry.deliveries)) {
        entry = {
            subscriptionID,
            timestamp: (entry && entry.timestamp) || new Date().toISOString(),
            totalCoins,
            deliveries: sub.addresses.map((qmail, i) => ({
                qmail, coins: shares[i], lockerKey: null, qmailDelivery: 'pending'
            }))
        };
    }
    delete entry.unknownSubscription;

    console.log(`\n>>> Subscription top-up: ${subscriptionID}, sale ${saleID}, ${totalCoins} CC across ${sub.addresses.length} address(es)`);

    let anythingPending = false;
    for (const d of entry.deliveries) {
        try {
            if (!d.lockerKey) d.lockerKey = await fulfillment.mintAmountLocker(d.coins);
        } catch (err) {
            console.error(`Top-up mint failed for ${d.qmail}:`, err.message);
            anythingPending = true;
            continue;
        }
        if (d.qmailDelivery !== 'sent') {
            if (!QMAIL_DELIVERY_ENABLED) {
                d.qmailDelivery = 'disabled';
            } else {
                try {
                    d.qmailTaskId = await sendQmailTopUp(d.qmail, d.lockerKey, d.coins);
                    d.qmailDelivery = 'sent';
                } catch (err) {
                    console.error(`QMail delivery failed for ${d.qmail}:`, err.message);
                    d.qmailDelivery = 'failed';
                    anythingPending = true;
                }
            }
        }
    }

    const allMinted = entry.deliveries.every(d => d.lockerKey);
    entry.pending = anythingPending;
    entry.done = !anythingPending;
    entry.lastAttempt = new Date().toISOString();
    ledger[saleID] = entry;
    saveJson(LEDGER_PATH, ledger);

    // Backup email only once every key is real - it's the delivery channel
    // whenever direct QMail delivery is disabled, so it can't ship placeholders.
    if (allMinted && !entry.backupEmailSent && sub.backupEmail) {
        sendBackupEmail(sub.backupEmail, entry.deliveries, subscriptionID);
        entry.backupEmailSent = true;
        saveJson(LEDGER_PATH, ledger);
    } else if (!allMinted && !entry.stuckAlerted) {
        entry.stuckAlerted = true;
        saveJson(LEDGER_PATH, ledger);
        sendEmail('sean@raidatech.com',
            'DMS: subscription top-up stuck (paid, coins not minted)',
            `Sale ${saleID} for subscription ${subscriptionID} was charged but the coins could not be ` +
            `minted (Core API likely down). The server will keep retrying hourly. No email has been sent ` +
            `to the subscriber yet - they will receive their keys once minting succeeds.`);
    }

    if (!anythingPending) {
        sub.cycles = (sub.cycles || 0) + 1;
        sub.lastTopUpAt = new Date().toISOString();
        saveJson(SUBS_PATH, subs);
        sendEmail('sean@raidatech.com',
            'DMS subscription payment completed - sale ' + saleID,
            'A recurring DMS subscription payment was fulfilled.\n\n' +
            'Subscription: ' + subscriptionID + '\n' +
            'Sale: ' + saleID + '\n' +
            'Amount: $' + dollars + ' USD\n' +
            'QMail addresses and locker keys:\n' +
            entry.deliveries.map(d => '  ' + d.qmail + ' - ' + d.coins + ' CC - ' + d.lockerKey).join('\n'));
        console.log(`Top-up complete for ${subscriptionID}: ${entry.deliveries.map(d => `${d.qmail}=${d.lockerKey}`).join(', ')}`);
    }

    fulfillment.checkFundingWalletBalance().catch(() => {});
}

// Synchronously records a billing webhook BEFORE it is acknowledged, so a
// crash between the 200 ACK and fulfillment can't lose the event (PayPal
// won't resend an acknowledged delivery). retryPendingDeliveries then picks
// the pending entry up. No-op for non-billing events.
function preRecordWebhook(event) {
    if ((event.event_type || '') !== 'PAYMENT.SALE.COMPLETED') return;
    const r = event.resource || {};
    const subscriptionID = r.billing_agreement_id;
    if (!subscriptionID) return;
    const saleID = r.id;
    if (!saleID) return;

    const ledger = loadJson(LEDGER_PATH);
    if (ledger[saleID]) return; // already known (pending or done)
    const amountUSD = r.amount && r.amount.currency === 'USD' ? parseFloat(r.amount.total) : null;
    ledger[saleID] = {
        subscriptionID,
        pending: true,
        amountUSD,
        timestamp: new Date().toISOString()
    };
    saveJson(LEDGER_PATH, ledger);
}

// Retries cycles that could not fully mint/deliver (Core or QMail down) AND
// webhook-first sales still awaiting their subscriber record. Called at
// startup and hourly from index.js.
async function retryPendingDeliveries() {
    const ledger = loadJson(LEDGER_PATH);
    const pendingSales = Object.entries(ledger).filter(([, e]) => e.pending);
    for (const [saleID, entry] of pendingSales) {
        console.log(`Retrying pending subscription delivery: sale ${saleID}`);
        await fulfillTopUp(entry.subscriptionID, saleID, entry.amountUSD != null ? entry.amountUSD : null);
    }
}

// --- Webhook event router ---

async function handleWebhookEvent(event) {
    const type = event.event_type || '';
    const resource = event.resource || {};

    if (type === 'PAYMENT.SALE.COMPLETED') {
        // For subscription payments the sale's billing_agreement_id is the subscription ID
        const subscriptionID = resource.billing_agreement_id;
        if (!subscriptionID) {
            console.log(`Webhook sale ${resource.id} has no billing_agreement_id - not a subscription payment, ignoring.`);
            return;
        }
        const amountUSD = resource.amount && resource.amount.currency === 'USD'
            ? parseFloat(resource.amount.total) : null;
        await fulfillTopUp(subscriptionID, resource.id, amountUSD);
        return;
    }

    if (type === 'BILLING.SUBSCRIPTION.CANCELLED') return setSubscriptionStatus(resource.id, 'cancelled');
    if (type === 'BILLING.SUBSCRIPTION.SUSPENDED') return setSubscriptionStatus(resource.id, 'suspended');
    if (type === 'BILLING.SUBSCRIPTION.EXPIRED')   return setSubscriptionStatus(resource.id, 'expired');
    if (type === 'BILLING.SUBSCRIPTION.ACTIVATED') return setSubscriptionStatus(resource.id, 'active');

    console.log(`Webhook event ${type} ignored.`);
}

// Admin-dashboard summary of the subscriber ledger: counts by status, total
// monthly recurring revenue, address count, and the pending-delivery backlog
// from subscription_ledger.json (cycles that failed to deliver every key).
function summary() {
    const subs = loadJson(SUBS_PATH);
    const ledger = loadJson(LEDGER_PATH);
    const out = {
        total: 0, active: 0, cancelled: 0, suspended: 0, expired: 0, other: 0,
        addresses: 0, monthlyUSD: 0, pendingDeliveries: 0, lastDeliveryAt: null,
    };
    for (const id of Object.keys(subs)) {
        const s = subs[id] || {};
        out.total++;
        const status = (s.status || 'other').toLowerCase();
        if (status in out) out[status]++; else out.other++;
        const addrs = Array.isArray(s.addresses) ? s.addresses.length : 0;
        out.addresses += addrs;
        if (status === 'active') out.monthlyUSD += PLAN_DOLLARS[s.planKey] || 0;
    }
    for (const saleID of Object.keys(ledger)) {
        const entry = ledger[saleID] || {};
        if (!entry.done) out.pendingDeliveries++;
        const ts = entry.done ? entry.lastAttempt : null;
        if (ts && (!out.lastDeliveryAt || ts > out.lastDeliveryAt)) {
            out.lastDeliveryAt = ts;
        }
    }
    return out;
}

module.exports = {
    PLAN_DOLLARS,
    COINS_PER_DOLLAR,
    MAX_ADDRESSES_PER_SUB,
    QMAIL_ADDRESS_RE,
    init,
    summary,
    recordSubscription,
    cancelByQmailAddress,
    verifySubscription,
    verifyWebhookSignature,
    handleWebhookEvent,
    preRecordWebhook,
    fulfillTopUp,
    retryPendingDeliveries
};
