export type VowId =
  | 'weathered_tablet'
  | 'no_safe_campfire'
  | 'forced_hand'
  | 'thinner_draft'
  | 'heavier_scale_debt'
  | 'empty_satchel'
  | 'swarming_dark'
  | 'blood_famine'
  | 'all_elite_row2'
  | 'too_fast_too_soon';

export interface RitualVowDef {
  id: VowId;
  numeral: string;
  name: string;
  shortTag: string;
  desc: string;
  scoreBonus: number;
}

export const RITUAL_VOWS: RitualVowDef[] = [
  {
    id: 'weathered_tablet',
    numeral: 'I',
    name: 'Weathered Tablet',
    shortTag: 'Eroded Runes',
    desc: 'Unvisited stone map nodes remain obscured as ? until you step adjacent to them.',
    scoreBonus: 10,
  },
  {
    id: 'no_safe_campfire',
    numeral: 'II',
    name: 'Boiling Zeal',
    shortTag: '1 Baptism Only',
    desc: 'The baptismal font extinguishes after a single blessing; second immersions are forbidden.',
    scoreBonus: 25,
  },
  {
    id: 'forced_hand',
    numeral: 'III',
    name: 'Forced Hand',
    shortTag: 'Predestined Path',
    desc: 'Your route across each Act tablet is carved in advance; branching forks are sealed.',
    scoreBonus: 25,
  },
  {
    id: 'thinner_draft',
    numeral: 'IV',
    name: 'Lean Offering',
    shortTag: 'Thinner Draft',
    desc: 'Draft pool shrinks to 5 cards with 1 fewer Pelt trade (Unformed keeps 3 trades).',
    scoreBonus: 30,
  },
  {
    id: 'heavier_scale_debt',
    numeral: 'V',
    name: 'Sanguine Debt',
    shortTag: 'Scale Debt -1',
    desc: 'Begin every duel tipped -1 on the Bleeding Runnel.',
    scoreBonus: 30,
  },
  {
    id: 'empty_satchel',
    numeral: 'VI',
    name: 'Empty Satchel',
    shortTag: 'Barren Satchel',
    desc: 'Begin with no starting relics, and Peddler relics cost 1.5x Blood.',
    scoreBonus: 35,
  },
  {
    id: 'swarming_dark',
    numeral: 'VII',
    name: 'Swarming Dark',
    shortTag: '+1 Foe Queued',
    desc: 'Standard battles draw and queue +1 extra enemy creature.',
    scoreBonus: 35,
  },
  {
    id: 'blood_famine',
    numeral: 'VIII',
    name: 'Blood Famine',
    shortTag: 'Frail Recruits',
    desc: 'Every creature added to your deck after the opening draft enters with -1 Health (min 1).',
    scoreBonus: 40,
  },
  {
    id: 'all_elite_row2',
    numeral: 'IX',
    name: 'Bloodied Vanguard',
    shortTag: 'Cursed Foes',
    desc: 'Every non-boss encounter and every Boss except The Weaver wields an active Effigy.',
    scoreBonus: 45,
  },
  {
    id: 'too_fast_too_soon',
    numeral: 'X',
    name: 'Too Fast, Too Soon',
    shortTag: 'Grizzly Wall',
    desc: 'Every Act Boss Phase 2 opens with a frontline wall of 4/6 Mighty Leap Grizzlies.',
    scoreBonus: 80,
  },
];

export const RITUAL_VOW_MAP: Record<VowId, RitualVowDef> = RITUAL_VOWS.reduce(
  (acc, v) => {
    acc[v.id] = v;
    return acc;
  },
  {} as Record<VowId, RitualVowDef>
);

const SEED_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const normalizeSeed = (raw: string): string => {
  const cleaned = (raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 14);
  return cleaned;
};

export const generateRandomSeed = (): string => {
  let out = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) out += '-';
    out += SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)];
  }
  return out;
};

export const hashSeedString = (str: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 0x9e3779b9;
};

/** Deterministic Mulberry32 PRNG returning [0, 1) */
export const createSeededRng = (seed: string): (() => number) => {
  let state = hashSeedString(seed) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
