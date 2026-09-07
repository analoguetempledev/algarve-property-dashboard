// ============================================================
// DESIGN: Warm gold, Algarve properties
// DATA: Mock property & market data for the Portugal real estate dashboard
// ============================================================

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  daysOnMarket: number;
  image: string;
  status: "active" | "pending" | "sold";
  aiScore: number; // 0-100
  riskLevel: "low" | "medium" | "high";
  pricePerSqft: number;
  estimatedValue: number;
  commissionSavings: number;
  type: string;
  description: string;
  lat: number;
  lng: number;
}

export interface Transaction {
  id: string;
  propertyAddress: string;
  stage: "offer_submitted" | "under_contract" | "inspection" | "appraisal" | "closing" | "closed";
  stageLabel: string;
  progress: number;
  offerPrice: number;
  closingDate: string;
  daysRemaining: number;
  tasks: { label: string; completed: boolean }[];
}

export interface MarketMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "flat";
}

// Unsplash images — Algarve & Portuguese property style
const UNSPLASH_ALGARVE_VILLA = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80";
const UNSPLASH_ALGARVE_CONDO = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&q=80";
const UNSPLASH_ALGARVE_COASTAL = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80";

export const PROPERTY_IMAGES = {
  luxury1: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop&q=80",
  luxury2: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80",
  modern3: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&q=80",
  hero: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&h=900&fit=crop&q=80",
  abstract: "",
};

export const PROPERTIES: Property[] = [
  {
    id: "1",
    address: "Rua das Flores 42",
    city: "Lagos",
    state: "Algarve",
    zip: "8600-315",
    price: 485000,
    beds: 4,
    baths: 3,
    sqft: 228,
    yearBuilt: 2019,
    daysOnMarket: 12,
    image: PROPERTY_IMAGES.luxury1,
    status: "active",
    aiScore: 87,
    riskLevel: "low",
    pricePerSqft: 2127,
    estimatedValue: 502000,
    commissionSavings: 12125,
    type: "Moradia",
    description: "Stunning modern villa with open floor plan, gourmet kitchen, and resort-style pool. Walking distance to Meia Praia beach and Lagos Marina.",
    lat: 37.1028,
    lng: -8.6731,
  },
  {
    id: "2",
    address: "Av. dos Descobrimentos 18",
    city: "Albufeira",
    state: "Algarve",
    zip: "8200-144",
    price: 725000,
    beds: 5,
    baths: 4,
    sqft: 320,
    yearBuilt: 2021,
    daysOnMarket: 5,
    image: PROPERTY_IMAGES.luxury2,
    status: "active",
    aiScore: 92,
    riskLevel: "low",
    pricePerSqft: 2266,
    estimatedValue: 748000,
    commissionSavings: 18125,
    type: "Villa",
    description: "Luxurious Mediterranean villa with terracotta roof, infinity pool, and lush gardens. Panoramic sea views over the Algarve coastline.",
    lat: 37.0893,
    lng: -8.2478,
  },
  {
    id: "3",
    address: "Travessa do Castelo 7",
    city: "Tavira",
    state: "Algarve",
    zip: "8800-318",
    price: 389000,
    beds: 3,
    baths: 2,
    sqft: 185,
    yearBuilt: 2023,
    daysOnMarket: 28,
    image: PROPERTY_IMAGES.modern3,
    status: "active",
    aiScore: 74,
    riskLevel: "medium",
    pricePerSqft: 2103,
    estimatedValue: 375000,
    commissionSavings: 9725,
    type: "Apartamento",
    description: "Beautifully renovated townhouse in the historic center of Tavira. Original azulejo tiles preserved alongside modern finishes. Near Ilha de Tavira.",
    lat: 37.1267,
    lng: -7.6506,
  },
  {
    id: "4",
    address: "Estrada da Quinta do Lago",
    city: "Quinta do Lago",
    state: "Algarve",
    zip: "8135-024",
    price: 1250000,
    beds: 6,
    baths: 5,
    sqft: 450,
    yearBuilt: 2020,
    daysOnMarket: 3,
    image: UNSPLASH_ALGARVE_VILLA,
    status: "active",
    aiScore: 95,
    riskLevel: "low",
    pricePerSqft: 2778,
    estimatedValue: 1310000,
    commissionSavings: 31250,
    type: "Villa de Luxo",
    description: "Magnificent luxury villa in the prestigious Quinta do Lago resort. Private pool, landscaped gardens, and direct access to the Ria Formosa nature reserve.",
    lat: 37.0340,
    lng: -8.0234,
  },
  {
    id: "5",
    address: "Rua do Comércio 33",
    city: "Faro",
    state: "Algarve",
    zip: "8000-145",
    price: 315000,
    beds: 2,
    baths: 2,
    sqft: 120,
    yearBuilt: 2015,
    daysOnMarket: 45,
    image: UNSPLASH_ALGARVE_CONDO,
    status: "pending",
    aiScore: 62,
    riskLevel: "high",
    pricePerSqft: 2625,
    estimatedValue: 295000,
    commissionSavings: 7875,
    type: "Apartamento",
    description: "Updated apartment in Faro's Old Town with rooftop terrace and city views. Note: Building has pending condominium assessment. Previous moisture issue documented.",
    lat: 37.0146,
    lng: -7.9352,
  },
  {
    id: "6",
    address: "Rua da Praia 15",
    city: "Carvoeiro",
    state: "Algarve",
    zip: "8400-517",
    price: 890000,
    beds: 4,
    baths: 3,
    sqft: 290,
    yearBuilt: 2022,
    daysOnMarket: 8,
    image: UNSPLASH_ALGARVE_COASTAL,
    status: "active",
    aiScore: 89,
    riskLevel: "low",
    pricePerSqft: 3069,
    estimatedValue: 915000,
    commissionSavings: 22250,
    type: "Moradia",
    description: "Elegant coastal home with designer finishes, chef's kitchen, and private courtyard. Steps from Praia do Carvoeiro with stunning cliff-top views.",
    lat: 37.0948,
    lng: -8.4718,
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    propertyAddress: "Rua das Flores 42, Lagos",
    stage: "inspection",
    stageLabel: "Inspection",
    progress: 55,
    offerPrice: 470000,
    closingDate: "2026-03-28",
    daysRemaining: 38,
    tasks: [
      { label: "Offer submitted", completed: true },
      { label: "Offer accepted", completed: true },
      { label: "Deposit transferred (CPCV signed)", completed: true },
      { label: "Property survey scheduled", completed: true },
      { label: "Survey completed", completed: false },
      { label: "Fiscal number (NIF) confirmed", completed: false },
      { label: "Final walkthrough", completed: false },
      { label: "Escritura (deed signing)", completed: false },
    ],
  },
  {
    id: "t2",
    propertyAddress: "Av. dos Descobrimentos 18, Albufeira",
    stage: "offer_submitted",
    stageLabel: "Offer Submitted",
    progress: 15,
    offerPrice: 710000,
    closingDate: "2026-04-15",
    daysRemaining: 56,
    tasks: [
      { label: "Offer submitted", completed: true },
      { label: "Waiting for seller response", completed: false },
      { label: "Deposit transfer", completed: false },
      { label: "Property survey", completed: false },
      { label: "Legal due diligence", completed: false },
      { label: "Final walkthrough", completed: false },
      { label: "Escritura (deed signing)", completed: false },
    ],
  },
];

export const MARKET_METRICS: MarketMetric[] = [
  { label: "Median Home Price", value: "€425,000", change: 3.2, trend: "up" },
  { label: "Avg Days on Market", value: "24 days", change: -8.5, trend: "down" },
  { label: "Active Listings", value: "1,247", change: 12.1, trend: "up" },
  { label: "Price per m²", value: "€2,280", change: 1.8, trend: "up" },
  { label: "Sold Last 30 Days", value: "342", change: -2.3, trend: "down" },
  { label: "Avg Savings", value: "€10,755", change: 5.4, trend: "up" },
];

export const PRICE_HISTORY = [
  { month: "Aug", median: 398000, listings: 1050 },
  { month: "Sep", median: 405000, listings: 1120 },
  { month: "Oct", median: 412000, listings: 1180 },
  { month: "Nov", median: 408000, listings: 1090 },
  { month: "Dec", median: 415000, listings: 980 },
  { month: "Jan", median: 420000, listings: 1150 },
  { month: "Feb", median: 425000, listings: 1247 },
];

export const AI_INSIGHTS = [
  {
    type: "opportunity" as const,
    title: "Below-Market Opportunity",
    description: "Travessa do Castelo 7 in Tavira is priced 3.8% below estimated market value. The 28 days on market suggests room for negotiation.",
    confidence: 82,
    propertyId: "3",
  },
  {
    type: "warning" as const,
    title: "Disclosure Red Flag",
    description: "Rua do Comércio 33 in Faro has a pending condominium assessment and documented moisture history. Recommend thorough survey.",
    confidence: 91,
    propertyId: "5",
  },
  {
    type: "trend" as const,
    title: "Algarve Market Heating Up",
    description: "Algarve median prices up 3.2% month-over-month. Properties under €500K are moving 40% faster than last quarter.",
    confidence: 88,
    propertyId: null,
  },
  {
    type: "savings" as const,
    title: "Savings Alert",
    description: "Your active offers could save you a combined €30,250 through our data-driven negotiation approach.",
    confidence: 95,
    propertyId: null,
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("de-DE").format(num);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-terra-green";
  if (score >= 60) return "text-gold";
  return "text-warm-rose";
}

export function getScoreGlow(score: number): string {
  if (score >= 80) return "glow-teal";
  if (score >= 60) return "glow-amber";
  return "glow-rose";
}

export function getRiskColor(risk: string): string {
  if (risk === "low") return "text-terra-green";
  if (risk === "medium") return "text-gold";
  return "text-warm-rose";
}

export function getRiskBg(risk: string): string {
  if (risk === "low") return "bg-terra-green-dim";
  if (risk === "medium") return "bg-gold-dim";
  return "bg-warm-rose-dim";
}

export function getScoreHex(score: number): string {
  if (score >= 80) return "#2a9d6e"; // terra green
  if (score >= 60) return "#DFB03A"; // gold
  return "#c94040"; // warm rose
}
