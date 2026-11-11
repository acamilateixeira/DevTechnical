// Grava o mini vídeo de histórias em MP4 (1280×720, 30 fps), quadro a quadro, a partir do player.
// Precisa de um servidor estático na raiz do projeto e de Playwright + ffmpeg instalados.
// Uso: node scripts/render-videos.mjs http://localhost:8765 pt id1 id2 ...
import { spawn } from 'node:child_process';
import { renameSync, mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // Playwright instalado globalmente

const [base, lang, ...ids] = process.argv.slice(2);
const FPS = 30;
mkdirSync('media/videos', { recursive: true });

async function renderOne(browser, id) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`${base}/player.html?story=${id}&lang=${lang}&capture=1`);
  await page.waitForFunction(() => window.__ready, null, { timeout: 15000 });
  const duration = await page.evaluate(() => window.__player.duration);
  const frames = Math.ceil(duration * FPS);
  const tmp = `media/videos/.${id}.${lang}.tmp.mp4`;
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', tmp]);
  const done = new Promise((res, rej) => ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg ${code}`)))));
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.__player.seek(t), f / FPS);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await done;
  const out = `media/videos/${id}.${lang}.mp4`;
  renameSync(tmp, out);
  await page.close();
  console.log(`${out}  ${duration.toFixed(1)} s  ${(statSync(out).size / 1e6).toFixed(1)} MB  (${((Date.now() - t0) / 1000).toFixed(0)} s para gravar)`);
}

const browser = await chromium.launch();
const queue = [...ids];
await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
  while (queue.length) await renderOne(browser, queue.shift());
}));
await browser.close();
