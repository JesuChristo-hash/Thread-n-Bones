import React, { useId } from 'react';

export interface BloodRunnelGaugeProps {
  scale: number;
  winTarget: number;
  isOverkill: boolean;
  isScaleHeavySlam: boolean;
  scaleRumble: boolean;
  isAmpouleCracked: boolean;
  isTurnOneDanger?: boolean;
}

// Architectural gothic chamfered-slate monolith silhouette (clean beveled crown, shaft waist, equilibrium flare, and pedestal foot)
const SLATE_POLYGON_CLIP =
  'polygon(8px 1px, 48px 1px, 54px 8px, 54px 23px, 51.5px 27px, 51.5px 189px, 54px 193px, 54px 203px, 51.5px 207px, 51.5px 369px, 54px 373px, 54px 388px, 48px 395px, 8px 395px, 2px 388px, 2px 373px, 4.5px 369px, 4.5px 207px, 2px 203px, 2px 193px, 4.5px 189px, 4.5px 27px, 2px 23px, 2px 8px)';

const SLATE_POLYGON_POINTS =
  '8,1 48,1 54,8 54,23 51.5,27 51.5,189 54,193 54,203 51.5,207 51.5,369 54,373 54,388 48,395 8,395 2,388 2,373 4.5,369 4.5,207 2,203 2,193 4.5,189 4.5,27 2,23 2,8';

const SLATE_INNER_GROOVE_POINTS =
  '10.5,4.2 45.5,4.2 50.5,9.8 50.5,22 48.2,26 48.2,370 50.5,374 50.5,386.2 45.5,391.8 10.5,391.8 5.5,386.2 5.5,374 7.8,370 7.8,26 5.5,22 5.5,9.8';

export const BloodRunnelGauge: React.FC<BloodRunnelGaugeProps> = ({
  scale,
  winTarget,
  isOverkill,
  isScaleHeavySlam,
  scaleRumble,
  isAmpouleCracked,
  isTurnOneDanger = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const baseUrl = import.meta.env.BASE_URL || './';
  const totalSpan = winTarget + 5;
  const isOverflowing = isOverkill || scale >= winTarget;
  const isPlayerDanger = scale <= -3;

  const fillPercent = isOverflowing
    ? 100
    : Math.min(100, Math.max(0, ((scale + 5) / totalSpan) * 100));

  // Position of the +4 hydraulic limit score line (matches scale = 4 on the glass interior)
  const limitFromBottomPct = Math.min(94, Math.max(8, ((4 + 5) / totalSpan) * 100));
  const limitFromTopPct = 100 - limitFromBottomPct;

  const tickValues = Array.from({ length: totalSpan + 1 }, (_, i) => winTarget - i);

  return (
    <div
      style={{
        isolation: 'isolate',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      }}
      className={`w-14 h-[396px] relative flex flex-col items-center justify-between py-2.5 select-none ${
        isScaleHeavySlam ? 'animate-scale-heavy-slam' : scaleRumble ? 'animate-scale-rumble' : ''
      }`}
      title={`Runnel Balance: ${scale === 0 ? '0 (Balanced)' : scale > 0 ? `+${scale}` : `${scale}`} (Target +${winTarget})`}
    >
      {/* 1. ARCHITECTURAL CHAMFERED AGED-SLATE & FORGED BRASS MONOLITH HOUSING */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px -z-10"
        style={{
          filter: isOverflowing
            ? 'drop-shadow(0 0 12px rgba(185,28,28,0.48)) drop-shadow(0 6px 12px rgba(0,0,0,0.94))'
            : 'drop-shadow(0 6px 12px rgba(0,0,0,0.92))',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            clipPath: SLATE_POLYGON_CLIP,
            backgroundImage: `linear-gradient(180deg, rgba(28,23,20,0.58) 0%, rgba(13,11,11,0.78) 48%, rgba(6,5,5,0.92) 100%), radial-gradient(ellipse 85% 32% at 50% 8%, rgba(107,15,18,${isOverflowing ? '0.44' : '0.12'}) 0%, transparent 100%), url("${baseUrl}assets/text/slate.jpg")`,
            backgroundSize: 'cover, cover, 140px 140px',
            backgroundPosition: 'center, center, center',
          }}
        />
        {/* Beveled Architectural Stone Frame, Engraved Groove & Forged Brass Corner Clasps */}
        <svg viewBox="0 0 56 396" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`slateEdge-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isOverflowing ? '#c93838' : '#8a7056'} stopOpacity="0.92" />
              <stop offset="45%" stopColor="#46392e" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#211914" stopOpacity="0.96" />
            </linearGradient>
            <linearGradient id={`monolithBrass-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#24160b" />
              <stop offset="28%" stopColor="#8f6a38" />
              <stop offset="52%" stopColor="#cfa668" />
              <stop offset="78%" stopColor="#5c3e1f" />
              <stop offset="100%" stopColor="#1b1109" />
            </linearGradient>
            <linearGradient id={`troughShade-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#050303" stopOpacity="0.92" />
              <stop offset="18%" stopColor="#0b0707" stopOpacity="0.62" />
              <stop offset="50%" stopColor="#140c0c" stopOpacity="0.45" />
              <stop offset="82%" stopColor="#0b0707" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#050303" stopOpacity="0.92" />
            </linearGradient>
          </defs>

          {/* Outer dark shadow & crisp chamfered stone bevel */}
          <polygon points={SLATE_POLYGON_POINTS} fill="none" stroke="#070505" strokeWidth="2.4" strokeLinejoin="miter" />
          <polygon points={SLATE_POLYGON_POINTS} fill="none" stroke={`url(#slateEdge-${uid})`} strokeWidth="1.2" strokeLinejoin="miter" />

          {/* Subtle engraved inner brass/stone frame groove */}
          <polygon
            points={SLATE_INNER_GROOVE_POINTS}
            fill="none"
            stroke={isOverflowing ? 'rgba(220,60,60,0.34)' : 'rgba(196,154,92,0.2)'}
            strokeWidth="0.7"
            strokeLinejoin="miter"
          />

          {/* Recessed carved vertical stone channel cradling the glass ampoule */}
          <rect x="14.5" y="25" width="27" height="346" rx="4" fill={`url(#troughShade-${uid})`} stroke="#2b221c" strokeWidth="0.75" opacity="0.88" />

          {/* Forged Tarnished-Brass Crown & Foot Clamping Plates */}
          <path
            d="M 8 0.6 L 48 0.6 L 54.4 7.8 L 54.4 13 L 50.8 13 L 50.8 9.2 L 46.2 4 L 9.8 4 L 5.2 9.2 L 5.2 13 L 1.6 13 L 1.6 7.8 Z"
            fill={`url(#monolithBrass-${uid})`}
            stroke="#140c07"
            strokeWidth="0.75"
          />
          <path
            d="M 8 395.4 L 48 395.4 L 54.4 388.2 L 54.4 383 L 50.8 383 L 50.8 386.8 L 46.2 392 L 9.8 392 L 5.2 386.8 L 5.2 383 L 1.6 383 L 1.6 388.2 Z"
            fill={`url(#monolithBrass-${uid})`}
            stroke="#140c07"
            strokeWidth="0.75"
          />

          {/* Subtle architectural stone cracks (minimal, crisp, intentional) */}
          <path d="M 8 68 L 12 73 L 10.5 79" fill="none" stroke="#080605" strokeWidth="0.75" opacity="0.6" />
          <path d="M 48 286 L 44.5 292 L 46.5 299" fill="none" stroke="#080605" strokeWidth="0.75" opacity="0.6" />

          {/* Corner forged brass rivets anchoring the crown & foot brackets */}
          {[
            [7.5, 9],
            [48.5, 9],
            [7.5, 387],
            [48.5, 387],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="2.1" fill="#090706" />
              <circle cx={cx} cy={cy} r="1.45" fill="#4f371e" stroke="#cfa668" strokeWidth="0.45" />
              <circle cx={cx - 0.4} cy={cy - 0.4} r="0.45" fill="#f5dca8" opacity="0.72" />
            </g>
          ))}
        </svg>
      </div>

      {/* 2. ESCALATED CYCLE RITUAL WAX & BRASS SEAL (+7 / +13) */}
      {winTarget > 5 && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center"
          title={`Escalated Ritual: +${winTarget} required to tip the scales`}
        >
          <div className="relative flex items-center justify-center px-2 py-0.5">
            <svg viewBox="0 0 42 20" className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]" aria-hidden="true">
              <path
                d="M 4 10 C 3 5, 7 2, 13 2.5 C 18 1, 24 1, 29 2.5 C 35 2, 39 5, 38 10 C 39 15, 35 18, 29 17.5 C 24 19, 18 19, 13 17.5 C 7 18, 3 15, 4 10 Z"
                fill="#290608"
                stroke="#b08749"
                strokeWidth="1"
              />
              <path
                d="M 6.5 10 C 6 6.5, 9 4.2, 14 4.5 C 18.5 3.6, 23.5 3.6, 28 4.5 C 33 4.2, 36 6.5, 35.5 10 C 36 13.5, 33 15.8, 28 15.5 C 23.5 16.4, 18.5 16.4, 14 15.5 C 9 15.8, 6 13.5, 6.5 10 Z"
                fill="none"
                stroke="#7f1d1d"
                strokeWidth="0.6"
                opacity="0.7"
              />
            </svg>
            <span
              className="relative font-mono text-[9.5px] font-black tracking-wider text-[#fcd9a0] leading-none"
              style={{ textShadow: '0 0 6px rgba(220,38,38,0.85), 0 1px 2px rgba(0,0,0,1)' }}
            >
              +{winTarget}
            </span>
          </div>
        </div>
      )}

      {/* 3. TOP FORGED IRON SLUICE GRATE (+winTarget / OVERKILL BASIN) */}
      <div
        className="relative z-20 w-[34px] h-[14px] flex items-center justify-center"
        title={`Opponent Defeat (+${winTarget})`}
      >
        <svg viewBox="0 0 34 14" className="w-full h-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={`topGrateFrame-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isOverflowing ? '#7f1d1d' : '#4a3728'} />
              <stop offset="50%" stopColor={isOverflowing ? '#3d090b' : '#241a13'} />
              <stop offset="100%" stopColor="#120c09" />
            </linearGradient>
            <linearGradient id={`grateBlood-${uid}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="55%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
          </defs>
          {/* Outer cast-iron bezel */}
          <path
            d="M 3 1 L 31 1 L 33 3 L 33 11 L 31 13 L 3 13 L 1 11 L 1 3 Z"
            fill={`url(#topGrateFrame-${uid})`}
            stroke={isOverflowing ? '#ef4444' : '#5e4633'}
            strokeWidth="0.9"
            style={isOverflowing ? { filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.95))' } : undefined}
          />
          {/* Deep recessed drain cavity */}
          <rect
            x="4"
            y="3"
            width="26"
            height="8"
            rx="1"
            fill={isOverflowing ? `url(#grateBlood-${uid})` : '#060404'}
            className={isOverflowing ? 'animate-pulse' : ''}
          />
          {/* Beveled forged-iron sluice bars */}
          {[8, 12.5, 17, 21.5, 26].map((x) => (
            <g key={x}>
              <rect x={x - 0.85} y="2.6" width="1.7" height="8.8" fill="#17110d" />
              <line x1={x - 0.35} y1="3" x2={x - 0.35} y2="11" stroke={isOverflowing ? '#991b1b' : '#523e2d'} strokeWidth="0.45" opacity="0.7" />
            </g>
          ))}
          {/* Side mounting studs */}
          <circle cx="2.5" cy="7" r="0.85" fill="#8b6944" />
          <circle cx="31.5" cy="7" r="0.85" fill="#8b6944" />
        </svg>
      </div>

      {/* 4. CENTRAL CONDUIT CHAMBER: FLANKING TICKS + BRASS HARDWARE + GLASS AMPOULE */}
      <div className="relative flex-1 w-full flex items-center justify-center my-0.5">
        {/* Overkill Ambient Blood Glow Flooding Upper Stone Channel */}
        {isOverflowing && (
          <div className="absolute top-0 inset-x-2 h-20 bg-gradient-to-b from-red-700/35 via-red-950/20 to-transparent pointer-events-none animate-pulse z-0" />
        )}

        {/* THE GLASS AMPOULE COLUMN */}
        <div className="relative w-full h-full flex flex-col items-center justify-between z-10">
          {/* Top Sculpted Tarnished-Brass Compression Ferrule */}
          <svg
            viewBox="0 0 30 12"
            className="relative z-25 w-[30px] h-[12px] -mb-[3px] shrink-0 overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`ferruleTop-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#26180d" />
                <stop offset="24%" stopColor="#856037" />
                <stop offset="44%" stopColor="#c49a5c" />
                <stop offset="68%" stopColor="#5e3f21" />
                <stop offset="100%" stopColor="#1b1109" />
              </linearGradient>
            </defs>
            {/* Upper pipe union boss */}
            <rect x="9" y="0" width="12" height="3.2" rx="0.8" fill={`url(#ferruleTop-${uid})`} stroke="#2b1b0f" strokeWidth="0.6" />
            {/* Main stepped compression ring gripping glass */}
            <path
              d="M 4.5 3 L 25.5 3 L 27 5.2 L 27 8.8 L 25 11.2 L 5 11.2 L 3 8.8 L 3 5.2 Z"
              fill={`url(#ferruleTop-${uid})`}
              stroke="#1e130b"
              strokeWidth="0.7"
            />
            {/* Knurled horizontal highlight groove */}
            <line x1="4.5" y1="5.2" x2="25.5" y2="5.2" stroke="#f0d29c" strokeWidth="0.55" opacity="0.5" />
            <line x1="4.5" y1="8.8" x2="25.5" y2="8.8" stroke="#0d0704" strokeWidth="0.65" opacity="0.7" />
            {/* Rivet pins */}
            <circle cx="6.5" cy="7" r="0.85" fill="#e5c185" opacity="0.75" />
            <circle cx="23.5" cy="7" r="0.85" fill="#4f351c" />
          </svg>

          {/* GLASS TUBE + ALIGNED FLANKING TICKS REGION */}
          <div className="relative w-full flex-1 flex items-center justify-center">
            {/* FLANKING ETCHED GAUGE TICKS & BRASS MIDPOINT NEEDLES (100% aligned to glass cavity!) */}
            <div className="pointer-events-none absolute inset-y-0 inset-x-0 z-15">
              {tickValues.map((val) => {
                const bottomPct = ((val + 5) / totalSpan) * 100;
                const isMidpoint = val === 0;
                const isCurrent = Math.round(scale) === val;
                const isLimit = val === 4;
                const isEndpoint = val === winTarget || val === -5;
                const isSubmergedPositive = val > 0 && val <= scale;

                if (isMidpoint) {
                  return (
                    <div
                      key={`tick-${val}`}
                      style={{ bottom: `${bottomPct}%` }}
                      className="absolute inset-x-0 translate-y-1/2 flex items-center justify-between px-[3px] z-25"
                    >
                      {/* Engraved datum groove across stone behind glass */}
                      <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] bg-[#090605] border-b border-[#6e5742]/35 -z-10" />
                      {/* Left forged brass inward-pointing equilibrium needle */}
                      <svg viewBox="0 0 14 9" className="w-[14px] h-[9px] overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]" aria-hidden="true">
                        <polygon points="1,2.2 7.5,2.2 13,4.5 7.5,6.8 1,6.8" fill="#8f6a38" stroke="#1e130b" strokeWidth="0.65" />
                        <polygon points="2,3.1 7.2,3.1 11.4,4.5 7.2,4.7 2,4.7" fill="#dfba7c" opacity="0.75" />
                        <circle cx="3.2" cy="4.5" r="1.1" fill="#3a2512" stroke="#c49a5c" strokeWidth="0.45" />
                      </svg>
                      {/* Right forged brass inward-pointing equilibrium needle */}
                      <svg viewBox="0 0 14 9" className="w-[14px] h-[9px] overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]" aria-hidden="true">
                        <polygon points="13,2.2 6.5,2.2 1,4.5 6.5,6.8 13,6.8" fill="#8f6a38" stroke="#1e130b" strokeWidth="0.65" />
                        <polygon points="12,3.1 6.8,3.1 2.6,4.5 6.8,4.7 12,4.7" fill="#dfba7c" opacity="0.75" />
                        <circle cx="10.8" cy="4.5" r="1.1" fill="#3a2512" stroke="#c49a5c" strokeWidth="0.45" />
                      </svg>
                    </div>
                  );
                }

                // Skip extreme top/bottom ticks that sit right under the ferrule lips
                if (isEndpoint) return null;

                return (
                  <div
                    key={`tick-${val}`}
                    style={{ bottom: `${bottomPct}%` }}
                    className="absolute inset-x-0 translate-y-1/2 flex items-center justify-between px-[6px]"
                  >
                    {/* Left carved stone/brass flank notch */}
                    <span
                      className={`block transition-all duration-300 ${
                        isCurrent
                          ? 'w-[9px] h-[2px] rounded-r-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.95)]'
                          : isLimit
                            ? `w-[8.5px] h-[1.5px] ${isTurnOneDanger || isAmpouleCracked ? 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.95)]' : 'bg-[#a63437]'}`
                            : isSubmergedPositive
                              ? 'w-[7.5px] h-[1.5px] bg-[#a35547] shadow-[0_0_3px_rgba(185,28,28,0.5)]'
                              : 'w-[7px] h-[1.5px] bg-[#756252]/85 shadow-[0_1px_0_rgba(0,0,0,0.95)]'
                      }`}
                    />
                    {/* Right carved stone/brass flank notch */}
                    <span
                      className={`block transition-all duration-300 ${
                        isCurrent
                          ? 'w-[9px] h-[2px] rounded-l-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.95)]'
                          : isLimit
                            ? `w-[8.5px] h-[1.5px] ${isTurnOneDanger || isAmpouleCracked ? 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.95)]' : 'bg-[#a63437]'}`
                            : isSubmergedPositive
                              ? 'w-[7.5px] h-[1.5px] bg-[#a35547] shadow-[0_0_3px_rgba(185,28,28,0.5)]'
                              : 'w-[7px] h-[1.5px] bg-[#756252]/85 shadow-[0_1px_0_rgba(0,0,0,0.95)]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Subtle Forged Iron Side Retaining Clasps (at 26% and 74% height) */}
            {[26, 74].map((topPct) => (
              <div
                key={topPct}
                style={{ top: `${topPct}%` }}
                className="pointer-events-none absolute inset-x-0 -translate-y-1/2 flex items-center justify-between px-[10px] z-25"
                aria-hidden="true"
              >
                <span className="w-[7px] h-[4px] rounded-l-[1px] bg-gradient-to-b from-[#4f3d2f] via-[#2b2018] to-[#140e0a] border border-[#120c08] shadow-[0_1px_2px_rgba(0,0,0,0.95)]" />
                <span className="w-[7px] h-[4px] rounded-r-[1px] bg-gradient-to-b from-[#4f3d2f] via-[#2b2018] to-[#140e0a] border border-[#120c08] shadow-[0_1px_2px_rgba(0,0,0,0.95)]" />
              </div>
            ))}

            {/* THE BLOWN-GLASS CYLINDER BODY */}
            <div
              className={`relative w-[20px] h-full rounded-[3px] bg-[#070203] border overflow-hidden flex flex-col justify-end transition-shadow duration-300 z-20 ${
                isOverflowing
                  ? 'border-[#b91c1c]/80 shadow-[inset_0_0_10px_rgba(0,0,0,0.95),0_0_14px_rgba(220,38,38,0.55)]'
                  : 'border-[#7c6655]/55 shadow-[inset_0_2px_10px_rgba(0,0,0,0.98),0_0_8px_rgba(0,0,0,0.85)]'
              }`}
            >
              {/* Dark Smoked Glass Back-Wall Depth */}
              <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(28,8,9,0.22) 34%, rgba(16,4,5,0.12) 64%, rgba(0,0,0,0.9) 100%)',
                }}
              />

              {/* ORGANIC VISCOUS ARTERIAL BLOOD COLUMN */}
              <div
                className={`absolute bottom-0 inset-x-0 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-10 ${
                  isScaleHeavySlam
                    ? 'brightness-125'
                    : scaleRumble || isOverkill
                      ? 'brightness-110'
                      : ''
                }`}
                style={{
                  height: `${fillPercent}%`,
                  background:
                    'linear-gradient(to top, #130203 0%, #2b0406 18%, #52090d 46%, #7d1117 74%, #a6181f 92%, #c4232b 100%)',
                  boxShadow: isOverflowing
                    ? '0 0 22px rgba(220,38,38,0.95), inset 0 0 8px rgba(254,202,202,0.4)'
                    : '0 0 12px rgba(136,15,24,0.75), inset 0 0 5px rgba(254,202,202,0.2)',
                }}
              >
                {/* Cylindrical Volumetric Shading Overlay (dark side walls + backlit arterial core) */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(10,1,2,0.62) 0%, rgba(220,55,55,0.18) 32%, rgba(0,0,0,0.06) 66%, rgba(8,1,2,0.68) 100%)',
                  }}
                />

                {/* Rising Viscous Micro-Bubbles */}
                {fillPercent > 8 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                      className="absolute bottom-1 left-[24%] w-[2.8px] h-[2.8px] rounded-full bg-rose-200/35 border border-rose-100/55 will-change-transform"
                      style={{ animation: 'bloodBubbleAscendA 3.4s ease-in infinite' }}
                    />
                    <div
                      className="absolute bottom-1 left-[60%] w-[2px] h-[2px] rounded-full bg-rose-200/30 border border-rose-100/45 will-change-transform"
                      style={{ animation: 'bloodBubbleAscendB 4.4s ease-in infinite 1.3s' }}
                    />
                    <div
                      className="absolute bottom-1 left-[40%] w-[2.4px] h-[2.4px] rounded-full bg-rose-200/35 border border-rose-100/55 will-change-transform"
                      style={{ animation: 'bloodBubbleAscendC 2.9s ease-in infinite 0.5s' }}
                    />
                    <div
                      className="absolute bottom-2 left-[30%] w-[1.6px] h-[1.6px] rounded-full bg-rose-100/45 will-change-transform"
                      style={{ animation: 'bloodBubbleAscendB 3.8s ease-in infinite 2.4s' }}
                    />
                  </div>
                )}

                {/* Dual-Layer Viscous Wavy Surface Meniscus */}
                {fillPercent > 0 && (
                  <div className="absolute -top-[4px] left-0 right-0 h-[8px] overflow-hidden pointer-events-none z-10">
                    {/* Back wave layer */}
                    <svg
                      viewBox="0 0 64 8"
                      className="absolute inset-0 w-[200%] h-full will-change-transform opacity-75"
                      style={{ animation: 'bloodWaveScrollSlow 3.3s linear infinite reverse' }}
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 0 4.5 Q 8 1.5, 16 4.5 T 32 4.5 T 48 4.5 T 64 4.5 L 64 8 L 0 8 Z"
                        fill="#6b0f12"
                      />
                    </svg>
                    {/* Front arterial meniscus + crisp crimson-rose specular crest */}
                    <svg
                      viewBox="0 0 64 8"
                      className="absolute inset-0 w-[200%] h-full will-change-transform"
                      style={{ animation: 'bloodWaveScroll 2.2s linear infinite' }}
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 0 4.2 Q 8 1.1, 16 4.2 T 32 4.2 T 48 4.2 T 64 4.2 L 64 8 L 0 8 Z"
                        fill="#a6181f"
                      />
                      <path
                        d="M 0 4.2 Q 8 1.1, 16 4.2 T 32 4.2 T 48 4.2 T 64 4.2"
                        fill="none"
                        stroke="#fda4af"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                    </svg>
                  </div>
                )}

                {/* Overkill Arterial Surge Flash */}
                {isOverflowing && (
                  <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-red-400/75 via-red-700/35 to-transparent animate-ping opacity-85 pointer-events-none" />
                )}
              </div>

              {/* BLOWN-GLASS SPECULAR OPTICS (Above Blood) */}
              <div
                className="pointer-events-none absolute inset-y-0 left-[2.5px] w-[2px] rounded-full z-20"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,245,235,0.36) 0%, rgba(255,255,255,0.12) 48%, rgba(255,245,235,0.22) 100%)',
                }}
              />
              <div className="pointer-events-none absolute inset-y-1 right-[2px] w-[1px] rounded-full bg-white/14 z-20" />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_3px_6px_rgba(0,0,0,0.85),inset_0_-3px_6px_rgba(0,0,0,0.85)] z-20" />

              {/* ARTERIAL LIMIT AMPOULE STATE: Pre-Scored at +4 or Fractured */}
              {isAmpouleCracked ? (
                <div
                  style={{ top: `${limitFromTopPct}%` }}
                  className="absolute -translate-y-1/2 -left-1 -right-1 h-9 pointer-events-none z-30 select-none overflow-visible"
                  title="Arterial Limit Breached: Ampoule shattered at +4 to vent lethal pressure"
                >
                  <svg viewBox="0 0 24 36" className="w-full h-full overflow-visible drop-shadow-[0_0_6px_rgba(239,68,68,0.95)]">
                    <path d="M 1 18 L 7 13.5 L 12 20 L 18 12.5 L 23 17" fill="none" stroke="#fecaca" strokeWidth="1.25" strokeLinecap="round" />
                    <path d="M 7 13.5 L 5.5 6.5 L 9.5 2" fill="none" stroke="#fca5a5" strokeWidth="0.8" opacity="0.85" />
                    <path d="M 12 20 L 10.5 28 L 15.5 34" fill="none" stroke="#fca5a5" strokeWidth="0.8" opacity="0.85" />
                    <path d="M 7 13.5 L 13.5 11 L 17.5 5.5" fill="none" stroke="#ef4444" strokeWidth="0.8" />
                    <polygon points="13,15.5 16.5,12.5 15,17.5" fill="#ffffff" opacity="0.92" />
                  </svg>
                  <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-[3px] h-16 bg-gradient-to-b from-red-500 via-red-800 to-transparent rounded-full shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shadow-[0_0_8px_rgba(239,68,68,1)]" />
                </div>
              ) : (
                <div
                  style={{ top: `${limitFromTopPct}%` }}
                  className="absolute -translate-y-1/2 inset-x-0 h-[2px] z-25 pointer-events-none flex items-center"
                  title="Hydraulic Limit (+4): Glass pre-scored to fracture under lethal first-turn pressure"
                >
                  <div
                    className={`w-full border-t border-dashed transition-colors duration-300 ${
                      isTurnOneDanger
                        ? 'border-red-300/85 shadow-[0_0_6px_rgba(239,68,68,0.85)]'
                        : 'border-red-400/45 shadow-[0_0_3px_rgba(239,68,68,0.28)]'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Sculpted Tarnished-Brass Compression Ferrule */}
          <svg
            viewBox="0 0 30 12"
            className="relative z-25 w-[30px] h-[12px] -mt-[3px] shrink-0 overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`ferruleBot-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#26180d" />
                <stop offset="24%" stopColor="#856037" />
                <stop offset="44%" stopColor="#c49a5c" />
                <stop offset="68%" stopColor="#5e3f21" />
                <stop offset="100%" stopColor="#1b1109" />
              </linearGradient>
            </defs>
            <path
              d="M 5 0.8 L 25 0.8 L 27 3.2 L 27 6.8 L 25.5 9 L 4.5 9 L 3 6.8 L 3 3.2 Z"
              fill={`url(#ferruleBot-${uid})`}
              stroke="#1e130b"
              strokeWidth="0.7"
            />
            <line x1="4.5" y1="3.2" x2="25.5" y2="3.2" stroke="#f0d29c" strokeWidth="0.55" opacity="0.48" />
            <line x1="4.5" y1="6.8" x2="25.5" y2="6.8" stroke="#0d0704" strokeWidth="0.65" opacity="0.7" />
            <circle cx="6.5" cy="5" r="0.85" fill="#e5c185" opacity="0.72" />
            <circle cx="23.5" cy="5" r="0.85" fill="#4f351c" />
            {/* Lower drain union boss */}
            <rect x="9" y="8.8" width="12" height="3.2" rx="0.8" fill={`url(#ferruleBot-${uid})`} stroke="#2b1b0f" strokeWidth="0.6" />
          </svg>
        </div>
      </div>

      {/* 5. BOTTOM FORGED IRON SLUICE GRATE (-5 PLAYER DEFEAT) */}
      <div
        className="relative z-20 w-[34px] h-[14px] flex items-center justify-center"
        title="Player Defeat (-5)"
      >
        <svg viewBox="0 0 34 14" className="w-full h-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={`botGrateFrame-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPlayerDanger ? '#5c181a' : '#423124'} />
              <stop offset="55%" stopColor="#1f1610" />
              <stop offset="100%" stopColor="#0f0a08" />
            </linearGradient>
          </defs>
          <path
            d="M 3 1 L 31 1 L 33 3 L 33 11 L 31 13 L 3 13 L 1 11 L 1 3 Z"
            fill={`url(#botGrateFrame-${uid})`}
            stroke={isPlayerDanger ? '#b91c1c' : '#57402e'}
            strokeWidth="0.9"
            style={isPlayerDanger ? { filter: 'drop-shadow(0 0 6px rgba(185,28,28,0.7))' } : undefined}
          />
          <rect
            x="4"
            y="3"
            width="26"
            height="8"
            rx="1"
            fill={isPlayerDanger ? '#2b0507' : '#050404'}
            className={isPlayerDanger ? 'animate-pulse' : ''}
          />
          {[8, 12.5, 17, 21.5, 26].map((x) => (
            <g key={x}>
              <rect x={x - 0.85} y="2.6" width="1.7" height="8.8" fill="#16100c" />
              <line x1={x - 0.35} y1="3" x2={x - 0.35} y2="11" stroke="#4d3a2a" strokeWidth="0.45" opacity="0.65" />
            </g>
          ))}
          <circle cx="2.5" cy="7" r="0.85" fill="#7c5e3f" />
          <circle cx="31.5" cy="7" r="0.85" fill="#7c5e3f" />
        </svg>
      </div>
    </div>
  );
};

export default BloodRunnelGauge;
