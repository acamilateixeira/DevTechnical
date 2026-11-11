# 🐃 The stampede at the bakery

> A bakery famous for its cheese bread. The display case (the cache) shows the ready batch; the kitchen (the database) bakes from scratch.

## 🎭 Cast
- 🪟 **Display case** · Redis · `cache.get()` · the cache: answers instantly, but each batch is only good for 5 s (the TTL)
- 👨‍🍳 **Kitchen** · `bancoBuscarProduto()` · the database: does it right, but slowly and with a queue
- ⏰ **Clock** · `TTL_MS` · announces when the batch in the display case has expired
- 🐃 **Herd** · 50 calls to `getProduto(42)` at once · the customers who all arrive together
- 🤝 **Single-flight** · `emAndamento` (a `Map` of promises) · the doorman who lets only one go to the kitchen while the rest wait together
- 🎲 **Jitter** · `TTL_MS + rand(0, 1000)` · a bit of random time so not every batch expires in the same second

- 🙋 **Customer 1** · the first request to find the case empty · goes to the kitchen
- 🧍 **Customer 2** · the second request · waits for Customer 1's fetch
- 👥 **Customers 2 to 50** · the other requests · wait together
## 🎬 Scene 1 · All calm
**Display case**: "Cheese bread 42 right here, nice and warm! Ask and it's yours instantly." ⚡
**Kitchen** _(sipping coffee)_: "Ah, lovely, the display case handles everything for me." 😌

## 🎬 Scene 2 · The batch expired
**Clock**: "5 seconds! Batch 42 EXPIRED!" ⏰
**Herd** _(50 people walking in together)_: "I WANT 42!"
**Display case**: "All gone! Go to the kitchen!"
**Herd**: "KITCHEN! KITCHEN! KITCHEN! KITCHEN!…" 🐃🐃🐃🐃
**Kitchen** _(spilling the coffee)_: "50 IDENTICAL ORDERS AT ONCE?! I ONLY HAVE ONE OVEN, PEOPLE!" 😵
> 🚨 Cache stampede: everyone went to the database for the same thing.

## 🎬 Scene 3 · With a doorman
**Customer 1**: "Gone from the display case? I'll go to the kitchen." 🏃
**Customer 2**: "Couldn't find it either… but is someone already going?"
**Single-flight**: "Yes, Customer 1. Wait for HIS batch, don't place another order." 🤝
**Customers 2 to 50**: "Fine, we'll wait together. Anyone bring cards?" 🃏
**Kitchen**: "One order. Now I can work." 😌
**Customer 1**: "I'm back! And I put it in the display case for 5 seconds plus a tiny random bit."
**Jitter**: "So batch 42 and batch 43 don't expire in the same second and start the whole mess again." 🎲

## 💻 Translating to code
```js
async function getProduto(id) {
  const noCache = await cache.get(`produto:${id}`);          // 🪟 check the display case
  if (noCache) return noCache;
  if (emAndamento.has(id)) return emAndamento.get(id);       // 🤝 someone already went? wait for the same promise
  const busca = (async () => {
    const produto = await bancoBuscarProduto(id);            // 👨‍🍳 go to the kitchen
    await cache.set(`produto:${id}`, produto, TTL_MS + rand(0, 1000)); // 🎲 TTL with jitter
    return produto;
  })();
  emAndamento.set(id, busca);
  try { return await busca; } finally { emAndamento.delete(id); }
}
```

| `SINGLE_FLIGHT` in the lab | Database queries |
| --- | --- |
| `false` | 50 |
| `true` | 1 |

Across different servers, the same doorman becomes a lock in Redis (`SET key NX PX`). Another option is refreshing the hot key before it expires.

## 🎤 For the interview
"Cache-aside: I check the cache; if it's not there, I query the database and store it with a TTL. When a popular key expires, everyone hits the database at once: that's a cache stampede. I prevent it by letting only one request recompute (single-flight or a distributed lock), adding jitter to the TTL, and refreshing hot keys before they expire."
