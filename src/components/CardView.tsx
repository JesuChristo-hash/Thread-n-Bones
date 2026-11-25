import React, { useRef } from 'react';
import type { CardDef } from '../data/gameData';
import { ALL_CARD_LOOKUP, SIGIL_DESCRIPTIONS, SIGIL_MAPPING, CARD_ART_OFFSETS, getCardArtUrl, getSigilArtUrl, toAssetSlug } from '../data/gameData';

export type RenderCardOptions = {
isSelected?: boolean;
      isMarkedSacrifice?: boolean;
      isOpponent?: boolean;
      laneIndex?: number;
      isClickable?: boolean;
      onClick?: () => void;
      customScale?: string;
      showCost?: boolean;
      isAttacking?: boolean;
      attackDirection?: 'left' | 'right' | 'straight';
      isAirborneAttack?: boolean;
      isDirectAttack?: boolean;
      isDamaged?: boolean;
      isDestroyed?: boolean;
	  isSacrificing?: boolean;
      isSigilJittering?: boolean;
      isHpFlashing?: boolean;
      isDroppingQueue?: boolean;
      isDefending?: boolean;
      isZeroPowerShaking?: boolean;
      isQueue?: boolean;
      disableHoverScale?: boolean;
};

export interface CardViewProps {
  card: CardDef | null;
  options?: RenderCardOptions;
  screen: string;
  phase: string;
  activeTotem: any;
  bossTotem: any;
  playerBoard: (CardDef | null)[];
  enemyBoard: (CardDef | null)[];
  evolvingCards: any[];
  lateralMovements: Record<string, any>;
  summonedCardIds: Set<string>;
  evolvePhase: string | null;
  isSummoningFlag: boolean;
  lateralDeltaVal: any;
  BASE: any;
  getCardAttack: any;
  hasMoreSigilsThanOriginal: any;
  isCardNamed: any;
  isLeftFacingCard: any;
  setSigilDetailModal: any;
}

function CardViewInner({
  card,
  options,
  screen,
  phase,
  activeTotem,
  bossTotem,
  playerBoard,
  enemyBoard,
  evolvingCards,
  lateralMovements,
  summonedCardIds,
  BASE,
  getCardAttack,
  hasMoreSigilsThanOriginal,
  isCardNamed,
  isLeftFacingCard,
  setSigilDetailModal
}: CardViewProps) {
  const onClickRef = useRef(options?.onClick);
  onClickRef.current = options?.onClick;

    if (!card) return null;

    const isPlayer = !options?.isOpponent;
    const laneIndex = options?.laneIndex;

    // 1. Waterborne states
    const isWaterborne = card.sigils?.includes('Waterborne') || false;
    // Submerges strictly during the opponent's attack phase
    const isSubmergedActive =
      isWaterborne &&
      laneIndex !== undefined &&
      (options?.isOpponent ? phase !== 'ENEMY' : phase === 'ENEMY');

    // 2. Totem logic (active battle screen: player totem & boss/encounter totem)
    const hasAlreadyEvolved = Boolean((card as any).hasEvolved || card.name.startsWith('Elder '));
    const isPlayerTotemAffected =
      screen === 'DUEL' &&
      isPlayer &&
      !!(activeTotem?.head && activeTotem?.body && (card.class === activeTotem.head || card.class === "ALL Classes")) &&
      !(activeTotem.body === 'Fledgling' && hasAlreadyEvolved);
    const isBossTotemAffected =
      screen === 'DUEL' &&
      !isPlayer &&
      !!(bossTotem?.class && (card.class === bossTotem.class || card.class === "ALL Classes")) &&
      !(bossTotem.sigil === 'Fledgling' && hasAlreadyEvolved);
    const isTotemAffected = isPlayerTotemAffected || isBossTotemAffected;

    if (isPlayerTotemAffected && activeTotem.body && !card.sigils.includes(activeTotem.body)) {
      card.sigils = [...card.sigils, activeTotem.body];
    }
    if (isBossTotemAffected && bossTotem?.sigil && !card.sigils.includes(bossTotem.sigil)) {
      card.sigils = [...card.sigils, bossTotem.sigil];
    }

    // 3. Attack numbers
    const hasShadow = card.sigils?.includes('Shadow');
    const displayAttack = !options?.isQueue && laneIndex !== undefined 
      ? getCardAttack(card, laneIndex, isPlayer) 
      : getCardAttack(card);
    const baseStatCompare = card.attack || 0;
    const isBuffed = baseStatCompare < displayAttack;
    const isDebuffed = baseStatCompare > displayAttack;

    let isStinkyDebuffed = false;
    if (!options?.isQueue && laneIndex !== undefined) {
      const oppBoard = isPlayer ? enemyBoard : playerBoard;
      const oppCard = oppBoard[laneIndex] || oppBoard.find(c => c?.isMassive);
      if (oppCard?.sigils.includes('Stinky') && !card.sigils.includes('Made of Stone')) {
        isStinkyDebuffed = true;
      }
    }

    // 4. Alpha-hugging drop-shadow styling (submerged & goobert cards carry natural paper drops, no neon aura)
    let borderStyle = isTotemAffected
      ? '[filter:drop-shadow(0_0_2px_#93c5fd)_drop-shadow(0_0_5px_#3b82f6)_drop-shadow(0_0_10px_rgba(29,78,216,0.85))]'
      : options?.isOpponent
          ? '[filter:drop-shadow(0_4px_8px_rgba(0,0,0,0.85))] hover:[filter:drop-shadow(0_6px_12px_rgba(185,28,28,0.5))]'
          : '[filter:drop-shadow(0_4px_8px_rgba(0,0,0,0.85))] hover:[filter:drop-shadow(0_6px_14px_rgba(217,119,6,0.4))]';

    if (options?.isSelected) {
      borderStyle = options?.disableHoverScale
        ? '[filter:drop-shadow(0_0_3px_#fef08a)_drop-shadow(0_0_8px_#eab308)_drop-shadow(0_0_16px_rgba(217,119,6,0.85))] z-40 brightness-105'
        : '[filter:drop-shadow(0_0_3px_#fef08a)_drop-shadow(0_0_8px_#eab308)_drop-shadow(0_0_16px_rgba(217,119,6,0.85))] -translate-y-3.5 z-40 scale-[1.03] brightness-105';
    }
    if (options?.isMarkedSacrifice) {
      borderStyle = '[filter:drop-shadow(0_0_3px_#fca5a5)_drop-shadow(0_0_8px_#ef4444)_drop-shadow(0_0_16px_rgba(220,38,38,0.9))] animate-sacrifice-shake z-40';
    }

    const isSummoning = card.id ? summonedCardIds.has(card.id) : false;
    const lateralDelta = card.id ? lateralMovements[card.id] : undefined;

    let animClass = '';
    if (options?.isAttacking) {
      const dir = options.attackDirection || 'straight';
      if (options.isOpponent) {
        if (dir === 'left') {
          animClass = 'animate-lunge-e-left z-50';
        } else if (dir === 'right') {
          animClass = 'animate-lunge-e-right z-50';
        } else if (options.isAirborneAttack) {
          animClass = 'animate-lunge-e-airborne z-50';
        } else if (options.isDirectAttack) {
          animClass = 'animate-lunge-e-direct z-50';
        } else {
          animClass = 'animate-lunge-e-straight z-50';
        }
      } else {
        if (dir === 'left') {
          animClass = 'animate-lunge-p-left z-50';
        } else if (dir === 'right') {
          animClass = 'animate-lunge-p-right z-50';
        } else if (options.isAirborneAttack) {
          animClass = 'animate-lunge-p-airborne z-50';
        } else if (options.isDirectAttack) {
          animClass = 'animate-lunge-p-direct z-50';
        } else {
          animClass = 'animate-lunge-p-straight z-50';
        }
      }
    } else if (options?.isZeroPowerShaking) {
      animClass = 'animate-zero-power-shake z-45';
	} else if (options?.isSacrificing) {
      animClass = 'animate-sacrifice-collapse z-40';
    } else if (options?.isDestroyed) {
      animClass = 'animate-destroy-dissolve z-40';
    } else if (options?.isDamaged) {
      animClass = 'animate-damage-shake z-45';
    } else if (options?.isSigilJittering) {
      animClass = 'animate-sigil-jitter z-45';
    } else if (isSummoning) {
      animClass = 'animate-summon-wipe';
   } else if (options?.isDroppingQueue) {
      animClass = 'card-dropping-queue';
    }

    // Check if card is flipping through an evolution sequence
    const isPlayerCard = !options?.isOpponent;
    const activeEvolve = laneIndex !== undefined && !options?.isQueue
      ? evolvingCards.find(e => e.isPlayer === isPlayerCard && e.lane === laneIndex)
      : null;
    if (activeEvolve && activeEvolve.phase === 'up') {
      animClass = 'animate-flip-up z-40';
    }

    if (options?.isDefending && !options?.isDamaged) {
      borderStyle += ' ring-2 ring-red-600/70 shadow-[0_0_15px_rgba(239,68,68,0.7)]';
    }

    const cardStyle: React.CSSProperties = lateralDelta !== undefined ? {
        transform: `translateX(calc((100% + 0.5rem) * ${lateralDelta}))`,
        transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        zIndex: 35,
      } : {};

    // Resurface animation plays strictly when entering owner's turn phase, never during combat
    const waterborneClass =
      isWaterborne &&
      !isSubmergedActive &&
      laneIndex !== undefined &&
      !options?.isOpponent &&
      phase === 'DRAW'
        ? 'animate-flip-up'
        : '';

    // Decoupled hover transform: hand cards can inspect/zoom, but board cards remain planted on the table
      const shouldHover = options?.isClickable !== false && !options?.disableHoverScale && !options?.isOpponent && !options?.isSelected && laneIndex === undefined;
	  
    // Aged cardboard pulp texture with radial grain and inner rim burn
    let parchmentGradient = 'radial-gradient(circle at 50% 30%, #d8b88a 0%, #c29e6b 70%, #9e7b4c 100%)';
    let parchmentShadow = 'inset 0 0 10px rgba(45, 25, 10, 0.5), inset 0 0 2px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.75)';

    // Cards flip face-down showing strictly the raw card back asset (Waterborne or evolving Phase 1)
    const isMassiveEvolvingFaceDown = laneIndex !== undefined && !options?.isQueue
      ? evolvingCards.some(e => e.isPlayer === !options?.isOpponent && e.lane === laneIndex && e.phase === 'down')
      : false;

    if (isSubmergedActive || isMassiveEvolvingFaceDown) {
      parchmentGradient = 'radial-gradient(circle at 50% 30%, #87a7ab 0%, #5d878e 70%, #3f656b 100%)';
      parchmentShadow = 'inset 0 0 10px rgba(25, 55, 60, 0.6), inset 0 0 2px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.75)';
    } else if (card.isSacrifice && card.name !== 'Squirrel') {
      parchmentGradient = 'radial-gradient(circle at 50% 30%, #caa885 0%, #b08a5f 70%, #856138 100%)';
      parchmentShadow = 'inset 0 0 10px rgba(45, 25, 10, 0.6), inset 0 0 2px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.75)';
    } else if (card.isGoobertClone) {
      parchmentGradient = 'radial-gradient(circle at 50% 30%, #b8caa0 0%, #90aa6e 70%, #6e884d 100%)';
      parchmentShadow = 'inset 0 0 10px rgba(56, 79, 34, 0.5), inset 0 0 2px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.75)';
    } else if (card.isMycologistCombined) {
      parchmentGradient = 'radial-gradient(circle at 50% 30%, #ceb6d2 0%, #aa81b2 70%, #83568c 100%)';
      parchmentShadow = 'inset 0 0 10px rgba(75, 40, 82, 0.5), inset 0 0 2px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.75)';
    } else if (options?.isOpponent) {
      parchmentGradient = 'radial-gradient(circle at 50% 30%, #c5a786 0%, #ad8861 70%, #8a643d 100%)';
      parchmentShadow = 'inset 0 0 10px rgba(45, 25, 10, 0.5), inset 0 0 2px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.75)';
    }

    const cardCombinedStyle: React.CSSProperties = {
      background: parchmentGradient,
      boxShadow: parchmentShadow,
    };

    // Display all active sigils (dynamically scaled up to 8 medallions)
    const allSigils = card.sigils || [];
    const displaySigils = allSigils.slice(0, 8);

    // Full pre-rendered massive card bypass (Blood Moon)
    const isBloodMoon =
      card.name?.toLowerCase().includes('moon') ||
      card.id?.toLowerCase().includes('moon');

    if (isBloodMoon) {
      return (
        <div
          key={card.id || `${card.name}-${options?.laneIndex ?? 0}`}
          onClick={() => onClickRef.current?.()}
          style={cardStyle}
          className={`relative inline-block w-[112px] h-[160px] shrink-0 select-none ${
            options?.onClick || options?.isClickable ? 'cursor-pointer' : ''
          } ${options?.customScale || ''}`}
        >
          <div
            className={`relative w-full h-full box-border rounded-sm select-none overflow-visible bg-cover bg-center transform-gpu origin-bottom ${
              shouldHover
                ? 'transition-transform duration-200 ease-out will-change-transform hover:scale-105 hover:-translate-y-2 hover:z-30 cursor-pointer'
                : 'transition-transform duration-200 ease-out'
            } ${borderStyle} ${animClass}`}
            style={{
              backgroundImage: `url(${BASE}/assets/cardbases/blood_moon.webp)`,
              backgroundSize: '100% 100%',
            }}
          >
            {/* Blood Moon Sigil Array with Hover Zoom (No Modal Tooltip) */}
            <div className="absolute bottom-[22%] left-0 right-0 flex items-center justify-center gap-1 px-1 z-30 pointer-events-auto">
              {(card.sigils || []).map((sigil: any, idx: number) => {
                const sigilName = typeof sigil === 'string' ? sigil : sigil?.name || '';
                const iconSrc = typeof sigil === 'object' && sigil?.icon
                  ? sigil.icon
                  : getSigilArtUrl(sigilName);

                return (
                  <div
                    key={`${sigilName}-${idx}`}
                    title={`${sigilName}: ${SIGIL_DESCRIPTIONS[sigilName] || 'A dark, inscrutable power.'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSigilDetailModal({
                        name: sigilName,
                        desc: SIGIL_DESCRIPTIONS[sigilName] || 'A dark, inscrutable power.',
                      });
                    }}
                    className="relative z-10 transition-transform duration-150 ease-out hover:scale-135 active:scale-125 hover:z-40 origin-center cursor-pointer drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] touch-manipulation"
                  >
                    <img
                      src={iconSrc}
                      alt={sigilName}
                      loading="eager"
                      decoding="async"
                      className="w-[22px] h-[22px] object-contain select-none pointer-events-none"
                      onError={(e) => {
                        // Fallback to text icon if PNG asset path differs
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'block';
                        }
                      }}
                    />
                    <span className="hidden text-xs filter sepia-[0.8] select-none pointer-events-none">
                      {(typeof (window as any).SIGIL_MAPPING !== 'undefined' && (window as any).SIGIL_MAPPING[sigilName]) || '⭐'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Health Socket for Blood Moon */}
            <div className="absolute bottom-[6.5%] right-[5%] w-[23%] h-[16%] flex items-center justify-center pointer-events-none z-20">
              <span className="font-['Cinzel',_serif] font-black text-sm leading-none text-red-500 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {card.health}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Cards flip face-down showing strictly the raw card back asset (Waterborne or evolving Phase 1)
    const isEvolvingFaceDown = laneIndex !== undefined && !options?.isQueue
      ? evolvingCards.some(e => e.isPlayer === !options?.isOpponent && e.lane === laneIndex && e.phase === 'down')
      : false;

    if (isSubmergedActive || isEvolvingFaceDown) {
      return (
        <div
          key={`${card.id || card.name}-submerged-${options?.laneIndex ?? laneIndex ?? 0}`}
          onClick={() => onClickRef.current?.()}
          style={cardStyle}
          className={`relative inline-block w-[112px] h-[160px] shrink-0 select-none ${
            options?.onClick || options?.isClickable ? 'cursor-pointer' : ''
          } ${options?.customScale || ''}`}
        >
          <div
            className={`relative w-full h-full box-border rounded-sm select-none bg-contain bg-no-repeat bg-center overflow-hidden transform-gpu origin-bottom animate-flip-down ${
              shouldHover
                ? 'transition-transform duration-200 ease-out will-change-transform hover:scale-105 hover:-translate-y-2 hover:z-30 cursor-pointer'
                : 'transition-transform duration-200 ease-out'
            } ${borderStyle} ${animClass}`}
            style={{
              backgroundImage: `url(${BASE}/assets/cardbases/cardbacks.png)`,
              backgroundSize: '100% 100%',
            }}
          />
        </div>
      );
    }

    // Determine the appropriate card base texture
    const activeCardBase = card.isMycologistCombined
      ? `${BASE}/assets/cardbases/combined-card-base.png`
      : card.isGoobertClone
        ? `${BASE}/assets/cardbases/duplicate-card-base.png`
        : hasMoreSigilsThanOriginal(card)
          ? `${BASE}/assets/cardbases/bestowed-card-base.png`
          : `${BASE}/assets/cardbases/card_base.png`;

    return (
      <div
        key={card.id || `${card.name}-${options?.laneIndex ?? 0}`}
        onClick={() => onClickRef.current?.()}
        style={cardStyle}
        className={`relative inline-block w-[112px] h-[160px] shrink-0 select-none ${
          options?.onClick || options?.isClickable ? 'cursor-pointer' : ''
        } ${options?.customScale || ''}`}
      >
        <div
            className={`relative w-full h-full box-border select-none bg-contain bg-no-repeat bg-center ${
              animClass
                ? 'transition-none'
                : shouldHover
                  ? 'transition-transform duration-200 ease-out will-change-transform hover:scale-105 hover:-translate-y-2 hover:z-30 cursor-pointer'
                  : 'transition-transform duration-200 ease-out'
            } ${borderStyle} ${animClass} ${waterborneClass}`}
            style={{
              backgroundImage: `url(${activeCardBase})`,
              backgroundSize: '100% 100%',
            }}
          >
          {/* --- TOP HEADER (8% - 18%) --- */}
          {/* Bone Cost: Top Left (Shifted down to clear header text into the arch shoulder) */}
            {options?.showCost !== false && card.boneCost !== undefined && card.boneCost > 0 && (
              <div className="absolute top-[14.5%] left-[6.5%] flex flex-col items-center justify-center pointer-events-none z-10 leading-none">
                <span className="text-[10px] leading-none filter brightness-75 select-none">🦴</span>
                <span
                  className="text-[10px] font-black font-mono tracking-tighter leading-none mt-0.5 select-none"
                  style={{
                    color: '#0f0e0c',
                    WebkitTextFillColor: '#0f0e0c',
                    textShadow: 'none',
                  }}
                >
                  {card.boneCost}
                </span>
              </div>
            )}

            {/* Card Name: Center Header (Rich charcoal grey, retaining heavy stroke & depth) */}
            <div className="absolute top-[6.2%] left-[6.5%] right-[10.5%] h-[20px] flex items-center justify-center overflow-hidden pointer-events-none z-10">
              <span
                style={{
                  color: '#262422',
                  WebkitTextFillColor: '#262422',
                  WebkitTextStroke: '0.35px #262422',
                  textShadow: '0 1px 1px rgba(0, 0, 0, 0.3)',
                  fontWeight: 900,
                }}
                className={`font-['Cinzel',_serif] font-black uppercase text-center whitespace-nowrap leading-none pointer-events-none select-none ${
                  card.name.length >= 15
                    ? 'text-[8px] tracking-[-0.06em]'
                    : card.name.length >= 13
                    ? 'text-[9px] tracking-[-0.04em]'
                    : card.name.length >= 11
                    ? 'text-[9.5px] tracking-[-0.03em]'
                    : card.name.length >= 9
                    ? 'text-[11px] tracking-[-0.01em]'
                    : card.name.length >= 7
                    ? 'text-[12px] tracking-normal'
                    : 'text-[13px] tracking-[0.01em]'
                }`}
              >
                {card.name}
              </span>
            </div>

          {/* Blood Cost: Vertical Stack Top Right (extra clearance between 2nd & 3rd drops) */}
          {options?.showCost !== false && card.cost !== undefined && card.cost > 0 && (
            <div className="absolute top-[8%] right-[7%] flex flex-col items-center pointer-events-none z-10">
              {Array.from({ length: card.cost }).map((_, i) => (
                <span
                  key={i}
                  className={`text-red-700 text-[10px] leading-[9px] filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] select-none ${
                    i === 2 ? 'mt-[2px]' : ''
                  }`}
                >
                  🩸
                </span>
              ))}
            </div>
          )}

         {/* --- ARCH WINDOW (Aligned to updated card_base.png stone recess) --- */}
          <div className="absolute top-[21%] left-[19%] w-[62%] h-[46.5%] rounded-t-full flex items-center justify-center overflow-hidden pointer-events-none z-10">
            <img
              src={getCardArtUrl(card)}
              alt={card.name}
              loading="eager"
              decoding="async"
              fetchPriority={options?.isOpponent ? 'high' : 'auto'}
              className={`max-w-[92%] max-h-[92%] w-auto h-auto object-contain pointer-events-none select-none transition-transform ${
                CARD_ART_OFFSETS[card.name] || ''
              } ${(() => {
                const hasMovementCrest = Boolean(
                  card.sigils?.some(s => s === 'Sprinter' || s === 'Hefty' || s === 'Rampager')
                );
                
                // Never flip in hand, deck inspection, or outside the combat lanes
                if (!hasMovementCrest || options?.laneIndex === undefined) {
                  return card.isMycologistCombined ? 'scale-110' : '';
                }

                const isLeftFacingBase = isLeftFacingCard(card.name);

                // If sprintDir is unset (freshly played), default to natural facing unless dropped on its facing edge
                const defaultDir = isLeftFacingBase
                  ? (options.laneIndex === 0 ? 1 : -1)
                  : (options.laneIndex === 3 ? -1 : 1);
                const currentDir = card.sprintDir ?? defaultDir;

                // Left-facing art mirrors when moving RIGHT (+1); right-facing art mirrors when moving LEFT (-1)
                const shouldFlip = isLeftFacingBase ? currentDir === -1 : currentDir === 1;

                if (shouldFlip) {
                  return card.isMycologistCombined ? '-scale-x-110 scale-y-110' : '-scale-x-100';
                }
                return card.isMycologistCombined ? 'scale-110' : '';
              })()}`}
              style={{
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
                scale: isCardNamed(card.name, 'Caiman') && ((card as any).caimanPermHpGained || 0) >= 1
                  ? String(1 + Math.min((card as any).caimanPermHpGained || 0, 6) * 0.1)
                  : undefined,
              }}
              draggable={false}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const literalSlug = toAssetSlug(card.name);
                const literalUrl = `${BASE}/assets/cardart/${literalSlug}.png`;

                // If the alias lookup failed, try the raw name before giving up
                if (!img.dataset.triedLiteral && img.src !== literalUrl) {
                  img.dataset.triedLiteral = 'true';
                  img.src = literalUrl;
                  return;
                }

                img.style.display = 'none';
                if (img.parentElement) {
                  const fallback = document.createElement('span');
                  fallback.className = 'text-3xl select-none flex items-center justify-center';
                  fallback.innerText = card.emoji;
                  img.parentElement.appendChild(fallback);
                }
              }}
            />
          </div>
          {/* --- ACTIVE SIGIL CRESTS (Large centered #1 between stats; flanking arc in 4 - 2 - 1 - 3 - 5 order) --- */}
            <div className="absolute inset-0 z-20 pointer-events-none">
            {displaySigils.map((s, idx) => {
              // Anchor positions (left%, top%) on 112x160 card:
              // 0 -> #1 center lower; 1 -> #2 upper-left; 2 -> #3 upper-right; 3 -> #4 far-left; 4 -> #5 far-right
              const spreadPair = displaySigils.length === 2 || displaySigils.length === 3;
              const crestSlots: Array<{ left: string; top: string; size: string; z: string }> = [
                { left: '50%', top: displaySigils.length === 1 ? '81%' : '83.5%', size: 'w-[30px] h-[30px]', z: 'z-30' },
                { left: spreadPair ? '28.5%' : '31%', top: '76%', size: 'w-[19px] h-[19px]', z: 'z-20' },
                { left: spreadPair ? '71.5%' : '69%', top: '76%', size: 'w-[19px] h-[19px]', z: 'z-20' },
                { left: '15%', top: '73.5%', size: 'w-[17px] h-[17px]', z: 'z-20' },
                { left: '85%', top: '73.5%', size: 'w-[17px] h-[17px]', z: 'z-20' },
                { left: '15%', top: '59.5%', size: 'w-[15px] h-[15px]', z: 'z-20' },
                { left: '85%', top: '59.5%', size: 'w-[15px] h-[15px]', z: 'z-20' },
                { left: '50%', top: '67.5%', size: 'w-[15px] h-[15px]', z: 'z-20' },
              ];
              const slot = crestSlots[idx] || crestSlots[crestSlots.length - 1];
              const medallionSizeClass = slot.size;

              const isOnField = options?.laneIndex !== undefined && !options?.isQueue;
                const isArmorSigil = s === 'Armored';
                const isArmorBroken = isArmorSigil && Boolean(card.shieldBroken) && isOnField;
                const isArmorActive = isArmorSigil && !card.shieldBroken && isOnField;

                const armorTitle = isArmorActive
                  ? "Armored (Active): Negates the next instance of damage taken."
                  : isArmorBroken
                  ? "Armored (Broken): Armor was shattered; absorbs no further damage."
                  : `${s}: ${SIGIL_DESCRIPTIONS[s] || ''}`;

                const medallionBorderClass = isArmorActive
                  ? 'border-amber-400/90 bg-[#2b1d11] shadow-[0_0_8px_rgba(251,191,36,0.65),inset_0_1px_2px_rgba(255,255,255,0.25)]'
                  : isArmorBroken
                  ? 'border-stone-800 bg-[#120e0c] opacity-35 grayscale shadow-none'
                  : 'bg-[#1c1815] border-[#3d271d] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]';

                return (
                  <div
                    key={`sigil-${s}-${idx}`}
                    title={armorTitle}
                    style={{ left: slot.left, top: slot.top }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSigilDetailModal({
                        name: s,
                        desc: isArmorSigil ? armorTitle : (SIGIL_DESCRIPTIONS[s] || 'A dark, inscrutable power.'),
                      });
                    }}
                    className={`${medallionSizeClass} ${slot.z} absolute -translate-x-1/2 -translate-y-1/2 shrink-0 rounded-full border flex items-center justify-center overflow-hidden pointer-events-auto cursor-pointer transition-transform duration-150 ease-out hover:scale-135 active:scale-125 hover:z-40 origin-center drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)] touch-manipulation ${medallionBorderClass}`}
                  >
                    <img
                      src={getSigilArtUrl(s)}
                      alt={s}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          const fallback = document.createElement('span');
                          fallback.className = `${idx === 0 ? 'text-[12px]' : idx <= 2 ? 'text-[9px]' : 'text-[8px]'} leading-none`;
                          fallback.innerText = SIGIL_MAPPING[s] || '•';
                          target.parentElement.appendChild(fallback);
                        }
                      }}
                    />
                    {isArmorBroken && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <span className="text-[12px] font-black text-red-600/90 leading-none drop-shadow-[0_1px_1px_#000]">
                          ✕
                        </span>
                      </div>
                    )}
                  </div>
                );
            })}
          </div>

          {/* --- BOTTOM STAT SOCKETS (Centered inside stone wells at 87%) --- */}
          {!isCardNamed(card.name, 'Trade Pelt') && (
            <>
          {/* Attack (Left Medallion) */}
          <div className="absolute bottom-[3.5%] left-[4.5%] w-[23%] h-[16%] flex items-center justify-center pointer-events-none z-20">
            <span
              style={hasShadow ? undefined : { textShadow: '0 2px 3px rgba(0,0,0,1), 0 1px 1px rgba(0,0,0,1), 0 0 5px rgba(0,0,0,0.95)' }}
              className={`font-['Cinzel',_serif] font-black text-sm leading-none pointer-events-none ${
                hasShadow
                  ? 'text-purple-950 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]'
                  : !hasShadow && (isStinkyDebuffed || isDebuffed)
                  ? 'text-red-700 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                  : isBuffed
                  ? 'text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                  : 'text-stone-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
              }`}
            >
              {displayAttack}
            </span>
          </div>

          {/* Health (Right Medallion) - wrapped in a protective gold ring only while Armor is active on the field */}
            <div
              className={`absolute bottom-[3.5%] right-[4.5%] w-[23%] h-[16%] rounded-full flex items-center justify-center pointer-events-none z-20 transition-all duration-200 ${
                options?.laneIndex !== undefined && !options?.isQueue && card.sigils?.includes('Armored') && !card.shieldBroken
                  ? 'ring-2 ring-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.55)]'
                  : ''
              }`}
            >
            <span
              style={hasShadow ? undefined : { textShadow: '0 2px 3px rgba(0,0,0,1), 0 1px 1px rgba(0,0,0,1), 0 0 5px rgba(0,0,0,0.95)' }}
              className={`font-['Cinzel',_serif] font-black text-sm leading-none pointer-events-none ${
                hasShadow
                  ? 'text-purple-950 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]'
                  : options?.isHpFlashing
                  ? 'hp-flash text-red-600 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                  : card.health < (ALL_CARD_LOOKUP[card.name]?.health ?? card.health)
                  ? 'text-red-600 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                  : 'text-stone-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
              }`}
            >
              {card.health}
            </span>
          </div>
            </>
          )}
        </div>
      </div>
    );
}

function shallowSigilsEqual(a?: string[], b?: string[]): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function cardsVisuallyEqual(a: CardDef | null, b: CardDef | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.attack === b.attack &&
    a.health === b.health &&
    a.cost === b.cost &&
    (a as any).costType === (b as any).costType &&
    (a as any).bloodCost === (b as any).bloodCost &&
    (a as any).boneCost === (b as any).boneCost &&
    a.class === b.class &&
    (a as any).isMycologistCombined === (b as any).isMycologistCombined &&
    (a as any).hasEvolved === (b as any).hasEvolved &&
    (a as any).isTransformed === (b as any).isTransformed &&
    (a as any).caimanBonusHp === (b as any).caimanBonusHp &&
    (a as any).caimanPermHpGained === (b as any).caimanPermHpGained &&
    (a as any).permanentHealthBonus === (b as any).permanentHealthBonus &&
    (a as any).artOverride === (b as any).artOverride &&
    (a as any).facing === (b as any).facing &&
    shallowSigilsEqual(a.sigils, b.sigils)
  );
}

function optionsVisuallyEqual(a?: RenderCardOptions, b?: RenderCardOptions): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.isSelected === b.isSelected &&
    a.isMarkedSacrifice === b.isMarkedSacrifice &&
    a.isOpponent === b.isOpponent &&
    a.laneIndex === b.laneIndex &&
    a.isClickable === b.isClickable &&
    a.customScale === b.customScale &&
    a.showCost === b.showCost &&
    a.isAttacking === b.isAttacking &&
    a.attackDirection === b.attackDirection &&
    a.isAirborneAttack === b.isAirborneAttack &&
    a.isDirectAttack === b.isDirectAttack &&
    a.isDamaged === b.isDamaged &&
    a.isDestroyed === b.isDestroyed &&
    a.isSacrificing === b.isSacrificing &&
    a.isSigilJittering === b.isSigilJittering &&
    a.isHpFlashing === b.isHpFlashing &&
    a.isDroppingQueue === b.isDroppingQueue &&
    a.isDefending === b.isDefending &&
    a.isZeroPowerShaking === b.isZeroPowerShaking &&
    a.isQueue === b.isQueue &&
    a.disableHoverScale === b.disableHoverScale
  );
}

const CardView = React.memo(CardViewInner, (prev, next) => {
  if (!cardsVisuallyEqual(prev.card, next.card)) return false;
  if (!optionsVisuallyEqual(prev.options, next.options)) return false;
  if (prev.screen !== next.screen) return false;
  if (prev.evolvePhase !== next.evolvePhase) return false;
  if (prev.isSummoningFlag !== next.isSummoningFlag) return false;
  if (prev.lateralDeltaVal !== next.lateralDeltaVal) return false;

  // Only care about phase/totems/boards when on the DUEL screen
  if (next.screen === 'DUEL') {
    if (prev.phase !== next.phase) return false;
    if (next.options?.isOpponent) {
      if (prev.bossTotem !== next.bossTotem) return false;
    } else {
      if (prev.activeTotem !== next.activeTotem) return false;
    }
    // Board changes only matter for cards actually sitting in a lane (aura/stinky/leader buffs)
    if (next.options?.laneIndex !== undefined) {
      if (prev.playerBoard !== next.playerBoard || prev.enemyBoard !== next.enemyBoard) return false;
    }
  }
  return true;
});

export default CardView;
