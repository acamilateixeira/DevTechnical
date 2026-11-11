// "Comece aqui": explica em linguagem simples como é uma entrevista técnica sênior
// e como usar o DevTechnical para se preparar.

import { md } from './md.js';
import { createAnnotator } from './gloss.js';

const C = {
  pt: {
    title: 'Comece aqui',
    lead: 'Se as perguntas parecem um idioma estranho, é normal: elas resumem anos de prática em poucas linhas. O caminho aqui é **ver funcionando primeiro** e só depois responder.',
    processTitle: 'Como costuma ser o processo de uma vaga sênior',
    process: [
      ['Conversa com recrutador(a) (30 min)', 'Sua trajetória, motivação, salário e inglês. Não é técnica, mas eles anotam se você explica bem o que fez.'],
      ['Entrevista técnica de conceitos (60 min)', 'É aqui que aparecem perguntas como as do app: "explique o event loop", "como evitar cobrar duas vezes". Querem ver se você entende o porquê, não se decorou.'],
      ['Live coding ou teste para casa', 'Você escreve código vendo a pessoa ou entrega um projeto. Contam: código que roda, testes, nomes claros e você explicando as decisões em voz alta.'],
      ['System design (60 min)', 'Desenhar um sistema maior ("um sistema de logs", "um app de corridas"). Não tem resposta certa: avaliam se você pergunta os requisitos e explica as trocas (trade-offs).'],
      ['Comportamental / cultura', 'Histórias reais: um incidente, uma discordância, algo que deu errado. Use o formato STAR (situação, tarefa, ação, resultado).'],
    ],
    howTitle: 'Como estudar com o DevTechnical (um tema por vez)',
    how: [
      ['Abra um lab no Laboratório', 'Leia "O que é" e aperte **Rodar**. Não mude nada ainda: só observe a tela, os contadores e a linha do tempo.'],
      ['Mexa no código', 'Faça os itens de "Experimente mudar", um de cada vez. Quebre de propósito e veja o que acontece. Se travar, aperte "Restaurar original".'],
      ['Explique para você mesma', 'Em voz alta: "o que acontece é que…". Se não conseguir, volte ao lab. Esse é o teste real.'],
      ['Vá para a pergunta da entrevista', 'Cada lab tem links para as perguntas relacionadas. Responda escrevendo ou falando, depois abra a resposta modelo.'],
      ['Marque o checklist com honestidade', 'Só o que você realmente disse. A nota mostra o que falta. Repita a pergunta outro dia: o app prioriza as que você errou.'],
    ],
    readTitle: 'Como ler a linha do tempo dos labs',
    read: `Cada coluna é uma "parte" do sistema que roda ao mesmo tempo (cliente, API, banco, fila…). Cada linha é algo que aconteceu, na ordem, com o tempo em milissegundos na esquerda. Quando duas coisas acontecem perto no tempo em colunas diferentes, **elas estão rodando juntas**. É assim que dá para ver uma condição de corrida, uma resposta que chega atrasada ou uma requisição que se repete.`,
    tipTitle: 'Uma dica de sinceridade',
    tip: 'Nas lacunas (tecnologias que você ainda não usou em produção), o app diz isso com todas as letras e sugere como responder: "estudei e entendo como funciona; em produção usei X, que resolve o mesmo problema". Recrutador sênior respeita isso muito mais que um "sim" que cai no segundo follow-up.',
    ctaLab: 'Abrir o Laboratório', ctaFirst: 'Começar pelo event loop', ctaInterview: 'Ir para a entrevista',
  },
  en: {
    title: 'Start here',
    lead: 'If the questions feel like a foreign language, that is normal: they compress years of practice into a few lines. The path here is to **see it running first** and only then answer.',
    processTitle: 'What a senior hiring process usually looks like',
    process: [
      ['Recruiter call (30 min)', 'Your background, motivation, salary, and English. Not technical, but they note whether you explain your work clearly.'],
      ['Technical concepts interview (60 min)', 'This is where questions like the ones in the app show up: "explain the event loop", "how do you avoid charging twice". They want the why, not memorization.'],
      ['Live coding or take-home', 'You write code while someone watches, or deliver a project. What counts: code that runs, tests, clear names, and explaining your decisions out loud.'],
      ['System design (60 min)', 'Design a larger system ("a logging system", "a ride app"). There is no single right answer: they assess whether you ask for requirements and explain trade-offs.'],
      ['Behavioral / culture', 'Real stories: an incident, a disagreement, something that went wrong. Use STAR (situation, task, action, result).'],
    ],
    howTitle: 'How to study with DevTechnical (one topic at a time)',
    how: [
      ['Open a lab', 'Read "What it is" and press **Run**. Do not change anything yet: just watch the screen, the counters, and the timeline.'],
      ['Change the code', 'Do the "Try changing" items one at a time. Break it on purpose and see what happens. If you get stuck, press "Restore original".'],
      ['Explain it to yourself', 'Out loud: "what happens is…". If you cannot, go back to the lab. That is the real test.'],
      ['Go to the interview question', 'Each lab links to related questions. Answer by writing or speaking, then open the model answer.'],
      ['Tick the checklist honestly', 'Only what you actually said. The score shows what is missing. Repeat the question another day: the app prioritizes the ones you missed.'],
    ],
    readTitle: 'How to read a lab timeline',
    read: `Each column is a "part" of the system running at the same time (client, API, database, queue…). Each row is something that happened, in order, with the time in milliseconds on the left. When two things happen close in time in different columns, **they are running together**. That is how you can see a race condition, a late response, or a request being repeated.`,
    tipTitle: 'A note on honesty',
    tip: 'For gaps (technologies you have not used in production yet), the app says so plainly and suggests how to answer: "I have studied it and understand how it works; in production I used X, which solves the same problem". A senior interviewer respects that far more than a "yes" that collapses on the second follow-up.',
    ctaLab: 'Open the Lab', ctaFirst: 'Start with the event loop', ctaInterview: 'Go to the interview',
  },
};

const steps = (list, ann) => `<ol class="steps">${list.map(([h, p]) => `<li><strong>${h}</strong>${md(p, ann)}</li>`).join('')}</ol>`;

export function renderStart(view, { lang, gloss = true }) {
  const c = C[lang];
  const ann = createAnnotator(lang, { inline: gloss });
  view.innerHTML = `
    <article class="start">
      <h1>${c.title}</h1>
      ${md(c.lead, ann)}
      <div class="cta-row">
        <a class="btn primary" href="#/lab/event-loop">${c.ctaFirst}</a>
        <a class="btn" href="#/lab">${c.ctaLab}</a>
        <a class="btn ghost" href="#/interview">${c.ctaInterview}</a>
      </div>
      <h2>${c.howTitle}</h2>
      ${steps(c.how, ann)}
      <h2>${c.readTitle}</h2>
      <div class="panel">${md(c.read, ann)}</div>
      <h2>${c.processTitle}</h2>
      ${steps(c.process, ann)}
      <h2>${c.tipTitle}</h2>
      <div class="panel anchor">${md(c.tip, ann)}</div>
    </article>`;
}
