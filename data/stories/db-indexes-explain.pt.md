**Query**: "Quero as viagens pendentes da empresa 42, das mais novas para as mais antigas."

**Banco sem índice** 📚: "Vou ler as 20 MILHÕES de linhas, uma por uma, e separar as que servem…" *(Seq Scan)* 🐌

**Usuária**: "A tela demorou 8 segundos!" 😤

**`EXPLAIN ANALYZE`** 🔦: "Olha aqui o plano: leu a tabela inteira e ainda ordenou tudo em disco. Achei o culpado."

**Índice composto `(company_id, status, created_at)`** 📇: "Eu sou o índice remissivo do livro. Já estou organizado por empresa → status → data. Vou direto na página certa, já ordenado, e paro quando der 50."

**Banco**: "Li 50 linhas em vez de 20 milhões." ⚡

**INSERT** ✍️: "E toda vez que eu gravo, preciso atualizar o índice também. Índice demais me deixa lento!" 🐢

**`WHERE DATE(created_at) = ...`**: "E se eu aplicar uma função na coluna?"

**Índice**: "Aí eu não te reconheço mais. Não uso." 🙅

**🧠 Moral da história para entrevista**

"Investigo com `EXPLAIN ANALYZE` e slow query log. Índice composto segue o prefixo mais à esquerda: colunas de igualdade primeiro, depois a de ordenação. Índice acelera leitura mas custa na escrita, e funções na coluna impedem o uso. Em produção, crio sem travar a tabela."
