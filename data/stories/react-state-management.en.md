# 🏠 A place for everything

> The trips screen has a lot of "state". The dev used to keep it all in the same drawer and nothing could be found.

## 🎭 Cast
- 🌐 **Trip list** · API data · lives on the server; the screen only has a copy, which can go stale
- 🗃️ **Smart pantry** · TanStack Query (or SWR, Apollo) · fetches, caches, refreshes, and dedupes server state
- 🔗 **Note on the door** · URL state (`?status=pending`) · survives F5 and can be shared as a link
- 🪟 **Open modal** · `useState` · belongs to one component only
- 🌙 **Dark theme** · Context · global, but almost never changes
- 🛒 **Rule-packed cart** · Zustand or Redux Toolkit · global, changes all the time, read by many
- 🦖 **Grandma's Redux** · a store holding API responses · synced everything by hand

- 🐻 **Zustand** · `create()` + selector · a small, fast global store
## 🎬 Scene 1 · The messy drawer
**Grandma's Redux**: "I keep EVERYTHING: the API list, the filter, the modal, the theme… and I sync it by hand!" 🦖
**Trip list**: "Grandma, I went stale 10 minutes ago and nobody refreshed me." 🌐
**Smart pantry**: "Leave it to me, dear: I fetch, store, refresh when the tab regains focus, cancel, and never fetch the same thing twice." 🗃️
**Smart pantry** _(whispering)_: "About 80% of your 'global state' was just server cache, you know?" 😏
= 🦖 In the Redux store: API list, filter, modal, theme (all together)
= 🌐 Trip list: stale for 10 min ❌
= 🗃️ With TanStack Query: cache + refetch on focus + dedupe ✅

## 🎬 Scene 2 · Everyone in their own home
**Note on the door**: "I'm the 'pending only' filter. I live in the URL: hit F5 and I'm still here, send the link and Bia sees the same filter." 🔗
**Open modal**: "I belong to this one component. `useState` and done, I don't bother anyone." 🪟
**Dark theme**: "I belong to everyone, but I change once in a lifetime. Context handles me." 🌙
**Rule-packed cart**: "I change all the time and loads of components are watching me…" 🛒
**Zustand**: "Then come with me: each one subscribes only to the piece it uses, and only whoever needs to re-renders."
= 🔗 Filter: in the URL: `?status=pendente`
= 🪟 Modal: `useState` in the component
= 🌙 Theme: Context
= 🛒 Cart: Zustand with selectors

## 💻 Translating to code
```tsx
const { data: trips } = useQuery({ queryKey: ['trips', status], queryFn: fetchTrips });       // 🗃️
const [params, setParams] = useSearchParams(); const status = params.get('status');            // 🔗
const [open, setOpen] = useState(false);                                                       // 🪟
const theme = useContext(ThemeContext);                                                        // 🌙
const total = useCart((s) => s.total);                                                         // 🛒 selector
```

| Kind of state | Where it lives | Tool |
| --- | --- | --- |
| Server state | On the server (the screen has a copy) | TanStack Query, SWR, Apollo |
| URL state | In the query string | Router (`useSearchParams`) |
| Local | In the component | `useState`, `useReducer` |
| Global, rarely changes | In the tree | Context |
| Global, changes often | Outside React | Zustand, Redux Toolkit |

## 🎤 For the interview
"I split state by its nature: server state with TanStack Query, SWR, or Apollo; URL state in the query string, so it survives F5 and can be shared; local state with `useState`; global client state with Context if it rarely changes, and Zustand or Redux Toolkit with selectors if it changes often. A lot of old 'global state' was just server cache."
