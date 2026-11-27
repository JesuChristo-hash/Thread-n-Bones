import React from 'react';
import { ChiptuneAudio } from '../audio/ChiptuneAudio';
import { ALL_CARD_LOOKUP, CARD_ART_OFFSETS, MAIN_DECK_POOL, SIGIL_DESCRIPTIONS, SIGIL_MAPPING, getCardArtUrl , getCardDisplayName } from '../data/gameData';
import type { CardDef, CardInstance } from '../data/gameData';
import { resetArchive } from '../data/archive';

export interface DevMenuScreenProps {
  addLog: any;
  archive: any;
  bossPhase: any;
  bossState: any;
  cloneCard: any;
  devAlterCard: any;
  devCardSearch: any;
  devCardsFilter: any;
  devConfirmWipeArchive: any;
  devForceSubmenuOpen: any;
  devInspectCard: any;
  devTab: any;
  displayStage: any;
  encounter: any;
  enemyBoard: any[];
  enemyCardsPlayed: any;
  enemyMaxDuelCards: any;
  enemyQueue: any[];
  getCardAttack: any;
  getRequiredScaleWinDamage: any;
  handleDevForce: any;
  handleDevJumpAct: any;
  handleDevNewHand: any;
  handleWinMatch: any;
  isBossMatch: any;
  masterDeck: any[];
  menuFadingOut: any;
  ouroborosBuffs: any;
  phase: any;
  playerBoard: any[];
  previousScreen: any;
  renderCard: any;
  scale: any;
  setActiveVows?: React.Dispatch<React.SetStateAction<any[]>>;
  setArchive: React.Dispatch<React.SetStateAction<any>>;
  setBones: React.Dispatch<React.SetStateAction<any>>;
  setBossPhase: React.Dispatch<React.SetStateAction<any>>;
  setBossState: any;
  setDevAlterCard: React.Dispatch<React.SetStateAction<any>>;
  setDevCardSearch: React.Dispatch<React.SetStateAction<any>>;
  setDevCardsFilter: React.Dispatch<React.SetStateAction<any>>;
  setDevConfirmWipeArchive: React.Dispatch<React.SetStateAction<any>>;
  setDevForceSubmenuOpen: React.Dispatch<React.SetStateAction<any>>;
  setDevInspectCard: React.Dispatch<React.SetStateAction<any>>;
  setDevTab: React.Dispatch<React.SetStateAction<any>>;
  setEnemyBoard: React.Dispatch<React.SetStateAction<any[]>>;
  setEnemyQueue: React.Dispatch<React.SetStateAction<any[]>>;
  setIsBloodMoonDropping: React.Dispatch<React.SetStateAction<any>>;
  setIsBoardRumbling: React.Dispatch<React.SetStateAction<any>>;
  setIsPhaseTransition: React.Dispatch<React.SetStateAction<any>>;
  setMasterDeck: React.Dispatch<React.SetStateAction<any[]>>;
  setPhase: React.Dispatch<React.SetStateAction<any>>;
  setPlayerBoard: React.Dispatch<React.SetStateAction<any[]>>;
  setScale: React.Dispatch<React.SetStateAction<any>>;
  setScreen: React.Dispatch<React.SetStateAction<any>>;
  setSigilDetailModal: React.Dispatch<React.SetStateAction<any>>;
  setStartingBones: React.Dispatch<React.SetStateAction<any>>;
  setTotalOverkillDamage: React.Dispatch<React.SetStateAction<number>>;
  setTurnNumber: React.Dispatch<React.SetStateAction<number>>;
  startingBonesRef: any;
  transformAmorphous: any;
  triggerSfx: any;
  turnNumber: any;
}

export default function DevMenuScreen({
  addLog,
  archive,
  bossPhase,
  bossState,
  cloneCard,
  devAlterCard,
  devCardSearch,
  devCardsFilter,
  devConfirmWipeArchive,
  devForceSubmenuOpen,
  devInspectCard,
  devTab,
  displayStage,
  encounter,
  enemyBoard,
  enemyCardsPlayed,
  enemyMaxDuelCards,
  enemyQueue,
  getCardAttack,
  getRequiredScaleWinDamage,
  handleDevForce,
  handleDevJumpAct,
  handleDevNewHand,
  handleWinMatch,
  isBossMatch,
  masterDeck,
  menuFadingOut,
  ouroborosBuffs,
  phase,
  playerBoard,
  previousScreen,
  renderCard,
  scale,
  setActiveVows,
  setArchive,
  setBones,
  setBossPhase,
  setBossState,
  setDevAlterCard,
  setDevCardSearch,
  setDevCardsFilter,
  setDevConfirmWipeArchive,
  setDevForceSubmenuOpen,
  setDevInspectCard,
  setDevTab,
  setEnemyBoard,
  setEnemyQueue,
  setIsBloodMoonDropping,
  setIsBoardRumbling,
  setIsPhaseTransition,
  setMasterDeck,
  setPhase,
  setPlayerBoard,
  setScale,
  setScreen,
  setSigilDetailModal,
  setStartingBones,
  setTotalOverkillDamage,
  setTurnNumber,
  startingBonesRef,
  transformAmorphous,
  triggerSfx,
  turnNumber
}: DevMenuScreenProps) {
  return (
        <div className={`absolute inset-0 bg-[#0a0705]/95 z-50 flex flex-col items-center p-4 sm:p-6 overflow-y-auto backdrop-blur-md font-mono select-none ${menuFadingOut ? 'animate-menu-fade-out' : 'animate-menu-fade-in'}`}>
          <div className="w-full max-w-3xl border border-amber-950/60 p-6 sm:p-8 bg-[#0c0805] mb-10">
            <div className="flex justify-between items-center mb-4 border-b border-amber-950/50 pb-3">
              <div>
                <div className="text-[10px] text-amber-700/80 uppercase tracking-widest mb-0.5">+-- OCCULT PROTOCOLS --+</div>
                <h2 className="text-lg sm:text-xl font-mono font-bold text-amber-200 uppercase tracking-widest">Development Console</h2>
              </div>
              <button
                onClick={() => setScreen(previousScreen || 'DUEL')}
                className="bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#2f241c] rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-widest text-[#cfb794] hover:text-[#f3ede2] cursor-pointer px-3 py-1.5"
              >
                CLOSE
              </button>
            </div>

            {/* Duel / Enemy Restrictions Status */}
            <div className="text-[11px] text-stone-400 font-mono mb-4 flex flex-wrap items-center justify-between border-y border-amber-950/40 py-2.5 gap-2">
              <span>Encounter #{encounter} | Stage {displayStage} | Turn {turnNumber}</span>
              <span className="text-amber-300 font-bold">
                {isBossMatch ? 'Boss Battle (Rules Exempt)' : `Enemy Cards: ${enemyCardsPlayed} / ${enemyMaxDuelCards} max | Board: ${enemyBoard.filter(c => c !== null).length + enemyQueue.filter(c => c !== null).length}/6`}
              </span>
            </div>

            {/* Force Actions Toggle Button */}
            <button
              onClick={() => setDevForceSubmenuOpen(!devForceSubmenuOpen)}
              className="w-full py-2 px-3 border border-amber-950/50 hover:border-amber-700/60 font-mono text-xs uppercase tracking-widest text-amber-200/80 hover:text-amber-100 hover:tracking-[0.18em] transition-all flex items-center justify-between mb-4 cursor-pointer"
            >
              <span>FORCE ENCOUNTERS & BOSSES</span>
              <span className="text-amber-500/70">{devForceSubmenuOpen ? '−' : '+'}</span>
            </button>

            {/* Force Actions Submenu Grid */}
            {devForceSubmenuOpen && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-3 border border-amber-950/40 bg-black/30">
                <button onClick={() => handleDevForce('combat')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-red-400 hover:text-red-200 border border-red-950/60 hover:border-red-800 transition cursor-pointer">COMBAT</button>
                <button onClick={() => handleDevForce('boss-woodcarver')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-amber-300 hover:text-amber-100 border border-amber-950/60 hover:border-amber-800 transition cursor-pointer">THE WEAVER</button>
                <button onClick={() => handleDevForce('boss-zealot')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-red-400 hover:text-red-200 border border-red-950/60 hover:border-red-800 transition cursor-pointer">THE ZEALOT</button>
                <button onClick={() => handleDevForce('boss-goobert')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-200 border border-emerald-950/60 hover:border-emerald-800 transition cursor-pointer">THE BEGOTTEN</button>
                <button onClick={() => handleDevForce('boss-bonelord')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-stone-300 hover:text-white border border-stone-800 hover:border-stone-600 transition cursor-pointer">BONE LORD</button>
                <button onClick={() => handleDevForce('campfire')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-amber-400 hover:text-amber-200 border border-amber-950/60 hover:border-amber-800 transition cursor-pointer">CAMPFIRE</button>
                <button onClick={() => handleDevForce('altar')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-purple-400 hover:text-purple-200 border border-purple-950/60 hover:border-purple-800 transition cursor-pointer">ALTAR</button>
              <button onClick={() => handleDevForce('anvil')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-amber-400 hover:text-amber-200 border border-amber-950/60 hover:border-amber-800 transition cursor-pointer">TRANSMUTATION</button>
              <button onClick={() => handleDevForce('flock')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-red-400 hover:text-red-200 border border-red-950/60 hover:border-red-800 transition cursor-pointer">ZEALOT FLOCK</button>
                <button onClick={() => handleDevForce('carving')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-200 border border-emerald-950/60 hover:border-emerald-800 transition cursor-pointer">CARVING</button>
                <button onClick={() => handleDevForce('cost')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-amber-300 hover:text-amber-100 border border-amber-950/60 hover:border-amber-800 transition cursor-pointer">COST BARGAIN</button>
                <button onClick={() => handleDevForce('choice')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-amber-300 hover:text-amber-100 border border-amber-950/60 hover:border-amber-800 transition cursor-pointer">CARD CHOICE</button>
                <button onClick={() => handleDevForce('bonelord')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-stone-300 hover:text-stone-100 border border-stone-800 hover:border-stone-600 transition cursor-pointer">BONE ALTAR</button>
                <button onClick={() => handleDevForce('mycologist')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-amber-300 hover:text-amber-100 border border-amber-950/60 hover:border-amber-800 transition cursor-pointer">MYCOLOGIST</button>
                <button onClick={() => handleDevForce('goobert')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-200 border border-emerald-950/60 hover:border-emerald-800 transition cursor-pointer">BEGOTTEN EVENT</button>
                <button onClick={() => handleDevForce('cave')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-stone-300 hover:text-stone-100 border border-stone-800 hover:border-stone-600 transition cursor-pointer">CAVE TRIAL</button>
                <button onClick={() => handleDevForce('totem')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-amber-400 hover:text-amber-200 border border-amber-950/60 hover:border-amber-800 transition cursor-pointer">WOODCARVER</button>
                <button onClick={() => handleDevForce('items')} className="py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-amber-300 hover:text-amber-100 border border-amber-950/60 hover:border-amber-800 transition cursor-pointer">SURPLUS CACHE</button>
              </div>
            )}

            {/* Act Jump Bar (Weather & Act Progression Sandbox) */}
            <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-amber-950/40">
              {([
                { act: 1 as const, label: 'ACT I · MIST', cls: 'text-stone-300 border-stone-700/70 hover:border-stone-400' },
                { act: 2 as const, label: 'ACT II · RAIN', cls: 'text-sky-300 border-sky-900/70 hover:border-sky-500' },
                { act: 3 as const, label: 'ACT III · STORM', cls: 'text-indigo-300 border-indigo-900/70 hover:border-indigo-400' },
                { act: 4 as const, label: 'ACT IV · EMBER', cls: 'text-orange-300 border-orange-900/70 hover:border-orange-500' },
              ]).map(item => (
                <button
                  key={item.act}
                  onClick={() => handleDevJumpAct(item.act)}
                  className={`py-1.5 px-2 bg-[#120d0a] hover:bg-[#1e1510] border rounded-sm font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${item.cls}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Actions (Tip Scales, Alter Deck, New Hand, Blood Injection) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 border-b border-amber-950/40 pb-5">
              <button
                onClick={() => {
                  setTotalOverkillDamage(prev => prev + 10);
                  addLog("[DEV] Injected +10 oz to Blood Bank.");
                }}
                className="py-2 px-3 bg-[#1a0e0c] hover:bg-[#281310] active:bg-[#120807] border border-red-900/60 hover:border-red-600 rounded-sm font-mono text-[11px] uppercase tracking-wider text-red-300 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                +10 BLOOD OZ
              </button>
              <button
                onClick={() => {
                  const targetWin = getRequiredScaleWinDamage();
                  const isBoneLordP2 = isBossMatch && bossState.type === 'BoneLord' && bossPhase === 2;

                  if (isBossMatch && (bossPhase === 1 || isBoneLordP2)) {
                    const nextPhase = bossPhase + 1;
                    setScale(0);
                    setBossPhase(nextPhase);
                    setIsPhaseTransition(true);
                    triggerSfx('victory');
                    setTimeout(() => setIsPhaseTransition(false), 2500);

                    // Wipe enemy battlefield clean entering Phase 2
                    setEnemyBoard([null, null, null, null]);
                    setEnemyQueue([null, null, null, null]);

                    if (bossState.type === 'Zealot') {
                      setPlayerBoard(prev => prev.map(slot => (slot === null ? cloneCard(ALL_CARD_LOOKUP['Stone Wall'], 0) : slot)));
                      let targetCol = 0;
                      let highestPower = -1;
                      for (let c = 0; c < 4; c++) {
                        const card = playerBoard[c];
                        if (card) {
                          const power = getCardAttack(card, c, true);
                          if (power > highestPower) {
                            highestPower = power;
                            targetCol = c;
                          }
                        }
                      }
                      const cleanQueue: (CardInstance | null)[] = [null, null, null, null];
                      cleanQueue[targetCol] = cloneCard(ALL_CARD_LOOKUP['Adder'], 0);
                      setEnemyQueue(cleanQueue);

                      setBossState((prev: any) => ({
                        ...prev,
                        phase: 2,
                        skipNextPlayerTurn: true,
                      }));
                      addLog("=== THE ZEALOT: PHASE 2 INITIALIZED ===");
                    } else if (bossState.type === 'The Begotten') {
                      let targetCol = 0;
                      let highestPower = -1;
                      for (let c = 0; c < 4; c++) {
                        const card = playerBoard[c];
                        if (card) {
                          const power = getCardAttack(card, c, true);
                          if (power > highestPower) {
                            highestPower = power;
                            targetCol = c;
                          }
                        }
                      }
                      setEnemyBoard(prev => {
                        const next = [...prev];
                        next[targetCol] = transformAmorphous(cloneCard(ALL_CARD_LOOKUP['Amoeba'], 0));
                        return next;
                      });
                      setBossState((prev: any) => ({ ...prev, phase: 2 }));
                      addLog("=== GOOBERT: PHASE 2 INITIALIZED ===");
                    } else if (bossState.type === 'BoneLord') {
                      if (bossPhase === 1) {
                        let targetCol = playerBoard.findIndex(c => c === null);
                        if (targetCol === -1) {
                          let maxAttack = -1;
                          for (let c = 0; c < 4; c++) {
                            const pCard = playerBoard[c];
                            if (pCard && pCard.attack > maxAttack) {
                              maxAttack = pCard.attack;
                              targetCol = c;
                            }
                          }
                        }
                        if (targetCol === -1) targetCol = 0;
                        setEnemyBoard(prev => {
                          const next = [...prev];
                          next[targetCol] = cloneCard(ALL_CARD_LOOKUP['Reaper'], 0);
                          return next;
                        });
                        setEnemyQueue(prev => {
                          const next = [...prev];
                          next[0] = cloneCard(ALL_CARD_LOOKUP['Felled Tree'] || ALL_CARD_LOOKUP['Stone Wall'], 0);
                          next[1] = cloneCard(ALL_CARD_LOOKUP['Skeleton'], 0);
                          return next;
                        });
                        setPlayerBoard(prev =>
                          prev.map((c, idx) => {
                            if (!c) return null;
                            const currentEffectiveAttack = getCardAttack(c, idx, true);
                            return {
                              ...c,
                              attack: Math.max(0, c.health || 0),
                              health: Math.max(1, currentEffectiveAttack),
                              sigils: Array.from(new Set([...c.sigils, 'Shadow'])),
                            };
                          })
                        );
                        setBossState((prev: any) => ({ ...prev, phase: 2, activeDialogue: null, bgHex: '#230618', bgTransitionDuration: 4 }));
                        addLog("=== THE BONE LORD: PHASE 2 INITIALIZED ===");
                      } else if (bossPhase === 2) {
                        setEnemyBoard([null, null, null, null]);
                        setEnemyQueue([null, null, null, null]);
                        setBossState((prev: any) => ({
                          ...prev,
                          phase: 3,
                          activeDialogue: null,
                          bgHex: '#300202',
                          bgTransitionDuration: 5,
                        }));
                        setTimeout(() => {
                          const bloodMoonCard = {
                            ...cloneCard(ALL_CARD_LOOKUP['BLOOD MOON'], 0),
                            id: `blood-moon-${Date.now()}`,
                          };
                          setEnemyBoard([bloodMoonCard, null, null, null]);
                          setIsBoardRumbling(true);
                          setIsBloodMoonDropping(true);
                          triggerSfx('hit');
                          if (typeof ChiptuneAudio !== 'undefined' && (ChiptuneAudio as any).playFinalBossPhase3) {
                            (ChiptuneAudio as any).playFinalBossPhase3(0.6);
                          }
                          setTimeout(() => {
                            setIsBoardRumbling(false);
                            setIsBloodMoonDropping(false);
                          }, 2400);
                        }, 1800);
                        addLog("=== THE BONE LORD: PHASE 3 INITIALIZED ===");
                      }
                    }

                    setTurnNumber(prev => prev + 1);
                    setPhase('DRAW');
                    setScreen('DUEL');
                  } else {
                    setScale(targetWin);
                    setScreen('DUEL');
                    handleWinMatch();
                  }
                }}
                className="py-2 px-3 border border-amber-950/60 hover:border-amber-700/70 font-mono text-xs uppercase tracking-widest text-amber-200/80 hover:text-amber-100 hover:tracking-[0.15em] transition-all cursor-pointer text-center"
              >
                TIP SCALES
              </button>
              <button
                onClick={() => setDevTab(devTab === 'ALTER_DECK' ? 'ACTIONS' : 'ALTER_DECK')}
                className="py-2 px-3 border border-amber-950/60 hover:border-amber-700/70 font-mono text-xs uppercase tracking-widest text-amber-200/80 hover:text-amber-100 hover:tracking-[0.15em] transition-all cursor-pointer text-center"
              >
                ALTER DECK
              </button>
              <button
                onClick={() => {
                  handleDevNewHand();
                  setScreen('DUEL');
                }}
                className="py-2 px-3 border border-amber-950/60 hover:border-amber-700/70 font-mono text-xs uppercase tracking-widest text-amber-200/80 hover:text-amber-100 hover:tracking-[0.15em] transition-all cursor-pointer text-center"
              >
                NEW HAND
              </button>
            </div>

            {/* Alter Deck View */}
            {devTab === 'ALTER_DECK' && (
              <div className="border border-amber-950/40 p-4 mb-6">
                <div className="text-[10px] uppercase tracking-widest text-amber-600 mb-1">--- ALTER MASTER DECK ---</div>
                <input
                  type="text"
                  placeholder="Search cards to add or swap..."
                  value={devCardSearch}
                  onChange={e => setDevCardSearch(e.target.value)}
                  className="w-full bg-transparent border-b border-amber-950/60 pb-1.5 text-xs text-amber-200 placeholder-stone-600 font-mono focus:outline-none focus:border-amber-600 mb-3"
                />
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto mb-3">
                  {MAIN_DECK_POOL.filter(c => {
                    const q = devCardSearch.toLowerCase();
                    return getCardDisplayName(c.name).toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
                  }).map(c => (
                    <button
                      key={c.name}
                      onClick={() => setDevAlterCard(c)}
                      className={`px-2 py-1 text-xs border font-mono transition cursor-pointer ${
                        devAlterCard?.name === c.name ? 'border-amber-500 text-amber-100 bg-amber-950/40' : 'border-amber-950/50 text-stone-400 hover:text-amber-200'
                      }`}
                    >
                      {getCardDisplayName(c.name)} {c.emoji}
                    </button>
                  ))}
                </div>

                {devAlterCard && (
                  <div className="p-3 border border-amber-950/50 mb-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-200 font-mono">Selected: {getCardDisplayName(devAlterCard.name)} ({devAlterCard.emoji})</span>
                      <button
                        onClick={() => {
                          setMasterDeck(prev => [...prev, cloneCard(devAlterCard, ouroborosBuffs)]);
                          addLog(`[DEV] Added ${getCardDisplayName(devAlterCard.name)} to Master Deck.`);
                          setDevAlterCard(null);
                        }}
                        className="text-xs uppercase font-mono tracking-widest text-emerald-400 hover:text-emerald-200 hover:tracking-[0.15em] transition cursor-pointer"
                      >
                        ADD TO DECK
                      </button>
                    </div>

                    {masterDeck.length > 0 && (
                      <div className="border-t border-amber-950/40 pt-2">
                        <span className="text-[10px] text-amber-600 font-mono uppercase tracking-wider block mb-1.5">
                          Or Swap With Card in Current Decklist:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {masterDeck.map((dCard, dIdx) => (
                            <button
                              key={`swap-${dCard.name}-${dIdx}`}
                              onClick={() => {
                                const nextDeck = [...masterDeck];
                                nextDeck[dIdx] = cloneCard(devAlterCard, ouroborosBuffs);
                                setMasterDeck(nextDeck);
                                addLog(`[DEV] Swapped ${getCardDisplayName(dCard.name)} with ${getCardDisplayName(devAlterCard.name)} in Master Deck.`);
                                setDevAlterCard(null);
                              }}
                              className="px-2 py-1 border border-amber-950/40 hover:border-amber-700 text-[11px] text-stone-400 hover:text-amber-200 font-mono transition flex items-center gap-1 cursor-pointer"
                              title={`Click to replace ${getCardDisplayName(dCard.name)} with ${getCardDisplayName(devAlterCard.name)}`}
                            >
                              <span>{getCardDisplayName(dCard.name)}</span>
                              <span className="text-stone-600 text-[10px]">({dCard.attack}/{dCard.health})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Game Directories (List All Cards & List All Sigils) */}
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-600 mb-2">--- COMPENDIUM DIRECTORIES & ARCHIVE ---</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => setDevTab(devTab === 'CARDS' ? 'ACTIONS' : 'CARDS')}
                className="py-2 px-3 border border-amber-950/60 hover:border-amber-700/70 font-mono text-xs uppercase tracking-widest text-amber-200/80 hover:text-amber-100 hover:tracking-[0.15em] transition-all cursor-pointer text-center"
              >
                [ LIST ALL CARDS ({MAIN_DECK_POOL.length + 8}) ]
              </button>
              <button
                onClick={() => setDevTab(devTab === 'SIGILS' ? 'ACTIONS' : 'SIGILS')}
                className="py-2 px-3 border border-amber-950/60 hover:border-amber-700/70 font-mono text-xs uppercase tracking-widest text-amber-200/80 hover:text-amber-100 hover:tracking-[0.15em] transition-all cursor-pointer text-center"
              >
                [ LIST ALL SIGILS ({Object.keys(SIGIL_MAPPING).length}) ]
              </button>
            </div>

            <div className="flex flex-col gap-2.5 p-3 mb-4 border border-red-950/60 bg-[#140908]/80 rounded-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  Archive: <span className="text-amber-200/90">{archive.seenCards.length}</span> Cards ·{' '}
                  <span className="text-amber-200/90">{archive.seenSigils.length}</span> Sigils ·{' '}
                  <span className="text-amber-200/90">{archive.defeatedBosses.length}</span> Bosses ·{' '}
                  <span className="text-amber-200/90">{archive.runsStarted}</span> Runs
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const vowsUnlocked = (archive.runsWon || 0) > 0 || (archive.defeatedBosses || []).includes('BoneLord');
                    return (
                      <button
                        onClick={() => {
                          if (vowsUnlocked) {
                            setArchive((prev: any) => {
                              const next = {
                                ...prev,
                                runsWon: 0,
                                defeatedBosses: (prev.defeatedBosses || []).filter((b: string) => b !== 'BoneLord'),
                              };
                              try { localStorage.setItem('sacrificial_scales_archive_v1', JSON.stringify(next)); } catch {}
                              return next;
                            });
                            setActiveVows?.([]);
                            triggerSfx('sacrifice');
                            addLog('[DEV] Ritual Vows re-sealed.');
                          } else {
                            setArchive((prev: any) => {
                              const bosses = Array.from(new Set([...(prev.defeatedBosses || []), 'BoneLord']));
                              const next = {
                                ...prev,
                                runsWon: Math.max(1, prev.runsWon || 0),
                                defeatedBosses: bosses,
                              };
                              try { localStorage.setItem('sacrificial_scales_archive_v1', JSON.stringify(next)); } catch {}
                              return next;
                            });
                            triggerSfx('victory');
                            addLog('[DEV] Ritual Vows unbound.');
                          }
                        }}
                        className={`py-1.5 px-3 border font-mono text-[10px] font-bold uppercase tracking-widest transition cursor-pointer ${
                          vowsUnlocked
                            ? 'bg-[#1a140c] hover:bg-[#261d11] border-amber-800/70 hover:border-amber-500 text-amber-300'
                            : 'bg-[#1f0b0d] hover:bg-[#2f1013] border-red-800/80 hover:border-red-400 text-red-200'
                        }`}
                      >
                        {vowsUnlocked ? 'RE-SEAL RITUAL VOWS' : 'UNLOCK RITUAL VOWS'}
                      </button>
                    );
                  })()}

                  {!devConfirmWipeArchive ? (
                    <button
                      onClick={() => setDevConfirmWipeArchive(true)}
                      className="py-1.5 px-3 bg-[#1d0b0a] hover:bg-[#2d100e] border border-red-900/70 hover:border-red-500 font-mono text-[10px] font-bold uppercase tracking-widest text-red-300 hover:text-red-100 transition cursor-pointer"
                    >
                      CLEAR COMPENDIUM & LEDGER
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const wiped = resetArchive();
                          setArchive(wiped);
                          setActiveVows?.([]);
                          setDevConfirmWipeArchive(false);
                          triggerSfx('sacrifice');
                          addLog('[DEV] Compendium, Ledger & Vows wiped clean.');
                        }}
                        className="py-1.5 px-3 bg-red-950/90 hover:bg-red-900 border border-red-500 font-mono text-[10px] font-bold uppercase tracking-widest text-red-100 transition cursor-pointer"
                      >
                        CONFIRM FULL WIPE
                      </button>
                      <button
                        onClick={() => setDevConfirmWipeArchive(false)}
                        className="py-1.5 px-2.5 border border-stone-700 hover:border-stone-500 font-mono text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-200 transition cursor-pointer"
                      >
                        CANCEL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Card Art Inspector with Search */}
            {devTab === 'CARDS' && (() => {
              const term = devCardsFilter.trim().toLowerCase();
              const filteredCards = Object.values(ALL_CARD_LOOKUP)
                .filter(c => {
                  if (!term) return true;
                  const nameMatches = getCardDisplayName(c.name).toLowerCase().includes(term) || c.name?.toLowerCase().includes(term);
                  const classMatches = c.class?.toLowerCase().includes(term);
                  const sigilMatches = (c.sigils || []).some(s => s?.toLowerCase().includes(term));
                  const costMatches =
                    (c.cost !== undefined && String(c.cost) === term) ||
                    (c.boneCost !== undefined && String(c.boneCost) === term);
                  return nameMatches || classMatches || sigilMatches || costMatches;
                })
                .sort((a, b) => getCardDisplayName(a.name).localeCompare(getCardDisplayName(b.name)));

              const getCleanAssetPath = (card: CardDef) => {
                if (card.name?.toLowerCase().includes('moon')) {
                  return 'public/assets/cardbases/blood_moon.webp';
                }
                const raw = getCardArtUrl(card) || '';
                const file = raw.split('/').pop()?.split('?')[0] || 'missing.png';
                return `public/assets/cardart/${file}`;
              };

              return (
                <div className="border border-amber-950/40 p-3 mb-6">
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search cards by name, tribe, cost, or sigil..."
                      value={devCardsFilter}
                      onChange={e => setDevCardsFilter(e.target.value)}
                      className="w-full bg-transparent border-b border-amber-950/60 pb-1.5 pr-8 text-xs text-amber-200 placeholder-stone-600 font-mono focus:outline-none focus:border-amber-600"
                    />
                    {devCardsFilter && (
                      <button
                        onClick={() => setDevCardsFilter('')}
                        className="absolute right-2 top-0.5 text-xs text-stone-500 hover:text-amber-200 font-mono cursor-pointer"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="text-[10px] text-stone-500 font-mono mb-3 flex justify-between">
                    <span>Showing {filteredCards.length} cards — click any card to inspect art</span>
                    {devCardsFilter && <span className="text-amber-400">Filter active</span>}
                  </div>

                  {/* Enlarged Photoshop Audit Spotlight */}
                  {devInspectCard && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#120d0a] border border-amber-700/50 rounded-sm p-4 mb-4">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="transform scale-125 origin-center my-4 mx-3">
                          {renderCard(devInspectCard, { showCost: true })}
                        </div>
                        <div className="text-left font-mono space-y-1.5">
                          <div className="text-sm font-bold text-amber-200 uppercase tracking-wider">
                            {getCardDisplayName(devInspectCard.name)}
                            {getCardDisplayName(devInspectCard.name) !== devInspectCard.name && (
                              <span className="ml-2 text-[10px] text-stone-500 normal-case">({devInspectCard.name})</span>
                            )}
                          </div>
                          <div className="text-xs text-emerald-400">
                            File:{' '}
                            <span className="select-all">
                              {getCleanAssetPath(devInspectCard)}
                            </span>
                          </div>
                          <div className="text-xs text-amber-400/80">
                            Offset: {CARD_ART_OFFSETS[devInspectCard.name] || 'none'}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            Tribe: {devInspectCard.class} | ATK/HP: {devInspectCard.attack}/{devInspectCard.health} | Sigils:{' '}
                            {devInspectCard.sigils?.join(', ') || 'None'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setDevInspectCard(null)}
                        className="self-start sm:self-center px-3 py-1.5 text-[11px] uppercase tracking-widest bg-[#1c1410] hover:bg-[#2a1e18] border border-[#3a2a20] text-[#cfb794] rounded-sm cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {/* Visual Card Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[55vh] overflow-y-auto p-2 bg-[#090705]/80 border border-amber-950/30 rounded-sm">
                    {filteredCards.map(c => {
                      const fileName = getCleanAssetPath(c).split('/').pop() || 'missing.png';
                      const offset = CARD_ART_OFFSETS[c.name];
                      const isInspected = devInspectCard?.name === c.name;

                      return (
                        <div
                          key={c.name}
                          onClick={() => setDevInspectCard(c)}
                          className={`flex flex-col items-center p-2 rounded-sm border transition-colors cursor-pointer ${
                            isInspected
                              ? 'bg-amber-950/30 border-amber-500/70'
                              : 'bg-[#110c09]/90 border-[#261c15] hover:border-amber-700/60'
                          }`}
                        >
                          <div className="pointer-events-none">
                            {renderCard(c, { showCost: true })}
                          </div>
                          <span className="mt-2 text-[10px] font-mono text-amber-200/90 truncate max-w-full select-all">
                            {fileName}
                          </span>
                          {offset && (
                            <span className="mt-0.5 text-[9px] font-mono text-cyan-400/80 truncate max-w-full">
                              {offset}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* List All Sigils Grid */}
            {devTab === 'SIGILS' && (
              <div className="border border-amber-950/40 p-3 max-h-56 overflow-y-auto mb-6 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(SIGIL_MAPPING).map(([s, icon]) => (
                    <div
                      key={s}
                      onClick={() => setSigilDetailModal({ name: s, desc: SIGIL_DESCRIPTIONS[s] || 'Ancient sigil.' })}
                      className="p-2 border border-amber-950/50 hover:border-amber-700/60 cursor-pointer hover:bg-amber-950/20 flex items-center justify-between"
                    >
                      <span className="font-bold text-amber-300">{s} {icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-amber-950/40 font-mono">
              <button
                onClick={() => {
                  setStartingBones(0);
                  startingBonesRef.current = 0;
                  setBones(0);
                  setScreen('SPLASH');
                  addLog("[DEV] Run restarted.");
                }}
                className="flex-1 py-2 bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#2f241c] rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-widest text-amber-300/80 hover:text-amber-100 cursor-pointer text-center"
              >
                RESTART RUN
              </button>
              <button
                onClick={() => setScreen(previousScreen || 'DUEL')}
                className="flex-1 py-2 bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#2f241c] rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-widest text-[#cfb794] hover:text-[#f3ede2] cursor-pointer text-center"
              >
                CLOSE CONSOLE
              </button>
            </div>
          </div>
        </div>
  );
}
