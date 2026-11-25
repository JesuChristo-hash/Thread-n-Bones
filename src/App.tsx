/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, type JSX } from 'react';

import MapScreen from './components/MapScreen';
import { TalismanEye, BattleTransitionOverlay, SmokeTransitionOverlay } from './components/TransitionOverlays';
import { isCardNamed, getStageBgClass, applyBegottenStamp, buildStrikeTargets, isLeftFacingCard, calculateGrade, isStarterDraftEligible, getBaseSigilCount, hasMoreSigilsThanOriginal, getBloodToBoneCost, canAnvilBloodToBone, canAnvilHollow } from './engine/gameRules';
export { getStageBgClass };
import CardView, { type RenderCardOptions } from './components/CardView';
import ActWeather from './components/ActWeather';
import DuelTelemetryBanner, { BloodBankVessel, BoneOssuaryPlaque } from './components/DuelTelemetryBanner';
const DevMenuScreen = React.lazy(() => import('./components/DevMenuScreen'));
const GameOverScreen = React.lazy(() => import('./components/GameOverScreen'));
const SplashScreen = React.lazy(() => import('./components/SplashScreen'));
const DeckSelectScreen = React.lazy(() => import('./components/DeckSelectScreen'));
const EventScreens = React.lazy(() => import('./components/EventScreens'));
import { ActMapData, MapNode, generateActMap, getBossForAct, getOrInitBossOrder } from './data/mapGenerator';
import {
  RITUAL_VOWS,
  RITUAL_VOW_MAP,
  createSeededRng,
  generateRandomSeed,
  normalizeSeed,
  type VowId,
} from './utils/seededRng';

import {
  Skull,
  Flame,
  Sparkles,
  RefreshCw,
  Search,
  BookOpen,
  Wrench,
  X,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  Award,
  ChevronRight,
  Eye,
  Info,
  ChevronDown,
  Layers,
  HelpCircle,
  RotateCcw,
  Menu,
  Bell
} from 'lucide-react';

import {
  Tribe,
  CardInstance,
  TRIBE_ICONS,
  CardDef,
  Totem,
  GamePhase,
  ScreenState,
  RunStats,
  BossType,
  BossCombatState,
  BASE,
  discordGif,
  toAssetSlug,
  getCardArtUrl,
  CARD_ART_OFFSETS,
  getSigilArtUrl,
  getBackgroundUrl,
  getArenaBackground,
  getScreenBgStyle,
  SIGIL_MAPPING,
  SIGIL_DESCRIPTIONS,
  TOKEN_SQUIRREL,
  TOKEN_RABBIT,
  TOKEN_CHIME,
  TOKEN_DAM,
  TOKEN_TAIL,
  TOKEN_VERTIBRAE,
  getTutorialDialoguePosition,
  TRIBE_EMBROIDERY,
  TOKEN_PELT,
  TOKEN_BEE,
  CARD_STONE_WALL,
  CARD_FELLED_TREE,
  CARD_GRIZZLY,
  MAIN_DECK_POOL,
  ALL_CARD_LOOKUP,
  CARD_FLAMING_SKELETON,
  ItemId,
  ItemDef,
  ALL_ITEMS,
  BOSS_EXCLUSIVE_CARDS,
  preloadCoreAssets,
  EvolutionTarget,
  EVOLUTION_MAP,
  WOODCARVER_BOSS_TOTEM_SIGILS,
  ENEMY_EXCLUDED_CARD_NAMES,
  ENEMY_MAIN_DECK_POOL,
  EVENT_EXCLUDED_CARD_NAMES,
  EVENT_CARD_POOL,
  RARE_CARD_POOL,
  BossDialogueSet,
  BOSS_DIALOGUES,
  generateCardId,
  cloneCard,
  transformAmorphous,
  applyPlayerTotem
} from './data/gameData';

// --- Built-in Chiptune Audio Synthesizer ---


import { ChiptuneAudio, playSound, getAudioEngine, type SoundEffectType } from './audio/ChiptuneAudio';
import { loadArchive, recordBossVictory, recordDiscoveredCards, recordRunCompletion, resetArchive, type PersistentArchive } from './data/archive';
import { ArchiveModal } from './components/ArchiveModal';
const chiptuneAudio = ChiptuneAudio;


// --- Diegetic Talisman Watcher Eye (Tracks Cursor via Direct DOM Transform) ---
const DISCORD_LOCK = {
  salt: "cce1168b088e90691675f91b195bfab1",
  iv: "c665a153f1cd6939973c66d5",
  data: "2ca5dfac6d42da6d5dea6ad952b9e0b42a5bb4a31e128b766ee46e35fef657d2cbd4988663839372d713b34b533b91a6ec078b68e4c3d701"
};

async function unlockSecretUrl(passcode: string): Promise<string | null> {
  try {
    const fromHex = (hex: string) => new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const enc = new TextEncoder();
    const salt = fromHex(DISCORD_LOCK.salt);
    const iv = fromHex(DISCORD_LOCK.iv);
    const data = fromHex(DISCORD_LOCK.data);

    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(passcode),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const key = await window.crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

export default function App() {
  // Preload all art and backgrounds generated at build time
  useEffect(() => {
    fetch('/asset-manifest.json')
      .then(res => res.json())
      .then((files: string[]) => {
        files.forEach(file => {
          const img = new Image();
          img.src = file.startsWith('/') ? file : `/${file}`;
        });
      })
      .catch(() => {});
  }, []);

  // --- Game Flow & Navigation ---
  const [screen, setScreenRaw] = useState<ScreenState>('SPLASH');
  const [logs, setLogs] = useState<string[]>(['> System initialized. Awaiting lineage selection...']);
  const [showPauseMenu, setShowPauseMenu] = useState<boolean>(false);
  const [archive, setArchive] = useState<PersistentArchive>(() => loadArchive());
  const isForcedDevBossRef = useRef<boolean>(false);
  const [devConfirmWipeArchive, setDevConfirmWipeArchive] = useState<boolean>(false);
  const [archiveModalTab, setArchiveModalTab] = useState<'COMPENDIUM' | 'LEDGER' | null>(null);
  const recordedGameOverRef = useRef<boolean>(false);
  const [selectedLineage, setSelectedLineage] = useState<string | null>(null);
  const [showAudioSettings, setShowAudioSettings] = useState<boolean>(false);
  const chiptuneAudio = ChiptuneAudio;
  const [previousScreen, setPreviousScreen] = useState<ScreenState>('DUEL');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  // --- Cryptographic Discord Gate State ---
  const [showDiscordPrompt, setShowDiscordPrompt] = useState(false);
  const [discordInput, setDiscordInput] = useState('');
  const [discordError, setDiscordError] = useState(false);
  const [unlockedDiscordUrl, setUnlockedDiscordUrl] = useState<string | null>(() => {
    return sessionStorage.getItem('sacrificial_discord_unlocked');
  });

  const [showDevTools, setShowDevTools] = useState(false);
  const [devTapCount, setDevTapCount] = useState(0);
  const devTapTimerRef = useRef<number | null>(null);

  const handleSecretDevTap = () => {
    if (devTapTimerRef.current) clearTimeout(devTapTimerRef.current);
    const nextCount = devTapCount + 1;
    if (nextCount >= 5) {
      setShowDevTools(prev => !prev);
      setDevTapCount(0);
    } else {
      setDevTapCount(nextCount);
      devTapTimerRef.current = window.setTimeout(() => setDevTapCount(0), 2000);
    }
  };
  const handleDiscordClick = (e: React.MouseEvent) => {
    if (unlockedDiscordUrl) return;
    e.preventDefault();
    setShowDiscordPrompt(true);
  };

  const handleAttemptUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = await unlockSecretUrl(discordInput.trim());
    if (url) {
      setUnlockedDiscordUrl(url);
      sessionStorage.setItem('sacrificial_discord_unlocked', url);
      setShowDiscordPrompt(false);
      setDiscordError(false);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setDiscordError(true);
      setDiscordInput('');
    }
  };

  // Atmospheric Occult Black Smoke Transition State
  const screenStageRef = useRef<HTMLDivElement>(null);
  const prevScreenRef = useRef<ScreenState>('SPLASH');
  const [smokePhase, setSmokePhase] = useState<'IDLE' | 'IN' | 'OUT'>('IDLE');
  const [battleWipePhase, setBattleWipePhase] = useState<'IDLE' | 'IN' | 'OUT'>('IDLE');
  const [menuFadingOut, setMenuFadingOut] = useState<boolean>(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const battleWipeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBattleWipeAtRef = useRef<number>(0);
  const menuFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerBattleWipe = useCallback(() => {
    const now = Date.now();
    if (now - lastBattleWipeAtRef.current < 900) return;
    lastBattleWipeAtRef.current = now;

    if (battleWipeTimerRef.current) clearTimeout(battleWipeTimerRef.current);
    setBattleWipePhase('IN');
    battleWipeTimerRef.current = setTimeout(() => {
      setBattleWipePhase('OUT');
      battleWipeTimerRef.current = setTimeout(() => {
        setBattleWipePhase('IDLE');
      }, 500);
    }, 460);
  }, []);

  const isMenuScreen = (s: ScreenState) =>
    s === 'VIEW_DECK' || s === 'DEV_MENU' || s === 'EVENT_HOARDER_SEARCH';

  const setScreen = useCallback((next: ScreenState | ((prev: ScreenState) => ScreenState)) => {
    const current = prevScreenRef.current;
    const nextVal = typeof next === 'function' ? next(current) : next;
    if (nextVal === current) return;

    // Save previous screen only when leaving active gameplay
    if (!isMenuScreen(current)) {
      setPreviousScreen(current);
    }

    // Closing a menu back to gameplay: fade out before unmounting
    if (isMenuScreen(current) && !isMenuScreen(nextVal)) {
      setMenuFadingOut(true);
      if (menuFadeTimerRef.current) clearTimeout(menuFadeTimerRef.current);
      menuFadeTimerRef.current = setTimeout(() => {
        setMenuFadingOut(false);
        prevScreenRef.current = nextVal;
        setScreenRaw(nextVal);
      }, 200);
      return;
    }

    const isConsecutiveDuel = current === 'DUEL' && nextVal === 'DUEL';
    const isSplash = nextVal === 'SPLASH';
    const isMenuTransition = isMenuScreen(current) || isMenuScreen(nextVal);

    // Suppress heavy transition for fast menus or splash screen
    if (!isConsecutiveDuel && !isSplash && !isMenuTransition) {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

      // Phase 1 (550ms): Soft volumetric smoke clouds roll inward from flanks
      setSmokePhase('IN');
      triggerSfx('whoosh');

      transitionTimerRef.current = setTimeout(() => {
        // Phase 2: Mount new screen safely behind pitch-black smoke blanket
        prevScreenRef.current = nextVal;
        setScreenRaw(nextVal);

        // Phase 3 (180ms hold): Allows card art and textures to paint completely
        transitionTimerRef.current = setTimeout(() => {
          setSmokePhase('OUT');

          // Phase 4 (600ms): Smoke lifts and dissipates away
          transitionTimerRef.current = setTimeout(() => {
            setSmokePhase('IDLE');
          }, 600);
        }, 180);
      }, 550);
    } else {
      if (isConsecutiveDuel) {
        triggerBattleWipe();
      }
      setSmokePhase('IDLE');
      prevScreenRef.current = nextVal;
      setScreenRaw(nextVal);
    }
  }, [triggerBattleWipe]);

  // --- Campaign / Run State ---
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sacrificial_scales_tutorial_done') === 'true';
    } catch {
      return true;
    }
  });
  const [isTutorialGlitching, setIsTutorialGlitching] = useState<boolean>(false);
  const [isTutorialDuel, setIsTutorialDuel] = useState<boolean>(false);
  const [dialogueQueue, setDialogueQueue] = useState<string[]>([]);
  const [dialogueTotalSteps, setDialogueTotalSteps] = useState<number>(1);
  const [tutorialSacrificeTriggered, setTutorialSacrificeTriggered] = useState<boolean>(false);
  const [tutorialQueueTriggered, setTutorialQueueTriggered] = useState<boolean>(false);
  const [tutorialTurn2Triggered, setTutorialTurn2Triggered] = useState<boolean>(false);
  const [encounter, setEncounter] = useState<number>(1);
  const [duelsCompleted, setDuelsCompleted] = useState<number>(0);
  const [stage, setStage] = useState<number>(1);
  const [level, setLevel] = useState<number>(1);
  const [currentStageName, setCurrentStageName] = useState<string>('Forgotten Graveyard');
  const [ouroborosBuffs, setOuroborosBuffs] = useState<number>(0);
  const [startingBones, setStartingBones] = useState<number>(0);
  const startingBonesRef = useRef<number>(0);
  useEffect(() => {
    startingBonesRef.current = startingBones;
  }, [startingBones]);
  const [totemPieces, setTotemPieces] = useState<Array<{ type: 'head' | 'body'; value: string }>>([]);
  const [activeTotem, setActiveTotem] = useState<Totem>({ head: null, body: null });
  const [masterDeck, setMasterDeck] = useState<CardDef[]>([]);
  const masterDeckRef = useRef<CardDef[]>([]);
  const [consecutiveOneTurnWins, setConsecutiveOneTurnWins] = useState<number>(0);
  const [otkCooldown, setOtkCooldown] = useState<number>(0);
  const [permanentScaleDebuff, setPermanentScaleDebuff] = useState<number>(0);
  const [pendingBossGrizzlyWall, setPendingBossGrizzlyWall] = useState<boolean>(false);
  const [isGrizzlyShaking, setIsGrizzlyShaking] = useState<boolean>(false);
  const [grizzlyWallActiveInDuel, setGrizzlyWallActiveInDuel] = useState<boolean>(false);
  useEffect(() => {
    masterDeckRef.current = masterDeck;
  }, [masterDeck]);
  useEffect(() => {
  }, []);

  // Hidden Run Statistics Trackers
  const [runStats, setRunStats] = useState<RunStats>({
    bossesDefeated: 0,
    scaleDamageDealt: 0,
    scaleDamageTaken: 0,
    cardsSacrificed: 0,
    enemyCardsDestroyed: 0,
    grizzlyWallsSurvived: 0,
    clearedStages: 0,
    finalBossesDefeated: 0,
  });
  const runStatsRef = useRef<RunStats>(runStats);
  useEffect(() => {
    runStatsRef.current = runStats;
  }, [runStats]);

  // Visual-only trackers (preserves runStats and end-game scoring equations)
  const displayStage = (runStats?.bossesDefeated ?? 0) + 1;
  const displayDepth = (duelsCompleted % 6) + 1;

  // Boss Combat & Phase State
  const [bossState, setBossState] = useState<BossCombatState>({
    type: null,
    phase: 1,
    phase1CardsPlayed: 0,
    skipNextPlayerTurn: false,
    activeDialogue: null,
    bgHex: '#18181b',
    bgTransitionDuration: 0,
    isRitualComplete: false,
    ritualEndedVoluntarily: false,
  });

  // Calculate required scale damage to defeat opponent (base 5; 7 on run 2; 13 on run 3+)
  const getRequiredScaleWinDamage = useCallback((): number => {
    if (runStats.finalBossesDefeated >= 2) return 13;
    if (runStats.finalBossesDefeated === 1) return 7;
    return 5;
  }, [runStats.finalBossesDefeated]);

  // --- Duel Match State ---
  const [scale, setScale] = useState<number>(0); // player wins at >= getRequiredScaleWinDamage(), loses at <= -5
  const prevScaleRef = useRef<number>(scale);
  const [scaleRumble, setScaleRumble] = useState<boolean>(false);

  // --- Master Scaler & Calibrated Matrix Coordinate System (1280x720 reference) ---
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [currentScale, setCurrentScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    }
    return 1;
  });
  const currentScaleRef = useRef<number>(1);

// --- Items System State ---
  const [items, setItems] = useState<(ItemId | null)[]>([
    'coin_purse',
    'magical_hat',
    'large_matchbook'
  ]);
  const [itemTargetMode, setItemTargetMode] = useState<ItemId | null>(null);
  const [itemTargetSourceSlot, setItemTargetSourceSlot] = useState<number | null>(null);
  const [crucifixUsedThisDuel, setCrucifixUsedThisDuel] = useState<boolean>(false);
  const [isAcornActive, setIsAcornActive] = useState<boolean>(false);
  const [dieModal, setDieModal] = useState<{ roll: number; count: number } | null>(null);
  const [isBoardShaking, setIsBoardShaking] = useState<boolean>(false);

  const updateScale = useCallback(() => {
    const scaleX = window.innerWidth / 1280;
    const scaleY = window.innerHeight / 720;
    const scale = Math.min(scaleX, scaleY);
    setCurrentScale(scale);
    currentScaleRef.current = scale;
    const container = document.getElementById('game-container');
    if (container) {
      container.style.setProperty('--active-scale', scale.toString());
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // Matrix Coordinate Calibrated Card Dragging State
  const [dragState, setDragState] = useState<{
    cardIndex: number;
    card: CardDef;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    hasMoved: boolean;
  } | null>(null);
  const [hoveredSlotLane, setHoveredSlotLane] = useState<number | null>(null);
  const playerSlotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  const [phase, setPhase] = useState<GamePhase>('DRAW');
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [isAmpouleCracked, setIsAmpouleCracked] = useState<boolean>(false);
  const [blood, setBlood] = useState<number>(0);
  const [bones, setBones] = useState<number>(0);
  const [hand, setHand] = useState<CardDef[]>([]);
  const [deck, setDeck] = useState<CardDef[]>([]);
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  const [playerBoard, setPlayerBoard] = useState<(CardDef | null)[]>([null, null, null, null]);
  const [enemyBoard, setEnemyBoard] = useState<(CardDef | null)[]>([null, null, null, null]);
  const [enemyQueue, setEnemyQueue] = useState<(CardDef | null)[]>([null, null, null, null]);
  const [damagedQueueLane, setDamagedQueueLane] = useState<number | null>(null);
  const [enemyWavesLeft, setEnemyWavesLeft] = useState<number>(2);
  const [enemyMaxDuelCards, setEnemyMaxDuelCards] = useState<number>(10);
  const [enemyCardsPlayed, setEnemyCardsPlayed] = useState<number>(0);
  const enemyCardsPlayedRef = useRef<number>(0);

  // Boss State
  const [isBossMatch, setIsBossMatch] = useState<boolean>(false);
  const [musicVol, setMusicVol] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sacrificial_scales_music_vol');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (Number.isFinite(parsed)) return Math.max(0, Math.min(1, parsed));
      }
    } catch {}
    return 0.3;
  });
  const [sfxVol, setSfxVol] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sacrificial_scales_sfx_vol');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (Number.isFinite(parsed)) return Math.max(0, Math.min(1, parsed));
      }
    } catch {}
    return 0.5;
  });
  const [bossPhase, setBossPhase] = useState<number>(1);
  const [bossTotem, setBossTotem] = useState<{ class: Tribe; sigil: string } | null>(null);
  const [hasDefeatedWeaver, setHasDefeatedWeaver] = useState<boolean>(false);
  const [woodcarverClasses, setWoodcarverClasses] = useState<Tribe[]>([]);
  const [isPhaseTransition, setIsPhaseTransition] = useState<boolean>(false);
  const [bossIntroBanner, setBossIntroBanner] = useState<{
    type: 'BoneLord' | 'The Weaver' | 'Zealot' | 'The Begotten';
    eyebrow: string;
    subtitle: string;
    img: string;
    accent: 'crimson' | 'violet' | 'amber' | 'emerald';
  } | null>(null);
  const bossIntroTimerRef = useRef<number | null>(null);
  const phaseTransitionResolveRef = useRef<(() => void) | null>(null);

  const dismissPhaseTransition = useCallback(() => {
    setIsPhaseTransition(false);
    if (phaseTransitionResolveRef.current) {
      const resolve = phaseTransitionResolveRef.current;
      phaseTransitionResolveRef.current = null;
      resolve();
    }
  }, []);

  const triggerBossIntroBanner = useCallback((bType: 'BoneLord' | 'The Weaver' | 'Zealot' | 'The Begotten') => {
    if (bossIntroTimerRef.current) {
      window.clearTimeout(bossIntroTimerRef.current);
      bossIntroTimerRef.current = null;
    }
    const base = import.meta.env.BASE_URL || './';
    const metaMap = {
      BoneLord: {
        eyebrow: 'Final Reckoning · Act IV',
        subtitle: 'Pitch-black eye sockets turn toward the scales.',
        img: `${base}assets/text/bone-lord-final-boss.png`,
        accent: 'crimson' as const,
      },
      'The Weaver': {
        eyebrow: 'Act Boss · The Loom',
        subtitle: 'Hunched over sinew and burlap, threading your doom.',
        img: `${base}assets/text/weaver.png`,
        accent: 'violet' as const,
      },
      Zealot: {
        eyebrow: 'Act Boss · The Steeple',
        subtitle: 'The Altar of the Old One remembers every drop spilled.',
        img: `${base}assets/text/zealot.png`,
        accent: 'amber' as const,
      },
      'The Begotten': {
        eyebrow: 'Act Boss · The Rotary Press',
        subtitle: 'Wet ink and living caricatures spill across the slab.',
        img: `${base}assets/text/begotten.png`,
        accent: 'emerald' as const,
      },
    };
    const m = metaMap[bType];
    setBossIntroBanner({ type: bType, ...m });
  }, []);
  const [isBloodMoonDropping, setIsBloodMoonDropping] = useState<boolean>(false);
  const [isOverkill, setIsOverkill] = useState<boolean>(false);
  // Non-boss victory: CONTINUE prompt on the board replaces the "Enemy Felled" modal
  const [battleWonAction, setBattleWonAction] = useState<(() => void) | null>(null);
  const [battleWonIsBoss, setBattleWonIsBoss] = useState<boolean>(false);
  const [zealotParalyzedBanner, setZealotParalyzedBanner] = useState<boolean>(false);

  useEffect(() => {
    if (!bossIntroBanner && !isPhaseTransition && !zealotParalyzedBanner) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === ' ') && !e.repeat) {
        e.preventDefault();
        if (bossIntroBanner) {
          setBossIntroBanner(null);
        } else if (zealotParalyzedBanner) {
          setZealotParalyzedBanner(false);
          handleEndTurn(true);
        } else if (isPhaseTransition) {
          dismissPhaseTransition();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bossIntroBanner, isPhaseTransition, zealotParalyzedBanner, dismissPhaseTransition]);
  useEffect(() => {
    if (!battleWonAction) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) battleWonAction();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [battleWonAction]);
  const [sacrificedUnkillableCardIds, setSacrificedUnkillableCardIds] = useState<string[]>([]);

  // Morsel stats passed to next played creature
  const [morselStats, setMorselStats] = useState<{ attack: number; health: number }>({ attack: 0, health: 0 });

  // Undo / backup snapshot for cancelling sacrifices before playing card
  const [backupState, setBackupState] = useState<{
    playerBoard: (CardDef | null)[];
    blood: number;
    bones: number;
    hand: CardDef[];
    morselStats: { attack: number; health: number };
  } | null>(null);

  // --- Modals & Inspect Views ---
  const [modalAlert, setModalAlert] = useState<{
    title: string;
    message: string;
    isWin?: boolean;
    btnText: string;
    onAction: () => void;
  } | null>(null);

  const [selectedDeckCardDetail, setSelectedDeckCardDetail] = useState<CardDef | null>(null);
  const [sigilDetailModal, setSigilDetailModal] = useState<{ name: string; desc: string } | null>(null);

  // Draft State
  const [draftPlayerDeck, setDraftPlayerDeck] = useState<CardDef[]>([]);
  const [draftTradePool, setDraftTradePool] = useState<(CardDef | null)[]>([]);
  const [draftTradesLeft, setDraftTradesLeft] = useState<number>(2);
  const [draftSelectedDeckIdx, setDraftSelectedDeckIdx] = useState<number | null>(null);
  const [draftSelectedTradeIdx, setDraftSelectedTradeIdx] = useState<number | null>(null);
  const [draftRevealedIndices, setDraftRevealedIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  const [draftFlippingDown, setDraftFlippingDown] = useState<boolean>(false);
  const [draftFlippingUp, setDraftFlippingUp] = useState<boolean>(false);

  // Crossroads & Event States
  const [crossroadsOptions, setCrossroadsOptions] = useState<string[]>([]);
  const [actMap, setActMap] = useState<ActMapData | null>(null);
  const actMapRef = useRef<ActMapData | null>(null);
  const preDuelMapRef = useRef<ActMapData | null>(null);
  useEffect(() => { actMapRef.current = actMap; }, [actMap]);

  // Deterministic Run Seed & Post-Clear Ritual Vows (Penances)
  const [runSeed, setRunSeed] = useState<string>('');
  const runSeedRef = useRef<string>('');
  const duelRngRef = useRef<() => number>(() => Math.random());
  const [isLossSequenceActive, setIsLossSequenceActive] = useState<boolean>(false);

  const seededShuffle = <T,>(arr: T[], rng: () => number): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Shared Stamp Press imperfection table for The Begotten (same odds as player Stamp event)
  const [runSeedInput, setRunSeedInput] = useState<string>('');
  const [activeVows, setActiveVows] = useState<VowId[]>([]);
  const activeVowsRef = useRef<VowId[]>([]);
  const [copiedEndSeed, setCopiedEndSeed] = useState<boolean>(false);
  const [hasCompletedFirstRun, setHasCompletedFirstRun] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('sacrificial_scales_completed_first_run') === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => { runSeedRef.current = runSeed; }, [runSeed]);
  useEffect(() => { activeVowsRef.current = activeVows; }, [activeVows]);

  const toggleRitualVow = (vowId: VowId) => {
    setActiveVows(prev => {
      const next = prev.includes(vowId) ? prev.filter(id => id !== vowId) : [...prev, vowId];
      activeVowsRef.current = next;
      return next;
    });
    triggerSfx('draw');
  };

// Event action lock to prevent double-clicks and spam
  const [isEventBusy, setIsEventBusy] = useState<boolean>(false);
  const [isTotemFadingOut, setIsTotemFadingOut] = useState<boolean>(false);
  const [totemChoicesHidden, setTotemChoicesHidden] = useState<boolean>(false);

  // Campfire Event
  const [campfireCardIdx, setCampfireCardIdx] = useState<number | null>(null);
  const [campfireAnimState, setCampfireAnimState] = useState<'idle' | 'dipping' | 'drowning' | 'blessed'>('idle');
  const [campfireBuffType, setCampfireBuffType] = useState<'attack' | 'health'>('attack');
  const [campfireStage, setCampfireStage] = useState<number>(0);
  const [isCampfireSafe, setIsCampfireSafe] = useState<boolean>(false);

  // Altar Event
  const [altarHostId, setAltarHostId] = useState<string | null>(null);
  const [altarSacrificeId, setAltarSacrificeId] = useState<string | null>(null);
  const [altarAnimPhase, setAltarAnimPhase] = useState<'idle' | 'sacrificing' | 'descending' | 'done'>('idle');
  const [altarStageCards, setAltarStageCards] = useState<{
    host: CardDef;
    sacrifice: CardDef;
    mergedHost: CardDef;
  } | null>(null);

  // Transmutation Table (Anvil) Event
  const [anvilSelectedId, setAnvilSelectedId] = useState<string | null>(null);
  const [anvilStrikeAnim, setAnvilStrikeAnim] = useState<'idle' | 'hammer' | 'forceps'>('idle');

  // The Zealot's Flock Event (run-persistent blessings/curses & pen UI state)
  type FlockOptionId =
    | 'stat_boost_disappearing_relics'
    | 'bones_drain'
    | 'thin_deck_scale_debt'
    | 'touch_of_death_brittle'
    | 'two_squirrels_locked_draw'
    | 'blood_gauge_hand_penalty'
    | 'grey_sheep_squirrels';

  interface FlockOptionDef {
    id: FlockOptionId;
    blessing: string;
    curse: string | null;
    isGrey?: boolean;
  }

  const FLOCK_OPTIONS: Record<FlockOptionId, FlockOptionDef> = {
    stat_boost_disappearing_relics: {
      id: 'stat_boost_disappearing_relics',
      blessing: 'All your creatures gain +1 Health and +1 Attack',
      curse: 'Your relic slots disappear after use.',
    },
    bones_drain: {
      id: 'bones_drain',
      blessing: 'Gain +5 starting Bones',
      curse: 'You lose 2 Bones at the End of each of your turns.',
    },
    thin_deck_scale_debt: {
      id: 'thin_deck_scale_debt',
      blessing: 'Remove 2 Cards from your Deck',
      curse: 'The next 2 battles begin with -2 on the Blood Gauge.',
    },
    touch_of_death_brittle: {
      id: 'touch_of_death_brittle',
      blessing: 'All cards in your current deck gain Touch of Death',
      curse: 'All cards in your deck also gain Brittle.',
    },
    two_squirrels_locked_draw: {
      id: 'two_squirrels_locked_draw',
      blessing: 'Start each battle with 2 Squirrels',
      curse: 'Cannot Draw Squirrels for the first 2 turns of each battle.',
    },
    blood_gauge_hand_penalty: {
      id: 'blood_gauge_hand_penalty',
      blessing: 'Start each battle with +2 on the Blood Gauge',
      curse: 'Your starting hand is reduced by 1.',
    },
    grey_sheep_squirrels: {
      id: 'grey_sheep_squirrels',
      blessing: '+3 Health to Squirrels',
      curse: null,
      isGrey: true,
    },
  };

  interface FlockSheepEntity {
    id: number;
    x: number;
    y: number;
    optionId: FlockOptionId;
    isGrey: boolean;
    flip: boolean;
    wanderAnim: 'sheepWanderA' | 'sheepWanderB';
    duration: number;
    delay: number;
    dismissed?: boolean;
  }

  const [flockUsedOptions, setFlockUsedOptions] = useState<FlockOptionId[]>([]);
  const [flockDisappearingRelics, setFlockDisappearingRelics] = useState<boolean>(false);
  const [flockBoneDrain, setFlockBoneDrain] = useState<boolean>(false);
  const [flockScaleDebtBattles, setFlockScaleDebtBattles] = useState<number>(0);
  const [flockExtraSquirrel, setFlockExtraSquirrel] = useState<boolean>(false);
  const [flockNoSquirrelTurns, setFlockNoSquirrelTurns] = useState<boolean>(false);
  const [flockSquirrelLockDraws, setFlockSquirrelLockDraws] = useState<number>(0);
  const [flockStartingScaleBonus, setFlockStartingScaleBonus] = useState<boolean>(false);
  const [flockHandPenalty, setFlockHandPenalty] = useState<boolean>(false);
  const [flockSquirrelHealthBonus, setFlockSquirrelHealthBonus] = useState<number>(0);

  const flockDisappearingRelicsRef = useRef<boolean>(false);
  const flockBoneDrainRef = useRef<boolean>(false);
  const flockScaleDebtBattlesRef = useRef<number>(0);
  const flockExtraSquirrelRef = useRef<boolean>(false);
  const flockNoSquirrelTurnsRef = useRef<boolean>(false);
  const flockStartingScaleBonusRef = useRef<boolean>(false);
  const flockHandPenaltyRef = useRef<boolean>(false);
  const flockSquirrelHealthBonusRef = useRef<number>(0);

  useEffect(() => { flockDisappearingRelicsRef.current = flockDisappearingRelics; }, [flockDisappearingRelics]);
  useEffect(() => { flockBoneDrainRef.current = flockBoneDrain; }, [flockBoneDrain]);
  useEffect(() => { flockScaleDebtBattlesRef.current = flockScaleDebtBattles; }, [flockScaleDebtBattles]);
  useEffect(() => { flockExtraSquirrelRef.current = flockExtraSquirrel; }, [flockExtraSquirrel]);
  useEffect(() => { flockNoSquirrelTurnsRef.current = flockNoSquirrelTurns; }, [flockNoSquirrelTurns]);
  useEffect(() => { flockStartingScaleBonusRef.current = flockStartingScaleBonus; }, [flockStartingScaleBonus]);
  useEffect(() => { flockHandPenaltyRef.current = flockHandPenalty; }, [flockHandPenalty]);
  useEffect(() => { flockSquirrelHealthBonusRef.current = flockSquirrelHealthBonus; }, [flockSquirrelHealthBonus]);

  const [flockSheepList, setFlockSheepList] = useState<FlockSheepEntity[]>([]);
  const [flockSelectedSheepId, setFlockSelectedSheepId] = useState<number | null>(null);
  const [flockRepicksUsed, setFlockRepicksUsed] = useState<number>(0);
  const [flockPendingRemovals, setFlockPendingRemovals] = useState<number>(0);
  const [flockRemovalSelectedIds, setFlockRemovalSelectedIds] = useState<string[]>([]);

  // Bone Lord Event
  const [boneLordSelectedIdx, setBoneLordSelectedIdx] = useState<number | null>(null);
  const [boneLordAnimPhase, setBoneLordAnimPhase] = useState<'idle' | 'offering' | 'blessed'>('idle');
  const [boneLordStageData, setBoneLordStageData] = useState<{ card: CardDef; bonus: number } | null>(null);

  // Mycologist Event
  const [mycoSelectedIndices, setMycoSelectedIndices] = useState<number[]>([]);
  const [mycoHasDuplicates, setMycoHasDuplicates] = useState<boolean>(true);
  const [mycoOfferedCard, setMycoOfferedCard] = useState<CardDef | null>(null);

  // Goobert Event
  const [goobertSelectedIdx, setGoobertSelectedIdx] = useState<number | null>(null);
  const [goobertStampedCard, setGoobertStampedCard] = useState<CardDef | null>(null);
  const [goobertOriginalSnapshot, setGoobertOriginalSnapshot] = useState<CardDef | null>(null);
  const [mycoAnimPhase, setMycoAnimPhase] = useState<'idle' | 'sewing' | 'woven'>('idle');
  const [mycoStageCards, setMycoStageCards] = useState<{
    twin1: CardDef;
    twin2: CardDef;
    fused: CardDef;
  } | null>(null);

  // Cave Trial Event
  const [caveTrials, setCaveTrials] = useState<string[]>([]);
  const [caveSelectedTrial, setCaveSelectedTrial] = useState<string | null>(null);
  const [caveRevealCount, setCaveRevealCount] = useState<number>(0);
  const [caveVerdictReady, setCaveVerdictReady] = useState<boolean>(false);
  const [caveShowRewards, setCaveShowRewards] = useState<boolean>(false);
  const [campfireHolding, setCampfireHolding] = useState<boolean>(false);
  const [goobertStamping, setGoobertStamping] = useState<boolean>(false);
  const eventTimersRef = useRef<number[]>([]);

  const clearEventTimers = () => {
    eventTimersRef.current.forEach(id => window.clearTimeout(id));
    eventTimersRef.current = [];
  };

  const scheduleEventTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      eventTimersRef.current = eventTimersRef.current.filter(t => t !== id);
      fn();
    }, ms);
    eventTimersRef.current.push(id);
  };
  const [caveDrawnCards, setCaveDrawnCards] = useState<CardDef[]>([]);
  const [cavePassed, setCavePassed] = useState<boolean>(false);
  const [caveRewardCards, setCaveRewardCards] = useState<CardDef[]>([]);
  const [caveSelectedRewardIdx, setCaveSelectedRewardIdx] = useState<number | null>(null);

  // Card Choice Event
  const [choiceCards, setChoiceCards] = useState<CardDef[]>([]);
  const [choiceIsRare, setChoiceIsRare] = useState<boolean>(false);
  const [choiceSelectedIdx, setChoiceSelectedIdx] = useState<number | null>(null);
  const [choiceRerollsLeft, setChoiceRerollsLeft] = useState<number>(1);

  // Hoarder Search Event
  const [hoarderSelectedIdx, setHoarderSelectedIdx] = useState<number | null>(null);

  // Totem Event
  const [totemRewardChoices, setTotemRewardChoices] = useState<Array<{ type: 'head' | 'body'; value: string }>>([]);
  const [selectedTotemRewardIdx, setSelectedTotemRewardIdx] = useState<number | null>(null);
  const [hoveredTotemRewardIdx, setHoveredTotemRewardIdx] = useState<number | null>(null);
  const [totemStage, setTotemStage] = useState<'REWARD' | 'ASSEMBLE'>('REWARD');
  const [assemblyHeadIdx, setAssemblyHeadIdx] = useState<number | null>(null);
  const [assemblyBodyIdx, setAssemblyBodyIdx] = useState<number | null>(null);
  const [carvingTribes, setCarvingTribes] = useState<Tribe[]>([]);
  const [carvingPickedTribe, setCarvingPickedTribe] = useState<Tribe | null>(null);
  const [carvingSummonedCard, setCarvingSummonedCard] = useState<CardDef | null>(null);
  const [costBargainPickedType, setCostBargainPickedType] = useState<string | null>(null);
  const [costBargainRevealedCard, setCostBargainRevealedCard] = useState<CardDef | null>(null);
  const [choiceDealGen, setChoiceDealGen] = useState<number>(0);
  const [effigyStitchingAnim, setEffigyStitchingAnim] = useState<boolean>(false);
  const [costChoices, setCostChoices] = useState<Array<'1 Blood' | '2 Blood' | '3 Blood' | 'Bones'>>([]);

  // Combat Animation State Specifications
  const [activeAttacker, setActiveAttacker] = useState<{
    isPlayer: boolean;
    lane: number;
    targetLane: number;
    isAirborne: boolean;
    isDirect: boolean;
    direction: 'left' | 'right' | 'straight';
  } | null>(null);
  const [activeDefendingLane, setActiveDefendingLane] = useState<{ isPlayer: boolean; lane: number } | null>(null);
  const [damagedCard, setDamagedCard] = useState<{ isPlayer: boolean; lane: number } | null>(null);
  const [evolvingCards, setEvolvingCards] = useState<Array<{ isPlayer: boolean; lane: number; phase: 'up' | 'down' }>>([]);
  const [destroyedCard, setDestroyedCard] = useState<{ isPlayer: boolean; lane: number } | null>(null);
  const [incineratingLane, setIncineratingLane] = useState<number | null>(null);
  const [sacrificingLane, setSacrificingLane] = useState<number | null>(null);
  const [hpFlashingCard, setHpFlashingCard] = useState<{ isPlayer: boolean; lane: number } | null>(null);
  const [jitteringCard, setJitteringCard] = useState<{ isPlayer: boolean; lane: number } | null>(null);
  const [droppingQueueLane, setDroppingQueueLane] = useState<number | null>(null);
  const [lateralMovements, setLateralMovements] = useState<Record<string, number>>({});
  const [isBoardRumbling, setIsBoardRumbling] = useState<boolean>(false);
  const [isHeavyRecoil, setIsHeavyRecoil] = useState<boolean>(false);
  const [isHitStop, setIsHitStop] = useState<boolean>(false);
  const [isScaleHeavySlam, setIsScaleHeavySlam] = useState<boolean>(false);
  const [sigilBadges, setSigilBadges] = useState<Array<{
    id: number;
    isPlayer: boolean;
    lane: number;
    text: string;
    tone: 'gold' | 'bone' | 'blood' | 'emerald' | 'violet';
  }>>([]);
  const sigilBadgeIdRef = useRef<number>(1);
  const [summonedCardIds, setSummonedCardIds] = useState<Set<string>>(new Set());

  const [boneShaking, setBoneShaking] = useState<boolean>(false);
  const [zeroPowerShakingCard, setZeroPowerShakingCard] = useState<{ isPlayer: boolean; lane: number } | null>(null);
  const [isEnemyRetracting, setIsEnemyRetracting] = useState<boolean>(false);
  const [totalOverkillDamage, setTotalOverkillDamage] = useState<number>(0);
  // Overkill jar: pending tier ratchets up at 20 / 50, displayed tier swaps only at battle start
  const [jarTier, setJarTier] = useState<1 | 2 | 3>(1);
  const pendingJarTierRef = useRef<1 | 2 | 3>(1);
  useEffect(() => {
    const target: 1 | 2 | 3 = totalOverkillDamage >= 50 ? 3 : totalOverkillDamage >= 20 ? 2 : 1;
    if (target > pendingJarTierRef.current) pendingJarTierRef.current = target;
  }, [totalOverkillDamage]);
  const [highestOverkill, setHighestOverkill] = useState<number>(0);

  // Persist newly encountered cards & sigils to Compendium
  useEffect(() => {
    const onBoard = (playerBoard || []).filter((c): c is CardDef => Boolean(c));
    const combined = [...(masterDeck || []), ...(hand || []), ...onBoard];
    if (combined.length > 0) {
      setArchive(prev => recordDiscoveredCards(prev, combined));
    }
  }, [masterDeck, hand, playerBoard]);

  // Persist run completion stats once per GAME_OVER transition
  useEffect(() => {
    if (screen === 'GAME_OVER') {
      if (!hasCompletedFirstRun) {
        setHasCompletedFirstRun(true);
        try {
          localStorage.setItem('sacrificial_scales_completed_first_run', '1');
        } catch {}
      }
      if (!recordedGameOverRef.current) {
        recordedGameOverRef.current = true;
        const won = Boolean(bossState?.ritualEndedVoluntarily) || (runStatsRef.current?.finalBossesDefeated || 0) > 0;
        setArchive(prev =>
          recordRunCompletion(
            prev,
            runStatsRef.current,
            highestOverkill,
            won,
            selectedLineage
          )
        );
      }
    } else {
      recordedGameOverRef.current = false;
    }
  }, [screen, highestOverkill, bossState?.ritualEndedVoluntarily]);
  const [showOverkill, setShowOverkill] = useState<boolean>(false);
  const [isTalismanPricked, setIsTalismanPricked] = useState<boolean>(false);
  const isCinematic = false;

  // --- Run Persistence & Auto-Save ---
  interface RunSaveData {
    masterDeck: CardDef[];
    items: (ItemId | null)[];
    totalOverkillDamage: number;
    highestOverkill?: number;
    jarTier?: number;
    stage: number;
    level: number;
    duelsCompleted: number;
    totemPieces: any[];
    activeTotem: { head: any; body: any };
    currentStageName: string;
    startingBones?: number;
    ouroborosBuffs?: number;
    runStats?: RunStats;
    standardBossOrder?: ('Zealot' | 'The Begotten' | 'The Weaver')[];
    hasDefeatedWeaver?: boolean;
    permanentScaleDebuff?: number;
    consecutiveOneTurnWins?: number;
    otkCooldown?: number;
    actMap?: ActMapData | null;
    runSeed?: string;
    activeVows?: VowId[];
    isCampfireSafe?: boolean;
    flockUsedOptions?: string[];
    flockDisappearingRelics?: boolean;
    flockBoneDrain?: boolean;
    flockScaleDebtBattles?: number;
    flockExtraSquirrel?: boolean;
    flockNoSquirrelTurns?: boolean;
    flockStartingScaleBonus?: boolean;
    flockHandPenalty?: boolean;
    flockSquirrelHealthBonus?: number;
    savedAt: number;
  }

  const RUN_SAVE_KEY = 'thread_bones_run_save';

  const [showContinueModal, setShowContinueModal] = useState<boolean>(false);
  const [savedRunExists, setSavedRunExists] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('thread_bones_run_save') !== null;
    } catch {
      return false;
    }
  });

  const clearRunSave = () => {
    preDuelMapRef.current = null;
    try {
      localStorage.removeItem(RUN_SAVE_KEY);
      setSavedRunExists(false);
    } catch (e) {
      console.warn("Failed to clear save:", e);
    }
  };

  useEffect(() => {
    if (screen === 'SPLASH' || screen === 'DECK_SELECT' || screen === 'DRAFT' || screen === 'DUEL' || screen === 'GAME_OVER' || preDuelMapRef.current !== null) {
      return;
    }
    if (masterDeck && masterDeck.length > 0) {
      try {
        const payload: RunSaveData = {
          masterDeck,
          items,
          totalOverkillDamage,
          highestOverkill,
          jarTier: pendingJarTierRef.current,
          stage,
          level,
          duelsCompleted,
          totemPieces,
          activeTotem,
          currentStageName,
          startingBones: startingBonesRef.current !== undefined ? startingBonesRef.current : startingBones,
          ouroborosBuffs,
          runStats: runStatsRef.current,
          standardBossOrder: (window as any).__standardBossOrder,
          hasDefeatedWeaver,
          permanentScaleDebuff,
          consecutiveOneTurnWins,
          otkCooldown,
          actMap: actMapRef.current,
          runSeed: runSeedRef.current,
          activeVows: activeVowsRef.current,
          isCampfireSafe,
          flockUsedOptions,
          flockDisappearingRelics,
          flockBoneDrain,
          flockScaleDebtBattles,
          flockExtraSquirrel,
          flockNoSquirrelTurns,
          flockStartingScaleBonus,
          flockHandPenalty,
          flockSquirrelHealthBonus,
          savedAt: Date.now(),
        };
        localStorage.setItem(RUN_SAVE_KEY, JSON.stringify(payload));
        setSavedRunExists(true);
      } catch (e) {
        console.warn("Auto-save failed:", e);
      }
    }
  }, [masterDeck, items, totalOverkillDamage, highestOverkill, stage, level, duelsCompleted, totemPieces, activeTotem, currentStageName, startingBones, ouroborosBuffs, runStats, permanentScaleDebuff, consecutiveOneTurnWins, otkCooldown, actMap, runSeed, activeVows, isCampfireSafe, flockUsedOptions, flockDisappearingRelics, flockBoneDrain, flockScaleDebtBattles, flockExtraSquirrel, flockNoSquirrelTurns, flockStartingScaleBonus, flockHandPenalty, flockSquirrelHealthBonus, screen]);

  // --- Item Restock & Blood Bank Pricing ---
  const ITEM_COSTS: Record<ItemId, number> = {
    magical_hat: 4,
    coin_purse: 4,
    bronze_acorn: 6,
    bronze_crucifix: 6,
    bone_lords_horn: 6,
    loaded_die: 6,
    joker_stamp: 8,
    large_matchbook: 8,
  };

  const [itemChoices, setItemChoices] = useState<ItemId[]>([]);
  const [cacheConsolationCard, setCacheConsolationCard] = useState<CardDef | null>(null);
  const [hasPurchasedItemThisEvent, setHasPurchasedItemThisEvent] = useState<boolean>(false);

  const startItemEvent = () => {
    setHasPurchasedItemThisEvent(false);
    setCacheConsolationCard(null);
    const pool: ItemId[] = [
      'magical_hat',
      'bone_lords_horn',
      'joker_stamp',
      'large_matchbook',
      'coin_purse',
      'loaded_die',
      'bronze_acorn'
    ];
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
    setItemChoices(shuffled);
    setScreen('EVENT_ITEMS');
  };

  const handleSelectItem = (selectedId: ItemId) => {
    const cost = ITEM_COSTS[selectedId] ?? 6;
    const emptySlot = items.findIndex(slot => slot === null);

    if (emptySlot === -1) {
      addLog("Your satchel is full. Consume or discard an item first.");
      return;
    }

    if (totalOverkillDamage < cost) {
      addLog(`Not enough blood. ${ALL_ITEMS[selectedId].name} costs ${cost} oz.`);
      return;
    }

    setHasPurchasedItemThisEvent(true);
    setTotalOverkillDamage(prev => Math.max(0, prev - cost));
    setItems(prev => {
      const next = [...prev];
      next[emptySlot] = selectedId;
      return next;
    });
    setItemChoices(prev => prev.filter(id => id !== selectedId));
    triggerSfx('draw');
    addLog(`Extracted ${ALL_ITEMS[selectedId].name} for ${cost} oz of blood.`);
  };

  const handleLeaveCache = () => {
    const satchelFull = items.findIndex(s => s === null) === -1;
    const canAffordAny = itemChoices.some(id => totalOverkillDamage >= (ITEM_COSTS[id] ?? 6));
    const cannotBuyAnything = satchelFull || !canAffordAny;

    // Only grant token if player bought nothing and cannot purchase anything
    if (!hasPurchasedItemThisEvent && cannotBuyAnything) {
      // Pull strictly from EVENT_CARD_POOL to respect ban lists (Red Colossus, Mycelium, evolutions)
      const validPool = EVENT_CARD_POOL.filter(
        c => !c.unsacrificable && 
             !c.isSacrifice && 
             c.cost !== undefined && 
             !(c as any).isTerrain && 
             c.name !== 'Stone Wall' && 
             c.name !== 'Felled Tree' &&
             c.name !== 'Trade Pelt'
      );
      const candidates = validPool.length > 0 ? validPool : EVENT_CARD_POOL;
      const rawChosen = candidates[Math.floor(Math.random() * candidates.length)];
      const rewardCard = transformAmorphous(cloneCard(rawChosen, 0));

      triggerSfx('draw');
      setCacheConsolationCard(rewardCard);
      addLog(`Peddler presents a token for the road: ${rewardCard.name}.`);
    } else {
      addLog("Departed the Surplus Cache.");
      returnToMap();
    }
  };

  const handleConfirmConsolation = () => {
    if (!cacheConsolationCard) return;

    // Append strictly to masterDeck to preserve all prior deck upgrades
    const updatedMasterDeck = [...masterDeck, cacheConsolationCard];
    setMasterDeck(updatedMasterDeck);
    if (typeof masterDeckRef !== 'undefined' && masterDeckRef?.current) {
      masterDeckRef.current = updatedMasterDeck;
    }

    triggerSfx('play');
    addLog(`${cacheConsolationCard.name} safely stowed into your deck.`);
    setCacheConsolationCard(null);
    returnToMap(updatedMasterDeck);
  };

  useEffect(() => {
    if (phase === 'PLAY') {
      setIsTalismanPricked(false);
    }
  }, [phase]);

  // Combat Animation Async Helpers returning Promises
  const animateAttackLunge = async (attacker: {
    isPlayer: boolean;
    lane: number;
    targetLane: number;
    isAirborne: boolean;
    isDirect: boolean;
    direction: 'left' | 'right' | 'straight';
  }) => {
    setActiveAttacker(attacker);
    await new Promise(res => setTimeout(res, 400));
    setActiveAttacker(null);
  };

  const animateZeroPowerAttack = async (isPlayer: boolean, lane: number) => {
    setZeroPowerShakingCard({ isPlayer, lane });
    await new Promise(res => setTimeout(res, 350));
    setZeroPowerShakingCard(null);
  };

  const triggerBoneShake = () => {
    setBoneShaking(true);
    setTimeout(() => setBoneShaking(false), 350);
  };

  const spawnSigilBadge = (
    isPlayer: boolean,
    lane: number,
    text: string,
    tone: 'gold' | 'bone' | 'blood' | 'emerald' | 'violet' = 'gold'
  ) => {
    const id = sigilBadgeIdRef.current++;
    setSigilBadges(prev => [...prev.slice(-10), { id, isPlayer, lane, text, tone }]);
    window.setTimeout(() => {
      setSigilBadges(prev => prev.filter(b => b.id !== id));
    }, 950);
  };

  const triggerMicroHitstop = async (ms = 55) => {
    setIsHitStop(true);
    await new Promise(res => setTimeout(res, ms));
    setIsHitStop(false);
  };

  const triggerScaleHeavySlam = () => {
    setIsScaleHeavySlam(true);
    window.setTimeout(() => setIsScaleHeavySlam(false), 430);
  };

  const animateCardDamage = async (isPlayer: boolean, lane: number, dmgAmount = 1, isLethal = false) => {
    const isHeavy = dmgAmount >= 4 || isLethal;
    triggerSfx(dmgAmount >= 2 || isLethal ? 'heavy_hit' : 'hit');
    if (isHeavy) {
      setIsHeavyRecoil(true);
      await triggerMicroHitstop(dmgAmount >= 5 ? 65 : 50);
      window.setTimeout(() => setIsHeavyRecoil(false), 340);
    }
    setDamagedCard({ isPlayer, lane });
    await new Promise(res => setTimeout(res, 150));
    setDamagedCard(null);
  };

  const animateCardDestroy = async (isPlayer: boolean, lane: number) => {
    setDestroyedCard({ isPlayer, lane });
    await new Promise(res => setTimeout(res, 200));
    setDestroyedCard(null);
  };

  const animateDirectDamageRumble = async (dmgAmount = 1, isLethalSwing = false) => {
    const isHeavy = dmgAmount >= 4 || isLethalSwing;
    triggerSfx(dmgAmount >= 2 || isLethalSwing ? 'heavy_hit' : 'hit');
    if (isHeavy) {
      setIsHeavyRecoil(true);
      triggerScaleHeavySlam();
      await triggerMicroHitstop(isLethalSwing ? 65 : 52);
      await new Promise(res => setTimeout(res, 220));
      setIsHeavyRecoil(false);
    } else {
      setIsBoardRumbling(true);
      await new Promise(res => setTimeout(res, 200));
      setIsBoardRumbling(false);
    }
  };

  const triggerSigilJitter = async (isPlayer: boolean, lane: number) => {
    setJitteringCard({ isPlayer, lane });
    await new Promise(res => setTimeout(res, 100));
    setJitteringCard(null);
  };

  const triggerHpFlash = (isPlayer: boolean, lane: number) => {
    setHpFlashingCard({ isPlayer, lane });
    setTimeout(() => {
      setHpFlashingCard(prev => (prev?.isPlayer === isPlayer && prev?.lane === lane ? null : prev));
    }, 500);
  };

  const triggerLateralMove = async (cardId: string, deltaLanes: number) => {
    setLateralMovements(prev => ({ ...prev, [cardId]: deltaLanes }));
    await new Promise(res => setTimeout(res, 250));
    setLateralMovements(prev => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  const triggerSummonWipe = (cardId?: string) => {
    if (!cardId) return;
    setSummonedCardIds(prev => new Set(prev).add(cardId));
    setTimeout(() => {
      setSummonedCardIds(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }, 320);
  };


  // Dev Console State
  const [devForceSubmenuOpen, setDevForceSubmenuOpen] = useState<boolean>(false);
  const [devTab, setDevTab] = useState<'ACTIONS' | 'ALTER_DECK' | 'CARDS' | 'SIGILS'>('ACTIONS');
  const [devCardSearch, setDevCardSearch] = useState<string>('');
  const [devCardsFilter, setDevCardsFilter] = useState<string>('');
  const [ritualReadyProgress, setRitualReadyProgress] = useState<number>(0);
  const isRitualReady = ritualReadyProgress >= 100;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let cancelled = false;

    const initPreloader = () => {
      const minBootMs = 900;
      const start = performance.now();

      // Stage 1: Critical boot assets (splash + immediate menus) — unlocks Begin Duel fast
      const criticalUrls = Array.from(new Set<string>([
        `${BASE}/assets/text/pentagram.png`,
        `${BASE}/assets/backgrounds/splash.jpg`,
        `${BASE}/assets/backgrounds/deck-selection.jpg`,
        `${BASE}/assets/text/cloth.jpg`,
        `${BASE}/assets/text/wood.jpg`,
        `${BASE}/assets/text/slate.jpg`,
        `${BASE}/assets/cardbases/card_base.png`,
        `${BASE}/assets/cardbases/cardbacks.png`,
      ])).filter(Boolean);

      // Stage 2: Background warmup (battle/map/cards/sigils) — streams quietly after boot
      const backgroundUrls = Array.from(new Set<string>([
        `${BASE}/assets/backgrounds/draft.jpg`,
        `${BASE}/assets/backgrounds/battlebg1.jpg`,
        `${BASE}/assets/text/fullmapbg.jpg`,
        `${BASE}/assets/text/plinth.png`,
        `${BASE}/assets/text/symbols.png`,
        `${BASE}/assets/text/blood01.png`,
        `${BASE}/assets/text/blood02.png`,
        `${BASE}/assets/text/blood03.png`,
        `${BASE}/assets/text/blood04.png`,
        `${BASE}/assets/text/bloodbath.png`,
        `${BASE}/assets/cardbases/bestowed-card-base.png`,
        `${BASE}/assets/cardbases/combined-card-base.png`,
        `${BASE}/assets/cardbases/duplicate-card-base.png`,
        ...Object.values(ALL_CARD_LOOKUP)
          .filter((c) => c.name !== 'BLOOD MOON')
          .map((c) => getCardArtUrl(c)),
        ...Object.keys(SIGIL_MAPPING).map((s) => getSigilArtUrl(s)),
      ])).filter(Boolean);

      let loadedCount = 0;
      const totalCritical = criticalUrls.length || 1;
      const criticalQueue = [...criticalUrls];
      const bgQueue = [...backgroundUrls];

      const loadOne = (src: string, highPriority = false) =>
        new Promise<void>((res, rej) => {
          const img = new Image();
          img.decoding = 'async';
          if (highPriority) (img as any).fetchPriority = 'high';
          img.onload = () => res();
          img.onerror = () => rej();
          img.src = src;
        });

      const runQueue = async (queue: string[], concurrency: number, isCritical: boolean) => {
        const worker = async () => {
          while (queue.length > 0 && !cancelled) {
            const src = queue.shift()!;
            try {
              await loadOne(src, isCritical);
            } catch {
              try {
                await loadOne(src, false);
              } catch {
                // Ignore genuinely missing assets so boot never stalls
              }
            } finally {
              if (isCritical) loadedCount++;
            }
          }
        };
        await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()));
      };

      runQueue(criticalQueue, 4, true).then(() => {
        if (!cancelled) {
          runQueue(bgQueue, 4, false);
        }
      });

      interval = setInterval(() => {
        const elapsedRatio = Math.min(1, (performance.now() - start) / minBootMs);
        const assetRatio = loadedCount / totalCritical;
        const combined = Math.min(elapsedRatio, assetRatio);

        setRitualReadyProgress(Math.floor(combined * 100));

        if (combined >= 1) {
          clearInterval(interval);
        }
      }, 60);
    };

        initPreloader();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);
  const [devInspectCard, setDevInspectCard] = useState<CardDef | null>(null);
  const [devAlterCard, setDevAlterCard] = useState<CardDef | null>(null);

  // Duel field ref for shake animations
  const duelFieldRef = useRef<HTMLDivElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => {
      const next = [...prev, `> ${msg}`];
      return next.slice(-40);
    });
  }, []);

  const triggerSfx = useCallback((type: SoundEffectType) => {
    if (audioEnabled) playSound(type);
  }, [audioEnabled]);

  // Trigger small rumble animation when scale increases or decreases
  useEffect(() => {
    if (prevScaleRef.current !== scale) {
      prevScaleRef.current = scale;
      setScaleRumble(true);
      const timer = setTimeout(() => setScaleRumble(false), 200);
      return () => clearTimeout(timer);
    }
  }, [scale]);

  // Arterial Shunt safety observer: fractures ampoule if pressure hits +4 on turn 1
  useEffect(() => {
    if (turnNumber === 1 && scale >= 4) {
      setIsAmpouleCracked(true);
    }
  }, [turnNumber, scale]);

  // Sync ChiptuneAudio BGM with screen state and mute status
  useEffect(() => {
    if (!audioEnabled) {
      ChiptuneAudio.stop();
      return;
    }

    // Do not interrupt or overwrite battle/boss music while inspecting overlays or mid-smoke transition
    if (
      screen === 'VIEW_DECK' ||
      screen === 'DEV_MENU' ||
      screen === 'EVENT_HOARDER_SEARCH' ||
      smokePhase === 'IN'
    ) {
      return;
    }

    if (screen === 'DUEL') {
      if (isBossMatch) {
        if (bossState.type === 'BoneLord') {
          const desiredTrack = bossPhase === 3 ? 'bloodmoon-phase3' : 'finalboss';
          if (ChiptuneAudio.currentTrack !== desiredTrack) {
            if (bossPhase === 3) ChiptuneAudio.playFinalBossPhase3?.(0.6);
            else ChiptuneAudio.playFinalBoss?.(1.8);
          }
        } else if (bossState.type === 'Zealot' && ChiptuneAudio.currentTrack !== 'boss-Zealot') {
          ChiptuneAudio.playTheZealot?.(1.5);
        } else if (bossState.type === 'The Begotten' && ChiptuneAudio.currentTrack !== 'boss-The Begotten') {
          ChiptuneAudio.playTheBegotten?.(1.8);
        } else if (bossState.type === 'The Weaver' && ChiptuneAudio.currentTrack !== 'boss-The Weaver') {
          ChiptuneAudio.playTheWeaver?.(1.5);
        }
      } else if (ChiptuneAudio.currentTrack !== 'battle') {
        ChiptuneAudio.playBattle();
      }
    } else if (screen === 'GAME_OVER') {
      if (bossState.ritualEndedVoluntarily) {
        if (ChiptuneAudio.currentTrack !== 'victory') {
          ChiptuneAudio.playVictory?.(2.2);
        }
      } else if (ChiptuneAudio.currentTrack !== 'gameover') {
        ChiptuneAudio.playGameOver?.(2.0);
      }
    } else {
      if (ChiptuneAudio.currentTrack !== 'cabin') {
        ChiptuneAudio.playCabin();
      }
    }
  }, [screen, audioEnabled, isBossMatch, bossState.type, bossState.ritualEndedVoluntarily, bossPhase, smokePhase, showContinueModal]);

  // Wake suspended AudioContext on first user interaction so Main Menu BGM starts cleanly
  useEffect(() => {
    if (!audioEnabled || screen !== 'SPLASH') return;
    const unlockMenuAudio = () => {
      try {
        if (!ChiptuneAudio.ctx) ChiptuneAudio.init();
        if (ChiptuneAudio.ctx?.state === 'suspended') {
          void ChiptuneAudio.ctx.resume();
        }
        if (ChiptuneAudio.currentTrack !== 'cabin') {
          ChiptuneAudio.playCabin();
        }
        ChiptuneAudio.setOverlayDuck?.(true);
      } catch {}
    };
    window.addEventListener('pointerdown', unlockMenuAudio, { once: true });
    window.addEventListener('keydown', unlockMenuAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockMenuAudio);
      window.removeEventListener('keydown', unlockMenuAudio);
    };
  }, [audioEnabled, screen, showContinueModal]);

  const [showViewDeck, setShowViewDeck] = useState<boolean>(false);

  // Gently sweep music bus low-pass down (~900 Hz) while Pause or Deck overlay is open
  useEffect(() => {
    const shouldDuck = Boolean(showPauseMenu || showViewDeck || screen === 'SPLASH' || screen === 'VIEW_DECK' || screen === 'DEV_MENU' || screen === 'EVENT_HOARDER_SEARCH');
    ChiptuneAudio.setOverlayDuck?.(shouldDuck);
  }, [showPauseMenu, showViewDeck, screen]);

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      ChiptuneAudio.stop();
    };
  }, []);

  // Shake animation trigger with 0.1s initial delay and 0.3s duration
  const shakeField = () => {
    setTimeout(() => {
      if (duelFieldRef.current) {
        duelFieldRef.current.classList.add('animate-shake');
        setTimeout(() => {
          duelFieldRef.current?.classList.remove('animate-shake');
        }, 300);
      }
    }, 100);
  };
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    const updateCanvasSize = () => {
      const scaleX = window.innerWidth / 1280;
      const scaleY = window.innerHeight / 720;
      setCanvasScale(Math.min(scaleX, scaleY));
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  const openViewDeck = () => {
    setShowViewDeck(true);
  };

  const openDevMenu = () => {
    setPreviousScreen(screen);
    setScreen('DEV_MENU');
  };

  const handleRestartRun = (replaySeed?: unknown) => {
    const seedToReplay = typeof replaySeed === 'string' ? normalizeSeed(replaySeed) : '';
    isForcedDevBossRef.current = false;
    setRunSeedInput(seedToReplay);
    setScreen(seedToReplay ? 'DECK_SELECT' : 'SPLASH');
    setScale(0);
    setBlood(0);
    setTotalOverkillDamage(0);
    pendingJarTierRef.current = 1;
    setJarTier(1);
    setHighestOverkill(0);
    setIsOverkill(false);
    setShowOverkill(false);
    setBones(startingBones);
    setStartingBones(0);
    startingBonesRef.current = 0;
    setHand([]);
    setDeck([]);
    setPlayerBoard([null, null, null, null]);
    setEnemyBoard([null, null, null, null]);
    setEnemyQueue([null, null, null, null]);
    setMasterDeck([]);
    setStage(1);
    setLevel(1);
    setDuelsCompleted(0);
    setBossPhase(1);
    setIsBossMatch(false);
    setBossTotem(null);
    setActiveTotem({ head: null, body: null });
    setTotemPieces([]);
    setTurnNumber(1);
    setIsAmpouleCracked(false);
    setIsLossSequenceActive(false);
    setAltarAnimPhase('idle');
    setAltarStageCards(null);
    setCampfireAnimState('idle');
    setGoobertStampedCard(null);
    setGoobertOriginalSnapshot(null);
    setMycoAnimPhase('idle');
    setMycoStageCards(null);
    setBoneLordAnimPhase('idle');
    setBoneLordStageData(null);
    setCarvingPickedTribe(null);
    setCarvingSummonedCard(null);
    setCostBargainPickedType(null);
    setCostBargainRevealedCard(null);
    setEffigyStitchingAnim(false);
    setAnvilSelectedId(null);
    setAnvilStrikeAnim('idle');
    setIsCampfireSafe(false);
    setFlockUsedOptions([]);
    setFlockDisappearingRelics(false);
    flockDisappearingRelicsRef.current = false;
    setFlockBoneDrain(false);
    flockBoneDrainRef.current = false;
    setFlockScaleDebtBattles(0);
    flockScaleDebtBattlesRef.current = 0;
    setFlockExtraSquirrel(false);
    flockExtraSquirrelRef.current = false;
    setFlockNoSquirrelTurns(false);
    flockNoSquirrelTurnsRef.current = false;
    setFlockSquirrelLockDraws(0);
    setFlockStartingScaleBonus(false);
    flockStartingScaleBonusRef.current = false;
    setFlockHandPenalty(false);
    flockHandPenaltyRef.current = false;
    setFlockSquirrelHealthBonus(0);
    flockSquirrelHealthBonusRef.current = 0;
    setFlockSheepList([]);
    setFlockSelectedSheepId(null);
    setFlockRepicksUsed(0);
    setFlockPendingRemovals(0);
    setFlockRemovalSelectedIds([]);
    setItems(['coin_purse', 'magical_hat', 'large_matchbook']);
    setItemTargetMode(null);
    setItemTargetSourceSlot(null);
    setCrucifixUsedThisDuel(false);
    setIsAcornActive(false);
    setDieModal(null);
    setShowPauseMenu(false);
    setModalAlert(null);
    setBossState({
      type: null,
      phase: 1,
      phase1CardsPlayed: 0,
      skipNextPlayerTurn: false,
      activeDialogue: null,
      bgHex: '#18181b',
      bgTransitionDuration: 0,
      isRitualComplete: false,
      ritualEndedVoluntarily: false,
    });
    setRunStats({
      bossesDefeated: 0,
      scaleDamageDealt: 0,
      scaleDamageTaken: 0,
      cardsSacrificed: 0,
      enemyCardsDestroyed: 0,
      grizzlyWallsSurvived: 0,
      clearedStages: 0,
      finalBossesDefeated: 0,
    });
  };

                                                 // Ant Count calculation across both sides of the board
  const getAntCount = useCallback((pBoard: (CardDef | null)[] = playerBoard, eBoard: (CardDef | null)[] = enemyBoard): number => {
    let count = 0;
    pBoard.forEach(c => { if (c?.tags?.includes('Ant')) count++; });
    eBoard.forEach(c => { if (c?.tags?.includes('Ant')) count++; });
    return count;
  }, [playerBoard, enemyBoard]);

  // Attack Calculation (Ants, Lammergeier, Leaders, Stinky, Vertibrae)
  const getCardAttack = useCallback((
    card: CardDef | null,
    laneIndex?: number,
    isPlayer?: boolean,
    customPBoard?: (CardDef | null)[],
    customEBoard?: (CardDef | null)[],
    isQueue?: boolean
  ): number => {
    if (!card) return 0;
    let base = card.attack || 0;

    const currentPBoard = customPBoard || playerBoard;
    const currentEBoard = customEBoard || enemyBoard;

    if (card.sigils?.includes('Shadow')) {
      // Under Shadow, base attack is locked to the swapped health value stored on the card.
      // Dynamic base bonuses (Ant count, Lammergeier bones) do not double-dip.
      base = card.attack || 0;
    } else if (card.sigils?.includes('Shadow')) {
      // Under Shadow, base attack is locked to the swapped health value stored on the card.
      // Dynamic base bonuses (Ant count, Lammergeier bones) do not double-dip.
      base = card.attack || 0;
    } else if (card.tags?.includes('Ant')) {
      base = getAntCount(currentPBoard, currentEBoard) + (card.attack || 0);
    } else if (isCardNamed(card.name, "Lammergeier")) {
      base = (isPlayer !== false ? Math.floor((bones || 0) / 2) : 0) + (card.attack || 0);
    }

    let leaderBonus = 0;
    let vertibraeBonus = 0;
    let stinkyPenalty = 0;

    // Leader buffs, Vertibrae buffs, and Stinky penalties strictly apply to active frontline combatants.
    // Backrow queue cards are waiting off-field and have no active adjacent neighbors.
    if (!isQueue && laneIndex !== undefined && isPlayer !== undefined) {
      const board = isPlayer ? currentPBoard : currentEBoard;
      const oppBoard = isPlayer ? currentEBoard : currentPBoard;

      const leftNeighbor = laneIndex > 0 ? board[laneIndex - 1] : null;
      const rightNeighbor = laneIndex < 3 ? board[laneIndex + 1] : null;

      // Only give the Leader buff if the neighbor is alive (health > 0)
      if (leftNeighbor && (leftNeighbor.health || 0) > 0 && leftNeighbor.sigils.includes('Leader')) {
        leaderBonus += 1;
      }
      if (rightNeighbor && (rightNeighbor.health || 0) > 0 && rightNeighbor.sigils.includes('Leader')) {
        leaderBonus += 1;
      }

      // Vertibrae had the exact same bug with Demon Elk, so we fix that too
      if (card.name === "Vertibrae") {
        if (leftNeighbor && (leftNeighbor.health || 0) > 0 && isCardNamed(leftNeighbor.name, "Demon Elk")) {
          vertibraeBonus += 1;
        }
        if (rightNeighbor && (rightNeighbor.health || 0) > 0 && isCardNamed(rightNeighbor.name, "Demon Elk")) {
          vertibraeBonus += 1;
        }
      }

      if (oppBoard[laneIndex]?.sigils.includes('Stinky') || oppBoard.some(c => c?.isMassive && c.sigils.includes('Stinky'))) {
        stinkyPenalty = 1;
      }
    }

    return Math.max(0, base + leaderBonus + vertibraeBonus - stinkyPenalty);
  }, [playerBoard, enemyBoard, bones, getAntCount]);

  // Stage names generator
  const STAGE_POOL = ["Forgotten Graveyard", "Sunken Crypts", "Desolate Ossuary", "Charnel Grounds"];
  const stagePoolRef = useRef<string[]>([...STAGE_POOL]);
  const getRandomStageName = (): string => {
    if (stagePoolRef.current.length === 0) {
      stagePoolRef.current = [...STAGE_POOL];
    }
    const idx = Math.floor(Math.random() * stagePoolRef.current.length);
    return stagePoolRef.current.splice(idx, 1)[0];
  };

  // --- Draw Mechanics ---
  const handleDraw = (type: 'sacrifice' | 'main') => {
    if (phase !== 'DRAW') return;
    if (type === 'sacrifice' && flockNoSquirrelTurnsRef.current && flockSquirrelLockDraws > 0) {
      triggerSfx('hit');
      addLog(`The Zealot's curse seals your Squirrel pile (${flockSquirrelLockDraws} turn${flockSquirrelLockDraws === 1 ? '' : 's'} remaining).`);
      return;
    }
    let card: CardDef;
    if (type === 'sacrifice') {
      card = applyPlayerTotem(cloneCard(TOKEN_SQUIRREL, ouroborosBuffs), activeTotem);
      if (flockSquirrelHealthBonusRef.current > 0) {
        card.health = (card.health || 1) + flockSquirrelHealthBonusRef.current;
      }
      if (isAcornActive) {
        card.attack = (card.attack || 0) + 1;
        card.health = (card.health || 0) + 1;
      }
      addLog("Drew a Squirrel.");
    } else {
      if (deck.length === 0) {
        addLog("Your deck is empty! A Squirrel approaches out of pity.");
        card = applyPlayerTotem(cloneCard(TOKEN_SQUIRREL, ouroborosBuffs), activeTotem);
        if (flockSquirrelHealthBonusRef.current > 0) {
          card.health = (card.health || 1) + flockSquirrelHealthBonusRef.current;
        }
        if (isAcornActive) {
          card.attack = (card.attack || 0) + 1;
          card.health = (card.health || 0) + 1;
        }
      } else {
        const remaining = [...deck];
        const drawn = remaining.pop()!;
        setDeck(remaining);
        card = transformAmorphous(applyPlayerTotem(drawn, activeTotem));
        addLog(`Drew ${card.name}.`);
      }
    }
    if (flockSquirrelLockDraws > 0) {
      setFlockSquirrelLockDraws(prev => Math.max(0, prev - 1));
    }
    setHand(prev => [...prev, card]);
    if (bossState.type === 'Zealot' && bossState.phase === 2 && bossState.skipNextPlayerTurn) {
      setZealotParalyzedBanner(true);
    }

    // --- ITEM EFFECT: Flaming Skeleton Spread at End of Opponent Turn ---
    setEnemyBoard(prev => {
      const next = [...prev];
      let spreadOccurred = false;
      for (let i = 0; i < 4; i++) {
        if (next[i]?.name === 'Flaming Skeleton') {
          const adjLanes = [i - 1, i + 1].filter(l => l >= 0 && l <= 3);
          for (const adj of adjLanes) {
            if (next[adj]?.name === 'Skeleton') {
              next[adj] = {
                ...cloneCard(CARD_FLAMING_SKELETON),
                id: `flaming-skeleton-${Date.now()}-${adj}`
              };
              spreadOccurred = true;
              addLog(`The inferno catches! Skeleton in lane ${adj + 1} becomes a Flaming Skeleton.`);
            }
          }
        }
      }
      return spreadOccurred ? next : prev;
    });

    setPhase('PLAY');
    triggerSfx('draw');
  };

  // --- Hand Selection & Undo Backup ---
  const cancelHandSelection = () => {
    if (backupState && (blood > backupState.blood || bones > backupState.bones || JSON.stringify(playerBoard) !== JSON.stringify(backupState.playerBoard))) {
      setPlayerBoard(backupState.playerBoard);
      setBlood(backupState.blood);
      setBones(backupState.bones);
      setHand(backupState.hand);
      setMorselStats(backupState.morselStats);
      addLog("Sacrifice sequence cancelled. Sacrificed creatures restored to board.");
    }
    setSelectedHandIndex(null);
    setBackupState(null);
    setSacrificedUnkillableCardIds([]);
  };

  const selectHandCard = (idx: number) => {
    if (phase !== 'PLAY') return;

    if (selectedHandIndex === idx) {
      cancelHandSelection();
    } else {
      if (selectedHandIndex !== null && backupState && (blood > backupState.blood || bones > backupState.bones || JSON.stringify(playerBoard) !== JSON.stringify(backupState.playerBoard))) {
        setPlayerBoard(backupState.playerBoard);
        setBlood(backupState.blood);
        setBones(backupState.bones);
        setHand(backupState.hand);
        setMorselStats(backupState.morselStats);
        addLog("Sacrifice sequence cancelled due to switching cards.");
        setSelectedHandIndex(null);
        setBackupState(null);
        setSacrificedUnkillableCardIds([]);
        return;
      }
      setSelectedHandIndex(idx);
      setBackupState({
        playerBoard: JSON.parse(JSON.stringify(playerBoard)),
        blood,
        bones,
        hand: JSON.parse(JSON.stringify(hand)),
        morselStats: { ...morselStats }
      });
      setSacrificedUnkillableCardIds([]);
    }
  };

  // --- Playing Cards & Sacrifices ---
  const handlePlayerSlotClick = useCallback(async (laneIndex: number, specificHandIndex?: number) => {
    if (phase !== 'PLAY' || sacrificingLane !== null) return;

    const activeHandIndex = specificHandIndex !== undefined ? specificHandIndex : selectedHandIndex;

    if (activeHandIndex === null) {
      if (playerBoard[laneIndex]) {
        addLog("Select a card from your hand first to play it or sacrifice for it.");
      }
      return;
    }

    const existingCard = playerBoard[laneIndex];

    // SACRIFICE LOGIC
    if (existingCard) {
      const existingSacKey = existingCard.id || existingCard.name || '';
      if (existingSacKey && sacrificedUnkillableCardIds.includes(existingSacKey)) {
        addLog(`${existingCard.name} has already been sacrificed for this summon.`);
        return;
      }
      const targetCard = hand[activeHandIndex];
      if (!targetCard) return;

      const requiredBlood = targetCard.cost || 0;
      if (requiredBlood <= 0) {
        addLog(`${targetCard.name} does not require blood.`);
        return;
      }

      if (blood >= requiredBlood) {
        addLog(`You already have enough blood to summon ${targetCard.name}.`);
        return;
      }

      const hasWorthySacrifice = existingCard.sigils.includes('Worthy Sacrifice');
      const isWorthyToken = (existingCard.name === 'Chime' || existingCard.name === 'Dam') && hasWorthySacrifice;

      if (existingCard.unsacrificable && !isWorthyToken) {
        addLog(`${existingCard.name} cannot be sacrificed.`);
        return;
      }

      const cardIdentifier = existingCard.id || existingCard.name || '';
      if (existingCard.sigils.includes('Unkillable') && sacrificedUnkillableCardIds.includes(cardIdentifier)) {
        addLog(`${existingCard.name} (Unkillable) has already been sacrificed for this summon attempt.`);
        return;
      }

      // Ensure drag-to-sacrifice also anchors selection & undo backup cleanly
      if (selectedHandIndex === null) {
        setSelectedHandIndex(activeHandIndex);
      }
      if (!backupState) {
        setBackupState({
          playerBoard: JSON.parse(JSON.stringify(playerBoard)),
          blood,
          bones,
          hand: JSON.parse(JSON.stringify(hand)),
          morselStats: { ...morselStats }
        });
      }

      {
        triggerSfx('sacrifice');

        if (isCardNamed(existingCard.name, "Ouroboros")) {
          const nextBuff = ouroborosBuffs + 1;
          setOuroborosBuffs(nextBuff);
          setMasterDeck(prev => prev.map(c => {
            if (isCardNamed(c.name, "Ouroboros")) {
              return { ...c, attack: (c.attack || 0) + 1, health: (c.health || 0) + 1 };
            }
            return c;
          }));
          addLog("Ouroboros was sacrificed! Its eternal form grows stronger (+1/+1).");
        }

        if (existingCard.sigils.includes('Morsel')) {
          setMorselStats(prev => ({
            attack: prev.attack + (existingCard.attack || 0),
            health: prev.health + (existingCard.health || 0)
          }));
          addLog(`Sacrificed ${existingCard.name}! Morsel buffs (+${existingCard.attack || 0}/+${existingCard.health || 0}) ready for next creature.`);
        }

        const bloodYield = existingCard.sigils.includes('Worthy Sacrifice') ? 3 : 1;
        const boneYield = existingCard.sigils.includes('Bone King') ? 4 : 1;

        setBlood(b => b + bloodYield);
        setBones(b => b + boneYield);
        setRunStats(prev => ({
          ...prev,
          cardsSacrificed: prev.cardsSacrificed + 1,
        }));
        addLog(`Sacrificed ${existingCard.name}. Gained ${bloodYield} Blood and ${boneYield} Bone(s).`);

        if (isTutorialDuel && !tutorialSacrificeTriggered) {
          setTutorialSacrificeTriggered(true);
          setDialogueTotalSteps(2);
          setBossState(prev => ({
            ...prev,
            activeDialogue: "Bones build up from every one of your creatures felled…",
          }));
          setDialogueQueue(["Commit to your actions."]);
        }


          if (existingCard.sigils.includes('Many Lives')) {
            setSacrificedUnkillableCardIds(prev => [...prev, existingCard.id || existingCard.name || '']);
            addLog(`${existingCard.name} was sacrificed but remains on the board thanks to Many Lives!`);
            return;
          }

          // Trigger physical collapse animation before clearing board slot
          setSacrificingLane(laneIndex);
          await new Promise(res => setTimeout(res, 220));
          setSacrificingLane(null);

          setPlayerBoard(prev => {
            const copy = [...prev];
            copy[laneIndex] = null;
            return copy;
          });

          if (existingCard.sigils.includes('Unkillable')) {
            setSacrificedUnkillableCardIds(prev => [...prev, cardIdentifier]);
            const masterCard = masterDeck.find(c => c.id === existingCard.id);
            const returned = cloneCard(masterCard || existingCard, ouroborosBuffs);
            if (isCardNamed(existingCard.name, 'Ouroboros')) {
              returned.attack = (existingCard.attack || 0) + 1;
              returned.health = (existingCard.health || 0) + 1;
            }
            setHand(prev => [...prev, applyPlayerTotem(transformAmorphous(returned), activeTotem)]);
            addLog(`${existingCard.name} returned to hand (Unkillable)!`);
          } else if (existingCard.sigils.includes('Pack-Animal')) {
            const masterCard = masterDeck.find(c => c.id === existingCard.id);
            const returned = cloneCard(masterCard || existingCard, ouroborosBuffs);
            returned.attack = Math.max(returned.attack || 0, existingCard.attack || 0);
            returned.health = Math.max(returned.health || 0, existingCard.health || 0);
            if (isCardNamed(existingCard.name, 'Ouroboros')) {
              returned.attack = (existingCard.attack || 0) + 1;
              returned.health = (existingCard.health || 0) + 1;
            }
            const baseSigils = masterCard?.sigils || existingCard.sigils.filter(s => s !== activeTotem?.body);
            returned.sigils = Array.from(new Set(baseSigils));
            setDeck(prev => [transformAmorphous(returned), ...prev]);
            addLog(`${existingCard.name} returned to the bottom of your deck (Pack-Animal)!`);
          }
          return;
      }
    }

    // PLAY CARD INTO EMPTY SLOT
    if (!existingCard && activeHandIndex !== null) {
      const cardToPlay = hand[activeHandIndex];
      if (!cardToPlay) return;
      const requiredBlood = cardToPlay.cost || 0;
      const requiredBones = cardToPlay.boneCost || 0;

      const canAfford = blood >= requiredBlood && bones >= requiredBones;

      if (!canAfford) {
        addLog(`Not enough resources! Requires ${requiredBlood ? `${requiredBlood} Blood ` : ''}${requiredBones ? `${requiredBones} Bones` : ''}.`);
        return;
      }

      // All blood must be consumed when a summon is successful
      setBlood(0);
      setBones(b => Math.max(0, b - requiredBones));
      if (requiredBones > 0) {
        triggerBoneShake();
      }

      const playedCard = cloneCard(cardToPlay, ouroborosBuffs);
      if (!playedCard.id) playedCard.id = `card-${Date.now()}-${Math.random()}`;
      triggerSummonWipe(playedCard.id);

      if (playedCard.name.startsWith("Red ")) {
        playedCard.wasPlayedThisDuel = true;
        setMasterDeck(prev => prev.map(c => 
          (c.id === cardToPlay.id || c.name === cardToPlay.name) 
            ? { ...c, wasPlayedThisDuel: true } 
            : c
        ));
      }

      if (morselStats.attack > 0 || morselStats.health > 0) {
        playedCard.attack = (playedCard.attack || 0) + morselStats.attack;
        playedCard.health = (playedCard.health || 0) + morselStats.health;
        spawnSigilBadge(true, laneIndex, `MORSEL +${morselStats.attack}/+${morselStats.health}`, 'emerald');
        addLog(`${playedCard.name} consumed the Morsel, gaining +${morselStats.attack}/+${morselStats.health}!`);
        setMorselStats({ attack: 0, health: 0 });
      }

      if (activeTotem.head && activeTotem.body && (playedCard.class === activeTotem.head || activeTotem.head === 'ALL Classes')) {
        spawnSigilBadge(true, laneIndex, `EFFIGY: ${activeTotem.body.toUpperCase()}`, 'violet');
      }
      setPlayerBoard(prev => {
        const copy = [...prev];
        copy[laneIndex] = playedCard;
        return copy;
      });

      setHand(prev => prev.filter((_, idx) => idx !== activeHandIndex));
      setSelectedHandIndex(null);
      setBackupState(null);
      setSacrificedUnkillableCardIds([]);
      triggerSfx('play');
      addLog(`Played ${playedCard.name} in lane ${laneIndex + 1}.`);

      // On-play sigil triggers
      if (playedCard.sigils.includes('Fecundity')) {
        const fecundityCopy = cloneCard(playedCard, ouroborosBuffs);
        fecundityCopy.sigils = fecundityCopy.sigils.filter(s => s !== 'Fecundity');
        setHand(prev => [...prev, applyPlayerTotem(fecundityCopy, activeTotem)]);
        addLog(`${playedCard.name} duplicated into your hand!`);
      }
      if (playedCard.sigils.includes('Rabbit Hole')) {
        const extraSigils = playedCard.sigils.filter(s => s !== 'Rabbit Hole');
        const rabbit = cloneCard(TOKEN_RABBIT);
        extraSigils.forEach(s => {
          if (!rabbit.sigils.includes(s)) rabbit.sigils.push(s);
        });
        setHand(prev => [...prev, applyPlayerTotem(rabbit, activeTotem)]);
        addLog(`A Rabbit emerged from the Warren into your hand!${extraSigils.length > 0 ? ` (Inherited [${extraSigils.join(', ')}])` : ''}`);
      }
      if (playedCard.sigils.includes('Ant Spawner')) {
        const ant = cloneCard(ALL_CARD_LOOKUP['Worker Ant']);
        setHand(prev => [...prev, applyPlayerTotem(ant, activeTotem)]);
        addLog("A Worker Ant scurried into your hand!");
      }
      if (playedCard.sigils.includes('Bellist')) {
        const extraSigils = playedCard.sigils.filter(s => s !== 'Bellist');
        setPlayerBoard(prev => {
          const nextBoard = [...prev];
          const createChime = () => {
            const chime = cloneCard(TOKEN_CHIME);
            chime.id = `chime-${Date.now()}-${Math.random()}`;
            extraSigils.forEach(s => {
              if (!chime.sigils.includes(s)) chime.sigils.push(s);
            });
            triggerSummonWipe(chime.id);
            return applyPlayerTotem(chime, activeTotem);
          };
          if (laneIndex > 0 && !nextBoard[laneIndex - 1]) {
            nextBoard[laneIndex - 1] = createChime();
          }
          if (laneIndex < 3 && !nextBoard[laneIndex + 1]) {
            nextBoard[laneIndex + 1] = createChime();
          }
          return nextBoard;
        });
        addLog(`Chimes sounded, materializing in adjacent spaces!${extraSigils.length > 0 ? ` (Inherited [${extraSigils.join(', ')}])` : ''}`);
      }
      if (playedCard.sigils.includes('Dam Builder')) {
        const extraSigils = playedCard.sigils.filter(s => s !== 'Dam Builder');
        setPlayerBoard(prev => {
          const nextBoard = [...prev];
          const createDam = () => {
            const dam = cloneCard(TOKEN_DAM);
            dam.id = `dam-${Date.now()}-${Math.random()}`;
            extraSigils.forEach(s => {
              if (!dam.sigils.includes(s)) dam.sigils.push(s);
            });
            triggerSummonWipe(dam.id);
            return applyPlayerTotem(dam, activeTotem);
          };
          if (laneIndex > 0 && !nextBoard[laneIndex - 1]) {
            nextBoard[laneIndex - 1] = createDam();
          }
          if (laneIndex < 3 && !nextBoard[laneIndex + 1]) {
            nextBoard[laneIndex + 1] = createDam();
          }
          return nextBoard;
        });
        addLog(`Dams constructed in adjacent spaces!${extraSigils.length > 0 ? ` (Inherited [${extraSigils.join(', ')}])` : ''}`);
      }
      if (!enemyBoard[laneIndex]) {
        const guardianIdx = enemyBoard.findIndex(c => c?.sigils.includes('Guardian'));
        if (guardianIdx !== -1) {
          const gCard = enemyBoard[guardianIdx];
          if (gCard) {
            const cardId = gCard.id || `guardian-${guardianIdx}-${Date.now()}`;
            gCard.id = cardId;
            await triggerLateralMove(cardId, laneIndex - guardianIdx);
            setEnemyBoard(prev => {
              const nextBoard = [...prev];
              nextBoard[laneIndex] = gCard;
              nextBoard[guardianIdx] = null;
              return nextBoard;
            });
            addLog(`Enemy ${gCard.name} leaped to guard lane ${laneIndex + 1}!`);
          }
        }
      }
      if (playedCard.sigils.includes('Hoarder')) {
        if (deck.length > 0) {
          setScreen('EVENT_HOARDER_SEARCH');
        } else {
          addLog(`Your deck is empty. ${playedCard.name} found nothing.`);
        }
      }
    }
  }, [
    phase,
    selectedHandIndex,
    playerBoard,
    enemyBoard,
    blood,
    bones,
    hand,
    deck.length,
    backupState,
    sacrificedUnkillableCardIds,
    ouroborosBuffs,
    masterDeck,
    activeTotem,
    morselStats,
    addLog,
    triggerSfx
  ]);

  // --- Calibrated Pointer Drag & Drop Calculation Handlers ---
  const handleHandCardPointerDown = (e: React.PointerEvent, idx: number) => {
    if (phase !== 'PLAY') return;
    if (e.button !== 0) return; // Primary pointer only

    const container = gameContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = currentScaleRef.current || (rect.width > 0 ? rect.width / 1280 : 1);
    const virtualX = (e.clientX - rect.left) / scale;
    const virtualY = (e.clientY - rect.top) / scale;

    setDragState({
      cardIndex: idx,
      card: hand[idx],
      startX: virtualX,
      startY: virtualY,
      currentX: virtualX,
      currentY: virtualY,
      hasMoved: false,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const container = gameContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scale = currentScaleRef.current || (rect.width > 0 ? rect.width / 1280 : 1);
      const virtualX = (e.clientX - rect.left) / scale;
      const virtualY = (e.clientY - rect.top) / scale;

      const dist = Math.hypot(virtualX - dragState.startX, virtualY - dragState.startY);
      const hasMoved = dragState.hasMoved || dist > 6;

      setDragState(prev => (prev ? {
        ...prev,
        currentX: virtualX,
        currentY: virtualY,
        hasMoved,
      } : null));

      // Matrix Coordinate Calibrated Slot Targeting
      let foundLane: number | null = null;
      for (let lane = 0; lane < 4; lane++) {
        const slotEl = playerSlotRefs.current[lane];
        if (slotEl) {
          const slotRect = slotEl.getBoundingClientRect();
          const slotLeft = (slotRect.left - rect.left) / scale;
          const slotTop = (slotRect.top - rect.top) / scale;
          const slotWidth = slotRect.width / scale;
          const slotHeight = slotRect.height / scale;

          if (
            virtualX >= slotLeft - 10 &&
            virtualX <= slotLeft + slotWidth + 10 &&
            virtualY >= slotTop - 10 &&
            virtualY <= slotTop + slotHeight + 10
          ) {
            foundLane = lane;
            break;
          }
        }
      }
      setHoveredSlotLane(foundLane);
    };
// --- ITEM EFFECT: Burn Ticks at End of Player Turn ---
    setPlayerBoard(prev => {
      const next = [...prev];
      let boardChanged = false;
      for (let i = 0; i < 4; i++) {
        const c = next[i];
        if (c && (c as any).isBurned) {
          boardChanged = true;
          const newAtk = Math.max(0, (c.attack || 0) - 1);
          const newHp = (c.health || 0) - 2;
          if (newHp <= 0) {
            addLog(`The flames consume your ${c.name} in lane ${i + 1}.`);
            next[i] = null;
          } else {
            c.attack = newAtk;
            c.health = newHp;
            addLog(`Your ${c.name} in lane ${i + 1} suffers burn (-1 ATK, -2 HP).`);
          }
        }
      }
      return boardChanged ? next : prev;
    });
    const handleGlobalPointerUp = (e: PointerEvent) => {
      const container = gameContainerRef.current;
      const currentDrag = dragState;
      setDragState(null);
      setHoveredSlotLane(null);

      if (!container || !currentDrag) return;

      const rect = container.getBoundingClientRect();
      const scale = currentScaleRef.current || (rect.width > 0 ? rect.width / 1280 : 1);
      const virtualX = (e.clientX - rect.left) / scale;
      const virtualY = (e.clientY - rect.top) / scale;

      let targetLane: number | null = null;
      for (let lane = 0; lane < 4; lane++) {
        const slotEl = playerSlotRefs.current[lane];
        if (slotEl) {
          const slotRect = slotEl.getBoundingClientRect();
          const slotLeft = (slotRect.left - rect.left) / scale;
          const slotTop = (slotRect.top - rect.top) / scale;
          const slotWidth = slotRect.width / scale;
          const slotHeight = slotRect.height / scale;

          if (
            virtualX >= slotLeft - 10 &&
            virtualX <= slotLeft + slotWidth + 10 &&
            virtualY >= slotTop - 10 &&
            virtualY <= slotTop + slotHeight + 10
          ) {
            targetLane = lane;
            break;
          }
        }
      }

      if (currentDrag.hasMoved) {
        if (targetLane !== null) {
          handlePlayerSlotClick(targetLane, currentDrag.cardIndex);
        }
      } else {
        selectHandCard(currentDrag.cardIndex);
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

      return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [dragState]);

// --- Items Engine Execution Handlers ---
  const handleUseItem = (slotIndex: number) => {
    if (phase !== 'PLAY') return;
    const itemId = items[slotIndex];
    if (!itemId) return;

    // Targeted items toggle board selection mode
    if (itemId === 'joker_stamp' || itemId === 'large_matchbook') {
      if (itemTargetMode === itemId && itemTargetSourceSlot === slotIndex) {
        setItemTargetMode(null);
        setItemTargetSourceSlot(null);
        addLog('Targeting cancelled.');
      } else {
        setItemTargetMode(itemId);
        setItemTargetSourceSlot(slotIndex);
        addLog(`Select a creature on the opponent's front row to use ${ALL_ITEMS[itemId].name}.`);
      }
      return;
    }

    consumeAndExecuteItem(slotIndex, itemId);
  };

  const consumeAndExecuteItem = (slotIndex: number, itemId: ItemId) => {
    const nextItems = [...items];

    switch (itemId) {
      case 'magical_hat': {
        nextItems[slotIndex] = null;
        triggerSfx('draw');
        if (Math.random() < 0.5) {
          const rab = cloneCard(TOKEN_RABBIT);
          setHand(prev => [...prev, rab]);
          addLog("You reach into the Magical Hat... and pull out a Rabbit!");
        } else {
          const lane = Math.floor(Math.random() * 4);
          const existingVictim = playerBoard[lane];
          const stoneWallCard = ALL_CARD_LOOKUP['Stone Wall'] || {
            name: 'Stone Wall',
            class: 'Terrain' as any,
            attack: 0,
            health: 3,
            cost: 0,
            emoji: '🧱',
            sigils: []
          };

          (async () => {
            if (existingVictim) {
              triggerSfx('sacrifice');
              await animateCardDestroy(true, lane);
              addLog(`The Magical Hat drops a Stone Wall into lane ${lane + 1}, crushing your ${existingVictim.name}!`);
            } else {
              addLog(`The Magical Hat manifests a Stone Wall in lane ${lane + 1}.`);
            }

            const wallId = `stone-hat-${Date.now()}`;
            triggerSummonWipe(wallId);
            triggerSfx('hit');
            setIsBoardRumbling(true);
            setTimeout(() => setIsBoardRumbling(false), 220);

            setPlayerBoard(prev => {
              const next = [...prev];
              next[lane] = {
                ...cloneCard(stoneWallCard),
                id: wallId
              };
              return next;
            });
          })();
        }
        break;
      }

      case 'bone_lords_horn': {
        nextItems[slotIndex] = null;
        triggerSfx('bone');
        setIsBoardShaking(true);
        setTimeout(() => setIsBoardShaking(false), 600);

        setPlayerBoard(prev => {
          return prev.map((card, idx) => {
            if (!card) return null;
            let replacementKey = 'Skeleton';
            if (card.class === 'Insect') replacementKey = 'Exoskeleton';
            else if (card.class === 'Reptile') replacementKey = 'Tortoise Shell';
            else if (card.class === 'Canine') replacementKey = 'Skeleton Canine';
            else if (card.class === 'Hooved') replacementKey = 'Demon Elk';
            else if (card.class === 'Avian') replacementKey = 'Reaper';

            const baseCard = ALL_CARD_LOOKUP[replacementKey] || ALL_CARD_LOOKUP['Skeleton'];
            addLog(`Your ${card.name} evolves into a ${baseCard.name}!`);
            return {
              ...cloneCard(baseCard),
              id: `bonehorn-${Date.now()}-${idx}`
            };
          });
        });
        break;
      }

      case 'coin_purse': {
        if (isBossMatch && bossState?.type === 'Zealot' && bossPhase === 2) {
          nextItems[slotIndex] = 'bronze_crucifix';
          triggerSfx('bell');
          setModalAlert({
            title: 'Render Unto Caesar',
            message: 'The Zealot seizes the pouch of coins with feverish eyes and tosses you an ancient Bronze Crucifix in return.',
            btnText: 'Accept the Relic',
            onAction: () => setModalAlert(null as any)
          });
          addLog("The Zealot bartered the Bronze Crucifix for your Coin Purse.");
        } else {
          nextItems[slotIndex] = null;
          triggerSfx('bone');
          setBones(b => b + 4);
          addLog("You untie the Coin Purse, gathering 4 bones.");
        }
        break;
      }

      case 'bronze_crucifix': {
        if (!isBossMatch || bossState?.type !== 'BoneLord') {
          if (crucifixUsedThisDuel) {
            addLog("The Bronze Crucifix lies inert for the remainder of this duel.");
            return;
          }
          setCrucifixUsedThisDuel(true);
          addLog("...after picking this up, you don't really want to get rid of it just yet...");
          return;
        }

        nextItems[slotIndex] = null;
        triggerSfx('hit');

        if (bossPhase === 1) {
          addLog("The Bronze Crucifix radiates blinding radiance! Phase 1 is severed.");
          setScale(0);

          const nextEBoard: (CardDef | null)[] = [null, null, null, null];
          const nextEQueue: (CardDef | null)[] = [null, null, null, null];

          let reaperCol = -1;
          const emptyCols = [0, 1, 2, 3].filter(c => playerBoard[c] === null);
          if (emptyCols.length > 0) {
            reaperCol = emptyCols[0];
          } else {
            let maxAtk = -1;
            for (let c = 0; c < 4; c++) {
              const pCard = playerBoard[c];
              if (pCard) {
                const atk = getCardAttack(pCard, c, true, playerBoard, nextEBoard);
                if (atk > maxAtk) {
                  maxAtk = atk;
                  reaperCol = c;
                }
              }
            }
          }
          if (reaperCol === -1) reaperCol = 0;

          nextEBoard[reaperCol] = cloneCard(ALL_CARD_LOOKUP['Reaper'], 0);
          const treeCard = ALL_CARD_LOOKUP['Felled Tree'] || {
            name: 'Felled Tree',
            class: 'No Class',
            attack: 0,
            health: 3,
            emoji: '🌳',
            sigils: ['Made of Stone'],
            unsacrificable: true,
          };
          const queueCols = [0, 1, 2, 3].filter(c => c !== reaperCol);
          nextEQueue[queueCols[0] ?? 0] = cloneCard(treeCard, 0);
          nextEQueue[queueCols[1] ?? 1] = cloneCard(ALL_CARD_LOOKUP['Skeleton'], 0);

          const nextPBoard = playerBoard.map((c, idx) => {
            if (!c) return null;
            const currentEffectiveAttack = getCardAttack(c, idx, true, playerBoard, nextEBoard);
            return {
              ...c,
              attack: Math.max(0, c.health || 0),
              health: Math.max(1, currentEffectiveAttack),
              sigils: Array.from(new Set([...c.sigils, 'Shadow'])),
            };
          });

          setEnemyBoard(nextEBoard);
          setEnemyQueue(nextEQueue);
          setPlayerBoard(nextPBoard);
          setBossPhase(2);
          setBossState(prev => ({
            ...prev,
            phase: 2,
            activeDialogue: null,
            bgHex: '#230618',
            bgTransitionDuration: 4,
          }));
          addLog("=== THE BONE LORD: PHASE 2 INITIALIZED ===");
          addLog("Shadow envelops your creatures! Power and health inverted!");
        } else if (bossPhase === 2) {
          addLog("The Bronze Crucifix radiates blinding radiance! Phase 2 is severed.");
          setScale(0);

          const bloodMoonCard = {
            ...cloneCard(ALL_CARD_LOOKUP['BLOOD MOON'], 0),
            id: `blood-moon-${Date.now()}`,
          };
          setEnemyBoard([bloodMoonCard, null, null, null]);
          setEnemyQueue([null, null, null, null]);
          setBossPhase(3);
          setBossState(prev => ({
            ...prev,
            phase: 3,
            activeDialogue: null,
            bgHex: '#300202',
            bgTransitionDuration: 5,
          }));
          setIsBoardRumbling(true);
          setIsBloodMoonDropping(true);
          if (typeof ChiptuneAudio !== 'undefined' && (ChiptuneAudio as any).playFinalBossPhase3) {
            (ChiptuneAudio as any).playFinalBossPhase3(0.6);
          }
          setTimeout(() => {
            setIsBoardRumbling(false);
            setIsBloodMoonDropping(false);
          }, 1400);
          addLog("=== THE BONE LORD: PHASE 3 - THE BLOOD MOON DESCENDS ===");
        } else if (bossPhase === 3) {
          setEnemyBoard([null, null, null, null]);
          setEnemyQueue([null, null, null, null]);
          setBossState(prev => ({ ...prev, isBloodMoonDarkened: true }));
          addLog("...the moon turns dark...");
          setModalAlert({
            title: 'The Bone Lord Speaks',
            message: '....fool.....',
            btnText: 'Witness',
            onAction: () => {
              setModalAlert(null as any);
              handleWinMatch();
            }
          });
        }
        break;
      }

      case 'loaded_die': {
        nextItems[slotIndex] = null;
        triggerSfx('draw');
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll === 5) {
          setHand(prev => {
            const count = prev.length;
            const rabbits = Array.from({ length: count }, () => cloneCard(TOKEN_RABBIT));
            addLog(`You rolled a 5! Your entire hand turns into ${count} Rabbits!`);
            return rabbits;
          });
        } else {
          const drawCount = (roll === 1 || roll === 3) ? 1 : Math.floor(roll / 2);
          setDieModal({ roll, count: drawCount });
        }
        break;
      }

      case 'bronze_acorn': {
        nextItems[slotIndex] = null;
        triggerSfx('play');
        setIsAcornActive(true);

        const buffCard = (c: CardDef | null) => {
          if (c && c.name === 'Squirrel') {
            return {
              ...c,
              attack: (c.attack || 0) + 1,
              health: (c.health || 0) + 1
            };
          }
          return c;
        };

        setPlayerBoard(prev => prev.map(buffCard));
        setHand(prev => prev.map(c => buffCard(c)!));
        addLog("The Bronze Acorn takes root. All Squirrels gain +1 Power and +1 Health!");
        break;
      }
    }

    if (flockDisappearingRelicsRef.current && items[slotIndex] !== null && nextItems[slotIndex] === null) {
      nextItems.splice(slotIndex, 1);
      addLog("The Zealot's curse consumes the empty relic slot forever.");
    }
    setItems(nextItems);
  };

  const handleItemTargetLane = async (laneIndex: number) => {
    const targetCard = enemyBoard[laneIndex];
    if (!targetCard) return;

    const sourceSlot = itemTargetSourceSlot;
    const mode = itemTargetMode;

    setItemTargetMode(null);
    setItemTargetSourceSlot(null);

    setItems(prev => {
      const next = [...prev];
      if (sourceSlot !== null) {
        if (flockDisappearingRelicsRef.current) {
          next.splice(sourceSlot, 1);
          addLog("The Zealot's curse consumes the empty relic slot forever.");
        } else {
          next[sourceSlot] = null;
        }
      }
      return next;
    });

    if (mode === 'joker_stamp') {
      triggerSfx('play');
      setEnemyBoard(prev => {
        const next = [...prev];
        if (next[laneIndex]) {
          next[laneIndex] = {
            ...next[laneIndex]!,
            sigils: ['Waterborne'],
            attack: 0,
            health: 1
          };
        }
        return next;
      });
      addLog(`The Joker Stamp brands enemy ${targetCard.name} with Waterborne, reducing it to 0/1.`);
    } else if (mode === 'large_matchbook') {
      if (targetCard.name === 'Stone Wall') {
        setIsBoardShaking(true);
        setTimeout(() => setIsBoardShaking(false), 500);
        addLog("The Stone Wall remains unscathed by the matchbook's flame!");
      } else if (targetCard.name === 'Skeleton') {
        triggerSfx('hit');
        setEnemyBoard(prev => {
          const next = [...prev];
          next[laneIndex] = {
            ...cloneCard(CARD_FLAMING_SKELETON),
            id: `flaming-skeleton-${Date.now()}`
          };
          return next;
        });
        addLog(`The Skeleton erupts into a Flaming Skeleton!`);
      } else {
        triggerSfx('hit');
        setIncineratingLane(laneIndex);
        addLog(`The Large Matchbook incinerates enemy ${targetCard.name}!`);
        await new Promise(res => setTimeout(res, 950));
        setEnemyBoard(prev => {
          const next = [...prev];
          next[laneIndex] = null;
          return next;
        });
        setIncineratingLane(null);
      }

      // Inflict Burn on player's corresponding and adjacent columns
      setPlayerBoard(prev => {
        const next = [...prev];
        const affectedCols = [laneIndex - 1, laneIndex, laneIndex + 1].filter(c => c >= 0 && c <= 3);
        affectedCols.forEach(col => {
          const pc = next[col];
          if (pc) {
            (pc as any).isBurned = true;
            pc.attack = Math.max(0, (pc.attack || 0) - 1);
            pc.health = (pc.health || 0) - 2;
            if (pc.health <= 0) {
              addLog(`The backdraft burns away your ${pc.name} in lane ${col + 1}!`);
              next[col] = null;
            } else {
              addLog(`Your ${pc.name} in lane ${col + 1} catches fire (-1 ATK, -2 HP)!`);
            }
          }
        });
        return next;
      });
    }
  };
  
  // --- End Turn & Combat Resolution ---
  const handleEndTurn = async (forceForfeit: boolean = false, skipSfx: boolean = false) => {
    if (phase !== 'PLAY' && !forceForfeit) return;

    setSelectedHandIndex(null);
    setBackupState(null);
    setSacrificedUnkillableCardIds([]);
    setBlood(0);
    setMorselStats({ attack: 0, health: 0 });

    setPhase('COMBAT');
    if (!forceForfeit) {
      if (!skipSfx) triggerSfx('bell');
      addLog("=== COMBAT: Player Assault ===");
    } else {
      addLog("=== TURN FORFEIT: Paralyzed by Divine Grace ===");
    }

    await executeCombatPhase(forceForfeit);
  };

  // --- Diegetic Stone Glyph Trigger ---
  const handleTalismanPrick = () => {
    if (phase !== 'PLAY' || isTalismanPricked) return;
    setIsTalismanPricked(true);
    triggerSfx('talisman_prick');
    setTimeout(() => {
      handleEndTurn(false, true);
    }, 220);
  };

  // --- Global Keyboard & Scroll Wheel Controls (Esc / Space / Draw Wheel) ---
  const lastWheelDrawRef = React.useRef<number>(0);
  const hotkeyRef = React.useRef({
    screen,
    phase,
    showPauseMenu,
    showAudioSettings,
    showViewDeck,
    modalAlert,
    sigilDetailModal,
    bossIntroBanner,
    selectedHandIndex,
    sacrificingLane,
    isTalismanPricked,
    blood,
    hasActiveDialogue: Boolean(bossState.activeDialogue),
    setShowPauseMenu,
    setShowAudioSettings,
    setShowViewDeck,
    setSigilDetailModal,
    setBossIntroBanner,
    bossIntroTimerRef,
    cancelHandSelection,
    handleTalismanPrick,
    handleDraw,
  });
  hotkeyRef.current = {
    screen,
    phase,
    showPauseMenu,
    showAudioSettings,
    showViewDeck,
    modalAlert,
    sigilDetailModal,
    bossIntroBanner,
    selectedHandIndex,
    sacrificingLane,
    isTalismanPricked,
    blood,
    hasActiveDialogue: Boolean(bossState.activeDialogue),
    setShowPauseMenu,
    setShowAudioSettings,
    setShowViewDeck,
    setSigilDetailModal,
    setBossIntroBanner,
    bossIntroTimerRef,
    cancelHandSelection,
    handleTalismanPrick,
    handleDraw,
  };

  useEffect(() => {
    const isInsideScrollable = (el: HTMLElement | null): boolean => {
      let node = el;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        const scrollableY = style.overflowY === 'auto' || style.overflowY === 'scroll';
        if (scrollableY && node.scrollHeight > node.clientHeight + 2) {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const s = hotkeyRef.current;
      const target = e.target as HTMLElement | null;
      const isTyping = Boolean(
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        )
      );

      if (e.key === 'Escape') {
        if (e.repeat) return;
        if (s.showAudioSettings) {
          e.preventDefault();
          s.setShowAudioSettings(false);
          return;
        }
        if (s.showViewDeck) {
          e.preventDefault();
          s.setShowViewDeck(false);
          return;
        }
        if (s.showPauseMenu) {
          e.preventDefault();
          s.setShowPauseMenu(false);
          return;
        }
        if (s.screen === 'DUEL' && s.phase === 'PLAY' && s.selectedHandIndex !== null) {
          e.preventDefault();
          s.cancelHandSelection();
          return;
        }
        if (s.screen !== 'SPLASH' && s.screen !== 'GAME_OVER') {
          e.preventDefault();
          s.setShowPauseMenu(true);
        }
        return;
      }

      if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (isTyping || e.repeat) return;
        if (s.showViewDeck) {
          e.preventDefault();
          s.setShowViewDeck(false);
          return;
        }
        if (
          !s.showPauseMenu &&
          !s.showAudioSettings &&
          s.screen !== 'SPLASH' &&
          s.screen !== 'DECK_SELECT' &&
          s.screen !== 'GAME_OVER' &&
          s.screen !== 'DEV_MENU'
        ) {
          e.preventDefault();
          s.setShowViewDeck(true);
        }
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        if (isTyping || e.repeat) return;
        const blurActive = () => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        };
        if (s.modalAlert) {
          e.preventDefault();
          blurActive();
          s.modalAlert.onAction();
          return;
        }
        if (s.sigilDetailModal) {
          e.preventDefault();
          blurActive();
          s.setSigilDetailModal(null);
          return;
        }
        if (s.bossIntroBanner) {
          e.preventDefault();
          blurActive();
          if (s.bossIntroTimerRef.current) {
            window.clearTimeout(s.bossIntroTimerRef.current);
            s.bossIntroTimerRef.current = null;
          }
          s.setBossIntroBanner(null);
          return;
        }
        if (s.showAudioSettings) {
          e.preventDefault();
          blurActive();
          s.setShowAudioSettings(false);
          return;
        }
        if (s.showViewDeck) {
          e.preventDefault();
          blurActive();
          s.setShowViewDeck(false);
          return;
        }
        if (s.showPauseMenu) {
          e.preventDefault();
          blurActive();
          s.setShowPauseMenu(false);
          return;
        }
        if (
          s.screen === 'DUEL' &&
          s.phase === 'PLAY' &&
          !s.hasActiveDialogue &&
          s.sacrificingLane === null &&
          !s.isTalismanPricked &&
          s.blood === 0
        ) {
          e.preventDefault();
          blurActive();
          s.handleTalismanPrick();
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      const s = hotkeyRef.current;
      if (
        s.screen !== 'DUEL' ||
        s.phase !== 'DRAW' ||
        s.showPauseMenu ||
        s.showAudioSettings ||
        s.showViewDeck ||
        s.hasActiveDialogue
      ) {
        return;
      }
      if (Math.abs(e.deltaY) < 12) return;
      if (isInsideScrollable(e.target as HTMLElement | null)) return;

      const now = Date.now();
      if (now - lastWheelDrawRef.current < 450) return;
      lastWheelDrawRef.current = now;

      e.preventDefault();
      s.handleDraw(e.deltaY < 0 ? 'main' : 'sacrifice');
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const s = hotkeyRef.current;
      if (
        s.screen === 'DUEL' &&
        s.phase === 'PLAY' &&
        !s.showPauseMenu &&
        !s.showAudioSettings &&
        !s.showViewDeck &&
        !s.hasActiveDialogue &&
        s.sacrificingLane === null &&
        s.selectedHandIndex !== null
      ) {
        s.cancelHandSelection();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  // --- Movement Resolution with Lateral Translation Animations ---
  const ACT4_FIRE_EVENT_BGS: Record<string, string> = {
    'altarevent.jpg': 'fire_altarevent.jpg',
    'bonelordevent.jpg': 'fire_bonelordevent.jpg',
    'campfireevent.jpg': 'fire_campfireevent.jpg',
    'choiceevent.jpg': 'fire_choiceevent.jpg',
    'costeventbg.jpg': 'fire_costeventbg.jpg',
    'crossroads-select.jpg': 'fire_crossroads-select.jpg',
    'merchant_event.jpg': 'fire_merchant_event.jpg',
    'trialevent.jpg': 'fire_trialevent.jpg',
    'tribeeventbg.jpg': 'fire_tribeevent.jpg',
    'weaverevent.jpg': 'fire_weaverevent.jpg',
    'zealotboss.jpg': 'fire_zealotboss.jpg',
  };
  const getEventScreenBgStyle = (filename: string): React.CSSProperties => {
    const currentAct = actMap?.act ?? displayStage;
    const resolved = currentAct === 4 && ACT4_FIRE_EVENT_BGS[filename] ? ACT4_FIRE_EVENT_BGS[filename] : filename;
    return getScreenBgStyle(resolved);
  };

  const renderActWeather = (posClass: string, keyPrefix: string) => (
    <ActWeather act={actMap?.act ?? displayStage} posClass={posClass} keyPrefix={keyPrefix} />
  );



  const resolveMovements = async (isPlayer: boolean, board: (CardDef | null)[]): Promise<(CardDef | null)[]> => {
    const nextBoard = [...board];
    const movedSet = new Set<string>();

    for (let i = 0; i < 4; i++) {
      const card = nextBoard[i];
      if (!card || !card.id || movedSet.has(card.id)) continue;

      const hasSprint = card.sigils.includes('Sprinter');
      const hasRampager = card.sigils.includes('Rampager');
      const hasHefty = card.sigils.includes('Hefty');
      if (!hasSprint && !hasRampager && !hasHefty) continue;

      movedSet.add(card.id);
      let dir = card.sprintDir ?? (isLeftFacingCard(card.name) ? -1 : 1);
        let target = i + dir;

        // 1. SPRINTER: Moves into open space; bounces immediately off board edges
        if (hasSprint && !hasHefty && !hasRampager) {
          if (target < 0 || target > 3) {
            dir = -dir;
            target = i + dir;
          }

          const canMove = target >= 0 && target <= 3 && nextBoard[target] === null;

          if (canMove) {
            await triggerLateralMove(card.id, target - i);
            nextBoard[target] = card;
            if (isCardNamed(card.name, "Demon Elk")) {
              nextBoard[i] = isPlayer ? applyPlayerTotem(cloneCard(TOKEN_VERTIBRAE), activeTotem) : cloneCard(TOKEN_VERTIBRAE);
            } else {
              nextBoard[i] = null;
            }
            card.sprintDir = dir;
            addLog(`${isPlayer ? 'Your' : 'Enemy'} ${card.name} stepped into lane ${target + 1}.`);
            if (isPlayer) setPlayerBoard([...nextBoard]);
            else setEnemyBoard([...nextBoard]);
            await new Promise(res => setTimeout(res, 100));
          } else {
            card.sprintDir = -dir;
            addLog(`${isPlayer ? 'Your' : 'Enemy'} ${card.name} was blocked and turned around.`);
            if (isPlayer) setPlayerBoard([...nextBoard]);
            else setEnemyBoard([...nextBoard]);
          }
        }

        // 2. RAMPAGER: Displaces target card; bounces immediately off board edges
        else if (hasRampager) {
          if (target < 0 || target > 3) {
            dir = -dir;
            target = i + dir;
          }

          const canMove = target >= 0 && target <= 3;

          if (canMove) {
            const swapped = nextBoard[target];
            await Promise.all([
              triggerLateralMove(card.id, target - i),
              swapped?.id ? triggerLateralMove(swapped.id, i - target) : Promise.resolve(),
            ]);
            nextBoard[target] = card;
            nextBoard[i] = swapped;
            card.sprintDir = dir;
            addLog(`${isPlayer ? 'Your' : 'Enemy'} ${card.name} rampaged, displacing ${swapped?.name || 'empty space'}.`);
            if (isPlayer) setPlayerBoard([...nextBoard]);
            else setEnemyBoard([...nextBoard]);
            await new Promise(res => setTimeout(res, 100));
          } else {
            card.sprintDir = -dir;
            addLog(`${isPlayer ? 'Your' : 'Enemy'} ${card.name} hit the edge and turned around.`);
            if (isPlayer) setPlayerBoard([...nextBoard]);
            else setEnemyBoard([...nextBoard]);
          }
        }

        // 3. HEFTY: Shoves line toward nearest empty slot; bounces immediately off board edges
        else if (hasHefty) {
          if (target < 0 || target > 3) {
            dir = -dir;
            target = i + dir;
          }

          let emptySlot = -1;
          for (let j = target; j >= 0 && j <= 3; j += dir) {
            if (nextBoard[j] === null) {
              emptySlot = j;
              break;
            }
          }

          if (emptySlot !== -1) {
            const shiftPromises: Promise<void>[] = [];
            for (let j = emptySlot; j !== i; j -= dir) {
              const shiftCard = nextBoard[j - dir];
              if (shiftCard?.id) {
                shiftPromises.push(triggerLateralMove(shiftCard.id, dir));
              }
            }
            await Promise.all(shiftPromises);
            for (let j = emptySlot; j !== i; j -= dir) {
              nextBoard[j] = nextBoard[j - dir];
            }
            nextBoard[target] = card;
            if (isCardNamed(card.name, "Demon Elk")) {
              nextBoard[i] = isPlayer ? applyPlayerTotem(cloneCard(TOKEN_VERTIBRAE), activeTotem) : cloneCard(TOKEN_VERTIBRAE);
            } else {
              nextBoard[i] = null;
            }
            card.sprintDir = dir;
            addLog(`${card.name} shoved the line toward lane ${emptySlot + 1}.`);
            if (isPlayer) setPlayerBoard([...nextBoard]);
            else setEnemyBoard([...nextBoard]);
            await new Promise(res => setTimeout(res, 100));
          } else {
            card.sprintDir = -dir;
            addLog(`${card.name} could not shove and turned around.`);
            if (isPlayer) setPlayerBoard([...nextBoard]);
            else setEnemyBoard([...nextBoard]);
          }
        }
    }

    return nextBoard;
  };

  // --- Evolution Resolution ---
  const resolveEvolutions = async (isPlayer: boolean, board: (CardDef | null)[]): Promise<(CardDef | null)[]> => {
    // Find any cards maturing via Fledgling
    const evolvingLanes: number[] = [];
    board.forEach((card, idx) => {
      if (card && card.sigils.includes('Fledgling') && ((card.age || 0) + 1) >= 1) {
        evolvingLanes.push(idx);
      }
    });

    if (evolvingLanes.length > 0) {
      // Phase 1: Flip old card face-down to show card back
      setEvolvingCards(evolvingLanes.map(lane => ({ isPlayer, lane, phase: 'down' })));
      await new Promise(res => setTimeout(res, 250));
    }

    const nextBoard = board.map(card => {
      if (!card || !card.sigils.includes('Fledgling')) return card;
      const age = (card.age || 0) + 1;
      if (age >= 1) {
        const evoTarget = EVOLUTION_MAP[card.name] || card.evolvesInto;
        let evoName: string | undefined;

        if (Array.isArray(evoTarget)) {
          const roll = Math.random() * 100;
          let acc = 0;
          for (const opt of evoTarget) {
            acc += opt.chance;
            if (roll < acc) {
              evoName = opt.target;
              break;
            }
          }
          if (!evoName && evoTarget.length > 0) {
            evoName = evoTarget[0].target;
          }
        } else if (typeof evoTarget === 'string') {
          evoName = evoTarget;
        }

        if (evoName && ALL_CARD_LOOKUP[evoName]) {
            const evolved = cloneCard(ALL_CARD_LOOKUP[evoName], ouroborosBuffs);
            evolved.id = card.id;
            evolved.attack = (evolved.attack || 0) + Math.max(0, (card.attack || 0) - (ALL_CARD_LOOKUP[card.name]?.attack || 0));
            evolved.health = (evolved.health || 0) + Math.max(0, (card.health || 0) - (ALL_CARD_LOOKUP[card.name]?.health || 0));
            if (card.isGoobertClone) evolved.isGoobertClone = true;
            if (card.isMycologistCombined) evolved.isMycologistCombined = true;

            // Retain altar-transferred crests across evolution
            const basePreEvoSigils = ALL_CARD_LOOKUP[card.name]?.sigils || [];
            const inheritedSigils = (card.sigils || []).filter(s => {
              if (basePreEvoSigils.includes(s)) return false;
              if (s === 'Fledgling') return false;
              if (isPlayer && activeTotem && (card.class === activeTotem.head || activeTotem.head === 'ALL Classes') && s === activeTotem.body) {
                return false;
              }
              return true;
            });
            inheritedSigils.forEach(s => {
              if (!evolved.sigils.includes(s)) {
                evolved.sigils.push(s);
              }
            });

            (evolved as any).hasEvolved = true;
            addLog(`${isPlayer ? 'Your' : 'Enemy'} ${card.name} matured into a ${evoName}!`);
            const finalEvolved = isPlayer ? applyPlayerTotem(evolved, activeTotem) : evolved;
            finalEvolved.sigils = (finalEvolved.sigils || []).filter(s => s !== 'Fledgling');
            return finalEvolved;
          } else {
          const elder = { ...card };
          (elder as any).hasEvolved = true;
          elder.name = `Elder ${card.name}`;
          elder.attack = (elder.attack || 0) + 1;
          elder.health = (elder.health || 0) + 2;
          elder.sigils = (elder.sigils || []).filter(s => s !== 'Fledgling');
          addLog(`${isPlayer ? 'Your' : 'Enemy'} ${card.name} matured into an Elder form! (+1 ATK / +2 HP)`);
          return elder;
        }
      }
      return { ...card, age };
    });

    if (evolvingLanes.length > 0) {
      evolvingLanes.forEach(evLane => spawnSigilBadge(isPlayer, evLane, 'EVOLVED', 'gold'));
      // Update board state mid-flip so the card reveals its evolved art
      if (isPlayer) {
        setPlayerBoard(nextBoard);
      } else {
        setEnemyBoard(nextBoard);
      }

      // Phase 2: Flip evolved card face-up onto the board
      setEvolvingCards(evolvingLanes.map(lane => ({ isPlayer, lane, phase: 'up' })));
      triggerSfx('play');
      await new Promise(res => setTimeout(res, 250));

      setEvolvingCards([]);
    }

    return nextBoard;
  };

  // --- Complete Combat Execution with Visual Pacing ---
  const executeCombatPhase = async (forceSkipPlayerStrikes: boolean = false) => {
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
    let currentScale = scale;
    let currPBoard = [...playerBoard];
    let currEBoard = [...enemyBoard];
    let currEQueue = [...enemyQueue];
    let currDeck = [...deck];
    let currBones = bones;
    let handAdditions: CardDef[] = [];

    const checkScaleMatch = (val: number): 'WIN' | 'LOSS' | 'PHASE_SHIFT' | 'CONTINUE' => {
      const winTarget = getRequiredScaleWinDamage();
      if (val >= winTarget) {
        if (isBossMatch) {
          if ((bossState.type === 'The Weaver' || (bossState.type as any) === 'Woodcarver' || !bossState.type) && bossPhase === 1) return 'PHASE_SHIFT';
          if (bossState.type === 'Zealot' && bossPhase === 1) return 'PHASE_SHIFT';
          if (bossState.type === 'The Begotten' && bossPhase === 1) return 'PHASE_SHIFT';
          if (bossState.type === 'BoneLord' && (bossPhase === 1 || bossPhase === 2)) return 'PHASE_SHIFT';
        }
        return 'WIN';
      }
      if (val <= -5) {
        return 'LOSS';
      }
      return 'CONTINUE';
    };

    // 1. PLAYER STRIKES
    const shouldSkipPlayerStrikes = forceSkipPlayerStrikes || bossState.skipNextPlayerTurn;
    if (shouldSkipPlayerStrikes) {
      setBossState(prev => ({ ...prev, skipNextPlayerTurn: false }));
      addLog("=== THE ZEALOT: Your turn is skipped! Your creatures cannot strike or resolve sigils. ===");
      await sleep(800);
    }

    for (let lane = 0; lane < 4; lane++) {
      if (shouldSkipPlayerStrikes) break;

      const pCard = currPBoard[lane];
      if (!pCard) continue;

      pCard.hasAttackedThisTurn = true;

      const pAtk = getCardAttack(pCard, lane, true, currPBoard, currEBoard);
      if (pAtk <= 0) {
        // Cards with 0 power apply a shake animation in place of an attack, as they can not deal damage
        await animateZeroPowerAttack(true, lane);
        await sleep(150);
        continue;
      }

      // Omnistrike: strikes each opposing occupied space from left to right; if none, strikes directly once
      let targets: number[] = [];
      if (pCard.sigils.includes('Omnistrike')) {
        const occupiedLanes = [0, 1, 2, 3].filter(l => currEBoard[l] !== null && !currEBoard[l]!.sigils.includes('Waterborne'));
        targets = occupiedLanes.length > 0 ? occupiedLanes : [lane];
      } else {
        targets = buildStrikeTargets(lane, pCard.sigils);
      }

      for (const tLane of targets) {
        if (!currPBoard[lane] || currPBoard[lane]!.health <= 0) break;

        // Massive entities (Blood Moon) occupy the entire enemy frontline
        const massiveCardIdx = currEBoard.findIndex(c => c?.isMassive);
        const hasMassive = massiveCardIdx !== -1;
        let eCard = hasMassive ? currEBoard[massiveCardIdx] : currEBoard[tLane];
        const targetSlotIndex = hasMassive ? massiveCardIdx : tLane;

        const isAirborne = pCard.sigils.includes('Airborne');

        if (!eCard) {
          const burrowerIdx = currEBoard.findIndex(c => c?.sigils.includes('Burrower') && (!isAirborne || c.sigils.includes('Mighty Leap')));
          if (burrowerIdx !== -1) {
            const burrowerCard = currEBoard[burrowerIdx];
            if (burrowerCard?.id) {
              await triggerLateralMove(burrowerCard.id, tLane - burrowerIdx);
            }
            currEBoard[tLane] = currEBoard[burrowerIdx];
            currEBoard[burrowerIdx] = null;
            eCard = currEBoard[tLane];
            addLog(`Enemy ${eCard?.name} burrowed to block lane ${tLane + 1}!`);
            setEnemyBoard([...currEBoard]);
            await sleep(150);
          }
        }

        const blocksAirborne = eCard && eCard.sigils.includes('Mighty Leap');
        const isSubmerged = eCard && eCard.sigils.includes('Waterborne');
        const hitsDirectly = (isAirborne && !blocksAirborne) || isSubmerged || !eCard;
        const isDirectLunge = hitsDirectly && !isAirborne;
        const direction: 'left' | 'right' | 'straight' = tLane < lane ? 'left' : tLane > lane ? 'right' : 'straight';

        // 1. Attack Lunge (asynchronously returning Promise)
        await animateAttackLunge({
          isPlayer: true,
          lane,
          targetLane: tLane,
          isAirborne,
          isDirect: isDirectLunge,
          direction,
        });

        if (eCard && !hitsDirectly) {
          // Loose Tail evasive drop
          if (eCard.sigils.includes('Loose Tail')) {
            const escapeLanes = [tLane + 1, tLane - 1].filter(l => l >= 0 && l <= 3 && !currEBoard[l]);
            if (escapeLanes.length > 0) {
              const currentTotalCards = currEBoard.filter(c => c !== null).length + currEQueue.filter(c => c !== null).length;
              if (isBossMatch || currentTotalCards < 6) {
                await triggerSigilJitter(false, tLane);
                const esc = escapeLanes[0];
                await triggerLateralMove(eCard.id || `tail-esc-${tLane}`, esc - tLane);
                currEBoard[esc] = { ...eCard, sigils: eCard.sigils.filter(s => s !== 'Loose Tail') };
                currEBoard[tLane] = cloneCard(TOKEN_TAIL);
                triggerSummonWipe(currEBoard[tLane].id);
                eCard = currEBoard[tLane];
                addLog(`Enemy ${currEBoard[esc]?.name} shed its tail and slipped away!`);
                setEnemyBoard([...currEBoard]);
                await sleep(150);
              }
            }
          }

          // Scapegoat: Adjacent enemy intercepts lethal blow
          let effectiveEnemyLane = tLane;
          if (!(eCard.sigils.includes('Armored') && !eCard.shieldBroken) && !hasMassive) {
            const wouldKillEnemy = (pCard.sigils.includes('Touch of Death') && !eCard.sigils.includes('Made of Stone')) || pAtk >= eCard.health;
            if (wouldKillEnemy) {
              const adjScapegoatLane = [tLane - 1, tLane + 1].find(
                l => l >= 0 && l <= 3 && currEBoard[l] && currEBoard[l]!.health > 0 && currEBoard[l]!.sigils.includes('Scapegoat')
              );
              if (adjScapegoatLane !== undefined) {
                const protectedName = eCard.name;
                effectiveEnemyLane = adjScapegoatLane;
                eCard = currEBoard[effectiveEnemyLane]!;
                await triggerSigilJitter(false, effectiveEnemyLane);
                addLog(`Enemy ${eCard.name} intercepted the lethal blow meant for ${protectedName}!`);
              }
            }
          }

          const finalEnemySlot = hasMassive ? massiveCardIdx : effectiveEnemyLane;

          if (eCard.sigils.includes('Armored') && !eCard.shieldBroken) {
            await triggerSigilJitter(false, effectiveEnemyLane);
            eCard.shieldBroken = true;
            triggerSfx('armor');
            spawnSigilBadge(false, effectiveEnemyLane, 'ARMOR BLOCKED', 'bone');
            addLog(`Enemy ${eCard.name}'s armor absorbed the attack!`);
            setEnemyBoard([...currEBoard]);
          } else {
            const isTouchOfDeathLethal = pCard.sigils.includes('Touch of Death') && !eCard.sigils.includes('Made of Stone');
            const willKillEnemy = isTouchOfDeathLethal || eCard.health - pAtk <= 0;
            // Damage Reaction with micro-hitstop on heavy/lethal blows
            await animateCardDamage(false, effectiveEnemyLane, pAtk, willKillEnemy && pAtk >= 3);

            const prevEHealth = eCard.health;

            if (isTouchOfDeathLethal) {
              await triggerSigilJitter(true, lane);
              spawnSigilBadge(false, effectiveEnemyLane, 'DEATHTOUCH', 'blood');
              eCard.health = 0;
              addLog(`Touch of Death! Enemy ${eCard.name} perishes instantly.`);
            } else {
              eCard.health -= pAtk;
              addLog(`${pCard.name} dealt ${pAtk} damage to enemy ${eCard.name}.`);
            }

            // Leech: Steals the slain target's total health on kill
            const stolenHealth = Math.max(0, prevEHealth);
            if (pCard.sigils.includes('Leech') && eCard.health <= 0 && stolenHealth > 0 && pCard.health > 0) {
              await triggerSigilJitter(true, lane);
              pCard.health += stolenHealth;
              spawnSigilBadge(true, lane, `LEECH +${stolenHealth} HP`, 'emerald');
              triggerHpFlash(true, lane);

              // Caiman hidden ability: permanently gains half of all health drained via Leech
              if (isCardNamed(pCard.name, 'Caiman')) {
                const prevRem = (pCard as any).caimanLeechRemainder || 0;
                const totalPool = prevRem + stolenHealth;
                const permGain = Math.floor(totalPool / 2);
                const nextRem = totalPool % 2;
                (pCard as any).caimanLeechRemainder = nextRem;
                if (permGain > 0) {
                  (pCard as any).caimanPermHpGained = ((pCard as any).caimanPermHpGained || 0) + permGain;
                  const targetMasterId = (pCard as any).masterId || pCard.id;
                  setMasterDeck(prev =>
                    prev.map(c =>
                      c.id === targetMasterId
                        ? {
                            ...c,
                            health: (c.health || 0) + permGain,
                            caimanPermHpGained: ((c as any).caimanPermHpGained || 0) + permGain,
                            caimanLeechRemainder: nextRem,
                          } as any
                        : c
                    )
                  );
                  addLog(`${pCard.name} permanently grew (+${permGain} Max HP)!`);
                } else {
                  setMasterDeck(prev =>
                    prev.map(c => (c.id === ((pCard as any).masterId || pCard.id) ? ({ ...c, caimanLeechRemainder: nextRem } as any) : c))
                  );
                }
              }

              setPlayerBoard([...currPBoard]);
              addLog(`${pCard.name}'s Leech drained ${stolenHealth} Health from ${eCard.name}!`);
            }

            // Immediately cut all music to absolute silence when the Blood Moon is shattered
            if (eCard.health <= 0 && (eCard.name === 'BLOOD MOON' || (eCard as any).isMassive)) {
              if (typeof ChiptuneAudio !== 'undefined' && (ChiptuneAudio as any).stopAll) {
                (ChiptuneAudio as any).stopAll(0.3);
              }
            }

            triggerHpFlash(false, effectiveEnemyLane);
            setEnemyBoard([...currEBoard]);

            // Sharp Quills counterattack from enemy
            if (eCard.sigils.includes('Sharp Quills')) {
              await triggerSigilJitter(false, effectiveEnemyLane);
              spawnSigilBadge(false, effectiveEnemyLane, 'QUILLS', 'blood');
              await animateCardDamage(true, lane, 1, false);
              pCard.health -= 1;
              triggerHpFlash(true, lane);
              setPlayerBoard([...currPBoard]);
              addLog(`Enemy ${eCard.name}'s Sharp Quills dealt 1 damage back to ${pCard.name}!`);

              if (pCard.sigils.includes('Bees Within')) {
                await triggerSigilJitter(true, lane);
                handAdditions.push(applyPlayerTotem(cloneCard(TOKEN_BEE), activeTotem));
                addLog(`Your ${pCard.name}'s Bees Within stirred a Bee into hand!`);
              }

              if (pCard.health <= 0) {
                // Card Destroyed: Upward vertical wipe/dissolve over 0.2s then remove
                await animateCardDestroy(true, lane);
                const bYield = pCard.sigils.includes('Bone King') ? 4 : 1;
                currBones += bYield;
                setBones(currBones);
                addLog(`Your ${pCard.name} perished from Sharp Quills. (+${bYield} Bones)`);

                if (isCardNamed(pCard.name, "Ouroboros")) {
                  setOuroborosBuffs(prev => prev + 1);
                  setMasterDeck(prev => prev.map(c => isCardNamed(c.name, "Ouroboros") ? { ...c, attack: (c.attack || 0) + 1, health: (c.health || 0) + 1 } : c));
                }

                if (pCard.sigils.includes('Unkillable')) {
                  const m = masterDeck.find(c => c.id === pCard.id);
                  handAdditions.push(applyPlayerTotem(cloneCard(m || pCard, ouroborosBuffs), activeTotem));
                }

                currPBoard[lane] = null;
                setPlayerBoard([...currPBoard]);
              }
            }

            if (eCard.health <= 0) {
              addLog(`Enemy ${eCard.name} was slain!`);
              // Card Destroyed: Upward vertical wipe/dissolve over 0.2s then remove from DOM
              await animateCardDestroy(false, finalEnemySlot);
              currEBoard[finalEnemySlot] = null;
              setRunStats(s => ({ ...s, enemyCardsDestroyed: s.enemyCardsDestroyed + 1 }));
              setEnemyBoard([...currEBoard]);

              currPBoard.forEach((c, cIdx) => {
                if (c?.sigils.includes('Scavenger')) {
                  triggerSigilJitter(true, cIdx);
                  currBones += 1;
                  setBones(currBones);
                  addLog(`Scavenger gained 1 Bone from the slaughter.`);
                }
              });

              if (pCard.health > 0 && pCard.sigils.includes('Bloodlust')) {
                await triggerSigilJitter(true, lane);
                pCard.attack = (pCard.attack || 0) + 1;

                // Hodag's Bloodlust permanently commits its attack growth to masterDeck
                if (isCardNamed(pCard.name, 'Hodag')) {
                  setMasterDeck(prev =>
                    prev.map(c =>
                      c.id === pCard.id || isCardNamed(c.name, 'Hodag')
                        ? { ...c, attack: (c.attack || 0) + 1 }
                        : c
                    )
                  );
                }

                setPlayerBoard([...currPBoard]);
                addLog(`${pCard.name}'s Bloodlust surged (+1 ATK)!`);
              }

              // Rule 1: Excess / Trample Damage
              if (pAtk > prevEHealth && prevEHealth > 0) {
                const excess = pAtk - prevEHealth;
                const backRowCard = currEQueue[effectiveEnemyLane];

                if (pCard.sigils.includes('Trample')) {
                  await triggerSigilJitter(true, lane);
                  await animateDirectDamageRumble(excess, currentScale + excess >= 5);
                  let trampleVented = 0;
                  for (let pt = 0; pt < excess; pt++) {
                    if (turnNumber === 1 && currentScale >= 4) {
                      trampleVented += 1;
                      setIsAmpouleCracked(true);
                      setTotalOverkillDamage(prev => (prev || 0) + 1);
                      triggerSfx('blood_fill');
                      await sleep(60);
                    } else {
                      currentScale += 1;
                      setScale(currentScale);
                      triggerSfx('blood_fill');
                      await sleep(80);
                    }
                  }
                  spawnSigilBadge(true, lane, `TRAMPLE +${excess}`, 'gold');
                  if (trampleVented > 0) {
                    addLog(`${pCard.name}'s Trample drove ${excess} excess damage into the scale (shunt vented ${trampleVented} oz)!`);
                  } else {
                    addLog(`${pCard.name}'s Trample drove ${excess} excess damage directly into the opponent's scale!`);
                  }
                } else if (backRowCard) {
                  if (backRowCard.sigils.includes('Armored') && !backRowCard.shieldBroken) {
                    await triggerSigilJitter(false, effectiveEnemyLane);
                    backRowCard.shieldBroken = true;
                    setDamagedQueueLane(effectiveEnemyLane);
                    triggerSfx('armor');
                    await sleep(150);
                    setDamagedQueueLane(null);
                    addLog(`Excess damage (${excess}) struck enemy ${backRowCard.name} in the back row, but its Armor absorbed the blow!`);
                    setEnemyQueue([...currEQueue]);
                  } else {
                    backRowCard.health -= excess;
                    setDamagedQueueLane(effectiveEnemyLane);
                    triggerSfx('hit');
                    await sleep(150);
                    setDamagedQueueLane(null);
                    addLog(`Excess damage! Leftover ${excess} damage struck enemy ${backRowCard.name} in the back row (Lane ${effectiveEnemyLane + 1})!`);

                    if (backRowCard.health <= 0) {
                      addLog(`Enemy ${backRowCard.name} in the back row was destroyed by excess damage!`);
                      currEQueue[effectiveEnemyLane] = { ...backRowCard, isDying: true };
                      setEnemyQueue([...currEQueue]);
                      await sleep(300);
                      currEQueue[effectiveEnemyLane] = null;
                      setEnemyQueue([...currEQueue]);

                      currPBoard.forEach((c, cIdx) => {
                        if (c?.sigils.includes('Scavenger')) {
                          triggerSigilJitter(true, cIdx);
                          currBones += 1;
                          setBones(currBones);
                          addLog(`Scavenger gained 1 Bone from the slaughter.`);
                        }
                      });
                    } else {
                      setEnemyQueue([...currEQueue]);
                    }
                  }
                } else {
                  addLog(`Excess damage (${excess}) dissipated — no enemy creature in back row of lane ${effectiveEnemyLane + 1}.`);
                }
              }
            }
          }
        } else {
          // Direct Player Damage with scaled hitstop & blood-runnel weight
          await animateDirectDamageRumble(pAtk, currentScale + pAtk >= 5);

          // Step gauge 1 point at a time with tick sound
          let ventedThisStrike = 0;
          for (let pt = 0; pt < pAtk; pt++) {
            // Arterial Shunt: On Turn 1, hydraulic pressure cannot force the column past +4.
            // Excess volume diverts directly through the petcock into the banked ounce reservoir.
            if (turnNumber === 1 && currentScale >= 4) {
              ventedThisStrike += 1;
              setIsAmpouleCracked(true);
              setTotalOverkillDamage(prev => (prev || 0) + 1);
              triggerSfx('blood_fill');
              await sleep(60);
            } else {
              currentScale += 1;
              setScale(currentScale);
              triggerSfx('blood_fill');
              await sleep(80);
            }
          }

          if (ventedThisStrike > 0) {
            addLog(`${pCard.name} struck for ${pAtk}! Arterial shunt held gauge at +4; vented ${ventedThisStrike} oz into reservoir.`);
          } else {
            addLog(`${pCard.name} struck the opponent directly for ${pAtk}!`);
          }

          // Forager: Draw 1 card from main deck on direct scale damage
          if (pCard.sigils.includes('Forager') && pAtk > 0) {
            await triggerSigilJitter(true, lane);
            if (currDeck.length > 0) {
              const drawnCard = currDeck.pop()!;
              const processedCard = transformAmorphous(applyPlayerTotem(drawnCard, activeTotem));
              handAdditions.push(processedCard);
              setDeck([...currDeck]);
              spawnSigilBadge(true, lane, 'FORAGER +1', 'gold');
              addLog(`${pCard.name}'s Forager drew ${processedCard.name} from your deck!`);
            } else {
              addLog(`${pCard.name}'s Forager searched your deck, but it was empty.`);
            }
          }
        }

        // Sequential async pause between each hit
        await sleep(150);

        // Only Phase Shift interrupts immediately; normal WIN lets all lane attacks finish
        const matchStatus = checkScaleMatch(currentScale);
        const isBoneLordPhase2Shift = isBossMatch && bossState.type === 'BoneLord' && bossPhase === 2 && currentScale >= getRequiredScaleWinDamage();

        if (matchStatus === 'PHASE_SHIFT' || isBoneLordPhase2Shift) {
          const nextPhase = bossPhase + 1;
          setScale(-permanentScaleDebuff - (activeVowsRef.current.includes('heavier_scale_debt') ? 1 : 0));
          setBossPhase(nextPhase);
          setIsPhaseTransition(true);
          triggerSfx('victory');

          // Pause between phases until the player clicks or presses Space
          await new Promise<void>((resolve) => {
            phaseTransitionResolveRef.current = resolve;
          });

          if (pendingBossGrizzlyWall) {
            setPendingBossGrizzlyWall(false);
            setGrizzlyWallActiveInDuel(true);
            setConsecutiveOneTurnWins(0);
            setOtkCooldown(2);
            setIsGrizzlyShaking(true);
            setTimeout(() => setIsGrizzlyShaking(false), 1200);

            currEBoard = [0, 1, 2, 3].map(i => ({
              ...cloneCard(CARD_GRIZZLY),
              sigils: ['Mighty Leap'],
              id: `grizzly-boss-front-${Date.now()}-${i}`
            }));
            currEQueue = [0, 1, 2, 3].map(i => ({
              ...cloneCard(CARD_GRIZZLY),
              sigils: ['Mighty Leap'],
              id: `grizzly-boss-back-${Date.now()}-${i}`
            }));
            addLog("TOO FAST. TOO SOON. The Grizzly Wall floods the boss arena!");
          } else if (bossState.type === 'The Weaver' || (bossState.type as any) === 'Woodcarver') {
            // 1. Fadeout and wipe both frontline and queue
            setEnemyBoard(prev => prev.map(c => c ? { ...c, isDying: true } : null));
            setEnemyQueue(prev => prev.map(c => c ? { ...c, isDying: true } : null));
            await sleep(400);
            currEBoard = [null, null, null, null];
            currEQueue = [null, null, null, null];
            setEnemyBoard([null, null, null, null]);
            setEnemyQueue([null, null, null, null]);

           // 2. Weaver Phase 2: Flip to the opposite tribe and carve a lethal totem
            const p1Tribe: Tribe = woodcarverClasses[0] || 'Insect';
            const candidateTribes: Tribe[] = ['Canine', 'Avian', 'Insect', 'Hooved', 'Reptile'];
            const p2Tribe: Tribe = woodcarverClasses[1] && woodcarverClasses[1] !== p1Tribe
              ? woodcarverClasses[1]
              : (candidateTribes.filter(t => t !== p1Tribe)[Math.floor(Math.random() * 4)]);

            const lethalSigilPool = ['Touch of Death', 'Double Strike', 'Bifurcated Strike', 'Sharp Quills', 'Mighty Leap'];
            const chosenLethalSigil = lethalSigilPool[Math.floor(Math.random() * lethalSigilPool.length)];
            setBossTotem({ class: p2Tribe, sigil: chosenLethalSigil });

            // Siphon candidates exclusively from her second tribe
            const tribePool = ENEMY_MAIN_DECK_POOL.filter(c => c.class === p2Tribe || c.class === 'ALL Classes');
            const validPool = tribePool.length > 0 ? tribePool : ENEMY_MAIN_DECK_POOL;
            const lowTier = validPool.filter(c => (c.attack || 0) <= 1);
            const frontPool = lowTier.length > 0 ? lowTier : validPool;

            const makeP2Beast = (pool: CardDef[]) => {
              const beast = cloneCard(pool[Math.floor(Math.random() * pool.length)], 0);
              if ((beast.class === p2Tribe || beast.class === 'ALL Classes') && !beast.sigils.includes(chosenLethalSigil)) {
                beast.sigils.push(chosenLethalSigil);
              }
              return beast;
            };

            // Paced battlefield: 2 active frontliners and 1 queue reserve matching the new totem
            currEBoard = [
              null,
              makeP2Beast(frontPool),
              makeP2Beast(validPool),
              null,
            ];

            currEQueue = [
              null,
              null,
              makeP2Beast(validPool),
              null,
            ];

            setBossState(prev => ({
              ...prev,
              phase: 2,
              activeDialogue: null,
            }));

            addLog("=== THE WEAVER: PHASE 2 INITIALIZED ===");
            addLog(`The Weaver carves a deadly totem: [${p2Tribe}] denizens gain [${chosenLethalSigil}]!`);
          } else if (bossState.type === 'Zealot') {
            // 1. Fadeout and wipe both frontline and queue
            setEnemyBoard(prev => prev.map(c => c ? { ...c, isDying: true } : null));
            setEnemyQueue(prev => prev.map(c => c ? { ...c, isDying: true } : null));
            await sleep(400);

            // Wipe The Zealot's battlefield clean entering Phase 2
            currEBoard = [null, null, null, null];
            currEQueue = [null, null, null, null];
            setEnemyBoard([null, null, null, null]);
            setEnemyQueue([null, null, null, null]);

            // Fill empty player slots with Stone Walls
            currPBoard = currPBoard.map(slot => (slot === null ? cloneCard(ALL_CARD_LOOKUP['Stone Wall'], 0) : slot));

            // Locate player's highest power card on board
            let targetCol = 0;
            let highestPower = -1;
            for (let c = 0; c < 4; c++) {
              const card = currPBoard[c];
              if (card) {
                const power = getCardAttack(card, c, true, currPBoard, currEBoard);
                if (power > highestPower) {
                  highestPower = power;
                  targetCol = c;
                }
              }
            }

            // Adder queued in lane confronting highest power card
            currEQueue[targetCol] = cloneCard(ALL_CARD_LOOKUP['Adder'], 0);

            setBossState(prev => ({
              ...prev,
              phase: 2,
              skipNextPlayerTurn: true,
            }));

            addLog("=== THE ZEALOT: PHASE 2 INITIALIZED ===");
            addLog("The battlefield is cleansed! Stone Walls encase your field, and an Adder coils in the queue!");
          } else if (bossState.type === 'The Begotten' || (bossState.type as any) === 'Goobert') {
            // 1. Clear both frontline and queue into paint splatters
            setEnemyBoard(prev => prev.map(c => c ? { ...c, isDying: true } : null));
            setEnemyQueue(prev => prev.map(c => c ? { ...c, isDying: true } : null));
            await sleep(400);
            currEBoard = [null, null, null, null];
            currEQueue = [null, null, null, null];
            setEnemyBoard([null, null, null, null]);
            setEnemyQueue([null, null, null, null]);

            // 2. Identify highest threat player creature
            let targetCol = 0;
            let highestPower = -1;
            for (let c = 0; c < 4; c++) {
              const card = currPBoard[c];
              if (card) {
                const power = getCardAttack(card, c, true, currPBoard, currEBoard);
                if (power > highestPower) {
                  highestPower = power;
                  targetCol = c;
                }
              }
            }

            // Lane confronting player's strongest creature: Stamped Mirror Print (uses same imperfect Press odds)
            const pressRng = duelRngRef.current;
            const threatenedCard = currPBoard[targetCol];
            const mirrorBase = threatenedCard
              ? threatenedCard
              : (ALL_CARD_LOOKUP['Wolf'] || ALL_CARD_LOOKUP['Amoeba']);
            const mirrorPrint = applyBegottenStamp(mirrorBase, pressRng);
            mirrorPrint.id = `goobert-press-mirror-${Date.now()}`;
            currEBoard[targetCol] = mirrorPrint;

            // Flank with Press Slimes (imperfectly stamped rather than auto-buffed)
            const adjacentCols = [0, 1, 2, 3].filter(c => c !== targetCol);
            const leftFlank = adjacentCols[0] ?? 0;
            const rightFlank = adjacentCols[1] ?? 3;

            const makePressAmalgam = (idSuffix: string) => {
              const base = cloneCard(ALL_CARD_LOOKUP['Amoeba'] || ALL_CARD_LOOKUP['Amalgam'], 0);
              base.attack = 2;
              base.health = 3;
              base.sigils = ['Amorphous'];
              const amalgam = applyBegottenStamp(base, pressRng);
              amalgam.id = `goobert-press-${idSuffix}-${Date.now()}`;
              return amalgam;
            };

            currEBoard[leftFlank] = makePressAmalgam('flankA');
            currEBoard[rightFlank] = makePressAmalgam('flankB');

            setBossState(prev => ({
              ...prev,
              phase: 2,
              activeDialogue: null,
              bgHex: '#2AA331',
              bgTransitionDuration: 6,
            }));
            addLog("=== THE BEGOTTEN: PHASE 2 - ROTARY PRESS INITIALIZED ===");
            addLog(`The Press slams down: Mirror Print in lane ${targetCol + 1} and Stamped Amalgams flank the board!`);
          } else if (bossState.type === 'BoneLord') {
            // Fadeout existing cards before Phase 2 or Phase 3 setup
            setEnemyBoard(prev => prev.map(c => c ? { ...c, isDying: true } : null));
            setEnemyQueue(prev => prev.map(c => c ? { ...c, isDying: true } : null));
            await sleep(400);
            currEBoard = [null, null, null, null];
            currEQueue = [null, null, null, null];
            setEnemyBoard([null, null, null, null]);
            setEnemyQueue([null, null, null, null]);
            if (bossPhase === 1) {
              // Reaper placed in an empty column opposing player, or opposing highest attack card
              let reaperCol = -1;
              const emptyCols = [0, 1, 2, 3].filter(c => currPBoard[c] === null);
              if (emptyCols.length > 0) {
                reaperCol = emptyCols[0];
              } else {
                let maxAtk = -1;
                for (let c = 0; c < 4; c++) {
                  const pCard = currPBoard[c];
                  if (pCard) {
                    const atk = getCardAttack(pCard, c, true, currPBoard, currEBoard);
                    if (atk > maxAtk) {
                      maxAtk = atk;
                      reaperCol = c;
                    }
                  }
                }
              }
              if (reaperCol === -1) reaperCol = 0;

              currEBoard[reaperCol] = cloneCard(ALL_CARD_LOOKUP['Reaper'], 0);

              const treeCard = ALL_CARD_LOOKUP['Felled Tree'] || {
                name: 'Felled Tree',
                class: 'No Class',
                attack: 0,
                health: 3,
                emoji: '🌳',
                sigils: ['Made of Stone'],
                unsacrificable: true,
              };
              const queueCols = [0, 1, 2, 3].filter(c => c !== reaperCol);
              currEQueue[queueCols[0] ?? 0] = cloneCard(treeCard, 0);
              currEQueue[queueCols[1] ?? 1] = cloneCard(ALL_CARD_LOOKUP['Skeleton'], 0);

              // Apply Shadow sigil to all player cards: swap power & health cleanly
              currPBoard = currPBoard.map((c, idx) => {
                if (!c) return null;
                const currentEffectiveAttack = getCardAttack(c, idx, true, currPBoard, currEBoard);
                return {
                  ...c,
                  attack: Math.max(0, c.health || 0),
                  health: Math.max(1, currentEffectiveAttack),
                  sigils: Array.from(new Set([...c.sigils, 'Shadow'])),
                };
              });

              setBossState(prev => ({
                ...prev,
                phase: 2,
                activeDialogue: null,
                bgHex: '#230618',
                bgTransitionDuration: 4,
              }));

              addLog("=== THE BONE LORD: PHASE 2 INITIALIZED ===");
              addLog("Shadow envelops your creatures! Power and health inverted!");
            } else if (bossPhase === 2) {
              // Phase 3: Battlefield is stripped clean & the Blood Moon descends immediately
              const bloodMoonCard = {
                ...cloneCard(ALL_CARD_LOOKUP['BLOOD MOON'], 0),
                id: `blood-moon-${Date.now()}`,
              };
              currEBoard = [bloodMoonCard, null, null, null];
              currEQueue = [null, null, null, null];

              setBossState(prev => ({
                ...prev,
                phase: 3,
                activeDialogue: null,
                bgHex: '#300202',
                bgTransitionDuration: 5,
              }));

              setIsBoardRumbling(true);
              setIsBloodMoonDropping(true);
              triggerSfx('heavy_hit');
              if (typeof ChiptuneAudio !== 'undefined' && (ChiptuneAudio as any).playFinalBossPhase3) {
                (ChiptuneAudio as any).playFinalBossPhase3(0.6);
              }
              setTimeout(() => {
                setIsBoardRumbling(false);
                setIsBloodMoonDropping(false);
              }, 2400);

              addLog("=== THE BONE LORD: PHASE 3 - THE BLOOD MOON DESCENDS ===");
            }
          }

          setEnemyWavesLeft(2);
          setEnemyBoard([...currEBoard]);
          setEnemyQueue([...currEQueue]);
          setPlayerBoard(currPBoard);
          setBones(currBones);
          setHand(prev => [...prev, ...handAdditions]);
          const flockDebtThisDuel = flockScaleDebtBattlesRef.current > 0 ? 2 : 0;
    if (flockDebtThisDuel > 0) {
      const nextDebtBattles = Math.max(0, flockScaleDebtBattlesRef.current - 1);
      flockScaleDebtBattlesRef.current = nextDebtBattles;
      setFlockScaleDebtBattles(nextDebtBattles);
    }
    const flockBonusThisDuel = flockStartingScaleBonusRef.current ? 2 : 0;
    setScale(-permanentScaleDebuff - flockDebtThisDuel + flockBonusThisDuel);
    setFlockSquirrelLockDraws(flockNoSquirrelTurnsRef.current ? 2 : 0);
          setTurnNumber(prev => prev + 1);
          setPhase('DRAW');
          addLog(`=== BOSS PHASE ${nextPhase}: A new turn begins! Draw from your Deck or Squirrels. ===`);
          return;
        }
      }
      await sleep(150);
    }

    setActiveAttacker(null);
    setActiveDefendingLane(null);

    // End of player attack turn: Bone Digger generation and Brittle destruction
    let bonesDug = 0;
    for (let c = 0; c < 4; c++) {
      const card = currPBoard[c];
      if (card && card.sigils.includes('Bone Digger')) {
        bonesDug += 1;
        currBones += 1;
        spawnSigilBadge(true, c, '+1 BONE', 'bone');
        addLog(`${card.name}'s Bone Digger unearthed 1 Bone.`);
      }
      if (card && card.sigils.includes('Brittle') && card.hasAttackedThisTurn) {
        currBones += 2;
        currPBoard[c] = null;
        spawnSigilBadge(true, c, 'BRITTLE +2 BONES', 'bone');
        if (isCardNamed(card.name, 'Arachnid')) {
          const m = masterDeck.find(mc => mc.id === card.id);
          setHand(prev => [...prev, applyPlayerTotem(cloneCard(m || card, ouroborosBuffs), activeTotem)]);
          addLog(`Your ${card.name} shed its brittle husk and returned to your hand (+2 Bones)!`);
        } else {
          addLog(`Your ${card.name} perished from Brittle (+2 Bones).`);
        }
      } else if (card) {
        card.hasAttackedThisTurn = false;
      }
    }

    if (bonesDug > 0) {
      triggerSfx('bone');
    }

    setBones(currBones);
    setPlayerBoard([...currPBoard]);

    // ALL attacks have completed — evaluate dynamic scale victory and overkill
    const targetWinDamage = getRequiredScaleWinDamage();
    if (currentScale >= targetWinDamage) {
      const overkillTotal = Math.max(0, currentScale - targetWinDamage);

      setRunStats(prev => ({
        ...prev,
        scaleDamageDealt: prev.scaleDamageDealt + Math.max(0, currentScale),
      }));

      if (overkillTotal > 0) {
        setHighestOverkill(prev => Math.max(prev, overkillTotal));
        setIsOverkill(true);
        setIsEnemyRetracting(true);
        const tickCount = Math.min(overkillTotal, 10);
        const stepSize = overkillTotal / tickCount;
        let credited = 0;
        for (let ok = 0; ok < tickCount; ok++) {
          const nextCredited = ok === tickCount - 1 ? overkillTotal : Math.round(stepSize * (ok + 1));
          const delta = nextCredited - credited;
          credited = nextCredited;
          if (delta > 0) {
            currentScale -= delta;
            setScale(currentScale);
            setTotalOverkillDamage(prev => prev + delta);
          }
          triggerSfx('blood_fill');
          await sleep(75);
        }
        triggerSfx('overkill');

        // 1. Give the CSS transition 750ms to finish translating off the top
        await sleep(750);

        // 2. Clear both enemy rows while cards are invisible so they can't snap back
        currEBoard = [null, null, null, null];
        currEQueue = [null, null, null, null];
        setEnemyBoard([null, null, null, null]);
        setEnemyQueue([null, null, null, null]);
        setIsEnemyRetracting(false);

        // 3. Keep the OVERKILL banner visible for impact
        await sleep(1400);
        setIsOverkill(false);
      }

      setScale(currentScale);
      setPlayerBoard(currPBoard);
      setEnemyBoard(currEBoard);
      setEnemyQueue(currEQueue);
      setPhase('GAME_OVER');
      triggerSfx('victory');

      await sleep(1500);
      handleWinMatch();
      return;
    }

    currPBoard = await resolveMovements(true, currPBoard);
    setPlayerBoard([...currPBoard]);
    await sleep(250);

    currPBoard = await resolveEvolutions(true, currPBoard);
    setPlayerBoard([...currPBoard]);
    await sleep(250);

    // 2. ENEMY COUNTERATTACK WITH PACING
    setPhase('ENEMY');
    addLog("=== COMBAT: Opponent Counter-Attack ===");
    await sleep(350);

    // Tidal Lock: Purges Squirrels and Rabbits on the player's side
    const enemyHasTidalLock = [...currEBoard, ...currEQueue].some(c => c?.sigils.includes('Tidal Lock'));
    if (enemyHasTidalLock) {
      let tidalPurged = false;
      for (let c = 0; c < 4; c++) {
        const pCard = currPBoard[c];
        if (pCard && (pCard.name === 'Squirrel' || pCard.name === 'Rabbit')) {
          currPBoard[c] = null;
          currBones += 1;
          tidalPurged = true;
        }
      }
      if (tidalPurged) {
        setPlayerBoard([...currPBoard]);
        setBones(currBones);
        addLog("Tidal Lock pulled the tides! All Squirrels and Rabbits on your field were consumed.");
        await sleep(400);
      }
    }

    // Advance Queued Opponents to Frontline step by step with translation animations
    for (let i = 0; i < 4; i++) {
      if (!currEBoard[i] && currEQueue[i]) {
        // Animate visual translation from queue slot to destination slot before re-parenting
        setDroppingQueueLane(i);
        await sleep(300);

        currEBoard[i] = currEQueue[i];
        currEQueue[i] = null;
        setDroppingQueueLane(null);

        addLog(`Enemy ${currEBoard[i]?.name} advanced to lane ${i + 1}.`);
        triggerSfx('play');
        setEnemyBoard([...currEBoard]);
        setEnemyQueue([...currEQueue]);
        await sleep(150);

        if (!currPBoard[i]) {
          const pGuardianIdx = currPBoard.findIndex(c => c?.sigils.includes('Guardian'));
          if (pGuardianIdx !== -1) {
            const pCardToMove = currPBoard[pGuardianIdx];
            if (pCardToMove?.id) {
              await triggerLateralMove(pCardToMove.id, i - pGuardianIdx);
            }
            currPBoard[i] = currPBoard[pGuardianIdx];
            currPBoard[pGuardianIdx] = null;
            addLog(`Your ${currPBoard[i]?.name} leaped to block lane ${i + 1}!`);
            setPlayerBoard([...currPBoard]);
            await sleep(150);
          }
        }
      }
    }

    // Enemy Frontline Strikes
    for (let lane = 0; lane < 4; lane++) {
      const eCard = currEBoard[lane];
      if (!eCard) continue;

      const eAtk = getCardAttack(eCard, lane, false, currPBoard, currEBoard);
      if (eAtk <= 0) {
        // Cards with 0 power apply a shake animation in place of an attack, as they can not deal damage
        await animateZeroPowerAttack(false, lane);
        await sleep(150);
        continue;
      }

      eCard.hasAttackedThisTurn = true;

      // Omnistrike: strikes each opposing occupied space from left to right; if none, strikes directly once
      let targets: number[] = [];
      if (eCard.sigils.includes('Omnistrike')) {
        const occupiedLanes = [0, 1, 2, 3].filter(l => currPBoard[l] !== null && !currPBoard[l]!.sigils.includes('Waterborne'));
        targets = occupiedLanes.length > 0 ? occupiedLanes : [lane];
      } else {
        targets = buildStrikeTargets(lane, eCard.sigils);
      }

      for (const tLane of targets) {
        if (!currEBoard[lane] || currEBoard[lane]!.health <= 0) break;

        let pCard = currPBoard[tLane];
        const isAirborne = eCard.sigils.includes('Airborne');

        if (!pCard) {
          const burrowerIdx = currPBoard.findIndex(c => c?.sigils.includes('Burrower') && (!isAirborne || c.sigils.includes('Mighty Leap')));
          if (burrowerIdx !== -1) {
            const burrowerCard = currPBoard[burrowerIdx];
            if (burrowerCard?.id) {
              await triggerLateralMove(burrowerCard.id, tLane - burrowerIdx);
            }
            currPBoard[tLane] = currPBoard[burrowerIdx];
            currPBoard[burrowerIdx] = null;
            pCard = currPBoard[tLane];
            addLog(`Your ${pCard?.name} burrowed to defend lane ${tLane + 1}!`);
            setPlayerBoard([...currPBoard]);
            await sleep(150);
          }
        }

        const blocksAirborne = pCard && pCard.sigils.includes('Mighty Leap');
        const isSubmerged = pCard && pCard.sigils.includes('Waterborne');
        const hitsDirectly = (isAirborne && !blocksAirborne) || isSubmerged || !pCard;
        const isDirectLunge = hitsDirectly && !isAirborne;
        const direction: 'left' | 'right' | 'straight' = tLane < lane ? 'left' : tLane > lane ? 'right' : 'straight';

        // 1. Attack Lunge (asynchronously returning Promise)
        await animateAttackLunge({
          isPlayer: false,
          lane,
          targetLane: tLane,
          isAirborne,
          isDirect: isDirectLunge,
          direction,
        });

        if (pCard && !hitsDirectly) {
          if (pCard.sigils.includes('Loose Tail')) {
            const escapeLanes = [tLane + 1, tLane - 1].filter(l => l >= 0 && l <= 3 && !currPBoard[l]);
            if (escapeLanes.length > 0) {
              await triggerSigilJitter(true, tLane);
              const esc = escapeLanes[0];
              await triggerLateralMove(pCard.id || `p-tail-${tLane}`, esc - tLane);
              currPBoard[esc] = { ...pCard, sigils: pCard.sigils.filter(s => s !== 'Loose Tail') };
              currPBoard[tLane] = applyPlayerTotem(cloneCard(TOKEN_TAIL), activeTotem);
              triggerSummonWipe(currPBoard[tLane].id);
              pCard = currPBoard[tLane];
              addLog(`Your ${currPBoard[esc]?.name} slipped away, leaving its tail behind!`);
              setPlayerBoard([...currPBoard]);
              await sleep(150);
            }
          }

          // Scapegoat: Adjacent allied creature intercepts lethal blow
          let effectivePlayerLane = tLane;
          if (!(pCard.sigils.includes('Armored') && !pCard.shieldBroken)) {
            const wouldKillPlayer = (eCard.sigils.includes('Touch of Death') && !pCard.sigils.includes('Made of Stone')) || eAtk >= pCard.health;
            if (wouldKillPlayer) {
              const adjScapegoatLane = [tLane - 1, tLane + 1].find(
                l => l >= 0 && l <= 3 && currPBoard[l] && currPBoard[l]!.health > 0 && currPBoard[l]!.sigils.includes('Scapegoat')
              );
              if (adjScapegoatLane !== undefined) {
                const protectedName = pCard.name;
                effectivePlayerLane = adjScapegoatLane;
                pCard = currPBoard[effectivePlayerLane]!;
                await triggerSigilJitter(true, effectivePlayerLane);
                addLog(`Your ${pCard.name} leaped in front of ${protectedName} to intercept the lethal blow!`);
              }
            }
          }

          if (pCard.sigils.includes('Armored') && !pCard.shieldBroken) {
            await triggerSigilJitter(true, effectivePlayerLane);
            pCard.shieldBroken = true;
            triggerSfx('armor');
            addLog(`Your ${pCard.name}'s armor absorbed the attack!`);
            setPlayerBoard([...currPBoard]);
          } else {
            // Damage Reaction:
            // "Card Damaged: Target card applies a 0.15s shake animation and red hue flash. Displayed Health value must flash and decrement ONLY after the shake completes."
            const isEnemyTouchOfDeath = eCard.sigils.includes('Touch of Death') && !pCard.sigils.includes('Made of Stone');
            await animateCardDamage(true, effectivePlayerLane, eAtk, isEnemyTouchOfDeath || pCard.health - eAtk <= 0);

            const prevPHealth = pCard.health;

            // Made of Stone: Immune to Touch of Death
            const isTouchOfDeath = eCard.sigils.includes('Touch of Death') && !pCard.sigils.includes('Made of Stone');
            if (isTouchOfDeath) {
              await triggerSigilJitter(false, lane);
              pCard.health = 0;
              addLog(`Enemy ${eCard.name} struck with Touch of Death! Your ${pCard.name} perished.`);
            } else {
              pCard.health -= eAtk;
              addLog(`Enemy ${eCard.name} dealt ${eAtk} damage to your ${pCard.name}.`);
            }

            // Leech: Steals the slain target's total health on kill
            const stolenEnemyHealth = Math.max(0, prevPHealth);
            if (eCard.sigils.includes('Leech') && pCard.health <= 0 && stolenEnemyHealth > 0 && eCard.health > 0) {
              await triggerSigilJitter(false, lane);
              eCard.health += stolenEnemyHealth;
              triggerHpFlash(false, lane);
              setEnemyBoard([...currEBoard]);
              addLog(`Enemy ${eCard.name}'s Leech drained ${stolenEnemyHealth} Health from your ${pCard.name}!`);
            }

            triggerHpFlash(true, effectivePlayerLane);
            setPlayerBoard([...currPBoard]);

            // The Daus Retribution
            if (pCard.name === "Chime") {
              const dausIdx = currPBoard.findIndex(c => isCardNamed(c?.name, "The Daus"));
              if (dausIdx !== -1) {
                const dausAtk = getCardAttack(currPBoard[dausIdx], dausIdx, true, currPBoard, currEBoard);
                const dausDir: 'left' | 'right' | 'straight' = lane < dausIdx ? 'left' : lane > dausIdx ? 'right' : 'straight';
                await triggerSigilJitter(true, dausIdx);
                await animateAttackLunge({
                  isPlayer: true,
                  lane: dausIdx,
                  targetLane: lane,
                  isAirborne: false,
                  isDirect: false,
                  direction: dausDir,
                });
                await animateCardDamage(false, lane);
                eCard.health -= dausAtk;
                triggerHpFlash(false, lane);
                addLog(`The Daus avenged the Chime, striking enemy ${eCard.name} for ${dausAtk}!`);
                if (eCard.health <= 0) {
                  await animateCardDestroy(false, lane);
                  currEBoard[lane] = null;
                  setRunStats(s => ({ ...s, enemyCardsDestroyed: s.enemyCardsDestroyed + 1 }));
                }
                setEnemyBoard([...currEBoard]);
                await sleep(150);
              }
            }

            // Player Sharp Quills
            if (pCard.sigils.includes('Sharp Quills')) {
              await triggerSigilJitter(true, effectivePlayerLane);
              await animateCardDamage(false, lane);
              eCard.health -= 1;
              triggerHpFlash(false, lane);
              addLog(`Your ${pCard.name}'s Sharp Quills dealt 1 damage back to enemy ${eCard.name}!`);
              if (eCard.health <= 0) {
                await animateCardDestroy(false, lane);
                currEBoard[lane] = null;
                setRunStats(s => ({ ...s, enemyCardsDestroyed: s.enemyCardsDestroyed + 1 }));
              }
              setEnemyBoard([...currEBoard]);
            }

            if (pCard.sigils.includes('Bees Within')) {
              await triggerSigilJitter(true, effectivePlayerLane);
              handAdditions.push(applyPlayerTotem(cloneCard(TOKEN_BEE), activeTotem));
              addLog(`Your ${pCard.name}'s Bees Within yielded a Bee to hand!`);
            }

            if (pCard.health <= 0) {
              await animateCardDestroy(true, effectivePlayerLane);
              const bYield = pCard.sigils.includes('Bone King') ? 4 : 1;
              currBones += bYield;
              setBones(currBones);
              addLog(`Your ${pCard.name} perished. (+${bYield} Bones)`);

              if (isCardNamed(pCard.name, "Ouroboros")) {
                setOuroborosBuffs(prev => prev + 1);
                setMasterDeck(prev => prev.map(c => isCardNamed(c.name, "Ouroboros") ? { ...c, attack: (c.attack || 0) + 1, health: (c.health || 0) + 1 } : c));
              }

              if (pCard?.sigils.includes('Unkillable')) {
                const dying = pCard;
                // Match by ID or card name to grab persistent campfire/masterDeck upgrades
                const m = masterDeck.find(c => (dying.id && c.id === dying.id) || c.name === dying.name);
                const restoredDef = cloneCard(m || dying, ouroborosBuffs);

                // Restore full max health and wipe combat damage / temporary board penalties
                const baseLookup = ALL_CARD_LOOKUP[dying.name];
                restoredDef.health = m?.health ?? baseLookup?.health ?? dying.health;
                restoredDef.attack = m?.attack ?? baseLookup?.attack ?? dying.attack;

                handAdditions.push(applyPlayerTotem(restoredDef, activeTotem));
              }

              // Only pull a Corpse Eater from hand if that specific card instance hasn't already leaped onto the board this turn
                const ceIdx = hand.findIndex(
                  c => c.sigils.includes('Corpse Eater') && !currPBoard.some(b => b?.id === c.id)
                );
                if (ceIdx !== -1) {
                  const ceCard = hand[ceIdx];
                  // Filter by unique card ID so previously used instances are removed from hand state
                  setHand(h => h.filter(c => c.id !== ceCard.id));
                  triggerSummonWipe(ceCard.id);
                  currPBoard[effectivePlayerLane] = ceCard;
                  spawnSigilBadge(true, effectivePlayerLane, 'CORPSE EATER', 'violet');
                  addLog(`Corpse Eater triggered! ${ceCard.name} leaped into the fray!`);
                } else {
                  currPBoard[effectivePlayerLane] = null;
                }
                setPlayerBoard([...currPBoard]);

              if (eCard.sigils.includes('Trample') && eAtk > prevPHealth && prevPHealth > 0) {
                const excess = eAtk - prevPHealth;
                await triggerSigilJitter(false, lane);
                await animateDirectDamageRumble(excess, currentScale - excess <= -5);
                for (let pt = 0; pt < excess; pt++) {
                  currentScale -= 1;
                  setScale(currentScale);
                  triggerSfx('blood_drain');
                  await sleep(80);
                }
                setRunStats(s => ({ ...s, scaleDamageTaken: s.scaleDamageTaken + excess }));
                addLog(`Enemy ${eCard.name}'s Trample drove ${excess} excess damage directly into your scale!`);
              }
            }
          }
        } else {
          // Direct Enemy Damage with scaled hitstop & blood-runnel weight
          await animateDirectDamageRumble(eAtk, currentScale - eAtk <= -5);
          for (let pt = 0; pt < eAtk; pt++) {
            currentScale -= 1;
            setScale(currentScale);
            triggerSfx('blood_drain');
            await sleep(80);
          }
          setRunStats(s => ({ ...s, scaleDamageTaken: s.scaleDamageTaken + eAtk }));
          addLog(`Enemy ${eCard.name} struck you directly for ${eAtk}!`);
        }

        // Sequential async pause between each hit
        await sleep(150);

        const matchStatus = checkScaleMatch(currentScale);
        if (matchStatus === 'LOSS') {
          setScale(currentScale);
          setPlayerBoard(currPBoard);
          setEnemyBoard(currEBoard);
          setPhase('GAME_OVER');
          setIsHeavyRecoil(true);
          setIsLossSequenceActive(true);
          triggerSfx('defeat');
          await sleep(420);
          setIsHeavyRecoil(false);
          await sleep(2800);
          setIsLossSequenceActive(false);
          handleLossMatch();
          return;
        }
      }
      await sleep(150);
    }

    setActiveAttacker(null);
    setActiveDefendingLane(null);

    // End of enemy attack turn: Brittle destruction
    for (let lane = 0; lane < 4; lane++) {
      const card = currEBoard[lane];
      if (card && card.sigils.includes('Brittle') && card.hasAttackedThisTurn) {
        await animateCardDestroy(false, lane);
        currEBoard[lane] = null;
        addLog(`Enemy ${card.name} perished from Brittle.`);
      } else if (card) {
        card.hasAttackedThisTurn = false;
      }
    }
    setEnemyBoard([...currEBoard]);

    currEBoard = await resolveMovements(false, currEBoard);
    setEnemyBoard([...currEBoard]);
    await sleep(250);

    currEBoard = await resolveEvolutions(false, currEBoard);
    setEnemyBoard([...currEBoard]);
    await sleep(250);

    // Wave / Reinforcement Placement with Boss-specific rules
    let canSpawn = false;
    if (isBossMatch) {
      if (bossState.type === 'BoneLord') {
        if (bossPhase === 1) {
          canSpawn = bossState.phase1CardsPlayed < 9;
        } else if (bossPhase === 2) {
          canSpawn = true;
        } else {
          canSpawn = false;
        }
      } else {
        canSpawn = enemyWavesLeft > 0;
      }
    } else {
      canSpawn = enemyCardsPlayedRef.current < enemyMaxDuelCards;
    }

    if (canSpawn) {
      const emptySlots = [0, 1, 2, 3].filter(i => !currEQueue[i]);
      if (emptySlots.length > 0) {
        if (isBossMatch) {
          let maxToSpawn = Math.min(emptySlots.length, 1 + Math.floor(Math.random() * 2));
          if (bossState.type === 'BoneLord' && bossPhase === 1) {
            maxToSpawn = Math.min(maxToSpawn, Math.max(0, 9 - bossState.phase1CardsPlayed));
          }

          // Tactical Boss AI: prioritize empty threat lanes or open player lines
          const lanePriority = emptySlots.map(slot => {
            const pCard = currPBoard[slot];
            const eFront = currEBoard[slot];
            let priority = 0;

            if (pCard && !eFront) {
              const pAtk = getCardAttack(pCard, slot, true, currPBoard, currEBoard);
              priority += pAtk * 10; // High threat: drop a wall immediately
              if (pCard.sigils.some(s => ['Touch of Death', 'Double Strike', 'Bifurcated Strike'].includes(s))) {
                priority += 20;
              }
            } else if (!pCard && !eFront) {
              priority += 12; // Uncontested lane: push direct face damage
            } else if (pCard && pCard.health <= 2) {
              priority += 8; // Vulnerable creature: pick off quickly
            }
            return { slot, priority };
          }).sort((a, b) => b.priority - a.priority);

          // 1. Calculate true incoming threat per lane (Direct, Airborne evasion, Diagonals)
          const incomingThreatByLane = [0, 1, 2, 3].map(targetLane => {
            let directThreat = 0;
            let lethalAngle = false;

            for (let pLane = 0; pLane < 4; pLane++) {
              const pCard = currPBoard[pLane];
              if (!pCard) continue;

              const targets = pCard.sigils.includes('Omnistrike')
                ? (() => {
                    const occ = [0, 1, 2, 3].filter(l => currEBoard[l] !== null && !currEBoard[l]!.sigils.includes('Waterborne'));
                    return occ.length > 0 ? occ : [pLane];
                  })()
                : buildStrikeTargets(pLane, pCard.sigils);
              if (targets.includes(targetLane)) {
                const atk = getCardAttack(pCard, pLane, true, currPBoard, currEBoard);
                const isAirborne = pCard.sigils.includes('Airborne');
                const eCard = currEBoard[targetLane];
                const blocksAirborne = eCard && eCard.sigils.includes('Mighty Leap');

                if (!eCard || (isAirborne && !blocksAirborne)) {
                  directThreat += atk * 12;
                } else {
                  directThreat += atk * 4;
                }

                if (pCard.sigils.includes('Touch of Death')) directThreat += 15;
                if (pCard.sigils.includes('Double Strike')) directThreat += atk * 6;
              }
            }

            // Unopposed player line: push lethal scale damage
            if (!currPBoard[targetLane] && !currEBoard[targetLane]) {
              directThreat += 10;
              lethalAngle = true;
            }

            return { lane: targetLane, threat: directThreat, isLethalAngle: lethalAngle };
          });

          // Sort empty queue slots by calculated threat priority
          const sortedSlots = emptySlots.sort((a, b) => {
            const threatA = incomingThreatByLane[a]?.threat || 0;
            const threatB = incomingThreatByLane[b]?.threat || 0;
            return threatB - threatA;
          });

          let spawnedThisWave = 0;
          for (let i = 0; i < maxToSpawn; i++) {
            const targetSlot = sortedSlots[i];
            const pCard = currPBoard[targetSlot];
            const threatProfile = incomingThreatByLane[targetSlot];

            // 2. Tactical counter-pick based on lane situation
            let candidate: CardDef;

            if (threatProfile && threatProfile.threat >= 20 && pCard) {
              const defensivePool = ENEMY_MAIN_DECK_POOL.filter(c => 
                c.sigils.includes('Touch of Death') || 
                c.sigils.includes('Sharp Quills') || 
                c.sigils.includes('Mighty Leap') ||
                (c.health || 0) >= 4
              );
              const pick = defensivePool.length > 0 ? defensivePool : ENEMY_MAIN_DECK_POOL;
              candidate = cloneCard(pick[Math.floor(Math.random() * pick.length)], 0);
            } else if (threatProfile?.isLethalAngle) {
              const aggressivePool = ENEMY_MAIN_DECK_POOL.filter(c => 
                (c.attack || 0) >= 2 || 
                c.sigils.includes('Airborne') || 
                c.sigils.includes('Bifurcated Strike')
              );
              const pick = aggressivePool.length > 0 ? aggressivePool : ENEMY_MAIN_DECK_POOL;
              candidate = cloneCard(pick[Math.floor(Math.random() * pick.length)], 0);
            } else {
              candidate = cloneCard(getRandomEnemyCard(), 0);
            }

            // 3. Boss-specific augmentations
            if (bossState.type === 'Zealot' && bossPhase === 1 && candidate.name !== 'Stone Wall') {
              const bonusSigils = ['Airborne', 'Burrower', 'Double Strike', 'Bifurcated Strike', 'Mighty Leap', 'Touch of Death', 'Stinky', 'Sharp Quills'];
              const available = bonusSigils.filter(s => !candidate.sigils.includes(s));
              if (available.length > 0) {
                candidate.sigils = [...candidate.sigils, available[Math.floor(Math.random() * available.length)]];
              }
            } else if (bossState.type === 'The Begotten' || (bossState.type as any) === 'Goobert') {
              const stamped = applyBegottenStamp(candidate, duelRngRef.current);
              candidate.attack = stamped.attack;
              candidate.health = stamped.health;
              candidate.sigils = stamped.sigils;
              (candidate as any).isGoobertClone = true;
            }

            currEQueue[targetSlot] = candidate;
            spawnedThisWave++;
          }

          if (bossState.type === 'BoneLord' && bossPhase === 1) {
            setBossState(prev => ({
              ...prev,
              phase1CardsPlayed: prev.phase1CardsPlayed + spawnedThisWave,
            }));
          }

          if (bossState.type !== 'BoneLord' || bossPhase === 1) {
            setEnemyWavesLeft(w => Math.max(0, w - 1));
          }

          setEnemyQueue([...currEQueue]);
          await sleep(300);
          
        } else {
          // --- Scaled Turn Reinforcement Rules ---
          let maxAllowedTotalCards: number;
          let maxSpawnsThisTurn: number;
          let maxCardThreat: number;

          if (duelsCompleted === 0) {
            maxAllowedTotalCards = 2; // Strict 2-card cap across front + back combined
            maxSpawnsThisTurn = 1;    // Max 1 card queued per turn
            maxCardThreat = 2;        // Multi-strikers & lethal cards banned
          } else if (duelsCompleted === 1) {
            maxAllowedTotalCards = 3;
            maxSpawnsThisTurn = 1;
            maxCardThreat = 3;
          } else {
            maxAllowedTotalCards = 4;
            maxSpawnsThisTurn = duelRngRef.current() < 0.5 ? 1 : 2;
            maxCardThreat = 4;
          }

          const currentTotalEnemyCards = currEBoard.filter(c => c !== null).length + currEQueue.filter(c => c !== null).length;
          const remainingQuota = enemyMaxDuelCards - enemyCardsPlayedRef.current;

          if (currentTotalEnemyCards >= maxAllowedTotalCards) {
            addLog(`Opponent board is at capacity (${currentTotalEnemyCards}/${maxAllowedTotalCards} cards). No reinforcements queued.`);
          } else if (remainingQuota > 0) {
            const getThreat = (c: CardDef): number => {
              let strikeMultiplier = 1;
              if (c.sigils?.includes('Trifurcated Strike')) strikeMultiplier = 3;
              else if (c.sigils?.includes('Bifurcated Strike') || c.sigils?.includes('Double Strike')) strikeMultiplier = 2;

              const rawAtk = (c.attack || 0) * strikeMultiplier;
              const wallTax = (c.attack || 0) === 0 ? Math.max(1, Math.ceil((c.health || 1) / 2)) : 0;
              const touchOfDeathTax = c.sigils?.includes('Touch of Death') ? 2 : 0;

              return rawAtk + wallTax + touchOfDeathTax;
            };

            const slotsAvailable = maxAllowedTotalCards - currentTotalEnemyCards;
            const spawnCount = Math.min(emptySlots.length, maxSpawnsThisTurn, remainingQuota, slotsAvailable);
            let newlySpawned = 0;

            // 1. Avoid slots trapped behind permanent frontline obstacles (Felled Trees, Stone Walls)
            const viableSlots = emptySlots.filter(s => !currEBoard[s]?.unsacrificable);
            const poolToUse = viableSlots.length > 0 ? viableSlots : emptySlots;

            // 2. Shuffle candidates to eliminate the 0 -> 1 bias, then prioritize lanes facing player threats
            const targetSlots = seededShuffle(poolToUse, duelRngRef.current)
              .sort((a, b) => {
                const aFacesThreat = currPBoard[a] !== null ? 1 : 0;
                const bFacesThreat = currPBoard[b] !== null ? 1 : 0;
                return bFacesThreat - aFacesThreat; // Threat-facing lanes first; ties stay randomized
              });

            // Calculate true effective damage (including Fledgling evolutions and multi-strikes)
            const getEffectiveAtk = (c: CardDef | null): number => {
              if (!c) return 0;
              let atk = c.attack || 0;
              const sigs = (c.sigils || []).map((s: any) => typeof s === 'string' ? s : s?.name || '');
              if (sigs.includes('Fledgling') || c.name === 'Dire Wolf Pup') {
                if (c.name === 'Dire Wolf Pup' || c.evolvesInto === 'Dire Wolf') {
                  atk = 2;
                  if (!sigs.includes('Double Strike')) sigs.push('Double Strike');
                } else {
                  atk += 1;
                }
              }
              let mult = 1;
              if (sigs.includes('Trifurcated Strike')) mult = 3;
              else if (sigs.includes('Bifurcated Strike') || sigs.includes('Double Strike')) mult = 2;
              return atk * mult;
            };

            const encNum = typeof encounter !== 'undefined' ? encounter : 1;
            // Strict ceiling on total attack across field + queue to protect the 5-point scale
            const maxAllowedTotalFieldAtk = encNum <= 1 ? 3 : encNum <= 2 ? 4 : encNum <= 3 ? 5 : 7;
            const activeFrontlineAtk = currEBoard.reduce((acc, c) => acc + getEffectiveAtk(c), 0);
            let currentQueueAtk = currEQueue.reduce((acc, c) => acc + getEffectiveAtk(c), 0);
            let queuedZeroAtkCount = currEQueue.filter(c => c && (c.attack || 0) === 0).length;

            for (let i = 0; i < spawnCount; i++) {
              const targetSlot = targetSlots[i];
              const totalAtkNow = activeFrontlineAtk + currentQueueAtk;
              const remainingAtkBudget = Math.max(0, maxAllowedTotalFieldAtk - totalAtkNow);

              const validPool = ENEMY_MAIN_DECK_POOL.filter(c => {
                if (getThreat(c) > maxCardThreat) return false;
                const effAtk = getEffectiveAtk(c);
                // Hard-stop if card exceeds remaining stage attack budget
                if (effAtk > remainingAtkBudget) return false;
                // Disallow spamming 0-power cards when a wall/egg is already in queue
                if (effAtk === 0 && queuedZeroAtkCount >= 1) return false;
                // Never queue heavy single-card nukes into early encounters mid-turn
                if (encNum <= 2 && effAtk >= 4) return false;
                return true;
              });

              if (validPool.length === 0) break;

              // Prioritize combatants over 0-atk walls whenever damage budget remains
              const combatants = validPool.filter(c => getEffectiveAtk(c) > 0);
              const poolToUse = (remainingAtkBudget > 0 && combatants.length > 0) ? combatants : validPool;

              const candidate = transformAmorphous(cloneCard(poolToUse[Math.floor(duelRngRef.current() * poolToUse.length)], 0));
              currEQueue[targetSlot] = candidate;
              currentQueueAtk += getEffectiveAtk(candidate);
              if (getEffectiveAtk(candidate) === 0) queuedZeroAtkCount++;
              newlySpawned++;
            }

            if (newlySpawned > 0) {
              enemyCardsPlayedRef.current += newlySpawned;
              setEnemyCardsPlayed(enemyCardsPlayedRef.current);
              setEnemyQueue([...currEQueue]);
              await sleep(300);
            }
          }
        }
      }
    }
    setPlayerBoard(currPBoard);
    setEnemyBoard(currEBoard);
    setEnemyQueue(currEQueue);
    if (flockBoneDrainRef.current && currBones > 0) {
      const lost = Math.min(2, currBones);
      currBones = Math.max(0, currBones - 2);
      addLog(`The Zealot's curse drains ${lost} Bone${lost === 1 ? '' : 's'} at turn's end.`);
    }
    setScale(currentScale);
    setBones(currBones);
    if (handAdditions.length > 0) {
      setHand(prev => [...prev, ...handAdditions]);
    }

    setTurnNumber(prev => prev + 1);
    setPhase('DRAW');
    addLog("Your turn begins. Draw from your Deck or Sacrifice Squirrels.");

    // Tutorial Sequence: Enemy Back Row Queue -> Turn 2 Draw Pile Callout
    if (isTutorialDuel && turnNumber === 1) {
      const enemyHasQueued = currEQueue.some(slot => slot !== null);
      if (enemyHasQueued && !tutorialQueueTriggered) {
        setTutorialQueueTriggered(true);
        setTutorialTurn2Triggered(true);
        setDialogueTotalSteps(2);
        setBossState(prev => ({
          ...prev,
          activeDialogue: "Enemy cards will move in for the kill on their turn.",
        }));
        setDialogueQueue(["Draw from only one deck each turn."]);
      } else if (!tutorialTurn2Triggered) {
        setTutorialTurn2Triggered(true);
        setDialogueTotalSteps(1);
        setBossState(prev => ({
          ...prev,
          activeDialogue: "Draw from only one deck each turn.",
        }));
        setDialogueQueue([]);
      }
    }
  };

  const getRandomEnemyCard = (): CardDef => {
    if (isBossMatch) {
      if (bossState.type === 'Zealot') {
        const reptilePool = MAIN_DECK_POOL.filter(
          c => c.class === 'Reptile' || c.name === 'Amalgam' || isCardNamed(c.name, 'Hodag')
        );
        const base = reptilePool[Math.floor(Math.random() * reptilePool.length)] || ALL_CARD_LOOKUP['Bullfrog'];
        const card = cloneCard(base, 0);

        if (bossPhase === 1 && card.name !== 'Stone Wall') {
          const extraSigilOptions = [
            'Airborne', 'Burrower', 'Double Strike', 'Bifurcated Strike',
            'Mighty Leap', 'Touch of Death', 'Stinky', 'Sharp Quills', 'Fledgling'
          ];
          const available = extraSigilOptions.filter(s => !card.sigils.includes(s));
          if (available.length > 0) {
            const extra = available[Math.floor(Math.random() * available.length)];
            card.sigils = [...card.sigils, extra];
          }
        }
        return card;
      }

      if (bossState.type === 'The Begotten' || (bossState.type as any) === 'Goobert') {
        const uniqueCardsMap = new Map<string, CardDef>();
        masterDeck.forEach(c => {
          if (!uniqueCardsMap.has(c.name) || Math.random() > 0.5) {
            uniqueCardsMap.set(c.name, c);
          }
        });

        const goobertCardCopies = Array.from(uniqueCardsMap.values()).map(c => {
          const clone = cloneCard(c, 0);
          clone.isGoobertClone = true;
          if (Math.random() > 0.5) {
            clone.attack = Math.max(0, clone.attack + (Math.random() > 0.5 ? 1 : -1));
          } else {
            clone.health = Math.max(1, clone.health + (Math.random() > 0.5 ? 1 : -1));
          }
          return clone;
        });

        const amoebaCard = ALL_CARD_LOOKUP['Amoeba'];
        const pool: CardDef[] = [
          ...Array(5).fill(null).map(() => transformAmorphous(cloneCard(amoebaCard, 0))),
          ...goobertCardCopies.map(c => transformAmorphous(c))
        ];

        return pool[Math.floor(Math.random() * pool.length)] || transformAmorphous(cloneCard(amoebaCard, 0));
      }

      if (bossState.type === 'BoneLord') {
        const boneLordPoolNames = [
          'Skeleton',
          'Geist',
          'Demon Elk',
          'Skeleton Canine',
          'Exoskeleton',
          'Tortoise Shell',
          'Anubis',
          'Reaper',
          'Demon Elk',
        ];
        const chosenName = boneLordPoolNames[Math.floor(Math.random() * boneLordPoolNames.length)];
        const base = ALL_CARD_LOOKUP[chosenName] || ALL_CARD_LOOKUP['Skeleton'];
        return cloneCard(base, 0);
      }
    }

    const pool = ENEMY_MAIN_DECK_POOL;
    const card = cloneCard(pool[Math.floor(Math.random() * pool.length)], 0);
    if (bossTotem && (card.class === bossTotem.class || card.class === "ALL Classes")) {
      if (!card.sigils.includes(bossTotem.sigil)) {
        card.sigils.push(bossTotem.sigil);
      }
    }
    return card;
  };

  const handleContinueRitual = () => {
    setBossState({
      type: null,
      phase: 1,
      phase1CardsPlayed: 0,
      skipNextPlayerTurn: false,
      activeDialogue: null,
      bgHex: '#18181b',
      bgTransitionDuration: 0,
      isRitualComplete: false,
      ritualEndedVoluntarily: false,
    });
    setDuelsCompleted(0);
    setStage(1);
    setLevel(1);
    setScreen('DUEL');
    startNextDuel(false);
  };

  const handleEndRitual = () => {
    try {
      localStorage.removeItem(RUN_SAVE_KEY);
    } catch (_) {}
    setBossState(prev => ({
      ...prev,
      isRitualComplete: false,
      ritualEndedVoluntarily: true,
      ritualSurrendered: false,
    }));
    setScreen('GAME_OVER');
  };

  const handleWinMatch = () => {
    if (isTutorialDuel) {
      setIsTutorialGlitching(true);
      try {
        localStorage.setItem('sacrificial_scales_tutorial_done', 'true');
      } catch (_) {}
      setHasCompletedTutorial(true);

      // Cut to title screen mid-tear
      setTimeout(() => {
        setIsTutorialDuel(false);
        setPlayerBoard([null, null, null, null]);
        setEnemyBoard([null, null, null, null]);
        setEnemyQueue([null, null, null, null]);
        setHand([]);
        setScreen('SPLASH');
      }, 550);

      // Settle distortion after landing on title screen
      setTimeout(() => {
        setIsTutorialGlitching(false);
      }, 1300);
      return;
    }

    setBossState(prev => ({
      ...prev,
      bgHex: '#0b0f19',
      bgTransitionDuration: 1.5,
    }));

    preDuelMapRef.current = null;
    const nextDuels = duelsCompleted + 1;
    setDuelsCompleted(nextDuels);

    // Resolve multi-battle evolutions for the Red series
    setMasterDeck(prev => prev.map(card => {
      if (!card.wasPlayedThisDuel) return card;

      const battles = ((card as any).battlesPlayed || 0) + 1;
      const RED_EVOLUTION_CHAIN: Record<string, string> = {
        "Red Stray": "Red Hound",
        "Red Hound": "Red Behemoth",
        "Red Behemoth": "Red Colossus"
      };

      const nextForm = RED_EVOLUTION_CHAIN[card.name];
      const requiredBattles = card.name === "Red Stray" ? 2 : 3;
      if (battles >= requiredBattles && nextForm) {
        const template = ALL_CARD_LOOKUP[nextForm] || MAIN_DECK_POOL.find(p => p.name === nextForm);
        if (template) {
          const evolved = cloneCard(template);
          evolved.id = card.id;

          // Preserve campfire stat buffs
          const prevTemplate = ALL_CARD_LOOKUP[card.name] || MAIN_DECK_POOL.find(p => p.name === card.name);
          const bonusAtk = Math.max(0, (card.attack || 0) - (prevTemplate?.attack || 0));
          const bonusHp = Math.max(0, (card.health || 0) - (prevTemplate?.health || 0));
          evolved.attack = (evolved.attack || 0) + bonusAtk;
          evolved.health = (evolved.health || 0) + bonusHp;

          // Preserve transferred sigils (e.g. from Altar sacrifice)
          const prevBaseSigils = prevTemplate?.sigils || [];
          const transferredSigils = (card.sigils || []).filter((s: any) => !prevBaseSigils.includes(s));
          evolved.sigils = Array.from(new Set([...(template.sigils || []), ...transferredSigils]));

          evolved.wasPlayedThisDuel = false;
          (evolved as any).battlesPlayed = 0;
          addLog(`The carnage transformed your ${card.name} into ${nextForm}!`);
          return evolved;
        }
      }

      return {
        ...card,
        wasPlayedThisDuel: false,
        battlesPlayed: battles
      };
    }));
    const newStage = Math.floor(nextDuels / 2) + 1;
    const newLevel = (nextDuels % 2) + 1;

    // Stages strictly increment by +1 ONLY after a boss is felled
    const wasForcedDevBoss = isForcedDevBossRef.current;
    isForcedDevBossRef.current = false;

    if (isBossMatch) {
      if (!wasForcedDevBoss) {
        setArchive(prev => recordBossVictory(prev, bossState.type));
        setStage(prev => prev + 1);
        setLevel(1);
      }
    } else {
      // Within a stage, level/depth advances with each regular encounter
      setLevel(prev => prev + 1);
    }

    // Run trackers update (skip Dev Sandbox forced bosses so Endless thresholds never trigger accidentally)
    if (!wasForcedDevBoss) {
      setRunStats(prev => ({
        ...prev,
        clearedStages: prev.clearedStages + 1,
        bossesDefeated: isBossMatch ? prev.bossesDefeated + 1 : prev.bossesDefeated,
        finalBossesDefeated: (isBossMatch && bossState.type === 'BoneLord') ? prev.finalBossesDefeated + 1 : prev.finalBossesDefeated,
        grizzlyWallsSurvived: grizzlyWallActiveInDuel ? prev.grizzlyWallsSurvived + 1 : prev.grizzlyWallsSurvived,
      }));
    }

    // Anti-OTK resolution and streak tracking
    if (grizzlyWallActiveInDuel) {
      setConsecutiveOneTurnWins(0);
      setOtkCooldown(2);
      setPermanentScaleDebuff(prev => Math.min(4, prev + 1));
      setGrizzlyWallActiveInDuel(false);
      addLog("Surviving the Grizzly Wall granted a reprieve. Anti-OTK paused for 2 duels. Scale penalty increased.");
    } else if (otkCooldown > 0) {
      setOtkCooldown(prev => prev - 1);
      setConsecutiveOneTurnWins(0);
    } else if (turnNumber === 1) {
      setConsecutiveOneTurnWins(prev => prev + 1);
    } else {
      setConsecutiveOneTurnWins(0);
    }

    // Final Boss Victory triggers the Ritual Completion Screen (skipped in Dev Sandbox)
    if (isBossMatch && bossState.type === 'BoneLord' && !wasForcedDevBoss) {
      setBossState(prev => ({ ...prev, isRitualComplete: true }));
      return;
    }

    let winMessage = "Your Creatures struck true, thy Foe lays in ruin.";
    if (isBossMatch) {
      if (bossState.type === 'Zealot') {
        winMessage = "The Zealot suddenly retreats with a shriek. A savage scampering back to his Steeple to screech Gospel.";
      } else if (bossState.type === 'The Begotten' || (bossState.type as any) === 'Goobert') {
        winMessage = "The Begotten wriggles and writhes in the dirt, crying a woeful wail as he wallows.";
      } else if (bossState.type === 'The Weaver' || (bossState.type as any) === 'Woodcarver') {
        winMessage = "The Weaver gravely grasped her poppet, violently rending it usunder before vanishing.";
        setHasDefeatedWeaver(true);
      }
    }

    const felledAlert = {
      title: "Enemy Felled",
      message: winMessage,
      isWin: true,
      btnText: "Press Forward",
      onAction: () => {
        setModalAlert(null);
        if (isBossMatch && !wasForcedDevBoss) {
          setActMap(prev => {
            const updated = prev ? { ...prev, completedBoss: true } : prev;
            actMapRef.current = updated;
            return updated;
          });
          initCardChoice(true);
        } else {
          if (wasForcedDevBoss) {
            addLog("[DEV] Sandbox boss cleared — Act map & Ledger preserved.");
          }
          returnToMap();
        }
      }
    };
    setEnemyBoard(prev => prev.map(c => (c ? { ...c, isDying: true } : null)));
    setEnemyQueue(prev => prev.map(c => (c ? { ...c, isDying: true } : null)));
    setTimeout(() => {
      setEnemyBoard([null, null, null, null]);
      setEnemyQueue([null, null, null, null]);
      setBattleWonIsBoss(isBossMatch);
      setBattleWonAction(() => () => {
        setBattleWonAction(null);
    setBattleWonIsBoss(false);
    setZealotParalyzedBanner(false);
        setBattleWonIsBoss(false);
        felledAlert.onAction();
      });
    }, 450);
  };

  const handleLossMatch = () => {
    isForcedDevBossRef.current = false;
    clearRunSave();
    setModalAlert(null);
    setBossState(prev => ({
      ...prev,
      isRitualComplete: false,
      ritualEndedVoluntarily: false,
      ritualSurrendered: false,
    }));
    setScreen('GAME_OVER');
  };

  const handleContinueRun = () => {
    try {
      const raw = localStorage.getItem(RUN_SAVE_KEY);
      if (!raw) {
        setShowContinueModal(false);
        setScreen('DECK_SELECT');
        return;
      }

      const data: RunSaveData = JSON.parse(raw);
      const restoredDuels = data.duelsCompleted ?? 0;
      const restoredStage = data.stage ?? 1;
      setIsCampfireSafe(Boolean(data.isCampfireSafe));
      setFlockUsedOptions((data.flockUsedOptions as any) || []);
      setFlockDisappearingRelics(Boolean(data.flockDisappearingRelics));
      flockDisappearingRelicsRef.current = Boolean(data.flockDisappearingRelics);
      setFlockBoneDrain(Boolean(data.flockBoneDrain));
      flockBoneDrainRef.current = Boolean(data.flockBoneDrain);
      setFlockScaleDebtBattles(data.flockScaleDebtBattles ?? 0);
      flockScaleDebtBattlesRef.current = data.flockScaleDebtBattles ?? 0;
      setFlockExtraSquirrel(Boolean(data.flockExtraSquirrel));
      flockExtraSquirrelRef.current = Boolean(data.flockExtraSquirrel);
      setFlockNoSquirrelTurns(Boolean(data.flockNoSquirrelTurns));
      flockNoSquirrelTurnsRef.current = Boolean(data.flockNoSquirrelTurns);
      setFlockStartingScaleBonus(Boolean(data.flockStartingScaleBonus));
      flockStartingScaleBonusRef.current = Boolean(data.flockStartingScaleBonus);
      setFlockHandPenalty(Boolean(data.flockHandPenalty));
      flockHandPenaltyRef.current = Boolean(data.flockHandPenalty);
      setFlockSquirrelHealthBonus(data.flockSquirrelHealthBonus ?? 0);
      flockSquirrelHealthBonusRef.current = data.flockSquirrelHealthBonus ?? 0;
      const inferredBossesDefeated = data.runStats?.bossesDefeated ?? Math.max(0, restoredStage - 1);

      setMasterDeck(data.masterDeck);
      if (typeof masterDeckRef !== 'undefined' && masterDeckRef?.current) {
        masterDeckRef.current = data.masterDeck;
      }
      setItems(data.items);
      setTotalOverkillDamage(data.totalOverkillDamage ?? 0);
      setHighestOverkill(data.highestOverkill ?? 0);
      const restoredJarTier = Math.min(3, Math.max(1, Math.round(data.jarTier ?? 1))) as 1 | 2 | 3;
      pendingJarTierRef.current = restoredJarTier;
      setJarTier(restoredJarTier);
      setStage(restoredStage);
      setLevel(data.level ?? 1);
      setDuelsCompleted(restoredDuels);
      setTotemPieces(data.totemPieces ?? []);
      setActiveTotem(data.activeTotem ?? { head: null, body: null });
      if (data.currentStageName) {
        setCurrentStageName(data.currentStageName);
      }
      const restoredBones = data.startingBones ?? 0;
      setStartingBones(restoredBones);
      if (typeof startingBonesRef !== 'undefined') {
        startingBonesRef.current = restoredBones;
      }
      if (data.ouroborosBuffs !== undefined) {
        setOuroborosBuffs(data.ouroborosBuffs);
      }
      const restoredStats: RunStats = {
        bossesDefeated: data.runStats?.bossesDefeated ?? inferredBossesDefeated,
        scaleDamageDealt: data.runStats?.scaleDamageDealt ?? 0,
        scaleDamageTaken: data.runStats?.scaleDamageTaken ?? 0,
        cardsSacrificed: data.runStats?.cardsSacrificed ?? 0,
        enemyCardsDestroyed: data.runStats?.enemyCardsDestroyed ?? 0,
        grizzlyWallsSurvived: data.runStats?.grizzlyWallsSurvived ?? 0,
        clearedStages: data.runStats?.clearedStages ?? restoredDuels,
        finalBossesDefeated: data.runStats?.finalBossesDefeated ?? 0,
      };
      setRunStats(restoredStats);
      runStatsRef.current = restoredStats;
      if (data.standardBossOrder) {
        (window as any).__standardBossOrder = data.standardBossOrder;
      }
      if (data.hasDefeatedWeaver !== undefined) {
        setHasDefeatedWeaver(Boolean(data.hasDefeatedWeaver));
      }
      if (data.permanentScaleDebuff !== undefined) {
        setPermanentScaleDebuff(data.permanentScaleDebuff);
      }
      if (data.consecutiveOneTurnWins !== undefined) {
        setConsecutiveOneTurnWins(data.consecutiveOneTurnWins);
      }
      if (data.otkCooldown !== undefined) {
        setOtkCooldown(data.otkCooldown);
      }

      const restoredSeed = data.runSeed || data.actMap?.seed || '';
      const restoredVows: VowId[] = Array.isArray(data.activeVows) ? data.activeVows : [];
      setRunSeed(restoredSeed);
      runSeedRef.current = restoredSeed;
      setRunSeedInput(restoredSeed);
      setActiveVows(restoredVows);
      activeVowsRef.current = restoredVows;

      const restoredAct = Math.max(1, Math.min(4, data.stage ?? 1));
      const restoredMap =
        data.actMap ||
        generateActMap(restoredAct, getBossForAct(restoredAct, restoredSeed), data.masterDeck?.length, {
          seed: restoredSeed,
          allEliteRow2: restoredVows.includes('all_elite_row2'),
        });
      preDuelMapRef.current = null;
      setActMap(restoredMap);
      actMapRef.current = restoredMap;
      setCurrentStageName(restoredMap.actTitle);

      setShowContinueModal(false);
      triggerSfx('play');
      addLog("Expedition restored from the occult seal.");
      setScreen('EVENT_CROSSROADS');
    } catch (err) {
      console.error("Failed to load save file:", err);
      clearRunSave();
      setShowContinueModal(false);
      setScreen('DECK_SELECT');
    }
  };

  // --- Duel Initialization ---
  const startNextDuel = async (
    forcedBoss?: boolean | 'Zealot' | 'The Begotten' | 'BoneLord' | 'The Weaver' | 'Goobert' | 'Woodcarver',
    deckOverride?: CardDef[],
    totemOverride?: Totem | null,
    progressOverride?: { duelsCompleted?: number; bossesDefeated?: number; forceEnemyTotem?: boolean; isDevSandboxBoss?: boolean }
  ) => {
    // When advancing directly from an active duel, close curtains before swapping the board
    isForcedDevBossRef.current = Boolean(progressOverride?.isDevSandboxBoss);
    if (prevScreenRef.current === 'DUEL') {
      triggerBattleWipe();
      await new Promise(res => setTimeout(res, 320));
    }

    const effectiveDuelsCompleted = progressOverride?.duelsCompleted ?? duelsCompleted;
    const effectiveBossesDefeated = progressOverride?.bossesDefeated ?? runStats.bossesDefeated;
    const activeSeed = runSeedRef.current || runSeed || 'UNSEEDED';
    const duelRng = createSeededRng(`${activeSeed}:duel:${effectiveDuelsCompleted}:${stage}:${level}:${forcedBoss || 'std'}`);
    duelRngRef.current = duelRng;

    setScale(-permanentScaleDebuff);
    setBattleWonAction(null);
    // Jar upgrades apply between battles only, never mid-fight
    setJarTier(pendingJarTierRef.current);

    // Duel-specific item state resets
    setCrucifixUsedThisDuel(false);
    setIsAcornActive(false);
    setItemTargetMode(null);
    setItemTargetSourceSlot(null);
    setDieModal(null);

    setPhase('PLAY');

    // Roll the new stage name ONLY when the first battle of a new stage begins (after Duels 6, 14, and 24)
    const isNewStageFirstDuel = (effectiveDuelsCompleted === 6 || effectiveDuelsCompleted === 14 || effectiveDuelsCompleted === 24);
    if (isNewStageFirstDuel && !forcedBoss) {
      setCurrentStageName(getRandomStageName());
    }
    setBlood(0);
    setBones(startingBonesRef.current !== undefined ? startingBonesRef.current : startingBones);
    setHand([]);
    setSelectedHandIndex(null);
    setSacrificedUnkillableCardIds([]);
    setPlayerBoard([null, null, null, null]);
    setEnemyBoard([null, null, null, null]);
    setEnemyQueue([null, null, null, null]);
    setMorselStats({ attack: 0, health: 0 });
    setBackupState(null);
    setBossTotem(null);

    // Double check and verify player decklist for any changes from the most recent event
    let activeDeck = deckOverride || (masterDeckRef.current && masterDeckRef.current.length > 0 ? masterDeckRef.current : masterDeck);
    if (activeDeck.length === 0) {
      activeDeck = [
        cloneCard(ALL_CARD_LOOKUP["Stoat"]),
        cloneCard(ALL_CARD_LOOKUP["Bullfrog"]),
        cloneCard(ALL_CARD_LOOKUP["Wolf"]),
        cloneCard(ALL_CARD_LOOKUP["Cat"]),
        cloneCard(TOKEN_PELT),
        cloneCard(TOKEN_PELT),
      ];
    }
    setMasterDeck(activeDeck);
    masterDeckRef.current = activeDeck;

    const currentTotem = totemOverride !== undefined ? totemOverride : activeTotem;

    const shuffledDeck = seededShuffle(
      activeDeck.map(c => currentTotem ? applyPlayerTotem(cloneCard(c, ouroborosBuffs), currentTotem) : cloneCard(c, ouroborosBuffs)),
      duelRng
    );

    setDeck(shuffledDeck);

    // Consecutive-battle curtain wipe already triggered prior to board reset

    // Full 36-duel campaign cadence: Bosses at 6, 14, 24, and 36
    const duelNum = (effectiveDuelsCompleted % 36) + 1;
    const isBoss = typeof forcedBoss === 'string' ? true : (forcedBoss !== undefined ? forcedBoss : (duelNum === 6 || duelNum === 14 || duelNum === 24 || duelNum === 36));
    setIsBossMatch(isBoss);
    setBossPhase(1);
    setBossTotem(null);
    let activeEncounterTotem: { class: Tribe; sigil: string } | null = null;
    if (!isBoss) {
      setBossState({
        type: null,
        phase: 1,
        phase1CardsPlayed: 0,
        skipNextPlayerTurn: false,
        activeDialogue: null,
        bgHex: '#18181b',
        bgTransitionDuration: 0,
        isRitualComplete: false,
        ritualEndedVoluntarily: false,
        ritualSurrendered: false,
      });

      // 35% chance for a standard encounter to field a random totem once The Weaver has been defeated
      if (progressOverride?.forceEnemyTotem || (hasDefeatedWeaver && duelRng() < 0.35)) {
        const tribes: Tribe[] = ["Canine", "Avian", "Reptile", "Insect", "Hooved"];
        const randomTotemSigils: string[] = [
          'Airborne',
          'Burrower',
          'Fledgling',
          'Hefty',
          'Sharp Quills',
          'Waterborne',
          'Mighty Leap',
          'Sprinter',
          'Stinky',
          'Bone King',
        ];
        const chosenTribe = tribes[Math.floor(duelRng() * tribes.length)];
        const chosenSigil = randomTotemSigils[Math.floor(duelRng() * randomTotemSigils.length)];
        activeEncounterTotem = { class: chosenTribe, sigil: chosenSigil };
      }
      setBossTotem(activeEncounterTotem);
    }

    let bossType: 'Zealot' | 'The Begotten' | 'BoneLord' | 'The Weaver' | null = null;
    if (typeof forcedBoss === 'string') {
      bossType = forcedBoss === 'Goobert'
        ? 'The Begotten'
        : (forcedBoss === 'Woodcarver' || forcedBoss === 'The Weaver')
          ? 'The Weaver'
          : forcedBoss as any;
    } else if (isBoss) {
      // Boss #4 (Duel 36 or 3 standard bosses defeated in current cycle) is locked to The Bone Lord
      const standardBossesInCycle = effectiveBossesDefeated % 4;
      if (duelNum === 36 || standardBossesInCycle === 3) {
        bossType = 'BoneLord';
      } else {
        // Bosses 1, 2, and 3 (Duels 6, 14, 24): Shuffle the standard trio so each appears exactly once
        if (!(window as any).__standardBossOrder || duelNum === 6 || standardBossesInCycle === 0) {
          const pool: ('Zealot' | 'The Begotten' | 'The Weaver')[] = ['Zealot', 'The Begotten', 'The Weaver'];
          const bossOrderRng = createSeededRng(`${activeSeed}:bossOrder:${Math.floor(effectiveDuelsCompleted / 36)}`);
          (window as any).__standardBossOrder = seededShuffle(pool, bossOrderRng);
        }

        const order: ('Zealot' | 'The Begotten' | 'The Weaver')[] = (window as any).__standardBossOrder;
        const bossIdx = duelNum === 6 ? 0 : duelNum === 14 ? 1 : 2;
        bossType = order[bossIdx] || order[0];
      }
    }

    const initBoard: (CardDef | null)[] = [null, null, null, null];
    const initQueue: (CardDef | null)[] = [null, null, null, null];

    if (isBoss && bossType) {
      if (typeof ChiptuneAudio !== 'undefined') {
        if (bossType === 'BoneLord') {
          ChiptuneAudio.playFinalBoss?.(2.0);
        } else if (bossType === 'Zealot') {
          ChiptuneAudio.playTheZealot?.(1.5);
        } else if (bossType === 'The Begotten') {
          ChiptuneAudio.playTheBegotten?.(1.8);
        } else if (bossType === 'The Weaver') {
          ChiptuneAudio.playTheWeaver?.(1.5);
        } else {
          ChiptuneAudio.playBattle?.(1.4);
        }
      }


      if (bossType === 'Zealot') {
        const playerStoneCol = Math.floor(Math.random() * 4);
        for (let i = 0; i < 4; i++) {
          if (i !== playerStoneCol) {
            initBoard[i] = cloneCard(ALL_CARD_LOOKUP['Stone Wall'], 0);
          }
        }

        setPlayerBoard(prev => {
          const next = [...prev];
          next[playerStoneCol] = cloneCard(ALL_CARD_LOOKUP['Stone Wall'], 0);
          return next;
        });

        const bossAlpha = cloneCard(ALL_CARD_LOOKUP['Alpha'], 0);
        bossAlpha.sigils = ['Leader', 'Fledgling'];
        initQueue[playerStoneCol] = bossAlpha;

        setBossTotem(null);
        setBossState({
          type: 'Zealot',
          phase: 1,
          phase1CardsPlayed: 0,
          skipNextPlayerTurn: false,
          activeDialogue: null,
          bgHex: '#251c19',
          bgTransitionDuration: 3,
          isRitualComplete: false,
          ritualEndedVoluntarily: false,
        });

        triggerBossIntroBanner('Zealot');
        addLog('=== BOSS BATTLE: The Zealot awakens in the cave! ===');
      } else if (bossType === 'The Begotten') {
        // Lane 0: Shifting Living Slime
        const primeAmoeba = transformAmorphous(cloneCard(ALL_CARD_LOOKUP['Amoeba'], 0));
        primeAmoeba.attack = 1;
        primeAmoeba.health = 3;
        (primeAmoeba as any).isGoobertClone = true;
        initBoard[0] = primeAmoeba;

        // Lanes 1 & 2: Stamped caricatures mockingly pulled from player's deck (same Press odds as player Stamp)
        const playerPool = masterDeck.filter(c => !c.unsacrificable && !c.isSacrifice && !(c as any).isTerrain);
        const sourceDeck = playerPool.length > 0 ? playerPool : MAIN_DECK_POOL;

        [1, 2].forEach(col => {
          const raw = sourceDeck[Math.floor(duelRng() * sourceDeck.length)];
          const paintedMockery = applyBegottenStamp(raw, duelRng);
          paintedMockery.id = `goobert-p1-${col}-${Date.now()}`;
          initBoard[col] = paintedMockery;
        });

        setBossTotem(null);
        setBossState({
          type: 'The Begotten',
          phase: 1,
          phase1CardsPlayed: 0,
          skipNextPlayerTurn: false,
          activeDialogue: null,
          bgHex: '#082613',
          bgTransitionDuration: 2.5,
          isRitualComplete: false,
          ritualEndedVoluntarily: false,
        });

        triggerBossIntroBanner('The Begotten');
        addLog('=== BOSS BATTLE: The Begotten prepares its canvas with living caricatures! ===');
      } else if (bossType === 'BoneLord') {
        initBoard[0] = cloneCard(ALL_CARD_LOOKUP['Geist'], 0);
        const validPairs = [
          ['Skeleton Canine', 'Skeleton Canine'],
          ['Demon Elk', 'Skeleton'],
          ['Anubis', 'Demon Elk'],
          ['Skeleton Canine', 'Skeleton'],
        ];
        const pair = validPairs[Math.floor(duelRng() * validPairs.length)];
        initBoard[1] = cloneCard(ALL_CARD_LOOKUP[pair[0]], 0);
        initBoard[2] = cloneCard(ALL_CARD_LOOKUP[pair[1]], 0);

        setBossTotem(null);
        setBossState({
          type: 'BoneLord',
          phase: 1,
          phase1CardsPlayed: 3,
          skipNextPlayerTurn: false,
          activeDialogue: null,
          bgHex: '#300207',
          bgTransitionDuration: 3,
          isRitualComplete: false,
          ritualEndedVoluntarily: false,
        });

        if (typeof ChiptuneAudio !== 'undefined' && ChiptuneAudio.playFinalBoss) {
          ChiptuneAudio.playFinalBoss(1.8);
        }

        triggerBossIntroBanner('BoneLord');
        addLog('=== BOSS BATTLE: The Bone Lord rises! ===');
      } else if (bossType === 'The Weaver') {
        const tribes: Tribe[] = ["Canine", "Avian", "Reptile", "Insect", "Hooved"];
        const shuffledTribes = seededShuffle(tribes, duelRng);
        const bossTribe = shuffledTribes[0];
        setWoodcarverClasses([bossTribe, shuffledTribes[1]]);

        const phase1SafeSigils = WOODCARVER_BOSS_TOTEM_SIGILS.filter(
          s => !['Trifurcated Strike', 'Bifurcated Strike', 'Double Strike', 'Touch of Death'].includes(s)
        );
        const chosenSigil = phase1SafeSigils.length > 0
          ? phase1SafeSigils[Math.floor(duelRng() * phase1SafeSigils.length)]
          : WOODCARVER_BOSS_TOTEM_SIGILS[0];

        setBossTotem({ class: bossTribe, sigil: chosenSigil });
        triggerBossIntroBanner('The Weaver');
        setBossState({
          type: 'The Weaver',
          phase: 1,
          phase1CardsPlayed: 0,
          skipNextPlayerTurn: false,
          activeDialogue: null,
          bgHex: '#24080e',
          bgTransitionDuration: 2,
          isRitualComplete: false,
          ritualEndedVoluntarily: false,
        });

        const tribePool = ENEMY_MAIN_DECK_POOL.filter(c => c.class === bossTribe || c.class === "ALL Classes");
        const validPool = tribePool.length > 0 ? tribePool : ENEMY_MAIN_DECK_POOL;
        const lowTierPool = validPool.filter(c => (c.attack || 0) <= 1);
        const frontPool = lowTierPool.length > 0 ? lowTierPool : validPool;

        const makeFrontlineBeast = () => {
          const beast = cloneCard(frontPool[Math.floor(duelRng() * frontPool.length)], 0);
          if (!beast.sigils.includes(chosenSigil)) {
            beast.sigils.push(chosenSigil);
          }
          return beast;
        };

        initBoard[1] = makeFrontlineBeast();
        initBoard[2] = makeFrontlineBeast();
        initQueue[duelRng() < 0.5 ? 0 : 3] = makeFrontlineBeast();
        addLog(`=== BOSS BATTLE: The Weaver appears wielding [${bossTribe}] + [${chosenSigil}]! ===`);
      }

      setEnemyWavesLeft(2);
      triggerSfx('bell');
    } else {
      if (typeof ChiptuneAudio !== 'undefined' && ChiptuneAudio.playBattle) {
        ChiptuneAudio.playBattle(1.5);
      }

      // --- Tiered Encounter Scaling (Increases once per stage, halfway through each) ---
      // Tier 1: Stage 1, Battles 1-4 (Basic encounters)
      // Tier 2: Stage 1 Battle 5 (Pre-Boss 1) & Stage 2 first half (Battles 1-2)
      // Tier 3: Stage 2 second half (Battles 3+) & Stage 3 first half (Battles 1-2)
      // Tier 4: Stage 3 second half (Battles 3+)
      // Tier 5: Stage 4 first half (Battles 1-2, directly after Boss 3)
      // Tier 6: Stage 4 second half (Battles 3+, Final Difficulty) & post-boss endless runs
      const getEnemyDifficultyTier = (): number => {
        // Runs continued past final boss lock at max difficulty
        if (stage >= 5) return 6;

        if (stage === 1) {
          // Persist Tier 1 for the first 4 battles; jump to Tier 2 on battle 5
          return (level <= 4 && duelsCompleted < 4) ? 1 : 2;
        }
        if (stage === 2) {
          // Halfway through Stage 2 bumps to Tier 3
          return level <= 2 ? 2 : 3;
        }
        if (stage === 3) {
          // Halfway through Stage 3 bumps to Tier 4
          return level <= 2 ? 3 : 4;
        }
        if (stage === 4) {
          // Tier 5 begins after 3rd boss; bumps to Tier 6 halfway through Stage 4
          return level <= 2 ? 5 : 6;
        }
        return 6;
      };

      const difficultyTier = getEnemyDifficultyTier();

      let maxRegularCards: number;
      let initialCount: number;
      let maxOpeningThreat: number;

      switch (difficultyTier) {
        case 1:
          // Tier 1: 3 cards total, 1 opening card, threat capped at 2 (no multi-strikers or heavy hitters)
          maxRegularCards = 3;
          initialCount = 1;
          maxOpeningThreat = 2;
          break;
        case 2:
          // Tier 2: 4 cards total, 1 opening card, threat capped at 2.5
          maxRegularCards = 4;
          initialCount = 1;
          maxOpeningThreat = 2.5;
          break;
        case 3:
          // Tier 3: 4 cards total, 1-2 opening cards, threat capped at 3
          maxRegularCards = 4;
          initialCount = duelRng() < 0.6 ? 1 : 2;
          maxOpeningThreat = 3;
          break;
        case 4:
          // Tier 4: 5 cards total, 2 opening cards, threat capped at 3.5
          maxRegularCards = 5;
          initialCount = 2;
          maxOpeningThreat = 3.5;
          break;
        case 5:
          // Tier 5: 5 cards total, 2 opening cards, threat capped at 4
          maxRegularCards = 5;
          initialCount = 2;
          maxOpeningThreat = 4;
          break;
        case 6:
        default:
          // Tier 6: Final Difficulty - 6 cards total, 2 opening cards, threat capped at 4.5
          maxRegularCards = 6;
          initialCount = 2;
          maxOpeningThreat = 4.5;
          break;
      }

      setEnemyMaxDuelCards(maxRegularCards);
      enemyCardsPlayedRef.current = 0;

      // Threat calculator: accounts for multi-strikers and damage-soaking walls
      const getThreat = (c: CardDef): number => {
        // Resolve true combat potency for Fledgling cards
        let effectiveBaseAtk = c.attack || 0;
        let effectiveHealth = c.health || 1;
        let sigils = c.sigils || [];

        if (sigils.includes('Fledgling') || c.name === 'Dire Wolf Pup') {
          if (c.name === 'Dire Wolf Pup' || c.evolvesInto === 'Dire Wolf') {
            effectiveBaseAtk = 2;
            effectiveHealth = 5;
            sigils = [...sigils, 'Double Strike'];
          } else {
            effectiveBaseAtk += 1;
            effectiveHealth += 2;
          }
        }

        let strikeMultiplier = 1;
        if (sigils.includes('Trifurcated Strike')) strikeMultiplier = 3;
        else if (sigils.includes('Bifurcated Strike') || sigils.includes('Double Strike')) strikeMultiplier = 2;

        const rawAtk = effectiveBaseAtk * strikeMultiplier;
        const wallTax = rawAtk === 0 ? Math.max(2, Math.ceil(effectiveHealth / 2)) : 0;
        const airborneTax = sigils.includes('Airborne') && rawAtk > 0 ? 1.5 : 0;
        const touchOfDeathTax = sigils.includes('Touch of Death') ? 2 : 0;

        return rawAtk + wallTax + airborneTax + touchOfDeathTax;
      };

      // 1. Obstacle generation runs FIRST so the AI can perceive board blockages
      const nextPlayerBoard: (CardDef | null)[] = [null, null, null, null];
      let playerObstacleTarget = 0;
      let enemyObstacleTarget = 0;

      // Obstacles are an occasional encounter condition (30% chance in regular battles), not a constant
      const rollsTerrainEncounter = !isBoss && duelRng() < 0.30;
      if (rollsTerrainEncounter) {
        // Flat 50/50 split between player flank and enemy frontline
        if (duelRng() < 0.50) {
          playerObstacleTarget = 1;
          const pLane = Math.floor(duelRng() * 4);
          const terrainCard = duelRng() < 0.6 ? CARD_FELLED_TREE : CARD_STONE_WALL;
          nextPlayerBoard[pLane] = {
            ...cloneCard(terrainCard),
            id: `terrain-player-${Date.now()}-${pLane}`
          };
        } else {
          enemyObstacleTarget = 1;
          const eLane = Math.floor(duelRng() * 4);
          const terrainCard = duelRng() < 0.6 ? CARD_FELLED_TREE : CARD_STONE_WALL;
          initBoard[eLane] = {
            ...cloneCard(terrainCard),
            id: `terrain-enemy-${Date.now()}-${eLane}`
          };
        }

        const summary = playerObstacleTarget > 0 ? '1 on your side' : "1 on opponent's side";
        addLog(`The wilderness encroaches: an obstacle has formed (${summary}).`);
      }

      if (!isBoss) {
        setPlayerBoard(nextPlayerBoard);
      } else if (bossType !== 'Zealot') {
        setPlayerBoard([null, null, null, null]);
      }

      // 2. Intelligent Backrow Lane Selection:
      // - NEVER queue a creature behind an enemy frontline obstacle
      // - Prioritize open attack lanes over lanes directly facing a player tree/wall
      // - Shuffle available lanes FIRST to eliminate the column 0/1 bias
      const openFrontlineLanes = [0, 1, 2, 3]
        .filter(l => initBoard[l] === null)
        .sort(() => duelRng() - 0.5);

      const prioritizedLanes = openFrontlineLanes.sort((a, b) => {
        const aBlocked = nextPlayerBoard[a] !== null ? 1 : 0;
        const bBlocked = nextPlayerBoard[b] !== null ? 1 : 0;
        return aBlocked - bBlocked; // Unblocked player lanes come first; ties retain random order
      });

      // Encounter-scaled damage ceilings to prevent early turn-1/turn-2 OTKs
      const maxTotalOpeningAtk = encounter <= 1 ? 2 : encounter <= 2 ? 3 : encounter <= 3 ? 4 : 5;
      const maxSingleCardAtk = encounter <= 1 ? 2 : encounter <= 2 ? 2 : encounter <= 3 ? 3 : 4;
      const maxZeroAtkCards = encounter <= 1 ? 0 : 1; // Zero-attack meat shields banned in stage 1, max 1 later

      let currentBackRowThreat = 0;
      let currentBackRowAtk = 0;
      let zeroAtkCount = 0;
      let playedCount = 0;

      for (let i = 0; i < Math.min(initialCount, prioritizedLanes.length); i++) {
        if (playedCount >= maxRegularCards) break;
        if (currentBackRowAtk >= maxTotalOpeningAtk) break;

        const lane = prioritizedLanes[i];
        const threatRemaining = maxOpeningThreat - currentBackRowThreat;
        const atkBudgetRemaining = maxTotalOpeningAtk - currentBackRowAtk;
        if (threatRemaining <= 0 || atkBudgetRemaining <= 0) break;

        const validCandidates = ENEMY_MAIN_DECK_POOL.filter(c => {
          const atk = c.attack || 0;
          let strikeMult = 1;
          if (c.sigils?.includes('Trifurcated Strike')) strikeMult = 3;
          else if (c.sigils?.includes('Bifurcated Strike') || c.sigils?.includes('Double Strike')) strikeMult = 2;
          const effectiveAtk = atk * strikeMult;

          if (getThreat(c) > threatRemaining) return false;
          if (atk === 0 && zeroAtkCount >= maxZeroAtkCards) return false;
          if (atk > maxSingleCardAtk) return false;
          if (effectiveAtk > atkBudgetRemaining) return false;
          if (encounter <= 1 && c.sigils?.includes('Airborne') && atk > 1) return false;

          return true;
        });

        if (validCandidates.length > 0) {
          // Prefer active combatants over 0-atk walls when budget permits
          const activeCombatants = validCandidates.filter(c => (c.attack || 0) > 0);
          const poolToDraw = (zeroAtkCount === 0 && activeCombatants.length > 0) ? activeCombatants : validCandidates;

          const chosen = transformAmorphous(cloneCard(poolToDraw[Math.floor(duelRng() * poolToDraw.length)], 0));
          if (
            activeEncounterTotem &&
            (chosen.class === activeEncounterTotem.class || chosen.class === "ALL Classes") &&
            !chosen.sigils.includes(activeEncounterTotem.sigil)
          ) {
            chosen.sigils.push(activeEncounterTotem.sigil);
          }
          initQueue[lane] = chosen;

          let chosenMult = 1;
          if (chosen.sigils?.includes('Trifurcated Strike')) chosenMult = 3;
          else if (chosen.sigils?.includes('Bifurcated Strike') || chosen.sigils?.includes('Double Strike')) chosenMult = 2;

          currentBackRowThreat += getThreat(chosen);
          currentBackRowAtk += (chosen.attack || 0) * chosenMult;
          if ((chosen.attack || 0) === 0) zeroAtkCount++;
          playedCount++;
        }
      }

      enemyCardsPlayedRef.current = playedCount;
      setEnemyCardsPlayed(playedCount);
      setEnemyWavesLeft(2);
      addLog(`Encounter ${encounter} started [Tier ${difficultyTier}] (Enemy card quota: ${maxRegularCards}). Prepare your defenses.`);
      if (activeEncounterTotem) {
        addLog(`Cursed Battle! The adversary wields a [${activeEncounterTotem.class}] + [${activeEncounterTotem.sigil}] totem.`);
      }
    }

    setEnemyBoard(initBoard);
    setEnemyQueue(initQueue);
    // Fair Hand Draw: Prioritize honest foundation cards before multi-strike sweepers (1-blood or 0-cost)
    const makeDuelSquirrel = () => {
      const sq = currentTotem
        ? applyPlayerTotem(cloneCard(TOKEN_SQUIRREL, ouroborosBuffs), currentTotem)
        : cloneCard(TOKEN_SQUIRREL, ouroborosBuffs);
      if (flockSquirrelHealthBonusRef.current > 0) {
        sq.health = (sq.health || 1) + flockSquirrelHealthBonusRef.current;
      }
      return sq;
    };
    const initialHand: CardDef[] = [makeDuelSquirrel()];
    if (flockExtraSquirrelRef.current) {
      initialHand.push(makeDuelSquirrel());
    }
    const nukeSigils = ['Bifurcated Strike', 'Trifurcated Strike', 'Double Strike'];
    const isStarterCost = (c: CardDef) =>
      c.cost === 1 || ((c.cost === 0 || c.cost === undefined) && (!c.boneCost || c.boneCost === 0));

    let starterIdx = shuffledDeck.findIndex(c => {
      if (!isStarterCost(c)) return false;
      const sigs = (c.sigils || []).map((s: any) => typeof s === 'string' ? s : s?.name || '');
      return !sigs.some(s => nukeSigils.includes(s)) && (c.attack ?? 0) < 3;
    });

    // Fallback if the deck only contains nukes or higher costs
    if (starterIdx === -1) {
      starterIdx = shuffledDeck.findIndex(c => isStarterCost(c));
    }

    if (starterIdx !== -1) {
      const drawnStarter = transformAmorphous(shuffledDeck.splice(starterIdx, 1)[0]);
      initialHand.push(drawnStarter);
      addLog(`Fair Hand dealt a ${drawnStarter.cost === 1 ? '1-blood' : 'free'} creature.`);
    }

    const targetOpeningHandSize = Math.max(
      1,
      4 + (flockExtraSquirrelRef.current ? 1 : 0) - (flockHandPenaltyRef.current ? 1 : 0)
    );
    while (initialHand.length < targetOpeningHandSize && shuffledDeck.length > 0) {
      initialHand.push(transformAmorphous(shuffledDeck.pop()!));
    }

    setHand(initialHand);
    setDeck(shuffledDeck);
    setEnemyBoard(initBoard);
    setEnemyQueue(initQueue);
    addLog("Turn 1 begins: Your opening hand is dealt. Play creatures or make sacrifices.");
// Reset duel-specific item states
    setCrucifixUsedThisDuel(false);
    setIsAcornActive(false);
    setItemTargetMode(null);
    setItemTargetSourceSlot(null);
    setDieModal(null);

    setTurnNumber(1);
    setIsAmpouleCracked(false);
    setScreen('DUEL');
  };

  // --- Starting Lineages & Draft ---
  const startTutorialDuel = () => {
    setIsTutorialDuel(true);
    setIsBossMatch(false);
    setBossPhase(1);
    setScale(0);
    setBlood(0);
    setBones(0);
    setStage(1);
    setLevel(1);
    setDuelsCompleted(0);

    // Curated starter tutorial deck
    const tutorialCards = [
      cloneCard(ALL_CARD_LOOKUP['Stoat'] || MAIN_DECK_POOL[1], 0),
      cloneCard(ALL_CARD_LOOKUP['Bullfrog'] || MAIN_DECK_POOL[2], 0),
      cloneCard(ALL_CARD_LOOKUP['Wolf'] || MAIN_DECK_POOL[10], 0),
      cloneCard(ALL_CARD_LOOKUP['Sparrow'] || MAIN_DECK_POOL[4], 0),
    ];

    setMasterDeck(tutorialCards);
    masterDeckRef.current = tutorialCards;

    // Draw opening hand: 3 main deck cards + 1 Squirrel
    const shuffled = [...tutorialCards].sort(() => Math.random() - 0.5);
    const openingHand = [
      shuffled[0],
      shuffled[1],
      shuffled[2],
      cloneCard(ALL_CARD_LOOKUP['Squirrel'] || MAIN_DECK_POOL[0], 0)
    ];

    setHand(openingHand);
    setDeck(shuffled.slice(3));

    // Opponent starts with a single Coyote in lane 2, nothing in queue
    const initBoard: (CardDef | null)[] = [
      null,
      cloneCard(ALL_CARD_LOOKUP['Coyote'] || MAIN_DECK_POOL[29], 0),
      null,
      null
    ];
    setEnemyBoard(initBoard);
    setEnemyQueue([null, null, null, null]);
    setPlayerBoard([null, null, null, null]);

    // Route tutorial rules directly into the in-game dialogue overlay
    const tutorialScript = [
      "Squirrels are free. They exist to bleed.",
      "Sacrifice cards in play to summon greater Creatures.",
      "Opposed cards clash. Open lanes strike true.",
      "Take blood from your opponent... without losing all of yours."
    ];

    setTutorialSacrificeTriggered(false);
    setTutorialQueueTriggered(false);
    setTutorialTurn2Triggered(false);
    setDialogueTotalSteps(tutorialScript.length);

    setBossState(prev => ({
      ...prev,
      activeDialogue: tutorialScript[0],
    }));
    setDialogueQueue(tutorialScript.slice(1));

    setPhase('PLAY');
    setScreen('DUEL');
  };

  // Restrict pre-run draft to foundational creatures; sweeps and combo engines are earned later

  const handleSelectLineage = (lineageId: string) => {
    triggerSfx('draw');
    setSelectedLineage(lineageId);
    setStartingBones(0);
    startingBonesRef.current = 0;
    setBones(0);
    let starters: string[] = [];
    let isRandomizer = false;

    if (lineageId === 'vanilla') starters = ["Stoat", "Bullfrog", "Wolf"];
    else if (lineageId === 'witchcraft') starters = ["Black Goat", "Moose Buck", "Mole"];
    else if (lineageId === 'eldritch') starters = ["Mantis", "Tadpole", "Raven"];
    else if (lineageId === 'skeleton') starters = ["Warren", "Red Stray", "Dire Wolf Pup"];
    else if (lineageId === 'infestation') starters = ["Silkworm", "Ant Queen", "Flying Ant"];
    else if (lineageId === 'paleozoic') starters = ["Hyphae", "Mud Turtle", "Great White"];
    else if (lineageId === 'randomizer') {
      starters = ["Geck", "Trade Pelt", "Trade Pelt"];
      isRandomizer = true;
    }

    const ALL_LINEAGE_IDS = ['randomizer', 'witchcraft', 'infestation', 'skeleton', 'eldritch', 'paleozoic'];
    const seedsUnlocked = ALL_LINEAGE_IDS.every(id => (archive.clearedLineages || []).includes(id));
    const resolvedSeed = (seedsUnlocked && normalizeSeed(runSeedInput)) || generateRandomSeed();
    setRunSeed(resolvedSeed);
    runSeedRef.current = resolvedSeed;
    setRunSeedInput(resolvedSeed);
    delete (window as any).__standardBossOrder;

    const draftRng = createSeededRng(`${resolvedSeed}:draft:${lineageId}`);
    const isThinnerDraft = activeVowsRef.current.includes('thinner_draft');

    const pDeck = starters.map(name => cloneCard(ALL_CARD_LOOKUP[name] || MAIN_DECK_POOL[0]));
    pDeck.push(cloneCard(TOKEN_PELT));
    if (!isThinnerDraft) {
      pDeck.push(cloneCard(TOKEN_PELT));
    }

    const poolTarget = isThinnerDraft ? 5 : 8;
    const pool: CardDef[] = [];
    const seen = new Set<string>();
    const eligiblePool = MAIN_DECK_POOL.filter(isStarterDraftEligible);
    let boneCostCount = 0;
    let threeBloodCount = 0;
    let attempts = 0;

    while (pool.length < poolTarget && attempts < 500) {
      attempts++;
      const c = cloneCard(eligiblePool[Math.floor(draftRng() * eligiblePool.length)]);
      if (seen.has(c.name)) continue;

      const isBoneCard = (c.boneCost ?? 0) > 0;
      const isThreeBlood = c.cost === 3;

      if (isBoneCard && boneCostCount >= 3) continue;
      if (isThreeBlood && threeBloodCount >= 1) continue;

      seen.add(c.name);
      if (isBoneCard) boneCostCount++;
      if (isThreeBlood) threeBloodCount++;
      pool.push(c);
    }

    setDraftPlayerDeck(pDeck);
    setDraftTradePool(pool);
    setDraftTradesLeft(isRandomizer ? (isThinnerDraft ? 3 : 4) : (isThinnerDraft ? 1 : 2));
    setDraftSelectedDeckIdx(null);
    setDraftSelectedTradeIdx(null);
    setDraftRevealedIndices(Array.from({ length: pool.length }, (_, idx) => idx));
    setDraftFlippingDown(false);
    setDraftFlippingUp(false);
    setScreen('DRAFT');
  };

  const executeDraftTrade = () => {
    if (
      draftSelectedDeckIdx === null ||
      draftSelectedTradeIdx === null ||
      draftTradesLeft <= 0 ||
      draftFlippingDown ||
      draftFlippingUp
    )
      return;

    const pCard = draftPlayerDeck[draftSelectedDeckIdx];
    const tCard = draftTradePool[draftSelectedTradeIdx];
    if (!tCard) return;

    // A Trade Pelt cannot trade for another Trade Pelt
    if (pCard.name === "Trade Pelt" && tCard.name === "Trade Pelt") return;

    const nextP = [...draftPlayerDeck];
    const nextT = [...draftTradePool];
    const takenIdx = draftSelectedTradeIdx;

    nextP[draftSelectedDeckIdx] = tCard;
    // Strip the taken card but keep the spacing slot intact
    nextT[takenIdx] = null;

    const remainingTrades = draftTradesLeft - 1;

    setDraftPlayerDeck(nextP);
    setDraftTradePool(nextT);
    setDraftTradesLeft(remainingTrades);
    setDraftSelectedDeckIdx(null);
    setDraftSelectedTradeIdx(null);
    triggerSfx('play');

    const hasPeltsRemaining = nextP.some(c => c.name === "Trade Pelt");

    // If another trade is queued, trigger the cascade flip-down ritual and reveal 4 random cards
    if (remainingTrades > 0 && hasPeltsRemaining) {
      setDraftFlippingDown(true);
      setDraftRevealedIndices([]);

      setTimeout(() => {
        // Collect surviving non-null slots
        const validIndices = nextT
          .map((card, i) => (card !== null ? i : -1))
          .filter(i => i !== -1);

        // Randomly roll 4 choices from the survivors
        const shuffled = [...validIndices].sort(() => Math.random() - 0.5);
        const chosenFour = shuffled.slice(0, 4);

        setDraftFlippingDown(false);
        setDraftFlippingUp(true);
        setDraftRevealedIndices(chosenFour);
        triggerSfx('draw');

        setTimeout(() => {
          setDraftFlippingUp(false);
        }, 300);
      }, 350);
    } else {
      // No trades or pelts left: flip all remaining shop cards face-down
      setDraftFlippingDown(true);
      setDraftRevealedIndices([]);

      setTimeout(() => {
        setDraftFlippingDown(false);
      }, 350);
    }
  };

  const finalizeDraft = () => {
    const hasRemainingPelts = draftPlayerDeck.some(c => c.name === "Trade Pelt") || draftTradesLeft > 0;
    if (hasRemainingPelts) {
      addLog("You must trade all of your Pelts before entering the woods.");
      return;
    }
    setMasterDeck(draftPlayerDeck.map(c => cloneCard(c)));
    setEncounter(1);
    setDuelsCompleted(0);
    setStage(1);
    setLevel(1);
    setCurrentStageName(getRandomStageName());
    setTotemPieces([]);
    setActiveTotem({ head: null, body: null });
    setBossTotem(null);
    setHasDefeatedWeaver(false);
    delete (window as any).__standardBossOrder;
    setRunStats({
      bossesDefeated: 0,
      scaleDamageDealt: 0,
      scaleDamageTaken: 0,
      cardsSacrificed: 0,
      enemyCardsDestroyed: 0,
      grizzlyWallsSurvived: 0,
      clearedStages: 0,
      finalBossesDefeated: 0,
    });

    // Initialize shuffled boss order and Act I parchment map (Row 1 preserves Altar / Campfire / Bone Lord fork)
    const seedForRun = runSeedRef.current || generateRandomSeed();
    if (!runSeedRef.current) {
      setRunSeed(seedForRun);
      runSeedRef.current = seedForRun;
    }
    const bossOrder = getOrInitBossOrder(seedForRun);
    const firstActMap = generateActMap(1, bossOrder[0], draftPlayerDeck.length, {
      seed: seedForRun,
      allEliteRow2: activeVowsRef.current.includes('all_elite_row2'),
    });
    setActMap(firstActMap);
    preDuelMapRef.current = null;
    actMapRef.current = firstActMap;
    setCurrentStageName(firstActMap.actTitle);
    setScreen('EVENT_CROSSROADS');
  };

  // --- Return to Branching Parchment Map ---
  const returnToMap = (deckOverride?: CardDef[], totemOverride?: Totem | null) => {
    preDuelMapRef.current = null;
    clearEventTimers();
    setCampfireHolding(false);
    setGoobertStamping(false);
    if (deckOverride) {
      setMasterDeck(deckOverride);
      masterDeckRef.current = deckOverride;
    }
    if (totemOverride !== undefined && totemOverride !== null) {
      setActiveTotem(totemOverride);
    }

    const currentDeckSize = deckOverride ? deckOverride.length : (masterDeckRef.current.length || masterDeck.length);
    const currMap = actMapRef.current;
    const mapOpts = {
      seed: runSeedRef.current || undefined,
      allEliteRow2: activeVowsRef.current.includes('all_elite_row2'),
    };
    if (!currMap) {
      const fallbackAct = Math.max(1, Math.min(4, stage));
      const fresh = generateActMap(fallbackAct, getBossForAct(fallbackAct, mapOpts.seed), currentDeckSize, mapOpts);
      setActMap(fresh);
      actMapRef.current = fresh;
      setCurrentStageName(fresh.actTitle);
      setScreen('EVENT_CROSSROADS');
      return;
    }

    if (currMap.completedBoss) {
      const nextAct = Math.min(4, currMap.act + 1);
      const nextMap = generateActMap(nextAct, getBossForAct(nextAct, mapOpts.seed), currentDeckSize, mapOpts);
      setActMap(nextMap);
      actMapRef.current = nextMap;
      setCurrentStageName(nextMap.actTitle);
      triggerSfx('draw');
      addLog(`Unrolled parchment for ${nextMap.actSubtitle}: ${nextMap.actTitle}.`);
      setScreen('EVENT_CROSSROADS');
      return;
    }

    setScreen('EVENT_CROSSROADS');
  };

  // --- Advance Figurine Along Selected Map Node ---
  const handleSelectMapNode = (node: MapNode) => {
    const currMap = actMapRef.current;
    if (!currMap) return;
    const currNode = currMap.nodes.find(n => n.id === currMap.currentNodeId);
    if (!currNode || !currNode.nextIds.includes(node.id)) return;

    const updatedMap: ActMapData = {
      ...currMap,
      currentNodeId: node.id,
      visitedNodeIds: currMap.visitedNodeIds.includes(node.id)
        ? currMap.visitedNodeIds
        : [...currMap.visitedNodeIds, node.id],
    };
    // Lock save state to pre-node map until the battle or event completes
    preDuelMapRef.current = currMap;
    setActMap(updatedMap);
    actMapRef.current = updatedMap;

    if (node.type === 'combat') {
      triggerSfx('stone_move');
      startNextDuel(false);
    } else if (node.type === 'elite_combat') {
      triggerSfx('stone_move');
      startNextDuel(false, undefined, undefined, { forceEnemyTotem: true });
    } else if (node.type === 'boss') {
      triggerSfx('stone_move');
      startNextDuel(node.bossType || updatedMap.bossType);
    } else {
      triggerSfx('stone_move');
      if (node.type === 'items') startItemEvent();
      else if (node.type === 'campfire') initCampfire();
      else if (node.type === 'altar') initAltar();
    else if (node.type === 'anvil') initAnvil();
    else if (node.type === 'flock') initFlock();
      else if (node.type === 'carving') initTotemCarving();
      else if (node.type === 'cost') initCostBargain();
      else if (node.type === 'bonelord') initBoneLord();
      else if (node.type === 'mycologist') initMycologists();
      else if (node.type === 'goobert') initGoobert();
      else if (node.type === 'cave') initCaveTrial();
      else if (node.type === 'choice') initCardChoice();
      else if (node.type === 'totem') initBuildTotem();
    }
  };

  // --- Campfire Event ---
  const initCampfire = () => {
    clearEventTimers();
    setIsEventBusy(false);
    setCampfireHolding(false);
    setCampfireAnimState('idle');
    setCampfireCardIdx(null);
    setCampfireBuffType(Math.random() < 0.5 ? 'attack' : 'health');
    setCampfireStage(0);
    setScreen('EVENT_CAMPFIRE');
  };

  const applyCampfireWarm = () => {
    if (isEventBusy || campfireCardIdx === null) return;
    setIsEventBusy(true);

    const selectedIdx = campfireCardIdx;
    const nextDeck = masterDeck.map((c, i) => (i === selectedIdx ? { ...c } : c));
    const targetCard = nextDeck[selectedIdx];
    if (!targetCard) {
      setIsEventBusy(false);
      return;
    }

    const noSafeCampfire = activeVowsRef.current.includes('no_safe_campfire');
    const isPerilousFirstDip = campfireStage === 0 && noSafeCampfire && !isCampfireSafe;
    const isSecondDip = campfireStage > 0;
    const buffType = campfireBuffType;
    const safe = isCampfireSafe;

    const devourChance = isPerilousFirstDip ? 0.35 : isSecondDip && !safe ? 0.50 : 0;
    const willDevour = devourChance > 0 && Math.random() < devourChance;

    setCampfireHolding(true);
    setCampfireAnimState(willDevour ? 'drowning' : 'dipping');
    triggerSfx('cauldron_boil');

    scheduleEventTimer(() => {
      setCampfireHolding(false);

      if (willDevour) {
        const poisonedSurvivors = Boolean(targetCard.sigils?.includes('Touch of Death'));
        if (poisonedSurvivors) setIsCampfireSafe(true);
        nextDeck.splice(selectedIdx, 1);
        setCampfireCardIdx(null);
        setMasterDeck(nextDeck);
        masterDeckRef.current = nextDeck;
        triggerSfx('cauldron_devour');

        scheduleEventTimer(() => {
          setCampfireAnimState('idle');
          setModalAlert({
            title: "DROWNED BY THE ZEALOT",
            message: isPerilousFirstDip
              ? (poisonedSurvivors
                  ? `Under the Vow of Boiling Zeal, the Zealot plunged ${targetCard.name} into the font on the first dip—yet its Unholy Crest poisoned the flock!`
                  : `Under the Vow of Boiling Zeal, the Zealot snatched ${targetCard.name} into the boiling blood on the very first dip!`)
              : (poisonedSurvivors
                  ? `The Zealot plunged the ${targetCard.name} into the boiling blood! In its demise, its Unholy Crest cursed the Zealot's flock.`
                  : `The Zealot plunged the ${targetCard.name} into the boiling blood! You watch helplessly...`),
            isWin: false,
            btnText: "Flee the Chapel",
            onAction: () => {
              setModalAlert(null);
              setIsEventBusy(false);
              returnToMap(nextDeck);
            }
          });
        }, 420);
        return;
      }

      if (buffType === 'attack') targetCard.attack = (targetCard.attack || 0) + 1;
      else targetCard.health = (targetCard.health || 0) + 2;
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      setCampfireAnimState('blessed');

      if (!isSecondDip) {
        setCampfireStage(1);
        triggerSfx('play');
        addLog(isPerilousFirstDip ? `${targetCard.name} survived the perilous first baptism.` : `Warmed ${targetCard.name} safely.`);
        scheduleEventTimer(() => {
          setCampfireAnimState('idle');
          setIsEventBusy(false);
        }, 480);
      } else {
        triggerSfx('victory');
        scheduleEventTimer(() => {
          setCampfireAnimState('idle');
          setModalAlert({
            title: "BATHED AGAIN",
            message: `${targetCard.name} absorbs the blood blessing, you shudder at its abnormal growth...`,
            isWin: true,
            btnText: "Leave the Chapel",
            onAction: () => {
              setModalAlert(null);
              setIsEventBusy(false);
              returnToMap(nextDeck);
            }
          });
        }, 750);
      }
    }, 780);
  };

  // --- Altar (Sigil Transfer) Event ---


  const initAltar = () => {
    setIsEventBusy(false);
    setAltarHostId(null);
    setAltarSacrificeId(null);
    setAltarAnimPhase('idle');
    setAltarStageCards(null);

    // Detect if the deck has ANY valid (Host, Sacrifice) pair under Altar rules
    const hasValidPair = masterDeck.some(host => {
      if (hasMoreSigilsThanOriginal(host)) return false;
      const hostSigils = host.sigils || [];
      return masterDeck.some(sac => {
        if (sac.id === host.id) return false;
        if (!sac.sigils || sac.sigils.length === 0) return false;
        const merged = new Set([...hostSigils, ...sac.sigils]);
        return merged.size < 5;
      });
    });

    if (!hasValidPair) {
      setModalAlert({
        title: "ALTAR DORMANT",
        message: "The Altar remains cold and rejects your Creatures. You carry your unholy beasts beyond the wretched temple.",
        isWin: true,
        btnText: "Depart Altar",
        onAction: () => {
          setModalAlert(null);
          setIsEventBusy(false);
          returnToMap();
        }
      });
      return;
    }

    setScreen('EVENT_ALTAR');
  };

  const applyAltarTransfer = () => {
    if (isEventBusy || !altarHostId || !altarSacrificeId || altarHostId === altarSacrificeId) return;
    setIsEventBusy(true);

    const host = masterDeck.find(c => c.id === altarHostId);
    const sacrifice = masterDeck.find(c => c.id === altarSacrificeId);
    if (!host || !sacrifice) {
      setIsEventBusy(false);
      return;
    }

    if (hasMoreSigilsThanOriginal(host)) {
      addLog(`Cannot perform ritual: ${host.name} already has more crests than it originally should.`);
      setIsEventBusy(false);
      return;
    }

    const mergedSigils = [...(host.sigils || [])];
    sacrifice.sigils.forEach(s => {
      if (!mergedSigils.includes(s)) mergedSigils.push(s);
    });

    if (mergedSigils.length >= 5) {
      addLog(`Cannot perform ritual: ${host.name} would have 5 or more crests.`);
      setIsEventBusy(false);
      return;
    }

    const mergedHost: CardDef = { ...host, sigils: mergedSigils };
    const nextDeck = masterDeck.filter(c => c.id !== sacrifice.id).map(c => {
      if (c.id === host.id) {
        return mergedHost;
      }
      return c;
    });

    setAltarStageCards({ host, sacrifice, mergedHost });
    setAltarAnimPhase('sacrificing');
    triggerSfx('sacrifice');

    // Beat 1 (0 -> 850ms): Sacrifice dissolves on the stone altar
    scheduleEventTimer(() => {
      setAltarAnimPhase('descending');
      triggerSfx('bell');
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
    }, 850);

    // Beat 2 (850 -> 2350ms): Host descends onto the stone slab in its place, pausing so the player sees the result
    scheduleEventTimer(() => {
      setAltarAnimPhase('done');
      setModalAlert({
        title: "RITUAL COMPLETE",
        message: `${sacrifice.name} was surrendered to the Maker. Its essence now empowers ${host.name}.`,
        isWin: true,
        btnText: "Leave Altar",
        onAction: () => {
          setModalAlert(null);
          setAltarHostId(null);
          setAltarSacrificeId(null);
          setAltarAnimPhase('idle');
          setAltarStageCards(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        }
      });
    }, 2350);
  };

  // --- Transmutation Table (Anvil) Event ---
  const initAnvil = () => {
    setIsEventBusy(false);
    setAnvilSelectedId(null);
    setAnvilStrikeAnim('idle');
    setScreen('EVENT_ANVIL');
  };




  const applyAnvilStrike = (mode: 'hammer' | 'forceps') => {
    if (isEventBusy || !anvilSelectedId) return;
    const target = masterDeck.find(c => c.id === anvilSelectedId);
    if (!target) return;
    if (mode === 'hammer' && !canAnvilBloodToBone(target)) return;
    if (mode === 'forceps' && !canAnvilHollow(target)) return;

    setIsEventBusy(true);
    setAnvilStrikeAnim(mode);
    triggerSfx(mode === 'hammer' ? 'hit' : 'bone');

    const updated = cloneCard(target);
    updated.id = target.id;
    let outcomeMsg = '';

    if (mode === 'hammer') {
      const oldBlood = updated.cost || 1;
      const newBones = getBloodToBoneCost(oldBlood);
      updated.cost = 0;
      updated.boneCost = newBones;
      outcomeMsg = `The hammer fell. ${updated.name}'s ${oldBlood} Blood cost shattered into ${newBones} Bones.`;
    } else {
      const oldBlood = updated.cost || 0;
      const oldBones = updated.boneCost || 0;
      if (oldBlood === 0 && oldBones === 0) {
        if (!updated.sigils.includes('Unkillable')) {
          updated.sigils = [...updated.sigils, 'Unkillable'];
        }
        outcomeMsg = `The forceps drew nothing from ${updated.name}'s empty veins—yet it refuses to die. Gained Unkillable.`;
      } else {
        if (oldBlood >= 2) {
          updated.cost = Math.max(1, oldBlood - 1);
        } else if (oldBones >= 2) {
          updated.boneCost = Math.max(1, oldBones - 1);
        }
        if ((updated.health || 1) > 1) {
          updated.health = (updated.health || 1) - 1;
          outcomeMsg = `${updated.name} was hollowed out. Its summoning cost fell by 1, at the price of 1 Health.`;
        } else {
          if (!updated.sigils.includes('Brittle')) {
            updated.sigils = [...updated.sigils, 'Brittle'];
          }
          outcomeMsg = `${updated.name} was hollowed to the bone. Its cost fell by 1, leaving it Brittle.`;
        }
      }
    }

    const nextDeck = masterDeck.map(c => (c.id === target.id ? updated : c));
    setMasterDeck(nextDeck);
    masterDeckRef.current = nextDeck;

    scheduleEventTimer(() => {
      setAnvilStrikeAnim('idle');
      triggerSfx('play');
      setModalAlert({
        title: mode === 'hammer' ? 'TRANSMUTED' : 'HOLLOWED',
        message: outcomeMsg,
        isWin: true,
        btnText: 'Leave Table',
        onAction: () => {
          setModalAlert(null);
          setAnvilSelectedId(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        },
      });
    }, 900);
  };

  // --- The Zealot's Flock Event ---
  const initFlock = () => {
    setIsEventBusy(false);
    setFlockSelectedSheepId(null);
    setFlockRepicksUsed(0);
    setFlockPendingRemovals(0);
    setFlockRemovalSelectedIds([]);

    const allBlackIds: FlockOptionId[] = [
      'stat_boost_disappearing_relics',
      'bones_drain',
      'thin_deck_scale_debt',
      'touch_of_death_brittle',
      'two_squirrels_locked_draw',
      'blood_gauge_hand_penalty',
    ];
    const remainingBlack = allBlackIds.filter(id => !flockUsedOptions.includes(id));
    const useGreySheep = isCampfireSafe || remainingBlack.length === 0;

    const activeSeed = runSeedRef.current || runSeed || 'FLOCK';
    const rng = createSeededRng(`${activeSeed}:flock:${duelsCompleted}:${flockUsedOptions.length}:${stage}`);

    if (useGreySheep) {
      setFlockSheepList([
        {
          id: 0,
          x: 50,
          y: 52,
          optionId: 'grey_sheep_squirrels',
          isGrey: true,
          flip: false,
          wanderAnim: 'sheepWanderA',
          duration: 11,
          delay: 0,
        },
      ]);
    } else {
      const shuffledOptions = seededShuffle(remainingBlack, rng);
      const slots: { x: number; y: number }[] = [
        { x: 14, y: 26 }, { x: 31, y: 20 }, { x: 50, y: 24 }, { x: 69, y: 22 }, { x: 85, y: 28 },
        { x: 18, y: 52 }, { x: 38, y: 48 }, { x: 58, y: 52 }, { x: 79, y: 50 },
        { x: 20, y: 76 }, { x: 42, y: 74 }, { x: 64, y: 77 }, { x: 83, y: 74 },
      ];
      const sheep: FlockSheepEntity[] = slots.map((pos, idx) => ({
        id: idx,
        x: Math.max(10, Math.min(90, Math.round(pos.x + (rng() - 0.5) * 7))),
        y: Math.max(16, Math.min(82, Math.round(pos.y + (rng() - 0.5) * 8))),
        optionId: shuffledOptions[idx % shuffledOptions.length],
        isGrey: false,
        flip: rng() < 0.5,
        wanderAnim: idx % 2 === 0 ? 'sheepWanderA' : 'sheepWanderB',
        duration: Number((7.5 + rng() * 5.5).toFixed(2)),
        delay: Number((-rng() * 8).toFixed(2)),
      }));
      setFlockSheepList(sheep);
    }

    setScreen('EVENT_FLOCK');
  };

  const handleFlockRepick = () => {
    if (flockRepicksUsed >= 1 || flockSelectedSheepId === null) return;
    const picked = flockSheepList.find(s => s.id === flockSelectedSheepId);
    if (!picked || picked.isGrey) return;

    triggerSfx('draw');
    setFlockRepicksUsed(1);
    setFlockSelectedSheepId(null);
    setFlockSheepList(prev =>
      prev.map(s => (s.id === picked.id ? { ...s, dismissed: true } : s))
    );
  };

  const applyFlockOption = (optId: FlockOptionId) => {
    if (isEventBusy) return;
    setIsEventBusy(true);

    if (optId === 'grey_sheep_squirrels') {
      const nextBonus = flockSquirrelHealthBonusRef.current + 3;
      flockSquirrelHealthBonusRef.current = nextBonus;
      setFlockSquirrelHealthBonus(nextBonus);
      triggerSfx('victory');
      setModalAlert({
        title: 'THE LONE GREY SHEEP',
        message: 'Its wool parts quietly. All Squirrels gain +3 Health for the rest of the ritual.',
        isWin: true,
        btnText: 'Leave the Pen',
        onAction: () => {
          setModalAlert(null);
          setIsEventBusy(false);
          returnToMap();
        },
      });
      return;
    }

    setFlockUsedOptions(prev => (prev.includes(optId) ? prev : [...prev, optId]));

    if (optId === 'thin_deck_scale_debt') {
      const nextDebt = flockScaleDebtBattlesRef.current + 2;
      flockScaleDebtBattlesRef.current = nextDebt;
      setFlockScaleDebtBattles(nextDebt);
      const removableCount = Math.min(2, Math.max(0, masterDeck.length - 1));
      if (removableCount === 0) {
        triggerSfx('sacrifice');
        setModalAlert({
          title: 'THE FLOCK FED',
          message: 'Your deck is too bare to thin further, yet the next 2 battles still begin at -2 on the Blood Gauge.',
          isWin: true,
          btnText: 'Leave the Pen',
          onAction: () => {
            setModalAlert(null);
            setIsEventBusy(false);
            returnToMap();
          },
        });
      } else {
        triggerSfx('sacrifice');
        setFlockPendingRemovals(removableCount);
        setFlockRemovalSelectedIds([]);
        setIsEventBusy(false);
      }
      return;
    }

    let nextDeck = masterDeck;
    let msg = '';

    if (optId === 'stat_boost_disappearing_relics') {
      nextDeck = masterDeck.map(c => ({
        ...c,
        attack: (c.attack || 0) + 1,
        health: (c.health || 1) + 1,
      }));
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      flockDisappearingRelicsRef.current = true;
      setFlockDisappearingRelics(true);
      msg = 'Your creatures swell with +1 Attack and +1 Health. Your relic slots will vanish after each use.';
    } else if (optId === 'bones_drain') {
      const nextBones = (startingBonesRef.current ?? startingBones) + 5;
      startingBonesRef.current = nextBones;
      setStartingBones(nextBones);
      flockBoneDrainRef.current = true;
      setFlockBoneDrain(true);
      msg = 'You gain +5 starting Bones every battle, but lose 2 Bones at the end of each turn.';
    } else if (optId === 'touch_of_death_brittle') {
      nextDeck = masterDeck.map(c => {
        const sigs = [...(c.sigils || [])];
        if (!sigs.includes('Touch of Death')) sigs.push('Touch of Death');
        if (!sigs.includes('Brittle')) sigs.push('Brittle');
        return { ...c, sigils: sigs };
      });
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      msg = 'Every creature in your deck now bears Touch of Death—and turns Brittle.';
    } else if (optId === 'two_squirrels_locked_draw') {
      flockExtraSquirrelRef.current = true;
      setFlockExtraSquirrel(true);
      flockNoSquirrelTurnsRef.current = true;
      setFlockNoSquirrelTurns(true);
      msg = 'Each battle begins with 2 Squirrels in hand, but you cannot draw Squirrels for the first 2 turns.';
    } else if (optId === 'blood_gauge_hand_penalty') {
      flockStartingScaleBonusRef.current = true;
      setFlockStartingScaleBonus(true);
      flockHandPenaltyRef.current = true;
      setFlockHandPenalty(true);
      msg = 'Each battle begins at +2 on the Blood Gauge, but your starting hand is reduced by 1.';
    }

    triggerSfx('sacrifice');
    setModalAlert({
      title: 'THE FLOCK FED',
      message: msg,
      isWin: true,
      btnText: 'Leave the Pen',
      onAction: () => {
        setModalAlert(null);
        setIsEventBusy(false);
        returnToMap(nextDeck);
      },
    });
  };

  const confirmFlockDeckRemovals = () => {
    if (flockRemovalSelectedIds.length !== flockPendingRemovals) return;
    setIsEventBusy(true);
    const removeSet = new Set(flockRemovalSelectedIds);
    const nextDeck = masterDeck.filter(c => !c.id || !removeSet.has(c.id));
    setMasterDeck(nextDeck);
    masterDeckRef.current = nextDeck;
    setFlockPendingRemovals(0);
    setFlockRemovalSelectedIds([]);
    triggerSfx('sacrifice');
    setModalAlert({
      title: 'OFFERING ACCEPTED',
      message: `${removeSet.size} creature${removeSet.size === 1 ? '' : 's'} culled from your deck. Your next 2 battles begin at -2 on the Blood Gauge.`,
      isWin: true,
      btnText: 'Leave the Pen',
      onAction: () => {
        setModalAlert(null);
        setIsEventBusy(false);
        returnToMap(nextDeck);
      },
    });
  };

  // --- Totem Carvings Event ---
  const initTotemCarving = () => {
    clearEventTimers();
    setIsEventBusy(false);
    setCarvingPickedTribe(null);
    setCarvingSummonedCard(null);
    const allTribes: Tribe[] = ["Reptile", "Insect", "Avian", "Canine", "Hooved"];
    const shuffled = [...allTribes].sort(() => Math.random() - 0.5);
    setCarvingTribes(shuffled.slice(0, 3));
    setScreen('EVENT_TOTEM_CARVING');
  };

  const claimCarvingTribe = (tribe: Tribe) => {
    if (isEventBusy) return;
    setIsEventBusy(true);
    setCarvingPickedTribe(tribe);
    setCarvingSummonedCard(null);

    const pool = EVENT_CARD_POOL.filter(c => c.class === tribe || c.class === "ALL Classes");
    const chosen = cloneCard(pool[Math.floor(Math.random() * pool.length)]);
    const nextDeck = [...masterDeck, chosen];
    triggerSfx('draw');

    // Beat 1 (480ms): Summoned creature materializes beneath the chosen hanging patch
    scheduleEventTimer(() => {
      setCarvingSummonedCard(chosen);
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      triggerSfx('play');
    }, 480);

    // Beat 2 (3200ms): Pause so player sees the thread draw and woven creature before modal opens
    scheduleEventTimer(() => {
      setModalAlert({
        title: "THREAD WOVEN",
        message: `The stitched ${tribe} crest summoned a ${chosen.name} to join you and your Creatures.`,
        isWin: true,
        btnText: "Proceed",
        onAction: () => {
          setModalAlert(null);
          setCarvingPickedTribe(null);
          setCarvingSummonedCard(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        }
      });
    }, 3200);
  };

  // --- Costly Bargain Event ---
  const initCostBargain = () => {
    clearEventTimers();
    setIsEventBusy(false);
    setCostBargainPickedType(null);
    setCostBargainRevealedCard(null);
    const allCosts: Array<'1 Blood' | '2 Blood' | '3 Blood' | 'Bones'> = ['1 Blood', '2 Blood', '3 Blood', 'Bones'];
    const shuffled = [...allCosts].sort(() => Math.random() - 0.5);
    setCostChoices(shuffled.slice(0, 3));
    setScreen('EVENT_COST_BARGAIN');
  };

  const claimCostBargain = (type: '1 Blood' | '2 Blood' | '3 Blood' | 'Bones') => {
    if (isEventBusy) return;
    setIsEventBusy(true);
    setCostBargainPickedType(type);
    setCostBargainRevealedCard(null);

    let pool = EVENT_CARD_POOL;
    if (type === '1 Blood') pool = EVENT_CARD_POOL.filter(c => c.cost === 1);
    else if (type === '2 Blood') pool = EVENT_CARD_POOL.filter(c => c.cost === 2);
    else if (type === '3 Blood') pool = EVENT_CARD_POOL.filter(c => c.cost === 3);
    else if (type === 'Bones') pool = EVENT_CARD_POOL.filter(c => (c.boneCost || 0) > 0);

    const card = cloneCard(pool[Math.floor(Math.random() * pool.length)]);
    const nextDeck = [...masterDeck, card];
    triggerSfx('draw');

    // Beat 1 (420ms): Wax seal cracks and card flips face-up on the counter
    scheduleEventTimer(() => {
      setCostBargainRevealedCard(card);
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      triggerSfx('play');
    }, 420);

    // Beat 2 (1900ms): Pause so player sees the pilfered creature before modal opens
    scheduleEventTimer(() => {
      setModalAlert({
        title: "BARGAIN SEALED",
        message: `The Merchant stirs but does not wake. You pocketed a ${card.name}.`,
        isWin: true,
        btnText: "Proceed",
        onAction: () => {
          setModalAlert(null);
          setCostBargainPickedType(null);
          setCostBargainRevealedCard(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        }
      });
    }, 1900);
  };

  // --- Bone Lord Event ---
  const initBoneLord = () => {
    clearEventTimers();
    setIsEventBusy(false);
    setBoneLordSelectedIdx(null);
    setBoneLordAnimPhase('idle');
    setBoneLordStageData(null);
    setScreen('EVENT_BONE_LORD');
  };

  const confirmBoneLordOffering = () => {
    if (isEventBusy || boneLordSelectedIdx === null) return;
    setIsEventBusy(true);

    const targetIdx = boneLordSelectedIdx;
    const card = masterDeck[targetIdx];
    if (!card) {
      setIsEventBusy(false);
      return;
    }
    const isGoat = card.name === "Black Goat";
    const bonus = isGoat ? 3 : 1;

    const nextDeck = masterDeck.filter((_, idx) => idx !== targetIdx);
    const newStartingBones = (startingBonesRef.current !== undefined ? startingBonesRef.current : startingBones) + bonus;

    setBoneLordStageData({ card, bonus });
    setBoneLordAnimPhase('offering');
    triggerSfx('sacrifice');

    // Beat 1 (880ms): Offering turns to ash and bone tokens rise from the ossuary jaws
    scheduleEventTimer(() => {
      setBoneLordAnimPhase('blessed');
      setStartingBones(newStartingBones);
      startingBonesRef.current = newStartingBones;
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      triggerSfx('bone');
    }, 880);

    // Beat 2 (2200ms): Pause on the glowing Bone Boon medallion before modal opens
    scheduleEventTimer(() => {
      setModalAlert({
        title: "THE BONE LORD REJOICES",
        message: isGoat
          ? "The Lord of Bones greedily accepts the Black Goat, bestowing a Miracle (+3 Starting Bones permanently)."
          : `The Bone Lord accepts ${card.name}, bestowing a Blessing (+1 Starting Bone permanently).`,
        isWin: true,
        btnText: "Accept Favor",
        onAction: () => {
          setModalAlert(null);
          setBoneLordSelectedIdx(null);
          setBoneLordAnimPhase('idle');
          setBoneLordStageData(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        }
      });
    }, 2200);
  };

  // --- Mycologists Event ---
  const initMycologists = () => {
    clearEventTimers();
    setIsEventBusy(false);
    setMycoSelectedIndices([]);
    setMycoAnimPhase('idle');
    setMycoStageCards(null);

    const counts: Record<string, number> = {};
    masterDeck.forEach(c => {
      counts[c.name] = (counts[c.name] || 0) + 1;
    });

    const hasDuplicates = Object.values(counts).some(cnt => cnt >= 2);
    setMycoHasDuplicates(hasDuplicates);

    if (!hasDuplicates && masterDeck.length > 0) {
      // Find player's highest power card currently in decklist
      const highestPowerCard = masterDeck.reduce((best, c) => {
        const cPow = c.attack || 0;
        const bestPow = best.attack || 0;
        if (cPow > bestPow) return c;
        if (cPow === bestPow && (c.health || 0) > (best.health || 0)) return c;
        return best;
      }, masterDeck[0]);

      // The duplicate card given by the Mycologist always clones the original stats/sigils of the card, not current stats/sigils
      const originalTemplate = ALL_CARD_LOOKUP[highestPowerCard.name] || MAIN_DECK_POOL.find(p => p.name === highestPowerCard.name) || highestPowerCard;
      setMycoOfferedCard(cloneCard(originalTemplate));
    } else {
      setMycoOfferedCard(null);
    }

    setScreen('EVENT_MYCOLOGIST');
  };

  const startMycologistEvent = initMycologists;

  const claimMycologistDuplicate = () => {
    if (isEventBusy || !mycoOfferedCard) return;
    setIsEventBusy(true);

    const offered = mycoOfferedCard;
    const originalTemplate = ALL_CARD_LOOKUP[offered.name] || MAIN_DECK_POOL.find(p => p.name === offered.name) || offered;
    const clone = cloneCard(originalTemplate);
    const nextDeck = [...masterDeck, clone];
    setMasterDeck(nextDeck);
    masterDeckRef.current = nextDeck;
    triggerSfx('play');

    setModalAlert({
      title: "TWIN CREATURE ADDED",
      message: `The Weaver stuffed a twin of ${offered.name} into your deck!`,
      isWin: true,
      btnText: "Venture Onwards",
      onAction: () => {
        setModalAlert(null);
        setIsEventBusy(false);
        setMycoOfferedCard(null);
        returnToMap(nextDeck);
      }
    });
  };

  const confirmMycologistCombine = () => {
    if (isEventBusy || mycoSelectedIndices.length !== 2) return;
    setIsEventBusy(true);

    const card1 = masterDeck[mycoSelectedIndices[0]];
    const card2 = masterDeck[mycoSelectedIndices[1]];
    if (!card1 || !card2 || card1.name !== card2.name) {
      setIsEventBusy(false);
      return;
    }

    const targets = [...mycoSelectedIndices];

    const fused = cloneCard(card1);
    fused.attack = (card1.attack || 0) + (card2.attack || 0);
    fused.health = card1.health + card2.health;
    const sigils = [...card1.sigils];
    card2.sigils.forEach(s => { if (!sigils.includes(s)) sigils.push(s); });
    fused.sigils = sigils;
    fused.isMycologistCombined = true;

    const nextDeck = masterDeck.filter((_, idx) => !targets.includes(idx));
    nextDeck.push(fused);

    setMycoStageCards({ twin1: card1, twin2: card2, fused });
    setMycoAnimPhase('sewing');
    triggerSfx('sacrifice');

    // Beat 1 (0 -> 850ms): Needles flash as Twin I & Twin II pull into the loom
    scheduleEventTimer(() => {
      setMycoAnimPhase('woven');
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      triggerSfx('bell');
    }, 850);

    // Beat 2 (850 -> 2300ms): Fused abomination sits woven on the loom cloth before modal appears
    scheduleEventTimer(() => {
      setModalAlert({
        title: "FUSED IN SANGUINE WEB",
        message: `The Weaver bound ${card1.name} and ${card2.name} into an abomination of exceptional might!`,
        isWin: true,
        btnText: "Leave Weaver",
        onAction: () => {
          setModalAlert(null);
          setMycoSelectedIndices([]);
          setMycoAnimPhase('idle');
          setMycoStageCards(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        }
      });
    }, 2300);
  };

  const initGoobert = () => {
    clearEventTimers();
    setIsEventBusy(false);
    setGoobertStamping(false);
    setGoobertSelectedIdx(null);
    setGoobertStampedCard(null);
    setGoobertOriginalSnapshot(null);
    setScreen('EVENT_GOOBERT');
  };

  const confirmGoobertClone = () => {
    if (isEventBusy || goobertSelectedIdx === null) return;
    setIsEventBusy(true);

    const original = masterDeck[goobertSelectedIdx];
    if (!original) {
      setIsEventBusy(false);
      return;
    }

    setGoobertOriginalSnapshot(original);
    setGoobertStampedCard(null);
    setGoobertStamping(true);
    triggerSfx('stamp_press');

    const clone = cloneCard(original);
    clone.isGoobertClone = true;
    clone.id = `goobert-${Date.now()}`;

    const mutated = Math.random() < 0.5;
    let desc = `The Press did indeed Stamp a pristine ${original.name}!`;

    if (mutated) {
      if (Math.random() < 0.5) {
        const delta = Math.random() < 0.5 ? 1 : -1;
        clone.attack = Math.max(0, (clone.attack || 0) + delta);
        desc = `The Begotten slammed the Press shut. The Stamped ${original.name}'s attack shifted by ${delta > 0 ? '+1' : '-1'}.`;
      } else {
        const pool = Object.keys(SIGIL_MAPPING).filter(s => s !== 'Amorphous');
        clone.sigils = [pool[Math.floor(Math.random() * pool.length)]];
        desc = `The Begotten's carelessness cut ${original.name}'s crest in the Press, he Stamped it with ${clone.sigils[0]} to "compensate!"`;
      }
    }

    const nextDeck = [...masterDeck, clone];

    // Beat 1 (860ms): Swap blank plate for stamped clone mid-clamp (keep masterDeck untouched until reveal)
    scheduleEventTimer(() => {
      setGoobertStampedCard(clone);
      triggerSfx('play');
    }, 860);

    // Beat 2 (1860ms): Platen finishes lifting after 1s hold, cards unsquish into view
    scheduleEventTimer(() => {
      setGoobertStamping(false);
    }, 1860);

    // Beat 3 (3150ms): Commit stamped clone to masterDeck only once the reveal modal opens
    scheduleEventTimer(() => {
      setMasterDeck(nextDeck);
      masterDeckRef.current = nextDeck;
      setModalAlert({
        title: "THE BEGOTTEN SNEERS",
        message: desc,
        isWin: true,
        btnText: "VENTURE ONWARD",
        onAction: () => {
          setModalAlert(null);
          setGoobertSelectedIdx(null);
          setGoobertStampedCard(null);
          setGoobertOriginalSnapshot(null);
          setIsEventBusy(false);
          returnToMap(nextDeck);
        }
      });
    }, 3150);
  };

  // --- Cave Trials Event ---
    const initCaveTrial = () => {
      clearEventTimers();
      setIsEventBusy(false);
      const trialTypes = ['Trial of Bones', 'Trial of Blood', 'Trial of Power', 'Trial of Health', 'Trial of Wisdom', 'Trial of Kin'];
      const chosen = [...trialTypes].sort(() => Math.random() - 0.5).slice(0, 3);
      setCaveTrials(chosen);
      setCaveSelectedTrial(null);
      setCaveDrawnCards([]);
      setCaveRevealCount(0);
      setCaveVerdictReady(false);
      setCaveShowRewards(false);
      setCavePassed(false);
      setCaveRewardCards([]);
      setCaveSelectedRewardIdx(null);
      setScreen('EVENT_CAVE_TRIAL');
    };

  const CAVE_TRIAL_RULES: Record<
    string,
    { requirement: string; evaluate: (drawn: CardDef[]) => { passed: boolean; detail: string } }
  > = {
    'Trial of Bones': {
      requirement: 'Combined Bone Cost ≥ 5',
      evaluate: (drawn) => {
        const total = drawn.reduce((acc, c) => acc + (c.boneCost || 0), 0);
        return { passed: total >= 5, detail: `Total Bone Cost: ${total} / 5` };
      },
    },
    'Trial of Blood': {
      requirement: 'Combined Blood Cost ≥ 4',
      evaluate: (drawn) => {
        const total = drawn.reduce((acc, c) => acc + (c.cost || 0), 0);
        return { passed: total >= 4, detail: `Total Blood Cost: ${total} / 4` };
      },
    },
    'Trial of Power': {
      requirement: 'Combined Attack ≥ 4',
      evaluate: (drawn) => {
        const total = drawn.reduce((acc, c) => acc + (c.attack || 0), 0);
        return { passed: total >= 4, detail: `Total Attack: ${total} / 4` };
      },
    },
    'Trial of Health': {
      requirement: 'Combined Health ≥ 6',
      evaluate: (drawn) => {
        const total = drawn.reduce((acc, c) => acc + (c.health || 0), 0);
        return { passed: total >= 6, detail: `Total Health: ${total} / 6` };
      },
    },
    'Trial of Wisdom': {
      requirement: 'Combined Sigils ≥ 3',
      evaluate: (drawn) => {
        const total = drawn.reduce((acc, c) => acc + (c.sigils?.length || 0), 0);
        return { passed: total >= 3, detail: `Total Sigils: ${total} / 3` };
      },
    },
    'Trial of Kin': {
      requirement: '2+ Drawn Cards Share a Tribe',
      evaluate: (drawn) => {
        const tribes = drawn.map(c => c.class).filter(cl => cl !== 'No Class' && cl !== 'ALL Classes');
        const counts = new Map<string, number>();
        tribes.forEach(cl => counts.set(cl, (counts.get(cl) || 0) + 1));
        const matched = Array.from(counts.entries()).find(([, n]) => n >= 2);
        return {
          passed: Boolean(matched),
          detail: matched ? `Matched Tribe: ${matched[0]} (${matched[1]})` : 'No Matching Tribe',
        };
      },
    },
  };

  const evaluateCaveTrial = (trialName: string) => {
    if (isEventBusy || caveSelectedTrial) return;
    clearEventTimers();
    setIsEventBusy(true);
    setCaveSelectedTrial(trialName);
    const shuffled = [...masterDeck].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, 3);
    setCaveDrawnCards(drawn);
    setCaveRevealCount(0);
    setCaveVerdictReady(false);
    setCaveShowRewards(false);
    setCaveRewardCards([]);
    setCaveSelectedRewardIdx(null);

    const rule = CAVE_TRIAL_RULES[trialName];
    const passed = rule ? rule.evaluate(drawn).passed : false;
    setCavePassed(passed);

    const rewards: CardDef[] = [];
    if (passed) {
      const sigilPool = Object.keys(SIGIL_MAPPING).filter(s => s !== 'Amorphous');
      while (rewards.length < 3) {
        const base = cloneCard(EVENT_CARD_POOL[Math.floor(Math.random() * EVENT_CARD_POOL.length)]);
        const extraSigil = sigilPool[Math.floor(Math.random() * sigilPool.length)];
        if (!base.sigils.includes(extraSigil)) base.sigils.push(extraSigil);
        rewards.push(base);
      }
    }

    // Stagger each witness card draw with cardstock foley
    drawn.forEach((_, idx) => {
      scheduleEventTimer(() => {
        setCaveRevealCount(idx + 1);
        triggerSfx('draw');
      }, 180 + idx * 240);
    });

    // Slam verdict + rewards after the final card lands
    const verdictDelay = 180 + Math.max(1, drawn.length) * 240 + 260;
    scheduleEventTimer(() => {
      setCaveVerdictReady(true);
      if (passed) {
        setCaveRewardCards(rewards);
        triggerSfx('victory');
        // Let the player clearly see their 3 winning witnesses before revealing the 3 blessed rewards
        scheduleEventTimer(() => {
          setCaveShowRewards(true);
          triggerSfx('draw');
        }, 1450);
      } else {
        triggerSfx('defeat');
      }
    }, verdictDelay);
  };

  // --- Card Choice Event ---
  const initCardChoice = (isRare: boolean = false) => {
    const pool = isRare && RARE_CARD_POOL.length >= 3 ? RARE_CARD_POOL : EVENT_CARD_POOL;
    const picks: CardDef[] = [];
    const used = new Set<string>();
    while (picks.length < 3) {
      const c = cloneCard(pool[Math.floor(Math.random() * pool.length)]);
      if (!used.has(c.name)) {
        used.add(c.name);
        picks.push(c);
      }
    }
    setChoiceIsRare(isRare);
    setChoiceCards(picks);
    setChoiceSelectedIdx(null);
    setChoiceRerollsLeft(1);
    setChoiceDealGen(prev => prev + 1);
    setScreen('EVENT_CARD_CHOICE');
  };

  const rerollCardChoice = () => {
    if (choiceRerollsLeft <= 0) return;
    setChoiceRerollsLeft(prev => prev - 1);
    const pool = choiceIsRare && RARE_CARD_POOL.length >= 3 ? RARE_CARD_POOL : EVENT_CARD_POOL;
    const picks: CardDef[] = [];
    const used = new Set<string>();
    while (picks.length < 3) {
      const c = cloneCard(pool[Math.floor(Math.random() * pool.length)]);
      if (!used.has(c.name)) {
        used.add(c.name);
        picks.push(c);
      }
    }
    setChoiceCards(picks);
    setChoiceSelectedIdx(null);
    setChoiceDealGen(prev => prev + 1);
    triggerSfx('play');
  };

  // --- Woodcarver Totem Event ---
  const initBuildTotem = () => {
    clearEventTimers();
    setIsEventBusy(false);
    setEffigyStitchingAnim(false);
    setIsTotemFadingOut(false);
    setTotemChoicesHidden(false);
    setTotemStage('REWARD');
    setSelectedTotemRewardIdx(null);
    setHoveredTotemRewardIdx(null);
    setAssemblyHeadIdx(null);
    setAssemblyBodyIdx(null);

    const tribes: Tribe[] = ["Reptile", "Insect", "Avian", "Canine", "Hooved"];
    const BANNED_TOTEM_SIGILS = new Set([
      'Amorphous',
      'Omnistrike',
      'Shadow',
      'Tidal Lock',
      'Made of Stone',
      'Blood Moon'
    ]);
    const sigils = Object.keys(SIGIL_MAPPING).filter(s => !BANNED_TOTEM_SIGILS.has(s));

    const choices: Array<{ type: 'head' | 'body'; value: string }> = [];
    while (choices.length < 3) {
      const isHead = Math.random() < 0.5;
      const val = isHead ? tribes[Math.floor(Math.random() * tribes.length)] : sigils[Math.floor(Math.random() * sigils.length)];
      if (!choices.some(c => c.type === (isHead ? 'head' : 'body') && c.value === val)) {
        choices.push({ type: isHead ? 'head' : 'body', value: val });
      }
    }
    setTotemRewardChoices(choices);
    setScreen('EVENT_BUILD_TOTEM');
  };

  // --- Dev Console Actions ---
  const handleDevForce = (type: string) => {
    setScreen('DUEL');
    addLog(`[DEV] Overriding sequence -> ${type.toUpperCase()}`);
    if (type === 'combat') {
      startNextDuel(false);
    } else if (type === 'boss' || type === 'boss-zealot') {
      startNextDuel('Zealot', undefined, undefined, { isDevSandboxBoss: true });
    } else if (type === 'boss-goobert') {
      startNextDuel('The Begotten', undefined, undefined, { isDevSandboxBoss: true });
    } else if (type === 'boss-bonelord') {
      startNextDuel('BoneLord', undefined, undefined, { isDevSandboxBoss: true });
    } else if (type === 'boss-woodcarver') {
      startNextDuel('The Weaver', undefined, undefined, { isDevSandboxBoss: true });
    }
    else if (type === 'items') startItemEvent();
    else if (type === 'campfire') initCampfire();
    else if (type === 'altar') initAltar();
    else if (type === 'anvil') initAnvil();
    else if (type === 'flock') initFlock();
    else if (type === 'carving') initTotemCarving();
    else if (type === 'cost') initCostBargain();
    else if (type === 'choice') initCardChoice();
    else if (type === 'bonelord') initBoneLord();
    else if (type === 'mycologist') initMycologists();
    else if (type === 'goobert') initGoobert();
    else if (type === 'cave') initCaveTrial();
    else if (type === 'totem') initBuildTotem();
  };

  const handleDevJumpAct = (targetAct: 1 | 2 | 3 | 4) => {
    const mapOpts = {
      seed: runSeedRef.current || undefined,
      allEliteRow2: activeVowsRef.current.includes('all_elite_row2'),
    };
    const currentDeckSize = masterDeckRef.current.length || masterDeck.length;
    const nextMap = generateActMap(targetAct, getBossForAct(targetAct, mapOpts.seed), currentDeckSize, mapOpts);
    setStage(targetAct);
    setActMap(nextMap);
    actMapRef.current = nextMap;
    setCurrentStageName(nextMap.actTitle);
    triggerSfx('draw');
    addLog(`[DEV] Jumped to Act ${targetAct}: ${nextMap.actTitle}.`);
    setScreen('EVENT_CROSSROADS');
  };

  const handleDevNewHand = () => {
    let sourcePool = masterDeck;
    if (sourcePool.length === 0) {
      sourcePool = [
        cloneCard(ALL_CARD_LOOKUP["Stoat"]),
        cloneCard(ALL_CARD_LOOKUP["Bullfrog"]),
        cloneCard(ALL_CARD_LOOKUP["Wolf"]),
        cloneCard(ALL_CARD_LOOKUP["Cat"]),
        cloneCard(ALL_CARD_LOOKUP["Warren"]),
      ];
      setMasterDeck(sourcePool);
    }

    const shuffled = sourcePool
      .map(c => applyPlayerTotem(cloneCard(c, ouroborosBuffs), activeTotem))
      .sort(() => Math.random() - 0.5);

    const newHand: CardDef[] = [applyPlayerTotem(cloneCard(TOKEN_SQUIRREL, ouroborosBuffs), activeTotem)];
    const oneBloodIdx = shuffled.findIndex(c => c.cost === 1);
    if (oneBloodIdx !== -1) {
      newHand.push(transformAmorphous(shuffled.splice(oneBloodIdx, 1)[0]));
    }
    while (newHand.length < 4 && shuffled.length > 0) {
      newHand.push(transformAmorphous(shuffled.pop()!));
    }

    setHand(newHand);
    setDeck(shuffled);
    setSelectedHandIndex(null);
    setBackupState(null);
    setPhase('PLAY');
    triggerSfx('draw');
    addLog("[DEV] Hand flushed: fresh full 4-card hand dealt from Master Deck.");
  };

  // --- Card Renderer with Full Animations ---
  const renderCard = (card: CardDef | null, options?: RenderCardOptions) => {
    const laneIdx = options?.laneIndex;
    const isPlayerCard = !options?.isOpponent;
    const evolveMatch =
      laneIdx !== undefined
        ? evolvingCards.find(e => e.isPlayer === isPlayerCard && e.lane === laneIdx)
        : undefined;
    return (
      <CardView
        card={card}
        options={options}
        screen={screen}
        phase={phase}
        activeTotem={activeTotem}
        bossTotem={bossTotem}
        playerBoard={playerBoard}
        enemyBoard={enemyBoard}
        evolvingCards={evolvingCards}
        lateralMovements={lateralMovements}
        summonedCardIds={summonedCardIds}
        evolvePhase={evolveMatch?.phase ?? null}
        isSummoningFlag={card?.id ? summonedCardIds.has(card.id) : false}
        lateralDeltaVal={card?.id ? lateralMovements[card.id] : undefined}
        BASE={BASE}
        getCardAttack={getCardAttack}
        hasMoreSigilsThanOriginal={hasMoreSigilsThanOriginal}
        isCardNamed={isCardNamed}
        isLeftFacingCard={isLeftFacingCard}
        setSigilDetailModal={setSigilDetailModal}
      />
    );
  };

    return (
      <div
        id="game-viewport"
        style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
        <style>{`* { scrollbar-width: none !important; -ms-overflow-style: none !important; } *::-webkit-scrollbar { display: none !important; }`}</style>
        {/* Secret 5-Tap Trigger */}
        <div
          onClick={handleSecretDevTap}
          className="fixed top-0 left-0 w-14 h-14 z-[9999] cursor-default select-none pointer-events-auto"
        />
        <div
          id="game-container"
          ref={gameContainerRef}
        style={{
          width: 1280,
          height: 720,
          transform: `scale(${canvasScale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#140e0a',
        }}
      >
        <style>{`
            /* Occult Billowing Smoke: Multi-Tiered Organic Cloud Motion */
            @keyframes smokeBankRollInLeft {
              0% { transform: translateX(-100%) scale(0.92); opacity: 0; }
              35% { opacity: 0.95; }
              100% { transform: translateX(0%) scale(1); opacity: 1; }
            }
            @keyframes smokeBankRollInRight {
              0% { transform: translateX(100%) scale(0.92); opacity: 0; }
              35% { opacity: 0.95; }
              100% { transform: translateX(0%) scale(1); opacity: 1; }
            }
            @keyframes smokePuffSwirlIn {
              0% { transform: scale(0.4) rotate(-30deg); opacity: 0; }
              60% { opacity: 0.9; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }

            @keyframes smokeBankDisperseLeft {
              0% { transform: translateX(0%) scale(1) translateY(0); opacity: 1; }
              50% { opacity: 0.85; }
              100% { transform: translateX(-90%) scale(1.15) translateY(-30px); opacity: 0; }
            }
            @keyframes smokeBankDisperseRight {
              0% { transform: translateX(0%) scale(1) translateY(0); opacity: 1; }
              50% { opacity: 0.85; }
              100% { transform: translateX(90%) scale(1.15) translateY(-30px); opacity: 0; }
            }
            @keyframes smokePuffSwirlOut {
              0% { transform: scale(1) rotate(0deg); opacity: 1; }
              100% { transform: scale(1.4) rotate(45deg) translateY(-40px); opacity: 0; }
            }

            @keyframes smokeSootVeilIn {
              0% { opacity: 0; }
              60% { opacity: 0.6; }
              100% { opacity: 0.98; }
            }
            @keyframes smokeSootVeilOut {
              0% { opacity: 0.98; }
              40% { opacity: 0.6; }
              100% { opacity: 0; }
            }

            @keyframes smokeEmberDrift {
              0% { transform: translateY(20px) scale(0.8); opacity: 0; }
              30% { opacity: 1; }
              100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
            }
          @keyframes deckDrawBreathing {
            0%, 100% {
              filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.7)) drop-shadow(0 0 16px rgba(217, 119, 6, 0.5));
              box-shadow: 0 0 18px rgba(245, 158, 11, 0.55), inset 0 0 8px rgba(245, 158, 11, 0.3);
              border-color: #fbbf24;
            }
            50% {
              filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 28px rgba(245, 158, 11, 0.85));
              box-shadow: 0 0 32px rgba(245, 158, 11, 0.85), inset 0 0 14px rgba(251, 191, 36, 0.5);
              border-color: #fef08a;
            }
          }
          .animate-deck-glow {
            animation: deckDrawBreathing 3.6s ease-in-out infinite;
          }
          @keyframes menuFadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes menuFadeOut {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }
            .animate-menu-fade-in {
              animation: menuFadeIn 0.2s ease-out forwards;
            }
            .animate-menu-fade-out {
              animation: menuFadeOut 0.2s ease-in forwards;
              pointer-events: none;
            }
          @keyframes splashOccultPulse {
          0%, 100% {
            opacity: 0.78;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes splashPentagramRotate {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.28; }
          50% { transform: rotate(5deg) scale(1.03); opacity: 0.42; }
        }
        @keyframes splashCandleBreath {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.06); opacity: 0.65; }
        }
        .animate-occult-pulse {
          text-shadow: 0 0 14px rgba(239, 68, 68, 0.75), 0 0 28px rgba(185, 28, 28, 0.5);
          will-change: opacity;
          animation: splashOccultPulse 4.5s ease-in-out infinite;
        }
        .animate-candle-breath {
          animation: splashCandleBreath 6s ease-in-out infinite;
        }
        .animate-pentagram-rotate {
          animation: splashPentagramRotate 16s ease-in-out infinite;
        }
      }
        `}</style>

        {/* Volumetric Occult Smoke Cloud & Consecutive Battle Transition Overlays */}
        <SmokeTransitionOverlay phase={smokePhase} />
        <BattleTransitionOverlay phase={battleWipePhase} />

        {/* Active Stage Screen Container */}
        <div
          ref={screenStageRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 20,
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          className={`flex flex-col text-slate-200 overflow-hidden font-sans select-none ${getStageBgClass(stage, isBossMatch)} ${isTutorialGlitching ? 'animate-tutorial-glitch' : ''}`}
        >
        {/* =========================================================================
            SPLASH SCREEN
           ========================================================================= */}
        {screen === 'SPLASH' && (
        <React.Suspense fallback={null}>
          <SplashScreen
            discordGif={discordGif}
            clearRunSave={clearRunSave}
            discordError={discordError}
            discordInput={discordInput}
            getScreenBgStyle={getScreenBgStyle}
            handleAttemptUnlock={handleAttemptUnlock}
            handleContinueRun={handleContinueRun}
            handleDiscordClick={handleDiscordClick}
            isRitualReady={isRitualReady}
            ritualReadyProgress={ritualReadyProgress}
            savedRunExists={savedRunExists}
            setArchiveModalTab={setArchiveModalTab}
            setAudioEnabled={setAudioEnabled}
            setDiscordError={setDiscordError}
            setDiscordInput={setDiscordInput}
            setScreen={setScreen}
            setShowContinueModal={setShowContinueModal}
            setShowDiscordPrompt={setShowDiscordPrompt}
            showContinueModal={showContinueModal}
            showDiscordPrompt={showDiscordPrompt}
            unlockedDiscordUrl={unlockedDiscordUrl}
          />
        </React.Suspense>
      )}

      {/* =========================================================================
          STARTER DECK SELECTION SCREEN
         ========================================================================= */}
      {screen === 'DECK_SELECT' && (
        <React.Suspense fallback={null}>
          <DeckSelectScreen
            normalizeSeed={normalizeSeed}
            generateRandomSeed={generateRandomSeed}
            RITUAL_VOWS={RITUAL_VOWS}
            activeVows={activeVows}
            archive={archive}
            getScreenBgStyle={getScreenBgStyle}
            handleSelectLineage={handleSelectLineage}
            renderCard={renderCard}
            runSeedInput={runSeedInput}
            setRunSeedInput={setRunSeedInput}
            toggleRitualVow={toggleRitualVow}
            triggerSfx={triggerSfx}
          />
        </React.Suspense>
      )}

      {/* =========================================================================
          GENERIC GAME OVER SCREEN
         ========================================================================= */}
      {screen === 'GAME_OVER' && (
        <React.Suspense fallback={null}>
          <GameOverScreen
            RITUAL_VOW_MAP={RITUAL_VOW_MAP}
            activeVows={activeVows}
            bossState={bossState}
            calculateGrade={calculateGrade}
            copiedEndSeed={copiedEndSeed}
            getScreenBgStyle={getScreenBgStyle}
            handleRestartRun={handleRestartRun}
            items={items}
            masterDeck={masterDeck}
            renderCard={renderCard}
            runSeed={runSeed}
            runStats={runStats}
            setCopiedEndSeed={setCopiedEndSeed}
          />
        </React.Suspense>
      )}

      {/* =========================================================================
          GENERIC PAUSE / SETTINGS MENU MODAL
         ========================================================================= */}
      {archiveModalTab && (
        <ArchiveModal
          initialTab={archiveModalTab}
          archive={archive}
          onClose={() => setArchiveModalTab(null)}
        />
      )}

      {showPauseMenu && (
        <div className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-up font-mono select-none">
          <div className="max-w-sm w-full text-center relative border border-amber-950/60 p-6 bg-[#0c0805]">
            <div className="text-[10px] text-amber-700/80 tracking-widest uppercase mb-1">+-- RITUAL PAUSED --+</div>
            <h2 className="text-xl font-mono font-bold uppercase tracking-widest text-amber-200 mb-1">
              The Sanctuary
            </h2>
            <p className="text-[11px] text-amber-400/60 mb-6 uppercase tracking-wider">Audio & Ritual Controls</p>

            <div className="flex flex-col gap-4 w-full">
              {/* Volume Sliders inside Pause Menu */}
              <div className="w-full py-3 px-4 flex flex-col gap-3 font-mono text-xs text-left border border-amber-950/40">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] text-stone-300">
                    <span>Music Volume</span>
                    <span className="font-bold text-amber-300 font-mono">{Math.round(musicVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVol}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setMusicVol(val);
                      if (!audioEnabled && val > 0) setAudioEnabled(true);
                      ChiptuneAudio.setMusicVolume(val);
                    }}
                    className="w-full accent-amber-500 h-1 bg-stone-900 rounded cursor-pointer touch-manipulation"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] text-stone-300">
                    <span>Sound FX Volume</span>
                    <span className="font-bold text-amber-300 font-mono">{Math.round(sfxVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sfxVol}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSfxVol(val);
                      if (!audioEnabled && val > 0) setAudioEnabled(true);
                      ChiptuneAudio.setSfxVolume(val);
                    }}
                    onPointerUp={() => ChiptuneAudio.playSfxPreview()}
                    className="w-full accent-amber-500 h-1 bg-stone-900 rounded cursor-pointer touch-manipulation"
                  />
                </div>
              </div>

              {/* Compendium & Lifetime Ledger */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowPauseMenu(false);
                    setArchiveModalTab('COMPENDIUM');
                  }}
                  className="w-full py-2 bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#2f241c] rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[10px] uppercase tracking-widest text-[#cfb794] hover:text-[#f3ede2] cursor-pointer text-center"
                >
                  COMPENDIUM
                </button>
                <button
                  onClick={() => {
                    setShowPauseMenu(false);
                    setArchiveModalTab('LEDGER');
                  }}
                  className="w-full py-2 bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#2f241c] rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[10px] uppercase tracking-widest text-[#cfb794] hover:text-[#f3ede2] cursor-pointer text-center"
                >
                  LEDGER
                </button>
              </div>

              {/* Diegetic Timber Action Buttons */}
              <button
                onClick={() => setShowPauseMenu(false)}
                className="w-full py-2 bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#2f241c] rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-widest text-[#cfb794] hover:text-[#f3ede2] cursor-pointer text-center"
              >
                RESUME RITUAL
              </button>

              {/* Postpone Ritual (Save & Return to Title) */}
              <button
                onClick={() => {
                  if (masterDeck && masterDeck.length > 0) {
                    const isMidDuel = preDuelMapRef.current !== null;
                    if (!isMidDuel || !localStorage.getItem(RUN_SAVE_KEY)) {
                      try {
                        localStorage.setItem(RUN_SAVE_KEY, JSON.stringify({
                        masterDeck,
                        items,
                        totalOverkillDamage,
                        stage,
                        level,
                        duelsCompleted,
                        totemPieces,
                        activeTotem,
                        currentStageName,
                        startingBones: startingBonesRef.current !== undefined ? startingBonesRef.current : startingBones,
                        ouroborosBuffs,
                        runStats,
                        standardBossOrder: (window as any).__standardBossOrder,
                        hasDefeatedWeaver,
                        permanentScaleDebuff,
                        consecutiveOneTurnWins,
                        otkCooldown,
                        actMap: preDuelMapRef.current ?? actMapRef.current,
                        savedAt: Date.now(),
                      }));
                      setSavedRunExists(true);
                    } catch (e) {
                      console.warn("Postpone save failed:", e);
                    }
                    }
                  }
                  preDuelMapRef.current = null;
                  try {
                    ChiptuneAudio.playAmbient();
                  } catch (e) {
                    console.warn("Audio switch blocked:", e);
                  }
                  setShowPauseMenu(false);
                  setScreen('SPLASH');
                }}
                className="w-full py-2 bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-amber-900/60 hover:border-amber-700/80 rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-widest text-amber-300/90 hover:text-amber-200 cursor-pointer text-center"
              >
                POSTPONE RITUAL
              </button>

              {/* End Ritual (Surrender & Wipe Save) */}
              <button
                onClick={() => {
                  clearRunSave();
                  setShowPauseMenu(false);
                  triggerSfx('defeat');
                  setBossState(prev => ({
                    ...prev,
                    isRitualComplete: false,
                    ritualEndedVoluntarily: false,
                    ritualSurrendered: true,
                  }));
                  setScreen('GAME_OVER');
                }}
                className="w-full py-2 bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#3b1814] hover:border-red-900/80 rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-widest text-red-500/80 hover:text-red-400 cursor-pointer text-center"
              >
                END RITUAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAFT SCREEN (PELT TRADING)
         ========================================================================= */}
      {((['DRAFT', 'EVENT_CROSSROADS', 'EVENT_ITEMS', 'EVENT_CAMPFIRE', 'EVENT_ALTAR', 'EVENT_ANVIL', 'EVENT_FLOCK', 'EVENT_TOTEM_CARVING', 'EVENT_COST_BARGAIN', 'EVENT_BONE_LORD', 'EVENT_MYCOLOGIST', 'EVENT_GOOBERT', 'EVENT_CAVE_TRIAL', 'EVENT_BUILD_TOTEM', 'EVENT_CARD_CHOICE', 'EVENT_HOARDER_SEARCH'].includes(screen) ) || showViewDeck) && (
        <React.Suspense fallback={null}>
          <EventScreens
            ctx={{
              BASE,
              getScreenBgStyle: getEventScreenBgStyle,
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
              setShowPauseMenu,
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
            }}
          />
        </React.Suspense>
      )}

      {/* =========================================================================
          DEV TOOLS SCREEN MODAL (FULL ORIGINAL FEATURES RESTORED)
         ========================================================================= */}
      {screen === 'DEV_MENU' && (
        <React.Suspense fallback={null}>
          <DevMenuScreen
            addLog={addLog}
            archive={archive}
            bossPhase={bossPhase}
            bossState={bossState}
            cloneCard={cloneCard}
            devAlterCard={devAlterCard}
            devCardSearch={devCardSearch}
            devCardsFilter={devCardsFilter}
            devConfirmWipeArchive={devConfirmWipeArchive}
            devForceSubmenuOpen={devForceSubmenuOpen}
            devInspectCard={devInspectCard}
            devTab={devTab}
            displayStage={displayStage}
            encounter={encounter}
            enemyBoard={enemyBoard}
            enemyCardsPlayed={enemyCardsPlayed}
            enemyMaxDuelCards={enemyMaxDuelCards}
            enemyQueue={enemyQueue}
            getCardAttack={getCardAttack}
            getRequiredScaleWinDamage={getRequiredScaleWinDamage}
            handleDevForce={handleDevForce}
            handleDevJumpAct={handleDevJumpAct}
            handleDevNewHand={handleDevNewHand}
            handleWinMatch={handleWinMatch}
            isBossMatch={isBossMatch}
            masterDeck={masterDeck}
            menuFadingOut={menuFadingOut}
            ouroborosBuffs={ouroborosBuffs}
            phase={phase}
            playerBoard={playerBoard}
            previousScreen={previousScreen}
            renderCard={renderCard}
            scale={scale}
            setArchive={setArchive}
            setBones={setBones}
            setBossPhase={setBossPhase}
            setBossState={setBossState}
            setDevAlterCard={setDevAlterCard}
            setDevCardSearch={setDevCardSearch}
            setDevCardsFilter={setDevCardsFilter}
            setDevConfirmWipeArchive={setDevConfirmWipeArchive}
            setDevForceSubmenuOpen={setDevForceSubmenuOpen}
            setDevInspectCard={setDevInspectCard}
            setDevTab={setDevTab}
            setEnemyBoard={setEnemyBoard}
            setEnemyQueue={setEnemyQueue}
            setIsBloodMoonDropping={setIsBloodMoonDropping}
            setIsBoardRumbling={setIsBoardRumbling}
            setIsPhaseTransition={setIsPhaseTransition}
            setMasterDeck={setMasterDeck}
            setPhase={setPhase}
            setPlayerBoard={setPlayerBoard}
            setScale={setScale}
            setScreen={setScreen}
            setSigilDetailModal={setSigilDetailModal}
            setStartingBones={setStartingBones}
            setTotalOverkillDamage={setTotalOverkillDamage}
            setTurnNumber={setTurnNumber}
            startingBonesRef={startingBonesRef}
            transformAmorphous={transformAmorphous}
            triggerSfx={triggerSfx}
            turnNumber={turnNumber}
          />
        </React.Suspense>
      )}
      {/* =========================================================================
          DUEL BATTLEFIELD SCREEN (WITH AUTHENTIC LAYOUT & BOTTOM CONTROLS)
         ========================================================================= */}
      {(screen === 'DUEL' || screen === 'EVENT_HOARDER_SEARCH') && (
        <div
          ref={duelFieldRef}
          style={{
            backgroundColor: bossState.bgHex !== '#0b0f19' && bossState.bgHex !== '#18181b' ? bossState.bgHex : '#100c0a',
            backgroundImage: `radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(10,7,5,0.55) 90%), url('${
              isBossMatch && bossState.type === 'BoneLord'
                ? `${import.meta.env.BASE_URL || './'}assets/backgrounds/finalboss.jpg`
                : getArenaBackground(actMap?.act ?? displayStage, isBossMatch, bossState.type ?? undefined)
            }')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: bossState.bgHex !== '#0b0f19' && bossState.bgHex !== '#18181b' ? 'soft-light' : 'normal',
            transition: bossState.bgTransitionDuration > 0 ? `background-color ${bossState.bgTransitionDuration}s ease-in-out` : 'background-color 1.5s ease-in-out',
          }}
          className={`flex-1 flex flex-col justify-between p-2 sm:p-4 relative overflow-hidden transition-colors duration-700 ${
            isGrizzlyShaking ? 'animate-grizzly-shake' : ''
          }`}
        >

          {/* Heavy Vignette Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(35,24,18,0.4) 0%, rgba(10,7,5,0.95) 85%)',
            }}
          />

          {/* Ambient Candlelight Flickering Overlays (Upper-Left & Upper-Right Corners) */}
          <div className="absolute -top-16 -left-16 w-84 h-84 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22)_0%,rgba(180,83,9,0.08)_45%,transparent_70%)] pointer-events-none animate-[pulse_5s_infinite_ease-in-out] blur-2xl z-0" />
          <div
            className="absolute -top-16 -right-16 w-84 h-84 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.2)_0%,rgba(217,119,6,0.07)_45%,transparent_70%)] pointer-events-none animate-[pulse_5s_infinite_ease-in-out] blur-2xl z-0"
            style={{ animationDelay: '2.5s' }}
          />

          {/* Battle Arena Weather Layer (z-[5]: above arena backdrop, strictly behind cards & HUD) */}
          {renderActWeather('pointer-events-none absolute inset-0 z-[5] overflow-hidden select-none', 'duel')}

          {/* Sparse Slow-Rising Ambient Fire Embers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {[
              { left: '12%', bottom: '6%', delay: '0s', duration: '7s', size: 'w-1.5 h-1.5' },
              { left: '26%', bottom: '3%', delay: '2.4s', duration: '8.5s', size: 'w-1 h-1' },
              { left: '48%', bottom: '10%', delay: '4.8s', duration: '6.5s', size: 'w-1.5 h-1.5' },
              { left: '68%', bottom: '5%', delay: '1.2s', duration: '9s', size: 'w-1 h-1' },
              { left: '84%', bottom: '8%', delay: '3.6s', duration: '7.8s', size: 'w-1.5 h-1.5' },
              { left: '92%', bottom: '4%', delay: '5.2s', duration: '8s', size: 'w-1 h-1' },
            ].map((ember, i) => (
              <div
                key={`ember-${i}`}
                className={`absolute rounded-full bg-amber-400/65 shadow-[0_0_6px_rgba(245,158,11,0.85)] animate-ember pointer-events-none ${ember.size}`}
                style={{
                  left: ember.left,
                  bottom: ember.bottom,
                  animationDelay: ember.delay,
                  animationDuration: ember.duration,
                }}
              />
            ))}
          </div>

          {/* Animated Abyssal Backdrop for The Bone Lord (Phase 1 / 2 / 3 Escalation) */}
          {isBossMatch && bossState.type === 'BoneLord' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000">
              {/* Outer Counter-Rotating Miasma */}
              <div
                className="absolute -inset-[100%] animate-spin transition-opacity duration-1000"
                style={{
                  animationDuration: bossPhase === 3 ? '34s' : bossPhase === 2 ? '48s' : '65s',
                  animationDirection: 'reverse',
                  opacity: bossPhase === 3 ? 0.92 : 0.78,
                  background:
                    bossPhase === 2
                      ? 'radial-gradient(ellipse at center, rgba(126,34,206,0.22) 0%, rgba(49,10,49,0.34) 36%, transparent 66%)'
                      : 'radial-gradient(ellipse at center, rgba(185,28,28,0.24) 0%, rgba(69,10,10,0.34) 36%, transparent 66%)',
                }}
              />
              {/* Core Spinning Vortex */}
              <div
                className="absolute -inset-[60%] animate-spin opacity-90"
                style={{
                  animationDuration: bossPhase === 3 ? '20s' : '32s',
                  background:
                    bossPhase === 2
                      ? 'radial-gradient(circle at center, rgba(185,28,28,0.22) 0%, rgba(88,28,135,0.22) 42%, transparent 72%)'
                      : 'radial-gradient(circle at center, rgba(239,68,68,0.28) 0%, rgba(127,29,29,0.22) 42%, transparent 72%)',
                }}
              />
              {/* Phase 2: Shadow Inversion Rim */}
              {bossPhase === 2 && (
                <div
                  className="absolute inset-0 animate-pulse"
                  style={{
                    animationDuration: '4s',
                    background:
                      'radial-gradient(ellipse at center, transparent 34%, rgba(15,5,24,0.72) 78%, rgba(5,2,10,0.94) 100%)',
                  }}
                />
              )}
              {/* Phase 3: Blood Moon Eclipse Halo */}
              {bossPhase === 3 && (
                <>
                  <div
                    className="absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-red-500/35 shadow-[0_0_120px_rgba(220,38,38,0.55),inset_0_0_80px_rgba(185,28,28,0.45)] animate-pulse"
                    style={{ animationDuration: '2.8s' }}
                  />
                  <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(220,38,38,0.38)_0%,rgba(127,29,29,0.18)_42%,transparent_76%)] animate-pulse"
                    style={{ animationDuration: '2.4s' }}
                  />
                </>
              )}
              {/* Bottom Ossuary Underglow */}
              <div
                className="absolute inset-x-0 bottom-0 h-48"
                style={{
                  background:
                    bossPhase === 3
                      ? 'linear-gradient(to top, rgba(153,27,27,0.42), rgba(69,10,10,0.14) 55%, transparent)'
                      : 'linear-gradient(to top, rgba(95,12,12,0.32), transparent 70%)',
                }}
              />
              {/* Vignette Pulse */}
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(0,0,0,0.88)_95%)] animate-pulse"
                style={{ animationDuration: '6s' }}
              />
            </div>
          )}

          {/* Pre-Fight Boss Ritual Intro Banner */}
          {bossIntroBanner && (
            <div
              onClick={() => {
                if (bossIntroTimerRef.current) {
                  window.clearTimeout(bossIntroTimerRef.current);
                  bossIntroTimerRef.current = null;
                }
                setBossIntroBanner(null);
              }}
              className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/55 backdrop-blur-[2px] cursor-pointer select-none animate-menu-fade-in"
            >
              <div
                className={`w-full max-w-3xl relative py-7 sm:py-9 px-6 sm:px-10 text-center border-y shadow-[0_0_80px_rgba(0,0,0,0.95)] ${
                  bossIntroBanner.accent === 'crimson'
                    ? 'border-red-600/85 bg-[linear-gradient(90deg,transparent_0%,rgba(16,4,5,0.96)_14%,rgba(38,6,8,0.98)_50%,rgba(16,4,5,0.96)_86%,transparent_100%)] shadow-[0_0_90px_rgba(185,28,28,0.55)]'
                    : bossIntroBanner.accent === 'violet'
                      ? 'border-purple-500/80 bg-[linear-gradient(90deg,transparent_0%,rgba(14,8,20,0.96)_14%,rgba(32,12,48,0.98)_50%,rgba(14,8,20,0.96)_86%,transparent_100%)] shadow-[0_0_80px_rgba(126,34,206,0.45)]'
                      : bossIntroBanner.accent === 'emerald'
                        ? 'border-emerald-500/80 bg-[linear-gradient(90deg,transparent_0%,rgba(5,18,12,0.96)_14%,rgba(9,38,24,0.98)_50%,rgba(5,18,12,0.96)_86%,transparent_100%)] shadow-[0_0_80px_rgba(16,185,129,0.4)]'
                        : 'border-amber-600/80 bg-[linear-gradient(90deg,transparent_0%,rgba(18,11,6,0.96)_14%,rgba(38,22,10,0.98)_50%,rgba(18,11,6,0.96)_86%,transparent_100%)] shadow-[0_0_80px_rgba(217,119,6,0.42)]'
                }`}
              >
                <div className="flex items-center justify-center gap-3.5 mb-3">
                  <span className="h-px w-14 sm:w-24 bg-gradient-to-r from-transparent via-[#c49a5c]/80 to-[#f4d78b]" />
                  <span
                    className={`font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.34em] ${
                      bossIntroBanner.accent === 'crimson'
                        ? 'text-red-400'
                        : bossIntroBanner.accent === 'violet'
                          ? 'text-purple-300'
                          : bossIntroBanner.accent === 'emerald'
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                    }`}
                  >
                    {bossIntroBanner.eyebrow}
                  </span>
                  <span className="h-px w-14 sm:w-24 bg-gradient-to-l from-transparent via-[#c49a5c]/80 to-[#f4d78b]" />
                </div>

                <div className="flex items-center justify-center my-1">
                  <img
                    src={bossIntroBanner.img}
                    alt={bossIntroBanner.type}
                    draggable={false}
                    className={`w-auto object-contain mx-auto ${
                      bossIntroBanner.type === 'BoneLord'
                        ? 'max-h-24 sm:max-h-32 drop-shadow-[0_0_24px_rgba(220,38,38,0.75)]'
                        : 'max-h-20 sm:max-h-28 drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]'
                    }`}
                  />
                </div>

                <p className="mt-3 font-['Cinzel',_serif] italic text-xs sm:text-sm tracking-[0.1em] text-[#e6d1b0]/90">
                  {bossIntroBanner.subtitle}
                </p>
                <div className="mt-3 text-[9px] font-mono uppercase tracking-[0.28em] text-[#9b8265]/75">
                  Click or press Space to face the altar
                </div>
              </div>
            </div>
          )}

          {/* Cinematic Boss Phase-Shift Banner (Phase II / Phase III) */}
          {isPhaseTransition && isBossMatch && (() => {
            const isBL = bossState.type === 'BoneLord';
            const phaseRoman = bossPhase === 3 ? 'III' : 'II';
            const phaseTitle = isBL
              ? (bossPhase === 3 ? 'THE BLOOD MOON DESCENDS' : 'SHADOW INVERSION')
              : bossState.type === 'The Weaver'
                ? 'THE WEAVER REFUSES'
                : bossState.type === 'Zealot'
                  ? 'THE ZEALOT ASCENDS'
                  : 'THE PRESS AWAKENS';
            const phaseSub = isBL
              ? (bossPhase === 3
                  ? 'The ossuary sky splits open — endure the Eclipse.'
                  : 'Power and flesh invert beneath the Bone Lord’s gaze.')
              : bossState.type === 'Zealot'
                ? 'Stone walls encase your field. Your next turn is seized.'
                : 'The gauge resets. Brace for the second movement.';

            return (
              <div
                onClick={dismissPhaseTransition}
                className="fixed inset-0 z-[58] pointer-events-auto cursor-pointer bg-black/45 flex items-center justify-center px-4 select-none"
              >
                <div className="w-full max-w-2xl relative py-6 px-8 text-center border-y border-red-700/80 bg-[linear-gradient(90deg,transparent_0%,rgba(14,5,6,0.95)_16%,rgba(28,7,9,0.96)_50%,rgba(14,5,6,0.95)_84%,transparent_100%)] shadow-[0_0_60px_rgba(153,27,27,0.55)] animate-menu-fade-in">
                  <div className="flex items-center justify-center gap-3 mb-1.5">
                    <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-red-500/80" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.34em] text-red-400">
                      Phase {phaseRoman}
                    </span>
                    <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-red-500/80" />
                  </div>
                  <div className="font-['Cinzel',_serif] font-black text-2xl sm:text-4xl uppercase tracking-[0.2em] text-[#f7e5c4] drop-shadow-[0_2px_18px_rgba(220,38,38,0.75)]">
                    {phaseTitle}
                  </div>
                  <p className="mt-1.5 font-['Cinzel',_serif] italic text-xs sm:text-sm tracking-[0.08em] text-[#d6b79c]/90">
                    {phaseSub}
                  </p>
                  <div className="mt-3 text-[9px] font-mono uppercase tracking-[0.28em] text-[#9b8265]/80">
                    Click or press Space to continue
                  </div>
                </div>
              </div>
            );
          })()}
          {/* Zealot Phase 2 Diegetic Turn-Skip Banner */}
          {zealotParalyzedBanner && (
            <div
              onClick={() => {
                setZealotParalyzedBanner(false);
                handleEndTurn(true);
              }}
              className="fixed inset-0 z-[59] pointer-events-auto cursor-pointer bg-black/45 flex items-center justify-center px-4 select-none"
            >
              <div className="w-full max-w-xl relative py-5 px-8 text-center border-y border-red-700/85 bg-[linear-gradient(90deg,transparent_0%,rgba(14,5,6,0.94)_16%,rgba(32,6,8,0.96)_50%,rgba(14,5,6,0.94)_84%,transparent_100%)] shadow-[0_0_50px_rgba(185,28,28,0.55)] animate-menu-fade-in">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.34em] text-red-400 mb-1">
                  ✦ The Zealot&rsquo;s Grace ✦
                </div>
                <div className="font-['Cinzel',_serif] font-black text-xl sm:text-3xl uppercase tracking-[0.22em] text-[#f5e6cc] drop-shadow-[0_2px_16px_rgba(220,38,38,0.8)]">
                  Turn Seized
                </div>
                <p className="mt-1 font-['Cinzel',_serif] italic text-xs sm:text-sm tracking-[0.08em] text-stone-300/90">
                  Paralyzed in stone — the serpent strikes unopposed.
                </p>
                <div className="mt-3 text-[9px] font-mono uppercase tracking-[0.28em] text-[#9b8265]/80">
                  Click or press Space to continue
                </div>
              </div>
            </div>
          )}

          {/* Dialogue Popup Overlay (Modal backdrop shields table from input during speech) */}
          {bossState.activeDialogue && (
        <div
          className={`fixed inset-0 z-50 ${
            isTutorialDuel
              ? 'pointer-events-none bg-transparent'
              : 'bg-black/60 flex items-center justify-center pointer-events-auto'
          }`}
        >
          <div
            className={`pointer-events-auto select-none transition-all duration-300 ${
              isTutorialDuel
                ? getTutorialDialoguePosition(bossState.activeDialogue)
                : 'w-[92%] max-w-md'
            }`}
          >
              <div className={`p-4 sm:p-5 rounded-[3px] border flex flex-col items-center text-center font-mono w-full ${
                bossState.type === 'BoneLord' && !isTutorialDuel
                  ? 'border-red-800/90 bg-[radial-gradient(ellipse_at_top,#21080a_0%,#0d0506_75%)] shadow-[0_14px_40px_rgba(0,0,0,0.96),0_0_26px_rgba(185,28,28,0.35)]'
                  : 'border-[#8c6747]/80 bg-[#120c08]/95 shadow-[0_8px_25px_rgba(0,0,0,0.95)]'
              }`}>
                <div className={`text-[10px] tracking-[0.26em] uppercase mb-2 font-bold ${
                  bossState.type === 'BoneLord' && !isTutorialDuel
                    ? 'text-red-400/95'
                    : 'text-amber-700/80'
                }`}>
                  {isTutorialDuel
                    ? `+-- THEMS THE RULES (${dialogueTotalSteps - dialogueQueue.length}/${dialogueTotalSteps}) --+`
                    : bossState.type === 'BoneLord'
                      ? '✦ THE BONE LORD ✦'
                      : '+-- OCCULT WHISPERS --+'}
                </div>
                <p className="text-sm sm:text-base italic font-mono text-amber-100 mb-3 leading-snug">
                  "{bossState.activeDialogue}"
                </p>
                <button
                  onClick={() => {
                    if (dialogueQueue.length > 0) {
                      const nextMessage = dialogueQueue[0];
                      setDialogueQueue(prev => prev.slice(1));
                      setBossState(prev => ({ ...prev, activeDialogue: nextMessage }));
                      return;
                    }

                    if (bossState.type === 'Zealot' && bossState.phase === 2 && bossState.skipNextPlayerTurn) {
                      setBossState(prev => ({
                        ...prev,
                        activeDialogue: null,
                      }));
                      handleEndTurn(true);
                      return;
                    }

                    if (bossState.type === 'The Begotten' || (bossState.type as any) === 'Goobert') {
                      setBossState(prev => ({
                        ...prev,
                        activeDialogue: null,
                        bgHex: '#2AA331',
                        bgTransitionDuration: 6,
                      }));
                    } else if (bossState.type === 'BoneLord') {
                      setBossState(prev => ({
                        ...prev,
                        activeDialogue: null,
                        bgHex: '#300202',
                        bgTransitionDuration: 8,
                      }));

                      // If Phase 3 is active and Blood Moon is waiting in the heavens, slam it down now
                      if (bossPhase === 3 && !enemyBoard.some(c => c?.isMassive)) {
                        setIsBoardRumbling(true);
                        triggerSfx('hit');
                        if (typeof ChiptuneAudio !== 'undefined' && (ChiptuneAudio as any).playFinalBossPhase3) {
                          (ChiptuneAudio as any).playFinalBossPhase3(0.6);
                        }

                        setTimeout(() => {
                          const bloodMoonCard = {
                            ...cloneCard(ALL_CARD_LOOKUP['BLOOD MOON'], 0),
                            id: `blood-moon-${Date.now()}`
                          };
                          setEnemyBoard([bloodMoonCard, null, null, null]);
                          setIsBloodMoonDropping(true);
                          setTimeout(() => {
                            setIsBoardRumbling(false);
                            setIsBloodMoonDropping(false);
                          }, 2400);
                        }, 300);
                      }
                    } else {
                      setBossState(prev => ({ ...prev, activeDialogue: null }));
                    }
                  }}
                  className={
                    isTutorialDuel
                      ? "bg-[#1e1510] hover:bg-[#2b1e17] active:bg-[#140e0a] border border-[#593d25] rounded-sm shadow-[0_2px_0_#0a0807] transition-all font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-widest text-[#ebd9bf] hover:text-white px-5 py-1 cursor-pointer"
                      : "bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#2f241c] rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-xs uppercase tracking-widest text-[#cfb794] hover:text-[#f3ede2] px-6 py-2 cursor-pointer select-none"
                  }
                >
                  {dialogueQueue.length > 0 ? (isTutorialDuel ? 'NEXT RULE →' : 'CONTINUE') : (isTutorialDuel ? 'BEGIN DUEL' : 'CONTINUE')}
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Post-Bone-Lord Triumph Overlay */}
          {bossState.isRitualComplete && (
            <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/88 backdrop-blur-sm p-4 font-mono select-none animate-menu-fade-in">
              <div className="relative max-w-lg w-full text-center rounded-[3px] border border-[#c89d4c]/85 bg-[radial-gradient(ellipse_at_top,#26160b_0%,#110a07_58%,#090605_100%)] p-7 sm:p-9 shadow-[0_28px_70px_rgba(0,0,0,0.98),0_0_60px_rgba(212,175,55,0.22)] overflow-hidden">
                <span className="pointer-events-none absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#e5c16b]/85" />
                <span className="pointer-events-none absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#e5c16b]/85" />
                <span className="pointer-events-none absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#e5c16b]/85" />
                <span className="pointer-events-none absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#e5c16b]/85" />

                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#d4af37]/85" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.32em] text-[#e5c16b]">
                    Sanctuary Seal Broken
                  </span>
                  <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#d4af37]/85" />
                </div>

                <h2 className="font-['Cinzel',_serif] text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] text-[#fae7b8] drop-shadow-[0_2px_18px_rgba(234,179,8,0.45)] mb-2">
                  The Bone Lord Lies Bound
                </h2>
                <p className="font-['Cinzel',_serif] italic text-xs sm:text-sm text-[#d4bea0]/90 mb-7 leading-relaxed">
                  The sacred ritual has been completed. Will you seal the archive, or descend further into madness?
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleEndRitual}
                    className="bg-gradient-to-b from-[#3b2814] to-[#20150a] hover:from-[#4d341a] hover:to-[#2a1b0d] active:translate-y-[1px] border border-[#e5c16b]/90 rounded-[2px] shadow-[0_4px_18px_rgba(212,175,55,0.28),inset_0_1px_0_rgba(255,244,200,0.22)] transition-all duration-100 font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] text-[#fff2cc] hover:text-white px-6 py-3 cursor-pointer select-none"
                  >
                    Seal the Archives · Claim Victory
                  </button>
                  <button
                    onClick={handleContinueRitual}
                    className="bg-[#18120e] hover:bg-[#241a14] active:translate-y-[1px] border border-[#5a422c]/85 hover:border-[#c99b56] rounded-[2px] shadow-[0_2px_0_#0a0807] transition-all duration-100 font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.2em] text-[#cbb28d] hover:text-[#f6e8cc] px-6 py-2.5 cursor-pointer select-none"
                  >
                    Continue the Ritual · Endless Descent
                  </button>
                </div>
              </div>
            </div>
          )}

          {isBossMatch && (
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12)_0%,transparent_75%)] animate-pulse" />
          )}


  {/* Battlefield Stage: Proportional Positioning Canvas */}
          <div className="relative w-full flex-1 min-h-0 flex items-center justify-center z-10">
            <div className="relative w-[860px] sm:w-[920px] h-[550px] shrink-0">

              {/* FIXED LEFT FLANK: Wraps BOTH Upper Tier AND Lower Tier in a single column */}
              <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center justify-between h-[510px] w-44 select-none pointer-events-auto py-1 z-20 scale-105 origin-left">
                
                {/* Upper Tier: Stage Text & Active Totems */}
                <div className="flex flex-col items-center justify-center text-center gap-1.5 w-full relative -translate-y-5 sm:-translate-y-6 -translate-x-6 sm:-translate-x-8">
                  {/* Stage Text on Individual Lines */}
                  <div className="flex flex-col items-center justify-center select-none text-center">
                    <h2 className={`font-['Cinzel',_serif] font-black text-base sm:text-lg tracking-[0.25em] uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] ${
                      isBossMatch && bossState.type === 'BoneLord'
                        ? 'text-red-200 drop-shadow-[0_0_12px_rgba(220,38,38,0.65)]'
                        : 'text-[#d6ba94]'
                    }`}>
                      {isBossMatch
                        ? (bossState.type === 'Zealot'
                            ? "The Zealot"
                            : bossState.type === 'The Begotten' || (bossState.type as any) === 'Goobert'
                              ? "The Begotten"
                              : bossState.type === 'BoneLord'
                                ? "The Bone Lord"
                                : "The Weaver")
                        : currentStageName}
                    </h2>
                    <div
                      style={{
                        backgroundImage: `linear-gradient(180deg, ${isBossMatch && bossState.type === 'BoneLord' ? 'rgba(26,7,8,0.82), rgba(18,5,6,0.9)' : 'rgba(16,14,16,0.72), rgba(12,10,12,0.86)'}), url("${import.meta.env.BASE_URL || './'}assets/text/mapbg.jpg")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      className={`mt-1 inline-flex items-center justify-center px-3 py-1.5 rounded-[2px] border shadow-[inset_0_1px_6px_rgba(0,0,0,0.75)] ${
                        isBossMatch && bossState.type === 'BoneLord'
                          ? 'border-red-800/85'
                          : 'border-[#4a413b]/75'
                      }`}
                    >
                      <span className={`font-['Cinzel',_serif] font-semibold text-[10px] leading-none tracking-[0.22em] pl-[0.22em] uppercase ${
                        isBossMatch && bossState.type === 'BoneLord'
                          ? 'text-red-200/95'
                          : 'text-[#bfa78b]'
                      }`}>
                        {isBossMatch
                          ? (bossState.type === 'BoneLord'
                              ? (bossPhase === 1 ? 'Phase I • Ossuary' : bossPhase === 2 ? 'Phase II • Shadow' : 'Phase III • Eclipse')
                              : `Stage ${stage} • Phase ${bossPhase}`)
                          : `Stage ${stage} • Depth ${level}`}
                      </span>
                    </div>
                    {isBossMatch && bossState.type === 'BoneLord' && (
                      <div className="mt-1.5 flex items-center justify-center gap-2" title={`Bone Lord Phase ${bossPhase} of 3`}>
                        {[1, 2, 3].map(p => (
                          <span
                            key={p}
                            className={`w-2 h-2 rotate-45 border transition-all duration-300 ${
                              p < bossPhase
                                ? 'bg-red-900/70 border-red-700/70 opacity-60'
                                : p === bossPhase
                                  ? 'bg-red-500 border-amber-200 shadow-[0_0_8px_rgba(239,68,68,0.95)] scale-110'
                                  : 'bg-[#160b0b] border-[#5a302c]/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2 w-28 mt-2">
                      <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#6e6052]/70" />
                      <span className="w-1 h-1 rotate-45 bg-[#8f7960]/80" />
                      <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#6e6052]/70" />
                    </div>
                  </div>

                  {/* Physical Stitched Effigy & Enemy Poppet Table Display */}
                  {(Boolean(bossTotem && (!isBossMatch || bossState.type === 'The Weaver')) || Boolean(activeTotem?.head && activeTotem?.body)) && (() => {
                    const showEnemyPoppet = Boolean(bossTotem && (!isBossMatch || bossState.type === 'The Weaver'));
                    const showPlayerEffigy = Boolean(activeTotem?.head && activeTotem?.body);
                    const isDual = showEnemyPoppet && showPlayerEffigy;

                    const renderDoll = (opts: {
                      uid: string;
                      roleLabel: string;
                      tooltipTitle: string;
                      tribeName: string;
                      sigilName: string;
                      theme: 'player' | 'weaver' | 'foe';
                    }) => {
                      const { uid, roleLabel, tooltipTitle, tribeName, sigilName, theme } = opts;
                      const isWeaver = theme === 'weaver';
                      const isFoe = theme === 'foe';

                      const dollFilterClass = isWeaver
                        ? 'hue-rotate-[255deg] saturate-[1.35] brightness-[0.82] contrast-[1.15] drop-shadow-[0_8px_16px_rgba(88,28,135,0.6)]'
                        : isFoe
                          ? 'hue-rotate-[-32deg] saturate-[1.35] brightness-[0.76] contrast-[1.15] drop-shadow-[0_8px_16px_rgba(127,29,29,0.55)]'
                          : 'drop-shadow-[0_8px_14px_rgba(0,0,0,0.85)]';

                      const badgeClass = isWeaver
                        ? 'border-purple-700/75 bg-[#120b18]/92 text-purple-200'
                        : isFoe
                          ? 'border-red-800/75 bg-[#160b0b]/92 text-red-200'
                          : 'border-[#6e5638]/80 bg-[#120d09]/92 text-[#ebd1a0]';

                      const tooltipBorderClass = isWeaver
                        ? 'border-purple-600/80'
                        : isFoe
                          ? 'border-red-700/80'
                          : 'border-[#9a7342]/80';

                      const tooltipTitleClass = isWeaver
                        ? 'text-purple-300'
                        : isFoe
                          ? 'text-red-300'
                          : 'text-[#f4d78b]';

                      const crestDesc = `All ${isWeaver || isFoe ? 'enemy ' : ''}${tribeName} creatures bear the ${sigilName || 'unmarked'} Crest.`;
                      const sigilDesc = sigilName ? (SIGIL_DESCRIPTIONS as Record<string, string>)[sigilName] : '';

                      return (
                        <div key={uid} className={`group relative z-10 hover:z-[80] flex flex-col items-center select-none cursor-help ${isWeaver || isFoe ? '-translate-y-1.5' : ''}`}>
                          {/* Physical Stitched Burlap Doll Container */}
                          <div className={`relative flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.05] ${isDual ? 'h-[102px]' : 'h-[110px]'} aspect-[235/347]`}>
                            <div className={`relative w-full h-full pointer-events-none ${isWeaver || isFoe ? '-scale-x-100' : ''} ${dollFilterClass}`}>
                              <img
                                src={`${import.meta.env.BASE_URL || './'}assets/text/effigy.png`}
                                alt={tooltipTitle}
                                draggable={false}
                                className="w-full h-full object-contain"
                              />

                              <svg
                                viewBox="0 0 235 347"
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                style={{
                                  WebkitMaskImage: `url(${import.meta.env.BASE_URL || './'}assets/text/effigy.png)`,
                                  maskImage: `url(${import.meta.env.BASE_URL || './'}assets/text/effigy.png)`,
                                  WebkitMaskSize: '100% 100%',
                                  maskSize: '100% 100%',
                                }}
                              >
                                <defs>
                                  <filter id={`${uid}-effigyBlur`} x="-30%" y="-30%" width="160%" height="160%">
                                    <feGaussianBlur stdDeviation="2.4" />
                                  </filter>
                                  <radialGradient id={`${uid}-effigyCollar`} cx="50%" cy="50%" r="50%">
                                    <stop offset="70%" stopColor="#1a0f07" stopOpacity="0" />
                                    <stop offset="92%" stopColor="#5a3b1c" stopOpacity="0.32" />
                                    <stop offset="100%" stopColor="#3a2410" stopOpacity="0.42" />
                                  </radialGradient>
                                  <clipPath id={`${uid}-effigyCrestClip2`}>
                                    <circle cx="135" cy="189" r="30" />
                                  </clipPath>
                                  <radialGradient id={`${uid}-effigyBulge`} cx="36%" cy="30%" r="78%">
                                    <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
                                    <stop offset="45%" stopColor="#fff" stopOpacity="0" />
                                    <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
                                  </radialGradient>
                                </defs>

                                <image
                                  href={`${import.meta.env.BASE_URL || './'}assets/text/effigy.png`}
                                  x="0"
                                  y="0"
                                  width="235"
                                  height="347"
                                  preserveAspectRatio="none"
                                />

                                {sigilName && (
                                  <>
                                    <g transform="translate(5 2) rotate(-14 130 187)">
                                      <g transform="translate(130 187) scale(0.9 1) translate(-130 -187)">
                                        <circle cx="130" cy="189" r="37" fill="#000" opacity="0.4" filter={`url(#${uid}-effigyBlur)`} />
                                        <circle cx="130" cy="187" r="37" fill={`url(#${uid}-effigyCollar)`} />
                                        <image
                                          href={getSigilArtUrl(sigilName)}
                                          x="101"
                                          y="158"
                                          width="58"
                                          height="58"
                                          preserveAspectRatio="xMidYMid meet"
                                          style={{ imageRendering: 'pixelated' }}
                                        />
                                        <circle cx="130" cy="187" r="37" fill={`url(#${uid}-effigyBulge)`} />
                                        <g strokeLinecap="round">
                                          {Array.from({ length: 22 }, (_, i) => {
                                            const ang = (i / 22) * Math.PI * 2;
                                            const c = Math.cos(ang);
                                            const sn = Math.sin(ang);
                                            return (
                                              <g key={`${uid}-crest-st-${i}`}>
                                                <line x1={130 + 27.5 * c + 0.6} y1={187 + 27.5 * sn + 0.8} x2={130 + 37 * c + 0.6} y2={187 + 37 * sn + 0.8} stroke="#000" strokeOpacity="0.28" strokeWidth="1.4" />
                                                <line x1={130 + 27.5 * c} y1={187 + 27.5 * sn} x2={130 + 37 * c} y2={187 + 37 * sn} stroke="#d8b46c" strokeOpacity="0.9" strokeWidth="1.05" />
                                              </g>
                                            );
                                          })}
                                        </g>
                                      </g>
                                    </g>
                                    <image
                                      href={`${import.meta.env.BASE_URL || './'}assets/text/effigy.png`}
                                      x="0"
                                      y="0"
                                      width="235"
                                      height="347"
                                      preserveAspectRatio="none"
                                      clipPath={`url(#${uid}-effigyCrestClip2)`}
                                      opacity="0.5"
                                      style={{ mixBlendMode: 'multiply' }}
                                    />
                                  </>
                                )}
                              </svg>

                              {tribeName && (
                                <div
                                  className="absolute pointer-events-none flex items-center justify-center"
                                  style={{
                                    left: '43%',
                                    top: '18%',
                                    transform: 'translate(-50%, -50%)',
                                    WebkitMaskImage: 'repeating-linear-gradient(32deg, #000 0 1.4px, rgba(0,0,0,0.55) 1.4px 2.6px), radial-gradient(ellipse at 46% 44%, #000 56%, rgba(0,0,0,0.3) 100%)',
                                    maskImage: 'repeating-linear-gradient(32deg, #000 0 1.4px, rgba(0,0,0,0.55) 1.4px 2.6px), radial-gradient(ellipse at 46% 44%, #000 56%, rgba(0,0,0,0.3) 100%)',
                                    WebkitMaskComposite: 'source-in',
                                    maskComposite: 'intersect',
                                  }}
                                >
                                  <div
                                    className="[&>*]:scale-[1.2]"
                                    style={{ filter: 'brightness(0.14) sepia(1) saturate(2.4) drop-shadow(-0.5px -0.5px 0.5px rgba(30,16,4,0.85)) drop-shadow(0.5px 0.5px 0.4px rgba(255,236,190,0.4))' }}
                                  >
                                    {TRIBE_EMBROIDERY[tribeName as Tribe] || <span className="text-xs">✦</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Compact Nameplate Under Doll */}
                          <div className={`-mt-1 px-1.5 py-0.5 rounded-[2px] border shadow-[0_4px_10px_rgba(0,0,0,0.85)] text-center max-w-[96px] ${badgeClass}`}>
                            <div className="font-['Cinzel',_serif] font-bold text-[7px] uppercase tracking-[0.14em] leading-tight whitespace-nowrap">
                              {roleLabel}
                            </div>
                            <div className="font-mono text-[7px] opacity-85 truncate leading-tight">
                              {tribeName} · {sigilName || '—'}
                            </div>
                          </div>

                          {/* Hover Inspection Plaque */}
                          <div
                            className={`pointer-events-none opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-[70] w-56 rounded-[2px] bg-[#0e0a09]/96 border ${tooltipBorderClass} px-3 py-2.5 text-left shadow-[0_14px_30px_rgba(0,0,0,0.95)]`}
                          >
                            <div className={`font-['Cinzel',_serif] text-[9px] font-bold uppercase tracking-[0.2em] ${tooltipTitleClass}`}>
                              {tooltipTitle}
                            </div>
                            <div className="font-['Cinzel',_serif] text-[11px] font-bold text-[#f3e5cc] mt-0.5 leading-snug">
                              {tribeName} — {sigilName || 'Unmarked'}
                            </div>
                            <div className="h-px w-full bg-[#3a2a1e]/80 my-1.5" />
                            <p className="font-mono text-[9.5px] text-[#cbb89d] leading-relaxed">
                              {crestDesc}
                            </p>
                            {sigilDesc && (
                              <>
                                <div className="h-px w-full bg-[#3a2a1e]/60 my-1.5" />
                                <p className="font-mono text-[9px] text-[#e6d2b5]/90 leading-relaxed">
                                  <span className="font-bold text-[#f4d78b]">{sigilName}:</span> {sigilDesc}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className={`flex flex-row items-end justify-center w-full mt-0.5 ${isDual ? 'gap-1 -mx-2' : 'gap-2'}`}>
                        {showEnemyPoppet && bossTotem && renderDoll({
                          uid: 'enemy',
                          roleLabel: isBossMatch && bossState.type === 'The Weaver' ? 'Weaver Poppet' : 'Foe Poppet',
                          tooltipTitle: isBossMatch && bossState.type === 'The Weaver' ? "Weaver's Poppet" : 'Foe Poppet',
                          tribeName: (bossTotem as any).class || (bossTotem as any).tribe || (bossTotem as any).head || 'Canine',
                          sigilName: (bossTotem as any).sigil || (bossTotem as any).body || '',
                          theme: isBossMatch && bossState.type === 'The Weaver' ? 'weaver' : 'foe',
                        })}
                        {showPlayerEffigy && renderDoll({
                          uid: 'player',
                          roleLabel: 'Effigy',
                          tooltipTitle: 'Stitched Effigy',
                          tribeName: activeTotem.head || 'Canine',
                          sigilName: activeTotem.body || '',
                          theme: 'player',
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Lower Tier: End Turn Button & Utility Plaques */}
                <div className="flex flex-col items-center gap-0 w-full mt-auto mb-0 pt-0.5 relative scale-105 origin-bottom translate-y-4 sm:translate-y-5">
                  {/* Diegetic Blood-Prick Talisman (Enlarged Plinth) */}
                  <div className="flex flex-col items-center mt-1 -translate-x-6 sm:-translate-x-8 group select-none">
                      <button
                          onClick={handleTalismanPrick}
                          disabled={phase !== 'PLAY' || isTalismanPricked}
                          title={phase === 'PLAY' ? "Prick your finger upon the iron dish to seal your assault" : "Awaiting your turn..."}
                          style={{
                            backgroundImage: `radial-gradient(circle at 38% 30%, rgba(36,32,30,0.42), rgba(14,12,14,0.82) 72%, rgba(8,7,9,0.94) 100%), url("${import.meta.env.BASE_URL || './'}assets/text/mapbg.jpg")`,
                            backgroundSize: 'cover, cover',
                            backgroundPosition: 'center, center',
                          }}
                          className={`relative overflow-hidden w-[138px] h-[138px] sm:w-[154px] sm:h-[154px] rounded-full bg-[#151316] border-2 flex items-center justify-center select-none outline-none transition-all duration-200 ${
                            isTalismanPricked
                              ? 'translate-y-1 scale-[0.98] border-[#ef4444] shadow-[0_1px_0_#070504,inset_0_5px_14px_rgba(0,0,0,0.98),0_0_28px_rgba(239,68,68,0.85)] cursor-default'
                              : phase === 'PLAY'
                                ? 'border-[#4a413b] shadow-[0_4px_0_#080709,0_10px_20px_rgba(0,0,0,0.88),inset_0_1px_1px_rgba(255,255,255,0.08)] hover:border-[#ef4444] hover:shadow-[0_0_24px_rgba(239,68,68,0.55),0_0_44px_rgba(185,28,28,0.3),inset_0_0_16px_rgba(185,28,28,0.35)] cursor-pointer active:translate-y-1 active:scale-[0.98]'
                                : 'border-[#262326] opacity-60 shadow-[0_3px_0_#080709,0_6px_12px_rgba(0,0,0,0.7)] cursor-not-allowed'
                          }`}
                        >
                          {/* Inner Radial Bloodlight Atmosphere (Hover & Pricked) */}
                          <div
                            className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
                              isTalismanPricked
                                ? 'opacity-100 bg-[radial-gradient(circle,rgba(220,38,38,0.35)_0%,rgba(153,27,27,0.15)_55%,transparent_75%)]'
                                : 'opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(220,38,38,0.25)_0%,rgba(153,27,27,0.1)_50%,transparent_75%)]'
                            }`}
                          />

                          {/* Outer Inset Groove */}
                          <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-black/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] pointer-events-none" />

                          {/* Outermost Band: Full-Bleed Perimeter Zalgo Inscription Loop */}
                          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <defs>
                              <path
                                id="talismanOuterZalgoPath"
                                d="M 50, 4.5 a 45.5,45.5 0 1,1 0,91 a 45.5,45.5 0 1,1 0,-91"
                              />
                            </defs>
                            <text
                              className={`font-mono text-[3.8px] font-bold select-none tracking-[0.03em] transition-all duration-200 ${
                                isTalismanPricked
                                  ? 'fill-[#ef4444] drop-shadow-[0_0_3px_rgba(239,68,68,0.7)]'
                                  : 'fill-[#0a090b] group-hover:fill-[#ef4444] group-hover:drop-shadow-[0_0_3px_rgba(239,68,68,0.6)]'
                              }`}
                            >
                              <textPath
                                href="#talismanOuterZalgoPath"
                                startOffset="0%"
                                textLength="285.9"
                                lengthAdjust="spacing"
                              >
                                S̴̵̷A̸̷N̴̵̷G̸̷U̴̵̷I̸̷S̴̵̷ • E̸̷X̴̵̷C̴̵̷I̸̷D̴̵̷I̸̷U̴̵̷M̸̷ • ᚛ᚨ̴̵̷ᛚ̴̵̷ᛏ̴̵̷ᚨ̴̵̷ᚱ̴̵̷᚜ • O̸̷B̸̷L̴̵̷A̴̵̷T̸̷I̸̷O̴̵̷ • M̸̷O̴̵̷R̸̷T̴̵̷A̸̷L̸̷I̸̷S̴̵̷ • S̴̵̷A̸̷N̴̵̷G̸̷U̴̵̷I̸̷S̴̵̷ • E̸̷X̴̵̷C̴̵̷I̸̷D̴̵̷I̸̷U̴̵̷M̸̷ • ᚛ᚨ̴̵̷ᛚ̴̵̷ᛏ̴̵̷ᚨ̴̵̷ᚱ̴̵̷᚜ • O̸̷B̸̷L̴̵̷A̴̵̷T̸̷I̸̷O̴̵̷ • M̸̷O̴̵̷R̸̷T̴̵̷A̸̷L̸̷I̸̷S̴̵̷ •
                              </textPath>
                            </text>
                          </svg>

                          {/* Plinth Fissures: hairline cracks running in from the rim */}
                          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 w-full h-full z-[5]" aria-hidden="true">
                            <defs>
                              <g id="plinthFissures" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M 8 24 L 14 27 L 13 33 L 21 36 L 24 43 L 31 45" />
                                <path d="M 13 33 L 6 37" />
                                <path d="M 21 36 L 24 30 L 22 25" />
                                <path d="M 91 74 L 85 72 L 84 66 L 77 64 L 74 57" />
                                <path d="M 84 66 L 90 63" />
                                <path d="M 77 64 L 79 70 L 76 76" />
                                <path d="M 26 92 L 29 86 L 27 80 L 33 76 L 32 70" />
                                <path d="M 29 86 L 36 88" />
                                <path d="M 76 9 L 72 14 L 75 19 L 70 23 L 71 29" />
                                <path d="M 98 48 L 92 50 L 90 55" />
                                <path d="M 2 55 L 8 57 L 10 62" />
                              </g>
                            </defs>
                            <use href="#plinthFissures" stroke="rgba(255,235,210,0.14)" strokeWidth="0.5" transform="translate(0.5 0.6)" className={`transition-opacity duration-200 ${isTalismanPricked ? 'opacity-0' : 'group-hover:opacity-0'}`} />
                            <use
                              href="#plinthFissures"
                              strokeWidth="0.9"
                              className={`transition-all duration-200 ${
                                isTalismanPricked
                                  ? 'stroke-[#ef4444] drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]'
                                  : 'stroke-[#050405] opacity-90 group-hover:stroke-[#ef4444] group-hover:opacity-100 group-hover:drop-shadow-[0_0_3px_rgba(239,68,68,0.7)]'
                              }`}
                            />
                          </svg>

                          {/* Mid Dashed Ring */}
                          <div className={`absolute inset-3 sm:inset-3.5 rounded-full border border-dashed transition-all duration-200 pointer-events-none ${
                            isTalismanPricked
                              ? 'border-red-900/60 shadow-[0_0_8px_rgba(185,28,28,0.25)]'
                              : 'border-[#0a090b] group-hover:border-[#b91c1c]/90 group-hover:shadow-[0_0_6px_rgba(185,28,28,0.4)]'
                          }`} />

                          {/* Pentagram PNG: black at rest, lit on hover/prick */}
                          <img
                            src={`${import.meta.env.BASE_URL || './'}assets/text/plinth.png`}
                            alt=""
                            draggable={false}
                            className={`absolute inset-[7%] w-[86%] h-[86%] object-contain pointer-events-none select-none transition-all duration-200 ${
                              isTalismanPricked
                                ? 'brightness-110 saturate-150 drop-shadow-[0_0_4px_rgba(255,120,120,1)] drop-shadow-[0_0_14px_rgba(239,68,68,1)] drop-shadow-[0_0_32px_rgba(220,38,38,0.95)]'
                                : 'brightness-[0.12] opacity-90 group-hover:brightness-110 group-hover:saturate-150 group-hover:opacity-100 group-hover:drop-shadow-[0_0_4px_rgba(255,120,120,1)] group-hover:drop-shadow-[0_0_14px_rgba(239,68,68,1)] group-hover:drop-shadow-[0_0_32px_rgba(220,38,38,0.95)]'
                            }`}
                          />

                          {/* Inner Core SVG */}
                          <svg viewBox="0 0 100 100" className="relative z-10 w-[96px] h-[96px] sm:w-[116px] sm:h-[116px] overflow-visible pointer-events-none transition-transform duration-150">
                            <defs>
                              <path
                                id="talismanInnerZalgoPath"
                                d="M 50, 12.5 a 37.5,37.5 0 1,1 0,75 a 37.5,37.5 0 1,1 0,-75"
                              />
                            </defs>

                            {/* Plinth Inner Bevel */}
                            <circle
                              cx="50"
                              cy="50"
                              r="44"
                              fill="none"
                              stroke={isTalismanPricked ? "#7f1d1d" : "#0a090b"}
                              strokeWidth="2.5"
                              className="transition-colors duration-200 group-hover:stroke-[#7f1d1d]"
                            />

                            {/* Inner Ring: 360-Degree Zalgo Inscription Loop */}
                            <text
                              className={`font-mono text-[4.1px] font-bold select-none tracking-[0.04em] transition-all duration-200 ${
                                isTalismanPricked
                                  ? 'fill-[#ef4444] drop-shadow-[0_0_3px_rgba(239,68,68,0.75)]'
                                  : 'fill-[#0a090b] group-hover:fill-[#ef4444] group-hover:drop-shadow-[0_0_3px_rgba(239,68,68,0.6)]'
                              }`}
                            >
                              <textPath
                                href="#talismanInnerZalgoPath"
                                startOffset="0%"
                                textLength="235.6"
                                lengthAdjust="spacing"
                              >
                                S̴̵̷A̸̷C̴̵̷R̴̵̷I̸̷F̴̵̷I̸̷C̴̵̷I̸̷U̴̵̷M̸̷ • M̴̵̷O̸̷R̴̵̷T̸̷I̸̷S̴̵̷ • S̴̵̷A̸̷N̴̵̷G̸̷U̴̵̷I̸̷S̴̵̷ • ᚛ᛟ̴̵̷ᛋ̴̵̷ᚱ̴̵̷ᛏ̴̵̷ᚦ̴̵̷᚜ • V̴̵̷O̸̷I̴̵̷D̸̷ • S̴̵̷A̸̷C̴̵̷R̴̵̷I̸̷F̴̵̷I̸̷C̴̵̷I̸̷U̴̵̷M̸̷ • M̴̵̷O̸̷R̴̵̷T̸̷I̸̷S̴̵̷ • S̴̵̷A̸̷N̴̵̷G̸̷U̴̵̷I̸̷S̴̵̷ • ᚛ᛟ̴̵̷ᛋ̴̵̷ᚱ̴̵̷ᛏ̴̵̷ᚦ̴̵̷᚜ • V̴̵̷O̸̷I̴̵̷D̸̷ •
                              </textPath>
                            </text>

                            {/* Centermost Pupil & Living Eyeball (Tracks Mouse) */}
                            <TalismanEye isTalismanPricked={isTalismanPricked} />
                          </svg>
                        </button>

                      <pre
                        style={{ fontFamily: '"ArtMono", "DejaVu Sans Mono", monospace', letterSpacing: '0px' }}
                        className={`text-[5px] leading-[4.5px] whitespace-pre select-none pointer-events-none origin-top mt-1.5 transition-all duration-200 text-center ${
                          isTalismanPricked
                            ? 'scale-[0.38] text-red-400 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.95)]'
                            : phase === 'PLAY'
                              ? 'scale-[0.46] text-[#a3907c] group-hover:text-red-400 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]'
                              : 'scale-[0.46] text-stone-700'
                        }`}
                      >
                        {isTalismanPricked ? (
` ▄████████  ▄██████▄    ▄▄▄▄███▄▄▄▄     ▄▄▄▄███▄▄▄▄    ▄█     ███         ███        ▄████████ ████████▄  
███    ███ ███    ███ ▄██▀▀▀███▀▀▀██▄ ▄██▀▀▀███▀▀▀██▄ ███  ▀█████████▄ ▀█████████▄  ███    ███ ███   ▀███ 
███    █▀  ███    ███ ███   ███   ███ ███   ███   ███ ███▌   ▀███▀▀██    ▀███▀▀██   ███    █▀  ███    ███ 
███        ███    ███ ███   ███   ███ ███   ███   ███ ███▌    ███   ▀     ███   ▀  ▄███▄▄▄     ███    ███ 
███        ███    ███ ███   ███   ███ ███   ███   ███ ███▌    ███         ███     ▀▀███▀▀▀     ███    ███ 
███    █▄  ███    ███ ███   ███   ███ ███   ███   ███ ███     ███         ███       ███    █▄  ███    ███ 
███    ███ ███    ███ ███   ███   ███ ███   ███   ███ ███     ███         ███       ███    ███ ███   ▄███ 
████████▀   ▀██████▀   ▀█   ███   █▀   ▀█   ███   █▀  █▀    ▄████▀      ▄████▀      ██████████ ████████▀  `
                        ) : (
` ▄████████  ▄██████▄    ▄▄▄▄███▄▄▄▄     ▄▄▄▄███▄▄▄▄    ▄█     ███     
 ███    ███ ███    ███ ▄██▀▀▀███▀▀▀██▄ ▄██▀▀▀███▀▀▀██▄ ███  ▀█████████▄ 
███    █▀  ███    ███ ███   ███   ███ ███   ███   ███ ███▌   ▀███▀▀██ 
███        ███    ███ ███   ███   ███ ███   ███   ███ ███▌    ███   ▀ 
███        ███    ███ ███   ███   ███ ███   ███   ███ ███▌    ███     
███    █▄  ███    ███ ███   ███   ███ ███   ███   ███ ███     ███     
███    ███ ███    ███ ███   ███   ███ ███   ███   ███ ███     ███     
████████▀   ▀██████▀   ▀█   ███   █▀   ▀█   ███   █▀  █▀    ▄████▀    `
                        )}
                      </pre>
                    </div>

                  {/* Carved-Stone Utility Plaques (Lowered & Offset Left) */}
                  <div className="flex flex-col items-center gap-1.5 w-full mt-2 sm:mt-2.5 -translate-x-6 sm:-translate-x-8">
                    <button
                      onClick={openViewDeck}
                      className="relative w-38 sm:w-40 bg-[#100e10]/92 hover:bg-[#19161a] active:bg-[#0b0a0c] border border-[#4a413b]/80 hover:border-[#b59c7c]/85 rounded-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] transition-all duration-100 font-['Cinzel',_serif] font-bold text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#d6c2a5] hover:text-[#f6ead8] cursor-pointer px-3 py-1.5 flex items-center justify-center gap-2"
                    >
                      <span className="pointer-events-none absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#8f7960]/65" />
                      <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#8f7960]/65" />
                      <Layers className="w-3.5 h-3.5 text-[#c79b56]/90" />
                      <span>VIEW DECK</span>
                    </button>

                    <button
                      onClick={() => setShowPauseMenu(true)}
                      className="relative w-38 sm:w-40 bg-[#100e10]/92 hover:bg-[#19161a] active:bg-[#0b0a0c] border border-[#4a413b]/80 hover:border-[#b59c7c]/85 rounded-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] transition-all duration-100 font-['Cinzel',_serif] font-bold text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#d6c2a5] hover:text-[#f6ead8] cursor-pointer px-3 py-1.5 flex items-center justify-center gap-2"
                    >
                      <span className="pointer-events-none absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#8f7960]/65" />
                      <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#8f7960]/65" />
                      <Menu className="w-3.5 h-3.5 text-[#c79b56]/90" />
                      <span>SANCTUARY</span>
                    </button>

                    {showDevTools && (
                        <button
                          onClick={openDevMenu}
                          className="relative w-38 sm:w-40 bg-[#100e10]/92 hover:bg-[#19161a] active:bg-[#0b0a0c] border border-[#4a413b]/80 hover:border-[#b59c7c]/85 rounded-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] transition-all duration-100 font-['Cinzel',_serif] font-bold text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#d6c2a5] hover:text-[#f6ead8] cursor-pointer px-3 py-1.5 flex items-center justify-center gap-2"
                          title="Development Tools"
                        >
                          <span className="pointer-events-none absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#8f7960]/65" />
                          <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#8f7960]/65" />
                          <span>DEV TOOLS</span>
                        </button>
                      )}
                  </div>
                </div>

              </div> {/* Closes FIXED LEFT FLANK */}

              {/* FIXED-WIDTH CENTER BATTLEFIELD: Absolute dead-center in the arena */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-[500px] sm:w-[512px] max-w-full z-10 origin-top scale-[0.96]">
                  <div className={`w-full flex flex-col items-center justify-start ${isHeavyRecoil ? 'animate-heavy-recoil' : isBoardRumbling ? 'animate-board-rumble' : ''} ${isHitStop ? 'hitstop-freeze' : ''}`}>
                      {/* Opponent Field: Massive Boss 8-Zone Monolith OR Standard Rows 1 & 2 */}
                    {(() => {
                      const massiveBoss = enemyBoard.find(c => c?.isMassive);
                      if (massiveBoss) {
                        const isAttacking = activeAttacker?.isPlayer === false;
                        const isDamaged = damagedCard?.isPlayer === false;
                        const isHpFlashing = hpFlashingCard?.isPlayer === false;
                        const isDefending = activeDefendingLane?.isPlayer === false;
                        const isDestroyed = destroyedCard?.isPlayer === false;
                        const isSigilJitter = jitteringCard?.isPlayer === false;
                        const isZeroPower = zeroPowerShakingCard?.isPlayer === false;

                        let bossAnimClass = '';
                        if (isBloodMoonDropping) {
                          bossAnimClass = 'anim-blood-moon-drop z-50';
                        } else if (isAttacking) {
                          // Massive monolith always slams straight forward, ignoring lane strike angles
                          bossAnimClass = 'animate-lunge-e-straight z-50';
                        } else if (isZeroPower) {
                          bossAnimClass = 'animate-zero-power-shake z-45';
                        } else if (isDestroyed) {
                          bossAnimClass = 'animate-destroy-dissolve z-40';
                        } else if (isDamaged) {
                          bossAnimClass = 'animate-damage-shake z-45';
                        } else if (isSigilJitter) {
                          bossAnimClass = 'animate-sigil-jitter z-45';
                        }

                        const defBorder = isDefending && !isDamaged ? 'ring-2 ring-red-600/70 shadow-[0_0_20px_rgba(239,68,68,0.7)]' : '';

                        return (
                          <div className="relative w-full max-w-[420px] sm:max-w-[500px] h-[300px] sm:h-[332px] my-1 flex items-center justify-center overflow-visible select-none z-20">
                            <div
                              className={`relative w-full h-full rounded-sm overflow-hidden bg-cover bg-center shadow-[0_0_35px_rgba(185,28,28,0.35)] ${
                                isEnemyRetracting
                                  ? 'transition-all duration-700 ease-in-out -translate-y-28 opacity-0 pointer-events-none'
                                  : `${bossAnimClass}${defBorder}`
                              }`}
                              style={{
                                backgroundImage: `url(${BASE}/assets/cardbases/blood_moon.webp)`,
                                backgroundSize: '100% 100%',
                              }}
                            >
                              {/* Pulsing Crimson Atmospheric Aura */}
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.18)_0%,transparent_75%)] animate-pulse pointer-events-none" />

                              {/* 5 Sigil Icons Centered Between Sockets Under Card Art */}
                              <div
                                className="absolute flex items-center justify-between z-20 pointer-events-auto"
                                style={{
                                  left: '25%',
                                  width: '50%',
                                  top: '81.0%',
                                  transform: 'translateY(-50%)',
                                }}
                              >
                                {massiveBoss.sigils?.map((sigilName, sIdx) => {
                                  const artUrl = typeof getSigilArtUrl === 'function' ? getSigilArtUrl(sigilName) : undefined;
                                  return (
                                    <div
                                      key={`moon-sigil-${sIdx}`}
                                      onClick={() => {
                                        if (typeof setSigilDetailModal === 'function') {
                                          const desc = (SIGIL_DESCRIPTIONS as Record<string, string>)[sigilName] || '';
                                          setSigilDetailModal({ name: sigilName, desc });
                                        }
                                      }}
                                      title={sigilName}
                                      className="w-1/5 flex items-center justify-center cursor-pointer transition-transform hover:scale-125 active:scale-95 select-none"
                                    >
                                      {artUrl ? (
                                        <img
                                          src={artUrl}
                                          alt={sigilName}
                                          className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter contrast-125 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_0_8px_rgba(0,0,0,0.85)]"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <span className="text-sm">👁️</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Attack Number Centered in Left Stone Socket */}
                              <div
                                className="absolute pointer-events-none z-20 flex items-center justify-center select-none w-16 h-16"
                                style={{
                                  left: '17.6%',
                                  top: '81.6%',
                                  transform: 'translate(-50%, -50%)',
                                }}
                              >
                                <span className="font-['Cinzel',_serif] font-black text-2xl sm:text-3xl text-[#ebd9bf] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                                  {massiveBoss.attack}
                                </span>
                              </div>

                              {/* Health Number Centered in Right Stone Socket */}
                              <div
                                className="absolute pointer-events-none z-20 flex items-center justify-center select-none w-16 h-16"
                                style={{
                                  left: '82.2%',
                                  top: '81.6%',
                                  transform: 'translate(-50%, -50%)',
                                }}
                              >
                                <span
                                  className={`font-['Cinzel',_serif] font-black text-2xl sm:text-3xl leading-none transition-colors duration-150 ${
                                    isHpFlashing
                                      ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)]'
                                      : 'text-red-500 drop-shadow-[0_2px_6px_rgba(220,38,38,0.95)]'
                                  }`}
                                >
                                  {massiveBoss.health}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const hideBossCards = isBossMatch && Boolean(bossState.activeDialogue);

                      return (
                        <>
                          {/* Row 1: Opponent Queue Row */}
                           <div className={`relative flex justify-center items-center gap-2 sm:gap-4 my-1 w-full overflow-visible ${droppingQueueLane !== null ? 'z-40' : ''}`}>
                             {enemyQueue.map((rawCard, idx) => {
                               const card = hideBossCards ? null : rawCard;
                               const isDropping = droppingQueueLane === idx;
                               return (
                                 <div
                                   key={`e-queue-slot-${idx}`}
                                    className={`w-24 sm:w-28 h-36 sm:h-40 shrink-0 rounded-[2px] flex items-center justify-center relative box-border border border-black/70 bg-[#0b0a0c]/48 shadow-[inset_0_2px_12px_rgba(0,0,0,0.85)] overflow-visible ${isDropping ? 'z-40' : card ? 'z-20' : 'z-0'}`}
                                  >
                                    <div
                                      className="pointer-events-none absolute inset-0 rounded-[2px] opacity-[0.22] brightness-[0.55]"
                                      style={{
                                        backgroundImage: `url("${import.meta.env.BASE_URL || './'}assets/text/mapbg.jpg")`,
                                        backgroundSize: '260px 260px',
                                        backgroundPosition: `${idx * 73 + 12}px ${idx * 41 + 18}px`,
                                      }}
                                    />
                                    <div className="pointer-events-none absolute inset-[4px] rounded-[1px] border border-[#7f1d1d]/65 shadow-[0_0_6px_rgba(127,29,29,0.22)]" />
                                    {(!card || isDropping) && (
                                      <svg
                                        className={`w-7 h-7 sm:w-8 sm:h-8 pointer-events-none select-none transition-colors duration-500 ${
                                          battleWonAction
                                            ? battleWonIsBoss
                                              ? 'text-[#f3cf7a] animate-pulse drop-shadow-[0_0_12px_rgba(234,179,8,0.95)]'
                                              : 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.95)]'
                                            : 'text-[#c4a47c]/80 drop-shadow-[0_3px_5px_rgba(0,0,0,0.95)]'
                                        }`}
                                        style={{ transform: battleWonAction ? 'scaleY(-1)' : 'scaleY(1)', transition: 'transform 0.6s ease-in-out, color 0.5s' }}
                                        viewBox="0 0 24 28"
                                        fill="none"
                                      >
                                        <polygon points="12,1.5 14.2,4 12,6.5 9.8,4" fill="currentColor" opacity="0.85" />
                                        <path d="M12 6.5 L12 21.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                                        <path d="M5.5 15.5 L12 25.5 L18.5 15.5 L12 18.8 Z" fill="currentColor" />
                                      </svg>
                                    )}

                                   {card && (
                                     <div
                                       className={`w-full h-full flex items-center justify-center transition-all duration-300 ease-out ${
                                         card.isDying
                                           ? 'opacity-0 scale-75 pointer-events-none'
                                           : isEnemyRetracting
                                           ? 'transition-all duration-700 ease-in-out -translate-y-28 opacity-0 pointer-events-none'
                                           : isDropping
                                             ? 'transition-transform duration-300 ease-in-out translate-y-[calc(100%+8px)] z-40 opacity-100 pointer-events-none'
                                             : 'animate-queue-slide-in opacity-90'
                                       }`}
                                     >
                                       {renderCard(card, {
                                         isOpponent: true,
                                         isQueue: true,
                                         laneIndex: idx,
                                         disableHoverScale: true,
                                       })}
                                     </div>
                                   )}
                                 </div>
                               );
                             })}
                           </div>

                           {/* Row 2: Opponent Active Board Slots */}
                           <div className="relative flex justify-center items-center gap-2 sm:gap-4 mt-1 mb-0 w-full overflow-visible">
                             {enemyBoard.map((rawCard, idx) => {
                                 const card = hideBossCards ? null : rawCard;
                                 const isAttackingThisLane = activeAttacker?.isPlayer === false && activeAttacker?.lane === idx;
                                 const isDamagedThisLane = damagedCard?.isPlayer === false && damagedCard?.lane === idx;
                                 const isDestroyedThisLane = destroyedCard?.isPlayer === false && destroyedCard?.lane === idx;
                                 const isIncineratingThisLane = incineratingLane === idx;
                                 const isHpFlashingThisLane = hpFlashingCard?.isPlayer === false && hpFlashingCard?.lane === idx;
                                 const isSigilJitterThisLane = jitteringCard?.isPlayer === false && jitteringCard?.lane === idx;
                                 const isDefendingThisLane = activeDefendingLane?.isPlayer === false && activeDefendingLane?.lane === idx;
                                 const isZeroPowerThisLane = zeroPowerShakingCard?.isPlayer === false && zeroPowerShakingCard?.lane === idx;
                                 return (
                                   <div
                                     key={`e-slot-${idx}`}
                                     onClick={() => {
                                       if (itemTargetMode) {
                                         handleItemTargetLane(idx);
                                       }
                                     }}
                                     className={`w-24 sm:w-28 h-36 sm:h-40 shrink-0 rounded-[2px] flex items-center justify-center relative box-border border border-black/75 bg-[#0d0c0e]/52 shadow-[inset_0_2px_14px_rgba(0,0,0,0.86)] overflow-visible ${
                                       isAttackingThisLane ? 'z-50' : card ? 'z-20' : 'z-0'
                                     } ${
                                       itemTargetMode && card
                                         ? 'ring-2 ring-red-500/80 animate-pulse cursor-crosshair scale-[1.02]'
                                         : ''
                                     }`}
                                   >
                                     <div
                                       className="pointer-events-none absolute inset-0 rounded-[2px] opacity-[0.26] brightness-[0.55]"
                                       style={{
                                         backgroundImage: `url("${import.meta.env.BASE_URL || './'}assets/text/mapbg.jpg")`,
                                         backgroundSize: '260px 260px',
                                         backgroundPosition: `${idx * 89 + 115}px ${idx * 53 + 94}px`,
                                       }}
                                     />
                                     <div className="pointer-events-none absolute inset-[4px] rounded-[1px] border border-[#991b1b]/75 shadow-[0_0_8px_rgba(153,27,27,0.26)]" />
                                     {/* Large Matchbook True Incinerate & Ash Rig */}
                                     {isIncineratingThisLane && (
                                       <div className="absolute inset-0 z-50 pointer-events-none overflow-visible flex items-center justify-center">
                                         {/* Core Thermal Radiance */}
                                         <div className="absolute -inset-4 bg-radial from-orange-500/80 via-red-600/40 to-transparent blur-md pointer-events-none" />

                                         {/* Leaping Outer Flame Front (Licking above the card frame) */}
                                         <div className="absolute -top-10 inset-x-0 bottom-0 pointer-events-none flex justify-center items-end overflow-visible">
                                           <div 
                                             className="w-14 h-32 bg-gradient-to-t from-red-600 via-orange-500 to-amber-200 blur-[2px] rounded-t-full opacity-90 anim-flame-a"
                                             style={{ clipPath: 'polygon(50% 0%, 85% 35%, 100% 70%, 80% 100%, 20% 100%, 0% 70%, 15% 35%)' }}
                                           />
                                           <div 
                                             className="absolute w-10 h-28 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 blur-[1px] rounded-t-full opacity-95 anim-flame-b"
                                             style={{ clipPath: 'polygon(50% 0%, 90% 40%, 100% 80%, 75% 100%, 25% 100%, 0% 80%, 10% 40%)' }}
                                           />
                                           <div className="absolute w-6 h-16 bg-white blur-[1px] rounded-t-full opacity-95 anim-flame-a bottom-2" />
                                         </div>

                                         {/* Burning Base Hearth Line */}
                                         <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-red-600 via-orange-500 to-transparent opacity-90 blur-[1px]" />

                                         {/* Drifting Embers */}
                                         <div className="absolute inset-0 pointer-events-none overflow-visible">
                                           <span 
                                             className="absolute left-3 bottom-4 w-1.5 h-1.5 rounded-full bg-amber-100 shadow-[0_0_8px_#ff5500]"
                                             style={{ animation: 'emberDrift1 0.75s ease-out infinite' }}
                                           />
                                           <span 
                                             className="absolute right-4 bottom-6 w-1 h-1 rounded-full bg-yellow-200 shadow-[0_0_6px_#ff3300]"
                                             style={{ animation: 'emberDrift2 0.85s ease-out 0.1s infinite' }}
                                           />
                                           <span 
                                             className="absolute left-8 bottom-2 w-2 h-2 rounded-full bg-orange-200 shadow-[0_0_10px_#ff8800]"
                                             style={{ animation: 'emberDrift3 0.65s ease-out 0.2s infinite' }}
                                           />
                                           <span 
                                             className="absolute right-8 bottom-3 w-1.5 h-1 rounded-full bg-red-400 shadow-[0_0_6px_#ff1100]"
                                             style={{ animation: 'emberDrift4 0.9s ease-out 0.15s infinite' }}
                                           />
                                         </div>
                                       </div>
                                     )}

                                     {(!card || isAttackingThisLane) && (
                                       <span className="absolute text-[10px] font-mono text-amber-900/30 select-none pointer-events-none">
                                         •
                                       </span>
                                     )}
                                    {card ? (
                                      <div
                                        className={`w-full h-full flex items-center justify-center transition-all duration-300 ease-out ${
                                          isIncineratingThisLane
                                            ? 'anim-card-char pointer-events-none'
                                            : card.isDying || isDestroyedThisLane
                                           ? 'opacity-0 scale-75 pointer-events-none'
                                           : isEnemyRetracting
                                           ? 'transition-all duration-700 ease-in-out -translate-y-28 opacity-0 pointer-events-none'
                                           : ''
                                       }`}
                                     >
                                       {renderCard(card, {
                                         isOpponent: true,
                                         laneIndex: idx,
                                         disableHoverScale: true,
                                         isAttacking: isAttackingThisLane,
                                         attackDirection: isAttackingThisLane ? activeAttacker?.direction : undefined,
                                         isAirborneAttack: isAttackingThisLane ? activeAttacker?.isAirborne : undefined,
                                         isDirectAttack: isAttackingThisLane ? activeAttacker?.isDirect : undefined,
                                         isDamaged: isDamagedThisLane,
                                         isDestroyed: isDestroyedThisLane,
                                         isHpFlashing: isHpFlashingThisLane,
                                         isSigilJittering: isSigilJitterThisLane,
                                         isDefending: isDefendingThisLane,
                                         isZeroPowerShaking: isZeroPowerThisLane,
                                       })}
                                     </div>
                                   ) : null}
                                      {sigilBadges
                                        .filter(b => b.isPlayer === false && b.lane === idx)
                                        .map((b, bIdx) => (
                                          <div
                                            key={b.id}
                                            style={{ top: `${6 - bIdx * 18}px` }}
                                            className={`pointer-events-none absolute left-1/2 z-[60] px-2 py-0.5 rounded-[2px] border font-mono font-bold text-[9px] uppercase tracking-[0.16em] whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.92)] animate-sigil-badge ${
                                              b.tone === 'bone'
                                                ? 'bg-[#1c1813]/95 border-[#cbb794]/90 text-[#f3e6cf]'
                                                : b.tone === 'blood'
                                                  ? 'bg-[#2a0909]/95 border-red-400/90 text-red-100'
                                                  : b.tone === 'emerald'
                                                    ? 'bg-[#092116]/95 border-emerald-400/90 text-emerald-100'
                                                    : b.tone === 'violet'
                                                      ? 'bg-[#1b0f26]/95 border-purple-400/90 text-purple-100'
                                                      : 'bg-[#211608]/95 border-[#e5c16b]/90 text-[#f7dfa0]'
                                            }`}
                                          >
                                            {b.text}
                                          </div>
                                        ))}
                                 </div>
                               );
                             })}
                             {battleWonAction && (
                               battleWonIsBoss ? (
                                 <button
                                   onClick={battleWonAction}
                                   className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-full max-w-xl z-[60] py-4 px-8 flex flex-col items-center justify-center gap-1 border-y border-[#d4af37]/85 bg-[linear-gradient(90deg,transparent_0%,rgba(16,4,5,0.92)_18%,rgba(44,8,10,0.95)_50%,rgba(16,4,5,0.92)_82%,transparent_100%)] shadow-[0_0_55px_rgba(185,28,28,0.65)] hover:border-[#fde68a] cursor-pointer select-none group transition-all"
                                 >
                                   <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.38em] text-[#f3cf7a] drop-shadow-[0_0_10px_rgba(234,179,8,0.75)]">
                                     ✦ {bossState.type === 'Zealot' ? 'The Zealot' : bossState.type} Felled ✦
                                   </span>
                                   <span
                                     className="font-['Cinzel',_serif] font-black text-3xl sm:text-4xl uppercase tracking-[0.32em] text-red-400 group-hover:text-[#fff3ce] animate-pulse transition-colors"
                                     style={{ textShadow: '0 0 26px rgba(239,68,68,0.95), 0 0 10px rgba(212,175,55,0.55), 0 2px 6px rgba(0,0,0,1)' }}
                                   >
                                     CLAIM SPOILS
                                   </span>
                                 </button>
                               ) : (
                                 <button
                                   onClick={battleWonAction}
                                   className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-fit z-[60] px-10 py-3 font-['Cinzel',_serif] font-black text-3xl sm:text-4xl uppercase tracking-[0.3em] text-red-500 hover:text-red-300 bg-black/55 border-y border-red-700/70 animate-pulse cursor-pointer select-none"
                                   style={{ textShadow: '0 0 22px rgba(239,68,68,0.95), 0 0 6px rgba(0,0,0,1)' }}
                                 >
                                   CONTINUE
                                 </button>
                               )
                             )}
                           </div>
                         </>
                       );
                     })()}

                 {/* Row 3: Player Active Board Slots */}
                  {(() => {
                    const activeSelectedCard = phase === 'PLAY' && selectedHandIndex !== null ? hand[selectedHandIndex] : null;
                    const reqBlood = activeSelectedCard?.cost || 0;
                    const reqBones = activeSelectedCard?.boneCost || 0;
                    const needsSacrifice = Boolean(activeSelectedCard && reqBlood > 0 && blood < reqBlood);
                    const readyToPlace = Boolean(activeSelectedCard && blood >= reqBlood && bones >= reqBones);
                    const isCardSacrificable = (c: typeof playerBoard[number]) => {
                      if (!c) return false;
                      const isWorthyToken = (c.name === 'Chime' || c.name === 'Dam') && c.sigils.includes('Worthy Sacrifice');
                      if (c.unsacrificable && !isWorthyToken) return false;
                      const key = c.id || c.name || '';
                      if (key && sacrificedUnkillableCardIds.includes(key)) return false;
                      return true;
                    };
                    const availableBoardBlood = needsSacrifice
                      ? playerBoard.reduce((sum, c) => sum + (isCardSacrificable(c) ? (c!.sigils.includes('Worthy Sacrifice') ? 3 : 1) : 0), 0)
                      : 0;
                    const shortOnBlood = needsSacrifice && blood + availableBoardBlood < reqBlood;

                    const showPlacePrompt = readyToPlace && !hasCompletedFirstRun && duelsCompleted === 0;
                    const showSelectionBanner = Boolean(
                      activeSelectedCard && (needsSacrifice || showPlacePrompt || !readyToPlace)
                    );

                    return (
                      <div className="relative w-full my-1 overflow-visible z-30">
                        {showSelectionBanner && activeSelectedCard && (
                          <div
                            className={`absolute -top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] border backdrop-blur-sm shadow-[0_4px_14px_rgba(0,0,0,0.75)] whitespace-nowrap font-mono text-[10px] tracking-[0.14em] uppercase ${
                              needsSacrifice
                                ? 'bg-[#1b0808]/95 border-red-500/70'
                                : showPlacePrompt
                                ? 'bg-[#1a1309]/95 border-amber-400/70'
                                : 'bg-[#14100d]/95 border-[#8c6747]/60'
                            }`}
                          >
                            {needsSacrifice ? (
                              <div className={`flex items-center gap-2 ${shortOnBlood ? 'text-red-300/80' : 'text-red-200'}`}>
                                <span className="flex items-center gap-1">
                                  {Array.from({ length: reqBlood }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={`inline-block w-2 h-2 rounded-full border ${
                                        i < blood
                                          ? 'bg-red-500 border-red-300 shadow-[0_0_6px_rgba(239,68,68,0.9)]'
                                          : 'bg-transparent border-red-400/70'
                                      }`}
                                    />
                                  ))}
                                </span>
                                <span>
                                  {shortOnBlood
                                    ? `Need ${reqBlood} Blood (Only ${blood + availableBoardBlood} Available)`
                                    : `Sacrifice ${blood}/${reqBlood} Blood — Click Creatures`}
                                </span>
                              </div>
                            ) : showPlacePrompt ? (
                              <span className="text-amber-200">
                                Place {activeSelectedCard.name} in an Open Lane
                              </span>
                            ) : (
                              <span className="text-[#cfb794]">
                                Needs {reqBones} Bones ({bones}/{reqBones})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Gothic Ritual-Cloth Battle Seam */}
                        <div className="pointer-events-none flex items-center justify-center gap-3 w-[94%] mx-auto my-0 -translate-y-[3px] select-none">
                          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#7a2420]/55 to-[#9c7a4c]/60" />
                          <span className="w-1.5 h-1.5 rotate-45 bg-[#2a0d0d] border border-[#9c7a4c]/75 shadow-[0_0_6px_rgba(122,36,32,0.65)]" />
                          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#7a2420]/55 to-[#9c7a4c]/60" />
                        </div>

                        <div className="flex justify-center items-center gap-2 sm:gap-4 w-full overflow-visible relative">
                          {playerBoard.map((card, idx) => {
                            const canSacrificeThis = Boolean(needsSacrifice && isCardSacrificable(card) && sacrificingLane === null);
                            const canPlaceHere = Boolean(readyToPlace && !card && sacrificingLane === null);
                            const isDimmedTarget = Boolean(
                              (needsSacrifice && !canSacrificeThis && sacrificingLane !== idx) ||
                              (readyToPlace && Boolean(card))
                            );
                            const isAttackingThisLane = activeAttacker?.isPlayer === true && activeAttacker?.lane === idx;
                            const isDamagedThisLane = damagedCard?.isPlayer === true && damagedCard?.lane === idx;
                            const isDestroyedThisLane = destroyedCard?.isPlayer === true && destroyedCard?.lane === idx;
                            const isHpFlashingThisLane = hpFlashingCard?.isPlayer === true && hpFlashingCard?.lane === idx;
                            const isSigilJitterThisLane = jitteringCard?.isPlayer === true && jitteringCard?.lane === idx;
                            const isDefendingThisLane = activeDefendingLane?.isPlayer === true && activeDefendingLane?.lane === idx;
                            const isZeroPowerThisLane = zeroPowerShakingCard?.isPlayer === true && zeroPowerShakingCard?.lane === idx;

                            const slotStyle = canSacrificeThis
                              ? 'border-red-500/85 bg-red-950/35 hover:bg-red-900/45 hover:border-red-300 shadow-[inset_0_2px_12px_rgba(0,0,0,0.75),0_0_16px_rgba(220,38,38,0.42)] cursor-pointer'
                              : canPlaceHere
                              ? 'border-amber-400/80 bg-amber-950/25 hover:bg-amber-900/35 hover:border-amber-200 shadow-[inset_0_2px_12px_rgba(0,0,0,0.75),0_0_14px_rgba(217,119,6,0.34)] cursor-pointer'
                              : isDimmedTarget
                              ? 'border-[#5e564f]/20 bg-[#0b0a0c]/30 opacity-45 cursor-not-allowed'
                              : 'border-black/75 hover:border-[#7f1d1d]/80 bg-[#0d0c0e]/58 hover:bg-[#1a0b0c]/72 shadow-[inset_0_2px_14px_rgba(0,0,0,0.88)] cursor-pointer';

                            return (
                              <div
                                key={`p-slot-${idx}`}
                                onClick={() => handlePlayerSlotClick(idx)}
                                className={`w-24 sm:w-28 h-36 sm:h-40 shrink-0 rounded-[2px] flex items-center justify-center relative box-border border transition-all duration-150 overflow-visible ${slotStyle} ${
                                  isAttackingThisLane ? 'z-50' : card ? 'z-20' : 'z-0'
                                }`}
                              >
                                <div
                                  className="pointer-events-none absolute inset-0 rounded-[2px] opacity-[0.26] brightness-[0.55]"
                                  style={{
                                    backgroundImage: `url("${import.meta.env.BASE_URL || './'}assets/text/mapbg.jpg")`,
                                    backgroundSize: '260px 260px',
                                    backgroundPosition: `${idx * 67 + 190}px ${idx * 59 + 170}px`,
                                  }}
                                />
                                <div className="pointer-events-none absolute inset-[4px] rounded-[1px] border border-[#991b1b]/75 shadow-[0_0_8px_rgba(153,27,27,0.26)]" />
                                <span className="pointer-events-none absolute top-1 left-1 w-2 h-2 border-t border-l border-[#b91c1c]/65" />
                                <span className="pointer-events-none absolute top-1 right-1 w-2 h-2 border-t border-r border-[#b91c1c]/65" />
                                <span className="pointer-events-none absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#b91c1c]/65" />
                                <span className="pointer-events-none absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#b91c1c]/65" />
                                {(!card || isAttackingThisLane) && (
                                  <span
                                    className={`absolute font-mono select-none pointer-events-none transition-colors ${
                                      canPlaceHere
                                        ? 'text-[10px] text-amber-300/90 tracking-[0.18em] animate-pulse font-bold'
                                        : 'text-[11px] text-amber-900/40 tracking-widest'
                                    }`}
                                  >
                                    {canPlaceHere ? 'PLACE' : '+'}
                                  </span>
                                )}
                                {card ? (
                                  renderCard(card, {
                                    laneIndex: idx,
                                    isSacrificing: sacrificingLane === idx,
                                    isClickable: !isDimmedTarget,
                                    disableHoverScale: true,
                                    isAttacking: isAttackingThisLane,
                                    attackDirection: isAttackingThisLane ? activeAttacker?.direction : undefined,
                                    isAirborneAttack: isAttackingThisLane ? activeAttacker?.isAirborne : undefined,
                                    isDirectAttack: isAttackingThisLane ? activeAttacker?.isDirect : undefined,
                                    isDamaged: isDamagedThisLane,
                                    isDestroyed: isDestroyedThisLane,
                                    isHpFlashing: isHpFlashingThisLane,
                                    isSigilJittering: isSigilJitterThisLane,
                                    isDefending: isDefendingThisLane,
                                    isZeroPowerShaking: isZeroPowerThisLane,
                                  })
                                ) : null}
                                {canSacrificeThis && card && (
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-1.5 py-0.5 rounded-[2px] bg-[#240606]/95 border border-red-400/80 text-red-100 font-mono text-[8px] sm:text-[9px] tracking-[0.14em] uppercase whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                                    {card.sigils.includes('Worthy Sacrifice') ? '† +3 BLOOD' : '† SACRIFICE'}
                                  </div>
                                )}
                                      {sigilBadges
                                        .filter(b => b.isPlayer === true && b.lane === idx)
                                        .map((b, bIdx) => (
                                          <div
                                            key={b.id}
                                            style={{ top: `${6 - bIdx * 18}px` }}
                                            className={`pointer-events-none absolute left-1/2 z-[60] px-2 py-0.5 rounded-[2px] border font-mono font-bold text-[9px] uppercase tracking-[0.16em] whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.92)] animate-sigil-badge ${
                                              b.tone === 'bone'
                                                ? 'bg-[#1c1813]/95 border-[#cbb794]/90 text-[#f3e6cf]'
                                                : b.tone === 'blood'
                                                  ? 'bg-[#2a0909]/95 border-red-400/90 text-red-100'
                                                  : b.tone === 'emerald'
                                                    ? 'bg-[#092116]/95 border-emerald-400/90 text-emerald-100'
                                                    : b.tone === 'violet'
                                                      ? 'bg-[#1b0f26]/95 border-purple-400/90 text-purple-100'
                                                      : 'bg-[#211608]/95 border-[#e5c16b]/90 text-[#f7dfa0]'
                                            }`}
                                          >
                                            {b.text}
                                          </div>
                                        ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                      {/* Row 4: Player Hand */}
                <div
                  className="relative w-full flex items-center justify-center min-h-[148px] sm:min-h-[164px] mt-3 sm:mt-4 pb-1.5 sm:pb-2 px-1 overflow-visible z-30 origin-bottom scale-[1.02] sm:scale-[1.05]"
                >
                  {hand.map((card, idx) => {
                          // Loosened overlap ladder so cards fan out legibly without choking the art
                          let overlapStyle: React.CSSProperties = {};
                          if (idx > 0) {
                            if (hand.length <= 2) {
                              overlapStyle = { marginLeft: '-10px' };
                            } else if (hand.length === 3) {
                              overlapStyle = { marginLeft: '-16px' };
                            } else if (hand.length === 4) {
                              overlapStyle = { marginLeft: '-24px' };
                            } else if (hand.length === 5) {
                              overlapStyle = { marginLeft: '-32px' };
                            } else if (hand.length === 6) {
                              overlapStyle = { marginLeft: '-42px' };
                            } else if (hand.length === 7) {
                              overlapStyle = { marginLeft: '-52px' };
                            } else {
                              overlapStyle = { marginLeft: '-60px' };
                            }
                          }
                          const isSelected = selectedHandIndex === idx;

                          // Physical hand arc: outer cards dip and tilt outward from the palm
                          const mid = (hand.length - 1) / 2;
                          const offsetFromCenter = hand.length > 1 ? idx - mid : 0;
                          const fanAngle = Math.max(-11, Math.min(11, offsetFromCenter * 2.8));
                          const fanDipY = Math.min(18, Math.pow(Math.abs(offsetFromCenter), 1.65) * 2.4);

                          return (
                            /* Stationary Slot Container: captures mouse events & maintains layout geometry */
                            <div
                              key={card.id || `hand-${card.name}-${idx}`}
                              onClick={() => selectHandCard(idx)}
                              style={{
                                ...overlapStyle,
                                transform: `translateY(${fanDipY}px) rotate(${fanAngle}deg)`,
                                transformOrigin: '50% 120%',
                                transition: 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
                                ...(isCinematic
                                  ? { transformStyle: 'preserve-3d' }
                                  : { backfaceVisibility: 'hidden' }),
                              }}
                              className={`group/handcard relative shrink-0 cursor-pointer select-none hover:!rotate-0 hover:!translate-y-0 before:absolute before:-inset-x-3 before:-top-1 before:-bottom-6 before:z-0 before:content-[''] ${
                                 isSelected ? 'z-40 !rotate-0 !translate-y-0' : 'hover:z-30 z-10'
                               }`}
                             >
                               {/* Animated Card Surface: Decoupled from hit target with dampened spring physics */}
                               <div
                                 style={{
                                   transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms cubic-bezier(0.22, 1, 0.36, 1), z-index 0ms',
                                   transitionDelay: '30ms',
                                   animationDelay: `${idx * 40}ms`,
                                   ...(isCinematic
                                     ? { transformStyle: 'preserve-3d' }
                                     : { backfaceVisibility: 'hidden', transform: 'translateZ(0)' }),
                                 }}
                                 className={`relative origin-top animate-card-draw group-hover/handcard:transition-delay-[0ms] ${
                                   isSelected
                                     ? 'z-40 -translate-y-1 scale-[1.03]'
                                     : 'group-hover/handcard:z-30 group-hover/handcard:-translate-y-2 group-hover/handcard:scale-[1.04]'
                                 }`}
                               >
                          {renderCard(card, {
                            isSelected,
                            isClickable: phase === 'PLAY',
                            disableHoverScale: true,
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
                </div>

              {/* FIXED FLANK: Bleeding Stone Runnel & Blood Ampoule Rack + S & C Draw Decks directly beneath */}
<div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-3 w-auto select-none pointer-events-auto z-20">
  <div className="flex items-start justify-center gap-6 translate-x-2 sm:translate-x-3">
    {/* Floating OVERKILL text anchored above runnel without displacing layout */}
    {isOverkill && (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-mono font-black text-red-500 uppercase tracking-widest animate-bounce drop-shadow-[0_0_12px_rgba(239,68,68,1)] text-center leading-none whitespace-nowrap pointer-events-none z-30">
        OVERKILL
      </div>
    )}

    {/* 1. THE BLEEDING STONE RUNNEL (Carved Stone Housing) */}
    <div
    style={{
      isolation: 'isolate',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      boxShadow: isScaleHeavySlam || scaleRumble ? undefined : 'none',
    }}
    className={`w-14 h-[396px] bg-[#171412] border border-[#4a3e35]/85 rounded-sm relative flex flex-col items-center justify-between py-2.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,235,210,0.08),0_6px_16px_rgba(0,0,0,0.88)] select-none transition-all ${
      isScaleHeavySlam ? 'animate-scale-heavy-slam shadow-[0_0_28px_rgba(220,38,38,0.85)]' : scaleRumble ? 'animate-scale-rumble shadow-[0_0_20px_rgba(220,38,38,0.55)]' : ''
    }`}
    title={`Runnel Balance: ${scale === 0 ? '0 (Balanced)' : scale > 0 ? `+${scale}` : `${scale}`}`}
  >
    {/* runnelEdgeLayer: hand-chiselled, non-parallel outline behind all runnel contents */}
    <div aria-hidden="true" className="pointer-events-none absolute -inset-px -z-10" style={{ filter: 'drop-shadow(0 5px 7px rgba(0,0,0,0.85))' }}>
      <div
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(1.4px 1.6px, 8px 0.9px, 14px 0.6px, 21px 1.5px, 27px 1.9px, 34px 0.8px, 41px 0.5px, 48px 1.2px, 54.2px 1.3px, 52.7px 8px, 52.8px 16px, 53.2px 22px, 53.3px 26px, 53px 34px, 52.3px 41px, 53.9px 46px, 53.3px 55px, 50.8px 59px, 53px 66px, 52.4px 70px, 53.7px 73px, 53.5px 85px, 53.3px 89px, 53.2px 97px, 53.9px 104px, 54.1px 117px, 53.2px 120px, 53.7px 133px, 53.6px 137px, 53.6px 141px, 53.4px 147px, 53.5px 156px, 53.4px 161px, 53.9px 170px, 54.3px 174px, 53.4px 181px, 52.7px 189px, 53.3px 198px, 53.3px 208px, 52.8px 219px, 53.5px 227px, 53.4px 239px, 53.5px 250px, 51.5px 257px, 53.5px 264px, 54.3px 276px, 53.2px 286px, 53.5px 296px, 54.6px 306px, 52.2px 316px, 53.7px 327px, 51.5px 331px, 54.1px 336px, 52.1px 348px, 54.2px 351px, 53.6px 360px, 52.4px 366px, 54.5px 372px, 54px 374px, 53.5px 379px, 53.8px 394.7px, 49px 395.1px, 42px 395.5px, 35px 394.4px, 28px 394px, 20px 394.9px, 13px 395.2px, 7px 394.3px, 2px 394.5px, 3.2px 380px, 4.3px 375px, 3.3px 371px, 4.3px 367px, 3.9px 360px, 4.7px 352px, 4.2px 347px, 3px 337px, 3.5px 331px, 4px 327px, 3.9px 316px, 3.4px 307px, 4.8px 297px, 3.2px 287px, 2.9px 276px, 3.8px 265px, 3.9px 258px, 3.3px 249px, 2.5px 238px, 3.7px 227px, 2.6px 219px, 2.1px 208px, 2.9px 197px, 2.3px 189px, 2.7px 180px, 1.9px 174px, 2.2px 169px, 2.3px 161px, 2.9px 156px, 1.8px 147px, 2.4px 142px, 2.1px 136px, 3px 132px, 2.4px 121px, 4.2px 116px, 1.2px 105px, 2.5px 98px, 1.4px 90px, 2.5px 84px, 2px 74px, 4.6px 69px, 1px 65px, 1.1px 59px, 1.7px 55px, 1.7px 46px, 2.2px 41px, 2.2px 35px, 1.6px 27px, 2px 23px, 3.6px 15px, 2px 7px)', /* runnelEdgeV2 */
          backgroundImage: `linear-gradient(180deg, rgba(36,30,26,0.48) 0%, rgba(18,15,14,0.78) 50%, rgba(10,8,8,0.9) 100%), url("${import.meta.env.BASE_URL || './'}assets/text/mapbg.jpg")`,
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,235,210,0.08)',
        }}
      />
      <svg viewBox="0 0 56 396" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
        <polygon points="1.4,1.6 8,0.9 14,0.6 21,1.5 27,1.9 34,0.8 41,0.5 48,1.2 54.2,1.3 52.7,8 52.8,16 53.2,22 53.3,26 53,34 52.3,41 53.9,46 53.3,55 50.8,59 53,66 52.4,70 53.7,73 53.5,85 53.3,89 53.2,97 53.9,104 54.1,117 53.2,120 53.7,133 53.6,137 53.6,141 53.4,147 53.5,156 53.4,161 53.9,170 54.3,174 53.4,181 52.7,189 53.3,198 53.3,208 52.8,219 53.5,227 53.4,239 53.5,250 51.5,257 53.5,264 54.3,276 53.2,286 53.5,296 54.6,306 52.2,316 53.7,327 51.5,331 54.1,336 52.1,348 54.2,351 53.6,360 52.4,366 54.5,372 54,374 53.5,379 53.8,394.7 49,395.1 42,395.5 35,394.4 28,394 20,394.9 13,395.2 7,394.3 2,394.5 3.2,380 4.3,375 3.3,371 4.3,367 3.9,360 4.7,352 4.2,347 3,337 3.5,331 4,327 3.9,316 3.4,307 4.8,297 3.2,287 2.9,276 3.8,265 3.9,258 3.3,249 2.5,238 3.7,227 2.6,219 2.1,208 2.9,197 2.3,189 2.7,180 1.9,174 2.2,169 2.3,161 2.9,156 1.8,147 2.4,142 2.1,136 3,132 2.4,121 4.2,116 1.2,105 2.5,98 1.4,90 2.5,84 2,74 4.6,69 1,65 1.1,59 1.7,55 1.7,46 2.2,41 2.2,35 1.6,27 2,23 3.6,15 2,7" fill="none" stroke="#4a3e35" strokeWidth="1.4" strokeLinejoin="miter" />
      </svg>
    </div>
    {/* Escalated Cycle Seal (+7 / +13) */}
    {getRequiredScaleWinDamage() > 5 && (
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-1.5 py-[1px] rounded-[2px] bg-[#1a0708] border border-[#d4af37]/85 shadow-[0_0_10px_rgba(212,175,55,0.45),0_2px_6px_rgba(0,0,0,0.95)] pointer-events-none"
        title={`Escalated Ritual: +${getRequiredScaleWinDamage()} required to tip the scales`}
      >
        <span className="font-mono text-[9px] font-bold tracking-wider text-[#f4d78b] leading-none block">
          +{getRequiredScaleWinDamage()}
        </span>
      </div>
    )}

    {/* Top Endpoint: Rusted Iron Drain Grate (+5 Opponent Defeat / Overkill Basin) */}
    <div
      className={`w-7 h-2.5 rounded-[1px] flex items-center justify-evenly px-0.5 shadow-inner transition-all duration-500 relative overflow-hidden ${
        isOverkill || scale >= getRequiredScaleWinDamage()
          ? 'bg-red-950 border border-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]'
          : 'bg-[#1c140e] border border-[#3d2a1c]'
      }`}
      title={`Opponent Defeat (+${getRequiredScaleWinDamage()})`}
    >
      {(isOverkill || scale >= getRequiredScaleWinDamage()) && (
        <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-red-800 to-red-950 opacity-95 animate-pulse shadow-[inset_0_0_6px_rgba(254,202,202,0.9)]" />
      )}
      <div className={`w-[1px] h-full z-10 transition-colors duration-300 ${isOverkill || scale >= getRequiredScaleWinDamage() ? 'bg-black/90' : 'bg-[#0a0807]'}`} />
      <div className={`w-[1px] h-full z-10 transition-colors duration-300 ${isOverkill || scale >= getRequiredScaleWinDamage() ? 'bg-black/90' : 'bg-[#0a0807]'}`} />
      <div className={`w-[1px] h-full z-10 transition-colors duration-300 ${isOverkill || scale >= getRequiredScaleWinDamage() ? 'bg-black/90' : 'bg-[#0a0807]'}`} />
      <div className={`w-[1px] h-full z-10 transition-colors duration-300 ${isOverkill || scale >= getRequiredScaleWinDamage() ? 'bg-black/90' : 'bg-[#0a0807]'}`} />
    </div>

    {/* Central Conduit Chamber: Slate Notches + Diegetic Glass Ampoule Column */}
    <div className="relative flex-1 w-full flex items-center justify-center my-1">
      {/* 11 Chiseled Tally Notches (-5 to +5) in the Slate Slab Behind the Glass */}
      <div className="absolute inset-y-0 w-full flex flex-col justify-between items-center pointer-events-none py-0.5 z-0">
        {Array.from({ length: getRequiredScaleWinDamage() + 6 }, (_, i) => getRequiredScaleWinDamage() - i).map((val) => {
          const isMidpoint = val === 0;
          const isCurrent = scale === val;

          return (
            <div
              key={`runnel-notch-${val}`}
              className="w-full relative flex items-center justify-center"
            >
              <div
                className={`transition-all duration-300 ${
                  isMidpoint
                    ? 'w-8 h-[2px] bg-[#4a3b30] shadow-[0_1px_1px_rgba(0,0,0,0.8)]'
                    : isCurrent
                      ? 'w-5 h-[1.5px] bg-[#78350f] shadow-[0_0_4px_rgba(245,158,11,0.5)]'
                      : 'w-4 h-[1px] bg-[#2a211a]'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Overkill Ambient Flood Channel (Fills Upper Headspace When Damaged Beyond +5) */}
      {(isOverkill || scale >= getRequiredScaleWinDamage()) && (
        <div className="absolute top-0 inset-x-2 h-14 bg-gradient-to-b from-red-600/30 via-red-950/20 to-transparent pointer-events-none animate-pulse z-0" />
      )}

      {/* THE GLASS AMPOULE (Integrated Cylindrical Specimen Tube) */}
      <div className="relative w-5 h-full flex flex-col items-center justify-between z-10">
        {/* Top Brass Ferrule Collar */}
        <div className="w-5 h-1.5 bg-gradient-to-b from-[#3a281c] to-[#1d140e] border border-[#523927] rounded-t-xs shadow-sm z-20" />

        {/* Glass Cylinder Body */}
          <div className="relative w-full flex-1 rounded-full bg-[#0a0505] border border-white/20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95),0_0_8px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col justify-end">
            

            {/* Glass Specular Glint (Continuous Curved Longitudinal Reflection) */}
            <div className="absolute top-0 bottom-0 left-[2px] w-[1.5px] bg-gradient-to-b from-white/40 via-white/10 to-white/20 rounded-full z-20 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-[2px] w-[1px] bg-white/10 rounded-full z-20 pointer-events-none" />

            {/* Organic Viscous Blood Column */}
      {(() => {
        const winTarget = getRequiredScaleWinDamage();
        const fillPercent = isOverkill || scale >= winTarget
          ? 100
          : Math.min(100, Math.max(0, ((scale + 5) / (winTarget + 5)) * 100));

        return (
          <div
            className={`absolute bottom-0 inset-x-0 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              scaleRumble || isOverkill
                ? 'animate-pulse filter brightness-110'
                : ''
            }`}
            style={{
              height: `${fillPercent}%`,
              background: 'linear-gradient(to top, #0f0102 0%, #290206 20%, #4d050a 45%, #7a0c14 70%, #991320 90%, #b91c1c 100%)',
              boxShadow: isOverkill || scale >= getRequiredScaleWinDamage()
                ? '0 0 24px rgba(220, 38, 38, 0.95), inset 0 0 8px rgba(254, 202, 202, 0.5)'
                : '0 0 12px rgba(153, 19, 32, 0.8), inset 0 0 4px rgba(254, 202, 202, 0.3)',
            }}
          >
            {/* Rising Arterial Micro-Bubbles */}
            {fillPercent > 8 && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute bottom-1 left-[20%] w-[3px] h-[3px] rounded-full bg-rose-200/40 border border-white/60 will-change-transform"
                  style={{ animation: 'bloodBubbleAscendA 3.2s ease-in infinite' }}
                />
                <div
                  className="absolute bottom-1 left-[62%] w-[2px] h-[2px] rounded-full bg-rose-200/40 border border-white/50 will-change-transform"
                  style={{ animation: 'bloodBubbleAscendB 4.1s ease-in infinite 1.2s' }}
                />
                <div
                  className="absolute bottom-1 left-[38%] w-[2.5px] h-[2.5px] rounded-full bg-rose-200/40 border border-white/60 will-change-transform"
                  style={{ animation: 'bloodBubbleAscendC 2.7s ease-in infinite 0.6s' }}
                />
              </div>
            )}

            {/* Flowing Wavy Surface Meniscus */}
            {fillPercent > 0 && (
              <div className="absolute -top-[3.5px] left-0 right-0 h-[7px] overflow-hidden pointer-events-none z-10">
                <svg
                  viewBox="0 0 64 8"
                  className="w-[200%] h-full will-change-transform"
                  style={{ animation: 'bloodWaveScroll 2.2s linear infinite' }}
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 4 Q 8 0.5, 16 4 T 32 4 T 48 4 T 64 4 L 64 8 L 0 8 Z"
                    fill="#991b1b"
                  />
                  <path
                    d="M 0 4 Q 8 0.5, 16 4 T 32 4 T 48 4 T 64 4"
                    fill="none"
                    stroke="#fecdd3"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    
                  />
                </svg>
                </div>
              )}

              {/* Overkill Arterial Surge */}
              {(isOverkill || scale >= getRequiredScaleWinDamage()) && (
                <div className="absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-red-400/80 via-red-600/40 to-transparent animate-ping opacity-90 pointer-events-none" />
              )}
            </div>
          );
        })()}

          {/* Arterial Limit Ampoule State: Pre-scored until breached, then fractured for the rest of the battle */}
            {isAmpouleCracked ? (
              /* Broken Ampoule Glass at +4 Pressure (Persists until duel ends) */
              <div
                className="absolute top-[10%] -translate-y-1/2 -left-1 -right-1 h-8 pointer-events-none z-30 select-none overflow-visible"
                title="Arterial Limit Breached: Ampoule shattered at +4 to vent lethal pressure"
              >
                <svg viewBox="0 0 24 32" className="w-full h-full overflow-visible drop-shadow-[0_0_6px_rgba(239,68,68,0.95)]">
                  {/* Jagged glass fracture line */}
                  <path d="M 1 16 L 7 12 L 12 18 L 18 11 L 23 15" fill="none" stroke="#fecaca" strokeWidth="1.2" strokeLinecap="round" />
                  {/* Radiating hairline cracks */}
                  <path d="M 7 12 L 6 6 L 10 2" fill="none" stroke="#fca5a5" strokeWidth="0.8" opacity="0.85" />
                  <path d="M 12 18 L 11 26 L 16 30" fill="none" stroke="#fca5a5" strokeWidth="0.8" opacity="0.85" />
                  <path d="M 7 12 L 13 10 L 17 5" fill="none" stroke="#ef4444" strokeWidth="0.8" />
                  {/* Flaked glass chip */}
                  <polygon points="13,14 16,11 15,16" fill="#ffffff" opacity="0.9" />
                </svg>

                {/* Bleeding exterior drip running down the ampoule face */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-14 bg-gradient-to-b from-red-500 via-red-800 to-transparent rounded-full shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />

                {/* Arterial vent spark */}
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shadow-[0_0_8px_rgba(239,68,68,1)]" />
              </div>
            ) : (
              /* Pre-Scored Fragile Diamond Score Line on Intact Glass at +4 */
              <div
                className="absolute top-[10%] -translate-y-1/2 inset-x-0 h-[1.5px] z-25 pointer-events-none"
                title="Hydraulic Limit (+4): Glass pre-scored to fracture under lethal first-turn pressure"
              >
                <div className="w-full h-full border-t border-dashed border-red-400/40 shadow-[0_0_3px_rgba(239,68,68,0.3)]" />
                </div>
              )}
          </div>

        {/* Bottom Brass Ferrule Collar */}
        <div className="w-5 h-1.5 bg-gradient-to-b from-[#1d140e] to-[#3a281c] border border-[#523927] rounded-b-xs shadow-sm z-20" />
      </div>
    </div>

    {/* Bottom Endpoint: Rusted Iron Drain Grate (-5 Player Defeat) */}
    <div
      className="w-7 h-2.5 bg-[#1c140e] border border-[#3d2a1c] rounded-[1px] flex items-center justify-evenly px-0.5 shadow-inner"
      title="Player Defeat (-5)"
    >
      <div className="w-[1px] h-full bg-[#0a0807]" />
      <div className="w-[1px] h-full bg-[#0a0807]" />
      <div className="w-[1px] h-full bg-[#0a0807]" />
      <div className="w-[1px] h-full bg-[#0a0807]" />
    </div>
  </div>

  {/* 2. TURN (ROMAN) & RELICS BANNER + BLOOD/BONES COLUMN (Right of Runnel) */}
  <div className="flex flex-col items-center gap-2 w-[84px] sm:w-[90px]">
    <DuelTelemetryBanner
      turnNumber={turnNumber}
      isTurnOneDanger={turnNumber === 1 && scale >= 4}
      items={items.map((id) => (id && ALL_ITEMS[id] ? ALL_ITEMS[id] : null))}
      phase={phase}
      itemTargetSourceSlot={itemTargetSourceSlot}
      onUseItem={handleUseItem}
    />
    {(() => {
      const displayBloodOz = totalOverkillDamage || 0;
      return (
        <div className="flex flex-col items-center mt-7">
          <BloodBankVessel displayBloodOz={displayBloodOz} isOverkill={isOverkill} tier={jarTier} />
        </div>
      );
    })()}
  </div>
  </div> {/* End Runnel + Banner Column Row */}

  {/* Lower Flank: Centered Bones Counter directly above lowered S & C Decks */}
  <div className="flex flex-col items-center gap-2.5 w-full relative mt-3 sm:mt-4 translate-y-4 sm:translate-y-5 translate-x-2.5 sm:translate-x-3.5">
    <div className="w-[74px] sm:w-[80px]">
      <BoneOssuaryPlaque bones={bones} boneShaking={boneShaking} />
    </div>
    <div className="flex items-center justify-center gap-4 w-full relative font-mono translate-y-3 sm:translate-y-4">
                  {/* Squirrel Deck */}
                  <div className="group flex flex-col items-center gap-1.5">
                    <div className="relative">
                      <img
                        src={`${BASE}/assets/cardbases/cardbacks.png`}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none select-none absolute inset-0 w-full h-full object-fill rounded translate-x-[4px] translate-y-[4px] brightness-[0.38] border border-black/80"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <img
                        src={`${BASE}/assets/cardbases/cardbacks.png`}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none select-none absolute inset-0 w-full h-full object-fill rounded translate-x-[2px] translate-y-[2px] brightness-[0.62] border border-black/70"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    <button
                      disabled={phase !== 'DRAW'}
                      onClick={() => handleDraw('sacrifice')}
                      className={`w-[84px] h-[119px] sm:w-[88px] sm:h-[125px] rounded flex items-center justify-center border-2 transition-all select-none relative overflow-hidden bg-[#140e0a] ${
                        phase === 'DRAW'
                          ? 'cursor-pointer hover:scale-105 active:scale-95 animate-deck-glow z-20'
                          : 'border-[#3d2719] opacity-75 cursor-not-allowed shadow-[2px_2px_0_#1c140e,4px_4px_0_#140e0a,6px_6px_8px_rgba(0,0,0,0.8)]'
                      }`}
                      title={flockNoSquirrelTurns && flockSquirrelLockDraws > 0 ? `Sealed by The Zealot's Flock (${flockSquirrelLockDraws} turn${flockSquirrelLockDraws === 1 ? '' : 's'} left)` : 'Draw Squirrel'}
                    >
                      {/* Card Back Graphic */}
                      <img
                        src={`${BASE}/assets/cardbases/cardbacks.png`}
                        alt="Squirrel Deck"
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
                        style={{ imageRendering: 'pixelated' }}
                      />

                      {/* Dead-Center Large Red Glyphed S */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <img
                          src={`${BASE}/assets/cardbases/S.png`}
                          alt="S"
                          className="deck-glyph-red h-14 sm:h-16 w-auto object-contain pointer-events-none select-none"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    </button>
                    </div>

                  </div>

                  {/* Creature Deck */}
                  {deck.length > 0 && (
                  <div className="group flex flex-col items-center gap-1.5">
                    <div className="relative">
                      {deck.length >= 4 && (
                        <img
                          src={`${BASE}/assets/cardbases/cardbacks.png`}
                          alt=""
                          aria-hidden="true"
                          className="pointer-events-none select-none absolute inset-0 w-full h-full object-fill rounded translate-x-[4px] translate-y-[4px] brightness-[0.38] border border-black/80"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                      {deck.length >= 2 && (
                        <img
                          src={`${BASE}/assets/cardbases/cardbacks.png`}
                          alt=""
                          aria-hidden="true"
                          className="pointer-events-none select-none absolute inset-0 w-full h-full object-fill rounded translate-x-[2px] translate-y-[2px] brightness-[0.62] border border-black/70"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                    <button
                      disabled={phase !== 'DRAW'}
                      onClick={() => handleDraw('main')}
                      className={`w-[84px] h-[119px] sm:w-[88px] sm:h-[125px] rounded flex items-center justify-center border-2 transition-all select-none relative overflow-hidden bg-[#140e0a] ${
                        phase === 'DRAW'
                          ? 'cursor-pointer hover:scale-105 active:scale-95 animate-deck-glow z-20'
                          : 'border-[#3d2719] opacity-75 cursor-not-allowed shadow-[2px_2px_0_#1c140e,4px_4px_0_#140e0a,6px_6px_8px_rgba(0,0,0,0.8)]'
                      }`}
                      title="Draw Creature from Deck"
                    >
                      {/* Card Back Graphic */}
                      <img
                        src={`${BASE}/assets/cardbases/cardbacks.png`}
                        alt="Creature Deck"
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
                        style={{ imageRendering: 'pixelated' }}
                      />

                      {/* Dead-Center Large Red Glyphed C */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <img
                          src={`${BASE}/assets/cardbases/C.png`}
                          alt="C"
                          className="deck-glyph-red h-14 sm:h-16 w-auto object-contain pointer-events-none select-none"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    </button>
                    </div>

                  </div>
                  )}
                </div>

    </div> {/* End Lower Bones + Decks Wrapper */}
</div> {/* End FIXED FLANK wrapper */}
            </div>
          </div>    
        </div>
      )}
      </div>

      {/* Loaded Die Deck Choice Modal */}
      {dieModal && (
        <div className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-4 backdrop-blur-xs font-mono select-none">
          <div className="max-w-xs w-full bg-[#120c09] border border-[#5a3822] p-5 text-center shadow-2xl rounded-sm">
            <div className="text-4xl mb-2">🎲 {dieModal.roll}</div>
            <div className="text-amber-200 font-bold text-sm tracking-widest uppercase mb-1">Loaded Die Cast</div>
            <p className="text-xs text-neutral-400 mb-4">
              Choose which deck yields {dieModal.count} {dieModal.count === 1 ? 'card' : 'cards'}:
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  const count = dieModal.count;
                  const drawnSquirrels: CardDef[] = [];
                  for (let i = 0; i < count; i++) {
                    const card = applyPlayerTotem(cloneCard(TOKEN_SQUIRREL, ouroborosBuffs), activeTotem);
                    if (isAcornActive) {
                      card.attack = (card.attack || 0) + 1;
                      card.health = (card.health || 0) + 1;
                    }
                    drawnSquirrels.push(card);
                  }
                  setHand(prev => [...prev, ...drawnSquirrels]);
                  triggerSfx('draw');
                  addLog(`Loaded Die drew ${count} ${count === 1 ? 'Squirrel' : 'Squirrels'}.`);
                  setDieModal(null);
                }}
                className="px-3.5 py-2 bg-[#221610] hover:bg-[#342218] border border-[#5a3822] text-amber-200 text-xs font-bold uppercase rounded-sm cursor-pointer transition-colors"
              >
                Squirrels ({dieModal.count})
              </button>

              <button
                onClick={() => {
                  const count = dieModal.count;
                  const remainingDeck = [...deck];
                  const drawnCards: CardDef[] = [];

                  for (let i = 0; i < count; i++) {
                    if (remainingDeck.length > 0) {
                      const drawn = remainingDeck.pop()!;
                      drawnCards.push(transformAmorphous(applyPlayerTotem(drawn, activeTotem)));
                    } else {
                      const pity = applyPlayerTotem(cloneCard(TOKEN_SQUIRREL, ouroborosBuffs), activeTotem);
                      if (isAcornActive) {
                        pity.attack = (pity.attack || 0) + 1;
                        pity.health = (pity.health || 0) + 1;
                      }
                      drawnCards.push(pity);
                      addLog("Your deck is empty! A Squirrel answers the Loaded Die.");
                    }
                  }

                  setDeck(remainingDeck);
                  setHand(prev => [...prev, ...drawnCards]);
                  triggerSfx('draw');
                  addLog(`Loaded Die drew: ${drawnCards.map(c => c.name).join(', ')}.`);
                  setDieModal(null);
                }}
                className="px-3.5 py-2 bg-[#221610] hover:bg-[#342218] border border-[#5a3822] text-amber-200 text-xs font-bold uppercase rounded-sm cursor-pointer transition-colors"
              >
                Creatures ({dieModal.count})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SIGIL DETAIL MODAL
         ========================================================================= */}
      {sigilDetailModal && (
        <div className="fixed inset-0 bg-black/85 z-[110] flex items-center justify-center p-4 backdrop-blur-sm font-mono select-none">
          <div className="border border-amber-950/60 p-6 bg-[#0c0805] max-w-sm w-full text-center">
            <div className="text-4xl mb-3 filter sepia-[0.8]">{SIGIL_MAPPING[sigilDetailModal.name] || '⭐'}</div>
            <div className="text-[10px] text-amber-700/80 tracking-widest uppercase mb-1">Crest Description</div>
            <h3 className="text-base font-mono font-bold text-amber-200 uppercase tracking-widest mb-2">{sigilDetailModal.name}</h3>
            <p className="text-xs text-stone-300/80 leading-relaxed mb-6 font-mono border-t border-amber-950/40 pt-3">{sigilDetailModal.desc}</p>
            <button
              onClick={() => setSigilDetailModal(null)}
              className="mt-4 px-6 py-2 bg-[#181310] hover:bg-[#231b16] active:bg-[#120e0b] border border-[#2f241c] rounded-sm shadow-[0_2px_0_#0a0807,inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-[1px] active:shadow-none transition-all duration-75 font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-widest text-[#cfb794] hover:text-[#f3ede2] cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL MODAL ALERT
         ========================================================================= */}
      {modalAlert && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/55 backdrop-blur-[3px] pointer-events-auto select-none animate-fade-up">
          <div
            className={`relative w-[92%] max-w-md rounded-[3px] border px-6 py-6 sm:px-7 sm:py-7 flex flex-col items-center text-center font-mono overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,228,185,0.14),inset_0_0_32px_rgba(0,0,0,0.72)] ${
              modalAlert.isWin ? 'border-[#6e4f2c]/90' : 'border-red-900/90'
            }`}
            style={{
              background: modalAlert.isWin
                ? 'radial-gradient(ellipse at 50% 0%, rgba(180,126,56,0.22) 0%, rgba(18,12,8,0.96) 56%, rgba(10,7,5,0.98) 100%)'
                : 'radial-gradient(ellipse at 50% 0%, rgba(165,34,28,0.24) 0%, rgba(18,9,8,0.96) 56%, rgba(10,5,5,0.98) 100%)',
            }}
          >
            {/* Inner Double-Rule Hairline Frame */}
            <div
              className={`pointer-events-none absolute inset-2 border rounded-[2px] ${
                modalAlert.isWin ? 'border-[#8a6539]/30' : 'border-red-800/30'
              }`}
            />
            {/* Engraved Brass / Crimson Corner Brackets */}
            <span className={`pointer-events-none absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 ${modalAlert.isWin ? 'border-[#cfa159]/85' : 'border-red-500/80'}`} />
            <span className={`pointer-events-none absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 ${modalAlert.isWin ? 'border-[#cfa159]/85' : 'border-red-500/80'}`} />
            <span className={`pointer-events-none absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 ${modalAlert.isWin ? 'border-[#cfa159]/85' : 'border-red-500/80'}`} />
            <span className={`pointer-events-none absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 ${modalAlert.isWin ? 'border-[#cfa159]/85' : 'border-red-500/80'}`} />

            {/* Top Crest Eyebrow */}
            <div
              className={`relative z-10 text-[9.5px] font-['Cinzel',_serif] font-bold uppercase tracking-[0.28em] mb-1.5 ${
                modalAlert.isWin ? 'text-[#c99b56]/90' : 'text-red-400/85'
              }`}
            >
              {modalAlert.isWin ? '◆ Thy Cup Runneth Over ◆' : '◆ I Hope This Hurts ◆'}
            </div>

            {/* Engraved Title */}
            <h2
              className={`relative z-10 text-xl sm:text-2xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.18em] leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] ${
                modalAlert.isWin ? 'text-[#f6e2bc]' : 'text-red-300'
              }`}
            >
              {modalAlert.title}
            </h2>

            {/* Ornate Divider */}
            <div className="relative z-10 flex items-center justify-center gap-2.5 w-full my-3.5">
              <span
                className={`h-px flex-1 max-w-[90px] bg-gradient-to-r from-transparent ${
                  modalAlert.isWin ? 'to-[#a67c42]/80' : 'to-red-700/80'
                }`}
              />
              <span className={`text-[9px] ${modalAlert.isWin ? 'text-[#d4af37]' : 'text-red-400'}`}>❖</span>
              <span
                className={`h-px flex-1 max-w-[90px] bg-gradient-to-l from-transparent ${
                  modalAlert.isWin ? 'to-[#a67c42]/80' : 'to-red-700/80'
                }`}
              />
            </div>

            {/* Body Copy */}
            <p className="relative z-10 text-xs sm:text-[13px] font-mono text-[#dfd0b6]/92 mb-6 leading-relaxed px-2">
              {modalAlert.message}
            </p>

            {/* Tactile Engraved Action Button */}
            <button
              onClick={modalAlert.onAction}
              className={`relative z-10 px-7 py-2.5 rounded-[2px] border font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.24em] shadow-[0_4px_14px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,235,200,0.12)] active:translate-y-[1px] transition-all duration-150 cursor-pointer ${
                modalAlert.isWin
                  ? 'bg-gradient-to-b from-[#2e2014] to-[#17100a] hover:from-[#3d2a19] hover:to-[#20160d] border-[#b88d4f]/85 hover:border-[#f0cf88] text-[#f4dfb7] hover:text-white'
                  : 'bg-gradient-to-b from-[#361210] to-[#1a0807] hover:from-[#471815] hover:to-[#240b0a] border-red-700/85 hover:border-red-400 text-red-100 hover:text-white'
              }`}
            >
              {modalAlert.btnText}
            </button>
          </div>
        </div>
      )}

        {/* Global Glitch / VHS Screen-Tear Overlay */}
        {isTutorialGlitching && (
          <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden select-none">
            <style>{`
              @keyframes vhsJitter {
                0% { transform: translate(0, 0) skewX(0deg); filter: contrast(110%) brightness(100%); }
                10% { transform: translate(-10px, 4px) skewX(-3deg); filter: contrast(260%) brightness(150%) invert(30%); }
                20% { transform: translate(12px, -4px) skewX(4deg); filter: hue-rotate(90deg) contrast(300%); }
                30% { transform: translate(-16px, 2px) skewX(-5deg); filter: invert(90%); }
                40% { transform: translate(14px, -6px) skewX(2deg); filter: contrast(200%) saturate(300%); }
                50% { transform: translate(-8px, 9px) skewX(4deg); filter: invert(100%) brightness(220%); }
                60% { transform: translate(18px, -2px) skewX(-3deg); filter: hue-rotate(240deg) contrast(220%); }
                70% { transform: translate(-12px, -6px) skewX(5deg); filter: contrast(300%) invert(40%); }
                80% { transform: translate(9px, 7px) skewX(-2deg); filter: contrast(160%) brightness(70%); }
                90% { transform: translate(-5px, -3px) skewX(3deg); filter: invert(85%); }
                100% { transform: translate(0, 0) skewX(0deg); filter: contrast(110%) brightness(100%); }
              }
              @keyframes sliceTear1 {
                0%, 100% { clip-path: inset(0 0 0 0); transform: translateX(0); }
                15% { clip-path: inset(14% 0 62% 0); transform: translateX(-45px); }
                35% { clip-path: inset(48% 0 32% 0); transform: translateX(55px); }
                55% { clip-path: inset(72% 0 8% 0); transform: translateX(-60px); }
                75% { clip-path: inset(22% 0 52% 0); transform: translateX(40px); }
                90% { clip-path: inset(86% 0 2% 0); transform: translateX(-25px); }
              }
              @keyframes sliceTear2 {
                0%, 100% { clip-path: inset(0 0 0 0); transform: translateX(0); }
                10% { clip-path: inset(28% 0 46% 0); transform: translateX(50px); }
                30% { clip-path: inset(6% 0 78% 0); transform: translateX(-48px); }
                60% { clip-path: inset(58% 0 18% 0); transform: translateX(65px); }
                80% { clip-path: inset(82% 0 4% 0); transform: translateX(-38px); }
              }
              @keyframes scanlineDrift {
                0% { background-position: 0 0; }
                100% { background-position: 0 100%; }
              }
              @keyframes noisePulse {
                0%, 100% { opacity: 0.3; }
                25% { opacity: 0.9; }
                50% { opacity: 0.15; }
                75% { opacity: 0.95; }
              }
            `}</style>

            {/* Violent screen warp & high-contrast negative flicker */}
            <div
              className="absolute inset-0 backdrop-invert backdrop-contrast-200"
              style={{ animation: 'vhsJitter 0.14s infinite steps(2)' }}
            />

            {/* CRT Horizontal Scanlines */}
            <div
              className="absolute inset-0 mix-blend-hard-light pointer-events-none opacity-50"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.85) 2px, transparent 2px, transparent 4px)',
                backgroundSize: '100% 4px',
                animation: 'scanlineDrift 0.18s linear infinite',
              }}
            />

            {/* Cyan Channel Displaced Slice */}
            <div
              className="absolute inset-0 bg-cyan-400/25 mix-blend-color-dodge backdrop-blur-[1px]"
              style={{ animation: 'sliceTear1 0.16s infinite steps(1)' }}
            />

            {/* Crimson Negative Displaced Slice */}
            <div
              className="absolute inset-0 bg-red-600/35 mix-blend-difference"
              style={{ animation: 'sliceTear2 0.13s infinite steps(1)' }}
            />

            {/* Vertical CRT Phosphor Bar Jitter */}
            <div
              className="absolute inset-0 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0px, transparent 3px, rgba(0,0,0,0.35) 6px)',
                animation: 'noisePulse 0.07s infinite',
              }}
            />
          </div>
        )}
      </div>
    {/* Dramatic Loss Transition Overlay */}
    {isLossSequenceActive && (
      <div className="fixed inset-0 z-[220] pointer-events-auto flex flex-col items-center justify-center overflow-hidden select-none animate-menu-fade-in">
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(circle at center, rgba(127, 29, 29, 0.38) 0%, rgba(18, 4, 6, 0.92) 62%, rgba(0, 0, 0, 0.98) 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <img
            src={`${import.meta.env.BASE_URL || './'}assets/text/gameover.png`}
            alt="Game Over"
            className="w-72 sm:w-96 max-w-[82vw] object-contain drop-shadow-[0_0_28px_rgba(220,38,38,0.65)] animate-pulse"
            draggable={false}
          />
          <div className="mt-3 text-xs font-mono uppercase tracking-[0.35em] text-red-300/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            The Sacred Threads Drag you into the Abyss
          </div>
        </div>
      </div>
    )}

    {/* Mobile Orientation Blocker */}
      <div className="fixed inset-0 z-[9999] bg-[#04060a] flex flex-col items-center justify-center text-amber-100 p-6 text-center portrait:flex landscape:hidden select-none pointer-events-auto">
        <div className="text-4xl mb-4 font-mono animate-pulse">⤹ 📱</div>
        <p className="font-serif text-sm tracking-[0.2em] uppercase text-stone-300 mb-2">
          Ritual Requires Landscape
        </p>
        <p className="font-mono text-[10px] tracking-widest uppercase text-stone-500">
          Rotate your device to begin your ritual
        </p>
      </div>

    </div>
  );
}