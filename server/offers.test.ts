import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hasDatabase } from "./testEnv";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
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
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe.skipIf(!hasDatabase)("offers procedures", () => {
  describe("offers.list", () => {
    it("returns an array for authenticated users", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.offers.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("rejects unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.offers.list()).rejects.toThrow();
    });
  });

  describe("offers.create", () => {
    it("creates a new offer for a property", async () => {
      const ctx = createAuthContext(999);
      const caller = appRouter.createCaller(ctx);

      const offer = await caller.offers.create({ propertyId: 1 });
      expect(offer).toBeDefined();
      if (offer) {
        expect(offer.propertyId).toBe(1);
        expect(offer.userId).toBe(999);
        expect(offer.currentStep).toBe("analysis");
        expect(offer.status).toBe("active");
      }
    });

    it("returns existing offer if one already exists for the property", async () => {
      const ctx = createAuthContext(999);
      const caller = appRouter.createCaller(ctx);

      const offer1 = await caller.offers.create({ propertyId: 1 });
      const offer2 = await caller.offers.create({ propertyId: 1 });
      expect(offer1?.id).toBe(offer2?.id);
    });
  });

  describe("offers.getById", () => {
    it("returns offer with property and notes", async () => {
      const ctx = createAuthContext(998);
      const caller = appRouter.createCaller(ctx);

      const created = await caller.offers.create({ propertyId: 2 });
      if (!created) throw new Error("Failed to create offer");

      const result = await caller.offers.getById({ id: created.id });
      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      // Should have notes array (at least the system note from creation)
      expect(Array.isArray(result?.notes)).toBe(true);
    });

    it("returns null for non-existent offer", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.offers.getById({ id: 999999 });
      expect(result).toBeNull();
    });
  });

  describe("offers.completeStep", () => {
    it("completes a step and advances to next", async () => {
      const ctx = createAuthContext(997);
      const caller = appRouter.createCaller(ctx);

      const offer = await caller.offers.create({ propertyId: 3 });
      if (!offer) throw new Error("Failed to create offer");

      const result = await caller.offers.completeStep({
        offerId: offer.id,
        step: "analysis",
      });
      expect(result).toEqual({ success: true });

      // Verify step advanced
      const updated = await caller.offers.getById({ id: offer.id });
      expect(updated?.currentStep).toBe("negotiation");
      expect(updated?.analysisCompleted).toBe(true);
    });
  });

  describe("offers.updatePrice", () => {
    it("updates offer price", async () => {
      const ctx = createAuthContext(996);
      const caller = appRouter.createCaller(ctx);

      const offer = await caller.offers.create({ propertyId: 4 });
      if (!offer) throw new Error("Failed to create offer");

      const result = await caller.offers.updatePrice({
        offerId: offer.id,
        offerPrice: 250000,
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("offers.updateStatus", () => {
    it("updates offer status", async () => {
      const ctx = createAuthContext(995);
      const caller = appRouter.createCaller(ctx);

      const offer = await caller.offers.create({ propertyId: 5 });
      if (!offer) throw new Error("Failed to create offer");

      const result = await caller.offers.updateStatus({
        offerId: offer.id,
        status: "offer_sent",
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("offers.addNote", () => {
    it("adds a note to an offer", async () => {
      const ctx = createAuthContext(994);
      const caller = appRouter.createCaller(ctx);

      const offer = await caller.offers.create({ propertyId: 6 });
      if (!offer) throw new Error("Failed to create offer");

      const note = await caller.offers.addNote({
        offerId: offer.id,
        content: "Test note",
      });
      expect(note).toBeDefined();
      expect(note?.content).toBe("Test note");
      expect(note?.noteType).toBe("note");
    });
  });

  describe("offers.delete", () => {
    it("deletes an offer", async () => {
      const ctx = createAuthContext(993);
      const caller = appRouter.createCaller(ctx);

      const offer = await caller.offers.create({ propertyId: 7 });
      if (!offer) throw new Error("Failed to create offer");

      const result = await caller.offers.delete({ id: offer.id });
      expect(result).toEqual({ success: true });

      // Verify deleted
      const check = await caller.offers.getById({ id: offer.id });
      expect(check).toBeNull();
    });
  });
});
