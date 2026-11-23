const fs = require('fs');

function replaceExact(src, find, replace, label) {
  if (!src.includes(find)) {
    throw new Error(`Anchor not found: ${label}`);
  }
  return src.replace(find, replace);
}

// =========================================================================
// 1. LOWER END-GAME TRACK VOLUMES (ChiptuneAudio.ts)
// =========================================================================
{
  const file = 'src/audio/ChiptuneAudio.ts';
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let src = raw.replace(/\r\n/g, '\n');

  src = replaceExact(
    src,
    `this.playStrings(darkPads[step], inst.bus, 5.4, 0.11, when);`,
    `this.playStrings(darkPads[step], inst.bus, 5.4, 0.058, when);`,
    'playGameOver strings'
  );
  src = replaceExact(
    src,
    `this.playSynthPiano([fallingNotes[step]], pianoPan, 3.2, 0.105, when);`,
    `this.playSynthPiano([fallingNotes[step]], pianoPan, 3.2, 0.055, when);`,
    'playGameOver piano'
  );
  src = replaceExact(
    src,
    `this.playBell(146.83, bellPan, 4.8, 0.085, when);`,
    `this.playBell(146.83, bellPan, 4.8, 0.045, when);`,
    'playGameOver bell 1'
  );
  src = replaceExact(
    src,
    `this.playBell(130.81, bellPan, 4.4, 0.06, when);`,
    `this.playBell(130.81, bellPan, 4.4, 0.032, when);`,
    'playGameOver bell 2'
  );

  src = replaceExact(
    src,
    `this.playOrgan(organChords[step], inst.bus, 3.9, 0.085, when, 1450);`,
    `this.playOrgan(organChords[step], inst.bus, 3.9, 0.048, when, 1450);`,
    'playVictory organ'
  );
  src = replaceExact(
    src,
    `this.playStrings(stringPads[step], inst.bus, 5.2, 0.1, when);`,
    `this.playStrings(stringPads[step], inst.bus, 5.2, 0.056, when);`,
    'playVictory strings'
  );
  src = replaceExact(
    src,
    `this.playFlute(freq, flutePan, dur, 0.105, when);`,
    `this.playFlute(freq, flutePan, dur, 0.06, when);`,
    'playVictory flute'
  );
  src = replaceExact(
    src,
    `this.playMusicBox(harpArp[step], chimePan, 2.6, 0.075, when);`,
    `this.playMusicBox(harpArp[step], chimePan, 2.6, 0.042, when);`,
    'playVictory musicbox'
  );
  src = replaceExact(
    src,
    `this.playBell(587.33, bellPan, 3.8, 0.065, when);`,
    `this.playBell(587.33, bellPan, 3.8, 0.036, when);`,
    'playVictory bell 1'
  );
  src = replaceExact(
    src,
    `this.playBell(440.0, bellPan, 3.6, 0.055, when);`,
    `this.playBell(440.0, bellPan, 3.6, 0.03, when);`,
    'playVictory bell 2'
  );

  fs.writeFileSync(file, src.replace(/\n/g, eol), 'utf8');
  console.log('1/5 Lowered Game Over & Victory track gains in ChiptuneAudio.ts');
}

// =========================================================================
// 2-5. APP.TSX FIXES
// =========================================================================
{
  const file = 'src/App.tsx';
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let src = raw.replace(/\r\n/g, '\n');

  // --- A. Add duelRngRef, lossTransitionActive state, and seeded helpers ---
  src = replaceExact(
    src,
    `  const runSeedRef = useRef<string>('');`,
    `  const runSeedRef = useRef<string>('');
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
  const applyBegottenStamp = (card: CardDef, rng: () => number): CardDef => {
    const stamped = cloneCard(card, 0);
    (stamped as any).isGoobertClone = true;
    if (rng() < 0.5) {
      return stamped; // 50% pristine stamp
    }
    const roll = rng();
    if (roll < 0.34) {
      const delta = rng() < 0.5 ? 1 : -1;
      stamped.attack = Math.max(0, (stamped.attack || 0) + delta);
    } else if (roll < 0.67) {
      const delta = rng() < 0.5 ? 1 : -1;
      stamped.health = Math.max(1, (stamped.health || 1) + delta);
    } else {
      const pool = Object.keys(SIGIL_MAPPING).filter(s => s !== 'Amorphous');
      if (pool.length > 0) {
        stamped.sigils = [pool[Math.floor(rng() * pool.length)]];
      }
    }
    return stamped;
  };`,
    'runSeedRef helpers injection'
  );

  // --- B. Restock default Relics on handleRestartRun & clear loss overlay ---
  src = replaceExact(
    src,
    `    setIsAmpouleCracked(false);`,
    `    setIsAmpouleCracked(false);
    setIsLossSequenceActive(false);
    setItems(['coin_purse', 'magical_hat', 'large_matchbook']);
    setItemTargetMode(null);
    setItemTargetSourceSlot(null);
    setCrucifixUsedThisDuel(false);
    setIsAcornActive(false);
    setDieModal(null);`,
    'handleRestartRun relic restock'
  );

  // --- C. Dramatic loss transition before switching to GAME_OVER ---
  src = replaceExact(
    src,
    `        if (matchStatus === 'LOSS') {
          setScale(currentScale);
          setPlayerBoard(currPBoard);
          setEnemyBoard(currEBoard);
          setPhase('GAME_OVER');
          triggerSfx('defeat');
          handleLossMatch();
          return;
        }`,
    `        if (matchStatus === 'LOSS') {
          setScale(currentScale);
          setPlayerBoard(currPBoard);
          setEnemyBoard(currEBoard);
          setPhase('GAME_OVER');
          setIsHeavyRecoil(true);
          setIsLossSequenceActive(true);
          triggerSfx('defeat');
          await sleep(420);
          setIsHeavyRecoil(false);
          await sleep(1050);
          setIsLossSequenceActive(false);
          handleLossMatch();
          return;
        }`,
    'dramatic loss sequence'
  );

  // --- D. Rebalance The Begotten Boss (Phase 1, Phase 2, Turn Spawns) using Stamp table ---
  src = replaceExact(
    src,
    `            // Lane confronting player's strongest creature: Lethal Mirror Print
            const threatenedCard = currPBoard[targetCol];
            const mirrorPrint = threatenedCard
              ? cloneCard(threatenedCard, 0)
              : cloneCard(ALL_CARD_LOOKUP['Wolf'] || ALL_CARD_LOOKUP['Amoeba'], 0);
            mirrorPrint.id = \`goobert-press-mirror-\${Date.now()}\`;
            mirrorPrint.attack = Math.max(2, (threatenedCard?.attack || 2));
            mirrorPrint.health = Math.max(4, (threatenedCard?.health || 4));
            mirrorPrint.sigils = Array.from(new Set([...mirrorPrint.sigils, 'Touch of Death', 'Made of Stone']));
            (mirrorPrint as any).isGoobertClone = true;
            currEBoard[targetCol] = mirrorPrint;

            // Flank with Rotary Slime Amalgams
            const adjacentCols = [0, 1, 2, 3].filter(c => c !== targetCol);
            const leftFlank = adjacentCols[0] ?? 0;
            const rightFlank = adjacentCols[1] ?? 3;

            const makePressAmalgam = (idSuffix: string) => {
              const amalgam = cloneCard(ALL_CARD_LOOKUP['Amalgam'] || ALL_CARD_LOOKUP['Amoeba'], 0);
              amalgam.id = \`goobert-press-\${idSuffix}-\${Date.now()}\`;
              amalgam.attack = 3;
              amalgam.health = 5;
              amalgam.sigils = ['Double Strike', 'Amorphous', 'Stinky'];
              (amalgam as any).isGoobertClone = true;
              return amalgam;
            };

            currEBoard[leftFlank] = makePressAmalgam('flankA');`,
    `            // Lane confronting player's strongest creature: Stamped Mirror Print (uses same imperfect Press odds)
            const pressRng = duelRngRef.current;
            const threatenedCard = currPBoard[targetCol];
            const mirrorBase = threatenedCard
              ? threatenedCard
              : (ALL_CARD_LOOKUP['Wolf'] || ALL_CARD_LOOKUP['Amoeba']);
            const mirrorPrint = applyBegottenStamp(mirrorBase, pressRng);
            mirrorPrint.id = \`goobert-press-mirror-\${Date.now()}\`;
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
              amalgam.id = \`goobert-press-\${idSuffix}-\${Date.now()}\`;
              return amalgam;
            };

            currEBoard[leftFlank] = makePressAmalgam('flankA');`,
    'Begotten Phase 2 rebalance'
  );

  src = replaceExact(
    src,
    `            } else if (bossState.type === 'The Begotten' || (bossState.type as any) === 'Goobert') {
              (candidate as any).isGoobertClone = true;
              if (bossPhase === 1) {
                candidate.sigils = Array.from(new Set([...candidate.sigils, 'Amorphous']));
                candidate.health = Math.max(2, (candidate.health || 0) + 1);
              } else {
                const lethalPressStamps = ['Touch of Death', 'Double Strike', 'Bifurcated Strike', 'Sharp Quills'];
                const stamp = lethalPressStamps[Math.floor(Math.random() * lethalPressStamps.length)];
                candidate.attack = Math.max(2, (candidate.attack || 0) + 1);
                candidate.health = Math.max(3, (candidate.health || 0) + 1);
                candidate.sigils = Array.from(new Set([...candidate.sigils, 'Amorphous', stamp]));
              }
            }`,
    `            } else if (bossState.type === 'The Begotten' || (bossState.type as any) === 'Goobert') {
              const stamped = applyBegottenStamp(candidate, duelRngRef.current);
              candidate.attack = stamped.attack;
              candidate.health = stamped.health;
              candidate.sigils = stamped.sigils;
              (candidate as any).isGoobertClone = true;
            }`,
    'Begotten turn spawn rebalance'
  );

  src = replaceExact(
    src,
    `      } else if (bossType === 'The Begotten') {
        // Lane 0: Shifting Living Slime
        const primeAmoeba = transformAmorphous(cloneCard(ALL_CARD_LOOKUP['Amoeba'], 0));
        primeAmoeba.attack = 2;
        primeAmoeba.health = 4;
        primeAmoeba.sigils = Array.from(new Set([...primeAmoeba.sigils, 'Stinky']));
        (primeAmoeba as any).isGoobertClone = true;
        initBoard[0] = primeAmoeba;

        // Lanes 1 & 2: Stamped caricatures mockingly pulled from player's deck
        const playerPool = masterDeck.filter(c => !c.unsacrificable && !c.isSacrifice && !(c as any).isTerrain);
        const sourceDeck = playerPool.length > 0 ? playerPool : MAIN_DECK_POOL;

        [1, 2].forEach(col => {
          const raw = sourceDeck[Math.floor(Math.random() * sourceDeck.length)];
          const paintedMockery = cloneCard(raw, 0);
          paintedMockery.id = \`goobert-p1-\${col}-\${Date.now()}\`;
          paintedMockery.attack = Math.max(1, (paintedMockery.attack || 0));
          paintedMockery.health = Math.max(3, (paintedMockery.health || 0) + 1);
          (paintedMockery as any).isGoobertClone = true;

          const painterStamps = ['Bifurcated Strike', 'Sharp Quills', 'Amorphous', 'Fledgling'];
          const chosenStamp = painterStamps[Math.floor(Math.random() * painterStamps.length)];
          paintedMockery.sigils = Array.from(new Set([...(paintedMockery.sigils || []), chosenStamp]));
          initBoard[col] = paintedMockery;
        });`,
    `      } else if (bossType === 'The Begotten') {
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
          paintedMockery.id = \`goobert-p1-\${col}-\${Date.now()}\`;
          initBoard[col] = paintedMockery;
        });`,
    'Begotten opening board rebalance'
  );

  // --- E. Seeded RNG for Duel Deck Shuffle, Boss Order, Enemy Opening & Turn Reinforcements ---
  src = replaceExact(
    src,
    `    const effectiveDuelsCompleted = progressOverride?.duelsCompleted ?? duelsCompleted;
    const effectiveBossesDefeated = progressOverride?.bossesDefeated ?? runStats.bossesDefeated;`,
    `    const effectiveDuelsCompleted = progressOverride?.duelsCompleted ?? duelsCompleted;
    const effectiveBossesDefeated = progressOverride?.bossesDefeated ?? runStats.bossesDefeated;
    const activeSeed = runSeedRef.current || runSeed || 'UNSEEDED';
    const duelRng = createSeededRng(\`\${activeSeed}:duel:\${effectiveDuelsCompleted}:\${stage}:\${level}:\${forcedBoss || 'std'}\`);
    duelRngRef.current = duelRng;`,
    'startNextDuel duelRng init'
  );

  src = replaceExact(
    src,
    `    const shuffledDeck = activeDeck
      .map(c => currentTotem ? applyPlayerTotem(cloneCard(c, ouroborosBuffs), currentTotem) : cloneCard(c, ouroborosBuffs))
      .sort(() => Math.random() - 0.5);`,
    `    const shuffledDeck = seededShuffle(
      activeDeck.map(c => currentTotem ? applyPlayerTotem(cloneCard(c, ouroborosBuffs), currentTotem) : cloneCard(c, ouroborosBuffs)),
      duelRng
    );`,
    'seeded deck shuffle'
  );

  src = replaceExact(
    src,
    `      if (progressOverride?.forceEnemyTotem || (hasDefeatedWeaver && Math.random() < 0.35)) {`,
    `      if (progressOverride?.forceEnemyTotem || (hasDefeatedWeaver && duelRng() < 0.35)) {`,
    'seeded enemy totem roll'
  );
  src = replaceExact(
    src,
    `        const chosenTribe = tribes[Math.floor(Math.random() * tribes.length)];
        const chosenSigil = randomTotemSigils[Math.floor(Math.random() * randomTotemSigils.length)];`,
    `        const chosenTribe = tribes[Math.floor(duelRng() * tribes.length)];
        const chosenSigil = randomTotemSigils[Math.floor(duelRng() * randomTotemSigils.length)];`,
    'seeded enemy totem tribe/sigil'
  );

  src = replaceExact(
    src,
    `          const pool: ('Zealot' | 'The Begotten' | 'The Weaver')[] = ['Zealot', 'The Begotten', 'The Weaver'];
          (window as any).__standardBossOrder = [...pool].sort(() => Math.random() - 0.5);`,
    `          const pool: ('Zealot' | 'The Begotten' | 'The Weaver')[] = ['Zealot', 'The Begotten', 'The Weaver'];
          const bossOrderRng = createSeededRng(\`\${activeSeed}:bossOrder:\${Math.floor(effectiveDuelsCompleted / 36)}\`);
          (window as any).__standardBossOrder = seededShuffle(pool, bossOrderRng);`,
    'seeded boss order'
  );

  src = replaceExact(
    src,
    `        const pair = validPairs[Math.floor(Math.random() * validPairs.length)];`,
    `        const pair = validPairs[Math.floor(duelRng() * validPairs.length)];`,
    'seeded BoneLord opening pair'
  );

  src = replaceExact(
    src,
    `        const shuffledTribes = [...tribes].sort(() => Math.random() - 0.5);`,
    `        const shuffledTribes = seededShuffle(tribes, duelRng);`,
    'seeded Weaver tribes'
  );

  src = replaceExact(
    src,
    `          ? phase1SafeSigils[Math.floor(Math.random() * phase1SafeSigils.length)]`,
    `          ? phase1SafeSigils[Math.floor(duelRng() * phase1SafeSigils.length)]`,
    'seeded Weaver sigil'
  );

  src = replaceExact(
    src,
    `          const beast = cloneCard(frontPool[Math.floor(Math.random() * frontPool.length)], 0);`,
    `          const beast = cloneCard(frontPool[Math.floor(duelRng() * frontPool.length)], 0);`,
    'seeded Weaver frontline'
  );

  src = replaceExact(
    src,
    `        initQueue[Math.random() < 0.5 ? 0 : 3] = makeFrontlineBeast();`,
    `        initQueue[duelRng() < 0.5 ? 0 : 3] = makeFrontlineBeast();`,
    'seeded Weaver queue lane'
  );

  // Regular turn spawns: use duelRngRef.current
  src = replaceExact(
    src,
    `            maxSpawnsThisTurn = Math.random() < 0.5 ? 1 : 2;`,
    `            maxSpawnsThisTurn = duelRngRef.current() < 0.5 ? 1 : 2;`,
    'seeded turn spawn count'
  );
  src = replaceExact(
    src,
    `            const targetSlots = [...poolToUse]
              .sort(() => Math.random() - 0.5)
              .sort((a, b) => {`,
    `            const targetSlots = seededShuffle(poolToUse, duelRngRef.current)
              .sort((a, b) => {`,
    'seeded turn target slots'
  );
  src = replaceExact(
    src,
    `              const candidate = transformAmorphous(cloneCard(poolToUse[Math.floor(Math.random() * poolToUse.length)], 0));`,
    `              const candidate = transformAmorphous(cloneCard(poolToUse[Math.floor(duelRngRef.current() * poolToUse.length)], 0));`,
    'seeded turn candidate pick'
  );

  // Standard opening board Math.random() calls inside startNextDuel (between Tiered Encounter Scaling and setEnemyBoard(initBoard))
  const stdStart = src.indexOf('// --- Tiered Encounter Scaling');
  const stdEnd = src.indexOf('setEnemyBoard(initBoard);', stdStart);
  if (stdStart !== -1 && stdEnd !== -1) {
    let stdChunk = src.slice(stdStart, stdEnd);
    stdChunk = stdChunk.replace(/Math\.random\(\)/g, 'duelRng()');
    src = src.slice(0, stdStart) + stdChunk + src.slice(stdEnd);
  }

  // --- F. End-screen letter grade PNGs from /assets/text/ ---
  src = replaceExact(
    src,
    `                    <div className={\`text-5xl font-mono font-bold leading-none drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] \${calculateGrade(runStats).color}\`}>
                      {calculateGrade(runStats).letter}
                    </div>`,
    `                    {(() => {
                      const grade = calculateGrade(runStats);
                      const baseLetter = grade.letter.charAt(0);
                      const suffix = grade.letter.slice(1);
                      const baseUrl = import.meta.env.BASE_URL || './';
                      return (
                        <div
                          className="flex items-center justify-end gap-0.5 select-none drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]"
                          aria-label={\`Grade \${grade.letter}\`}
                        >
                          <img
                            src={\`\${baseUrl}assets/text/\${baseLetter}.png\`}
                            alt={baseLetter}
                            className="h-12 w-auto object-contain"
                            draggable={false}
                          />
                          {suffix === '+' && (
                            <img
                              src={\`\${baseUrl}assets/text/plus.png\`}
                              alt="+"
                              className="h-8 w-auto object-contain -ml-1 self-start mt-0.5"
                              draggable={false}
                            />
                          )}
                          {suffix === '++' && (
                            <img
                              src={\`\${baseUrl}assets/text/plus-plus.png\`}
                              alt="++"
                              className="h-8 w-auto object-contain -ml-1 self-start mt-0.5"
                              draggable={false}
                            />
                          )}
                        </div>
                      );
                    })()}`,
    'Game Over PNG grade images'
  );

  // --- G. Rename "Items" / "Satchel" -> "Relics" on Battle Screen & Merchant Event ---
  src = replaceExact(
    src,
    `                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#b59c80] font-bold">Satchel</span>`,
    `                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#b59c80] font-bold">Relics</span>`,
    'Merchant event Relics label'
  );
  src = replaceExact(
    src,
    `              <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Surplus Cache
              </h1>`,
    `              <h1 className="text-2xl sm:text-3xl font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] text-[#efe0be] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Relic Cache
              </h1>`,
    'Merchant event Relic Cache title'
  );
  src = replaceExact(
    src,
    `                  ITEMS
                </div>`,
    `                  RELICS
                </div>`,
    'Battle screen RELICS label'
  );

  // --- H. Mount the Loss Sequence Overlay right before Mobile Orientation Blocker ---
  src = replaceExact(
    src,
    `      {/* Mobile Orientation Blocker */}`,
    `      {/* Dramatic Loss Transition Overlay */}
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
              src={\`\${import.meta.env.BASE_URL || './'}assets/text/gameover.png\`}
              alt="Game Over"
              className="w-72 sm:w-96 max-w-[82vw] object-contain drop-shadow-[0_0_28px_rgba(220,38,38,0.65)] animate-pulse"
              draggable={false}
            />
            <div className="mt-3 text-xs font-mono uppercase tracking-[0.35em] text-red-300/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              The Scales Tipped Into Darkness
            </div>
          </div>
        </div>
      )}

      {/* Mobile Orientation Blocker */}`,
    'Loss sequence overlay'
  );

  fs.writeFileSync(file, src.replace(/\n/g, eol), 'utf8');
  console.log('2-5/5 Applied App.tsx fixes cleanly.');
}
