import React from 'react';
import type { CardDef, Tribe } from '../data/gameData';
import { ALL_ITEMS } from '../data/gameData';
import MapScreen from '../components/MapScreen';
import { generateActMap, getBossForAct } from '../data/mapGenerator';
import { ALL_CARD_LOOKUP, SIGIL_DESCRIPTIONS, SIGIL_MAPPING, getSigilArtUrl } from '../data/gameData';

export default function EventScreens({ ctx }: { ctx: {
  draftPlayerDeck: any[];
  draftTradePool: any[];
  items: any[];
  itemChoices: any[];
  masterDeck: any[];
  flockSheepList: any[];
  carvingTribes: any[];
  costChoices: any[];
  caveDrawnCards: any[];
  caveTrials: any[];
  caveRewardCards: any[];
  totemRewardChoices: any[];
  totemPieces: any[];
  choiceCards: any[];
  deck: any[];
  [key: string]: any;
} }) {
  const {
    BASE,
    getScreenBgStyle,
    TRIBE_EMBROIDERY,
    cloneCard,
    applyPlayerTotem,
    transformAmorphous,
    CAVE_TRIAL_RULES,
    FLOCK_OPTIONS,
    ITEM_COSTS,
    actMap,
    activeTotem,
    activeVows,
    addLog,
    altarAnimPhase,
    altarHostId,
    altarSacrificeId,
    altarStageCards,
    anvilSelectedId,
    anvilStrikeAnim,
    applyAltarTransfer,
    applyAnvilStrike,
    applyCampfireWarm,
    applyFlockOption,
    assemblyBodyIdx,
    assemblyHeadIdx,
    blood,
    boneLordAnimPhase,
    boneLordSelectedIdx,
    boneLordStageData,
    cacheConsolationCard,
    campfireAnimState,
    campfireBuffType,
    campfireCardIdx,
    campfireHolding,
    campfireStage,
    canAnvilBloodToBone,
    canAnvilHollow,
    carvingPickedTribe,
    carvingSummonedCard,
    carvingTribes,
    caveDrawnCards,
    cavePassed,
    caveRevealCount,
    caveRewardCards,
    caveSelectedRewardIdx,
    caveSelectedTrial,
    caveShowRewards,
    caveTrials,
    caveVerdictReady,
    choiceCards,
    choiceDealGen,
    choiceRerollsLeft,
    choiceSelectedIdx,
    claimCarvingTribe,
    claimCostBargain,
    claimMycologistDuplicate,
    confirmBoneLordOffering,
    confirmFlockDeckRemovals,
    confirmGoobertClone,
    confirmMycologistCombine,
    costBargainPickedType,
    costBargainRevealedCard,
    costChoices,
    deck,
    draftFlippingDown,
    draftFlippingUp,
    draftPlayerDeck,
    draftRevealedIndices,
    draftSelectedDeckIdx,
    draftSelectedTradeIdx,
    draftTradePool,
    draftTradesLeft,
    effigyStitchingAnim,
    evaluateCaveTrial,
    executeDraftTrade,
    finalizeDraft,
    flockPendingRemovals,
    flockRemovalSelectedIds,
    flockRepicksUsed,
    flockSelectedSheepId,
    flockSheepList,
    goobertOriginalSnapshot,
    goobertSelectedIdx,
    goobertStampedCard,
    goobertStamping,
    handleConfirmConsolation,
    handleFlockRepick,
    handleLeaveCache,
    handleSelectItem,
    handleSelectMapNode,
    hasMoreSigilsThanOriginal,
    hoarderSelectedIdx,
    hoveredTotemRewardIdx,
    isCampfireSafe,
    isEventBusy,
    isTotemFadingOut,
    itemChoices,
    items,
    masterDeck,
    masterDeckRef,
    menuFadingOut,
    mycoAnimPhase,
    mycoHasDuplicates,
    mycoOfferedCard,
    mycoSelectedIndices,
    mycoStageCards,
    openDevMenu,
    openViewDeck,
    previousScreen,
    renderActWeather,
    renderCard,
    rerollCardChoice,
    returnToMap,
    runSeed,
    scale,
    scheduleEventTimer,
    screen,
    setShowPauseMenu,
    selectedDeckCardDetail,
    selectedTotemRewardIdx,
    setActiveTotem,
    setAltarHostId,
    setAltarSacrificeId,
    setAnvilSelectedId,
    setAssemblyBodyIdx,
    setAssemblyHeadIdx,
    setBoneLordSelectedIdx,
    setCampfireCardIdx,
    setCaveSelectedRewardIdx,
    setChoiceSelectedIdx,
    setDeck,
    setDraftSelectedDeckIdx,
    setDraftSelectedTradeIdx,
    setEffigyStitchingAnim,
    setFlockRemovalSelectedIds,
    setFlockSelectedSheepId,
    setGoobertSelectedIdx,
    setHand,
    setHoarderSelectedIdx,
    setHoveredTotemRewardIdx,
    setIsEventBusy,
    setIsTotemFadingOut,
    setMasterDeck,
    setMycoSelectedIndices,
    setScreen,
    setSelectedDeckCardDetail,
    setSelectedTotemRewardIdx,
    setShowViewDeck,
    setTotemChoicesHidden,
    setTotemPieces,
    setTotemStage,
    showDevTools,
    showViewDeck,
    stage,
    startingBones,
    totalOverkillDamage,
    totemChoicesHidden,
    totemPieces,
    totemRewardChoices,
    totemStage,
    triggerSfx
  } = ctx;

  return (
    <>
      {screen === 'DRAFT' && (() => {
        const selectedPeltCard =
          draftSelectedDeckIdx !== null ? draftPlayerDeck[draftSelectedDeckIdx] : null;
        const selectedShopCard =
          draftSelectedTradeIdx !== null ? draftTradePool[draftSelectedTradeIdx] : null;
        const canConfirmTrade =
          draftSelectedDeckIdx !== null &&
          draftSelectedTradeIdx !== null &&
          draftTradesLeft > 0 &&
          !draftFlippingDown &&
          !draftFlippingUp;
        const canVentureOnward =
          !draftPlayerDeck.some(c => c.name === "Trade Pelt") && draftTradesLeft <= 0;

        const statusPrompt = canVentureOnward
          ? 'The bargain is struck.'
          : canConfirmTrade && selectedShopCard
            ? `Barter Pelt for ${selectedShopCard.name}`
            : selectedPeltCard
              ? 'Claim an offering from the table'
              : selectedShopCard
                ? `Offer a Pelt for ${selectedShopCard.name}`
                : 'Offer a Pelt';

        const renderPlayerDraftSlot = (c: CardDef, idx: number) => {
          const isSelected = draftSelectedDeckIdx === idx;
          const canTradePelt =
            c.name === "Trade Pelt" &&
            draftTradesLeft > 0 &&
            !draftFlippingDown &&
            !draftFlippingUp;
          return (
            <div
              key={c.id || `draft-p-${c.name}-${idx}`}
              className="relative w-[56px] h-[80px] sm:w-[88px] sm:h-[124px] lg:w-[124px] lg:h-[174px] shrink-0 flex items-center justify-center"
            >
              <div
                onClick={() => {
                  if (canTradePelt) {
                    setDraftSelectedDeckIdx(draftSelectedDeckIdx === idx ? null : idx);
                  }
                }}
                className={`relative transform origin-center transition-all duration-200 ${
                  canTradePelt
                    ? "cursor-pointer"
                    : "opacity-75 saturate-[0.82] cursor-default"
                } ${
                  isSelected
                    ? "scale-[0.54] sm:scale-[0.82] lg:scale-[1.13] -translate-y-1 lg:-translate-y-2 z-30"
                    : canTradePelt
                      ? "scale-[0.48] sm:scale-[0.76] lg:scale-[1.06] hover:scale-[0.52] sm:hover:scale-[0.80] lg:hover:scale-[1.11] hover:-translate-y-1 [filter:drop-shadow(0_0_2px_rgba(229,193,107,0.75))_drop-shadow(0_0_8px_rgba(212,175,55,0.32))]"
                      : "scale-[0.48] sm:scale-[0.76] lg:scale-[1.06]"
                }`}
              >
                {isSelected && (
                  <span className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-[2px] bg-[#1a130b]/95 border border-[#c89e4c]/85 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#f4d78b] whitespace-nowrap shadow-md">
                    Offering
                  </span>
                )}
                {renderCard(c, { isSelected, isClickable: canTradePelt, disableHoverScale: true })}
              </div>
            </div>
          );
        };

        const renderMerchantDraftSlot = (c: CardDef | null, idx: number) => {
          if (c === null) {
            return (
              <div
                key={`draft-slot-empty-${idx}`}
                className="relative w-[56px] h-[80px] sm:w-[88px] sm:h-[124px] lg:w-[124px] lg:h-[174px] shrink-0 flex items-center justify-center select-none pointer-events-none"
              >
                <div className="w-[52px] h-[74px] sm:w-[82px] sm:h-[116px] lg:w-[114px] lg:h-[162px] rounded-[3px] border border-dashed border-[#4e3b2b]/55 bg-[#080605]/55 shadow-[inset_0_2px_12px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center gap-1">
                  <span className="text-[9px] font-['Cinzel',_serif] uppercase tracking-[0.25em] text-[#6e5642]/70">
                    Claimed
                  </span>
                </div>
              </div>
            );
          }

          const isRevealed = draftRevealedIndices.includes(idx);
          const isSelected = draftSelectedTradeIdx === idx;

          if (!isRevealed) {
            return (
              <div
                key={`draft-back-${idx}`}
                className="relative w-[56px] h-[80px] sm:w-[88px] sm:h-[124px] lg:w-[124px] lg:h-[174px] shrink-0 flex items-center justify-center select-none pointer-events-none"
              >
                <div
                  className={`w-[52px] h-[74px] sm:w-[82px] sm:h-[116px] lg:w-[114px] lg:h-[162px] rounded-[3px] transition-all duration-200 ${
                    draftFlippingDown ? 'animate-flip-down' : 'opacity-65 filter brightness-75'
                  }`}
                >
                  <div
                    className="w-full h-full rounded-[3px] shadow-[0_8px_14px_rgba(0,0,0,0.9)] border border-[#2a1d13]"
                    style={{
                      backgroundImage: `url(${BASE}/assets/cardbases/cardbacks.png)`,
                      backgroundSize: '100% 100%',
                    }}
                  />
                </div>
              </div>
            );
          }

          return (
            <div
              key={c.id || `draft-t-${c.name}-${idx}`}
              className="relative w-[56px] h-[80px] sm:w-[88px] sm:h-[124px] lg:w-[124px] lg:h-[174px] shrink-0 flex items-center justify-center"
            >
              <div
                onClick={() => {
                  if (draftFlippingDown || draftFlippingUp) return;
                  setDraftSelectedTradeIdx(draftSelectedTradeIdx === idx ? null : idx);
                }}
                className={`relative cursor-pointer transform origin-center transition-all duration-200 ${
                  draftFlippingUp ? 'animate-flip-up' : ''
                } ${
                  isSelected
                    ? "scale-[0.54] sm:scale-[0.82] lg:scale-[1.13] -translate-y-1 lg:-translate-y-2 z-30 [filter:drop-shadow(0_0_3px_#fca5a5)_drop-shadow(0_0_8px_#dc2626)_drop-shadow(0_0_14px_rgba(185,28,28,0.65))] brightness-105"
                    : "scale-[0.48] sm:scale-[0.76] lg:scale-[1.06] hover:scale-[0.52] sm:hover:scale-[0.80] lg:hover:scale-[1.11] hover:-translate-y-1"
                }`}
              >
                {isSelected && (
                  <span className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-[2px] bg-[#1e0d0c]/95 border border-[#b95a4b]/85 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#f4b0a4] whitespace-nowrap shadow-md">
                    Claiming
                  </span>
                )}
                {renderCard(c, { isSelected: false, isClickable: true, disableHoverScale: true })}
              </div>
            </div>
          );
        };

        return (
          <div
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between gap-1.5 sm:gap-2 lg:gap-4 px-1.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-4 overflow-hidden font-mono select-none"
            style={getScreenBgStyle('draft.jpg')}
          >
            {/* Atmospheric Dark Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,10,14,0.18)_0%,rgba(6,5,7,0.84)_100%)] pointer-events-none z-0" />

            {/* Header & Ritual Status */}
            <div className="relative z-10 flex flex-col items-center text-center shrink-0">
              <h1 className="text-sm sm:text-xl lg:text-2xl font-['Cinzel',_serif] text-[#e5c57c] tracking-[0.12em] sm:tracking-[0.18em] italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                · Fortasse propositum facultates tuas superat ·
              </h1>
              <div className="mt-1.5 flex items-center gap-3 px-4 py-1 rounded-[2px] bg-[#0b0807]/80 border border-[#3a2a1e]/80 backdrop-blur-[2px]">
                <span className="font-['Cinzel',_serif] text-xs tracking-[0.14em] text-[#e5cfa8]">
                  {statusPrompt}
                </span>
                <span className="h-3 w-px bg-[#4a3728]/80" />
                <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${
                  draftTradesLeft > 0 ? 'text-[#e5c16b]' : 'text-emerald-400/85'
                }`}>
                  {draftTradesLeft > 0 ? `${draftTradesLeft} ${draftTradesLeft === 1 ? 'Pelt' : 'Pelts'}` : 'Settled'}
                </span>
              </div>
            </div>

            {/* Dual Smoked-Wood & Iron Tabletop Trays (Snug Fit) */}
            <div className="relative z-10 flex flex-row flex-nowrap justify-center items-stretch gap-1.5 sm:gap-3 lg:gap-5 my-auto max-w-full" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}>
              {/* Left Tray: Player's Starter Deck */}
              <div className="relative flex flex-col items-center px-1.5 sm:px-3 lg:px-5 pt-1.5 sm:pt-2 lg:pt-3 pb-2 sm:pb-2.5 lg:pb-4 rounded-[3px] bg-[#0c0908]/78 border border-[#3d2d20]/85 shadow-[0_16px_38px_rgba(0,0,0,0.84),inset_0_1px_0_rgba(255,228,185,0.06)] backdrop-blur-[2px]">
                <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#7c5d3b]/65" />
                <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#7c5d3b]/65" />
                <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#7c5d3b]/65" />
                <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#7c5d3b]/65" />

                <div className="shrink-0 w-full flex items-center justify-between pb-1 sm:pb-1.5 lg:pb-2 mb-1.5 sm:mb-2 lg:mb-3 border-b border-[#3a2a1e]/75">
                  <h2 className="text-[9px] sm:text-[10px] lg:text-xs font-['Cinzel',_serif] font-bold text-[#e5c78a] uppercase tracking-[0.14em] lg:tracking-[0.26em]">
                    Your Satchel
                  </h2>
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#a98d68]/75">
                    {draftPlayerDeck.filter(c => c.name === "Trade Pelt").length} Pelts
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 lg:gap-3 my-auto">
                  <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                    {draftPlayerDeck.slice(0, 3).map((c, sliceIdx) => renderPlayerDraftSlot(c, sliceIdx))}
                  </div>
                  <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                    {draftPlayerDeck.slice(3).map((c, sliceIdx) => renderPlayerDraftSlot(c, sliceIdx + 3))}
                  </div>
                </div>
              </div>

              {/* Right Tray: Trader's Table */}
              <div className="relative flex flex-col items-center px-1.5 sm:px-3 lg:px-5 pt-1.5 sm:pt-2 lg:pt-3 pb-2 sm:pb-2.5 lg:pb-4 rounded-[3px] bg-[#0c0908]/78 border border-[#422823]/85 shadow-[0_16px_38px_rgba(0,0,0,0.84),inset_0_1px_0_rgba(255,205,190,0.05)] backdrop-blur-[2px]">
                <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#8a4c42]/65" />
                <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#8a4c42]/65" />
                <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#8a4c42]/65" />
                <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#8a4c42]/65" />

                <div className="shrink-0 w-full flex items-center justify-between pb-1 sm:pb-1.5 lg:pb-2 mb-1.5 sm:mb-2 lg:mb-3 border-b border-[#3f2622]/75">
                  <h2 className="text-[9px] sm:text-[10px] lg:text-xs font-['Cinzel',_serif] font-bold text-[#e2a498] uppercase tracking-[0.14em] lg:tracking-[0.26em]">
                    The Trader&rsquo;s Table
                  </h2>
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#b47c72]/80">
                    {draftRevealedIndices.length} Revealed
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 lg:gap-3 my-auto">
                  <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                    {draftTradePool.slice(0, 4).map((c, idx) => renderMerchantDraftSlot(c, idx))}
                  </div>
                  <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                    {draftTradePool.slice(4, 8).map((c, sliceIdx) => renderMerchantDraftSlot(c, sliceIdx + 4))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grounded Tactile Action Bar */}
            <div className="relative z-10 flex items-center gap-2.5 sm:gap-4 px-3 sm:px-5 py-1.5 lg:py-2 rounded-[3px] bg-[#0c0807]/88 border border-[#3a2a1e]/80 shadow-[0_10px_28px_rgba(0,0,0,0.88)] backdrop-blur-[2px] shrink-0">
              <button
                onClick={executeDraftTrade}
                disabled={!canConfirmTrade}
                className={`rounded-[2px] border transition-all duration-150 font-['Cinzel',_serif] font-bold text-[10px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.22em] px-3.5 sm:px-6 py-2 select-none ${
                  canConfirmTrade
                    ? 'bg-[#2c1512] hover:bg-[#3c1b17] active:translate-y-[1px] border-[#c46c56] text-[#ffe8d6] shadow-[0_2px_0_#0b0504,0_0_18px_rgba(196,108,86,0.28),inset_0_1px_0_rgba(255,220,200,0.18)] cursor-pointer'
                    : 'bg-[#15100d]/90 border-[#2f241c] text-[#7a6957] opacity-55 cursor-not-allowed'
                }`}
              >
                Strike Bargain
              </button>

              <div className="h-5 w-px bg-[#3a2a1e]/80" />

              <button
                onClick={finalizeDraft}
                disabled={!canVentureOnward}
                className={`rounded-[2px] border transition-all duration-150 font-['Cinzel',_serif] font-bold text-[10px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.22em] px-3.5 sm:px-6 py-2 select-none ${
                  canVentureOnward
                    ? 'bg-[#271d12] hover:bg-[#362717] active:translate-y-[1px] border-[#d4af37]/90 text-[#fff2cf] shadow-[0_2px_0_#0b0704,0_0_20px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,240,190,0.22)] cursor-pointer'
                    : 'bg-[#15100d]/90 border-[#2f241c] text-[#7a6957] opacity-55 cursor-not-allowed'
                }`}
              >
                Venture Onward
              </button>
            </div>
          </div>
        );
      })()}
      {/* Floating persistent Dev Tools & Deck access during all events */}
      {screen.startsWith('EVENT_') && (
        <div className="fixed top-3 right-4 z-[60] flex items-center gap-3 select-none">
          <button
            onClick={openViewDeck}
            className="relative bg-[#100e10]/92 hover:bg-[#19161a] active:bg-[#0b0a0c] border border-[#4a413b]/85 hover:border-[#b59c7c]/85 rounded-[2px] shadow-[0_6px_16px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] transition-all duration-100 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-[0.2em] text-[#d6c2a5] hover:text-[#f6ead8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed px-3.5 py-1.5"
          >
            <span className="pointer-events-none absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#8f7960]/65" />
            <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#8f7960]/65" />
            DECK ({masterDeck.length})
          </button>
          {showDevTools && (
              <button
                onClick={openDevMenu}
                className="relative w-38 sm:w-40 bg-[#100e10]/92 hover:bg-[#19161a] active:bg-[#0b0a0c] border border-[#4a413b]/85 hover:border-[#b59c7c]/85 rounded-[2px] shadow-[0_6px_16px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] transition-all duration-100 font-['Cinzel',_serif] font-bold text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#d6c2a5] hover:text-[#f6ead8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 flex items-center justify-center gap-2"
                title="Development Tools"
              >
                <span className="pointer-events-none absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#8f7960]/65" />
                <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#8f7960]/65" />
                <span>DEV TOOLS</span>
              </button>
            )}
        </div>
      )}

      {/* =========================================================================
          CROSSROADS EVENT ROUTER SCREEN
         ========================================================================= */}
      {screen === 'EVENT_CROSSROADS' && (
        <MapScreen
          mapData={
            actMap ||
            generateActMap(
              Math.max(1, Math.min(4, stage)),
              getBossForAct(Math.max(1, Math.min(4, stage)), runSeed || undefined),
              masterDeck.length,
              { seed: runSeed || undefined, allEliteRow2: activeVows.includes('all_elite_row2') }
            )
          }
          bgStyle={getScreenBgStyle('crossroads-select.jpg')}
          deckSize={masterDeck.length}
          overkillBlood={totalOverkillDamage}
          startingBones={startingBones}
          activeTotem={activeTotem}
          runSeed={runSeed}
          activeVows={activeVows}
          onSelectNode={handleSelectMapNode}
          onOpenPauseMenu={() => setShowPauseMenu(true)}
        />
      )}

      {/* =========================================================================
          EVENT: SURPLUS CACHE (ITEM BARTER)
         ========================================================================= */}
      {screen === 'EVENT_ITEMS' && (() => {
        const satchelFull = items.findIndex(s => s === null) === -1;
        const canAffordAny = itemChoices.some(id => totalOverkillDamage >= (ITEM_COSTS[id] ?? 3));
        const cannotBuyMore = satchelFull || !canAffordAny || itemChoices.length === 0;

        return (
          <div
            className="fixed inset-0 bg-[#070504] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden select-none font-mono animate-fade-up"
            style={getScreenBgStyle('merchant_event.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.34)_0%,rgba(5,3,2,0.92)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_items')}

            {cacheConsolationCard ? (
              /* Consolation Card Showcase Plaque */
              <div className="relative z-10 flex flex-col items-center justify-center max-w-md w-full h-full text-center animate-menu-fade-in">
                <div className="flex items-center gap-3.5 mb-1">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    Barter Exhausted
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold text-[#efe0be] uppercase tracking-[0.2em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Peddler&apos;s Token
                </h1>
                <p className="mt-2 font-['Cinzel',_serif] text-sm sm:text-base italic tracking-[0.08em] text-[#e5cfa8]">
                  A parting gift slides across the wood.
                </p>

                <div className="relative my-6 p-6 rounded-[3px] bg-[#0d0806]/84 border border-[#4a3220]/90 shadow-[0_20px_50px_rgba(0,0,0,0.92)]">
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9a7342]/75" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9a7342]/75" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9a7342]/75" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9a7342]/75" />
                  <div className="transform scale-110 pointer-events-none">
                    {renderCard(cacheConsolationCard, { isClickable: false, disableHoverScale: true })}
                  </div>
                </div>

                <button
                  onClick={handleConfirmConsolation}
                  className="px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#2b1a10] to-[#170e09] hover:from-[#3a2315] hover:to-[#1f130c] active:translate-y-[1px] border border-[#b48844]/85 hover:border-[#e5c16b] text-[#f3dfb6] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all"
                >
                  Claim &amp; Press Forward
                </button>
              </div>
            ) : (
              /* Grounded Peddler's Timber Cabinet & Live Relic Counter */
              <div className="relative z-10 max-w-4xl w-full my-auto flex flex-col items-center justify-center gap-4">
                {/* Top Header */}
                <div className="flex flex-col items-center text-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                      The Peddler&apos;s Cart
                    </span>
                    <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  </div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                    Relic Cache
                  </h1>
                </div>

                {/* Main Timber Display Cabinet */}
                <div
                  className="relative w-full flex flex-col justify-between rounded-[4px] border-2 border-[#4d3522]/90 shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,224,178,0.08)] px-5 sm:px-7 py-5 overflow-hidden"
                  style={{
                    backgroundColor: '#110b07',
                    backgroundImage: `linear-gradient(to bottom, rgba(22,14,9,0.76), rgba(15,10,6,0.82), rgba(8,5,3,0.9)), url("${import.meta.env.BASE_URL || './'}assets/text/wood.jpg")`,
                    backgroundSize: 'cover, 200px 200px',
                    backgroundRepeat: 'no-repeat, repeat',
                  }}
                >
                  {/* Top Timber Cornice with Flanking Hanging Lanterns */}
                  <div className="relative z-20 flex items-center justify-between border-b border-[#3f2b1c] pb-2.5 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <svg viewBox="0 0 24 28" className="w-5 h-6 text-amber-400/90 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M12 2V6M7 7H17L19 20H5L7 7Z" />
                        <ellipse cx="12" cy="14" rx="2.5" ry="4" fill="#fbbf24" opacity="0.85" />
                        <path d="M6 20H18M9 23H15" />
                      </svg>
                      <span className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.22em] text-[#d6be96]">
                        Wares on the Shelf
                      </span>
                    </div>

                    {/* Glass Blood Vial Counter */}
                    <div className="flex items-center gap-2.5 px-3.5 py-1 rounded-[2px] bg-[#140908]/95 border border-[#6e241d]/85 shadow-inner">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-[#c7a896] font-bold">Blood Bank</span>
                      <span className="h-3.5 w-px bg-[#5e241e]" />
                      <span className="font-['Cinzel',_serif] text-base font-black text-red-400 tracking-wider">
                        {totalOverkillDamage}
                      </span>
                      <span className="text-[9.5px] uppercase font-bold text-red-400/75">OZ</span>
                    </div>
                  </div>

                  {/* Three Recessed Velvet Shelf Cubbies */}
                  <div className="relative z-10 flex items-center justify-center py-5">
                    {itemChoices.length === 0 ? (
                      <div className="font-['Cinzel',_serif] text-base tracking-[0.14em] text-[#a89074]/80 italic">
                        Picked clean.
                      </div>
                    ) : (
                      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-stretch">
                        {itemChoices.map(itemId => {
                          const def = ALL_ITEMS[itemId as keyof typeof ALL_ITEMS];
                          const cost = ITEM_COSTS[itemId] ?? 3;
                          const canAfford = totalOverkillDamage >= cost && !satchelFull;

                          return (
                            <button
                              key={itemId}
                              type="button"
                              disabled={!canAfford}
                              onClick={() => handleSelectItem(itemId)}
                              className={`relative p-4 sm:p-5 rounded-[3px] border flex flex-col items-center justify-between text-center transition-all duration-200 overflow-hidden ${
                                canAfford
                                  ? 'border-[#5e3d26]/90 hover:border-[#e5c16b] hover:-translate-y-1.5 shadow-[inset_0_12px_28px_rgba(0,0,0,0.85),0_12px_26px_rgba(0,0,0,0.9)] hover:shadow-[0_16px_34px_rgba(212,175,55,0.22)] group cursor-pointer'
                                  : 'border-[#38271b] opacity-60 cursor-not-allowed shadow-inner'
                              }`}
                              style={{
                                backgroundColor: '#120a07',
                                backgroundImage: `radial-gradient(ellipse at 50% 20%, rgba(44,24,18,0.52) 0%, rgba(14,8,6,0.78) 80%), url("${import.meta.env.BASE_URL || './'}assets/text/cloth.jpg")`,
                                backgroundSize: 'cover, 160px 160px',
                                backgroundRepeat: 'no-repeat, repeat',
                              }}
                            >
                              {/* Velvet Backing Glow */}
                              <div
                                className="pointer-events-none absolute inset-0 opacity-30 group-hover:opacity-75 transition-opacity"
                                style={{
                                  background: 'radial-gradient(circle at 50% 28%, rgba(212,175,55,0.22) 0%, transparent 68%)',
                                }}
                              />

                              <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 mb-3 rounded-full bg-[#0e0907] border border-[#523723] group-hover:border-[#d4af37]/90 flex items-center justify-center text-3xl shadow-[inset_0_0_14px_rgba(0,0,0,0.95)] transition-colors">
                                  <span className="group-hover:scale-110 transition-transform">{def.emoji}</span>
                                </div>
                                <div className="font-['Cinzel',_serif] text-sm font-bold text-[#f2ddb7] group-hover:text-white uppercase tracking-[0.15em] mb-1.5">
                                  {def.name}
                                </div>
                                <div className="w-9 h-px bg-gradient-to-r from-transparent via-[#8c673c]/80 to-transparent mb-2" />
                                <div className="text-[10.5px] text-[#c4b096]/90 leading-relaxed mb-3">
                                  {def.description}
                                </div>
                              </div>

                              {/* Stamped Wax Blood Price Tag */}
                              <div
                                className={`relative z-10 mt-auto w-full py-1.5 rounded-[2px] border text-[11px] font-bold uppercase tracking-[0.2em] ${
                                  totalOverkillDamage >= cost
                                    ? 'border-red-800/90 bg-red-950/60 text-red-200'
                                    : 'border-[#2d2119] bg-[#120d0a] text-[#706052]'
                                }`}
                              >
                                🩸 {cost} OZ
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Lower Countertop Rail: Your Physical Relic Belt Slots */}
                  <div className="relative z-20 border-t border-[#3f2b1c] pt-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-[#b59c80]">
                        Your Relics ({items.filter(s => s !== null).length}/{items.length})
                      </span>
                      <div className="flex items-center gap-2">
                        {items.map((slotItem, sIdx) => {
                          const slotDef = slotItem ? ALL_ITEMS[slotItem as keyof typeof ALL_ITEMS] : null;
                          return (
                            <div
                              key={sIdx}
                              title={slotDef ? `${slotDef.name}: ${slotDef.description}` : 'Empty Relic Slot'}
                              className={`w-10 h-10 rounded-[3px] border flex items-center justify-center text-lg transition-all ${
                                slotDef
                                  ? 'bg-[#1a110b] border-[#8c673c]/85 shadow-[inset_0_0_10px_rgba(0,0,0,0.85)]'
                                  : 'bg-[#0c0806]/80 border-dashed border-[#4a3524]/70 text-[#5c4838]'
                              }`}
                            >
                              {slotDef ? slotDef.emoji : <span className="text-[10px]">·</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {cannotBuyMore && (
                      <span className="font-['Cinzel',_serif] text-xs italic tracking-[0.1em] text-[#d4b074]">
                        The Merchant grins in the dark.
                      </span>
                    )}
                  </div>
                </div>

                {/* Leave / Venture Forth Button */}
                <div className="flex items-center justify-center shrink-0">
                  <button
                    onClick={handleLeaveCache}
                    className={
                      cannotBuyMore
                        ? "px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#2b1a10] to-[#170e09] hover:from-[#3a2315] hover:to-[#1f130c] active:translate-y-[1px] border border-[#b48844]/85 hover:border-[#e5c16b] text-[#f3dfb6] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all"
                        : "px-7 py-2.5 rounded-[2px] bg-[#140e0a]/92 hover:bg-[#1f1610] border border-[#4a3322]/85 hover:border-[#8c6742] text-[#cbb697] hover:text-[#f3e6cf] font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] cursor-pointer shadow-[0_6px_16px_rgba(0,0,0,0.82)] transition-all"
                    }
                  >
                    {cannotBuyMore ? 'Venture Forth' : 'Leave Cache'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* =========================================================================
          CAMPFIRE EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_CAMPFIRE' && (() => {
        const selectedCard = campfireCardIdx !== null ? masterDeck[campfireCardIdx] || null : null;
        const isAnimating = campfireAnimState === 'dipping' || campfireAnimState === 'drowning';

        return (
          <div
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 overflow-y-auto md:overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('campfireevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,8,5,0.32)_0%,rgba(5,3,2,0.9)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_campfire')}
            <div className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-center gap-5">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c5a3c]/75 to-[#d48b47]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#d69758]">
                    Divine Blessing
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c5a3c]/75 to-[#d48b47]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Baptism of Boiling Blood
                </h1>
              </div>

              {/* Two-Column Split: Boiling Font Stage Left, Deck Panel Right */}
              <div className="w-full flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-5 items-stretch">
                {/* LEFT COLUMN: Stone Baptismal Font Prop + Action Buttons */}
                <div className="md:col-span-7 flex flex-col items-center justify-between gap-1.5 sm:gap-2 lg:gap-3 min-h-0">
                  <div className="relative w-full flex-1 min-h-0 px-6 py-4 flex flex-col items-center justify-between">
                    <div
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                        isAnimating
                          ? 'opacity-100'
                          : campfireAnimState === 'blessed'
                            ? 'opacity-90'
                            : 'opacity-45'
                      }`}
                      style={{
                        background:
                          campfireAnimState === 'blessed'
                            ? 'radial-gradient(circle at 50% 55%, rgba(245,158,11,0.34) 0%, rgba(185,28,28,0.18) 48%, transparent 74%)'
                            : 'radial-gradient(circle at 50% 65%, rgba(220,38,38,0.36) 0%, rgba(127,29,29,0.16) 46%, transparent 74%)',
                      }}
                    />

                    <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#9c643b]/70" />
                    <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#9c643b]/70" />
                    <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#9c643b]/70" />
                    <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#9c643b]/70" />

                    {/* Status / Blessing Telemetry Strip */}
                    <div className="relative z-20 flex flex-wrap items-center justify-center gap-2">
                      <span className="px-3 py-1 rounded-[2px] bg-[#1a0d09]/92 border border-[#783422]/80 text-[9.5px] font-mono font-bold uppercase tracking-[0.22em] text-[#f2b886]">
                        Blessing: {campfireBuffType === 'attack' ? '+1 Power' : '+2 Health'}
                      </span>
                      {campfireStage === 0 && activeVows.includes('no_safe_campfire') && !isCampfireSafe && (
                        <span className="px-2.5 py-1 rounded-[2px] border bg-[#240b09]/92 border-red-700/80 text-red-300 text-[9.5px] font-mono font-bold uppercase tracking-[0.18em]">
                          Vow — 35% First-Dip Risk
                        </span>
                      )}
                      {campfireStage > 0 && (
                        <span
                          className={`px-2.5 py-1 rounded-[2px] border text-[9.5px] font-mono font-bold uppercase tracking-[0.18em] ${
                            isCampfireSafe
                              ? 'bg-[#101c13]/92 border-emerald-700/75 text-emerald-300'
                              : 'bg-[#210b09]/92 border-red-700/80 text-red-300'
                          }`}
                        >
                          {isCampfireSafe ? 'Flock Slain — Safe' : 'Perilous Second Bath'}
                        </span>
                      )}
                    </div>

                    {/* Centerpiece: Creature Suspended Over the Boiling Blood Font */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full my-auto">
                      {/* Clip viewport cuts off exactly at the blood pool surface so sinking cards vanish into the liquid */}
                      <div className="relative z-30 w-[220px] h-[182px] -mb-[38px] overflow-hidden flex items-start justify-center pt-1">
                        <div
                          className={`relative w-[124px] h-[168px] flex items-center justify-center rounded-[4px] transition-shadow duration-500 ${
                            campfireAnimState === 'blessed'
                              ? 'shadow-[0_0_40px_rgba(245,158,11,0.65),0_0_20px_rgba(220,38,38,0.45)]'
                              : selectedCard
                                ? 'shadow-[0_16px_32px_rgba(0,0,0,0.92),0_0_20px_rgba(220,38,38,0.28)]'
                                : ''
                          }`}
                          style={{
                            animation:
                              campfireAnimState === 'dipping'
                                ? 'fontSubmergeDip 0.85s ease-in-out forwards'
                                : campfireAnimState === 'drowning'
                                  ? 'fontDrownSink 0.85s ease-in forwards'
                                  : undefined,
                          }}
                        >
                          {selectedCard ? (
                            <div
                              onClick={() => {
                                if (campfireStage === 0 && !isEventBusy) {
                                  triggerSfx('draw');
                                  setCampfireCardIdx(null);
                                }
                              }}
                              title={campfireStage === 0 && !isEventBusy ? 'Click to return to deck' : undefined}
                              className={`scale-[1.06] origin-center ${campfireStage === 0 && !isEventBusy ? 'cursor-pointer hover:-translate-y-1 transition-transform' : ''}`}
                            >
                              {renderCard(selectedCard, { isClickable: false, disableHoverScale: true })}
                            </div>
                          ) : (
                            <div className="w-[114px] h-[158px] rounded-[4px] border border-dashed border-[#8a4632]/75 bg-[#120807]/75 flex flex-col items-center justify-center gap-1.5 text-[#b57c62]">
                              <span className="text-xl opacity-70">🩸</span>
                              <span className="text-[9.5px] uppercase tracking-[0.2em] px-2">Choose Vessel</span>
                            </div>
                          )}
                        </div>

                        {/* Surface Blood Splash / Meniscus Glow where the card enters the liquid */}
                        {isAnimating && (
                          <div
                            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-3 rounded-full bg-red-400/80 blur-[2px] shadow-[0_0_16px_rgba(248,113,113,0.95)]"
                            style={{ animation: 'inkSplatterBurst 0.8s ease-out infinite' }}
                          />
                        )}
                      </div>

                      {/* Rising Steam / Blood Bubbles */}
                      <div className="pointer-events-none relative w-72 h-0 z-40">
                        {[-68, -28, 12, 54].map((xOff, idx) => (
                          <span
                            key={idx}
                            className={`absolute bottom-0 rounded-full ${
                              isAnimating ? 'w-3 h-3 bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]' : 'w-2 h-2 bg-red-500/60'
                            }`}
                            style={{
                              left: `calc(50% + ${xOff}px)`,
                              animation: `bloodBubbleRise ${isAnimating ? 0.65 : 2.1}s ease-out ${idx * 0.25}s infinite`,
                            }}
                          />
                        ))}
                      </div>

                      {/* Carved Stone Baptismal Font SVG Prop */}
                      <svg
                        viewBox="0 0 460 132"
                        className="w-full max-w-[460px] h-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.96)] pointer-events-none relative z-20"
                      >
                        <defs>
                          <linearGradient id="fontStoneBody" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#423632" />
                            <stop offset="50%" stopColor="#261f1d" />
                            <stop offset="100%" stopColor="#14100f" />
                          </linearGradient>
                          <radialGradient id="boilingBloodPool" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={isAnimating ? '#f87171' : '#dc2626'} />
                            <stop offset="65%" stopColor="#991b1b" />
                            <stop offset="100%" stopColor="#450a0a" />
                          </radialGradient>
                        </defs>
                        <polygon points="145,126 168,82 292,82 315,126" fill="url(#fontStoneBody)" stroke="#594740" strokeWidth="1.6" />
                        <rect x="128" y="120" width="204" height="9" rx="2" fill="#1c1614" stroke="#594740" strokeWidth="1.3" />
                        <path
                          d="M72 34 L388 34 C376 68, 342 84, 294 84 L166 84 C118 84, 84 68, 72 34 Z"
                          fill="url(#fontStoneBody)"
                          stroke="#6e574e"
                          strokeWidth="1.9"
                        />
                        <path d="M230 46 L230 74 M218 58 L242 58" stroke="#7f1d1d" strokeWidth="2.4" strokeLinecap="round" />
                        <ellipse cx="230" cy="34" rx="164" ry="18" fill="#2b221f" stroke="#7d6459" strokeWidth="2" />
                        <ellipse cx="230" cy="34" rx="148" ry="13" fill="url(#boilingBloodPool)" />
                        <ellipse cx="215" cy="33" rx="52" ry="4.5" fill="none" stroke="#fca5a5" strokeWidth="1" opacity="0.45" />
                        <ellipse cx="255" cy="35" rx="34" ry="3" fill="none" stroke="#fecaca" strokeWidth="0.9" opacity="0.35" />
                        <path d="M36 52 L54 52 L50 74 L40 74 Z" fill="#231c19" stroke="#634d42" strokeWidth="1.2" />
                        <path d="M39 50 Q45 32 51 50 Z" fill="#f97316" opacity="0.9" />
                        <path d="M406 52 L424 52 L420 74 L410 74 Z" fill="#231c19" stroke="#634d42" strokeWidth="1.2" />
                        <path d="M409 50 Q415 32 421 50 Z" fill="#f97316" opacity="0.9" />
                      </svg>
                    </div>

                    <p className="relative z-20 font-['Cinzel',_serif] text-sm sm:text-base tracking-[0.08em] text-[#ecd8bc] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                      {campfireStage === 0
                        ? 'Offer a creature.'
                        : isCampfireSafe
                          ? 'The chapel stands empty.'
                          : 'The flock grows hungry.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                    <button
                      onClick={applyCampfireWarm}
                      disabled={campfireCardIdx === null || isEventBusy}
                      className="px-7 py-2.5 rounded-[2px] bg-gradient-to-b from-[#3b1610] to-[#1d0a07] hover:from-[#521e15] hover:to-[#290e0a] active:translate-y-[1px] border border-[#b85b3d]/90 hover:border-[#eb8a64] text-[#f7d6bf] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all select-none"
                    >
                      {campfireHolding
                        ? 'Submerging...'
                        : campfireStage === 0
                          ? `Baptize Creature (${campfireBuffType === 'attack' ? '+1 Power' : '+2 Health'})`
                          : `Bathe Again (${campfireBuffType === 'attack' ? '+1 Power' : '+2 Health'})`}
                    </button>
                    {campfireStage > 0 && (
                      <button
                        onClick={() => returnToMap()}
                        disabled={campfireHolding || isEventBusy}
                        className="px-6 py-2.5 rounded-[2px] bg-[#140e0a]/92 hover:bg-[#1f1610] active:translate-y-[1px] border border-[#4a3322]/85 hover:border-[#8c6742] text-[#cbb697] hover:text-[#f3e6cf] font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_6px_16px_rgba(0,0,0,0.82)] transition-all select-none"
                      >
                        Flee the Chapel
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Side Deck Selector Panel */}
                <div
                  className={`md:col-span-5 relative flex flex-col min-h-[160px] md:min-h-0 rounded-[3px] bg-[#0d0806]/84 border border-[#422719]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,220,180,0.06)] backdrop-blur-[2px] transition-opacity duration-300 ${
                    isEventBusy ? 'opacity-40 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9c643b]/70" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9c643b]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9c643b]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9c643b]/70" />

                  <div className="px-4 py-3 border-b border-[#3a2618]/80 flex items-center justify-between gap-2 shrink-0">
                    <div className="text-left">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-[#d69758]">
                        Your Creatures ({masterDeck.length})
                      </div>

                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                    <div className="flex flex-wrap gap-x-2.5 gap-y-4 justify-center content-start">
                      {masterDeck.map((c, idx) => {
                        const isSelected = campfireCardIdx === idx;
                        if (isSelected) return null;
                        const lockedOut = campfireStage > 0;
                        return (
                          <div
                            key={c.id || `camp-${c.name}-${idx}`}
                            onClick={() => {
                              if (campfireStage === 0 && !isEventBusy) {
                                triggerSfx('draw');
                                setCampfireCardIdx(idx);
                              }
                            }}
                            className={`relative flex flex-col items-center justify-center w-[104px] h-[146px] transition-all duration-200 ${
                              lockedOut
                                ? 'opacity-30 grayscale-[45%] cursor-default'
                                : isSelected
                                  ? '-translate-y-1.5 z-30 cursor-pointer'
                                  : 'hover:-translate-y-1 cursor-pointer'
                            }`}
                          >
                            {isSelected && (
                              <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-[2px] bg-[#1c0c08]/95 border border-[#c88a42]/85 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#f5d38d] whitespace-nowrap shadow-md">
                                {campfireStage === 0 ? 'Selected' : 'Baptized'}
                              </span>
                            )}
                            <div className={`transform origin-center transition-transform duration-200 ${isSelected ? 'scale-[0.9]' : 'scale-[0.86] hover:scale-[0.91]'}`}>
                              {renderCard(c, { isSelected, isClickable: !lockedOut, disableHoverScale: true })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          ALTAR EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_ALTAR' && (() => {
        const hostPreview = altarStageCards
          ? (altarAnimPhase === 'descending' || altarAnimPhase === 'done'
              ? altarStageCards.mergedHost
              : altarStageCards.host)
          : masterDeck.find(m => m.id === altarHostId) || null;
        const sacPreview = altarStageCards
          ? altarStageCards.sacrifice
          : masterDeck.find(m => m.id === altarSacrificeId) || null;
        const isAnimating = altarAnimPhase !== 'idle';

        return (
          <div
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('altarevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.3)_0%,rgba(5,3,2,0.9)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_altar')}
            <div className="relative z-10 max-w-6xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    Crestfallen Altar
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Crest Transfer
                </h1>
              </div>

              {/* Two-Column Split: Prominent Altar Left, Scrollable Deck Panel Right */}
              <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* LEFT COLUMN: Dominant Stone Altar Stage + Ritual Action */}
                <div className="lg:col-span-7 flex flex-col items-center justify-between gap-3 min-h-0">
                  <div className="relative w-full flex-1 min-h-0 px-2 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-4 flex flex-col items-center justify-center">
                    {/* Ambient crimson / gold ritual glow */}
                    <div
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                        altarAnimPhase === 'sacrificing'
                          ? 'opacity-100'
                          : altarAnimPhase === 'descending' || altarAnimPhase === 'done'
                            ? 'opacity-85'
                            : 'opacity-40'
                      }`}
                      style={{
                        background:
                          altarAnimPhase === 'sacrificing'
                            ? 'radial-gradient(circle at 50% 66%, rgba(220,38,38,0.46) 0%, rgba(127,29,29,0.18) 46%, transparent 74%)'
                            : 'radial-gradient(circle at 50% 58%, rgba(212,175,55,0.22) 0%, rgba(120,35,24,0.14) 48%, transparent 74%)',
                      }}
                    />

                    {/* Subtle corner brackets */}
                    <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#9a7342]/70" />

                    {/* Full-Scale Ritual Column: Host Above -> Sacrifice on Slab Below */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full">
                      {/* Upper Host Slot — descends onto stone slab when sacrificing finishes */}
                      <div
                        className="relative z-30 flex flex-col items-center transition-transform duration-700 ease-in-out"
                        style={{
                          transform:
                            altarAnimPhase === 'descending' || altarAnimPhase === 'done'
                              ? 'translateY(166px)'
                              : 'translateY(0px)',
                        }}
                      >
                        <span
                          className={`mb-1.5 px-2.5 py-0.5 rounded-[2px] border text-[9px] font-mono font-bold uppercase tracking-[0.22em] transition-colors duration-300 ${
                            altarAnimPhase === 'descending' || altarAnimPhase === 'done'
                              ? 'bg-[#21160b]/95 border-[#eab308]/90 text-[#fde68a] shadow-[0_0_14px_rgba(234,179,8,0.45)]'
                              : hostPreview
                                ? 'bg-[#1a130b]/90 border-[#d4af37]/80 text-[#f4d78b]'
                                : 'bg-[#120c09]/85 border-[#4e3826]/75 text-[#9c8469]'
                          }`}
                        >
                          {altarAnimPhase === 'descending' || altarAnimPhase === 'done'
                            ? 'Crests Inherited'
                            : hostPreview
                              ? 'Host'
                              : '1. Select Host'}
                        </span>

                        <div
                          className={`w-[68px] h-[92px] sm:w-[88px] sm:h-[118px] lg:w-[114px] lg:h-[154px] flex items-center justify-center rounded-[4px] transition-all duration-500 ${
                            altarAnimPhase === 'descending' || altarAnimPhase === 'done'
                              ? 'shadow-[0_0_40px_rgba(234,179,8,0.65),0_0_20px_rgba(220,38,38,0.5)]'
                              : hostPreview
                                ? 'shadow-[0_14px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.25)]'
                                : ''
                          }`}
                        >
                          {hostPreview ? (
                            <div
                              onClick={() => {
                                if (isAnimating) return;
                                triggerSfx('draw');
                                setAltarHostId(null);
                                setAltarSacrificeId(null);
                              }}
                              title={!isAnimating ? 'Click to return Host to deck' : undefined}
                              className={`scale-[0.58] sm:scale-[0.76] lg:scale-[0.98] origin-center ${!isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                            >
                              {renderCard(hostPreview, { isClickable: false, disableHoverScale: true })}
                            </div>
                          ) : (
                            <div className="w-[64px] h-[88px] sm:w-[84px] sm:h-[114px] lg:w-[108px] lg:h-[150px] rounded-[4px] border border-dashed border-[#7a5a3a]/75 bg-[#0d0907]/75 flex flex-col items-center justify-center gap-1 text-[#9a7d5e]">
                              <span className="text-xl opacity-65">✧</span>
                              <span className="text-[9.5px] uppercase tracking-[0.22em]">Host</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ascending Crest Energy Motes during Sacrifice */}
                      {altarAnimPhase === 'sacrificing' && (
                        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
                          {[-34, 0, 34].map((offset, i) => (
                            <div
                              key={i}
                              className="absolute bottom-24 w-3 h-3 rounded-full bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.95)]"
                              style={{
                                marginLeft: `${offset}px`,
                                animation: `altarSigilRise 0.8s ease-out ${i * 0.12}s forwards`,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Lower Carved Stone Altar Pedestal + Sacrifice Slot */}
                      <div className="relative z-20 mt-1.5 sm:mt-2 lg:mt-3 flex flex-col items-center w-full">
                        <div
                          className="relative z-20 w-[68px] h-[92px] sm:w-[88px] sm:h-[118px] lg:w-[114px] lg:h-[154px] -mb-4 sm:-mb-5 lg:-mb-7 flex items-center justify-center transition-opacity duration-300"
                          style={{
                            animation: altarAnimPhase === 'sacrificing' ? 'altarSacrificeBurn 0.85s ease-in forwards' : undefined,
                            opacity: altarAnimPhase === 'descending' || altarAnimPhase === 'done' ? 0 : 1,
                          }}
                        >
                          {sacPreview ? (
                            <div
                              onClick={() => {
                                if (isAnimating) return;
                                triggerSfx('draw');
                                setAltarSacrificeId(null);
                              }}
                              title={!isAnimating ? 'Click to return Sacrifice to deck' : undefined}
                              className={`scale-[0.60] sm:scale-[0.78] lg:scale-[1.0] origin-center ${!isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                            >
                              {renderCard(sacPreview, { isClickable: false, disableHoverScale: true, isMarkedSacrifice: true })}
                            </div>
                          ) : (
                            <div className="w-[64px] h-[88px] sm:w-[84px] sm:h-[114px] lg:w-[108px] lg:h-[150px] rounded-[4px] border border-dashed border-red-900/75 bg-[#120807]/80 flex flex-col items-center justify-center gap-1 text-red-400/70">
                              <span className="text-xl opacity-75">†</span>
                              <span className="text-[9.5px] uppercase tracking-[0.22em]">Sacrifice</span>
                            </div>
                          )}
                        </div>

                        {/* Heavy Carved Stone Altar Slab SVG Prop */}
                        <svg
                          viewBox="0 0 460 106"
                          className="w-full max-w-[230px] sm:max-w-[320px] lg:max-w-[470px] h-auto drop-shadow-[0_16px_26px_rgba(0,0,0,0.96)] pointer-events-none"
                        >
                          <defs>
                            <linearGradient id="altarStoneTop" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#463b35" />
                              <stop offset="55%" stopColor="#2a2320" />
                              <stop offset="100%" stopColor="#161210" />
                            </linearGradient>
                            <linearGradient id="altarStoneBase" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#26201d" />
                              <stop offset="100%" stopColor="#0f0c0b" />
                            </linearGradient>
                          </defs>
                          {/* Stepped Pedestal Base */}
                          <polygon points="46,102 68,52 392,52 414,102" fill="url(#altarStoneBase)" stroke="#55453c" strokeWidth="1.6" />
                          {/* Carved Runic Pillars */}
                          <line x1="122" y1="56" x2="114" y2="98" stroke="#3f332c" strokeWidth="2.2" />
                          <line x1="338" y1="56" x2="346" y2="98" stroke="#3f332c" strokeWidth="2.2" />
                          {/* Central Blood Channel & Sigil Ring */}
                          <circle cx="230" cy="77" r="13" fill="none" stroke={altarAnimPhase !== 'idle' ? '#dc2626' : '#7a2c24'} strokeWidth="1.8" />
                          <path d="M230 52 L230 97 M217 77 L243 77" stroke={altarAnimPhase !== 'idle' ? '#ef4444' : '#8f241f'} strokeWidth="1.7" />
                          {/* Heavy Stone Tabletop Slab */}
                          <polygon points="16,52 44,22 416,22 444,52" fill="url(#altarStoneTop)" stroke="#756052" strokeWidth="2" />
                          <rect x="16" y="48" width="428" height="10" rx="1.5" fill="#1e1816" stroke="#5b4a3f" strokeWidth="1.3" />
                          {/* Blood Grooves across Slab */}
                          <path
                            d="M132 37 Q230 43 328 37"
                            fill="none"
                            stroke={altarAnimPhase === 'sacrificing' ? '#ef4444' : '#85221e'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          {/* Flanking Tallow Candles */}
                          <rect x="52" y="13" width="9" height="18" rx="1" fill="#dcd0b8" stroke="#64513e" strokeWidth="1" />
                          <ellipse cx="56.5" cy="8.5" rx="3.5" ry="5.5" fill="#fbbf24" opacity="0.92" />
                          <rect x="399" y="13" width="9" height="18" rx="1" fill="#dcd0b8" stroke="#64513e" strokeWidth="1" />
                          <ellipse cx="403.5" cy="8.5" rx="3.5" ry="5.5" fill="#fbbf24" opacity="0.92" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Primary Ritual Action Button directly under the Altar */}
                  <div className="flex items-center justify-center shrink-0">
                    <button
                      onClick={applyAltarTransfer}
                      disabled={!altarHostId || !altarSacrificeId || isEventBusy || isAnimating}
                      className="px-5 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-2.5 rounded-[2px] bg-gradient-to-b from-[#3b1410] to-[#1d0907] hover:from-[#501b16] hover:to-[#280d0a] active:translate-y-[1px] border border-[#b3473a]/90 hover:border-[#e67365] text-[#f7cfc6] hover:text-white font-['Cinzel',_serif] font-bold text-[10.5px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.88)] transition-all select-none"
                    >
                      {isAnimating ? 'Binding Crests...' : 'Commit to Your Actions'}
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Side Deck Selector Panel */}
                <div
                  className={`lg:col-span-5 relative flex flex-col min-h-0 rounded-[3px] bg-[#0d0806]/84 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,228,185,0.06)] backdrop-blur-[2px] transition-opacity duration-500 ${
                    isAnimating ? 'opacity-30 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9a7342]/70" />

                  {/* Panel Header & Step Prompt */}
                  <div className="px-4 py-3 border-b border-[#3a2618]/80 flex items-center justify-between gap-2 shrink-0">
                    <div className="text-left">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-[#c79d5a]">
                        Your Creatures ({masterDeck.length})
                      </div>

                    </div>
                    {(altarHostId || altarSacrificeId) && !isAnimating && (
                      <button
                        type="button"
                        onClick={() => {
                          setAltarHostId(null);
                          setAltarSacrificeId(null);
                        }}
                        className="px-2.5 py-1 rounded-[2px] bg-[#1a110c] hover:bg-[#281a12] border border-[#5a3d28] text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#d4bfa0] cursor-pointer transition shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Internally Scrollable Card Grid */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                    <div className="flex flex-wrap gap-x-2.5 gap-y-4 justify-center content-start">
                      {masterDeck.map(c => {
                        const isHost = altarHostId === c.id;
                        const isSac = altarSacrificeId === c.id;
                        if (isHost || isSac) return null;
                        const hostCard = masterDeck.find(m => m.id === altarHostId);
                        const cannotBeHost = hasMoreSigilsThanOriginal(c);

                        let wouldExceedFive = false;
                        if (hostCard && !isHost && c.sigils && c.sigils.length > 0) {
                          const merged = new Set(hostCard.sigils || []);
                          c.sigils.forEach((s: any) => merged.add(s));
                          if (merged.size >= 5) wouldExceedFive = true;
                        }

                        const isDisabled =
                          isAnimating ||
                          (!altarHostId && cannotBeHost) ||
                          (Boolean(altarHostId) && !isHost && (wouldExceedFive || !c.sigils || c.sigils.length === 0));

                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              if (isAnimating) return;
                              if (!altarHostId) {
                                if (cannotBeHost) {
                                  addLog(`${c.name} cannot receive more crests: it already bears more than its original nature allows.`);
                                  return;
                                }
                                setAltarHostId(c.id || null);
                              } else if (altarHostId === c.id) {
                                setAltarHostId(null);
                                setAltarSacrificeId(null);
                              } else if (!altarSacrificeId) {
                                if (wouldExceedFive) {
                                  addLog(`Cannot sacrifice ${c.name}: ${hostCard?.name} would have 5 or more crests (max 4 allowed).`);
                                  return;
                                }
                                if (c.sigils && c.sigils.length > 0) {
                                  setAltarSacrificeId(c.id || null);
                                }
                              } else if (altarSacrificeId === c.id) {
                                setAltarSacrificeId(null);
                              }
                            }}
                            className={`relative flex flex-col items-center justify-center w-[104px] h-[146px] transition-all duration-200 ${
                              isDisabled
                                ? 'opacity-35 grayscale-[55%] cursor-not-allowed'
                                : isHost || isSac
                                  ? '-translate-y-1.5 z-30 cursor-pointer'
                                  : 'hover:-translate-y-1 cursor-pointer'
                            }`}
                          >
                            {isHost && (
                              <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-[2px] bg-[#1a130b]/95 border border-[#d4af37]/85 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#f4d78b] whitespace-nowrap shadow-md">
                                Host
                              </span>
                            )}
                            {isSac && (
                              <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-[2px] bg-[#210b0a]/95 border border-red-500/85 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-red-200 whitespace-nowrap shadow-md">
                                Sacrifice
                              </span>
                            )}
                            <div className={`transform origin-center transition-transform duration-200 ${isHost || isSac ? 'scale-[0.9]' : 'scale-[0.86] hover:scale-[0.91]'}`}>
                              {renderCard(c, {
                                isSelected: isHost,
                                isMarkedSacrifice: isSac,
                                isClickable: !isDisabled,
                                disableHoverScale: true,
                              })}
                            </div>
                            {!altarHostId && cannotBeHost && (
                              <span className="pointer-events-none absolute -bottom-2 text-[8px] font-mono text-amber-400/90 font-bold uppercase tracking-wider whitespace-nowrap">
                                Cannot Host
                              </span>
                            )}
                            {altarHostId && !isHost && wouldExceedFive && (
                              <span className="pointer-events-none absolute -bottom-2 text-[8px] font-mono text-red-400/90 font-bold uppercase tracking-wider whitespace-nowrap">
                                Exceeds 4
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          TRANSMUTATION TABLE (ANVIL) EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_ANVIL' && (() => {
        const selectedCard = masterDeck.find(c => c.id === anvilSelectedId) || null;
        const canHammer = canAnvilBloodToBone(selectedCard);
        const canForceps = canAnvilHollow(selectedCard);

        return (
          <div
            className="absolute inset-0 bg-[#0b0807] z-50 flex flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-5 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('altarevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(22,12,8,0.42)_0%,rgba(6,4,3,0.92)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_anvil')}
            <div className="relative z-10 w-full max-w-6xl h-full min-h-0 flex flex-col">
              {/* Header */}
              <div className="shrink-0 flex flex-col items-center text-center pb-3">
                <div className="flex items-center gap-3.5 mb-0.5">
                  <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    Iron &amp; Sinew
                  </span>
                  <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Transmutation Table
                </h1>
                <p className="mt-1 font-['Cinzel',_serif] text-sm italic tracking-[0.1em] text-[#e5cfa8] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  &ldquo;Something about this feels wrong.&rdquo;
                </p>
              </div>

              {/* Two-Column Split: Forge Stage Left, Scrollable Deck Right */}
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                {/* Left Column: Iron Anvil + Diegetic Tools */}
                <div className="lg:col-span-7 min-h-0 flex flex-col justify-between p-4 sm:p-5">
                  {/* Anvil Prop Stage */}
                  <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative">
                    <div
                      onClick={() => {
                        if (!selectedCard || isEventBusy) return;
                        triggerSfx('draw');
                        setAnvilSelectedId(null);
                      }}
                      className={`relative z-20 -mb-5 transition-all duration-200 ${selectedCard && !isEventBusy ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
                      style={{
                        animation: anvilStrikeAnim !== 'idle' ? 'anvilStrikeJolt 0.65s ease-out' : undefined,
                      }}
                    >
                      {selectedCard ? (
                        renderCard(selectedCard, { isClickable: false, disableHoverScale: true })
                      ) : (
                        <div className="w-[108px] h-[152px] rounded-[4px] border border-dashed border-[#6b523b]/75 bg-[#120d0a]/75 flex flex-col items-center justify-center gap-1.5 text-[#9c8469]">
                          <span className="text-xl opacity-65">⚒</span>
                          <span className="text-[9px] uppercase tracking-[0.2em] px-2 text-center">Place Creature</span>
                        </div>
                      )}
                    </div>

                    {/* Heavy Blacksmith Anvil SVG Prop */}
                    <svg
                      viewBox="0 0 320 112"
                      className="w-full max-w-[350px] h-auto translate-y-4 scale-y-[1.18] origin-bottom drop-shadow-[0_14px_22px_rgba(0,0,0,0.95)] pointer-events-none"
                    >
                      <defs>
                        <linearGradient id="anvilIron" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#4f4844" />
                          <stop offset="35%" stopColor="#2c2725" />
                          <stop offset="100%" stopColor="#141110" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M16 34 C46 28, 72 24, 96 24 L256 24 L268 38 L298 40 C282 54, 260 60, 232 60 L214 60 L226 94 L256 102 L256 108 L64 108 L64 102 L94 94 L106 60 C68 60, 34 50, 16 34 Z"
                        fill="url(#anvilIron)"
                        stroke="#6d625a"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <line x1="94" y1="27" x2="254" y2="27" stroke="#8a7b70" strokeWidth="1.4" opacity="0.65" />
                      <ellipse cx="160" cy="107" rx="115" ry="4" fill="rgba(217,119,6,0.22)" />
                    </svg>
                  </div>

                  {/* Tool Strikes + Leave Action */}
                  <div className="shrink-0 pt-3.5 border-t border-[#3a271b]/75 flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <button
                        onClick={() => applyAnvilStrike('hammer')}
                        disabled={!canHammer || isEventBusy}
                        className={`group relative w-full p-3.5 rounded-[3px] border flex items-center gap-3.5 text-left transition-all duration-200 ${
                          canHammer && !isEventBusy
                            ? 'bg-gradient-to-r from-[#24130f]/95 to-[#160c09]/95 border-[#8f4c35]/85 hover:border-[#e08256] hover:shadow-[0_0_24px_rgba(224,130,86,0.22)] cursor-pointer'
                            : 'bg-[#120d0b]/70 border-[#2e231c]/70 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-12 h-12 shrink-0 rounded-[3px] bg-[#0d0806] border border-[#543624] group-hover:border-[#d4845a] flex items-center justify-center shadow-inner">
                          <svg viewBox="0 0 32 32" className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6l8 8-4 4-8-8 4-4Z" fill="rgba(251,191,36,0.16)" />
                            <path d="M14 10l-3 3 5 5 3-3" />
                            <path d="M13 15L5 23a2 2 0 0 0 2.8 2.8L16 17.8" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Cinzel',_serif] font-bold text-sm uppercase tracking-[0.15em] text-[#f3dfb6] group-hover:text-white">
                            Blood-to-Bone
                          </div>
                          {selectedCard && !canHammer && (
                            <div className="mt-0.5 text-[9.5px] uppercase tracking-wider text-red-400/85">
                              Requires Blood Cost
                            </div>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => applyAnvilStrike('forceps')}
                        disabled={!canForceps || isEventBusy}
                        className={`group relative w-full p-3.5 rounded-[3px] border flex items-center gap-3.5 text-left transition-all duration-200 ${
                          canForceps && !isEventBusy
                            ? 'bg-gradient-to-r from-[#1a151b]/95 to-[#100d12]/95 border-[#6b5a78]/85 hover:border-[#c4a7db] hover:shadow-[0_0_24px_rgba(196,167,219,0.2)] cursor-pointer'
                            : 'bg-[#120d0b]/70 border-[#2e231c]/70 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-12 h-12 shrink-0 rounded-[3px] bg-[#0b090d] border border-[#453a4f] group-hover:border-[#b799cf] flex items-center justify-center shadow-inner">
                          <svg viewBox="0 0 32 32" className="w-7 h-7 text-stone-200" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="24" r="3" />
                            <circle cx="23" cy="24" r="3" />
                            <path d="M11 21.5L19.5 7.5C20.3 6.2 21.8 5.5 23 6" />
                            <path d="M21 21.5L12.5 7.5C11.7 6.2 10.2 5.5 9 6" />
                            <circle cx="16" cy="14.5" r="1.2" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Cinzel',_serif] font-bold text-sm uppercase tracking-[0.15em] text-[#e7dff0] group-hover:text-white">
                            Hollowing
                          </div>
                          {selectedCard && !canForceps && (
                            <div className="mt-0.5 text-[9.5px] uppercase tracking-wider text-amber-400/85">
                              Cannot Hollow
                            </div>
                          )}
                        </div>
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setAnvilSelectedId(null);
                          returnToMap();
                        }}
                        disabled={isEventBusy}
                        className="px-4 py-1.5 rounded-[2px] bg-[#16100d] hover:bg-[#221814] border border-[#4a3628] text-[10px] font-mono uppercase tracking-[0.2em] text-[#b8a085] hover:text-[#f0dec2] cursor-pointer transition"
                      >
                        Step Away
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Scrollable Deck Selector */}
                <div className="lg:col-span-5 min-h-0 flex flex-col rounded-[3px] bg-[#0d0806]/82 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.9)] overflow-hidden">
                  <div className="shrink-0 px-4 py-2.5 border-b border-[#342217]/80 flex items-center justify-between bg-[#120b08]/80">
                    <span className="font-['Cinzel',_serif] text-xs font-bold uppercase tracking-[0.22em] text-[#d8c19a]">
                      Deck
                    </span>
                    <span className="text-[10px] font-mono tracking-[0.18em] text-[#9b8266]">
                      {masterDeck.length}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto p-3">
                    <div className="flex flex-wrap gap-2.5 justify-center content-start">
                      {masterDeck.map(c => {
                        const isPicked = anvilSelectedId === c.id;
                        if (isPicked) return null;
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              if (isEventBusy) return;
                              triggerSfx('draw');
                              setAnvilSelectedId(isPicked ? null : c.id || null);
                            }}
                            className={`relative cursor-pointer transition-all duration-200 ${
                              isPicked
                                ? 'scale-[0.95] -translate-y-1 z-20'
                                : 'scale-[0.86] hover:scale-[0.93] hover:-translate-y-0.5 opacity-85 hover:opacity-100'
                            }`}
                          >
                            {renderCard(c, { isSelected: isPicked, isClickable: !isEventBusy, disableHoverScale: true })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          THE ZEALOTS FLOCK EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_FLOCK' && (() => {
        const selectedSheep = flockSheepList.find(s => s.id === flockSelectedSheepId) || null;
        const revealedOption = selectedSheep ? FLOCK_OPTIONS[selectedSheep.optionId] : null;
        const isGreyMode = flockSheepList.length === 1 && flockSheepList[0]?.isGrey;
        const canRepick = !isGreyMode && flockRepicksUsed === 0 && Boolean(selectedSheep);

        return (
          <div
            className="absolute inset-0 bg-[#080706] z-50 flex flex-col items-center justify-start px-4 py-4 sm:p-6 overflow-y-auto animate-fade-up font-mono select-none"
            style={getScreenBgStyle('zealotboss.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,10,9,0.45)_0%,rgba(5,3,3,0.92)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_flock')}
            <div className="relative z-10 max-w-5xl w-full flex flex-col items-center justify-center text-center my-auto py-1">
              <div className="flex items-center gap-3.5 mb-0.5">
                <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                  {isGreyMode ? 'Cursed Pasture' : 'Thirteen Black Sheep'}
                </span>
                <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                The Zealot&apos;s Flock
              </h1>
              <p className="mt-1.5 font-['Cinzel',_serif] text-sm sm:text-base italic tracking-[0.1em] text-[#e5cfa8] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                {flockPendingRemovals > 0
                  ? `Cull ${flockPendingRemovals} (${flockRemovalSelectedIds.length}/${flockPendingRemovals})`
                  : isGreyMode
                    ? '"Only the grey remains."'
                    : '"Your creatures are ravenous."'}
              </p>

              {flockPendingRemovals > 0 ? (
                /* Deck Culling Phase for Remove-2-Cards Option */
                <div className="w-full max-w-4xl mt-5 p-5 rounded-[3px] bg-[#0d0806]/88 border border-[#4a2b1d]/85 shadow-[0_20px_50px_rgba(0,0,0,0.92)]">
                  <div className="flex flex-wrap gap-3 justify-center mb-5">
                    {masterDeck.map(c => {
                      const cid = c.id || '';
                      const isMarked = flockRemovalSelectedIds.includes(cid);
                      return (
                        <div
                          key={cid}
                          onClick={() => {
                            if (!cid) return;
                            triggerSfx('draw');
                            setFlockRemovalSelectedIds((prev: any[]) => {
                              if (prev.includes(cid)) return prev.filter((x: any) => x !== cid);
                              if (prev.length >= flockPendingRemovals) return prev;
                              return [...prev, cid];
                            });
                          }}
                          className={`relative cursor-pointer transition-all duration-200 ${
                            isMarked
                              ? 'scale-[0.98] -translate-y-2 z-20'
                              : 'scale-[0.88] hover:scale-[0.95] hover:-translate-y-1 opacity-85 hover:opacity-100'
                          }`}
                        >
                          {renderCard(c, { isMarkedSacrifice: isMarked, isClickable: true, disableHoverScale: true })}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={confirmFlockDeckRemovals}
                    disabled={flockRemovalSelectedIds.length !== flockPendingRemovals || isEventBusy}
                    className="px-7 py-2.5 rounded-[2px] bg-gradient-to-b from-[#35120f] to-[#1b0907] hover:from-[#471814] hover:to-[#240c09] border border-[#a84236]/85 text-[#f5c8be] font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed transition"
                  >
                    Cull Selected ({flockRemovalSelectedIds.length}/{flockPendingRemovals})
                  </button>
                </div>
              ) : (
                <>
                  {/* Fenced Pen Arena with 13 Wandering Sheep (or 1 Lone Grey Sheep) */}
                  <div className="relative w-full max-w-4xl h-[270px] sm:h-[300px] mt-4 mb-4 rounded-[4px] bg-[radial-gradient(ellipse_at_center,#635746_0%,#473d30_62%,#2a231b_100%)] border-[3px] border-[#5c422c] shadow-[inset_0_0_46px_rgba(0,0,0,0.62),0_22px_54px_rgba(0,0,0,0.94)] overflow-hidden">
                    {/* Ornate Timber & Wrought-Iron Fence Perimeter */}
                    <div className="pointer-events-none absolute inset-0 z-20">
                      {/* Top & Bottom Double Timber Rails */}
                      <div className="absolute top-2 inset-x-0 h-[5px] bg-gradient-to-b from-[#8d6844] via-[#5e4128] to-[#2e1e12] shadow-[0_3px_6px_rgba(0,0,0,0.75)]" />
                      <div className="absolute top-[13px] inset-x-0 h-[3px] bg-gradient-to-b from-[#735336] to-[#291b10] opacity-85" />
                      <div className="absolute bottom-2 inset-x-0 h-[5px] bg-gradient-to-b from-[#8d6844] via-[#5e4128] to-[#2e1e12] shadow-[0_-2px_6px_rgba(0,0,0,0.75)]" />
                      <div className="absolute bottom-[13px] inset-x-0 h-[3px] bg-gradient-to-b from-[#735336] to-[#291b10] opacity-85" />
                      {/* Left & Right Side Rails */}
                      <div className="absolute left-2 inset-y-0 w-[5px] bg-gradient-to-r from-[#8d6844] via-[#5e4128] to-[#2e1e12] shadow-[2px_0_6px_rgba(0,0,0,0.7)]" />
                      <div className="absolute right-2 inset-y-0 w-[5px] bg-gradient-to-l from-[#8d6844] via-[#5e4128] to-[#2e1e12] shadow-[-2px_0_6px_rgba(0,0,0,0.7)]" />
                      {/* Top & Bottom Fence Posts with Brass Rivets */}
                      {[12, 27, 42, 58, 73, 88].map((pct) => (
                        <React.Fragment key={`post-${pct}`}>
                          <div
                            className="absolute top-0.5 w-3 h-5 -translate-x-1/2 rounded-[1px] bg-gradient-to-b from-[#a07a52] via-[#614329] to-[#28190e] border border-[#24160c] shadow-[0_3px_5px_rgba(0,0,0,0.85)] flex items-center justify-center"
                            style={{ left: `${pct}%` }}
                          >
                            <span className="w-1 h-1 rounded-full bg-[#d4af37]/80" />
                          </div>
                          <div
                            className="absolute bottom-0.5 w-3 h-5 -translate-x-1/2 rounded-[1px] bg-gradient-to-b from-[#a07a52] via-[#614329] to-[#28190e] border border-[#24160c] shadow-[0_-2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center"
                            style={{ left: `${pct}%` }}
                          >
                            <span className="w-1 h-1 rounded-full bg-[#d4af37]/80" />
                          </div>
                        </React.Fragment>
                      ))}
                      {/* Reinforced Corner Post Caps */}
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-[2px] bg-gradient-to-br from-[#b0895e] via-[#65472c] to-[#26180d] border border-[#d4af37]/45 shadow-md flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/85" /></div>
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-[2px] bg-gradient-to-bl from-[#b0895e] via-[#65472c] to-[#26180d] border border-[#d4af37]/45 shadow-md flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/85" /></div>
                      <div className="absolute bottom-0.5 left-0.5 w-4 h-4 rounded-[2px] bg-gradient-to-tr from-[#b0895e] via-[#65472c] to-[#26180d] border border-[#d4af37]/45 shadow-md flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/85" /></div>
                      <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-[2px] bg-gradient-to-tl from-[#b0895e] via-[#65472c] to-[#26180d] border border-[#d4af37]/45 shadow-md flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/85" /></div>
                    </div>

                    {flockSheepList.map(sheep => {
                      const isPicked = flockSelectedSheepId === sheep.id;
                      const isLockedOut = Boolean(sheep.dismissed) || (Boolean(selectedSheep) && !isPicked);
                      const woolFill = sheep.isGrey ? '#8a8d91' : '#181517';
                      const woolStroke = isPicked
                        ? (sheep.isGrey ? '#f8fafc' : '#f59e0b')
                        : (sheep.isGrey ? '#cbd5e1' : '#4a3d38');
                      const headFill = sheep.isGrey ? '#4b5563' : '#0b090a';
                      const eyeFill = sheep.isGrey ? '#fef08a' : '#ef4444';

                      return (
                        <button
                          key={sheep.id}
                          type="button"
                          disabled={Boolean(sheep.dismissed) || (Boolean(selectedSheep) && !isPicked)}
                          onClick={() => {
                            if (sheep.dismissed || selectedSheep) return;
                            triggerSfx('draw');
                            setFlockSelectedSheepId(sheep.id);
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full transition-all duration-300 focus:outline-none ${
                            sheep.dismissed
                              ? 'opacity-15 scale-75 pointer-events-none'
                              : isPicked
                                ? 'z-30 scale-125 drop-shadow-[0_0_16px_rgba(245,158,11,0.75)] cursor-default'
                                : isLockedOut
                                  ? 'opacity-40 cursor-default'
                                  : 'z-10 hover:z-20 hover:scale-125 cursor-pointer drop-shadow-[0_6px_10px_rgba(0,0,0,0.85)]'
                          }`}
                          style={{
                            left: `${sheep.x}%`,
                            top: `${sheep.y}%`,
                            animation: isPicked
                              ? undefined
                              : `${sheep.wanderAnim} ${sheep.duration}s ease-in-out ${sheep.delay}s infinite`,
                          }}
                          title={sheep.isGrey ? 'The Lone Grey Sheep' : 'Select a Sheep'}
                        >
                          <svg
                            viewBox="0 0 64 46"
                            className={`${sheep.isGrey ? 'w-20 h-14' : 'w-14 h-10 sm:w-16 sm:h-12'}`}
                            style={{
                              transform: sheep.flip ? 'scaleX(-1)' : undefined,
                              animation: isPicked ? undefined : `sheepHop 1.9s ease-in-out ${sheep.delay}s infinite`,
                            }}
                          >
                            {/* Legs */}
                            <line x1="20" y1="32" x2="19" y2="42" stroke="#0c0a09" strokeWidth="3" strokeLinecap="round" />
                            <line x1="28" y1="33" x2="28" y2="42" stroke="#0c0a09" strokeWidth="3" strokeLinecap="round" />
                            <line x1="40" y1="33" x2="40" y2="42" stroke="#0c0a09" strokeWidth="3" strokeLinecap="round" />
                            <line x1="46" y1="32" x2="47" y2="42" stroke="#0c0a09" strokeWidth="3" strokeLinecap="round" />
                            {/* Fluffy Fleece Body */}
                            <path
                              d="M16 24 C14 15, 22 10, 30 12 C34 8, 43 9, 46 14 C53 15, 55 23, 50 29 C48 34, 40 35, 34 34 C26 36, 17 32, 16 24 Z"
                              fill={woolFill}
                              stroke={woolStroke}
                              strokeWidth="1.8"
                            />
                            {/* Head & Curled Horn */}
                            <ellipse cx="14" cy="22" rx="7.5" ry="6" fill={headFill} stroke={woolStroke} strokeWidth="1.4" />
                            <path d="M16 16 C18 11, 23 12, 22 16" fill="none" stroke="#a89984" strokeWidth="1.8" strokeLinecap="round" />
                            {/* Glowing Eye */}
                            <circle cx="11.5" cy="21" r="1.4" fill={eyeFill} />
                          </svg>
                        </button>
                      );
                    })}
                  </div>

                  {/* Revealed Offering Plaque */}
                  <div className="relative w-full max-w-3xl min-h-[124px] p-4 sm:p-5 rounded-[3px] bg-gradient-to-b from-[#150e0a]/92 via-[#0f0907]/94 to-[#090605]/96 border border-[#6e4c31]/85 shadow-[0_18px_42px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,224,178,0.08)] flex flex-col items-center justify-center">
                    <span className="pointer-events-none absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-[#c79d5a]/70" />
                    <span className="pointer-events-none absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-[#c79d5a]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-[#c79d5a]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-[#c79d5a]/70" />
                    {!revealedOption ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-3.5">
                          <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/75 to-[#d4af37]/90" />
                          <span className="font-['Cinzel',_serif] font-bold text-lg sm:text-xl uppercase tracking-[0.26em] text-[#f2ddb7] drop-shadow-[0_2px_10px_rgba(212,175,55,0.28)]">
                            {isGreyMode
                              ? 'The Lone Grey Sheep'
                              : flockRepicksUsed === 0
                                ? 'Choose a Sheep'
                                : 'Final Choice'}
                          </span>
                          <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/75 to-[#d4af37]/90" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#a88c68]/85">
                          {isGreyMode
                            ? 'A lone offering awaits in the pen'
                            : 'Select a beast from the pasture to reveal its omen'}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center gap-3.5 animate-menu-fade-in">
                        <div className={`w-full grid grid-cols-1 ${revealedOption.curse ? 'sm:grid-cols-2' : ''} gap-3 text-left`}>
                          <div className="p-3 rounded-[2px] bg-[#16110a]/90 border border-[#9c7838]/75">
                            <div className="text-[9.5px] font-mono font-bold uppercase tracking-[0.24em] text-amber-300/90 mb-1">
                              Blessing
                            </div>
                            <div className="text-xs font-mono text-[#f6e7c8] leading-relaxed">
                              {revealedOption.blessing}
                            </div>
                          </div>

                          {revealedOption.curse && (
                            <div className="p-3 rounded-[2px] bg-[#1a0b0a]/90 border border-red-800/80">
                              <div className="text-[9.5px] font-mono font-bold uppercase tracking-[0.24em] text-red-400 mb-1">
                                Curse
                              </div>
                              <div className="text-xs font-mono text-red-200/95 leading-relaxed">
                                {revealedOption.curse}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                          <button
                            onClick={() => applyFlockOption(revealedOption.id)}
                            disabled={isEventBusy}
                            className="px-6 py-2 rounded-[2px] bg-gradient-to-b from-[#35120f] to-[#1b0907] hover:from-[#4a1a15] hover:to-[#270d0a] border border-[#b5483b]/90 text-[#f8d1c8] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] cursor-pointer shadow-[0_6px_16px_rgba(0,0,0,0.85)] transition"
                          >
                            {revealedOption.isGrey ? 'Accept the Grey Fleece' : 'Feed the Creatures'}
                          </button>

                          {canRepick && (
                            <button
                              onClick={handleFlockRepick}
                              disabled={isEventBusy}
                              className="px-5 py-2 rounded-[2px] bg-[#16110e] hover:bg-[#231b15] border border-[#6e543a]/80 text-[#d8c1a3] hover:text-white font-mono text-[11px] uppercase tracking-[0.18em] cursor-pointer transition"
                            >
                              Pick Another Sheep (1 Left)
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          TOTEM CARVINGS (TRIBE PICK) SCREEN
         ========================================================================= */}
      {screen === 'EVENT_TOTEM_CARVING' && (() => {
        const tribesToShow = carvingTribes.length > 0 ? carvingTribes : (["Reptile", "Canine", "Avian"] as Tribe[]);
        const pickedIdx = carvingPickedTribe ? tribesToShow.indexOf(carvingPickedTribe) : -1;
        // Exact column centers in a 3-column grid (16.667%, 50%, 83.333%) mapped to a 600px viewBox -> 100, 300, 500
        const threadStartX = pickedIdx === 0 ? 100 : pickedIdx === 2 ? 500 : 300;

        // Distinct stitched fabric silhouettes per Tribe
        const renderPatchSilhouette = (tribe: Tribe, isChosen: boolean, isDimmed: boolean) => {
          const strokeCol = isChosen ? '#f4d78b' : isDimmed ? '#4d3724' : '#9a734a';
          const fillTop = isChosen ? '#291c11' : '#1f150d';
          const fillBot = isChosen ? '#140d08' : '#100a06';
          const gradId = `patchCloth-${tribe}`;

          // Outer & inner stitch paths tailored to each tribe's silhouette
          let outerPath = '';
          let stitchPath = '';
          switch (tribe) {
            case 'Reptile':
              // Swallowtail notched banner
              outerPath = 'M 14 8 H 166 V 176 L 90 154 L 14 176 Z';
              stitchPath = 'M 21 15 H 159 V 166 L 90 146 L 21 166 Z';
              break;
            case 'Insect':
              // Chamfered hexagonal talisman swatch
              outerPath = 'M 36 8 H 144 L 170 42 V 142 L 138 176 H 42 L 10 142 V 42 Z';
              stitchPath = 'M 40 15 H 140 L 162 45 V 139 L 134 169 H 46 L 18 139 V 45 Z';
              break;
            case 'Avian':
              // Pointed heraldic crest shield
              outerPath = 'M 16 12 Q 90 2 164 12 V 104 Q 164 152 90 178 Q 16 152 16 104 Z';
              stitchPath = 'M 23 19 Q 90 10 157 19 V 102 Q 157 145 90 169 Q 23 145 23 102 Z';
              break;
            case 'Canine':
              // Rugged jagged-hem pelt swatch
              outerPath = 'M 16 8 H 164 L 168 156 L 138 172 L 114 158 L 90 176 L 66 158 L 42 172 L 12 156 Z';
              stitchPath = 'M 23 15 H 157 L 160 151 L 137 163 L 114 150 L 90 167 L 66 150 L 43 163 L 20 151 Z';
              break;
            case 'Hooved':
            default:
              // Rounded apothecary / saddle-cloth medallion
              outerPath = 'M 22 10 H 158 Q 168 10 168 22 V 116 Q 168 172 90 176 Q 12 172 12 116 V 22 Q 12 10 22 10 Z';
              stitchPath = 'M 27 17 H 153 Q 161 17 161 26 V 114 Q 161 164 90 168 Q 19 164 19 114 V 26 Q 19 17 27 17 Z';
              break;
          }

          const patId = `carvingPatchTex-${tribe}-${isChosen ? 'hi' : 'lo'}`;
          return (
            <svg viewBox="0 0 180 184" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_14px_24px_rgba(0,0,0,0.9)]">
              <defs>
                <pattern id={patId} patternUnits="userSpaceOnUse" width="180" height="184">
                  <image
                    href={`${import.meta.env.BASE_URL || './'}assets/text/patches.jpg`}
                    width="180"
                    height="184"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={fillTop} stopOpacity={isChosen ? '0.42' : '0.52'} />
                  <stop offset="100%" stopColor={fillBot} stopOpacity={isChosen ? '0.58' : '0.68'} />
                </linearGradient>
              </defs>
              <path d={outerPath} fill={`url(#${patId})`} />
              <path d={outerPath} fill={`url(#${gradId})`} stroke={strokeCol} strokeWidth={isChosen ? '2.2' : '1.6'} strokeLinejoin="round" />
              <path d={stitchPath} fill="none" stroke={isChosen ? '#f4d78b' : '#b48d59'} strokeWidth="1.2" strokeDasharray="4 3.5" opacity={isChosen ? '0.95' : '0.6'} />
            </svg>
          );
        };

        return (
          <div
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 overflow-y-auto md:overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('tribeeventbg.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.32)_0%,rgba(5,3,2,0.9)_100%)] pointer-events-none" />
            {renderActWeather('absolute inset-0 z-[5]', 'totem-carving')}

            <div className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    The Weaver&apos;s Weft
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Tribal Patches
                </h1>

              </div>

              {/* Center Stage: Continuous Wooden Rod + Aligned Hooks + Shaped Patches + Curved Thread Connector */}
              <div className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-center px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6 pb-2 sm:pb-4">
                <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#9a7342]/70" />
                <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#9a7342]/70" />
                <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#9a7342]/70" />
                <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#9a7342]/70" />

                {/* Hanging Assembly (Crossbar + 3 Strictly Aligned Columns) */}
                <div className="relative z-20 w-full max-w-3xl flex flex-col items-center">
                  {/* Continuous Timber Crossbar positioned directly behind the per-column brass rings */}
                  <div
                    className="pointer-events-none absolute top-[6px] left-2 right-2 h-3 rounded-full border border-[#8c6747]/90 shadow-[0_6px_14px_rgba(0,0,0,0.95)] z-10"
                    style={{
                      backgroundColor: '#3c281b',
                      backgroundImage: `linear-gradient(to bottom, rgba(112,80,54,0.5), rgba(50,33,21,0.64), rgba(22,14,9,0.84)), url("${import.meta.env.BASE_URL || './'}assets/text/wood.jpg")`,
                      backgroundSize: '140px 140px',
                      backgroundRepeat: 'repeat',
                    }}
                  >
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#2c1d13] border-2 border-[#a87e52]" />
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#2c1d13] border-2 border-[#a87e52]" />
                  </div>

                  {/* Three Equal Columns: Brass Ring + Twine + Distinctly Shaped Patch all share exact column center */}
                  <div className="relative z-20 w-full grid grid-cols-3">
                    {tribesToShow.map((tribe: any) => {
                      const isChosen = carvingPickedTribe === tribe;
                      const isDimmed = Boolean(carvingPickedTribe) && !isChosen;

                      return (
                        <div key={tribe} className="flex flex-col items-center">
                          {/* Brass Ring locked onto the timber bar */}
                          <div
                            className={`w-4 h-4 mt-[4px] rounded-full border-2 transition-colors duration-300 z-20 ${
                              isChosen
                                ? 'border-[#fde68a] bg-[#2a1d10] shadow-[0_0_10px_rgba(253,230,138,0.75)]'
                                : 'border-[#d4af37] bg-[#1a110a]'
                            }`}
                          />
                          {/* Twine dropping straight from ring center into patch grommet */}
                          <div className="w-[1.5px] h-5 bg-gradient-to-b from-[#d4af37]/90 to-[#8c6747]/75" />

                          {/* Distinctly Shaped Stitched Patch Button */}
                          <button
                            type="button"
                            disabled={isEventBusy}
                            onClick={() => !isEventBusy && claimCarvingTribe(tribe)}
                            className={`relative w-[108px] sm:w-[148px] lg:w-[192px] h-[112px] sm:h-[152px] lg:h-[192px] px-2 sm:px-3 lg:px-4 pt-2 sm:pt-3 lg:pt-4 pb-3 sm:pb-5 lg:pb-6 text-center transition-all duration-300 flex flex-col items-center justify-start select-none ${
                              isChosen
                                ? 'scale-105 z-20 cursor-default drop-shadow-[0_0_24px_rgba(212,175,55,0.4)]'
                                : isDimmed
                                  ? 'opacity-25 grayscale-[60%] scale-95 cursor-default'
                                  : 'cursor-pointer group hover:-translate-y-1.5 hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.28)]'
                            }`}
                          >
                            {renderPatchSilhouette(tribe, isChosen, isDimmed)}

                            {/* Brass Grommet Pin */}
                            <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#d4af37] border border-[#3a2614] shadow-[0_0_6px_rgba(212,175,55,0.8)] mb-2.5" />

                            <div className="relative z-10 w-8 h-8 sm:w-11 sm:h-11 lg:w-14 lg:h-14 mb-1 sm:mb-1.5 lg:mb-2 bg-[#1c130c]/90 border border-[#5a412a]/85 rounded-[2px] flex items-center justify-center group-hover:border-[#e5c16b]/85 shadow-inner transition-colors [&>*]:scale-[1.25] sm:[&>*]:scale-[1.7] lg:[&>*]:scale-[2.15]">
                              {TRIBE_EMBROIDERY[tribe] || <span className="text-xl">✦</span>}
                            </div>
                            <div className="relative z-10 font-['Cinzel',_serif] font-bold text-[#f2ddb7] group-hover:text-white text-sm uppercase tracking-[0.18em]">
                              {tribe}
                            </div>
                            <div className="relative z-10 w-9 h-px bg-gradient-to-r from-transparent via-[#9c7847]/75 to-transparent my-1.5" />
                            <div className="relative z-10 font-mono text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#c7a77a]/85 group-hover:text-[#f4d78b] transition-colors">
                              {isChosen ? 'Unraveling...' : '› Tug Thread ‹'}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Curved Crimson-Gold Thread Bridge connecting whichever patch was picked directly into the box below */}
                  <div className="pointer-events-none relative w-full h-5 sm:h-7 lg:h-10 -my-1 z-10">
                    <svg viewBox="0 0 600 44" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      {pickedIdx !== -1 ? (
                        <>
                          <path
                            d={`M ${threadStartX} -4 C ${threadStartX} 24, 300 18, 300 44`}
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeDasharray="260"
                            style={{ animation: 'patchThreadDraw 0.48s ease-out forwards' }}
                          />
                          <path
                            d={`M ${threadStartX} -4 C ${threadStartX} 24, 300 18, 300 44`}
                            fill="none"
                            stroke="#f4d78b"
                            strokeWidth="1.1"
                            strokeDasharray="6 6"
                            opacity="0.85"
                          />
                          <circle cx="300" cy="43" r="3.5" fill="#f4d78b" />
                        </>
                      ) : (
                        /* Subtle dormant guide threads from all 3 swatches converging into the summoning cloth */
                        [100, 300, 500].map(sx => (
                          <path
                            key={sx}
                            d={`M ${sx} -2 C ${sx} 22, 300 20, 300 44`}
                            fill="none"
                            stroke="#6e5035"
                            strokeWidth="1"
                            strokeDasharray="3 4"
                            opacity="0.38"
                          />
                        ))
                      )}
                    </svg>
                  </div>
                </div>

                {/* Lower Woven Summoning Cloth (anchored cleanly at center x=300 where the thread lands) */}
                <div className="relative z-10 w-full max-w-[210px] sm:max-w-[236px] min-h-[96px] sm:min-h-[124px] lg:min-h-[152px] flex flex-col items-center justify-center rounded-[3px] bg-[#0c0806]/90 border border-[#4a3322]/85 px-3 sm:px-4 py-2 sm:py-3 shadow-[inset_0_0_24px_rgba(0,0,0,0.85)]">
                  <span className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#1a120b] border-t border-l border-[#9a7342]/80" />
                  <span className="pointer-events-none absolute inset-1.5 rounded-[2px] border border-dashed border-[#5c4028]/35" />
                  {carvingSummonedCard ? (
                    <div className="relative z-10 flex flex-col items-center animate-menu-fade-in">
                      <span className="mb-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#1f160c]/95 border border-[#d4af37]/85 text-[8.5px] font-mono font-bold uppercase tracking-[0.22em] text-[#f4d78b]">
                        Woven From {carvingPickedTribe}
                      </span>
                      <div className="scale-[0.92] origin-center rounded-[4px] shadow-[0_0_36px_rgba(212,175,55,0.5)]">
                        {renderCard(carvingSummonedCard, { isClickable: false, disableHoverScale: true })}
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-2.5 text-[#9c8262]">
                      <div className="w-14 h-14 rounded-full bg-[#150e09]/90 border border-dashed border-[#7a5838]/65 shadow-[inset_0_0_14px_rgba(0,0,0,0.85)] flex items-center justify-center">
                        <svg viewBox="0 0 32 32" className="w-8 h-8 text-[#d4ad6a]/90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M25 5L7 25" />
                          <ellipse cx="23.5" cy="6.5" rx="1.6" ry="3" transform="rotate(45 23.5 6.5)" />
                          <path d="M24 6C28 10 26 18 19 20C14 21.5 13 26 17 27" stroke="#dc2626" strokeWidth="1.4" strokeDasharray="2.5 2" />
                        </svg>
                      </div>
                      <span className="font-['Cinzel',_serif] text-[10px] uppercase tracking-[0.22em] text-[#cbb28a]/85">
                        {carvingPickedTribe ? `Weaving ${carvingPickedTribe}...` : 'Pull a Patch'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          COSTLY BARGAIN SCREEN
         ========================================================================= */}
      {screen === 'EVENT_COST_BARGAIN' && (() => {
        const choicesToShow = costChoices.length > 0 ? costChoices : (['1 Blood', '2 Blood', 'Bones'] as const);

        const renderCostEmblem = (costType: string) => {
          if (costType === 'Bones') {
            return (
              <svg viewBox="0 0 56 56" className="w-14 h-14 text-[#e5dcc8]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 15c-2.8-2.2-6.5 1.2-4.4 4.4 1.3 2 .9 3.5-.6 4.6 3.3 1.7 5.5-.5 7.2-2.2l17.6 17.6c-1.7 1.7-3.9 3.9-2.2 7.2 1.1-1.5 2.6-1.9 4.6-.6 3.2 2.1 6.6-1.6 4.4-4.4-1.3-2-.9-3.5.6-4.6-3.3-1.7-5.5.5-7.2 2.2L17.4 21.6c1.7-1.7 3.9-3.9 2.2-7.2-1.1 1.5-2.6 1.9-4.6.6Z" fill="rgba(229,220,200,0.16)" />
              </svg>
            );
          }
          const drops = costType.startsWith('3') ? 3 : costType.startsWith('2') ? 2 : 1;
          const xs = drops === 1 ? [28] : drops === 2 ? [19, 37] : [13, 28, 43];
          return (
            <svg viewBox="0 0 56 56" className="w-14 h-14 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              {xs.map((cx, i) => (
                <path
                  key={i}
                  d={`M ${cx} 13 C ${cx} 13, ${cx + 8} 25, ${cx + 8} 32 A 8 8 0 1 1 ${cx - 8} 32 C ${cx - 8} 25, ${cx} 13, ${cx} 13 Z`}
                  fill="rgba(220,38,38,0.42)"
                />
              ))}
            </svg>
          );
        };

        return (
          <div
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('costeventbg.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.32)_0%,rgba(5,3,2,0.92)_100%)] pointer-events-none" />
            {renderActWeather('absolute inset-0 z-[5]', 'cost-bargain')}

            <div className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    Unmarked Wares
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Blood &amp; Bone Pact
                </h1>
              </div>

              {/* Candlelit Merchant Counter Stage */}
              <div className="relative w-full max-w-3xl my-auto flex flex-col items-center justify-center gap-6 px-8 py-7">

                {/* Subtle Countertop Wood Plank Line */}
                <div className="pointer-events-none absolute inset-x-0 bottom-14 h-px bg-gradient-to-r from-transparent via-[#5e4128]/70 to-transparent" />

                {/* Three Wax-Sealed Offerings */}
                <div className="relative z-10 w-full max-w-3xl flex-1 flex items-center justify-center">
                  <div className="w-full grid grid-cols-3 gap-5 sm:gap-8 items-center justify-items-center">
                    {choicesToShow.map((costType: any) => {
                      const isBones = costType === 'Bones';
                      const isPicked = costBargainPickedType === costType;
                      const isDimmed = Boolean(costBargainPickedType) && !isPicked;

                      if (isPicked && costBargainRevealedCard) {
                        return (
                          <div
                            key={costType}
                            className="flex flex-col items-center justify-center animate-menu-fade-in"
                          >
                            <span className="mb-2 px-2.5 py-0.5 rounded-[2px] bg-[#1f160c]/95 border border-[#d4af37]/85 text-[8.5px] font-mono font-bold uppercase tracking-[0.22em] text-[#f4d78b]">
                              Pilfered
                            </span>
                            <div
                              className="scale-[1.12] origin-center rounded-[4px] shadow-[0_0_40px_rgba(212,175,55,0.52)]"
                              style={{ animation: 'steepleWitnessFlip 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
                            >
                              {renderCard(costBargainRevealedCard, { isClickable: false, disableHoverScale: true })}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={costType}
                          type="button"
                          disabled={isEventBusy}
                          onClick={() => !isEventBusy && claimCostBargain(costType)}
                          className={`group relative w-[166px] sm:w-[186px] h-[238px] sm:h-[258px] rounded-[5px] border-2 flex flex-col items-center justify-between p-4 transition-all duration-300 select-none overflow-hidden ${
                            isPicked
                              ? 'border-[#f4d78b] bg-gradient-to-b from-[#2b1c12] to-[#140c08] scale-105 shadow-[0_0_32px_rgba(212,175,55,0.45)] cursor-default'
                              : isDimmed
                                ? 'opacity-25 grayscale-[60%] scale-95 border-[#38271b] bg-[#110b08] cursor-default'
                                : isBones
                                  ? 'cursor-pointer border-[#6e6354]/90 hover:border-[#efe5d4] bg-gradient-to-b from-[#1f1a16] via-[#15110e] to-[#0d0a08] hover:-translate-y-2 shadow-[0_18px_36px_rgba(0,0,0,0.92)] hover:shadow-[0_22px_42px_rgba(229,220,200,0.2)]'
                                  : 'cursor-pointer border-[#782b22]/90 hover:border-[#ef6b5b] bg-gradient-to-b from-[#24110e] via-[#170b09] to-[#0e0706] hover:-translate-y-2 shadow-[0_18px_36px_rgba(0,0,0,0.92)] hover:shadow-[0_22px_42px_rgba(220,38,38,0.24)]'
                          }`}
                        >
                          {/* Inner Cardback Filigree Frame */}
                          <div className="pointer-events-none absolute inset-2.5 rounded-[3px] border border-dashed border-[#8a6a44]/45" />

                          <span className="relative z-10 text-[9px] font-mono uppercase tracking-[0.26em] text-[#b49670]/80">
                            Sealed
                          </span>

                          {/* Embossed Wax Seal Medallion */}
                          <div
                            className={`relative z-10 w-24 h-24 rounded-full border-2 flex items-center justify-center shadow-[inset_0_0_18px_rgba(0,0,0,0.85),0_6px_16px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover:scale-105 ${
                              isBones
                                ? 'bg-gradient-to-b from-[#332e27] to-[#1b1814] border-[#b5a994]/80'
                                : 'bg-gradient-to-b from-[#591512] to-[#2b0908] border-[#c7483c]/85'
                            }`}
                            style={{
                              animation: isPicked ? 'waxSealCrack 0.42s ease-in forwards' : undefined,
                            }}
                          >
                            {renderCostEmblem(costType)}
                          </div>

                          <div className="relative z-10 flex flex-col items-center">
                            <span className="font-['Cinzel',_serif] font-bold text-[#f2ddb7] group-hover:text-white uppercase tracking-[0.18em] text-sm">
                              {costType}
                            </span>
                            <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#bfa073]/75 group-hover:text-[#f4d78b]">
                              {isPicked ? 'Breaking Seal...' : '› Pilfer ‹'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stark Cinzel Footer */}
                <div className="relative z-20 pt-2 shrink-0">
                  <p className="font-['Cinzel',_serif] text-sm sm:text-base italic tracking-[0.1em] text-[#e5cfa8] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                    &ldquo;The Merchant sleeps.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          BONE LORD SCREEN
         ========================================================================= */}
      {screen === 'EVENT_BONE_LORD' && (() => {
        const selectedCard = boneLordStageData
          ? boneLordStageData.card
          : boneLordSelectedIdx !== null
            ? masterDeck[boneLordSelectedIdx] || null
            : null;
        const isGoatPreview = selectedCard?.name === 'Black Goat';
        const previewBonus = boneLordStageData ? boneLordStageData.bonus : isGoatPreview ? 3 : 1;
        const isAnimating = boneLordAnimPhase !== 'idle';

        return (
          <div
            className="absolute inset-0 bg-[#0b0908] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('bonelordevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,12,11,0.34)_0%,rgba(4,3,3,0.92)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_bone_lord')}
            <div className="relative z-10 max-w-6xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#8a8275]/70 to-[#d9d0c1]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c7beb0]">
                    The Bone Lord
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#8a8275]/70 to-[#d9d0c1]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#ece5d8] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Ancient Altar of Bones
                </h1>
              </div>

              {/* Two-Column Split: Ossuary Skull Pedestal Left, Deck Selector Right */}
              <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* LEFT COLUMN: Ossuary Pedestal & Horned Skull Prop + Stylized Inscription + Offer Button */}
                <div className="lg:col-span-7 flex flex-col items-center justify-between gap-3 min-h-0">
                  <div className="relative w-full flex-1 min-h-0 px-6 py-5 flex flex-col items-center justify-between">
                    {/* Ambient Ivory / Ember Aura */}
                    <div
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                        boneLordAnimPhase === 'blessed'
                          ? 'opacity-95'
                          : boneLordAnimPhase === 'offering'
                            ? 'opacity-85'
                            : 'opacity-40'
                      }`}
                      style={{
                        background:
                          boneLordAnimPhase === 'blessed'
                            ? 'radial-gradient(circle at 50% 48%, rgba(234,179,8,0.28) 0%, rgba(214,202,184,0.16) 46%, transparent 74%)'
                            : 'radial-gradient(circle at 50% 52%, rgba(214,202,184,0.18) 0%, rgba(120,105,90,0.1) 48%, transparent 74%)',
                      }}
                    />

                    <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#a89f90]/70" />
                    <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#a89f90]/70" />
                    <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#a89f90]/70" />
                    <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#a89f90]/70" />

                    {/* Centerpiece: Offering Card above Horned Bone Lord Skull Pedestal */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full my-auto pt-2">
                      {/* Rising Bone Tokens during Blessing */}
                      {boneLordAnimPhase !== 'idle' && (
                        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
                          {(previewBonus === 3 ? [-42, 0, 42] : [0]).map((xOff, i) => (
                            <div
                              key={i}
                              className="absolute bottom-24 text-2xl drop-shadow-[0_0_12px_rgba(254,243,199,0.9)]"
                              style={{
                                marginLeft: `${xOff}px`,
                                animation: `boneTokenRise 1.15s ease-out ${i * 0.16}s forwards`,
                              }}
                            >
                              🦴
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Offering Card (clickable to return to side deck) or Manifested Boon Medallion */}
                      <div className="relative z-20 w-[124px] h-[168px] -mb-6 flex items-center justify-center">
                        {boneLordAnimPhase === 'blessed' ? (
                          <div className="flex flex-col items-center justify-center px-5 py-4 rounded-[4px] bg-[#1a1612]/95 border-2 border-[#e5d5b7]/90 shadow-[0_0_38px_rgba(234,179,8,0.5)] animate-menu-fade-in">
                            <span className="text-3xl mb-1">🦴</span>
                            <span className="font-['Cinzel',_serif] font-black text-xl text-amber-200 tracking-wider">
                              +{previewBonus}
                            </span>
                            <span className="text-[8.5px] font-mono uppercase tracking-[0.22em] text-[#d6cbb8] mt-0.5 whitespace-nowrap">
                              Starting Bone{previewBonus > 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              animation: boneLordAnimPhase === 'offering' ? 'boneOfferDissolve 0.88s ease-in forwards' : undefined,
                            }}
                          >
                            {selectedCard ? (
                              <div
                                onClick={() => {
                                  if (!isEventBusy && !isAnimating) {
                                    triggerSfx('draw');
                                    setBoneLordSelectedIdx(null);
                                  }
                                }}
                                title="Click to return creature to deck"
                                className="group relative scale-[1.06] origin-center cursor-pointer transition-transform duration-200 hover:-translate-y-1 shadow-[0_16px_32px_rgba(0,0,0,0.95)]"
                              >
                                {renderCard(selectedCard, { isClickable: false, disableHoverScale: true, isMarkedSacrifice: true })}
                              </div>
                            ) : (
                              <div className="w-[112px] h-[156px] rounded-[4px] border border-dashed border-[#786e60]/75 bg-[#12100e]/75 flex flex-col items-center justify-center gap-1.5 text-[#a69a88]">
                                <span className="text-xl opacity-70">💀</span>
                                <span className="text-[9.5px] uppercase tracking-[0.2em] px-2">Place Tribute</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Carved Ossuary Skull & Ribcage Pedestal SVG Prop */}
                      <svg
                        viewBox="0 0 460 124"
                        className="w-full max-w-[475px] h-auto translate-y-4 scale-y-[1.18] origin-bottom drop-shadow-[0_18px_28px_rgba(0,0,0,0.98)] pointer-events-none relative z-20"
                      >
                        <defs>
                          <linearGradient id="ossuaryBone" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#d6cbb8" />
                            <stop offset="55%" stopColor="#8c8172" />
                            <stop offset="100%" stopColor="#3d3730" />
                          </linearGradient>
                          <linearGradient id="ossuaryStone" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#332e29" />
                            <stop offset="100%" stopColor="#12100e" />
                          </linearGradient>
                        </defs>
                        <path d="M126 42 C72 34, 48 16, 40 6 C58 26, 86 48, 134 56" fill="none" stroke="url(#ossuaryBone)" strokeWidth="5.5" strokeLinecap="round" />
                        <path d="M334 42 C388 34, 412 16, 420 6 C402 26, 374 48, 326 56" fill="none" stroke="url(#ossuaryBone)" strokeWidth="5.5" strokeLinecap="round" />
                        <polygon points="62,118 86,58 374,58 398,118" fill="url(#ossuaryStone)" stroke="#5c5348" strokeWidth="1.6" />
                        <polygon points="34,58 60,34 400,34 426,58" fill="#292420" stroke="#807567" strokeWidth="1.9" />
                        <ellipse cx="230" cy="44" rx="132" ry="9" fill="#171412" stroke="#6b6054" strokeWidth="1.2" />
                        <path
                          d="M196 76 C196 58, 264 58, 264 76 C264 88, 252 94, 248 106 L212 106 C208 94, 196 88, 196 76 Z"
                          fill="url(#ossuaryBone)"
                          stroke="#4a4239"
                          strokeWidth="1.6"
                        />
                        <ellipse cx="216" cy="79" rx="7.5" ry="6" fill={boneLordAnimPhase !== 'idle' ? '#fbbf24' : '#0f0c0b'} />
                        <ellipse cx="244" cy="79" rx="7.5" ry="6" fill={boneLordAnimPhase !== 'idle' ? '#fbbf24' : '#0f0c0b'} />
                        <polygon points="230,86 225,94 235,94" fill="#171310" />
                        <line x1="219" y1="98" x2="219" y2="106" stroke="#26201b" strokeWidth="2" />
                        <line x1="230" y1="98" x2="230" y2="106" stroke="#26201b" strokeWidth="2" />
                        <line x1="241" y1="98" x2="241" y2="106" stroke="#26201b" strokeWidth="2" />
                      </svg>
                    </div>

                    {/* Stylized & Enlarged Ossuary Inscription */}
                    <div className="relative z-20 w-full max-w-xl flex flex-col items-center text-center pt-1">
                      <div className="flex items-center gap-3 w-full max-w-xs mb-2 opacity-75">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8a7f70] to-[#c9bea9]" />
                        <span className="text-[10px] text-[#c9bea9]">✦</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8a7f70] to-[#c9bea9]" />
                      </div>
                      <p className="font-['Cinzel',_serif] text-base sm:text-lg tracking-[0.1em] text-[#efe5d4] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] px-3">
                        A flooding darkness envelops the chamber.
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-center shrink-0">
                    <button
                      onClick={confirmBoneLordOffering}
                      disabled={boneLordSelectedIdx === null || isEventBusy || isAnimating}
                      className="px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#2e2620] to-[#171310] hover:from-[#3d322a] hover:to-[#211b17] active:translate-y-[1px] border border-[#b5a994]/85 hover:border-[#efe5d5] text-[#f2eadc] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.88)] transition-all select-none"
                    >
                      {isAnimating ? 'The Bone Lord Consumes...' : 'Offer Sacrifice'}
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Side Deck Selector Panel (hides card currently resting on the altar) */}
                <div
                  className={`lg:col-span-5 relative flex flex-col min-h-0 rounded-[3px] bg-[#0c0a09]/84 border border-[#3f3830]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(235,225,210,0.06)] backdrop-blur-[2px] transition-opacity duration-500 ${
                    isAnimating ? 'opacity-30 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9c9282]/70" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9c9282]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9c9282]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9c9282]/70" />

                  <div className="px-4 py-3 border-b border-[#38312a]/80 flex items-center justify-between gap-2 shrink-0">
                    <div className="text-left">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-[#d6cbb8]">
                        Your Creatures ({boneLordSelectedIdx !== null ? Math.max(0, masterDeck.length - 1) : masterDeck.length})
                      </div>

                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                    <div className="flex flex-wrap gap-x-2.5 gap-y-4 justify-center content-start">
                      {masterDeck.map((c, idx) => {
                        if (boneLordSelectedIdx === idx) return null;
                        return (
                          <div
                            key={c.id || `bl-${c.name}-${idx}`}
                            onClick={() => {
                              if (isEventBusy || isAnimating) return;
                              triggerSfx('draw');
                              setBoneLordSelectedIdx(idx);
                            }}
                            className="relative flex flex-col items-center justify-center w-[104px] h-[146px] cursor-pointer transition-all duration-200 hover:-translate-y-1"
                          >
                            <div className="transform origin-center transition-transform duration-200 scale-[0.86] hover:scale-[0.91]">
                              {renderCard(c, { isClickable: true, disableHoverScale: true })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MYCOLOGISTS EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_MYCOLOGIST' && (() => {
        const twin1 = mycoStageCards
          ? mycoStageCards.twin1
          : mycoSelectedIndices[0] !== undefined
            ? masterDeck[mycoSelectedIndices[0]] || null
            : null;
        const twin2 = mycoStageCards
          ? mycoStageCards.twin2
          : mycoSelectedIndices[1] !== undefined
            ? masterDeck[mycoSelectedIndices[1]] || null
            : null;
        const fusedPreview = mycoStageCards?.fused || null;
        const isAnimating = mycoAnimPhase !== 'idle';

        return (
          <div
            style={getScreenBgStyle('weaverevent.jpg')}
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.32)_0%,rgba(5,3,2,0.9)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_mycologist')}
            <div className="relative z-10 max-w-6xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    {mycoHasDuplicates ? "The Weaver's Loom" : 'The Weaver Scoffs'}
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  {mycoHasDuplicates ? 'Sanguine Stitching' : 'Sleight of Hand'}
                </h1>
              </div>

              {!mycoHasDuplicates ? (
                /* Loom-Matched Twin Gift Stage when player has no duplicates */
                <div className="w-full max-w-4xl flex-1 min-h-0 flex flex-col items-center justify-between gap-3">
                  <div className="relative w-full flex-1 min-h-0 px-6 py-5 flex flex-col items-center justify-center">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-75"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 54%, rgba(168,85,247,0.28) 0%, rgba(153,27,27,0.16) 48%, transparent 74%)',
                      }}
                    />

                    <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-purple-400/60" />
                    <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-purple-400/60" />
                    <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-purple-400/60" />
                    <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-purple-400/60" />

                    {/* Matching Full-Scale Loom Backdrop */}
                    <svg
                      viewBox="0 0 520 340"
                      className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-95 drop-shadow-[0_18px_32px_rgba(0,0,0,0.96)]"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient id="loomTimberSolo" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#523b2c" />
                          <stop offset="55%" stopColor="#2e2017" />
                          <stop offset="100%" stopColor="#160f0b" />
                        </linearGradient>
                      </defs>
                      <rect x="34" y="28" width="452" height="18" rx="2.5" fill="url(#loomTimberSolo)" stroke="#7a5943" strokeWidth="1.8" />
                      <rect x="26" y="290" width="468" height="20" rx="2.5" fill="url(#loomTimberSolo)" stroke="#7a5943" strokeWidth="1.8" />
                      <rect x="18" y="310" width="484" height="11" rx="2" fill="#1a120d" stroke="#594030" strokeWidth="1.3" />
                      <rect x="56" y="18" width="18" height="302" rx="2" fill="url(#loomTimberSolo)" stroke="#6e503d" strokeWidth="1.6" />
                      <rect x="446" y="18" width="18" height="302" rx="2" fill="url(#loomTimberSolo)" stroke="#6e503d" strokeWidth="1.6" />
                      {[100, 132, 164, 196, 228, 260, 292, 324, 356, 388, 420].map((xPos, idx) => (
                        <line
                          key={idx}
                          x1={xPos}
                          y1="46"
                          x2={xPos}
                          y2="290"
                          stroke="#9333ea"
                          strokeWidth="1.25"
                          strokeDasharray="4 3"
                          opacity="0.58"
                        />
                      ))}
                      <path
                        d="M74 68 L446 270 M446 68 L74 270"
                        stroke="#991b1b"
                        strokeWidth="1.6"
                        opacity="0.6"
                      />
                    </svg>

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span className="mb-3 px-3 py-0.5 rounded-[2px] bg-[#1e1224]/92 border border-purple-400/75 text-[9px] font-mono font-bold uppercase tracking-[0.22em] text-purple-200">
                        Spun From Sinew
                      </span>

                      {mycoOfferedCard && (
                        <div className="scale-[1.12] origin-center rounded-[4px] shadow-[0_0_44px_rgba(168,85,247,0.55),0_18px_36px_rgba(0,0,0,0.95)] my-2">
                          {renderCard(mycoOfferedCard, { isClickable: false, disableHoverScale: true })}
                        </div>
                      )}

                      <p className="mt-4 font-['Cinzel',_serif] italic text-sm sm:text-base tracking-[0.1em] text-[#e8d9f0] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                        &ldquo;No twins? Take one from the loom.&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={claimMycologistDuplicate}
                      disabled={!mycoOfferedCard || isEventBusy}
                      className="px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#2f1d36] to-[#180f1c] hover:from-[#3e2647] hover:to-[#221528] active:translate-y-[1px] border border-purple-400/80 hover:border-purple-300 text-purple-100 hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.88)] transition-all select-none"
                    >
                      Claim Twin
                    </button>
                  </div>
                </div>
              ) : (
                /* Two-Column Split: Weaver's Loom Stage Left, Deck Selector Right */
                <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* LEFT COLUMN: Weaver's Loom Prop + Sew Button */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-between gap-3 min-h-0">
                    <div className="relative w-full flex-1 min-h-0 px-6 py-4 flex flex-col items-center justify-center">
                      <div
                        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                          mycoAnimPhase === 'sewing'
                            ? 'opacity-100'
                            : mycoAnimPhase === 'woven'
                              ? 'opacity-90'
                              : 'opacity-40'
                        }`}
                        style={{
                          background:
                            mycoAnimPhase === 'woven'
                              ? 'radial-gradient(circle at 50% 62%, rgba(168,85,247,0.38) 0%, rgba(126,34,206,0.16) 48%, transparent 74%)'
                              : 'radial-gradient(circle at 50% 54%, rgba(147,51,234,0.24) 0%, rgba(153,27,27,0.14) 50%, transparent 74%)',
                        }}
                      />

                      <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-purple-400/60" />
                      <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-purple-400/60" />
                      <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-purple-400/60" />
                      <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-purple-400/60" />

                      {/* Full-Scale Loom Backdrop Positioned Behind the Cards */}
                      <svg
                        viewBox="0 0 520 340"
                        className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-95 drop-shadow-[0_18px_32px_rgba(0,0,0,0.96)]"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <linearGradient id="loomTimber" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#523b2c" />
                            <stop offset="55%" stopColor="#2e2017" />
                            <stop offset="100%" stopColor="#160f0b" />
                          </linearGradient>
                        </defs>
                        {/* Top & Bottom Timber Crossbeams */}
                        <rect x="34" y="28" width="452" height="18" rx="2.5" fill="url(#loomTimber)" stroke="#7a5943" strokeWidth="1.8" />
                        <rect x="26" y="290" width="468" height="20" rx="2.5" fill="url(#loomTimber)" stroke="#7a5943" strokeWidth="1.8" />
                        <rect x="18" y="310" width="484" height="11" rx="2" fill="#1a120d" stroke="#594030" strokeWidth="1.3" />
                        {/* Tall Left & Right Timber Uprights */}
                        <rect x="56" y="18" width="18" height="302" rx="2" fill="url(#loomTimber)" stroke="#6e503d" strokeWidth="1.6" />
                        <rect x="446" y="18" width="18" height="302" rx="2" fill="url(#loomTimber)" stroke="#6e503d" strokeWidth="1.6" />
                        {/* Vertical Sinew Warp Threads Spanning Full Frame Behind Cards */}
                        {[100, 132, 164, 196, 228, 260, 292, 324, 356, 388, 420].map((xPos, idx) => (
                          <line
                            key={idx}
                            x1={xPos}
                            y1="46"
                            x2={xPos}
                            y2="290"
                            stroke={mycoAnimPhase !== 'idle' ? '#c084fc' : '#6b21a8'}
                            strokeWidth="1.25"
                            strokeDasharray="4 3"
                            opacity="0.58"
                          />
                        ))}
                        {/* Subtle Cross-Webbing Behind Center */}
                        <path
                          d="M74 68 L446 270 M446 68 L74 270"
                          stroke={mycoAnimPhase === 'sewing' ? '#f43f5e' : '#7f1d1d'}
                          strokeWidth="1.6"
                          opacity="0.55"
                        />
                      </svg>

                      {/* Cards Centered Directly Over the Loom Warp Threads */}
                      <div className="relative z-10 flex items-center justify-center w-full h-full">
                        {mycoAnimPhase === 'woven' && fusedPreview ? (
                          <div className="flex flex-col items-center animate-menu-fade-in">
                            <span className="mb-2 px-3 py-0.5 rounded-[2px] bg-[#22112b]/95 border border-purple-400/90 text-[9px] font-mono font-bold uppercase tracking-[0.22em] text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.45)]">
                              Stitched Vessel
                            </span>
                            <div className="scale-[1.12] origin-center rounded-[4px] shadow-[0_0_46px_rgba(168,85,247,0.8),0_0_24px_rgba(220,38,38,0.5)]">
                              {renderCard(fusedPreview, { isClickable: false, disableHoverScale: true })}
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex items-center justify-center gap-12 sm:gap-16">
                            {/* Twin I */}
                            <div
                              className="flex flex-col items-center"
                              style={{
                                animation: mycoAnimPhase === 'sewing' ? 'loomTwinConvergeLeft 0.9s ease-in-out forwards' : undefined,
                              }}
                            >
                              <span className="mb-2 px-2.5 py-0.5 rounded-[2px] bg-[#1e1224]/92 border border-purple-400/75 text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] text-purple-200">
                                Twin I
                              </span>
                              <div className="w-[116px] h-[160px] flex items-center justify-center">
                                {twin1 ? (
                                  <div
                                    onClick={() => {
                                      if (isAnimating) return;
                                      triggerSfx('draw');
                                      setMycoSelectedIndices((prev: number[]) => prev.slice(1));
                                    }}
                                    title={!isAnimating ? 'Click to return Twin I to deck' : undefined}
                                    className={`scale-[1.02] origin-center shadow-[0_16px_32px_rgba(0,0,0,0.92)] ${!isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                                  >
                                    {renderCard(twin1, { isClickable: false, disableHoverScale: true })}
                                  </div>
                                ) : (
                                  <div className="w-[110px] h-[154px] rounded-[4px] border border-dashed border-purple-500/55 bg-[#120b14]/78 flex flex-col items-center justify-center gap-1.5 text-purple-300/65">
                                    <span className="text-[9px] uppercase tracking-[0.22em]">Twin I</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Twin II */}
                            <div
                              className="flex flex-col items-center"
                              style={{
                                animation: mycoAnimPhase === 'sewing' ? 'loomTwinConvergeRight 0.9s ease-in-out forwards' : undefined,
                              }}
                            >
                              <span className="mb-2 px-2.5 py-0.5 rounded-[2px] bg-[#1e1224]/92 border border-purple-400/75 text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] text-purple-200">
                                Twin II
                              </span>
                              <div className="w-[116px] h-[160px] flex items-center justify-center">
                                {twin2 ? (
                                  <div
                                    onClick={() => {
                                      if (isAnimating) return;
                                      triggerSfx('draw');
                                      setMycoSelectedIndices((prev: number[]) => prev.slice(0, 1));
                                    }}
                                    title={!isAnimating ? 'Click to return Twin II to deck' : undefined}
                                    className={`scale-[1.02] origin-center shadow-[0_16px_32px_rgba(0,0,0,0.92)] ${!isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                                  >
                                    {renderCard(twin2, { isClickable: false, disableHoverScale: true })}
                                  </div>
                                ) : (
                                  <div className="w-[110px] h-[154px] rounded-[4px] border border-dashed border-purple-500/55 bg-[#120b14]/78 flex flex-col items-center justify-center gap-1.5 text-purple-300/65">
                                    <span className="text-[9px] uppercase tracking-[0.22em]">Twin II</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Foreground Active Bone Needle & Crimson Zig-Zag Stitch Right Over the Cards */}
                            {mycoAnimPhase === 'sewing' && (
                              <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
                                <svg viewBox="0 0 180 200" className="w-44 h-52 overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
                                  {/* Crimson Cross-Stitches Binding the Center Seam */}
                                  <path
                                    d="M 62 34 L 118 52 L 62 72 L 118 92 L 62 112 L 118 132 L 62 152 L 118 168"
                                    fill="none"
                                    stroke="#f43f5e"
                                    strokeWidth="3.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="320"
                                    style={{ animation: 'loomSeamStitchDraw 0.85s ease-out forwards' }}
                                  />
                                  {/* Sweeping Bone Needle */}
                                  <g style={{ animation: 'loomNeedleSweep 0.85s ease-in-out forwards' }}>
                                    <polygon points="34,96 138,96 154,100 138,104 34,104 22,100" fill="#efe4d0" stroke="#5c4d3c" strokeWidth="1.4" />
                                    <ellipse cx="44" cy="100" rx="4" ry="2" fill="#7e22ce" />
                                  </g>
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-center shrink-0">
                      <button
                        onClick={confirmMycologistCombine}
                        disabled={
                          isEventBusy ||
                          isAnimating ||
                          mycoSelectedIndices.length !== 2 ||
                          masterDeck[mycoSelectedIndices[0]]?.name !== masterDeck[mycoSelectedIndices[1]]?.name
                        }
                        className="px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#2f1d36] to-[#180f1c] hover:from-[#3e2647] hover:to-[#221528] active:translate-y-[1px] border border-purple-400/80 hover:border-purple-300 text-purple-100 hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.88)] transition-all select-none"
                      >
                        {isAnimating ? 'Stitching Flesh...' : 'Sew Creatures'}
                      </button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Side Deck Selector Panel */}
                  <div
                    className={`lg:col-span-5 relative flex flex-col min-h-0 rounded-[3px] bg-[#0d0806]/84 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,228,185,0.06)] backdrop-blur-[2px] transition-opacity duration-500 ${
                      isAnimating ? 'opacity-30 pointer-events-none' : 'opacity-100'
                    }`}
                  >
                    <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9a7342]/70" />

                    <div className="px-4 py-3 border-b border-[#3a2618]/80 flex items-center justify-between gap-2 shrink-0">
                      <div className="text-left">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-[#c79d5a]">
                          Your Creatures ({masterDeck.length})
                        </div>

                      </div>
                      {mycoSelectedIndices.length > 0 && !isAnimating && (
                        <button
                          type="button"
                          onClick={() => setMycoSelectedIndices([])}
                          className="px-2.5 py-1 rounded-[2px] bg-[#1a110c] hover:bg-[#281a12] border border-[#5a3d28] text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#d4bfa0] cursor-pointer transition shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                      <div className="flex flex-wrap gap-x-2.5 gap-y-4 justify-center content-start">
                        {masterDeck.map((c, idx) => {
                          const selPos = mycoSelectedIndices.indexOf(idx);
                          const isSelected = selPos !== -1;
                          if (isSelected) return null;
                          const isDuplicateCard = masterDeck.filter(card => card.name === c.name).length >= 2;
                          const firstPickedName = mycoSelectedIndices.length > 0 ? masterDeck[mycoSelectedIndices[0]]?.name : null;
                          const wrongTwin = Boolean(firstPickedName && c.name !== firstPickedName);
                          const isDisabled = !isDuplicateCard || wrongTwin;

                          return (
                            <div
                              key={c.id || `myco-${c.name}-${idx}`}
                              onClick={() => {
                                if (isDisabled || isAnimating) return;
                                triggerSfx('draw');
                                if (mycoSelectedIndices.includes(idx)) {
                                  setMycoSelectedIndices((prev: number[]) => prev.filter((i: number) => i !== idx));
                                } else if (mycoSelectedIndices.length < 2) {
                                  setMycoSelectedIndices((prev: number[]) => [...prev, idx]);
                                }
                              }}
                              className={`relative flex flex-col items-center justify-center w-[104px] h-[146px] transition-all duration-200 ${
                                isDisabled
                                  ? 'opacity-30 grayscale-[55%] cursor-not-allowed'
                                  : isSelected
                                    ? '-translate-y-1.5 z-30 cursor-pointer'
                                    : 'hover:-translate-y-1 cursor-pointer'
                              }`}
                            >
                              {isSelected && (
                                <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-[2px] bg-[#1e1224]/95 border border-purple-400/85 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-purple-200 whitespace-nowrap shadow-md">
                                  Twin {selPos === 0 ? 'I' : 'II'}
                                </span>
                              )}
                              <div className={`transform origin-center transition-transform duration-200 ${isSelected ? 'scale-[0.9]' : 'scale-[0.86] hover:scale-[0.91]'}`}>
                                {renderCard(c, { isSelected, isClickable: !isDisabled, disableHoverScale: true })}
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
      })()}

      {/* =========================================================================
          THE BEGOTTEN'S PRINTING PRESS EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_GOOBERT' && (() => {
        const originalPreview = goobertOriginalSnapshot
          || (goobertSelectedIdx !== null ? masterDeck[goobertSelectedIdx] || null : null);
        const isAnimating = goobertStamping || Boolean(goobertStampedCard);

        return (
          <div
            className="absolute inset-0 bg-[#090d0b] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('begottenboss.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,26,21,0.38)_0%,rgba(4,8,7,0.92)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_goobert')}
            <div className="relative z-10 max-w-6xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-teal-600/70 to-teal-300/80" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-teal-400/90">
                    The Begotten&apos;s Workshop
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-teal-600/70 to-teal-300/80" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-teal-200 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Printing Press
                </h1>
              </div>

              {/* Two-Column Split: Rotary Printing Press Stage Left, Deck Selector Right */}
              <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* LEFT COLUMN: Heavy Rotary Printing Press Prop + Stamp Button */}
                <div className="lg:col-span-7 flex flex-col items-center justify-between gap-3 min-h-0">
                  <div className="relative w-full flex-1 min-h-0 px-6 py-4 flex flex-col items-center justify-between">
                    <div
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                        goobertStampedCard ? 'opacity-95' : goobertStamping ? 'opacity-80' : 'opacity-40'
                      }`}
                      style={{
                        background:
                          'radial-gradient(circle at 50% 60%, rgba(20,184,166,0.28) 0%, rgba(13,148,136,0.12) 48%, transparent 74%)',
                      }}
                    />

                    <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-teal-500/65" />
                    <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-teal-500/65" />
                    <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-teal-500/65" />
                    <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-teal-500/65" />

                    {/* Press Assembly Container: Platen travels down along the guide rails all the way onto the press bed */}
                    <div className="relative z-20 flex flex-col items-center justify-end w-full flex-1 min-h-0 pt-16">
                      {/* Upper Press Platen & Threaded Screw Shaft (resting at -196px; drops to translateY(0) flush on bed) */}
                      <div
                        className="pointer-events-none absolute bottom-[52px] inset-x-0 z-40 flex flex-col items-center"
                        style={{
                          transform: goobertStamping ? undefined : 'translateY(-196px)',
                          animation: goobertStamping ? 'pressPlatenSlam 1.85s linear forwards' : undefined,
                        }}
                      >
                        <svg viewBox="0 0 460 296" className="w-full max-w-[465px] h-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.98)]">
                          <defs>
                            <linearGradient id="pressIronBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3c4a46" />
                              <stop offset="55%" stopColor="#202926" />
                              <stop offset="100%" stopColor="#101513" />
                            </linearGradient>
                            <linearGradient id="pressFacePlate" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#26312e" />
                              <stop offset="60%" stopColor="#171f1c" />
                              <stop offset="100%" stopColor="#0d1210" />
                            </linearGradient>
                          </defs>
                          {/* Turned Stamp Handle & Brass Collar */}
                          <defs>
                            <linearGradient id="stampHandleWood" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#1b2421" />
                              <stop offset="35%" stopColor="#3b4d47" />
                              <stop offset="68%" stopColor="#26332f" />
                              <stop offset="100%" stopColor="#121816" />
                            </linearGradient>
                          </defs>
                          {/* Ergonomic Bulbous Stamp Grip */}
                          <path
                            d="M230 112 C202 112, 192 134, 198 156 C203 174, 214 186, 214 204 L214 218 L246 218 L246 204 C246 186, 257 174, 262 156 C268 134, 258 112, 230 112 Z"
                            fill="url(#stampHandleWood)"
                            stroke="#6c857d"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                          {/* Specular Highlight on Handle Dome */}
                          <path
                            d="M214 126 C207 136, 207 150, 212 162"
                            fill="none"
                            stroke="#8aa89e"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.45"
                          />
                          {/* Flared Metal Ferrule / Collar Seated on Platen */}
                          <path
                            d="M206 218 L254 218 L264 232 L196 232 Z"
                            fill="#2b3834"
                            stroke="#6f877f"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                          <line x1="208" y1="224" x2="252" y2="224" stroke="#141c19" strokeWidth="1.4" />
                          {/* Heavy Cast-Iron Stamp Head & Platen Block */}
                          <rect x="52" y="232" width="356" height="24" rx="2" fill="url(#pressIronBeam)" stroke="#5f7870" strokeWidth="1.8" />
                          <rect x="64" y="256" width="332" height="28" rx="1.5" fill="url(#pressFacePlate)" stroke="#4d635c" strokeWidth="1.5" />
                          {/* Emerald Ink Contact Strip at Bottom Edge */}
                          <rect x="72" y="284" width="316" height="9" rx="1" fill="#134e4a" stroke="#2dd4bf" strokeWidth="1.1" />
                        </svg>
                      </div>

                      {goobertStamping && (
                        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                          <div
                            className="w-48 h-24 rounded-full bg-emerald-400/40 blur-md"
                            style={{ animation: 'inkSplatterBurst 0.72s ease-out forwards' }}
                          />
                        </div>
                      )}

                      <div className="relative z-20 flex items-end justify-center gap-8 sm:gap-14 -mb-6">
                        {/* Left Bed: Original Creature (squishes down & unsquishes in sync with platen) */}
                        <div className="flex flex-col items-center">
                          <span
                            className={`mb-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#091c18]/92 border border-teal-500/75 text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200 transition-opacity duration-150 ${
                              goobertStamping ? 'opacity-0' : 'opacity-100'
                            }`}
                          >
                            Original
                          </span>
                          <div
                            className="w-[108px] h-[148px] flex items-end justify-center origin-bottom"
                            style={{
                              animation: goobertStamping ? 'pressCardSquish 1.85s linear forwards' : undefined,
                            }}
                          >
                            {originalPreview ? (
                              <div
                                onClick={() => {
                                  if (isEventBusy || isAnimating) return;
                                  triggerSfx('draw');
                                  setGoobertSelectedIdx(null);
                                }}
                                title={!isEventBusy && !isAnimating ? 'Click to return card to deck' : undefined}
                                className={`scale-[0.94] origin-bottom shadow-[0_14px_28px_rgba(0,0,0,0.92)] ${!isEventBusy && !isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                              >
                                {renderCard(originalPreview, { isClickable: false, disableHoverScale: true })}
                              </div>
                            ) : (
                              <div className="w-[102px] h-[142px] rounded-[4px] border border-dashed border-teal-600/65 bg-[#07120f]/80 flex flex-col items-center justify-center gap-1.5 text-teal-400/65">
                                <span className="text-lg">📜</span>
                                <span className="text-[9px] uppercase tracking-[0.2em]">Original</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Bed: Blank Plate -> Stamped Clone (squishes down & unsquishes in sync with platen) */}
                        <div className="flex flex-col items-center">
                          <span
                            className={`mb-1.5 px-2.5 py-0.5 rounded-[2px] border text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] transition-opacity duration-150 ${
                              goobertStamping ? 'opacity-0' : 'opacity-100'
                            } ${
                              goobertStampedCard
                                ? 'bg-[#0a261d]/95 border-emerald-400/90 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.45)]'
                                : 'bg-[#0b1815]/85 border-teal-800/70 text-teal-400/75'
                            }`}
                          >
                            {goobertStampedCard ? 'Stamped Clone' : 'Imprint Plate'}
                          </span>
                          <div
                            className="w-[108px] h-[148px] flex items-end justify-center origin-bottom"
                            style={{
                              animation: goobertStamping ? 'pressCardSquish 1.85s linear forwards' : undefined,
                            }}
                          >
                            {goobertStampedCard ? (
                              <div className="scale-[0.94] origin-bottom rounded-[4px] shadow-[0_0_38px_rgba(16,185,129,0.65),0_14px_28px_rgba(0,0,0,0.92)]">
                                {renderCard(goobertStampedCard, { isClickable: false, disableHoverScale: true })}
                              </div>
                            ) : (
                              <div className="w-[102px] h-[142px] rounded-[4px] border border-dashed border-emerald-700/60 bg-[#081511]/80 flex flex-col items-center justify-center gap-1.5 text-emerald-400/60">
                                <span className="text-lg opacity-75">🧪</span>
                                <span className="text-[9px] uppercase tracking-[0.2em]">Blank Plate</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Lower Cast-Iron Press Bed SVG Prop */}
                      <svg
                        viewBox="0 0 460 76"
                        className="w-full max-w-[465px] h-auto drop-shadow-[0_16px_26px_rgba(0,0,0,0.96)] pointer-events-none"
                      >
                        <defs>
                          <linearGradient id="pressBedMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#35423e" />
                            <stop offset="55%" stopColor="#1c2422" />
                            <stop offset="100%" stopColor="#0d1210" />
                          </linearGradient>
                        </defs>
                        <rect x="52" y="4" width="12" height="44" rx="1.5" fill="#2a3532" stroke="#556b64" strokeWidth="1.2" />
                        <rect x="396" y="4" width="12" height="44" rx="1.5" fill="#2a3532" stroke="#556b64" strokeWidth="1.2" />
                        <polygon points="34,34 56,16 404,16 426,34" fill="url(#pressBedMetal)" stroke="#5c756d" strokeWidth="1.8" />
                        <rect x="34" y="34" width="392" height="14" rx="1.5" fill="#171f1d" stroke="#4c615a" strokeWidth="1.4" />
                        <path d="M110 25 Q230 31 350 25" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
                        <polygon points="62,72 78,48 382,48 398,72" fill="#131917" stroke="#42544e" strokeWidth="1.5" />
                      </svg>
                    </div>

                    <p className="relative z-20 mt-3 font-['Cinzel',_serif] text-sm sm:text-base tracking-[0.1em] text-teal-100/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                      The Begotten jeers at his press.
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-center shrink-0">
                    <button
                      onClick={confirmGoobertClone}
                      disabled={goobertSelectedIdx === null || isEventBusy || isAnimating}
                      className="px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#13332b] to-[#0a1c17] hover:from-[#1b463b] hover:to-[#0f2922] active:translate-y-[1px] border border-teal-500/85 hover:border-teal-300 text-teal-100 hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.88)] transition-all select-none"
                    >
                      {goobertStamping ? 'Pressing Plate...' : goobertStampedCard ? 'Imprint Complete' : 'Stamp Your Card'}
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Side Deck Selector Panel */}
                <div
                  className={`lg:col-span-5 relative flex flex-col min-h-0 rounded-[3px] bg-[#080e0c]/84 border border-teal-900/80 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(153,246,228,0.06)] backdrop-blur-[2px] transition-opacity duration-500 ${
                    isAnimating ? 'opacity-30 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-teal-500/65" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-teal-500/65" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-teal-500/65" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-teal-500/65" />

                  <div className="px-4 py-3 border-b border-teal-950/90 flex items-center justify-between gap-2 shrink-0">
                    <div className="text-left">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-teal-400/90">
                        Your Creatures ({masterDeck.length})
                      </div>

                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                    <div className="flex flex-wrap gap-x-2.5 gap-y-4 justify-center content-start">
                      {masterDeck.map((c, idx) => {
                        const isSelected = goobertSelectedIdx === idx;
                        if (isSelected) return null;
                        return (
                          <div
                            key={c.id || `goo-${c.name}-${idx}`}
                            onClick={() => {
                              if (isEventBusy || isAnimating) return;
                              triggerSfx('draw');
                              setGoobertSelectedIdx(idx);
                            }}
                            className={`relative flex flex-col items-center justify-center w-[104px] h-[146px] cursor-pointer transition-all duration-200 ${
                              isSelected ? '-translate-y-1.5 z-30' : 'hover:-translate-y-1'
                            }`}
                          >
                            {isSelected && (
                              <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-[2px] bg-[#091c18]/95 border border-teal-400/85 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200 whitespace-nowrap shadow-md">
                                Original
                              </span>
                            )}
                            <div className={`transform origin-center transition-transform duration-200 ${isSelected ? 'scale-[0.9]' : 'scale-[0.86] hover:scale-[0.91]'}`}>
                              {renderCard(c, { isSelected, isClickable: true, disableHoverScale: true })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          CAVE TRIAL SCREEN
         ========================================================================= */}
      {screen === 'EVENT_CAVE_TRIAL' && (() => {
        const rule = caveSelectedTrial ? CAVE_TRIAL_RULES[caveSelectedTrial] : null;
        const revealedCards = caveDrawnCards.slice(0, caveRevealCount);
        const liveResult = rule ? rule.evaluate(revealedCards) : null;

        const getWitnessContrib = (trialName: string | null, card: CardDef): string => {
          if (!trialName) return '';
          switch (trialName) {
            case 'Trial of Bones':
              return `${card.boneCost || 0} Bone${(card.boneCost || 0) === 1 ? '' : 's'}`;
            case 'Trial of Blood':
              return `${card.cost || 0} Blood`;
            case 'Trial of Power':
              return `${card.attack || 0} Power`;
            case 'Trial of Health':
              return `${card.health || 0} Health`;
            case 'Trial of Wisdom': {
              const n = card.sigils?.length || 0;
              return `${n} Crest${n === 1 ? '' : 's'}`;
            }
            case 'Trial of Kin':
              return card.class && card.class !== 'No Class' ? card.class : 'Kinless';
            default:
              return '';
          }
        };

        const renderTrialEmblem = (trialName: string) => {
          switch (trialName) {
            case 'Trial of Bones':
              return (
                <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 12c-2.5-2-6 1-4 4 1.2 1.8.8 3.2-.5 4.2 3 1.5 5-.5 6.5-2l16 16c-1.5 1.5-3.5 3.5-2 6.5 1-1.3 2.4-1.7 4.2-.5 3 2 6-1.5 4-4-1.2-1.8-.8-3.2.5-4.2-3-1.5-5 .5-6.5 2L14 18c1.5-1.5 3.5-3.5 2-6.5-1 1.3-2.4 1.7-4 .5Z" />
                  <path d="M36 12c2.5-2 6 1 4 4-1.2 1.8-.8 3.2.5 4.2-3 1.5-5-.5-6.5-2L18 34c1.5 1.5 3.5 3.5 2 6.5-1-1.3-2.4-1.7-4.2-.5-3 2-6-1.5-4-4 1.2-1.8.8-3.2-.5-4.2 3-1.5 5 .5 6.5 2L34 18c-1.5-1.5-3.5-3.5-2-6.5 1 1.3 2.4 1.7 4 .5Z" opacity="0.55" />
                </svg>
              );
            case 'Trial of Blood':
              return (
                <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M24 7 C24 7, 36 21, 36 30 A12 12 0 1 1 12 30 C12 21, 24 7, 24 7 Z" fill="rgba(185,28,28,0.22)" />
                  <path d="M19 31 A5 5 0 0 0 24 36" opacity="0.8" />
                  <line x1="24" y1="16" x2="24" y2="27" opacity="0.65" />
                  <line x1="19" y1="22" x2="29" y2="22" opacity="0.65" />
                </svg>
              );
            case 'Trial of Power':
              return (
                <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M24 6 L28 18 L24 34 L20 18 Z" fill="rgba(212,175,55,0.16)" />
                  <path d="M14 29 H34" />
                  <path d="M24 34 V42 M20 42 H28" />
                  <path d="M13 13 L18 20 M35 13 L30 20" opacity="0.7" />
                </svg>
              );
            case 'Trial of Health':
              return (
                <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M24 7 L38 13 V24 C38 33 32 39 24 42 C16 39 10 33 10 24 V13 Z" fill="rgba(212,175,55,0.12)" />
                  <path d="M24 17 V31 M17 24 H31" strokeWidth="2.3" />
                </svg>
              );
            case 'Trial of Wisdom':
              return (
                <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 24 C12 13, 36 13, 42 24 C36 35, 12 35, 6 24 Z" fill="rgba(212,175,55,0.12)" />
                  <circle cx="24" cy="24" r="6.5" />
                  <circle cx="24" cy="24" r="2.2" fill="currentColor" />
                  <path d="M24 8 V12 M24 36 V40 M12 11 L15 14 M36 11 L33 14" opacity="0.65" />
                </svg>
              );
            case 'Trial of Kin':
            default:
              return (
                <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="24" r="9" />
                  <circle cx="30" cy="24" r="9" />
                  <path d="M24 10 L27 16 L24 19 L21 16 Z" fill="rgba(212,175,55,0.2)" />
                  <path d="M24 38 L27 32 L24 29 L21 32 Z" fill="rgba(212,175,55,0.2)" />
                </svg>
              );
          }
        };

        const isPassedVerdict = caveVerdictReady && cavePassed;
        const isPassedScreen = isPassedVerdict && caveShowRewards;
        const isFailedScreen = caveVerdictReady && !cavePassed;

        return (
          <div
            className="absolute inset-0 bg-[#090605] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('trialevent.jpg')}
          >
            {/* Atmospheric Cathedral Vignette */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-700"
              style={{
                background: isPassedScreen
                  ? 'radial-gradient(ellipse at 50% 35%, rgba(212,175,55,0.2) 0%, rgba(16,11,6,0.68) 52%, rgba(4,3,2,0.95) 100%)'
                  : isFailedScreen
                    ? 'radial-gradient(ellipse at 50% 35%, rgba(153,27,27,0.26) 0%, rgba(14,5,5,0.74) 52%, rgba(4,2,2,0.96) 100%)'
                    : 'radial-gradient(ellipse at 50% 35%, rgba(30,19,12,0.34) 0%, rgba(10,7,5,0.74) 55%, rgba(4,2,2,0.95) 100%)',
              }}
            />
            {renderActWeather('absolute inset-0 z-[5]', 'cave-trial')}

            <div className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    The Zealot&apos;s Tribunal
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe3cc] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  The Steeple Ordeal
                </h1>
              </div>

              {/* MAIN CATHEDRAL TRIPTYCH STAGE */}
              <div className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-between px-5 sm:px-8 py-4">

                {/* Subtle Gothic Rose Window Tracery Behind Stage */}
                <svg
                  viewBox="0 0 400 200"
                  className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-auto opacity-[0.09]"
                  fill="none"
                  stroke={isFailedScreen ? '#ef4444' : '#e5c16b'}
                  strokeWidth="1.2"
                >
                  <circle cx="200" cy="40" r="90" />
                  <circle cx="200" cy="40" r="62" strokeDasharray="4 4" />
                  <circle cx="200" cy="40" r="24" />
                  {[0, 30, 60, 90, 120, 150].map(deg => (
                    <line key={deg} x1="200" y1="40" x2={200 + Math.cos((deg * Math.PI) / 180) * 90} y2={40 + Math.sin((deg * Math.PI) / 180) * 90} />
                  ))}
                </svg>

                {/* KEYSTONE STATUS / VERDICT BANNER */}
                <div className="relative z-20 w-full flex flex-col items-center shrink-0">
                  {!caveSelectedTrial ? null : (
                    <div
                      className={`w-full max-w-3xl px-5 py-2.5 rounded-[3px] border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-5 shadow-[0_10px_28px_rgba(0,0,0,0.85)] transition-all duration-300 ${
                        !caveVerdictReady
                          ? 'bg-[#17110b]/94 border-[#9c7840]/85 text-[#f0d5a1]'
                          : cavePassed
                            ? 'bg-gradient-to-r from-[#1f1608]/95 via-[#2a1d0b]/95 to-[#1f1608]/95 border-[#eab308]/90 text-[#fef08a]'
                            : 'bg-gradient-to-r from-[#210909]/95 via-[#2c0d0d]/95 to-[#210909]/95 border-red-600/85 text-red-200'
                      }`}
                      style={{
                        animation: caveVerdictReady ? 'steepleVerdictSlam 0.42s ease-out forwards' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-['Cinzel',_serif] text-sm sm:text-base font-bold uppercase tracking-[0.18em] whitespace-nowrap">
                          {caveSelectedTrial}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase tracking-[0.2em] border whitespace-nowrap shrink-0 ${
                            !caveVerdictReady
                              ? 'bg-[#241a0e] border-[#a88246] text-[#f4d78b]'
                              : cavePassed
                                ? 'bg-[#36260b] border-[#facc15] text-[#fef08a]'
                                : 'bg-[#3b0e0e] border-red-500 text-red-200'
                          }`}
                        >
                          {!caveVerdictReady ? 'Weighing' : cavePassed ? 'Passed' : 'Found Wanting'}
                        </span>
                      </div>

                      {rule && liveResult && (
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-x-2 text-[10.5px] font-mono uppercase tracking-[0.1em] text-[#ede0c8]/95 whitespace-nowrap">
                          <span className="font-bold">{liveResult.detail}</span>
                          <span className="text-[#9e825f]">|</span>
                          <span className="opacity-80">Need {rule.requirement}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Compact Witness Ledger shown during Passed Reward Selection */}
                  {isPassedScreen && (
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[9.5px] font-mono uppercase tracking-[0.16em] text-[#cbb38e]">
                      <span className="text-[#9c8260]">Witnesses:</span>
                      {caveDrawnCards.map((c, idx) => (
                        <span
                          key={c.id || `wit-pill-${idx}`}
                          className="px-2.5 py-0.5 rounded-[2px] bg-[#17110b]/90 border border-[#5c4328]/80 text-[#efe0be]"
                        >
                          {c.name}{' '}
                          <span className="text-amber-300/90 font-bold">
                            ({getWitnessContrib(caveSelectedTrial, c)})
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* THREE GOTHIC LANCET BAYS (Adapts seamlessly across Select -> Weigh/Fail -> Claim Reward) */}
                <div className="relative z-10 w-full flex-1 min-h-0 grid grid-cols-3 gap-4 sm:gap-6 items-stretch py-3">
                  {!caveSelectedTrial ? (
                    /* PHASE 1: THREE CARVED STONE ORDEAL TABLETS */
                    caveTrials.map((t, idx) => {
                      const isDisabled = isEventBusy;
                      const reqText = CAVE_TRIAL_RULES[t]?.requirement || 'Trial of the Flock';
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => !isDisabled && evaluateCaveTrial(t)}
                          className="group relative flex flex-col items-center justify-between px-4 py-5 rounded-t-[96px] rounded-b-[4px] border border-[#5e442b]/85 hover:border-[#e5c16b] bg-gradient-to-b from-[#1d140e]/92 via-[#150f0b]/95 to-[#0c0806]/98 shadow-[0_16px_36px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,224,178,0.08)] hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(212,175,55,0.22)] transition-all duration-300 cursor-pointer overflow-hidden text-center select-none"
                        >
                          {/* Backlit Stained-Glass Arch Glow on Hover */}
                          <div
                            className="pointer-events-none absolute inset-0 opacity-25 group-hover:opacity-80 transition-opacity duration-300"
                            style={{
                              background:
                                'radial-gradient(ellipse at 50% 24%, rgba(212,175,55,0.28) 0%, rgba(120,53,15,0.08) 52%, transparent 78%)',
                            }}
                          />
                          {/* Inner Lancet Arch Moulding */}
                          <div className="pointer-events-none absolute inset-2 rounded-t-[88px] rounded-b-[2px] border border-dashed border-[#7a5a3a]/45 group-hover:border-[#d4af37]/70 transition-colors" />

                          {/* Roman Numeral Keystone */}
                          <span className="relative z-10 w-7 h-7 rounded-full bg-[#120c08] border border-[#8c673c]/80 group-hover:border-[#f4d78b] flex items-center justify-center text-[10px] font-['Cinzel',_serif] font-bold text-[#c79d5a] group-hover:text-[#fde68a]">
                            {['I', 'II', 'III'][idx] || idx + 1}
                          </span>

                          {/* Occult Emblem Medallion */}
                          <div className="relative z-10 my-auto flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-[#0f0a07]/90 border border-[#6b4f32]/80 group-hover:border-[#e5c16b]/90 flex items-center justify-center text-[#d4af37] group-hover:text-[#fef08a] group-hover:scale-105 shadow-[inset_0_0_18px_rgba(0,0,0,0.9)] transition-all duration-300">
                              {renderTrialEmblem(t)}
                            </div>

                            <div>
                              <div className="font-['Cinzel',_serif] font-bold text-base sm:text-lg uppercase tracking-[0.2em] text-[#f2ddb7] group-hover:text-white">
                                {t}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Callout */}
                          <div className="relative z-10 text-[9.5px] font-mono font-bold uppercase tracking-[0.24em] text-[#a88960] group-hover:text-[#f4d78b] transition-colors">
                            › Swear Vow ‹
                          </div>
                        </button>
                      );
                    })
                  ) : isPassedScreen ? (
                    /* PHASE 3A (PASSED): THREE BLESSED REWARD CARDS IN GOLDEN LANCET BAYS */
                    caveRewardCards.map((c, idx) => {
                      const isSelected = caveSelectedRewardIdx === idx;
                      return (
                        <div
                          key={c.id || `cave-rew-${idx}`}
                          onClick={() => {
                            triggerSfx('draw');
                            setCaveSelectedRewardIdx(idx);
                          }}
                          className={`group relative flex flex-col items-center justify-center px-3 py-4 rounded-t-[96px] rounded-b-[4px] border transition-all duration-300 cursor-pointer overflow-hidden ${
                            isSelected
                              ? 'border-[#facc15] bg-gradient-to-b from-[#2a1e0c]/95 via-[#1c1308]/95 to-[#0e0905]/98 shadow-[0_0_34px_rgba(234,179,8,0.34)] -translate-y-1.5 z-20'
                              : 'border-[#6e5232]/80 hover:border-[#d4af37] bg-gradient-to-b from-[#1a120b]/90 via-[#130d08]/94 to-[#0a0705]/98 hover:-translate-y-1'
                          }`}
                        >
                          <div
                            className="pointer-events-none absolute inset-0 opacity-65"
                            style={{
                              background: isSelected
                                ? 'radial-gradient(ellipse at 50% 35%, rgba(250,204,21,0.32) 0%, transparent 72%)'
                                : 'radial-gradient(ellipse at 50% 35%, rgba(212,175,55,0.16) 0%, transparent 72%)',
                            }}
                          />
                          <div className="pointer-events-none absolute inset-2 rounded-t-[88px] rounded-b-[2px] border border-dashed border-[#8a6a3f]/45" />

                          <span
                            className={`relative z-10 mb-2 px-2.5 py-0.5 rounded-[2px] border text-[8.5px] font-mono font-bold uppercase tracking-[0.22em] ${
                              isSelected
                                ? 'bg-[#2a1d09] border-[#facc15] text-[#fef08a]'
                                : 'bg-[#140e09]/90 border-[#5e442b] text-[#c7a878]'
                            }`}
                          >
                            {isSelected ? 'Selected Blessing' : `Reliquary ${['I', 'II', 'III'][idx]}`}
                          </span>

                          <div className={`relative z-10 transition-transform duration-200 ${isSelected ? 'scale-[1.03]' : 'scale-[0.96] group-hover:scale-[1.0]'}`}>
                            {renderCard(c, { isSelected, isClickable: true, disableHoverScale: true })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* PHASE 2 (WEIGHING) & PHASE 3B (FAILED): THREE WITNESS LECTERN BAYS */
                    [0, 1, 2].map(i => {
                      const c = caveDrawnCards[i];
                      const isShown = i < caveRevealCount && Boolean(c);
                      return (
                        <div
                          key={c?.id || `cave-wit-${i}`}
                          className={`relative flex flex-col items-center justify-center px-3 py-4 rounded-t-[96px] rounded-b-[4px] border overflow-hidden transition-all duration-500 ${
                            isFailedScreen
                              ? 'border-red-900/80 bg-gradient-to-b from-[#1c0b0a]/92 via-[#140807]/95 to-[#0a0505]/98'
                              : 'border-[#5a412a]/85 bg-gradient-to-b from-[#1a120c]/90 via-[#130d09]/94 to-[#0a0705]/98'
                          }`}
                        >
                          <div
                            className="pointer-events-none absolute inset-0"
                            style={{
                              background: isFailedScreen
                                ? 'radial-gradient(ellipse at 50% 30%, rgba(185,28,28,0.22) 0%, transparent 72%)'
                                : isShown
                                  ? 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.2) 0%, transparent 72%)'
                                  : 'radial-gradient(ellipse at 50% 30%, rgba(120,88,52,0.12) 0%, transparent 72%)',
                            }}
                          />
                          <div className="pointer-events-none absolute inset-2 rounded-t-[88px] rounded-b-[2px] border border-dashed border-[#6b4f32]/40" />

                          {/* Snuffed Candle + Smoke Wisp on Fail */}
                          {isFailedScreen && (
                            <div className="pointer-events-none absolute top-4 right-5 flex flex-col items-center opacity-70">
                              <span
                                className="w-2 h-2 rounded-full bg-stone-400/60 blur-[2px]"
                                style={{ animation: `steepleSmokeWisp 2.2s ease-out ${i * 0.35}s infinite` }}
                              />
                              <div className="w-1.5 h-4 bg-[#d6cbb8]/55 rounded-t-[1px] border border-[#594b3d]" />
                            </div>
                          )}

                          <span className="relative z-10 mb-2 text-[9px] font-mono font-bold uppercase tracking-[0.24em] text-[#a88960]">
                            Witness {['I', 'II', 'III'][i]}
                          </span>

                          <div className="relative z-10 h-[168px] flex items-center justify-center">
                            {isShown && c ? (
                              <div
                                className="scale-[0.98] origin-center shadow-[0_14px_28px_rgba(0,0,0,0.92)]"
                                style={{ animation: 'steepleWitnessFlip 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
                              >
                                {renderCard(c, { isClickable: false, disableHoverScale: true })}
                              </div>
                            ) : (
                              <div className="w-[108px] h-[152px] rounded-[4px] bg-gradient-to-b from-[#1a110b] to-[#0c0805] border border-dashed border-[#634529]/80 shadow-inner flex flex-col items-center justify-center gap-2">
                                <span className="w-7 h-7 rounded-full border border-[#8e6a3c]/65 flex items-center justify-center text-xs font-['Cinzel',_serif] text-[#c79d5a]">
                                  {['I', 'II', 'III'][i]}
                                </span>
                                <span className="text-[8.5px] font-mono uppercase tracking-[0.22em] text-[#8c7050] animate-pulse">
                                  Summoning
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Per-Card Contribution Pill */}
                          <div className="relative z-10 mt-2.5 min-h-[24px] flex items-center justify-center">
                            {isShown && c && (
                              <span
                                className={`px-2.5 py-0.5 rounded-[2px] border text-[9.5px] font-mono font-bold uppercase tracking-[0.18em] ${
                                  isFailedScreen
                                    ? 'bg-[#240c0b]/90 border-red-800/80 text-red-200'
                                    : 'bg-[#1c140b]/90 border-[#9c7840]/80 text-[#f4d78b]'
                                }`}
                              >
                                {getWitnessContrib(caveSelectedTrial, c)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* BOTTOM STAGE FOOTER / ACTION BAR */}
                <div className="relative z-20 w-full flex flex-col items-center justify-center pt-1 shrink-0 min-h-[44px]">
                  {!caveSelectedTrial ? (
                    <div className="font-['Cinzel',_serif] text-sm uppercase tracking-[0.22em] text-[#d6be96]">
                      Swear Your Vow
                    </div>
                  ) : !caveVerdictReady ? (
                    <div className="text-[10.5px] font-mono uppercase tracking-[0.26em] text-[#d4b074] animate-pulse">
                      The Zealot Weighs Your Witnesses...
                    </div>
                  ) : isPassedVerdict && !caveShowRewards ? (
                    <div className="font-['Cinzel',_serif] text-sm uppercase tracking-[0.24em] text-[#fef08a] animate-pulse">
                      Ordeal Passed — Presenting Blessings...
                    </div>
                  ) : isPassedScreen ? (
                    <button
                      onClick={() => {
                        setIsEventBusy(false);
                        let updatedDeck = masterDeckRef.current && masterDeckRef.current.length > 0 ? [...masterDeckRef.current] : [...masterDeck];
                        if (cavePassed && caveSelectedRewardIdx !== null) {
                          updatedDeck = [...updatedDeck, cloneCard(caveRewardCards[caveSelectedRewardIdx])];
                          setMasterDeck(updatedDeck);
                          masterDeckRef.current = updatedDeck;
                        }
                        returnToMap(updatedDeck);
                      }}
                      disabled={caveSelectedRewardIdx === null}
                      className="px-9 py-2.5 rounded-[2px] bg-gradient-to-b from-[#33220f] to-[#1a1007] hover:from-[#472f15] hover:to-[#241609] active:translate-y-[1px] border border-[#d4af37]/90 hover:border-[#fef08a] text-[#f8e4b8] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.88)] transition-all select-none"
                    >
                      Claim Blessing &amp; Proceed
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <span className="font-['Cinzel',_serif] text-sm sm:text-base tracking-[0.1em] text-red-200/95">
                        The candles go dark.
                      </span>
                      <button
                        onClick={() => {
                          setIsEventBusy(false);
                          returnToMap();
                        }}
                        className="px-8 py-2 rounded-[2px] bg-gradient-to-b from-[#2e1210] to-[#170908] hover:from-[#421a17] hover:to-[#240d0c] active:translate-y-[1px] border border-red-700/85 hover:border-red-400 text-red-100 hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all select-none"
                      >
                        Depart the Steeple
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          WOODCARVER / WEAVER EFFIGY WORKBENCH SCREEN
         ========================================================================= */}
      {screen === 'EVENT_BUILD_TOTEM' && (() => {
        const previewHead: string | null =
          totemStage === 'ASSEMBLE'
            ? (assemblyHeadIdx !== null ? totemPieces[assemblyHeadIdx]?.value || null : activeTotem.head)
            : (selectedTotemRewardIdx !== null && totemRewardChoices[selectedTotemRewardIdx]?.type === 'head'
                ? totemRewardChoices[selectedTotemRewardIdx].value
                : activeTotem.head);
        const previewBody: string | null =
          totemStage === 'ASSEMBLE'
            ? (assemblyBodyIdx !== null ? totemPieces[assemblyBodyIdx]?.value || null : activeTotem.body)
            : (selectedTotemRewardIdx !== null && totemRewardChoices[selectedTotemRewardIdx]?.type === 'body'
                ? totemRewardChoices[selectedTotemRewardIdx].value
                : activeTotem.body);

        const renderHeadCutoutSvg = (tribe: string, highlighted: boolean) => {
          const strokeCol = highlighted ? '#f4d78b' : '#9a734a';
          const fillTop = highlighted ? '#2b1d12' : '#1f150d';
          const fillBot = highlighted ? '#160e09' : '#100a06';
          const gradId = `effigyPatch-${tribe}-${highlighted ? 'hi' : 'lo'}`;
          let outerPath = '';
          let stitchPath = '';
          switch (tribe) {
            case 'Reptile':
              outerPath = 'M 14 8 H 166 V 176 L 90 154 L 14 176 Z';
              stitchPath = 'M 21 15 H 159 V 166 L 90 146 L 21 166 Z';
              break;
            case 'Insect':
              outerPath = 'M 36 8 H 144 L 170 42 V 142 L 138 176 H 42 L 10 142 V 42 Z';
              stitchPath = 'M 40 15 H 140 L 162 45 V 139 L 134 169 H 46 L 18 139 V 45 Z';
              break;
            case 'Avian':
              outerPath = 'M 16 12 Q 90 2 164 12 V 104 Q 164 152 90 178 Q 16 152 16 104 Z';
              stitchPath = 'M 23 19 Q 90 10 157 19 V 102 Q 157 145 90 169 Q 23 145 23 102 Z';
              break;
            case 'Canine':
              outerPath = 'M 16 8 H 164 L 168 156 L 138 172 L 114 158 L 90 176 L 66 158 L 42 172 L 12 156 Z';
              stitchPath = 'M 23 15 H 157 L 160 151 L 137 163 L 114 150 L 90 167 L 66 150 L 43 163 L 20 151 Z';
              break;
            case 'Hooved':
            default:
              outerPath = 'M 22 10 H 158 Q 168 10 168 22 V 116 Q 168 172 90 176 Q 12 172 12 116 V 22 Q 12 10 22 10 Z';
              stitchPath = 'M 27 17 H 153 Q 161 17 161 26 V 114 Q 161 164 90 168 Q 19 164 19 114 V 26 Q 19 17 27 17 Z';
              break;
          }
          const patId = `effigyPatchTex-${tribe}-${highlighted ? 'hi' : 'lo'}`;
          return (
            <svg viewBox="0 0 180 184" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.92)]">
              <defs>
                <pattern id={patId} patternUnits="userSpaceOnUse" width="180" height="184">
                  <image
                    href={`${import.meta.env.BASE_URL || './'}assets/text/patches.jpg`}
                    width="180"
                    height="184"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={fillTop} stopOpacity={highlighted ? '0.42' : '0.52'} />
                  <stop offset="100%" stopColor={fillBot} stopOpacity={highlighted ? '0.58' : '0.68'} />
                </linearGradient>
              </defs>
              <path d={outerPath} fill={`url(#${patId})`} />
              <path d={outerPath} fill={`url(#${gradId})`} stroke={strokeCol} strokeWidth={highlighted ? '2.4' : '1.7'} strokeLinejoin="round" />
              <path d={stitchPath} fill="none" stroke={highlighted ? '#f4d78b' : '#b48d59'} strokeWidth="1.2" strokeDasharray="4 3.5" opacity={highlighted ? '0.95' : '0.6'} />
            </svg>
          );
        };

        return (
          <div
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 overflow-y-auto md:overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('weaverevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.32)_0%,rgba(5,3,2,0.92)_100%)] pointer-events-none" />
            {renderActWeather('absolute inset-0 z-[5]', 'build-totem')}

            <div className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-between gap-1.5 sm:gap-2.5 lg:gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    The Weaver&apos;s Loom
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Needle &amp; Threadcraft
                </h1>
              </div>

              {/* Vertically Centered Two-Column Split: Stitched Effigy Left, Claim/Assembly Rack Right */}
              <div className="w-full flex-1 lg:max-h-[540px] my-auto min-h-0 grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-5 items-stretch">
                {/* LEFT COLUMN: Physical Stitched Effigy */}
                <div className="md:col-span-4 relative flex flex-col items-center justify-center px-2 sm:px-4 lg:px-5 py-1.5 sm:py-3 lg:py-5 min-h-0">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        previewHead && previewBody
                          ? 'radial-gradient(circle at 50% 48%, rgba(212,175,55,0.22) 0%, rgba(120,53,15,0.1) 50%, transparent 75%)'
                          : 'radial-gradient(circle at 50% 48%, rgba(140,103,71,0.14) 0%, transparent 72%)',
                    }}
                  />
                  <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#9a7342]/70" />

                  {/* Physical Stitched Effigy Doll (effigy.png) with Pinned Head Patch & Torso Crest */}
                  <div
                    className="relative z-10 flex flex-col items-center justify-center my-auto"
                    style={{
                      animation: effigyStitchingAnim ? 'effigyStitchPulse 0.9s ease-in-out' : undefined,
                    }}
                  >
                    <div className="relative w-[148px] h-[208px] sm:w-[186px] sm:h-[260px] lg:w-[225px] lg:h-[315px] flex items-center justify-center select-none">
                      <img
                        src={`${import.meta.env.BASE_URL || './'}assets/text/effigy.png`}
                        alt="Stitched Effigy"
                        draggable={false}
                        className="w-full h-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.95)]"
                      />

                      {/* Head Tribal Brand Inked & Wrapped Across Doll Forehead */}
                      <div className="absolute top-[17.5%] left-[46.5%] -translate-x-1/2 -translate-y-1/2 -rotate-[10deg] w-[96px] h-[96px] flex items-center justify-center pointer-events-none">
                        {previewHead ? (
                          <div
                            className="relative w-full h-full flex items-center justify-center mix-blend-multiply opacity-[0.88]"
                            style={{ transform: 'perspective(140px) rotateY(-10deg) rotateX(6deg)' }}
                          >
                            <div className="relative z-10 [&>*]:scale-[2.6] sm:[&>*]:scale-[3.25] lg:[&>*]:scale-[3.95] [filter:brightness(0.16)_contrast(1.85)_saturate(0.55)_drop-shadow(0_1px_1px_rgba(40,20,8,0.55))]">
                              {TRIBE_EMBROIDERY[previewHead as Tribe] || <span className="text-lg">✦</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full border border-dashed border-[#4a321d]/75 bg-[#120b07]/45 flex items-center justify-center">
                            <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-[#e5cfa8]/70">Patch</span>
                          </div>
                        )}
                      </div>

                      {/* Torso Crest PNG Directly on Doll Chest */}
                      <div className="absolute top-[42%] left-[55.5%] -translate-x-1/2 -rotate-[14deg] w-[86px] h-[86px] flex items-center justify-center pointer-events-none">
                        {previewBody ? (
                          <img
                            src={getSigilArtUrl(previewBody)}
                            alt={previewBody}
                            className="w-[46px] h-[46px] sm:w-[58px] sm:h-[58px] lg:w-[70px] lg:h-[70px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.92)]"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full border border-dashed border-[#4a321d]/75 bg-[#120b07]/45 flex items-center justify-center">
                            <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-[#e5cfa8]/70">Crest</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Active Effigy Status Footer */}
                  <div className="relative z-20 w-full min-h-[18px] sm:min-h-[24px] mt-1 sm:mt-2 flex items-center justify-center text-center">
                    {previewHead && previewBody && (
                      <div className="font-['Cinzel',_serif] text-sm tracking-[0.1em] text-[#f4d78b] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {previewHead} &mdash; {previewBody}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Reward Selection OR Assembly Bench */}
                <div className="md:col-span-8 relative flex flex-col justify-between min-h-0 rounded-[3px] bg-[#0d0806]/86 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,228,185,0.06)] backdrop-blur-[2px] px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4">
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9a7342]/70" />

                  {totemStage === 'REWARD' ? (
                    <div className="flex flex-col h-full justify-between gap-1.5 sm:gap-2 lg:gap-3 min-h-0">
                      <div className={`flex items-center justify-between border-b border-[#3a2618]/80 pb-2 transition-opacity duration-300 ${isTotemFadingOut ? 'opacity-0' : ''}`}>
                        <span className="font-['Cinzel',_serif] text-xs font-bold uppercase tracking-[0.22em] text-[#dfc59a]">
                          Claim a Scrap
                        </span>
                        <span className="text-[10px] font-mono tracking-[0.18em] text-[#9b8266]">
                          {totemPieces.length}/7
                        </span>
                      </div>

                      {!totemChoicesHidden ? (() => {
                        const inspectedIdx = hoveredTotemRewardIdx !== null ? hoveredTotemRewardIdx : selectedTotemRewardIdx;
                        const inspectedChoice = inspectedIdx !== null ? totemRewardChoices[inspectedIdx] || null : null;

                        return (
                          <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-1.5 sm:gap-3 lg:gap-5 py-1 sm:py-2 lg:py-3">
                            <div className="flex flex-wrap gap-2.5 sm:gap-4 lg:gap-6 items-start justify-center">
                              {totemRewardChoices.map((tc, idx) => {
                                const isSelected = selectedTotemRewardIdx === idx;
                                const fadeAnim = isTotemFadingOut
                                  ? isSelected
                                    ? 'animate-swipe-up-fade pointer-events-none'
                                    : 'opacity-0 transition-opacity duration-300 pointer-events-none'
                                  : '';

                                return (
                                  <div
                                    key={`totem-rew-${idx}`}
                                    onMouseEnter={() => setHoveredTotemRewardIdx(idx)}
                                    onMouseLeave={() => setHoveredTotemRewardIdx((prev: number | null) => (prev === idx ? null : prev))}
                                    onClick={() => {
                                      if (!isEventBusy && !isTotemFadingOut) {
                                        triggerSfx('draw');
                                        setSelectedTotemRewardIdx(idx);
                                      }
                                    }}
                                    className={`flex flex-col items-center select-none transition-all duration-200 ${fadeAnim} ${
                                      isEventBusy || isTotemFadingOut
                                        ? 'opacity-40 cursor-not-allowed'
                                        : isSelected
                                          ? 'scale-105 -translate-y-1.5 cursor-pointer'
                                          : 'hover:-translate-y-1 cursor-pointer'
                                    }`}
                                  >
                                    <span className="mb-1 sm:mb-1.5 lg:mb-2 text-[7.5px] sm:text-[8.5px] font-mono uppercase tracking-[0.24em] text-[#b48f5a]">
                                      {tc.type === 'head' ? 'Tribal Patch' : 'Crest'}
                                    </span>

                                    {tc.type === 'head' ? (
                                      <div
                                        className={`relative w-[96px] h-[102px] sm:w-[128px] sm:h-[136px] lg:w-[160px] lg:h-[168px] px-2 sm:px-3 lg:px-4 pb-2 sm:pb-3 text-center flex flex-col items-center justify-center ${
                                          isSelected ? 'drop-shadow-[0_0_24px_rgba(212,175,55,0.4)]' : ''
                                        }`}
                                      >
                                        {renderHeadCutoutSvg(tc.value, isSelected)}
                                        <div className="relative z-10 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mb-1 sm:mb-1.5 lg:mb-2 bg-[#1c130c]/90 border border-[#523b26] rounded-[2px] shadow-inner [&>*]:scale-[1.4] sm:[&>*]:scale-[1.8] lg:[&>*]:scale-[2.2]">
                                          {TRIBE_EMBROIDERY[tc.value as Tribe] || <span className="text-2xl">✦</span>}
                                        </div>
                                        <div className="relative z-10 font-['Cinzel',_serif] font-bold text-[#f2ddb7] text-xs uppercase tracking-[0.18em]">
                                          {tc.value}
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className={`w-[98px] h-[98px] sm:w-[130px] sm:h-[130px] lg:w-[164px] lg:h-[164px] p-2 sm:p-3 lg:p-4 rounded-full border-2 border-dashed text-center flex flex-col items-center justify-center transition-all duration-200 ${
                                          isSelected
                                            ? 'border-[#e5c16b] shadow-[0_0_28px_rgba(212,175,55,0.34)]'
                                            : 'border-[#8c6747]/80 hover:border-[#cfa159] shadow-[0_10px_24px_rgba(0,0,0,0.88)]'
                                        }`}
                                        style={{
                                          backgroundColor: '#1a120b',
                                          backgroundImage: isSelected
                                            ? `radial-gradient(circle at 50% 35%, rgba(43,29,18,0.44), rgba(18,11,7,0.72)), url("${import.meta.env.BASE_URL || './'}assets/text/patches.jpg")`
                                            : `radial-gradient(circle at 50% 35%, rgba(28,19,12,0.52), rgba(14,9,6,0.78)), url("${import.meta.env.BASE_URL || './'}assets/text/patches.jpg")`,
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                        }}
                                      >
                                        <div className="flex items-center justify-center w-[44px] h-[44px] sm:w-[60px] sm:h-[60px] lg:w-[76px] lg:h-[76px] mb-1 sm:mb-1.5 rounded-full bg-[#1a110b] border border-[#5a412a] shadow-inner">
                                          <img
                                            src={getSigilArtUrl(tc.value)}
                                            alt={tc.value}
                                            className="w-8 h-8 sm:w-11 sm:h-11 lg:w-14 lg:h-14 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
                                            style={{ imageRendering: 'pixelated' }}
                                          />
                                        </div>
                                        <div className="font-['Cinzel',_serif] font-bold text-[#f0dab2] text-xs uppercase tracking-[0.14em] leading-tight px-2">
                                          {tc.value}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Compact Inspector Caption (fixed height prevents box/rack resizing) */}
                            <div className="w-full max-w-md min-h-[34px] max-h-[46px] sm:h-[56px] lg:h-[64px] shrink-0 px-2 sm:px-3 flex flex-col items-center justify-center text-center overflow-hidden">
                              {inspectedChoice && (
                                inspectedChoice.type === 'body' ? (
                                  <>
                                    <span className="font-['Cinzel',_serif] text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4d78b]">
                                      {inspectedChoice.value}
                                    </span>
                                    <span className="text-[11px] font-mono text-[#d8c3a5] leading-snug mt-0.5">
                                      {SIGIL_DESCRIPTIONS[inspectedChoice.value]}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.18em] text-[#e5cfa8]">
                                    {inspectedChoice.value} &mdash; Tribal Patch
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="flex-1 flex items-center justify-center text-[11px] font-mono uppercase tracking-[0.22em] text-[#9c8262]">
                          Piece Bound to Satchel...
                        </div>
                      )}

                      {!totemChoicesHidden && (
                        <div className="flex justify-center pt-2">
                          <button
                            onClick={async () => {
                              if (selectedTotemRewardIdx === null || isEventBusy) return;
                              setIsEventBusy(true);

                              const chosen = totemRewardChoices[selectedTotemRewardIdx];
                              const nextPieces = [...totemPieces, chosen];
                              setTotemPieces(nextPieces);
                              triggerSfx('play');

                              if (nextPieces.length >= 7) {
                                const sigils = Object.keys(SIGIL_MAPPING).filter(s => s !== 'Amorphous');
                                const randSigil = sigils[Math.floor(Math.random() * sigils.length)];
                                const amalgam = cloneCard(ALL_CARD_LOOKUP["Amalgam"]);
                                amalgam.sigils = [randSigil];
                                const nextDeck = [...masterDeck, amalgam];
                                setMasterDeck(nextDeck);
                                masterDeckRef.current = nextDeck;
                                addLog(`Your satchel overflowed with 7 effigy scraps! The Weaver gifted an Amalgam (${randSigil})!`);
                              }

                              const hasHead = nextPieces.some(p => p.type === 'head');
                              const hasBody = nextPieces.some(p => p.type === 'body');

                              if (hasHead && hasBody) {
                                setTotemStage('ASSEMBLE');
                                setIsEventBusy(false);
                              } else {
                                setIsTotemFadingOut(true);
                                await new Promise(res => setTimeout(res, 500));
                                setTotemChoicesHidden(true);
                                await new Promise(res => setTimeout(res, 950));
                                returnToMap();
                              }
                            }}
                            disabled={selectedTotemRewardIdx === null || isEventBusy}
                            className={`px-5 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-2.5 rounded-[2px] bg-gradient-to-b from-[#2b1a10] to-[#170e09] hover:from-[#3a2315] hover:to-[#1f130c] active:translate-y-[1px] border border-[#b48844]/85 hover:border-[#e5c16b] text-[#f3dfb6] hover:text-white font-['Cinzel',_serif] font-bold text-[10.5px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all duration-300 select-none ${
                              isTotemFadingOut ? 'opacity-0 pointer-events-none' : ''
                            }`}
                          >
                            Bind to Effigy
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col h-full justify-between min-h-0">
                      <div className="text-left border-b border-[#3a2618]/80 pb-2 shrink-0">
                        <div className="font-['Cinzel',_serif] text-xs font-bold uppercase tracking-[0.22em] text-[#dfc59a]">
                          Stitch Effigy
                        </div>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto py-3 flex flex-col gap-3">
                        {/* Tribal Patches Shelf */}
                        <div className="border border-dashed border-[#8c6747]/60 p-3.5 bg-[#140e0a]/90 shadow-inner rounded-[3px]">
                          <div className="text-[10px] font-['Cinzel',_serif] font-bold text-[#c79d5a] uppercase tracking-[0.2em] mb-2.5 border-b border-[#3a271a] pb-1.5 text-left">
                            Tribal Patches ({totemPieces.filter(p => p.type === 'head').length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {totemPieces.map((p, idx) => p.type === 'head' && (
                              <button
                                key={`head-${idx}`}
                                type="button"
                                onClick={() => {
                                  triggerSfx('draw');
                                  setAssemblyHeadIdx(idx);
                                }}
                                className={`px-2.5 py-2 border border-dashed rounded-[2px] text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                                  assemblyHeadIdx === idx
                                    ? 'border-[#e5c16b] text-[#f5e3be] shadow-[0_0_12px_rgba(212,175,55,0.28)]'
                                    : 'border-[#7a5a3c]/65 text-[#cbb697]/90 hover:border-[#c89e4c]'
                                }`}
                                style={{
                                  backgroundColor: '#1a130d',
                                  backgroundImage: assemblyHeadIdx === idx
                                    ? `linear-gradient(to bottom, rgba(44,29,18,0.52), rgba(22,14,9,0.74)), url("${import.meta.env.BASE_URL || './'}assets/text/patches.jpg")`
                                    : `linear-gradient(to bottom, rgba(26,18,12,0.62), rgba(14,9,6,0.8)), url("${import.meta.env.BASE_URL || './'}assets/text/patches.jpg")`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              >
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 [&>*]:scale-[1.25]">
                                  {TRIBE_EMBROIDERY[p.value as Tribe] || <span>✦</span>}
                                </div>
                                <span>{p.value}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Circular Threadbound Crests Shelf */}
                        <div className="border border-dashed border-[#8c6747]/60 p-3.5 bg-[#140e0a]/90 shadow-inner rounded-[3px]">
                          <div className="text-[10px] font-['Cinzel',_serif] font-bold text-[#c79d5a] uppercase tracking-[0.2em] mb-2.5 border-b border-[#3a271a] pb-1.5 text-left">
                            Threadbound Crests ({totemPieces.filter(p => p.type === 'body').length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {totemPieces.map((p, idx) => p.type === 'body' && (
                              <button
                                key={`body-${idx}`}
                                type="button"
                                onClick={() => {
                                  triggerSfx('draw');
                                  setAssemblyBodyIdx(idx);
                                }}
                                className={`px-3 py-1.5 border border-dashed rounded-full text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                                  assemblyBodyIdx === idx
                                    ? 'border-[#e5c16b] text-[#f5e3be] shadow-[0_0_12px_rgba(212,175,55,0.28)]'
                                    : 'border-[#7a5a3c]/65 text-[#cbb697]/90 hover:border-[#c89e4c]'
                                }`}
                                style={{
                                  backgroundColor: '#1a130d',
                                  backgroundImage: assemblyBodyIdx === idx
                                    ? `linear-gradient(to bottom, rgba(44,29,18,0.52), rgba(22,14,9,0.74)), url("${import.meta.env.BASE_URL || './'}assets/text/patches.jpg")`
                                    : `linear-gradient(to bottom, rgba(26,18,12,0.62), rgba(14,9,6,0.8)), url("${import.meta.env.BASE_URL || './'}assets/text/patches.jpg")`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              >
                                <div className="w-6 h-6 rounded-full bg-[#140d08] border border-[#4f3824] flex items-center justify-center shrink-0">
                                  <img
                                    src={getSigilArtUrl(p.value)}
                                    alt={p.value}
                                    className="w-4 h-4 object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                                <span>{p.value}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2 shrink-0">
                        {assemblyHeadIdx !== null && assemblyBodyIdx !== null ? (
                          <button
                            disabled={effigyStitchingAnim}
                            onClick={() => {
                              const hVal = totemPieces[assemblyHeadIdx].value as Tribe;
                              const bVal = totemPieces[assemblyBodyIdx].value;
                              const newTotem = { head: hVal, body: bVal };
                              setActiveTotem(newTotem);
                              setEffigyStitchingAnim(true);
                              triggerSfx('bell');
                              addLog(`Effigy stitched: ${hVal} + ${bVal}`);
                              scheduleEventTimer(() => {
                                setEffigyStitchingAnim(false);
                                returnToMap(undefined, newTotem);
                              }, 950);
                            }}
                            className="px-5 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-2.5 rounded-[2px] bg-gradient-to-b from-[#2b1a10] to-[#170e09] hover:from-[#3a2315] hover:to-[#1f130c] active:translate-y-[1px] border border-[#b48844]/85 hover:border-[#e5c16b] text-[#f3dfb6] hover:text-white font-['Cinzel',_serif] font-bold text-[10.5px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] cursor-pointer disabled:opacity-45 shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all select-none"
                          >
                            {effigyStitchingAnim ? 'Stitching Effigy...' : 'Stitch Effigy'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              let nextHead = activeTotem.head;
                              let nextBody = activeTotem.body;
                              if (assemblyHeadIdx !== null) nextHead = totemPieces[assemblyHeadIdx!].value as Tribe;
                              if (assemblyBodyIdx !== null) nextBody = totemPieces[assemblyBodyIdx!].value;
                              const newTotem = { head: nextHead, body: nextBody };
                              setActiveTotem(newTotem);
                              returnToMap(undefined, newTotem);
                            }}
                            className="px-5 sm:px-6 lg:px-7 py-1.5 sm:py-2 lg:py-2.5 rounded-[2px] bg-[#140e0a]/90 hover:bg-[#1f1610] active:translate-y-[1px] border border-[#4a3322]/85 hover:border-[#8c6742] text-[#cbb697] hover:text-[#f3e6cf] font-['Cinzel',_serif] font-bold text-[10.5px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.8)] transition-all select-none"
                          >
                            Store Pieces &amp; Proceed
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          CARD CHOICE EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_CARD_CHOICE' && (
        <div
          className="absolute inset-0 bg-[#080706] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
          style={getScreenBgStyle('choiceevent.jpg')}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,12,9,0.28)_0%,rgba(4,3,2,0.92)_100%)] pointer-events-none" />

          {renderActWeather('absolute inset-0 z-[5]', 'event_card_choice')}
          <div className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-between gap-3">
            {/* Top Header */}
            <div className="flex flex-col items-center text-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                  Thicket Clearing
                </span>
                <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Wild Beasts
              </h1>
            </div>

            {/* Moonlit Briar Stage with Three Distinct Creature Pedestals */}
            <div className="relative w-full max-w-3xl my-auto flex flex-col items-center justify-center gap-6 px-8 pt-14 pb-8">



              {/* Three Emergent Beasts */}
              <div
                key={choiceDealGen}
                className="relative z-20 w-full max-w-3xl flex-1 flex items-center justify-center gap-6 sm:gap-12"
              >
                {choiceCards.map((c, idx) => {
                  const isSelected = choiceSelectedIdx === idx;
                  const tiltClass = idx === 0 ? '-rotate-2' : idx === 2 ? 'rotate-2' : 'rotate-0';
                  return (
                    <div
                      key={c.id || `choice-${choiceDealGen}-${idx}`}
                      onClick={() => {
                        triggerSfx('draw');
                        setChoiceSelectedIdx(idx);
                      }}
                      style={{
                        animation: `choiceCardDeal 0.36s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.08}s both`,
                      }}
                      className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? '-translate-y-4 scale-[1.16] rotate-0 z-30'
                          : `${tiltClass} scale-[1.06] hover:-translate-y-2.5 hover:scale-[1.12] hover:rotate-0 z-10 hover:z-20`
                      }`}
                    >
                      {isSelected && (
                        <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 z-40 px-2.5 py-0.5 rounded-[2px] bg-[#1f160b]/95 border border-[#e5c16b]/90 text-[8.5px] font-mono font-bold uppercase tracking-[0.22em] text-[#fde68a] whitespace-nowrap shadow-[0_0_14px_rgba(234,179,8,0.4)]">
                          Chosen
                        </span>
                      )}
                      <div
                        className={`transition-[filter] duration-300 ${
                          isSelected
                            ? 'drop-shadow-[0_0_20px_rgba(212,175,55,0.55)] drop-shadow-[0_18px_22px_rgba(0,0,0,0.95)]'
                            : 'drop-shadow-[0_14px_18px_rgba(0,0,0,0.9)]'
                        }`}
                      >
                        {renderCard(c, { isSelected, isClickable: true, disableHoverScale: true })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stark Cinzel Line */}
              <div className="relative z-20 pt-2 shrink-0">
                <p className="font-['Cinzel',_serif] text-sm sm:text-base italic tracking-[0.1em] text-[#e5cfa8] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  Three emerge from the brush.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
              <button
                onClick={() => {
                  let updatedDeck = masterDeckRef.current && masterDeckRef.current.length > 0 ? [...masterDeckRef.current] : [...masterDeck];
                  if (choiceSelectedIdx !== null) {
                    updatedDeck = [...updatedDeck, cloneCard(choiceCards[choiceSelectedIdx])];
                    setMasterDeck(updatedDeck);
                    masterDeckRef.current = updatedDeck;
                  }
                  returnToMap(updatedDeck);
                }}
                disabled={choiceSelectedIdx === null}
                className="px-8 py-2.5 rounded-[2px] bg-gradient-to-b from-[#2b1a10] to-[#170e09] hover:from-[#3a2315] hover:to-[#1f130c] active:translate-y-[1px] border border-[#b48844]/85 hover:border-[#e5c16b] text-[#f3dfb6] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all select-none"
              >
                Take Creature
              </button>
              {choiceRerollsLeft > 0 && (
                <button
                  onClick={rerollCardChoice}
                  className="px-6 py-2.5 rounded-[2px] bg-[#140e0a]/92 hover:bg-[#1f1610] active:translate-y-[1px] border border-[#4a3322]/85 hover:border-[#8c6742] text-[#cbb697] hover:text-[#f3e6cf] font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] cursor-pointer shadow-[0_6px_16px_rgba(0,0,0,0.82)] transition-all select-none"
                >
                  Reroll ({choiceRerollsLeft})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          HOARDER SEARCH SCREEN
         ========================================================================= */}
      {screen === 'EVENT_HOARDER_SEARCH' && (
        <div className={`absolute inset-0 bg-[#080504]/82 backdrop-blur-md z-[110] flex flex-col items-center justify-center px-5 py-5 overflow-hidden font-mono select-none ${menuFadingOut ? 'animate-menu-fade-out' : 'animate-menu-fade-in'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,15,9,0.38)_0%,rgba(4,3,2,0.92)_100%)] pointer-events-none" />

          <div className="relative z-10 w-full max-w-5xl max-h-full min-h-0 flex flex-col items-center rounded-[3px] bg-[#0d0806]/92 border border-[#442d1d]/90 px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.96)]">
            <div className="shrink-0 flex flex-col items-center text-center pb-3">
              <div className="flex items-center gap-3.5 mb-0.5">
                <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                  Sleight of Hand
                </span>
                <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                The Hoarder&rsquo;s Cache
              </h1>
              <p className="mt-1 font-['Cinzel',_serif] italic text-sm tracking-[0.1em] text-[#e5cfa8]">
                &ldquo;Draw one vessel from the dark.&rdquo;
              </p>
            </div>

            <div className="w-full flex-1 min-h-0 overflow-y-auto rounded-[3px] bg-[#090604]/80 border border-[#342216]/85 p-4 my-2">
              {deck.length > 0 ? (
                <div className="flex flex-wrap gap-3.5 justify-center content-start">
                  {deck.map((c, idx) => {
                    const isSelected = hoarderSelectedIdx === idx;
                    return (
                      <div
                        key={c.id || `hoarder-${idx}`}
                        onClick={() => {
                          triggerSfx('draw');
                          setHoarderSelectedIdx(isSelected ? null : idx);
                        }}
                        className={`cursor-pointer transform transition-all duration-200 ${
                          isSelected
                            ? "scale-[1.03] -translate-y-2 z-30"
                            : "scale-[0.94] opacity-85 hover:opacity-100 hover:scale-[1.0] hover:-translate-y-1"
                        }`}
                      >
                        {renderCard(c, { isSelected, disableHoverScale: true })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center font-['Cinzel',_serif] italic text-sm text-[#8a7256]">
                  No vessels remain in your draw pile.
                </div>
              )}
            </div>

            <div className="shrink-0 pt-3 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (hoarderSelectedIdx === null) return;
                  const card = deck[hoarderSelectedIdx];
                  setDeck((prev: any[]) => prev.filter((_: any, i: number) => i !== hoarderSelectedIdx));
                  setHand((prev: any[]) => [...prev, applyPlayerTotem(transformAmorphous(card), activeTotem)]);
                  addLog(`Hoarder retrieved ${card.name}!`);
                  setHoarderSelectedIdx(null);
                  setScreen('DUEL');
                }}
                disabled={hoarderSelectedIdx === null}
                className={`rounded-[2px] border transition-all duration-150 font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] px-7 py-2.5 select-none ${
                  hoarderSelectedIdx !== null
                    ? 'bg-[#271d12] hover:bg-[#362717] active:translate-y-[1px] border-[#d4af37]/90 text-[#fff2cf] shadow-[0_2px_0_#0b0704,0_0_20px_rgba(212,175,55,0.28)] cursor-pointer'
                    : 'bg-[#15100d]/90 border-[#2f241c] text-[#7a6957] opacity-50 cursor-not-allowed'
                }`}
              >
                Claim Vessel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW DECK SCREEN MODAL (WIDESCREEN NON-SCROLLING TWO-COLUMN SPLIT)
         ========================================================================= */}
      {(showViewDeck || screen === 'VIEW_DECK') && (() => {
        const activeDetailCard = selectedDeckCardDetail || masterDeck[0] || null;
        return (
          <div className={`absolute inset-0 bg-[#080504]/86 backdrop-blur-md z-[110] flex flex-col items-center justify-center px-5 py-4 sm:px-7 sm:py-5 overflow-hidden font-mono select-none ${menuFadingOut ? 'animate-menu-fade-out' : 'animate-menu-fade-in'}`}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(24,14,9,0.36)_0%,rgba(4,3,2,0.92)_100%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-6xl h-full min-h-0 flex flex-col">
              {/* Engraved Header with Return Action */}
              <div className="shrink-0 relative flex items-center justify-between border-b border-[#3e291b]/85 pb-3 mb-4">
                <div className="flex flex-col text-left">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-[0.28em] text-[#b9935a]">
                    Grimoire • {masterDeck.length} Vessels
                  </span>
                  <h1 className="text-xl sm:text-2xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                    Your Creatures
                  </h1>
                </div>

                <button
                  onClick={() => {
                    setShowViewDeck(false);
                    if (screen === 'VIEW_DECK') setScreen(previousScreen || 'DUEL');
                  }}
                  className="bg-[#18120e] hover:bg-[#261c15] active:bg-[#120d0a] border border-[#5a412d] hover:border-[#cfa159] rounded-[2px] shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] transition-all duration-100 font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] text-[#e5cfa8] hover:text-white cursor-pointer px-5 py-2"
                >
                  Return
                </button>
              </div>

              {/* Two-Column Split: Scrollable Deck Grid Left, Enlarged Specimen & Crests Right */}
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Left Column: Scrollable Deck Tray */}
                <div className="lg:col-span-7 min-h-0 flex flex-col rounded-[3px] bg-[#0d0806]/84 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.9)] overflow-hidden">
                  <div className="flex-1 min-h-0 overflow-y-auto p-4">
                    <div className="flex flex-wrap gap-3 justify-center content-start">
                      {masterDeck.map((c, idx) => {
                        const isSelected = activeDetailCard?.id === c.id || (!selectedDeckCardDetail && idx === 0);
                        return (
                          <div
                            key={c.id || `view-${c.name}-${idx}`}
                            onClick={() => {
                              triggerSfx('draw');
                              setSelectedDeckCardDetail(c);
                            }}
                            className={`cursor-pointer transform transition-all duration-200 ${
                              isSelected
                                ? 'scale-[0.98] -translate-y-1.5 z-30'
                                : 'scale-[0.9] opacity-80 hover:opacity-100 hover:scale-[0.96] hover:-translate-y-0.5'
                            }`}
                          >
                            {renderCard(c, { isSelected, disableHoverScale: true })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Enlarged Specimen & Crest Inscriptions */}
                <div className="lg:col-span-5 min-h-0 flex flex-col justify-between rounded-[3px] bg-[#0d0907]/88 border border-[#442f21]/85 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.92)] overflow-hidden">
                  {activeDetailCard ? (
                    <>
                      {/* Specimen Pedestal */}
                      <div className="shrink-0 flex flex-col items-center justify-center py-3 relative">
                        <div className="pointer-events-none absolute inset-x-12 h-32 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,transparent_70%)]" />
                        <div className="scale-[1.15] transform transition-transform">
                          {renderCard(activeDetailCard, { showCost: true, isClickable: false, disableHoverScale: true })}
                        </div>
                      </div>

                      {/* Vessel Title, Lineage & Cost */}
                      <div className="shrink-0 border-t border-b border-[#3a271b]/80 py-2.5 my-2 flex items-center justify-between gap-2 text-left">
                        <div>
                          <h2 className="text-lg font-['Cinzel',_serif] font-bold uppercase tracking-[0.18em] text-[#f3dfb6]">
                            {activeDetailCard.name}
                          </h2>
                          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#b49365] mt-0.5">
                            {activeDetailCard.class}
                            {activeDetailCard.cost !== undefined && activeDetailCard.cost > 0 && ` • ${activeDetailCard.cost} Blood`}
                            {activeDetailCard.boneCost !== undefined && activeDetailCard.boneCost > 0 && ` • ${activeDetailCard.boneCost} Bones`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-1 rounded-[2px] bg-[#140d09] border border-[#3d291c] text-xs font-mono font-bold">
                          <span className="text-amber-300">{activeDetailCard.attack} ATK</span>
                          <span className="text-stone-600">/</span>
                          <span className="text-red-300">{activeDetailCard.health} HP</span>
                        </div>
                      </div>

                      {/* Bound Crests List */}
                      <div className="flex-1 min-h-0 overflow-y-auto text-left pr-1">
                        <div className="text-[9.5px] font-mono font-bold uppercase tracking-[0.26em] text-[#b9935a] mb-2">
                          Bound Crests
                        </div>
                        {activeDetailCard.sigils && activeDetailCard.sigils.length > 0 ? (
                          <div className="space-y-2.5">
                            {activeDetailCard.sigils.map((s: any) => (
                              <div key={s} className="p-2.5 rounded-[2px] bg-[#130d09]/90 border border-[#342318]">
                                <div className="font-['Cinzel',_serif] text-xs font-bold text-[#efd8aa] uppercase tracking-[0.16em] flex items-center gap-2">
                                  <span className="text-sm filter sepia-[0.35]">{SIGIL_MAPPING[s] || '✦'}</span>
                                  <span>{s}</span>
                                </div>
                                <div className="text-[11px] text-[#cbb89e]/85 leading-relaxed font-mono mt-1">
                                  {SIGIL_DESCRIPTIONS[s] || 'An ancient mark etched in bone.'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="font-['Cinzel',_serif] italic text-xs text-[#7c664e] py-2">
                            Unmarked vessel.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center font-['Cinzel',_serif] italic text-sm text-[#7c664e]">
                      No creatures bound.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
