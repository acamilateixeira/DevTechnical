**Business rule** 💎 ("a paid invoice can't be paid"): "I'm the heart of the system. I don't want to know about Laravel, SQL Server, or HTTP."

**`PayInvoice` use case** 🎬: "I orchestrate: load the invoice, ask it to pay itself, save, and notify whoever needs it. But I only know **interfaces**: 'someone who stores invoices', 'someone who publishes events'."

**Eloquent** 🧰: "I'm one of those 'someones': I implement the `InvoiceRepository` interface."

**Controller** 🚪: "And I just translate HTTP into a use-case call. No rules in here."

**Dependency rule** ⬇️: "Everyone points INWARD. The outside knows the inside; the inside never knows the outside."

**Company**: "Let's move from CodeIgniter to Laravel!"

**Business rule**: "Go ahead, I'll come along without changing a line. Just swap the shell." 😎

**Test** 🧪: "And I test the rule in milliseconds, without starting a database."

**Simple sign-up screen** 📝: "Do I need four layers too?"

**Experienced architect**: "No. Clean Architecture where the rules are rich (payments, invoices). Everything else stays simple." 😅

**🧠 Interview takeaway**

"Clean Architecture is the dependency rule: domain and use cases at the center, unaware of framework, database, or HTTP; infrastructure implements interfaces (ports). I gain testability and can swap frameworks without rewriting rules. I apply it where the domain is rich."
