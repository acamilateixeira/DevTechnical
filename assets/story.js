// Histórias: parser do formato, renderização em "chat", página de histórias e gaveta.
//
// Formato do arquivo (.pt.md / .en.md):
//   # 🍞 Título
//   > Cenário em uma linha (onde a história acontece)
//   ## 🎭 Elenco            → "- 🗣️ **Nome** · `código` · quem é, em linguagem simples"
//   ## 🎬 Cena 1 · Título   → falas "**Nome** _(rubrica)_: fala", avisos "> 🚨 texto" e o painel
//                              técnico "= 📤 Saída: A E G" (toda cena termina com um painel)
//   ## 🧠 Moral da história  → resumo em falas, fora das cenas
//   ## 💻 ...               → lado técnico: código e tabelas (markdown livre)
//   ## ➕ ... / 📌 ...       → extras: o que vai além do código (pode ter falas)
//   ## 🎤 ...               → a resposta pronta para a entrevista
// O emoji do título da seção decide o tipo, então o mesmo formato vale em PT e EN.

import { md, escapeHtml } from './md.js';
import { createAnnotator } from './gloss.js';
import { labs } from '../labs/web/index.js';
import { storyIds } from '../data/stories/index.js';
import { videos } from '../data/videos.js';

const T = {
  pt: {
    cast: 'Quem é quem', castHint: 'cada personagem é um pedaço de código ou um termo técnico',
    tech: 'Agora o lado técnico', interview: 'Pra falar na entrevista', by: (a) => `história de ${a}`,
    seeLab: '▶ Ver rodando no Laboratório', train: '🎤 Treinar a pergunta', close: 'Fechar', all: 'Todas as histórias',
    open: '😂 Não entendeu? Leia a história', openLab: '😂 Ler a história deste lab', pageTitle: 'Histórias',
    pageIntro: 'Cada conceito vira uma conversa engraçada entre personagens. Primeiro você entende a ideia, depois vê **quem é quem no código**, e no fim leva a frase pronta para a entrevista. Ordem que funciona: **história → laboratório → entrevista**.',
    related: '🎤 Treinar as perguntas deste assunto', videoHint: '🎬 Mini vídeo: clique na tela ou em Assistir. Ligue a 🔊 narração para ouvir com a voz do seu navegador.', download: '⬇ Baixar MP4', labs: 'Histórias com laboratório', questions: 'Histórias de perguntas', fail: 'Não consegui carregar a história.',
    zoneStory: '📖 A história', zoneStoryHint: 'cada cena acompanha o código; o painel 📋 mostra como o programa está naquele momento (em destaque o que acabou de mudar)',
    stateTitle: '📋 Como está agora', moral: '🧠 Moral da história', moralHint: 'o resumo, já fora das cenas',
    extras: '➕ Extras', extrasHint: 'vai além do código desta história', changed: 'mudou',
  },
  en: {
    cast: 'Who is who', castHint: 'each character is a piece of code or a technical term',
    tech: 'Now the technical side', interview: 'What to say in the interview', by: (a) => `story by ${a}`,
    seeLab: '▶ See it running in the Lab', train: '🎤 Practice the question', close: 'Close', all: 'All stories',
    open: '😂 Lost? Read the story', openLab: '😂 Read this lab\'s story', pageTitle: 'Stories',
    pageIntro: 'Each concept becomes a funny conversation between characters. First you get the idea, then you see **who is who in the code**, and you finish with the line to say in the interview. The order that works: **story → lab → interview**.',
    related: '🎤 Practice this topic\'s questions', videoHint: '🎬 Mini video: click the screen or Play. Turn on 🔊 narration to hear it in your browser\'s voice.', download: '⬇ Download MP4', labs: 'Stories with a lab', questions: 'Question stories', fail: 'Could not load the story.',
    zoneStory: '📖 The story', zoneStoryHint: 'each scene follows the code; the 📋 panel shows the program\'s state at that moment (what just changed is highlighted)',
    stateTitle: '📋 State right now', moral: '🧠 Moral of the story', moralHint: 'the recap, outside the scenes',
    extras: '➕ Extras', extrasHint: 'goes beyond this story\'s code', changed: 'changed',
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
  if (!cache.has(path)) cache.set(path, fetch(path + (globalThis.__V ? `?v=${globalThis.__V}` : '')).then((r) => { if (!r.ok) throw new Error(path); return r.text(); }));
  return cache.get(path);
}
export const loadStory = (s, lang) => fetchText(`${s.base}.${lang}.md`).catch(() => fetchText(`${s.base}.pt.md`)).then(parseStory);

/* ---------- parser ---------- */

export const SPEECH = /^\*\*(.+?)\*\*(?:\s*_\((.+?)\)_)?\s*:\s*(.+)$/;
const CAST = /^-\s+(\S+)\s+\*\*(.+?)\*\*\s*·\s*(?:(.*?)\s*·\s*)?(.+)$/;

const KINDS = { '🎭': 'cast', '🎬': 'scene', '🧠': 'moral', '💻': 'tech', '🎤': 'interview' };
export function sectionKind(title) {
  const k = Object.keys(KINDS).find((e) => title.startsWith(e));
  return k ? KINDS[k] : 'extra';
}
export const STATE = /^=\s+(\S+)\s+([^:]+):\s*(.*)$/;

export function parseStory(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const story = { title: '', setting: '', cast: [], scenes: [], moral: null, tech: [], extras: [], interview: '' };
  let section = null;
  for (const line of lines) {
    if (!story.title && line.startsWith('# ')) { story.title = line.slice(2).trim(); continue; }
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim();
      const kind = sectionKind(title);
      section = { kind, title: title.replace(/^\S+\s*/, ''), lines: [] };
      if (kind === 'scene') story.scenes.push(section);
      else if (kind === 'tech') story.tech.push(section);
      else if (kind === 'extra') story.extras.push(section);
      else if (kind === 'moral') story.moral = section;
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

export const COLORS = 8;
// Código (com crase) vira etiqueta monoespaçada; termo técnico em palavras vira etiqueta normal.
export const chip = (code) => (code.includes('`') ? `<span class="st-code">${inline(code)}</span>` : `<span class="st-term">${inline(code)}</span>`); // classes .c0 ... .c7
export const inline = (s) => md(s).replace(/^<p>|<\/p>\s*$/g, '').replace(/(^|\s)_\((.+?)\)_/g, '$1<em class="st-dir">($2)</em>');

function linesHtml(lines, who, t, prev, strict = false) {
  const out = [];
  let buf = [];
  let state = [];
  const flush = () => { if (buf.join('').trim()) out.push(`<div class="st-note">${md(buf.join('\n'))}</div>`); buf = []; };
  const flushState = () => {
    if (!state.length) return;
    out.push(`<div class="st-state"><div class="st-state-title">${t.stateTitle}</div><dl>${state.map(([emoji, label, value]) => {
      const norm = (v) => (v || '').replace(/\s*\([^)]*\)/g, '').trim();
      const changed = prev && prev.has(label) && norm(prev.get(label)) !== norm(value);
      if (prev) prev.set(label, value);
      return `<div class="st-state-row${changed ? ' changed' : ''}"><dt>${emoji} ${inline(label)}</dt><dd>${inline(value || '—')}${changed ? ` <span class="st-changed">${t.changed}</span>` : ''}</dd></div>`;
    }).join('')}</dl></div>`);
    state = [];
  };
  for (const line of lines) {
    const st = line.match(STATE);
    if (st) { flush(); state.push([st[1], st[2].trim(), st[3].trim()]); continue; }
    flushState();
    const m = line.match(SPEECH);
    if (m && !(strict && !/^["“]/.test(m[3]))) {
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
  flush(); flushState();
  return out.join('');
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
  const prev = new Map(); // valores do painel na cena anterior, para destacar o que mudou
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
    <section class="st-zone">
      <h3 class="st-zone-title">${t.zoneStory} <span class="hint">· ${t.zoneStoryHint}</span></h3>
      <div class="st-play">${story.scenes.map((s) => `<section class="st-scene"><h4 class="st-scene-title">🎬 ${inline(s.title)}</h4>${linesHtml(s.lines, who, t, prev)}</section>`).join('')}</div>
    </section>
    ${story.moral ? `
    <section class="st-zone st-moral">
      <h3 class="st-zone-title">${t.moral} <span class="hint">· ${t.moralHint}</span></h3>
      ${linesHtml(story.moral.lines, who, t, null)}
    </section>` : ''}
    ${story.tech.length ? `
    <div class="st-divider"><span>💻 ${t.tech}</span></div>
    ${story.tech.map((s) => `<section class="panel st-tech"><h3>${inline(s.title)}</h3>${md(s.lines.join('\n'), ann)}</section>`).join('')}` : ''}
    ${story.extras.length ? `
    <div class="st-divider"><span>${t.extras} · ${t.extrasHint}</span></div>
    ${story.extras.map((s) => `<section class="panel st-extra"><h3>${inline(s.title)}</h3>${s.lines.some((l) => SPEECH.test(l)) ? linesHtml(s.lines, who, t, null, true) : md(s.lines.join('\n'), ann)}</section>`).join('')}` : ''}
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

export async function renderStoryPage(view, id, { lang, L, questions, autoplay }) {
  const t = T[lang];
  const s = stories.find((x) => x.id === id);
  if (!s) { view.innerHTML = `<p class="empty"><a href="#/stories">${t.all}</a></p>`; return; }
  view.innerHTML = `<p><a href="#/stories" class="back">← ${t.all}</a></p><div class="st-page"><p class="hint">…</p></div>`;
  try {
    const st = await loadStory(s, lang);
    const related = (s.lab ? s.questions : []).map((qid) => questions?.find((q) => q.id === qid)).filter(Boolean);
    const vt = T[lang];
    const mp4 = videos.has(`${s.id}.${lang}`) ? `media/videos/${s.id}.${lang}.mp4` : null;
    view.querySelector('.st-page').innerHTML = `<section class="st-video"><div class="st-video-player"></div>
        <div class="st-video-actions"><span class="hint">${vt.videoHint}</span>${mp4 ? ` · <a href="${mp4}" download>${vt.download}</a>` : ''}</div></section>` +
      storyHtml(st, lang, { author: s.author, lab: s.lab, question: s.lab ? null : s.questions[0] }) +
      (related.length && L ? `<section class="panel"><h3>${t.related}</h3><ul>${related.map((q) => `<li><a href="#/q/${q.id}">${escapeHtml(L(q.q))}</a></li>`).join('')}</ul></section>` : '');
    const { mountPlayer } = await import('./story-player.js');
    const player = mountPlayer(view.querySelector('.st-video-player'), st, { lang, autoplay });
    onLeaveStory?.(() => player.destroy());
  } catch { view.querySelector('.st-page').innerHTML = `<p class="empty">${t.fail}</p>`; }
}

let onLeaveStory = null;
/** O app avisa como registrar limpeza ao sair da página (para parar o vídeo). */
export const setStoryLeave = (fn) => { onLeaveStory = fn; };
