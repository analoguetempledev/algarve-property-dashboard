# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

The architecture, request flow, auth model and data layer are documented in
[docs/architecture.md](docs/architecture.md). Read that first — it is kept
accurate and this file deliberately does not duplicate it.

## Commands

```bash
pnpm dev          # Dev server (Express + Vite middleware, hot reload)
pnpm build        # Build client (Vite) + bundle server (esbuild) → dist/
pnpm start        # Run production build
pnpm check        # TypeScript type check (no emit)
pnpm format       # Prettier
pnpm test         # Vitest (server-side only)
pnpm db:push      # Generate + apply Drizzle migrations
```

Run one test file:
```bash
pnpm vitest run server/api.test.ts
```

## Working notes

- Server entry is `server/_core/index.ts`. There is no other entry point.
- Procedures that read or write user-owned rows must take the owner from
  `ctx.user.id` and pass it to the `server/db.ts` helper, which scopes the
  query. Do not check ownership after fetching.
- `POST /api/ai/stream` sits outside the tRPC middleware and authenticates
  the session cookie itself. Never take a user id from its request body.
- Most test suites need `DATABASE_URL` and the seed data; they skip without
  it (`server/testEnv.ts`). A green run on a bare clone means "skipped",
  not "covered".

## Environment variables

Required: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`

Optional: `OWNER_EMAIL`, `APP_ID`, `VITE_GOOGLE_MAPS_API_KEY`
