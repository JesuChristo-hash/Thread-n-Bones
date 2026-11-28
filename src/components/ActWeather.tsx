import React from 'react';

interface ActWeatherProps {
  act: number;
  posClass: string;
  keyPrefix: string;
}

const hash = (n: number, a: number, b: number, c: number) =>
  Math.abs(Math.sin(n * a + b) * c) % 1;

interface Layer {
  cls: string;
  bg: string;
  anim: string;
  desk?: boolean;
}

interface RainTier {
  count: number;
  width: number;
  height: number;
  heightStep: number;
  dur: number;
  durSpan: number;
  alpha: number;
  alphaStep: number;
}

// Three depth tiers per act: far (thin, slow, faint) -> near (thick, fast, bright).
// alpha is applied through --rain-o (keyframes used to pin opacity to 1, so it was ignored).
const RAIN_TIERS: Record<2 | 3, RainTier[]> = {
  2: [
    { count: 16, width: 0.8, height: 14, heightStep: 4, dur: 1.15, durSpan: 0.35, alpha: 0.16, alphaStep: 0.04 },
    { count: 14, width: 1, height: 20, heightStep: 6, dur: 0.85, durSpan: 0.3, alpha: 0.28, alphaStep: 0.05 },
    { count: 6, width: 1.5, height: 30, heightStep: 8, dur: 0.62, durSpan: 0.2, alpha: 0.44, alphaStep: 0.06 },
  ],
  3: [
    { count: 34, width: 0.8, height: 22, heightStep: 6, dur: 0.72, durSpan: 0.2, alpha: 0.2, alphaStep: 0.05 },
    { count: 32, width: 1.2, height: 34, heightStep: 8, dur: 0.52, durSpan: 0.16, alpha: 0.36, alphaStep: 0.06 },
    { count: 18, width: 1.8, height: 52, heightStep: 10, dur: 0.38, durSpan: 0.1, alpha: 0.56, alphaStep: 0.07 },
  ],
};

// Wind: horizontal travel + streak lean. Act 3 is more slanted.
const RAIN_WIND: Record<2 | 3, { dx: string; rot: string }> = {
  2: { dx: '-9vw', rot: '7deg' },
  3: { dx: '-17vw', rot: '14deg' },
};

const RAIN_STREAK =
  'linear-gradient(to bottom, transparent, rgba(208,224,242,0.88), rgba(186,208,232,0.28))';

const buildRainDrops = (weatherAct: 2 | 3) => {
  let n = 0;
  const drops: { i: number; style: React.CSSProperties }[] = [];
  RAIN_TIERS[weatherAct].forEach((t) => {
    for (let k = 0; k < t.count; k++) {
      const i = n++;
      const h1 = hash(i, 12.9898, 78.233, 43758.5453);
      const h2 = hash(i, 93.9898, 67.345, 24634.6345);
      const h3 = hash(i, 41.2317, 19.871, 15731.7431);
      const durNum = t.dur + h3 * t.durSpan;
      drops.push({
        i,
        style: {
          left: (h1 * 118 - 2).toFixed(2) + '%',
          width: t.width + 'px',
          height: t.height + (k % 4) * t.heightStep + 'px',
          background: RAIN_STREAK,
          animation:
            'weatherRainFall ' + durNum.toFixed(2) + 's linear ' + (-(h2 * durNum)).toFixed(3) + 's infinite',
          ['--rain-o' as any]: t.alpha + (k % 3) * t.alphaStep,
        } as React.CSSProperties,
      });
    }
  });
  return drops;
};

const RAIN_ACT_2 = buildRainDrops(2);
const RAIN_ACT_3 = buildRainDrops(3);

// Act 1: three layers. Puffs use circle closest-side, so each one fits inside its own box
// (a puff can never be bigger than the box that holds it, so nothing gets sliced).
const MIST_ACT_1: Layer[] = [
  {
    cls: 'absolute -inset-x-[14%] bottom-[-8%] h-[80%]',
    bg:
      'radial-gradient(circle closest-side at 24% 54%, rgba(214,210,200,0.29) 0%, rgba(168,164,156,0.14) 48%, transparent 100%), radial-gradient(circle closest-side at 54% 40%, rgba(222,216,204,0.27) 0%, rgba(172,168,158,0.13) 48%, transparent 100%), radial-gradient(circle closest-side at 82% 56%, rgba(208,202,190,0.25) 0%, rgba(150,146,138,0.11) 50%, transparent 100%)',
    anim: 'weatherMistDriftA 34s ease-in-out infinite',
  },
  {
    cls: 'absolute -inset-x-[14%] bottom-[2%] h-[68%]',
    bg:
      'radial-gradient(circle closest-side at 40% 50%, rgba(210,206,196,0.24) 0%, rgba(156,152,144,0.11) 50%, transparent 100%), radial-gradient(circle closest-side at 78% 44%, rgba(204,200,190,0.21) 0%, rgba(148,144,136,0.09) 50%, transparent 100%)',
    anim: 'weatherMistDriftB 26s ease-in-out -7s infinite',
  },
  {
    cls: 'absolute -inset-x-[14%] top-[2%] h-[56%]',
    bg:
      'radial-gradient(circle closest-side at 30% 50%, rgba(204,200,190,0.14) 0%, rgba(144,140,132,0.06) 52%, transparent 100%), radial-gradient(circle closest-side at 74% 46%, rgba(198,194,184,0.12) 0%, rgba(140,136,128,0.06) 52%, transparent 100%)',
    anim: 'weatherMistDriftB 46s ease-in-out -15s infinite',
  },
];

// Acts 2 & 3: lumpy cloud banks at different depths and speeds.
const CLOUD_BANKS: Record<2 | 3, Layer[]> = {
  2: [
    {
      cls: 'absolute -inset-x-[28%] top-[-16%] h-[48%]',
      bg:
        'radial-gradient(ellipse 34% 62% at 20% 40%, rgba(34,40,50,0.54) 0%, rgba(20,24,32,0.26) 55%, transparent 80%), radial-gradient(ellipse 38% 70% at 56% 32%, rgba(30,36,46,0.5) 0%, rgba(18,22,30,0.24) 55%, transparent 80%), radial-gradient(ellipse 30% 58% at 88% 42%, rgba(36,42,52,0.46) 0%, transparent 78%)',
      anim: 'weatherCloudDriftA 46s ease-in-out infinite',
    },
    {
      cls: 'absolute -inset-x-[28%] top-[-10%] h-[38%]',
      bg:
        'radial-gradient(ellipse 36% 64% at 38% 36%, rgba(28,34,44,0.44) 0%, rgba(16,20,28,0.22) 55%, transparent 80%), radial-gradient(ellipse 32% 60% at 76% 30%, rgba(30,36,46,0.4) 0%, transparent 78%)',
      anim: 'weatherCloudDriftB 61s ease-in-out -22s infinite',
    },
    {
      cls: 'absolute -inset-x-[28%] top-[6%] h-[26%]',
      bg:
        'radial-gradient(ellipse 40% 55% at 30% 50%, rgba(58,66,78,0.2) 0%, transparent 76%), radial-gradient(ellipse 34% 50% at 72% 46%, rgba(52,60,72,0.18) 0%, transparent 74%)',
      anim: 'weatherCloudDriftA 83s ease-in-out -40s infinite',
    },
  ],
  3: [
    {
      cls: 'absolute -inset-x-[28%] top-[-16%] h-[52%]',
      bg:
        'radial-gradient(ellipse 34% 62% at 20% 40%, rgba(12,16,24,0.74) 0%, rgba(8,10,16,0.46) 55%, transparent 80%), radial-gradient(ellipse 38% 70% at 56% 32%, rgba(10,14,22,0.7) 0%, rgba(6,8,14,0.42) 55%, transparent 80%), radial-gradient(ellipse 30% 58% at 88% 42%, rgba(14,18,26,0.66) 0%, transparent 78%)',
      anim: 'weatherCloudDriftA 40s ease-in-out infinite',
    },
    {
      cls: 'absolute -inset-x-[28%] top-[-10%] h-[42%]',
      bg:
        'radial-gradient(ellipse 36% 64% at 38% 36%, rgba(10,14,22,0.62) 0%, rgba(6,8,14,0.36) 55%, transparent 80%), radial-gradient(ellipse 32% 60% at 76% 30%, rgba(12,16,24,0.58) 0%, transparent 78%)',
      anim: 'weatherCloudDriftB 54s ease-in-out -19s infinite',
    },
    {
      cls: 'absolute -inset-x-[28%] top-[8%] h-[28%]',
      bg:
        'radial-gradient(ellipse 40% 55% at 30% 50%, rgba(34,42,56,0.3) 0%, transparent 76%), radial-gradient(ellipse 34% 50% at 72% 46%, rgba(30,38,52,0.26) 0%, transparent 74%)',
      anim: 'weatherCloudDriftA 71s ease-in-out -33s infinite',
    },
  ],
};

// Cool grey haze hugging the ground under the rain.
const GROUND_HAZE: Layer = {
  cls: 'absolute -inset-x-[20%] bottom-[-10%] h-[40%]',
  bg: 'radial-gradient(ellipse 60% 55% at 50% 90%, rgba(120,134,150,0.12) 0%, rgba(90,102,118,0.05) 55%, transparent 80%)',
  anim: 'weatherMistDriftB 30s ease-in-out -5s infinite',
};

// Act 4: one smoke layer, no blend modes, gradient embers (no box-shadow halos).
const FIRE_SMOKE: Layer[] = [
  {
    cls: 'absolute -inset-x-[12%] bottom-[-5%] h-[78%]',
    bg:
      'radial-gradient(circle closest-side at 36% 56%, rgba(92,82,78,0.3) 0%, rgba(45,40,38,0.15) 52%, transparent 100%), radial-gradient(circle closest-side at 70% 44%, rgba(78,66,62,0.24) 0%, rgba(40,34,32,0.11) 52%, transparent 100%)',
    anim: 'weatherSmokeDrift 22s ease-in-out infinite',
  },
  {
    desk: true,
    cls: 'absolute -inset-x-[12%] bottom-[-8%] h-[84%]',
    bg: 'radial-gradient(circle closest-side at 62% 54%, rgba(78,66,62,0.24) 0%, rgba(40,34,32,0.11) 52%, transparent 100%)',
    anim: 'weatherSmokeRise 27s ease-in-out -9s infinite',
  },
];

const EMBERS = Array.from({ length: 28 }, (_, i) => {
  const spark = i % 7 === 3;
  const leftPct = (i * 33.7 + 4) % 96;
  const sizePx = (spark ? 1.6 : 2 + (i % 3) * 1.4) * 4;
  const durNum = spark ? 2.4 + (i % 4) * 0.35 : 4.2 + ((i * 13) % 10) * 0.42;
  const delayNum = -((i * 0.67) % durNum);
  const drift = (i % 2 === 0 ? 1 : -1) * (spark ? 10 + (i % 3) * 8 : 18 + (i % 5) * 14);
  const c = spark || i % 3 === 0 ? '253,230,138' : i % 2 === 0 ? '251,146,60' : '239,68,68';
  return {
    i,
    style: {
      left: leftPct.toFixed(2) + '%',
      width: sizePx + 'px',
      height: sizePx + 'px',
      background:
        'radial-gradient(circle, rgba(' + c + ',1) 0%, rgba(' + c + ',0.95) 28%, rgba(251,146,60,0.4) 50%, transparent 70%)',
      ['--ember-drift' as any]: drift + 'px',
      animation: 'weatherEmberRise ' + durNum.toFixed(2) + 's ease-out ' + delayNum.toFixed(2) + 's infinite',
    } as React.CSSProperties,
  };
});

const BOLT_PATH = 'M58 0 L44 96 L66 104 L38 212 L58 220 L30 330 L24 400';
const BOLT_BRANCH = 'M38 212 L18 262 L26 268 L8 318';

const LightningBolt = React.memo<{ left: string; flip?: boolean; anim: string }>(({ left, flip, anim }) => (
  <svg
    className="wx wx-flash absolute top-0"
    style={{ left, width: '13%', height: '60%', transform: flip ? 'scaleX(-1)' : undefined, animation: anim }}
    viewBox="0 0 100 400"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path d={BOLT_PATH} fill="none" stroke="rgba(150,180,235,0.32)" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    <path d={BOLT_BRANCH} fill="none" stroke="rgba(150,180,235,0.2)" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    <path d={BOLT_PATH} fill="none" stroke="rgba(238,245,255,0.95)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    <path d={BOLT_BRANCH} fill="none" stroke="rgba(238,245,255,0.7)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>
));

const renderLayer = (l: Layer, key: string) => (
  <div key={key} className={'wx ' + (l.desk ? 'wx-desk ' : '') + l.cls} style={{ background: l.bg, animation: l.anim }} />
);

export const ActWeather = React.memo<ActWeatherProps>(({ act, posClass, keyPrefix }) => {
  const weatherAct = Math.min(4, Math.max(1, act));
  const rainDrops = weatherAct === 3 ? RAIN_ACT_3 : weatherAct === 2 ? RAIN_ACT_2 : null;
  const rainWind = weatherAct === 3 ? RAIN_WIND[3] : RAIN_WIND[2];
  const cloudBanks = weatherAct === 3 ? CLOUD_BANKS[3] : weatherAct === 2 ? CLOUD_BANKS[2] : null;
  const hasLightning = weatherAct === 3;
  const hasFire = weatherAct === 4;

  return (
    <div className={'pointer-events-none ' + posClass + ' overflow-hidden select-none'}>
      {weatherAct === 1 && MIST_ACT_1.map((l, n) => renderLayer(l, 'mist-' + n))}

      {cloudBanks && cloudBanks.map((l, n) => renderLayer(l, 'cloud-' + n))}
      {cloudBanks && renderLayer(GROUND_HAZE, 'haze')}

      {rainDrops && (
        <div
          className="absolute inset-0"
          style={{ ['--rain-dx' as any]: rainWind.dx, ['--rain-rot' as any]: rainWind.rot } as React.CSSProperties}
        >
          {rainDrops.map((d) => (
            <span
              key={keyPrefix + '-rain-' + weatherAct + '-' + d.i}
              className="wx wx-particle absolute top-0 rounded-full"
              style={d.style}
            />
          ))}
        </div>
      )}

      {hasLightning && (
        <>
          <div
            className="wx wx-flash absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 15%, rgba(215,232,255,0.6) 0%, rgba(168,196,238,0.26) 55%, rgba(120,145,190,0.08) 100%)',
              mixBlendMode: 'screen',
              animation: 'weatherLightningFlash 6.8s linear infinite',
            }}
          />
          <div
            className="wx wx-flash absolute -inset-x-[10%] top-[-6%] h-[44%]"
            style={{
              background:
                'radial-gradient(ellipse 60% 70% at 50% 40%, rgba(196,218,255,0.62) 0%, rgba(140,168,224,0.22) 50%, transparent 78%)',
              mixBlendMode: 'screen',
              animation: 'weatherLightningFlash 6.8s linear infinite',
            }}
          />
          <LightningBolt left="62%" anim="weatherBoltFlashA 6.8s linear infinite" />
          <LightningBolt left="20%" flip anim="weatherBoltFlashB 6.8s linear infinite" />
        </>
      )}

      {hasFire && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(26,4,4,0.42) 0%, rgba(26,4,4,0.12) 38%, transparent 62%)',
            }}
          />
          <div
            className="wx wx-blend absolute inset-x-0 bottom-0 h-[78%] origin-bottom"
            style={{
              background:
                'radial-gradient(ellipse 95% 75% at 50% 100%, rgba(249,115,22,0.56) 0%, rgba(220,38,38,0.34) 38%, rgba(153,27,27,0.12) 64%, transparent 88%)',
              animation: 'weatherFireGlow 4.8s ease-in-out infinite',
            }}
          />
          <div
            className="wx wx-blend absolute inset-x-[10%] bottom-0 h-[46%] origin-bottom"
            style={{
              background:
                'radial-gradient(ellipse 50% 95% at 50% 100%, rgba(253,186,116,0.46) 0%, rgba(249,115,22,0.24) 46%, transparent 82%)',
              animation: 'weatherFireFlicker 2.7s ease-in-out -0.9s infinite',
            }}
          />
          {FIRE_SMOKE.map((l, n) => renderLayer(l, 'smoke-' + n))}
          {EMBERS.map((e) => (
            <span
              key={keyPrefix + '-ember-' + e.i}
              className={'wx wx-particle wx-ember absolute -bottom-3 rounded-full' + (e.i >= 20 ? ' wx-desk' : '')}
              style={e.style}
            />
          ))}
        </>
      )}
    </div>
  );
});

export default ActWeather;
