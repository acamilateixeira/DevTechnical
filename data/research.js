// Perguntas acrescentadas a partir de relatos reais de entrevista (Glassdoor, guias de
// processo, TabNews). O campo `reported` diz onde o tipo de pergunta aparece.

export default [
  {
    id: 'algo-top-k-frequent',
    cat: 'algorithms', type: 'code', jobs: ['elastic', 'brainrocket'],
    tags: ['live coding', 'Map', 'heap', 'sort', 'Big O', 'top-K', 'logs'],
    reported: {
      pt: 'Sim. Relatos de entrevistas na Elastic citam "problemas fáceis estilo LeetCode" e um guia do processo lista "top-K termos de um stream". A BrainRocket usa teste no HackerRank.',
      en: 'Yes. Elastic interview reports mention "easy LeetCode-style problems" and a process guide lists "top-K terms in a stream". BrainRocket uses a HackerRank test.',
    },
    q: {
      pt: 'Live coding: dada uma lista de linhas de log, devolva os K serviços que mais geraram erro. Qual a complexidade da sua solução? E se o log não couber na memória?',
      en: 'Live coding: given a list of log lines, return the K services that produced the most errors. What is your solution\'s complexity? And if the log does not fit in memory?',
    },
    code: {
      src: `
// linha: "2026-11-11T10:00:01Z ERROR trips-api timeout calling provider"
function topKServicosComErro(linhas: string[], k: number): Array<[string, number]> {
  const contagem = new Map<string, number>();                 // O(n) para contar
  for (const linha of linhas) {
    const [, nivel, servico] = linha.split(' ');
    if (nivel !== 'ERROR' || !servico) continue;             // casos de borda: linha vazia/malformada
    contagem.set(servico, (contagem.get(servico) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) // O(m log m), m = serviços distintos
    .slice(0, k);                                             // empate: ordem alfabética (combine antes!)
}

// Testes rápidos, escritos ANTES de dizer "terminei"
console.assert(JSON.stringify(topKServicosComErro([], 2)) === '[]');
console.assert(topKServicosComErro([
  't ERROR a x', 't ERROR b x', 't ERROR a x', 't INFO a ok', '',
], 1)[0][0] === 'a');

// Muito maior que a memória? Ler em stream, linha a linha (readline), mantendo só o Map.
// Serviços demais para o Map? Count-Min Sketch (contagem aproximada) + heap de tamanho K.`,
    },
    a: {
      pt: `Roteiro que os entrevistadores esperam num problema "fácil":

1. **Esclarecer antes de codar**: formato da linha, o que fazer com linha malformada, como desempatar, K maior que o número de serviços.
2. **Solução direta**: contar com um \`Map\` (O(n) no total de linhas) e ordenar os serviços distintos (O(m log m)). Como m ≪ n, na prática é O(n).
3. **Otimizar se pedirem**: para K pequeno e m grande, um **min-heap de tamanho K** deixa a seleção em O(m log k) em vez de ordenar tudo.
4. **Testar em voz alta**: lista vazia, linhas inválidas, empates, K = 0.
5. **Escala**: arquivo maior que a memória → ler em **stream** linha a linha; serviços demais para caber na memória → **Count-Min Sketch** (contagem aproximada com memória fixa) + heap; distribuído → contar por partição e somar (map-reduce), que é como agregações \`terms\` funcionam no Elasticsearch.

O que conta é: código que roda, nomes claros, complexidade explicada e casos de borda testados, mais do que a solução "esperta".`,
      en: `The outline interviewers expect for an "easy" problem:

1. **Clarify before coding**: line format, what to do with malformed lines, tie-breaking, K larger than the number of services.
2. **Straightforward solution**: count with a \`Map\` (O(n) over all lines) and sort the distinct services (O(m log m)). Since m ≪ n, it is effectively O(n).
3. **Optimize if asked**: for small K and large m, a **size-K min-heap** makes selection O(m log k) instead of sorting everything.
4. **Test out loud**: empty list, invalid lines, ties, K = 0.
5. **Scale**: a file bigger than memory → **stream** it line by line; too many services to fit in memory → a **Count-Min Sketch** (approximate counts in fixed memory) + heap; distributed → count per partition and sum (map-reduce), which is how \`terms\` aggregations work in Elasticsearch.

What counts: code that runs, clear names, explained complexity, and tested edge cases, more than a "clever" solution.`,
    },
    follow: [
      { pt: 'Implemente o min-heap de tamanho K sem biblioteca.', en: 'Implement the size-K min-heap without a library.' },
      { pt: 'Por que a agregação `terms` do Elasticsearch pode dar contagens aproximadas?', en: 'Why can Elasticsearch\'s `terms` aggregation return approximate counts?' },
    ],
    flags: {
      pt: 'Começar a digitar sem perguntar nada, ou dizer "terminei" sem rodar nenhum caso de teste.',
      en: 'Starting to type without asking anything, or saying "done" without running a single test case.',
    },
    anchor: {
      pt: 'Treine em voz alta no lab "Event loop" (edite o código para contar algo) ou no Node local. O MeterTrail (ingestão e agregação de uso) é um bom gancho para a parte de escala.',
      en: 'Practice out loud in the "Event loop" lab (edit the code to count something) or in local Node. MeterTrail (usage ingestion and aggregation) is a good hook for the scaling part.',
    },
  },
  {
    id: 'algo-classic-hackerrank',
    cat: 'algorithms', type: 'code', jobs: ['brainrocket', 'kwan', 'brasilcard'],
    tags: ['HackerRank', 'two sum', 'parênteses balanceados', 'stack', 'hash map', 'anagramas', 'Big O'],
    reported: {
      pt: 'A BrainRocket aplica um teste no HackerRank ("não muito complicado", segundo relatos) e a KWAN um teste técnico de 1 hora na sua linguagem. Esses três problemas são os clássicos desse formato.',
      en: 'BrainRocket runs a HackerRank test ("not too complicated", per reports) and KWAN a 1-hour technical test in your language. These three problems are the classics of that format.',
    },
    q: {
      pt: 'Teste de código cronometrado: (1) two sum, (2) parênteses balanceados, (3) agrupar anagramas. Resolva os três explicando a complexidade.',
      en: 'Timed coding test: (1) two sum, (2) balanced brackets, (3) group anagrams. Solve all three explaining the complexity.',
    },
    code: {
      src: `
// 1) Two sum: índices de dois números que somam o alvo. O(n) com hash map (em vez de O(n²) com dois loops)
function twoSum(nums: number[], alvo: number): [number, number] | null {
  const visto = new Map<number, number>();            // valor → índice
  for (let i = 0; i < nums.length; i++) {
    const falta = alvo - nums[i];
    if (visto.has(falta)) return [visto.get(falta)!, i];
    visto.set(nums[i], i);
  }
  return null;
}

// 2) Parênteses balanceados: pilha (stack). O(n)
function balanceado(s: string): boolean {
  const par: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const pilha: string[] = [];
  for (const c of s) {
    if ('([{'.includes(c)) pilha.push(c);
    else if (c in par && pilha.pop() !== par[c]) return false;
  }
  return pilha.length === 0;                          // sobrou abertura? não está balanceado
}

// 3) Agrupar anagramas: a "assinatura" de cada palavra são as letras ordenadas. O(n · k log k)
function agruparAnagramas(palavras: string[]): string[][] {
  const grupos = new Map<string, string[]>();
  for (const p of palavras) {
    const chave = [...p].sort().join('');
    (grupos.get(chave) ?? grupos.set(chave, []).get(chave)!).push(p);
  }
  return [...grupos.values()];
}

console.log(twoSum([2, 7, 11, 15], 9));                    // [0, 1]
console.log(balanceado('{[()]}'), balanceado('([)]'));     // true false
console.log(agruparAnagramas(['amor', 'roma', 'ramo', 'pato', 'topa']));`,
    },
    a: {
      pt: `O padrão por trás dos três é **trocar memória por tempo** com a estrutura certa:

1. **Two sum**: a solução ingênua testa todos os pares, O(n²). Guardando num **hash map** o que já vi (valor → índice), para cada número pergunto "o complemento já apareceu?" em O(1): total **O(n)** de tempo e O(n) de memória.
2. **Parênteses**: uma **pilha** (último a entrar, primeiro a sair). Abertura empilha; fechamento precisa casar com o topo. No fim a pilha tem que estar vazia. **O(n)**.
3. **Anagramas**: palavras com as mesmas letras têm a mesma "assinatura" (letras ordenadas, ou contagem das 26 letras). Agrupo num **Map** por assinatura: **O(n · k log k)**, com k = tamanho da palavra (O(n · k) usando contagem).

Em teste cronometrado: leia todos os enunciados antes, resolva o mais fácil primeiro, rode os exemplos dados e **crie casos de borda** (vazio, um elemento, repetidos), porque o HackerRank tem testes escondidos.`,
      en: `The pattern behind all three is **trading memory for time** with the right data structure:

1. **Two sum**: the naive solution tries every pair, O(n²). Storing what I have seen in a **hash map** (value → index), for each number I ask "has its complement appeared?" in O(1): **O(n)** time and O(n) memory overall.
2. **Brackets**: a **stack** (last in, first out). Openers push; closers must match the top. At the end the stack must be empty. **O(n)**.
3. **Anagrams**: words with the same letters share a "signature" (sorted letters, or counts of the 26 letters). Group in a **Map** by signature: **O(n · k log k)**, with k = word length (O(n · k) using counts).

In a timed test: read every prompt first, solve the easiest first, run the given examples, and **create edge cases** (empty, single element, duplicates), because HackerRank has hidden tests.`,
    },
    follow: [
      { pt: 'E se o array do two sum estiver ordenado? Dá para usar O(1) de memória?', en: 'What if the two-sum array is sorted? Can you use O(1) memory?' },
      { pt: 'O que é complexidade de espaço e por que importa?', en: 'What is space complexity and why does it matter?' },
    ],
    flags: {
      pt: 'Entregar O(n²) sem comentar que existe solução melhor. Ou não testar com entrada vazia.',
      en: 'Submitting O(n²) without mentioning a better solution exists. Or not testing with empty input.',
    },
    anchor: {
      pt: 'Algoritmos clássicos não aparecem no CV de ninguém; aparecem no treino. Faça 2 ou 3 problemas fáceis por dia no HackerRank em JavaScript/TypeScript (e em PHP para a Brasil Card) durante a semana da entrevista.',
      en: 'Classic algorithms show up in practice, not on anyone\'s CV. Do 2 or 3 easy HackerRank problems a day in JavaScript/TypeScript (and PHP for Brasil Card) during interview week.',
    },
  },
  {
    id: 'elastic-alerting-design',
    cat: 'architecture', type: 'architecture', jobs: ['elastic'],
    tags: ['alerting', 'system design', 'deduplicação', 'throttling', 'regras', 'notificações', 'Kibana alerting'],
    reported: {
      pt: 'Sim: "desenhe alertas sobre streams de logs (throttling, deduplicação, integração com plantão)" aparece num guia do processo da Elastic, e system design aparece nos relatos do Glassdoor.',
      en: 'Yes: "design alerting on log streams (throttling, deduplication, paging integration)" appears in an Elastic process guide, and system design appears in Glassdoor reports.',
    },
    q: {
      pt: 'System design: o usuário cria uma regra "me avise se o serviço X tiver mais de 50 erros em 5 minutos". Desenhe o sistema de alertas: avaliação, deduplicação, throttling e notificação.',
      en: 'System design: a user creates a rule "alert me if service X has more than 50 errors in 5 minutes". Design the alerting system: evaluation, deduplication, throttling, and notification.',
    },
    a: {
      pt: `**Requisitos primeiro**: quantas regras (milhares?), atraso aceitável (1 min?), canais (e-mail, Slack, PagerDuty, webhook), multi-tenant, e o que fazer quando o alerta "volta ao normal".

**Componentes**:

1. **Armazenamento de regras**: consulta (serviço, nível, janela, limite), intervalo de checagem, canais, dono.
2. **Agendador + avaliadores**: a cada intervalo, avalia as regras devidas. Escala distribuindo as regras entre workers (particionar por ID) com lease/lock para duas instâncias não avaliarem a mesma regra. Cada avaliação é uma **agregação** no armazenamento de logs (contagem por janela), não uma leitura de linhas.
3. **Máquina de estados por alerta**: OK → ALERTANDO → RECUPERADO. Só notifica nas **transições**, não a cada checagem.
4. **Deduplicação**: chave do alerta (regra + grupo, ex.: serviço) para não abrir dez alertas iguais.
5. **Throttling e agrupamento**: no máximo uma notificação a cada X minutos por alerta; agrupar vários serviços num resumo; janela de silêncio (manutenção).
6. **Notificação** por **fila**, com retry, backoff e idempotência: canal fora do ar não pode travar a avaliação.
7. **Observar o próprio sistema**: atraso das avaliações, regras falhando, filas de notificação. Se o sistema de alertas cair, precisa existir um alerta sobre isso (heartbeat).

Trade-offs: avaliação por **polling** (simples, atraso igual ao intervalo) × **streaming** (tempo real, mais complexo); alerta por limite fixo × anomalia (mais ruído).`,
      en: `**Requirements first**: how many rules (thousands?), acceptable delay (1 min?), channels (email, Slack, PagerDuty, webhook), multi-tenancy, and what to do when an alert "recovers".

**Components**:

1. **Rule storage**: query (service, level, window, threshold), check interval, channels, owner.
2. **Scheduler + evaluators**: every interval, evaluate due rules. Scale by distributing rules across workers (partition by ID) with a lease/lock so two instances never evaluate the same rule. Each evaluation is an **aggregation** in the log store (count per window), not a scan of lines.
3. **Per-alert state machine**: OK → ALERTING → RECOVERED. Notify only on **transitions**, not on every check.
4. **Deduplication**: an alert key (rule + group, e.g. service) so ten identical alerts never open.
5. **Throttling and grouping**: at most one notification every X minutes per alert; group several services into a summary; silence windows (maintenance).
6. **Notification** through a **queue**, with retries, backoff, and idempotency: a channel being down must not block evaluation.
7. **Observe the system itself**: evaluation lag, failing rules, notification queues. If alerting goes down there must be an alert about it (heartbeat).

Trade-offs: **polling** evaluation (simple, delay equals the interval) vs **streaming** (real time, more complex); fixed thresholds vs anomaly detection (more noise).`,
    },
    follow: [
      { pt: 'Um tenant cria 10 mil regras com intervalo de 10 segundos. Como você protege o cluster?', en: 'One tenant creates 10,000 rules with a 10-second interval. How do you protect the cluster?' },
      { pt: 'Como você testaria esse sistema?', en: 'How would you test this system?' },
    ],
    flags: {
      pt: 'Notificar a cada avaliação (spam), ou mandar a notificação de forma síncrona dentro do avaliador.',
      en: 'Notifying on every evaluation (spam), or sending notifications synchronously inside the evaluator.',
    },
    anchor: {
      pt: 'Os labs "Resiliência" (retry, backoff, breaker) e "Outbox" (fila, idempotência) mostram em funcionamento as peças da notificação confiável. A máquina de estados lembra os estados do GEMP e do Bora (presença, solicitação, atribuição).',
      en: 'The "Resilience" (retry, backoff, breaker) and "Outbox" (queue, idempotency) labs show the reliable-notification pieces running. The state machine echoes the states in GEMP and Bora (presence, request, assignment).',
    },
  },
  {
    id: 'behavioral-proud-project-deepdive',
    cat: 'agile', type: 'behavioral', jobs: ['elastic', 'brainrocket', 'kwan', 'brasilcard', 'cv'],
    tags: ['projeto que te orgulha', 'deep dive', 'decisões', 'trade-offs', 'impacto', 'STAR'],
    reported: {
      pt: 'Sim: "Conte de um projeto de que você se orgulha" aparece em relato de entrevista para Senior Frontend na Elastic, e outros relatos dizem que os entrevistadores "cavam sua experiência com perguntas de follow-up".',
      en: 'Yes: "Tell me about a project you are proud of" appears in an Elastic Senior Frontend interview report, and other reports say interviewers "dig into your work experience with follow-up questions".',
    },
    q: {
      pt: 'Conte de um projeto de que você se orgulha. (O entrevistador vai cavar: por que essa arquitetura? O que você faria diferente? Qual foi exatamente a SUA parte?)',
      en: 'Tell me about a project you are proud of. (The interviewer will dig: why that architecture? What would you do differently? What exactly was YOUR part?)',
    },
    a: {
      pt: `Escolha um projeto em que você **decidiu** coisas, não só executou, e que aguente 20 minutos de perguntas. Estrutura:

1. **Contexto e problema** (30 s): para quem, qual dor, por que importava. Um número ajuda.
2. **Sua parte** (use "eu", não "a gente"): o que você desenhou, decidiu e construiu.
3. **2 ou 3 decisões técnicas com trade-off**: "escolhi X em vez de Y porque…, o custo foi…".
4. **Uma dificuldade real** e como você resolveu (bug, prazo, mudança de requisito).
5. **Resultado**: uso real, métrica, o que mudou para as pessoas.
6. **O que faria diferente**: mostra maturidade, não fraqueza.

Prepare as respostas para o "cavar": por que não usou a alternativa óbvia, como testou, como foi para produção, o que quebrou, como mediu.`,
      en: `Pick a project where you **made decisions**, not just executed, and that can withstand 20 minutes of questions. Structure:

1. **Context and problem** (30 s): for whom, what pain, why it mattered. A number helps.
2. **Your part** (say "I", not "we"): what you designed, decided, and built.
3. **2 or 3 technical decisions with trade-offs**: "I chose X over Y because…, the cost was…".
4. **One real difficulty** and how you solved it (a bug, a deadline, a requirement change).
5. **Outcome**: real usage, a metric, what changed for people.
6. **What you would do differently**: shows maturity, not weakness.

Prepare answers for the "dig": why not the obvious alternative, how you tested, how it went to production, what broke, how you measured.`,
    },
    follow: [
      { pt: 'Se tivesse o dobro do tempo, o que mudaria?', en: 'With twice the time, what would you change?' },
      { pt: 'Qual decisão você tomou que se mostrou errada?', en: 'Which decision you made turned out to be wrong?' },
    ],
    flags: {
      pt: 'Falar só "a gente" sem deixar claro o seu papel. Ou escolher um projeto que você não consegue defender no detalhe.',
      en: 'Saying only "we" without making your role clear. Or picking a project you cannot defend in detail.',
    },
    anchor: {
      pt: 'O Bora é o mais forte: React Native + Supabase usado de verdade pela Prefeitura de Conceição do Mato Dentro, com decisões claras (separar solicitação de atribuição, presença com expiração, políticas no PostgreSQL com testes). Para a Elastic, o GEMP (concorrência e resiliência) também funciona.',
      en: 'Bora is your strongest: React Native + Supabase used for real by the Conceição do Mato Dentro municipality, with clear decisions (separating request from assignment, expiring presence, tested PostgreSQL policies). For Elastic, GEMP (concurrency and resilience) also works.',
    },
  },
  {
    id: 'behavioral-remote-async',
    cat: 'agile', type: 'behavioral', jobs: ['elastic', 'brasilcard', 'kwan'],
    tags: ['trabalho remoto', 'assíncrono', 'distribuído', 'comunicação escrita', 'fusos horários', 'autonomia'],
    reported: {
      pt: 'A Elastic é uma empresa distribuída desde a fundação e os relatos descrevem a rodada comportamental como "mais séria que o esperado". A vaga da Brasil Card é remota.',
      en: 'Elastic has been distributed since its founding and reports describe the behavioral round as "more serious than expected". The Brasil Card role is remote.',
    },
    q: {
      pt: 'Você vai trabalhar remoto com pessoas em outros fusos. Como você se comunica, pede ajuda, toma decisões e mostra progresso sem reunião o tempo todo?',
      en: 'You will work remotely with people in other time zones. How do you communicate, ask for help, make decisions, and show progress without constant meetings?',
    },
    a: {
      pt: `- **Escrita clara por padrão**: issues e PRs com contexto, o que foi feito, como testar e o que está pendente. Quem ler daqui a 8 horas, em outro fuso, não deveria precisar me perguntar nada.
- **Pedir ajuda bem**: depois de um tempo razoável tentando sozinha, pergunto já com o que tentei, o erro e uma hipótese. Isso respeita o tempo do outro e acelera a resposta.
- **Decisões registradas**: discussões técnicas viram um RFC ou ADR curto, com comentários assíncronos e prazo para decidir; reunião só quando a escrita travou.
- **Progresso visível**: atualizações curtas no canal ou no ticket, PRs pequenos e frequentes, e avisar cedo quando algo vai atrasar.
- **Autonomia com alinhamento**: entendo o objetivo e decido os detalhes; alinho antes de mudanças grandes ou difíceis de desfazer.
- **Sobreposição de horário** usada para o que realmente precisa ser síncrono (pareamento, decisões difíceis).

Dê um exemplo real de quando isso evitou um problema ou acelerou uma entrega.`,
      en: `- **Clear writing by default**: issues and PRs with context, what was done, how to test, and what is pending. Someone reading 8 hours later in another time zone should not need to ask me anything.
- **Asking for help well**: after a reasonable time trying alone, I ask with what I tried, the error, and a hypothesis. That respects others' time and speeds up answers.
- **Recorded decisions**: technical discussions become a short RFC or ADR with async comments and a decision deadline; a meeting only when writing stalls.
- **Visible progress**: short updates in the channel or ticket, small and frequent PRs, and flagging delays early.
- **Autonomy with alignment**: I understand the goal and decide the details; I align before large or hard-to-reverse changes.
- **Overlapping hours** used for what truly needs to be synchronous (pairing, hard decisions).

Give a real example of when this prevented a problem or sped up a delivery.`,
    },
    follow: [
      { pt: 'Conte de uma vez em que uma mensagem escrita gerou um mal-entendido. O que você mudou?', en: 'Tell me about a time a written message caused a misunderstanding. What did you change?' },
      { pt: 'Como você sabe que está travada há tempo demais?', en: 'How do you know you have been stuck too long?' },
    ],
    flags: {
      pt: '"Prefiro resolver tudo numa call." Ou ficar dias travada sem avisar ninguém.',
      en: '"I prefer to solve everything on a call." Or staying stuck for days without telling anyone.',
    },
    anchor: {
      pt: 'Você trabalhou em mais de uma empresa ao mesmo tempo, o que exige organização e comunicação assíncrona. Seu portfólio também cita PRs bem descritos, ADRs e templates de PR: são provas concretas.',
      en: 'You have worked for more than one company at the same time, which demands organization and async communication. Your portfolio also cites well-described PRs, ADRs, and PR templates: concrete proof.',
    },
  },
  {
    id: 'behavioral-relocation-consultancy',
    cat: 'agile', type: 'behavioral', jobs: ['kwan', 'brainrocket'],
    tags: ['realocação', 'Portugal', 'consultoria', 'entrevista com cliente', 'inglês', 'motivação'],
    reported: {
      pt: 'Sim. Na KWAN, os relatos do Glassdoor descrevem: entrevista de RH (motivo para ir para Portugal, valores, objetivos), teste de inglês, teste técnico de 1 hora, entrevista com especialista e depois com o cliente. Na BrainRocket, um sênior relatou: "Você pesquisou os aspectos de se mudar para a cidade da vaga?".',
      en: 'Yes. At KWAN, Glassdoor reports describe: HR interview (reasons for moving to Portugal, values, goals), an English test, a 1-hour technical test, a specialist interview, then the client interview. At BrainRocket, a senior reported: "Have you researched the aspects of relocating to the target city?".',
    },
    q: {
      pt: 'Por que você quer se mudar para Portugal (ou para a cidade da vaga)? Já pesquisou custo de vida, visto e adaptação? E como você se sai numa consultoria, sendo entrevistada pelo cliente?',
      en: 'Why do you want to move to Portugal (or the role\'s city)? Have you researched cost of living, visa, and adjustment? And how do you do at a consultancy, being interviewed by the client?',
    },
    a: {
      pt: `**Motivação**: uma razão profissional e uma pessoal, ambas verdadeiras, sem soar como fuga. Ex.: "quero trabalhar num mercado com produtos internacionais e times diversos; e quero viver essa experiência, que venho planejando com calma".

**Mostre que pesquisou** (é isso que eles avaliam, porque realocação que desiste em 3 meses custa caro): tipo de visto e quem patrocina, custo de moradia na cidade, tempo até começar, e que você entende a faixa salarial local.

**Consultoria (KWAN)**: você será alocada num cliente e entrevistada por ele. Mostre que se adapta a stacks, processos e culturas diferentes, que aprende rápido o domínio do cliente e que representa bem a consultoria (comunicação, pontualidade, transparência sobre problemas). Exemplos fortes: ter trabalhado em contextos muito diferentes (financeiro, ERP, indústria e mineração, prefeitura) e em mais de uma empresa ao mesmo tempo.

**Inglês**: pratique este pitch e as respostas técnicas em inglês; o teste costuma ser uma conversa.`,
      en: `**Motivation**: one professional and one personal reason, both true, without sounding like running away. E.g. "I want to work in a market with international products and diverse teams; and I want that experience, which I have been planning carefully".

**Show you researched it** (that is what they assess, because a relocation that quits in 3 months is costly): visa type and who sponsors it, housing costs in the city, time until you can start, and that you understand the local salary range.

**Consultancy (KWAN)**: you will be placed with a client and interviewed by them. Show you adapt to different stacks, processes, and cultures, learn the client's domain fast, and represent the consultancy well (communication, punctuality, transparency about problems). Strong examples: having worked in very different contexts (finance, ERP, industry and mining, a municipality) and for more than one company at a time.

**English**: rehearse this pitch and your technical answers in English; the test is usually a conversation.`,
    },
    follow: [
      { pt: 'O cliente usa uma stack que você não conhece. O que faz na primeira semana?', en: 'The client uses a stack you do not know. What do you do in your first week?' },
      { pt: 'Qual a sua expectativa salarial em euros?', en: 'What is your salary expectation in euros?' },
    ],
    flags: {
      pt: '"Quero sair do Brasil" como única razão, ou não saber nada sobre visto e custo de vida.',
      en: '"I want to leave Brazil" as the only reason, or knowing nothing about visas and cost of living.',
    },
    anchor: {
      pt: 'Você trabalhou em domínios muito variados (financeiro, ERP, indústria, mineração, agronegócio, prefeitura) e em mais de uma empresa ao mesmo tempo: é o perfil que uma consultoria procura. Use o modo EN do app para ensaiar.',
      en: 'You have worked in very varied domains (finance, ERP, industry, mining, agribusiness, a municipality) and for more than one company at once: exactly the profile a consultancy wants. Use the app\'s EN mode to rehearse.',
    },
  },
];
