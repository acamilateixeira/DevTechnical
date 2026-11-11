// Anotador de termos: acha termos do glossário no texto e acrescenta a definição curta
// entre parênteses (só na primeira vez que cada termo aparece num mesmo "contexto",
// por exemplo uma resposta inteira). Tocar no termo mostra a explicação maior.

import { glossary } from '../data/glossary.js';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cache = {};
function index(lang) {
  if (cache[lang]) return cache[lang];
  const plain = [];          // [{ term, entry }]
  const code = new Map();    // termo exato dentro de `código` → entry
  for (const e of glossary) {
    for (const term of e.terms[lang] || []) plain.push({ term, entry: e });
    for (const term of [...(e.terms.pt || []), ...(e.terms.en || []), ...(e.terms.code || [])]) {
      if (!code.has(term.toLowerCase())) code.set(term.toLowerCase(), e);
    }
  }
  plain.sort((a, b) => b.term.length - a.term.length); // mais longo primeiro: "event loop" antes de "loop"
  const byTerm = new Map(plain.map((p) => [p.term.toLowerCase(), p.entry]));
  const insensitive = plain.filter((p) => p.term === p.term.toLowerCase()).map((p) => reEsc(p.term));
  const sensitive = plain.filter((p) => p.term !== p.term.toLowerCase()).map((p) => reEsc(p.term));
  const B = '(?<![\\p{L}\\p{N}_/.-])';
  const E = '(?![\\p{L}\\p{N}_])';
  const ri = insensitive.length ? new RegExp(`${B}(${insensitive.join('|')})${E}`, 'giu') : null;
  const rs = sensitive.length ? new RegExp(`${B}(${sensitive.join('|')})${E}`, 'gu') : null;
  return (cache[lang] = { ri, rs, byTerm, code });
}

/**
 * Cria um anotador para um contexto (ex.: uma pergunta aberta).
 * inline: mostra a definição curta entre parênteses; se false, só sublinha e mostra ao tocar.
 * skip: ids do glossário a ignorar neste contexto (termos ambíguos, ex.: "autorização" de cartão).
 */
export function createAnnotator(lang, { inline = true, seen = new Set(), skip = [] } = {}) {
  const skipSet = new Set(skip);
  const idx = index(lang);
  const wrap = (labelHtml, e, withShort) => {
    const short = e.short[lang] ?? e.short.pt;
    const long = e.long[lang] ?? e.long.pt;
    return `<span class="term" tabindex="0" data-g="${e.id}">${labelHtml}` +
      (withShort ? `<span class="gloss"> (${esc(short)})</span>` : '') +
      `<span class="gloss-pop" role="tooltip"><strong>${esc(short)}</strong><span>${esc(long)}</span>` +
      `<a href="#/glossary/${e.id}">${lang === 'pt' ? 'Ver no glossário' : 'Open in glossary'}</a></span></span>`;
  };

  // Texto comum (sem `código`): escapa e anota.
  function text(raw) {
    const hits = [];
    for (const re of [idx.ri, idx.rs]) {
      if (!re) continue;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(raw))) hits.push({ start: m.index, end: m.index + m[0].length, word: m[0] });
    }
    hits.sort((a, b) => a.start - b.start || b.end - a.end);
    let out = '';
    let pos = 0;
    for (const h of hits) {
      if (h.start < pos) continue; // sobreposto a um termo mais longo
      const e = idx.byTerm.get(h.word.toLowerCase());
      if (!e || skipSet.has(e.id)) continue;
      const first = !seen.has(e.id);
      seen.add(e.id);
      out += esc(raw.slice(pos, h.start)) + wrap(esc(h.word), e, inline && first);
      pos = h.end;
    }
    return out + esc(raw.slice(pos));
  }

  // Conteúdo de `código` inline: anota só se o código inteiro for um termo.
  function code(raw) {
    const html = `<code>${esc(raw)}</code>`;
    const e = idx.code.get(raw.trim().replace(/\(\)$/, '').toLowerCase());
    if (!e || skipSet.has(e.id)) return html;
    const first = !seen.has(e.id);
    seen.add(e.id);
    return wrap(html, e, inline && first);
  }

  return { text, code, seen };
}
