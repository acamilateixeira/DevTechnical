# 📦 The package with no label

> A package from the API arrived at TypeScript's front desk. Nobody knows what's inside.

## 🎭 Cast
- 📦 **Package** · `await res.json()` · the data from outside: could be anything
- 😎 **Sloppy doorman** · `any` · lets it in and use it any way, without checking anything
- 🕵️ **Suspicious doorwoman** · `unknown` · lets it in, but only lets you use it after checking what it is
- 🔍 **Check** · `typeof x === 'string'` (narrowing) · how you prove the type before using it
- 🧪 **Zod** · `schema.parse(data)` · the X-ray: checks a big object field by field, at runtime
- 🚫 **Impossible** · `never` · the type no value can have: exposes the forgotten case
- 🆕 **'cancelada'** · a new value in the `Status` union · the new status nobody handled

- 🟦 **TypeScript** · the compiler · checks types before running
- 👨‍💻 **Dev** · whoever wrote the code
## 🎬 Scene 1 · The sloppy doorman
**Package**: "Hi, everyone! Even I don't know what I am."
**Sloppy doorman**: "Relax, with me you can be ANYTHING! Want `.toUpperCase()`? Go for it! If it breaks, it breaks in production, at 3 a.m., whoever's on call deals with it." 😎
**TypeScript** _(covering its eyes)_: "With `any` I see nothing, I know nothing." 🙈
> 🚨 `any` turns checking off: the error only shows up in production.
= 🏷️ Data type: `any`
= 🙈 TypeScript check: off
= 💥 Error shows up in: production (runtime) ❌

## 🎬 Scene 2 · The suspicious doorwoman
**Suspicious doorwoman**: "Come on in, dear, but you can only USE it after I check."
**Check**: "Is it a string? Then you can use it as a string."
**Zod**: "And if it's a huge object, leave it to me, I'll X-ray it field by field." 🧪
**Package**: "How fancy, I feel like I'm at the airport."
= 🏷️ Data type: `unknown` → after `typeof`, `string`
= 🧪 Runtime validation: Zod `parse()` checks every field
= ✅ Error shows up at: compile time or when data comes in

## 🎬 Scene 3 · The forgotten status
**'cancelada'**: "Hi, I'm the new status! I just arrived at the `switch`…"
**Impossible**: "Nobody handled you? Then you fell into me, and NOTHING can fall into me. BUILD BROKEN! Go handle her!" 🚨
**Dev**: "Thank goodness it broke here and not for the customer." 😮‍💨
= 🔀 `switch (status)`: handles "aberta" and "aprovada"
= 🆕 Left in `default`: "cancelada"
= 🚫 `const x: never = s`: compile error: build broken ✅

## 💻 Translating to code
```ts
const data: unknown = await res.json();              // 📦 + 🕵️
if (typeof data === 'string') data.toUpperCase();    // 🔍 only after checking

const Trip = z.object({ id: z.string(), status: z.enum(['aberta', 'aprovada', 'cancelada']) });
const trip = Trip.parse(data);                        // 🧪 validates at runtime

function label(s: Status) {
  switch (s) {
    case 'aberta': return 'Open';
    case 'aprovada': return 'Approved';
    default: { const neverHappens: never = s; return neverHappens; } // 🚫 'cancelada' breaks the build here
  }
}
```

| Type | Accepts | Lets you use it unchecked? |
| --- | --- | --- |
| `any` | Everything | Yes (dangerous) |
| `unknown` | Everything | No: forces narrowing |
| `never` | Nothing | Proves every case was handled |

## 🎤 For the interview
"`any` turns type checking off; `unknown` accepts any value but forces you to narrow the type before using it, so it's the right choice for external data; `never` is the impossible type, used to guarantee every case of a union was handled. Since types don't exist at runtime, I validate external data with Zod."
