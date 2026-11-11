**User**: "I want to see the page!"

**CSR** 🧱 (assemble at home): "I send you an empty box and the manual (the JavaScript). You assemble it there in the browser." *(blank screen until assembled)*

**SSR** 🍳 (dish cooked to order): "I prepare the HTML on the server for EVERY request and hand it over ready. Always fresh, but it's work every time."

**SSG** 🥪 (ready-made lunchbox): "I prepared everything at build time. I hand it over instantly from the CDN. But if the content changes, only on the next build."

**ISR** 🔄 (self-renewing lunchbox): "I'm the lunchbox, but every so often (or when told) I prepare a new one in the background."

**Server Components** 🧑‍🍳: "I cook on the server, fetch data right there, and **ship no JavaScript** to the browser. Only the interactive bits go as `'use client'`."

**Hydration** 💧: "Server HTML arrived ready? I go around wiring up the buttons (the events) on it."

**`Date.now()` in render**: "On the server I was 10:00:00; in the browser, 10:00:01…"

**Hydration**: "Different HTML! HYDRATION ERROR!" 💥

**🧠 Interview takeaway**

"Public, stable page → SSG/ISR; per-user page → SSR or dynamic RSC; highly interactive logged-in app → RSC for the shell and client components for interactive parts. Hydration wires events onto server HTML; a hydration error is HTML that differs between the server and the first client render."
