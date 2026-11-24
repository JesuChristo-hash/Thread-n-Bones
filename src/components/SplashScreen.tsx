import React from 'react';
import { ChiptuneAudio } from '../audio/ChiptuneAudio';

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
  return (
    <>
        <div 
          className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden select-none animate-fade-up"
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div
              className="w-[420px] h-[420px] sm:w-[500px] sm:h-[500px] md:w-[560px] md:h-[560px] animate-pentagram-rotate"
              style={{ willChange: 'transform' }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full text-red-900/55">
              {/* Main Outer Runes Border Ring */}
              <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3, 4" />
              
              {/* Inner Pentagram Star Lines */}
              <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" strokeWidth="1.0" />
              <path 
                d="M 100 24 L 144.7 161.4 L 27.6 76.4 L 172.4 76.4 L 55.3 161.4 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                strokeLinejoin="round" 
              />
              <circle cx="100" cy="100" r="32" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4, 6" />
            </svg>
            </div>
          </div>

          <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-4xl w-full mx-auto my-auto">
  
  {/* Direct, Frame-less High-Fidelity ASCII Title Display */}
  <div className="flex flex-col items-center justify-center w-full px-2 overflow-visible">
  {/* THREAD */}
  <pre 
    style={{ 
      fontFamily: '"Noto Sans Mono", "Courier New", Courier, monospace', 
      letterSpacing: '0px', 
      lineHeight: '0.92',
      fontVariantLigatures: 'none',
      WebkitTextSizeAdjust: '100%',
      textShadow: '0 0 0.12em rgba(239, 68, 68, 0.4)'
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
      fontFamily: '"Noto Sans Mono", "Courier New", Courier, monospace', 
      letterSpacing: '0px', 
      lineHeight: '0.92',
      fontVariantLigatures: 'none',
      WebkitTextSizeAdjust: '100%',
      textShadow: '0 0 0.12em rgba(239, 68, 68, 0.4)'
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
      fontFamily: '"Noto Sans Mono", "Courier New", Courier, monospace', 
      letterSpacing: '0px', 
      lineHeight: '0.92',
      fontVariantLigatures: 'none',
      WebkitTextSizeAdjust: '100%',
      textShadow: '0 0 0.12em rgba(220, 38, 38, 0.4)'
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
     onClick={handleDiscordClick}
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
     <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xs select-none">
       <div className="relative w-80 p-6 bg-[#140e0a] border-2 border-[#523927] rounded-xs shadow-[0_0_30px_rgba(0,0,0,0.95)] text-center font-mono">
         <h3 className="text-amber-500 text-sm font-bold tracking-widest uppercase mb-1">
           Forbidden Communion
         </h3>
         <p className="text-[11px] text-stone-400 mb-4 tracking-normal">
           Speak the cipher to break the seal.
         </p>

         <form onSubmit={handleAttemptUnlock} className="flex flex-col gap-3">
           <input
             type="password"
             autoFocus
             value={discordInput}
             onChange={(e) => {
               setDiscordInput(e.target.value);
               setDiscordError(false);
             }}
             placeholder="PASSCODE"
             className={`w-full px-3 py-2 bg-[#090605] border ${
               discordError ? 'border-red-600 animate-shake' : 'border-[#3a281c] focus:border-amber-600'
             } text-amber-200 text-center tracking-widest text-xs outline-none rounded-xs transition-colors`}
           />

           {discordError && (
             <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
               The seal remains unbroken
             </span>
           )}

           <div className="flex gap-2 justify-center mt-2">
             <button
               type="submit"
               className="px-4 py-1.5 bg-[#2d1b13] hover:bg-[#42281c] text-amber-300 text-xs uppercase tracking-wider border border-[#523927] active:scale-95 transition-transform"
             >
               Unbind
             </button>
             <button
               type="button"
               onClick={() => {
                 setShowDiscordPrompt(false);
                 setDiscordError(false);
                 setDiscordInput('');
               }}
               className="px-4 py-1.5 bg-black/40 hover:bg-black/60 text-stone-500 hover:text-stone-300 text-xs uppercase tracking-wider border border-transparent transition-colors"
             >
               Flee
             </button>
           </div>
         </form>
       </div>
     </div>
   )}

            {/* Ritual Action Button */}
            <button
              disabled={!isRitualReady}
              onClick={() => {
                if (!isRitualReady) return;
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
                  fontFamily: '"Noto Sans Mono", "Courier New", Courier, monospace', 
                  letterSpacing: '0px', 
                  lineHeight: '0.92',
                  fontVariantLigatures: 'none',
                  WebkitTextSizeAdjust: '100%',
                  textShadow: '0 0 0.12em rgba(239, 68, 68, 0.4)'
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
          <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6 font-mono text-[11px] uppercase tracking-[0.22em]">
            <button
              type="button"
              onClick={() => setArchiveModalTab('COMPENDIUM')}
              className="px-3 py-1.5 bg-black/50 hover:bg-red-950/40 border border-red-950/70 hover:border-red-700/70 text-amber-200/80 hover:text-amber-100 transition-colors cursor-pointer"
            >
              [ Compendium ]
            </button>
            <button
              type="button"
              onClick={() => setArchiveModalTab('LEDGER')}
              className="px-3 py-1.5 bg-black/50 hover:bg-red-950/40 border border-red-950/70 hover:border-red-700/70 text-amber-200/80 hover:text-amber-100 transition-colors cursor-pointer"
            >
              [ Ledger ]
            </button>
          </div>
        )}
      </div>
    </div>

  {/* =========================================================================
      CONTINUE RUN MODAL
     ========================================================================= */}
  {showContinueModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono select-none animate-menu-fade-in">
      <div className="w-full max-w-md bg-[#0c0805] border border-amber-950/80 p-6 sm:p-7 shadow-[0_0_40px_rgba(0,0,0,0.95)] text-center relative">
        <div className="text-[10px] text-amber-700 uppercase tracking-widest mb-1">
          Occult Seal Detected
        </div>
        <h3 className="font-['Cinzel',_serif] text-xl font-bold text-amber-100 uppercase tracking-widest mb-2">
          Resume Expedition?
        </h3>
        <p className="text-xs text-stone-400 mb-6 font-mono leading-relaxed">
          A previous run is tethered to this machine. Resume your descent into the dark, or burn the thread and begin anew?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinueRun}
            className="w-full py-2.5 px-4 bg-[#1e130c] hover:bg-[#2e1d13] border border-amber-600/80 hover:border-amber-400 text-amber-200 hover:text-white rounded-sm font-['Cinzel',_serif] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
          >
            Resume Expedition
          </button>

          <button
            onClick={() => {
              clearRunSave();
              setShowContinueModal(false);
              setScreen('DECK_SELECT');
            }}
            className="w-full py-2 px-4 bg-[#140d09] hover:bg-[#20120b] border border-red-950/70 hover:border-red-800 text-red-400/90 hover:text-red-200 rounded-sm font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Sever Thread (New Game)
          </button>

          <button
            onClick={() => setShowContinueModal(false)}
            className="mt-1 text-[11px] text-stone-500 hover:text-stone-300 uppercase tracking-wider cursor-pointer font-mono"
          >
            Back to Title
          </button>
        </div>
      </div>
    </div>
      )}
    </>
  );
}
