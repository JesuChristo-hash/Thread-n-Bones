const fs = require('fs');
const file = 'src/components/MapScreen.tsx';
let src = fs.readFileSync(file, 'utf8');

function replaceExact(target, replacement, label) {
  const count = src.split(target).length - 1;
  if (count !== 1) {
    throw new Error(`[${label}]: expected 1 match, found ${count}`);
  }
  src = src.replace(target, replacement);
  console.log(`Patched: ${label}`);
}

replaceExact(
  `className={\`relative flex items-center justify-center rounded-full transition-all duration-200 bg-[radial-gradient(circle,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_48%,transparent_76%)] \${
                        isBoss ? 'w-16 h-16 [&>svg]:scale-[1.7]' : 'w-13 h-13 [&>svg]:scale-[1.42]'
                      }`,
  `className={\`relative flex items-center justify-center rounded-full transition-all duration-200 bg-[radial-gradient(circle,rgba(8,4,4,0.92)_0%,rgba(8,4,4,0.68)_50%,transparent_78%)] \${
                        isBoss ? 'w-18 h-18 [&>svg]:scale-[2.05]' : 'w-15 h-15 [&>svg]:scale-[1.75]'
                      }`,
  'node button size & dark core backing'
);

replaceExact(
  `isCombat ? 'text-[#cf766a] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] hover:brightness-125 hover:scale-105 cursor-help' : 'text-[#b5a794] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] hover:brightness-125 hover:scale-105 cursor-help'`,
  `isCombat ? 'text-[#e59285] drop-shadow-[0_0_2px_#000] drop-shadow-[0_2px_5px_rgba(0,0,0,0.98)] hover:brightness-125 hover:scale-105 cursor-help' : 'text-[#d4c7b4] drop-shadow-[0_0_2px_#000] drop-shadow-[0_2px_5px_rgba(0,0,0,0.98)] hover:brightness-125 hover:scale-105 cursor-help'`,
  'unreached glyph contrast & ink shadow'
);

replaceExact(
  `isVisited
                                ? 'text-[#6a6058]/70 hover:text-[#a39480] hover:scale-105 cursor-help'`,
  `isVisited
                                ? 'text-[#8c7f70]/85 drop-shadow-[0_0_2px_#000] hover:text-[#cfc2ae] hover:scale-105 cursor-help'`,
  'visited glyph contrast'
);

fs.writeFileSync(file, src, 'utf8');
console.log('Done.');
