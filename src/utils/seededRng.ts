export type VowId =
  | 'no_safe_campfire'
  | 'all_elite_row2'
  | 'thinner_draft'
  | 'heavier_scale_debt';

export interface RitualVowDef {
  id: VowId;
  name: string;
  shortTag: string;
  desc: string;
}

export const RITUAL_VOWS: RitualVowDef[] = [
  {
    id: 'no_safe_campfire',
    name: 'Boiling Zeal',
    shortTag: 'No Safe Campfire',
    desc: 'Even the first blood baptism carries a 35% devour risk.',
  },
  {
    id: 'all_elite_row2',
    name: 'Bloodied Vanguard',
    shortTag: 'All-Elite Row 2',
    desc: 'Every Row 2 battle across all Acts becomes a Totem Elite.',
  },
  {
    id: 'thinner_draft',
    name: 'Lean Offering',
    shortTag: 'Thinner Draft',
    desc: 'Draft pool shrinks to 5 cards with 1 fewer Pelt trade.',
  },
  {
    id: 'heavier_scale_debt',
    name: 'Sanguine Debt',
    shortTag: 'Scale Debt -1',
    desc: 'Begin every duel tipped -1 on the Bleeding Runnel.',
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
