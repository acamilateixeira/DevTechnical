**Kubernetes** 🚢: "New deploy coming! Old server, **SIGTERM**: time to go."

**Server without graceful shutdown**: "BYE!" 💀 *(dies instantly)*

**3 users mid-purchase**: "ERROR?! Just because of a deploy?!" 😡

**Server with graceful shutdown**: "Heard the SIGTERM. Easy, I'll leave properly:"

1. "Readiness, tell the load balancer **I take no new people**." 🚫
2. "I finish whoever is already being served." ⏳
3. "I close the database and queue connections (without acking a message I didn't process)." 🔌
4. "Now: bye!" 👋

**Kubernetes**: "And if you dawdle too long (30 s), I pull you out with SIGKILL." ⏰

**Bug error** 🐛 (`unhandledRejection`): "Nobody handled me…"

**Server**: "Unknown state? Better restart clean than keep running half-broken. I log the error and die; Kubernetes starts another." ♻️

**🧠 Interview takeaway**

"I separate expected errors (become 4xx) from bugs (generic 500 + log with trace ID). On SIGTERM: readiness fails, `server.close()` finishes in-flight requests, I close the database and queues and exit, before the orchestrator's deadline. See Node lab 04."
