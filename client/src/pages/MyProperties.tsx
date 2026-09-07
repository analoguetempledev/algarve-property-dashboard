// ============================================================
// My Properties — Portfolio list with compare selection
// ============================================================

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Loader2,
  Trash2,
  ExternalLink,
  ArrowRight,
  GitCompare,
  Clock,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Circle,
  Link2,
  Plus,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

export default function MyProperties() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [propertyUrl, setPropertyUrl] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: properties, isLoading } = trpc.submittedProperties.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const utils = trpc.useUtils();

  const deleteProperty = trpc.submittedProperties.delete.useMutation({
    onSuccess: () => {
      utils.submittedProperties.list.invalidate();
    },
  });

  const submitProperty = trpc.submittedProperties.submit.useMutation({
    onSuccess: () => {
      setPropertyUrl("");
      setSubmitSuccess(true);
      utils.submittedProperties.list.invalidate();
      setTimeout(() => setSubmitSuccess(false), 3000);
    },
  });

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCompare = () => {
    if (selectedIds.size >= 2) {
      navigate(`/compare?ids=${Array.from(selectedIds).join(",")}`);
    }
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    try {
      new URL(propertyUrl);
      submitProperty.mutate({ sourceUrl: propertyUrl });
    } catch {
      // Invalid URL
    }
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(t.myProperties.deleteConfirm)) {
      deleteProperty.mutate({ id });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.myProperties.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.myProperties.subtitle}</p>
          </div>
          {selectedIds.size >= 2 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button
                onClick={handleCompare}
                className="bg-gold hover:bg-gold/90 text-background gap-2"
              >
                <GitCompare className="w-4 h-4" />
                {t.myProperties.compareSelected} ({selectedIds.size})
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Add Property Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 border-gold/20"
        >
          <div className="flex gap-3">
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
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {t.submit.button}
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
        </motion.div>

        {/* Properties List */}
        {!properties || properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-16 text-center"
          >
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">{t.myProperties.empty}</p>
            <p className="text-sm text-muted-foreground mt-2">{t.myProperties.emptyDesc}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Selection hint */}
            <p className="text-xs text-muted-foreground">
              {t.myProperties.selectToCompare} (2-4) &middot; {selectedIds.size} {t.myProperties.selected}
            </p>

            {properties.map((prop, i) => {
              const isSelected = selectedIds.has(prop.id);
              const savings = prop.askingPrice && prop.suggestedOffer
                ? prop.askingPrice - prop.suggestedOffer
                : 0;
              const savingsPercent = prop.askingPrice && savings
                ? ((savings / prop.askingPrice) * 100).toFixed(1)
                : "0";

              return (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className={`glass-card p-5 cursor-pointer transition-all group ${
                      isSelected ? "border-gold/40 bg-gold/[0.03]" : "hover:border-gold/20"
                    }`}
                    onClick={() => toggleSelect(prop.id)}
                  >
                    <div className="flex gap-4">
                      {/* Select checkbox */}
                      <div className="flex items-start pt-1">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-gold" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/40 group-hover:text-muted-foreground/60" />
                        )}
                      </div>

                      {/* Image */}
                      {prop.mainImage ? (
                        <img
                          src={prop.mainImage}
                          alt={prop.title || ""}
                          className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                          <Home className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-foreground truncate max-w-md">
                              {prop.title || prop.address || "Property"}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {prop.city}{prop.address ? ` — ${prop.address}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {prop.status === "ready" ? (
                              <span className="text-[10px] px-2 py-1 rounded-full bg-terra-green-dim text-terra-green font-medium">
                                {t.myProperties.ready}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-1 rounded-full bg-gold-dim text-gold font-medium flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {t.myProperties.pending}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-6 mt-3">
                          <div>
                            <p className="text-lg font-bold text-gold font-mono">
                              {prop.askingPrice ? formatPrice(prop.askingPrice) : "—"}
                            </p>
                            {prop.originalPrice && prop.originalPrice > (prop.askingPrice || 0) && (
                              <p className="text-xs text-muted-foreground line-through font-mono">
                                {formatPrice(prop.originalPrice)}
                              </p>
                            )}
                          </div>

                          {prop.bedrooms && (
                            <div className="text-center">
                              <p className="text-sm font-semibold text-foreground">{prop.bedrooms}</p>
                              <p className="text-[10px] text-muted-foreground">{t.property.bedrooms}</p>
                            </div>
                          )}
                          {prop.bathrooms && (
                            <div className="text-center">
                              <p className="text-sm font-semibold text-foreground">{prop.bathrooms}</p>
                              <p className="text-[10px] text-muted-foreground">{t.property.bathrooms}</p>
                            </div>
                          )}
                          {prop.area && (
                            <div className="text-center">
                              <p className="text-sm font-semibold text-foreground">{prop.area} m²</p>
                              <p className="text-[10px] text-muted-foreground">{t.property.area}</p>
                            </div>
                          )}

                          {prop.daysOnMarket != null && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {prop.daysOnMarket} {t.myProperties.daysOnMarket}
                            </div>
                          )}
                          {prop.priceReductions != null && prop.priceReductions > 0 && (
                            <div className="flex items-center gap-1 text-xs text-warm-rose">
                              <TrendingDown className="w-3 h-3" />
                              {prop.priceReductions} {t.myProperties.priceReductions}
                            </div>
                          )}
                        </div>

                        {/* Bottom row: AI Score + Bargaining + Actions */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-4">
                            {prop.aiScore && (
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-gold" />
                                <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                                  prop.aiScore >= 80
                                    ? "bg-terra-green-dim text-terra-green"
                                    : prop.aiScore >= 60
                                    ? "bg-gold-dim text-gold"
                                    : "bg-warm-rose-dim text-warm-rose"
                                }`}>
                                  AI {prop.aiScore}
                                </span>
                              </div>
                            )}
                            {prop.bargainingPower && (
                              <div className="text-xs text-muted-foreground">
                                {t.myProperties.bargainingPower}:{" "}
                                <span className="font-semibold text-foreground">{prop.bargainingPower}/100</span>
                              </div>
                            )}
                            {savings > 0 && (
                              <div className="text-xs text-terra-green font-medium">
                                {t.myProperties.suggestedOffer}: {formatPrice(prop.suggestedOffer!)} (-{savingsPercent}%)
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/analysis/${prop.id}`}>
                              <span
                                className="text-xs text-gold flex items-center gap-1 hover:underline cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {t.myProperties.viewAnalysis} <ArrowRight className="w-3 h-3" />
                              </span>
                            </Link>
                            {prop.sourceUrl && (
                              <a
                                href={prop.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={(e) => handleDelete(prop.id, e)}
                              className="text-muted-foreground hover:text-warm-rose transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
