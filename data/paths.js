// Trilhas por vaga: a ordem sugerida para estudar, do básico ao que mais cai.
// Cada parada junta história (😂), lab (▶), guia de medição (📏) e pergunta (❓) do mesmo assunto.
// Ids: story = id da história (lab-<id> para história de lab), lab, measure, q = pergunta.

const r = (pt, en) => ({ pt, en });
const S = (id) => ({ kind: 'story', id });
const Lb = (id) => ({ kind: 'lab', id });
const M = (id) => ({ kind: 'measure', id });
const Q = (...ids) => ids.map((id) => ({ kind: 'q', id }));
const stop = (title, ...items) => ({ title, items: items.flat() });

export const paths = {
  // Em foco: as duas trilhas em estudo agora aparecem primeiro e marcadas na página inicial.
  'desafio-carteira': {
    featured: true,
    why: r('Defesa de um desafio técnico de carteira digital (PHP 7.4 + Laravel 8 + MySQL 8) num code review: dinheiro, livro-razão, concorrência, banco, erros, sessão, datas, Docker e o que ficou de fora. Cada parada é uma pergunta que o avaliador faz sobre o próprio código.',
      'Defending a digital wallet take-home (PHP 7.4 + Laravel 8 + MySQL 8) in a code review: money, ledger, concurrency, database, errors, session, dates, Docker, and what was left out. Each stop is a question the reviewer asks about your own code.'),
    stops: [
      stop(r('Dinheiro: centavos, imutável, regra no domínio', 'Money: cents, immutable, rule in the domain'), S('php-comparison-money'), Q('wallet-money-bigint-decimal', 'php-comparison-money')),
      stop(r('Livro-razão e estorno (não soft delete)', 'Ledger and reversal (not soft delete)'), S('payments-card-lifecycle'), Q('wallet-ledger-reversal')),
      stop(r('Trava antes da idempotência', 'Lock before idempotency'), S('lab-idempotency'), Lb('idempotency'), S('lab-lost-update'), Lb('lost-update'), M('locks'), Q('wallet-lock-then-idempotency', 'api-idempotency', 'db-isolation-locks')),
      stop(r('Servidor cai no meio da transferência', 'Server crashes mid-transfer'), Q('wallet-crash-mid-transfer')),
      stop(r('Banco: privilégio mínimo e chaves estrangeiras', 'Database: least privilege and foreign keys'), Q('db-least-privilege-ledger')),
      stop(r('Erro de negócio × bug', 'Business error × bug'), Q('laravel-renderable-exceptions')),
      stop(r('Sessão e cookies', 'Session and cookies'), S('sec-owasp-web'), Q('web-session-cookie-flags', 'php-security-pdo-password')),
      stop(r('Datas em UTC', 'Dates in UTC'), Q('datetime-utc-timezones')),
      stop(r('Docker, CI e portabilidade', 'Docker, CI, and portability'), S('docker-php-dev-env'), Q('docker-uid-ci-portability', 'docker-php-dev-env')),
      stop(r('Arquitetura: actions, sem repositórios, SOLID honesto', 'Architecture: actions, no repositories, honest SOLID'), S('clean-architecture-php'), Q('laravel-actions-no-repositories', 'clean-architecture-php')),
      stop(r('Testes que provam a regra', 'Tests that prove the rule'), S('lab-tdd'), Lb('tdd'), Q('phpunit-tdd-service')),
      stop(r('Escopo, versão e o que ficou de fora', 'Scope, version, and what was left out'), Q('project-scope-tradeoffs')),
    ],
  },
  'backend-php-node': {
    featured: true,
    why: r('Backend sênior com PHP e Node.js em financeiro / back-office: pagamentos, webhooks, emissão fiscal, integrações, sustentação de sistemas críticos e modernização gradual de PHP para Node.js.',
      'Senior backend with PHP and Node.js in finance / back office: payments, webhooks, invoice issuing, integrations, keeping critical systems running, and gradual modernization from PHP to Node.js.'),
    stops: [
      stop(r('Webhook seguro e idempotente', 'Secure, idempotent webhooks'), S('lab-idempotency'), Lb('idempotency'), Q('webhook-idempotent-signature', 'api-idempotency')),
      stop(r('Idempotência × transação × exactly-once', 'Idempotency × transaction × exactly-once'), Q('idempotency-transaction-exactly-once')),
      stop(r('Estados de pedido, pagamento e nota', 'Order, payment, and invoice states'), Q('order-state-machine')),
      stop(r('Banco × serviço externo: o rollback não desfaz a cobrança', 'Database × external service: rollback does not undo the charge'), S('lab-outbox'), Lb('outbox'), Q('external-call-vs-db-transaction', 'mq-outbox-pattern')),
      stop(r('Emissão fiscal assíncrona: retry, backoff, DLQ', 'Async invoice issuing: retry, backoff, DLQ'), S('mq-rabbitmq-concepts'), M('queues'), Q('async-fiscal-emission-retry-dlq', 'mq-rabbitmq-concepts')),
      stop(r('Integração lenta: timeout e circuit breaker', 'Slow integration: timeout and circuit breaker'), S('lab-resilience'), Lb('resilience'), Q('arch-resilience-partial')),
      stop(r('Concorrência e locks', 'Concurrency and locks'), S('lab-lost-update'), Lb('lost-update'), M('locks'), Q('db-isolation-locks')),
      stop(r('Migrar de PHP para Node sem parar', 'Migrating PHP to Node without stopping'), Q('migration-php-to-node-strangler', 'arch-monolith-microservices', 'legacy-production-bug')),
      stop(r('Node: event loop, NestJS ou Express', 'Node: event loop, NestJS or Express'), S('lab-event-loop'), Lb('event-loop'), M('node-eventloop'), Q('js-event-loop', 'node-event-loop-blocking', 'nest-di-modules')),
      stop(r('Query lenta e índices', 'Slow queries and indexes'), S('db-indexes-explain'), M('slow-queries'), Q('db-indexes-explain')),
      stop(r('Desempenho com evidência: medir, otimizar, provar', 'Performance with evidence: measure, optimize, prove'), M('php-profile'), Q('perf-measure-before-optimize')),
      stop(r('Arquivos grandes em stream (PHP e Node)', 'Large files as streams (PHP and Node)'), S('node-streams-backpressure'), Q('php-streaming-large-files', 'node-streams-backpressure')),
      stop(r('Erros com significado: exceções e assert', 'Meaningful errors: exceptions and assert'), Q('php-exceptions-assertions')),
      stop(r('Tipagem estrita e análise estática', 'Strict typing and static analysis'), Q('php-static-analysis-strict')),
      stop(r('Testar parser e script de linha de comando', 'Testing parsers and command-line scripts'), Q('testing-parsers-cli-boundaries')),
      stop(r('Segurança: URL vinda do cliente (SSRF)', 'Security: client-provided URLs (SSRF)'), Q('node-ssrf-user-url')),
      stop(r('Dados de produção fora de produção (LGPD)', 'Production data outside production (LGPD)'), Q('data-anonymization-non-prod')),
      stop(r('Métricas de negócio e rastreio PHP → Node → fila', 'Business metrics and tracing PHP → Node → queue'), S('obs-three-pillars'), M('red'), Q('finance-business-metrics-tracing', 'otel-node-instrumentation', 'obs-three-pillars')),
    ],
  },
  'php-fintech': {
    why: r('Full Stack pleno PHP em pagamentos: PHP 7.4+, CodeIgniter 3 e Laravel, SQL Server/MySQL/PostgreSQL, Docker, Git e, como diferencial, Clean Architecture, DDD, TDD, Kubernetes e GCP. Em empresa de cartão, dinheiro, limite e fatura aparecem em tudo.',
      'Mid-level PHP Full Stack in payments: PHP 7.4+, CodeIgniter 3 and Laravel, SQL Server/MySQL/PostgreSQL, Docker, Git, and, as differentiators, Clean Architecture, DDD, TDD, Kubernetes, and GCP. At a card company, money, limits, and statements show up everywhere.'),
    stops: [
      stop(r('Orientação a objetos em PHP', 'Object-oriented PHP'), S('php-oop-abstract-interface-trait'), Q('php-oop-abstract-interface-trait', 'php-7-to-8-features')),
      stop(r('Dinheiro sem centavo sumindo', 'Money without vanishing cents'), S('php-comparison-money'), Q('php-comparison-money')),
      stop(r('Como o Laravel atende uma requisição (e o CodeIgniter)', 'How Laravel handles a request (and CodeIgniter)'), S('laravel-request-lifecycle'), Q('laravel-request-lifecycle', 'codeigniter3-architecture')),
      stop(r('Pagamento sem cobrar duas vezes', 'Payments without double charging'), S('lab-idempotency'), Lb('idempotency'), Q('api-idempotency', 'laravel-queues-payments')),
      stop(r('Ciclo de vida do cartão: autorização, captura, estorno, fatura', 'Card lifecycle: authorization, capture, refund, statement'), S('payments-card-lifecycle'), Q('payments-card-lifecycle')),
      stop(r('SQL nos três bancos e índices', 'SQL across three databases and indexes'), S('db-indexes-explain'), M('slow-queries'), Q('sql-three-databases', 'sql-live-query-faturas', 'db-indexes-explain')),
      stop(r('Duas transações ao mesmo tempo (locks)', 'Two transactions at once (locks)'), S('lab-lost-update'), Lb('lost-update'), M('locks'), Q('db-isolation-locks')),
      stop(r('Segurança: PDO, senhas, OWASP', 'Security: PDO, passwords, OWASP'), S('sec-owasp-web'), Q('php-security-pdo-password', 'sec-owasp-web')),
      stop(r('Docker para PHP', 'Docker for PHP'), S('docker-php-dev-env'), Q('docker-php-dev-env')),
      stop(r('Git no dia a dia', 'Git day to day'), S('git-workflow-conflicts'), Q('git-workflow-conflicts')),
      stop(r('Bug em produção no legado', 'A production bug in legacy code'), M('php-profile'), M('n-plus-one'), Q('legacy-production-bug')),
      stop(r('Clean Architecture, SOLID e DDD (diferencial)', 'Clean Architecture, SOLID, and DDD (differentiator)'), S('clean-architecture-php'), S('solid-all-five'), S('ddd-core-concepts'), Q('clean-architecture-php', 'solid-all-five', 'ddd-core-concepts')),
      stop(r('TDD com PHPUnit (diferencial)', 'TDD with PHPUnit (differentiator)'), S('lab-tdd'), Lb('tdd'), Q('phpunit-tdd-service', 'test-tdd-code')),
      stop(r('Java básico para quem vem do PHP', 'Basic Java for PHP developers'), Q('java-basics-for-php-dev')),
      stop(r('Kubernetes e GCP (diferencial)', 'Kubernetes and GCP (differentiator)'), S('k8s-core-concepts'), Q('k8s-core-concepts', 'gcp-services-map')),
      stop(r('Conversa com RH e gestor', 'HR and manager conversation'), Q('behavioral-company-fit', 'behavioral-incident-star')),
    ],
  },
  'sr-observability': {
    why: r('Sênior Full Stack em Observabilidade: Node, React, Elasticsearch e sinais (logs, métricas, traces). Relatos públicos de vagas assim falam de problemas fáceis estilo LeetCode, concorrência, system design, code review ao vivo e uma comportamental séria.',
      'Senior Full Stack in Observability: Node, React, Elasticsearch, and signals (logs, metrics, traces). Public reports for roles like this mention easy LeetCode-style problems, concurrency, system design, live code review, and a serious behavioral round.'),
    stops: [
      stop(r('Event loop e Node travado', 'The event loop and a blocked Node'), S('lab-event-loop'), Lb('event-loop'), S('node-event-loop-blocking'), M('node-eventloop'), Q('js-event-loop', 'node-event-loop-blocking')),
      stop(r('Os três sinais: logs, métricas, traces', 'The three signals: logs, metrics, traces'), S('obs-three-pillars'), M('red'), Q('obs-three-pillars', 'otel-node-instrumentation')),
      stop(r('SLO e alertas', 'SLOs and alerts'), S('obs-slo-alerting'), M('slo'), Q('obs-slo-alerting', 'obs-alerting-design')),
      stop(r('Elasticsearch por dentro', 'Elasticsearch internals'), Q('elasticsearch-fundamentals')),
      stop(r('System design: ingestão de logs', 'System design: log ingestion'), Q('arch-system-design-logs')),
      stop(r('Algoritmo: top-K', 'Algorithm: top-K'), Q('algo-top-k-frequent', 'algo-classic-hackerrank')),
      stop(r('Front de observabilidade (React, performance)', 'Observability front end (React, performance)'), S('lab-react-rerenders'), Lb('react-rerenders'), M('react-rerenders'), M('inp'), Q('react-performance-memo', 'obs-frontend-reactflow')),
      stop(r('Streams e shutdown no Node', 'Streams and shutdown in Node'), S('node-streams-backpressure'), S('node-error-handling-shutdown'), Q('node-streams-backpressure', 'node-error-handling-shutdown')),
      stop(r('Code review ao vivo', 'Live code review'), Q('clean-code-review')),
      stop(r('Comportamental: incidente, projeto, trabalho remoto', 'Behavioral: incident, project, remote work'), Q('behavioral-incident-star', 'behavioral-proud-project-deepdive', 'behavioral-remote-async')),
    ],
  },
  'sr-node-react': {
    why: r('Sênior Full Stack Node/React. Os relatos citam teste no HackerRank e entrevista técnica com event loop, race conditions, RabbitMQ × Kafka, sistemas distribuídos e live coding.',
      'Senior Full Stack Node/React. Reports mention a HackerRank test and a technical interview covering the event loop, race conditions, RabbitMQ × Kafka, distributed systems, and live coding.'),
    stops: [
      stop(r('Event loop', 'The event loop'), S('lab-event-loop'), Lb('event-loop'), Q('js-event-loop', 'node-event-loop-blocking')),
      stop(r('this, closure e debounce', 'this, closures, and debounce'), S('lab-debounce'), Lb('debounce'), Q('js-closures-this')),
      stop(r('Race conditions e locks', 'Race conditions and locks'), S('lab-lost-update'), Lb('lost-update'), Q('db-isolation-locks')),
      stop(r('RabbitMQ × Kafka e outbox', 'RabbitMQ × Kafka and the outbox'), S('mq-rabbitmq-concepts'), S('lab-outbox'), Lb('outbox'), M('queues'), Q('mq-rabbitmq-concepts', 'mq-outbox-pattern', 'nest-microservices-rabbitmq')),
      stop(r('Idempotência e resiliência', 'Idempotency and resilience'), S('lab-idempotency'), Lb('idempotency'), S('lab-resilience'), Lb('resilience'), Q('api-idempotency', 'arch-resilience-partial')),
      stop(r('NestJS', 'NestJS'), S('nest-di-modules'), Q('nest-di-modules', 'nest-guard-decorator-test')),
      stop(r('React: estado e efeitos', 'React: state and effects'), S('react-state-management'), S('lab-react-effect-race'), Lb('react-effect-race'), Q('react-state-management', 'react-useeffect-pitfalls')),
      stop(r('Microsserviços', 'Microservices'), S('arch-monolith-microservices'), Q('arch-monolith-microservices')),
      stop(r('Teste no HackerRank', 'HackerRank test'), Q('algo-classic-hackerrank', 'algo-top-k-frequent')),
    ],
  },
  frontend: {
    why: r('Sênior React: re-renders, estado, efeitos, Next.js, testes, acessibilidade e performance medida de verdade.',
      'Senior React: re-renders, state, effects, Next.js, testing, accessibility, and performance that is actually measured.'),
    stops: [
      stop(r('Keys e reconciliação', 'Keys and reconciliation'), S('lab-react-keys'), Lb('react-keys'), Q('react-reconciliation-keys')),
      stop(r('useEffect sem bug', 'useEffect without bugs'), S('lab-react-effect-race'), Lb('react-effect-race'), Q('react-useeffect-pitfalls', 'react-derived-state-antipatterns')),
      stop(r('Re-renders e React DevTools', 'Re-renders and React DevTools'), S('lab-react-rerenders'), Lb('react-rerenders'), M('react-rerenders'), Q('react-performance-memo', 'react-devtools-debugging')),
      stop(r('Estado: Context, Zustand, Redux, TanStack Query', 'State: Context, Zustand, Redux, TanStack Query'), S('react-state-management'), S('lab-mini-zustand'), Lb('mini-zustand'), Q('react-state-management', 'react-redux-zustand-code', 'react-usereducer-context')),
      stop(r('Interações e carregamento (INP, LCP)', 'Interactions and loading (INP, LCP)'), M('inp'), M('load'), M('network-front'), Q('mui-theming-performance')),
      stop(r('Next.js: SSR, SSG, Server Components', 'Next.js: SSR, SSG, Server Components'), S('next-rendering-strategies'), Q('next-rendering-strategies', 'next-server-actions-security')),
      stop(r('TypeScript', 'TypeScript'), S('ts-unknown-any-never'), Q('ts-unknown-any-never', 'ts-generics-utility')),
      stop(r('Testes e acessibilidade', 'Testing and accessibility'), Q('rtl-msw-component-test', 'react-accessibility')),
      stop(r('Segurança no front (XSS)', 'Front-end security (XSS)'), S('lab-xss'), Lb('xss'), Q('sec-owasp-web')),
    ],
  },
  consulting: {
    why: r('Consultoria internacional: RH (motivo para se mudar, valores, inglês), teste técnico de 1 hora na sua linguagem, especialista e depois o cliente.',
      'An international consultancy: HR (reasons for relocating, values, English), a 1-hour technical test in your language, a specialist, and then the client.'),
    stops: [
      stop(r('Por que se mudar e como é a consultoria', 'Why relocate and how consulting works'), Q('behavioral-relocation-consultancy')),
      stop(r('Teste técnico de 1 hora', 'The 1-hour technical test'), Q('algo-classic-hackerrank')),
      stop(r('JavaScript que sempre cai', 'JavaScript that always comes up'), S('lab-event-loop'), Lb('event-loop'), Q('js-event-loop', 'js-closures-this')),
      stop(r('React: hooks e estado', 'React: hooks and state'), S('react-state-management'), Q('react-hooks-catalog', 'react-state-management', 'react-useeffect-pitfalls')),
      stop(r('Boas práticas', 'Good practices'), S('solid-all-five'), Q('solid-all-five', 'clean-code-review')),
      stop(r('Time e processo', 'Team and process'), Q('scrum-ceremonies-estimation', 'behavioral-technical-disagreement', 'behavioral-incident-star')),
    ],
  },
};
