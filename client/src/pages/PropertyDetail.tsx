// ============================================================
// DESIGN: Property detail deep-dive
// DATA: Now fetched from tRPC API (database-backed)
// ============================================================

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  Calendar,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Shield,
  Euro,
  Home,
  Clock,
  FileText,
  Eye,
  Sparkles,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActiveProperty } from "@/contexts/PropertyContext";
import { formatPrice, getScoreGlow, getRiskColor } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COMPS = [
  { address: "Rua das Flores 50, Lagos", price: 498000, sqft: 240, sold: "Jan 2026" },
  { address: "Rua da Oliveira 12, Lagos", price: 475000, sqft: 220, sold: "Dec 2025" },
  { address: "Av. da República 8, Lagos", price: 510000, sqft: 260, sold: "Nov 2025" },
  { address: "Travessa do Mar 3, Lagos", price: 462000, sqft: 210, sold: "Oct 2025" },
];

const PRICE_COMP_DATA = [
  { name: "Trav. Mar", price: 462000 },
  { name: "R. Oliveira", price: 475000 },
  { name: "This", price: 485000 },
  { name: "R. Flores 50", price: 498000 },
  { name: "Av. Rep.", price: 510000 },
];

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { setActiveProperty, clearActiveProperty } = useActiveProperty();

  const { data: property, isLoading } = trpc.properties.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  // Set active property context for AI Chat when viewing a property
  useEffect(() => {
    if (property) {
      setActiveProperty(property.id, property.address);
    }
    return () => clearActiveProperty();
  }, [property, setActiveProperty, clearActiveProperty]);

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
          <p className="text-lg text-muted-foreground">Property not found</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const scoreGlow = getScoreGlow(property.aiScore);

  const DISCLOSURE_FLAGS = [
    { severity: "info", text: t.property.disclosureRoof },
    { severity: "info", text: t.property.disclosureEnergy },
    { severity: "warning", text: t.property.disclosureCrack },
    { severity: "clear", text: t.property.disclosureFlood },
    { severity: "clear", text: t.property.disclosureLitigation },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Nav */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link href="/">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> {t.property.backToDashboard}
            </span>
          </Link>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-72 md:h-96 rounded-xl overflow-hidden"
        >
          <img
            src={property.image}
            alt={property.address}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Floating Info */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{formatPrice(property.price)}</h1>
              <p className="text-lg text-white/80 mt-1">{property.address}</p>
              <p className="text-sm text-white/60 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {property.city}, {property.state} {property.zip}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => toast(t.common.featureComingSoon, { description: t.property.tourComingSoon })}>
                <Eye className="w-4 h-4 mr-1.5" /> {t.property.scheduleTour}
              </Button>
              <Button size="sm" className="bg-gold text-background hover:bg-gold/90" onClick={() => toast(t.common.featureComingSoon, { description: t.property.offerComingSoon })}>
                <Euro className="w-4 h-4 mr-1.5" /> {t.property.makeOffer}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-5"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Bed, label: t.property.bedrooms, value: property.beds },
                  { icon: Bath, label: t.property.bathrooms, value: property.baths },
                  { icon: Maximize, label: t.property.area, value: property.sqft },
                  { icon: Calendar, label: t.property.yearBuilt, value: property.yearBuilt },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold-dim flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground font-mono">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-5"
            >
              <h2 className="text-sm font-semibold text-foreground mb-3">{t.property.aboutProperty}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" /> {property.type}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {property.daysOnMarket} {t.property.daysOnMarket}
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="w-3.5 h-3.5" /> €{property.pricePerSqft}/m²
                </span>
              </div>
            </motion.div>

            {/* Comparable Sales Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5"
            >
              <h2 className="text-sm font-semibold text-foreground mb-1">{t.property.comparableSales}</h2>
              <p className="text-xs text-muted-foreground mb-4">
                {t.property.recentSales}
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PRICE_COMP_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="name"
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
                      content={({ active, payload, label }: any) =>
                        active && payload?.length ? (
                          <div className="glass-card p-3 shadow-lg">
                            <p className="text-xs font-medium text-foreground">{label}</p>
                            <p className="text-xs text-terra-green font-mono">{formatPrice(payload[0].value)}</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar
                      dataKey="price"
                      radius={[4, 4, 0, 0]}
                      fill="rgba(42,157,110,0.3)"
                      stroke="#2a9d6e"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Comps Table */}
              <div className="mt-4 border-t border-border pt-4">
                <div className="space-y-2">
                  {COMPS.map((comp, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="text-sm text-foreground">{comp.address}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {comp.sqft} m² · {t.property.sold} {comp.sold}
                        </p>
                      </div>
                      <p className="text-sm font-mono font-medium text-foreground">
                        {formatPrice(comp.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: AI Analysis Sidebar */}
          <div className="space-y-6">
            {/* AI Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`glass-card p-5 ${scoreGlow}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-semibold text-foreground">{t.property.aiAnalysis}</h2>
              </div>
              {/* Score Circle */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      stroke={property.aiScore >= 80 ? "#2a9d6e" : property.aiScore >= 60 ? "#DFB03A" : "#c94040"}
                      strokeWidth="6"
                      strokeDasharray={`${(property.aiScore / 100) * 301.59} 301.59`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground font-mono">{property.aiScore}</span>
                    <span className="text-[10px] text-muted-foreground">{t.property.aiScoreLabel}</span>
                  </div>
                </div>
              </div>
              {/* Score Breakdown */}
              <div className="space-y-3">
                {[
                  { label: t.property.valueAssessment, score: property.aiScore >= 80 ? t.property.strong : t.property.fair, color: property.aiScore >= 80 ? "text-terra-green" : "text-gold" },
                  { label: t.property.riskLevel, score: property.riskLevel.charAt(0).toUpperCase() + property.riskLevel.slice(1), color: getRiskColor(property.riskLevel) },
                  { label: t.property.marketPosition, score: property.estimatedValue > property.price ? t.property.belowMarket : t.property.aboveMarket, color: property.estimatedValue > property.price ? "text-terra-green" : "text-gold" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className={`text-xs font-medium ${item.color}`}>{item.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Estimated Value */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3">{t.property.valuation}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{t.property.listingPrice}</span>
                  <span className="text-sm font-mono text-foreground">{formatPrice(property.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{t.property.aiEstimatedValue}</span>
                  <span className="text-sm font-mono text-terra-green">{formatPrice(property.estimatedValue)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">{t.property.difference}</span>
                  <span className={`text-sm font-mono font-medium ${property.estimatedValue > property.price ? "text-terra-green" : "text-warm-rose"}`}>
                    {property.estimatedValue > property.price ? "+" : ""}{formatPrice(property.estimatedValue - property.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{t.property.estimatedSavings}</span>
                  <span className="text-sm font-mono text-terra-green font-medium">{formatPrice(property.commissionSavings)}</span>
                </div>
              </div>
            </motion.div>

            {/* Disclosure Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-semibold text-foreground">{t.property.disclosureAnalysis}</h3>
              </div>
              <div className="space-y-2.5">
                {DISCLOSURE_FLAGS.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {flag.severity === "warning" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" />
                    ) : flag.severity === "clear" ? (
                      <CheckCircle className="w-3.5 h-3.5 text-terra-green mt-0.5 flex-shrink-0" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">{flag.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
