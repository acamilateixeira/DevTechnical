# 🚢 O capataz que nunca dorme

> Você entrega sua API pro Kubernetes e diz: "quero 3 cópias rodando, sempre". Ele leva isso MUITO a sério.

## 🎭 Elenco
- 🙋 **Você** · o manifesto YAML · diz o estado desejado, não o passo a passo
- 📋 **Capataz** · Deployment · garante que sempre existam N cópias e faz a troca de versão
- 📦 **Peão** · Pod · uma cópia rodando; é descartável, morre e renasce em outra máquina
- 📞 **Telefone fixo** · Service · um endereço estável que distribui as ligações entre os pods saudáveis
- 🚦 **Porteiro** · readiness probe · "já pode receber gente?"
- 💓 **Enfermeiro** · liveness probe · "tá vivo?" Se travou, reinicia
- 🍔 **Peão comilão** · pod que passou do `limits.memory` · leva OOMKilled
- 💀 **Kernel** · o sistema operacional · quem mata o comilão

- 🛒 **Clientes** · os usuários · nem percebem o deploy
- 👷 **Todos os peões** · todos os pods ao mesmo tempo
## 🎬 Cena 1 · O combinado
**Você**: "Quero 3 cópias da minha API rodando, sempre."
**Capataz**: "Anotado. Caiu uma? Subo outra. Não discuto, só obedeço." 📋
**Peão**: "Eu sou uma das cópias. Hoje tô nessa máquina, amanhã sei lá." 📦
**Telefone fixo**: "E ninguém precisa saber em qual peão liga: liga em mim que eu distribuo entre os que estão bem." 📞
= 📋 Réplicas desejadas: 3
= 📦 Pods rodando: 3 (em máquinas diferentes)
= 📞 Service `api`: distribui entre os 3

## 🎬 Cena 2 · Trocando a versão sem ninguém perceber
**Capataz**: "Versão nova! Subo UM peão novo…"
**Porteiro**: "Peraí, ele já tá pronto pra receber gente? …Agora sim!" 🚦
**Capataz**: "…então mando UM velho embora, com aviso pra ele terminar o que estava fazendo. E repito até trocar todos." 🔄
**Clientes**: "Teve deploy? Nem vi." 😎
= 🆕 Pods da versão nova: 1 → 2 → 3
= 👴 Pods da versão velha: 3 → 2 → 1 → 0 (cada um com SIGTERM)
= 🚦 Recebe tráfego: só o pod com readiness OK
= 😎 Requisições perdidas: 0 ✅

## 🎬 Cena 3 · Os perrengues
**Enfermeiro**: "Tá vivo? Tá vivo? Travou? Reinicio." 💓
**Enfermeiro mal configurado**: "Eu checo se o BANCO tá vivo. Se o banco cair…"
**Todos os peões**: "…a gente reinicia em loop sem motivo! Socorro!" 😵
**Peão comilão**: "Comi mais memória do que o meu limite…" 🍔
**Kernel**: "OOMKilled. Tchau, querido." 💀
= 💓 Liveness checando o banco: banco caiu → todos reiniciam em loop ❌
= ✅ Liveness certa: só "o processo responde?"
= 🍔 Pod acima de 512Mi: OOMKilled (exit 137)

## 💻 Traduzindo pro código
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
          readinessProbe: { httpGet: { path: /ready, port: 3000 } }   # 🚦 pode checar dependências
          livenessProbe:  { httpGet: { path: /live,  port: 3000 } }   # 💓 só "o processo responde?"
---
apiVersion: v1
kind: Service                          # 📞
metadata: { name: api }
spec: { selector: { app: api }, ports: [{ port: 80, targetPort: 3000 }] }
```

| Peça | Para quê |
| --- | --- |
| Pod | Uma ou mais containers rodando juntos, descartável |
| Deployment | Mantém N réplicas e faz rolling update |
| Service | Endereço estável e balanceamento |
| Readiness | Decide se recebe tráfego |
| Liveness | Decide se reinicia |
| HPA | Aumenta e diminui réplicas por métrica |

## 🎤 Pra entrevista
"Deployment mantém N réplicas de pods e Service dá um endereço estável. No rolling update, cada pod novo só recebe tráfego quando a readiness passa, e o antigo sai com graceful shutdown. Liveness reinicia o processo travado e não deve checar o banco, senão um problema no banco reinicia tudo em loop. Passar do limite de memória dá OOMKilled."
