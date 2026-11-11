# 👋 The server that knew how to slip out quietly

> A 3 p.m. deploy on a Tuesday. Kubernetes is swapping the old server for the new one, with people mid-purchase.

## 🎭 Cast
- 🚢 **Kubernetes** · the orchestrator · sends the exit notice and, if it takes too long, yanks you out
- 📨 **Notice** · the `SIGTERM` signal · "time to leave, but politely"
- 🔪 **Yank** · the `SIGKILL` signal · "time's up": kills immediately, no discussion
- 🚦 **Sign** · the readiness probe · tells the load balancer whether the server takes new people
- 🚪 **Door** · `server.close()` · stops accepting new connections and finishes the ones in progress
- 🐛 **Loose bug** · `unhandledRejection` · a Promise that failed and nobody handled
- 🛒 **Customers** · in-flight requests · people in the middle of a purchase

- 💀 **Rude server** · no graceful shutdown · dies on the spot
- 🤵 **Polite server** · with graceful shutdown · leaves properly
## 🎬 Scene 1 · Leaves without warning
**Kubernetes**: "Old server, here's your notice. Time to go."
**Rude server**: "BYE!" 💀 _(dies on the spot)_
**Customers**: "ERROR?! Just because of a deploy?! I was paying!" 😡
> 🚨 Requests cut off halfway.

## 🎬 Scene 2 · Slips out quietly
**Polite server**: "Got the notice. Easy, I'll leave properly."
**Sign**: "Flipped to 'CLOSED'. Load balancer, don't send anyone else here." 🚫
**Door**: "Nobody new comes in, but whoever's already inside finishes their purchase." ⏳
**Polite server**: "Now I'll close the database and the queue, without acknowledging any message I didn't finish." 🔌
**Polite server**: "All done. Bye, everyone!" 👋
**Kubernetes**: "Well done. But if you dawdle more than 30 seconds, I'll yank you out." 🔪⏰

## 🎬 Scene 3 · The loose bug
**Loose bug**: "I failed and nobody handled me…" 🐛
**Polite server**: "Unknown state? Better to restart clean than limp along half-broken. I'll log the error and exit."
**Kubernetes**: "No problem, I'll start another one." ♻️

## 💻 Translating to code
```js
let closing = false;
app.get('/ready', (req, res) => res.status(closing ? 503 : 200).end()); // 🚦

process.on('SIGTERM', async () => {                // 📨
  closing = true;                                  // 🚦 stop taking new people
  server.close(async () => {                       // 🚪 finish whoever's inside
    await db.end(); await channel.close();         // 🔌 close database and queue
    process.exit(0);                               // 👋
  });
  setTimeout(() => process.exit(1), 25_000).unref(); // before Kubernetes' SIGKILL (30 s)
});

process.on('unhandledRejection', (err) => {        // 🐛
  logger.fatal({ err }, 'unhandled bug');
  process.exit(1);                                 // ♻️ the orchestrator starts another one
});
```

| Error type | Example | Response |
| --- | --- | --- |
| Expected | Invalid data, no permission | 4xx with a clear message |
| Bug | `undefined is not a function` | Generic 500 + log with trace ID |

In Node lab 04: with graceful shutdown every request finishes; without it, `UND_ERR_SOCKET`.

## 🎤 For the interview
"I separate expected errors, which become 4xx, from bugs, which become a generic 500 with a log and trace ID. On `SIGTERM` I make readiness fail, call `server.close()` to finish in-flight requests, close the database and queues, and exit before the orchestrator's deadline. On `unhandledRejection` I log and exit the process, because the state is now unknown."
