import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import foxImg from "@/assets/fox-brush.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the magic link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check hash for type=recovery (in case event already fired)
    if (window.location.hash.includes("type=recovery")) {
      setReady(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="card-paper border-2 w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={foxImg} alt="Kitsune" className="w-20 h-20 object-contain mb-4 opacity-90" />
          <h1 className="text-2xl font-bold serif-jp text-foreground tracking-wide">新密码</h1>
          <p className="text-xs text-muted-foreground serif-jp mt-0.5">Set New Password</p>
          <div className="ink-divider w-full mt-5" />
        </div>

        {success ? (
          <p className="text-sm text-success border border-success/30 bg-success/10 rounded-sm px-3 py-2 serif-jp text-center">
            Password updated! Redirecting…
          </p>
        ) : !ready ? (
          <p className="text-sm text-muted-foreground serif-jp text-center">
            Loading recovery session…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
                New Password
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded-sm px-3 py-2 serif-jp">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm btn-ink text-background border-foreground mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? "..." : "更新 — Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
