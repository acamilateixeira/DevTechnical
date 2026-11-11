# 🧰 Auntie SOLID's five pieces of advice

> An ordering system grew on "I'll fix it later". Auntie SOLID came for a visit.

## 🎭 Cast
- 🤹 **Do-it-all** · a giant `PedidoController` · validates, calculates tax, saves, and sends email
- ✂️ **S** · Single Responsibility · "one class, one reason to change"
- 🚪 **O** · Open/Closed · "extend without touching what already works"
- 🤥 **Impostor** · `ReadOnlyRepository` with a `save()` that throws · pretends to be something it isn't
- 🙅 **L** · Liskov Substitution · "a substitute has to honor the contract"
- 🐘 **Mega-interface** · `UsuarioService` with 30 methods · everyone depends on all of it
- 🧩 **I** · Interface Segregation · "small interfaces, by role"
- 🔌 **D** · Dependency Inversion · "the rule depends on an abstraction, not on MySQL"
- 🤓 **Overexcited architect** · wants an interface for everything

- 🛒 **Checkout** · the payment code full of `if`s
- 📏 **Approval rule** · a business rule · glued to MySQL
- 👵 **Auntie SOLID** · all five principles together · the voice of experience
## 🎬 Scene 1 · The do-it-all
**Do-it-all**: "I validate, calculate tax, save to the database, and send email! I'm a multitasker!" 🤹
**S**: "Sweetie, when the tax changes, the email changes, or the database changes, you change for FOUR reasons. Split that up." ✂️
= 🤹 Controller responsibilities: 4 (validate, tax, save, email)
= ✂️ After S: 4 classes, 1 reason to change each

## 🎬 Scene 2 · The checkout full of ifs
**Checkout**: "If it's Pix… else if it's a card… else if it's a boleto…"
**O**: "And for every new payment method you'll edit this again? Create a new class that follows the `MeioDePagamento` contract and leave the checkout alone." 🚪
**Impostor**: "I'm a repository! I have `save()`… but it throws 'not supported'." 🤥
**L**: "Whoever uses a repository expects `save()` to work. If you don't honor the contract, don't pretend to be one." 🙅
= 🔀 `if`s per payment method: 3 (and growing)
= 🚪 After O: 1 class per method; the checkout doesn't change
= 🤥 `ReadOnlyRepository.save()`: throws → breaks L

## 🎬 Scene 3 · The mega-interface and the glued-on database
**Mega-interface**: "Whoever just wants to read a user's name has to depend on my 30 methods." 🐘
**I**: "Break it into pieces: `LeitorDeUsuario`, `RedefinidorDeSenha`. Each one takes only what it uses." 🧩
**Approval rule**: "I call MySQL directly, it's faster."
**D**: "Depend on a repository interface. In tests they'll give you an in-memory version and, if the database changes, you won't even know." 🔌
**Overexcited architect**: "THEN I'LL CREATE AN INTERFACE FOR EVERYTHING! EVEN FOR `console.log`!" 🤓
**Auntie SOLID**: "Easy, son. Unnecessary abstraction is a cost too." 😅
= 🐘 Interface methods: 30
= 🧩 After I: `LeitorDeUsuario` (1) and `RedefinidorDeSenha` (1)
= 🔌 After D: the rule depends on `Repositorio`, not MySQL

## 💻 Translating to code
```ts
interface MeioDePagamento { cobrar(valor: Money): Promise<Recibo>; }      // 🚪 O + 🔌 D
class Pix implements MeioDePagamento { /* ... */ }
class Cartao implements MeioDePagamento { /* ... */ }                     // new method = new class

class Checkout {
  constructor(private readonly meios: Map<string, MeioDePagamento>) {}   // depends on the abstraction
  pagar(tipo: string, valor: Money) { return this.meios.get(tipo)!.cobrar(valor); }
}

interface LeitorDeUsuario { buscarNome(id: string): Promise<string>; }   // 🧩 I: small and by role
```

| Letter | In one sentence | Symptom it's missing |
| --- | --- | --- |
| S | One reason to change | A class that touches everything |
| O | Extend without editing | A growing `if/else` by type |
| L | Honor the contract | A subclass that throws "not supported" |
| I | Small interfaces | A class implementing methods it doesn't use |
| D | The rule depends on abstractions | A rule that imports the database driver |

## 🎤 For the interview
"SOLID targets coupling: SRP is having one reason to change; OCP is extending without editing what works; LSP is a subclass honoring the contract; ISP is small, role-based interfaces; DIP is business rules depending on abstractions, not details. It's a tool, not dogma: unnecessary abstraction is a cost too."
