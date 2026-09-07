import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hasDatabase } from "./testEnv";

function createAuthContext(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      email: `test${userId}@example.com`,
      name: `Test User ${userId}`,
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

describe.skipIf(!hasDatabase)("submittedProperties API", () => {
  it("lists submitted properties for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const properties = await caller.submittedProperties.list();

    expect(Array.isArray(properties)).toBe(true);
    // Seeded data should exist for user 1
    expect(properties.length).toBeGreaterThan(0);

    const first = properties[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("sourceUrl");
    expect(first).toHaveProperty("status");
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("askingPrice");
    expect(first).toHaveProperty("aiScore");
  });

  it("returns property by id for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const properties = await caller.submittedProperties.list();
    const firstId = properties[0].id;

    const property = await caller.submittedProperties.getById({ id: firstId });

    expect(property).not.toBeNull();
    expect(property!.id).toBe(firstId);
    expect(property!.title).toBeTruthy();
    expect(property!.sourceUrl).toBeTruthy();
    expect(typeof property!.askingPrice).toBe("number");
  });

  it("returns null for non-existent property", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const property = await caller.submittedProperties.getById({ id: 999999 });
    expect(property).toBeNull();
  });

  it("submits a new property from URL", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.submittedProperties.submit({
      sourceUrl: "https://www.idealista.pt/imovel/12345678/",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("detects platform from idealista URL", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.submittedProperties.submit({
      sourceUrl: "https://www.idealista.pt/imovel/99999999/",
    });

    // Verify the property was created with correct platform
    const property = await caller.submittedProperties.getById({ id: result.id });
    expect(property).not.toBeNull();
    expect(property!.sourcePlatform).toBe("idealista");
    expect(property!.status).toBe("pending");
  });

  it("deletes a submitted property", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    // Create a property to delete
    const created = await caller.submittedProperties.submit({
      sourceUrl: "https://www.imovirtual.com/test-delete/",
    });

    // Delete it
    const deleteResult = await caller.submittedProperties.delete({ id: created.id });
    expect(deleteResult).toEqual({ success: true });

    // Verify it's gone
    const property = await caller.submittedProperties.getById({ id: created.id });
    expect(property).toBeNull();
  });

  it("compares 2+ properties side by side", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const properties = await caller.submittedProperties.list();

    // Need at least 2 properties for comparison
    expect(properties.length).toBeGreaterThanOrEqual(2);

    const ids = properties.slice(0, 2).map((p) => p.id);
    const compared = await caller.submittedProperties.compare({ ids });

    expect(Array.isArray(compared)).toBe(true);
    expect(compared.length).toBe(2);

    // Each compared property should have analysis fields
    for (const prop of compared) {
      expect(prop).toHaveProperty("id");
      expect(prop).toHaveProperty("title");
      expect(prop).toHaveProperty("askingPrice");
      expect(prop).toHaveProperty("aiScore");
      expect(prop).toHaveProperty("bargainingPower");
    }
  });

  it("requires authentication for listing properties", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.submittedProperties.list()).rejects.toThrow();
  });

  it("requires authentication for submitting properties", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.submittedProperties.submit({
        sourceUrl: "https://www.idealista.pt/imovel/12345/",
      })
    ).rejects.toThrow();
  });
});
