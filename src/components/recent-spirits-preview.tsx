import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { loadAchievements, type AchievementId } from "@/hooks/use-achievement";
import { useAuth } from "@/context/AuthContext";
import { usePersonalBadges } from "@/hooks/use-personal-badges";
import { ChevronRight, Sparkles, ScrollText } from "lucide-react";
import kitsuneImg from "@/assets/achievement-kitsune.png";
import tanukiImg from "@/assets/achievement-tanuki.png";
import tenguImg from "@/assets/achievement-tengu.png";
import ryujinImg from "@/assets/achievement-ryujin.png";
import oniImg from "@/assets/achievement-oni.png";
import bakenekoImg from "@/assets/yokai-bakeneko.png";
import yokaiTenguImg from "@/assets/yokai-tengu.png";
import kappaImg from "@/assets/yokai-kappa.png";
import yukionnaImg from "@/assets/yokai-yukionna.png";
import kamuyImg from "@/assets/yokai-kamuy.png";

const rarityBorderClass: Record<string, string> = {
  common: "border-border",
  uncommon: "border-success/60",
  rare: "border-primary/70",
  legendary: "border-warning",
  mythic: "border-primary",
};

const rarityGlowClass: Record<string, string> = {
  common: "",
  uncommon: "shadow-[0_0_10px_hsl(var(--success)/0.18)]",
  rare: "shadow-[0_0_14px_hsl(var(--primary)/0.22)]",
  legendary: "shadow-[0_0_18px_hsl(var(--warning)/0.28)]",
  mythic: "shadow-[0_0_22px_hsl(var(--primary)/0.45)]",
};

const rarityLabel: Record<string, string> = {
  common: "常",
  uncommon: "稀",
  rare: "珍",
  legendary: "伝",
  mythic: "神",
};

const rarityTextClass: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-success",
  rare: "text-primary",
  legendary: "text-warning",
  mythic: "text-primary",
};

interface RecentSpirit {
  id: string;
  title: string;
  titleJP: string;
  image: string;
  rarity: string;
}

const ACHIEVEMENT_MAP: Record<AchievementId, RecentSpirit> = {
  first_lesson: { id: "first_lesson", title: "First Scroll", titleJP: "最初の巻物", image: kitsuneImg, rarity: "common" },
  perfect_practice: { id: "perfect_practice", title: "Iron Discipline", titleJP: "鉄の修行", image: tenguImg, rarity: "rare" },
  vocabulary_master: { id: "vocabulary_master", title: "Word Weaver", titleJP: "言葉の織り手", image: tanukiImg, rarity: "uncommon" },
  all_grammar: { id: "all_grammar", title: "Pattern Seeker", titleJP: "型の探求者", image: ryujinImg, rarity: "uncommon" },
  streak_3: { id: "streak_3", title: "Demon's Resolve", titleJP: "鬼の覚悟", image: oniImg, rarity: "legendary" },
  boss_bakeneko: { id: "boss_bakeneko", title: "Bakeneko Bested", titleJP: "化け猫退治", image: bakenekoImg, rarity: "rare" },
  boss_tengu: { id: "boss_tengu", title: "Tengu Humbled", titleJP: "天狗服従", image: yokaiTenguImg, rarity: "rare" },
  boss_kappa: { id: "boss_kappa", title: "Kappa Outwitted", titleJP: "河童の敗北", image: kappaImg, rarity: "rare" },
  boss_yukionna: { id: "boss_yukionna", title: "Yuki-onna Thawed", titleJP: "雪女融解", image: yukionnaImg, rarity: "legendary" },
  boss_kamuy: { id: "boss_kamuy", title: "Kamuy's Blessing", titleJP: "カムイの祝福", image: kamuyImg, rarity: "legendary" },
};

export function RecentSpiritsPreview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(new Set());
  const { badges: personalBadges } = usePersonalBadges();

  useEffect(() => {
    loadAchievements(user?.id).then(setUnlocked);
  }, [user?.id]);

  // Merge: personal badges (newest first) + static achievements
  const allSpirits: RecentSpirit[] = [
    ...personalBadges.map((b) => ({
      id: b.id,
      title: b.title,
      titleJP: b.title_jp || "",
      image: b.image_url || "",
      rarity: b.rarity,
    })),
    ...Array.from(unlocked).map((id) => ACHIEVEMENT_MAP[id]).filter(Boolean),
  ];

  const latest3 = allSpirits.slice(0, 3);
  const totalCount = allSpirits.length;

  if (latest3.length === 0) {
    return (
      <button
        onClick={() => navigate("/bestiary")}
        className="card-interactive w-full p-4 border-2 text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-brush font-bold text-foreground text-sm">Spirit Bestiary</h3>
            <p className="text-xs text-muted-foreground serif-jp">Complete lessons to unlock spirits</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("/bestiary")}
      className="card-interactive w-full p-4 border-2 text-left"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-brush font-bold text-foreground text-sm">Spirit Bestiary</h3>
          <span className="text-[10px] text-muted-foreground serif-jp">{totalCount} spirits</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary font-brush">
          <span>View all</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* 3 spirit thumbnails */}
      <div className="flex gap-3">
        {latest3.map((spirit) => (
          <div key={spirit.id} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "w-14 h-14 md:w-16 md:h-16 rounded-sm border-2 overflow-hidden bg-card flex items-center justify-center",
                rarityBorderClass[spirit.rarity] || "border-border",
                rarityGlowClass[spirit.rarity] || ""
              )}
            >
              {spirit.image ? (
                <img src={spirit.image} alt={spirit.title} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xl serif-jp text-muted-foreground">霊</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground serif-jp text-center leading-tight truncate w-full">
              {spirit.titleJP || spirit.title}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}
