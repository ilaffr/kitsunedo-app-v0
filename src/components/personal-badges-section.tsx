import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PersonalBadge } from "@/hooks/use-personal-badges";
import { Loader2 } from "lucide-react";

const rarityBorderClass: Record<string, string> = {
  uncommon: "border-success/60",
  rare: "border-primary/70",
  legendary: "border-warning",
};

const rarityGlowClass: Record<string, string> = {
  uncommon: "shadow-[0_0_12px_hsl(var(--success)/0.2)]",
  rare: "shadow-[0_0_16px_hsl(var(--primary)/0.25)]",
  legendary: "shadow-[0_0_24px_hsl(var(--warning)/0.35)]",
};

const tierLabel: Record<number, string> = {
  1: "Bronze Stumble",
  2: "Silver Spiral",
  3: "Golden Obsession",
};

const rarityLabel: Record<string, string> = {
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
};

interface PersonalBadgeCardProps {
  badge: PersonalBadge;
  expanded: boolean;
  onToggle: () => void;
}

function PersonalBadgeCard({ badge, expanded, onToggle }: PersonalBadgeCardProps) {
  const border = rarityBorderClass[badge.rarity] || "border-border";
  const glow = rarityGlowClass[badge.rarity] || "";

  return (
    <div
      className={cn("card-paper border-2 overflow-hidden transition-all duration-300 cursor-pointer", border, glow)}
      onClick={onToggle}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Badge image or placeholder */}
        <div
          className={cn(
            "w-16 h-16 rounded-sm border-2 overflow-hidden flex-shrink-0 bg-card flex items-center justify-center",
            border
          )}
        >
          {badge.image_url ? (
            <img src={badge.image_url} alt={badge.title} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl serif-jp text-muted-foreground">霊</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="font-bold serif-jp text-foreground text-sm">{badge.title}</h4>
            {badge.title_jp && (
              <span className="text-xs text-muted-foreground japanese-text">{badge.title_jp}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-snug">{badge.description}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm border",
                badge.rarity === "legendary" && "border-warning text-warning",
                badge.rarity === "rare" && "border-primary text-primary",
                badge.rarity === "uncommon" && "border-success text-success"
              )}
            >
              {rarityLabel[badge.rarity] || badge.rarity}
            </span>
            <span className="text-[10px] text-muted-foreground serif-jp">
              {tierLabel[badge.tier] || `Tier ${badge.tier}`}
            </span>
            <span className="text-[10px] text-muted-foreground">
              · {badge.trigger_detail}
            </span>
          </div>
        </div>

        {/* Expand arrow */}
        <span
          className={cn(
            "text-muted-foreground text-lg transition-transform duration-200 serif-jp",
            expanded && "rotate-180"
          )}
        >
          ▾
        </span>
      </div>

      {/* Myth panel */}
      {expanded && (
        <div className="border-t border-border px-4 pt-4 pb-5 bg-muted/20">
          <div className="ink-divider mb-4" />
          <div className="flex gap-4 items-start">
            {badge.image_url && (
              <img
                src={badge.image_url}
                alt={badge.title}
                className="w-28 h-28 object-contain rounded-sm border border-border flex-shrink-0"
              />
            )}
            <div>
              <p className="text-sm text-foreground leading-relaxed italic">
                "{badge.myth}"
              </p>
              <p className="text-xs text-muted-foreground mt-3 serif-jp">
                — 個人の霊獣伝 · Personal Spirit Legend
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PersonalBadgesSectionProps {
  badges: PersonalBadge[];
  loading: boolean;
  generating: boolean;
}

export function PersonalBadgesSection({ badges, loading, generating }: PersonalBadgesSectionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading && badges.length === 0) {
    return null;
  }

  if (badges.length === 0 && !generating) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="ink-divider mb-4" />

      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold serif-jp text-foreground text-base">Personal Spirits</h3>
        <span className="text-xs text-muted-foreground japanese-text">個人の霊獣</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Unique spirits born from your learning journey.
      </p>

      {generating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="serif-jp">A new spirit is materializing…</span>
        </div>
      )}

      <div className="space-y-3">
        {badges.map((badge) => (
          <PersonalBadgeCard
            key={badge.id}
            badge={badge}
            expanded={expanded === badge.id}
            onToggle={() => setExpanded(expanded === badge.id ? null : badge.id)}
          />
        ))}
      </div>
    </div>
  );
}
