const fs = require('fs');

function patchMist(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');

  const oldMistBlock = `              {/* Act 1-3: Drifting Mist Layers */}
              {hasMist && (
                <>
                  <div
                    className="absolute -inset-x-[15%] bottom-[-12%] h-[58%]"
                    style={{
                      background:
                        weatherAct === 3
                          ? 'radial-gradient(ellipse at 30% 80%, rgba(165,180,196,0.22) 0%, rgba(110,125,140,0.12) 45%, transparent 74%)'
                          : 'radial-gradient(ellipse at 30% 80%, rgba(196,192,182,0.2) 0%, rgba(135,132,124,0.1) 45%, transparent 74%)',
                      filter: 'blur(28px)',
                      animation: 'weatherMistDriftA 22s ease-in-out infinite',
                    }}
                  />
                  <div
                    className="absolute -inset-x-[15%] bottom-[-8%] h-[46%]"
                    style={{
                      background:
                        weatherAct === 3
                          ? 'radial-gradient(ellipse at 72% 85%, rgba(155,172,190,0.2) 0%, rgba(95,112,130,0.1) 48%, transparent 76%)'
                          : 'radial-gradient(ellipse at 72% 85%, rgba(188,182,170,0.18) 0%, rgba(120,116,108,0.09) 48%, transparent 76%)',
                      filter: 'blur(34px)',
                      animation: 'weatherMistDriftB 29s ease-in-out infinite',
                    }}
                  />
                </>
              )}`;

  const altMistBlock = `            {hasMist && (
              <>
                <div
                  className="absolute -inset-x-[15%] bottom-[-12%] h-[58%]"
                  style={{
                    background:
                      weatherAct === 3
                        ? 'radial-gradient(ellipse at 30% 80%, rgba(165,180,196,0.22) 0%, rgba(110,125,140,0.12) 45%, transparent 74%)'
                        : 'radial-gradient(ellipse at 30% 80%, rgba(196,192,182,0.2) 0%, rgba(135,132,124,0.1) 45%, transparent 74%)',
                    filter: 'blur(28px)',
                    animation: 'weatherMistDriftA 22s ease-in-out infinite',
                  }}
                />
                <div
                  className="absolute -inset-x-[15%] bottom-[-8%] h-[46%]"
                  style={{
                    background:
                      weatherAct === 3
                        ? 'radial-gradient(ellipse at 72% 85%, rgba(155,172,190,0.2) 0%, rgba(95,112,130,0.1) 48%, transparent 76%)'
                        : 'radial-gradient(ellipse at 72% 85%, rgba(188,182,170,0.18) 0%, rgba(120,116,108,0.09) 48%, transparent 76%)',
                    filter: 'blur(34px)',
                    animation: 'weatherMistDriftB 29s ease-in-out infinite',
                  }}
                />
              </>
            )}`;

  const newMistBlock = `            {hasMist && (
              <>
                <div
                  className={\`absolute -inset-x-[15%] \${weatherAct >= 2 ? 'top-[-12%] h-[52%]' : 'bottom-[-12%] h-[58%]'}\`}
                  style={{
                    background:
                      weatherAct === 3
                        ? 'radial-gradient(ellipse at 32% 18%, rgba(42,50,62,0.52) 0%, rgba(22,27,36,0.32) 48%, transparent 76%)'
                        : weatherAct === 2
                          ? 'radial-gradient(ellipse at 34% 16%, rgba(56,64,74,0.42) 0%, rgba(30,35,42,0.24) 48%, transparent 76%)'
                          : 'radial-gradient(ellipse at 30% 80%, rgba(196,192,182,0.2) 0%, rgba(135,132,124,0.1) 45%, transparent 74%)',
                    filter: 'blur(28px)',
                    animation: 'weatherMistDriftA 22s ease-in-out infinite',
                  }}
                />
                <div
                  className={\`absolute -inset-x-[15%] \${weatherAct >= 2 ? 'top-[-8%] h-[42%]' : 'bottom-[-8%] h-[46%]'}\`}
                  style={{
                    background:
                      weatherAct === 3
                        ? 'radial-gradient(ellipse at 70% 14%, rgba(34,40,52,0.48) 0%, rgba(18,22,30,0.28) 50%, transparent 78%)'
                        : weatherAct === 2
                          ? 'radial-gradient(ellipse at 68% 12%, rgba(48,54,64,0.38) 0%, rgba(24,28,35,0.2) 50%, transparent 78%)'
                          : 'radial-gradient(ellipse at 72% 85%, rgba(188,182,170,0.18) 0%, rgba(120,116,108,0.09) 48%, transparent 76%)',
                    filter: 'blur(34px)',
                    animation: 'weatherMistDriftB 29s ease-in-out infinite',
                  }}
                />
              </>
            )}`;

  const target = src.includes(oldMistBlock) ? oldMistBlock : src.includes(altMistBlock) ? altMistBlock : null;
  if (!target) {
    console.error(`Mist anchor not found in ${filePath}`);
    process.exit(1);
  }
  const replacement = target.startsWith('              {/* Act 1-3')
    ? `              {/* Act 1-3: Drifting Mist Layers (Acts 2 & 3 overhead, Act 1 low) */}\n${newMistBlock}`
    : newMistBlock;

  fs.writeFileSync(filePath, src.replace(target, replacement), 'utf8');
  console.log(`Patched ${filePath}`);
}

patchMist('src/App.tsx');
patchMist('src/components/MapScreen.tsx');
