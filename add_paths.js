import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSIONS = ['.js', '.jsx', '.ts', '.css'];

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

function prependPath(filePath) {
  const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
  const ext = path.extname(filePath);

  let commentStart = '//';
  let commentEnd = '';

  if (ext === '.css') {
    commentStart = '/*';
    commentEnd = ' */';
  }

  const commentLine = `${commentStart} ./${relativePath} ${commentEnd}`;

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    if (content.startsWith(commentStart + ' ./')) {
      console.log(`Skipping (Already labeled): ${relativePath}`);
      return;
    }

    if (content.startsWith('#!')) {
      const lines = content.split('\n');
      const firstLine = lines.shift();
      const newContent = `${firstLine}\n${commentLine}\n${lines.join('\n')}`;
      fs.writeFileSync(filePath, newContent);
    } else {
      const newContent = `${commentLine}\n${content}`;
      fs.writeFileSync(filePath, newContent);
    }

    console.log(`✅ Tagged: ${relativePath}`);
  } catch (e) {
    console.error(`❌ Error reading ${relativePath}:`, e.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkDir(fullPath);
      }
    } else {
      if (EXTENSIONS.includes(path.extname(file))) {

        if (file !== 'add_paths.js') {
          prependPath(fullPath);
        }
      }
    }
  }
}

console.log("📂 Starting Path Tagger...");
walkDir(__dirname);
console.log("🎉 Done.");