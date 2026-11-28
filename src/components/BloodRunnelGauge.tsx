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

const SLATE_POLYGON_CLIP =
  'polygon(1.4px 1.6px, 8px 0.9px, 14px 0.6px, 21px 1.5px, 27px 1.9px, 34px 0.8px, 41px 0.5px, 48px 1.2px, 54.2px 1.3px, 52.7px 8px, 52.8px 16px, 53.2px 22px, 53.3px 26px, 53px 34px, 52.3px 41px, 53.9px 46px, 53.3px 55px, 50.8px 59px, 53px 66px, 52.4px 70px, 53.7px 73px, 53.5px 85px, 53.3px 89px, 53.2px 97px, 53.9px 104px, 54.1px 117px, 53.2px 120px, 53.7px 133px, 53.6px 137px, 53.6px 141px, 53.4px 147px, 53.5px 156px, 53.4px 161px, 53.9px 170px, 54.3px 174px, 53.4px 181px, 52.7px 189px, 53.3px 198px, 53.3px 208px, 52.8px 219px, 53.5px 227px, 53.4px 239px, 53.5px 250px, 51.5px 257px, 53.5px 264px, 54.3px 276px, 53.2px 286px, 53.5px 296px, 54.6px 306px, 52.2px 316px, 53.7px 327px, 51.5px 331px, 54.1px 336px, 52.1px 348px, 54.2px 351px, 53.6px 360px, 52.4px 366px, 54.5px 372px, 54px 374px, 53.5px 379px, 53.8px 394.7px, 49px 395.1px, 42px 395.5px, 35px 394.4px, 28px 394px, 20px 394.9px, 13px 395.2px, 7px 394.3px, 2px 394.5px, 3.2px 380px, 4.3px 375px, 3.3px 371px, 4.3px 367px, 3.9px 360px, 4.7px 352px, 4.2px 347px, 3px 337px, 3.5px 331px, 4px 327px, 3.9px 316px, 3.4px 307px, 4.8px 297px, 3.2px 287px, 2.9px 276px, 3.8px 265px, 3.9px 258px, 3.3px 249px, 2.5px 238px, 3.7px 227px, 2.6px 219px, 2.1px 208px, 2.9px 197px, 2.3px 189px, 2.7px 180px, 1.9px 174px, 2.2px 169px, 2.3px 161px, 2.9px 156px, 1.8px 147px, 2.4px 142px, 2.1px 136px, 3px 132px, 2.4px 121px, 4.2px 116px, 1.2px 105px, 2.5px 98px, 1.4px 90px, 2.5px 84px, 2px 74px, 4.6px 69px, 1px 65px, 1.1px 59px, 1.7px 55px, 1.7px 46px, 2.2px 41px, 2.2px 35px, 1.6px 27px, 2px 23px, 3.6px 15px, 2px 7px)';

const SLATE_POLYGON_POINTS =
  '1.4,1.6 8,0.9 14,0.6 21,1.5 27,1.9 34,0.8 41,0.5 48,1.2 54.2,1.3 52.7,8 52.8,16 53.2,22 53.3,26 53,34 52.3,41 53.9,46 53.3,55 50.8,59 53,66 52.4,70 53.7,73 53.5,85 53.3,89 53.2,97 53.9,104 54.1,117 53.2,120 53.7,133 53.6,137 53.6,141 53.4,147 53.5,156 53.4,161 53.9,170 54.3,174 53.4,181 52.7,189 53.3,198 53.3,208 52.8,219 53.5,227 53.4,239 53.5,250 51.5,257 53.5,264 54.3,276 53.2,286 53.5,296 54.6,306 52.2,316 53.7,327 51.5,331 54.1,336 52.1,348 54.2,351 53.6,360 52.4,366 54.5,372 54,374 53.5,379 53.8,394.7 49,395.1 42,395.5 35,394.4 28,394 20,394.9 13,395.2 7,394.3 2,394.5 3.2,380 4.3,375 3.3,371 4.3,367 3.9,360 4.7,352 4.2,347 3,337 3.5,331 4,327 3.9,316 3.4,307 4.8,297 3.2,287 2.9,276 3.8,265 3.9,258 3.3,249 2.5,238 3.7,227 2.6,219 2.1,208 2.9,197 2.3,189 2.7,180 1.9,174 2.2,169 2.3,161 2.9,156 1.8,147 2.4,142 2.1,136 3,132 2.4,121 4.2,116 1.2,105 2.5,98 1.4,90 2.5,84 2,74 4.6,69 1,65 1.1,59 1.7,55 1.7,46 2.2,41 2.2,35 1.6,27 2,23 3.6,15 2,7';

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
      {/* 1. HAND-CHISELLED AGED SLATE MONOLITH BACKING */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px -z-10"
        style={{
          filter: isOverflowing
            ? 'drop-shadow(0 0 12px rgba(185,28,28,0.45)) drop-shadow(0 6px 10px rgba(0,0,0,0.92))'
            : 'drop-shadow(0 6px 10px rgba(0,0,0,0.9))',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            clipPath: SLATE_POLYGON_CLIP,
            backgroundImage: `linear-gradient(180deg, rgba(24,20,18,0.52) 0%, rgba(12,10,10,0.74) 48%, rgba(6,5,5,0.9) 100%), radial-gradient(ellipse 85% 32% at 50% 8%, rgba(107,15,18,${isOverflowing ? '0.42' : '0.12'}) 0%, transparent 100%), url("${baseUrl}assets/text/slate.jpg")`,
            backgroundSize: 'cover, cover, 140px 140px',
            backgroundPosition: 'center, center, center',
          }}
        />
        {/* Subtle aged stone grain + carved fissures & bevel edge */}
        <svg viewBox="0 0 56 396" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`slateEdge-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6c5949" stopOpacity="0.88" />
              <stop offset="45%" stopColor="#3e332b" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#211a16" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id={`troughShade-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#050303" stopOpacity="0.9" />
              <stop offset="18%" stopColor="#0b0707" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#140c0c" stopOpacity="0.45" />
              <stop offset="82%" stopColor="#0b0707" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#050303" stopOpacity="0.92" />
            </linearGradient>
          </defs>

          {/* Outer stone shadow outline + chiseled rim */}
          <polygon points={SLATE_POLYGON_POINTS} fill="none" stroke="#080605" strokeWidth="2.4" strokeLinejoin="miter" />
          <polygon points={SLATE_POLYGON_POINTS} fill="none" stroke={`url(#slateEdge-${uid})`} strokeWidth="1.2" strokeLinejoin="miter" />

          {/* Recessed carved vertical stone channel cradling the glass ampoule */}
          <rect x="14.5" y="25" width="27" height="346" rx="5" fill={`url(#troughShade-${uid})`} stroke="#2b221c" strokeWidth="0.7" opacity="0.85" />

          {/* Faint carved stone fissures & ritual flank hairline */}
          <path d="M 6 62 L 10 67 L 8.5 75" fill="none" stroke="#0b0807" strokeWidth="0.85" opacity="0.65" />
          <path d="M 6.5 62.3 L 10.4 67.3" fill="none" stroke="#6d5d4e" strokeWidth="0.45" opacity="0.3" />
          <path d="M 49 144 L 44.5 151 L 47 161" fill="none" stroke="#0b0807" strokeWidth="0.85" opacity="0.65" />
          <path d="M 8 274 L 12 281 L 9 290" fill="none" stroke="#0b0807" strokeWidth="0.8" opacity="0.6" />
          <path d="M 48 312 L 43.5 318 L 46 325" fill="none" stroke="#0b0807" strokeWidth="0.8" opacity="0.6" />

          {/* Corner forged iron piton rivets embedded into the slate */}
          {[
            [9, 9.5],
            [47, 9.5],
            [9, 386.5],
            [47, 386.5],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="2.2" fill="#090706" />
              <circle cx={cx} cy={cy} r="1.5" fill="#463527" stroke="#7c5e3f" strokeWidth="0.45" />
              <circle cx={cx - 0.45} cy={cy - 0.45} r="0.45" fill="#c7a26d" opacity="0.65" />
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
