# 💰 The error allowance

> The boss wants 100% availability. The SRE wants to sleep. They'll have to negotiate.

## 🎭 Cast
- 🤵 **Boss** · the one demanding results · wants perfection
- 🧑‍🔧 **SRE** · the one in charge of reliability · wants realistic targets
- 📏 **Ruler** · SLI · the real measurement: "% of requests that succeed in under 300 ms"
- 🎯 **Target** · SLO · "99.9% per month"
- 💰 **Allowance** · error budget · how much can fail in the period (99.9% ≈ 43 minutes per month)
- 📜 **Contract** · SLA · the promise to the customer, with penalties, a bit below the SLO
- 🚨 **Hysterical alarm** · cause-based alert (high CPU) · rings when nobody is suffering
- 🔥 **Smart alarm** · burn-rate alert · rings when the allowance is running out too fast
- 📊 **Lying average** · average latency · hides whoever is waiting a long time
- 🐢 **p99** · 99th percentile · shows the slowest 1%

## 🎬 Scene 1 · The negotiation
**Boss**: "I want 100% availability!"
**SRE**: "Not even the customer's internet has 100%, boss. Let's agree on a target: 99.9% of requests succeed in under 300 ms, per month." 🎯
**Ruler**: "And I actually measure that, request by request." 📏
**Allowance**: "And I'm what's left over: about 43 minutes of errors a month. Some left? The team can take risks and ship fast. All gone? Pause new features and focus on stability." 💰
**Contract**: "And I'm what goes on paper for the customer, with penalties. I sit a bit below the target to leave some slack." 📜
= 📏 SLI: % of OK requests in < 300 ms
= 🎯 SLO: 99.9% per month
= 💰 Error budget: ~43 min/month
= 📜 SLA: 99.5% (with penalties)

## 🎬 Scene 2 · The alarms
**Hysterical alarm**: "CPU AT 81%! WAKE UP, WAKE UP!" 🚨
**SRE** _(2 a.m.)_: "Were any users affected?"
**Hysterical alarm**: "…no."
**SRE**: "THEN LET ME SLEEP, FOR THE LOVE OF GOD!" 😤
**Smart alarm**: "I only ring when the allowance is draining too fast, meaning real people are suffering. And I come with the step-by-step of what to do." 🔥
= 🚨 81% CPU alert: woke someone with no users affected ❌
= 🔥 Burn-rate alert: fires if the budget burns 14x faster (1h and 5min)
= 📋 Runbook: linked in the alert

## 🎬 Scene 3 · The average
**Lying average**: "I look gorgeous: 120 ms!" 📊
**p99**: "You're hiding that 1 in every 100 users waits 8 seconds, dear." 🐢🙄
= 📊 Average: 120 ms
= 🐢 p99: 8 s ❌
= ✅ Look at: p95 and p99

## 💻 Translating to code
```promql
# 📏 SLI: share of good requests
sum(rate(http_requests_total{status!~"5..", le="0.3"}[30d]))
  / sum(rate(http_requests_total[30d]))

# 🔥 burn-rate alert: spending the allowance 14x faster than normal (1h and 5m)
(1 - sli_1h) / (1 - 0.999) > 14.4 and (1 - sli_5m) / (1 - 0.999) > 14.4
```

| Term | What it is | Example |
| --- | --- | --- |
| SLI | The measurement | % of OK requests in < 300 ms |
| SLO | The internal target | 99.9% per month |
| Error budget | What may fail | ~43 min/month |
| SLA | The customer contract | 99.5% or a penalty |

## 🎤 For the interview
"SLI is the measurement, SLO is the internal target, and SLA is the customer contract. The error budget is how much may fail in the period and balances speed and stability: some left, take risks; none left, stabilize. I alert on symptoms that affect users, by burn rate, with a runbook, and I look at percentiles like p95 and p99, not averages."
