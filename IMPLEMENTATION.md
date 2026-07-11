# Implementation plan & status — distributedmailsystem.com

**Date:** 2026-07-10  
**Sources:** `claude.audit.md`, `gpt.audit.txt`, independent code review  
**Owner decisions:** 85/15 revenue · subscribe live + honest copy · Windows-only downloads

---

## Pushed commits (rollback points)

| Commit | What |
|--------|------|
| `07228a0` | Broken links fixed, NotFound 404, Windows-only downloads, EmailCrisis labels |
| `b5fd433` | Revenue share 85/15 site-wide + Phase II honesty |
| `7c17b01` | Checkout honesty, subscribe copy, absolute-claims softening |
| `584d4cf` | SEO meta/canonical/www/og-image, hero funnel, Technology/Whitepaper CTAs |

---

## Done this sprint

### Links & structure
- [x] `/support` → `/faq`
- [x] `/get-paid`, `/quantum-safe` → `/register`
- [x] `/qmail-architecture` → `/technology`
- [x] Catch-all `NotFound` with noindex
- [x] Downloads: Windows zip only; others Coming Soon
- [x] FunnelSuccess Phase II cards no longer use `href="#"`

### Credibility & checkout
- [x] Terms + all marketing: **85% influencer / 15% platform**
- [x] Calculator uses `0.85` + earnings disclaimer
- [x] Influencer fee shown as **$0.01** micro-charge
- [x] English payment error strings
- [x] VerifiedAccess: no Connie Willis default, no 24h guarantee, no “Most Private in the World”
- [x] Refundable stake → one-time fee + 30-day money-back
- [x] Register trust checklist + Terms/Privacy links
- [x] Subscribe success no longer promises automatic locker top-up
- [x] Softened absolute security language on key pages
- [x] AES-128 claim corrected to AES-256 on HowItWorks
- [x] EmailCrisis marketing labels renamed; stats de-hype

### SEO & funnels
- [x] `useDocumentMeta`: title, description, canonical, og/twitter, noindex
- [x] Meta on all major public routes
- [x] Sitemap + robots on **www**; `/subscribe` added; success routes disallowed
- [x] `og-image.png` + tags in `index.html`
- [x] Home hero: purchase-first CTAs + pricing microcopy
- [x] Technology + Whitepaper end CTAs → `/register` / `/subscribe`
- [x] Influencer section Phase II framing; primary hero → mailbox + credits

---

## Still open (next)

1. **Subscription automation** (deferred by design): PayPal webhooks → entitlement ledger → auto top-up
2. Host real file at `/downloads/qmail.for.windows.zip` on the server (path is wired)
3. Prerender for crawlers (react-snap / vite plugin)
4. Self-host Inter fonts (Privacy + performance)
5. Lazy-load StarryBackground / three.js
6. Favicon `qmail-logo.svg` missing from `client/public/`
7. Lead-capture form at Phase II / payments-off gates
8. Hide nav on `/register` during checkout (optional)
9. Remove or rework perfectmonetarypolicy iframe on register
10. Remaining unsourced stats / company naming (PMF vs RaidaTech)
11. JSON-LD Organization + FAQPage schema
12. Mac download links on InfluencerSuccess if any remain

---

## Definition of done (sprint)

- [x] No dead internal conversion links (in SPA routes)
- [x] Single revenue-share story (85/15) including Terms
- [x] No $0 lie / fabricated response guarantees at checkout
- [x] Subscribe does not promise automatic top-ups
- [x] Windows download path only for active CTA
- [x] Public pages have unique titles/descriptions
- [x] Sitemap/robots use www; 404 exists
- [x] Marketing pages funnel to `/register` or honest Phase II
- [x] Incremental git pushes for rollback
