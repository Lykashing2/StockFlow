/**
 * Icon generation script.
 * Run: node scripts/generate-icons.js
 * Requires: npm install canvas (optional — replace with any SVG→PNG converter)
 *
 * For production, use a tool like https://realfavicongenerator.net
 * or place your 512x512 PNG at public/icons/icon-512x512.png
 * and use sharp to resize: npm install sharp
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const dir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Minimal SVG icon for StockFlow (indigo package box)
function makeSVG(size) {
  const pad = Math.round(size * 0.15);
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#4f46e5"/>
  <g transform="translate(${pad}, ${pad})">
    <svg width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16.5 9.4 7.55 4.24"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29 7 12 12 20.71 7"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  </g>
</svg>`;
}

sizes.forEach((size) => {
  const svgContent = makeSVG(size);
  fs.writeFileSync(path.join(dir, `icon-${size}x${size}.svg`), svgContent);
  console.log(`Generated SVG: icon-${size}x${size}.svg`);
});

console.log('\nSVG icons generated in public/icons/');
console.log('For PNG icons, convert using: https://cloudconvert.com/svg-to-png');
console.log('Or install sharp and run: node scripts/convert-icons.js');
