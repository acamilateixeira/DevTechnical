export default [
  {
    id: 'node-event-loop-blocking',
    cat: 'node', type: 'concept', jobs: ['sr-observability', 'sr-node-react'],
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
    cat: 'node', type: 'code', jobs: ['sr-observability', 'sr-node-react'],
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
    cat: 'node', type: 'code', jobs: ['sr-observability', 'sr-node-react'],
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
    cat: 'node', type: 'lib', jobs: ['sr-node-react'],
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
  {
    id: 'nest-guard-decorator-test',
    cat: 'node', type: 'code', jobs: ['sr-node-react'],
    tags: ['NestJS', 'guards', 'custom decorator', 'Reflector', 'testing', 'RBAC'],
    q: {
      pt: 'Implemente no NestJS um guard de papéis com decorator `@Roles()` e escreva o teste unitário dele.',
      en: 'Implement a NestJS roles guard with a `@Roles()` decorator and write its unit test.',
    },
    code: {
      src: `
// roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),        // método tem prioridade
      ctx.getClass(),          // depois o controller
    ]);
    if (!required?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    if (!user) throw new UnauthorizedException();
    return required.some((r) => user.roles.includes(r)); // false → 403 Forbidden
  }
}

// roles.guard.spec.ts
describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);
  const ctxFor = (user: unknown) => ({
    getHandler: () => null, getClass: () => null,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

  it('allows routes without @Roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctxFor({ roles: [] }))).toBe(true);
  });
  it('denies a user without the role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manager']);
    expect(guard.canActivate(ctxFor({ roles: ['employee'] }))).toBe(false);
  });
  it('throws 401 when there is no user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manager']);
    expect(() => guard.canActivate(ctxFor(undefined))).toThrow(UnauthorizedException);
  });
});`,
    },
    a: {
      pt: `**Decorator** grava metadados na rota com \`SetMetadata\`; o **guard** lê com o \`Reflector\`. \`getAllAndOverride\` faz o decorator do método sobrescrever o do controller. O guard roda depois da autenticação (o \`JwtAuthGuard\` coloca \`request.user\`), na ordem em que aparecem em \`@UseGuards\`, ou pode ser global com \`APP_GUARD\`.

Distinção importante: sem usuário → **401** (não autenticado); usuário sem papel → **403** (não autorizado). Retornar \`false\` gera 403.

**Teste**: guard é uma classe comum, então testo sem subir o Nest, com um \`ExecutionContext\` falso. Cubro rota sem papéis, usuário com papel, usuário sem papel e sem usuário. Depois, um teste e2e com \`Test.createTestingModule\` + supertest confirma a integração com as rotas reais.

Limite do RBAC: papéis não resolvem regras contextuais ("o gestor só aprova viagens do próprio centro de custo"). Essas ficam no caso de uso ou numa policy (CASL), porque dependem do recurso, não só do usuário.`,
      en: `The **decorator** writes route metadata with \`SetMetadata\`; the **guard** reads it with \`Reflector\`. \`getAllAndOverride\` lets the method's decorator override the controller's. The guard runs after authentication (the \`JwtAuthGuard\` sets \`request.user\`), in the order listed in \`@UseGuards\`, or globally via \`APP_GUARD\`.

Key distinction: no user → **401** (unauthenticated); user without the role → **403** (forbidden). Returning \`false\` produces a 403.

**Testing**: a guard is a plain class, so I test it without booting Nest, using a fake \`ExecutionContext\`. I cover a route without roles, a user with the role, a user without it, and no user. Then an e2e test with \`Test.createTestingModule\` + supertest confirms integration with the real routes.

RBAC's limit: roles do not handle contextual rules ("a manager only approves trips from their own cost center"). Those live in the use case or a policy (CASL), because they depend on the resource, not just the user.`,
    },
    follow: [
      { pt: 'Como você faria esse guard funcionar também em resolvers GraphQL?', en: 'How would you make this guard also work for GraphQL resolvers?' },
      { pt: 'Guard ou middleware para autenticação? Por quê?', en: 'Guard or middleware for authentication? Why?' },
    ],
    flags: {
      pt: 'Checar papel dentro de cada controller com `if`. Ou confundir 401 com 403.',
      en: 'Checking roles inside every controller with an `if`. Or mixing up 401 and 403.',
    },
    anchor: {
      pt: 'No Laravel você usa middleware de rota e Policies/Gates, que são o mesmo conceito. Diga: "no Laravel faço isso com Policies e middleware `can:`; no Nest o equivalente é guard + decorator com Reflector". A separação entre papel e regra contextual aparece no TripFlow (aprovação depende do centro de custo).',
      en: 'In Laravel you use route middleware and Policies/Gates, which are the same concept. Say: "in Laravel I do this with Policies and `can:` middleware; in Nest the equivalent is a guard + decorator with Reflector". The split between role and contextual rule shows up in TripFlow (approval depends on the cost center).',
    },
  },
  {
    id: 'nest-microservices-rabbitmq',
    cat: 'node', type: 'lib', jobs: ['sr-node-react'],
    tags: ['NestJS', 'microservices', 'RabbitMQ', 'MessagePattern', 'EventPattern', 'transport'],
    q: {
      pt: 'Como o NestJS trabalha com microsserviços e RabbitMQ? Qual a diferença entre `@MessagePattern` e `@EventPattern`?',
      en: 'How does NestJS handle microservices and RabbitMQ? What is the difference between `@MessagePattern` and `@EventPattern`?',
    },
    code: {
      src: `
// main.ts do serviço de notificações
const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationsModule, {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL],
    queue: 'notifications',
    queueOptions: { durable: true },
    noAck: false,                 // ack manual
    prefetchCount: 10,
  },
});

@Controller()
export class NotificationsController {
  @EventPattern('trip.approved')                       // evento: fire-and-forget
  async onTripApproved(@Payload() e: TripApproved, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    try {
      await this.notify.tripApproved(e);               // idempotente por e.eventId
      channel.ack(msg);
    } catch (err) {
      channel.nack(msg, false, false);                 // vai para a DLQ configurada
    }
  }

  @MessagePattern('quote.calculate')                   // request-response
  calculate(@Payload() dto: QuoteRequest) {
    return this.quotes.calculate(dto);                 // resposta volta ao chamador
  }
}

// lado do produtor
this.client.emit('trip.approved', event);              // não espera
const quote = await firstValueFrom(this.client.send('quote.calculate', dto).pipe(timeout(2000)));`,
    },
    a: {
      pt: `O Nest abstrai o transporte (TCP, Redis, NATS, RabbitMQ, Kafka, gRPC) com a mesma API de controllers e decorators. Um serviço pode ser só microsserviço ou híbrido (HTTP + consumidor) com \`connectMicroservice\`.

- **\`@EventPattern\`** + \`client.emit\`: **evento**, fire-and-forget. O produtor não espera resposta. É o padrão para integração assíncrona entre serviços (\`trip.approved\`).
- **\`@MessagePattern\`** + \`client.send\`: **request-response** sobre o broker; devolve um Observable com a resposta. Útil, mas recria acoplamento síncrono: sempre com \`timeout\` e pensando no que acontece se o outro lado estiver fora.

Cuidados de produção que o Nest não resolve sozinho:

- \`noAck: false\` e ack/nack manual, com DLQ e retry com backoff configurados no RabbitMQ.
- Consumidor **idempotente** (at-least-once).
- Publicar a partir de uma **outbox**, não direto depois do commit.
- Contratos versionados dos eventos (schema compartilhado, compatível para trás).
- O transporte RMQ padrão do Nest usa uma fila por serviço; para roteamento por topic exchange e padrões avançados, muitos times usam \`@golevelup/nestjs-rabbitmq\`.`,
      en: `Nest abstracts the transport (TCP, Redis, NATS, RabbitMQ, Kafka, gRPC) behind the same controller and decorator API. A service can be microservice-only or hybrid (HTTP + consumer) via \`connectMicroservice\`.

- **\`@EventPattern\`** + \`client.emit\`: an **event**, fire-and-forget. The producer does not wait for a reply. This is the pattern for async integration between services (\`trip.approved\`).
- **\`@MessagePattern\`** + \`client.send\`: **request-response** over the broker; returns an Observable with the reply. Useful, but it brings back synchronous coupling: always use a \`timeout\` and think about what happens when the other side is down.

Production concerns Nest does not solve for you:

- \`noAck: false\` and manual ack/nack, with a DLQ and backoff retries configured in RabbitMQ.
- An **idempotent** consumer (at-least-once).
- Publishing from an **outbox**, not right after commit.
- Versioned event contracts (shared schema, backward compatible).
- Nest's default RMQ transport uses one queue per service; for topic-exchange routing and advanced patterns, many teams use \`@golevelup/nestjs-rabbitmq\`.`,
    },
    follow: [
      { pt: 'Como você rastrearia uma requisição que passa por HTTP e depois por duas filas?', en: 'How would you trace a request that goes through HTTP and then two queues?' },
      { pt: 'O que acontece com `client.send` se o serviço consumidor estiver fora do ar?', en: 'What happens to `client.send` if the consuming service is down?' },
    ],
    flags: {
      pt: 'Usar `send` (request-response) para tudo e chamar isso de arquitetura orientada a eventos.',
      en: 'Using `send` (request-response) for everything and calling it event-driven architecture.',
    },
    anchor: {
      pt: 'A parte difícil você já resolveu no TripFlow (outbox, relay, RabbitMQ, consumidor deduplicando por ID). Frase pronta: "O transporte do Nest é a parte fácil; a garantia de entrega e a idempotência eu implementei no TripFlow e levaria para o Nest do mesmo jeito".',
      en: 'You already solved the hard part in TripFlow (outbox, relay, RabbitMQ, consumer deduplicating by ID). Ready line: "Nest\'s transport is the easy part; delivery guarantees and idempotency I implemented in TripFlow and would carry into Nest the same way".',
    },
  },
];
