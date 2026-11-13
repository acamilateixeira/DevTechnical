// Backend sênior PHP + Node.js em financeiro / back-office: pagamentos, webhooks, emissão fiscal,
// integrações e modernização gradual de PHP para Node.js.

export default [
  {
    id: 'webhook-idempotent-signature',
    cat: 'api', type: 'code', jobs: ['backend-php-node'],
    tags: ['webhook', 'HMAC', 'assinatura', 'signature', 'replay', 'idempotência', 'idempotency', 'event id', 'Express'],
    q: {
      pt: 'O gateway manda o webhook de "pagamento aprovado" três vezes, e duas chegam ao mesmo tempo. Como você recebe esse webhook com segurança e sem processar duas vezes?',
      en: 'The gateway sends the "payment approved" webhook three times, and two arrive at the same moment. How do you receive it securely and without processing it twice?',
    },
    code: {
      src: `
import crypto from 'node:crypto';
import express from 'express';

const app = express();

// corpo cru: a assinatura é calculada sobre os bytes exatos que chegaram
app.post('/webhooks/gateway', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.header('X-Signature') ?? '';
  const timestamp = Number(req.header('X-Timestamp'));

  // 1. recusa mensagens antigas (replay)
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) return res.sendStatus(400);

  // 2. confere a assinatura em tempo constante
  const expected = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(\`\${timestamp}.\${req.body}\`).digest('hex');
  const ok = signature.length === expected.length
    && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!ok) return res.sendStatus(401);

  const event = JSON.parse(req.body.toString());

  // 3. registra o evento primeiro: UNIQUE(event_id) decide quem processa
  const inserted = await db.query(
    'INSERT INTO webhook_events (event_id, type, payload, status) VALUES ($1, $2, $3, $4) ON CONFLICT (event_id) DO NOTHING',
    [event.id, event.type, event, 'pending'],
  );
  if (inserted.rowCount === 0) return res.sendStatus(200);   // repetido: já recebido

  await queue.publish('payments.webhook', { eventId: event.id }); // processa fora da requisição
  return res.sendStatus(200);                                     // responde rápido
});`,
    },
    a: {
      pt: `**Segurança antes de tudo:**
- **Assinatura HMAC** sobre o corpo **cru** (os bytes que chegaram, não o JSON já interpretado), com o segredo compartilhado com o gateway, comparada com \`timingSafeEqual\` para não vazar informação pelo tempo da comparação.
- **Timestamp** dentro de uma janela (ex.: 5 minutos) para recusar a mesma mensagem reenviada depois (*replay*).
- Se o gateway oferecer, também confirmo o status consultando a API dele, em vez de confiar só no conteúdo do webhook.

**Sem processar duas vezes:**
- O gateway manda **pelo menos uma vez**, então repetição é normal.
- Gravo o evento com \`UNIQUE(event_id)\` **antes** de processar. Das duas que chegam juntas, o banco deixa só uma inserir; a outra cai no conflito e responde 200 sem fazer nada. A decisão fica no banco, não numa consulta "já existe?" que as duas fariam ao mesmo tempo.
- O processamento (atualizar o pedido, pedir a nota) vai para uma fila, e o consumidor também é idempotente: a mudança de estado só acontece se o pedido ainda estiver no estado anterior.

**Responder rápido:** o gateway costuma ter timeout curto e reenvia se não receber 2xx. Por isso a rota só valida, registra e enfileira.`,
      en: `**Security first:**
- **HMAC signature** over the **raw** body (the bytes that arrived, not the parsed JSON), with the secret shared with the gateway, compared with \`timingSafeEqual\` so timing does not leak information.
- A **timestamp** within a window (e.g. 5 minutes) to reject the same message resent later (*replay*).
- If the gateway offers it, I also confirm the status by querying its API instead of trusting only the webhook body.

**Without processing twice:**
- The gateway delivers **at least once**, so repeats are normal.
- I store the event with \`UNIQUE(event_id)\` **before** processing. Of the two that arrive together, the database lets only one insert; the other hits the conflict and returns 200 doing nothing. The decision lives in the database, not in an "already exists?" query both would run at the same time.
- Processing (updating the order, requesting the invoice) goes to a queue, and the consumer is idempotent too: the state change only happens if the order is still in the previous state.

**Respond fast:** gateways usually have short timeouts and resend without a 2xx. So the route only validates, records, and enqueues.`,
    },
    follow: [
      { pt: 'Por que a assinatura precisa do corpo cru e não do JSON já interpretado?', en: 'Why does the signature need the raw body and not the parsed JSON?' },
      { pt: 'O que você responde ao gateway se o banco estiver fora do ar?', en: 'What do you return to the gateway if the database is down?' },
    ],
    anchor: {
      pt: 'No TripFlow você já reaproveita a resposta salva para a mesma Idempotency-Key, e no MeterTrail devolve 409 para o mesmo ID com conteúdo diferente: é a base desta resposta. Assinatura HMAC de webhook, se você não implementou em produção, apresente como estudo.',
      en: 'In TripFlow you already reuse the stored response for the same Idempotency-Key, and MeterTrail returns 409 for the same id with different content: that is the base of this answer. If you have not implemented webhook HMAC signatures in production, present it as study.',
    },
    flags: {
      pt: 'Processar o pagamento dentro da requisição do webhook, sem assinatura, ou deduplicar com um SELECT antes do INSERT.',
      en: 'Processing the payment inside the webhook request, no signature, or deduplicating with a SELECT before the INSERT.',
    },
  },

  {
    id: 'order-state-machine',
    cat: 'architecture', type: 'code', jobs: ['backend-php-node', 'php-fintech'],
    tags: ['máquina de estados', 'state machine', 'transição', 'transition', 'pedido', 'order', 'nota fiscal', 'optimistic locking'],
    q: {
      pt: 'Como você modela os estados de pedido, pagamento e nota fiscal para que uma transição inválida (ex.: emitir nota de pedido não pago) seja recusada, mesmo com dois processos tentando mudar o mesmo pedido?',
      en: 'How do you model order, payment, and invoice states so an invalid transition (e.g. issuing an invoice for an unpaid order) is rejected, even with two processes changing the same order?',
    },
    code: {
      src: `
const transitions = {
  created:          ['awaiting_payment', 'canceled'],
  awaiting_payment: ['paid', 'canceled'],
  paid:             ['invoice_pending', 'refunded'],
  invoice_pending:  ['invoiced', 'invoice_failed'],
  invoice_failed:   ['invoice_pending'],          // nova tentativa
  invoiced:         ['refunded'],
} as const;

type Status = keyof typeof transitions;

async function transition(orderId: string, from: Status, to: Status, reason: string) {
  if (!(transitions[from] as readonly string[]).includes(to)) {
    throw new InvalidTransition(from, to);
  }
  // só muda se ainda estiver no estado esperado: quem chegar depois não muda nada
  const result = await db.query(
    'UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 AND status = $3',
    [to, orderId, from],
  );
  if (result.rowCount === 0) throw new StaleState(orderId, from);
  await db.query('INSERT INTO order_status_history (order_id, from_status, to_status, reason) VALUES ($1,$2,$3,$4)',
    [orderId, from, to, reason]);
}`,
    },
    a: {
      pt: `**Estados explícitos e uma tabela de transições permitidas.** Qualquer mudança passa por uma função só, que recusa o que não está na tabela. "Emitir nota" só sai de \`paid\`; "reembolsar" só de \`paid\` ou \`invoiced\`.

**Dois processos ao mesmo tempo:** o \`UPDATE ... WHERE id = ? AND status = ?\` é a trava. Só um consegue mudar de \`paid\` para \`invoice_pending\`; o outro recebe zero linhas afetadas e sabe que o estado mudou (*optimistic locking* pelo próprio status). Sem isso, dois workers poderiam pedir duas notas para o mesmo pedido.

**Histórico:** cada transição grava de onde, para onde e por quê. Isso responde "por que esse pedido está assim?" sem ler log, e ajuda na reconciliação.

**Estados para falha** (\`invoice_failed\`) são tão importantes quanto os de sucesso: um pedido pago sem nota precisa de um estado que alguém consiga listar e reprocessar, e não ficar "meio feito".

Em PHP o desenho é o mesmo: enum ou constantes, um método \`transitionTo()\` no model e o mesmo \`UPDATE\` condicional.`,
      en: `**Explicit states and a table of allowed transitions.** Every change goes through a single function that rejects anything not in the table. "Issue invoice" only leaves \`paid\`; "refund" only \`paid\` or \`invoiced\`.

**Two processes at once:** \`UPDATE ... WHERE id = ? AND status = ?\` is the lock. Only one manages to move from \`paid\` to \`invoice_pending\`; the other gets zero affected rows and knows the state changed (*optimistic locking* through the status itself). Without it, two workers could request two invoices for the same order.

**History:** each transition records from, to, and why. That answers "why is this order like this?" without reading logs, and helps reconciliation.

**Failure states** (\`invoice_failed\`) matter as much as success ones: a paid order without an invoice needs a state someone can list and reprocess, not a "half done" limbo.

In PHP the design is the same: an enum or constants, a \`transitionTo()\` method on the model, and the same conditional \`UPDATE\`.`,
    },
    follow: [
      { pt: 'Quando você usaria uma biblioteca de máquina de estados em vez de uma tabela simples?', en: 'When would you use a state machine library instead of a simple table?' },
    ],
    anchor: {
      pt: 'Se não modelou máquina de estados de pedido em produção, diga que estudou e mostre o desenho. O cuidado com consistência que você aprendeu na Sicoob é a ponte honesta.',
      en: 'If you have not modeled an order state machine in production, say you studied it and show the design. The consistency care you learned at Sicoob is the honest bridge.',
    },
    flags: {
      pt: 'Status como string livre alterado em vários lugares, ou "if status != X" espalhado pelo código.',
      en: 'Status as a free string changed in many places, or "if status != X" scattered around the code.',
    },
  },

  {
    id: 'migration-php-to-node-strangler',
    cat: 'architecture', type: 'architecture', jobs: ['backend-php-node'],
    tags: ['Strangler Fig', 'migração', 'migration', 'legado', 'legacy', 'testes de caracterização', 'characterization tests', 'feature flag', 'rollback'],
    q: {
      pt: 'O fluxo financeiro está em PHP e vai ser modernizado para Node.js. Como você migra sem parar a operação e sem mudar o comportamento que o negócio já depende?',
      en: 'The financial flow is in PHP and will be modernized to Node.js. How do you migrate without stopping operations and without changing behavior the business already relies on?',
    },
    a: {
      pt: `**Gradual, nunca reescrita de uma vez (Strangler Fig):** o sistema novo vai "envolvendo" o antigo, uma funcionalidade por vez, até o antigo não ter mais o que fazer.

1. **Mapear** o fluxo atual: entradas, saídas, tabelas, integrações e quem depende de quê.
2. **Testes de caracterização** no PHP: testes que registram o comportamento **de hoje**, inclusive o estranho, antes de mexer. Eles viram o contrato que o Node precisa cumprir.
3. **Fronteiras e contratos:** escolher uma fatia com começo e fim claros (ex.: emissão de nota) e definir a API ou o evento entre os dois lados.
4. **Um dono por tabela:** PHP e Node escrevendo as mesmas tabelas sem regra é a principal fonte de inconsistência. Durante a migração, cada dado tem um único sistema que escreve; o outro lê ou chama a API.
5. **Feature flag e rollout progressivo:** liga o caminho novo para uma porcentagem pequena, compara resultados (ou roda em "sombra", processando sem efeito e comparando) e aumenta aos poucos.
6. **Métricas lado a lado:** erros, latência e divergências do PHP contra o Node na mesma fatia.
7. **Rollback** em minutos: desligar a flag volta para o PHP.
8. Só desligo o caminho antigo depois de um período estável com os números iguais.

**O que eu perguntaria ao time:** por que Node (contratação, ecossistema, desempenho de I/O)? Isso define a ordem das fatias e o critério de "deu certo".`,
      en: `**Gradual, never a big-bang rewrite (Strangler Fig):** the new system gradually "wraps" the old one, one feature at a time, until the old one has nothing left to do.

1. **Map** the current flow: inputs, outputs, tables, integrations, and who depends on what.
2. **Characterization tests** in PHP: tests that record **today\'s** behavior, including the odd parts, before touching anything. They become the contract Node must meet.
3. **Boundaries and contracts:** pick a slice with a clear start and end (e.g. invoice issuing) and define the API or event between both sides.
4. **One owner per table:** PHP and Node writing the same tables without rules is the main source of inconsistency. During migration, each piece of data has a single writer; the other reads or calls the API.
5. **Feature flag and progressive rollout:** turn the new path on for a small percentage, compare results (or run in "shadow", processing without side effects and comparing), and ramp up.
6. **Side-by-side metrics:** errors, latency, and mismatches of PHP versus Node on the same slice.
7. **Rollback** in minutes: turning off the flag sends traffic back to PHP.
8. I only switch off the old path after a stable period with matching numbers.

**What I would ask the team:** why Node (hiring, ecosystem, I/O performance)? That shapes the order of slices and the definition of success.`,
    },
    follow: [
      { pt: 'Que métricas diriam que a migração de uma fatia deu certo?', en: 'Which metrics would tell you a slice\'s migration succeeded?' },
      { pt: 'Como você lida com uma regra de negócio que só existe no código PHP e ninguém sabe explicar?', en: 'How do you deal with a business rule that only exists in the PHP code and nobody can explain?' },
    ],
    anchor: {
      pt: 'Modernização de legado em produção é sua vivência real: legado PHP MVC na ZR System e refatoração e hotfixes na Sicoob. Conte um caso de mudança feita sem quebrar a operação.',
      en: 'Legacy modernization in production is your real experience: PHP MVC legacy at ZR System and refactoring and hotfixes at Sicoob. Tell a case of a change made without breaking operations.',
    },
    flags: {
      pt: '"Reescrevo tudo em Node e troco num fim de semana." Ou os dois sistemas escrevendo as mesmas tabelas.',
      en: '"I rewrite everything in Node and switch over a weekend." Or both systems writing the same tables.',
    },
  },

  {
    id: 'external-call-vs-db-transaction',
    cat: 'architecture', type: 'architecture', jobs: ['backend-php-node', 'php-fintech'],
    tags: ['transação', 'transaction', 'gateway', 'saga', 'compensação', 'compensation', 'reconciliação', 'reconciliation', 'outbox'],
    q: {
      pt: 'O pedido é gravado no banco e a cobrança é feita num gateway externo. Se a cobrança passa e o banco falha (ou o contrário), o que acontece? Por que a transação SQL não resolve, e como você garante consistência?',
      en: 'The order is saved in the database and the charge is made on an external gateway. If the charge goes through and the database fails (or the other way round), what happens? Why doesn\'t the SQL transaction solve it, and how do you keep things consistent?',
    },
    a: {
      pt: `**A transação SQL só protege o que está no banco.** Um ROLLBACK não desfaz uma cobrança que o gateway já fez. E chamar o gateway **dentro** da transação ainda segura travas no banco durante uma chamada de rede lenta.

**O que eu faço:**
1. **Gravo a intenção antes:** o pagamento nasce como \`pending\`, com uma **chave de idempotência** própria, numa transação curta.
2. **Chamo o gateway fora da transação**, mandando essa chave. Se eu precisar tentar de novo, o gateway reconhece a chave e não cobra duas vezes.
3. **Gravo o resultado** numa nova transação: \`approved\` ou \`declined\`.
4. **Se a resposta nunca chega** (timeout), o pagamento fica \`pending\`, e um processo consulta o status no gateway pela chave. O webhook do gateway também atualiza.
5. **Reconciliação** periódica: compara o que o gateway diz com o que o banco diz e trata as diferenças (pagamento aprovado lá e pendente aqui).
6. **Compensação** quando um passo seguinte falha de vez: se o pedido não puder ser atendido depois da cobrança, o caminho é um **estorno** no gateway, registrado como operação própria (*saga*), e não apagar o pagamento.

Para publicar eventos a partir dessas mudanças sem perder nenhum, uso o **Transactional Outbox**: o evento é gravado na mesma transação do estado e publicado depois por outro processo.`,
      en: `**The SQL transaction only protects what is in the database.** A ROLLBACK does not undo a charge the gateway already made. And calling the gateway **inside** the transaction also holds database locks during a slow network call.

**What I do:**
1. **Record the intent first:** the payment starts as \`pending\`, with its own **idempotency key**, in a short transaction.
2. **Call the gateway outside the transaction**, sending that key. If I need to retry, the gateway recognizes the key and does not charge twice.
3. **Record the result** in a new transaction: \`approved\` or \`declined\`.
4. **If the response never arrives** (timeout), the payment stays \`pending\`, and a process queries the gateway status by key. The gateway\'s webhook also updates it.
5. Periodic **reconciliation**: compares what the gateway says with what the database says and handles differences (approved there, pending here).
6. **Compensation** when a later step fails for good: if the order cannot be fulfilled after the charge, the path is a **refund** on the gateway, recorded as its own operation (*saga*), not deleting the payment.

To publish events from those changes without losing any, I use the **Transactional Outbox**: the event is written in the same transaction as the state and published later by another process.`,
    },
    follow: [
      { pt: 'Qual a diferença entre saga por orquestração e por coreografia?', en: 'What is the difference between orchestrated and choreographed sagas?' },
    ],
    anchor: {
      pt: 'O TripFlow usa lock sem segurar a transação durante a chamada ao fornecedor e grava estado + evento na outbox na mesma transação: é exatamente esse problema. Conte com detalhe.',
      en: 'TripFlow uses a lock without holding the transaction during the supplier call and writes state + event to the outbox in the same transaction: that is exactly this problem. Tell it in detail.',
    },
    flags: {
      pt: 'Chamar o gateway dentro de DB::transaction e achar que o rollback desfaz a cobrança.',
      en: 'Calling the gateway inside DB::transaction and believing the rollback undoes the charge.',
    },
  },

  {
    id: 'async-fiscal-emission-retry-dlq',
    cat: 'messaging', type: 'architecture', jobs: ['backend-php-node'],
    tags: ['nota fiscal', 'NF-e', 'fila', 'queue', 'retry', 'backoff', 'jitter', 'DLQ', 'consumidor idempotente', 'idempotent consumer'],
    q: {
      pt: 'O serviço de emissão de nota fiscal fica lento ou fora do ar. Como você desenha a emissão para não travar o pedido, não emitir duas notas e não perder nenhuma?',
      en: 'The invoice issuing service becomes slow or goes down. How do you design issuing so it does not block the order, does not issue two invoices, and does not lose any?',
    },
    a: {
      pt: `**Assíncrono, com estado:**
1. Quando o pagamento é confirmado, o pedido vai para \`invoice_pending\` e a intenção de emitir é publicada de forma confiável (outbox na mesma transação).
2. Um consumidor da fila chama o serviço fiscal com **timeout curto**.

**Sem duas notas:** a nota tem uma chave única por pedido (ex.: \`UNIQUE(order_id)\` na tabela de notas, e o número do pedido como referência no serviço fiscal). O consumidor é idempotente: se a mensagem chegar de novo, ele vê que a nota já existe ou consulta o serviço antes de pedir outra.

**Retry com critério:**
- Separo erro **temporário** (timeout, 503, fora do ar) de erro **definitivo** (dado inválido, recusa da regra fiscal).
- Temporário: nova tentativa com **backoff exponencial e jitter** (ex.: 1 min, 2, 4, 8... com variação aleatória, para não chegar todo mundo junto quando o serviço volta).
- Definitivo, ou tentativas esgotadas: a mensagem vai para a **DLQ**, o pedido vai para \`invoice_failed\` com o motivo, e alguém é avisado.

**Sem perder nenhuma:** a fila só confirma a mensagem (*ack*) depois que o resultado foi gravado. E um painel ou alerta mostra "pedidos pagos sem nota há mais de X minutos", que é a métrica que o negócio sente.

**Intervenção operacional:** reprocessar a partir da DLQ ou da lista de \`invoice_failed\`, com o mesmo consumidor idempotente.`,
      en: `**Asynchronous, with state:**
1. When payment is confirmed, the order moves to \`invoice_pending\` and the intent to issue is published reliably (outbox in the same transaction).
2. A queue consumer calls the fiscal service with a **short timeout**.

**No duplicate invoices:** the invoice has a unique key per order (e.g. \`UNIQUE(order_id)\` on the invoices table, and the order number as reference in the fiscal service). The consumer is idempotent: if the message arrives again, it sees the invoice already exists or queries the service before requesting another.

**Retry with judgment:**
- I separate **transient** errors (timeout, 503, down) from **permanent** ones (invalid data, fiscal rule rejection).
- Transient: retry with **exponential backoff and jitter** (e.g. 1 min, 2, 4, 8... with random variation, so everyone does not hit at once when the service returns).
- Permanent, or retries exhausted: the message goes to the **DLQ**, the order goes to \`invoice_failed\` with the reason, and someone is alerted.

**Nothing lost:** the queue only acknowledges the message (*ack*) after the result is recorded. A dashboard or alert shows "paid orders without an invoice for more than X minutes", the metric the business actually feels.

**Operational intervention:** reprocess from the DLQ or the \`invoice_failed\` list, with the same idempotent consumer.`,
    },
    follow: [
      { pt: 'Quando um circuit breaker ajuda aqui, além do retry?', en: 'When does a circuit breaker help here, beyond retries?' },
    ],
    anchor: {
      pt: 'O TripFlow publica no RabbitMQ depois do commit e o consumidor deduplica reentregas pelo ID. Emissão fiscal em si, se não fez, apresente como aplicação desse mesmo desenho.',
      en: 'TripFlow publishes to RabbitMQ after commit and the consumer deduplicates redeliveries by id. If you have not done invoice issuing itself, present it as an application of the same design.',
    },
    flags: {
      pt: 'Emitir a nota dentro da requisição de pagamento, ou retry infinito sem separar erro temporário de definitivo.',
      en: 'Issuing the invoice inside the payment request, or infinite retries without separating transient from permanent errors.',
    },
  },

  {
    id: 'idempotency-transaction-exactly-once',
    cat: 'messaging', type: 'concept', jobs: ['backend-php-node', 'php-fintech'],
    tags: ['idempotência', 'idempotency', 'exactly-once', 'at-least-once', 'at-most-once', 'transação', 'transaction', 'deduplicação'],
    q: {
      pt: 'Qual a diferença entre idempotência, transação e exactly-once? Dá para garantir que uma mensagem seja processada exatamente uma vez?',
      en: 'What is the difference between idempotency, a transaction, and exactly-once? Can you guarantee a message is processed exactly once?',
    },
    a: {
      pt: `- **Transação:** um grupo de mudanças **no mesmo banco** que acontece inteiro ou não acontece (ACID). Não alcança outro sistema.
- **Idempotência:** fazer a mesma operação uma vez ou várias dá o **mesmo resultado**. Na prática: uma chave (id do evento, chave de idempotência) e uma regra que reconhece a repetição.
- **Entrega:**
  - *at-most-once*: pode perder, nunca repete.
  - *at-least-once*: nunca perde, pode repetir. É o que filas e webhooks costumam oferecer.
  - *exactly-once*: cada mensagem processada uma vez só.

**Exactly-once de ponta a ponta, entre sistemas diferentes, não dá para garantir só com a entrega:** a rede pode cair depois de o consumidor processar e antes de confirmar, e a mensagem volta. O que se faz é **"efeito uma vez só"**: entrega at-least-once + consumidor idempotente. Ex.: gravar o \`event_id\` com \`UNIQUE\` na mesma transação do efeito; se a mensagem voltar, o insert falha e nada se repete.

Algumas plataformas falam em exactly-once dentro do próprio ecossistema (ex.: transações do Kafka entre tópicos), mas quando o efeito sai para um banco ou uma API externa, a idempotência volta a ser responsabilidade de quem consome.`,
      en: `- **Transaction:** a group of changes **in the same database** that happens entirely or not at all (ACID). It does not reach another system.
- **Idempotency:** doing the same operation once or many times gives the **same result**. In practice: a key (event id, idempotency key) and a rule that recognizes the repeat.
- **Delivery:**
  - *at-most-once*: may lose, never repeats.
  - *at-least-once*: never loses, may repeat. What queues and webhooks usually offer.
  - *exactly-once*: each message processed only once.

**End-to-end exactly-once across different systems cannot be guaranteed by delivery alone:** the network can drop after the consumer processes and before it acknowledges, and the message comes back. What you do is **"effectively once"**: at-least-once delivery + an idempotent consumer. E.g. store the \`event_id\` with \`UNIQUE\` in the same transaction as the effect; if the message returns, the insert fails and nothing repeats.

Some platforms talk about exactly-once inside their own ecosystem (e.g. Kafka transactions across topics), but once the effect goes out to a database or external API, idempotency is again the consumer\'s job.`,
    },
    follow: [
      { pt: 'Onde você guarda as chaves de deduplicação e por quanto tempo?', en: 'Where do you store deduplication keys and for how long?' },
    ],
    anchor: {
      pt: 'Use o TripFlow (outbox + consumidor que deduplica pelo ID) e o MeterTrail (reprocessamento sem contar duas vezes) como exemplos de "efeito uma vez só".',
      en: 'Use TripFlow (outbox + consumer deduplicating by id) and MeterTrail (reprocessing without double counting) as examples of "effectively once".',
    },
    flags: {
      pt: '"Uso uma fila com exactly-once, então não preciso me preocupar com duplicidade."',
      en: '"I use a queue with exactly-once, so I do not need to worry about duplicates."',
    },
  },

  {
    id: 'finance-business-metrics-tracing',
    cat: 'observability', type: 'architecture', jobs: ['backend-php-node', 'sr-observability'],
    tags: ['métricas de negócio', 'business metrics', 'OpenTelemetry', 'traceparent', 'correlation id', 'Prometheus', 'alertas', 'alerts'],
    q: {
      pt: 'Num back-office financeiro com partes em PHP, Node e filas, que métricas você acompanharia, e como você rastreia uma transação de ponta a ponta entre esses componentes?',
      en: 'In a financial back office with parts in PHP, Node, and queues, which metrics would you track, and how would you trace one transaction end to end across those components?',
    },
    a: {
      pt: `**Métricas de negócio** (o que o financeiro sente), além das técnicas:
- taxa de pagamentos aprovados e recusados;
- **pedidos pagos aguardando nota** e há quanto tempo (alerta acima de X minutos);
- tempo entre a confirmação do pagamento e a emissão da nota;
- falhas e retries por integração, e o tamanho da DLQ;
- divergências da reconciliação com o gateway;
- durante a migração: erros e latência do PHP contra o Node na mesma fatia.

**Técnicas:** taxa de erro e latência por rota (RED), profundidade e idade das filas, tempo das chamadas externas.

**Rastreio de ponta a ponta:**
- **OpenTelemetry** nos dois lados, PHP e Node, propagando o contexto no padrão **W3C \`traceparent\`** nos headers HTTP **e** nas mensagens da fila (o produtor coloca, o consumidor continua o mesmo trace).
- Todo log estruturado leva \`trace_id\` e os ids de negócio (\`order_id\`, \`payment_id\`), sem dados de cartão, tokens ou dados pessoais.
- Com isso dá para partir de um pedido e ver todo o caminho: requisição no PHP, webhook, fila, consumidor em Node, chamada ao serviço fiscal.

**Ferramenta:** uso o que o time já tem (Datadog, New Relic, Grafana). Sem nada, uma opção aberta é OpenTelemetry Collector com Prometheus, Loki e Tempo no Grafana.`,
      en: `**Business metrics** (what finance feels), beyond technical ones:
- approved and declined payment rates;
- **paid orders waiting for an invoice** and for how long (alert above X minutes);
- time from payment confirmation to invoice issuing;
- failures and retries per integration, and DLQ size;
- reconciliation mismatches with the gateway;
- during migration: PHP versus Node errors and latency on the same slice.

**Technical:** error rate and latency per route (RED), queue depth and age, external call durations.

**End-to-end tracing:**
- **OpenTelemetry** on both sides, PHP and Node, propagating context with the **W3C \`traceparent\`** standard in HTTP headers **and** queue messages (the producer sets it, the consumer continues the same trace).
- Every structured log carries \`trace_id\` and business ids (\`order_id\`, \`payment_id\`), with no card data, tokens, or personal data.
- That lets you start from one order and see the whole path: PHP request, webhook, queue, Node consumer, fiscal service call.

**Tooling:** I use what the team already has (Datadog, New Relic, Grafana). With nothing in place, an open option is the OpenTelemetry Collector with Prometheus, Loki, and Tempo in Grafana.`,
    },
    follow: [
      { pt: 'Qual alerta você criaria primeiro, e qual seria o limite?', en: 'Which alert would you create first, and what would the threshold be?' },
    ],
    anchor: {
      pt: 'Instrumentar com OpenTelemetry um trace atravessando API → banco → RabbitMQ → consumidor é o plano do PulseOps. Até existir, apresente como plano, não como experiência.',
      en: 'Instrumenting with OpenTelemetry a trace across API → database → RabbitMQ → consumer is the PulseOps plan. Until it exists, present it as a plan, not as experience.',
    },
    flags: {
      pt: 'Só métricas de CPU e memória, ou log sem nenhum id para ligar as partes.',
      en: 'Only CPU and memory metrics, or logs with no id to connect the pieces.',
    },
  },
];
