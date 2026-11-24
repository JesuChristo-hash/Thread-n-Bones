import React from 'react';
import { ALL_CARD_LOOKUP , MAIN_DECK_POOL } from '../data/gameData';

export interface DeckSelectScreenProps {
  normalizeSeed: any;
  generateRandomSeed: any;
  RITUAL_VOWS: any[];
  activeVows: any[];
  archive: any;
  getScreenBgStyle: any;
  handleSelectLineage: any;
  renderCard: any;
  runSeedInput: any;
  setRunSeedInput: any;
  toggleRitualVow: any;
  triggerSfx: any;
}

export default function DeckSelectScreen({
  normalizeSeed,
  generateRandomSeed,
  RITUAL_VOWS,
  activeVows,
  archive,
  getScreenBgStyle,
  handleSelectLineage,
  renderCard,
  runSeedInput,
  setRunSeedInput,
  toggleRitualVow,
  triggerSfx
}: DeckSelectScreenProps) {
  return (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-3.5 overflow-hidden animate-fade-up font-mono select-none"
          style={getScreenBgStyle('deck-selection.jpg')}
        >
          {/* Atmospheric Vignette & Candlelight Overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,7,5,0.22)_0%,rgba(6,4,3,0.82)_100%)] pointer-events-none z-0" />
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.2)_0%,rgba(180,83,9,0.07)_45%,transparent_70%)] pointer-events-none animate-[pulse_5s_infinite_ease-in-out] blur-2xl z-0" />
          <div
            className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.18)_0%,rgba(217,119,6,0.06)_45%,transparent_70%)] pointer-events-none animate-[pulse_5s_infinite_ease-in-out] blur-2xl z-0"
            style={{ animationDelay: '2.5s' }}
          />

          {/* Engraved Ritual Header */}
          <div className="relative z-10 flex flex-col items-center text-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/80" />
              <h1 className="text-xl sm:text-2xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.28em] text-[#e7cda0] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                Choose Your Lineage
              </h1>
              <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/80" />
            </div>

            {/* Run Seed & Post-Clear Ritual Vows Bar */}
            {(() => {
              const ALL_LINEAGE_IDS = ['randomizer', 'witchcraft', 'infestation', 'skeleton', 'eldritch', 'paleozoic'];
              const clearedCount = ALL_LINEAGE_IDS.filter(id => (archive.clearedLineages || []).includes(id)).length;
              const seedsUnlocked = clearedCount >= ALL_LINEAGE_IDS.length;
              const vowsUnlocked =
                (archive.runsWon || 0) > 0 || (archive.defeatedBosses || []).includes('BoneLord');
              return (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5 px-3.5 py-1 rounded-[3px] bg-[#0c0806]/84 border border-[#3e2a1b]/85 shadow-[0_10px_26px_rgba(0,0,0,0.85)] backdrop-blur-[2px]">
                  {seedsUnlocked ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase tracking-[0.22em] text-[#b5905c] font-bold">
                        Seed
                      </span>
                      <input
                        type="text"
                        value={runSeedInput}
                        onChange={e => setRunSeedInput(normalizeSeed(e.target.value))}
                        placeholder="RANDOM"
                        maxLength={14}
                        aria-label="Run Seed"
                        className="w-28 px-2 py-0.5 rounded-[2px] bg-[#160f0a] border border-[#4e3622] focus:border-[#d4af37] outline-none text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#f3dfb6] placeholder:text-[#6f573d]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setRunSeedInput(generateRandomSeed());
                          triggerSfx('draw');
                        }}
                        title="Roll a fresh deterministic seed"
                        className="px-2 py-0.5 rounded-[2px] bg-[#1d140d] hover:bg-[#2c1e13] border border-[#6e4e2c]/80 hover:border-[#d4af37] text-[9px] font-mono font-bold uppercase tracking-[0.14em] text-[#e5c994] hover:text-white cursor-pointer transition-colors"
                      >
                        Roll
                      </button>
                      {runSeedInput && (
                        <button
                          type="button"
                          onClick={() => setRunSeedInput('')}
                          title="Clear custom seed"
                          className="px-1.5 py-0.5 rounded-[2px] text-[9px] text-[#9c8162] hover:text-[#f0dab2] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    <span
                      title="Seal the Bone Lord with all 6 Lineages to unlock custom Run Seeds."
                      className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#8d7253]/85"
                    >
                      Seeds Locked ({clearedCount}/6)
                    </span>
                  )}

                  <div className="hidden sm:block h-3.5 w-px bg-[#3c291b]" />

                  {vowsUnlocked ? (
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <span className="text-[9px] uppercase tracking-[0.22em] text-red-400/90 font-bold mr-0.5">
                        Vows
                      </span>
                      {RITUAL_VOWS.map(vow => {
                        const isActive = activeVows.includes(vow.id);
                        return (
                          <button
                            key={vow.id}
                            type="button"
                            onClick={() => toggleRitualVow(vow.id)}
                            title={`${vow.name}: ${vow.desc}`}
                            className={`px-2 py-0.5 rounded-[2px] border text-[9px] font-mono font-bold uppercase tracking-[0.12em] cursor-pointer transition-all ${
                              isActive
                                ? 'bg-[#36100d] border-red-400/90 text-red-100 shadow-[0_0_10px_rgba(220,38,38,0.45)]'
                                : 'bg-[#140d09] border-[#453020] text-[#b89d79] hover:border-[#9e7342] hover:text-[#f0dab2]'
                            }`}
                          >
                            {isActive ? '✦ ' : ''}{vow.shortTag}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span
                      title="Defeat the Bone Lord once to unbind optional Ritual Vows."
                      className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#8d7253]/85"
                    >
                      Vows Sealed
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          {/* 3x2 Recessed Altar Plaques */}
          <div className="relative z-10 flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-x-5 gap-y-3 w-full max-w-[1220px] my-2">
            {[
              { id: 'randomizer', name: 'Unformed', desc: 'Masochistic', cards: ["Trade Pelt", "Trade Pelt", "Geck"] },
              { id: 'witchcraft', name: 'Taiga', desc: 'Reliable', cards: ["Mole", "Moose Buck", "Black Goat"] },
              { id: 'infestation', name: 'Colony', desc: 'Wretched', cards: ["Silkworm", "Flying Ant", "Ant Queen"] },
              { id: 'skeleton', name: 'Scavengers', desc: 'Ravenous', cards: ["Warren", "Red Stray", "Dire Wolf Pup"] },
              { id: 'eldritch', name: 'Eldritch', desc: 'Ordained', cards: ["Tadpole", "Mantis", "Raven"] },
              { id: 'paleozoic', name: 'Paleozoic', desc: 'Deceitful', cards: ["Hyphae", "Mud Turtle", "Great White"] }
            ].map(d => (
              <div
                key={d.id}
                onClick={() => handleSelectLineage(d.id)}
                className="relative min-h-0 flex flex-col items-center justify-between group px-3 pt-2 pb-2.5 rounded-[3px] bg-[#0d0907]/76 hover:bg-[#150e0a]/90 border border-[#3a2a1d]/85 hover:border-[#c69853]/75 shadow-[0_14px_30px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,228,185,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.92),0_0_24px_rgba(212,175,55,0.14),inset_0_1px_0_rgba(255,228,185,0.14)] backdrop-blur-[2px] transition-all duration-300 cursor-pointer select-none overflow-hidden"
              >
                {/* Engraved Corner Brackets */}
                <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#7a5b39]/60 group-hover:border-[#e3bc73]/90 transition-colors" />
                <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#7a5b39]/60 group-hover:border-[#e3bc73]/90 transition-colors" />
                <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#7a5b39]/60 group-hover:border-[#e3bc73]/90 transition-colors" />
                <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#7a5b39]/60 group-hover:border-[#e3bc73]/90 transition-colors" />

                {/* Warm Candlelit Hover Halo Behind Cards */}
                <div className="pointer-events-none absolute top-2 inset-x-6 h-32 rounded-full bg-[radial-gradient(circle,rgba(217,156,64,0.18)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* 3-Card Handheld Spread */}
                <div className="relative flex-1 min-h-0 flex items-center justify-center w-full">
                  {d.cards.map((cName, cIdx) => {
                    const fanTransforms = [
                      'rotate-[-4deg] -translate-x-[104px] group-hover:-translate-x-[112px] group-hover:rotate-[-6deg] z-0',
                      'rotate-[0deg] -translate-y-1.5 group-hover:-translate-y-2.5 z-10',
                      'rotate-[4deg] translate-x-[104px] group-hover:translate-x-[112px] group-hover:rotate-[6deg] z-20'
                    ];
                    return (
                      <div
                        key={`${cName}-${cIdx}`}
                        className={`absolute transform scale-[0.86] origin-center transition-all duration-300 ease-out group-hover:scale-[0.9] drop-shadow-[0_10px_16px_rgba(0,0,0,0.88)] ${fanTransforms[cIdx] || ''}`}
                      >
                        {renderCard(ALL_CARD_LOOKUP[cName] || MAIN_DECK_POOL[0], { showCost: true })}
                      </div>
                    );
                  })}
                </div>

                {/* Engraved Hairline Divider */}
                <div className="shrink-0 w-4/5 h-px bg-gradient-to-r from-transparent via-[#5e442c]/75 to-transparent group-hover:via-[#c69853]/80 transition-colors my-1" />

                {/* Lineage Plaque Label & Tactile Start Plate */}
                <div className="shrink-0 flex flex-col items-center text-center w-full">
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="text-sm font-['Cinzel',_serif] font-bold text-[#ecd4a6] uppercase tracking-[0.2em] group-hover:text-[#fff4dc] transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                      {d.name}
                    </h2>
                    <span className="text-[9px] font-mono text-[#b98e57]/75 group-hover:text-[#d8b177] tracking-[0.2em] uppercase transition-colors">
                      {d.desc}
                    </span>
                  </div>
                  <div className="mt-1 px-5 py-0.5 rounded-[2px] border border-[#4a3524]/90 bg-[#17110d]/95 group-hover:bg-[#2a1c12] group-hover:border-[#cfa159]/85 shadow-[0_2px_0_#070504,inset_0_1px_0_rgba(255,235,200,0.06)] transition-all duration-200">
                    <span className="font-['Cinzel',_serif] text-[10px] font-bold uppercase tracking-[0.26em] text-[#cbb084] group-hover:text-[#fff2d6] transition-colors">
                      ◆ Start ◆
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  );
}
