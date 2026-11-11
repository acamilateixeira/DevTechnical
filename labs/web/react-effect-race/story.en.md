# 🏁 The race of the late orders

> Bia is picking a loan in the app and changes her mind three times in half a second.

## 🎭 Cast
- 👩 **Bia** · `setAmount()` · the user clicking fast
- 🏃 **`useEffect`** · `useEffect(..., [amount])` · the delivery guy: every time the amount changes, he goes fetching offers
- 🐢 **R$3000 order** · `fetchOffers(3000)` · the slowest fetch (1.4 s)
- 🚶 **R$2000 order** · `fetchOffers(2000)` · the medium fetch (0.8 s)
- 🐇 **R$1000 order** · `fetchOffers(1000)` · the fastest fetch (0.2 s)
- 📺 **Screen** · `setData()` · what Bia sees
- ✂️ **Cleanup** · the effect's `return` + `controller.abort()` · cancels the previous order before a new one goes out

## 🎬 Scene 1 · Canceling nothing
**Bia** _(clicking)_: "Show me R$3000… no, R$2000… no, no, R$1000!"
**`useEffect`**: "Amount changed! Off I go! 🏃 Changed again? Off I go! AND AGAIN? OFF I GO!"
**R$1000 order**: "I got here first, I'm speedy! Screen, show R$1000!" ✅
**R$2000 order**: "Here! Screen, show R$2000!" 😬
**R$3000 order** _(arriving all sweaty)_: "I'M HERE! SHOW R$3000! I WON!" 🏆
**Screen**: "She picked R$1000 and I'm showing R$3000. I'm making a clown of myself." 🤡
> 🚨 Whoever arrived last won, even though it was an old order.

## 🎬 Scene 2 · With the cleanup
**Bia**: "R$3000… R$2000… R$1000!"
**Cleanup**: "Before every new fetch, I go around canceling the previous one. You, R$3000: CANCELED. You, R$2000: CANCELED." ✂️
**R$3000 order**: "But I was almost there…"
**Cleanup**: "Nobody wants you anymore, honey. Move along." 💅
**R$1000 order**: "Screen, show R$1000!"
**Screen**: "Picked R$1000, showing R$1000. What a relief." ✅

## 💻 Translating to code
```tsx
useEffect(() => {
  const controller = new AbortController();
  fetchOffers(amount, controller.signal)      // 🏃 goes fetching
    .then(setData)                            // 📺 updates the screen
    .catch((e) => { if (e.name !== 'AbortError') throw e; });
  return () => controller.abort();            // ✂️ cleanup: cancels this order when amount changes
}, [amount]);
```

| In the lab | Result |
| --- | --- |
| No cancellation | The screen shows R$3000 with R$1000 selected (bug) |
| With `AbortController` | The screen shows R$1000 |

The **cleanup** runs before the next effect (when `amount` changes) and when the component leaves the screen. In production, TanStack Query already cancels and discards old responses.

## 🎤 For the interview
"When the effect depends on a value that changes quickly, an old response can arrive after the new one and overwrite the screen: that's a race condition. I cancel the previous request in the effect's cleanup with `AbortController` (or ignore it with a flag). In production I use TanStack Query, which already does this."
