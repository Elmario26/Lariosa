/**
 * React Navigation 7 ships platform-specific asset names (e.g. back-icon@3x.android.png).
 * Metro may still resolve back-icon@3x.png — copy Android variants as generic fallbacks.
 */
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-navigation',
  'elements',
  'lib',
  'module',
  'assets'
);

const pairs = [
  ['back-icon@1x.android.png', 'back-icon@1x.png'],
  ['back-icon@2x.android.png', 'back-icon@2x.png'],
  ['back-icon@3x.android.png', 'back-icon@3x.png'],
  ['back-icon@4x.android.png', 'back-icon@4x.png'],
  ['clear-icon@1x.png', 'clear-icon@1x.png'],
  ['search-icon@1x.android.png', 'search-icon@1x.png'],
  ['search-icon@2x.android.png', 'search-icon@2x.png'],
  ['search-icon@3x.android.png', 'search-icon@3x.png'],
  ['search-icon@4x.android.png', 'search-icon@4x.png'],
];

if (!fs.existsSync(assetsDir)) {
  console.warn('[patch-navigation-assets] @react-navigation/elements assets not found, skipping.');
  process.exit(0);
}

let patched = 0;
for (const [src, dest] of pairs) {
  const srcPath = path.join(assetsDir, src);
  const destPath = path.join(assetsDir, dest);
  if (!fs.existsSync(srcPath)) continue;
  if (fs.existsSync(destPath)) continue;
  fs.copyFileSync(srcPath, destPath);
  patched++;
}

if (patched > 0) {
  console.log(`[patch-navigation-assets] Created ${patched} fallback asset(s).`);
}
