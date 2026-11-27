import { ALL_CARD_LOOKUP, SIGIL_MAPPING, cloneCard, CardDef, RunStats } from '../data/gameData';
import { RITUAL_VOW_MAP, VowId } from '../utils/seededRng';

export const isCardNamed = (name: string | undefined, target: string): boolean =>
(name || '').replace(/^Elder\s+/i, '').trim().toLowerCase() === target.toLowerCase();

export const getStageBgClass = (s: number, isBoss: boolean): string => {
if (isBoss) return 'bg-gradient-to-b from-[#26080e] via-[#150508] to-[#080204]';
const cycle = ((s - 1) % 4) + 1;
switch (cycle) {
  case 1: // Stage 1: Deep Woodland Green
    return 'bg-gradient-to-b from-[#0a1611] via-[#08110d] to-[#050a08]';
  case 2: // Stage 2: Murky Wetlands Cyan/Slate
    return 'bg-gradient-to-b from-[#09171b] via-[#061115] to-[#04090c]';
  case 3: // Stage 3: Frigid Snowline Indigo
    return 'bg-gradient-to-b from-[#0f1322] via-[#0a0d18] to-[#060810]';
  case 4: // Stage 4: Dusk Fire Embers
    return 'bg-gradient-to-b from-[#180e18] via-[#110912] to-[#09040a]';
  default:
    return 'bg-gradient-to-b from-[#0a1611] via-[#08110d] to-[#050a08]';
}
};

export const applyBegottenStamp = (card: CardDef, rng: () => number): CardDef => {
  const stamped = cloneCard(card, 0);
  (stamped as any).isGoobertClone = true;
  if (rng() < 0.5) {
    return stamped; // 50% pristine stamp
  }
  const roll = rng();
  if (roll < 0.34) {
    const delta = rng() < 0.5 ? 1 : -1;
    stamped.attack = Math.max(0, (stamped.attack || 0) + delta);
  } else if (roll < 0.67) {
    const delta = rng() < 0.5 ? 1 : -1;
    stamped.health = Math.max(1, (stamped.health || 1) + delta);
  } else {
    const pool = Object.keys(SIGIL_MAPPING).filter(s => s !== 'Amorphous');
    if (pool.length > 0) {
      stamped.sigils = [pool[Math.floor(rng() * pool.length)]];
    }
  }
  return stamped;
};

export const buildStrikeTargets = (lane: number, sigils: string[]): number[] => {
  const hasBifurcated = sigils.includes('Bifurcated Strike');
  const hasTrifurcated = sigils.includes('Trifurcated Strike');
  const hasDouble = sigils.includes('Double Strike');

  let baseTargets: number[] = [];
  if (hasTrifurcated) {
    baseTargets = [lane - 1, lane, lane + 1];
  } else if (hasBifurcated) {
    baseTargets = [lane - 1, lane + 1];
  } else {
    baseTargets = [lane];
  }

  if (hasDouble) {
    const centerIdx = baseTargets.indexOf(lane);
    if (centerIdx !== -1) {
      baseTargets.splice(centerIdx + 1, 0, lane);
    } else {
      baseTargets.splice(1, 0, lane);
    }
  }

  // Boundary Validation: Discard off-board strikes (e.g. left-diagonal from lane 0 or right-diagonal from lane 3)
  // Completely omits off-board attacks from the animation and damage queue
  return baseTargets.filter(t => t >= 0 && t <= 3);
};

export const LEFT_FACING_CARD_NAMES = new Set([
    'alpha',
    'bullfrog',
    'coyote',
    'demon elk',
    'elk',
    'elk fawn',
    'moose buck',
    'mycelium',
    'ouroboros',
    'pronghorn',
    'silkworm',
    'warren',
    'wolfcub',
    'wolf cub',
    'dromedary',
    'elephant',
    'hyena',
    'iguana',
    'maritimus',
    'rhino',
    'bat',
    'dire wolf',
    'direwolf',
    'field mice',
    'fieldmice',
    'hodag',
    'lammergeier',
    'experiment',
  ]);

export const isLeftFacingCard = (name?: string): boolean => {
  if (!name) return false;
  const norm = name.trim().toLowerCase();
  return LEFT_FACING_CARD_NAMES.has(norm) || LEFT_FACING_CARD_NAMES.has(norm.replace(/\s+/g, ''));
};

export const calculateGrade = (
  stats: RunStats,
  activeVows: VowId[] = []
): { letter: string; color: string; score: number; vowBonus: number } => {
  const vowBonus = Array.isArray(activeVows)
    ? activeVows.reduce((sum, id) => sum + (RITUAL_VOW_MAP[id]?.scoreBonus || 0), 0)
    : 0;

  let score =
    Math.round(
      stats.clearedStages * 1.2 +
        stats.bossesDefeated * 16 +
        stats.finalBossesDefeated * 35 +
        stats.enemyCardsDestroyed * 0.25 +
        stats.scaleDamageDealt * 0.12 -
        stats.scaleDamageTaken * 0.75
    ) + vowBonus;

  // Hard rank milestones prior to felling a Final Boss (relaxed slightly per active vow)
  const capRelief = Array.isArray(activeVows) ? activeVows.length * 3 : 0;
  if (stats.finalBossesDefeated === 0) {
    // True God Run condition: cleared all 3 act bosses, took near-zero damage, high overkill
    const isGodRun =
      stats.bossesDefeated >= 3 &&
      stats.scaleDamageTaken <= 3 &&
      stats.scaleDamageDealt >= 60 &&
      score >= 95;

    if (!isGodRun) {
      if (stats.bossesDefeated === 0) {
        score = Math.min(score, 58 + capRelief);
      } else if (stats.bossesDefeated === 1) {
        score = Math.min(score, 74 + capRelief);
      } else {
        // Reached or died at Bone Lord without felling him -> Hard capped at high A
        score = Math.min(score, Math.min(94, 89 + capRelief));
      }
    }
  }

  const rawScore = Math.max(0, score);

  let baseGrade = 'F';
  let color = 'text-red-600';

  if (rawScore >= 95) {
    baseGrade = 'S';
    color = 'text-amber-400';
  } else if (rawScore >= 80) {
    baseGrade = 'A';
    color = 'text-emerald-400';
  } else if (rawScore >= 70) {
    baseGrade = 'B';
    color = 'text-blue-400';
  } else if (rawScore >= 50) {
    baseGrade = 'C';
    color = 'text-neutral-100';
  } else if (rawScore >= 20) {
    baseGrade = 'D';
    color = 'text-orange-500';
  }

  // Plus suffixes strictly require consecutive Final Boss clears (looping rituals)
  let suffix = '';
  if (stats.finalBossesDefeated >= 3) {
    suffix = '++';
  } else if (stats.finalBossesDefeated >= 2) {
    suffix = '+';
  }

  return { letter: `${baseGrade}${suffix}`, color, score: rawScore, vowBonus };
};

export const isStarterDraftEligible = (card: CardDef) => {
  if (card.name === "Trade Pelt" || card.unsacrificable || card.isMassive) return false;

  // Explicit exclusions: Red series, Mycelium, Silken Moth, Geck
  const draftBannedNames = ['Red Stray', 'Red Hound', 'Red Behemoth', 'Red Colossus', 'Mycelium', 'Silken Moth', 'Geck'];
  if (draftBannedNames.includes(card.name)) return false;

  // Restrict cards costing more than 3 blood
  if (card.cost && card.cost > 3) return false;

  // Power cap (attack >= 3) applies unless the card costs 2 or 3 blood
  if (card.cost !== 2 && card.cost !== 3 && card.attack >= 3) return false;

  const bannedSigils = [
    'Bifurcated Strike',
    'Trifurcated Strike',
    'Double Strike',
    'Unkillable',
    'Touch of Death',
  ];
  const cardSigils = (card.sigils || []).map((s: any) => typeof s === 'string' ? s : s?.name || '');
  return !cardSigils.some(s => bannedSigils.includes(s));
};

export const getBaseSigilCount = (cardName: string): number => {
  const base = ALL_CARD_LOOKUP[cardName];
  return base?.sigils ? base.sigils.length : 0;
};

export const hasMoreSigilsThanOriginal = (card: CardDef): boolean => {
  return (card.sigils?.length || 0) > getBaseSigilCount(card.name);
};

export const getBloodToBoneCost = (bloodCost: number): number => {
  if (bloodCost <= 1) return 2;
  if (bloodCost === 2) return 5;
  if (bloodCost === 3) return 7;
  return 8;
};

export const canAnvilBloodToBone = (card: CardDef | null): boolean => {
  if (!card) return false;
  return (card.cost || 0) > 0;
};

export const canAnvilHollow = (card: CardDef | null): boolean => {
  if (!card) return false;
  const blood = card.cost || 0;
  const bone = card.boneCost || 0;
  if (blood === 0 && bone === 0) return true; // No-cost card gains Unkillable
  if (blood >= 2) return true;
  if (blood === 0 && bone >= 2) return true;
  return false; // Already at minimum 1 Blood or 1 Bone
};
