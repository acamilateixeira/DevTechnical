# 💸 Os dois gestores e o mesmo orçamento

> Sexta-feira, 17h59. O centro de custo tem R$1000. Dois gestores querem aprovar uma viagem de R$800 cada antes de ir embora.

## 🎭 Elenco
- 🏦 **Orçamento** · linha `cc1` com `saldo = 1000` · o dinheiro disponível no banco de dados
- 👨‍💼 **Gestor A** · `aprovarViagem('Gestor A', 800)` · primeira transação
- 👩‍💼 **Gestor B** · `aprovarViagem('Gestor B', 800)` · segunda transação, no mesmo milissegundo
- 👀 **Olhadinha** · `SELECT` · lê o saldo sem travar nada
- 🔒 **Cadeado** · `SELECT ... FOR UPDATE` · lê e tranca a linha até o `COMMIT`
- ⚡ **Atômico** · `UPDATE ... WHERE saldo >= 800` · confere e desconta numa tacada só, dentro do banco
- 😱 **Financeiro** · o relatório do mês · quem descobre a bagunça depois

## 🎬 Cena 1 · Só olhando
**Gestor A**: "Deixa eu dar uma olhadinha… R$1000. Cabe minha viagem de R$800!" 👀
**Gestor B** _(no mesmo milissegundo)_: "Deixa eu dar uma olhadinha… R$1000. Cabe a minha também!" 👀
**Gestor A**: "Aprovo! Saldo = 1000 − 800 = 200." ✍️
**Gestor B**: "Aprovo! Saldo = 1000 − 800 = 200." ✍️ _(apagando o que o A escreveu, sem saber)_
**Orçamento**: "Saldo final: R$200. Tudo nos conformes!" 🙂
**Financeiro**: "NOS CONFORMES?! Aprovaram R$1600 com R$1000! Quem foi o gênio?!" 😱
> 🚨 A segunda escrita apagou a primeira: lost update.
= 🏦 Saldo no banco: R$200
= ✅ Viagens aprovadas: 2 (R$1600) ❌
= 👀 O que cada gestor leu: os dois leram R$1000
= ✍️ Escrita do Gestor A: apagada pela do Gestor B

## 🎬 Cena 2 · Com cadeado
**Gestor A**: "Quero ver o saldo e já trancar essa linha pra mim." 🔒
**Gestor B**: "Também quero ver o saldo…"
**Cadeado**: "Tá ocupado, meu querido. Espera na porta." ⏳
**Gestor A**: "Aprovo, saldo 200, COMMIT. Pode entrar!" 🔓
**Gestor B**: "Minha vez… R$200? Não cabe R$800. Recuso." ✅
**Financeiro**: "Agora sim. Pode ir pro happy hour."
= 🔒 Lock na linha `cc1`: Gestor A até o COMMIT; Gestor B esperou
= 🏦 Saldo no banco: R$200
= ✅ Viagens aprovadas: 1 ✅
= 🚫 Recusadas: 1 (Gestor B leu R$200)

## 🎬 Cena 3 · O jeito curtinho
**Atômico**: "Eu nem olho antes. Mando o banco conferir e descontar de uma vez só. Se não tiver saldo, nenhuma linha muda e eu sei que não deu."
**Gestor B**: "Simples assim?"
**Atômico**: "Simples assim, mô." 😎
= ⚡ SQL: `UPDATE ... SET saldo = saldo - 800 WHERE saldo >= 800`
= 📊 Linhas afetadas: A: 1 · B: 0
= ✅ Viagens aprovadas: 1 ✅ (saldo final R$200)

## 💻 Traduzindo pro código
```sql
-- ❌ olhadinha: os dois leem 1000
SELECT saldo FROM centro_custo WHERE id = 'cc1';
UPDATE centro_custo SET saldo = 200 WHERE id = 'cc1';

-- 🔒 cadeado (lock pessimista): o segundo espera o COMMIT do primeiro
SELECT saldo FROM centro_custo WHERE id = 'cc1' FOR UPDATE;

-- ⚡ atômico: confere e desconta numa instrução
UPDATE centro_custo SET saldo = saldo - 800 WHERE id = 'cc1' AND saldo >= 800;
-- 0 linhas afetadas = não tinha saldo

-- 🔢 lock otimista: falha se alguém mudou desde a leitura
UPDATE centro_custo SET saldo = 200, version = version + 1 WHERE id = 'cc1' AND version = 7;
```

| `MODO` no lab | Viagens aprovadas |
| --- | --- |
| `'sem-lock'` | 2 (R$1600 com R$1000) |
| `'for-update'` | 1 |
| `'atomico'` | 1 |

Cuidados: transação curta e nunca chamar API externa com o lock aberto.

## 🎤 Pra entrevista
"Duas transações leram o mesmo valor e a segunda escrita apagou a primeira: é um lost update. Resolvo com lock pessimista (`SELECT ... FOR UPDATE`), com update condicional atômico (`WHERE saldo >= valor`) ou com lock otimista por coluna de versão. Mantenho a transação curta e nunca chamo API externa com o lock aberto."
