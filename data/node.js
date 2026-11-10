export default [
  {
    id: 'node-event-loop-blocking',
    cat: 'node', type: 'concept', jobs: ['elastic', 'brainrocket'],
    tags: ['event loop', 'libuv', 'worker threads', 'cluster', 'CPU bound', 'thread pool'],
    q: {
      pt: 'Node.js é single-thread. Então como ele aguenta milhares de conexões? E o que acontece quando um endpoint faz um cálculo pesado?',
      en: 'Node.js is single-threaded. So how does it handle thousands of connections? And what happens when an endpoint runs a heavy computation?',
    },
    a: {
      pt: `O **JavaScript** roda numa thread só, mas o Node não. A libuv delega I/O ao sistema operacional (epoll/kqueue) e mantém um **thread pool** (padrão de 4 threads) para o que o SO não faz de forma assíncrona: \`fs\`, \`crypto\`, \`zlib\`, DNS. Enquanto o I/O acontece, o event loop atende outras requisições. Por isso Node é ótimo para trabalho **I/O-bound** (APIs, proxies, WebSockets).

Fases do loop: timers → pending callbacks → poll (I/O) → check (\`setImmediate\`) → close. Entre cada callback rodam \`process.nextTick\` e depois as microtasks de Promise.

Um cálculo pesado (CPU-bound) **bloqueia o loop inteiro**: todas as outras requisições esperam, health checks falham e a latência p99 explode. Soluções:

- \`worker_threads\` para CPU dentro do processo (ou uma lib como Piscina).
- Tirar da requisição: fila (BullMQ/RabbitMQ) + worker separado.
- Escalar processos (cluster, PM2 ou réplicas no Kubernetes) para usar todos os núcleos.
- Evitar armadilhas síncronas: \`JSON.parse\` de payload gigante, regex catastrófica (ReDoS), \`fs.readFileSync\` em rota.

Para detectar: \`monitorEventLoopDelay\` do \`perf_hooks\`, clinic.js, ou a métrica de event loop delay no APM.`,
      en: `**JavaScript** runs on one thread, but Node does not. libuv hands I/O to the OS (epoll/kqueue) and keeps a **thread pool** (4 threads by default) for what the OS cannot do asynchronously: \`fs\`, \`crypto\`, \`zlib\`, DNS. While I/O is in flight, the event loop serves other requests. That is why Node is great for **I/O-bound** work (APIs, proxies, WebSockets).

Loop phases: timers → pending callbacks → poll (I/O) → check (\`setImmediate\`) → close. Between callbacks, \`process.nextTick\` runs first, then Promise microtasks.

A heavy (CPU-bound) computation **blocks the whole loop**: every other request waits, health checks fail, and p99 latency explodes. Fixes:

- \`worker_threads\` for CPU work in-process (or a library like Piscina).
- Take it out of the request: a queue (BullMQ/RabbitMQ) plus a separate worker.
- Scale processes (cluster, PM2, or Kubernetes replicas) to use every core.
- Avoid synchronous traps: \`JSON.parse\` on a huge payload, catastrophic regex (ReDoS), \`fs.readFileSync\` in a route.

To detect it: \`monitorEventLoopDelay\` from \`perf_hooks\`, clinic.js, or the event loop delay metric in your APM.`,
    },
    follow: [
      { pt: 'Qual a diferença entre `worker_threads` e `cluster`?', en: 'What is the difference between `worker_threads` and `cluster`?' },
      { pt: 'Por que aumentar `UV_THREADPOOL_SIZE` às vezes melhora a performance com bcrypt?', en: 'Why does raising `UV_THREADPOOL_SIZE` sometimes speed up bcrypt?' },
    ],
    flags: {
      pt: '"Node não serve para nada pesado." A resposta sênior é: serve, desde que o trabalho de CPU saia do event loop.',
      en: '"Node is useless for anything heavy." The senior answer: it works fine as long as CPU work leaves the event loop.',
    },
    anchor: {
      pt: 'No Livit, um único worker Node, iniciado sob demanda, roda as regras dos jogos separado do servidor Python: é o padrão de isolar processamento em outro processo. No TripFlow, a publicação no RabbitMQ sai da requisição via outbox + relay.',
      en: 'In Livit, a single on-demand Node worker runs game rules separately from the Python server: the pattern of isolating processing in another process. In TripFlow, publishing to RabbitMQ leaves the request via outbox + relay.',
    },
  },
  {
    id: 'node-streams-backpressure',
    cat: 'node', type: 'code', jobs: ['elastic', 'brainrocket'],
    tags: ['streams', 'backpressure', 'pipeline', 'csv', 'memory'],
    q: {
      pt: 'Você precisa exportar 5 milhões de linhas do banco para CSV numa rota HTTP. Como faz sem estourar a memória? O que é backpressure?',
      en: 'You need to export 5 million database rows to CSV from an HTTP route. How do you do it without blowing up memory? What is backpressure?',
    },
    code: {
      src: `
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

app.get('/exports/trips.csv', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="trips.csv"');

  const rows = db.query('SELECT id, title, status FROM trips').stream(); // cursor, não array

  const toCsv = new Transform({
    objectMode: true,
    transform(row, _enc, done) {
      done(null, \`\${row.id},\${csvEscape(row.title)},\${row.status}\\n\`);
    },
  });

  try {
    // pipeline propaga erros, respeita backpressure e destrói tudo se o cliente desconectar
    await pipeline(rows, toCsv, res);
  } catch (err) {
    req.log.error({ err }, 'export failed');
  }
});`,
    },
    a: {
      pt: `Carregar tudo num array e fazer \`res.send\` quebra o processo (heap) e trava o loop no \`join\`. O certo é **streaming de ponta a ponta**: cursor no banco → Transform para CSV → resposta HTTP.

**Backpressure** é o mecanismo pelo qual um consumidor lento freia um produtor rápido. Se a rede do cliente é lenta, \`res.write()\` retorna \`false\` quando o buffer interno passa do \`highWaterMark\`; o produtor deveria pausar até o evento \`drain\`. \`stream.pipeline\` (ou \`.pipe\`) faz isso automaticamente e, diferente do \`.pipe\` puro, também **propaga erros e destrói os streams** se o cliente desconectar, evitando vazar conexões do banco.

Para exports realmente grandes, a alternativa mais robusta é assíncrona: enfileirar um job, gerar o arquivo num storage (S3) e notificar o usuário com um link, em vez de segurar uma requisição HTTP por minutos.`,
      en: `Loading everything into an array and calling \`res.send\` crashes the process (heap) and blocks the loop during the \`join\`. The right way is **end-to-end streaming**: a database cursor → a Transform to CSV → the HTTP response.

**Backpressure** is how a slow consumer throttles a fast producer. If the client's network is slow, \`res.write()\` returns \`false\` once the internal buffer exceeds \`highWaterMark\`; the producer should pause until the \`drain\` event. \`stream.pipeline\` (or \`.pipe\`) does this automatically and, unlike bare \`.pipe\`, also **propagates errors and destroys the streams** when the client disconnects, so database connections do not leak.

For truly large exports, the sturdier option is asynchronous: enqueue a job, write the file to storage (S3), and notify the user with a link, instead of holding an HTTP request open for minutes.`,
    },
    follow: [
      { pt: 'Como você testaria que não há vazamento de memória nesse endpoint?', en: 'How would you test that this endpoint does not leak memory?' },
      { pt: 'E se o CSV precisar de agregações que exigem ver todas as linhas?', en: 'What if the CSV needs aggregations that require seeing every row?' },
    ],
    flags: {
      pt: 'Aumentar `--max-old-space-size` como solução. Ou usar `.pipe()` sem tratar erros.',
      en: 'Raising `--max-old-space-size` as the fix. Or using `.pipe()` without handling errors.',
    },
    anchor: {
      pt: 'Na Easy Process você criou extrações de dados e relatórios gerenciais em Oracle; no Grupo Mysa lida com ERP e e-commerce de grande porte. Conte um caso real de relatório pesado e explique como faria hoje com streaming ou job assíncrono.',
      en: 'At Easy Process you built data extracts and management reports in Oracle; at Grupo Mysa you deal with large ERP and e-commerce systems. Tell a real heavy-report story and explain how you would do it today with streaming or an async job.',
    },
  },
  {
    id: 'node-error-handling-shutdown',
    cat: 'node', type: 'code', jobs: ['elastic', 'brainrocket'],
    tags: ['error handling', 'graceful shutdown', 'SIGTERM', 'unhandledRejection', 'Kubernetes'],
    q: {
      pt: 'Como você trata erros num serviço Node em produção e como implementa graceful shutdown num container?',
      en: 'How do you handle errors in a production Node service and how do you implement graceful shutdown in a container?',
    },
    code: {
      src: `
// Erros de domínio são esperados; o resto é bug.
class DomainError extends Error {
  constructor(message: string, public readonly status = 422, public readonly code = 'DOMAIN_ERROR') {
    super(message);
  }
}

app.use((err, req, res, _next) => {
  if (err instanceof DomainError) {
    return res.status(err.status).json({ code: err.code, message: err.message });
  }
  req.log.error({ err, traceId: req.traceId }, 'unhandled error');
  res.status(500).json({ code: 'INTERNAL', message: 'Unexpected error' }); // sem stack para o cliente
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'unhandledRejection');
  process.exit(1); // estado desconhecido: melhor reiniciar
});

const server = app.listen(3000);

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  setReadiness(false);              // readiness probe falha → sai do load balancer
  server.close();                   // para de aceitar conexões, termina as em andamento
  await Promise.allSettled([queue.close(), db.end()]);
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
setTimeout(() => process.exit(1), 25_000).unref(); // não passe do terminationGracePeriod`,
    },
    a: {
      pt: `Separo **erros operacionais esperados** (validação, regra de negócio, recurso não encontrado, timeout de terceiro) de **bugs** (TypeError, invariante quebrada). Os primeiros viram respostas 4xx com código de erro estável e mensagem útil. Os bugs viram 500 genérico para o cliente (sem stack trace, que vaza informação), log estruturado com trace ID e alerta.

\`unhandledRejection\` e \`uncaughtException\` indicam estado desconhecido: logar e **deixar o processo morrer**, para o orquestrador subir outro limpo. Tentar "continuar" esconde corrupção.

**Graceful shutdown**: no Kubernetes o pod recebe \`SIGTERM\`, depois \`SIGKILL\` após o grace period (30 s por padrão). O serviço deve marcar readiness como falha, parar de aceitar conexões, terminar as requisições em andamento, fechar consumidores de fila (sem dar ack em mensagem não processada) e conexões de banco, e sair. Em Docker, rodar Node como PID 1 sem init (ou via \`npm start\`) pode engolir o sinal: use \`node\` direto ou \`tini\`/\`--init\`.`,
      en: `I separate **expected operational errors** (validation, business rules, not found, third-party timeout) from **bugs** (TypeError, broken invariant). The former become 4xx responses with a stable error code and a useful message. Bugs become a generic 500 for the client (no stack trace, which leaks information), a structured log with a trace ID, and an alert.

\`unhandledRejection\` and \`uncaughtException\` mean unknown state: log it and **let the process die**, so the orchestrator starts a clean one. Trying to "keep going" hides corruption.

**Graceful shutdown**: in Kubernetes a pod gets \`SIGTERM\`, then \`SIGKILL\` after the grace period (30 s by default). The service should fail readiness, stop accepting connections, finish in-flight requests, close queue consumers (without acking unprocessed messages) and database connections, and exit. In Docker, running Node as PID 1 without an init (or through \`npm start\`) can swallow the signal: run \`node\` directly or use \`tini\`/\`--init\`.`,
    },
    follow: [
      { pt: 'Qual a diferença entre liveness e readiness probe?', en: 'What is the difference between a liveness and a readiness probe?' },
      { pt: 'Como você garante que uma mensagem de fila não se perde durante o deploy?', en: 'How do you make sure a queue message is not lost during a deploy?' },
    ],
    flags: {
      pt: '`catch (e) { console.log(e) }` engolindo o erro, ou devolver `err.stack` na resposta da API.',
      en: '`catch (e) { console.log(e) }` swallowing the error, or returning `err.stack` in the API response.',
    },
    anchor: {
      pt: 'Na Sicoob você participou de deploy, Docker, Linux e investigação de incidentes; no Grupo Mysa faz sustentação em produção. No TripFlow, o consumidor deduplica reentregas pelo ID: é a garantia de que um shutdown no meio do processamento não gera efeito duplicado.',
      en: 'At Sicoob you worked on deployments, Docker, Linux, and incident investigation; at Grupo Mysa you do production support. In TripFlow the consumer deduplicates redeliveries by ID: that guarantees a shutdown mid-processing does not produce duplicate effects.',
    },
  },
  {
    id: 'nest-di-modules',
    cat: 'node', type: 'lib', jobs: ['brainrocket'],
    tags: ['NestJS', 'dependency injection', 'modules', 'guards', 'interceptors', 'pipes'],
    q: {
      pt: 'Explique a arquitetura do NestJS: módulos, providers, injeção de dependência e o ciclo de vida de uma requisição (middleware, guard, interceptor, pipe, filter).',
      en: "Explain NestJS's architecture: modules, providers, dependency injection, and the request lifecycle (middleware, guard, interceptor, pipe, filter).",
    },
    code: {
      src: `
@Injectable()
export class ApproveTripUseCase {
  constructor(
    private readonly trips: TripRepository,          // interface (token), não implementação
    @Inject(EVENT_BUS) private readonly bus: EventBus,
  ) {}

  async execute(tripId: string, approverId: string) {
    const trip = await this.trips.findById(tripId);
    trip.approve(approverId);                        // regra no domínio
    await this.trips.save(trip);
    await this.bus.publish(new TripApproved(trip.id));
  }
}

@Module({
  imports: [DatabaseModule],
  controllers: [TripsController],
  providers: [
    ApproveTripUseCase,
    { provide: TripRepository, useClass: TypeOrmTripRepository },
    { provide: EVENT_BUS, useClass: RabbitEventBus },
  ],
})
export class TripsModule {}

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(private readonly approve: ApproveTripUseCase) {}

  @Post(':id/approve')
  @Roles('manager')
  run(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.approve.execute(id, user.id);
  }
}`,
    },
    a: {
      pt: `NestJS é um framework opinativo inspirado no Angular, com um **container de IoC**. Você declara dependências no construtor e o Nest resolve o grafo e injeta as instâncias (singleton por padrão, com escopos request/transient). Isso facilita trocar implementações em teste e aplicar Dependency Inversion.

**Módulos** agrupam controllers e providers por contexto e definem o que é exportado. Bem usados, viram fronteiras de bounded context.

Ciclo de uma requisição:

1. **Middleware**: estilo Express, antes do roteamento (logging, correlation ID).
2. **Guards**: decidem se a requisição pode seguir (autenticação, roles). Retornam boolean.
3. **Interceptors (antes)**: envolvem o handler com RxJS (timing, cache, transformação).
4. **Pipes**: validam e transformam parâmetros (\`ValidationPipe\` com class-validator, \`ParseUUIDPipe\`).
5. **Handler** do controller.
6. **Interceptors (depois)**: mapeiam a resposta.
7. **Exception filters**: convertem exceções em respostas HTTP.

Cuidado sênior: não deixar regra de negócio no controller nem acoplar o domínio a decorators do ORM. O controller só traduz HTTP para um caso de uso.`,
      en: `NestJS is an opinionated, Angular-inspired framework with an **IoC container**. You declare dependencies in the constructor and Nest resolves the graph and injects instances (singleton by default, with request/transient scopes). That makes swapping implementations in tests easy and supports Dependency Inversion.

**Modules** group controllers and providers by context and define what is exported. Used well, they become bounded-context boundaries.

Request lifecycle:

1. **Middleware**: Express-style, before routing (logging, correlation ID).
2. **Guards**: decide whether the request may continue (authentication, roles). They return a boolean.
3. **Interceptors (before)**: wrap the handler with RxJS (timing, caching, transformation).
4. **Pipes**: validate and transform parameters (\`ValidationPipe\` with class-validator, \`ParseUUIDPipe\`).
5. The controller **handler**.
6. **Interceptors (after)**: map the response.
7. **Exception filters**: turn exceptions into HTTP responses.

The senior caveat: keep business rules out of controllers and do not couple the domain to ORM decorators. The controller only translates HTTP into a use case.`,
    },
    follow: [
      { pt: 'Como você resolve dependência circular entre módulos no Nest?', en: 'How do you resolve a circular dependency between modules in Nest?' },
      { pt: 'Como testaria `ApproveTripUseCase` sem banco?', en: 'How would you test `ApproveTripUseCase` without a database?' },
    ],
    flags: {
      pt: 'Fingir experiência com Nest. Se não usou em produção, diga e mostre que o modelo mental é o mesmo do Laravel e do ASP.NET, que você já usou.',
      en: 'Faking Nest experience. If you have not used it in production, say so and show the mental model is the same as Laravel and ASP.NET, which you have used.',
    },
    anchor: {
      pt: 'Laravel tem service container, service providers, middleware, form requests (≈ pipes) e policies/gates (≈ guards). ASP.NET (que você usou na Sicoob) tem DI nativa e filtros. Frase pronta: "O ciclo do Nest mapeia quase um para um no Laravel e no ASP.NET, que uso há anos."',
      en: 'Laravel has a service container, service providers, middleware, form requests (≈ pipes), and policies/gates (≈ guards). ASP.NET (which you used at Sicoob) has built-in DI and filters. Ready line: "Nest\'s lifecycle maps almost one-to-one to Laravel and ASP.NET, which I have used for years."',
    },
  },
];
