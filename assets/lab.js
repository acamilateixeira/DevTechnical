// Motor do Laboratório: carrega o código de cada lab, deixa editar, roda num iframe isolado
// e mostra o que aconteceu em quatro painéis: tela, contadores, linha do tempo e console.

import { md, escapeHtml } from './md.js';
import { labs } from '../labs/web/index.js';
import { cats } from '../data/meta.js';
import { createAnnotator } from './gloss.js';

const BASE = new URL('..', import.meta.url).href;   // raiz do site (funciona em /DevTechnical/)
const STORE = 'devtechnical:lab:';
const MAX_ROWS = 400;

let transpiler = null;
async function getTranspiler() {
  transpiler ||= import('./vendor/ts.js');
  return transpiler;
}

const T = {
  pt: {
    labTitle: 'Laboratório', labIntro: 'Exemplos que rodam aqui no navegador. Leia o que é, aperte **Rodar**, olhe o que aconteceu e depois mude o código para ver o comportamento mudar.',
    open: 'Abrir lab', back: '← Todos os labs', what: 'O que é', watch: 'O que observar quando rodar',
    setup: 'Bastidores: o que está sendo simulado', setupHint: 'Este código prepara o "mundo" do exemplo (servidor, banco, rede falsos). Pode ler e mexer também.',
    main: 'Código principal (edite à vontade)', run: '▶ Rodar', stop: '■ Parar', restore: 'Restaurar original',
    shortcut: 'Ctrl/⌘ + Enter também roda.', preview: 'Tela', stats: 'Contadores', timeline: 'Linha do tempo: o que rodou, onde e quando',
    console: 'Console', tests: 'Testes', empty: 'Aperte Rodar para ver o resultado.', time: 'ms',
    tryTitle: 'Experimente mudar', related: 'Perguntas da entrevista sobre isso', compiling: 'Preparando…',
    running: 'Rodando…', done: 'Terminou.', stopped: 'Parado.', more: (n) => `+${n} eventos não mostrados`,
    edited: 'editado', compileError: 'Erro de sintaxe', runtimeError: 'Erro ao rodar',
    ready: 'Pronto: agora use a tela acima ↑',
    nodeTitle: 'Para rodar no seu computador (Node.js)', seeCode: 'ver código',
    storyTitle: '😂 A história do event loop, em forma de conversa', storyBy: (a) => `por ${a}`,
    nodeIntro: 'Estes rodam de verdade no Node 22.13+: servidor HTTP, threads, sinais do sistema e banco SQLite. Clone o repositório e rode no terminal; cada arquivo explica o que acontece. Sem a flag mostrada, você vê o problema; com ela, a correção (ou o contrário, quando a flag começa com `--sem`).',
  },
  en: {
    labTitle: 'Lab', labIntro: 'Examples that run right here in the browser. Read what it is, press **Run**, look at what happened, then change the code and watch the behavior change.',
    open: 'Open lab', back: '← All labs', what: 'What it is', watch: 'What to watch when it runs',
    setup: 'Behind the scenes: what is being simulated', setupHint: 'This code sets up the example\'s "world" (fake server, database, network). You can read and edit it too.',
    main: 'Main code (edit freely)', run: '▶ Run', stop: '■ Stop', restore: 'Restore original',
    shortcut: 'Ctrl/⌘ + Enter runs it too.', preview: 'Screen', stats: 'Counters', timeline: 'Timeline: what ran, where, and when',
    console: 'Console', tests: 'Tests', empty: 'Press Run to see the result.', time: 'ms',
    tryTitle: 'Try changing', related: 'Interview questions about this', compiling: 'Preparing…',
    running: 'Running…', done: 'Finished.', stopped: 'Stopped.', more: (n) => `+${n} events not shown`,
    edited: 'edited', compileError: 'Syntax error', runtimeError: 'Runtime error',
    ready: 'Ready: now use the screen above ↑',
    nodeTitle: 'Run on your computer (Node.js)', seeCode: 'see code',
    storyTitle: '😂 The event loop story, as a conversation (in Portuguese)', storyBy: (a) => `by ${a}`,
    nodeIntro: 'These run for real on Node 22.13+: HTTP server, threads, OS signals, and a SQLite database. Clone the repo and run them in a terminal; each file explains what happens. Without the flag shown you see the problem; with it, the fix (or the reverse when the flag starts with `--sem`).',
  },
};

const sources = new Map();
async function source(lab, file) {
  const key = `${lab.id}/${file}`;
  if (!sources.has(key)) {
    sources.set(key, fetch(new URL(`labs/web/${lab.id}/${file}`, BASE)).then((r) => {
      if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
      return r.text();
    }));
  }
  return sources.get(key);
}
const saved = (lab, file) => { try { return localStorage.getItem(STORE + lab.id + ':' + file); } catch { return null; } };
const persist = (lab, file, v) => { try { localStorage.setItem(STORE + lab.id + ':' + file, v); } catch { /* sem storage */ } };
const forget = (lab, file) => { try { localStorage.removeItem(STORE + lab.id + ':' + file); } catch { /* sem storage */ } };

/* ---------- índice ---------- */

export function renderLabIndex(view, { lang, L }) {
  const t = T[lang];
  const groups = Object.keys(cats).map((c) => [c, labs.filter((l) => l.cat === c)]).filter(([, l]) => l.length);
  view.innerHTML = `
    <section class="lab-head">
      <h1>${t.labTitle}</h1>
      ${md(t.labIntro)}
    </section>
    ${groups.map(([c, list]) => `
      <h2 class="lab-group">${escapeHtml(L(cats[c]))}</h2>
      <div class="lab-cards">${list.map((l) => `
        <a class="lab-card" href="#/lab/${l.id}">
          <span class="lab-kind">${l.kind === 'react' ? 'React' : 'JavaScript'}</span>
          <strong>${escapeHtml(L(l.title))}</strong>
          <span>${escapeHtml(L(l.summary))}</span>
        </a>`).join('')}
      </div>`).join('')}
    <h2 class="lab-group">${t.nodeTitle}</h2>
    <div class="panel">
      ${md(t.nodeIntro)}
      <ul class="node-labs">${NODE_LABS.map(([file, args, txt]) => `
        <li><code>node labs/node/${file}${args ? ' ' + args : ''}</code><span>${escapeHtml(txt[lang])}</span>
          <a href="https://github.com/acamilateixeira/DevTechnical/blob/main/labs/node/${file}" target="_blank" rel="noopener">${t.seeCode}</a></li>`).join('')}
      </ul>
    </div>`;
}

const NODE_LABS = [
  ['01-event-loop-node.cjs', '', { pt: 'Ordem entre nextTick, Promises, setTimeout, I/O e setImmediate.', en: 'Order of nextTick, Promises, setTimeout, I/O, and setImmediate.' }],
  ['02-bloqueio-event-loop.mjs', '--worker', { pt: 'Um cálculo pesado trava o servidor inteiro; worker_threads destrava.', en: 'A heavy computation freezes the whole server; worker_threads frees it.' }],
  ['03-streams-backpressure.mjs', '--pipeline', { pt: 'Memória explodindo sem backpressure vs estável com pipeline.', en: 'Memory blowing up without backpressure vs stable with pipeline.' }],
  ['04-graceful-shutdown.mjs', '--sem-graceful', { pt: 'Um deploy (SIGTERM) com e sem graceful shutdown.', en: 'A deploy (SIGTERM) with and without graceful shutdown.' }],
  ['05-outbox-sqlite.mjs', '--cair-relay', { pt: 'Outbox e consumidor idempotente com SQLite de verdade.', en: 'Outbox and idempotent consumer with a real SQLite database.' }],
];

/* ---------- página do lab ---------- */

export async function renderLab(view, id, ctx) {
  const { lang, L, questions } = ctx;
  const t = T[lang];
  const lab = labs.find((l) => l.id === id);
  if (!lab) { view.innerHTML = `<p class="empty"><a href="#/lab">${t.back}</a></p>`; return; }

  const related = (lab.questions || []).map((qid) => questions.find((q) => q.id === qid)).filter(Boolean);
  const ann = createAnnotator(lang, { inline: ctx.gloss });
  view.innerHTML = `
    <p><a href="#/lab" class="back">${t.back}</a></p>
    <section class="lab-head">
      <span class="lab-kind">${lab.kind === 'react' ? 'React' : 'JavaScript'} · ${escapeHtml(L(cats[lab.cat]))}</span>
      <h1>${escapeHtml(L(lab.title))}</h1>
    </section>
    <div class="lab-text">
      <div class="panel"><h3>${t.what}</h3>${md(L(lab.what), ann)}</div>
      <div class="panel anchor"><h3>${t.watch}</h3>${md(L(lab.watch), ann)}</div>
      ${lab.story ? `<details class="panel story" id="story-box"><summary><h3 style="display:inline">${t.storyTitle}</h3> <span class="hint">${t.storyBy(escapeHtml(lab.story.author))}</span></summary><div id="story"></div></details>` : ''}
    </div>

    ${lab.setup ? `
    <details class="panel lab-editor-box" id="setup-box">
      <summary><h3 style="display:inline">${t.setup}</h3> <span class="edited" data-for="setup"></span></summary>
      <p class="hint">${t.setupHint}</p>
      <textarea class="code-editor" id="ed-setup" spellcheck="false" aria-label="${t.setup}"></textarea>
      <div class="row"><button type="button" class="btn ghost" data-restore="setup">${t.restore}</button></div>
    </details>` : ''}

    <div class="panel lab-editor-box">
      <h3>${t.main} <span class="edited" data-for="main"></span></h3>
      <textarea class="code-editor" id="ed-main" spellcheck="false" aria-label="${t.main}"></textarea>
      <div class="row">
        <button type="button" class="btn primary" id="run">${t.run}</button>
        <button type="button" class="btn ghost" id="stop">${t.stop}</button>
        <button type="button" class="btn ghost" data-restore="main">${t.restore}</button>
        <span class="hint" id="status" aria-live="polite">${t.shortcut}</span>
      </div>
    </div>

    <div class="lab-out">
      <div class="panel" id="preview-box" ${lab.preview ? '' : 'hidden'}>
        <h3>${t.preview}</h3>
        <div id="frame-slot" class="frame-slot"></div>
      </div>
      <div class="panel" id="stats-box" hidden><h3>${t.stats}</h3><div class="stats" id="stats"></div></div>
      <div class="panel" id="tests-box" hidden><h3>${t.tests}</h3><ul class="tests" id="tests"></ul></div>
      <div class="panel" id="timeline-box" hidden><h3>${t.timeline}</h3><div class="timeline-wrap" id="timeline"></div></div>
      <div class="panel"><h3>${t.console}</h3><pre class="lab-console" id="console"><span class="muted">${t.empty}</span></pre></div>
    </div>

    <div class="panel followup"><h3>${t.tryTitle}</h3><ol>${(lab.try || []).map((x) => `<li>${md(L(x), ann).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ol></div>
    ${related.length ? `<div class="panel"><h3>${t.related}</h3><ul>${related.map((q) =>
      `<li><a href="#/q/${q.id}">${escapeHtml(L(q.q))}</a></li>`).join('')}</ul></div>` : ''}`;

  if (lab.story) {
    source(lab, lab.story.file).then((txt) => { const el = view.querySelector('#story'); if (el) el.innerHTML = md(txt, createAnnotator(lang, { inline: false })); });
  }

  // Carrega o código (versão editada, se houver).
  const files = { main: lab.main, ...(lab.setup ? { setup: lab.setup } : {}) };
  const editors = {};
  for (const [slot, file] of Object.entries(files)) {
    const ed = view.querySelector(`#ed-${slot}`);
    editors[slot] = ed;
    const original = await source(lab, file);
    const mine = saved(lab, file);
    ed.value = mine ?? original;
    const mark = () => { view.querySelector(`.edited[data-for="${slot}"]`).textContent = ed.value !== original ? `· ${t.edited}` : ''; };
    mark();
    autosize(ed);
    ed.addEventListener('input', () => { persist(lab, file, ed.value); mark(); autosize(ed); });
    ed.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const { selectionStart: s, selectionEnd: en } = ed;
        ed.setRangeText('  ', s, en, 'end');
        ed.dispatchEvent(new Event('input'));
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
    });
    view.querySelector(`[data-restore="${slot}"]`).addEventListener('click', () => {
      forget(lab, file); ed.value = original; mark(); autosize(ed);
    });
  }

  const runner = createRunner(view, lab, t);
  const run = async () => {
    runner.status(t.compiling);
    const { transpile } = await getTranspiler();
    const code = [editors.setup?.value, editors.main.value].filter(Boolean).join('\n\n');
    const out = transpile(code);
    if (out.errors.length) {
      runner.reset();
      runner.log('error', [`${t.compileError}:\n${out.errors.join('\n')}`]);
      runner.status(t.compileError);
      return;
    }
    runner.start(out.code);
  };
  view.querySelector('#run').addEventListener('click', run);
  view.querySelector('#stop').addEventListener('click', () => runner.stop());
  ctx.onLeave(() => runner.stop());
}

function autosize(ed) {
  ed.style.height = 'auto';
  ed.style.height = Math.min(Math.max(ed.scrollHeight + 4, 120), 720) + 'px';
}

/* ---------- execução isolada ---------- */

function createRunner(view, lab, t) {
  const $ = (s) => view.querySelector(s);
  let frame = null;
  let runId = 0;
  let rows = 0;
  let hidden = 0;
  let lanes = [...(lab.lanes || [])];
  const stats = new Map();

  const status = (s) => { $('#status').textContent = s; };

  function reset() {
    rows = 0; hidden = 0; lanes = [...(lab.lanes || [])]; stats.clear();
    $('#console').innerHTML = '';
    $('#stats').innerHTML = ''; $('#stats-box').hidden = true;
    $('#tests').innerHTML = ''; $('#tests-box').hidden = true;
    $('#timeline').innerHTML = ''; $('#timeline-box').hidden = true;
  }

  function log(level, args) {
    const line = document.createElement('div');
    line.className = `log ${level}`;
    line.textContent = args.join(' ');
    $('#console').append(line);
  }

  function header() {
    return `<div class="tl-row tl-head" style="--cols:${lanes.length}"><span class="tl-t">${t.time}</span>${lanes.map((l) => `<span>${escapeHtml(l)}</span>`).join('')}</div>`;
  }
  function trace({ lane, text, t: ms, kind }) {
    const box = $('#timeline');
    $('#timeline-box').hidden = false;
    if (!lanes.includes(lane)) { lanes.push(lane); box.innerHTML = ''; rows = 0; }
    if (!rows) box.innerHTML = header();
    if (rows >= MAX_ROWS) { hidden++; box.querySelector('.tl-more')?.remove(); box.insertAdjacentHTML('beforeend', `<p class="hint tl-more">${t.more(hidden)}</p>`); return; }
    const i = lanes.indexOf(lane);
    const cells = lanes.map((_, j) => (j === i ? `<span class="tl-ev ${kind || ''}" data-lane="${i % 6}">${escapeHtml(text)}</span>` : '<span></span>')).join('');
    box.insertAdjacentHTML('beforeend', `<div class="tl-row" style="--cols:${lanes.length}"><span class="tl-t">${ms.toFixed(0)}</span>${cells}</div>`);
    rows++;
  }
  function stat({ name, value }) {
    $('#stats-box').hidden = false;
    stats.set(name, value);
    $('#stats').innerHTML = [...stats].map(([k, v]) =>
      `<div class="stat-tile"><span>${escapeHtml(k)}</span><strong>${escapeHtml(String(v))}</strong></div>`).join('');
  }
  function testResult({ name, ok, error }) {
    $('#tests-box').hidden = false;
    $('#tests').insertAdjacentHTML('beforeend',
      `<li class="${ok ? 'pass' : 'fail'}">${ok ? '✓' : '✗'} ${escapeHtml(name)}${error ? `<pre>${escapeHtml(error)}</pre>` : ''}</li>`);
  }

  function onMessage(e) {
    if (!frame || e.source !== frame.contentWindow || e.data?.runId !== runId) return;
    const m = e.data;
    if (m.type === 'log') log(m.level, m.args);
    else if (m.type === 'trace') trace(m);
    else if (m.type === 'stat') stat(m);
    else if (m.type === 'test') testResult(m);
    else if (m.type === 'error') { log('error', [`${t.runtimeError}: ${m.message}`]); status(t.runtimeError); }
    else if (m.type === 'done') status(t.done);
    else if (m.type === 'ready') status(t.ready);
    else if (m.type === 'height' && lab.preview) frame.style.height = Math.min(Math.max(m.h, 80), 900) + 'px';
  }
  window.addEventListener('message', onMessage);

  function stop() {
    frame?.remove(); frame = null; runId++;
    status(t.stopped);
  }

  function start(code) {
    stop(); reset();
    runId++;
    frame = document.createElement('iframe');
    frame.className = 'lab-frame';
    frame.title = t.preview;
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-modals');
    frame.srcdoc = bootstrap(lab, runId, code);
    $('#frame-slot').append(frame);
    status(t.running);
  }

  return { start, stop, reset, log, status };
}

// HTML do iframe: importmap para `import ... from 'react'`, helpers globais (log, trace, stat,
// sleep, test/expect) e, no lab de event loop, a marcação de cada callback como síncrono,
// microtask ou macrotask.
function bootstrap(lab, runId, code) {
  const react = new URL('assets/vendor/react.js', BASE).href;
  const theme = getComputedStyle(document.documentElement);
  const v = (n) => theme.getPropertyValue(n).trim();
  const payload = JSON.stringify({ runId, code, kind: lab.kind, instrument: lab.instrument || null, strict: !!lab.strict });
  return `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap">${JSON.stringify({ imports: { react } })}</script>
<style>
  :root { color-scheme: light dark; }
  body { margin: 12px; font: 15px/1.5 system-ui, sans-serif; color: ${v('--ink')}; background: ${v('--surface')}; }
  button, input, select { font: inherit; }
  button { padding: 6px 12px; border-radius: 8px; border: 1px solid ${v('--line')}; background: ${v('--surface-2')}; color: inherit; cursor: pointer; margin: 2px; }
  input, select { padding: 6px 8px; border-radius: 8px; border: 1px solid ${v('--line')}; background: ${v('--bg')}; color: inherit; }
  .bad { color: ${v('--bad')}; font-weight: 600; } .good { color: ${v('--good')}; font-weight: 600; }
  .flash { animation: flash .6s ease-out; }
  @keyframes flash { from { background: ${v('--accent')}55; } to { background: transparent; } }
  .card { border: 1px solid ${v('--line')}; border-radius: 10px; padding: 8px 10px; margin: 6px 0; }
  .muted { color: ${v('--muted')}; } code { font-family: ui-monospace, monospace; }
</style></head><body><div id="root"></div>
<script type="module">
const P = ${payload.replace(/</g, '\\u003c')};
const send = (m) => parent.postMessage({ runId: P.runId, ...m }, '*');
const t0 = performance.now();
const fmt = (a) => { if (typeof a === 'string') return a; if (a instanceof Error) return a.message; try { return JSON.stringify(a); } catch { return String(a); } };

// --- event loop: marca em que fase cada coisa rodou
let phase = 'sync';
const laneOf = { sync: 'Síncrono (call stack)', micro: 'Microtasks', macro: 'Macrotasks (timers)' };
if (P.instrument === 'eventloop') {
  const st = window.setTimeout, si = window.setInterval;
  const wrap = (fn) => function (...a) { const prev = phase; phase = 'macro'; try { return fn.apply(this, a); } finally { phase = prev === 'macro' ? 'macro' : 'micro'; } };
  window.setTimeout = (fn, ms, ...a) => st(wrap(fn), ms, ...a);
  window.setInterval = (fn, ms, ...a) => si(wrap(fn), ms, ...a);
}
window.__endSync = () => { if (phase === 'sync') phase = 'micro'; };

for (const level of ['log', 'info', 'warn', 'error']) {
  const orig = console[level].bind(console);
  console[level] = (...args) => {
    orig(...args);
    let text = args.map(fmt).join(' ');
    if (level === 'error' && typeof args[0] === 'string' && args[0].includes('%s')) {
      let i = 1; text = args[0].replace(/%s/g, () => fmt(args[i++] ?? '')).split('\\n')[0];
    }
    send({ type: 'log', level, args: [text] });
    if (P.instrument === 'eventloop' && level === 'log') trace(laneOf[phase], text);
  };
}
window.log = (...a) => console.log(...a);
window.trace = (lane, text, kind) => send({ type: 'trace', lane, text: String(text), kind, t: performance.now() - t0 });
const trace = window.trace;
const counters = {};
window.stat = (name, value) => { counters[name] = value; send({ type: 'stat', name, value }); };
window.stat.inc = (name, by = 1) => window.stat(name, (counters[name] || 0) + by);
window.stat.get = (name) => counters[name] || 0;
window.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
window.rand = (min, max) => Math.round(min + Math.random() * (max - min));
window.uuid = () => crypto.randomUUID();

// --- mini test runner (estilo Jest)
const tests = [];
window.test = window.it = (name, fn) => tests.push({ name, fn });
window.describe = (name, fn) => fn();
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
window.expect = (v) => ({
  toBe: (x) => { if (!Object.is(v, x)) throw new Error('esperado ' + fmt(x) + ', recebido ' + fmt(v)); },
  toEqual: (x) => { if (!eq(v, x)) throw new Error('esperado ' + fmt(x) + ',\\nrecebido ' + fmt(v)); },
  toBeTruthy: () => { if (!v) throw new Error('esperado valor verdadeiro, recebido ' + fmt(v)); },
  toThrow: () => { try { v(); } catch { return; } throw new Error('esperado que lançasse erro'); },
});

window.addEventListener('error', (e) => send({ type: 'error', message: e.message }));
window.addEventListener('unhandledrejection', (e) => send({ type: 'error', message: fmt(e.reason) }));
new ResizeObserver(() => send({ type: 'height', h: document.documentElement.scrollHeight })).observe(document.body);

const React = await import('react');
window.React = React.default ?? React;
try {
  const url = URL.createObjectURL(new Blob([P.code + '\\n;window.__endSync();'], { type: 'text/javascript' }));
  const mod = await import(url);
  if (P.kind === 'react') {
    const App = mod.default;
    if (typeof App !== 'function') throw new Error('o código precisa de "export default function App()"');
    const el = React.createElement(App);
    React.createRoot(document.getElementById('root')).render(P.strict ? React.createElement(React.StrictMode, null, el) : el);
    send({ type: 'ready' });
  }
  for (const tc of tests) {
    try { await tc.fn(); send({ type: 'test', name: tc.name, ok: true }); }
    catch (err) { send({ type: 'test', name: tc.name, ok: false, error: err.message }); }
  }
  if (typeof mod.run === 'function') await mod.run();
  if (P.kind !== 'react') setTimeout(() => send({ type: 'done' }), 0);
} catch (err) {
  send({ type: 'error', message: err.message });
}
<\/script></body></html>`;
}
