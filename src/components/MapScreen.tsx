import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActWeather } from './ActWeather';
import { ChiptuneAudio } from '../audio/ChiptuneAudio';
import { RITUAL_VOW_MAP, createSeededRng, type VowId } from '../utils/seededRng';
import {
  ActMapData,
  BOSS_DISPLAY_META,
  MAP_NODE_META,
  MapNode,
} from '../data/mapGenerator';
import {
  MapFigurineSharedDefs,
  MapFigurineToken,
  type FigurineKind,
} from './MapFigurineTokens';

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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slabWrapRef = useRef<HTMLDivElement | null>(null);
  const currentPanYRef = useRef<number>(0);
  const targetPanYRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    pointerId: number | null;
    startY: number;
    startTarget: number;
    active: boolean;
  }>({ pointerId: null, startY: 0, startTarget: 0, active: false });
  const suppressClickRef = useRef<boolean>(false);
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
  const hoverLeaveTimerRef = useRef<number | null>(null);
  const lastTickNodeRef = useRef<string | null>(null);

  const handleHoverNode = (node: MapNode) => {
    if (hoverLeaveTimerRef.current !== null) {
      window.clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    setHoveredNodeId(node.id);
    if (lastTickNodeRef.current !== node.id) {
      lastTickNodeRef.current = node.id;
      const ratio = 0.86 + (node.row / Math.max(1, mapData.rows - 1)) * 0.36 + (node.col - 1) * 0.04;
      ChiptuneAudio.playWoodTick?.(ratio);
    }
  };

  const handleLeaveNode = (nodeId: string) => {
    lastTickNodeRef.current = null;
    if (hoverLeaveTimerRef.current !== null) {
      window.clearTimeout(hoverLeaveTimerRef.current);
    }
    hoverLeaveTimerRef.current = window.setTimeout(() => {
      setHoveredNodeId(prev => (prev === nodeId ? null : prev));
      hoverLeaveTimerRef.current = null;
    }, 140);
  };
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isDraggingSlab, setIsDraggingSlab] = useState(false);

  const parchmentHeight = Math.max(880, (mapData.rows || 9) * 114);

  // Deterministic Act-themed cartography (spacious outer-margin landmarks so center trails & enlarged nodes stay uncluttered)
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

    const isClearOfNodes = (px: number, py: number, minDist = 66) => {
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
    const targetCount = Math.min(18, Math.max(8, mapData.rows + 2));
    let tries = 0;
    while (props.length < targetCount && tries < 220) {
      tries++;
      // Keep decorative runes strictly along outer margins so the map trails stay crisp & uncluttered
      const x = rng() < 0.5 ? 24 + rng() * 34 : vw - 58 + rng() * 34;
      const y = 92 + rng() * (vh - 184);
      if (!isClearOfNodes(x, y, 66)) continue;
      if (props.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < 52 * 52)) continue;

      const kind = pool[Math.floor(rng() * pool.length)];
      props.push({
        id: `dec-${props.length}`,
        x: Math.round(x),
        y: Math.round(y),
        scale: Number((0.72 + rng() * 0.36).toFixed(2)),
        rot: kind === 'arch' || kind === 'candle' || kind === 'obelisk' || kind === 'reliquary' ? Math.round((rng() - 0.5) * 10) : Math.round((rng() - 0.5) * 28),
        opacity: Number((0.14 + rng() * 0.1).toFixed(2)),
        kind,
      });
    }

    // Subtle elevation contour loops
    const contours = Array.from({ length: Math.max(3, Math.floor(mapData.rows / 3)) }, (_, i) => ({
      id: `ct-${i}`,
      cx: Math.round(60 + rng() * (vw - 120)),
      cy: Math.round(130 + (i / Math.max(1, Math.floor(mapData.rows / 3))) * (vh - 260) + (rng() - 0.5) * 50),
      rx: Math.round(55 + rng() * 65),
      ry: Math.round(28 + rng() * 38),
      rot: Math.round((rng() - 0.5) * 40),
    }));

    // Subtle blood splatters biased to margins so trails and enlarged figurines stand out
    const stains = Array.from({ length: Math.max(5, Math.floor(mapData.rows * 0.6)) }, (_, i) => {
      const sideBias = rng() < 0.8;
      const cx = sideBias
        ? (rng() < 0.5 ? Math.round(24 + rng() * 78) : Math.round(vw - 102 + rng() * 78))
        : Math.round(110 + rng() * (vw - 220));
      return {
        id: `st-${i}`,
        cx,
        cy: Math.round(210 + rng() * Math.max(120, vh - 290)),
        size: Math.round(52 + rng() * 62),
        rot: Math.round(rng() * 360),
        variant: (Math.floor(rng() * 4) + 1) as 1 | 2 | 3 | 4,
        opacity: Number((0.26 + rng() * 0.18).toFixed(2)),
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

  const SLAB_BOUND_PAD = 14;

  const getPanBounds = () => {
    const vp = viewportRef.current;
    const vh = vp ? vp.clientHeight : 640;
    const maxPan = SLAB_BOUND_PAD;
    const minPan = Math.min(maxPan, vh - parchmentHeight - 22);
    return { minPan, maxPan, vh };
  };

  const clampPan = (val: number) => {
    const { minPan, maxPan } = getPanBounds();
    return Math.max(minPan, Math.min(maxPan, val));
  };

  const applySlabTransform = (y: number) => {
    if (slabWrapRef.current) {
      slabWrapRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    }
    const down = y < -24;
    setIsScrolledDown(prev => (prev === down ? prev : down));
  };

  const startPanLoop = () => {
    if (rafIdRef.current !== null) return;
    const tick = () => {
      const diff = targetPanYRef.current - currentPanYRef.current;
      if (Math.abs(diff) < 0.25) {
        currentPanYRef.current = targetPanYRef.current;
        applySlabTransform(currentPanYRef.current);
        rafIdRef.current = null;
        return;
      }
      currentPanYRef.current += diff * 0.16;
      applySlabTransform(currentPanYRef.current);
      rafIdRef.current = window.requestAnimationFrame(tick);
    };
    rafIdRef.current = window.requestAnimationFrame(tick);
  };

  const setPanTarget = (nextY: number, immediate = false) => {
    const clamped = clampPan(nextY);
    targetPanYRef.current = clamped;
    if (immediate) {
      currentPanYRef.current = clamped;
      applySlabTransform(clamped);
    } else {
      startPanLoop();
    }
  };

  const panToApex = () => {
    setPanTarget(SLAB_BOUND_PAD);
  };

  // Center physical slab smoothly around current figurine & upcoming choices
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !currentNode) return;
    const vh = vp.clientHeight || 640;
    const nodePxY = (currentNode.y / 100) * parchmentHeight;
    const desired = vh * 0.56 - (nodePxY - 72);
    setPanTarget(desired);
  }, [mapData.currentNodeId, mapData.act, currentNode, parchmentHeight]);

  // Non-passive wheel panning + resize reclamp + RAF cleanup
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setPanTarget(targetPanYRef.current - e.deltaY * 0.92);
    };
    const onResize = () => {
      setPanTarget(targetPanYRef.current, true);
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [parchmentHeight]);

  const handleSlabPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragStateRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startTarget: targetPanYRef.current,
      active: false,
    };
    suppressClickRef.current = false;
  };

  const handleSlabPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragStateRef.current;
    if (st.pointerId !== e.pointerId) return;
    const dy = e.clientY - st.startY;
    if (!st.active && Math.abs(dy) > 5) {
      st.active = true;
      suppressClickRef.current = true;
      setIsDraggingSlab(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    if (st.active) {
      setPanTarget(st.startTarget + dy);
    }
  };

  const handleSlabPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragStateRef.current;
    if (st.pointerId !== e.pointerId) return;
    if (st.active) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDraggingSlab(false);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 40);
    }
    dragStateRef.current.pointerId = null;
    dragStateRef.current.active = false;
  };

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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,13,17,0.28)_0%,rgba(5,4,6,0.72)_100%)] pointer-events-none z-0" />

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
        @keyframes mapOmenReveal {
          0% { opacity: 0; transform: translateY(3px) scale(0.985); filter: blur(1.5px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes mapCrestSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes mapCrestSpinRev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
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
        {/* CENTERPIECE: Physical Rough-Hewn Basalt Ritual Slab */}
        <div className="relative flex flex-col w-full sm:max-w-[576px] flex-1 min-h-0">
          {/* Shared SVG Defs: Rough-Hewn Slab Silhouette, Chiseled Path Filter, Basalt Grime */}
          <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
            <defs>
              <clipPath id="basaltSlabClip" clipPathUnits="objectBoundingBox">
                <path d="M 0.022,0.010 L 0.105,0.002 L 0.205,0.011 L 0.320,0.003 L 0.450,0.010 L 0.575,0.002 L 0.700,0.011 L 0.825,0.003 L 0.920,0.012 L 0.982,0.008 L 0.996,0.045 L 0.981,0.125 L 0.997,0.215 L 0.979,0.330 L 0.995,0.455 L 0.982,0.575 L 0.998,0.700 L 0.980,0.820 L 0.994,0.925 L 0.978,0.991 L 0.875,0.998 L 0.755,0.989 L 0.630,0.998 L 0.505,0.990 L 0.375,0.998 L 0.250,0.989 L 0.130,0.997 L 0.038,0.990 L 0.014,0.982 L 0.003,0.905 L 0.019,0.785 L 0.003,0.665 L 0.020,0.540 L 0.004,0.415 L 0.018,0.285 L 0.003,0.165 L 0.019,0.062 Z" />
              </clipPath>
              <filter id="slabPathRoughen" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="17" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <filter id="bloodSlashRough" x="-15%" y="-15%" width="130%" height="130%">
                <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="7" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <filter id="basaltGrimeStrata" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="4" seed="41" result="strata" />
                <feColorMatrix
                  type="matrix"
                  values="0.18 0 0 0 0.03  0 0.16 0 0 0.025  0 0 0.15 0 0.025  0 0 0 0.42 0"
                />
              </filter>
              <MapFigurineSharedDefs />
            </defs>
          </svg>

          {/* Faint Unboxed Apex Sigil (Fades in only when panned down) */}
          <button
            type="button"
            onClick={panToApex}
            tabIndex={isScrolledDown ? 0 : -1}
            className={`absolute -top-0.5 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 font-['Cinzel',_serif] text-[9.5px] font-bold uppercase tracking-[0.34em] text-[#e6d5b8] hover:text-[#fff2da] transition-opacity duration-300 cursor-pointer select-none ${
              isScrolledDown ? 'opacity-85 hover:opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            style={{
              textShadow:
                '0 0 2px #000, 0 0 8px rgba(0,0,0,0.98), 0 0 14px rgba(180,68,48,0.55)',
            }}
          >
            ▲ APEX
          </button>

          {/* Physical Table Viewport (Pans Entire Slab via translate3d) */}
          <div
            ref={viewportRef}
            onPointerDown={handleSlabPointerDown}
            onPointerMove={handleSlabPointerMove}
            onPointerUp={handleSlabPointerUp}
            onPointerCancel={handleSlabPointerUp}
            onClickCapture={e => {
              if (suppressClickRef.current) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
            className={`relative flex-1 min-h-0 overflow-hidden -mx-12 px-12 -mb-2 touch-none ${
              isDraggingSlab ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, #000 3%, #000 97%, transparent 100%), radial-gradient(ellipse 64% 64% at 50% 50%, #000 86%, rgba(0,0,0,0.28) 99%)',
              WebkitMaskComposite: 'source-in',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, #000 3%, #000 97%, transparent 100%), radial-gradient(ellipse 64% 64% at 50% 50%, #000 86%, rgba(0,0,0,0.28) 99%)',
              maskComposite: 'intersect',
            }}
          >
            {/* Cast-Shadow Wrapper (unclipped so heavy shadow follows the chipped stone silhouette) */}
            <div
              ref={slabWrapRef}
              className="relative w-full will-change-transform"
              style={{
                height: `${parchmentHeight}px`,
                filter:
                  'drop-shadow(0 18px 20px rgba(0,0,0,0.92)) drop-shadow(0 6px 10px rgba(0,0,0,0.86))',
              }}
            >
              {/* Rough-Hewn Basalt Slab Body */}
              <div
                className="relative w-full h-full overflow-hidden bg-[#19171a]"
                style={{
                  clipPath: 'url(#basaltSlabClip)',
                  WebkitClipPath: 'url(#basaltSlabClip)',
                }}
              >
                {/* Feathered Mirrored Stone Tiles (overlapped & masked to eliminate row-07 horizontal seam) */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                  {Array.from({ length: Math.max(1, Math.ceil(parchmentHeight / 420) + 1) }, (_, tileIdx) => (
                    <div
                      key={tileIdx}
                      className="absolute left-0 right-0"
                      style={{
                        top: `${tileIdx * 420}px`,
                        height: '540px',
                        backgroundImage: `url(${import.meta.env.BASE_URL || './'}assets/text/fullmapbg.jpg)`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        transform: tileIdx % 2 === 1 ? 'scaleY(-1)' : undefined,
                        WebkitMaskImage:
                          tileIdx === 0
                            ? undefined
                            : 'linear-gradient(to bottom, transparent 0%, #000 26%, #000 100%)',
                        maskImage:
                          tileIdx === 0
                            ? undefined
                            : 'linear-gradient(to bottom, transparent 0%, #000 26%, #000 100%)',
                      }}
                    />
                  ))}

                  {/* Non-Repeating Procedural Basalt Grime & Fracture Strata */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-55"
                    preserveAspectRatio="none"
                    style={{ mixBlendMode: 'multiply' }}
                  >
                    <rect width="100%" height="100%" filter="url(#basaltGrimeStrata)" />
                  </svg>

                  {/* Full-Slab Directional Candlelight Wash (warmer near current row, deep basalt vignette at edges) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse 76% 36% at ${currentNode ? currentNode.x : 50}% ${
                        currentNode ? currentNode.y : 72
                      }%, rgba(226,184,126,0.16) 0%, rgba(44,32,26,0.12) 48%, rgba(7,6,8,0.68) 100%)`,
                    }}
                  />
                  {/* Deep Hewn Edge Bevel Vignette */}
                  <div
                    className="absolute inset-0"
                    style={{
                      boxShadow:
                        'inset 0 18px 34px rgba(0,0,0,0.82), inset 0 -22px 38px rgba(0,0,0,0.88), inset 16px 0 30px rgba(0,0,0,0.78), inset -16px 0 30px rgba(0,0,0,0.84)',
                    }}
                  />
                </div>

                {/* Faint Chiseled Act Numeral in Upper Right Stone */}
                <div
                  className="pointer-events-none absolute top-6 right-7 text-[10px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.3em] text-[#0c0a0c]/85 z-0"
                  style={{ textShadow: '1px 1px 0 rgba(235,220,195,0.2)' }}
                >
                  ACT {['I', 'II', 'III', 'IV'][mapData.act - 1] || mapData.act}
                </div>

                {/* Carved Stone Cartography, Blood Stains, Occult Sigils & Hewn Rim Bevel */}
                <svg
                  viewBox={`0 0 ${cartography.vw} ${cartography.vh}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                >
                  <defs>
                    <filter id="sigilAlpha" colorInterpolationFilters="sRGB">
                      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.4 1.4 1.4 0 0" />
                    </filter>
                  </defs>

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

                  {/* Subtle Carved Occult Sigils */}
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
                        opacity={0.16}
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

                  {/* Faint Carved Roman Numerals in Left Stone Margin */}
                  {Array.from({ length: mapData.rows }, (_, r) => {
                    const rowNode = mapData.nodes.find(n => n.row === r);
                    if (!rowNode) return null;
                    const ry = (rowNode.y / 100) * cartography.vh;
                    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
                    const label = numerals[r] || String(r + 1);
                    return (
                      <g key={`roman-${r}`} opacity="0.46">
                        <text
                          x="23"
                          y={ry + 4}
                          fontSize="9"
                          fontFamily="Cinzel, serif"
                          fontWeight="700"
                          letterSpacing="1.4"
                          fill="rgba(235,220,195,0.22)"
                        >
                          {label}
                        </text>
                        <text
                          x="22"
                          y={ry + 3}
                          fontSize="9"
                          fontFamily="Cinzel, serif"
                          fontWeight="700"
                          letterSpacing="1.4"
                          fill="rgba(8,6,8,0.88)"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Faint Chiseled Compass Rose (Bottom-Right) */}
                  <g
                    transform={`translate(${cartography.vw - 58} ${cartography.vh - 64})`}
                    opacity="0.42"
                    stroke="#0c090a"
                    fill="none"
                  >
                    <circle cx="0" cy="0" r="22" strokeWidth="1.2" />
                    <circle cx="0" cy="0" r="18" strokeWidth="0.8" strokeDasharray="2 3" />
                    <path d="M0 -26 L4 -4 L26 0 L4 4 L0 26 L-4 4 L-26 0 L-4 -4 Z" fill="rgba(10,8,9,0.36)" strokeWidth="1.1" />
                    <text x="-3.5" y="-29" fontSize="8.5" fontFamily="Cinzel, serif" fontWeight="bold" fill="#0c090a" stroke="none">N</text>
                  </g>
                </svg>

                {/* Hand-Scratched & Blood-Runnel SVG Paths (pixel-space viewBox for uniform turbulence) */}
                <svg
                  viewBox={`0 0 ${cartography.vw} ${cartography.vh}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                >
                  <g filter="url(#slabPathRoughen)">
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

                        const x1 = (node.x / 100) * cartography.vw;
                        const y1 = (node.y / 100) * cartography.vh;
                        const x2 = (target.x / 100) * cartography.vw;
                        const y2 = (target.y / 100) * cartography.vh;
                        const midX = (x1 + x2) / 2 + (node.col % 2 === 0 ? 10 : -10);
                        const midY = (y1 + y2) / 2;
                        const pathD = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;

                        if (isWalked) {
                          return (
                            <g key={edgeKey}>
                              {/* Chiseled dark trough beneath the blood */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke="rgba(12, 3, 4, 0.92)"
                                strokeWidth="4.6"
                                strokeLinecap="round"
                              />
                              {/* Pooled dark blood runnel */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke="#6b0f12"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                              />
                              {/* Faint wet crimson core */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke="rgba(138, 24, 24, 0.55)"
                                strokeWidth="1.1"
                                strokeLinecap="round"
                              />
                            </g>
                          );
                        }

                        return (
                          <g key={edgeKey}>
                            {(isActiveChoice || isTraced) && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke={isTraced ? 'rgba(224, 178, 86, 0.44)' : 'rgba(186, 46, 36, 0.36)'}
                                strokeWidth={isTraced ? '5.2' : '4.0'}
                                strokeLinecap="round"
                                style={{ mixBlendMode: 'screen' }}
                              />
                            )}
                            <path
                              d={pathD}
                              fill="none"
                              stroke={
                                isTraced
                                  ? '#c93a2b'
                                  : isEdgeLockedOut
                                    ? 'rgba(175, 165, 148, 0.14)'
                                    : isActiveChoice
                                      ? hasActiveTrace
                                        ? 'rgba(196, 62, 48, 0.55)'
                                        : 'rgba(204, 62, 48, 0.85)'
                                      : hasActiveTrace
                                        ? 'rgba(215, 205, 185, 0.22)'
                                        : 'rgba(215, 205, 185, 0.32)'
                              }
                              strokeWidth={
                                isTraced
                                  ? 2.6
                                  : isEdgeLockedOut
                                    ? 1.15
                                    : isActiveChoice
                                      ? 2.2
                                      : 1.55
                              }
                              strokeDasharray={isTraced ? undefined : isActiveChoice ? '6 4' : '4 5'}
                              strokeLinecap="round"
                            />
                          </g>
                        );
                      })
                    )}
                  </g>
                </svg>

                {/* Carved Map Nodes */}
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

                  const figurineKind: FigurineKind = isCurrent
                    ? 'player'
                    : obscured
                      ? 'obscured'
                      : node.type;

                  const figurineSizeClass =
                    isBoss && !isCurrent
                      ? 'w-[66px] h-[80px] -translate-y-2.5'
                      : 'w-12 h-[58px] -translate-y-2';

                  // Physical tabletop directional cast shadow + lit ember rim glow matching the pawn piece aesthetic
                  const pieceFilter = isCurrent
                    ? 'drop-shadow(4px 6px 3px rgba(0,0,0,0.94)) drop-shadow(0 0 8px rgba(244,224,186,0.48))'
                    : isBoss
                      ? isReachable
                        ? 'drop-shadow(5px 7px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 11px rgba(218,46,34,0.95))'
                        : 'drop-shadow(5px 7px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 6px rgba(136,22,22,0.45))'
                      : isReachable
                        ? isCombat
                          ? 'drop-shadow(4px 6px 3px rgba(0,0,0,0.94)) drop-shadow(0 0 8px rgba(216,48,34,0.95)) drop-shadow(0 0 15px rgba(176,24,20,0.72))'
                          : 'drop-shadow(4px 6px 3px rgba(0,0,0,0.94)) drop-shadow(0 0 8px rgba(234,186,98,0.92)) drop-shadow(0 0 15px rgba(196,138,48,0.62))'
                        : isOnTracedPath
                          ? 'drop-shadow(4px 6px 3px rgba(0,0,0,0.94)) drop-shadow(0 0 9px rgba(226,184,112,0.82))'
                          : isHovered
                            ? 'drop-shadow(4px 6px 3px rgba(0,0,0,0.94)) drop-shadow(0 0 7px rgba(220,196,154,0.52))'
                            : 'drop-shadow(4px 6px 3px rgba(0,0,0,0.92))';

                  return (
                    <div
                      key={node.id}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      onMouseEnter={() => handleHoverNode(node)}
                      onMouseLeave={() => handleLeaveNode(node.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-opacity duration-200 ${
                        isHovered ? 'z-40' : isOnTracedPath ? 'z-30' : isCurrent ? 'z-30' : isReachable ? 'z-20' : 'z-10'
                      } ${isLockedOut && !isHovered ? 'opacity-45 saturate-50' : 'opacity-100'}`}
                    >
                      {/* Physical Carved Tabletop Figurine Hit Target */}
                      <button
                        type="button"
                        aria-disabled={!isReachable}
                        onFocus={() => setHoveredNodeId(node.id)}
                        onBlur={() => setHoveredNodeId(prev => (prev === node.id ? null : prev))}
                        onClick={() => isReachable && onSelectNode(node)}
                        aria-label={meta.title}
                        className={`relative flex items-center justify-center transition-transform duration-200 ${
                          isBoss ? 'w-20 h-20' : 'w-16 h-16'
                        } ${isOnTracedPath && !isBoss ? 'scale-105 ' : ''}${
                          isCurrent
                            ? 'cursor-default'
                            : isReachable
                              ? 'hover:-translate-y-1 hover:scale-110 cursor-pointer'
                              : 'hover:scale-105 cursor-help'
                        }`}
                      >
                        {/* Grounded Elliptical Tabletop Cast Shadow Beneath Every Figurine */}
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/85 blur-[2.4px] ${
                            isBoss && !isCurrent ? 'w-14 h-3.5' : 'w-11 h-3'
                          }`}
                        />

                        {/* Screen-Blended Silhouette Ember Glow for Reachable Choices */}
                        {isReachable && !isCurrent && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 flex items-center justify-center animate-pulse [animation-duration:2.8s]"
                            style={{
                              mixBlendMode: 'screen',
                              filter:
                                isBoss || isCombat
                                  ? 'blur(5px) drop-shadow(0 0 10px rgba(217,56,41,0.95))'
                                  : 'blur(5px) drop-shadow(0 0 10px rgba(226,174,88,0.9))',
                              opacity: 0.84,
                            }}
                          >
                            <MapFigurineToken
                              kind={figurineKind}
                              className={figurineSizeClass}
                              glowSilhouette
                              glowColor={isBoss || isCombat ? '#d93829' : '#dfb05e'}
                            />
                          </span>
                        )}

                        {/* Physical Carved Bone/Ivory & Brass Miniature Game Piece */}
                        <span
                          className={`relative flex items-center justify-center transition-all duration-200 ${
                            isVisited ? 'opacity-55 brightness-75 saturate-50' : ''
                          }`}
                          style={{ filter: pieceFilter }}
                        >
                          <MapFigurineToken kind={figurineKind} className={figurineSizeClass} />
                        </span>

                        {/* Tapered Blood-Brushed Slash Blended Into Stone on Visited Nodes */}
                        {isVisited && (
                          <svg
                            viewBox="0 0 48 48"
                            className="pointer-events-none absolute inset-0 m-auto w-15 h-15 overflow-visible z-20"
                            style={{ mixBlendMode: 'multiply' }}
                            aria-hidden="true"
                          >
                            <g filter="url(#bloodSlashRough)" opacity="0.92">
                              <path
                                d="M 6 9 Q 18 19 25 25 T 43 41 L 39 43 Q 27 33 21 27 T 4 12 Z"
                                fill="#5c0a0d"
                              />
                              <path
                                d="M 42 7 Q 31 18 24 25 T 6 42 L 10 43 Q 21 32 27 26 T 44 10 Z"
                                fill="#5c0a0d"
                              />
                            </g>
                          </svg>
                        )}
                      </button>

                      {/* Pure Lit Cinzel Caption (Zero Pill / Box / Cutoff) */}
                      {(isCurrent && !isBoss) || isBoss || isReachable || isHovered ? (
                        <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1 flex flex-col items-center z-40">
                          {isCurrent && !isBoss && (
                            <span
                              className="font-['Cinzel',_serif] text-[8.5px] font-bold uppercase tracking-[0.32em] text-[#e8a89c]"
                              style={{
                                textShadow:
                                  '0 0 2px #000, 0 0 6px #000, 0 0 12px #000, 0 1px 16px rgba(0,0,0,0.95)',
                              }}
                            >
                              You
                            </span>
                          )}
                          {(isBoss || isReachable || isHovered) && (
                            <span
                              className={`font-['Cinzel',_serif] font-bold uppercase whitespace-nowrap ${
                                isBoss
                                  ? 'text-[11px] tracking-[0.22em] text-[#f5dfb2]'
                                  : 'text-[10px] tracking-[0.18em] text-[#f2e4cc]'
                              }`}
                              style={{
                                textShadow:
                                  '0 0 2px #000, 0 0 7px #000, 0 0 14px #000, 0 2px 18px rgba(0,0,0,0.98)',
                              }}
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
          </div>
        </div>

        {/* RIGHT FLANK: Cartographer's Omen Inspector & Expedition Ledger */}
        {(() => {
          const mapStage = (mapData as any)?.stage ?? (mapData as any)?.act ?? (mapData as any)?.actNumber ?? 1;
          const isAct4Burned = mapStage >= 4;
          const mapSwayAnim =
            mapStage === 2
              ? 'bannerSwayMid 12s linear infinite'
              : mapStage === 3
                ? 'bannerSwayBrisk 10s linear infinite'
                : 'bannerSwayGentle 7s ease-in-out infinite';
          const mapRippleAnim =
            mapStage === 2
              ? 'bannerClothRippleGPU 3.0s linear infinite'
              : mapStage === 3
                ? 'bannerClothRippleGPU 2.5s linear infinite'
                : 'bannerClothRippleGPU 5.8s linear infinite';
          const mapRippleOpacity = mapStage === 3 ? 0.18 : mapStage === 2 ? 0.14 : 0.07;
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
                  baseFrequency="0.0028 0.012"
                  numOctaves="1"
                  seed="7"
                  result="noise"
                />
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
              className="relative z-10 flex-1 flex flex-col -mt-1.5 min-h-0 will-change-transform"
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
                {/* Seamless Downward Wind Sheen (GPU-composited translate3d) */}
                <div
                  className="pointer-events-none absolute -top-[180px] inset-x-0 bottom-0 will-change-transform"
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
                  className={`pointer-events-none absolute bottom-0 inset-x-0 h-5 opacity-80 banner-hem banner-hem-s${mapStage}`}
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
              {/* Woven Gothic Lancet Archway, Jacquard Damask & Braided Gold Pillars */}
              <svg
                className="pointer-events-none absolute -inset-x-2.5 -top-1.5 -bottom-2 w-[calc(100%+20px)] h-[calc(100%+14px)]"
                viewBox="0 0 260 360"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="sacredGoldFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e6c27a" stopOpacity="0.72" />
                    <stop offset="58%" stopColor="#c4944c" stopOpacity="0.48" />
                    <stop offset="88%" stopColor="#9e6d32" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#9e6d32" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="sacredArchGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f0ce88" stopOpacity="0.58" />
                    <stop offset="100%" stopColor="#b07c38" stopOpacity="0.12" />
                  </linearGradient>
                </defs>

                {/* Subtle Jacquard Damask Rose Watermark Woven Into Cloth */}
                <g opacity="0.11" stroke="#e4be76" fill="none">
                  <circle cx="130" cy="156" r="96" strokeWidth="0.9" strokeDasharray="3 5" />
                  <circle cx="130" cy="156" r="76" strokeWidth="0.6" />
                  <path d="M 130 48 L 130 264 M 22 156 L 238 156 M 54 80 L 206 232 M 206 80 L 54 232" strokeWidth="0.5" />
                </g>

                {/* Twin Braided Side Pillars */}
                <line x1="7" y1="42" x2="7" y2="346" stroke="url(#sacredGoldFade)" strokeWidth="1.2" />
                <line x1="12" y1="48" x2="12" y2="338" stroke="url(#sacredGoldFade)" strokeWidth="0.75" strokeDasharray="2 4" />
                <line x1="253" y1="42" x2="253" y2="346" stroke="url(#sacredGoldFade)" strokeWidth="1.2" />
                <line x1="248" y1="48" x2="248" y2="338" stroke="url(#sacredGoldFade)" strokeWidth="0.75" strokeDasharray="2 4" />

                {/* Pointed Gothic Lancet Arch Framing the Sanctum */}
                <path
                  d="M 7 44 Q 10 14 48 9 L 92 9 Q 116 9 130 3 Q 144 9 168 9 L 212 9 Q 250 14 253 44"
                  fill="none"
                  stroke="url(#sacredArchGlow)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 12 49 Q 15 20 50 15 L 210 15 Q 245 20 248 49"
                  fill="none"
                  stroke="#d9ae66"
                  strokeOpacity="0.34"
                  strokeWidth="0.7"
                  strokeDasharray="2 3"
                />

                {/* Upper Corner Rosette Knots & Hanging Plumb-Threads */}
                <g stroke="#dfb66e" strokeOpacity="0.72" fill="none" strokeWidth="0.95">
                  <polygon points="18,22 23,17 28,22 23,27" />
                  <line x1="23" y1="27" x2="23" y2="44" strokeOpacity="0.45" strokeDasharray="1.5 2" />
                  <circle cx="23" cy="46" r="1.4" fill="#dfb66e" fillOpacity="0.7" stroke="none" />

                  <polygon points="242,22 237,17 232,22 237,27" />
                  <line x1="237" y1="27" x2="237" y2="44" strokeOpacity="0.45" strokeDasharray="1.5 2" />
                  <circle cx="237" cy="46" r="1.4" fill="#dfb66e" fillOpacity="0.7" stroke="none" />
                </g>
              </svg>

              {/* Liturgical Crown Header */}
              <div className="shrink-0 flex flex-col items-center justify-center gap-0.5 pt-2.5 pb-1 text-center">
                <span className="text-[10px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.3em] text-[#f5e3c2] drop-shadow-[0_1px_5px_rgba(0,0,0,0.96)]">
                  {isInspectedReachable ? 'Reachable Omen' : 'Map Survey'}
                </span>
                {inspectedMeta && (
                  <span
                    key={`tag-${inspectedNode?.id || 'none'}`}
                    style={{ animation: 'mapOmenReveal 220ms ease-out both' }}
                    className={`text-[8.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.36em] text-center drop-shadow-[0_1px_5px_rgba(0,0,0,0.96)] ${
                      inspectedMeta.tone === 'boss' || inspectedMeta.tone === 'combat' ? 'text-[#f29b8e]' : 'text-[#e2be7e]'
                    }`}
                  >
                    ✧ {inspectedMeta.tag} ✧
                  </span>
                )}
              </div>

              {inspectedNode && inspectedMeta && (
                <div
                  key={inspectedNode.id}
                  style={{ animation: 'mapOmenReveal 240ms ease-out both' }}
                  className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-3 pb-2"
                >
                  {/* Gilded Sunburst Mandorla & Counter-Rotating Sacred Rings */}
                  <div className="relative mb-2.5 shrink-0 w-32 h-32 flex items-center justify-center">
                    {/* Outer Slow-Rotating Sunburst Glory */}
                    <svg
                      viewBox="0 0 140 140"
                      className="pointer-events-none absolute inset-0 w-full h-full opacity-75 will-change-transform"
                      style={{ animation: 'mapCrestSpin 78s linear infinite' }}
                      aria-hidden="true"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const deg = i * 15;
                        const major = i % 3 === 0;
                        const mid = i % 2 === 0;
                        return (
                          <line
                            key={deg}
                            x1="70"
                            y1={major ? '6' : mid ? '14' : '20'}
                            x2="70"
                            y2="34"
                            stroke={inspectedMeta.tone === 'boss' || inspectedMeta.tone === 'combat' ? '#db6b58' : '#deb46b'}
                            strokeOpacity={major ? '0.62' : mid ? '0.35' : '0.2'}
                            strokeWidth={major ? '1.15' : '0.7'}
                            transform={`rotate(${deg} 70 70)`}
                          />
                        );
                      })}
                      <circle
                        cx="70"
                        cy="70"
                        r="54"
                        fill="none"
                        stroke="#deb46b"
                        strokeOpacity="0.34"
                        strokeWidth="0.85"
                        strokeDasharray="2 5"
                      />
                    </svg>

                    {/* Inner Counter-Rotating Alchemical Seal */}
                    <svg
                      viewBox="0 0 140 140"
                      className="pointer-events-none absolute inset-0 w-full h-full opacity-80 will-change-transform"
                      style={{ animation: 'mapCrestSpinRev 54s linear infinite' }}
                      aria-hidden="true"
                    >
                      <circle
                        cx="70"
                        cy="70"
                        r="41"
                        fill="none"
                        stroke={inspectedMeta.tone === 'boss' || inspectedMeta.tone === 'combat' ? '#d95848' : '#d6aa60'}
                        strokeOpacity="0.46"
                        strokeWidth="0.9"
                      />
                      <polygon
                        points="70,29 105.5,90.5 34.5,90.5"
                        fill="none"
                        stroke="#d6aa60"
                        strokeOpacity="0.28"
                        strokeWidth="0.75"
                      />
                      <polygon
                        points="70,111 105.5,49.5 34.5,49.5"
                        fill="none"
                        stroke="#d6aa60"
                        strokeOpacity="0.28"
                        strokeWidth="0.75"
                      />
                    </svg>

                    {/* Static Cardinal Reliquary Points & Velvet Core */}
                    <svg
                      viewBox="0 0 140 140"
                      className="pointer-events-none absolute inset-0 w-full h-full"
                      aria-hidden="true"
                    >
                      <circle cx="70" cy="70" r="26" fill="rgba(22,4,5,0.52)" stroke="#e0b870" strokeOpacity="0.42" strokeWidth="0.85" />
                      <polygon points="70,15 73.5,22 70,26 66.5,22" fill="#e5be76" fillOpacity="0.88" />
                      <polygon points="70,125 73.5,118 70,114 66.5,118" fill="#e5be76" fillOpacity="0.88" />
                      <polygon points="15,70 22,66.5 26,70 22,73.5" fill="#e5be76" fillOpacity="0.88" />
                      <polygon points="125,70 118,66.5 114,70 118,73.5" fill="#e5be76" fillOpacity="0.88" />
                    </svg>

                    <div
                      className={`relative flex items-center justify-center ${
                        inspectedMeta.tone === 'boss'
                          ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_13px_rgba(210,42,30,0.9)]'
                          : inspectedMeta.tone === 'combat'
                            ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_11px_rgba(205,46,32,0.82)]'
                            : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_10px_rgba(222,190,136,0.72)]'
                      }`}
                    >
                      <MapFigurineToken
                        kind={
                          isNodeObscured(inspectedNode)
                            ? 'obscured'
                            : inspectedNode.id === mapData.currentNodeId
                              ? 'player'
                              : inspectedNode.type
                        }
                        className={inspectedNode.type === 'boss' ? 'w-14 h-[70px] -translate-y-0.5' : 'w-12 h-[60px] -translate-y-0.5'}
                      />
                    </div>
                  </div>

                  {/* Gilded Embroidered Title */}
                  <h2
                    className="text-lg lg:text-[21px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.22em] text-[#fcf1dc] leading-tight"
                    style={{
                      textShadow:
                        '0 1px 0 rgba(110,68,24,0.85), 0 2px 10px rgba(0,0,0,0.96), 0 0 18px rgba(212,158,76,0.22)',
                    }}
                  >
                    {inspectedMeta.title}
                  </h2>

                  {/* Sacred Thorn & Eye-Knot Embroidery Rule */}
                  <svg viewBox="0 0 200 20" className="w-44 h-4.5 my-2 shrink-0 opacity-90" aria-hidden="true">
                    <path
                      d="M 6 10 Q 42 10 68 10 M 132 10 Q 158 10 194 10"
                      stroke="#d4aa64"
                      strokeOpacity="0.65"
                      strokeWidth="0.95"
                      fill="none"
                    />
                    <path
                      d="M 68 10 C 80 3, 90 3, 100 10 C 90 17, 80 17, 68 10 Z M 132 10 C 120 3, 110 3, 100 10 C 110 17, 120 17, 132 10 Z"
                      fill="none"
                      stroke="#e2bc76"
                      strokeOpacity="0.82"
                      strokeWidth="1"
                    />
                    <circle cx="100" cy="10" r="3.2" fill="#3a0809" stroke="#f0ce88" strokeWidth="1" />
                    <circle cx="100" cy="10" r="1.1" fill="#f0ce88" />
                    <circle cx="44" cy="10" r="1.3" fill="#d4aa64" fillOpacity="0.7" />
                    <circle cx="156" cy="10" r="1.3" fill="#d4aa64" fillOpacity="0.7" />
                  </svg>

                  <p className="w-full text-center text-xs lg:text-[13px] font-['Cinzel',_serif] italic tracking-[0.05em] text-[#f4e5cc] leading-relaxed px-3 drop-shadow-[0_1px_6px_rgba(0,0,0,0.96)]">
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
              className="relative z-10 -mt-1.5 will-change-transform"
              style={{
                transformOrigin: 'top center',
                animation: mapSwayAnim.replace(' infinite', ' -4.7s infinite'),
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
                {/* Seamless Downward Wind Sheen (GPU-composited translate3d) */}
                <div
                  className="pointer-events-none absolute -top-[180px] inset-x-0 bottom-0 will-change-transform"
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
                  className={`pointer-events-none absolute bottom-0 inset-x-0 h-5 opacity-80 banner-hem banner-hem-s${mapStage}`}
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
              {/* Woven Gothic Tapestry Pillars & Crown Arch */}
              <svg
                className="pointer-events-none absolute -inset-x-2.5 -top-1.5 -bottom-2 w-[calc(100%+20px)] h-[calc(100%+14px)]"
                viewBox="0 0 260 230"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ledgerGoldFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e6c27a" stopOpacity="0.68" />
                    <stop offset="68%" stopColor="#c4944c" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#9e6d32" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="alcoveDarkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#120405" stopOpacity="0.34" />
                    <stop offset="70%" stopColor="#120405" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#120405" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="alcoveBloodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#240506" stopOpacity="0.42" />
                    <stop offset="70%" stopColor="#240506" stopOpacity="0.26" />
                    <stop offset="100%" stopColor="#240506" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="alcoveGoldStroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4aa64" stopOpacity="0.52" />
                    <stop offset="74%" stopColor="#d4aa64" stopOpacity="0.34" />
                    <stop offset="100%" stopColor="#d4aa64" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="alcoveBloodStroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d96b58" stopOpacity="0.6" />
                    <stop offset="74%" stopColor="#d96b58" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#d96b58" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="7" y1="30" x2="7" y2="220" stroke="url(#ledgerGoldFade)" strokeWidth="1.15" />
                <line x1="12" y1="35" x2="12" y2="212" stroke="url(#ledgerGoldFade)" strokeWidth="0.7" strokeDasharray="2 4" />
                <line x1="253" y1="30" x2="253" y2="220" stroke="url(#ledgerGoldFade)" strokeWidth="1.15" />
                <line x1="248" y1="35" x2="248" y2="212" stroke="url(#ledgerGoldFade)" strokeWidth="0.7" strokeDasharray="2 4" />
                <path
                  d="M 7 32 Q 10 10 42 7 L 96 7 Q 118 7 130 2 Q 142 7 164 7 L 218 7 Q 250 10 253 32"
                  fill="none"
                  stroke="#e0b870"
                  strokeOpacity="0.52"
                  strokeWidth="1.1"
                />
              </svg>

              {/* Crowned Act Boss Reliquary Crest */}
              <div className="flex flex-col items-center text-center pt-1.5 pb-2.5 mb-2">
                <div className="flex items-center justify-center gap-2 w-full mb-0.5 px-3">
                  <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d4aa64]/75" />
                  <span className="text-[8.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.34em] text-[#e2be82] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] whitespace-nowrap">
                    ✧ Act Boss ✧
                  </span>
                  <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d4aa64]/75" />
                </div>
                <span
                  className="font-['Cinzel',_serif] font-bold text-base lg:text-[17.5px] text-[#fad6ce] uppercase tracking-[0.2em]"
                  style={{
                    textShadow:
                      '0 1px 0 rgba(88,16,14,0.95), 0 2px 10px rgba(185,28,28,0.85), 0 0 16px rgba(185,28,28,0.45)',
                  }}
                >
                  {bossMeta.name}
                </span>
              </div>

              {/* 3 Pointed Gothic Trefoil Alcoves (Deck | Blood | Bones) */}
              <div className="grid grid-cols-3 gap-1.5 items-stretch text-center mb-2.5 px-1">
                {/* Alcove 1: Deck */}
                <div className="relative flex flex-col items-center justify-center pt-3 pb-2 px-1">
                  <svg
                    viewBox="0 0 80 76"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 w-full h-full"
                    aria-hidden="true"
                  >
                    <path
                      d="M 4 75 L 4 24 Q 4 10 40 3 Q 76 10 76 24 L 76 75"
                      fill="url(#alcoveDarkFill)"
                      stroke="url(#alcoveGoldStroke)"
                      strokeWidth="1"
                    />
                    <circle cx="40" cy="4" r="1.6" fill="#e4be76" fillOpacity="0.8" />
                  </svg>
                  <svg viewBox="0 0 20 20" className="relative w-3.5 h-3.5 text-[#dfbe82] opacity-90 mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="4" y="3" width="8" height="12" rx="1" transform="rotate(-8 8 9)" />
                    <rect x="8" y="4" width="8" height="12" rx="1" transform="rotate(8 12 10)" />
                  </svg>
                  <span className="relative font-['Cinzel',_serif] font-bold text-lg leading-none text-[#fbf0db] drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                    {deckSize}
                  </span>
                  <span className="relative mt-1 text-[7.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.24em] text-[#cfb690]">
                    Deck
                  </span>
                </div>

                {/* Alcove 2: Overkill Blood */}
                <div className="relative flex flex-col items-center justify-center pt-3 pb-2 px-1">
                  <svg
                    viewBox="0 0 80 76"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 w-full h-full"
                    aria-hidden="true"
                  >
                    <path
                      d="M 4 75 L 4 24 Q 4 10 40 3 Q 76 10 76 24 L 76 75"
                      fill="url(#alcoveBloodFill)"
                      stroke="url(#alcoveBloodStroke)"
                      strokeWidth="1"
                    />
                    <circle cx="40" cy="4" r="1.6" fill="#e87a6a" fillOpacity="0.88" />
                  </svg>
                  <svg viewBox="0 0 20 20" className="relative w-3.5 h-3.5 text-[#ec7c6c] opacity-95 mb-0.5" fill="currentColor" aria-hidden="true">
                    <path d="M10 2.5C10 2.5 4.5 9 4.5 12.8a5.5 5.5 0 0 0 11 0C15.5 9 10 2.5 10 2.5Z" />
                  </svg>
                  <span className="relative font-['Cinzel',_serif] font-bold text-lg leading-none text-[#f8b0a4] drop-shadow-[0_0_8px_rgba(185,28,28,0.85)]">
                    {overkillBlood}
                    <span className="text-[9.5px] ml-0.5 font-semibold tracking-normal">oz</span>
                  </span>
                  <span className="relative mt-1 text-[7.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.24em] text-[#cfb690]">
                    Blood
                  </span>
                </div>

                {/* Alcove 3: Starting Bones */}
                <div className="relative flex flex-col items-center justify-center pt-3 pb-2 px-1">
                  <svg
                    viewBox="0 0 80 76"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 w-full h-full"
                    aria-hidden="true"
                  >
                    <path
                      d="M 4 75 L 4 24 Q 4 10 40 3 Q 76 10 76 24 L 76 75"
                      fill="url(#alcoveDarkFill)"
                      stroke="url(#alcoveGoldStroke)"
                      strokeWidth="1"
                    />
                    <circle cx="40" cy="4" r="1.6" fill="#e4be76" fillOpacity="0.8" />
                  </svg>
                  <svg viewBox="0 0 20 20" className="relative w-3.5 h-3.5 text-[#ead9bc] opacity-90 mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                    <path d="M5.5 14.5L14.5 5.5" />
                    <circle cx="4.5" cy="13.5" r="1.4" />
                    <circle cx="6.5" cy="15.5" r="1.4" />
                    <circle cx="13.5" cy="4.5" r="1.4" />
                    <circle cx="15.5" cy="6.5" r="1.4" />
                  </svg>
                  <span className="relative font-['Cinzel',_serif] font-bold text-lg leading-none text-[#fbf0db] drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                    {startingBones}
                  </span>
                  <span className="relative mt-1 text-[7.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.24em] text-[#cfb690]">
                    Bones
                  </span>
                </div>
              </div>

              {/* Stitched Phylactery Thread for Woven Effigy */}
              <div className="flex flex-col items-center text-center pt-0.5">
                <div className="flex items-center justify-center gap-2 w-full px-4 mb-1">
                  <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c99b56]/45 to-[#c99b56]/75" />
                  <span className="text-[8px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.32em] text-[#d6ba8c] whitespace-nowrap">
                    Woven Effigy
                  </span>
                  <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#c99b56]/45 to-[#c99b56]/75" />
                </div>
                <span className="font-['Cinzel',_serif] font-bold text-xs text-[#f6dba4] tracking-[0.14em] uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.96)]">
                  {activeTotem?.head && activeTotem?.body
                    ? `${activeTotem.head}  ✧  ${activeTotem.body}`
                    : 'Unstitched'}
                </span>
              </div>

              {activeVows.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-dotted border-[#c99b56]/35 flex flex-wrap justify-center gap-x-2.5 gap-y-1">
                  {activeVows.map(vId => (
                    <span
                      key={vId}
                      title={RITUAL_VOW_MAP[vId]?.desc}
                      className="text-[9px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.16em] text-[#f5b0a4] drop-shadow-[0_0_5px_rgba(0,0,0,0.95)]"
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
