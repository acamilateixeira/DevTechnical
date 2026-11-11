**User** (clicking fast): "I want offers for R$3000… no, R$2000… no, R$1000!"

**`useEffect`**: "`amount` changed! Off I go to fetch. 🏃" *(three times, one per click)*

**R$3000 request**: "I'll take 1.4 s, the network is slow for me…"

**R$2000 request**: "I take 0.8 s."

**R$1000 request**: "I'm quick: 0.2 s!"

**R$1000 request** (arriving first): "HERE! `setData(1000)`!" ✅

**R$2000 request** (arriving next): "HERE! `setData(2000)`!" 😬

**R$3000 request** (arriving last): "HERE! `setData(3000)`! I WIN!" 🏆

**Screen**: "You chose R$1000, but I'm showing R$3000. 🤡" **← race condition**

**Now with AbortController and cleanup:**

**Cleanup** (the effect's `return`): "Before each new fetch, I cancel the previous one. **You, R$3000: CANCELLED. You, R$2000: CANCELLED.**" ✂️

**R$3000 request**: "But I was about to arrive…"

**Cleanup**: "Nobody wants you anymore, darling. 💅"

**Screen**: "Chose R$1000, showing R$1000." ✅

**🧠 Interview takeaway**

"When an effect depends on a value that changes fast, an old response can arrive after the new one and overwrite the screen. I cancel the previous request in the **cleanup** with `AbortController`. In production I use TanStack Query, which already does this."
