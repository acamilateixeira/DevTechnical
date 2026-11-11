# 🪑 React's musical chairs

> A classroom with numbered chairs. Each student has a notebook with notes on their desk.

## 🎭 Cast
- 👧 **Ana** · `{ id: 1, nome: 'Ana' }` · an item in the list
- 👦 **Davi** · new item at the top · the late student who sits in the first chair
- 📓 **Notebook** · each item's `<input>` · the state React keeps tied to the badge
- 🧑‍🏫 **React** · the reconciler · the teacher: decides whose notebook is whose by looking at the badge
- 🪪 **Badge** · the `key` · each item's identity from one render to the next
- 🎲 **`Math.random()`** · `key={Math.random()}` · the clown who swaps every badge on every render

## 🎬 Scene 1 · Badge with the chair number (`key={index}`)
**React**: "Good morning! So I know who's who, everyone wears a badge. Today the badge is your chair number: 0, 1, 2."
**Ana** _(chair 0)_: "I wrote 'hi' in my notebook!"
**Davi** _(rushing in)_: "Sorry I'm late, teacher! I'll sit in chair 0." _(everyone slides down one chair)_
**React**: "Badge 'chair 0' still exists, so the notebook with 'hi' stays in chair 0… which is now Davi's."
**Davi**: "Wait, who wrote 'hi' in MY notebook?!"
**Ana**: "IT WAS MINE, YOU NOTEBOOK THIEF! 😭"
> 🚨 The state stayed with the chair, not with the person.
= 📋 List on screen: chair 0: Davi · 1: Ana · 2: Bruno · 3: Carla
= 🪪 `key` used: the index (0, 1, 2, 3)
= 📓 "hi" text: stayed at key 0, which is now Davi ❌

## 🎬 Scene 2 · Badge with the name (`key={item.id}`)
**React**: "New rule: now the badge is your name."
**Davi**: "I'm sitting in chair 0 again, okay?"
**React**: "Badge 'Davi' is new? Brand-new notebook for you. Badge 'Ana' changed chairs? I'll carry her notebook along." ✅
**Ana** _(hugging her notebook)_: "My 'hi' is here. World peace." 🕊️
= 📋 List on screen: Davi, Ana, Bruno, Carla
= 🪪 `key` used: the id (4, 1, 2, 3)
= 📓 "hi" text: stays with Ana (key 1) ✅
= 🆕 Created from scratch: only Davi (key 4)

## 🎬 Scene 3 · The clown
**`Math.random()`**: "What if I give everyone a new badge on every render? Hahaha"
**React**: "Then I think the whole class is new people and throw ALL the notebooks in the trash, every time." 🗑️
**Ana**: "Teacher, kick him out."
= 🪪 `key` used: `Math.random()`: new on every render
= 🗑️ Items recreated per render: all of them (4 of 4)
= 📓 Typed text: lost on every render ❌

## 💻 Translating to code
```tsx
// ❌ badge = chair: state stays at the position
{itens.map((item, index) => (
  <li key={index}>
    <strong>{item.nome}</strong> <input />  {/* 📓 the notebook */}
  </li>
))}

// ✅ badge = name: state follows the item
{itens.map((item) => (
  <li key={item.id}>
    <strong>{item.nome}</strong> <input />
  </li>
))}
```

| Key | Insert at the top / reorder | When it's okay |
| --- | --- | --- |
| `index` | State goes to the wrong item | A fixed list that never changes order |
| `item.id` | State follows the item | Whenever there's a stable ID |
| `Math.random()` | Recreates everything, loses all state | Never |

## 🎤 For the interview
"The `key` is each item's identity between renders: React uses it to decide which component (and which state) matches which item. It must be stable and unique, like the record's ID. With the index, inserting, removing, or reordering puts state on the wrong item; with a random key, everything is recreated on every render."
