// Valida o banco de perguntas: campos obrigatórios nos dois idiomas, ids únicos,
// referências a vagas/temas/tipos existentes e uma rubrica para cada pergunta.
// Uso: node scripts/validate.mjs

import { questions } from '../data/index.js';
import { rubrics } from '../data/rubrics.js';
import { jobs, cats, types } from '../data/meta.js';
import { md } from '../assets/md.js';
import { labs } from '../labs/web/index.js';
import { glossary } from '../data/glossary.js';
import { extraJobs, reported as reportedMap, sources } from '../data/evidence.js';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { storyIds } from '../data/stories/index.js';
import { paths } from '../data/paths.js';
import { cards as measureCards, areas as measureAreas, method as measureMethod } from '../data/measure.js';
import { parseStory, findCast, STATE, stories as allStories } from '../assets/story.js';
import { execFileSync } from 'node:child_process';

const errors = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const bilingual = (v) => v && typeof v.pt === 'string' && v.pt.trim() && typeof v.en === 'string' && v.en.trim();

const ids = new Set();
for (const q of questions) {
  const id = q.id || '(sem id)';
  if (!/^[a-z0-9-]+$/.test(q.id || '')) err(id, 'id deve ser kebab-case');
  if (ids.has(q.id)) err(id, 'id duplicado');
  ids.add(q.id);

  if (!cats[q.cat]) err(id, `tema desconhecido "${q.cat}"`);
  if (!types[q.type]) err(id, `tipo desconhecido "${q.type}"`);
  if (!Array.isArray(q.jobs) || !q.jobs.length) err(id, 'sem vagas');
  else q.jobs.forEach((j) => { if (!jobs[j]) err(id, `vaga desconhecida "${j}"`); });

  for (const f of ['q', 'a', 'flags', 'anchor']) if (!bilingual(q[f])) err(id, `campo "${f}" precisa de pt e en`);
  if (!Array.isArray(q.follow) || q.follow.length < 1) err(id, 'precisa de pelo menos um follow-up');
  else q.follow.forEach((f, i) => { if (!bilingual(f)) err(id, `follow[${i}] precisa de pt e en`); });

  if (q.code) {
    const list = Array.isArray(q.code) ? q.code : [q.code];
    list.forEach((c, i) => {
      if (typeof c.src !== 'string' || !c.src.trim()) err(id, `code[${i}] sem src`);
      if (c.label && !bilingual(c.label)) err(id, `code[${i}].label precisa de pt e en`);
    });
  }
  if (q.type === 'code' && !q.code) err(id, 'tipo "code" sem bloco de código');
  if (q.reported) {
    if (!Array.isArray(q.reported) || !q.reported.length) err(id, 'reported deve ser uma lista de fontes');
    else q.reported.forEach((x, i) => {
      const s = sources[x.src];
      if (!s) return err(id, `reported[${i}]: fonte desconhecida "${x.src}"`);
      if (!bilingual(x.quote)) err(id, `reported[${i}].quote precisa de pt e en`);
      if (x.note && !bilingual(x.note)) err(id, `reported[${i}].note precisa de pt e en`);
    });
  }

  const r = rubrics[q.id];
  if (!r) err(id, 'sem rubrica em data/rubrics.js');
  else {
    if (!Array.isArray(r.points) || r.points.length < 3) err(id, 'rubrica precisa de 3+ pontos');
    else r.points.forEach((p, i) => { if (!bilingual(p)) err(id, `points[${i}] precisa de pt e en`); });
    if (!Array.isArray(r.tools) || !r.tools.length) err(id, 'rubrica sem ferramentas');
    if (!Array.isArray(r.metrics)) err(id, 'rubrica: metrics deve ser array');
  }

  // O markdown precisa renderizar e não pode vazar HTML cru.
  for (const lang of ['pt', 'en']) {
    const html = md(q.a?.[lang] || '');
    if (/<script/i.test(html)) err(id, 'markdown gerou <script>');
  }
}

for (const id of Object.keys(rubrics)) if (!ids.has(id)) err(id, 'rubrica órfã (sem pergunta)');

// ---- evidências
for (const id of [...Object.keys(extraJobs), ...Object.keys(reportedMap)]) if (!ids.has(id)) err(`evidence:${id}`, 'pergunta inexistente');
for (const [k, s] of Object.entries(sources)) {
  if (!['relato', 'guia', 'vaga'].includes(s.kind)) err(`fonte:${k}`, 'kind deve ser relato, guia ou vaga');
  for (const f of ['role', 'when', 'stage']) if (!bilingual(s[f])) err(`fonte:${k}`, `${f} precisa de pt e en`);
  if (s.kind !== 'vaga' && !/^https:\/\//.test(s.url)) err(`fonte:${k}`, 'relato e guia precisam de link https');
}
for (const [id, js] of Object.entries(extraJobs)) js.forEach((j) => { if (!jobs[j]) err(`evidence:${id}`, `vaga desconhecida "${j}"`); });

// ---- labs do navegador
const labIds = new Set();
for (const l of labs) {
  const id = `lab:${l.id}`;
  if (labIds.has(l.id)) err(id, 'id de lab duplicado');
  labIds.add(l.id);
  if (!cats[l.cat]) err(id, `tema desconhecido "${l.cat}"`);
  if (!['js', 'react'].includes(l.kind)) err(id, 'kind deve ser js ou react');
  for (const f of ['title', 'summary', 'what', 'watch']) if (!bilingual(l[f])) err(id, `campo "${f}" precisa de pt e en`);
  if (!Array.isArray(l.try) || !l.try.length) err(id, 'precisa de itens em "try"');
  else l.try.forEach((x, i) => { if (!bilingual(x)) err(id, `try[${i}] precisa de pt e en`); });
  (l.questions || []).forEach((q) => { if (!ids.has(q)) err(id, `pergunta inexistente "${q}"`); });
  if (l.story) for (const lg of ['pt', 'en']) if (!existsSync(`labs/web/${l.id}/story.${lg}.md`)) err(id, `história não existe: story.${lg}.md`);
  for (const file of [l.main, l.setup].filter(Boolean)) {
    const path = `labs/web/${l.id}/${file}`;
    if (!existsSync(path)) { err(id, `arquivo não existe: ${path}`); continue; }
    if (file.endsWith('.js')) {
      try { execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' }); }
      catch (e) { err(id, `erro de sintaxe em ${path}: ${String(e.stderr).split('\n').slice(0, 4).join(' ')}`); }
    }
  }
}

// ---- histórias das perguntas (sempre pt + en)
const storyFiles = readdirSync('data/stories').filter((f) => f.endsWith('.md'));
for (const f of storyFiles) { const sid = f.replace(/\.(pt|en)\.md$/, ''); if (!storyIds.has(sid)) err(`história:${f}`, 'não está em data/stories/index.js'); }
for (const sid of storyIds) {
  if (!ids.has(sid)) err(`história:${sid}`, 'pergunta inexistente');
  for (const lg of ['pt', 'en']) if (!existsSync(`data/stories/${sid}.${lg}.md`)) err(`história:${sid}`, `falta ${sid}.${lg}.md`);
}
// formato das histórias: título, elenco, cenas, entrevista e toda fala de alguém do elenco
for (const st of allStories) for (const lg of ['pt', 'en']) {
  const path = `${st.base}.${lg}.md`;
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8');
  const s = parseStory(text);
  const id = `história:${path}`;
  if (!s.title) err(id, 'sem título (# ...)');
  if (s.cast.length < 2) err(id, 'elenco com menos de 2 personagens (## 🎭 ...)');
  const castLines = (text.split('## 🎭')[1] || '').split('\n## ')[0].split('\n').filter((l) => l.startsWith('- ')).length;
  if (castLines !== s.cast.length) err(id, 'linha do elenco fora do formato "- emoji **Nome** · código · quem é"');
  if (!s.scenes.length) err(id, 'sem cenas (## 🎬 ...)');
  if (!s.interview) err(id, 'sem a seção 🎤');
  for (const sc of s.scenes) {
    const filled = sc.lines.filter((l) => l.trim() && !l.startsWith('> ')); // um aviso (> 🚨) pode fechar a cena depois do painel
    if (!filled.some((l) => STATE.test(l))) err(id, `cena "${sc.title}" sem painel técnico (= emoji Rótulo: valor)`);
    else if (!STATE.test(filled[filled.length - 1])) err(id, `cena "${sc.title}" precisa terminar com o painel técnico`);
  }
  for (const sc of [...s.scenes, ...(s.moral ? [s.moral] : []), ...s.extras]) for (const l of sc.lines) {
    const m = l.match(/^\*\*(.+?)\*\*(?:\s*_\((.+?)\)_)?\s*:\s*(.*)$/);
    if (m && sc.kind === 'extra' && !/^["“]/.test(m[3])) continue; // nos extras, só é fala o que vem entre aspas
    if (m && !findCast(s, m[1])) err(id, `"${m[1]}" fala mas não está no elenco`);
  }
}
const withStory = questions.filter((q) => storyIds.has(q.id) || labs.some((l) => l.story && (l.questions || []).includes(q.id))).length;

// ---- como medir
if (!bilingual(measureMethod)) err('medir', 'roteiro precisa de pt e en');
const mIds = new Set();
for (const c of measureCards) {
  const id = `medir:${c.id}`;
  if (mIds.has(c.id)) err(id, 'id duplicado'); mIds.add(c.id);
  if (!measureAreas[c.area]) err(id, `área desconhecida "${c.area}"`);
  for (const f of ['title', 'why', 'say']) if (!bilingual(c[f])) err(id, `${f} precisa de pt e en`);
  if (!c.metrics?.length) err(id, 'sem métricas');
  c.metrics?.forEach((m, i) => { if (!bilingual(m.name) || !bilingual(m.good)) err(id, `metrics[${i}] precisa de pt e en`); });
  if (!c.tools?.length) err(id, 'sem ferramentas');
  if (!Array.isArray(c.steps?.pt) || c.steps.pt.length !== c.steps.en?.length || !c.steps.pt.length) err(id, 'steps.pt e steps.en precisam ter o mesmo número de passos');
  c.labs.forEach((l) => { if (!labIds.has(l)) err(id, `lab inexistente "${l}"`); });
  (c.nodeLabs || []).forEach((f) => { if (!existsSync(`labs/node/${f}`)) err(id, `lab Node inexistente "${f}"`); });
  c.questions.forEach((q) => { if (!ids.has(q)) err(id, `pergunta inexistente "${q}"`); });
}

// ---- trilhas por vaga
const storyAll = new Set(allStories.map((x) => x.id));
for (const [k, p] of Object.entries(paths)) {
  const id = `trilha:${k}`;
  if (!jobs[k]) err(id, 'vaga desconhecida');
  if (!bilingual(p.why)) err(id, 'why precisa de pt e en');
  p.stops.forEach((st, i) => {
    if (!bilingual(st.title)) err(id, `parada ${i + 1} sem título pt/en`);
    if (!st.items.some((x) => x.kind === 'q')) err(id, `parada ${i + 1} sem pergunta`);
    st.items.forEach((x) => {
      const ok = { q: ids, lab: labIds, story: storyAll, measure: mIds }[x.kind];
      if (!ok?.has(x.id)) err(id, `parada ${i + 1}: ${x.kind} inexistente "${x.id}"`);
    });
  });
}

// ---- glossário
const gIds = new Set();
for (const g of glossary) {
  if (gIds.has(g.id)) err(`glossário:${g.id}`, 'id duplicado');
  gIds.add(g.id);
  if (!bilingual(g.short) || !bilingual(g.long)) err(`glossário:${g.id}`, 'short/long precisam de pt e en');
  const n = (g.terms.pt?.length || 0) + (g.terms.en?.length || 0) + (g.terms.code?.length || 0);
  if (!n) err(`glossário:${g.id}`, 'sem termos');
}

// ---- labs Node (só sintaxe; rodar exige o terminal)
for (const f of ['01-event-loop-node.cjs', '02-bloqueio-event-loop.mjs', '03-streams-backpressure.mjs', '04-graceful-shutdown.mjs', '05-outbox-sqlite.mjs']) {
  const path = `labs/node/${f}`;
  if (!existsSync(path)) { err('lab-node', `arquivo não existe: ${path}`); continue; }
  try { execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' }); }
  catch (e) { err('lab-node', `erro de sintaxe em ${path}`); }
}

const byCat = Object.fromEntries(Object.keys(cats).map((c) => [c, 0]));
questions.forEach((q) => { byCat[q.cat] = (byCat[q.cat] || 0) + 1; });
const byJob = Object.fromEntries(Object.keys(jobs).map((j) => [j, questions.filter((q) => q.jobs.includes(j)).length]));

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s):\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${questions.length} perguntas válidas, ${Object.values(rubrics).reduce((s, r) => s + r.points.length, 0)} pontos de rubrica`);
console.log('  por tema:', byCat);
console.log('  por vaga:', byJob);
console.log(`✓ ${withStory}/${questions.length} perguntas com história (pt + en)`);
console.log(`✓ ${measureCards.length} guias de medição, ${Object.keys(paths).length} trilhas por vaga`);
console.log(`✓ ${labs.length} labs no navegador, ${glossary.length} termos no glossário, 5 labs Node`);
