import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for ESM directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 🎨 CONFIGURATION ---
const CONFIG = {
    size: 512,              // Standard icon size
    bgColor: '#1b5e20',     // Deep Forest Green
    textColor: '#d32f2f',   // Vibrant Red
    strokeColor: '#ffffff', // White Outline
    strokeWidth: 15,        // Thickness of outline
    letter: 'T'
};

// --- 🖌️ SVG TEMPLATE ---
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

// --- 💾 SAVE FILE ---
// We save to 'public/assets' because that is where Vite serves static files from
const outputDir = path.join(__dirname, 'public', 'assets');
const outputPath = path.join(outputDir, 'icon.svg');

// 1. Ensure directory exists
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

// 2. Write the file
fs.writeFileSync(outputPath, svgContent);

console.log(`✅ Success! Icon generated at: ${outputPath}`);
console.log(`🎨 Preview: Dark Green Box, Red 'T', White Outline`);