# 📮 Os Correios que não perdem carta

> A API aprovou uma viagem e precisa avisar o e-mail, o ERP e o relatório, sem ficar esperando nenhum deles.

## 🎭 Elenco
- ✉️ **Remetente** · o produtor (`channel.publish()`) · quem manda a mensagem "viagem.aprovada"
- 🏤 **Agência** · a exchange · recebe a carta e decide pra quais filas ela vai
- 🗺️ **Mapa de entrega** · bindings e routing keys · as regras de qual carta vai pra qual fila
- 📬 **Caixa postal** · a fila · onde a carta espera até alguém buscar
- 🧑‍💻 **Carteiro** · o consumidor (`channel.consume()`) · busca e processa a carta
- ✅ **Recibo** · `ack` manual · "processei, pode jogar fora"
- ☠️ **Carta-bomba** · mensagem envenenada · quebra todo mundo que tenta processar
- 📭 **Achados e perdidos** · DLQ (dead letter queue) · onde vão as cartas que deram erro demais
- 📜 **Livro de registro** · Kafka · guarda tudo em ordem e deixa reler

## 🎬 Cena 1 · A entrega normal
**Remetente**: "Carta 'viagem.aprovada' na agência!"
**Agência**: "Olhando o mapa… vai uma cópia pra caixa do e-mail, uma do ERP e uma do relatório." 🗺️
**Carteiro do e-mail**: "Peguei, mandei o e-mail, toma o recibo!" ✅
**Agência**: "Recibo na mão, jogo a carta fora."

## 🎬 Cena 2 · O carteiro que caiu
**Carteiro do ERP**: "Peguei a carta… processando…" 💥 _(caiu sem dar recibo)_
**Agência**: "Sem recibo? A carta volta pra caixa e outro carteiro pega." 🔁
**Carteiro do ERP 2**: "Deixa comigo. Pronto, recibo!" ✅

## 🎬 Cena 3 · A carta-bomba
**Carta-bomba**: "Hehe, todo mundo que me abre explode." ☠️
**Agência**: "Tentei 5 vezes, esperando cada vez mais. Chega: vai pros achados e perdidos." 📭
**Achados e perdidos**: "Fica aqui quietinha até um humano investigar."
**Livro de registro** _(da agência vizinha)_: "Eu sou diferente: não jogo carta fora quando alguém lê. Guardo tudo em ordem, cada leitor marca onde parou, e quem quiser relê o histórico." 📜

## 💻 Traduzindo pro código
```js
await channel.assertExchange('viagens', 'topic');                       // 🏤
await channel.assertQueue('email', { deadLetterExchange: 'viagens.dlx' }); // 📬 + 📭
await channel.bindQueue('email', 'viagens', 'viagem.aprovada');         // 🗺️
channel.publish('viagens', 'viagem.aprovada', Buffer.from(JSON.stringify(evento)), { persistent: true }); // ✉️

await channel.prefetch(10);                                              // no máximo 10 sem recibo por carteiro
channel.consume('email', async (msg) => {                                // 🧑‍💻
  try { await enviarEmail(JSON.parse(msg.content)); channel.ack(msg); }  // ✅
  catch { channel.nack(msg, false, false); }                             // ☠️ → DLQ (com retry antes, via fila de espera)
});
```

| | RabbitMQ | Kafka |
| --- | --- | --- |
| Modelo | Fila: some depois do ack | Log: fica guardado por tempo/tamanho |
| Reprocessar o passado | Não | Sim (volta o offset) |
| Bom para | Tarefas, roteamento flexível | Streaming, vários consumidores relendo eventos |

## 🎤 Pra entrevista
"No RabbitMQ o produtor publica numa exchange, que roteia para filas pelos bindings; o consumidor dá ack manual depois de processar, com prefetch para controlar a concorrência, retry com backoff e DLQ para mensagens problemáticas. Como a entrega é at-least-once, o consumidor é idempotente. Kafka é um log persistente que permite reprocessar: uso para streaming e para vários consumidores relendo eventos."
