# MENA Freelance-Platform Teardown → Nakhla Mapping

**Status:** Draft (2026-07-24) · **Subjects:** Mostaql (مستقل) + Khamsat (خمسات), both Hsoub-owned · **Goal:** reuse their proven escrow/commission/dispute mechanics for Nakhla (KSA/GCC influencer marketplace).
**Source:** deep-research (24 sources, 22/25 claims verified 3-0, all from operator-owned primary pages). Part A (tech stack) + Part B (KSA payment rails) filled from a focused follow-up — see §7–8. Citations `[n]` at bottom.

---

## 1. The model in one paragraph

Hsoub runs **two storefronts on one escrow engine**. **Khamsat** = Fiverr-style fixed micro-gigs (single delivery). **Mostaql** = Upwork-style project bidding (freelancer submits a priced offer the buyer accepts). Both act as an intermediary (*waseet*) that holds the buyer's money until delivery is approved, on a **unified Hsoub account** with shared banking + KYC [F1]. The reusable lesson: **build the escrow/verification/payout core once**, skin it per marketplace. Nakhla is already structured this way (`LedgerEntry` + `Order` + Tap PSP).

---

## 2. Fees / take-rate (verified)

| | Khamsat | Mostaql | Nakhla today |
|---|---|---|---|
| Platform commission | **20%** ($1/$5) [F2] | **15%** (cut from 20% on 2024-04-30) [F3] | `Order.serviceFee` |
| Who bears commission | **seller only**, non-shiftable, non-negotiable [F2] | **freelancer only**, non-shiftable [F3] | **brand** (fee added *on top*) — divergent, see §5 |
| Buyer processing fee | ~2.75% ($2.75 min) [F4] | 2.75% ($2.75 min), on top-up amount only [F4] | folded into `serviceFee` (Tap's PSP fee separate) |
| Enforcement | asking buyer to cover commission = **suspendable** [F3] | same [F3] | not yet enforced |

⚠️ **Uncertainty:** a 2-1 signal says Mostaql **reinstated tiers** (20% free plan / 15% paid plans) after the flat-15% cut; granular per-tier figures were **refuted (0-3)**. Treat the exact number as unstable; the *direction* (supply side pays, non-shiftable) is solid [F3].

---

## 3. Escrow → payout flow (uniform across both platforms)

1. Buyer funds the **full amount up-front** into an on-platform USD balance (card or PayPal) [F8].
2. Platform **holds** it — neither party can touch it [F1][F5].
3. Seller delivers → buyer clicks **"receive/approve"** → funds move to seller. Buyer with notes hits **"request modifications"** → funds stay locked [F5][F10]. Khamsat **auto-releases after 72h** of buyer silence [F5].
4. Released earnings sit **suspended** in the seller's balance for a hold (~14 days) — card-settlement lag + anti-fraud — before withdrawal [F6].
5. **Withdrawal:** PayPal (**min $25**) or bank/wire (**min $250**, ~10 countries incl. KSA/UAE/EG/JO), the latter requiring **Hsoub KYC** + IBAN/SWIFT/English address [F8][F9]. No Payoneer on Mostaql.
6. **Refunds:** cancel → price returns **instantly as on-platform credit** to re-hire [F7]. External bank refund only to the **original card**, within **170 days** (Mostaql) [F-refund]. Khamsat guarantee window = **14 days** post-approval [F6].

---

## 4. Nakhla mapping — mechanic by mechanic

Nakhla's `OrderStatus` (`pending_payment → awaiting_creator → in_progress → submitted → revision_requested → approved → released → cancelled → disputed`) and double-entry `LedgerEntry` (`charge/refund/payout/commission/adjustment`, invariant `charge − refund − payout − commission = 0`, funds at **Tap**) already implement most of this.

| Hsoub mechanic | Nakhla status today | Action |
|---|---|---|
| Buyer funds full amount up-front, held by intermediary | ✅ `pending_payment` → charge into Tap escrow | none |
| Delivery + buyer-approval release | ✅ `submitted` → `approved` → `released` (payout ledger) | none |
| Request-modifications branch | ✅ `revision_requested` | none |
| **Auto-release after buyer inaction (72h)** | ❌ no timer on `submitted` | **ADD**: cron auto-approve `submitted` orders after N hours; log `OrderEvent` (actor=system) |
| **Guarantee/dispute window (14 days)** | ⚠️ `disputed` exists but no time-box | **ADD**: window after `released` during which brand can open `disputed`; auto-finalize after |
| **Payout hold / balance suspension (~14d)** | ❌ per-order payout via Tap, no hold | **DECIDE**: hold creator payout N days for chargeback/fraud cover, or rely on Tap's settlement window |
| Commission non-shiftable, enforced by suspension | ❌ not enforced | **ADD** to ToS + admin action; low priority |
| KYC-gated payout | ⚠️ Mawthooq = ad-licence, not payout KYC | Tap creator-onboarding covers destination KYC; confirm in §8 |
| Currency | ✅ SAR (Hsoub uses USD) | none — SAR is correct for KSA |

### 5. The one deliberate divergence — who pays commission
- **Hsoub:** commission **deducted from the seller** (freelancer nets `amount − commission`); buyer pays only a small processing fee. Supply-side take-rate.
- **Nakhla today:** `charge = amount + serviceFee` — the **brand pays the fee on top**, creator receives the full listed `amount`. Demand-side fee.
- Both are legitimate (Fiverr does *both*: 20% off sellers + a buyer service fee). **Decision for Nakhla:** keep brand-pays (creators see full quoted price — attractive for supply acquisition) vs. switch to creator-pays (higher headline GMV, matches local expectation set by Mostaql/Khamsat). Recommend keeping **brand-pays** early to win creators, revisit once supply is dense. Whichever: make the split explicit in checkout and **non-shiftable** in ToS.

---

## 6. Directly reusable takeaways (priority order)
1. **Auto-release timer** on `submitted` — protects creators from unresponsive brands (Khamsat's 72h). Highest ROI, small change.
2. **Time-boxed dispute/guarantee window** after release — bounds platform liability.
3. **Payout-hold decision** — pick a hold period or lean on Tap's settlement + chargeback window.
4. **Non-shiftable commission** clause + enforcement.
5. **Instant refund-to-credit** option (re-hire another creator) alongside card refund.

---

## 7. Hsoub technical stack (verified live 2026-07-24)

**Polyglot — the "Hsoub = PHP/Laravel" belief is wrong.** Fingerprinted from live production HTTP:
- **Khamsat + Hsoub I/O → Ruby on Rails** — `rack.session` / `_hsoub_io_session` cookies, `x-runtime` header, Rails `csrf_meta_tags`, rails-ujs, and Sprockets **SHA-256 asset fingerprints** (`application-<64hex>.js`); one digest was recomputed to exactly match the file's SHA-256 [F11][F12].
- **Mostaql → PHP/Laravel** — `XSRF-TOKEN` + custom session cookie in Laravel's `iv/value/mac/tag` encrypted-envelope format [F11]. (academy.hsoub.com is off-the-shelf PHP / Invision Power Board on Apache.)
- **Frontend + mobile → React + React Native + PWA** (React/Redux, Webpack/Gulp), per Hsoub's own job posts [F13]. Job boards confirm **separate Rails/Sinatra and PHP/Laravel backend teams** + one React/RN frontend team.
- **CDN → in-house `hsoubcdn.com` ("Hsoub Accelerator" edge), NOT Cloudflare** [F14].
- **Infra → nginx behind an AWS Elastic Load Balancer (`awselb/2.0`), AWS `eu-west-1` EC2** [F14].
- **Unconfirmed:** primary datastore (PostgreSQL/MySQL claim refuted 1-2); "single shared codebase across properties" is inference, not proven.

**Takeaway for Nakhla:** don't copy their stack — it's a pragmatic per-product mix (Rails *and* Laravel *and* PHP forum software), an artifact of history, not a blueprint. Your **Next.js + NestJS + Prisma/Postgres + React Native** is a more modern, *unified* choice. The reusable asset is the product/escrow model (§1–6), not the tech.

---

## 8. KSA payment rails & SAMA regulation (verified)

**The regulatory reality is decisive — and it validates your Tap decision as legally required, not just tidy.**
- Under SAMA's **Law of Payments and Payment Services (Royal Decree M/26)** + Implementing Regulations (in force 2023-06-13): providing payment services / operating a payment system **without a SAMA license is prohibited** (penalties + up to 1 yr imprisonment). **"Payment Aggregation Services"** — pooling/collecting buyer funds on sellers' behalf — is an **explicitly enumerated licensable activity** [F15].
- **A marketplace like Nakhla CANNOT hold buyer escrow funds unlicensed.** Two legal paths: obtain a SAMA license (heavy), or **route funds through a SAMA-licensed PSP** — which is exactly your current design (`LedgerEntry` mirrors movements at **Tap**; `charge/refund/payout/commission`; platform never self-custodies). Since Jul 2024, banks may deal **only** with licensed PSPs [F15].
- Licensed PSPs safeguard client funds **bankruptcy-remote**: placed immediately into a dedicated *"Deposit and Safeguard of Funds of a PSP's Clients"* account at a Licensed Bank, unlinked to PSP obligations, holding no fees/opex, returned to users on PSP insolvency (Art 93–94). The protection attaches to the **PSP's** safeguarded funds [F16].

**Takeaway:** the schema comment "the platform NEVER holds funds — money lives at a licensed PSP (Tap)" is the **compliant** architecture. Keep it. Do **not** build a creator wallet/balance that holds user money on Nakhla's own books (that's the §4 payout-hold decision — implement any hold *inside the PSP*, not as a Nakhla-custodied balance).

**PSP comparison → done, see §9.**

---

## 9. KSA PSP matrix & recommendation (3rd pass)

> **Confidence note:** the adversarial-verify workflow for this pass hit an **API outage** mid-run — only PayTabs "Split Payout exists + has a REST API" survived a clean 3-0 [F17]. The rest was verified **inline** against PSP docs + KSA payment comparisons (secondary). Treat **fees as indicative — confirm directly with each PSP**; capabilities are reliable.

| PSP | SAMA / KSA acquiring | Mada | Marketplace / split product | Payout to seller | Indicative fees | Fit for Nakhla |
|---|---|---|---|---|---|---|
| **Tap Payments** | ✅ licensed, KSA SAR settle | ✅ + Apple Pay, STC Pay, Tamara/Tabby | ✅ **Marketplace** — split, deduct commission, onboard sellers; escrow-like hold until seller KYC [F18] | ✅ bank / wallet / prepaid, daily-weekly-monthly | 2.75% cards, 3.25% intl + FX | **★ Primary** — already your target PSP; best STC Pay+Mada; clean REST/Node DX |
| **PayTabs** | ✅ SAMA-licensed, next-day SAR | ✅ + Apple Pay, SADAD, cards, BNPL | ✅ **Split Payout** (REST API) — more configurable multi-vendor/escrow/sub-merchant than Tap [F17] | ✅ multi-beneficiary payout API | **1% Mada**, 2.25%+SAR1 cards; or $49/mo flat | **★ Strong fallback** — cheapest Mada, richer split rules |
| **Moyasar** | ✅ SAMA-licensed (major PI), Saudi-built | ✅ + Apple Pay, STC Pay, Samsung Pay | ❌ no native marketplace/split product | ❌ not native (you'd orchestrate) | ~1.5%+SAR1 Mada, ~2.2%+SAR1 cards | Great simple gateway; **skip for marketplace** unless you build the split yourself |
| **HyperPay** | ✅ SAMA-licensed, ZATCA Phase 2 | ✅ high Mada approval + Apple Pay, STC Pay, BNPL | ✅ serves marketplaces (split payout, wallet) | ✅ | quote / enterprise | Enterprise-heavy; overkill for lean startup |
| **Checkout.com** | ✅ KSA entity + SAMA license | ✅ (first to bring Mada+Apple Pay to KSA/UAE) | ✅ **Platforms** (Payfac) — sub-entity payouts, REST API | ✅ sub-entity bank payouts | quote / enterprise | Excellent API but enterprise onboarding + high min |
| **Stripe** | ❌ **no direct KSA acquiring** (only via Stripe Atlas foreign entity) | ❌ | (Connect exists but N/A in KSA) | — | — | **Ruled out** for a KSA-domiciled marketplace |

**Buyer methods to accept (KSA), ranked:** Mada (mandatory domestic debit — dominant), Apple Pay (very high KSA penetration), international cards (Visa/MC), STC Pay, then SADAD/BNPL (Tamara/Tabby) as nice-to-have. Any of Tap/PayTabs/HyperPay/Checkout.com cover all of these.

**Creator payout rails:** the chosen PSP's disbursement API (Tap/PayTabs both pay to seller IBAN) is the primary rail and keeps you inside the licensed-PSP compliance boundary (§8). Payoneer/Wise are cross-border fallbacks for non-KSA creators but add KYC + FX; avoid making them primary.

### Recommendation
1. **Primary: Tap Payments.** It's already your target (`PaymentProviderKind { mock, tap }`), and its **Marketplace** product natively does the three things Nakhla needs — split a buyer payment into creator amount + platform commission, hold the creator's share until their account passes KYC (escrow-like), and disburse to the creator. This closes the loop: your architecture is sound as-is.
2. **Document PayTabs as the fallback** — add `paytabs` to `PaymentProviderKind` later if you need cheaper Mada (1%), next-day SAR settlement, or more configurable multi-vendor payout rules.
3. **Don't** pick Moyasar for the marketplace flow (no native split → you'd rebuild payout orchestration + drift toward self-custody, which §8 says to avoid), and **don't** design around Stripe (unavailable in KSA).

---

## Citations
- **[F1]** Both are Hsoub intermediary (*waseet*) escrow marketplaces on a unified account — khamsat.com/how, mostaql.com/p/fees, /p/guarantee, /p/terms (3-0).
- **[F2]** Khamsat 20% commission, seller-only, non-shiftable — khamsat.com/how, support.khamsat.com/buyers-fees (3-0).
- **[F3]** Mostaql 15% base (cut from 20%, 2024-04-30), freelancer-side, non-shiftable, suspension enforcement; tier reinstatement 2-1 — blog.mostaql.com, mostaql.com/p/terms, /p/fees (3-0).
- **[F4]** Buyer 2.75% ($2.75 min) processing fee on top-up amount only — mostaql.com/p/terms, support/employers-fees, support.khamsat.com/buyers-fees (3-0).
- **[F5]** Escrow release on approval; Khamsat 72h auto-deliver; modifications branch — khamsat.com/how, /guarantee, blog.khamsat.com/orders-delivery-update, mostaql.com/p/guarantee (3-0).
- **[F6]** Suspended-balance hold ~14 days; Khamsat 14-day guarantee window — khamsat.com/guarantee, mostaql.com/p/fees, /p/faq (3-0).
- **[F7]** Instant on-platform refund-to-credit — khamsat.com/guarantee, mostaql.com/p/terms (3-0).
- **[F-refund]** External bank refund only to original card, within 170 days — mostaql.com/p/terms (3-0).
- **[F8]** Cards/PayPal in; PayPal min $25 / bank min $250 out (~10 countries); min project $25, min top-up $10; no Payoneer — khamsat.com/how, mostaql.com/p/terms, /p/fees, blog.mostaql.com (3-0).
- **[F9]** Payout requires prior Hsoub KYC + IBAN/SWIFT/English address — blog.mostaql.com/bank-transfers-vs-paypal, support.hsoub.com/manage-bank-accounts (3-0).
- **[F10]** Dispute/trust mechanics synthesized (escrow, modifications, guarantee windows, auto-release, refund-to-credit, balance hold, non-shiftable commission) — all from the 3-0 claims above.
- **[F11]** Polyglot stack — Khamsat + Hsoub I/O = Ruby on Rails, Mostaql = PHP/Laravel — live HTTP fingerprints (cookies, `x-runtime`, Laravel `iv/value/mac/tag`), khamsat.com, mostaql.com, io.hsoub.com (3-0).
- **[F12]** Rails Sprockets SHA-256 asset fingerprints (one digest recomputed to match) — khamsat.hsoubcdn.com, io.hsoub.com assets (3-0).
- **[F13]** Job posts confirm Rails/Sinatra + PHP/Laravel backend teams + React/React Native/PWA frontend team — io.hsoub.com/jobs, baaeed.com (3-0 per posting).
- **[F14]** In-house `hsoubcdn.com` CDN ("Hsoub Accelerator", not Cloudflare); nginx behind AWS ELB `awselb/2.0`, eu-west-1 EC2 (3-0).
- **[F15]** SAMA Law of Payments (Royal Decree M/26): aggregation/holding buyer funds is licensable; route through a licensed PSP; banks deal only with licensed PSPs — rulebook.sama.gov.sa (3-0).
- **[F16]** Bankruptcy-remote safeguarding of client funds, Implementing Regs Art 93–94 — rulebook.sama.gov.sa (mechanics 3-0 / return 2-1).
- **[F17]** PayTabs "Split Payout" marketplace product + REST API — docs.paytabs.com/…/Split-Payouts (3-0, the only survivor of the outage pass).
- **[F18]** Tap Marketplace: split/commission, seller onboarding, escrow-hold-until-KYC, payouts — developers.tap.company/docs/marketplace-getting-started, tap.company/en-sa/products/marketplaces (inline-verified; workflow verify hit API outage).
- **[F19]** PSP capabilities/fees (Moyasar SAMA + methods; HyperPay SAMA + marketplace; Checkout.com KSA SAMA license + Platforms sub-entity payouts; Tap 2.75%/3.25%; PayTabs 1% Mada / next-day SAR) — PSP sites + KSA payment-gateway comparisons (secondary; confirm fees with each PSP).
- **[F20]** Stripe has no direct KSA acquiring (only via Stripe Atlas) — onesafe.io, payatlas.com, Stripe MENA docs (secondary).

_Refuted & excluded: per-tier net examples; wallet-refund-minus-fee; specific $250+$15 combo; Hsoub primary DB = Postgres/MySQL (all 0-3 / 1-2)._
