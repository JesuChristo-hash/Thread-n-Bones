import React from 'react';
import { ALL_CARD_LOOKUP, MAIN_DECK_POOL } from '../data/gameData';

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
  triggerSfx,
}: DeckSelectScreenProps) {
  const BASE = import.meta.env.BASE_URL || './';
  const woodBg = `url("${BASE}assets/text/wood.jpg")`;
  const slateBg = `url("${BASE}assets/text/slate.jpg")`;
  const clothBg = `url("${BASE}assets/text/cloth.jpg")`;

  const ALL_LINEAGE_IDS = ['randomizer', 'witchcraft', 'infestation', 'skeleton', 'eldritch', 'paleozoic'];
  const clearedCount = ALL_LINEAGE_IDS.filter((id) => (archive.clearedLineages || []).includes(id)).length;
  const seedsUnlocked = clearedCount >= ALL_LINEAGE_IDS.length;
  const vowsUnlocked = (archive.runsWon || 0) > 0 || (archive.defeatedBosses || []).includes('BoneLord');

  const lineages = [
    { id: 'randomizer', name: 'Unformed', desc: 'Masochistic', cards: ['Trade Pelt', 'Trade Pelt', 'Geck'] },
    { id: 'witchcraft', name: 'Taiga', desc: 'Reliable', cards: ['Mole', 'Moose Buck', 'Black Goat'] },
    { id: 'infestation', name: 'Colony', desc: 'Wretched', cards: ['Silkworm', 'Flying Ant', 'Ant Queen'] },
    { id: 'skeleton', name: 'Scavengers', desc: 'Ravenous', cards: ['Warren', 'Red Stray', 'Dire Wolf Pup'] },
    { id: 'eldritch', name: 'Eldritch', desc: 'Ordained', cards: ['Tadpole', 'Mantis', 'Raven'] },
    { id: 'paleozoic', name: 'Paleozoic', desc: 'Deceitful', cards: ['Hyphae', 'Mud Turtle', 'Great White'] },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-between px-4 sm:px-8 py-3.5 overflow-hidden animate-fade-up font-mono select-none bg-[#090304]"
      style={getScreenBgStyle('deck-selection.jpg')}
    >
      {/* Deep Crimson & Vignette Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,4,5,0.10)_0%,rgba(6,2,3,0.66)_100%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.22)_0%,transparent_58%)] pointer-events-none z-0" />

      {/* Engraved Ritual Header */}
      <div className="relative z-10 flex flex-col items-center text-center shrink-0 w-full max-w-[1220px]">
        <div className="flex items-center gap-4">
          <div className="h-px w-14 sm:w-28 bg-gradient-to-r from-transparent via-[#7f1d1d]/80 to-[#dc2626]/70" />
          <h1
            className="text-xl sm:text-2xl font-['Cinzel',_serif] font-black uppercase tracking-[0.3em] text-[#ede3d2]"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.98), 0 0 18px rgba(153,27,27,0.5)' }}
          >
            Choose Your Lineage
          </h1>
          <div className="h-px w-14 sm:w-28 bg-gradient-to-l from-transparent via-[#7f1d1d]/80 to-[#dc2626]/70" />
        </div>

        {/* Carved Slate Seed & Vows Bar */}
        <div
          className="relative mt-2 flex flex-wrap items-center justify-center gap-2.5 px-4 py-1.5 rounded-[2px] border border-[#3a1617] shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden"
          style={{ backgroundColor: '#120708' }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply bg-cover bg-center"
            style={{ backgroundImage: slateBg }}
          />
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5">
            {seedsUnlocked ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.24em] text-red-400/90 font-bold">Seed</span>
                <input
                  type="text"
                  value={runSeedInput}
                  onChange={(e) => setRunSeedInput(normalizeSeed(e.target.value))}
                  placeholder="RANDOM"
                  maxLength={14}
                  aria-label="Run Seed"
                  className="w-28 px-2 py-0.5 rounded-[1px] bg-[#0b0405] border border-[#4a1a1c] focus:border-red-500 outline-none text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#f3e8d8] placeholder:text-stone-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRunSeedInput(generateRandomSeed());
                    triggerSfx('draw');
                  }}
                  title="Roll a fresh deterministic seed"
                  className="px-2 py-0.5 rounded-[1px] bg-[#1a090a] hover:bg-[#2c0e10] border border-[#5c1f22] hover:border-red-500/80 text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-[#e7d6c1] hover:text-white cursor-pointer transition-colors"
                >
                  Roll
                </button>
                {runSeedInput && (
                  <button
                    type="button"
                    onClick={() => setRunSeedInput('')}
                    title="Clear custom seed"
                    className="px-1.5 py-0.5 text-[9px] text-stone-500 hover:text-red-300 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              <span
                title="Seal the Bone Lord with all 6 Lineages to unlock custom Run Seeds."
                className="text-[9px] font-mono uppercase tracking-[0.18em] text-stone-500"
              >
                Seeds Locked ({clearedCount}/6)
              </span>
            )}

            <div className="hidden sm:block h-3.5 w-px bg-[#3a1617]" />

            {vowsUnlocked ? (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.24em] text-red-500 font-bold mr-0.5">Vows</span>
                {RITUAL_VOWS.map((vow) => {
                  const isActive = activeVows.includes(vow.id);
                  return (
                    <button
                      key={vow.id}
                      type="button"
                      onClick={() => toggleRitualVow(vow.id)}
                      title={`${vow.name}: ${vow.desc}`}
                      className={`px-2 py-0.5 rounded-[1px] border text-[9px] font-mono font-bold uppercase tracking-[0.14em] cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#450a0c] border-red-500 text-red-100 shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                          : 'bg-[#0e0607] border-[#3a1719] text-stone-400 hover:border-red-700/80 hover:text-[#f0e2cf]'
                      }`}
                    >
                      {isActive ? '◆ ' : ''}
                      {vow.shortTag}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span
                title="Defeat the Bone Lord once to unbind optional Ritual Vows."
                className="text-[9px] font-mono uppercase tracking-[0.18em] text-stone-500"
              >
                Vows Sealed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3x2 Dark-Timber Framed Altar Plaques */}
      <div className="relative z-10 flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-x-5 gap-y-3.5 w-full max-w-[1220px] my-2.5">
        {lineages.map((d) => {
          const isCleared = (archive.clearedLineages || []).includes(d.id);
          return (
            <div
              key={d.id}
              onClick={() => handleSelectLineage(d.id)}
              className="relative min-h-0 p-[4px] rounded-[2px] group cursor-pointer select-none shadow-[0_16px_34px_rgba(0,0,0,0.92)] transition-all duration-300"
              style={{
                backgroundImage: woodBg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Darken wood frame so it reads as aged timber */}
              <div className="pointer-events-none absolute inset-0 rounded-[2px] bg-[#0b0605]/55 border border-[#2a1514] group-hover:border-red-700/80 transition-colors duration-300" />

              {/* Inner Slate & Crimson Cloth Well */}
              <div
                className="relative w-full h-full min-h-0 flex flex-col items-center justify-between px-3 pt-2 pb-2.5 rounded-[1px] overflow-hidden border border-[#2c1213] group-hover:border-red-800/75 backdrop-blur-[1px] transition-colors duration-300"
                style={{
                  background: 'radial-gradient(ellipse at 50% 35%, rgba(36,7,9,0.68) 0%, rgba(18,4,5,0.74) 58%, rgba(10,3,4,0.82) 100%)',
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply bg-cover bg-center"
                  style={{ backgroundImage: clothBg }}
                />

                {/* Recessed Corner Hairlines */}
                <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#5c1f22]/75 group-hover:border-red-500/90 transition-colors" />
                <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#5c1f22]/75 group-hover:border-red-500/90 transition-colors" />
                <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#5c1f22]/75 group-hover:border-red-500/90 transition-colors" />
                <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#5c1f22]/75 group-hover:border-red-500/90 transition-colors" />

                {/* Crimson Hover Halo Behind Cards */}
                <div className="pointer-events-none absolute top-3 inset-x-8 h-32 rounded-full bg-[radial-gradient(circle,rgba(185,28,28,0.28)_0%,transparent_72%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Cleared Seal Mark */}
                {isCleared && (
                  <span
                    title="Lineage Sealed"
                    className="pointer-events-none absolute top-2 right-2.5 z-30 text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-red-400/90 drop-shadow-[0_0_6px_rgba(239,68,68,0.75)]"
                  >
                    ✦ SEALED
                  </span>
                )}

                {/* 3-Card Handheld Spread */}
                <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center w-full">
                  {d.cards.map((cName, cIdx) => {
                    const fanTransforms = [
                      'rotate-[-4deg] -translate-x-[104px] group-hover:-translate-x-[112px] group-hover:rotate-[-6deg] z-0',
                      'rotate-[0deg] -translate-y-1.5 group-hover:-translate-y-2.5 z-10',
                      'rotate-[4deg] translate-x-[104px] group-hover:translate-x-[112px] group-hover:rotate-[6deg] z-20',
                    ];
                    return (
                      <div
                        key={`${cName}-${cIdx}`}
                        className={`absolute transform scale-[0.86] origin-center transition-all duration-300 ease-out group-hover:scale-[0.9] drop-shadow-[0_12px_18px_rgba(0,0,0,0.92)] ${
                          fanTransforms[cIdx] || ''
                        }`}
                      >
                        {renderCard(ALL_CARD_LOOKUP[cName] || MAIN_DECK_POOL[0], { showCost: true })}
                      </div>
                    );
                  })}
                </div>

                {/* Engraved Crimson Divider */}
                <div className="relative z-10 shrink-0 w-4/5 h-px bg-gradient-to-r from-transparent via-[#6b1417]/80 to-transparent group-hover:via-red-500/85 transition-colors my-1" />

                {/* Lineage Title & Diegetic Prompt */}
                <div className="relative z-10 shrink-0 flex flex-col items-center text-center w-full">
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="text-sm font-['Cinzel',_serif] font-bold text-[#efe5d5] uppercase tracking-[0.22em] group-hover:text-white transition-colors drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)]">
                      {d.name}
                    </h2>
                    <span className="text-[9px] font-mono text-red-400/75 group-hover:text-red-300 tracking-[0.2em] uppercase transition-colors">
                      {d.desc}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.26em] text-stone-400 group-hover:text-red-400 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.75)]">
                    [ BEGIN ]
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
