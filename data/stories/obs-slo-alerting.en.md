**Boss**: "I want 100% availability!"

**SRE**: "Not even the customer's internet has 100%. Let's agree on a **target** (SLO): 99.9% of requests succeed in under 300 ms, per month."

**SLI** 📏: "I'm the ruler that actually measures that, request by request."

**Error budget** 💰: "And I'm the failure allowance: 99.9% per month leaves about **43 minutes** of errors. Allowance left? The team can take risks and ship fast. Spent? Brake on new features, focus on stability."

**SLA** 📜: "And I'm the contract with the customer, with penalties. I sit a bit below the SLO to leave a margin."

**Noisy alert** 🚨: "CPU AT 81%! WAKE UP!"

**On-call engineer** (2 a.m.): "And were any users affected?"

**Alert**: "…no."

**On-call engineer**: "THEN DON'T WAKE ME UP!" 😤

**Burn-rate alert** 🔥: "I only ring when the error budget is being spent too fast, meaning real users are suffering. And I come with a runbook."

**Average latency** 📊: "I look great: 120 ms!"

**p99**: "You hide that 1 in every 100 users waits 8 seconds." 🙄

**🧠 Interview takeaway**

"SLI is the measure, SLO the internal target, SLA the contract. The error budget is how much may fail in the period and balances speed and stability. I alert on symptoms that affect users, by burn rate, with a runbook, and I look at percentiles (p95/p99), not averages."
