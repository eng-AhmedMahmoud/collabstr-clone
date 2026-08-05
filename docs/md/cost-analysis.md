# Nakhla — Service Cost Analysis (prices verified 2026-07-06/07)

USD primary; SAR at pegged 3.75. All prices fetched live from official pages unless flagged.

## 1. One-time / annual fixed costs

| Item | Cost | Notes |
|---|---|---|
| Google Play Console | **$25 one-time** | Org account needs D-U-N-S; personal account needs 12 testers × 14 days closed testing before production. Realistic time-to-live 2–4 weeks. |
| Apple Developer Program | **$99/yr** | Organization enrollment = legal entity + D-U-N-S (needs CR). Individual enrollment works with just ID but app publishes under personal name. |
| Commercial Registration (CR, LLC) | **~SAR 1,775 first year (~$473)**, then SAR 200–400/yr registry | Needed for: Apple org account, payment gateway onboarding, .sa domain, SMS sender ID. Saudi Business Center bundle (CR + AoA + Chamber). |
| Freelance licence (alternative) | **SAR 0–1,156/yr** | Accepted by Moyasar for gateway onboarding. NOT sufficient for Apple org account (no D-U-N-S). Fee changed under 2026 regs — verify on freelance.sa. |
| Domain `.sa`/`.com.sa` | **from ~SAR 200/yr (~$53)** | Requires Saudi presence (CR / Saudi national / KSA trademark). Via SaudiNIC-accredited registrar. `.com` alternative: $10–20/yr. |
| SMS Sender ID registration (CST) | **~SAR 299/yr (~$80)** via Unifonic | Mandatory pre-registration; 10–20 business days; transactional ID ≤11 chars. Start this early. |

**First-year fixed total (CR path): ≈ $730–780** (≈ SAR 2,700–2,900).
**Cheapest path (freelance licence + individual Apple): ≈ $180–490.**

## 2. Monthly infrastructure — Launch phase (≈0–5k MAU)

| Service | Plan | $/mo | Notes |
|---|---|---|---|
| Vercel | **Pro, 1 seat — required** | **$20** | Hobby is explicitly non-commercial; Nakhla is commercial. Includes $20/mo usage credit — covers Blob + Fluid Compute at launch traffic. |
| Neon Postgres | Launch (usage-based, $0 base) | **~$5–15** | Pricing model changed: no more $19/$69 tiers. Compute $0.106/CU-hr, storage $0.35/GB-mo, scale-to-zero when idle. Current seed DB fits Free tier (0.5 GB, 100 CU-hrs) but Launch removes suspend risk. Vercel Marketplace version = same prices, billed on Vercel invoice. |
| Realtime (socket.io) | **Hostinger KVM 2 VPS (recommended)** | **$8.99 promo → $14.99 renewal** | See §4 — Pusher/Ably don't speak socket.io protocol; VPS runs the existing NestJS gateway unchanged. 2 vCPU / 8 GB RAM / 100 GB NVMe. |
| Email (Resend) | Free | $0 | 3,000/mo, 100/day. Pro $20/mo (50k) when outgrown. |
| SMS OTP (Unifonic) | Pay-per-SMS | **~$15 @ 1k OTP/mo** | SAR 0.055/SMS. Twilio is $0.0872/SMS to KSA — 6× more; skip. |
| Push (FCM + APNs + Expo push) | — | $0 | All free. |
| EAS builds | Free | $0 | 15 Android + 15 iOS cloud builds/mo; local builds (current /apk workflow) unlimited/free. |
| Sentry | Developer (free) | $0 | 5k errors/mo, 1 user. Team $26/mo later. |
| PostHog | Free | $0 | 1M events + 5k recordings/mo free forever. |

**Launch total: ~$50–70/mo (~SAR 190–260).**

## 3. Monthly — Growth phase (≈50k MAU)

| Service | $/mo | Driver |
|---|---|---|
| Vercel Pro + usage | 50–120 | Fluid Compute: Active CPU $0.128/hr + $0.60/M invocations; Blob storage $0.023/GB-mo. |
| Neon | 30–80 | ~10 GB storage ($3.50) + compute hours dominate. |
| Realtime | 15–100 | VPS KVM 4 ($12.99→$28.99) — or Ably Standard $29+usage / Pusher Pro $99 (2k conns) if moving to managed. |
| Resend Pro | 20 | 50k emails/mo, $0.90/1k over. |
| SMS (Unifonic) | 50–150 | Scales with signups/logins: 10k OTP ≈ SAR 550 ≈ $147. |
| Sentry Team | 26 | 50k errors/mo. |
| PostHog | 0–50 | Free tier survives ~1M events; usage-based after. |
| EAS Starter (optional) | 19 | Only if cloud builds/OTA updates >1k MAU needed. |

**Growth total: ~$210–560/mo (~SAR 790–2,100).**

## 4. Realtime provider decision (socket.io)

Key fact: **Pusher and Ably are NOT socket.io-compatible** — adopting either means replacing the NestJS `MessagesGateway` + web/mobile clients with their SDKs.

| Option | Cost | Code change |
|---|---|---|
| **Self-host on Hostinger KVM 2** (matches infra convention: Nakhla gets own KVM2) | $8.99→$14.99/mo | **None** — deploy existing gateway as-is. Also gives a box for future cron/workers. |
| Ably | Free (200 conns, 6M msgs/mo) → Standard $29+usage (10k conns) | Full refactor to Ably SDK |
| Pusher Channels | Free (100 conns, 200k msgs/day) → Startup $49 (500 conns) → Pro $99 (2k conns) | Full refactor to Pusher SDK |

Recommendation: VPS now (zero refactor, cheapest); revisit Ably if ops burden bites.

## 5. Payments — % of GMV, not fixed (all quotes need direct confirmation)

mada scheme fee baseline: 1% capped SAR 200/txn. 15% VAT applies on gateway fees. Stripe does **not** operate domestically in KSA (verified 2026-07-06).

| Gateway | Setup | Monthly | mada | Visa/MC | Marketplace splits |
|---|---|---|---|---|---|
| **Tap Payments** | 0 | 0 | custom (~2.75% cited) | 2.75% (3.25% intl) | **Yes — native marketplace product (splits, commissions, payouts)** |
| **PayTabs** | 0 | $49 (micro plan) or 0 | ~2.85–3.5% custom | same | **Yes — strongest split/escrow tooling reported** |
| Moyasar | 0 | 0 | conflicting data: 1.5%+SAR 1 vs 2.5% — official pricing page 404, get quote | ~2.5–2.9% | Payout product, no published split pricing |
| HyperPay | ~SAR 1,500 | ~SAR 250 | 1.5%+SAR 1 | 2.75%+SAR 1 | Enterprise/custom |

Worked example: SAR 100k GMV/mo, blended ~2.5% → **~SAR 2,500/mo (~$667) + VAT on fees**.

Creator payouts (SAR IBAN): all quote-based — Tap marketplace payouts, Moyasar payouts, Lean Technologies (SAMA-licensed payouts API). Raw SARIE bank bulk transfer via corporate bank = cheapest (single-digit SAR per transfer).

Shortlist: **Tap or PayTabs** (both do marketplace splits natively — matches order/escrow model).

## 6. Watch-outs

- **Data flags**: Moyasar rates unverifiable (pricing page dead, third-party source self-contradicts). HyperPay/PayTabs rates custom-negotiated. GulfSaasReview numbers indicative only. Get direct quotes.
- **Neon Launchpad DB still unclaimed** — claim or migrate before budgeting Neon (see live-deployments memory).
- **PDPL**: Neon DB currently us-east-2. No KSA region on Neon; pick nearest allowed region deliberately when re-provisioning; KSA cross-border rules apply to personal data.
- **Expo EAS Production now $199/mo** (was $99) — avoid; free tier + local builds suffice.
- **Sender ID lead time** (10–20 business days) and **Google 12-tester rule** (personal accounts) are the two longest poles — start both before app store submission.

## 7. Bottom line

| Phase | Fixed (yearly) | Infra (monthly) | Payments |
|---|---|---|---|
| Launch year | ~$730 (CR path) / ~$180–490 (freelance path) | ~$50–70 | ~2.5–2.9% of GMV + VAT |
| Growth (50k MAU) | ~$205/yr (Apple + CR renewals + domain + sender ID) | ~$210–560 | negotiate interchange++ at volume |
