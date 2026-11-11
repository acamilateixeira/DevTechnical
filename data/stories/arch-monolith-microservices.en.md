**Monolith** 🏠 (one big house): "Everything lives here: trips, invoices, users. One transaction solves everything. One deploy."

**Invoices team**: "But every time I want to ship, I have to wait for the trips team…" 😩

**Microservices** 🏘️ (a gated community): "Each team with its own house, database, and deploy!"

**Invoices team**: "Freedom! 🎉"

**Network** 🌐 (between the houses): "Now you talk through me. And sometimes I fail, lag, and lose messages." 😈

**Transaction** 💔: "And I don't cross houses. You'll need sagas, events, and eventual consistency."

**Observability**: "And to find a bug, you now need tracing across 6 houses." 🔦

**Distributed monolith** 🧟: "And if the houses still depend on each other for everything and have to deploy together, I'm the worst of both worlds."

**Modular monolith** 🏢 (a building with apartments): "Why not start with me? One house, but with well-defined walls. If an apartment grows a lot, it moves out later (Strangler Fig)."

**🧠 Interview takeaway**

"Microservices solve an organizational problem (independent teams), not a technical one. They cost networking, eventual consistency, tracing, and contracts. I start with a modular monolith with clear boundaries and extract a service when there's a concrete reason, gradually, with the Strangler Fig."
