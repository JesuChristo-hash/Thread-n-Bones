import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChiptuneAudio } from '../audio/ChiptuneAudio';
import { RITUAL_VOW_MAP, createSeededRng, type VowId } from '../utils/seededRng';
import {
  ActMapData,
  BOSS_DISPLAY_META,
  MAP_NODE_META,
  MapNode,
  MapNodeType,
} from '../data/mapGenerator';

interface MapScreenProps {
  mapData: ActMapData;
  bgStyle: React.CSSProperties;
  deckSize: number;
  overkillBlood: number;
  startingBones: number;
  activeTotem: { head: string | null; body: string | null };
  runSeed?: string;
  activeVows?: VowId[];
  onSelectNode: (node: MapNode) => void;
}

const renderInkGlyph = (type: MapNodeType, isBoss?: boolean) => {
  const stroke = isBoss ? '#f3e1be' : 'currentColor';
  switch (type) {
    case 'start':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
    case 'combat':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19L19 5M15 5h4v4" />
          <path d="M19 19L5 5M9 5H5v4" />
          <path d="M7 17l-2 2M17 17l2 2" />
        </svg>
      );
    case 'elite_combat':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l3 3 4-6 4 6 3-3-1.5 9h-11L5 9Z" />
          <path d="M9 14h.01M15 14h.01M9 21h6" />
        </svg>
      );
    case 'boss':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 10a6 6 0 1 1 12 0c0 2.5-1 4.2-2 5.2V18a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.8C7 14.2 6 12.5 6 10Z" />
          <circle cx="9.5" cy="10.5" r="1.2" fill={stroke} />
          <circle cx="14.5" cy="10.5" r="1.2" fill={stroke} />
          <path d="M10 19v2M14 19v2M4 5l3 2M20 5l-3 2" />
        </svg>
      );
    case 'campfire':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c2 3.2 4.5 5.2 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.9.9-3.4 2-4.8.2 1.4 1 2.2 1.8 2.5C11 6.7 11.2 4.8 12 3Z" />
          <path d="M5 19l14-2M5 17l14 2" />
        </svg>
      );
    case 'altar':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19h16M6 19l1.5-8h9L18 19" />
          <path d="M12 3v7M9.5 6.5h5" />
        </svg>
      );
    case 'carving':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="3 2" />
          <path d="M8 12c1.5-3 6.5-3 8 0-1.5 3-6.5 3-8 0Z" />
          <circle cx="12" cy="12" r="1.3" fill={stroke} />
        </svg>
      );
    case 'cost':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3s6 6.4 6 11a6 6 0 1 1-12 0c0-4.6 6-11 6-11Z" />
          <path d="M10 15.5c.6.9 2.2 1.3 3.4.5" />
        </svg>
      );
    case 'bonelord':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4c0 4 2.2 6.5 7 6.5S19 8 19 4" />
          <path d="M8 11l1.5 8h5L16 11" />
          <circle cx="10.5" cy="14" r="0.9" fill={stroke} />
          <circle cx="13.5" cy="14" r="0.9" fill={stroke} />
        </svg>
      );
    case 'mycologist':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8.5" cy="12" r="4.5" />
          <circle cx="15.5" cy="12" r="4.5" />
          <path d="M12 7v10" strokeDasharray="2 2" />
        </svg>
      );
    case 'goobert':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 18h10v2H7z" />
          <path d="M9 18v-4h6v4" />
          <path d="M6 10h12v4H6z" />
          <path d="M12 4v6" />
        </svg>
      );
    case 'cave':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 19h18" />
          <path d="M5 19c0-7.5 3-13 7-13s7 5.5 7 13" />
          <circle cx="12" cy="13" r="2" />
        </svg>
      );
    case 'choice':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="6" width="8" height="12" rx="1" transform="rotate(-10 8 12)" />
          <rect x="12" y="6" width="8" height="12" rx="1" transform="rotate(10 16 12)" />
        </svg>
      );
    case 'totem':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 5h8l-1 5H9L8 5Z" />
          <path d="M9 10h6v5H9z" />
          <path d="M7 15h10l1 4H6l1-4Z" />
        </svg>
      );
    case 'items':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8h12l1 12H5L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          <path d="M10 13h4" />
        </svg>
      );
    case 'anvil':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9h14l4 2.5-4 2.5H9c-2.5 0-4.5-1.5-6-5Z" />
          <path d="M9 14l-1.5 5h9L15 14" />
          <path d="M5 19h14" />
        </svg>
      );
    case 'flock':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 9c-2.5 0-4 1.8-3 3.8.6 1.2 2 1.2 3 .5" />
          <path d="M17 9c2.5 0 4 1.8 3 3.8-.6 1.2-2 1.2-3 .5" />
          <path d="M7.5 10.5C7.5 7 9.5 5.5 12 5.5s4.5 1.5 4.5 5c0 4-2 8-4.5 8s-4.5-4-4.5-8Z" />
          <circle cx="10.2" cy="11.5" r="0.8" fill={stroke} />
          <circle cx="13.8" cy="11.5" r="0.8" fill={stroke} />
        </svg>
      );
    default:
      return null;
  }
};

type DecorKind =
  | 'obelisk'
  | 'reliquary'
  | 'sigilring'
  | 'ribcage'
  | 'skull'
  | 'cairn'
  | 'arch'
  | 'cobweb'
  | 'candle'
  | 'spiral'
  | 'fissure'
  | 'eclipse';

interface ParchmentDecor {
  id: string;
  x: number;
  y: number;
  scale: number;
  rot: number;
  opacity: number;
  kind: DecorKind;
}

const renderCartographyProp = (d: ParchmentDecor) => {
  const transform = `translate(${d.x} ${d.y}) rotate(${d.rot}) scale(${d.scale})`;
  const ink = '#231f24';
  switch (d.kind) {
    case 'obelisk':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -15 L4.5 -9 L6 14 L-6 14 L-4.5 -9 Z" fill="rgba(35,31,36,0.16)" />
          <path d="M0 -8 L0 9 M-2.8 -2 L2.8 -2" strokeWidth="0.95" />
          <path d="M-9 14 L9 14 M-7 17 L7 17" strokeWidth="1" />
        </g>
      );
    case 'reliquary':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -15 L7 -5 L7 12 L-7 12 L-7 -5 Z" fill="rgba(35,31,36,0.12)" />
          <path d="M0 -10 L4 -3 L4 9 L-4 9 L-4 -3 Z" strokeWidth="0.85" />
          <path d="M0 -18 L0 -15 M-2 -16.5 L2 -16.5 M-9 12 L9 12" />
          <circle cx="0" cy="2" r="1.5" fill={ink} />
        </g>
      );
    case 'sigilring':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="0" cy="0" r="11" />
          <circle cx="0" cy="0" r="7.5" strokeDasharray="2.5 2.5" strokeWidth="0.85" />
          <path d="M0 -10 L8.5 5.5 L-8.5 5.5 Z" fill="rgba(35,31,36,0.1)" />
          <circle cx="0" cy="0.5" r="1.5" fill={ink} />
        </g>
      );
    case 'ribcage':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.25" strokeLinecap="round">
          <path d="M0 -12 L0 12" />
          <path d="M-9 -8 Q0 -11 9 -8 M-10 -3 Q0 -6 10 -3 M-9 2 Q0 -1 9 2 M-7 7 Q0 4 7 7" />
        </g>
      );
    case 'skull':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-7 1 C-8 -8 8 -8 7 1 C7 5 4 6 4 9 L-4 9 C-4 6 -7 5 -7 1 Z" fill="rgba(35,31,36,0.12)" />
          <circle cx="-2.6" cy="0.5" r="1.4" fill={ink} />
          <circle cx="2.6" cy="0.5" r="1.4" fill={ink} />
          <path d="M0 3.2 L-0.8 4.8 L0.8 4.8 Z M-2 9 L-2 6.8 M0 9 L0 6.8 M2 9 L2 6.8" />
        </g>
      );
    case 'cairn':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="rgba(35,31,36,0.14)" strokeWidth="1.15">
          <ellipse cx="0" cy="8" rx="9" ry="3.5" />
          <ellipse cx="-0.5" cy="3" rx="6.5" ry="2.8" />
          <ellipse cx="0.5" cy="-1.5" rx="4.2" ry="2.1" />
          <ellipse cx="0" cy="-5" rx="2.3" ry="1.4" />
        </g>
      );
    case 'arch':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.2" strokeLinecap="round">
          <path d="M-9 13 L-9 -1 Q-9 -10 0 -14 Q9 -10 9 -1 L9 13" />
          <path d="M-6 13 L-6 0 Q-6 -7 0 -10 Q6 -7 6 0 L6 13" strokeWidth="0.8" />
          <path d="M-12 13 L12 13" />
        </g>
      );
    case 'cobweb':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="0.85">
          <path d="M0 0 L16 0 M0 0 L14 8 M0 0 L8 14 M0 0 L0 16" />
          <path d="M5 0 Q4.5 4.5 0 5 M10 0 Q9 9 0 10 M15 0 Q13.5 13.5 0 15" />
        </g>
      );
    case 'candle':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.1" strokeLinecap="round">
          <rect x="-3" y="-2" width="6" height="14" rx="1" fill="rgba(35,31,36,0.12)" />
          <path d="M0 -4 Q2.8 -8 0 -12 Q-2.8 -8 0 -4 Z" fill="rgba(140,42,20,0.22)" />
          <path d="M-7 12 L7 12" />
        </g>
      );
    case 'spiral':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.15" strokeLinecap="round">
          <path d="M0 0 C2 0 2 3 0 3 C-4 3 -4 -4 0 -4 C6 -4 6 6 0 6 C-8 6 -8 -8 0 -8 C10 -8 10 10 0 10 C-12 10 -12 -12 0 -12" />
        </g>
      );
    case 'fissure':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.2" strokeLinecap="round">
          <path d="M-14 -4 L-6 -1 L-2 -6 L5 1 L13 -2 M-2 -6 L1 -12 M5 1 L7 8" />
        </g>
      );
    case 'eclipse':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.15">
          <circle cx="0" cy="0" r="8" fill="rgba(35,31,36,0.2)" />
          <circle cx="3" cy="-1.5" r="7" fill="#afa89d" stroke="none" />
          <circle cx="0" cy="0" r="8" />
          <path d="M0 -12 L0 -10 M0 10 L0 12 M-12 0 L-10 0 M10 0 L12 0" strokeWidth="0.9" />
        </g>
      );
  }
};

const MapScreen: React.FC<MapScreenProps> = ({
  mapData,
  bgStyle,
  deckSize,
  overkillBlood,
  startingBones,
  activeTotem,
  runSeed,
  activeVows = [],
  onSelectNode,
}) => {
  const [copiedSeed, setCopiedSeed] = useState(false);
  const displaySeed = runSeed || mapData.seed || '';

  const copySeed = () => {
    if (!displaySeed) return;
    try {
      navigator.clipboard?.writeText(displaySeed);
    } catch {}
    setCopiedSeed(true);
    window.setTimeout(() => setCopiedSeed(false), 1400);
  };
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nodeMap = useMemo(() => {
    const m = new Map<string, MapNode>();
    mapData.nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [mapData.nodes]);

  const currentNode = nodeMap.get(mapData.currentNodeId) || mapData.nodes[0];
  const reachableIds = useMemo(
    () => new Set(currentNode?.nextIds || []),
    [currentNode]
  );
  const visitedSet = useMemo(
    () => new Set(mapData.visitedNodeIds),
    [mapData.visitedNodeIds]
  );

  // Track which edges belong to the player's walked history
  const walkedEdgeKeys = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < mapData.visitedNodeIds.length - 1; i++) {
      s.add(`${mapData.visitedNodeIds[i]}->${mapData.visitedNodeIds[i + 1]}`);
    }
    return s;
  }, [mapData.visitedNodeIds]);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const lastTickNodeRef = useRef<string | null>(null);

  const handleHoverNode = (node: MapNode) => {
    setHoveredNodeId(node.id);
    if (lastTickNodeRef.current !== node.id) {
      lastTickNodeRef.current = node.id;
      const ratio = 0.86 + (node.row / Math.max(1, mapData.rows - 1)) * 0.36 + (node.col - 1) * 0.04;
      ChiptuneAudio.playWoodTick?.(ratio);
    }
  };
  const [isAwayFromFigurine, setIsAwayFromFigurine] = useState(false);

  const parchmentHeight = Math.max(760, (mapData.rows || 9) * 96);

  // Deterministic Act-themed cartography (landmarks, elevation rings, ink stains)
  const cartography = useMemo(() => {
    const rng = createSeededRng(`${mapData.seed || 'scroll'}:carto:${mapData.act}:${mapData.rows}`);
    const actPools: Record<number, DecorKind[]> = {
      1: ['obelisk', 'sigilring', 'reliquary', 'arch'],
      2: ['ribcage', 'skull', 'cairn', 'reliquary'],
      3: ['arch', 'candle', 'cobweb', 'skull'],
      4: ['spiral', 'fissure', 'eclipse', 'spiral'],
    };
    const pool = actPools[mapData.act] || actPools[1];
    const vw = 500;
    const vh = parchmentHeight;

    const isClearOfNodes = (px: number, py: number, minDist = 48) => {
      for (const n of mapData.nodes) {
        const nx = (n.x / 100) * vw;
        const ny = (n.y / 100) * vh;
        const dx = px - nx;
        const dy = py - ny;
        if (dx * dx + dy * dy < minDist * minDist) return false;
      }
      return true;
    };

    const props: ParchmentDecor[] = [];
    const targetCount = Math.min(42, Math.max(18, mapData.rows * 2 + 4));
    let tries = 0;
    while (props.length < targetCount && tries < 260) {
      tries++;
      // Bias strongly toward left/right margins so the center trails stay uncluttered
      const sideRoll = rng();
      const x =
        sideRoll < 0.44
          ? 26 + rng() * 54
          : sideRoll < 0.88
            ? vw - 80 + rng() * 54
            : 110 + rng() * (vw - 220);
      const y = 78 + rng() * (vh - 156);
      if (!isClearOfNodes(x, y, sideRoll < 0.88 ? 42 : 56)) continue;
      if (props.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < 38 * 38)) continue;

      const kind = pool[Math.floor(rng() * pool.length)];
      props.push({
        id: `dec-${props.length}`,
        x: Math.round(x),
        y: Math.round(y),
        scale: Number((0.78 + rng() * 0.55).toFixed(2)),
        rot: kind === 'arch' || kind === 'candle' || kind === 'obelisk' || kind === 'reliquary' ? Math.round((rng() - 0.5) * 10) : Math.round((rng() - 0.5) * 32),
        opacity: Number((0.24 + rng() * 0.18).toFixed(2)),
        kind,
      });
    }

    // Subtle elevation contour loops
    const contours = Array.from({ length: Math.max(4, Math.floor(mapData.rows / 2)) }, (_, i) => ({
      id: `ct-${i}`,
      cx: Math.round(60 + rng() * (vw - 120)),
      cy: Math.round(120 + (i / Math.max(1, Math.floor(mapData.rows / 2))) * (vh - 240) + (rng() - 0.5) * 60),
      rx: Math.round(55 + rng() * 65),
      ry: Math.round(28 + rng() * 38),
      rot: Math.round((rng() - 0.5) * 40),
    }));

    // Deterministic blood splatters & smears (blood01.png - blood04.png)
    const stains = Array.from({ length: Math.max(7, Math.floor(mapData.rows * 0.95)) }, (_, i) => {
      const sideBias = rng() < 0.65;
      const cx = sideBias
        ? (rng() < 0.5 ? Math.round(28 + rng() * 95) : Math.round(vw - 123 + rng() * 95))
        : Math.round(90 + rng() * (vw - 180));
      return {
        id: `st-${i}`,
        cx,
        cy: Math.round(210 + rng() * Math.max(120, vh - 290)),
        size: Math.round(58 + rng() * 76),
        rot: Math.round(rng() * 360),
        variant: (Math.floor(rng() * 4) + 1) as 1 | 2 | 3 | 4,
        opacity: Number((0.48 + rng() * 0.34).toFixed(2)),
      };
    });

    // Horizontal scroll-fold creases
    const folds: number[] = [];
    for (let y = 240; y < vh - 120; y += 260) {
      folds.push(y);
    }

    const bossNode = mapData.nodes.find(n => n.type === 'boss');
    const bossPx = bossNode
      ? { x: (bossNode.x / 100) * vw, y: (bossNode.y / 100) * vh }
      : { x: vw / 2, y: 76 };

    return { vw, vh, props, contours, stains, folds, bossPx };
  }, [mapData.seed, mapData.act, mapData.rows, mapData.nodes, parchmentHeight]);

  // All nodes still reachable forward from the player's current position
  const futureReachableIds = useMemo(() => {
    const seen = new Set<string>();
    if (!currentNode) return seen;
    const queue: string[] = [currentNode.id];
    seen.add(currentNode.id);
    while (queue.length > 0) {
      const id = queue.shift()!;
      const n = nodeMap.get(id);
      if (!n) continue;
      for (const nextId of n.nextIds) {
        if (!seen.has(nextId)) {
          seen.add(nextId);
          queue.push(nextId);
        }
      }
    }
    return seen;
  }, [currentNode, nodeMap]);

  // Reverse adjacency map for tracing all forward paths to a hovered target
  const prevMap = useMemo(() => {
    const m = new Map<string, string[]>();
    mapData.nodes.forEach(n => {
      n.nextIds.forEach(nextId => {
        const list = m.get(nextId);
        if (list) list.push(n.id);
        else m.set(nextId, [n.id]);
      });
    });
    return m;
  }, [mapData.nodes]);

  const tracedPath = useMemo(() => {
    const nodes = new Set<string>();
    const edges = new Set<string>();
    if (!hoveredNodeId || !currentNode || hoveredNodeId === currentNode.id) {
      return { nodes, edges };
    }
    if (!futureReachableIds.has(hoveredNodeId)) {
      return { nodes, edges };
    }
    const queue: string[] = [hoveredNodeId];
    nodes.add(hoveredNodeId);
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (id === currentNode.id) continue;
      const parents = prevMap.get(id) || [];
      for (const pId of parents) {
        if (futureReachableIds.has(pId)) {
          edges.add(`${pId}->${id}`);
          if (!nodes.has(pId)) {
            nodes.add(pId);
            queue.push(pId);
          }
        }
      }
    }
    return { nodes, edges };
  }, [hoveredNodeId, currentNode, futureReachableIds, prevMap]);

  const getFigurineScrollTop = (el: HTMLDivElement) => {
    if (!currentNode) return 0;
    const targetY = Math.max(0, (currentNode.y / 100) * parchmentHeight - 88);
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    return Math.max(0, Math.min(maxScroll, targetY - el.clientHeight * 0.56));
  };

  const scrollToFigurine = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: getFigurineScrollTop(el), behavior: 'smooth' });
  };

  const scrollToBoss = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleParchmentScroll = () => {
    const el = scrollRef.current;
    if (!el || !currentNode) return;
    const figTop = getFigurineScrollTop(el);
    setIsAwayFromFigurine(Math.abs(el.scrollTop - figTop) > 110);
  };

  // Scroll parchment smoothly so current figurine & next choices stay centered
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !currentNode) return;
    el.scrollTo({ top: getFigurineScrollTop(el), behavior: 'smooth' });
    setIsAwayFromFigurine(false);
  }, [mapData.currentNodeId, mapData.act, currentNode, parchmentHeight]);

  const inspectedNode =
    (hoveredNodeId ? nodeMap.get(hoveredNodeId) : null) ||
    (currentNode?.nextIds.length === 1 ? nodeMap.get(currentNode.nextIds[0]) : null) ||
    currentNode;

  const bossMeta = BOSS_DISPLAY_META[mapData.bossType];
  const inspectedMeta = inspectedNode
    ? inspectedNode.type === 'boss'
      ? {
          title: bossMeta.name,
          tag: bossMeta.title,
          desc: bossMeta.desc,
          tone: 'boss' as const,
        }
      : MAP_NODE_META[inspectedNode.type]
    : null;

  const isInspectedReachable = inspectedNode ? reachableIds.has(inspectedNode.id) : false;

  const ambientPalette = useMemo(() => {
    switch (mapData.act) {
      case 2:
        return {
          candle: 'rgba(196, 178, 128, 0.17)',
          mote: '#dfd3ad',
          wisp: 'rgba(118, 124, 92, 0.11)',
        };
      case 3:
        return {
          candle: 'rgba(205, 118, 86, 0.17)',
          mote: '#eab59a',
          wisp: 'rgba(128, 52, 42, 0.12)',
        };
      case 4:
        return {
          candle: 'rgba(164, 152, 188, 0.16)',
          mote: '#d8d0e8',
          wisp: 'rgba(72, 64, 94, 0.14)',
        };
      default:
        return {
          candle: 'rgba(228, 164, 82, 0.19)',
          mote: '#f3d59b',
          wisp: 'rgba(148, 102, 54, 0.11)',
        };
    }
  }, [mapData.act]);

  const dustMotes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 19 + 7) % 94 + 3}%`,
        top: `${(i * 29 + 11) % 86 + 6}%`,
        size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
        duration: `${10 + (i % 6) * 2.4}s`,
        delay: `-${(i * 1.7) % 11}s`,
        driftX: `${(i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 8)}px`,
        driftY: `${-18 - (i % 5) * 9}px`,
        opacity: 0.25 + (i % 4) * 0.14,
      })),
    []
  );

  return (
    <div
      className="absolute inset-0 bg-[#09080a] z-50 flex flex-col items-center justify-between px-3 sm:px-5 py-2 sm:py-3 overflow-hidden font-mono select-none animate-fade-up"
      style={bgStyle}
    >
      {/* Atmospheric Stone & Cloth Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,13,17,0.36)_0%,rgba(5,4,6,0.9)_100%)] pointer-events-none z-0" />

      {/* Map-Specific Ambient Keyframes */}
      <style>{`
        @keyframes mapCandleBreathe {
          0%, 100% { opacity: 0.72; transform: translate3d(0, 0, 0) scale(1); }
          28% { opacity: 0.96; transform: translate3d(6px, -4px, 0) scale(1.04); }
          52% { opacity: 0.64; transform: translate3d(-4px, 3px, 0) scale(0.98); }
          76% { opacity: 0.88; transform: translate3d(3px, 2px, 0) scale(1.02); }
        }
        @keyframes mapMoteFloat {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          18% { opacity: var(--mote-op, 0.45); }
          82% { opacity: var(--mote-op, 0.45); }
          100% { transform: translate3d(var(--drift-x, 18px), var(--drift-y, -28px), 0); opacity: 0; }
        }
        @keyframes mapWispDrift {
          0%, 100% { transform: translate3d(-3%, 0, 0) scale(1); opacity: 0.45; }
          50% { transform: translate3d(3%, -2%, 0) scale(1.06); opacity: 0.8; }
        }
      `}</style>

      {/* Breathing Lantern / Candlelight Pool */}
      <div
        className="pointer-events-none absolute -top-24 -left-20 w-[62vw] h-[62vw] max-w-[780px] max-h-[780px] rounded-full blur-3xl z-[1]"
        style={{
          background: `radial-gradient(circle, ${ambientPalette.candle} 0%, transparent 68%)`,
          animation: 'mapCandleBreathe 7.5s ease-in-out infinite',
        }}
      />

      {/* Low Incense / Table Mist Wisps */}
      <div
        className="pointer-events-none absolute -bottom-28 -right-24 w-[65vw] h-[42vh] rounded-full blur-3xl z-[1]"
        style={{
          background: `radial-gradient(ellipse at center, ${ambientPalette.wisp} 0%, transparent 72%)`,
          animation: 'mapWispDrift 16s ease-in-out infinite',
        }}
      />

      {/* Slow-Drifting Dust Motes in the Lamp Beam */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-[2]">
        {dustMotes.map(m => (
          <span
            key={m.id}
            className="absolute rounded-full"
            style={
              {
                left: m.left,
                top: m.top,
                width: `${m.size}px`,
                height: `${m.size}px`,
                backgroundColor: ambientPalette.mote,
                boxShadow: `0 0 ${m.size * 3}px ${ambientPalette.mote}`,
                '--drift-x': m.driftX,
                '--drift-y': m.driftY,
                '--mote-op': m.opacity,
                animation: `mapMoteFloat ${m.duration} ease-in-out ${m.delay} infinite`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Act 1-4 Atmospheric Weather Behind Map, Survey & Ledger (z-[4] < z-10) */}
      {(() => {
        const weatherAct = Math.min(4, Math.max(1, mapData.act));
        const hasMist = weatherAct === 1 || weatherAct === 2 || weatherAct === 3;
        const rainCount = weatherAct === 3 ? 84 : weatherAct === 2 ? 36 : 0;
        const hasLightning = weatherAct === 3;
        const hasFire = weatherAct === 4;

        return (
          <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden select-none">
            {hasMist && (
              <>
                <div
                  className="absolute -inset-x-[15%] bottom-[-12%] h-[62%]"
                  style={{
                    background:
                      weatherAct === 1
                        ? 'radial-gradient(ellipse at 30% 78%, rgba(212,208,198,0.38) 0%, rgba(152,148,140,0.22) 48%, transparent 76%)'
                        : weatherAct === 3
                          ? 'radial-gradient(ellipse at 30% 80%, rgba(165,180,196,0.24) 0%, rgba(110,125,140,0.13) 45%, transparent 74%)'
                          : 'radial-gradient(ellipse at 30% 80%, rgba(196,192,182,0.22) 0%, rgba(135,132,124,0.11) 45%, transparent 74%)',
                    filter: 'blur(26px)',
                    animation: 'weatherMistDriftA 22s ease-in-out infinite',
                  }}
                />
                <div
                  className="absolute -inset-x-[15%] bottom-[-8%] h-[50%]"
                  style={{
                    background:
                      weatherAct === 1
                        ? 'radial-gradient(ellipse at 72% 84%, rgba(206,200,188,0.34) 0%, rgba(138,134,126,0.19) 50%, transparent 78%)'
                        : weatherAct === 3
                          ? 'radial-gradient(ellipse at 72% 85%, rgba(155,172,190,0.22) 0%, rgba(95,112,130,0.11) 48%, transparent 76%)'
                          : 'radial-gradient(ellipse at 72% 85%, rgba(188,182,170,0.2) 0%, rgba(120,116,108,0.1) 48%, transparent 76%)',
                    filter: 'blur(32px)',
                    animation: 'weatherMistDriftB 29s ease-in-out infinite',
                  }}
                />
                {weatherAct === 1 && (
                  <div
                    className="absolute -inset-x-[12%] top-[14%] h-[42%]"
                    style={{
                      background:
                        'radial-gradient(ellipse at 52% 50%, rgba(202,198,188,0.2) 0%, rgba(140,136,128,0.1) 52%, transparent 78%)',
                      filter: 'blur(38px)',
                      animation: 'weatherMistDriftB 34s ease-in-out -11s infinite',
                    }}
                  />
                )}
              </>
            )}

            {rainCount > 0 && (
              <div className="absolute inset-0">
                {Array.from({ length: rainCount }, (_, i) => {
                  const h1 = Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
                  const h2 = Math.abs(Math.sin(i * 93.9898 + 67.345) * 24634.6345) % 1;
                  const h3 = Math.abs(Math.sin(i * 41.2317 + 19.871) * 15731.7431) % 1;
                  const leftPct = h1 * 118 - 2;
                  const durNum = weatherAct === 3
                    ? 0.42 + h3 * 0.28
                    : 0.72 + h3 * 0.38;
                  const duration = durNum.toFixed(2);
                  const delay = (-(h2 * durNum)).toFixed(3);
                  const heightPx = weatherAct === 3 ? 30 + (i % 4) * 10 : 18 + (i % 4) * 6;
                  const opacity = weatherAct === 3 ? 0.24 + (i % 3) * 0.09 : 0.15 + (i % 3) * 0.06;
                  return (
                    <span
                      key={`map-rain-${weatherAct}-${i}`}
                      className="absolute top-0 rounded-full"
                      style={{
                        left: `${leftPct}%`,
                        width: weatherAct === 3 ? '1.4px' : '1px',
                        height: `${heightPx}px`,
                        opacity,
                        background: 'linear-gradient(to bottom, transparent, rgba(208,224,242,0.88), rgba(186,208,232,0.28))',
                        animation: `weatherRainFall ${duration}s linear ${delay}s infinite`,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {hasLightning && (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 15%, rgba(215,232,255,0.85) 0%, rgba(168,196,238,0.35) 55%, rgba(120,145,190,0.12) 100%)',
                  mixBlendMode: 'screen',
                  animation: 'weatherLightningFlash 6.8s linear infinite',
                }}
              />
            )}

            {hasFire && (
              <>
                <div
                  className="absolute inset-x-0 bottom-0 h-[44%] origin-bottom"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 100%, rgba(234,88,12,0.34) 0%, rgba(185,28,28,0.2) 45%, transparent 78%)',
                    mixBlendMode: 'screen',
                    animation: 'weatherFireGlow 4.8s ease-in-out infinite',
                  }}
                />
                <div
                  className="absolute -inset-x-[12%] bottom-[-5%] h-[62%]"
                  style={{
                    background:
                      'radial-gradient(ellipse at 40% 75%, rgba(92,82,78,0.26) 0%, rgba(45,40,38,0.14) 50%, transparent 76%)',
                    filter: 'blur(36px)',
                    animation: 'weatherSmokeDrift 20s ease-in-out infinite',
                  }}
                />
                {Array.from({ length: 30 }, (_, i) => {
                  const leftPct = (i * 33.7 + 4) % 96;
                  const sizePx = 2 + (i % 3) * 1.4;
                  const duration = (4.2 + ((i * 13) % 10) * 0.42).toFixed(2);
                  const delay = -(((i * 0.67) % 6.5).toFixed(2));
                  const drift = ((i % 2 === 0 ? 1 : -1) * (18 + (i % 5) * 14));
                  return (
                    <span
                      key={`map-ember-${i}`}
                      className="absolute -bottom-3 rounded-full"
                      style={{
                        left: `${leftPct}%`,
                        width: `${sizePx}px`,
                        height: `${sizePx}px`,
                        backgroundColor: i % 3 === 0 ? '#fde68a' : i % 2 === 0 ? '#fb923c' : '#ef4444',
                        boxShadow: '0 0 8px rgba(251,146,60,0.85), 0 0 14px rgba(239,68,68,0.55)',
                        ['--ember-drift' as any]: `${drift}px`,
                        animation: `weatherEmberRise ${duration}s ease-out ${delay}s infinite`,
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
        );
      })()}

      {/* Engraved Stone Act Title Banner */}
      <div className="relative z-10 flex flex-col items-center text-center shrink-0 pt-0.5">
        <div className="flex items-center gap-3.5">
          <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#7a2420]/60 to-[#9c8870]/85" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.34em] text-[#bfa78b]">
            {mapData.actSubtitle}
          </span>
          <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent via-[#7a2420]/60 to-[#9c8870]/85" />
        </div>
        <h1 className="text-xl sm:text-2xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.24em] text-[#ebe3d5] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mt-0.5">
          {mapData.actTitle}
        </h1>
      </div>

      {/* Main Split: Aged Parchment Scroll + Cartographer's Ledger */}
      <div className="relative z-10 flex flex-col sm:flex-row items-stretch justify-center gap-3 lg:gap-6 w-full max-w-[1120px] flex-1 min-h-0 my-1.5 sm:my-2.5 overflow-visible">
        {/* CENTERPIECE: Unrolled Aged Parchment Map */}
        <div className="relative flex flex-col w-full sm:max-w-[560px] flex-1 min-h-0">
          {/* Top Wrought-Iron & Slate Scroll Rod */}
          <div className="relative z-20 h-6 w-[104%] -ml-[2%] rounded-[2px] bg-gradient-to-b from-[#2c282e] via-[#171519] to-[#0b0a0c] border border-[#524a48]/80 shadow-[0_6px_16px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-between px-2 shrink-0">
            <span className="w-3 h-2.5 rounded-[1px] bg-gradient-to-b from-[#a8957a] to-[#4a413b] border border-[#141215] shrink-0" />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={isAwayFromFigurine ? scrollToFigurine : scrollToBoss}
                className="px-2.5 py-0.5 rounded-[2px] bg-[#100e10]/95 hover:bg-[#1f1b20] border border-[#6e6258]/80 hover:border-[#d6c2a5] text-[8px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.22em] text-[#d6c2a5] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {isAwayFromFigurine ? 'RETURN' : 'TOP'}
              </button>
              <span className="w-3 h-2.5 rounded-[1px] bg-gradient-to-b from-[#a8957a] to-[#4a413b] border border-[#141215]" />
            </div>
          </div>

          {/* Scrollable Weathered Paper Viewport */}
          <div
            ref={scrollRef}
            onScroll={handleParchmentScroll}
            className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden border-x-2 border-[#383336] shadow-[0_22px_54px_rgba(0,0,0,0.94),inset_0_0_54px_rgba(14,11,16,0.78)]"
            style={{
              backgroundColor: '#9c9282',
              scrollbarWidth: 'thin',
              scrollbarColor: '#4e4749 #141215',
            }}
          >
            {/* Inner Cartographic Canvas (Mirrored Seamless mapbg.jpg Tiles + Dark Ink) */}
            <div className="relative w-full overflow-hidden" style={{ height: `${parchmentHeight}px` }}>
              {/* Seamless Mirrored Vertical Background Stack (eliminates horizontal tile seams on long acts) */}
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                {Array.from({ length: Math.max(1, Math.ceil(parchmentHeight / 520)) }, (_, tileIdx) => (
                  <div
                    key={tileIdx}
                    className="w-full"
                    style={{
                      height: '520px',
                      backgroundImage: `url(${import.meta.env.BASE_URL || './'}assets/text/mapbg.jpg)`,
                      backgroundSize: '100% 100%',
                      backgroundRepeat: 'no-repeat',
                      transform: tileIdx % 2 === 1 ? 'scaleY(-1)' : undefined,
                    }}
                  />
                ))}
                {/* Subtle Warm Parchment Contrast Wash & Edge Vignette */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 45%, rgba(220,210,192,0.18) 0%, rgba(24,18,15,0.48) 100%)',
                  }}
                />
              </div>

              {/* Hand-Ruled Dark Ink Border & Act Stamp */}
              <div className="pointer-events-none absolute inset-3 border border-[#120d0a]/70 z-0" />
              <div className="pointer-events-none absolute inset-4 border border-dashed border-[#120d0a]/45 z-0" />
              <div className="pointer-events-none absolute top-5 right-6 text-[10px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.28em] text-[#110c09]/90 drop-shadow-[0_1px_0_rgba(255,255,255,0.18)] z-0">
                ACT {['I', 'II', 'III', 'IV'][mapData.act - 1] || mapData.act}
              </div>

              {/* Hand-Inked Cartographic Backdrop (Borders, Folds, Topography, Act Landmarks & Compass) */}
              <svg
                viewBox={`0 0 ${cartography.vw} ${cartography.vh}`}
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
              >
                {/* Double-Lined Cartographer's Frame & Corner Flourishes */}
                <rect
                  x="10"
                  y="10"
                  width={cartography.vw - 20}
                  height={cartography.vh - 20}
                  fill="none"
                  stroke="#0d0a09"
                  strokeOpacity="0.72"
                  strokeWidth="1.6"
                />
                <rect
                  x="15"
                  y="15"
                  width={cartography.vw - 30}
                  height={cartography.vh - 30}
                  fill="none"
                  stroke="#0d0a09"
                  strokeOpacity="0.48"
                  strokeWidth="1"
                  strokeDasharray="6 4"
                />
                {/* Ornate Corner Ticks */}
                <path
                  d={`M 10 28 L 28 10 M ${cartography.vw - 10} 28 L ${cartography.vw - 28} 10 M 10 ${cartography.vh - 28} L 28 ${cartography.vh - 10} M ${cartography.vw - 10} ${cartography.vh - 28} L ${cartography.vw - 28} ${cartography.vh - 10}`}
                  stroke="#0d0a09"
                  strokeOpacity="0.78"
                  strokeWidth="1.5"
                />

                {/* Boss Sanctum Bloodbath Drip Hanging from Top Apex */}
                <image
                  href={`${import.meta.env.BASE_URL || './'}assets/text/bloodbath.png`}
                  x="0"
                  y="0"
                  width={cartography.vw}
                  height="275"
                  preserveAspectRatio="none"
                  opacity="0.86"
                  style={{ mixBlendMode: 'multiply' }}
                />

                {/* Blood Splatters & Smears (blood01-04.png) */}
                {cartography.stains.map(st => (
                  <g
                    key={st.id}
                    transform={`translate(${st.cx} ${st.cy}) rotate(${st.rot})`}
                    opacity={st.opacity}
                    style={{ mixBlendMode: 'multiply' }}
                  >
                    <image
                      href={`${import.meta.env.BASE_URL || './'}assets/text/blood0${st.variant}.png`}
                      x={-st.size / 2}
                      y={-st.size / 2}
                      width={st.size}
                      height={st.size}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                ))}

                {/* Horizontal Scroll-Fold Creases */}
                {cartography.folds.map((fy, idx) => (
                  <g key={`fold-${idx}`}>
                    <line x1="12" y1={fy} x2={cartography.vw - 12} y2={fy} stroke="#0f0a07" strokeOpacity="0.34" strokeWidth="1.3" />
                    <line x1="12" y1={fy + 1.5} x2={cartography.vw - 12} y2={fy + 1.5} stroke="#f7e8c8" strokeOpacity="0.2" strokeWidth="1" />
                  </g>
                ))}

                {/* Topographic Elevation Contours */}
                {cartography.contours.map(ct => (
                  <g key={ct.id} transform={`translate(${ct.cx} ${ct.cy}) rotate(${ct.rot})`} fill="none" stroke="#120e0b" strokeOpacity="0.38">
                    <ellipse cx="0" cy="0" rx={ct.rx} ry={ct.ry} strokeWidth="1.15" strokeDasharray="5 4" />
                    <ellipse cx="0" cy="0" rx={ct.rx * 0.66} ry={ct.ry * 0.66} strokeWidth="0.95" />
                    <ellipse cx="0" cy="0" rx={ct.rx * 0.34} ry={ct.ry * 0.34} strokeWidth="0.8" strokeDasharray="3 3" />
                  </g>
                ))}

                {/* Left-Margin Mile-Marker Ticks */}
                {Array.from({ length: mapData.rows }, (_, r) => {
                  const rowNode = mapData.nodes.find(n => n.row === r);
                  if (!rowNode) return null;
                  const ry = (rowNode.y / 100) * cartography.vh;
                  return (
                    <g key={`tick-${r}`} opacity="0.84" stroke="#0d0a08" fill="#0d0a08">
                      <line x1="15" y1={ry} x2="23" y2={ry} strokeWidth="1.3" />
                      <text x="26" y={ry + 3} fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.8">
                        {r === 0 ? 'START' : r === mapData.rows - 1 ? 'APEX' : String(r).padStart(2, '0')}
                      </text>
                    </g>
                  );
                })}

                {/* Hand-Inked Compass Rose (Bottom-Right near Trailhead) */}
                <g
                  transform={`translate(${cartography.vw - 64} ${cartography.vh - 68})`}
                  opacity="0.84"
                  stroke="#0f0b09"
                  fill="none"
                >
                  <circle cx="0" cy="0" r="24" strokeWidth="1.3" />
                  <circle cx="0" cy="0" r="20" strokeWidth="0.9" strokeDasharray="2 2" />
                  <path d="M0 -28 L4 -4 L28 0 L4 4 L0 28 L-4 4 L-28 0 L-4 -4 Z" fill="rgba(18,12,9,0.34)" strokeWidth="1.2" />
                  <path d="M0 -28 L0 0 L4 -4 Z M28 0 L0 0 L4 4 Z M0 28 L0 0 L-4 4 Z M-28 0 L0 0 L-4 -4 Z" fill="#0f0b09" stroke="none" opacity="0.88" />
                  <text x="-3.5" y="-31" fontSize="9" fontFamily="serif" fontWeight="bold" fill="#0f0b09" stroke="none">N</text>
                </g>
              </svg>

              {/* Hand-Inked Branching SVG Trails */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
              >
                {mapData.nodes.map(node =>
                  node.nextIds.map(targetId => {
                    const target = nodeMap.get(targetId);
                    if (!target) return null;

                    const edgeKey = `${node.id}->${target.id}`;
                    const isWalked = walkedEdgeKeys.has(edgeKey);
                    const isActiveChoice = node.id === mapData.currentNodeId && reachableIds.has(target.id);
                    const isTraced = tracedPath.edges.has(edgeKey);
                    const hasActiveTrace = tracedPath.edges.size > 0;
                    const isEdgeLockedOut =
                      !isWalked && (!futureReachableIds.has(node.id) || !futureReachableIds.has(target.id));

                    const midX = (node.x + target.x) / 2 + (node.col % 2 === 0 ? 1.8 : -1.8);
                    const midY = (node.y + target.y) / 2;
                    const pathD = `M ${node.x} ${node.y} Q ${midX} ${midY} ${target.x} ${target.y}`;

                    return (
                      <g key={edgeKey}>
                        {(isActiveChoice || isTraced) && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isTraced ? 'rgba(212, 165, 62, 0.48)' : 'rgba(165, 36, 26, 0.32)'}
                            strokeWidth={isTraced ? '4.8' : '3.6'}
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                          />
                        )}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={
                            isTraced
                              ? '#8f160d'
                              : isWalked
                                ? '#3b0b08'
                                : isEdgeLockedOut
                                  ? 'rgba(14, 11, 10, 0.36)'
                                  : isActiveChoice
                                    ? hasActiveTrace
                                      ? 'rgba(122, 20, 14, 0.5)'
                                      : '#78140d'
                                    : hasActiveTrace
                                      ? 'rgba(14, 11, 10, 0.48)'
                                      : 'rgba(14, 11, 10, 0.86)'
                          }
                          strokeWidth={
                            isTraced
                              ? 3.1
                              : isWalked
                                ? 3.0
                                : isEdgeLockedOut
                                  ? 1.45
                                  : isActiveChoice
                                    ? 2.7
                                    : 2.05
                          }
                          strokeDasharray={
                            isWalked || isTraced ? undefined : isActiveChoice ? '5 3.5' : '3.5 4'
                          }
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  })
                )}
              </svg>

              {/* Map Nodes */}
              {mapData.nodes.map(node => {
                const isCurrent = node.id === mapData.currentNodeId;
                const isReachable = reachableIds.has(node.id);
                const isVisited = visitedSet.has(node.id) && !isCurrent;
                const isBoss = node.type === 'boss';
                const isCombat = node.type === 'combat' || node.type === 'elite_combat';
                const isHovered = hoveredNodeId === node.id;
                const isLockedOut = !isCurrent && !isVisited && !futureReachableIds.has(node.id);
                const isOnTracedPath = tracedPath.nodes.has(node.id) && !isCurrent;
                const meta = isBoss
                  ? { title: bossMeta.name, tag: 'Boss' }
                  : MAP_NODE_META[node.type];

                return (
                  <div
                    key={node.id}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    onMouseEnter={() => handleHoverNode(node)}
                    onMouseLeave={() => {
                      lastTickNodeRef.current = null;
                      setHoveredNodeId(prev => (prev === node.id ? null : prev));
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-opacity duration-200 ${
                      isHovered ? 'z-40' : isOnTracedPath ? 'z-30' : isCurrent ? 'z-30' : isReachable ? 'z-20' : 'z-10'
                    } ${isLockedOut && !isHovered ? 'opacity-40 saturate-50' : 'opacity-100'}`}
                  >

                    {/* Node Stamp Button */}
                    <button
                      type="button"
                      aria-disabled={!isReachable}
                      onFocus={() => setHoveredNodeId(node.id)}
                      onBlur={() => setHoveredNodeId(prev => (prev === node.id ? null : prev))}
                      onClick={() => isReachable && onSelectNode(node)}
                      aria-label={meta.title}
                      className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
                        isBoss ? 'w-14 h-14' : 'w-11 h-11'
                      } ${
                        isOnTracedPath && !isBoss
                          ? 'ring-2 ring-[#cbb698]/90 shadow-[0_0_16px_rgba(199,172,134,0.55)] scale-105 '
                          : ''
                      }${
                        isBoss
                          ? isReachable
                            ? 'bg-gradient-to-b from-[#3d1113] to-[#170709] border-2 border-[#d6b888] text-[#f3e1be] shadow-[0_0_24px_rgba(165,28,24,0.85),0_6px_14px_rgba(0,0,0,0.75)] hover:scale-115 cursor-pointer animate-pulse'
                            : 'bg-gradient-to-b from-[#251012] to-[#11080a] border-2 border-[#6e5c4c] text-[#cbb698] shadow-[0_5px_14px_rgba(0,0,0,0.7)] hover:border-[#d6b888] hover:scale-105 cursor-help'
                          : isCurrent
                            ? 'bg-[#161418] border-2 border-[#a83228] text-[#ebe3d5] shadow-[0_0_16px_rgba(145,28,22,0.55),0_4px_10px_rgba(0,0,0,0.75)] cursor-default'
                            : isReachable
                              ? isCombat
                                ? 'bg-gradient-to-b from-[#2b1214] to-[#13090b] hover:from-[#3d171a] hover:to-[#1b0c0f] border-2 border-[#b5372e] text-[#f0b4aa] shadow-[0_0_18px_rgba(166,34,24,0.55),0_4px_10px_rgba(0,0,0,0.7)] hover:scale-115 cursor-pointer'
                                : 'bg-gradient-to-b from-[#242027] to-[#110f14] hover:from-[#322d36] hover:to-[#19161e] border-2 border-[#9e8a70] text-[#ebe1cf] shadow-[0_0_16px_rgba(143,121,96,0.45),0_4px_10px_rgba(0,0,0,0.7)] hover:scale-115 cursor-pointer'
                              : isVisited
                                ? 'bg-[#121013]/85 border border-[#3d3530]/75 text-[#8a8078]/70 shadow-[0_3px_8px_rgba(0,0,0,0.7)] hover:brightness-110 hover:scale-105 cursor-help'
                                : isCombat
                                  ? 'bg-[#170c0e] border-2 border-[#7d2c26] text-[#e8a8a0] shadow-[0_4px_12px_rgba(0,0,0,0.85)] hover:brightness-115 hover:scale-105 cursor-help'
                                  : 'bg-[#110f13] border-2 border-[#5c5048] text-[#dfd5c5] shadow-[0_4px_12px_rgba(0,0,0,0.85)] hover:brightness-115 hover:scale-105 cursor-help'
                      }`}
                    >
                      {/* Pulsing Outer Ring for Reachable Choices */}
                      {isReachable && !isBoss && (
                        <span
                          className={`pointer-events-none absolute -inset-1.5 rounded-full border-2 animate-ping [animation-duration:2.2s] ${
                            isCombat ? 'border-[#b5372e]/60' : 'border-[#9e8a70]/55'
                          }`}
                        />
                      )}

                      {isCurrent ? (
                        <svg viewBox="0 0 24 28" className="w-6 h-7 -translate-y-0.5 drop-shadow-[0_3px_4px_rgba(0,0,0,0.8)] animate-bounce [animation-duration:2.4s]">
                          <circle cx="12" cy="6.5" r="4.5" fill="#100e12" stroke="#d6c2a5" strokeWidth="1.7" />
                          <path d="M6 24.5c.6-6.2 2.4-10.2 6-10.2s5.4 4 6 10.2H6Z" fill="#100e12" stroke="#d6c2a5" strokeWidth="1.7" />
                        </svg>
                      ) : (
                        renderInkGlyph(node.type, isBoss)
                      )}

                      {/* Crimson Wax X over Visited Nodes */}
                      {isVisited && (
                        <svg viewBox="0 0 24 24" className="pointer-events-none absolute inset-0 w-full h-full text-[#9c2a22]/85" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                          <path d="M5 5l14 14M19 5L5 19" />
                        </svg>
                      )}
                    </button>

                    {/* Carved-Slate Caption (Out-of-flow so hover never shifts the node) */}
                    {(isCurrent && !isBoss) || isBoss || isReachable || isHovered ? (
                      <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1 flex flex-col items-center gap-0.5 z-40">
                        {isCurrent && !isBoss && (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#100e10]/94 border border-[#8f7960]/85 text-[7.5px] font-mono font-bold uppercase tracking-[0.22em] text-[#ebe1cf] shadow-sm whitespace-nowrap">
                            You
                          </span>
                        )}
                        {(isBoss || isReachable || isHovered) && (
                          <span
                            className={`px-1.5 py-0.5 rounded-[2px] text-[8.5px] font-bold uppercase tracking-[0.14em] whitespace-nowrap shadow-sm ${
                              isBoss
                                ? 'bg-[#250b0c]/94 text-[#f3e1be] border border-[#8f7960]/80 font-[\'Cinzel\',_serif]'
                                : 'bg-[#121014]/92 text-[#e6dac6] border border-[#524844]/80'
                            }`}
                          >
                            {meta.title}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Wrought-Iron & Slate Scroll Rod */}
          <div className="relative z-20 h-4 w-[104%] -ml-[2%] rounded-[2px] bg-gradient-to-b from-[#2c282e] via-[#171519] to-[#0b0a0c] border border-[#524a48]/80 shadow-[0_-4px_14px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between px-2 shrink-0">
            <span className="w-3 h-2 rounded-[1px] bg-gradient-to-b from-[#a8957a] to-[#4a413b] border border-[#141215]" />
            <span className="w-3 h-2 rounded-[1px] bg-gradient-to-b from-[#a8957a] to-[#4a413b] border border-[#141215]" />
          </div>
        </div>

        {/* RIGHT FLANK: Cartographer's Omen Inspector & Expedition Ledger */}
        <div className="w-full sm:w-[240px] md:w-[280px] lg:w-[330px] max-h-[38%] sm:max-h-none flex flex-row sm:flex-col justify-between gap-2.5 lg:gap-4 shrink-0 min-h-0 overflow-y-auto sm:overflow-visible">
          {/* Omen / Node Inspector — Hanging Ritual Cloth Banner */}
          <div className="relative flex-1 flex flex-col min-h-0">
            {/* Top Timber & Brass Banner Rod */}
            <div
              className="relative z-20 h-3 w-[103%] -ml-[1.5%] rounded-full border border-[#8f6d4a]/90 shadow-[0_5px_12px_rgba(0,0,0,0.92)] flex items-center justify-between px-1 shrink-0"
              style={{
                backgroundColor: '#3a271a',
                backgroundImage: `linear-gradient(to bottom, rgba(102,73,51,0.52), rgba(42,27,18,0.62), rgba(20,12,8,0.84)), url("${import.meta.env.BASE_URL || './'}assets/text/wood.jpg")`,
                backgroundSize: '140px 140px',
                backgroundRepeat: 'repeat',
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#2b1d12] border border-[#cfa76b]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2b1d12] border border-[#cfa76b]" />
            </div>

            <div
              className="relative flex-1 flex flex-col justify-center px-5 pt-3.5 pb-5 lg:px-6 lg:pt-4 lg:pb-6 -mt-0.5 rounded-b-[14px] border-x border-b border-[#7a3c2e]/90 shadow-[0_18px_42px_rgba(0,0,0,0.92),inset_0_12px_26px_rgba(0,0,0,0.72)] overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, #6b0f12 0%, #44080a 52%, #1d0405 100%)',
              }}
            >
              {/* Multiplied Cloth Weave Texture (preserves deep crimson without pink washout) */}
              <div
                className="pointer-events-none absolute inset-0 opacity-65 mix-blend-multiply"
                style={{
                  backgroundImage: `url("${import.meta.env.BASE_URL || './'}assets/text/cloth.jpg")`,
                  backgroundSize: '170px 170px',
                  backgroundRepeat: 'repeat',
                }}
              />
              {/* Stitched Gold-Thread Banner Seam */}
              <div className="pointer-events-none absolute inset-2 border border-dashed border-[#c49a5c]/50 rounded-b-[10px]" />
              {/* Woven Center Fringe Accent at Bottom Hem */}
              <div className="pointer-events-none absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#3a0a0a] via-[#cca059]/80 to-[#3a0a0a]" />

            <div className="relative z-10 flex flex-col h-full min-h-0">
              {/* Header Bar */}
              <div className="shrink-0 flex items-center justify-between pb-2 mb-2.5 border-b border-[#7c2620]/80">
                <span className="flex items-center gap-1.5 text-xs font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#ecd8b8] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                  <span className="text-[#c99b56]">◆</span>
                  {isInspectedReachable ? 'Reachable Omen' : 'Map Survey'}
                </span>
                {inspectedMeta && (
                  <span
                    className={`px-2 py-0.5 rounded-[2px] border text-[9.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.16em] ${
                      inspectedMeta.tone === 'boss' || inspectedMeta.tone === 'combat'
                        ? 'bg-[#2b0607]/90 border-red-600/85 text-red-200'
                        : 'bg-[#22090a]/90 border-[#8a5d42]/85 text-[#f0dec0]'
                    }`}
                  >
                    {inspectedMeta.tag}
                  </span>
                )}
              </div>

              {inspectedNode && inspectedMeta && (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-2 pb-2">
                  {/* Carved Stone Glyph Medallion */}
                  <div className="relative mb-2.5 shrink-0">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-[0_8px_20px_rgba(0,0,0,0.9),inset_0_0_12px_rgba(0,0,0,0.8)] ${
                        inspectedMeta.tone === 'boss'
                          ? 'bg-gradient-to-b from-[#450d0d] to-[#1a0505] border-[#c49f62]/90 text-[#f5dfb4]'
                          : inspectedMeta.tone === 'combat'
                            ? 'bg-gradient-to-b from-[#340d0e] to-[#160607] border-[#a13630]/90 text-[#f2b8ae]'
                            : 'bg-gradient-to-b from-[#261619] to-[#12090b] border-[#8c7462]/90 text-[#efe2cc]'
                      }`}
                    >
                      {renderInkGlyph(inspectedNode.type, inspectedNode.type === 'boss')}
                    </div>
                    <span className="pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-[#a68356]/45" />
                  </div>

                  <h2 className="text-lg lg:text-xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.18em] text-[#f7ead3] leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                    {inspectedMeta.title}
                  </h2>

                  <div className="flex items-center justify-center gap-2.5 w-full my-2.5 shrink-0">
                    <span className="h-px flex-1 max-w-[58px] bg-gradient-to-r from-transparent via-[#b52c26]/75 to-[#c49a5c]/85" />
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#3a0a0a] border border-[#c49a5c]/85" />
                    <span className="h-px flex-1 max-w-[58px] bg-gradient-to-l from-transparent via-[#b52c26]/75 to-[#c49a5c]/85" />
                  </div>

                  <p className="text-xs lg:text-[13.5px] font-['Cinzel',_serif] italic tracking-[0.04em] text-[#f2e2c9] leading-snug px-1.5 drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                    {inspectedMeta.desc}
                  </p>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Expedition Status & Act Boss Telemetry — Hanging Ritual Cloth Banner */}
          <div className="relative flex flex-col">
            {/* Top Timber & Brass Banner Rod */}
            <div
              className="relative z-20 h-3 w-[103%] -ml-[1.5%] rounded-full border border-[#8f6d4a]/90 shadow-[0_5px_12px_rgba(0,0,0,0.92)] flex items-center justify-between px-1 shrink-0"
              style={{
                backgroundColor: '#3a271a',
                backgroundImage: `linear-gradient(to bottom, rgba(102,73,51,0.52), rgba(42,27,18,0.62), rgba(20,12,8,0.84)), url("${import.meta.env.BASE_URL || './'}assets/text/wood.jpg")`,
                backgroundSize: '140px 140px',
                backgroundRepeat: 'repeat',
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#2b1d12] border border-[#cfa76b]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2b1d12] border border-[#cfa76b]" />
            </div>

            <div
              className="relative px-5 pt-4 pb-5 -mt-0.5 rounded-b-[14px] border-x border-b border-[#7a3c2e]/90 shadow-[0_16px_34px_rgba(0,0,0,0.92),inset_0_10px_22px_rgba(0,0,0,0.72)] overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, #610d10 0%, #3d0709 54%, #1a0304 100%)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-65 mix-blend-multiply"
                style={{
                  backgroundImage: `url("${import.meta.env.BASE_URL || './'}assets/text/cloth.jpg")`,
                  backgroundSize: '170px 170px',
                  backgroundRepeat: 'repeat',
                }}
              />
              <div className="pointer-events-none absolute inset-2 border border-dashed border-[#c49a5c]/45 rounded-b-[10px]" />
              <div className="pointer-events-none absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#3a0a0a] via-[#cca059]/80 to-[#3a0a0a]" />

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#6b3428]/80">
                <span className="flex items-center gap-1.5 text-xs font-['Cinzel',_serif] font-bold uppercase tracking-[0.22em] text-[#ecd8b8] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                  <span className="text-[#c99b56]">◆</span>
                  Expedition Ledger
                </span>
              </div>

              <div className="divide-y divide-[#4d201c]/80 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em]">Act Boss</span>
                  <span className="font-['Cinzel',_serif] font-bold text-sm text-red-200 uppercase tracking-[0.14em] drop-shadow-[0_1px_6px_rgba(185,28,28,0.65)]">
                    {bossMeta.name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em]">Creatures</span>
                  <span className="px-2 py-0.5 rounded-[2px] bg-[#1a0c0d]/90 border border-[#6e4636] font-mono font-bold text-xs text-[#f5e7cf]">
                    {deckSize}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em]">Overkill Blood</span>
                  <span className="px-2 py-0.5 rounded-[2px] bg-[#2b090b]/90 border border-red-800/80 font-mono font-bold text-xs text-red-200">
                    {overkillBlood} oz
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em]">Starting Bones</span>
                  <span className="px-2 py-0.5 rounded-[2px] bg-[#1a0c0d]/90 border border-[#6e4636] font-mono font-bold text-xs text-[#f5e7cf]">
                    {startingBones}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em] shrink-0">Effigy</span>
                  <span className="font-['Cinzel',_serif] font-bold text-xs text-[#efd4a0] truncate text-right tracking-[0.08em]">
                    {activeTotem?.head && activeTotem?.body
                      ? `${activeTotem.head} / ${activeTotem.body}`
                      : 'Unstitched'}
                  </span>
                </div>
              </div>

              {activeVows.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#2c272b] flex flex-wrap gap-1">
                  {activeVows.map(vId => (
                    <span
                      key={vId}
                      title={RITUAL_VOW_MAP[vId]?.desc}
                      className="px-1.5 py-0.5 rounded-[2px] bg-[#260c0a]/90 border border-red-800/75 text-[8.5px] font-mono font-bold uppercase tracking-[0.1em] text-red-200/95"
                    >
                      ✦ {RITUAL_VOW_MAP[vId]?.shortTag || vId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
