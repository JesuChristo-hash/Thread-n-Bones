import React from 'react';

interface ActWeatherProps {
  act: number;
  posClass: string;
  keyPrefix: string;
}

const buildRainDrops = (weatherAct: 2 | 3) => {
  const rainCount = weatherAct === 3 ? 84 : 36;
  return Array.from({ length: rainCount }, (_, i) => {
    const h1 = Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
    const h2 = Math.abs(Math.sin(i * 93.9898 + 67.345) * 24634.6345) % 1;
    const h3 = Math.abs(Math.sin(i * 41.2317 + 19.871) * 15731.7431) % 1;
    const leftPct = h1 * 118 - 2;
    const durNum = weatherAct === 3 ? 0.42 + h3 * 0.28 : 0.72 + h3 * 0.38;
    const duration = durNum.toFixed(2);
    const delay = (-(h2 * durNum)).toFixed(3);
    const heightPx = weatherAct === 3 ? 30 + (i % 4) * 10 : 18 + (i % 4) * 6;
    const opacity = weatherAct === 3 ? 0.24 + (i % 3) * 0.09 : 0.15 + (i % 3) * 0.06;
    return {
      i,
      style: {
        left: `${leftPct}%`,
        width: weatherAct === 3 ? '1.4px' : '1px',
        height: `${heightPx}px`,
        opacity,
        background: 'linear-gradient(to bottom, transparent, rgba(208,224,242,0.88), rgba(186,208,232,0.28))',
        animation: `weatherRainFall ${duration}s linear ${delay}s infinite`,
      } as React.CSSProperties,
    };
  });
};

const RAIN_ACT_2 = buildRainDrops(2);
const RAIN_ACT_3 = buildRainDrops(3);

const EMBERS = Array.from({ length: 24 }, (_, i) => {
  const leftPct = (i * 33.7 + 4) % 96;
  const sizePx = 2 + (i % 3) * 1.4;
  const duration = (4.2 + ((i * 13) % 10) * 0.42).toFixed(2);
  const delay = -(((i * 0.67) % 6.5).toFixed(2));
  const drift = (i % 2 === 0 ? 1 : -1) * (18 + (i % 5) * 14);
  return {
    i,
    style: {
      left: `${leftPct}%`,
      width: `${sizePx}px`,
      height: `${sizePx}px`,
      backgroundColor: i % 3 === 0 ? '#fde68a' : i % 2 === 0 ? '#fb923c' : '#ef4444',
      boxShadow: '0 0 8px rgba(251,146,60,0.85), 0 0 14px rgba(239,68,68,0.55)',
      ['--ember-drift' as any]: `${drift}px`,
      animation: `weatherEmberRise ${duration}s ease-out ${delay}s infinite`,
    } as React.CSSProperties,
  };
});

export const ActWeather = React.memo<ActWeatherProps>(({ act, posClass, keyPrefix }) => {
  const weatherAct = Math.min(4, Math.max(1, act));
  const hasMist = weatherAct === 1 || weatherAct === 2 || weatherAct === 3;
  const rainDrops = weatherAct === 3 ? RAIN_ACT_3 : weatherAct === 2 ? RAIN_ACT_2 : null;
  const hasLightning = weatherAct === 3;
  const hasFire = weatherAct === 4;

  return (
    <div className={`pointer-events-none ${posClass} overflow-hidden select-none`}>
      {hasMist && (
        <>
          {weatherAct === 1 ? (
            <>
              <div
                className="absolute -inset-x-[15%] bottom-[-12%] h-[62%]"
                style={{
                  background:
                    'radial-gradient(ellipse at 30% 78%, rgba(212,208,198,0.17) 0%, rgba(152,148,140,0.09) 48%, transparent 76%)',
                  filter: 'blur(26px)',
                  animation: 'weatherMistDriftA 22s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -inset-x-[15%] bottom-[-8%] h-[50%]"
                style={{
                  background:
                    'radial-gradient(ellipse at 72% 84%, rgba(206,200,188,0.15) 0%, rgba(138,134,126,0.08) 50%, transparent 78%)',
                  filter: 'blur(32px)',
                  animation: 'weatherMistDriftB 29s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -inset-x-[12%] top-[14%] h-[42%]"
                style={{
                  background:
                    'radial-gradient(ellipse at 52% 50%, rgba(202,198,188,0.09) 0%, rgba(140,136,128,0.04) 52%, transparent 78%)',
                  filter: 'blur(38px)',
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
                      ? 'radial-gradient(ellipse at 30% 18%, rgba(12,16,24,0.68) 0%, rgba(8,10,16,0.44) 50%, transparent 74%)'
                      : 'radial-gradient(ellipse at 30% 18%, rgba(32,38,48,0.46) 0%, rgba(18,22,30,0.26) 48%, transparent 74%)',
                  filter: 'blur(26px)',
                  animation: 'weatherMistDriftA 22s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -inset-x-[15%] top-[-8%] h-[44%]"
                style={{
                  background:
                    weatherAct === 3
                      ? 'radial-gradient(ellipse at 72% 15%, rgba(10,14,22,0.62) 0%, rgba(6,8,14,0.38) 52%, transparent 76%)'
                      : 'radial-gradient(ellipse at 72% 15%, rgba(28,34,44,0.4) 0%, rgba(15,18,26,0.22) 50%, transparent 76%)',
                  filter: 'blur(32px)',
                  animation: 'weatherMistDriftB 29s ease-in-out infinite',
                }}
              />
            </>
          )}
        </>
      )}

      {rainDrops && (
        <div className="absolute inset-0">
          {rainDrops.map((d) => (
            <span
              key={`${keyPrefix}-rain-${weatherAct}-${d.i}`}
              className="absolute top-0 rounded-full"
              style={d.style}
            />
          ))}
        </div>
      )}

      {hasLightning && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 15%, rgba(215,232,255,0.85) 0%, rgba(168,196,238,0.35) 55%, rgba(120,145,190,0.12) 100%)',
            mixBlendMode: 'screen',
            animation: 'weatherLightningFlash 6.8s linear infinite',
          }}
        />
      )}

      {hasFire && (
        <>
          <div
            className="absolute inset-x-0 bottom-0 h-[56%] origin-bottom"
            style={{
              background:
                'radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.58) 0%, rgba(220,38,38,0.36) 44%, rgba(153,27,27,0.14) 68%, transparent 86%)',
              mixBlendMode: 'screen',
              animation: 'weatherFireGlow 4.8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute -inset-x-[12%] bottom-[-5%] h-[62%]"
            style={{
              background:
                'radial-gradient(ellipse at 40% 75%, rgba(92,82,78,0.26) 0%, rgba(45,40,38,0.14) 50%, transparent 76%)',
              filter: 'blur(36px)',
              animation: 'weatherSmokeDrift 20s ease-in-out infinite',
            }}
          />
          {EMBERS.map((e) => (
            <span
              key={`${keyPrefix}-ember-${e.i}`}
              className="absolute -bottom-3 rounded-full"
              style={e.style}
            />
          ))}
        </>
      )}
    </div>
  );
});

export default ActWeather;
