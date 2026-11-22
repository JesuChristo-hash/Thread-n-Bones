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
  const stroke = isBoss ? '#f6d79c' : 'currentColor';
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
    default:
      return null;
  }
};

type DecorKind =
  | 'pine'
  | 'deadtree'
  | 'reeds'
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
  const ink = '#362313';
  switch (d.kind) {
    case 'pine':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -14 L-6 -4 L-2 -4 L-8 5 L-3 5 L-9 13 L9 13 L3 5 L8 5 L2 -4 L6 -4 Z" fill="rgba(54,35,19,0.14)" />
          <path d="M0 13 L0 18 M-5 18 Q0 16.5 5 18" />
        </g>
      );
    case 'deadtree':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.3" strokeLinecap="round">
          <path d="M0 16 Q-1 6 0 -2 M0 4 L-9 -4 M-5 0 L-10 2 M0 -2 L8 -10 M4 -6 L10 -5 M0 -2 L-4 -12" />
          <path d="M-6 16 Q0 14.5 6 16" strokeWidth="0.9" />
        </g>
      );
    case 'reeds':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="none" strokeWidth="1.1" strokeLinecap="round">
          <path d="M-5 10 Q-7 0 -4 -10 M0 10 Q1 -2 0 -13 M5 10 Q7 1 5 -8" />
          <path d="M-9 10 Q0 8 9 10 M-7 13 Q0 11.5 7 13" strokeWidth="0.8" />
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
          <path d="M-7 1 C-8 -8 8 -8 7 1 C7 5 4 6 4 9 L-4 9 C-4 6 -7 5 -7 1 Z" fill="rgba(54,35,19,0.1)" />
          <circle cx="-2.6" cy="0.5" r="1.4" fill={ink} />
          <circle cx="2.6" cy="0.5" r="1.4" fill={ink} />
          <path d="M0 3.2 L-0.8 4.8 L0.8 4.8 Z M-2 9 L-2 6.8 M0 9 L0 6.8 M2 9 L2 6.8" />
        </g>
      );
    case 'cairn':
      return (
        <g key={d.id} transform={transform} opacity={d.opacity} stroke={ink} fill="rgba(54,35,19,0.12)" strokeWidth="1.15">
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
          <rect x="-3" y="-2" width="6" height="14" rx="1" fill="rgba(54,35,19,0.1)" />
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
          <circle cx="0" cy="0" r="8" fill="rgba(54,35,19,0.18)" />
          <circle cx="3" cy="-1.5" r="7" fill="#d9c298" stroke="none" />
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
      1: ['pine', 'pine', 'deadtree', 'reeds'],
      2: ['ribcage', 'skull', 'cairn', 'deadtree'],
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
        rot: kind === 'arch' || kind === 'candle' || kind === 'pine' ? Math.round((rng() - 0.5) * 10) : Math.round((rng() - 0.5) * 32),
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

    // Faint aged ink/water stains
    const stains = Array.from({ length: Math.max(4, Math.floor(mapData.rows / 2.5)) }, (_, i) => ({
      id: `st-${i}`,
      cx: Math.round(45 + rng() * (vw - 90)),
      cy: Math.round(90 + rng() * (vh - 180)),
      r: Math.round(18 + rng() * 32),
      isBlood: rng() < 0.35,
    }));

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
      className="absolute inset-0 bg-[#0b0705] z-50 flex flex-col items-center justify-between px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto md:overflow-hidden font-mono select-none animate-fade-up"
      style={bgStyle}
    >
      {/* Atmospheric Tabletop Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.34)_0%,rgba(5,3,2,0.88)_100%)] pointer-events-none z-0" />

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

      {/* Engraved Act Title Banner */}
      <div className="relative z-10 flex flex-col items-center text-center shrink-0 pt-0.5">
        <div className="flex items-center gap-4">
          <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.34em] text-[#c79d5a]">
            {mapData.actSubtitle}
          </span>
          <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
        </div>
        <h1 className="text-xl sm:text-2xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.24em] text-[#efe0be] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mt-0.5">
          {mapData.actTitle}
        </h1>
      </div>

      {/* Main Split: Aged Parchment Scroll + Cartographer's Ledger */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch justify-center gap-4 lg:gap-6 w-full max-w-[1120px] flex-1 min-h-0 my-2 sm:my-3">
        {/* CENTERPIECE: Unrolled Aged Parchment Map */}
        <div className="relative flex flex-col w-full max-w-[560px] flex-1 min-h-[380px] md:min-h-0">
          {/* Top Wooden Scroll Dowel */}
          <div className="relative z-20 h-6 w-[104%] -ml-[2%] rounded-full bg-gradient-to-b from-[#4c3320] via-[#2b1a0e] to-[#120a05] border border-[#6e4c2e]/70 shadow-[0_6px_14px_rgba(0,0,0,0.9)] flex items-center justify-between px-2 shrink-0">
            <span className="w-3 h-2.5 rounded-full bg-gradient-to-b from-[#d4af37] to-[#6e4e18] border border-[#2a1a07] shrink-0" />
            <span className="text-[8px] font-mono uppercase tracking-[0.28em] text-[#bfa072]/75 truncate px-2">
              Ascend Toward {bossMeta.name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={isAwayFromFigurine ? scrollToFigurine : scrollToBoss}
                className="px-2 py-0.5 rounded-full bg-[#1e120a]/90 hover:bg-[#331e10] border border-[#9e773e]/75 hover:border-[#e6be72] text-[8px] font-mono font-bold uppercase tracking-[0.16em] text-[#e6c88e] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {isAwayFromFigurine ? 'Figurine ↓' : 'Scout Boss ↑'}
              </button>
              <span className="w-3 h-2.5 rounded-full bg-gradient-to-b from-[#d4af37] to-[#6e4e18] border border-[#2a1a07]" />
            </div>
          </div>

          {/* Scrollable Weathered Paper Viewport */}
          <div
            ref={scrollRef}
            onScroll={handleParchmentScroll}
            className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden border-x-2 border-[#3c2716] shadow-[0_22px_50px_rgba(0,0,0,0.92),inset_0_0_48px_rgba(45,26,11,0.72)]"
            style={{
              backgroundColor: '#c7ae82',
              backgroundImage: `
                radial-gradient(ellipse at 50% 20%, rgba(246,232,199,0.45) 0%, rgba(196,168,118,0.2) 55%, rgba(92,62,32,0.55) 100%),
                repeating-linear-gradient(0deg, rgba(66,43,21,0.035) 0px, rgba(66,43,21,0.035) 1px, transparent 1px, transparent 5px),
                repeating-linear-gradient(90deg, rgba(66,43,21,0.025) 0px, rgba(66,43,21,0.025) 1px, transparent 1px, transparent 7px)
              `,
              scrollbarWidth: 'thin',
              scrollbarColor: '#5c4026 #22160d',
            }}
          >
            {/* Inner Cartographic Canvas (Scaled Dynamically to Act Row Count) */}
            <div className="relative w-full" style={{ height: `${parchmentHeight}px` }}>
              {/* Faint Hand-Ruled Border & Compass Watermark */}
              <div className="pointer-events-none absolute inset-3 border border-[#4a321b]/35" />
              <div className="pointer-events-none absolute inset-4 border border-dashed border-[#4a321b]/20" />
              <div className="pointer-events-none absolute top-5 right-6 text-[9px] font-['Cinzel',_serif] uppercase tracking-[0.28em] text-[#4b321b]/55">
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
                  stroke="#3b2615"
                  strokeOpacity="0.34"
                  strokeWidth="1.4"
                />
                <rect
                  x="15"
                  y="15"
                  width={cartography.vw - 30}
                  height={cartography.vh - 30}
                  fill="none"
                  stroke="#3b2615"
                  strokeOpacity="0.22"
                  strokeWidth="0.9"
                  strokeDasharray="6 4"
                />
                {/* Ornate Corner Ticks */}
                <path
                  d={`M 10 28 L 28 10 M ${cartography.vw - 10} 28 L ${cartography.vw - 28} 10 M 10 ${cartography.vh - 28} L 28 ${cartography.vh - 10} M ${cartography.vw - 10} ${cartography.vh - 28} L ${cartography.vw - 28} ${cartography.vh - 10}`}
                  stroke="#3b2615"
                  strokeOpacity="0.38"
                  strokeWidth="1.2"
                />

                {/* Aged Water & Blood Ring Stains */}
                {cartography.stains.map(st => (
                  <g key={st.id} opacity={st.isBlood ? 0.11 : 0.1}>
                    <circle
                      cx={st.cx}
                      cy={st.cy}
                      r={st.r}
                      fill={st.isBlood ? '#6e1712' : '#5e4022'}
                    />
                    <circle
                      cx={st.cx}
                      cy={st.cy}
                      r={st.r * 0.92}
                      fill="none"
                      stroke={st.isBlood ? '#4d0e0a' : '#3d2814'}
                      strokeWidth="1.1"
                    />
                  </g>
                ))}

                {/* Horizontal Scroll-Fold Creases */}
                {cartography.folds.map((fy, idx) => (
                  <g key={`fold-${idx}`}>
                    <line x1="12" y1={fy} x2={cartography.vw - 12} y2={fy} stroke="#2a1a0d" strokeOpacity="0.14" strokeWidth="1.2" />
                    <line x1="12" y1={fy + 1.5} x2={cartography.vw - 12} y2={fy + 1.5} stroke="#f7e8c8" strokeOpacity="0.18" strokeWidth="1" />
                  </g>
                ))}

                {/* Topographic Elevation Contours */}
                {cartography.contours.map(ct => (
                  <g key={ct.id} transform={`translate(${ct.cx} ${ct.cy}) rotate(${ct.rot})`} fill="none" stroke="#3b2615" strokeOpacity="0.14">
                    <ellipse cx="0" cy="0" rx={ct.rx} ry={ct.ry} strokeWidth="1" strokeDasharray="5 4" />
                    <ellipse cx="0" cy="0" rx={ct.rx * 0.66} ry={ct.ry * 0.66} strokeWidth="0.85" />
                    <ellipse cx="0" cy="0" rx={ct.rx * 0.34} ry={ct.ry * 0.34} strokeWidth="0.7" strokeDasharray="3 3" />
                  </g>
                ))}

                {/* Boss Sanctum Arcane Halo at the Top Apex */}
                <g transform={`translate(${cartography.bossPx.x} ${cartography.bossPx.y})`} opacity="0.28" stroke="#4f1610" fill="none">
                  <circle cx="0" cy="0" r="46" strokeWidth="1.2" strokeDasharray="4 3" />
                  <circle cx="0" cy="0" r="56" strokeWidth="0.85" />
                  <path d="M-64 0 L-48 0 M48 0 L64 0 M0 -64 L0 -48 M0 48 L0 64" strokeWidth="1.1" />
                  <path d="M-42 -42 L-33 -33 M42 -42 L33 -33 M-42 42 L-33 33 M42 42 L33 33" strokeWidth="0.9" />
                </g>

                {/* Act-Themed Margin Illustrations */}
                {cartography.props.map(renderCartographyProp)}

                {/* Left-Margin Mile-Marker Ticks */}
                {Array.from({ length: mapData.rows }, (_, r) => {
                  const rowNode = mapData.nodes.find(n => n.row === r);
                  if (!rowNode) return null;
                  const ry = (rowNode.y / 100) * cartography.vh;
                  return (
                    <g key={`tick-${r}`} opacity="0.32" stroke="#3b2615" fill="#3b2615">
                      <line x1="15" y1={ry} x2="23" y2={ry} strokeWidth="1" />
                      <text x="26" y={ry + 3} fontSize="7.5" fontFamily="monospace" letterSpacing="0.8">
                        {r === 0 ? 'START' : r === mapData.rows - 1 ? 'APEX' : String(r).padStart(2, '0')}
                      </text>
                    </g>
                  );
                })}

                {/* Hand-Inked Compass Rose (Bottom-Right near Trailhead) */}
                <g
                  transform={`translate(${cartography.vw - 64} ${cartography.vh - 68})`}
                  opacity="0.36"
                  stroke="#362212"
                  fill="none"
                >
                  <circle cx="0" cy="0" r="24" strokeWidth="1" />
                  <circle cx="0" cy="0" r="20" strokeWidth="0.7" strokeDasharray="2 2" />
                  <path d="M0 -28 L4 -4 L28 0 L4 4 L0 28 L-4 4 L-28 0 L-4 -4 Z" fill="rgba(54,34,18,0.16)" strokeWidth="1" />
                  <path d="M0 -28 L0 0 L4 -4 Z M28 0 L0 0 L4 4 Z M0 28 L0 0 L-4 4 Z M-28 0 L0 0 L-4 -4 Z" fill="#362212" stroke="none" opacity="0.55" />
                  <text x="-3.2" y="-31" fontSize="8" fontFamily="serif" fontWeight="bold" fill="#362212" stroke="none">N</text>
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
                              ? '#a82317'
                              : isWalked
                                ? '#5f1812'
                                : isEdgeLockedOut
                                  ? 'rgba(54, 36, 20, 0.16)'
                                  : isActiveChoice
                                    ? hasActiveTrace
                                      ? 'rgba(140, 34, 24, 0.35)'
                                      : '#8c2218'
                                    : hasActiveTrace
                                      ? 'rgba(54, 36, 20, 0.2)'
                                      : 'rgba(54, 36, 20, 0.45)'
                          }
                          strokeWidth={
                            isTraced
                              ? 2.6
                              : isWalked
                                ? 2.6
                                : isEdgeLockedOut
                                  ? 1.15
                                  : isActiveChoice
                                    ? 2.1
                                    : 1.45
                          }
                          strokeDasharray={
                            isWalked || isTraced ? undefined : isActiveChoice ? '4 3' : '2.5 3.5'
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
                          ? 'ring-2 ring-[#d4af37]/90 shadow-[0_0_16px_rgba(212,175,55,0.55)] scale-105 '
                          : ''
                      }${
                        isBoss
                          ? isReachable
                            ? 'bg-[#4f1310] border-2 border-[#f1ca79] shadow-[0_0_22px_rgba(145,25,18,0.85),0_4px_12px_rgba(0,0,0,0.6)] hover:scale-115 cursor-pointer animate-pulse'
                            : 'bg-[#36110e] border-2 border-[#8c6438] shadow-[0_4px_12px_rgba(0,0,0,0.55)] hover:border-[#e6be72] hover:scale-105 cursor-help'
                          : isCurrent
                            ? 'bg-[#e9d5aa] border-2 border-[#6e1c14] text-[#3a120d] shadow-[0_0_16px_rgba(110,28,20,0.45)] cursor-default'
                            : isReachable
                              ? isCombat
                                ? 'bg-[#e6c99b] hover:bg-[#f2dfb7] border-2 border-[#8a1f16] text-[#6d1610] shadow-[0_0_18px_rgba(166,34,24,0.48),0_3px_8px_rgba(0,0,0,0.45)] hover:scale-115 cursor-pointer'
                                : 'bg-[#e8d2a6] hover:bg-[#f6e6c2] border-2 border-[#6c441c] text-[#28180c] shadow-[0_0_16px_rgba(176,120,38,0.45),0_3px_8px_rgba(0,0,0,0.42)] hover:scale-115 cursor-pointer'
                              : isVisited
                                ? 'bg-[#b3986c]/75 border border-[#543c24]/60 text-[#4a3520]/55 hover:brightness-110 hover:scale-105 cursor-help'
                                : isCombat
                                  ? 'bg-[#c9ae80]/85 border border-[#6e2d24]/70 text-[#5e1f18]/80 hover:brightness-110 hover:scale-105 cursor-help'
                                  : 'bg-[#ceb589]/85 border border-[#5c4227]/65 text-[#332214]/75 hover:brightness-110 hover:scale-105 cursor-help'
                      }`}
                    >
                      {/* Pulsing Outer Wax Ring for Reachable Choices */}
                      {isReachable && !isBoss && (
                        <span
                          className={`pointer-events-none absolute -inset-1.5 rounded-full border-2 animate-ping [animation-duration:2.2s] ${
                            isCombat ? 'border-[#8f1f16]/55' : 'border-[#8a5b1f]/50'
                          }`}
                        />
                      )}

                      {isCurrent ? (
                        <svg viewBox="0 0 24 28" className="w-6 h-7 -translate-y-0.5 drop-shadow-[0_3px_4px_rgba(0,0,0,0.65)] animate-bounce [animation-duration:2.4s]">
                          <circle cx="12" cy="6.5" r="4.5" fill="#1e130c" stroke="#e3bc73" strokeWidth="1.7" />
                          <path d="M6 24.5c.6-6.2 2.4-10.2 6-10.2s5.4 4 6 10.2H6Z" fill="#1e130c" stroke="#e3bc73" strokeWidth="1.7" />
                        </svg>
                      ) : (
                        renderInkGlyph(node.type, isBoss)
                      )}

                      {/* Hand-Inked Charcoal X over Visited Nodes */}
                      {isVisited && (
                        <svg viewBox="0 0 24 24" className="pointer-events-none absolute inset-0 w-full h-full text-[#3f140f]/75" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                          <path d="M5 5l14 14M19 5L5 19" />
                        </svg>
                      )}
                    </button>

                    {/* Compact Ink Caption Under Current / Boss / Reachable / Hovered Nodes */}
                    {isCurrent && !isBoss && (
                      <span className="mt-1 px-1.5 py-0.5 rounded-[2px] bg-[#160e09]/92 border border-[#cfa159]/85 text-[7.5px] font-mono font-bold uppercase tracking-[0.22em] text-[#f4d793] shadow-sm whitespace-nowrap">
                        You
                      </span>
                    )}
                    {(isBoss || isReachable || isHovered) && (
                      <span
                        className={`mt-1 px-1.5 py-0.5 rounded-[2px] text-[8.5px] font-bold uppercase tracking-[0.14em] whitespace-nowrap shadow-sm ${
                          isBoss
                            ? 'bg-[#2a0c09]/92 text-[#f4d793] border border-[#8e5f34]/75 font-[\'Cinzel\',_serif]'
                            : 'bg-[#1a110a]/85 text-[#ecd7ae] border border-[#5e4226]/70'
                        }`}
                      >
                        {meta.title}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Wooden Scroll Dowel */}
          <div className="relative z-20 h-4 w-[104%] -ml-[2%] rounded-full bg-gradient-to-b from-[#4c3320] via-[#2b1a0e] to-[#120a05] border border-[#6e4c2e]/70 shadow-[0_-4px_12px_rgba(0,0,0,0.85)] flex items-center justify-between px-2 shrink-0">
            <span className="w-3 h-2.5 rounded-full bg-gradient-to-b from-[#d4af37] to-[#6e4e18] border border-[#2a1a07]" />
            <span className="text-[8px] font-mono uppercase tracking-[0.28em] text-[#bfa072]/65">
              Click a Glowing Node to Advance
            </span>
            <span className="w-3 h-2.5 rounded-full bg-gradient-to-b from-[#d4af37] to-[#6e4e18] border border-[#2a1a07]" />
          </div>
        </div>

        {/* RIGHT FLANK: Cartographer's Omen Inspector & Expedition Ledger */}
        <div className="w-full max-w-[560px] md:max-w-none md:w-[270px] lg:w-[320px] grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-col justify-between gap-3 lg:gap-4 shrink-0">
          {/* Omen / Node Inspector Plaque */}
          <div className="relative flex-1 flex flex-col justify-between p-3.5 lg:p-5 rounded-[3px] bg-[#0e0a07]/84 border border-[#3e2b1d]/85 shadow-[0_16px_38px_rgba(0,0,0,0.86),inset_0_1px_0_rgba(255,228,185,0.06)] backdrop-blur-[2px]">
            <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#86643f]/65" />
            <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#86643f]/65" />
            <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#86643f]/65" />
            <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#86643f]/65" />

            <div>
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#3a281c]/80">
                <span className="text-[9px] font-mono uppercase tracking-[0.26em] text-[#b48f5a]">
                  {isInspectedReachable ? 'Reachable Omen' : 'Map Survey'}
                </span>
                {inspectedMeta && (
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] ${
                      inspectedMeta.tone === 'boss' || inspectedMeta.tone === 'combat'
                        ? 'text-red-400/90'
                        : 'text-amber-300/85'
                    }`}
                  >
                    {inspectedMeta.tag}
                  </span>
                )}
              </div>

              {inspectedNode && inspectedMeta && (
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border ${
                      inspectedMeta.tone === 'boss'
                        ? 'bg-[#36100d] border-[#d4af37]/80 text-[#f5d593]'
                        : inspectedMeta.tone === 'combat'
                          ? 'bg-[#26110e] border-[#96362b]/80 text-[#f1a498]'
                          : 'bg-[#1b130c] border-[#7a5a36]/80 text-[#e8cba0]'
                    }`}
                  >
                    {renderInkGlyph(inspectedNode.type, inspectedNode.type === 'boss')}
                  </div>

                  <h2 className="text-lg font-['Cinzel',_serif] font-bold uppercase tracking-[0.18em] text-[#f0dab2]">
                    {inspectedMeta.title}
                  </h2>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#8a6539]/75 to-transparent my-3" />
                  <p className="text-[11px] font-mono text-[#cbb697]/85 leading-relaxed">
                    {inspectedMeta.desc}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 lg:mt-5 pt-2.5 lg:pt-3 border-t border-[#2f2015]/80 text-center">
              <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9f825b]/80">
                {currentNode.nextIds.length === 1
                  ? 'Single path forward — click the lit seal on the scroll'
                  : `${currentNode.nextIds.length} diverging branches ahead`}
              </div>
            </div>
          </div>

          {/* Expedition Status & Act Boss Telemetry */}
          <div className="relative p-4 rounded-[3px] bg-[#0c0806]/84 border border-[#3a281b]/80 shadow-[0_14px_30px_rgba(0,0,0,0.84)] backdrop-blur-[2px]">
            <div className="text-[9px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.26em] text-[#c79e5e] pb-2 mb-2.5 border-b border-[#332318]">
              Expedition Ledger
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[10px] font-mono">
              <div className="text-[#9e8669] uppercase tracking-wider">Act Boss</div>
              <div className="text-right font-bold text-red-300/90 uppercase tracking-wider">
                {bossMeta.name}
              </div>

              <div className="text-[#9e8669] uppercase tracking-wider">Creatures</div>
              <div className="text-right font-bold text-[#ead4ac]">{deckSize}</div>

              <div className="text-[#9e8669] uppercase tracking-wider">Overkill Blood</div>
              <div className="text-right font-bold text-red-400">{overkillBlood}</div>

              <div className="text-[#9e8669] uppercase tracking-wider">Starting Bones</div>
              <div className="text-right font-bold text-[#e2d4bc]">{startingBones}</div>

              <div className="text-[#9e8669] uppercase tracking-wider">Effigy</div>
              <div className="text-right font-bold text-amber-300/90 truncate">
                {activeTotem?.head && activeTotem?.body
                  ? `${activeTotem.head} / ${activeTotem.body}`
                  : 'Unstitched'}
              </div>

              {displaySeed && (
                <>
                  <div className="text-[#9e8669] uppercase tracking-wider">Run Seed</div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={copySeed}
                      title="Click to copy run seed"
                      className="font-mono font-bold text-[#e6c88e] hover:text-white tracking-[0.12em] underline decoration-dotted decoration-[#8a6a3f] underline-offset-2 cursor-pointer transition-colors"
                    >
                      {copiedSeed ? 'COPIED ✓' : displaySeed}
                    </button>
                  </div>
                </>
              )}
            </div>

            {activeVows.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[#2d1f15] flex flex-wrap gap-1">
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
  );
};

export default MapScreen;
