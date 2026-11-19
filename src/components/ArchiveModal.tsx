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

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-[140] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-[672px] max-h-[94%] flex flex-col bg-[#0c0805] border border-amber-950/80 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-950/70 bg-[#120b07]">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('COMPENDIUM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors cursor-pointer ${
                activeTab === 'COMPENDIUM'
                  ? 'bg-[#231710] border-amber-600/70 text-amber-200 font-bold'
                  : 'bg-transparent border-transparent text-stone-400 hover:text-amber-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Compendium</span>
            </button>
            <button
              onClick={() => setActiveTab('LEDGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors cursor-pointer ${
                activeTab === 'LEDGER'
                  ? 'bg-[#231710] border-amber-600/70 text-amber-200 font-bold'
                  : 'bg-transparent border-transparent text-stone-400 hover:text-amber-300'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Ritual Ledger</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-amber-200 border border-transparent hover:border-amber-900/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* COMPENDIUM TAB */}
        {activeTab === 'COMPENDIUM' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Sub-navigation & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#100a06] border-b border-amber-950/50">
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
                    className="bg-[#18100b] border border-amber-950/80 text-amber-200/90 text-[11px] px-2 py-1 uppercase tracking-wider focus:outline-none"
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
                    className="w-full bg-[#18100b] border border-amber-950/80 text-stone-200 text-[11px] pl-7 pr-2 py-1 focus:outline-none focus:border-amber-700"
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
                            ? 'bg-[#160e09] border-[#3d2518]'
                            : 'bg-[#090604] border-stone-900 opacity-65'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <span
                              className={`text-xs font-bold tracking-wide truncate ${
                                discovered ? 'text-amber-100' : 'text-stone-600'
                              }`}
                            >
                              {discovered ? card.name : '???'}
                            </span>
                            {discovered && (
                              <span className="text-[10px] text-amber-400/90 shrink-0">
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
                                    className="text-[9px] px-1.5 py-0.5 bg-amber-950/50 border border-amber-900/60 text-amber-200/90 truncate"
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
                            ? 'bg-[#160e09] border-[#3d2518]'
                            : 'bg-[#090604] border-stone-900 opacity-75'
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
                            <span className="text-xs font-bold text-amber-200 tracking-wide">
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
          <div className="flex-1 overflow-y-auto p-5 sm:p-8">
            <div className="text-center mb-6">
              <div className="text-[10px] text-amber-700 uppercase tracking-[0.25em] mb-1">
                +-- A MONUMENT TO ALL YOUR SINS --+
              </div>
              <h3 className="text-lg font-['Cinzel',_serif] font-bold uppercase tracking-widest text-amber-200">
                Chronicle of Threads & Bone
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
              <div className="bg-[#150d09] border border-[#3e2316] p-4 text-center">
                <div className="text-[10px] text-[#a8957f] uppercase tracking-wider mb-1">
                  Rituals Concluded
                </div>
                <div className="text-2xl font-bold text-amber-200">
                  {archive.runsWon}{' '}
                  <span className="text-xs text-stone-500 font-normal">
                    / {archive.runsStarted}
                  </span>
                </div>
              </div>

              <div className="bg-[#150d09] border border-[#3e2316] p-4 text-center">
                <div className="text-[10px] text-[#a8957f] uppercase tracking-wider mb-1">
                  Highest Overkill
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {archive.highestOverkill}
                </div>
              </div>

              <div className="bg-[#150d09] border border-[#3e2316] p-4 text-center">
                <div className="text-[10px] text-[#a8957f] uppercase tracking-wider mb-1">
                  Bosses Slain
                </div>
                <div className="text-2xl font-bold text-purple-300">
                  {archive.totalBossesDefeated}
                </div>
              </div>

              <div className="bg-[#150d09] border border-[#3e2316] p-4 text-center">
                <div className="text-[10px] text-[#a8957f] uppercase tracking-wider mb-1">
                  Cards Sacrificed
                </div>
                <div className="text-2xl font-bold text-red-300">
                  {archive.totalSacrifices}
                </div>
              </div>

              <div className="bg-[#150d09] border border-[#3e2316] p-4 text-center">
                <div className="text-[10px] text-[#a8957f] uppercase tracking-wider mb-1">
                  Beasts Felled
                </div>
                <div className="text-2xl font-bold text-stone-100">
                  {archive.totalEnemyKills}
                </div>
              </div>

              <div className="bg-[#150d09] border border-[#3e2316] p-4 text-center">
                <div className="text-[10px] text-[#a8957f] uppercase tracking-wider mb-1">
                  Stages Traversed
                </div>
                <div className="text-2xl font-bold text-amber-300">
                  {archive.totalStagesCleared}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-3 bg-[#150d09] border border-[#3e2316] p-4 flex items-center justify-around text-center">
                <div>
                  <div className="text-[10px] text-[#a8957f] uppercase tracking-wider mb-1">
                    Total Scale Damage Dealt
                  </div>
                  <div className="text-xl font-bold text-amber-200">
                    {archive.totalScaleDealt}
                  </div>
                </div>
                <div className="h-8 w-px bg-[#3e2316]" />
                <div>
                  <div className="text-[10px] text-[#a8957f] uppercase tracking-wider mb-1">
                    Total Scale Damage Taken
                  </div>
                  <div className="text-xl font-bold text-red-400">
                    {archive.totalScaleTaken}
                  </div>
                </div>
              </div>

              {/* Adversaries Felled Trophy Shelf */}
              <div className="col-span-2 sm:col-span-3 bg-[#150d09] border border-[#3e2316] p-4 mt-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[#a8957f] uppercase tracking-widest">
                    Adversaries Felled
                  </span>
                  <span className="text-[10px] text-amber-400/80">
                    {
                      [
                        { id: 'Zealot', label: 'The Zealot' },
                        { id: 'The Begotten', label: 'The Begotten' },
                        { id: 'The Weaver', label: 'The Weaver' },
                        { id: 'BoneLord', label: 'The Bone Lord' },
                      ].filter((b) => archive.defeatedBosses.includes(b.id)).length
                    }
                    /4
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Zealot', label: 'The Zealot' },
                    { id: 'The Begotten', label: 'The Begotten' },
                    { id: 'The Weaver', label: 'The Weaver' },
                    { id: 'BoneLord', label: 'The Bone Lord' },
                  ].map((boss) => {
                    const slain = archive.defeatedBosses.includes(boss.id);
                    return (
                      <div
                        key={boss.id}
                        className={`px-2.5 py-2 border text-center transition-colors ${
                          slain
                            ? 'bg-[#21120c] border-amber-700/70 text-amber-200'
                            : 'bg-[#0b0705] border-stone-900 text-stone-600'
                        }`}
                      >
                        <div className="text-[11px] font-bold tracking-wide truncate">
                          {slain ? boss.label : '???'}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest mt-0.5">
                          {slain ? 'Vanquished' : 'Unbroken'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lineages Proven Trophy Shelf */}
              <div className="col-span-2 sm:col-span-3 bg-[#150d09] border border-[#3e2316] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[#a8957f] uppercase tracking-widest">
                    Lineages Proven
                  </span>
                  <span className="text-[10px] text-amber-400/80">
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
                        className={`px-2.5 py-2 border text-center transition-colors ${
                          proven
                            ? 'bg-[#21120c] border-emerald-800/70 text-emerald-200'
                            : 'bg-[#0b0705] border-stone-900 text-stone-600'
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
