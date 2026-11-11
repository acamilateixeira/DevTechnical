**Centro de custo**: "Tenho R$1000 de orçamento."

**Gestor A**: "Deixa eu ver o saldo… R$1000. Cabe a viagem de R$800!" 👀

**Gestor B** (no mesmo milissegundo): "Deixa eu ver o saldo… R$1000. Cabe a viagem de R$800!" 👀

**Gestor A**: "Aprovo! Saldo = 1000 − 800 = **200**." ✍️

**Gestor B**: "Aprovo! Saldo = 1000 − 800 = **200**." ✍️ *(apagando a escrita do A sem saber)*

**Banco**: "Saldo final: R$200. Tudo certo!" 🙂

**Financeiro**: "TUDO CERTO?! Aprovaram R$1600 com R$1000! 😱" **← lost update**

**Agora com `SELECT ... FOR UPDATE`:**

**Gestor A**: "Quero ver o saldo **e já tranco** essa linha pra mim." 🔒

**Gestor B**: "Também quero ver o saldo…"

**Banco**: "Tá trancado pelo A. Espera na porta." ⏳

**Gestor A**: "Aprovo, saldo 200, COMMIT. Destranquei!" 🔓

**Gestor B**: "Minha vez. Saldo… **200**. Não cabe R$800. Recuso." ✅

**Update atômico** (o jeito mais curto): "Eu nem leio antes. Mando o banco fazer tudo de uma vez: `UPDATE ... SET saldo = saldo - 800 WHERE saldo >= 800`. Se voltar 0 linhas, não tinha saldo."

**🧠 Moral da história para entrevista**

"Duas transações leram o mesmo valor e a segunda escrita apagou a primeira: **lost update**. Resolvo com lock pessimista (`SELECT ... FOR UPDATE`), update condicional atômico ou lock otimista com coluna de versão. Transação curta e nunca chamar API externa com o lock aberto."
