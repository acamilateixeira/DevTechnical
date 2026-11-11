// Histórias: parser do formato, renderização em "chat", página de histórias e gaveta.
//
// Formato do arquivo (.pt.md / .en.md):
//   # 🍞 Título
//   > Cenário em uma linha (onde a história acontece)
//   ## 🎭 Elenco            → "- 🗣️ **Nome** · `código` · quem é, em linguagem simples"
//   ## 🎬 Cena 1 · Título   → falas "**Nome** _(rubrica)_: fala" e avisos "> 🚨 texto"
//   ## 💻 ...               → lado técnico: código e tabelas (markdown livre)
//   ## 🎤 ...               → a resposta pronta para a entrevista
//   ## qualquer outro título → extra técnico (markdown livre)
// O emoji do título da seção decide o tipo, então o mesmo formato vale em PT e EN.

import { md, escapeHtml } from './md.js';
import { createAnnotator } from './gloss.js';
import { labs } from '../labs/web/index.js';
import { storyIds } from '../data/stories/index.js';

const T = {
  pt: {
    cast: 'Quem é quem', castHint: 'cada personagem é um pedaço de código ou um termo técnico',
    tech: 'Agora o lado técnico', interview: 'Pra falar na entrevista', by: (a) => `história de ${a}`,
    seeLab: '▶ Ver rodando no Laboratório', train: '🎤 Treinar a pergunta', close: 'Fechar', all: 'Todas as histórias',
    open: '😂 Não entendeu? Leia a história', openLab: '😂 Ler a história deste lab', pageTitle: 'Histórias',
    pageIntro: 'Cada conceito vira uma conversa engraçada entre personagens. Primeiro você entende a ideia, depois vê **quem é quem no código**, e no fim leva a frase pronta para a entrevista. Ordem que funciona: **história → laboratório → entrevista**.',
    labs: 'Histórias com laboratório', questions: 'Histórias de perguntas', fail: 'Não consegui carregar a história.',
  },
  en: {
    cast: 'Who is who', castHint: 'each character is a piece of code or a technical term',
    tech: 'Now the technical side', interview: 'What to say in the interview', by: (a) => `story by ${a}`,
    seeLab: '▶ See it running in the Lab', train: '🎤 Practice the question', close: 'Close', all: 'All stories',
    open: '😂 Lost? Read the story', openLab: '😂 Read this lab\'s story', pageTitle: 'Stories',
    pageIntro: 'Each concept becomes a funny conversation between characters. First you get the idea, then you see **who is who in the code**, and you finish with the line to say in the interview. The order that works: **story → lab → interview**.',
    labs: 'Stories with a lab', questions: 'Question stories', fail: 'Could not load the story.',
  },
};

/* ---------- registro: toda história tem um id ---------- */

// Histórias de lab: "lab-<id>". Histórias de pergunta: o id da pergunta.
export const stories = [
  ...labs.filter((l) => l.story).map((l) => ({
    id: `lab-${l.id}`, base: `labs/web/${l.id}/story`, lab: l.id, cat: l.cat, author: l.story.author, questions: l.questions || [],
  })),
  ...[...storyIds].map((id) => ({ id, base: `data/stories/${id}`, lab: null, questions: [id] })),
];

/** História para uma pergunta: a própria, senão a do lab ligado a ela. */
export function storyForQuestion(qid) {
  return stories.find((s) => !s.lab && s.id === qid) || stories.find((s) => s.lab && s.questions.includes(qid)) || null;
}
export const storyForLab = (labId) => stories.find((s) => s.lab === labId) || null;

const cache = new Map();
function fetchText(path) {
  if (!cache.has(path)) cache.set(path, fetch(path).then((r) => { if (!r.ok) throw new Error(path); return r.text(); }));
  return cache.get(path);
}
export const loadStory = (s, lang) => fetchText(`${s.base}.${lang}.md`).catch(() => fetchText(`${s.base}.pt.md`)).then(parseStory);

/* ---------- parser ---------- */

const SPEECH = /^\*\*(.+?)\*\*(?:\s*_\((.+?)\)_)?\s*:\s*(.+)$/;
const CAST = /^-\s+(\S+)\s+\*\*(.+?)\*\*\s*·\s*(?:(.*?)\s*·\s*)?(.+)$/;

export function parseStory(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const story = { title: '', setting: '', cast: [], scenes: [], tech: [], interview: '' };
  let section = null;
  for (const line of lines) {
    if (!story.title && line.startsWith('# ')) { story.title = line.slice(2).trim(); continue; }
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim();
      const kind = title.startsWith('🎭') ? 'cast' : title.startsWith('🎬') ? 'scene' : title.startsWith('🎤') ? 'interview' : 'tech';
      section = { kind, title: title.replace(/^\S+\s*/, ''), lines: [] };
      if (kind === 'scene') story.scenes.push(section);
      else if (kind === 'tech') story.tech.push(section);
      else story[kind === 'cast' ? '_cast' : '_interview'] = section;
      continue;
    }
    if (!section) { if (line.startsWith('> ') && !story.setting) story.setting = line.slice(2).trim(); continue; }
    section.lines.push(line);
  }
  for (const l of story._cast?.lines || []) {
    const m = l.match(CAST);
    if (m) story.cast.push({ emoji: m[1], name: m[2], code: m[3] || '', who: m[4] });
  }
  story.interview = (story._interview?.lines || []).join('\n').trim();
  delete story._cast; delete story._interview;
  return story;
}

/* ---------- render ---------- */

const COLORS = 8;
// Código (com crase) vira etiqueta monoespaçada; termo técnico em palavras vira etiqueta normal.
const chip = (code) => (code.includes('`') ? `<span class="st-code">${inline(code)}</span>` : `<span class="st-term">${inline(code)}</span>`); // classes .c0 ... .c7
const inline = (s) => md(s).replace(/^<p>|<\/p>\s*$/g, '').replace(/(^|\s)_\((.+?)\)_/g, '$1<em class="st-dir">($2)</em>');

function sceneHtml(scene, who) {
  const out = [];
  let buf = [];
  const flush = () => { if (buf.join('').trim()) out.push(`<div class="st-note">${md(buf.join('\n'))}</div>`); buf = []; };
  for (const line of scene.lines) {
    const m = line.match(SPEECH);
    if (m) {
      flush();
      const c = who(m[1]);
      out.push(`<div class="st-line ${c ? `c${c.i % COLORS}` : 'cx'}">
        <span class="st-ava" aria-hidden="true">${c ? c.emoji : '💬'}</span>
        <div class="st-bubble">
          <div class="st-who"><strong>${inline(m[1])}</strong>${c?.code ? ` ${chip(c.code)}` : ''}${m[2] ? ` <em>(${inline(m[2])})</em>` : ''}</div>
          <div class="st-say">${inline(m[3])}</div>
        </div></div>`);
    } else if (line.startsWith('> ')) {
      flush();
      out.push(`<div class="st-banner">${inline(line.slice(2))}</div>`);
    } else buf.push(line);
  }
  flush();
  return `<section class="st-scene"><h3 class="st-scene-title">🎬 ${inline(scene.title)}</h3>${out.join('')}</section>`;
}

export function findCast(story, name) {
  const clean = (x) => x.replace(/`/g, '');
  const n = clean(name);
  let best = null;
  story.cast.forEach((c, i) => {
    const cn = clean(c.name);
    if (n === cn || n.startsWith(cn + ' ')) if (!best || cn.length > clean(best.name).length) best = { ...c, i };
  });
  return best;
}

export function castHtml(story, lang, title) {
  const t = T[lang];
  if (!story.cast.length) return '';
  return `
    <section class="st-cast">
      <h3>🎭 ${title || t.cast} <span class="hint">· ${t.castHint}</span></h3>
      <ul>${story.cast.map((c, i) => `
        <li class="c${i % COLORS}"><span class="st-ava" aria-hidden="true">${c.emoji}</span>
          <div><strong>${inline(c.name)}</strong>${c.code ? ` ${chip(c.code)}` : ''}<span class="st-cast-who">${inline(c.who)}</span></div></li>`).join('')}
      </ul>
    </section>`;
}

export function storyHtml(story, lang, meta = {}) {
  const t = T[lang];
  const ann = createAnnotator(lang, { inline: false });
  // A fala pode ser de uma variação do personagem ("Carteiro do ERP" usa a cor do "Carteiro").
  const who = (name) => findCast(story, name);
  const links = [
    meta.lab ? `<a class="btn ghost" href="#/lab/${meta.lab}">${t.seeLab}</a>` : '',
    meta.question ? `<a class="btn ghost" href="#/q/${meta.question}">${t.train}</a>` : '',
  ].join('');
  return `
  <article class="st">
    <header class="st-head">
      <h2>${inline(story.title)}</h2>
      ${story.setting ? `<p class="st-setting">📍 ${inline(story.setting)}</p>` : ''}
      ${meta.author ? `<p class="hint">${t.by(escapeHtml(meta.author))}</p>` : ''}
    </header>
    ${castHtml(story, lang)}
    <div class="st-play">${story.scenes.map((s) => sceneHtml(s, who)).join('')}</div>
    ${story.tech.length ? `
    <div class="st-divider"><span>💻 ${t.tech}</span></div>
    ${story.tech.map((s) => `<section class="panel st-tech"><h3>${inline(s.title)}</h3>${md(s.lines.join('\n'), ann)}</section>`).join('')}` : ''}
    ${story.interview ? `<section class="panel st-interview"><h3>🎤 ${t.interview}</h3>${md(story.interview, ann)}</section>` : ''}
    ${links ? `<div class="row st-links">${links}</div>` : ''}
  </article>`;
}

/* ---------- gaveta (abre por cima da pergunta ou do lab) ---------- */

export function openStoryDrawer(s, lang, meta = {}) {
  const t = T[lang];
  let dlg = document.getElementById('story-drawer');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'story-drawer';
    dlg.className = 'story-drawer';
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    document.body.append(dlg);
  }
  dlg.innerHTML = `<div class="drawer-bar"><a href="#/stories" class="hint" data-close>${t.all}</a><button type="button" class="btn ghost" data-close>✕ ${t.close}</button></div><div class="drawer-body"><p class="hint">…</p></div>`;
  dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.showModal();
  loadStory(s, lang)
    .then((st) => { dlg.querySelector('.drawer-body').innerHTML = storyHtml(st, lang, { author: s.author, lab: s.lab, ...meta }); })
    .catch(() => { dlg.querySelector('.drawer-body').innerHTML = `<p class="empty">${t.fail}</p>`; });
  dlg.querySelector('.drawer-body').addEventListener('click', (e) => { if (e.target.closest('a[href^="#/"]')) dlg.close(); });
}

export function storyButton(s, lang, kind = 'question') {
  if (!s) return '';
  return `<button type="button" class="btn story-btn" data-story="${s.id}">${T[lang][kind === 'lab' ? 'openLab' : 'open']}</button>`;
}
export function bindStoryButtons(scope, lang, meta = {}) {
  scope.querySelectorAll('[data-story]').forEach((b) => b.addEventListener('click', () => {
    const s = stories.find((x) => x.id === b.dataset.story);
    if (s) openStoryDrawer(s, lang, meta);
  }));
}

/* ---------- páginas #/stories e #/story/:id ---------- */

export async function renderStories(view, { lang, L, questions, cats }) {
  const t = T[lang];
  const card = (s, title) => {
    const q = questions.find((x) => x.id === s.questions[0]);
    const lab = s.lab && labs.find((l) => l.id === s.lab);
    const topic = lab ? L(lab.title) : q ? L(q.q) : '';
    return `<a class="st-card" href="#/story/${s.id}"><strong>${inline(title)}</strong>
      ${topic ? `<span class="st-topic">${escapeHtml(topic.length > 110 ? topic.slice(0, 107) + '…' : topic)}</span>` : ''}
      <span class="hint">${escapeHtml(L(cats[s.cat || q?.cat] || { pt: '', en: '' }))}${s.author ? ` · ${t.by(escapeHtml(s.author))}` : ''}</span></a>`;
  };
  view.innerHTML = `<section class="st-index"><h1>${t.pageTitle}</h1>${md(t.pageIntro)}<div id="st-groups"><p class="hint">…</p></div></section>`;
  const titled = await Promise.all(stories.map((s) => loadStory(s, lang).then((st) => [s, st.title]).catch(() => [s, s.id])));
  const group = (items, h) => `<h2>${h}</h2><div class="st-grid">${items.map(([s, title]) => card(s, title)).join('')}</div>`;
  view.querySelector('#st-groups').innerHTML =
    group(titled.filter(([s]) => s.lab), t.labs) + group(titled.filter(([s]) => !s.lab), t.questions);
}

export async function renderStoryPage(view, id, { lang }) {
  const t = T[lang];
  const s = stories.find((x) => x.id === id);
  if (!s) { view.innerHTML = `<p class="empty"><a href="#/stories">${t.all}</a></p>`; return; }
  view.innerHTML = `<p><a href="#/stories" class="back">← ${t.all}</a></p><div class="st-page"><p class="hint">…</p></div>`;
  try {
    const st = await loadStory(s, lang);
    view.querySelector('.st-page').innerHTML = storyHtml(st, lang, { author: s.author, lab: s.lab, question: s.questions[0] });
  } catch { view.querySelector('.st-page').innerHTML = `<p class="empty">${t.fail}</p>`; }
}
