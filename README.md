# Collabstr Clone — Monorepo

Modern reference build of an influencer marketplace.

## Stack
- **Web** Next.js 16 (App Router) · React 19 · Tailwind v4
- **API** NestJS 11 · Prisma 6 · PostgreSQL · JWT auth (httpOnly cookies)
- **Shared** Zod DTOs in `packages/shared-types`
- **Tooling** pnpm workspaces · Turborepo

## Layout
```
apps/
  web/                 Next.js frontend
  api/                 NestJS REST API
packages/
  shared-types/        Zod schemas + TS types (web ↔ api)
```

## Quick start
```bash
pnpm install
docker compose up -d        # postgres
pnpm db:migrate
pnpm db:seed
pnpm dev                    # runs web (:3000) + api (:4000)
```

## Env
- `apps/web/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `apps/api/.env` → `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`

## Deploy
- Web → Vercel (auto on push to main)
- API → bring your own (Render / Fly / Railway). Set the same env vars + run `prisma migrate deploy` on release.
