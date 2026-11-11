# 🏢 The office building with 500 companies

> A SaaS serves 500 companies from the same trips table. Each row has a label saying which company it belongs to.

## 🎭 Cast
- 🏢 **Building** · the SaaS with shared tables · everyone in the same database
- 🏷️ **Label** · the `tenant_id` column · says which company each row belongs to
- 🙋‍♀️ **Company A** · a tenant · a paying customer who wants to see only its own data
- 😬 **Rushed dev** · a query with no filter · forgot the `WHERE tenant_id`
- 🛡️ **Automatic doorman** · the ORM's global scope · adds the company filter to EVERY query on its own
- 🦹 **Trickster** · `tenant_id` sent in the body · tries to pose as another company
- 🔒 **Database vault** · Row Level Security (PostgreSQL) · the database blocks the row even if the code forgets
- 🧪 **Inspector** · isolation test · proves on every PR that one company can't see another
- 🗄️ **Cupboard** · the cache (Redis) · if the key has no label, it leaks too

- 🖥️ **API** · the back end · decides where the company comes from
- 👥 **Everyone** · the whole team in chorus
## 🎬 Scene 1 · The forgetful one
**Rushed dev**: "`SELECT * FROM viagens WHERE id = 10`. Done!"
**Company A**: "Why am I seeing Company B's trip to Cancún?! I wasn't even invited!" 😱
> 🚨 A cross-tenant leak: the worst bug a SaaS can have.
= 🔍 Query: `SELECT * FROM viagens WHERE id = 10` (no tenant)
= 🏷️ Row's tenant: B
= 🙋‍♀️ Logged-in user: from company A → leaked ❌

## 🎬 Scene 2 · Layers of protection
**Automatic doorman**: "From now on I add the logged-in user's company to EVERY query. Nobody has to remember." 🛡️
**Trickster**: "What if I send `tenant_id=7` in the request body? Hehe."
**API**: "I ignore it, kid. The company comes from the AUTHENTICATED user, never from what you send." 🙅
**Database vault**: "And if the code still forgets, I, the database, won't hand over the row." 🔒
**Inspector**: "And I create data for two companies and test endpoint by endpoint, on every PR." 🧪
= 🛡️ Global scope: `WHERE tenant_id = 42` on every query
= 🦹 `tenant_id` in the body: ignored (it comes from authentication)
= 🔒 RLS in the database: on
= 🧪 Isolation test: passing on every PR ✅

## 🎬 Scene 3 · The cupboard
**Cupboard**: "Wait, what about me? If my key is just `viagem:10`, without the label…" 😬
**Everyone**: "LABEL IN THE KEY TOO!"
**Cupboard**: "`tenant:42:viagem:10`. Got it." 🏷️
= 🗄️ Cache key before: `viagem:10` ❌
= 🗄️ Cache key after: `tenant:42:viagem:10` ✅

## 💻 Translating to code
```php
// 🛡️ global scope (Laravel)
protected static function booted(): void {
    static::addGlobalScope('tenant', fn ($q) => $q->where('tenant_id', auth()->user()->tenant_id));
}
```
```sql
-- 🔒 Row Level Security (PostgreSQL)
ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolation ON viagens USING (tenant_id = current_setting('app.tenant_id')::int);
```

| Model | Isolation | Cost |
| --- | --- | --- |
| Shared table + `tenant_id` | Depends on discipline and RLS | Cheap |
| Schema per tenant | Good | Medium (migrations across N schemas) |
| Database per tenant | Maximum | Expensive |

Indirect leaks to review: cache, queues, logs, files in storage, and scheduled jobs.

## 🎤 For the interview
"With shared tables, security can't depend on remembering the `WHERE`: I use a global scope in the ORM based on the authenticated user, never on what the client sends, Row Level Security as defense in depth, automated isolation tests on every PR, and care with indirect leaks like cache, queues, logs, and files."
