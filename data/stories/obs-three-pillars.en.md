# 📟 The 3 a.m. on-call shift

> The on-call engineer's phone rings at 3 a.m.: "checkout error rate is up". She has three informants to figure out what happened.

## 🎭 Cast
- 📟 **On-call engineer** · whoever is on call · awake, in pajamas, and out of patience
- 🌡️ **Thermometer** · metrics (Prometheus, Elastic) · says THAT something changed and HOW MUCH, cheap and good for alerts
- 🗺️ **GPS** · distributed traces · shows WHERE a request went and how long it stayed at each stop
- 📔 **Diary** · structured logs (JSON) · tells the detail, the WHY
- 🔗 **String** · `trace.id` · ties together the metric, trace, and log of the same request
- 🤦 **Useless note** · `console.log('here')` · a log that helps nobody
- 💣 **Bomb label** · a `user_id` label on a metric · creates one series per user and blows up the metrics store
- 🔌 **Universal plug** · OpenTelemetry · instrument once and send to any tool

- 🗄️ **Metrics store** · Prometheus / Elastic · where metric series are stored
## 🎬 Scene 1 · The three informants
**On-call engineer**: "Errors are up. But WHERE? WHY? It's 3 a.m., people!" 😩
**Thermometer**: "Checkout errors jumped from 0.1% to 8% at 2:50. I don't know why, but I know when and how much." 🌡️
**GPS**: "I caught a slow request: API 2 ms, payment service 3 ms, external provider… 4 SECONDS. Found where it hurts." 🗺️
**Diary**: "Filter by that request's string: 'provider timeout after 4000ms, retry 3/3'. There's your detail." 📔
**On-call engineer**: "The thermometer told me THAT it broke, the GPS told me WHERE, and the diary told me WHY. Back to sleep in 10 minutes." 💡

## 🎬 Scene 2 · The ones who get in the way
**Useless note**: "`here`" 🤦
**On-call engineer**: "Here WHERE, you creature?"
**Bomb label**: "What if I create one metric series per user? It's only 2 million…" 💣
**Metrics store**: "Then I'M the one waking up at 3 a.m. Watch the cardinality!" 💥
**Universal plug**: "And don't instrument for each tool: plug into me once and send to Elastic, Grafana, or Datadog." 🔌

## 💻 Translating to code
```js
// 📔 structured log, with the 🔗 string
logger.error({ service: 'checkout', 'trace.id': span.spanContext().traceId, provider: 'acme', ms: 4000 },
  'provider timeout');

// 🌡️ metric with low-cardinality labels (route, status), never user_id
httpErrors.add(1, { route: '/checkout', status: 502 });

// 🗺️ trace: OpenTelemetry creates HTTP, database, and queue spans automatically
const sdk = new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] }); // 🔌
```

| Signal | Answers | Cost | Example |
| --- | --- | --- | --- |
| Metric | That something changed, and how much | Low | error rate, p99 |
| Trace | Where the slowness is | Medium (sampling) | the 4 s provider span |
| Log | Why | High at volume | the timeout message |

## 🎤 For the interview
"Monitoring answers known questions; observability lets you investigate the unknown. Metrics say something changed and are cheap for alerting, traces show where the slowness is, and structured logs say why. The three are linked by `trace.id`, and OpenTelemetry standardizes the instrumentation. I watch metric cardinality."
