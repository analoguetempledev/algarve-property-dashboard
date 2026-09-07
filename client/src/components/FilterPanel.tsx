// ============================================================
// DESIGN: Property filter panel
// Warm light theme, gold accents, collapsible filter bar
// Now accepts properties as prop for database-driven data
// ============================================================

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface FilterState {
  priceMin: number;
  priceMax: number;
  beds: number | null; // null = any
  types: string[];
  aiScoreMin: number;
}

const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 2000000,
  beds: null,
  types: [],
  aiScoreMin: 0,
};

interface PropertyLike {
  price: number;
  beds: number;
  type: string;
  aiScore: number;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  properties?: PropertyLike[];
}

export function getDefaultFilters(): FilterState {
  return { ...DEFAULT_FILTERS };
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.priceMin > 0 || filters.priceMax < 2000000) count++;
  if (filters.beds !== null) count++;
  if (filters.types.length > 0) count++;
  if (filters.aiScoreMin > 0) count++;
  return count;
}

export function applyFilters<T extends PropertyLike>(properties: T[], filters: FilterState): T[] {
  return properties.filter((p) => {
    if (p.price < filters.priceMin || p.price > filters.priceMax) return false;
    if (filters.beds !== null && p.beds < filters.beds) return false;
    if (filters.types.length > 0 && !filters.types.includes(p.type)) return false;
    if (p.aiScore < filters.aiScoreMin) return false;
    return true;
  });
}

// Keep backward compat
export function filterProperties(filters: FilterState) {
  // This is now a no-op wrapper; use applyFilters with data from tRPC
  return [];
}

const BED_OPTIONS = [null, 2, 3, 4, 5, 6];

export default function FilterPanel({ filters, onFiltersChange, properties = [] }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  const activeCount = countActiveFilters(filters);

  const propertyTypes = useMemo(() => {
    return Array.from(new Set(properties.map((p) => p.type)));
  }, [properties]);

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    return `€${(val / 1000).toFixed(0)}k`;
  };

  const handleReset = () => {
    onFiltersChange(getDefaultFilters());
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Toggle Bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-gold" />
          <span className="text-sm font-semibold text-foreground">{t.filter.title}</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-gold text-background text-[10px] font-bold">
              {activeCount} {t.filter.activeFilters}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="text-[10px] text-muted-foreground hover:text-warm-rose transition-colors uppercase tracking-wider font-medium"
            >
              {t.filter.clearAll}
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Filter Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    {t.filter.priceRange}
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-foreground font-mono">
                      <span>{formatPrice(filters.priceMin)}</span>
                      <span>{formatPrice(filters.priceMax)}</span>
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="range"
                        min={0}
                        max={2000000}
                        step={25000}
                        value={filters.priceMin}
                        onChange={(e) => onFiltersChange({ ...filters, priceMin: Math.min(Number(e.target.value), filters.priceMax - 25000) })}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-gold bg-secondary"
                      />
                      <input
                        type="range"
                        min={0}
                        max={2000000}
                        step={25000}
                        value={filters.priceMax}
                        onChange={(e) => onFiltersChange({ ...filters, priceMax: Math.max(Number(e.target.value), filters.priceMin + 25000) })}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-gold bg-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    {t.filter.bedrooms}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {BED_OPTIONS.map((bed) => (
                      <button
                        key={bed ?? "any"}
                        onClick={() => onFiltersChange({ ...filters, beds: bed })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          filters.beds === bed
                            ? "bg-gold text-background shadow-sm"
                            : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-gold-dim"
                        }`}
                      >
                        {bed === null ? t.filter.bedsAny : `${bed}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    {t.filter.propertyType}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {propertyTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleTypeToggle(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          filters.types.includes(type)
                            ? "bg-gold text-background shadow-sm"
                            : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-gold-dim"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Score */}
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    {t.filter.aiScore}
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t.filter.minScore}:</span>
                      <span className="font-mono font-semibold text-foreground">{filters.aiScoreMin}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={filters.aiScoreMin}
                      onChange={(e) => onFiltersChange({ ...filters, aiScoreMin: Number(e.target.value) })}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-gold bg-secondary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
