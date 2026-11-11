# 🚢 The foreman who never sleeps

> You hand your API to Kubernetes and say: "I want 3 copies running, always". It takes that VERY seriously.

## 🎭 Cast
- 🙋 **You** · the YAML manifest · states the desired state, not the step by step
- 📋 **Foreman** · Deployment · makes sure there are always N copies and handles version swaps
- 📦 **Worker** · Pod · one running copy; disposable, dies and is reborn on another machine
- 📞 **Landline** · Service · a stable address that spreads calls across healthy pods
- 🚦 **Doorman** · readiness probe · "can it take people yet?"
- 💓 **Nurse** · liveness probe · "are you alive?" If stuck, restart
- 🍔 **Greedy worker** · a pod over its `limits.memory` · gets OOMKilled
- 💀 **Kernel** · the operating system · the one who kills the greedy worker

- 🛒 **Customers** · the users · don't even notice the deploy
- 👷 **Every worker** · all the pods at once
- 💓 **Misconfigured nurse** · a liveness probe that checks the database · restarts everything when the database goes down
## 🎬 Scene 1 · The deal
**You**: "I want 3 copies of my API running, always."
**Foreman**: "Noted. One goes down? I start another. I don't argue, I just obey." 📋
**Worker**: "I'm one of the copies. Today I'm on this machine, tomorrow who knows." 📦
**Landline**: "And nobody needs to know which worker to call: call me and I'll spread it across the healthy ones." 📞
= 📋 Desired replicas: 3
= 📦 Pods running: 3 (on different machines)
= 📞 `api` Service: balances across the 3

## 🎬 Scene 2 · Swapping versions without anyone noticing
**Foreman**: "New version! I start ONE new worker…"
**Doorman**: "Hold on, is it ready to take people? …Now it is!" 🚦
**Foreman**: "…so I send ONE old one home, with notice so it finishes what it was doing. And repeat until all are swapped." 🔄
**Customers**: "There was a deploy? Didn't notice." 😎
= 🆕 New-version pods: 1 → 2 → 3
= 👴 Old-version pods: 3 → 2 → 1 → 0 (each with SIGTERM)
= 🚦 Gets traffic: only pods with readiness OK
= 😎 Requests lost: 0 ✅

## 🎬 Scene 3 · The headaches
**Nurse**: "Alive? Alive? Stuck? Restarting." 💓
**Misconfigured nurse**: "I check whether the DATABASE is alive. If the database goes down…"
**Every worker**: "…we restart in a loop for no reason! Help!" 😵
**Greedy worker**: "I ate more memory than my limit…" 🍔
**Kernel**: "OOMKilled. Bye, darling." 💀
= 💓 Liveness checking the database: database down → all restart in a loop ❌
= ✅ Correct liveness: just "does the process respond?"
= 🍔 Pod over 512Mi: OOMKilled (exit 137)

## 💻 Translating to code
```yaml
apiVersion: apps/v1
kind: Deployment                       # 📋
metadata: { name: api }
spec:
  replicas: 3
  strategy: { rollingUpdate: { maxUnavailable: 0, maxSurge: 1 } }
  template:
    spec:
      containers:
        - name: api                    # 📦
          image: api:3f9c2e1
          resources: { requests: { memory: 256Mi }, limits: { memory: 512Mi } } # 🍔
          readinessProbe: { httpGet: { path: /ready, port: 3000 } }   # 🚦 may check dependencies
          livenessProbe:  { httpGet: { path: /live,  port: 3000 } }   # 💓 only "does the process respond?"
---
apiVersion: v1
kind: Service                          # 📞
metadata: { name: api }
spec: { selector: { app: api }, ports: [{ port: 80, targetPort: 3000 }] }
```

| Piece | What for |
| --- | --- |
| Pod | One or more containers running together, disposable |
| Deployment | Keeps N replicas and does rolling updates |
| Service | Stable address and load balancing |
| Readiness | Decides whether it gets traffic |
| Liveness | Decides whether to restart |
| HPA | Scales replicas up and down by metric |

## 🎤 For the interview
"A Deployment keeps N pod replicas and a Service gives them a stable address. In a rolling update, each new pod only gets traffic once readiness passes, and the old one leaves with a graceful shutdown. Liveness restarts a stuck process and shouldn't check the database, or a database problem restarts everything in a loop. Exceeding the memory limit means OOMKilled."
