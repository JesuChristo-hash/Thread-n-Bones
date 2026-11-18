import React, { type JSX } from 'react';

// --- Types & Data Definitions ---
export type Tribe = 'No Class' | 'Reptile' | 'Avian' | 'Canine' | 'Hooved' | 'Insect' | 'ALL Classes';
export type CardInstance = any;
export const TRIBE_ICONS: Record<Tribe, string> = {
  'Canine': '🐺',
  'Insect': '🕷️',
  'Avian': '🦅',
  'Reptile': '🦎',
  'Hooved': '🦌',
  'ALL Classes': '✨',
  'No Class': ''
};

export interface CardDef {
  wasPlayedThisDuel?: boolean;
  battlesPlayed?: number;
  id?: string;
  name: string;
  class: Tribe;
  attack: number;
  health: number;
  cost?: number; // Blood cost
  boneCost?: number; // Bone cost
  emoji: string;
  sigils: string[];
  artUrl?: string; // Path or base64 data URI for custom card illustration
  tags?: string[];
  evolvesInto?: string;
  isSacrifice?: boolean;
  unsacrificable?: boolean;
  age?: number;
  sprintDir?: number;
  shieldBroken?: boolean;
  justTookDamage?: boolean;
  animatingStrike?: boolean;
  strikeOffset?: number;
  isDying?: boolean;
  
  // Added for Goobert duplicates
  isGoobertClone?: boolean;
  isMycologistCombined?: boolean;
  isAmalgam?: boolean;

  // Boss & combat mechanics
  isMassive?: boolean;
  hasAttackedThisTurn?: boolean;
}

export interface Totem {
  head: Tribe | null;
  body: string | null;
}

export type GamePhase = 'DRAW' | 'PLAY' | 'COMBAT' | 'ENEMY' | 'SEARCH' | 'GAME_OVER';

export type ScreenState =
  | 'SPLASH'
  | 'DECK_SELECT'
  | 'DRAFT'
  | 'DUEL'
  | 'VIEW_DECK'
  | 'DEV_MENU'
  | 'GAME_OVER'
  | 'EVENT_CROSSROADS'
  | 'EVENT_CAMPFIRE'
  | 'EVENT_ITEMS'
  | 'EVENT_ALTAR'
  | 'EVENT_TOTEM_CARVING'
  | 'EVENT_COST_BARGAIN'
  | 'EVENT_BONE_LORD'
  | 'EVENT_MYCOLOGIST'
  | 'EVENT_GOOBERT'
  | 'EVENT_CAVE_TRIAL'
  | 'EVENT_CARD_CHOICE'
  | 'EVENT_BUILD_TOTEM'
  | 'EVENT_HOARDER_SEARCH';

export interface RunStats {
  bossesDefeated: number;       // x
  scaleDamageDealt: number;     // y
  scaleDamageTaken: number;     // z
  cardsSacrificed: number;      // a
  enemyCardsDestroyed: number;  // b
  grizzlyWallsSurvived: number; // c
  clearedStages: number;        // w
  finalBossesDefeated: number;  // n
}

export type BossType = 'Zealot' | 'The Begotten' | 'BoneLord' | 'The Weaver' | null;

export interface BossCombatState {
  type: BossType;
  phase: number;
  phase1CardsPlayed: number;
  skipNextPlayerTurn: boolean;
  activeDialogue: string | null;
  bgHex: string;
  bgTransitionDuration: number;
  isRitualComplete: boolean;
  ritualEndedVoluntarily: boolean;
  ritualSurrendered?: boolean;
}

// --- Asset Path Helpers ---
export const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
export const discordGif = `${BASE}/assets/text/sidehustle-discord.webp`;

export const toAssetSlug = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]/g, '');

const CARD_ART_SLUG_ALIASES: Record<string, string> = {
  // Disk has oppossum.png, code expects opossum
  opossum: 'oppossum',
  oppossum: 'oppossum',

  // Disk has lammergier.png, code expects lammergeier
  lammergeier: 'lammergier',
  lammergier: 'lammergier',

  // Disk has vulture.png, code expects turkeyvulture
  turkeyvulture: 'vulture',
  vulture: 'vulture',

  // Disk has bee.png for Beehive / Brood
  beehive: 'bee',
  brood: 'bee',
  'house fly': 'maggots',
  housefly: 'maggots',

  // Trade Pelt mappings
  tradepelt: 'pelt',
  pelt: 'pelt',
  harepelt: 'pelt',
};

const ASSET_SESSION_VERSION = Date.now();

export const getCardArtUrl = (card: CardDef): string => {
  if (card.artUrl) return card.artUrl;
  const rawSlug = toAssetSlug(card.name || '');
  if (rawSlug === 'bloodmoon') {
    return `${BASE}/assets/cardbases/blood_moon.webp?v=${ASSET_SESSION_VERSION}`;
  }
  if (CARD_ART_SLUG_ALIASES[rawSlug]) {
    return `${BASE}/assets/cardart/${CARD_ART_SLUG_ALIASES[rawSlug]}.png?v=${ASSET_SESSION_VERSION}`;
  }
  // Strip Fledgling evolution prefixes so art lookup maps to the base creature sprite
  const baseName = (card.name || '').replace(/^(Elder|Greater|God)\s+/i, '');
  const slug = toAssetSlug(baseName);
  const resolvedSlug = CARD_ART_SLUG_ALIASES[slug] || slug;
  return `${BASE}/assets/cardart/${resolvedSlug}.png?v=${ASSET_SESSION_VERSION}`;
};

// Targeted offsets for specific sprites that need bespoke positioning
export const CARD_ART_OFFSETS: Record<string, string> = {
  'Raven': 'translate-y-1 translate-x-1',
  'Wild Bull': 'translate-y-1',
  'Amoeba': '-translate-y-1',
  'Stoat': 'translate-y-1.5 translate-x-1',
};

export const getSigilArtUrl = (sigilName: string): string => {
  return `${BASE}/assets/sigils/${toAssetSlug(sigilName)}.png`;
};

// Exact file registry to handle the mixed .jpg / .png extensions
const ARENA_BACKGROUND_FILES: Record<string, string> = {
  battle1: 'battlebg1.jpg',
  battle2: 'battlebg2.jpg',
  battle3: 'battlebg3.jpg',
  battle4: 'battlebg4.jpg',
  weaver: 'weaverboss.jpg',
  zealot: 'zealotboss.jpg',
  begotten: 'begottenboss.jpg',
  finalboss: 'finalboss.jpg',
  splash: 'splash.jpg',
  deckSelect: 'deck-selection.jpg',
  gameover: 'gameover.jpg',
  draft: 'draft.jpg',
  crossroads: 'crossroads-select.jpg',
  campfire: 'campfireevent.jpg',
  altar: 'altarevent.jpg',
  totemCarving: 'tribeeventbg.jpg',
  costBargain: 'costeventbg.jpg',
  bonelord: 'bonelordevent.jpg',
  trial: 'trialevent.jpg',
  cardChoice: 'choiceevent.jpg',
  weaverEvent: 'weaverevent.jpg',
  merchantEvent: 'merchant_event.jpg',
};

export const getBackgroundUrl = (key: string): string => {
  const filename = ARENA_BACKGROUND_FILES[key] || `${toAssetSlug(key)}.jpg`;
  return `${BASE}/assets/backgrounds/${filename}`;
};

export const getArenaBackground = (stage: number, isBoss: boolean, bossName?: string): string => {
  if (isBoss) {
    const b = (bossName || '').toLowerCase();
    if (b.includes('weaver')) return getBackgroundUrl('weaver');
    if (b.includes('zealot')) return getBackgroundUrl('zealot');
    if (b.includes('begotten')) return getBackgroundUrl('begotten');
    return getBackgroundUrl('finalboss');
  }

  // Standard duel stages cycle battlebg1 through battlebg4
  const bgIndex = ((stage - 1) % 4) + 1;
  return getBackgroundUrl(`battle${bgIndex}`);
};

export const getScreenBgStyle = (filename: string): React.CSSProperties => ({
  backgroundImage: `radial-gradient(circle at 50% 45%, rgba(18, 12, 8, 0.62) 0%, rgba(10, 6, 4, 0.90) 100%), url(${BASE}/assets/backgrounds/${filename})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
});

// --- Sigils Configuration ---
export const SIGIL_MAPPING: Record<string, string> = {
  'Shadow': '🌑',  
  'Airborne': '🕊️',
  'Fecundity': '🌱',
  'Unkillable': '💀',
  'Worthy Sacrifice': '🩸',
  'Bifurcated Strike': '⑂',
  'Trifurcated Strike': '⑆',
  'Mighty Leap': '🛡️',
  'Rabbit Hole': '🕳️',
  'Touch of Death': '☠️',
  'Waterborne': '🌊',
  'Sprinter': '💨',
  'Fledgling': '🐣',
  'Armored': '⚜️',
  'Leader': '🚩',
  'Corpse Eater': '🍖',
  'Bloodlust': '🗡️',
  'Bellist': '🔔',
  'Double Strike': '⚡',
  'Loose Tail': '🦎',
  'Guardian': '🐾',
  'Hefty': '🧱',
  'Burrower': '⛏️',
  'Sharp Quills': '📌',
  'Hoarder': '🔎',
  'Many Lives': '♾️',
  'Morsel': '🍎',
  'Bone King': '👑',
  'Bone Digger': '🦴',
  'Scavenger': '⛏️',
  'Dam Builder': '🏞️',
  'Bees Within': '🐝',
  'Amorphous': '❓',
  'Stinky': '🤢',
  'Ant Spawner': '🐜',
  'Rampager': '🐗',
  'Made of Stone': '🗿',
  'Brittle': '🥀',
  'Tidal Lock': '🪐',
  'Omnistrike': '✴️',
  'Scapegoat': '🐐',
  'Forager': '🌿',
  'Leech': '🩸',
  'Pack-Animal': '🐺',
};

export const SIGIL_DESCRIPTIONS: Record<string, string> = {
  'Airborne': "Strikes directly at the opponent's scale, ignoring opposing creatures unless they have Mighty Leap.",
  'Fecundity': "When played, a copy of this card is added to your hand.",
  'Unkillable': "When this creature perishes or is sacrificed, a copy returns to your hand.",
  'Worthy Sacrifice': "Counts as 3 Blood when sacrificed.",
  'Bifurcated Strike': "Strikes the opposing spaces to the left and right.",
  'Trifurcated Strike': "Strikes the opposing spaces to the left, center, and right.",
  'Mighty Leap': "Blocks opposing Airborne creatures.",
  'Rabbit Hole': "When played, a Rabbit (0/1) is added to your hand.",
  'Touch of Death': "Instantly kills any creature it damages.",
  'Waterborne': "Submerges during the opponent's turn, allowing them to attack over this creature directly.",
  'Sprinter': "Moves to an adjacent empty space at the end of the turn.",
  'Fledgling': "Matures into a stronger form after 1 turn on the board.",
  'Armored': "Negates the first instance of damage taken.",
  'Leader': "Grants +1 Attack to adjacent allied creatures.",
  'Corpse Eater': "If an allied creature perishes in combat, this card enters the board automatically from hand.",
  'Bloodlust': "Gains +1 Attack whenever it kills an opposing creature.",
  'Bellist': "When played, spawns Chimes (0/1) in adjacent empty spaces.",
  'Double Strike': "Strikes the opposing target space an additional time.",
  'Loose Tail': "When attacked, leaves a Tail (0/2) behind and slips into an adjacent space.",
  'Guardian': "When an opposing creature is played opposite an empty slot, leaps to block it.",
  'Hefty': "Moves to an adjacent space at turn end, pushing other creatures in that direction.",
  'Burrower': "When an empty space is attacked, moves to block incoming damage.",
  'Sharp Quills': "Deals 1 damage back to any creature that strikes it.",
  'Hoarder': "When played, allows you to search your deck for any card and draw it.",
  'Many Lives': "Can be sacrificed multiple times without perishing.",
  'Morsel': "When sacrificed, passes its Attack and Health to the next creature played.",
  'Bone King': "Yields 4 Bones instead of 1 when it perishes.",
  'Bone Digger': "Generates 1 Bone at the end of your turn.",
  'Scavenger': "Generates 1 Bone whenever any creature perishes.",
  'Dam Builder': "When played, spawns Dams (0/2) in adjacent empty spaces.",
  'Bees Within': "When struck, adds an Airborne Bee (1/1) to your hand.",
  'Amorphous': "When drawn, morphs into a random sigil.",
  'Stinky': "Reduces the Attack of the opposing creature by 1.",
  'Made of Stone': "Immune to Touch of Death and Stinky debuffs.",
  'Tidal Lock': "Pulls celestial gravity; forces all incoming attacks directly into itself.",
  'Shadow': "Stats are inverted under the Bone Lord's eclipse.",
  'Omnistrike': "Attacks all Creatures in zones. Can only attack directly on an empty board.",
  'Ant Spawner': "When played, a Worker Ant is added to your hand.",
  'Rampager': "Moves to an adjacent space, swapping positions with whatever stands there.",
  'Scapegoat': "Whenever an adjacent allied creature would take lethal damage, this creature intercepts the blow instead, taking the full hit in its place.",
  'Forager': "Whenever this creature deals direct scale damage, draw 1 card from your main deck.",
  'Leech': "Whenever this creature kills an opposing creature, it steals that creature's total Health.",
  'Pack-Animal': "When sacrificed, this card is placed on the bottom of your main deck instead of being discarded, retaining any stat buffs and transferred sigils.",
};

// Base Cards & Tokens
export const TOKEN_SQUIRREL: CardDef = { name: "Squirrel", class: "No Class", attack: 0, health: 1, cost: 0, emoji: "🐿️", isSacrifice: true, sigils: [] };
export const TOKEN_RABBIT: CardDef = { name: "Rabbit", class: "No Class", attack: 0, health: 1, cost: 0, emoji: "🐇", isSacrifice: true, sigils: [] };
export const TOKEN_CHIME: CardDef = { name: "Chime", class: "No Class", attack: 0, health: 1, cost: 0, emoji: "🔔", isSacrifice: false, unsacrificable: true, sigils: [] };
export const TOKEN_DAM: CardDef = { name: "Dam", class: "No Class", attack: 0, health: 2, cost: 0, emoji: "🏠", isSacrifice: false, unsacrificable: true, sigils: [] };
export const TOKEN_TAIL: CardDef = { name: "Tail", class: "No Class", attack: 0, health: 2, cost: 0, emoji: "🦎", isSacrifice: false, unsacrificable: true, sigils: [] };
export const TOKEN_VERTIBRAE: CardDef = { name: "Vertibrae", class: "No Class", attack: 0, health: 1, cost: 0, emoji: "🦴", isSacrifice: false, unsacrificable: true, sigils: [] };
// Maps each tutorial rule directly to its spatial UI anchor on the tabletop
export const getTutorialDialoguePosition = (message: string | null): string => {
  if (!message) return 'fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md';

  // 1. Above Player Hand
  if (
    message.includes('Squirrels are free') ||
    message.includes('Sacrifice cards in play')
  ) {
    return 'fixed bottom-40 sm:bottom-48 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto max-w-sm z-50';
  }

  // 2. Above Enemy Card (Coyote in Lane 1)
  if (message.includes('Opposed cards clash')) {
    return 'fixed top-24 sm:top-32 left-1/2 -translate-x-1/2 sm:-translate-x-[62%] w-[88%] sm:w-auto max-w-xs sm:max-w-sm z-50';
  }

  // 3. Right Side of Blood Runnel (The Scale)
  if (message.includes('Take blood from your opponent')) {
    return 'fixed top-20 sm:top-28 right-2 sm:right-6 md:right-10 w-[85%] sm:w-auto max-w-xs z-50';
  }

  // 4. Above Bones Counter (Lower-right flank)
  if (message.includes('Bones build up')) {
    return 'fixed bottom-48 sm:bottom-56 right-4 sm:right-10 md:right-14 w-[85%] sm:w-auto max-w-xs z-50';
  }

  // 5. Over Turn End Button (Commit Talisman Plinth)
  if (message.includes('Commit to your actions')) {
    return 'fixed bottom-36 sm:bottom-44 left-4 sm:left-10 md:left-16 w-[85%] sm:w-auto max-w-xs z-50';
  }

  // 6. Over Enemy Back Row (Enemy Queue)
  if (message.includes('Enemy cards will move in')) {
    return 'fixed top-12 sm:top-16 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto max-w-sm z-50';
  }

  // 7. On Player Turn 2 Start (Above Draw Decks)
  if (message.includes('Draw from only one deck')) {
    return 'fixed bottom-44 sm:bottom-52 right-4 sm:right-10 md:right-14 w-[85%] sm:w-auto max-w-xs z-50';
  }

  return 'fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50';
};
// --- Weaver's Needlework: Tribal Embroidered Patches ---
export const TRIBE_EMBROIDERY: Record<string, JSX.Element> = {
  Canine: (
    <svg className="w-5 h-5 mx-auto text-amber-200" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 5l3 4 5-2 5 2 3-4-2 9-3 3-3-1-3 1-3-3L4 5zm5 11l3 3 3-3H9z" />
      <circle cx="8" cy="11" r="1" fill="#140d08" />
      <circle cx="16" cy="11" r="1" fill="#140d08" />
    </svg>
  ),
  Avian: (
    <svg className="w-5 h-5 mx-auto text-amber-200" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l2 4 6-2-4 6 5 2-7 4-2 4-2-4-7-4 5-2-4-6 6 2 2-4z" />
      <circle cx="12" cy="10" r="1.5" fill="#140d08" />
    </svg>
  ),
  Insect: (
    <svg className="w-5 h-5 mx-auto text-amber-200" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a3 3 0 00-3 3v1H6l2 3H6l2 3H5l3 3c.5 3 2.5 5 4 6 1.5-1 3.5-3 4-6l3-3h-3l2-3h-2l2-3h-3V5a3 3 0 00-3-3zm-1 6h2v4h-2V8zm0 5h2v4h-2v-4z" />
    </svg>
  ),
  Reptile: (
    <svg className="w-5 h-5 mx-auto text-amber-200" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-3 0-5 2-5 5 0 2 1 3 2 4l-4 4 2 2 4-4c1 1 2 1 3 1s2 0 3-1l4 4 2-2-4-4c1-1 2-2 2-4 0-3-2-5-5-5zm-2 4a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  ),
  Hooved: (
    <svg className="w-5 h-5 mx-auto text-amber-200" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 3l4 4-2 3 3-1 2 3h2l2-3 3 1-2-3 4-4-5 1-2-3-2 3-5-1zm6 10l-1 5 3 3 3-3-1-5h-4z" />
    </svg>
  ),
};
export const TOKEN_PELT: CardDef = { name: "Trade Pelt", class: "No Class", attack: 0, health: 1, cost: 0, emoji: "📜", isSacrifice: false, sigils: [] };
export const TOKEN_BEE: CardDef = { name: "Bee", class: "Insect", attack: 1, health: 1, cost: 0, emoji: "🐝", isSacrifice: false, sigils: ["Airborne"] };
export const CARD_STONE_WALL: CardDef = { id: 'stone_wall', name: 'Stone Wall', class: 'No Class', attack: 0, health: 4, cost: 0, boneCost: 0, emoji: '🏔️', sigils: ["Made of Stone"], unsacrificable: true };
export const CARD_FELLED_TREE: CardDef = { id: 'felled_tree', name: 'Felled Tree', class: 'No Class', attack: 0, health: 3, cost: 0, boneCost: 0, emoji: '🌳', sigils: ["Mighty Leap"], unsacrificable: true };
export const CARD_GRIZZLY: CardDef = { name: "Grizzly", class: "No Class", attack: 4, health: 6, cost: 3, emoji: "🐻", sigils: ["Mighty Leap"] };

export const MAIN_DECK_POOL: CardDef[] = [
  { name: "Amoeba", class: "No Class", attack: 1, health: 2, boneCost: 2, emoji: "🦠", sigils: ["Amorphous"] },
  { name: "Stoat", class: "No Class", attack: 1, health: 3, cost: 1, emoji: "🦦", sigils: [] },
  { name: "Bullfrog", class: "Reptile", attack: 1, health: 2, cost: 1, emoji: "🐸", sigils: ["Mighty Leap"] },
  { name: "Skink", class: "Reptile", attack: 1, health: 2, cost: 1, emoji: "🦎", sigils: ["Loose Tail"] },
  { name: "Sparrow", class: "Avian", attack: 1, health: 2, cost: 1, emoji: "🐦", sigils: ["Airborne"] },
  { name: "Warren", class: "No Class", attack: 0, health: 2, cost: 1, emoji: "🕳️", sigils: ["Rabbit Hole"] },
  { name: "Mantis", class: "Insect", attack: 1, health: 1, cost: 1, emoji: "🦗", sigils: ["Bifurcated Strike"] },
  { name: "Mantiseater", class: "Insect", attack: 1, health: 1, cost: 1, emoji: "👁️", sigils: ["Trifurcated Strike"] },
  { name: "Black Goat", class: "Hooved", attack: 0, health: 1, cost: 1, emoji: "🐐", sigils: ["Worthy Sacrifice"] },
  { name: "Worker Ant", class: "Insect", attack: 0, health: 2, cost: 1, emoji: "🐜", tags: ["Ant"], sigils: [] },
  { name: "Wolf", class: "Canine", attack: 3, health: 2, cost: 2, emoji: "🐺", sigils: [] },
  { name: "Raven", class: "Avian", attack: 2, health: 3, cost: 2, emoji: "🐦‍⬛", sigils: ["Airborne"] },
  { name: "Dire Wolf Pup", class: "Canine", attack: 1, health: 1, cost: 2, emoji: "🐶", sigils: ["Fledgling", "Bone Digger"], evolvesInto: "Dire Wolf" },
  { name: "Wild Bull", class: "Hooved", attack: 3, health: 2, cost: 2, emoji: "🐂", sigils: ["Rampager"] },
  { name: "Mud Turtle", class: "Reptile", attack: 2, health: 2, cost: 2, emoji: "🐢", sigils: ["Armored"] },
  { name: "Hodag", class: "Canine", attack: 1, health: 4, cost: 2, emoji: "👹", sigils: ["Bloodlust"] },
  { name: "The Daus", class: "Hooved", attack: 2, health: 2, cost: 2, emoji: "🐖", sigils: ["Bellist"] },
  { name: "Elk", class: "Hooved", attack: 2, health: 4, cost: 2, emoji: "🦌", sigils: ["Sprinter"] },
  { name: "Pronghorn", class: "Hooved", attack: 1, health: 3, cost: 2, emoji: "🦌", sigils: ["Sprinter", "Bifurcated Strike"] },
  { name: "River Snapper", class: "Reptile", attack: 1, health: 6, cost: 2, emoji: "🐢", sigils: ["Scapegoat"] },
  { name: "Bloodhound", class: "Canine", attack: 2, health: 3, cost: 2, emoji: "🐕", sigils: ["Guardian"] },
  { name: "Field Mice", class: "No Class", attack: 2, health: 2, cost: 2, emoji: "🐁", sigils: ["Fecundity"] },
  { name: "Adder", class: "Reptile", attack: 1, health: 1, cost: 2, emoji: "🐍", sigils: ["Touch of Death"] },
  { name: "Ant Queen", class: "Insect", attack: 0, health: 3, cost: 2, emoji: "👑", tags: ["Ant"], sigils: ["Ant Spawner"] },
  { name: "Grizzly", class: "No Class", attack: 4, health: 6, cost: 3, emoji: "🐻", sigils: [] },
  { name: "Moose Buck", class: "Hooved", attack: 3, health: 7, cost: 3, emoji: "🦌", sigils: ["Hefty"] },
  { name: "Dire Wolf", class: "Canine", attack: 2, health: 5, cost: 3, emoji: "🐺", sigils: ["Double Strike"] },
  { name: "Great White", class: "No Class", attack: 4, health: 2, cost: 3, emoji: "🦈", sigils: ["Waterborne"] },
  { name: "Opossum", class: "No Class", attack: 1, health: 1, boneCost: 2, emoji: "🐀", sigils: [] },
  { name: "Coyote", class: "Canine", attack: 2, health: 1, boneCost: 4, emoji: "🐺", sigils: ["Pack-Animal"] },
  { name: "Cockroach", class: "Insect", attack: 1, health: 1, boneCost: 4, emoji: "💀", sigils: ["Unkillable"] },
  { name: "Rattler", class: "Reptile", attack: 3, health: 2, boneCost: 5, emoji: "🐍", sigils: [] },
  { name: "Alpha", class: "Canine", attack: 1, health: 2, boneCost: 4, emoji: "🐺", sigils: ["Leader"] },
  { name: "House Fly", class: "Insect", attack: 1, health: 2, boneCost: 4, emoji: "🐛", sigils: ["Corpse Eater"] },
  { name: "Wolverine", class: "No Class", attack: 1, health: 3, boneCost: 4, emoji: "🦡", sigils: ["Bloodlust"] },
  { name: "Demon Elk", class: "Hooved", attack: 1, health: 2, boneCost: 4, emoji: "🦌", sigils: ["Sprinter", "Touch of Death"] },
  { name: "Geck", class: "Reptile", attack: 1, health: 1, cost: 0, emoji: "🦎", sigils: [] },
  { name: "Magpie", class: "Avian", attack: 1, health: 1, cost: 2, emoji: "🦉", sigils: ["Airborne", "Hoarder"] },
  { name: "Mole", class: "No Class", attack: 0, health: 4, cost: 1, emoji: "🐹", sigils: ["Burrower"] },
  { name: "Porcupine", class: "No Class", attack: 1, health: 2, cost: 1, emoji: "🦔", sigils: ["Sharp Quills"] },
  { name: "Cat", class: "No Class", attack: 0, health: 1, cost: 1, emoji: "🐈", sigils: ["Many Lives"] },
  { name: "Mealworm", class: "Insect", attack: 0, health: 2, boneCost: 2, emoji: "🦋", sigils: ["Morsel"] },
  { name: "Rat King", class: "No Class", attack: 2, health: 1, cost: 2, emoji: "🐀", sigils: ["Bone King"] },
  { name: "Raccoon", class: "No Class", attack: 1, health: 1, boneCost: 3, emoji: "🦝", sigils: ["Forager"] },
  { name: "Beaver", class: "No Class", attack: 1, health: 3, cost: 2, emoji: "🚪", sigils: ["Dam Builder"] },
  { name: "Elk Fawn", class: "Hooved", attack: 1, health: 1, cost: 1, emoji: "🦌", sigils: ["Sprinter", "Fledgling"], evolvesInto: "Elk" },
  { name: "Flying Ant", class: "Insect", attack: 0, health: 1, cost: 1, emoji: "🐜", tags: ["Ant"], sigils: ["Airborne"] },
  { name: "Brood", class: "Insect", attack: 0, health: 2, cost: 1, emoji: "🍯", sigils: ["Bees Within"] },
  { name: "Tadpole", class: "Reptile", attack: 0, health: 1, cost: 0, emoji: "🐟", sigils: ["Waterborne", "Fledgling"], evolvesInto: "Bullfrog" },
  { name: "Ouroboros", class: "Reptile", attack: 1, health: 1, cost: 2, emoji: "🐉", sigils: ["Unkillable"] },
  { name: "Bat", class: "No Class", attack: 2, health: 1, boneCost: 4, emoji: "🦇", sigils: ["Airborne"] },
  { name: "Amalgam", class: "ALL Classes", attack: 3, health: 3, cost: 2, emoji: "🧬", sigils: [] },
  { name: "Lammergeier", class: "Avian", attack: 0, health: 4, cost: 3, emoji: "🦅", sigils: ["Airborne"] },
  { name: "River Otter", class: "No Class", attack: 1, health: 1, cost: 1, emoji: "🦦", sigils: ["Waterborne", "Forager"] },
  { name: "Turkey Vulture", class: "Avian", attack: 3, health: 3, boneCost: 6, emoji: "🦃", sigils: ["Airborne"] },
  { name: "Wolf Cub", class: "Canine", attack: 1, health: 1, cost: 1, emoji: "🐾", sigils: ["Fledgling"], evolvesInto: "Wolf" },
  { name: "Skunk", class: "No Class", attack: 0, health: 3, cost: 1, emoji: "🦨", sigils: ["Stinky"] },
  // --- NEW CARDS ---
  { name: "Capybara", class: "No Class", attack: 0, health: 4, cost: 1, emoji: "🦫", sigils: ["Scapegoat"] },
  { name: "Stallion", class: "Hooved", attack: 2, health: 3, cost: 2, emoji: "🐎", sigils: ["Sprinter"] },
  { name: "Caiman", class: "Reptile", attack: 2, health: 1, cost: 2, emoji: "🐢", sigils: ["Leech"] },
  { name: "Killer Whale", class: "No Class", attack: 3, health: 1, cost: 2, emoji: "🐋", sigils: ["Waterborne", "Rampager"] },
  { name: "Goose", class: "Avian", attack: 2, health: 1, cost: 1, emoji: "🪿", sigils: ["Bloodlust", "Sprinter"] },
  { name: "Arachnid", class: "Insect", attack: 1, health: 2, cost: 0, boneCost: 5, emoji: "🕷️", sigils: ["Brittle"] },
  { name: "Kraken", class: "No Class", attack: 3, health: 1, cost: 0, boneCost: 8, emoji: "🦑", sigils: ["Waterborne", "Bifurcated Strike"] },
  { name: "Scorpion", class: "Insect", attack: 1, health: 1, cost: 0, boneCost: 6, emoji: "🦂", sigils: ["Touch of Death"] },
  { name: "Tsuchinoko", class: "Reptile", attack: 1, health: 1, boneCost: 2, emoji: "🐍", sigils: ["Worthy Sacrifice"] },
  { name: "Red Stray", class: "Canine", attack: 1, health: 2, cost: 1, emoji: "🐕", sigils: ["Bone King"] },
  { name: "Red Hound", class: "Canine", attack: 2, health: 3, cost: 2, emoji: "🐕", sigils: ["Bone Digger"] },
  { name: "Red Behemoth", class: "Canine", attack: 3, health: 9, cost: 3, emoji: "🐕", sigils: ["Bone Digger", "Hefty"] },
  { name: "Red Colossus", class: "Canine", attack: 4, health: 13, cost: 4, emoji: "🐕", sigils: ["Leech", "Hefty"] },
  { name: "Jackal", class: "Canine", attack: 1, health: 3, boneCost: 4, emoji: "🐺", sigils: ["Pack-Animal", "Corpse Eater"] },
  { name: "Armadillo", class: "No Class", attack: 0, health: 3, boneCost: 3, emoji: "🛡️", sigils: ["Armored", "Sharp Quills"] },
  { name: "Cicada", class: "Insect", attack: 2, health: 1, boneCost: 3, emoji: "🦗", sigils: ["Airborne", "Brittle"] },
  { name: "Silkworm", class: "Insect", attack: 0, health: 1, cost: 0, emoji: "🐛", sigils: ["Fledgling"], evolvesInto: "Silken Moth" },
  { name: "Silken Moth", class: "Insect", attack: 2, health: 1, cost: 0, emoji: "🐛", sigils: ["Airborne"] },
  { name: "Hyphae", class: "No Class", attack: 0, health: 2, cost: 0, emoji: "🍄", sigils: ["Morsel", "Fledgling"], evolvesInto: "Mycelium" },
  { name: "Mycelium", class: "No Class", attack: 1, health: 3, cost: 0, emoji: "🍄", sigils: ["Stinky", "Rampager"] }
];

export const ALL_CARD_LOOKUP: Record<string, CardDef> = {
  "Squirrel": TOKEN_SQUIRREL,
  "Rabbit": TOKEN_RABBIT,
  "Chime": TOKEN_CHIME,
  "Dam": TOKEN_DAM,
  "Tail": TOKEN_TAIL,
  "Vertibrae": TOKEN_VERTIBRAE,
  "Trade Pelt": TOKEN_PELT,
  "Bee": TOKEN_BEE,
  "Stone Wall": CARD_STONE_WALL,
  "Felled Tree": CARD_FELLED_TREE,
};

// --- Custom Items & Item Token Definitions ---
export const CARD_FLAMING_SKELETON: CardDef = {
  id: 'flaming_skeleton',
  name: 'Flaming Skeleton',
  class: 'No Class',
  attack: 3,
  health: 1,
  cost: 0,
  boneCost: 0,
  emoji: '🔥',
  sigils: []
};

export type ItemId =
  | 'magical_hat'
  | 'bone_lords_horn'
  | 'joker_stamp'
  | 'large_matchbook'
  | 'coin_purse'
  | 'bronze_crucifix'
  | 'loaded_die'
  | 'bronze_acorn';

export interface ItemDef {
  id: ItemId;
  name: string;
  emoji: string;
  description: string;
}

export const ALL_ITEMS: Record<ItemId, ItemDef> = {
  magical_hat: {
    id: 'magical_hat',
    name: 'Magical Hat',
    emoji: '🎩',
    description: '50% chance to summon a Rabbit to hand, or crush a player slot with a Stone Wall.'
  },
  bone_lords_horn: {
    id: 'bone_lords_horn',
    name: "Bone Lord's Horn",
    emoji: '📯',
    description: 'Evolves all allied creatures into their tribal skeletal equivalents.'
  },
  joker_stamp: {
    id: 'joker_stamp',
    name: 'Joker Stamp',
    emoji: '🃏',
    description: 'Submerges an enemy front-row card: replaces sigils with Waterborne, sets stats to 0/1.'
  },
  large_matchbook: {
    id: 'large_matchbook',
    name: 'Large Matchbook',
    emoji: '🔥',
    description: 'Incinerates an enemy card and inflicts lingering Burn on opposing lanes.'
  },
  coin_purse: {
    id: 'coin_purse',
    name: 'Coin Purse',
    emoji: '💰',
    description: 'Provides +4 Bones. The Zealot might trade for it in Phase 2.'
  },
  bronze_crucifix: {
    id: 'bronze_crucifix',
    name: 'Bronze Crucifix',
    emoji: '✝️',
    description: 'Bypasses Bone Lord phases or dims the Blood Moon.'
  },
  loaded_die: {
    id: 'loaded_die',
    name: 'Loaded Die',
    emoji: '🎲',
    description: 'Roll to draw cards from chosen deck. Beware rolling a five.'
  },
  bronze_acorn: {
    id: 'bronze_acorn',
    name: 'Bronze Acorn',
    emoji: '🌰',
    description: 'Infuses all Squirrels with +1 Power and +1 Health for this duel.'
  }
};

MAIN_DECK_POOL.forEach(c => {
  ALL_CARD_LOOKUP[c.name] = c;
});

export const BOSS_EXCLUSIVE_CARDS: CardDef[] = [
  { name: "Skeleton", class: "No Class", attack: 1, health: 1, emoji: "💀", sigils: ["Brittle"] },
  { name: "Geist", class: "No Class", attack: 0, health: 7, emoji: "👻", sigils: ["Burrower", "Fledgling"], evolvesInto: "Ghast" },
  { name: "Ghast", class: "No Class", attack: 3, health: 9, emoji: "🌫️", sigils: ["Airborne", "Brittle"] },
  { name: "Skeleton Canine", class: "Canine", attack: 2, health: 2, emoji: "🦴", sigils: ["Double Strike"] },
  { name: "Exoskeleton", class: "Insect", attack: 1, health: 1, emoji: "🦂", sigils: ["Trifurcated Strike", "Brittle"] },
  { name: "Tortoise Shell", class: "Reptile", attack: 1, health: 2, emoji: "🐢", sigils: ["Waterborne"] },
  { name: "Anubis", class: "No Class", attack: 1, health: 4, emoji: "⚰️", sigils: ["Bifurcated Strike"] },
  { name: "Reaper", class: "Avian", attack: 4, health: 1, emoji: "⌛", sigils: ["Stinky", "Airborne"] },
  { name: "BLOOD MOON", class: "No Class", attack: 2, health: 80, emoji: "🌑", sigils: ["Mighty Leap", "Made of Stone", "Omnistrike", "Tidal Lock", "Stinky"], isMassive: true }
];

BOSS_EXCLUSIVE_CARDS.forEach(c => {
  ALL_CARD_LOOKUP[c.name] = c;
});
// Pre-warm memory cache for background plates and card art
const PRELOAD_BACKGROUND_FILES = [
  'splash.jpg',
  'deck-selection.jpg',
  'gameover.jpg',
  'draft.jpg',
  'crossroads-select.jpg',
  'campfireevent.jpg',
  'altarevent.jpg',
  'tribeeventbg.jpg',
  'costeventbg.jpg',
  'bonelordevent.jpg',
  'weaverevent.jpg',
  'trialevent.jpg',
  'choiceevent.jpg',
  'merchant_event.jpg',
];

const preloadAssetUrl = (url: string): Promise<void> => {
  return new Promise(resolve => {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
};

export const preloadCoreAssets = async () => {
  // 1. Prioritize splash background first so title screen renders immediately
  await preloadAssetUrl(`${BASE}/assets/backgrounds/splash.jpg`);

  // 2. Preload lightweight card sprites (skip 9MB blood_moon.gif until final boss)
  const cardUrls = Array.from(
    new Set(
      Object.values(ALL_CARD_LOOKUP)
        .filter(card => card.name !== 'BLOOD MOON')
        .map(card => getCardArtUrl(card))
        .filter((url): url is string => Boolean(url))
    )
  );

  for (let i = 0; i < cardUrls.length; i += 8) {
    await Promise.all(cardUrls.slice(i, i + 8).map(url => preloadAssetUrl(url)));
  }

  // 3. Trickle heavy event/screen backgrounds one by one so main thread & GPU stay smooth
  for (const f of PRELOAD_BACKGROUND_FILES) {
    if (f === 'splash.png') continue;
    await preloadAssetUrl(`${BASE}/assets/backgrounds/${f}`);
  }
};
export type EvolutionTarget = string | { target: string; chance: number }[];

export const EVOLUTION_MAP: Record<string, EvolutionTarget> = {
  "Tadpole": [
    { target: "Bullfrog", chance: 40 },
    { target: "Mud Turtle", chance: 30 },
    { target: "River Snapper", chance: 15 },
    { target: "Tsuchinoko", chance: 10 },
    { target: "Great White", chance: 5 }
  ],
  "Elk Fawn": "Elk",
  "Dire Wolf Pup": "Dire Wolf",
  "Wolf Cub": "Wolf",
  "Elk": "Moose Buck",
  "Mantis": "Mantiseater",
  "Geist": "Ghast",
  "Cat": "Anubis",
  "Silkworm": "Silken Moth",
  "Hyphae": "Mycelium"
};

// Restricted pool of sigils for Boss totem in Woodcarver Boss
export const WOODCARVER_BOSS_TOTEM_SIGILS: string[] = [
  'Airborne',
  'Burrower',
  'Fledgling',
  'Hefty',
  'Sharp Quills',
  'Waterborne',
  'Bifurcated Strike',
  'Trifurcated Strike',
  'Mighty Leap'
];

// Cards strictly excluded from every enemy's card pool
export const ENEMY_EXCLUDED_CARD_NAMES = new Set([
  'Hodag',
  'Demon Elk',
  'Daus',
  'Magpie',
  'Raccoon',
  'Lammergeier',
  'Ouroboros',
  'Brood',
  'Geck',
  'Cat',
  'Black Goat',
  'Warren',
  'Silkworm',
  'Silken Moth',
  'Hyphae',
  'Mycelium',
  'Tsuchinoko',
  'Red Stray',
  'Red Colossus',
  'Red Behemoth'
]);

export const ENEMY_MAIN_DECK_POOL: CardDef[] = MAIN_DECK_POOL.filter(c => !ENEMY_EXCLUDED_CARD_NAMES.has(c.name));

export const EVENT_EXCLUDED_CARD_NAMES = new Set([
  'Red Stray',
  'Red Hound',
  'Red Behemoth',
  'Red Colossus',
  'Mycelium',
  'Silken Moth'
]);
export const EVENT_CARD_POOL: CardDef[] = MAIN_DECK_POOL.filter(c => !EVENT_EXCLUDED_CARD_NAMES.has(c.name));

export interface BossDialogueSet {
  greetings: string[];
  dismissals: string[];
}

export const BOSS_DIALOGUES: Record<string, BossDialogueSet> = {
  "The Woodcarver": {
    greetings: [
      "The wood speaks to me in whispers... let us see what it carves for you.",
      "Every piece of bark holds a spirit. Do you dare disturb them?",
      "My chisels are sharp, traveler. Let us test the grain of your resolve."
    ],
    dismissals: [
      "The grain was true... you have carved your own destiny today.",
      "My figures crumble to sawdust. Walk on, champion of the woods.",
      "The forest acknowledges your craft. Take your leave in peace."
    ]
  }
};

// Safe ID generator that guarantees strictly unique keys
let cardIdIndex = 1;
export function generateCardId(prefix = 'card'): string {
  return `${prefix}-${Date.now()}-${cardIdIndex++}-${Math.random().toString(36).substring(2, 9)}`;
}

export function cloneCard(def: CardDef, ouroborosBuffs = 0): CardDef {
  if (!def) {
    console.error("cloneCard received undefined card definition");
    return { name: "Void", class: "No Class", attack: 0, health: 1, emoji: "❓", sigils: [] };
  }
  const c: CardDef = JSON.parse(JSON.stringify(def));
  c.id = generateCardId(c.name.toLowerCase().replace(/\s+/g, '-'));
  if (c.name === "Ouroboros" && ouroborosBuffs > 0) {
    // Base stats are already permanently incremented in masterDeck; do not stack on clone
  }
  return c;
}

export function transformAmorphous(card: CardDef): CardDef {
  if (!card) return card;
  if (card.sigils && card.sigils.includes('Amorphous')) {
    const pool = Object.keys(SIGIL_MAPPING).filter(s => s !== 'Amorphous');
    card.sigils = card.sigils.filter(s => s !== 'Amorphous');
    card.sigils.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return card;
}

export function applyPlayerTotem(card: CardDef, activeTotem: Totem): CardDef {
  if (!card || !activeTotem.head || !activeTotem.body) return card;
  if (
    activeTotem.body === 'Fledgling' &&
    ((card as any).hasEvolved || card.name.startsWith('Elder '))
  ) {
    return card;
  }
  if (card.class === activeTotem.head || activeTotem.head === "ALL Classes") {
    if (!card.sigils) card.sigils = [];
    if (!card.sigils.includes(activeTotem.body)) {
      card.sigils = [...card.sigils, activeTotem.body];
    }
  }
  return card;
}
