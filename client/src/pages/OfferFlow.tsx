// ============================================================
// OfferFlow — 5-step buying wizard
// Analysis → Negotiation Strategy → Due Diligence → Make Offer → CPCV & Escritura
// ============================================================

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Target,
  Shield,
  FileText,
  Building,
  Loader2,
  ExternalLink,
  MessageCircle,
  StickyNote,
  Clock,
  Send,
  ChevronRight,
  AlertTriangle,
  TrendingDown,
  MapPin,
  Euro,
  Home,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useChatTrigger } from "@/contexts/ChatTriggerContext";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { SAVINGS_COMMISSION_RATE } from "@shared/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

// ─── Step definitions ──────────────────────────────────────
const STEPS = [
  {
    id: "analysis" as const,
    icon: Sparkles,
    label: "Analysis Review",
    description: "Review the AI analysis and confirm property interest",
  },
  {
    id: "negotiation" as const,
    icon: Target,
    label: "Negotiation Strategy",
    description: "Define your negotiation approach and target price",
  },
  {
    id: "due_diligence" as const,
    icon: Shield,
    label: "Due Diligence",
    description: "Legal checks, inspections, and documentation review",
  },
  {
    id: "make_offer" as const,
    icon: FileText,
    label: "Make Offer",
    description: "Submit your formal offer to the seller",
  },
  {
    id: "completion" as const,
    icon: Building,
    label: "CPCV & Escritura",
    description: "Sign contracts and complete the purchase",
  },
];

type StepId = (typeof STEPS)[number]["id"];

// ─── Step content components ────────────────────────────────

function AnalysisStep({
  property,
  onComplete,
}: {
  property: any;
  onComplete: () => void;
}) {
  const { askAboutProperty } = useChatTrigger();

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          AI Property Analysis Summary
        </h3>
        {property?.aiDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {property.aiDescription}
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Score</p>
            <p className="text-lg font-bold text-gold font-mono mt-1">{property?.aiScore || "—"}/100</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bargaining Power</p>
            <p className="text-lg font-bold text-foreground font-mono mt-1">{property?.bargainingPower || "—"}/100</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Days on Market</p>
            <p className="text-lg font-bold text-foreground font-mono mt-1">{property?.daysOnMarket || "—"}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price Reductions</p>
            <p className="text-lg font-bold text-warm-rose font-mono mt-1">{property?.priceReductions || 0}</p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Before proceeding, confirm:</h3>
        <div className="space-y-3">
          {[
            "I have reviewed the AI analysis and property details",
            "I understand the property's strengths and weaknesses",
            "I have checked comparable properties in the area",
            "I am interested in proceeding with this property",
          ].map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" className="mt-1 accent-gold w-4 h-4" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => property && askAboutProperty("What should I know before making an offer on this property?", property.id)}
          className="text-sm text-gold flex items-center gap-1.5 hover:underline"
        >
          <MessageCircle className="w-4 h-4" />
          Ask AI about this property
        </button>
      </div>

      <Button onClick={onComplete} className="bg-gold hover:bg-gold/90 text-background gap-2">
        Confirm Analysis <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function NegotiationStep({
  property,
  offer,
  onComplete,
  onUpdatePrice,
}: {
  property: any;
  offer: any;
  onComplete: () => void;
  onUpdatePrice: (price: number) => void;
}) {
  const [targetPrice, setTargetPrice] = useState(
    offer?.offerPrice || property?.suggestedOffer || (property?.askingPrice ? Math.round(property.askingPrice * 0.92) : 0)
  );
  const askingPrice = property?.askingPrice || 0;
  const suggestedOffer = property?.suggestedOffer || 0;
  const discount = askingPrice ? ((1 - targetPrice / askingPrice) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-gold" />
          Negotiation Strategy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-secondary border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Asking Price</p>
            <p className="text-xl font-bold text-foreground font-mono mt-1">{formatPrice(askingPrice)}</p>
          </div>
          <div className="p-4 rounded-xl bg-terra-green/5 border border-terra-green/20">
            <p className="text-[10px] text-terra-green uppercase tracking-wider">AI Suggested Offer</p>
            <p className="text-xl font-bold text-terra-green font-mono mt-1">{formatPrice(suggestedOffer)}</p>
          </div>
          <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
            <p className="text-[10px] text-gold uppercase tracking-wider">Your Target</p>
            <p className="text-xl font-bold text-gold font-mono mt-1">{formatPrice(targetPrice)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">-{discount}% from asking</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Set your target offer price</label>
          <input
            type="range"
            min={Math.round(askingPrice * 0.8)}
            max={askingPrice}
            step={1000}
            value={targetPrice}
            onChange={(e) => setTargetPrice(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{formatPrice(Math.round(askingPrice * 0.8))}</span>
            <span>{formatPrice(askingPrice)}</span>
          </div>
        </div>
      </div>

      {/* Negotiation leverage points */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-gold" />
          Negotiation Leverage Points
        </h3>
        <div className="space-y-3">
          {property?.daysOnMarket > 90 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-terra-green/5 border border-terra-green/15">
              <Clock className="w-4 h-4 text-terra-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-terra-green">Long time on market</p>
                <p className="text-xs text-muted-foreground">
                  This property has been listed for {property.daysOnMarket} days. Sellers may be more willing to negotiate.
                </p>
              </div>
            </div>
          )}
          {property?.priceReductions > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-terra-green/5 border border-terra-green/15">
              <TrendingDown className="w-4 h-4 text-terra-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-terra-green">Previous price reductions</p>
                <p className="text-xs text-muted-foreground">
                  The seller has already reduced the price {property.priceReductions} time(s), indicating flexibility.
                </p>
              </div>
            </div>
          )}
          {property?.bargainingPower >= 60 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-terra-green/5 border border-terra-green/15">
              <Target className="w-4 h-4 text-terra-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-terra-green">Strong bargaining position</p>
                <p className="text-xs text-muted-foreground">
                  AI analysis indicates a bargaining power score of {property.bargainingPower}/100.
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gold/5 border border-gold/15">
            <AlertTriangle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gold">Negotiation support</p>
              <p className="text-xs text-muted-foreground">
                Your buyer's agent handles the negotiation on your behalf, using market data and comparable sales to justify the offer price.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => {
          onUpdatePrice(targetPrice);
          onComplete();
        }}
        className="bg-gold hover:bg-gold/90 text-background gap-2"
      >
        Confirm Strategy <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function DueDiligenceStep({ property, onComplete }: { property: any; onComplete: () => void }) {
  const items = [
    { label: "Property title deed (Certidão de Registo Predial)", checked: false },
    { label: "Tax identification (Caderneta Predial Urbana)", checked: false },
    { label: "Energy certificate (Certificado Energético)", checked: false },
    { label: "Building license and usage permit (Licença de Utilização)", checked: false },
    { label: "Condominium regulations (if applicable)", checked: false },
    { label: "Property inspection / survey", checked: false },
    { label: "Check for liens, mortgages, or encumbrances", checked: false },
    { label: "Verify property boundaries and area", checked: false },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          Due Diligence Checklist
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Complete these checks before making a formal offer. Your agent assists with document verification.
        </p>

        <div className="space-y-3">
          {items.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-secondary transition-colors">
              <input type="checkbox" className="mt-0.5 accent-gold w-4 h-4" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 border-gold/20">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gold" />
          Important Notes
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
            All documents should be obtained from the Portuguese Land Registry (Conservatória do Registo Predial)
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
            Energy certificates are mandatory for all property sales in Portugal
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
            Consider hiring a surveyor for older properties or properties without recent renovations
          </li>
        </ul>
      </div>

      <Button onClick={onComplete} className="bg-gold hover:bg-gold/90 text-background gap-2">
        Due Diligence Complete <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function MakeOfferStep({
  property,
  offer,
  onComplete,
  onUpdateStatus,
}: {
  property: any;
  offer: any;
  onComplete: () => void;
  onUpdateStatus: (status: string) => void;
}) {
  const offerPrice = offer?.offerPrice || property?.suggestedOffer || 0;
  const askingPrice = property?.askingPrice || 0;
  const discount = askingPrice ? ((1 - offerPrice / askingPrice) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gold" />
          Formal Offer Summary
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="text-sm font-medium text-foreground">{property?.title || property?.address || "Property"}</p>
            </div>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Asking Price</p>
              <p className="text-lg font-bold text-foreground font-mono mt-1">{formatPrice(askingPrice)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
              <p className="text-[10px] text-gold uppercase tracking-wider">Your Offer</p>
              <p className="text-lg font-bold text-gold font-mono mt-1">{formatPrice(offerPrice)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">-{discount}% discount</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-terra-green/5 border border-terra-green/20">
            <p className="text-[10px] text-terra-green uppercase tracking-wider">Potential Savings</p>
            <p className="text-xl font-bold text-terra-green font-mono mt-1">
              {formatPrice(askingPrice - offerPrice)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Agent fee: {formatPrice(Math.round((askingPrice - offerPrice) * SAVINGS_COMMISSION_RATE))} ({Math.round(SAVINGS_COMMISSION_RATE * 100)}% of savings)
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-gold/20">
        <h3 className="text-sm font-semibold text-foreground mb-3">Next Steps</h3>
        <ol className="space-y-3">
          {[
            "Your agent presents the offer to the seller's agent",
            "We will negotiate on your behalf using market data",
            "You will be notified of any counter-offers",
            "Once accepted, we proceed to the CPCV signing",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <Button
        onClick={() => {
          onUpdateStatus("offer_sent");
          onComplete();
        }}
        className="bg-gold hover:bg-gold/90 text-background gap-2"
      >
        <Send className="w-4 h-4" />
        Submit Offer
      </Button>
    </div>
  );
}

function CompletionStep({ property, offer }: { property: any; offer: any }) {
  const items = [
    { label: "CPCV (Contrato-Promessa de Compra e Venda) — Promissory Contract", done: false },
    { label: "Pay deposit (typically 10-30% of purchase price)", done: false },
    { label: "Obtain NIF (Número de Identificação Fiscal) if not already done", done: false },
    { label: "Open Portuguese bank account for transaction", done: false },
    { label: "Arrange mortgage pre-approval (if financing)", done: false },
    { label: "Pay IMT (Imposto Municipal sobre Transmissões) and Stamp Duty", done: false },
    { label: "Escritura (Deed of Sale) — Final signing at notary", done: false },
    { label: "Register property at Land Registry (Conservatória)", done: false },
    { label: "Transfer utilities and update municipal records", done: false },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
          <Building className="w-4 h-4 text-gold" />
          Purchase Completion Checklist
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Final steps to complete your property purchase in Portugal. Your agent guides you through each one.
        </p>

        <div className="space-y-3">
          {items.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-secondary transition-colors">
              <input type="checkbox" className="mt-0.5 accent-gold w-4 h-4" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 border-terra-green/20 bg-terra-green/[0.02]">
        <h3 className="text-sm font-semibold text-terra-green mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Congratulations!
        </h3>
        <p className="text-sm text-muted-foreground">
          Once all steps are completed, you will be the proud owner of your new property in Portugal.
        </p>
      </div>
    </div>
  );
}

// ─── Main OfferFlow Page ────────────────────────────────────

export default function OfferFlow() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [noteText, setNoteText] = useState("");

  const { data: offerData, isLoading } = trpc.offers.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id && isAuthenticated }
  );

  const utils = trpc.useUtils();

  const completeStep = trpc.offers.completeStep.useMutation({
    onSuccess: () => {
      utils.offers.getById.invalidate({ id: Number(id) });
      utils.offers.list.invalidate();
    },
  });

  const updatePrice = trpc.offers.updatePrice.useMutation({
    onSuccess: () => {
      utils.offers.getById.invalidate({ id: Number(id) });
    },
  });

  const updateStatus = trpc.offers.updateStatus.useMutation({
    onSuccess: () => {
      utils.offers.getById.invalidate({ id: Number(id) });
    },
  });

  const addNote = trpc.offers.addNote.useMutation({
    onSuccess: () => {
      setNoteText("");
      utils.offers.getById.invalidate({ id: Number(id) });
    },
  });

  const currentStepIndex = useMemo(() => {
    if (!offerData) return 0;
    return STEPS.findIndex((s) => s.id === offerData.currentStep);
  }, [offerData?.currentStep]);

  const handleCompleteStep = (step: StepId) => {
    if (!offerData) return;
    completeStep.mutate({ offerId: offerData.id, step });
  };

  const handleUpdatePrice = (price: number) => {
    if (!offerData) return;
    updatePrice.mutate({ offerId: offerData.id, offerPrice: price });
  };

  const handleUpdateStatus = (status: string) => {
    if (!offerData) return;
    updateStatus.mutate({
      offerId: offerData.id,
      status: status as any,
    });
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

  if (!offerData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
          <p className="text-foreground font-medium">Offer not found</p>
          <Link href="/offers">
            <span className="text-gold hover:underline text-sm cursor-pointer">Back to My Offers</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const property = offerData.property;
  const notes = offerData.notes || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/offers">
            <span className="text-sm text-gold flex items-center gap-1 hover:underline cursor-pointer mb-4 inline-flex">
              <ArrowLeft className="w-4 h-4" /> Back to My Offers
            </span>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Buying: {property?.title || property?.address || "Property"}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {property?.city && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {property.city}
                  </span>
                )}
                {property?.askingPrice && (
                  <span className="text-sm font-bold text-gold font-mono">
                    {formatPrice(property.askingPrice)}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                  offerData.status === "completed"
                    ? "bg-terra-green-dim text-terra-green"
                    : offerData.status === "offer_sent"
                    ? "bg-gold-dim text-gold"
                    : offerData.status === "accepted"
                    ? "bg-terra-green-dim text-terra-green"
                    : offerData.status === "rejected"
                    ? "bg-warm-rose-dim text-warm-rose"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {offerData.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
            {property?.sourceUrl && (
              <a
                href={property.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold flex items-center gap-1 hover:underline"
              >
                View listing <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Main Layout: Steps sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Step Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-1"
          >
            <div className="glass-card p-4 space-y-1 sticky top-24">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-2 mb-3">
                Buying Process
              </p>
              {STEPS.map((step, index) => {
                const isComplete = index < currentStepIndex ||
                  (offerData as any)?.[`${step.id}Completed`];
                const isActive = index === currentStepIndex;
                const isPending = index > currentStepIndex && !(offerData as any)?.[`${step.id}Completed`];
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-gold/8 text-gold border border-gold/20"
                        : isComplete
                        ? "text-terra-green"
                        : "text-muted-foreground opacity-60"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : isActive ? (
                      <div className="w-4 h-4 rounded-full border-2 border-gold flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </div>
                    ) : (
                      <Circle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{step.label}</p>
                      {isActive && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Progress indicator */}
              <div className="mt-4 pt-4 border-t border-border px-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">Progress</span>
                  <span className="text-[10px] font-mono text-gold">
                    {Math.round(((currentStepIndex) / STEPS.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gold"
                    animate={{ width: `${(currentStepIndex / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center: Step Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={offerData.currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {offerData.currentStep === "analysis" && (
                  <AnalysisStep
                    property={property}
                    onComplete={() => handleCompleteStep("analysis")}
                  />
                )}
                {offerData.currentStep === "negotiation" && (
                  <NegotiationStep
                    property={property}
                    offer={offerData}
                    onComplete={() => handleCompleteStep("negotiation")}
                    onUpdatePrice={handleUpdatePrice}
                  />
                )}
                {offerData.currentStep === "due_diligence" && (
                  <DueDiligenceStep
                    property={property}
                    onComplete={() => handleCompleteStep("due_diligence")}
                  />
                )}
                {offerData.currentStep === "make_offer" && (
                  <MakeOfferStep
                    property={property}
                    offer={offerData}
                    onComplete={() => handleCompleteStep("make_offer")}
                    onUpdateStatus={handleUpdateStatus}
                  />
                )}
                {offerData.currentStep === "completion" && (
                  <CompletionStep property={property} offer={offerData} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right: Notes & Activity */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-1"
          >
            <div className="glass-card p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-gold" />
                Activity & Notes
              </h3>

              {/* Add note */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && noteText.trim()) {
                      addNote.mutate({ offerId: offerData.id, content: noteText.trim() });
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (noteText.trim()) {
                      addNote.mutate({ offerId: offerData.id, content: noteText.trim() });
                    }
                  }}
                  disabled={!noteText.trim() || addNote.isPending}
                  className="w-9 h-9 rounded-lg bg-gold text-background flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notes list */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No activity yet</p>
                ) : (
                  notes.map((note: any) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg text-xs ${
                        note.noteType === "milestone"
                          ? "bg-terra-green/5 border border-terra-green/15"
                          : note.noteType === "system"
                          ? "bg-secondary border border-border"
                          : "bg-gold/5 border border-gold/15"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {note.noteType === "milestone" ? (
                          <CheckCircle2 className="w-3 h-3 text-terra-green" />
                        ) : note.noteType === "system" ? (
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <StickyNote className="w-3 h-3 text-gold" />
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
