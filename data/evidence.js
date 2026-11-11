// Evidências: de onde vem cada pergunta marcada como "relatada".
// Cada fonte diz o tipo (relato de candidato, guia público ou a própria vaga), a empresa, o cargo,
// a data, a etapa e o link. Conferido em 11/11/2026. Nada aqui é inventado: o que não deu para
// confirmar foi retirado.

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
  'js-event-loop': ['kwan', 'brainrocket'],
  'mq-rabbitmq-concepts': ['brainrocket'],
  'db-isolation-locks': ['brainrocket'],
  'js-closures-this': ['brainrocket'],
};


// kind: 'relato' = alguém contou que passou por isso; 'guia' = guia público do processo; 'vaga' = está na descrição da vaga
export const sources = {
  'gd-felmo': { kind: 'relato', company: 'felmo', site: 'Glassdoor', url: 'https://www.glassdoor.com/Interview/felmo-Interview-E4921400-RVW78958189.htm',
    role: r('Full-Stack PHP/JavaScript Developer', 'Full-Stack PHP/JavaScript Developer'), when: r('jun/2023', 'Jun 2023'), stage: r('entrevista de RH', 'HR interview') },
  'tn-pleno': { kind: 'relato', company: r('consultoria (não citada)', 'a consultancy (not named)'), site: 'TabNews', url: 'https://www.tabnews.com.br/theofurtado05/a-vaga-de-pleno-chegou-e-preciso-da-sua-ajuda-processo-seletivo',
    role: r('dev pleno, entrevistas com Java (comentário de luizinhoQuebraCodigos)', 'mid-level dev, Java interviews (comment by luizinhoQuebraCodigos)'), when: r('jan/2025', 'Jan 2025'), stage: r('entrevista técnica', 'technical interview') },
  'guide-elastic': { kind: 'guia', company: 'Elastic', site: 'techinterview.org', url: 'https://www.techinterview.org/companies/elastic-interview-guide/',
    role: r('guia do processo (não é relato de uma pessoa)', 'process guide (not one person\'s report)'), when: r('mai/2026, atualizado jul/2026', 'May 2026, updated Jul 2026'), stage: r('rodadas de código, system design e domínio', 'coding, system design, and domain rounds') },
  'gd-elastic-dec25': { kind: 'relato', company: 'Elastic', site: 'Glassdoor', url: 'https://www.glassdoor.sg/Interview/Elastic-Senior-Software-Engineer-Interview-Questions-EI_IE751551.0,7_KO8,32.htm',
    role: r('cargo não informado (página de Senior Software Engineer)', 'role not stated (Senior Software Engineer page)'), when: r('dez/2025', 'Dec 2025'), stage: r('rodadas técnicas e comportamental, via recrutador', 'technical and behavioral rounds, via recruiter') },
  'gd-elastic-oct25': { kind: 'relato', company: 'Elastic', site: 'Glassdoor', url: 'https://www.glassdoor.sg/Interview/Elastic-Senior-Software-Engineer-Interview-Questions-EI_IE751551.0,7_KO8,32.htm',
    role: r('cargo não informado (página de Senior Software Engineer)', 'role not stated (Senior Software Engineer page)'), when: r('out/2025', 'Oct 2025'), stage: r('RH e três entrevistas em dupla', 'HR and three interviews with two interviewers') },
  'taro-elastic-fe': { kind: 'relato', company: 'Elastic', site: 'Taro', url: 'https://www.jointaro.com/interviews/companies/elastic/experiences/senior-frontend-engineer-amsterdam-may-1-2022-no-offer-positive-8559779c/',
    role: r('Senior Frontend Engineer, Amsterdã', 'Senior Frontend Engineer, Amsterdam'), when: r('mai/2022', 'May 2022'), stage: r('recrutador, 3 técnicas e gestor', 'recruiter, 3 technical, and manager') },
  'gd-br-node26': { kind: 'relato', company: 'BrainRocket', site: 'Glassdoor', url: 'https://www.glassdoor.com/Interview/BrainRocket-Interview-E4565292-RVW104032201.htm',
    role: r('Senior Backend Developer (Node.js), Varsóvia', 'Senior Backend Developer (Node.js), Warsaw'), when: r('mai/2026', 'May 2026'), stage: r('RH, teste no HackerRank, técnica com engenheiro, tech lead', 'HR, HackerRank test, technical with an engineer, tech lead') },
  'gd-br-fe-mar25': { kind: 'relato', company: 'BrainRocket', site: 'Glassdoor', url: 'https://www.glassdoor.com/Interview/BrainRocket-Interview-E4565292-RVW95696562.htm',
    role: r('Senior Frontend Developer, Bucareste', 'Senior Frontend Developer, Bucharest'), when: r('mar/2025', 'Mar 2025'), stage: r('entrevista de 90 min com live coding', '90-min interview with live coding') },
  'gd-br-fe-apr25': { kind: 'relato', company: 'BrainRocket', site: 'Glassdoor', url: 'https://www.glassdoor.com/Interview/BrainRocket-Interview-E4565292-RVW95696562.htm',
    role: r('Senior Frontend Developer', 'Senior Frontend Developer'), when: r('abr/2025', 'Apr 2025'), stage: r('RH e teste no HackerRank com câmera', 'HR and a HackerRank test with camera on') },
  'gd-kwan-a': { kind: 'relato', company: 'KWAN', site: 'Glassdoor', url: 'https://www.glassdoor.com/Interview/KWAN-Interview-E1960815-RVW85418819.htm',
    role: r('Software Engineer, Lisboa', 'Software Engineer, Lisbon'), when: r('out/2022 (publicado em mar/2024)', 'Oct 2022 (posted Mar 2024)'), stage: r('RH com teste de inglês, especialista com teste curto, conversa com o cliente', 'HR with an English test, specialist with a short test, client conversation') },
  'gd-kwan-b': { kind: 'relato', company: 'KWAN', site: 'Glassdoor', url: 'https://www.glassdoor.com/Interview/KWAN-Interview-E1960815-RVW85418819.htm',
    role: r('Software Engineer', 'Software Engineer'), when: r('abr/2024', 'Apr 2024'), stage: r('RH, teste técnico de 1 hora, entrevista com o cliente', 'HR, 1-hour technical test, client interview') },
  'gd-bc-atendente': { kind: 'relato', company: 'Brasil Card', site: 'Glassdoor', url: 'https://www.glassdoor.co.in/Interview/Brasil-Card-Interview-E2782769-RVW83660573.htm',
    role: r('Atendente, Monte Belo-MG (vaga NÃO técnica)', 'Store attendant, Monte Belo-MG (NOT a tech role)'), when: r('jan/2021', 'Jan 2021'), stage: r('testes e conversa', 'tests and a conversation') },
  'gd-bc-contabil': { kind: 'relato', company: 'Brasil Card', site: 'Glassdoor', url: 'https://www.glassdoor.sg/Interview/Brasil-Card-Interview-E2782769-RVW95161484.htm',
    role: r('Auxiliar Contábil, Monte Belo-MG (vaga NÃO técnica)', 'Accounting assistant, Monte Belo-MG (NOT a tech role)'), when: r('fev/2025', 'Feb 2025'), stage: r('RH pelo WhatsApp, depois RH + gestor da área', 'HR via WhatsApp, then HR + department manager') },
  'vaga-bc': { kind: 'vaga', company: 'Brasil Card', site: r('descrição da vaga', 'job description'), url: '',
    role: r('Full Stack Pleno (PHP), remoto', 'Mid-level Full Stack (PHP), remote'), when: r('2026', '2026'), stage: r('requisitos da vaga', 'job requirements') },
};

const q = (src, pt, en, note) => ({ src, quote: r(pt, en), ...(note ? { note } : {}) });

export const reported = {
  'laravel-request-lifecycle': [q('gd-felmo', '"Qual é o processo de tratamento de requisições no Laravel?"', '"What is the process of handling requests in Laravel?"')],
  'solid-all-five': [q('tn-pleno', '"Conhece os princípios SOLID? Cite." e "Qual é o mais importante pra você?" (o entrevistador preferia o Single Responsibility)', '"Do you know the SOLID principles? Name them." and "Which matters most to you?" (the interviewer favored Single Responsibility)')],
  'design-patterns-real': [q('tn-pleno', '"Cite e explique três design patterns."', '"Name and explain three design patterns."')],
  'db-indexes-explain': [q('tn-pleno', '"Explique o conceito de indexação."', '"Explain the concept of indexing."')],
  'arch-system-design-logs': [
    q('guide-elastic', '"Design log ingestion at 1M events per second" (desenhe a ingestão de logs a 1 milhão de eventos por segundo)', '"Design log ingestion at 1M events per second"'),
    q('gd-elastic-dec25', '"concurrency or system design" entre os temas das rodadas técnicas', '"concurrency or system design" among the technical round topics')],
  'elasticsearch-fundamentals': [q('guide-elastic', 'Por que a busca é near-real-time (refresh interval), por que os segmentos do Lucene são imutáveis e o que acontece quando o shard primário cai', 'Why search is near-real-time (refresh interval), why Lucene segments are immutable, and what happens when a primary shard fails over', r('Só para sênior ou acima, segundo o guia.', 'Senior and above only, per the guide.'))],
  'behavioral-incident-star': [q('gd-elastic-dec25', '"Behavior interview is more serious than expected" (a comportamental é mais séria do que se espera)', '"Behavior interview is more serious than expected"')],
  'node-event-loop-blocking': [
    q('gd-elastic-dec25', '"concurrency or system design" entre os temas técnicos', '"concurrency or system design" among the technical topics'),
    q('gd-br-node26', '"Basics of distributed systems, handling race conditions, event loop, comparison of rabbitmq and kafka"', '"Basics of distributed systems, handling race conditions, event loop, comparison of rabbitmq and kafka"')],
  'clean-code-review': [q('gd-elastic-oct25', 'Um exercício seguido de "live code review": você explica e defende o próprio código', 'An exercise followed by a "live code review" of it: you explain and defend your own code')],
  'js-event-loop': [
    q('gd-br-fe-mar25', '"Event loop - what it is and how it works" (event loop: o que é e como funciona)', '"Event loop - what it is and how it works"'),
    q('gd-br-node26', '"…event loop…" entre os temas da entrevista técnica', '"…event loop…" among the technical interview topics')],
  'js-closures-this': [q('gd-br-fe-apr25', '"this, closure, ts, async operations" (temas cobrados)', '"this, closure, ts, async operations" (topics covered)')],
  'mq-rabbitmq-concepts': [q('gd-br-node26', '"…comparison of rabbitmq and kafka" (comparar RabbitMQ e Kafka)', '"…comparison of rabbitmq and kafka"')],
  'db-isolation-locks': [q('gd-br-node26', '"…handling race conditions…" (como lidar com condições de corrida)', '"…handling race conditions…"')],
  'php-oop-abstract-interface-trait': [q('tn-pleno', '"Qual a diferença entre classe abstrata e interface?", "Explique polimorfismo" e "Uma classe pode implementar várias interfaces?"', '"What is the difference between an abstract class and an interface?", "Explain polymorphism", and "Can a class implement multiple interfaces?"', r('O relato é de entrevistas com Java, mas a pergunta é a mesma em PHP.', 'The report is from Java interviews, but the question is the same in PHP.'))],
  'java-basics-for-php-dev': [q('tn-pleno', '"Qual a diferença entre == e .equals()?", "classe abstrata vs interface" e "uma classe pode implementar várias interfaces?"', '"What is the difference between == and .equals()?", "abstract class vs interface", and "can a class implement multiple interfaces?"')],
  'codeigniter3-architecture': [q('vaga-bc', 'A vaga pede CodeIgniter 3+ e Laravel', 'The role asks for CodeIgniter 3+ and Laravel', r('Não achei relato público com essa pergunta: ela está aqui porque o framework está na vaga.', 'I found no public report with this question: it is here because the framework is in the job description.'))],
  'sql-live-query-faturas': [
    q('vaga-bc', 'A vaga pede SQL Server, MySQL e PostgreSQL', 'The role asks for SQL Server, MySQL, and PostgreSQL'),
    q('tn-pleno', '"Explique o conceito de indexação."', '"Explain the concept of indexing."')],
  'legacy-production-bug': [q('vaga-bc', '"Manutenção contínua de software existente, corrigindo bugs"', '"Continuous maintenance of existing software, fixing bugs"', r('Não é relato: é a principal responsabilidade da vaga, então é provável que perguntem.', 'Not a report: it is the role\'s main responsibility, so it is likely to come up.'))],
  'behavioral-brasilcard-fit': [
    q('gd-bc-atendente', '"Como você se vê daqui 5 anos? Como conheceu a empresa?"', '"Where do you see yourself in 5 years? How did you hear about the company?"'),
    q('gd-bc-contabil', 'Perguntas sobre o trabalho atual, a formação e a experiência (sem a frase exata)', 'Questions about current job, education, and experience (no exact wording)')],
  'algo-top-k-frequent': [
    q('guide-elastic', '"Top-K terms in a stream" (os K termos mais frequentes de um fluxo)', '"Top-K terms in a stream"'),
    q('gd-elastic-dec25', '"Easy leetcode style problems" (problemas fáceis estilo LeetCode)', '"Easy leetcode style problems"')],
  'algo-classic-hackerrank': [
    q('gd-br-node26', 'Teste online cronometrado no HackerRank, com perguntas técnicas e uma tarefa prática', 'A timed online HackerRank test with technical questions and a practical task'),
    q('gd-br-fe-apr25', 'Teste no HackerRank com a câmera ligada, depois do RH', 'A HackerRank test with the camera on, after HR'),
    q('gd-kwan-b', 'Teste técnico de 1 hora na linguagem que você preferir', 'A 1-hour technical test in your preferred language')],
  'elastic-alerting-design': [q('guide-elastic', '"Design alerting on log streams (throttling, deduplication, paging integration)"', '"Design alerting on log streams (throttling, deduplication, paging integration)"')],
  'behavioral-proud-project-deepdive': [
    q('taro-elastic-fe', '"Could you tell me about a project you are proud of?" (conte de um projeto de que você se orgulha)', '"Could you tell me about a project you are proud of?"'),
    q('gd-elastic-oct25', 'Os entrevistadores "dig into your work experience" (cavam sua experiência com follow-ups)', 'Interviewers "dig into your work experience" with follow-ups')],
  'behavioral-remote-async': [
    q('gd-elastic-dec25', 'As vagas são "remote first" e a comportamental é "more serious than expected"', 'Positions are "remote first" and the behavioral round is "more serious than expected"'),
    q('vaga-bc', 'A vaga é remota', 'The role is remote')],
  'behavioral-relocation-consultancy': [
    q('gd-kwan-b', '"Why do I want to move to Portugal?" (por que quero me mudar para Portugal) e a entrevista com o cliente, que pode levar meses para marcar', '"Why do I want to move to Portugal?" and the client interview, which can take months to schedule'),
    q('gd-kwan-a', 'RH sobre valores e objetivos, teste de inglês e "What do you see yourself doing in 5 years?"', 'HR on values and goals, an English test, and "What do you see yourself doing in 5 years?"')],
};

/** Resumo para o chip: empresas com relato real, ou o tipo de evidência. */
export function evidenceSummary(list) {
  if (!list?.length) return null;
  const relatos = list.filter((x) => sources[x.src].kind === 'relato');
  const names = [...new Set(relatos.map((x) => sources[x.src].company).filter((c) => typeof c === 'string'))];
  if (relatos.length) return { kind: 'relato', companies: names.length ? names : null };
  return { kind: list.some((x) => sources[x.src].kind === 'guia') ? 'guia' : 'vaga', companies: [...new Set(list.map((x) => sources[x.src].company))].filter((c) => typeof c === 'string') };
}
