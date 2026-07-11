# Website Audit — distributedmailsystem.com — 2026-07-10

Four-part audit: link integrity, credibility/deceit review, funnel effectiveness, SEO.
All file references are under `client/src/` unless noted.

*(Restored from the original Claude audit; kept under `claude.audit.md` because Windows
file paths are case-insensitive and collided with `Audit.md`.)*

---

## PART 1 — LINK TESTING

### Broken (confirmed live)
1. **Download files do not exist.** `/var/www/distributedmailsystem.com/downloads/` is empty on disk. Both
   `/downloads/qmail.for.windows.zip` and `/downloads/qmail.for.macs.zip` return the site's HTML page
   disguised as a .zip (verified via curl — Content-Type: text/html). Linked from `InfluencerSuccess.jsx:335,341`.
2. **Links to non-existent routes** (render a blank page; no catch-all 404 in `App.jsx`):
   - `/support` — `Home.jsx:187`, `components/Footer.jsx:31` ("Help Center")
   - `/get-paid` — `EmailCrisis.jsx:650`, `EmailCrisis.jsx:866` (the page's main "Get Early Access" CTA)
   - `/qmail-architecture` — `EmailCrisis.jsx:763`
   - `/quantum-safe` — `EmailCrisis.jsx:942` (closing "See the QMail Solution →" CTA)
3. **`href="#"` placeholders**: `FunnelSuccess.jsx:426` ("What's Next in Phase II?" cards — 5 dead upsells on the
   purchase success page); every platform card on `Downloads.jsx:11-36` (`url: "#"` incl. the Windows button).
4. **Mislabeled**: Footer "Contact Support" actually links to `/register` (`Footer.jsx:21-26`).
5. **Promised but missing**: influencer mode on /register says "join our Telegram below" but the Telegram button
   only renders in regular mode (`RegisterAddress.jsx:458-462` vs `645-674`). `/download` footer says "Join our
   Telegram for updates" with no link (`Downloads.jsx:80-84`).

### Working
- All 16 public routes return 200 on https://www.distributedmailsystem.com
- External: https://cloudcoin.com/pay/ (200), https://support.cloudcoin.com/en/ (200), Telegram invite (200)
- apex → www 301 redirects work on http and https

---

## PART 2 — CREDIBILITY / DECEIT REVIEW

### TIER 1 — Critical (money claims, point-of-sale deception, legal exposure)

**1. Revenue share contradicts itself in 16 places — including the Terms of Service.**
Intended: influencer keeps ~85%, platform fee 12–15%. Site currently says:
- "12 to 15% platform fee": `Home.jsx:470`
- "50%": `Home.jsx:491` (same card, 20 lines below!), `Influencers.jsx:45` (calculator math `* 0.5`),
  `Influencers.jsx:146,155,173,181,210`, `SalesStrategy.jsx:179,259,371-373,390,493`,
  `InfluencerSuccess.jsx:360`, and **`Terms.jsx:56`** ("Influencers receive 50% of affiliate sales") — the
  contractual document.
Also note 85% + 12–15% ≠ 100%; pick exact numbers that reconcile.
Fix: settle the real split, update all locations (grep `50%`, `50/50`, `0.5`, `12 to 15`), Terms first.

**2. Post-payment download buttons are dead; Mac build offered but doesn't exist.**
`InfluencerSuccess.jsx:335-347`. Contradicts Windows-only warnings at `RegisterAddress.jsx:499,604-608`.
A paying customer clicking "Mac" and getting a corrupt file will assume fraud → PayPal dispute.

**3. "Start Earning / earn from day one" while influencer sign-ups are closed (Phase II).**
- `Influencers.jsx:199` "Free to join — earn from day one" 12 lines above the Phase II badge
- `Influencers.jsx:223` "Start Earning — It's Free" → closed flow; `:342,352` "Create Your QLink Now"
- `Home.jsx:458-500` — entire influencer section has NO Phase II notice at all
- `Influencers.jsx:356-359` "Already signed up? Go to your dashboard" — nobody can have signed up
Fix: Phase II badge everywhere, future-tense verbs, waitlist capture.

**4. Earnings calculator: invented 10% conversion rate, no disclaimer (FTC exposure).**
`Influencers.jsx:33-151` — assumes 10% of clickers buy, shows "Your Estimated Monthly Earnings $X,XXX"
with zero sales history and no "earnings not guaranteed" disclaimer. Also uses the wrong 50% share.

**5. "Registration Fee: $0" but the card is charged $0.01.**
`RegisterAddress.jsx:443-449` promises $0; code comments at `:172-174,222-224` admit PayPal rejects $0 in
production so $0.01 is sent. Fix the copy: "verified via a $0.01 PayPal micro-transaction."

**6. Fabricated third-party promises on the checkout page (VerifiedAccess).**
- `:390` "{firstName} typically responds within 24 hours" — hardcoded for every influencer
- `:376` "To ensure they read yours… 'Postage Guarantee'" — guarantees reading, which nobody can
- `:41,51` default recipient is "Connie Willis" (a real, famous author) with a fabricated address — renders
  on the payment page when URL params are missing
- `:411` "The Most Private Email System In The World" — unverifiable superlative at checkout

**7. Fake "processing" theater on success pages.**
`FunnelSuccess.jsx:55-72` — "Provisioning Simulation" setTimeout loop ("Sharding Identity across 32 Global
Nodes…"); `InfluencerSuccess.jsx:51-68` shows "Processing Payment…" AFTER payment completed.

### TIER 2 — High

**8. Internal marketing playbook leaked into visible copy.**
`EmailCrisis.jsx:371` — visible heading "Emotional Hook:"; `:467` — "The Visual Analogy:". Delete/rename.

**9. Unsourced or wrong statistics on EmailCrisis.**
- `:385-387` "$43B lost to email fraud in 2023" (FBI IC3: $12.5B for ALL US cybercrime; BEC ≈ $2.9B)
- `:557-558` "347B emails / 150B spam (45%)" — 150/347 = 43%, contradicts its own math
- `:699` "Gmail: Billions of users locked out (2020 outage)" — outage was ~45 minutes
- Plus ~10 more unsourced figures (`:391-393, 396-399, 559-560, 576, 594-595, 805, 813-814, 821-823, 830-831`)
Fix: keep 3–4 defensible stats with inline sources, cut the rest.

**10. Absolute security claims ("impossible", "unhackable", "100%", "forever").**
`EmailCrisis.jsx:419,646,653`; `HowItWorks.jsx:111,119,373`; `Whitepaper.jsx:317,344`;
`Technology.jsx:523,561,566,571,630`; `Home.jsx:404` ("Unsurveillable"); `Influencers.jsx:182`;
`VerifiedAccess.jsx:364`; `InfluencerSuccess.jsx:375`; `Privacy.jsx:17,30`.
Note: `HowItWorks.jsx:89-90` claims quantum security for **AES-128** — the exact key size quantum attacks
halve; every other page says AES-256. FAQ (`Faq.jsx:385`) admits servers see metadata, contradicting
"unsurveillable" / "no metadata trails" (`Home.jsx:408`).

**11. Privacy Policy contains false statements (GDPR risk).**
- `Privacy.jsx:92` "Google Fonts — No personal data is transmitted" — false (IP goes to Google; LG München
  2022 ruled this violates GDPR). Self-host the fonts.
- `Privacy.jsx:56,65` "no IP tracking / we do not collect your IP" — server logs, PayPal SDK, and the
  perfectmonetarypolicy.com iframe (`RegisterAddress.jsx:748`) all receive IPs.

### TIER 3 — Medium
12. "Quantum-Safe" claimed in present tense everywhere, but FAQ/Technology list quantum-safe key exchange
    as Phase II (`Faq.jsx:313-323`, `Technology.jsx:589-592`). Reconcile.
13. Distributed Resource Directory both "live now" (`RegisterAddress.jsx:683,718`, `FunnelSuccess.jsx:198`)
    and "Phase II" (`Home.jsx:315` — also typo "Director", `Faq.jsx:320`).
14. Dead CTAs (see Part 1).
15. Downloads page advertises 5 platforms with live-looking buttons; product is Windows-only with no files.
16. Technical numbers disagree across pages: stripes 2-32 vs 5-32 vs 5 vs 32; AES-128 vs AES-256;
    "99% smaller" vs "80-90%" vs "90%"; "$2K=$20K server" vs "$4K=$40K"; address format inconsistency
    (`Technology.jsx:649`).
17. Two companies claim the product: "Perfect Money Foundation" (`Faq.jsx:355`) vs "RaidaTech"
    (`Terms.jsx:33`, `Footer.jsx:73`). State the relationship.
18. Fake social proof: unattributed testimonial-styled quotes (`Home.jsx:620-651, 779-783`); "Our most
    popular tier" on a beta (`Subscribe.jsx:33`); hardcoded "Popular" badge (`VerifiedAccess.jsx:100,452`).
    (The live user counter and Sold Out tiers are real API data — good.)
19. "Refundable stake" framing vs 30-day window (`RegisterAddress.jsx:495,637-639`, `Terms.jsx:53,55`) —
    up to $1,000 (.Giga) reads as a returnable deposit. Rename to "one-time fee, 30-day money-back".
20. Phase II features sold in present tense on Home (`Home.jsx:366-374`): run-your-own-server, certification
    programs that don't exist anywhere.
21. `SalesStrategy.jsx:702` coaches influencers to promise "priority attention" — the exact deceptive claim
    `Terms.jsx:64-66` prohibits.

### Minor
- Hindi/Urdu payment error string "Payment capture mein error aaya hai." (`RegisterAddress.jsx:206,277`)
- "verified through QMAIL" stray caps (`EmailCrisis.jsx:418,766`)
- "attachments up to several gigabytes" vs 50 MB/month plan (`Faq.jsx:445` vs `Subscribe.jsx:22`)
- Good copy to preserve: PayPal freeze warning, beta-hiccups notices, Windows-only warnings,
  token-verification payment gating on /access.

---

## PART 3 — FUNNEL EFFECTIVENESS

### The funnel map
- **Path A (main):** Home → /register → pick stake tier ($10/$20/$50/$100/$1,000) → PayPal inline →
  `/api/generate-mailbox` → /success → /download. Payment happens ON /register.
- **Path B (QLink):** shared URL → /access (nav hidden) → package → PayPal → locker codes →
  /success-influencer. Best-designed page on the site: token gating, price breakdown, PayPal badge,
  real social proof.
- **Path C (/subscribe "Tips"):** three PayPal SUBSCRIPTIONS ($5/$10/$20/mo). **CRITICAL BUG:**
  `onApprove` (`Subscribe.jsx:72-74`) only sets local state — no backend call, no record of who subscribed —
  yet the success screen promises "your CloudCoin locker will now be automatically topped up every month"
  (`:242-246`). Recurring money is collected with no fulfillment path. Fix or gate this page.
- **Path D (influencer):** /influencers → /register toggle → hard Phase II gate. Cannot convert; yet gets
  the site's loudest CTAs.

### Biggest funnel problems (ranked)
1. Dead CTAs on /email-crisis send the most-persuaded readers to blank pages (4 links, incl. both
   closing CTAs).
2. /download is bricked (`url: "#"` on all five platforms) — FunnelSuccess routes paying customers there.
   Put the real Windows zip link on /success directly (as InfluencerSuccess already does — once files exist).
3. Zero lead capture ANYWHERE. When payments are off ("Coming Soon" — `RegisterAddress.jsx:612-621`) or
   the Phase II gate hits, the visitor is lost permanently. Add email capture / working Telegram link at
   every gate.
4. The hero splits attention 50/50 with the closed influencer track (`Home.jsx:411-428`); the full-width
   "Start Earning" section (`Home.jsx:446-508`) sells a track that can't convert.
5. No pricing anywhere before /register — "Get Early Access" lands cold visitors on a $10–$1,000 stake
   table with three dense sentences of jargon. Add "from $10 · 30-day refund" microcopy under hero CTA.
6. Checkout-page leaks on /register: Telegram + support.cloudcoin.com buttons right below PayPal
   (`RegisterAddress.jsx:660-673`), a perfectmonetarypolicy.com iframe (`:744-761`), and full nav with
   external API link (nav hidden on /access but not /register — `App.jsx:36`).
7. Weak trust block at payment: 30-day refund is a 10px italic footnote (`RegisterAddress.jsx:636-640`);
   no "what you get" checklist; no PayPal badge (reuse from `VerifiedAccess.jsx:547-558`); Terms not linked.
   CloudCoins are non-refundable per Terms but never disclosed at /access checkout.
8. /subscribe leaks buyers off-site to cloudcoin.com/pay with no attribution (`Subscribe.jsx:215-228`).
9. Technology and Whitepaper pages have zero CTAs — persuasive cul-de-sacs. EmailCrisis hero routes
   people INTO Technology.
10. Small dead ends: double footer on Home (`Home.jsx:160-244,830` + global `App.jsx:80`); "Contact
    Support" → /register; unreachable success block (`RegisterAddress.jsx:699-740`); support contact info
    rendered as SVG images — can't tap/copy on mobile (`VerifiedAccess.jsx:576-591`,
    `InfluencerSuccess.jsx:411-426`, `SalesStrategy.jsx:760-778`); PayPal charge descriptor says "DMS
    Registration" while the site sells "QMail" (`RegisterAddress.jsx:227`) — invites disputes.

---

## PART 4 — SEO

### Critical
1. **Crawlers get an empty shell.** The SPA serves 4KB of head + spinner on every route; no indexable
   content; social scrapers (Facebook/X/Slack) see only the homepage title on every shared link.
   Fix: build-time prerendering — `react-snap` or `vite-prerender-plugin` fits this site (13 static routes).
2. **Soft-404s:** unknown URLs return 200 (no catch-all route + SPA fallback). Add `<Route path="*">`
   NotFound page with noindex.
3. **Sitemap/robots point at the non-canonical apex domain** — every sitemap URL 301s.
   Fix `public/sitemap.xml:3-13`, `public/robots.txt:4`, and `index.html:14` (og:url) to use www.
4. **12 of 18 pages set no title/description** — including Home, HowItWorks, Technology, Faq, EmailCrisis,
   Whitepaper, Downloads, Subscribe. The `useDocumentMeta` hook exists; adopt it everywhere.
   Suggested Home title: "QMail — Quantum-Safe, Spam-Free Email | Get Paid to Receive Email".
   `index.html:8` default description ≠ hook's DEFAULT_DESC — align them.
5. **twitter:card declares summary_large_image but no og:image/twitter:image exists.** Create a
   1200×630 `public/og-image.png` and add the four image meta tags.

### High
6. No canonical tag, no JSON-LD. Add canonical + Organization/SoftwareApplication schema; FAQPage schema
   on /faq is a rich-result opportunity. Extend useDocumentMeta to update canonical/og:url per route.
7. Sitemap gaps: /subscribe missing (it's in main nav); /success + /success-influencer not disallowed in
   robots.txt and nothing emits noindex; no <lastmod> dates.
8. **1.08 MB entry JS bundle** — three.js + react-three-fiber load eagerly for the starfield background
   (`App.jsx:6`, `StarryBackground.jsx:2-3`). Lazy-load it (or replace with ~2KB canvas), add manualChunks.
9. Favicon `/qmail-logo.svg` (index.html:5) is NOT in `client/public/` — a clean deploy 404s it. Also: live
   site serves an older bundle hash than local dist/ — verify deploy state.

### Medium
10. Money keywords ("get paid to receive email", "paid email", "spam-free email", "quantum-safe email")
    absent from titles/h1s. Home h1 is keyword-empty poetry; Technology h1 is just "Technology".
11. Render-blocking Google Fonts (`index.html:32`) — self-host Inter (also fixes Privacy issue #11).
12. Heading structure is clean (one h1/page); no <img> tags anywhere so no alt issues, but no image
    surface either — og-image is the priority.

### Already good
Clean URLs, lang set, apex 301s, lazy route chunks, brotli precompression, crawlable <Link> nav,
sensible sitemap priorities, useDocumentMeta foundation.

---

## TOP 10 PRIORITIES ACROSS EVERYTHING
1. Fix /subscribe: it takes recurring PayPal money with no backend record or fulfillment (funnel #Path C).
2. Put the real Windows zip in /var/www/distributedmailsystem.com/downloads/, remove the Mac button,
   un-brick /download.
3. Reconcile the revenue share (50% vs 85%/12-15%) in all 16 places, Terms.jsx first.
4. Repoint the 4 dead CTAs on /email-crisis and footer /support; add a catch-all 404 route.
5. Delete "Emotional Hook:"/"The Visual Analogy:" headings; source or cut the EmailCrisis statistics.
6. Phase II badges + lead capture on every closed flow (Home influencer section has none).
7. Fix checkout honesty: $0 vs $0.01, "responds within 24 hours", "Postage Guarantee", Connie Willis
   default, non-English error string.
8. Prerender the site + fix sitemap domain + per-page meta + og-image (the 4 big SEO wins).
9. De-leak /register (hide nav, move Telegram/support below fold, drop the iframe) and add a trust block
   (refund badge, what-you-get list, PayPal badge).
10. Add earnings-calculator disclaimer and soften absolute security claims (esp. AES-128 quantum claim).
