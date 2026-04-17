import { useEffect, useState } from "react";
import { Sparkles, Loader2, BookOpen, Library, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { TaleCard, type TaleData } from "@/components/tale-card";
import { cn } from "@/lib/utils";

export function DailyKitsuneTale() {
  const { user } = useAuth();
  const [tale, setTale] = useState<TaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [open, setOpen] = useState(true);
  // Track whether the user has explicitly toggled, so we don't fight their choice
  const [userToggled, setUserToggled] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("kitsune_tales")
      .select("*")
      .eq("user_id", user.id)
      .eq("tale_date", today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTale(data as TaleData);
          // Auto-collapse if already completed today
          if ((data as TaleData).completed) setOpen(false);
        }
        setLoading(false);
      });
  }, [user]);

  // When the tale gets marked completed during the session, auto-collapse once
  useEffect(() => {
    if (tale?.completed && !userToggled) setOpen(false);
  }, [tale?.completed, userToggled]);

  const handleSubmitted = () => {
    // The TaleCard just persisted completion to the DB; mirror it locally so we collapse.
    setTale((t) => (t ? { ...t, completed: true } : t));
  };

  const generateTale = async () => {
    if (!user || generating) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-kitsune-tale");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTale(data.tale);
      setOpen(true);
      setUserToggled(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to summon a tale";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const toggle = () => {
    setUserToggled(true);
    setOpen((v) => !v);
  };

  if (loading) {
    return (
      <div className="card-paper border-2 p-5 md:p-6 flex items-center justify-center min-h-[160px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tale) {
    return (
      <div className="card-paper border-2 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-brush font-bold text-foreground">Daily Kitsune Tale</h3>
              <p className="text-xs text-muted-foreground serif-jp italic">狐の昔話 — A new story each dawn</p>
            </div>
          </div>
          <Link
            to="/tales"
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            title="Tale archive"
          >
            <Library className="w-3.5 h-3.5" />
            Archive
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          A fresh story woven from your own vocabulary — and rooted in real Japanese culture, lore or history. Read it, listen to it, and answer one question.
        </p>
        <button
          onClick={generateTale}
          disabled={generating}
          className="btn-vermillion px-4 py-2 text-sm font-brush flex items-center gap-2 disabled:opacity-60"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Summoning the fox…
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Reveal today's tale
            </>
          )}
        </button>
      </div>
    );
  }

  const completed = !!tale.completed;

  return (
    <div className="space-y-2">
      {/* Foldable header bar */}
      <div className="card-paper border-2 overflow-hidden">
        <button
          onClick={toggle}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-3 px-4 md:px-5 py-3 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-8 h-8 rounded-sm border flex items-center justify-center shrink-0",
                completed
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-primary/10 border-primary/30 text-primary",
              )}
            >
              {completed ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <p className="font-brush font-bold text-foreground text-sm truncate">
                Daily Kitsune Tale
                {completed && (
                  <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-success font-sans">
                    Completed
                  </span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground serif-jp italic truncate">
                {tale.title ?? "狐の昔話"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/tales"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-muted-foreground hover:text-primary hidden sm:inline-flex items-center gap-1"
            >
              <Library className="w-3.5 h-3.5" />
              Archive
            </Link>
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </div>

      {open && <TaleCard tale={tale} onSubmitted={handleSubmitted} />}
    </div>
  );
}
