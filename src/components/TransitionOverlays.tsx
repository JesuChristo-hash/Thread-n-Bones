import React, { useEffect, useRef, useState } from 'react';

export const TalismanEye: React.FC<{ isTalismanPricked: boolean }> = ({ isTalismanPricked }) => {
  const socketRef = useRef<SVGGElement>(null);
  const pupilGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!socketRef.current || !pupilGroupRef.current) return;
      const btn = socketRef.current.closest('button');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const radius = rect.width / 2;

      const dx = e.clientX - btnCenterX;
      const dy = e.clientY - btnCenterY;
      const dist = Math.hypot(dx, dy);

      // Only track while the cursor is inside the button boundary; center immediately when outside
      if (dist > radius || dist < 1) {
        pupilGroupRef.current.setAttribute('transform', 'translate(0, 0)');
        return;
      }

      const angle = Math.atan2(dy, dx);
      const maxOffset = 3.6; // SVG units (contained within socket r=8.5)
      const pull = Math.min(dist / (radius * 0.85), 1);
      const eased = Math.sin(pull * (Math.PI / 2));
      const ox = (Math.cos(angle) * eased * maxOffset).toFixed(2);
      const oy = (Math.sin(angle) * eased * maxOffset).toFixed(2);

      pupilGroupRef.current.setAttribute('transform', `translate(${ox}, ${oy})`);
    };

    const handleMouseLeave = () => {
      if (pupilGroupRef.current) {
        pupilGroupRef.current.setAttribute('transform', 'translate(0, 0)');
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <g ref={socketRef} className="pointer-events-none select-none">
      <defs>
        {/* Clips the pupil and iris cleanly behind the ocular socket rim */}
        <clipPath id="talismanEyeSocketClip">
          <circle cx="50" cy="50" r="8.2" />
        </clipPath>
      </defs>

      {/* Sclera Base / Well */}
      <circle
        cx="50"
        cy="50"
        r="8.5"
        fill={isTalismanPricked ? "#220507" : "#130c09"}
        stroke={isTalismanPricked ? "#7f1d1d" : "#2a1b14"}
        strokeWidth="1.2"
        className="transition-colors duration-200"
      />

      {/* Organic Capillaries in Sclera */}
      <path
        d="M 44.5 48.5 Q 46.5 49.5 48 49.8 M 55.5 51 Q 53.5 50.5 52 50.2 M 49.5 44 Q 50 46 50.2 47.5"
        stroke={isTalismanPricked ? "rgba(239, 68, 68, 0.7)" : "rgba(185, 28, 28, 0.35)"}
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Moving Ocular Group (Tracks Player Cursor) */}
      <g clipPath="url(#talismanEyeSocketClip)">
          <g ref={pupilGroupRef} className="transition-transform duration-150 ease-out">
          {/* Iris Ring */}
          <circle
            cx="50"
            cy="50"
            r={isTalismanPricked ? "6.2" : "5.4"}
            fill={isTalismanPricked ? "#dc2626" : "#45140e"}
            stroke={isTalismanPricked ? "#ef4444" : "#7f1d1d"}
            strokeWidth="0.8"
            className="transition-colors duration-200 group-hover:fill-[#991b1b] group-hover:stroke-[#ef4444]"
          />

          {/* Centermost Circle: The Living Pupil */}
          <circle
            cx="50"
            cy="50"
            r={isTalismanPricked ? "3.8" : "3.0"}
            fill={isTalismanPricked ? "#7f1d1d" : "#080403"}
            stroke={isTalismanPricked ? "#ef4444" : "#1a0805"}
            strokeWidth="0.6"
            className="transition-all duration-200 group-hover:fill-[#000000]"
          />

          {/* Wet Specular Catchlight Glints */}
          <circle
            cx="48.2"
            cy="48.2"
            r="0.9"
            fill="#ffffff"
            opacity={isTalismanPricked ? "0.95" : "0.85"}
          />
          <circle
            cx="51.8"
            cy="51.8"
            r="0.5"
            fill="#ffffff"
            opacity={isTalismanPricked ? "0.7" : "0.45"}
          />
        </g>
      </g>

      {/* Socket Bevel Rim */}
      <circle
        cx="50"
        cy="50"
        r="8.5"
        fill="none"
        stroke={isTalismanPricked ? "#ef4444" : "#38251b"}
        strokeWidth="0.9"
        className="transition-colors duration-200 group-hover:stroke-[#ef4444]"
        style={{
          filter: isTalismanPricked
            ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.9))'
            : undefined,
        }}
      />
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
          transitionDuration: isClosing ? '260ms' : '420ms',
          opacity: curtainsClosed ? 1 : 0,
        }}
      />
      {/* Left Crimson/Obsidian Curtain */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 border-r-2 border-amber-500/50 shadow-[14px_0_40px_rgba(0,0,0,0.98)] transition-transform"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 14px, transparent 14px, transparent 34px), linear-gradient(90deg, #070504 0%, #170808 65%, #2a0b0b 100%)',
          transitionDuration: isClosing ? '280ms' : '480ms',
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
          transitionDuration: isClosing ? '280ms' : '480ms',
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
    const duration = phase === 'IN' ? 550 : 600;

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
      className="absolute inset-0 pointer-events-auto select-none overflow-hidden"
      style={{ zIndex: 999 }}
    />
  );
};
