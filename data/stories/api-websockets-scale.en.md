**Polling** 🔁: "Anything new? No. Anything new? No. Anything new? No…" *(wearing out the server)*

**SSE** 📻: "I'm a radio: the server talks, the browser only listens. Great for notifications and live logs."

**WebSocket** ☎️: "I'm an open phone call: both sides talk whenever they want. Chat, games, collaboration."

**User A** (connected to Server 1): "I sent a message to the group!"

**User B** (connected to Server 2): "Nothing arrived for me…" 😢

**Server 1**: "I only know who is connected TO ME."

**Redis pub/sub** 📢 (the backplane): "Then publish to me and I'll spread it to ALL servers!"

**Server 2**: "Got it from Redis! Delivering to User B." ✅

**Deploy**: 💥 *(drops the connections)*

**Clients**: "Reconnecting… but with a **random wait** (backoff + jitter), otherwise 50,000 arrive in the same second and bring everything down again." 🎲

**🧠 Interview takeaway**

"Polling is simple but costly; SSE is server → client; WebSocket is bidirectional. To scale across instances I use a pub/sub backplane (Redis, NATS) and, with long-polling, sticky sessions. I authenticate at the handshake, use heartbeats, and reconnect with backoff + jitter."
