/**
 * Yokai Journey — narrative grouping of the 50 Minna no Nihongo lessons
 * into 5 regions of feudal Japan. Each region has a guardian yokai whose
 * boss-quiz unlocks once all the region's lessons are completed.
 */
export interface YokaiBossDialogue {
  /** Spoken when the encounter begins. */
  intro: string;
  /** Spoken when the user takes a hit (gets a wrong answer). */
  taunt: string[];
  /** Spoken when the user lands a hit (correct answer). */
  praise: string[];
  /** Spoken on victory. */
  defeat: string;
  /** Spoken on defeat (user runs out of health). */
  victory: string;
}

export interface JourneyRegion {
  id: string;
  /** English region name */
  name: string;
  /** Japanese name */
  nameJp: string;
  /** Lesson IDs that belong to this region (inclusive). */
  lessonIds: number[];
  /** Guardian yokai boss */
  yokai: {
    name: string;
    nameJp: string;
    /** Single-line atmospheric description shown on the map. */
    tagline: string;
    /** Long-form lore for the boss intro screen. */
    lore: string;
    emoji: string;
    /** Achievement id awarded on victory. */
    achievementId:
      | "boss_bakeneko"
      | "boss_tengu"
      | "boss_kappa"
      | "boss_yukionna"
      | "boss_kamuy";
    /** Themed combat dialogue. */
    dialogue: YokaiBossDialogue;
  };
  /** Sumi-e mood / cultural anchor */
  flavor: string;
  /** Approximate position on the SVG map (% of viewBox 0-100). */
  pos: { x: number; y: number };
}

export const journeyRegions: JourneyRegion[] = [
  {
    id: "edo",
    name: "Edo",
    nameJp: "江戸",
    lessonIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    yokai: {
      name: "Bakeneko of the Lantern District",
      nameJp: "化け猫",
      tagline: "A two-tailed cat haunts the paper lanterns of Nihonbashi.",
      lore: "In old Edo, cats that lived past their thirteenth year were said to grow a second tail and learn to dance on their hind legs. The Bakeneko of the lantern district tests travellers with riddles before letting them pass over the wooden bridges.",
      emoji: "🐱",
    },
    flavor: "Wooden bridges, river boats, the bustling shogunate city.",
    pos: { x: 65, y: 55 },
  },
  {
    id: "kyoto",
    name: "Kyoto",
    nameJp: "京都",
    lessonIds: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    yokai: {
      name: "Tengu of Mount Kurama",
      nameJp: "鞍馬天狗",
      tagline: "A long-nosed mountain spirit guards the temple paths.",
      lore: "On Kurama-yama, north of Kyoto, the legendary Sōjōbō trains warriors in swordsmanship and the secret arts. He is patient with humble students and merciless with the proud — your grammar had better be sharp.",
      emoji: "👺",
    },
    flavor: "Vermillion torii, moss gardens, the imperial heart of old Japan.",
    pos: { x: 47, y: 60 },
  },
  {
    id: "kyushu",
    name: "Kyushu",
    nameJp: "九州",
    lessonIds: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    yokai: {
      name: "Kappa of the Chikugo River",
      nameJp: "河童",
      tagline: "A turtle-shelled river imp wagers cucumbers and grammar.",
      lore: "Kappa live in the rivers of Kyushu and love sumo wrestling. Bow to one and it will bow back — spilling the water from its head-dish and losing all power. They adore cucumbers and conjugated verbs in equal measure.",
      emoji: "🐢",
    },
    flavor: "Volcanic islands, hot springs, southern dialects and trade ports.",
    pos: { x: 22, y: 78 },
  },
  {
    id: "tohoku",
    name: "Tōhoku",
    nameJp: "東北",
    lessonIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    yokai: {
      name: "Yuki-onna of the Snow Country",
      nameJp: "雪女",
      tagline: "A pale woman drifts through the blizzard, breath of frost.",
      lore: "In the deep snows of Tōhoku she appears to lone travellers — beautiful, silent, deadly to the unkind. Show warmth in your heart and your verbs, and she will let you walk on through the white silence.",
      emoji: "❄️",
    },
    flavor: "Apple orchards, lacquered bowls, the snow-bound rice country.",
    pos: { x: 75, y: 32 },
  },
  {
    id: "hokkaido",
    name: "Hokkaidō",
    nameJp: "北海道",
    lessonIds: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    yokai: {
      name: "Kamuy Spirit of the Northern Forests",
      nameJp: "カムイ",
      tagline: "An Ainu bear-god watches the cedar woods of the north.",
      lore: "In the indigenous Ainu tradition of Hokkaidō, kamuy are the divine spirits inhabiting all things — bears, owls, fire, the sea. To pass, you must speak with respect and precision, for the kamuy notice every particle.",
      emoji: "🐻",
    },
    flavor: "Untamed wilderness, the homeland of the Ainu, drift ice and cedars.",
    pos: { x: 80, y: 12 },
  },
];

export function getRegionForLesson(lessonId: number): JourneyRegion | undefined {
  return journeyRegions.find((r) => r.lessonIds.includes(lessonId));
}
