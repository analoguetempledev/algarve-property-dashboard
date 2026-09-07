// ============================================================
// Property Analysis — Homa-style analysis with AI sections
// ============================================================

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  TrendingDown,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Building,
  Calendar,
  Ruler,
  Zap,
  Target,
  MessageCircle,
  Send,
  Loader2,
  Home,
  ChevronDown,
  ChevronUp,
  Flame,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import AnalysisLoadingIndicator from "@/components/AnalysisLoadingIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useChatTrigger } from "@/contexts/ChatTriggerContext";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function BargainingPowerGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#2a9d6e" : score >= 40 ? "#DFB03A" : "#e57373";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold font-mono" style={{ color }}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

function SuggestedQuestionButton({
  question,
  onClick,
}: {
  question: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left px-3 py-2 rounded-lg bg-gold/8 border border-gold/15 text-xs text-foreground hover:bg-gold/15 transition-colors"
    >
      {question}
    </motion.button>
  );
}

export default function PropertyAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { askAboutProperty } = useChatTrigger();
  const [showOriginalDesc, setShowOriginalDesc] = useState(false);
  const [, navigate] = useLocation();

  const { data: property, isLoading } = trpc.submittedProperties.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id && isAuthenticated }
  );

  const priceHistory = useMemo(() => {
    if (!property?.priceHistory) return [];
    try {
      const parsed = typeof property.priceHistory === "string"
        ? JSON.parse(property.priceHistory)
        : property.priceHistory;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [property?.priceHistory]);

  const pros = useMemo(() => {
    if (!property?.aiPros) return [];
    try {
      const parsed = typeof property.aiPros === "string"
        ? JSON.parse(property.aiPros)
        : property.aiPros;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [property?.aiPros]);

  const cons = useMemo(() => {
    if (!property?.aiCons) return [];
    try {
      const parsed = typeof property.aiCons === "string"
        ? JSON.parse(property.aiCons)
        : property.aiCons;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [property?.aiCons]);

  const suggestedQuestions = [
    "What makes this property a good investment?",
    "What are the risks of buying this property?",
    "How does this compare to similar properties in the area?",
    "What are the IMT taxes for this property?",
    "Is the asking price fair based on market data?",
    "What is the neighborhood like?",
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Home className="w-12 h-12 text-muted-foreground opacity-50" />
          <p className="text-foreground font-medium">Property not found</p>
          <Link href="/properties">
            <span className="text-gold hover:underline text-sm cursor-pointer">
              {t.analysis.backToProperties}
            </span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading indicator for pending/analyzing properties
  if (property.status === "pending" || property.status === "analyzing") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/properties">
              <span className="text-sm text-gold flex items-center gap-1 hover:underline cursor-pointer mb-4 inline-flex">
                <ArrowLeft className="w-4 h-4" /> {t.analysis.backToProperties}
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {property.title || property.address || "Property Analysis"}
            </h1>
            {property.sourceUrl && (
              <a
                href={property.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold flex items-center gap-1 hover:underline mt-2 inline-flex"
              >
                View original listing <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            <AnalysisLoadingIndicator status={property.status as "pending" | "analyzing"} />
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const savings = property.askingPrice && property.suggestedOffer
    ? property.askingPrice - property.suggestedOffer
    : 0;
  const savingsPercent = property.askingPrice && savings
    ? ((savings / property.askingPrice) * 100).toFixed(1)
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/properties">
            <span className="text-sm text-gold flex items-center gap-1 hover:underline cursor-pointer mb-4 inline-flex">
              <ArrowLeft className="w-4 h-4" /> {t.analysis.backToProperties}
            </span>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {property.title || property.address || "Property Analysis"}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {property.city}{property.address ? `, ${property.address}` : ""}
                </span>
                {property.sourceUrl && (
                  <a
                    href={property.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold flex items-center gap-1 hover:underline"
                  >
                    {t.analysis.source} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            {property.aiScore && (
              <div className={`text-center px-4 py-2 rounded-xl ${
                property.aiScore >= 80
                  ? "bg-terra-green-dim border border-terra-green/20"
                  : property.aiScore >= 60
                  ? "bg-gold-dim border border-gold/20"
                  : "bg-warm-rose-dim border border-warm-rose/20"
              }`}>
                <p className="text-2xl font-bold font-mono" style={{
                  color: property.aiScore >= 80 ? "#2a9d6e" : property.aiScore >= 60 ? "#DFB03A" : "#e57373"
                }}>
                  {property.aiScore}
                </p>
                <p className="text-[10px] text-muted-foreground">AI Score</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Image + Gallery */}
        {property.mainImage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl overflow-hidden"
          >
            <img
              src={property.mainImage}
              alt={property.title || "Property"}
              className="w-full h-80 object-cover rounded-xl"
            />
          </motion.div>
        )}

        {/* Key Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          <div className="glass-card p-4 text-center">
            <p className="text-lg font-bold text-gold font-mono">
              {property.askingPrice ? formatPrice(property.askingPrice) : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{t.analysis.askingPrice}</p>
          </div>
          {property.area && (
            <div className="glass-card p-4 text-center">
              <p className="text-lg font-bold text-foreground font-mono">{property.area} m²</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t.compare.area}</p>
            </div>
          )}
          {property.askingPrice && property.area && (
            <div className="glass-card p-4 text-center">
              <p className="text-lg font-bold text-foreground font-mono">
                {formatPrice(Math.round(property.askingPrice / property.area))}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{t.analysis.pricePerSqm}</p>
            </div>
          )}
          {property.bedrooms && (
            <div className="glass-card p-4 text-center">
              <p className="text-lg font-bold text-foreground">{property.bedrooms}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t.property.bedrooms}</p>
            </div>
          )}
          {property.bathrooms && (
            <div className="glass-card p-4 text-center">
              <p className="text-lg font-bold text-foreground">{property.bathrooms}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t.property.bathrooms}</p>
            </div>
          )}
          {property.daysOnMarket != null && (
            <div className="glass-card p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">{property.daysOnMarket}</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{t.analysis.daysOnMarket}</p>
            </div>
          )}
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Analysis Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Additional Details */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-5"
            >
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-gold" />
                {t.analysis.overview}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.propertyType && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</p>
                    <p className="text-sm font-medium text-foreground mt-1">{property.propertyType}</p>
                  </div>
                )}
                {property.yearBuilt && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.analysis.yearBuilt}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{property.yearBuilt}</p>
                  </div>
                )}
                {property.condition && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.analysis.condition}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{property.condition}</p>
                  </div>
                )}
                {property.energyCertificate && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.analysis.energyCertificate}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{property.energyCertificate}</p>
                  </div>
                )}
                {property.floor && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.analysis.floor}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{property.floor}</p>
                  </div>
                )}
                {property.priceReductions != null && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.analysis.priceReductions}</p>
                    <p className="text-sm font-medium text-warm-rose mt-1 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {property.priceReductions}
                    </p>
                  </div>
                )}
                {property.originalPrice && property.originalPrice !== property.askingPrice && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.analysis.originalPrice}</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1 line-through font-mono">
                      {formatPrice(property.originalPrice)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Description */}
            {property.aiDescription && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-5"
              >
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  {t.analysis.aiDescription}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {property.aiDescription}
                </p>
                {property.originalDescription && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowOriginalDesc(!showOriginalDesc)}
                      className="text-xs text-gold flex items-center gap-1 hover:underline"
                    >
                      {t.analysis.originalDescription}
                      {showOriginalDesc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showOriginalDesc && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 p-3 rounded-lg bg-secondary text-xs text-muted-foreground leading-relaxed"
                      >
                        {property.originalDescription}
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Pros & Cons */}
            {(pros.length > 0 || cons.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {pros.length > 0 && (
                  <div className="glass-card p-5 border-terra-green/15">
                    <h3 className="text-sm font-semibold text-terra-green mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      {t.analysis.pros}
                    </h3>
                    <ul className="space-y-2">
                      {pros.map((pro: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-terra-green mt-1.5 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {cons.length > 0 && (
                  <div className="glass-card p-5 border-warm-rose/15">
                    <h3 className="text-sm font-semibold text-warm-rose mb-3 flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4" />
                      {t.analysis.cons}
                    </h3>
                    <ul className="space-y-2">
                      {cons.map((con: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warm-rose mt-1.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Neighborhood Insights */}
            {property.aiNeighborhood && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-5"
              >
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  {t.analysis.neighborhoodInsights}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {property.aiNeighborhood}
                </p>
              </motion.div>
            )}

            {/* Price History Chart */}
            {priceHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card p-5"
              >
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gold" />
                  {t.analysis.priceHistory}
                </h2>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#6b6b70" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b6b70" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass-card p-3 !bg-card border border-border shadow-lg">
                                <p className="text-xs font-medium text-foreground mb-1">{label}</p>
                                <p className="text-xs text-gold font-mono font-semibold">
                                  {formatPrice(payload[0].value as number)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#DFB03A"
                        strokeWidth={2}
                        dot={{ fill: "#DFB03A", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Investment Analysis */}
            {property.aiInvestmentAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-5"
              >
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-gold" />
                  {t.analysis.investmentAnalysis}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {property.aiInvestmentAnalysis}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar: Bargaining Power + Suggested Offer + AI Chat */}
          <div className="space-y-6">
            {/* Bargaining Power */}
            {property.bargainingPower && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-gold" />
                  {t.analysis.bargainingPower}
                </h3>
                <p className="text-[10px] text-muted-foreground mb-4">
                  {t.analysis.bargainingPowerDesc}
                </p>
                <BargainingPowerGauge score={property.bargainingPower} />
              </motion.div>
            )}

            {/* Suggested Offer */}
            {property.suggestedOffer && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-5 border-terra-green/20"
              >
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4 text-terra-green" />
                  {t.analysis.suggestedOffer}
                </h3>
                <p className="text-[10px] text-muted-foreground mb-4">
                  {t.analysis.suggestedOfferDesc}
                </p>
                <p className="text-2xl font-bold text-terra-green font-mono">
                  {formatPrice(property.suggestedOffer)}
                </p>
                {savings > 0 && (
                  <p className="text-xs text-terra-green mt-2 font-medium">
                    -{savingsPercent}% ({formatPrice(savings)} {t.analysis.savingsFromAsking})
                  </p>
                )}
                {property.askingPrice && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t.analysis.askingPrice}</span>
                      <span className="font-mono text-foreground">{formatPrice(property.askingPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">{t.analysis.suggestedOffer}</span>
                      <span className="font-mono text-terra-green font-semibold">{formatPrice(property.suggestedOffer)}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Make an Offer CTA */}
            <MakeOfferButton propertyId={Number(id)} />

            {/* Curious About This Property? — AI Chat CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-5 border-gold/20 relative overflow-hidden"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gold/10 blur-2xl" />
              <div className="relative">
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gold" />
                  {t.analysis.curious}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {t.analysis.curiousDesc}
                </p>

                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {t.analysis.suggestedQuestions}
                  </p>
                  {suggestedQuestions.map((q, i) => (
                    <SuggestedQuestionButton
                      key={i}
                      question={q}
                      onClick={() => askAboutProperty(q, Number(id))}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Make an Offer Button ──────────────────────────────────
function MakeOfferButton({ propertyId }: { propertyId: number }) {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: existingOffer } = trpc.offers.getByPropertyId.useQuery(
    { propertyId },
    { enabled: isAuthenticated && !!propertyId }
  );

  const createOffer = trpc.offers.create.useMutation({
    onSuccess: (offer) => {
      if (offer) {
        navigate(`/offers/${offer.id}`);
      }
    },
  });

  if (existingOffer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <Link href={`/offers/${existingOffer.id}`}>
          <div className="glass-card p-5 border-gold/20 cursor-pointer hover:border-gold/40 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                    Continue Buying Process
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Step: {existingOffer.currentStep.replace("_", " ")} — {existingOffer.status.replace("_", " ")}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
    >
      <Button
        onClick={() => createOffer.mutate({ propertyId })}
        disabled={createOffer.isPending || !isAuthenticated}
        className="w-full bg-gold hover:bg-gold/90 text-background gap-2 h-12 text-sm font-semibold"
      >
        {createOffer.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Make an Offer — Start Buying Process
      </Button>
    </motion.div>
  );
}
