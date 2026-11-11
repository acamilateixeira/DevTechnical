// Evidências da pesquisa (relatos públicos de entrevista) e vagas extras para perguntas
// que já existiam. As perguntas novas trazem `reported` no próprio arquivo.
// Fontes consultadas em 11/11/2026: Glassdoor (Elastic, BrainRocket, KWAN, Brasil Card, Felmo),
// TabNews (relatos de entrevistas pleno no Brasil) e guias públicos do processo da Elastic.

const r = (pt, en) => ({ pt, en });

export const extraJobs = {
  // Diferenciais e requisitos da vaga da Brasil Card cobertos por perguntas existentes
  'laravel-request-lifecycle': ['brasilcard'],
  'solid-all-five': ['brasilcard'],
  'ddd-core-concepts': ['brasilcard'],
  'design-patterns-real': ['brasilcard'],
  'clean-code-review': ['brasilcard'],
  'test-tdd-code': ['brasilcard'],
  'test-pyramid-strategy': ['brasilcard'],
  'db-isolation-locks': ['brasilcard'],
  'db-indexes-explain': ['brasilcard'],
  'api-idempotency': ['brasilcard'],
  'api-rest-vs-graphql': ['brasilcard'],
  'redis-cache-patterns': ['brasilcard'],
  'mq-outbox-pattern': ['brasilcard'],
  'k8s-core-concepts': ['brasilcard'],
  'cicd-pipeline': ['brasilcard'],
  'sec-owasp-web': ['brasilcard'],
  'behavioral-incident-star': ['brasilcard', 'kwan'],
  'behavioral-technical-disagreement': ['brasilcard', 'kwan'],
  'scrum-ceremonies-estimation': ['brasilcard', 'kwan'],
  'react-hooks-catalog': ['kwan'],
  'react-state-management': ['kwan'],
  'react-useeffect-pitfalls': ['kwan'],
  'js-event-loop': ['kwan'],
};

export const reported = {
  'laravel-request-lifecycle': r(
    'Sim. "Qual é o processo de tratamento de requisições no Laravel?" foi perguntado já na entrevista de RH numa vaga Full Stack PHP no Brasil (Glassdoor, Felmo).',
    'Yes. "What is the request handling process in Laravel?" was asked even in the HR interview for a Full Stack PHP role in Brazil (Glassdoor, Felmo).'),
  'solid-all-five': r(
    'Sim. "Quais princípios do SOLID você conhece e qual o mais importante?" aparece em relatos de entrevistas para pleno no Brasil (TabNews).',
    'Yes. "Which SOLID principles do you know and which matters most?" appears in reports of mid-level interviews in Brazil (TabNews).'),
  'design-patterns-real': r(
    'Sim. "Cite e explique três design patterns" aparece em relatos de entrevistas para pleno no Brasil (TabNews).',
    'Yes. "Name and explain three design patterns" appears in reports of mid-level interviews in Brazil (TabNews).'),
  'db-indexes-explain': r(
    'Sim. "Explique indexação" aparece em relatos de entrevistas para pleno no Brasil (TabNews).',
    'Yes. "Explain indexing" appears in reports of mid-level interviews in Brazil (TabNews).'),
  'arch-system-design-logs': r(
    'Sim. Um guia público do processo da Elastic lista "desenhe a ingestão de logs a 1 milhão de eventos por segundo", e relatos do Glassdoor confirmam rodadas de system design.',
    'Yes. A public Elastic process guide lists "design log ingestion at 1M events/second", and Glassdoor reports confirm system design rounds.'),
  'elasticsearch-fundamentals': r(
    'Sim, para sênior na Elastic: "por que o Elasticsearch é near-real-time", "por que segmentos são imutáveis" e failover de shard primário aparecem num guia público do processo.',
    'Yes, for senior roles at Elastic: "why is Elasticsearch near-real-time", "why are segments immutable", and primary-shard failover appear in a public process guide.'),
  'behavioral-incident-star': r(
    'Sim. Candidatos da Elastic descrevem a rodada comportamental como "mais séria que o esperado" e recomendam se preparar com STAR.',
    'Yes. Elastic candidates describe the behavioral round as "more serious than expected" and recommend preparing with STAR.'),
  'node-event-loop-blocking': r(
    'Concorrência aparece entre os temas das rodadas técnicas da Elastic no Glassdoor.',
    'Concurrency appears among the topics of Elastic technical rounds on Glassdoor.'),
  'clean-code-review': r(
    'Sim. Relatos da Elastic citam um exercício seguido de "live code review": você explica e defende o próprio código.',
    'Yes. Elastic reports mention an exercise followed by a "live code review": you explain and defend your own code.'),
};
