**Data from the API** 📦: "Hi! I'm not quite sure what I am."

**`any`** 😎: "Relax, with me you can be ANYTHING. Want to call `.toUpperCase()`? Go ahead! If it breaks, it breaks in production, the on-call person's problem."

**TypeScript**: "With `any` I close my eyes. 🙈"

**`unknown`** 🕵️: "Not with me. You can be anything, sure, but **before using you I'll check**. Is `typeof` string? Then yes, use it as a string."

**Zod** 🧪: "And if it's a big object, I check it field by field for you."

**`never`** 🚫: "And I'm the **impossible** type: no value fits in me. If someone adds a new status and forgets to handle it in the `switch`, I become a compile error and warn you right away!"

**New status `'cancelled'`**: "I showed up and nobody handled me…"

**`never`**: "BUILD BROKEN! Go handle her!" 🚨

**🧠 Interview takeaway**

"`any` turns checking off; `unknown` accepts anything but forces you to narrow the type before using it (the right choice for external data); `never` is the impossible type, used to guarantee every case of a union was handled. And types don't exist at runtime: external data gets validated with Zod."
