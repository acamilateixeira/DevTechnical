# 📮 The approved trip nobody heard about

> João requested a business trip. His manager approved it. Now someone has to send the email telling him.

## 🎭 Cast
- 🖥️ **API** · `aprovarViagem()` · approves and saves to the database
- 🗄️ **Database** · `db.viagens` · where the approval is stored
- 🐰 **Rabbit** · RabbitMQ · `rabbit.publish()` · the mail carrier who takes the message to the other services
- 📝 **Note** · a row in the `outbox` table · the message "notify: trip approved", saved together with the approval
- 🚴 **Relay** · `relay()` · the courier who stops by every so often, picks up the notes, and hands them to Rabbit
- 📧 **Email** · the queue consumer · sends the email to João
- 🛑 **Dedupe** · table of processed messages · remembers which messages were already handled
- 💥 **Crash** · `talvezCair()` · the server going down at the worst possible moment

- 🧳 **João** · requested the trip · just wants the email
## 🎬 Scene 1 · Save and notify separately
**API**: "Approved! Saved to the database. COMMIT! ✅ Now I'll call Rabbit…"
**Crash**: 💥
**Database**: "It's APPROVED here, sweetie."
**Rabbit**: "Approved? Nobody told me anything."
**Email**: "Then I'm not sending anything."
**João**: "My trip was approved three days ago and I FOUND OUT AT THE AIRPORT CHECK-IN?!" 😤
> 🚨 The database and the mail carrier don't coordinate with each other: a dual write.

## 🎬 Scene 2 · With a note
**API**: "Now, in the SAME transaction, I save the approval AND a note in the outbox. Either both go, or neither." 📝
**Crash**: 💥 _(down again, right after the commit)_
**Relay** _(riding by)_: "Oh, an undelivered note! Take it, Rabbit!" 📮
**Email**: "Got it! Sent the email to João." 📧
**João**: "Finally! Off to the beach!" ✈️

## 🎬 Scene 3 · The forgetful courier
**Relay**: "Now let me mark the note as delivered and—"
**Crash**: 💥
**Relay** _(restarted, remembering nothing)_: "An unmarked note? DELIVER IT AGAIN!" 📮
**Email** _(no dedupe)_: "Got it again! Sent it again!" 📧📧
**João**: "Why did I get two emails? Two trips? Yay!"
**Dedupe**: "Easy, João. That message ID was already handled. I'm ignoring the repeat." 🛑

## 💻 Translating to code
```js
// ❌ dual write: if it crashes between the two lines, the event is lost
await db.transacao(() => { viagem.status = 'APROVADA'; });
await rabbit.publish(evento);

// ✅ outbox: data + note in the SAME transaction
await db.transacao(() => {
  viagem.status = 'APROVADA';
  db.outbox.push({ ...evento, publicadoEm: null });    // 📝
});

// 🚴 relay (another process): publishes, then marks
for (const msg of pendentes) { await rabbit.publish(msg); msg.publicadoEm = Date.now(); }

// 🛑 idempotent consumer
if (jaProcessadas.has(msg.id)) return;                 // a repeat: ignore it
```

| `MODO` + `QUEDA` in the lab | Result |
| --- | --- |
| `dual-write` + `depois-do-commit` | Approved, no email |
| `outbox` + `depois-do-commit` | 1 email |
| `outbox` + `depois-de-publicar` | 2 emails (no dedupe) |
| the same + `DEDUPE = true` | 1 email |

## 🎤 For the interview
"The database and the queue don't share a transaction, so writing to one and publishing to the other is a dual write that loses events. With the outbox pattern, I write the event to a table in the same transaction as the data, and a relay (or CDC, like Debezium) publishes it later. That gives at-least-once delivery: the message can arrive twice, so the consumer must be idempotent, deduplicating by ID."
