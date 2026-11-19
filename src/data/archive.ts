import { ALL_CARD_LOOKUP, SIGIL_DESCRIPTIONS, type CardDef, type RunStats } from './gameData';

export const ARCHIVE_STORAGE_KEY = 'sacrificial_scales_archive_v1';

export interface PersistentArchive {
  seenCards: string[];
  seenSigils: string[];
  defeatedBosses: string[];
  clearedLineages: string[];
  runsStarted: number;
  runsWon: number;
  totalScaleDealt: number;
  totalScaleTaken: number;
  totalSacrifices: number;
  totalEnemyKills: number;
  totalBossesDefeated: number;
  totalStagesCleared: number;
  highestOverkill: number;
}

const DEFAULT_ARCHIVE: PersistentArchive = {
  seenCards: [],
  seenSigils: [],
  defeatedBosses: [],
  clearedLineages: [],
  runsStarted: 0,
  runsWon: 0,
  totalScaleDealt: 0,
  totalScaleTaken: 0,
  totalSacrifices: 0,
  totalEnemyKills: 0,
  totalBossesDefeated: 0,
  totalStagesCleared: 0,
  highestOverkill: 0,
};

export function loadArchive(): PersistentArchive {
  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ARCHIVE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ARCHIVE,
      ...parsed,
      seenCards: Array.isArray(parsed.seenCards) ? parsed.seenCards : [],
      seenSigils: Array.isArray(parsed.seenSigils) ? parsed.seenSigils : [],
      defeatedBosses: Array.isArray(parsed.defeatedBosses) ? parsed.defeatedBosses : [],
      clearedLineages: Array.isArray(parsed.clearedLineages) ? parsed.clearedLineages : [],
    };
  } catch {
    return { ...DEFAULT_ARCHIVE };
  }
}

export function saveArchive(archive: PersistentArchive): void {
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archive));
  } catch {
    // Ignore storage quota errors
  }
}

export function normalizeArchiveCardName(name: string): string {
  const clean = (name || '').trim();
  if (clean === 'God Dam') return 'God Dam';
  const stripped = clean.replace(/^(Elder|Greater)\s+/i, '').trim();
  if (ALL_CARD_LOOKUP[stripped]) return stripped;
  return ALL_CARD_LOOKUP[clean] ? clean : '';
}

export function recordDiscoveredCards(
  prev: PersistentArchive,
  cards: CardDef[]
): PersistentArchive {
  if (!cards || cards.length === 0) return prev;
  const cardSet = new Set(prev.seenCards);
  const sigilSet = new Set(prev.seenSigils);
  let changed = false;

  for (const c of cards) {
    if (!c) continue;
    const baseName = normalizeArchiveCardName(c.name);
    if (baseName && !cardSet.has(baseName)) {
      cardSet.add(baseName);
      changed = true;
    }
    if (Array.isArray(c.sigils)) {
      for (const s of c.sigils) {
        if (s && SIGIL_DESCRIPTIONS[s] && !sigilSet.has(s)) {
          sigilSet.add(s);
          changed = true;
        }
      }
    }
  }

  if (!changed) return prev;
  const next: PersistentArchive = {
    ...prev,
    seenCards: Array.from(cardSet),
    seenSigils: Array.from(sigilSet),
  };
  saveArchive(next);
  return next;
}

export function normalizeBossArchiveId(rawBoss: string | null | undefined): string {
  if (!rawBoss) return '';
  if (rawBoss === 'Goobert') return 'The Begotten';
  if (rawBoss === 'Woodcarver') return 'The Weaver';
  return rawBoss;
}

export function recordBossVictory(
  prev: PersistentArchive,
  rawBoss: string | null | undefined
): PersistentArchive {
  const id = normalizeBossArchiveId(rawBoss);
  if (!id || prev.defeatedBosses.includes(id)) return prev;
  const next: PersistentArchive = {
    ...prev,
    defeatedBosses: [...prev.defeatedBosses, id],
  };
  saveArchive(next);
  return next;
}

export function recordRunCompletion(
  prev: PersistentArchive,
  stats: RunStats,
  highestOverkillInRun: number,
  won: boolean,
  lineageId?: string | null
): PersistentArchive {
  const lineageSet = new Set(prev.clearedLineages);
  if (won && lineageId) {
    lineageSet.add(lineageId);
  }
  const next: PersistentArchive = {
    ...prev,
    clearedLineages: Array.from(lineageSet),
    runsStarted: prev.runsStarted + 1,
    runsWon: prev.runsWon + (won ? 1 : 0),
    totalScaleDealt: prev.totalScaleDealt + (stats.scaleDamageDealt || 0),
    totalScaleTaken: prev.totalScaleTaken + (stats.scaleDamageTaken || 0),
    totalSacrifices: prev.totalSacrifices + (stats.cardsSacrificed || 0),
    totalEnemyKills: prev.totalEnemyKills + (stats.enemyCardsDestroyed || 0),
    totalBossesDefeated: prev.totalBossesDefeated + (stats.bossesDefeated || 0),
    totalStagesCleared: prev.totalStagesCleared + (stats.clearedStages || 0),
    highestOverkill: Math.max(prev.highestOverkill, highestOverkillInRun || 0),
  };
  saveArchive(next);
  return next;
}

export function resetArchive(): PersistentArchive {
  try {
    localStorage.removeItem(ARCHIVE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  return {
    ...DEFAULT_ARCHIVE,
    seenCards: [],
    seenSigils: [],
    defeatedBosses: [],
    clearedLineages: [],
  };
}
