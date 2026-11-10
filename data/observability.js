export default [
  {
    id: 'obs-three-pillars',
    cat: 'observability', type: 'concept', jobs: ['elastic', 'brainrocket'],
    tags: ['observability', 'logs', 'metrics', 'traces', 'OpenTelemetry', 'correlation', 'ECS'],
    q: {
      pt: 'O que é observabilidade e como ela difere de monitoramento? Como logs, métricas e traces se complementam?',
      en: 'What is observability and how does it differ from monitoring? How do logs, metrics, and traces complement each other?',
    },
    a: {
      pt: `**Monitoramento** responde perguntas que você já sabia que ia fazer ("a CPU passou de 80%?"). **Observabilidade** é a capacidade de entender o estado interno do sistema a partir dos dados que ele emite, inclusive para perguntas novas, durante um incidente que nunca aconteceu antes.

- **Métricas**: números agregados no tempo (taxa de requisições, erros, latência p50/p95/p99, saturação). Baratas, ótimas para alertas e dashboards. Cuidado com **cardinalidade**: label com \`user_id\` explode o armazenamento.
- **Logs**: eventos discretos com contexto. Devem ser **estruturados** (JSON, campos padronizados como o ECS da Elastic), com nível, \`trace.id\`, \`service.name\`, sem dados sensíveis.
- **Traces**: o caminho de uma requisição entre serviços, com spans e tempos. Mostram onde está a latência e onde a falha começou.

Elas se complementam pela **correlação**: o alerta de métrica (taxa de erro subiu) leva ao trace de uma requisição lenta, que leva aos logs daquele \`trace.id\`. **OpenTelemetry** é o padrão aberto para instrumentar uma vez e enviar para qualquer backend (Elastic, Grafana, Datadog), com propagação de contexto pelo header \`traceparent\` (W3C).

Frameworks úteis: **RED** para serviços (Rate, Errors, Duration), **USE** para recursos (Utilization, Saturation, Errors) e os quatro *golden signals* do Google SRE.`,
      en: `**Monitoring** answers questions you knew you would ask ("did CPU pass 80%?"). **Observability** is the ability to understand a system's internal state from the data it emits, including for new questions, during an incident that has never happened before.

- **Metrics**: numbers aggregated over time (request rate, errors, p50/p95/p99 latency, saturation). Cheap, great for alerts and dashboards. Beware **cardinality**: a \`user_id\` label explodes storage.
- **Logs**: discrete events with context. They should be **structured** (JSON, standardized fields like Elastic's ECS), with level, \`trace.id\`, \`service.name\`, and no sensitive data.
- **Traces**: a request's path across services, with spans and timings. They show where latency lives and where a failure began.

They complement each other through **correlation**: a metric alert (error rate went up) leads to the trace of a slow request, which leads to the logs for that \`trace.id\`. **OpenTelemetry** is the open standard to instrument once and ship to any backend (Elastic, Grafana, Datadog), propagating context through the W3C \`traceparent\` header.

Useful frameworks: **RED** for services (Rate, Errors, Duration), **USE** for resources (Utilization, Saturation, Errors), and Google SRE's four golden signals.`,
    },
    follow: [
      { pt: 'Por que média de latência é uma métrica ruim?', en: 'Why is average latency a bad metric?' },
      { pt: 'O que é sampling de traces e quais os riscos de head sampling?', en: 'What is trace sampling and what are the risks of head sampling?' },
    ],
    flags: {
      pt: '"Observabilidade é ter o Grafana com uns gráficos." Ou logs com `console.log("aqui")`.',
      en: '"Observability means having Grafana with a few charts." Or logging `console.log("here")`.',
    },
    anchor: {
      pt: 'Seu dia a dia de sustentação em produção e investigação de incidentes (Mysa, Sicoob, Easy Process) é consumo de observabilidade. Elastic Stack/Kibana não aparecem no CV: diga que é um diferencial que você está estudando, e mostre que entende os conceitos. Um projeto seu instrumentado com OpenTelemetry fecharia muito bem essa lacuna.',
      en: 'Your daily production support and incident investigation (Mysa, Sicoob, Easy Process) is consuming observability. Elastic Stack/Kibana is not on your CV: say it is a nice-to-have you are studying, and show you understand the concepts. One of your projects instrumented with OpenTelemetry would close that gap well.',
    },
  },
  {
    id: 'obs-slo-alerting',
    cat: 'observability', type: 'concept', jobs: ['elastic'],
    tags: ['SLI', 'SLO', 'SLA', 'error budget', 'alerting', 'percentiles', 'burn rate'],
    q: {
      pt: 'Explique SLI, SLO, SLA e error budget. Como você decide o que merece alerta que acorda alguém de madrugada?',
      en: 'Explain SLI, SLO, SLA, and error budget. How do you decide what deserves an alert that wakes someone up at night?',
    },
    a: {
      pt: `- **SLI** (indicador): uma medida da experiência do usuário. Ex.: proporção de requisições com status < 500 e latência < 300 ms.
- **SLO** (objetivo): a meta interna para o SLI numa janela. Ex.: 99,9% em 30 dias.
- **SLA** (acordo): o compromisso contratual com o cliente, com penalidade. Fica abaixo do SLO para ter margem.
- **Error budget**: o quanto pode falhar dentro do SLO. 99,9% em 30 dias ≈ 43 minutos. Com orçamento sobrando, o time pode arriscar e entregar rápido; esgotado, prioriza confiabilidade.

**Alertas**: alertar sobre **sintomas que afetam usuários**, não sobre causas (CPU alta sem impacto não acorda ninguém). Usar **burn rate**: alertar quando o error budget está sendo consumido rápido demais, com janelas múltiplas (ex.: 1 h e 5 min) para reduzir falso positivo. Todo alerta de plantão deve ser **acionável** e ter runbook; o resto vira ticket ou dashboard. Fadiga de alerta faz o time ignorar o alerta que importa.

Percentis: p99 mostra a cauda que a média esconde. Um p50 ótimo com p99 de 8 s significa que 1 em cada 100 usuários está tendo uma experiência péssima, e numa página com 50 chamadas quase todo mundo é afetado.`,
      en: `- **SLI** (indicator): a measure of user experience. E.g. the share of requests with status < 500 and latency < 300 ms.
- **SLO** (objective): the internal target for the SLI over a window. E.g. 99.9% over 30 days.
- **SLA** (agreement): the contractual commitment to customers, with penalties. Set below the SLO to keep a margin.
- **Error budget**: how much failure the SLO allows. 99.9% over 30 days ≈ 43 minutes. With budget left, the team can take risks and ship fast; once exhausted, reliability comes first.

**Alerting**: alert on **symptoms that hurt users**, not causes (high CPU with no impact wakes nobody). Use **burn rate**: alert when the error budget is being consumed too fast, with multiple windows (e.g. 1 h and 5 min) to cut false positives. Every paging alert must be **actionable** and have a runbook; everything else becomes a ticket or a dashboard. Alert fatigue makes teams ignore the alert that matters.

Percentiles: p99 shows the tail the average hides. A great p50 with an 8 s p99 means 1 in 100 users has a terrible experience, and on a page making 50 calls almost everyone is affected.`,
    },
    follow: [
      { pt: 'Como você definiria o SLO de uma tela do Kibana que lista logs?', en: 'How would you define the SLO for a Kibana screen that lists logs?' },
      { pt: 'O que você faz quando o error budget acaba no meio do sprint?', en: 'What do you do when the error budget runs out mid-sprint?' },
    ],
    flags: {
      pt: 'Querer 100% de disponibilidade. Ou alertar por qualquer erro individual.',
      en: 'Wanting 100% availability. Or alerting on every single error.',
    },
    anchor: {
      pt: 'Seu princípio no portfólio, "consistência antes de velocidade", é o raciocínio do error budget aplicado a sistemas financeiros. Conte um incidente real em produção que você investigou: como soube, como diagnosticou, o que mudou depois.',
      en: 'Your portfolio principle "consistency before speed" is error-budget reasoning applied to financial systems. Tell a real production incident you investigated: how you found out, how you diagnosed it, what changed afterwards.',
    },
  },
  {
    id: 'obs-frontend-reactflow',
    cat: 'observability', type: 'lib', jobs: ['elastic', 'frontend'],
    tags: ['React Flow', 'graph UI', 'pipelines', 'Fleet', 'Streams', 'large graphs'],
    q: {
      pt: 'A vaga cita React Flow para Fleet e Streams. Como você construiria um editor visual de pipeline de processamento de logs? Que problemas aparecem com grafos grandes?',
      en: 'The role mentions React Flow for Fleet and Streams. How would you build a visual editor for a log-processing pipeline? What problems show up with large graphs?',
    },
    code: {
      src: `
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge } from '@xyflow/react';

const nodeTypes = { source: SourceNode, processor: ProcessorNode, destination: DestinationNode }; // fora do componente!

export function PipelineEditor({ initial }: { initial: Pipeline }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(toNodes(initial));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toEdges(initial));

  const onConnect = useCallback((c: Connection) => {
    if (createsCycle(edges, c)) return toast.error('A pipeline cannot loop back');
    setEdges((eds) => addEdge(c, eds));
  }, [edges, setEdges]);

  return (
    <ReactFlow
      nodes={nodes} edges={edges} nodeTypes={nodeTypes}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
      isValidConnection={(c) => portsCompatible(c, nodes)}
      onlyRenderVisibleElements
      fitView
    >
      <Background /><Controls />
    </ReactFlow>
  );
}`,
    },
    a: {
      pt: `**Modelagem**: o grafo visual é uma **visão** de um modelo de domínio (a pipeline: fontes, processadores, destinos). Mantenho o modelo como fonte da verdade, serializável e validado (sem ciclos, portas compatíveis, campos obrigatórios), e derivo nodes/edges dele. Isso facilita salvar, versionar, fazer diff e desfazer.

**React Flow**: nodes e edges controlados; \`nodeTypes\` customizados (definidos **fora** do componente, senão são recriados a cada render e os nós remontam); \`isValidConnection\` e validação de ciclos; layout automático com dagre/ELK para pipelines geradas; undo/redo guardando snapshots do modelo.

**Grafos grandes**: \`onlyRenderVisibleElements\`, memoizar os componentes de nó, evitar que cada nó assine o store inteiro (seletores do Zustand, que o próprio React Flow usa), throttling de atualizações durante o arraste, agrupar nós (subflows/colapsar) e mover layout pesado para Web Worker.

**Acessibilidade e UX**: navegação por teclado entre nós, alternativa em lista/YAML para quem não usa o canvas, mensagens de erro no próprio nó e preview dos dados de exemplo passando por cada etapa, que é o que torna o editor útil de verdade.`,
      en: `**Modeling**: the visual graph is a **view** of a domain model (the pipeline: sources, processors, destinations). I keep the model as the source of truth, serializable and validated (no cycles, compatible ports, required fields), and derive nodes/edges from it. That makes saving, versioning, diffing, and undo easier.

**React Flow**: controlled nodes and edges; custom \`nodeTypes\` (defined **outside** the component, otherwise they are recreated every render and nodes remount); \`isValidConnection\` and cycle validation; automatic layout with dagre/ELK for generated pipelines; undo/redo by snapshotting the model.

**Large graphs**: \`onlyRenderVisibleElements\`, memoized node components, avoiding every node subscribing to the whole store (Zustand selectors, which React Flow itself uses), throttling updates while dragging, grouping nodes (subflows/collapse), and moving heavy layout to a Web Worker.

**Accessibility and UX**: keyboard navigation between nodes, a list/YAML alternative for people who do not use the canvas, errors shown on the node itself, and a preview of sample data flowing through each step, which is what makes the editor genuinely useful.`,
    },
    follow: [
      { pt: 'Como você implementaria undo/redo nesse editor?', en: 'How would you implement undo/redo in this editor?' },
      { pt: 'Como testar um componente baseado em canvas?', en: 'How do you test a canvas-based component?' },
    ],
    flags: {
      pt: 'Tratar o estado do React Flow como fonte da verdade do negócio. Ou dizer que já usou React Flow se não usou.',
      en: 'Treating React Flow state as the business source of truth. Or claiming React Flow experience you do not have.',
    },
    anchor: {
      pt: 'React Flow não está no seu CV. O diagrama de arquitetura do Livit (TikTok LIVE → Python → painel/overlay → worker Node → extensão) mostra que você pensa em fluxos de eventos. Um mini editor de pipeline com React Flow no GitHub seria a melhor preparação para a Elastic.',
      en: 'React Flow is not on your CV. Livit\'s architecture diagram (TikTok LIVE → Python → panel/overlay → Node worker → extension) shows you think in event flows. A small React Flow pipeline editor on GitHub would be the best Elastic prep.',
    },
  },
  {
    id: 'elasticsearch-fundamentals',
    cat: 'observability', type: 'lib', jobs: ['elastic'],
    tags: ['Elasticsearch', 'inverted index', 'mapping', 'analyzer', 'query vs filter', 'shards', 'aggregations'],
    q: {
      pt: 'Como o Elasticsearch funciona por dentro? Explique índice invertido, mapping, `text` vs `keyword`, query vs filter context e shards.',
      en: 'How does Elasticsearch work internally? Explain the inverted index, mappings, `text` vs `keyword`, query vs filter context, and shards.',
    },
    code: {
      src: `
PUT logs-app-default/_mapping
{
  "properties": {
    "@timestamp":      { "type": "date" },
    "message":         { "type": "text" },                 // analisado: busca full-text
    "service.name":    { "type": "keyword" },              // exato: filtro, agregação, sort
    "http.status":     { "type": "short" },
    "trace.id":        { "type": "keyword" }
  }
}

GET logs-app-default/_search
{
  "size": 50,
  "sort": [{ "@timestamp": "desc" }],
  "query": {
    "bool": {
      "must":   [{ "match": { "message": "timeout provider" } }],   // query context: score
      "filter": [                                                   // filter context: sem score, cacheável
        { "term":  { "service.name": "trips-api" } },
        { "range": { "@timestamp": { "gte": "now-15m" } } }
      ]
    }
  },
  "aggs": {
    "per_minute": { "date_histogram": { "field": "@timestamp", "fixed_interval": "1m" } },
    "by_status":  { "terms": { "field": "http.status" } }
  }
}`,
    },
    a: {
      pt: `**Índice invertido**: para cada termo, a lista de documentos que o contêm (como o índice remissivo de um livro). Por isso busca textual em bilhões de documentos é rápida. Cada shard é um índice Lucene, formado por **segmentos imutáveis**; escritas criam segmentos novos, que ficam pesquisáveis após o **refresh** (1 s por padrão, daí o "near real time") e são fundidos depois (merge).

**Mapping** é o schema dos campos. \`text\` passa por um **analyzer** (tokenização, minúsculas, stemming) para busca full-text; \`keyword\` guarda o valor exato para filtro, ordenação e agregação (usando *doc values*, armazenamento colunar). Mapping dinâmico em dados de log pode causar **mapping explosion**: limitar campos e definir templates.

**Query vs filter context**: em \`must\`/\`should\` o Elasticsearch calcula **relevância** (BM25); em \`filter\`/\`must_not\` só responde sim/não, sem score, e o resultado pode ser cacheado. Para logs, quase tudo é filter (serviço, intervalo de tempo, status).

**Shards e réplicas**: o índice é dividido em shards primários espalhados pelos nós; réplicas dão disponibilidade e capacidade de leitura. O número de primários é fixo depois de criado (por isso índices por tempo, data streams e rollover). Shards demais e pequenos desperdiçam heap; a recomendação usual é dezenas de GB por shard.

**Agregações** (\`date_histogram\`, \`terms\`, percentis) são o que alimenta os gráficos do Kibana.`,
      en: `**Inverted index**: for each term, the list of documents containing it (like a book's index). That is why full-text search over billions of documents is fast. Each shard is a Lucene index made of **immutable segments**; writes create new segments that become searchable after a **refresh** (1 s by default, hence "near real time") and are merged later.

A **mapping** is the field schema. \`text\` runs through an **analyzer** (tokenization, lowercasing, stemming) for full-text search; \`keyword\` stores the exact value for filtering, sorting, and aggregations (using *doc values*, columnar storage). Dynamic mapping on log data can cause a **mapping explosion**: cap fields and define templates.

**Query vs filter context**: in \`must\`/\`should\` Elasticsearch computes **relevance** (BM25); in \`filter\`/\`must_not\` it only answers yes/no, with no score, and results can be cached. For logs, almost everything is a filter (service, time range, status).

**Shards and replicas**: an index is split into primary shards spread across nodes; replicas provide availability and read capacity. The primary count is fixed after creation (hence time-based indices, data streams, and rollover). Too many tiny shards waste heap; the usual guidance is tens of GB per shard.

**Aggregations** (\`date_histogram\`, \`terms\`, percentiles) are what power Kibana's charts.`,
    },
    follow: [
      { pt: 'Por que um documento indexado não aparece na busca imediatamente?', en: 'Why does a newly indexed document not show up in search immediately?' },
      { pt: 'Como você paginaria 1 milhão de resultados? (`search_after` + PIT)', en: 'How would you page through 1 million results? (`search_after` + PIT)' },
    ],
    flags: {
      pt: 'Usar `match` em campo que deveria ser `keyword` para filtrar. Ou tratar Elasticsearch como banco transacional principal.',
      en: 'Using `match` on a field that should be a `keyword` filter. Or treating Elasticsearch as the primary transactional database.',
    },
    anchor: {
      pt: 'Elastic Stack é o "nice to have" da vaga e não está no seu CV. O PulseOps (sua plataforma de observabilidade planejada) é o lugar perfeito para isso: logs da sua própria API indexados no Elasticsearch com mapping explícito. Até lá, diga que estudou e explique com segurança.',
      en: 'Elastic Stack is the role\'s nice-to-have and is not on your CV. PulseOps (your planned observability platform) is the perfect place for it: your own API\'s logs indexed in Elasticsearch with an explicit mapping. Until then, say you have studied it and explain it confidently.',
    },
  },
  {
    id: 'otel-node-instrumentation',
    cat: 'observability', type: 'code', jobs: ['elastic', 'brainrocket'],
    tags: ['OpenTelemetry', 'tracing', 'spans', 'context propagation', 'Node.js', 'structured logging'],
    q: {
      pt: 'Instrumente uma API Node com OpenTelemetry: traces automáticos, um span manual numa operação de negócio e logs correlacionados pelo trace ID.',
      en: 'Instrument a Node API with OpenTelemetry: automatic traces, a manual span on a business operation, and logs correlated by trace ID.',
    },
    code: {
      src: `
// instrumentation.ts — carregado ANTES da app: node --import ./dist/instrumentation.js dist/main.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

new NodeSDK({
  serviceName: 'trips-api',
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations()],  // http, express, pg, mysql, redis, amqplib…
}).start();

// approve-trip.ts — span manual com atributos de negócio
import { trace, SpanStatusCode } from '@opentelemetry/api';
const tracer = trace.getTracer('trips');

export async function approveTrip(tripId: string, user: User) {
  return tracer.startActiveSpan('trip.approve', async (span) => {
    span.setAttributes({ 'trip.id': tripId, 'company.id': user.companyId }); // nada de PII
    try {
      const result = await useCase.execute(tripId, user);
      span.setAttribute('trip.outcome', result.ok ? 'approved' : result.reason);
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}

// logger com trace.id em todo log (pino)
const logger = pino({
  mixin() {
    const ctx = trace.getActiveSpan()?.spanContext();
    return ctx ? { 'trace.id': ctx.traceId, 'span.id': ctx.spanId } : {};
  },
});`,
    },
    a: {
      pt: `**Três partes**:

1. **SDK + auto-instrumentação**, carregados antes de qualquer import da aplicação (\`--import\`/\`--require\`), porque a instrumentação funciona aplicando patches nos módulos (http, express, drivers de banco, redis, amqplib). Isso já gera spans de cada requisição HTTP, query e chamada externa.
2. **Spans manuais** nas operações de negócio, com atributos úteis para investigar (\`trip.id\`, resultado), \`recordException\` e status de erro. Sem dados pessoais nos atributos.
3. **Logs correlacionados**: injetar \`trace.id\`/\`span.id\` em cada log estruturado; no Kibana ou Grafana, do trace você pula para os logs daquela requisição.

**Propagação de contexto**: entre serviços HTTP, o header W3C \`traceparent\` é propagado automaticamente. Em filas, é preciso injetar o contexto nos headers da mensagem e extraí-lo no consumidor (a instrumentação do amqplib faz isso; em implementações próprias, \`propagation.inject\`/\`extract\`), senão o trace se parte em dois.

**Exportação**: OTLP para um **OpenTelemetry Collector**, que faz batch, sampling e envia para o backend (Elastic APM, Jaeger, Tempo). Assim trocar de fornecedor não exige mudar código. **Sampling**: head sampling (decide no início, barato) ou tail sampling no Collector (guarda todos os traces com erro ou lentos).`,
      en: `**Three parts**:

1. **SDK + auto-instrumentation**, loaded before any application import (\`--import\`/\`--require\`), because instrumentation works by patching modules (http, express, database drivers, redis, amqplib). That alone produces spans for every HTTP request, query, and outbound call.
2. **Manual spans** on business operations, with attributes useful for investigation (\`trip.id\`, outcome), \`recordException\`, and error status. No personal data in attributes.
3. **Correlated logs**: inject \`trace.id\`/\`span.id\` into every structured log; in Kibana or Grafana you jump from a trace to that request's logs.

**Context propagation**: between HTTP services the W3C \`traceparent\` header propagates automatically. With queues, you must inject the context into message headers and extract it in the consumer (amqplib instrumentation does this; in custom code, \`propagation.inject\`/\`extract\`), otherwise the trace splits in two.

**Export**: OTLP to an **OpenTelemetry Collector**, which batches, samples, and forwards to the backend (Elastic APM, Jaeger, Tempo). Switching vendors then needs no code change. **Sampling**: head sampling (decided up front, cheap) or tail sampling in the Collector (keep every trace with errors or high latency).`,
    },
    follow: [
      { pt: 'Que atributo NUNCA deveria ir num span? E numa métrica?', en: 'Which attribute should NEVER go on a span? And on a metric?' },
      { pt: 'Como você instrumentaria o front-end React para o trace começar no browser?', en: 'How would you instrument the React frontend so the trace starts in the browser?' },
    ],
    flags: {
      pt: 'Importar o SDK depois da aplicação (não instrumenta nada). Ou colocar `user.email` em atributo de span.',
      en: 'Importing the SDK after the app (nothing gets instrumented). Or putting `user.email` in a span attribute.',
    },
    anchor: {
      pt: 'Instrumentar o TripFlow ou o GEMP com OpenTelemetry (um trace atravessando API → MySQL → RabbitMQ → consumidor) é o projeto que mais aproxima seu portfólio da vaga da Elastic, e é o coração natural do PulseOps. Até existir, apresente como plano, não como experiência.',
      en: 'Instrumenting TripFlow or GEMP with OpenTelemetry (one trace crossing API → MySQL → RabbitMQ → consumer) is the project that brings your portfolio closest to the Elastic role, and it is the natural core of PulseOps. Until it exists, present it as a plan, not experience.',
    },
  },
];
