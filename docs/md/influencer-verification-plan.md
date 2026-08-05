# Influencer Review & Metric Verification — Implementation Plan

**Status:** Draft (2026-07-23) · **Owner:** Ahmed · **Scope:** Nakhla marketplace (KSA/GCC), platforms IG / TikTok / YouTube / Snapchat
**Source:** Deep-research report (29 sources, 20/25 claims verified 3‑0). Citations inline as `[n]`, list at bottom.

---

## 1. TL;DR / Recommendation

Validate creators in **two independent layers**:

1. **Verified metrics (first-party, OAuth).** Real reach/impressions/engagement/follower stats can **only** be obtained by having the creator OAuth-connect their own account — they cannot be scraped from public profiles. This is true for Instagram, TikTok, and YouTube alike [F1]. → Gate a **"Verified Metrics" badge** behind account connection.
2. **Authenticity / fraud score (audience quality).** A verified follower *count* is still self-reported by the platform and can be inflated with bought followers — "verified via API" means **tamper-proof source, not fraud-proof** [C]. → Layer a **fake-follower / audience-quality check** on top, run at onboarding and again before payout.

**Build-vs-buy for a lean startup:** **BUY the fraud layer, self-integrate (or buy) the OAuth layer.**
- Fraud detection in-house = reimplementing an ML feature taxonomy + graph neural nets (RF-GNN) — heavy: needs labeled data, graph infra, per-platform access the vendors already have [F10]. Don't build it.
- Modash Discovery API prices an audience-authenticity report at **~$0.45/creator** (~$0.90 for a full vet), cheap enough to run at onboarding + payout gates — but note the **$16,200/yr floor** (annual contract) [F4][F5].
- OAuth/verified-metrics plumbing: self-integrate official APIs (free, but app-review lead time + per-platform work + Snapchat unknown), **or** buy **Phyllo**, which offloads OAuth, app approvals, normalization, and webhooks across 20+ platforms (quote-based) [F7].

---

## 2. What the current code has vs. what's missing

Current `CreatorProfile` (`apps/api/prisma/schema.prisma`):
- `followersIg / followersTt / followersYt : Int?` — **self-reported, unverified**, no source flag, no timestamp.
- `engagement : Float?`, `avgViews : Int?`, `audience : Json?` — **self-reported / freeform**.
- `platforms : Platform[]` where `enum Platform { instagram tiktok youtube }` — **Snapchat missing** (Snapchat is dominant in KSA — see §6).
- `badges : String[]` — free strings, no verification semantics.
- **Good template already in the repo:** the Mawthooq advertising-licence flow (`MawthooqStatus` enum + `mawthooqSubmittedAt / VerifiedAt / ExpiresAt / ReviewNote`) is exactly the shape we should mirror for social-account verification.

Gaps to close: no OAuth/social-connection model, no verified-vs-self-reported distinction, no fraud/audience-quality score, no Snapchat, no badge gating, no link between verified reach and payout.

---

## 3. Detection signals & thresholds (ready to adopt)

**Fake-follower detection technique used in production (Modash):** network-graph analysis scoring billions of accounts against normal-behaviour patterns, flagging outliers on concrete signals — missing/generic profile picture, unusual following-to-follower ratio (following 1,000+ with few followers), account age, post count/activity, incomplete bio, unnatural growth curve [F8]. Accuracy caveats: **degrades below ~10K followers, gaps on private profiles, false positives** — material for a micro-influencer-heavy KSA market [C].

**Audience segmentation** to surface per creator: `fake` / `influencers` / `mass-followers` (people who follow 1,000–1,500+ accounts) / `real`, plus **reachability** (0–500 / 500–1k follows = good; >1k = followers less likely to see posts) [F9].

**Fake-follower thresholds (adopt directly, tune by size/niche/country):** [F9-thresholds]
- **Badge-eligible:** < 25% fake followers.
- **Block/flag:** > 50% fake followers.
- Expected baselines: ~20–30% fake for large creators, ~10–20% for sub-50K. 100% real is *unusual*.

**Engagement-rate red-flags (secondary source, treat as heuristic, tune for MENA):** <0.5% = bought-follower red flag; 1–3% normal; 3–6% healthy; >10% may indicate purchased engagement.

**Vendor scores if buying:** HypeAuditor **Audience Quality Score (AQS, 1–100)** = 15 metrics over 4 categories (engagement rate, % real audience, follower/following growth patterns, comment authenticity); **Channel Quality Score (CQS)** for YouTube adds demographics [F6].

---

## 4. Official API capabilities (the verified layer)

| Platform | What OAuth unlocks | Hard requirements |
|---|---|---|
| **Instagram** (Graph / Insights API) | reach, impressions, profile views, follower demographics, engagement | OAuth token + `instagram_business_manage_insights` (or FB-login equiv.); **creator must have a professional/business account** — API returns **nothing** for personal accounts [F2] |
| **TikTok** | `user.info.stats` → follower/following/likes/video counts; `user.info.profile` → `is_verified`, links, bio [F3] | **App review/approval** for production; returns platform's self-reported counts (not fraud-proof) [F3] |
| **YouTube** (Analytics API) | views, watch time, subs gained/lost, engagement by date/geo/device | **OAuth only — no service-account flow**; owner must explicitly consent [F1] |
| **Snapchat** | *Unconfirmed — see open question §6* | — |

Key implication: **every creator connects individually**; there is no way to pull a third party's private analytics. This is the product lever — connection = the price of the "Verified" badge.

---

## 5. Phased implementation

### Phase 0 — Data model (foundation)
- Add `snapchat` to `enum Platform`.
- New `SocialAccount` model: `creatorId`, `platform`, `externalId`, `handle`, `accessToken`/`refreshToken` (encrypted), `scopes`, `connectedAt`, `lastSyncAt`, `status` (`connected|expired|revoked`).
- New verified-metrics fields (own model `VerifiedMetric` or columns on `CreatorProfile`): per-platform `verifiedFollowers`, `verifiedReach`, `verifiedImpressions`, `verifiedEngagementRate`, `fakeFollowerPct`, `audienceQualityScore`, `audienceSegmentation Json`, `metricSource` enum (`self_reported | oauth | vendor`), `verifiedAt`, `staleAfter`.
- Badge semantics: replace free-string `badges` usage for trust with typed flags — `verifiedMetrics: bool`, `audienceChecked: bool` (keep alongside existing Mawthooq status for a combined trust signal).

### Phase 1 — Verified-metrics (OAuth) layer
- Build connect flows: Instagram (reuse existing Google-OAuth infra pattern from `apps/api/src/auth`), TikTok (start app review early — it gates production), YouTube.
- Onboarding copy must instruct KSA creators to **convert to a professional IG account** before connecting [F2].
- **Decision point:** self-integrate vs. Phyllo. Recommend self-integrate IG+TikTok+YouTube first (we already run Google OAuth), evaluate Phyllo specifically to (a) cover Snapchat and (b) skip TikTok/IG app-review lead time [F7].

### Phase 2 — Fraud / audience-quality layer
- Wire **Modash Discovery API** (Audience report ~$0.45/creator) — run at onboarding, cache, re-run before payout [F4][F5].
- Store `fakeFollowerPct`, `audienceQualityScore`, segmentation; apply §3 thresholds. Alternative vendor: HypeAuditor (AQS) [F6]; interim cheap option: Collabstr-style public-username checker (no OAuth, classifies Suspicious vs Real) as a pre-connection teaser [F-collabstr].

### Phase 3 — Badges, display, payout gating
- Two public badges: **"Verified Metrics"** (OAuth-connected) and **"Audience Checked"** (fraud vet passed, <25% fake).
- Show verified vs self-reported numbers distinctly in profile + search.
- Tie **escrow release / payout eligibility to verified reach** for reach-based deliverables — with dispute handling (open question §6).

### Phase 4 — KSA / MENA hardening
- Snapchat support (confirm API capability first — see §6).
- Arabic-language comment/spam authenticity tuning.
- Region-tuned thresholds; combine with existing Mawthooq licence status into one trust score.

---

## 6. Open questions / risks (do NOT ship blind)

1. **Snapchat** — dominant in KSA, but *no confirmed data* on what verified reach/engagement its API exposes, or whether Modash/HypeAuditor/Phyllo support it. **Blocking for KSA — resolve before committing the verified layer.**
2. **MENA specifics unconfirmed** — bought-follower prevalence in KSA/GCC, region engagement benchmarks, Arabic spam-detection quality. Needs dedicated regional research before locking thresholds.
3. **Escrow-tied-to-reach viability** — dispute handling, reconciling promised vs delivered reach, and whether creators accept OAuth-as-payout-condition are untested product/business questions.
4. **Vendor cost floor** — Modash API is $16,200/yr minimum (annual, bank transfer) [F4]; verify current pricing before contracting [C]. If pre-revenue, start with per-report HypeAuditor or the public-checker heuristic and upgrade.
5. **Detection accuracy below 10K followers** is weak — most KSA micro-influencers fall here; expect false positives and keep a human-review appeal path (mirror Mawthooq's `reviewNote`).

---

## 7. Vendor shortlist (for evaluation calls)

| Vendor | Role | Why meet | Pricing signal |
|---|---|---|---|
| **Modash** | Fraud/audience-quality API | Cheap per-creator vetting, published pricing, API-first | Discovery API from $16,200/yr, ~$0.45/report [F4][F5] |
| **HypeAuditor** | Fraud/quality scores (AQS/CQS) | Alternative fraud vendor, 5 platforms | Sales-led / custom [F6] |
| **Phyllo** | Unified OAuth aggregator | Offloads OAuth + app-approvals + normalization across 20+ platforms; may cover Snapchat | Quote-based [F7] |

---

## Citations
- **[F1]** Verified reach/engagement only via OAuth first-party — Meta IG Insights, TikTok scopes, YouTube Analytics docs (verified 3‑0).
- **[F2]** IG Insights needs professional account, none for personal — Meta docs (3‑0).
- **[F3]** TikTok `user.info.stats` / `user.info.profile` scopes + app-review + self-reported caveat — TikTok scopes doc (3‑0).
- **[F4]** Modash tiered SaaS + Discovery API $16,200/yr / Raw API $10,000/yr — modash.io pricing (3‑0).
- **[F5]** Modash per-endpoint credits, Audience report ~$0.45 — modash.io pricing (3‑0).
- **[F6]** HypeAuditor AQS (15 metrics/4 categories) + CQS — Influencer Marketing Hub / HypeAuditor Help (3‑0).
- **[F7]** Phyllo OAuth aggregator, 20+ platforms, quote-based — getphyllo.com/pricing (3‑0).
- **[F8]** Modash network-graph detection signals — help.modash.io fake-followers-101 (3‑0).
- **[F9]** Audience segmentation + reachability — Modash (3‑0). **[F9-thresholds]** <25% / >50% fake — Modash (3‑0).
- **[F10]** In-house ML taxonomy + RF-GNN is heavy — Springer / arXiv 2304.08239 (3‑0).
- **[F-collabstr]** Collabstr free public-username fake-follower checker (Suspicious vs Real) — collabstr.com (secondary, unverified).
- **[C]** Caveats: verified = tamper-proof source not fraud-proof; detection degrades <10K; thresholds proprietary; API app-review lead time.
