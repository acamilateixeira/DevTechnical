// "Como medir": para cada parte da stack, qual métrica olhar, com qual ferramenta, onde clicar,
// qual valor é bom e como falar disso na entrevista. Cada card aponta para labs e perguntas.
// Limiares de Web Vitals: web.dev/web-vitals (percentil 75). Live metrics: Chrome DevTools (Performance).
// React DevTools: Components ⚙️ "Highlight updates…", Profiler ⚙️ "Record why each component rendered…".
// React 19.2: Performance Tracks (Scheduler e Components) no painel Performance do Chrome.
// "commit" em minúsculas não é anotado (no React é um commit de tela, no Git um commit de código); só COMMIT de SQL.

const r = (pt, en) => ({ pt, en });

export const areas = {
  front: r('Front-end (React / Next.js)', 'Front end (React / Next.js)'),
  node: r('Node.js', 'Node.js'),
  api: r('APIs e observabilidade', 'APIs and observability'),
  db: r('Banco de dados', 'Databases'),
  php: r('PHP / Laravel', 'PHP / Laravel'),
  queue: r('Filas e cache', 'Queues and cache'),
  team: r('Entrega (time)', 'Delivery (team)'),
};

export const method = r(
  `Quando o recrutador pergunta **"como você mediu?"**, responda sempre nesta ordem:

1. **Linha de base**: medi antes, com a ferramenta X, e o número era Y (ex.: "o p95 da rota era 1,8 s").
2. **Hipótese**: o que eu achava que era a causa e por quê (ex.: "o trace mostrava 50 queries iguais").
3. **Mudança**: uma coisa de cada vez.
4. **Medi de novo**, do mesmo jeito, e comparei (ex.: "caiu para 220 ms").
5. **Deixei monitorado** em produção (dashboard, alerta ou teste), para não voltar a piorar.

Número sem ferramenta e sem "antes e depois" soa decorado. Ferramenta sem número soa que você nunca usou.`,
  `When the recruiter asks **"how did you measure it?"**, always answer in this order:

1. **Baseline**: I measured first, with tool X, and the number was Y (e.g., "the route's p95 was 1.8 s").
2. **Hypothesis**: what I thought the cause was and why (e.g., "the trace showed 50 identical queries").
3. **Change**: one thing at a time.
4. **Measured again**, the same way, and compared (e.g., "it dropped to 220 ms").
5. **Kept it monitored** in production (dashboard, alert, or test) so it doesn't regress.

A number without a tool and without "before and after" sounds memorized. A tool without a number sounds like you've never used it.`);

export const cards = [
  // ---------------- FRONT ----------------
  {
    id: 'react-rerenders', area: 'front', icon: '⚛️',
    title: r('Re-renders desnecessários', 'Unnecessary re-renders'),
    why: r('Componente que redesenha sem precisar deixa a tela lenta em listas, formulários e painéis.', 'Components that re-render for no reason make lists, forms, and dashboards slow.'),
    metrics: [
      { name: r('Renders por interação', 'Renders per interaction'), good: r('só quem mudou de verdade', 'only what actually changed') },
      { name: r('Duração do commit (Profiler)', 'Commit duration (Profiler)'), good: r('abaixo de ~16 ms para não perder quadro (60 fps)', 'under ~16 ms so no frame is dropped (60 fps)') },
    ],
    tools: ['React DevTools (Components, Profiler)', '<Profiler onRender>'],
    steps: r([
      'Instale a extensão **React Developer Tools** no Chrome ou Firefox. Ela adiciona as abas **⚛️ Components** e **⚛️ Profiler** no DevTools (F12).',
      'Aba **Components** → ícone de engrenagem ⚙️ → ligue **"Highlight updates when components render"**. Agora, ao usar a tela, cada componente que redesenha pisca com uma borda.',
      'Aba **Profiler** → engrenagem ⚙️ → ligue **"Record why each component rendered while profiling"**.',
      'Clique no botão de gravar ⏺, faça UMA interação (digitar, clicar num filtro) e pare a gravação.',
      'No canto de cima, cada barrinha é um **commit** (uma atualização da tela). Clique na mais alta.',
      '**Flamegraph**: cinza = não renderizou; colorido = renderizou (largura = tempo). **Ranked**: os mais lentos primeiro.',
      'Clique num componente: o painel da direita mostra **"Why did this render?"** (props mudaram, hook mudou, o pai renderizou…). É aqui que você descobre a causa.',
      'Corrija (separar Context, `memo`, seletor, mover estado para baixo) e grave de novo a MESMA interação para comparar.',
    ], [
      'Install the **React Developer Tools** extension for Chrome or Firefox. It adds the **⚛️ Components** and **⚛️ Profiler** tabs to DevTools (F12).',
      '**Components** tab → gear icon ⚙️ → turn on **"Highlight updates when components render"**. Now every component that re-renders flashes with a border as you use the screen.',
      '**Profiler** tab → gear ⚙️ → turn on **"Record why each component rendered while profiling"**.',
      'Click record ⏺, do ONE interaction (typing, clicking a filter), and stop.',
      'At the top, each small bar is a **commit** (one screen update). Click the tallest one.',
      '**Flamegraph**: gray = didn\'t render; colored = rendered (width = time). **Ranked**: slowest first.',
      'Click a component: the right panel shows **"Why did this render?"** (props changed, a hook changed, the parent rendered…). That\'s where you find the cause.',
      'Fix it (split the Context, `memo`, a selector, moving state down) and record the SAME interaction again to compare.',
    ]),
    code: `// Medir em código (também funciona em produção com o build de profiling)
import { Profiler } from 'react';
<Profiler id="ListaViagens" onRender={(id, phase, actualDuration, baseDuration) => {
  // actualDuration: quanto levou este render | baseDuration: quanto levaria sem memo
  if (actualDuration > 16) console.warn(id, phase, actualDuration.toFixed(1), 'ms');
}}>
  <ListaViagens />
</Profiler>`,
    say: r('"Uso o Profiler do React DevTools com \'Record why each component rendered\' ligado: gravo uma interação, vejo no ranked chart quem demorou e no \'Why did this render\' por quê. Corrijo uma coisa e gravo de novo a mesma interação para comparar o número de renders e o tempo do commit."',
      '"I use the React DevTools Profiler with \'Record why each component rendered\' on: I record one interaction, see in the ranked chart what was slow and in \'Why did this render\' why. I fix one thing and record the same interaction again to compare render counts and commit time."'),
    labs: ['react-rerenders', 'mini-zustand', 'react-keys'], questions: ['react-devtools-debugging', 'react-performance-memo', 'react-usereducer-context', 'react-redux-zustand-code'],
  },
  {
    id: 'inp', area: 'front', icon: '👆',
    title: r('Interações lentas (INP)', 'Slow interactions (INP)'),
    why: r('INP (Interaction to Next Paint) mede quanto tempo a tela leva para responder a um clique, toque ou tecla. É uma das Core Web Vitals do Google.', 'INP (Interaction to Next Paint) measures how long the screen takes to respond to a click, tap, or key. It\'s one of Google\'s Core Web Vitals.'),
    metrics: [
      { name: r('INP (percentil 75 dos usuários)', 'INP (75th percentile of users)'), good: r('bom ≤ 200 ms · ruim > 500 ms', 'good ≤ 200 ms · poor > 500 ms') },
      { name: r('Tarefas longas (long tasks)', 'Long tasks'), good: r('nenhuma acima de 50 ms durante a interação', 'none over 50 ms during the interaction') },
    ],
    tools: ['Chrome DevTools → Performance', 'React 19.2 Performance Tracks', 'web-vitals (onINP)'],
    steps: r([
      'Abra o DevTools (F12) → aba **Performance**. A tela inicial já mostra **Local metrics**: LCP, CLS e INP, atualizando enquanto você usa a página, com cor verde/amarela/vermelha.',
      'Use a tela. A seção **Interactions** lista cada clique ou tecla com o tempo. Ache a mais lenta.',
      'Para ver o porquê: clique em **Record** ⏺, repita a interação lenta, pare. No traço, a faixa **Interactions** divide o tempo em **input delay** (esperando o JS livre), **processing** (seu código) e **presentation** (desenhar).',
      'No React 19.2+, a mesma gravação mostra as faixas do React: **Scheduler** (prioridade: bloqueante ou transition) e **Components** (quem renderizou e quanto tempo).',
      'Correções típicas: dividir trabalho pesado, `startTransition` para atualização que pode esperar, `useDeferredValue`, debounce, virtualizar listas grandes.',
      'Em produção (usuários reais): biblioteca `web-vitals` com `onINP` e o build de attribution, mandando para o seu analytics ou APM (ex.: Elastic RUM).',
    ], [
      'Open DevTools (F12) → **Performance** tab. The landing view already shows **Local metrics**: LCP, CLS, and INP, updating as you use the page, colored green/yellow/red.',
      'Use the screen. The **Interactions** section lists every click or key with its time. Find the slowest.',
      'To see why: click **Record** ⏺, repeat the slow interaction, stop. In the trace, the **Interactions** track splits time into **input delay** (waiting for JS to be free), **processing** (your code), and **presentation** (painting).',
      'In React 19.2+, the same recording shows React\'s tracks: **Scheduler** (priority: blocking or transition) and **Components** (what rendered and for how long).',
      'Typical fixes: split heavy work, `startTransition` for updates that can wait, `useDeferredValue`, debounce, virtualize big lists.',
      'In production (real users): the `web-vitals` library with `onINP` and the attribution build, sending to your analytics or APM (e.g., Elastic RUM).',
    ]),
    code: `import { onINP, onLCP, onCLS } from 'web-vitals/attribution';
const send = (m) => navigator.sendBeacon('/vitals', JSON.stringify({
  name: m.name, value: m.value, rating: m.rating, // 'good' | 'needs-improvement' | 'poor'
  target: m.attribution?.interactionTarget,       // qual elemento foi clicado (INP)
}));
onINP(send); onLCP(send); onCLS(send);`,
    say: r('"Olho o INP no p75. Localmente, uso o painel Performance do Chrome: ele mostra o INP ao vivo e, gravando, separa input delay, processamento e pintura; no React 19.2 aparecem também as faixas Scheduler e Components. Em produção, coleto com a biblioteca web-vitals e mando para o APM."',
      '"I watch INP at p75. Locally I use Chrome\'s Performance panel: it shows INP live and, when recording, splits input delay, processing, and paint; with React 19.2 the Scheduler and Components tracks show up too. In production I collect it with the web-vitals library and send it to the APM."'),
    labs: ['debounce', 'event-loop'], questions: ['react-performance-memo', 'obs-frontend-reactflow', 'mui-theming-performance'],
  },
  {
    id: 'load', area: 'front', icon: '🚀',
    title: r('Carregamento (LCP, CLS) e tamanho do JavaScript', 'Loading (LCP, CLS) and JavaScript size'),
    why: r('LCP é quando o maior conteúdo aparece; CLS é o quanto a tela "pula". JavaScript demais atrasa os dois.', 'LCP is when the largest content appears; CLS is how much the page "jumps". Too much JavaScript delays both.'),
    metrics: [
      { name: r('LCP (p75)', 'LCP (p75)'), good: r('bom ≤ 2,5 s · ruim > 4 s', 'good ≤ 2.5 s · poor > 4 s') },
      { name: r('CLS (p75)', 'CLS (p75)'), good: r('bom ≤ 0,1 · ruim > 0,25', 'good ≤ 0.1 · poor > 0.25') },
      { name: r('JavaScript da primeira tela', 'First-screen JavaScript'), good: r('o menor possível; compare antes e depois', 'as small as possible; compare before and after') },
    ],
    tools: ['Chrome DevTools → Performance (Record and reload)', 'Lighthouse', 'Network', 'bundle analyzer'],
    steps: r([
      'DevTools → **Performance** → **Record and reload** ⟳: grava o carregamento. A métrica LCP mostra qual elemento foi o maior conteúdo (clique para achá-lo na página).',
      'DevTools → **Lighthouse** → "Analyze page load": nota e lista de oportunidades (imagens grandes, JS não usado, etc.). Rode com a aba anônima e "Mobile".',
      'DevTools → **Network** → marque "Disable cache" e escolha "Fast 4G" para simular celular. Ordene por tamanho.',
      'Tamanho do bundle: `@next/bundle-analyzer` (Next.js), `rollup-plugin-visualizer` (Vite) ou `source-map-explorer`. Ache a biblioteca gigante e troque ou carregue com `import()` só quando precisar.',
      'CLS: reserve espaço para imagem e anúncio (`width`/`height`), não injete conteúdo acima do que já está na tela.',
    ], [
      'DevTools → **Performance** → **Record and reload** ⟳: records the page load. The LCP metric shows which element was the largest content (click to find it on the page).',
      'DevTools → **Lighthouse** → "Analyze page load": a score and a list of opportunities (big images, unused JS, etc.). Run it in an incognito tab with "Mobile".',
      'DevTools → **Network** → check "Disable cache" and pick "Fast 4G" to simulate a phone. Sort by size.',
      'Bundle size: `@next/bundle-analyzer` (Next.js), `rollup-plugin-visualizer` (Vite), or `source-map-explorer`. Find the giant library and replace it or load it with `import()` only when needed.',
      'CLS: reserve space for images and ads (`width`/`height`) and don\'t inject content above what\'s already on screen.',
    ]),
    say: r('"Meço LCP e CLS no p75 dos usuários reais e, localmente, com o Performance do Chrome em Record and reload e com o Lighthouse. Para JavaScript, abro o bundle analyzer, acho o que pesa e faço code splitting com import dinâmico ou Server Components."',
      '"I measure LCP and CLS at real users\' p75 and locally with Chrome\'s Performance panel (Record and reload) and Lighthouse. For JavaScript, I open the bundle analyzer, find what\'s heavy, and code-split with dynamic import or Server Components."'),
    labs: [], questions: ['next-rendering-strategies', 'mui-theming-performance', 'obs-frontend-reactflow'],
  },
  {
    id: 'network-front', area: 'front', icon: '🌐',
    title: r('Requisições da tela (duplicadas, fora de ordem, cache)', 'Screen requests (duplicated, out of order, cache)'),
    why: r('Muita lentidão de front é rede: a mesma busca duas vezes, resposta velha por cima da nova, nada em cache.', 'A lot of front-end slowness is network: the same fetch twice, an old response over a new one, nothing cached.'),
    metrics: [
      { name: r('Requisições por tela', 'Requests per screen'), good: r('sem duplicadas', 'no duplicates') },
      { name: r('Tempo de espera (TTFB) por requisição', 'Waiting time (TTFB) per request'), good: r('estável; o p95 vem do back-end', 'stable; the p95 comes from the back end') },
    ],
    tools: ['Chrome DevTools → Network', 'TanStack Query Devtools', 'Apollo Client Devtools'],
    steps: r([
      'DevTools → **Network** → filtro **Fetch/XHR**. Faça a ação e veja quantas requisições saíram e em que ordem voltaram (coluna Waterfall).',
      'Clique numa requisição → **Timing**: "Waiting for server response" é o tempo do back-end; "Content download" é o tamanho.',
      'Requisição cancelada aparece como **(canceled)**: é o que o `AbortController` faz no lab de race condition.',
      'TanStack Query: `<ReactQueryDevtools />` mostra cada query como fresh, stale, fetching ou inactive, e quantas vezes buscou.',
      'Apollo: a extensão Apollo Client Devtools mostra o cache normalizado e cada query.',
    ], [
      'DevTools → **Network** → **Fetch/XHR** filter. Do the action and see how many requests went out and in what order they came back (Waterfall column).',
      'Click a request → **Timing**: "Waiting for server response" is back-end time; "Content download" is size.',
      'A canceled request shows as **(canceled)**: that\'s what `AbortController` does in the race-condition lab.',
      'TanStack Query: `<ReactQueryDevtools />` shows each query as fresh, stale, fetching, or inactive, and how many times it fetched.',
      'Apollo: the Apollo Client Devtools extension shows the normalized cache and each query.',
    ]),
    say: r('"Abro a aba Network filtrando Fetch/XHR para ver duplicadas e ordem de chegada, e o Timing para separar tempo de servidor de download. No React, o Devtools do TanStack Query mostra o estado do cache de cada query."',
      '"I open the Network tab filtered to Fetch/XHR to spot duplicates and arrival order, and Timing to separate server time from download. In React, the TanStack Query Devtools show each query\'s cache state."'),
    labs: ['react-effect-race', 'dataloader'], questions: ['react-useeffect-pitfalls', 'react-state-management', 'apollo-client-cache'],
  },
  // ---------------- NODE ----------------
  {
    id: 'node-eventloop', area: 'node', icon: '⏱️',
    title: r('Event loop travado (event loop lag)', 'Blocked event loop (event loop lag)'),
    why: r('Se o event loop trava, TODAS as requisições esperam. É a primeira métrica de saúde de um serviço Node.', 'If the event loop is blocked, EVERY request waits. It\'s the first health metric of a Node service.'),
    metrics: [
      { name: r('Atraso do event loop (p99)', 'Event loop delay (p99)'), good: r('perto de poucos ms; centenas de ms = algo bloqueando', 'a few ms; hundreds of ms = something blocking') },
      { name: r('Latência das outras rotas durante a operação pesada', 'Other routes\' latency during heavy work'), good: r('não pode subir', 'must not go up') },
    ],
    tools: ['perf_hooks.monitorEventLoopDelay', 'node --cpu-prof', 'Chrome DevTools (chrome://inspect)', 'Clinic.js Doctor'],
    steps: r([
      'Coloque a medição no serviço (código abaixo) e exporte o p99 como métrica (Prometheus, OpenTelemetry ou log).',
      'Para achar QUEM bloqueia: rode `node --cpu-prof app.js`, faça a operação lenta e pare o processo. Ele gera um arquivo `.cpuprofile`.',
      'Abra o Chrome → DevTools → **Performance** → arraste o `.cpuprofile` para dentro. A função mais larga no flame chart é a culpada.',
      'Ao vivo: `node --inspect app.js` → no Chrome abra `chrome://inspect` → **inspect** → aba **Performance** (ou Profiler) → grave.',
      'Rode o lab Node 02: sem worker o servidor responde em ~1410 ms; com `worker_threads`, ~10 ms.',
    ], [
      'Add the measurement to the service (code below) and export the p99 as a metric (Prometheus, OpenTelemetry, or a log).',
      'To find WHO is blocking: run `node --cpu-prof app.js`, do the slow operation, and stop the process. It writes a `.cpuprofile` file.',
      'Open Chrome → DevTools → **Performance** → drag the `.cpuprofile` in. The widest function in the flame chart is the culprit.',
      'Live: `node --inspect app.js` → in Chrome open `chrome://inspect` → **inspect** → **Performance** (or Profiler) tab → record.',
      'Run Node lab 02: without a worker the server answers in ~1410 ms; with `worker_threads`, ~10 ms.',
    ]),
    code: `import { monitorEventLoopDelay } from 'node:perf_hooks';
const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();
setInterval(() => {
  // valores em nanossegundos → ms
  console.log('event loop p50/p99 ms:', (h.percentile(50) / 1e6).toFixed(1), (h.percentile(99) / 1e6).toFixed(1));
  h.reset();
}, 10_000);`,
    say: r('"Monitoro o event loop delay com monitorEventLoopDelay e alerto no p99. Quando sobe, gero um CPU profile com --cpu-prof e abro no Chrome para ver a função que travou; trabalho de CPU vai para worker_threads ou para uma fila."',
      '"I monitor event loop delay with monitorEventLoopDelay and alert on p99. When it rises, I take a CPU profile with --cpu-prof and open it in Chrome to see the blocking function; CPU work goes to worker_threads or a queue."'),
    labs: ['event-loop'], nodeLabs: ['02-bloqueio-event-loop.mjs'], questions: ['node-event-loop-blocking', 'js-event-loop'],
  },
  {
    id: 'node-memory', area: 'node', icon: '🧠',
    title: r('Memória e vazamentos', 'Memory and leaks'),
    why: r('Memória que só sobe derruba o pod (OOMKilled) de tempos em tempos.', 'Memory that only goes up takes the pod down (OOMKilled) every so often.'),
    metrics: [
      { name: r('`heapUsed` e RSS ao longo do tempo', '`heapUsed` and RSS over time'), good: r('sobe e desce (serra); não sobe sem parar', 'goes up and down (sawtooth); never climbs forever') },
      { name: r('Reinícios por OOM', 'OOM restarts'), good: r('zero', 'zero') },
    ],
    tools: ['process.memoryUsage()', 'Chrome DevTools → Memory (heap snapshot)', 'node --heapsnapshot-signal'],
    steps: r([
      'Registre `process.memoryUsage()` periodicamente (ou use as métricas padrão do OpenTelemetry/Prometheus) e veja o gráfico.',
      '`node --inspect app.js` → `chrome://inspect` → aba **Memory** → **Heap snapshot**. Tire um, faça a operação 100 vezes, tire outro.',
      'No segundo snapshot, mude a visão para **Comparison**: objetos que só aumentam entre os dois são o vazamento (listeners não removidos, cache sem limite, arrays globais).',
      'Em produção sem inspector: `node --heapsnapshot-signal=SIGUSR2 app.js` e envie `kill -USR2 <pid>` para gerar o arquivo.',
      'Lab Node 03: sem backpressure a memória vai a ~131 MB; com `pipeline`, ~71 MB e estável.',
    ], [
      'Log `process.memoryUsage()` periodically (or use the default OpenTelemetry/Prometheus metrics) and look at the graph.',
      '`node --inspect app.js` → `chrome://inspect` → **Memory** tab → **Heap snapshot**. Take one, do the operation 100 times, take another.',
      'In the second snapshot switch to **Comparison**: objects that only grow between the two are the leak (unremoved listeners, unbounded caches, global arrays).',
      'In production without the inspector: `node --heapsnapshot-signal=SIGUSR2 app.js` and send `kill -USR2 <pid>` to write the file.',
      'Node lab 03: without backpressure memory reaches ~131 MB; with `pipeline`, ~71 MB and steady.',
    ]),
    say: r('"Acompanho heapUsed e RSS; se só sobe, tiro dois heap snapshots no Chrome com a operação repetida no meio e uso a visão Comparison para achar o que acumula."',
      '"I track heapUsed and RSS; if it only climbs, I take two heap snapshots in Chrome with the operation repeated in between and use the Comparison view to find what accumulates."'),
    labs: [], nodeLabs: ['03-streams-backpressure.mjs'], questions: ['node-streams-backpressure', 'k8s-core-concepts'],
  },
  {
    id: 'load-test', area: 'node', icon: '🔨',
    title: r('Teste de carga (quanto a API aguenta)', 'Load testing (how much the API handles)'),
    why: r('Para dizer "aguenta X requisições por segundo com p95 de Y" você precisa ter medido.', 'To say "it handles X requests per second at a p95 of Y" you need to have measured it.'),
    metrics: [
      { name: r('Requisições por segundo (throughput)', 'Requests per second (throughput)'), good: r('acima do pico esperado, com folga', 'above the expected peak, with headroom') },
      { name: r('Latência p95 e p99', 'p95 and p99 latency'), good: r('dentro do SLO (ex.: p95 < 300 ms)', 'within the SLO (e.g., p95 < 300 ms)') },
      { name: r('Taxa de erro', 'Error rate'), good: r('perto de 0% até o pico', 'near 0% up to the peak') },
    ],
    tools: ['k6', 'autocannon', 'Grafana / Elastic APM'],
    steps: r([
      'Rode contra um ambiente parecido com produção, nunca contra produção sem combinar.',
      'Comece pequeno e aumente a carga em degraus; observe quando o p95 dispara: esse é o limite.',
      'Ao mesmo tempo, olhe CPU, memória, event loop delay e conexões do banco: o primeiro que satura é o gargalo.',
      'Repita depois da otimização com o MESMO script e compare.',
    ], [
      'Run against a production-like environment, never against production without agreeing on it.',
      'Start small and increase load in steps; watch when p95 spikes: that\'s the limit.',
      'At the same time, watch CPU, memory, event loop delay, and database connections: whichever saturates first is the bottleneck.',
      'Repeat after optimizing with the SAME script and compare.',
    ]),
    code: `// k6 run carga.js
import http from 'k6/http';
export const options = {
  stages: [{ duration: '1m', target: 50 }, { duration: '2m', target: 200 }, { duration: '1m', target: 0 }],
  thresholds: { http_req_duration: ['p(95)<300'], http_req_failed: ['rate<0.01'] }, // falha o teste se passar
};
export default () => http.get('https://staging.exemplo.com/api/viagens?status=pendente');

// ou rápido, só Node:  npx autocannon -c 50 -d 30 http://localhost:3000/viagens`,
    say: r('"Faço teste de carga com k6 em degraus, com thresholds de p95 e taxa de erro, e observo CPU, event loop e pool do banco ao mesmo tempo para achar o gargalo. Repito o mesmo script depois da mudança."',
      '"I load-test with k6 in stages, with p95 and error-rate thresholds, and watch CPU, event loop, and the database pool at the same time to find the bottleneck. I rerun the same script after the change."'),
    labs: ['resilience'], questions: ['node-event-loop-blocking', 'arch-resilience-partial'],
  },
  // ---------------- API / OBS ----------------
  {
    id: 'red', area: 'api', icon: '📈',
    title: r('Saúde de cada rota: RED (taxa, erros, duração)', 'Each route\'s health: RED (rate, errors, duration)'),
    why: r('São as três métricas que respondem "a API está bem?": quantas requisições, quantas deram erro e quanto demoraram.', 'The three metrics that answer "is the API okay?": how many requests, how many failed, and how long they took.'),
    metrics: [
      { name: r('Rate: requisições por segundo, por rota', 'Rate: requests per second, per route'), good: r('compare com o normal do horário', 'compare with the usual for that time') },
      { name: r('Errors: % de 5xx', 'Errors: % of 5xx'), good: r('dentro do error budget do SLO', 'within the SLO error budget') },
      { name: r('Duration: p50, p95, p99', 'Duration: p50, p95, p99'), good: r('p95 dentro do SLO; nunca olhe só a média', 'p95 within the SLO; never look at the average alone') },
    ],
    tools: ['OpenTelemetry', 'Elastic APM / Kibana', 'Prometheus + Grafana', 'Datadog / New Relic'],
    steps: r([
      'Instrumente uma vez com OpenTelemetry (auto-instrumentação de HTTP, banco e fila) e mande para o APM.',
      'No APM (ex.: Kibana → Observability → APM → Services → seu serviço), veja a lista de **transactions** (rotas) com throughput, latência e taxa de erro.',
      'Ordene por "impacto" (latência × volume): a rota que mais faz o usuário esperar no total é a primeira a atacar.',
      'Abra uma transação lenta → **trace**: a cascata de spans mostra onde foi o tempo (banco, outra API, código).',
      'Pule do trace para os logs pelo `trace.id` para ver a mensagem de erro.',
    ], [
      'Instrument once with OpenTelemetry (auto-instrumentation for HTTP, database, and queue) and send it to the APM.',
      'In the APM (e.g., Kibana → Observability → APM → Services → your service), see the **transactions** (routes) list with throughput, latency, and error rate.',
      'Sort by "impact" (latency × volume): the route that makes users wait the most in total is the first to tackle.',
      'Open a slow transaction → **trace**: the span waterfall shows where the time went (database, another API, code).',
      'Jump from the trace to the logs via `trace.id` to see the error message.',
    ]),
    say: r('"Para cada serviço olho RED por rota (taxa, erros e p95/p99), instrumentado com OpenTelemetry. Quando uma rota piora, abro o trace para ver em qual span foi o tempo e pulo para o log pelo trace.id."',
      '"For each service I look at RED per route (rate, errors, and p95/p99), instrumented with OpenTelemetry. When a route gets worse, I open the trace to see which span took the time and jump to the log by trace.id."'),
    labs: ['resilience'], questions: ['obs-three-pillars', 'otel-node-instrumentation', 'obs-slo-alerting', 'elasticsearch-fundamentals'],
  },
  {
    id: 'slo', area: 'api', icon: '🎯',
    title: r('SLO, error budget e alertas que não acordam à toa', 'SLOs, error budget, and alerts that don\'t wake you for nothing'),
    why: r('Medir é diferente de alertar: o alerta tem que tocar quando o usuário sofre, não quando a CPU passa de 80%.', 'Measuring isn\'t alerting: an alert should fire when users suffer, not when CPU crosses 80%.'),
    metrics: [
      { name: r('SLI: % de requisições boas', 'SLI: % of good requests'), good: r('acima do SLO (ex.: 99,9%)', 'above the SLO (e.g., 99.9%)') },
      { name: r('Burn rate', 'Burn rate'), good: r('alerta rápido acima de ~14x, lento acima de ~6x', 'fast alert above ~14x, slow alert above ~6x') },
    ],
    tools: ['Prometheus (PromQL)', 'Kibana SLOs', 'Grafana'],
    steps: r([
      'Escolha o SLI do ponto de vista do usuário: "requisição respondeu com sucesso em menos de 300 ms".',
      'Defina o SLO (ex.: 99,9% em 30 dias) e calcule o error budget (~43 min por mês).',
      'Crie alerta de burn rate em duas janelas (ex.: 1 h e 5 min): só toca se o budget está acabando rápido de verdade.',
      'Cada alerta tem um link de runbook: o que olhar e o que fazer.',
    ], [
      'Pick the SLI from the user\'s point of view: "the request succeeded in under 300 ms".',
      'Set the SLO (e.g., 99.9% over 30 days) and compute the error budget (~43 min per month).',
      'Create a burn-rate alert over two windows (e.g., 1 h and 5 min): it only fires if the budget is really draining fast.',
      'Every alert links to a runbook: what to check and what to do.',
    ]),
    say: r('"Defino SLI do ponto de vista do usuário, SLO e error budget, e alerto por burn rate com duas janelas e runbook, em vez de alertar CPU."',
      '"I define a user-facing SLI, an SLO, and an error budget, and alert on burn rate over two windows with a runbook, instead of alerting on CPU."'),
    labs: [], questions: ['obs-slo-alerting', 'elastic-alerting-design', 'behavioral-incident-star'],
  },
  // ---------------- DB ----------------
  {
    id: 'slow-queries', area: 'db', icon: '🐌',
    title: r('Query lenta: achar e explicar', 'Slow query: find it and explain it'),
    why: r('Na maioria das vezes, a lentidão de uma API é uma query sem índice ou lendo linha demais.', 'Most of the time an API\'s slowness is a query without an index or reading too many rows.'),
    metrics: [
      { name: r('Tempo da query (p95)', 'Query time (p95)'), good: r('milissegundos para consultas de tela', 'milliseconds for screen queries') },
      { name: r('Linhas lidas ÷ linhas devolvidas', 'Rows read ÷ rows returned'), good: r('perto de 1; 20 milhões lidas para 50 devolvidas = falta índice', 'close to 1; 20 million read for 50 returned = missing index') },
    ],
    tools: ['EXPLAIN ANALYZE', 'pg_stat_statements', 'MySQL slow query log', 'SQL Server Query Store / plano de execução'],
    steps: r([
      '**Achar as piores**: PostgreSQL → extensão `pg_stat_statements` (ordene por `total_exec_time`). MySQL → `slow_query_log = ON` e `long_query_time = 0.5`. SQL Server → **Query Store** no SSMS (Top Resource Consuming Queries).',
      '**Explicar uma**: PostgreSQL e MySQL 8 → `EXPLAIN ANALYZE <query>`. SQL Server → no SSMS, ligue **Include Actual Execution Plan** (Ctrl+M) e rode.',
      'Procure: **Seq Scan / Table Scan** em tabela grande, **Sort** em disco, linhas estimadas muito diferentes das reais.',
      'Crie o índice certo (colunas de igualdade primeiro, depois a de ordenação) e rode o mesmo `EXPLAIN ANALYZE` de novo.',
    ], [
      '**Find the worst**: PostgreSQL → the `pg_stat_statements` extension (sort by `total_exec_time`). MySQL → `slow_query_log = ON` and `long_query_time = 0.5`. SQL Server → **Query Store** in SSMS (Top Resource Consuming Queries).',
      '**Explain one**: PostgreSQL and MySQL 8 → `EXPLAIN ANALYZE <query>`. SQL Server → in SSMS turn on **Include Actual Execution Plan** (Ctrl+M) and run it.',
      'Look for: **Seq Scan / Table Scan** on a big table, an on-disk **Sort**, estimated rows far from actual rows.',
      'Create the right index (equality columns first, then the ordering one) and run the same `EXPLAIN ANALYZE` again.',
    ]),
    code: `-- PostgreSQL: as 10 queries que mais consomem tempo no total
SELECT query, calls, round(total_exec_time) AS total_ms, round(mean_exec_time, 1) AS media_ms, rows
FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;

-- MySQL: ligar o log de queries lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.5;  -- segundos`,
    say: r('"Primeiro acho as queries que mais pesam no total (pg_stat_statements, slow query log ou Query Store, conforme o banco). Depois rodo EXPLAIN ANALYZE ou o plano real no SQL Server, procuro scan em tabela grande e diferença entre linhas lidas e devolvidas, crio o índice e comparo o plano antes e depois."',
      '"First I find the queries with the highest total cost (pg_stat_statements, slow query log, or Query Store, depending on the database). Then I run EXPLAIN ANALYZE or the actual plan in SQL Server, look for scans on big tables and the gap between rows read and returned, create the index, and compare the plan before and after."'),
    labs: [], questions: ['db-indexes-explain', 'sql-three-databases', 'sql-live-query-faturas', 'legacy-production-bug'],
  },
  {
    id: 'n-plus-one', area: 'db', icon: '🔁',
    title: r('Queries por requisição (N+1)', 'Queries per request (N+1)'),
    why: r('Uma tela que faz 1 query para a lista e mais 1 por item fica lenta quando a lista cresce.', 'A screen that does 1 query for the list plus 1 per item gets slow as the list grows.'),
    metrics: [
      { name: r('Queries por requisição', 'Queries per request'), good: r('fixo (não cresce com o tamanho da lista)', 'constant (doesn\'t grow with list size)') },
      { name: r('Queries repetidas', 'Duplicate queries'), good: r('zero', 'zero') },
    ],
    tools: ['Laravel Debugbar / Telescope', 'APM (spans de banco no trace)', 'DataLoader', 'logs do ORM'],
    steps: r([
      'Laravel: **Debugbar** (aba Queries mostra a quantidade e marca as duplicadas) ou **Telescope** (`/telescope` → Requests → abra uma → Queries).',
      'Node/Nest: no trace do APM, conte os spans de banco dentro de uma requisição. 51 spans iguais = N+1.',
      'Corrija: `with()` no Eloquent, `include`/`JOIN` no ORM, DataLoader no GraphQL.',
      'Proteja: `Model::preventLazyLoading()` em desenvolvimento faz o Laravel dar erro no lazy loading.',
    ], [
      'Laravel: **Debugbar** (the Queries tab shows the count and flags duplicates) or **Telescope** (`/telescope` → Requests → open one → Queries).',
      'Node/Nest: in the APM trace, count the database spans within one request. 51 identical spans = N+1.',
      'Fix: `with()` in Eloquent, `include`/`JOIN` in the ORM, DataLoader in GraphQL.',
      'Guard: `Model::preventLazyLoading()` in development makes Laravel throw on lazy loading.',
    ]),
    say: r('"Conto queries por requisição: no Laravel com Debugbar ou Telescope, no Node pelos spans do trace. Se cresce com a lista, é N+1: resolvo com eager loading ou DataLoader e deixo o preventLazyLoading ligado em dev."',
      '"I count queries per request: in Laravel with Debugbar or Telescope, in Node through the trace spans. If it grows with the list, it\'s N+1: I fix it with eager loading or DataLoader and keep preventLazyLoading on in dev."'),
    labs: ['dataloader'], questions: ['graphql-n-plus-one', 'laravel-request-lifecycle', 'apollo-client-cache'],
  },
  {
    id: 'locks', area: 'db', icon: '🔒',
    title: r('Locks, esperas e deadlocks', 'Locks, waits, and deadlocks'),
    why: r('Transação que segura lock demais faz as outras esperarem; duas que se esperam viram deadlock.', 'A transaction holding locks too long makes others wait; two waiting on each other become a deadlock.'),
    metrics: [
      { name: r('Tempo esperando lock', 'Time waiting on locks'), good: r('perto de zero', 'close to zero') },
      { name: r('Deadlocks por hora', 'Deadlocks per hour'), good: r('zero ou raríssimos, com retry', 'zero or very rare, with retry') },
    ],
    tools: ['pg_stat_activity / pg_locks', 'SHOW ENGINE INNODB STATUS', 'SQL Server Extended Events / sp_who2'],
    steps: r([
      'PostgreSQL: `SELECT pid, state, wait_event_type, query FROM pg_stat_activity WHERE wait_event_type = \'Lock\';` mostra quem está esperando.',
      'MySQL: `SHOW ENGINE INNODB STATUS\\G` → seção **LATEST DETECTED DEADLOCK** mostra as duas transações.',
      'SQL Server: `sp_who2` (coluna BlkBy) e o evento `xml_deadlock_report` (Extended Events) para o gráfico do deadlock.',
      'Corrija: transações curtas, sempre travar na mesma ordem, nunca chamar API externa com lock aberto, update condicional atômico.',
    ], [
      'PostgreSQL: `SELECT pid, state, wait_event_type, query FROM pg_stat_activity WHERE wait_event_type = \'Lock\';` shows who is waiting.',
      'MySQL: `SHOW ENGINE INNODB STATUS\\G` → the **LATEST DETECTED DEADLOCK** section shows both transactions.',
      'SQL Server: `sp_who2` (BlkBy column) and the `xml_deadlock_report` event (Extended Events) for the deadlock graph.',
      'Fix: short transactions, always lock in the same order, never call an external API while holding a lock, atomic conditional updates.',
    ]),
    say: r('"Olho quem está esperando lock (pg_stat_activity no Postgres, INNODB STATUS no MySQL, Extended Events no SQL Server), mantenho transações curtas e travo sempre na mesma ordem."',
      '"I check who is waiting on locks (pg_stat_activity in Postgres, INNODB STATUS in MySQL, Extended Events in SQL Server), keep transactions short, and always lock in the same order."'),
    labs: ['lost-update'], questions: ['db-isolation-locks', 'payments-card-lifecycle'],
  },
  // ---------------- PHP ----------------
  {
    id: 'php-profile', area: 'php', icon: '🐘',
    title: r('Onde o PHP gasta tempo (profiling)', 'Where PHP spends time (profiling)'),
    why: r('Para saber se a lentidão é query, chamada externa ou código PHP, você precisa de um perfil da requisição.', 'To know whether slowness is a query, an external call, or PHP code, you need a profile of the request.'),
    metrics: [
      { name: r('Tempo total da requisição', 'Total request time'), good: r('dentro do SLO da rota', 'within the route\'s SLO') },
      { name: r('Tempo em queries × em PHP × em HTTP externo', 'Time in queries × PHP × external HTTP'), good: r('saber qual é o maior antes de otimizar', 'know which is biggest before optimizing') },
    ],
    tools: ['Xdebug (modo profile)', 'Laravel Telescope / Debugbar', 'Blackfire / Elastic APM PHP agent', 'Clockwork'],
    steps: r([
      'Em desenvolvimento: no `php.ini` (ou no Docker), `xdebug.mode=profile` e `xdebug.output_dir=/tmp`. Cada requisição gera um arquivo `cachegrind.out.*`.',
      'Abra o arquivo no **PhpStorm** (Tools → Analyze Xdebug Profiler Snapshot) ou no **QCacheGrind/KCachegrind** e ordene por tempo inclusivo: a função do topo é onde foi o tempo.',
      'Desligue o modo profile depois: ele deixa tudo bem mais lento.',
      'Laravel no dia a dia: **Debugbar** (timeline, queries, memória) ou **Telescope** (requisições, queries com tempo, jobs, exceções).',
      'Em produção: um APM com agente PHP (Elastic APM, New Relic, Blackfire) para ver p95 e traces sem Xdebug.',
    ], [
      'In development: in `php.ini` (or the Docker image), `xdebug.mode=profile` and `xdebug.output_dir=/tmp`. Every request writes a `cachegrind.out.*` file.',
      'Open it in **PhpStorm** (Tools → Analyze Xdebug Profiler Snapshot) or **QCacheGrind/KCachegrind** and sort by inclusive time: the top function is where the time went.',
      'Turn profile mode off afterwards: it makes everything much slower.',
      'Laravel day to day: **Debugbar** (timeline, queries, memory) or **Telescope** (requests, timed queries, jobs, exceptions).',
      'In production: an APM with a PHP agent (Elastic APM, New Relic, Blackfire) to see p95 and traces without Xdebug.',
    ]),
    code: `; php.ini (só no ambiente de desenvolvimento)
xdebug.mode = profile
xdebug.output_dir = /tmp/xdebug
xdebug.start_with_request = trigger   ; perfila só com ?XDEBUG_TRIGGER=1 ou o cookie`,
    say: r('"Em dev uso o Xdebug em modo profile e abro o cachegrind no PhpStorm para ver a função que mais consome; no Laravel, Debugbar ou Telescope para queries e timeline. Em produção, um APM com agente PHP."',
      '"In dev I use Xdebug in profile mode and open the cachegrind in PhpStorm to find the heaviest function; in Laravel, Debugbar or Telescope for queries and the timeline. In production, an APM with a PHP agent."'),
    labs: [], questions: ['legacy-production-bug', 'laravel-request-lifecycle', 'docker-php-dev-env', 'codeigniter3-architecture'],
  },
  // ---------------- QUEUE / CACHE ----------------
  {
    id: 'queues', area: 'queue', icon: '📬',
    title: r('Filas: atraso, mensagens presas e DLQ', 'Queues: lag, stuck messages, and the DLQ'),
    why: r('Fila que só cresce quer dizer que os consumidores não dão conta; mensagens na DLQ são falhas esperando alguém.', 'A queue that only grows means consumers can\'t keep up; messages in the DLQ are failures waiting for someone.'),
    metrics: [
      { name: r('RabbitMQ: Ready (esperando) e Unacked (em processamento)', 'RabbitMQ: Ready (waiting) and Unacked (in progress)'), good: r('Ready volta perto de zero depois dos picos', 'Ready returns near zero after peaks') },
      { name: r('Kafka: consumer lag', 'Kafka: consumer lag'), good: r('estável ou caindo', 'steady or falling') },
      { name: r('Mensagens na DLQ', 'Messages in the DLQ'), good: r('zero; qualquer uma gera alerta', 'zero; any one triggers an alert') },
    ],
    tools: ['RabbitMQ Management (porta 15672)', 'rabbitmqctl', 'kafka-consumer-groups.sh', 'Prometheus exporters'],
    steps: r([
      'RabbitMQ: abra `http://localhost:15672` → aba **Queues**. Colunas **Ready**, **Unacked** e **Total**, e as taxas **incoming / deliver / ack**.',
      'Ready subindo sem parar = consumidor lento ou parado. Unacked alto e parado = consumidor travado sem dar ack.',
      'Linha de comando: `rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers`.',
      'Kafka: `kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group meu-grupo` → coluna **LAG** por partição.',
      'Alerta: DLQ com mais de 0 mensagens e lag crescendo por mais de X minutos.',
    ], [
      'RabbitMQ: open `http://localhost:15672` → **Queues** tab. Columns **Ready**, **Unacked**, and **Total**, plus the **incoming / deliver / ack** rates.',
      'Ready climbing nonstop = a slow or stopped consumer. Unacked high and flat = a consumer stuck without acking.',
      'Command line: `rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers`.',
      'Kafka: `kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group my-group` → the **LAG** column per partition.',
      'Alert: DLQ above 0 messages and lag growing for more than X minutes.',
    ]),
    say: r('"No RabbitMQ acompanho Ready, Unacked e as taxas de deliver e ack pelo Management ou por métricas exportadas; no Kafka, o consumer lag por partição. Alerto quando a DLQ recebe mensagem ou o atraso cresce por vários minutos."',
      '"In RabbitMQ I track Ready, Unacked, and the deliver and ack rates through the Management UI or exported metrics; in Kafka, consumer lag per partition. I alert when the DLQ gets a message or lag keeps growing for several minutes."'),
    labs: ['outbox'], nodeLabs: ['05-outbox-sqlite.mjs'], questions: ['mq-rabbitmq-concepts', 'mq-outbox-pattern', 'nest-microservices-rabbitmq', 'laravel-queues-payments'],
  },
  {
    id: 'cache', area: 'queue', icon: '⚡',
    title: r('Cache: está ajudando mesmo?', 'Cache: is it actually helping?'),
    why: r('Cache com taxa de acerto baixa só adiciona complexidade; cache que expira junto derruba o banco.', 'A cache with a low hit ratio only adds complexity; a cache that expires all at once takes the database down.'),
    metrics: [
      { name: r('Hit ratio (acertos ÷ total)', 'Hit ratio (hits ÷ total)'), good: r('alto para as chaves quentes (ex.: > 90%)', 'high for hot keys (e.g., > 90%)') },
      { name: r('Evictions (chaves expulsas por falta de memória)', 'Evictions (keys evicted for lack of memory)'), good: r('perto de zero', 'near zero') },
      { name: r('Queries no banco quando a chave expira', 'Database queries when a key expires'), good: r('1, não N (sem stampede)', '1, not N (no stampede)') },
    ],
    tools: ['redis-cli INFO stats', 'redis-cli --latency', 'métricas do APM'],
    steps: r([
      '`redis-cli INFO stats`: hit ratio = `keyspace_hits ÷ (keyspace_hits + keyspace_misses)`; `evicted_keys` mostra o que saiu por falta de memória.',
      '`redis-cli --latency` mede a latência do Redis em tempo real.',
      'Em pico, conte quantas queries iguais vão ao banco quando uma chave popular expira. Mais de uma = stampede.',
      'No lab: 50 queries sem single-flight, 1 com.',
    ], [
      '`redis-cli INFO stats`: hit ratio = `keyspace_hits ÷ (keyspace_hits + keyspace_misses)`; `evicted_keys` shows what was dropped for lack of memory.',
      '`redis-cli --latency` measures Redis latency in real time.',
      'At peak, count how many identical queries hit the database when a popular key expires. More than one = stampede.',
      'In the lab: 50 queries without single-flight, 1 with it.',
    ]),
    say: r('"Acompanho hit ratio e evictions pelo INFO stats do Redis e conto queries ao banco na expiração das chaves quentes; para stampede uso single-flight ou lock e TTL com jitter."',
      '"I track hit ratio and evictions through Redis INFO stats and count database queries when hot keys expire; for stampedes I use single-flight or a lock and TTL jitter."'),
    labs: ['cache-stampede'], questions: ['redis-cache-patterns'],
  },
  // ---------------- TEAM ----------------
  {
    id: 'dora', area: 'team', icon: '🚚',
    title: r('Entrega do time (DORA) e qualidade', 'Team delivery (DORA) and quality'),
    why: r('Em entrevista sênior perguntam como você sabe que o time melhorou, não só o código.', 'In senior interviews they ask how you know the team improved, not just the code.'),
    metrics: [
      { name: r('Frequência de deploy e lead time', 'Deploy frequency and lead time'), good: r('deploys pequenos e frequentes; horas do commit à produção', 'small, frequent deploys; hours from commit to production') },
      { name: r('Taxa de falha de mudança e tempo de recuperação', 'Change failure rate and time to restore'), good: r('baixa; minutos com rollback', 'low; minutes with rollback') },
      { name: r('Cobertura de testes nas regras críticas', 'Test coverage of critical rules'), good: r('as regras de dinheiro e permissão cobertas; o número sozinho não diz nada', 'money and permission rules covered; the number alone says nothing') },
    ],
    tools: ['GitHub/GitLab (PRs, Actions)', 'Jira', 'cobertura do Jest/Vitest/PHPUnit', 'SonarQube'],
    steps: r([
      'Lead time: do primeiro commit do PR até o deploy em produção (dá para tirar das datas do GitHub).',
      'Taxa de falha: deploys que geraram rollback, hotfix ou incidente ÷ total de deploys.',
      'Cobertura: `vitest --coverage`, `jest --coverage` ou `phpunit --coverage-html`; olhe as regras críticas, não só a porcentagem.',
      'Mostre a tendência (antes × depois de uma mudança de processo), não um número solto.',
    ], [
      'Lead time: from a PR\'s first commit to the production deploy (you can pull it from GitHub dates).',
      'Change failure rate: deploys that led to a rollback, hotfix, or incident ÷ total deploys.',
      'Coverage: `vitest --coverage`, `jest --coverage`, or `phpunit --coverage-html`; look at critical rules, not just the percentage.',
      'Show the trend (before × after a process change), not a single number.',
    ]),
    say: r('"Acompanho as quatro métricas DORA e uso a tendência para justificar mudanças de processo; cobertura de testes eu olho nas regras críticas, não como meta de porcentagem."',
      '"I track the four DORA metrics and use the trend to justify process changes; I look at test coverage on critical rules, not as a percentage target."'),
    labs: ['tdd'], questions: ['cicd-pipeline', 'test-pyramid-strategy', 'scrum-ceremonies-estimation'],
  },
];

/** Cards que falam de uma pergunta (para o link "Como medir" na resposta). */
export const cardsForQuestion = (qid) => cards.filter((c) => c.questions.includes(qid));
