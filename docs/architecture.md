# Architecture

How the application is put together, for anyone reading or extending the code.

## Shape

One Express process serves everything. In development it mounts Vite as
middleware for hot reload; in production it serves the client build from
`dist/public`. There is no separate API server.

```
client/src/    React application (aliased @)
server/        Express, tRPC routers, database helpers
server/_core/  Server entry, tRPC setup, auth, Vite middleware
shared/        Types and constants used by both sides (aliased @shared)
drizzle/       Schema, relations, generated migrations
docs/          This documentation
```

The server entry point is `server/_core/index.ts`. It is what `pnpm dev`
runs under `tsx watch` and what `pnpm build` bundles with esbuild.

## Request flow

Two entry points, and they authenticate differently. This is the one part
of the system worth reading carefully.

**`POST /api/trpc/*`** — every application procedure, defined in
`server/routers.ts`. The tRPC context (`server/_core/context.ts`) resolves
the session cookie into `ctx.user`, or `null` when there is no valid
session. Procedures pick their guarantee:

- `publicProcedure` — no authentication
- `protectedProcedure` — requires `ctx.user`
- `adminProcedure` — requires `ctx.user.role === "admin"`

Procedures that touch user-owned rows take the owner from `ctx.user.id` and
pass it into the query helper, so ownership is enforced in the `WHERE`
clause rather than checked afterwards. `server/db.ts` reflects this: helpers
like `getOfferById(id, userId)` and `getSubmittedPropertyById(id, userId)`
require the owner as an argument.

**`POST /api/ai/stream`** — Server-Sent Events for the chat assistant,
handled by `server/aiStream.ts`. This route is mounted directly on Express,
outside the tRPC middleware, so it authenticates the session cookie itself
via `sdk.authenticateRequest(req)` and derives the caller from that session.
It deliberately does not accept a user id from the request body; doing so
would let any caller read another user's stored property analysis.

## Authentication

Local email and password accounts, no external identity provider.

- `auth.register` hashes with scrypt (`server/password.ts`) and stores
  `salt:hash`; `auth.login` verifies with `timingSafeEqual`.
- The session is a JWT signed with `JWT_SECRET` using `jose`, stored in an
  httpOnly cookie named `app_session_id`. `Secure` is set when the request
  arrives over HTTPS, including behind a proxy that sets
  `x-forwarded-proto`.
- Setting `OWNER_EMAIL` grants the `admin` role to the account registered
  with that address.

## Data

MySQL through Drizzle ORM. The schema is `drizzle/schema.ts`; every query
helper lives in `server/db.ts`, and nothing else opens a connection.

13 tables. The ones that carry the product:

| Table | Holds |
| --- | --- |
| `users` | Accounts, roles, password hashes |
| `submitted_properties` | A submitted listing and its full analysis |
| `property_offers` / `offer_notes` | The buying workflow and its audit trail |
| `chat_threads` / `chat_messages` | Persisted assistant conversations |
| `properties`, `market_metrics`, `price_history`, `ai_insights` | Market and portfolio data behind the dashboard and analytics |
| `transactions` / `transaction_tasks` | Transaction tracker |

`getDb()` returns `null` when `DATABASE_URL` is unset, and every helper
degrades to an empty result rather than throwing. The app therefore boots
without a database, but renders empty.

Note that `transactions` has no `userId` column — those rows are shared
rather than owned, so `transactions.updateTask` can only require a
signed-in caller, not a specific owner. Per-user transactions need a schema
change.

## The assistant

`server/aiStream.ts` builds a system prompt from live rows — the portfolio,
market metrics, recent price history, AI insights, and, when the user is
looking at one, the full analysis of that property. It then calls the
OpenAI chat completions API with `stream: true` and forwards each content
delta to the browser as an SSE `data:` frame.

The client does not use `EventSource`. `AIChatPanel.tsx` issues a `POST`
via `fetch` and reads the response body with a `ReadableStream` reader, so
it can send a JSON body and abort mid-stream.

`server/knowledgeBase.ts` holds 19 reference entries on Portuguese property
transactions — IMT, stamp duty, IMI, the CPCV, the escritura, energy
certificates, residency schemes, regional notes. `searchKnowledge()` scores
them by keyword overlap and injects the top matches into the prompt. This
is keyword retrieval over a static array, not a vector store; see
"Not built yet" in the README.

## Frontend

- **Routing** — Wouter, patched (`patches/wouter@3.7.1.patch`). Routes are
  declared in `client/src/App.tsx`.
- **Data** — TanStack Query driving the tRPC client (`client/src/lib/trpc.ts`),
  initialised in `main.tsx`.
- **UI** — shadcn/ui on Radix in `client/src/components/ui/`, Tailwind CSS 4.
- **State** — React context: `ThemeContext`, `LanguageContext`,
  `PropertyContext`, `ChatTriggerContext`.
- **i18n** — Portuguese and English in `client/src/lib/i18n/`, switched at
  runtime through `LanguageContext`.

## Tests

Vitest, server-side only (`server/**/*.test.ts`); there is no client test
setup.

Most suites are integration tests: they call the real tRPC procedures
against `DATABASE_URL` and expect the seed data. `server/testEnv.ts` gates
them, so a clone with no database skips rather than fails. Set
`DATABASE_URL` and seed to run them. The OpenAI smoke check calls the live
API and bills the key, so it needs `RUN_LIVE_API_TESTS=1` as well.
