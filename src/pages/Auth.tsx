import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroBrush from "@/assets/hero-brush.jpg";

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
    if (error) setError(error.message);
    else setInfo("A scroll has been sent. Check your email for the recovery seal.");
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
      if (error) setError(error.message);
      else setInfo("Check your email to confirm your path before entering.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate("/");
    }
    setLoading(false);
  };

  const headingKanji = forgotMode ? "再開" : mode === "signin" ? "入門" : "入学";
  const headingRomaji = forgotMode ? "Saikai — Begin again" : mode === "signin" ? "Nyūmon — Enter the gate" : "Nyūgaku — Begin the path";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Cinematic sumi-e backdrop */}
      <img
        src={heroBrush}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-95"
      />
      {/* Atmospheric mist layers — pale washi feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-background/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.6)_85%)]" />

      {/* Vertical kanji watermark — right side, like Yōtei main menu */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex">
        <span className="kanji-watermark text-[10rem] leading-none tracking-[0.4em] select-none">
          狐道
        </span>
      </div>

      {/* Vermillion ginkgo seal — top-left accent */}
      <div className="absolute top-6 left-6 ginkgo-seal w-10 h-10 text-base z-10">
        学
      </div>

      {/* Brand line — top */}
      <div className="absolute top-7 left-1/2 -translate-x-1/2 z-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
          Kitsune-dō
        </p>
        <div className="h-px w-12 bg-foreground/30 mx-auto mt-2" />
      </div>

      {/* Center stage */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Massive ceremonial kanji */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="serif-jp font-medium text-foreground text-[5.5rem] md:text-[8rem] leading-none tracking-[0.05em]">
            {headingKanji}
          </h1>
          <div className="mt-4 mx-auto h-px w-32 bg-foreground/50" />
          <p className="mt-4 text-xs md:text-sm uppercase tracking-[0.35em] text-muted-foreground serif-jp">
            {headingRomaji}
          </p>
        </div>

        {/* Glass washi card */}
        <div className="w-full max-w-sm relative">
          <div className="washi-card p-7 md:p-8 backdrop-blur-sm bg-card/85">
            {/* Mode toggle — minimal Yōtei tabs */}
            {!forgotMode && (
              <div className="flex justify-center gap-8 mb-7">
                {(["signin", "signup"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(null); setInfo(null); }}
                    className={cn(
                      "relative pb-2 text-[11px] uppercase tracking-[0.3em] serif-jp transition-colors",
                      mode === m
                        ? "text-foreground"
                        : "text-muted-foreground/70 hover:text-foreground"
                    )}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                    {mode === m && (
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {forgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="your@email.com"
                />

                {error && <Msg kind="error">{error}</Msg>}
                {info && <Msg kind="info">{info}</Msg>}

                <button type="submit" disabled={loading} className={btnInk}>
                  {loading ? "..." : "送信 — Send Recovery Scroll"}
                </button>
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setError(null); setInfo(null); }}
                  className="block w-full text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground serif-jp transition-colors pt-1"
                >
                  ← Return
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>

                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(null); setInfo(null); }}
                    className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground serif-jp transition-colors"
                  >
                    Forgot password?
                  </button>
                )}

                {error && <Msg kind="error">{error}</Msg>}
                {info && <Msg kind="info">{info}</Msg>}

                <button type="submit" disabled={loading} className={btnInk}>
                  {loading
                    ? "..."
                    : mode === "signin"
                    ? "入る — Enter the Dojo"
                    : "始める — Begin Your Path"}
                </button>
              </form>
            )}
          </div>

          {/* Guest preview — try kana primer without signing up */}
          <Link
            to="/lesson/kana"
            className="block w-full text-center mt-5 py-3 border border-foreground/25 hover:border-foreground/60 transition-colors serif-jp text-[11px] uppercase tracking-[0.3em] text-foreground bg-background/40 backdrop-blur-sm"
          >
            試す — Try the kana primer free
          </Link>
          <p className="text-center text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70 mt-2">
            No signup required
          </p>

          {/* Footnote */}
          <p className="text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground/70 serif-jp mt-6">
            The Path of the Fox
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponents & shared classes ---------- */

const inputCls =
  "w-full px-0 py-2.5 bg-transparent border-0 border-b border-foreground/25 text-foreground text-sm tracking-wide focus:outline-none focus:border-foreground placeholder:text-muted-foreground/50 transition-colors";

const btnInk =
  "w-full py-3 mt-2 bg-foreground text-background serif-jp text-xs uppercase tracking-[0.3em] font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-2 serif-jp">
      {children}
    </label>
  );
}

function Msg({ kind, children }: { kind: "error" | "info"; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "text-xs px-3 py-2 serif-jp tracking-wide border-l-2",
        kind === "error"
          ? "text-destructive border-destructive/60 bg-destructive/5"
          : "text-foreground border-foreground/60 bg-foreground/5"
      )}
    >
      {children}
    </p>
  );
}
