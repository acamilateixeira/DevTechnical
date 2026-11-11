**API**: "Aprovei a viagem! Salvei no banco. COMMIT! ✅ Agora vou avisar o RabbitMQ…"

**Servidor**: 💥 *(caiu antes de avisar)*

**Banco**: "Viagem APROVADA aqui."

**RabbitMQ**: "Aprovada? Ninguém me falou nada."

**Serviço de e-mail**: "Então não mando e-mail nenhum."

**Solicitante**: "Minha viagem foi aprovada e ninguém me avisou?! 😤" **← dual write**

**Agora com Outbox:**

**API**: "Na MESMA transação eu salvo a aprovação **e** um bilhetinho na tabela outbox: 'avisar: viagem aprovada'. Ou salva os dois, ou nenhum." 📝

**Servidor**: 💥 *(caiu de novo, logo depois do commit)*

**Relay** (outro processo, que lê a outbox de tempos em tempos): "Achei um bilhetinho não publicado! Publico no RabbitMQ." 📮

**Serviço de e-mail**: "Recebi! 📧 E-mail enviado."

**Relay**: "Agora vou marcar o bilhetinho como publicado e—" 💥 *(caiu antes de marcar)*

**Relay** (reiniciado): "Bilhetinho não marcado? PUBLICO DE NOVO!" 📮

**Serviço de e-mail sem dedupe**: "Recebi de novo! 📧 Mandei de novo!" *(o solicitante recebe 2 e-mails)*

**Serviço de e-mail com dedupe**: "Esse ID de mensagem eu já processei. Ignoro." 🛑

**🧠 Moral da história para entrevista**

"Banco e fila não participam da mesma transação (dual write). Com o **outbox**, gravo o evento na mesma transação do dado e um relay publica depois. Isso dá **at-least-once**: a mensagem pode chegar repetida, então o consumidor precisa ser **idempotente** (deduplicar pelo ID)."
