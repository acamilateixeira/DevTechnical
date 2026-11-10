export default [
  {
    id: 'scrum-ceremonies-estimation',
    cat: 'agile', type: 'concept', jobs: ['brainrocket', 'elastic', 'cv'],
    tags: ['Scrum', 'sprint', 'story points', 'estimation', 'refinement', 'retrospective', 'Kanban'],
    q: {
      pt: 'Explique os papéis, eventos e artefatos do Scrum. Como você estima, e o que faz quando a sprint claramente não vai fechar?',
      en: 'Explain Scrum roles, events, and artifacts. How do you estimate, and what do you do when the sprint clearly will not close?',
    },
    a: {
      pt: `**Papéis**: Product Owner (maximiza valor, ordena o backlog), Scrum Master (remove impedimentos, cuida do processo) e Developers (entregam o incremento).

**Eventos**: Sprint (1–4 semanas), Sprint Planning (o quê e como), Daily (15 min, sincronizar e expor impedimentos, não status para o chefe), Sprint Review (inspecionar o incremento com stakeholders), Retrospective (melhorar o processo). Refinamento é contínuo.

**Artefatos**: Product Backlog (com a meta do produto), Sprint Backlog (com a meta da sprint) e Incremento (que atende à **Definition of Done**).

**Estimativa**: story points são esforço **relativo** (complexidade, incerteza, volume), não horas. Planning poker expõe divergência: quando um estima 2 e outro 13, a conversa revela o risco escondido. Histórias grandes demais (13+) eu quebro em fatias verticais entregáveis. Velocidade serve para previsão do time, nunca para comparar times.

**Sprint que não vai fechar**: avisar cedo, na daily, com dados, não no último dia. Com o PO, renegociar escopo para proteger a **meta da sprint** (o que é essencial vs o que pode ir para a próxima), nunca baixar qualidade ou pular testes para "caber". Depois, levar a causa para a retro: estimativa ruim, dependência externa, trabalho não planejado (suporte de produção) ou histórias mal refinadas.`,
      en: `**Roles**: Product Owner (maximizes value, orders the backlog), Scrum Master (removes impediments, guards the process), and Developers (deliver the increment).

**Events**: the Sprint (1–4 weeks), Sprint Planning (what and how), the Daily (15 min, to sync and surface impediments, not a status report for the boss), Sprint Review (inspect the increment with stakeholders), and the Retrospective (improve the process). Refinement is ongoing.

**Artifacts**: Product Backlog (with the product goal), Sprint Backlog (with the sprint goal), and the Increment (meeting the **Definition of Done**).

**Estimation**: story points measure **relative** effort (complexity, uncertainty, volume), not hours. Planning poker surfaces disagreement: when one person says 2 and another 13, the discussion reveals the hidden risk. I split stories that are too big (13+) into deliverable vertical slices. Velocity is for the team's forecasting, never for comparing teams.

**A sprint that will not close**: flag it early, in the daily, with data, not on the last day. With the PO, renegotiate scope to protect the **sprint goal** (what is essential vs what can move to the next sprint), never cut quality or skip tests to "make it fit". Then take the root cause to the retro: bad estimates, an external dependency, unplanned work (production support), or poorly refined stories.`,
    },
    follow: [
      { pt: 'Scrum ou Kanban? Quando cada um funciona melhor?', en: 'Scrum or Kanban? When does each work better?' },
      { pt: 'Como você lida com suporte de produção interrompendo a sprint?', en: 'How do you handle production support interrupting the sprint?' },
    ],
    flags: {
      pt: 'Converter story point em horas. Ou "a gente faz hora extra para fechar a sprint".',
      en: 'Converting story points into hours. Or "we work overtime to close the sprint".',
    },
    anchor: {
      pt: 'Na Sicoob você atuou em times Scrum com Trello, Planner e GitLab Issue Boards; na ZR System organizou entregas com práticas ágeis; a BrainRocket pede sprints quinzenais com grooming e planning. No Grupo Mysa, sustentação em produção convive com evolução: ótimo exemplo para "trabalho não planejado".',
      en: 'At Sicoob you worked in Scrum teams with Trello, Planner, and GitLab Issue Boards; at ZR System you organized deliveries with agile practices; BrainRocket asks for bi-weekly sprints with grooming and planning. At Grupo Mysa, production support coexists with new work: a great example of "unplanned work".',
    },
  },
  {
    id: 'behavioral-incident-star',
    cat: 'agile', type: 'behavioral', jobs: ['elastic', 'brainrocket', 'frontend', 'cv'],
    tags: ['STAR', 'incident', 'postmortem', 'ownership', 'production'],
    q: {
      pt: 'Me conte sobre o pior incidente de produção que você enfrentou. O que aconteceu, o que você fez e o que mudou depois?',
      en: 'Tell me about the worst production incident you have dealt with. What happened, what did you do, and what changed afterwards?',
    },
    a: {
      pt: `Use **STAR** (Situação, Tarefa, Ação, Resultado), com foco na sua parte e em 2–3 minutos:

- **Situação**: contexto em uma frase e o impacto para o negócio (quem foi afetado, quanto, por quanto tempo).
- **Tarefa**: qual era sua responsabilidade.
- **Ação**: o que *você* fez, em ordem. Um sênior mostra: primeiro **mitigar** (rollback, feature flag, desligar a integração), depois diagnosticar; comunicar status para stakeholders em intervalos; usar dados (logs, métricas, queries) para formar hipóteses, não chutes.
- **Resultado**: a recuperação, com números se tiver, e principalmente o que mudou: **postmortem sem culpados**, teste que reproduz o bug, alerta novo, mudança de processo.

O que o entrevistador quer avaliar: ownership, calma sob pressão, raciocínio de diagnóstico, comunicação e aprendizado sistêmico. Admitir um erro seu e mostrar o que mudou é **positivo**.`,
      en: `Use **STAR** (Situation, Task, Action, Result), focused on your part, in 2–3 minutes:

- **Situation**: one-sentence context and the business impact (who was affected, how much, for how long).
- **Task**: what your responsibility was.
- **Action**: what *you* did, in order. A senior shows: **mitigate** first (rollback, feature flag, disable the integration), then diagnose; send status updates to stakeholders at intervals; use data (logs, metrics, queries) to form hypotheses, not guesses.
- **Result**: the recovery, with numbers if you have them, and above all what changed: a **blameless postmortem**, a test reproducing the bug, a new alert, a process change.

What the interviewer is assessing: ownership, calm under pressure, diagnostic reasoning, communication, and systemic learning. Owning a mistake of yours and showing what changed is a **positive**.`,
    },
    follow: [
      { pt: 'Se acontecesse de novo, o que você faria diferente?', en: 'If it happened again, what would you do differently?' },
      { pt: 'Como você comunicou isso para pessoas não técnicas?', en: 'How did you communicate it to non-technical people?' },
    ],
    flags: {
      pt: 'Culpar outra pessoa ou outro time. Contar uma história sem resultado nem aprendizado. Ou inventar um incidente: o follow-up técnico denuncia na hora.',
      en: 'Blaming another person or team. A story with no result or lesson. Or inventing an incident: the technical follow-up exposes it immediately.',
    },
    anchor: {
      pt: 'Escolha um caso real da sustentação em produção (Grupo Mysa, Sicoob com hotfixes, ou ambientes operacionais críticos da Easy Process com clientes como Vale). Escreva o STAR no campo de resposta aqui do app e treine em voz alta em PT e EN até caber em 2 minutos.',
      en: 'Pick a real production-support case (Grupo Mysa, Sicoob hotfixes, or Easy Process critical operations with clients like Vale). Write the STAR in this app\'s answer box and rehearse it out loud in PT and EN until it fits in 2 minutes.',
    },
  },
  {
    id: 'behavioral-technical-disagreement',
    cat: 'agile', type: 'behavioral', jobs: ['elastic', 'brainrocket', 'frontend'],
    tags: ['disagreement', 'ADR', 'influence', 'disagree and commit', 'leadership'],
    q: {
      pt: 'Conte de uma vez em que você discordou de uma decisão técnica do time ou de alguém mais sênior. Como terminou?',
      en: 'Tell me about a time you disagreed with a technical decision by your team or someone more senior. How did it end?',
    },
    a: {
      pt: `O que se espera de um sênior:

1. **Entender antes de discordar**: perguntar o contexto e as restrições que talvez você não conheça.
2. **Discordar com dados e trade-offs**, não preferência: custo, risco, prazo, manutenção. Às vezes um spike ou protótipo pequeno decide melhor que uma reunião.
3. **Registrar** as opções e a decisão (um ADR curto), para o time saber o porquê depois.
4. **Disagree and commit**: se o time decidiu outra coisa, executar bem e sem sabotagem, e definir um ponto de revisão ("se o p99 passar de X, revisitamos").
5. Mostrar o resultado, inclusive se você estava errada. Admitir isso é sinal de maturidade.

O tom importa: o conflito é com a ideia, não com a pessoa.`,
      en: `What is expected from a senior:

1. **Understand before disagreeing**: ask about context and constraints you may not know.
2. **Disagree with data and trade-offs**, not preference: cost, risk, timeline, maintenance. Sometimes a small spike or prototype decides better than a meeting.
3. **Record** the options and the decision (a short ADR), so the team knows why later.
4. **Disagree and commit**: if the team chose differently, execute well without sabotage, and set a checkpoint ("if p99 goes above X, we revisit").
5. Share the outcome, including when you were wrong. Admitting that signals maturity.

Tone matters: the conflict is with the idea, not the person.`,
    },
    follow: [
      { pt: 'E se a decisão fosse eticamente ou tecnicamente perigosa?', en: 'What if the decision were ethically or technically dangerous?' },
      { pt: 'Como você convence alguém mais sênior sem autoridade formal?', en: 'How do you persuade someone more senior without formal authority?' },
    ],
    flags: {
      pt: '"Nunca discordei de ninguém." Ou uma história em que você "venceu" e o outro "estava errado" sem nuance.',
      en: '"I have never disagreed with anyone." Or a story where you "won" and the other person "was wrong" with no nuance.',
    },
    anchor: {
      pt: 'Seu portfólio diz que trade-offs viram ADRs e PRs bem descritos, e o TripFlow tem ADRs no repositório. Prepare um caso real (pode ser uma decisão de modernização de legado: refatorar vs reescrever) e conecte ao hábito de documentar decisões.',
      en: 'Your portfolio says trade-offs become ADRs and well-described PRs, and TripFlow has ADRs in the repo. Prepare a real case (for example a legacy modernization call: refactor vs rewrite) and connect it to your habit of documenting decisions.',
    },
  },
  {
    id: 'behavioral-ai-tools',
    cat: 'agile', type: 'behavioral', jobs: ['elastic', 'brainrocket', 'frontend'],
    tags: ['AI-assisted development', 'Copilot', 'Claude', 'code review', 'productivity', 'evaluation'],
    q: {
      pt: 'A vaga pede experiência com ferramentas de desenvolvimento assistido por IA. Como você usa, onde não confia e como avalia uma ferramenta nova?',
      en: 'The role asks for experience with AI-assisted development tools. How do you use them, where do you not trust them, and how do you evaluate a new tool?',
    },
    a: {
      pt: `**Como uso**: rascunho de código repetitivo e testes, exploração de uma API ou lib nova, explicação de código legado, refatorações mecânicas, primeira passada de code review e documentação. O ganho é maior em tarefas bem definidas e com feedback rápido (testes, typecheck).

**Onde não confio sem verificar**: segurança e autenticação, concorrência e transações, regras de negócio sutis, APIs que mudaram recentemente (alucinação de métodos), licenças de código. Todo código gerado passa pelo mesmo crivo que código de um colega: eu entendo, testo e assumo a autoria. Nunca colo segredo ou dado de cliente em ferramenta não aprovada.

**Avaliação pragmática de uma ferramenta nova**: definir o problema que ela resolve, testar num caso real e limitado, medir (tempo até PR, retrabalho, bugs, satisfação do time), checar segurança, privacidade e custo, e decidir com o time. Não adotar porque está na moda nem rejeitar por princípio.`,
      en: `**How I use them**: drafting repetitive code and tests, exploring a new API or library, explaining legacy code, mechanical refactors, a first pass at code review, and documentation. The gain is biggest on well-defined tasks with fast feedback (tests, typechecking).

**Where I do not trust them without checking**: security and auth, concurrency and transactions, subtle business rules, recently changed APIs (hallucinated methods), and code licensing. Generated code goes through the same bar as a colleague's: I understand it, test it, and own it. I never paste secrets or customer data into an unapproved tool.

**Pragmatic evaluation of a new tool**: define the problem it solves, trial it on a real, bounded case, measure (time to PR, rework, bugs, team satisfaction), check security, privacy, and cost, and decide with the team. Do not adopt it because it is trendy, and do not reject it on principle.`,
    },
    follow: [
      { pt: 'Me dê um exemplo em que a IA errou e como você percebeu.', en: 'Give me an example where the AI got it wrong and how you noticed.' },
      { pt: 'Como você revisaria um PR de um colega claramente gerado por IA?', en: 'How would you review a colleague\'s PR that was clearly AI-generated?' },
    ],
    flags: {
      pt: '"A IA escreve e eu só aceito." Ou o extremo oposto: "não uso, não confio".',
      en: '"The AI writes it and I just accept it." Or the opposite extreme: "I do not use it, I do not trust it".',
    },
    anchor: {
      pt: 'Seu portfólio tem um workflow de revisão assistida por IA no GitHub Actions e um CLAUDE.md orientando o assistente: evidência concreta de uso estruturado. Este DevTechnical também foi montado com IA e revisado por você. Conte com naturalidade e mostre o seu critério de revisão.',
      en: 'Your portfolio has an AI-assisted review workflow in GitHub Actions and a CLAUDE.md guiding the assistant: concrete evidence of structured use. DevTechnical itself was built with AI and reviewed by you. Say it plainly and show your review criteria.',
    },
  },
  {
    id: 'behavioral-why-senior',
    cat: 'agile', type: 'behavioral', jobs: ['elastic', 'brainrocket', 'frontend', 'cv'],
    tags: ['seniority', 'tell me about yourself', 'pitch', 'gaps', 'experience'],
    q: {
      pt: 'A vaga pede 5+ anos com TypeScript, React e Node em produção. Sua experiência principal é PHP/Laravel. Por que você é sênior para essa vaga?',
      en: 'The role asks for 5+ years of production TypeScript, React, and Node. Your main experience is PHP/Laravel. Why are you senior for this role?',
    },
    a: {
      pt: `Essa é a pergunta mais perigosa, porque testa honestidade e autoconhecimento ao mesmo tempo. Estrutura de resposta:

1. **Reconheça o fato sem se diminuir**: "Minha base de produção mais longa é PHP/Laravel; TypeScript e React eu uso em produção nas interfaces, e Node em serviços e projetos."
2. **Defina senioridade pelo que importa**: responsabilidade de ponta a ponta, decisões de arquitetura com trade-offs, sustentação em produção, modernização de legado sem parar a operação, mentoria e comunicação com o negócio. Isso independe de linguagem.
3. **Mostre evidência específica**, não adjetivos: um ou dois casos com problema, decisão e resultado.
4. **Mostre a ponte**: os problemas difíceis (concorrência, idempotência, consistência entre sistemas, observabilidade) são os mesmos em qualquer stack, e você tem projetos que provam isso em mais de uma linguagem.
5. **Seja específica sobre a lacuna e o plano**: o que está estudando e construindo agora.

Evite exagerar anos de uma tecnologia: num processo sênior com live coding, a diferença aparece em minutos e destrói a confiança no resto do CV.`,
      en: `This is the riskiest question, because it tests honesty and self-awareness at once. Answer structure:

1. **Acknowledge the fact without shrinking**: "My longest production foundation is PHP/Laravel; I use TypeScript and React in production for interfaces, and Node for services and projects."
2. **Define seniority by what matters**: end-to-end ownership, architecture decisions with trade-offs, production support, modernizing legacy without stopping operations, mentoring, and communicating with the business. None of that depends on the language.
3. **Show specific evidence**, not adjectives: one or two cases with the problem, the decision, and the outcome.
4. **Show the bridge**: the hard problems (concurrency, idempotency, cross-system consistency, observability) are the same in any stack, and you have projects proving it in more than one language.
5. **Be specific about the gap and the plan**: what you are studying and building right now.

Do not inflate years with a technology: in a senior process with live coding, the gap shows within minutes and undermines trust in the rest of the CV.`,
    },
    follow: [
      { pt: 'Qual foi a decisão técnica mais importante que você tomou sozinha?', en: 'What was the most important technical decision you made on your own?' },
      { pt: 'Você já mentorou alguém? Como?', en: 'Have you mentored anyone? How?' },
    ],
    flags: {
      pt: 'Afirmar "5 anos de React/Node em produção" se não for verdade. Ou o contrário: pedir desculpas pela trajetória.',
      en: 'Claiming "5 years of production React/Node" if it is not true. Or the opposite: apologizing for your path.',
    },
    anchor: {
      pt: 'Pitch com evidências reais: ~5 anos em sistemas financeiros, ERP, e-commerce nacional e indústria; React + TypeScript nas interfaces da Sicoob; Node.js no Grupo Mysa e na Sicoob; projetos que tratam os problemas difíceis: TripFlow (concorrência, idempotência, outbox), GEMP (Go + React, resiliência), Bora (React Native em uso real por uma prefeitura), MeterTrail (Rust, reprocessamento). Treine este pitch em PT e EN, em até 90 segundos.',
      en: 'Pitch with real evidence: ~5 years in financial systems, ERP, nationwide e-commerce, and industry; React + TypeScript interfaces at Sicoob; Node.js at Grupo Mysa and Sicoob; projects tackling hard problems: TripFlow (concurrency, idempotency, outbox), GEMP (Go + React, resilience), Bora (React Native used for real by a municipality), MeterTrail (Rust, replay). Practice this pitch in PT and EN, in 90 seconds or less.',
    },
  },
];
