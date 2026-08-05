# Compliance Gaps Addendum — PDPL, E-Commerce Law, AML/CTF, PCI-DSS

> **Addendum to:** [compliance-monitoring-blueprint.md](./compliance-monitoring-blueprint.md)
>
> This document covers the five tracks where **no claims survived verification in the first research round**: PDPL, MoC E-Commerce Law (M/126), AML/CTF residual duties, PCI-DSS scope, and promoted-listing/ad-disclosure. The prior round's verified findings (SAMA licensing, ZATCA e-invoicing, Mawthooq duties) live in the main blueprint.
>
> **Method:** Deep-research harness — 106 agents, 24 sources fetched, 115 claims extracted, 25 adversarially verified (3-verifier vote per claim), 24 confirmed, 1 refuted. Research date: 2026-07-13.

---

## 1. Executive Summary

Four of the five tracks produced unanimous (3-0), primary-source-verified findings; the fifth — promoted-listing/ad-disclosure norms — produced zero surviving claims for the second consecutive round and is pending targeted re-research.

- **PDPL:** SDAIA has **not** published an adequacy list (the claim that one exists was refuted 0-3), so Nakhla's US/EU hosting on Neon/Vercel must run through the Article 4 safeguards route — practically, **SDAIA-form Standard Contractual Clauses** — plus a **mandatory pre-transfer risk assessment** (Transfer Regulation Art. 7). Controller registration, 72-hour breach e-filing, and DPO appointment are all conditional, criteria-based processes on SDAIA's National Data Governance Platform, each requiring a documented assessment.
- **E-Commerce Law (M/126):** The 7-day consumer withdrawal right lapses once the service is benefited from; all-in VAT-inclusive pricing is mandatory both pre-contract and on the post-contract invoice; merchant identity/CR disclosure and e-store Commercial Register registration apply; platform-intermediary duties flow from MoC instruments under Art. 16, with penalties up to **SAR 1,000,000** plus suspension/blocking.
- **AML/CTF:** Nakhla is **not** an obligated entity under the AML Law's FI/DNFBP definitions. KYC/CDD ownership, 10-year record retention, and STR filing to the Saudi FIU sit legally with the licensed PSP (Tap) and **cannot be contractually shifted** — but Nakhla should mirror the 10-year retention benchmark and build escalation/data-feed plumbing for the PSP's monitoring.
- **PCI-DSS:** SAQ A remains available under v4.0.1 SAQ A r1. The new script-safety eligibility criterion applies **only if Tap's payment page is embedded (iframe/SDK)** — a full redirect flow avoids it entirely, making **redirect the architecturally safest choice**.
- **Promoted-listing/ad-disclosure:** No verified findings after two rounds. See [Section 6](#6-track-5--promoted-listingad-disclosure-pending).

---

## 2. Track 1 — PDPL (Saudi Personal Data Protection Law)

### Finding 1.1 — No adequacy list exists; cross-border hosting requires Article 4 safeguards (SCCs)

**Confidence:** High · **Vote:** 3-0 (×2 merged claims; the competing adequacy-list claim was refuted 0-3)

SDAIA has **not** published an adequacy list, so hosting Saudi personal data on Neon/Vercel (US/EU regions) must proceed under the Article 4 exemption route of the Transfer Regulation (v2.0, Aug 2024), which requires implementing one of three appropriate safeguards: standard contractual clauses, binding common rules, or a certificate of accreditation. For a single-entity platform, **SDAIA-form SCCs (C2P template) are the only practically available safeguard** — BCRs are group-of-companies-only, and Neon/Vercel hold no SDAIA accreditation certificates. Article 2 supplies the purpose basis: "central processing to enable the controller to conduct its activities" and "providing a service or benefit to the data subject" map directly onto cloud hosting of marketplace data.

**Evidence** (verifiers downloaded and read the full official SDAIA PDF, all 11 pages; corroborated by Baker McKenzie, Mayer Brown, King & Spalding):

> Article 4(1): "the controller shall implement the following appropriate safeguards: A. Standard contractual clauses. B. Binding common rules. C. Certificate of accreditation."

> Article 2 lists "Performing necessary operations for central processing to enable the controller to conduct its activities" and "To provide a service or benefit to the subject of the personal data" as permitted Article 29(1)(d) purposes.

King & Spalding (2025) confirms "SDAIA has not disclosed the list of approved jurisdictions." Nuance: SCC availability technically depends on which Article 4(2) exemption case is relied on (SCCs are expressly permitted under cases B, C, E).

**Sources:**
- [SDAIA — Regulation on Personal Data Transfer Outside the Kingdom (official PDF)](https://dgp.sdaia.gov.sa/wps/wcm/connect/e5bbede0-1119-4f70-b4ef-f043ce58d780/Regulation+on+Personal+Data+Transfer+Outside+the+Kingdom..pdf?MOD=AJPERES&CONVERT_TO=url&CACHEID=ROOTWORKSPACE-e5bbede0-1119-4f70-b4ef-f043ce58d780-p6OMj1M)
- [SDAIA — Standard Contractual Clauses for Personal Data Transfer (EN)](https://sdaia.gov.sa/Documents/StandardContractualClausesForPersonalDataTransferEN.pdf)

**Refuted claim (0-3):** "SDAIA maintains and publishes an adequacy list of countries deemed to provide an appropriate level of personal data protection, reviewed every four years." — There is **no 'adequate country' shortcut** for US/EU hosting; everything runs through SCCs + risk assessment until a list is actually published. Monitor SDAIA for publication.

### Finding 1.2 — Transfer risk assessment is mandatory BEFORE production data touches US/EU hosting

**Confidence:** High · **Vote:** 3-0

Article 7(1) of the Transfer Regulation requires a risk assessment before any transfer relying on Article 4 (i.e., any non-adequate destination — which is currently **every** destination) or any continuous/widespread transfer of sensitive data. Article 7(2)(A–F) prescribes exactly six elements: purpose/legal basis; nature of transfer incl. processing activities and geographic scope; safeguards and their adequacy; data-minimization measures; potential material/moral effects and likelihood; mitigating controls.

**Evidence** (verifier read the official PDF directly; SDAIA's Feb-2025 Risk Assessment Guideline corroborates a formal documented process — "documented" is inferred from the guideline and record-keeping duties rather than Article 7's literal wording):

> Article 7(1): "The controller shall conduct a risk assessment before transferring or disclosing personal data to a party outside the Kingdom in the following cases: A. Transfer or disclosure ... in accordance with Article (4) of the Regulation. B. Transferring or disclosing sensitive data ... on a continuous or widespread basis."

**Sources:**
- [SDAIA — Regulation on Personal Data Transfer Outside the Kingdom (official PDF)](https://dgp.sdaia.gov.sa/wps/wcm/connect/e5bbede0-1119-4f70-b4ef-f043ce58d780/Regulation+on+Personal+Data+Transfer+Outside+the+Kingdom..pdf?MOD=AJPERES&CONVERT_TO=url&CACHEID=ROOTWORKSPACE-e5bbede0-1119-4f70-b4ef-f043ce58d780-p6OMj1M)

### Finding 1.3 — Registration, breach notification, and DPO are conditional SDAIA-operated processes

**Confidence:** High · **Vote:** 3-0 (×3 merged claims)

None of the three is automatic; all require a documented assessment:

1. **Controller registration** — SDAIA's National Registry of Personal Data Protection has distinct tracks for private organizations and external (outside-Kingdom) organizations. Registration is mandatory only for public entities, controllers whose **main activity** is data processing, and sensitive-data processors. Nakhla must run and document this assessment.
2. **Breach notification** — filed through a dedicated e-service on the National Data Governance Platform, **within no more than 72 hours of awareness** per Article 24 of the Implementing Regulations (deadline confirmed on the service page itself).
3. **DPO appointment** — conditional. SDAIA publishes an official "DPO Appointment Guiding Tool"; mandatory cases are public entities at scale, core activities involving regular systematic large-scale monitoring, or core activities centered on sensitive data.

**Evidence** (live fetches 2026-07-13, corroborated by Bird & Bird, Morgan Lewis, Baker McKenzie, IAPP, CMS): the registry tracks "Government organizations, Private organizations, External organizations, Non-Profit Entities" with dedicated registration pages; the breach e-service page (title "إشعار تسرب بيانات شخصية") with Start Service button states reporting

> "within no more than (72) hours of awareness per Article 24 of the PDPL Implementing Regulations"

The DPO tool's Arabic label "أداة للتعرف على مدى إلزامية تعيين مسؤول حماية البيانات الشخصية" presupposes conditionality, and SDAIA's Rules for Appointing Personal Data Protection Officer (under PDPL Art. 30(2) / IR Art. 32) enumerate the mandatory cases.

**Sources:**
- [SDAIA National Data Governance Platform — Registration rules and guidelines](https://dgp.sdaia.gov.sa/wps/portal/pdp/Registration/evidences/Rulesandguidelines/)
- [SDAIA — Personal data breach notification e-service](https://dgp.sdaia.gov.sa/wps/portal/pdp/services/personaldatabreachnotification)
- [SDAIA — Rules for Appointing Personal Data Protection Officer (PDF)](https://sdaia.gov.sa/en/SDAIA/about/Documents/RulesforAppointingPersonalDataProtectionOfficer.pdf)

### Do this in the product — PDPL

- [ ] **Execute SDAIA-form SCCs** with (or annexed to the DPAs of) Neon, Vercel, and the VPS/socket host **before production launch**.
- [ ] **Document which Article 4(2) exemption case** each transfer relies on.
- [ ] **Inventory every offshore data flow** — DB, blob storage, logs, email, analytics.
- [ ] **Produce a written Transfer Risk Assessment** covering all six Art. 7(2)(A–F) elements for the Neon/Vercel/VPS stack, keyed to SDAIA's Feb-2025 Risk Assessment Guideline. Treat creator IBANs and any ID documents as elevating risk. Refresh the TRA when regions or vendors change.
- [ ] **Run SDAIA's registry-obligation and DPO tools; archive the outputs** as the documented assessments.
- [ ] **Build an incident-response runbook** with the 72-hour SDAIA e-filing step. Note: the portal login currently requires a Saudi national ID/Iqama (per Baker McKenzie) — **assign a Saudi-resident owner** for the filing step.
- [ ] **Schema:** add breach-clock fields to an `incidents` table — `detected_at`, `sdaia_notified_at`, `subjects_notified_at`.
- [ ] **Revisit the DPO assessment** if follower-analytics processing scales toward "systematic large-scale monitoring".

---

## 3. Track 2 — MoC E-Commerce Law (Royal Decree M/126)

### Finding 2.1 — 7-day withdrawal right lapses on benefit; custom-services mapping unsettled

**Confidence:** High · **Vote:** 3-0 (×2 merged claims)

Under Art. 13, consumers may rescind within 7 days of product receipt or service-contract date, but **only while they have not used the product, benefited from the service, or obtained any benefit** — and the consumer bears rescission costs unless agreed otherwise. Art. 13(2)(a) separately excludes products made to the consumer's request/specifications (except defective/non-conforming ones), and Art. 13(2)(ز) lets the Implementing Regulations add exceptions "as the nature of the products or services requires". For Nakhla: the withdrawal right effectively lapses once creator work is delivered/consumed, **but mapping the custom-made exception to bespoke content-creation *services* is not textually settled** (the clause says منتجات/products) — KSA counsel must bless the refund policy.

**Evidence** (Art. 13(1) Arabic confirmed letter-for-letter across the BOE text, the nezams.com mirror, and alrashidi.law; the official English translation matches):

> "فسخ العقد خلال الأيام السبعة التالية ... ما دام أنه لم يستخدم منتج موفر الخدمة أو لم يستفد من خدمته أو لم يحصل على منفعة من أيّ منهما"

Art. 13(2)'s exception list runs أ–ز (7 items), ending with the regulatory catch-all. The Implementing Regulations' added non-cancellation cases (perishables, hotel/travel/vehicle-rental/event services) do **not** clearly cover custom content creation — hence the counsel flag. No amendment to Art. 13 found through 2026; a public consultation on amending the Implementing Regulations is open on istitlaa.ncc.gov.sa.

**Sources:**
- [Bureau of Experts (BOE) — E-Commerce Law official text](https://laws.boe.gov.sa/Files/Download/?attId=be4eef55-50be-44e3-b94d-adbb011b5736)
- [Al Rashidi Law — E-Commerce Law commentary/mirror](https://alrashidi.law/e-commerce-law/)

### Finding 2.2 — All-in VAT-inclusive pricing, pre-contract and on the invoice

**Confidence:** High · **Vote:** 3-0

Under Arts. 7(d) and 8, the service provider must disclose the **total price inclusive of all fees, taxes (VAT), and delivery-related amounts** both in the pre-contract statement **and** in a post-contract invoice (which must also state per-item costs and delivery date/place). Implementing Regulations Art. 8 additionally requires the invoice to show the tax value with a price breakdown. No exceptions exist in either article.

**Evidence** (verified verbatim against the MoC official publication of M/126):

> Art. 7(د): "إجمالي السعر شاملاً جميع الرسوم أو الضرائب أو المبالغ الإضافية المتعلقة بالتسليم إن وجدت"

> Art. 8 requires a post-contract invoice with the same all-in total plus "تاريخ التسليم ومكانه"

Verifier note: the statutory duty-holder is the service provider (موفر الخدمة) — the creator for gigs — but Nakhla operates the checkout and is itself the service provider for commissions/subscriptions/featuring, so implementing it platform-wide is the sound application.

**Sources:**
- [Bureau of Experts (BOE) — E-Commerce Law official text](https://laws.boe.gov.sa/Files/Download/?attId=be4eef55-50be-44e3-b94d-adbb011b5736)
- [Ministry of Commerce — E-Commerce Law official PDF](https://mc.gov.sa/ar/ECC/ECC_Docs/E-commerce-system.pdf)

### Finding 2.3 — Identity disclosure and e-store Commercial Register registration

**Confidence:** High · **Vote:** 3-0

Under Arts. 6 and 15, every service provider must disclose in its e-store: (a) its name or distinctive identifier and address — **unless** registered with an MoC-licensed e-store authentication body (جهات توثيق المحلات الإلكترونية); (b) means of contact; and (c) its commercial-register name and number if registered. Art. 15 obliges merchants (تاجر, CR-registered persons) to record the e-store itself in the Commercial Register. **Important:** these MoC-licensed e-store authentication bodies (the historical Maroof/توثيق regime, moved to the Saudi Business Center in 2023) are legally **distinct** from GAMR's Mawthooq influencer permit — do not conflate them in policy docs.

**Evidence** (Art. 6 verified verbatim from the MoC official PDF p.5, with the authentication-body exception attaching only to item (a) name/address; Art. 1 p.3 defines the authentication bodies as Ministry-licensed):

> Art. 15 (p.8): "على التاجر أن يُقيِّد محله الإلكتروني في السجل التجاري وفقاً لنظام السجل التجاري"

The claim omits Art. 6(d)'s catch-all ("other data specified by the Regulations") — check the Implementing Regulations' extended disclosure list during implementation.

**Sources:**
- [Bureau of Experts (BOE) — E-Commerce Law official text](https://laws.boe.gov.sa/Files/Download/?attId=be4eef55-50be-44e3-b94d-adbb011b5736)
- [Ministry of Commerce — E-Commerce Law official PDF](https://mc.gov.sa/ar/ECC/ECC_Docs/E-commerce-system.pdf)

### Finding 2.4 — Who owes what: Nakhla wears both hats; penalties up to SAR 1M

**Confidence:** High · **Vote:** 3-0

The Law's substantive duties fall on the **"service provider"** (موفر الخدمة = registered merchant or unregistered practitioner, Art. 1), **not** on marketplace platforms as such. Platform-operator duties derive from MoC instruments under Art. 16, which empowers the Ministry to regulate (a) e-store authentication bodies and (b) "electronic platforms that perform an intermediary role between the service provider and the consumer" — operationalized in the Executive Regulations (Ministerial Decision 200/1441), whose Art. 18 defines intermediary platforms as sites/apps that advertise, promote, take orders or process payments. Penalties (Law Art. 18): warning, **fines up to SAR 1,000,000**, temporary/permanent suspension of e-commerce activity, and partial/total blocking of the e-store. **Nakhla wears both hats:** intermediary platform for creator gigs, and direct service provider for its own subscriptions, commissions, and paid featuring.

**Evidence:** Art. 1 definitions verified verbatim:

> "موفر الخدمة: التاجر أو الممارس"

Art. 16 Arabic text and official English translation confirmed ("electronic platforms acting as intermediaries between a service provider and a consumer"); the penalty menu confirmed identically across lawyerkhalid.com, Saudipedia, Baker McKenzie, and Schlüter Graf ("warning; fine not exceeding 1 Million SAR; temporary or permanent suspension; blocking"). Verifier caveat: platform-facing rules live chiefly in the Executive Regulations plus MoC rules under Art. 16 — "derives from Art. 16" is a slight simplification of the instrument chain, and **the Executive Regulations' intermediary articles were not read directly this round**.

**Sources:**
- [Bureau of Experts (BOE) — E-Commerce Law official text](https://laws.boe.gov.sa/Files/Download/?attId=be4eef55-50be-44e3-b94d-adbb011b5736)

### Do this in the product — E-Commerce Law

- [ ] **Order state machine:** allow no-questions cancellation within 7 days of contracting **only while** `status < creator-work-benefited`.
- [ ] **Refund-policy copy** quoting the Art. 13(1) conditions, in AR/EN.
- [ ] **Record benefit-consumption timestamps** as evidence: draft delivered, content approved, content published.
- [ ] **Separate defect/non-conformity dispute path** with its own cost allocation (distinct from voluntary withdrawal).
- [ ] **Checkout summary shows the all-in SAR total** — VAT and platform fees included — before payment confirmation. No drip pricing.
- [ ] **Auto-generate a post-order invoice** showing per-item cost, VAT value, total, and delivery date (dovetails with the ZATCA e-invoicing duties in the main blueprint).
- [ ] **Apply the same all-in display** to brand SaaS subscription checkout and creator featuring purchases, where Nakhla itself is the service provider.
- [ ] **Site footer + About page** with legal name, address, CR number, and contact channels in AR/EN.
- [ ] **Register Nakhla's e-store in the Commercial Register** (the 2024 unified Commercial Register Law changes mechanics, not the duty).
- [ ] **Creator storefront pages:** surface each creator's disclosed identity / CR-or-practitioner status as collected at onboarding.
- [ ] **Evaluate Saudi Business Center e-store documentation** to use the Art. 6(a) address-disclosure exemption.
- [ ] **Terms of service must explicitly separate Nakhla's two roles** (intermediary platform vs direct service provider).
- [ ] **Obtain and review the Executive Regulations' intermediary-platform articles** (Ministerial Decision 200/1441, esp. Art. 18) with KSA counsel — the text was not independently verified this round.
- [ ] **Build merchant-disclosure enforcement into creator onboarding** — platform rules typically push service-provider disclosure duties down through the platform.

---

## 4. Track 3 — AML/CTF

### Finding 3.1 — Nakhla is NOT automatically an AML-obligated entity

**Confidence:** High · **Vote:** 3-0 (×3 merged claims)

The AML Law (Royal Decree M/20) attaches its preventive duties (CDD, record-keeping, STR filing) only to Financial Institutions and DNFBPs, both defined by reference to activity lists in the Implementing Regulation, not in the Law itself. The IR's FI list (deposit-taking, lending, money or value transfer services, issuing/managing means of payment, securities, FX, portfolio management, safekeeping, life insurance, managing funds for others) and DNFBP list (real-estate brokerage, precious-metals dealers ≥ SAR 50k cash, attorneys/accountants in specified transactions) **do not capture a marketplace that never holds or moves funds**. The SAMA AML/CTF Guide (Circular 18318/486 of 17/11/2019, canonical text on rulebook.sama.gov.sa) is binding as a minimum standard on SAMA-licensed FIs only — i.e., on **Tap Payments, not Nakhla**.

**HARD COUNSEL FLAG:** this holds **only while the PSP-held-escrow model is airtight**. If Nakhla's flow were ever deemed money/value transfer or a licensable payment service under the Payments Law, Nakhla becomes an FI itself.

**Evidence** (AML Law Art. 1(7)-(8) verified on both SAMA Rulebook and MoJ portals):

> FI = "Any conduct as a business one or more of the financial activities or operations specified in the Implementing Regulation ... for or on behalf of a customer"

DNFBP likewise defers to the IR. IR paras 1/2 (A–L) and 1/3 enumerate the activity lists — none covers a non-fund-handling marketplace. The Guide's purpose text, verified verbatim on the Rulebook:

> "help financial institutions operating in Saudi Arabia and licensed by SAMA ... The requirements stated in this Guide are obligatory and are the minimum requirements"

Zero occurrences of "marketplace" or "unlicensed" in the Guide. SAMA's Rules for E-Commerce Payment Service Providers place merchant KYC on the licensed PSP. Note: the legacy sama.gov.sa PDF URL now returns an error page — cite the Rulebook URL in docs.

**Sources:**
- [SAMA Rulebook — Anti-Money Laundering Law](https://rulebook.sama.gov.sa/en/anti-money-laundering-law)
- [SAMA Rulebook — Implementing Regulation of the AML Law](https://rulebook.sama.gov.sa/en/implementing-regulation-anti-money-laundering-law-0)
- [MoJ Laws Portal — AML Law (official EN)](https://laws.moj.gov.sa/en/legislation/zVhz8SdpnY4VthFalSYDlA)
- [SAMA Rulebook — AML/CTF Guide (entire section)](https://rulebook.sama.gov.sa/en/entiresection/1704)

### Finding 3.2 — KYC/CDD ownership sits with the PSP and cannot be shifted

**Confidence:** High · **Vote:** 3-0 (×2 merged claims)

Legal ownership of creator/brand KYC sits with the licensed PSP and **cannot** be shifted to the platform — under the SAMA AML/CTF Guide's third-party-reliance section (implementing IR Arts. 7/10–7/13) and SAMA's outsourcing instructions, the FI relying on another party "is fully responsible" for CDD compliance, even where Nakhla collects identity data or IBANs as the PSP's agent. Separately, AML Law Art. 7 puts CDD on a risk-based footing with mandatory enhanced due diligence for higher-risk customers, so the PSP must risk-rate marketplace users and Nakhla should expect to feed it the data needed.

**Evidence** (Guide Section C verified verbatim on the in-force SAMA Rulebook; corroborated by CMA's parallel AML rules and FATF R.17):

> "the responsibility for implementing due diligence measures shall rest with the financial institution seeking assistance from another party as such financial institution is fully responsible for complying with the regulatory requirements relating to due diligence and SAMA's Instructions for Outsourcing."

> AML Law Art. 7: "Where a higher risk of money laundering was identified, they shall apply enhanced due diligence measures."

Nuance: the formal reliance regime covers reliance on another FI/DNFBP; a marketplace is neither, so Nakhla acts as an outsourced agent under SAMA outsourcing rules — either framing leaves ownership with the PSP. The April 2026 AML Law amendments did not touch Art. 7.

**Sources:**
- [SAMA Rulebook — C. Reliance on a Third Party to Implement Due Diligence Measures](https://rulebook.sama.gov.sa/en/c-reliance-third-party-implement-due-diligence-measures)
- [SAMA Rulebook — Anti-Money Laundering Law](https://rulebook.sama.gov.sa/en/anti-money-laundering-law)

### Finding 3.3 — Record retention is TEN years (double the FATF floor)

**Confidence:** High · **Vote:** 3-0 (×3 merged claims)

AML Law Art. 12 requires FIs/DNFBPs to keep all transaction records ≥ 10 years from transaction conclusion or account closure, and all CDD records (account files, business correspondence, ID copies, analysis results) ≥ 10 years after the business relationship ends — extendable by the Public Prosecution for criminal investigations. Guide Section 6.1 mirrors this (also citing CTF Law Art. 65), including occasional customers. The formal duty sits with the PSP, but Nakhla should mirror the benchmark for records that support the PSP's obligations.

**Evidence** (Art. 12(1)-(3) verified verbatim on the SAMA Rulebook and cross-confirmed via the MoJ gateway API official English text):

> "no less than ten years from the date of concluding the transaction or closure of account"; CDD records "at least ten years after the business relationship has ended" (Public Prosecution extension applies)

Guide Section 6.1 fetched live (2026-07-13) with an identical 10-year floor plus extension "according to the regulatory requirements". FATF R.11's floor confirmed at 5 years. The 17 April 2026 Council of Ministers amendments (per CMS legal update) touched Arts. 14/15/16/18/28/33/50 — **Art. 12 untouched**.

**Sources:**
- [SAMA Rulebook — Anti-Money Laundering Law](https://rulebook.sama.gov.sa/en/anti-money-laundering-law)
- [SAMA Rulebook — Section 6: Record Keeping](https://rulebook.sama.gov.sa/en/section-6-record-keeping)
- [MoJ Laws Portal — AML Law (official EN)](https://laws.moj.gov.sa/en/legislation/zVhz8SdpnY4VthFalSYDlA)

### Finding 3.4 — STR path runs through the PSP to the Saudi FIU; monitoring and tipping-off rules

**Confidence:** High · **Vote:** 3-0 (×3 merged claims)

The national FIU is the **General Directorate of Financial Intelligence** (formerly SAFIU; MoJ translation: "General Administration of Financial Investigations"), under the President of State Security (AML Law Art. 17) — the single central agency receiving suspicious transaction reports. Obligated entities (**the PSP, not Nakhla**) must notify it "immediately and directly" with a detailed report on suspicion, including attempted transactions (Art. 15), and the Directorate can demand additional information even from institutions that have not filed (Art. 18, routed via the supervisory authority for non-filing FIs). The SAMA Guide adds: continuous transaction monitoring (Section 7, per AML Law Art. 13 / CTF Law Art. 69), documented board-approved internal escalation procedures with a designated reporting officer, tipping-off prohibitions, and retention of all STR copies plus internal reports on cases investigated but not filed (Section 8, per AML Law Arts. 15–16).

**Evidence** (verified verbatim on the SAMA Rulebook and MoJ gateway API):

> Art. 17: "national central agency to receive suspicious transaction reports ... under the oversight of the President of the State Security"

> Art. 15: "Immediately and directly notify the General Administration of Financial Investigations ... provide it with a detailed report"

Art. 18's information-demand power verified, including the supervisory-authority routing nuance for non-filers. Guide Sections 7, 8.1 (board-approved escalation procedures, non-alerting), and 8.11 (keep STR copies + internal reports on unreported investigations) verified verbatim. **Note:** influencer-marketplace-specific red-flag typologies were **not** found in any primary source — the red-flag list in the actions below is analytical, not regulator-issued.

**Sources:**
- [SAMA Rulebook — Anti-Money Laundering Law](https://rulebook.sama.gov.sa/en/anti-money-laundering-law)
- [MoJ Laws Portal — AML Law (official EN)](https://laws.moj.gov.sa/en/legislation/zVhz8SdpnY4VthFalSYDlA)
- [SAMA Rulebook — Section 7: Monitoring Transactions and Activities](https://rulebook.sama.gov.sa/en/section-7-monitoring-transactions-and-activities)
- [SAMA Rulebook — Section 8: Reporting Suspicious Transactions](https://rulebook.sama.gov.sa/en/section-8-reporting-suspicious-transactions)

### Do this in the product — AML/CTF

- [ ] **Contractually document** that all funds flow through the PSP with Nakhla never in the settlement chain.
- [ ] **Have counsel confirm the Tap escrow structure** against SAMA's payment-service activity lists **before launch**.
- [ ] **Schema (per user):** `kyc_status`, `kyc_provider_ref`, `risk_tier`, `pep_flag` / `sanctions_flag` (PSP-sourced, read-only), `iban_verified_at`.
- [ ] **Data-sharing/agency annex in the PSP contract** defining exactly which fields Nakhla collects on the PSP's behalf and how they transit (this feeds the PDPL processor analysis too).
- [ ] **Payout gating on `kyc_status`** — never release escrow to an unverified creator.
- [ ] **Expose monitoring signals to the PSP** via API/webhook: account age, order velocity, dispute rate, payout-destination changes.
- [ ] **Retention policy:** orders, payout records, disputes, KYC-adjacent metadata, and chat threads attached to transactions retained **10 years** from order completion or account closure — soft-delete/archive, never hard-delete inside the window.
- [ ] **Reconcile with PDPL data minimization** in the retention schedule (legal-obligation / legitimate-interest basis for the 10-year hold).
- [ ] **Matching retention/audit-support clauses in the PSP contract.**
- [ ] **Internal SOP:** suspicious-activity flags (fake-follower monetization, circular brand-creator payments, rapid IBAN changes, order values inconsistent with audience size, split payments) escalate to a **named compliance owner who reports to the PSP** — never directly to the FIU and **never disclosed to the user** (tipping-off prohibition). *(Red-flag list is analytical, not regulator-issued.)*
- [ ] **Admin tooling:** a case log storing what was flagged, when, the decision, and the PSP handoff reference — retained 10 years.
- [ ] **Contractually define the PSP escalation channel and SLA.**

---

## 5. Track 4 — PCI-DSS

### Finding 4.1 — SAQ A is achievable; the decisive fork is embed vs redirect

**Confidence:** High · **Vote:** 3-0 (×2 merged claims)

PCI DSS v4.0.1 SAQ A r1 (effective 31 Mar 2025, after removing Requirements 6.4.3/11.6.1) added an e-commerce eligibility criterion: *"The merchant has confirmed that their site is not susceptible to attacks from scripts that could affect the merchant's e-commerce system(s)."* Per PCI SSC **FAQ 1588**, this criterion applies **only** when the merchant's page embeds the TPSP's payment page/form (e.g., iframe); it does **not** apply when the merchant redirects to the TPSP (HTTP 30x, meta refresh, or JavaScript redirect) or fully outsources payment (e.g., emailed payment links). If embedded, it can be satisfied either via 6.4.3/11.6.1-style script-integrity controls or via **written confirmation from the PCI-compliant TPSP** that its embedded solution protects against script attacks.

**Evidence** (FAQ 1588 fetched live 2026-07-13; both the eligibility criterion and the embedded-vs-redirect scoping verified verbatim; corroborated by the PCI SSC blog — FAQ published 2025-02-28 for SAQ A r1 — and QSA analyses from TrustedSec, SecurityMetrics, Jscrambler, HUMAN, and Adyen docs):

> "does not apply to e-commerce merchants with a webpage that redirects customers ... (for example ... an HTTP 30x redirect, a meta redirect tag, or a JavaScript redirect) or ... that fully outsource payment functions"

Caveats: acquirers/payment brands may impose stricter requirements than SAQ A; a JavaScript redirect still executes script on the merchant page and QSAs flag it as a residual risk even though formally out of the criterion's scope. Note: the original question's premise "webhooks do NOT expand scope, JS on checkout does" is directionally confirmed by the FAQ's script focus, **but no primary source this round addressed webhooks explicitly**.

**Sources:**
- [PCI SSC — FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/)
- [PCI SSC Blog](https://blog.pcisecuritystandards.org)

### Do this in the product — PCI-DSS

- [ ] **Prefer Tap's full-redirect hosted checkout** over an embedded iframe/Card SDK — it sidesteps the script criterion entirely.
- [ ] **If the iframe/SDK route is chosen for UX:** obtain Tap's **written script-attack-protection attestation** AND minimize/inventory all JS on the checkout page (CSP, SRI, script allowlist).
- [ ] **Annual evidence:** completed SAQ A + Attestation of Compliance filed with the acquirer, plus quarterly ASV scans if the acquirer requires them.
- [ ] **Keep webhooks/server-side order APIs out of CDE scope** by never accepting PANs — tokens and webhook payloads without card data do not expand scope, but any script running on the payment page does.
- [ ] **Re-check SAQ A eligibility whenever marketing/analytics scripts are added near checkout.**
- [ ] **Open question to resolve with Tap:** does the KSA checkout for this integration render as a full redirect or an embedded iframe/Card SDK — and if embedded, will Tap issue the written confirmation FAQ 1588 contemplates?

---

## 6. Track 5 — Promoted-Listing / Ad-Disclosure

> **Status: RESOLVED via targeted primary-source re-run (2026-07-13).** The two workflow rounds produced zero surviving claims; a focused agent then fetched and quoted the primary documents directly. Findings below are sourced from regulator texts unless flagged otherwise.

### 6.1 FTC Endorsement Guides — 16 CFR Part 255 (2023 revision) — *primary: regulation text*

Source: [16 CFR 255, govinfo 2025 edition](https://www.govinfo.gov/content/pkg/CFR-2025-title16-vol1/xml/CFR-2025-title16-vol1-part255.xml) (88 FR 48102, July 26, 2023); [FTC Disclosures 101](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers); [FTC Endorsement FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking).

- **§ 255.0(f) "clear and conspicuous"** (verbatim): *"a disclosure is difficult to miss (i.e., easily noticeable) and easily understandable by ordinary consumers. If a communication's representation necessitating a disclosure is made through visual means, the disclosure should be made in at least the communication's visual portion; if the representation is made through audible means, the disclosure should be made in at least the communication's audible portion."*
- Disclosures hidden behind a **"more" link, in comments, or in hashtag clumps fail**: *"If the endorsement is visible without having to click on the link labeled 'more,' but the disclosure is not visible without doing so, then the disclosure is not unavoidable and thus is not clear and conspicuous."* Platform built-in disclosure tools are **not a safe harbor**.
- **§ 255.1(d) advertiser monitoring duty** — guidance → monitoring → remediation: advertisers should *"take action sufficient to remedy non-compliance and prevent future non-compliance. While not a safe harbor, good faith and effective guidance, monitoring, and remedial action... reduce an advertiser's odds of facing a Commission enforcement action."*
- **Material connection** includes *"a personal, family, or employment relationship or a financial relationship – such as the brand paying you or giving you free or discounted products or services."* Wording like *"Thanks to Acme brand for the free product"* suffices; `#ad` / `#sponsored` fine. Video → disclosure **in the video**, not just description; live streams → **repeated periodically**.
- Responsibility allocation (FAQ, verbatim): *"the ultimate responsibility for clearly and conspicuously disclosing a material connection rests with the influencer and the brand – not the platform"* — but advertisers running networks *"need to have reasonable programs in place to train and monitor members of their network."*

### 6.2 FTC — paid placement in search results / native ads — *primary: FTC guidance*

Source: [2013 search-engine guidance press release](https://www.ftc.gov/news-events/news/press-releases/2013/06/ftc-consumer-protection-staff-updates-agencys-guidance-search-engine-industry-need-distinguish); [Native Advertising: A Guide for Businesses](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses).

- *"Failing to clearly and prominently distinguish advertising from natural search results could be a deceptive practice"* — applies to *"paid search results and other forms of advertising"* in any search UI, including marketplace verticals.
- **Label wording** (Native Ad Guide, verbatim): *"Terms likely to be understood include 'Ad,' 'Advertisement,' 'Paid Advertisement,' 'Sponsored Advertising Content'... Advertisers should not use terms such as 'Promoted' or 'Promoted Stories,' which in this context are at best ambiguous."*
- **Proximity**: *"Place disclosures in front of or above the headline of the native ad"*; on focal images if the image is the hook; *"in the same language as the predominant language in which the ad is presented."*
- Liability reaches **everyone who participates in presenting** the ad — the FTC has acted against ad agencies and network operators, not just advertisers.
- ⚠️ *Unverified*: the 2013 letter's specific shading/border techniques (PDF not retrievable this session) — directionally consistent with the press release; quote the letter before citing specifics in policy.

### 6.3 UK — CAP Code + CMA platform principles — *primary: code + GOV.UK guidance*

Source: [CAP Code Section 2](https://www.asa.org.uk/type/non_broadcast/code_section/02.html); [CMA "Hidden ads: principles for social media platforms" (Nov 2022)](https://www.gov.uk/government/publications/reviews-and-endorsements-principles-for-social-media-platforms/hidden-ads-principles-for-social-media-platforms).

- CAP 2.1: *"Marketing communications must be obviously identifiable as such."* Advertorials must be headed e.g. *"advertisement feature."*
- CMA timing standard (verbatim): *"the law requires content to be clearly recognisable as advertising as soon as the reader starts to engage with it."*
- CMA six platform principles: publish a labeling policy (payment, free product, **or own commercial interest** all trigger it); **one-click labeling tool** + algorithmic prompts for suspected unlabeled ads; **proactive detection** (brand tags, embedded/affiliate links, image recognition) with removal and creator accountability; **public reporting mechanism** for hidden ads; facilitate brand compliance; enforce via T&Cs sanctions.
- ⚠️ *Partially unverified*: ASA influencer-guide PDF specifics ("#ad upfront") — same standard as the CMA timing quote above, but the PDF itself wasn't parsed.

### 6.4 Saudi Arabia — GAMR (ex-GCAM) Mawthooq — *near-primary*

Source: [Saudipedia — Mawthooq license](https://saudipedia.com/en/what-is-the-mawthooq-license) (Ministry of Media initiative); [GAMR service page](https://gmedia.gov.sa/ar/services/licensing-for-providing-advertising-content-through-social-media-platforms-trusted); [SPA announcement](https://www.spa.gov.sa/2373584).

- Mawthooq license is **mandatory** for anyone advertising via social media *"about a brand, product, service, event, or commercial activity offered or located within the Kingdom"* — sponsorships count. (Nakhla already gates orders on `mawthooqStatus` — aligned.)
- Licensee disclosure obligation (verbatim, Saudipedia): *"Clearly indicating that the content being displayed is an advertisement or promotional material, whether paid or unpaid, to avoid any confusion."* Ads may only run from the account registered with the Authority.
- Arabic wording via SPA (⚠️ *treat exact phrasing as unverified* — regulation PDF on gmedia.gov.sa geo/bot-blocked; fetch from a KSA IP or via counsel): "وجوب التنويه قبل الإعلان بالإشارة إلى أنه محتوى إعلاني سواء بالكتابة أو شفهيًا، على أن يكون ذلك بشكل واضح للمتلقي" — the ad must be flagged **before it runs**, in writing or verbally, clearly to the recipient.

### 6.5 Do this in the product

**Featured-slot UI labeling (search + homepage):**
- [ ] Badge every paid slot: EN **"Ad"** or **"Sponsored"** — never "Promoted" or "Featured" alone (FTC calls "Promoted" ambiguous). AR: **"إعلان"** (safest given Mawthooq's wording; "مُموَّل" is the Meta-style "Sponsored" equivalent).
- [ ] Badge placement: on the card, before/above the creator name; distinct shading/border on the whole card; never tooltip/hover/below-fold. Same contrast rules in dark mode + mobile.
- [ ] Label renders in the viewer's UI language (FTC same-language rule) — EN + AR strings in web i18n and mobile `dict.ts`.
- [ ] Label decided **server-side**: `isSponsored` + `sponsoredCampaignId` on every search/homepage API row, so no client can drop it.

**Schema:**
- [ ] `FeaturedSlot`/listing flag: `isSponsored: boolean`, `sponsoredCampaignId` (ties into the planned featuring revenue stream).
- [ ] `Order`/deal: `disclosureRequired` (default true). Mawthooq fields already exist on `CreatorProfile`.

**Creator policy + tooling (CMA P1/P2):**
- [ ] Published hidden-ads policy: disclosure for payment, free product, or own-brand interest; upfront placement (#ad / "إعلان" at caption start, superimposed on Stories, in-video + verbal, repeated in live streams; never buried in hashtags/comments/"more").
- [ ] Delivery flow: creator must confirm the published content carries the disclosure label before a deal can be marked delivered.

**Admin monitoring (FTC 255.1(d) + CMA P3/P4):**
- [ ] Admin queue over delivered orders with automated disclosure check (brand tags, links, missing "إعلان"/#ad) → prompt → escalate → suspend on repeat; log every step (documented good-faith programs weigh in enforcement).
- [ ] Public "report hidden ad" affordance routed to admin.

**Still to close out:** 2013 FTC letter PDF specifics; ASA influencer-guide PDF; exact Arabic text of GAMR's "ضوابط تقديم المحتوى الإعلاني" (fetch from KSA IP / counsel).

---

## 7. Where KSA Counsel Remains Mandatory

Collected from all counsel flags across the findings and caveats:

1. **Tap escrow structure vs SAMA payment-service licensing** *(hard flag)* — confirm the PSP-held-escrow model keeps Nakhla outside SAMA's payment-service activity lists / the Payments Law. The entire AML non-obligated-entity conclusion holds only while this model is airtight; if payout-instruction authority or the contractual construction (merchant of record, who instructs payouts) makes Nakhla a payment-service participant, Nakhla becomes an FI itself.
2. **E-Commerce Art. 13(2)(a) custom-products exception** — whether the "made to the consumer's specifications" withdrawal exception (which textually says منتجات/products) maps onto bespoke content-creation **services**. The refund policy needs counsel sign-off.
3. **SDAIA SCC execution mechanics with US vendors** — Neon/Vercel are unlikely to countersign Saudi-form clauses; counsel must structure how the SDAIA-form SCCs attach (e.g., annexed to existing DPAs) to be valid.
4. **GAMR/GCAM Mawthooq labeling terms in Arabic** — the exact disclosure vocabulary KSA regulators expect for promoted placement and sponsored content. The targeted re-run (§6.4) surfaced SPA-reported wording, but GAMR's regulation PDF ("ضوابط تقديم المحتوى الإعلاني") was geo/bot-blocked — obtain the official text from a KSA IP or via counsel before finalizing policy copy.
5. **E-Commerce Executive Regulations (Ministerial Decision 200/1441)** — the intermediary-platform articles (esp. Art. 18) most directly relevant to Nakhla were cited by verifiers but **not read end-to-end this round**; direct review with counsel is required, along with monitoring the open Implementing-Regulations amendment consultation on istitlaa.ncc.gov.sa.

**Time-sensitive monitoring items** (from the research caveats):

- **April 2026 AML Law amendments** (Council of Ministers, 17 Apr 2026) changed Arts. 14/15/16/18/28/33/50 — verified as not touching the articles cited here (per CMS update), but re-check before relying on this addendum externally.
- **SDAIA proposed PDPL Implementing Regulation amendments** in April 2025 — monitor for adoption.
- **SDAIA adequacy list** — none exists today; if published, the cross-border analysis in Track 1 simplifies materially.
- **BOE canonical URLs** — several Arabic statutes were verified via official mirrors (MoC PDF, nezams.com, MoJ gateway API) because laws.boe.gov.sa geo-blocks/times out from outside KSA; text confidence is high, but re-cite the BOE canonical URLs from a KSA network.
- **SDAIA breach portal login requires a Saudi national ID/Iqama** (per Baker McKenzie) — constrains who at Nakhla can file within the 72-hour window; keep the assigned owner current.

---

## 8. Appendix — Sources & Verification Stats

### Verification stats

| Metric | Value |
|---|---|
| Research angles | 5 |
| Agents dispatched | 106 |
| Sources fetched | 24 |
| Claims extracted | 115 |
| Claims adversarially verified | 25 |
| Confirmed | 24 |
| Refuted (killed) | 1 |
| Findings after synthesis | 13 (12 verified + 1 Track 5 absence finding, since resolved by the targeted re-run in §6) |
| Budget-dropped claims | 6 |

All surviving findings carry unanimous 3-0 verifier votes (several are merges of 2–3 independently verified claims). The single refuted claim — the SDAIA adequacy list — was killed 0-3 against the [official SDAIA Transfer Regulation PDF](https://dgp.sdaia.gov.sa/wps/wcm/connect/e5bbede0-1119-4f70-b4ef-f043ce58d780/Regulation+on+Personal+Data+Transfer+Outside+the+Kingdom..pdf?MOD=AJPERES&CONVERT_TO=url&CACHEID=ROOTWORKSPACE-e5bbede0-1119-4f70-b4ef-f043ce58d780-p6OMj1M).

### Source list

**PDPL — primary-source obligations & cross-border hosting**

| Quality | Source |
|---|---|
| Primary | [SDAIA — Regulation on Personal Data Transfer Outside the Kingdom (PDF)](https://dgp.sdaia.gov.sa/wps/wcm/connect/e5bbede0-1119-4f70-b4ef-f043ce58d780/Regulation+on+Personal+Data+Transfer+Outside+the+Kingdom..pdf?MOD=AJPERES&CONVERT_TO=url&CACHEID=ROOTWORKSPACE-e5bbede0-1119-4f70-b4ef-f043ce58d780-p6OMj1M) |
| Primary | [SDAIA National Data Governance Platform — Registration rules and guidelines](https://dgp.sdaia.gov.sa/wps/portal/pdp/Registration/evidences/Rulesandguidelines/) |
| Secondary | [King & Spalding — International personal data transfers under Saudi Arabia's data protection law](https://www.kslaw.com/news-and-insights/international-personal-data-transfers-under-saudi-arabias-data-protection-law) |
| Secondary | [DLA Piper Data Protection — Saudi Arabia](https://www.dlapiperdataprotection.com/?c=SA) |

**E-Commerce Law — platform-operator duties & refund exceptions**

| Quality | Source |
|---|---|
| Primary | [Bureau of Experts (BOE) — E-Commerce Law official text](https://laws.boe.gov.sa/Files/Download/?attId=be4eef55-50be-44e3-b94d-adbb011b5736) |
| Secondary | [Mondaq — The New Executive Regulations of the Saudi E-Commerce Law](https://www.mondaq.com/saudiarabia/new-technology/936424/call-to-action-the-new-executive-regulations-of-the-saudi-e-commerce-law) |
| Secondary | [Schlüter Graf — Key Legal Aspects of E-Commerce in KSA (PDF)](https://www.schlueter-graf.com/fileadmin/user_upload/220209_Key_Legal_Aspects_of_E-Commerce_in_KSA--.pdf) |

**AML/CTF — residual duties for marketplaces using a licensed PSP**

| Quality | Source |
|---|---|
| Primary | [SAMA Rulebook — Anti-Money Laundering Law](https://rulebook.sama.gov.sa/en/anti-money-laundering-law) |
| Primary | [SAMA — AML/CTF Guide (legacy PDF; URL now errors — cite Rulebook instead)](https://www.sama.gov.sa/en-US/Laws/BankingRules/The%20Anti-Money%20Laundering%20and%20Counter-Terrorism%20Financing%20AML%20-%20CTF%20Guide.pdf) |
| Primary | [MoJ Laws Portal — AML Law (official EN)](https://laws.moj.gov.sa/en/legislation/zVhz8SdpnY4VthFalSYDlA) |
| Blog | [Sumsub — AML/KYC in Saudi Arabia](https://sumsub.com/blog/aml-kyc-saudi-arabia/) |
| Blog | [FluxForce — Saudi Arabia jurisdiction overview](https://www.fluxforce.ai/jurisdictions/saudi-arabia) |
| Unreliable (0 claims used) | [Global Regulatory Insights — AML analysis Saudi Arabia 2024](https://globalregulatoryinsights.com/insight/anti-money-laundering-comprehensive-analysis-in-saudi-arabia-2024/) |

**PCI-DSS — v4 SAQ A eligibility & scope-creep pitfalls**

| Quality | Source |
|---|---|
| Primary | [PCI SSC — FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/) |
| Primary | [PCI SSC Blog — FAQ clarifies new SAQ A eligibility criteria](https://blog.pcisecuritystandards.org/faq-clarifies-new-saq-a-eligibility-criteria-for-e-commerce-merchants) |
| Primary | [PCI SSC — SAQ A v4.0 (PDF)](https://listings.pcisecuritystandards.org/documents/PCI-DSS-v4-0-SAQ-A.pdf) |
| Secondary | [Schellman — Important PCI DSS v4.0.1 update for e-commerce merchants](https://www.schellman.com/blog/pci-compliance/important-pci-dss-v4.0.1-update-for-e-commerce-merchants) |
| Blog | [TrustedSec — The hidden trap in the PCI DSS SAQ A changes](https://trustedsec.com/blog/the-hidden-trap-in-the-pci-dss-saq-a-changes) |
| Blog | [Feroot — SAQ A-EP Requirements 6.4.3 / 11.6.1](https://www.feroot.com/blog/saq-a-ep-requirements-6-4-3-11-6-1/) |

**Promoted-listing & ad-disclosure (Track 5 — workflow rounds produced no surviving claims; resolved by the targeted primary-source re-run in §6)**

| Quality | Source |
|---|---|
| Primary | [16 CFR Part 255, 2023 revision (govinfo XML)](https://www.govinfo.gov/content/pkg/CFR-2025-title16-vol1/xml/CFR-2025-title16-vol1-part255.xml) |
| Primary | [eCFR — 16 CFR Part 255](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255) |
| Primary | [FTC — Disclosures 101 for Social Media Influencers](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers) |
| Primary | [FTC — Endorsement Guides: What People Are Asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) |
| Primary | [FTC — Native Advertising: A Guide for Businesses](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses) |
| Primary | [FTC — 2013 search-engine guidance press release](https://www.ftc.gov/news-events/news/press-releases/2013/06/ftc-consumer-protection-staff-updates-agencys-guidance-search-engine-industry-need-distinguish) |
| Primary | [CAP Code Section 2 (ASA)](https://www.asa.org.uk/type/non_broadcast/code_section/02.html) |
| Primary | [CMA — Hidden ads: principles for social media platforms](https://www.gov.uk/government/publications/reviews-and-endorsements-principles-for-social-media-platforms/hidden-ads-principles-for-social-media-platforms) |
| Primary | [GOV.UK — CMA tackles undisclosed advertising online](https://www.gov.uk/government/news/cma-tackles-undisclosed-advertising-online) |
| Primary | [ACM — Sponsored ranking study (PDF)](https://www.acm.nl/sites/default/files/documents/sponsored-ranking-study-acm.pdf) |
| Near-primary | [Saudipedia — What is the Mawthooq License](https://saudipedia.com/en/what-is-the-mawthooq-license) |
| Near-primary | [GAMR — advertising-content licensing service page](https://gmedia.gov.sa/ar/services/licensing-for-providing-advertising-content-through-social-media-platforms-trusted) |
| Secondary | [SPA announcement (Arabic wording — JS-rendered, partially verified)](https://www.spa.gov.sa/2373584) |
| Secondary | [Clyde & Co — New social media requirements for Saudi Arabia](https://www.clydeco.com/en/insights/2022/09/new-social-media-requirements-for-saudi-arabia) |

---

*Generated 2026-07-13 from the deep-research verification run (106 agents, 5.19M tokens, 1,028 tool calls). Nothing in this document is legal advice; the counsel flags in [Section 7](#7-where-ksa-counsel-remains-mandatory) are mandatory gates before launch.*
