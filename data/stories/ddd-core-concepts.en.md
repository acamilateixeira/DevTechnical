**Domain expert**: "The requester opens a **request**; dispatch makes the **assignment** of a driver."

**Old code**: "Here we call everything `Order` and `Job`." 🤷

**Ubiquitous language** 🗣️: "So the code speaks a different language than the business! Use the SAME words: `Request`, `Assignment`."

**Sales**: "To me, a customer is a lead with an opportunity."

**Billing**: "To me, a customer is a tax ID, a fiscal address, and taxes."

**Bounded context** 🗺️: "You're both right, each in your own territory. Each context has its own customer model; at the border, we translate."

**`Money(100, 'BRL')`** 💰 (value object): "I have no ID. I'm defined by my value, I'm immutable, and I won't let anyone create me negative."

**`Trip`** (aggregate, the root) 👑: "Nobody changes my status from outside! Want to approve? Talk to me: `trip.approve()`. I check the rules."

**`TripApproved`** (domain event) 📣: "It happened! Whoever cares (email, ERP), react."

**Simple CRUD**: "What about me? Do I need all this too?"

**DDD**: "No. I'm worth it where the domain is complex." 😅

**🧠 Interview takeaway**

"DDD means designing code around the domain: ubiquitous language, bounded contexts with translation at the borders, aggregates that guard invariants, immutable value objects, and domain events. Worth it for complex domains; for simple CRUD it's too much ceremony."
