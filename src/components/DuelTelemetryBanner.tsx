import React, { useEffect, useRef, useState } from 'react';
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

const JAR_TIERS: Record<1 | 2 | 3, { w: number; h: number; cap: number; ticks: number; stop: number; neck: number; base: number; hoseShift: number }> = {
  1: { w: 52, h: 80, cap: 12.5, ticks: 4, stop: 20, neck: 16, base: 36, hoseShift: 0 },
  2: { w: 52, h: 116, cap: 50, ticks: 6, stop: 20, neck: 16, base: 36, hoseShift: 0 },
  3: { w: 76, h: 116, cap: 100, ticks: 8, stop: 28, neck: 22, base: 52, hoseShift: 12 },
};

/* --- STANDALONE DIEGETIC BLOOD BANK VIAL + RUNNEL SIPHON HOSE --- */
export const BloodBankVessel: React.FC<{ displayBloodOz: number; isOverkill?: boolean; tier?: 1 | 2 | 3 }> = ({
  displayBloodOz,
  isOverkill = false,
  tier = 1,
}) => {
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
  const dims = JAR_TIERS[tier] ?? JAR_TIERS[1];
  const fillPct = displayBloodOz > 0
    ? (tier === 1 ? Math.min(100, Math.max(18, displayBloodOz * 8)) : Math.min(100, (displayBloodOz / dims.cap) * 100))
    : 0;

  return (
    <div
      className="relative flex flex-col items-center select-none pt-1"
      title={`Blood Bank: ${displayBloodOz} oz (Overkill Blood)`}
    >
      {/* Semi-Opaque Siphon Hose Connecting Runnel Right Edge -> Top of Vial Stopper */}
      <svg
        viewBox="0 0 82 40"
        className="pointer-events-none absolute -left-[46px] sm:-left-[48px] -top-[14px] w-[82px] h-[40px] overflow-visible z-20"
        style={{ marginLeft: dims.hoseShift }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hoseCasingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a2f2a" />
            <stop offset="50%" stopColor="#1d1716" />
            <stop offset="100%" stopColor="#2c221e" />
          </linearGradient>
          <linearGradient id="hoseBloodGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="55%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>

        {/* Left Brass Spigot Mounted into Runnel Side */}
        <rect x="-2" y="4" width="6" height="9" rx="1.5" fill="#4b3523" stroke="#7c5a38" strokeWidth="0.9" />
        <line x1="0.5" y1="5" x2="0.5" y2="12" stroke="#b98f55" strokeWidth="0.7" opacity="0.6" />

        {/* Outer Opaque Rubber/Frosted Tube Casing arching into the top of the stopper */}
        <path
          d="M 3 8.5 C 24 8.5, 42 2, 61 2 C 70 2, 72 6, 72 16"
          fill="none"
          stroke="#090707"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 3 8.5 C 24 8.5, 42 2, 61 2 C 70 2, 72 6, 72 16"
          fill="none"
          stroke="url(#hoseCasingGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Inner Cloudy Core */}
        <path
          d="M 3 8.5 C 24 8.5, 42 2, 61 2 C 70 2, 72 6, 72 16"
          fill="none"
          stroke={displayBloodOz > 0 ? '#360b0d' : '#141010'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Rapid Blood Surge Fill When Overkill Applies */}
        {isSurging && (
          <>
            <path
              d="M 3 8.5 C 24 8.5, 42 2, 61 2 C 70 2, 72 6, 72 16"
              fill="none"
              stroke="url(#hoseBloodGrad)"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeDasharray="96"
              className="animate-hose-rush"
              style={{ filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.85))' }}
            />
            <path
              d="M 3 8.5 C 24 8.5, 42 2, 61 2 C 70 2, 72 6, 72 16"
              fill="none"
              stroke="#fecaca"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray="5 19"
              className="animate-hose-flow"
              opacity="0.85"
            />
          </>
        )}

        {/* Subtle Matte Tube Specular Ridge */}
        <path
          d="M 4 6.8 C 24 6.8, 42 0.4, 61 0.4 C 69 0.4, 70.5 4.5, 70.5 13"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.16"
        />

        {/* Top Brass Intake Collar Seated Flush on Vial Stopper */}
        <rect x="67.5" y="13.5" width="9" height="4.5" rx="1" fill="#5e4122" stroke="#9c7342" strokeWidth="0.9" />
      </svg>

      {/* Vial Brass Stopper & Narrow Neck */}
      <div className="relative z-10 flex flex-col items-center">
        <div style={{ width: dims.stop }} className="w-5 h-2 rounded-t-[2px] bg-gradient-to-b from-[#9c7342] via-[#5e4122] to-[#2e1e10] border border-[#b88c52]/70 shadow-sm" />
        <div style={{ width: dims.neck }} className="w-4 h-2 bg-[#0d0607] border-x border-[#8c705a]/75 relative overflow-hidden">
          <div className="absolute inset-y-0 left-[2px] w-[1px] bg-white/30" />
        </div>
      </div>

      {/* Main Glass Vial Body */}
      <div
        style={{ width: dims.w, height: dims.h }}
        className={`relative -mt-[1px] w-[52px] h-[80px] rounded-t-[10px] rounded-b-[18px] bg-[#0a0405]/95 border-[1.5px] overflow-hidden flex flex-col justify-end transition-all duration-200 shadow-[inset_0_3px_12px_rgba(0,0,0,0.96),0_6px_14px_rgba(0,0,0,0.9)] ${
          isSurging
            ? 'border-red-300 ring-2 ring-red-500/75 shadow-[0_0_26px_rgba(239,68,68,0.95),inset_0_0_18px_rgba(239,68,68,0.65)] scale-[1.08]'
            : 'border-[#7c614c]/85'
        }`}
      >
        {/* Rising Crimson Blood Column */}
        <div
          className={`w-full transition-all duration-500 relative ${isSurging ? 'brightness-125' : ''}`}
          style={{
            height: `${fillPct}%`,
            background: 'linear-gradient(to top, #2e0306 0%, #6b0a10 42%, #991b1b 78%, #dc2626 100%)',
          }}
        >
          {fillPct > 0 && (
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-300/60 via-rose-100/95 to-red-300/60 shadow-[0_0_6px_rgba(254,202,202,0.85)]" />
          )}
        </div>

        {/* Etched Graduation Ticks */}
        <div className="pointer-events-none absolute inset-y-2.5 right-1 flex flex-col justify-between items-end opacity-45 z-10">
            {Array.from({ length: dims.ticks }).map((_, i) => (
              <span key={i} className={`h-[1px] bg-[#d4b89c] ${i % 2 === 0 ? 'w-2' : 'w-1.5'}`} />
            ))}
        </div>

        {/* Curved Glass Specular Reflections */}
        <div className="pointer-events-none absolute top-2 bottom-3 left-[4px] w-[2px] rounded-full bg-gradient-to-b from-white/40 via-white/15 to-white/5 z-20" />
        <div className="pointer-events-none absolute top-3 bottom-4 right-[4px] w-[1px] rounded-full bg-white/15 z-20" />

        {/* Centered OZ Readout Inside Vial */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center leading-none">
          <span
            className={`font-['Cinzel',_serif] text-[15px] font-black tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,1)] transition-all duration-150 ${
              isSurging ? 'text-white scale-110' : 'text-[#fde2e2] scale-100'
            }`}
          >
            {shownOz}
          </span>
          <span className="font-mono text-[7.5px] font-bold uppercase tracking-[0.14em] text-red-200/85 mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
            oz
          </span>
        </div>
      </div>

      {/* Brass Cradle Base */}
      <div style={{ width: dims.base }} className="relative z-10 -mt-1 w-9 h-2 rounded-b-[4px] bg-gradient-to-b from-[#4f3720] to-[#1e130b] border border-[#7c5a38]/75 shadow-[0_3px_6px_rgba(0,0,0,0.9)]" />

      {delta !== null && (
        <span className="pointer-events-none absolute -top-2 -right-2 z-30 text-[10px] font-mono font-black text-red-200 drop-shadow-[0_1px_4px_rgba(0,0,0,1)] animate-telemetry-pop whitespace-nowrap">
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
