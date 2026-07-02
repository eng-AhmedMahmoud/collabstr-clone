# Nakhla — Competitive Gap Analysis (July 2026)

Sources: full codebase audit + competitor research (Collabstr, Insense, JoinBrands, Billo, Social Cat, Heepsy, Modash, Upfluence; KSA: Trendly, MoonTech, ShowMB). See `production-roadmap.json` for the execution backlog.

## Market position

- KSA influencer ad market ≈ $95M/yr, ~40% of GCC, growing >30% YoY.
- KSA is dominated by **agencies**, not self-serve marketplaces → whitespace for a Collabstr-style product done Arabic-first.
- No platform (global or KSA) verifies **Mawthooq/GCAM advertising licences** — biggest trust differentiator available.

## Feature parity vs Collabstr (baseline)

| Feature | Collabstr | Nakhla today |
|---|---|---|
| Search + buy packages | ✅ | ✅ |
| Post campaign, creators apply | ✅ | ✅ |
| Escrow, pay-on-approval | ✅ | ◐ order states exist, **no payment gateway** |
| Verified social stats (IG/TikTok/YT APIs) | ✅ | ❌ manual stats |
| Pre-order chat & negotiation | ✅ | ✅ threads |
| Content approval flow (draft→revision→approve→release) | ✅ | ✅ |
| Reviews both directions | ✅ | ✅ (creator reviews) |
| Usage-rights tiers in packages | ✅ | ❌ |
| Creator payouts + tax docs | ✅ | ❌ |
| AI brief generation + matching | ✅ | ❌ |
| Fake-follower scoring | ✅ | ❌ |
| Live post analytics | ✅ | ❌ |
| Free-tool SEO cluster + programmatic pages | ✅ (moat) | ❌ |
| Brand subscription tier (fee discount) | ✅ | ❌ |

## KSA differentiators (priority order)

1. **Mawthooq licence verification badge** — block/flag unlicensed creators from paid orders. Nobody does this. ✅ **SHIPPED (2026-07-02)**: creator submits licence → admin verify/reject queue → "Licensed" badge on cards + profile (EN/AR); order-creation gate behind `ENFORCE_MAWTHOOQ` flag. Licence no. + review note kept private (owner-only via authed `/creators/me`).
2. **mada + Apple Pay + STC Pay + BNPL** (mada = 70%+ of KSA card volume; non-negotiable). Gateway shortlist per owner input: **Tap Payments** (strong KSA/GCC presence, bundles mada + Apple Pay + Tabby/Tamara in one contract) and **Tamara** (Saudi-born BNPL leader — integrate directly or via gateway) alongside HyperPay/Moyasar. Recommended: Tap as primary gateway + Tamara/Tabby BNPL toggles at checkout.
3. **Snapchat-first profiles/packages** — top reach in KSA, near-zero competitor coverage. (Platform enum already includes snapchat ✅)
4. **ZATCA FATOORA e-invoices** + Jan-2026 *deemed-supplier* VAT rule (marketplace must charge VAT for non-registered resident creators) → capture creator VAT status at onboarding.
5. **Instant payouts to local IBAN/STC Pay** (Trendly's pitch).
6. **Arabic-first RTL product** — already strong ✅; competitors have zero Arabic.
7. **Coupon→revenue attribution via Salla/Zid** integration — MoonTech's killer feature; no global player integrates Salla/Zid.
8. **Maroof-verified brand badges** (reverse trust for creators).
9. **Ramadan seasonal planner + availability calendar** — no competitor has one.
10. Arabic SEO tool cluster ("أسعار المؤثرين", "مؤثرين الرياض" …).

## Compliance status (PDPL + GDPR)

Done (this session):
- Cookie consent banner, opt-in per category, AR/EN, RTL, 6-month re-consent, reopen from footer + settings.
- Real bilingual privacy policy + terms (PDPL/GDPR-structured, KSA governing law, Mawthooq + ZATCA clauses).
- Data export endpoint `GET /users/me/export` (portability) + settings UI.
- Account deletion (already existed; cascade verified).

Outstanding:
- Server-side consent log (timestamp/version per user) — needs `ConsentLog` model + migration.
- Marketing-communications opt-in checkbox at signup (separate, unticked).
- Breach runbook (72h SDAIA notification), RoPA, DPO designation, DPAs with processors.
- In-Kingdom / adequate-region data hosting decision + transfer risk assessment.
- Sensitive-data handling for future KYC/Mawthooq ID documents (encrypt at rest).

## Production blockers (order)

1. Payments: HyperPay primary (mada/Apple Pay/STC Pay/3DS2), escrow models (PaymentIntent, EscrowHold, LedgerEntry, Payout, PayoutAccount) — roadmap CF07/IN01.
2. Email verification + password reset + transactional email/SMS (Unifonic/Taqnyat) — CF08/IN06.
3. Admin mobile (tables overflow, no drawer, locale hardcoded) — CF03–CF06.
4. File uploads (deliveries currently URL strings) — S3-compatible storage.
5. ZATCA invoicing — IN05.

## Design/UX notes from competitors

- Collabstr landing: search hero → horizontal creator rows per platform with price-on-card → 3-step how-it-works → escrow trust block → FAQ → urgency CTA. Nakhla structure matches; needs animation/micro-interaction polish.
- MoonTech: smooth scroll-reveal animations, "Without vs With" table, 4-step launch roadmap, dark hero.
- Trendly anti-pattern: client-only rendering, empty HTML, bad SEO — Nakhla's SSR is already ahead.
- Open quality bar: real RTL mirroring + Arabic type scale + dark mode — no competitor ships all three.
