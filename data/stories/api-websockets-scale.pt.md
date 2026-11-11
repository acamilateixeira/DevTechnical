# 📞 O grupo da família em dois prédios

> Um app de chat com dois servidores. A Bia está conectada num, o Caio no outro. Eles estão no mesmo grupo.

## 🎭 Elenco
- 🔁 **Chato do "já chegou?"** · polling (`setInterval(fetch, 2000)`) · pergunta toda hora se tem novidade
- 📻 **Rádio** · SSE (`EventSource`) · o servidor fala, o navegador só escuta
- ☎️ **Ligação aberta** · WebSocket · os dois lados falam quando quiserem
- 🏢 **Prédio 1** · servidor 1 · só conhece quem está conectado nele
- 🏬 **Prédio 2** · servidor 2 · idem
- 📢 **Alto-falante do bairro** · Redis pub/sub (o backplane) · espalha o recado pra todos os servidores
- 🎲 **Volta escalonada** · reconexão com backoff + jitter · cada cliente espera um tempinho diferente pra voltar

- 🖥️ **Servidor** · o back-end · quem aguenta o chato do "já chegou?"
- 👩 **Bia** · usuária conectada no Prédio 1
- 👦 **Caio** · usuário conectado no Prédio 2
- 💥 **Deploy** · versão nova subindo · derruba as conexões abertas
- 👥 **50 mil clientes** · todas as conexões ao mesmo tempo · querem voltar juntas
## 🎬 Cena 1 · Os três jeitos de saber das coisas
**Chato do "já chegou?"**: "Tem novidade? Não. E agora? Não. E agora? Não. E AGORA?" 🔁
**Servidor**: "Menino, eu te aviso!" 😩
**Rádio**: "Eu sou a rádio: eu falo, você escuta. Ótimo pra notificação e log ao vivo." 📻
**Ligação aberta**: "E eu sou a ligação: os dois falam quando quiserem. Chat, jogo, edição junto." ☎️

## 🎬 Cena 2 · Prédios diferentes
**Bia** _(no Prédio 1)_: "Mandei foto do bolo no grupo!" 🎂
**Caio** _(no Prédio 2)_: "Não chegou nada…" 😢
**Prédio 1**: "Uai, eu só conheço quem mora EM MIM."
**Alto-falante do bairro**: "Então anuncia em mim que eu espalho pra TODOS os prédios!" 📢
**Prédio 2**: "Ouvi no alto-falante! Entregando pro Caio." ✅
**Caio**: "Que bolo lindo! Guarda um pedaço!"
> 🚨 Com várias instâncias, cada servidor só enxerga as próprias conexões.

## 🎬 Cena 3 · Depois do deploy
**Deploy**: 💥 _(derruba todas as ligações)_
**50 mil clientes**: "RECONECTA TODO MUNDO AGORA!"
**Volta escalonada**: "NÃO! Cada um espera um tempinho aleatório, senão 50 mil chegam no mesmo segundo e derrubam tudo de novo." 🎲

## 💻 Traduzindo pro código
```ts
const io = new Server(httpServer);
io.adapter(createAdapter(pubClient, subClient));  // 📢 Redis pub/sub entre as instâncias

io.use(autenticarNoHandshake);                    // valida o token na conexão
io.on('connection', (socket) => {
  socket.join(`grupo:${socket.data.grupoId}`);
  socket.on('msg', (m) => io.to(`grupo:${socket.data.grupoId}`).emit('msg', m)); // chega nos dois prédios
});

// cliente: 🎲 backoff + jitter na reconexão
const espera = Math.min(30_000, 1000 * 2 ** tentativa) * (0.5 + Math.random());
```

| | Direção | Uso |
| --- | --- | --- |
| Polling | Cliente pergunta | Simples, mas caro |
| SSE | Servidor → cliente | Notificações, logs, progresso |
| WebSocket | Os dois lados | Chat, jogo, colaboração |

## 🎤 Pra entrevista
"Polling é simples mas caro; SSE é servidor para cliente; WebSocket é bidirecional. Para escalar com várias instâncias uso um backplane de pub/sub, como Redis ou NATS, e sticky sessions quando há fallback de long-polling. Autentico no handshake, faço heartbeat para detectar conexão morta e reconexão com backoff e jitter."
