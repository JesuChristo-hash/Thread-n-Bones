import React from 'react';
import { MapNodeType } from '../data/mapGenerator';

export type FigurineKind = MapNodeType | 'player' | 'obscured';

/**
 * Shared SVG material gradients for all carved bone/ivory, tarnished-brass,
 * forged-iron, and distinct pigment-accented tabletop map figurines.
 */
export const MapFigurineSharedDefs: React.FC = () => (
  <>
    <linearGradient id="figIvory" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#faf3e3" />
      <stop offset="52%" stopColor="#d4c2a5" />
      <stop offset="100%" stopColor="#6f5d47" />
    </linearGradient>

    <linearGradient id="figBoneAged" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#e8dac0" />
      <stop offset="55%" stopColor="#a99476" />
      <stop offset="100%" stopColor="#4c3e2f" />
    </linearGradient>

    <linearGradient id="figBrass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#52381e" />
      <stop offset="42%" stopColor="#dfba78" />
      <stop offset="70%" stopColor="#9c733a" />
      <stop offset="100%" stopColor="#3a2512" />
    </linearGradient>

    <linearGradient id="figBrassCombat" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#3c1412" />
      <stop offset="42%" stopColor="#c95b45" />
      <stop offset="72%" stopColor="#7a261e" />
      <stop offset="100%" stopColor="#260a09" />
    </linearGradient>

    <linearGradient id="figIron" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#d9d2c9" />
      <stop offset="48%" stopColor="#69625c" />
      <stop offset="100%" stopColor="#26211e" />
    </linearGradient>

    <linearGradient id="figObsidian" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4c474c" />
      <stop offset="52%" stopColor="#262226" />
      <stop offset="100%" stopColor="#0f0d10" />
    </linearGradient>

    <linearGradient id="figCrimson" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#ef4444" />
      <stop offset="52%" stopColor="#991b1b" />
      <stop offset="100%" stopColor="#450a0a" />
    </linearGradient>

    <linearGradient id="figFlame" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stopColor="#dc2626" />
      <stop offset="52%" stopColor="#f97316" />
      <stop offset="100%" stopColor="#fef08a" />
    </linearGradient>

    <linearGradient id="figEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#5eead4" />
      <stop offset="52%" stopColor="#0d9488" />
      <stop offset="100%" stopColor="#064e3b" />
    </linearGradient>

    <linearGradient id="figViolet" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#d8b4fe" />
      <stop offset="52%" stopColor="#9333ea" />
      <stop offset="100%" stopColor="#3b0764" />
    </linearGradient>

    <linearGradient id="figAmber" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#fde68a" />
      <stop offset="52%" stopColor="#d97706" />
      <stop offset="100%" stopColor="#78350f" />
    </linearGradient>

    <linearGradient id="figBurlap" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#e6c488" />
      <stop offset="54%" stopColor="#a87c43" />
      <stop offset="100%" stopColor="#523718" />
    </linearGradient>

    <linearGradient id="figStone" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#635c56" />
      <stop offset="55%" stopColor="#36302d" />
      <stop offset="100%" stopColor="#161312" />
    </linearGradient>
  </>
);

interface MapFigurineTokenProps {
  kind: FigurineKind;
  className?: string;
  glowSilhouette?: boolean;
  glowColor?: string;
}

const OUTLINE = '#1d140e';

export const MapFigurineToken: React.FC<MapFigurineTokenProps> = ({
  kind,
  className = 'w-12 h-[58px]',
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
  const obsidianFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figObsidian)';
  const crimsonFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figCrimson)';
  const flameFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figFlame)';
  const emeraldFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figEmerald)';
  const violetFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figViolet)';
  const amberFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figAmber)';
  const burlapFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figBurlap)';
  const stoneFill = glowSilhouette ? glowColor || 'currentColor' : 'url(#figStone)';
  const strokeCol = glowSilhouette ? glowColor || 'currentColor' : OUTLINE;

  const renderPedestal = (wide = false) => (
    <g>
      <ellipse
        cx="16"
        cy="35.6"
        rx={wide ? 11 : 9.4}
        ry={wide ? 3.2 : 2.8}
        fill={baseFill}
        stroke={strokeCol}
        strokeWidth="1.15"
      />
      {!glowSilhouette && (
        <ellipse
          cx="16"
          cy="34.1"
          rx={wide ? 8.6 : 7.2}
          ry="1.5"
          fill="none"
          stroke={isHostile ? '#f4a997' : '#f7dfb0'}
          strokeWidth="0.65"
          opacity="0.58"
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
            <path
              d="M 8.8 34.4 C 10 26.8, 11.8 21, 13 17.2 L 19 17.2 C 20.2 21, 22 26.8, 23.2 34.4 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            <ellipse cx="16" cy="17" rx="4.9" ry="1.6" fill={glowSilhouette ? ivoryFill : '#e6d6b8'} stroke={strokeCol} strokeWidth="1" />
            <circle cx="16" cy="10.2" r="5.5" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.15" />
            {!glowSilhouette && (
              <>
                <path d="M 13 7.6 A 3.6 3.6 0 0 1 16.5 6.1" fill="none" stroke="#fffaf0" strokeWidth="1.2" strokeLinecap="round" opacity="0.78" />
                <circle cx="16" cy="26.8" r="2.2" fill={crimsonFill} stroke="#2d0708" strokeWidth="0.7" />
              </>
            )}
          </g>
        );

      case 'start':
        return (
          <g>
            {renderPedestal(false)}
            <path
              d="M 10 34.4 L 11.8 14.5 L 16 8.2 L 20.2 14.5 L 22 34.4 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            <polygon
              points="16,2.2 17.9,6.8 22.5,8.5 17.9,10.2 16,14.8 14.1,10.2 9.5,8.5 14.1,6.8"
              fill={amberFill}
              stroke={strokeCol}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <circle cx="16" cy="25" r="2.1" fill={crimsonFill} stroke="#2a0607" strokeWidth="0.65" />
            )}
          </g>
        );

      case 'combat':
        return (
          <g>
            {renderPedestal(false)}
            {/* Bold Crossed Iron Broadswords */}
            <path d="M 5.6 5.8 L 9.2 4.4 L 24.4 26.2 L 21.2 28 Z" fill={ironFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            <path d="M 26.4 5.8 L 22.8 4.4 L 7.6 26.2 L 10.8 28 Z" fill={ironFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            <line x1="4.8" y1="9.6" x2="10.8" y2="12.6" stroke={baseFill} strokeWidth="2.4" strokeLinecap="round" />
            <line x1="27.2" y1="9.6" x2="21.2" y2="12.6" stroke={baseFill} strokeWidth="2.4" strokeLinecap="round" />
            {/* Bold Heraldic Crimson & Ivory Buckler */}
            <path
              d="M 9 13.8 L 23 13.8 L 23 23.2 C 23 28.8, 19.6 32.2, 16 34.4 C 12.4 32.2, 9 28.8, 9 23.2 Z"
              fill={ivoryFill}
              stroke={strokeCol}
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <polygon points="16,17.2 19.8,22.4 16,27.8 12.2,22.4" fill={crimsonFill} stroke="#2c0507" strokeWidth="0.8" />
            )}
          </g>
        );

      case 'elite_combat':
        return (
          <g>
            {renderPedestal(true)}
            {/* Wide Sweeping War Horns */}
            <path d="M 10.2 15.2 C 4.4 13.4, 2.8 7.8, 5.2 2.8 C 6.6 6.8, 8.8 9.6, 12.2 10.8 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            <path d="M 21.8 15.2 C 27.6 13.4, 29.2 7.8, 26.8 2.8 C 25.4 6.8, 23.2 9.6, 19.8 10.8 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            {/* Dark Iron Armored Bust */}
            <path d="M 8 34.2 C 9.2 26.8, 10.4 22.2, 11.6 19.2 L 20.4 19.2 C 21.6 22.2, 22.8 26.8, 24 34.2 Z" fill={obsidianFill} stroke={strokeCol} strokeWidth="1.1" strokeLinejoin="round" />
            {/* Bone War-Skull Helm */}
            <path d="M 10.2 13.6 C 10.2 9.2, 12.8 7, 16 7 C 19.2 7, 21.8 9.2, 21.8 13.6 C 21.8 16.8, 20 18.8, 18.8 20 L 13.2 20 C 12 18.8, 10.2 16.8, 10.2 13.6 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {/* Spiked Crown */}
            <path d="M 11 8.8 L 12.4 4 L 14.6 7.4 L 16 2.8 L 17.4 7.4 L 19.6 4 L 21 8.8 Z" fill={crimsonFill} stroke={strokeCol} strokeWidth="0.95" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <circle cx="13.5" cy="14" r="1.6" fill="#ef4444" />
                <circle cx="18.5" cy="14" r="1.6" fill="#ef4444" />
                <polygon points="16,23.2 19.2,26.8 16,30.4 12.8,26.8" fill={crimsonFill} stroke="#f5c2a8" strokeWidth="0.7" />
              </>
            )}
          </g>
        );

      case 'boss':
        return (
          <g>
            <ellipse cx="16" cy="36.4" rx="12.6" ry="3.3" fill={baseFill} stroke={strokeCol} strokeWidth="1.15" />
            <ellipse cx="16" cy="33.8" rx="9.8" ry="2.2" fill={obsidianFill} stroke={strokeCol} strokeWidth="1" />
            <path d="M 9.6 16.2 C 3.2 14, 1.6 7.2, 4.8 1.6 C 6 6.8, 8.6 10, 12.4 11.4 Z" fill={agedFill} stroke={strokeCol} strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M 22.4 16.2 C 28.8 14, 30.4 7.2, 27.2 1.6 C 26 6.8, 23.4 10, 19.6 11.4 Z" fill={agedFill} stroke={strokeCol} strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M 7.8 33.4 C 9 26.6, 10.4 22.2, 11.6 19.4 L 20.4 19.4 C 21.6 22.2, 23 26.6, 24.2 33.4 Z" fill={obsidianFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            <path d="M 9.4 13.6 C 9.4 8.6, 12.4 6, 16 6 C 19.6 6, 22.6 8.6, 22.6 13.6 C 22.6 16.8, 20.8 18.8, 19.4 20.4 L 12.6 20.4 C 11.2 18.8, 9.4 16.8, 9.4 13.6 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            <path d="M 11.2 7.2 L 12.8 2.6 L 14.8 6.2 L 16 1.2 L 17.2 6.2 L 19.2 2.6 L 20.8 7.2 Z" fill={crimsonFill} stroke={strokeCol} strokeWidth="0.95" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <circle cx="13.2" cy="13.6" r="1.9" fill="#ef4444" stroke="#280405" strokeWidth="0.6" />
                <circle cx="18.8" cy="13.6" r="1.9" fill="#ef4444" stroke="#280405" strokeWidth="0.6" />
                <circle cx="13.2" cy="13.4" r="0.7" fill="#fee2e2" />
                <circle cx="18.8" cy="13.4" r="0.7" fill="#fee2e2" />
                <polygon points="16,23.6 19.4,27.4 16,31.2 12.6,27.4" fill={crimsonFill} stroke="#f3d8a3" strokeWidth="0.8" />
              </>
            )}
          </g>
        );

      case 'campfire':
        return (
          <g>
            {renderPedestal(false)}
            {/* Sculpted Chalice Base */}
            <path d="M 11 34.4 L 13.2 23.8 L 18.8 23.8 L 21 34.4 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.1" strokeLinejoin="round" />
            {/* Large Unmistakable Roaring Flame Plume */}
            <path
              d="M 16 2.8 C 21.4 9.2, 24.4 13.6, 23.4 19.2 C 22.8 22, 19.8 23.6, 16 23.6 C 12.2 23.6, 9.2 22, 8.6 19.2 C 7.8 14.2, 10.2 10.8, 12.4 8.2 C 12.8 11, 14 12, 14.8 11.2 C 14.8 8.2, 15.2 5.4, 16 2.8 Z"
              fill={flameFill}
              stroke={strokeCol}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <path
                d="M 16 10.5 C 18.4 13.8, 19.4 16.6, 18.6 19.4 C 17.8 21.2, 14.2 21.2, 13.4 19.4 C 12.8 17.2, 14 13.8, 16 10.5 Z"
                fill="#fef08a"
                opacity="0.92"
              />
            )}
            {/* Wide Iron Firebowl */}
            <path d="M 7.2 19.6 L 24.8 19.6 L 22 25.2 L 10 25.2 Z" fill={ironFill} stroke={strokeCol} strokeWidth="1.1" strokeLinejoin="round" />
          </g>
        );

      case 'altar':
        return (
          <g>
            {renderPedestal(true)}
            {/* Wide Stone Altar Slab */}
            <path d="M 6.8 19.8 L 25.2 19.8 L 24 24.4 L 22 24.4 L 23 34.2 L 9 34.2 L 10 24.4 L 8 24.4 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {/* Prominent Upright Ritual Dagger */}
            <path d="M 16 3.2 L 19 13 L 16 19.8 L 13 13 Z" fill={ironFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            <line x1="11.2" y1="13.2" x2="20.8" y2="13.2" stroke={amberFill} strokeWidth="2.6" strokeLinecap="round" />
            {!glowSilhouette && (
              /* Bold Crimson Sacrificial Runner */
              <path d="M 12.4 20 L 19.6 20 L 19 31.8 L 16 29.2 L 13 31.8 Z" fill={crimsonFill} stroke="#2a0506" strokeWidth="0.75" />
            )}
          </g>
        );

      case 'carving':
        return (
          <g>
            {renderPedestal(false)}
            {/* Hanging Stitched Tribal Banner Patch on Upright Pole */}
            <line x1="6.4" y1="7.8" x2="25.6" y2="7.8" stroke={amberFill} strokeWidth="2.4" strokeLinecap="round" />
            <path
              d="M 8.6 8.2 L 23.4 8.2 L 23.4 26.8 L 16 33.4 L 8.6 26.8 Z"
              fill={burlapFill}
              stroke={strokeCol}
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <>
                <path d="M 10.8 10.6 L 21.2 10.6 L 21.2 25.4 L 16 30.2 L 10.8 25.4 Z" fill="none" stroke="#fde68a" strokeWidth="0.9" strokeDasharray="2.2 1.8" opacity="0.85" />
                {/* Bold Bright Amber Tribal Diamond Crest */}
                <polygon points="16,13.6 20,19.4 16,25.2 12,19.4" fill={amberFill} stroke="#2a1506" strokeWidth="0.85" />
              </>
            )}
          </g>
        );

      case 'cost':
        return (
          <g>
            {renderPedestal(false)}
            <path d="M 13 34.2 L 14.4 24.2 L 17.6 24.2 L 19 34.2 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.1" />
            {/* Oversized Vivid Ruby-Crimson Blood Drop */}
            <path
              d="M 16 3.6 C 16 3.6, 24.4 12.6, 24.4 18.4 C 24.4 23.2, 20.6 26, 16 26 C 11.4 26, 7.6 23.2, 7.6 18.4 C 7.6 12.6, 16 3.6, 16 3.6 Z"
              fill={crimsonFill}
              stroke={strokeCol}
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            {!glowSilhouette && (
              <ellipse cx="12.8" cy="17.8" rx="1.6" ry="3.4" transform="rotate(-14 12.8 17.8)" fill="#fecaca" opacity="0.72" />
            )}
          </g>
        );

      case 'bonelord':
        return (
          <g>
            {renderPedestal(false)}
            {/* Wide Sweeping Ivory Bull Horns */}
            <path d="M 11.2 13.6 C 4.6 12.8, 2.8 7.2, 5.8 2.6 C 6.8 6.8, 9 9.4, 12.6 10.2 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            <path d="M 20.8 13.6 C 27.4 12.8, 29.2 7.2, 26.2 2.6 C 25.2 6.8, 23 9.4, 19.4 10.2 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.05" strokeLinejoin="round" />
            <path d="M 11.2 34.2 L 13 22.4 L 19 22.4 L 20.8 34.2 Z" fill={obsidianFill} stroke={strokeCol} strokeWidth="1.1" />
            {/* Bold Bleached Skull */}
            <path d="M 10.2 11.6 C 10.2 7.8, 12.8 6.2, 16 6.2 C 19.2 6.2, 21.8 7.8, 21.8 11.6 L 19.8 24 L 12.2 24 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <circle cx="13.4" cy="14.6" r="1.8" fill="#120906" />
                <circle cx="18.6" cy="14.6" r="1.8" fill="#120906" />
                <polygon points="16,18 17.3,21 14.7,21" fill="#120906" />
              </>
            )}
          </g>
        );

      case 'mycologist':
        return (
          <g>
            {renderPedestal(true)}
            {/* Conjoined Twin Bust */}
            <path d="M 7.8 34.2 C 8.8 27, 10.2 22, 11 18.2 L 21 18.2 C 21.8 22, 23.2 27, 24.2 34.2 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            <circle cx="12" cy="11.8" r="5" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.1" />
            <circle cx="20" cy="11.8" r="5" fill={violetFill} stroke={strokeCol} strokeWidth="1.1" />
            {!glowSilhouette && (
              <>
                {/* Vivid Arterial/Violet Suture Seam */}
                <line x1="16" y1="7.2" x2="16" y2="32.4" stroke="#3b0764" strokeWidth="1.8" />
                {[11.5, 17, 22.5, 28].map(y => (
                  <line key={y} x1="13" y1={y} x2="19" y2={y} stroke="#f43f5e" strokeWidth="1.4" strokeLinecap="round" />
                ))}
              </>
            )}
          </g>
        );

      case 'goobert':
        return (
          <g>
            {renderPedestal(true)}
            {/* Heavy Stamp Platen with Glowing Emerald Ink Cushion */}
            <path d="M 7.8 22.4 L 24.2 22.4 L 25.4 33.8 L 6.6 33.8 Z" fill={ironFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {!glowSilhouette && (
              <rect x="7.8" y="28.4" width="16.4" height="5" rx="0.8" fill={emeraldFill} stroke="#064e3b" strokeWidth="0.7" />
            )}
            {/* Turned Stamp Knob Handle */}
            <path d="M 13 22.4 C 13.5 17.8, 12.8 14.2, 11.4 11 C 10.8 7.8, 13 5.2, 16 5.2 C 19 5.2, 21.2 7.8, 20.6 11 C 19.2 14.2, 18.5 17.8, 19 22.4 Z" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            <rect x="11.8" y="20.2" width="8.4" height="2.8" rx="0.8" fill={emeraldFill} stroke={strokeCol} strokeWidth="0.85" />
          </g>
        );

      case 'cave':
        return (
          <g>
            {renderPedestal(true)}
            {/* Carved Monolith Barrow Archway */}
            <path d="M 7 34.2 L 7.8 18.4 C 8.6 10.2, 12 6.6, 16 6.6 C 20 6.6, 23.4 10.2, 24.2 18.4 L 25 34.2 Z" fill={stoneFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <path d="M 10.8 34.2 L 11.2 21.2 C 11.6 15.2, 13.6 12.6, 16 12.6 C 18.4 12.6, 20.4 15.2, 20.8 21.2 L 21.2 34.2 Z" fill="#070506" stroke="#2c221b" strokeWidth="0.9" />
                {/* Large Luminous Golden Eye Inside Dark Cave */}
                <path d="M 11.4 22.4 Q 16 17.2 20.6 22.4 Q 16 27.6 11.4 22.4 Z" fill={amberFill} />
                <circle cx="16" cy="22.4" r="2.1" fill="#120705" />
              </>
            )}
          </g>
        );

      case 'choice':
        return (
          <g>
            {renderPedestal(true)}
            {/* Distinct Wide Fan of 3 Cards */}
            <g transform="rotate(-22 16 30)">
              <rect x="10.4" y="8.8" width="10.8" height="21" rx="1.4" fill={agedFill} stroke={strokeCol} strokeWidth="1.05" />
            </g>
            <g transform="rotate(22 16 30)">
              <rect x="10.4" y="8.8" width="10.8" height="21" rx="1.4" fill={agedFill} stroke={strokeCol} strokeWidth="1.05" />
            </g>
            <rect x="10.4" y="6.8" width="11.2" height="23.4" rx="1.4" fill={ivoryFill} stroke={strokeCol} strokeWidth="1.15" />
            <rect x="11" y="29" width="10" height="5" rx="0.9" fill={amberFill} stroke={strokeCol} strokeWidth="0.9" />
            {!glowSilhouette && (
              <polygon points="16,12.6 19.4,18 16,23.4 12.6,18" fill={crimsonFill} stroke="#2c0608" strokeWidth="0.7" />
            )}
          </g>
        );

      case 'totem':
        return (
          <g>
            {renderPedestal(false)}
            {/* Unmistakable Stitched Poppet Doll Silhouette */}
            <path
              d="M 12.2 34.2 L 13 24.6 L 7 20.4 L 8.8 17.4 L 13 19.6 L 13 15.2 L 19 15.2 L 19 19.6 L 23.2 17.4 L 25 20.4 L 19 24.6 L 19.8 34.2 L 16.8 34.2 L 16 28.4 L 15.2 34.2 Z"
              fill={burlapFill}
              stroke={strokeCol}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="10.2" r="5.2" fill={burlapFill} stroke={strokeCol} strokeWidth="1.15" />
            {!glowSilhouette && (
              <>
                {/* Button Eyes & Glowing Torso Crest */}
                <path d="M 13.4 9.2 L 15 10.8 M 15 9.2 L 13.4 10.8" stroke="#1d120a" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M 17 9.2 L 18.6 10.8 M 18.6 9.2 L 17 10.8" stroke="#1d120a" strokeWidth="1.1" strokeLinecap="round" />
                <circle cx="16" cy="22.4" r="2.6" fill={amberFill} stroke="#2a1606" strokeWidth="0.75" />
              </>
            )}
          </g>
        );

      case 'items':
        return (
          <g>
            {renderPedestal(true)}
            {/* Arched Golden Handle */}
            <path d="M 11.4 15.4 C 11.4 9, 20.6 9, 20.6 15.4" fill="none" stroke={amberFill} strokeWidth="2.6" strokeLinecap="round" />
            {/* Bold Brass-Strapped Relic Chest */}
            <path d="M 7.4 15.8 L 24.6 15.8 L 25.4 33.8 L 6.6 33.8 Z" fill={burlapFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <line x1="7" y1="22" x2="25" y2="22" stroke="#24160c" strokeWidth="1.4" />
                <rect x="10.4" y="15.8" width="2.4" height="17.8" fill={amberFill} />
                <rect x="19.2" y="15.8" width="2.4" height="17.8" fill={amberFill} />
                <circle cx="16" cy="22" r="2.8" fill={emeraldFill} stroke="#fde68a" strokeWidth="0.9" />
              </>
            )}
          </g>
        );

      case 'anvil':
        return (
          <g>
            {renderPedestal(true)}
            <path d="M 9.8 34.2 L 11.8 23.4 L 20.2 23.4 L 22.2 34.2 Z" fill={ironFill} stroke={strokeCol} strokeWidth="1.1" strokeLinejoin="round" />
            {/* Wide Horned Iron Anvil */}
            <path d="M 3.6 15.4 L 23.4 15.4 L 28.8 19.2 L 22.8 23.8 L 10.6 23.8 C 7.4 23.8, 4.8 20.8, 3.6 15.4 Z" fill={ironFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <line x1="6" y1="17.2" x2="22.8" y2="17.2" stroke="#f0ebe4" strokeWidth="1.1" opacity="0.7" />
                {/* Glowing Hot Forge Rune on Anvil */}
                <circle cx="16" cy="12" r="2.5" fill={flameFill} stroke="#450a0a" strokeWidth="0.7" />
              </>
            )}
          </g>
        );

      case 'flock':
        return (
          <g>
            {renderPedestal(false)}
            {/* Distinct Obsidian Black Ram Bust with Pale Curled Horns */}
            <path d="M 9 34.2 C 10 27, 11.2 22.2, 12.2 19.2 L 19.8 19.2 C 20.8 22.2, 22 27, 23 34.2 Z" fill={obsidianFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            <path d="M 10.8 11.2 C 5.2 10.6, 4.4 17.6, 10 18.4" fill="none" stroke={ivoryFill} strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 21.2 11.2 C 26.8 10.6, 27.6 17.6, 22 18.4" fill="none" stroke={ivoryFill} strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 10.8 13 C 10.8 8.4, 13.2 6.4, 16 6.4 C 18.8 6.4, 21.2 8.4, 21.2 13 C 21.2 17, 19 20.8, 16 20.8 C 13 20.8, 10.8 17, 10.8 13 Z" fill={obsidianFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {!glowSilhouette && (
              <>
                <circle cx="13.4" cy="14.2" r="1.4" fill="#fde68a" />
                <circle cx="18.6" cy="14.2" r="1.4" fill="#fde68a" />
                <path d="M 16 8.4 L 16 12.2 M 14.2 10.3 L 17.8 10.3" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'obscured':
      default:
        return (
          <g>
            {renderPedestal(false)}
            <path d="M 9.2 34.4 L 10.8 12.8 L 16 7.4 L 21.2 12.8 L 22.8 34.4 Z" fill={stoneFill} stroke={strokeCol} strokeWidth="1.15" strokeLinejoin="round" />
            {!glowSilhouette && (
              <text
                x="16"
                y="25.5"
                textAnchor="middle"
                fontSize="12"
                fontFamily="Cinzel, serif"
                fontWeight="800"
                fill="#e2d1b5"
              >
                ?
              </text>
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
