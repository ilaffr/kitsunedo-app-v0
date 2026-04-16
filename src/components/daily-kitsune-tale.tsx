import { useEffect, useState } from "react";
import { Sparkles, Loader2, BookOpen, Library } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { TaleCard, type TaleData } from "@/components/tale-card";

export function DailyKitsuneTale() {
  const { user } = useAuth();
  const [tale, setTale] = useState<TaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
        if (data) setTale(data as TaleData);
        setLoading(false);
      });
  }, [user]);

  const generateTale = async () => {
    if (!user || generating) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-kitsune-tale");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTale(data.tale);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to summon a tale";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <Link
          to="/tales"
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <Library className="w-3.5 h-3.5" />
          Tale archive
        </Link>
      </div>
      <TaleCard tale={tale} />
    </div>
  );
}
