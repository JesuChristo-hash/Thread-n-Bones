const fs = require('fs');

function replaceExact(src, find, replace, label) {
  if (!src.includes(find)) {
    throw new Error(`Anchor not found: ${label}`);
  }
  return src.replace(find, replace);
}

// =========================================================================
// 1. SYNCED PLATEN DROP + 1S HOLD + CARD SQUISH KEYFRAMES (src/index.css)
// =========================================================================
{
  const file = 'src/index.css';
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let src = raw.replace(/\r\n/g, '\n');

  src = replaceExact(
    src,
    `@keyframes pressPlatenSlam {
  0%   { transform: translateY(0px); }
  28%  { transform: translateY(232px); }
  66%  { transform: translateY(232px); }
  88%  { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
}`,
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
    'pressPlatenSlam & pressCardSquish keyframes'
  );

  fs.writeFileSync(file, src.replace(/\n/g, eol), 'utf8');
  console.log('1/2 Added synced platen clamp & card squish keyframes in src/index.css');
}

// =========================================================================
// 2. PATCH src/App.tsx: ANCHOR PLATEN TO BED SURFACE & SQUISH CARDS IN SYNC
// =========================================================================
{
  const file = 'src/App.tsx';
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let src = raw.replace(/\r\n/g, '\n');

  // 2A. Update Goobert timers to match the 1.85s slam + 1.0s clamp hold (~860ms midpoint swap, 1860ms lift finish)
  src = replaceExact(
    src,
    `    // Beat 1 (520ms): Swap blank plate for stamped clone while completely hidden under the lowered press hood
    scheduleEventTimer(() => {
      setGoobertStampedCard(clone);
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      triggerSfx('play');
    }, 520);

    // Beat 2 (1060ms): Platen finishes lifting back to resting height, revealing the stamped clone
    scheduleEventTimer(() => {
      setGoobertStamping(false);
    }, 1060);

    // Beat 3 (2450ms): Pause so the player sees the stamped card on the press bed before the modal opens
    scheduleEventTimer(() => {
      setModalAlert({
        title: "THE BEGOTTEN SNEERS",
        message: desc,
        isWin: true,
        btnText: "VENTURE ONWARD",
        onAction: () => {
          setModalAlert(null);
          setGoobertSelectedIdx(null);
          setGoobertStampedCard(null);
          setGoobertOriginalSnapshot(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        }
      });
    }, 2450);`,
    `    // Beat 1 (860ms): Swap blank plate for stamped clone mid-clamp while crushed flat against the press bed
    scheduleEventTimer(() => {
      setGoobertStampedCard(clone);
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      triggerSfx('play');
    }, 860);

    // Beat 2 (1860ms): Platen finishes lifting after 1s hold, cards unsquish into view
    scheduleEventTimer(() => {
      setGoobertStamping(false);
    }, 1860);

    // Beat 3 (3150ms): Pause so the player sees the stamped clone on the press bed before the modal opens
    scheduleEventTimer(() => {
      setModalAlert({
        title: "THE BEGOTTEN SNEERS",
        message: desc,
        isWin: true,
        btnText: "VENTURE ONWARD",
        onAction: () => {
          setModalAlert(null);
          setGoobertSelectedIdx(null);
          setGoobertStampedCard(null);
          setGoobertOriginalSnapshot(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        }
      });
    }, 3150);`,
    'Goobert press 1.85s clamp timers'
  );

  // 2B. Anchor platen at bottom-[56px] (flush with press bed) with resting translateY(-196px) & squish both card slots from origin-bottom
  src = replaceExact(
    src,
    `                      {/* Upper Press Platen & Threaded Screw Shaft */}
                      <div
                        className="pointer-events-none absolute -top-[185px] inset-x-0 z-40 flex flex-col items-center"
                        style={{
                          animation: goobertStamping ? 'pressPlatenSlam 1.05s cubic-bezier(0.22, 0.92, 0.32, 1) forwards' : undefined,
                        }}
                      >
                        <svg viewBox="0 0 460 276" className="w-full max-w-[465px] h-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.98)]">
                          <defs>
                            <linearGradient id="pressIronBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3c4a46" />
                              <stop offset="55%" stopColor="#202926" />
                              <stop offset="100%" stopColor="#101513" />
                            </linearGradient>
                            <linearGradient id="pressFacePlate" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#26312e" />
                              <stop offset="60%" stopColor="#171f1c" />
                              <stop offset="100%" stopColor="#0d1210" />
                            </linearGradient>
                          </defs>
                          {/* Long Threaded Screw Shaft (stays anchored through top of frame during travel) */}
                          <rect x="221" y="0" width="18" height="214" rx="2" fill="#465450" stroke="#748a82" strokeWidth="1.2" />
                          {[18, 34, 50, 66, 82, 98, 114, 130, 146, 162, 178, 194].map((ty) => (
                            <line key={ty} x1="221" y1={ty} x2="239" y2={ty + 4} stroke="#26302d" strokeWidth="1.5" />
                          ))}
                          {/* Crossbar Torque Lever */}
                          <rect x="168" y="186" width="124" height="8" rx="3" fill="#2c3834" stroke="#647a72" strokeWidth="1.2" />
                          <circle cx="168" cy="190" r="5.5" fill="#52665f" />
                          <circle cx="292" cy="190" r="5.5" fill="#52665f" />
                          {/* Heavy Cast-Iron Stamp Head & Platen Block */}
                          <rect x="52" y="212" width="356" height="24" rx="2" fill="url(#pressIronBeam)" stroke="#5f7870" strokeWidth="1.8" />
                          <rect x="64" y="236" width="332" height="28" rx="1.5" fill="url(#pressFacePlate)" stroke="#4d635c" strokeWidth="1.5" />
                          {/* Emerald Ink Contact Strip at Bottom Edge */}
                          <rect x="72" y="264" width="316" height="9" rx="1" fill="#134e4a" stroke="#2dd4bf" strokeWidth="1.1" />
                        </svg>
                      </div>

                      <div className="relative z-20 flex items-end justify-center gap-8 sm:gap-14 -mb-6">
                        {/* Left Bed: Original Creature */}
                        <div className="flex flex-col items-center">
                          <span className="mb-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#091c18]/92 border border-teal-500/75 text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200">
                            Original
                          </span>
                          <div className="w-[108px] h-[148px] flex items-center justify-center">
                            {originalPreview ? (
                              <div className="scale-[0.94] origin-center shadow-[0_14px_28px_rgba(0,0,0,0.92)]">
                                {renderCard(originalPreview, { isClickable: false, disableHoverScale: true })}
                              </div>
                            ) : (
                              <div className="w-[102px] h-[142px] rounded-[4px] border border-dashed border-teal-600/65 bg-[#07120f]/80 flex flex-col items-center justify-center gap-1.5 text-teal-400/65">
                                <span className="text-lg">📜</span>
                                <span className="text-[9px] uppercase tracking-[0.2em]">Original</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Bed: Blank Copper Plate -> Stamped Clone */}
                        <div className="flex flex-col items-center">
                          <span
                            className={\`mb-1.5 px-2.5 py-0.5 rounded-[2px] border text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] \${
                              goobertStampedCard
                                ? 'bg-[#0a261d]/95 border-emerald-400/90 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.45)]'
                                : 'bg-[#0b1815]/85 border-teal-800/70 text-teal-400/75'
                            }\`}
                          >
                            {goobertStampedCard ? 'Stamped Clone' : 'Imprint Plate'}
                          </span>
                          <div className="w-[108px] h-[148px] flex items-center justify-center">
                            {goobertStampedCard ? (
                              <div className="scale-[0.94] origin-center rounded-[4px] shadow-[0_0_38px_rgba(16,185,129,0.65),0_14px_28px_rgba(0,0,0,0.92)] animate-menu-fade-in">
                                {renderCard(goobertStampedCard, { isClickable: false, disableHoverScale: true })}
                              </div>
                            ) : (
                              <div className="w-[102px] h-[142px] rounded-[4px] border border-dashed border-emerald-700/60 bg-[#081511]/80 flex flex-col items-center justify-center gap-1.5 text-emerald-400/60">
                                <span className="text-lg opacity-75">🧪</span>
                                <span className="text-[9px] uppercase tracking-[0.2em]">Blank Plate</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>`,
    `                      {/* Upper Press Platen & Threaded Screw Shaft (resting at -196px; drops to translateY(0) flush on bed) */}
                      <div
                        className="pointer-events-none absolute bottom-[52px] inset-x-0 z-40 flex flex-col items-center"
                        style={{
                          transform: goobertStamping ? undefined : 'translateY(-196px)',
                          animation: goobertStamping ? 'pressPlatenSlam 1.85s cubic-bezier(0.22, 0.92, 0.32, 1) forwards' : undefined,
                        }}
                      >
                        <svg viewBox="0 0 460 296" className="w-full max-w-[465px] h-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.98)]">
                          <defs>
                            <linearGradient id="pressIronBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3c4a46" />
                              <stop offset="55%" stopColor="#202926" />
                              <stop offset="100%" stopColor="#101513" />
                            </linearGradient>
                            <linearGradient id="pressFacePlate" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#26312e" />
                              <stop offset="60%" stopColor="#171f1c" />
                              <stop offset="100%" stopColor="#0d1210" />
                            </linearGradient>
                          </defs>
                          {/* Long Threaded Screw Shaft */}
                          <rect x="221" y="0" width="18" height="234" rx="2" fill="#465450" stroke="#748a82" strokeWidth="1.2" />
                          {[18, 34, 50, 66, 82, 98, 114, 130, 146, 162, 178, 194, 210].map((ty) => (
                            <line key={ty} x1="221" y1={ty} x2="239" y2={ty + 4} stroke="#26302d" strokeWidth="1.5" />
                          ))}
                          {/* Crossbar Torque Lever */}
                          <rect x="168" y="206" width="124" height="8" rx="3" fill="#2c3834" stroke="#647a72" strokeWidth="1.2" />
                          <circle cx="168" cy="210" r="5.5" fill="#52665f" />
                          <circle cx="292" cy="210" r="5.5" fill="#52665f" />
                          {/* Heavy Cast-Iron Stamp Head & Platen Block */}
                          <rect x="52" y="232" width="356" height="24" rx="2" fill="url(#pressIronBeam)" stroke="#5f7870" strokeWidth="1.8" />
                          <rect x="64" y="256" width="332" height="28" rx="1.5" fill="url(#pressFacePlate)" stroke="#4d635c" strokeWidth="1.5" />
                          {/* Emerald Ink Contact Strip at Bottom Edge */}
                          <rect x="72" y="284" width="316" height="9" rx="1" fill="#134e4a" stroke="#2dd4bf" strokeWidth="1.1" />
                        </svg>
                      </div>

                      <div className="relative z-20 flex items-end justify-center gap-8 sm:gap-14 -mb-6">
                        {/* Left Bed: Original Creature (squishes down & unsquishes in sync with platen) */}
                        <div className="flex flex-col items-center">
                          <span
                            className={\`mb-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#091c18]/92 border border-teal-500/75 text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200 transition-opacity duration-150 \${
                              goobertStamping ? 'opacity-0' : 'opacity-100'
                            }\`}
                          >
                            Original
                          </span>
                          <div
                            className="w-[108px] h-[148px] flex items-end justify-center origin-bottom"
                            style={{
                              animation: goobertStamping ? 'pressCardSquish 1.85s cubic-bezier(0.22, 0.92, 0.32, 1) forwards' : undefined,
                            }}
                          >
                            {originalPreview ? (
                              <div className="scale-[0.94] origin-bottom shadow-[0_14px_28px_rgba(0,0,0,0.92)]">
                                {renderCard(originalPreview, { isClickable: false, disableHoverScale: true })}
                              </div>
                            ) : (
                              <div className="w-[102px] h-[142px] rounded-[4px] border border-dashed border-teal-600/65 bg-[#07120f]/80 flex flex-col items-center justify-center gap-1.5 text-teal-400/65">
                                <span className="text-lg">📜</span>
                                <span className="text-[9px] uppercase tracking-[0.2em]">Original</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Bed: Blank Plate -> Stamped Clone (squishes down & unsquishes in sync with platen) */}
                        <div className="flex flex-col items-center">
                          <span
                            className={\`mb-1.5 px-2.5 py-0.5 rounded-[2px] border text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] transition-opacity duration-150 \${
                              goobertStamping ? 'opacity-0' : 'opacity-100'
                            } \${
                              goobertStampedCard
                                ? 'bg-[#0a261d]/95 border-emerald-400/90 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.45)]'
                                : 'bg-[#0b1815]/85 border-teal-800/70 text-teal-400/75'
                            }\`}
                          >
                            {goobertStampedCard ? 'Stamped Clone' : 'Imprint Plate'}
                          </span>
                          <div
                            className="w-[108px] h-[148px] flex items-end justify-center origin-bottom"
                            style={{
                              animation: goobertStamping ? 'pressCardSquish 1.85s cubic-bezier(0.22, 0.92, 0.32, 1) forwards' : undefined,
                            }}
                          >
                            {goobertStampedCard ? (
                              <div className="scale-[0.94] origin-bottom rounded-[4px] shadow-[0_0_38px_rgba(16,185,129,0.65),0_14px_28px_rgba(0,0,0,0.92)]">
                                {renderCard(goobertStampedCard, { isClickable: false, disableHoverScale: true })}
                              </div>
                            ) : (
                              <div className="w-[102px] h-[142px] rounded-[4px] border border-dashed border-emerald-700/60 bg-[#081511]/80 flex flex-col items-center justify-center gap-1.5 text-emerald-400/60">
                                <span className="text-lg opacity-75">🧪</span>
                                <span className="text-[9px] uppercase tracking-[0.2em]">Blank Plate</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>`,
    'Goobert platen bed anchor & card squish sync'
  );

  fs.writeFileSync(file, src.replace(/\n/g, eol), 'utf8');
  console.log('2/2 Synced Goobert platen bed contact, 1s clamp hold, and card squish in src/App.tsx');
}
