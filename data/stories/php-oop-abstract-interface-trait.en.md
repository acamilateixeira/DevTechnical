# 🛒 The contract, the blueprint, and the kit

> A store's checkout takes Pix and card. Next week boleto arrives. The checkout couldn't care less.

## 🎭 Cast
- 🛒 **Checkout** · the code that charges · just wants someone who knows how to `cobrar()` (charge)
- 📜 **Contract** · the `MeioDePagamento` (payment method) interface · whoever signs PROMISES to have `cobrar()`; doesn't say how. A class can sign several
- 🏗️ **House blueprint** · the abstract class `PagamentoComTaxa` (payment with fee) · comes partly built; nobody lives in it directly. Each class gets only ONE blueprint
- 🧩 **Ready-made kit** · the `RegistraLog` trait · a bundle of methods any class can "paste in", even if unrelated
- ⚡ **Pix** · `class Pix implements MeioDePagamento` · charges its own way
- 💳 **Card** · `class CartaoDeCredito extends PagamentoComTaxa` · charges its own way, with a fee
- 🧾 **Boleto** · the new class that arrives later
- 🎭 **Chameleon** · polymorphism · the same code working with different classes

## 🎬 Scene 1 · The contract
**Checkout**: "I just want someone who knows how to charge. Pix, card, whatever." 🛒
**Contract**: "Whoever signs with me PROMISES to have `cobrar()`. How they charge is their own business." 📜
**Pix**: "Signed! I charge instantly, no fee." ⚡
**Card**: "Signed too!" 💳
= 📜 Interface: `MeioDePagamento::cobrar()`
= ✍️ Implemented by: `Pix`, `CartaoDeCredito`

## 🎬 Scene 2 · The blueprint and the kit
**House blueprint**: "And I come half-built: I compute the total with the fee. Each child just says WHICH fee. Nobody lives in me directly, okay? Only in houses built from me." 🏗️
**Card**: "I was built from that blueprint. I just said my fee is 3%."
**Ready-made kit**: "And I'm a bundle of logging methods anyone can paste in, even if they're not family." 🧩
**Pix**: "I pasted the kit in and I'm not even related to Card. Fancy."
= 🏗️ Abstract class: `PagamentoComTaxa` (computes the total; `taxa()` is abstract)
= 💳 `CartaoDeCredito`: `extends PagamentoComTaxa`, 3% fee
= 🧩 `RegistraLog` trait: used by `Pix` (no inheritance)

## 🎬 Scene 3 · Boleto arrives
**Boleto**: "Hi, everyone! May I come in?" 🧾
**Checkout**: "Signed the contract? Then come in. I don't even need to change." 😎
**Chameleon**: "That's it: the checkout calls `cobrar()` and each one answers its own way." 🎭
= 🧾 New class: `Boleto implements MeioDePagamento`
= 🛒 Lines changed in checkout: 0 ✅
= 🎭 `$meio->cobrar()` works with: Pix, Card, and Boleto

## 💻 Translating to code
```php
interface MeioDePagamento { public function cobrar(int $cents): Recibo; }           // 📜

abstract class PagamentoComTaxa implements MeioDePagamento {                         // 🏗️
    abstract protected function taxa(): float;
    public function cobrar(int $cents): Recibo {
        return $this->processar((int) round($cents * (1 + $this->taxa())));
    }
    abstract protected function processar(int $total): Recibo;
}

trait RegistraLog { public function log(string $msg): void { error_log(static::class . ": $msg"); } } // 🧩

final class Pix implements MeioDePagamento { use RegistraLog; public function cobrar(int $c): Recibo { /* ... */ } } // ⚡
final class CartaoDeCredito extends PagamentoComTaxa { protected function taxa(): float { return 0.03; } /* ... */ } // 💳

function checkout(MeioDePagamento $method, int $cents) { return $method->cobrar($cents); } // 🛒 + 🎭
```

| | Interface | Abstract class | Trait |
| --- | --- | --- | --- |
| What it is | A contract | Contract + shared code | A bundle of methods |
| How many per class | Several | One (single inheritance) | Several |
| Can be instantiated? | No | No | No |
| Use when | You want to guarantee a behavior | Children share code and state | Reuse across unrelated classes |

## 🎤 For the interview
"An interface is a contract, and a class can implement several; an abstract class is a contract with shared code, and you can only extend one; a trait is horizontal reuse of methods across unrelated classes. Polymorphism is the same code working with different classes that follow the same contract, which lets me add a new payment method without touching the caller."
