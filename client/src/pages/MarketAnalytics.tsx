// ============================================================
// DESIGN: Market analytics deep-dive
// Warm light theme, gold/green accents, Algarve market data
// i18n: Fully translated with useLanguage hook
// ============================================================

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  MapPin,
  Activity,
  Layers,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const NEIGHBORHOOD_DATA = [
  { name: "Lagos", median: 425000, growth: 3.2, inventory: 142 },
  { name: "Albufeira", median: 510000, growth: 4.1, inventory: 218 },
  { name: "Faro", median: 385000, growth: 2.8, inventory: 256 },
  { name: "Vilamoura", median: 680000, growth: 5.2, inventory: 95 },
  { name: "Tavira", median: 350000, growth: 3.8, inventory: 189 },
  { name: "Portimão", median: 395000, growth: 2.1, inventory: 212 },
];

const PROPERTY_TYPE_DATA = [
  { key: "villa", value: 38, color: "#2a9d6e" },
  { key: "apartment", value: 30, color: "#DFB03A" },
  { key: "townhouse", value: 20, color: "#8B6914" },
  { key: "land", value: 12, color: "#c94040" },
];

const DAYS_ON_MARKET_DATA = [
  { range: "0-7", count: 65 },
  { range: "8-14", count: 110 },
  { range: "15-30", count: 220 },
  { range: "31-60", count: 180 },
  { range: "60+", count: 95 },
];

const MONTHLY_SALES = [
  { month: "Aug", sales: 185, avgPrice: 398000 },
  { month: "Sep", sales: 210, avgPrice: 405000 },
  { month: "Oct", sales: 240, avgPrice: 412000 },
  { month: "Nov", sales: 195, avgPrice: 408000 },
  { month: "Dec", sales: 160, avgPrice: 415000 },
  { month: "Jan", sales: 220, avgPrice: 420000 },
  { month: "Feb", sales: 242, avgPrice: 425000 },
];

const WarmTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 shadow-lg">
        <p className="text-xs font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs font-mono" style={{ color: entry.color || entry.stroke }}>
            {entry.name}: {typeof entry.value === "number" && entry.value > 1000 ? formatPrice(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MarketAnalytics() {
  const { t } = useLanguage();

  const { data: metrics, isLoading: metricsLoading } = trpc.market.metrics.useQuery();
  const { data: priceHistory, isLoading: historyLoading } = trpc.market.priceHistory.useQuery();

  const MARKET_METRICS = metrics ?? [];
  const PRICE_HISTORY = priceHistory ?? [];

  if (metricsLoading || historyLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const typeLabels: Record<string, string> = {
    villa: t.analytics.villa,
    apartment: t.analytics.apartment,
    townhouse: t.analytics.townhouse,
    land: t.analytics.land,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">{t.analytics.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.analytics.subtitle}
          </p>
        </motion.div>

        {/* Top Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {MARKET_METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{metric.label}</p>
              <p className="text-lg font-bold text-foreground font-mono mt-1">{metric.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-terra-green" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-warm-rose" />
                )}
                <span className={`text-[10px] font-mono ${metric.trend === "up" ? "text-terra-green" : "text-warm-rose"}`}>
                  {metric.change > 0 ? "+" : ""}{metric.change}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Trend */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-terra-green" />
              <h2 className="text-sm font-semibold text-foreground">{t.analytics.priceTrend}</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PRICE_HISTORY}>
                  <defs>
                    <linearGradient id="priceFillGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2a9d6e" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#2a9d6e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b70" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b6b70" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<WarmTooltip />} />
                  <Area type="monotone" dataKey="median" stroke="#2a9d6e" strokeWidth={2} fill="url(#priceFillGreen)" name={t.analytics.medianPrice} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Monthly Sales Volume */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-semibold text-foreground">{t.analytics.salesVolume}</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_SALES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b70" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b6b70" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<WarmTooltip />} />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="rgba(223,176,58,0.35)" stroke="#DFB03A" strokeWidth={1} name={t.analytics.sales} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Days on Market Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-terra-green" />
              <h2 className="text-sm font-semibold text-foreground">{t.analytics.daysOnMarket}</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAYS_ON_MARKET_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#6b6b70" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b6b70" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<WarmTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="rgba(42,157,110,0.3)" stroke="#2a9d6e" strokeWidth={1} name={t.analytics.propertiesLabel} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Property Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-semibold text-foreground">{t.analytics.propertyTypes}</h2>
            </div>
            <div className="h-64 flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PROPERTY_TYPE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {PROPERTY_TYPE_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {PROPERTY_TYPE_DATA.map((type) => (
                  <div key={type.key} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: type.color }} />
                    <div className="flex-1">
                      <p className="text-xs text-foreground">{typeLabels[type.key] || type.key}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{type.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Neighborhood Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">{t.analytics.regionComparison}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{t.analytics.city}</th>
                  <th className="text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{t.analytics.medianPrice}</th>
                  <th className="text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{t.analytics.growth}</th>
                  <th className="text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{t.analytics.activeListings}</th>
                  <th className="text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{t.analytics.marketTemp}</th>
                </tr>
              </thead>
              <tbody>
                {NEIGHBORHOOD_DATA.map((hood) => (
                  <tr key={hood.name} className="border-b border-border/50 hover:bg-secondary transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm text-foreground font-medium">{hood.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-mono text-foreground">{formatPrice(hood.median)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-mono text-terra-green">+{hood.growth}%</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-mono text-muted-foreground">{hood.inventory}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        hood.growth > 4 ? "bg-warm-rose-dim text-warm-rose" : hood.growth > 3 ? "bg-gold-dim text-gold" : "bg-terra-green-dim text-terra-green"
                      }`}>
                        {hood.growth > 4 ? t.analytics.hot : hood.growth > 3 ? t.analytics.warm : t.analytics.balanced}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
