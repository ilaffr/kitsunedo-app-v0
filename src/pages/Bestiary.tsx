import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { AchievementsPanel } from "@/components/achievements-panel";
import { JlptSpiritStrip } from "@/components/jlpt-spirit-strip";

export default function Bestiary() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl px-4 py-8 md:py-12 pb-24">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-sm brush-hover hover:text-background transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 relative z-10" strokeWidth={1.5} />
          </button>
        </div>

        {/* Cinematic title block */}
        <div className="text-center mb-12 md:mb-16 relative">
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-4">
            Spirit Bestiary
          </p>
          <h1 className="serif-jp font-medium text-foreground text-5xl md:text-7xl tracking-[0.08em] leading-none">
            霊獣図鑑
          </h1>
          <div className="mt-6 mx-auto h-px w-32 bg-foreground/40" />
          <p className="text-sm text-foreground/60 mt-5 max-w-md mx-auto italic tracking-wide">
            A scroll of yōkai and kamui — earned through brush, breath, and study.
          </p>
        </div>

        <JlptSpiritStrip />

        <div id="personal-badges">
          <AchievementsPanel />
        </div>
      </main>
    </div>
  );
}
