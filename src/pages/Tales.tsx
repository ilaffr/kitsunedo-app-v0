import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Library, Loader2, Sparkles, ChevronDown, Volume2 } from "lucide-react";
import { Header } from "@/components/header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { TaleCard, type TaleData } from "@/components/tale-card";
import { speakJapanese } from "@/lib/japanese-tts";
import { cn } from "@/lib/utils";

const THEME_LABEL: Record<string, string> = {
  yokai_folklore: "Yokai folklore",
  festival: "Festival",
  history: "History",
  mystery: "Mystery",
  shrine_lore: "Shrine lore",
  everyday_culture: "Everyday culture",
  tea_arts: "Traditional arts",
  nature_seasons: "Nature & seasons",
};

const THEMES = ["all", ...Object.keys(THEME_LABEL)];

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export default function Tales() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tales, setTales] = useState<TaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("kitsune_tales")
      .select("*")
      .eq("user_id", user.id)
      .order("tale_date", { ascending: false })
      .then(({ data }) => {
        setTales((data ?? []) as TaleData[]);
        setLoading(false);
      });
  }, [user]);

  const filtered = filter === "all" ? tales : tales.filter((t) => t.theme === filter);
  const themeCounts = tales.reduce<Record<string, number>>((acc, t) => {
    if (t.theme) acc[t.theme] = (acc[t.theme] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-foreground/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground flex items-center gap-1.5">
              <Library className="w-3 h-3" strokeWidth={1.5} />
              Tale Archive
            </p>
            <h1 className="text-2xl serif-jp font-medium text-foreground tracking-wide">昔話の巻物</h1>
            <p className="text-xs text-muted-foreground mt-0.5 italic">
              {tales.length} {tales.length === 1 ? "tale" : "tales"} woven so far
            </p>
          </div>
        </div>

        {/* Theme filter */}
        {tales.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-6">
            {THEMES.map((t) => {
              const isActive = filter === t;
              const count = t === "all" ? tales.length : themeCounts[t] ?? 0;
              if (t !== "all" && count === 0) return null;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 transition-colors border-b",
                    isActive
                      ? "text-foreground border-foreground"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {t === "all" ? "All" : THEME_LABEL[t]} <span className="opacity-50">· {count}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="card-paper border-2 p-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && tales.length === 0 && (
          <div className="card-paper border-2 p-8 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold serif-jp text-foreground mb-2">No tales yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The kitsune writes one new story for you each day. Come back tomorrow — or summon today's from the dashboard.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Back to dashboard
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((tale) => {
              const isExpanded = expandedId === tale.id;
              return (
                <div key={tale.id}>
                  {!isExpanded ? (
                    <button
                      onClick={() => setExpandedId(tale.id)}
                      className="w-full text-left card-paper border-2 p-4 hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                              {formatDate(tale.tale_date)}
                            </span>
                            {tale.theme && THEME_LABEL[tale.theme] && (
                              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-sm">
                                {THEME_LABEL[tale.theme]}
                              </span>
                            )}
                            {tale.completed && tale.xp_awarded > 0 && (
                              <span className="text-[10px] uppercase tracking-wide text-success">+{tale.xp_awarded} XP</span>
                            )}
                          </div>
                          <h3 className="font-brush font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {tale.title || "Untitled tale"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                            {tale.translation}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); speakJapanese(tale.story_jp, 0.85); }}
                            className="p-1.5 rounded-sm hover:bg-muted transition-colors"
                            aria-label="Listen"
                          >
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                          {formatDate(tale.tale_date)}
                        </span>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Collapse
                        </button>
                      </div>
                      <TaleCard
                        tale={tale}
                        interactive={!tale.completed}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
