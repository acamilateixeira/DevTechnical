# 🍽️ The set menu and the build-your-own plate

> The trip details screen is hungry: it wants the trip, who requested it, and the cost center.

## 🎭 Cast
- 📱 **Screen** · the front end · wants exactly 3 pieces of information
- 🍛 **Set-menu restaurant** · REST (`GET /trips/1`, `GET /users/7`…) · each route is a ready-made dish with everything that comes on it
- 🥗 **Build your own plate** · GraphQL (`POST /graphql`) · the client picks the fields in a single order
- 🍟 **Leftovers** · over-fetching · fields the screen didn't ask for
- 🏪 **Ready meal in the fridge** · HTTP cache / CDN · stores a `GET` response by its address
- 🦹 **Smart aleck** · an overly deep query · asks for `friends { friends { friends … } } }` until it chokes
- 🛑 **Bouncer** · depth and complexity limits · blocks orders that are too expensive

- 👨‍🍳 **Kitchen** · resolvers on the server · prepares each requested field
## 🎬 Scene 1 · At the set-menu restaurant
**Screen**: "I want the trip, who requested it, and the cost center."
**Set-menu restaurant**: "Dish 1: trip. Dish 2: user. Dish 3: cost center. Three trips to the kitchen!"
**Screen**: "And dish 1 came with 40 sides, I only wanted 3…" 🍟
**Ready meal in the fridge**: "But look: since every dish has a fixed address, I keep `GET /trips/1` and serve it without bothering the kitchen." 🏪

## 🎬 Scene 2 · At build-your-own
**Build your own plate**: "Tell me EXACTLY what you want, in a single order."
**Screen**: "Trip title, requester name, and cost center name."
**Build your own plate**: "Coming up! One trip and only what you asked for." 🥗
**Screen**: "I'm in love." 😍
**Ready meal in the fridge**: "Too bad it's all POST to the same address. I can't keep anything. I feel useless." 😢

## 🎬 Scene 3 · The smart aleck
**Smart aleck**: "I want my friends, their friends, their friends' friends…"
**Bouncer**: "Whoa, whoa. Max depth 5, max complexity 1000. Next!" 🛑
**Kitchen**: "And every field has a resolver, you know? Watch out for N+1." _(→ DataLoader lab)_

## 💻 Translating to code
```http
# 🍛 REST: 3 trips
GET /trips/1
GET /users/7
GET /cost-centers/3
```
```graphql
# 🥗 GraphQL: 1 trip, only what the screen uses
query {
  trip(id: 1) { title requester { name } costCenter { name } }
}
```

| | REST | GraphQL |
| --- | --- | --- |
| Requests | Several endpoints | One endpoint, one query |
| Fields | The server decides | The client decides |
| HTTP/CDN cache | Natural (by URL) | Hard (everything is POST) |
| Watch out for | Versioning, over-fetching | N+1, expensive queries, per-field authorization |

## 🎤 For the interview
"REST is simple, has natural HTTP caching and per-route observability; GraphQL lets the client ask for exactly the fields it needs in one request, which is great for rich front ends, but loses HTTP caching and needs care with N+1, depth limits, and per-field authorization. I use REST for public APIs and integrations and GraphQL as a BFF for complex screens."
