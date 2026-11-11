**Produtor**: "Tenho uma mensagem 'viagem.aprovada'."

**RabbitMQ** 📮 (os correios): "Me entrega na **exchange** (a agência). Pelas regras (bindings), eu levo pra fila certa: e-mail, ERP, relatório."

**Consumidor do e-mail**: "Peguei a mensagem… processei… **ack**!" ✅

**RabbitMQ**: "Ack recebido, apago a mensagem."

**Consumidor do ERP**: "Peguei… 💥 *(caiu sem dar ack)*"

**RabbitMQ**: "Sem ack? A mensagem volta pra fila e vai pra outro consumidor." 🔁

**Mensagem envenenada** ☠️: "Eu sempre quebro quem me processa."

**RabbitMQ**: "Depois de 5 tentativas com espera crescente, vai pra **DLQ** (a caixa de cartas sem destino). Alguém investiga depois." 📭

**Kafka** 📜 (o livro de registros): "Eu sou diferente. Não apago a mensagem quando alguém lê: guardo tudo em ordem. Cada consumidor lembra onde parou (offset) e pode **reler o histórico** quando quiser."

**🧠 Moral da história para entrevista**

"No RabbitMQ o produtor publica numa exchange, que roteia para filas; o consumidor dá ack manual depois de processar, com prefetch para controlar concorrência, retry com backoff e DLQ para mensagens problemáticas. Kafka é um log persistente que permite reprocessar: uso para streaming e vários consumidores relendo eventos."
