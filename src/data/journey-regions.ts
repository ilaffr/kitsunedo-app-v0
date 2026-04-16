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
      achievementId: "boss_bakeneko",
      dialogue: {
        intro: "Mrrrow… so a little student wishes to cross my bridge? Answer me three riddles, and the lanterns shall light your way.",
        taunt: [
          "Tsk tsk… my second tail twitches at your folly.",
          "Even a kitten knows that one. Try again.",
          "The lanterns dim. Are you afraid?",
        ],
        praise: [
          "Hmph. Not bad, little mouse.",
          "A flicker of cleverness, I see.",
          "Yes… your tongue sharpens.",
        ],
        defeat: "Very well… you have earned passage. Take this whisker as your trophy — and tell no one of our dance.",
        victory: "The lanterns go dark. Perhaps the river will return you to your village… perhaps not.",
      },
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
      achievementId: "boss_tengu",
      dialogue: {
        intro: "Another seeker climbs my mountain. I am Sōjōbō. Show me your verbs — sloppy ones I shall return to you on the wind.",
        taunt: [
          "*fan flutters* Pride blinds the tongue.",
          "A weak particle. Steady your breath.",
          "Even crows speak more clearly than that.",
        ],
        praise: [
          "*nods* Sharp. Like a polished blade.",
          "Hmm. The mountain hears you.",
          "Continue, student.",
        ],
        defeat: "*folds fan* You have climbed well. Take this feather, and remember: the proud descend faster than they ascend.",
        victory: "*turns away* The wind carries you back down the mountain. Train, and return when you are ready.",
      },
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
      achievementId: "boss_kappa",
      dialogue: {
        intro: "Kerokero! A traveller dares the river-bend? Wrestle me with words, and I'll wager three cucumbers!",
        taunt: [
          "Kerokero! My head-dish stays full of water!",
          "You drip mistakes like a leaky bucket.",
          "Even a tadpole knows that one.",
        ],
        praise: [
          "Eee! My dish wobbles!",
          "Kero! A clean strike.",
          "Hmph. Lucky shot, traveller.",
        ],
        defeat: "*bows deeply, water spilling from head-dish* You bowed first… and I bowed back. Take the cucumbers. Take the river's blessing.",
        victory: "*splashes back into the river* Come back when your tongue can hold water, little one!",
      },
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
      achievementId: "boss_yukionna",
      dialogue: {
        intro: "…you speak in this storm? Few do. Speak warmly, traveller. Cold tongues freeze where they stand.",
        taunt: [
          "*the wind sharpens* Your breath grows shallow…",
          "Frost gathers on your collar. Try again.",
          "Silence would have been kinder than that.",
        ],
        praise: [
          "*a faint smile* Warmth, at last.",
          "The snow softens around you.",
          "Yes… you may yet pass.",
        ],
        defeat: "*she dissolves into snowflakes* You have warmed even my breath. Walk on, traveller. The blizzard will not touch you tonight.",
        victory: "*she leans close, breath of ice* Sleep here a while. The snow makes a soft bed…",
      },
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
      achievementId: "boss_kamuy",
      dialogue: {
        intro: "Iyairaikere. The forest listens. Speak each word as though carving it into cedar — for the kamuy hear every grain.",
        taunt: [
          "*a low rumble* The cedars frown.",
          "Particles matter, child of the south.",
          "The river-fish swim cleaner sentences.",
        ],
        praise: [
          "*a slow nod* The forest accepts.",
          "Good. The kamuy listen.",
          "You speak as kin would.",
        ],
        defeat: "*the great bear bows* You are no longer a stranger to these woods. Walk freely. The kamuy remember a respectful tongue.",
        victory: "*turns back to the cedars* Return when you have learned the weight of each word, traveller.",
      },
    },
    flavor: "Untamed wilderness, the homeland of the Ainu, drift ice and cedars.",
    pos: { x: 80, y: 12 },
  },
];

export function getRegionForLesson(lessonId: number): JourneyRegion | undefined {
  return journeyRegions.find((r) => r.lessonIds.includes(lessonId));
}
