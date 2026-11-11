# 💳 The sneakers that got charged three times

> Bia bought R$150 sneakers in the app, on bus-station 4G. The signal was just lovely.

## 🎭 Cast
- 📱 **App** · `pagarComRetry()` · the client: asks for the charge and, if it hears nothing back, asks again (the retry)
- 🏪 **Server** · `servidorPagamentos()` · the payments API: makes the real charge
- 🐊 **Network** · `rede()` · the internet: sometimes swallows the response halfway
- 💳 **Bia's card** · `cobrarCartao()` · the statement, where the charge shows up
- 🎫 **abc-123** · `Idempotency-Key` header · the order number: the SAME in every attempt
- 📒 **Notebook** · table with `UNIQUE(key)` · where the server writes down each order number and the response it gave

## 🎬 Scene 1 · No order number
**App**: "Server, charge Bia R$150, please!"
**Server**: "Charged! ✅ Here's the response: it worked!"
**Network** _(chewing)_: "Nom. 😋"
**App** _(checking the clock)_: "Huh, nothing came back. Something must have broken. I'll just send it again, right?"
**Server**: "A R$150 order? Sure, charged! ✅"
**Network**: "Nom. 😋"
**App**: "AGAIN!"
**Server**: "Charged! ✅"
**Bia's card**: "R$450?! ARE YOU KIDDING ME?! SHE BOUGHT SNEAKERS, NOT A CENTIPEDE! 😱"
> 🚨 The server had no way of knowing it was the same order.
= 🔁 App attempts: 3
= 📨 Responses that reached the app: 1 (only the last; the network ate 2)
= 💳 Card charges: 3 → R$450 ❌
= 📒 Notebook: doesn't exist

## 🎬 Scene 2 · With an order number
**App**: "Charge R$150. Order number **abc-123**."
**Server**: "abc-123? Never seen it. I'll charge and write it in the notebook with the response."
**Notebook**: "Noted: abc-123 → it worked. ✍️"
**Network**: "Nom. 😋"
**App**: "Charge R$150. Order **abc-123**." _(the same number, on purpose)_
**Server** _(flipping pages)_: "Hold on… abc-123 is already here! I won't charge again, I'll just give you the same response."
**Bia's card**: "R$150. Exactly right. You can breathe now." 😌
= 🔁 App attempts: 2, both with key abc-123
= 📒 Notebook: abc-123 → 201 (stored response)
= 💳 Card charges: 1 → R$150 ✅
= 📋 Responses returned from the notebook: 1 (the second attempt)

## 🎬 Scene 3 · The clever app
**App**: "What if I make up a new number on every attempt? Order **xyz-999**!"
**Server**: "New number means new order. Charged! ✅"
**Bia's card**: "NOT AGAIN, FOR THE LOVE OF GOD!" 🤦
**abc-123**: "The number belongs to the PURCHASE, sweetie. Not to the attempt."
= 🎫 Keys used: xyz-999, then a new one on every attempt
= 📒 Notebook: every key is new → never finds anything
= 💳 Card charges: one per attempt ❌
= 📌 Rule: one key per purchase, not per attempt

## 💻 Translating to code
```js
// App: ONE key per purchase, reused in every retry
const key = uuid();                         // abc-123
for (let i = 1; i <= 4; i++) {
  try { return await rede(servidor, { headers: { 'Idempotency-Key': key }, body }); }
  catch { await sleep(100 * 2 ** (i - 1)); } // backoff: 100, 200, 400 ms
}

// Server: checks the notebook before charging
const salvo = db.idempotencia.get(key);
if (salvo) return salvo.response;           // already done: return the same response
cobrarCartao(body.valor);
db.idempotencia.set(key, { response });     // in real life: INSERT with UNIQUE(key) in the same transaction
```

| In the lab, change | What happens |
| --- | --- |
| `USAR_CHAVE = false` | 3 charges (Scene 1) |
| `USAR_CHAVE = true` | 1 charge (Scene 2) |
| `NOVA_CHAVE_POR_TENTATIVA = true` | multiple charges again (Scene 3) |

## ➕ What the recruiter asks next
- **Same key with a different amount?** The server stores a hash of the body and responds `422`: it's a client bug, not a retry.
- **Two attempts arriving at the same time?** The `UNIQUE(key)` in the database ensures only one writes; the other waits or gets `409`.
- **How long to keep it?** A few hours or days (Stripe keeps it for 24h), with automatic cleanup.

## 🎤 For the interview
"Retries are inevitable because the network loses responses. The client sends an **Idempotency-Key** per operation intent (not per attempt); the server stores the key with a unique constraint along with the response, in the same transaction as the charge, and if the key comes back it returns the saved response without running again. A repeated key with a different body becomes `422`."
