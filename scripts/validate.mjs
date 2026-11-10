// Valida o banco de perguntas: campos obrigatórios nos dois idiomas, ids únicos,
// referências a vagas/temas/tipos existentes e uma rubrica para cada pergunta.
// Uso: node scripts/validate.mjs

import { questions } from '../data/index.js';
import { rubrics } from '../data/rubrics.js';
import { jobs, cats, types } from '../data/meta.js';
import { md } from '../assets/md.js';

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
