import React from 'react';
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
  const flipX = direction === 'left' ? -1 : 1;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-[-18%] z-[68] flex items-center justify-center overflow-visible select-none ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible"
        style={{
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.92)) drop-shadow(0 0 8px rgba(185,28,28,0.45))',
        }}
      >
        <defs>
          <linearGradient id={`dgMetal-${styleType}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b1f26" />
            <stop offset="48%" stopColor="#464d59" />
            <stop offset="82%" stopColor="#697280" />
            <stop offset="100%" stopColor="#262b33" />
          </linearGradient>
          <linearGradient id={`dgBlade-${styleType}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#181b20" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#3c434e" stopOpacity="0.96" />
            <stop offset="72%" stopColor="#5a6372" stopOpacity="1" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`redAccent-${styleType}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.15" />
            <stop offset="42%" stopColor="#dc2626" stopOpacity="0.95" />
            <stop offset="82%" stopColor="#ef4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={`redBruise-${styleType}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.72" />
            <stop offset="45%" stopColor="#7f1d1d" stopOpacity="0.44" />
            <stop offset="100%" stopColor="#181b20" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. NO TRIBE: Single swipe — 3 horizontal parallel curved claw slices */}
        {styleType === 'no_tribe' && (
          <g transform={`translate(60 60) scale(${flipX} 1) translate(-60 -60)`}>
            {[
              { dy: -24, delay: '0ms', sc: 0.94 },
              { dy: 0, delay: '32ms', sc: 1.06 },
              { dy: 24, delay: '64ms', sc: 0.92 },
            ].map((row, idx) => (
              <g key={idx} transform={`translate(0 ${row.dy})`}>
                <g
                  style={{
                    transformOrigin: '60px 60px',
                    animation: `tribeClawSweep 420ms cubic-bezier(0.16, 1, 0.3, 1) ${row.delay} both`,
                  }}
                >
                  {/* Broad dark-gray curved claw trail */}
                  <path
                    d="M 8 65 Q 58 46 114 59 Q 62 56 12 70 Z"
                    fill={`url(#dgBlade-${styleType})`}
                    stroke="#181b20"
                    strokeWidth="1.2"
                  />
                  {/* Razor crimson inner edge */}
                  <path
                    d="M 16 64 Q 60 49 112 59"
                    fill="none"
                    stroke={`url(#redAccent-${styleType})`}
                    strokeWidth={idx === 1 ? '3.0' : '2.3'}
                    strokeLinecap="round"
                    strokeDasharray="120"
                    style={{ animation: `tribeSlashDraw 360ms ease-out ${row.delay} both` }}
                  />
                  {/* Fine bright red-white tip streak */}
                  <path
                    d="M 62 52 Q 88 53 113 59"
                    fill="none"
                    stroke="#fca5a5"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </g>
              </g>
            ))}
            {/* Crimson impact flecks at exit tip */}
            {[
              { cx: 102, cy: 36, r: 2.2 },
              { cx: 110, cy: 58, r: 2.6 },
              { cx: 98, cy: 82, r: 1.9 },
            ].map((sp, i) => (
              <circle
                key={i}
                cx={sp.cx}
                cy={sp.cy}
                r={sp.r}
                fill={i === 1 ? '#ef4444' : '#b91c1c'}
                style={{ animation: `tribeImpactFlash 380ms ease-out ${50 + i * 25}ms both` }}
              />
            ))}
          </g>
        )}

        {/* 2. HOOVED: Single heavy cloven hoof stomp */}
        {styleType === 'hooved' && (
          <g>
            {/* Crimson kinetic shock bruise beneath impact */}
            <ellipse
              cx="60"
              cy="66"
              rx="42"
              ry="32"
              fill={`url(#redBruise-${styleType})`}
              style={{ transformOrigin: '60px 66px', animation: 'tribeImpactFlash 450ms ease-out 70ms both' }}
            />
            {/* Expanding dark-gray + red shockwave rings */}
            <ellipse
              cx="60"
              cy="68"
              rx="38"
              ry="24"
              fill="none"
              stroke="#4b5360"
              strokeWidth="4.5"
              style={{ transformOrigin: '60px 68px', animation: 'tribeShockRing 440ms cubic-bezier(0.16, 1, 0.3, 1) 75ms both' }}
            />
            <ellipse
              cx="60"
              cy="68"
              rx="32"
              ry="20"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.2"
              style={{ transformOrigin: '60px 68px', animation: 'tribeShockRing 420ms cubic-bezier(0.16, 1, 0.3, 1) 90ms both' }}
            />
            {/* Jagged dark-gray + crimson fracture cracks radiating from stomp */}
            <g style={{ transformOrigin: '60px 66px', animation: 'tribeImpactFlash 460ms ease-out 85ms both' }}>
              {[
                'M 34 58 L 14 48 L 6 54',
                'M 86 58 L 106 49 L 114 56',
                'M 38 78 L 22 94 L 14 92',
                'M 82 78 L 99 95 L 108 91',
                'M 60 88 L 56 106 L 63 114',
              ].map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="#232830" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={d} fill="none" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                </g>
              ))}
            </g>
            {/* Cloven Hoof Silhouette slamming down */}
            <g style={{ transformOrigin: '60px 62px', animation: 'tribeHoofStomp 460ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              {/* Left cloven toe */}
              <path
                d="M 56 30 C 40 30, 29 44, 30 62 C 31 76, 42 84, 54 83 C 56 82, 57 78, 56 70 L 56 30 Z"
                fill={`url(#dgMetal-${styleType})`}
                stroke="#14171c"
                strokeWidth="2.2"
              />
              {/* Right cloven toe */}
              <path
                d="M 64 30 C 80 30, 91 44, 90 62 C 89 76, 78 84, 66 83 C 64 82, 63 78, 64 70 L 64 30 Z"
                fill={`url(#dgMetal-${styleType})`}
                stroke="#14171c"
                strokeWidth="2.2"
              />
              {/* Red impact highlight rim around hoof outer edge & cleft */}
              <path
                d="M 32 62 C 34 74, 43 81, 53 80 M 88 62 C 86 74, 77 81, 67 80 M 60 34 L 60 82"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
            </g>
          </g>
        )}

        {/* 3. CANINE: Vertical teeth chomp */}
        {styleType === 'canine' && (
          <g>
            {/* Horizontal crimson bite seam burst */}
            <ellipse
              cx="60"
              cy="60"
              rx="46"
              ry="14"
              fill={`url(#redBruise-${styleType})`}
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 420ms ease-out 100ms both' }}
            />
            <line
              x1="14"
              y1="60"
              x2="106"
              y2="60"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 360ms ease-out 105ms both' }}
            />
            {/* Upper Fang Jaw snapping downward */}
            <g style={{ transformOrigin: '60px 30px', animation: 'tribeChompTop 440ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <path
                d="M 14 26 Q 60 12 106 26 L 96 48 L 87 30 L 76 58 L 65 32 L 60 49 L 55 32 L 44 58 L 33 30 L 24 48 Z"
                fill={`url(#dgMetal-${styleType})`}
                stroke="#14171c"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Red-stained fang tips & gumline */}
              <path
                d="M 24 48 L 28 38 M 44 58 L 48 44 M 76 58 L 72 44 M 96 48 L 92 38"
                stroke="#ef4444"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path d="M 18 25 Q 60 14 102 25" fill="none" stroke="#b91c1c" strokeWidth="2.4" strokeLinecap="round" />
            </g>
            {/* Lower Fang Jaw snapping upward */}
            <g style={{ transformOrigin: '60px 90px', animation: 'tribeChompBot 440ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <path
                d="M 16 94 Q 60 108 104 94 L 94 72 L 84 90 L 74 63 L 64 88 L 60 72 L 56 88 L 46 63 L 36 90 L 26 72 Z"
                fill={`url(#dgMetal-${styleType})`}
                stroke="#14171c"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M 26 72 L 30 82 M 46 63 L 50 76 M 74 63 L 70 76 M 94 72 L 90 82"
                stroke="#ef4444"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path d="M 20 95 Q 60 106 100 95" fill="none" stroke="#b91c1c" strokeWidth="2.4" strokeLinecap="round" />
            </g>
            {/* Red puncture sparks bursting left & right */}
            {[
              { cx: 14, cy: 56, r: 2.3 },
              { cx: 106, cy: 63, r: 2.4 },
              { cx: 44, cy: 60, r: 2.8 },
              { cx: 76, cy: 60, r: 2.8 },
            ].map((sp, i) => (
              <circle
                key={i}
                cx={sp.cx}
                cy={sp.cy}
                r={sp.r}
                fill="#ef4444"
                style={{ animation: `tribeImpactFlash 360ms ease-out 110ms both` }}
              />
            ))}
          </g>
        )}

        {/* 4. AVIAN: Multiple feathers plume downward strike */}
        {styleType === 'avian' && (
          <g>
            {/* Steep downward crimson wind-shear streaks */}
            {[24, 46, 74, 96].map((x, idx) => (
              <line
                key={`wind-${idx}`}
                x1={x + (idx - 1.5) * 4}
                y1="6"
                x2={x - (idx - 1.5) * 3}
                y2="114"
                stroke={idx % 2 === 0 ? '#dc2626' : '#525b68'}
                strokeWidth={idx === 1 || idx === 2 ? '2.4' : '1.6'}
                strokeLinecap="round"
                strokeDasharray="115"
                style={{ animation: `tribeSlashDraw 380ms ease-out ${idx * 24}ms both` }}
              />
            ))}
            {/* Fan of 6 sculpted dark-gray razor feathers plunging downward */}
            {[
              { x: 22, y: 50, rot: -18, delay: '20ms', sc: 0.86 },
              { x: 38, y: 58, rot: -10, delay: '0ms', sc: 0.98 },
              { x: 54, y: 66, rot: -3, delay: '12ms', sc: 1.08 },
              { x: 68, y: 64, rot: 5, delay: '24ms', sc: 1.04 },
              { x: 84, y: 56, rot: 13, delay: '36ms', sc: 0.94 },
              { x: 98, y: 48, rot: 21, delay: '50ms', sc: 0.84 },
            ].map((f, idx) => (
              <g key={idx} transform={`translate(${f.x} ${f.y}) rotate(${f.rot}) scale(${f.sc})`}>
                <g
                  style={{
                    transformOrigin: '0px 0px',
                    animation: `tribeFeatherPlume 440ms cubic-bezier(0.16, 1, 0.3, 1) ${f.delay} both`,
                  }}
                >
                  {/* Sculpted feather vane with notched barbs */}
                  <path
                    d="M 0 -30 C 8 -16, 9 2, 5 17 L 2 13 L 0 30 L -2 13 L -6 17 C -9 2, -8 -16, 0 -30 Z"
                    fill={`url(#dgMetal-${styleType})`}
                    stroke="#14171c"
                    strokeWidth="1.4"
                  />
                  {/* Crimson central quill & barbed red tip */}
                  <line x1="0" y1="-26" x2="0" y2="26" stroke="#dc2626" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M -3.5 11 L 0 29 L 3.5 11 Z" fill="#ef4444" opacity="0.94" />
                </g>
              </g>
            ))}
          </g>
        )}

        {/* 5. INSECT: Two short side-by-side inward slices / pincer chomp */}
        {styleType === 'insect' && (
          <g>
            {/* Tight crimson pinch-flash where mandibles shear together */}
            <ellipse
              cx="60"
              cy="60"
              rx="22"
              ry="30"
              fill={`url(#redBruise-${styleType})`}
              style={{ transformOrigin: '60px 60px', animation: 'tribeImpactFlash 400ms ease-out 90ms both' }}
            />
            {/* Left Curved Serrated Pincer slicing inward */}
            <g style={{ transformOrigin: '26px 86px', animation: 'tribePincerLeft 420ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <path
                d="M 22 90 C 12 68, 22 40, 56 30 C 44 42, 40 52, 48 56 L 41 61 L 50 67 L 42 74 C 36 80, 32 88, 22 90 Z"
                fill={`url(#dgMetal-${styleType})`}
                stroke="#14171c"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Short inward red slash arc */}
              <path
                d="M 26 84 C 24 62, 34 44, 57 32"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </g>
            {/* Right Curved Serrated Pincer slicing inward */}
            <g style={{ transformOrigin: '94px 86px', animation: 'tribePincerRight 420ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <path
                d="M 98 90 C 108 68, 98 40, 64 30 C 76 42, 80 52, 72 56 L 79 61 L 70 67 L 78 74 C 84 80, 88 88, 98 90 Z"
                fill={`url(#dgMetal-${styleType})`}
                stroke="#14171c"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M 94 84 C 96 62, 86 44, 63 32"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </g>
            {/* Crossed pinch-shear sparks at center */}
            <path
              d="M 50 42 L 70 76 M 70 42 L 50 76"
              stroke="#fca5a5"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ transformOrigin: '60px 59px', animation: 'tribeImpactFlash 340ms ease-out 105ms both' }}
            />
          </g>
        )}

        {/* 6. REPTILE: Heavy blunt-object tail swipe impact */}
        {styleType === 'reptile' && (
          <g transform={`translate(60 60) scale(${flipX} 1) translate(-60 -60)`}>
            {/* Blunt kinetic bruise & impact burst right at contact center */}
            <circle
              cx="64"
              cy="60"
              r="34"
              fill={`url(#redBruise-${styleType})`}
              style={{ transformOrigin: '64px 60px', animation: 'tribeImpactFlash 450ms ease-out 80ms both' }}
            />
            {/* Concave blunt-force shock arcs pushing outward */}
            <path
              d="M 74 26 C 92 40, 96 76, 74 96"
              fill="none"
              stroke="#525b68"
              strokeWidth="5"
              strokeLinecap="round"
              style={{ transformOrigin: '78px 60px', animation: 'tribeShockRing 430ms cubic-bezier(0.16, 1, 0.3, 1) 85ms both' }}
            />
            <path
              d="M 80 34 C 95 46, 97 72, 80 88"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.6"
              strokeLinecap="round"
              style={{ transformOrigin: '82px 60px', animation: 'tribeShockRing 410ms cubic-bezier(0.16, 1, 0.3, 1) 95ms both' }}
            />
            {/* Heavy Armored Tapered Whip-Tail sweeping bluntly across */}
            <g style={{ transformOrigin: '16px 76px', animation: 'tribeTailWhip 450ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              {/* Wide motion-blur wake */}
              <path
                d="M 4 76 Q 52 38 110 54 Q 62 72 6 88 Z"
                fill="#2b313a"
                opacity="0.72"
              />
              {/* Thick muscular scaled tail shaft */}
              <path
                d="M 4 70 Q 50 42 108 54 C 113 55, 113 63, 106 65 Q 52 60 6 84 Z"
                fill={`url(#dgMetal-${styleType})`}
                stroke="#14171c"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Dorsal scale ridges + crimson kinetic leading edge */}
              <path
                d="M 16 66 Q 58 46 108 55"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {[30, 48, 66, 84].map((rx, i) => (
                <path
                  key={i}
                  d={`M ${rx} ${59 - i * 2} L ${rx + 5} ${65 - i * 1.4}`}
                  stroke="#181b20"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
            </g>
            {/* Heavy impact debris blocks & red sparks */}
            {[
              { x: 88, y: 34, w: 6, h: 4, c: '#48505e' },
              { x: 98, y: 58, w: 8, h: 4, c: '#ef4444' },
              { x: 86, y: 84, w: 6, h: 4, c: '#363c46' },
            ].map((d, i) => (
              <rect
                key={i}
                x={d.x}
                y={d.y}
                width={d.w}
                height={d.h}
                rx="1"
                fill={d.c}
                transform={`rotate(${(i - 1) * 24} ${d.x} ${d.y})`}
                style={{ animation: `tribeImpactFlash 380ms ease-out ${90 + i * 22}ms both` }}
              />
            ))}
          </g>
        )}

        {/* 7. VERMIN: 3 perpendicular rapid diagonal 2-curved stacked slices */}
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
                {/* 2 parallel curved stacked slices per burst */}
                {[-9, 9].map((offsetY, sIdx) => (
                  <g key={sIdx} transform={`translate(0 ${offsetY})`}>
                    <g
                      style={{
                        transformOrigin: '60px 60px',
                        animation: `tribeVerminSlice 260ms cubic-bezier(0.16, 1, 0.3, 1) ${burst.delay} both`,
                      }}
                    >
                      <path
                        d="M 10 63 Q 60 47 110 61 Q 62 56 14 67 Z"
                        fill={`url(#dgBlade-${styleType})`}
                        stroke="#14171c"
                        strokeWidth="1"
                      />
                      <path
                        d="M 16 62 Q 60 49 108 61"
                        fill="none"
                        stroke={sIdx === 0 ? '#ef4444' : '#dc2626'}
                        strokeWidth="2.3"
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
