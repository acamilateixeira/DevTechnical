# 🍽️ The waiter who ran to the kitchen for every order

> A packed restaurant. The big table ordered 50 dishes, and each dish needs the name of whoever ordered it.

## 🎭 Cast
- 🙋 **Customer** · the query `{ trips { requester { nome } } }` · the table placing the big order
- 🧾 **Trips waiter** · the `trips` resolver · fetches the 50 trips at once
- 🏃 **Jumpy waiter** · the `requester` resolver · runs ONCE PER TRIP and goes to the kitchen every time
- 👨‍🍳 **Kitchen** · the database · every trip there is a query
- 🧑‍💼 **Smart waiter** · `DataLoader` · writes everything down, removes duplicates, and goes to the kitchen once
- 📝 **Order pad** · `queueMicrotask()` · the moment he closes the pad: at the end of the tick, once everyone has ordered

## 🎬 Scene 1 · The jumpy waiter
**Customer**: "I want 50 trips, each with the name of whoever requested it." 📋
**Trips waiter**: "50 trips, coming up! One trip to the kitchen." ✅
**Jumpy waiter**: "Trip 1? I'll run to the kitchen for user 1! Trip 2? Run for user 2! Trip 3? User 1 again! Running!" 🏃🏃🏃
**Kitchen**: "51 TRIPS?! And half are for the SAME user! Stop making a fool of me!" 😵
> 🚨 1 query for the list + 1 per item: that's N+1.

## 🎬 Scene 2 · The smart waiter
**Smart waiter**: "I don't go to the kitchen for every order. I'll write down everything the table orders right now…"
**Jumpy waiter** _(shouting the orders)_: "User 1! User 2! User 1! User 3! User 2!…"
**Order pad**: "Has everyone ordered? Closed!" 📝
**Smart waiter**: "Duplicates removed: users 1 to 10. Now, ONE trip to the kitchen with the whole list."
**Kitchen**: "2 trips in total. Bless you." 🙏
**Smart waiter**: "And I serve each dish in the order it was requested, or user 1 gets user 2's name and there's a fight." 🍽️

## 🎬 Scene 3 · He isn't forever
**Customer**: "Will you remember me tomorrow?"
**Smart waiter**: "No way. I'm born and I die with each request. If there were only one of me for the whole restaurant, I'd serve one customer's dish to another." 🙅

## 💻 Translating to code
```js
const loader = new DataLoader(async (ids) => {            // 🧑‍💼 smart waiter (1 per request)
  const rows = await db.query('SELECT * FROM users WHERE id = ANY($1)', [ids]); // 👨‍🍳 a single trip
  const byId = new Map(rows.map((u) => [u.id, u]));
  return ids.map((id) => byId.get(id) ?? null);           // 🍽️ same order as requested
});

const resolvers = {
  Trip: { requester: (trip) => loader.load(trip.requesterId) }, // 🏃 still runs per trip, but only writes it down
};
```

| `USAR_DATALOADER` in the lab | Database queries |
| --- | --- |
| `false` | 51 |
| `true` | 2 |

"Closing the pad" is a microtask, just like the VIP line in the event loop lab: it waits for every resolver in the same tick to place its order.

## 🎤 For the interview
"In GraphQL every field has a resolver; in a list, the child field's resolver runs once per item and produces N+1 queries. DataLoader batches the `load(id)` calls from the same tick into one `IN` query, deduplicates them, returns results in the requested order, and is created per request so its cache doesn't leak data between users."
