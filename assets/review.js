// Revisão rápida: uma página por trilha, só com o que falar.
// Cada pergunta mostra os pontos da rubrica (o que a resposta precisa cobrir) e a âncora
// na experiência real. Sem a resposta longa: é para revisar em minutos antes da entrevista.
import { escapeHtml } from './md.js';
import { paths } from '../data/paths.js';

const STORE = 'devtechnical:review';
const BEHAVIORAL = 'comportamental';

const TXT = {
  pt: {
    title: 'Revisão rápida',
    lead: 'Para os dias de entrevista: só a pergunta, os pontos que a resposta precisa ter e o seu exemplo real. Leia em voz alta, marque o que já sabe e volte só no que falta.',
    track: 'Trilha',
    behavioral: 'Comportamental (todas as vagas)',
    say: 'Fale estes pontos',
    yours: 'Seu exemplo',
    known: 'Já sei',
    progress: (k, n) => `${k} de ${n} marcadas como "já sei"`,
    hideKnown: 'Esconder as que já sei',
    print: 'Imprimir / salvar PDF',
    full: 'Resposta completa →',
    reset: 'Desmarcar todas',
    tip: 'Dica: responda com um exemplo seu primeiro e o conceito depois. Se não souber algo, diga o que faria para descobrir.',
  },
  en: {
    title: 'Quick review',
    lead: 'For interview days: only the question, the points the answer must cover, and your real example. Read it out loud, mark what you know, and come back only to what is missing.',
    track: 'Track',
    behavioral: 'Behavioral (every role)',
    say: 'Cover these points',
    yours: 'Your example',
    known: 'I know this',
    progress: (k, n) => `${k} of ${n} marked as known`,
    hideKnown: 'Hide the ones I know',
    print: 'Print / save as PDF',
    full: 'Full answer →',
    reset: 'Clear all marks',
    tip: 'Tip: lead with your own example, then the concept. If you do not know something, say how you would find out.',
  },
};

/** Texto curto com `código` inline. */
const inline = (txt) => escapeHtml(txt).replace(/`([^`]+)`/g, '<code>$1</code>');

function load() {
  try { return { track: '', hide: false, known: {}, ...JSON.parse(localStorage.getItem(STORE) || '{}') }; }
  catch { return { track: '', hide: false, known: {} }; }
}
function save(s) {
  try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* modo privado */ }
}

/** Perguntas da trilha, na ordem das paradas e sem repetição. */
export function trackQuestions(trackId, questions) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  if (trackId === BEHAVIORAL) return questions.filter((q) => q.type === 'behavioral');
  const path = paths[trackId];
  if (!path) return [];
  const seen = new Set();
  const out = [];
  for (const stop of path.stops) {
    for (const item of stop.items) {
      if (item.kind !== 'q' || seen.has(item.id) || !byId.has(item.id)) continue;
      seen.add(item.id);
      out.push(byId.get(item.id));
    }
  }
  return out;
}

export function renderReview(view, { lang, L, questions, jobs }) {
  const T = TXT[lang] || TXT.pt;
  const s = load();
  const featured = Object.keys(paths).filter((id) => paths[id].featured);
  const others = Object.keys(paths).filter((id) => !paths[id].featured);
  const ids = [...featured, BEHAVIORAL, ...others];
  if (!ids.includes(s.track)) s.track = ids[0];

  const label = (id) => (id === BEHAVIORAL ? T.behavioral : `${featured.includes(id) ? '⭐ ' : ''}${L(jobs[id]) || id}`);

  const draw = () => {
    const list = trackQuestions(s.track, questions);
    const knownCount = list.filter((q) => s.known[q.id]).length;
    const shown = s.hide ? list.filter((q) => !s.known[q.id]) : list;

    view.innerHTML = `
      <section class="review">
        <header class="review-head">
          <h2>${T.title}</h2>
          <p class="muted">${T.lead}</p>
          <div class="review-tools">
            <label>${T.track}
              <select id="rv-track">${ids.map((id) => `<option value="${id}" ${id === s.track ? 'selected' : ''}>${escapeHtml(label(id))}</option>`).join('')}</select>
            </label>
            <label class="rv-check"><input type="checkbox" id="rv-hide" ${s.hide ? 'checked' : ''}> ${T.hideKnown}</label>
            <button type="button" class="btn" id="rv-print">${T.print}</button>
            <button type="button" class="btn ghost" id="rv-reset">${T.reset}</button>
          </div>
          <p class="rv-progress" aria-live="polite">${T.progress(knownCount, list.length)}</p>
          <p class="rv-tip">${T.tip}</p>
        </header>
        <ol class="rv-list">
          ${shown.map((q) => {
            const n = list.indexOf(q) + 1;
            const anchor = L(q.anchor);
            return `
            <li class="rv-card ${s.known[q.id] ? 'is-known' : ''}" value="${n}">
              <h3>${inline(L(q.q))}</h3>
              <p class="rv-label">${T.say}</p>
              <ul class="rv-points">${(q.points || []).map((p) => `<li>${inline(L(p))}</li>`).join('')}</ul>
              ${anchor ? `<p class="rv-label">${T.yours}</p><p class="rv-anchor">${inline(anchor)}</p>` : ''}
              <div class="rv-actions">
                <label class="rv-check"><input type="checkbox" data-known="${escapeHtml(q.id)}" ${s.known[q.id] ? 'checked' : ''}> ${T.known}</label>
                <a href="#/q/${encodeURIComponent(q.id)}">${T.full}</a>
              </div>
            </li>`;
          }).join('')}
        </ol>
      </section>`;

    view.querySelector('#rv-track').addEventListener('change', (e) => { s.track = e.target.value; save(s); draw(); });
    view.querySelector('#rv-hide').addEventListener('change', (e) => { s.hide = e.target.checked; save(s); draw(); });
    view.querySelector('#rv-print').addEventListener('click', () => window.print());
    view.querySelector('#rv-reset').addEventListener('click', () => {
      list.forEach((q) => { delete s.known[q.id]; });
      save(s); draw();
    });
    view.querySelectorAll('[data-known]').forEach((cb) => cb.addEventListener('change', (e) => {
      const id = e.target.dataset.known;
      if (e.target.checked) s.known[id] = true; else delete s.known[id];
      save(s); draw();
    }));
  };

  draw();
}
