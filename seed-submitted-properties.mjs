import { drizzle } from "drizzle-orm/mysql2";
import { submittedProperties } from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// We need a userId — use 1 (the first user / owner)
const OWNER_USER_ID = 1;

// Sample imagery from Unsplash, same source as seed-db.mjs.
const img = (id) => `https://images.unsplash.com/${id}?w=800&h=600&fit=crop&q=80`;

const IMG = {
  villaPool: img("photo-1613977257363-707ba9348227"),
  villaMediterranean: img("photo-1600607687939-ce8a6c25118c"),
  townhouse: img("photo-1600566753190-17f0baa2a6c3"),
  luxuryVilla: img("photo-1600596542815-ffad4c1539a9"),
  apartment: img("photo-1545324418-cc1a3fa10c00"),
  coastalHome: img("photo-1600585154340-be6161a56a0c"),
  interior: img("photo-1555881400-74d7acaacd8b"),
};

// Fictional listings used for local development and demos. Addresses, listing
// URLs and prices are invented; they do not refer to real properties.
const dummyProperties = [
  // ─── 1. Modern T2 Apartment in Vilamoura ─────────────────────
  {
    userId: OWNER_USER_ID,
    sourceUrl: "https://example.com/listings/pt-algarve-1042",
    sourcePlatform: "unknown",
    status: "ready",
    title: "T2 Moderno com Vista Marina — Vilamoura",
    address: "Rua das Amendoeiras 27, Bloco C, 4º Dto",
    city: "Vilamoura",
    district: "Faro",
    zipCode: "8125-401",
    propertyType: "Apartment",
    askingPrice: 329000,
    pricePerSqm: 3656,
    priceHistory: JSON.stringify([
      { date: "2025-07-10", price: 365000 },
      { date: "2025-09-20", price: 349000 },
      { date: "2025-12-05", price: 339000 },
      { date: "2026-02-01", price: 329000 },
    ]),
    bedrooms: 2,
    bathrooms: 2,
    area: 90,
    floor: "4th",
    yearBuilt: 2019,
    energyCertificate: "B",
    condition: "Good",
    daysOnMarket: 243,
    priceReductions: 3,
    originalPrice: 365000,
    lat: "37.0762",
    lng: "-8.1169",
    mainImage: IMG.apartment,
    images: JSON.stringify([IMG.apartment, IMG.interior, IMG.coastalHome, IMG.townhouse]),
    aiScore: 79,
    aiDescription: "A sleek 2-bedroom apartment on the 4th floor of a modern condominium overlooking the Vilamoura Marina. The open-plan living area features floor-to-ceiling windows that flood the space with natural light and frame panoramic views of the marina and ocean beyond. The fully equipped kitchen has Bosch appliances and a breakfast bar. Both bedrooms are en-suite, with the master offering a private balcony. The building includes a rooftop pool, gym, and 24-hour concierge. Underground parking for one car is included.",
    aiPros: JSON.stringify([
      "Marina views from 4th floor — premium location in Vilamoura",
      "Three price reductions totaling €36,000 — motivated seller",
      "243 days on market — strong negotiation position",
      "Both bedrooms en-suite — rare for a T2",
      "Rooftop pool, gym, and concierge included",
      "Underground parking space included",
    ]),
    aiCons: JSON.stringify([
      "Price per m² (€3,656) above Vilamoura average (€3,100)",
      "Condominium fees likely €150-200/month given amenities",
      "4th floor — check elevator reliability and maintenance",
      "North-facing living room may get less afternoon sun",
      "Tourist area — can be noisy during summer months",
    ]),
    aiNeighborhood: "Vilamoura Marina is one of the Algarve's most prestigious addresses, home to luxury yachts, waterfront restaurants, and a vibrant nightlife scene. The area is a 5-minute walk from Praia da Falésia and Praia da Marina. Vilamoura offers five championship golf courses, a casino, and excellent road connections via the A22 motorway. Faro Airport is a 25-minute drive. The area attracts a mix of international residents and tourists year-round, making it ideal for both living and rental income.",
    aiInvestmentAnalysis: "Vilamoura marina-front apartments are among the most sought-after in the Algarve. Similar T2 units achieve €120-180/night on Airbnb during peak season (June-September) and €60-80/night off-season. At the current asking price, gross rental yield would be approximately 4.5-5.8%. The three price reductions over 8 months suggest the seller is motivated — a realistic offer of €305-315k could be accepted. Annual appreciation in Vilamoura has been 3-5% over the past 3 years.",
    bargainingPower: 78,
    suggestedOffer: 308000,
    originalDescription: "Fantástico apartamento T2 com vista marina em Vilamoura. 4º andar, sala ampla com janelas do chão ao teto. Cozinha equipada Bosch. 2 suites. Piscina no terraço, ginásio e portaria 24h. Garagem incluída. Próximo da praia e campos de golfe.",
  },

  // ─── 2. Charming V3 Villa with Pool in Lagos ─────────────────
  {
    userId: OWNER_USER_ID,
    sourceUrl: "https://example.com/listings/pt-algarve-2087",
    sourcePlatform: "unknown",
    status: "ready",
    title: "Moradia V3 com Piscina e Jardim — Lagos",
    address: "Urbanização Vale das Oliveiras, Lote 8",
    city: "Lagos",
    district: "Faro",
    zipCode: "8600-302",
    propertyType: "Villa",
    askingPrice: 545000,
    pricePerSqm: 3028,
    priceHistory: JSON.stringify([
      { date: "2025-11-15", price: 575000 },
      { date: "2026-01-20", price: 545000 },
    ]),
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    floor: null,
    yearBuilt: 2017,
    energyCertificate: "A",
    condition: "Good",
    daysOnMarket: 114,
    priceReductions: 1,
    originalPrice: 575000,
    lat: "37.1058",
    lng: "-8.6795",
    mainImage: IMG.villaPool,
    images: JSON.stringify([IMG.villaPool, IMG.villaMediterranean, IMG.coastalHome, IMG.interior]),
    aiScore: 87,
    aiDescription: "A beautifully maintained 3-bedroom villa in a quiet residential area of Lagos, offering 180m² of living space with a private pool and landscaped garden. The ground floor features a bright living room with fireplace opening onto a covered terrace, a separate dining room, and a modern kitchen with granite countertops. Upstairs, three bedrooms with built-in wardrobes, including a master suite with walk-in shower and views towards Meia Praia. The south-facing garden includes a heated saltwater pool (8x4m), BBQ area, and mature fruit trees. Energy rating A with solar panels for hot water.",
    aiPros: JSON.stringify([
      "€30,000 price reduction — seller showing flexibility",
      "Heated saltwater pool — lower maintenance than chlorine",
      "A energy rating with solar panels — low running costs",
      "Quiet residential area yet 10 minutes from Lagos center",
      "South-facing garden — all-day sun on pool and terrace",
      "Price per m² (€3,028) competitive for Lagos villas with pool",
    ]),
    aiCons: JSON.stringify([
      "114 days on market — moderate, but only 1 reduction so far",
      "Urbanização setting — lacks the character of Old Town Lagos",
      "No sea views — surrounded by other villas",
      "Pool heating costs in winter if used year-round",
      "Garden maintenance required — fruit trees need regular care",
    ]),
    aiNeighborhood: "The Vale das Oliveiras area of Lagos is a popular residential zone favored by families and expats for its tranquility and proximity to amenities. Lagos historic center, with its cobblestone streets, restaurants, and cultural attractions, is a 10-minute drive or 20-minute walk. Meia Praia, one of the Algarve's longest sandy beaches, is 5 minutes away. The area has good access to the EN125 and A22 motorway. International schools, supermarkets, and medical facilities are all within a 10-minute radius.",
    aiInvestmentAnalysis: "Lagos villas with private pools in this price range have shown consistent 4-5% annual appreciation. The property's A energy rating and solar panels reduce operating costs significantly. For holiday rental, similar V3 villas with pool in Lagos achieve €1,200-1,800/week in peak season and €500-700/week in shoulder months. Estimated gross yield of 4.2-5.5%. The €30k reduction suggests room for further negotiation — a realistic offer of €515-525k could be considered.",
    bargainingPower: 58,
    suggestedOffer: 518000,
    originalDescription: "Moradia V3 com piscina aquecida de água salgada em Lagos. 180m², sala com lareira, cozinha com bancada em granito. Suite master com vista para Meia Praia. Jardim com árvores de fruto e zona de BBQ. Painéis solares. Classificação A.",
  },

  // ─── 3. Renovated T2 in Tavira Historic Center ───────────────
  {
    userId: OWNER_USER_ID,
    sourceUrl: "https://example.com/listings/pt-algarve-3154",
    sourcePlatform: "unknown",
    status: "ready",
    title: "T2 Renovado no Centro Histórico — Tavira",
    address: "Rua do Sol Poente 12, 1º Esq",
    city: "Tavira",
    district: "Faro",
    zipCode: "8800-318",
    propertyType: "Apartment",
    askingPrice: 235000,
    pricePerSqm: 2611,
    priceHistory: JSON.stringify([
      { date: "2025-05-10", price: 275000 },
      { date: "2025-07-25", price: 265000 },
      { date: "2025-10-01", price: 249000 },
      { date: "2026-01-15", price: 235000 },
    ]),
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    floor: "1st",
    yearBuilt: 1920,
    energyCertificate: "D",
    condition: "Renovated",
    daysOnMarket: 304,
    priceReductions: 3,
    originalPrice: 275000,
    lat: "37.1267",
    lng: "-7.6506",
    mainImage: IMG.townhouse,
    images: JSON.stringify([IMG.townhouse, IMG.interior, IMG.apartment]),
    aiScore: 65,
    aiDescription: "A character-filled 2-bedroom apartment in the heart of Tavira's historic center, blending traditional Portuguese charm with modern comforts. The renovation preserved original features including hand-painted azulejo tiles, exposed wooden ceiling beams, and terracotta floors, while adding a new kitchen with integrated appliances and a fully modernized bathroom. The living room is spacious with high ceilings and opens onto a Juliet balcony overlooking the cobblestone street below. Located on the 1st floor of a traditional townhouse with no elevator.",
    aiPros: JSON.stringify([
      "Four price reductions totaling €40,000 — highly motivated seller",
      "304 days on market — maximum negotiation leverage",
      "Authentic character: azulejo tiles, wooden beams, high ceilings",
      "Prime historic center location — walk to everything",
      "Recent renovation (2023) with new kitchen and bathroom",
      "Tavira is an emerging market — strong appreciation potential",
    ]),
    aiCons: JSON.stringify([
      "D energy certificate — poor insulation, expect higher utility bills",
      "Only 1 bathroom for a 2-bedroom — limits rental appeal",
      "No parking — challenging in the historic center",
      "Building from 1920 — check structural survey carefully",
      "No outdoor space beyond Juliet balcony",
      "1st floor with no elevator — accessibility limitation",
    ]),
    aiNeighborhood: "Tavira's historic center is widely regarded as the most authentic and charming town in the eastern Algarve. The Rua do Sol Poente area is steps from the iconic Roman bridge, the covered market hall, and dozens of traditional restaurants and cafés along the Gilão River. Ilha de Tavira, a pristine barrier island beach, is accessible by ferry in 15 minutes. Tavira attracts a more discerning, culture-focused visitor and is increasingly popular with expats seeking an alternative to the busier western Algarve. The town has a hospital, international schools, and regular train connections to Faro (30 min).",
    aiInvestmentAnalysis: "Tavira's property market has appreciated 5-7% annually as the town gains recognition. However, the D energy certificate is a significant concern — budget €15-20k for insulation and window upgrades to improve to C or B rating. With 304 days on market and 4 price reductions, the seller is clearly motivated. A realistic offer of €215-220k could be accepted, representing a 20-22% discount from the original asking price. Holiday rental potential is moderate — Tavira attracts cultural tourists willing to pay €80-110/night for authentic accommodation.",
    bargainingPower: 92,
    suggestedOffer: 218000,
    originalDescription: "Apartamento T2 renovado no centro histórico de Tavira. Azulejos originais, vigas de madeira, tetos altos. Cozinha nova com eletrodomésticos integrados. Casa de banho moderna. Varanda Juliet com vista para a rua. Próximo da ponte romana e mercado.",
  },

  // ─── 4. Luxury V5 Villa in Quinta do Lago ────────────────────
  {
    userId: OWNER_USER_ID,
    sourceUrl: "https://example.com/listings/pt-algarve-4210",
    sourcePlatform: "unknown",
    status: "ready",
    title: "Moradia V5 de Luxo com Piscina Infinita — Quinta do Lago",
    address: "Rua da Lagoa Azul, Lote 42",
    city: "Quinta do Lago",
    district: "Faro",
    zipCode: "8135-024",
    propertyType: "Villa",
    askingPrice: 2750000,
    pricePerSqm: 5500,
    priceHistory: JSON.stringify([
      { date: "2025-10-01", price: 2950000 },
      { date: "2026-01-10", price: 2750000 },
    ]),
    bedrooms: 5,
    bathrooms: 6,
    area: 500,
    floor: null,
    yearBuilt: 2023,
    energyCertificate: "A+",
    condition: "New",
    daysOnMarket: 161,
    priceReductions: 1,
    originalPrice: 2950000,
    lat: "37.0340",
    lng: "-8.0234",
    mainImage: IMG.luxuryVilla,
    images: JSON.stringify([IMG.luxuryVilla, IMG.villaMediterranean, IMG.villaPool, IMG.interior]),
    aiScore: 93,
    aiDescription: "An extraordinary contemporary villa in the heart of Quinta do Lago, one of Europe's most exclusive resort communities. This 500m² residence spans three levels and features a dramatic double-height entrance hall, formal living and dining rooms with retractable glass walls opening onto the infinity pool terrace, a professional-grade kitchen with Gaggenau appliances and wine fridge, a home cinema with acoustic paneling, a temperature-controlled wine cellar (200 bottles), and a fully equipped gym with sauna. The master suite occupies the entire upper floor wing with a private terrace, spa-style bathroom with freestanding tub, and a walk-in dressing room. Four additional en-suite bedrooms are spread across the ground and lower floors. Smart home automation controls lighting, climate, security, and audio throughout.",
    aiPros: JSON.stringify([
      "€200,000 price reduction — rare opportunity in Quinta do Lago",
      "A+ energy certificate with full smart home automation",
      "Infinity pool with views towards the Ria Formosa",
      "Premium location in Portugal's most exclusive resort",
      "Brand new (2023) with 10-year structural warranty",
      "Cinema, wine cellar, gym, and sauna — complete lifestyle package",
    ]),
    aiCons: JSON.stringify([
      "Ultra-high price point — very limited buyer pool",
      "Annual Quinta do Lago resort fees (~€6,000-10,000/year)",
      "IMT at maximum bracket (7.5% on €2.75M ≈ €206k in taxes)",
      "Luxury market more sensitive to economic cycles",
      "500m² requires significant maintenance budget",
      "Stamp duty alone would be ~€22k (0.8%)",
    ]),
    aiNeighborhood: "Quinta do Lago is Portugal's most prestigious resort community, consistently ranked among Europe's top luxury destinations. The resort features three championship golf courses (including the famous South Course), the Ria Formosa Natural Park, exclusive beach restaurants, a state-of-the-art sports campus, and 24-hour security. The community attracts an international clientele of high-net-worth individuals, professional athletes, and celebrities. Faro Airport is a 20-minute drive, and the resort offers helicopter transfer services. Property values in Quinta do Lago have historically outperformed the broader Algarve market by 2-3% annually.",
    aiInvestmentAnalysis: "Quinta do Lago luxury villas have shown 6-8% annual appreciation over the past 5 years, significantly outperforming the broader market. The €200k reduction from €2.95M is notable — it suggests either a motivated seller or a market adjustment in the ultra-luxury segment. Similar villas rent for €8,000-15,000/week in peak season. For non-EU buyers, the Golden Visa program (minimum €500k investment) adds additional value. This is a trophy asset with strong capital preservation characteristics. A realistic offer of €2.55-2.65M could be explored given the price reduction and 161 days on market.",
    bargainingPower: 52,
    suggestedOffer: 2580000,
    originalDescription: "Moradia V5 de luxo contemporânea em Quinta do Lago. 500m², piscina infinita, cinema, adega climatizada, ginásio com sauna. Cozinha Gaggenau. Suite master com terraço privado e closet. Domótica completa. Certificação A+. Garantia estrutural 10 anos.",
  },

  // ─── 5. T1 Investment Apartment in Faro Center ───────────────
  {
    userId: OWNER_USER_ID,
    sourceUrl: "https://example.com/listings/pt-algarve-5063",
    sourcePlatform: "unknown",
    status: "ready",
    title: "T1 Investimento no Centro — Faro",
    address: "Rua do Arco Velho 47, 2º Esq",
    city: "Faro",
    district: "Faro",
    zipCode: "8000-145",
    propertyType: "Apartment",
    askingPrice: 178000,
    pricePerSqm: 3236,
    priceHistory: JSON.stringify([
      { date: "2026-01-28", price: 185000 },
      { date: "2026-02-25", price: 178000 },
    ]),
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    floor: "2nd",
    yearBuilt: 2008,
    energyCertificate: "B-",
    condition: "Good",
    daysOnMarket: 41,
    priceReductions: 1,
    originalPrice: 185000,
    lat: "37.0146",
    lng: "-7.9352",
    mainImage: IMG.apartment,
    images: JSON.stringify([IMG.apartment, IMG.interior, IMG.townhouse]),
    aiScore: 74,
    aiDescription: "A well-located 1-bedroom apartment in the heart of Faro, ideal for buy-to-let investment. The property features a bright open-plan living area with a modern kitchenette, one generous double bedroom with built-in wardrobe, and a contemporary bathroom with walk-in shower. Located on the 2nd floor of a well-maintained building with elevator, the apartment includes a small balcony off the living room. The building was constructed in 2008 and is in good structural condition. Close to the University of Algarve, Faro train station, and the historic Cidade Velha.",
    aiPros: JSON.stringify([
      "Prime Faro center location — steps from the main pedestrian shopping street",
      "€7,000 price reduction already — seller open to negotiation",
      "Building has elevator — accessibility advantage",
      "Strong rental demand from university students and professionals",
      "Low entry price for Algarve property investment",
      "B- energy certificate — decent efficiency for 2008 building",
    ]),
    aiCons: JSON.stringify([
      "Only 41 days on market — limited negotiation history",
      "Small area (55m²) — may limit long-term appreciation vs. larger units",
      "Price per m² (€3,236) is above Faro average (€2,800)",
      "No parking — street parking can be difficult in center",
      "Small balcony only — no significant outdoor space",
    ]),
    aiNeighborhood: "Faro's city center is the administrative and cultural capital of the Algarve. The main pedestrian shopping street is a short walk away, lined with cafés, restaurants, and boutiques. The University of Algarve campus (8,000+ students) creates consistent rental demand year-round. Faro Airport is just 10 minutes away, and the train station provides connections along the entire Algarve coast. The historic Cidade Velha (Old Town) with its cathedral, museums, and waterfront is a 5-minute walk. The Ria Formosa Natural Park is accessible by boat from the nearby marina.",
    aiInvestmentAnalysis: "This property is best suited as a buy-to-let investment. Similar T1 apartments in Faro center achieve €650-800/month in long-term rental or €65-95/night for short-term stays. At €178k, the gross rental yield would be approximately 4.4-5.4% for long-term or 6-8% for managed short-term rental. Faro's market is more stable than tourist-heavy areas, with consistent year-round demand driven by the university, hospital, and government offices. The recent €7k reduction after just 41 days suggests the seller may accept €168-172k.",
    bargainingPower: 42,
    suggestedOffer: 170000,
    originalDescription: "Apartamento T1 no centro de Faro, ideal para investimento. Sala com kitchenette moderna, quarto duplo com roupeiro. Casa de banho com base de duche. 2º andar com elevador. Varanda. Próximo da universidade, estação de comboios e Cidade Velha.",
  },
];

async function seed() {
  console.log("Clearing existing submitted properties...");
  await db.delete(submittedProperties);

  console.log("Seeding 5 sample properties...\n");

  for (const prop of dummyProperties) {
    await db.insert(submittedProperties).values(prop);
    console.log(`  ✓ ${prop.title}`);
    console.log(`    ${prop.city} | €${prop.askingPrice.toLocaleString()} | ${prop.bedrooms}bed/${prop.bathrooms}bath | ${prop.area}m²`);
    console.log(`    AI Score: ${prop.aiScore}/100 | Bargaining: ${prop.bargainingPower}/100 | Days: ${prop.daysOnMarket}`);
    console.log();
  }

  console.log(`Done! Inserted ${dummyProperties.length} sample properties.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
