# 📟 O plantão das 3 da manhã

> O celular da plantonista toca às 3h: "taxa de erro do checkout subiu". Ela tem três informantes pra descobrir o que aconteceu.

## 🎭 Elenco
- 📟 **Plantonista** · quem está de sobreaviso · acordada, de pijama e sem paciência
- 🌡️ **Termômetro** · métricas (Prometheus, Elastic) · diz QUE algo mudou e QUANTO, barato e bom pra alerta
- 🗺️ **GPS** · traces distribuídos · mostra por ONDE uma requisição passou e quanto tempo ficou em cada lugar
- 📔 **Diário** · logs estruturados (JSON) · conta o detalhe, o POR QUÊ
- 🔗 **Barbante** · `trace.id` · liga métrica, trace e log da mesma requisição
- 🤦 **Bilhetinho inútil** · `console.log('aqui')` · log que não ajuda ninguém
- 💣 **Rótulo bomba** · label `user_id` numa métrica · cria uma série por usuário e explode o banco de métricas
- 🔌 **Tomada universal** · OpenTelemetry · instrumenta uma vez e manda pra qualquer ferramenta

- 🗄️ **Banco de métricas** · Prometheus / Elastic · onde as séries de métricas ficam
## 🎬 Cena 1 · Os três informantes
**Plantonista**: "Subiu o erro. Mas ONDE? POR QUÊ? São 3 da manhã, gente!" 😩
**Termômetro**: "O erro do checkout pulou de 0,1% pra 8% às 2h50. Não sei o porquê, mas sei quando e quanto." 🌡️
**GPS**: "Peguei uma requisição lenta: API 2 ms, serviço de pagamento 3 ms, provedor externo… 4 SEGUNDOS. Achei onde dói." 🗺️
**Diário**: "Filtra pelo barbante dessa requisição: 'provider timeout after 4000ms, retry 3/3'. Tá aí o detalhe." 📔
**Plantonista**: "O termômetro me disse QUE deu ruim, o GPS disse ONDE e o diário disse POR QUÊ. Volto a dormir em 10 minutos." 💡

## 🎬 Cena 2 · Os que atrapalham
**Bilhetinho inútil**: "`aqui`" 🤦
**Plantonista**: "Aqui ONDE, criatura?"
**Rótulo bomba**: "E se eu criar uma série de métrica por usuário? São só 2 milhões…" 💣
**Banco de métricas**: "Aí EU que acordo às 3 da manhã. Cuidado com a cardinalidade!" 💥
**Tomada universal**: "E não instrumenta pra cada ferramenta: liga em mim uma vez e manda pra Elastic, Grafana ou Datadog." 🔌

## 💻 Traduzindo pro código
```js
// 📔 log estruturado, com o 🔗 barbante
logger.error({ service: 'checkout', 'trace.id': span.spanContext().traceId, provider: 'acme', ms: 4000 },
  'provider timeout');

// 🌡️ métrica com labels de baixa cardinalidade (rota, status), nunca user_id
httpErrors.add(1, { route: '/checkout', status: 502 });

// 🗺️ trace: o OpenTelemetry cria os spans de HTTP, banco e fila automaticamente
const sdk = new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] }); // 🔌
```

| Sinal | Responde | Custo | Exemplo |
| --- | --- | --- | --- |
| Métrica | Que algo mudou, e quanto | Baixo | taxa de erro, p99 |
| Trace | Onde está a lentidão | Médio (amostragem) | o span do provedor com 4 s |
| Log | Por quê | Alto em volume | a mensagem de timeout |

## 🎤 Pra entrevista
"Monitoramento responde perguntas conhecidas; observabilidade permite investigar o desconhecido. Métricas dizem que algo mudou e são baratas para alerta, traces mostram onde está a lentidão, logs estruturados dizem o porquê. Os três se ligam pelo `trace.id`, e o OpenTelemetry padroniza a instrumentação. Cuido da cardinalidade das métricas."
