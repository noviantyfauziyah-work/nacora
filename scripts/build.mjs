import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SRC_DIR = path.join(ROOT_DIR, 'src');

function main() {
  console.log('====================================================');
  console.log(' Membangun Situs Statis NACORA ke dist/ (npm run build)');
  console.log('====================================================');

  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 1. Salin isi public/ (data/, foto/, robots.txt) ke dist/
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true });
  }

  // 2. Salin src/ ke dist/src/
  if (fs.existsSync(SRC_DIR)) {
    fs.cpSync(SRC_DIR, path.join(DIST_DIR, 'src'), { recursive: true });
  }

  // 3. Salin index.html dengan path relatif agar dapat dibuka dari subfolder hosting mana pun
  let indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  indexHtml = indexHtml
    .replace('href="/src/styles/main.css"', 'href="./src/styles/main.css"')
    .replace('src="/src/main.js"', 'src="./src/main.js"');
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml, 'utf8');

  console.log('[SUKSES] Situs statis selesai dibangun di folder dist/');
  console.log('====================================================');
}

main();

