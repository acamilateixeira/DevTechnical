**Chefe**: "Quero 100% de disponibilidade!"

**SRE**: "Nem a internet do cliente tem 100%. Vamos combinar uma **meta** (SLO): 99,9% das requisições com sucesso em menos de 300 ms, por mês."

**SLI** 📏: "Eu sou a régua que mede isso de verdade, requisição por requisição."

**Error budget** 💰: "E eu sou a mesada de falhas: 99,9% no mês deixa uns **43 minutos** de erro. Sobrou mesada? O time pode arriscar e entregar rápido. Acabou? Freio em features novas, foco em estabilidade."

**SLA** 📜: "E eu sou o contrato com o cliente, com multa. Fico um pouco abaixo do SLO pra dar margem."

**Alerta barulhento** 🚨: "CPU EM 81%! ACORDA!"

**Plantonista** (2h da manhã): "E algum usuário foi afetado?"

**Alerta**: "…não."

**Plantonista**: "ENTÃO NÃO ME ACORDA!" 😤

**Alerta por burn rate** 🔥: "Eu só toco quando a mesada de erros está sendo gasta rápido demais, ou seja, quando usuário de verdade está sofrendo. E venho com runbook."

**Média de latência** 📊: "Estou ótima: 120 ms!"

**p99**: "Você esconde que 1 em cada 100 usuários espera 8 segundos." 🙄

**🧠 Moral da história para entrevista**

"SLI é a medida, SLO a meta interna, SLA o contrato. O error budget é quanto pode falhar no período e equilibra velocidade e estabilidade. Alerto sintomas que afetam usuários, por burn rate, com runbook, e olho percentis (p95/p99), não média."
