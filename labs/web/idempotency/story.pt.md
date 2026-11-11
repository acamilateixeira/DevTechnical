# 💳 O tênis que foi cobrado três vezes

> A Bia comprou um tênis de R$150 pelo app, no 4G da rodoviária. O sinal estava aquela beleza.

## 🎭 Elenco
- 📱 **App** · `pagarComRetry()` · o cliente: pede a cobrança e, se não ouvir resposta, pede de novo (o retry)
- 🏪 **Servidor** · `servidorPagamentos()` · a API de pagamentos: faz a cobrança de verdade
- 🐊 **Rede** · `rede()` · a internet: às vezes engole a resposta no meio do caminho
- 💳 **Cartão da Bia** · `cobrarCartao()` · a fatura, onde a cobrança aparece
- 🎫 **abc-123** · header `Idempotency-Key` · o número do pedido: o MESMO em todas as tentativas
- 📒 **Caderninho** · tabela com `UNIQUE(key)` · onde o servidor anota cada número de pedido e a resposta que deu

## 🎬 Cena 1 · Sem número de pedido
**App**: "Servidor, cobra R$150 da Bia, por favor!"
**Servidor**: "Cobrei! ✅ Tá aqui a resposta: deu certo!"
**Rede** _(mastigando)_: "Nhac. 😋"
**App** _(olhando pro relógio)_: "Ué, não veio nada. Deve ter dado ruim. Vou mandar de novo, né?"
**Servidor**: "Pedido de R$150? Opa, cobrei! ✅"
**Rede**: "Nhac. 😋"
**App**: "DE NOVO!"
**Servidor**: "Cobrei! ✅"
**Cartão da Bia**: "R$450?! TÁ DE BRINCADEIRA?! ELA COMPROU UM TÊNIS, NÃO UMA CENTOPEIA! 😱"
> 🚨 O servidor não tinha como saber que era o mesmo pedido.

## 🎬 Cena 2 · Com número de pedido
**App**: "Cobra R$150. Pedido número **abc-123**."
**Servidor**: "abc-123? Nunca vi. Cobro e anoto no caderninho junto com a resposta."
**Caderninho**: "Anotado: abc-123 → deu certo. ✍️"
**Rede**: "Nhac. 😋"
**App**: "Cobra R$150. Pedido **abc-123**." _(o mesmo número, de propósito)_
**Servidor** _(folheando)_: "Peraí… abc-123 já tá aqui! Não cobro de novo, só te devolvo a mesma resposta."
**Cartão da Bia**: "R$150. Certinho. Pode respirar." 😌

## 🎬 Cena 3 · O app espertinho
**App**: "E se eu inventar um número novo a cada tentativa? Pedido **xyz-999**!"
**Servidor**: "Número novo é pedido novo. Cobrei! ✅"
**Cartão da Bia**: "DE NOVO NÃO, PELO AMOR!" 🤦
**abc-123**: "O número é da COMPRA, meu bem. Não da tentativa."

## 💻 Traduzindo pro código
```js
// App: UMA chave por compra, reaproveitada em todos os retries
const key = uuid();                         // abc-123
for (let i = 1; i <= 4; i++) {
  try { return await rede(servidor, { headers: { 'Idempotency-Key': key }, body }); }
  catch { await sleep(100 * 2 ** (i - 1)); } // backoff: 100, 200, 400 ms
}

// Servidor: olha o caderninho antes de cobrar
const salvo = db.idempotencia.get(key);
if (salvo) return salvo.response;           // já fiz: devolvo a mesma resposta
cobrarCartao(body.valor);
db.idempotencia.set(key, { response });     // na vida real: INSERT com UNIQUE(key) na mesma transação
```

| No lab, mude | O que acontece |
| --- | --- |
| `USAR_CHAVE = false` | 3 cobranças (Cena 1) |
| `USAR_CHAVE = true` | 1 cobrança (Cena 2) |
| `NOVA_CHAVE_POR_TENTATIVA = true` | volta a cobrar várias vezes (Cena 3) |

## ➕ O que o recrutador pergunta depois
- **Mesma chave com valor diferente?** O servidor guarda um hash do corpo e responde `422`: é um bug do cliente, não um retry.
- **Duas tentativas chegando juntas?** O `UNIQUE(key)` no banco garante que só uma grava; a outra espera ou recebe `409`.
- **Por quanto tempo guardar?** Algumas horas ou dias (a Stripe guarda 24h), com limpeza automática.

## 🎤 Pra entrevista
"Retry é inevitável porque a rede perde respostas. O cliente manda uma **Idempotency-Key** por intenção de operação (não por tentativa); o servidor grava a chave com constraint única junto com a resposta, na mesma transação da cobrança, e se a chave voltar devolve a resposta salva sem executar de novo. Chave repetida com corpo diferente vira `422`."
