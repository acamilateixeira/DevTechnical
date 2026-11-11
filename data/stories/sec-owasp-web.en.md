# 🐱 The kitten, the neighbor's invoice, and the apostrophe

> Three classic attacks on a banking site. They all start with someone very friendly.

## 🎭 Cast
- 👩 **Bia** · the user logged into her bank · just wanted to see a cat photo
- 🐱 **Kitten site** · a malicious site · under the photo, it makes the browser send a request to the bank
- 🍪 **Session cookie** · Bia's login · the browser sends it with every request to the bank
- 🛑 **Suspicious cookie** · `SameSite=Lax` · doesn't go along on requests coming from another site
- 🎫 **Form password** · CSRF token · a code only the bank's own site knows
- 🤔 **Snoop** · a user changing the number in the URL · tries `/faturas/124`
- 🛂 **Checker** · ownership check on the server · "is this invoice yours?"
- 💉 **Sneaky apostrophe** · `' OR '1'='1` · text that tries to become an SQL command
- 📦 **Sealed envelope** · prepared statement · the text travels separately from the command

- 🏦 **Bank** · the bank's site · obeys any request with the right cookie
- 🕳️ **API with no checker** · an endpoint with no ownership check · hands over whatever is asked
- 🧵 **Query glued with `+`** · SQL built by concatenating text · obeys the apostrophe
## 🎬 Scene 1 · The kitten (CSRF)
**Bia**: "What a cute kitten! 🐱"
**Kitten site** _(under the photo)_: "Browser, send a POST `/transferir` to her bank!"
**Session cookie**: "Okay, I'm coming along, as always…" 🍪
**Bank**: "A request with Bia's cookie? Transferred!" 💸
> 🚨 The bank didn't know the request came from another site.
**Suspicious cookie**: "Not with me: a request coming from ANOTHER site, I stay home." 🛑
**Form password**: "And the bank also requires a code that only the bank's site has. The kitten doesn't know it." 🎫
= 🍪 Cookie on the kitten site's request: with `SameSite=Lax`: not sent ✅
= 🎫 CSRF token: missing → 403
= 💸 Transfers made: 0 ✅

## 🎬 Scene 2 · The neighbor's invoice (IDOR)
**Snoop**: "My invoice is `/faturas/123`… what if I try `/faturas/124`?" 🤔
**API with no checker**: "Here's 124!" _(it belongs to Mrs. Neusa in 302)_
**Checker**: "Hold on. Is 124 yours? No? Then 404, it doesn't exist for you." 🛂
= 🤔 Request: `GET /faturas/124`
= 🛂 Owner of invoice 124: someone else
= ✅ Response: 404 (doesn't even confirm it exists)

## 🎬 Scene 3 · The apostrophe (SQL injection)
**Sneaky apostrophe**: "Find the customer `' OR '1'='1`." 💉
**Query glued with `+`**: "Returning… EVERY CUSTOMER IN THE BANK!" 💥
**Sealed envelope**: "With me the text goes sealed, separate from the command. I literally look for someone named `' OR '1'='1`. Nobody. Next." 📦
= 💉 Input: `' OR '1'='1`
= 🧵 Concatenated: returns the whole table ❌
= 📦 Prepared statement: looks for that literal text → 0 rows ✅

## 💻 Translating to code
```php
// 💉 ❌ concatenated            📦 ✅ parameterized
$db->query("SELECT * FROM clientes WHERE nome = '" . $_GET['nome'] . "'");
$stmt = $pdo->prepare('SELECT * FROM clientes WHERE nome = :nome');
$stmt->execute(['nome' => $_GET['nome']]);

// 🛂 IDOR: ALWAYS look up by owner
$fatura = Fatura::where('id', $id)->where('cliente_id', auth()->id())->firstOrFail(); // 404 if it's not hers
```
```http
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax    # 🛑
```

| Attack | Main defense |
| --- | --- |
| CSRF | `SameSite`, CSRF token, no state changes on `GET` |
| IDOR (broken access control) | Check resource ownership on the server |
| SQL injection | Prepared statements / ORM |
| XSS | Escape on output, CSP (→ XSS lab) |

## 🎤 For the interview
"What I check most: per-resource access control on the server, since IDOR is number one in the OWASP Top 10; parameterized queries against injection; CSRF with `SameSite` cookies and tokens; XSS by escaping on output plus CSP; secrets kept out of the front end; and up-to-date dependencies."
