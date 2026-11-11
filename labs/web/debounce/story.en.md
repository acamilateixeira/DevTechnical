# ⌨️ The girl who called on every letter

> Bia is typing "react hooks" into the search box. On the other end, the API picks up the phone.

## 🎭 Cast
- 👩‍💻 **Bia** · `input` event · the one typing: every key fires an event
- 🤪 **Jumpy field** · listener without debounce · calls the API on every letter
- 😌 **Chill field** · `buscarDepois = debounce(fn, 300)` · waits for Bia to stop typing before calling
- ☎️ **API** · `searchApi()` · the search server, answering every call
- 🎒 **`timer`** · `let timer` (the closure) · the variable kept in the function's backpack between keys
- 🚦 **Throttle** · `throttle(fn, ms)` · the cousin: lets at most one call through every X ms

## 🎬 Scene 1 · The jumpy field
**Bia** _(typing)_: "R… E… A… C… T…"
**Jumpy field**: "NEW LETTER? CALL THE API! ANOTHER ONE? CALL AGAIN! 📞📞📞"
**API**: "Hello? 'r'. Hello? 're'. Hello? 'rea'… LADY, FOR THE LOVE OF GOD, THAT'S 11 CALLS FOR ONE WORD! 😩"
> 🚨 11 searches, and nobody wanted 10 of them.

## 🎬 Scene 2 · The chill field
**Bia**: "R… E… A…"
**Chill field**: "Relax, darling. I'll wait 300ms. If another letter comes first, I tear up the timer and start counting again."
**`timer`** _(from inside the backpack)_: "And I stay tucked in here! Every key touches THIS SAME timer, that's why the previous one can be canceled." 🎒
**Bia**: "…H-O-O-K-S." _(stops typing)_
**Chill field**: "One, two, three… 300ms of silence! NOW: one call, with the whole word."
**API**: "Now THAT is good manners! 🙏"

## 🎬 Scene 3 · The cousin shows up
**Throttle**: "I'm different, okay? I don't wait for anyone to stop. I let ONE call through every X ms, and the rest wait for the next window."
**Chill field**: "So what are you good for?"
**Throttle**: "Scrolling, and when someone keeps resizing the window like crazy. 🌀"

## 💻 Translating to code
```js
function debounce(fn, ms) {
  let timer;                       // 🎒 the backpack (closure)
  return (...args) => {
    clearTimeout(timer);           // tear up the previous timer
    timer = setTimeout(() => fn(...args), ms); // start counting again
  };
}
const buscarDepois = debounce(searchApi, 300);   // the chill field
input.addEventListener('input', (e) => buscarDepois(e.target.value));
```

| | When it runs | Typical use |
| --- | --- | --- |
| Debounce | Only after calls stop for X ms | Search, autosave |
| Throttle | At most once every X ms | Scroll, resize |

A **closure** is a function remembering the variables from where it was born: `timer` stays alive between keystrokes because it lives inside the function `debounce` returned.

## 🎤 For the interview
"A closure is when a function keeps access to the variables of the scope where it was created. Debounce uses that: it keeps the `timer` and, on each call, cancels the previous one and schedules another, so it only runs after calls stop for X ms. Throttle limits it to at most one run every X ms. Debounce for search, throttle for scroll and resize."
