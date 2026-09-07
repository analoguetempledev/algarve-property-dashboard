import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PropertyProvider } from "./contexts/PropertyContext";
import { ChatTriggerProvider } from "./contexts/ChatTriggerContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MyProperties from "./pages/MyProperties";
import PropertyAnalysis from "./pages/PropertyAnalysis";
import CompareProperties from "./pages/CompareProperties";
import MarketAnalytics from "./pages/MarketAnalytics";
import SavingsCalculator from "./pages/SavingsCalculator";
import MyOffers from "./pages/MyOffers";
import OfferFlow from "./pages/OfferFlow";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/properties" component={MyProperties} />
      <Route path="/analysis/:id" component={PropertyAnalysis} />
      <Route path="/compare" component={CompareProperties} />
      <Route path="/analytics" component={MarketAnalytics} />
      <Route path="/calculator" component={SavingsCalculator} />
      <Route path="/offers" component={MyOffers} />
      <Route path="/offers/:id" component={OfferFlow} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <PropertyProvider>
            <ChatTriggerProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ChatTriggerProvider>
          </PropertyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
