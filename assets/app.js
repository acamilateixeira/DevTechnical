import { md, escapeHtml } from './md.js';
import { jobs, cats, types, ui } from '../data/meta.js';
import { questions } from '../data/index.js';
import { labs } from '../labs/web/index.js';
import { renderStart } from './start.js';
import { createAnnotator } from './gloss.js';
import { renderGlossary } from './glossary-page.js';
import { initGlossPopover } from './gloss-pop.js';
import { codeBlock, initBracketHover } from './highlight.js';
import { renderMeasure } from './measure-page.js';
import { cardsForQuestion } from '../data/measure.js';
import { sources, evidenceSummary } from '../data/evidence.js';
import { storyForQuestion, storyButton, bindStoryButtons, renderStories, renderStoryPage } from './story.js';

const STORE = 'devtechnical:v1';
const $ = (s, el = document) => el.querySelector(s);

const state = load();
let current = null;   // pergunta em exibição no modo entrevista
let revealed = false;
let timer = null;

function defaultRoute() {
  return Object.keys(state.scores).length ? 'interview' : 'start';
}

function load() {
  const base = { lang: 'pt', gloss: true, filters: { job: '', cat: '', type: '' }, scores: {}, checks: {}, drafts: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
    return { ...base, ...saved, filters: { ...base.filters, ...(saved.filters || {}) } };
  } catch {
    return base;
  }
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* modo privado */ }
}

const t = (k) => ui[state.lang][k];
const L = (obj) => (obj ? obj[state.lang] ?? obj.pt : '');

/** Nota 0–1 → acerto (≥ 0,8), parcial (≥ 0,4) ou erro. */
export function level(score) {
  if (score == null) return '';
  if (score >= 0.8) return 'got';
  if (score >= 0.4) return 'partial';
  return 'miss';
}
const pct = (x) => `${Math.round(x * 100)}%`;

function filtered() {
  const { job, cat, type } = state.filters;
  return questions.filter((q) =>
    (!job || q.jobs.includes(job)) && (!cat || q.cat === cat) && (!type || q.type === type));
}

/* ---------- chrome ---------- */

function renderChrome() {
  document.documentElement.lang = state.lang === 'pt' ? 'pt-BR' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = t(el.dataset.i18n);
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('[data-lang]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  const gt = $('#gloss-toggle');
  gt.setAttribute('aria-pressed', String(state.gloss));
  gt.title = t(state.gloss ? 'glossOn' : 'glossOff');
  gt.setAttribute('aria-label', t('glossToggle'));
  gt.textContent = state.lang === 'pt' ? '( ) definições' : '( ) definitions';

  fill($('#f-job'), jobs, t('allJobs'), state.filters.job);
  fill($('#f-cat'), cats, t('all'), state.filters.cat);
  fill($('#f-type'), types, t('all'), state.filters.type);
  $('#f-count').textContent = t('count')(filtered().length, questions.length);
}

function fill(select, map, allLabel, value) {
  select.innerHTML = `<option value="">${escapeHtml(allLabel)}</option>` +
    Object.entries(map).map(([id, l]) =>
      `<option value="${id}" ${id === value ? 'selected' : ''}>${escapeHtml(L(l))}</option>`).join('');
}

let leave = [];
const onLeave = (fn) => leave.push(fn);
let labModule = null;

function route() {
  const [, name = defaultRoute(), arg] = location.hash.split('/');
  document.querySelectorAll('[data-route]').forEach((a) => {
    const on = a.dataset.route === (name === 'q' ? 'interview' : name === 'story' ? 'stories' : name);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  stopTimer();
  document.getElementById('story-drawer')?.close();
  leave.forEach((fn) => fn()); leave = [];
  // Filtros só fazem sentido nas telas de perguntas.
  $('.filters').hidden = ['lab', 'start', 'glossary', 'stories', 'story', 'measure'].includes(name);
  if (name === 'measure') { if (!arg) window.scrollTo(0, 0); return renderMeasure($('#view'), { lang: state.lang, gloss: state.gloss, L, questions, focus: arg && decodeURIComponent(arg) }); }
  if (name === 'stories') { window.scrollTo(0, 0); return renderStories($('#view'), { lang: state.lang, L, questions, cats }); }
  if (name === 'story') { window.scrollTo(0, 0); return renderStoryPage($('#view'), decodeURIComponent(arg || ''), { lang: state.lang }); }
  if (name === 'glossary') { return renderGlossary($('#view'), { lang: state.lang, focus: arg && decodeURIComponent(arg) }); }
  if (name === 'start') { window.scrollTo(0, 0); return renderStart($('#view'), { lang: state.lang, gloss: state.gloss }); }
  if (name === 'lab') {
    window.scrollTo(0, 0);
    labModule ||= import('./lab.js');
    const ctx = { lang: state.lang, gloss: state.gloss, L, questions, onLeave };
    return labModule.then((m) => (arg ? m.renderLab($('#view'), decodeURIComponent(arg), ctx) : m.renderLabIndex($('#view'), ctx)));
  }
  if (name === 'study') return renderStudy();
  if (name === 'progress') return renderProgress();
  if (name === 'q' && arg) {
    const q = questions.find((x) => x.id === decodeURIComponent(arg));
    if (q) { current = q; revealed = false; }
  }
  return renderInterview();
}

/* ---------- entrevista ---------- */

function pickNext() {
  const pool = filtered().filter((q) => q !== current);
  if (!pool.length) return filtered()[0] || null;
  // Peso maior para não avaliadas e notas baixas.
  const weight = (q) => {
    const s = state.scores[q.id];
    return s == null ? 5 : 0.4 + (1 - s) * 4;
  };
  const total = pool.reduce((s, q) => s + weight(q), 0);
  let r = Math.random() * total;
  for (const q of pool) { r -= weight(q); if (r <= 0) return q; }
  return pool[pool.length - 1];
}

function reportedChip(q) {
  const sum = evidenceSummary(q.reported);
  if (!sum) return '';
  const label = sum.kind === 'relato' ? t('reportedChip') : sum.kind === 'guia' ? t('chipGuide') : t('chipJob');
  const who = sum.companies?.length ? ` · ${sum.companies.join(', ')}` : '';
  return `<span class="chip reported-chip" data-kind="${sum.kind}">${escapeHtml(label + who)}</span>`;
}

function measureLinks(q) {
  const cs = cardsForQuestion(q.id);
  if (!cs.length) return '';
  return `<div class="panel measure-link"><h3>${t('measureTitle')}</h3><ul>${cs.map((c) => `<li><a href="#/measure/${c.id}">${c.icon} ${escapeHtml(L(c.title))}</a></li>`).join('')}</ul></div>`;
}

function reportedHtml(q, ann) {
  if (!q.reported?.length) return '';
  const kindLabel = { relato: t('kindRelato'), guia: t('kindGuia'), vaga: t('kindVaga') };
  const S = (v) => (typeof v === 'string' ? v : L(v));
  return `<div class="panel reported"><h3>${t('reportedTitle')}</h3><ul class="evidence">${q.reported.map((x) => {
    const s = sources[x.src];
    return `<li data-kind="${s.kind}">
      <div class="ev-head"><span class="ev-kind">${kindLabel[s.kind]}</span> <strong>${escapeHtml(S(s.company))}</strong></div>
      <div class="ev-meta">${escapeHtml(L(s.role))} · ${escapeHtml(L(s.when))} · ${escapeHtml(L(s.stage))}</div>
      <blockquote>${md(L(x.quote), ann).replace(/^<p>|<\/p>$/g, '')}</blockquote>
      ${x.note ? `<div class="ev-note">⚠️ ${escapeHtml(L(x.note))}</div>` : ''}
      <div class="ev-src">${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(S(s.site))} ↗ ${t('srcOpen')}</a>` : escapeHtml(t('srcNoLink'))}</div>
    </li>`;
  }).join('')}</ul></div>`;
}

function chips(q) {
  return reportedChip(q) +
    `<span class="chip">${escapeHtml(L(cats[q.cat]))}</span>` +
    `<span class="chip">${escapeHtml(L(types[q.type]))}</span>` +
    q.jobs.map((j) => `<span class="chip">${escapeHtml(L(jobs[j]).split(' · ')[0])}</span>`).join('');
}

function codeBlocks(q) {
  if (!q.code) return '';
  const list = Array.isArray(q.code) ? q.code : [q.code];
  return list.map((c) =>
    `${c.label ? `<p class="code-label">${escapeHtml(L(c.label))}</p>` : ''}` +
    codeBlock(c.src.trim(), c.lang)).join('');
}

function currentScore(q) {
  const checked = state.checks[q.id] || [];
  return q.points.length ? checked.length / q.points.length : 0;
}

function checklistHtml(q, ann) {
  if (!q.points.length) return '';
  const checked = new Set(state.checks[q.id] || []);
  const saved = state.scores[q.id];
  const live = currentScore(q);
  return `
    <div class="panel checklist">
      <h3>${t('checklistTitle')}</h3>
      <p class="hint">${t('checklistHint')}</p>
      <ul class="checks">${q.points.map((pt, i) => `
        <li><label><input type="checkbox" data-i="${i}" ${checked.has(i) ? 'checked' : ''} />
          <span>${ann ? ann.text(L(pt)) : escapeHtml(L(pt))}</span></label></li>`).join('')}
      </ul>
      <div class="row score-row">
        <span class="score" data-level="${level(live)}"><strong class="score-num">${pct(live)}</strong></span>
        <button type="button" class="btn primary save-score">${t('saveScore')}</button>
        <span class="saved-msg">${saved != null ? `${t('saved')}: ${pct(saved)}` : ''}</span>
      </div>
    </div>`;
}

function toolsHtml(q) {
  const tools = q.tools.map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join('');
  const metrics = q.metrics.map((x) => `<span class="tag metric">${escapeHtml(x)}</span>`).join('');
  if (!tools && !metrics) return '';
  return `<div class="panel tools">
      ${tools ? `<h3>${t('toolsTitle')}</h3><div class="tags">${tools}</div>` : ''}
      ${metrics ? `<h3 style="margin-top:14px">${t('metricsTitle')}</h3><div class="tags">${metrics}</div>` : ''}
    </div>`;
}

const annotator = (q) => createAnnotator(state.lang, { inline: state.gloss, skip: q?.noGloss });

function revealHtml(q, ann = annotator(q)) {
  const follow = (q.follow || []).map((f) => `<li>${md(L(f), ann).replace(/^<p>|<\/p>$/g, '')}</li>`).join('');
  const lab = labs.find((l) => (l.questions || []).includes(q.id));
  return `
    ${lab ? `<a class="panel lab-link" href="#/lab/${lab.id}"><strong>${t('seeLab')}</strong><span>${escapeHtml(L(lab.title))}</span></a>` : ''}
    ${reportedHtml(q, ann)}
    ${measureLinks(q)}
    <div class="panel"><h3>${t('answer')}</h3>${md(L(q.a), ann)}</div>
    ${q.code ? `<div class="panel"><h3>${t('code')}</h3>${codeBlocks(q)}</div>` : ''}
    ${toolsHtml(q)}
    ${follow ? `<div class="panel followup"><h3>${t('followup')}</h3><ul>${follow}</ul></div>` : ''}
    ${q.flags ? `<div class="panel flags"><h3>${t('flags')}</h3>${md(L(q.flags), ann)}</div>` : ''}
    ${q.anchor ? `<div class="panel anchor"><h3>${t('anchor')}</h3>${md(L(q.anchor), ann)}</div>` : ''}
    ${checklistHtml(q, ann)}`;
}

function renderInterview() {
  const view = $('#view');
  if (!current || !filtered().includes(current)) { current = pickNext(); revealed = false; }
  if (!current) { view.innerHTML = `<p class="empty">${t('none')}</p>`; return; }
  const q = current;
  const ann = annotator(q);

  view.innerHTML = `
    <section class="room">
      <article class="bubble recruiter" aria-live="polite">
        <div class="who"><span class="dot"></span>${t('recruiter')}
          <a href="#/q/${encodeURIComponent(q.id)}" style="color:inherit;margin-left:auto" title="${t('link')}">#${escapeHtml(q.id)}</a>
        </div>
        <p class="question">${ann.text(L(q.q))}</p>
        <div class="chips">${chips(q)}</div>
        ${storyButton(storyForQuestion(q.id), state.lang)}
      </article>

      <div class="bubble answer-box">
        <label for="draft" class="who" style="opacity:1;color:var(--muted)">${t('yourAnswer')}</label>
        <textarea id="draft" placeholder="${t('placeholder')}">${escapeHtml(state.drafts[q.id] || '')}</textarea>
        <div class="row">
          ${revealed ? '' : `<button type="button" class="btn primary" id="reveal">${t('reveal')}</button>`}
          <button type="button" class="btn ${revealed ? 'primary' : 'ghost'}" id="next">${revealed ? t('next') : t('skip2')}</button>
          <button type="button" class="btn ghost" id="timer">${t('timerStart')}</button>
          <span class="timer" id="clock" aria-live="off"></span>
        </div>
        <p class="count" style="margin-top:10px">${t('focus')}</p>
      </div>

      <div class="reveal" id="reveal-area">${revealed ? revealHtml(q, ann) : ''}</div>
    </section>`;

  $('#draft').addEventListener('input', (e) => { state.drafts[q.id] = e.target.value; save(); });
  $('#reveal')?.addEventListener('click', () => {
    revealed = true; stopTimer(); renderInterview();
    $('#reveal-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#next').addEventListener('click', () => {
    current = pickNext(); revealed = false;
    if (location.hash.startsWith('#/q/')) history.replaceState(null, '', '#/interview');
    renderInterview(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('#timer').addEventListener('click', toggleTimer);
  bindChecklist(view, q);
  bindStoryButtons(view, state.lang, { question: null });
}

function bindChecklist(scope, q) {
  const box = scope.querySelector('.checklist');
  if (!box) return;
  const refresh = () => {
    const s = currentScore(q);
    box.querySelector('.score-num').textContent = pct(s);
    box.querySelector('.score').dataset.level = level(s);
  };
  box.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.addEventListener('change', () => {
    state.checks[q.id] = [...box.querySelectorAll('input:checked')].map((x) => Number(x.dataset.i));
    save(); refresh();
  }));
  box.querySelector('.save-score').addEventListener('click', () => {
    const s = currentScore(q);
    state.scores[q.id] = s; save();
    box.querySelector('.saved-msg').textContent = `${t('saved')}: ${pct(s)}`;
    const dot = document.querySelector(`.status[data-id="${q.id}"]`);
    if (dot) dot.dataset.r = level(s);
  });
}

function toggleTimer() {
  if (timer) return stopTimer();
  const end = Date.now() + 180000;
  const clock = $('#clock');
  $('#timer').textContent = t('timerStop');
  const tick = () => {
    const left = Math.round((end - Date.now()) / 1000);
    const a = Math.abs(left);
    clock.textContent = `${left < 0 ? '+' : ''}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`;
    clock.classList.toggle('over', left < 0);
  };
  tick();
  timer = setInterval(tick, 1000);
}
function stopTimer() {
  clearInterval(timer); timer = null;
  const b = $('#timer'); if (b) b.textContent = t('timerStart');
}

/* ---------- estudo ---------- */

let query = '';
function renderStudy() {
  const view = $('#view');
  view.innerHTML = `
    <input class="search" id="search" type="search" placeholder="${t('search')}" value="${escapeHtml(query)}" aria-label="${t('search')}" />
    <div class="list" id="list"></div>`;
  const draw = () => {
    const needle = query.trim().toLowerCase();
    const items = filtered().filter((q) => !needle ||
      [L(q.q), L(q.a), (q.tags || []).join(' '), q.tools.join(' '), q.id].join(' ').toLowerCase().includes(needle));
    $('#list').innerHTML = items.length ? items.map((q) => {
      const s = state.scores[q.id];
      return `
      <details class="item" data-id="${q.id}">
        <summary>
          <span class="title">${escapeHtml(L(q.q))}</span>
          <span class="meta"><span class="status" data-id="${q.id}" data-r="${level(s)}"></span>
            ${s != null ? `<span class="chip">${pct(s)}</span>` : ''}${chips(q)}</span>
        </summary>
        <div class="body"></div>
      </details>`;
    }).join('') : `<p class="empty">${t('none')}</p>`;
    $('#list').querySelectorAll('details').forEach((d) => d.addEventListener('toggle', () => {
      if (!d.open || d.dataset.ready) return;
      const q = questions.find((x) => x.id === d.dataset.id);
      d.querySelector('.body').innerHTML = storyButton(storyForQuestion(q.id), state.lang) + revealHtml(q);
      bindStoryButtons(d, state.lang, { question: q.id });
      bindChecklist(d, q);
      d.dataset.ready = '1';
    }));
  };
  $('#search').addEventListener('input', (e) => { query = e.target.value; draw(); });
  draw();
}

/* ---------- progresso ---------- */

export function summarize(list, scores) {
  const c = { got: 0, partial: 0, miss: 0, pending: 0, sum: 0, n: list.length };
  list.forEach((q) => {
    const s = scores[q.id];
    if (s == null) { c.pending++; return; }
    c[level(s)]++; c.sum += s;
  });
  c.done = c.n - c.pending;
  c.avg = c.done ? c.sum / c.done : 0;
  return c;
}

function renderProgress() {
  const view = $('#view');
  const all = filtered();
  const bar = (c) => `<div class="bar" role="img" aria-label="${c.got} / ${c.partial} / ${c.miss}">
      <span class="g" style="width:${(c.got / c.n) * 100}%"></span>
      <span class="p" style="width:${(c.partial / c.n) * 100}%"></span>
      <span class="m" style="width:${(c.miss / c.n) * 100}%"></span></div>`;
  const total = summarize(all, state.scores);
  const share = (k) => (total.done ? pct(total[k] / total.done) : '–');

  const groups = Object.keys(cats)
    .map((id) => [id, summarize(all.filter((q) => q.cat === id), state.scores)])
    .filter(([, c]) => c.n);
  const rated = groups.filter(([, c]) => c.done);
  const best = rated.length ? rated.reduce((a, b) => (b[1].avg > a[1].avg ? b : a)) : null;
  const worst = rated.length ? rated.reduce((a, b) => (b[1].avg < a[1].avg ? b : a)) : null;

  view.innerHTML = `
    <section class="panel" style="margin:8px 0 16px">
      <h3>${t('progressTitle')}</h3>
      <div class="kpis">
        <div><p class="hero-stat">${total.done ? pct(total.avg) : '–'}</p><small>${t('avg')}</small></div>
        <div><p class="hero-stat good">${share('got')}</p><small>${t('pctGot')} (${total.got})</small></div>
        <div><p class="hero-stat mid">${share('partial')}</p><small>${t('pctPartial')} (${total.partial})</small></div>
        <div><p class="hero-stat bad">${share('miss')}</p><small>${t('pctMiss')} (${total.miss})</small></div>
        <div><p class="hero-stat">${total.done}/${total.n}</p><small>${t('answered')} · ${total.pending} ${t('pending')}</small></div>
      </div>
      ${total.n ? bar(total) : ''}
      ${best && rated.length > 1 ? `<p class="hint" style="margin-top:12px">${t('best')}: <strong>${escapeHtml(L(cats[best[0]]))}</strong> (${pct(best[1].avg)}) · ${t('worst')}: <strong>${escapeHtml(L(cats[worst[0]]))}</strong> (${pct(worst[1].avg)})</p>` : ''}
      <div class="row"><button type="button" class="btn ghost" id="reset">${t('reset')}</button></div>
    </section>
    <div class="grid">${groups.map(([id, c]) => `
      <a class="stat" href="#/study" data-cat="${id}" style="text-decoration:none;color:inherit">
        <h3>${escapeHtml(L(cats[id]))}</h3>${bar(c)}
        <small>${c.done ? `${pct(c.avg)} · ` : ''}${t('pctGot')} ${c.got} · ${t('pctPartial')} ${c.partial} · ${t('pctMiss')} ${c.miss} · ${c.done}/${c.n}</small>
      </a>`).join('')}</div>`;

  $('#reset').addEventListener('click', () => {
    if (!confirm(t('resetConfirm'))) return;
    state.scores = {}; state.checks = {}; state.drafts = {}; save(); renderProgress();
  });
  view.querySelectorAll('[data-cat]').forEach((a) => a.addEventListener('click', () => {
    state.filters.cat = a.dataset.cat; save(); renderChrome();
  }));
}

/* ---------- eventos ---------- */

if (typeof document !== 'undefined') {
  $('#gloss-toggle').addEventListener('click', () => {
    state.gloss = !state.gloss; save(); renderChrome(); route();
  });
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    state.lang = b.dataset.lang; save(); renderChrome(); route();
  }));
  [['#f-job', 'job'], ['#f-cat', 'cat'], ['#f-type', 'type']].forEach(([sel, key]) =>
    $(sel).addEventListener('change', (e) => {
      state.filters[key] = e.target.value; save(); renderChrome(); route();
    }));
  window.addEventListener('hashchange', route);
  initGlossPopover();
  initBracketHover();
  renderChrome();
  route();
}
