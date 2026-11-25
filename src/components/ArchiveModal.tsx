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
  const isLedger = activeTab === 'LEDGER';
  const knob = isLedger
    ? 'radial-gradient(circle at 50% 50%, #524d54 0 2.5px, #2b272d 3px, #121014 5.5px, transparent 7px)'
    : 'radial-gradient(circle at 50% 50%, #f1d58f 0 2.5px, #a87b3c 3px, #3a2612 5.5px, transparent 7px)';
  const panelStyle: import('react').CSSProperties = {
    position: 'relative',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: '18px 12px 12px 12px',
    boxShadow: isLedger
      ? '0 0 0 1px #2e2930, 0 24px 60px rgba(0,0,0,0.94)'
      : '0 0 0 1px #8f6a2c, 0 24px 60px rgba(0,0,0,0.9)',
    backgroundColor: '#3a271a',
    backgroundImage: [
      knob,
      knob,
      isLedger
        ? 'linear-gradient(180deg, rgba(10,9,12,0.55), rgba(6,5,8,0.7))'
        : 'radial-gradient(ellipse at 50% 0%, #6b0f12 0%, #44080a 52%, #1d0405 100%)',
      isLedger ? `url("${baseUrl}assets/text/slate.jpg")` : 'none',
      'linear-gradient(to bottom, rgba(102,73,51,0.52), rgba(42,27,18,0.62), rgba(20,12,8,0.84))',
      `url("${baseUrl}assets/text/wood.jpg")`,
    ].join(', '),
    backgroundSize: ['28px 18px', '28px 18px', 'auto', isLedger ? 'cover' : 'auto', 'auto', '140px 140px'].join(', '),
    backgroundPosition: 'left top, right top, 0 0, 0 0, 0 0, center',
    backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
    backgroundOrigin: 'border-box, border-box, padding-box, padding-box, border-box, border-box',
    backgroundClip: 'border-box, border-box, padding-box, padding-box, border-box, border-box',
  };

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-[140] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={panelStyle}
        className="w-full max-w-4xl h-[672px] max-h-[94%] flex flex-col rounded-[2px] bg-[#0d0b0f] border border-[#4a413b]/85 shadow-[0_24px_60px_rgba(0,0,0,0.96),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden"
      >
        {!isLedger && (
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-65 mix-blend-multiply"
            style={{
              backgroundImage: `url("${baseUrl}assets/text/cloth.jpg")`,
              backgroundSize: '170px 170px',
              backgroundRepeat: 'repeat',
            }}
          />
        )}
        {/* ArchiveStitch */}
        <div
          className={`pointer-events-none absolute inset-0 z-30 border ${
            isLedger ? 'border-[#322d34]/90' : 'border-[#c9a24e]/80'
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-[5px] z-30 border border-dashed ${
            isLedger ? 'border-[#4a434d]/40' : 'border-[#e5c16b]/35'
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col justify-center">
            <div className="text-center mb-4">
              <div className="text-[10px] text-[#8f7960] uppercase tracking-[0.25em] mb-1">
                +-- A MONUMENT TO ALL YOUR SINS --+
              </div>
              <h3 className="text-lg font-['Cinzel',_serif] font-bold uppercase tracking-widest text-[#ede2ce]">
                Chronicle of Threads & Bone
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-w-2xl w-full mx-auto">
              <div className="bg-[#141216] border border-[#3a3330] p-3 text-center">
                <div className="text-[10px] text-[#9c9084] uppercase tracking-wider mb-1">
                  Rituals Concluded
                </div>
                <div className="text-2xl font-bold text-[#ede2ce]">
                  {archive.runsWon}{' '}
                  <span className="text-xs text-stone-500 font-normal">
                    / {archive.runsStarted}
                  </span>
                </div>
              </div>

              <div className="bg-[#141216] border border-[#3a3330] p-3 text-center">
                <div className="text-[10px] text-[#9c9084] uppercase tracking-wider mb-1">
                  Highest Overkill
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {archive.highestOverkill}
                </div>
              </div>

              <div className="bg-[#141216] border border-[#3a3330] p-3 text-center">
                <div className="text-[10px] text-[#9c9084] uppercase tracking-wider mb-1">
                  Bosses Slain
                </div>
                <div className="text-2xl font-bold text-purple-300">
                  {archive.totalBossesDefeated}
                </div>
              </div>

              <div className="bg-[#141216] border border-[#3a3330] p-3 text-center">
                <div className="text-[10px] text-[#9c9084] uppercase tracking-wider mb-1">
                  Cards Sacrificed
                </div>
                <div className="text-2xl font-bold text-red-300">
                  {archive.totalSacrifices}
                </div>
              </div>

              <div className="bg-[#141216] border border-[#3a3330] p-3 text-center">
                <div className="text-[10px] text-[#9c9084] uppercase tracking-wider mb-1">
                  Beasts Felled
                </div>
                <div className="text-2xl font-bold text-stone-100">
                  {archive.totalEnemyKills}
                </div>
              </div>

              <div className="bg-[#141216] border border-[#3a3330] p-3 text-center">
                <div className="text-[10px] text-[#9c9084] uppercase tracking-wider mb-1">
                  Stages Traversed
                </div>
                <div className="text-2xl font-bold text-[#d6c2a5]">
                  {archive.totalStagesCleared}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-3 bg-[#141216] border border-[#3a3330] p-3 flex items-center justify-around text-center">
                <div>
                  <div className="text-[10px] text-[#9c9084] uppercase tracking-wider mb-1">
                    Total Scale Damage Dealt
                  </div>
                  <div className="text-xl font-bold text-[#ede2ce]">
                    {archive.totalScaleDealt}
                  </div>
                </div>
                <div className="h-8 w-px bg-[#3a3330]" />
                <div>
                  <div className="text-[10px] text-[#9c9084] uppercase tracking-wider mb-1">
                    Total Scale Damage Taken
                  </div>
                  <div className="text-xl font-bold text-red-400">
                    {archive.totalScaleTaken}
                  </div>
                </div>
              </div>

              {/* Lineages Proven Trophy Shelf */}
              <div className="col-span-2 sm:col-span-3 bg-[#141216] border border-[#3a3330] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#9c9084] uppercase tracking-widest">
                    Lineages Proven
                  </span>
                  <span className="text-[10px] text-[#cbb698]/85">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        className={`px-2.5 py-1.5 border text-center transition-colors ${
                          proven
                            ? 'bg-[#161c19] border-emerald-800/70 text-emerald-200'
                            : 'bg-[#0b0a0d] border-[#221f24] text-stone-600'
                        }`}
                      >
                        <div className="text-[11px] font-bold tracking-wide">
                          {lin.label}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest mt-0.5">
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
