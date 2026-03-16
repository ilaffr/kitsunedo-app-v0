import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import foxImg from "@/assets/fox-brush.png";

type Mode = "signin" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setInfo("Check your email for a password reset link.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo("Check your email to confirm your account before signing in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Ink-wash card */}
      <div className="card-paper border-2 w-full max-w-sm p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={foxImg}
            alt="Kitsune"
            className="w-20 h-20 object-contain mb-4 opacity-90"
          />
          <h1 className="text-2xl font-bold serif-jp text-foreground tracking-wide">
            狐道
          </h1>
          <p className="text-xs text-muted-foreground serif-jp mt-0.5">Kitsune-dō</p>
          <div className="ink-divider w-full mt-5" />
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-sm overflow-hidden border-2 border-border mb-6">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); setInfo(null); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium serif-jp transition-colors",
                mode === m
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "signin" ? "入門 Sign In" : "入学 Sign Up"}
            </button>
          ))}
        </div>

        {forgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded-sm px-3 py-2 serif-jp">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-success border border-success/30 bg-success/10 rounded-sm px-3 py-2 serif-jp">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm btn-ink text-background border-foreground mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? "..." : "送信 — Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={() => { setForgotMode(false); setError(null); setInfo(null); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground serif-jp transition-colors"
            >
              ← Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
                placeholder="••••••••"
              />
            </div>

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => { setForgotMode(true); setError(null); setInfo(null); }}
                className="text-xs text-muted-foreground hover:text-foreground serif-jp transition-colors"
              >
                Forgot password?
              </button>
            )}

            {error && (
              <p className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded-sm px-3 py-2 serif-jp">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-success border border-success/30 bg-success/10 rounded-sm px-3 py-2 serif-jp">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm btn-ink text-background border-foreground mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading
                ? "..."
                : mode === "signin"
                ? "入門 — Enter the Dojo"
                : "入学 — Begin Your Path"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
