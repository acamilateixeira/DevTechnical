**Cost center**: "I have a R$1000 budget."

**Manager A**: "Let me check the balance… R$1000. The R$800 trip fits!" 👀

**Manager B** (in the same millisecond): "Let me check the balance… R$1000. The R$800 trip fits!" 👀

**Manager A**: "Approved! Balance = 1000 − 800 = **200**." ✍️

**Manager B**: "Approved! Balance = 1000 − 800 = **200**." ✍️ *(overwriting A's write without knowing)*

**Database**: "Final balance: R$200. All good!" 🙂

**Finance**: "ALL GOOD?! They approved R$1600 with R$1000! 😱" **← lost update**

**Now with `SELECT ... FOR UPDATE`:**

**Manager A**: "I want to see the balance **and lock** this row for myself." 🔒

**Manager B**: "I want to see the balance too…"

**Database**: "It's locked by A. Wait at the door." ⏳

**Manager A**: "Approved, balance 200, COMMIT. Unlocked!" 🔓

**Manager B**: "My turn. Balance… **200**. R$800 doesn't fit. Rejected." ✅

**Atomic update** (the shortest way): "I don't even read first. I tell the database to do it all at once: `UPDATE ... SET balance = balance - 800 WHERE balance >= 800`. If 0 rows change, there wasn't enough."

**🧠 Interview takeaway**

"Two transactions read the same value and the second write erased the first: a **lost update**. I fix it with a pessimistic lock (`SELECT ... FOR UPDATE`), an atomic conditional update, or an optimistic lock with a version column. Short transactions, and never call an external API while holding the lock."
