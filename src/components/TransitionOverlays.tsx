import React, { useEffect, useId, useRef, useState } from 'react';

const IRIS_FIBERS = Array.from({ length: 24 }, (_, i) => {
  const ang = (i / 24) * Math.PI * 2;
  const isMajor = i % 2 === 0;
  const rInner = isMajor ? 2.5 : 3.2;
  const rOuter = isMajor ? 6.9 : 6.4;
  return {
    x1: +(50 + Math.cos(ang) * rInner).toFixed(2),
    y1: +(50 + Math.sin(ang) * rInner).toFixed(2),
    x2: +(50 + Math.cos(ang) * rOuter).toFixed(2),
    y2: +(50 + Math.sin(ang) * rOuter).toFixed(2),
    isMajor,
  };
});

export const TalismanEye: React.FC<{ isTalismanPricked: boolean }> = ({ isTalismanPricked }) => {
  const uid = useId().replace(/:/g, '');
  const socketRef = useRef<SVGGElement>(null);
  const irisGroupRef = useRef<SVGGElement>(null);
  const glintGroupRef = useRef<SVGGElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let rafId: number | null = null;

    const tick = () => {
      const dx = targetX - curX;
      const dy = targetY - curY;
      curX += dx * 0.18;
      curY += dy * 0.18;

      if (irisGroupRef.current) {
        irisGroupRef.current.setAttribute('transform', `translate(${curX.toFixed(2)}, ${curY.toFixed(2)})`);
      }
      if (glintGroupRef.current) {
        // Subtle optical parallax on the wet corneal catchlights
        glintGroupRef.current.setAttribute(
          'transform',
          `translate(${(curX * 0.42).toFixed(2)}, ${(curY * 0.42).toFixed(2)})`
        );
      }

      if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        curX = targetX;
        curY = targetY;
        if (irisGroupRef.current) {
          irisGroupRef.current.setAttribute('transform', `translate(${curX.toFixed(2)}, ${curY.toFixed(2)})`);
        }
        if (glintGroupRef.current) {
          glintGroupRef.current.setAttribute(
            'transform',
            `translate(${(curX * 0.42).toFixed(2)}, ${(curY * 0.42).toFixed(2)})`
          );
        }
        rafId = null;
      }
    };

    const scheduleTick = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!socketRef.current) return;
      const btn = socketRef.current.closest('button');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = Math.max(rect.width / 2, 1);

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < 1.5) {
        targetX = 0;
        targetY = 0;
        scheduleTick();
        return;
      }

      const angle = Math.atan2(dy, dx);
      // Track intensely when hovering near/inside the plinth, and watch subtly across the entire battlefield
      const normDist = dist / radius;
      const pull =
        normDist <= 1.2
          ? Math.sin(Math.min(normDist / 0.9, 1) * (Math.PI / 2))
          : Math.max(0.56, 0.92 - Math.min(normDist - 1.2, 6) * 0.055);

      targetX = Math.cos(angle) * pull * 4.4;
      targetY = Math.sin(angle) * pull * 3.1;
      scheduleTick();
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      setIsHovered(false);
      scheduleTick();
    };

    const btn = socketRef.current?.closest('button');
    const onBtnEnter = () => setIsHovered(true);
    const onBtnLeave = () => setIsHovered(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    btn?.addEventListener('mouseenter', onBtnEnter);
    btn?.addEventListener('mouseleave', onBtnLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      btn?.removeEventListener('mouseenter', onBtnEnter);
      btn?.removeEventListener('mouseleave', onBtnLeave);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const isAwake = isTalismanPricked || isHovered;
  const lidPath = isAwake
    ? 'M 37.2 50 Q 50 38.6, 62.8 50 Q 50 61.4, 37.2 50 Z'
    : 'M 37.6 50 Q 50 40.4, 62.4 50 Q 50 59.6, 37.6 50 Z';

  return (
    <g
      ref={socketRef}
      className="pointer-events-none select-none"
      style={{
        filter: isTalismanPricked
          ? 'drop-shadow(0 0 7px rgba(239,68,68,0.9))'
          : isHovered
            ? 'drop-shadow(0 0 5px rgba(220,38,38,0.65))'
            : 'drop-shadow(0 1.5px 3px rgba(0,0,0,0.95))',
      }}
    >
      <defs>
        <clipPath id={`eyeLidClip-${uid}`}>
          <path d={lidPath} />
        </clipPath>

        {/* Forged Tarnished-Brass Ocular Socket Rim */}
        <linearGradient id={`eyeBezelBrass-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isTalismanPricked ? '#ef4444' : isHovered ? '#dfba7c' : '#9c7848'} />
          <stop offset="48%" stopColor={isTalismanPricked ? '#7f1d1d' : '#52381d'} />
          <stop offset="100%" stopColor="#180f08" />
        </linearGradient>

        {/* Aged Bloodshot Sclera Spherical Gradient */}
        <radialGradient id={`eyeSclera-${uid}`} cx="47%" cy="44%" r="60%">
          <stop offset="0%" stopColor={isTalismanPricked ? '#6b181c' : isHovered ? '#522222' : '#4a3d33'} />
          <stop offset="56%" stopColor={isTalismanPricked ? '#36070a' : isHovered ? '#2a0d0e' : '#261e1a'} />
          <stop offset="100%" stopColor="#090405" />
        </radialGradient>

        {/* Striated Occult Iris Gradient (Brooding Smoked-Amber -> Smoldering Crimson -> Incandescent Scarlet) */}
        <radialGradient id={`eyeIris-${uid}`} cx="50%" cy="50%" r="52%">
          <stop offset="0%" stopColor={isTalismanPricked ? '#fca5a5' : isHovered ? '#f87171' : '#cfa063'} />
          <stop offset="34%" stopColor={isTalismanPricked ? '#ef4444' : isHovered ? '#dc2626' : '#855628'} />
          <stop offset="72%" stopColor={isTalismanPricked ? '#991b1b' : isHovered ? '#7f1d1d' : '#452812'} />
          <stop offset="100%" stopColor="#120606" />
        </radialGradient>

        {/* Deep Upper Orbital Lid Shadow (Creates True Recessed 3D Eyeball Depth) */}
        <linearGradient id={`eyeLidShadow-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050202" stopOpacity="0.92" />
          <stop offset="34%" stopColor="#050202" stopOpacity="0.32" />
          <stop offset="62%" stopColor="#050202" stopOpacity="0" />
          <stop offset="100%" stopColor="#050202" stopOpacity="0.62" />
        </linearGradient>
      </defs>

      {/* 1. SCULPTED FORGED-IRON & TARNISHED-BRASS OCULAR SOCKET HOUSING */}
      <circle cx="50" cy="50" r="14.8" fill="#070505" stroke="#040303" strokeWidth="1.2" />
      <circle
        cx="50"
        cy="50"
        r="13.8"
        fill="#130d0c"
        stroke={`url(#eyeBezelBrass-${uid})`}
        strokeWidth="1.6"
      />
      {/* Subtle Inner Engraved Brass Fillet */}
      <circle
        cx="50"
        cy="50"
        r="12.1"
        fill="#080405"
        stroke={isAwake ? 'rgba(220,38,38,0.55)' : 'rgba(196,154,92,0.28)'}
        strokeWidth="0.65"
      />

      {/* 4 Tiny Cardinal Forged-Brass Claw Prongs Gripping the Ocular Socket */}
      {[0, 90, 180, 270].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 50)`}>
          <path
            d="M 48.2 34.4 L 51.8 34.4 L 51.1 37.6 L 48.9 37.6 Z"
            fill={`url(#eyeBezelBrass-${uid})`}
            stroke="#120a06"
            strokeWidth="0.45"
          />
          <circle cx="50" cy="35.8" r="0.65" fill={isTalismanPricked ? '#fca5a5' : '#e5c185'} />
        </g>
      ))}

      {/* 2. LIVING BLINKING ALMOND EYE APERTURE */}
      <g className={isAwake ? 'talisman-eye-lid talisman-eye-lid--locked' : 'talisman-eye-lid'}>
        {/* Carved Dark Eyelid Fold Shadow Around Aperture */}
        <path
          d={lidPath}
          fill={`url(#eyeSclera-${uid})`}
          stroke="#050203"
          strokeWidth="1.6"
        />

        {/* Clipped Eyeball Interior (Sclera Veins + Tracking Striated Iris + Vertical Slit Pupil) */}
        <g clipPath={`url(#eyeLidClip-${uid})`}>
          {/* Branching Bloodshot Sclera Capillaries */}
          <g
            fill="none"
            stroke={isTalismanPricked ? '#ef4444' : isHovered ? '#b91c1c' : '#78342f'}
            strokeLinecap="round"
            opacity={isTalismanPricked ? 0.85 : isHovered ? 0.72 : 0.45}
          >
            <path d="M 38.4 49.4 Q 41.2 48.8, 43.4 49.6 M 40.5 49.1 Q 42 47.4, 43.8 47.2" strokeWidth="0.48" />
            <path d="M 38.8 51.2 Q 41.4 51.8, 43.6 51.2" strokeWidth="0.42" />
            <path d="M 61.6 49.5 Q 58.6 48.7, 56.6 49.6 M 59.5 49.1 Q 58.1 47.5, 56.3 47.4" strokeWidth="0.48" />
            <path d="M 61.1 51.3 Q 58.4 52, 56.5 51.1" strokeWidth="0.42" />
          </g>

          {/* Moving Ocular Iris & Occult Vertical Slit Pupil (Smoothly Tracks Cursor) */}
          <g ref={irisGroupRef}>
            {/* Dark Limbal Ring & Striated Iris Disc */}
            <circle
              cx="50"
              cy="50"
              r={isTalismanPricked ? 7.3 : isHovered ? 7.0 : 6.6}
              fill={`url(#eyeIris-${uid})`}
              stroke="#090304"
              strokeWidth="0.95"
            />

            {/* 24 Radiating Organic Iris Fibers */}
            <g
              stroke={isTalismanPricked ? '#fecaca' : isHovered ? '#fca5a5' : '#e2be86'}
              strokeLinecap="round"
            >
              {IRIS_FIBERS.map((f, idx) => (
                <line
                  key={idx}
                  x1={f.x1}
                  y1={f.y1}
                  x2={f.x2}
                  y2={f.y2}
                  strokeWidth={f.isMajor ? '0.42' : '0.28'}
                  opacity={f.isMajor ? (isAwake ? 0.48 : 0.34) : (isAwake ? 0.28 : 0.18)}
                />
              ))}
            </g>

            {/* Inner Glowing Collarette Ring Around Pupil */}
            <circle
              cx="50"
              cy="50"
              r={isTalismanPricked ? 3.9 : 3.5}
              fill="none"
              stroke={isTalismanPricked ? '#fecdd3' : isHovered ? '#f87171' : '#d4a359'}
              strokeWidth="0.55"
              strokeDasharray="1.6 1.2"
              opacity={isAwake ? 0.85 : 0.55}
            />

            {/* Living Occult Vertical-Slit Pupil (Sharpens & Dilates on Hover/Prick) */}
            <path
              d={
                isTalismanPricked
                  ? 'M 50 44.3 C 52.3 46.8, 52.3 53.2, 50 55.7 C 47.7 53.2, 47.7 46.8, 50 44.3 Z'
                  : isHovered
                    ? 'M 50 44.8 C 52.0 47.1, 52.0 52.9, 50 55.2 C 48.0 52.9, 48.0 47.1, 50 44.8 Z'
                    : 'M 50 45.4 C 51.6 47.4, 51.6 52.6, 50 54.6 C 48.4 52.6, 48.4 47.4, 50 45.4 Z'
              }
              fill="#050203"
              stroke={isTalismanPricked ? '#ef4444' : isHovered ? '#b91c1c' : '#1a0c09'}
              strokeWidth="0.5"
            />
          </g>

          {/* Curved Upper/Lower Orbital Shadow Casting Depth Over Eyeball */}
          <rect x="35" y="37" width="30" height="26" fill={`url(#eyeLidShadow-${uid})`} />

          {/* Wet Corneal Specular Catchlights (Subtle Optical Parallax Layer) */}
          <g ref={glintGroupRef}>
            <path
              d="M 46.2 46.8 Q 47.6 45.2, 49.4 45.5"
              fill="none"
              stroke="#fff7ed"
              strokeWidth="1.15"
              strokeLinecap="round"
              opacity={isAwake ? 0.95 : 0.78}
            />
            <circle cx="46.4" cy="48.2" r="0.55" fill="#ffffff" opacity={isAwake ? 0.8 : 0.55} />
            <circle cx="53.1" cy="52.6" r="0.62" fill="#fde2e2" opacity={isAwake ? 0.65 : 0.4} />
          </g>
        </g>

        {/* Crisp Sculpted Upper & Lower Eyelid Rim Highlights */}
        <path
          d={lidPath}
          fill="none"
          stroke={isTalismanPricked ? '#ef4444' : isHovered ? '#c93838' : '#7c6248'}
          strokeWidth="0.9"
        />
        {/* Subtle Upper Eyelid Crease Line */}
        <path
          d={isAwake ? 'M 39.2 47.2 Q 50 37.8, 60.8 47.2' : 'M 39.5 47.8 Q 50 39.4, 60.5 47.8'}
          fill="none"
          stroke={isAwake ? 'rgba(252,165,165,0.4)' : 'rgba(214,186,148,0.28)'}
          strokeWidth="0.55"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

// --- Volumetric Occult Smoke Cloud Transition (Hardware Canvas Particles) ---
const SMOKE_PUFFS = Array.from({ length: 84 }, (_, i) => {
  let fromLeft: boolean;
  let startX: number;
  let targetX: number;

  if (i < 28) {
    // Sector 1: Left Flank anchors (ensures left-side cards stay densely veiled)
    fromLeft = true;
    startX = -220 - ((i * 13) % 180);
    targetX = -40 + (i / 27) * 480 + ((i * 17) % 60 - 30);
  } else if (i < 56) {
    // Sector 2: Center Core billows (interlocking center meeting point)
    const j = i - 28;
    fromLeft = j % 2 === 0;
    startX = fromLeft ? -220 - (j * 12) : 1280 + 220 + (j * 12);
    targetX = 400 + (j / 27) * 480 + ((j * 19) % 60 - 30);
  } else {
    // Sector 3: Right Flank anchors (ensures right-side cards stay densely veiled)
    const j = i - 56;
    fromLeft = false;
    startX = 1280 + 220 + ((j * 13) % 180);
    targetX = 840 + (j / 27) * 480 + ((j * 17) % 60 - 30);
  }

  const baseY = 20 + ((i * 31) % 680);
  const baseR = 150 + ((i * 23) % 110);
  const spriteIdx = i % 4;
  const maxAlpha = [0.98, 0.90, 0.78, 0.50][spriteIdx];
  const driftY = -25 - ((i * 11) % 35);
  const speedMult = 0.85 + ((i * 13) % 35) / 100;

  return { fromLeft, startX, targetX, baseY, baseR, driftY, spriteIdx, maxAlpha, speedMult };
});

const createSmokeSprites = () => {
  const tones = [
    { r: 8, g: 6, b: 5, a: 0.98 },    // deep soot
    { r: 18, g: 14, b: 12, a: 0.90 }, // charcoal
    { r: 32, g: 26, b: 24, a: 0.78 }, // dark ash
    { r: 48, g: 40, b: 36, a: 0.50 }, // wisp highlight
  ];
  return tones.map(({ r, g, b, a }) => {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) return c;
    const half = size / 2;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
    grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${a * 0.85})`);
    grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${a * 0.4})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return c;
  });
};

export const BattleTransitionOverlay: React.FC<{ phase: 'IDLE' | 'IN' | 'OUT' }> = ({ phase }) => {
  const [curtainsClosed, setCurtainsClosed] = useState(false);

  useEffect(() => {
    if (phase === 'IN') {
      setCurtainsClosed(false);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setCurtainsClosed(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    if (phase === 'OUT' || phase === 'IDLE') {
      setCurtainsClosed(false);
    }
  }, [phase]);

  if (phase === 'IDLE') return null;

  const isClosing = phase === 'IN';

  return (
    <div
      className={`fixed inset-0 z-[95] overflow-hidden flex items-center justify-center ${
        isClosing ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop dim as curtains draw shut */}
      <div
        className="absolute inset-0 bg-black/55 transition-opacity"
        style={{
          transitionDuration: isClosing ? '260ms' : '340ms',
          opacity: curtainsClosed ? 1 : 0,
        }}
      />
      {/* Left Crimson/Obsidian Curtain */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 border-r-2 border-amber-500/50 shadow-[14px_0_40px_rgba(0,0,0,0.98)] transition-transform"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 14px, transparent 14px, transparent 34px), linear-gradient(90deg, #070504 0%, #170808 65%, #2a0b0b 100%)',
          transitionDuration: isClosing ? '280ms' : '360ms',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          transform: curtainsClosed ? 'translateX(0%)' : 'translateX(-104%)',
        }}
      />
      {/* Right Crimson/Obsidian Curtain */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 border-l-2 border-amber-500/50 shadow-[-14px_0_40px_rgba(0,0,0,0.98)] transition-transform"
        style={{
          background:
            'repeating-linear-gradient(-90deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 14px, transparent 14px, transparent 34px), linear-gradient(270deg, #070504 0%, #170808 65%, #2a0b0b 100%)',
          transitionDuration: isClosing ? '280ms' : '360ms',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          transform: curtainsClosed ? 'translateX(0%)' : 'translateX(104%)',
        }}
      />
      {/* Center Occult Seal Flash (peaks once curtains meet) */}
      <div
        className="relative z-10 flex flex-col items-center justify-center transition-all"
        style={{
          transitionDuration: curtainsClosed ? '180ms' : '240ms',
          transitionDelay: curtainsClosed ? '140ms' : '0ms',
          opacity: curtainsClosed ? 1 : 0,
          transform: curtainsClosed ? 'scale(1)' : 'scale(0.82)',
        }}
      >
        <div className="w-16 h-16 rotate-45 border-2 border-amber-400/80 bg-[#120806]/95 shadow-[0_0_32px_rgba(220,38,38,0.8)] flex items-center justify-center">
          <span className="-rotate-45 font-['Cinzel',_serif] font-black text-amber-300 text-lg tracking-widest">
            ⚔
          </span>
        </div>
      </div>
    </div>
  );
};

export const SmokeTransitionOverlay: React.FC<{ phase: 'IDLE' | 'IN' | 'OUT' }> = ({ phase }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<HTMLCanvasElement[] | null>(null);

  useEffect(() => {
    if (phase === 'IDLE') return;

    if (!spritesRef.current) {
      spritesRef.current = createSmokeSprites();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sprites = spritesRef.current;
    let animId: number;
    const startTime = performance.now();
    const duration = phase === 'IN' ? 320 : 380;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, 1280, 720);

      if (phase === 'IN') {
        const baseDark = Math.max(0, Math.min(1, (rawProgress - 0.35) / 0.65));

        // Draw rolling volumetric smoke puffs across all sectors
        for (const pt of SMOKE_PUFFS) {
          const t = Math.min(1, rawProgress * pt.speedMult);
          const tEased = 1 - Math.pow(1 - t, 3);
          const cx = pt.startX + (pt.targetX - pt.startX) * tEased;
          const cy = pt.baseY + pt.driftY * tEased;
          const cr = pt.baseR * (0.7 + 0.45 * tEased);
          const ca = Math.min(pt.maxAlpha, t * 1.4 * pt.maxAlpha);

          if (ca <= 0.01) continue;
          ctx.globalAlpha = ca;
          const sprite = sprites[pt.spriteIdx];
          ctx.drawImage(sprite, cx - cr, cy - cr, cr * 2, cr * 2);
        }

        // Deep soot base wash guarantees total blackout at peak
        if (baseDark > 0) {
          ctx.fillStyle = '#080605';
          ctx.globalAlpha = baseDark;
          ctx.fillRect(0, 0, 1280, 720);
        }
      } else if (phase === 'OUT') {
        const p = rawProgress * rawProgress;
        // Base dark fades in lockstep with the puffs rather than dying early
        const baseDark = Math.max(0, 1 - rawProgress * 1.15);

        if (baseDark > 0) {
          ctx.fillStyle = '#080605';
          ctx.globalAlpha = baseDark;
          ctx.fillRect(0, 0, 1280, 720);
        }

        // All three sectors expand, lift upward, and evaporate in unison
        for (const pt of SMOKE_PUFFS) {
          const driftX = (pt.fromLeft ? -200 : 200) * p;
          const cx = pt.targetX + driftX;
          const cy = pt.baseY + pt.driftY - (p * 60);
          const cr = pt.baseR * 1.15 * (1 + 0.35 * p);
          const ca = Math.max(0, pt.maxAlpha * (1 - rawProgress));

          if (ca <= 0.01) continue;
          ctx.globalAlpha = ca;
          const sprite = sprites[pt.spriteIdx];
          ctx.drawImage(sprite, cx - cr, cy - cr, cr * 2, cr * 2);
        }
      }

      ctx.globalAlpha = 1;

      if (rawProgress < 1) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  if (phase === 'IDLE') return null;

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      className={`absolute inset-0 ${phase === 'IN' ? 'pointer-events-auto' : 'pointer-events-none'} select-none overflow-hidden`}
      style={{ zIndex: 999 }}
    />
  );
};
