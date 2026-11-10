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
];
