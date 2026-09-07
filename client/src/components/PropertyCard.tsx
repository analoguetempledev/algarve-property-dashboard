// ============================================================
// DESIGN: Property card with warm elevated style
// Score ring: green=strong, gold=moderate, rose=caution
// ============================================================

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Bed, Bath, Maximize, Calendar, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Property, formatPrice, getScoreGlow, getRiskColor } from "@/lib/data";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const scoreGlow = getScoreGlow(property.aiScore);
  const riskColor = getRiskColor(property.riskLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link href={`/property/${property.id}`}>
        <div className={`glass-card overflow-hidden group cursor-pointer ${scoreGlow}`}>
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={property.image}
              alt={property.address}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${
                  property.status === "active"
                    ? "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                    : property.status === "pending"
                    ? "bg-amber-500/20 text-amber-100 border border-amber-400/30"
                    : "bg-white/20 text-white/70 border border-white/30"
                }`}
              >
                {property.status}
              </span>
            </div>

            {/* AI Score Ring */}
            <div className="absolute top-3 right-3">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="rgba(255,255,255,0.9)" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke={property.aiScore >= 80 ? "#2a9d6e" : property.aiScore >= 60 ? "#DFB03A" : "#c94040"}
                    strokeWidth="2.5"
                    strokeDasharray={`${(property.aiScore / 100) * 100.53} 100.53`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono text-foreground">
                  {property.aiScore}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="absolute bottom-3 left-3">
              <p className="text-xl font-bold text-white">{formatPrice(property.price)}</p>
              <p className="text-[11px] text-white/70 font-mono">€{property.pricePerSqft}/m²</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground text-sm leading-tight">{property.address}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {property.city}, {property.state} {property.zip}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" /> {property.beds}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" /> {property.baths}
              </span>
              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" /> {property.sqft} m²
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {property.daysOnMarket}d
              </span>
            </div>

            {/* AI Insights Strip */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-1.5">
                {property.riskLevel === "low" ? (
                  <CheckCircle className="w-3.5 h-3.5 text-terra-green" />
                ) : property.riskLevel === "medium" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-gold" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-warm-rose" />
                )}
                <span className={`text-[10px] font-medium uppercase tracking-wider ${riskColor}`}>
                  {property.riskLevel} risk
                </span>
              </div>
              <div className="flex items-center gap-1 text-terra-green">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-medium">
                  Save {formatPrice(property.commissionSavings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
