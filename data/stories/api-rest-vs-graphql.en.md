**App screen**: "I need the trip, who requested it, and the cost center."

**REST** 🍽️ (à la carte restaurant with fixed dishes): "Dish 1: `GET /trips/1`. Dish 2: `GET /users/7`. Dish 3: `GET /cost-centers/3`. Three trips to the kitchen."

**Screen**: "And dish 1 came with 40 fields, I only wanted 3…" *(over-fetching)*

**GraphQL** 🥗 (build your own plate): "Tell me EXACTLY what you want, in one order: `{ trip { title requester { name } costCenter { name } } }`."

**Screen**: "Wow, one trip and only what I asked for!" 😍

**HTTP cache / CDN** 🗄️: "But with REST I stored `GET /trips/1` and answered without even bothering the server. In GraphQL it's all POST to the same `/graphql`… I can't help." 😢

**Database**: "And each GraphQL field has a resolver… watch out for N+1!" *(→ DataLoader lab)*

**Hacker** 🦹: "What if I ask for `friends { friends { friends { friends … } } }`?"

**GraphQL**: "Depth and complexity limits. Next!" 🛑

**🧠 Interview takeaway**

"REST is simple, has HTTP caching, and per-route observability; GraphQL lets the client ask for exactly the fields it needs in one request, great for rich front ends, but loses HTTP caching and requires care with N+1 and expensive queries. I pick REST for public APIs and integrations and GraphQL as a BFF for complex screens."
