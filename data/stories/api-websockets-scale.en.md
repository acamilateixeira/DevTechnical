# 📞 The family group chat in two buildings

> A chat app with two servers. Bia is connected to one, Caio to the other. They're in the same group.

## 🎭 Cast
- 🔁 **"Are we there yet?" kid** · polling (`setInterval(fetch, 2000)`) · keeps asking if there's anything new
- 📻 **Radio** · SSE (`EventSource`) · the server talks, the browser only listens
- ☎️ **Open phone call** · WebSocket · both sides talk whenever they want
- 🏢 **Building 1** · server 1 · only knows who is connected to it
- 🏬 **Building 2** · server 2 · same
- 📢 **Neighborhood loudspeaker** · Redis pub/sub (the backplane) · spreads the message to every server
- 🎲 **Staggered return** · reconnection with backoff + jitter · each client waits a slightly different time before coming back

- 🖥️ **Server** · the back end · puts up with the "are we there yet?" kid
- 👩 **Bia** · user connected to Building 1
- 👦 **Caio** · user connected to Building 2
- 💥 **Deploy** · a new version going out · drops the open connections
- 👥 **50,000 clients** · every connection at once · they all want back in together
## 🎬 Scene 1 · Three ways to get news
**"Are we there yet?" kid**: "Anything new? No. Now? No. Now? No. NOW?" 🔁
**Server**: "Kid, I'll tell you!" 😩
**Radio**: "I'm the radio: I talk, you listen. Great for notifications and live logs." 📻
**Open phone call**: "And I'm the phone call: both sides talk whenever they want. Chat, games, co-editing." ☎️

## 🎬 Scene 2 · Different buildings
**Bia** _(in Building 1)_: "Posted a photo of the cake in the group!" 🎂
**Caio** _(in Building 2)_: "Nothing came through…" 😢
**Building 1**: "Well, I only know who lives IN ME."
**Neighborhood loudspeaker**: "Then announce it on me and I'll spread it to ALL the buildings!" 📢
**Building 2**: "Heard it on the loudspeaker! Delivering to Caio." ✅
**Caio**: "What a beautiful cake! Save me a slice!"
> 🚨 With several instances, each server only sees its own connections.

## 🎬 Scene 3 · After the deploy
**Deploy**: 💥 _(drops every call)_
**50,000 clients**: "EVERYONE RECONNECT RIGHT NOW!"
**Staggered return**: "NO! Each one waits a random little while, or 50,000 arrive in the same second and knock everything down again." 🎲

## 💻 Translating to code
```ts
const io = new Server(httpServer);
io.adapter(createAdapter(pubClient, subClient));  // 📢 Redis pub/sub between instances

io.use(authenticateOnHandshake);                  // validates the token on connect
io.on('connection', (socket) => {
  socket.join(`group:${socket.data.groupId}`);
  socket.on('msg', (m) => io.to(`group:${socket.data.groupId}`).emit('msg', m)); // reaches both buildings
});

// client: 🎲 backoff + jitter on reconnect
const wait = Math.min(30_000, 1000 * 2 ** attempt) * (0.5 + Math.random());
```

| | Direction | Use |
| --- | --- | --- |
| Polling | Client asks | Simple, but expensive |
| SSE | Server → client | Notifications, logs, progress |
| WebSocket | Both ways | Chat, games, collaboration |

## 🎤 For the interview
"Polling is simple but expensive; SSE is server to client; WebSocket is bidirectional. To scale across several instances I use a pub/sub backplane like Redis or NATS, plus sticky sessions when there's a long-polling fallback. I authenticate on the handshake, use heartbeats to detect dead connections, and reconnect with backoff and jitter."
