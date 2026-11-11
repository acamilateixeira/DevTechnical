# 📮 The post office that never loses a letter

> The API approved a trip and has to notify email, the ERP, and reporting, without waiting for any of them.

## 🎭 Cast
- ✉️ **Sender** · the producer (`channel.publish()`) · sends the "viagem.aprovada" message
- 🏤 **Post office** · the exchange · receives the letter and decides which queues it goes to
- 🗺️ **Delivery map** · bindings and routing keys · the rules for which letter goes to which queue
- 📬 **PO box** · the queue · where the letter waits until someone picks it up
- 🧑‍💻 **Mail carrier** · the consumer (`channel.consume()`) · picks up and processes the letter
- ✅ **Receipt** · manual `ack` · "processed, you can throw it away"
- ☠️ **Letter bomb** · a poison message · breaks everyone who tries to process it
- 📭 **Lost and found** · DLQ (dead letter queue) · where letters that failed too many times go
- 📜 **Ledger** · Kafka · keeps everything in order and lets you reread it

- 📧 **Email carrier** · the email consumer · sends the email
- 🧾 **ERP carrier** · the ERP consumer · sometimes goes down mid-work
## 🎬 Scene 1 · Normal delivery
**Sender**: "Letter 'viagem.aprovada' at the post office!"
**Post office**: "Checking the map… one copy goes to the email box, one to the ERP, and one to reporting." 🗺️
**Email carrier**: "Got it, sent the email, here's the receipt!" ✅
**Post office**: "Receipt in hand, I throw the letter away."

## 🎬 Scene 2 · The carrier who went down
**ERP carrier**: "Picked up the letter… processing…" 💥 _(went down without a receipt)_
**Post office**: "No receipt? The letter goes back in the box and another carrier takes it." 🔁
**ERP carrier 2**: "I've got it. Done, receipt!" ✅

## 🎬 Scene 3 · The letter bomb
**Letter bomb**: "Hehe, everyone who opens me blows up." ☠️
**Post office**: "I tried 5 times, waiting longer each time. Enough: off to lost and found." 📭
**Lost and found**: "You stay here quietly until a human investigates."
**Ledger** _(from the post office next door)_: "I'm different: I don't throw letters away when someone reads them. I keep everything in order, each reader marks where they stopped, and anyone can reread the history." 📜

## 💻 Translating to code
```js
await channel.assertExchange('viagens', 'topic');                       // 🏤
await channel.assertQueue('email', { deadLetterExchange: 'viagens.dlx' }); // 📬 + 📭
await channel.bindQueue('email', 'viagens', 'viagem.aprovada');         // 🗺️
channel.publish('viagens', 'viagem.aprovada', Buffer.from(JSON.stringify(event)), { persistent: true }); // ✉️

await channel.prefetch(10);                                              // at most 10 unacked per carrier
channel.consume('email', async (msg) => {                                // 🧑‍💻
  try { await sendEmail(JSON.parse(msg.content)); channel.ack(msg); }    // ✅
  catch { channel.nack(msg, false, false); }                             // ☠️ → DLQ (with retries first, via a delay queue)
});
```

| | RabbitMQ | Kafka |
| --- | --- | --- |
| Model | Queue: gone after the ack | Log: kept by time/size |
| Reprocess the past | No | Yes (rewind the offset) |
| Good for | Tasks, flexible routing | Streaming, multiple consumers rereading events |

## 🎤 For the interview
"In RabbitMQ the producer publishes to an exchange, which routes to queues via bindings; the consumer acks manually after processing, with prefetch to control concurrency, retries with backoff, and a DLQ for problem messages. Since delivery is at-least-once, the consumer is idempotent. Kafka is a persistent log that allows reprocessing: I use it for streaming and for multiple consumers rereading events."
