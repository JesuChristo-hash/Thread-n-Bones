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
  const [showVowsModal, setShowVowsModal] = React.useState(false);

  const BASE = import.meta.env.BASE_URL || './';
  const woodBg = `url("${BASE}assets/text/wood.jpg")`;
  const slateBg = `url("${BASE}assets/text/slate.jpg")`;
  const clothBg = `url("${BASE}assets/text/cloth.jpg")`;

  const ALL_LINEAGE_IDS = ['randomizer', 'witchcraft', 'infestation', 'skeleton', 'eldritch', 'paleozoic'];
  const clearedCount = ALL_LINEAGE_IDS.filter((id) => (archive.clearedLineages || []).includes(id)).length;
  const seedsUnlocked = clearedCount >= ALL_LINEAGE_IDS.length;
  const vowsUnlocked = (archive.runsWon || 0) > 0 || (archive.defeatedBosses || []).includes('BoneLord');

  const totalScoreBonus = RITUAL_VOWS.reduce(
    (sum: number, v: any) => (activeVows.includes(v.id) ? sum + (v.scoreBonus || 0) : sum),
    0
  );

  const threatRank =
    activeVows.length === 0
      ? { label: 'UNBOUND', cls: 'text-stone-400' }
      : activeVows.length === 1
        ? { label: 'TEMPERED', cls: 'text-[#e5c16b]' }
        : activeVows.length === 2
          ? { label: 'BLOOD-SWORN', cls: 'text-amber-300' }
          : activeVows.length === 3
            ? { label: 'HARROWED', cls: 'text-red-300' }
            : { label: 'DAMNED', cls: 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.65)]' };

  React.useEffect(() => {
    if (!showVowsModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowVowsModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [showVowsModal]);

  const knob =
    'radial-gradient(circle at 46% 42%, #d4af6a 0 1.8px, #876128 2.4px, #36220f 4.4px, #110904 5.4px, transparent 6.5px)';
  const vowModalFrameStyle: React.CSSProperties = {
    position: 'relative',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: '16px 12px 12px 12px',
    boxShadow:
      '0 0 0 1px #190e08, 0 0 0 2px #52361c, 0 28px 70px rgba(0,0,0,0.97), inset 0 1px 0 rgba(224,184,120,0.2)',
    backgroundColor: '#24160e',
    backgroundImage: [
      knob,
      knob,
      knob,
      knob,
      'radial-gradient(ellipse at 50% 0%, #5e0d10 0%, #3a0709 54%, #180304 100%)',
      'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
      woodBg,
    ].join(', '),
    backgroundSize: ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'auto', '140px 140px'].join(', '),
    backgroundPosition: 'left top, right top, left bottom, right bottom, 0 0, 0 0, center',
    backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
    backgroundOrigin: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
    backgroundClip: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
  };

  const renderVowSigil = (vowId: string, active: boolean) => {
    const stroke = active ? '#fde68a' : '#a88458';
    const accent = active ? 'rgba(220, 38, 38, 0.35)' : 'rgba(120, 53, 15, 0.16)';
    switch (vowId) {
      case 'weathered_tablet':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 8 H28 L31 12 V32 H9 V10 Z" fill={accent} />
            <path d="M17 16 C17 13.5, 23 13.5, 23 16.5 C23 19, 20 19.5, 20 22" />
            <circle cx="20" cy="26" r="1" fill={stroke} />
          </svg>
        );
      case 'no_safe_campfire':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 C23 12, 28 15, 27 22 C26 27, 22 30, 20 30 C17 30, 13 26, 14 21 C15 17, 18 14, 17 11 C19 12, 20 9, 20 6 Z" fill={accent} />
            <path d="M11 33 L29 29 M11 29 L29 33" />
          </svg>
        );
      case 'forced_hand':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="20" cy="31" r="2.5" fill={accent} />
            <circle cx="20" cy="20" r="2.5" fill={accent} />
            <circle cx="20" cy="9" r="2.5" fill={accent} />
            <path d="M20 28.5 V22.5 M20 17.5 V11.5" />
            <path d="M10 25 L14 21 M14 25 L10 21 M26 15 L30 11 M30 15 L26 11" stroke="#ef4444" strokeWidth="1.4" />
          </svg>
        );
      case 'thinner_draft':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="11" y="7" width="18" height="26" rx="1.5" fill={accent} />
            <path d="M10 15 L30 25 M26 11 L14 29" stroke="#ef4444" strokeWidth="1.6" />
          </svg>
        );
      case 'heavier_scale_debt':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7 V33 M14 33 H26" />
            <path d="M9 17 L31 12" />
            <path d="M9 17 L6 24 H12 Z" fill={accent} />
            <path d="M31 12 L28 19 H34 Z" />
          </svg>
        );
      case 'empty_satchel':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16 H28 L30 31 H10 Z" fill={accent} />
            <path d="M15 16 V12 C15 9.5, 25 9.5, 25 12 V16" />
            <path d="M15 21 L25 27 M25 21 L15 27" stroke="#ef4444" strokeWidth="1.5" />
          </svg>
        );
      case 'swarming_dark':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="14" cy="17" r="2.2" fill={stroke} />
            <circle cx="26" cy="17" r="2.2" fill={stroke} />
            <circle cx="20" cy="23" r="2.4" fill="#ef4444" stroke="#ef4444" />
            <path d="M9 12 L15 14 M31 12 L25 14 M15 28 L25 28" />
          </svg>
        );
      case 'blood_famine':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 8 C25 16, 28 20, 28 24.5 C28 29, 24.4 32, 20 32 C15.6 32, 12 29, 12 24.5 C12 20, 15 16, 20 8 Z" fill={accent} />
            <path d="M16 18 L22 23 L18 28" stroke="#ef4444" strokeWidth="1.6" />
          </svg>
        );
      case 'too_fast_too_soon':
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 11 L13 29 M17 10 L19 30 M24 10 L22 30 M30 11 L27 29" stroke="#ef4444" strokeWidth="2" />
            <path d="M8 18 L32 22" />
          </svg>
        );
      case 'all_elite_row2':
      default:
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 10 C10 14, 12 18, 15 19 M28 10 C30 14, 28 18, 25 19" />
            <circle cx="20" cy="21" r="7" fill={accent} />
            <circle cx="17.5" cy="20" r="1.1" fill={stroke} />
            <circle cx="22.5" cy="20" r="1.1" fill={stroke} />
            <path d="M17 28 V32 M20 28 V33 M23 28 V32" />
          </svg>
        );
    }
  };

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

        {/* Carved Slate Seed & Ritual Vows Trigger Bar */}
        <div
          className="relative mt-2 flex flex-wrap items-center justify-center gap-3 px-4 py-1.5 rounded-[2px] border border-[#3a1617] shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden"
          style={{ backgroundColor: '#120708' }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply bg-cover bg-center"
            style={{ backgroundImage: slateBg }}
          />
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
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
              <button
                type="button"
                onClick={() => {
                  triggerSfx('draw');
                  setShowVowsModal(true);
                }}
                className={`group flex items-center gap-2 px-3 py-0.5 rounded-[2px] border transition-all cursor-pointer ${
                  activeVows.length > 0
                    ? 'bg-gradient-to-r from-[#2e090c] via-[#410c10] to-[#2e090c] border-[#c99649]/85 hover:border-[#f3d184] text-[#f7e7c8] shadow-[0_0_16px_rgba(220,38,38,0.35)]'
                    : 'bg-[#19090a] hover:bg-[#280d10] border-[#5c2324] hover:border-[#b88b46] text-[#dfd0bc] hover:text-white'
                }`}
              >
                <span className="font-['Cinzel',_serif] font-bold text-[10px] uppercase tracking-[0.22em]">
                  Ritual Vows
                </span>
                <span className="flex items-center gap-1">
                  {RITUAL_VOWS.map((v: any) => {
                    const sworn = activeVows.includes(v.id);
                    return (
                      <span
                        key={v.id}
                        className={`w-1.5 h-1.5 rotate-45 border transition-all ${
                          sworn
                            ? 'bg-red-500 border-[#f4d78b] shadow-[0_0_6px_rgba(239,68,68,0.9)]'
                            : 'bg-transparent border-stone-600/80'
                        }`}
                      />
                    );
                  })}
                </span>
                {activeVows.length > 0 ? (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.14em] text-[#f4d78b]">
                    {activeVows.length}/{RITUAL_VOWS.length} · +{totalScoreBonus} PTS
                  </span>
                ) : (
                  <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-stone-400 group-hover:text-[#e5cfa8]">
                    Unbound
                  </span>
                )}
              </button>
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
                  background:
                    'radial-gradient(ellipse at 50% 35%, rgba(36,7,9,0.68) 0%, rgba(18,4,5,0.74) 58%, rgba(10,3,4,0.82) 100%)',
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

      {/* =========================================================================
          DIEGETIC RITUAL VOWS MODAL (CARVED TIMBER, BRASS RIVETS & CRIMSON CLOTH)
         ========================================================================= */}
      {showVowsModal && vowsUnlocked && (
        <div
          onClick={() => setShowVowsModal(false)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 font-mono select-none animate-menu-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={vowModalFrameStyle}
            className="w-full max-w-5xl max-h-full flex flex-col rounded-[2px] bg-[#180304] relative overflow-hidden"
          >
            {/* Crimson Cloth Weave */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-multiply"
              style={{
                backgroundImage: clothBg,
                backgroundSize: '170px 170px',
                backgroundRepeat: 'repeat',
              }}
            />
            {/* Recessed Well Shadow, Stitched Seam & Tarnished-Brass Corner Brackets */}
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

            <div className="relative z-10 flex flex-col px-6 py-5 sm:px-8 sm:py-6 overflow-y-auto">
              {/* Engraved Header + Live Oath Stakes Plaque */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#5e241c]/85 pb-4 mb-5">
                <div className="text-left">
                  <div className="text-[9.5px] font-['Cinzel',_serif] uppercase tracking-[0.28em] text-[#c7a97b]/85">
                    Covenant of Pain
                  </div>
                  <h2 className="text-xl sm:text-2xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.22em] text-[#f3e4c8] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                    Ritual Vows
                  </h2>
                  <p className="text-[11px] text-[#d6c2a5]/85 mt-0.5">
                    Bind additional curses to your descent to elevate final ledger judgment.
                  </p>
                </div>

                {/* Live Oath Stakes Readout */}
                <div className="shrink-0 flex items-center gap-3.5 px-4 py-2.5 rounded-[2px] bg-[#100405]/90 border border-[#6e4626]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)]">
                  <div className="text-left">
                    <div className="text-[8.5px] uppercase tracking-[0.22em] text-stone-400">Oath State</div>
                    <div className={`font-['Cinzel',_serif] text-xs font-bold uppercase tracking-[0.18em] ${threatRank.cls}`}>
                      {threatRank.label} ({activeVows.length}/{RITUAL_VOWS.length})
                    </div>
                  </div>
                  <div className="h-7 w-px bg-[#4a261b]" />
                  <div className="text-right">
                    <div className="text-[8.5px] uppercase tracking-[0.22em] text-stone-400">Ledger Stakes</div>
                    <div className="font-['Cinzel',_serif] text-sm font-black tracking-[0.14em] text-[#f3d184]">
                      +{totalScoreBonus} PTS
                    </div>
                  </div>
                </div>
              </div>

              {/* 2x2 Grid of Carved Vow Tablets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                {RITUAL_VOWS.map((vow: any) => {
                  const isActive = activeVows.includes(vow.id);
                  return (
                    <button
                      key={vow.id}
                      type="button"
                      onClick={() => toggleRitualVow(vow.id)}
                      className={`group relative flex items-start gap-3.5 p-4 rounded-[2px] border text-left transition-all duration-150 cursor-pointer overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-br from-[#2d090b]/95 via-[#1f0608]/95 to-[#120304]/98 border-[#d4af37]/90 shadow-[0_0_24px_rgba(220,38,38,0.28),inset_0_1px_0_rgba(255,224,178,0.12)] -translate-y-0.5'
                          : 'bg-[#110506]/88 hover:bg-[#1a0709]/92 border-[#47211d]/85 hover:border-[#9e7740]/85 shadow-[inset_0_2px_10px_rgba(0,0,0,0.85)]'
                      }`}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply bg-cover bg-center"
                        style={{ backgroundImage: slateBg }}
                      />

                      {/* Occult Sigil Medallion */}
                      <div
                        className={`relative z-10 shrink-0 w-12 h-12 rounded-[2px] border flex flex-col items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[#26080a] border-[#e5c16b]/85 shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                            : 'bg-[#0b0405] border-[#3d201c] group-hover:border-[#7d5c34]'
                        }`}
                      >
                        {renderVowSigil(vow.id, isActive)}
                      </div>

                      {/* Vow Copy & Score Stake Badge */}
                      <div className="relative z-10 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[9.5px] font-['Cinzel',_serif] font-bold text-[#c79d5a]">
                              {vow.numeral}.
                            </span>
                            <span
                              className={`font-['Cinzel',_serif] text-sm font-bold uppercase tracking-[0.15em] truncate ${
                                isActive ? 'text-[#fff1d0]' : 'text-[#e5d2b5] group-hover:text-white'
                              }`}
                            >
                              {vow.name}
                            </span>
                          </div>

                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-[1px] border text-[9.5px] font-mono font-bold uppercase tracking-[0.14em] ${
                              isActive
                                ? 'bg-[#361d09] border-[#e5c16b] text-[#fde68a]'
                                : 'bg-[#160a08] border-[#4d3320] text-[#c7a56e]'
                            }`}
                          >
                            +{vow.scoreBonus} PTS
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono font-bold uppercase tracking-[0.18em] ${
                              isActive ? 'text-red-400' : 'text-red-400/70'
                            }`}
                          >
                            {vow.shortTag}
                          </span>
                          <span className="text-stone-600">•</span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase tracking-[0.18em] ${
                              isActive ? 'text-emerald-300' : 'text-stone-500'
                            }`}
                          >
                            {isActive ? '◆ SWORN' : 'UNSWORN'}
                          </span>
                        </div>

                        <p className="mt-1.5 text-[11px] font-mono text-[#cbb89e]/90 leading-relaxed">
                          {vow.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#5e241c]/85 pt-4">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={activeVows.length === 0}
                    onClick={() => {
                      RITUAL_VOWS.forEach((v: any) => {
                        if (activeVows.includes(v.id)) toggleRitualVow(v.id);
                      });
                    }}
                    className="px-3.5 py-2 rounded-[2px] bg-[#160708] hover:bg-[#240b0d] disabled:opacity-35 border border-[#4f1d1b] hover:border-red-700/80 text-[10px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.18em] text-red-300/90 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Sever All
                  </button>
                  <button
                    type="button"
                    disabled={activeVows.length >= RITUAL_VOWS.length}
                    onClick={() => {
                      RITUAL_VOWS.forEach((v: any) => {
                        if (!activeVows.includes(v.id)) toggleRitualVow(v.id);
                      });
                    }}
                    className="px-3.5 py-2 rounded-[2px] bg-[#1a0d08] hover:bg-[#2a160c] disabled:opacity-35 border border-[#6e4b28] hover:border-[#d4af37] text-[10px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.18em] text-[#e5cfa8] cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Swear All
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerSfx('draw');
                    setShowVowsModal(false);
                  }}
                  className="px-7 py-2 rounded-[2px] bg-[#240b0d] hover:bg-[#331013] active:bg-[#170708] border border-[#9e7736]/90 hover:border-[#e5c16b] rounded-[2px] shadow-[0_2px_0_#090304,inset_0_1px_0_rgba(241,213,143,0.14)] active:translate-y-[1px] font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] text-[#f5e3c3] hover:text-white cursor-pointer transition-all"
                >
                  Seal Oaths
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
