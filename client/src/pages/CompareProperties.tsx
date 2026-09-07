// ============================================================
// Compare Properties — Side-by-side comparison with key stats
// ============================================================

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  GitCompare,
  Loader2,
  Home,
  CheckCircle2,
  Circle,
  ArrowRight,
  Trophy,
  Sparkles,
  Target,
  Flame,
} from "lucide-react";
import { Link, useSearch } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

function StatRow({
  label,
  values,
  bestIndex,
  format = "text",
}: {
  label: string;
  values: (string | number | null)[];
  bestIndex?: number;
  format?: "text" | "price" | "number" | "score";
}) {
  const formatValue = (v: string | number | null) => {
    if (v == null || v === "") return "—";
    if (format === "price") return formatPrice(Number(v));
    if (format === "number") return String(v);
    if (format === "score") return String(v);
    return String(v);
  };

  return (
    <div className="grid gap-4 py-3 border-b border-border last:border-0" style={{
      gridTemplateColumns: `160px repeat(${values.length}, 1fr)`,
    }}>
      <div className="text-xs text-muted-foreground font-medium flex items-center">
        {label}
      </div>
      {values.map((v, i) => (
        <div
          key={i}
          className={`text-sm font-mono text-center ${
            bestIndex === i ? "text-terra-green font-bold" : "text-foreground"
          }`}
        >
          {bestIndex === i && <Trophy className="w-3 h-3 text-terra-green inline mr-1" />}
          {formatValue(v)}
        </div>
      ))}
    </div>
  );
}

export default function CompareProperties() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const idsParam = params.get("ids");

  const selectedIds = useMemo(() => {
    if (!idsParam) return [];
    return idsParam.split(",").map(Number).filter(Boolean);
  }, [idsParam]);

  // Fetch all properties for selection
  const { data: allProperties, isLoading: loadingAll } = trpc.submittedProperties.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch comparison data
  const { data: compareData, isLoading: loadingCompare } = trpc.submittedProperties.compare.useQuery(
    { ids: selectedIds },
    { enabled: selectedIds.length >= 2 && isAuthenticated }
  );

  const [localSelectedIds, setLocalSelectedIds] = useState<Set<number>>(new Set(selectedIds));

  const toggleSelect = (id: number) => {
    setLocalSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  };

  const properties = compareData ?? [];
  const isLoading = loadingAll || loadingCompare;

  // Determine "best" for each stat
  const bestPrice = properties.length > 0
    ? properties.reduce((best, p, i) => (p.askingPrice && (!properties[best].askingPrice || p.askingPrice < properties[best].askingPrice!)) ? i : best, 0)
    : undefined;
  const bestPriceSqm = properties.length > 0
    ? properties.reduce((best, p, i) => {
        const pSqm = p.askingPrice && p.area ? p.askingPrice / p.area : Infinity;
        const bSqm = properties[best].askingPrice && properties[best].area ? properties[best].askingPrice! / properties[best].area! : Infinity;
        return pSqm < bSqm ? i : best;
      }, 0)
    : undefined;
  const bestBargaining = properties.length > 0
    ? properties.reduce((best, p, i) => (p.bargainingPower && (!properties[best].bargainingPower || p.bargainingPower > properties[best].bargainingPower!)) ? i : best, 0)
    : undefined;
  const bestAiScore = properties.length > 0
    ? properties.reduce((best, p, i) => (p.aiScore && (!properties[best].aiScore || p.aiScore > properties[best].aiScore!)) ? i : best, 0)
    : undefined;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // If no IDs selected, show selection UI
  if (selectedIds.length < 2) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-foreground">{t.compare.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.compare.subtitle}</p>
          </motion.div>

          {!allProperties || allProperties.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <GitCompare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground">{t.compare.noProperties}</p>
              <p className="text-sm text-muted-foreground mt-2">{t.compare.noPropertiesDesc}</p>
            </div>
          ) : (
            <>
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-1">{t.compare.selectProperties}</h2>
                <p className="text-xs text-muted-foreground mb-4">{t.compare.selectDesc}</p>

                <div className="space-y-3">
                  {allProperties.filter(p => p.status === "ready").map((prop) => {
                    const isSelected = localSelectedIds.has(prop.id);
                    return (
                      <div
                        key={prop.id}
                        onClick={() => toggleSelect(prop.id)}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected ? "bg-gold/[0.06] border border-gold/30" : "bg-secondary border border-transparent hover:border-gold/15"
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                        )}
                        {prop.mainImage ? (
                          <img src={prop.mainImage} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                            <Home className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {prop.title || prop.address || "Property"}
                          </p>
                          <p className="text-xs text-muted-foreground">{prop.city}</p>
                        </div>
                        <span className="text-sm font-bold text-gold font-mono">
                          {prop.askingPrice ? formatPrice(prop.askingPrice) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {localSelectedIds.size >= 2 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Link href={`/compare?ids=${Array.from(localSelectedIds).join(",")}`}>
                    <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-background font-medium text-sm hover:bg-gold/90 transition-colors cursor-pointer">
                      <GitCompare className="w-4 h-4" />
                      {t.compare.comparing} {localSelectedIds.size} {t.compare.properties}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Comparison view
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">{t.compare.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.compare.comparing} {properties.length} {t.compare.properties}
          </p>
        </motion.div>

        {/* Property Headers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
          style={{ gridTemplateColumns: `160px repeat(${properties.length}, 1fr)` }}
        >
          <div /> {/* Label column spacer */}
          {properties.map((prop) => (
            <div key={prop.id} className="glass-card p-4 text-center">
              {prop.mainImage ? (
                <img
                  src={prop.mainImage}
                  alt={prop.title || ""}
                  className="w-full h-32 rounded-lg object-cover mb-3"
                />
              ) : (
                <div className="w-full h-32 rounded-lg bg-secondary flex items-center justify-center mb-3">
                  <Home className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
              <Link href={`/analysis/${prop.id}`}>
                <span className="text-sm font-semibold text-foreground hover:text-gold transition-colors cursor-pointer line-clamp-2">
                  {prop.title || prop.address || "Property"}
                </span>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">{prop.city}</p>
              {prop.aiScore && (
                <span className={`inline-block mt-2 text-xs font-bold font-mono px-2 py-0.5 rounded ${
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
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-gold" />
            {t.compare.keyStats}
          </h2>

          <StatRow
            label={t.compare.price}
            values={properties.map((p) => p.askingPrice)}
            bestIndex={bestPrice}
            format="price"
          />
          <StatRow
            label={t.compare.area}
            values={properties.map((p) => p.area ? `${p.area} m²` : null)}
          />
          <StatRow
            label={t.compare.pricePerSqm}
            values={properties.map((p) => p.askingPrice && p.area ? Math.round(p.askingPrice / p.area) : null)}
            bestIndex={bestPriceSqm}
            format="price"
          />
          <StatRow
            label={t.compare.bedrooms}
            values={properties.map((p) => p.bedrooms)}
            format="number"
          />
          <StatRow
            label={t.compare.bathrooms}
            values={properties.map((p) => p.bathrooms)}
            format="number"
          />
          <StatRow
            label={t.compare.daysOnMarket}
            values={properties.map((p) => p.daysOnMarket)}
            format="number"
          />
          <StatRow
            label={t.compare.priceReductions}
            values={properties.map((p) => p.priceReductions)}
            format="number"
          />
          <StatRow
            label={t.compare.aiScore}
            values={properties.map((p) => p.aiScore)}
            bestIndex={bestAiScore}
            format="score"
          />
          <StatRow
            label={t.compare.bargainingPower}
            values={properties.map((p) => p.bargainingPower ? `${p.bargainingPower}/100` : null)}
            bestIndex={bestBargaining}
          />
          <StatRow
            label={t.compare.suggestedOffer}
            values={properties.map((p) => p.suggestedOffer)}
            format="price"
          />
          <StatRow
            label={t.compare.energyCertificate}
            values={properties.map((p) => p.energyCertificate)}
          />
          <StatRow
            label={t.compare.condition}
            values={properties.map((p) => p.condition)}
          />
          <StatRow
            label={t.compare.yearBuilt}
            values={properties.map((p) => p.yearBuilt)}
            format="number"
          />
        </motion.div>

        {/* Best Value / Best Negotiation highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPriceSqm !== undefined && properties[bestPriceSqm] && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5 border-terra-green/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-terra-green" />
                <h3 className="text-sm font-semibold text-terra-green">{t.compare.bestValue}</h3>
              </div>
              <p className="text-base font-medium text-foreground">
                {properties[bestPriceSqm].title || properties[bestPriceSqm].address}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {properties[bestPriceSqm].askingPrice && properties[bestPriceSqm].area
                  ? `${formatPrice(Math.round(properties[bestPriceSqm].askingPrice! / properties[bestPriceSqm].area!))} / m²`
                  : "—"
                }
              </p>
            </motion.div>
          )}
          {bestBargaining !== undefined && properties[bestBargaining] && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-5 border-gold/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-gold" />
                <h3 className="text-sm font-semibold text-gold">{t.compare.bestNegotiation}</h3>
              </div>
              <p className="text-base font-medium text-foreground">
                {properties[bestBargaining].title || properties[bestBargaining].address}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.compare.bargainingPower}: {properties[bestBargaining].bargainingPower}/100
              </p>
            </motion.div>
          )}
        </div>

        {/* Back to selection */}
        <Link href="/compare">
          <span className="text-xs text-gold flex items-center gap-1 hover:underline cursor-pointer">
            {t.compare.selectProperties} <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </DashboardLayout>
  );
}
