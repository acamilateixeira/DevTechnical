export default [
  {
    id: 'api-rest-vs-graphql',
    cat: 'api', type: 'architecture', jobs: ['sr-node-react', 'sr-observability'],
    tags: ['REST', 'GraphQL', 'Apollo', 'over-fetching', 'caching'],
    q: {
      pt: 'REST ou GraphQL? Quais os trade-offs reais e quando você escolheria cada um?',
      en: 'REST or GraphQL? What are the real trade-offs and when would you pick each?',
    },
    a: {
      pt: `**REST** modela recursos com verbos HTTP. Pontos fortes: simples, cache HTTP nativo (CDN, ETag, \`Cache-Control\`), status codes padronizados, fácil de observar e de limitar por rota. Fraqueza: over/under-fetching e várias idas e voltas quando a tela precisa de dados de vários recursos.

**GraphQL** expõe um schema tipado e o cliente pede exatamente os campos que quer, numa requisição. Pontos fortes: ótimo para clientes diversos (web, mobile) e telas que agregam muitos dados; o schema vira contrato e documentação; evolução sem versionar (depreciar campos). Fraquezas: cache HTTP praticamente some (tudo é POST em \`/graphql\`, o cache vai para o cliente, como o normalized cache do Apollo), **N+1** nos resolvers, risco de queries caras (precisa de limite de profundidade/complexidade e persisted queries), erros com status 200 e observabilidade por operação, não por rota.

Escolho REST para APIs públicas, integrações entre sistemas, webhooks e serviços simples. GraphQL para um BFF que atende front-ends ricos com muitos relacionamentos. Os dois convivem bem: GraphQL na borda, REST/gRPC entre serviços.`,
      en: `**REST** models resources with HTTP verbs. Strengths: simple, native HTTP caching (CDN, ETag, \`Cache-Control\`), standard status codes, easy to observe and rate-limit per route. Weakness: over/under-fetching and many round trips when a screen needs data from several resources.

**GraphQL** exposes a typed schema and the client asks for exactly the fields it needs, in one request. Strengths: great for diverse clients (web, mobile) and screens that aggregate lots of data; the schema becomes contract and documentation; it evolves without versioning (deprecate fields). Weaknesses: HTTP caching mostly disappears (everything is a POST to \`/graphql\`, so caching moves to the client, like Apollo's normalized cache), **N+1** in resolvers, risk of expensive queries (you need depth/complexity limits and persisted queries), errors returned with status 200, and observability per operation rather than per route.

I pick REST for public APIs, system-to-system integrations, webhooks, and simple services. GraphQL for a BFF serving rich front ends with many relationships. They coexist well: GraphQL at the edge, REST/gRPC between services.`,
    },
    follow: [
      { pt: 'Como o normalized cache do Apollo Client funciona? O que é `__typename` + `id`?', en: "How does Apollo Client's normalized cache work? What is `__typename` + `id`?" },
      { pt: 'Como você versionaria uma API REST sem quebrar clientes?', en: 'How would you version a REST API without breaking clients?' },
    ],
    flags: {
      pt: '"GraphQL é mais moderno, então é melhor." Ou não saber que GraphQL perde o cache HTTP.',
      en: '"GraphQL is more modern, so it is better." Or not knowing GraphQL loses HTTP caching.',
    },
    anchor: {
      pt: 'Você tem muita experiência com REST em integrações (ERP ↔ Salesforce ↔ e-commerce, Oracle APEX, MuleSoft). GraphQL/Apollo é lacuna no CV: diga que estudou, explique N+1 e DataLoader com segurança e conecte com sua vivência de integrar sistemas com contratos diferentes. Um projeto pequeno com Apollo no GitHub fecharia essa lacuna.',
      en: 'You have lots of REST experience in integrations (ERP ↔ Salesforce ↔ e-commerce, Oracle APEX, MuleSoft). GraphQL/Apollo is a gap on your CV: say you have studied it, explain N+1 and DataLoader confidently, and connect it to integrating systems with different contracts. A small Apollo project on GitHub would close the gap.',
    },
  },
  {
    id: 'graphql-n-plus-one',
    cat: 'api', type: 'code', jobs: ['sr-node-react'],
    tags: ['GraphQL', 'N+1', 'DataLoader', 'batching', 'resolvers'],
    q: {
      pt: 'O que é o problema N+1 em GraphQL e como o DataLoader resolve? Mostre em código.',
      en: 'What is the N+1 problem in GraphQL and how does DataLoader solve it? Show it in code.',
    },
    code: {
      src: `
// Query: { trips(first: 50) { id title requester { name } } }
// Sem DataLoader: 1 query de trips + 50 queries de users = N+1

import DataLoader from 'dataloader';

// Um loader POR REQUISIÇÃO (no context), para não vazar cache entre usuários
function createLoaders(db) {
  return {
    userById: new DataLoader(async (ids: readonly string[]) => {
      const rows = await db.user.findMany({ where: { id: { in: [...ids] } } }); // 1 query
      const byId = new Map(rows.map((u) => [u.id, u]));
      return ids.map((id) => byId.get(id) ?? new Error(\`User \${id} not found\`)); // mesma ordem!
    }),
  };
}

const resolvers = {
  Trip: {
    requester: (trip, _args, ctx) => ctx.loaders.userById.load(trip.requesterId),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
// context: ({ req }) => ({ user: req.user, loaders: createLoaders(db) })`,
    },
    a: {
      pt: `Em GraphQL cada campo tem seu resolver. Ao listar 50 viagens e pedir \`requester\`, o resolver de \`requester\` roda 50 vezes, cada uma com sua query: **1 + N**.

O **DataLoader** acumula todas as chamadas \`load(id)\` feitas no mesmo tick do event loop e chama a função de batch **uma vez** com todos os IDs (\`WHERE id IN (...)\`). Também memoiza por requisição: o mesmo ID pedido duas vezes busca uma vez só.

Regras que costumam cair na entrevista: a função de batch tem de devolver um array **do mesmo tamanho e na mesma ordem** dos IDs recebidos; o loader é criado **por requisição** (no context) para não misturar dados entre usuários com permissões diferentes.

Alternativas: join/lookahead no resolver pai, ou ORMs com eager loading. Mas o DataLoader é o padrão porque mantém os resolvers independentes.`,
      en: `In GraphQL every field has its own resolver. Listing 50 trips with \`requester\` runs the \`requester\` resolver 50 times, each with its own query: **1 + N**.

**DataLoader** collects every \`load(id)\` call made in the same event-loop tick and calls the batch function **once** with all IDs (\`WHERE id IN (...)\`). It also memoizes per request: the same ID requested twice is fetched once.

Rules that come up in interviews: the batch function must return an array of **the same length and in the same order** as the IDs it received; the loader is created **per request** (in the context) so data is never shared between users with different permissions.

Alternatives: a join/lookahead in the parent resolver, or ORM eager loading. DataLoader is the standard because it keeps resolvers independent.`,
    },
    follow: [
      { pt: 'Como você limitaria uma query maliciosa muito profunda?', en: 'How would you limit a malicious, deeply nested query?' },
      { pt: 'Laravel/Eloquent também tem N+1. Como você resolve lá?', en: 'Laravel/Eloquent also has N+1. How do you fix it there?' },
    ],
    flags: {
      pt: 'Criar o DataLoader como singleton global. Ou devolver o resultado na ordem do banco, não na ordem dos IDs.',
      en: 'Creating the DataLoader as a global singleton. Or returning results in database order instead of ID order.',
    },
    anchor: {
      pt: 'N+1 você conhece do Eloquent: `with()` para eager loading e `preventLazyLoading()` em dev. É a mesma doença, com remédio diferente. Comece por aí e depois mostre o DataLoader.',
      en: 'You know N+1 from Eloquent: `with()` for eager loading and `preventLazyLoading()` in dev. Same disease, different medicine. Start there, then show DataLoader.',
    },
  },
  {
    id: 'api-idempotency',
    cat: 'api', type: 'architecture', jobs: ['sr-node-react', 'sr-observability', 'cv'],
    tags: ['idempotency', 'Idempotency-Key', 'retries', 'payments', 'HTTP methods'],
    q: {
      pt: 'O cliente faz um POST de pagamento, a rede cai e ele tenta de novo. Como você garante que não cobra duas vezes?',
      en: 'A client POSTs a payment, the network drops, and it retries. How do you guarantee you do not charge twice?',
    },
    a: {
      pt: `GET, PUT e DELETE são idempotentes por definição; **POST não é**. Para torná-lo seguro a retries:

1. O cliente gera uma **Idempotency-Key** (UUID) por intenção de operação e reenvia a mesma chave nos retries.
2. O servidor grava a chave com uma constraint única **antes** de executar o efeito. Se a chave já existe e terminou, devolve a **resposta salva** (mesmo status e body). Se está em andamento, responde 409 ou espera.
3. Se a mesma chave chega com payload diferente, rejeita (422/409), porque é uso indevido.
4. A chave expira após uma janela (ex.: 24 h).

Por baixo, a garantia vem do banco: constraint única ou lock da linha dentro de transação. Lock distribuído em Redis ajuda a coordenar, mas não substitui a constraint, porque pode expirar no meio da operação.

Isso se conecta a **at-least-once** em mensageria: retries são inevitáveis em sistemas distribuídos, então quem recebe precisa ser idempotente.`,
      en: `GET, PUT, and DELETE are idempotent by definition; **POST is not**. To make it retry-safe:

1. The client generates an **Idempotency-Key** (UUID) per operation intent and resends the same key on retries.
2. The server stores the key under a unique constraint **before** executing the side effect. If the key exists and has finished, it returns the **saved response** (same status and body). If it is still in progress, it returns 409 or waits.
3. If the same key arrives with a different payload, it rejects it (422/409), because that is misuse.
4. The key expires after a window (e.g. 24 h).

The real guarantee comes from the database: a unique constraint or a row lock inside a transaction. A Redis distributed lock helps coordinate but does not replace the constraint, because it can expire mid-operation.

This ties into **at-least-once** messaging: retries are unavoidable in distributed systems, so the receiver must be idempotent.`,
    },
    follow: [
      { pt: 'E se o servidor cair depois de cobrar, mas antes de salvar a resposta?', en: 'What if the server crashes after charging but before saving the response?' },
      { pt: 'Onde você guarda a chave: Redis ou banco relacional? Por quê?', en: 'Where do you store the key: Redis or the relational database? Why?' },
    ],
    flags: {
      pt: '"Desabilito o botão no front." Isso melhora a UX, mas não protege contra retry de rede, proxy ou cliente de API.',
      en: '"I disable the button on the frontend." That improves UX but does not protect against network, proxy, or API-client retries.',
    },
    anchor: {
      pt: 'Esta é a sua pergunta mais forte: o TripFlow reaproveita a resposta salva para a mesma Idempotency-Key e usa lock no Redis na reserva sem segurar a transação durante a chamada ao fornecedor. O MeterTrail devolve 409 para mesmo ID com conteúdo diferente. Conte os dois com detalhe.',
      en: 'This is your strongest question: TripFlow replays the saved response for the same Idempotency-Key and uses a Redis lock during booking without holding the transaction open during the supplier call. MeterTrail returns 409 for the same ID with different content. Tell both stories in detail.',
    },
  },
  {
    id: 'api-websockets-scale',
    cat: 'api', type: 'architecture', jobs: ['sr-node-react', 'sr-observability'],
    tags: ['WebSockets', 'SSE', 'Socket.IO', 'Redis pub/sub', 'scaling', 'sticky sessions'],
    q: {
      pt: 'Você precisa mostrar atualizações em tempo real para 50 mil usuários conectados. WebSocket, SSE ou polling? E como escala horizontalmente?',
      en: 'You need to push real-time updates to 50,000 connected users. WebSocket, SSE, or polling? And how do you scale horizontally?',
    },
    a: {
      pt: `- **Polling** é simples e funciona com qualquer infra, mas gera carga e latência proporcionais ao intervalo.
- **SSE** (Server-Sent Events) é unidirecional servidor→cliente sobre HTTP comum, com reconexão automática e \`Last-Event-ID\`. Ótimo para feeds, notificações e logs em tempo real.
- **WebSocket** é bidirecional e full-duplex. Necessário para chat, colaboração e jogos.

Para escalar além de uma instância: cada servidor só conhece os sockets conectados nele, então é preciso um **backplane** de pub/sub (Redis pub/sub ou Streams, NATS, Kafka) para que um evento publicado em qualquer nó chegue a todos. Socket.IO tem o adapter Redis para isso. Load balancer com suporte a upgrade e, se usar fallback de long-polling, **sticky sessions**.

Outros cuidados: heartbeat/ping para detectar conexões mortas, reconexão com backoff exponencial e jitter (evita thundering herd após deploy), autenticação no handshake (token, não cookie solto), autorização por canal, limite de mensagens por conexão e entender que o deploy derruba conexões: o cliente precisa reconectar e recuperar o que perdeu.`,
      en: `- **Polling** is simple and works with any infrastructure, but load and latency scale with the interval.
- **SSE** (Server-Sent Events) is one-way server→client over plain HTTP, with automatic reconnection and \`Last-Event-ID\`. Great for feeds, notifications, and live logs.
- **WebSocket** is bidirectional and full-duplex. Needed for chat, collaboration, and games.

To scale beyond one instance: each server only knows the sockets connected to it, so you need a pub/sub **backplane** (Redis pub/sub or Streams, NATS, Kafka) so an event published on any node reaches all of them. Socket.IO has a Redis adapter for this. Use a load balancer that supports upgrades and, if you fall back to long-polling, **sticky sessions**.

Other concerns: heartbeats/pings to detect dead connections, reconnection with exponential backoff and jitter (avoids a thundering herd after a deploy), authentication at the handshake (a token, not a loose cookie), per-channel authorization, per-connection message limits, and accepting that deploys drop connections: clients must reconnect and recover what they missed.`,
    },
    follow: [
      { pt: 'Como o cliente recupera eventos perdidos durante a desconexão?', en: 'How does the client recover events missed while disconnected?' },
      { pt: 'Quantas conexões um processo Node aguenta? O que limita?', en: 'How many connections can one Node process hold? What limits it?' },
    ],
    flags: {
      pt: 'Não saber que múltiplas instâncias precisam de pub/sub entre si. Ou escolher WebSocket para tudo, mesmo quando SSE basta.',
      en: 'Not knowing multiple instances need pub/sub between them. Or choosing WebSocket for everything when SSE would do.',
    },
    anchor: {
      pt: 'O Bora usa Supabase Realtime (WebSocket sobre a replicação do PostgreSQL) para o despacho acompanhar presença e estados; o Livit recebe eventos do TikTok LIVE em tempo real. Diga com clareza que no Bora a infra de WebSocket é gerenciada, e explique o que você faria para escalar uma própria.',
      en: 'Bora uses Supabase Realtime (WebSocket over PostgreSQL replication) so dispatch can follow presence and status; Livit receives TikTok LIVE events in real time. Be clear that in Bora the WebSocket infrastructure is managed, then explain what you would do to scale your own.',
    },
  },
  {
    id: 'api-pagination-compat',
    cat: 'api', type: 'concept', jobs: ['sr-observability', 'sr-node-react'],
    tags: ['pagination', 'cursor', 'offset', 'backward compatibility', 'versioning'],
    q: {
      pt: 'Paginação por offset ou por cursor? E como você evolui uma API usada por clientes que você não controla sem quebrar ninguém?',
      en: 'Offset or cursor pagination? And how do you evolve an API used by clients you do not control without breaking anyone?',
    },
    a: {
      pt: `**Offset** (\`LIMIT 20 OFFSET 10000\`) é simples e permite pular para a página N, mas fica lento em páginas altas (o banco lê e descarta as linhas) e gera itens duplicados ou pulados quando dados são inseridos durante a navegação.

**Cursor/keyset** (\`WHERE (created_at, id) < (:c, :id) ORDER BY created_at DESC, id DESC LIMIT 20\`) usa índice, tem custo constante e é estável com inserções. Desvantagem: não pula para página arbitrária. Ideal para feeds, logs e scroll infinito. O cursor deve ser opaco (base64) para o cliente não depender do formato.

**Compatibilidade retroativa** (vagas de plataforma citam isso explicitamente):

- Mudanças aditivas são seguras: novos campos opcionais, novos endpoints. Clientes devem ignorar campos desconhecidos (tolerant reader).
- Nunca remover ou renomear campo, mudar tipo ou tornar obrigatório sem nova versão.
- Depreciação com prazo: header \`Deprecation\`/\`Sunset\`, documentação, e **métricas de uso** do campo antigo antes de remover.
- Versionamento na URL (\`/v2\`) ou por header quando a quebra é inevitável.
- Contract tests (Pact) para detectar quebra antes do deploy.
- Em migrações de banco: expand → migrate → contract (adicionar novo, escrever nos dois, migrar leitura, remover o velho).`,
      en: `**Offset** (\`LIMIT 20 OFFSET 10000\`) is simple and lets you jump to page N, but it gets slow on high pages (the database reads and discards rows) and produces duplicated or skipped items when data is inserted while paging.

**Cursor/keyset** (\`WHERE (created_at, id) < (:c, :id) ORDER BY created_at DESC, id DESC LIMIT 20\`) uses an index, has constant cost, and is stable under inserts. Downside: no jumping to an arbitrary page. Ideal for feeds, logs, and infinite scroll. The cursor should be opaque (base64) so clients do not depend on its format.

**Backward compatibility** (platform job postings call this out explicitly):

- Additive changes are safe: new optional fields, new endpoints. Clients should ignore unknown fields (tolerant reader).
- Never remove or rename a field, change its type, or make it required without a new version.
- Deprecate with a deadline: \`Deprecation\`/\`Sunset\` headers, documentation, and **usage metrics** on the old field before removal.
- Version in the URL (\`/v2\`) or a header when a breaking change is unavoidable.
- Contract tests (Pact) to catch breakage before deploying.
- For database migrations: expand → migrate → contract (add the new one, write to both, move reads, drop the old one).`,
    },
    follow: [
      { pt: 'Como o Elasticsearch pagina resultados profundos? (`search_after`, PIT)', en: 'How does Elasticsearch page through deep results? (`search_after`, PIT)' },
      { pt: 'Como você faria um rename de coluna com zero downtime?', en: 'How would you rename a column with zero downtime?' },
    ],
    flags: {
      pt: '"Só aviso os clientes e mudo." Ou não saber que offset alto degrada.',
      en: '"I just tell clients and change it." Or not knowing high offsets degrade.',
    },
    anchor: {
      pt: 'Modernização de legado no Grupo Mysa e na Sicoob é exatamente evoluir sem quebrar quem já usa. Seu portfólio diz: "entendo a regra que o código antigo protege antes de mudar e entrego em passos pequenos". Use um exemplo real de integração ERP/e-commerce que você evoluiu sem parar a operação.',
      en: 'Legacy modernization at Grupo Mysa and Sicoob is exactly evolving without breaking existing users. Your portfolio says you understand the rule old code protects before changing it and ship in small steps. Use a real ERP/e-commerce integration you evolved without stopping operations.',
    },
  },
  {
    id: 'graphql-schema-apollo-server',
    cat: 'api', type: 'code', jobs: ['sr-node-react'],
    tags: ['GraphQL', 'Apollo Server', 'schema design', 'connections', 'errors', 'authorization'],
    q: {
      pt: 'Desenhe o schema GraphQL de viagens com paginação, uma mutation de aprovação e tratamento de erros. Onde fica a autorização?',
      en: 'Design a GraphQL schema for trips with pagination, an approval mutation, and error handling. Where does authorization live?',
    },
    code: {
      src: `
type Trip { id: ID!  title: String!  status: TripStatus!  costCents: Int!  requester: User! }
enum TripStatus { PENDING APPROVED REJECTED }

type TripEdge { cursor: String!  node: Trip! }
type PageInfo { endCursor: String  hasNextPage: Boolean! }
type TripConnection { edges: [TripEdge!]!  pageInfo: PageInfo! }

type Query {
  trips(first: Int = 20, after: String, status: TripStatus): TripConnection!
}

# Erros de negócio como parte do contrato (union), não exceções genéricas
type ApproveTripSuccess { trip: Trip! }
type BudgetExceeded { message: String!  remainingCents: Int! }
type NotAllowed { message: String! }
union ApproveTripResult = ApproveTripSuccess | BudgetExceeded | NotAllowed

type Mutation {
  approveTrip(id: ID!): ApproveTripResult!
}

// resolver: fino, delega ao caso de uso, que aplica autorização e regra
const resolvers = {
  Mutation: {
    approveTrip: (_p, { id }, ctx) => ctx.useCases.approveTrip.execute(id, ctx.user),
  },
  ApproveTripResult: { __resolveType: (r) => r.kind },
};`,
    },
    a: {
      pt: `**Schema primeiro**, pensado para os casos de uso do cliente, não como espelho das tabelas.

- **Paginação** no padrão *connection* (Relay): \`edges\`, \`cursor\`, \`pageInfo\`. Cursor opaco, baseado em keyset, para ser estável.
- **Nullability com intenção**: \`!\` só onde o campo sempre existe; um campo nulo por falha parcial não derruba a resposta inteira.
- **Erros**: falhas técnicas vão em \`errors\` com \`extensions.code\` (ex.: \`UNAUTHENTICATED\`); erros de **negócio** esperados entram no schema como union de resultados, para o cliente tratar com tipagem.
- **Mutations** com nome de intenção (\`approveTrip\`, não \`updateTrip(status:)\`), com input e payload próprios.
- **Evolução**: adicionar campos é seguro; remover exige \`@deprecated\` e métricas de uso por campo (o Apollo Studio/GraphOS mostra isso).

**Autorização** fica na camada de **negócio** (caso de uso ou serviço), não espalhada nos resolvers: o resolver só repassa \`ctx.user\`. Assim a mesma regra vale para REST, GraphQL e jobs. A autenticação acontece antes, na criação do context. Para campos sensíveis, uma diretiva (\`@auth\`) ajuda, mas não substitui a regra no domínio.

Proteções de produção: limite de profundidade e complexidade, persisted queries, desabilitar introspection em produção pública, DataLoader por requisição.`,
      en: `**Schema first**, designed around client use cases, not as a mirror of the tables.

- **Pagination** with the Relay *connection* pattern: \`edges\`, \`cursor\`, \`pageInfo\`. An opaque, keyset-based cursor so it stays stable.
- **Intentional nullability**: \`!\` only where the field always exists; a field that is null because of a partial failure does not bring down the whole response.
- **Errors**: technical failures go in \`errors\` with \`extensions.code\` (e.g. \`UNAUTHENTICATED\`); expected **business** errors live in the schema as a result union, so clients handle them with types.
- **Mutations** named for intent (\`approveTrip\`, not \`updateTrip(status:)\`), with their own input and payload.
- **Evolution**: adding fields is safe; removing them requires \`@deprecated\` and per-field usage metrics (Apollo Studio/GraphOS shows these).

**Authorization** lives in the **business layer** (use case or service), not scattered across resolvers: the resolver just passes \`ctx.user\` along. That way the same rule applies to REST, GraphQL, and jobs. Authentication happens earlier, when building the context. For sensitive fields an \`@auth\` directive helps, but it does not replace the domain rule.

Production safeguards: depth and complexity limits, persisted queries, introspection disabled on public production, and a per-request DataLoader.`,
    },
    follow: [
      { pt: 'Como você faria subscriptions para atualizar o status da viagem em tempo real?', en: 'How would you do subscriptions to push trip status updates in real time?' },
      { pt: 'O que é Apollo Federation e quando faria sentido?', en: 'What is Apollo Federation and when would it make sense?' },
    ],
    flags: {
      pt: 'Gerar o schema direto do banco e expor todas as colunas. Ou checar permissão só no front.',
      en: 'Generating the schema straight from the database and exposing every column. Or checking permissions only on the frontend.',
    },
    anchor: {
      pt: 'O modelo de viagens e aprovação é o do TripFlow (REST em Laravel). Mostre que você sabe expor o mesmo domínio em GraphQL mantendo a regra no caso de uso. Se fizer uma camada GraphQL sobre o TripFlow ou um BFF no PulseOps, isso vira evidência real.',
      en: 'The trips-and-approval model is TripFlow\'s (REST in Laravel). Show you can expose the same domain in GraphQL while keeping the rule in the use case. Building a GraphQL layer over TripFlow or a BFF in PulseOps would turn this into real evidence.',
    },
  },
  {
    id: 'socketio-auth-redis-adapter',
    cat: 'api', type: 'code', jobs: ['sr-node-react'],
    tags: ['Socket.IO', 'WebSockets', 'Redis adapter', 'rooms', 'authentication', 'horizontal scaling'],
    q: {
      pt: 'Implemente um servidor Socket.IO que autentica no handshake, coloca o usuário na sala da empresa e funciona com várias instâncias.',
      en: 'Implement a Socket.IO server that authenticates at the handshake, puts the user in their company room, and works across multiple instances.',
    },
    code: {
      src: `
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);

const io = new Server(httpServer, {
  adapter: createAdapter(pub, sub),          // eventos atravessam todas as instâncias
  cors: { origin: ['https://app.example.com'], credentials: true },
  connectionStateRecovery: { maxDisconnectionDuration: 2 * 60_000 }, // recupera eventos perdidos
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    socket.data.user = await verifyAccessToken(token);   // assinatura, exp, aud
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  const { companyId, id } = socket.data.user;
  socket.join(\`company:\${companyId}\`);              // sala decidida pelo servidor, nunca pelo cliente

  socket.on('trip:watch', async (tripId, ack) => {
    if (!(await canView(socket.data.user, tripId))) return ack({ ok: false });
    socket.join(\`trip:\${tripId}\`);
    ack({ ok: true });
  });
});

// em qualquer instância, depois do commit (ex.: consumidor do RabbitMQ)
export function notifyTripApproved(trip) {
  io.to(\`company:\${trip.companyId}\`).emit('trip:approved', { id: trip.id });
}`,
    },
    a: {
      pt: `Pontos que o código mostra:

- **Autenticação no handshake** com middleware \`io.use\`: token validado antes de aceitar a conexão; o usuário fica em \`socket.data\`.
- **Autorização por sala**: o servidor decide em quais salas o socket entra, com base no usuário autenticado. Um pedido para assistir uma viagem é checado antes do \`join\`.
- **Escala horizontal** com o **Redis adapter**: um \`emit\` numa instância é publicado no Redis e entregue pelos nós que têm sockets naquela sala. Se usar fallback de long-polling, o load balancer precisa de sticky sessions.
- **Recuperação**: \`connectionStateRecovery\` reenvia eventos perdidos em quedas curtas; para quedas longas, o cliente refaz a consulta do estado atual (fonte da verdade é a API, o socket só avisa).
- **Emitir depois do commit**, idealmente a partir de um consumidor de eventos, para não avisar sobre algo que fez rollback.
- **ack** para o cliente saber que o servidor processou o pedido.

Também: limite de eventos por conexão (rate limit), validação do payload de cada evento, heartbeat (já embutido no Socket.IO) e métricas de conexões ativas por instância.`,
      en: `What the code shows:

- **Handshake authentication** with \`io.use\` middleware: the token is validated before accepting the connection; the user lives in \`socket.data\`.
- **Room-level authorization**: the server decides which rooms a socket joins, based on the authenticated user. A request to watch a trip is checked before \`join\`.
- **Horizontal scaling** with the **Redis adapter**: an \`emit\` on one instance is published to Redis and delivered by the nodes holding sockets in that room. With a long-polling fallback, the load balancer needs sticky sessions.
- **Recovery**: \`connectionStateRecovery\` replays missed events after short drops; after long drops, the client refetches current state (the API is the source of truth; the socket only notifies).
- **Emit after commit**, ideally from an event consumer, so you never announce something that rolled back.
- **acks** so the client knows the server processed the request.

Also: per-connection event limits (rate limiting), payload validation for each event, heartbeats (built into Socket.IO), and metrics for active connections per instance.`,
    },
    follow: [
      { pt: 'Por que não confiar no `companyId` enviado pelo cliente para entrar na sala?', en: 'Why not trust a client-sent `companyId` to join the room?' },
      { pt: 'Como você testaria esse servidor?', en: 'How would you test this server?' },
    ],
    flags: {
      pt: 'Aceitar `socket.emit("join", roomName)` do cliente sem checar permissão. Ou emitir dentro da transação do banco.',
      en: 'Accepting `socket.emit("join", roomName)` from the client without a permission check. Or emitting inside the database transaction.',
    },
    anchor: {
      pt: 'Conecte com o que você já fez: no Bora o Realtime do Supabase aplica as políticas do PostgreSQL ao que cada usuário recebe (mesma ideia de autorização por canal); no TripFlow os eventos saem depois do commit via outbox. Socket.IO em si é lacuna: diga isso.',
      en: 'Connect it to what you have done: in Bora, Supabase Realtime applies PostgreSQL policies to what each user receives (same idea as per-channel authorization); in TripFlow events leave after commit via the outbox. Socket.IO itself is a gap: say so.',
    },
  },
];
