**Plantonista** (3h da manhã) 📟: "ALERTA: taxa de erro subiu! Mas… onde? Por quê?"

**Métrica** 📈: "Eu sou o termômetro. Sei que a taxa de erro do checkout pulou de 0,1% pra 8% às 2h50. Não sei o porquê, mas sei QUANDO e QUANTO."

**Trace** 🗺️: "Eu sou o GPS de uma requisição lenta: entrou na API (2 ms) → chamou o serviço de pagamento (3 ms) → esperou o provedor externo… **4 segundos**. Achei onde dói."

**Log** 📝: "E eu sou o diário. Filtra pelo `trace.id` dessa requisição: `provider timeout after 4000ms, retry 3/3`. Aí está o detalhe."

**Plantonista**: "Métrica me disse QUE algo deu errado, o trace me disse ONDE e o log me disse POR QUÊ." 💡

**Log ruim**: "`console.log('aqui')`" 🤦

**Log estruturado**: "`{ level: 'error', service: 'checkout', trace.id: 'abc', msg: 'provider timeout' }`. Dá pra filtrar por qualquer campo."

**Métrica com `user_id` como label** 💣: "E se eu criar uma série por usuário?"

**Banco de métricas**: "Aí eu explodo. Cuidado com a cardinalidade!" 💥

**OpenTelemetry** 🔌: "Instrumenta uma vez comigo e manda pra qualquer ferramenta: Elastic, Grafana, Datadog."

**🧠 Moral da história para entrevista**

"Monitoramento responde perguntas conhecidas; observabilidade permite investigar o desconhecido. Métricas dizem que algo mudou (barato, bom para alerta), traces dizem onde está a lentidão, logs estruturados dizem o porquê. Elas se ligam pelo `trace.id`, e o OpenTelemetry padroniza a instrumentação."
