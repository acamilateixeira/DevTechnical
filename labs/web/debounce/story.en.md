**User** (typing "react hooks"): "R… E… A… C… T…"

**Box without debounce**: "NEW LETTER? CALL THE API! NEW LETTER? CALL THE API AGAIN!" 📞📞📞

**API**: "MA'AM, THAT'S 11 CALLS FOR ONE WORD! 😩"

**Box with debounce**: "Easy. I'll wait 300ms. If another letter arrives first, I **throw away the timer** and start counting again."

**`timer`** (the variable inside the closure): "And I live in the function's backpack! Every call touches THE SAME timer, that's how I can cancel the previous one." 🎒

**User**: "…H-O-O-K-S." *(stops typing)*

**Debounce**: "300ms of silence! NOW: a single call, with the whole word."

**API**: "NOW THAT'S GOOD MANNERS! 🙏"

**Throttle** (debounce's cousin, joining in): "I'm different: I don't wait for a pause. I let through at most **one** call every X ms. I'm for scroll and window resize."

**🧠 Interview takeaway**

- **Closure**: "the function remembers the variables from where it was born; `timer` is kept between calls."
- **Debounce**: "runs only after calls stop for X ms (search)."
- **Throttle**: "runs at most once every X ms (scroll, resize)."
