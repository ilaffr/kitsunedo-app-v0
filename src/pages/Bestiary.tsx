import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { AchievementsPanel } from "@/components/achievements-panel";

export default function Bestiary() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl px-4 py-6 pb-24">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-foreground/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Spirit Bestiary</p>
            <h1 className="text-2xl serif-jp font-medium text-foreground tracking-wide">霊獣図鑑</h1>
          </div>
        </div>

        <AchievementsPanel />
      </main>
    </div>
  );
}
