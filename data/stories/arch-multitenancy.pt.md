# 🏢 O prédio comercial de 500 empresas

> Um SaaS atende 500 empresas na mesma tabela de viagens. Cada linha tem uma etiqueta dizendo de qual empresa ela é.

## 🎭 Elenco
- 🏢 **Prédio** · o SaaS com tabelas compartilhadas · todo mundo no mesmo banco
- 🏷️ **Etiqueta** · a coluna `tenant_id` · diz de qual empresa é cada linha
- 🙋‍♀️ **Empresa A** · um tenant · cliente que paga e quer ver só o que é dela
- 😬 **Dev apressado** · a query sem filtro · esqueceu o `WHERE tenant_id`
- 🛡️ **Porteiro automático** · escopo global do ORM · coloca o filtro da empresa em TODA consulta sozinho
- 🦹 **Malandro** · `tenant_id` mandado no body · tenta se passar por outra empresa
- 🔒 **Cofre do banco** · Row Level Security (PostgreSQL) · o banco barra a linha mesmo se o código esquecer
- 🧪 **Fiscal** · teste de isolamento · prova em todo PR que uma empresa não vê a outra
- 🗄️ **Armário** · o cache (Redis) · se a chave não tiver a etiqueta, vaza também

- 🖥️ **API** · o back-end · decide de onde vem a empresa
- 👥 **Todo mundo** · o time inteiro em coro
## 🎬 Cena 1 · O esquecido
**Dev apressado**: "`SELECT * FROM viagens WHERE id = 10`. Prontinho!"
**Empresa A**: "Por que eu tô vendo a viagem da Empresa B pra Cancún?! Eu nem fui convidada!" 😱
> 🚨 Vazamento entre tenants: o pior bug de um SaaS.

## 🎬 Cena 2 · As camadas de proteção
**Porteiro automático**: "Daqui pra frente eu coloco a empresa do usuário logado em TODA consulta. Ninguém precisa lembrar." 🛡️
**Malandro**: "E se eu mandar `tenant_id=7` no corpo da requisição? Hehe."
**API**: "Ignoro, meu filho. A empresa vem do usuário AUTENTICADO, nunca do que você manda." 🙅
**Cofre do banco**: "E se mesmo assim o código esquecer, eu, o banco, não entrego a linha." 🔒
**Fiscal**: "E eu crio dados de duas empresas e testo endpoint por endpoint, em todo PR." 🧪

## 🎬 Cena 3 · O armário
**Armário**: "Opa, e eu? Se a minha chave for só `viagem:10`, sem a etiqueta…" 😬
**Todo mundo**: "ETIQUETA NA CHAVE TAMBÉM!"
**Armário**: "`tenant:42:viagem:10`. Anotado." 🏷️

## 💻 Traduzindo pro código
```php
// 🛡️ escopo global (Laravel)
protected static function booted(): void {
    static::addGlobalScope('tenant', fn ($q) => $q->where('tenant_id', auth()->user()->tenant_id));
}
```
```sql
-- 🔒 Row Level Security (PostgreSQL)
ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolamento ON viagens USING (tenant_id = current_setting('app.tenant_id')::int);
```

| Modelo | Isolamento | Custo |
| --- | --- | --- |
| Tabela compartilhada + `tenant_id` | Depende de disciplina e RLS | Barato |
| Schema por tenant | Bom | Médio (migrações em N schemas) |
| Banco por tenant | Máximo | Caro |

Vazamentos indiretos para revisar: cache, filas, logs, arquivos no storage e jobs agendados.

## 🎤 Pra entrevista
"Com tabelas compartilhadas, a segurança não pode depender de lembrar o `WHERE`: uso escopo global no ORM a partir do usuário autenticado, nunca do que o cliente envia, Row Level Security como defesa em profundidade, testes automatizados de isolamento em todo PR e cuidado com vazamentos indiretos como cache, filas, logs e arquivos."
