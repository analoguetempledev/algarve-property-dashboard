// ============================================================
// DESIGN: Obsidian & Gold Dark Luxury Theme
// Gold accent, Playfair Display headings, Inter body
// Frosted glass header, grouped sidebar navigation
// ============================================================

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Calculator,
  Globe,
  Home,
  GitCompare,
  FileText,
} from "lucide-react";
import AIChatPanel from "@/components/AIChatPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActiveProperty } from "@/contexts/PropertyContext";
import { useChatTrigger } from "@/contexts/ChatTriggerContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const { activePropertyId } = useActiveProperty();
  const { chatOpen, toggleChat, closeChat } = useChatTrigger();
  const { isAuthenticated, user, logout } = useAuth();

  const PORTFOLIO_ITEMS = [
    { icon: LayoutDashboard, label: t.nav.dashboard, path: "/" },
    { icon: Home, label: t.nav.myProperties, path: "/properties" },
    { icon: FileText, label: t.nav.myOffers || "My Offers", path: "/offers" },
  ];

  const TOOLS_ITEMS = [
    { icon: GitCompare, label: t.nav.compare, path: "/compare" },
    { icon: BarChart3, label: t.nav.analytics, path: "/analytics" },
    { icon: Calculator, label: t.nav.calculator, path: "/calculator" },
  ];

  const renderNavItem = (item: { icon: any; label: string; path: string }) => {
    const isActive = location === item.path;
    return (
      <Link key={item.path} href={item.path}>
        <motion.div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
            isActive
              ? "bg-gold/10 text-gold"
              : "text-sidebar-foreground hover:text-foreground hover:bg-white/[0.04]"
          }`}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gold rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap tracking-wide"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/favicon.svg"
              alt="Algarve Property Dashboard"
              className="w-8 h-8 rounded-lg flex-shrink-0 object-contain"
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-gold-gradient font-bold text-lg whitespace-nowrap"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Property Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation — Grouped */}
        <nav className="flex-1 py-5 px-3 space-y-6 overflow-y-auto">
          {/* Portfolio Group */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                Portfolio
              </p>
            )}
            {PORTFOLIO_ITEMS.map(renderNavItem)}
          </div>

          {/* Divider */}
          <div className="mx-3 border-t border-sidebar-border" />

          {/* Tools Group */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                Tools
              </p>
            )}
            {TOOLS_ITEMS.map(renderNavItem)}
          </div>
        </nav>

        {/* AI Assistant Orb */}
        <div className="px-3 pb-3">
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gold/[0.08] border border-gold/15 cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: "oklch(0.76 0.10 70 / 35%)" }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleChat}
          >
            <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0 relative">
              <Bot className="w-4 h-4 text-gold" />
              <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping" style={{ animationDuration: "3s" }} />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-medium text-gold whitespace-nowrap">{t.nav.aiAssistant}</p>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">{t.nav.askAnything}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Collapse Toggle */}
        <div className="px-3 pb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:text-gold hover:bg-white/[0.04] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 min-h-screen relative"
      >
        {/* Top Bar — frosted glass */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 glass-overlay border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.common.search}
                className="w-80 h-9 pl-10 pr-4 rounded-lg bg-white/[0.04] border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/[0.04] border border-border text-sm font-medium text-muted-foreground hover:text-gold hover:border-gold/30 transition-all"
              title={language === "en" ? "Switch to Portuguese" : "Mudar para Inglês"}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{language === "en" ? "EN" : "PT"}</span>
            </button>
            <button className="relative w-9 h-9 rounded-lg bg-white/[0.04] border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/30 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-[10px] font-bold text-background flex items-center justify-center">3</span>
            </button>
            <button className="w-9 h-9 rounded-lg bg-white/[0.04] border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/30 transition-all">
              <Settings className="w-4 h-4" />
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => void logout()}
                className="h-9 px-3 rounded-lg bg-white/[0.04] border border-border text-xs font-medium text-muted-foreground hover:text-gold hover:border-gold/30 transition-all"
                title={user?.email ?? t.nav.signOut}
              >
                {t.nav.signOut}
              </button>
            ) : (
              <Link href={getLoginUrl()}>
                <span className="h-9 px-3 rounded-lg bg-gold/15 border border-gold/25 text-xs font-medium text-gold hover:bg-gold/20 transition-all inline-flex items-center">
                  {t.nav.signIn}
                </span>
              </Link>
            )}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/25 to-gold/5 border border-gold/25 flex items-center justify-center">
              <User className="w-4 h-4 text-gold" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </motion.main>

      {/* AI Chat Panel */}
      <AIChatPanel open={chatOpen} onClose={closeChat} propertyId={activePropertyId} />
    </div>
  );
}
