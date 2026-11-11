**Polling** 🔁: "Tem novidade? Não. Tem novidade? Não. Tem novidade? Não…" *(cansando o servidor)*

**SSE** 📻: "Eu sou uma rádio: o servidor fala, o navegador só escuta. Ótimo pra notificações e logs ao vivo."

**WebSocket** ☎️: "Eu sou uma ligação aberta: os dois falam quando quiserem. Chat, jogo, colaboração."

**Usuária A** (conectada no Servidor 1): "Mandei mensagem pro grupo!"

**Usuária B** (conectada no Servidor 2): "Não chegou nada pra mim…" 😢

**Servidor 1**: "Eu só conheço quem está conectado EM MIM."

**Redis pub/sub** 📢 (o backplane): "Então publica em mim que eu espalho pra TODOS os servidores!"

**Servidor 2**: "Recebi do Redis! Entregando pra Usuária B." ✅

**Deploy**: 💥 *(derruba as conexões)*

**Clientes**: "Reconectando… mas com **espera aleatória** (backoff + jitter), senão 50 mil chegam no mesmo segundo e derrubam tudo de novo." 🎲

**🧠 Moral da história para entrevista**

"Polling é simples mas caro; SSE é servidor → cliente; WebSocket é bidirecional. Para escalar várias instâncias uso um backplane de pub/sub (Redis, NATS) e, com long-polling, sticky sessions. Autentico no handshake, faço heartbeat e reconexão com backoff + jitter."
