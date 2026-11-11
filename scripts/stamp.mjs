// Carimba a versão em todos os imports e arquivos do site publicado, para o navegador
// nunca misturar arquivos de duas versões depois de um deploy (o GitHub Pages guarda cache por ~10 min).
// Uso (no workflow, na cópia _site): node scripts/stamp.mjs _site <versão>
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [dir, version] = process.argv.slice(2);
if (!dir || !version) { console.error('uso: node scripts/stamp.mjs <pasta> <versão>'); process.exit(1); }
const q = `?v=${version}`;
let files = 0;

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

for (const p of walk(dir)) {
  if (p.endsWith('.js') && !p.includes(`${join('assets', 'vendor')}`) && !p.includes(join('labs', 'web', ''))) {
    const src = readFileSync(p, 'utf8');
    const out = src
      .replace(/(\bfrom\s*)(['"])(\.{1,2}\/[^'"?]+?\.js)\2/g, `$1$2$3${q}$2`)
      .replace(/(\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"?]+?\.js)\2/g, `$1$2$3${q}$2`)
      .replace(/(\bimport\s+)(['"])(\.{1,2}\/[^'"?]+?\.js)\2/g, `$1$2$3${q}$2`);
    if (out !== src) { writeFileSync(p, out); files++; }
  }
}
const idx = join(dir, 'index.html');
let html = readFileSync(idx, 'utf8');
html = html
  .replace(/(src="assets\/app\.js)"/, `$1${q}"`)
  .replace(/(href="assets\/styles\.css)"/, `$1${q}"`)
  .replace('<script type="module"', `<script>window.__V = ${JSON.stringify(version)};</script>\n  <script type="module"`);
writeFileSync(idx, html);
// player.html: imports dentro do <script type="module">
const ph = join(dir, 'player.html');
try {
  const src = readFileSync(ph, 'utf8');
  writeFileSync(ph, src.replace(/(\bfrom\s*)(['"])(\.{1,2}\/[^'"?]+?\.js)\2/g, `$1$2$3${q}$2`)
    .replace('<script type="module">', `<script>window.__V = ${JSON.stringify(version)};</script>\n  <script type="module">`)
    .replace(/(href="assets\/styles\.css)"/, `$1${q}"`));
} catch { /* sem player.html */ }
console.log(`versão ${version}: ${files} módulos carimbados + index.html`);
