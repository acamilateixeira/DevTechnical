export default [
  {
    id: 'mq-outbox-pattern',
    cat: 'messaging', type: 'architecture', jobs: ['sr-node-react', 'cv'],
    tags: ['outbox', 'dual write', 'RabbitMQ', 'at-least-once', 'idempotent consumer', 'CDC'],
    q: {
      pt: 'Você salva um pedido no banco e publica um evento no RabbitMQ. O que pode dar errado e como resolver?',
      en: 'You save an order to the database and publish an event to RabbitMQ. What can go wrong and how do you fix it?',
    },
    code: {
      src: `
// Mesma transação: estado + evento
await db.transaction(async (tx) => {
  await tx.trip.update({ where: { id }, data: { status: 'APPROVED' } });
  await tx.outbox.create({
    data: { id: uuid(), type: 'trip.approved', payload: { tripId: id }, publishedAt: null },
  });
});

// Relay (processo separado): lê pendentes e publica
setInterval(async () => {
  const batch = await db.$queryRaw\`
    SELECT * FROM outbox WHERE published_at IS NULL
    ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED\`;
  for (const msg of batch) {
    await channel.publish('trips', msg.type, Buffer.from(JSON.stringify(msg.payload)), {
      messageId: msg.id, persistent: true,
    });
    await db.outbox.update({ where: { id: msg.id }, data: { publishedAt: new Date() } });
  }
}, 1000);

// Consumidor idempotente
channel.consume('notify-approver', async (m) => {
  const inserted = await db.processedMessage.createMany({
    data: [{ id: m.properties.messageId }], skipDuplicates: true,
  });
  if (inserted.count === 1) await sendEmail(JSON.parse(m.content.toString()));
  channel.ack(m);
});`,
    },
    a: {
      pt: `É o problema do **dual write**: banco e broker não participam da mesma transação.

- Salvou no banco, caiu antes de publicar → evento perdido; outro serviço nunca fica sabendo.
- Publicou antes do commit e o commit falhou → evento "fantasma" de algo que não existe.

**Transactional Outbox**: grava a mudança de estado e o evento numa tabela \`outbox\` **na mesma transação**. Um relay separado lê os pendentes e publica, marcando como publicado depois da confirmação (publisher confirms no RabbitMQ). Alternativa ao polling: CDC lendo o log do banco (Debezium).

Isso dá **at-least-once**: se o relay cair entre publicar e marcar, o evento sai de novo. Por isso o consumidor precisa ser **idempotente**: guardar o \`messageId\` processado com constraint única (inbox/deduplicação) ou tornar o efeito naturalmente idempotente. "Exactly-once" de ponta a ponta na prática é **at-least-once + idempotência**.

\`FOR UPDATE SKIP LOCKED\` permite várias instâncias do relay sem pegar a mesma linha. Se a ordem importa por agregado, particione por chave.`,
      en: `This is the **dual write** problem: the database and the broker do not share a transaction.

- Saved to the database, crashed before publishing → event lost; other services never find out.
- Published before commit and the commit failed → a "ghost" event about something that does not exist.

**Transactional Outbox**: write the state change and the event to an \`outbox\` table **in the same transaction**. A separate relay reads pending rows and publishes, marking them published after confirmation (publisher confirms in RabbitMQ). An alternative to polling: CDC reading the database log (Debezium).

This gives **at-least-once**: if the relay crashes between publishing and marking, the event goes out again. So the consumer must be **idempotent**: store the processed \`messageId\` under a unique constraint (inbox/dedup) or make the effect naturally idempotent. End-to-end "exactly-once" in practice is **at-least-once + idempotency**.

\`FOR UPDATE SKIP LOCKED\` lets several relay instances run without grabbing the same row. If ordering matters per aggregate, partition by key.`,
    },
    follow: [
      { pt: 'Por que não usar transação distribuída (2PC/XA)?', en: 'Why not use a distributed transaction (2PC/XA)?' },
      { pt: 'Como você limpa a tabela de outbox sem ela crescer para sempre?', en: 'How do you clean the outbox table so it does not grow forever?' },
    ],
    flags: {
      pt: '"Publico dentro da transação do banco." Ou prometer exactly-once sem idempotência no consumidor.',
      en: '"I publish inside the database transaction." Or promising exactly-once without consumer idempotency.',
    },
    anchor: {
      pt: 'Sua melhor resposta do banco: o TripFlow grava estado + evento na outbox na mesma transação, um relay publica no RabbitMQ depois do commit e o consumidor deduplica reentregas pelo ID. Mencione que os ADRs do repo documentam o trade-off. O MeterTrail reforça com projeção + checkpoint e reprocessamento sem contar duas vezes.',
      en: 'One of your best answers: TripFlow writes state + event to the outbox in one transaction, a relay publishes to RabbitMQ after commit, and the consumer deduplicates redeliveries by ID. Mention the repo ADRs document the trade-off. MeterTrail reinforces it with projection + checkpoint and replay without double counting.',
    },
  },
  {
    id: 'mq-rabbitmq-concepts',
    cat: 'messaging', type: 'lib', jobs: ['sr-node-react'],
    tags: ['RabbitMQ', 'exchange', 'routing key', 'DLQ', 'prefetch', 'ack', 'Kafka'],
    q: {
      pt: 'Explique exchanges, filas e bindings no RabbitMQ, ack/nack, prefetch e dead-letter queue. Quando você usaria Kafka no lugar?',
      en: 'Explain exchanges, queues, and bindings in RabbitMQ, ack/nack, prefetch, and dead-letter queues. When would you use Kafka instead?',
    },
    a: {
      pt: `Produtores publicam em **exchanges**, nunca direto na fila. **Bindings** ligam filas a exchanges com uma regra:

- **direct**: routing key exata.
- **topic**: padrões (\`trip.*\`, \`trip.#\`), o mais usado para eventos de domínio.
- **fanout**: broadcast para todas as filas ligadas.
- **headers**: por cabeçalhos.

**Ack manual**: o consumidor confirma depois de processar. Se o consumidor morrer sem ack, a mensagem volta para a fila (por isso a idempotência). \`nack\` com \`requeue=false\` manda para a **DLX/DLQ**. **Prefetch** (\`basic.qos\`) limita quantas mensagens sem ack cada consumidor segura: evita que um consumidor pegue tudo e controla a concorrência.

**Retry**: não fazer requeue imediato infinito (poison message em loop). Usar filas de retry com TTL e backoff, contar tentativas no header e mandar para a DLQ depois de N, com alerta. Mensagens e filas **duráveis** + publisher confirms para não perder em restart. **Quorum queues** para alta disponibilidade.

**Kafka** é um log distribuído e persistente: consumidores leem por offset e podem **reprocessar o histórico**, ordem garantida por partição, throughput altíssimo. Uso Kafka para event streaming, event sourcing, analytics e vários consumidores independentes relendo os mesmos eventos. RabbitMQ para filas de trabalho, roteamento flexível e comandos entre serviços.`,
      en: `Producers publish to **exchanges**, never directly to queues. **Bindings** connect queues to exchanges with a rule:

- **direct**: exact routing key.
- **topic**: patterns (\`trip.*\`, \`trip.#\`), the most common for domain events.
- **fanout**: broadcast to every bound queue.
- **headers**: by headers.

**Manual ack**: the consumer confirms after processing. If it dies without acking, the message goes back to the queue (hence idempotency). \`nack\` with \`requeue=false\` sends it to the **DLX/DLQ**. **Prefetch** (\`basic.qos\`) caps unacked messages per consumer: it stops one consumer from grabbing everything and controls concurrency.

**Retry**: never requeue immediately forever (a poison message loops). Use retry queues with TTL and backoff, count attempts in a header, and send to the DLQ after N tries, with an alert. **Durable** queues and messages plus publisher confirms so nothing is lost on restart. **Quorum queues** for high availability.

**Kafka** is a distributed, persistent log: consumers read by offset and can **replay history**, ordering is guaranteed per partition, and throughput is very high. I use Kafka for event streaming, event sourcing, analytics, and many independent consumers rereading the same events. RabbitMQ for work queues, flexible routing, and commands between services.`,
    },
    follow: [
      { pt: 'Como garantir ordem de processamento das mensagens de um mesmo pedido?', en: 'How do you guarantee processing order for messages of the same order?' },
      { pt: 'Como você monitora uma fila? Quais métricas alertam?', en: 'How do you monitor a queue? Which metrics trigger alerts?' },
    ],
    flags: {
      pt: 'Auto-ack em processamento que pode falhar. Ou "coloco requeue=true quando dá erro".',
      en: 'Auto-ack on processing that can fail. Or "I set requeue=true on error".',
    },
    anchor: {
      pt: 'RabbitMQ está no TripFlow e listado no seu portfólio em "Filas e mensageria". Abra o repositório antes da entrevista e revise que tipo de exchange, routing keys e política de retry você usou. Responda com o que está lá, não com teoria genérica.',
      en: 'RabbitMQ is in TripFlow and listed on your portfolio under "Queues & messaging". Open the repo before the interview and review which exchange type, routing keys, and retry policy you used. Answer with what is there, not generic theory.',
    },
  },
];
