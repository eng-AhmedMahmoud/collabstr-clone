# Nakhla — Compliance & Monitoring Blueprint (KSA Influencer Marketplace)

> Deep-research output, adversarially verified. Research date: **2026-07-12**.
> Scope: escrow order flow (brand pays → platform holds → creator delivers → brand approves → payout minus commission; disputes freeze for admin arbitration; pre-approval cancellation refunds the brand) across regulatory compliance, PSP selection, and monitoring/observability.
> Verification stats: 5 research angles, 24 sources fetched, 120 claims extracted, 25 adversarially verified (24 confirmed, 1 killed), synthesized into 10 findings.

---

## 1. Executive Summary

**Nakhla must never take custody of escrow funds itself.** Saudi payments law (Royal Decree M/26 Art. 4 + Implementing Regulations Art. 6) reserves receiving, holding, and transferring funds for SAMA-licensed PSPs/banks. The Art. 7(2) commercial-agent carve-out is an unsafe fit for a dual-sided arbitrating marketplace, and SAMA's e-commerce circular confines unlicensed platforms to linkage/technical support only. The escrow hold must therefore live in a licensed PSP's safeguarded bank account (the Art. 93 regime), with the PSP executing splits, payouts, and payee KYC.

**PSP choice:** Stripe is definitively ruled out (no KSA or Kuwait support; UAE is the only supported GCC country). **Tap Payments is the recommended primary PSP** — SAMA-licensed since 2020, mada/Apple Pay/STC Pay coverage, a marketplaces product (split funds, deduct commissions, manage payouts), and a GCC-wide footprint including Kuwait for the Diwaniya fork — *pending direct due diligence on its escrow-hold window and fees*, since comparative claims for Moyasar/HyperPay/PayTabs did not survive verification.

**Compliance overlay on the flow:** ZATCA FATOORA e-invoicing on commission/subscription/featuring invoices, with electronic credit notes (not internal ledger entries) for refunds and commission adjustments on cancelled/disputed orders; Mawthooq (GCAM, now GAMR) licence verification at creator onboarding; and ad-disclosure flagging for sponsored content and paid featuring.

**Monitoring:** the event-sourced order/escrow audit trail plus PSP-webhook capture and a daily *money-in = payouts + commission* reconciliation directly mirrors SAMA's own safeguarding-reconciliation duty. Sentry provides out-of-the-box distributed tracing across Next.js web/admin (client/server/edge) and NestJS (Node SDK v8+); only the VPS socket.io gateway needs manual `sentry-trace`/`baggage` propagation via `Sentry.getTraceData()`.

**Major gaps:** PDPL, MoC e-commerce law duties, AML law specifics, PCI-DSS, and FTC/ASA promoted-listing baselines produced **no surviving verified claims** and need follow-up research (see §6).

---

## 2. Track 1 — Regulatory Compliance (KSA-first)

### 2.1 SAMA payments licensing & escrow

#### Finding 1 — Nakhla cannot lawfully hold escrow funds itself
**Confidence: high · Vote: 3-0 on each of 4 merged claims (0, 3, 4, 8)**

SAMA licensing perimeter: Nakhla cannot lawfully receive, hold, or disburse brand-to-creator escrow funds itself. The Law of Payments and Payment Services (Royal Decree M/26, Art. 4) prohibits providing payment services in KSA without a SAMA license; its Art. 1 definition of payment services expressly covers management of transfer transactions and payment wallets/electronic accounts, and Implementing Regulations Art. 6 makes fund deposit on payment accounts, execution of payment transactions, acquiring, payment aggregation, and e-money issuance licensable activities — exactly what a platform-run escrow performs. The 2020 PSP Regulations (Art. 4(a)) say the same. **Nakhla must route all escrow money through a SAMA-licensed PSP or bank.**

*Evidence:* Verified verbatim against primary regulator texts: "A person may not operate a payment system or provide payment services in the Kingdom unless licensed by SAMA" (Law, Art. 4); Art. 6 of the Implementing Regulations lists "Services enabling Funds to be deposited on a Payment Account... Execution of Payment Transactions... Payment Aggregation Services... Issuing Electronic Money"; PSP Regulations Art. 4(a): "No person is permitted to carry on a Payment Service by way of business unless that person is: (i) a Payment Service Provider; or (ii) a Licensed Bank." The Money Remittance definition (funds received from a payer solely to transfer to a payee) maps exactly onto the brand-pays/platform-holds/creator-paid flow. Penalties up to SAR 25M.

*Sources:*
- [SAMA Rulebook — Law of Payments and Payment Services](https://rulebook.sama.gov.sa/en/law-payments-and-payment-services)
- [SAMA Rulebook — Implementing Regulations of the Payments and Payment Services Law](https://rulebook.sama.gov.sa/en/implementing-regulations-payments-and-payment-services-law)
- [SAMA — PSP Regulations (2020, PDF)](https://sama.gov.sa/en-US/payment/Documents/PSPs%20Regulations%20111.pdf)

#### Finding 2 — The Art. 7(2) "commercial agent" exclusion is not a safe harbor
**Confidence: high · Vote: 3-0 (claim 1); related claim on the 2020-regs exhaustive list refuted 0-3 due to supersession**

The Art. 7(2) "commercial agent" exclusion exists but is not a safe harbor for Nakhla: a payment made through a commercial agent authorized to negotiate/conclude the sale of goods or services is excluded from payment services, but per international analogues (PSD2 Art. 3(b), EBA Q&As) the exclusion holds only when the agent acts for one side of the transaction — a dual-sided escrow marketplace with discretionary hold/release/refund and dispute arbitration is a poor fit and should not rely on it without KSA counsel/SAMA confirmation.

*Evidence:* Art. 7(2) verified verbatim: "The payment that is made from the Payer to the Payee through a commercial agent authorized via an agreement to negotiate or conclude the sale or purchase of goods or services on behalf of any person" does not constitute a payment service. Verifiers noted SAMA's wording is broader (PSD1-style, "on behalf of any person") than the EU one-side-only rule, making the restrictive reading an interpretive gloss — but the PSD2 analogue was explicitly narrowed to stop marketplaces relying on it, and no KSA authority endorses marketplace reliance. Note: the 2020 PSP Regulations contained no such carve-out at all; the exclusion exists only in the 2023 Implementing Regulations.

*Sources:*
- [SAMA Rulebook — Implementing Regulations of the Payments and Payment Services Law](https://rulebook.sama.gov.sa/en/implementing-regulations-payments-and-payment-services-law)

> **Refuted claim (0-3):** "Money remittance is an in-scope regulated Payment Service, and the Regulations' exhaustive out-of-scope list (Article 5.2, items (a)–(i)) contains no commercial-agent or marketplace exemption equivalent to EU PSD2 Art. 3(b)." — killed because it relied solely on the [2020 PSP Regulations](https://sama.gov.sa/en-US/payment/Documents/PSPs%20Regulations%20111.pdf), which are superseded: the current 2023 Implementing Regulations *do* contain the Art. 7(2) exclusion. Cite the 2023 regulations as operative.

#### Finding 3 — The safeguarding regime (Art. 93) defines the escrow fund-flow architecture
**Confidence: high · Vote: 3-0 (claim 2) + 2-1 (claim 9, verifier confirmed via current Art. 93)**

The safeguarding regime defines the escrow fund-flow architecture the PSP partner must run — and that Nakhla's reconciliation monitoring should mirror: client funds must be safeguarded immediately upon receipt in a separate account at a licensed bank; if still held at end of the business day after receipt they must sit in a dedicated account named "Deposit and Safeguard of Funds of a Payment Service Provider's Clients" (or SAMA-approved secure liquid investments); the account may hold only safeguarded funds (no fees/operating money), is insolvency-remote, and fees/commissions payable to the provider are excluded from safeguarded funds. **SAMA also mandates a daily reconciliation mechanism — the regulatory template for Nakhla's money-in = payouts + commission reconciliation job.**

*Evidence:* Art. 93 verified verbatim (In-Force, 13/6/2023): safeguard "immediately upon receipt"; dedicated named account rule; 93(3)(c) exclusive use; 93(3)(d) no third-party interest; 93(3)(e) daily reconciliation. SAMA Circular 46004465 (24/7/2024) reinforces Art. 93 with non-objection + daily reconciliation. The 2020 PSP Regulations Art. 14 (one-business-day deposit, no fees in account, insolvency-remote, fees/commissions excluded from Safeguarded Funds definition) is preserved and strengthened by Art. 93. Escrowed order funds between brand payment and creator payout fall squarely within "Funds received from, or for the benefit of, a Payment Service User for the execution of Payment Transactions."

*Sources:*
- [SAMA Rulebook — Implementing Regulations of the Payments and Payment Services Law](https://rulebook.sama.gov.sa/en/implementing-regulations-payments-and-payment-services-law)
- [SAMA Rulebook — Article 93](https://rulebook.sama.gov.sa/en/article-93-2)
- [SAMA Rulebook — Safeguarding Safeguarded Funds](https://rulebook.sama.gov.sa/en/safeguarding-safeguarded-funds)
- [SAMA — PSP Regulations (2020, PDF)](https://sama.gov.sa/en-US/payment/Documents/PSPs%20Regulations%20111.pdf)

#### Finding 4 — Unlicensed-platform boundary: Nakhla stays strictly on the technical side
**Confidence: high · Vote: 3-0 on each of 3 merged claims (5, 6, 7)**

Without a SAMA license Nakhla must stay strictly on the technical side of the payment flow. SAMA classifies linkage/technical support for e-commerce payments as unlicensed supporting services (requiring technical permits from Saudi Payments), but explicitly excludes from that scope (1) finalizing financial settlement and depositing funds into merchant/payee bank accounts and (2) directly contracting with/registering merchants and performing KYC/AML-CFT/counter-fraud verification for payment purposes — both are reserved for the licensed PSP or bank. Banks must deal only with licensed payment companies and report unlicensed ones to SAMA. **Consequence: creator-payout KYC/AML is the PSP's regulated duty; Nakhla layers its own business-level verification (Mawthooq, identity for platform ToS) on top rather than performing payment-KYC.**

*Evidence:* Circular No. 46004436 (24/7/2024, In-Force, superseding Circular 42080528) verified verbatim: services "must be limited to linkage and technical support only, without including... Directly contracting with merchants, registering them, and carrying out matching procedures and verifying the validity of the merchant's data... to fulfill KYC requirements and requirements related to AML/CFT and Counter-Fraud" and "Finalizing the financial settlement procedures and depositing funds into the merchant's bank account." Also: "Banks must comply with dealing only with licensed companies providing payment services."

*Sources:*
- [SAMA Rulebook — Rules for Dealing with E-Commerce Payment Service and Support Providers](https://rulebook.sama.gov.sa/en/rules-dealing-e-commerce-payment-service-and-support-providers)

### 2.2 ZATCA VAT e-invoicing (FATOORA)

#### Finding 5 — E-invoicing applies to all Nakhla revenue streams; refunds need electronic credit notes
**Confidence: high · Vote: 3-0 on each of 2 merged claims (10, 11)**

ZATCA VAT e-invoicing (FATOORA) applies to all of Nakhla's revenue streams: Phase 1 (generation, from 4 Dec 2021) requires commissions, SaaS subscriptions, and featuring fees to be invoiced from a compliant e-invoicing solution; Phase 2 (integration with ZATCA, from 1 Jan 2023 in waves) applicability must be tracked — waves now reach the SAR 375,000 VAT-registration threshold (Wave 24 deadline 30 Jun 2026), so Nakhla will almost certainly be in scope. Scope covers credit and debit notes in structured electronic format: **escrow refunds of invoiced amounts and commission adjustments on cancelled/disputed orders must be documented with electronic credit notes cryptographically linked to the original invoice (UBL 2.1, type 381, BillingReference + previous invoice hash) — internal ledger entries alone are non-compliant.** Pure escrow-principal refunds where no tax invoice was ever issued need no credit note.

*Evidence:* ZATCA pages verified live: "implemented in two phases. Phase 1 (4 Dec 2021)... Phase 2 (1 Jan 2023)"; "allows the exchange and processing of invoices, credit notes & debit notes in a structured electronic format... through an integrated electronic solution." Verifiers corroborated Art. 40 KSA VAT Implementing Regulations (credit note obligatory on adjustment of an issued tax invoice), Phase 2 wave notices (Wave 23: >SAR 750k, deadline 31 Mar 2026; Wave 24: >SAR 375k, deadline 30 Jun 2026), and validation rule BR-KSA-09 requiring reference to the original invoice. Obligation attaches to resident VAT-registered taxpayers.

*Sources:*
- [ZATCA — E-Invoicing](https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx)
- [ZATCA — E-Invoicing Roll-out Phases](https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/Roll-out-phases.aspx)

### 2.3 Mawthooq / GCAM (now GAMR) influencer licensing

#### Finding 6 — Mawthooq licensing maps onto creator onboarding and paid-placement disclosure
**Confidence: medium · Vote: 3-0 on each of 4 merged claims (20, 21, 22, 23)**

Since 1 Oct 2022, social media advertisers and influencers earning from promotional content in KSA must hold a Mawthooq licence from GCAM (functions since moved to the General Authority for Media Regulation, GAMR/GMedia) — SAR 15,000, valid three years, applied for on the regulator's site, ads publishable only via an account registered with the Authority. Licensed account holders must flag advertising content and verify promoted products/services are themselves properly licensed, across all formats (image, video, audio, text). Organisations engaging influencers are expected to verify the influencers hold valid licences — so **Nakhla should build Mawthooq licence verification into creator onboarding and brand-side matching, gate KSA sponsored deals on it, and apply disclosure labels to sponsored content and its own paid featuring/promoted placements** (the latter also resting on e-commerce/consumer-protection rules). Non-Saudi residents cannot hold the licence individually and must work via licensed agencies; verifiers note 2025 MoC updates report fines up to SAR 500,000 for unlicensed practice and SAR 300,000 for non-disclosure.

*Evidence:* Clyde & Co (14 Sep 2022) verified verbatim on all four elements (deadline, SAR 15,000/3 years, registered-account rule, flagging + product-licensing duty, all-formats scope, "Organisations... should ensure that the individuals they work with are duly licensed"). Verifiers independently corroborated via the regulator's own portal (gmedia.gov.sa lists "Licensing for providing advertising content through social media platforms (mothoq)" as an active e-service in 2026), Saudi Gazette, Arab News, Chambers Media & Entertainment 2025, and Hammad & Al-Mehdar (Sep 2025). Medium rather than high because the cited source is secondary, GCAM has been renamed, and fee/process details should be re-confirmed against gmedia.gov.sa; the brand-side verification duty is prudential law-firm advice, not quoted statute.

*Sources:*
- [Clyde & Co — New social media requirements for Saudi Arabia (Sep 2022)](https://www.clydeco.com/en/insights/2022/09/new-social-media-requirements-for-saudi-arabia)
- [GAMR / GMedia (regulator portal)](https://gmedia.gov.sa)
- [my.gov.sa — Mawthooq licensing e-service](https://my.gov.sa/en/services/698238)

---

## 3. Track 2 — PSP Recommendation

### Recommendation: Tap Payments (primary PSP)
**Confidence: medium · Vote: 3-0 on each of 2 merged claims (14, 15)**

Tap Payments is the strongest **verified** fit:

- **SAMA-licensed** — regulator-announced licensing in June 2020 after sandbox graduation; currently a Major Payment Institution; mada gateway certification with Saudi Payments July 2023. (This element is high-confidence, independently confirmed via the archived SAMA announcement.)
- **Local rails** — mada, Apple Pay, STC Pay, and cards through one integration; payment acceptance + payouts + reporting across Saudi Arabia and GCC markets from one setup.
- **Marketplaces product** — "accept buyer payments, onboard retailers, split funds, deduct commissions, and manage payouts through one regional setup," with coverage spanning KSA, Kuwait, UAE, Bahrain, Qatar, Oman — directly serving both the escrow/split-payout flow and Diwaniya's Kuwait expansion.

**Caveats (why medium):** capability statements are vendor marketing; the homepage contains no detail on escrow-hold windows (a scan confirmed zero instances of "split"/"marketplace"/"escrow" on the main page — marketplace capabilities come only from Tap's product page), and "licensed across the GCC" mixes central-bank licenses (SAMA, Bahrain CBB) with mere commercial registrations (UAE, Kuwait, Oman). **Direct due diligence on Tap's hold/release mechanics, payout SLAs to Saudi IBANs, subscription billing, webhook quality, and fees is required before contract.**

*Sources:*
- [Tap Payments — Saudi Arabia homepage](https://www.tap.company/en-sa)
- [Tap Payments — Marketplaces product](https://www.tap.company/en-sa/products/marketplaces)
- [SAMA News-578 (archived) — "SAMA licenses Tap and BrightWare" (09/06/2020)](https://web.archive.org/web/20200811214340/http://www.sama.gov.sa:80/en-US/News/Pages/News-578.aspx)

### Ruled out: Stripe
**Confidence: high · Vote: 3-0 on each of 2 merged claims (12, 13)**

Stripe is ruled out for both Nakhla (KSA) and the Diwaniya Kuwait fork: Saudi Arabia and Kuwait are both absent from Stripe's supported-country list (the alphabetical list jumps Romania→Singapore and Kenya→Latvia), and the UAE is the only GCC country supported. A KSA-incorporated platform cannot open a local Stripe account or use Stripe Connect; the foreign-entity (Atlas) workaround would lack mada acceptance, SAR local acquiring, and Saudi IBAN payouts while creating SAMA exposure. Stripe's Dec 2025 addition of `kw_bank_account` as a Global Payouts destination softens only the Kuwait payout leg — it enables no Kuwait platform entity, merchant acceptance, or KNET.

*Evidence:* Live fetch on 2026-07-12: zero occurrences of "Saudi" or "Kuwait" anywhere on stripe.com/global including Preview and Extended-network tiers; UAE present. Corroborated by multiple 2026 third-party guides stating Stripe is unavailable to KSA-incorporated businesses. Programmatic GCC check: only UAE found among the six GCC states.

*Sources:*
- [Stripe — Global availability](https://stripe.com/global)

### Comparative claims that did NOT survive verification — direct due diligence required

The PSP comparison is **asymmetric**: only Tap (positive) and Stripe (negative) survived adversarial verification. Claims about the following did **not** survive and must not be treated as evaluated:

- **Moyasar** — no surviving verified claims.
- **HyperPay** — no surviving verified claims.
- **PayTabs** — no surviving verified claims.
- **Checkout.com** — no surviving verified claims.

The Tap recommendation therefore rests on Tap's verified strengths plus Stripe's elimination rather than a full verified head-to-head. Tap's split-payout/escrow-hold mechanics, fees, subscription billing, and webhook quality are vendor-stated or unexamined — **run a real sandbox evaluation and contract review, and benchmark Moyasar/HyperPay/PayTabs directly** (see open question in §6).

---

## 4. Track 3 — Monitoring / Observability Blueprint

### 4.1 Audit trail (event-sourced order/escrow ledger)

From the blueprint synthesis (Finding 10, §5): the platform state machine is recorded in an **append-only, event-sourced order/escrow ledger** — every state transition captured with event type, actor, timestamp, and previous-state hash. Admin arbitration decisions (dispute release/refund) are logged immutably. Nakhla holds only a *ledger claim* on funds; the actual money sits in the PSP's safeguarded account.

### 4.2 PSP webhook capture

A **raw PSP-webhook capture table** — idempotent and replayable — feeds the reconciliation job (P1 in the implementation plan, §7). Every webhook is persisted before processing so financial state can always be rebuilt from source events.

### 4.3 Financial reconciliation

A **daily money-in = payouts + commission + refunds reconciliation job with alerting on breaks**, reconciling Nakhla's ledger against PSP reports. This directly mirrors SAMA's own Art. 93(3)(e) daily-reconciliation duty imposed on the PSP (Finding 3) — the regulator's safeguarding template is the design template for Nakhla's monitoring.

### 4.4 Error/APM: Sentry across the exact stack
**Confidence: high · Vote: 3-0 on each of 4 merged claims (16, 17, 18, 19)**

Sentry fits the exact stack for APM/distributed tracing with near-zero custom instrumentation, except the socket gateway:

1. The current **Next.js SDK** gives distributed tracing out of the box across client, server, and edge runtimes (only App Router on Next.js 14 needs an extra `generateMetadata` step).
2. The **NestJS/Node SDK v8.0.0+** gives it out of the box with just DSN + `tracesSampleRate`.
3. Traces propagate via `sentry-trace` and `baggage` HTTP headers auto-attached to outgoing requests (`browserTracingIntegration` client-side, Node HTTP instrumentation server-side), so web/admin → NestJS API calls trace end-to-end without custom code — and this repo's same-origin Next.js rewrites match the SDK's default propagation targets.
4. **WebSocket channels get no automatic propagation:** Nakhla's VPS socket.io gateway needs manual propagation via `Sentry.getTraceData()` embedding `sentry-trace`/`baggage` in message payloads (or OTel socket.io instrumentation wired into Sentry) to appear in end-to-end traces.

*Evidence:* Both Sentry doc pages verified live (2026-07-12), quotes verbatim: "distributed tracing will work out of the box for the client, server, and edge runtimes"; "In version 8.0.0 and above of the Sentry Node SDK, distributed tracing will work out of the box" with a code sample containing only dsn + tracesSampleRate; "Sentry automatically attaches these headers to outgoing HTTP requests when using the browserTracingIntegration. For other communication channels like WebSockets, you can manually propagate trace information" followed by the exact getTraceData() payload pattern. Qualifiers on the same pages: cross-origin targets need `tracePropagationTargets` + CORS allowlisting of the two headers; all services must run Sentry SDKs.

*Caveat (from research caveats):* Sentry claims come from vendor documentation — "out of the box" presumes SDKs installed with tracing enabled, and **no comparative evaluation vs alternatives (Datadog, Highlight, self-hosted GlitchTip) was verified.**

*Sources:*
- [Sentry — Next.js distributed tracing](https://docs.sentry.io/platforms/javascript/guides/nextjs/tracing/distributed-tracing/)
- [Sentry — NestJS distributed tracing](https://docs.sentry.io/platforms/javascript/guides/nestjs/tracing/distributed-tracing/)

### 4.5 Business dashboards & admin ops

Derived from the event ledger (P5, §7): order funnel, dispute rate, payout latency, SLA breaches — plus admin ops surfaces for subscription management, featuring-slot inventory, and managed-campaign operations.

---

## 5. Compliance Checklist Mapped to Escrow Flow Steps

Synthesized from the blueprint finding (**confidence: medium · vote: derived from all confirmed claims**). The regulatory spine (no platform custody, safeguarding accounts, daily reconciliation, e-invoicing incl. credit notes, technical-only platform scope) is high-confidence primary-sourced; Tap-specific execution details and Mawthooq operational details are medium-confidence.

| Step | Flow event | Compliance & monitoring actions |
|---|---|---|
| 1 | **Order placed / brand pays** | PSP-hosted checkout (Tap: mada/Apple Pay/STC Pay). Funds land **directly in the PSP's SAMA-safeguarded bank account — never a Nakhla account**. ZATCA e-invoice issued for brand-side commission / subscription / featuring fees. |
| 2 | **Funds held (escrow window)** | Funds sit in the PSP's dedicated safeguarding account (Art. 93). Nakhla holds **only a ledger claim** and reconciles daily against PSP reports. |
| 3 | **Creator delivers → brand reviews** | Platform state machine recorded in the append-only, event-sourced order/escrow ledger (event type, actor, timestamp, previous-state hash). Mawthooq licence verified at creator onboarding; disclosure flags applied to sponsored content and paid featuring slots. |
| 4 | **Approval → release / payout** | Nakhla signals the PSP via API; **PSP splits commission and pays the creator's Saudi IBAN** (PSP performs payee KYC/AML). Creator-side commission e-invoiced. |
| 5 | **Dispute → freeze → admin arbitration** | Admin decision logged immutably; PSP executes release or refund. Refunds/adjustments of invoiced amounts get **electronic credit notes linked to the original invoice**. |
| 6 | **Cancellation before approval → refund** | Same as disputes: PSP executes the refund; credit notes for any invoiced amounts; pure escrow-principal refunds (no tax invoice ever issued) need no credit note. |

*Sources (synthesis):* [SAMA Implementing Regulations](https://rulebook.sama.gov.sa/en/implementing-regulations-payments-and-payment-services-law) · [SAMA e-commerce PSP rules](https://rulebook.sama.gov.sa/en/rules-dealing-e-commerce-payment-service-and-support-providers) · [ZATCA E-Invoicing](https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx) · [Tap Marketplaces](https://www.tap.company/en-sa/products/marketplaces) · [Clyde & Co on Mawthooq](https://www.clydeco.com/en/insights/2022/09/new-social-media-requirements-for-saudi-arabia) · [Sentry Next.js tracing](https://docs.sentry.io/platforms/javascript/guides/nextjs/tracing/distributed-tracing/)

---

## 6. Research Gaps (no surviving verified claims — do NOT treat as cleared)

The following sub-questions from the brief produced **no surviving verified claims** and are absent from this report. They must be researched separately before launch:

1. **PDPL (Saudi data protection)** — obligations for this exact data model (creator KYC-adjacent data, brand billing data, message content on the VPS socket gateway, Neon Postgres + Vercel hosting regions): cross-border transfer, registration, and consent obligations; whether anything forces KSA data residency.
2. **MoC E-Commerce Law duties** — platform obligations under the Ministry of Commerce e-commerce regime.
3. **KSA AML/CTF law specifics** — beyond the PSP-scope allocation established in Finding 4.
4. **PCI-DSS scoping via PSP** — not verified; assumed reduced via PSP-hosted checkout but unconfirmed.
5. **Global FTC/ASA promoted-listing disclosure baselines** — the global-baseline track for paid featuring/promoted placement disclosure produced nothing verified.

**Open questions flagged by the research for follow-up:**

- PDPL compliance for this exact data model — what are the cross-border transfer, registration, and consent obligations, and does anything force KSA data residency?
- Does Tap's marketplaces product actually support the multi-day escrow-hold window (brand pays → creator delivers → brand approves) with platform-triggered release/refund and dispute freezes, and how do its fees, payout SLAs to Saudi IBANs, and subscription-billing support compare to Moyasar, HyperPay, and PayTabs in a real sandbox evaluation?
- Could Nakhla lawfully restructure as a single-side commercial agent under Implementing Regulations Art. 7(2) (e.g., agent of the creator only, collecting on the creator's behalf) with SAMA comfort/no-action — or is the dual-sided arbitration model categorically outside the exclusion?
- Under the current GAMR regime, does the platform itself (as a broker of advertising deals and seller of promoted placements) need its own advertising-agency-type licence in addition to verifying creators' Mawthooq licences, and what are the current fees/process post-2025 MoC updates?

**Regulatory currency caveats:** the 2020 PSP Regulations are partially superseded by the 2023 Implementing Regulations — cite the latter as operative. GCAM has merged into GAMR, so Mawthooq fees/process from the 2022 Clyde & Co article should be re-confirmed on [gmedia.gov.sa](https://gmedia.gov.sa). ZATCA Phase 2 wave applicability depends on Nakhla's VAT registration and revenue, and waves are still rolling out (Wave 24 deadline 30 Jun 2026). All regulatory statements verified as of 2026-07-12; SAMA can and does adjust the licensing perimeter — **validate the final structure with KSA counsel before build, especially any reliance on the Art. 7(2) exclusion.**

---

## 7. Prioritized Implementation Plan

| Priority | Workstream | Detail |
|---|---|---|
| **P0** | **PSP integration keeping funds out of Nakhla's hands** | Legal blocker for launch. PSP-hosted checkout; funds flow into the PSP's SAMA-safeguarded account; PSP executes splits, payouts, and payee KYC. Run Tap sandbox due diligence (hold/release mechanics, payout SLAs, fees, webhooks, subscription billing) before contract. |
| **P1** | **Immutable order-event ledger + PSP-webhook capture + reconciliation** | Append-only event-sourced order/escrow ledger (event type, actor, timestamp, previous-state hash). Raw PSP-webhook capture table (idempotent, replayable) feeding a daily *money-in = payouts + commission + refunds* reconciliation job with alerting on breaks — mirroring SAMA's Art. 93(3)(e) daily-reconciliation duty. |
| **P2** | **ZATCA-compliant invoicing + credit-note automation** | On the commission/subscription/featuring billing paths; electronic credit notes linked to original invoices for refunds/adjustments; track Phase 2 wave applicability (Wave 24: >SAR 375k, deadline 30 Jun 2026). |
| **P3** | **Mawthooq gating + disclosure labeling** | Licence verification in creator onboarding; gate KSA sponsored deals; disclosure labels on sponsored content and paid featuring/promoted placements. |
| **P4** | **Sentry rollout** | Across web/admin/API/mobile, plus manual `sentry-trace`/`baggage` propagation (`Sentry.getTraceData()`) on the socket.io gateway. |
| **P5** | **Business dashboards + admin ops surfaces** | Derived from the event ledger: order funnel, dispute rate, payout latency, SLA breaches; admin surfaces for subscriptions, featuring-slot inventory, managed-campaign operations. |

---

## Appendix A — All Sources Consulted (24)

### Primary
| Source | Angle |
|---|---|
| [SAMA — Implementing Regulations, Payments and Payment Services Law](https://rulebook.sama.gov.sa/en/implementing-regulations-payments-and-payment-services-law) | KSA payments law / SAMA escrow authority |
| [SAMA — Law of Payments and Payment Services](https://rulebook.sama.gov.sa/en/law-payments-and-payment-services) | KSA payments law / SAMA escrow authority |
| [SAMA — Rules for Dealing with E-Commerce Payment Service and Support Providers](https://rulebook.sama.gov.sa/en/rules-dealing-e-commerce-payment-service-and-support-providers) | KSA payments law / SAMA escrow authority |
| [SAMA — PSP Regulations 2020 (PDF)](https://sama.gov.sa/en-US/payment/Documents/PSPs%20Regulations%20111.pdf) | KSA payments law / SAMA escrow authority |
| [ZATCA — E-Invoicing](https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx) | KSA influencer, data, e-commerce and tax obligations |
| [Stripe — Global availability](https://stripe.com/global) | PSP bake-off for Saudi marketplaces |
| [Tap Payments — Saudi Arabia](https://www.tap.company/en-sa) | PSP bake-off for Saudi marketplaces |
| [Sentry — Next.js distributed tracing](https://docs.sentry.io/platforms/javascript/guides/nextjs/tracing/distributed-tracing/) | Observability on this exact stack |
| [Sentry — NestJS distributed tracing](https://docs.sentry.io/platforms/javascript/guides/nestjs/tracing/distributed-tracing/) | Observability on this exact stack |

### Secondary
| Source | Angle |
|---|---|
| [Clyde & Co — New social media requirements for Saudi Arabia](https://www.clydeco.com/en/insights/2022/09/new-social-media-requirements-for-saudi-arabia) | KSA influencer, data, e-commerce and tax obligations |
| [Grant Thornton — VAT and electronic marketplace in Saudi Arabia](https://www.grantthornton.sa/en/insights/articles-and-publications/vat_and_electronic_marketplace_in_saudi_arabia/) | KSA influencer, data, e-commerce and tax obligations |

### Blog / forum (lower quality — not load-bearing for verified findings)
| Source | Angle |
|---|---|
| [Miqwal — Saudi Mawthooq influencer certification](https://miqwal.com/en/blog/saudi-mawthooq-influencer-certification) | KSA influencer obligations |
| [Gulf SaaS Review — Best payment gateways Saudi Arabia 2026](https://gulfsaasreview.com/guide/best-payment-gateways-saudi-arabia-2026) | PSP bake-off |
| [Gulf SaaS Review — Tap Payments vs PayTabs GCC 2026](https://gulfsaasreview.com/article/tap-payments-vs-paytabs-gcc-2026) | PSP bake-off |
| [Logio Legion — Tap vs HyperPay vs Moyasar Saudi Arabia 2026](https://logiolegion.com/blogs/tap-payments-vs-hyperpay-vs-moyasar-saudi-arabia-2026) | PSP bake-off |
| [KuwaitDev — MyFatoorah vs KNET vs Tap comparison](https://kuwaitdev.com/en/insights/myfatoorah-vs-knet-vs-tap-comparison/) | PSP bake-off (Kuwait) |
| [Blnk — Building a marketplace with an open-source ledger](https://www.blnkfinance.com/blog/developer-guide-to-building-a-marketplace-with-open-source-ledger-blnk) | Escrow ledger / reconciliation engineering |
| [Formance — Account reconciliation patterns for high-volume fintech](https://www.formance.com/blog/financial-operations/account-reconciliation-patterns-for-high-volume-fintech) | Escrow ledger / reconciliation engineering |
| [Naya Finance — Marketplace payment reconciliation guide](https://naya.finance/learn/marketplace-payment-reconciliation-guide) | Escrow ledger / reconciliation engineering |
| [Fintech Engineering Handbook](https://w.pitula.me/fintech-engineering-handbook/) | Escrow ledger / reconciliation engineering |
| [Modern Treasury — Enforcing immutability in your double-entry ledger](https://www.moderntreasury.com/journal/enforcing-immutability-in-your-double-entry-ledger) | Escrow ledger / reconciliation engineering |
| [Lobste.rs — Ledger implementation in PostgreSQL](https://lobste.rs/s/9sxdp3/ledger_implementation_postgresql) | Escrow ledger / reconciliation engineering |
| [Better Stack — Sentry alternatives](https://betterstack.com/community/comparisons/sentry-alternatives/) | Observability |
| [Origami — Multi-vendor marketplace KPIs](https://origami-marketplace.com/en-gb/multi-vendor-marketplace-kpis/) | Observability / dashboards |

*(Additional finding-level sources: [SAMA Rulebook Art. 93](https://rulebook.sama.gov.sa/en/article-93-2), [SAMA Rulebook — Safeguarding](https://rulebook.sama.gov.sa/en/safeguarding-safeguarded-funds), [ZATCA roll-out phases](https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/Roll-out-phases.aspx), [Tap Marketplaces product](https://www.tap.company/en-sa/products/marketplaces), [archived SAMA News-578](https://web.archive.org/web/20200811214340/http://www.sama.gov.sa:80/en-US/News/Pages/News-578.aspx), [GAMR portal](https://gmedia.gov.sa), [my.gov.sa Mawthooq service](https://my.gov.sa/en/services/698238).)*

## Appendix B — Verification Stats

| Metric | Value |
|---|---|
| Research angles | 5 |
| Sources fetched | 24 |
| Claims extracted | 120 |
| Claims verified | 25 |
| Confirmed | 24 |
| Killed (refuted) | 1 |
| Findings after synthesis | 10 |
| Budget-dropped claims | 6 |
| Agent calls | 106 |
