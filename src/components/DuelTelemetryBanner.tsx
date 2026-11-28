import React, { useEffect, useId, useRef, useState } from 'react';
import { getItemArtUrl } from '../data/gameData';

export interface ResolvedRelic {
  name: string;
  description: string;
  emoji: string;
}

const toRoman = (num: number): string => {
  if (!Number.isFinite(num) || num <= 0) return 'I';
  const pairs: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let n = Math.floor(num);
  let out = '';
  for (const [val, sym] of pairs) {
    while (n >= val) {
      out += sym;
      n -= val;
    }
  }
  return out;
};

interface DuelTelemetryBannerProps {
  turnNumber: number;
  stage?: number;
  isTurnOneDanger: boolean;
  items: (ResolvedRelic | null)[];
  phase: string;
  itemTargetSourceSlot: number | null;
  onUseItem: (idx: number) => void;
}

export const DuelTelemetryBanner: React.FC<DuelTelemetryBannerProps> = ({
  turnNumber,
  stage = 1,
  isTurnOneDanger,
  items,
  phase,
  itemTargetSourceSlot,
  onUseItem,
}) => {
  const baseUrl = import.meta.env.BASE_URL || './';
  const isAct4Burned = stage >= 4;
  const swayAnimation =
    stage === 2
      ? 'bannerSwayMid 11s linear infinite'
      : stage === 3
        ? 'bannerSwayBrisk 9s linear infinite'
        : 'bannerSwayGentle 6.6s ease-in-out infinite';
  const rippleAnimation =
    stage === 2
      ? 'bannerClothRipple 2.8s linear infinite'
      : stage === 3
        ? 'bannerClothRipple 2.3s linear infinite'
        : 'bannerClothRipple 5.5s linear infinite';
  const rippleOpacity = stage === 3 ? 0.2 : stage === 2 ? 0.16 : 0.08;
  const waveScale = stage === 3 ? 30 : stage === 2 ? 18 : 5;
  const waveDur = stage === 3 ? '2.1s' : stage === 2 ? '3.2s' : '5.8s';

  return (
    <div className="relative w-[84px] sm:w-[90px] flex flex-col items-center select-none shrink-0">
      {/* Ornate Carved Timber & Corded Brass Banner Rod */}
      <div className="relative z-20 w-[calc(100%+18px)] h-4 flex items-center shrink-0">
        <div
          className="relative w-full h-[9px] rounded-full"
          style={{
            backgroundColor: '#2e1d12',
            backgroundImage: `linear-gradient(180deg, rgba(255,214,160,0.28) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.65) 100%), url("${baseUrl}assets/text/wood.jpg")`,
            backgroundSize: 'cover, 120px 120px',
            boxShadow: '0 5px 10px rgba(0,0,0,0.9), inset 0 -1px 2px rgba(0,0,0,0.7)',
          }}
        />
        {[10, 32, 68, 90].map((p) => (
          <span
            key={p}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[7px] h-[14px] rounded-[2px]"
            style={{
              left: `${p}%`,
              backgroundImage:
                'repeating-linear-gradient(115deg, #b08a52 0px, #b08a52 1.2px, #3a2511 1.2px, #3a2511 2.6px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 0 2px rgba(0,0,0,0.6)',
            }}
          />
        ))}
        {(['left', 'right'] as const).map((side) => (
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

      {/* Hidden SVG Wave Displacement Filter (ripples cloth edges smoothly without warping text) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="duel-cloth-wave" x="-32%" y="-6%" width="164%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0025 0.012"
              numOctaves="1"
              seed="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.0022 0.011; 0.0042 0.018; 0.0022 0.011"
                dur={waveDur}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={waveScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Hanging Crimson Cloth Body (mild top-anchored sway + wavy cloth layer + crisp foreground) */}
      <div
        className="relative z-10 w-full -mt-1.5"
        style={{
          transformOrigin: 'top center',
          animation: swayAnimation,
          filter: isTurnOneDanger
            ? 'drop-shadow(0 0 10px rgba(220,38,38,0.55)) drop-shadow(0 10px 14px rgba(0,0,0,0.72))'
            : 'drop-shadow(0 10px 14px rgba(0,0,0,0.72))',
        }}
      >
        <div className="relative w-full mx-auto px-2.5 pt-4 pb-7 flex flex-col items-center">
          {/* Wavy Displaced Cloth Backdrop */}
          <div
            className={`pointer-events-none absolute inset-0 overflow-hidden shadow-[inset_0_8px_18px_rgba(0,0,0,0.62)] transition-colors duration-300 ${
              isTurnOneDanger ? 'ring-1 ring-inset ring-red-500/70' : ''
            }`}
            style={{
              filter: 'url(#duel-cloth-wave)',
              background: isAct4Burned
                ? 'linear-gradient(180deg, #4f0a0d 0%, #5c1214 54%, #31100f 75%, #120605 90%, #070303 100%)'
                : 'linear-gradient(180deg, #520a0d 0%, #5c0f12 56%, #7f2424 78%, #a64641 100%)',
              clipPath: isAct4Burned
                ? 'polygon(0% 0%, 100% 0%, 100% 91%, 96% 95%, 92% 90%, 87% 97%, 82% 93%, 76% 99%, 70% 92%, 64% 96%, 58% 89%, 52% 98%, 45% 94%, 39% 99%, 32% 91%, 26% 96%, 19% 92%, 13% 98%, 7% 93%, 3% 96%, 0% 90%)'
                : 'polygon(0% 0%, 100% 0%, 100% 96.8%, 98.5% 98.6%, 97% 97.1%, 95.5% 99.3%, 94% 97.4%, 92.5% 98.8%, 91% 96.4%, 89.2% 99.1%, 87.5% 97.5%, 85.8% 98.9%, 84% 96.2%, 82.2% 99.4%, 80.5% 97.6%, 78.8% 98.7%, 77% 97.2%, 75.2% 99.6%, 73.5% 96.8%, 71.8% 98.9%, 70% 97.3%, 68.2% 99.2%, 66.5% 97.6%, 64.8% 98.8%, 63% 95.9%, 61.2% 99.1%, 59.5% 97.4%, 57.8% 98.9%, 56% 97.2%, 54.2% 99.7%, 52.5% 97.5%, 50.8% 98.8%, 49% 96.5%, 47.2% 99.3%, 45.5% 97.4%, 43.8% 98.7%, 42% 97.1%, 40.2% 99.5%, 38.5% 96.9%, 36.8% 98.8%, 35% 97.3%, 33.2% 99.2%, 31.5% 96.3%, 29.8% 98.9%, 28% 97.5%, 26.2% 99.4%, 24.5% 97.2%, 22.8% 98.7%, 21% 96.7%, 19.2% 99.1%, 17.5% 97.4%, 15.8% 98.8%, 14% 96.4%, 12.2% 99.3%, 10.5% 97.5%, 8.8% 98.7%, 7% 97.1%, 5.2% 99.2%, 3.5% 97.3%, 1.8% 98.6%, 0% 96.8%)',
            }}
          >
            {/* Multiplied Cloth Weave Texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-65 mix-blend-multiply"
              style={{
                backgroundImage: `url("${baseUrl}assets/text/cloth.jpg")`,
                backgroundSize: '150px 150px',
                backgroundRepeat: 'repeat',
              }}
            />
            {/* Seamless Downward Wind Sheen */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: rippleOpacity,
                backgroundImage:
                  'repeating-linear-gradient(180deg, transparent 0px, rgba(255,220,185,0.22) 38px, transparent 84px, rgba(0,0,0,0.22) 132px, transparent 180px)',
                backgroundSize: '100% 180px',
                animation: rippleAnimation,
              }}
            />

            {/* Detailed Frayed Thread Strands along Bottom Edge */}
            <div
              className={`pointer-events-none absolute bottom-0 inset-x-0 h-5 opacity-80 banner-hem banner-hem-s${stage}`}
              style={{
                backgroundImage: isAct4Burned
                  ? 'repeating-linear-gradient(90deg, rgba(20,8,6,0.95) 0px, rgba(20,8,6,0.95) 1px, transparent 1px, transparent 3px, rgba(120,40,18,0.6) 3px, rgba(120,40,18,0.6) 4px, transparent 4px, transparent 7px)'
                  : 'repeating-linear-gradient(90deg, rgba(196,154,92,0.55) 0px, rgba(196,154,92,0.55) 1px, transparent 1px, transparent 3px, rgba(176,78,72,0.85) 3px, rgba(176,78,72,0.85) 4px, transparent 4px, transparent 6px)',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
              }}
            />
            {/* Frayed Hem Shadow Wash */}
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            {/* Act 4 Scorched Lower Char & Smoldering Ember Rim (clipped to burned cloth edge) */}
            {isAct4Burned && (
              <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="100,91 96,95 92,90 87,97 82,93 76,99 70,92 64,96 58,89 52,98 45,94 39,99 32,91 26,96 19,92 13,98 7,93 3,96 0,90" fill="none" stroke="rgba(234,88,12,0.4)" strokeWidth="5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <polyline points="100,91 96,95 92,90 87,97 82,93 76,99 70,92 64,96 58,89 52,98 45,94 39,99 32,91 26,96 19,92 13,98 7,93 3,96 0,90" fill="none" stroke="rgba(255,150,60,0.9)" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
            {isAct4Burned && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 20% 62% at 7% 100%, rgba(10,4,3,0.9) 0%, rgba(10,4,3,0.41) 55%, transparent 100%), radial-gradient(ellipse 14% 40% at 24% 100%, rgba(10,4,3,0.85) 0%, rgba(10,4,3,0.38) 55%, transparent 100%), radial-gradient(ellipse 24% 70% at 44% 100%, rgba(10,4,3,0.9) 0%, rgba(10,4,3,0.41) 55%, transparent 100%), radial-gradient(ellipse 13% 34% at 63% 100%, rgba(10,4,3,0.85) 0%, rgba(10,4,3,0.38) 55%, transparent 100%), radial-gradient(ellipse 22% 58% at 83% 100%, rgba(10,4,3,0.9) 0%, rgba(10,4,3,0.41) 55%, transparent 100%), radial-gradient(ellipse 14% 44% at 100% 100%, rgba(10,4,3,0.85) 0%, rgba(10,4,3,0.38) 55%, transparent 100%), radial-gradient(ellipse 60% 22% at 50% 100%, rgba(234,88,12,0.38) 0%, transparent 100%), linear-gradient(to top, rgba(12,5,4,0.8) 0%, rgba(12,5,4,0.45) 9%, transparent 22%)',
                }}
              />
            )}
          </div>
          {/* Act 4 Rising Cinders */}
          {isAct4Burned && (
            <>
              <div className="pointer-events-none absolute bottom-1 inset-x-2 h-14 overflow-visible">
                {[
                  { left: '30%', delay: '0s', dur: '6.8s', size: 2.5 },
                  { left: '76%', delay: '3.7s', dur: '7.2s', size: 2.5 },
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
          )}

        <div className="relative z-10 flex flex-col items-center gap-2.5">
          {/* 1. STYLIZED TURN HEADER (ROMAN NUMERALS) */}
          <div className="w-full flex flex-col items-center pb-2 border-b border-[#7c2620]/80">
            <div className="flex items-center justify-center gap-1.5 w-full">
              <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#c49a5c]/70" />
              <span className="font-['Cinzel',_serif] text-[8.5px] font-bold uppercase tracking-[0.28em] text-[#d8b482] leading-none">
                Turn
              </span>
              <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#c49a5c]/70" />
            </div>
            <span
              className="font-['Cinzel',_serif] font-black text-2xl leading-none mt-1.5 tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-b from-[#fff2d6] via-[#e5c285] to-[#9e743c] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
              title={`Turn ${turnNumber}`}
            >
              {toRoman(turnNumber)}
            </span>
          </div>

          {/* 2. RELICS (3-SLOT STACK) */}
          <div className="w-full flex flex-col items-center gap-2 pb-3">
            <span className="text-[8px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.24em] text-[#e6cca8]/90 leading-none">
              Relics
            </span>
            {items.map((item, idx) => {
              const isTargetingThis = itemTargetSourceSlot === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onUseItem(idx)}
                  disabled={phase !== 'PLAY' || !item}
                  title={item ? `${item.name}: ${item.description}` : 'Empty Slot'}
                  className={`relative z-10 w-10 h-10 flex items-center justify-center text-2xl bg-transparent border-0 outline-none transition-transform duration-150 ${
                    item
                      ? isTargetingThis
                        ? 'scale-115 animate-pulse cursor-pointer'
                        : 'hover:scale-115 active:scale-95 cursor-pointer'
                      : 'cursor-not-allowed opacity-40'
                  }`}
                >
                  {item ? (() => {
                    const artUrl = getItemArtUrl(item);
                    return artUrl ? (
                      <img
                        src={artUrl}
                        alt={item.name}
                        className="w-8 h-8 object-contain select-none pointer-events-none transition-[filter] duration-150"
                        style={{
                          filter: isTargetingThis
                            ? 'brightness(1.12) drop-shadow(0 0 2px #090303) drop-shadow(0 0 8px rgba(251,191,36,0.95))'
                            : 'drop-shadow(0 2px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 1px #090303)',
                        }}
                      />
                    ) : (
                      <span
                        className="transition-[filter] duration-150"
                        style={{
                          filter: isTargetingThis
                            ? 'sepia(0.25) saturate(0.95) brightness(1.05) contrast(1.1) drop-shadow(0 0 2px #090303) drop-shadow(0 0 8px rgba(251,191,36,0.9))'
                            : 'sepia(0.55) saturate(0.52) brightness(0.8) contrast(1.15) drop-shadow(1px 0 0 #090303) drop-shadow(-1px 0 0 #090303) drop-shadow(0 1px 0 #090303) drop-shadow(0 -1px 0 #090303) drop-shadow(0 2px 3px rgba(0,0,0,0.85))',
                        }}
                      >
                        {item.emoji}
                      </span>
                    );
                  })() : (
                    <span className="text-[#e5c27a]/45 text-sm font-mono">•</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

interface JarTierSpec {
  id: 1 | 2 | 3;
  roman: 'I' | 'II' | 'III';
  label: string;
  w: number;
  h: number;
  cap: number;
  cx: number;
  outerPath: string;
  innerPath: string;
  fillBottomY: number;
  fillTopY: number;
  readoutTopPct: number;
  leftGlintPath: string;
  leftShoulderGlint: string;
  rightGlintPath: string;
  bottomLensPath: string;
  ticks: { y: number; x1: number; x2: number; major?: boolean }[];
  bubbles: { cx: number; cy: number; r: number; anim: string; dur: string; delay: string }[];
}

const JAR_TIERS: Record<1 | 2 | 3, JarTierSpec> = {
  // Tier 1 (0–19 oz): Squat Apothecary Phial with wax-dipped cork & bulbous shoulders
  1: {
    id: 1,
    roman: 'I',
    label: 'Apothecary Phial',
    w: 60,
    h: 96,
    cap: 12.5,
    cx: 30,
    outerPath:
      'M 23 10 L 37 10 L 37 16 C 37 21.5, 54 22.5, 54 34 L 54 69 C 54 80.5, 46 85.5, 36 85.5 L 24 85.5 C 14 85.5, 6 80.5, 6 69 L 6 34 C 6 22.5, 23 21.5, 23 16 Z',
    innerPath:
      'M 25 11.5 L 35 11.5 L 35 16.5 C 35 22.4, 51.6 23.6, 51.6 34.4 L 51.6 68.8 C 51.6 78.2, 44.8 83, 35.6 83 L 24.4 83 C 15.2 83, 8.4 78.2, 8.4 68.8 L 8.4 34.4 C 8.4 23.6, 25 22.4, 25 16.5 Z',
    fillBottomY: 83.2,
    fillTopY: 25,
    readoutTopPct: 55,
    leftShoulderGlint: 'M 11.5 31 C 12.5 25.5, 19.5 23.8, 23.8 19.5',
    leftGlintPath: 'M 10.6 35 L 10.6 67.5 C 10.6 74, 13.8 78.2, 18.5 80',
    rightGlintPath: 'M 49.4 36 L 49.4 67 C 49.4 73.5, 46.5 77.5, 42.5 79.5',
    bottomLensPath: 'M 19 81.2 Q 30 84.2, 41 81.2',
    ticks: [
      { y: 37, x1: 44.5, x2: 50.5, major: true },
      { y: 49, x1: 46.2, x2: 50.5 },
      { y: 61, x1: 44.5, x2: 50.5, major: true },
      { y: 73, x1: 46.2, x2: 49.8 },
    ],
    bubbles: [
      { cx: 19, cy: 78, r: 1.4, anim: 'jarBubbleRiseA', dur: '3.6s', delay: '0s' },
      { cx: 38, cy: 80, r: 1.1, anim: 'jarBubbleRiseC', dur: '4.4s', delay: '1.4s' },
      { cx: 28, cy: 79, r: 1.25, anim: 'jarBubbleRiseA', dur: '3.1s', delay: '2.2s' },
    ],
  },
  // Tier 2 (20–49 oz): Tall Brass-Banded Specimen Jar with beveled shoulders & compression rings
  2: {
    id: 2,
    roman: 'II',
    label: 'Brass-Banded Specimen Jar',
    w: 64,
    h: 132,
    cap: 50,
    cx: 32,
    outerPath:
      'M 23 10.5 L 41 10.5 L 41 16.5 C 41 20, 57 22, 57 29.5 L 57 109.5 C 57 117.2, 51 120.5, 43 120.5 L 21 120.5 C 13 120.5, 7 117.2, 7 109.5 L 7 29.5 C 7 22, 23 20, 23 16.5 Z',
    innerPath:
      'M 25.2 12 L 38.8 12 L 38.8 17 C 38.8 21.3, 54.6 23.3, 54.6 30 L 54.6 109 C 54.6 115.2, 49.6 118, 42.4 118 L 21.6 118 C 14.4 118, 9.4 115.2, 9.4 109 L 9.4 30 C 9.4 23.3, 25.2 21.3, 25.2 17 Z',
    fillBottomY: 118.2,
    fillTopY: 25,
    readoutTopPct: 54,
    leftShoulderGlint: 'M 12.2 28.5 C 14 24.5, 20.5 23, 25.5 19',
    leftGlintPath: 'M 11.8 40 L 11.8 100.5',
    rightGlintPath: 'M 52.4 40 L 52.4 100',
    bottomLensPath: 'M 18.5 115.8 Q 32 119, 45.5 115.8',
    ticks: [
      { y: 44, x1: 46.5, x2: 53.2, major: true },
      { y: 54.5, x1: 48.8, x2: 53.2 },
      { y: 65, x1: 46.5, x2: 53.2, major: true },
      { y: 75.5, x1: 48.8, x2: 53.2 },
      { y: 86, x1: 46.5, x2: 53.2, major: true },
      { y: 96.5, x1: 48.8, x2: 53.2 },
    ],
    bubbles: [
      { cx: 20, cy: 112, r: 1.5, anim: 'jarBubbleRiseB', dur: '4.1s', delay: '0.2s' },
      { cx: 43, cy: 114, r: 1.15, anim: 'jarBubbleRiseA', dur: '3.5s', delay: '1.5s' },
      { cx: 30, cy: 113, r: 1.35, anim: 'jarBubbleRiseB', dur: '4.8s', delay: '2.6s' },
      { cx: 25, cy: 110, r: 1.0, anim: 'jarBubbleRiseC', dur: '3.2s', delay: '0.9s' },
    ],
  },
  // Tier 3 (50+ oz): Wide Ribbed & Iron-Caged Alchemical Carboy with double-valve crown
  3: {
    id: 3,
    roman: 'III',
    label: 'Caged Alchemical Carboy',
    w: 84,
    h: 138,
    cap: 100,
    cx: 42,
    outerPath:
      'M 30 10.5 L 54 10.5 L 54 17.5 C 54 22.5, 78 23.8, 78 36 L 75.6 112.5 C 75.2 121.2, 68 125.8, 58 125.8 L 26 125.8 C 16 125.8, 8.8 121.2, 8.4 112.5 L 6 36 C 6 23.8, 30 22.5, 30 17.5 Z',
    innerPath:
      'M 32.4 12 L 51.6 12 L 51.6 18 C 51.6 24, 75.2 25.3, 75.2 36.4 L 72.8 112 C 72.5 119.3, 66.2 123.2, 57.4 123.2 L 26.6 123.2 C 17.8 123.2, 11.5 119.3, 11.2 112 L 8.8 36.4 C 8.8 25.3, 32.4 24, 32.4 18 Z',
    fillBottomY: 123.4,
    fillTopY: 27,
    readoutTopPct: 55,
    leftShoulderGlint: 'M 12.2 33.5 C 14.5 27.2, 24.5 25.2, 31.8 20.2',
    leftGlintPath: 'M 11.5 45 L 13.4 105.5',
    rightGlintPath: 'M 72.5 45 L 70.6 105.5',
    bottomLensPath: 'M 22 120.8 Q 42 124.2, 62 120.8',
    ticks: [
      { y: 47, x1: 63.5, x2: 71.2, major: true },
      { y: 55, x1: 66.5, x2: 71.0 },
      { y: 63, x1: 63.5, x2: 70.8, major: true },
      { y: 71, x1: 66.5, x2: 70.6 },
      { y: 79, x1: 63.5, x2: 70.4, major: true },
      { y: 87, x1: 66.5, x2: 70.2 },
      { y: 95, x1: 63.5, x2: 70.0, major: true },
      { y: 103, x1: 66.5, x2: 69.8 },
    ],
    bubbles: [
      { cx: 23, cy: 117, r: 1.6, anim: 'jarBubbleRiseB', dur: '4.0s', delay: '0.1s' },
      { cx: 56, cy: 118, r: 1.3, anim: 'jarBubbleRiseA', dur: '3.6s', delay: '1.2s' },
      { cx: 36, cy: 116, r: 1.45, anim: 'jarBubbleRiseB', dur: '4.6s', delay: '2.1s' },
      { cx: 49, cy: 119, r: 1.1, anim: 'jarBubbleRiseC', dur: '3.1s', delay: '0.8s' },
      { cx: 29, cy: 114, r: 1.0, anim: 'jarBubbleRiseA', dur: '4.3s', delay: '3.0s' },
    ],
  },
};

/* --- STANDALONE DIEGETIC BLOOD BANK VESSEL (3-TIER ALCHEMICAL JARS) + SPIGOT SIPHON HOSE --- */
export const BloodBankVessel: React.FC<{ displayBloodOz: number; isOverkill?: boolean; tier?: 1 | 2 | 3 }> = ({
  displayBloodOz,
  isOverkill = false,
  tier = 1,
}) => {
  const uid = useId().replace(/:/g, '');
  const prevRef = useRef(displayBloodOz);
  const [delta, setDelta] = useState<number | null>(null);
  const [shownOz, setShownOz] = useState<number>(displayBloodOz);

  useEffect(() => {
    const startVal = prevRef.current;
    const diff = displayBloodOz - startVal;
    prevRef.current = displayBloodOz;

    if (diff > 0) {
      setDelta(diff);
      const steps = Math.min(diff, 12);
      const stepMs = Math.max(24, Math.floor(260 / steps));
      let step = 0;
      const iv = window.setInterval(() => {
        step += 1;
        if (step >= steps) {
          setShownOz(displayBloodOz);
          window.clearInterval(iv);
        } else {
          setShownOz(Math.round(startVal + (diff * step) / steps));
        }
      }, stepMs);
      const t = window.setTimeout(() => setDelta(null), 1300);
      return () => {
        window.clearInterval(iv);
        window.clearTimeout(t);
      };
    }
    setShownOz(displayBloodOz);
  }, [displayBloodOz]);

  const isSurging = isOverkill || delta !== null;
  const spec = JAR_TIERS[tier] ?? JAR_TIERS[1];
  const fillPct =
    displayBloodOz > 0
      ? tier === 1
        ? Math.min(100, Math.max(18, displayBloodOz * 8))
        : Math.min(100, (displayBloodOz / spec.cap) * 100)
      : 0;

  // Vertical Y position of the blood meniscus inside the tier's inner glass cavity
  const fillSpan = spec.fillBottomY - spec.fillTopY;
  const surfaceY = fillPct > 0 ? spec.fillBottomY - (fillSpan * fillPct) / 100 : spec.fillBottomY + 6;
  const liquidHeight = spec.fillBottomY - surfaceY + 8;

  // Seamless 48px-period dual wave paths (192px wide) for liquid meniscus
  const waveBackPath =
    'M 0 0 Q 12 2.1, 24 0 T 48 0 T 96 0 T 144 0 T 192 0 L 192 14 L 0 14 Z';
  const waveFrontPath =
    'M 0 0 Q 12 -2.2, 24 0 T 48 0 T 96 0 T 144 0 T 192 0 L 192 14 L 0 14 Z';
  const waveFrontCrest = 'M 0 0 Q 12 -2.2, 24 0 T 48 0 T 96 0 T 144 0 T 192 0';

  return (
    <div
      className="relative flex flex-col items-center select-none"
      title={`Blood Bank (${spec.label}): ${displayBloodOz} oz Overkill Blood`}
    >
      {/* REWORKED SPIGOT VALVE & BRAIDED TRANSLUCENT SIPHON HOSE (Center-anchored across all 3 tiers!) */}
      <svg
        viewBox="0 0 84 44"
        className="pointer-events-none absolute left-1/2 -ml-[74px] -top-[16px] w-[84px] h-[44px] overflow-visible z-20"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`hoseBrass-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c49a5c" />
            <stop offset="45%" stopColor="#6b4a26" />
            <stop offset="100%" stopColor="#26180d" />
          </linearGradient>
          <linearGradient id={`hoseWall-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b2f29" />
            <stop offset="50%" stopColor="#1d1615" />
            <stop offset="100%" stopColor="#2f241f" />
          </linearGradient>
          <linearGradient id={`hoseBlood-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#fca5a5" />
          </linearGradient>
        </defs>

        {/* Left Brass Spigot Valve Bolted to Runnel Stone Edge */}
        <g>
          {/* Stone mounting flange plate with rivets seated onto slate flank */}
          <rect x="-1.8" y="4.5" width="7.2" height="13" rx="1.2" fill={`url(#hoseBrass-${uid})`} stroke="#1b1109" strokeWidth="0.8" />
          <circle cx="1.8" cy="7.2" r="0.9" fill="#1b1109" stroke="#d4af73" strokeWidth="0.35" />
          <circle cx="1.8" cy="14.8" r="0.9" fill="#1b1109" stroke="#d4af73" strokeWidth="0.35" />
          {/* Hex compression nut */}
          <rect x="5.2" y="7" width="4.4" height="8" rx="0.8" fill={`url(#hoseBrass-${uid})`} stroke="#21140b" strokeWidth="0.7" />
          <line x1="6.2" y1="9.2" x2="8.8" y2="9.2" stroke="#ebd09e" strokeWidth="0.5" opacity="0.55" />
          {/* Miniature shutoff petcock T-valve handle */}
          <rect x="6.6" y="3.2" width="1.6" height="4" fill="#6b4a26" stroke="#1e130b" strokeWidth="0.5" />
          <rect x="3.6" y="1.8" width="7.6" height="2" rx="1" fill="#7c2020" stroke="#c49a5c" strokeWidth="0.55" />
          {/* Tapered barbed brass spigot nozzle */}
          <path d="M 9.4 8.2 L 13.5 9 L 13.5 13 L 9.4 13.8 Z" fill={`url(#hoseBrass-${uid})`} stroke="#1b1109" strokeWidth="0.65" />
        </g>

        {/* Braided Translucent Siphon Hose Arching into Jar Stopper Center (x=74) */}
        <path
          d="M 12.2 11 C 31 11, 46 3.5, 64 3.5 C 71.5 3.5, 74 7.5, 74 17.5"
          fill="none"
          stroke="#060404"
          strokeWidth="8.6"
          strokeLinecap="round"
        />
        <path
          d="M 12.2 11 C 31 11, 46 3.5, 64 3.5 C 71.5 3.5, 74 7.5, 74 17.5"
          fill="none"
          stroke={`url(#hoseWall-${uid})`}
          strokeWidth="6.2"
          strokeLinecap="round"
        />
        {/* Subtle braided dark-bronze reinforcement weave */}
        <path
          d="M 13.8 11 C 31 11, 46 3.5, 64 3.5 C 71.5 3.5, 74 7.5, 74 16.5"
          fill="none"
          stroke="#6b523e"
          strokeWidth="5.4"
          strokeDasharray="1.5 2.7"
          opacity="0.34"
        />
        {/* Translucent inner blood lumen */}
        <path
          d="M 12.2 11 C 31 11, 46 3.5, 64 3.5 C 71.5 3.5, 74 7.5, 74 17.5"
          fill="none"
          stroke={displayBloodOz > 0 ? '#42080b' : '#120b0c'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Active Overkill Arterial Blood Pulse Through Translucent Hose */}
        {isSurging && (
          <>
            <path
              d="M 12.2 11 C 31 11, 46 3.5, 64 3.5 C 71.5 3.5, 74 7.5, 74 17.5"
              fill="none"
              stroke={`url(#hoseBlood-${uid})`}
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeDasharray="108"
              className="animate-hose-rush"
              style={{ filter: 'drop-shadow(0 0 5px rgba(239,68,68,0.9))' }}
            />
            <path
              d="M 12.2 11 C 31 11, 46 3.5, 64 3.5 C 71.5 3.5, 74 7.5, 74 17.5"
              fill="none"
              stroke="#fecaca"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeDasharray="4 14"
              className="animate-hose-flow"
              opacity="0.9"
            />
          </>
        )}

        {/* Continuous Matte Glass/Rubber Top Specular Ridge */}
        <path
          d="M 13.2 9.1 C 31 9.1, 46 1.8, 64 1.8 C 70.2 1.8, 72.3 5.5, 72.3 14.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.18"
        />

        {/* Right Brass Compression Union Collar Seated Flush on Jar Crown */}
        <g style={isSurging ? { filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.75))' } : undefined}>
          <rect x="68.5" y="14.5" width="11" height="4.8" rx="1" fill={`url(#hoseBrass-${uid})`} stroke="#1b1109" strokeWidth="0.75" />
          <line x1="70" y1="16.2" x2="78" y2="16.2" stroke="#f0d39f" strokeWidth="0.55" opacity="0.55" />
          <circle cx="71" cy="17.2" r="0.65" fill="#1e130b" />
          <circle cx="77" cy="17.2" r="0.65" fill="#1e130b" />
        </g>
      </svg>

      {/* MAIN ESCALATING ALCHEMICAL VESSEL SVG */}
      <div
        className={`relative transition-transform duration-200 ${isSurging ? 'scale-[1.06]' : 'scale-100'}`}
        style={{
          width: spec.w,
          height: spec.h,
          filter: isSurging
            ? 'drop-shadow(0 0 16px rgba(220,38,38,0.78)) drop-shadow(0 8px 14px rgba(0,0,0,0.95))'
            : 'drop-shadow(0 8px 14px rgba(0,0,0,0.92))',
        }}
      >
        <svg viewBox={`0 0 ${spec.w} ${spec.h}`} width={spec.w} height={spec.h} className="block overflow-visible">
          <defs>
            <clipPath id={`jarInner-${uid}`}>
              <path d={spec.innerPath} />
            </clipPath>

            {/* Tarnished Brass Horizontal Cylindrical Gradient */}
            <linearGradient id={`brassCyl-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e130a" />
              <stop offset="22%" stopColor="#7a5731" />
              <stop offset="44%" stopColor="#c9a063" />
              <stop offset="68%" stopColor="#5e3f20" />
              <stop offset="100%" stopColor="#1a1008" />
            </linearGradient>

            {/* Dark Forged Iron Gradient */}
            <linearGradient id={`ironMetal-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0d0a09" />
              <stop offset="35%" stopColor="#3a2f2a" />
              <stop offset="65%" stopColor="#201916" />
              <stop offset="100%" stopColor="#0a0707" />
            </linearGradient>

            {/* Smoked Obsidian Blown-Glass Cavity */}
            <radialGradient id={`glassBg-${uid}`} cx="42%" cy="46%" r="65%">
              <stop offset="0%" stopColor={displayBloodOz > 0 ? '#1c0608' : '#140c0c'} />
              <stop offset="65%" stopColor="#090304" />
              <stop offset="100%" stopColor="#040102" />
            </radialGradient>

            {/* Deep Arterial Crimson Blood Vertical Gradient */}
            <linearGradient id={`bloodVert-${uid}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#1b0304" />
              <stop offset="26%" stopColor="#4a070b" />
              <stop offset="62%" stopColor="#7a0f15" />
              <stop offset="88%" stopColor="#a81820" />
              <stop offset="100%" stopColor="#cc242c" />
            </linearGradient>

            {/* Cylindrical Liquid Volumetric Shading (dark edges + luminous arterial center) */}
            <linearGradient id={`bloodCylShade-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#080101" stopOpacity="0.68" />
              <stop offset="24%" stopColor="#ef4444" stopOpacity="0.14" />
              <stop offset="52%" stopColor="#000000" stopOpacity="0.04" />
              <stop offset="78%" stopColor="#000000" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#070101" stopOpacity="0.72" />
            </linearGradient>

            {/* Blown-Glass Outer Contour Rim Stroke */}
            <linearGradient id={`glassRim-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isSurging ? '#fca5a5' : '#a88c72'} stopOpacity="0.88" />
              <stop offset="50%" stopColor={isSurging ? '#dc2626' : '#5e4b3c'} stopOpacity="0.78" />
              <stop offset="100%" stopColor={isSurging ? '#ef4444' : '#856b54'} stopOpacity="0.86" />
            </linearGradient>

            {/* Left Curved Blown-Glass Specular Glint */}
            <linearGradient id={`glintGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.44" />
              <stop offset="48%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#fff7ed" stopOpacity="0.22" />
            </linearGradient>
          </defs>

          {/* 1. OUTER SMOKED GLASS WALL BASE */}
          <path d={spec.outerPath} fill="#060203" />
          <path d={spec.innerPath} fill={`url(#glassBg-${uid})`} />

          {/* 2. CLIPPED INTERNAL BLOOD COLUMN + DUAL-LAYER WAVY MENISCUS + BUBBLES */}
          <g clipPath={`url(#jarInner-${uid})`}>
            {/* Subtle backlit arterial ambient haze inside empty headspace when blood present */}
            {fillPct > 0 && (
              <rect
                x="0"
                y={Math.max(0, surfaceY - 22)}
                width={spec.w}
                height="24"
                fill="#7f1d1d"
                opacity={isSurging ? 0.34 : 0.14}
                style={{ transition: 'y 550ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
              />
            )}

            {/* Overkill Active Pour Stream Falling From Neck Into Vessel */}
            {isSurging && (
              <g>
                <line
                  x1={spec.cx}
                  y1="11"
                  x2={spec.cx}
                  y2={Math.min(spec.fillBottomY, surfaceY + 3)}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="9 4"
                  strokeLinecap="round"
                  opacity="0.82"
                  style={{
                    animation: 'jarStreamPulse 0.32s linear infinite',
                    filter: 'drop-shadow(0 0 4px rgba(248,113,113,0.9))',
                  }}
                />
                {fillPct > 0 && (
                  <ellipse
                    cx={spec.cx}
                    cy={surfaceY + 0.5}
                    rx="6.5"
                    ry="1.8"
                    fill="#fecdd3"
                    opacity="0.65"
                  />
                )}
              </g>
            )}

            {/* Rising Crimson Blood Body (smooth GPU transform to meniscus surfaceY) */}
            <g
              style={{
                transform: `translate3d(0, ${surfaceY}px, 0)`,
                transition: 'transform 560ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              {/* Back Meniscus Wave Layer */}
              {fillPct > 0 && (
                <g style={{ animation: 'jarWaveScrollB 3.6s linear infinite' }}>
                  <path d={waveBackPath} fill="#5e0b10" opacity="0.82" />
                </g>
              )}

              {/* Solid Deep Crimson Blood Body Below Meniscus */}
              <rect
                x="0"
                y="1"
                width={spec.w}
                height={Math.max(0, liquidHeight + 24)}
                fill={`url(#bloodVert-${uid})`}
              />

              {/* Front Viscous Meniscus Wave + Specular Crimson Rim */}
              {fillPct > 0 && (
                <g style={{ animation: 'jarWaveScrollA 2.5s linear infinite' }}>
                  <path d={waveFrontPath} fill="#a81820" />
                  <path
                    d={waveFrontCrest}
                    fill="none"
                    stroke={isSurging ? '#fecdd3' : '#fda4af'}
                    strokeWidth={isSurging ? '1.5' : '1.15'}
                    opacity="0.88"
                  />
                </g>
              )}

              {/* Cylindrical 3D Liquid Shading */}
              <rect
                x="0"
                y="-4"
                width={spec.w}
                height={Math.max(0, liquidHeight + 28)}
                fill={`url(#bloodCylShade-${uid})`}
              />
            </g>

            {/* Rising Viscous Micro-Bubbles Clipped Inside Liquid Level */}
            {fillPct > 14 && (
              <g>
                {spec.bubbles.map((b, idx) => (
                  <circle
                    key={idx}
                    cx={b.cx}
                    cy={b.cy}
                    r={b.r}
                    fill="#fda4af"
                    fillOpacity="0.28"
                    stroke="#ffe4e6"
                    strokeWidth="0.45"
                    strokeOpacity="0.55"
                    style={{
                      animation: `${b.anim} ${b.dur} ease-in ${b.delay} infinite`,
                    }}
                  />
                ))}
              </g>
            )}

            {/* Tier 3 Molded Vertical Alchemical Glass Fluting Ribs */}
            {spec.id === 3 && (
              <g opacity="0.12">
                <line x1="20" y1="35" x2="21.5" y2="112" stroke="#fff7ed" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="27.5" y1="32" x2="28.5" y2="115" stroke="#fff7ed" strokeWidth="1" strokeLinecap="round" />
                <line x1="56.5" y1="32" x2="55.5" y2="115" stroke="#fff7ed" strokeWidth="1" strokeLinecap="round" />
                <line x1="64" y1="35" x2="62.5" y2="112" stroke="#fff7ed" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            )}

            {/* Etched Graduation Calibration Marks on Right Glass Curve */}
            <g opacity="0.52">
              {spec.id >= 2 && (
                <line
                  x1={spec.ticks[0].x2}
                  y1={spec.ticks[0].y}
                  x2={spec.ticks[spec.ticks.length - 1].x2}
                  y2={spec.ticks[spec.ticks.length - 1].y}
                  stroke="#cbb092"
                  strokeWidth="0.5"
                  opacity="0.45"
                />
              )}
              {spec.ticks.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1}
                  y1={t.y}
                  x2={t.x2}
                  y2={t.y}
                  stroke={t.major ? '#dec4a4' : '#b89b7e'}
                  strokeWidth={t.major ? '0.95' : '0.65'}
                  strokeLinecap="round"
                />
              ))}
            </g>

            {/* Curved Blown-Glass Specular Highlights & Thick Bottom Lens Pool */}
            <path d={spec.leftShoulderGlint} fill="none" stroke="#fff7ed" strokeWidth="1.6" strokeLinecap="round" opacity="0.34" />
            <path d={spec.leftGlintPath} fill="none" stroke={`url(#glintGrad-${uid})`} strokeWidth="2.1" strokeLinecap="round" />
            <path d={spec.rightGlintPath} fill="none" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.16" />
            <path d={spec.bottomLensPath} fill="none" stroke="#e5c8a8" strokeWidth="1.3" strokeLinecap="round" opacity="0.22" />
          </g>

          {/* 3. OUTER BLOWN-GLASS WALL CONTOUR STROKE */}
          <path d={spec.outerPath} fill="none" stroke={`url(#glassRim-${uid})`} strokeWidth="1.35" />
          <path d={spec.innerPath} fill="none" stroke="#000000" strokeWidth="0.65" opacity="0.65" />

          {/* 4. TIER-SPECIFIC STOPPER CROWN, BRASS BANDS, IRON CAGE & CRADLE BASE */}
          {spec.id === 1 && (
            <g>
              {/* Tier 1: Wax-dipped dark cork & modest brass neck ring */}
              <path d="M 22.5 5.5 L 37.5 5.5 L 36.2 11 L 23.8 11 Z" fill="#3b2517" stroke="#1a1009" strokeWidth="0.7" />
              <rect x="20.5" y="2.2" width="19" height="4.2" rx="1.2" fill={`url(#brassCyl-${uid})`} stroke="#1a1008" strokeWidth="0.7" />
              <line x1="22" y1="3.6" x2="38" y2="3.6" stroke="#f0d39f" strokeWidth="0.5" opacity="0.5" />
              {/* Subtle crimson wax seal drip down neck lip */}
              <path d="M 22 6.4 Q 24 11, 25.4 8.5 Q 26.8 6.4, 28.5 7.4" fill="#6b0f12" stroke="#991b1b" strokeWidth="0.45" />
              {/* Compact forged brass & iron saucer cradle */}
              <path
                d="M 14 82.5 L 46 82.5 L 44 89.5 C 43.2 91.5, 41 92.5, 38 92.5 L 22 92.5 C 19 92.5, 16.8 91.5, 16 89.5 Z"
                fill={`url(#brassCyl-${uid})`}
                stroke="#180f08"
                strokeWidth="0.85"
              />
              <line x1="16" y1="84.5" x2="44" y2="84.5" stroke="#e8c88f" strokeWidth="0.5" opacity="0.42" />
              <text x="30" y="90.2" textAnchor="middle" fill="#e8c88f" opacity="0.55" fontSize="5.2" fontFamily="Cinzel, serif" fontWeight="700">
                I
              </text>
            </g>
          )}

          {spec.id === 2 && (
            <g>
              {/* Tier 2: Flanged heavy brass stopper with side pressure thumbscrew */}
              <rect x="20" y="2" width="24" height="5.2" rx="1.2" fill={`url(#brassCyl-${uid})`} stroke="#1a1008" strokeWidth="0.75" />
              <rect x="22" y="7" width="20" height="4" rx="0.6" fill={`url(#brassCyl-${uid})`} stroke="#1a1008" strokeWidth="0.7" />
              <line x1="21.5" y1="3.6" x2="42.5" y2="3.6" stroke="#f2d6a2" strokeWidth="0.55" opacity="0.52" />
              {/* Side brass thumbscrew */}
              <rect x="44" y="4.5" width="3.5" height="2" fill="#8f6a38" stroke="#1a1008" strokeWidth="0.5" />
              <ellipse cx="48.2" cy="5.5" rx="1.2" ry="2.4" fill="#c49a5c" stroke="#1a1008" strokeWidth="0.55" />

              {/* Upper Riveted Tarnished-Brass Compression Band */}
              <rect x="5.5" y="33" width="53" height="5.2" rx="1.2" fill={`url(#brassCyl-${uid})`} stroke="#180f08" strokeWidth="0.8" />
              <line x1="7" y1="34.5" x2="57" y2="34.5" stroke="#f0d39f" strokeWidth="0.5" opacity="0.45" />
              {[11.5, 32, 52.5].map((rx) => (
                <circle key={rx} cx={rx} cy="35.6" r="1.05" fill="#23160c" stroke="#e2bf82" strokeWidth="0.4" />
              ))}

              {/* Lower Riveted Tarnished-Brass Compression Band */}
              <rect x="5.5" y="102.5" width="53" height="5.2" rx="1.2" fill={`url(#brassCyl-${uid})`} stroke="#180f08" strokeWidth="0.8" />
              <line x1="7" y1="104" x2="57" y2="104" stroke="#f0d39f" strokeWidth="0.5" opacity="0.45" />
              {[11.5, 32, 52.5].map((rx) => (
                <circle key={rx} cx={rx} cy="105.1" r="1.05" fill="#23160c" stroke="#e2bf82" strokeWidth="0.4" />
              ))}

              {/* Stepped Bronze Pedestal Base */}
              <path
                d="M 12.5 117 L 51.5 117 L 53 121.5 L 50.5 127.5 C 49.5 129, 47.5 129.5, 45 129.5 L 19 129.5 C 16.5 129.5, 14.5 129, 13.5 127.5 L 11 121.5 Z"
                fill={`url(#brassCyl-${uid})`}
                stroke="#180f08"
                strokeWidth="0.85"
              />
              <line x1="13" y1="121.5" x2="51" y2="121.5" stroke="#e8c88f" strokeWidth="0.5" opacity="0.42" />
              <text x="32" y="127.2" textAnchor="middle" fill="#e8c88f" opacity="0.58" fontSize="5.4" fontFamily="Cinzel, serif" fontWeight="700">
                II
              </text>
            </g>
          )}

          {spec.id === 3 && (
            <g>
              {/* Tier 3: Ornate Double-Valve Brass Manifold Crown */}
              <rect x="26" y="2" width="32" height="5.5" rx="1.4" fill={`url(#brassCyl-${uid})`} stroke="#180f08" strokeWidth="0.8" />
              <rect x="28.5" y="7.2" width="27" height="4.2" rx="0.8" fill={`url(#brassCyl-${uid})`} stroke="#180f08" strokeWidth="0.75" />
              <line x1="27.5" y1="3.7" x2="56.5" y2="3.7" stroke="#f2d6a2" strokeWidth="0.6" opacity="0.55" />
              {/* Dual flanking brass pressure bleed-cocks */}
              <rect x="21.5" y="4.5" width="4.5" height="2.2" fill="#7a5731" stroke="#180f08" strokeWidth="0.55" />
              <circle cx="20.8" cy="5.6" r="1.8" fill="#6b0f12" stroke="#c49a5c" strokeWidth="0.55" />
              <rect x="58" y="4.5" width="4.5" height="2.2" fill="#7a5731" stroke="#180f08" strokeWidth="0.55" />
              <circle cx="63.2" cy="5.6" r="1.8" fill="#6b0f12" stroke="#c49a5c" strokeWidth="0.55" />

              {/* Slender Forged Dark-Iron Protective Vertical Cage Straps (hugging outer flanks) */}
              <path
                d="M 27.5 19.5 C 18 23.5, 13.5 29, 13.8 39 L 15.8 111.5 C 16 117.5, 18.5 121.5, 22.5 124"
                fill="none"
                stroke={`url(#ironMetal-${uid})`}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M 27.5 19.5 C 18 23.5, 13.5 29, 13.8 39 L 15.8 111.5 C 16 117.5, 18.5 121.5, 22.5 124"
                fill="none"
                stroke="#6b5645"
                strokeWidth="0.6"
                opacity="0.5"
              />
              <path
                d="M 56.5 19.5 C 66 23.5, 70.5 29, 70.2 39 L 68.2 111.5 C 68 117.5, 65.5 121.5, 61.5 124"
                fill="none"
                stroke={`url(#ironMetal-${uid})`}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M 56.5 19.5 C 66 23.5, 70.5 29, 70.2 39 L 68.2 111.5 C 68 117.5, 65.5 121.5, 61.5 124"
                fill="none"
                stroke="#6b5645"
                strokeWidth="0.6"
                opacity="0.5"
              />

              {/* Upper Riveted Brass & Iron Pressure Hoop */}
              <rect x="4.8" y="38.2" width="74.4" height="5.4" rx="1.4" fill={`url(#brassCyl-${uid})`} stroke="#140c07" strokeWidth="0.85" />
              <line x1="6.5" y1="39.8" x2="77.5" y2="39.8" stroke="#f0d39f" strokeWidth="0.55" opacity="0.48" />
              {/* Center forged diamond clasp stud */}
              <polygon points="42,37.4 45.2,40.9 42,44.4 38.8,40.9" fill="#2b1b0f" stroke="#d4af73" strokeWidth="0.65" />
              <circle cx="42" cy="40.9" r="1" fill="#b91c1c" />
              {[14.2, 69.8].map((rx) => (
                <circle key={rx} cx={rx} cy="40.9" r="1.2" fill="#1c120a" stroke="#e2bf82" strokeWidth="0.45" />
              ))}

              {/* Lower Riveted Brass & Iron Pressure Hoop */}
              <rect x="7" y="108.5" width="70" height="5.4" rx="1.4" fill={`url(#brassCyl-${uid})`} stroke="#140c07" strokeWidth="0.85" />
              <line x1="8.5" y1="110.1" x2="75.5" y2="110.1" stroke="#f0d39f" strokeWidth="0.55" opacity="0.45" />
              <polygon points="42,107.7 45,111.2 42,114.7 39,111.2" fill="#2b1b0f" stroke="#d4af73" strokeWidth="0.65" />
              {[16, 68].map((rx) => (
                <circle key={rx} cx={rx} cy="111.2" r="1.2" fill="#1c120a" stroke="#e2bf82" strokeWidth="0.45" />
              ))}

              {/* Heavy Clawed Iron-and-Brass Reliquary Cradle Base */}
              <path
                d="M 14.5 121.5 L 69.5 121.5 L 72.5 126 L 69 133 C 67.8 134.8, 65.5 135.5, 62 135.5 L 22 135.5 C 18.5 135.5, 16.2 134.8, 15 133 L 11.5 126 Z"
                fill={`url(#brassCyl-${uid})`}
                stroke="#140c07"
                strokeWidth="0.9"
              />
              {/* Side forged iron cradle claws */}
              <path d="M 13.5 122 L 10.5 126.5 L 14.5 131.5 L 18 126.5 Z" fill={`url(#ironMetal-${uid})`} stroke="#7c5e3f" strokeWidth="0.5" />
              <path d="M 70.5 122 L 73.5 126.5 L 69.5 131.5 L 66 126.5 Z" fill={`url(#ironMetal-${uid})`} stroke="#7c5e3f" strokeWidth="0.5" />
              <line x1="15" y1="125.8" x2="69" y2="125.8" stroke="#e8c88f" strokeWidth="0.55" opacity="0.42" />
              <text x="42" y="132.5" textAnchor="middle" fill="#e8c88f" opacity="0.62" fontSize="5.6" fontFamily="Cinzel, serif" fontWeight="700">
                III
              </text>
            </g>
          )}
        </svg>

        {/* LIT GLOWING CRIMSON / BONE READOUT FLOATING DIRECTLY OVER GLASS (Zero UI Chrome!) */}
        <div
          style={{ top: `${spec.readoutTopPct}%` }}
          className="pointer-events-none absolute inset-x-0 -translate-y-1/2 z-20 flex flex-col items-center justify-center leading-none"
        >
          <span
            className={`font-['Cinzel',_serif] font-black tracking-wide transition-all duration-150 ${
              spec.id === 3 ? 'text-[19px]' : spec.id === 2 ? 'text-[17px]' : 'text-[15.5px]'
            } ${isSurging ? 'text-white scale-110' : 'text-[#fce7e7] scale-100'}`}
            style={{
              textShadow: isSurging
                ? '0 0 12px rgba(248,113,113,1), 0 0 4px rgba(220,38,38,1), 0 2px 4px rgba(0,0,0,1)'
                : '0 0 8px rgba(185,28,28,0.68), 0 1px 4px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,1)',
            }}
          >
            {shownOz}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-[1px] bg-gradient-to-r from-transparent to-[#f87171]/60" />
            <span
              className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#fca5a5]"
              style={{
                textShadow: '0 0 6px rgba(220,38,38,0.85), 0 1px 3px rgba(0,0,0,1), 0 0 4px rgba(0,0,0,0.98)',
              }}
            >
              oz
            </span>
            <span className="w-1.5 h-[1px] bg-gradient-to-l from-transparent to-[#f87171]/60" />
          </div>
        </div>
      </div>

      {/* Floating Overkill Increment Telemetry */}
      {delta !== null && (
        <span
          className="pointer-events-none absolute -top-2.5 -right-2 z-30 text-[10.5px] font-mono font-black text-[#fecaca] animate-telemetry-pop whitespace-nowrap"
          style={{ textShadow: '0 0 8px rgba(239,68,68,0.95), 0 1px 4px rgba(0,0,0,1)' }}
        >
          +{delta} oz
        </span>
      )}
    </div>
  );
};

/* --- STANDALONE DIEGETIC BONE OSSUARY RELIQUARY --- */
export const BoneOssuaryPlaque: React.FC<{ bones: number; boneShaking: boolean }> = ({
  bones,
  boneShaking,
}) => {
  const prevRef = useRef(bones);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    const diff = bones - prevRef.current;
    prevRef.current = bones;
    if (diff !== 0) {
      setDelta(diff);
      const t = window.setTimeout(() => setDelta(null), 950);
      return () => window.clearTimeout(t);
    }
  }, [bones]);

  const baseUrl = import.meta.env.BASE_URL || './';

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(30,24,21,0.88) 0%, rgba(14,11,10,0.96) 100%), url("${baseUrl}assets/text/mapbg.jpg")`,
        backgroundSize: 'cover, 180px 180px',
      }}
      className={`relative w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[3px] border transition-all duration-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,232,200,0.08),0_5px_14px_rgba(0,0,0,0.9)] select-none ${
        delta && delta > 0
          ? 'border-[#e5c16b] shadow-[0_0_14px_rgba(229,193,107,0.45),inset_0_0_10px_rgba(229,193,107,0.2)] scale-[1.05]'
          : delta && delta < 0
            ? 'border-red-500/85 shadow-[0_0_12px_rgba(239,68,68,0.45)] scale-[0.95]'
            : 'border-[#5c4836]/90'
      }`}
      title={`Bones: ${bones}`}
    >
      {/* Brass Corner Rivets */}
      <span className="pointer-events-none absolute top-1 left-1 w-[2.5px] h-[2.5px] rounded-full bg-[#9c7a4c]/70" />
      <span className="pointer-events-none absolute top-1 right-1 w-[2.5px] h-[2.5px] rounded-full bg-[#9c7a4c]/70" />
      <span className="pointer-events-none absolute bottom-1 left-1 w-[2.5px] h-[2.5px] rounded-full bg-[#9c7a4c]/70" />
      <span className="pointer-events-none absolute bottom-1 right-1 w-[2.5px] h-[2.5px] rounded-full bg-[#9c7a4c]/70" />

      {/* Carved Ivory Bone Glyph */}
      <svg
        viewBox="0 0 24 24"
        className={`relative z-10 w-4 h-4 shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${boneShaking || delta ? 'animate-bone-shake' : ''}`}
        aria-hidden="true"
      >
        <path
          d="M17.6 3.6a2.3 2.3 0 0 0-3.2 2.9L6.5 14.4a2.3 2.3 0 1 0-1.6 4.1 2.3 2.3 0 1 0 4.1-1.6l7.9-7.9a2.3 2.3 0 1 0 1.6-4.1 2.3 2.3 0 0 0-.9-1.3z"
          fill="#e8dcc4"
          stroke="#3a2d21"
          strokeWidth="1.2"
        />
      </svg>

      {/* Engraved Divider */}
      <span className="h-4 w-px bg-gradient-to-b from-transparent via-[#6e553e]/70 to-transparent shrink-0" />

      {/* Bone Count */}
      <div className="relative z-10 flex items-baseline justify-center flex-1">
        <span
          className={`font-['Cinzel',_serif] text-base font-black tracking-wider leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,1)] transition-colors duration-200 ${
            delta && delta > 0
              ? 'text-amber-200'
              : delta && delta < 0
                ? 'text-red-300'
                : 'text-[#f3e4c8]'
          }`}
        >
          {bones}
        </span>
      </div>

      {delta !== null && (
        <span
          className={`pointer-events-none absolute -top-2.5 right-1 text-[10px] font-mono font-black drop-shadow-[0_1px_4px_rgba(0,0,0,1)] animate-telemetry-pop ${
            delta > 0 ? 'text-amber-200' : 'text-red-400'
          }`}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </div>
  );
};

export default DuelTelemetryBanner;
