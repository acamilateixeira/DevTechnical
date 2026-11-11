# 🍕 The pizzeria that only calls whoever ordered

> A pizzeria that keeps every order on a board outside the kitchen. Each customer only cares about their own pizza.

## 🎭 Cast
- 🧑‍🍳 **Store** · `create()` · the pizzeria: keeps state outside React and notifies whoever subscribed
- 🔎 **CampoBusca** · `useFiltros((s) => s.busca)` · a customer who only wants to know about `busca` (search)
- 🗂️ **SeletorServico** · `useFiltros((s) => s.servico)` · a customer who only wants `servico` (service)
- 🔴 **BotaoNivel** · `useFiltros((s) => s.nivel)` · a customer who only wants `nivel` (level)
- 🍽️ **Selector** · `(s) => s.busca` · the order: says which piece of state the component wants
- 🟰 **`===`** · reference comparison · the waiter who checks whether the piece changed
- 🧾 **`useShallow`** · field-by-field comparison · the meticulous waiter who checks item by item

## 🎬 Scene 1 · Everyone orders a slice
**Store**: "I have EVERYTHING here: search, service, and level. Anyone who wants something, subscribe and tell me WHAT."
**CampoBusca**: "Just the search."
**SeletorServico**: "Just the service, please."
**BotaoNivel**: "Just the level. No onions."

## 🎬 Scene 2 · Bia types "a"
**Store**: "SOMETHING CHANGED! I'll tell EVERYONE who subscribed!" 📣
**`===`** _(checking the search)_: "`''` became `'a'`. Changed!"
**CampoBusca**: "Then I re-render." ✅
**`===`** _(checking the service)_: "`'trips-api'` and `'trips-api'`. Identical."
**SeletorServico**: "Back to sleep." 😴
**BotaoNivel**: "Same. Zzz." 😴

## 🎬 Scene 3 · The order that always looks new
**CampoBusca**: "Now I want it like this: `{ busca }`, wrapped in an object."
**`===`**: "`{busca:'a'}` and `{busca:'a'}`… those are two DIFFERENT boxes! Changed!"
**CampoBusca**: "I re-render! And again! AND AGAIN!" 🔁💥
**`useShallow`**: "Leave it to me: I open the box and compare field by field. Equal? Nobody wakes up."

## 💻 Translating to code
```ts
function create(init) {
  let state; const listeners = new Set();
  const set = (partial) => { state = { ...state, ...partial }; listeners.forEach((l) => l()); }; // 📣 tell everyone
  state = init(set, () => state);
  const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
  return (selector) => useSyncExternalStore(subscribe, () => selector(state)); // 🟰 re-render if the piece changed (===)
}
const busca = useFiltros((s) => s.busca);           // ✅ a string: compares fine
const bad   = useFiltros((s) => ({ busca: s.busca })); // ❌ a new object on every read
const good  = useFiltros(useShallow((s) => ({ busca: s.busca, nivel: s.nivel }))); // ✅
```

Real Zustand and Redux's `useSelector` work like this under the hood. The React piece that makes it work is `useSyncExternalStore`.

## 🎤 For the interview
"Zustand and Redux's `useSelector` keep state outside React. Each component subscribes only to the slice it uses with a selector and only re-renders when that slice changes, compared with `===`. Under the hood it's `useSyncExternalStore`. A selector that creates a new object re-renders every time; that's what `useShallow` is for."
