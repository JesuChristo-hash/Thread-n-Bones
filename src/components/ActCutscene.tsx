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
  horizonGlow: string;
}

// Titles mirror ACT_THEMES in src/data/mapGenerator.ts.
const ACT_COPY: Record<number, ActCopy> = {
  1: {
    numeral: 'I',
    title: 'The Veiled Approach',
    sub: 'Mist Cloaked Cemetery',
    accent: '#e8dfc9',
    rule: 'rgba(218,205,176,0.72)',
    glow: 'rgba(130,118,98,0.42)',
    bg: 'radial-gradient(ellipse 95% 75% at 50% 28%, #211f28 0%, #0d0c11 58%, #030205 100%)',
    horizonGlow: 'radial-gradient(ellipse 72% 42% at 50% 82%, rgba(168,158,142,0.16) 0%, transparent 72%)',
  },
  2: {
    numeral: 'II',
    title: 'The Weeping Ossuary',
    sub: 'Sodden Scrap Heap',
    accent: '#c9dce9',
    rule: 'rgba(148,178,204,0.68)',
    glow: 'rgba(46,74,100,0.48)',
    bg: 'radial-gradient(ellipse 95% 75% at 50% 24%, #18232e 0%, #090e14 60%, #020305 100%)',
    horizonGlow: 'radial-gradient(ellipse 76% 40% at 50% 84%, rgba(112,146,174,0.16) 0%, transparent 74%)',
  },
  3: {
    numeral: 'III',
    title: 'The Storm-Wracked Chapel',
    sub: 'City of the Dead',
    accent: '#d5e0fa',
    rule: 'rgba(148,172,235,0.72)',
    glow: 'rgba(42,58,112,0.52)',
    bg: 'radial-gradient(ellipse 95% 75% at 50% 24%, #161c30 0%, #080a14 60%, #020206 100%)',
    horizonGlow: 'radial-gradient(ellipse 75% 42% at 50% 84%, rgba(100,126,196,0.18) 0%, transparent 74%)',
  },
  4: {
    numeral: 'IV',
    title: 'The End of the World',
    sub: 'Uzumaki',
    accent: '#ffe0bc',
    rule: 'rgba(242,108,46,0.82)',
    glow: 'rgba(168,30,24,0.58)',
    bg: 'radial-gradient(ellipse 100% 82% at 50% 92%, #68130a 0%, #240605 46%, #050203 100%)',
    horizonGlow: 'radial-gradient(ellipse 82% 44% at 50% 88%, rgba(239,68,68,0.28) 0%, transparent 74%)',
  },
};

type ViewportMode = 'desktop' | 'mobile-landscape' | 'mobile-portrait';

function detectViewportMode(): ViewportMode {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const isMobile = w <= 960 || h <= 540 || isCoarse;
  if (!isMobile) return 'desktop';
  return h > w ? 'mobile-portrait' : 'mobile-landscape';
}

// ---------- Shared SVG Helpers ----------
const lancet = (cx: number, base: number, w: number, h: number) =>
  `M${cx - w / 2} ${base} V${base - h * 0.62} Q${cx - w / 2} ${base - h * 0.92} ${cx} ${base - h} Q${cx + w / 2} ${base - h * 0.92} ${cx + w / 2} ${base - h * 0.62} V${base} Z`;

const buildSpiralPath = (turns: number, startR: number, maxR: number, steps = 220, phase = 0) => {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const t = phase + u * turns * Math.PI * 2;
    const r = startR + u * (maxR - startR);
    d += `${i === 0 ? 'M' : ' L'}${(50 + Math.cos(t) * r).toFixed(2)} ${(50 + Math.sin(t) * r).toFixed(2)}`;
  }
  return d;
};

const SPIRAL_PRIMARY = buildSpiralPath(7.2, 3.2, 49.5, 340, 0);
const SPIRAL_SECONDARY = buildSpiralPath(6.8, 4.6, 49.2, 300, Math.PI);

// Sculpted gothic skull glyph (cranium + zygomatic arch + mandible + hollows)
const SculptedSkull: React.FC<{ cx: number; cy: number; scale?: number; rot?: number; tone?: string; rim?: string }> = ({
  cx,
  cy,
  scale = 1,
  rot = 0,
  tone = '#1b1a1d',
  rim = 'rgba(182,202,220,0.16)',
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${scale})`}>
    <path
      d="M-20 -4 C-22 -22 -12 -30 0 -30 C12 -30 22 -22 20 -4 C19 4 14 7 13 13 L11 22 L-11 22 L-13 13 C-14 7 -19 4 -20 -4 Z"
      fill={tone}
      stroke={rim}
      strokeWidth="1.2"
    />
    {/* Eye sockets */}
    <ellipse cx="-7.5" cy="-4" rx="5.5" ry="6.2" fill={GROUND} />
    <ellipse cx="7.5" cy="-4" rx="5.5" ry="6.2" fill={GROUND} />
    {/* Nasal hollow */}
    <path d="M0 2 L-3 9 L3 9 Z" fill={GROUND} />
    {/* Teeth ridges */}
    <path d="M-7 16 V22 M-2.5 16 V22 M2.5 16 V22 M7 16 V22" stroke={GROUND} strokeWidth="1.8" />
  </g>
);

// ============================================================================
// DESKTOP SCENES (Rich Multi-Layered Gothic Silhouettes, 1600×520)
// ============================================================================
const DESKTOP_STONES = [
  { x: 64, w: 36, h: 68, lean: -4, kind: 'arch' as const },
  { x: 148, w: 30, h: 92, lean: 2, kind: 'cross' as const },
  { x: 232, w: 42, h: 78, lean: -2, kind: 'gothic' as const },
  { x: 332, w: 32, h: 58, lean: 4, kind: 'arch' as const },
  { x: 420, w: 28, h: 108, lean: -1, kind: 'obelisk' as const },
  { x: 510, w: 40, h: 74, lean: 3, kind: 'gothic' as const },
  { x: 618, w: 34, h: 86, lean: -3, kind: 'cross' as const },
  { x: 938, w: 36, h: 84, lean: 2, kind: 'cross' as const },
  { x: 1034, w: 44, h: 72, lean: -2, kind: 'gothic' as const },
  { x: 1138, w: 32, h: 98, lean: 3, kind: 'obelisk' as const },
  { x: 1228, w: 36, h: 64, lean: -4, kind: 'arch' as const },
  { x: 1444, w: 38, h: 80, lean: 3, kind: 'gothic' as const },
  { x: 1524, w: 30, h: 62, lean: -2, kind: 'arch' as const },
];

const DesktopCemeteryScene: React.FC = () => (
  <>
    {/* Blood Crescent Moon with Atmospheric Halo */}
    <div
      className="absolute act-cut-gpu"
      style={{ right: '15%', top: '3.5%', width: '13.5vmin', height: '13.5vmin', animation: 'actCutMoon 3s ease-out 0.3s both' }}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="cut-moon-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#991b1b" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#cut-moon-halo)" />
        <path d="M58 14 A42 42 0 1 0 100 62 A33 33 0 1 1 58 14 Z" fill="#b91c1c" />
        <path d="M58 14 A42 42 0 1 0 100 62 A34.5 34.5 0 1 1 58 14 Z" fill="#ef4444" opacity="0.45" />
      </svg>
    </div>

    <svg className="absolute bottom-0 left-0 w-full h-[64%] act-cut-gpu" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {/* Far misty ridge + distant cypresses */}
      <path d="M0 520 L0 390 Q260 330 560 364 T1140 348 Q1380 326 1600 374 L1600 520 Z" fill="#0d0c12" />
      <path d="M180 360 L194 275 L208 360 Z M214 364 L224 300 L234 364 Z M1050 356 L1065 268 L1080 356 Z M1090 358 L1102 292 L1114 358 Z" fill="#0d0c12" />

      {/* Midground wrought-iron cemetery fence + arched entry gate */}
      <g stroke="#121017" strokeWidth="3.5" fill="none">
        <line x1="0" y1="412" x2="720" y2="412" />
        <line x1="880" y1="412" x2="1600" y2="412" />
        <line x1="0" y1="452" x2="720" y2="452" />
        <line x1="880" y1="452" x2="1600" y2="452" />
        {Array.from({ length: 34 }, (_, i) => {
          const x = i * 48 + 18;
          if (x > 710 && x < 890) return null;
          return <path key={i} d={`M${x} 480 V394 L${x - 4} 402 M${x} 394 L${x + 4} 402`} />;
        })}
        {/* Arched Iron Gate */}
        <path d="M724 480 V350 Q800 288 876 350 V480" stroke="#0b090e" strokeWidth="8" />
        <path d="M736 480 V358 Q800 306 864 358 V480" stroke="#181520" strokeWidth="3" />
        <path d="M800 296 V268 M788 280 H812" stroke="#121017" strokeWidth="4.5" />
      </g>
      {/* Stone Gate Pillars */}
      <rect x="706" y="346" width="24" height="140" fill="#08070b" />
      <polygon points="700,346 718,326 736,346" fill="#08070b" />
      <rect x="870" y="346" width="24" height="140" fill="#08070b" />
      <polygon points="864,346 882,326 900,346" fill="#08070b" />

      {/* Gnarled Dead Oak Tree (right midground) */}
      <g fill="none" stroke={GROUND} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1320 480 C1312 396 1326 322 1304 236 C1296 200 1280 174 1262 146" strokeWidth="18" />
        <path d="M1314 338 C1356 296 1384 268 1420 220 M1378 274 C1408 264 1432 256 1456 238" strokeWidth="10" />
        <path d="M1308 276 C1268 242 1244 214 1210 178 M1256 226 C1228 220 1204 218 1182 204" strokeWidth="8" />
        <path d="M1302 222 C1336 184 1356 164 1384 130 M1344 176 C1368 172 1392 162 1412 146" strokeWidth="6" />
        <path d="M1284 182 C1268 148 1252 126 1236 100 M1270 156 C1288 134 1296 116 1306 94" strokeWidth="4.5" />
      </g>

      {/* Foreground Headstones, Crosses & Obelisks */}
      {DESKTOP_STONES.map((s, i) => (
        <g key={i} transform={`rotate(${s.lean} ${s.x + s.w / 2} 476)`}>
          {s.kind === 'cross' && (
            <>
              <rect x={s.x + s.w / 2 - 5} y={476 - s.h - 14} width="10" height={s.h + 18} fill={GROUND} />
              <rect x={s.x + s.w / 2 - 22} y={476 - s.h + 8} width="44" height="9" fill={GROUND} />
              <circle cx={s.x + s.w / 2} cy={476 - s.h + 12} r="10" fill="none" stroke={GROUND} strokeWidth="4" />
            </>
          )}
          {s.kind === 'obelisk' && (
            <polygon
              points={`${s.x + 2},480 ${s.x + 6},${476 - s.h + 16} ${s.x + s.w / 2},${476 - s.h} ${s.x + s.w - 6},${476 - s.h + 16} ${s.x + s.w - 2},480`}
              fill={GROUND}
            />
          )}
          {s.kind === 'gothic' && (
            <path d={lancet(s.x + s.w / 2, 480, s.w, s.h)} fill={GROUND} />
          )}
          {s.kind === 'arch' && (
            <rect x={s.x} y={476 - s.h} width={s.w} height={s.h + 8} rx={s.w / 2.2} fill={GROUND} />
          )}
        </g>
      ))}
      <path d="M0 474 Q420 456 800 472 T1600 468 L1600 520 L0 520 Z" fill={GROUND} />
    </svg>
  </>
);

const DESKTOP_SKULLS: [number, number, number, number][] = [
  [148, 396, 1.05, -10],
  [272, 378, 0.92, 8],
  [412, 368, 1.12, -6],
  [546, 352, 0.98, 12],
  [668, 336, 1.18, -4],
  [796, 326, 1.28, 3],
  [922, 338, 1.14, -9],
  [1054, 354, 1.0, 11],
  [1186, 372, 1.08, -7],
  [1326, 386, 0.96, 9],
  [1454, 404, 1.04, -12],
  [736, 372, 0.95, 16],
  [864, 370, 0.94, -14],
];

const DesktopOssuaryScene: React.FC = () => (
  <svg className="absolute bottom-0 left-0 w-full h-[66%] act-cut-gpu" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    {/* Distant towering scrap & bone ridges */}
    <path d="M0 520 L0 398 Q220 342 460 364 Q710 278 820 264 Q980 286 1220 352 Q1420 330 1600 388 L1600 520 Z" fill="#10151c" />
    {/* Monumental arching ribcage monoliths */}
    <g fill="none" stroke="#18202a" strokeWidth="13" strokeLinecap="round">
      <path d="M510 380 C474 282 518 202 628 168" />
      <path d="M578 366 C552 276 592 206 690 176" />
      <path d="M1090 380 C1126 282 1082 202 972 168" />
      <path d="M1022 366 C1048 276 1008 206 910 176" />
    </g>
    {/* Jagged rusted scrap stakes jutting from mound */}
    <g stroke="#1b222c" strokeWidth="6" strokeLinecap="round">
      <line x1="318" y1="386" x2="294" y2="274" />
      <line x1="1266" y1="382" x2="1298" y2="268" />
      <line x1="620" y1="340" x2="588" y2="254" />
      <line x1="974" y1="340" x2="1008" y2="250" />
    </g>
    {/* Foreground sodden ossuary mound */}
    <path d="M0 520 L0 416 C200 384 340 348 540 356 C710 364 760 296 810 296 C880 296 960 354 1140 362 C1320 370 1450 386 1600 412 L1600 520 Z" fill={GROUND} />
    {/* Protruding femurs */}
    <g stroke="#22252b" strokeWidth="9" strokeLinecap="round">
      <line x1="194" y1="420" x2="348" y2="392" />
      <line x1="464" y1="398" x2="612" y2="372" />
      <line x1="980" y1="376" x2="1130" y2="404" />
      <line x1="1244" y1="400" x2="1406" y2="424" />
    </g>
    {/* Sculpted Skulls */}
    {DESKTOP_SKULLS.map(([cx, cy, sc, rot], i) => (
      <SculptedSkull key={i} cx={cx} cy={cy} scale={sc} rot={rot} />
    ))}
    <rect x="0" y="486" width="1600" height="34" fill={GROUND} />
  </svg>
);

const DesktopChapelScene: React.FC = () => {
  const windows = [
    lancet(642, 434, 34, 108),
    lancet(800, 434, 44, 134),
    lancet(958, 434, 34, 108),
    lancet(800, 266, 26, 72),
  ];
  return (
    <>
      {/* Subtle storm lightning sheet behind cathedral */}
      <div
        className="absolute inset-0 pointer-events-none act-cut-lightning"
        style={{
          background: 'radial-gradient(ellipse 56% 52% at 50% 42%, rgba(196,216,255,0.42) 0%, rgba(110,140,210,0.12) 48%, transparent 74%)',
        }}
      />
      <svg className="absolute bottom-0 left-0 w-full h-[68%] act-cut-gpu" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        {/* Distant City of the Dead skyline */}
        <path
          d="M0 520 V420 L48 420 V360 L74 334 L100 360 V414 L156 414 V348 L194 348 V408 L266 408 V330 L284 282 L302 330 V404 L392 404 V372 L456 372 V420 H1144 V372 L1208 372 V404 L1298 404 V328 L1316 280 L1334 328 V408 L1404 408 V348 L1446 348 V414 L1504 414 V358 L1530 332 L1556 358 V420 L1600 420 V520 Z"
          fill="#0c0f1b"
        />
        {/* Flying buttresses & side pinnacles */}
        <path d="M466 476 L466 364 L498 334 L530 364 V476 Z" fill={GROUND} />
        <path d="M1070 476 V364 L1102 334 L1134 364 V476 Z" fill={GROUND} />
        <path d="M498 378 Q536 336 566 322 L566 344 Q538 358 512 396 Z" fill={GROUND} />
        <path d="M1102 378 Q1064 336 1034 322 L1034 344 Q1062 358 1088 396 Z" fill={GROUND} />
        {/* Side Turrets */}
        <rect x="520" y="308" width="44" height="168" fill={GROUND} />
        <polygon points="514,310 542,238 570,310" fill={GROUND} />
        <rect x="1036" y="308" width="44" height="168" fill={GROUND} />
        <polygon points="1030,310 1058,238 1086,310" fill={GROUND} />
        {/* Nave & Pitched Roof */}
        <rect x="562" y="292" width="476" height="184" fill={GROUND} />
        <polygon points="538,296 800,202 1062,296" fill={GROUND} />
        {/* Central Belfry & Needle Spire */}
        <rect x="748" y="146" width="104" height="164" fill={GROUND} />
        <polygon points="738,150 800,26 862,150" fill={GROUND} />
        {/* Iron Spire Cross */}
        <path d="M800 28 V4 M790 14 H810" stroke="#1c2238" strokeWidth="3.5" strokeLinecap="round" />
        {/* Rose Window */}
        <g className="act-cut-window" style={{ animationDelay: '0.35s' }}>
          <circle cx="800" cy="306" r="24" fill="rgba(245,158,11,0.28)" />
          <circle cx="800" cy="306" r="17" fill="#f5b145" />
          <g stroke={GROUND} strokeWidth="2.4">
            <circle cx="800" cy="306" r="17" fill="none" />
            <line x1="800" y1="289" x2="800" y2="323" />
            <line x1="783" y1="306" x2="817" y2="306" />
            <line x1="788" y1="294" x2="812" y2="318" />
            <line x1="812" y1="294" x2="788" y2="318" />
          </g>
        </g>
        {/* Flickering Amber Lancet Windows with Stone Mullions */}
        {windows.map((d, i) => (
          <g key={i} className="act-cut-window" style={{ animationDelay: `${i * 0.65}s` }}>
            <path d={d} fill="none" stroke="rgba(245,158,11,0.34)" strokeWidth="10" />
            <path d={d} fill="#f2a83b" />
          </g>
        ))}
        {/* Mullion bars */}
        <g stroke={GROUND} strokeWidth="2.2">
          <line x1="642" y1="330" x2="642" y2="434" />
          <line x1="800" y1="304" x2="800" y2="434" />
          <line x1="958" y1="330" x2="958" y2="434" />
        </g>
        <rect x="0" y="472" width="1600" height="48" fill={GROUND} />
      </svg>
    </>
  );
};

const DESKTOP_RIDGE =
  'M0 520 L0 412 L96 392 L182 426 L284 366 L378 410 L488 378 L592 428 L698 388 L800 418 L904 378 L1012 424 L1120 374 L1224 414 L1328 362 L1436 418 L1528 386 L1600 410 L1600 520 Z';

const DesktopUzumakiScene: React.FC = () => (
  <>
    {/* Full-Horizon GPU-Isolated Uzumaki Vortex */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none act-cut-gpu">
      <div
        className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 act-cut-gpu"
        style={{ width: '136vmax', height: '136vmax' }}
      >
        <div className="w-full h-full act-cut-gpu" style={{ animation: 'actCutSpin 84s linear infinite', willChange: 'transform' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
            <path d={SPIRAL_PRIMARY} fill="none" stroke="rgba(220,38,38,0.22)" strokeWidth="1.7" strokeLinecap="round" />
            <path d={SPIRAL_PRIMARY} fill="none" stroke="rgba(251,146,60,0.62)" strokeWidth="0.4" strokeLinecap="round" />
            <path d={SPIRAL_SECONDARY} fill="none" stroke="rgba(185,28,28,0.34)" strokeWidth="0.95" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
    {/* Obsidian Eclipse Core */}
    <div
      className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full act-cut-gpu"
      style={{
        width: '21vmin',
        height: '21vmin',
        background:
          'radial-gradient(circle closest-side, #000 0%, #000 50%, rgba(220,38,38,0.56) 74%, rgba(251,146,60,0.26) 86%, transparent 100%)',
      }}
    />
    {/* Volcanic Crags Silhouette */}
    <svg className="absolute bottom-0 left-0 w-full h-[38%] act-cut-gpu" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d={DESKTOP_RIDGE} fill={GROUND} />
      {/* Glowing ember fissures */}
      <path
        d="M284 366 L302 428 L294 468 M904 378 L888 438 L900 478 M1328 362 L1312 424"
        fill="none"
        stroke="rgba(249,115,22,0.42)"
        strokeWidth="2.5"
        className="act-cut-ember-pulse"
      />
    </svg>
  </>
);

// ============================================================================
// DEDICATED MOBILE SCENES (Tear-Free, Complete Framing, Portrait + Landscape)
// ============================================================================
const MobileCemeteryScene: React.FC<{ portrait: boolean }> = ({ portrait }) =>
  portrait ? (
    <svg className="absolute inset-0 w-full h-full act-cut-gpu" viewBox="0 0 420 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <radialGradient id="mob-moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.46" />
          <stop offset="60%" stopColor="#991b1b" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Blood Crescent Moon — shining cleanly below title band above the gnarled tree */}
      <circle cx="316" cy="340" r="64" fill="url(#mob-moon-glow)" />
      <path d="M314 300 A36 36 0 1 0 350 340 A28 28 0 1 1 314 300 Z" fill="#b91c1c" />
      <path d="M314 300 A36 36 0 1 0 350 340 A29.5 29.5 0 1 1 314 300 Z" fill="#ef4444" opacity="0.45" />
      {/* Far hill */}
      <path d="M0 760 V612 Q120 562 248 592 T420 578 V760 Z" fill="#0d0c13" />
      {/* Gnarled Dead Tree — 100% framed on right */}
      <g fill="none" stroke={GROUND} strokeLinecap="round">
        <path d="M342 710 C334 624 348 552 328 472 C320 440 306 416 290 392" strokeWidth="14" />
        <path d="M338 566 C366 534 384 510 404 474" strokeWidth="7.5" />
        <path d="M332 512 C298 486 278 462 252 436" strokeWidth="6.5" />
        <path d="M326 462 C352 434 368 416 388 390" strokeWidth="5" />
      </g>
      {/* Arched Cemetery Gate + Wrought Fence */}
      <g stroke="#14121b" strokeWidth="3" fill="none">
        <line x1="0" y1="646" x2="152" y2="646" />
        <line x1="268" y1="646" x2="420" y2="646" />
        {[24, 54, 84, 114, 144, 276, 306, 336, 366, 396].map((x) => (
          <path key={x} d={`M${x} 714 V630 L${x - 3} 637 M${x} 630 L${x + 3} 637`} />
        ))}
        <path d="M156 714 V604 Q210 554 264 604 V714" stroke="#0a090e" strokeWidth="6.5" />
        <path d="M210 558 V534 M200 544 H220" stroke="#16131f" strokeWidth="3.5" />
      </g>
      <rect x="142" y="600" width="18" height="114" fill="#08070b" />
      <rect x="260" y="600" width="18" height="114" fill="#08070b" />
      {/* Foreground Headstones & Crosses */}
      <path d={lancet(56, 720, 34, 72)} fill={GROUND} />
      <g transform="rotate(-3 112 720)">
        <rect x="108" y="624" width="8" height="96" fill={GROUND} />
        <rect x="93" y="644" width="38" height="8" fill={GROUND} />
      </g>
      <rect x="274" y="654" width="32" height="66" rx="15" fill={GROUND} />
      <path d={lancet(376, 720, 32, 66)} fill={GROUND} />
      <path d="M0 704 Q210 688 420 702 V760 H0 Z" fill={GROUND} />
    </svg>
  ) : (
    <svg className="absolute inset-0 w-full h-full act-cut-gpu" viewBox="0 0 840 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <radialGradient id="mob-l-moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.44" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Blood Crescent Moon — clear below the compact top banner */}
      <circle cx="622" cy="186" r="46" fill="url(#mob-l-moon-glow)" />
      <path d="M620 158 A25 25 0 1 0 645 186 A19.5 19.5 0 1 1 620 158 Z" fill="#b91c1c" />
      <path d="M620 158 A25 25 0 1 0 645 186 A20.5 20.5 0 1 1 620 158 Z" fill="#ef4444" opacity="0.42" />
      {/* Far hill */}
      <path d="M0 380 V300 Q210 264 420 284 T840 274 V380 Z" fill="#0d0c13" />
      {/* Gnarled Tree on right */}
      <g fill="none" stroke={GROUND} strokeLinecap="round">
        <path d="M722 352 C716 300 724 258 708 210 C702 192 692 178 680 162" strokeWidth="11" />
        <path d="M716 266 C742 246 758 232 776 208" strokeWidth="6" />
        <path d="M712 232 C688 214 672 200 652 184" strokeWidth="5.5" />
      </g>
      {/* Arched Gate + Wrought Fence */}
      <g stroke="#14121b" strokeWidth="2.4" fill="none">
        <line x1="0" y1="312" x2="366" y2="312" />
        <line x1="474" y1="312" x2="840" y2="312" />
        {Array.from({ length: 24 }, (_, i) => {
          const x = i * 36 + 14;
          if (x > 358 && x < 482) return null;
          return <path key={x} d={`M${x} 354 V298`} />;
        })}
        <path d="M370 354 V276 Q420 236 470 276 V354" stroke="#0a090e" strokeWidth="5.5" />
        <path d="M420 240 V222 M412 229 H428" stroke="#16131f" strokeWidth="3" />
      </g>
      {/* Foreground stones */}
      <path d={lancet(78, 356, 28, 56)} fill={GROUND} />
      <rect x="150" y="290" width="7" height="66" fill={GROUND} />
      <rect x="137" y="304" width="33" height="7" fill={GROUND} />
      <rect x="242" y="308" width="28" height="48" rx="13" fill={GROUND} />
      <path d={lancet(560, 356, 30, 62)} fill={GROUND} />
      <rect x="634" y="304" width="26" height="52" rx="12" fill={GROUND} />
      <rect x="774" y="306" width="28" height="50" rx="13" fill={GROUND} />
      <path d="M0 344 Q420 332 840 344 V380 H0 Z" fill={GROUND} />
    </svg>
  );

const MobileOssuaryScene: React.FC<{ portrait: boolean }> = ({ portrait }) =>
  portrait ? (
    <svg className="absolute inset-0 w-full h-full act-cut-gpu" viewBox="0 0 420 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 760 V582 Q124 524 210 510 Q304 524 420 578 V760 Z" fill="#10151c" />
      {/* Arching Ribcage Monoliths framing the bone cairn */}
      <g fill="none" stroke="#1b2430" strokeWidth="11" strokeLinecap="round">
        <path d="M62 630 C32 536 74 456 174 426" />
        <path d="M108 614 C86 534 118 470 198 446" />
        <path d="M358 630 C388 536 346 456 246 426" />
        <path d="M312 614 C334 534 302 470 222 446" />
      </g>
      {/* Scrap stakes */}
      <g stroke="#1c2430" strokeWidth="5" strokeLinecap="round">
        <line x1="78" y1="628" x2="54" y2="526" />
        <line x1="342" y1="624" x2="368" y2="520" />
      </g>
      <path d="M0 760 V640 C94 606 146 544 210 544 C274 544 326 606 420 638 V760 Z" fill={GROUND} />
      {/* Sculpted Ossuary Cairn Skulls */}
      <SculptedSkull cx={210} cy={574} scale={1.18} rot={2} />
      <SculptedSkull cx={136} cy={606} scale={1.0} rot={-10} />
      <SculptedSkull cx={284} cy={606} scale={1.0} rot={10} />
      <SculptedSkull cx={74} cy={642} scale={0.92} rot={-14} />
      <SculptedSkull cx={174} cy={636} scale={0.95} rot={8} />
      <SculptedSkull cx={248} cy={636} scale={0.95} rot={-8} />
      <SculptedSkull cx={346} cy={642} scale={0.92} rot={14} />
      <rect x="0" y="716" width="420" height="44" fill={GROUND} />
    </svg>
  ) : (
    <svg className="absolute inset-0 w-full h-full act-cut-gpu" viewBox="0 0 840 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 380 V300 Q210 250 420 232 Q630 250 840 296 V380 Z" fill="#10151c" />
      <g fill="none" stroke="#1b2430" strokeWidth="9" strokeLinecap="round">
        <path d="M242 308 C218 242 252 192 332 170" />
        <path d="M598 308 C622 242 588 192 508 170" />
      </g>
      <path d="M0 380 V318 C160 292 280 256 420 254 C560 256 680 292 840 316 V380 Z" fill={GROUND} />
      <SculptedSkull cx={420} cy={276} scale={0.98} rot={2} />
      <SculptedSkull cx={336} cy={292} scale={0.84} rot={-9} />
      <SculptedSkull cx={504} cy={292} scale={0.84} rot={9} />
      <SculptedSkull cx={238} cy={312} scale={0.78} rot={-12} />
      <SculptedSkull cx={602} cy={312} scale={0.78} rot={12} />
      <SculptedSkull cx={136} cy={328} scale={0.76} rot={8} />
      <SculptedSkull cx={704} cy={328} scale={0.76} rot={-8} />
      <rect x="0" y="352" width="840" height="28" fill={GROUND} />
    </svg>
  );

const MobileChapelScene: React.FC<{ portrait: boolean }> = ({ portrait }) =>
  portrait ? (
    <>
      <div
        className="absolute inset-0 pointer-events-none act-cut-lightning"
        style={{ background: 'radial-gradient(ellipse 74% 48% at 50% 56%, rgba(196,216,255,0.34) 0%, transparent 72%)' }}
      />
      <svg className="absolute inset-0 w-full h-full act-cut-gpu" viewBox="0 0 420 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        {/* Distant spires */}
        <path d="M0 760 V640 L36 640 V582 L54 548 L72 582 V636 H348 V582 L366 548 L384 582 V640 L420 640 V760 Z" fill="#0d1120" />
        {/* Buttresses & Turrets */}
        <rect x="52" y="544" width="32" height="176" fill={GROUND} />
        <polygon points="46,546 68,486 90,546" fill={GROUND} />
        <rect x="336" y="544" width="32" height="176" fill={GROUND} />
        <polygon points="330,546 352,486 374,546" fill={GROUND} />
        {/* Nave & Roof */}
        <rect x="82" y="528" width="256" height="192" fill={GROUND} />
        <polygon points="68,532 210,456 352,532" fill={GROUND} />
        {/* Belfry & Spire */}
        <rect x="170" y="408" width="80" height="126" fill={GROUND} />
        <polygon points="162,412 210,304 258,412" fill={GROUND} />
        <path d="M210 306 V284 M201 294 H219" stroke="#222b48" strokeWidth="3" strokeLinecap="round" />
        {/* Rose Window */}
        <g className="act-cut-window" style={{ animationDelay: '0.25s' }}>
          <circle cx="210" cy="534" r="20" fill="rgba(245,158,11,0.28)" />
          <circle cx="210" cy="534" r="14" fill="#f5b145" />
          <g stroke={GROUND} strokeWidth="2">
            <circle cx="210" cy="534" r="14" fill="none" />
            <line x1="210" y1="520" x2="210" y2="548" />
            <line x1="196" y1="534" x2="224" y2="534" />
          </g>
        </g>
        {/* Flickering Lancets */}
        {[lancet(134, 672, 26, 84), lancet(210, 672, 34, 102), lancet(286, 672, 26, 84), lancet(210, 494, 20, 54)].map((d, i) => (
          <g key={i} className="act-cut-window" style={{ animationDelay: `${i * 0.65}s` }}>
            <path d={d} fill="none" stroke="rgba(245,158,11,0.32)" strokeWidth="7" />
            <path d={d} fill="#f2a83b" />
          </g>
        ))}
        <rect x="0" y="710" width="420" height="50" fill={GROUND} />
      </svg>
    </>
  ) : (
    <>
      <div
        className="absolute inset-0 pointer-events-none act-cut-lightning"
        style={{ background: 'radial-gradient(ellipse 56% 52% at 50% 60%, rgba(196,216,255,0.32) 0%, transparent 72%)' }}
      />
      <svg className="absolute inset-0 w-full h-full act-cut-gpu" viewBox="0 0 840 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path d="M0 380 V322 L84 322 V282 L104 260 L124 282 V320 H716 V282 L736 260 L756 282 V322 L840 322 V380 Z" fill="#0d1120" />
        <rect x="266" y="264" width="26" height="96" fill={GROUND} />
        <polygon points="262,266 279,226 296,266" fill={GROUND} />
        <rect x="548" y="264" width="26" height="96" fill={GROUND} />
        <polygon points="544,266 561,226 578,266" fill={GROUND} />
        <rect x="292" y="256" width="256" height="104" fill={GROUND} />
        <polygon points="278,258 420,212 562,258" fill={GROUND} />
        <rect x="390" y="186" width="60" height="76" fill={GROUND} />
        <polygon points="384,188 420,144 456,188" fill={GROUND} />
        <path d="M420 144 V134 M415 138 H425" stroke="#222b48" strokeWidth="2.5" strokeLinecap="round" />
        {[lancet(340, 338, 20, 60), lancet(420, 338, 26, 72), lancet(500, 338, 20, 60), lancet(420, 240, 14, 34)].map((d, i) => (
          <g key={i} className="act-cut-window" style={{ animationDelay: `${i * 0.65}s` }}>
            <path d={d} fill="none" stroke="rgba(245,158,11,0.32)" strokeWidth="5.5" />
            <path d={d} fill="#f2a83b" />
          </g>
        ))}
        <rect x="0" y="348" width="840" height="32" fill={GROUND} />
      </svg>
    </>
  );

const MobileUzumakiScene: React.FC<{ portrait: boolean }> = ({ portrait }) => (
  <>
    {/* Full-Horizon GPU-Isolated Vortex (overflow-clipped, no outer scale animation, zero tile tearing) */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none act-cut-gpu">
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 act-cut-gpu"
        style={{
          top: portrait ? '58%' : '66%',
          width: portrait ? '138vw' : '124vw',
          height: portrait ? '138vw' : '124vw',
        }}
      >
        <div className="w-full h-full act-cut-gpu" style={{ animation: 'actCutSpin 72s linear infinite', willChange: 'transform' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
            <path d={SPIRAL_PRIMARY} fill="none" stroke="rgba(220,38,38,0.26)" strokeWidth="1.8" strokeLinecap="round" />
            <path d={SPIRAL_PRIMARY} fill="none" stroke="rgba(251,146,60,0.68)" strokeWidth="0.46" strokeLinecap="round" />
            <path d={SPIRAL_SECONDARY} fill="none" stroke="rgba(185,28,28,0.36)" strokeWidth="1.0" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
    <div
      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full act-cut-gpu"
      style={{
        top: portrait ? '58%' : '66%',
        width: portrait ? '24vw' : '18vh',
        height: portrait ? '24vw' : '18vh',
        maxWidth: '104px',
        maxHeight: '104px',
        background:
          'radial-gradient(circle closest-side, #000 0%, #000 50%, rgba(220,38,38,0.58) 76%, rgba(251,146,60,0.24) 88%, transparent 100%)',
      }}
    />
    <svg
      className="absolute bottom-0 left-0 w-full h-[25%] act-cut-gpu"
      viewBox="0 0 840 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 160 L0 106 L74 62 L152 114 L244 46 L336 108 L420 76 L512 112 L606 44 L698 106 L776 68 L840 96 L840 160 Z"
        fill={GROUND}
      />
      <path
        d="M244 46 L254 114 M606 44 L594 112"
        fill="none"
        stroke="rgba(249,115,22,0.48)"
        strokeWidth="2.4"
        className="act-cut-ember-pulse"
      />
    </svg>
  </>
);

const DesktopScene: React.FC<{ act: number }> = ({ act }) => {
  if (act === 1) return <DesktopCemeteryScene />;
  if (act === 2) return <DesktopOssuaryScene />;
  if (act === 3) return <DesktopChapelScene />;
  return <DesktopUzumakiScene />;
};

const MobileScene: React.FC<{ act: number; portrait: boolean }> = ({ act, portrait }) => {
  if (act === 1) return <MobileCemeteryScene portrait={portrait} />;
  if (act === 2) return <MobileOssuaryScene portrait={portrait} />;
  if (act === 3) return <MobileChapelScene portrait={portrait} />;
  return <MobileUzumakiScene portrait={portrait} />;
};

export const ActCutscene: React.FC<ActCutsceneProps> = ({ act, onDone }) => {
  const a = Math.min(4, Math.max(1, act));
  const copy = ACT_COPY[a];
  const [leaving, setLeaving] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>(() => detectViewportMode());
  const armedRef = useRef(false);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const onResize = () => setViewportMode(detectViewportMode());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

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

  const isMobile = viewportMode !== 'desktop';
  const isPortrait = viewportMode === 'mobile-portrait';

  return (
    <div
      onClick={() => { if (armedRef.current) finish(); }}
      data-cutscene-mode={viewportMode}
      className="act-cut fixed inset-0 z-[130] overflow-hidden select-none cursor-pointer pointer-events-auto act-cut-gpu"
      style={{ background: '#020103', opacity: leaving ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-in` }}
    >
      {/* Sky backdrop */}
      <div className="absolute inset-0 act-cut-gpu" style={{ background: copy.bg, animation: 'actCutIn 1.3s ease-out both' }} />

      {/* Atmospheric Horizon Rim Glow */}
      <div className="absolute inset-0 pointer-events-none act-cut-gpu" style={{ background: copy.horizonGlow }} />

      {/* Scene Layer: Desktop gets subtle slow push-in + full weather; Mobile uses tear-free dedicated artboard */}
      {isMobile ? (
        <div className="absolute inset-0 act-cut-gpu" style={{ animation: 'actCutIn 1.1s ease-out both' }}>
          <MobileScene act={a} portrait={isPortrait} />
          {/* Lightweight single-layer GPU-safe ground mist (no heavy multi-particle tearing on mobile) */}
          <div
            className="absolute -inset-x-[10%] bottom-0 h-[32%] pointer-events-none act-cut-mist act-cut-gpu"
            style={{
              background:
                a === 4
                  ? 'radial-gradient(ellipse 64% 60% at 50% 95%, rgba(220,38,38,0.22) 0%, transparent 76%)'
                  : 'radial-gradient(ellipse 68% 58% at 50% 96%, rgba(210,214,220,0.16) 0%, transparent 76%)',
            }}
          />
        </div>
      ) : (
        <>
          <div
            className="absolute inset-0 act-cut-gpu"
            style={{ animation: 'actCutPush 8s ease-out both', willChange: 'transform' }}
          >
            <DesktopScene act={a} />
          </div>
          <ActWeather act={a} posClass="absolute inset-0" keyPrefix="cutscene" />
        </>
      )}

      {/* Cinematic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.78) 100%)' }}
      />

      {/* Act Title Banner — positioned cleanly above the silhouette landmarks on every screen aspect */}
      <div
        className="absolute inset-x-0 z-10"
        style={{
          top: isMobile ? (isPortrait ? '15%' : '9%') : '16%',
        }}
      >
        <div
          className={`edge-band edge-band--full relative w-full text-center act-cut-gpu ${
            isMobile ? (isPortrait ? 'py-5 px-5' : 'py-3 px-4') : 'py-7 px-6'
          }`}
          style={{
            ['--band-rule' as any]: copy.rule,
            ['--band-bg' as any]: 'rgba(4,3,6,0.66)',
            ['--band-glow' as any]: copy.glow,
            animation: 'actCutIn 0.95s ease-out 0.75s both',
          }}
        >
          <div
            className="act-cut-rise flex items-center justify-center gap-2.5 sm:gap-3.5"
            style={{ ['--d' as any]: '1.15s' }}
          >
            <span className="h-px w-10 sm:w-24" style={{ background: `linear-gradient(to right, transparent, ${copy.rule})` }} />
            <span className="w-1.5 h-1.5 rotate-45 opacity-80" style={{ background: copy.accent }} />
            <span
              className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.46em]"
              style={{ color: copy.accent }}
            >
              Act {copy.numeral}
            </span>
            <span className="w-1.5 h-1.5 rotate-45 opacity-80" style={{ background: copy.accent }} />
            <span className="h-px w-10 sm:w-24" style={{ background: `linear-gradient(to left, transparent, ${copy.rule})` }} />
          </div>
          <div
            className="act-cut-rise mt-1.5 sm:mt-2 font-['Cinzel',_serif] font-black uppercase leading-tight"
            style={{
              ['--d' as any]: '1.75s',
              fontSize: isMobile
                ? (isPortrait ? 'clamp(1.35rem, 6.4vw, 2.05rem)' : 'clamp(1.15rem, 3.6vw, 1.75rem)')
                : 'clamp(1.8rem, 4.4vw, 3.35rem)',
              letterSpacing: isMobile ? '0.13em' : '0.17em',
              color: copy.accent,
              textShadow: `0 2px 24px ${copy.rule}, 0 2px 8px rgba(0,0,0,1)`,
            }}
          >
            {copy.title}
          </div>
          <div
            className="act-cut-rise mt-1 sm:mt-2 font-['Cinzel',_serif] italic tracking-[0.14em]"
            style={{
              ['--d' as any]: '2.45s',
              fontSize: isMobile ? (isPortrait ? '0.85rem' : '0.75rem') : '1rem',
              color: copy.accent,
              opacity: 0.85,
            }}
          >
            {copy.sub}
          </div>
        </div>
      </div>

      <div
        className="act-cut-rise absolute bottom-3.5 sm:bottom-5 inset-x-0 text-center text-[9px] font-mono uppercase tracking-[0.28em] text-[#a99174]/80 z-10"
        style={{ ['--d' as any]: '1.5s' }}
      >
        {isMobile ? 'Tap anywhere to continue' : 'Click or press Space to skip'}
      </div>
    </div>
  );
};

export default ActCutscene;
