// ============================================================
// AnalysisLoadingIndicator — Animated step-by-step progress
// for pending property analysis (fetching → analyzing → generating)
// ============================================================

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  Brain,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface AnalysisStep {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  durationMs: number;
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: "fetching",
    icon: Globe,
    label: "Fetching Listing Data",
    description: "Extracting property details, photos, and pricing from the listing...",
    durationMs: 3000,
  },
  {
    id: "market",
    icon: Search,
    label: "Market Research",
    description: "Analyzing comparable properties, price history, and market trends...",
    durationMs: 4000,
  },
  {
    id: "ai",
    icon: Brain,
    label: "AI Analysis",
    description: "Evaluating investment potential, risks, and neighborhood insights...",
    durationMs: 5000,
  },
  {
    id: "report",
    icon: Sparkles,
    label: "Generating Report",
    description: "Creating your personalized property analysis with recommendations...",
    durationMs: 3000,
  },
];

type IndicatorSize = "compact" | "full";

interface AnalysisLoadingIndicatorProps {
  size?: IndicatorSize;
  status?: "pending" | "analyzing";
}

export default function AnalysisLoadingIndicator({
  size = "full",
  status = "analyzing",
}: AnalysisLoadingIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length) return;

    const step = ANALYSIS_STEPS[currentStep];
    const interval = 50;
    const increments = step.durationMs / interval;
    let count = 0;

    const timer = setInterval(() => {
      count++;
      setStepProgress(Math.min((count / increments) * 100, 100));

      if (count >= increments) {
        clearInterval(timer);
        // Move to next step after a brief pause
        setTimeout(() => {
          if (currentStep < ANALYSIS_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
            setStepProgress(0);
          }
        }, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentStep]);

  const overallProgress = Math.min(
    ((currentStep + stepProgress / 100) / ANALYSIS_STEPS.length) * 100,
    99
  );

  if (size === "compact") {
    return <CompactIndicator currentStep={currentStep} overallProgress={overallProgress} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-4"
        >
          <Loader2 className="w-4 h-4 text-gold animate-spin" />
          <span className="text-sm font-medium text-gold">
            {status === "pending" ? "Queued for Analysis" : "Analyzing Property"}
          </span>
        </motion.div>
        <h2 className="text-lg font-semibold text-foreground">
          Your property is being analyzed
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This usually takes 30-60 seconds. You can leave and come back.
        </p>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Overall Progress</span>
          <span className="text-xs font-mono text-gold font-medium">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step-by-step Progress */}
      <div className="w-full max-w-lg mx-auto space-y-3">
        {ANALYSIS_STEPS.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? "bg-gold/5 border-gold/25 shadow-sm"
                  : isComplete
                  ? "bg-terra-green/5 border-terra-green/15"
                  : "bg-secondary/50 border-border opacity-50"
              }`}
            >
              {/* Step Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActive
                    ? "bg-gold/15 text-gold"
                    : isComplete
                    ? "bg-terra-green/15 text-terra-green"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      key="active"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Icon key="pending" className="w-5 h-5" />
                  )}
                </AnimatePresence>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-gold"
                        : isComplete
                        ? "text-terra-green"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="text-[10px] font-mono text-gold/70">
                      {Math.round(stepProgress)}%
                    </span>
                  )}
                  {isComplete && (
                    <span className="text-[10px] font-medium text-terra-green">Done</span>
                  )}
                </div>
                {(isActive || isComplete) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-muted-foreground mt-1"
                  >
                    {step.description}
                  </motion.p>
                )}
                {isActive && (
                  <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gold/60"
                      animate={{ width: `${stepProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Compact variant for property cards ─────────────────── */
function CompactIndicator({
  currentStep,
  overallProgress,
}: {
  currentStep: number;
  overallProgress: number;
}) {
  const step = ANALYSIS_STEPS[Math.min(currentStep, ANALYSIS_STEPS.length - 1)];
  const Icon = step.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Icon className="w-4 h-4 text-gold" />
        </motion.div>
        <span className="text-xs font-medium text-gold">{step.label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold/70 to-gold"
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{step.description.slice(0, 40)}...</span>
        <span className="text-[10px] font-mono text-gold">{Math.round(overallProgress)}%</span>
      </div>
    </div>
  );
}
