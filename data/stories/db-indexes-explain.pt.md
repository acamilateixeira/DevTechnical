# 📚 A bibliotecária que lia o acervo inteiro

> Uma biblioteca com 20 milhões de fichas de viagem. A Bia quer as viagens pendentes da empresa 42, das mais novas para as mais antigas.

## 🎭 Elenco
- 🙋 **Pedido** · a query `SELECT ... WHERE company_id = 42 AND status = 'pendente' ORDER BY created_at DESC LIMIT 50` · o que a tela quer
- 👵 **Bibliotecária** · o banco · quem procura as fichas
- 🐌 **Ler tudo** · Seq Scan · passar ficha por ficha, as 20 milhões
- 🔦 **Lanterna** · `EXPLAIN ANALYZE` · mostra o caminho que o banco fez e quanto tempo levou
- 📇 **Índice remissivo** · índice composto `(company_id, status, created_at)` · fichário já organizado por empresa → status → data
- ✍️ **Cadastro** · `INSERT` / `UPDATE` · cada ficha nova precisa entrar também no fichário
- 🎭 **Disfarce** · `WHERE DATE(created_at) = ...` · função na coluna: o índice não reconhece mais

- 👩 **Bia** · a usuária · esperando a tela carregar
## 🎬 Cena 1 · Sem fichário
**Pedido**: "Quero as pendentes da empresa 42, mais novas primeiro, só 50."
**Bibliotecária**: "Vou ler as 20 MILHÕES de fichas, uma por uma, separar as que servem e depois ordenar…" 🐌
**Bia**: "A tela demorou 8 segundos! Deu tempo de passar um café!" 😤
**Lanterna**: "Achei o culpado: leu a tabela inteira e ainda ordenou tudo em disco." 🔦

## 🎬 Cena 2 · Com fichário
**Índice remissivo**: "Eu já tô organizado por empresa, depois status, depois data. Vou direto na gaveta 42, pendentes, já na ordem, e paro quando der 50." 📇
**Bibliotecária**: "Li 50 fichas em vez de 20 milhões. Tô me sentindo uma atleta." ⚡

## 🎬 Cena 3 · Nem tudo são flores
**Cadastro**: "E toda vez que entra ficha nova, eu tenho que atualizar o fichário também. Fichário demais me deixa lerdo!" 🐢
**Disfarce**: "E se eu pedir pela DATA da criação, com uma função em volta?"
**Índice remissivo**: "Aí eu não te reconheço, querida. Não uso." 🙅

## 💻 Traduzindo pro código
```sql
EXPLAIN ANALYZE                                         -- 🔦
SELECT id, title FROM trips
WHERE company_id = 42 AND status = 'pendente'           -- igualdade primeiro
ORDER BY created_at DESC LIMIT 50;                      -- depois a ordenação

CREATE INDEX CONCURRENTLY idx_trips_company_status_created   -- 📇 sem travar a tabela (PostgreSQL)
  ON trips (company_id, status, created_at DESC);

-- 🎭 ❌ não usa o índice           ✅ usa
WHERE DATE(created_at) = '2026-11-10'
WHERE created_at >= '2026-11-10' AND created_at < '2026-11-11'
```

| Regra | Por quê |
| --- | --- |
| Prefixo mais à esquerda | O índice `(a, b, c)` serve para `a`, `a+b`, `a+b+c`, não só para `b` |
| Igualdade antes, ordenação depois | Assim ele já entrega na ordem e para no `LIMIT` |
| Índice custa na escrita | Cada `INSERT` atualiza todos os índices |
| Função na coluna anula o índice | Reescreva como intervalo |

## 🎤 Pra entrevista
"Investigo com `EXPLAIN ANALYZE` e o slow query log. Índice composto segue o prefixo mais à esquerda: colunas de igualdade primeiro e depois a de ordenação, para entregar já ordenado e parar no `LIMIT`. Índice acelera leitura mas custa na escrita, e função aplicada na coluna impede o uso. Em produção, crio sem travar a tabela."
