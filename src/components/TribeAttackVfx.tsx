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
      className={`pointer-events-none absolute inset-[-20%] z-[68] flex items-center justify-center overflow-visible select-none ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible"
        style={{
          filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.9)) drop-shadow(0 0 7px rgba(153,27,27,0.42))',
        }}
      >
        <defs>
          {/* Distressed ink / ragged brush displacement filter so strokes feel raw, never cartoony */}
          <filter id={`inkRough-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`smokeBlur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.9" />
          </filter>

          <linearGradient id={`inkSlash-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#121418" stopOpacity="0" />
            <stop offset="22%" stopColor="#1e2229" stopOpacity="0.92" />
            <stop offset="68%" stopColor="#454c59" stopOpacity="0.96" />
            <stop offset="92%" stopColor="#991b1b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`inkMetal-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#171a20" stopOpacity="0.96" />
            <stop offset="48%" stopColor="#3b414d" stopOpacity="0.95" />
            <stop offset="86%" stopColor="#636b7a" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#1c1f26" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id={`bloodCut-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#450a0a" stopOpacity="0" />
            <stop offset="25%" stopColor="#991b1b" stopOpacity="0.92" />
            <stop offset="72%" stopColor="#dc2626" stopOpacity="1" />
            <stop offset="92%" stopColor="#f87171" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={`bruiseBloom-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#991b1b" stopOpacity="0.72" />
            <stop offset="42%" stopColor="#450a0a" stopOpacity="0.52" />
            <stop offset="74%" stopColor="#1c1f26" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#090a0d" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`dustRing-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="52%" stopColor="#181b21" stopOpacity="0" />
            <stop offset="76%" stopColor="#3c424d" stopOpacity="0.62" />
            <stop offset="90%" stopColor="#991b1b" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#121418" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. NO TRIBE: Single swipe — 3 horizontal parallel curved razor claw gashes */}
        {styleType === 'no_tribe' && (
          <g transform={`translate(60 60) scale(${flipX} 1) translate(-60 -60)`}>
            {[
              { dy: -21, delay: '0ms', w: 1.0 },
              { dy: 0, delay: '28ms', w: 1.15 },
              { dy: 21, delay: '56ms', w: 0.95 },
            ].map((row, idx) => (
              <g key={idx} transform={`translate(0 ${row.dy})`}>
                <g
                  style={{
                    transformOrigin: '60px 60px',
                    animation: `tribeClawSweep 420ms cubic-bezier(0.16, 1, 0.3, 1) ${row.delay} both`,
                  }}
                >
                  {/* Smoky dark-charcoal rake shadow wake */}
                  <path
                    d="M 4 65 Q 56 44 116 58 Q 62 57 10 70 Z"
                    fill="#14171c"
                    opacity="0.72"
                    filter={`url(#smokeBlur-${uid})`}
                  />
                  {/* Distressed needle-tapered charcoal gash */}
                  <path
                    d="M 6 65 Q 58 46 115 58 Q 62 54 12 68 Z"
                    fill={`url(#inkSlash-${uid})`}
                    filter={`url(#inkRough-${uid})`}
                  />
                  {/* Razor crimson laceration streak */}
                  <path
                    d="M 14 64 Q 59 48 112 58"
                    fill="none"
                    stroke={`url(#bloodCut-${uid})`}
                    strokeWidth={2.1 * row.w}
                    strokeLinecap="round"
                    strokeDasharray="120"
                    filter={`url(#inkRough-${uid})`}
                    style={{ animation: `tribeSlashDraw 340ms ease-out ${row.delay} both` }}
                  />
                  {/* Fine torn scarlet filament */}
                  <path
                    d="M 46 53 Q 80 51 113 58"
                    fill="none"
                    stroke="#fca5a5"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                    opacity="0.72"
                  />
                </g>
              </g>
            ))}
            {/* Whipped crimson splatter mist droplets */}
            {[
              { x: 96, y: 34, l: 8, rot: -14 },
              { x: 108, y: 55, l: 10, rot: -4 },
              { x: 102, y: 78, l: 7, rot: 10 },
              { x: 86, y: 45, l: 5, rot: -10 },
              { x: 90, y: 70, l: 5, rot: 8 },
            ].map((sp, i) => (
              <line
                key={i}
                x1={sp.x}
                y1={sp.y}
                x2={sp.x + sp.l}
                y2={sp.y + sp.rot * 0.16}
                stroke={i % 2 === 0 ? '#dc2626' : '#7f1d1d'}
                strokeWidth={i === 1 ? '1.8' : '1.2'}
                strokeLinecap="round"
                style={{ animation: `tribeImpactFlash 360ms ease-out ${45 + i * 20}ms both` }}
              />
            ))}
          </g>
        )}

        {/* 2. HOOVED: Brutal dry-brush cloven hoof stomp & shattered impact crater */}
        {styleType === 'hooved' && (
          <g>
            {/* Deep arterial bruise & gritty dust shockwave */}
            <ellipse
              cx="60"
              cy="64"
              rx="48"
              ry="34"
              fill={`url(#bruiseBloom-${uid})`}
              style={{ transformOrigin: '60px 64px', animation: 'tribeImpactFlash 450ms ease-out 70ms both' }}
            />
            <ellipse
              cx="60"
              cy="65"
              rx="50"
              ry="31"
              fill={`url(#dustRing-${uid})`}
              filter={`url(#inkRough-${uid})`}
              style={{ transformOrigin: '60px 65px', animation: 'tribeShockRing 440ms cubic-bezier(0.16, 1, 0.3, 1) 75ms both' }}
            />
            {/* Jagged splintered impact fissures */}
            <g filter={`url(#inkRough-${uid})`} style={{ transformOrigin: '60px 65px', animation: 'tribeImpactFlash 460ms ease-out 85ms both' }}>
              {[
                'M 34 54 L 18 44 L 6 49 M 18 44 L 13 33',
                'M 86 54 L 102 44 L 114 49 M 102 44 L 107 33',
                'M 38 78 L 20 96 L 9 100',
                'M 82 78 L 100 96 L 111 99',
                'M 60 85 L 56 105 L 63 115',
              ].map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="#16191f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={d} fill="none" stroke="#b91c1c" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
                </g>
              ))}
            </g>
            {/* Raw distressed dry-brush Cloven Hoof Imprint (asymmetrical chipped crescent walls) */}
            <g
              filter={`url(#inkRough-${uid})`}
              style={{ transformOrigin: '60px 60px', animation: 'tribeHoofStomp 460ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
            >
              <ellipse cx="60" cy="61" rx="30" ry="26" fill="#0b0d10" opacity="0.65" filter={`url(#smokeBlur-${uid})`} />
              {/* Left chipped cloven crescent wall */}
              <path
                d="M 55 29 C 39 34, 29 50, 32 67 C 35 79, 44 85, 56 83 C 54 76, 46 73, 42 64 C 39 54, 44 42, 55 37 Z"
                fill={`url(#inkMetal-${uid})`}
              />
              {/* Right chipped cloven crescent wall */}
              <path
                d="M 65 29 C 81 34, 91 50, 88 67 C 85 79, 76 85, 64 83 C 66 76, 74 73, 78 64 C 81 54, 76 42, 65 37 Z"
                fill={`url(#inkMetal-${uid})`}
              />
              {/* Inner rough heel scars */}
              <path
                d="M 55 44 L 54 74 M 65 44 L 66 74"
                stroke="#2c313b"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {/* Arterial crimson impact rim & cleft fissure */}
              <path
                d="M 33 64 C 36 77, 45 83, 55 82 M 87 64 C 84 77, 75 83, 65 82 M 60 31 L 60 85"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              {/* Scattered grit flecks */}
              <path d="M 24 62 L 18 65 M 96 62 L 102 65 M 44 26 L 40 20 M 76 26 L 80 20" stroke="#7f1d1d" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* 3. CANINE: Visceral vertical predatory fang punctures & shredded crimson tear */}
        {styleType === 'canine' && (
          <g>
            {/* Horizontal torn crimson wound seam where fangs lock */}
            <ellipse
              cx="60"
              cy="60"
              rx="48"
              ry="14"
              fill={`url(#bruiseBloom-${uid})`}
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 420ms ease-out 95ms both' }}
            />
            <path
              d="M 10 60 Q 60 55 110 60 Q 60 65 10 60 Z"
              fill="#b91c1c"
              opacity="0.88"
              filter={`url(#inkRough-${uid})`}
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 360ms ease-out 102ms both' }}
            />
            {/* Upper Jaw: Individual needle-tapered ink fang strikes plunging down (no blocky slab!) */}
            <g
              filter={`url(#inkRough-${uid})`}
              style={{ transformOrigin: '60px 22px', animation: 'tribeChompTop 440ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
            >
              {/* Faint dark upper snout-ridge arc */}
              <path d="M 16 20 Q 60 6 104 20" fill="none" stroke="#1f242c" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
              <path d="M 22 18 Q 60 8 98 18" fill="none" stroke="#991b1b" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
              {/* Primary long curved canines + smaller ragged incisors */}
              <path d="M 33 17 Q 36 42 40 65 Q 43 42 45 18 Z" fill={`url(#inkMetal-${uid})`} />
              <path d="M 87 17 Q 84 42 80 65 Q 77 42 75 18 Z" fill={`url(#inkMetal-${uid})`} />
              <path d="M 19 22 L 24 44 L 29 22 Z M 50 15 L 54 37 L 58 15 Z M 62 15 L 66 37 L 70 15 Z M 91 22 L 96 44 L 101 22 Z" fill={`url(#inkMetal-${uid})`} opacity="0.9" />
              {/* Bloodied vertical puncture streaks */}
              <path
                d="M 40 65 L 40 32 M 80 65 L 80 32 M 24 44 L 24 27 M 96 44 L 96 27"
                stroke="#ef4444"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </g>
            {/* Lower Jaw: Individual needle-tapered ink fang strikes snapping up */}
            <g
              filter={`url(#inkRough-${uid})`}
              style={{ transformOrigin: '60px 98px', animation: 'tribeChompBot 440ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
            >
              <path d="M 16 100 Q 60 114 104 100" fill="none" stroke="#1f242c" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
              <path d="M 22 102 Q 60 112 98 102" fill="none" stroke="#991b1b" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
              <path d="M 38 103 Q 41 78 44 56 Q 48 78 50 102 Z" fill={`url(#inkMetal-${uid})`} />
              <path d="M 82 103 Q 79 78 76 56 Q 72 78 70 102 Z" fill={`url(#inkMetal-${uid})`} />
              <path d="M 22 98 L 27 77 L 32 98 Z M 54 104 L 58 84 L 62 104 Z M 60 104 L 64 84 L 68 104 Z M 88 98 L 93 77 L 98 98 Z" fill={`url(#inkMetal-${uid})`} opacity="0.9" />
              <path
                d="M 44 56 L 44 87 M 76 56 L 76 87 M 27 77 L 27 92 M 93 77 L 93 92"
                stroke="#ef4444"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </g>
            {/* Arterial puncture spray */}
            {[
              { x1: 40, y1: 60, x2: 28, y2: 51 },
              { x1: 80, y1: 60, x2: 92, y2: 69 },
              { x1: 18, y1: 59, x2: 6, y2: 56 },
              { x1: 102, y1: 61, x2: 114, y2: 64 },
            ].map((sp, i) => (
              <line
                key={i}
                x1={sp.x1}
                y1={sp.y1}
                x2={sp.x2}
                y2={sp.y2}
                stroke="#ef4444"
                strokeWidth="1.7"
                strokeLinecap="round"
                style={{ animation: 'tribeImpactFlash 340ms ease-out 108ms both' }}
              />
            ))}
          </g>
        )}

        {/* 4. AVIAN: Razor dark-ink raven feather plume diving downward with crimson wind-cuts */}
        {styleType === 'avian' && (
          <g>
            {/* Steep ragged crimson & charcoal wind-shear cuts */}
            {[22, 42, 60, 78, 98].map((x, idx) => (
              <path
                key={`wind-${idx}`}
                d={`M ${x + (idx - 2) * 3} 4 Q ${x + (idx - 2)} 58 ${x - (idx - 2) * 2.5} 116`}
                fill="none"
                stroke={idx % 2 === 1 ? '#dc2626' : '#3a414d'}
                strokeWidth={idx === 2 ? '2.2' : '1.4'}
                strokeLinecap="round"
                strokeDasharray="125"
                filter={`url(#inkRough-${uid})`}
                style={{ animation: `tribeSlashDraw 380ms ease-out ${idx * 22}ms both` }}
              />
            ))}
            {/* Fan of 6 tattered dark-charcoal razor feathers plunging downward */}
            {[
              { x: 20, y: 48, rot: -16, delay: '24ms', sc: 0.85 },
              { x: 37, y: 58, rot: -9, delay: '0ms', sc: 0.96 },
              { x: 53, y: 66, rot: -2, delay: '14ms', sc: 1.08 },
              { x: 69, y: 64, rot: 5, delay: '26ms', sc: 1.04 },
              { x: 85, y: 56, rot: 12, delay: '38ms', sc: 0.94 },
              { x: 100, y: 46, rot: 19, delay: '50ms', sc: 0.82 },
            ].map((f, idx) => (
              <g key={idx} transform={`translate(${f.x} ${f.y}) rotate(${f.rot}) scale(${f.sc})`}>
                <g
                  filter={`url(#inkRough-${uid})`}
                  style={{
                    transformOrigin: '0px 0px',
                    animation: `tribeFeatherPlume 440ms cubic-bezier(0.16, 1, 0.3, 1) ${f.delay} both`,
                  }}
                >
                  {/* Tapered frayed dark-ink raven feather (no cartoon border) */}
                  <path
                    d="M 0 -34 C 5 -20, 7 -4, 4 12 L 1.5 8 L 3.5 18 L 0 33 L -3.5 17 L -1.5 9 L -5 14 C -7 -4, -5 -20, 0 -34 Z"
                    fill={`url(#inkMetal-${uid})`}
                    opacity="0.94"
                  />
                  {/* Thin arterial crimson quill & barbed red blade tip */}
                  <line x1="0" y1="-30" x2="0" y2="28" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M -2.2 14 L 0 32 L 2.2 14 Z" fill="#ef4444" opacity="0.9" />
                </g>
              </g>
            ))}
          </g>
        )}

        {/* 5. INSECT: Two short razor-thin inward chitin pincer slices */}
        {styleType === 'insect' && (
          <g>
            {/* Tight crimson shear bloom where pincers cross */}
            <ellipse
              cx="60"
              cy="60"
              rx="19"
              ry="26"
              fill={`url(#bruiseBloom-${uid})`}
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 400ms ease-out 85ms both' }}
            />
            {/* Left razor-tapered serrated chitin sickle slicing sharply inward */}
            <g
              filter={`url(#inkRough-${uid})`}
              style={{ transformOrigin: '24px 86px', animation: 'tribePincerLeft 420ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
            >
              <path
                d="M 18 90 C 12 63, 25 36, 62 26 C 46 39, 34 54, 34 74 L 38 66 L 32 78 L 28 89 Z"
                fill="#12151a"
                opacity="0.72"
                filter={`url(#smokeBlur-${uid})`}
              />
              <path
                d="M 20 88 C 16 63, 28 38, 63 27 C 46 39, 36 52, 41 56 L 34 61 L 41 66 L 33 74 C 29 81, 25 87, 20 88 Z"
                fill={`url(#inkMetal-${uid})`}
              />
              <path
                d="M 23 84 C 22 61, 34 41, 63 28"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
            </g>
            {/* Right razor-tapered serrated chitin sickle slicing sharply inward */}
            <g
              filter={`url(#inkRough-${uid})`}
              style={{ transformOrigin: '96px 86px', animation: 'tribePincerRight 420ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
            >
              <path
                d="M 102 90 C 108 63, 95 36, 58 26 C 74 39, 86 54, 86 74 L 82 66 L 88 78 L 92 89 Z"
                fill="#12151a"
                opacity="0.72"
                filter={`url(#smokeBlur-${uid})`}
              />
              <path
                d="M 100 88 C 104 63, 92 38, 57 27 C 74 39, 84 52, 79 56 L 86 61 L 79 66 L 87 74 C 91 81, 95 87, 100 88 Z"
                fill={`url(#inkMetal-${uid})`}
              />
              <path
                d="M 97 84 C 98 61, 86 41, 57 28"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
            </g>
            {/* Razor X pinch-shear flash right at the crossing tips */}
            <path
              d="M 46 42 L 74 74 M 74 42 L 46 74"
              stroke="#fca5a5"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter={`url(#inkRough-${uid})`}
              style={{ transformOrigin: '60px 58px', animation: 'tribeImpactFlash 330ms ease-out 100ms both' }}
            />
          </g>
        )}

        {/* 6. REPTILE: Heavy blunt-force tail swipe kinetic smear & shockwave impact */}
        {styleType === 'reptile' && (
          <g transform={`translate(60 60) scale(${flipX} 1) translate(-60 -60)`}>
            {/* Deep crimson & charcoal blunt-trauma burst at impact */}
            <circle
              cx="66"
              cy="60"
              r="38"
              fill={`url(#bruiseBloom-${uid})`}
              style={{ transformOrigin: '66px 60px', animation: 'tribeImpactFlash 450ms ease-out 75ms both' }}
            />
            {/* Shattered concave blunt-force shock arcs */}
            <g filter={`url(#inkRough-${uid})`}>
              <path
                d="M 74 22 C 95 38, 99 78, 74 98"
                fill="none"
                stroke="#3e4552"
                strokeWidth="5.5"
                strokeLinecap="round"
                style={{ transformOrigin: '78px 60px', animation: 'tribeShockRing 430ms cubic-bezier(0.16, 1, 0.3, 1) 80ms both' }}
              />
              <path
                d="M 81 30 C 98 44, 100 74, 81 90"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.3"
                strokeLinecap="round"
                style={{ transformOrigin: '83px 60px', animation: 'tribeShockRing 410ms cubic-bezier(0.16, 1, 0.3, 1) 92ms both' }}
              />
            </g>
            {/* Heavy kinetic dark-smoke tail-whip smear (raw painterly motion blur, zero cartoon box!) */}
            <g style={{ transformOrigin: '12px 78px', animation: 'tribeTailWhip 450ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              <path
                d="M 0 78 Q 50 32 114 52 Q 64 78 4 94 Z"
                fill="#191d24"
                opacity="0.76"
                filter={`url(#smokeBlur-${uid})`}
              />
              <path
                d="M 2 70 Q 52 39 112 54 C 116 56, 115 64, 107 66 Q 52 61 4 86 Z"
                fill={`url(#inkSlash-${uid})`}
                filter={`url(#inkRough-${uid})`}
              />
              {/* Leading blunt-impact crimson kinetic streak */}
              <path
                d="M 14 66 Q 58 44 111 55"
                fill="none"
                stroke={`url(#bloodCut-${uid})`}
                strokeWidth="3.2"
                strokeLinecap="round"
                filter={`url(#inkRough-${uid})`}
              />
            </g>
            {/* Jagged flung stone/scale impact splinters */}
            {[
              { d: 'M 88 30 L 97 26 L 93 34 Z', c: '#48505e' },
              { d: 'M 98 56 L 111 53 L 103 62 Z', c: '#dc2626' },
              { d: 'M 86 84 L 98 89 L 90 92 Z', c: '#323842' },
            ].map((sh, i) => (
              <path
                key={i}
                d={sh.d}
                fill={sh.c}
                style={{ animation: `tribeImpactFlash 380ms ease-out ${88 + i * 20}ms both` }}
              />
            ))}
          </g>
        )}

        {/* 7. VERMIN: 3 perpendicular rapid diagonal bursts of 2 curved stacked razor gashes */}
        {styleType === 'vermin' && (
          <g>
            {[
              { rot: 38, flip: 1, dy: -8, delay: '0ms' },
              { rot: -52, flip: -1, dy: 0, delay: '95ms' },
              { rot: 38, flip: 1, dy: 12, delay: '190ms' },
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
                      {/* Smoky ink wake */}
                      <path
                        d="M 8 64 Q 60 47 112 61 Q 62 58 14 68 Z"
                        fill="#14171c"
                        opacity="0.68"
                        filter={`url(#smokeBlur-${uid})`}
                      />
                      {/* Distressed razor charcoal slice */}
                      <path
                        d="M 10 63 Q 60 48 110 61 Q 62 55 14 66 Z"
                        fill={`url(#inkSlash-${uid})`}
                        filter={`url(#inkRough-${uid})`}
                      />
                      {/* Arterial crimson core gash */}
                      <path
                        d="M 16 62 Q 60 50 108 61"
                        fill="none"
                        stroke={`url(#bloodCut-${uid})`}
                        strokeWidth={sIdx === 0 ? '2.1' : '1.8'}
                        strokeLinecap="round"
                        strokeDasharray="110"
                        filter={`url(#inkRough-${uid})`}
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
