// ============================================================
// DESIGN: Buyer's Agent Savings Calculator
// Commission is based on the savings achieved
// Gold/green accents, warm light theme, i18n support
// ============================================================

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  TrendingDown,
  Brain,
  Target,
  Shield,
  ArrowRight,
  Sparkles,
  BarChart3,
  Percent,
  PiggyBank,
  Search,
  Handshake,
  FileCheck,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/data";
import { SAVINGS_COMMISSION_RATE } from "@shared/const";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

// Default negotiation savings percentage (adjustable by user)
const DEFAULT_SAVINGS_PCT = 10;

export default function SavingsCalculator() {
  const [askingPrice, setAskingPrice] = useState(500000);
  const [savingsPct, setSavingsPct] = useState(DEFAULT_SAVINGS_PCT);
  const { t } = useLanguage();

  const calculations = useMemo(() => {
    const totalSavings = askingPrice * (savingsPct / 100);
    const negotiatedPrice = askingPrice - totalSavings;
    const agentFee = totalSavings * SAVINGS_COMMISSION_RATE;
    const netSavings = totalSavings - agentFee;
    const effectivePrice = negotiatedPrice + agentFee;
    const effectiveSavingsPct = ((askingPrice - effectivePrice) / askingPrice * 100);
    return {
      totalSavings,
      negotiatedPrice,
      agentFee,
      netSavings,
      effectivePrice,
      effectiveSavingsPct,
    };
  }, [askingPrice, savingsPct]);

  // Comparison data: savings at different asking prices
  const comparisonData = useMemo(() => {
    const prices = [250000, 400000, 600000, 800000, 1000000, 1500000];
    return prices.map((price) => {
      const totalSav = price * (savingsPct / 100);
      const fee = totalSav * SAVINGS_COMMISSION_RATE;
      return {
        price: price >= 1000000 ? `€${(price / 1000000).toFixed(1)}M` : `€${(price / 1000).toFixed(0)}k`,
        withoutTC: price,
        withTC: price - totalSav + fee,
        netSavings: totalSav - fee,
      };
    });
  }, [savingsPct]);

  // Savings range chart (5% to 15%)
  const savingsRangeData = useMemo(() => {
    const points = [];
    for (let pct = 5; pct <= 15; pct += 1) {
      const totalSav = askingPrice * (pct / 100);
      const fee = totalSav * SAVINGS_COMMISSION_RATE;
      points.push({
        pct: `${pct}%`,
        netSavings: totalSav - fee,
        agentFee: fee,
      });
    }
    return points;
  }, [askingPrice]);

  const steps = [
    {
      icon: Search,
      title: t.calculator.step1Title,
      desc: t.calculator.step1Desc,
      color: "text-gold",
      bg: "bg-gold-dim",
    },
    {
      icon: Brain,
      title: t.calculator.step2Title,
      desc: t.calculator.step2Desc,
      color: "text-terra-green",
      bg: "bg-terra-green-dim",
    },
    {
      icon: Handshake,
      title: t.calculator.step3Title,
      desc: t.calculator.step3Desc,
      color: "text-gold",
      bg: "bg-gold-dim",
    },
    {
      icon: FileCheck,
      title: t.calculator.step4Title,
      desc: t.calculator.step4Desc,
      color: "text-terra-green",
      bg: "bg-terra-green-dim",
    },
  ];

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 !bg-card border border-border shadow-lg">
          <p className="text-xs font-medium text-foreground mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-xs font-mono" style={{ color: p.color }}>
              {p.name}: {formatPrice(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-dim border border-gold/20 mb-4">
            <Calculator className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs font-medium text-gold">{t.nav.calculator}</span>
          </div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t.calculator.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            {t.calculator.subtitle}
          </p>
        </motion.div>

        {/* Input Controls */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-6"
        >
          {/* Asking Price */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">
              {t.calculator.askingPrice}
            </label>
            <p className="text-xs text-muted-foreground mb-3">{t.calculator.enterAskingPrice}</p>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-foreground font-mono">
                {formatPrice(askingPrice)}
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={3000000}
              step={25000}
              value={askingPrice}
              onChange={(e) => setAskingPrice(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-gold bg-secondary mt-4"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
              <span>€100k</span>
              <span>€500k</span>
              <span>€1M</span>
              <span>€2M</span>
              <span>€3M</span>
            </div>
          </div>

          {/* Negotiation Savings % */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {t.calculator.negotiationSavings}
              </label>
              <span className="text-sm font-bold text-gold font-mono">{savingsPct}%</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{t.calculator.savingsRange}</p>
            <input
              type="range"
              min={3}
              max={20}
              step={1}
              value={savingsPct}
              onChange={(e) => setSavingsPct(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-gold bg-secondary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
              <span>3%</span>
              <span>10%</span>
              <span>15%</span>
              <span>20%</span>
            </div>
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-terra-green-dim/50 border border-terra-green/10">
              <BarChart3 className="w-3.5 h-3.5 text-terra-green flex-shrink-0" />
              <span className="text-[11px] text-terra-green font-medium">
                {t.calculator.avgSavingsNote}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Results Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-semibold text-foreground">{t.calculator.priceBreakdown}</h3>
            </div>

            {/* Asking Price */}
            <div className="flex items-center justify-between py-2 border-b border-dashed border-border">
              <span className="text-xs text-muted-foreground">{t.calculator.sellerAskingPrice}</span>
              <span className="text-sm font-mono font-semibold text-foreground">{formatPrice(askingPrice)}</span>
            </div>

            {/* Negotiated Savings */}
            <div className="flex items-center justify-between py-2 border-b border-dashed border-border">
              <span className="text-xs text-terra-green font-medium">{t.calculator.negotiatedReduction}</span>
              <span className="text-sm font-mono font-semibold text-terra-green">
                − {formatPrice(calculations.totalSavings)}
              </span>
            </div>

            {/* Negotiated Price */}
            <div className="flex items-center justify-between py-2 border-b border-dashed border-border">
              <span className="text-xs text-muted-foreground">{t.calculator.negotiatedPrice}</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                {formatPrice(calculations.negotiatedPrice)}
              </span>
            </div>

            {/* Agent fee */}
            <div className="flex items-center justify-between py-2 border-b border-dashed border-border">
              <div>
                <span className="text-xs text-muted-foreground">{t.calculator.serviceFee}</span>
                <span className="text-[10px] text-muted-foreground ml-1">
                  ({Math.round(SAVINGS_COMMISSION_RATE * 100)}% {t.calculator.ofSavings})
                </span>
              </div>
              <span className="text-sm font-mono font-semibold text-foreground">
                + {formatPrice(calculations.agentFee)}
              </span>
            </div>

            {/* Effective Price */}
            <div className="flex items-center justify-between py-3 bg-gold-dim/50 rounded-lg px-3 -mx-1">
              <span className="text-xs font-semibold text-foreground">{t.calculator.effectivePrice}</span>
              <span className="text-lg font-mono font-bold text-foreground">
                {formatPrice(calculations.effectivePrice)}
              </span>
            </div>
          </motion.div>

          {/* Your Savings Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold/8 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-semibold text-foreground">{t.calculator.yourSavings}</h3>
              </div>

              {/* Net Savings - Hero Number */}
              <div className="text-center py-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {t.calculator.youKeep}
                </p>
                <p className="text-4xl font-bold text-gold font-mono">
                  {formatPrice(calculations.netSavings)}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2 text-terra-green">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    {calculations.effectiveSavingsPct.toFixed(1)}% {t.calculator.belowAsking}
                  </span>
                </div>
              </div>

              {/* Savings Visual Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.calculator.totalNegotiated}</span>
                  <span className="font-mono font-medium text-foreground">{formatPrice(calculations.totalSavings)}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-secondary overflow-hidden flex">
                  <div
                    className="h-full bg-gold rounded-l-full transition-all duration-500"
                    style={{ width: `${(1 - SAVINGS_COMMISSION_RATE) * 100}%` }}
                  />
                  <div
                    className="h-full bg-gold/30 rounded-r-full transition-all duration-500"
                    style={{ width: `${SAVINGS_COMMISSION_RATE * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    <span className="text-muted-foreground">{t.calculator.youKeep}: {formatPrice(calculations.netSavings)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gold/30" />
                    <span className="text-muted-foreground">{t.calculator.serviceFeeShort}: {formatPrice(calculations.agentFee)}</span>
                  </div>
                </div>
              </div>

              {/* Key Message */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-terra-green-dim/50 border border-terra-green/10">
                <PiggyBank className="w-4 h-4 text-terra-green flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-terra-green leading-relaxed font-medium">
                  {t.calculator.keyMessage}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2
            className="text-xl font-bold text-foreground mb-6 text-center"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t.calculator.howItWorks}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="glass-card p-5"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground font-mono">0{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Savings Range Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-1">{t.calculator.savingsChartTitle}</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {t.calculator.savingsChartDesc} {formatPrice(askingPrice)}
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsRangeData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c8a55a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c8a55a" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a9d6e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2a9d6e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="pct"
                  tick={{ fontSize: 11, fill: "#6b6b70" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b6b70" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="netSavings"
                  name={t.calculator.yourNetSavings}
                  stroke="#c8a55a"
                  fill="url(#goldGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="agentFee"
                  name={t.calculator.serviceFeeShort}
                  stroke="#2a9d6e"
                  fill="url(#greenGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Effective Price Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-1">{t.calculator.comparisonTitle}</h2>
          <p className="text-xs text-muted-foreground mb-4">{t.calculator.comparisonDesc}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="price"
                  tick={{ fontSize: 11, fill: "#6b6b70" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b6b70" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? `€${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="withoutTC"
                  name={t.calculator.withoutAgent}
                  fill="#c94040"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  opacity={0.7}
                />
                <Bar
                  dataKey="withTC"
                  name={t.calculator.withAgent}
                  fill="#2a9d6e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Disclaimer + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center pb-8 space-y-4"
        >
          <p className="text-[11px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {t.calculator.disclaimer}
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-background font-medium text-sm hover:bg-gold/90 transition-all shadow-md hover:shadow-lg">
            {t.common.browseProperties}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
