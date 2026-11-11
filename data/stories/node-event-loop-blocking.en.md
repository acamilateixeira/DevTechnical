# 🧑‍🍳 The waiter who stopped to do math

> A restaurant with a thousand tables and ONE waiter. He manages, as long as nobody asks him to do math in his head.

## 🎭 Cast
- 🧑‍🍳 **Waiter** · Node's main thread (the event loop) · takes orders and delivers dishes, one at a time
- 🔥 **Kitchen** · libuv and the operating system · does the I/O (database, files, network) while the waiter keeps serving
- 🍽️ **Database table** · `await db.query()` · an I/O order: the waiter hands it to the kitchen and walks away
- 🧮 **Math table** · CPU loop (a 10-million `for`, a giant `JSON.parse`, synchronous bcrypt) · traps the waiter at the table
- 😤 **Tables 4 to 1000** · the other requests · waiting even for a glass of water
- 👷 **Helper** · `worker_threads` · does the heavy math in another room, in parallel

## 🎬 Scene 1 · The waiter flying around
**Waiter**: "There's only one of me, but I handle a thousand tables: write it down, pass it to the kitchen, next table."
**Database table**: "I want some data from the database!"
**Waiter**: "Got it, the kitchen's on it, be right back!" 🏃
**Kitchen**: "Leave it to us, we'll call you when it's ready." 🔥
= 🧑‍🍳 Event loop: free
= 🔥 In libuv / OS: the database query
= ⏱️ Wait for other requests: ~10ms

## 🎬 Scene 2 · The math table
**Math table**: "I want YOU to calculate 10 million sums. Here. In front of me."
**Waiter**: "…fine, I guess." 🧮🧮🧮 _(stuck at the same table for 1.5 s)_
**Tables 4 to 1000**: "WAITER?! WAITEEER?! It was just a glass of water, for crying out loud!" 😤
> 🚨 Event loop blocked: nobody else gets served.
= 🧑‍🍳 Event loop: STUCK on the math for 1.5 s ❌
= 😤 Requests waiting: all the others
= ⏱️ Wait for other requests: ~1410ms

## 🎬 Scene 3 · Call the helper
**Helper**: "Hand me that math. I'll do it in the other room and let you know when I'm done." 👷
**Waiter**: "Thanks, buddy! I'm flying again." 😌
**Tables 4 to 1000**: "About time."
= 👷 Heavy math: in `worker_threads` (another thread)
= 🧑‍🍳 Event loop: free again ✅
= ⏱️ Wait for other requests: ~10ms

## 💻 Translating to code
```js
app.get('/report', async (req, res) => {
  const data = await db.query('SELECT ...');      // 🍽️ I/O: doesn't block, goes to the kitchen
  // ❌ CPU on the waiter: blocks everyone
  // const total = heavyCalculation(data);
  // ✅ CPU on the helper
  const total = await runInWorker('./calculation.js', data);  // 👷 worker_threads
  res.json({ total });
});
```

| Work | Example | In Node |
| --- | --- | --- |
| I/O-bound | Database, HTTP, files | Great: doesn't block |
| CPU-bound | Big loop, compression, synchronous hashing | Blocks the event loop: use a worker, a queue, or another process |

Node lab 02 shows it: 1410 ms of waiting with the waiter stuck vs 10 ms with the helper.

## 🎤 For the interview
"Node's JavaScript runs on a single thread, but I/O is delegated to libuv and the operating system, which is why it handles thousands of connections. Heavy CPU work blocks the whole event loop and every request waits. I move that work out of the request with `worker_threads`, a queue with a separate worker, or more processes, and I monitor event loop lag."
