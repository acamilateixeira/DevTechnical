**API data** (the trip list) 🌐: "I live on the server. The screen only has a COPY of me, which can go stale."

**TanStack Query** 🗃️: "Leave it to me: I fetch, cache, refresh when focus returns, cancel, and dedupe. That's **server state**."

**"Pending only" filter** 🔗: "I live in the **URL**: `?status=pending`. That way the link can be shared and I survive F5."

**Open modal** 🪟: "I belong to this one component. `useState` and done."

**Dark theme** 🌙: "I'm global but rarely change: **Context** does the job."

**Cart with 15 rules** 🛒: "I change all the time and lots of people read me…"

**Zustand / Redux Toolkit** 🏪: "Then come with me: each component subscribes only to the piece it uses (a selector)."

**Old app with Redux** 🦖: "I used to store API responses in the store and sync everything by hand…"

**TanStack Query**: "…and 80% of your 'global state' was server cache. I handle that now." 😏

**🧠 Interview takeaway**

"I split state by nature: server state with TanStack Query/SWR/Apollo; URL state in the query string; local state with `useState`; global client state with Context if it changes rarely, Zustand or Redux Toolkit if it changes often and needs selectors."
