// "Comece aqui": o mapa do app, a trilha de estudo por vaga (com progresso)
// e, recolhidos, o processo de uma vaga sênior e como ler os labs.

import { md, escapeHtml } from './md.js';
import { createAnnotator } from './gloss.js';
import { paths } from '../data/paths.js';
import { jobs } from '../data/meta.js';
import { labs } from '../labs/web/index.js';
import { cards as measureCards } from '../data/measure.js';

const KEY = 'devtechnical.path';

const C = {
  pt: {
    title: 'Comece aqui',
    lead: 'Se as perguntas parecem um idioma estranho, é normal: elas resumem anos de prática em poucas linhas. O caminho aqui é **entender com uma história, ver funcionando no lab, saber medir** e só então responder como na entrevista.',
    pathTitle: 'Sua trilha de estudo', pathHint: 'Escolha a vaga. Cada parada junta a história, o lab, o guia de medição e as perguntas do mesmo assunto, na ordem que mais ajuda.',
    progress: (d, n) => `${d} de ${n} perguntas com nota de acerto (80%+)`, next: 'Continuar de onde parei', start: 'Começar a trilha', done: 'Trilha completa! Repita as que caíram abaixo de 80%.',
    kinds: { story: '😂 História', lab: '▶ Lab', measure: '📏 Medir' },
    mapTitle: 'O que tem em cada aba',
    map: [
      ['stories', '😂 Histórias', 'Cada conceito vira uma conversa engraçada, com "quem é quem" no código e o estado do programa a cada cena.'],
      ['lab', '▶ Laboratório', 'Código que roda aqui no navegador: aperte Rodar, quebre de propósito e veja o resultado mudar.'],
      ['measure', '📏 Como medir', 'Qual métrica olhar, em qual ferramenta e onde clicar. A resposta para "como você mediu?".'],
      ['interview', '🎤 Entrevista', 'Uma pergunta por vez, como o recrutador faria. Responda, abra a resposta modelo e marque o checklist.'],
      ['study', '📚 Estudo', 'Todas as perguntas com busca e filtros, para revisar um tema de uma vez.'],
      ['progress', '📊 Progresso', 'Sua nota média e o que está forte ou fraco, por tema.'],
      ['glossary', '📖 Glossário', 'Todos os termos técnicos com explicação curta e longa.'],
    ],
    topTitle: 'Os botões do topo e os selos',
    top: `- **( ) definições**: liga ou desliga a explicação entre parênteses depois de cada termo técnico. Desligado, o termo continua sublinhado: passe o mouse ou toque nele.
- **PT / EN**: troca o idioma de tudo, inclusive histórias e respostas. Treine nos dois.
- **✓ relatada · empresa**: alguém contou que essa pergunta caiu nessa empresa. **📘 guia público** e **📋 está na vaga** dizem que a fonte é um guia ou a descrição da vaga. Na resposta aparecem a fonte e o link.
- **Cores no código**: tema Dracula. Colchetes com a mesma cor abrem e fecham o mesmo bloco; passe o mouse para acender o par.`,
    howTitle: 'Como estudar um tema (o ciclo)',
    how: [
      ['Leia a história', 'Comece pelo **Quem é quem** e siga o painel 📋 de cada cena. O lado técnico fica separado, no fim.', '#/stories'],
      ['Rode o lab e quebre', 'Aperte **Rodar** sem mudar nada. Depois faça os itens de "Experimente mudar", um de cada vez.', '#/lab'],
      ['Explique em voz alta', '"O que acontece é que…". Se travar, volte ao lab. Esse é o teste real.', null],
      ['Saiba como medir', 'Abra o guia ligado ao tema: métrica, ferramenta e onde clicar.', '#/measure'],
      ['Responda como na entrevista', 'Escreva ou fale, abra a resposta modelo e marque no checklist só o que você realmente disse. O app volta nas que você errou.', '#/interview'],
    ],
    go: 'Abrir',
    moreTitle: 'Para ler com calma',
    readTitle: 'Como ler a linha do tempo dos labs',
    read: `Cada coluna é uma "parte" do sistema que roda ao mesmo tempo (cliente, API, banco, fila…). Cada linha é algo que aconteceu, na ordem, com o tempo em milissegundos na esquerda. Quando duas coisas acontecem perto no tempo em colunas diferentes, **elas estão rodando juntas**. É assim que dá para ver uma condição de corrida, uma resposta que chega atrasada ou uma requisição que se repete.`,
    processTitle: 'Como costuma ser o processo de uma vaga sênior',
    process: [
      ['Conversa com recrutador(a) (30 min)', 'Sua trajetória, motivação, salário e inglês. Não é técnica, mas eles anotam se você explica bem o que fez.'],
      ['Entrevista técnica de conceitos (60 min)', 'É aqui que aparecem perguntas como as do app: "explique o event loop", "como evitar cobrar duas vezes". Querem ver se você entende o porquê, não se decorou.'],
      ['Live coding ou teste para casa', 'Você escreve código vendo a pessoa ou entrega um projeto. Contam: código que roda, testes, nomes claros e você explicando as decisões em voz alta.'],
      ['System design (60 min)', 'Desenhar um sistema maior ("um sistema de logs", "um app de corridas"). Não tem resposta certa: avaliam se você pergunta os requisitos e explica as trocas (trade-offs).'],
      ['Comportamental / cultura', 'Histórias reais: um incidente, uma discordância, algo que deu errado. Use o formato STAR (situação, tarefa, ação, resultado).'],
    ],
    tipTitle: 'Uma dica de sinceridade',
    tip: 'Nas lacunas (tecnologias que você ainda não usou em produção), o app diz isso com todas as letras e sugere como responder: "estudei e entendo como funciona; em produção usei X, que resolve o mesmo problema". Recrutador sênior respeita isso muito mais que um "sim" que cai no segundo follow-up.',
  },
  en: {
    title: 'Start here',
    lead: 'If the questions feel like a foreign language, that is normal: they compress years of practice into a few lines. The path here is to **understand it through a story, see it running in the lab, know how to measure it**, and only then answer as you would in the interview.',
    pathTitle: 'Your study path', pathHint: 'Pick the role. Each stop brings together the story, the lab, the measuring guide, and the questions on the same topic, in the order that helps most.',
    progress: (d, n) => `${d} of ${n} questions scored as correct (80%+)`, next: 'Continue where I left off', start: 'Start the path', done: 'Path complete! Repeat the ones below 80%.',
    kinds: { story: '😂 Story', lab: '▶ Lab', measure: '📏 Measure' },
    mapTitle: 'What each tab has',
    map: [
      ['stories', '😂 Stories', 'Each concept becomes a funny conversation, with "who is who" in the code and the program\'s state in every scene.'],
      ['lab', '▶ Lab', 'Code that runs right here in the browser: press Run, break it on purpose, and watch the result change.'],
      ['measure', '📏 How to measure', 'Which metric to watch, in which tool, and where to click. The answer to "how did you measure it?".'],
      ['interview', '🎤 Interview', 'One question at a time, like the recruiter would ask. Answer, open the model answer, and tick the checklist.'],
      ['study', '📚 Study', 'Every question with search and filters, to review a whole topic at once.'],
      ['progress', '📊 Progress', 'Your average score and what\'s strong or weak, by topic.'],
      ['glossary', '📖 Glossary', 'Every technical term with a short and a long explanation.'],
    ],
    topTitle: 'The buttons at the top and the badges',
    top: `- **( ) definitions**: turns the parenthesized explanation after each technical term on or off. When off, the term is still underlined: hover or tap it.
- **PT / EN**: switches the language of everything, including stories and answers. Practice in both.
- **✓ reported · company**: someone said this question came up at that company. **📘 public guide** and **📋 in the job ad** say the source is a guide or the job description. The answer shows the source and the link.
- **Code colors**: Dracula theme. Brackets with the same color open and close the same block; hover to light up the pair.`,
    howTitle: 'How to study a topic (the cycle)',
    how: [
      ['Read the story', 'Start with **Who is who** and follow each scene\'s 📋 panel. The technical side is kept separate, at the end.', '#/stories'],
      ['Run the lab and break it', 'Press **Run** without changing anything. Then do the "Try changing" items one at a time.', '#/lab'],
      ['Explain it out loud', '"What happens is…". If you get stuck, go back to the lab. That\'s the real test.', null],
      ['Know how to measure it', 'Open the guide linked to the topic: metric, tool, and where to click.', '#/measure'],
      ['Answer like in the interview', 'Write or speak, open the model answer, and tick only what you actually said. The app comes back to the ones you missed.', '#/interview'],
    ],
    go: 'Open',
    moreTitle: 'To read when you have time',
    readTitle: 'How to read a lab timeline',
    read: `Each column is a "part" of the system running at the same time (client, API, database, queue…). Each row is something that happened, in order, with the time in milliseconds on the left. When two things happen close in time in different columns, **they are running together**. That is how you can see a race condition, a late response, or a request being repeated.`,
    processTitle: 'What a senior hiring process usually looks like',
    process: [
      ['Recruiter call (30 min)', 'Your background, motivation, salary, and English. Not technical, but they note whether you explain your work clearly.'],
      ['Technical concepts interview (60 min)', 'This is where questions like the ones in the app show up: "explain the event loop", "how do you avoid charging twice". They want the why, not memorization.'],
      ['Live coding or take-home', 'You write code while someone watches, or deliver a project. What counts: code that runs, tests, clear names, and explaining your decisions out loud.'],
      ['System design (60 min)', 'Design a larger system ("a logging system", "a ride app"). There is no single right answer: they assess whether you ask for requirements and explain trade-offs.'],
      ['Behavioral / culture', 'Real stories: an incident, a disagreement, something that went wrong. Use STAR (situation, task, action, result).'],
    ],
    tipTitle: 'A note on honesty',
    tip: 'For gaps (technologies you have not used in production yet), the app says so plainly and suggests how to answer: "I have studied it and understand how it works; in production I used X, which solves the same problem". A senior interviewer respects that far more than a "yes" that collapses on the second follow-up.',
  },
};

const getPath = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const setPath = (v) => { try { localStorage.setItem(KEY, v); } catch { /* sem storage: tudo bem */ } };

export function renderStart(view, { lang, gloss = true, L, questions, scores = {} }) {
  const c = C[lang];
  const ann = createAnnotator(lang, { inline: gloss });
  const current = paths[getPath()] ? getPath() : 'brasilcard';
  const strip = (h) => h.replace(/^<p>|<\/p>$/g, '');

  const qStatus = (id) => {
    const s = scores[id];
    return s == null ? 'pending' : s >= 0.8 ? 'got' : s >= 0.4 ? 'partial' : 'miss';
  };
  const itemHtml = (it) => {
    if (it.kind === 'q') {
      const q = questions.find((x) => x.id === it.id);
      if (!q) return '';
      const text = L(q.q);
      return `<a class="path-item path-q" data-r="${qStatus(it.id)}" href="#/q/${it.id}"><span class="status" data-r="${qStatus(it.id)}"></span>${escapeHtml(text.length > 80 ? text.slice(0, 78) + '…' : text)}</a>`;
    }
    if (it.kind === 'lab') {
      const l = labs.find((x) => x.id === it.id);
      return `<a class="path-item path-chip" href="#/lab/${it.id}">${c.kinds.lab}${l ? `: ${escapeHtml(L(l.title).split(':')[0])}` : ''}</a>`;
    }
    if (it.kind === 'measure') {
      const m = measureCards.find((x) => x.id === it.id);
      return `<a class="path-item path-chip" href="#/measure/${it.id}">${c.kinds.measure}${m ? `: ${escapeHtml(L(m.title))}` : ''}</a>`;
    }
    return `<a class="path-item path-chip" href="#/story/${it.id}">${c.kinds.story}</a>`;
  };

  const pathHtml = (key) => {
    const p = paths[key];
    const qs = p.stops.flatMap((s) => s.items.filter((i) => i.kind === 'q').map((i) => i.id));
    const uniq = [...new Set(qs)];
    const got = uniq.filter((id) => qStatus(id) === 'got').length;
    const nextIdx = p.stops.findIndex((s) => s.items.some((i) => i.kind === 'q' && qStatus(i.id) !== 'got'));
    const started = uniq.some((id) => scores[id] != null);
    return `
      <p class="path-why">${strip(md(L(p.why), ann))}</p>
      <div class="path-progress"><div class="bar"><span class="g" style="width:${uniq.length ? (got / uniq.length) * 100 : 0}%"></span></div><small>${c.progress(got, uniq.length)}</small></div>
      ${nextIdx >= 0 ? `<p><a class="btn primary" href="#path-stop-${nextIdx}">${started ? c.next : c.start} → ${escapeHtml(L(p.stops[nextIdx].title))}</a></p>` : `<p class="hint">${c.done}</p>`}
      <ol class="path-stops">${p.stops.map((s, i) => `
        <li id="path-stop-${i}" class="${i === nextIdx ? 'is-next' : ''}">
          <strong>${escapeHtml(L(s.title))}</strong>
          <div class="path-chips">${s.items.filter((x) => x.kind !== 'q').map(itemHtml).join('')}</div>
          <div class="path-qs">${s.items.filter((x) => x.kind === 'q').map(itemHtml).join('')}</div>
        </li>`).join('')}
      </ol>`;
  };

  view.innerHTML = `
    <article class="start">
      <h1>${c.title}</h1>
      ${md(c.lead, ann)}

      <section class="panel path-box">
        <h2>${c.pathTitle}</h2>
        <p class="hint">${c.pathHint}</p>
        <div class="path-tabs" role="tablist">${Object.keys(paths).map((k) => `<button type="button" role="tab" class="chip-btn" data-path="${k}" aria-pressed="${k === current}">${escapeHtml(L(jobs[k]).split(' · ')[0])}</button>`).join('')}</div>
        <div id="path-body">${pathHtml(current)}</div>
      </section>

      <h2>${c.mapTitle}</h2>
      <div class="app-map">${c.map.map(([r, name, txt]) => `<a class="app-map-card" href="#/${r}"><strong>${name}</strong><span>${txt}</span></a>`).join('')}</div>

      <h2>${c.howTitle}</h2>
      <ol class="steps">${c.how.map(([h, p, href]) => `<li><strong>${h}</strong>${md(p, ann)}${href ? `<a class="step-go" href="${href}">${c.go} →</a>` : ''}</li>`).join('')}</ol>

      <h2>${c.topTitle}</h2>
      <div class="panel">${md(c.top, ann)}</div>

      <h2>${c.moreTitle}</h2>
      <details class="panel more"><summary><strong>${c.readTitle}</strong></summary>${md(c.read, ann)}</details>
      <details class="panel more"><summary><strong>${c.processTitle}</strong></summary>
        <ol class="steps">${c.process.map(([h, p]) => `<li><strong>${h}</strong>${md(p, ann)}</li>`).join('')}</ol></details>
      <details class="panel more anchor"><summary><strong>${c.tipTitle}</strong></summary>${md(c.tip, ann)}</details>
    </article>`;

  view.querySelectorAll('[data-path]').forEach((b) => b.addEventListener('click', () => {
    setPath(b.dataset.path);
    view.querySelectorAll('[data-path]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    view.querySelector('#path-body').innerHTML = pathHtml(b.dataset.path);
  }));
  // âncoras da trilha sem mexer na rota (#/start)
  view.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#path-stop-"]');
    if (!a) return;
    e.preventDefault();
    view.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
