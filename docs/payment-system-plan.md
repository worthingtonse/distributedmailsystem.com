# Payment System & Success Pages — Implementation Plan

Date: 2026-07-12. Source spec: Sean's payment-system document (register / subscribe / influencer). This plan reconciles the spec with what actually exists in the repo and the CloudCoin Core API.

## Decisions locked in (Sean, 2026-07-12)

1. **Inventory = pre-minted locker-key text files with serials recorded.** Each pool line stores `lockerKey,serialNumber` captured when the key is minted (the `put-one-coin` API returns the serial). No peek needed in the buyer's path. This retires wallet-ZIP delivery on /register.
2. **Mixed cart on /register** — any combination of classes and quantities in one PayPal order.
3. **Subscriptions keep the fixed $5/$10/$20 PayPal plans**; monthly coins are split across the subscriber's listed addresses.
4. **Monthly delivery = QMail message to each address + email backup** of the locker keys.

## Spec-vs-reality corrections (why the plan differs from the doc)

- `GET :8080/api/transactions/locker/peek` returns only totals per denomination, **not serial numbers**. Serial is instead captured at mint time from `put-one-coin`'s response and stored in the pool file.
- There is **no "get a locker key" API** on :8080. A locker key is any string the client invents; the locker is created implicitly by the first upload. Replenishment = we generate a random key (base32 `XXX-XXXX`, existing convention) and fund it.
- The "one" endpoint to use is `GET /api/transactions/locker/put-one-coin?locker_key=K&denomination=D` (returns `serial_number`). For the 200-coin bonus locker: `GET /api/transactions/locker/upload?locker_key=K&amount=200`.
- Subscriptions today are recorded **nowhere** (client-side only). Phase 2 builds the missing subscriber ledger, PayPal webhook receiver, and monthly fulfillment job from scratch.
- QMail address derivation already exists: `canonicalAddress(serial, class)` in `server/index.js` → dotted-byte serial `@` class, e.g. `20.123@giga`.

## Phase 0 — Shared fulfillment backend (hardest; main model)

- **Pool files** (git-ignored, under `server/inventory/`):
  - `address-keys-{bit,byte,kilo,mega,giga}.txt` — lines `lockerKey,serialNumber,mintedAt`
  - `bonus-keys.txt` — lines `lockerKey,mintedAt`, each pre-loaded with 200 CC
  - `issued-keys.log` — append-only audit of consumed lines (who/when/order)
- **Minting module**: generate key → call Core :8080 (`put-one-coin` for address coins with the class's denomination; `upload?amount=200` for bonus) → append line. Class→coin denomination: bit=1, byte=10, kilo=100, mega=1000, giga=10000 CC (**confirm with Sean**).
- **Bootstrap CLI** to pre-fill pools to a target depth per class.
- **Atomic consume**: in-process mutex around read-modify-write of pool files (single Node process; Express handles concurrent requests).
- **Fulfillment endpoint** `POST /api/fulfill-order`: verify PayPal order total against cart via existing `requireVerifiedPayment` (replay-protected); per item consume a pool line → derive address → register in `users.csv`; one bonus key per order (**confirm: per order vs per address**); respond with `[{address, class, lockerKey}...] + bonusLockerKey`.
- **Background replenish**: after responding, mint replacements (fire-and-forget with retry); startup reconciliation + periodic stock check; low-stock email reusing the `checkWalletStock` pattern; `GET /api/wallet-stock` switched to pool-file counts.

## Phase 1 — /register multi-buy + success page (frontend agent, reviewed)

- `RegisterAddress.jsx`: quantity steppers per class (mixed cart), live total, single PayPal order, `onApprove` → capture → `POST /api/fulfill-order` → navigate `/success` with results.
- `FunnelSuccess.jsx` rework (keep existing page as the base per spec):
  - "Your QMail address is:" / "Your QMail addresses are:" list; per address: address, class, locker code with copy button.
  - Bonus card labeled: *"Bonus Coins: Put this Locker Key into the Wallet part of your QMail software."*
  - Download QMail: https://CloudCoinConsortium.com/use.php
  - Links: Getting Started, About QMail (SPA routes), Telegram group (**need URL**), support `20.123@giga`, CloudCoin@Protonmail.com
  - Subscription upsell CTA → `/subscribe` with the purchased addresses pre-filled (router state + query fallback).

## Phase 2 — /subscribe rework (backend main model, frontend agent)

- Page: read pre-filled addresses (from success-page handoff) or let the user add their existing addresses manually / link to buy a new one; plan picker ($5/$10/$20); show the per-address coin split next to each address.
- `onApprove` → `POST /api/record-subscription` `{subscriptionID, planId, addresses[], backupEmail}` → persist to `server/subscriptions.json` (flat-file, matching repo conventions).
- **PayPal webhook receiver** `POST /api/paypal/webhook` with signature verification: `PAYMENT.SALE.COMPLETED` triggers monthly fulfillment; handle `BILLING.SUBSCRIPTION.CANCELLED/SUSPENDED`.
- **Monthly fulfillment**: coins = plan dollars × 10 (existing convention, **confirm**), split across addresses; mint one locker per address; send QMail message with the key via the QMail API (:8081/:8082 — **server needs its own funded QMail identity; verify send path**); email backup via existing nodemailer; append to `subscription_ledger.json`.
- **Daily catch-up cron** to retry failed deliveries and reconcile missed webhooks.

## Phase 3 — Influencer /access page — BUILT 2026-07-12

- New endpoint `POST /api/fulfill-influencer` replaces the old 3-call flow (generate-mailbox + generate-cloudcoins-locker + log-affiliate-sale). It verifies the PayPal payment ONCE against the combined total (CloudCoins dollars + paid-address cart) under a single redemption purpose, so the same dollars can't be double-counted across coins and addresses (a latent flaw in the old two-purpose flow). Coins minted via amount-mode (`mintAmountLocker`) so the locker holds the real coin count. Reuses the hardened `withLock`/`requireVerifiedPayment`/`unmarkOrderRedeemed` primitives + `fulfillment.issueAddressUnit`. Attribution logged server-side.
- `VerifiedAccess.jsx`: keeps messaging/credits + free bonus .byte checkbox + verification banners + custom colors; adds an optional address cart (per-class steppers, stock-aware) folded into one PayPal payment; single fulfill call; navigates with addresses + coins + partialError.
- `InfluencerSuccess.jsx`: renders CloudCoins locker + per-address cards (locker key, bonus card, Free badge) + partial-error banner + QMail download + subscribe upsell carrying addresses; legacy single-address path preserved.
- Dead endpoints left in place (harmless): `/api/generate-mailbox`, `/api/generate-cloudcoins-locker` no longer called by any page.

### (original Phase 3 notes)

- Reuse the Phase 0 fulfillment so a visitor can buy their own address (mixed cart) in addition to coin credits for messaging the influencer; add subscribe upsell; affiliate attribution (`/api/log-affiliate-sale`) unchanged.

## Testing & deploy

- Full sandbox PayPal run-through of register, subscribe (webhook simulator), and access flows; Core :8080 integration exercised with real mints; `vite build` → copy to `server/dist`; pm2 restart; keep `payments-enabled=false` until verified.

## Implementation status & ops notes (updated as built)

**Hardened 2026-07-12** after a high-effort multi-agent code review found 10 confirmed money-path defects (all fixed & re-tested):
- `server/locks.js` (new) — in-process keyed async mutex + cross-process pool file lock.
- Fixes: fulfill-order now serialized per PayPal order (no double key handout) and rolls back redemption if nothing was delivered; pool consume/append hold a cross-process lock (safe to run `mint-pools.js` on a live server); subscription top-ups serialized per sale ID (no double-mint on duplicate webhooks); webhook durably persisted before ACK; webhook-first race recovers via retry; `record-subscription` is now first-writer-wins (blocks delivery-hijack via a leaked subscription ID); backup email only ships real keys; register purchases also email the buyer their keys as an out-of-band backup; Subscribe validates prefilled addresses; Go-Anonymous requires all addresses scrubbed. Verified with concurrency tests (no duplicate keys, single mint per sale, serialized critical sections, hijack blocked).

**Built 2026-07-12** (Phases 0–2 code complete):
- `server/fulfillment.js` — pools, minting, issued ledger, replenish, low-stock + low-wallet-balance alerts. Verified live against Core :8080 (bit mint with serial capture; 200 CC bonus locker).
- `server/mint-pools.js` — pool bootstrap CLI. Run `node server/mint-pools.js --dry-run` first; defaults bit=20 byte=20 kilo=10 mega=5 giga=2 bonus=25. **Not yet run for real** (giga keys lock 10,000 CC each — Sean should choose targets).
- `server/subscriptions.js` + endpoints — subscriber ledger, webhook receiver, monthly top-up with idempotency and hourly retry. Verified with a live 1-CC cycle.
- Client: `RegisterAddress.jsx` (mixed cart), `FunnelSuccess.jsx` (spec success page), `Subscribe.jsx` (pre-fill + per-address split + backup email).

**New optional/required env vars** (`server/.env`):
- `FUNDING_WALLET_PATH` — default `/opt/raidax/Client_Data/Wallets/Default`
- `WALLET_LOW_BALANCE_THRESHOLD` — CC floor for the low-balance email, default 25000
- `PAYPAL_WEBHOOK_ID_SANDBOX` / `PAYPAL_WEBHOOK_ID_LIVE` — **required for live**: create a webhook in the PayPal developer dashboard pointing at `https://www.distributedmailsystem.com/api/paypal/webhook` subscribed to `PAYMENT.SALE.COMPLETED` and `BILLING.SUBSCRIPTION.*`, then put its ID here. Without it, webhooks are accepted (loudly) in sandbox and rejected in live.
  - **SANDBOX webhook created 2026-07-12** via REST API → `PAYPAL_WEBHOOK_ID_SANDBOX=7YD17352CD6894728` (events: PAYMENT.SALE.COMPLETED + BILLING.SUBSCRIPTION.ACTIVATED/CANCELLED/SUSPENDED/EXPIRED). LIVE webhook still to be created before going live.
  - **`.env` fix 2026-07-12**: the sandbox client secret had been pasted into the `PAYPAL_PLAN_ID_CASUAL_SANDBOX` line, leaving `PAYPAL_CLIENT_SECRET_SANDBOX` empty. Moved it back (backup at `server/.env.bak.20260712`). Sandbox OAuth now verified working.
- **Sandbox subscription plans CREATED 2026-07-12** via API (Product `PROD-06F13452MF426100F` + 3 monthly plans): `PAYPAL_PLAN_ID_CASUAL_SANDBOX=P-3FU19320UJ407494WNJKAXUA` ($5), `_TYPICAL_SANDBOX=P-6GC08526UA710792BNJKAXUA` ($10), `_POWER_SANDBOX=P-4JX836039R718223BNJKAXUA` ($20). LIVE plan IDs were already set (real `P-...`). All six plan IDs now populated; /subscribe sandbox testing unblocked.
- `QMAIL_DELIVERY_ENABLED=true` + `QMAIL_API_BASE` (default `http://localhost:8081`) — turns on direct QMail delivery of monthly keys via `upload_and_tell`. Off until the server's own QMail identity is set up; email backup delivers keys meanwhile.

**Deploy**: `cd client && npm run build`, copy `client/dist/*` → `server/dist/`, `pm2 restart` the server process. `payments-enabled` stays `false` in `server/paypal-mode.txt` until verified.

## Answers from Sean (2026-07-12)

1. Telegram group: **https://t.me/distributedmailsystem**
2. Bonus 200 CC locker: **one per address** purchased.
3. Funding wallet: **`/opt/raidax/Client_Data/Wallets/Default/`** (verified live: 278,945 CC in Bank). Add a **low-balance email alert** to Sean — reuse the DMS server's existing nodemailer/SMTP setup.
4. Denominations confirmed: bit=1, byte=10, kilo=100, mega=1000, giga=10000. (An "epic" = 100,000 exists but is sold off-site only — never on the web store.)
5. Success page: keep **FunnelSuccess.jsx as the base**. The stamped-PNG "deed" concept and `src/pages/SuccessPage.jsx` draft are deferred.
6. Links use the SPA routes (`/getting-started`, `/about-qmail`).
7. **Stop writing `users.csv`.** Track buyer + qmail address in the new issued-keys ledger instead (the "Go Anonymous" feature moves to that ledger).
8. /subscribe: addresses pre-filled when arriving from the success page; manual entry (with format-only validation) when arriving directly.
