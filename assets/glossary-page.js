// Página do glossário: todos os termos, com busca. #/glossary/<id> rola até o termo.

import { glossary } from '../data/glossary.js';
import { escapeHtml } from './md.js';

const C = {
  pt: { title: 'Glossário', lead: 'Os termos técnicos que aparecem nas perguntas e nos labs, em linguagem simples. Nas respostas, a definição curta aparece entre parênteses na primeira vez que o termo surge; toque no termo para ver a explicação maior.', search: 'Buscar termo…', also: 'Também aparece como', none: 'Nenhum termo encontrado.' },
  en: { title: 'Glossary', lead: 'The technical terms used in the questions and labs, in plain language. In answers, the short definition appears in parentheses the first time a term shows up; tap the term for the longer explanation.', search: 'Search a term…', also: 'Also appears as', none: 'No terms found.' },
};

export function renderGlossary(view, { lang, focus }) {
  const c = C[lang];
  const items = glossary
    .map((e) => {
      const names = [...(e.terms[lang] || []), ...(e.terms.code || [])];
      return { e, name: names[0] || e.id, others: names.slice(1) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, lang, { sensitivity: 'base' }));

  view.innerHTML = `
    <article class="start">
      <h1>${c.title}</h1>
      <p>${c.lead}</p>
      <input class="search" id="g-search" type="search" placeholder="${c.search}" aria-label="${c.search}" />
      <dl class="glossary" id="g-list">${items.map(({ e, name, others }) => `
        <div class="g-item" id="g-${e.id}" data-text="${escapeHtml([name, ...others, e.short[lang], e.long[lang]].join(' ').toLowerCase())}">
          <dt>${escapeHtml(name)}</dt>
          <dd><strong>${escapeHtml(e.short[lang])}.</strong> ${escapeHtml(e.long[lang])}
            ${others.length ? `<small>${c.also}: ${others.map(escapeHtml).join(', ')}</small>` : ''}</dd>
        </div>`).join('')}
      </dl>
      <p class="empty" id="g-none" hidden>${c.none}</p>
    </article>`;

  const input = view.querySelector('#g-search');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    view.querySelectorAll('.g-item').forEach((el) => {
      const on = !q || el.dataset.text.includes(q);
      el.hidden = !on; if (on) shown++;
    });
    view.querySelector('#g-none').hidden = shown > 0;
  });

  if (focus) {
    const el = view.querySelector(`#g-${CSS.escape(focus)}`);
    if (el) { el.classList.add('flash-item'); el.scrollIntoView({ block: 'center' }); }
  } else window.scrollTo(0, 0);
}
