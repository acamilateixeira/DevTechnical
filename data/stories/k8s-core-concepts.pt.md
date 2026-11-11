**Você** (pro Kubernetes): "Quero **3 cópias** da minha API rodando, sempre."

**Deployment** 📋: "Anotado. Se uma cair, eu subo outra."

**Pod** 📦: "Eu sou uma dessas cópias. Sou descartável: posso morrer e renascer em outra máquina."

**Service** 📞: "E eu sou o número fixo. Ninguém precisa saber em qual pod liga: eu distribuo entre os saudáveis."

**Deploy da versão nova** (rolling update):

**Deployment**: "Subo UM pod novo…"

**Readiness probe** 🚦: "Ele já está pronto pra receber gente? …Agora sim!"

**Deployment**: "…então desligo UM antigo (com SIGTERM, pra ele terminar o que estava fazendo). E repito até trocar todos." 🔄

**Liveness probe** 💓: "E eu fico perguntando 'tá vivo?'. Se travou, reinicio."

**Liveness mal configurada**: "Eu checo o BANCO. Se o banco cair…"

**Todos os pods**: "…a gente reinicia em loop! 😵"

**Pod comilão** 🍔: "Usei mais memória que o meu limite…"

**Kernel**: "**OOMKilled.** Tchau." 💀

**🧠 Moral da história para entrevista**

"Deployment mantém N réplicas de pods; Service dá um endereço estável. No rolling update, cada pod novo só recebe tráfego quando a readiness passa, e o antigo sai com graceful shutdown. Liveness reinicia o travado (não deve checar o banco). Passar do limite de memória dá OOMKilled."
