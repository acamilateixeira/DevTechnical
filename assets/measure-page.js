// Página "Como medir": métrica, ferramenta, onde clicar, valor bom e como falar na entrevista.

import { md, escapeHtml } from './md.js';
import { createAnnotator } from './gloss.js';
import { areas, cards, method } from '../data/measure.js';
import { labs } from '../labs/web/index.js';

const T = {
  pt: {
    title: 'Como medir', lead: 'Recrutador sênior não pergunta só "o que é": pergunta **"como você mediu?"**, "que métrica você olha?", "onde no React DevTools?". Aqui está, para cada parte da stack, a métrica, a ferramenta, **onde clicar passo a passo**, qual valor é bom e a frase pronta.',
    method: '🧭 Roteiro para responder "como você mediu?"', all: 'Tudo',
    why: 'Por que medir', metric: 'Métrica', good: 'Valor bom', tools: 'Ferramentas', steps: 'Passo a passo', code: 'Código', say: '🎤 Como falar na entrevista',
    labs: '▶ Testar no Laboratório', nodeLabs: 'Labs Node (terminal)', questions: 'Perguntas ligadas',
  },
  en: {
    title: 'How to measure', lead: 'Senior recruiters don\'t just ask "what is it": they ask **"how did you measure it?"**, "which metric do you watch?", "where in React DevTools?". Here, for each part of the stack, is the metric, the tool, **where to click step by step**, what a good value is, and the line to say.',
    method: '🧭 How to answer "how did you measure it?"', all: 'All',
    why: 'Why measure it', metric: 'Metric', good: 'Good value', tools: 'Tools', steps: 'Step by step', code: 'Code', say: '🎤 What to say in the interview',
    labs: '▶ Try it in the Lab', nodeLabs: 'Node labs (terminal)', questions: 'Related questions',
  },
};

export function renderMeasure(view, { lang, gloss, L, questions, focus }) {
  const t = T[lang];
  const ann = () => createAnnotator(lang, { inline: gloss });
  const strip = (h) => h.replace(/^<p>|<\/p>$/g, '');
  const cardHtml = (c) => {
    const a = ann();
    const qs = c.questions.map((id) => questions.find((q) => q.id === id)).filter(Boolean);
    const ls = c.labs.map((id) => labs.find((l) => l.id === id)).filter(Boolean);
    return `
    <article class="panel measure-card" id="m-${c.id}" data-area="${c.area}">
      <h2><span aria-hidden="true">${c.icon}</span> ${escapeHtml(L(c.title))}</h2>
      <p class="m-why">${strip(md(L(c.why), a))}</p>
      <div class="md-table"><table><thead><tr><th>${t.metric}</th><th>${t.good}</th></tr></thead><tbody>
        ${c.metrics.map((m) => `<tr><td>${strip(md(L(m.name), a))}</td><td>${strip(md(L(m.good), a))}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="m-tools"><strong>${t.tools}:</strong> ${c.tools.map((x) => `<span class="chip">${escapeHtml(x)}</span>`).join(' ')}</p>
      <h3>${t.steps}</h3>
      <ol class="m-steps">${L(c.steps).map((s) => `<li>${strip(md(s, a))}</li>`).join('')}</ol>
      ${c.code ? `<h3>${t.code}</h3><pre><code>${escapeHtml(c.code)}</code></pre>` : ''}
      <div class="m-say"><h3>${t.say}</h3>${md(L(c.say), a)}</div>
      ${ls.length || c.nodeLabs?.length || qs.length ? `<div class="m-links">
        ${ls.length ? `<p><strong>${t.labs}:</strong> ${ls.map((l) => `<a href="#/lab/${l.id}">${escapeHtml(L(l.title))}</a>`).join(' · ')}</p>` : ''}
        ${c.nodeLabs?.length ? `<p><strong>${t.nodeLabs}:</strong> ${c.nodeLabs.map((f) => `<code>node labs/node/${escapeHtml(f)}</code>`).join(' · ')}</p>` : ''}
        ${qs.length ? `<p><strong>${t.questions}:</strong> ${qs.map((q) => `<a href="#/q/${q.id}">${escapeHtml(L(q.q).slice(0, 90))}${L(q.q).length > 90 ? '…' : ''}</a>`).join('<br>')}</p>` : ''}
      </div>` : ''}
    </article>`;
  };

  view.innerHTML = `
    <section class="measure">
      <h1>${t.title}</h1>
      ${md(t.lead)}
      <details class="panel m-method" open><summary><strong>${t.method}</strong></summary>${md(L(method), ann())}</details>
      <nav class="m-areas" aria-label="${t.title}">
        <button type="button" class="chip-btn" data-area="" aria-pressed="true">${t.all}</button>
        ${Object.entries(areas).map(([k, v]) => `<button type="button" class="chip-btn" data-area="${k}" aria-pressed="false">${escapeHtml(L(v))}</button>`).join('')}
      </nav>
      <div class="m-index">${cards.map((c) => `<a href="#/measure/${c.id}" data-area="${c.area}">${c.icon} ${escapeHtml(L(c.title))}</a>`).join('')}</div>
      <div class="m-cards">${cards.map(cardHtml).join('')}</div>
    </section>`;

  const filter = (area) => {
    view.querySelectorAll('.chip-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.area === area)));
    view.querySelectorAll('.measure-card, .m-index a').forEach((el) => { el.hidden = !!area && el.dataset.area !== area; });
  };
  view.querySelectorAll('.chip-btn').forEach((b) => b.addEventListener('click', () => filter(b.dataset.area)));

  if (focus) {
    const el = view.querySelector(`#m-${CSS.escape(focus)}`);
    if (el) { el.classList.add('m-focus'); requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
  }
}
