# Labs de Node.js (para rodar no seu computador)

Os labs do site simulam servidor, banco e fila dentro do navegador. Estes aqui rodam de
verdade no Node: servidor HTTP real, threads reais, sinais do sistema operacional e um
banco SQLite real. Sem instalar nenhum pacote.

**Requisito:** Node.js 22.13 ou mais novo (`node -v`). O lab 05 usa o SQLite embutido no Node.

```bash
git clone https://github.com/acamilateixeira/DevTechnical.git
cd DevTechnical
node labs/node/01-event-loop-node.cjs
```

Cada arquivo tem comentários explicando o que acontece e uma seção **EXPERIMENTE** no fim.

| Lab | Rode | O que você vai ver |
| --- | --- | --- |
| 01. Event loop do Node | `node labs/node/01-event-loop-node.cjs` | A ordem entre `process.nextTick`, Promises, `setTimeout`, I/O e `setImmediate`, com a fase de cada um. |
| 02. Travar o event loop | `node labs/node/02-bloqueio-event-loop.mjs` e depois com `--worker` | Um cálculo pesado faz um endpoint simples demorar 1,4 s. Com `worker_threads`, ele volta a responder em ~2 ms. |
| 03. Streams e backpressure | `node labs/node/03-streams-backpressure.mjs` e depois com `--pipeline` | Gerar 300 mil linhas para um destino lento: ignorando o backpressure, a memória quase dobra. |
| 04. Graceful shutdown | `node labs/node/04-graceful-shutdown.mjs` e depois com `--sem-graceful` | Um "deploy" (SIGTERM) no meio de 3 requisições: com graceful shutdown todas terminam; sem, as 3 falham. |
| 05. Outbox com SQLite | `node labs/node/05-outbox-sqlite.mjs`, `--cair-relay`, `--cair-relay --sem-dedupe` | Status e evento na mesma transação; o relay cai e publica de novo; a constraint UNIQUE impede o e-mail duplicado. |

## Saídas esperadas (resumo)

**01**: `1, 2` (síncrono) → `3` (nextTick) → `4, 5` (Promises) → `6, 7` (timer e check, ordem pode variar) → `8, 9, 10` (dentro do I/O, sempre `setImmediate` antes do `setTimeout`).

**02 sem worker**: `pior /rapido: ~1400ms`, `atraso máximo do event loop: ~1500ms`.
**02 com --worker**: `pior /rapido: ~10ms`, `atraso máximo do event loop: ~15ms`.

**03**: pico de memória ~130 MB sem backpressure contra ~70 MB com `pipeline`.

**04**: `✓ ok /pedido-1..3` com graceful; `✗ FALHOU (UND_ERR_SOCKET)` sem.

**05**: `e-mails enviados: 1`; com `--cair-relay --sem-dedupe`, `e-mails enviados: 2`.

Ligação com as perguntas da entrevista: `node-event-loop-blocking`, `node-streams-backpressure`,
`node-error-handling-shutdown`, `mq-outbox-pattern` e `js-event-loop`.
