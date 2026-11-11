**Customer** (in the store): "I'll take this R$2000 sofa on the store card!" 🛋️

**Card terminal**: "Issuer, do you authorize?"

**Issuer (Brasil Card)** 🏦: "Valid card, correct PIN, anti-fraud ok, available limit R$3000… **AUTHORIZED**. I'll **hold** R$2000 of the limit." *(not a debt yet)*

**Merchant**: "Sale confirmed!" → **Capture** ✅: "Now it's a posting on the statement."

**Forgotten authorization** ⏳: "What if the merchant never captures?"

**Issuer**: "After a few days you expire and the limit comes back."

**Customer** (a week later): "I changed my mind about the sofa!"

**Refund** ↩️: "I don't delete the purchase! I create a **new** R$2000 credit posting. The whole history stays recorded."

**Statement closing** 📅: "I gather the cycle's purchases, installments, interest, and refunds."

**Payment** 💸: "I reduce the balance and **restore the limit**."

**Another customer**: "I don't recognize this purchase!"

**Chargeback** ⚖️: "Provisional refund, and the merchant may contest."

**Reconciliation** 🔍 (every morning): "Does what the system recorded match the processor's and the bank's files? A difference? Investigate!"

**Two purchases at the same time** with a limit for only one: "Who wins?"

**Database**: "Transaction + lock on the limit: the second one waits and is declined." 🔒

**🧠 Interview takeaway**

"Authorization holds the limit; capture confirms; refunds and chargebacks are new postings; the statement gathers the cycle and payment restores the limit; reconciliation checks everything against the processor. I model it as an immutable ledger in cents, with idempotency, a state machine, a lock on the limit, and no PAN/CVV stored."
