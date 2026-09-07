import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hasDatabase } from "./testEnv";

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-chat",
      email: "chat@example.com",
      name: "Chat Test User",
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

describe.skipIf(!hasDatabase)("chatHistory API", () => {
  let createdThreadId: number;

  it("creates a new chat thread", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const thread = await caller.chatHistory.createThread({
      title: "Test Conversation",
      propertyId: undefined,
    });

    expect(thread).toBeDefined();
    expect(thread!.id).toBeGreaterThan(0);
    expect(thread!.title).toBe("Test Conversation");
    expect(thread!.userId).toBe(1);
    createdThreadId = thread!.id;
  });

  it("lists threads for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const threads = await caller.chatHistory.listThreads();

    expect(Array.isArray(threads)).toBe(true);
    expect(threads.length).toBeGreaterThan(0);

    const first = threads[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("userId");
    expect(first).toHaveProperty("createdAt");
    expect(first).toHaveProperty("updatedAt");
  });

  it("adds messages to a thread", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    // Add user message
    const userMsg = await caller.chatHistory.addMessage({
      threadId: createdThreadId,
      role: "user",
      content: "What are the best properties in Algarve?",
    });
    expect(userMsg).toBeDefined();
    expect(userMsg!.role).toBe("user");
    expect(userMsg!.content).toBe("What are the best properties in Algarve?");

    // Add assistant message
    const assistantMsg = await caller.chatHistory.addMessage({
      threadId: createdThreadId,
      role: "assistant",
      content: "Based on the current listings, the top properties in Algarve are...",
    });
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg!.role).toBe("assistant");
  });

  it("retrieves a thread with its messages", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const thread = await caller.chatHistory.getThread({
      threadId: createdThreadId,
    });

    expect(thread).toBeDefined();
    expect(thread!.id).toBe(createdThreadId);
    expect(thread!.title).toBe("Test Conversation");
    expect(Array.isArray(thread!.messages)).toBe(true);
    expect(thread!.messages.length).toBe(2);
    expect(thread!.messages[0].role).toBe("user");
    expect(thread!.messages[1].role).toBe("assistant");
  });

  it("renames a thread", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.chatHistory.renameThread({
      threadId: createdThreadId,
      title: "Algarve Property Discussion",
    });
    expect(result).toEqual({ success: true });

    // Verify the rename
    const thread = await caller.chatHistory.getThread({
      threadId: createdThreadId,
    });
    expect(thread!.title).toBe("Algarve Property Discussion");
  });

  it("deletes a thread and its messages", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.chatHistory.deleteThread({
      threadId: createdThreadId,
    });
    expect(result).toEqual({ success: true });

    // Verify deletion
    const thread = await caller.chatHistory.getThread({
      threadId: createdThreadId,
    });
    expect(thread).toBeNull();
  });

  it("requires authentication for chat history operations", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.chatHistory.listThreads()).rejects.toThrow();
    await expect(
      caller.chatHistory.createThread({ title: "Should fail" })
    ).rejects.toThrow();
  });
});
