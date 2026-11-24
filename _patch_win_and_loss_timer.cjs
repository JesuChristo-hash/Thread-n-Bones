const fs = require('fs');

const filePath = 'src/App.tsx';
let src = fs.readFileSync(filePath, 'utf8');

// 1. Don't increment finalBossesDefeated / bossesDefeated / clearedStages on Dev Sandbox forced bosses
const statsUpdateOld = `    // Run trackers update
    setRunStats(prev => ({
      ...prev,
      clearedStages: prev.clearedStages + 1,
      bossesDefeated: isBossMatch ? prev.bossesDefeated + 1 : prev.bossesDefeated,
      finalBossesDefeated: (isBossMatch && bossState.type === 'BoneLord') ? prev.finalBossesDefeated + 1 : prev.finalBossesDefeated,
      grizzlyWallsSurvived: grizzlyWallActiveInDuel ? prev.grizzlyWallsSurvived + 1 : prev.grizzlyWallsSurvived,
    }));`;

const statsUpdateNew = `    // Run trackers update (skip Dev Sandbox forced bosses so Endless thresholds never trigger accidentally)
    if (!wasForcedDevBoss) {
      setRunStats(prev => ({
        ...prev,
        clearedStages: prev.clearedStages + 1,
        bossesDefeated: isBossMatch ? prev.bossesDefeated + 1 : prev.bossesDefeated,
        finalBossesDefeated: (isBossMatch && bossState.type === 'BoneLord') ? prev.finalBossesDefeated + 1 : prev.finalBossesDefeated,
        grizzlyWallsSurvived: grizzlyWallActiveInDuel ? prev.grizzlyWallsSurvived + 1 : prev.grizzlyWallsSurvived,
      }));
    }`;

if (!src.includes(statsUpdateOld)) {
  throw new Error('Could not locate handleWinMatch setRunStats block');
}
src = src.replace(statsUpdateOld, statsUpdateNew);

// 2. Sync Bleeding Stone Runnel drain grate & overkill glow with dynamic win target
src = src.replace(
  `title="Opponent Defeat (+5)"`,
  `title={\`Opponent Defeat (+\${getRequiredScaleWinDamage()})\`}`
);
src = src.replaceAll(`isOverkill || scale >= 5`, `isOverkill || scale >= getRequiredScaleWinDamage()`);

// 3. Extend Game Over splash (isLossSequenceActive) from ~1.47s to ~3.2s
const lossTimerOld = `          await sleep(420);
          setIsHeavyRecoil(false);
          await sleep(1050);
          setIsLossSequenceActive(false);`;

const lossTimerNew = `          await sleep(420);
          setIsHeavyRecoil(false);
          await sleep(2800);
          setIsLossSequenceActive(false);`;

if (!src.includes(lossTimerOld)) {
  throw new Error('Could not locate isLossSequenceActive sleep timer');
}
src = src.replace(lossTimerOld, lossTimerNew);

fs.writeFileSync(filePath, src, 'utf8');
console.log('Win condition sync + Game Over splash duration patched cleanly.');
