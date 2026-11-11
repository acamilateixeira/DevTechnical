# 💎 The heart and the shell

> The company decided to migrate from CodeIgniter to Laravel. Half the team panicked. The business rule didn't.

## 🎭 Cast
- 💎 **Heart** · the domain entities and rules (`Fatura::pagar()`) · "a paid invoice can't be paid again"
- 🎬 **Conductor** · the `PagarFatura` (PayInvoice) use case · orchestrates: load, pay, save, and notify
- 🔌 **Socket** · the `FaturaRepository` interface (port) · "someone who stores invoices", without saying how
- 🧰 **Eloquent** · `EloquentFaturaRepository` (adapter) · implements the socket by talking to the database
- 🚪 **Receptionist** · the controller · turns HTTP into a use-case call, with no rules at all
- ⬇️ **Law of gravity** · the dependency rule · everything points inward; the inside never knows the outside
- 🧪 **Test** · a unit test of the use case · runs without a database, with an in-memory repository
- 📝 **Simple form** · a CRUD · doesn't need any of this

- 🏢 **Company** · decides on the migration
- 😱 **Team** · the devs · afraid of breaking everything
- 👩‍🏫 **Experienced architect** · knows where the architecture is worth it
## 🎬 Scene 1 · Who's in charge of whom
**Heart**: "I'm the center of the system. I don't want to know about Laravel, SQL Server, or HTTP. I only know a paid invoice can't be paid again." 💎
**Conductor**: "I load the invoice, ask it to pay itself, save it, and notify whoever needs to know. But I only know sockets: 'someone who stores invoices', 'someone who publishes events'." 🎬
**Eloquent**: "I'm one of those 'someones'. Plug me into the socket." 🧰
**Receptionist**: "And I just translate the HTTP request. Rules? Not here, dear." 🚪
**Law of gravity**: "Everyone points INWARD. The outside knows the inside; the inside never knows the outside." ⬇️

## 🎬 Scene 2 · The framework switch
**Company**: "We're moving from CodeIgniter to Laravel!"
**Team**: "HELP, EVERYTHING WILL BREAK!" 😱
**Heart**: "Go ahead, I'll come along without changing a line. Just swap the shell." 😎
**Test**: "And I test the rule in milliseconds, without a database. I couldn't care less about the framework." 🧪

## 🎬 Scene 3 · Without overdoing it
**Simple form**: "Do I need four layers, an interface, and an adapter too?"
**Experienced architect**: "No, angel. Clean Architecture where the rules are rich, like payments and invoices. Everything else stays simple." 😅

## 💻 Translating to code
```php
// 💎 domain: imports nothing from the framework
final class Fatura {
    public function pagar(Money $valor): void {
        if ($this->status === Status::Paga) throw new FaturaJaPaga();
        $this->status = Status::Paga;
    }
}

// 🔌 port
interface FaturaRepository { public function buscar(int $id): Fatura; public function salvar(Fatura $f): void; }

// 🎬 use case
final class PagarFatura {
    public function __construct(private FaturaRepository $faturas) {}
    public function executar(int $id, Money $valor): void {
        $fatura = $this->faturas->buscar($id);
        $fatura->pagar($valor);
        $this->faturas->salvar($fatura);
    }
}

// 🧰 adapter (infrastructure)
final class EloquentFaturaRepository implements FaturaRepository { /* uses Eloquent in here */ }
```

| Layer | Knows about | Example |
| --- | --- | --- |
| Domain | Nothing outside | `Fatura`, `Money` |
| Application (use cases) | Domain and ports | `PagarFatura` |
| Adapters | Application and the world | Controller, `EloquentFaturaRepository` |
| Frameworks and drivers | Everything | Laravel, SQL Server |

## 🎤 For the interview
"Clean Architecture is the dependency rule: the domain and use cases at the center, unaware of framework, database, or HTTP; infrastructure implements interfaces, the ports, and the controller only translates HTTP. I gain testability and can switch frameworks without rewriting the rules. I apply it where the domain is rich, like payments; for simple CRUD I keep it simple."
