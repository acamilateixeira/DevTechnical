# 📚 The librarian who read the whole collection

> A library with 20 million trip cards. Bia wants company 42's pending trips, newest first.

## 🎭 Cast
- 🙋 **Request** · the query `SELECT ... WHERE company_id = 42 AND status = 'pendente' ORDER BY created_at DESC LIMIT 50` · what the screen wants
- 👵 **Librarian** · the database · whoever looks for the cards
- 🐌 **Read everything** · Seq Scan · going card by card, all 20 million
- 🔦 **Flashlight** · `EXPLAIN ANALYZE` · shows the path the database took and how long it took
- 📇 **Card index** · composite index `(company_id, status, created_at)` · a catalog already sorted by company → status → date
- ✍️ **New entry** · `INSERT` / `UPDATE` · every new card must also go into the catalog
- 🎭 **Disguise** · `WHERE DATE(created_at) = ...` · a function on the column: the index no longer recognizes it

- 👩 **Bia** · the user · waiting for the screen to load
## 🎬 Scene 1 · No catalog
**Request**: "I want company 42's pending ones, newest first, just 50."
**Librarian**: "I'll read all 20 MILLION cards, one by one, pick the right ones, and then sort…" 🐌
**Bia**: "The screen took 8 seconds! I had time to make coffee!" 😤
**Flashlight**: "Found the culprit: it read the whole table and then sorted everything on disk." 🔦
= 🔦 Plan (`EXPLAIN ANALYZE`): Seq Scan + Sort on disk
= 📚 Rows read: 20 million
= ⏱️ Time: ~8 s ❌

## 🎬 Scene 2 · With a catalog
**Card index**: "I'm already sorted by company, then status, then date. I go straight to drawer 42, pending, already in order, and stop at 50." 📇
**Librarian**: "I read 50 cards instead of 20 million. I feel like an athlete." ⚡
= 📇 Index: `(company_id, status, created_at DESC)`
= 🔦 Plan: Index Scan, already sorted, stops at `LIMIT 50`
= 📚 Rows read: 50
= ⏱️ Time: ~5ms ✅

## 🎬 Scene 3 · Not all roses
**New entry**: "And every time a new card comes in, I have to update the catalog too. Too many catalogs make me slow!" 🐢
**Disguise**: "What if I ask by creation DATE, with a function around it?"
**Card index**: "Then I don't recognize you, dear. Not using it." 🙅
= ✍️ Each `INSERT`: updates the table + every index
= 🎭 `WHERE DATE(created_at) = ...`: doesn't use the index ❌
= ✅ `WHERE created_at >= ... AND < ...`: uses the index

## 💻 Translating to code
```sql
EXPLAIN ANALYZE                                         -- 🔦
SELECT id, title FROM trips
WHERE company_id = 42 AND status = 'pendente'           -- equality first
ORDER BY created_at DESC LIMIT 50;                      -- then the ordering

CREATE INDEX CONCURRENTLY idx_trips_company_status_created   -- 📇 without locking the table (PostgreSQL)
  ON trips (company_id, status, created_at DESC);

-- 🎭 ❌ doesn't use the index       ✅ uses it
WHERE DATE(created_at) = '2026-11-10'
WHERE created_at >= '2026-11-10' AND created_at < '2026-11-11'
```

| Rule | Why |
| --- | --- |
| Leftmost prefix | Index `(a, b, c)` serves `a`, `a+b`, `a+b+c`, not just `b` |
| Equality first, ordering after | It delivers in order and stops at `LIMIT` |
| Indexes cost on writes | Every `INSERT` updates every index |
| A function on the column voids the index | Rewrite it as a range |

## 🎤 For the interview
"I investigate with `EXPLAIN ANALYZE` and the slow query log. A composite index follows the leftmost prefix: equality columns first, then the ordering column, so it returns rows already sorted and stops at the `LIMIT`. Indexes speed up reads but cost on writes, and a function on the column prevents their use. In production I create them without locking the table."
