import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActWeather } from './ActWeather';
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
  let hash = 0;
  for (let i = 0; i < d.id.length; i++) {
    hash = (hash * 31 + d.id.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % 30;
  const col = idx % 5;
  const row = Math.floor(idx / 5);
  const symbolOpacity = Math.min(0.75, Math.max(0.28, d.opacity * 1.35));

  return (
    <g
      key={d.id}
      transform={transform}
      opacity={symbolOpacity}
      style={{ mixBlendMode: 'screen' }}
    >
      <svg
        x={-14}
        y={-14}
        width={28}
        height={28}
        viewBox={`${col * 20} ${row * 20} 20 20`}
        overflow="hidden"
      >
        <image
          href={`${import.meta.env.BASE_URL || './'}assets/text/symbols.png`}
          x={0}
          y={0}
          width={100}
          height={120}
          preserveAspectRatio="none"
        />
      </svg>
    </g>
  );
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

  const isWeatheredTablet = activeVows.includes('weathered_tablet');
  const isNodeObscured = (n: MapNode) =>
    isWeatheredTablet &&
    n.type !== 'start' &&
    n.type !== 'boss' &&
    n.id !== mapData.currentNodeId &&
    !visitedSet.has(n.id) &&
    !reachableIds.has(n.id);

  const bossMeta = BOSS_DISPLAY_META[mapData.bossType];
  const inspectedMeta = inspectedNode
    ? isNodeObscured(inspectedNode)
      ? {
          title: 'Weathered Carving',
          tag: 'Unknown',
          desc: 'Rain and lichen have eroded this rune. Step closer to read its omen.',
          tone: 'neutral' as const,
        }
      : inspectedNode.type === 'boss'
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
      <ActWeather act={mapData.act} posClass="absolute inset-0 z-[4]" keyPrefix="map" />

      {/* Top Header: Sanctuary (Top-Left) + Engraved Stone Act Title Banner */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center shrink-0 pt-0.5">
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
                      backgroundImage: `url(${import.meta.env.BASE_URL || './'}assets/text/fullmapbg.jpg)`,
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

                {/* Occult Sigils (replace topographic contour rings) */}
                <defs>
                  <filter id="sigilAlpha" colorInterpolationFilters="sRGB">
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.4 1.4 1.4 0 0" />
                  </filter>
                </defs>
                {cartography.contours.map(ct => {
                  let h = 0;
                  for (let i = 0; i < ct.id.length; i++) h = (h * 31 + ct.id.charCodeAt(i)) | 0;
                  const idx = Math.abs(h) % 30;
                  const col = idx % 5;
                  const row = Math.floor(idx / 5);
                  const size = Math.min(64, Math.max(30, Math.max(ct.rx, ct.ry) * 0.75));
                  return (
                    <g
                      key={ct.id}
                      transform={`translate(${ct.cx} ${ct.cy}) rotate(${ct.rot})`}
                      opacity={0.2}
                    >
                      <svg
                        x={-size / 2}
                        y={-size / 2}
                        width={size}
                        height={size}
                        viewBox={`${col * 20} ${row * 20} 20 20`}
                        overflow="hidden"
                      >
                        <image
                          href={`${import.meta.env.BASE_URL || './'}assets/text/symbols.png`}
                          x={0}
                          y={0}
                          width={100}
                          height={120}
                          preserveAspectRatio="none"
                          filter="url(#sigilAlpha)"
                        />
                      </svg>
                    </g>
                  );
                })}

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
                            stroke={isTraced ? 'rgba(224, 178, 78, 0.58)' : 'rgba(212, 56, 42, 0.42)'}
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
                              ? '#d93829'
                              : isWalked
                                ? '#9e2a20'
                                : isEdgeLockedOut
                                  ? 'rgba(185, 168, 146, 0.24)'
                                  : isActiveChoice
                                    ? hasActiveTrace
                                      ? 'rgba(214, 62, 48, 0.65)'
                                      : '#c92c20'
                                    : hasActiveTrace
                                      ? 'rgba(204, 188, 164, 0.34)'
                                      : 'rgba(218, 200, 174, 0.68)'
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
                const obscured = isNodeObscured(node);
                const isBoss = node.type === 'boss';
                const isCombat = !obscured && (node.type === 'combat' || node.type === 'elite_combat');
                const isHovered = hoveredNodeId === node.id;
                const isLockedOut = !isCurrent && !isVisited && !futureReachableIds.has(node.id);
                const isOnTracedPath = tracedPath.nodes.has(node.id) && !isCurrent;
                const meta = obscured
                  ? { title: '???', tag: 'Unknown' }
                  : isBoss
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
                      className={`relative flex items-center justify-center rounded-full transition-all duration-200 bg-[radial-gradient(circle,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.25)_45%,transparent_72%)] ${
                        isBoss ? 'w-14 h-14 [&>svg]:scale-[1.45]' : 'w-11 h-11 [&>svg]:scale-[1.2]'
                      } ${
                        isOnTracedPath && !isBoss ? 'scale-110 drop-shadow-[0_0_12px_rgba(214,184,136,0.85)] ' : ''
                      }${
                        isBoss
                          ? isReachable
                            ? 'text-[#f6e3bd] drop-shadow-[0_0_14px_rgba(200,36,28,0.95)] hover:scale-110 cursor-pointer'
                            : 'text-[#bfa686] drop-shadow-[0_0_8px_rgba(150,28,22,0.6)] hover:text-[#f6e3bd] hover:scale-105 cursor-help'
                          : isCurrent
                            ? 'text-[#ebe3d5] drop-shadow-[0_0_10px_rgba(190,40,30,0.85)] cursor-default'
                            : isReachable
                              ? isCombat
                                ? 'text-[#f4b9ae] drop-shadow-[0_0_10px_rgba(200,44,32,0.85)] hover:scale-110 hover:text-[#ffd2c8] cursor-pointer'
                                : 'text-[#efe3cc] drop-shadow-[0_0_9px_rgba(214,184,136,0.7)] hover:scale-110 hover:text-white cursor-pointer'
                              : isVisited
                                ? 'text-[#6a6058]/70 hover:text-[#a39480] hover:scale-105 cursor-help'
                                : isCombat
                                  ? 'text-[#a8574d] hover:brightness-125 hover:scale-105 cursor-help'
                                  : 'text-[#8f8374] hover:brightness-125 hover:scale-105 cursor-help'
                      }`}
                    >
                      {/* Pulsing Outer Ring for Reachable Choices */}
                      {isReachable && !isBoss && (
                        <span
                          className={`pointer-events-none absolute -inset-1.5 rounded-full animate-pulse [animation-duration:2.6s] ${
                            isCombat ? 'bg-[radial-gradient(circle,rgba(181,55,46,0.38)_0%,transparent_68%)]' : 'bg-[radial-gradient(circle,rgba(214,184,136,0.28)_0%,transparent_68%)]'
                          }`}
                        />
                      )}

                      {isCurrent ? (
                        <svg viewBox="0 0 24 28" className="w-6 h-7 -translate-y-0.5 drop-shadow-[0_3px_4px_rgba(0,0,0,0.8)] animate-bounce [animation-duration:2.4s]">
                          <circle cx="12" cy="6.5" r="4.5" fill="#100e12" stroke="#d6c2a5" strokeWidth="1.7" />
                          <path d="M6 24.5c.6-6.2 2.4-10.2 6-10.2s5.4 4 6 10.2H6Z" fill="#100e12" stroke="#d6c2a5" strokeWidth="1.7" />
                        </svg>
                      ) : obscured ? (
                        <span className="font-['Cinzel',_serif] font-black text-base text-[#a39480] select-none">?</span>
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

                    {/* Lit Caption (Out-of-flow so hover never shifts the node) */}
                    {(isCurrent && !isBoss) || isBoss || isReachable || isHovered ? (
                      <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-0.5 flex flex-col items-center z-40">
                        {isCurrent && !isBoss && (
                          <span
                            className="font-['Cinzel',_serif] text-[8px] font-bold uppercase tracking-[0.3em] text-[#e8b4aa]"
                            style={{ textShadow: '0 0 3px #000, 0 0 8px #000, 0 0 14px rgba(0,0,0,0.9)' }}
                          >
                            You
                          </span>
                        )}
                        {(isBoss || isReachable || isHovered) && (
                          <span
                            className={`font-['Cinzel',_serif] font-bold uppercase whitespace-nowrap ${
                              isBoss ? 'text-[11px] tracking-[0.2em] text-[#f6e3bd]' : 'text-[9.5px] tracking-[0.16em] text-[#efe3cc]'
                            }`}
                            style={{ textShadow: '0 0 3px #000, 0 0 8px #000, 0 0 14px rgba(0,0,0,0.9)' }}
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
        {(() => {
          const mapStage = (mapData as any)?.stage ?? (mapData as any)?.act ?? (mapData as any)?.actNumber ?? 1;
          const isAct4Burned = mapStage >= 4;
          const mapSwayAnim =
            mapStage === 2
              ? 'bannerSwayMid 5.6s ease-in-out infinite'
              : mapStage === 3
                ? 'bannerSwayBrisk 4.6s ease-in-out infinite'
                : 'bannerSwayGentle 7s ease-in-out infinite';
          const mapRippleAnim =
            mapStage === 2
              ? 'bannerClothRipple 3.0s linear infinite'
              : mapStage === 3
                ? 'bannerClothRipple 1.9s linear infinite'
                : 'bannerClothRipple 5.8s linear infinite';
          const mapRippleOpacity = mapStage === 3 ? 0.22 : mapStage === 2 ? 0.14 : 0.07;
          const mapWaveScale = mapStage === 3 ? 30 : mapStage === 2 ? 18 : 5;
          const mapWaveDur = mapStage === 3 ? '2.3s' : mapStage === 2 ? '3.4s' : '6.0s';
          const frayedClip =
            'polygon(0% 0%, 100% 0%, 100% 97.2%, 99% 98.6%, 98% 97.4%, 97% 99.2%, 96% 97.8%, 95% 98.9%, 94% 96.6%, 93% 99.1%, 92% 97.7%, 91% 98.8%, 90% 97.4%, 89% 99.5%, 88% 97.6%, 87% 98.7%, 86% 96.4%, 85% 99.2%, 84% 97.8%, 83% 98.9%, 82% 97.3%, 81% 99.4%, 80% 97.5%, 79% 98.8%, 78% 97.1%, 77% 99.6%, 76% 97.6%, 75% 98.7%, 74% 96.5%, 73% 99.1%, 72% 97.8%, 71% 98.9%, 70% 97.4%, 69% 99.3%, 68% 97.6%, 67% 98.8%, 66% 96.8%, 65% 99.2%, 64% 97.7%, 63% 98.9%, 62% 97.3%, 61% 99.5%, 60% 97.5%, 59% 98.7%, 58% 96.2%, 57% 99.1%, 56% 97.8%, 55% 98.9%, 54% 97.4%, 53% 99.4%, 52% 97.6%, 51% 98.8%, 50% 96.7%, 49% 99.6%, 48% 97.5%, 47% 98.7%, 46% 97.2%, 45% 99.2%, 44% 97.7%, 43% 98.9%, 42% 96.4%, 41% 99.1%, 40% 97.6%, 39% 98.8%, 38% 97.3%, 37% 99.4%, 36% 97.5%, 35% 98.7%, 34% 96.6%, 33% 99.2%, 32% 97.8%, 31% 98.9%, 30% 97.4%, 29% 99.5%, 28% 97.6%, 27% 98.7%, 26% 96.3%, 25% 99.1%, 24% 97.7%, 23% 98.9%, 22% 97.3%, 21% 99.3%, 20% 97.6%, 19% 98.8%, 18% 96.8%, 17% 99.2%, 16% 97.7%, 15% 98.8%, 14% 97.2%, 13% 99.5%, 12% 97.5%, 11% 98.7%, 10% 96.5%, 9% 99.1%, 8% 97.7%, 7% 98.9%, 6% 97.3%, 5% 99.3%, 4% 97.6%, 3% 98.8%, 2% 97.2%, 1% 98.6%, 0% 97.2%)';
          const bannerBg = isAct4Burned
            ? 'linear-gradient(180deg, #4f0a0d 0%, #5c1214 55%, #31100f 76%, #120605 90%, #070303 100%)'
            : 'linear-gradient(180deg, #520a0d 0%, #5c0f12 58%, #7f2424 79%, #a64641 100%)';
          const frayThreadsBg = isAct4Burned
            ? 'repeating-linear-gradient(90deg, rgba(20,8,6,0.95) 0px, rgba(20,8,6,0.95) 1px, transparent 1px, transparent 3px, rgba(120,40,18,0.6) 3px, rgba(120,40,18,0.6) 4px, transparent 4px, transparent 7px)'
            : 'repeating-linear-gradient(90deg, rgba(226,190,118,0.58) 0px, rgba(226,190,118,0.58) 1px, transparent 1px, transparent 3px, rgba(176,78,72,0.85) 3px, rgba(176,78,72,0.85) 4px, transparent 4px, transparent 6px)';
          const renderOrnateRod = () => (
            <div className="relative z-20 w-[calc(100%+18px)] -ml-[9px] h-4 flex items-center shrink-0">
              <div
                className="relative w-full h-[9px] rounded-full"
                style={{
                  backgroundColor: '#2e1d12',
                  backgroundImage: `linear-gradient(180deg, rgba(255,214,160,0.28) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.65) 100%), url("${import.meta.env.BASE_URL || './'}assets/text/wood.jpg")`,
                  backgroundSize: 'cover, 120px 120px',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.9), inset 0 -1px 2px rgba(0,0,0,0.7)',
                }}
              />
              {[8, 30, 70, 92].map(p => (
                <span
                  key={p}
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[7px] h-[14px] rounded-[2px]"
                  style={{
                    left: `${p}%`,
                    backgroundImage: 'repeating-linear-gradient(115deg, #b08a52 0px, #b08a52 1.2px, #3a2511 1.2px, #3a2511 2.6px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 0 2px rgba(0,0,0,0.6)',
                  }}
                />
              ))}
              {(['left', 'right'] as const).map(side => (
                <span key={side}>
                  <span
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                    style={{
                      [side]: '-2px',
                      background: 'radial-gradient(circle at 38% 34%, #8a6a3c 0%, #4a3016 55%, #1d1209 100%)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.9)',
                    }}
                  />
                  <span
                    className="pointer-events-none absolute top-[62%] w-[2px] h-3"
                    style={{ [side]: '3px', background: 'linear-gradient(to bottom, #8a6a3c, transparent)' }}
                  />
                </span>
              ))}
            </div>
          );
          const burnedClip =
            'polygon(0% 0%, 100% 0%, 100% 92%, 99.5% 92.1%, 99% 92.5%, 98.5% 93.2%, 98% 94%, 97.5% 95%, 97% 96%, 96.3% 95.2%, 95.7% 94.5%, 95% 93.9%, 94.3% 93.4%, 93.7% 93.1%, 93% 93%, 92.3% 93.2%, 91.7% 93.7%, 91% 94.5%, 90.3% 95.5%, 89.7% 96.7%, 89% 98%, 88.2% 96.2%, 87.3% 94.5%, 86.5% 93.1%, 85.7% 91.9%, 84.8% 91.2%, 84% 91%, 83.2% 91.2%, 82.3% 91.8%, 81.5% 92.8%, 80.7% 94%, 79.8% 95.4%, 79% 97%, 78.2% 96.2%, 77.3% 95.5%, 76.5% 94.9%, 75.7% 94.4%, 74.8% 94.1%, 74% 94%, 73.2% 94.2%, 72.3% 94.7%, 71.5% 95.5%, 70.7% 96.5%, 69.8% 97.7%, 69% 99%, 68% 97.2%, 67% 95.5%, 66% 94.1%, 65% 92.9%, 64% 92.2%, 63% 92%, 62.2% 92.1%, 61.3% 92.5%, 60.5% 93.2%, 59.7% 94%, 58.8% 95%, 58% 96%, 57% 94.4%, 56% 93%, 55% 91.8%, 54% 90.8%, 53% 90.2%, 52% 90%, 51% 90.3%, 50% 91.1%, 49% 92.3%, 48% 94%, 47% 95.9%, 46% 98%, 45% 96.7%, 44% 95.5%, 43% 94.5%, 42% 93.7%, 41% 93.2%, 40% 93%, 39% 93.2%, 38% 93.8%, 37% 94.8%, 36% 96%, 35% 97.4%, 34% 99%, 33% 97.2%, 32% 95.5%, 31% 94.1%, 30% 92.9%, 29% 92.2%, 28% 92%, 27% 92.2%, 26% 92.7%, 25% 93.5%, 24% 94.5%, 23% 95.7%, 22% 97%, 21% 96%, 20% 95%, 19% 94.2%, 18% 93.5%, 17% 93.1%, 16% 93%, 15% 93.2%, 14% 93.7%, 13% 94.5%, 12% 95.5%, 11% 96.7%, 10% 98%, 9.2% 96.4%, 8.3% 95%, 7.5% 93.8%, 6.7% 92.8%, 5.8% 92.2%, 5% 92%, 4.5% 92.1%, 4% 92.5%, 3.5% 93.2%, 3% 94%, 2.5% 95%, 2% 96%, 1.7% 94.7%, 1.3% 93.5%, 1% 92.5%, 0.7% 91.7%, 0.3% 91.2%, 0% 91%)';
          const renderAct4Rim = () =>
            isAct4Burned ? (
              <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="100,92 99.5,92.1 99,92.5 98.5,93.2 98,94 97.5,95 97,96 96.3,95.2 95.7,94.5 95,93.9 94.3,93.4 93.7,93.1 93,93 92.3,93.2 91.7,93.7 91,94.5 90.3,95.5 89.7,96.7 89,98 88.2,96.2 87.3,94.5 86.5,93.1 85.7,91.9 84.8,91.2 84,91 83.2,91.2 82.3,91.8 81.5,92.8 80.7,94 79.8,95.4 79,97 78.2,96.2 77.3,95.5 76.5,94.9 75.7,94.4 74.8,94.1 74,94 73.2,94.2 72.3,94.7 71.5,95.5 70.7,96.5 69.8,97.7 69,99 68,97.2 67,95.5 66,94.1 65,92.9 64,92.2 63,92 62.2,92.1 61.3,92.5 60.5,93.2 59.7,94 58.8,95 58,96 57,94.4 56,93 55,91.8 54,90.8 53,90.2 52,90 51,90.3 50,91.1 49,92.3 48,94 47,95.9 46,98 45,96.7 44,95.5 43,94.5 42,93.7 41,93.2 40,93 39,93.2 38,93.8 37,94.8 36,96 35,97.4 34,99 33,97.2 32,95.5 31,94.1 30,92.9 29,92.2 28,92 27,92.2 26,92.7 25,93.5 24,94.5 23,95.7 22,97 21,96 20,95 19,94.2 18,93.5 17,93.1 16,93 15,93.2 14,93.7 13,94.5 12,95.5 11,96.7 10,98 9.2,96.4 8.3,95 7.5,93.8 6.7,92.8 5.8,92.2 5,92 4.5,92.1 4,92.5 3.5,93.2 3,94 2.5,95 2,96 1.7,94.7 1.3,93.5 1,92.5 0.7,91.7 0.3,91.2 0,91" fill="none" stroke="rgba(234,88,12,0.35)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <polyline points="100,92 99.5,92.1 99,92.5 98.5,93.2 98,94 97.5,95 97,96 96.3,95.2 95.7,94.5 95,93.9 94.3,93.4 93.7,93.1 93,93 92.3,93.2 91.7,93.7 91,94.5 90.3,95.5 89.7,96.7 89,98 88.2,96.2 87.3,94.5 86.5,93.1 85.7,91.9 84.8,91.2 84,91 83.2,91.2 82.3,91.8 81.5,92.8 80.7,94 79.8,95.4 79,97 78.2,96.2 77.3,95.5 76.5,94.9 75.7,94.4 74.8,94.1 74,94 73.2,94.2 72.3,94.7 71.5,95.5 70.7,96.5 69.8,97.7 69,99 68,97.2 67,95.5 66,94.1 65,92.9 64,92.2 63,92 62.2,92.1 61.3,92.5 60.5,93.2 59.7,94 58.8,95 58,96 57,94.4 56,93 55,91.8 54,90.8 53,90.2 52,90 51,90.3 50,91.1 49,92.3 48,94 47,95.9 46,98 45,96.7 44,95.5 43,94.5 42,93.7 41,93.2 40,93 39,93.2 38,93.8 37,94.8 36,96 35,97.4 34,99 33,97.2 32,95.5 31,94.1 30,92.9 29,92.2 28,92 27,92.2 26,92.7 25,93.5 24,94.5 23,95.7 22,97 21,96 20,95 19,94.2 18,93.5 17,93.1 16,93 15,93.2 14,93.7 13,94.5 12,95.5 11,96.7 10,98 9.2,96.4 8.3,95 7.5,93.8 6.7,92.8 5.8,92.2 5,92 4.5,92.1 4,92.5 3.5,93.2 3,94 2.5,95 2,96 1.7,94.7 1.3,93.5 1,92.5 0.7,91.7 0.3,91.2 0,91" fill="none" stroke="rgba(255,150,60,0.9)" strokeWidth="0.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            ) : null;
          const renderAct4Char = () =>
            isAct4Burned ? (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 20% 62% at 7% 100%, rgba(10,4,3,0.9) 0%, rgba(10,4,3,0.41) 55%, transparent 100%), radial-gradient(ellipse 14% 40% at 24% 100%, rgba(10,4,3,0.85) 0%, rgba(10,4,3,0.38) 55%, transparent 100%), radial-gradient(ellipse 24% 70% at 44% 100%, rgba(10,4,3,0.9) 0%, rgba(10,4,3,0.41) 55%, transparent 100%), radial-gradient(ellipse 13% 34% at 63% 100%, rgba(10,4,3,0.85) 0%, rgba(10,4,3,0.38) 55%, transparent 100%), radial-gradient(ellipse 22% 58% at 83% 100%, rgba(10,4,3,0.9) 0%, rgba(10,4,3,0.41) 55%, transparent 100%), radial-gradient(ellipse 14% 44% at 100% 100%, rgba(10,4,3,0.85) 0%, rgba(10,4,3,0.38) 55%, transparent 100%), radial-gradient(ellipse 60% 22% at 50% 100%, rgba(234,88,12,0.38) 0%, transparent 100%), linear-gradient(to top, rgba(12,5,4,0.8) 0%, rgba(12,5,4,0.45) 9%, transparent 22%)',
                }}
              />
            ) : null;
          const renderAct4Cinders = () =>
            isAct4Burned ? (
              <>
                <div className="pointer-events-none absolute bottom-1 inset-x-4 h-16 overflow-visible">
                  {[
                    { left: '26%', delay: '0s', dur: '6.8s', size: 2.5 },
                    { left: '71%', delay: '3.7s', dur: '7.2s', size: 2.5 },
                  ].map((cinder, i) => (
                    <span
                      key={i}
                      className="absolute bottom-0 rounded-full bg-orange-500/75 shadow-[0_0_5px_rgba(251,146,60,0.6)]"
                      style={{
                        left: cinder.left,
                        width: cinder.size,
                        height: cinder.size,
                        animation: `bannerCinderRise ${cinder.dur} ease-out ${cinder.delay} infinite`,
                      }}
                    />
                  ))}
                </div>
              </>
            ) : null;

          return (
        <div className="w-full sm:w-[240px] md:w-[280px] lg:w-[330px] max-h-[38%] sm:max-h-none flex flex-row sm:flex-col justify-between gap-2.5 lg:gap-4 shrink-0 min-h-0 overflow-y-auto sm:overflow-visible">
          {/* Hidden SVG Wave Displacement Filter for Map Banners */}
          <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
            <defs>
              <filter id="map-cloth-wave" x="-28%" y="-6%" width="156%" height="116%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.0025 0.011"
                  numOctaves="1"
                  seed="7"
                  result="noise"
                >
                  <animate
                    attributeName="baseFrequency"
                    values="0.0022 0.010; 0.0042 0.017; 0.0022 0.010"
                    dur={mapWaveDur}
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={mapWaveScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>

          {/* Omen / Node Inspector — Hanging Ritual Cloth Banner */}
          <div className="relative flex-1 flex flex-col min-h-0">
            {renderOrnateRod()}

            <div
              className="relative z-10 flex-1 flex flex-col -mt-1.5 min-h-0"
              style={{
                transformOrigin: 'top center',
                animation: mapSwayAnim,
                filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.75))',
              }}
            >
            <div className="relative flex-1 flex flex-col justify-center px-5 pt-3.5 pb-7 lg:px-6 lg:pt-4 lg:pb-8 min-h-0">
              {/* Wavy Displaced Cloth Backdrop */}
              <div
                className="pointer-events-none absolute inset-0 shadow-[inset_0_12px_26px_rgba(0,0,0,0.72)] overflow-hidden"
                style={{
                  filter: 'url(#map-cloth-wave)',
                  background: bannerBg,
                  clipPath: isAct4Burned ? burnedClip : frayedClip,
                }}
              >
                {/* Multiplied Cloth Weave Texture */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-65 mix-blend-multiply"
                  style={{
                    backgroundImage: `url("${import.meta.env.BASE_URL || './'}assets/text/cloth.jpg")`,
                    backgroundSize: '170px 170px',
                    backgroundRepeat: 'repeat',
                  }}
                />
                {/* Seamless Downward Wind Sheen */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: mapRippleOpacity,
                    backgroundImage:
                      'repeating-linear-gradient(180deg, transparent 0px, rgba(255,220,185,0.22) 38px, transparent 84px, rgba(0,0,0,0.22) 132px, transparent 180px)',
                    backgroundSize: '100% 180px',
                    animation: mapRippleAnim,
                  }}
                />

                {/* Detailed Frayed Thread Strands */}
                <div
                  className="pointer-events-none absolute bottom-0 inset-x-0 h-5 opacity-80"
                  style={{
                    backgroundImage: frayThreadsBg,
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
                  }}
                />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-9 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                {renderAct4Char()}{renderAct4Rim()}
              </div>
              {renderAct4Cinders()}

            <div className="relative z-10 flex flex-col h-full min-h-0">
              {/* Header Bar */}
              <div className="shrink-0 flex flex-col items-center justify-center gap-1.5 pb-2 mb-2.5 border-b border-[#7c2620]/80 text-center">
                <span className="flex items-center justify-center gap-1.5 text-xs font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#ecd8b8] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] text-center">
                  <span className="text-[#c99b56]">◆</span>
                  {isInspectedReachable ? 'Reachable Omen' : 'Map Survey'}
                </span>
                {inspectedMeta && (
                  <span
                    className={`text-[9.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.24em] text-center drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)] ${
                      inspectedMeta.tone === 'boss' || inspectedMeta.tone === 'combat' ? 'text-red-400' : 'text-[#e0c79a]'
                    }`}
                  >
                    {inspectedMeta.tag}
                  </span>
                )}
              </div>

              {inspectedNode && inspectedMeta && (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-2 pb-2">
                  {/* Lit Glyph (no medallion) */}
                  <div className="relative mb-2.5 shrink-0 w-16 h-16 flex items-center justify-center">
                    <div
                      className="pointer-events-none absolute -inset-3"
                      style={{
                        background:
                          inspectedMeta.tone === 'boss' || inspectedMeta.tone === 'combat'
                            ? 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(120,16,14,0.3) 40%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(150,110,60,0.2) 40%, transparent 70%)',
                      }}
                    />
                    <div
                      className={`relative [&>svg]:scale-[1.9] ${
                        inspectedMeta.tone === 'boss'
                          ? 'text-[#f5dfb4] drop-shadow-[0_0_14px_rgba(200,36,28,0.95)]'
                          : inspectedMeta.tone === 'combat'
                            ? 'text-[#f2b8ae] drop-shadow-[0_0_12px_rgba(200,44,32,0.85)]'
                            : 'text-[#efe2cc] drop-shadow-[0_0_10px_rgba(214,184,136,0.7)]'
                      }`}
                    >
                      {renderInkGlyph(inspectedNode.type, inspectedNode.type === 'boss')}
                    </div>
                  </div>

                  <h2 className="text-lg lg:text-xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.18em] text-[#f7ead3] leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                    {inspectedMeta.title}
                  </h2>

                  <div className="flex items-center justify-center gap-2.5 w-full my-2.5 shrink-0">
                    <span className="h-px flex-1 max-w-[58px] bg-gradient-to-r from-transparent via-[#b52c26]/75 to-[#c49a5c]/85" />
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#3a0a0a] border border-[#c49a5c]/85" />
                    <span className="h-px flex-1 max-w-[58px] bg-gradient-to-l from-transparent via-[#b52c26]/75 to-[#c49a5c]/85" />
                  </div>

                  <p className="w-full text-center text-xs lg:text-[13.5px] font-['Cinzel',_serif] italic tracking-[0.04em] text-[#f2e2c9] leading-snug px-1.5 drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                    {inspectedMeta.desc}
                  </p>
                </div>
              )}
            </div>
            </div>
            </div>
          </div>

          {/* Expedition Status & Act Boss Telemetry — Hanging Ritual Cloth Banner */}
          <div className="relative flex flex-col">
            {renderOrnateRod()}

            <div
              className="relative z-10 -mt-1.5"
              style={{
                transformOrigin: 'top center',
                animation: mapSwayAnim,
                animationDelay: '-1.8s',
                filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.75))',
              }}
            >
            <div className="relative px-5 pt-4 pb-8">
              {/* Wavy Displaced Cloth Backdrop */}
              <div
                className="pointer-events-none absolute inset-0 shadow-[inset_0_10px_22px_rgba(0,0,0,0.72)] overflow-hidden"
                style={{
                  filter: 'url(#map-cloth-wave)',
                  background: bannerBg,
                  clipPath: isAct4Burned ? burnedClip : frayedClip,
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
                {/* Seamless Downward Wind Sheen */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: mapRippleOpacity,
                    backgroundImage:
                      'repeating-linear-gradient(180deg, transparent 0px, rgba(255,220,185,0.22) 38px, transparent 84px, rgba(0,0,0,0.22) 132px, transparent 180px)',
                    backgroundSize: '100% 180px',
                    animation: mapRippleAnim,
                    animationDelay: '-1.1s',
                  }}
                />

                <div
                  className="pointer-events-none absolute bottom-0 inset-x-0 h-5 opacity-80"
                  style={{
                    backgroundImage: frayThreadsBg,
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
                  }}
                />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-9 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                {renderAct4Char()}{renderAct4Rim()}
              </div>
              {renderAct4Cinders()}

            <div className="relative z-10">
              <div className="flex items-center justify-center pb-2.5 mb-2.5 border-b border-[#6b3428]/80 text-center">
                <span className="flex items-center justify-center gap-1.5 text-xs font-['Cinzel',_serif] font-bold uppercase tracking-[0.22em] text-[#ecd8b8] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] text-center">
                  <span className="text-[#c99b56]">◆</span>
                  Expedition Ledger
                </span>
              </div>

              <div className="divide-y divide-[#4d201c]/80 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">Act Boss</span>
                  <span className="font-['Cinzel',_serif] font-bold text-sm text-red-200 uppercase tracking-[0.14em] drop-shadow-[0_1px_6px_rgba(185,28,28,0.65)]">
                    {bossMeta.name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">Creatures</span>
                  <span className="font-['Cinzel',_serif] font-bold text-sm text-[#f5e7cf] drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)]">
                    {deckSize}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">Overkill Blood</span>
                  <span className="font-['Cinzel',_serif] font-bold text-sm text-red-300 drop-shadow-[0_0_6px_rgba(185,28,28,0.7)]">
                    {overkillBlood} oz
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">Starting Bones</span>
                  <span className="font-['Cinzel',_serif] font-bold text-sm text-[#f5e7cf] drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)]">
                    {startingBones}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-2">
                  <span className="font-['Cinzel',_serif] font-semibold text-[#d4bea0] uppercase tracking-[0.14em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] shrink-0">Effigy</span>
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
                      className="text-[9px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.14em] text-red-300/95 drop-shadow-[0_0_5px_rgba(0,0,0,0.95)]"
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
          );
        })()}
      </div>
    </div>
  );
};

export default MapScreen;
