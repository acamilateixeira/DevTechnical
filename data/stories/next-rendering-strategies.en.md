# 🍳 The Next.js restaurant

> Bia opened the page. Next.js has five cooks, and each one delivers the page a different way.

## 🎭 Cast
- 🙋 **Bia** · the browser · wants to see the page NOW
- 🧱 **Build-it-yourself kit** · CSR (client-side rendering) · sends an empty box and the manual (the JavaScript); the browser assembles it
- 🍳 **Cooked to order** · SSR (`dynamic`, `cache: 'no-store'`) · prepares the HTML on the server for EVERY request
- 🥪 **Ready lunchbox** · SSG (generated at build time) · everything ready beforehand; served instantly from the CDN
- 🔄 **Self-renewing lunchbox** · ISR (`revalidate`) · the lunchbox, but every so often it prepares a new one in the background
- 🧑‍🍳 **Head chef** · React Server Components · cooks on the server, fetches data right there, and sends no JavaScript to the browser
- 🎛️ **Interactive waiter** · `'use client'` · the pieces with buttons, state, and events
- 💧 **Electrician** · hydration · wires up the buttons (the events) on the HTML that came ready from the server
- ⏰ **Mismatched clock** · `Date.now()` in render · gives one value on the server and another in the browser

## 🎬 Scene 1 · The five cooks
**Bia**: "I want to see the page!"
**Build-it-yourself kit**: "Here's the empty box and the manual. Put it together." _(blank screen until it's done)_ 🧱
**Bia**: "I've been staring at nothing for 3 seconds…"
**Cooked to order**: "I prepare the HTML on the server for every request. Always fresh, but it's work every time." 🍳
**Ready lunchbox**: "I had everything ready at build time. Instant, but if the content changes, only on the next build." 🥪
**Self-renewing lunchbox**: "I'm the lunchbox, but every so often I make a new one without anyone waiting." 🔄

## 🎬 Scene 2 · The chef
**Head chef**: "I cook on the server, fetch data straight from the database, and don't send a single line of JavaScript to the browser." 🧑‍🍳
**Interactive waiter**: "And only the pieces with buttons go with me, marked `'use client'`." 🎛️
**Electrician**: "Ready-made HTML arrived? I'll go around wiring up the buttons." 💧

## 🎬 Scene 3 · The mismatched clock
**Mismatched clock**: "On the server I was 10:00:00. In the browser, 10:00:01…" ⏰
**Electrician**: "The HTML doesn't match what I expected! HYDRATION ERROR!" 💥
**Head chef**: "Put the time in a `useEffect`, which only runs in the browser, and the fight's over."

## 💻 Translating to code
```tsx
// 🧑‍🍳 Server Component (the App Router default): fetches on the server, zero JS on the client
export default async function TripsPage() {
  const trips = await db.trip.findMany();
  return <TripList trips={trips} />;
}

// 🔄 ISR: rebuild at most every 60 s
export const revalidate = 60;
// 🍳 SSR: always on request
export const dynamic = 'force-dynamic';

// 🎛️ only the interactive part goes to the client
'use client';
export function ApproveButton({ id }: { id: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);           // ⏰ time only in the browser: no hydration error
  return <button onClick={() => approve(id)}>Approve</button>;
}
```

| Page | Strategy |
| --- | --- |
| Public and stable (blog, landing page) | SSG / ISR |
| Personalized per user | SSR or a dynamic Server Component |
| Highly interactive logged-in app | Server Components for the shell + client components for interactive parts |

## 🎤 For the interview
"A public, stable page goes with SSG or ISR; a per-user page with SSR or a dynamic Server Component; a highly interactive logged-in app with Server Components for the shell and client components only for the interactive parts, to ship less JavaScript. Hydration is wiring events onto the server HTML; a hydration error is server HTML that differs from the first client render."
