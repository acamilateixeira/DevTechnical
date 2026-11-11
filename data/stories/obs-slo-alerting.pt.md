# 💰 A mesada de erros

> O chefe quer 100% de disponibilidade. A SRE quer dormir. Os dois vão ter que negociar.

## 🎭 Elenco
- 🤵 **Chefe** · quem cobra resultado · quer perfeição
- 🧑‍🔧 **SRE** · quem cuida da confiabilidade · quer metas realistas
- 📏 **Régua** · SLI · a medida real: "% de requisições com sucesso em menos de 300 ms"
- 🎯 **Meta** · SLO · "99,9% no mês"
- 💰 **Mesada** · error budget · quanto pode falhar no período (99,9% ≈ 43 minutos por mês)
- 📜 **Contrato** · SLA · a promessa com multa pro cliente, um pouco abaixo do SLO
- 🚨 **Alarme histérico** · alerta de causa (CPU alta) · toca sem ninguém estar sofrendo
- 🔥 **Alarme esperto** · alerta por burn rate · toca quando a mesada está acabando rápido demais
- 📊 **Média mentirosa** · latência média · esconde quem está esperando muito
- 🐢 **p99** · percentil 99 · mostra o 1% mais lento

## 🎬 Cena 1 · A negociação
**Chefe**: "Quero 100% de disponibilidade!"
**SRE**: "Nem a internet do cliente tem 100%, chefe. Vamos combinar uma meta: 99,9% das requisições com sucesso em menos de 300 ms, por mês." 🎯
**Régua**: "E eu meço isso de verdade, requisição por requisição." 📏
**Mesada**: "E eu sou o que sobra: uns 43 minutos de erro no mês. Sobrou? O time pode arriscar e entregar rápido. Acabou? Freio nas novidades e foco em estabilidade." 💰
**Contrato**: "E eu sou o que vai no papel pro cliente, com multa. Fico um pouco abaixo da meta pra dar folga." 📜

## 🎬 Cena 2 · Os alarmes
**Alarme histérico**: "CPU EM 81%! ACORDA, ACORDA!" 🚨
**SRE** _(2h da manhã)_: "Algum usuário foi afetado?"
**Alarme histérico**: "…não."
**SRE**: "ENTÃO ME DEIXA DORMIR, PELO AMOR!" 😤
**Alarme esperto**: "Eu só toco quando a mesada está indo embora rápido demais, ou seja, gente de verdade sofrendo. E já venho com o passo a passo do que fazer." 🔥

## 🎬 Cena 3 · A média
**Média mentirosa**: "Tô linda: 120 ms!" 📊
**p99**: "Você esconde que 1 em cada 100 usuários espera 8 segundos, querida." 🐢🙄

## 💻 Traduzindo pro código
```promql
# 📏 SLI: proporção de requisições boas
sum(rate(http_requests_total{status!~"5..", le="0.3"}[30d]))
  / sum(rate(http_requests_total[30d]))

# 🔥 alerta de burn rate: gastando a mesada 14x mais rápido que o normal (1h e 5m)
(1 - sli_1h) / (1 - 0.999) > 14.4 and (1 - sli_5m) / (1 - 0.999) > 14.4
```

| Termo | O que é | Exemplo |
| --- | --- | --- |
| SLI | A medida | % de requisições OK em < 300 ms |
| SLO | A meta interna | 99,9% no mês |
| Error budget | O que pode falhar | ~43 min/mês |
| SLA | O contrato com o cliente | 99,5% ou multa |

## 🎤 Pra entrevista
"SLI é a medida, SLO é a meta interna e SLA é o contrato com o cliente. O error budget é quanto pode falhar no período e equilibra velocidade e estabilidade: sobrou, arrisca; acabou, estabiliza. Alerto sintomas que afetam usuários, por burn rate, com runbook, e olho percentis como p95 e p99, não média."
