import React from 'react';
import { ChiptuneAudio , playSound } from '../audio/ChiptuneAudio';
import { RitualReliquaryShell } from './BattleFlankUI';

export interface SplashScreenProps {
  discordGif: any;
  clearRunSave: any;
  discordError: any;
  discordInput: any;
  getScreenBgStyle: any;
  handleAttemptUnlock: any;
  handleContinueRun: any;
  handleDiscordClick: any;
  isRitualReady: any;
  ritualReadyProgress: any;
  savedRunExists: any;
  setArchiveModalTab: any;
  setAudioEnabled: any;
  setDiscordError: any;
  setDiscordInput: any;
  setScreen: any;
  setShowContinueModal: any;
  setShowDiscordPrompt: any;
  showContinueModal: any;
  showDiscordPrompt: any;
  unlockedDiscordUrl: any;
}

export default function SplashScreen({
  discordGif,
  clearRunSave,
  discordError,
  discordInput,
  getScreenBgStyle,
  handleAttemptUnlock,
  handleContinueRun,
  handleDiscordClick,
  isRitualReady,
  ritualReadyProgress,
  savedRunExists,
  setArchiveModalTab,
  setAudioEnabled,
  setDiscordError,
  setDiscordInput,
  setScreen,
  setShowContinueModal,
  setShowDiscordPrompt,
  showContinueModal,
  showDiscordPrompt,
  unlockedDiscordUrl
}: SplashScreenProps) {
  const [introPhase, setIntroPhase] = React.useState<'pentagram' | 'title' | 'menu'>('pentagram');
  const [pentagramReady, setPentagramReady] = React.useState(false);
  React.useEffect(() => {
    const img = new Image();
    (img as any).fetchPriority = 'high';
    const done = () => setPentagramReady(true);
    img.onload = () => { (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(done); };
    img.onerror = done;
    img.src = `${import.meta.env.BASE_URL}assets/text/pentagram.png`;
  }, []);

  React.useEffect(() => {
    if (!pentagramReady) return;
    const t = window.setTimeout(() => {
      setIntroPhase(prev => (prev === 'pentagram' ? 'title' : prev));
    }, 1000);
    return () => window.clearTimeout(t);
  }, [pentagramReady]);

  React.useEffect(() => {
    if (!showContinueModal) return;
    const handleModalKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        setShowContinueModal(false);
      }
    };
    window.addEventListener('keydown', handleModalKey);
    return () => window.removeEventListener('keydown', handleModalKey);
  }, [showContinueModal]);

  return (
    <>
        <style>{`
          @keyframes splashPentagramSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .splash-pentagram-spin { animation: splashPentagramSpin 120s linear infinite; will-change: transform; }
        @keyframes splashPentagramGlowIn {
            0% { opacity: 0; transform: scale(0.9); filter: drop-shadow(0 0 0px rgba(220,38,38,0)); }
            65% { opacity: 1; transform: scale(1.02); filter: drop-shadow(0 0 26px rgba(220,38,38,0.65)); }
            100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 14px rgba(185,28,28,0.4)); }
          }
          @keyframes splashAltarTitleIn {
            0% {
              opacity: 0;
              transform: translateY(18px) scale(1.04);
              filter: brightness(2.6) contrast(1.4) blur(6px) drop-shadow(0 0 28px rgba(239,68,68,0.95));
            }
            45% {
              opacity: 1;
              transform: translateY(-2px) scale(0.995);
              filter: brightness(1.65) contrast(1.2) blur(1px) drop-shadow(0 0 22px rgba(239,68,68,0.8));
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: brightness(1) contrast(1) blur(0px) drop-shadow(0 0 10px rgba(239,68,68,0.35));
            }
          }
          @keyframes splashMenuRise {
            0% { opacity: 0; transform: translateY(18px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div 
          onClick={() => {
            if (introPhase === 'title' && !showDiscordPrompt && !showContinueModal) {
              setIntroPhase('menu');
            }
          }}
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden select-none ${introPhase === 'title' ? 'cursor-pointer' : ''}`}
          style={getScreenBgStyle('splash.jpg')}
        >
          {/* Blood-Red Tabletop Vignette & Subtle CRT Scanlines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(14,4,4,0.85)_70%,rgba(0,0,0,0.98)_100%)] pointer-events-none z-10" />
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)',
            }}
          />
          {/* Eerie Candle/Ritual Backlight Glow (radial-gradient avoids expensive 100px blur filter) */}
          <div
            className="absolute w-[640px] h-[420px] rounded-full pointer-events-none z-10 animate-candle-breath"
            style={{
              background: 'radial-gradient(circle, rgba(127, 29, 29, 0.28) 0%, rgba(127, 29, 29, 0.08) 45%, transparent 72%)',
              willChange: 'transform, opacity',
            }}
          />
          
          {/* Splash Ambient Atmosphere: Drifting Ritual Mist & Slow-Rising Embers */}
          <div className="pointer-events-none absolute inset-0 z-[12] overflow-hidden">
            <div
              className="absolute -inset-x-[15%] bottom-[-14%] h-[56%]"
              style={{
                background:
                  'radial-gradient(ellipse at 32% 82%, rgba(153,27,27,0.28) 0%, rgba(90,18,18,0.14) 48%, transparent 76%)',
                filter: 'blur(30px)',
                animation: 'weatherMistDriftA 24s ease-in-out infinite',
              }}
            />
            <div
              className="absolute -inset-x-[15%] bottom-[-10%] h-[46%]"
              style={{
                background:
                  'radial-gradient(ellipse at 70% 85%, rgba(120,45,32,0.22) 0%, rgba(60,20,16,0.1) 50%, transparent 76%)',
                filter: 'blur(34px)',
                animation: 'weatherMistDriftB 31s ease-in-out infinite',
              }}
            />
            {Array.from({ length: 18 }, (_, i) => {
              const leftPct = (i * 37.9 + 5) % 94;
              const sizePx = 1.8 + (i % 3) * 1.1;
              const duration = (5.4 + ((i * 11) % 8) * 0.55).toFixed(2);
              const delay = -(((i * 0.83) % 7.2).toFixed(2));
              const drift = (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 10);
              return (
                <span
                  key={`splash-ember-${i}`}
                  className="absolute -bottom-3 rounded-full"
                  style={{
                    left: `${leftPct}%`,
                    width: `${sizePx}px`,
                    height: `${sizePx}px`,
                    backgroundColor: i % 3 === 0 ? '#fca5a5' : i % 2 === 0 ? '#f97316' : '#dc2626',
                    boxShadow: '0 0 8px rgba(239,68,68,0.75), 0 0 14px rgba(185,28,28,0.45)',
                    ['--ember-drift' as any]: `${drift}px`,
                    animation: `weatherEmberRise ${duration}s ease-out ${delay}s infinite`,
                  }}
                />
              );
            })}
          </div>

          {/* Centered Glowing Stylized SVG Pentagram with Esoteric Runes */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={pentagramReady ? { animation: 'splashPentagramGlowIn 0.95s ease-out forwards' } : { opacity: 0 }}
          >
            <div
              className="w-[420px] h-[420px] sm:w-[500px] sm:h-[500px] md:w-[560px] md:h-[560px] splash-pentagram-spin"
              style={{ willChange: 'transform' }}
            >
              <img src={`${import.meta.env.BASE_URL}assets/text/pentagram.png`} alt="" draggable={false} fetchPriority="high" className="w-full h-full object-contain select-none pointer-events-none" style={{ mixBlendMode: 'screen', opacity: 0.28 }} />
            </div>
          </div>

          {!pentagramReady && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none select-none px-4">
              <div className="flex flex-col items-center gap-2.5 bg-[#0b090a]/75 border border-[#3a2a1e]/80 px-6 py-3.5 rounded-[2px] shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#d6c2a5]/90 animate-pulse">
                  Kindling Altar... {typeof ritualReadyProgress === 'number' ? `${ritualReadyProgress}%` : ''}
                </div>
                <div className="w-48 h-1 bg-[#1b1412] border border-[#3a2a1e]/70 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-[#7f1d1d] via-[#dc2626] to-[#f4d78b] transition-all duration-300"
                    style={{ width: `${Math.max(8, Number(ritualReadyProgress) || 0)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-4xl w-full mx-auto my-auto">
  
  {/* Direct, Frame-less High-Fidelity ASCII Title Display */}
  <div
    className={`flex flex-col items-center justify-center w-full px-2 overflow-visible transition-transform duration-700 ease-out ${
      introPhase === 'pentagram'
        ? 'opacity-0 pointer-events-none'
        : introPhase === 'title'
          ? 'translate-y-0'
          : '-translate-y-2 sm:-translate-y-4'
    }`}
    style={
      introPhase !== 'pentagram'
        ? { animation: 'splashAltarTitleIn 0.85s ease-out forwards', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 45%, transparent 72%)' }
        : undefined
    }
  >
  {/* THREAD */}
  <pre 
    style={{ 
      fontFamily: '"ArtMono", "DejaVu Sans Mono", monospace', 
      letterSpacing: '0px', 
      lineHeight: '0.92',
      fontVariantLigatures: 'none',
      WebkitTextSizeAdjust: '100%',
      textShadow: '0 0 0.12em rgba(239, 68, 68, 0.4), 0 0 0.45em rgba(0, 0, 0, 0.95)'
    }}
    className="text-red-500 font-bold animate-occult-pulse text-[clamp(4.2px,1.15vw,11px)] whitespace-pre inline-block text-left mx-auto select-none tracking-normal p-3 overflow-visible"
  >
{`    ███        ▄█    █▄       ▄████████    ▄████████    ▄████████ ████████▄  
▀█████████▄   ███    ███     ███    ███   ███    ███   ███    ███ ███   ▀███ 
   ▀███▀▀██   ███    ███     ███    ███   ███    █▀    ███    ███ ███    ███ 
    ███   ▀  ▄███▄▄▄▄███▄▄  ▄███▄▄▄▄██▀  ▄███▄▄▄       ███    ███ ███    ███ 
    ███     ▀▀███▀▀▀▀███▀  ▀▀███▀▀▀▀▀   ▀▀███▀▀▀     ▀███████████ ███    ███ 
    ███       ███    ███   ▀███████████   ███    █▄    ███    ███ ███    ███ 
    ███       ███    ███     ███    ███   ███    ███   ███    ███ ███   ▄███ 
   ▄████▀     ███    █▀      ███    ███   ██████████   ███    █▀  ████████▀  
    ██                       ███    ███                                      `}
  </pre>

  {/* & (Centered) */}
  <pre 
    style={{ 
      fontFamily: '"ArtMono", "DejaVu Sans Mono", monospace', 
      letterSpacing: '0px', 
      lineHeight: '0.92',
      fontVariantLigatures: 'none',
      WebkitTextSizeAdjust: '100%',
      textShadow: '0 0 0.12em rgba(239, 68, 68, 0.4), 0 0 0.45em rgba(0, 0, 0, 0.95)'
    }}
    className="text-red-500 font-bold animate-occult-pulse text-[clamp(4.2px,1.15vw,11px)] whitespace-pre inline-block text-left mx-auto select-none tracking-normal p-1 overflow-visible my-0.5"
  >
{`    ▄▄▄▄     
   ██  ██    
   ▀██▄█▀    
   ▄████▄▄█▀ 
   ██▀  ██▄   
   ▀█▄▄██▀▀█▄ `}
  </pre>

  {/* BONES (Centered) */}
  <pre 
    style={{ 
      fontFamily: '"ArtMono", "DejaVu Sans Mono", monospace', 
      letterSpacing: '0px', 
      lineHeight: '0.92',
      fontVariantLigatures: 'none',
      WebkitTextSizeAdjust: '100%',
      textShadow: '0 0 0.12em rgba(220, 38, 38, 0.4), 0 0 0.45em rgba(0, 0, 0, 0.95)'
    }}
    className="text-red-600 font-bold animate-occult-pulse text-[clamp(4.2px,1.15vw,11px)] whitespace-pre inline-block text-left mx-auto select-none tracking-normal p-3 overflow-visible"
  >
{`  ▀█████████▄   ▄██████▄  ███▄▄▄▄      ▄████████    ▄████████ 
    ███    ███ ███    ███ ███▀▀▀██▄   ███    ███   ███    ███ 
    ███    ███ ███    ███ ███   ███   ███    █▀    ███    █▀  
   ▄███▄▄▄██▀  ███    ███ ███   ███  ▄███▄▄▄       ███        
  ▀▀███▀▀▀██▄  ███    ███ ███   ███ ▀▀███▀▀▀     ▀███████████ 
    ███    ██▄ ███    ███ ███   ███   ███    █▄           ███ 
    ███    ███ ███    ███ ███   ███   ███    ███    ▄█    ███ 
  ▄█████████▀   ▀██████▀   ▀█   █▀    ██████████  ▄████████▀  `}
  </pre>
</div>

  {/* Persistent Discord Link (Cryptographically Gated) */}
   <a
     href={unlockedDiscordUrl || "#"}
     target={unlockedDiscordUrl ? "_blank" : undefined}
     rel={unlockedDiscordUrl ? "noopener noreferrer" : undefined}
     onClick={(e) => { e.stopPropagation(); handleDiscordClick(e); }}
     className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 transition-transform duration-150 hover:scale-110 active:scale-95 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] cursor-pointer"
     title={unlockedDiscordUrl ? "[SIDE HUSTLE]" : "[SEALED RITUAL]"}
   >
     <img
       src={discordGif}
       alt="Discord Community"
       className={`w-11 h-11 sm:w-14 sm:h-14 object-contain [image-rendering:pixelated] ${
         !unlockedDiscordUrl ? 'brightness-75 contrast-125 sepia-[0.3]' : ''
       }`}
     />
   </a>

   {/* Occult Passcode Challenge Modal */}
   {showDiscordPrompt && (
     <div
       onClick={(e) => e.stopPropagation()}
       className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none animate-menu-fade-in"
     >
       <div className="relative w-full max-w-[360px] p-6 sm:p-7 bg-gradient-to-b from-[#170f0e] via-[#100909] to-[#090505] border border-[#5c3c2e]/90 shadow-[0_24px_60px_rgba(0,0,0,0.96),0_0_40px_rgba(127,29,29,0.22),inset_0_1px_0_rgba(255,224,180,0.08)] text-center overflow-hidden">
         {/* Inner Hairline Frame */}
         <div className="pointer-events-none absolute inset-[5px] border border-[#3a221c]/70" />

         {/* Corner Brass/Crimson Brackets */}
         <span className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[#a37d4c]/80" />
         <span className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[#a37d4c]/80" />
         <span className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[#a37d4c]/80" />
         <span className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[#a37d4c]/80" />

         {/* Subtle Crimson Candlelight Wash */}
         <div
           className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-36 rounded-full"
           style={{
             background: 'radial-gradient(circle, rgba(185,28,28,0.24) 0%, rgba(127,29,29,0.08) 55%, transparent 78%)',
           }}
         />

         <div className="relative z-10">
           <div className="flex items-center justify-center gap-2.5 mb-2">
             <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#8f3028]/80" />
             <span className="font-mono text-[9px] uppercase tracking-[0.34em] text-red-400/80">
               秘密のパスワード
             </span>
             <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#8f3028]/80" />
           </div>

           <h3 className="font-['Cinzel',_serif] text-lg sm:text-xl font-bold tracking-[0.2em] uppercase text-[#ebe0cc] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mb-1.5">
             これについては誰かに聞いてみてください。
           </h3>
           <p className="font-mono text-[11px] text-[#a39081] mb-5 tracking-wide">
             秘密のパスワードを入力してください
           </p>

           <form onSubmit={handleAttemptUnlock} className="flex flex-col gap-3.5">
             <div className="relative">
               <input
                 type="password"
                 autoFocus
                 value={discordInput}
                 onChange={(e) => {
                   setDiscordInput(e.target.value);
                   setDiscordError(false);
                 }}
                 placeholder="• • • • • •"
                 className={`w-full px-4 py-2.5 bg-[#070404]/95 border font-mono ${
                   discordError
                     ? 'border-red-600/90 shadow-[0_0_16px_rgba(220,38,38,0.35),inset_0_2px_8px_rgba(0,0,0,0.9)] animate-shake'
                     : 'border-[#3d2720] focus:border-[#b88b52] shadow-[inset_0_2px_10px_rgba(0,0,0,0.95)] focus:shadow-[0_0_16px_rgba(185,28,28,0.25),inset_0_2px_10px_rgba(0,0,0,0.95)]'
                 } text-[#f3dfb8] placeholder:text-[#4f3a32] text-center tracking-[0.35em] text-xs outline-none transition-all`}
               />
             </div>

             {discordError && (
               <span
                 style={{ textShadow: '0 0 8px rgba(239, 68, 68, 0.5)' }}
                 className="font-mono text-[10px] text-red-500 font-bold uppercase tracking-[0.2em]"
               >
                 次はもっとうまくいくといいですね
               </span>
             )}

             <div className="flex gap-3 justify-center mt-2">
               <button
                 type="submit"
                 className="flex-1 py-2 px-4 bg-gradient-to-b from-[#3d1414] to-[#220909] hover:from-[#521a1a] hover:to-[#2e0c0c] border border-[#8f3028]/90 hover:border-[#d49a6a]/90 text-[#f3dfb8] hover:text-white font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] shadow-[0_4px_14px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,200,160,0.12)] active:translate-y-[1px] transition-all cursor-pointer"
               >
                 ロック解除
               </button>
               <button
                 type="button"
                 onClick={() => {
                   setShowDiscordPrompt(false);
                   setDiscordError(false);
                   setDiscordInput('');
                 }}
                 className="px-4 py-2 bg-[#110b0a]/90 hover:bg-[#1c1210] border border-[#3a2620] hover:border-[#6e4c3b] text-[#8f7b6e] hover:text-[#d6c2a5] font-mono text-[11px] uppercase tracking-[0.2em] active:translate-y-[1px] transition-all cursor-pointer"
               >
                 終了
               </button>
             </div>
           </form>
         </div>
       </div>
     </div>
   )}

{introPhase === 'menu' && (
            <div
              className="flex flex-col items-center justify-center w-full"
              style={{ animation: 'splashMenuRise 0.55s ease-out forwards', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 45%, transparent 72%)' }}
            >
            {/* Ritual Action Button */}
            <button
              disabled={!isRitualReady}
              onClick={() => {
                if (!isRitualReady) return;
              ChiptuneAudio.init();
              playSound('ritual_begin');
                try {
                  ChiptuneAudio.init();
                  ChiptuneAudio.playAmbient();
                } catch (e) {
                  console.warn("Audio autostart blocked:", e);
                }
                setAudioEnabled(true);
                if (savedRunExists) {
                  setShowContinueModal(true);
                } else {
                  setScreen('DECK_SELECT');
                }
              }}
              className={`group mt-3 sm:mt-5 bg-transparent border-0 p-1 focus:outline-none transition-all duration-300 flex flex-col items-center justify-center overflow-visible ${
                isRitualReady
                  ? 'cursor-pointer opacity-100 hover:scale-105 active:scale-95'
                  : 'cursor-wait opacity-45 grayscale'
              }`}
            >
              <pre 
                style={{ 
                  fontFamily: '"ArtMono", "DejaVu Sans Mono", monospace', 
                  letterSpacing: '0px', 
                  lineHeight: '0.92',
                  fontVariantLigatures: 'none',
                  WebkitTextSizeAdjust: '100%',
                  textShadow: '0 0 0.12em rgba(239, 68, 68, 0.4), 0 0 0.45em rgba(0, 0, 0, 0.95)'
                }} 
                className="text-red-600 group-hover:text-red-400 font-normal animate-occult-pulse text-[clamp(5.5px,0.9vw,8.5px)] whitespace-pre select-none p-2 overflow-visible"
              >
{`          ▀█████████▄   ▄████████    ▄██████▄   ▄█  ███▄▄▄▄           ▄████████  ▄█     ███     ███    █▄     ▄████████  ▄█       
           ███    ███  ███    ███   ███    ███ ███  ███▀▀▀██▄        ███    ███ ███ ▀█████████▄ ███    ███   ███    ███ ███       
           ███    ███  ███    █▀    ███    █▀  ███▌ ███   ███        ███    ███ ███▌   ▀███▀▀██ ███    ███   ███    ███ ███       
          ▄███▄▄▄██▀  ▄███▄▄▄      ▄███        ███▌ ███   ███       ▄███▄▄▄▄██▀ ███▌    ███   ▀ ███    ███   ███    ███ ███       
         ▀▀███▀▀▀██▄ ▀▀███▀▀▀     ▀▀███ ████▄  ███▌ ███   ███      ▀▀███▀▀▀▀▀   ███▌    ███     ███    ███ ▀███████████ ███       
           ███    ██▄  ███    █▄    ███    ███ ███  ███   ███      ▀███████████ ███     ███     ███    ███   ███    ███ ███       
           ███    ███  ███    ███   ███    ███ ███  ███   ███        ███    ███ ███     ███     ███    ███   ███    ███ ███▌    ▄ 
         ▄█████████▀   ██████████   ████████▀  █▀    ▀█   █▀         ███    ███ █▀     ▄████▀   ████████▀    ███    █▀  █████▄▄██ 
                                                                     ███    ███                                             ▀     `}
    </pre>
    {!isRitualReady && (
                <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400/80 animate-pulse">
                  [ Kindling Altar... {ritualReadyProgress}% ]
                </span>
              )}
        </button>

        {isRitualReady && (
          <div className="mt-4 sm:mt-5 flex items-center justify-center gap-6 sm:gap-9">
            <button
              type="button"
              onClick={() => setArchiveModalTab('COMPENDIUM')}
              className="group relative px-1 py-1 bg-transparent border-0 focus:outline-none transition-transform duration-150 active:scale-95"
            >
              <span
                className="block font-['Cinzel',_serif] text-[12px] sm:text-[14px] font-bold uppercase tracking-[0.4em] text-red-500/70 transition-all duration-300 group-hover:text-red-300"
                style={{ textShadow: '0 0 0.4em rgba(0,0,0,0.95), 0 0 12px rgba(185,28,28,0.45)' }}
              >
                Compendium
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 -bottom-0.5 h-px w-0 -translate-x-1/2 bg-red-400/80 transition-all duration-300 group-hover:w-full"
                style={{ boxShadow: '0 0 8px rgba(239,68,68,0.8)' }}
              />
            </button>
            <span
              aria-hidden="true"
              className="animate-occult-pulse select-none pointer-events-none block w-[7px] h-[12px] sm:w-[8px] sm:h-[14px]"
              style={{
                background: 'radial-gradient(ellipse at 50% 70%, #ffd9a0 0%, #ef4444 40%, rgba(127,29,29,0.0) 75%)',
                borderRadius: '50% 50% 50% 50% / 65% 65% 35% 35%',
                filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.9))',
              }}
            />
            <button
              type="button"
              onClick={() => setArchiveModalTab('LEDGER')}
              className="group relative px-1 py-1 bg-transparent border-0 focus:outline-none transition-transform duration-150 active:scale-95"
            >
              <span
                className="block font-['Cinzel',_serif] text-[12px] sm:text-[14px] font-bold uppercase tracking-[0.4em] text-red-500/70 transition-all duration-300 group-hover:text-red-300"
                style={{ textShadow: '0 0 0.4em rgba(0,0,0,0.95), 0 0 12px rgba(185,28,28,0.45)' }}
              >
                Ledger
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 -bottom-0.5 h-px w-0 -translate-x-1/2 bg-red-400/80 transition-all duration-300 group-hover:w-full"
                style={{ boxShadow: '0 0 8px rgba(239,68,68,0.8)' }}
              />
            </button>
          </div>
        )}
            </div>
          )}
      </div>
    </div>

  {/* =========================================================================
      CONTINUE / SEVER RUN RELIQUARY MODAL
     ========================================================================= */}
  {showContinueModal && (
    <div
      onClick={() => setShowContinueModal(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Resume Expedition"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/86 backdrop-blur-[4px] p-4 font-mono select-none"
    >
      <RitualReliquaryShell
        variant="crimson"
        onClick={(e) => e.stopPropagation()}
        className="animate-sigil-modal-in w-full max-w-[440px]"
      >
        <div className="relative z-10 px-6 sm:px-8 pt-6 pb-6 text-center flex flex-col items-center">
          {/* Sculpted Wax & Brass Thread Medallion */}
          <div className="relative mb-3.5 w-14 h-14 rounded-full bg-[#130908] border border-[#b08749]/85 shadow-[inset_0_2px_10px_rgba(0,0,0,0.95),0_0_22px_rgba(185,28,28,0.34)] flex items-center justify-center">
            <div className="absolute inset-[4px] rounded-full border border-dashed border-[#c49a5c]/45 pointer-events-none" />
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden="true">
              <path d="M 6 24 C 11 19, 13 13, 18 11 C 21 10, 24 12, 26 8" stroke="#ef4444" strokeWidth="1.9" strokeLinecap="round" />
              <path d="M 9 8 L 23 22" stroke="#e5c185" strokeWidth="2" strokeLinecap="round" />
              <path d="M 21 20 L 24.5 23.5" stroke="#f5e6c8" strokeWidth="1.4" strokeLinecap="round" />
              <ellipse cx="10.5" cy="9.5" rx="2.2" ry="1.1" transform="rotate(45 10.5 9.5)" fill="#160708" stroke="#e5c185" strokeWidth="1.1" />
            </svg>
          </div>

          {/* Engraved Header */}
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#c49a5c]/70" />
            <span className="text-[9.5px] font-['Cinzel',_serif] font-bold text-[#e2be7d] uppercase tracking-[0.28em]">
              ◆ Occult Seal Detected ◆
            </span>
            <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#c49a5c]/70" />
          </div>

          <h3
            className="font-['Cinzel',_serif] text-xl sm:text-2xl font-bold text-[#f5e6c8] uppercase tracking-[0.2em]"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.98)' }}
          >
            Resume Expedition?
          </h3>

          {/* Recessed Lore Plaque */}
          <div className="relative w-full mt-4 mb-5 px-4 py-3 bg-[#0c0707]/85 border border-[#4a3322]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.92)]">
            <span className="pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#b08749]/50" />
            <span className="pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-[#b08749]/50" />
            <span className="pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-[#b08749]/50" />
            <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#b08749]/50" />
            <p className="text-[11.5px] text-[#d8c7ae]/92 font-mono leading-relaxed">
              A bound thread lingers upon this altar. Resume your descent into the dark, or sever the thread and begin anew?
            </p>
          </div>

          {/* Action Stack */}
          <div className="w-full flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleContinueRun}
              className="relative w-full py-2.5 px-5 bg-gradient-to-b from-[#341410] to-[#1a0908] hover:from-[#471b16] hover:to-[#240d0b] active:translate-y-[1px] border border-[#c49a5c]/90 hover:border-[#f4d78b] rounded-[2px] shadow-[0_6px_18px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(244,215,139,0.16)] font-['Cinzel',_serif] font-bold text-xs uppercase tracking-[0.22em] text-[#f5e3be] hover:text-white transition-all cursor-pointer"
            >
              Resume Expedition
            </button>

            <button
              type="button"
              onClick={() => {
                clearRunSave();
                setShowContinueModal(false);
                setScreen('DECK_SELECT');
              }}
              className="relative w-full py-2.5 px-5 bg-gradient-to-b from-[#23090b] to-[#130506] hover:from-[#360d10] hover:to-[#1d0709] active:translate-y-[1px] border border-[#7f1d1d]/85 hover:border-red-500/90 rounded-[2px] shadow-[0_4px_14px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(248,113,113,0.1)] font-['Cinzel',_serif] font-bold text-[11px] uppercase tracking-[0.18em] text-red-300/95 hover:text-red-100 transition-all cursor-pointer"
            >
              Sever Thread (New Game)
            </button>

            <button
              type="button"
              onClick={() => setShowContinueModal(false)}
              className="mt-1 py-1.5 text-[10px] font-['Cinzel',_serif] font-bold text-[#a89275] hover:text-[#f2dfc0] uppercase tracking-[0.24em] transition-colors cursor-pointer"
            >
              ← Back to Title
            </button>
          </div>
        </div>
      </RitualReliquaryShell>
    </div>
  )}
    </>
  );
}
