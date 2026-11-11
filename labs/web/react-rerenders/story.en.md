**Context** (with a megaphone 📢): "ATTENTION, EVERYONE LISTENING TO ME! THE VALUE CHANGED!"

**List**: "Oh, I show the items, I do need to update." ✅

**AddButton**: "But I only use `dispatch`, which NEVER changes… why am I redrawing?! 😩"

**Context**: "Because you're listening to the megaphone, and the megaphone shouts at everyone. Worse: `{ state, dispatch }` is a **new object every render**, so to me it ALWAYS changed."

**Footer** (with `memo`, not listening to Context): "Me? Headphones on. My props didn't change, so I don't even wake up." 😴

**Now with two separate Contexts:**

**State Context** 📢: "THE ITEMS CHANGED!"

**List**: "Heard it, updating." ✅

**Dispatch Context** 🤫: "I never shout anything, because `useReducer`'s `dispatch` is always the same."

**AddButton** (listening only to the dispatch Context): "FINALLY, SOME REST! 😌"

**User** (clicks "change theme"): …

**List**: "Why did I redraw? I don't even use the theme!"

**Mini Zustand** (walking down the hall): "Because you listen to the WHOLE state. With me you subscribe only to the part you use (the **selector**). Check out my lab." 😏

**🧠 Interview takeaway**

"Every component that reads a Context re-renders when its value changes. To avoid needless re-renders: I split state and dispatch into separate Contexts, don't create a new object in `value`, and use `memo`. If I need fine-grained selection, I use a store with selectors (Zustand, Redux)."
