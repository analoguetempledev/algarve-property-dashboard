# Algarve Property Dashboard

A web application for people buying property in the Algarve, Portugal. You submit a
listing URL, and the app keeps a structured record of the property — price history,
days on market, energy rating, an estimate of how much negotiating room there is, and
a suggested offer — then tracks the purchase through to completion. A chat assistant
answers questions using the stored property and market data, plus a built-in reference
set on Portuguese property taxes and the buying process.

Built by Analoguetemple Lda.

## In production

This codebase runs in production as **[Terra Certa](https://dashboard.terra-certa.com/)**,
a buyer's agent operating in the Algarve. That deployment is branded and
configured for their business; this repository is the underlying product,
kept generic so it can be set up for any buyer's agent or property advisory.

## Screenshots

Captured from the application running against the seed data in this repository.
The properties shown are fictional.

![Dashboard: submitted properties, market metrics and the listing-URL intake](docs/screenshots/dashboard.png)

![Property analysis: pricing, bargaining power score and AI write-up](docs/screenshots/property-analysis.png)

![My Properties: every submitted listing with its AI score](docs/screenshots/my-properties.png)

![Market analytics: price trend, sales volume, days on market and property mix](docs/screenshots/market-analytics.png)

![Offer workflow: negotiation stage with suggested offer and leverage points](docs/screenshots/offer-flow.png)

![The assistant panel, with database and knowledge base context](docs/screenshots/ai-chat.png)

## What it does

| Route | Purpose |
| --- | --- |
| `/` | Dashboard: property cards, filter panel, map markers |
| `/properties` | Properties you have submitted |
| `/analysis/:id` | Full analysis for one property: pricing, pros and cons, neighbourhood notes, investment view |
| `/compare` | Side-by-side comparison of 2–4 properties |
| `/analytics` | Market metrics and price trend charts |
| `/calculator` | Buyer savings calculator |
| `/offers` | Offers in progress |
| `/offers/:id` | Offer workflow: analysis, negotiation, due diligence, offer, completion |
| `/login` | Email and password sign-in |

Other behaviour worth knowing:

- The interface is available in Portuguese and English, switchable at runtime.
- The chat assistant streams its answers over Server-Sent Events and keeps threads
  between sessions. It is given the current property and market rows as context, and
  retrieves entries from a keyword-scored knowledge base covering IMT, stamp duty,
  IMI, the CPCV, and the escritura.
- The map needs a Google Maps key. Without one the app runs and shows a placeholder in
  its place.

## Status

This is a first version. What is listed above is built and running in
production. The following are known gaps rather than oversights:

- **Retrieval is keyword-based.** `searchKnowledge()` scores 19 reference
  entries by keyword overlap and injects the top matches into the prompt.
  It works well for tax and process questions, where the vocabulary is
  fixed, and less well for open-ended phrasing. A vector store is the
  intended replacement.
- **Property analysis is seeded, not scraped.** Submitting a listing URL
  stores the URL and detects the portal; the structured fields and the AI
  write-up come from seed data. The extraction pipeline is not built.
- **Transactions are not per-user.** The `transactions` table has no owner
  column, so that section is shared across accounts. It needs a schema
  change before multi-tenant use.
- **No client-side tests.** Server procedures are covered; the React layer
  is not.
- **Single-tenant.** One deployment serves one agency. There is no
  organisation model or per-tenant configuration.

## Stack

Frontend: React 19, Vite 7, TypeScript, Tailwind CSS 4, shadcn/ui on Radix,
Wouter for routing, TanStack Query with a tRPC client, Recharts, Framer Motion.

Backend: Node.js, Express 4, tRPC 11, Drizzle ORM against MySQL via `mysql2`,
JWT session cookies signed with `jose`, and an SSE endpoint for chat streaming.
The language model is OpenAI `gpt-4o`.

Tooling: pnpm, Vitest, Prettier, Drizzle Kit, esbuild.

## Architecture

One Express process serves everything. In development it mounts Vite as middleware;
in production it serves the built client from `dist/public`.

- `POST /api/trpc/*` — all application procedures, defined in `server/routers.ts`
- `POST /api/ai/stream` — Server-Sent Events for chat, handled by `server/aiStream.ts`

Authentication is a local email and password account. The session is a JWT held in an
httpOnly cookie. Setting `OWNER_EMAIL` grants the admin role to the account
registered with that address.

The schema in `drizzle/schema.ts` defines 13 tables, the main ones being `users`,
`submitted_properties`, `property_offers`, `transactions`, `chat_threads` and
`market_metrics`.

```
client/src/    React application (aliased @)
server/        Express, tRPC routers, database helpers
server/_core/  Server entry, tRPC setup, auth, Vite middleware
shared/        Types and constants used by both sides (aliased @shared)
drizzle/       Schema, relations, generated migrations
docs/          Architecture and design documentation
```

`/api/ai/stream` sits outside the tRPC middleware and authenticates the session
cookie itself, rather than accepting a user id from the request body. See
[docs/architecture.md](docs/architecture.md) for the full picture.

## Requirements

- Node.js 20 or newer
- pnpm 10 or newer
- A MySQL database
- An OpenAI API key, for the chat assistant

## Configuration

Copy `.env.example` to `.env` and fill it in:

```env
NODE_ENV=development
PORT=3000
APP_ID=property-dashboard
DATABASE_URL=mysql://user:password@127.0.0.1:3306/property_dashboard
JWT_SECRET=replace-with-a-long-random-string
OWNER_EMAIL=you@example.com
OPENAI_API_KEY=sk-...
VITE_GOOGLE_MAPS_API_KEY=
```

`DATABASE_URL`, `JWT_SECRET` and `OPENAI_API_KEY` are required. `OWNER_EMAIL`,
`APP_ID` and `VITE_GOOGLE_MAPS_API_KEY` are optional.

## Running it

```bash
git clone https://github.com/analoguetempledev/algarve-property-dashboard.git
cd algarve-property-dashboard
pnpm install
pnpm db:push
node seed-db.mjs
node seed-submitted-properties.mjs
pnpm dev
```

Open `http://localhost:3000`, register an account at `/login`, and the dashboard is
populated from the seed data. Both seed scripts insert fictional properties; the
addresses and listing URLs in them are invented.

For a production build:

```bash
pnpm build
pnpm start
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Build the client with Vite, bundle the server with esbuild |
| `pnpm start` | Run the production build |
| `pnpm check` | TypeScript type check, no emit |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run the Vitest suite |
| `pnpm db:push` | Generate and apply Drizzle migrations |

## Tests

Vitest covers the server only; there is no client test setup. The suite exercises the
tRPC procedures, authentication, chat history, the offer workflow, and property
submission.

Most of these are integration tests rather than unit tests: they call the real
procedures against whatever `DATABASE_URL` points at and expect the seed data. They
skip when `DATABASE_URL` is unset, so a fresh clone gets a green run — a pass on a bare
checkout means "skipped", not "covered". Set `DATABASE_URL` and seed the database to
run them for real.

One suite calls the live OpenAI API and bills the key it uses, so it stays off unless
you opt in:

```bash
RUN_LIVE_API_TESTS=1 pnpm test
```

Run a single file with:

```bash
pnpm vitest run server/api.test.ts
```

## Documentation

- [docs/architecture.md](docs/architecture.md) — request flow, auth model, data layer
- [docs/design-rationale.md](docs/design-rationale.md) — why the interface looks the way it does

## Notes

- `wouter` is patched; see `patches/wouter@3.7.1.patch`.
- Import aliases are `@` for `client/src` and `@shared` for `shared`.
- Do not commit `.env`.

## License

MIT. See [LICENSE](LICENSE).
