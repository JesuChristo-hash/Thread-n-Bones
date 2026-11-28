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
  getCardDisplayName,
  cardMatchesTribe,
  getCardTribeLabel,
} from '../data/gameData';
import { type PersistentArchive } from '../data/archive';
import { RitualReliquaryShell } from './BattleFlankUI';

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

const LINEAGE_LIST = [
  { id: 'randomizer', label: 'Unformed' },
  { id: 'witchcraft', label: 'Taiga' },
  { id: 'infestation', label: 'Colony' },
  { id: 'skeleton', label: 'Scavengers' },
  { id: 'eldritch', label: 'Eldritch' },
  { id: 'paleozoic', label: 'Paleozoic' },
];

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
    return list.sort((a, b) => getCardDisplayName(a.name).localeCompare(getCardDisplayName(b.name)));
  }, []);

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCards.filter((c) => {
      if (tribeFilter !== 'ALL' && !cardMatchesTribe(c, tribeFilter)) return false;
      if (!q) return true;
      const isDiscovered = seenCardSet.has(c.name);
      if (!isDiscovered) return false;
      return (
        getCardDisplayName(c.name).toLowerCase().includes(q) ||
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

  const isLedger = activeTab === 'LEDGER';
  const ledgerPlaqueCls =
    'relative bg-[#09080c]/82 border border-[#463f4d]/70 shadow-[inset_0_3px_12px_rgba(0,0,0,0.92),0_1px_0_rgba(255,255,255,0.03)]';

  const renderCornerTicks = (colorClass = 'border-[#b08749]/55') => (
    <>
      <span className={`pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t border-l ${colorClass}`} />
      <span className={`pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t border-r ${colorClass}`} />
      <span className={`pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l ${colorClass}`} />
      <span className={`pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r ${colorClass}`} />
    </>
  );

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-[140] bg-black/86 backdrop-blur-[4px] flex items-center justify-center p-4 font-mono select-none"
      role="dialog"
      aria-modal="true"
      aria-label={isLedger ? 'Ritual Ledger' : 'Compendium'}
    >
      <RitualReliquaryShell
        variant={isLedger ? 'obsidian' : 'crimson'}
        onClick={(e) => e.stopPropagation()}
        className="animate-sigil-modal-in w-full max-w-4xl h-[676px] max-h-[94%] flex flex-col"
      >
        {/* Top Engraved Navigation Header */}
        <div
          className={`relative z-10 flex items-center justify-between px-6 sm:px-8 pt-5 pb-3.5 border-b ${
            isLedger ? 'border-[#4a4354]/65 bg-[#0c0a10]/55' : 'border-[#543a27]/70 bg-[#110808]/55'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => setActiveTab('COMPENDIUM')}
              className={`relative flex items-center gap-2 px-4 py-2 font-['Cinzel',_serif] text-xs uppercase tracking-[0.18em] border transition-all cursor-pointer ${
                activeTab === 'COMPENDIUM'
                  ? 'bg-[#1a0b0b]/90 border-[#c49a5c]/80 text-[#f3dfb8] font-bold shadow-[inset_0_0_14px_rgba(185,28,28,0.28),0_2px_8px_rgba(0,0,0,0.85)]'
                  : 'bg-[#0b080a]/55 border-[#3b312d]/70 text-[#9c8c7c] hover:text-[#dfd0ba] hover:border-[#6e5640]/80'
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'COMPENDIUM' ? 'text-[#e2be7d]' : ''}`} />
              <span>Compendium</span>
              {activeTab === 'COMPENDIUM' && (
                <span className="pointer-events-none absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] rotate-45 bg-[#991b1b] border border-[#e2be7d]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LEDGER')}
              className={`relative flex items-center gap-2 px-4 py-2 font-['Cinzel',_serif] text-xs uppercase tracking-[0.18em] border transition-all cursor-pointer ${
                activeTab === 'LEDGER'
                  ? 'bg-[#17141f]/90 border-[#b2a8be]/75 text-[#f0eaf7] font-bold shadow-[inset_0_0_14px_rgba(130,118,156,0.26),0_2px_8px_rgba(0,0,0,0.85)]'
                  : 'bg-[#0b080a]/55 border-[#3b312d]/70 text-[#9c8c7c] hover:text-[#dfd0ba] hover:border-[#6e5640]/80'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${activeTab === 'LEDGER' ? 'text-[#d4cde0]' : ''}`} />
              <span>Ritual Ledger</span>
              {activeTab === 'LEDGER' && (
                <span className="pointer-events-none absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] rotate-45 bg-[#4c4459] border border-[#d4cde0]" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`relative w-8 h-8 flex items-center justify-center border transition-all cursor-pointer ${
              isLedger
                ? 'bg-[#121017] border-[#4e4659]/80 text-[#b7adc4] hover:text-white hover:border-[#b2a8be]'
                : 'bg-[#140b09] border-[#5a412d]/85 text-[#cbb698] hover:text-[#fff1d6] hover:border-[#c49a5c]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* COMPENDIUM TAB */}
        {activeTab === 'COMPENDIUM' && (
          <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Sub-navigation & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 sm:px-8 py-3 bg-[#0a0606]/65 border-b border-[#4a3524]/65">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubTab('CARDS')}
                  className={`px-3 py-1.5 font-['Cinzel',_serif] text-[10.5px] uppercase tracking-[0.18em] border transition-colors cursor-pointer ${
                    subTab === 'CARDS'
                      ? 'border-[#b91c1c]/85 bg-[#29090b]/85 text-[#fce2d9] font-bold shadow-[inset_0_0_10px_rgba(185,28,28,0.3)]'
                      : 'border-[#3d2d22]/80 bg-[#100a08]/70 text-[#a89682] hover:text-[#e6d5bc] hover:border-[#6e523a]'
                  }`}
                >
                  Beasts ({discoveredCardCount}/{allCards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab('SIGILS')}
                  className={`px-3 py-1.5 font-['Cinzel',_serif] text-[10.5px] uppercase tracking-[0.18em] border transition-colors cursor-pointer ${
                    subTab === 'SIGILS'
                      ? 'border-[#b91c1c]/85 bg-[#29090b]/85 text-[#fce2d9] font-bold shadow-[inset_0_0_10px_rgba(185,28,28,0.3)]'
                      : 'border-[#3d2d22]/80 bg-[#100a08]/70 text-[#a89682] hover:text-[#e6d5bc] hover:border-[#6e523a]'
                  }`}
                >
                  Crests ({discoveredSigilCount}/{allSigils.length})
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                {subTab === 'CARDS' && (
                  <select
                    value={tribeFilter}
                    onChange={(e) => setTribeFilter(e.target.value)}
                    className="bg-[#0e0908] border border-[#4a3524]/85 text-[#e6d5bc] text-[11px] px-2.5 py-1.5 uppercase tracking-wider focus:outline-none focus:border-[#c49a5c] cursor-pointer"
                  >
                    <option value="ALL">All Tribes</option>
                    <option value="Canine">Canine</option>
                    <option value="Avian">Avian</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Insect">Insect</option>
                    <option value="Hooved">Hooved</option>
                    <option value="Vermin">Vermin</option>
                    <option value="No Class">No Class</option>
                  </select>
                )}

                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-[#9c8266] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter..."
                    className="w-full bg-[#0e0908] border border-[#4a3524]/85 text-[#ece0cc] placeholder-[#7c6956] text-[11px] pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-[#c49a5c]"
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Compendium Body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5">
              {subTab === 'CARDS' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredCards.map((card) => {
                    const discovered = seenCardSet.has(card.name);
                    return (
                      <div
                        key={card.name}
                        className={`relative border p-3 flex flex-col justify-between transition-colors ${
                          discovered
                            ? 'bg-[#0e0a09]/92 border-[#4a3524]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)]'
                            : 'bg-[#090707]/80 border-[#28201d]/80 opacity-65'
                        }`}
                      >
                        {discovered && renderCornerTicks('border-[#9f773d]/45')}

                        <div>
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <span
                              className={`font-['Cinzel',_serif] text-[11.5px] font-bold tracking-wider truncate ${
                                discovered ? 'text-[#f3dfb8]' : 'text-[#63564c]'
                              }`}
                            >
                              {discovered ? getCardDisplayName(card.name) : '???'}
                            </span>
                            {discovered && (
                              <span className="text-[10px] text-[#e2be7d] shrink-0 font-bold">
                                {card.boneCost
                                  ? `${card.boneCost}🦴`
                                  : card.cost
                                    ? `${card.cost}🩸`
                                    : 'FREE'}
                              </span>
                            )}
                          </div>

                          <div className="relative h-16 flex items-center justify-center bg-[#060404]/85 border border-[#32231a]/80 mb-2.5 overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]">
                            {discovered ? (
                              <>
                                <div
                                  aria-hidden="true"
                                  className="pointer-events-none absolute inset-0"
                                  style={{
                                    background:
                                      'radial-gradient(circle at 50% 50%, rgba(165,28,28,0.16) 0%, transparent 72%)',
                                  }}
                                />
                                <img
                                  src={getCardArtUrl(card)}
                                  alt={getCardDisplayName(card.name)}
                                  className="relative h-14 w-14 object-contain [image-rendering:pixelated]"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </>
                            ) : (
                              <span className="font-['Cinzel',_serif] text-[#4a3f38] text-lg font-bold">?</span>
                            )}
                          </div>
                        </div>

                        {discovered ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10.5px] border-t border-[#3b291e]/80 pt-1.5">
                              <span className="text-[#f0c878] font-bold">ATK {card.attack}</span>
                              <span className="text-[#a89682] text-[9.5px] truncate px-1">
                                {TRIBE_ICONS[card.class as Tribe] || ''} {getCardTribeLabel(card)}
                              </span>
                              <span className="text-[#f28b82] font-bold">HP {card.health}</span>
                            </div>
                            {card.sigils && card.sigils.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {card.sigils.map((s) => (
                                  <span
                                    key={s}
                                    title={SIGIL_DESCRIPTIONS[s] || s}
                                    className="text-[9px] px-1.5 py-0.5 bg-[#160e0b] border border-[#543c29]/80 text-[#e6d5bc] truncate"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[9.5px] font-['Cinzel',_serif] text-[#63564c] uppercase tracking-[0.2em] text-center pt-1">
                            Unseen Specimen
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredSigils.map((sigil) => {
                    const discovered = seenSigilSet.has(sigil);
                    return (
                      <div
                        key={sigil}
                        className={`relative border p-3.5 flex items-start gap-3.5 ${
                          discovered
                            ? 'bg-[#0e0a09]/92 border-[#4a3524]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)]'
                            : 'bg-[#090707]/80 border-[#28201d]/80 opacity-75'
                        }`}
                      >
                        {discovered && renderCornerTicks('border-[#9f773d]/45')}

                        {/* Sculpted Circular Brass Sigil Medallion (True Un-Inverted Pixel Art!) */}
                        <div className="w-11 h-11 shrink-0 rounded-full bg-[#150d0a] border border-[#8f6a38]/85 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95),0_2px_6px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
                          <img
                            src={getSigilArtUrl(sigil)}
                            alt={sigil}
                            className={`w-7 h-7 object-contain [image-rendering:pixelated] ${
                              discovered ? '' : 'opacity-50 grayscale'
                            }`}
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const fb = img.nextElementSibling as HTMLElement | null;
                              if (fb) fb.style.display = 'inline';
                            }}
                          />
                          <span className="hidden text-base text-[#e5c185]">
                            {SIGIL_MAPPING[sigil] || '✦'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-['Cinzel',_serif] text-xs font-bold text-[#f3dfb8] uppercase tracking-[0.14em]">
                              {sigil}
                            </span>
                            <span
                              className={`text-[8.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.18em] ${
                                discovered ? 'text-[#d9b46e]' : 'text-[#6c5f55]'
                              }`}
                            >
                              {discovered ? '◆ Witnessed' : 'Unwitnessed'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#d6c6ae]/88 leading-relaxed">
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
          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-4 flex flex-col justify-center">
            <div className="text-center mb-3.5">
              <div className="flex items-center justify-center gap-3 mb-0.5">
                <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#9e94ad]/60" />
                <span className="text-[9px] font-['Cinzel',_serif] font-bold text-[#bdb3c9]/90 uppercase tracking-[0.28em]">
                  ◆ A Monument to All Your Sins ◆
                </span>
                <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#9e94ad]/60" />
              </div>
              <h3
                className="text-lg sm:text-xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.22em] text-[#f2ebf8]"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.98)' }}
              >
                Chronicle of Threads &amp; Bone
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-2xl w-full mx-auto">
              {/* Peak Ritual Record: Highest Rank, Score & Seed */}
              <div className={`col-span-2 sm:col-span-3 ${ledgerPlaqueCls} px-4 py-2.5 flex items-center justify-around text-center`}>
                {renderCornerTicks('border-[#a69cb5]/45')}
                <div>
                  <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.2em] mb-0.5">
                    Highest Rank
                  </div>
                  <div className={`text-xl font-['Cinzel',_serif] font-black ${archive.highestRankColor || 'text-stone-400'}`}>
                    {archive.highestRank || '—'}
                  </div>
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-[#585063] to-transparent" />
                <div>
                  <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.2em] mb-0.5">
                    Highest Score
                  </div>
                  <div className="text-xl font-bold text-[#f3dfb8]">
                    {archive.highestScore || 0}
                  </div>
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-[#585063] to-transparent" />
                <div>
                  <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.2em] mb-0.5">
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
                      className="text-xs font-mono font-bold tracking-widest text-[#e6d5bc] hover:text-white border border-[#524a5e] hover:border-[#b2a8be] bg-[#14111b] px-2.5 py-0.5 transition-colors cursor-pointer"
                    >
                      {copiedLedgerSeed ? 'COPIED ✓' : archive.highestScoreSeed}
                    </button>
                  ) : (
                    <div className="text-sm font-mono text-[#6a6275]">—</div>
                  )}
                </div>
              </div>

              <div className={`${ledgerPlaqueCls} px-3 py-2.5 text-center`}>
                {renderCornerTicks('border-[#7c738a]/35')}
                <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.16em] mb-0.5">
                  Rituals Concluded
                </div>
                <div className="text-xl font-bold text-[#f3dfb8]">
                  {archive.runsWon}{' '}
                  <span className="text-xs text-[#7c7388] font-normal">
                    / {archive.runsStarted}
                  </span>
                </div>
              </div>

              <div className={`${ledgerPlaqueCls} px-3 py-2.5 text-center`}>
                {renderCornerTicks('border-[#8f2e2e]/45')}
                <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.16em] mb-0.5">
                  Peak Blood / Turn
                </div>
                <div className="text-xl font-bold text-[#f27b73]">
                  {archive.highestOverkill} <span className="text-xs font-normal text-[#d98c84]">oz</span>
                </div>
              </div>

              <div className={`${ledgerPlaqueCls} px-3 py-2.5 text-center`}>
                {renderCornerTicks('border-[#7c738a]/35')}
                <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.16em] mb-0.5">
                  Horrors Slain
                </div>
                <div className="text-xl font-bold text-[#d5c3ee]">
                  {archive.totalBossesDefeated}
                </div>
              </div>

              <div className={`${ledgerPlaqueCls} px-3 py-2.5 text-center`}>
                {renderCornerTicks('border-[#8f2e2e]/45')}
                <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.16em] mb-0.5">
                  Allies Sacrificed
                </div>
                <div className="text-xl font-bold text-[#efa099]">
                  {archive.totalSacrifices}
                </div>
              </div>

              <div className={`${ledgerPlaqueCls} px-3 py-2.5 text-center`}>
                {renderCornerTicks('border-[#7c738a]/35')}
                <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.16em] mb-0.5">
                  Creatures Felled
                </div>
                <div className="text-xl font-bold text-[#f0eae0]">
                  {archive.totalEnemyKills}
                </div>
              </div>

              <div className={`${ledgerPlaqueCls} px-3 py-2.5 text-center`}>
                {renderCornerTicks('border-[#7c738a]/35')}
                <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.16em] mb-0.5">
                  Stages Traversed
                </div>
                <div className="text-xl font-bold text-[#dfd0b8]">
                  {archive.totalStagesCleared}
                </div>
              </div>

              <div className={`col-span-2 sm:col-span-3 ${ledgerPlaqueCls} px-4 py-2.5 flex items-center justify-around text-center`}>
                {renderCornerTicks('border-[#7c738a]/35')}
                <div>
                  <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.18em] mb-0.5">
                    Blood Extracted
                  </div>
                  <div className="text-lg font-bold text-[#f3dfb8]">
                    {archive.totalScaleDealt}
                  </div>
                </div>
                <div className="h-7 w-px bg-gradient-to-b from-transparent via-[#585063] to-transparent" />
                <div>
                  <div className="text-[9px] font-['Cinzel',_serif] text-[#a69db0] uppercase tracking-[0.18em] mb-0.5">
                    Blood Lost
                  </div>
                  <div className="text-lg font-bold text-[#f27b73]">
                    {archive.totalScaleTaken}
                  </div>
                </div>
              </div>

              {/* Lineages Proven Trophy Shelf */}
              <div className={`col-span-2 sm:col-span-3 ${ledgerPlaqueCls} px-4 py-2.5`}>
                {renderCornerTicks('border-[#a69cb5]/45')}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9.5px] font-['Cinzel',_serif] font-bold text-[#cfc3d9] uppercase tracking-[0.22em]">
                    ◆ Lineages Proven
                  </span>
                  <span className="text-[10.5px] font-bold text-[#e2be7d]">
                    {LINEAGE_LIST.filter((l) => archive.clearedLineages.includes(l.id)).length}
                    /6
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {LINEAGE_LIST.map((lin) => {
                    const proven = archive.clearedLineages.includes(lin.id);
                    return (
                      <div
                        key={lin.id}
                        className={`px-1.5 py-2 border text-center transition-colors ${
                          proven
                            ? 'bg-[#131d19]/90 border-[#4d8c73]/80 text-[#d8f3e5] shadow-[inset_0_1px_0_rgba(110,231,183,0.18),0_0_10px_rgba(16,185,129,0.12)]'
                            : 'bg-[#07060a]/90 border-[#2b2633]/80 text-[#605969]'
                        }`}
                      >
                        <div className="text-[10px] font-['Cinzel',_serif] font-bold tracking-wide truncate">
                          {lin.label}
                        </div>
                        <div
                          className={`text-[8px] uppercase tracking-[0.18em] mt-0.5 ${
                            proven ? 'text-[#7fd9b3]' : 'text-[#554e5e]'
                          }`}
                        >
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
      </RitualReliquaryShell>
    </div>
  );
};

