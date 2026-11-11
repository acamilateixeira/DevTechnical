**User** (logged into her bank, opens another site): "What a cute kitten! 🐱"

**Malicious site**: *(behind the kitten)* "Browser, send a POST `/transfer` to her bank!"

**Browser**: "Sure, and I'll bring the session cookie along, as always…" 🍪 **← CSRF**

**`SameSite` cookie** 🛑: "Wait: a request coming from ANOTHER site? I'm not going along."

**CSRF token** 🎫: "And the bank requires a secret code only the bank's own site knows. The kitten site doesn't have it."

**Curious user**: "My invoice is `/invoices/123`… what if I try `/invoices/124`?" 🤔

**API without a check**: "Here's invoice 124!" *(it belongs to someone else)* **← IDOR**

**API with a check** 🛂: "Is 124 yours? No. 404." ✅

**Search form**: "`' OR '1'='1`"

**Concatenated query**: "Returning ALL customers!" 💥 **← SQL injection**

**Prepared statement** 💉🚫: "With me, text travels separately from the command. I literally search for `' OR '1'='1`. Nothing found."

**🧠 Interview takeaway**

"What I check most: per-resource access control on the server (IDOR is OWASP #1), parameterized queries against injection, CSRF with SameSite and a token, XSS escaping on output, secrets out of the frontend, and up-to-date dependencies."
