const fs = require('fs');

// 1. Rework Compendium trim in src/components/ArchiveModal.tsx
{
  const file = 'src/components/ArchiveModal.tsx';
  let src = fs.readFileSync(file, 'utf8');

  const oldStart = "  const baseUrl = import.meta.env.BASE_URL || './';";
  const oldEnd = "        {/* Top Header */}";
  const sIdx = src.indexOf(oldStart);
  const eIdx = src.indexOf(oldEnd, sIdx);

  if (sIdx === -1 || eIdx === -1) {
    console.error('Could not locate panelStyle / ArchiveStitch block in src/components/ArchiveModal.tsx');
    process.exit(1);
  }

  const newArchiveTrim = `  const baseUrl = import.meta.env.BASE_URL || './';
  const isLedger = activeTab === 'LEDGER';
  const knob = isLedger
    ? 'radial-gradient(circle at 50% 50%, #524d54 0 2.5px, #2b272d 3px, #121014 5.5px, transparent 7px)'
    : 'radial-gradient(circle at 46% 42%, #d4af6a 0 1.8px, #876128 2.4px, #36220f 4.4px, #110904 5.4px, transparent 6.5px)';
  const panelStyle: import('react').CSSProperties = {
    position: 'relative',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: '16px 12px 12px 12px',
    boxShadow: isLedger
      ? '0 0 0 1px #2e2930, 0 24px 60px rgba(0,0,0,0.94)'
      : '0 0 0 1px #190e08, 0 0 0 2px #52361c, 0 26px 64px rgba(0,0,0,0.96), inset 0 1px 0 rgba(224,184,120,0.2)',
    backgroundColor: isLedger ? '#3a271a' : '#24160e',
    backgroundImage: isLedger
      ? [
          knob,
          knob,
          'linear-gradient(180deg, rgba(10,9,12,0.55), rgba(6,5,8,0.7))',
          \`url("\${baseUrl}assets/text/slate.jpg")\`,
          'linear-gradient(to bottom, rgba(102,73,51,0.52), rgba(42,27,18,0.62), rgba(20,12,8,0.84))',
          \`url("\${baseUrl}assets/text/wood.jpg")\`,
        ].join(', ')
      : [
          knob,
          knob,
          knob,
          knob,
          'radial-gradient(ellipse at 50% 0%, #5e0d10 0%, #3a0709 54%, #180304 100%)',
          'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
          \`url("\${baseUrl}assets/text/wood.jpg")\`,
        ].join(', '),
    backgroundSize: isLedger
      ? ['28px 18px', '28px 18px', 'auto', 'cover', 'auto', '140px 140px'].join(', ')
      : ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'auto', '140px 140px'].join(', '),
    backgroundPosition: isLedger
      ? 'left top, right top, 0 0, 0 0, 0 0, center'
      : 'left top, right top, left bottom, right bottom, 0 0, 0 0, center',
    backgroundRepeat: isLedger
      ? ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', ')
      : ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
    backgroundOrigin: isLedger
      ? 'border-box, border-box, padding-box, padding-box, border-box, border-box'
      : 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
    backgroundClip: isLedger
      ? 'border-box, border-box, padding-box, padding-box, border-box, border-box'
      : 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
  };

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-[140] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={panelStyle}
        className="w-full max-w-4xl h-[672px] max-h-[94%] flex flex-col rounded-[2px] bg-[#0d0b0f] overflow-hidden"
      >
        {!isLedger && (
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-multiply"
            style={{
              backgroundImage: \`url("\${baseUrl}assets/text/cloth.jpg")\`,
              backgroundSize: '170px 170px',
              backgroundRepeat: 'repeat',
            }}
          />
        )}
        {/* ArchiveStitch & Recessed Well */}
        {isLedger ? (
          <>
            <div className="pointer-events-none absolute inset-0 z-30 border border-[#322d34]/90" />
            <div className="pointer-events-none absolute inset-[5px] z-30 border border-dashed border-[#4a434d]/40" />
          </>
        ) : (
          <>
            <div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                boxShadow:
                  'inset 0 4px 14px rgba(0,0,0,0.92), inset 0 0 0 1px #140705, 0 0 0 1px rgba(184,138,68,0.24)',
              }}
            />
            <div className="pointer-events-none absolute inset-[6px] z-30 border border-dashed border-[#b98d46]/28" />
            <div className="pointer-events-none absolute top-[5px] left-[5px] w-3.5 h-3.5 z-30 border-t border-l border-[#b8904a]/55" />
            <div className="pointer-events-none absolute top-[5px] right-[5px] w-3.5 h-3.5 z-30 border-t border-r border-[#b8904a]/55" />
            <div className="pointer-events-none absolute bottom-[5px] left-[5px] w-3.5 h-3.5 z-30 border-b border-l border-[#b8904a]/55" />
            <div className="pointer-events-none absolute bottom-[5px] right-[5px] w-3.5 h-3.5 z-30 border-b border-r border-[#b8904a]/55" />
          </>
        )}
`;

  src = src.slice(0, sIdx) + newArchiveTrim + src.slice(eIdx);
  fs.writeFileSync(file, src, 'utf8');
  console.log('Updated Compendium trim in src/components/ArchiveModal.tsx');
}

// 2. Apply matching Compendium crimson-cloth + carved-wood trim to showPauseMenu in src/App.tsx
{
  const file = 'src/App.tsx';
  let src = fs.readFileSync(file, 'utf8');

  const startMarker = '      {showPauseMenu &&';
  const endAnchor = '      {/* =========================================================================\n          DRAFT SCREEN (PELT TRADING)';

  const startIdx = src.indexOf(startMarker);
  const anchorIdx = src.indexOf(endAnchor);
  if (startIdx === -1 || anchorIdx === -1 || anchorIdx <= startIdx) {
    console.error('Could not locate showPauseMenu bounds in src/App.tsx');
    process.exit(1);
  }
  const closeIdx = src.lastIndexOf('      )}', anchorIdx);
  if (closeIdx === -1 || closeIdx <= startIdx) {
    console.error('Could not locate closing )} for showPauseMenu in src/App.tsx');
    process.exit(1);
  }

  const replacement = `      {showPauseMenu && (() => {
        const knob = 'radial-gradient(circle at 46% 42%, #d4af6a 0 1.8px, #876128 2.4px, #36220f 4.4px, #110904 5.4px, transparent 6.5px)';
        const pausePanelStyle: React.CSSProperties = {
          position: 'relative',
          borderStyle: 'solid',
          borderColor: 'transparent',
          borderWidth: '16px 12px 12px 12px',
          boxShadow: '0 0 0 1px #190e08, 0 0 0 2px #52361c, 0 26px 64px rgba(0,0,0,0.96), inset 0 1px 0 rgba(224,184,120,0.2)',
          backgroundColor: '#24160e',
          backgroundImage: [
            knob,
            knob,
            knob,
            knob,
            'radial-gradient(ellipse at 50% 0%, #5e0d10 0%, #3a0709 54%, #180304 100%)',
            'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
            \`url("\${BASE}assets/text/wood.jpg")\`,
          ].join(', '),
          backgroundSize: ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'auto', '140px 140px'].join(', '),
          backgroundPosition: 'left top, right top, left bottom, right bottom, 0 0, 0 0, center',
          backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
          backgroundOrigin: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
          backgroundClip: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
        };

        return (
          <div
            onClick={() => setShowPauseMenu(false)}
            className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-up select-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={pausePanelStyle}
              className="max-w-sm w-full text-center rounded-[2px] bg-[#180304] overflow-hidden"
            >
              {/* Crimson Cloth Weave */}
              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-multiply"
                style={{
                  backgroundImage: \`url("\${BASE}assets/text/cloth.jpg")\`,
                  backgroundSize: '170px 170px',
                  backgroundRepeat: 'repeat',
                }}
              />
              {/* Recessed Well Shadow, Stitched Seam & Tarnished-Brass Corner Brackets */}
              <div
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  boxShadow:
                    'inset 0 4px 14px rgba(0,0,0,0.92), inset 0 0 0 1px #140705, 0 0 0 1px rgba(184,138,68,0.24)',
                }}
              />
              <div className="pointer-events-none absolute inset-[6px] z-20 border border-dashed border-[#b98d46]/28" />
              <div className="pointer-events-none absolute top-[5px] left-[5px] w-3.5 h-3.5 z-20 border-t border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute top-[5px] right-[5px] w-3.5 h-3.5 z-20 border-t border-r border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] left-[5px] w-3.5 h-3.5 z-20 border-b border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] right-[5px] w-3.5 h-3.5 z-20 border-b border-r border-[#b8904a]/55" />

              <div className="relative z-10 px-6 py-5">
                <div className="text-[9px] font-['Cinzel',_serif] text-[#c7a97b]/80 tracking-[0.28em] uppercase mb-1">
                  Ritual Paused
                </div>
                <h2 className="text-xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#f2e4cc] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  The Sanctuary
                </h2>
                <div className="mx-auto my-3 h-px w-28 bg-gradient-to-r from-transparent via-[#a8813e]/55 to-transparent" />

                <div className="flex flex-col gap-3.5 w-full">
                  {/* Volume Sliders */}
                  <div className="w-full py-3 px-4 flex flex-col gap-3 font-mono text-xs text-left bg-[#120506]/75 border border-[#4a231c]/80 rounded-[2px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.85)]">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#d9cbb5]">
                        <span>Music Volume</span>
                        <span className="font-bold text-[#e6c382]">{Math.round(musicVol * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={musicVol}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setMusicVol(val);
                          if (!audioEnabled && val > 0) setAudioEnabled(true);
                          ChiptuneAudio.setMusicVolume(val);
                        }}
                        className="w-full accent-amber-500 h-1 bg-[#1f0a0b] rounded cursor-pointer touch-manipulation"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#d9cbb5]">
                        <span>Sound FX Volume</span>
                        <span className="font-bold text-[#e6c382]">{Math.round(sfxVol * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={sfxVol}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSfxVol(val);
                          if (!audioEnabled && val > 0) setAudioEnabled(true);
                          ChiptuneAudio.setSfxVolume(val);
                        }}
                        onPointerUp={() => ChiptuneAudio.playSfxPreview()}
                        className="w-full accent-amber-500 h-1 bg-[#1f0a0b] rounded cursor-pointer touch-manipulation"
                      />
                    </div>
                  </div>

                  {/* Compendium & Lifetime Ledger */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setShowPauseMenu(false);
                        setArchiveModalTab('COMPENDIUM');
                      }}
                      className="w-full py-2 bg-[#1a090a] hover:bg-[#270d0f] active:bg-[#120607] border border-[#4f241c] hover:border-[#8f6a2c] rounded-[2px] shadow-[0_2px_0_#090304,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[10px] uppercase tracking-widest text-[#d9c19c] hover:text-[#f7eedc] cursor-pointer text-center"
                    >
                      Compendium
                    </button>
                    <button
                      onClick={() => {
                        setShowPauseMenu(false);
                        setArchiveModalTab('LEDGER');
                      }}
                      className="w-full py-2 bg-[#1a090a] hover:bg-[#270d0f] active:bg-[#120607] border border-[#4f241c] hover:border-[#8f6a2c] rounded-[2px] shadow-[0_2px_0_#090304,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[10px] uppercase tracking-widest text-[#d9c19c] hover:text-[#f7eedc] cursor-pointer text-center"
                    >
                      Ledger
                    </button>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-[#692924]/70 to-transparent" />

                  {/* Resume Ritual */}
                  <button
                    onClick={() => setShowPauseMenu(false)}
                    className="w-full py-2.5 bg-[#240b0d] hover:bg-[#331013] active:bg-[#170708] border border-[#8f6a2c]/80 hover:border-[#c99e52] rounded-[2px] shadow-[0_2px_0_#090304,inset_0_1px_0_rgba(241,213,143,0.12)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-[0.18em] text-[#f2e1c2] hover:text-white cursor-pointer text-center"
                  >
                    Resume Ritual
                  </button>

                  {/* Postpone Ritual (Save & Return to Title) */}
                  <button
                    onClick={() => {
                      if (masterDeck && masterDeck.length > 0) {
                        const isMidDuel = preDuelMapRef.current !== null;
                        if (!isMidDuel || !localStorage.getItem(RUN_SAVE_KEY)) {
                          try {
                            localStorage.setItem(RUN_SAVE_KEY, JSON.stringify({
                              masterDeck,
                              items,
                              totalOverkillDamage,
                              stage,
                              level,
                              duelsCompleted,
                              totemPieces,
                              activeTotem,
                              currentStageName,
                              startingBones: startingBonesRef.current !== undefined ? startingBonesRef.current : startingBones,
                              ouroborosBuffs,
                              runStats,
                              standardBossOrder: (window as any).__standardBossOrder,
                              hasDefeatedWeaver,
                              permanentScaleDebuff,
                              consecutiveOneTurnWins,
                              otkCooldown,
                              actMap: preDuelMapRef.current ?? actMapRef.current,
                              savedAt: Date.now(),
                            }));
                            setSavedRunExists(true);
                          } catch (e) {
                            console.warn("Postpone save failed:", e);
                          }
                        }
                      }
                      preDuelMapRef.current = null;
                      try {
                        ChiptuneAudio.playAmbient();
                      } catch (e) {
                        console.warn("Audio switch blocked:", e);
                      }
                      setShowPauseMenu(false);
                      setScreen('SPLASH');
                    }}
                    className="w-full py-2 bg-[#1a090a] hover:bg-[#270d0f] active:bg-[#120607] border border-amber-900/65 hover:border-amber-700/85 rounded-[2px] shadow-[0_2px_0_#090304,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-[0.15em] text-amber-300/90 hover:text-amber-200 cursor-pointer text-center"
                  >
                    Postpone Ritual
                  </button>

                  {/* End Ritual (Surrender & Wipe Save) */}
                  <button
                    onClick={() => {
                      clearRunSave();
                      setShowPauseMenu(false);
                      triggerSfx('defeat');
                      setBossState(prev => ({
                        ...prev,
                        isRitualComplete: false,
                        ritualEndedVoluntarily: false,
                        ritualSurrendered: true,
                      }));
                      setScreen('GAME_OVER');
                    }}
                    className="w-full py-2 bg-[#170708] hover:bg-[#260b0d] active:bg-[#100405] border border-[#591a16] hover:border-red-700/85 rounded-[2px] shadow-[0_2px_0_#090304,inset_0_1px_0_rgba(255,255,255,0.05)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-[0.15em] text-red-400/90 hover:text-red-300 cursor-pointer text-center"
                  >
                    End Ritual
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}`;

  src = src.slice(0, startIdx) + replacement + src.slice(closeIdx + '      )}'.length);
  fs.writeFileSync(file, src, 'utf8');
  console.log('Updated showPauseMenu in src/App.tsx');
}
