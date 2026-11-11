# 🎟️ The club, the wristband, and the ticket

> Camila wants to log in and approve a trip. There's security at the door, and each one checks something different.

## 🎭 Cast
- 🪪 **Reception** · authentication · checks WHO you are (password, Google, biometrics)
- 🛂 **VIP-area security** · authorization · decides what you're ALLOWED to do, always on the server
- 🍪 **Wristband** · session with an `httpOnly` cookie · the server keeps who you are; you only carry a number
- 🎟️ **Signed ticket** · JWT · everything is written on the ticket itself, with a signature: nobody checks a list
- ⏱️ **15-minute ticket** · access token · short-lived so the damage is small
- 🔄 **Exchange token** · rotating refresh token · trades for a new ticket and is itself replaced on every use
- 🔑 **Power of attorney** · OAuth 2.0 / OIDC ("Sign in with Google") · lets an app act for you without knowing your password
- 🧩 **One-time code** · PKCE · protects the flow in browser and mobile apps, which can't keep secrets
- 🦹 **Gatecrasher** · the attacker

- 👩 **Camila** · the user · wants to log in and approve a trip
- 📱 **Travel app** · a third-party app · wants access to her calendar
## 🎬 Scene 1 · Who you are and what you can do
**Camila**: "Hi, I'm Camila, my password is…"
**Reception**: "Confirmed: you're Camila." 🪪
**Camila**: "Then I'll approve the Marketing cost center's trip!"
**VIP-area security**: "Whoa, whoa. Being Camila doesn't make you a Marketing manager. Not here." 🛂

## 🎬 Scene 2 · Wristband or ticket?
**Wristband**: "I keep your record on the server and give you just a number. Want to kick someone out? I delete it on the server, done." 🍪
**Signed ticket**: "Everything is written on me, nobody needs to check a list. But if I get stolen, I'm valid until I expire…" 🎟️
**Gatecrasher**: "I'll read what's written on the ticket!"
**Signed ticket**: "Go ahead, I'm only ENCODED, not encrypted. You just can't CHANGE me, because of the signature." ✍️
**15-minute ticket**: "That's why I don't last long." ⏱️
**Exchange token**: "And I get you a new ticket, but every time I'm used I get replaced too. If someone shows up with an old one, I cancel the whole family." 🔄🚨

## 🎬 Scene 3 · Sign in with Google
**Travel app**: "Can I see your Google calendar to suggest dates?"
**Power of attorney**: "Yes, but without her password. I'll give you limited access, calendar only." 🔑
**One-time code**: "And since you're a browser app that can't keep secrets, I'll protect the code exchange." 🧩

## 💻 Translating to code
```http
# 🍪 session
Set-Cookie: sid=8f2c...; HttpOnly; Secure; SameSite=Lax

# 🎟️ JWT: header.payload.signature (the payload is just base64, anyone can read it)
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjYW1pbGEiLCJleHAiOjE3MzE...
```
```ts
// 🛂 authorization always on the server, per resource
if (!user.managesCostCenter(trip.costCenterId)) throw new ForbiddenException();
```

| | Cookie session | JWT |
| --- | --- | --- |
| Where state lives | On the server | In the token itself |
| Revoking | Easy (delete the session) | Hard (wait for expiry) |
| Good for | Traditional web, BFF | Service-to-service APIs, mobile |

## 🎤 For the interview
"Authentication says who you are; authorization says what you can do, and it's always checked on the server, per resource. A session with an `httpOnly` cookie is simple and revocable; a JWT is self-contained but hard to revoke, so I use a short access token with a rotating refresh token. For SPAs, Authorization Code with PKCE or a BFF that keeps tokens on the server. OAuth delegates access; OIDC adds identity."
