**A** (`console.log`): "I'M HERE! I'm first in line anyway! I'M TALKING NOW!"

**B** (`setTimeout`): "I WANT TO TALK TOO! IN 0ms!"

**Event Loop**: "EASY THERE, HOTSHOT! 0ms doesn't mean now! Wait your turn in the timer line!"

**C** (`Promise.then`): "MY PROMISE IS ALREADY RESOLVED! I promised something and now I want to run my `.then()`!"

**Event Loop**: "Fine! Get in the VIP microtask line!"

**D** (`queueMicrotask`): "I WANT THE VIP LINE TOO!"

**Event Loop**: "But where's your Promise?"

**D**: "I DON'T HAVE ANY PROMISE! 😂 I can go straight into the microtask line!"

**E** (`async`): "I'M ASYNC, BUT I WAS CALLED NOW! I'M NOT WAITING FOR ANYONE! I'M STARTING TO TALK!"

**`await null`**: "WAAAAIT, HOTSHOT! ✋ You already said everything before me! Now pause this function! The rest goes to the VIP microtask line!"

**F** (`console.log` after the `await`): "HEY, I HAVEN'T EVEN TALKED YET! 😭"

**`await`**: "THEN YOU'LL WAIT! C and D got to the VIP line first!"

**G** (`console.log`): "While everyone's in this mess, I'M DOING MY THING! I don't depend on anyone!"

**🚨 SYNCHRONOUS CODE IS DONE! THE VIP LINE IS OPEN!**

**C** (`Promise.then`): "I GOT IN FIRST! MY TURN!"

**D** (`queueMicrotask`): "I'M SECOND! DIDN'T EVEN NEED A PROMISE!"

**F** (`console.log` after the `await`): "FINALLY! The `await` held me back, but now I can talk!"

**⏰ NOW IT'S THE TIMERS' TURN!**

**B** (`setTimeout`): "WHAT ABOUT ME, PEOPLE?! 😭 IT WAS SUPPOSED TO BE 0ms!"

**Event Loop**: "NOW IT'S YOUR TURN! But don't get excited! If you create microtasks, they'll run before the next timer!"

**B**: "FINALLY! 😂"

| Order | Line | Who |
| --- | --- | --- |
| 1 | Synchronous code (runs first) | A, E, G |
| 2 | Microtasks (VIP line) | C, D, F |
| 3 | Timer / macrotask (after the microtasks) | B |

**🧠 Interview takeaway**

- **Synchronous**: "We're here! We work first!"
- **Microtasks**: "We're in the VIP line! As soon as the synchronous code finishes, IT'S OUR TURN!"
- **Timers**: "WE'RE STUCK WAITING! 😭"
- **Event Loop**: "I ORGANIZE THIS MESS! First the synchronous code finishes, then I empty the microtask line. Then I run the next macrotask and check the microtasks again. AND SO ON!"
- **And the `await`?** "I DON'T STOP THE WHOLE PROGRAM! I only pause my own function. EVERYONE ELSE CAN FEND FOR THEMSELVES!" 😂

**📌 Part 2: who decides the line?**

What decides whether something is a microtask or a macrotask is the **API that schedules it**, not how long it takes or how important it is.

**Microtask**: "I'M IN THE VIP LINE! As soon as the current code finishes, I WANT TO RUN BEFORE THE NEXT MACROTASK!"

**Macrotask**: "I WANT TO RUN TOO!"

**Event Loop**: "FINE, BUT FIRST I'LL EMPTY THE VIP LINE!"

| Microtasks (VIP line) | Macrotasks (regular line) |
| --- | --- |
| `Promise.then()` | `setTimeout()` |
| `Promise.catch()` | `setInterval()` |
| `Promise.finally()` | Events like `click` |
| `queueMicrotask()` | `MessageChannel` messages |
| Continuation after `await` | I/O tasks, depending on the environment |
| `MutationObserver` | `setImmediate` (Node) |

Example: `setTimeout(() => console.log("A"), 0); Promise.resolve().then(() => console.log("B")); queueMicrotask(() => console.log("C")); console.log("D");` → result **D → B → C → A**.

**Why are there two lines?** Microtasks continue work scheduled to happen right after the current code, before the next task. Macrotasks run new tasks, like timer and event callbacks.

**The catch**: a microtask can take 10 seconds and a macrotask can last 1 millisecond. That doesn't change their classification.

**Rule to remember**: the Event Loop doesn't look at a function and decide whether it deserves the VIP line. The API used to schedule it decides which line it joins.

**➕ Three details the picky interviewer asks next**

- **`.then()` only joins the line when the Promise resolves.** `fetch(url).then(fn)`: while the network hasn't answered, `fn` is in no line at all. When the response arrives (a macrotask/I/O), the Promise resolves and only then does `fn` join the VIP line.
- **A slow microtask freezes everything.** Since the VIP line is emptied completely before any timer, click, or repaint, a slow microtask (or one that keeps scheduling another) freezes the page. Microtask means priority, not "background".
- **Node has an even more VIP line: `process.nextTick`**, which runs before Promises (see Node lab 01).
