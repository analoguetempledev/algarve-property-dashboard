// ============================================================
// DESIGN: Obsidian & Gold Dark Luxury Dashboard
// URL submission box, Map, Market Trends, AI Insights
// ============================================================

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  BarChart3,
  Lightbulb,
  ShieldAlert,
  Zap,
  Map,
  Loader2,
  Link2,
  Plus,
  CheckCircle2,
  ExternalLink,
  Home,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import PropertyMap from "@/components/PropertyMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function MetricCard({
  metric,
  index,
  vsLabel,
}: {
  metric: { label: string; value: string; change: number; trend: string };
  index: number;
  vsLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="glass-card p-4 flex flex-col gap-2"
    >
      <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
      <p className="text-xl font-bold text-foreground font-mono">{metric.value}</p>
      <div className="flex items-center gap-1">
        {metric.trend === "up" ? (
          <TrendingUp className="w-3 h-3 text-terra-green" />
        ) : (
          <TrendingDown className="w-3 h-3 text-warm-rose" />
        )}
        <span
          className={`text-xs font-mono font-medium ${
            metric.trend === "up" ? "text-terra-green" : "text-warm-rose"
          }`}
        >
          {metric.change > 0 ? "+" : ""}
          {metric.change}%
        </span>
        <span className="text-[10px] text-muted-foreground">{vsLabel}</span>
      </div>
    </motion.div>
  );
}

function InsightCard({
  insight,
  index,
  confLabel,
}: {
  insight: { type: string; title: string; description: string; confidence: number };
  index: number;
  confLabel: string;
}) {
  const iconMap: Record<string, any> = {
    opportunity: Lightbulb,
    warning: ShieldAlert,
    trend: BarChart3,
    savings: Zap,
  };
  const colorMap: Record<string, string> = {
    opportunity: "text-terra-green",
    warning: "text-warm-rose",
    trend: "text-gold",
    savings: "text-terra-green",
  };
  const bgMap: Record<string, string> = {
    opportunity: "bg-terra-green-dim border-terra-green/20",
    warning: "bg-warm-rose-dim border-warm-rose/20",
    trend: "bg-gold-dim border-gold/20",
    savings: "bg-terra-green-dim border-terra-green/20",
  };
  const Icon = iconMap[insight.type] || BarChart3;
  const color = colorMap[insight.type] || "text-gold";
  const bg = bgMap[insight.type] || "bg-gold-dim border-gold/20";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.35 }}
      className={`p-4 rounded-xl border ${bg}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
            <span className="text-[10px] font-mono text-muted-foreground">
              {insight.confidence}% {confLabel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 !bg-card border border-border shadow-lg">
        <p className="text-xs font-medium text-foreground mb-1">{label}</p>
        <p className="text-xs text-terra-green font-mono">
          {formatPrice(payload[0].value)}
        </p>
        {payload[1] && (
          <p className="text-xs text-gold font-mono">
            {payload[1].value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [propertyUrl, setPropertyUrl] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = trpc.dashboard.getData.useQuery();

  // Fetch submitted properties (for the map and recent list)
  const { data: submittedProps } = trpc.submittedProperties.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const submitProperty = trpc.submittedProperties.submit.useMutation({
    onSuccess: () => {
      setPropertyUrl("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    },
  });

  const metrics = dashboardData?.metrics ?? [];
  const priceHistory = dashboardData?.priceHistory ?? [];
  const aiInsights = dashboardData?.aiInsights ?? [];

  // Map properties from submitted properties — conform to Property interface
  const mapProperties = useMemo(() => {
    if (!submittedProps) return [];
    return submittedProps
      .filter((p) => p.lat && p.lng && p.status === "ready")
      .map((p) => ({
        id: String(p.id),
        address: p.address || p.title || "Unknown",
        city: p.city || "",
        state: "",
        zip: "",
        lat: p.lat!,
        lng: p.lng!,
        price: p.askingPrice || 0,
        beds: p.bedrooms || 0,
        baths: p.bathrooms || 0,
        sqft: p.area || 0,
        yearBuilt: p.yearBuilt || 0,
        daysOnMarket: p.daysOnMarket || 0,
        image: p.mainImage || "",
        aiScore: p.aiScore || 50,
        riskLevel: (p.aiScore && p.aiScore >= 70 ? "low" : p.aiScore && p.aiScore >= 50 ? "medium" : "high") as "low" | "medium" | "high",
        pricePerSqft: p.area && p.askingPrice ? Math.round(p.askingPrice / p.area) : 0,
        estimatedValue: p.suggestedOffer || p.askingPrice || 0,
        type: p.propertyType || "Unknown",
        status: "active" as const,
        description: p.originalDescription || "",
        commissionSavings: p.askingPrice && p.suggestedOffer ? p.askingPrice - p.suggestedOffer : 0,
      }));
  }, [submittedProps]);

  const recentProperties = submittedProps?.slice(0, 3) ?? [];

  const handleSubmit = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    try {
      new URL(propertyUrl);
      submitProperty.mutate({ sourceUrl: propertyUrl });
    } catch {
      // Invalid URL — do nothing, let the input validation handle it
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.dashboard.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-terra-green animate-pulse" />
            <span>{t.common.liveMarketData}</span>
          </div>
        </motion.div>

        {/* Property URL Submission Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 border-gold/20 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gold/8 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{t.submit.title}</h2>
                <p className="text-xs text-muted-foreground">{t.submit.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <div className="flex-1 relative">
                <input
                  type="url"
                  value={propertyUrl}
                  onChange={(e) => setPropertyUrl(e.target.value)}
                  placeholder={t.submit.placeholder}
                  className="w-full h-11 pl-4 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && propertyUrl && handleSubmit()}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!propertyUrl || submitProperty.isPending}
                className="h-11 px-6 rounded-xl bg-gold text-background font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold/90 transition-colors"
              >
                {submitProperty.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.submit.adding}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t.submit.button}
                  </>
                )}
              </motion.button>
            </div>
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3 text-terra-green"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">{t.submit.success}</span>
              </motion.div>
            )}
            <p className="text-[10px] text-muted-foreground mt-2">{t.submit.supportedPlatforms}</p>
          </div>
        </motion.div>

        {/* Recent Submitted Properties Quick View */}
        {recentProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-semibold text-foreground">{t.myProperties.title}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-dim text-gold font-medium">
                  {submittedProps?.length || 0}
                </span>
              </div>
              <Link href="/properties">
                <span className="text-xs text-gold flex items-center gap-1 hover:underline cursor-pointer">
                  {t.common.viewAll} <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProperties.map((prop, i) => (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <Link href={`/analysis/${prop.id}`}>
                    <div className="glass-card p-4 cursor-pointer group hover:border-gold/30 transition-all">
                      <div className="flex items-start gap-3">
                        {prop.mainImage ? (
                          <img
                            src={prop.mainImage}
                            alt={prop.title || ""}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <Home className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-gold transition-colors">
                            {prop.title || prop.address || "Property"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{prop.city}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-bold text-gold font-mono">
                              {prop.askingPrice ? formatPrice(prop.askingPrice) : "—"}
                            </span>
                            {prop.aiScore && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                prop.aiScore >= 80
                                  ? "bg-terra-green-dim text-terra-green"
                                  : prop.aiScore >= 60
                                  ? "bg-gold-dim text-gold"
                                  : "bg-warm-rose-dim text-warm-rose"
                              }`}>
                                AI {prop.aiScore}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {prop.status === "pending" && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {t.myProperties.pending}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((metric, i) => (
            <MetricCard key={metric.label} metric={metric} index={i} vsLabel={t.metrics.vsLastMonth} />
          ))}
        </div>

        {/* Property Map — Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-1 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-semibold text-foreground">{t.dashboard.algarveProperties}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-dim text-gold font-medium">
                {mapProperties.length} {t.common.active}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.dashboard.clickMarker}
            </p>
          </div>
          <PropertyMap
            className="h-[380px]"
            selectedPropertyId={selectedPropertyId}
            onPropertySelect={setSelectedPropertyId}
            properties={mapProperties}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Market Trend Chart (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{t.dashboard.marketTrend}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.dashboard.marketTrendSubtitle}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-terra-green" /> {t.dashboard.medianPrice}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold" /> {t.dashboard.listingsLabel}
                  </span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2a9d6e" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#2a9d6e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#DFB03A" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#DFB03A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#6b6b70" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="price"
                      tick={{ fontSize: 11, fill: "#6b6b70" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="listings"
                      orientation="right"
                      tick={{ fontSize: 11, fill: "#6b6b70" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      yAxisId="price"
                      type="monotone"
                      dataKey="median"
                      stroke="#2a9d6e"
                      strokeWidth={2}
                      fill="url(#greenGrad)"
                    />
                    <Area
                      yAxisId="listings"
                      type="monotone"
                      dataKey="listings"
                      stroke="#DFB03A"
                      strokeWidth={1.5}
                      fill="url(#goldGrad)"
                      strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar: AI Insights */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-semibold text-foreground">{t.dashboard.aiInsights}</h2>
              </div>
              <div className="space-y-3">
                {aiInsights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} index={i} confLabel={t.common.confidence} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
