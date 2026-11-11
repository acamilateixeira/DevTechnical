# 🦹 The comment with a bug inside

> A travel site with customer comments. A very polite "customer" leaves a compliment about the hotel.

## 🎭 Cast
- 🦹 **Crook** · the attacker · hides code inside the comment text
- 🖼️ **Bait** · `<img src=x onerror="...">` · the broken image that fires the script when it fails
- 🛡️ **Safe board** · `<p>{comentario}</p>` · React escaping: shows everything as text
- 🕳️ **Unguarded board** · `dangerouslySetInnerHTML` · pastes the HTML straight into the page
- 🧹 **Sieve** · sanitizing (DOMPurify) · removes `<script>`, `onerror`, `javascript:` and keeps the rest
- 🌐 **Browser** · the browser · obeys whatever HTML it gets
- 🍪 **Cookie** · `httpOnly` cookie · the session, which JavaScript can't read

- ⚛️ **React** · the library · escapes everything, unless told not to
## 🎬 Scene 1 · The "innocent" compliment
**Crook**: "Great trip! Loved the hotel! And here's a little picture as a gift…" _(with the bait hidden inside)_ 😇
**Safe board**: "Got text? I show it as TEXT. The `<` and `>` become little characters on the screen. I don't run anything." 🛡️
**Crook**: "Dang, my code showed up on the screen like a fool." 😒

## 🎬 Scene 2 · The unguarded board
**Unguarded board**: "Got HTML? I paste it straight into the page without even looking!"
**Browser**: "Oh, an image! Let me load it… doesn't exist… so I'll run the `onerror`!"
**Bait**: "IT WORKED! The Crook's script is running!" 💥
**Crook**: "Now I'm INSIDE the page, with Bia logged in. I can read the screen, place orders in her name…" 😈
**React** _(rolling its eyes)_: "I warned you, people. It says DANGEROUSLY right in the name!" 🙄
> 🚨 User text became code: that's XSS.

## 🎬 Scene 3 · With a sieve and an armored cookie
**Sieve**: "Got HTML? Before showing it, I sift it: bye `<script>`, bye `onerror`, bye `javascript:`. Bold can stay, it's harmless." 🧹
**Crook**: "All that's left is a broken image. What a life." 😭
**Cookie**: "And even if a script got in, it couldn't read me. JavaScript can't touch me." 🍪🔒

## 💻 Translating to code
```tsx
<p>{comentario}</p>                                            {/* 🛡️ React escapes it: it becomes text */}
<p dangerouslySetInnerHTML={{ __html: comentario }} />          {/* 🕳️ runs the bait */}
<p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comentario) }} /> {/* 🧹 sifted */}
```
```http
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax     # 🍪 JS can't read it
Content-Security-Policy: script-src 'self'                  # only scripts from the site itself run
```

| Dangerous spot in React | Why |
| --- | --- |
| `dangerouslySetInnerHTML` | Pastes HTML without escaping |
| `<a href={url}>` with `javascript:` | Clicking runs code |
| Libraries that touch the DOM directly | They go around React |

## 🎤 For the interview
"XSS is when user text becomes code on someone else's page. React escapes everything inside curly braces, so the risk shows up with `dangerouslySetInnerHTML`, `href` with `javascript:`, and libraries that touch the DOM directly. If I need to show user HTML, I sanitize it with DOMPurify, and I use CSP and `httpOnly` cookies as defense in depth."
