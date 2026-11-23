const fs = require('fs');

function replaceExact(src, find, replace, label) {
  if (!src.includes(find)) {
    throw new Error(`Anchor not found: ${label}`);
  }
  return src.replace(find, replace);
}

// =========================================================================
// 1. UPDATE KEYFRAMES IN src/index.css (SYNCED GOOBERT + LOOM STITCHING)
// =========================================================================
{
  const file = 'src/index.css';
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let src = raw.replace(/\r\n/g, '\n');

  // 1A. Pixel-locked linear Goobert press + card squish waypoints
  src = replaceExact(
    src,
    `@keyframes pressPlatenSlam {
  0%   { transform: translateY(-196px); }
  20%  { transform: translateY(0px); }
  74%  { transform: translateY(0px); }
  92%  { transform: translateY(-200px); }
  100% { transform: translateY(-196px); }
}

@keyframes pressCardSquish {
  0%   { transform: scaleY(1) scaleX(1); }
  8%   { transform: scaleY(1) scaleX(1); }
  20%  { transform: scaleY(0.05) scaleX(1.12); }
  74%  { transform: scaleY(0.05) scaleX(1.12); }
  90%  { transform: scaleY(1.03) scaleX(0.98); }
  100% { transform: scaleY(1) scaleX(1); }
}`,
    `@keyframes pressPlatenSlam {
  0%   { transform: translateY(-196px); }
  6%   { transform: translateY(-140px); }
  13%  { transform: translateY(-70px); }
  20%  { transform: translateY(0px); }
  74%  { transform: translateY(0px); }
  81%  { transform: translateY(-70px); }
  88%  { transform: translateY(-140px); }
  95%  { transform: translateY(-200px); }
  100% { transform: translateY(-196px); }
}

@keyframes pressCardSquish {
  0%   { transform: scaleY(1) scaleX(1); }
  6%   { transform: scaleY(1) scaleX(1); }
  13%  { transform: scaleY(0.52) scaleX(1.06); }
  20%  { transform: scaleY(0.05) scaleX(1.12); }
  74%  { transform: scaleY(0.05) scaleX(1.12); }
  81%  { transform: scaleY(0.52) scaleX(1.06); }
  88%  { transform: scaleY(1) scaleX(1); }
  94%  { transform: scaleY(1.03) scaleX(0.98); }
  100% { transform: scaleY(1) scaleX(1); }
}`,
    'Goobert linear synced pressPlatenSlam & pressCardSquish'
  );

  // 1B. Mycologist center-seam stitching animations (cards pull horizontally together while needle stitches across)
  src = replaceExact(
    src,
    `@keyframes loomNeedleSweep {
  0%, 100% { transform: translateX(-28px) rotate(-14deg); }
  50%      { transform: translateX(28px) rotate(14deg); }
}

@keyframes loomTwinConvergeLeft {
  0%   { transform: translate(0px, 0px) scale(1); opacity: 1; }
  65%  { transform: translate(64px, 68px) scale(0.84) rotate(6deg); opacity: 0.85; }
  100% { transform: translate(74px, 84px) scale(0.5); opacity: 0; }
}

@keyframes loomTwinConvergeRight {
  0%   { transform: translate(0px, 0px) scale(1); opacity: 1; }
  65%  { transform: translate(-64px, 68px) scale(0.84) rotate(-6deg); opacity: 0.85; }
  100% { transform: translate(-74px, 84px) scale(0.5); opacity: 0; }
}`,
    `@keyframes loomNeedleSweep {
  0%   { transform: translate(-36px, -46px) rotate(-18deg); }
  25%  { transform: translate(36px, -16px) rotate(16deg); }
  50%  { transform: translate(-36px, 16px) rotate(-18deg); }
  75%  { transform: translate(36px, 46px) rotate(16deg); }
  100% { transform: translate(-28px, 64px) rotate(-12deg); }
}

@keyframes loomTwinConvergeLeft {
  0%   { transform: translateX(0px) scale(1); opacity: 1; }
  45%  { transform: translateX(52px) scale(0.96) rotate(2deg); opacity: 1; }
  85%  { transform: translateX(62px) scale(0.92); opacity: 0.85; }
  100% { transform: translateX(66px) scale(0.85); opacity: 0; }
}

@keyframes loomTwinConvergeRight {
  0%   { transform: translateX(0px) scale(1); opacity: 1; }
  45%  { transform: translateX(-52px) scale(0.96) rotate(-2deg); opacity: 1; }
  85%  { transform: translateX(-62px) scale(0.92); opacity: 0.85; }
  100% { transform: translateX(-66px) scale(0.85); opacity: 0; }
}

@keyframes loomSeamStitchDraw {
  0%   { stroke-dashoffset: 320; opacity: 0.3; }
  20%  { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}`,
    'Mycologist loom stitching keyframes'
  );

  fs.writeFileSync(file, src.replace(/\n/g, eol), 'utf8');
  console.log('1/2 Updated Goobert & Mycologist keyframes in src/index.css');
}

// =========================================================================
// 2. PATCH ALL 8 FIXES IN src/App.tsx
// =========================================================================
{
  const file = 'src/App.tsx';
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let src = raw.replace(/\r\n/g, '\n');

  // --- FIX 1: CAMPFIRE COPY ---
  src = replaceExact(
    src,
    `Font Grants: {campfireBuffType === 'attack' ? '+1 Power' : '+2 Health'}`,
    `Blessing: {campfireBuffType === 'attack' ? '+1 Power' : '+2 Health'}`,
    'Campfire blessing pill'
  );

  src = replaceExact(
    src,
    `                      {campfireStage === 0
                        ? 'The font boils.'
                        : isCampfireSafe
                          ? 'The chapel stands empty.'
                          : 'The flock grows hungry.'}`,
    `                      {campfireStage === 0
                        ? 'Offer a creature.'
                        : isCampfireSafe
                          ? 'The chapel stands empty.'
                          : 'The flock grows hungry.'}`,
    'Campfire stark line'
  );

  // --- FIX 2: ALTAR BUTTON ---
  src = replaceExact(
    src,
    `{isAnimating ? 'Communing with the Maker...' : 'Sacrifice to the Maker'}`,
    `{isAnimating ? 'Binding Crests...' : 'Commit to Your Actions'}`,
    'Altar button text'
  );

  // --- FIX 3: TRANSMUTATION HOLLOWED LABEL ---
  src = replaceExact(
    src,
    `                          Already Hollowed`,
    `                          Cannot Hollow`,
    'Anvil Cannot Hollow label'
  );

  // --- FIX 4: GOOBERT LINEAR ANIMATION TIMING ---
  src = replaceExact(
    src,
    `animation: goobertStamping ? 'pressPlatenSlam 1.85s cubic-bezier(0.22, 0.92, 0.32, 1) forwards' : undefined,`,
    `animation: goobertStamping ? 'pressPlatenSlam 1.85s linear forwards' : undefined,`,
    'Goobert platen linear timing'
  );

  src = src.replace(
    /animation: goobertStamping \? 'pressCardSquish 1\.85s cubic-bezier\(0\.22, 0\.92, 0\.32, 1\) forwards' : undefined,/g,
    `animation: goobertStamping ? 'pressCardSquish 1.85s linear forwards' : undefined,`
  );

  // --- FIX 5: CAVE TRIAL DELAYED REWARD TRANSITION & MYSTERY TABLETS ---
  src = replaceExact(
    src,
    `  const [caveVerdictReady, setCaveVerdictReady] = useState<boolean>(false);`,
    `  const [caveVerdictReady, setCaveVerdictReady] = useState<boolean>(false);
  const [caveShowRewards, setCaveShowRewards] = useState<boolean>(false);`,
    'caveShowRewards state'
  );

  src = replaceExact(
    src,
    `      setCaveVerdictReady(false);
      setCavePassed(false);`,
    `      setCaveVerdictReady(false);
      setCaveShowRewards(false);
      setCavePassed(false);`,
    'initCaveTrial reset caveShowRewards'
  );

  src = replaceExact(
    src,
    `    setCaveVerdictReady(false);
    setCaveRewardCards([]);`,
    `    setCaveVerdictReady(false);
    setCaveShowRewards(false);
    setCaveRewardCards([]);`,
    'evaluateCaveTrial reset caveShowRewards'
  );

  src = replaceExact(
    src,
    `    scheduleEventTimer(() => {
      setCaveVerdictReady(true);
      if (passed) {
        setCaveRewardCards(rewards);
        triggerSfx('victory');
      } else {
        triggerSfx('defeat');
      }
    }, verdictDelay);`,
    `    scheduleEventTimer(() => {
      setCaveVerdictReady(true);
      if (passed) {
        setCaveRewardCards(rewards);
        triggerSfx('victory');
        // Let the player clearly see their 3 winning witnesses before revealing the 3 blessed rewards
        scheduleEventTimer(() => {
          setCaveShowRewards(true);
          triggerSfx('draw');
        }, 1450);
      } else {
        triggerSfx('defeat');
      }
    }, verdictDelay);`,
    'evaluateCaveTrial 1.45s witness hold before rewards'
  );

  // Use caveShowRewards to switch from witnesses to rewards
  src = replaceExact(
    src,
    `        const isPassedScreen = caveVerdictReady && cavePassed;`,
    `        const isPassedVerdict = caveVerdictReady && cavePassed;
        const isPassedScreen = isPassedVerdict && caveShowRewards;`,
    'Cave Trial isPassedScreen gated by caveShowRewards'
  );

  // Remove requirement description pill on selection tablets so trials are a mystery beyond the name
  src = replaceExact(
    src,
    `                            <div>
                              <div className="font-['Cinzel',_serif] font-bold text-sm sm:text-base uppercase tracking-[0.18em] text-[#f2ddb7] group-hover:text-white">
                                {t}
                              </div>
                              <div className="mt-2 px-3 py-1 rounded-[2px] bg-[#0b0705]/85 border border-[#4a3322]/80 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e0be82]">
                                {reqText}
                              </div>
                            </div>`,
    `                            <div>
                              <div className="font-['Cinzel',_serif] font-bold text-base sm:text-lg uppercase tracking-[0.2em] text-[#f2ddb7] group-hover:text-white">
                                {t}
                              </div>
                            </div>`,
    'Cave Trial remove requirement text on selection tablets'
  );

  // Keep bottom footer showing "Ordeal Passed — Summoning Blessings..." during the 1.45s witness hold
  src = replaceExact(
    src,
    `                  ) : !caveVerdictReady ? (
                    <div className="text-[10.5px] font-mono uppercase tracking-[0.26em] text-[#d4b074] animate-pulse">
                      The Zealot Weighs Your Witnesses...
                    </div>
                  ) : isPassedScreen ? (`,
    `                  ) : !caveVerdictReady ? (
                    <div className="text-[10.5px] font-mono uppercase tracking-[0.26em] text-[#d4b074] animate-pulse">
                      The Zealot Weighs Your Witnesses...
                    </div>
                  ) : isPassedVerdict && !caveShowRewards ? (
                    <div className="font-['Cinzel',_serif] text-sm uppercase tracking-[0.24em] text-[#fef08a] animate-pulse">
                      Ordeal Passed — Presenting Blessings...
                    </div>
                  ) : isPassedScreen ? (`,
    'Cave Trial passed witness hold footer'
  );

  // --- FIX 6: MYCOLOGIST LARGE BACKGROUND LOOM + FOREGROUND SEAM STITCHING ---
  const mycoStageStart = src.indexOf(`                      {/* Loom Stage */}`);
  const mycoStageEnd = src.indexOf(`                    {/* Action Button */}\n                    <div className="flex items-center justify-center shrink-0">\n                      <button\n                        onClick={confirmMycologistCombine}`);
  if (mycoStageStart === -1 || mycoStageEnd === -1) {
    throw new Error('Anchor not found: Mycologist Loom Stage');
  }

  const newMycoStage = `                      {/* Full-Scale Loom Backdrop Positioned Behind the Cards */}
                      <svg
                        viewBox="0 0 520 340"
                        className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-95 drop-shadow-[0_18px_32px_rgba(0,0,0,0.96)]"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <linearGradient id="loomTimber" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#523b2c" />
                            <stop offset="55%" stopColor="#2e2017" />
                            <stop offset="100%" stopColor="#160f0b" />
                          </linearGradient>
                        </defs>
                        {/* Top & Bottom Timber Crossbeams */}
                        <rect x="34" y="28" width="452" height="18" rx="2.5" fill="url(#loomTimber)" stroke="#7a5943" strokeWidth="1.8" />
                        <rect x="26" y="290" width="468" height="20" rx="2.5" fill="url(#loomTimber)" stroke="#7a5943" strokeWidth="1.8" />
                        <rect x="18" y="310" width="484" height="11" rx="2" fill="#1a120d" stroke="#594030" strokeWidth="1.3" />
                        {/* Tall Left & Right Timber Uprights */}
                        <rect x="56" y="18" width="18" height="302" rx="2" fill="url(#loomTimber)" stroke="#6e503d" strokeWidth="1.6" />
                        <rect x="446" y="18" width="18" height="302" rx="2" fill="url(#loomTimber)" stroke="#6e503d" strokeWidth="1.6" />
                        {/* Vertical Sinew Warp Threads Spanning Full Frame Behind Cards */}
                        {[100, 132, 164, 196, 228, 260, 292, 324, 356, 388, 420].map((xPos, idx) => (
                          <line
                            key={idx}
                            x1={xPos}
                            y1="46"
                            x2={xPos}
                            y2="290"
                            stroke={mycoAnimPhase !== 'idle' ? '#c084fc' : '#6b21a8'}
                            strokeWidth="1.25"
                            strokeDasharray="4 3"
                            opacity="0.58"
                          />
                        ))}
                        {/* Subtle Cross-Webbing Behind Center */}
                        <path
                          d="M74 68 L446 270 M446 68 L74 270"
                          stroke={mycoAnimPhase === 'sewing' ? '#f43f5e' : '#7f1d1d'}
                          strokeWidth="1.6"
                          opacity="0.55"
                        />
                      </svg>

                      {/* Cards Centered Directly Over the Loom Warp Threads */}
                      <div className="relative z-10 flex items-center justify-center w-full h-full">
                        {mycoAnimPhase === 'woven' && fusedPreview ? (
                          <div className="flex flex-col items-center animate-menu-fade-in">
                            <span className="mb-2 px-3 py-0.5 rounded-[2px] bg-[#22112b]/95 border border-purple-400/90 text-[9px] font-mono font-bold uppercase tracking-[0.22em] text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.45)]">
                              Stitched Vessel
                            </span>
                            <div className="scale-[1.12] origin-center rounded-[4px] shadow-[0_0_46px_rgba(168,85,247,0.8),0_0_24px_rgba(220,38,38,0.5)]">
                              {renderCard(fusedPreview, { isClickable: false, disableHoverScale: true })}
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex items-center justify-center gap-12 sm:gap-16">
                            {/* Twin I */}
                            <div
                              className="flex flex-col items-center"
                              style={{
                                animation: mycoAnimPhase === 'sewing' ? 'loomTwinConvergeLeft 0.9s ease-in-out forwards' : undefined,
                              }}
                            >
                              <span className="mb-2 px-2.5 py-0.5 rounded-[2px] bg-[#1e1224]/92 border border-purple-400/75 text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] text-purple-200">
                                Twin I
                              </span>
                              <div className="w-[116px] h-[160px] flex items-center justify-center">
                                {twin1 ? (
                                  <div className="scale-[1.02] origin-center shadow-[0_16px_32px_rgba(0,0,0,0.92)]">
                                    {renderCard(twin1, { isClickable: false, disableHoverScale: true })}
                                  </div>
                                ) : (
                                  <div className="w-[110px] h-[154px] rounded-[4px] border border-dashed border-purple-500/55 bg-[#120b14]/78 flex flex-col items-center justify-center gap-1.5 text-purple-300/65">
                                    <span className="text-[9px] uppercase tracking-[0.22em]">Twin I</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Twin II */}
                            <div
                              className="flex flex-col items-center"
                              style={{
                                animation: mycoAnimPhase === 'sewing' ? 'loomTwinConvergeRight 0.9s ease-in-out forwards' : undefined,
                              }}
                            >
                              <span className="mb-2 px-2.5 py-0.5 rounded-[2px] bg-[#1e1224]/92 border border-purple-400/75 text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] text-purple-200">
                                Twin II
                              </span>
                              <div className="w-[116px] h-[160px] flex items-center justify-center">
                                {twin2 ? (
                                  <div className="scale-[1.02] origin-center shadow-[0_16px_32px_rgba(0,0,0,0.92)]">
                                    {renderCard(twin2, { isClickable: false, disableHoverScale: true })}
                                  </div>
                                ) : (
                                  <div className="w-[110px] h-[154px] rounded-[4px] border border-dashed border-purple-500/55 bg-[#120b14]/78 flex flex-col items-center justify-center gap-1.5 text-purple-300/65">
                                    <span className="text-[9px] uppercase tracking-[0.22em]">Twin II</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Foreground Active Bone Needle & Crimson Zig-Zag Stitch Right Over the Cards */}
                            {mycoAnimPhase === 'sewing' && (
                              <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
                                <svg viewBox="0 0 180 200" className="w-44 h-52 overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
                                  {/* Crimson Cross-Stitches Binding the Center Seam */}
                                  <path
                                    d="M 62 34 L 118 52 L 62 72 L 118 92 L 62 112 L 118 132 L 62 152 L 118 168"
                                    fill="none"
                                    stroke="#f43f5e"
                                    strokeWidth="3.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="320"
                                    style={{ animation: 'loomSeamStitchDraw 0.85s ease-out forwards' }}
                                  />
                                  {/* Sweeping Bone Needle */}
                                  <g style={{ animation: 'loomNeedleSweep 0.85s ease-in-out forwards' }}>
                                    <polygon points="34,96 138,96 154,100 138,104 34,104 22,100" fill="#efe4d0" stroke="#5c4d3c" strokeWidth="1.4" />
                                    <ellipse cx="44" cy="100" rx="4" ry="2" fill="#7e22ce" />
                                  </g>
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

`;

  src = src.slice(0, mycoStageStart) + newMycoStage + src.slice(mycoStageEnd);

  // --- FIX 7: WOODCARVER — CIRCULAR CRESTS & MATCHING CARVING CUTOUTS FOR HEAD PATCHES ---
  const totemStart = src.indexOf(`      {screen === 'EVENT_BUILD_TOTEM' && (() => {`);
  const totemEnd = src.indexOf(`      {/* =========================================================================\n          CARD CHOICE EVENT SCREEN`);
  if (totemStart === -1 || totemEnd === -1) {
    throw new Error('Anchor not found: EVENT_BUILD_TOTEM block');
  }

  const upgradedTotemJsx = `      {screen === 'EVENT_BUILD_TOTEM' && (() => {
        const previewHead: string | null =
          totemStage === 'ASSEMBLE'
            ? (assemblyHeadIdx !== null ? totemPieces[assemblyHeadIdx]?.value || null : activeTotem.head)
            : (selectedTotemRewardIdx !== null && totemRewardChoices[selectedTotemRewardIdx]?.type === 'head'
                ? totemRewardChoices[selectedTotemRewardIdx].value
                : activeTotem.head);
        const previewBody: string | null =
          totemStage === 'ASSEMBLE'
            ? (assemblyBodyIdx !== null ? totemPieces[assemblyBodyIdx]?.value || null : activeTotem.body)
            : (selectedTotemRewardIdx !== null && totemRewardChoices[selectedTotemRewardIdx]?.type === 'body'
                ? totemRewardChoices[selectedTotemRewardIdx].value
                : activeTotem.body);

        const renderHeadCutoutSvg = (tribe: string, highlighted: boolean) => {
          const strokeCol = highlighted ? '#f4d78b' : '#9a734a';
          const fillTop = highlighted ? '#2b1d12' : '#1f150d';
          const fillBot = highlighted ? '#160e09' : '#100a06';
          const gradId = \`effigyPatch-\${tribe}-\${highlighted ? 'hi' : 'lo'}\`;
          let outerPath = '';
          let stitchPath = '';
          switch (tribe) {
            case 'Reptile':
              outerPath = 'M 14 8 H 166 V 176 L 90 154 L 14 176 Z';
              stitchPath = 'M 21 15 H 159 V 166 L 90 146 L 21 166 Z';
              break;
            case 'Insect':
              outerPath = 'M 36 8 H 144 L 170 42 V 142 L 138 176 H 42 L 10 142 V 42 Z';
              stitchPath = 'M 40 15 H 140 L 162 45 V 139 L 134 169 H 46 L 18 139 V 45 Z';
              break;
            case 'Avian':
              outerPath = 'M 16 12 Q 90 2 164 12 V 104 Q 164 152 90 178 Q 16 152 16 104 Z';
              stitchPath = 'M 23 19 Q 90 10 157 19 V 102 Q 157 145 90 169 Q 23 145 23 102 Z';
              break;
            case 'Canine':
              outerPath = 'M 16 8 H 164 L 168 156 L 138 172 L 114 158 L 90 176 L 66 158 L 42 172 L 12 156 Z';
              stitchPath = 'M 23 15 H 157 L 160 151 L 137 163 L 114 150 L 90 167 L 66 150 L 43 163 L 20 151 Z';
              break;
            case 'Hooved':
            default:
              outerPath = 'M 22 10 H 158 Q 168 10 168 22 V 116 Q 168 172 90 176 Q 12 172 12 116 V 22 Q 12 10 22 10 Z';
              stitchPath = 'M 27 17 H 153 Q 161 17 161 26 V 114 Q 161 164 90 168 Q 19 164 19 114 V 26 Q 19 17 27 17 Z';
              break;
          }
          return (
            <svg viewBox="0 0 180 184" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.92)]">
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={fillTop} />
                  <stop offset="100%" stopColor={fillBot} />
                </linearGradient>
              </defs>
              <path d={outerPath} fill={\`url(#\${gradId})\`} stroke={strokeCol} strokeWidth={highlighted ? '2.4' : '1.7'} strokeLinejoin="round" />
              <path d={stitchPath} fill="none" stroke={highlighted ? '#f4d78b' : '#b48d59'} strokeWidth="1.2" strokeDasharray="4 3.5" opacity={highlighted ? '0.95' : '0.6'} />
            </svg>
          );
        };

        return (
          <div
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('weaverevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.32)_0%,rgba(5,3,2,0.92)_100%)] pointer-events-none" />

            <div className="relative z-10 max-w-6xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    The Weaver&apos;s Loom
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Needle &amp; Threadcraft
                </h1>
              </div>

              {/* Two-Column Split: Live Stitched Effigy Stand Left, Claim/Assembly Rack Right */}
              <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* LEFT COLUMN: Physical Stitched Effigy Stand Prop */}
                <div className="lg:col-span-5 relative flex flex-col items-center justify-between px-5 py-4 rounded-[3px] bg-gradient-to-b from-[#140e0a]/78 via-[#19110c]/88 to-[#0b0705]/95 border border-[#4a3322]/85 shadow-[0_22px_54px_rgba(0,0,0,0.94),inset_0_1px_0_rgba(255,224,178,0.08)] overflow-hidden">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        previewHead && previewBody
                          ? 'radial-gradient(circle at 50% 48%, rgba(212,175,55,0.22) 0%, rgba(120,53,15,0.1) 50%, transparent 75%)'
                          : 'radial-gradient(circle at 50% 48%, rgba(140,103,71,0.14) 0%, transparent 72%)',
                    }}
                  />
                  <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#9a7342]/70" />

                  <div className="relative z-20 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-[#c79d5a]">
                    {totemStage === 'REWARD' ? 'Effigy Stand' : 'Live Effigy Assembly'}
                  </div>

                  {/* Assembled Effigy Figure (Cutout Head Patch + Stitched Seam + Circular Body Crest + Timber Pedestal) */}
                  <div
                    className="relative z-10 flex flex-col items-center justify-center my-auto"
                    style={{
                      animation: effigyStitchingAnim ? 'effigyStitchPulse 0.9s ease-in-out' : undefined,
                    }}
                  >
                    {/* Crown / Tribal Patch Cutout Socket */}
                    <div className="relative z-20 flex flex-col items-center">
                      <span className="mb-1 text-[8px] font-mono uppercase tracking-[0.22em] text-[#bfa073]">
                        {previewHead || 'No Patch'}
                      </span>
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        {previewHead ? (
                          <>
                            {renderHeadCutoutSvg(previewHead, true)}
                            <div className="relative z-10 [&>*]:scale-[2.8] -mt-1">
                              {TRIBE_EMBROIDERY[previewHead as Tribe] || <span className="text-2xl">✦</span>}
                            </div>
                          </>
                        ) : (
                          <div className="w-24 h-24 rounded-[4px] border-2 border-dashed bg-[#120c08]/80 border-[#5e442c]/70 text-[#7a6045] flex items-center justify-center">
                            <span className="text-[9px] uppercase tracking-[0.2em]">Head</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stitched Sinew Neck Seam */}
                    <svg viewBox="0 0 80 28" className="w-16 h-7 -my-1 z-30 pointer-events-none">
                      <line x1="40" y1="0" x2="40" y2="28" stroke="#8c6747" strokeWidth="6" />
                      <path
                        d="M28 6 L52 12 M52 6 L28 12 M28 16 L52 22 M52 16 L28 22"
                        stroke={previewHead && previewBody ? '#f4d78b' : '#991b1b'}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Torso / Circular Threadbound Crest Socket */}
                    <div className="relative z-20 flex flex-col items-center -mb-2">
                      <div
                        className={\`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 shadow-[0_14px_28px_rgba(0,0,0,0.92)] \${
                          previewBody
                            ? 'bg-gradient-to-b from-[#261a11] to-[#140d08] border-[#e5c16b]/90 shadow-[0_0_24px_rgba(212,175,55,0.28)]'
                            : 'bg-[#120c08]/80 border-[#5e442c]/70 text-[#7a6045]'
                        }\`}
                      >
                        {previewBody ? (
                          <img
                            src={getSigilArtUrl(previewBody)}
                            alt={previewBody}
                            className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.35)]"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <span className="text-[9px] uppercase tracking-[0.2em]">Crest</span>
                        )}
                      </div>
                      <span className="mt-1.5 text-[8.5px] font-mono uppercase tracking-[0.2em] text-[#e5c996]">
                        {previewBody || 'No Crest'}
                      </span>
                    </div>

                    {/* Carved Wooden Effigy Pedestal Base */}
                    <svg viewBox="0 0 260 44" className="w-56 h-auto drop-shadow-[0_12px_20px_rgba(0,0,0,0.96)] pointer-events-none mt-1">
                      <polygon points="36,38 56,12 204,12 224,38" fill="#231710" stroke="#755538" strokeWidth="1.6" />
                      <rect x="24" y="34" width="212" height="8" rx="1.5" fill="#160f0a" stroke="#5c422a" strokeWidth="1.2" />
                    </svg>
                  </div>

                  {/* Active Effigy Status Footer */}
                  <div className="relative z-20 w-full min-h-[32px] flex items-center justify-center text-center">
                    {previewHead && previewBody && (
                      <div className="font-['Cinzel',_serif] text-sm tracking-[0.1em] text-[#f4d78b] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {previewHead} &mdash; {previewBody}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Reward Selection OR Assembly Bench */}
                <div className="lg:col-span-7 relative flex flex-col justify-between min-h-0 rounded-[3px] bg-[#0d0806]/86 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,228,185,0.06)] backdrop-blur-[2px] p-5">
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9a7342]/70" />

                  {totemStage === 'REWARD' ? (
                    <div className="flex flex-col h-full justify-between">
                      <div className={\`text-left border-b border-[#3a2618]/80 pb-3 transition-opacity duration-300 \${isTotemFadingOut ? 'opacity-0' : ''}\`}>
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-[#c79d5a]">
                          Step 1 — Claim an Effigy Scrap ({totemPieces.length}/7)
                        </div>
                      </div>

                      {!totemChoicesHidden ? (
                        <div className="flex-1 flex flex-wrap gap-5 items-center justify-center py-4">
                          {totemRewardChoices.map((tc, idx) => {
                            const isSelected = selectedTotemRewardIdx === idx;
                            const fadeAnim = isTotemFadingOut
                              ? isSelected
                                ? 'animate-swipe-up-fade pointer-events-none'
                                : 'opacity-0 transition-opacity duration-300 pointer-events-none'
                              : '';

                            if (tc.type === 'head') {
                              // Tribal Patch rendered in its exact Carving Cutout Silhouette
                              return (
                                <div
                                  key={\`totem-rew-\${idx}\`}
                                  onClick={() => {
                                    if (!isEventBusy && !isTotemFadingOut) {
                                      triggerSfx('draw');
                                      setSelectedTotemRewardIdx(idx);
                                    }
                                  }}
                                  className={\`relative w-[166px] h-[184px] px-4 pt-5 pb-7 text-center select-none flex flex-col items-center justify-start transition-all duration-200 \${fadeAnim} \${
                                    isEventBusy || isTotemFadingOut
                                      ? 'opacity-40 cursor-not-allowed'
                                      : isSelected
                                        ? 'scale-105 -translate-y-1.5 drop-shadow-[0_0_24px_rgba(212,175,55,0.4)] cursor-pointer'
                                        : 'hover:-translate-y-1 cursor-pointer'
                                  }\`}
                                >
                                  {renderHeadCutoutSvg(tc.value, isSelected)}
                                  <div className="relative z-10 text-[8px] font-mono uppercase tracking-[0.22em] text-[#b48f5a] mb-2">
                                    Tribal Patch
                                  </div>
                                  <div className="relative z-10 flex items-center justify-center w-14 h-14 mb-2 bg-[#1c130c]/90 border border-[#523b26] rounded-[2px] shadow-inner [&>*]:scale-[2.2]">
                                    {TRIBE_EMBROIDERY[tc.value as Tribe] || <span className="text-2xl">✦</span>}
                                  </div>
                                  <div className="relative z-10 font-['Cinzel',_serif] font-bold text-[#f2ddb7] text-xs uppercase tracking-[0.18em]">
                                    {tc.value}
                                  </div>
                                </div>
                              );
                            }

                            // Threadbound Crest rendered as a Circular Medallion
                            return (
                              <div
                                key={\`totem-rew-\${idx}\`}
                                onClick={() => {
                                  if (!isEventBusy && !isTotemFadingOut) {
                                    triggerSfx('draw');
                                    setSelectedTotemRewardIdx(idx);
                                  }
                                }}
                                className={\`w-[176px] h-[176px] p-4 rounded-full border-2 border-dashed transition-all duration-200 text-center select-none flex flex-col items-center justify-center \${fadeAnim} \${
                                  isEventBusy || isTotemFadingOut
                                    ? 'opacity-40 cursor-not-allowed border-[#5e442c]/40 bg-[#140e0a]'
                                    : isSelected
                                      ? 'border-[#e5c16b] bg-gradient-to-b from-[#2b1d12] to-[#160e09] scale-105 -translate-y-1.5 shadow-[0_0_28px_rgba(212,175,55,0.34)] cursor-pointer'
                                      : 'border-[#8c6747]/80 hover:border-[#cfa159] bg-gradient-to-b from-[#1c130c] to-[#100a07] shadow-[0_10px_24px_rgba(0,0,0,0.88)] hover:-translate-y-1 cursor-pointer'
                                }\`}
                              >
                                <div className="text-[7.5px] font-mono uppercase tracking-[0.22em] text-[#b48f5a] mb-1.5">
                                  Crest
                                </div>
                                <div className="flex items-center justify-center w-14 h-14 mb-1.5 rounded-full bg-[#1a110b] border border-[#4f3824] shadow-inner">
                                  <img
                                    src={getSigilArtUrl(tc.value)}
                                    alt={tc.value}
                                    className="w-10 h-10 object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                                <div className="font-['Cinzel',_serif] font-bold text-[#f0dab2] text-[11px] uppercase tracking-[0.14em] leading-tight">
                                  {tc.value}
                                </div>
                                <div className="text-[8.5px] text-[#c7ad87]/80 italic leading-tight mt-0.5 line-clamp-2 px-2">
                                  {SIGIL_DESCRIPTIONS[tc.value]}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-[11px] font-mono uppercase tracking-[0.22em] text-[#9c8262]">
                          Piece Bound to Satchel...
                        </div>
                      )}

                      {!totemChoicesHidden && (
                        <div className="flex justify-center pt-2">
                          <button
                            onClick={async () => {
                              if (selectedTotemRewardIdx === null || isEventBusy) return;
                              setIsEventBusy(true);

                              const chosen = totemRewardChoices[selectedTotemRewardIdx];
                              const nextPieces = [...totemPieces, chosen];
                              setTotemPieces(nextPieces);
                              triggerSfx('play');

                              if (nextPieces.length >= 7) {
                                const sigils = Object.keys(SIGIL_MAPPING).filter(s => s !== 'Amorphous');
                                const randSigil = sigils[Math.floor(Math.random() * sigils.length)];
                                const amalgam = cloneCard(ALL_CARD_LOOKUP["Amalgam"]);
                                amalgam.sigils = [randSigil];
                                const nextDeck = [...masterDeck, amalgam];
                                setMasterDeck(nextDeck);
                                masterDeckRef.current = nextDeck;
                                addLog(\`Your satchel overflowed with 7 effigy scraps! The Weaver gifted an Amalgam (\${randSigil})!\`);
                              }

                              const hasHead = nextPieces.some(p => p.type === 'head');
                              const hasBody = nextPieces.some(p => p.type === 'body');

                              if (hasHead && hasBody) {
                                setTotemStage('ASSEMBLE');
                                setIsEventBusy(false);
                              } else {
                                setIsTotemFadingOut(true);
                                await new Promise(res => setTimeout(res, 500));
                                setTotemChoicesHidden(true);
                                await new Promise(res => setTimeout(res, 950));
                                returnToMap();
                              }
                            }}
                            disabled={selectedTotemRewardIdx === null || isEventBusy}
                            className={\`px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#2b1a10] to-[#170e09] hover:from-[#3a2315] hover:to-[#1f130c] active:translate-y-[1px] border border-[#b48844]/85 hover:border-[#e5c16b] text-[#f3dfb6] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all duration-300 select-none \${
                              isTotemFadingOut ? 'opacity-0 pointer-events-none' : ''
                            }\`}
                          >
                            Bind to Effigy
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col h-full justify-between min-h-0">
                      <div className="text-left border-b border-[#3a2618]/80 pb-2.5 shrink-0">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-[#c79d5a]">
                          Step 2 — Stitch Your Active Effigy
                        </div>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto py-3 flex flex-col gap-3.5">
                        {/* Tribal Patches Shelf */}
                        <div className="border border-dashed border-[#8c6747]/60 p-3.5 bg-[#140e0a]/90 shadow-inner rounded-[3px]">
                          <div className="text-[10px] font-['Cinzel',_serif] font-bold text-[#c79d5a] uppercase tracking-[0.2em] mb-2.5 border-b border-[#3a271a] pb-1.5 text-left">
                            1. Tribal Patches ({totemPieces.filter(p => p.type === 'head').length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {totemPieces.map((p, idx) => p.type === 'head' && (
                              <button
                                key={\`head-\${idx}\`}
                                type="button"
                                onClick={() => {
                                  triggerSfx('draw');
                                  setAssemblyHeadIdx(idx);
                                }}
                                className={\`px-2.5 py-2 border border-dashed rounded-[2px] text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 \${
                                  assemblyHeadIdx === idx
                                    ? 'border-[#e5c16b] bg-[#281b12] text-[#f5e3be] shadow-[0_0_12px_rgba(212,175,55,0.28)]'
                                    : 'border-[#7a5a3c]/65 bg-[#1a130d] text-[#cbb697]/80 hover:border-[#c89e4c]'
                                }\`}
                              >
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 [&>*]:scale-[1.25]">
                                  {TRIBE_EMBROIDERY[p.value as Tribe] || <span>✦</span>}
                                </div>
                                <span>{p.value}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Circular Threadbound Crests Shelf */}
                        <div className="border border-dashed border-[#8c6747]/60 p-3.5 bg-[#140e0a]/90 shadow-inner rounded-[3px]">
                          <div className="text-[10px] font-['Cinzel',_serif] font-bold text-[#c79d5a] uppercase tracking-[0.2em] mb-2.5 border-b border-[#3a271a] pb-1.5 text-left">
                            2. Threadbound Crests ({totemPieces.filter(p => p.type === 'body').length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {totemPieces.map((p, idx) => p.type === 'body' && (
                              <button
                                key={\`body-\${idx}\`}
                                type="button"
                                onClick={() => {
                                  triggerSfx('draw');
                                  setAssemblyBodyIdx(idx);
                                }}
                                className={\`px-3 py-1.5 border border-dashed rounded-full text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 \${
                                  assemblyBodyIdx === idx
                                    ? 'border-[#e5c16b] bg-[#281b12] text-[#f5e3be] shadow-[0_0_12px_rgba(212,175,55,0.28)]'
                                    : 'border-[#7a5a3c]/65 bg-[#1a130d] text-[#cbb697]/80 hover:border-[#c89e4c]'
                                }\`}
                              >
                                <div className="w-6 h-6 rounded-full bg-[#140d08] border border-[#4f3824] flex items-center justify-center shrink-0">
                                  <img
                                    src={getSigilArtUrl(p.value)}
                                    alt={p.value}
                                    className="w-4 h-4 object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                                <span>{p.value}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2 shrink-0">
                        {assemblyHeadIdx !== null && assemblyBodyIdx !== null ? (
                          <button
                            disabled={effigyStitchingAnim}
                            onClick={() => {
                              const hVal = totemPieces[assemblyHeadIdx].value as Tribe;
                              const bVal = totemPieces[assemblyBodyIdx].value;
                              const newTotem = { head: hVal, body: bVal };
                              setActiveTotem(newTotem);
                              setEffigyStitchingAnim(true);
                              triggerSfx('bell');
                              addLog(\`Effigy stitched: \${hVal} + \${bVal}\`);
                              scheduleEventTimer(() => {
                                setEffigyStitchingAnim(false);
                                returnToMap(undefined, newTotem);
                              }, 950);
                            }}
                            className="px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#2b1a10] to-[#170e09] hover:from-[#3a2315] hover:to-[#1f130c] active:translate-y-[1px] border border-[#b48844]/85 hover:border-[#e5c16b] text-[#f3dfb6] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-45 shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all select-none"
                          >
                            {effigyStitchingAnim ? 'Stitching Effigy...' : 'Stitch Effigy'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              let nextHead = activeTotem.head;
                              let nextBody = activeTotem.body;
                              if (assemblyHeadIdx !== null) nextHead = totemPieces[assemblyHeadIdx!].value as Tribe;
                              if (assemblyBodyIdx !== null) nextBody = totemPieces[assemblyBodyIdx!].value;
                              const newTotem = { head: nextHead, body: nextBody };
                              setActiveTotem(newTotem);
                              returnToMap(undefined, newTotem);
                            }}
                            className="px-7 py-2.5 rounded-[2px] bg-[#140e0a]/90 hover:bg-[#1f1610] active:translate-y-[1px] border border-[#4a3322]/85 hover:border-[#8c6742] text-[#cbb697] hover:text-[#f3e6cf] font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.8)] transition-all select-none"
                          >
                            Store Pieces &amp; Proceed
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

`;

  src = src.slice(0, totemStart) + upgradedTotemJsx + src.slice(totemEnd);

  // --- FIX 8: RELIC CACHE SIZING & VERTICAL PROPORTION ---
  src = replaceExact(
    src,
    `              /* Widescreen Peddler's Timber Cabinet & Live Relic Counter */
              <div className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-between gap-3">`,
    `              /* Grounded Peddler's Timber Cabinet & Live Relic Counter */
              <div className="relative z-10 max-w-4xl w-full my-auto flex flex-col items-center justify-center gap-4">`,
    'Relic Cache container proportion'
  );

  src = replaceExact(
    src,
    `                {/* Main Timber Display Cabinet */}
                <div className="relative w-full flex-1 min-h-0 flex flex-col justify-between rounded-[4px] bg-gradient-to-b from-[#160e09]/88 via-[#110b07]/92 to-[#090604]/96 border-2 border-[#4d3522]/90 shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,224,178,0.08)] px-5 sm:px-7 py-4 overflow-hidden">`,
    `                {/* Main Timber Display Cabinet */}
                <div className="relative w-full flex flex-col justify-between rounded-[4px] bg-gradient-to-b from-[#160e09]/90 via-[#110b07]/94 to-[#090604]/97 border-2 border-[#4d3522]/90 shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,224,178,0.08)] px-5 sm:px-7 py-5 overflow-hidden">`,
    'Relic Cache cabinet sizing'
  );

  src = replaceExact(
    src,
    `                  {/* Three Recessed Velvet Shelf Cubbies */}
                  <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center py-3">`,
    `                  {/* Three Recessed Velvet Shelf Cubbies */}
                  <div className="relative z-10 flex items-center justify-center py-5">`,
    'Relic Cache shelf padding'
  );

  src = replaceExact(
    src,
    `                                  : 'bg-[#0c0806]/85 border-[#2c1e15] opacity-40 cursor-not-allowed shadow-inner'`,
    `                                  : 'bg-[#100b08]/88 border-[#38271b] opacity-60 cursor-not-allowed shadow-inner'`,
    'Relic Cache unaffordable readability'
  );

  fs.writeFileSync(file, src.replace(/\n/g, eol), 'utf8');
  console.log('2/2 Applied all 8 event polish fixes in src/App.tsx.');
}
