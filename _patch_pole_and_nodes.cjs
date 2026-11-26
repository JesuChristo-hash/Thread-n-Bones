const fs = require('fs');

function replaceExact(path, target, replacement, label) {
  let src = fs.readFileSync(path, 'utf8');
  const count = src.split(target).length - 1;
  if (count !== 1) {
    throw new Error(`[${label}] in ${path}: expected 1 match, found ${count}`);
  }
  src = src.replace(target, replacement);
  fs.writeFileSync(path, src, 'utf8');
  console.log(`Patched: ${label}`);
}

// 1. DuelTelemetryBanner.tsx — Ornate carved timber + brass lashings + knotted ends
replaceExact(
  'src/components/DuelTelemetryBanner.tsx',
  `      {/* Ornate Carved Timber & Brass Banner Rod */}
      <div className="relative z-20 w-[calc(100%+20px)] flex items-center justify-center">
        {/* Left Spearhead Finial + Brass Collar */}
        <div className="flex items-center shrink-0">
          <span className="w-2.5 h-2.5 rotate-45 rounded-[1px] bg-gradient-to-br from-[#f6dfa4] via-[#b88940] to-[#4a3014] border border-[#2a190a] shadow-[0_2px_5px_rgba(0,0,0,0.9)]" />
          <span className="-ml-1 w-1.5 h-3.5 rounded-[1px] bg-gradient-to-b from-[#f3d693] via-[#9c7032] to-[#3f260e] border border-[#2a190a]" />
        </div>
        {/* Carved Shaft */}
        <div
          className="relative flex-1 h-2.5 border-y border-[#9c7238]/90 shadow-[0_4px_10px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,228,178,0.32)] flex items-center justify-around"
          style={{
            backgroundColor: '#2d1b10',
            backgroundImage: \`linear-gradient(180deg, rgba(255,220,165,0.22), rgba(0,0,0,0.55)), url("\${baseUrl}assets/text/wood.jpg")\`,
            backgroundSize: 'cover, 140px 140px',
          }}
        >
          {/* Brass Hanging Rings */}
          <span className="w-1 h-3 rounded-full bg-gradient-to-b from-[#f4d896] via-[#9c7032] to-[#3f260e] border border-[#241509]" />
          <span className="w-2 h-2 rotate-45 bg-gradient-to-br from-[#f6dfa4] via-[#b88940] to-[#4a3014] border border-[#241509] shadow-sm" />
          <span className="w-1 h-3 rounded-full bg-gradient-to-b from-[#f4d896] via-[#9c7032] to-[#3f260e] border border-[#241509]" />
        </div>
        {/* Right Brass Collar + Spearhead Finial */}
        <div className="flex items-center shrink-0">
          <span className="-mr-1 w-1.5 h-3.5 rounded-[1px] bg-gradient-to-b from-[#f3d693] via-[#9c7032] to-[#3f260e] border border-[#2a190a]" />
          <span className="w-2.5 h-2.5 rotate-45 rounded-[1px] bg-gradient-to-br from-[#f6dfa4] via-[#b88940] to-[#4a3014] border border-[#2a190a] shadow-[0_2px_5px_rgba(0,0,0,0.9)]" />
        </div>
      </div>`,
  `      {/* Ornate Carved Timber & Corded Brass Banner Rod */}
      <div className="relative z-20 w-[calc(100%+18px)] -ml-[9px] h-4 flex items-center shrink-0">
        <div
          className="relative w-full h-[9px] rounded-full"
          style={{
            backgroundColor: '#2e1d12',
            backgroundImage: \`linear-gradient(180deg, rgba(255,214,160,0.28) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.65) 100%), url("\${baseUrl}assets/text/wood.jpg")\`,
            backgroundSize: 'cover, 120px 120px',
            boxShadow: '0 5px 10px rgba(0,0,0,0.9), inset 0 -1px 2px rgba(0,0,0,0.7)',
          }}
        />
        {[10, 32, 68, 90].map((p) => (
          <span
            key={p}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[7px] h-[14px] rounded-[2px]"
            style={{
              left: \`\${p}%\`,
              backgroundImage:
                'repeating-linear-gradient(115deg, #b08a52 0px, #b08a52 1.2px, #3a2511 1.2px, #3a2511 2.6px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 0 2px rgba(0,0,0,0.6)',
            }}
          />
        ))}
        {(['left', 'right'] as const).map((side) => (
          <span key={side}>
            <span
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{
                [side]: '-2px',
                background: 'radial-gradient(circle at 38% 34%, #8a6a3c 0%, #4a3016 55%, #1d1209 100%)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.9)',
              }}
            />
            <span
              className="pointer-events-none absolute top-[62%] w-[2px] h-3"
              style={{ [side]: '3px', background: 'linear-gradient(to bottom, #8a6a3c, transparent)' }}
            />
          </span>
        ))}
      </div>`,
  'DuelTelemetryBanner rod'
);

// 2. MapScreen.tsx — Larger glyphs, stronger dark backing, and brighter secondary contrast
replaceExact(
  'src/components/MapScreen.tsx',
  `className={\`relative flex items-center justify-center rounded-full transition-all duration-200 bg-[radial-gradient(circle,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.25)_45%,transparent_72%)] \${
                        isBoss ? 'w-14 h-14 [&>svg]:scale-[1.45]' : 'w-11 h-11 [&>svg]:scale-[1.2]'
                      }`,
  `className={\`relative flex items-center justify-center rounded-full transition-all duration-200 bg-[radial-gradient(circle,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_48%,transparent_76%)] \${
                        isBoss ? 'w-16 h-16 [&>svg]:scale-[1.7]' : 'w-13 h-13 [&>svg]:scale-[1.42]'
                      }`,
  'MapScreen node scale & backing'
);

replaceExact(
  "isCombat ? 'text-[#a8574d] hover:brightness-125 hover:scale-105 cursor-help' : 'text-[#8f8374] hover:brightness-125 hover:scale-105 cursor-help'",
  "isCombat ? 'text-[#cf766a] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] hover:brightness-125 hover:scale-105 cursor-help' : 'text-[#b5a794] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] hover:brightness-125 hover:scale-105 cursor-help'",
  'MapScreen unreached glyph contrast'
);
