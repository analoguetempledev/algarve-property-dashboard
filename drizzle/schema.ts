import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users (auth) ────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Submitted Properties (user-submitted URLs for analysis) ─
export const submittedProperties = mysqlTable("submitted_properties", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sourceUrl: text("sourceUrl").notNull(),
  sourcePlatform: varchar("sourcePlatform", { length: 64 }), // idealista, imovirtual, sapo, etc.
  status: mysqlEnum("status", ["pending", "analyzing", "ready", "error"]).default("pending").notNull(),

  // Property basics
  title: varchar("title", { length: 512 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 128 }),
  district: varchar("district", { length: 128 }),
  zipCode: varchar("zipCode", { length: 20 }),
  propertyType: varchar("propertyType", { length: 64 }), // Apartment, Villa, Townhouse, etc.

  // Pricing
  askingPrice: int("askingPrice"),
  pricePerSqm: int("pricePerSqm"),
  priceHistory: json("priceHistory"), // Array of { date, price } for price reductions

  // Details
  bedrooms: int("bedrooms"),
  bathrooms: int("bathrooms"),
  area: int("area"), // m²
  floor: varchar("floor", { length: 32 }),
  yearBuilt: int("yearBuilt"),
  energyCertificate: varchar("energyCertificate", { length: 8 }),
  condition: varchar("condition_status", { length: 64 }), // New, Renovated, Good, Needs Work

  // Market data
  daysOnMarket: int("daysOnMarket"),
  priceReductions: int("priceReductions").default(0),
  originalPrice: int("originalPrice"),

  // Location
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),

  // Images
  mainImage: text("mainImage"),
  images: json("images"), // Array of image URLs

  // AI Analysis
  aiScore: int("aiScore"), // 0-100
  aiDescription: text("aiDescription"), // AI-rewritten property description
  aiPros: json("aiPros"), // Array of strings
  aiCons: json("aiCons"), // Array of strings
  aiNeighborhood: text("aiNeighborhood"), // AI neighborhood insights
  aiInvestmentAnalysis: text("aiInvestmentAnalysis"),
  bargainingPower: int("bargainingPower"), // 0-100
  suggestedOffer: int("suggestedOffer"),

  // Original listing data
  originalDescription: text("originalDescription"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubmittedProperty = typeof submittedProperties.$inferSelect;
export type InsertSubmittedProperty = typeof submittedProperties.$inferInsert;

// ─── Properties (legacy — kept for compatibility) ────────────
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  state: varchar("state", { length: 128 }).notNull(),
  zip: varchar("zip", { length: 20 }).notNull(),
  price: int("price").notNull(),
  beds: int("beds").notNull(),
  baths: int("baths").notNull(),
  sqft: int("sqft").notNull(),
  yearBuilt: int("yearBuilt").notNull(),
  daysOnMarket: int("daysOnMarket").notNull(),
  image: text("image").notNull(),
  status: mysqlEnum("status", ["active", "pending", "sold"]).default("active").notNull(),
  aiScore: int("aiScore").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("low").notNull(),
  pricePerSqft: int("pricePerSqft").notNull(),
  estimatedValue: int("estimatedValue").notNull(),
  commissionSavings: int("commissionSavings").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  description: text("description").notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 6 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// ─── Transactions ────────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId"),
  propertyAddress: varchar("propertyAddress", { length: 255 }).notNull(),
  stage: mysqlEnum("stage", [
    "offer_submitted",
    "under_contract",
    "inspection",
    "appraisal",
    "closing",
    "closed",
  ]).default("offer_submitted").notNull(),
  stageLabel: varchar("stageLabel", { length: 64 }).notNull(),
  progress: int("progress").notNull().default(0),
  offerPrice: int("offerPrice").notNull(),
  closingDate: varchar("closingDate", { length: 10 }).notNull(),
  daysRemaining: int("daysRemaining").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ─── Transaction Tasks ───────────────────────────────────────
export const transactionTasks = mysqlTable("transaction_tasks", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export type TransactionTask = typeof transactionTasks.$inferSelect;
export type InsertTransactionTask = typeof transactionTasks.$inferInsert;

// ─── Market Metrics ──────────────────────────────────────────
export const marketMetrics = mysqlTable("market_metrics", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 128 }).notNull(),
  value: varchar("value", { length: 64 }).notNull(),
  change: decimal("change_val", { precision: 6, scale: 2 }).notNull(),
  trend: mysqlEnum("trend", ["up", "down", "flat"]).default("flat").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketMetric = typeof marketMetrics.$inferSelect;
export type InsertMarketMetric = typeof marketMetrics.$inferInsert;

// ─── Price History ───────────────────────────────────────────
export const priceHistory = mysqlTable("price_history", {
  id: int("id").autoincrement().primaryKey(),
  month: varchar("month", { length: 10 }).notNull(),
  median: int("median").notNull(),
  listings: int("listings").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

// ─── AI Insights ─────────────────────────────────────────────
export const aiInsights = mysqlTable("ai_insights", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["opportunity", "warning", "trend", "savings"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  confidence: int("confidence").notNull(),
  propertyId: int("propertyId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = typeof aiInsights.$inferInsert;

// ─── User Favorites ──────────────────────────────────────────
export const userFavorites = mysqlTable("user_favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

// ─── Chat Threads ───────────────────────────────────────────
export const chatThreads = mysqlTable("chat_threads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull().default("New Conversation"),
  propertyId: int("propertyId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatThread = typeof chatThreads.$inferSelect;
export type InsertChatThread = typeof chatThreads.$inferInsert;

// ─── Chat Messages ──────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  threadId: int("threadId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Property Offers (Buying Flow) ─────────────────────────
export const propertyOffers = mysqlTable("property_offers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  currentStep: mysqlEnum("currentStep", [
    "analysis",
    "negotiation",
    "due_diligence",
    "make_offer",
    "completion",
  ]).default("analysis").notNull(),
  status: mysqlEnum("offer_status", [
    "active",
    "offer_sent",
    "accepted",
    "rejected",
    "withdrawn",
    "completed",
  ]).default("active").notNull(),

  // Offer details
  offerPrice: int("offerPrice"),
  counterOfferPrice: int("counterOfferPrice"),
  finalPrice: int("finalPrice"),

  // Step completion tracking
  analysisCompleted: boolean("analysisCompleted").default(false).notNull(),
  negotiationCompleted: boolean("negotiationCompleted").default(false).notNull(),
  dueDiligenceCompleted: boolean("dueDiligenceCompleted").default(false).notNull(),
  offerCompleted: boolean("offerCompleted").default(false).notNull(),
  completionCompleted: boolean("completionCompleted").default(false).notNull(),

  // Step data (JSON for flexible storage)
  analysisData: json("analysisData"),
  negotiationData: json("negotiationData"),
  dueDiligenceData: json("dueDiligenceData"),
  offerData: json("offerData"),
  completionData: json("completionData"),

  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyOffer = typeof propertyOffers.$inferSelect;
export type InsertPropertyOffer = typeof propertyOffers.$inferInsert;

// ─── Offer Activity Log ─────────────────────────────────────
export const offerNotes = mysqlTable("offer_notes", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  noteType: mysqlEnum("noteType", ["note", "milestone", "system"]).default("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OfferNote = typeof offerNotes.$inferSelect;
export type InsertOfferNote = typeof offerNotes.$inferInsert;
