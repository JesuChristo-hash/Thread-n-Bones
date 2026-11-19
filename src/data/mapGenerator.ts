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
    desc: 'A hostile denizen bars the trail. Weigh blood upon the scales.',
    tone: 'combat',
  },
  elite_combat: {
    title: 'Effigy Ward',
    tag: 'Totem Battle',
    desc: 'An enemy warband empowered by a stitched Tribal Effigy.',
    tone: 'combat',
  },
  boss: {
    title: 'Sanctum Threshold',
    tag: 'Act Boss',
    desc: 'A dread sovereign awaits at the end of this parchment.',
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
    desc: 'Draw a threadbare swatch to summon a creature of its Tribe.',
    tone: 'boon',
  },
  cost: {
    title: 'Blood & Bone Pact',
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
    desc: 'The Begotten stamps a flawed replica of one of your cards.',
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
    desc: 'Claim a Tribe Patch or Crest and stitch an active Effigy.',
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
    title: 'Chaplain of the Boil',
    desc: 'Preaches fanatic verdicts and demands blood tribute at the steeple.',
  },
  'The Begotten': {
    name: 'The Begotten',
    title: 'Keeper of the Press',
    desc: 'Stamps warped replicas and floods the board with viscous filth.',
  },
  'The Weaver': {
    name: 'The Weaver',
    title: 'Mistress of the Loom',
    desc: 'Pulls stitched effigies and tangled threads to command the lanes.',
  },
  BoneLord: {
    name: 'The Bone Lord',
    title: 'Sovereign of the Final Dark',
    desc: 'Lord of the Ossuary. All debts of marrow and blood are settled here.',
  },
};

const ACT_THEMES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'The Sodden Approach', subtitle: 'Act I — Outer Thicket' },
  2: { title: 'The Ossuary Hollow', subtitle: 'Act II — Mire of Teeth' },
  3: { title: 'The Loom of Thorns', subtitle: 'Act III — Woven Catacombs' },
  4: { title: 'The Bone Lord’s Threshold', subtitle: 'Act IV — Final Descent' },
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

const pickDistinctEvents = (pool: MapNodeType[], count: number, avoid: Set<MapNodeType>): MapNodeType[] => {
  const preferred = shuffle(pool.filter(t => !avoid.has(t)));
  const fallback = shuffle(pool);
  const chosen: MapNodeType[] = [];
  for (const item of [...preferred, ...fallback]) {
    if (chosen.length >= count) break;
    if (!chosen.includes(item)) chosen.push(item);
  }
  return chosen;
};

/**
 * Generates an Inscryption-style bottom-to-top branching parchment map for an Act.
 * Row 0 = trailhead start node; Row 7 = Act Boss apex.
 * Edges are strictly planar (no crossing lines) and every node is reachable and leads to the Boss.
 */
export const generateActMap = (act: number, bossOverride?: ActBossType): ActMapData => {
  const clampedAct = Math.max(1, Math.min(4, act));
  const bossType = bossOverride || getBossForAct(clampedAct);
  const theme = ACT_THEMES[clampedAct] || ACT_THEMES[1];

  const rowCounts = [
    1, // Row 0: Start
    3, // Row 1: Opening event fork
    Math.random() < 0.55 ? 3 : 2, // Row 2: Early combat
    3, // Row 3: Mid-early events
    Math.random() < 0.5 ? 3 : 2, // Row 4: Mixed combat / high-value event
    Math.random() < 0.55 ? 3 : 2, // Row 5: Late combat / elite
    3, // Row 6: Pre-boss preparation
    1, // Row 7: Act Boss
  ];

  const totalRows = rowCounts.length;
  const earlyEvents: MapNodeType[] = ['choice', 'carving', 'cost', 'items', 'totem', 'campfire', 'altar'];
  const midEvents: MapNodeType[] = ['altar', 'campfire', 'bonelord', 'mycologist', 'goobert', 'cave', 'totem', 'items', 'choice', 'carving', 'cost'];
  const prepEvents: MapNodeType[] = ['campfire', 'altar', 'items', 'mycologist', 'totem', 'bonelord', 'goobert'];

  const rowNodeGrid: MapNode[][] = [];
  const prevRowTypes = new Set<MapNodeType>();

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
        types = pickDistinctEvents(earlyEvents, count, prevRowTypes);
      }
    } else if (r === 2) {
      types = Array.from({ length: count }, (_, i) =>
        clampedAct >= 3 && i === 1 && Math.random() < 0.45 ? 'elite_combat' : 'combat'
      );
    } else if (r === 3) {
      types = pickDistinctEvents(midEvents, count, prevRowTypes);
    } else if (r === 4) {
      // Mix of combat and occult events for meaningful risk/reward routing
      const eventSlotCount = count === 3 ? 2 : 1;
      const evs = pickDistinctEvents(midEvents, eventSlotCount, prevRowTypes);
      const battleType: MapNodeType = clampedAct >= 2 && Math.random() < 0.5 ? 'elite_combat' : 'combat';
      types = shuffle([...evs, battleType]);
    } else if (r === 5) {
      types = Array.from({ length: count }, (_, i) =>
        clampedAct >= 2 && (i === count - 1 || Math.random() < 0.4) ? 'elite_combat' : 'combat'
      );
    } else if (r === 6) {
      types = pickDistinctEvents(prepEvents, count, prevRowTypes);
    }

    prevRowTypes.clear();
    types.forEach(t => prevRowTypes.add(t));

    // Bottom-to-top vertical spacing (row 0 at y=92%, boss row 7 at y=9%)
    const baseY = 92 - (r / (totalRows - 1)) * 82;
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

      // Subtle hand-drawn organic jitter on interior rows
      const jitterX = r === 0 || r === totalRows - 1 ? 0 : (Math.random() - 0.5) * 7.5;
      const jitterY = r === 0 || r === totalRows - 1 ? 0 : (Math.random() - 0.5) * 2.6;

      return {
        id: `a${clampedAct}-r${r}-c${c}`,
        row: r,
        col: c,
        x: Math.max(13, Math.min(87, Number((baseX + jitterX).toFixed(2)))),
        y: Math.max(8, Math.min(94, Number((baseY + jitterY).toFixed(2)))),
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
