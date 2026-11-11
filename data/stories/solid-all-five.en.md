**`OrderController`** (doing EVERYTHING): "I validate, calculate tax, save to the database, and send email!" 🤹

**S (Single Responsibility)**: "And when tax changes, when email changes, when the database changes… you change for FOUR reasons. Split it!" ✂️

**Checkout** (full of `if`s): "If pix… else if card… else if boleto…"

**O (Open/Closed)**: "You edit me for every new payment method? Create a new CLASS that follows the `PaymentMethod` interface and leave me alone." 🚪

**`ReadOnlyRepository`** (pretending to be a normal repository): "I have `save()`… but I throw 'not supported'." 🤥

**L (Liskov)**: "Whoever uses a repository expects `save()` to work. If you don't honor the contract, don't pretend to be one." 🙅

**`UserService`** (with 30 methods): "Whoever just wants to read the name has to depend on all of me."

**I (Interface Segregation)**: "Small role interfaces: `UserReader`, `PasswordResetter`." 🧩

**Approval rule**: "I call MySQL directly…"

**D (Dependency Inversion)**: "Depend on a repository **interface**. Then in tests you get an in-memory version and, if the database changes, you won't even notice." 🔌

**Excited architect**: "SO I'LL CREATE AN INTERFACE FOR EVERYTHING!"

**SOLID**: "Easy. Unnecessary abstraction is a cost too." 😅

**🧠 Interview takeaway**

"SOLID fights coupling: SRP = one reason to change; OCP = extend without editing; LSP = honor the contract; ISP = small interfaces; DIP = rules depend on abstractions, not details. It's a tool, not a rule: unnecessary abstraction is a cost."
