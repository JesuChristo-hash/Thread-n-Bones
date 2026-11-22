export type StandardBossType = 'Zealot' | 'The Begotten' | 'The Weaver';
export type ActBossType = StandardBossType | 'BoneLord';

export type MapNodeType =
  | 'start'
  | 'combat'
  | 'elite_combat'
  | 'boss'
  | 'campfire'
  | 'altar'
  | 'carving'
  | 'cost'
  | 'bonelord'
  | 'mycologist'
  | 'goobert'
  | 'cave'
  | 'choice'
  | 'totem'
  | 'items';

export interface MapNode {
  id: string;
  row: number;
  col: number;
  x: number; // 0..100 percentage across parchment width
  y: number; // 0..100 percentage down parchment height (row 0 near bottom, boss near top)
  type: MapNodeType;
  bossType?: ActBossType;
  nextIds: string[];
}

export interface ActMapData {
  act: number; // 1..4
  actTitle: string;
  actSubtitle: string;
  bossType: ActBossType;
  rows: number;
  nodes: MapNode[];
  currentNodeId: string;
  visitedNodeIds: string[];
  completedBoss: boolean;
}

export interface NodeMeta {
  title: string;
  tag: string;
  desc: string;
  tone: 'neutral' | 'combat' | 'boss' | 'ritual' | 'boon';
}

export const MAP_NODE_META: Record<MapNodeType, NodeMeta> = {
  start: {
    title: 'Trailhead',
    tag: 'Origin',
    desc: 'Where your lantern first broke the mist.',
    tone: 'neutral',
  },
  combat: {
    title: 'Ambush',
    tag: 'Battle',
    desc: 'A hostile denizen bars the trail. Your creatures tremble.',
    tone: 'combat',
  },
  elite_combat: {
    title: 'Effigy Ward',
    tag: 'Totem Battle',
    desc: 'An enemy empowered by a stitched Tribal Effigy.',
    tone: 'combat',
  },
  boss: {
    title: 'Sanctum Threshold',
    tag: 'Act Boss',
    desc: 'A dread sovereign awaits at the end of this trail.',
    tone: 'boss',
  },
  campfire: {
    title: 'Boiling Chapel',
    tag: 'Blessing',
    desc: 'Bathe a creature in boiling blood for power or flesh—at a risk.',
    tone: 'ritual',
  },
  altar: {
    title: 'Crestfallen Altar',
    tag: 'Sacrifice',
    desc: 'Surrender one creature to graft its crests onto another.',
    tone: 'ritual',
  },
  carving: {
    title: 'Tribal Patches',
    tag: 'Recruitment',
    desc: 'Draw a threadbare patch to summon a creature of its Tribe.',
    tone: 'boon',
  },
  cost: {
    title: 'Sealed Cards',
    tag: 'Barter',
    desc: 'Pilfer an unmarked offering chosen strictly by its summon cost.',
    tone: 'boon',
  },
  bonelord: {
    title: 'Altar of Bones',
    tag: 'Tribute',
    desc: 'Offer a creature to gain permanent Starting Bones every battle.',
    tone: 'ritual',
  },
  mycologist: {
    title: 'The Weaver’s Stitching',
    tag: 'Fusion',
    desc: 'Fuse duplicate creatures into one grotesque monstrosity.',
    tone: 'ritual',
  },
  goobert: {
    title: 'Printing Press',
    tag: 'Forgery',
    desc: 'The Begotten stamps a potentially flawed clone of one of your cards.',
    tone: 'ritual',
  },
  cave: {
    title: 'The Steeple',
    tag: 'Ordeal',
    desc: 'Submit your deck to a ritual trial for a blessed reward.',
    tone: 'boon',
  },
  choice: {
    title: 'Wild Creatures',
    tag: 'Encounter',
    desc: 'Three beasts emerge from the gloom awaiting recruitment.',
    tone: 'boon',
  },
  totem: {
    title: 'The Weaver’s Loom',
    tag: 'Effigy',
    desc: 'Claim a Tribal Patch or Crest and stitch an active Effigy.',
    tone: 'boon',
  },
  items: {
    title: 'Surplus Cache',
    tag: 'Peddler',
    desc: 'Barter overkill blood harvest for occult pack items.',
    tone: 'boon',
  },
};

export const BOSS_DISPLAY_META: Record<ActBossType, { name: string; title: string; desc: string }> = {
  Zealot: {
    name: 'The Zealot',
    title: 'Chaplain of the Flock',
    desc: 'Preaches fanatic verdicts and demands blood tribute at the steeple.',
  },
  'The Begotten': {
    name: 'The Begotten',
    title: 'A Child With his Toys',
    desc: 'Stamps warped clones and floods the board with viscous filth.',
  },
  'The Weaver': {
    name: 'The Weaver',
    title: 'Mistress of the Loom',
    desc: 'A once-Great Seamstress, Now reduced to ferality.',
  },
  BoneLord: {
    name: 'The Bone Lord',
    title: 'Darkness within Darkness',
    desc: 'Lord of the Ossuary. All debts are settled here.',
  },
};

const ACT_THEMES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'The Sodden Approach', subtitle: 'Act I — Outer Thicket' },
  2: { title: 'The Ossuary Hollow', subtitle: 'Act II — Scrap Heap' },
  3: { title: 'The Chapel of Bones', subtitle: 'Act III — Woven Catacombs' },
  4: { title: 'The End of the World', subtitle: 'Act IV — Uzumaki' },
};

const pickOne = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const getOrInitBossOrder = (): StandardBossType[] => {
  const existing = (window as any).__standardBossOrder as StandardBossType[] | undefined;
  if (Array.isArray(existing) && existing.length === 3) {
    return existing;
  }
  const fresh = shuffle<StandardBossType>(['Zealot', 'The Begotten', 'The Weaver']);
  (window as any).__standardBossOrder = fresh;
  return fresh;
};

export const getBossForAct = (act: number): ActBossType => {
  if (act >= 4) return 'BoneLord';
  const order = getOrInitBossOrder();
  return order[Math.max(0, Math.min(2, act - 1))] || order[0];
};

type WeightedEventPool = Partial<Record<MapNodeType, number>>;

const HARD_REMOVAL_EVENTS = new Set<MapNodeType>(['altar', 'bonelord', 'mycologist']);
const ALWAYS_ADD_CARD_EVENTS = new Set<MapNodeType>(['choice', 'carving', 'cost', 'goobert']);

const EARLY_EVENT_WEIGHTS: WeightedEventPool = {
  choice: 18,
  carving: 15,
  campfire: 15,
  cost: 14,
  items: 13,
  altar: 12,
  totem: 12,
};

const MID_EVENT_WEIGHTS: WeightedEventPool = {
  campfire: 16,
  choice: 15,
  altar: 14,
  items: 13,
  totem: 12,
  carving: 11,
  cost: 11,
  goobert: 10,
  mycologist: 10,
  cave: 10,
  bonelord: 9,
};

const PREP_EVENT_WEIGHTS: WeightedEventPool = {
  campfire: 24,
  items: 20,
  altar: 18,
  mycologist: 14,
  totem: 14,
  goobert: 11,
  bonelord: 10,
};

const getEffectiveEventWeight = (
  type: MapNodeType,
  baseWeight: number,
  avoid: Set<MapNodeType>,
  deckSize: number
): number => {
  let w = baseWeight;
  if (deckSize <= 5) {
    if (HARD_REMOVAL_EVENTS.has(type)) w *= 0.25;
    else if (type === 'campfire') w *= 0.55;
    else if (ALWAYS_ADD_CARD_EVENTS.has(type)) w *= 1.4;
  } else if (deckSize >= 10) {
    if (ALWAYS_ADD_CARD_EVENTS.has(type)) w *= 0.25;
    else if (HARD_REMOVAL_EVENTS.has(type)) w *= 1.4;
    else if (type === 'campfire') w *= 1.15;
  }
  if (avoid.has(type)) w *= 0.18;
  return Math.max(0.05, w);
};

const pickWeightedDistinctEvents = (
  poolWeights: WeightedEventPool,
  count: number,
  avoid: Set<MapNodeType>,
  deckSize: number
): MapNodeType[] => {
  const entries = (Object.entries(poolWeights) as [MapNodeType, number][]).filter(([, w]) => w > 0);
  const chosen: MapNodeType[] = [];
  let hardRemovalCount = 0;
  let alwaysAddCount = 0;

  while (chosen.length < count) {
    const remaining = entries.filter(([type]) => !chosen.includes(type));
    if (remaining.length === 0) break;

    // Enforce max 1 throttled-bucket event per row so forks always offer a safe off-ramp
    let candidates = remaining.filter(([type]) => {
      if (deckSize <= 5 && hardRemovalCount >= 1 && HARD_REMOVAL_EVENTS.has(type)) return false;
      if (deckSize >= 10 && alwaysAddCount >= 1 && ALWAYS_ADD_CARD_EVENTS.has(type)) return false;
      return true;
    });
    if (candidates.length === 0) candidates = remaining;

    const scored = candidates.map(([type, baseWeight]) => ({
      type,
      weight: getEffectiveEventWeight(type, baseWeight, avoid, deckSize),
    }));
    const totalWeight = scored.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;
    let picked = scored[scored.length - 1].type;
    for (const item of scored) {
      roll -= item.weight;
      if (roll <= 0) {
        picked = item.type;
        break;
      }
    }

    chosen.push(picked);
    if (HARD_REMOVAL_EVENTS.has(picked)) hardRemovalCount += 1;
    if (ALWAYS_ADD_CARD_EVENTS.has(picked)) alwaysAddCount += 1;
  }

  return chosen;
};

/**
 * Generates an Inscryption-style bottom-to-top branching parchment map for an Act.
 * Act I = 9 rows, Act II = 12 rows, Act III = 15 rows, Act IV = 18 rows.
 * Edges are strictly planar (no crossing lines) and every node is reachable and leads to the Boss.
 */
export const generateActMap = (act: number, bossOverride?: ActBossType, deckSize = 7): ActMapData => {
  const clampedAct = Math.max(1, Math.min(4, act));
  const bossType = bossOverride || getBossForAct(clampedAct);
  const theme = ACT_THEMES[clampedAct] || ACT_THEMES[1];

  const totalRows = 9 + (clampedAct - 1) * 3; // 9, 12, 15, 18
  const prepRow = totalRows - 2;
  const lateCombatRow = totalRows - 3;
  const preLateEventRow = totalRows - 4;

  const rowCounts: number[] = Array.from({ length: totalRows }, (_, r) => {
    if (r === 0 || r === totalRows - 1) return 1;
    if (r === 1 || r === prepRow || r === preLateEventRow) return 3;
    if (r === lateCombatRow) return Math.random() < 0.55 ? 3 : 2;
    const cycle = (r - 2) % 3;
    if (cycle === 0) return Math.random() < 0.55 ? 3 : 2; // Combat
    if (cycle === 1) return 3; // Event
    return Math.random() < 0.5 ? 3 : 2; // Mixed
  });

  const effectiveDeckSize = Math.max(1, deckSize);

  const rowNodeGrid: MapNode[][] = [];
  const prevRowTypes = new Set<MapNodeType>();

  // Keep pixel-consistent top/bottom margins and per-row vertical jitter across 9..18 row canvases
  const canvasPx = Math.max(760, totalRows * 96);
  const topPadPct = (76 / canvasPx) * 100;
  const bottomPadPct = (68 / canvasPx) * 100;
  const usableSpan = 100 - topPadPct - bottomPadPct;
  const rowGapPct = usableSpan / (totalRows - 1);

  for (let r = 0; r < totalRows; r++) {
    const count = rowCounts[r];
    let types: MapNodeType[] = [];

    if (r === 0) {
      types = ['start'];
    } else if (r === totalRows - 1) {
      types = ['boss'];
    } else if (r === 1) {
      if (clampedAct === 1) {
        // Preserve signature Act 1 post-draft three-way opening fork
        types = ['altar', 'campfire', 'bonelord'];
      } else {
        types = pickWeightedDistinctEvents(EARLY_EVENT_WEIGHTS, count, prevRowTypes, effectiveDeckSize);
      }
    } else if (r === prepRow) {
      types = pickWeightedDistinctEvents(PREP_EVENT_WEIGHTS, count, prevRowTypes, effectiveDeckSize);
    } else if (r === lateCombatRow) {
      types = Array.from({ length: count }, (_, i) =>
        clampedAct >= 2 && (i === count - 1 || Math.random() < 0.4) ? 'elite_combat' : 'combat'
      );
    } else if (r === preLateEventRow) {
      types = pickWeightedDistinctEvents(MID_EVENT_WEIGHTS, count, prevRowTypes, effectiveDeckSize);
    } else {
      const cycle = (r - 2) % 3;
      const progress = r / (totalRows - 1);
      if (cycle === 0) {
        // Mandatory combat row (early row stays milder; deeper rows ramp elite frequency)
        if (r === 2) {
          types = Array.from({ length: count }, (_, i) =>
            clampedAct >= 3 && i === 1 && Math.random() < 0.45 ? 'elite_combat' : 'combat'
          );
        } else {
          const eliteChance = clampedAct >= 2 ? Math.min(0.55, 0.22 + progress * 0.32) : 0;
          types = Array.from({ length: count }, () =>
            Math.random() < eliteChance ? 'elite_combat' : 'combat'
          );
        }
      } else if (cycle === 1) {
        types = pickWeightedDistinctEvents(MID_EVENT_WEIGHTS, count, prevRowTypes, effectiveDeckSize);
      } else {
        // Mixed row: 1 battle + 1–2 events for risk/reward pathing
        const eventSlotCount = count === 3 ? 2 : 1;
        const evs = pickWeightedDistinctEvents(MID_EVENT_WEIGHTS, eventSlotCount, prevRowTypes, effectiveDeckSize);
        const battleType: MapNodeType = clampedAct >= 2 && Math.random() < 0.5 ? 'elite_combat' : 'combat';
        types = shuffle([...evs, battleType]);
      }
    }

    prevRowTypes.clear();
    types.forEach(t => prevRowTypes.add(t));

    // Bottom-to-top vertical spacing scaled to totalRows
    const baseY = 100 - bottomPadPct - (r / (totalRows - 1)) * usableSpan;
    const rowNodes: MapNode[] = types.map((type, c) => {
      const baseX =
        count === 1
          ? 50
          : count === 2
            ? c === 0
              ? 30
              : 70
            : c === 0
              ? 20
              : c === 1
                ? 50
                : 80;

      // Subtle hand-drawn organic jitter scaled to row spacing so tall maps stay legible
      const jitterX = r === 0 || r === totalRows - 1 ? 0 : (Math.random() - 0.5) * 7.5;
      const jitterY = r === 0 || r === totalRows - 1 ? 0 : (Math.random() - 0.5) * (rowGapPct * 0.22);

      return {
        id: `a${clampedAct}-r${r}-c${c}`,
        row: r,
        col: c,
        x: Math.max(13, Math.min(87, Number((baseX + jitterX).toFixed(2)))),
        y: Math.max(3, Math.min(97, Number((baseY + jitterY).toFixed(2)))),
        type,
        bossType: type === 'boss' ? bossType : undefined,
        nextIds: [],
      };
    });

    rowNodeGrid.push(rowNodes);
  }

  // Build planar, non-crossing forward edges between consecutive rows
  for (let r = 0; r < totalRows - 1; r++) {
    const curr = rowNodeGrid[r];
    const next = rowNodeGrid[r + 1];

    if (curr.length === 1) {
      // Trailhead fans out to all nodes in row 1
      curr[0].nextIds = next.map(n => n.id);
      continue;
    }

    if (next.length === 1) {
      // Every pre-boss node converges into the Boss apex
      curr.forEach(node => {
        node.nextIds = [next[0].id];
      });
      continue;
    }

    // Track incoming edges so no node in `next` is orphaned
    const hasIncoming = new Array(next.length).fill(false);
    let maxAssignedTarget = 0;

    for (let i = 0; i < curr.length; i++) {
      // Primary monotonic lane target
      const idealIdx = Math.round((i / Math.max(1, curr.length - 1)) * (next.length - 1));
      const primary = Math.max(maxAssignedTarget > idealIdx ? idealIdx : idealIdx, 0);
      const targets = new Set<number>([primary]);
      hasIncoming[primary] = true;

      // Occasionally branch to an adjacent lane without crossing previous node's rightmost edge
      if (Math.random() < 0.48) {
        const candidates: number[] = [];
        if (primary + 1 < next.length) candidates.push(primary + 1);
        if (primary - 1 >= maxAssignedTarget) candidates.push(primary - 1);
        if (candidates.length > 0) {
          const extra = pickOne(candidates);
          targets.add(extra);
          hasIncoming[extra] = true;
        }
      }

      const sortedTargets = Array.from(targets).sort((a, b) => a - b);
      maxAssignedTarget = Math.max(maxAssignedTarget, sortedTargets[0]);
      curr[i].nextIds = sortedTargets.map(tIdx => next[tIdx].id);
    }

    // Guarantee every node in `next` has at least one parent without crossing
    for (let j = 0; j < next.length; j++) {
      if (!hasIncoming[j]) {
        const parentIdx = Math.min(curr.length - 1, Math.round((j / Math.max(1, next.length - 1)) * (curr.length - 1)));
        const targetId = next[j].id;
        if (!curr[parentIdx].nextIds.includes(targetId)) {
          curr[parentIdx].nextIds.push(targetId);
        }
      }
    }
  }

  const allNodes = rowNodeGrid.flat();
  const startNode = rowNodeGrid[0][0];

  return {
    act: clampedAct,
    actTitle: theme.title,
    actSubtitle: theme.subtitle,
    bossType,
    rows: totalRows,
    nodes: allNodes,
    currentNodeId: startNode.id,
    visitedNodeIds: [startNode.id],
    completedBoss: false,
  };
};
