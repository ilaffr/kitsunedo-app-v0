import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroBrush from "@/assets/hero-brush.jpg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    if (window.location.hash.includes("type=recovery")) setReady(true);
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The two seals do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <img
        src={heroBrush}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-background/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.6)_85%)]" />

      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex">
        <span className="kanji-watermark text-[10rem] leading-none tracking-[0.4em] select-none">
          再生
        </span>
      </div>

      <div className="absolute top-6 left-6 ginkgo-seal w-10 h-10 text-base z-10">
        鍵
      </div>

      <div className="absolute top-7 left-1/2 -translate-x-1/2 z-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">Kitsune-dō</p>
        <div className="h-px w-12 bg-foreground/30 mx-auto mt-2" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="serif-jp font-medium text-foreground text-[5.5rem] md:text-[8rem] leading-none tracking-[0.05em]">
            新鍵
          </h1>
          <div className="mt-4 mx-auto h-px w-32 bg-foreground/50" />
          <p className="mt-4 text-xs md:text-sm uppercase tracking-[0.35em] text-muted-foreground serif-jp">
            Shin-kagi — Forge a new seal
          </p>
        </div>

        <div className="w-full max-w-sm relative">
          <div className="washi-card p-7 md:p-8 backdrop-blur-sm bg-card/85">
            {success ? (
              <p className="text-xs px-3 py-3 serif-jp tracking-wide border-l-2 text-foreground border-foreground/60 bg-foreground/5 text-center">
                Seal renewed. Returning to the dojo…
              </p>
            ) : !ready ? (
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground serif-jp text-center py-4">
                Awaiting recovery scroll…
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-2 serif-jp">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-foreground/25 text-foreground text-sm tracking-wide focus:outline-none focus:border-foreground placeholder:text-muted-foreground/50 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-2 serif-jp">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-foreground/25 text-foreground text-sm tracking-wide focus:outline-none focus:border-foreground placeholder:text-muted-foreground/50 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className={cn(
                    "text-xs px-3 py-2 serif-jp tracking-wide border-l-2",
                    "text-destructive border-destructive/60 bg-destructive/5"
                  )}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-foreground text-background serif-jp text-xs uppercase tracking-[0.3em] font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "..." : "更新 — Renew Seal"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground/70 serif-jp mt-6">
            The Path of the Fox
          </p>
        </div>
      </div>
    </div>
  );
}
