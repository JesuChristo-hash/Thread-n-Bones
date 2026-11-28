import React, { useId } from 'react';
import type { CardDef } from '../data/gameData';

export type TribeAttackStyle =
  | 'no_tribe'
  | 'hooved'
  | 'canine'
  | 'avian'
  | 'insect'
  | 'reptile'
  | 'vermin';

export const ALL_TRIBE_ATTACK_STYLES: TribeAttackStyle[] = [
  'no_tribe',
  'hooved',
  'canine',
  'avian',
  'insect',
  'reptile',
  'vermin',
];

export function resolveTribeAttackStyle(card?: CardDef | null): TribeAttackStyle {
  if (!card) return 'no_tribe';
  const cls = String(card.class || '');
  const isAmalgam =
    cls === 'ALL Classes' ||
    Boolean((card as any).isAmalgam) ||
    card.name === 'Amalgam' ||
    card.name === 'Chimera';
  if (isAmalgam) {
    return ALL_TRIBE_ATTACK_STYLES[Math.floor(Math.random() * ALL_TRIBE_ATTACK_STYLES.length)];
  }
  switch (cls) {
    case 'Hooved':
      return 'hooved';
    case 'Canine':
      return 'canine';
    case 'Avian':
      return 'avian';
    case 'Insect':
      return 'insect';
    case 'Reptile':
      return 'reptile';
    case 'Vermin':
      return 'vermin';
    default:
      return 'no_tribe';
  }
}

export interface TribeStrikeEvent {
  id: number;
  targetIsPlayer: boolean;
  targetLane: number;
  isMassiveTarget?: boolean;
  style: TribeAttackStyle;
  direction?: 'left' | 'right' | 'straight';
}

export const TribeAttackVfx: React.FC<{
  styleType: TribeAttackStyle;
  direction?: 'left' | 'right' | 'straight';
  className?: string;
}> = ({ styleType, direction = 'straight', className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const flipX = direction === 'left' ? -1 : 1;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-[-22%] z-[68] flex items-center justify-center overflow-visible select-none ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.58)) drop-shadow(0 0 3px rgba(255,255,255,0.35))',
        }}
      >
        <defs>
          <filter id={`fxGlow-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>

          {/* Translucent red-to-white horizontal action slash gradient */}
          <linearGradient id={`redWake-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#991b1b" stopOpacity="0" />
            <stop offset="22%" stopColor="#dc2626" stopOpacity="0.48" />
            <stop offset="68%" stopColor="#ef4444" stopOpacity="0.72" />
            <stop offset="92%" stopColor="#fca5a5" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`whiteCore-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="28%" stopColor="#fee2e2" stopOpacity="0.68" />
            <stop offset="72%" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="94%" stopColor="#ffffff" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`vertBlade-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
            <stop offset="40%" stopColor="#ef4444" stopOpacity="0.62" />
            <stop offset="82%" stopColor="#ffffff" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.98" />
          </linearGradient>

          <linearGradient id={`vertBladeUp-${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
            <stop offset="40%" stopColor="#ef4444" stopOpacity="0.62" />
            <stop offset="82%" stopColor="#ffffff" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.98" />
          </linearGradient>

          <radialGradient id={`hitFlash-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.76" />
            <stop offset="28%" stopColor="#fca5a5" stopOpacity="0.54" />
            <stop offset="62%" stopColor="#dc2626" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`ringFlash-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="56%" stopColor="#dc2626" stopOpacity="0" />
            <stop offset="78%" stopColor="#ef4444" stopOpacity="0.46" />
            <stop offset="90%" stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. NO TRIBE: Single swipe — 3 parallel curved semi-transparent white & red claw slashes */}
        {styleType === 'no_tribe' && (
          <g transform={`translate(60 60) scale(${flipX} 1) translate(-60 -60)`}>
            {/* Ambient translucent hit flash */}
            <ellipse
              cx="64"
              cy="58"
              rx="42"
              ry="26"
              fill={`url(#hitFlash-${uid})`}
              opacity="0.55"
              style={{ transformOrigin: '64px 58px', animation: 'tribeImpactFlash 380ms ease-out 30ms both' }}
            />
            {[
              { dy: -20, delay: '0ms', w: 0.95 },
              { dy: 0, delay: '26ms', w: 1.15 },
              { dy: 20, delay: '52ms', w: 0.9 },
            ].map((row, idx) => (
              <g key={idx} transform={`translate(0 ${row.dy})`}>
                <g
                  style={{
                    transformOrigin: '60px 60px',
                    animation: `tribeClawSweep 400ms cubic-bezier(0.16, 1, 0.3, 1) ${row.delay} both`,
                  }}
                >
                  {/* Soft blurred crimson slash aura */}
                  <path
                    d="M 4 66 Q 58 43 116 58 Q 62 59 8 71 Z"
                    fill="#ef4444"
                    opacity="0.36"
                    filter={`url(#fxGlow-${uid})`}
                  />
                  {/* Tapered translucent crimson crescent smear */}
                  <path
                    d="M 6 65 Q 58 45 115 58 Q 62 55 12 68 Z"
                    fill={`url(#redWake-${uid})`}
                  />
                  {/* Crisp semi-transparent white-hot kinetic blade core */}
                  <path
                    d="M 14 63 Q 60 48 113 58 Q 62 52 18 65 Z"
                    fill={`url(#whiteCore-${uid})`}
                    opacity="0.92"
                  />
                  {/* Leading razor speed filament */}
                  <path
                    d="M 22 61 Q 62 49 112 58"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={1.3 * row.w}
                    strokeLinecap="round"
                    strokeDasharray="120"
                    opacity="0.88"
                    style={{ animation: `tribeSlashDraw 320ms ease-out ${row.delay} both` }}
                  />
                </g>
              </g>
            ))}
            {/* Kinetic white & red slash sparks */}
            {[
              { x: 96, y: 34, l: 10, dy: -3, c: '#ffffff' },
              { x: 106, y: 55, l: 12, dy: -1, c: '#fca5a5' },
              { x: 100, y: 78, l: 9, dy: 2, c: '#ef4444' },
              { x: 84, y: 44, l: 7, dy: -2, c: '#ffffff' },
            ].map((sp, i) => (
              <line
                key={i}
                x1={sp.x}
                y1={sp.y}
                x2={sp.x + sp.l}
                y2={sp.y + sp.dy}
                stroke={sp.c}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.82"
                style={{ animation: `tribeImpactFlash 340ms ease-out ${40 + i * 20}ms both` }}
              />
            ))}
          </g>
        )}

        {/* 2. HOOVED: Single hoof stomp — translucent white/red shockwave rings & cloven impact flash */}
        {styleType === 'hooved' && (
          <g>
            {/* Central luminous impact burst */}
            <ellipse
              cx="60"
              cy="62"
              rx="48"
              ry="34"
              fill={`url(#hitFlash-${uid})`}
              opacity="0.72"
              style={{ transformOrigin: '60px 62px', animation: 'tribeImpactFlash 420ms ease-out 55ms both' }}
            />
            {/* Expanding translucent crimson & white shockwave ring */}
            <ellipse
              cx="60"
              cy="64"
              rx="48"
              ry="30"
              fill={`url(#ringFlash-${uid})`}
              style={{ transformOrigin: '60px 64px', animation: 'tribeShockRing 430ms cubic-bezier(0.16, 1, 0.3, 1) 60ms both' }}
            />
            <ellipse
              cx="60"
              cy="64"
              rx="38"
              ry="23"
              fill="none"
              stroke="rgba(255,255,255,0.68)"
              strokeWidth="1.6"
              style={{ transformOrigin: '60px 64px', animation: 'tribeShockRing 390ms cubic-bezier(0.16, 1, 0.3, 1) 75ms both' }}
            />
            {/* Radiating kinetic impact lines */}
            <g style={{ transformOrigin: '60px 62px', animation: 'tribeImpactFlash 400ms ease-out 70ms both' }}>
              {[
                'M 34 52 L 10 42',
                'M 86 52 L 110 42',
                'M 38 76 L 14 94',
                'M 82 76 L 106 94',
                'M 60 86 L 60 112',
                'M 28 64 L 6 65',
                'M 92 64 L 114 65',
              ].map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="rgba(239,68,68,0.62)" strokeWidth="3.2" strokeLinecap="round" />
                  <path d={d} fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="1.2" strokeLinecap="round" />
                </g>
              ))}
            </g>
            {/* Semi-transparent luminous cloven hoof energy stamp */}
            <g style={{ transformOrigin: '60px 60px', animation: 'tribeHoofStomp 440ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              {/* Glowing crimson silhouette wash */}
              <path
                d="M 55 30 C 39 35, 30 50, 33 66 C 36 78, 45 84, 56 82 C 54 75, 46 72, 43 63 C 40 54, 45 43, 55 38 Z"
                fill="rgba(239,68,68,0.48)"
                stroke="rgba(255,255,255,0.86)"
                strokeWidth="1.7"
              />
              <path
                d="M 65 30 C 81 35, 90 50, 87 66 C 84 78, 75 84, 64 82 C 66 75, 74 72, 77 63 C 80 54, 75 43, 65 38 Z"
                fill="rgba(239,68,68,0.48)"
                stroke="rgba(255,255,255,0.86)"
                strokeWidth="1.7"
              />
              {/* Bright white center cleft flash */}
              <line x1="60" y1="32" x2="60" y2="85" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* 3. CANINE: Vertical teeth chomp — semi-transparent white/red fang flash strikes & bite seam */}
        {styleType === 'canine' && (
          <g>
            {/* Central luminous bite closure hit-flash */}
            <ellipse
              cx="60"
              cy="60"
              rx="48"
              ry="15"
              fill={`url(#hitFlash-${uid})`}
              opacity="0.82"
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 400ms ease-out 85ms both' }}
            />
            {/* White-hot horizontal snap seam */}
            <path
              d="M 8 60 Q 60 55 112 60 Q 60 65 8 60 Z"
              fill="rgba(239,68,68,0.68)"
              filter={`url(#fxGlow-${uid})`}
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 360ms ease-out 90ms both' }}
            />
            <path
              d="M 14 60 Q 60 58 106 60 Q 60 62 14 60 Z"
              fill="rgba(255,255,255,0.94)"
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 340ms ease-out 95ms both' }}
            />
            {/* Upper translucent white-and-red plunging fang streaks */}
            <g style={{ transformOrigin: '60px 22px', animation: 'tribeChompTop 420ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <path d="M 18 18 Q 60 7 102 18" fill="none" stroke="rgba(239,68,68,0.52)" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 33 17 Q 37 42 40 65 Q 43 42 46 18 Z" fill={`url(#vertBlade-${uid})`} opacity="0.92" />
              <path d="M 87 17 Q 83 42 80 65 Q 77 42 74 18 Z" fill={`url(#vertBlade-${uid})`} opacity="0.92" />
              <path d="M 20 22 L 25 45 L 30 22 Z M 50 15 L 54 39 L 58 15 Z M 62 15 L 66 39 L 70 15 Z M 90 22 L 95 45 L 100 22 Z" fill={`url(#vertBlade-${uid})`} opacity="0.72" />
              {/* Razor white speed lines down the canine tips */}
              <path d="M 40 24 L 40 64 M 80 24 L 80 64" stroke="rgba(255,255,255,0.92)" strokeWidth="1.4" strokeLinecap="round" />
            </g>
            {/* Lower translucent white-and-red snapping fang streaks */}
            <g style={{ transformOrigin: '60px 98px', animation: 'tribeChompBot 420ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <path d="M 18 102 Q 60 113 102 102" fill="none" stroke="rgba(239,68,68,0.52)" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 37 103 Q 41 78 44 55 Q 47 78 50 102 Z" fill={`url(#vertBladeUp-${uid})`} opacity="0.92" />
              <path d="M 83 103 Q 79 78 76 55 Q 73 78 70 102 Z" fill={`url(#vertBladeUp-${uid})`} opacity="0.92" />
              <path d="M 22 98 L 27 75 L 32 98 Z M 52 104 L 56 81 L 60 104 Z M 60 104 L 64 81 L 68 104 Z M 88 98 L 93 75 L 98 98 Z" fill={`url(#vertBladeUp-${uid})`} opacity="0.72" />
              <path d="M 44 96 L 44 56 M 76 96 L 76 56" stroke="rgba(255,255,255,0.92)" strokeWidth="1.4" strokeLinecap="round" />
            </g>
            {/* Sideways hit sparks */}
            {[
              { x1: 38, y1: 60, x2: 20, y2: 50, c: '#ffffff' },
              { x1: 82, y1: 60, x2: 100, y2: 70, c: '#ffffff' },
              { x1: 20, y1: 60, x2: 4, y2: 58, c: '#ef4444' },
              { x1: 100, y1: 60, x2: 116, y2: 62, c: '#ef4444' },
            ].map((sp, i) => (
              <line
                key={i}
                x1={sp.x1}
                y1={sp.y1}
                x2={sp.x2}
                y2={sp.y2}
                stroke={sp.c}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.86"
                style={{ animation: 'tribeImpactFlash 320ms ease-out 100ms both' }}
              />
            ))}
          </g>
        )}

        {/* 4. AVIAN: Multiple feathers plume downward strike — luminous white/red speed dive */}
        {styleType === 'avian' && (
          <g>
            {/* Steep translucent red & white dive-shear streaks */}
            {[22, 41, 60, 79, 98].map((x, idx) => (
              <g key={`wind-${idx}`}>
                <path
                  d={`M ${x + (idx - 2) * 3} 4 Q ${x + (idx - 2)} 58 ${x - (idx - 2) * 2.5} 116`}
                  fill="none"
                  stroke="rgba(239,68,68,0.48)"
                  strokeWidth={idx === 2 ? '3.4' : '2.1'}
                  strokeLinecap="round"
                  strokeDasharray="125"
                  style={{ animation: `tribeSlashDraw 360ms ease-out ${idx * 20}ms both` }}
                />
                <path
                  d={`M ${x + (idx - 2) * 3} 8 Q ${x + (idx - 2)} 58 ${x - (idx - 2) * 2.5} 114`}
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth={idx === 2 ? '1.3' : '0.85'}
                  strokeLinecap="round"
                  strokeDasharray="125"
                  style={{ animation: `tribeSlashDraw 340ms ease-out ${idx * 20}ms both` }}
                />
              </g>
            ))}
            {/* Fan of 6 translucent white-hot & crimson kinetic plume feathers plunging downward */}
            {[
              { x: 20, y: 48, rot: -15, delay: '22ms', sc: 0.85 },
              { x: 37, y: 58, rot: -8, delay: '0ms', sc: 0.96 },
              { x: 53, y: 66, rot: -2, delay: '12ms', sc: 1.08 },
              { x: 69, y: 64, rot: 5, delay: '24ms', sc: 1.04 },
              { x: 85, y: 56, rot: 12, delay: '36ms', sc: 0.94 },
              { x: 100, y: 46, rot: 18, delay: '48ms', sc: 0.82 },
            ].map((f, idx) => (
              <g key={idx} transform={`translate(${f.x} ${f.y}) rotate(${f.rot}) scale(${f.sc})`}>
                <g
                  style={{
                    transformOrigin: '0px 0px',
                    animation: `tribeFeatherPlume 420ms cubic-bezier(0.16, 1, 0.3, 1) ${f.delay} both`,
                  }}
                >
                  {/* Soft translucent crimson feather trail */}
                  <path
                    d="M 0 -34 C 6 -19, 7 -3, 4 13 L 1.5 9 L 3.5 19 L 0 34 L -3.5 18 L -1.5 9 L -4.5 14 C -7 -3, -6 -19, 0 -34 Z"
                    fill={`url(#vertBlade-${uid})`}
                    opacity="0.82"
                  />
                  {/* Razor luminous white quill & tip gleam */}
                  <line x1="0" y1="-28" x2="0" y2="30" stroke="rgba(255,255,255,0.92)" strokeWidth="1.35" strokeLinecap="round" />
                  <path d="M -2.2 14 L 0 33 L 2.2 14 Z" fill="rgba(255,255,255,0.94)" />
                </g>
              </g>
            ))}
          </g>
        )}

        {/* 5. INSECT: Two short side-by-side inward translucent white/red pincer scissor slices */}
        {styleType === 'insect' && (
          <g>
            {/* Central luminous crossing hit-flash */}
            <ellipse
              cx="60"
              cy="58"
              rx="22"
              ry="26"
              fill={`url(#hitFlash-${uid})`}
              opacity="0.78"
              style={{ transformOrigin: '60px 58px', animation: 'tribeImpactFlash 380ms ease-out 75ms both' }}
            />
            {/* Left inward translucent crescent shear */}
            <g style={{ transformOrigin: '24px 86px', animation: 'tribePincerLeft 400ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <path
                d="M 18 90 C 12 62, 26 36, 65 25 C 47 38, 36 53, 35 76 L 26 89 Z"
                fill="rgba(239,68,68,0.44)"
                filter={`url(#fxGlow-${uid})`}
              />
              <path
                d="M 20 88 C 16 62, 29 38, 65 26 C 47 39, 37 52, 40 57 L 34 62 L 40 67 L 32 76 C 28 82, 24 87, 20 88 Z"
                fill="rgba(239,68,68,0.58)"
              />
              <path
                d="M 22 85 C 21 61, 34 40, 65 27"
                fill="none"
                stroke="rgba(255,255,255,0.94)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </g>
            {/* Right inward translucent crescent shear */}
            <g style={{ transformOrigin: '96px 86px', animation: 'tribePincerRight 400ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <path
                d="M 102 90 C 108 62, 94 36, 55 25 C 73 38, 84 53, 85 76 L 94 89 Z"
                fill="rgba(239,68,68,0.44)"
                filter={`url(#fxGlow-${uid})`}
              />
              <path
                d="M 100 88 C 104 62, 91 38, 55 26 C 73 39, 83 52, 80 57 L 86 62 L 80 67 L 88 76 C 92 82, 96 87, 100 88 Z"
                fill="rgba(239,68,68,0.58)"
              />
              <path
                d="M 98 85 C 99 61, 86 40, 55 27"
                fill="none"
                stroke="rgba(255,255,255,0.94)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </g>
            {/* Crisp white-hot X snip flash at intersection */}
            <g style={{ transformOrigin: '60px 56px', animation: 'tribeImpactFlash 320ms ease-out 90ms both' }}>
              <path d="M 44 40 L 76 72 M 76 40 L 44 72" stroke="rgba(239,68,68,0.72)" strokeWidth="4" strokeLinecap="round" />
              <path d="M 44 40 L 76 72 M 76 40 L 44 72" stroke="rgba(255,255,255,0.96)" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* 6. REPTILE: Heavy blunt-force tail swipe translucent arc smear & white/red shockwave */}
        {styleType === 'reptile' && (
          <g transform={`translate(60 60) scale(${flipX} 1) translate(-60 -60)`}>
            {/* Luminous blunt-impact burst */}
            <circle
              cx="74"
              cy="58"
              r="36"
              fill={`url(#hitFlash-${uid})`}
              opacity="0.78"
              style={{ transformOrigin: '74px 58px', animation: 'tribeImpactFlash 420ms ease-out 65ms both' }}
            />
            {/* Concave translucent white & red blunt shockwave arcs */}
            <path
              d="M 74 20 C 98 37, 101 79, 74 100"
              fill="none"
              stroke="rgba(239,68,68,0.58)"
              strokeWidth="6.5"
              strokeLinecap="round"
              style={{ transformOrigin: '78px 60px', animation: 'tribeShockRing 410ms cubic-bezier(0.16, 1, 0.3, 1) 70ms both' }}
            />
            <path
              d="M 79 26 C 99 41, 101 76, 79 94"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2.2"
              strokeLinecap="round"
              style={{ transformOrigin: '82px 60px', animation: 'tribeShockRing 390ms cubic-bezier(0.16, 1, 0.3, 1) 82ms both' }}
            />
            {/* Sweeping semi-transparent blunt tail-whip kinetic ribbon */}
            <g style={{ transformOrigin: '12px 78px', animation: 'tribeTailWhip 420ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              <path
                d="M 0 78 Q 52 30 115 52 Q 64 78 4 94 Z"
                fill="rgba(220,38,38,0.42)"
                filter={`url(#fxGlow-${uid})`}
              />
              <path
                d="M 2 70 Q 52 38 112 53 C 117 55, 116 64, 107 66 Q 52 60 4 86 Z"
                fill={`url(#redWake-${uid})`}
              />
              {/* Bright translucent white leading kinetic edge */}
              <path
                d="M 10 68 Q 54 41 112 54 Q 60 51 14 74 Z"
                fill={`url(#whiteCore-${uid})`}
                opacity="0.92"
              />
            </g>
            {/* Flung bright hit sparks */}
            {[
              { x1: 86, y1: 32, x2: 102, y2: 24, c: '#ffffff' },
              { x1: 94, y1: 58, x2: 114, y2: 56, c: '#fca5a5' },
              { x1: 86, y1: 84, x2: 102, y2: 94, c: '#ffffff' },
            ].map((sp, i) => (
              <line
                key={i}
                x1={sp.x1}
                y1={sp.y1}
                x2={sp.x2}
                y2={sp.y2}
                stroke={sp.c}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.88"
                style={{ animation: `tribeImpactFlash 360ms ease-out ${78 + i * 18}ms both` }}
              />
            ))}
          </g>
        )}

        {/* 7. VERMIN: 3 perpendicular rapid diagonal bursts of 2 curved stacked white & red slashes */}
        {styleType === 'vermin' && (
          <g>
            {[
              { rot: 38, flip: 1, dy: -8, delay: '0ms' },
              { rot: -52, flip: -1, dy: 0, delay: '90ms' },
              { rot: 38, flip: 1, dy: 12, delay: '180ms' },
            ].map((burst, bIdx) => (
              <g
                key={bIdx}
                transform={`translate(60 ${60 + burst.dy}) rotate(${burst.rot}) scale(${burst.flip} 1) translate(-60 -60)`}
              >
                {[-9, 9].map((offsetY, sIdx) => (
                  <g key={sIdx} transform={`translate(0 ${offsetY})`}>
                    <g
                      style={{
                        transformOrigin: '60px 60px',
                        animation: `tribeVerminSlice 260ms cubic-bezier(0.16, 1, 0.3, 1) ${burst.delay} both`,
                      }}
                    >
                      {/* Translucent red slash bloom */}
                      <path
                        d="M 8 64 Q 60 46 112 61 Q 62 58 14 68 Z"
                        fill="rgba(239,68,68,0.44)"
                        filter={`url(#fxGlow-${uid})`}
                      />
                      {/* Crimson streak body */}
                      <path
                        d="M 10 63 Q 60 48 110 61 Q 62 55 14 66 Z"
                        fill={`url(#redWake-${uid})`}
                      />
                      {/* White-hot razor inner core */}
                      <path
                        d="M 16 62 Q 60 50 108 61"
                        fill="none"
                        stroke="rgba(255,255,255,0.94)"
                        strokeWidth={sIdx === 0 ? '2.0' : '1.6'}
                        strokeLinecap="round"
                        strokeDasharray="110"
                        style={{ animation: `tribeSlashDraw 210ms ease-out ${burst.delay} both` }}
                      />
                    </g>
                  </g>
                ))}
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

export default TribeAttackVfx;
