export default [
  {
    id: 'arch-monolith-microservices',
    cat: 'architecture', type: 'architecture', jobs: ['brainrocket', 'elastic'],
    tags: ['microservices', 'modular monolith', 'bounded context', 'distributed systems', 'saga'],
    q: {
      pt: 'Monolito ou microsserviços? Você já quebrou um sistema em serviços? Quais os custos que ninguém conta?',
      en: 'Monolith or microservices? Have you split a system into services? What are the costs nobody mentions?',
    },
    a: {
      pt: `Microsserviços resolvem um **problema organizacional**: times independentes que precisam fazer deploy e escalar partes do sistema sem coordenação. Não são uma melhoria técnica por si só.

Custos que ninguém conta: rede pode falhar e é lenta (timeouts, retries, circuit breakers), **consistência eventual** em vez de transação ACID (sagas com compensação), observabilidade distribuída obrigatória (tracing), contratos versionados entre serviços, dados duplicados, testes de integração mais difíceis, mais infraestrutura (K8s, service discovery, CI por serviço) e o risco do **monolito distribuído**: serviços que precisam subir juntos e conversam de forma síncrona em cadeia.

Minha posição padrão: começar com um **monolito modular**, com fronteiras de domínio claras (módulos que não acessam tabelas uns dos outros, comunicação por interfaces ou eventos internos). Extrair um serviço quando houver motivo concreto: escala muito diferente, time dono, ciclo de deploy diferente ou isolamento de falha. A extração usa o **Strangler Fig**: rotear gradualmente as chamadas para o novo serviço enquanto o legado continua funcionando.

Sinais de fronteira certa: o serviço tem seus próprios dados, pode ficar fora do ar sem derrubar os outros e muda por um motivo de negócio só.`,
      en: `Microservices solve an **organizational problem**: independent teams that need to deploy and scale parts of the system without coordinating. They are not a technical upgrade on their own.

Costs nobody mentions: the network fails and is slow (timeouts, retries, circuit breakers), **eventual consistency** instead of ACID transactions (sagas with compensation), mandatory distributed observability (tracing), versioned contracts between services, duplicated data, harder integration tests, more infrastructure (K8s, service discovery, per-service CI), and the risk of a **distributed monolith**: services that must deploy together and call each other synchronously in chains.

My default: start with a **modular monolith** with clear domain boundaries (modules that do not touch each other's tables and talk through interfaces or internal events). Extract a service when there is a concrete reason: very different scaling needs, an owning team, a different deploy cadence, or fault isolation. Extraction follows the **Strangler Fig**: gradually route calls to the new service while the legacy keeps running.

Signs of the right boundary: the service owns its data, can be down without taking others with it, and changes for a single business reason.`,
    },
    follow: [
      { pt: 'Saga orquestrada ou coreografada? Quais os trade-offs?', en: 'Orchestrated or choreographed saga? What are the trade-offs?' },
      { pt: 'Como você faria um relatório que precisa de dados de 4 serviços?', en: 'How would you build a report that needs data from 4 services?' },
    ],
    flags: {
      pt: '"Microsserviços são sempre melhores porque escalam." Ou dizer que "migrou para microsserviços" quando eram só duas APIs separadas compartilhando o mesmo banco.',
      en: '"Microservices are always better because they scale." Or claiming you "migrated to microservices" when it was two APIs sharing one database.',
    },
    anchor: {
      pt: 'Sua vivência real é integrar sistemas distintos (ERP, Salesforce, e-commerce, gestão de filiais) e modernizar legado em produção. Isso é arquitetura distribuída de verdade: contratos, falhas de rede, consistência entre sistemas. O GEMP (provedores em paralelo com timeout e resposta parcial) mostra resiliência entre serviços.',
      en: 'Your real experience is integrating separate systems (ERP, Salesforce, e-commerce, branch management) and modernizing legacy in production. That is real distributed architecture: contracts, network failures, cross-system consistency. GEMP (parallel providers with timeouts and partial responses) shows resilience between services.',
    },
  },
  {
    id: 'arch-resilience-partial',
    cat: 'architecture', type: 'architecture', jobs: ['elastic', 'brainrocket', 'cv'],
    tags: ['timeout', 'retry', 'circuit breaker', 'bulkhead', 'graceful degradation', 'fan-out'],
    q: {
      pt: 'Sua API agrega dados de três provedores externos. Um deles às vezes leva 30 segundos. Como você desenha isso?',
      en: 'Your API aggregates data from three external providers. One sometimes takes 30 seconds. How do you design it?',
    },
    a: {
      pt: `Princípio: **um dependente lento não pode derrubar o todo**.

- **Chamadas em paralelo** com **timeout por provedor** (ex.: 250 ms a 2 s, conforme o SLO), não um timeout global que espera o mais lento.
- **Degradação graciosa**: devolver o que chegou a tempo com status parcial e indicar quem falhou, em vez de erro total. Só retornar 503 quando nada útil chegou.
- **Retry** apenas para erros transitórios e operações idempotentes, com backoff exponencial + jitter e orçamento de retries (retry sem limite amplifica incidentes).
- **Circuit breaker**: após N falhas, para de chamar o provedor por um tempo e responde rápido; depois testa em half-open.
- **Bulkhead**: limitar conexões/concorrência por provedor para um não consumir todo o pool.
- **Propagar cancelamento**: se o cliente desistiu, cancelar as chamadas a jusante.
- Cache do último resultado bom quando a regra permitir, e **métricas por provedor** (latência p95/p99, taxa de erro, estado do breaker).

No front, a UI precisa representar esses estados: carregando, parcial, indisponível, falha de rede.`,
      en: `Principle: **one slow dependency must not take everything down**.

- **Parallel calls** with a **per-provider timeout** (e.g. 250 ms to 2 s, depending on the SLO), not a global timeout that waits for the slowest.
- **Graceful degradation**: return what arrived in time with a partial status and say who failed, instead of a total error. Only return 503 when nothing useful arrived.
- **Retry** only transient errors and idempotent operations, with exponential backoff + jitter and a retry budget (unbounded retries amplify incidents).
- **Circuit breaker**: after N failures, stop calling the provider for a while and fail fast; then probe in half-open.
- **Bulkhead**: cap connections/concurrency per provider so one cannot exhaust the pool.
- **Propagate cancellation**: if the client gave up, cancel downstream calls.
- Cache the last good result when business rules allow, and **per-provider metrics** (p95/p99 latency, error rate, breaker state).

On the frontend, the UI must represent these states: loading, partial, unavailable, network failure.`,
    },
    follow: [
      { pt: 'Como você escolhe o valor do timeout?', en: 'How do you choose the timeout value?' },
      { pt: 'Como testar esse comportamento de forma automatizada?', en: 'How do you test this behavior automatically?' },
    ],
    flags: {
      pt: '"Aumento o timeout para 60 segundos." Ou retry infinito.',
      en: '"I raise the timeout to 60 seconds." Or infinite retries.',
    },
    anchor: {
      pt: 'Esta pergunta descreve o GEMP: três provedores em paralelo, goroutine com context.Context e prazo de 250 ms, resposta parcial indicando quem falhou, 503 sem ofertas, UI com os quatro estados e testes com race detector no CI. Conte com os números.',
      en: 'This question describes GEMP: three providers in parallel, goroutines with context.Context and a 250 ms deadline, partial responses naming who failed, 503 with no offers, a UI with all four states, and race-detector tests in CI. Tell it with the numbers.',
    },
  },
  {
    id: 'arch-system-design-logs',
    cat: 'architecture', type: 'architecture', jobs: ['elastic'],
    tags: ['system design', 'log ingestion', 'Elasticsearch', 'backpressure', 'retention', 'Kibana'],
    q: {
      pt: 'System design: desenhe um sistema que recebe logs de 10 mil serviços e permite buscar e visualizar em tempo quase real (pense num Kibana simplificado).',
      en: 'System design: design a system that ingests logs from 10,000 services and lets users search and visualize them in near real time (think of a simplified Kibana).',
    },
    a: {
      pt: `Comece **clarificando requisitos**: volume (ex.: 1 milhão de eventos/s, ~1 KB cada), retenção (7 dias quente, 90 frio), latência de busca aceitável, consistência (log pode chegar alguns segundos atrasado), multi-tenant?

Componentes:

1. **Coleta**: agentes nos hosts (Elastic Agent/Filebeat, OpenTelemetry Collector) com buffer local e retry, para não perder log quando o backend está lento.
2. **Ingestão**: endpoints sem estado atrás de load balancer, que validam, aplicam rate limit por tenant e escrevem num **buffer durável** (Kafka). O buffer absorve picos e desacopla a escrita da indexação (backpressure).
3. **Processamento**: consumidores fazem parse, enriquecem (host, serviço, trace ID), normalizam o schema (ECS) e escrevem em lote.
4. **Armazenamento/índice**: Elasticsearch com índices por tempo (data streams), shards dimensionados, **ILM** movendo dados de hot → warm → cold/frozen e apagando no fim da retenção. Controle de cardinalidade de campos (mapping explosion).
5. **Consulta/UI**: API de busca com paginação por \`search_after\`, agregações para histogramas, timeouts e limites de consulta por tenant; front em React com virtualização, streaming de resultados e filtros na URL.

Pontos sênior: estimar armazenamento (1M/s × 1 KB × 86.400 s ≈ 86 TB/dia brutos, antes de compressão e réplicas, o que força amostragem ou tiers), isolar tenants barulhentos, observar o próprio pipeline (lag do Kafka, taxa de rejeição de indexação) e garantir compatibilidade retroativa ao mudar o schema.`,
      en: `Start by **clarifying requirements**: volume (e.g. 1 million events/s, ~1 KB each), retention (7 days hot, 90 cold), acceptable search latency, consistency (logs may arrive a few seconds late), multi-tenant?

Components:

1. **Collection**: host agents (Elastic Agent/Filebeat, OpenTelemetry Collector) with local buffering and retries so logs are not lost when the backend is slow.
2. **Ingestion**: stateless endpoints behind a load balancer that validate, rate-limit per tenant, and write to a **durable buffer** (Kafka). The buffer absorbs spikes and decouples writes from indexing (backpressure).
3. **Processing**: consumers parse, enrich (host, service, trace ID), normalize the schema (ECS), and write in bulk.
4. **Storage/index**: Elasticsearch with time-based indices (data streams), right-sized shards, **ILM** moving data hot → warm → cold/frozen and deleting at the end of retention. Field cardinality control (mapping explosion).
5. **Query/UI**: a search API with \`search_after\` pagination, aggregations for histograms, per-tenant timeouts and query limits; a React UI with virtualization, streamed results, and filters in the URL.

Senior points: estimate storage (1M/s × 1 KB × 86,400 s ≈ 86 TB/day raw, before compression and replicas, which forces sampling or tiering), isolate noisy tenants, observe the pipeline itself (Kafka lag, indexing rejection rate), and keep backward compatibility when the schema changes.`,
    },
    follow: [
      { pt: 'O que acontece se o Elasticsearch ficar lento por 10 minutos?', en: 'What happens if Elasticsearch slows down for 10 minutes?' },
      { pt: 'Como você evitaria que um tenant gere 100 mil campos diferentes no mapping?', en: 'How would you stop one tenant from creating 100,000 distinct mapping fields?' },
    ],
    flags: {
      pt: 'Começar desenhando caixas sem perguntar volume e requisitos. Ou ignorar o buffer entre ingestão e indexação.',
      en: 'Drawing boxes without asking about volume and requirements. Or skipping the buffer between ingestion and indexing.',
    },
    anchor: {
      pt: 'O MeterTrail tem a mesma espinha dorsal em miniatura: ingestão idempotente, projeção em lote para analytics, checkpoint e reprocessamento. Use-o para mostrar que você já pensou em ingestão, lote e reprocessamento, deixando claro que é um projeto pessoal.',
      en: 'MeterTrail has the same backbone in miniature: idempotent ingestion, batch projection to analytics, checkpointing, and replay. Use it to show you have thought about ingestion, batching, and replay, while being clear it is a personal project.',
    },
  },
  {
    id: 'arch-multitenancy',
    cat: 'architecture', type: 'architecture', jobs: ['brainrocket', 'cv'],
    tags: ['multi-tenancy', 'tenant isolation', 'row level security', 'SaaS'],
    q: {
      pt: 'Como você implementa multi-tenancy numa aplicação SaaS e garante que um cliente nunca veja dados de outro?',
      en: 'How do you implement multi-tenancy in a SaaS app and guarantee one customer never sees another\'s data?',
    },
    a: {
      pt: `Três modelos, com trade-offs de isolamento vs custo:

- **Banco por tenant**: isolamento máximo, backup e restore por cliente, mas caro e difícil de operar com milhares de tenants.
- **Schema por tenant**: meio-termo; migrações viram um problema em escala.
- **Tabelas compartilhadas com \`tenant_id\`**: mais barato e simples de escalar; o risco é um \`WHERE\` esquecido vazar dados.

Com tabelas compartilhadas, a segurança **não pode depender de lembrar o filtro**:

- Escopo global obrigatório no ORM (global scope no Eloquent, middleware no Prisma) a partir do tenant do usuário autenticado, nunca de um parâmetro do cliente.
- **Row Level Security** no PostgreSQL como defesa em profundidade.
- Índices começando por \`tenant_id\`.
- **Testes de isolamento** automatizados: criar dados de dois tenants e provar que um não acessa o outro em cada endpoint.
- Cuidar dos vazamentos indiretos: cache com chave sem tenant, jobs de fila sem contexto, logs, arquivos em storage, exports.
- Para "tenant barulhento": rate limit e cotas por tenant.`,
      en: `Three models, trading isolation for cost:

- **Database per tenant**: maximum isolation, per-customer backup and restore, but expensive and hard to operate with thousands of tenants.
- **Schema per tenant**: a middle ground; migrations become painful at scale.
- **Shared tables with \`tenant_id\`**: cheapest and simplest to scale; the risk is a forgotten \`WHERE\` leaking data.

With shared tables, safety **cannot depend on remembering the filter**:

- A mandatory global scope in the ORM (Eloquent global scope, Prisma middleware) derived from the authenticated user's tenant, never from a client parameter.
- PostgreSQL **Row Level Security** as defense in depth.
- Indexes starting with \`tenant_id\`.
- Automated **isolation tests**: create data for two tenants and prove neither can reach the other's on every endpoint.
- Watch indirect leaks: cache keys without the tenant, queue jobs without context, logs, files in storage, exports.
- For noisy tenants: per-tenant rate limits and quotas.`,
    },
    follow: [
      { pt: 'Como RLS do PostgreSQL funciona com connection pool?', en: 'How does PostgreSQL RLS work with a connection pool?' },
      { pt: 'Um cliente grande pede banco exclusivo. Como você suporta os dois modelos?', en: 'A big customer asks for a dedicated database. How do you support both models?' },
    ],
    flags: {
      pt: 'Pegar o `tenant_id` do body ou da query string. Ou "o desenvolvedor lembra de filtrar".',
      en: 'Reading `tenant_id` from the body or query string. Or "developers remember to filter".',
    },
    anchor: {
      pt: 'Duas evidências reais: TripFlow tem escopo por empresa e testes de isolamento verificando a fronteira entre clientes; o Bora usa Supabase Auth com políticas no PostgreSQL (RLS) dando acesso conforme o vínculo no órgão, com testes de políticas. Excelente resposta.',
      en: 'Two real pieces of evidence: TripFlow has company-level scoping and isolation tests on the tenant boundary; Bora uses Supabase Auth with PostgreSQL policies (RLS) scoped by department membership, with policy tests. Excellent answer.',
    },
  },
];
