import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PersonalBadge } from "@/hooks/use-personal-badges";
import { Loader2, X } from "lucide-react";

const rarityHankoChar: Record<string, string> = {
  uncommon: "中",
  rare: "上",
  legendary: "極",
};

const rarityLabel: Record<string, string> = {
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
};

const tierLabel: Record<number, string> = {
  1: "Bronze Stumble",
  2: "Silver Spiral",
  3: "Golden Obsession",
};

interface ScrollCardProps {
  badge: PersonalBadge;
  onOpen: () => void;
}

function ScrollCard({ badge, onOpen }: ScrollCardProps) {
  const hanko = rarityHankoChar[badge.rarity] || "霊";

  return (
    <button
      onClick={onOpen}
      className="group relative flex flex-col w-full text-left transition-all duration-300"
    >
      {/* Top dowel bar */}
      <div className="relative h-3 mx-1 bg-gradient-to-b from-foreground/55 to-foreground/35 rounded-[1px] shadow-sm">
        <span className="absolute -left-1 top-0 bottom-0 w-2 bg-foreground/55 rounded-[1px]" />
        <span className="absolute -right-1 top-0 bottom-0 w-2 bg-foreground/55 rounded-[1px]" />
      </div>
      <div className="mx-auto h-1.5 w-px bg-foreground/30" />

      {/* Washi paper scroll body */}
      <div className="washi-card relative aspect-[3/4] flex items-center justify-center p-4 transition-all duration-300 group-hover:translate-y-[-2px]">
        <span
          className="absolute top-2 left-2 inline-flex items-center justify-center w-5 h-5 rounded-[2px] serif-jp text-[10px] font-medium bg-primary text-primary-foreground"
          aria-hidden
        >
          {hanko}
        </span>

        {badge.image_url ? (
          <img
            src={badge.image_url}
            alt={badge.title}
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="serif-jp text-foreground/20 text-7xl select-none">霊</span>
        )}

        <span
          className="absolute bottom-2 right-2 inline-flex items-center justify-center w-4 h-4 rounded-[1px] serif-jp text-[8px] bg-primary/90 text-primary-foreground"
          aria-hidden
        >
          幸
        </span>
      </div>

      {/* Bottom dowel bar */}
      <div className="relative h-2 mx-1 bg-gradient-to-t from-foreground/55 to-foreground/35 rounded-[1px] shadow-sm" />

      {/* Caption */}
      <div className="mt-3 text-center px-1">
        <p className="serif-jp text-xs md:text-sm text-foreground tracking-wide truncate">
          {badge.title}
        </p>
        <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mt-1">
          {rarityLabel[badge.rarity] || badge.rarity}
        </p>
      </div>
    </button>
  );
}

interface DetailModalProps {
  badge: PersonalBadge | null;
  onClose: () => void;
}

function DetailModal({ badge, onClose }: DetailModalProps) {
  if (!badge) return null;
  const hanko = rarityHankoChar[badge.rarity] || "霊";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="washi-card relative max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-sm brush-hover hover:text-background"
          aria-label="Close"
        >
          <X className="w-4 h-4 relative z-10" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] serif-jp text-base font-medium bg-primary text-primary-foreground">
            {hanko}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              {rarityLabel[badge.rarity] || badge.rarity} · Personal Spirit
            </p>
            <p className="text-xs serif-jp text-muted-foreground">
              {tierLabel[badge.tier] || `Tier ${badge.tier}`} · {badge.trigger_detail}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div
            className="w-full md:w-56 aspect-[3/4] flex items-center justify-center bg-card rounded-sm shrink-0"
            style={{ boxShadow: "var(--shadow-md), inset 0 0 0 1px hsl(30 12% 82% / 0.6)" }}
          >
            {badge.image_url ? (
              <img src={badge.image_url} alt={badge.title} className="max-w-full max-h-full object-contain p-2" />
            ) : (
              <span className="serif-jp text-foreground/20 text-8xl">霊</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="serif-jp font-medium text-foreground text-3xl md:text-4xl tracking-wide leading-tight">
              {badge.title}
            </h2>
            {badge.title_jp && (
              <p className="serif-jp text-muted-foreground text-lg mt-1 tracking-wide">
                {badge.title_jp}
              </p>
            )}
            <div className="mt-4 h-px w-20 bg-foreground/40" />
            {badge.description && (
              <p className="text-sm text-foreground/75 mt-4 italic leading-relaxed">
                {badge.description}
              </p>
            )}

            <div className="ink-divider my-6" />
            <p className="text-sm text-foreground leading-relaxed italic">
              "{badge.myth}"
            </p>
            <p className="text-xs text-muted-foreground mt-4 serif-jp tracking-wide">
              — 個人の霊獣伝 · Personal Spirit Legend
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PersonalBadgesSectionProps {
  badges: PersonalBadge[];
  loading: boolean;
  generating: boolean;
}

export function PersonalBadgesSection({ badges, loading, generating }: PersonalBadgesSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (loading && badges.length === 0) {
    return null;
  }

  if (badges.length === 0 && !generating) {
    return null;
  }

  const openBadge = badges.find((b) => b.id === openId) ?? null;

  return (
    <div>
      {/* Section header */}
      <div className="text-center mb-10">
        <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-3">
          Personal Spirits
        </p>
        <h3 className="serif-jp font-medium text-foreground text-3xl md:text-4xl tracking-[0.08em] leading-none">
          個人の霊獣
        </h3>
        <div className="mt-5 mx-auto h-px w-24 bg-foreground/40" />
        <p className="text-xs text-foreground/60 mt-4 max-w-md mx-auto italic tracking-wide">
          Unique spirits born from your learning journey.
        </p>
      </div>

      {generating && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="serif-jp">A new spirit is materializing…</span>
        </div>
      )}

      {/* Sumi-e scroll grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
        {badges.map((badge) => (
          <ScrollCard
            key={badge.id}
            badge={badge}
            onOpen={() => setOpenId(badge.id)}
          />
        ))}
      </div>

      <DetailModal badge={openBadge} onClose={() => setOpenId(null)} />
    </div>
  );
}
