const fs = require('fs');

const file = 'src/components/ActWeather.tsx';
let src = fs.readFileSync(file, 'utf8');

const anchorStart = `      {hasMist && (
        <>
          <div
            className="absolute -inset-x-[15%] bottom-[-12%] h-[62%]"`;
const anchorEnd = `              animation: 'weatherMistDriftB 34s ease-in-out -11s infinite',
            }}
          />
        )}
        </>`;

const startIdx = src.indexOf(anchorStart);
const endIdx = src.indexOf(anchorEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate exact hasMist block boundaries in src/components/ActWeather.tsx');
  process.exit(1);
}

const replacement = `      {hasMist && (
        <>
          {weatherAct === 1 ? (
            <>
              <div
                className="absolute -inset-x-[15%] bottom-[-12%] h-[62%]"
                style={{
                  background:
                    'radial-gradient(ellipse at 30% 80%, rgba(196,192,182,0.22) 0%, rgba(135,132,124,0.11) 45%, transparent 74%)',
                  filter: 'blur(28px)',
                  animation: 'weatherMistDriftA 22s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -inset-x-[15%] bottom-[-8%] h-[50%]"
                style={{
                  background:
                    'radial-gradient(ellipse at 72% 85%, rgba(188,182,170,0.19) 0%, rgba(120,116,108,0.09) 48%, transparent 76%)',
                  filter: 'blur(34px)',
                  animation: 'weatherMistDriftB 29s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -inset-x-[12%] top-[14%] h-[42%]"
                style={{
                  background:
                    'radial-gradient(ellipse at 52% 24%, rgba(178,175,166,0.12) 0%, transparent 70%)',
                  filter: 'blur(36px)',
                  animation: 'weatherMistDriftB 34s ease-in-out -11s infinite',
                }}
              />
            </>
          ) : (
            <>
              <div
                className="absolute -inset-x-[15%] top-[-12%] h-[54%]"
                style={{
                  background:
                    weatherAct === 3
                      ? 'radial-gradient(ellipse at 32% 18%, rgba(36,43,54,0.56) 0%, rgba(18,22,30,0.34) 48%, transparent 76%)'
                      : 'radial-gradient(ellipse at 34% 16%, rgba(48,55,65,0.44) 0%, rgba(24,29,36,0.24) 48%, transparent 76%)',
                  filter: 'blur(28px)',
                  animation: 'weatherMistDriftA 22s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -inset-x-[15%] top-[-8%] h-[44%]"
                style={{
                  background:
                    weatherAct === 3
                      ? 'radial-gradient(ellipse at 70% 14%, rgba(28,34,44,0.52) 0%, rgba(14,18,25,0.3) 50%, transparent 78%)'
                      : 'radial-gradient(ellipse at 68% 12%, rgba(40,46,56,0.4) 0%, rgba(20,24,30,0.22) 50%, transparent 78%)',
                  filter: 'blur(34px)',
                  animation: 'weatherMistDriftB 29s ease-in-out infinite',
                }}
              />
            </>
          )}
        </>`;

src = src.slice(0, startIdx) + replacement + src.slice(endIdx + anchorEnd.length);
fs.writeFileSync(file, src, 'utf8');
console.log('Moved Acts 2 & 3 mist to top while keeping Act 1 mist unchanged.');
