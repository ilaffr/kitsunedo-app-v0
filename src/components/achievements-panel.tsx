import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { loadAchievements, type AchievementId } from "@/hooks/use-achievement";
import { useAuth } from "@/context/AuthContext";
import { usePersonalBadges } from "@/hooks/use-personal-badges";
import { PersonalBadgesSection } from "@/components/personal-badges-section";
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

const rarityLabel: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
};

const rarityBorderClass: Record<string, string> = {
  common: "border-border",
  uncommon: "border-success/60",
  rare: "border-primary/70",
  legendary: "border-warning",
};

const rarityGlowClass: Record<string, string> = {
  common: "",
  uncommon: "shadow-[0_0_12px_hsl(var(--success)/0.2)]",
  rare: "shadow-[0_0_16px_hsl(var(--primary)/0.25)]",
  legendary: "shadow-[0_0_24px_hsl(var(--warning)/0.35)]",
};

interface AchievementDef {
  id: AchievementId;
  title: string;
  titleJP: string;
  description: string;
  myth: string;
  mythSource: string;
  image: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_lesson",
    title: "First Scroll",
    titleJP: "最初の巻物",
    description: "Complete your first lesson.",
    myth:
      "The fox spirit Kitsune walked among mortals, learning their language so it could carry wisdom between worlds. Those who open their first scroll are said to walk the same path.",
    mythSource: "狐の伝説 — Fox Legends of Edo",
    image: kitsuneImg,
    rarity: "common",
  },
  {
    id: "perfect_practice",
    title: "Iron Discipline",
    titleJP: "鉄の修行",
    description: "Score a perfect 6/6 on the practice quiz.",
    myth:
      "The Tengu, master of martial arts and ancient lore, bestows its feather upon those who demonstrate flawless precision. A single mistake undoes a thousand strikes.",
    mythSource: "天狗秘伝書 — Secret Tengu Writings",
    image: tenguImg,
    rarity: "rare",
  },
  {
    id: "vocabulary_master",
    title: "Word Weaver",
    titleJP: "言葉の織り手",
    description: "Study all vocabulary in Lesson 1.",
    myth:
      "The Tanuki, great shapeshifter of the mountain, knows that true transformation begins with the mastery of names. To name a thing is to hold its spirit.",
    mythSource: "狸の民話 — Tanuki Folk Tales",
    image: tanukiImg,
    rarity: "uncommon",
  },
  {
    id: "all_grammar",
    title: "Pattern Seeker",
    titleJP: "型の探求者",
    description: "Read all 5 grammar points.",
    myth:
      "Ryūjin, Dragon King of the sea, commands the tide with hidden patterns known only to those who study the deep currents beneath the waves. Grammar is the current of language.",
    mythSource: "竜神の伝説 — Ryūjin Dragon Myths",
    image: ryujinImg,
    rarity: "uncommon",
  },
  {
    id: "streak_3",
    title: "Demon's Resolve",
    titleJP: "鬼の覚悟",
    description: "Study 3 days in a row.",
    myth:
      "Even the fearsome Oni, driven by endless hunger, knows that true power comes not from single burst of fury but from relentless, daily forging of the spirit.",
    mythSource: "鬼の書 — The Oni Codex",
    image: oniImg,
    rarity: "legendary",
  },
  {
    id: "boss_bakeneko",
    title: "Bakeneko Bested",
    titleJP: "化け猫退治",
    description: "Defeat the Bakeneko of Edo's lantern district.",
    myth:
      "She danced on her hind legs beneath the paper lanterns of Nihonbashi and tested travellers with riddles. You answered each one with steady breath, and she let her second tail fall — for now.",
    mythSource: "江戸怪談 — Edo Ghost Tales",
    image: bakenekoImg,
    rarity: "rare",
  },
  {
    id: "boss_tengu",
    title: "Tengu Humbled",
    titleJP: "天狗服従",
    description: "Defeat the Tengu of Mount Kurama.",
    myth:
      "On the misted slopes of Kurama-yama, Sōjōbō tested your verbs with the patience of stone. Pride breaks against his fan, but humble precision makes even a mountain spirit bow.",
    mythSource: "鞍馬天狗譚 — Kurama Tengu Records",
    image: yokaiTenguImg,
    rarity: "rare",
  },
  {
    id: "boss_kappa",
    title: "Kappa Outwitted",
    titleJP: "河童の敗北",
    description: "Defeat the Kappa of the Chikugo River.",
    myth:
      "You bowed first, and the river-imp bowed back — its head-dish spilling, its power undone. The cucumbers it offered now sit beside your scrolls, a strange and slimy honour.",
    mythSource: "九州民話 — Folktales of Kyushu",
    image: kappaImg,
    rarity: "rare",
  },
  {
    id: "boss_yukionna",
    title: "Yuki-onna Thawed",
    titleJP: "雪女融解",
    description: "Defeat the Yuki-onna of the Snow Country.",
    myth:
      "Her breath was winter itself. You answered with warmth in your verbs and respect in your particles, and her pale lips curved — almost — into a smile before she dissolved into the falling snow.",
    mythSource: "東北雪伝説 — Tōhoku Snow Legends",
    image: yukionnaImg,
    rarity: "legendary",
  },
  {
    id: "boss_kamuy",
    title: "Kamuy's Blessing",
    titleJP: "カムイの祝福",
    description: "Receive the blessing of the Kamuy of Hokkaidō.",
    myth:
      "The bear-god of the cedar forests measured every particle you uttered. To pass was not to defeat — it was to be acknowledged as kin. The Ainu say the kamuy never forgets a respectful tongue.",
    mythSource: "アイヌ・ユーカラ — Ainu Yukar Epics",
    image: kamuyImg,
    rarity: "legendary",
  },
];

interface AchievementCardProps {
  def: AchievementDef;
  unlocked: boolean;
  expanded: boolean;
  onToggle: () => void;
}

function AchievementCard({ def, unlocked, expanded, onToggle }: AchievementCardProps) {
  return (
    <div
      className={cn(
        "card-paper border-2 overflow-hidden transition-all duration-300 cursor-pointer",
        rarityBorderClass[def.rarity],
        unlocked ? rarityGlowClass[def.rarity] : "opacity-50 grayscale"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Sumi-e illustration */}
        <div
          className={cn(
            "w-16 h-16 rounded-sm border-2 overflow-hidden flex-shrink-0 bg-card flex items-center justify-center",
            rarityBorderClass[def.rarity]
          )}
        >
          <img
            src={def.image}
            alt={def.title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="font-bold serif-jp text-foreground text-sm">{def.title}</h4>
            <span className="text-xs text-muted-foreground japanese-text">{def.titleJP}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-snug">{def.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm border",
                def.rarity === "legendary" && "border-warning text-warning",
                def.rarity === "rare" && "border-primary text-primary",
                def.rarity === "uncommon" && "border-success text-success",
                def.rarity === "common" && "border-muted-foreground text-muted-foreground"
              )}
            >
              {rarityLabel[def.rarity]}
            </span>
            {unlocked ? (
              <span className="text-[10px] text-success font-medium serif-jp">解放済み — Unlocked</span>
            ) : (
              <span className="text-[10px] text-muted-foreground serif-jp">未解放 — Locked</span>
            )}
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
      {expanded && unlocked && (
        <div className="border-t border-border px-4 pt-4 pb-5 bg-muted/20">
          <div className="ink-divider mb-4" />
          <div className="flex gap-4 items-start">
            <img
              src={def.image}
              alt={def.title}
              className="w-28 h-28 object-contain rounded-sm border border-border flex-shrink-0"
            />
            <div>
              <p className="text-sm text-foreground leading-relaxed italic">
                "{def.myth}"
              </p>
              <p className="text-xs text-muted-foreground mt-3 serif-jp">
                — {def.mythSource}
              </p>
            </div>
          </div>
        </div>
      )}

      {expanded && !unlocked && (
        <div className="border-t border-border px-4 py-4 bg-muted/20 text-center">
          <p className="text-sm text-muted-foreground serif-jp">
            ??? — Complete the challenge to reveal this spirit's myth.
          </p>
        </div>
      )}
    </div>
  );
}

export function AchievementsPanel() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(new Set());
  const [expanded, setExpanded] = useState<AchievementId | null>(null);
  const { badges: personalBadges, loading: personalLoading, generating } = usePersonalBadges();

  useEffect(() => {
    loadAchievements(user?.id).then(setUnlocked);
  }, [user?.id]);

  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;

  return (
    <div className="card-paper border-2 p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold serif-jp text-foreground text-lg">Spirit Bestiary</h3>
        <span className="text-xs text-muted-foreground japanese-text">霊獣図鑑</span>
      </div>
      <p className="text-xs text-muted-foreground mb-1">
        Unlock Japanese spirit myths through your studies.
      </p>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground serif-jp">
          {unlockedCount}/{ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="ink-divider mb-4" />

      {/* Achievement list */}
      <div className="space-y-3">
        {ACHIEVEMENTS.map((def) => (
          <AchievementCard
            key={def.id}
            def={def}
            unlocked={unlocked.has(def.id)}
            expanded={expanded === def.id}
            onToggle={() => setExpanded(expanded === def.id ? null : def.id)}
          />
        ))}
      </div>

      {/* Personal Spirits (AI-generated) */}
      <PersonalBadgesSection
        badges={personalBadges}
        loading={personalLoading}
        generating={generating}
      />
    </div>
  );
}

export { ACHIEVEMENTS };
