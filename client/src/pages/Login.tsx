import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { t } = useLanguage();
  const { isAuthenticated, loading, refresh } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await refresh();
      navigate("/");
    },
    onError: (err) => setError(err.message),
  });

  const register = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await refresh();
      navigate("/");
    },
    onError: (err) => setError(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  const pending = login.isPending || register.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "register") {
      register.mutate({ name, email, password });
      return;
    }
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-card p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/favicon.svg"
            alt="Algarve Property Dashboard"
            className="w-12 h-12 rounded-lg mb-3"
          />
          <h1
            className="text-2xl font-bold text-gold-gradient"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Property Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? t.auth.loginSubtitle : t.auth.registerSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`h-9 rounded-lg text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-gold/15 text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.auth.signIn}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`h-9 rounded-lg text-sm font-medium transition-colors ${
              mode === "register"
                ? "bg-gold/15 text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.auth.createAccount}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs text-muted-foreground">{t.auth.name}</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-gold/50"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground">{t.auth.email}</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t.auth.password}</label>
            <input
              required
              type="password"
              minLength={mode === "register" ? 8 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-gold/50"
            />
            {mode === "register" && (
              <p className="text-[11px] text-muted-foreground mt-1">{t.auth.passwordHint}</p>
            )}
          </div>

          {error && <p className="text-sm text-warm-rose">{error}</p>}

          <Button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-gold hover:bg-gold/90 text-background"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? t.auth.signIn : t.auth.createAccount}
          </Button>
        </form>

        <Link href="/" className="block text-center text-xs text-muted-foreground mt-6 hover:text-gold">
          {t.auth.backHome}
        </Link>
      </div>
    </div>
  );
}
