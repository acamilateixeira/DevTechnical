**Checkout** 🛒: "I just want someone who knows how to `charge()`. I don't care whether it's Pix or card."

**`PaymentMethod` interface** 📜 (the contract): "Whoever signs with me PROMISES to have `charge()`. I don't say how. And a class can sign several contracts."

**`PaymentWithFee` abstract class** 🏗️ (the house blueprint): "I come with part of it ready: I compute the total with the fee. Each child just says WHICH fee and HOW to process. Nobody lives in me directly, only in houses built from me. And each class gets only ONE blueprint."

**`LogsActivity` trait** 🧩 (the ready-made kit): "I'm a bundle of methods any class can 'paste in', even without being related."

**`Pix`** and **`CreditCard`**: "We both know how to `charge()`, each in our own way!"

**Checkout**: "Then whoever comes, I call `charge()` and it works." **← polymorphism** 🎭

**Boleto** (arriving later): "May I come in?"

**Checkout**: "Sign the contract and come in. I don't even need to change." 😎

**🧠 Interview takeaway**

"An interface is a contract (many per class); an abstract class is contract + shared code (single inheritance); a trait is horizontal reuse of methods. Polymorphism is the same code working with different classes that follow the same contract, which lets you add behavior without touching the caller."
