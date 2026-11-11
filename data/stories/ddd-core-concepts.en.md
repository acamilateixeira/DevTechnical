# 🗺️ Everyone speaks their own language

> A corporate transport company. The business people say one thing, the code says another, and nobody understands each other.

## 🎭 Cast
- 👷‍♀️ **Expert** · the business person · knows how the work really happens
- 🤷 **Old code** · `Order` and `Job` classes · names nobody in the business uses
- 🗣️ **Dictionary** · ubiquitous language · the SAME words in the business and in the code
- 🗺️ **Territories** · bounded contexts (Sales, Billing) · each area with its own model and meaning
- 💰 **Money** · value object `Money(100, 'BRL')` · no ID, defined by its value, immutable
- 👑 **Queen** · the `Viagem` (trip) aggregate root · nobody changes anything from outside; she protects the rules
- 📣 **Town crier** · domain event `ViagemAprovada` · announces that something important happened
- 😴 **CRUD** · a simple form · needs none of this

- 💼 **Sales** · the Sales bounded context · customer = lead
- 🧾 **Billing** · the Billing bounded context · customer = tax ID and taxes
- 👨‍💻 **Dev** · writes the code
- 🧭 **DDD** · Domain-Driven Design · the whole approach
## 🎬 Scene 1 · Nobody understands each other
**Expert**: "The requester opens a request; dispatch makes the assignment of a driver."
**Old code**: "Here it's all `Order` and `Job`, duh." 🤷
**Dictionary**: "So the code speaks another language! Use the SAME words: `Solicitacao` (request), `Atribuicao` (assignment)." 🗣️

## 🎬 Scene 2 · What is a customer?
**Sales**: "To me, a customer is a lead with an opportunity."
**Billing**: "To me, it's a tax ID, a billing address, and taxes."
**Territories**: "You're both right, each in your own part of the map. At the border, we translate." 🗺️

## 🎬 Scene 3 · The rules of the realm
**Money**: "I have no ID. I am what I'm worth, I don't change, and I don't let anyone create me negative." 💰
**Dev**: "I'll just change the trip status straight in the table…"
**Queen**: "NOT IN MY REALM! Want to approve it? Talk to me: `viagem.aprovar()`. I'll check whether it's allowed." 👑
**Town crier**: "APPROVED! Whoever's interested, email, ERP, react!" 📣
**CRUD** _(yawning)_: "And me, do I need a queen, a town crier, and territories?"
**DDD**: "No, dear. I'm worth it where the domain is complicated." 😅

## 💻 Translating to code
```ts
class Money {                                          // 💰 value object
  private constructor(readonly cents: number, readonly currency: 'BRL') {}
  static of(cents: number) { if (cents < 0) throw new Error('negative'); return new Money(cents, 'BRL'); }
}

class Viagem {                                         // 👑 aggregate root
  private status: 'PENDENTE' | 'APROVADA' = 'PENDENTE';
  private events: DomainEvent[] = [];
  aprovar(by: Manager) {
    if (this.status !== 'PENDENTE') throw new Error('only pending trips can be approved');
    this.status = 'APROVADA';
    this.events.push(new ViagemAprovada(this.id, by.id)); // 📣
  }
}
```

| Concept | In one sentence |
| --- | --- |
| Ubiquitous language | The same words in the business and in the code |
| Bounded context | A territory where each word has a single meaning |
| Entity | Has identity (an ID) and changes over time |
| Value object | Defined by its value, immutable |
| Aggregate | A group changed only through its root, which protects the rules |
| Domain event | Something important that happened, in the past tense |

## 🎤 For the interview
"DDD is designing code around the domain: a ubiquitous language, bounded contexts with translation at the borders, aggregates that protect invariants and change only through the root, immutable value objects, and domain events to notify other contexts. It's worth it for complex domains; for simple CRUD it's too much ceremony."
