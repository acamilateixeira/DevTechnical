# 📢 The building with the megaphone

> An apartment building where the manager announces everything over a megaphone. Some residents need to hear it; others just wanted to sleep.

## 🎭 Cast
- 📢 **Manager** · `<Tudo.Provider value={{ state, dispatch }}>` · the Context: when the value changes, it tells everyone who's listening
- 📋 **List** · `Lista` (reads the items) · a resident who actually needs the news
- 🔘 **Button** · `BotaoAdicionar` (only uses `dispatch`) · a resident who only wants the intercom, which never changes
- 🎧 **Footer** · `Rodape` with `memo` · a resident wearing headphones: only wakes up if their props change
- 🤫 **Dispatch manager** · `<Dispatch.Provider>` · a second Context with only `dispatch`: never shouts
- 🎯 **Mini Zustand** · store with a selector · the neighbor from the next lab, who delivers only the message each person asked for

## 🎬 Scene 1 · One megaphone
**Manager**: "ATTENTION, EVERYONE! A NEW ITEM ARRIVED IN THE CART!" 📢
**List**: "Oh, that's for me. I'll update." ✅
**Button** _(in pajamas)_: "But I only use the intercom, which NEVER changes… why did you wake me up?! 😩"
**Manager**: "Because you're listening to the megaphone, and the megaphone shouts at everyone. Plus: the `{ state, dispatch }` note is a NEW piece of paper every time. As far as I'm concerned, it ALWAYS changed."
**Footer** _(headphones on)_: "Me? My props are the same. Didn't even wake up." 😴
> 🚨 The Button re-rendered for nothing.
= 📢 Context: just one, `value={{ state, dispatch }}` (a new object every render)
= 🔄 Re-rendered: List ✅ and Button ❌ (for nothing)
= 😴 Did not re-render: Footer (`memo`, same props)

## 🎬 Scene 2 · Two megaphones
**Manager**: "THE ITEMS CHANGED!"
**List**: "Heard it, updating." ✅
**Dispatch manager** 🤫: "I never shout anything. `useReducer`'s `dispatch` is always the same, so I have no news."
**Button** _(only listening to the dispatch manager)_: "FINALLY, A NIGHT OF SLEEP! 😌"
= 📢 Contexts: State (changes) + Dispatch (never changes)
= 🔄 Re-rendered: only the List ✅
= 😴 Did not re-render: Button and Footer

## 🎬 Scene 3 · The theme switch
**Manager**: "THE THEME IS NOW DARK!"
**List**: "Wait, why did I wake up? I don't even use the theme!"
**Mini Zustand** _(walking down the hall)_: "Because you listen to the WHOLE state, dear. With me, you subscribe only to the piece you use. Come by my lab." 😏
= 🎨 Changed: only `tema` (theme)
= 🔄 Re-rendered: the List ❌ (reads the whole state, even without using the theme)
= 💡 Fix: a store with selectors (Mini Zustand lab)

## 💻 Translating to code
```tsx
// ❌ one Context with a new object on every render: every reader re-renders
<Tudo.Provider value={{ state, dispatch }}>

// ✅ state and dispatch split: whoever only dispatches doesn't re-render
<Dispatch.Provider value={dispatch}>   {/* 🤫 never changes */}
  <Estado.Provider value={state}>      {/* 📢 changes when state changes */}

const Rodape = memo(function Rodape() { /* 🎧 only re-renders if props change */ });
```

| Technique | What it fixes |
| --- | --- |
| Split state and dispatch Contexts | Components that only dispatch stop re-rendering |
| `useMemo` on `value` | Avoids a new object on every Provider render |
| `memo` | Skips the render if props are equal |
| Store with selectors (Zustand, Redux) | Each component re-renders only for the slice it uses |

To see who re-rendered: React DevTools → Profiler → "Highlight updates when components render".

## 🎤 For the interview
"Every component that reads a Context re-renders when the value changes, and an object created inside `value` changes on every render. To avoid pointless re-renders, I split state and dispatch into different Contexts, memoize the `value`, and use `memo` where it measurably helps. If I need fine-grained selection, I use a store with selectors, like Zustand or Redux. And I confirm in the React DevTools Profiler before optimizing."
