import React from 'react';
import { MapNodeType } from '../data/mapGenerator';

export type FigurineKind = MapNodeType | 'player' | 'obscured';

/**
 * Shared SVG material gradients for all carved bone/ivory, tarnished-brass,
 * forged-iron, and crimson-wax tabletop map figurines. Render once inside
 * MapScreen's hidden <svg><defs> block to avoid per-node gradient duplication.
 */
export const MapFigurineSharedDefs: React.FC = () => (
  <>
    {/* Warm Hand-Carved Bone / Ivory Material (Matches Original Player Pawn!) */}
    <linearGradient id="figIvory" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f6eedc" />
      <stop offset="48%" stopColor="#cfbda0" />
      <stop offset="100%" stopColor="#6a5944" />
    </linearGradient>

    {/* Aged Darker Bone / Horn Material (For Combat / Elite / Boss Contrast) */}
    <linearGradient id="figBoneAged" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#e5d6ba" />
      <stop offset="52%" stopColor="#a99476" />
      <stop offset="100%" stopColor="#4c3e2f" />
    </linearGradient>

    {/* Tarnished Forged Brass Pedestal & Fittings */}
    <linearGradient id="figBrass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#52381e" />
      <stop offset="42%" stopColor="#d4aa67" />
      <stop offset="68%" stopColor="#9c733a" />
      <stop offset="100%" stopColor="#3a2512" />
    </linearGradient>

    {/* Dark Burnished Crimson-Bronze Pedestal (For Combat / Elite / Boss Pieces) */}
    <linearGradient id="figBrassCombat" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#381614" />
      <stop offset="42%" stopColor="#b05c44" />
      <stop offset="70%" stopColor="#732e24" />
      <stop offset="100%" stopColor="#260c0b" />
    </linearGradient>

    {/* Hammered Forged Iron / Steel Blades & Anvil */}
    <linearGradient id="figIron" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#cfc8bf" />
      <stop offset="44%" stopColor="#665d56" />
      <stop offset="100%" stopColor="#26201d" />
    </linearGradient>

    {/* Deep Arterial Crimson Wax / Blood Fill */}
    <linearGradient id="figCrimson" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#c92a2a" />
      <stop offset="52%" stopColor="#7c1518" />
      <stop offset="100%" stopColor="#360608" />
    </linearGradient>

    {/* Warm Candle / Brazier Flame Core */}
    <linearGradient id="figFlame" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stopColor="#b91c1c" />
      <stop offset="50%" stopColor="#ea580c" />
      <stop offset="100%" stopColor="#fde68a" />
    </linearGradient>

    {/* Weathered Dark Basalt Stone (For Obscured / Eroded Pieces) */}
    <linearGradient id="figStone" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#5d5752" />
      <stop offset="55%" stopColor="#342f2c" />
      <stop offset="100%" stopColor="#161312" />
    </linearGradient>
  </>
);

interface MapFigurineTokenProps {
  kind: FigurineKind;
  className?: string;
  /** Optional silhouette-only mode used to render the screen-blended ember aura glow behind reachable figurines */
  glowSilhouette?: boolean;
  glowColor?: string;
}

const OUTLINE = '#221811';

export const MapFigurineToken: React.FC<MapFigurineTokenProps> = ({
  kind,
  className = 'w-8 h-10',
  glowSilhouette = false,
  glowColor,
}) => {
  const isHostile = kind === 'combat' || kind === 'elite_combat' || kind === 'boss';
  const baseFill = glowSilhouette
    ? glowColor || 'currentColor'
    : isHostile
      ? 'url(#figBrassCombat)'
      : 'url(#figBrass)';
  const ivoryFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figIvory)';
  const agedFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figBoneAged)';
  const ironFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figIron)';
  const crimsonFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figCrimson)';
  const flameFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figFlame)';
  const stoneFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figStone)';
  const strokeCol = glowSilhouette ? glowColor || 'currentColor' : OUTLINE;

  const renderPedestal = (wide = false) => (
    <g>
      <ellipse
        cx="16"
        cy="35.2"
        rx={wide ? 10.6 : 9.2}
        ry={wide ? 3.1 : 2.7}
        fill={baseFill}
        stroke={strokeCol}
        strokeWidth="1"
      />
      {!glowSilhouette && (
        <ellipse
          cx="16"
          cy="33.7"
          rx={wide ? 8.4 : 7.2}
          ry="1.6"
          fill="none"
          stroke={isHostile ? '#e8a28e' : '#f3d8a3'}
          strokeWidth="0.55"
          opacity="0.55"
        />
      )}
    </g>
  );

  const renderBody = () => {
    switch (kind) {
      case 'player':
        return (
          <g>
            {renderPedestal(false)}
            {/* Tapered Carved Ivory Pawn Body */}
            <path
              d="M 9.2 34.2 C 10.2 26.8, 11.9 21.2, 13.1 17.5 L 18.9 17.5 C 20.1 21.2, 21.8 26.8, 22.8 34.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {/* Turned Collar Ring */}
            <ellipse cx="16" cy="17.2" rx="4.6" ry="1.5" fill={glowSilhouette ? ivoryFill : '#dfd0b4'} stroke={strokeCol} strokeWidth="0.95" />
            {/* Spherical Ivory Crown */}
            <circle cx="16" cy="10.8" r="5.1" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.05" />
            {!glowSilhouette && (
              <>
                {/* Specular Ivory Highlight */}
                <path d="M 13.2 8.2 A 3.4 3.4 0 0 1 16.4 6.8" fill="none" stroke="#fffaf0" strokeWidth="1.1" strokeLinecap="round" opacity="0.72" />
                {/* Crimson Wax Seal Chest Boss */}
                <circle cx="16" cy="26.8" r="1.85" fill={crimsonFill} stroke="#2d0708" strokeWidth="0.6" />
              </>
            )}
          </g>
        );

      case 'start':
        return (
          <g>
            {renderPedestal(false)}
            {/* Carved Bone Milestone Obelisk */}
            <path
              d="M 10.2 34.2 L 11.8 14.5 L 16 8.5 L 20.2 14.5 L 21.8 34.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {/* Brass Compass Finial */}
            <polygon
              points="16,2.8 17.7,7 21.8,8.5 17.7,10 16,14.2 14.3,10 10.2,8.5 14.3,7"
              fill={baseFill}
              stroke={strokeCol}
              strokeWidth="0.85"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <line x1="16" y1="16" x2="16" y2="30.5" stroke="#5e4b38" strokeWidth="0.8" opacity="0.65" />
                <circle cx="16" cy="8.5" r="1.4" fill={crimsonFill} stroke="#2a0607" strokeWidth="0.5" />
                <circle cx="16" cy="24.5" r="1.4" fill={crimsonFill} stroke="#2a0607" strokeWidth="0.5" />
              </>
            )}
          </g>
        );

      case 'combat':
        return (
          <g>
            {renderPedestal(false)}
            {/* Crossed Forged-Iron Blades Behind Shield */}
            <path
              d="M 7.2 6.8 L 10.2 5.6 L 23.2 25.5 L 20.5 27 Z"
              fill={ironFill}
              stroke={strokeCol}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            <path
              d="M 24.8 6.8 L 21.8 5.6 L 8.8 25.5 L 11.5 27 Z"
              fill={ironFill}
              stroke={strokeCol}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <line x1="8.8" y1="6.8" x2="13.2" y2="13.5" stroke="#f0ebe4" strokeWidth="0.7" strokeLinecap="round" opacity="0.72" />
                <line x1="23.2" y1="6.8" x2="18.8" y2="13.5" stroke="#f0ebe4" strokeWidth="0.7" strokeLinecap="round" opacity="0.72" />
              </>
            )}
            {/* Crossguards */}
            <line x1="6.4" y1="9.8" x2="11.4" y2="12.6" stroke={baseFill} strokeWidth="2.1" strokeLinecap="round" />
            <line x1="25.6" y1="9.8" x2="20.6" y2="12.6" stroke={baseFill} strokeWidth="2.1" strokeLinecap="round" />
            {/* Carved Bone Heraldic Buckler Mounted on Pedestal */}
            <path
              d="M 9.6 14.2 L 22.4 14.2 L 22.4 23.2 C 22.4 28.4, 19.2 31.8, 16 34 C 12.8 31.8, 9.6 28.4, 9.6 23.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <path d="M 11.6 16.2 L 20.4 16.2 L 20.4 22.6 C 20.4 26.6, 18.2 29.4, 16 31.2 C 13.8 29.4, 11.6 26.6, 11.6 22.6 Z" fill="none" stroke="#6c563f" strokeWidth="0.7" opacity="0.65" />
                <polygon points="16,18.2 19,22.2 16,26.4 13,22.2" fill={crimsonFill} stroke="#2c0507" strokeWidth="0.65" />
              </>
            )}
          </g>
        );

      case 'elite_combat':
        return (
          <g>
            {renderPedestal(true)}
            {/* Armored Shoulders & Fluted Torso */}
            <path
              d="M 8.4 34 C 9.4 27, 10.6 22.5, 11.8 19.2 L 20.2 19.2 C 21.4 22.5, 22.6 27, 23.6 34 Z"
              fill={agedFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {/* Sweeping War Horns */}
            <path
              d="M 10.5 14.5 C 6.2 12.8, 4.6 8.5, 6.2 4.2 C 7.4 7.6, 9.2 9.8, 12 10.8 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            <path
              d="M 21.5 14.5 C 25.8 12.8, 27.4 8.5, 25.8 4.2 C 24.6 7.6, 22.8 9.8, 20 10.8 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            {/* Carved War-Skull Helm */}
            <path
              d="M 10.6 13.4 C 10.6 9.5, 13 7.5, 16 7.5 C 19 7.5, 21.4 9.5, 21.4 13.4 C 21.4 16.4, 19.8 18.2, 18.6 19.4 L 13.4 19.4 C 12.2 18.2, 10.6 16.4, 10.6 13.4 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {/* Jagged Iron Crown Spires */}
            <path
              d="M 11.2 9.2 L 12.4 4.8 L 14.6 7.8 L 16 3.5 L 17.4 7.8 L 19.6 4.8 L 20.8 9.2 Z"
              fill={baseFill}
              stroke={strokeCol}
              strokeWidth="0.85"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <ellipse cx="13.8" cy="13.8" rx="1.3" ry="1.1" fill="#b91c1c" />
                <ellipse cx="18.2" cy="13.8" rx="1.3" ry="1.1" fill="#b91c1c" />
                <circle cx="16" cy="26.5" r="2.1" fill={crimsonFill} stroke="#2a0506" strokeWidth="0.65" />
              </>
            )}
          </g>
        );

      case 'boss':
        return (
          <g>
            {/* Stepped Grand Reliquary Pedestal */}
            <ellipse cx="16" cy="36.2" rx="12" ry="3.2" fill={baseFill} stroke={strokeCol} strokeWidth="1.05" />
            <ellipse cx="16" cy="33.8" rx="9.6" ry="2.2" fill={ironFill} stroke={strokeCol} strokeWidth="0.95" />
            {/* Sweeping Great Ritual Horns */}
            <path
              d="M 9.8 16.2 C 3.8 14.2, 2.2 7.8, 5.2 2.4 C 6.2 7.2, 8.6 10.2, 12.2 11.4 Z"
              fill={agedFill}
              stroke={strokeCol}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <path
              d="M 22.2 16.2 C 28.2 14.2, 29.8 7.8, 26.8 2.4 C 25.8 7.2, 23.4 10.2, 19.8 11.4 Z"
              fill={agedFill}
              stroke={strokeCol}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            {/* Towering Ribbed Ossuary Plinth Torso */}
            <path
              d="M 8.2 33.4 C 9.2 26.8, 10.6 22.4, 11.6 19.6 L 20.4 19.6 C 21.4 22.4, 22.8 26.8, 23.8 33.4 Z"
              fill={agedFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {/* Brass Collar Gorget */}
            <path d="M 10.6 19.5 Q 16 22.6 21.4 19.5 L 20.6 22.2 Q 16 24.8 11.4 22.2 Z" fill={baseFill} stroke={strokeCol} strokeWidth="0.85" />
            {/* Sovereign Carved Ivory Skull Head */}
            <path
              d="M 9.6 13.6 C 9.6 8.8, 12.5 6.4, 16 6.4 C 19.5 6.4, 22.4 8.8, 22.4 13.6 C 22.4 16.6, 20.6 18.6, 19.4 20 L 12.6 20 C 11.4 18.6, 9.6 16.6, 9.6 13.6 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            {/* Crown Spires */}
            <path d="M 11.6 7.4 L 13 3.2 L 14.8 6.4 L 16 1.8 L 17.2 6.4 L 19 3.2 L 20.4 7.4 Z" fill={baseFill} stroke={strokeCol} strokeWidth="0.85" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <circle cx="13.4" cy="13.6" r="1.65" fill="#dc2626" stroke="#280405" strokeWidth="0.55" />
                <circle cx="18.6" cy="13.6" r="1.65" fill="#dc2626" stroke="#280405" strokeWidth="0.55" />
                <circle cx="13.4" cy="13.5" r="0.6" fill="#fecaca" />
                <circle cx="18.6" cy="13.5" r="0.6" fill="#fecaca" />
                <path d="M 14.2 18.2 L 14.2 20 M 16 18 L 16 20 M 17.8 18.2 L 17.8 20" stroke="#2a1d15" strokeWidth="0.85" />
                <polygon points="16,24.4 18.8,27.6 16,30.8 13.2,27.6" fill={crimsonFill} stroke="#dfba7c" strokeWidth="0.7" />
              </>
            )}
          </g>
        );

      case 'campfire':
        return (
          <g>
            {renderPedestal(false)}
            {/* Fluted Carved Bone Brazier Stem */}
            <path
              d="M 11.2 34.2 L 13.2 23.2 L 18.8 23.2 L 20.8 34.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            {/* Sculpted Flame Plume */}
            <path
              d="M 16 4.8 C 19.8 10.2, 22.4 13.5, 21.8 18.2 C 21.4 20.5, 19 22, 16 22 C 13 22, 10.6 20.5, 10.2 18.2 C 9.6 14.2, 11.4 11.4, 13.2 9.4 C 13.4 11.6, 14.5 12.4, 15.2 11.8 C 15.2 9.2, 15.4 6.8, 16 4.8 Z"
              fill={flameFill}
              stroke={strokeCol}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <path
                d="M 16 11.5 C 17.8 14.2, 18.6 16.4, 18 18.6 C 17.4 20, 14.6 20, 14 18.6 C 13.5 16.8, 14.5 14.2, 16 11.5 Z"
                fill="#fef08a"
                opacity="0.85"
              />
            )}
            {/* Hammered Iron & Brass Firebowl */}
            <path
              d="M 8.2 19.2 L 23.8 19.2 L 21.4 24.4 L 10.6 24.4 Z"
              fill={ironFill}
              stroke={strokeCol}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <line x1="9.2" y1="20.6" x2="22.8" y2="20.6" stroke="#d4aa67" strokeWidth="0.9" opacity="0.75" />
            )}
          </g>
        );

      case 'altar':
        return (
          <g>
            {renderPedestal(true)}
            {/* Carved Ivory Altar Slab & Twin Legs */}
            <path
              d="M 7.8 20.2 L 24.2 20.2 L 23.2 24.2 L 21.4 24.2 L 22.4 34 L 9.6 34 L 10.6 24.2 L 8.8 24.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {/* Upright Ritual Sacrificial Dagger */}
            <path
              d="M 16 4.8 L 18.2 13.4 L 16 19.5 L 13.8 13.4 Z"
              fill={ironFill}
              stroke={strokeCol}
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <line x1="16" y1="6.2" x2="16" y2="12.8" stroke="#f2ede6" strokeWidth="0.75" strokeLinecap="round" opacity="0.78" />
            )}
            <line x1="12.4" y1="13.6" x2="19.6" y2="13.6" stroke={baseFill} strokeWidth="2.2" strokeLinecap="round" />
            {!glowSilhouette && (
              /* Draped Crimson Altar Runner */
              <path d="M 13.2 20.4 L 18.8 20.4 L 18.4 30.8 L 16 28.8 L 13.6 30.8 Z" fill={crimsonFill} stroke="#2a0506" strokeWidth="0.65" />
            )}
          </g>
        );

      case 'carving':
        return (
          <g>
            {renderPedestal(false)}
            {/* Notched Upright Carved Bone Stele */}
            <path
              d="M 9.6 34.2 L 9.6 11.4 L 12.6 8.2 L 19.4 8.2 L 22.4 11.4 L 22.4 34.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <rect x="11.6" y="10.8" width="8.8" height="20.6" rx="1" fill="none" stroke="#6c563f" strokeWidth="0.7" strokeDasharray="2.2 1.6" opacity="0.72" />
                {/* Carved Staring Eye */}
                <path d="M 11.6 20.5 Q 16 15.6 20.4 20.5 Q 16 25.4 11.6 20.5 Z" fill="#180d0b" stroke="#423225" strokeWidth="0.85" />
                <circle cx="16" cy="20.5" r="2.1" fill={crimsonFill} stroke="#e2be7d" strokeWidth="0.55" />
                <circle cx="16" cy="20.5" r="0.8" fill="#120405" />
              </>
            )}
          </g>
        );

      case 'cost':
        return (
          <g>
            {renderPedestal(false)}
            {/* Turned Brass & Ivory Chalice Stem */}
            <path d="M 13.2 34 L 14.5 23.2 L 17.5 23.2 L 18.8 34 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1" />
            <ellipse cx="16" cy="24.2" rx="3.4" ry="1.1" fill={baseFill} stroke={strokeCol} strokeWidth="0.75" />
            {/* Bulbous Crimson Blood Vial / Chalice Bowl */}
            <path
              d="M 16 6.2 C 16 6.2, 22.6 13.6, 22.6 18.4 C 22.6 22.2, 19.6 24.4, 16 24.4 C 12.4 24.4, 9.4 22.2, 9.4 18.4 C 9.4 13.6, 16 6.2, 16 6.2 Z"
              fill={crimsonFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <ellipse cx="13.5" cy="17.8" rx="1.3" ry="2.6" transform="rotate(-14 13.5 17.8)" fill="#fda4af" opacity="0.58" />
                <circle cx="16" cy="28.6" r="1.2" fill={baseFill} />
              </>
            )}
          </g>
        );

      case 'bonelord':
        return (
          <g>
            {renderPedestal(false)}
            {/* Fluted Bone Neck Pillar */}
            <path d="M 11.4 34 L 13 21.5 L 19 21.5 L 20.6 34 Z" fill={agedFill} stroke={strokeCol} strokeWidth="1" />
            {/* Sweeping Ram / Bull Horns */}
            <path
              d="M 11.5 13.2 C 5.8 12.4, 4.4 7.4, 6.8 3.6 C 7.6 7.4, 9.4 9.5, 12.6 10.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            <path
              d="M 20.5 13.2 C 26.2 12.4, 27.6 7.4, 25.2 3.6 C 24.4 7.4, 22.6 9.5, 19.4 10.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            {/* Elongated Horned Skull */}
            <path
              d="M 11.2 11.2 C 11.2 8.2, 13.4 7, 16 7 C 18.6 7, 20.8 8.2, 20.8 11.2 L 19.2 22.4 L 12.8 22.4 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <circle cx="13.8" cy="14.2" r="1.25" fill="#180e0a" />
                <circle cx="18.2" cy="14.2" r="1.25" fill="#180e0a" />
                <polygon points="16,9.2 17.5,11.2 16,13.2 14.5,11.2" fill={baseFill} />
              </>
            )}
          </g>
        );

      case 'mycologist':
        return (
          <g>
            {renderPedestal(true)}
            {/* Shared Fused Ivory Pawn Body */}
            <path
              d="M 8.2 34.2 C 9.2 27.2, 10.4 22.2, 11.2 18.4 L 20.8 18.4 C 21.6 22.2, 22.8 27.2, 23.8 34.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {/* Conjoined Twin Carved Ivory Heads */}
            <circle cx="12.6" cy="12.4" r="4.4" fill={ivoryFill} stroke={strokeCol} strokeWidth="1" />
            <circle cx="19.4" cy="12.4" r="4.4" fill={agedFill} stroke={strokeCol} strokeWidth="1" />
            {!glowSilhouette && (
              <>
                {/* Vertical Crimson Surgical Stitch Seam */}
                <line x1="16" y1="8.8" x2="16" y2="31.5" stroke="#5c0a0d" strokeWidth="1.15" />
                {[12, 16.5, 21.5, 26.5].map(y => (
                  <line key={y} x1="13.8" y1={y} x2="18.2" y2={y} stroke="#b91c1c" strokeWidth="1" strokeLinecap="round" />
                ))}
              </>
            )}
          </g>
        );

      case 'goobert':
        return (
          <g>
            {renderPedestal(true)}
            {/* Heavy Stamp Block Base */}
            <path d="M 8.6 23.2 L 23.4 23.2 L 24.4 33.8 L 7.6 33.8 Z" fill={agedFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            {/* Turned Ivory Stamp Handle */}
            <path d="M 13.4 23.2 C 13.8 18.5, 13.4 15.2, 12.2 12.4 C 11.6 9.5, 13.6 7.2, 16 7.2 C 18.4 7.2, 20.4 9.5, 19.8 12.4 C 18.6 15.2, 18.2 18.5, 18.6 23.2 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            {/* Brass Collar Band */}
            <rect x="12.4" y="21.4" width="7.2" height="2.4" rx="0.7" fill={baseFill} stroke={strokeCol} strokeWidth="0.75" />
            {!glowSilhouette && (
              <>
                <rect x="8.8" y="30.6" width="14.4" height="2.6" fill={crimsonFill} opacity="0.88" />
                <circle cx="16" cy="11.2" r="1.2" fill="#fffaf0" opacity="0.6" />
              </>
            )}
          </g>
        );

      case 'cave':
        return (
          <g>
            {renderPedestal(true)}
            {/* Carved Monolith Barrow Archway */}
            <path
              d="M 7.8 34 L 8.6 18.8 C 9.2 11.2, 12.2 7.8, 16 7.8 C 19.8 7.8, 22.8 11.2, 23.4 18.8 L 24.2 34 Z"
              fill={agedFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                {/* Deep Obsidian Cavern Opening */}
                <path d="M 11.4 34 L 11.8 21.8 C 12 16.4, 13.8 14, 16 14 C 18.2 14, 20 16.4, 20.2 21.8 L 20.6 34 Z" fill="#090606" stroke="#2a1f18" strokeWidth="0.85" />
                {/* Glowing Watching Eye Inside Dark Cave */}
                <circle cx="16" cy="22.5" r="2.1" fill="#e5b865" opacity="0.92" />
                <circle cx="16" cy="22.5" r="0.85" fill="#1b0e08" />
              </>
            )}
          </g>
        );

      case 'choice':
        return (
          <g>
            {renderPedestal(true)}
            {/* Three Fanned Miniature Carved Ivory Cards */}
            <g transform="rotate(-17 16 30)">
              <rect x="11.4" y="10.2" width="9.2" height="19.5" rx="1.2" fill={agedFill} stroke={strokeCol} strokeWidth="0.95" />
            </g>
            <g transform="rotate(17 16 30)">
              <rect x="11.4" y="10.2" width="9.2" height="19.5" rx="1.2" fill={agedFill} stroke={strokeCol} strokeWidth="0.95" />
            </g>
            <rect x="11.2" y="8.4" width="9.6" height="21.8" rx="1.2" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.05" />
            {/* Brass Card Clip */}
            <rect x="11.6" y="29.2" width="8.8" height="4.8" rx="0.8" fill={baseFill} stroke={strokeCol} strokeWidth="0.8" />
            {!glowSilhouette && (
              <polygon points="16,14.5 18.6,18.8 16,23.1 13.4,18.8" fill={crimsonFill} stroke="#2c0608" strokeWidth="0.6" />
            )}
          </g>
        );

      case 'totem':
        return (
          <g>
            {renderPedestal(false)}
            {/* Lower Stacked Effigy Base */}
            <path d="M 10 34 L 11 25.4 L 21 25.4 L 22 34 Z" fill={agedFill} stroke={strokeCol} strokeWidth="1" strokeLinejoin="round" />
            {/* Middle Carved Torso Block */}
            <rect x="11.2" y="16.8" width="9.6" height="8.6" rx="1" fill={ivoryFill} stroke={strokeCol} strokeWidth="1" />
            {/* Top Sculpted Effigy Mask Head */}
            <path d="M 9.6 10.6 L 12.4 7.4 L 19.6 7.4 L 22.4 10.6 L 20.8 16.8 L 11.2 16.8 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <circle cx="13.8" cy="12" r="1.05" fill="#1a110c" />
                <circle cx="18.2" cy="12" r="1.05" fill="#1a110c" />
                <circle cx="16" cy="21" r="1.6" fill={crimsonFill} stroke="#2a0607" strokeWidth="0.55" />
                <line x1="11.6" y1="25.4" x2="20.4" y2="25.4" stroke="#d4aa67" strokeWidth="1.1" />
              </>
            )}
          </g>
        );

      case 'items':
        return (
          <g>
            {renderPedestal(true)}
            {/* Arched Brass Carry Handle */}
            <path d="M 12.2 16.2 C 12.2 10.8, 19.8 10.8, 19.8 16.2" fill="none" stroke={baseFill} strokeWidth="2.2" strokeLinecap="round" />
            {/* Carved Bone & Brass Reliquary Satchel/Chest */}
            <path
              d="M 8.4 16.8 L 23.6 16.8 L 24.4 33.8 L 7.6 33.8 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <line x1="8" y1="22.2" x2="24" y2="22.2" stroke="#4a3421" strokeWidth="1.1" />
                <rect x="11.2" y="16.8" width="2" height="16.8" fill={baseFill} opacity="0.85" />
                <rect x="18.8" y="16.8" width="2" height="16.8" fill={baseFill} opacity="0.85" />
                <circle cx="16" cy="22.2" r="2.2" fill={crimsonFill} stroke="#dfba7c" strokeWidth="0.65" />
              </>
            )}
          </g>
        );

      case 'anvil':
        return (
          <g>
            {renderPedestal(true)}
            {/* Forged-Iron Anvil Waist & Base */}
            <path d="M 10.4 34 L 12.2 23.6 L 19.8 23.6 L 21.6 34 Z" fill={ironFill} stroke={strokeCol} strokeWidth="1" strokeLinejoin="round" />
            {/* Classic Horned Blacksmith Anvil Crown */}
            <path
              d="M 5.4 16.8 L 22.8 16.8 L 27.6 19.8 L 22.4 23.8 L 11.2 23.8 C 8.4 23.8, 6.2 21.2, 5.4 16.8 Z"
              fill={ironFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <line x1="7.2" y1="18.2" x2="22.4" y2="18.2" stroke="#d8d1c7" strokeWidth="0.9" opacity="0.65" />
                <circle cx="16" cy="14.2" r="1.4" fill={flameFill} opacity="0.9" />
              </>
            )}
          </g>
        );

      case 'flock':
        return (
          <g>
            {renderPedestal(false)}
            {/* Sculpted Hooded Lamb/Ram Bust */}
            <path
              d="M 9.2 34 C 10.2 27, 11.4 22.2, 12.4 19.2 L 19.6 19.2 C 20.6 22.2, 21.8 27, 22.8 34 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {/* Curled Side Wool-Horns */}
            <path d="M 11.2 12.2 C 7.2 11.8, 6.6 16.8, 10.4 17.4" fill={agedFill} stroke={strokeCol} strokeWidth="1" strokeLinecap="round" />
            <path d="M 20.8 12.2 C 24.8 11.8, 25.4 16.8, 21.6 17.4" fill={agedFill} stroke={strokeCol} strokeWidth="1" strokeLinecap="round" />
            {/* Lamb Head */}
            <path
              d="M 11.2 13 C 11.2 8.8, 13.4 7, 16 7 C 18.6 7, 20.8 8.8, 20.8 13 C 20.8 16.8, 18.8 20.4, 16 20.4 C 13.2 20.4, 11.2 16.8, 11.2 13 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <circle cx="13.8" cy="14" r="1" fill="#1c1410" />
                <circle cx="18.2" cy="14" r="1" fill="#1c1410" />
                <path d="M 16 9.2 L 16 12.4 M 14.5 10.8 L 17.5 10.8" stroke="#8f191d" strokeWidth="1.05" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'obscured':
      default:
        return (
          <g>
            {renderPedestal(false)}
            {/* Weathered Cracked Dark-Stone Monolith */}
            <path
              d="M 9.6 34.2 L 11 13.6 L 16 8.6 L 21 13.6 L 22.4 34.2 Z"
              fill={stoneFill}
              stroke={strokeCol}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <path d="M 11.2 18.5 L 15.2 21.4 L 13.8 25.5" fill="none" stroke="#0c0909" strokeWidth="0.9" />
                <text
                  x="16"
                  y="24.5"
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="Cinzel, serif"
                  fontWeight="700"
                  fill="#a6957e"
                  opacity="0.85"
                >
                  ?
                </text>
              </>
            )}
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 32 40"
      className={`${className} overflow-visible`}
      aria-hidden="true"
    >
      {renderBody()}
    </svg>
  );
};

export default MapFigurineToken;
