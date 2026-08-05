# Social Login Runbook — Google (live) + Apple (pending)

Last updated: 2026-07-07

## Current state

| Item | Value |
|---|---|
| GCP account | `devya.solutions@gmail.com` (devya browser profile) |
| GCP project | `nakhla` (`modern-ellipse-501622-m5`) |
| Console | https://console.cloud.google.com/auth/overview?project=modern-ellipse-501622-m5 |
| OAuth client (Web) | "Nakhla Web" — `43558270000-jtqc4aj0rk6rn8t6mrkus9l81gqi6089.apps.googleusercontent.com` |
| Consent screen | "Nakhla", External, **In production**, unverified branding (fine for openid/email/profile) |
| Authorized JS origins | `https://collabstr-clone.vercel.app`, `http://localhost:3000`, `http://localhost` |
| API endpoint | `POST /api/v1/auth/google` (`apps/api/src/auth/auth.service.ts` → `googleLogin()`) |
| Web button | GIS `renderButton` in `apps/web/src/app/login/login-form.tsx` |
| Env — web | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (local `.env.local` + Vercel prod + `turbo.json` build.env) |
| Env — api | `GOOGLE_CLIENT_IDS` (comma-separated allowlist; local `.env` + Vercel prod) |
| DB | `OAuthAccount` model, `User.passwordHash` nullable (migration `20260706222615_google_oauth_accounts`) |

Flow: client obtains Google **ID token** → posts to API → API verifies signature/audience → links via `OAuthAccount(provider, sub)` → issues normal Nakhla JWT cookies. New Google user without role gets `409 {code: "ROLE_REQUIRED"}` → login form shows brand/creator picker and retries.

## Known issue (why you saw "Error 400: invalid_request")

"Access blocked: Authorization Error … Error 400: invalid_request" from the Google popup means the **page origin wasn't accepted** for the client ID. Causes, in likelihood order:

1. Clicked from `https://collabstr-web.localhost` (or any `*.localhost`) — Google permanently refuses non-public TLDs; this origin can never be registered. Local testing works only on exact `http://localhost:3000`.
2. Propagation delay — origins on a freshly created client take **5 minutes to a few hours** to activate. Client was created 2026-07-07 ~01:30 (+03). Retry on `https://collabstr-clone.vercel.app/login` later.
3. Any other unregistered origin (deployment-specific `collabstr-clone-xxxx.vercel.app` preview URLs are NOT registered — only the canonical prod alias is).

If it persists on prod >2h after creation: open the "error details" link on the error page — it names the rejected origin.

## When the real domain is live (e.g. nakhla.sa)

### 1. Vercel — attach domain
- `vercel domains add nakhla.sa` on project `collabstr-clone` (team `eng-ahmedmahmouds-projects`), plus `www` redirect.
- Keep `collabstr-clone.vercel.app` working during transition.

### 2. Google console — add origins (devya.solutions@gmail.com)
Auth Platform → **Clients** → "Nakhla Web" → Authorized JavaScript origins → add:
- `https://nakhla.sa`
- `https://www.nakhla.sa` (if www serves the app rather than redirecting)

No redirect URIs needed (ID-token popup flow uses none). Save; allow up to a few hours propagation.

### 3. Google console — Branding (makes the consent popup say "Nakhla" with logo)
Auth Platform → **Branding**:
- App name: Nakhla; support email.
- App domain: `https://nakhla.sa`; links to `/privacy` + `/terms` (pages already exist in web app).
- Authorized domains: `nakhla.sa` (auto-added when origins saved, verify present).
- Logo upload ⚠️ triggers **brand verification review** (days–weeks, needs the domain + privacy/terms live). Without logo: works fine, popup shows plain app name. Recommendation: ship without logo first, submit logo later.

### 4. Repo/env — nothing changes
Client ID stays the same. No env or code edits needed for a new origin. Only if you ever create additional client IDs (mobile), append to `GOOGLE_CLIENT_IDS` on `nakhla-api` (comma-separated) and redeploy.

### 5. Test checklist
- [ ] `https://nakhla.sa/login` → Google button renders (EN + AR).
- [ ] New Google account → role picker appears → account created → lands on dashboard.
- [ ] Existing email/password user with same Gmail → signs in, no duplicate user (check `OAuthAccount` row).
- [ ] Social-only user → password login refused; change-password endpoint returns "Account uses social login".
- [ ] `POST /api/v1/auth/google` with garbage → 401.

## Mobile (later — needs dev build, not Expo Go)

1. Console → Clients → Create client → **iOS**: bundle ID (from `apps/mobile/app.json`), and **Android**: package name + SHA-1 (from EAS keystore: `eas credentials`).
2. Append both new client IDs to `GOOGLE_CLIENT_IDS` on `nakhla-api` (Vercel) — API already verifies against the full list.
3. App: `@react-native-google-signin/google-signin` → get `idToken` → `POST /auth/google {credential: idToken, role?}` → store returned tokens in secure store (same as email login).
4. App Store rule: shipping Google login on iOS **requires** also offering Sign in with Apple.

## Apple (blocked on paid Apple Developer Program, $99/yr)

1. Enroll at developer.apple.com.
2. Certificates → Identifiers:
   - App ID for the mobile app with "Sign in with Apple" capability.
   - **Service ID** (e.g. `sa.nakhla.web`) for web — enable Sign in with Apple, register domain `nakhla.sa` (Apple gives a verification file to host at `/.well-known/apple-developer-domain-association.txt`) + return URL.
3. API: add `POST /auth/apple` mirroring `googleLogin()` — verify `identityToken` JWT against Apple JWKS (`https://appleid.apple.com/auth/keys`, use `jose`), `aud` = bundle ID (mobile) / Service ID (web), `iss` = `https://appleid.apple.com`. Provider = `"apple"`, sub = token `sub`.
4. Apple sends name/email **only on first authorization** — persist immediately; users may use Hide My Email relay addresses (treat as canonical).
5. Web: Sign in with Apple JS, `usePopup: true` → `identityToken` → `/auth/apple`. Mobile: `expo-apple-authentication`.
6. Flip `appleSoon` i18n strings to active button once shipped.

## Cleanup

- [ ] Delete stray duplicate GCP project `nakhla` (`nakhla-501622`) on **ahmed.bis.iti@gmail.com** — created accidentally before switching to devya browser, unused.
- [ ] When claiming Neon DB / moving infra, nothing OAuth-related changes (client IDs are infra-independent).
