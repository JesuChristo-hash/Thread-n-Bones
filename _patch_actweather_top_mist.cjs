const fs = require('fs');
const path = require('path');

function findFile(dir, targetName) {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(full, targetName);
      if (found) return found;
    } else if (entry.name.toLowerCase() === targetName.toLowerCase()) {
      return full;
    }
  }
  return null;
}

const file = findFile('src', 'ActWeather.tsx');
if (!file) {
  console.error('Could not find ActWeather.tsx under src/');
  process.exit(1);
}

let src = fs.readFileSync(file, 'utf8');

// Replace bottom-anchored mist blocks used for Acts 2 & 3 while preserving Act 1 bottom mist
const bottomMistRegex = /(<div[^>]*className=\{?`[^`]*bottom-\[-(?:8|12)%\][^`]*`\}?[^>]*>[\s\S]*?<\/div>)/g;
const matches = [...src.matchAll(bottomMistRegex)];

if (matches.length === 0) {
  console.error(`No bottom mist blocks matched in ${file}. Dumping mist lines for inspection:`);
  src.split('\n').forEach((line, idx) => {
    if (/mist|bottom-|top-|act\s*===?\s*[123]/i.test(line)) {
      console.log(`${idx + 1}: ${line}`);
    }
  });
  process.exit(1);
}

let updated = src;
for (const m of matches) {
  const block = m[0];
  if (/weatherAct\s*===?\s*1/.test(block) && !/weatherAct\s*===?\s*2|weatherAct\s*===?\s*3|weatherAct\s*>=\s*2/.test(block)) {
    continue;
  }
  const topBlock = block
    .replace(/bottom-\[-12%\]\s*h-\[58%\]/g, 'top-[-12%] h-[52%]')
    .replace(/bottom-\[-8%\]\s*h-\[46%\]/g, 'top-[-8%] h-[42%]')
    .replace(/at 30% 80%/g, 'at 32% 18%')
    .replace(/at 72% 85%/g, 'at 70% 14%');
  updated = updated.replace(block, topBlock);
}

if (updated === src) {
  console.error(`Matched mist blocks in ${file}, but none needed replacement.`);
  process.exit(1);
}

fs.writeFileSync(file, updated, 'utf8');
console.log(`Updated Acts 2 & 3 mist to top in ${file}`);
