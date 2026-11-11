**On-call engineer** (3 a.m.) 📟: "ALERT: error rate went up! But… where? Why?"

**Metric** 📈: "I'm the thermometer. I know checkout's error rate jumped from 0.1% to 8% at 2:50. I don't know why, but I know WHEN and HOW MUCH."

**Trace** 🗺️: "I'm a slow request's GPS: entered the API (2 ms) → called the payment service (3 ms) → waited on the external provider… **4 seconds**. Found where it hurts."

**Log** 📝: "And I'm the diary. Filter by that request's `trace.id`: `provider timeout after 4000ms, retry 3/3`. There's the detail."

**On-call engineer**: "The metric told me THAT something went wrong, the trace told me WHERE, and the log told me WHY." 💡

**Bad log**: "`console.log('here')`" 🤦

**Structured log**: "`{ level: 'error', service: 'checkout', trace.id: 'abc', msg: 'provider timeout' }`. Filterable by any field."

**Metric with `user_id` as a label** 💣: "What if I create one series per user?"

**Metrics store**: "Then I explode. Watch the cardinality!" 💥

**OpenTelemetry** 🔌: "Instrument once with me and send to any tool: Elastic, Grafana, Datadog."

**🧠 Interview takeaway**

"Monitoring answers known questions; observability lets you investigate the unknown. Metrics say something changed (cheap, good for alerts), traces say where the slowness is, structured logs say why. They're linked by `trace.id`, and OpenTelemetry standardizes the instrumentation."
