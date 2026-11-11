// Markdown mínimo: parágrafos, listas "- " e "1.", tabelas |a|b|, **negrito**, `código` e blocos ``` .
// Escapa HTML antes de formatar, então o conteúdo nunca injeta tags.

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ann (opcional): anotador do glossário (assets/gloss.js) que marca termos técnicos.
function inline(s, ann) {
  const html = s.split(/(`[^`]+`)/g).map((part) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      const raw = part.slice(1, -1);
      return ann ? ann.code(raw) : `<code>${escapeHtml(raw)}</code>`;
    }
    return ann ? ann.text(part) : escapeHtml(part);
  }).join('');
  return html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function md(text, ann) {
  if (!text) return '';
  const lines = String(text).trim().split('\n');
  const out = [];
  let para = [];
  let list = null;
  let ordered = false;
  let fence = null;
  let table = null;
  const flushTable = () => {
    if (!table) return;
    const [head, ...rows] = table;
    out.push(`<div class="md-table"><table><thead><tr>${head.map((c) => `<th>${inline(c, ann)}</th>`).join('')}</tr></thead>` +
      `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, ann)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    table = null;
  };

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '), ann)}</p>`);
    para = [];
  };
  const flushList = () => {
    const tag = ordered ? 'ol' : 'ul';
    if (list) out.push(`<${tag}>${list.map((li) => `<li>${inline(li, ann)}</li>`).join('')}</${tag}>`);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (fence) {
      if (line.trim().startsWith('```')) {
        out.push(`<pre><code>${escapeHtml(fence.join('\n'))}</code></pre>`);
        fence = null;
      } else fence.push(raw);
      continue;
    }
    const t = line.trim();
    if (t.startsWith('```')) { flushPara(); flushList(); fence = []; continue; }
    if (t.startsWith('|') && t.endsWith('|')) {
      flushPara(); flushList();
      const cells = t.slice(1, -1).split('|').map((c) => c.trim());
      if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue;      // linha separadora
      (table ||= []).push(cells);
      continue;
    }
    flushTable();
    if (t === '') { flushPara(); flushList(); continue; }
    const item = t.match(/^(-|\d+\.)\s+(.*)$/);
    if (item) {
      const isOl = item[1] !== '-';
      if (list && isOl !== ordered) flushList();
      flushPara(); ordered = isOl; (list ||= []).push(item[2]); continue;
    }
    if (list) { list[list.length - 1] += ' ' + t; continue; }
    para.push(t);
  }
  if (fence) out.push(`<pre><code>${escapeHtml(fence.join('\n'))}</code></pre>`);
  flushPara();
  flushList();
  flushTable();
  return out.join('');
}
