**User**: "I'm Camila, my password is…"

**Authentication** 🪪: "Confirmed: you're Camila."

**Authorization** 🛂: "And I decide what Camila MAY do. Being Camila doesn't let you approve trips from another cost center."

**Cookie session** 🍪: "I keep your badge on the server and give you just a number in an `httpOnly` cookie. Want to log out? I delete it on the server and done."

**JWT** 🎟️: "I'm a signed ticket: everything is written on me, nobody needs to check the database. But… if I'm stolen, I'm valid until I expire."

**Hacker**: "I'll read what's in the JWT!"

**JWT**: "Go ahead, I'm only **encoded**, not encrypted. You just can't CHANGE me, because of the signature." ✍️

**Access token** ⏱️: "That's why I only last 15 minutes."

**Refresh token** 🔄: "And I renew the access token, but I get swapped on every use. If someone uses an old refresh token, I take the whole family down." 🚨

**OAuth / "Sign in with Google"** 🔑: "I let an app access something on your behalf without knowing your password. OIDC adds the 'who are you' part to me."

**PKCE**: "And I protect that flow in browser and mobile apps, where secrets can't be stored."

**🧠 Interview takeaway**

"Authentication says who you are; authorization says what you may do, always on the server. Cookie sessions with `httpOnly` are simple and revocable; JWT is self-contained but hard to revoke, so short access + rotating refresh. For an SPA, Authorization Code + PKCE or a BFF that keeps the tokens on the server."
