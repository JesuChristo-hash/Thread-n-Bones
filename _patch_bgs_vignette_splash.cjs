const fs = require('fs');

// =========================================================================
// 1. src/data/gameData.tsx — lock battlebg1..4 directly to act (1..4)
// =========================================================================
const gdPath = 'src/data/gameData.tsx';
let gd = fs.readFileSync(gdPath, 'utf8');

const oldArena = `  // Standard duel stages cycle battlebg1 through battlebg4
  const bgIndex = ((stage - 1) % 4) + 1;
  return getBackgroundUrl(\`battle\${bgIndex}\`);`;

const newArena = `  // Lock battlebg1 through battlebg4 directly to Act 1 through Act 4
  const bgIndex = Math.min(4, Math.max(1, stage));
  return getBackgroundUrl(\`battle\${bgIndex}\`);`;

if (!gd.includes(oldArena)) {
  console.error('getArenaBackground anchor not found in src/data/gameData.tsx');
  process.exit(1);
}
fs.writeFileSync(gdPath, gd.replace(oldArena, newArena), 'utf8');
console.log('1/4 Patched getArenaBackground in src/data/gameData.tsx.');

// =========================================================================
// 2. src/App.tsx — pass current Act to getArenaBackground + Act 4 fire_ event BGs
// =========================================================================
const appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

const oldDuelBgCall = `getArenaBackground(stage, isBossMatch, bossState.type ?? undefined)`;
const newDuelBgCall = `getArenaBackground(actMap?.act ?? displayStage, isBossMatch, bossState.type ?? undefined)`;
if (!app.includes(oldDuelBgCall)) {
  console.error('Duel getArenaBackground call not found in src/App.tsx');
  process.exit(1);
}
app = app.replace(oldDuelBgCall, newDuelBgCall);

// Wrap getScreenBgStyle passed to EventScreens so Act 4 uses fire_* event backgrounds
const eventScreenAnchor = `<EventScreens`;
const esIdx = app.indexOf(eventScreenAnchor);
if (esIdx === -1) {
  console.error('<EventScreens not found in src/App.tsx');
  process.exit(1);
}
const esEndIdx = app.indexOf('/>', esIdx);
const esBlock = app.slice(esIdx, esEndIdx + 2);
if (!esBlock.includes('getScreenBgStyle={getScreenBgStyle}')) {
  console.error('getScreenBgStyle prop not found on <EventScreens /> in src/App.tsx');
  process.exit(1);
}

const fireBgHelper = `  const ACT4_FIRE_EVENT_BGS: Record<string, string> = {
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

  const renderActWeather = (posClass: string, keyPrefix: string) => (`;

const renderWeatherAnchor = `  const renderActWeather = (posClass: string, keyPrefix: string) => (`;
if (!app.includes(renderWeatherAnchor)) {
  console.error('renderActWeather anchor not found in src/App.tsx');
  process.exit(1);
}

app = app.replace(renderWeatherAnchor, fireBgHelper);
app = app.replace(
  esBlock,
  esBlock.replace('getScreenBgStyle={getScreenBgStyle}', 'getScreenBgStyle={getEventScreenBgStyle}')
);
fs.writeFileSync(appPath, app, 'utf8');
console.log('2/4 Patched App.tsx (Act-locked battlebg + Act 4 fire_ event BGs).');

// =========================================================================
// 3. src/components/MapScreen.tsx — soften map vignette across all acts
// =========================================================================
const msPath = 'src/components/MapScreen.tsx';
let ms = fs.readFileSync(msPath, 'utf8');
let vignettePatched = false;

// Soften heavy radial-gradient vignette opacities on the map backdrop
ms = ms.replace(
  /radial-gradient\(([^)]*?)rgba\(([^)]+?),\s*0\.(8[5-9]|9[0-9])\)\s*(\d+%)([^)]*)\)/g,
  (match, pre, rgb, alpha, stop, post) => {
    vignettePatched = true;
    const reduced = Math.max(0.45, parseFloat(`0.${alpha}`) - 0.28).toFixed(2);
    return `radial-gradient(${pre}rgba(${rgb}, ${reduced}) ${stop}${post})`;
  }
);

if (vignettePatched) {
  fs.writeFileSync(msPath, ms, 'utf8');
  console.log('3/4 Softened MapScreen.tsx vignette.');
} else {
  console.log('3/4 Note: No heavy 0.85-0.99 radial-gradient vignette matched in MapScreen.tsx.');
}

// =========================================================================
// 4. src/components/SplashScreen.tsx — Pentagram -> Altar Burn-In Title -> Click to Reveal
// =========================================================================
const spPath = 'src/components/SplashScreen.tsx';
let sp = fs.readFileSync(spPath, 'utf8');

const oldStateAnchor = `  React.useEffect(() => {
    if (!showContinueModal) return;`;

const newStateBlock = `  const [introPhase, setIntroPhase] = React.useState<'pentagram' | 'title' | 'menu'>('pentagram');

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setIntroPhase(prev => (prev === 'pentagram' ? 'title' : prev));
    }, 800);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!showContinueModal) return;`;

if (!sp.includes(oldStateAnchor)) {
  console.error('SplashScreen useEffect anchor not found.');
  process.exit(1);
}
sp = sp.replace(oldStateAnchor, newStateBlock);

// Add click handler on root splash container (ignoring clicks on Discord link/modal or once menu is open)
const oldSplashRoot = `        <div 
          className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden select-none animate-fade-up"
          style={getScreenBgStyle('splash.jpg')}
        >`;

const newSplashRoot = `        <style>{\`
          @keyframes splashPentagramGlowIn {
            0% { opacity: 0; transform: scale(0.9); filter: drop-shadow(0 0 0px rgba(220,38,38,0)); }
            65% { opacity: 1; transform: scale(1.02); filter: drop-shadow(0 0 26px rgba(220,38,38,0.65)); }
            100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 14px rgba(185,28,28,0.4)); }
          }
          @keyframes splashAltarTitleIn {
            0% {
              opacity: 0;
              transform: scale(1.08);
              filter: brightness(2.6) contrast(1.4) blur(6px) drop-shadow(0 0 28px rgba(239,68,68,0.95));
            }
            45% {
              opacity: 1;
              transform: scale(0.99);
              filter: brightness(1.65) contrast(1.2) blur(1px) drop-shadow(0 0 22px rgba(239,68,68,0.8));
            }
            100% {
              opacity: 1;
              transform: scale(1);
              filter: brightness(1) contrast(1) blur(0px) drop-shadow(0 0 10px rgba(239,68,68,0.35));
            }
          }
          @keyframes splashMenuRise {
            0% { opacity: 0; transform: translateY(18px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        \`}</style>
        <div 
          onClick={() => {
            if (introPhase === 'title' && !showDiscordPrompt && !showContinueModal) {
              setIntroPhase('menu');
            }
          }}
          className={\`absolute inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden select-none \${introPhase === 'title' ? 'cursor-pointer' : ''}\`}
          style={getScreenBgStyle('splash.jpg')}
        >`;

if (!sp.includes(oldSplashRoot)) {
  console.error('SplashScreen root div anchor not found.');
  process.exit(1);
}
sp = sp.replace(oldSplashRoot, newSplashRoot);

// Animate pentagram glow-in
const oldPentagramWrap = `          {/* Centered Glowing Stylized SVG Pentagram with Esoteric Runes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">`;
const newPentagramWrap = `          {/* Centered Glowing Stylized SVG Pentagram with Esoteric Runes */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={{ animation: 'splashPentagramGlowIn 0.95s ease-out forwards' }}
          >`;
if (!sp.includes(oldPentagramWrap)) {
  console.error('SplashScreen pentagram anchor not found.');
  process.exit(1);
}
sp = sp.replace(oldPentagramWrap, newPentagramWrap);

// Animate Title block: hidden during pentagram phase, Altar burn-in at center during title phase, shifts upward on click
const oldTitleWrap = `  {/* Direct, Frame-less High-Fidelity ASCII Title Display */}
  <div className="flex flex-col items-center justify-center w-full px-2 overflow-visible">`;
const newTitleWrap = `  {/* Direct, Frame-less High-Fidelity ASCII Title Display */}
  <div
    className={\`flex flex-col items-center justify-center w-full px-2 overflow-visible transition-transform duration-700 ease-out \${
      introPhase === 'pentagram'
        ? 'opacity-0 pointer-events-none'
        : introPhase === 'title'
          ? 'translate-y-8 sm:translate-y-10'
          : '-translate-y-2 sm:-translate-y-4'
    }\`}
    style={
      introPhase !== 'pentagram'
        ? { animation: 'splashAltarTitleIn 0.85s ease-out forwards' }
        : undefined
    }
  >`;
if (!sp.includes(oldTitleWrap)) {
  console.error('SplashScreen title wrapper anchor not found.');
  process.exit(1);
}
sp = sp.replace(oldTitleWrap, newTitleWrap);

// Stop click propagation on Discord link so clicking it never triggers the title->menu reveal
const oldDiscordClick = `     onClick={handleDiscordClick}`;
const newDiscordClick = `     onClick={(e) => { e.stopPropagation(); handleDiscordClick(e); }}`;
if (sp.includes(oldDiscordClick)) {
  sp = sp.replace(oldDiscordClick, newDiscordClick);
}

// Wrap Begin Ritual + Compendium + Ledger so they appear only after clicking the screen
const oldActionStart = `            {/* Ritual Action Button */}
            <button`;
const oldActionEnd = `        {isRitualReady && (
          <div className="mt-5 flex items-center justify-center gap-4 sm:gap-5">`;

const actStartIdx = sp.indexOf(oldActionStart);
const actEndMarker = `        )}
      </div>
    </div>`;
const actEndIdx = sp.indexOf(actEndMarker, actStartIdx);

if (actStartIdx === -1 || actEndIdx === -1) {
  console.error('SplashScreen action buttons anchor not found.');
  process.exit(1);
}

const actionButtonsBlock = sp.slice(actStartIdx, actEndIdx + `        )}`.length);
const wrappedActionBlock = `{introPhase === 'title' && (
            <div className="mt-8 font-mono text-[10px] sm:text-xs uppercase tracking-[0.34em] text-red-400/75 animate-pulse pointer-events-none">
              [ Click to Enter ]
            </div>
          )}

          {introPhase === 'menu' && (
            <div
              className="flex flex-col items-center justify-center w-full"
              style={{ animation: 'splashMenuRise 0.55s ease-out forwards' }}
            >
${actionButtonsBlock}
            </div>
          )}`;

sp = sp.slice(0, actStartIdx) + wrappedActionBlock + sp.slice(actEndIdx + `        )}`.length);
fs.writeFileSync(spPath, sp, 'utf8');
console.log('4/4 Patched SplashScreen.tsx with Pentagram -> Altar Burn-In -> Click-to-Reveal.');
