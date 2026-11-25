import React, { useState, useMemo, useEffect } from 'react';
import { X, BookOpen, Award, Search } from 'lucide-react';
import {
  ALL_CARD_LOOKUP,
  SIGIL_DESCRIPTIONS,
  SIGIL_MAPPING,
  TRIBE_ICONS,
  getCardArtUrl,
  getSigilArtUrl,
  type Tribe,
} from '../data/gameData';
import { type PersistentArchive } from '../data/archive';

interface ArchiveModalProps {
  initialTab: 'COMPENDIUM' | 'LEDGER';
  archive: PersistentArchive;
  onClose: () => void;
}

const EXCLUDED_COMPENDIUM_CARDS = new Set([
  'Void',
  'BLOOD MOON',
  'Felled Tree',
  'Boulder',
  'Stone Wall',
  'Gold Nugget',
  'Flaming Skeleton',
  'Reaper',
  'Skeleton Canine',
]);

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  initialTab,
  archive,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'COMPENDIUM' | 'LEDGER'>(initialTab);
  const [subTab, setSubTab] = useState<'CARDS' | 'SIGILS'>('CARDS');
  const [tribeFilter, setTribeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLedgerSeed, setCopiedLedgerSeed] = useState<boolean>(false);

  const seenCardSet = useMemo(() => new Set(archive.seenCards), [archive.seenCards]);
  const seenSigilSet = useMemo(() => new Set(archive.seenSigils), [archive.seenSigils]);

  const allCards = useMemo(() => {
    const list = Object.values(ALL_CARD_LOOKUP).filter(
      (c) => c && c.name && !EXCLUDED_COMPENDIUM_CARDS.has(c.name)
    );
    if (!list.some((c) => c.name === 'God Dam')) {
      list.push({
        name: 'God Dam',
        class: 'No Class',
        attack: 1,
        health: 4,
        emoji: '🏠',
        sigils: [],
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCards.filter((c) => {
      if (tribeFilter !== 'ALL' && c.class !== tribeFilter) return false;
      if (!q) return true;
      const isDiscovered = seenCardSet.has(c.name);
      if (!isDiscovered) return false;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.sigils || []).some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [allCards, tribeFilter, searchQuery, seenCardSet]);

  const allSigils = useMemo(() => {
    return Object.keys(SIGIL_DESCRIPTIONS).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredSigils = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allSigils;
    return allSigils.filter(
      (s) =>
        s.toLowerCase().includes(q) ||
        (SIGIL_DESCRIPTIONS[s] || '').toLowerCase().includes(q)
    );
  }, [allSigils, searchQuery]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const discoveredCardCount = allCards.filter((c) => seenCardSet.has(c.name)).length;
  const discoveredSigilCount = allSigils.filter((s) => seenSigilSet.has(s)).length;

  const baseUrl = import.meta.env.BASE_URL || './';
  const plaqueCls = 'bg-[#0f0d13]/85 border border-[#2d2833] rounded-[2px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.03)]';

  const isLedger = activeTab === 'LEDGER';
  const knob = isLedger
    ? 'radial-gradient(circle at 46% 42%, #8e8794 0 1.8px, #504b54 2.4px, #232026 4.4px, #0b090d 5.4px, transparent 6.5px)'
    : 'radial-gradient(circle at 46% 42%, #d4af6a 0 1.8px, #876128 2.4px, #36220f 4.4px, #110904 5.4px, transparent 6.5px)';
  const panelStyle: import('react').CSSProperties = {
    position: 'relative',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: '16px 12px 12px 12px',
    boxShadow: isLedger
      ? '0 0 0 1px #141112, 0 0 0 2px #3b2a1d, 0 26px 64px rgba(0,0,0,0.96), inset 0 1px 0 rgba(190,180,196,0.14)'
      : '0 0 0 1px #190e08, 0 0 0 2px #52361c, 0 26px 64px rgba(0,0,0,0.96), inset 0 1px 0 rgba(224,184,120,0.2)',
    backgroundColor: '#24160e',
    backgroundImage: isLedger
      ? [
          knob,
          knob,
          knob,
          knob,
          'radial-gradient(ellipse at 50% 0%, rgba(28,25,33,0.68) 0%, rgba(12,10,15,0.84) 65%, rgba(6,5,8,0.94) 100%)',
          `url("${baseUrl}assets/text/slate.jpg")`,
          'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
          `url("${baseUrl}assets/text/wood.jpg")`,
        ].join(', ')
      : [
          knob,
          knob,
          knob,
          knob,
          'radial-gradient(ellipse at 50% 0%, #5e0d10 0%, #3a0709 54%, #180304 100%)',
          'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
          `url("${baseUrl}assets/text/wood.jpg")`,
        ].join(', '),
    backgroundSize: isLedger
      ? ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'cover', 'auto', '140px 140px'].join(', ')
      : ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'auto', '140px 140px'].join(', '),
    backgroundPosition: 'left top, right top, left bottom, right bottom, 0 0, 0 0, 0 0, center',
    backgroundRepeat: isLedger
      ? ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', ')
      : ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
    backgroundOrigin: isLedger
      ? 'border-box, border-box, border-box, border-box, padding-box, padding-box, border-box, border-box'
      : 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
    backgroundClip: isLedger
      ? 'border-box, border-box, border-box, border-box, padding-box, padding-box, border-box, border-box'
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
              backgroundImage: `url("${baseUrl}assets/text/cloth.jpg")`,
              backgroundSize: '170px 170px',
              backgroundRepeat: 'repeat',
            }}
          />
        )}
        {/* ArchiveStitch & Recessed Well */}
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            boxShadow: isLedger
              ? 'inset 0 4px 16px rgba(0,0,0,0.94), inset 0 0 0 1px #0a090c, 0 0 0 1px rgba(138,129,145,0.2)'
              : 'inset 0 4px 14px rgba(0,0,0,0.92), inset 0 0 0 1px #140705, 0 0 0 1px rgba(184,138,68,0.24)',
          }}
        />
        <div
          className={`pointer-events-none absolute inset-[6px] z-30 border border-dashed ${
            isLedger ? 'border-[#7c7384]/25' : 'border-[#b98d46]/28'
          }`}
        />
        <div
          className={`pointer-events-none absolute top-[5px] left-[5px] w-3.5 h-3.5 z-30 border-t border-l ${
            isLedger ? 'border-[#8e8596]/45' : 'border-[#b8904a]/55'
          }`}
        />
        <div
          className={`pointer-events-none absolute top-[5px] right-[5px] w-3.5 h-3.5 z-30 border-t border-r ${
            isLedger ? 'border-[#8e8596]/45' : 'border-[#b8904a]/55'
          }`}
        />
        <div
          className={`pointer-events-none absolute bottom-[5px] left-[5px] w-3.5 h-3.5 z-30 border-b border-l ${
            isLedger ? 'border-[#8e8596]/45' : 'border-[#b8904a]/55'
          }`}
        />
        <div
          className={`pointer-events-none absolute bottom-[5px] right-[5px] w-3.5 h-3.5 z-30 border-b border-r ${
            isLedger ? 'border-[#8e8596]/45' : 'border-[#b8904a]/55'
          }`}
        />
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#342c27] bg-[#131015]/55">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('COMPENDIUM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors cursor-pointer ${
                activeTab === 'COMPENDIUM'
                  ? 'bg-[#1d1920] border-[#8f7960]/80 text-[#efe3cd] font-bold'
                  : 'bg-transparent border-transparent text-stone-400 hover:text-[#d6c2a5]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Compendium</span>
            </button>
            <button
              onClick={() => setActiveTab('LEDGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors cursor-pointer ${
                activeTab === 'LEDGER'
                  ? 'bg-[#1d1920] border-[#8f7960]/80 text-[#efe3cd] font-bold'
                  : 'bg-transparent border-transparent text-stone-400 hover:text-[#d6c2a5]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Ritual Ledger</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-[#efe3cd] border border-transparent hover:border-[#4a413b] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* COMPENDIUM TAB */}
        {activeTab === 'COMPENDIUM' && (
          <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
            {/* Sub-navigation & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#110f13]/50 border-b border-[#2c2629]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSubTab('CARDS')}
                  className={`px-2.5 py-1 text-[11px] uppercase tracking-wider border cursor-pointer ${
                    subTab === 'CARDS'
                      ? 'border-red-700/70 bg-red-950/40 text-red-200 font-bold'
                      : 'border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Beasts ({discoveredCardCount}/{allCards.length})
                </button>
                <button
                  onClick={() => setSubTab('SIGILS')}
                  className={`px-2.5 py-1 text-[11px] uppercase tracking-wider border cursor-pointer ${
                    subTab === 'SIGILS'
                      ? 'border-red-700/70 bg-red-950/40 text-red-200 font-bold'
                      : 'border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Sigils ({discoveredSigilCount}/{allSigils.length})
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                {subTab === 'CARDS' && (
                  <select
                    value={tribeFilter}
                    onChange={(e) => setTribeFilter(e.target.value)}
                    className="bg-[#161318] border border-[#3d3533] text-[#dfd2be] text-[11px] px-2 py-1 uppercase tracking-wider focus:outline-none"
                  >
                    <option value="ALL">All Tribes</option>
                    <option value="Canine">Canine</option>
                    <option value="Avian">Avian</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Insect">Insect</option>
                    <option value="Hooved">Hooved</option>
                    <option value="No Class">No Class</option>
                  </select>
                )}

                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3 h-3 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter..."
                    className="w-full bg-[#161318] border border-[#3d3533] text-stone-200 text-[11px] pl-7 pr-2 py-1 focus:outline-none focus:border-[#8f7960]"
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {subTab === 'CARDS' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredCards.map((card) => {
                    const discovered = seenCardSet.has(card.name);
                    return (
                      <div
                        key={card.name}
                        className={`border p-3 flex flex-col justify-between transition-colors ${
                          discovered
                            ? 'bg-[#141216] border-[#3a3330]'
                            : 'bg-[#0a090c] border-[#221f24] opacity-65'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <span
                              className={`text-xs font-bold tracking-wide truncate ${
                                discovered ? 'text-[#ede2ce]' : 'text-stone-600'
                              }`}
                            >
                              {discovered ? card.name : '???'}
                            </span>
                            {discovered && (
                              <span className="text-[10px] text-[#d6c2a5]/90 shrink-0">
                                {card.boneCost
                                  ? `${card.boneCost}🦴`
                                  : card.cost
                                    ? `${card.cost}🩸`
                                    : 'FREE'}
                              </span>
                            )}
                          </div>

                          <div className="h-16 flex items-center justify-center bg-black/40 border border-stone-900/80 mb-2 overflow-hidden">
                            {discovered ? (
                              <img
                                src={getCardArtUrl(card)}
                                alt={card.name}
                                className="h-14 w-14 object-contain [image-rendering:pixelated]"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-stone-700 text-lg font-bold">?</span>
                            )}
                          </div>
                        </div>

                        {discovered ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] border-t border-stone-800/80 pt-1.5">
                              <span className="text-red-400 font-bold">ATK {card.attack}</span>
                              <span className="text-stone-400 text-[10px]">
                                {TRIBE_ICONS[card.class as Tribe] || ''} {card.class}
                              </span>
                              <span className="text-emerald-400 font-bold">HP {card.health}</span>
                            </div>
                            {card.sigils && card.sigils.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {card.sigils.map((s) => (
                                  <span
                                    key={s}
                                    title={SIGIL_DESCRIPTIONS[s] || s}
                                    className="text-[9px] px-1.5 py-0.5 bg-[#1b171d] border border-[#4a413b]/80 text-[#dfd2be] truncate"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-stone-600 uppercase tracking-widest text-center pt-1">
                            Unseen Specimen
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSigils.map((sigil) => {
                    const discovered = seenSigilSet.has(sigil);
                    return (
                      <div
                        key={sigil}
                        className={`border p-3 flex items-start gap-3 ${
                          discovered
                            ? 'bg-[#141216] border-[#3a3330]'
                            : 'bg-[#0a090c] border-[#221f24] opacity-75'
                        }`}
                      >
                        <div className="w-10 h-10 shrink-0 bg-black/50 border border-stone-800 flex items-center justify-center">
                          <img
                            src={getSigilArtUrl(sigil)}
                            alt={sigil}
                            className="w-7 h-7 object-contain [image-rendering:pixelated] invert opacity-85"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-[#ede2ce] tracking-wide">
                              {sigil} {SIGIL_MAPPING[sigil] || ''}
                            </span>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                                discovered
                                  ? 'border-emerald-900/70 text-emerald-400/90 bg-emerald-950/30'
                                  : 'border-stone-800 text-stone-500'
                              }`}
                            >
                              {discovered ? 'Witnessed' : 'Unwitnessed'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-300/90 leading-relaxed">
                            {SIGIL_DESCRIPTIONS[sigil]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEDGER (LIFETIME RUN STATS) TAB */}
        {activeTab === 'LEDGER' && (
          <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-3 flex flex-col justify-center">
            <div className="text-center mb-2.5">
              <div className="flex items-center justify-center gap-3 mb-0.5">
                <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#7c7282]/50" />
                <span className="text-[9px] font-['Cinzel',_serif] text-[#a69a8a] uppercase tracking-[0.26em]">
                  A Monument to All Your Sins
                </span>
                <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#7c7282]/50" />
              </div>
              <h3 className="text-base sm:text-lg font-['Cinzel',_serif] font-bold uppercase tracking-[0.22em] text-[#efe3ce] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                Chronicle of Threads &amp; Bone
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl w-full mx-auto">
              {/* Peak Ritual Record: Highest Rank, Score & Seed */}
              <div className={`col-span-2 sm:col-span-3 ${plaqueCls} px-3 py-2 flex items-center justify-around text-center`}>
                <div>
                  <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.18em] mb-0.5">
                    Highest Rank
                  </div>
                  <div className={`text-xl font-['Cinzel',_serif] font-black ${archive.highestRankColor || 'text-stone-400'}`}>
                    {archive.highestRank || '—'}
                  </div>
                </div>
                <div className="h-7 w-px bg-[#2d2833]" />
                <div>
                  <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.18em] mb-0.5">
                    Highest Score
                  </div>
                  <div className="text-xl font-bold text-[#ede2ce]">
                    {archive.highestScore || 0}
                  </div>
                </div>
                <div className="h-7 w-px bg-[#2d2833]" />
                <div>
                  <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.18em] mb-0.5">
                    Record Seed
                  </div>
                  {archive.highestScoreSeed ? (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(archive.highestScoreSeed);
                        setCopiedLedgerSeed(true);
                        setTimeout(() => setCopiedLedgerSeed(false), 1600);
                      }}
                      title="Copy record seed"
                      className="text-xs font-mono font-bold tracking-widest text-[#d6c2a5] hover:text-white border border-[#3a3340] hover:border-[#786b82] bg-[#18151e] px-2.5 py-0.5 rounded-[2px] transition-colors cursor-pointer"
                    >
                      {copiedLedgerSeed ? 'COPIED ✓' : archive.highestScoreSeed}
                    </button>
                  ) : (
                    <div className="text-sm font-mono text-stone-500">—</div>
                  )}
                </div>
              </div>

              <div className={`${plaqueCls} px-3 py-2 text-center`}>
                <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.16em] mb-0.5">
                  Rituals Concluded
                </div>
                <div className="text-xl font-bold text-[#ede2ce]">
                  {archive.runsWon}{' '}
                  <span className="text-xs text-stone-500 font-normal">
                    / {archive.runsStarted}
                  </span>
                </div>
              </div>

              <div className={`${plaqueCls} px-3 py-2 text-center`}>
                <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.16em] mb-0.5">
                  Peak Blood / Turn
                </div>
                <div className="text-xl font-bold text-red-400">
                  {archive.highestOverkill} <span className="text-xs font-normal text-red-300/80">oz</span>
                </div>
              </div>

              <div className={`${plaqueCls} px-3 py-2 text-center`}>
                <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.16em] mb-0.5">
                  Horrors Slain
                </div>
                <div className="text-xl font-bold text-purple-300">
                  {archive.totalBossesDefeated}
                </div>
              </div>

              <div className={`${plaqueCls} px-3 py-2 text-center`}>
                <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.16em] mb-0.5">
                  Allies Sacrificed
                </div>
                <div className="text-xl font-bold text-red-300">
                  {archive.totalSacrifices}
                </div>
              </div>

              <div className={`${plaqueCls} px-3 py-2 text-center`}>
                <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.16em] mb-0.5">
                  Creatures Felled
                </div>
                <div className="text-xl font-bold text-stone-100">
                  {archive.totalEnemyKills}
                </div>
              </div>

              <div className={`${plaqueCls} px-3 py-2 text-center`}>
                <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.16em] mb-0.5">
                  Stages Traversed
                </div>
                <div className="text-xl font-bold text-[#d6c2a5]">
                  {archive.totalStagesCleared}
                </div>
              </div>

              <div className={`col-span-2 sm:col-span-3 ${plaqueCls} px-3 py-2 flex items-center justify-around text-center`}>
                <div>
                  <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.16em] mb-0.5">
                    Blood Extracted
                  </div>
                  <div className="text-lg font-bold text-[#ede2ce]">
                    {archive.totalScaleDealt}
                  </div>
                </div>
                <div className="h-7 w-px bg-[#2d2833]" />
                <div>
                  <div className="text-[9px] text-[#9b9086] uppercase tracking-[0.16em] mb-0.5">
                    Blood Lost
                  </div>
                  <div className="text-lg font-bold text-red-400">
                    {archive.totalScaleTaken}
                  </div>
                </div>
              </div>

              {/* Lineages Proven Trophy Shelf */}
              <div className={`col-span-2 sm:col-span-3 ${plaqueCls} px-3 py-2`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-['Cinzel',_serif] font-bold text-[#b8ab9e] uppercase tracking-[0.2em]">
                    Lineages Proven
                  </span>
                  <span className="text-[10px] font-bold text-[#cbb698]/90">
                    {
                      [
                        { id: 'randomizer', label: 'Unformed' },
                        { id: 'witchcraft', label: 'Taiga' },
                        { id: 'infestation', label: 'Colony' },
                        { id: 'skeleton', label: 'Scavengers' },
                        { id: 'eldritch', label: 'Eldritch' },
                        { id: 'paleozoic', label: 'Paleozoic' },
                      ].filter((l) => archive.clearedLineages.includes(l.id)).length
                    }
                    /6
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { id: 'randomizer', label: 'Unformed' },
                    { id: 'witchcraft', label: 'Taiga' },
                    { id: 'infestation', label: 'Colony' },
                    { id: 'skeleton', label: 'Scavengers' },
                    { id: 'eldritch', label: 'Eldritch' },
                    { id: 'paleozoic', label: 'Paleozoic' },
                  ].map((lin) => {
                    const proven = archive.clearedLineages.includes(lin.id);
                    return (
                      <div
                        key={lin.id}
                        className={`px-1.5 py-1.5 rounded-[2px] border text-center transition-colors ${
                          proven
                            ? 'bg-[#131d19] border-emerald-700/75 text-emerald-200 shadow-[inset_0_1px_0_rgba(52,211,153,0.12)]'
                            : 'bg-[#09080c]/90 border-[#211e26] text-stone-600'
                        }`}
                      >
                        <div className="text-[10px] font-['Cinzel',_serif] font-bold tracking-wide truncate">
                          {lin.label}
                        </div>
                        <div className={`text-[8px] uppercase tracking-[0.18em] mt-0.5 ${proven ? 'text-emerald-400/90' : 'text-stone-600'}`}>
                          {proven ? 'Ascended' : 'Unproven'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
