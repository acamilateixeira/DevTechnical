# 💸 Two managers and the same budget

> Friday, 5:59 p.m. The cost center has R$1000. Two managers each want to approve an R$800 trip before heading home.

## 🎭 Cast
- 🏦 **Budget** · row `cc1` with `saldo = 1000` · the money available in the database
- 👨‍💼 **Manager A** · `aprovarViagem('Gestor A', 800)` · the first transaction
- 👩‍💼 **Manager B** · `aprovarViagem('Gestor B', 800)` · the second transaction, in the same millisecond
- 👀 **Quick peek** · `SELECT` · reads the balance without locking anything
- 🔒 **Padlock** · `SELECT ... FOR UPDATE` · reads and locks the row until `COMMIT`
- ⚡ **Atomic** · `UPDATE ... WHERE saldo >= 800` · checks and subtracts in one go, inside the database
- 😱 **Finance** · the monthly report · who finds the mess later

## 🎬 Scene 1 · Just peeking
**Manager A**: "Let me take a quick peek… R$1000. My R$800 trip fits!" 👀
**Manager B** _(in the same millisecond)_: "Let me take a quick peek… R$1000. Mine fits too!" 👀
**Manager A**: "Approved! Balance = 1000 − 800 = 200." ✍️
**Manager B**: "Approved! Balance = 1000 − 800 = 200." ✍️ _(erasing what A wrote, without knowing)_
**Budget**: "Final balance: R$200. All good!" 🙂
**Finance**: "ALL GOOD?! You approved R$1600 with R$1000! Which genius did this?!" 😱
> 🚨 The second write erased the first: a lost update.
= 🏦 Balance in the database: R$200
= ✅ Trips approved: 2 (R$1600) ❌
= 👀 What each manager read: both read R$1000
= ✍️ Manager A's write: overwritten by Manager B's

## 🎬 Scene 2 · With a padlock
**Manager A**: "I want to see the balance and lock this row for myself." 🔒
**Manager B**: "I want to see the balance too…"
**Padlock**: "It's taken, sweetheart. Wait at the door." ⏳
**Manager A**: "Approved, balance 200, COMMIT. You can come in!" 🔓
**Manager B**: "My turn… R$200? R$800 doesn't fit. Rejected." ✅
**Finance**: "Now we're talking. Off to happy hour you go."
= 🔒 Lock on row `cc1`: Manager A until COMMIT; Manager B waited
= 🏦 Balance in the database: R$200
= ✅ Trips approved: 1 ✅
= 🚫 Rejected: 1 (Manager B read R$200)

## 🎬 Scene 3 · The short way
**Atomic**: "I don't even peek first. I tell the database to check and subtract all at once. If there's no balance, no row changes and I know it didn't work."
**Manager B**: "That simple?"
**Atomic**: "That simple, babe." 😎
= ⚡ SQL: `UPDATE ... SET saldo = saldo - 800 WHERE saldo >= 800`
= 📊 Rows affected: A: 1 · B: 0
= ✅ Trips approved: 1 ✅ (final balance R$200)

## 💻 Translating to code
```sql
-- ❌ quick peek: both read 1000
SELECT saldo FROM centro_custo WHERE id = 'cc1';
UPDATE centro_custo SET saldo = 200 WHERE id = 'cc1';

-- 🔒 padlock (pessimistic lock): the second waits for the first COMMIT
SELECT saldo FROM centro_custo WHERE id = 'cc1' FOR UPDATE;

-- ⚡ atomic: checks and subtracts in one statement
UPDATE centro_custo SET saldo = saldo - 800 WHERE id = 'cc1' AND saldo >= 800;
-- 0 rows affected = there wasn't enough balance

-- 🔢 optimistic lock: fails if someone changed it since the read
UPDATE centro_custo SET saldo = 200, version = version + 1 WHERE id = 'cc1' AND version = 7;
```

| `MODO` in the lab | Trips approved |
| --- | --- |
| `'sem-lock'` | 2 (R$1600 with R$1000) |
| `'for-update'` | 1 |
| `'atomico'` | 1 |

Be careful: keep the transaction short and never call an external API while holding the lock.

## 🎤 For the interview
"Two transactions read the same value and the second write erased the first: that's a lost update. I fix it with a pessimistic lock (`SELECT ... FOR UPDATE`), an atomic conditional update (`WHERE saldo >= amount`), or an optimistic lock with a version column. I keep the transaction short and never call an external API while holding the lock."
