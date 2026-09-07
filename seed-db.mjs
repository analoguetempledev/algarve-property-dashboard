import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.execute(sql`DELETE FROM user_favorites`);
  await db.execute(sql`DELETE FROM ai_insights`);
  await db.execute(sql`DELETE FROM price_history`);
  await db.execute(sql`DELETE FROM market_metrics`);
  await db.execute(sql`DELETE FROM transaction_tasks`);
  await db.execute(sql`DELETE FROM transactions`);
  await db.execute(sql`DELETE FROM properties`);
  console.log("  ✓ Cleared existing data");

  // ─── Properties ──────────────────────────────────────────
  await db.execute(sql`INSERT INTO properties (address, city, state, zip, price, beds, baths, sqft, yearBuilt, daysOnMarket, image, status, aiScore, riskLevel, pricePerSqft, estimatedValue, commissionSavings, type, description, lat, lng) VALUES
    ('Rua das Flores 42', 'Lagos', 'Algarve', '8600-315', 485000, 4, 3, 228, 2019, 12, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop&q=80', 'active', 87, 'low', 2127, 502000, 12125, 'Moradia', 'Stunning modern villa with open floor plan, gourmet kitchen, and resort-style pool. Walking distance to Meia Praia beach and Lagos Marina.', 37.102800, -8.673100),
    ('Av. dos Descobrimentos 18', 'Albufeira', 'Algarve', '8200-144', 725000, 5, 4, 320, 2021, 5, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80', 'active', 92, 'low', 2266, 748000, 18125, 'Villa', 'Luxurious Mediterranean villa with terracotta roof, infinity pool, and lush gardens. Panoramic sea views over the Algarve coastline.', 37.089300, -8.247800),
    ('Travessa do Castelo 7', 'Tavira', 'Algarve', '8800-318', 389000, 3, 2, 185, 2023, 28, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&q=80', 'active', 74, 'medium', 2103, 375000, 9725, 'Apartamento', 'Beautifully renovated townhouse in the historic center of Tavira. Original azulejo tiles preserved alongside modern finishes. Near Ilha de Tavira.', 37.126700, -7.650600),
    ('Estrada da Quinta do Lago', 'Quinta do Lago', 'Algarve', '8135-024', 1250000, 6, 5, 450, 2020, 3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80', 'active', 95, 'low', 2778, 1310000, 31250, 'Villa de Luxo', 'Magnificent luxury villa in the prestigious Quinta do Lago resort. Private pool, landscaped gardens, and direct access to the Ria Formosa nature reserve.', 37.034000, -8.023400),
    ('Rua do Comercio 33', 'Faro', 'Algarve', '8000-145', 315000, 2, 2, 120, 2015, 45, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&q=80', 'pending', 62, 'high', 2625, 295000, 7875, 'Apartamento', 'Updated apartment in Faros Old Town with rooftop terrace and city views. Note: Building has pending condominium assessment. Previous moisture issue documented.', 37.014600, -7.935200),
    ('Rua da Praia 15', 'Carvoeiro', 'Algarve', '8400-517', 890000, 4, 3, 290, 2022, 8, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80', 'active', 89, 'low', 3069, 915000, 22250, 'Moradia', 'Elegant coastal home with designer finishes, chefs kitchen, and private courtyard. Steps from Praia do Carvoeiro with stunning cliff-top views.', 37.094800, -8.471800)
  `);
  console.log("  ✓ 6 properties inserted");

  // ─── Transactions ──────────────────────────────────────────
  await db.execute(sql`INSERT INTO transactions (propertyId, propertyAddress, stage, stageLabel, progress, offerPrice, closingDate, daysRemaining) VALUES
    (1, 'Rua das Flores 42, Lagos', 'inspection', 'Inspection', 55, 470000, '2026-03-28', 38),
    (2, 'Av. dos Descobrimentos 18, Albufeira', 'offer_submitted', 'Offer Submitted', 15, 710000, '2026-04-15', 56)
  `);
  console.log("  ✓ 2 transactions inserted");

  // ─── Transaction Tasks ─────────────────────────────────────
  await db.execute(sql`INSERT INTO transaction_tasks (transactionId, label, completed, sortOrder) VALUES
    (1, 'Offer submitted', true, 1),
    (1, 'Offer accepted', true, 2),
    (1, 'Deposit transferred (CPCV signed)', true, 3),
    (1, 'Property survey scheduled', true, 4),
    (1, 'Survey completed', false, 5),
    (1, 'Fiscal number (NIF) confirmed', false, 6),
    (1, 'Final walkthrough', false, 7),
    (1, 'Escritura (deed signing)', false, 8),
    (2, 'Offer submitted', true, 1),
    (2, 'Waiting for seller response', false, 2),
    (2, 'Deposit transfer', false, 3),
    (2, 'Property survey', false, 4),
    (2, 'Legal due diligence', false, 5),
    (2, 'Final walkthrough', false, 6),
    (2, 'Escritura (deed signing)', false, 7)
  `);
  console.log("  ✓ 15 transaction tasks inserted");

  // ─── Market Metrics ────────────────────────────────────────
  await db.execute(sql`INSERT INTO market_metrics (label, value, change_val, trend) VALUES
    ('Median Home Price', '€425,000', 3.20, 'up'),
    ('Avg Days on Market', '24 days', -8.50, 'down'),
    ('Active Listings', '1,247', 12.10, 'up'),
    ('Price per m²', '€2,280', 1.80, 'up'),
    ('Sold Last 30 Days', '342', -2.30, 'down'),
    ('Avg Savings', '€10,755', 5.40, 'up')
  `);
  console.log("  ✓ 6 market metrics inserted");

  // ─── Price History ─────────────────────────────────────────
  await db.execute(sql`INSERT INTO price_history (month, median, listings) VALUES
    ('Aug', 398000, 1050),
    ('Sep', 405000, 1120),
    ('Oct', 412000, 1180),
    ('Nov', 408000, 1090),
    ('Dec', 415000, 980),
    ('Jan', 420000, 1150),
    ('Feb', 425000, 1247)
  `);
  console.log("  ✓ 7 price history records inserted");

  // ─── AI Insights ───────────────────────────────────────────
  await db.execute(sql`INSERT INTO ai_insights (type, title, description, confidence, propertyId) VALUES
    ('opportunity', 'Below-Market Opportunity', 'Travessa do Castelo 7 in Tavira is priced 3.8% below estimated market value. The 28 days on market suggests room for negotiation.', 82, 3),
    ('warning', 'Disclosure Red Flag', 'Rua do Comercio 33 in Faro has a pending condominium assessment and documented moisture history. Recommend thorough survey.', 91, 5),
    ('trend', 'Algarve Market Heating Up', 'Algarve median prices up 3.2% month-over-month. Properties under 500K are moving 40% faster than last quarter.', 88, NULL),
    ('savings', 'Savings Alert', 'Your active offers could save you a combined 30,250 through our data-driven negotiation approach.', 95, NULL)
  `);
  console.log("  ✓ 4 AI insights inserted");

  console.log("\n✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
