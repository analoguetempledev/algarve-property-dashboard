// ============================================================
// My Offers — List of all buying processes
// ============================================================

import { motion } from "framer-motion";
import {
  FileText,
  Loader2,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  XCircle,
  Home,
  Trash2,
  Target,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const STEP_LABELS: Record<string, string> = {
  analysis: "Analysis Review",
  negotiation: "Negotiation Strategy",
  due_diligence: "Due Diligence",
  make_offer: "Make Offer",
  completion: "CPCV & Escritura",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "In Progress", color: "bg-gold-dim text-gold", icon: Clock },
  offer_sent: { label: "Offer Sent", color: "bg-gold-dim text-gold", icon: Send },
  accepted: { label: "Accepted", color: "bg-terra-green-dim text-terra-green", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-warm-rose-dim text-warm-rose", icon: XCircle },
  withdrawn: { label: "Withdrawn", color: "bg-secondary text-muted-foreground", icon: XCircle },
  completed: { label: "Completed", color: "bg-terra-green-dim text-terra-green", icon: CheckCircle2 },
};

export default function MyOffers() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: offers, isLoading } = trpc.offers.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const deleteOffer = trpc.offers.delete.useMutation({
    onSuccess: () => {
      utils.offers.list.invalidate();
    },
  });

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this offer? This action cannot be undone.")) {
      deleteOffer.mutate({ id });
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
        >
          <h1 className="text-2xl font-bold text-foreground">My Offers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your property buying processes from analysis to completion
          </p>
        </motion.div>

        {/* Offers List */}
        {!offers || offers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-16 text-center"
          >
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">No offers yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start a buying process from any analyzed property
            </p>
            <Link href="/properties">
              <span className="inline-flex items-center gap-2 mt-4 text-sm text-gold hover:underline cursor-pointer">
                <Home className="w-4 h-4" />
                Browse My Properties
              </span>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer: any, i: number) => {
              const statusConfig = STATUS_CONFIG[offer.status] || STATUS_CONFIG.active;
              const StatusIcon = statusConfig.icon;
              const stepLabel = STEP_LABELS[offer.currentStep] || offer.currentStep;

              // Calculate progress
              const steps = ["analysis", "negotiation", "due_diligence", "make_offer", "completion"];
              const currentIndex = steps.indexOf(offer.currentStep);
              const progress = Math.round(((currentIndex) / steps.length) * 100);

              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/offers/${offer.id}`}>
                    <div className="glass-card p-5 cursor-pointer hover:border-gold/20 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold text-foreground truncate max-w-md group-hover:text-gold transition-colors">
                              Property #{offer.propertyId}
                            </h3>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            {offer.offerPrice && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Your Offer</p>
                                <p className="text-sm font-bold text-gold font-mono">{formatPrice(offer.offerPrice)}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Step</p>
                              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                                <Target className="w-3 h-3 text-gold" />
                                {stepLabel}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Started</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(offer.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gold transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-gold">{progress}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => handleDelete(offer.id, e)}
                            className="text-muted-foreground hover:text-warm-rose transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
