import { RitualSlateButton, RitualReliquaryShell } from './BattleFlankUI';
import { Layers as RbLayers, Menu as RbMenu } from 'lucide-react';
import React from 'react';
import type { CardDef, Tribe } from '../data/gameData';
import { ALL_ITEMS , getCardDisplayName , getCardTribeLabel , getItemArtUrl } from '../data/gameData';
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
    choiceIsRare,
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

  const hasDraftFlippedRef = React.useRef(false);
  if (screen !== 'DRAFT') {
    hasDraftFlippedRef.current = false;
  } else if (draftFlippingDown) {
    hasDraftFlippedRef.current = true;
  }

  // --- Unified Desktop Mouse & Mobile Touch 1-Second Hold-to-Drag Engine for Event Card Slots ---
  const HOLD_TO_DRAG_MS = 1000;
  const HOLD_CHARGE_SHOW_MS = 150;
  const HOLD_MOVE_TOLERANCE_PX = 14;

  type EventDragState = {
    card: CardDef;
    cardKey: string;
    allowedSlots: string[];
    x: number;
    y: number;
    isTouch: boolean;
    hoveredSlot: string | null;
  };
  type EventHoldState = {
    cardKey: string;
    x: number;
    y: number;
    isTouch: boolean;
  };
  const [eventDrag, setEventDrag] = React.useState<EventDragState | null>(null);
  const [eventHold, setEventHold] = React.useState<EventHoldState | null>(null);
  const eventDragRef = React.useRef<EventDragState | null>(null);
  const suppressNextClickRef = React.useRef<boolean>(false);
  const pendingDragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    isTouch: boolean;
    card: CardDef;
    cardKey: string;
    allowedSlots: string[];
    onDrop: (slotId: string) => void;
    chargeTimer: number | null;
    holdTimer: number | null;
  } | null>(null);

  const clearPendingDrag = React.useCallback(() => {
    const pending = pendingDragRef.current;
    if (pending) {
      if (pending.chargeTimer) window.clearTimeout(pending.chargeTimer);
      if (pending.holdTimer) window.clearTimeout(pending.holdTimer);
    }
    pendingDragRef.current = null;
    setEventHold(null);
  }, []);

  const findHoveredDropSlot = React.useCallback((clientX: number, clientY: number, allowedSlots: string[]): string | null => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-event-drop-slot]');
    const pad = 28;
    let bestSlot: string | null = null;
    let bestDist = Infinity;
    nodes.forEach((el) => {
      const slotId = el.getAttribute('data-event-drop-slot');
      if (!slotId || !allowedSlots.includes(slotId)) return;
      if (el.getAttribute('data-event-drop-enabled') === 'false') return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (
        clientX >= r.left - pad &&
        clientX <= r.right + pad &&
        clientY >= r.top - pad &&
        clientY <= r.bottom + pad
      ) {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(clientX - cx, clientY - cy);
        if (d < bestDist) {
          bestDist = d;
          bestSlot = slotId;
        }
      }
    });
    return bestSlot;
  }, []);

  React.useEffect(() => {
    // Clear any in-progress hold or drag when switching event screens
    clearPendingDrag();
    eventDragRef.current = null;
    setEventDrag(null);
  }, [screen, clearPendingDrag]);

  React.useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const active = eventDragRef.current;
      const pending = pendingDragRef.current;

      if (active) {
        const hitX = e.clientX;
        const hitY = active.isTouch ? e.clientY - 26 : e.clientY;
        const hoveredSlot = findHoveredDropSlot(hitX, hitY, active.allowedSlots);
        const next: EventDragState = { ...active, x: e.clientX, y: e.clientY, hoveredSlot };
        eventDragRef.current = next;
        setEventDrag(next);
        return;
      }

      if (!pending || e.pointerId !== pending.pointerId) return;
      pending.lastX = e.clientX;
      pending.lastY = e.clientY;
      const dx = e.clientX - pending.startX;
      const dy = e.clientY - pending.startY;
      const dist = Math.hypot(dx, dy);

      // Moving beyond tolerance before the 1-second hold completes cancels drag arming
      // (preserves mobile horizontal scrolling and normal click/tap behavior)
      if (dist > HOLD_MOVE_TOLERANCE_PX) {
        clearPendingDrag();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (eventDragRef.current) {
        e.preventDefault();
      }
    };

    const finishDrag = (e: PointerEvent) => {
      const pending = pendingDragRef.current;
      const active = eventDragRef.current;

      if (active && pending) {
        const hitX = e.clientX;
        const hitY = active.isTouch ? e.clientY - 26 : e.clientY;
        const dropSlot = findHoveredDropSlot(hitX, hitY, active.allowedSlots) || active.hoveredSlot;
        suppressNextClickRef.current = true;
        window.setTimeout(() => {
          suppressNextClickRef.current = false;
        }, 160);
        if (dropSlot) {
          pending.onDrop(dropSlot);
        }
      }

      clearPendingDrag();
      eventDragRef.current = null;
      setEventDrag(null);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [findHoveredDropSlot, clearPendingDrag]);

  const startEventCardDrag = (
    e: React.PointerEvent,
    opts: {
      disabled?: boolean;
      card: CardDef;
      cardKey: string;
      allowedSlots: string[];
      onDrop: (slotId: string) => void;
    }
  ) => {
    if (opts.disabled || opts.allowedSlots.length === 0) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';
    const startX = e.clientX;
    const startY = e.clientY;

    clearPendingDrag();

    const chargeTimer = window.setTimeout(() => {
      const cur = pendingDragRef.current;
      if (!cur || eventDragRef.current) return;
      setEventHold({
        cardKey: cur.cardKey,
        x: cur.lastX,
        y: cur.lastY,
        isTouch: cur.isTouch,
      });
    }, HOLD_CHARGE_SHOW_MS);

    const holdTimer = window.setTimeout(() => {
      const cur = pendingDragRef.current;
      if (!cur || eventDragRef.current) return;
      setEventHold(null);
      const hitY = cur.isTouch ? cur.lastY - 26 : cur.lastY;
      const hoveredSlot = findHoveredDropSlot(cur.lastX, hitY, cur.allowedSlots);
      const started: EventDragState = {
        card: cur.card,
        cardKey: cur.cardKey,
        allowedSlots: cur.allowedSlots,
        x: cur.lastX,
        y: cur.lastY,
        isTouch: cur.isTouch,
        hoveredSlot,
      };
      eventDragRef.current = started;
      setEventDrag(started);
      triggerSfx('draw');
    }, HOLD_TO_DRAG_MS);

    pendingDragRef.current = {
      pointerId: e.pointerId,
      startX,
      startY,
      lastX: startX,
      lastY: startY,
      isTouch,
      card: opts.card,
      cardKey: opts.cardKey,
      allowedSlots: opts.allowedSlots,
      onDrop: opts.onDrop,
      chargeTimer,
      holdTimer,
    };
  };

  const getDropSlotClass = (slotId: string, enabled = true) => {
    if (!eventDrag || !enabled || !eventDrag.allowedSlots.includes(slotId)) return '';
    return eventDrag.hoveredSlot === slotId
      ? 'event-drop-slot-active transition-transform duration-150'
      : 'event-drop-slot-ready';
  };

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
            ? `Barter Pelt for ${getCardDisplayName(selectedShopCard.name)}`
            : selectedPeltCard
              ? 'Claim an offering from the table'
              : selectedShopCard
                ? `Offer a Pelt for ${getCardDisplayName(selectedShopCard.name)}`
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
                    triggerSfx('draw');
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
              style={
                !hasDraftFlippedRef.current && !draftFlippingDown && !draftFlippingUp
                  ? { animation: `choiceCardDeal 340ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 45}ms both` }
                  : undefined
              }
            >
              <div
                onClick={() => {
                  if (draftFlippingDown || draftFlippingUp) return;
                  triggerSfx('draw');
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

        const BASE = import.meta.env.BASE_URL || './';
        const woodBg = `url("${BASE}assets/text/wood.jpg")`;
        const slateBg = `url("${BASE}assets/text/slate.jpg")`;
        const clothBg = `url("${BASE}assets/text/cloth.jpg")`;

        return (
          <div
            className="absolute inset-0 bg-[#080304] z-50 flex flex-col items-center justify-between gap-1.5 sm:gap-2 lg:gap-4 px-1.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-4 overflow-hidden font-mono select-none"
            style={getScreenBgStyle('draft.jpg')}
          >
            {/* Atmospheric Dark Vignette (keeps draft.jpg visible) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,6,7,0.12)_0%,rgba(5,2,3,0.72)_100%)] pointer-events-none z-0" />

            {/* Engraved Header & Carved Slate Status */}
            <div className="relative z-10 flex flex-col items-center text-center shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="hidden sm:block h-px w-12 lg:w-20 bg-gradient-to-r from-transparent via-[#7f1d1d]/80 to-red-500/75" />
                <h1
                  className="text-sm sm:text-xl lg:text-2xl font-['Cinzel',_serif] font-bold text-[#ede3d2] tracking-[0.12em] sm:tracking-[0.18em] italic"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.98), 0 0 18px rgba(153,27,27,0.45)' }}
                >
                  · Fortasse propositum facultates tuas superat ·
                </h1>
                <div className="hidden sm:block h-px w-12 lg:w-20 bg-gradient-to-l from-transparent via-[#7f1d1d]/80 to-red-500/75" />
              </div>

              <div className="relative mt-1.5 flex items-center gap-3 px-4 py-1 rounded-[2px] bg-[#100607]/88 border border-[#3d1719] shadow-[0_10px_24px_rgba(0,0,0,0.88)] overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply bg-cover bg-center"
                  style={{ backgroundImage: slateBg }}
                />
                <span className="relative z-10 font-['Cinzel',_serif] text-xs tracking-[0.16em] text-[#e8dcc8] uppercase">
                  {statusPrompt}
                </span>
                <span className="relative z-10 h-3 w-px bg-[#4a1c1e]" />
                <span
                  className={`relative z-10 text-[10px] font-mono font-bold uppercase tracking-[0.22em] ${
                    draftTradesLeft > 0 ? 'text-red-400' : 'text-emerald-400/90'
                  }`}
                  style={draftTradesLeft > 0 ? { textShadow: '0 0 8px rgba(239,68,68,0.6)' } : undefined}
                >
                  {draftTradesLeft > 0 ? `${draftTradesLeft} ${draftTradesLeft === 1 ? 'Pelt' : 'Pelts'}` : 'Settled'}
                </span>
              </div>
            </div>

            {/* Dual Dark-Timber Framed Tabletop Trays */}
            <div
              className="relative z-10 flex flex-row flex-nowrap justify-center items-stretch gap-2 sm:gap-4 lg:gap-6 my-auto max-w-full"
              style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}
            >
              {/* Left Tray: Your Satchel (Slate Well) */}
              <div
                className="relative p-[4px] rounded-[2px] shadow-[0_18px_38px_rgba(0,0,0,0.92)]"
                style={{ backgroundImage: woodBg, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2px] bg-[#0a0505]/55 border border-[#2d1516]" />
                <div
                  className="relative h-full flex flex-col items-center px-2 sm:px-3.5 lg:px-5 pt-2 sm:pt-2.5 lg:pt-3 pb-2.5 sm:pb-3 lg:pb-4 rounded-[1px] border border-[#2f1819] backdrop-blur-[1px] overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 35%, rgba(20,16,18,0.74) 0%, rgba(11,8,10,0.84) 100%)',
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply bg-cover bg-center"
                    style={{ backgroundImage: slateBg }}
                  />
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#5c2023]/75" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#5c2023]/75" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#5c2023]/75" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#5c2023]/75" />

                  <div className="relative z-10 shrink-0 w-full flex items-center justify-between pb-1 sm:pb-1.5 lg:pb-2 mb-1.5 sm:mb-2 lg:mb-3 border-b border-[#3a1a1c]/80">
                    <h2 className="text-[9px] sm:text-[10px] lg:text-xs font-['Cinzel',_serif] font-bold text-[#ede3d2] uppercase tracking-[0.14em] lg:tracking-[0.26em]">
                      Your Satchel
                    </h2>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-stone-400">
                      {draftPlayerDeck.filter(c => c.name === "Trade Pelt").length} Pelts
                    </span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-center gap-1 sm:gap-2 lg:gap-3 my-auto">
                    <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                      {draftPlayerDeck.slice(0, 3).map((c, sliceIdx) => renderPlayerDraftSlot(c, sliceIdx))}
                    </div>
                    <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                      {draftPlayerDeck.slice(3).map((c, sliceIdx) => renderPlayerDraftSlot(c, sliceIdx + 3))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Tray: The Trader's Table (Crimson Cloth Well) */}
              <div
                className="relative p-[4px] rounded-[2px] shadow-[0_18px_38px_rgba(0,0,0,0.92)]"
                style={{ backgroundImage: woodBg, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2px] bg-[#0a0505]/55 border border-[#3a1517]" />
                <div
                  className="relative h-full flex flex-col items-center px-2 sm:px-3.5 lg:px-5 pt-2 sm:pt-2.5 lg:pt-3 pb-2.5 sm:pb-3 lg:pb-4 rounded-[1px] border border-[#3d1618] backdrop-blur-[1px] overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 35%, rgba(56,9,12,0.72) 0%, rgba(24,5,7,0.82) 58%, rgba(11,3,4,0.88) 100%)',
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply bg-cover bg-center"
                    style={{ backgroundImage: clothBg }}
                  />
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-red-700/75" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-red-700/75" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-red-700/75" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-red-700/75" />

                  <div className="relative z-10 shrink-0 w-full flex items-center justify-between pb-1 sm:pb-1.5 lg:pb-2 mb-1.5 sm:mb-2 lg:mb-3 border-b border-[#521a1d]/80">
                    <h2 className="text-[9px] sm:text-[10px] lg:text-xs font-['Cinzel',_serif] font-bold text-[#f0ded6] uppercase tracking-[0.14em] lg:tracking-[0.26em]">
                      The Trader&rsquo;s Table
                    </h2>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-red-300/80">
                      {draftRevealedIndices.length} Revealed
                    </span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-center gap-1 sm:gap-2 lg:gap-3 my-auto">
                    <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                      {draftTradePool.slice(0, 4).map((c, idx) => renderMerchantDraftSlot(c, idx))}
                    </div>
                    <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                      {draftTradePool.slice(4, 8).map((c, sliceIdx) => renderMerchantDraftSlot(c, sliceIdx + 4))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diegetic Action Bar */}
            <div className="relative z-10 flex items-center gap-5 sm:gap-7 shrink-0 pb-1">
              <button
                onClick={executeDraftTrade}
                disabled={!canConfirmTrade}
                className={`edge-band edge-band--btn relative px-8 sm:px-10 py-2 transition-colors duration-150 font-['Cinzel',_serif] font-black text-xs sm:text-sm uppercase tracking-[0.24em] select-none ${
                  canConfirmTrade
                    ? 'edge-band--red text-red-400 hover:text-red-200 cursor-pointer'
                    : 'edge-band--dead text-stone-600 opacity-45 cursor-not-allowed'
                }`}
                style={
                  canConfirmTrade
                    ? { textShadow: '0 0 18px rgba(239,68,68,0.8), 0 2px 5px rgba(0,0,0,1)' }
                    : undefined
                }
              >
                Strike Bargain
              </button>

              <span className="text-[#5c1f22] text-xs select-none">◆</span>

              <button
                onClick={finalizeDraft}
                disabled={!canVentureOnward}
                className={`edge-band edge-band--btn relative px-8 sm:px-10 py-2 transition-colors duration-150 font-['Cinzel',_serif] font-black text-xs sm:text-sm uppercase tracking-[0.24em] select-none ${
                  canVentureOnward
                    ? 'edge-band--gold text-[#f6dc93] hover:text-white cursor-pointer'
                    : 'edge-band--dead text-stone-600 opacity-45 cursor-not-allowed'
                }`}
                style={
                  canVentureOnward
                    ? { textShadow: '0 0 18px rgba(234,179,8,0.6), 0 2px 5px rgba(0,0,0,1)' }
                    : undefined
                }
              >
                Venture Onward
              </button>
            </div>
          </div>
        );
      })()}
      {/* Floating persistent Sanctuary button in top-left on the map screen */}
      {screen === 'EVENT_CROSSROADS' && (
        <div className="fixed top-3 left-4 z-[60] flex items-center select-none pointer-events-auto">
          <RitualSlateButton onClick={() => setShowPauseMenu(true)} icon={<RbMenu className="w-4 h-4" />} label="SANCTUARY" title="Sanctuary & Settings" />
        </div>
      )}

      {/* Floating persistent Dev Tools & Deck access during all events */}
      {screen.startsWith('EVENT_') && (
        <div className="fixed top-2 right-2.5 sm:top-3 sm:right-4 z-[60] flex items-center gap-2 sm:gap-3 select-none scale-[0.82] sm:scale-100 origin-top-right">
          <RitualSlateButton onClick={openViewDeck} icon={<RbLayers className="w-4 h-4" />} label={`DECK (${masterDeck.length})`} />
          {showDevTools && (
              <RitualSlateButton onClick={openDevMenu} label="DEV TOOLS" title="Development Tools" variant="dev" />
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
        />
      )}

      {/* =========================================================================
          EVENT: SURPLUS CACHE (ITEM BARTER)
         ========================================================================= */}
      {screen === 'EVENT_ITEMS' && (() => {
        const satchelFull = items.findIndex(s => s === null) === -1;
        const getEffectiveItemCost = (id: any): number => {
          const base: number = ITEM_COSTS[id] ?? 6;
          return activeVows.includes('empty_satchel') ? Math.ceil(base * 1.5) : base;
        };
        const canAffordAny = itemChoices.some(id => totalOverkillDamage >= getEffectiveItemCost(id));
        const cannotBuyMore = satchelFull || !canAffordAny || itemChoices.length === 0;

        const cacheBase = import.meta.env.BASE_URL || './';
        const cacheKnob = 'radial-gradient(circle at 46% 42%, #d4af6a 0 1.8px, #876128 2.4px, #36220f 4.4px, #110904 5.4px, transparent 6.5px)';
        const cacheFrameStyle: React.CSSProperties = {
          position: 'relative',
          borderStyle: 'solid',
          borderColor: 'transparent',
          borderWidth: '16px 12px 12px 12px',
          boxShadow: '0 0 0 1px #190e08, 0 0 0 2px #52361c, 0 26px 64px rgba(0,0,0,0.96), inset 0 1px 0 rgba(224,184,120,0.2)',
          backgroundColor: '#24160e',
          backgroundImage: [
            cacheKnob,
            cacheKnob,
            cacheKnob,
            cacheKnob,
            'radial-gradient(ellipse at 50% 0%, #5e0d10 0%, #3a0709 54%, #180304 100%)',
            
            'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
            `url("${cacheBase}assets/text/wood.jpg")`,
          ].join(', '),
          backgroundSize: ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'auto', '140px 140px'].join(', '),
          backgroundPosition: 'left top, right top, left bottom, right bottom, 0 0, 0 0, center',
          backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
          backgroundOrigin: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
          backgroundClip: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
        };

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

                {/* Main Carved Timber & Crimson Cloth Display Cabinet */}
                <div
                  style={cacheFrameStyle}
                  className="relative w-full flex flex-col justify-between rounded-[2px] bg-[#180304] px-5 sm:px-7 py-5 overflow-hidden"
                >

              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-multiply"
                style={{
                  backgroundImage: `url("${cacheBase}assets/text/cloth.jpg")`,
                  backgroundSize: '170px 170px',
                  backgroundRepeat: 'repeat',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-30"
                style={{
                  boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.92), inset 0 0 0 1px #140705, 0 0 0 1px rgba(184,138,68,0.24)',
                }}
              />
              <div className="pointer-events-none absolute inset-[6px] z-30 border border-dashed border-[#b98d46]/28" />
              <div className="pointer-events-none absolute top-[5px] left-[5px] w-3.5 h-3.5 z-30 border-t border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute top-[5px] right-[5px] w-3.5 h-3.5 z-30 border-t border-r border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] left-[5px] w-3.5 h-3.5 z-30 border-b border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] right-[5px] w-3.5 h-3.5 z-30 border-b border-r border-[#b8904a]/55" />
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
                                  background: 'radial-gradient(ellipse farthest-side at 50% 28%, rgba(212,175,55,0.22) 0%, transparent 68%)',
                                }}
                              />

                              <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 mb-3 rounded-full bg-[#0e0907] border border-[#523723] group-hover:border-[#d4af37]/90 flex items-center justify-center text-3xl shadow-[inset_0_0_14px_rgba(0,0,0,0.95)] transition-colors overflow-hidden">
                                  {getItemArtUrl(def) ? (
                                    <img
                                      src={getItemArtUrl(def)!}
                                      alt={def.name}
                                      className="w-11 h-11 object-contain select-none pointer-events-none group-hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                                    />
                                  ) : (
                                    <span className="group-hover:scale-110 transition-transform">{def.emoji}</span>
                                  )}
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
                              {slotDef ? (
                                getItemArtUrl(slotDef) ? (
                                  <img
                                    src={getItemArtUrl(slotDef)!}
                                    alt={slotDef.name}
                                    className="w-7 h-7 object-contain select-none pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
                                  />
                                ) : (
                                  slotDef.emoji
                                )
                              ) : (
                                <span className="text-[10px]">·</span>
                              )}
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
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-2.5 sm:px-4 lg:px-8 pt-2 pb-2 lg:py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('campfireevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,8,5,0.32)_0%,rgba(5,3,2,0.9)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_campfire')}
            <div className="relative z-10 max-w-5xl w-full h-full min-h-0 flex flex-col items-center justify-between gap-1 sm:gap-2 lg:gap-4">
              {/* Top Header (compact on short mobile landscape viewports) */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="hidden lg:flex items-center gap-3">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#9c5a3c]/75 to-[#d48b47]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#d69758]">
                    Divine Blessing
                  </span>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent via-[#9c5a3c]/75 to-[#d48b47]/85" />
                </div>
                <h1 className="text-sm sm:text-lg lg:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.14em] lg:tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Baptism of Boiling Blood
                </h1>
              </div>

              {/* Side-by-Side Two-Column Split on Mobile Landscape & Desktop (sm:grid), Vertical on Narrow Portrait */}
              <div className="w-full flex-1 min-h-0 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 lg:gap-5 items-stretch">
                {/* LEFT COLUMN: Stone Baptismal Font Prop + Always-Accessible Action Buttons */}
                <div className="flex-1 sm:col-span-7 flex flex-col items-center justify-between gap-1.5 lg:gap-3 min-h-0">
                  <div className="relative w-full flex-1 min-h-0 overflow-hidden px-2 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-4 flex flex-col items-center justify-between">
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
                            ? 'radial-gradient(ellipse farthest-side at 50% 55%, rgba(245,158,11,0.34) 0%, rgba(185,28,28,0.18) 48%, transparent 74%)'
                            : 'radial-gradient(ellipse farthest-side at 50% 65%, rgba(220,38,38,0.36) 0%, rgba(127,29,29,0.16) 46%, transparent 74%)',
                      }}
                    />

                    <span className="pointer-events-none absolute top-1.5 left-1.5 lg:top-2 lg:left-2 w-2.5 h-2.5 lg:w-3 lg:h-3 border-t border-l border-[#9c643b]/70" />
                    <span className="pointer-events-none absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2.5 h-2.5 lg:w-3 lg:h-3 border-t border-r border-[#9c643b]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 left-1.5 lg:bottom-2 lg:left-2 w-2.5 h-2.5 lg:w-3 lg:h-3 border-b border-l border-[#9c643b]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 right-1.5 lg:bottom-2 lg:right-2 w-2.5 h-2.5 lg:w-3 lg:h-3 border-b border-r border-[#9c643b]/70" />

                    {/* Status / Blessing Telemetry Strip */}
                    <div className="relative z-20 flex flex-wrap items-center justify-center gap-1.5 lg:gap-2 shrink-0">
                      <span className="px-2 lg:px-3 py-0.5 lg:py-1 rounded-[2px] bg-[#1a0d09]/92 border border-[#783422]/80 text-[8.5px] lg:text-[9.5px] font-mono font-bold uppercase tracking-[0.18em] lg:tracking-[0.22em] text-[#f2b886]">
                        Blessing: {campfireBuffType === 'attack' ? '+1 Power' : '+2 Health'}
                      </span>
                      {activeVows.includes('no_safe_campfire') && (
                        <span className="px-2 py-0.5 lg:py-1 rounded-[2px] border bg-[#240b09]/92 border-red-700/80 text-red-300 text-[8.5px] lg:text-[9.5px] font-mono font-bold uppercase tracking-[0.14em] lg:tracking-[0.18em]">
                          Vow — Single Baptism Only
                        </span>
                      )}
                      {campfireStage > 0 && (
                        <span
                          className={`px-2 py-0.5 lg:py-1 rounded-[2px] border text-[8.5px] lg:text-[9.5px] font-mono font-bold uppercase tracking-[0.14em] lg:tracking-[0.18em] ${
                            isCampfireSafe
                              ? 'bg-[#101c13]/92 border-emerald-700/75 text-emerald-300'
                              : 'bg-[#210b09]/92 border-red-700/80 text-red-300'
                          }`}
                        >
                          {isCampfireSafe ? 'Flock Slain — Safe' : 'Perilous Second Bath'}
                        </span>
                      )}
                    </div>

                    {/* Centerpiece: Creature Suspended Over the Boiling Blood Font (viewport-height clamped!) */}
                    {(() => {
                      const propBase = import.meta.env.BASE_URL || './';
                      const isPerilous = campfireStage > 0 && !isCampfireSafe;
                      const bubbleOffsets = isPerilous ? [-54, -32, -12, 8, 28, 48] : [-44, -16, 12, 40];
                      const sconcePositions = [
                        { side: 'left', leftPct: '6.2%', delay: '0s' },
                        { side: 'right', leftPct: '93.6%', delay: '0.28s' },
                      ];
                      return (
                        <div className="relative z-10 flex flex-col items-center justify-end w-full my-auto pt-[clamp(58px,19vh,142px)]">
                          {/* Aspect-Locked Stone Baptismal Font Stage (845x944), height-clamped so buttons NEVER clip on short phones */}
                          <div className="relative w-[clamp(108px,32vh,296px)] aspect-[845/944] select-none">
                            {/* Base Stone Chalice Prop */}
                            <img
                              src={`${propBase}assets/props/campfire.png`}
                              alt="Baptismal Blood Font"
                              draggable={false}
                              className="pointer-events-none relative z-10 w-full h-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.96)]"
                            />

                            {/* Boiling Blood Pool Synced Directly Inside the Stone Basin Rim */}
                            <svg
                              viewBox="0 0 240 60"
                              preserveAspectRatio="none"
                              className="pointer-events-none absolute left-[19.5%] top-[2.6%] w-[61%] h-[11.2%] z-20 overflow-visible"
                            >
                              <defs>
                                <radialGradient id="boilingBloodPool" cx="50%" cy="52%" r="54%">
                                  <stop
                                    offset="0%"
                                    stopColor={isAnimating ? '#fca5a5' : isPerilous ? '#f97316' : '#dc2626'}
                                  />
                                  <stop
                                    offset="58%"
                                    stopColor={isPerilous ? '#b91c1c' : '#991b1b'}
                                  />
                                  <stop offset="100%" stopColor="#3b0708" />
                                </radialGradient>
                              </defs>
                              {/* Crimson liquid surface fill */}
                              <ellipse
                                cx="120"
                                cy="31"
                                rx="114"
                                ry="25"
                                fill="url(#boilingBloodPool)"
                                className={isPerilous || isAnimating ? 'animate-pulse' : ''}
                              />
                              {/* Inner blood meniscus & shimmering ripples */}
                              <ellipse cx="120" cy="31" rx="112" ry="23" fill="none" stroke="#ef4444" strokeWidth="1.6" opacity="0.55" />
                              <ellipse cx="104" cy="29" rx="46" ry="8" fill="none" stroke="#fca5a5" strokeWidth="1.2" opacity="0.5" />
                              <ellipse cx="144" cy="34" rx="28" ry="5" fill="none" stroke="#fecaca" strokeWidth="1" opacity="0.38" />
                            </svg>

                            {/* Clip Viewport: Terminates Flush at the Blood Pool Surface so Sinking Cards Submerge Cleanly */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[90.4%] z-30 w-[96px] h-[82px] lg:w-[196px] lg:h-[156px] overflow-hidden flex items-start justify-center pt-0.5 lg:pt-1">
                              <div
                                data-event-drop-slot="campfire"
                                data-event-drop-enabled={campfireStage === 0 && !isEventBusy ? 'true' : 'false'}
                                className={`relative w-[58px] h-[78px] lg:w-[114px] lg:h-[152px] flex items-center justify-center rounded-[4px] transition-shadow duration-500 ${getDropSlotClass('campfire', campfireStage === 0 && !isEventBusy)} ${
                                  campfireAnimState === 'blessed'
                                    ? 'shadow-[0_0_40px_rgba(245,158,11,0.65),0_0_20px_rgba(220,38,38,0.45)]'
                                    : selectedCard
                                      ? 'shadow-[0_14px_28px_rgba(0,0,0,0.92),0_0_18px_rgba(220,38,38,0.28)]'
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
                                    className={`scale-[0.48] lg:scale-[0.98] origin-center ${campfireStage === 0 && !isEventBusy ? 'cursor-pointer hover:-translate-y-1 transition-transform' : ''}`}
                                  >
                                    {renderCard(selectedCard, { isClickable: false, disableHoverScale: true })}
                                  </div>
                                ) : (
                                  <div className="w-[54px] h-[74px] lg:w-[106px] lg:h-[146px] rounded-[4px] border border-dashed border-[#8a4632]/75 bg-[#120807]/75 flex flex-col items-center justify-center gap-0.5 lg:gap-1.5 text-[#b57c62]">
                                    <span className="text-xs lg:text-xl opacity-70">🩸</span>
                                    <span className="text-[6.5px] lg:text-[9.5px] uppercase tracking-[0.12em] lg:tracking-[0.2em] px-1 lg:px-2 text-center leading-tight">Drop Vessel</span>
                                  </div>
                                )}
                              </div>

                              {/* Surface Blood Splash / Meniscus Glow where the card pierces the boiling blood */}
                              {isAnimating && (
                                <div
                                  className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-24 lg:w-32 h-3 rounded-full bg-red-400/85 blur-[2px] shadow-[0_0_16px_rgba(248,113,113,0.95)]"
                                  style={{ animation: 'inkSplatterBurst 0.8s ease-out infinite' }}
                                />
                              )}
                            </div>

                            {/* Front Stone Basin Rim Occlusion Overlay so the Front Lip Sits Cleanly in Front of Blood & Splash */}
                            <img
                              src={`${propBase}assets/props/campfire.png`}
                              alt=""
                              aria-hidden="true"
                              draggable={false}
                              className="pointer-events-none absolute inset-0 z-[35] w-full h-full object-contain"
                              style={{ clipPath: 'inset(12.2% 0 0 0)' }}
                            />

                            {/* Rising Steam / Blood Bubbles from the Basin */}
                            <div className="pointer-events-none absolute left-1/2 top-[9%] -translate-x-1/2 w-24 lg:w-36 h-0 z-40">
                              {bubbleOffsets.map((xOff, idx) => (
                                <span
                                  key={idx}
                                  className={`absolute bottom-0 rounded-full ${
                                    isAnimating
                                      ? 'w-2 h-2 lg:w-2.5 lg:h-2.5 bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.95)]'
                                      : isPerilous
                                        ? 'w-1.5 h-1.5 lg:w-2 lg:h-2 bg-orange-400/90 shadow-[0_0_10px_rgba(249,115,22,0.85)]'
                                        : 'w-1 h-1 lg:w-1.5 lg:h-1.5 bg-red-500/70'
                                  }`}
                                  style={{
                                    left: `calc(50% + ${xOff * 0.65}px)`,
                                    animation: `bloodBubbleRise ${isAnimating ? 0.55 : isPerilous ? 0.95 : 2.1}s ease-out ${idx * 0.18}s infinite`,
                                  }}
                                />
                              ))}
                            </div>

                            {/* Animated Flickering Torch Flames on Both Side Sconces */}
                            {sconcePositions.map(({ side, leftPct, delay }) => (
                              <div
                                key={side}
                                className="pointer-events-none absolute z-40 -translate-x-1/2"
                                style={{
                                  left: leftPct,
                                  bottom: '83.8%',
                                  width: isPerilous ? '17%' : '14.5%',
                                }}
                              >
                                {/* Warm Ambient Sconce Halo */}
                                <div
                                  className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/4 w-[180%] aspect-square rounded-full blur-[10px]"
                                  style={{
                                    background: isPerilous
                                      ? 'radial-gradient(circle, rgba(251,146,60,0.85) 0%, rgba(220,38,38,0.45) 48%, transparent 74%)'
                                      : 'radial-gradient(circle, rgba(251,146,60,0.68) 0%, rgba(194,65,12,0.32) 48%, transparent 74%)',
                                    animation: `sconceGlowPulse ${isPerilous ? 0.7 : 1.35}s ease-in-out ${delay} infinite`,
                                  }}
                                />
                                {/* Layered Sculpted Flame Tongues */}
                                <svg
                                  viewBox="0 0 40 64"
                                  className="relative w-full h-auto overflow-visible origin-bottom"
                                  style={{
                                    filter: isPerilous
                                      ? 'drop-shadow(0 0 10px rgba(249,115,22,0.95))'
                                      : 'drop-shadow(0 0 7px rgba(234,88,12,0.85))',
                                    animation: `sconceFlameFlicker ${isPerilous ? 0.48 : 0.85}s ease-in-out ${delay} infinite`,
                                  }}
                                >
                                  <path
                                    d={
                                      isPerilous
                                        ? 'M20 2 C10 18, 4 32, 6 46 C8 56, 14 62, 20 62 C26 62, 32 56, 34 46 C36 32, 30 18, 20 2 Z'
                                        : 'M20 12 C12 24, 7 36, 8 48 C10 57, 15 62, 20 62 C25 62, 30 57, 32 48 C33 36, 28 24, 20 12 Z'
                                    }
                                    fill={isPerilous ? '#ea580c' : '#dc2626'}
                                    opacity="0.92"
                                  />
                                  <path
                                    d={
                                      isPerilous
                                        ? 'M20 14 C13 26, 10 38, 11 49 C12 56, 16 60, 20 60 C24 60, 28 56, 29 49 C30 38, 27 26, 20 14 Z'
                                        : 'M20 22 C14 31, 11 40, 12 50 C13 56, 16 60, 20 60 C24 60, 27 56, 28 50 C29 40, 26 31, 20 22 Z'
                                    }
                                    fill="#f59e0b"
                                  />
                                  <path
                                    d="M20 34 C16 41, 15 48, 16 54 C17 58, 18.5 59.5, 20 59.5 C21.5 59.5, 23 58, 24 54 C25 48, 24 41, 20 34 Z"
                                    fill="#fef08a"
                                  />
                                </svg>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <p className="relative z-20 mt-0.5 lg:mt-1 shrink-0 font-['Cinzel',_serif] text-[11px] lg:text-base tracking-[0.08em] text-[#ecd8bc] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                      {campfireStage === 0
                        ? 'Offer a creature.'
                        : isCampfireSafe
                          ? 'The chapel stands empty.'
                          : 'The flock grows hungry.'}
                    </p>
                  </div>

                  {/* Action Buttons — pinned shrink-0 above bottom edge so NEVER clipped on mobile */}
                  <div className="relative z-30 flex flex-wrap items-center justify-center gap-2 lg:gap-3 shrink-0 pb-0.5">
                    {!(campfireStage > 0 && activeVows.includes('no_safe_campfire')) && (
                      <button
                        data-campfire-action="baptize"
                        onClick={applyCampfireWarm}
                        disabled={campfireCardIdx === null || isEventBusy}
                        className="px-4 lg:px-7 py-1.5 lg:py-2.5 rounded-[2px] bg-gradient-to-b from-[#3b1610] to-[#1d0a07] hover:from-[#521e15] hover:to-[#290e0a] active:translate-y-[1px] border border-[#b85b3d]/90 hover:border-[#eb8a64] text-[#f7d6bf] hover:text-white font-['Cinzel',_serif] font-bold text-[10px] lg:text-xs uppercase tracking-[0.15em] lg:tracking-[0.2em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(0,0,0,0.88)] transition-all select-none"
                      >
                        {campfireHolding
                          ? 'Submerging...'
                          : campfireStage === 0
                            ? `Baptize Creature (${campfireBuffType === 'attack' ? '+1 Power' : '+2 Health'})`
                            : `Bathe Again (${campfireBuffType === 'attack' ? '+1 Power' : '+2 Health'})`}
                      </button>
                    )}
                    {campfireStage > 0 && (
                      <button
                        data-campfire-action="flee"
                        onClick={() => returnToMap()}
                        disabled={campfireHolding || isEventBusy}
                        className="px-4 lg:px-6 py-1.5 lg:py-2.5 rounded-[2px] bg-[#140e0a]/92 hover:bg-[#1f1610] active:translate-y-[1px] border border-[#4a3322]/85 hover:border-[#8c6742] text-[#cbb697] hover:text-[#f3e6cf] font-['Cinzel',_serif] font-bold text-[10px] lg:text-xs uppercase tracking-[0.15em] lg:tracking-[0.2em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_6px_16px_rgba(0,0,0,0.82)] transition-all select-none"
                      >
                        Flee the Chapel
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Side Deck Selector Panel (Side Panel on Mobile Landscape & Desktop, Bottom Strip on Portrait) */}
                <div
                  className={`shrink-0 h-[116px] sm:h-auto sm:col-span-5 relative flex flex-col sm:min-h-0 rounded-[3px] bg-[#0d0806]/84 border border-[#422719]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,220,180,0.06)] backdrop-blur-[2px] transition-opacity duration-300 ${
                    isEventBusy ? 'opacity-40 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9c643b]/70" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9c643b]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9c643b]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9c643b]/70" />

                  <div className="px-2.5 lg:px-4 py-1.5 lg:py-3 border-b border-[#3a2618]/80 flex items-center justify-start lg:justify-between gap-2.5 shrink-0">
                    <div className="text-[9px] lg:text-[10px] font-mono font-bold uppercase tracking-[0.18em] lg:tracking-[0.22em] text-[#d69758]">
                      Your Creatures ({masterDeck.length})
                    </div>
                    <span className="text-[8px] lg:text-[8.5px] font-mono uppercase tracking-[0.14em] lg:tracking-[0.16em] text-[#9b7a5e]">
                      Tap or hold 1s
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden sm:overflow-y-auto sm:overflow-x-hidden px-2.5 py-1.5 lg:px-3 lg:py-4">
                    <div className="flex flex-nowrap sm:flex-wrap gap-x-2 lg:gap-x-2.5 gap-y-2.5 lg:gap-y-4 justify-start sm:justify-center items-center sm:content-start h-full sm:h-auto">
                      {masterDeck.map((c, idx) => {
                        const isSelected = campfireCardIdx === idx;
                        if (isSelected) return null;
                        const lockedOut = campfireStage > 0;
                        const cardKey = c.id || `camp-${c.name}-${idx}`;
                        const isBeingDragged = eventDrag?.cardKey === cardKey;
                        return (
                          <div
                            key={cardKey}
                            onPointerDown={(e) =>
                              startEventCardDrag(e, {
                                disabled: lockedOut || isEventBusy,
                                card: c,
                                cardKey,
                                allowedSlots: ['campfire'],
                                onDrop: () => {
                                  if (campfireStage === 0 && !isEventBusy) {
                                    triggerSfx('place');
                                    setCampfireCardIdx(idx);
                                  }
                                },
                              })
                            }
                            onClick={() => {
                              if (suppressNextClickRef.current) return;
                              if (campfireStage === 0 && !isEventBusy) {
                                triggerSfx('draw');
                                setCampfireCardIdx(idx);
                              }
                            }}
                            className={`relative shrink-0 flex flex-col items-center justify-center w-[70px] h-[96px] lg:w-[104px] lg:h-[146px] touch-pan-x sm:touch-auto transition-all duration-200 ${
                              isBeingDragged
                                ? 'opacity-25 scale-95'
                                : lockedOut
                                  ? 'opacity-30 grayscale-[45%] cursor-default'
                                  : 'hover:-translate-y-1 cursor-grab active:cursor-grabbing'
                            }`}
                          >
                            <div className="transform origin-center transition-transform duration-200 scale-[0.60] lg:scale-[0.86] lg:hover:scale-[0.91]">
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
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-3 sm:px-6 lg:px-8 pt-12 pb-2 sm:py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('altarevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.3)_0%,rgba(5,3,2,0.9)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_altar')}
            <div className="relative z-10 max-w-6xl w-full h-full min-h-0 flex flex-col items-center justify-between gap-2 sm:gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.26em] sm:tracking-[0.3em] text-[#c79d5a]">
                    Crestfallen Altar
                  </span>
                  <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-lg sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Crest Transfer
                </h1>
              </div>

              {/* Two-Column Split on Desktop, Top Stage + Bottom Horizontal Tray on Mobile */}
              <div className="w-full flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-5 items-stretch">
                {/* LEFT COLUMN: Dominant Stone Altar Stage + Ritual Action */}
                <div className="flex-1 lg:col-span-7 flex flex-col items-center justify-between gap-2 lg:gap-3 min-h-0">
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
                            ? 'radial-gradient(ellipse farthest-side at 50% 66%, rgba(220,38,38,0.46) 0%, rgba(127,29,29,0.18) 46%, transparent 74%)'
                            : 'radial-gradient(ellipse farthest-side at 50% 58%, rgba(212,175,55,0.22) 0%, rgba(120,35,24,0.14) 48%, transparent 74%)',
                      }}
                    />

                    {/* Subtle corner brackets */}
                    <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#9a7342]/70" />

                    {/* Full-Scale Ritual Column: Host Above -> Sacrifice on Altar Circle Below */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full">
                      {/* Upper Host Slot — descends directly onto the glowing red altar circle when sacrificing finishes */}
                      <div
                        className={`relative z-30 flex flex-col items-center transition-transform duration-700 ease-in-out ${
                          altarAnimPhase === 'descending' || altarAnimPhase === 'done'
                            ? 'translate-y-[98px] sm:translate-y-[126px] lg:translate-y-[166px]'
                            : 'translate-y-0'
                        }`}
                      >
                        <span
                          className={`mb-1 sm:mb-1.5 px-2 sm:px-2.5 py-0.5 rounded-[2px] border text-[8.5px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] transition-colors duration-300 ${
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
                              : '1. Drop or Select Host'}
                        </span>

                        <div
                          data-event-drop-slot="altar-host"
                          data-event-drop-enabled={!isAnimating ? 'true' : 'false'}
                          className={`w-[72px] h-[98px] sm:w-[88px] sm:h-[118px] lg:w-[114px] lg:h-[154px] flex items-center justify-center rounded-[4px] transition-all duration-300 ${getDropSlotClass('altar-host', !isAnimating)} ${
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
                              className={`scale-[0.62] sm:scale-[0.76] lg:scale-[0.98] origin-center ${!isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                            >
                              {renderCard(hostPreview, { isClickable: false, disableHoverScale: true })}
                            </div>
                          ) : (
                            <div className="w-[68px] h-[94px] sm:w-[84px] sm:h-[114px] lg:w-[108px] lg:h-[150px] rounded-[4px] border border-dashed border-[#7a5a3a]/75 bg-[#0d0907]/75 flex flex-col items-center justify-center gap-1 text-[#9a7d5e]">
                              <span className="text-lg sm:text-xl opacity-65">✧</span>
                              <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.2em]">Host</span>
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
                              className="absolute bottom-28 w-3 h-3 rounded-full bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.95)]"
                              style={{
                                marginLeft: `${offset}px`,
                                animation: `altarSigilRise 0.8s ease-out ${i * 0.12}s forwards`,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Lower Sacrificial Stone Altar Prop + Sacrifice Slot Seated on Glowing Red Tabletop Circle */}
                      <div className="relative z-20 mt-1.5 sm:mt-2 lg:mt-3 flex flex-col items-center w-full">
                        <div
                          data-event-drop-slot="altar-sacrifice"
                          data-event-drop-enabled={!isAnimating ? 'true' : 'false'}
                          className={`relative z-20 w-[72px] h-[98px] sm:w-[88px] sm:h-[118px] lg:w-[114px] lg:h-[154px] -mb-6 sm:-mb-9 lg:-mb-11 flex items-center justify-center rounded-[4px] transition-opacity duration-300 ${getDropSlotClass('altar-sacrifice', !isAnimating)}`}
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
                              className={`scale-[0.62] sm:scale-[0.78] lg:scale-[1.0] origin-center ${!isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                            >
                              {renderCard(sacPreview, { isClickable: false, disableHoverScale: true, isMarkedSacrifice: true })}
                            </div>
                          ) : (
                            <div className="w-[68px] h-[94px] sm:w-[84px] sm:h-[114px] lg:w-[108px] lg:h-[150px] rounded-[4px] border border-dashed border-red-900/75 bg-[#120807]/80 flex flex-col items-center justify-center gap-1 text-red-400/70">
                              <span className="text-lg sm:text-xl opacity-75">†</span>
                              <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.18em] sm:tracking-[0.22em]">Sacrifice</span>
                            </div>
                          )}
                        </div>

                        {/* Illustrated Sacrificial Stone Altar Prop (1292x555) */}
                        <div className="relative w-full max-w-[238px] sm:max-w-[380px] lg:max-w-[470px] aspect-[1292/555] pointer-events-none select-none">
                          <img
                            src={`${import.meta.env.BASE_URL || './'}assets/props/sacrifice.png`}
                            alt="Sacrificial Stone Altar"
                            draggable={false}
                            className={`w-full h-full object-contain transition-all duration-500 ${
                              altarAnimPhase === 'sacrificing'
                                ? 'drop-shadow-[0_0_28px_rgba(220,38,38,0.6)] brightness-110'
                                : 'drop-shadow-[0_18px_28px_rgba(0,0,0,0.96)]'
                            }`}
                          />
                        </div>
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

                {/* RIGHT COLUMN: Side Deck Selector Panel (Horizontal Touch Tray on Mobile) */}
                <div
                  className={`shrink-0 h-[150px] sm:h-[168px] lg:h-auto lg:col-span-5 relative flex flex-col lg:min-h-0 rounded-[3px] bg-[#0d0806]/84 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,228,185,0.06)] backdrop-blur-[2px] transition-opacity duration-500 ${
                    isAnimating ? 'opacity-30 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9a7342]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9a7342]/70" />

                  {/* Panel Header & Step Prompt */}
                  <div className="px-3 sm:px-4 py-1.5 sm:py-3 border-b border-[#3a2618]/80 flex items-center justify-between gap-2 shrink-0">
                    <div className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-[#c79d5a]">
                      Your Creatures ({masterDeck.length})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8.5px] font-mono uppercase tracking-[0.16em] text-[#9c8469]">
                        Tap or hold 1s
                      </span>
                      {(altarHostId || altarSacrificeId) && !isAnimating && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerSfx('draw');
                            setAltarHostId(null);
                            setAltarSacrificeId(null);
                          }}
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[2px] bg-[#1a110c] hover:bg-[#281a12] border border-[#5a3d28] text-[9px] sm:text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#d4bfa0] cursor-pointer transition shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Touch Tray on Mobile, Vertical Scrollable Grid on Desktop */}
                  <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden lg:overflow-y-auto lg:overflow-x-hidden px-3 py-1.5 lg:py-4">
                    <div className="flex flex-nowrap lg:flex-wrap gap-x-2 lg:gap-x-2.5 gap-y-4 justify-start lg:justify-center items-center lg:content-start h-full lg:h-auto">
                      {masterDeck.map(c => {
                        const isHost = altarHostId === c.id;
                        const isSac = altarSacrificeId === c.id;
                        if (isHost || isSac) return null;
                        const hostCard = masterDeck.find(m => m.id === altarHostId);
                        const sacCard = masterDeck.find(m => m.id === altarSacrificeId);
                        const cannotBeHost = hasMoreSigilsThanOriginal(c);

                        let wouldExceedFiveAsSac = false;
                        if (hostCard && c.sigils && c.sigils.length > 0) {
                          const merged = new Set(hostCard.sigils || []);
                          c.sigils.forEach((s: any) => merged.add(s));
                          if (merged.size >= 5) wouldExceedFiveAsSac = true;
                        }

                        let wouldExceedFiveAsHost = false;
                        if (sacCard && sacCard.sigils && sacCard.sigils.length > 0) {
                          const merged = new Set(c.sigils || []);
                          sacCard.sigils.forEach((s: any) => merged.add(s));
                          if (merged.size >= 5) wouldExceedFiveAsHost = true;
                        }

                        const canDropOnHost = !isAnimating && !cannotBeHost && !wouldExceedFiveAsHost;
                        const canDropOnSac = !isAnimating && Boolean(c.sigils && c.sigils.length > 0) && !wouldExceedFiveAsSac;
                        const allowedSlots: string[] = [];
                        if (canDropOnHost) allowedSlots.push('altar-host');
                        if (canDropOnSac) allowedSlots.push('altar-sacrifice');

                        const isClickDisabled =
                          isAnimating ||
                          (!altarHostId && cannotBeHost) ||
                          (Boolean(altarHostId) && !isHost && (wouldExceedFiveAsSac || !c.sigils || c.sigils.length === 0));
                        const cardKey = c.id || `altar-${c.name}`;
                        const isBeingDragged = eventDrag?.cardKey === cardKey;

                        return (
                          <div
                            key={cardKey}
                            onPointerDown={(e) =>
                              startEventCardDrag(e, {
                                disabled: allowedSlots.length === 0,
                                card: c,
                                cardKey,
                                allowedSlots,
                                onDrop: (slotId) => {
                                  if (isAnimating) return;
                                  if (slotId === 'altar-host') {
                                    if (cannotBeHost) {
                                      addLog(`${getCardDisplayName(c.name)} cannot receive more crests: it already bears more than its original nature allows.`);
                                      return;
                                    }
                                    triggerSfx('place');
                                    setAltarHostId(c.id || null);
                                  } else if (slotId === 'altar-sacrifice') {
                                    if (wouldExceedFiveAsSac) {
                                      addLog(`Cannot sacrifice ${getCardDisplayName(c.name)}: ${getCardDisplayName(hostCard?.name)} would have 5 or more crests (max 4 allowed).`);
                                      return;
                                    }
                                    if (c.sigils && c.sigils.length > 0) {
                                      triggerSfx('place');
                                      setAltarSacrificeId(c.id || null);
                                    }
                                  }
                                },
                              })
                            }
                            onClick={() => {
                              if (suppressNextClickRef.current) return;
                              if (isAnimating) return;
                              if (!altarHostId) {
                                if (cannotBeHost) {
                                  addLog(`${getCardDisplayName(c.name)} cannot receive more crests: it already bears more than its original nature allows.`);
                                  return;
                                }
                                triggerSfx('draw');
                                setAltarHostId(c.id || null);
                              } else if (altarHostId === c.id) {
                                triggerSfx('draw');
                                setAltarHostId(null);
                                setAltarSacrificeId(null);
                              } else if (!altarSacrificeId) {
                                if (wouldExceedFiveAsSac) {
                                  addLog(`Cannot sacrifice ${getCardDisplayName(c.name)}: ${getCardDisplayName(hostCard?.name)} would have 5 or more crests (max 4 allowed).`);
                                  return;
                                }
                                if (c.sigils && c.sigils.length > 0) {
                                  triggerSfx('draw');
                                  setAltarSacrificeId(c.id || null);
                                }
                              } else if (altarSacrificeId === c.id) {
                                triggerSfx('draw');
                                setAltarSacrificeId(null);
                              }
                            }}
                            className={`relative shrink-0 flex flex-col items-center justify-center w-[78px] h-[108px] lg:w-[104px] lg:h-[146px] touch-pan-x lg:touch-auto transition-all duration-200 ${
                              isBeingDragged
                                ? 'opacity-25 scale-95'
                                : isClickDisabled && allowedSlots.length === 0
                                  ? 'opacity-35 grayscale-[55%] cursor-not-allowed'
                                  : isClickDisabled
                                    ? 'opacity-65 cursor-grab active:cursor-grabbing hover:-translate-y-1'
                                    : 'hover:-translate-y-1 cursor-grab active:cursor-grabbing'
                            }`}
                          >
                            <div className="transform origin-center transition-transform duration-200 scale-[0.66] lg:scale-[0.86] lg:hover:scale-[0.91]">
                              {renderCard(c, {
                                isSelected: isHost,
                                isMarkedSacrifice: isSac,
                                isClickable: !isClickDisabled || allowedSlots.length > 0,
                                disableHoverScale: true,
                              })}
                            </div>
                            {!altarHostId && cannotBeHost && (
                              <span className="pointer-events-none absolute -bottom-1 lg:-bottom-2 text-[7.5px] lg:text-[8px] font-mono text-amber-400/90 font-bold uppercase tracking-wider whitespace-nowrap">
                                Sac Only
                              </span>
                            )}
                            {altarHostId && !isHost && wouldExceedFiveAsSac && (
                              <span className="pointer-events-none absolute -bottom-1 lg:-bottom-2 text-[7.5px] lg:text-[8px] font-mono text-red-400/90 font-bold uppercase tracking-wider whitespace-nowrap">
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
            className="absolute inset-0 bg-[#0b0807] z-50 flex flex-col items-center justify-center px-3 pt-12 pb-2 sm:px-6 sm:py-5 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('altarevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(22,12,8,0.42)_0%,rgba(6,4,3,0.92)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_anvil')}
            <div className="relative z-10 w-full max-w-6xl h-full min-h-0 flex flex-col">
              {/* Header */}
              <div className="shrink-0 flex flex-col items-center text-center pb-1.5 sm:pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 sm:w-20 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.26em] sm:tracking-[0.3em] text-[#c79d5a]">
                    Iron &amp; Sinew
                  </span>
                  <div className="h-px w-8 sm:w-20 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-lg sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#efe0be] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Transmutation Table
                </h1>
                <p className="hidden sm:block mt-1 font-['Cinzel',_serif] text-sm italic tracking-[0.1em] text-[#e5cfa8] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  &ldquo;Something about this feels wrong.&rdquo;
                </p>
              </div>

              {/* Two-Column Split on Desktop, Top Stage + Bottom Horizontal Tray on Mobile */}
              <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 sm:gap-5 items-stretch">
                {/* Left Column: Iron Anvil + Diegetic Tools */}
                <div className="flex-1 lg:col-span-7 min-h-0 flex flex-col justify-between p-2 sm:p-5">
                  {/* Anvil Prop Stage (861x939) */}
                  <div className="flex-1 min-h-0 flex flex-col items-center justify-end relative pt-[84px] sm:pt-[136px] pb-1 sm:pb-2">
                    <div className="relative w-[168px] sm:w-[274px] lg:w-[294px] aspect-[861/939] select-none">
                      {/* Card Seated Directly on the Glowing Red Transmutation Circle (x≈56%, y≈9%) */}
                      <div
                        data-event-drop-slot="anvil"
                        data-event-drop-enabled={!isEventBusy ? 'true' : 'false'}
                        onClick={() => {
                          if (!selectedCard || isEventBusy) return;
                          triggerSfx('draw');
                          setAnvilSelectedId(null);
                        }}
                        title={selectedCard && !isEventBusy ? 'Click to return creature to deck' : undefined}
                        className={`absolute left-[56%] -translate-x-1/2 bottom-[90.5%] z-20 rounded-[4px] transition-all duration-200 ${getDropSlotClass('anvil', !isEventBusy)} ${selectedCard && !isEventBusy ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
                        style={{
                          animation: anvilStrikeAnim !== 'idle' ? 'anvilStrikeJolt 0.65s ease-out' : undefined,
                        }}
                      >
                        {selectedCard ? (
                          <div className="scale-[0.72] sm:scale-[0.98] origin-bottom shadow-[0_14px_28px_rgba(0,0,0,0.94),0_0_24px_rgba(220,38,38,0.34)] rounded-[4px]">
                            {renderCard(selectedCard, { isClickable: false, disableHoverScale: true })}
                          </div>
                        ) : (
                          <div className="w-[78px] h-[108px] sm:w-[104px] sm:h-[146px] rounded-[4px] border border-dashed border-[#8a4530]/80 bg-[#120a08]/80 shadow-[0_0_20px_rgba(220,38,38,0.2)] flex flex-col items-center justify-center gap-1 sm:gap-1.5 text-[#c79a74]">
                            <span className="text-base sm:text-xl opacity-70">⚒</span>
                            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.2em] px-1.5 sm:px-2 text-center">Drop Creature</span>
                          </div>
                        )}
                      </div>

                      {/* Illustrated Runic Iron Anvil Prop */}
                      <img
                        src={`${import.meta.env.BASE_URL || './'}assets/props/anvil.png`}
                        alt="Runic Transmutation Anvil"
                        draggable={false}
                        className={`pointer-events-none relative z-10 w-full h-full object-contain transition-all duration-300 ${
                          anvilStrikeAnim !== 'idle'
                            ? 'drop-shadow-[0_0_28px_rgba(239,68,68,0.65)] brightness-115'
                            : 'drop-shadow-[0_16px_26px_rgba(0,0,0,0.96)]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Tool Strikes + Leave Action */}
                  <div className="shrink-0 pt-2 sm:pt-3.5 border-t border-[#3a271b]/75 flex flex-col gap-2 sm:gap-3">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-left">
                      <button
                        onClick={() => applyAnvilStrike('hammer')}
                        disabled={!canHammer || isEventBusy}
                        className={`group relative w-full p-2 sm:p-3.5 rounded-[3px] border flex items-center gap-2 sm:gap-3.5 text-left transition-all duration-200 ${
                          canHammer && !isEventBusy
                            ? 'bg-gradient-to-r from-[#24130f]/95 to-[#160c09]/95 border-[#8f4c35]/85 hover:border-[#e08256] hover:shadow-[0_0_24px_rgba(224,130,86,0.22)] cursor-pointer'
                            : 'bg-[#120d0b]/70 border-[#2e231c]/70 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-12 sm:h-12 shrink-0 rounded-[3px] bg-[#0d0806] border border-[#543624] group-hover:border-[#d4845a] flex items-center justify-center shadow-inner">
                          <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7 text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6l8 8-4 4-8-8 4-4Z" fill="rgba(251,191,36,0.16)" />
                            <path d="M14 10l-3 3 5 5 3-3" />
                            <path d="M13 15L5 23a2 2 0 0 0 2.8 2.8L16 17.8" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Cinzel',_serif] font-bold text-[11px] sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[#f3dfb6] group-hover:text-white leading-tight">
                            Blood-to-Bone
                          </div>
                          {selectedCard && !canHammer && (
                            <div className="mt-0.5 text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-red-400/85">
                              Requires Blood
                            </div>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => applyAnvilStrike('forceps')}
                        disabled={!canForceps || isEventBusy}
                        className={`group relative w-full p-2 sm:p-3.5 rounded-[3px] border flex items-center gap-2 sm:gap-3.5 text-left transition-all duration-200 ${
                          canForceps && !isEventBusy
                            ? 'bg-gradient-to-r from-[#1a151b]/95 to-[#100d12]/95 border-[#6b5a78]/85 hover:border-[#c4a7db] hover:shadow-[0_0_24px_rgba(196,167,219,0.2)] cursor-pointer'
                            : 'bg-[#120d0b]/70 border-[#2e231c]/70 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-12 sm:h-12 shrink-0 rounded-[3px] bg-[#0b090d] border border-[#453a4f] group-hover:border-[#b799cf] flex items-center justify-center shadow-inner">
                          <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7 text-stone-200" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="24" r="3" />
                            <circle cx="23" cy="24" r="3" />
                            <path d="M11 21.5L19.5 7.5C20.3 6.2 21.8 5.5 23 6" />
                            <path d="M21 21.5L12.5 7.5C11.7 6.2 10.2 5.5 9 6" />
                            <circle cx="16" cy="14.5" r="1.2" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Cinzel',_serif] font-bold text-[11px] sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[#e7dff0] group-hover:text-white leading-tight">
                            Hollowing
                          </div>
                          {selectedCard && !canForceps && (
                            <div className="mt-0.5 text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-amber-400/85">
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
                        className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-[2px] bg-[#16100d] hover:bg-[#221814] border border-[#4a3628] text-[9.5px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-[#b8a085] hover:text-[#f0dec2] cursor-pointer transition"
                      >
                        Step Away
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Scrollable Deck Selector (Horizontal Touch Tray on Mobile) */}
                <div className="shrink-0 h-[146px] sm:h-[168px] lg:h-auto lg:col-span-5 lg:min-h-0 flex flex-col rounded-[3px] bg-[#0d0806]/82 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.9)] overflow-hidden">
                  <div className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2.5 border-b border-[#342217]/80 flex items-center justify-between bg-[#120b08]/80">
                    <span className="font-['Cinzel',_serif] text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#d8c19a]">
                      Deck ({masterDeck.length})
                    </span>
                    <span className="text-[8.5px] font-mono uppercase tracking-[0.16em] text-[#9b8266]">
                      Tap or hold 1s
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden lg:overflow-y-auto lg:overflow-x-hidden px-3 py-1.5 lg:p-3">
                    <div className="flex flex-nowrap lg:flex-wrap gap-2 lg:gap-2.5 justify-start lg:justify-center items-center lg:content-start h-full lg:h-auto">
                      {masterDeck.map((c, idx) => {
                        const isPicked = anvilSelectedId === c.id;
                        if (isPicked) return null;
                        const cardKey = c.id || `anvil-${c.name}-${idx}`;
                        const isBeingDragged = eventDrag?.cardKey === cardKey;
                        return (
                          <div
                            key={cardKey}
                            onPointerDown={(e) =>
                              startEventCardDrag(e, {
                                disabled: isEventBusy,
                                card: c,
                                cardKey,
                                allowedSlots: ['anvil'],
                                onDrop: () => {
                                  if (isEventBusy) return;
                                  triggerSfx('place');
                                  setAnvilSelectedId(c.id || null);
                                },
                              })
                            }
                            onClick={() => {
                              if (suppressNextClickRef.current) return;
                              if (isEventBusy) return;
                              triggerSfx('draw');
                              setAnvilSelectedId(isPicked ? null : c.id || null);
                            }}
                            className={`relative shrink-0 flex items-center justify-center w-[76px] h-[106px] lg:w-[104px] lg:h-[146px] touch-pan-x lg:touch-auto transition-all duration-200 ${
                              isBeingDragged
                                ? 'opacity-25 scale-95'
                                : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5'
                            }`}
                          >
                            <div className="transform origin-center transition-transform duration-200 scale-[0.65] lg:scale-[0.86] lg:hover:scale-[0.92]">
                              {renderCard(c, { isSelected: isPicked, isClickable: !isEventBusy, disableHoverScale: true })}
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
          THE ZEALOTS FLOCK EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_FLOCK' && (() => {
        const selectedSheep = flockSheepList.find(s => s.id === flockSelectedSheepId) || null;
        const revealedOption = selectedSheep ? FLOCK_OPTIONS[selectedSheep.optionId] : null;
        const isGreyMode = flockSheepList.length === 1 && flockSheepList[0]?.isGrey;
        const canRepick = !isGreyMode && flockRepicksUsed === 0 && Boolean(selectedSheep);

        const flockBase = import.meta.env.BASE_URL || './';
        const flockKnob = 'radial-gradient(circle at 46% 42%, #d4af6a 0 1.8px, #876128 2.4px, #36220f 4.4px, #110904 5.4px, transparent 6.5px)';
        const flockFrameStyle: React.CSSProperties = {
          position: 'relative',
          borderStyle: 'solid',
          borderColor: 'transparent',
          borderWidth: '16px 12px 12px 12px',
          boxShadow: '0 0 0 1px #190e08, 0 0 0 2px #52361c, 0 26px 64px rgba(0,0,0,0.96), inset 0 1px 0 rgba(224,184,120,0.2)',
          backgroundColor: '#24160e',
          backgroundImage: [
            flockKnob,
            flockKnob,
            flockKnob,
            flockKnob,
            'radial-gradient(ellipse at 50% 0%, #5e0d10 0%, #3a0709 54%, #180304 100%)',
            
            'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
            `url("${flockBase}assets/text/wood.jpg")`,
          ].join(', '),
          backgroundSize: ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'auto', '140px 140px'].join(', '),
          backgroundPosition: 'left top, right top, left bottom, right bottom, 0 0, 0 0, center',
          backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
          backgroundOrigin: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
          backgroundClip: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
        };

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
                <div
                  style={flockFrameStyle}
                  className="relative w-full max-w-4xl mt-5 p-5 rounded-[2px] bg-[#180304] overflow-hidden"
                >

              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-multiply"
                style={{
                  backgroundImage: `url("${flockBase}assets/text/cloth.jpg")`,
                  backgroundSize: '170px 170px',
                  backgroundRepeat: 'repeat',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-30"
                style={{
                  boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.92), inset 0 0 0 1px #140705, 0 0 0 1px rgba(184,138,68,0.24)',
                }}
              />
              <div className="pointer-events-none absolute inset-[6px] z-30 border border-dashed border-[#b98d46]/28" />
              <div className="pointer-events-none absolute top-[5px] left-[5px] w-3.5 h-3.5 z-30 border-t border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute top-[5px] right-[5px] w-3.5 h-3.5 z-30 border-t border-r border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] left-[5px] w-3.5 h-3.5 z-30 border-b border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] right-[5px] w-3.5 h-3.5 z-30 border-b border-r border-[#b8904a]/55" />
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
                  {/* Fenced Pen Arena with flock.png and 13 Wandering Sheep (or 1 Lone Grey Sheep) */}
                  {(() => {
                    const sheepColX = [34, 220, 411, 594, 778];
                    const sheepRowY = [24, 166, 306, 447, 582];
                    // 24 varied black sheep cells from the 5x5 sheet (excluding center cell col=2, row=2 which is the lone grey sheep)
                    const blackSheepCells: [number, number][] = [];
                    for (let r = 0; r < 5; r++) {
                      for (let c = 0; c < 5; c++) {
                        if (c === 2 && r === 2) continue;
                        blackSheepCells.push([c, r]);
                      }
                    }
                    const sheepSheetUrl = `${flockBase}assets/props/black%20sheep.png`;

                    return (
                      <div className="relative w-full max-w-[590px] sm:max-w-[640px] aspect-[1376/768] mt-3 mb-3 select-none">
                        {/* Illustrated Top-Down Fenced Muddy Pasture Pen */}
                        <img
                          src={`${flockBase}assets/props/flock.png`}
                          alt="The Zealot's Flock Pen"
                          draggable={false}
                          className="pointer-events-none absolute inset-0 w-full h-full object-contain drop-shadow-[0_20px_42px_rgba(0,0,0,0.94)]"
                        />

                        {flockSheepList.map((sheep, sheepIdx) => {
                          const isPicked = flockSelectedSheepId === sheep.id;
                          const isLockedOut = Boolean(sheep.dismissed) || (Boolean(selectedSheep) && !isPicked);
                          const [cellCol, cellRow] = sheep.isGrey
                            ? [2, 2]
                            : blackSheepCells[(sheep.id * 5 + sheepIdx * 3) % blackSheepCells.length];
                          const vx = sheepColX[cellCol];
                          const vy = sheepRowY[cellRow];

                          return (
                            <button
                              key={sheep.id}
                              type="button"
                              disabled={Boolean(sheep.dismissed) || (Boolean(selectedSheep) && !isPicked)}
                              onClick={() => {
                                if (sheep.dismissed || selectedSheep) return;
                                triggerSfx('sheep_baa');
                                setFlockSelectedSheepId(sheep.id);
                              }}
                              className={`absolute -translate-x-1/2 -translate-y-1/2 p-0.5 transition-all duration-300 focus:outline-none ${
                                sheep.dismissed
                                  ? 'opacity-15 scale-75 pointer-events-none'
                                  : isPicked
                                    ? 'z-30 scale-[1.22] cursor-default'
                                    : isLockedOut
                                      ? 'opacity-55 cursor-default'
                                      : 'z-10 hover:z-20 hover:scale-[1.2] cursor-pointer'
                              }`}
                              style={{
                                left: `${sheep.x}%`,
                                top: `${sheep.y}%`,
                                animation: isPicked
                                  ? undefined
                                  : `${sheep.wanderAnim} ${sheep.duration}s ease-in-out ${sheep.delay}s infinite`,
                                filter: isPicked
                                  ? sheep.isGrey
                                    ? 'drop-shadow(0 0 14px rgba(248,250,252,0.9)) drop-shadow(0 6px 10px rgba(0,0,0,0.95))'
                                    : 'drop-shadow(0 0 14px rgba(245,158,11,0.92)) drop-shadow(0 6px 10px rgba(0,0,0,0.95))'
                                  : sheep.isGrey
                                    ? 'drop-shadow(0 0 10px rgba(226,232,240,0.45)) drop-shadow(0 6px 8px rgba(0,0,0,0.9))'
                                    : 'drop-shadow(0 0 3.5px rgba(214,190,152,0.36)) drop-shadow(0 5px 7px rgba(0,0,0,0.92))',
                              }}
                              title={sheep.isGrey ? 'The Lone Grey Sheep' : 'Select a Sheep'}
                            >
                              {/* Grounded Pasture Contact Shadow */}
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute left-1/2 bottom-[3px] -translate-x-1/2 w-[72%] h-[18%] rounded-full bg-black/55 blur-[2px]"
                              />
                              <svg
                                viewBox={`${vx} ${vy} 160 136`}
                                className={`relative z-10 overflow-hidden ${
                                  sheep.isGrey ? 'w-20 h-[68px] sm:w-24 sm:h-20' : 'w-14 h-12 sm:w-16 sm:h-[54px]'
                                }`}
                                style={{
                                  transform: sheep.flip ? 'scaleX(-1)' : undefined,
                                  animation: isPicked ? undefined : `sheepHop 1.9s ease-in-out ${sheep.delay}s infinite`,
                                }}
                              >
                                <image href={sheepSheetUrl} width="964" height="720" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Revealed Offering Plaque */}
                  <div
                    style={flockFrameStyle}
                    className="relative w-full max-w-3xl min-h-[124px] p-4 sm:p-5 rounded-[2px] bg-[#180304] flex flex-col items-center justify-center overflow-hidden"
                  >

              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-multiply"
                style={{
                  backgroundImage: `url("${flockBase}assets/text/cloth.jpg")`,
                  backgroundSize: '170px 170px',
                  backgroundRepeat: 'repeat',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-30"
                style={{
                  boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.92), inset 0 0 0 1px #140705, 0 0 0 1px rgba(184,138,68,0.24)',
                }}
              />
              <div className="pointer-events-none absolute inset-[6px] z-30 border border-dashed border-[#b98d46]/28" />
              <div className="pointer-events-none absolute top-[5px] left-[5px] w-3.5 h-3.5 z-30 border-t border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute top-[5px] right-[5px] w-3.5 h-3.5 z-30 border-t border-r border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] left-[5px] w-3.5 h-3.5 z-30 border-b border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] right-[5px] w-3.5 h-3.5 z-30 border-b border-r border-[#b8904a]/55" />
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
            case 'Vermin':
              // Gnawed, tattered-corner cellar scrap
              outerPath = 'M 20 10 L 154 8 L 166 28 L 158 58 L 168 92 L 154 148 L 122 174 L 90 162 L 54 176 L 18 144 L 12 88 L 22 52 Z';
              stitchPath = 'M 27 17 L 148 15 L 158 32 L 151 59 L 160 91 L 147 143 L 120 165 L 90 154 L 56 167 L 25 139 L 20 88 L 29 54 Z';
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
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-3 sm:px-6 lg:px-8 pt-12 pb-2 sm:py-3 lg:py-4 overflow-y-auto md:overflow-hidden animate-fade-up font-mono select-none"
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

                {/* Hanging Assembly (Ornate Carved Timber & Corded Brass Rod + 3 Strictly Aligned Columns) */}
                <div className="relative z-20 w-full max-w-3xl flex flex-col items-center">
                  {/* Ornate Carved Timber & Corded Brass Banner Rod (synced with Map & Battle Screen poles) */}
                  <div className="pointer-events-none absolute top-[2px] left-1 right-1 h-5 flex items-center z-10">
                    <div
                      className="relative w-full h-[10px] rounded-full"
                      style={{
                        backgroundColor: '#2e1d12',
                        backgroundImage: `linear-gradient(180deg, rgba(255,214,160,0.28) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.65) 100%), url("${import.meta.env.BASE_URL || './'}assets/text/wood.jpg")`,
                        backgroundSize: 'cover, 120px 120px',
                        boxShadow: '0 5px 10px rgba(0,0,0,0.9), inset 0 -1px 2px rgba(0,0,0,0.7)',
                      }}
                    />
                    {[5, 33.33, 66.67, 95].map((p) => (
                      <span
                        key={p}
                        className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[8px] h-[16px] rounded-[2px]"
                        style={{
                          left: `${p}%`,
                          backgroundImage:
                            'repeating-linear-gradient(115deg, #b08a52 0px, #b08a52 1.2px, #3a2511 1.2px, #3a2511 2.6px)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 0 2px rgba(0,0,0,0.6)',
                        }}
                      />
                    ))}
                    {(['left', 'right'] as const).map((side) => (
                      <span key={side}>
                        <span
                          className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full"
                          style={{
                            [side]: '-3px',
                            background: 'radial-gradient(circle at 38% 34%, #8a6a3c 0%, #4a3016 55%, #1d1209 100%)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.9)',
                          }}
                        />
                        <span
                          className="pointer-events-none absolute top-[62%] w-[2px] h-3.5"
                          style={{ [side]: '3px', background: 'linear-gradient(to bottom, #8a6a3c, transparent)' }}
                        />
                      </span>
                    ))}
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
                            <div className="relative z-10 w-8 sm:w-9 h-px bg-gradient-to-r from-transparent via-[#9c7847]/75 to-transparent my-1 sm:my-1.5" />
                            <div className="relative z-10 font-mono text-[6.5px] sm:text-[8.5px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.22em] text-[#c7a77a]/85 group-hover:text-[#f4d78b] transition-colors whitespace-nowrap">
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
            className="absolute inset-0 bg-[#0b0908] z-50 flex flex-col items-center justify-between px-2.5 sm:px-4 lg:px-8 pt-2 pb-2 lg:py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('bonelordevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,12,11,0.34)_0%,rgba(4,3,3,0.92)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_bone_lord')}
            <div className="relative z-10 max-w-6xl w-full h-full min-h-0 flex flex-col items-center justify-between gap-1 sm:gap-2 lg:gap-3">
              {/* Top Header (compact on short mobile landscape viewports) */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="hidden lg:flex items-center gap-3">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#8a8275]/70 to-[#d9d0c1]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c7beb0]">
                    The Bone Lord
                  </span>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent via-[#8a8275]/70 to-[#d9d0c1]/85" />
                </div>
                <h1 className="text-sm sm:text-lg lg:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.14em] lg:tracking-[0.2em] text-[#ece5d8] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Ancient Altar of Bones
                </h1>
              </div>

              {/* Side-by-Side Two-Column Split on Mobile Landscape & Desktop (sm:grid), Vertical on Narrow Portrait */}
              <div className="w-full flex-1 min-h-0 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 lg:gap-5 items-stretch">
                {/* LEFT COLUMN: Ossuary Pedestal & Horned Skull Prop + Inscription + Always-Accessible Offer Button */}
                <div className="flex-1 sm:col-span-7 flex flex-col items-center justify-between gap-1.5 lg:gap-3 min-h-0">
                  <div className="relative w-full flex-1 min-h-0 overflow-hidden px-2 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-5 flex flex-col items-center justify-between">
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
                            ? 'radial-gradient(ellipse farthest-side at 50% 48%, rgba(234,179,8,0.28) 0%, rgba(214,202,184,0.16) 46%, transparent 74%)'
                            : 'radial-gradient(ellipse farthest-side at 50% 52%, rgba(214,202,184,0.18) 0%, rgba(120,105,90,0.1) 48%, transparent 74%)',
                      }}
                    />

                    <span className="pointer-events-none absolute top-1.5 left-1.5 lg:top-2 lg:left-2 w-2.5 h-2.5 lg:w-3 lg:h-3 border-t border-l border-[#a89f90]/70" />
                    <span className="pointer-events-none absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2.5 h-2.5 lg:w-3 lg:h-3 border-t border-r border-[#a89f90]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 left-1.5 lg:bottom-2 lg:left-2 w-2.5 h-2.5 lg:w-3 lg:h-3 border-b border-l border-[#a89f90]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 right-1.5 lg:bottom-2 lg:right-2 w-2.5 h-2.5 lg:w-3 lg:h-3 border-b border-r border-[#a89f90]/70" />

                    {/* Centerpiece: Offering Card Seated on the Horned Bone Lord Altar Summit (831x1089), height-clamped! */}
                    <div className="relative z-10 flex flex-col items-center justify-end w-full my-auto pt-[clamp(56px,18vh,136px)]">
                      <div className="relative w-[clamp(96px,29vh,272px)] aspect-[831/1089] select-none">
                        {/* Rising Bone Tokens Emerging from the Summit Circle */}
                        {boneLordAnimPhase !== 'idle' && (
                          <div className="pointer-events-none absolute left-1/2 bottom-[90%] -translate-x-1/2 z-40 flex items-center justify-center">
                            {(previewBonus === 3 ? [-42, 0, 42] : [0]).map((xOff, i) => (
                              <div
                                key={i}
                                className="absolute bottom-0 text-xl lg:text-2xl drop-shadow-[0_0_12px_rgba(254,243,199,0.9)]"
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
                        <div
                          data-event-drop-slot="bone-lord"
                          data-event-drop-enabled={!isEventBusy && !isAnimating ? 'true' : 'false'}
                          className={`absolute left-1/2 -translate-x-1/2 bottom-[91%] z-20 w-[58px] h-[78px] lg:w-[116px] lg:h-[154px] flex items-end justify-center rounded-[4px] ${getDropSlotClass('bone-lord', !isEventBusy && !isAnimating)}`}
                        >
                          {boneLordAnimPhase === 'blessed' ? (
                            <div className="flex flex-col items-center justify-center px-3 lg:px-5 py-2 lg:py-4 mb-1 lg:mb-2 rounded-[4px] bg-[#1a1612]/95 border-2 border-[#e5d5b7]/90 shadow-[0_0_38px_rgba(234,179,8,0.5)] animate-menu-fade-in">
                              <span className="text-lg lg:text-3xl mb-0.5 lg:mb-1">🦴</span>
                              <span className="font-['Cinzel',_serif] font-black text-base lg:text-xl text-amber-200 tracking-wider">
                                +{previewBonus}
                              </span>
                              <span className="text-[7.5px] lg:text-[8.5px] font-mono uppercase tracking-[0.2em] lg:tracking-[0.22em] text-[#d6cbb8] mt-0.5 whitespace-nowrap">
                                Starting Bone{previewBonus > 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : (
                            <div
                              className="w-full h-full flex items-end justify-center"
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
                                  className="group relative scale-[0.48] lg:scale-[1.0] origin-bottom cursor-pointer transition-transform duration-200 hover:-translate-y-1 shadow-[0_14px_28px_rgba(0,0,0,0.95),0_0_24px_rgba(220,38,38,0.28)]"
                                >
                                  {renderCard(selectedCard, { isClickable: false, disableHoverScale: true, isMarkedSacrifice: true })}
                                </div>
                              ) : (
                                <div className="w-[54px] h-[74px] lg:w-[106px] lg:h-[146px] rounded-[4px] border border-dashed border-[#8a6d5e]/80 bg-[#120d0c]/80 shadow-[0_0_20px_rgba(220,38,38,0.18)] flex flex-col items-center justify-center gap-0.5 lg:gap-1.5 text-[#b5a392]">
                                  <span className="text-xs lg:text-xl opacity-75">💀</span>
                                  <span className="text-[6.5px] lg:text-[9.5px] uppercase tracking-[0.12em] lg:tracking-[0.2em] px-1 lg:px-2 text-center leading-tight">Drop Tribute</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Illustrated Horned Bone Lord Ossuary Altar Prop */}
                        <img
                          src={`${import.meta.env.BASE_URL || './'}assets/props/bonelordaltar.png`}
                          alt="Ancient Altar of the Bone Lord"
                          draggable={false}
                          className={`pointer-events-none relative z-10 w-full h-full object-contain transition-all duration-500 ${
                            boneLordAnimPhase === 'blessed'
                              ? 'drop-shadow-[0_0_28px_rgba(234,179,8,0.5)] brightness-110'
                              : boneLordAnimPhase === 'offering'
                                ? 'drop-shadow-[0_0_28px_rgba(220,38,38,0.6)] brightness-110'
                                : 'drop-shadow-[0_18px_28px_rgba(0,0,0,0.98)]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Stylized Ossuary Inscription */}
                    <div className="relative z-20 w-full max-w-xl flex flex-col items-center text-center pt-0.5 lg:pt-1 shrink-0">
                      <div className="hidden lg:flex items-center gap-3 w-full max-w-xs mb-2 opacity-75">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8a7f70] to-[#c9bea9]" />
                        <span className="text-[10px] text-[#c9bea9]">✦</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8a7f70] to-[#c9bea9]" />
                      </div>
                      <p className="font-['Cinzel',_serif] text-[10.5px] lg:text-lg tracking-[0.06em] lg:tracking-[0.1em] text-[#efe5d4] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] px-2">
                        A flooding darkness envelops the chamber.
                      </p>
                    </div>
                  </div>

                  {/* Action Button — pinned shrink-0 above bottom edge so NEVER clipped on mobile */}
                  <div className="relative z-30 flex items-center justify-center shrink-0 pb-0.5">
                    <button
                      data-bonelord-action="offer"
                      onClick={confirmBoneLordOffering}
                      disabled={boneLordSelectedIdx === null || isEventBusy || isAnimating}
                      className="px-5 lg:px-8 py-1.5 lg:py-2.5 rounded-[2px] bg-gradient-to-b from-[#2e2620] to-[#171310] hover:from-[#3d322a] hover:to-[#211b17] active:translate-y-[1px] border border-[#b5a994]/85 hover:border-[#efe5d5] text-[#f2eadc] hover:text-white font-['Cinzel',_serif] font-bold text-[10px] lg:text-xs uppercase tracking-[0.16em] lg:tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.88)] transition-all select-none"
                    >
                      {isAnimating ? 'The Bone Lord Consumes...' : 'Offer Sacrifice'}
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Side Deck Selector Panel (Side Panel on Mobile Landscape & Desktop, Bottom Strip on Portrait) */}
                <div
                  className={`shrink-0 h-[116px] sm:h-auto sm:col-span-5 relative flex flex-col sm:min-h-0 rounded-[3px] bg-[#0c0a09]/84 border border-[#3f3830]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(235,225,210,0.06)] backdrop-blur-[2px] transition-opacity duration-500 ${
                    isAnimating ? 'opacity-30 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9c9282]/70" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9c9282]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9c9282]/70" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9c9282]/70" />

                  <div className="px-2.5 lg:px-4 py-1.5 lg:py-3 border-b border-[#38312a]/80 flex items-center justify-start lg:justify-between gap-2.5 shrink-0">
                    <div className="text-[9px] lg:text-[10px] font-mono font-bold uppercase tracking-[0.18em] lg:tracking-[0.22em] text-[#d6cbb8]">
                      Your Creatures ({boneLordSelectedIdx !== null ? Math.max(0, masterDeck.length - 1) : masterDeck.length})
                    </div>
                    <span className="text-[8px] lg:text-[8.5px] font-mono uppercase tracking-[0.14em] lg:tracking-[0.16em] text-[#9c9282]">
                      Tap or hold 1s
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden sm:overflow-y-auto sm:overflow-x-hidden px-2.5 py-1.5 lg:px-3 lg:py-4">
                    <div className="flex flex-nowrap sm:flex-wrap gap-x-2 lg:gap-x-2.5 gap-y-2.5 lg:gap-y-4 justify-start sm:justify-center items-center sm:content-start h-full sm:h-auto">
                      {masterDeck.map((c, idx) => {
                        if (boneLordSelectedIdx === idx) return null;
                        const cardKey = c.id || `bl-${c.name}-${idx}`;
                        const isBeingDragged = eventDrag?.cardKey === cardKey;
                        return (
                          <div
                            key={cardKey}
                            onPointerDown={(e) =>
                              startEventCardDrag(e, {
                                disabled: isEventBusy || isAnimating,
                                card: c,
                                cardKey,
                                allowedSlots: ['bone-lord'],
                                onDrop: () => {
                                  if (isEventBusy || isAnimating) return;
                                  triggerSfx('place');
                                  setBoneLordSelectedIdx(idx);
                                },
                              })
                            }
                            onClick={() => {
                              if (suppressNextClickRef.current) return;
                              if (isEventBusy || isAnimating) return;
                              triggerSfx('draw');
                              setBoneLordSelectedIdx(idx);
                            }}
                            className={`relative shrink-0 flex flex-col items-center justify-center w-[70px] h-[96px] lg:w-[104px] lg:h-[146px] touch-pan-x sm:touch-auto transition-all duration-200 ${
                              isBeingDragged
                                ? 'opacity-25 scale-95'
                                : 'cursor-grab active:cursor-grabbing hover:-translate-y-1'
                            }`}
                          >
                            <div className="transform origin-center transition-transform duration-200 scale-[0.60] lg:scale-[0.86] lg:hover:scale-[0.91]">
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
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-3 sm:px-6 lg:px-8 pt-12 pb-2 sm:py-4 overflow-hidden animate-fade-up font-mono select-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.32)_0%,rgba(5,3,2,0.9)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_mycologist')}
            <div className="relative z-10 max-w-6xl w-full h-full min-h-0 flex flex-col items-center justify-between gap-2 sm:gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.26em] sm:tracking-[0.3em] text-[#c79d5a]">
                    {mycoHasDuplicates ? "The Weaver's Loom" : 'The Weaver Scoffs'}
                  </span>
                  <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-lg sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  {mycoHasDuplicates ? 'Sanguine Stitching' : 'Sleight of Hand'}
                </h1>
              </div>

              {!mycoHasDuplicates ? (
                /* Loom-Matched Twin Gift Stage when player has no duplicates */
                <div className="w-full max-w-4xl flex-1 min-h-0 flex flex-col items-center justify-between gap-3">
                  <div className="relative w-full flex-1 min-h-0 px-3 sm:px-6 py-3 sm:py-5 flex flex-col items-center justify-center">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-75"
                      style={{
                        background:
                          'radial-gradient(ellipse farthest-side at 50% 54%, rgba(168,85,247,0.28) 0%, rgba(153,27,27,0.16) 48%, transparent 74%)',
                      }}
                    />

                    <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-purple-400/60" />
                    <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-purple-400/60" />
                    <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-purple-400/60" />
                    <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-purple-400/60" />

                    {/* Aspect-Locked Weaver's Loom Stage (1133x823) */}
                    <div className="relative z-10 w-full max-w-[340px] sm:max-w-[530px] aspect-[1133/823] flex items-center justify-center select-none">
                      <img
                        src={`${import.meta.env.BASE_URL || './'}assets/props/loom.png`}
                        alt="The Weaver's Loom"
                        draggable={false}
                        className="pointer-events-none absolute inset-0 w-full h-full object-contain drop-shadow-[0_20px_34px_rgba(0,0,0,0.96)]"
                      />

                      <div className="relative z-10 -mt-[4%] flex flex-col items-center text-center">
                        <span className="mb-1.5 sm:mb-2.5 px-2.5 sm:px-3 py-0.5 rounded-[2px] bg-[#1e1224]/92 border border-purple-400/75 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-purple-200 shadow-md">
                          Spun From Sinew
                        </span>

                        {mycoOfferedCard && (
                          <div className="scale-[0.76] sm:scale-[1.06] origin-center rounded-[4px] shadow-[0_0_44px_rgba(168,85,247,0.55),0_18px_36px_rgba(0,0,0,0.95)] my-1">
                            {renderCard(mycoOfferedCard, { isClickable: false, disableHoverScale: true })}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="relative z-10 mt-2 font-['Cinzel',_serif] italic text-xs sm:text-base tracking-[0.1em] text-[#e8d9f0] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                      &ldquo;No twins? Take one from the loom.&rdquo;
                    </p>
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
                /* Two-Column Split on Desktop, Top Stage + Bottom Horizontal Tray on Mobile */
                <div className="w-full flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-5 items-stretch">
                  {/* LEFT COLUMN: Weaver's Loom Prop + Sew Button */}
                  <div className="flex-1 lg:col-span-7 flex flex-col items-center justify-between gap-2 lg:gap-3 min-h-0">
                    <div className="relative w-full flex-1 min-h-0 px-2 sm:px-5 py-1.5 sm:py-3 flex flex-col items-center justify-center">
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
                              ? 'radial-gradient(ellipse farthest-side at 50% 58%, rgba(168,85,247,0.38) 0%, rgba(126,34,206,0.16) 48%, transparent 74%)'
                              : 'radial-gradient(ellipse farthest-side at 50% 52%, rgba(147,51,234,0.24) 0%, rgba(153,27,27,0.14) 50%, transparent 74%)',
                        }}
                      />

                      <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-purple-400/60" />
                      <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-purple-400/60" />
                      <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-purple-400/60" />
                      <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-purple-400/60" />

                      {/* Aspect-Locked Illustrated Loom Prop Stage (1133x823) */}
                      <div
                        className="relative z-10 w-full max-w-[555px] aspect-[1133/823] flex items-center justify-center select-none"
                        style={{
                          animation: mycoAnimPhase === 'sewing' ? 'loomFrameTension 2.05s linear forwards' : undefined,
                        }}
                      >
                        <img
                          src={`${import.meta.env.BASE_URL || './'}assets/props/loom.png`}
                          alt="The Weaver's Loom"
                          draggable={false}
                          className={`pointer-events-none absolute inset-0 w-full h-full object-contain transition-all duration-500 ${
                            mycoAnimPhase === 'sewing'
                              ? 'drop-shadow-[0_0_34px_rgba(244,63,94,0.62)] brightness-115'
                              : mycoAnimPhase === 'woven'
                                ? 'drop-shadow-[0_0_28px_rgba(168,85,247,0.55)] brightness-105'
                                : 'drop-shadow-[0_20px_34px_rgba(0,0,0,0.96)]'
                          }`}
                        />

                        {/* Beat 1 & 4: Six Taut Crimson Sinew Guide-Threads Lashing Behind the Cards from Loom Beams to Center */}
                        {mycoAnimPhase === 'sewing' && (
                          <svg
                            viewBox="0 0 555 403"
                            className="pointer-events-none absolute inset-0 z-[5] w-full h-full overflow-visible"
                          >
                            <defs>
                              <filter id="loomThreadGlow" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="2.6" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>
                            {[
                              { d: 'M 106 72 Q 192 106 277 136', delay: '0s' },
                              { d: 'M 98 198 Q 186 196 277 196', delay: '0.05s' },
                              { d: 'M 106 318 Q 192 284 277 256', delay: '0.1s' },
                              { d: 'M 449 72 Q 363 106 278 136', delay: '0.02s' },
                              { d: 'M 457 198 Q 369 196 278 196', delay: '0.07s' },
                              { d: 'M 449 318 Q 363 284 278 256', delay: '0.12s' },
                            ].map((t, idx) => (
                              <g key={idx} filter="url(#loomThreadGlow)">
                                <path
                                  d={t.d}
                                  fill="none"
                                  stroke="#be123c"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                  strokeDasharray="340"
                                  style={{
                                    animation: `loomGuideThreadLash 2.05s cubic-bezier(0.22,1,0.36,1) ${t.delay} forwards`,
                                  }}
                                />
                                <path
                                  d={t.d}
                                  fill="none"
                                  stroke="#fb7185"
                                  strokeWidth="0.9"
                                  strokeLinecap="round"
                                  strokeDasharray="340"
                                  opacity="0.72"
                                  style={{
                                    animation: `loomGuideThreadLash 2.05s cubic-bezier(0.22,1,0.36,1) ${t.delay} forwards`,
                                  }}
                                />
                              </g>
                            ))}
                          </svg>
                        )}

                        {/* Cards Centered Directly Inside the Loom's Warp Window & Crossed Crimson Threads */}
                        <div className="relative z-10 -mt-[4%] flex items-center justify-center w-full h-full">
                          {mycoAnimPhase === 'woven' && fusedPreview ? (
                            <div className="flex flex-col items-center">
                              <span className="mb-2 px-3 py-0.5 rounded-[2px] bg-[#22112b]/95 border border-purple-400/90 text-[9px] font-mono font-bold uppercase tracking-[0.22em] text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.55)] animate-menu-fade-in">
                                Stitched Vessel
                              </span>
                              <div
                                className="relative origin-center rounded-[4px] shadow-[0_0_48px_rgba(168,85,247,0.82),0_0_26px_rgba(225,29,72,0.58)]"
                                style={{ animation: 'loomVesselBorn 0.65s cubic-bezier(0.22,1,0.36,1) forwards' }}
                              >
                                {renderCard(fusedPreview, { isClickable: false, disableHoverScale: true })}
                                {/* Freshly Bound Crimson Suture Scar Overlay Down the Artwork Center of the Born Abomination */}
                                <svg
                                  viewBox="0 0 108 152"
                                  className="pointer-events-none absolute inset-0 z-30 w-full h-full overflow-visible"
                                  style={{ animation: 'loomVesselScarGlow 1.35s ease-out forwards' }}
                                >
                                  <line
                                    x1="54"
                                    y1="28"
                                    x2="54"
                                    y2="138"
                                    stroke="#9f1239"
                                    strokeWidth="2.1"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                  />
                                  <line
                                    x1="54"
                                    y1="28"
                                    x2="54"
                                    y2="138"
                                    stroke="#fb7185"
                                    strokeWidth="0.85"
                                    strokeDasharray="3 3"
                                    opacity="0.78"
                                  />
                                  {[38, 62, 86, 110, 130].map((sy, idx) => (
                                    <g key={idx}>
                                      <path
                                        d={`M 45 ${sy - 4.5} L 63 ${sy + 4.5} M 63 ${sy - 4.5} L 45 ${sy + 4.5}`}
                                        stroke="#29050c"
                                        strokeWidth="3.2"
                                        strokeLinecap="round"
                                        opacity="0.72"
                                      />
                                      <path
                                        d={`M 45 ${sy - 4.5} L 63 ${sy + 4.5} M 63 ${sy - 4.5} L 45 ${sy + 4.5}`}
                                        stroke="#f43f5e"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                    </g>
                                  ))}
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center gap-4 sm:gap-[44px]">
                              {/* Twin I — pulls to center and cleanly bisects into the Left Half */}
                              <div className="flex flex-col items-center">
                                <span
                                  className={`mb-1 sm:mb-1.5 px-2 sm:px-2.5 py-0.5 rounded-[2px] bg-[#1e1224]/92 border border-purple-400/75 text-[8px] sm:text-[8.5px] font-mono font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-purple-200 shadow-md transition-opacity duration-200 ${
                                    mycoAnimPhase === 'sewing' ? 'opacity-0' : 'opacity-100'
                                  }`}
                                >
                                  Twin I
                                </span>
                                <div
                                  data-event-drop-slot="myco-1"
                                  data-event-drop-enabled={!isAnimating ? 'true' : 'false'}
                                  className={`w-[76px] h-[108px] sm:w-[108px] sm:h-[150px] flex items-center justify-center rounded-[4px] ${getDropSlotClass('myco-1', !isAnimating)}`}
                                  style={{
                                    animation: mycoAnimPhase === 'sewing' ? 'loomTwinBisectLeft 2.05s linear forwards' : undefined,
                                  }}
                                >
                                  {twin1 ? (
                                    <div
                                      onClick={() => {
                                        if (isAnimating) return;
                                        triggerSfx('draw');
                                        setMycoSelectedIndices((prev: number[]) => prev.slice(1));
                                      }}
                                      title={!isAnimating ? 'Click to return Twin I to deck' : undefined}
                                      className={`scale-[0.68] sm:scale-[0.96] origin-center shadow-[0_16px_32px_rgba(0,0,0,0.92)] ${!isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                                    >
                                      {renderCard(twin1, { isClickable: false, disableHoverScale: true })}
                                    </div>
                                  ) : (
                                    <div className="w-[72px] h-[104px] sm:w-[102px] sm:h-[144px] rounded-[4px] border border-dashed border-purple-400/65 bg-[#120b14]/82 flex flex-col items-center justify-center gap-1 text-purple-200/75 shadow-md">
                                      <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.22em]">Twin I</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Twin II — pulls to center and cleanly bisects into the Right Half */}
                              <div className="flex flex-col items-center">
                                <span
                                  className={`mb-1 sm:mb-1.5 px-2 sm:px-2.5 py-0.5 rounded-[2px] bg-[#1e1224]/92 border border-purple-400/75 text-[8px] sm:text-[8.5px] font-mono font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-purple-200 shadow-md transition-opacity duration-200 ${
                                    mycoAnimPhase === 'sewing' ? 'opacity-0' : 'opacity-100'
                                  }`}
                                >
                                  Twin II
                                </span>
                                <div
                                  data-event-drop-slot="myco-2"
                                  data-event-drop-enabled={!isAnimating ? 'true' : 'false'}
                                  className={`w-[76px] h-[108px] sm:w-[108px] sm:h-[150px] flex items-center justify-center rounded-[4px] ${getDropSlotClass('myco-2', !isAnimating)}`}
                                  style={{
                                    animation: mycoAnimPhase === 'sewing' ? 'loomTwinBisectRight 2.05s linear forwards' : undefined,
                                  }}
                                >
                                  {twin2 ? (
                                    <div
                                      onClick={() => {
                                        if (isAnimating) return;
                                        triggerSfx('draw');
                                        setMycoSelectedIndices((prev: number[]) => prev.slice(0, 1));
                                      }}
                                      title={!isAnimating ? 'Click to return Twin II to deck' : undefined}
                                      className={`scale-[0.68] sm:scale-[0.96] origin-center shadow-[0_16px_32px_rgba(0,0,0,0.92)] ${!isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                                    >
                                      {renderCard(twin2, { isClickable: false, disableHoverScale: true })}
                                    </div>
                                  ) : (
                                    <div className="w-[72px] h-[104px] sm:w-[102px] sm:h-[144px] rounded-[4px] border border-dashed border-purple-400/65 bg-[#120b14]/82 flex flex-col items-center justify-center gap-1 text-purple-200/75 shadow-md">
                                      <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.22em]">Twin II</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Foreground Active Suture Seam, 5 Staggered Arterial X-Stitches, Sparks, Carved Bone Needle & Cinch Shockwave */}
                              {mycoAnimPhase === 'sewing' && (
                                <div className="pointer-events-none absolute inset-0 pt-[22px] z-40 flex items-center justify-center">
                                  {/* Final Knot Cinch Shockwave Ring (fires at 84%..100%) */}
                                  <div
                                    className="absolute w-36 h-36 rounded-full border-2 border-rose-400/90 shadow-[0_0_32px_rgba(244,63,94,0.9),inset_0_0_24px_rgba(168,85,247,0.75)]"
                                    style={{ animation: 'loomBindShockwave 2.05s ease-out forwards' }}
                                  />

                                  <svg
                                    viewBox="0 0 180 160"
                                    className="relative w-[180px] h-[160px] overflow-visible drop-shadow-[0_6px_14px_rgba(0,0,0,0.96)]"
                                  >
                                    <defs>
                                      <linearGradient id="boneNeedleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#faf3e3" />
                                        <stop offset="52%" stopColor="#d8c7a8" />
                                        <stop offset="100%" stopColor="#7a6851" />
                                      </linearGradient>
                                      <linearGradient id="shearBladeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                        <stop offset="25%" stopColor="#fda4af" />
                                        <stop offset="50%" stopColor="#ffffff" />
                                        <stop offset="75%" stopColor="#f43f5e" />
                                        <stop offset="100%" stopColor="rgba(225,29,72,0)" />
                                      </linearGradient>
                                    </defs>

                                    {/* Beat 2: Arterial Flesh-Seam Glow Between Joined Card Halves */}
                                    <g style={{ transformOrigin: '90px 80px', animation: 'loomSeamGlowPulse 2.05s linear forwards' }}>
                                      <line x1="90" y1="8" x2="90" y2="152" stroke="#881337" strokeWidth="6.5" strokeLinecap="round" opacity="0.85" />
                                      <line x1="90" y1="8" x2="90" y2="152" stroke="#f43f5e" strokeWidth="2.4" strokeLinecap="round" />
                                      <line x1="90" y1="12" x2="90" y2="148" stroke="#ffe4e6" strokeWidth="0.9" strokeDasharray="5 4" opacity="0.85" />
                                    </g>

                                    {/* Beat 2: Razor-Sharp Vertical Bisection Shear Flash (30%..48%) */}
                                    <rect
                                      x="87.5"
                                      y="-12"
                                      width="5"
                                      height="184"
                                      rx="2.5"
                                      fill="url(#shearBladeGrad)"
                                      style={{
                                        transformOrigin: '90px 80px',
                                        animation: 'loomShearSlash 2.05s linear forwards',
                                      }}
                                    />

                                    {/* Beat 3: 5 Rhythmic Cross-Sutures + Puncture Dimples + Blood Sparks Synced to Needle Passes */}
                                    {[
                                      { y: 26, delay: 0.90 },
                                      { y: 53, delay: 1.07 },
                                      { y: 80, delay: 1.24 },
                                      { y: 107, delay: 1.41 },
                                      { y: 134, delay: 1.58 },
                                    ].map((st, idx) => (
                                      <g key={idx}>
                                        {/* Puncture holes on Left & Right halves */}
                                        <circle
                                          cx="74"
                                          cy={st.y}
                                          r="2.4"
                                          fill="#1f0409"
                                          stroke="#9f1239"
                                          strokeWidth="0.9"
                                          style={{
                                            animation: `loomStitchCinch 0.22s ease-out ${st.delay}s both`,
                                          }}
                                        />
                                        <circle
                                          cx="106"
                                          cy={st.y}
                                          r="2.4"
                                          fill="#1f0409"
                                          stroke="#9f1239"
                                          strokeWidth="0.9"
                                          style={{
                                            animation: `loomStitchCinch 0.22s ease-out ${st.delay}s both`,
                                          }}
                                        />
                                        {/* Beveled arterial shadow + crimson sinew cross-stitch */}
                                        <path
                                          d={`M 74 ${st.y - 7} L 106 ${st.y + 7} M 106 ${st.y - 7} L 74 ${st.y + 7}`}
                                          fill="none"
                                          stroke="#2a050b"
                                          strokeWidth="5"
                                          strokeLinecap="round"
                                          strokeDasharray="68"
                                          style={{
                                            transformOrigin: `90px ${st.y}px`,
                                            animation: `loomStitchCinch 0.24s cubic-bezier(0.22,1,0.36,1) ${st.delay}s both`,
                                          }}
                                        />
                                        <path
                                          d={`M 74 ${st.y - 7} L 106 ${st.y + 7} M 106 ${st.y - 7} L 74 ${st.y + 7}`}
                                          fill="none"
                                          stroke="#f43f5e"
                                          strokeWidth="2.5"
                                          strokeLinecap="round"
                                          strokeDasharray="68"
                                          style={{
                                            transformOrigin: `90px ${st.y}px`,
                                            animation: `loomStitchCinch 0.24s cubic-bezier(0.22,1,0.36,1) ${st.delay}s both`,
                                          }}
                                        />
                                        <path
                                          d={`M 75 ${st.y - 6.5} L 105 ${st.y + 6.5}`}
                                          fill="none"
                                          stroke="#fecdd3"
                                          strokeWidth="0.9"
                                          strokeLinecap="round"
                                          strokeDasharray="68"
                                          opacity="0.8"
                                          style={{
                                            transformOrigin: `90px ${st.y}px`,
                                            animation: `loomStitchCinch 0.24s cubic-bezier(0.22,1,0.36,1) ${st.delay}s both`,
                                          }}
                                        />
                                        {/* Crimson blood-droplet sparks popping off each puncture */}
                                        {[
                                          { cx: 74, sx: '-18px', sy: '-11px' },
                                          { cx: 106, sx: '19px', sy: '-9px' },
                                          { cx: 90, sx: idx % 2 === 0 ? '-12px' : '12px', sy: '14px' },
                                        ].map((sp, spIdx) => (
                                          <circle
                                            key={spIdx}
                                            cx={sp.cx}
                                            cy={st.y}
                                            r="2.2"
                                            fill={spIdx === 2 ? '#c084fc' : '#fb7185'}
                                            style={{
                                              ['--sx' as string]: sp.sx,
                                              ['--sy' as string]: sp.sy,
                                              animation: `loomStitchSpark 0.36s ease-out ${st.delay + 0.03}s both`,
                                            }}
                                          />
                                        ))}
                                      </g>
                                    ))}

                                    {/* Beat 3: Ornate Hand-Carved Bone Needle & Trailing Arterial Sinew Thread */}
                                    <g style={{ transformOrigin: '90px 80px', animation: 'loomBoneNeedleWeave 2.05s linear forwards' }}>
                                      {/* Trailing glowing arterial sinew thread behind needle eye */}
                                      <path
                                        d="M 42 80 C 18 72, 6 94, -22 84 C -40 78, -54 88, -72 82"
                                        fill="none"
                                        stroke="#e11d48"
                                        strokeWidth="2.6"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M 42 80 C 18 72, 6 94, -22 84 C -40 78, -54 88, -72 82"
                                        fill="none"
                                        stroke="#fda4af"
                                        strokeWidth="0.9"
                                        strokeLinecap="round"
                                        opacity="0.8"
                                      />
                                      {/* Carved ivory-bone shaft */}
                                      <path
                                        d="M 32 80 L 42 75 L 128 76.5 L 152 80 L 128 83.5 L 42 85 Z"
                                        fill="url(#boneNeedleGrad)"
                                        stroke="#3f2e1f"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                      />
                                      {/* Blood-stained piercing point */}
                                      <path d="M 128 76.8 L 152 80 L 128 83.2 Z" fill="#be123c" opacity="0.88" />
                                      {/* Specular bone ridge */}
                                      <line x1="48" y1="78.2" x2="124" y2="78.8" stroke="#fffbeb" strokeWidth="1" opacity="0.7" />
                                      {/* Pierced needle eye */}
                                      <ellipse cx="46" cy="80" rx="5.5" ry="2.2" fill="#220914" stroke="#78350f" strokeWidth="0.9" />
                                      <line x1="41" y1="80" x2="50" y2="80" stroke="#fb7185" strokeWidth="1.4" strokeLinecap="round" />
                                    </g>
                                  </svg>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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

                  {/* RIGHT COLUMN: Side Deck Selector Panel (Horizontal Touch Tray on Mobile) */}
                  <div
                    className={`shrink-0 h-[150px] sm:h-[168px] lg:h-auto lg:col-span-5 relative flex flex-col lg:min-h-0 rounded-[3px] bg-[#0d0806]/84 border border-[#3e291b]/85 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,228,185,0.06)] backdrop-blur-[2px] transition-opacity duration-500 ${
                      isAnimating ? 'opacity-30 pointer-events-none' : 'opacity-100'
                    }`}
                  >
                    <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#9a7342]/70" />
                    <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#9a7342]/70" />

                    <div className="px-3 sm:px-4 py-1.5 sm:py-3 border-b border-[#3a2618]/80 flex items-center justify-between gap-2 shrink-0">
                      <div className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-[#c79d5a]">
                        Your Creatures ({masterDeck.length})
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] font-mono uppercase tracking-[0.16em] text-[#9c8469]">
                          Tap or hold 1s
                        </span>
                        {mycoSelectedIndices.length > 0 && !isAnimating && (
                          <button
                            type="button"
                            onClick={() => setMycoSelectedIndices([])}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[2px] bg-[#1a110c] hover:bg-[#281a12] border border-[#5a3d28] text-[9px] sm:text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#d4bfa0] cursor-pointer transition shrink-0"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden lg:overflow-y-auto lg:overflow-x-hidden px-3 py-1.5 lg:py-4">
                      <div className="flex flex-nowrap lg:flex-wrap gap-x-2 lg:gap-x-2.5 gap-y-4 justify-start lg:justify-center items-center lg:content-start h-full lg:h-auto">
                        {masterDeck.map((c, idx) => {
                          const selPos = mycoSelectedIndices.indexOf(idx);
                          const isSelected = selPos !== -1;
                          if (isSelected) return null;
                          const isDuplicateCard = masterDeck.filter(card => card.name === c.name).length >= 2;
                          const firstPickedName = mycoSelectedIndices.length > 0 ? masterDeck[mycoSelectedIndices[0]]?.name : null;
                          const wrongTwin = Boolean(firstPickedName && c.name !== firstPickedName);
                          const isDisabled = !isDuplicateCard || wrongTwin;
                          const cardKey = c.id || `myco-${c.name}-${idx}`;
                          const isBeingDragged = eventDrag?.cardKey === cardKey;

                          return (
                            <div
                              key={cardKey}
                              onPointerDown={(e) =>
                                startEventCardDrag(e, {
                                  disabled: isDisabled || isAnimating || mycoSelectedIndices.length >= 2,
                                  card: c,
                                  cardKey,
                                  allowedSlots: ['myco-1', 'myco-2'],
                                  onDrop: (slotId) => {
                                    if (isDisabled || isAnimating) return;
                                    triggerSfx('place');
                                    setMycoSelectedIndices((prev: number[]) => {
                                      if (prev.includes(idx)) return prev;
                                      if (slotId === 'myco-1' && prev.length === 0) return [idx];
                                      if (slotId === 'myco-1' && prev.length === 1) return [idx, prev[0]];
                                      if (prev.length < 2) return [...prev, idx];
                                      return prev;
                                    });
                                  },
                                })
                              }
                              onClick={() => {
                                if (suppressNextClickRef.current) return;
                                if (isDisabled || isAnimating) return;
                                triggerSfx('draw');
                                if (mycoSelectedIndices.includes(idx)) {
                                  setMycoSelectedIndices((prev: number[]) => prev.filter((i: number) => i !== idx));
                                } else if (mycoSelectedIndices.length < 2) {
                                  setMycoSelectedIndices((prev: number[]) => [...prev, idx]);
                                }
                              }}
                              className={`relative shrink-0 flex flex-col items-center justify-center w-[78px] h-[108px] lg:w-[104px] lg:h-[146px] touch-pan-x lg:touch-auto transition-all duration-200 ${
                                isBeingDragged
                                  ? 'opacity-25 scale-95'
                                  : isDisabled
                                    ? 'opacity-30 grayscale-[55%] cursor-not-allowed'
                                    : 'hover:-translate-y-1 cursor-grab active:cursor-grabbing'
                              }`}
                            >
                              <div className="transform origin-center transition-transform duration-200 scale-[0.66] lg:scale-[0.86] lg:hover:scale-[0.91]">
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
            className="absolute inset-0 bg-[#090d0b] z-50 flex flex-col items-center justify-between px-3 sm:px-6 lg:px-8 pt-12 pb-2 sm:py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('begottenboss.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,26,21,0.38)_0%,rgba(4,8,7,0.92)_100%)] pointer-events-none" />

            {renderActWeather('absolute inset-0 z-[5]', 'event_goobert')}
            <div className="relative z-10 max-w-6xl w-full h-full min-h-0 flex flex-col items-center justify-between gap-2 sm:gap-3">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-teal-600/70 to-teal-300/80" />
                  <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.26em] sm:tracking-[0.3em] text-teal-400/90">
                    The Begotten&apos;s Workshop
                  </span>
                  <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent via-teal-600/70 to-teal-300/80" />
                </div>
                <h1 className="text-lg sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-teal-200 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Printing Press
                </h1>
              </div>

              {/* Two-Column Split on Desktop, Top Stage + Bottom Horizontal Tray on Mobile */}
              <div className="w-full flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-5 items-stretch">
                {/* LEFT COLUMN: Heavy Rotary Printing Press Prop + Stamp Button */}
                <div className="flex-1 lg:col-span-7 flex flex-col items-center justify-between gap-2 lg:gap-3 min-h-0">
                  <div className="relative w-full flex-1 min-h-0 px-3 sm:px-6 py-2 sm:py-4 flex flex-col items-center justify-between">
                    <div
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                        goobertStampedCard ? 'opacity-95' : goobertStamping ? 'opacity-80' : 'opacity-40'
                      }`}
                      style={{
                        background:
                          'radial-gradient(ellipse farthest-side at 50% 60%, rgba(20,184,166,0.28) 0%, rgba(13,148,136,0.12) 48%, transparent 74%)',
                      }}
                    />

                    <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-teal-500/65" />
                    <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-teal-500/65" />
                    <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-teal-500/65" />
                    <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-teal-500/65" />

                    {/* Press Assembly Container: scaled uniformly on mobile so stamp.png travels flush into stampbase.png in exact lockstep */}
                    {(() => {
                      const propBase = import.meta.env.BASE_URL || './';
                      return (
                        <div className="relative z-20 flex flex-col items-center justify-end w-full flex-1 min-h-0 pt-10 sm:pt-28">
                          {/* Aspect-Locked Hinged Press Chest Stage (580x736) */}
                          <div className="relative w-[258px] sm:w-[292px] aspect-[580/736] scale-[0.72] sm:scale-100 origin-bottom select-none">
                            {/* Lower Hinged Press Base Back & Open Lid (behind cards) */}
                            <img
                              src={`${propBase}assets/props/stampbase.png`}
                              alt="The Begotten's Printing Press Base"
                              draggable={false}
                              className="pointer-events-none relative z-10 w-full h-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.96)]"
                            />

                            {/* Emerald Ink Splatter Burst on Impact inside Trough */}
                            {goobertStamping && (
                              <div className="pointer-events-none absolute left-1/2 bottom-[41%] -translate-x-1/2 z-30 flex items-center justify-center">
                                <div
                                  className="w-44 h-16 rounded-full bg-emerald-400/45 blur-md"
                                  style={{ animation: 'inkSplatterBurst 0.72s ease-out forwards' }}
                                />
                              </div>
                            )}

                            {/* Cards Nested Upright Inside the Press Bed Trough (y≈59.5% => bottom: 40.5%) */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[40.5%] z-20 flex items-end justify-center gap-3.5 sm:gap-5">
                              {/* Left Bed: Original Creature (exact 128px height, origin-bottom squish synced to stamp) */}
                              <div className="flex flex-col items-center">
                                <span
                                  className={`mb-1 px-2 py-0.5 rounded-[2px] bg-[#091c18]/92 border border-teal-500/75 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200 transition-opacity duration-150 ${
                                    goobertStamping ? 'opacity-0' : 'opacity-100'
                                  }`}
                                >
                                  Original
                                </span>
                                <div
                                  data-event-drop-slot="goobert"
                                  data-event-drop-enabled={!isEventBusy && !isAnimating ? 'true' : 'false'}
                                  className={`w-[94px] h-[128px] flex items-end justify-center origin-bottom rounded-[4px] ${getDropSlotClass('goobert', !isEventBusy && !isAnimating)}`}
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
                                      className={`scale-[0.83] origin-bottom shadow-[0_12px_24px_rgba(0,0,0,0.94)] ${!isEventBusy && !isAnimating ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
                                    >
                                      {renderCard(originalPreview, { isClickable: false, disableHoverScale: true })}
                                    </div>
                                  ) : (
                                    <div className="w-[90px] h-[126px] rounded-[4px] border border-dashed border-teal-500/70 bg-[#07120f]/84 flex flex-col items-center justify-center gap-1 text-teal-300/70">
                                      <span className="text-base">📜</span>
                                      <span className="text-[8.5px] uppercase tracking-[0.2em] text-center px-1">Drop Card</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right Bed: Blank Plate -> Stamped Clone (exact 128px height, origin-bottom squish synced to stamp) */}
                              <div className="flex flex-col items-center">
                                <span
                                  className={`mb-1 px-2 py-0.5 rounded-[2px] border text-[8px] font-mono font-bold uppercase tracking-[0.2em] transition-opacity duration-150 whitespace-nowrap ${
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
                                  className="w-[94px] h-[128px] flex items-end justify-center origin-bottom"
                                  style={{
                                    animation: goobertStamping ? 'pressCardSquish 1.85s linear forwards' : undefined,
                                  }}
                                >
                                  {goobertStampedCard ? (
                                    <div className="scale-[0.83] origin-bottom rounded-[4px] shadow-[0_0_34px_rgba(16,185,129,0.68),0_12px_24px_rgba(0,0,0,0.94)]">
                                      {renderCard(goobertStampedCard, { isClickable: false, disableHoverScale: true })}
                                    </div>
                                  ) : (
                                    <div className="w-[90px] h-[126px] rounded-[4px] border border-dashed border-emerald-600/65 bg-[#081511]/84 flex flex-col items-center justify-center gap-1 text-emerald-300/65">
                                      <span className="text-base opacity-75">🧪</span>
                                      <span className="text-[8.5px] uppercase tracking-[0.2em]">Blank Plate</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Foreground Riveted Front Lip of stampbase.png so Card Bases Nest Cleanly Inside the Trough */}
                            <img
                              src={`${propBase}assets/props/stampbase.png`}
                              alt=""
                              aria-hidden="true"
                              draggable={false}
                              className="pointer-events-none absolute inset-0 z-[25] w-full h-full object-contain"
                              style={{ clipPath: 'inset(60.5% 0 0 0)' }}
                            />

                            {/* Moving Upper Gothic Stamp Prop (530x714): bottom plate at 96.8% lands flush on trough bed */}
                            <div
                              className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(40.5%-11px)] w-[92%] z-40 flex items-end justify-center"
                              style={{
                                transform: goobertStamping ? undefined : 'translateY(-162px)',
                                animation: goobertStamping ? 'pressPlatenSlam 1.85s linear forwards' : undefined,
                              }}
                            >
                              <img
                                src={`${propBase}assets/props/stamp.png`}
                                alt="Gothic Press Stamp"
                                draggable={false}
                                className="w-full h-auto object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.98)]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <p className="relative z-20 mt-1 sm:mt-2 font-['Cinzel',_serif] text-xs sm:text-base tracking-[0.08em] sm:tracking-[0.1em] text-teal-100/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                      The Begotten jeers at his press.
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-center shrink-0">
                    <button
                      onClick={confirmGoobertClone}
                      disabled={goobertSelectedIdx === null || isEventBusy || isAnimating}
                      className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-[2px] bg-gradient-to-b from-[#13332b] to-[#0a1c17] hover:from-[#1b463b] hover:to-[#0f2922] active:translate-y-[1px] border border-teal-500/85 hover:border-teal-300 text-teal-100 hover:text-white font-['Cinzel',_serif] font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.88)] transition-all select-none"
                    >
                      {goobertStamping ? 'Pressing Plate...' : goobertStampedCard ? 'Imprint Complete' : 'Stamp Your Card'}
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Side Deck Selector Panel (Horizontal Touch Tray on Mobile) */}
                <div
                  className={`shrink-0 h-[150px] sm:h-[168px] lg:h-auto lg:col-span-5 relative flex flex-col lg:min-h-0 rounded-[3px] bg-[#080e0c]/84 border border-teal-900/80 shadow-[0_18px_44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(153,246,228,0.06)] backdrop-blur-[2px] transition-opacity duration-500 ${
                    isAnimating ? 'opacity-30 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <span className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-teal-500/65" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-teal-500/65" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-teal-500/65" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-teal-500/65" />

                  <div className="px-3 sm:px-4 py-1.5 sm:py-3 border-b border-teal-950/90 flex items-center justify-between gap-2 shrink-0">
                    <div className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-teal-400/90">
                      Your Creatures ({masterDeck.length})
                    </div>
                    <span className="text-[8.5px] font-mono uppercase tracking-[0.16em] text-teal-500/75">
                      Tap or hold 1s
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden lg:overflow-y-auto lg:overflow-x-hidden px-3 py-1.5 lg:py-4">
                    <div className="flex flex-nowrap lg:flex-wrap gap-x-2 lg:gap-x-2.5 gap-y-4 justify-start lg:justify-center items-center lg:content-start h-full lg:h-auto">
                      {masterDeck.map((c, idx) => {
                        const isSelected = goobertSelectedIdx === idx;
                        if (isSelected) return null;
                        const cardKey = c.id || `goo-${c.name}-${idx}`;
                        const isBeingDragged = eventDrag?.cardKey === cardKey;
                        return (
                          <div
                            key={cardKey}
                            onPointerDown={(e) =>
                              startEventCardDrag(e, {
                                disabled: isEventBusy || isAnimating,
                                card: c,
                                cardKey,
                                allowedSlots: ['goobert'],
                                onDrop: () => {
                                  if (isEventBusy || isAnimating) return;
                                  triggerSfx('place');
                                  setGoobertSelectedIdx(idx);
                                },
                              })
                            }
                            onClick={() => {
                              if (suppressNextClickRef.current) return;
                              if (isEventBusy || isAnimating) return;
                              triggerSfx('draw');
                              setGoobertSelectedIdx(idx);
                            }}
                            className={`relative shrink-0 flex flex-col items-center justify-center w-[78px] h-[108px] lg:w-[104px] lg:h-[146px] touch-pan-x lg:touch-auto transition-all duration-200 ${
                              isBeingDragged
                                ? 'opacity-25 scale-95'
                                : 'cursor-grab active:cursor-grabbing hover:-translate-y-1'
                            }`}
                          >
                            <div className="transform origin-center transition-transform duration-200 scale-[0.66] lg:scale-[0.86] lg:hover:scale-[0.91]">
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

        const trialBase = import.meta.env.BASE_URL || './';
        const trialKnob = 'radial-gradient(circle at 46% 42%, #8e8794 0 1.8px, #504b54 2.4px, #232026 4.4px, #0b090d 5.4px, transparent 6.5px)';
        const trialFrameStyle: React.CSSProperties = {
          position: 'relative',
          borderStyle: 'solid',
          borderColor: 'transparent',
          borderWidth: '16px 12px 12px 12px',
          boxShadow: '0 0 0 1px #141112, 0 0 0 2px #3b2a1d, 0 26px 64px rgba(0,0,0,0.96), inset 0 1px 0 rgba(190,180,196,0.14)',
          backgroundColor: '#24160e',
          backgroundImage: [
            trialKnob,
            trialKnob,
            trialKnob,
            trialKnob,
            'radial-gradient(ellipse at 50% 0%, rgba(28,25,33,0.72) 0%, rgba(12,10,15,0.88) 65%, rgba(6,5,8,0.95) 100%)',
            `url("${trialBase}assets/text/slate.jpg")`,
            'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
            `url("${trialBase}assets/text/wood.jpg")`,
          ].join(', '),
          backgroundSize: ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'cover', 'auto', '140px 140px'].join(', '),
          backgroundPosition: 'left top, right top, left bottom, right bottom, 0 0, 0 0, 0 0, center',
          backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
          backgroundOrigin: 'border-box, border-box, border-box, border-box, padding-box, padding-box, border-box, border-box',
          backgroundClip: 'border-box, border-box, border-box, border-box, padding-box, padding-box, border-box, border-box',
        };

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

              {/* MAIN CATHEDRAL TRIPTYCH STAGE (Carved Timber & Slate Reliquary) */}
              <div
                style={trialFrameStyle}
                className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-between px-5 sm:px-8 py-4 rounded-[2px] bg-[#0d0b0f] overflow-hidden"
              >

              
              <div
                className="pointer-events-none absolute inset-0 z-30"
                style={{
                  boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.94), inset 0 0 0 1px #0a090c, 0 0 0 1px rgba(138,129,145,0.2)',
                }}
              />
              <div className="pointer-events-none absolute inset-[6px] z-30 border border-dashed border-[#7c7384]/25" />
              <div className="pointer-events-none absolute top-[5px] left-[5px] w-3.5 h-3.5 z-30 border-t border-l border-[#8e8596]/45" />
              <div className="pointer-events-none absolute top-[5px] right-[5px] w-3.5 h-3.5 z-30 border-t border-r border-[#8e8596]/45" />
              <div className="pointer-events-none absolute bottom-[5px] left-[5px] w-3.5 h-3.5 z-30 border-b border-l border-[#8e8596]/45" />
              <div className="pointer-events-none absolute bottom-[5px] right-[5px] w-3.5 h-3.5 z-30 border-b border-r border-[#8e8596]/45" />

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
                          {getCardDisplayName(c.name)}{' '}
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
        const poppetBase = import.meta.env.BASE_URL || './';
        const inspectedRewardIdx =
          hoveredTotemRewardIdx !== null ? hoveredTotemRewardIdx : selectedTotemRewardIdx;
        const inspectedRewardChoice =
          inspectedRewardIdx !== null ? totemRewardChoices[inspectedRewardIdx] || null : null;

        // Real-time preview on the physical poppet: reflects hover OR selection in REWARD, and active picks in ASSEMBLE
        const previewHead: string | null =
          totemStage === 'ASSEMBLE'
            ? (assemblyHeadIdx !== null ? totemPieces[assemblyHeadIdx]?.value || null : activeTotem.head)
            : (inspectedRewardChoice?.type === 'head'
                ? inspectedRewardChoice.value
                : activeTotem.head);
        const previewBody: string | null =
          totemStage === 'ASSEMBLE'
            ? (assemblyBodyIdx !== null ? totemPieces[assemblyBodyIdx]?.value || null : activeTotem.body)
            : (inspectedRewardChoice?.type === 'body'
                ? inspectedRewardChoice.value
                : activeTotem.body);

        const isHoverPreviewHead =
          totemStage === 'REWARD' && inspectedRewardChoice?.type === 'head' && inspectedRewardChoice.value !== activeTotem.head;
        const isHoverPreviewBody =
          totemStage === 'REWARD' && inspectedRewardChoice?.type === 'body' && inspectedRewardChoice.value !== activeTotem.body;

        const selectedRewardChoice =
          selectedTotemRewardIdx !== null ? totemRewardChoices[selectedTotemRewardIdx] || null : null;
        const willUnlockAssembly = (() => {
          if (!selectedRewardChoice) return false;
          const nextHasHead = selectedRewardChoice.type === 'head' || totemPieces.some(p => p.type === 'head');
          const nextHasBody = selectedRewardChoice.type === 'body' || totemPieces.some(p => p.type === 'body');
          return nextHasHead && nextHasBody;
        })();

        const ownedHeadPieces = totemPieces
          .map((p, idx) => ({ ...p, idx }))
          .filter(p => p.type === 'head');
        const ownedBodyPieces = totemPieces
          .map((p, idx) => ({ ...p, idx }))
          .filter(p => p.type === 'body');

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
            case 'Vermin':
              outerPath = 'M 20 10 L 154 8 L 166 28 L 158 58 L 168 92 L 154 148 L 122 174 L 90 162 L 54 176 L 18 144 L 12 88 L 22 52 Z';
              stitchPath = 'M 27 17 L 148 15 L 158 32 L 151 59 L 160 91 L 147 143 L 120 165 L 90 154 L 56 167 L 25 139 L 20 88 L 29 54 Z';
              break;
            case 'Hooved':
            default:
              outerPath = 'M 22 10 H 158 Q 168 10 168 22 V 116 Q 168 172 90 176 Q 12 172 12 116 V 22 Q 12 10 22 10 Z';
              stitchPath = 'M 27 17 H 153 Q 161 17 161 26 V 114 Q 161 164 90 168 Q 19 164 19 114 V 26 Q 19 17 27 17 Z';
              break;
          }
          const patId = `effigyPatchTex-${tribe}-${highlighted ? 'hi' : 'lo'}`;
          return (
            <svg viewBox="0 0 180 184" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.9)]">
              <defs>
                <pattern id={patId} patternUnits="userSpaceOnUse" width="180" height="184">
                  <image
                    href={`${poppetBase}assets/text/patches.jpg`}
                    width="180"
                    height="184"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={fillTop} stopOpacity={highlighted ? '0.38' : '0.52'} />
                  <stop offset="100%" stopColor={fillBot} stopOpacity={highlighted ? '0.55' : '0.68'} />
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
            className="absolute inset-0 bg-[#0d0906] z-50 flex flex-col items-center justify-between px-3 sm:px-6 lg:px-8 pt-12 pb-3 sm:py-4 overflow-y-auto md:overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('weaverevent.jpg')}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,9,6,0.34)_0%,rgba(5,3,2,0.93)_100%)] pointer-events-none" />
            {renderActWeather('absolute inset-0 z-[5]', 'build-totem')}

            <div className="relative z-10 max-w-6xl w-full h-auto md:h-full flex flex-col items-center justify-between gap-2.5 sm:gap-3.5 pb-4 md:pb-0">
              {/* Top Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c79d5a]">
                    The Weaver&apos;s Workshop
                  </span>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#9c7847]/70 to-[#d4af37]/85" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Needle &amp; Threadcraft
                </h1>
              </div>

              {/* Two-Column Tailor Workbench: Live Poppet Cushion Left (5 cols), Reliquary Scrap Rack / Assembly Right (7 cols) */}
              <div className="w-full flex-1 lg:max-h-[580px] my-auto min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-5 items-stretch">
                {/* LEFT COLUMN: Candlelit Tailor's Cushion + Physical Stitched Poppet + Live Effect Plaque */}
                <div className="md:col-span-5 relative flex flex-col items-center justify-between px-4 py-4 min-h-0">
                  {/* Ambient Candlelight Aura */}
                  <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                    style={{
                      background:
                        previewHead && previewBody
                          ? 'radial-gradient(ellipse farthest-side at 50% 44%, rgba(212,175,55,0.24) 0%, rgba(153,27,27,0.12) 46%, transparent 74%)'
                          : 'radial-gradient(ellipse farthest-side at 50% 44%, rgba(160,115,65,0.16) 0%, transparent 72%)',
                    }}
                  />
                  <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#9a7342]/65" />
                  <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#9a7342]/65" />
                  <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#9a7342]/65" />
                  <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#9a7342]/65" />

                  {/* Physical Poppet Assembly Mounted Above Tailor's Velvet Cushion */}
                  <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center w-full">
                    <div
                      className="relative flex flex-col items-center justify-center"
                      style={{
                        animation: effigyStitchingAnim ? 'effigyStitchPulse 0.9s ease-in-out' : undefined,
                      }}
                    >
                      {/* Tailor's Stitched Velvet & Brass Cushion Disc Beneath Poppet */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 w-[210px] sm:w-[244px] h-[52px] rounded-full border border-[#8f6a38]/55 shadow-[0_14px_26px_rgba(0,0,0,0.95),inset_0_2px_10px_rgba(244,215,139,0.12)]"
                        style={{
                          background:
                            'radial-gradient(ellipse at 50% 45%, #3a1214 0%, #1d090a 62%, #0c0505 100%)',
                        }}
                      >
                        <div className="absolute inset-[5px] rounded-full border border-dashed border-[#c49a5c]/35" />
                      </div>

                      <div className="relative h-[228px] sm:h-[272px] lg:h-[308px] aspect-[235/347] flex items-center justify-center select-none z-10">
                        <img
                          src={`${poppetBase}assets/text/effigy.png`}
                          alt="Stitched Poppet"
                          draggable={false}
                          className="w-full h-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.96)]"
                        />

                        {/* Sewn-on patches masked cleanly to effigy.png silhouette */}
                        <svg
                          viewBox="0 0 235 347"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{
                            WebkitMaskImage: `url(${poppetBase}assets/text/effigy.png)`,
                            maskImage: `url(${poppetBase}assets/text/effigy.png)`,
                            WebkitMaskSize: '100% 100%',
                            maskSize: '100% 100%',
                          }}
                        >
                          <defs>
                            <filter id="effigyBlur" x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="2.4" />
                            </filter>
                            <radialGradient id="effigyCollar" cx="50%" cy="50%" r="50%">
                              <stop offset="70%" stopColor="#1a0f07" stopOpacity="0" />
                              <stop offset="92%" stopColor="#5a3b1c" stopOpacity="0.32" />
                              <stop offset="100%" stopColor="#3a2410" stopOpacity="0.42" />
                            </radialGradient>
                            <clipPath id="effigyCrestClip2">
                              <circle cx="135" cy="189" r="30" />
                            </clipPath>
                            <radialGradient id="effigyBulge" cx="36%" cy="30%" r="78%">
                              <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
                              <stop offset="45%" stopColor="#fff" stopOpacity="0" />
                              <stop offset="100%" stopColor="#000" stopOpacity="0.58" />
                            </radialGradient>
                          </defs>

                          <image
                            href={`${poppetBase}assets/text/effigy.png`}
                            x="0"
                            y="0"
                            width="235"
                            height="347"
                            preserveAspectRatio="none"
                          />

                          {/* Empty Head Stitch Target Ring */}
                          {!previewHead && (
                            <g opacity="0.85">
                              <circle
                                cx="104"
                                cy="61"
                                r="25"
                                fill="#140c08"
                                fillOpacity="0.42"
                                stroke="#c49a5c"
                                strokeWidth="1.5"
                                strokeDasharray="4 3"
                              />
                              <circle cx="104" cy="61" r="3" fill="#c49a5c" fillOpacity="0.55" />
                            </g>
                          )}

                          {/* Torso Crest Sewn Medallion */}
                          {previewBody ? (
                            <g opacity={isHoverPreviewBody ? 0.88 : 1}>
                              <g transform="translate(5 2) rotate(-14 130 187)">
                                <g transform="translate(130 187) scale(0.9 1) translate(-130 -187)">
                                  <circle cx="130" cy="189" r="37" fill="#000" opacity="0.42" filter="url(#effigyBlur)" />
                                  <circle cx="130" cy="187" r="37" fill="url(#effigyCollar)" />
                                  <image
                                    href={getSigilArtUrl(previewBody)}
                                    x="101"
                                    y="158"
                                    width="58"
                                    height="58"
                                    preserveAspectRatio="xMidYMid meet"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <circle cx="130" cy="187" r="37" fill="url(#effigyBulge)" />
                                  <g strokeLinecap="round">
                                    {Array.from({ length: 22 }, (_, i) => {
                                      const ang = (i / 22) * Math.PI * 2;
                                      const c = Math.cos(ang);
                                      const sn = Math.sin(ang);
                                      return (
                                        <g key={'crest-st-' + i}>
                                          <line
                                            x1={130 + 27.5 * c + 0.6}
                                            y1={187 + 27.5 * sn + 0.8}
                                            x2={130 + 37 * c + 0.6}
                                            y2={187 + 37 * sn + 0.8}
                                            stroke="#000"
                                            strokeOpacity="0.28"
                                            strokeWidth="1.4"
                                          />
                                          <line
                                            x1={130 + 27.5 * c}
                                            y1={187 + 27.5 * sn}
                                            x2={130 + 37 * c}
                                            y2={187 + 37 * sn}
                                            stroke="#d8b46c"
                                            strokeOpacity="0.92"
                                            strokeWidth="1.1"
                                          />
                                        </g>
                                      );
                                    })}
                                  </g>
                                </g>
                              </g>
                              <image
                                href={`${poppetBase}assets/text/effigy.png`}
                                x="0"
                                y="0"
                                width="235"
                                height="347"
                                preserveAspectRatio="none"
                                clipPath="url(#effigyCrestClip2)"
                                opacity="0.48"
                                style={{ mixBlendMode: 'multiply' }}
                              />
                            </g>
                          ) : (
                            <g opacity="0.85">
                              <circle
                                cx="131"
                                cy="187"
                                r="29"
                                fill="#140c08"
                                fillOpacity="0.42"
                                stroke="#c49a5c"
                                strokeWidth="1.5"
                                strokeDasharray="4 3"
                              />
                              <circle cx="131" cy="187" r="3" fill="#c49a5c" fillOpacity="0.55" />
                            </g>
                          )}
                        </svg>

                        {/* Tribe Embroidery Sewn Onto Poppet Head */}
                        {previewHead && (
                          <div
                            className={`absolute pointer-events-none flex items-center justify-center transition-opacity duration-200 ${
                              isHoverPreviewHead ? 'opacity-85' : 'opacity-100'
                            }`}
                            style={{
                              left: '45%',
                              top: '17%',
                              width: '40%',
                              aspectRatio: '1 / 1',
                              transform: 'translate(-50%, -50%) perspective(30px) rotateZ(-9deg) rotateX(6deg)',
                              WebkitMaskImage:
                                'repeating-linear-gradient(32deg, #000 0 1.4px, rgba(0,0,0,0.55) 1.4px 2.6px), radial-gradient(ellipse at 46% 44%, #000 56%, rgba(0,0,0,0.3) 100%)',
                              maskImage:
                                'repeating-linear-gradient(32deg, #000 0 1.4px, rgba(0,0,0,0.55) 1.4px 2.6px), radial-gradient(ellipse at 46% 44%, #000 56%, rgba(0,0,0,0.3) 100%)',
                              WebkitMaskComposite: 'source-in',
                              maskComposite: 'intersect',
                            }}
                          >
                            <div
                              className="[&>*]:scale-[2.6] sm:[&>*]:scale-[3.3] lg:[&>*]:scale-[3.8]"
                              style={{
                                filter:
                                  'brightness(0.14) sepia(1) saturate(2.4) drop-shadow(-1px -1px 0.7px rgba(30,16,4,0.85)) drop-shadow(1px 1px 0.5px rgba(255,236,190,0.4))',
                              }}
                            >
                              {TRIBE_EMBROIDERY[previewHead as Tribe] || <span className="text-lg">✦</span>}
                            </div>
                          </div>
                        )}

                        {/* Active Tailor's Golden Needle & Running Thread Animation on Stitch */}
                        {effigyStitchingAnim && (
                          <svg
                            viewBox="0 0 235 347"
                            className="pointer-events-none absolute inset-0 z-30 w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]"
                          >
                            <circle
                              cx="104"
                              cy="61"
                              r="28"
                              fill="none"
                              stroke="#f4d78b"
                              strokeWidth="2.4"
                              strokeDasharray="240"
                              style={{ animation: 'effigyRingDraw 0.55s ease-out forwards' }}
                            />
                            <circle
                              cx="131"
                              cy="187"
                              r="36"
                              fill="none"
                              stroke="#f43f5e"
                              strokeWidth="2.6"
                              strokeDasharray="240"
                              style={{ animation: 'effigyRingDraw 0.65s ease-out 0.18s both' }}
                            />
                            <g style={{ transformOrigin: '117px 173px', animation: 'effigyNeedleBind 0.9s ease-in-out forwards' }}>
                              <path d="M 60 173 Q 28 164 6 178" fill="none" stroke="#f4d78b" strokeWidth="2.4" strokeLinecap="round" />
                              <path d="M 58 173 L 68 169 L 146 170.5 L 166 173 L 146 175.5 L 68 177 Z" fill="#f5ead4" stroke="#452f1a" strokeWidth="1.4" />
                              <ellipse cx="70" cy="173" rx="4.5" ry="1.8" fill="#7f1d1d" />
                            </g>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fixed-Height Live Poppet Binding Readout Plaque */}
                  <div className="relative z-20 w-full mt-3 px-3.5 py-2.5 bg-[#0e0907]/92 border border-[#523925]/85 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9),0_8px_20px_rgba(0,0,0,0.8)] text-center">
                    <span className="pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#b08749]/55" />
                    <span className="pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-[#b08749]/55" />
                    <span className="pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-[#b08749]/55" />
                    <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#b08749]/55" />

                    <div className="grid grid-cols-2 gap-2 pb-2 mb-1.5 border-b border-[#3d291a]/80">
                      <div className="px-2 py-1 bg-[#140d0a] border border-[#3d2a1b]/80">
                        <div className="text-[8px] font-['Cinzel',_serif] uppercase tracking-[0.2em] text-[#9b8265]">
                          Tribal Patch
                        </div>
                        <div className={`text-[11px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.12em] truncate mt-0.5 ${previewHead ? 'text-[#f4d78b]' : 'text-[#665647]'}`}>
                          {previewHead || 'Unbound'}
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-[#140d0a] border border-[#3d2a1b]/80">
                        <div className="text-[8px] font-['Cinzel',_serif] uppercase tracking-[0.2em] text-[#9b8265]">
                          Torso Crest
                        </div>
                        <div className={`text-[11px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.12em] truncate mt-0.5 ${previewBody ? 'text-[#f2a69c]' : 'text-[#665647]'}`}>
                          {previewBody || 'Unbound'}
                        </div>
                      </div>
                    </div>

                    <div className="min-h-[30px] flex items-center justify-center px-1">
                      {previewHead && previewBody ? (
                        <p className="text-[11px] text-[#e8d6ba] leading-snug">
                          All <span className="text-[#f4d78b] font-bold">{previewHead}</span> creatures gain{' '}
                          <span className="text-[#f5a399] font-bold">{previewBody}</span>.
                        </p>
                      ) : previewHead ? (
                        <p className="text-[10.5px] italic text-[#9e8970]">
                          Bind a <span className="text-[#e2be7d]">Torso Crest</span> to awaken this poppet.
                        </p>
                      ) : previewBody ? (
                        <p className="text-[10.5px] italic text-[#9e8970]">
                          Bind a <span className="text-[#e2be7d]">Tribal Patch</span> to awaken this poppet.
                        </p>
                      ) : (
                        <p className="text-[10.5px] italic text-[#8a755f]">
                          Hover or select a scrap to preview on the poppet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Carved Reliquary Tailor Workbench */}
                <RitualReliquaryShell
                  variant="crimson"
                  className="md:col-span-7 flex flex-col min-h-0"
                >
                  {/* Step Progress & Satchel Header */}
                  <div className={`relative z-10 flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-6 pt-3.5 sm:pt-4 pb-2.5 sm:pb-3 border-b border-[#543a27]/70 bg-[#110808]/55 transition-opacity duration-300 ${isTotemFadingOut ? 'opacity-0' : ''}`}>
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <span
                        className={`px-2 sm:px-2.5 py-1 text-[8px] sm:text-[9.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em] border whitespace-nowrap ${
                          totemStage === 'REWARD'
                            ? 'bg-[#29090b]/90 border-[#c49a5c]/85 text-[#f7e3bd] shadow-[inset_0_0_10px_rgba(185,28,28,0.28)]'
                            : 'bg-[#100a08]/70 border-[#3d2c1f]/75 text-[#8a7560]'
                        }`}
                      >
                        I. Claim Scrap
                      </span>
                      <span className="text-[#785c40] text-xs shrink-0">›</span>
                      <span
                        className={`px-2 sm:px-2.5 py-1 text-[8px] sm:text-[9.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em] border whitespace-nowrap ${
                          totemStage === 'ASSEMBLE'
                            ? 'bg-[#29090b]/90 border-[#c49a5c]/85 text-[#f7e3bd] shadow-[inset_0_0_10px_rgba(185,28,28,0.28)]'
                            : 'bg-[#100a08]/70 border-[#3d2c1f]/75 text-[#8a7560]'
                        }`}
                      >
                        II. Stitch Poppet
                      </span>
                    </div>
                    <span className="px-2 sm:px-2.5 py-1 bg-[#120b09] border border-[#4a3423]/80 text-[8.5px] sm:text-[10px] font-mono tracking-[0.1em] sm:tracking-[0.16em] text-[#cbb390] whitespace-nowrap shrink-0">
                      {totemPieces.length}/7
                    </span>
                  </div>

                  {totemStage === 'REWARD' ? (
                    <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-5 sm:px-6 py-4 gap-3">
                      {!totemChoicesHidden ? (
                        <>
                          {/* 3 Uniformly Framed Physical Scrap Cards */}
                          <div className="flex-1 min-h-0 grid grid-cols-3 gap-2.5 sm:gap-3.5 items-stretch">
                            {totemRewardChoices.map((tc, idx) => {
                              const isSelected = selectedTotemRewardIdx === idx;
                              const isOwned = totemPieces.some(p => p.type === tc.type && p.value === tc.value);
                              const fadeAnim = isTotemFadingOut
                                ? isSelected
                                  ? 'animate-swipe-up-fade pointer-events-none'
                                  : 'opacity-0 transition-opacity duration-300 pointer-events-none'
                                : '';

                              return (
                                <button
                                  key={`totem-rew-${idx}`}
                                  type="button"
                                  disabled={isEventBusy || isTotemFadingOut}
                                  onMouseEnter={() => setHoveredTotemRewardIdx(idx)}
                                  onMouseLeave={() =>
                                    setHoveredTotemRewardIdx((prev: number | null) => (prev === idx ? null : prev))
                                  }
                                  onClick={() => {
                                    if (!isEventBusy && !isTotemFadingOut) {
                                      triggerSfx('draw');
                                      setSelectedTotemRewardIdx(idx);
                                    }
                                  }}
                                  className={`group relative flex flex-col items-center justify-between p-2.5 sm:p-3.5 border transition-all duration-200 select-none ${fadeAnim} ${
                                    isSelected
                                      ? 'bg-[#1c100d]/95 border-[#e2be7d] -translate-y-1 shadow-[0_0_24px_rgba(212,175,55,0.3),inset_0_2px_12px_rgba(0,0,0,0.85)]'
                                      : 'bg-[#100a08]/90 border-[#4a3524]/85 hover:border-[#b08749] hover:-translate-y-0.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)]'
                                  } ${isEventBusy || isTotemFadingOut ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  {/* Corner Brass Ticks */}
                                  <span className={`pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t border-l ${isSelected ? 'border-[#f4d78b]' : 'border-[#8f6a38]/55'}`} />
                                  <span className={`pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t border-r ${isSelected ? 'border-[#f4d78b]' : 'border-[#8f6a38]/55'}`} />
                                  <span className={`pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l ${isSelected ? 'border-[#f4d78b]' : 'border-[#8f6a38]/55'}`} />
                                  <span className={`pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r ${isSelected ? 'border-[#f4d78b]' : 'border-[#8f6a38]/55'}`} />

                                  {/* Top Type Pill */}
                                  <div className="w-full flex items-center justify-between gap-1">
                                    <span
                                      className={`text-[8px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] ${
                                        tc.type === 'head' ? 'text-[#d9b46e]' : 'text-[#e5928a]'
                                      }`}
                                    >
                                      {tc.type === 'head' ? 'Tribal Patch' : 'Torso Crest'}
                                    </span>
                                    {isOwned && (
                                      <span className="px-1 py-0.2 bg-[#1a130c] border border-[#6e5232] text-[7px] uppercase tracking-wider text-[#b59c7b]">
                                        Owned
                                      </span>
                                    )}
                                  </div>

                                  {/* Center Physical Scrap Art */}
                                  <div className="my-auto py-2 flex items-center justify-center w-full">
                                    {tc.type === 'head' ? (
                                      <div className="relative w-[92px] h-[96px] sm:w-[112px] sm:h-[116px] flex items-center justify-center">
                                        {renderHeadCutoutSvg(tc.value, isSelected)}
                                        <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 bg-[#1b120b]/92 border border-[#5a412a] rounded-[2px] flex items-center justify-center shadow-inner [&>*]:scale-[1.45] sm:[&>*]:scale-[1.8]">
                                          {TRIBE_EMBROIDERY[tc.value as Tribe] || <span className="text-xl">✦</span>}
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className={`relative w-[92px] h-[92px] sm:w-[110px] sm:h-[110px] rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${
                                          isSelected
                                            ? 'border-[#e5c16b] shadow-[0_0_20px_rgba(212,175,55,0.28)]'
                                            : 'border-[#8c6747]/80 group-hover:border-[#cfa159]'
                                        }`}
                                        style={{
                                          backgroundColor: '#1a120b',
                                          backgroundImage: `radial-gradient(circle at 50% 35%, rgba(43,29,18,0.44), rgba(14,9,6,0.78)), url("${poppetBase}assets/text/patches.jpg")`,
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                        }}
                                      >
                                        <div className="w-[54px] h-[54px] sm:w-[66px] sm:h-[66px] rounded-full bg-[#150d0a] border border-[#8f6a38]/85 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] flex items-center justify-center overflow-hidden">
                                          <img
                                            src={getSigilArtUrl(tc.value)}
                                            alt={tc.value}
                                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain [image-rendering:pixelated] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Piece Name */}
                                  <div className="w-full pt-1.5 border-t border-[#3b291d]/75 text-center">
                                    <div className="font-['Cinzel',_serif] font-bold text-[9px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.14em] text-[#f3dfb8] group-hover:text-white leading-tight break-words sm:truncate">
                                      {tc.value}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Fixed-Height Inspector Plaque (Always Explains Hovered or Selected Piece) */}
                          <div className="relative shrink-0 min-h-[64px] px-4 py-2.5 bg-[#0c0807]/90 border border-[#4a3423]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.92)] flex flex-col items-center justify-center text-center">
                            {inspectedRewardChoice ? (
                              inspectedRewardChoice.type === 'body' ? (
                                <>
                                  <div className="font-['Cinzel',_serif] text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#f4d78b]">
                                    ◆ {inspectedRewardChoice.value} ◆
                                  </div>
                                  <p className="text-[11px] text-[#e0cfb4] leading-snug mt-0.5 max-w-lg">
                                    {SIGIL_DESCRIPTIONS[inspectedRewardChoice.value] || 'An inscrutable crest bound in crimson thread.'}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="font-['Cinzel',_serif] text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#f4d78b]">
                                    ◆ {inspectedRewardChoice.value} Tribal Patch ◆
                                  </div>
                                  <p className="text-[11px] text-[#d9c7aa] leading-snug mt-0.5 max-w-lg">
                                    Sewn to a poppet&apos;s head to grant its Torso Crest to every <span className="text-[#f4d78b] font-bold">{inspectedRewardChoice.value}</span> creature in your deck.
                                  </p>
                                </>
                              )
                            ) : (
                              <span className="text-[10.5px] font-['Cinzel',_serif] uppercase tracking-[0.2em] text-[#8d765c]">
                                Select one scrap to bind to your satchel
                              </span>
                            )}
                          </div>

                          {/* Primary Action Row */}
                          <div className="flex items-center justify-center shrink-0">
                            <button
                              type="button"
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
                                  // Auto-preselect the newly claimed piece + current active counterpart (or first owned) so ASSEMBLE is zero-jank!
                                  const newIdx = nextPieces.length - 1;
                                  const nextHeadIdx =
                                    chosen.type === 'head'
                                      ? newIdx
                                      : (() => {
                                          const activeIdx = activeTotem.head
                                            ? nextPieces.findIndex(p => p.type === 'head' && p.value === activeTotem.head)
                                            : -1;
                                          return activeIdx !== -1 ? activeIdx : nextPieces.findIndex(p => p.type === 'head');
                                        })();
                                  const nextBodyIdx =
                                    chosen.type === 'body'
                                      ? newIdx
                                      : (() => {
                                          const activeIdx = activeTotem.body
                                            ? nextPieces.findIndex(p => p.type === 'body' && p.value === activeTotem.body)
                                            : -1;
                                          return activeIdx !== -1 ? activeIdx : nextPieces.findIndex(p => p.type === 'body');
                                        })();

                                  setAssemblyHeadIdx(nextHeadIdx >= 0 ? nextHeadIdx : null);
                                  setAssemblyBodyIdx(nextBodyIdx >= 0 ? nextBodyIdx : null);
                                  setHoveredTotemRewardIdx(null);
                                  setTotemStage('ASSEMBLE');
                                  setIsEventBusy(false);
                                } else {
                                  setIsTotemFadingOut(true);
                                  await new Promise(res => setTimeout(res, 450));
                                  setTotemChoicesHidden(true);
                                  await new Promise(res => setTimeout(res, 750));
                                  returnToMap();
                                }
                              }}
                              disabled={selectedTotemRewardIdx === null || isEventBusy}
                              className={`px-7 py-2.5 rounded-[2px] bg-gradient-to-b from-[#331610] to-[#1a0b08] hover:from-[#471d14] hover:to-[#240f0b] active:translate-y-[1px] border border-[#c49a5c]/90 hover:border-[#f4d78b] text-[#f5e3be] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.9)] transition-all duration-200 select-none ${
                                isTotemFadingOut ? 'opacity-0 pointer-events-none' : ''
                              }`}
                            >
                              {willUnlockAssembly ? 'Claim & Stitch Poppet' : 'Claim Scrap to Satchel'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                          <span className="text-xl text-[#d9b46e]">✦</span>
                          <div className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.24em] text-[#e6d1ad]">
                            Scrap Bound to Satchel
                          </div>
                          <div className="text-[10.5px] text-[#9b8265]">
                            Find its counterpart to stitch a complete poppet.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* STAGE II: ASSEMBLE / STITCH POPPET BENCH */
                    <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-5 sm:px-6 py-4 gap-3">
                      <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
                        {/* Tribal Patches Shelf */}
                        <div className="relative p-3.5 bg-[#0e0908]/92 border border-[#4a3423]/85 shadow-[inset_0_2px_10px_rgba(0,0,0,0.92)] flex flex-col min-h-0">
                          <span className="pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#b08749]/45" />
                          <span className="pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-[#b08749]/45" />
                          <span className="pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-[#b08749]/45" />
                          <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#b08749]/45" />
                          <div className="flex items-center justify-between border-b border-[#3a271a]/80 pb-1.5 mb-2.5 shrink-0">
                            <span className="text-[10px] font-['Cinzel',_serif] font-bold text-[#d9b46e] uppercase tracking-[0.2em]">
                              ◆ Tribal Patches (Head)
                            </span>
                            <span className="text-[9.5px] font-mono text-[#8e785f]">{ownedHeadPieces.length} Owned</span>
                          </div>
                          <div className="flex-1 min-h-0 overflow-y-auto flex flex-wrap content-start gap-2.5 pr-0.5">
                            {ownedHeadPieces.map((p) => {
                              const isPicked = assemblyHeadIdx === p.idx;
                              return (
                                <button
                                  key={`head-${p.idx}`}
                                  type="button"
                                  disabled={effigyStitchingAnim}
                                  onClick={() => {
                                    triggerSfx('draw');
                                    setAssemblyHeadIdx(p.idx);
                                  }}
                                  className={`relative px-3.5 py-2 border border-dashed rounded-[2px] text-[11px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.14em] transition-all cursor-pointer flex items-center gap-2 ${
                                    isPicked
                                      ? 'border-[#f4d78b] text-[#fff2d4] shadow-[0_0_16px_rgba(212,175,55,0.34)] -translate-y-0.5'
                                      : 'border-[#7a5a3c]/70 text-[#cbb697]/90 hover:border-[#c89e4c] hover:text-[#f2dfc0]'
                                  }`}
                                  style={{
                                    backgroundColor: '#1a130d',
                                    backgroundImage: isPicked
                                      ? `linear-gradient(to bottom, rgba(58,34,18,0.56), rgba(24,14,8,0.78)), url("${poppetBase}assets/text/patches.jpg")`
                                      : `linear-gradient(to bottom, rgba(26,18,12,0.62), rgba(14,9,6,0.84)), url("${poppetBase}assets/text/patches.jpg")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                >
                                  <div className="w-6 h-6 bg-[#17100a]/90 border border-[#5a412a] flex items-center justify-center shrink-0 [&>*]:scale-[1.2]">
                                    {TRIBE_EMBROIDERY[p.value as Tribe] || <span>✦</span>}
                                  </div>
                                  <span>{p.value}</span>
                                  {isPicked && <span className="w-1.5 h-1.5 rounded-full bg-[#f4d78b] shadow-[0_0_6px_#f4d78b]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Threadbound Crests Shelf */}
                        <div className="relative p-3.5 bg-[#0e0908]/92 border border-[#4a3423]/85 shadow-[inset_0_2px_10px_rgba(0,0,0,0.92)] flex flex-col min-h-0">
                          <span className="pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#a34d47]/50" />
                          <span className="pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-[#a34d47]/50" />
                          <span className="pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-[#a34d47]/50" />
                          <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#a34d47]/50" />
                          <div className="flex items-center justify-between border-b border-[#3a271a]/80 pb-1.5 mb-2.5 shrink-0">
                            <span className="text-[10px] font-['Cinzel',_serif] font-bold text-[#e5928a] uppercase tracking-[0.2em]">
                              ◆ Threadbound Crests (Torso)
                            </span>
                            <span className="text-[9.5px] font-mono text-[#8e785f]">{ownedBodyPieces.length} Owned</span>
                          </div>
                          <div className="flex-1 min-h-0 overflow-y-auto flex flex-wrap content-start gap-2.5 pr-0.5">
                            {ownedBodyPieces.map((p) => {
                              const isPicked = assemblyBodyIdx === p.idx;
                              return (
                                <button
                                  key={`body-${p.idx}`}
                                  type="button"
                                  disabled={effigyStitchingAnim}
                                  onClick={() => {
                                    triggerSfx('draw');
                                    setAssemblyBodyIdx(p.idx);
                                  }}
                                  className={`relative px-3.5 py-2 border border-dashed rounded-full text-[11px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.12em] transition-all cursor-pointer flex items-center gap-2 ${
                                    isPicked
                                      ? 'border-[#f4d78b] text-[#fff2d4] shadow-[0_0_16px_rgba(212,175,55,0.34)] -translate-y-0.5'
                                      : 'border-[#7a5a3c]/70 text-[#cbb697]/90 hover:border-[#c89e4c] hover:text-[#f2dfc0]'
                                  }`}
                                  style={{
                                    backgroundColor: '#1a130d',
                                    backgroundImage: isPicked
                                      ? `linear-gradient(to bottom, rgba(58,34,18,0.56), rgba(24,14,8,0.78)), url("${poppetBase}assets/text/patches.jpg")`
                                      : `linear-gradient(to bottom, rgba(26,18,12,0.62), rgba(14,9,6,0.84)), url("${poppetBase}assets/text/patches.jpg")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                >
                                  <div className="w-7 h-7 rounded-full bg-[#140d08] border border-[#7c5b32] flex items-center justify-center shrink-0 overflow-hidden">
                                    <img
                                      src={getSigilArtUrl(p.value)}
                                      alt={p.value}
                                      className="w-5 h-5 object-contain [image-rendering:pixelated]"
                                    />
                                  </div>
                                  <span>{p.value}</span>
                                  {isPicked && <span className="w-1.5 h-1.5 rounded-full bg-[#f4d78b] shadow-[0_0_6px_#f4d78b]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Live Selected Crest Description Plaque (Never Stitch Blind!) */}
                      <div className="relative shrink-0 min-h-[58px] px-4 py-2 bg-[#0c0807]/90 border border-[#4a3423]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.92)] flex flex-col items-center justify-center text-center">
                        <span className="pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#b08749]/45" />
                        <span className="pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-[#b08749]/45" />
                        <span className="pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-[#b08749]/45" />
                        <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#b08749]/45" />
                        {previewBody ? (
                          <>
                            <div className="font-['Cinzel',_serif] text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2a69c]">
                              ◆ {previewBody} ◆
                            </div>
                            <p className="text-[11px] text-[#e0cfb4] leading-snug mt-0.5 max-w-lg">
                              {SIGIL_DESCRIPTIONS[previewBody] || 'An ancient crest bound in bone thread.'}
                            </p>
                          </>
                        ) : (
                          <span className="text-[10.5px] font-['Cinzel',_serif] uppercase tracking-[0.18em] text-[#8d765c]">
                            Select a Tribal Patch &amp; Crest above
                          </span>
                        )}
                      </div>

                      {/* Stitch Action Row */}
                      <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                        <button
                          type="button"
                          disabled={effigyStitchingAnim || assemblyHeadIdx === null || assemblyBodyIdx === null}
                          onClick={() => {
                            if (assemblyHeadIdx === null || assemblyBodyIdx === null) return;
                            const hVal = totemPieces[assemblyHeadIdx].value as Tribe;
                            const bVal = totemPieces[assemblyBodyIdx].value;
                            const newTotem = { head: hVal, body: bVal };
                            setActiveTotem(newTotem);
                            setEffigyStitchingAnim(true);
                            triggerSfx('needle_stitch');
                            addLog(`Poppet stitched: ${hVal} + ${bVal}`);
                            scheduleEventTimer(() => {
                              setEffigyStitchingAnim(false);
                              returnToMap(undefined, newTotem);
                            }, 950);
                          }}
                          className="px-7 py-2.5 rounded-[2px] bg-gradient-to-b from-[#331610] to-[#1a0b08] hover:from-[#471d14] hover:to-[#240f0b] active:translate-y-[1px] border border-[#c49a5c]/90 hover:border-[#f4d78b] text-[#f5e3be] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_8px_22px_rgba(0,0,0,0.9)] transition-all select-none"
                        >
                          {effigyStitchingAnim ? 'Stitching Poppet...' : 'Stitch Poppet'}
                        </button>

                        {activeTotem.head && activeTotem.body && !effigyStitchingAnim && (
                          <button
                            type="button"
                            onClick={() => returnToMap()}
                            className="px-4 py-2.5 rounded-[2px] bg-[#140e0a]/90 hover:bg-[#1f1610] active:translate-y-[1px] border border-[#4a3322]/85 hover:border-[#8c6742] text-[#cbb697] hover:text-[#f3e6cf] font-['Cinzel',_serif] font-bold text-[10.5px] uppercase tracking-[0.18em] cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.8)] transition-all select-none"
                          >
                            Keep Current
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </RitualReliquaryShell>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          CARD CHOICE EVENT SCREEN
         ========================================================================= */}
      {screen === 'EVENT_CARD_CHOICE' && (() => {
        const BASE = import.meta.env.BASE_URL || './';
        const woodBg = `url("${BASE}assets/text/wood.jpg")`;
        const clothBg = `url("${BASE}assets/text/cloth.jpg")`;
        const slateBg = `url("${BASE}assets/text/slate.jpg")`;
        const numerals = ['I', 'II', 'III'];

        return (
          <div
            className="absolute inset-0 bg-[#080405] z-50 flex flex-col items-center justify-between px-5 sm:px-8 py-4 overflow-hidden animate-fade-up font-mono select-none"
            style={getScreenBgStyle('choiceevent.jpg')}
          >
            {/* Atmospheric Vignette — shifts to deep crimson reliquary glow on Boss Rare rewards */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: choiceIsRare
                  ? 'radial-gradient(ellipse at 50% 42%, rgba(92,10,14,0.34) 0%, rgba(16,4,5,0.74) 55%, rgba(5,2,3,0.95) 100%)'
                  : 'radial-gradient(ellipse at center, rgba(16,8,7,0.22) 0%, rgba(5,3,3,0.88) 100%)',
              }}
            />

            {renderActWeather('absolute inset-0 z-[5]', 'event_card_choice')}

            <div className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Engraved Header */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-px w-12 sm:w-20 bg-gradient-to-r from-transparent ${
                      choiceIsRare ? 'via-red-700/90 to-[#e5c16b]/90' : 'via-[#7f1d1d]/80 to-red-500/80'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-[0.34em] ${
                      choiceIsRare ? 'text-[#f2d282]' : 'text-red-400/90'
                    }`}
                    style={choiceIsRare ? { textShadow: '0 0 12px rgba(234,179,8,0.55)' } : undefined}
                  >
                    {choiceIsRare ? '✦ Boss Trophy · Reliquary ✦' : 'Thicket Clearing'}
                  </span>
                  <div
                    className={`h-px w-12 sm:w-20 bg-gradient-to-l from-transparent ${
                      choiceIsRare ? 'via-red-700/90 to-[#e5c16b]/90' : 'via-[#7f1d1d]/80 to-red-500/80'
                    }`}
                  />
                </div>
                <h1
                  className={`mt-0.5 text-2xl sm:text-3xl font-['Cinzel',_serif] font-black uppercase tracking-[0.24em] leading-tight ${
                    choiceIsRare
                      ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#fff5cf] via-[#e6be62] to-[#9e6f22]'
                      : 'text-[#ede3d2]'
                  }`}
                  style={{
                    textShadow: choiceIsRare
                      ? '0 4px 20px rgba(185,28,28,0.55)'
                      : '0 2px 14px rgba(0,0,0,0.98), 0 0 16px rgba(153,27,27,0.45)',
                  }}
                >
                  {choiceIsRare ? 'Spoils of the Slain' : 'Wild Beasts'}
                </h1>
              </div>

              {/* Triptych Specimen / Reliquary Altar */}
              <div className="relative w-full max-w-4xl my-auto flex flex-col items-center justify-center gap-5 px-2 sm:px-6">
                <div
                  key={choiceDealGen}
                  className="relative z-20 w-full grid grid-cols-3 gap-4 sm:gap-7 items-stretch"
                >
                  {choiceCards.map((c, idx) => {
                    const isSelected = choiceSelectedIdx === idx;
                    return (
                      <div
                        key={c.id || `choice-${choiceDealGen}-${idx}`}
                        onClick={() => {
                          triggerSfx('draw');
                          setChoiceSelectedIdx(idx);
                        }}
                        style={{
                          animation: `choiceCardDeal 0.36s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.08}s both`,
                          backgroundImage: woodBg,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                        className={`relative p-[4px] rounded-[2px] cursor-pointer transition-all duration-300 group select-none ${
                          isSelected
                            ? choiceIsRare
                              ? '-translate-y-3 scale-[1.04] shadow-[0_22px_42px_rgba(0,0,0,0.96),0_0_28px_rgba(212,175,55,0.38)] z-30'
                              : '-translate-y-3 scale-[1.04] shadow-[0_22px_42px_rgba(0,0,0,0.96),0_0_26px_rgba(220,38,38,0.42)] z-30'
                            : 'hover:-translate-y-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.9)] z-10 hover:z-20'
                        }`}
                      >
                        {/* Timber frame darkening & active border */}
                        <div
                          className={`pointer-events-none absolute inset-0 rounded-[2px] bg-[#0a0505]/55 border transition-colors duration-300 ${
                            isSelected
                              ? choiceIsRare
                                ? 'border-[#e5c16b]/95'
                                : 'border-red-500/90'
                              : 'border-[#2c1415] group-hover:border-red-800/80'
                          }`}
                        />

                        {/* Inner Recessed Alcove */}
                        <div
                          className="relative flex flex-col items-center justify-between pt-4 pb-3 px-3 rounded-[1px] overflow-hidden border border-[#2d1214]"
                          style={{
                            background: choiceIsRare
                              ? 'radial-gradient(ellipse at 50% 40%, rgba(74,10,14,0.82) 0%, rgba(28,5,7,0.88) 60%, rgba(10,3,4,0.94) 100%)'
                              : 'radial-gradient(ellipse at 50% 40%, rgba(24,14,14,0.72) 0%, rgba(13,7,8,0.82) 60%, rgba(8,4,5,0.9) 100%)',
                          }}
                        >
                          <div
                            className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply bg-cover bg-center"
                            style={{ backgroundImage: choiceIsRare ? clothBg : slateBg }}
                          />

                          {/* Corner Hairlines */}
                          <span className={`pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l transition-colors ${isSelected ? (choiceIsRare ? 'border-[#e5c16b]' : 'border-red-500') : 'border-[#5c1f22]/70'}`} />
                          <span className={`pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r transition-colors ${isSelected ? (choiceIsRare ? 'border-[#e5c16b]' : 'border-red-500') : 'border-[#5c1f22]/70'}`} />
                          <span className={`pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l transition-colors ${isSelected ? (choiceIsRare ? 'border-[#e5c16b]' : 'border-red-500') : 'border-[#5c1f22]/70'}`} />
                          <span className={`pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r transition-colors ${isSelected ? (choiceIsRare ? 'border-[#e5c16b]' : 'border-red-500') : 'border-[#5c1f22]/70'}`} />

                          {/* Top Alcove Numeral / Rare Crest */}
                          <div className="relative z-10 w-full flex items-center justify-between px-1 mb-2">
                            <span className="text-[9px] font-['Cinzel',_serif] font-bold tracking-[0.26em] text-stone-500">
                              {numerals[idx] || idx + 1}
                            </span>
                            <span
                              className={`text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] transition-opacity ${
                                isSelected
                                  ? choiceIsRare
                                    ? 'text-[#fde68a] opacity-100'
                                    : 'text-red-400 opacity-100'
                                  : choiceIsRare
                                    ? 'text-[#d4af37]/70 opacity-85'
                                    : 'text-stone-500 opacity-0 group-hover:opacity-75'
                              }`}
                            >
                              {isSelected ? (choiceIsRare ? '✦ CLAIMED ✦' : '◆ CHOSEN ◆') : choiceIsRare ? '✦ RARE' : 'SELECT'}
                            </span>
                          </div>

                          {/* Spotlight Behind Card */}
                          <div
                            className={`pointer-events-none absolute top-10 inset-x-4 h-36 rounded-full transition-opacity duration-300 ${
                              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
                            }`}
                            style={{
                              background: choiceIsRare
                                ? 'radial-gradient(circle, rgba(212,175,55,0.28) 0%, rgba(185,28,28,0.18) 45%, transparent 72%)'
                                : 'radial-gradient(circle, rgba(185,28,28,0.32) 0%, transparent 70%)',
                            }}
                          />

                          {/* Card Display */}
                          <div
                            className={`relative z-10 py-2 transition-all duration-300 ${
                              isSelected
                                ? 'scale-[1.08] drop-shadow-[0_18px_22px_rgba(0,0,0,0.96)]'
                                : 'scale-[1.02] group-hover:scale-[1.05] drop-shadow-[0_12px_18px_rgba(0,0,0,0.9)]'
                            }`}
                          >
                            {renderCard(c, { isSelected, isClickable: true, disableHoverScale: true })}
                          </div>

                          {/* Bottom Class / Cost Caption */}
                          <div className="relative z-10 mt-2 pt-2 w-4/5 border-t border-[#3e1719]/80 text-center">
                            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-stone-400">
                              {c.class === 'No Class' ? 'Unbound' : c.class}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stark Cinzel Flavor Line */}
                <p className="relative z-20 font-['Cinzel',_serif] text-sm sm:text-base italic tracking-[0.12em] text-[#e5cfa8]/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  {choiceIsRare
                    ? 'Three rare horrors answer the blood.'
                    : 'Three emerge from the brush.'}
                </p>
              </div>

              {/* Diegetic Action Controls */}
              <div className="flex flex-wrap items-center justify-center gap-6 shrink-0 pb-1">
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
                  className={`edge-band edge-band--btn relative px-8 sm:px-10 py-2 font-['Cinzel',_serif] font-black text-xs sm:text-sm uppercase tracking-[0.28em] transition-colors duration-150 select-none ${
                    choiceSelectedIdx === null
                      ? 'edge-band--dead text-stone-600 opacity-45 cursor-not-allowed'
                      : choiceIsRare
                        ? 'edge-band--gold text-[#f6dc93] hover:text-white cursor-pointer'
                        : 'edge-band--red text-red-400 hover:text-red-200 cursor-pointer'
                  }`}
                  style={{
                    textShadow: choiceIsRare
                      ? '0 0 18px rgba(234,179,8,0.6), 0 2px 5px rgba(0,0,0,1)'
                      : '0 0 18px rgba(239,68,68,0.8), 0 2px 5px rgba(0,0,0,1)',
                  }}
                >
                  {choiceIsRare ? 'Claim Rare Vessel' : 'Take Creature'}
                </button>
                {choiceRerollsLeft > 0 && (
                  <button
                    onClick={rerollCardChoice}
                    className="px-4 py-1.5 font-mono font-bold text-xs uppercase tracking-[0.26em] text-stone-400 hover:text-red-300 transition-colors cursor-pointer select-none"
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,0.95)' }}
                  >
                    [ REROLL · {choiceRerollsLeft} ]
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          HOARDER SEARCH SCREEN
         ========================================================================= */}
      {screen === 'EVENT_HOARDER_SEARCH' && (() => {

        const hoardBase = import.meta.env.BASE_URL || './';
        const hoardKnob = 'radial-gradient(circle at 46% 42%, #d4af6a 0 1.8px, #876128 2.4px, #36220f 4.4px, #110904 5.4px, transparent 6.5px)';
        const hoardFrameStyle: React.CSSProperties = {
          position: 'relative',
          borderStyle: 'solid',
          borderColor: 'transparent',
          borderWidth: '16px 12px 12px 12px',
          boxShadow: '0 0 0 1px #190e08, 0 0 0 2px #52361c, 0 26px 64px rgba(0,0,0,0.96), inset 0 1px 0 rgba(224,184,120,0.2)',
          backgroundColor: '#24160e',
          backgroundImage: [
            hoardKnob,
            hoardKnob,
            hoardKnob,
            hoardKnob,
            'radial-gradient(ellipse at 50% 0%, #5e0d10 0%, #3a0709 54%, #180304 100%)',
            
            'linear-gradient(to bottom, rgba(56,37,23,0.62), rgba(28,17,11,0.76), rgba(14,8,5,0.9))',
            `url("${hoardBase}assets/text/wood.jpg")`,
          ].join(', '),
          backgroundSize: ['24px 16px', '24px 16px', '24px 12px', '24px 12px', 'auto', 'auto', '140px 140px'].join(', '),
          backgroundPosition: 'left top, right top, left bottom, right bottom, 0 0, 0 0, center',
          backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'repeat'].join(', '),
          backgroundOrigin: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
          backgroundClip: 'border-box, border-box, border-box, border-box, padding-box, border-box, border-box',
        };
        return (
        <div className={`absolute inset-0 bg-[#080504]/82 backdrop-blur-md z-[110] flex flex-col items-center justify-center px-5 py-5 overflow-hidden font-mono select-none ${menuFadingOut ? 'animate-menu-fade-out' : 'animate-menu-fade-in'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,15,9,0.38)_0%,rgba(4,3,2,0.92)_100%)] pointer-events-none" />

          <div
            style={hoardFrameStyle}
            className="relative z-10 w-full max-w-5xl max-h-full min-h-0 flex flex-col items-center rounded-[2px] bg-[#180304] px-6 py-5 overflow-hidden"
          >

              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-multiply"
                style={{
                  backgroundImage: `url("${hoardBase}assets/text/cloth.jpg")`,
                  backgroundSize: '170px 170px',
                  backgroundRepeat: 'repeat',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-30"
                style={{
                  boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.92), inset 0 0 0 1px #140705, 0 0 0 1px rgba(184,138,68,0.24)',
                }}
              />
              <div className="pointer-events-none absolute inset-[6px] z-30 border border-dashed border-[#b98d46]/28" />
              <div className="pointer-events-none absolute top-[5px] left-[5px] w-3.5 h-3.5 z-30 border-t border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute top-[5px] right-[5px] w-3.5 h-3.5 z-30 border-t border-r border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] left-[5px] w-3.5 h-3.5 z-30 border-b border-l border-[#b8904a]/55" />
              <div className="pointer-events-none absolute bottom-[5px] right-[5px] w-3.5 h-3.5 z-30 border-b border-r border-[#b8904a]/55" />
            <div className="relative z-10 shrink-0 flex flex-col items-center text-center pb-3">
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

            <div className="relative z-10 w-full flex-1 min-h-0 overflow-y-auto rounded-[2px] bg-[#110405]/75 border border-[#4a231c]/80 shadow-[inset_0_4px_14px_rgba(0,0,0,0.88)] p-4 my-2">
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

            <div className="relative z-10 shrink-0 pt-3 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (hoarderSelectedIdx === null) return;
                  const card = deck[hoarderSelectedIdx];
                  setDeck((prev: any[]) => prev.filter((_: any, i: number) => i !== hoarderSelectedIdx));
                  setHand((prev: any[]) => [...prev, applyPlayerTotem(transformAmorphous(card), activeTotem)]);
                  addLog(`Hoarder retrieved ${getCardDisplayName(card.name)}!`);
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
        );
      })()}

      {/* =========================================================================
          VIEW DECK SCREEN MODAL (WIDESCREEN NON-SCROLLING TWO-COLUMN SPLIT)
         ========================================================================= */}
      {(showViewDeck || screen === 'VIEW_DECK') && (() => {
        const activeDetailCard = selectedDeckCardDetail || masterDeck[0] || null;

        return (
          <div
            onClick={() => {
              setShowViewDeck(false);
              if (screen === 'VIEW_DECK') setScreen(previousScreen || 'DUEL');
            }}
            className={`absolute inset-0 bg-[#050303]/86 backdrop-blur-[4px] z-[110] flex flex-col items-center justify-center px-4 py-4 sm:px-7 sm:py-5 overflow-hidden font-mono select-none ${menuFadingOut ? 'animate-menu-fade-out' : 'animate-menu-fade-in'}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(28,12,10,0.34)_0%,rgba(4,2,2,0.92)_100%)] pointer-events-none" />

            <RitualReliquaryShell
              variant="crimson"
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-6xl h-full min-h-0 flex flex-col"
            >
              <div className="flex flex-col flex-1 min-h-0 px-6 sm:px-8 py-5 sm:py-6">
                {/* Engraved Header with Sculpted Return Action */}
                <div className="shrink-0 flex items-center justify-between gap-4 pb-3">
                  <div className="flex flex-col text-left">
                    <span
                      className="text-[9.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.28em] text-[#c49a5c]/90"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
                    >
                      ◆ Grimoire • {masterDeck.length} {masterDeck.length === 1 ? 'Vessel' : 'Vessels'} ◆
                    </span>
                    <h1
                      className="text-xl sm:text-2xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#f3dfb8] mt-0.5"
                      style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 14px rgba(185,28,28,0.28)' }}
                    >
                      Your Creatures
                    </h1>
                  </div>

                  <RitualSlateButton
                    label="RETURN"
                    onClick={() => {
                      setShowViewDeck(false);
                      if (screen === 'VIEW_DECK') setScreen(previousScreen || 'DUEL');
                    }}
                  />
                </div>

                {/* Engraved Tapered Brass-Crimson Rule */}
                <div className="shrink-0 w-full flex items-center justify-center gap-2 mb-4" aria-hidden="true">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-[#9f773d]/20 via-[#9f773d]/65 to-[#b91c1c]/80" />
                  <svg viewBox="0 0 10 10" className="w-[9px] h-[9px] shrink-0 overflow-visible">
                    <polygon points="5,0.6 9.4,5 5,9.4 0.6,5" fill="#991b1b" stroke="#dfba7c" strokeWidth="0.9" />
                  </svg>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-[#9f773d]/20 via-[#9f773d]/65 to-[#b91c1c]/80" />
                </div>

                {/* Two-Column Split: Scrollable Deck Tray Left, Enlarged Specimen & Crests Right */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left Column: Recessed Carved-Obsidian Vessel Tray */}
                  <div className="relative lg:col-span-7 min-h-0 flex flex-col bg-[#080505]/78 border border-[#4a3524]/75 shadow-[inset_0_4px_18px_rgba(0,0,0,0.95)] overflow-hidden">
                    <span className="pointer-events-none absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#b08749]/60 z-10" />
                    <span className="pointer-events-none absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-[#b08749]/60 z-10" />
                    <span className="pointer-events-none absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-[#b08749]/60 z-10" />
                    <span className="pointer-events-none absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-[#b08749]/60 z-10" />

                    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
                      <div className="flex flex-wrap gap-3.5 justify-center content-start">
                        {masterDeck.map((c, idx) => {
                          const isSelected = activeDetailCard?.id === c.id || (!selectedDeckCardDetail && idx === 0);
                          return (
                            <div
                              key={c.id || `view-${c.name}-${idx}`}
                              onClick={() => {
                                triggerSfx('flip');
                                setSelectedDeckCardDetail(c);
                              }}
                              className={`cursor-pointer transform transition-all duration-200 ${
                                isSelected
                                  ? 'scale-[0.99] -translate-y-1.5 z-30'
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

                  {/* Right Column: Enlarged Specimen Pedestal & Bound Crest Inscriptions */}
                  <div className="relative lg:col-span-5 min-h-0 flex flex-col justify-between bg-[#090505]/84 border border-[#4a3524]/80 p-5 shadow-[inset_0_4px_18px_rgba(0,0,0,0.95)] overflow-hidden">
                    <span className="pointer-events-none absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#b08749]/60 z-10" />
                    <span className="pointer-events-none absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-[#b08749]/60 z-10" />
                    <span className="pointer-events-none absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-[#b08749]/60 z-10" />
                    <span className="pointer-events-none absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-[#b08749]/60 z-10" />

                    {activeDetailCard ? (
                      <>
                        {/* Specimen Pedestal with Engraved Brass Ritual Halo */}
                        <div className="shrink-0 flex flex-col items-center justify-center py-3 relative">
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute w-44 h-44 rounded-full"
                            style={{
                              background:
                                'radial-gradient(circle, rgba(185,28,28,0.22) 0%, rgba(196,154,92,0.12) 45%, transparent 72%)',
                            }}
                          />
                          <svg
                            viewBox="0 0 180 180"
                            className="pointer-events-none absolute w-44 h-44 opacity-35"
                            aria-hidden="true"
                          >
                            <circle cx="90" cy="90" r="78" fill="none" stroke="#c49a5c" strokeWidth="0.9" strokeDasharray="3 4" />
                            <circle cx="90" cy="90" r="66" fill="none" stroke="#991b1b" strokeWidth="0.7" />
                          </svg>
                          <div className="relative z-10 scale-[1.14] transform transition-transform drop-shadow-[0_14px_22px_rgba(0,0,0,0.92)]">
                            {renderCard(activeDetailCard, { showCost: true, isClickable: false, disableHoverScale: true })}
                          </div>
                        </div>

                        {/* Vessel Title, Lineage & Sculpted Stat Cartouche */}
                        <div className="shrink-0 border-t border-b border-[#4a3524]/70 py-2.5 my-2.5 flex items-center justify-between gap-2 text-left">
                          <div>
                            <h2
                              className="text-lg font-['Cinzel',_serif] font-bold uppercase tracking-[0.16em] text-[#f3dfb8]"
                              style={{ textShadow: '0 1px 4px rgba(0,0,0,1)' }}
                            >
                              {getCardDisplayName(activeDetailCard.name)}
                            </h2>
                            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#c49a5c] mt-0.5">
                              {getCardTribeLabel(activeDetailCard)}
                              {activeDetailCard.cost !== undefined && activeDetailCard.cost > 0 && ` • ${activeDetailCard.cost} Blood`}
                              {activeDetailCard.boneCost !== undefined && activeDetailCard.boneCost > 0 && ` • ${activeDetailCard.boneCost} Bones`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0f0907] border border-[#5a412d]/85 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] text-xs font-mono font-bold">
                            <span className="text-[#f0c878]">{activeDetailCard.attack} ATK</span>
                            <span className="text-[#6e523a]">/</span>
                            <span className="text-[#f28b82]">{activeDetailCard.health} HP</span>
                          </div>
                        </div>

                        {/* Bound Crests List with Circular Brass Sigil Medallions */}
                        <div className="flex-1 min-h-0 overflow-y-auto text-left pr-1">
                          <div className="text-[9.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.26em] text-[#c49a5c]/90 mb-2">
                            ◆ Bound Crests
                          </div>
                          {activeDetailCard.sigils && activeDetailCard.sigils.length > 0 ? (
                            <div className="space-y-2.5">
                              {activeDetailCard.sigils.map((s: any) => (
                                <div
                                  key={s}
                                  className="relative p-2.5 flex items-start gap-3 bg-[#100a08]/92 border border-[#422f20]/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.88)]"
                                >
                                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#150d0a] border border-[#8f6a38]/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] flex items-center justify-center overflow-hidden">
                                    <img
                                      src={getSigilArtUrl(s)}
                                      alt={s}
                                      className="w-6 h-6 object-contain [image-rendering:pixelated]"
                                      onError={(e) => {
                                        const img = e.currentTarget;
                                        img.style.display = 'none';
                                        const fb = img.nextElementSibling as HTMLElement | null;
                                        if (fb) fb.style.display = 'inline';
                                      }}
                                    />
                                    <span className="hidden text-sm text-[#e5c185]">{SIGIL_MAPPING[s] || '✦'}</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-['Cinzel',_serif] text-xs font-bold text-[#f3dfb8] uppercase tracking-[0.15em]">
                                      {s}
                                    </div>
                                    <div className="text-[11px] text-[#d6c6ae]/88 leading-relaxed font-mono mt-0.5">
                                      {SIGIL_DESCRIPTIONS[s] || 'An ancient mark etched in bone.'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="font-['Cinzel',_serif] italic text-xs text-[#8a7257] py-2">
                              Unmarked vessel.
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center font-['Cinzel',_serif] italic text-sm text-[#8a7257]">
                        No creatures bound.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </RitualReliquaryShell>
          </div>
        );
      })()}
      {/* 1-Second Hold-to-Drag Charge Pill */}
      {eventHold && !eventDrag && (
        <div
          aria-hidden="true"
          className="fixed z-[215] pointer-events-none select-none flex flex-col items-center gap-1"
          style={{
            left: `${eventHold.x}px`,
            top: `${eventHold.isTouch ? eventHold.y - 52 : eventHold.y - 34}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="px-2 py-0.5 rounded-[2px] bg-[#140a08]/95 border border-[#c8a363]/75 shadow-[0_6px_18px_rgba(0,0,0,0.92)]">
            <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#f4dfb6] text-center leading-none">
              Hold to Drag
            </div>
            <div className="mt-1 h-[3px] w-16 rounded-full bg-black/80 overflow-hidden border border-[#6e5235]/50">
              <div className="h-full w-full bg-gradient-to-r from-[#b91c1c] via-[#e5b85c] to-[#fef08a] card-hold-bar" />
            </div>
          </div>
        </div>
      )}
      {/* Floating Lifted Ghost Card for Event Slot Drag-and-Drop (Desktop & Mobile Touch) */}
      {eventDrag && (
        <div
          aria-hidden="true"
          data-event-drag-ghost="true"
          className="fixed z-[220] pointer-events-none select-none will-change-transform"
          style={{
            left: `${eventDrag.x}px`,
            top: `${eventDrag.isTouch ? eventDrag.y - 44 : eventDrag.y}px`,
            transform: `translate(-50%, -50%) rotate(${eventDrag.hoveredSlot ? '0deg' : '-3deg'}) scale(${eventDrag.hoveredSlot ? (eventDrag.isTouch ? 0.9 : 1.02) : eventDrag.isTouch ? 0.84 : 0.94})`,
            transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
            filter: eventDrag.hoveredSlot
              ? 'drop-shadow(0 18px 28px rgba(0,0,0,0.95)) drop-shadow(0 0 20px rgba(244,215,139,0.72))'
              : 'drop-shadow(0 20px 30px rgba(0,0,0,0.95)) drop-shadow(0 0 12px rgba(220,38,38,0.38))',
          }}
        >
          {renderCard(eventDrag.card, { isClickable: false, disableHoverScale: true })}
        </div>
      )}
    </>
  );
}
