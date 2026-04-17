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

  // Latest spirit gets the spotlight, the next 4 line up alongside.
  const featured = allSpirits[0];
  const supporting = allSpirits.slice(1, 5);
  const totalCount = allSpirits.length;
  const placeholdersNeeded = Math.max(0, 4 - supporting.length);

  if (!featured) {
    return (
      <button
        onClick={() => navigate("/bestiary")}
        aria-label="Open Spirit Bestiary"
        className="group relative w-full overflow-hidden rounded-sm border-2 border-dashed border-border bg-card/40 p-5 text-left transition-all hover:border-primary/50 hover:bg-card/60"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_30%_20%,_hsl(var(--primary))_0%,_transparent_45%),radial-gradient(circle_at_80%_70%,_hsl(var(--foreground))_0%,_transparent_50%)]"
        />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-border bg-background">
            <ScrollText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">妖 · Bestiary</p>
            <h3 className="font-brush text-base font-bold text-foreground">An empty scroll awaits</h3>
            <p className="text-xs text-muted-foreground italic">Finish lessons and quests to summon your first spirit.</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    );
  }

  const featuredRarity = featured.rarity || "common";

  return (
    <button
      onClick={() => navigate("/bestiary")}
      aria-label={`Open Spirit Bestiary — ${totalCount} spirits collected`}
      className="group relative block w-full overflow-hidden rounded-sm border-2 border-border bg-card/60 text-left transition-all hover:border-primary/40 hover:shadow-lg"
    >
      {/* Sumi-e ink wash backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_15%_20%,_hsl(var(--foreground))_0%,_transparent_55%),radial-gradient(circle_at_85%_80%,_hsl(var(--primary))_0%,_transparent_60%)]"
      />

      {/* Header strip */}
      <div className="relative flex items-center justify-between border-b border-border/60 bg-background/40 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-brush text-sm font-bold text-foreground">Spirit Bestiary</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            妖怪図鑑
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-brush text-foreground">
            {totalCount} {totalCount === 1 ? "spirit" : "spirits"}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Body: featured spirit + side rail */}
      <div className="relative grid grid-cols-1 gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] md:p-5">
        {/* Featured spirit */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border-2 bg-background md:h-24 md:w-24",
              rarityBorderClass[featuredRarity] || "border-border",
              rarityGlowClass[featuredRarity] || "",
            )}
          >
            {featured.image ? (
              <img
                src={featured.image}
                alt={featured.title}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : (
              <span className="serif-jp text-2xl text-muted-foreground">霊</span>
            )}
            <span
              className={cn(
                "absolute right-0.5 top-0.5 rounded-sm bg-background/85 px-1 py-0.5 text-[9px] font-brush leading-none backdrop-blur-sm",
                rarityTextClass[featuredRarity] || "text-muted-foreground",
              )}
            >
              {rarityLabel[featuredRarity] || "霊"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Latest awakening
            </p>
            <h3 className="serif-jp truncate text-base font-medium text-foreground md:text-lg">
              {featured.titleJP || featured.title}
            </h3>
            <p className="truncate text-xs italic text-muted-foreground">{featured.title}</p>
            <span
              className={cn(
                "mt-1 inline-block text-[10px] uppercase tracking-[0.24em]",
                rarityTextClass[featuredRarity] || "text-muted-foreground",
              )}
            >
              · {featuredRarity}
            </span>
          </div>
        </div>

        {/* Side rail of recent spirits */}
        <div className="flex items-center gap-2 border-t border-border/40 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          {supporting.map((spirit) => (
            <div
              key={spirit.id}
              title={spirit.title}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border-2 bg-background md:h-12 md:w-12",
                rarityBorderClass[spirit.rarity] || "border-border",
                rarityGlowClass[spirit.rarity] || "",
              )}
            >
              {spirit.image ? (
                <img src={spirit.image} alt={spirit.title} className="h-full w-full object-contain" />
              ) : (
                <span className="serif-jp text-base text-muted-foreground">霊</span>
              )}
            </div>
          ))}
          {Array.from({ length: placeholdersNeeded }).map((_, i) => (
            <div
              key={`ph-${i}`}
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-2 border-dashed border-border/50 bg-background/30 md:h-12 md:w-12"
            >
              <span className="serif-jp text-sm text-muted-foreground/40">?</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
