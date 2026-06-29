#!/usr/bin/env bash
# Deploy the Nakhla NestJS API to Vercel as a serverless function.
# Prereqs (one-time, manual):
#   1. vercel login (already done).
#   2. Provision a Postgres DB.
#      Pick one:
#        a. Neon  : create at https://console.neon.tech → copy connection string (set DATABASE_URL).
#        b. Vercel Marketplace: vercel storage create → pick Neon/Supabase.
#   3. Set the project's environment variables (see ENV_VARS below) via `vercel env add ...`
#      or the Vercel dashboard.
#
# This script is idempotent — re-running will redeploy.
set -euo pipefail

PROJECT_NAME="${VERCEL_API_PROJECT_NAME:-nakhla-api}"
SCOPE_ARG=()
if [[ -n "${VERCEL_SCOPE:-}" ]]; then SCOPE_ARG=(--scope "$VERCEL_SCOPE"); fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$ROOT/apps/api"

ENV_VARS=(
  "DATABASE_URL"
  "JWT_ACCESS_SECRET"
  "JWT_REFRESH_SECRET"
  "JWT_ACCESS_TTL"
  "JWT_REFRESH_TTL"
  "CORS_ORIGIN"
  "COOKIE_DOMAIN"
  "NODE_ENV"
)

cd "$API_DIR"

if [[ ! -d .vercel ]]; then
  echo "==> Linking apps/api to Vercel project $PROJECT_NAME (creating if missing)…"
  vercel link --yes --project "$PROJECT_NAME" "${SCOPE_ARG[@]}"
fi

echo "==> Pulling current production env into .env.production.local for prisma migrate deploy at build time…"
vercel env pull .env.production.local --environment=production "${SCOPE_ARG[@]}" || true

echo "==> Verifying required env vars exist (will warn if missing):"
for v in "${ENV_VARS[@]}"; do
  if ! grep -q "^$v=" .env.production.local 2>/dev/null; then
    echo "  ⚠️  $v not set — run: vercel env add $v production"
  fi
done

echo "==> Deploying to production…"
vercel deploy --prod --yes "${SCOPE_ARG[@]}"

echo ""
echo "==> Post-deploy:"
echo "    1. Update collabstr-clone (web) env: NEXT_PUBLIC_API_URL=<api-url>/api/v1"
echo "    2. Update nakhla-admin env: same"
echo "    3. Add web rewrite for same-origin cookies (apps/web/next.config or vercel.json)"
