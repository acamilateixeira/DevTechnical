**Query**: "I want company 42's pending trips, newest first."

**Database without an index** 📚: "I'll read all 20 MILLION rows, one by one, and pick the ones that fit…" *(Seq Scan)* 🐌

**User**: "The screen took 8 seconds!" 😤

**`EXPLAIN ANALYZE`** 🔦: "Look at the plan: it read the whole table and then sorted everything on disk. Found the culprit."

**Composite index `(company_id, status, created_at)`** 📇: "I'm the book's index. I'm already organized by company → status → date. I go straight to the right page, already sorted, and stop at 50."

**Database**: "I read 50 rows instead of 20 million." ⚡

**INSERT** ✍️: "And every time I write, I have to update the index too. Too many indexes make me slow!" 🐢

**`WHERE DATE(created_at) = ...`**: "What if I apply a function to the column?"

**Index**: "Then I don't recognize you anymore. Not used." 🙅

**🧠 Interview takeaway**

"I investigate with `EXPLAIN ANALYZE` and the slow query log. A composite index follows the leftmost prefix: equality columns first, then the sort column. Indexes speed up reads but cost on writes, and functions on the column prevent their use. In production, I create them without locking the table."
