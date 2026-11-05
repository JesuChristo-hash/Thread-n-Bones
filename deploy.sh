#!/usr/bin/env bash
set -e

# 1. Lock down custom domain
mkdir -p public
echo "www.myfriendsaretulpas.com" > public/CNAME

# 2. Compile production bundle
echo "[*] Building client bundle..."
# Generate manifest of all image assets in public/
node -e "const fs = require('fs'); const files = fs.readdirSync('public', { recursive: true }).filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f)).map(f => f.replace(/\\\\/g, '/')); fs.writeFileSync('public/asset-manifest.json', JSON.stringify(files));"
npm run build

# 3. Ship static assets to gh-pages
echo "[*] Deploying dist to gh-pages..."
cd dist
git init -q
git checkout -B gh-pages -q
git add -A
git commit -m "deploy: update" -q
git push -f https://github.com/JesuChristo-hash/Sacrificial-Scales.git gh-pages
cd ..

# 4. Sync source code to origin/main
echo "[*] Syncing source code to origin/main..."
git add .
# Commit only if working tree has changes to prevent git from throwing a non-zero exit
git diff --quiet && git diff --staged --quiet || git commit -m "chore: sync stable build" -q
git push -f origin main

# 4. run this command --> " ./deploy.sh "
echo "[✓] Deployment complete."