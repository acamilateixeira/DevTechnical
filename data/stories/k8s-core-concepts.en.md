**You** (to Kubernetes): "I want **3 copies** of my API running, always."

**Deployment** 📋: "Noted. If one dies, I start another."

**Pod** 📦: "I'm one of those copies. I'm disposable: I can die and be reborn on another machine."

**Service** 📞: "And I'm the fixed phone number. Nobody needs to know which pod they're calling: I spread calls across the healthy ones."

**New version deploy** (rolling update):

**Deployment**: "I start ONE new pod…"

**Readiness probe** 🚦: "Is it ready to take traffic yet? …Now it is!"

**Deployment**: "…so I shut down ONE old one (with SIGTERM, so it finishes what it was doing). And repeat until all are replaced." 🔄

**Liveness probe** 💓: "And I keep asking 'are you alive?'. If it's stuck, I restart it."

**Misconfigured liveness**: "I check the DATABASE. If the database goes down…"

**Every pod**: "…we restart in a loop! 😵"

**Hungry pod** 🍔: "I used more memory than my limit…"

**Kernel**: "**OOMKilled.** Bye." 💀

**🧠 Interview takeaway**

"A Deployment keeps N pod replicas; a Service gives a stable address. In a rolling update, each new pod only gets traffic once readiness passes, and the old one leaves with a graceful shutdown. Liveness restarts a stuck pod (it shouldn't check the database). Exceeding the memory limit means OOMKilled."
