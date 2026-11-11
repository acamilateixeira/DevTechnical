# 🛋️ The life of a store-card purchase

> Mrs. Cida went to the furniture store and fell in love with an R$2000 sofa. She has the store's credit card.

## 🎭 Cast
- 👵 **Mrs. Cida** · the cardholder · decisive, until she changes her mind
- 📟 **Card machine** · the terminal (POS) · asks the issuer whether it's allowed
- 🏦 **Issuer** · whoever issued the card (Brasil Card's role) · decides whether to approve and manages the limit and the statement
- 🔒 **Hold** · authorization · holds the amount against the limit; not a debt yet
- ✅ **Confirmation** · capture · the sale is confirmed and becomes a statement entry
- ↩️ **Return** · refund · a NEW credit entry, never deleting the purchase
- 📅 **Closing** · the statement cycle · gathers the month's purchases, installments, interest, and refunds
- 💸 **Payment** · Mrs. Cida paying the statement · reduces the balance and restores the limit
- ⚖️ **Dispute** · chargeback · "I don't recognize this purchase"
- 🔍 **Checker** · reconciliation · compares the system with the processor's and bank's files every day

- 🏬 **Store** · the merchant · confirms the sale
- 👴 **Mr. Zé** · another cardholder · doesn't recognize a purchase
- 👯 **Two purchases at once** · simultaneous transactions · fighting over the same limit
- 🗄️ **Database** · the database · locks the limit
- ⏳ **Forgotten hold** · an authorization never captured · expires after a few days
## 🎬 Scene 1 · The purchase
**Mrs. Cida**: "I'll take this sofa on the store card, dear!" 🛋️
**Card machine**: "Issuer, may I?"
**Issuer**: "Valid card, correct PIN, anti-fraud fine, R$3000 limit… AUTHORIZED. Holding R$2000 of the limit." 🔒
**Hold**: "For now I'm just holding it, it's not a debt yet."
**Store**: "Sale confirmed!"
**Confirmation**: "Now it's an entry on the statement." ✅
**Forgotten hold** _(at another store)_: "What if the merchant never confirms me?"
**Issuer**: "After a few days you expire and the limit comes back, sweetie." ⏳
= 💳 Total limit: R$3000
= 🔒 Held (authorized): R$0 (already captured)
= 🧾 On the statement: purchase R$2000
= 💳 Available limit: R$1000

## 🎬 Scene 2 · Buyer's remorse
**Mrs. Cida** _(a week later)_: "The sofa didn't fit through the door. I give up!"
**Return**: "I don't delete the purchase! I create a NEW R$2000 credit entry. The whole history stays on record." ↩️
**Closing**: "On the 10th I close: I gather the cycle's purchases, installments, interest, and returns." 📅
**Payment**: "Mrs. Cida paid? I reduce the balance and restore the limit." 💸
= 🧾 Entries: purchase +R$2000 · refund −R$2000
= 📅 Statement balance: R$0
= 💳 Available limit: R$3000 (restored)

## 🎬 Scene 3 · The headaches
**Mr. Zé**: "I don't recognize this R$900 purchase in Fortaleza!"
**Dispute**: "Provisional refund, and the merchant can contest with the receipt." ⚖️
**Checker** _(7 a.m., with coffee)_: "Does what the system recorded match the processor's and the bank's files? R$12 off? Investigate!" 🔍
**Two purchases at once** _(limit for only one)_: "Who wins?"
**Database**: "A transaction with a lock on the limit: the second one waits and is declined." 🔒
= ⚖️ Mr. Zé's chargeback: provisional R$900 credit; the merchant may contest
= 🔍 Reconciliation: R$12 difference opened for investigation
= 🔒 Two purchases at once: 1 authorized, 1 declined (lock on the limit)

## 💻 Translating to code
```sql
-- immutable ledger: nothing is deleted, everything is a new entry (in cents)
CREATE TABLE lancamentos (
  id BIGINT PRIMARY KEY,
  cartao_id BIGINT NOT NULL,
  tipo VARCHAR(20) NOT NULL,        -- PURCHASE, REFUND, PAYMENT, INTEREST, CHARGEBACK
  valor_centavos BIGINT NOT NULL,   -- positive = debit, negative = credit
  idempotency_key VARCHAR(64) UNIQUE,
  criado_em TIMESTAMP NOT NULL
);

-- 🔒 authorization: holds the limit without overdrawing, even with two simultaneous purchases
UPDATE cartoes SET limite_disponivel = limite_disponivel - 200000
WHERE id = :id AND limite_disponivel >= 200000;   -- 0 rows = declined
```

| Step | What happens to the limit | What goes on the statement |
| --- | --- | --- |
| Authorization | Held | Nothing yet |
| Capture | Stays used | Purchase |
| Refund | Restored | Credit (a new entry) |
| Payment | Restored | Payment |
| Chargeback | Restored (provisionally) | Provisional credit |

Never store the full card number or CVV (PCI DSS).

## 🎤 For the interview
"Authorization holds the limit; capture confirms; refunds and chargebacks are new entries, never deletions; the statement gathers the cycle and payment restores the limit; daily reconciliation checks everything against the processor and the bank. I model it as an immutable ledger in cents, with idempotency, a state machine, a lock on the limit, and no stored PAN or CVV."
