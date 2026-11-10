export default [
  {
    id: 'db-isolation-locks',
    cat: 'data', type: 'concept', jobs: ['brainrocket', 'elastic', 'cv'],
    tags: ['transactions', 'ACID', 'isolation levels', 'SELECT FOR UPDATE', 'deadlock', 'race condition'],
    q: {
      pt: 'Dois gestores aprovam viagens ao mesmo tempo contra o mesmo orçamento. Como você evita que o saldo fique negativo? Explique níveis de isolamento.',
      en: 'Two managers approve trips at the same time against the same budget. How do you prevent the balance from going negative? Explain isolation levels.',
    },
    code: {
      src: `
-- Pessimista: trava a linha até o commit
BEGIN;
SELECT balance_cents FROM cost_centers WHERE id = :id FOR UPDATE;
-- a aplicação confere: balance_cents >= :amount ?
UPDATE cost_centers SET balance_cents = balance_cents - :amount WHERE id = :id;
UPDATE trips SET status = 'approved' WHERE id = :trip AND status = 'pending';
COMMIT;

-- Alternativa atômica sem SELECT prévio
UPDATE cost_centers
   SET balance_cents = balance_cents - :amount
 WHERE id = :id AND balance_cents >= :amount;   -- 0 linhas afetadas = sem saldo

-- Otimista: coluna de versão
UPDATE trips SET status = 'approved', version = version + 1
 WHERE id = :trip AND version = :expectedVersion; -- 0 linhas = alguém mudou antes, retry`,
    },
    a: {
      pt: `É um **lost update** clássico: os dois leem saldo 1000, os dois aprovam 800, os dois gravam. Soluções:

- **Lock pessimista** (\`SELECT ... FOR UPDATE\`): a segunda transação espera a primeira commitar e lê o saldo atualizado. Bom quando há disputa frequente pelo mesmo registro.
- **Update condicional atômico**: a própria condição do \`WHERE\` garante a regra; conferir as linhas afetadas.
- **Lock otimista** (coluna \`version\`): sem espera, detecta conflito e faz retry. Bom quando conflitos são raros.
- Constraint no banco (\`CHECK (balance_cents >= 0)\`) como última linha de defesa.

**Níveis de isolamento** (do mais fraco ao mais forte): *Read Uncommitted* (dirty reads), *Read Committed* (padrão do PostgreSQL e SQL Server; evita dirty read, permite non-repeatable read), *Repeatable Read* (padrão do MySQL/InnoDB; evita non-repeatable read; no InnoDB o MVCC e os gap locks também evitam a maioria dos phantoms), *Serializable* (como se fossem em série; pode abortar transações com erro de serialização, que você precisa tratar com retry).

Cuidados: manter transações curtas, nunca chamar API externa com transação aberta, adquirir locks sempre na mesma ordem para evitar **deadlock** e tratar deadlock com retry.`,
      en: `It is a classic **lost update**: both read balance 1000, both approve 800, both write. Fixes:

- **Pessimistic lock** (\`SELECT ... FOR UPDATE\`): the second transaction waits for the first to commit and reads the updated balance. Good when the same row is frequently contended.
- **Atomic conditional update**: the \`WHERE\` condition itself enforces the rule; check affected rows.
- **Optimistic lock** (a \`version\` column): no waiting, detect the conflict and retry. Good when conflicts are rare.
- A database constraint (\`CHECK (balance_cents >= 0)\`) as the last line of defense.

**Isolation levels** (weakest to strongest): *Read Uncommitted* (dirty reads), *Read Committed* (PostgreSQL and SQL Server default; no dirty reads, allows non-repeatable reads), *Repeatable Read* (MySQL/InnoDB default; no non-repeatable reads; in InnoDB, MVCC and gap locks also prevent most phantoms), *Serializable* (as if run one after another; may abort transactions with serialization errors you must retry).

Caveats: keep transactions short, never call an external API with a transaction open, always acquire locks in the same order to avoid **deadlocks**, and retry on deadlock.`,
    },
    follow: [
      { pt: 'O que é MVCC e por que leituras não bloqueiam escritas no PostgreSQL?', en: 'What is MVCC and why do reads not block writes in PostgreSQL?' },
      { pt: 'E se o orçamento estiver em outro serviço, com outro banco?', en: 'What if the budget lives in another service with its own database?' },
    ],
    flags: {
      pt: 'Resolver com verificação só na aplicação (`if (saldo >= valor)`) sem lock ou condição atômica. Ou "uso Serializable em tudo".',
      en: 'Solving it with an application-only check (`if (balance >= amount)`) without a lock or atomic condition. Or "I use Serializable everywhere".',
    },
    anchor: {
      pt: 'É literalmente o TripFlow: você bloqueia a linha do centro de custo no MySQL e confere o orçamento dentro da transação. Some a isso o histórico em sistemas financeiros na Sicoob, onde dado errado custa mais que atraso, como está no seu portfólio.',
      en: 'This is literally TripFlow: you lock the cost-center row in MySQL and check the budget inside the transaction. Add your financial-systems background at Sicoob, where wrong data costs more than a late delivery, as your portfolio says.',
    },
  },
  {
    id: 'db-indexes-explain',
    cat: 'data', type: 'concept', jobs: ['brainrocket', 'elastic', 'cv'],
    tags: ['indexes', 'B-tree', 'composite index', 'EXPLAIN', 'query optimization', 'covering index'],
    q: {
      pt: 'Uma query que filtra por `company_id`, `status` e ordena por `created_at` ficou lenta com 20 milhões de linhas. Como você investiga e que índice cria?',
      en: 'A query that filters by `company_id` and `status` and sorts by `created_at` got slow at 20 million rows. How do you investigate and what index do you create?',
    },
    code: {
      src: `
EXPLAIN ANALYZE
SELECT id, title, created_at
  FROM trips
 WHERE company_id = 42 AND status = 'pending'
 ORDER BY created_at DESC
 LIMIT 50;

-- Igualdade primeiro, depois a coluna de ordenação
CREATE INDEX idx_trips_company_status_created
    ON trips (company_id, status, created_at DESC);

-- "Covering": inclui as colunas lidas e evita ir à tabela (PostgreSQL)
CREATE INDEX idx_trips_cover
    ON trips (company_id, status, created_at DESC) INCLUDE (title);`,
    },
    a: {
      pt: `**Investigar:** \`EXPLAIN ANALYZE\` para ver o plano real (Seq Scan? Sort em disco? linhas estimadas vs reais muito diferentes indicam estatísticas desatualizadas), slow query log, \`pg_stat_statements\` ou Performance Schema para achar as queries mais caras no total, e não só a mais lenta uma vez.

**Índice composto** segue a regra do prefixo mais à esquerda: colunas de **igualdade** primeiro, depois a de **range/ordenação**. Com \`(company_id, status, created_at)\` o banco vai direto ao trecho certo, já ordenado, e para no \`LIMIT 50\` sem ordenar nada.

Pontos que mostram senioridade:

- Índice tem custo: cada INSERT/UPDATE atualiza todos os índices; índice demais mata a escrita.
- Funções na coluna (\`WHERE DATE(created_at) = ...\`) e \`LIKE '%x'\` impedem o uso do índice.
- Seletividade importa: índice só em \`status\` com 3 valores raramente ajuda.
- Em produção, criar com \`CREATE INDEX CONCURRENTLY\` (PostgreSQL) ou online DDL (MySQL) para não travar a tabela.
- Se a tela pagina fundo, trocar offset por keyset.`,
      en: `**Investigate:** \`EXPLAIN ANALYZE\` for the real plan (Seq Scan? On-disk sort? Estimated vs actual rows far apart suggests stale statistics), the slow query log, and \`pg_stat_statements\` or Performance Schema to find the queries that cost the most in total, not just the slowest single run.

A **composite index** follows the leftmost-prefix rule: **equality** columns first, then the **range/sort** column. With \`(company_id, status, created_at)\` the database jumps straight to the right slice, already sorted, and stops at \`LIMIT 50\` without sorting anything.

Points that show seniority:

- Indexes cost something: every INSERT/UPDATE maintains every index; too many indexes kill writes.
- Functions on the column (\`WHERE DATE(created_at) = ...\`) and \`LIKE '%x'\` prevent index use.
- Selectivity matters: an index on \`status\` alone with 3 values rarely helps.
- In production, create it with \`CREATE INDEX CONCURRENTLY\` (PostgreSQL) or online DDL (MySQL) to avoid locking the table.
- If the screen pages deep, switch offset to keyset.`,
    },
    follow: [
      { pt: 'O que é um índice parcial e quando usaria aqui?', en: 'What is a partial index and when would you use one here?' },
      { pt: 'Quando particionar a tabela em vez de só indexar?', en: 'When would you partition the table instead of just indexing?' },
    ],
    flags: {
      pt: '"Crio um índice para cada coluna." Ou otimizar sem olhar o plano de execução.',
      en: '"I create one index per column." Or optimizing without looking at the execution plan.',
    },
    anchor: {
      pt: 'Seu portfólio lista "modelagem e otimização de consultas" e você trabalhou com MySQL, SQL Server, PostgreSQL e Oracle/PL/SQL. Tenha pronto um caso real de query que você otimizou (o que estava lento, o que viu no plano, o resultado). Se não tiver números exatos, diga a ordem de grandeza honestamente.',
      en: 'Your portfolio lists "data modeling and query optimization" and you have worked with MySQL, SQL Server, PostgreSQL, and Oracle/PL/SQL. Have a real query-optimization story ready (what was slow, what the plan showed, the outcome). If you lack exact numbers, give an honest order of magnitude.',
    },
  },
  {
    id: 'db-mongo-vs-sql',
    cat: 'data', type: 'architecture', jobs: ['brainrocket'],
    tags: ['MongoDB', 'MySQL', 'NoSQL', 'document model', 'embedding', 'schema design'],
    q: {
      pt: 'A vaga pede MongoDB e MySQL. Quando você escolhe cada um? Como modela relacionamentos no Mongo: embutir ou referenciar?',
      en: 'The role asks for MongoDB and MySQL. When do you choose each? How do you model relationships in Mongo: embed or reference?',
    },
    a: {
      pt: `**Relacional (MySQL/PostgreSQL)**: dados muito relacionados, integridade forte (FKs, constraints), transações envolvendo várias entidades, relatórios com joins arbitrários. Dinheiro, estoque e orçamento ficam aqui.

**MongoDB (documento)**: agregados lidos e gravados juntos, schema que varia por registro, alto volume de escrita com sharding horizontal nativo. Catálogo de produtos com atributos variáveis, eventos, perfis e conteúdo.

**Modelagem no Mongo** parte dos **padrões de acesso**, não da normalização:

- **Embutir** quando o filho pertence ao pai, é lido junto e é limitado (endereços de um usuário, itens de um pedido). Uma leitura, atualização atômica do documento.
- **Referenciar** quando o relacionamento é muitos-para-muitos, cresce sem limite (comentários infinitos estouram o limite de 16 MB do documento) ou o filho é acessado sozinho.
- Padrões híbridos: *extended reference* (copiar só os campos necessários), *bucket* para séries temporais.

Mongo tem transações multi-documento desde a 4.0, mas se você precisa delas o tempo todo, o modelo provavelmente é relacional. Indexação, \`explain()\` e aggregation pipeline funcionam como os equivalentes no SQL.`,
      en: `**Relational (MySQL/PostgreSQL)**: highly related data, strong integrity (FKs, constraints), transactions spanning several entities, reports with arbitrary joins. Money, inventory, and budgets live here.

**MongoDB (document)**: aggregates read and written together, schemas that vary per record, high write volume with native horizontal sharding. Product catalogs with variable attributes, events, profiles, and content.

**Mongo modeling** starts from **access patterns**, not normalization:

- **Embed** when the child belongs to the parent, is read with it, and is bounded (a user's addresses, an order's line items). One read, atomic document update.
- **Reference** when the relationship is many-to-many, grows without bound (endless comments break the 16 MB document limit), or the child is accessed on its own.
- Hybrid patterns: *extended reference* (copy only the needed fields), *bucket* for time series.

Mongo has had multi-document transactions since 4.0, but if you need them all the time, the model is probably relational. Indexing, \`explain()\`, and the aggregation pipeline work like their SQL counterparts.`,
    },
    follow: [
      { pt: 'Como funciona o sharding no Mongo e como escolher a shard key?', en: 'How does sharding work in Mongo and how do you pick a shard key?' },
      { pt: 'O que é write concern e read preference?', en: 'What are write concern and read preference?' },
    ],
    flags: {
      pt: '"Mongo é melhor porque não tem schema." O schema existe, só está no código. Também é ruim modelar no Mongo como se fossem tabelas com joins via `$lookup` em tudo.',
      en: '"Mongo is better because it is schemaless." The schema exists; it just lives in code. Modeling Mongo like tables with `$lookup` joins everywhere is also bad.',
    },
    anchor: {
      pt: 'MongoDB não aparece no seu CV: seja direta sobre isso. Sua força em modelagem relacional (MySQL, SQL Server, PostgreSQL, Oracle) é a base para justificar quando NÃO usar documento. O Bora usa JSON no PostgreSQL? Se sim, cite como experiência com dados semiestruturados.',
      en: 'MongoDB is not on your CV: be upfront about it. Your strength in relational modeling (MySQL, SQL Server, PostgreSQL, Oracle) is the basis for arguing when NOT to use documents. If Bora stores JSON in PostgreSQL, mention it as semi-structured data experience.',
    },
  },
  {
    id: 'redis-cache-patterns',
    cat: 'data', type: 'lib', jobs: ['brainrocket', 'cv'],
    tags: ['Redis', 'cache-aside', 'TTL', 'cache stampede', 'invalidation', 'distributed lock'],
    q: {
      pt: 'Como você usa Redis como cache? Explique cache-aside, invalidação, cache stampede e os limites de um lock distribuído.',
      en: 'How do you use Redis as a cache? Explain cache-aside, invalidation, cache stampede, and the limits of a distributed lock.',
    },
    code: {
      src: `
async function getProduct(id: string): Promise<Product> {
  const key = \`product:v2:\${id}\`;               // versão no prefixo facilita invalidar em massa
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);

  // proteção contra stampede: só um processo recalcula
  const lock = await redis.set(\`\${key}:lock\`, '1', 'PX', 5000, 'NX');
  if (!lock) {
    await sleep(50);
    return getProduct(id);                        // (em produção: limite de tentativas)
  }
  try {
    const product = await db.product.findUniqueOrThrow({ where: { id } });
    const ttl = 300 + Math.floor(Math.random() * 60); // jitter evita expiração simultânea
    await redis.set(key, JSON.stringify(product), 'EX', ttl);
    return product;
  } finally {
    await redis.del(\`\${key}:lock\`);
  }
}

// na escrita: atualiza o banco, depois apaga a chave (não atualiza o cache)
await db.product.update({ where: { id }, data });
await redis.del(\`product:v2:\${id}\`);`,
    },
    a: {
      pt: `**Cache-aside** (lazy loading): a aplicação lê do cache; no miss busca no banco e grava no cache com TTL. Na escrita, atualiza o banco e **apaga** a chave (apagar é mais seguro que atualizar, porque evita gravar valor velho numa corrida entre duas escritas). Outros padrões: write-through, write-behind, read-through.

**Invalidação** é a parte difícil. Combino TTL (rede de segurança) com invalidação explícita por evento e versão no prefixo da chave.

**Cache stampede**: uma chave popular expira e mil requisições vão ao banco ao mesmo tempo. Mitigações: lock/single-flight para só um recalcular, TTL com jitter, refresh antecipado em segundo plano (stale-while-revalidate).

**Lock distribuído** com \`SET NX PX\`: útil para **coordenar** (evitar trabalho duplicado), mas não garante correção sozinho. Se o processo pausar (GC, rede) mais que o TTL, outro pega o lock e os dois agem. Para correção use fencing token ou, melhor, uma garantia no banco (constraint única, lock de linha). Ao liberar, só apague se o valor ainda for seu (script Lua comparando o token).

Outros usos de Redis: rate limiting, sessões, filas (BullMQ), pub/sub, rankings com sorted sets, contadores atômicos.`,
      en: `**Cache-aside** (lazy loading): the app reads from the cache; on a miss it loads from the database and writes to the cache with a TTL. On writes, it updates the database and **deletes** the key (deleting is safer than updating because it avoids writing a stale value when two writes race). Other patterns: write-through, write-behind, read-through.

**Invalidation** is the hard part. I combine TTL (a safety net) with explicit event-driven invalidation and a version in the key prefix.

**Cache stampede**: a hot key expires and a thousand requests hit the database at once. Mitigations: a lock/single-flight so only one recomputes, TTL jitter, early background refresh (stale-while-revalidate).

**Distributed lock** with \`SET NX PX\`: useful to **coordinate** (avoid duplicate work), but it does not guarantee correctness alone. If the process pauses (GC, network) longer than the TTL, another one takes the lock and both act. For correctness use a fencing token or, better, a database guarantee (unique constraint, row lock). When releasing, only delete it if the value is still yours (a Lua script comparing the token).

Other Redis uses: rate limiting, sessions, queues (BullMQ), pub/sub, leaderboards with sorted sets, atomic counters.`,
    },
    follow: [
      { pt: 'O que acontece com o cache se o Redis cair? O sistema deve continuar funcionando?', en: 'What happens if Redis goes down? Should the system keep working?' },
      { pt: 'Qual política de eviction você configuraria para um cache puro?', en: 'Which eviction policy would you configure for a pure cache?' },
    ],
    flags: {
      pt: '"Cacheio tudo para ficar rápido." Ou confiar num lock do Redis como única garantia de não cobrar duas vezes.',
      en: '"I cache everything to make it fast." Or trusting a Redis lock as the only guarantee against double charging.',
    },
    anchor: {
      pt: 'TripFlow: o lock no Redis coordena chamadas concorrentes de reserva, mas a garantia final está no MySQL e na Idempotency-Key. Isso mostra exatamente a nuance "lock coordena, banco garante". Muito forte para a BrainRocket, que pede Redis.',
      en: 'TripFlow: the Redis lock coordinates concurrent booking calls, but the final guarantee lives in MySQL and the Idempotency-Key. That shows exactly the "lock coordinates, database guarantees" nuance. Very strong for BrainRocket, which asks for Redis.',
    },
  },
  {
    id: 'mongo-aggregation-esr',
    cat: 'data', type: 'code', jobs: ['brainrocket'],
    tags: ['MongoDB', 'aggregation pipeline', 'indexes', 'ESR rule', 'explain', '$lookup'],
    q: {
      pt: 'No MongoDB, escreva uma agregação com o total gasto por centro de custo no mês, só de viagens aprovadas, e diga que índice criaria.',
      en: 'In MongoDB, write an aggregation for total spend per cost center this month, only for approved trips, and say which index you would create.',
    },
    code: {
      src: `
db.trips.aggregate([
  { $match: {                                     // primeiro: filtra usando índice
      companyId: ObjectId('...'),
      status: 'APPROVED',
      approvedAt: { $gte: ISODate('2026-11-01'), $lt: ISODate('2026-12-01') },
  } },
  { $group: {
      _id: '$costCenterId',
      totalCents: { $sum: '$costCents' },
      trips: { $sum: 1 },
  } },
  { $sort: { totalCents: -1 } },
  { $limit: 20 },
  { $lookup: {                                    // só depois de reduzir: 20 lookups, não 20 mil
      from: 'costCenters', localField: '_id', foreignField: '_id', as: 'costCenter',
  } },
  { $unwind: '$costCenter' },
  { $project: { _id: 0, name: '$costCenter.name', totalCents: 1, trips: 1 } },
]);

// Regra ESR: Equality → Sort → Range
db.trips.createIndex({ companyId: 1, status: 1, approvedAt: 1 });

db.trips.explain('executionStats').aggregate([...]); // IXSCAN, não COLLSCAN; docs examinados ≈ retornados`,
    },
    a: {
      pt: `O **aggregation pipeline** processa documentos em estágios, como um pipe. A ordem importa para performance:

1. \`$match\` (e \`$sort\` se houver) **no início**, para usar índice e reduzir o volume cedo.
2. \`$group\` para agregar (\`$sum\`, \`$avg\`, \`$push\`).
3. \`$sort\` + \`$limit\` juntos (o Mongo otimiza para top-N).
4. \`$lookup\` (o "join") **depois** de reduzir, porque ele roda por documento.
5. \`$project\` para devolver só o necessário.

**Índice** pela regra **ESR**: campos de **igualdade** primeiro (\`companyId\`, \`status\`), depois os de **ordenação**, depois os de **intervalo** (\`approvedAt\`). É o mesmo raciocínio do índice composto em SQL.

Valido com \`explain('executionStats')\`: quero \`IXSCAN\` em vez de \`COLLSCAN\` e \`totalDocsExamined\` próximo de \`nReturned\`. Limites a lembrar: cada estágio tem limite de 100 MB de memória (\`allowDiskUse\` para passar, com custo), e o documento final tem limite de 16 MB.

Se esse relatório roda o tempo todo, a alternativa é manter um agregado pré-calculado (contador por centro de custo atualizado por evento) ou mandar para um banco analítico, em vez de agregar milhões de documentos a cada tela.`,
      en: `The **aggregation pipeline** processes documents in stages, like a pipe. Order matters for performance:

1. \`$match\` (and \`$sort\`, if any) **first**, to use an index and shrink volume early.
2. \`$group\` to aggregate (\`$sum\`, \`$avg\`, \`$push\`).
3. \`$sort\` + \`$limit\` together (Mongo optimizes top-N).
4. \`$lookup\` (the "join") **after** reducing, because it runs per document.
5. \`$project\` to return only what is needed.

**Index** by the **ESR** rule: **equality** fields first (\`companyId\`, \`status\`), then **sort** fields, then **range** fields (\`approvedAt\`). Same reasoning as a composite SQL index.

I validate with \`explain('executionStats')\`: I want \`IXSCAN\` instead of \`COLLSCAN\` and \`totalDocsExamined\` close to \`nReturned\`. Limits to remember: each stage has a 100 MB memory cap (\`allowDiskUse\` to go past it, at a cost), and the final document is capped at 16 MB.

If this report runs constantly, the alternative is a precomputed aggregate (a per-cost-center counter updated by events) or an analytics store, instead of aggregating millions of documents on every page load.`,
    },
    follow: [
      { pt: 'Como fica a mesma consulta em SQL?', en: 'What does the same query look like in SQL?' },
      { pt: 'Por que um `$lookup` no começo do pipeline é perigoso?', en: 'Why is a `$lookup` at the start of the pipeline dangerous?' },
    ],
    flags: {
      pt: 'Colocar `$lookup` antes do `$match`. Ou não saber que agregação também precisa de índice.',
      en: 'Putting `$lookup` before `$match`. Or not knowing aggregations need indexes too.',
    },
    anchor: {
      pt: 'MongoDB é lacuna. A ponte honesta e forte: a mesma lógica de índice composto e de filtrar antes de juntar que você aplica em SQL (MySQL, SQL Server, Oracle, PostgreSQL). Responda primeiro em SQL, que você domina, e depois traduza para o pipeline.',
      en: 'MongoDB is a gap. The honest, strong bridge: the same composite-index and filter-before-join logic you apply in SQL (MySQL, SQL Server, Oracle, PostgreSQL). Answer in SQL first, which you master, then translate to the pipeline.',
    },
  },
  {
    id: 'mongo-replication-consistency',
    cat: 'data', type: 'concept', jobs: ['brainrocket'],
    tags: ['MongoDB', 'replica set', 'write concern', 'read concern', 'sharding', 'shard key', 'transactions'],
    q: {
      pt: 'Explique replica set, write concern, read concern e sharding no MongoDB. Como você escolhe a shard key?',
      en: 'Explain replica sets, write concern, read concern, and sharding in MongoDB. How do you choose a shard key?',
    },
    a: {
      pt: `**Replica set**: um primário recebe as escritas e secundários replicam pelo oplog. Se o primário cai, uma eleição promove um secundário (failover automático). Serve para **disponibilidade**, não para escalar escrita.

**Write concern** define quando a escrita é confirmada: \`w: 1\` (só o primário, rápido, pode perder dados num failover) ou \`w: 'majority'\` (maioria dos nós, sobrevive ao failover; padrão atual). \`j: true\` exige escrita no journal.

**Read concern / read preference**: \`readConcern: 'majority'\` só lê dados confirmados pela maioria (não volta atrás após failover). Ler de secundários (\`secondaryPreferred\`) alivia o primário, mas pode trazer dado **desatualizado**: não serve para "ler o que acabei de escrever" sem sessões causalmente consistentes.

**Sharding** escala horizontalmente: os dados são divididos por uma **shard key** entre vários replica sets, e o \`mongos\` roteia as consultas. Boa shard key tem:

- **alta cardinalidade** e **distribuição uniforme** (sem shard quente);
- presença na maioria das consultas, para elas irem a um shard só (consultas sem a chave viram scatter-gather em todos);
- não ser monotônica (um \`_id\` ou data crescente manda todas as escritas para o último shard; usar hashed ou chave composta como \`{ companyId, createdAt }\`).

Trocar a shard key depois é caro (há resharding nas versões recentes, mas é uma operação pesada), então ela é decidida pelo padrão de acesso desde o início. **Transações** multi-documento existem, inclusive entre shards, mas têm custo de latência.`,
      en: `**Replica set**: a primary takes writes and secondaries replicate via the oplog. If the primary fails, an election promotes a secondary (automatic failover). It is for **availability**, not for scaling writes.

**Write concern** sets when a write is acknowledged: \`w: 1\` (primary only, fast, may lose data on failover) or \`w: 'majority'\` (a majority of nodes, survives failover; the current default). \`j: true\` requires a journal write.

**Read concern / read preference**: \`readConcern: 'majority'\` only reads data acknowledged by a majority (it will not roll back after failover). Reading from secondaries (\`secondaryPreferred\`) offloads the primary but can return **stale** data: it does not give you "read your own writes" without causally consistent sessions.

**Sharding** scales horizontally: data is split across several replica sets by a **shard key**, and \`mongos\` routes queries. A good shard key has:

- **high cardinality** and **even distribution** (no hot shard);
- presence in most queries, so they hit a single shard (queries without it become scatter-gather across all shards);
- no monotonic growth (an increasing \`_id\` or date sends every write to the last shard; use hashed or a compound key like \`{ companyId, createdAt }\`).

Changing the shard key later is expensive (recent versions support resharding, but it is heavy), so it is chosen from access patterns up front. Multi-document **transactions** exist, including across shards, but they cost latency.`,
    },
    follow: [
      { pt: 'Em multi-tenant, `companyId` sozinho é uma boa shard key? E se um cliente for gigante?', en: 'In multi-tenancy, is `companyId` alone a good shard key? What if one customer is huge?' },
      { pt: 'Qual o equivalente disso em MySQL (réplicas de leitura, replication lag)?', en: 'What is the MySQL equivalent (read replicas, replication lag)?' },
    ],
    flags: {
      pt: 'Dizer que replica set escala escrita. Ou escolher data de criação como shard key.',
      en: 'Saying a replica set scales writes. Or picking creation date as the shard key.',
    },
    anchor: {
      pt: 'Sem experiência com Mongo em produção, apoie-se no que conhece: réplicas e consistência você vê em bancos relacionais gerenciados (AWS/Azure), e a pergunta do tenant grande conversa com o escopo por empresa do TripFlow. Diga claramente que é estudo.',
      en: 'Without production Mongo experience, lean on what you know: replicas and consistency in managed relational databases (AWS/Azure), and the huge-tenant follow-up connects to TripFlow\'s company scoping. State clearly that this is study.',
    },
  },
];
