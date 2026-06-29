#!/usr/bin/env bash
# Bootstrap a Kuwait-targeted fork of the Nakhla (collabstr-clone) monorepo.
# Usage:
#   ./scripts/bootstrap-kuwait-fork.sh <slug> <BrandNameEN> "<BrandNameAR>" <github_user>
# Example:
#   ./scripts/bootstrap-kuwait-fork.sh diwaniya Diwaniya "ديوانية" Eng-AhmedMahmoud
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "usage: $0 <slug> <BrandNameEN> '<BrandNameAR>' [github_user]" >&2
  exit 1
fi

SLUG="$1"        # kebab-case, used for dir + repo + Vercel project names
BRAND_EN="$2"    # display name (English / Latin)
BRAND_AR="$3"    # display name (Arabic)
GH_USER="${4:-$(gh api user --jq .login)}"

SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST_PARENT="$(dirname "$SOURCE")"
DEST="$DEST_PARENT/$SLUG"
WEB_PROJECT="$SLUG-web"
ADMIN_PROJECT="$SLUG-admin"
API_PROJECT="$SLUG-api"

if [[ -d "$DEST" ]]; then
  echo "error: $DEST already exists — refusing to overwrite" >&2
  exit 1
fi

echo "==> 1/8  Copying source to $DEST (excluding node_modules + .next + .vercel)…"
rsync -a \
  --exclude node_modules \
  --exclude .next \
  --exclude .vercel \
  --exclude '.env.production.local' \
  --exclude dist \
  "$SOURCE/" "$DEST/"

cd "$DEST"

echo "==> 2/8  Resetting git history…"
rm -rf .git
git init -b main >/dev/null

echo "==> 3/8  Rebranding source files (Nakhla→$BRAND_EN, نخلة→$BRAND_AR, KSA→KW, SAR→KWD, ar-SA→ar-KW, en_SA→en_KW)…"
# macOS sed compatibility: use sed -i ''
SEDI=(sed -i '')
if sed --version >/dev/null 2>&1; then SEDI=(sed -i); fi  # GNU sed
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.md' -o -name '*.json' -o -name '*.css' -o -name 'vercel.json' -o -name 'docker-compose.yml' -o -name '*.prisma' -o -name '*.example' \) \
  -not -path './node_modules/*' -not -path './.next/*' -not -path './dist/*' \
  -print0 | xargs -0 "${SEDI[@]}" \
    -e "s/Nakhla/$BRAND_EN/g" \
    -e "s/nakhla/$SLUG/g" \
    -e "s/نخلة/$BRAND_AR/g" \
    -e "s/Saudi Arabia/Kuwait/g" \
    -e "s/المملكة العربية السعودية/الكويت/g" \
    -e "s/Made in KSA/Made in Kuwait/g" \
    -e "s/صنع في السعودية/صنع في الكويت/g" \
    -e "s/\\bKSA\\b/Kuwait/g" \
    -e "s/SAR/KWD/g" \
    -e "s/ر\\.س/د.ك/g" \
    -e "s/ar-SA/ar-KW/g" \
    -e "s/en_SA/en_KW/g" \
    -e "s/ar_SA/ar_KW/g" \
    -e "s/🇸🇦/🇰🇼/g" \
    -e "s/ZATCA/Kuwait Ministry of Information/g" \
    -e "s/Mada/KNET/g" \
    -e "s/Tabby/Tabby Kuwait/g" \
    -e "s/Tamara/MyFatoorah/g"

echo "==> 4/8  Renaming workspace package names from @collabstr/* to @$SLUG/*…"
find . -type f -name 'package.json' -not -path './node_modules/*' \
  -print0 | xargs -0 "${SEDI[@]}" -e "s|@collabstr/|@$SLUG/|g"

# Update root package.json name
"${SEDI[@]}" -e "s/\"name\": \"collabstr-monorepo\"/\"name\": \"$SLUG-monorepo\"/" package.json

echo "==> 5/8  Currency precision: KWD uses 3 decimals (fils)…"
# Patch format.ts to use 3 decimals for KWD if it reads currency dynamically
if grep -q "minimumFractionDigits" apps/web/src/lib/format.ts 2>/dev/null; then
  echo "    (format.ts already configurable — verify currency=KWD min=3 max=3 after copy)"
fi

echo "==> 6/8  Docker compose: rename containers + volume…"
"${SEDI[@]}" -e "s/collabstr-pg/$SLUG-pg/" -e "s/collabstr/$SLUG/g" docker-compose.yml || true

echo "==> 7/8  Creating GitHub repo $GH_USER/$SLUG (public)…"
git add -A
git commit -m "feat: initial $BRAND_EN fork from Nakhla — Kuwait-targeted influencer marketplace" >/dev/null
gh repo create "$GH_USER/$SLUG" --public --source=. --remote=origin --push \
  --description "$BRAND_EN ($BRAND_AR) — modern influencer marketplace for Kuwait. KNET escrow, KWD pricing, ar-KW + en bilingual."

echo "==> 8/8  Linking + first Vercel deploy for web + admin (api requires DATABASE_URL — set then re-run scripts/deploy-api.sh)…"
( cd apps/web && vercel link --yes --project "$WEB_PROJECT" && vercel deploy --prod --yes ) || echo "  (web deploy skipped — fix and run manually)"
( cd apps/admin && vercel link --yes --project "$ADMIN_PROJECT" && vercel deploy --prod --yes ) || echo "  (admin deploy skipped — fix and run manually)"

echo ""
echo "✅ Fork ready at $DEST"
echo "   repo:        https://github.com/$GH_USER/$SLUG"
echo "   web vercel:  $WEB_PROJECT"
echo "   admin vercel:$ADMIN_PROJECT"
echo "   api vercel:  $API_PROJECT  (deploy with: cd $DEST && VERCEL_API_PROJECT_NAME=$API_PROJECT ./scripts/deploy-api.sh)"
echo ""
echo "Manual follow-ups:"
echo "  1. Update Kuwait-specific copy in apps/web/src/lib/i18n.ts (hero, about, pricing in KWD)."
echo "  2. Update seed data in apps/api/prisma/seed.ts with Kuwait creators + campaigns."
echo "  3. Provision Postgres + set DATABASE_URL on $API_PROJECT."
echo "  4. Wire payment integration: KNET via MyFatoorah (or Tap Payments Kuwait)."
echo "  5. Add Kuwait Ministry of Information disclosure copy to /about + footer."
