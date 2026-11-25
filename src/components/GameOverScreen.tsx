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
  seedsUnlocked?: boolean;
  highestScore?: number;
  highestRank?: string;
  highestRankColor?: string;
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
  masterDeck,
  renderCard,
  runSeed,
  runStats,
  seedsUnlocked,
  highestScore,
  highestRank,
  highestRankColor,
  setCopiedEndSeed,
}: GameOverScreenProps) {
  const isVictory = Boolean(bossState.ritualEndedVoluntarily);
  const BASE = import.meta.env.BASE_URL || './';
  const woodBg = `url("${BASE}assets/text/wood.jpg")`;
  const slateBg = `url("${BASE}assets/text/slate.jpg")`;
  const clothBg = `url("${BASE}assets/text/cloth.jpg")`;

  return (
    <div
      className="absolute inset-0 bg-[#070203] z-50 flex flex-col items-center justify-center px-5 py-4 text-center select-none overflow-hidden animate-fade-up font-mono"
      style={getScreenBgStyle(isVictory ? 'finalboss.jpg' : 'gameover.jpg')}
    >
      {/* Atmospheric Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isVictory
            ? 'radial-gradient(ellipse at 50% 24%, rgba(168,125,46,0.22) 0%, rgba(22,8,7,0.74) 48%, rgba(6,2,3,0.96) 100%)'
            : 'radial-gradient(ellipse at center, rgba(38,6,8,0.36) 0%, rgba(5,2,3,0.94) 100%)',
        }}
      />

      <div className="relative z-10 max-w-5xl w-full max-h-full min-h-0 flex flex-col items-center px-4 sm:px-6 py-4">
        {/* Engraved Header */}
        <div className="shrink-0 flex flex-col items-center text-center mb-4">
          <div className="flex items-center gap-3.5 mb-0.5">
            <div
              className={`h-px w-12 sm:w-20 bg-gradient-to-r from-transparent ${
                isVictory ? 'via-[#9a7332]/80 to-[#e5c16b]/90' : 'via-[#7f1d1d]/80 to-red-500/85'
              }`}
            />
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-[0.34em] ${
                isVictory ? 'text-[#f2d282]' : 'text-red-500'
              }`}
              style={isVictory ? undefined : { textShadow: '0 0 10px rgba(239,68,68,0.65)' }}
            >
              {isVictory
                ? '✦ Victory · The Archives Sealed ✦'
                : bossState.ritualSurrendered
                  ? 'Candle Snuffed'
                  : 'Run Failed'}
            </span>
            <div
              className={`h-px w-12 sm:w-20 bg-gradient-to-l from-transparent ${
                isVictory ? 'via-[#9a7332]/80 to-[#e5c16b]/90' : 'via-[#7f1d1d]/80 to-red-500/85'
              }`}
            />
          </div>
          <h1
            className={`text-2xl sm:text-4xl font-['Cinzel',_serif] font-black uppercase tracking-[0.24em] leading-tight ${
              isVictory
                ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#fff7d1] via-[#e8c166] to-[#a97828] drop-shadow-[0_4px_20px_rgba(234,179,8,0.45)]'
                : 'text-red-500'
            }`}
            style={
              isVictory
                ? undefined
                : { textShadow: '0 0 22px rgba(220,38,38,0.65), 0 3px 8px rgba(0,0,0,0.98)' }
            }
          >
            {isVictory
              ? 'Stitched in Sinew'
              : bossState.ritualSurrendered
                ? 'Forfeited to the Dark'
                : 'The Old One Awaits'}
          </h1>
          <p
            className={`mt-1 font-['Cinzel',_serif] italic text-xs sm:text-sm tracking-[0.12em] ${
              isVictory ? 'text-[#e8d3ad]' : 'text-stone-300/80'
            }`}
          >
            {isVictory
              ? 'The Bone Lord lies bound beneath stone, and your lineage is etched into the ledger.'
              : bossState.ritualSurrendered
                ? 'You turned away before the altar.'
                : 'Your blood runs cold.'}
          </p>
        </div>

        {/* Two-Column Body: Dark-Timber Framed Ledger (Left) & Crimson Cloth Grimoire (Right) */}
        <div className="w-full flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 mb-5 items-stretch">
          {/* Left Column: Slate Ledger + Seed/Vows */}
          <div className="md:col-span-5 min-h-0 flex flex-col justify-between gap-3">
            <div
              className="relative flex-1 p-[4px] rounded-[2px] shadow-[0_18px_38px_rgba(0,0,0,0.92)]"
              style={{ backgroundImage: woodBg, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-[2px] bg-[#0a0505]/55 border border-[#2d1415]" />
              <div className="relative w-full h-full flex flex-col justify-between px-5 py-4 rounded-[1px] bg-[#100b0c] border border-[#2e1617] text-left overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply bg-cover bg-center"
                  style={{ backgroundImage: slateBg }}
                />
                <div className="relative z-10 flex items-center justify-between border-b border-[#38181a] pb-3 mb-3">
                  <div>
                    <div className="font-['Cinzel',_serif] text-xs font-bold uppercase tracking-[0.22em] text-[#ede3d2]">
                      Final Ledger
                    </div>
                    <div className="text-[9.5px] font-mono text-red-400/75 uppercase tracking-[0.2em] mt-0.5">
                      Judgment
                    </div>
                  </div>
                  {(() => {
                    const grade = calculateGrade(runStats, activeVows);
                    const baseLetter = grade.letter.charAt(0).toUpperCase();
                    const suffix = grade.letter.slice(1);
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
                        glow: 'drop-shadow(0 0 14px rgba(220,38,38,0.6)) drop-shadow(0 5px 12px rgba(0,0,0,0.95))',
                      },
                    };
                    const palette = gradePalettes[baseLetter] || gradePalettes.F;
                    const renderMaskedGlyph = (src: string, alt: string, heightClass: string, extraClass = '') => (
                      <span className={`relative inline-block ${extraClass}`}>
                        <img
                          src={src}
                          alt={alt}
                          className={`${heightClass} w-auto object-contain opacity-0`}
                          draggable={false}
                        />
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
                        {renderMaskedGlyph(`${BASE}assets/text/${baseLetter}.png`, baseLetter, 'h-20')}
                        {suffix === '+' &&
                          renderMaskedGlyph(`${BASE}assets/text/plus.png`, '+', 'h-11', '-ml-1 mt-1')}
                        {suffix === '++' &&
                          renderMaskedGlyph(`${BASE}assets/text/plus-plus.png`, '++', 'h-11', '-ml-1 mt-1')}
                      </div>
                    );
                  })()}
                </div>

                <div className="relative z-10 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 uppercase tracking-[0.14em] text-[10.5px]">Stages Cleared</span>
                    <span className="text-[#f0dfc2] font-bold text-sm">{runStats.clearedStages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 uppercase tracking-[0.14em] text-[10.5px]">Allies Sacrificed</span>
                    <span className="text-red-400 font-bold text-sm">{runStats.cardsSacrificed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 uppercase tracking-[0.14em] text-[10.5px]">
                      Blood Extracted / Lost
                    </span>
                    <span className="text-stone-100 font-bold text-sm">
                      {runStats.scaleDamageDealt}{' '}
                      <span className="text-stone-600 font-normal">/</span> {runStats.scaleDamageTaken}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 uppercase tracking-[0.14em] text-[10.5px]">Horrors Felled</span>
                    <span className="text-red-300 font-bold text-sm">{runStats.bossesDefeated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 uppercase tracking-[0.14em] text-[10.5px]">High Score</span>
                    <span className="text-[#f2e2ca] font-bold text-sm">{highestScore || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {((seedsUnlocked && runSeed) || activeVows.length > 0) && (
              <div className="relative shrink-0 px-4 py-2.5 rounded-[2px] bg-[#100708]/92 border border-[#3a1719] flex flex-col gap-2 text-[10px] font-mono text-left overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply bg-cover bg-center"
                  style={{ backgroundImage: slateBg }}
                />
                {seedsUnlocked && runSeed && (
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="uppercase tracking-[0.22em] text-stone-400">Seed</span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard?.writeText(runSeed);
                        } catch {}
                        setCopiedEndSeed(true);
                        window.setTimeout(() => setCopiedEndSeed(false), 1400);
                      }}
                      title="Click to copy seed"
                      className="px-2.5 py-0.5 rounded-[1px] bg-[#1b080a] border border-[#5e1f22] hover:border-red-500 text-[#f2e2ca] hover:text-white font-bold tracking-[0.16em] cursor-pointer transition-colors"
                    >
                      {copiedEndSeed ? 'COPIED ✓' : runSeed}
                    </button>
                  </div>
                )}
                {activeVows.length > 0 && (() => {
                  const totalVowPts = activeVows.reduce(
                    (acc: number, id: string) => acc + (RITUAL_VOW_MAP[id]?.scoreBonus || 0),
                    0
                  );
                  return (
                    <div className="relative z-10 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em]">
                        <span className="text-red-400/85 font-bold">Sworn Vows ({activeVows.length})</span>
                        {totalVowPts > 0 && (
                          <span className="text-[#e8c166] font-bold">+{totalVowPts} Ledger Pts</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {activeVows.map((vId) => (
                          <span
                            key={vId}
                            title={RITUAL_VOW_MAP[vId]?.desc}
                            className="px-1.5 py-0.5 rounded-[1px] bg-[#2e090b] border border-red-800/80 text-[8.5px] font-bold uppercase tracking-[0.12em] text-red-200"
                          >
                            ◆ {RITUAL_VOW_MAP[vId]?.shortTag || vId}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Column: Crimson Cloth Grimoire */}
          <div
            className="md:col-span-7 relative min-h-0 p-[4px] rounded-[2px] shadow-[0_18px_38px_rgba(0,0,0,0.92)]"
            style={{ backgroundImage: woodBg, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[2px] bg-[#0a0505]/55 border border-[#2d1415]" />
            <div
              className="relative w-full h-full min-h-0 flex flex-col p-3.5 rounded-[1px] border border-[#3a1517] text-left overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, #3a090c 0%, #1d0405 55%, #0c0304 100%)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-45 mix-blend-multiply bg-cover bg-center"
                style={{ backgroundImage: clothBg }}
              />
              <div className="relative z-10 flex items-center justify-between border-b border-[#521a1d]/80 pb-1.5 mb-2 shrink-0">
                <span className="text-[11px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.24em] text-[#ede3d2]">
                  Final Grimoire
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-300/80">
                  {masterDeck.length} Vessels
                </span>
              </div>
              {masterDeck.length > 0 ? (
                (() => {
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
                        cls: 'bg-[#2c0b0b]/95 border-red-400/85 text-red-200',
                        rank: 2,
                      };
                    } else if (isGrafted) {
                      badge = {
                        label: 'CRESTED',
                        cls: 'bg-[#1f1409]/95 border-[#d4af37]/85 text-[#f4d78b]',
                        rank: 1,
                      };
                    }
                    return { card: c, idx, badge, rank: badge?.rank || 0 };
                  });

                  const sorted = [...annotated].sort((a, b) => b.rank - a.rank);

                  return (
                    <div className="relative z-10 flex-1 min-h-0 flex flex-wrap justify-center content-start gap-x-0.5 gap-y-1 max-h-[290px] overflow-y-auto pt-2.5 pb-1 px-1">
                      {sorted.map(({ card, idx, badge }) => (
                        <div
                          key={card.id || `trophy-${card.name}-${idx}`}
                          className="relative flex flex-col items-center pointer-events-none"
                        >
                          {badge && (
                            <span
                              className={`absolute -top-2 left-1/2 -translate-x-1/2 z-30 px-1.5 py-0.5 rounded-[1px] border text-[7.5px] font-mono font-bold uppercase tracking-[0.14em] whitespace-nowrap shadow-md ${badge.cls}`}
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
                })()
              ) : (
                <div className="relative z-10 flex-1 flex items-center justify-center text-[11px] text-stone-500 uppercase tracking-widest">
                  No surviving vessels
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diegetic Action Controls */}
        <div className="shrink-0 flex flex-wrap items-center justify-center gap-6">
          {runSeed && seedsUnlocked && (
            <button
              onClick={() => handleRestartRun(runSeed)}
              className="px-4 py-1.5 font-mono font-bold text-xs uppercase tracking-[0.26em] text-stone-300 hover:text-red-300 transition-all duration-150 select-none cursor-pointer"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.95)' }}
            >
              [ REPLAY SEED ]
            </button>
          )}
          <button
            onClick={() => handleRestartRun()}
            className={`px-6 py-2 rounded-[1px] border-y transition-all duration-150 font-['Cinzel',_serif] font-black text-sm uppercase tracking-[0.28em] select-none cursor-pointer ${
              isVictory
                ? 'border-[#d4af37]/80 text-[#f6dc93] hover:text-white bg-black/50'
                : 'border-red-700/80 text-red-400 hover:text-red-200 bg-black/55'
            }`}
            style={{
              textShadow: isVictory
                ? '0 0 18px rgba(234,179,8,0.6), 0 2px 5px rgba(0,0,0,1)'
                : '0 0 18px rgba(239,68,68,0.8), 0 2px 5px rgba(0,0,0,1)',
            }}
          >
            {isVictory ? 'NEW RITUAL' : 'BEGIN ANEW'}
          </button>
        </div>
      </div>
    </div>
  );
}
