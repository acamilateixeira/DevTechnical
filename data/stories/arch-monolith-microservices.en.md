# 🏠 The big house and the gated community

> A company grew. The invoicing team is fighting with the trips team just to be able to deploy.

## 🎭 Cast
- 🏠 **Big house** · monolith · everything in one application, one database, one deploy
- 🏘️ **Gated community** · microservices · each team with its own service, database, and deploy
- 🧾 **Invoicing team** · a product team · wants to ship at its own pace
- 🌐 **Intercom** · the network between services (HTTP, queues) · sometimes fails, lags, or loses messages
- 💔 **Transaction** · `BEGIN ... COMMIT` · doesn't cross services: becomes a saga with events
- 🔦 **Detective** · distributed tracing (OpenTelemetry) · follows a request through several houses
- 🧟 **Distributed monolith** · coupled services · the worst of both worlds
- 🏢 **Apartment building** · modular monolith · one application, with well-defined walls between modules
- 🌳 **Fig tree** · Strangler Fig · removes one piece of the big house at a time, without demolishing everything

## 🎬 Scene 1 · In the big house
**Big house**: "Everyone lives here: trips, invoices, users. One transaction handles everything, one deploy."
**Invoicing team**: "But every time I want to ship, I have to wait for the trips team to finish their renovation…" 😩

## 🎬 Scene 2 · Moving to the gated community
**Gated community**: "Each team with its own house, database, and deploy!"
**Invoicing team**: "FREEDOM! 🎉"
**Intercom**: "Now you only talk through me. And sometimes I fail, lag, or lose messages." 😈
**Transaction**: "And I don't cross walls. You'll have to make do with sagas, events, and eventual consistency." 💔
**Detective**: "And to find a bug, now I have to follow the trail through 6 houses." 🔦
**Distributed monolith** _(dragging chains)_: "And if the houses still depend on each other for everything and have to deploy together… I show up." 🧟

## 🎬 Scene 3 · The middle ground
**Apartment building**: "How about starting with me? One building, but each apartment with its own walls and door."
**Fig tree**: "And if an apartment grows too big, I help it move out little by little, without knocking the building down." 🌳
**Invoicing team**: "I like it. Peace without paying rent on the whole community."

## 💻 Translating to code
```
src/
  modules/
    trips/      # 🏢 each module with its own domain, use cases, and public API
    invoices/   #    other modules only talk through that API or events, never through the neighbor's tables
    users/
```

| | Modular monolith | Microservices |
| --- | --- | --- |
| Deploy | One | One per service |
| Transactions | Normal | Sagas and eventual consistency |
| Debugging | Stack trace | Distributed tracing |
| Operating cost | Low | High (network, contracts, observability) |
| Solves | Code organization | Independent teams and separate scaling |

## 🎤 For the interview
"Microservices solve an organizational problem, teams shipping independently, not a technical one. They cost network calls, eventual consistency, tracing, and contracts between services. I start with a modular monolith with clear boundaries and extract a service when there's a concrete reason, gradually, using Strangler Fig."
