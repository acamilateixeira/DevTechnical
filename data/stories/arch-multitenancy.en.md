**SaaS system** 🏢: "I serve 500 companies from the same trips table, separated by `tenant_id`."

**Rushed dev**: "`SELECT * FROM trips WHERE id = 10`" *(forgot the company filter)*

**Company A**: "Why am I seeing Company B's trip?!" 😱 **← tenant leak**

**ORM global scope** 🛡️: "From now on, I add `WHERE tenant_id = (logged-in user's company)` to EVERY query. Nobody has to remember."

**Hacker** 🦹: "What if I send `tenant_id=7` in the body?"

**API**: "I ignore it. The tenant comes from the **authenticated** user, never from what the client sends." 🙅

**Row Level Security (PostgreSQL)** 🔒: "And if the code still forgets, I, the database, block the row."

**Isolation test** 🧪: "I create data for two companies and prove, on every endpoint, that one can't see the other. I run on every PR."

**Cache** 🗄️: "Uh, what about me? If my key is `trip:10` without the tenant…" 😬

**Everyone**: "TENANT IN THE KEY TOO!"

**🧠 Interview takeaway**

"With shared tables, safety can't depend on remembering the `WHERE`: a global ORM scope from the authenticated user, RLS as defense in depth, automated isolation tests, and care with indirect leaks (cache, queues, logs, files)."
