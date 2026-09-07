/**
 * These suites are integration tests: they run the real tRPC procedures
 * against whatever DATABASE_URL points at, and expect the seed data from
 * seed-db.mjs and seed-submitted-properties.mjs.
 *
 * Without a database they cannot pass, so they are skipped rather than
 * failed — a fresh clone gets a green run, and setting DATABASE_URL turns
 * them on. Suites that need no infrastructure always run.
 */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

/**
 * Guards the OpenAI smoke check, which calls the live API and bills the
 * key it uses. Opt in explicitly with RUN_LIVE_API_TESTS=1.
 */
export const runLiveApiTests =
  Boolean(process.env.OPENAI_API_KEY) && process.env.RUN_LIVE_API_TESTS === "1";
