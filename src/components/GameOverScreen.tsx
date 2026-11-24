import React from 'react';
import { ALL_CARD_LOOKUP } from '../data/gameData';

export interface GameOverScreenProps {
  RITUAL_VOW_MAP: Record<string, any>;
  activeVows: any[];
  bossState: any;
  calculateGrade: any;
  copiedEndSeed: any;
  getScreenBgStyle: any;
  handleRestartRun: any;
  items: any;
  masterDeck: any[];
  renderCard: any;
  runSeed: any;
  runStats: any;
  setCopiedEndSeed: any;
}

export default function GameOverScreen({
  RITUAL_VOW_MAP,
  activeVows,
  bossState,
  calculateGrade,
  copiedEndSeed,
  getScreenBgStyle,
  handleRestartRun,
  items,
  masterDeck,
  renderCard,
  runSeed,
  runStats,
  setCopiedEndSeed
}: GameOverScreenProps) {
        const isVictory = Boolean(bossState.ritualEndedVoluntarily);
        return (
        <div
          className="absolute inset-0 bg-[#080204] z-50 flex flex-col items-center justify-center px-5 py-4 text-center select-none overflow-hidden animate-fade-up font-mono"
          style={getScreenBgStyle(isVictory ? 'finalboss.jpg' : 'gameover.jpg')}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isVictory
                ? 'radial-gradient(ellipse at 50% 24%, rgba(212,175,55,0.22) 0%, rgba(28,15,8,0.68) 48%, rgba(6,4,3,0.95) 100%)'
                : 'radial-gradient(ellipse at center, rgba(12,6,6,0.35) 0%, rgba(4,2,3,0.9) 100%)',
            }}
          />

          <div
            className={`relative z-10 max-w-5xl w-full max-h-full min-h-0 flex flex-col items-center rounded-[3px] px-6 py-5 backdrop-blur-[2px] ${
              isVictory
                ? 'bg-[radial-gradient(ellipse_at_top,rgba(34,22,12,0.94)_0%,rgba(13,9,7,0.96)_68%)] border border-[#c89d4c]/85 shadow-[0_28px_70px_rgba(0,0,0,0.98),0_0_65px_rgba(212,175,55,0.22)]'
                : 'bg-[#0d0806]/92 border border-[#442819] shadow-[0_24px_60px_rgba(0,0,0,0.96)]'
            }`}
          >
            {isVictory && (
              <>
                <span className="pointer-events-none absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#e5c16b]/85" />
                <span className="pointer-events-none absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#e5c16b]/85" />
                <span className="pointer-events-none absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#e5c16b]/85" />
                <span className="pointer-events-none absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#e5c16b]/85" />
              </>
            )}

            {/* Engraved Header */}
            <div className="shrink-0 flex flex-col items-center text-center mb-4">
              <div className="flex items-center gap-3.5 mb-0.5">
                <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#8a5d36]/75 to-[#d4af37]/85" />
                <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.32em] ${
                  isVictory ? 'text-[#f4d78b]' : 'text-red-400/90'
                }`}>
                  {isVictory
                    ? '✦ Victory · The Archives Sealed ✦'
                    : bossState.ritualSurrendered
                      ? 'Candle Snuffed'
                      : 'RUN FAILED'}
                </span>
                <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#8a5d36]/75 to-[#d4af37]/85" />
              </div>
              <h1
                className={`text-2xl sm:text-4xl font-['Cinzel',_serif] font-black uppercase tracking-[0.22em] leading-tight ${
                  isVictory
                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#fff7d1] via-[#e8c166] to-[#a97828] drop-shadow-[0_4px_20px_rgba(234,179,8,0.45)]'
                    : 'text-red-500 drop-shadow-[0_2px_14px_rgba(239,68,68,0.45)]'
                }`}
              >
                {isVictory
                  ? 'Stitched in Sinew'
                  : bossState.ritualSurrendered
                    ? 'Forfeited to the Dark'
                    : 'The Old One Awaits'}
              </h1>
              <p className={`mt-1 font-['Cinzel',_serif] italic text-xs sm:text-sm tracking-[0.1em] ${
                isVictory ? 'text-[#e8d3ad]' : 'text-[#cfb794]/85'
              }`}>
                {isVictory
                  ? 'The Bone Lord lies bound beneath stone, and your lineage is etched into the ledger.'
                  : bossState.ritualSurrendered
                    ? 'You turned away before the altar.'
                    : 'Your blood runs cold.'}
              </p>
            </div>

            {/* Two-Column Body: Ledger Left, Grimoire Trophy Strip Right */}
            <div className="w-full flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-stretch">
              {/* Left Column: Stats, Rank & Seed/Vows */}
              <div className="md:col-span-5 min-h-0 flex flex-col justify-between gap-3">
                <div className="flex-1 flex flex-col justify-between border border-[#3e2316] bg-[#150d09]/82 px-5 py-4 rounded-[3px] text-left">
                  <div className="flex items-center justify-between border-b border-[#3e2316] pb-3 mb-3">
                    <div>
                      <div className="font-['Cinzel',_serif] text-xs font-bold uppercase tracking-[0.2em] text-[#e5cfa8]">
                        Final Ledger
                      </div>
                      <div className="text-[9.5px] font-mono text-[#8e765c] uppercase tracking-[0.18em] mt-0.5">
                        Judgment
                      </div>
                    </div>
                    {(() => {
                      const grade = calculateGrade(runStats);
                      const baseLetter = grade.letter.charAt(0).toUpperCase();
                      const suffix = grade.letter.slice(1);
                      const baseUrl = import.meta.env.BASE_URL || './';
                      const gradePalettes: Record<string, { gradient: string; glow: string }> = {
                        S: {
                          gradient: 'from-[#fff6c4] via-[#e5b84b] to-[#9a6719]',
                          glow: 'drop-shadow(0 0 14px rgba(245,196,81,0.55)) drop-shadow(0 5px 12px rgba(0,0,0,0.95))',
                        },
                        A: {
                          gradient: 'from-[#b7f7d8] via-[#34d399] to-[#0f6b4a]',
                          glow: 'drop-shadow(0 0 12px rgba(52,211,153,0.45)) drop-shadow(0 5px 12px rgba(0,0,0,0.95))',
                        },
                        B: {
                          gradient: 'from-[#c7e4ff] via-[#60a5fa] to-[#1e40af]',
                          glow: 'drop-shadow(0 0 12px rgba(96,165,250,0.45)) drop-shadow(0 5px 12px rgba(0,0,0,0.95))',
                        },
                        C: {
                          gradient: 'from-[#f3e3c3] via-[#c9a36a] to-[#735329]',
                          glow: 'drop-shadow(0 0 10px rgba(201,163,106,0.4)) drop-shadow(0 5px 12px rgba(0,0,0,0.95))',
                        },
                        D: {
                          gradient: 'from-[#fed7aa] via-[#ea7b2d] to-[#7c2d12]',
                          glow: 'drop-shadow(0 0 10px rgba(234,123,45,0.42)) drop-shadow(0 5px 12px rgba(0,0,0,0.95))',
                        },
                        F: {
                          gradient: 'from-[#fca5a5] via-[#dc2626] to-[#6b1111]',
                          glow: 'drop-shadow(0 0 12px rgba(220,38,38,0.5)) drop-shadow(0 5px 12px rgba(0,0,0,0.95))',
                        },
                      };
                      const palette = gradePalettes[baseLetter] || gradePalettes.F;
                      const renderMaskedGlyph = (src: string, alt: string, heightClass: string, extraClass = '') => (
                        <span className={`relative inline-block ${extraClass}`}>
                          <img src={src} alt={alt} className={`${heightClass} w-auto object-contain opacity-0`} draggable={false} />
                          <span
                            aria-hidden="true"
                            className={`absolute inset-0 bg-gradient-to-b ${palette.gradient}`}
                            style={{
                              WebkitMaskImage: `url("${src}")`,
                              maskImage: `url("${src}")`,
                              WebkitMaskSize: 'contain',
                              maskSize: 'contain',
                              WebkitMaskRepeat: 'no-repeat',
                              maskRepeat: 'no-repeat',
                              WebkitMaskPosition: 'center',
                              maskPosition: 'center',
                            }}
                          />
                        </span>
                      );

                      return (
                        <div
                          className="flex items-start justify-end gap-0.5 select-none"
                          style={{ filter: palette.glow }}
                          aria-label={`Grade ${grade.letter}`}
                        >
                          {renderMaskedGlyph(`${baseUrl}assets/text/${baseLetter}.png`, baseLetter, 'h-20')}
                          {suffix === '+' &&
                            renderMaskedGlyph(`${baseUrl}assets/text/plus.png`, '+', 'h-11', '-ml-1 mt-1')}
                          {suffix === '++' &&
                            renderMaskedGlyph(`${baseUrl}assets/text/plus-plus.png`, '++', 'h-11', '-ml-1 mt-1')}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8957f] uppercase tracking-wider text-[11px]">Stages Cleared</span>
                      <span className="text-amber-200 font-bold text-sm">{runStats.clearedStages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8957f] uppercase tracking-wider text-[11px]">Allies Sacrificed</span>
                      <span className="text-red-300 font-bold text-sm">{runStats.cardsSacrificed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8957f] uppercase tracking-wider text-[11px]">Blood Harvested / Lost</span>
                      <span className="text-stone-100 font-bold text-sm">
                        {runStats.scaleDamageDealt} <span className="text-stone-500 font-normal">/</span> {runStats.scaleDamageTaken}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8957f] uppercase tracking-wider text-[11px]">Horrors Felled</span>
                      <span className="text-purple-300 font-bold text-sm">{runStats.bossesDefeated}</span>
                    </div>
                  </div>
                </div>

                {(runSeed || activeVows.length > 0) && (
                  <div className="shrink-0 px-4 py-2.5 rounded-[3px] bg-[#120b08]/88 border border-[#362015] flex flex-col gap-2 text-[10px] font-mono text-left">
                    {runSeed && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="uppercase tracking-[0.2em] text-[#9b8265]">Seed</span>
                        <button
                          type="button"
                          onClick={() => {
                            try { navigator.clipboard?.writeText(runSeed); } catch {}
                            setCopiedEndSeed(true);
                            window.setTimeout(() => setCopiedEndSeed(false), 1400);
                          }}
                          title="Click to copy seed"
                          className="px-2 py-0.5 rounded-[2px] bg-[#1c130c] border border-[#6e4d2b] text-[#f0d39a] hover:text-white font-bold tracking-[0.14em] cursor-pointer transition-colors"
                        >
                          {copiedEndSeed ? 'COPIED ✓' : runSeed}
                        </button>
                      </div>
                    )}
                    {activeVows.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {activeVows.map(vId => (
                          <span
                            key={vId}
                            className="px-1.5 py-0.5 rounded-[2px] bg-[#2a0c0a] border border-red-800/80 text-[8.5px] font-bold uppercase tracking-[0.1em] text-red-200"
                          >
                            ✦ {RITUAL_VOW_MAP[vId]?.shortTag || vId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Final Grimoire Trophy Strip */}
              <div className="md:col-span-7 min-h-0 flex flex-col p-3.5 rounded-[3px] bg-[#120b08]/85 border border-[#3a2317] text-left">
                <div className="flex items-center justify-between border-b border-[#2e1c12] pb-1.5 mb-2 shrink-0">
                  <span className="text-[11px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.22em] text-[#d6b377]">
                    Final Grimoire
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8d7458]">
                    {masterDeck.length} Vessels
                  </span>
                </div>
                {masterDeck.length > 0 ? (() => {
                  const annotated = masterDeck.map((c, idx) => {
                    const base = ALL_CARD_LOOKUP[c.name];
                    const isFused = Boolean((c as any).isMycologistCombined);
                    const isForged = Boolean((c as any).isGoobertClone);
                    const atkDelta = base ? (c.attack || 0) - (base.attack || 0) : 0;
                    const hpDelta = base ? (c.health || 0) - (base.health || 0) : 0;
                    const sigilDelta = base ? (c.sigils?.length || 0) - (base.sigils?.length || 0) : 0;
                    const isBuffed = atkDelta > 0 || hpDelta > 0;
                    const isGrafted = sigilDelta > 0;

                    let badge: { label: string; cls: string; rank: number } | null = null;
                    if (isFused) {
                      badge = {
                        label: 'STITCHED',
                        cls: 'bg-[#21102a]/95 border-purple-400/85 text-purple-200',
                        rank: 4,
                      };
                    } else if (isForged) {
                      badge = {
                        label: 'IMPRINTED',
                        cls: 'bg-[#09201c]/95 border-teal-400/85 text-teal-200',
                        rank: 3,
                      };
                    } else if (isBuffed) {
                      badge = {
                        label: `+${Math.max(0, atkDelta)}/+${Math.max(0, hpDelta)}`,
                        cls: 'bg-[#2a110a]/95 border-amber-400/85 text-amber-200',
                        rank: 2,
                      };
                    } else if (isGrafted) {
                      badge = {
                        label: 'CRESTED',
                        cls: 'bg-[#1f1709]/95 border-[#d4af37]/85 text-[#f4d78b]',
                        rank: 1,
                      };
                    }
                    return { card: c, idx, badge, rank: badge?.rank || 0 };
                  });

                  const sorted = [...annotated].sort((a, b) => b.rank - a.rank);

                  return (
                    <div className="flex-1 min-h-0 flex flex-wrap justify-center content-start gap-x-0.5 gap-y-1 max-h-[290px] overflow-y-auto pt-2.5 pb-1 px-1">
                      {sorted.map(({ card, idx, badge }) => (
                        <div
                          key={card.id || `trophy-${card.name}-${idx}`}
                          className="relative flex flex-col items-center pointer-events-none"
                        >
                          {badge && (
                            <span
                              className={`absolute -top-2 left-1/2 -translate-x-1/2 z-30 px-1.5 py-0.5 rounded-[2px] border text-[7.5px] font-mono font-bold uppercase tracking-[0.14em] whitespace-nowrap shadow-md ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                          )}
                          <div className="scale-[0.64] -mx-4 -my-6">
                            {renderCard(card, { isClickable: false, disableHoverScale: true })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })() : (
                  <div className="flex-1 flex items-center justify-center text-[11px] text-[#7f6a54] uppercase tracking-widest">
                    No surviving vessels
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0 flex flex-wrap items-center justify-center gap-3">
              {runSeed && (
                <button
                  onClick={() => handleRestartRun(runSeed)}
                  className="bg-[#18110c] hover:bg-[#261b12] active:translate-y-[1px] border border-[#8e6a3c]/80 hover:border-[#e5c16b] rounded-[2px] shadow-[0_2px_0_#0a0807] transition-all duration-75 font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] text-[#e6c88e] hover:text-white px-6 py-2.5 select-none cursor-pointer"
                >
                  Replay Seed
                </button>
              )}
              <button
                onClick={() => handleRestartRun()}
                className={`rounded-[2px] active:translate-y-[1px] transition-all duration-75 font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] px-8 py-2.5 select-none cursor-pointer ${
                  isVictory
                    ? 'bg-gradient-to-b from-[#3b2814] to-[#20150a] hover:from-[#4d341a] hover:to-[#2a1b0d] border border-[#e5c16b]/90 text-[#fff3ce] hover:text-white shadow-[0_4px_18px_rgba(212,175,55,0.28)]'
                    : 'bg-[#1e1510] hover:bg-[#2c1e16] active:bg-[#140e0b] border border-[#5c3926] hover:border-[#c99b56] shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.08)] text-[#efe0be] hover:text-white'
                }`}
              >
                {isVictory ? 'New Ritual' : 'Begin Anew'}
              </button>
            </div>
          </div>
        </div>
        );
}
