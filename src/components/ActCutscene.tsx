import React, { useCallback, useEffect, useRef, useState } from 'react';
import ActWeather from './ActWeather';

interface ActCutsceneProps {
  act: number;
  onDone: () => void;
}

const TOTAL_MS = 6400;
const FADE_MS = 700;
const ARM_MS = 600;
const GROUND = '#040306';

interface ActCopy {
  numeral: string;
  title: string;
  sub: string;
  accent: string;
  rule: string;
  glow: string;
  bg: string;
}

// Titles mirror ACT_THEMES in src/data/mapGenerator.ts.
const ACT_COPY: Record<number, ActCopy> = {
  1: {
    numeral: 'I',
    title: 'The Veiled Approach',
    sub: 'Mist Cloaked Cemetery',
    accent: '#e4ddcb',
    rule: 'rgba(214,206,186,0.65)',
    glow: 'rgba(110,106,98,0.4)',
    bg: 'radial-gradient(ellipse 90% 70% at 50% 30%, #1c1b20 0%, #0b0a0d 62%, #030204 100%)',
  },
  2: {
    numeral: 'II',
    title: 'The Weeping Ossuary',
    sub: 'Sodden Scrap Heap',
    accent: '#bcd0e0',
    rule: 'rgba(150,176,200,0.6)',
    glow: 'rgba(40,62,84,0.45)',
    bg: 'radial-gradient(ellipse 90% 70% at 50% 25%, #141c24 0%, #070b0f 62%, #020304 100%)',
  },
  3: {
    numeral: 'III',
    title: 'The Storm-Wracked Chapel',
    sub: 'City of the Dead',
    accent: '#cdd8f2',
    rule: 'rgba(140,164,226,0.65)',
    glow: 'rgba(36,48,92,0.5)',
    bg: 'radial-gradient(ellipse 90% 70% at 50% 25%, #121624 0%, #06070d 62%, #020205 100%)',
  },
  4: {
    numeral: 'IV',
    title: 'The End of the World',
    sub: 'Uzumaki',
    accent: '#ffd9b0',
    rule: 'rgba(239,98,40,0.75)',
    glow: 'rgba(153,27,27,0.5)',
    bg: 'radial-gradient(ellipse 100% 80% at 50% 100%, #5a1008 0%, #1d0504 48%, #050202 100%)',
  },
};

// ---------- Act 1: cemetery ----------
const STONES = Array.from({ length: 17 }, (_, i) => ({
  x: 30 + i * 94 + ((i * 37) % 28),
  w: 34 + ((i * 13) % 22),
  h: 44 + ((i * 29) % 54),
  lean: ((i * 17) % 9) - 4,
  cross: i % 5 === 2,
}));

const CemeteryScene: React.FC = () => (
  <svg className="absolute bottom-0 left-0 w-full h-[58%]" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path
      d="M1296 380 C1290 300 1300 250 1284 186 M1292 290 C1324 258 1346 246 1370 204 M1286 236 C1250 214 1236 192 1218 148 M1300 330 C1330 310 1352 304 1380 280"
      stroke={GROUND}
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />
    {STONES.map((s, i) => (
      <g key={i} transform={'rotate(' + s.lean + ' ' + (s.x + s.w / 2) + ' 380)'}>
        {s.cross ? (
          <>
            <rect x={s.x + s.w / 2 - 5} y={380 - s.h - 14} width="10" height={s.h + 14} fill={GROUND} />
            <rect x={s.x + s.w / 2 - 20} y={380 - s.h + 6} width="40" height="9" fill={GROUND} />
          </>
        ) : (
          <rect x={s.x} y={380 - s.h} width={s.w} height={s.h + 4} rx={s.w / 2.4} fill={GROUND} />
        )}
      </g>
    ))}
    <rect x="0" y="372" width="1600" height="48" fill={GROUND} />
  </svg>
);

// ---------- Act 2: ossuary heap ----------
const SKULLS: [number, number][] = [
  [150, 318], [330, 292], [470, 306], [640, 276], [800, 290], [980, 268],
  [1120, 288], [1290, 300], [1440, 318], [560, 300], [880, 286], [220, 336],
];
const BONES: [number, number, number, number][] = [
  [100, 330, 260, 308], [380, 300, 520, 326], [700, 292, 860, 270],
  [1040, 300, 1200, 276], [1330, 326, 1500, 298], [600, 322, 760, 304],
];

const OssuaryScene: React.FC = () => (
  <svg className="absolute bottom-0 left-0 w-full h-[58%]" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path
      d="M0 420 L0 336 C180 310 300 268 500 292 C690 314 780 236 960 262 C1150 288 1290 296 1600 326 L1600 420 Z"
      fill={GROUND}
    />
    {BONES.map((b, i) => (
      <line key={'b' + i} x1={b[0]} y1={b[1]} x2={b[2]} y2={b[3]} stroke="#1a1715" strokeWidth="9" strokeLinecap="round" />
    ))}
    {SKULLS.map((s, i) => (
      <g key={'s' + i}>
        <circle cx={s[0]} cy={s[1]} r="21" fill="#1d1a18" />
        <rect x={s[0] - 12} y={s[1] + 10} width="24" height="14" rx="4" fill="#1d1a18" />
        <circle cx={s[0] - 8} cy={s[1] - 1} r="5" fill={GROUND} />
        <circle cx={s[0] + 8} cy={s[1] - 1} r="5" fill={GROUND} />
      </g>
    ))}
    <rect x="0" y="398" width="1600" height="22" fill={GROUND} />
  </svg>
);

// ---------- Act 3: storm-wracked chapel ----------
const lancet = (cx: number, base: number, w: number, h: number) =>
  'M' + (cx - w / 2) + ' ' + base +
  ' V' + (base - h * 0.62) +
  ' Q' + (cx - w / 2) + ' ' + (base - h * 0.92) + ' ' + cx + ' ' + (base - h) +
  ' Q' + (cx + w / 2) + ' ' + (base - h * 0.92) + ' ' + (cx + w / 2) + ' ' + (base - h * 0.62) +
  ' V' + base + ' Z';

const CHAPEL_WINDOWS = [lancet(650, 350, 34, 96), lancet(800, 350, 40, 120), lancet(950, 350, 34, 96), lancet(800, 200, 26, 66)];

const ChapelScene: React.FC = () => (
  <svg className="absolute bottom-0 left-0 w-full h-[62%]" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <rect x="520" y="262" width="40" height="118" fill={GROUND} />
    <rect x="1040" y="262" width="40" height="118" fill={GROUND} />
    <rect x="560" y="236" width="480" height="144" fill={GROUND} />
    <polygon points="540,240 800,150 1060,240" fill={GROUND} />
    <rect x="752" y="96" width="96" height="154" fill={GROUND} />
    <polygon points="744,100 800,0 856,100" fill={GROUND} />
    {CHAPEL_WINDOWS.map((d, i) => (
      <g key={i} className="act-cut-window" style={{ animationDelay: (i * 0.7) + 's' }}>
        <path d={d} fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="10" />
        <path d={d} fill="#f2a53a" />
      </g>
    ))}
    <rect x="0" y="372" width="1600" height="48" fill={GROUND} />
  </svg>
);

// ---------- Act 4: Uzumaki ----------
const SPIRAL = (() => {
  const steps = 220;
  const turns = 4.2;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = 3 + (i / steps) * 46;
    d += (i === 0 ? 'M' : ' L') + (50 + Math.cos(t) * r).toFixed(2) + ' ' + (50 + Math.sin(t) * r).toFixed(2);
  }
  return d;
})();

const RIDGE = (() => {
  let d = 'M0 420 L0 350';
  for (let i = 1; i <= 16; i++) {
    d += ' L' + i * 100 + ' ' + (338 + ((i * 53) % 7) * 11);
  }
  return d + ' L1600 420 Z';
})();

const UzumakiScene: React.FC = () => (
  <>
    <div
      className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2"
      style={{ width: '96vmax', height: '96vmax', animation: 'actCutSpin 90s linear infinite' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
        <path d={SPIRAL} fill="none" stroke="rgba(239,68,68,0.16)" strokeWidth="2.4" />
        <path d={SPIRAL} fill="none" stroke="rgba(251,146,60,0.55)" strokeWidth="0.5" />
      </svg>
    </div>
    <div
      className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: '20vmin',
        height: '20vmin',
        background: 'radial-gradient(circle closest-side, #000 0%, #000 52%, rgba(239,68,68,0.38) 80%, transparent 100%)',
      }}
    />
    <svg className="absolute bottom-0 left-0 w-full h-[34%]" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d={RIDGE} fill={GROUND} />
    </svg>
  </>
);

const Scene: React.FC<{ act: number }> = ({ act }) => {
  if (act === 1) return <CemeteryScene />;
  if (act === 2) return <OssuaryScene />;
  if (act === 3) return <ChapelScene />;
  return <UzumakiScene />;
};

export const ActCutscene: React.FC<ActCutsceneProps> = ({ act, onDone }) => {
  const a = Math.min(4, Math.max(1, act));
  const copy = ACT_COPY[a];
  const [leaving, setLeaving] = useState(false);
  const armedRef = useRef(false);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const timers = useRef<number[]>([]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    timers.current.push(window.setTimeout(() => onDoneRef.current(), FADE_MS));
  }, []);

  useEffect(() => {
    timers.current.push(window.setTimeout(() => { armedRef.current = true; }, ARM_MS));
    timers.current.push(window.setTimeout(finish, TOTAL_MS));
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (armedRef.current) finish();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      window.removeEventListener('keydown', onKey, true);
    };
  }, [finish]);

  return (
    <div
      onClick={() => { if (armedRef.current) finish(); }}
      className="act-cut fixed inset-0 z-[130] overflow-hidden select-none cursor-pointer pointer-events-auto"
      style={{ background: '#020103', opacity: leaving ? 0 : 1, transition: 'opacity ' + FADE_MS + 'ms ease-in' }}
    >
      <div className="absolute inset-0" style={{ background: copy.bg, animation: 'actCutIn 1.4s ease-out both' }} />

      <div className="absolute inset-0" style={{ animation: 'actCutPush 8s ease-out both' }}>
        {a === 1 && (
          <div
            className="absolute"
            style={{ left: '66%', top: '12%', width: '15vmin', height: '15vmin', animation: 'actCutMoon 3.2s ease-out 0.4s both' }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              <path d="M50 4 A46 46 0 1 0 96 50 A36 36 0 1 1 50 4 Z" fill="#b91c1c" />
            </svg>
          </div>
        )}
        <Scene act={a} />
      </div>

      <ActWeather act={a} posClass="absolute inset-0" keyPrefix="cutscene" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)' }}
      />

      <div className="absolute inset-x-0 top-[26%]">
        <div
          className="edge-band edge-band--full relative w-full py-6 sm:py-8 px-4 text-center"
          style={{
            ['--band-rule' as any]: copy.rule,
            ['--band-bg' as any]: 'rgba(0,0,0,0.58)',
            ['--band-glow' as any]: copy.glow,
            animation: 'actCutIn 1s ease-out 0.9s both',
          }}
        >
          <div
            className="act-cut-rise flex items-center justify-center gap-3"
            style={{ ['--d' as any]: '1.3s' }}
          >
            <span className="h-px w-12 sm:w-24" style={{ background: 'linear-gradient(to right, transparent, ' + copy.rule + ')' }} />
            <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em]" style={{ color: copy.accent }}>
              Act {copy.numeral}
            </span>
            <span className="h-px w-12 sm:w-24" style={{ background: 'linear-gradient(to left, transparent, ' + copy.rule + ')' }} />
          </div>
          <div
            className="act-cut-rise mt-2 font-['Cinzel',_serif] font-black uppercase leading-tight"
            style={{
              ['--d' as any]: '1.9s',
              fontSize: 'clamp(1.25rem, 4.6vw, 3.4rem)',
              letterSpacing: '0.16em',
              color: copy.accent,
              textShadow: '0 2px 22px ' + copy.rule + ', 0 2px 6px rgba(0,0,0,1)',
            }}
          >
            {copy.title}
          </div>
          <div
            className="act-cut-rise mt-2 font-['Cinzel',_serif] italic text-xs sm:text-base tracking-[0.12em]"
            style={{ ['--d' as any]: '2.7s', color: copy.accent, opacity: 0.82 }}
          >
            {copy.sub}
          </div>
        </div>
      </div>

      <div
        className="act-cut-rise absolute bottom-5 inset-x-0 text-center text-[9px] font-mono uppercase tracking-[0.28em] text-[#9b8265]/70"
        style={{ ['--d' as any]: '1.6s' }}
      >
        Click or press Space to skip
      </div>
    </div>
  );
};

export default ActCutscene;
