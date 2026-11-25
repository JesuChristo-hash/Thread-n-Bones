const fs = require('fs');
const f = 'src/App.tsx';
let s = fs.readFileSync(f, 'utf8');

const a = s.indexOf('{/* Pentagram PNG: black at rest, lit on hover/prick */}');
const b = s.indexOf('{/* Inner Core SVG */}');
if (a < 0 || b < a) throw new Error('pentagram PNG block not found');
let block = s.slice(a, b);

const rep = (from, to) => {
  if (!block.includes(from)) throw new Error('not found: ' + from);
  block = block.replace(from, () => to);
};

rep("'brightness-100 drop-shadow-[0_0_14px_rgba(239,68,68,1)]'",
    "'brightness-110 saturate-150 drop-shadow-[0_0_4px_rgba(255,120,120,1)] drop-shadow-[0_0_14px_rgba(239,68,68,1)] drop-shadow-[0_0_32px_rgba(220,38,38,0.95)]'");
rep("'brightness-0 opacity-90 group-hover:brightness-100 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.95)]'",
    "'brightness-[0.12] opacity-90 group-hover:brightness-110 group-hover:saturate-150 group-hover:opacity-100 group-hover:drop-shadow-[0_0_4px_rgba(255,120,120,1)] group-hover:drop-shadow-[0_0_14px_rgba(239,68,68,1)] group-hover:drop-shadow-[0_0_32px_rgba(220,38,38,0.95)]'");

s = s.slice(0, a) + block + s.slice(b);
fs.writeFileSync(f, s);
console.log('stronger glow; rest state now dark grey');
