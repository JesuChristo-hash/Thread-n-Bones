import React, { useEffect, useRef, useState } from 'react';

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
  isTurnOneDanger: boolean;
  items: (ResolvedRelic | null)[];
  phase: string;
  itemTargetSourceSlot: number | null;
  onUseItem: (idx: number) => void;
}

export const DuelTelemetryBanner: React.FC<DuelTelemetryBannerProps> = ({
  turnNumber,
  isTurnOneDanger,
  items,
  phase,
  itemTargetSourceSlot,
  onUseItem,
}) => {
  const baseUrl = import.meta.env.BASE_URL || './';

  return (
    <div className="relative w-[84px] sm:w-[90px] flex flex-col items-center select-none shrink-0">
      {/* Top Wooden Banner Rod with Brass Finials */}
      <div
        className="relative z-10 w-[calc(100%+10px)] h-2.5 rounded-full border border-[#6e4a2b]/90 shadow-[0_3px_8px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,224,175,0.22)] flex items-center justify-between"
        style={{
          backgroundColor: '#2d1b10',
          backgroundImage: `linear-gradient(180deg, rgba(255,215,165,0.16), rgba(0,0,0,0.45)), url("${baseUrl}assets/text/wood.jpg")`,
          backgroundSize: 'cover, 160px 160px',
        }}
      >
        <span className="-ml-1 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#e2be76] via-[#9c7238] to-[#3f2912] border border-[#2a190a] shadow-sm" />
        <span className="-mr-1 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#e2be76] via-[#9c7238] to-[#3f2912] border border-[#2a190a] shadow-sm" />
      </div>

      {/* Hanging Crimson Cloth Body */}
      <div
        className={`relative w-full -mt-0.5 px-2 pt-2.5 pb-3 rounded-b-[10px] border-x border-b overflow-hidden shadow-[0_12px_26px_rgba(0,0,0,0.9),inset_0_8px_18px_rgba(0,0,0,0.62)] transition-colors duration-300 ${
          isTurnOneDanger
            ? 'border-red-500/90 shadow-[0_0_16px_rgba(220,38,38,0.55)]'
            : 'border-[#7a3c2e]/90'
        }`}
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #6b0f12 0%, #44080a 54%, #1d0405 100%)',
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
        {/* Stitched Gold-Thread Banner Seam */}
        <div className="pointer-events-none absolute inset-1.5 border border-dashed border-[#c49a5c]/45 rounded-b-[7px]" />
        {/* Woven Center Fringe Accent at Bottom Hem */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#3a0a0a] via-[#cca059]/80 to-[#3a0a0a]" />

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
                  className={`relative z-10 w-10 h-10 rounded-[2px] border flex items-center justify-center text-base outline-none transition-all duration-150 ${
                    item
                      ? isTargetingThis
                        ? 'border-red-400 bg-red-950/75 shadow-[0_0_12px_rgba(239,68,68,0.85)] scale-105 animate-pulse cursor-pointer'
                        : 'border-[#8c5a3c]/85 bg-gradient-to-b from-[#230b0c]/95 to-[#120506]/95 hover:border-[#e5c16b] hover:scale-105 active:scale-95 shadow-[inset_0_1px_0_rgba(255,220,180,0.12),0_3px_8px_rgba(0,0,0,0.85)] cursor-pointer'
                      : 'border-[#5a241e]/60 bg-[#140606]/65 cursor-not-allowed opacity-50 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)]'
                  }`}
                >
                  {item ? (
                    <span>{item.emoji}</span>
                  ) : (
                    <span className="text-[#8a5d42]/70 text-xs font-mono">•</span>
                  )}
                </button>
              );
            })}
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

  useEffect(() => {
    const diff = displayBloodOz - prevRef.current;
    prevRef.current = displayBloodOz;
    if (diff > 0) {
      setDelta(diff);
      const t = window.setTimeout(() => setDelta(null), 1300);
      return () => window.clearTimeout(t);
    }
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
        className={`relative -mt-[1px] w-[52px] h-[80px] rounded-t-[10px] rounded-b-[18px] bg-[#0a0405]/95 border-[1.5px] overflow-hidden flex flex-col justify-end transition-all duration-300 shadow-[inset_0_3px_12px_rgba(0,0,0,0.96),0_6px_14px_rgba(0,0,0,0.9)] ${
          isSurging
            ? 'border-red-400/95 shadow-[0_0_18px_rgba(239,68,68,0.8),inset_0_0_12px_rgba(220,38,38,0.5)] scale-[1.05]'
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
            className={`font-['Cinzel',_serif] text-[15px] font-black tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,1)] transition-colors duration-200 ${
              isSurging ? 'text-white' : 'text-[#fde2e2]'
            }`}
          >
            {displayBloodOz}
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
