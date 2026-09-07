import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hasDatabase } from "./testEnv";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "local",
      passwordHash: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe.skipIf(!hasDatabase)("properties API", () => {
  it("returns a list of properties", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const properties = await caller.properties.list();

    expect(Array.isArray(properties)).toBe(true);
    expect(properties.length).toBeGreaterThan(0);

    const first = properties[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("address");
    expect(first).toHaveProperty("price");
    expect(first).toHaveProperty("beds");
    expect(first).toHaveProperty("baths");
    expect(first).toHaveProperty("sqft");
    expect(first).toHaveProperty("aiScore");
    expect(first).toHaveProperty("lat");
    expect(first).toHaveProperty("lng");
    expect(typeof first.lat).toBe("number");
    expect(typeof first.lng).toBe("number");
  });

  it("returns a single property by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const properties = await caller.properties.list();
    const firstId = properties[0].id;

    const property = await caller.properties.getById({ id: firstId });

    expect(property).not.toBeNull();
    expect(property!.id).toBe(firstId);
    expect(property!.address).toBeTruthy();
    expect(typeof property!.price).toBe("number");
  });

  it("returns null for non-existent property", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const property = await caller.properties.getById({ id: 999999 });
    expect(property).toBeNull();
  });
});

describe.skipIf(!hasDatabase)("market API", () => {
  it("returns market metrics", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const metrics = await caller.market.metrics();

    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBeGreaterThan(0);

    const first = metrics[0];
    expect(first).toHaveProperty("label");
    expect(first).toHaveProperty("value");
    expect(first).toHaveProperty("change");
    expect(typeof first.change).toBe("number");
  });

  it("returns price history", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const history = await caller.market.priceHistory();

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);

    const first = history[0];
    expect(first).toHaveProperty("month");
    expect(first).toHaveProperty("median");
  });

  it("returns AI insights", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const insights = await caller.market.aiInsights();

    expect(Array.isArray(insights)).toBe(true);
    expect(insights.length).toBeGreaterThan(0);

    const first = insights[0];
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("description");
  });
});

describe.skipIf(!hasDatabase)("transactions API", () => {
  it("returns a list of transactions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const transactions = await caller.transactions.list();

    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);

    const first = transactions[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("propertyAddress");
    expect(first).toHaveProperty("offerPrice");
    expect(first).toHaveProperty("stage");
    expect(first).toHaveProperty("progress");
    expect(first).toHaveProperty("tasks");
    expect(Array.isArray(first.tasks)).toBe(true);
  });
});

describe.skipIf(!hasDatabase)("dashboard API", () => {
  it("returns combined dashboard data", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const data = await caller.dashboard.getData();

    expect(data).toHaveProperty("properties");
    expect(data).toHaveProperty("metrics");
    expect(data).toHaveProperty("priceHistory");
    expect(data).toHaveProperty("aiInsights");

    expect(Array.isArray(data.properties)).toBe(true);
    expect(Array.isArray(data.metrics)).toBe(true);
    expect(Array.isArray(data.priceHistory)).toBe(true);
    expect(Array.isArray(data.aiInsights)).toBe(true);

    expect(data.properties.length).toBeGreaterThan(0);
    expect(data.metrics.length).toBeGreaterThan(0);
  });
});
