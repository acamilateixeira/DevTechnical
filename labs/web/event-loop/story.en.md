# 🎉 The Event Loop nightclub

> A nightclub with two lines: the VIP line and the regular line. The Event Loop is the bouncer and decides who talks when.

## 🎭 Cast
- 🗣️ **A** · `console.log('A')` · normal code: talks right away, top to bottom
- ⏰ **B** · `setTimeout(..., 0)` · a timer: "0ms" doesn't mean now, it means "when it's your turn" (regular line, a macrotask)
- 🤞 **C** · `Promise.then()` · what runs when a promise is kept (VIP line, a microtask)
- 🎫 **D** · `queueMicrotask()` · goes straight into the VIP line, no promise needed
- 🏃‍♀️ **E** · `async function` · an async function: starts running right away, until the first `await`
- ✋ **`await null`** · `await` · pauses ONLY its own function and sends the rest to the VIP line
- 😭 **F** · `console.log` after the `await` · the rest of function E, which ended up in the VIP line
- 😎 **G** · `console.log('G')` · normal code, the last line of the script
- 🕴️ **Event Loop** · event loop · the bouncer: finishes the normal code, empties the VIP line, then calls 1 from the regular line
- 💎 **Microtask** · microtask · whoever is in the VIP line
- 🎟️ **Macrotask** · macrotask · whoever is in the regular line

## 🎬 Scene 1 · Everyone arriving
**A**: "I'M HERE! I'm first in line anyway! I'M TALKING NOW!"
**B**: "I WANT TO TALK TOO! IN 0ms!"
**Event Loop**: "EASY THERE, HOTSHOT! 0ms doesn't mean now! Wait your turn in the timer line!"
**C**: "MY PROMISE IS ALREADY RESOLVED! I promised something and now I want to run my `.then()`!"
**Event Loop**: "Fine! Get in the VIP microtask line!"
**D**: "I WANT THE VIP LINE TOO!"
**Event Loop** _(suspicious)_: "But where's your Promise?"
**D**: "I DON'T HAVE ANY PROMISE! 😂 I can go straight into the microtask line!"
**E**: "I'M ASYNC, BUT I WAS CALLED NOW! I'M NOT WAITING FOR ANYONE! I'M STARTING TO TALK!"
**`await null`**: "WAAAAIT, HOTSHOT! ✋ You already said everything before me! Now pause this function! The rest goes to the VIP microtask line!"
**F**: "HEY, I HAVEN'T EVEN TALKED YET! 😭"
**`await null`**: "THEN YOU'LL WAIT! C and D got to the VIP line first!"
**G**: "While everyone's in this mess, I'M DOING MY THING! I don't depend on anyone!"
> 🚨 SYNCHRONOUS CODE IS DONE! THE VIP LINE IS OPEN!

## 🎬 Scene 2 · The VIP line
**C**: "I GOT IN FIRST! MY TURN!"
**D**: "I'M SECOND! DIDN'T EVEN NEED A PROMISE!"
**F**: "FINALLY! The `await` held me back, but now I can talk!"
> ⏰ NOW IT'S THE TIMERS' TURN!

## 🎬 Scene 3 · The regular line
**B**: "WHAT ABOUT ME, PEOPLE?! 😭 IT WAS SUPPOSED TO BE 0ms!"
**Event Loop**: "NOW IT'S YOUR TURN! But don't get excited! If you create microtasks, they'll run before the next timer!"
**B**: "FINALLY! 😂"

## 🎬 Scene 4 · The moral of the story
**A**: "Us, the synchronous ones (A, E, and G): we're here! We work first!"
**Microtask**: "We're in the VIP line! As soon as the synchronous code finishes, IT'S OUR TURN!"
**B**: "Us, the timers: WE'RE STUCK WAITING! 😭"
**Event Loop**: "I ORGANIZE THIS MESS! First the synchronous code finishes, then I empty the microtask line. Then I run the next macrotask and check the microtasks again. AND SO ON!"
**`await null`**: "I DON'T STOP THE WHOLE PROGRAM! I only pause my own function. EVERYONE ELSE CAN FEND FOR THEMSELVES!" 😂

## 🎬 Part 2 · Who decides the line?
**Microtask**: "I'M IN THE VIP LINE! As soon as the current code finishes, I WANT TO RUN BEFORE THE NEXT MACROTASK!"
**Macrotask**: "I WANT TO RUN TOO!"
**Event Loop**: "FINE, BUT FIRST I'M EMPTYING THE VIP LINE!"

## 💻 Translating to code
```js
console.log('A');                                       // A  → synchronous
setTimeout(() => console.log('B'), 0);                  // B  → regular line (macrotask)
Promise.resolve().then(() => console.log('C'));         // C  → VIP line (microtask)
queueMicrotask(() => console.log('D'));                 // D  → VIP line (microtask)
(async () => {
  console.log('E');                                     // E  → synchronous (until the 1st await)
  await null;                                           // await null → pauses the function
  console.log('F');                                     // F  → VIP line (microtask)
})();
console.log('G');                                       // G  → synchronous
// Output: A E G C D F B
```

| Order | Line | Who |
| --- | --- | --- |
| 1 | Synchronous code (runs first) | A, E, G |
| 2 | Microtasks (VIP line) | C, D, F |
| 3 | Timer / macrotask (after the microtasks) | B |

## 📌 The API decides the line
What decides whether something is a microtask or a macrotask is the **API that schedules it**, not how long it takes or how important it is.

| Microtasks (VIP line) | Macrotasks (regular line) |
| --- | --- |
| `Promise.then()` | `setTimeout()` |
| `Promise.catch()` | `setInterval()` |
| `Promise.finally()` | Events like `click` |
| `queueMicrotask()` | `MessageChannel` messages |
| The continuation after `await` | I/O tasks, depending on the environment |
| `MutationObserver` | `setImmediate` (Node) |

Example: `setTimeout(() => console.log("A"), 0); Promise.resolve().then(() => console.log("B")); queueMicrotask(() => console.log("C")); console.log("D");` → output **D → B → C → A**.

**Why are there two lines?** Microtasks continue work scheduled to happen right after the current code, before the next task. Macrotasks run new tasks, like timer and event callbacks.

**The trick**: a microtask can take 10 seconds and a macrotask can take 1 millisecond. That doesn't change how they're classified.

**Rule to memorize**: the Event Loop doesn't look at a function and decide whether it deserves the VIP line. The API used to schedule it determines which line it goes into.

## ➕ Three details the picky recruiter asks next
- **`.then()` only enters the line when the Promise resolves.** `fetch(url).then(fn)`: while the network hasn't answered, `fn` isn't in any line. When the response arrives (a macrotask/I/O), the Promise resolves and only then does `fn` enter the VIP line.
- **A slow microtask freezes everything.** Since the VIP line is emptied completely before any timer, click, or screen repaint, a slow microtask (or a microtask that keeps scheduling another one) freezes the page. Microtasks are priority, not "background".
- **Node has an even more VIP line: `process.nextTick`**, which runs before Promises (see Node lab 01).

## 🎤 For the interview
"JavaScript runs all synchronous code first. Then the event loop empties the whole microtask queue (`.then`, `queueMicrotask`, the continuation after an `await`) and only then runs one macrotask (a timer, an event, I/O), emptying the microtasks again after each one. The API that scheduled it decides the queue, not the time. That's why the output is A E G, then C D F, and B last."
