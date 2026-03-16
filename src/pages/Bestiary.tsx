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
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-brush font-bold text-foreground">霊獣図鑑</h1>
            <p className="text-xs text-muted-foreground serif-jp">Spirit Bestiary — Your Collection</p>
          </div>
        </div>

        <AchievementsPanel />
      </main>
    </div>
  );
}
