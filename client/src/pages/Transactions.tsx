// ============================================================
// DESIGN: Transaction tracker
// Warm light theme, gold/green accents, EUR currency
// i18n: Fully translated with useLanguage hook
// ============================================================

import { motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Clock,
  Euro,
  FileText,
  Home,
  Calendar,
  ArrowRight,
  Shield,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function getStageIndex(stage: string, stageKeys: string[]): number {
  return stageKeys.indexOf(stage);
}

export default function Transactions() {
  const { t } = useLanguage();

  const { data: TRANSACTIONS = [], isLoading } = trpc.transactions.list.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const STAGES = [
    { key: "offer_submitted", label: t.transactions.offer, icon: FileText },
    { key: "under_contract", label: t.transactions.contract, icon: Shield },
    { key: "inspection", label: t.transactions.survey, icon: Home },
    { key: "appraisal", label: t.transactions.appraisal, icon: Euro },
    { key: "closing", label: t.transactions.closing, icon: Calendar },
    { key: "closed", label: t.transactions.closed, icon: CheckCircle },
  ];

  const stageKeys = STAGES.map((s) => s.key);

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
            <h1 className="text-2xl font-bold text-foreground">{t.transactions.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.transactions.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {TRANSACTIONS.length} {t.common.active}
            </span>
            <div className="w-2 h-2 rounded-full bg-terra-green animate-pulse" />
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4"
          >
            <p className="text-xs text-muted-foreground">{t.transactions.totalOfferValue}</p>
            <p className="text-2xl font-bold text-foreground font-mono mt-1">
              {formatPrice(TRANSACTIONS.reduce((sum, tx) => sum + tx.offerPrice, 0))}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <p className="text-xs text-muted-foreground">{t.transactions.estimatedSavings}</p>
            <p className="text-2xl font-bold text-terra-green font-mono mt-1">€30.250</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t.transactions.viaNegotiation}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-4"
          >
            <p className="text-xs text-muted-foreground">{t.transactions.nearestClosing}</p>
            <p className="text-2xl font-bold text-foreground font-mono mt-1">
              {Math.min(...TRANSACTIONS.map((tx) => tx.daysRemaining))} {t.common.days}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {TRANSACTIONS.reduce((nearest, tx) =>
                tx.daysRemaining < nearest.daysRemaining ? tx : nearest
              ).propertyAddress}
            </p>
          </motion.div>
        </div>

        {/* Transaction Cards */}
        <div className="space-y-6">
          {TRANSACTIONS.map((tx, i) => {
            const currentStageIdx = getStageIndex(tx.stage, stageKeys);

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="glass-card p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{tx.propertyAddress}</h3>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Euro className="w-3.5 h-3.5" /> {formatPrice(tx.offerPrice)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {tx.closingDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {tx.daysRemaining} {t.transactions.daysRemaining}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold-dim text-gold border border-gold/20">
                    {tx.stageLabel}
                  </span>
                </div>

                {/* Stage Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-border" />
                    <div
                      className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-gold to-gold/60 transition-all duration-500"
                      style={{ width: `${(currentStageIdx / (STAGES.length - 1)) * (100 - 10)}%` }}
                    />

                    {STAGES.map((stage, si) => {
                      const isPast = si < currentStageIdx;
                      const isCurrent = si === currentStageIdx;
                      const Icon = stage.icon;

                      return (
                        <div key={stage.key} className="flex flex-col items-center relative z-10">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + si * 0.08 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isPast
                                ? "bg-terra-green-dim border-2 border-terra-green text-terra-green"
                                : isCurrent
                                ? "bg-gold text-background border-2 border-gold shadow-md"
                                : "bg-secondary border border-border text-muted-foreground"
                            }`}
                          >
                            {isPast ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Icon className="w-3.5 h-3.5" />
                            )}
                          </motion.div>
                          <span
                            className={`text-[10px] mt-2 font-medium ${
                              isCurrent ? "text-gold" : isPast ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{t.transactions.overallProgress}</span>
                    <span className="text-xs font-mono text-gold">{tx.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tx.progress}%` }}
                      transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold"
                    />
                  </div>
                </div>

                {/* Task Checklist */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    {t.transactions.taskChecklist}
                  </h4>
                  <div className="space-y-2">
                    {tx.tasks.map((task, ti) => (
                      <motion.div
                        key={ti}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + ti * 0.05 }}
                        className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                          task.completed ? "bg-terra-green-dim" : "hover:bg-secondary"
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle className="w-4 h-4 text-terra-green flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            task.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-gold-dim flex items-center justify-center mx-auto mb-3">
            <Home className="w-6 h-6 text-gold" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {t.transactions.readyForOffer}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t.transactions.readyForOfferDesc}
          </p>
          <Link href="/">
            <Button variant="outline" size="sm" className="mt-4 border-gold/30 text-gold hover:bg-gold-dim">
              {t.common.browseProperties} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
