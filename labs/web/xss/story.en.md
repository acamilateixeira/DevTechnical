**Attacker** 🦹: "I'll leave an 'innocent' comment: `Great trip! <img src=x onerror="stealEverything()">`"

**Box 1, `{comentario}`**: "Text arrived? I show it as TEXT. The `<` and `>` become symbols on screen. I run nothing." 🛡️

**Attacker**: "Ugh, my code just showed up on screen like a fool. 😒"

**Box 2, `dangerouslySetInnerHTML`** (unsanitized): "HTML arrived? Straight into the page!"

**Browser**: "Oh, an image! Loading `x`… doesn't exist… so I run the `onerror`!"

**Attacker's script**: "I RAN! Now I'm INSIDE your page, with the logged-in user's session. I can read the screen, make requests on her behalf…" 😈 **← XSS**

**React** (looking at the property name): "I warned you: it says **dangerously** right there!" 🙄

**Box 3, `dangerouslySetInnerHTML` + sanitization**: "HTML arrived? Before showing it, I sift it: remove `<script>`, remove `onerror`, remove `javascript:`. The bold can stay." 🧹

**Attacker**: "Only a broken image left. 😭"

**`httpOnly` cookie** (outside): "And even if a script got in, it couldn't read me: JavaScript has no access to me." 🍪🔒

**🧠 Interview takeaway**

"React escapes everything inside `{ }`, so user text stays text. The risk appears with `dangerouslySetInnerHTML`, `href` with `javascript:`, and libraries that touch the DOM directly. If I must render user HTML, I sanitize it (DOMPurify), and use CSP and `httpOnly` cookies as defense in depth."
