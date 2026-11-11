// Cores no código, tema Dracula, sem dependências.
// - tokens: palavra-chave, função, variável, parâmetro, constante, tipo, string, número, comentário, propriedade, tag JSX
// - colchetes ( [ { coloridos por nível, como o "Bracket Pair Colorization" do VS Code; o par de cada um tem o mesmo data-p
// - indentação colorida por nível, como o "Indent-Rainbow"
// Linguagens: js/ts/jsx/tsx (padrão), php, sql, yaml, bash, http, ini, graphql, promql. Sem "lang", tenta adivinhar.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const set = (s) => new Set(s.split(/\s+/).filter(Boolean));

const JS_KW = set(`break case catch class const continue debugger default delete do else export extends finally for function if import in
  instanceof let new return super switch throw try typeof var void while with yield async await of as from type interface implements enum
  declare readonly private protected public static abstract namespace satisfies keyof infer is`);
const PHP_KW = set(`abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enum
  extends final finally fn for foreach function global if implements include include_once instanceof insteadof interface isset list match namespace new
  or print private protected public readonly require require_once return static switch throw trait try unset use var while xor yield`);
const SQL_KW = set(`select from where and or not in is null as on join left right inner outer full cross group by order having limit offset insert into
  values update set delete create table index unique primary key foreign references alter add drop column default check constraint distinct union all
  case when then else end exists between like ilike asc desc begin commit rollback transaction for share nowait skip locked with recursive returning
  explain analyze concurrently view materialized trigger function procedure language returns if declare top over partition row_number rank
  policy enable level security using grant revoke to cascade int integer bigint varchar char text timestamp date boolean decimal numeric serial
  global session show engine status`);
const GQL_KW = set('query mutation subscription fragment on type input enum interface union scalar schema extend implements directive');
const CONSTS = set('true false null undefined NaN Infinity TRUE FALSE NULL');
const DEF_TYPE = set('class interface type enum extends implements new trait namespace');
const DEF_VAR = set('const let var');

function guess(raw) {
  if (/^\s*--\s/m.test(raw) && /\b(SELECT|FROM|WHERE|CREATE|UPDATE)\b/i.test(raw)) return 'sql';
  const src = raw.replace(/^\s*(--|\/\/).*$/gm, ''); // ignora comentários ao adivinhar
  if (/<\?php|\$[a-zA-Z_]\w*\s*(=|->)|\bfunction\s+\w+\s*\([^)]*\$\w/.test(src)) return 'php';
  if (/^\s*(SELECT|CREATE|UPDATE|INSERT|ALTER|WITH|DELETE|EXPLAIN|SET GLOBAL|BEGIN)\b/im.test(src) && !/=>|\bconst\b|\bfunction\b/.test(src)) return 'sql';
  if (/^\s*;/m.test(src) && /^\s*[\w.]+\s*=/m.test(src) && !/[{};]\s*$/m.test(src.replace(/^\s*;.*$/gm, ''))) return 'ini';
  if (/^(apiVersion|services|jobs|on|name|kind):/m.test(src)) return 'yaml';
  if (/^(GET|POST|PUT|PATCH|DELETE) \//m.test(src) || /^[A-Z][\w-]+: /m.test(src) && !/[;{}()]/.test(src)) return 'http';
  if (/^\s*(git|npm|npx|node|docker|kubectl|rabbitmqctl|redis-cli|kafka-|curl|cd|k6) /m.test(src)) return 'bash';
  return 'js';
}

const norm = (lang) => {
  const l = (lang || '').toLowerCase();
  if (/^(js|javascript|ts|typescript|jsx|tsx|mjs|cjs|json)$/.test(l)) return 'js';
  if (/^(sh|shell|bash|zsh|console)$/.test(l)) return 'bash';
  if (/^(yml|yaml)$/.test(l)) return 'yaml';
  if (/^(graphql|gql)$/.test(l)) return 'graphql';
  return l || null;
};

/** Quebra o código em tokens [{ t: tipo, v: texto }]. */
export function tokenize(src, lang) {
  lang = norm(lang) || guess(src);
  const out = [];
  const push = (t, v) => out.push({ t, v });
  const line = { js: '//', php: '//', sql: '--', yaml: '#', bash: '#', http: '#', ini: ';', graphql: '#', promql: '#' }[lang] || '//';
  const hashToo = lang === 'php';
  const block = lang === 'js' || lang === 'php' || lang === 'sql';
  const isWord = (c) => /[A-Za-z0-9_$À-ɏ]/.test(c);
  const templ = []; // pilha: profundidade de { dentro de cada ${ } em template string
  let i = 0;
  const n = src.length;

  const readString = (q) => {
    let j = i + 1;
    while (j < n && src[j] !== q) { if (src[j] === '\\') j++; if (src[j] === '\n' && q !== '`') break; j++; }
    return src.slice(i, Math.min(j + 1, n));
  };

  // template string `...${expr}...`: devolve o texto até o fim ou até "${"
  const readTemplate = (start) => {
    let j = start;
    while (j < n) {
      if (src[j] === '\\') { j += 2; continue; }
      if (src[j] === '`') return { text: src.slice(start, j + 1), end: j + 1, open: false };
      if (src[j] === '$' && src[j + 1] === '{') return { text: src.slice(start, j), end: j, open: true };
      j++;
    }
    return { text: src.slice(start), end: n, open: false };
  };

  // Modos para JSX: 'tag' (dentro de <div ...>) e 'kids' (texto entre as tags). 'expr' = { } dentro do JSX.
  const modes = [];
  const top = () => modes[modes.length - 1];
  const JSX_PREV = new Set(['(', ',', 'return', '=>', '?', ':', '&&', '||', '{', '}', '=', '[', '??']);
  const lastSig = () => { for (let j = out.length - 1; j >= 0; j--) if (out[j].t !== 'ws' && out[j].t !== 'c') return out[j]; return null; };

  while (i < n) {
    const c = src[i];
    const two = src.slice(i, i + 2);
    const mode = top();
    if (lang === 'js' && mode?.m === 'tag') {
      if (/\s/.test(c)) { let j = i; while (j < n && /\s/.test(src[j])) j++; push('ws', src.slice(i, j)); i = j; continue; }
      if (c === '/' ) { push('tagp', '/'); mode.self = !mode.named || mode.closing ? mode.self : true; if (!mode.named) mode.closing = true; i++; continue; }
      if (c === '>') {
        push('tagp', '>'); i++;
        modes.pop();
        if (mode.closing) { if (top()?.m === 'kids') modes.pop(); }
        else if (!mode.self) modes.push({ m: 'kids' });
        continue;
      }
      if (c === '{') { push('br', '{'); modes.push({ m: 'expr', brace: 0 }); i++; continue; }
      if (c === '"' || c === "'") { const s = readString(c); push('s', s); i += s.length; continue; }
      if (c === '=') { push('op', '='); i++; continue; }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i + 1; while (j < n && /[\w$.:-]/.test(src[j])) j++;
        const w = src.slice(i, j);
        if (!mode.named) { push(/^[A-Z]/.test(w) ? 'type' : 'tag', w); mode.named = true; } else push('attr', w);
        i = j; continue;
      }
      push('p', c); i++; continue;
    }
    if (lang === 'js' && mode?.m === 'kids') {
      if (c === '<') { push('tagp', '<'); modes.push({ m: 'tag', named: false, closing: src[i + 1] === '/', self: false }); i++; if (src[i] === '/') { push('tagp', '/'); i++; } continue; }
      if (c === '{') { push('br', '{'); modes.push({ m: 'expr', brace: 0 }); i++; continue; }
      let j = i; while (j < n && src[j] !== '<' && src[j] !== '{') j++;
      const txt = src.slice(i, j);
      // separa espaços (para a indentação colorida) do texto
      txt.split(/(\s+)/).forEach((part) => { if (part) push(/^\s+$/.test(part) ? 'ws' : 'jsxt', part); });
      i = j; continue;
    }
    if (lang === 'js' && mode?.m === 'expr') {
      if (c === '{') mode.brace++;
      else if (c === '}' && !templ.length) {
        if (mode.brace === 0) { push('br', '}'); modes.pop(); i++; continue; }
        mode.brace--;
      }
    }
    // início de JSX: "<div" ou "<>" depois de "(", "return", "=>", "&&"...
    if (lang === 'js' && c === '<' && /[A-Za-z>]/.test(src[i + 1] || '')) {
      const ls = lastSig();
      const generic = /^<[A-Za-z_]\w*\s*(,|extends\b)/.test(src.slice(i, i + 40)); // <T,>(x) => … é genérico do TS
      if (!generic && (!ls || JSX_PREV.has(ls.v) || ls.t === 'tagp')) {
        push('tagp', '<'); i++;
        if (src[i] === '>') { push('tagp', '>'); i++; modes.push({ m: 'kids' }); continue; }
        modes.push({ m: 'tag', named: false, closing: false, self: false });
        continue;
      }
    }
    // espaço
    if (/\s/.test(c)) { let j = i; while (j < n && /\s/.test(src[j])) j++; push('ws', src.slice(i, j)); i = j; continue; }
    // comentário de linha
    if (src.startsWith(line, i) || (hashToo && c === '#' && src[i + 1] !== '[')) {
      let j = src.indexOf('\n', i); if (j < 0) j = n; push('c', src.slice(i, j)); i = j; continue;
    }
    // comentário de bloco
    if (block && two === '/*') { let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; push('c', src.slice(i, j)); i = j; continue; }
    // template string (e o fim de um ${ })
    if (lang === 'js' && c === '`') {
      const r = readTemplate(i + 1); push('s', '`' + r.text); i = r.end;
      if (r.open) { push('br', '${'); templ.push(0); i += 2; }
      continue;
    }
    if (templ.length && c === '}' && templ.at(-1) === 0) {
      templ.pop(); push('br', '}');
      const r = readTemplate(i + 1); if (r.text) push('s', r.text); i = r.end;
      if (r.open) { push('br', '${'); templ.push(0); i += 2; }
      continue;
    }
    // strings
    if (c === '"' || c === "'") {
      const s = readString(c); push('s', s); i += s.length; continue;
    }
    // variável PHP / shell
    if (c === '$' && (lang === 'php' || lang === 'bash') && /[A-Za-z_{]/.test(src[i + 1] || '')) {
      let j = i + 1; while (j < n && /[\w]/.test(src[j])) j++; push('var', src.slice(i, j)); i = j; continue;
    }
    // números
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || '') && !isWord(src[i - 1] || ''))) {
      let j = i; while (j < n && /[0-9a-fA-FxXoObB_.eE]/.test(src[j])) j++; push('n', src.slice(i, j)); i = j; continue;
    }
    // palavras
    if (isWord(c) || c === '@') {
      let j = i + 1; while (j < n && (isWord(src[j]) || (lang === 'http' && src[j] === '-') || (lang === 'yaml' && src[j] === '-' && isWord(src[j + 1] || '')))) j++;
      push('w', src.slice(i, j)); i = j; continue;
    }
    // colchetes
    if ('([{'.includes(c)) { if (templ.length && c === '{') templ[templ.length - 1]++; push('br', c); i++; continue; }
    if (')]}'.includes(c)) { if (templ.length && c === '}') templ[templ.length - 1]--; push('br', c); i++; continue; }
    // operadores e pontuação
    const op = src.slice(i).match(/^(=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?=?|\?\.|\.\.\.|::|->|\+\+|--|\*\*|[+\-*/%=<>!&|^~?:])/);
    if (op) { push('op', op[0]); i += op[0].length; continue; }
    push('p', c); i++;
  }
  classify(out, lang);
  return { tokens: out, lang };
}

const prevSig = (t, k) => { for (let j = k - 1; j >= 0; j--) if (t[j].t !== 'ws' && t[j].t !== 'c') return { tok: t[j], j }; return { tok: null, j: -1 }; };
const nextSig = (t, k) => { for (let j = k + 1; j < t.length; j++) if (t[j].t !== 'ws' && t[j].t !== 'c') return { tok: t[j], j }; return { tok: null, j: t.length }; };

function classify(t, lang) {
  for (let k = 0; k < t.length; k++) {
    const tok = t[k];
    if (tok.t !== 'w') continue;
    const v = tok.v;
    const { tok: prev } = prevSig(t, k);
    const { tok: next } = nextSig(t, k);
    const pv = prev?.v;
    const lower = v.toLowerCase();

    if (lang === 'sql') {
      if (SQL_KW.has(lower)) tok.t = 'k';
      else if (CONSTS.has(v)) tok.t = 'n';
      else if (next?.v === '(') tok.t = 'f';
      else if (pv === '.') tok.t = 'prop';
      continue;
    }
    if (lang === 'yaml' || lang === 'http' || lang === 'ini') {
      if (next?.v === ':' || (lang === 'ini' && next?.v === '=')) tok.t = 'prop';
      else if (CONSTS.has(v) || /^(true|false|yes|no|on|off)$/i.test(v)) tok.t = 'n';
      else if (lang === 'http' && /^(GET|POST|PUT|PATCH|DELETE|HTTP)$/.test(v)) tok.t = 'k';
      continue;
    }
    if (lang === 'bash') {
      const atStart = !prev || /\n/.test(t[k - 1]?.v || '') || ['|', '&&', ';'].includes(pv);
      if (atStart) tok.t = 'f';
      else if (/^-/.test(t[k - 1]?.v || '')) tok.t = 'prop';
      continue;
    }
    if (lang === 'graphql' && GQL_KW.has(v)) { tok.t = 'k'; continue; }

    // js / ts / php / graphql / promql
    const kw = lang === 'php' ? PHP_KW.has(lower) : JS_KW.has(v);
    if (v === 'this' || v === 'self' || v === 'parent' || v === 'super') { tok.t = 'this'; continue; }
    if (CONSTS.has(v)) { tok.t = 'n'; continue; }
    if (kw && pv !== '.' && pv !== '?.' && pv !== '->' && pv !== '::' && (next?.v !== ':' || v === 'default' || v === 'case')) { tok.t = 'k'; continue; }
    if (v[0] === '@') { tok.t = 'f'; continue; } // decorators do Nest
    if (pv === 'function' || pv === 'fn') { tok.t = 'fdef'; continue; }
    if (DEF_TYPE.has(pv)) { tok.t = 'type'; continue; }
    if (DEF_VAR.has(pv)) { tok.t = 'vdef'; continue; }
    if (next?.v === '(' || (next?.v === '=' && nextSig(t, nextSig(t, k).j).tok?.v === '(' && false)) {
      tok.t = (pv === '.' || pv === '?.' || pv === '->' || pv === '::') ? 'f' : (/^[A-Z]/.test(v) && pv === 'new' ? 'type' : 'f'); continue;
    }
    if (pv === '.' || pv === '?.' || pv === '->') { tok.t = 'prop'; continue; }
    if (pv === '::') { tok.t = /^[A-Z_0-9]+$/.test(v) ? 'n' : 'prop'; continue; }
    if (/^[A-Z][A-Z0-9_]+$/.test(v)) { tok.t = 'n'; continue; }
    if (/^[A-Z]/.test(v)) { tok.t = 'type'; continue; }
    if (next?.v === ':' && ['{', ','].includes(pv) && lang === 'js') { tok.t = 'prop'; continue; }
  }
  if (lang === 'js' || lang === 'php') { markDestructuring(t); markParams(t); markUses(t); }
}

// const { a, b } = … e const [x, setX] = …: cada nome é uma variável declarada
function markDestructuring(t) {
  for (let k = 0; k < t.length; k++) {
    if (!(t[k].t === 'k' && DEF_VAR.has(t[k].v))) continue;
    const { tok: open, j } = nextSig(t, k);
    if (!open || open.t !== 'br' || !'{['.includes(open.v)) continue;
    let d = 0;
    for (let m = j; m < t.length; m++) {
      const x = t[m];
      if (x.t === 'br') { if ('{[('.includes(x.v)) d++; else if ('}])'.includes(x.v)) { d--; if (d === 0) break; } continue; }
      if ((x.t === 'w' || x.t === 'prop') && nextSig(t, m).tok?.v !== ':') x.t = 'vdef';
    }
  }
}

// Usos: depois de declarar "timer" ou receber o parâmetro "term", todo uso tem a mesma cor
function markUses(t) {
  const vars = new Set(t.filter((x) => x.t === 'vdef').map((x) => x.v));
  const params = new Set(t.filter((x) => x.t === 'param').map((x) => x.v));
  for (let k = 0; k < t.length; k++) {
    const x = t[k];
    if (x.t !== 'w' && x.t !== 'prop') continue;
    const pv = prevSig(t, k).tok?.v;
    if (pv === '.' || pv === '?.' || pv === '->') continue; // .timer é propriedade de outro objeto
    if (x.t === 'prop' && nextSig(t, k).tok?.v === ':') continue; // chave de objeto
    if (params.has(x.v)) x.t = 'puse';
    else if (vars.has(x.v)) x.t = 'vuse';
  }
}

// Parâmetros: function nome(a, b), (a, b) => ..., a => ...
function markParams(t) {
  const matchOpen = (k) => { let d = 0; for (let j = k; j >= 0; j--) { if (t[j].t !== 'br') continue; if (')]}'.includes(t[j].v)) d++; else if ('([{'.includes(t[j].v[0])) { d--; if (d === 0) return j; } } return -1; };
  const matchClose = (k) => { let d = 0; for (let j = k; j < t.length; j++) { if (t[j].t !== 'br') continue; if ('([{'.includes(t[j].v[0]) && t[j].v !== '}') d++; else if (t[j].v === '${') d++; else if (')]}'.includes(t[j].v)) { d--; if (d === 0) return j; } } return -1; };
  const mark = (a, b) => {
    for (let j = a + 1; j < b; j++) {
      const x = t[j];
      if ((x.t === 'w' || x.t === 'var' || x.t === 'prop') && !JS_KW.has(x.v)) {
        const p = prevSig(t, j).tok?.v;
        if (p === ':' || p === '=' || p === '?') continue; // tipo ou valor padrão
        x.t = 'param';
      }
    }
  };
  for (let k = 0; k < t.length; k++) {
    const x = t[k];
    if (x.t === 'op' && x.v === '=>') {
      const { tok: p, j } = prevSig(t, k);
      if (p?.v === ')') { const o = matchOpen(j); if (o >= 0) mark(o, j); }
      else if (p && (p.t === 'w' || p.t === 'vdef' || p.t === 'param')) p.t = 'param';
    }
    if (x.t === 'fdef' || (x.t === 'f' && prevSig(t, k).tok?.v === 'function')) {
      const { tok: p, j } = nextSig(t, k);
      if (p?.v === '(') { const c = matchClose(j); if (c >= 0) mark(j, c); }
    }
  }
}

/** HTML colorido. Cada colchete tem a cor do nível e data-p igual ao do seu par. */
export function highlight(src, lang) {
  const { tokens } = tokenize(src.replace(/\r/g, ''), lang);
  // indentação: unidade de 2 ou 4 espaços
  const indents = src.split('\n').map((l) => l.match(/^ */)[0].length).filter((x) => x > 0);
  const unit = indents.length && Math.min(...indents) >= 4 && indents.every((x) => x % 4 === 0) ? 4 : 2;
  let html = '';
  let atLineStart = true;
  const stack = [];
  let pid = 0;
  const indentHtml = (ws) => {
    // ws começa no início da linha: pinta cada nível
    let s = '';
    let k = 0; let level = 0;
    while (k < ws.length) {
      if (ws[k] === '\t') { s += `<span class="ind ind-${level % 4}">\t</span>`; k++; level++; continue; }
      const chunk = ws.slice(k, k + unit);
      if (chunk.length === unit && /^ +$/.test(chunk)) { s += `<span class="ind ind-${level % 4}">${chunk}</span>`; k += unit; level++; }
      else { s += ws.slice(k); break; }
    }
    return s;
  };
  for (const tok of tokens) {
    if (tok.t === 'ws') {
      const parts = tok.v.split('\n');
      parts.forEach((p, idx) => {
        if (idx > 0) { html += '\n'; atLineStart = true; }
        if (!p) return;
        html += atLineStart ? indentHtml(p) : p;
      });
      continue;
    }
    if (tok.t === 'br') {
      const open = '([{'.includes(tok.v[0]) || tok.v === '${';
      if (open) {
        const id = ++pid; const depth = stack.length; stack.push({ v: tok.v, id, depth });
        html += `<span class="br br-${depth % 3}" data-p="${id}">${esc(tok.v)}</span>`;
      } else {
        const want = { ')': '(', ']': '[', '}': '{' }[tok.v];
        const top = stack[stack.length - 1];
        if (top && (top.v === want || (tok.v === '}' && top.v === '${'))) {
          stack.pop(); html += `<span class="br br-${top.depth % 3}" data-p="${top.id}">${esc(tok.v)}</span>`;
        } else html += `<span class="br br-bad" title="sem par">${esc(tok.v)}</span>`;
      }
      atLineStart = false;
      continue;
    }
    atLineStart = false;
    const cls = { k: 'k', s: 's', c: 'c', n: 'n', f: 'f', fdef: 'f', type: 't', vdef: 'v', vuse: 'v', param: 'pa', puse: 'pa', var: 'v', prop: 'pr', this: 'th', op: 'o', tag: 'tag', tagp: 'tp', attr: 'at' }[tok.t];
    // comentário/string com várias linhas: fecha e reabre o span a cada linha para a indentação não herdar a cor
    html += cls ? `<span class="tk-${cls}">${esc(tok.v)}</span>` : esc(tok.v);
  }
  // colchetes que ficaram abertos: marca como sem par
  for (const s of stack) html = html.replace(`class="br br-${s.depth % 3}" data-p="${s.id}"`, 'class="br br-bad" title="sem par"');
  return html;
}

/** Bloco de código pronto: <pre class="hl"><code>…</code></pre>. */
export const codeBlock = (src, lang) => `<pre class="hl"><code>${highlight(src, lang)}</code></pre>`;

/** Legenda das cores (para quem está aprendendo a ler código). */
export function legendHtml(lang) {
  const L = lang === 'en'
    ? [['k', 'keyword'], ['f', 'function'], ['v', 'variable'], ['pa', 'parameter'], ['n', 'constant / number'], ['t', 'type / class / component'], ['s', 'text (string)'], ['c', 'comment'], ['pr', 'property']]
    : [['k', 'palavra-chave'], ['f', 'função'], ['v', 'variável'], ['pa', 'parâmetro'], ['n', 'constante / número'], ['t', 'tipo / classe / componente'], ['s', 'texto (string)'], ['c', 'comentário'], ['pr', 'propriedade']];
  const tip = lang === 'en'
    ? 'Brackets <span class="br br-0">(</span><span class="br br-1">{</span><span class="br br-2">[</span> change color by level: the opening and closing of the same block share a color. Hover or put the cursor on one to highlight its pair. The colored bands on the left are indentation levels.'
    : 'Os colchetes <span class="br br-0">(</span><span class="br br-1">{</span><span class="br br-2">[</span> mudam de cor por nível: a abertura e o fechamento do mesmo bloco têm a mesma cor. Passe o mouse ou coloque o cursor em um para destacar o par. As faixas coloridas à esquerda são os níveis de indentação.';
  return `<div class="code-legend"><div class="code-legend-items">${L.map(([c, n]) => `<span class="tk-${c}">${n}</span>`).join('')}</div><p>${tip}</p></div>`;
}

/** Destaca o par de um colchete ao passar o mouse (em qualquer bloco colorido). */
export function initBracketHover() {
  let on = [];
  const clear = () => { on.forEach((e) => e.classList.remove('br-match')); on = []; };
  document.addEventListener('pointerover', (e) => {
    const b = e.target.closest?.('.br[data-p]');
    if (!b) return;
    clear();
    const root = b.closest('pre') || document;
    on = [...root.querySelectorAll(`.br[data-p="${b.dataset.p}"]`)];
    on.forEach((x) => x.classList.add('br-match'));
  });
  document.addEventListener('pointerout', (e) => { if (e.target.closest?.('.br[data-p]')) clear(); });
}

/**
 * Editor com cores: um <pre> colorido atrás de um <textarea> transparente.
 * Mantém o textarea (copiar, colar, desfazer funcionam normal) e acende o par do colchete no cursor.
 */
export function attachHighlighter(textarea, lang) {
  const wrap = document.createElement('div');
  wrap.className = 'code-wrap';
  const pre = document.createElement('pre');
  pre.className = 'hl code-hl';
  pre.setAttribute('aria-hidden', 'true');
  const code = document.createElement('code');
  pre.append(code);
  textarea.parentNode.insertBefore(wrap, textarea);
  wrap.append(pre, textarea);
  textarea.classList.add('code-input');

  const render = () => {
    code.innerHTML = highlight(textarea.value, lang) + '\n';
    sync(); matchCaret();
  };
  const sync = () => { pre.scrollTop = textarea.scrollTop; pre.scrollLeft = textarea.scrollLeft; };

  // offset do texto → colchete, para achar o par no cursor
  const matchCaret = () => {
    code.querySelectorAll('.br-match').forEach((e) => e.classList.remove('br-match'));
    if (document.activeElement !== textarea || textarea.selectionStart !== textarea.selectionEnd) return;
    const p = textarea.selectionStart;
    const v = textarea.value;
    const cand = [p - 1, p].filter((x) => x >= 0 && '()[]{}'.includes(v[x]));
    if (!cand.length) return;
    // conta quantos colchetes vêm antes do escolhido (na mesma ordem dos spans .br)
    const target = cand[0];
    let idx = 0;
    const { tokens } = tokenize(v, lang);
    let off = 0;
    for (const tk of tokens) {
      if (tk.t === 'br') { if (off <= target && target < off + tk.v.length) break; idx++; }
      off += tk.v.length;
    }
    const spans = code.querySelectorAll('.br');
    const el = spans[idx];
    if (!el?.dataset.p) return;
    code.querySelectorAll(`.br[data-p="${el.dataset.p}"]`).forEach((x) => x.classList.add('br-match'));
  };

  textarea.addEventListener('input', render);
  textarea.addEventListener('scroll', sync);
  ['keyup', 'click', 'focus', 'blur'].forEach((ev) => textarea.addEventListener(ev, matchCaret));
  document.addEventListener('selectionchange', () => { if (document.activeElement === textarea) matchCaret(); });
  render();
  return { render };
}
