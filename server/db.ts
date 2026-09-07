import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  properties,
  transactions,
  transactionTasks,
  marketMetrics,
  priceHistory,
  aiInsights,
  userFavorites,
  submittedProperties,
  type InsertSubmittedProperty,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.passwordHash !== undefined) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (
      ENV.ownerEmail &&
      (user.email ?? "").toLowerCase() === ENV.ownerEmail
    ) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Properties ──────────────────────────────────────────────

export async function getAllProperties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).orderBy(desc(properties.aiScore));
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Transactions ────────────────────────────────────────────

export async function getAllTransactions() {
  const db = await getDb();
  if (!db) return [];
  const txs = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  // Attach tasks to each transaction
  const result = [];
  for (const tx of txs) {
    const tasks = await db
      .select()
      .from(transactionTasks)
      .where(eq(transactionTasks.transactionId, tx.id))
      .orderBy(asc(transactionTasks.sortOrder));
    result.push({
      ...tx,
      tasks: tasks.map((t) => ({ label: t.label, completed: t.completed })),
    });
  }
  return result;
}

export async function getTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const txResult = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  if (txResult.length === 0) return undefined;
  const tx = txResult[0];
  const tasks = await db
    .select()
    .from(transactionTasks)
    .where(eq(transactionTasks.transactionId, tx.id))
    .orderBy(asc(transactionTasks.sortOrder));
  return {
    ...tx,
    tasks: tasks.map((t) => ({ id: t.id, label: t.label, completed: t.completed })),
  };
}

export async function updateTaskCompletion(taskId: number, completed: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(transactionTasks).set({ completed }).where(eq(transactionTasks.id, taskId));
}

// ─── Market Data ─────────────────────────────────────────────

export async function getAllMarketMetrics() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketMetrics).orderBy(asc(marketMetrics.id));
}

export async function getAllPriceHistory() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(priceHistory).orderBy(asc(priceHistory.id));
}

export async function getAllAiInsights() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiInsights).orderBy(desc(aiInsights.confidence));
}

// ─── User Favorites ──────────────────────────────────────────

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userFavorites).where(eq(userFavorites.userId, userId));
}

export async function addFavorite(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) return;
  // Check if already exists
  const existing = await db
    .select()
    .from(userFavorites)
    .where(and(eq(userFavorites.userId, userId), eq(userFavorites.propertyId, propertyId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(userFavorites).values({ userId, propertyId });
  const result = await db
    .select()
    .from(userFavorites)
    .where(and(eq(userFavorites.userId, userId), eq(userFavorites.propertyId, propertyId)))
    .limit(1);
  return result[0];
}

export async function removeFavorite(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(userFavorites)
    .where(and(eq(userFavorites.userId, userId), eq(userFavorites.propertyId, propertyId)));
}

// ─── Submitted Properties ───────────────────────────────────

export async function getSubmittedProperties(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(submittedProperties)
    .where(eq(submittedProperties.userId, userId))
    .orderBy(desc(submittedProperties.createdAt));
}

export async function getSubmittedPropertyById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(submittedProperties)
    .where(and(eq(submittedProperties.id, id), eq(submittedProperties.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubmittedProperty(data: InsertSubmittedProperty) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(submittedProperties).values(data);
  const result = await db
    .select()
    .from(submittedProperties)
    .where(eq(submittedProperties.userId, data.userId))
    .orderBy(desc(submittedProperties.id))
    .limit(1);
  return result[0];
}

export async function deleteSubmittedProperty(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(submittedProperties)
    .where(and(eq(submittedProperties.id, id), eq(submittedProperties.userId, userId)));
}

export async function getSubmittedPropertiesForCompare(ids: number[], userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Get all properties for this user, then filter by IDs in JS
  const all = await db
    .select()
    .from(submittedProperties)
    .where(eq(submittedProperties.userId, userId));
  return all.filter((p) => ids.includes(p.id));
}

// ─── Chat Threads & Messages ────────────────────────────────

import { chatThreads, chatMessages, propertyOffers, offerNotes, type InsertPropertyOffer } from "../drizzle/schema";

export async function getUserThreads(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatThreads)
    .where(eq(chatThreads.userId, userId))
    .orderBy(desc(chatThreads.updatedAt));
}

export async function getThreadById(threadId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(chatThreads)
    .where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createThread(userId: number, title: string, propertyId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(chatThreads).values({
    userId,
    title,
    propertyId: propertyId ?? null,
  });
  // Return the most recently created thread for this user
  const result = await db
    .select()
    .from(chatThreads)
    .where(eq(chatThreads.userId, userId))
    .orderBy(desc(chatThreads.id))
    .limit(1);
  return result[0];
}

export async function updateThreadTitle(threadId: number, userId: number, title: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(chatThreads)
    .set({ title })
    .where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, userId)));
}

export async function deleteThread(threadId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  // Delete messages first, then the thread
  await db.delete(chatMessages).where(eq(chatMessages.threadId, threadId));
  await db
    .delete(chatThreads)
    .where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, userId)));
}

export async function getThreadMessages(threadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(asc(chatMessages.createdAt));
}

export async function addMessage(threadId: number, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(chatMessages).values({ threadId, role, content });
  // Touch the thread's updatedAt
  await db
    .update(chatThreads)
    .set({ updatedAt: new Date() })
    .where(eq(chatThreads.id, threadId));
  // Return the inserted message
  const result = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(desc(chatMessages.id))
    .limit(1);
  return result[0];
}

// ─── Property Offers (Buying Flow) ─────────────────────────────

export async function getUserOffers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(propertyOffers)
    .where(eq(propertyOffers.userId, userId))
    .orderBy(desc(propertyOffers.updatedAt));
}

export async function getOfferById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(propertyOffers)
    .where(and(eq(propertyOffers.id, id), eq(propertyOffers.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getOfferByPropertyId(propertyId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(propertyOffers)
    .where(and(eq(propertyOffers.propertyId, propertyId), eq(propertyOffers.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOffer(data: InsertPropertyOffer) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(propertyOffers).values(data);
  const result = await db
    .select()
    .from(propertyOffers)
    .where(and(eq(propertyOffers.userId, data.userId), eq(propertyOffers.propertyId, data.propertyId)))
    .orderBy(desc(propertyOffers.id))
    .limit(1);
  return result[0];
}

export async function updateOfferStep(
  id: number,
  userId: number,
  step: string,
  completed: boolean
) {
  const db = await getDb();
  if (!db) return;
  const stepField = `${step}Completed` as const;
  const updateData: Record<string, unknown> = {};
  updateData[stepField] = completed;
  // If completing a step, advance currentStep to next
  if (completed) {
    const steps = ["analysis", "negotiation", "due_diligence", "make_offer", "completion"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      updateData.currentStep = steps[currentIndex + 1];
    }
  }
  await db
    .update(propertyOffers)
    .set(updateData)
    .where(and(eq(propertyOffers.id, id), eq(propertyOffers.userId, userId)));
}

export async function updateOfferPrice(
  id: number,
  userId: number,
  data: { offerPrice?: number; counterOfferPrice?: number; finalPrice?: number }
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(propertyOffers)
    .set(data)
    .where(and(eq(propertyOffers.id, id), eq(propertyOffers.userId, userId)));
}

export async function updateOfferStatus(
  id: number,
  userId: number,
  status: "active" | "offer_sent" | "accepted" | "rejected" | "withdrawn" | "completed"
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(propertyOffers)
    .set({ status })
    .where(and(eq(propertyOffers.id, id), eq(propertyOffers.userId, userId)));
}

export async function updateOfferStepData(
  id: number,
  userId: number,
  step: string,
  data: unknown
) {
  const db = await getDb();
  if (!db) return;
  const dataField = `${step}Data` as const;
  const updateData: Record<string, unknown> = {};
  updateData[dataField] = data;
  await db
    .update(propertyOffers)
    .set(updateData)
    .where(and(eq(propertyOffers.id, id), eq(propertyOffers.userId, userId)));
}

export async function deleteOffer(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  // Delete notes first
  await db.delete(offerNotes).where(eq(offerNotes.offerId, id));
  await db
    .delete(propertyOffers)
    .where(and(eq(propertyOffers.id, id), eq(propertyOffers.userId, userId)));
}

// ─── Offer Notes ────────────────────────────────────────────

export async function getOfferNotes(offerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(offerNotes)
    .where(eq(offerNotes.offerId, offerId))
    .orderBy(desc(offerNotes.createdAt));
}

export async function addOfferNote(
  offerId: number,
  userId: number,
  content: string,
  noteType: "note" | "milestone" | "system" = "note"
) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(offerNotes).values({ offerId, userId, content, noteType });
  const result = await db
    .select()
    .from(offerNotes)
    .where(eq(offerNotes.offerId, offerId))
    .orderBy(desc(offerNotes.id))
    .limit(1);
  return result[0];
}
