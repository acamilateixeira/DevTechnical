**Store** (keeping state outside React): "I have EVERYTHING: `busca`, `servico`, `nivel`. Whoever wants something subscribes and tells me WHAT they want."

**SearchBox**: "I only want `busca`." *(selector: `s => s.busca`)*

**ServiceSelect**: "I only want `servico`."

**LevelButton**: "I only want `nivel`."

**User** (types "a" in the search box)

**Store**: "I CHANGED! I'll notify EVERYONE who subscribed!" 📣

**SearchBox**: "Did my piece change? `''` → `'a'`. YES! Redrawing." ✅

**ServiceSelect**: "Did my piece change? `'trips-api'` → `'trips-api'`. Same (`===`). Back to sleep." 😴

**LevelButton**: "Same here. Zzz." 😴

**SearchBox** (with a selector that creates a new object: `s => ({ busca: s.busca })`): "Did my piece change? `{busca:'a'}` → `{busca:'a'}`… they're DIFFERENT objects (not the same `===`)! CHANGED! And again! And again!" 🔁💥

**Zustand**: "That's why I have `useShallow`: it compares field by field."

**🧠 Interview takeaway**

"Zustand and Redux's `useSelector` keep state outside React. Each component subscribes only to the slice it uses (a selector) and re-renders only when that slice changes, compared with `===`. Underneath, it's React's `useSyncExternalStore`."
