/**
 * Convert SVG icons to PNG using sharp.
 * Run: node scripts/convert-icons.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const dir = path.join(__dirname, '../public/icons');

async function main() {
  for (const size of sizes) {
    const svgPath = path.join(dir, `icon-${size}x${size}.svg`);
    const pngPath = path.join(dir, `icon-${size}x${size}.png`);
    if (!fs.existsSync(svgPath)) {
      console.warn(`Missing SVG: ${svgPath}`);
      continue;
    }
    await sharp(svgPath).png().toFile(pngPath);
    console.log(`Converted: icon-${size}x${size}.png`);
  }
  console.log('Done!');
}

main().catch(console.error);
