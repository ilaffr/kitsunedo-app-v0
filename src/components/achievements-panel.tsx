import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { loadAchievements, type AchievementId } from "@/hooks/use-achievement";
import { useAuth } from "@/context/AuthContext";
import { usePersonalBadges } from "@/hooks/use-personal-badges";
import { PersonalBadgesSection } from "@/components/personal-badges-section";
import { X } from "lucide-react";
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

const rarityHankoChar: Record<string, string> = {
  common: "初",
  uncommon: "中",
  rare: "上",
  legendary: "極",
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

interface ScrollCardProps {
  def: AchievementDef;
  unlocked: boolean;
  onOpen: () => void;
}

/**
 * Hanging sumi-e scroll card — like the reference grid image.
 * Top + bottom dowel bars, washi paper field, hanko seal in corner.
 */
function ScrollCard({ def, unlocked, onOpen }: ScrollCardProps) {
  return (
    <button
      onClick={onOpen}
      className={cn(
        "group relative flex flex-col w-full text-left transition-all duration-300",
        unlocked ? "opacity-100" : "opacity-55"
      )}
    >
      {/* Top dowel bar */}
      <div className="relative h-3 mx-1 bg-gradient-to-b from-foreground/55 to-foreground/35 rounded-[1px] shadow-sm">
        <span className="absolute -left-1 top-0 bottom-0 w-2 bg-foreground/55 rounded-[1px]" />
        <span className="absolute -right-1 top-0 bottom-0 w-2 bg-foreground/55 rounded-[1px]" />
      </div>
      {/* Suspension cord */}
      <div className="mx-auto h-1.5 w-px bg-foreground/30" />

      {/* Washi paper scroll body */}
      <div
        className={cn(
          "washi-card relative aspect-[3/4] flex items-center justify-center p-4 transition-all duration-300",
          "group-hover:translate-y-[-2px]",
          unlocked ? "" : "grayscale"
        )}
      >
        {/* Hanko seal — corner ginkgo */}
        <span
          className={cn(
            "absolute top-2 left-2 inline-flex items-center justify-center w-5 h-5 rounded-[2px] serif-jp text-[10px] font-medium",
            unlocked ? "bg-primary text-primary-foreground" : "bg-foreground/15 text-foreground/40"
          )}
          aria-hidden
        >
          {rarityHankoChar[def.rarity]}
        </span>

        {/* Spirit illustration */}
        {unlocked ? (
          <img
            src={def.image}
            alt={def.title}
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="serif-jp text-foreground/15 text-7xl select-none">？</span>
        )}

        {/* Bottom hanko — small signature */}
        <span
          className={cn(
            "absolute bottom-2 right-2 inline-flex items-center justify-center w-4 h-4 rounded-[1px] serif-jp text-[8px]",
            unlocked ? "bg-primary/90 text-primary-foreground" : "bg-transparent"
          )}
          aria-hidden
        >
          {unlocked && "幸"}
        </span>
      </div>

      {/* Bottom dowel bar */}
      <div className="relative h-2 mx-1 bg-gradient-to-t from-foreground/55 to-foreground/35 rounded-[1px] shadow-sm" />

      {/* Caption */}
      <div className="mt-3 text-center px-1">
        <p className="serif-jp text-xs md:text-sm text-foreground tracking-wide truncate">
          {unlocked ? def.title : "???"}
        </p>
        <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mt-1">
          {rarityLabel[def.rarity]}
        </p>
      </div>
    </button>
  );
}

interface DetailModalProps {
  def: AchievementDef | null;
  unlocked: boolean;
  onClose: () => void;
}

function DetailModal({ def, unlocked, onClose }: DetailModalProps) {
  if (!def) return null;

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

        {/* Hanko + meta */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className={cn(
              "inline-flex items-center justify-center w-9 h-9 rounded-[2px] serif-jp text-base font-medium",
              unlocked ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-foreground/40"
            )}
          >
            {rarityHankoChar[def.rarity]}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              {rarityLabel[def.rarity]} Spirit
            </p>
            <p className="text-xs serif-jp text-muted-foreground">
              {unlocked ? "解放済み — Unlocked" : "未解放 — Locked"}
            </p>
          </div>
        </div>

        {/* Image + title */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div
            className={cn(
              "w-full md:w-56 aspect-[3/4] flex items-center justify-center bg-card rounded-sm shrink-0",
              !unlocked && "grayscale opacity-50"
            )}
            style={{ boxShadow: "var(--shadow-md), inset 0 0 0 1px hsl(30 12% 82% / 0.6)" }}
          >
            {unlocked ? (
              <img src={def.image} alt={def.title} className="max-w-full max-h-full object-contain p-2" />
            ) : (
              <span className="serif-jp text-foreground/15 text-8xl">？</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="serif-jp font-medium text-foreground text-3xl md:text-4xl tracking-wide leading-tight">
              {unlocked ? def.title : "???"}
            </h2>
            <p className="serif-jp text-muted-foreground text-lg mt-1 tracking-wide">
              {def.titleJP}
            </p>
            <div className="mt-4 h-px w-20 bg-foreground/40" />
            <p className="text-sm text-foreground/75 mt-4 italic leading-relaxed">
              {def.description}
            </p>

            {unlocked ? (
              <>
                <div className="ink-divider my-6" />
                <p className="text-sm text-foreground leading-relaxed italic">
                  "{def.myth}"
                </p>
                <p className="text-xs text-muted-foreground mt-4 serif-jp tracking-wide">
                  — {def.mythSource}
                </p>
              </>
            ) : (
              <>
                <div className="ink-divider my-6" />
                <p className="text-sm text-muted-foreground serif-jp text-center py-4">
                  Complete the challenge to reveal this spirit's myth.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementsPanel() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(new Set());
  const [openId, setOpenId] = useState<AchievementId | null>(null);
  const { badges: personalBadges, loading: personalLoading, generating } = usePersonalBadges();

  useEffect(() => {
    loadAchievements(user?.id).then(setUnlocked);
  }, [user?.id]);

  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const openDef = ACHIEVEMENTS.find((a) => a.id === openId) ?? null;

  return (
    <div>
      {/* Progress strip */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          Yōkai Discovered
        </p>
        <p className="serif-jp text-sm text-foreground">
          {unlockedCount}<span className="text-muted-foreground">／{ACHIEVEMENTS.length}</span>
        </p>
      </div>
      <div className="h-px bg-foreground/15 relative overflow-hidden mb-12 md:mb-16">
        <div
          className="absolute inset-y-0 left-0 bg-foreground transition-all duration-700"
          style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      {/* Sumi-e scroll grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
        {ACHIEVEMENTS.map((def) => (
          <ScrollCard
            key={def.id}
            def={def}
            unlocked={unlocked.has(def.id)}
            onOpen={() => setOpenId(def.id)}
          />
        ))}
      </div>

      {/* Personal Spirits (AI-generated) */}
      <div className="mt-16 md:mt-20">
        <PersonalBadgesSection
          badges={personalBadges}
          loading={personalLoading}
          generating={generating}
        />
      </div>

      {/* Detail modal */}
      <DetailModal
        def={openDef}
        unlocked={openDef ? unlocked.has(openDef.id) : false}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

export { ACHIEVEMENTS };
