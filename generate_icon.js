// ./generate_icon.js 

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  size: 512,
  bgColor: '#1b5e20',
  textColor: '#d32f2f',
  strokeColor: '#ffffff',
  strokeWidth: 15,
  letter: 'T'
};

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CONFIG.size} ${CONFIG.size}">
  <!-- Background: Dark Green with Rounded Corners -->
  <rect width="${CONFIG.size}" height="${CONFIG.size}" rx="100" fill="${CONFIG.bgColor}" />

  <!-- Text: Red T with White Stroke -->
  <!-- 'paint-order: stroke' ensures the white outline doesn't eat into the red letter -->
  <text 
    x="50%" 
    y="55%" 
    font-family="Arial, Helvetica, sans-serif" 
    font-weight="900" 
    font-size="400" 
    fill="${CONFIG.textColor}" 
    stroke="${CONFIG.strokeColor}" 
    stroke-width="${CONFIG.strokeWidth}" 
    paint-order="stroke"
    text-anchor="middle" 
    dominant-baseline="middle"
  >${CONFIG.letter}</text>
</svg>
`.trim();

const outputDir = path.join(__dirname, 'public', 'assets');
const outputPath = path.join(outputDir, 'icon.svg');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, svgContent);

console.log(`✅ Success! Icon generated at: ${outputPath}`);
console.log(`🎨 Preview: Dark Green Box, Red 'T', White Outline`);