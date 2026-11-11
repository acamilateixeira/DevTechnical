# 🏁 A corrida dos pedidos atrasados

> A Bia está escolhendo um empréstimo no app e muda de ideia três vezes em meio segundo.

## 🎭 Elenco
- 👩 **Bia** · `setAmount()` · a usuária clicando rápido
- 🏃 **`useEffect`** · `useEffect(..., [amount])` · o entregador: toda vez que o valor muda, sai buscando ofertas
- 🐢 **Pedido R$3000** · `fetchOffers(3000)` · a busca mais lenta (1,4 s)
- 🚶 **Pedido R$2000** · `fetchOffers(2000)` · a busca média (0,8 s)
- 🐇 **Pedido R$1000** · `fetchOffers(1000)` · a busca mais rápida (0,2 s)
- 📺 **Tela** · `setData()` · o que a Bia vê
- ✂️ **Cleanup** · o `return` do effect + `controller.abort()` · cancela o pedido anterior antes de sair um novo

## 🎬 Cena 1 · Sem cancelar nada
**Bia** _(clicando)_: "Quero ver R$3000… não, R$2000… não, não, R$1000!"
**`useEffect`**: "Valor mudou! Partiu buscar! 🏃 Mudou de novo? Partiu! E DE NOVO? PARTIU!"
**Pedido R$1000**: "Cheguei primeiro, sou rapidinho! Tela, mostra R$1000!" ✅
**Pedido R$2000**: "Cheguei! Tela, mostra R$2000!" 😬
**Pedido R$3000** _(chegando suado)_: "CHEGUEI! MOSTRA R$3000! EU VENCI!" 🏆
**Tela**: "Ela escolheu R$1000 e eu tô mostrando R$3000. Tô fazendo papel de palhaça." 🤡
> 🚨 Quem chegou por último ganhou, mesmo sendo um pedido velho.
= 👆 Valor escolhido: R$1000 (o último clique)
= 📨 Respostas na ordem que chegaram: 1000 (0,2 s) → 2000 (0,8 s) → 3000 (1,4 s)
= 📺 Tela mostra: R$3000 ❌ (quem chegou por último)
= ✂️ Pedidos cancelados: 0

## 🎬 Cena 2 · Com o cleanup
**Bia**: "R$3000… R$2000… R$1000!"
**Cleanup**: "Antes de cada busca nova, eu passo cancelando a anterior. Você, R$3000: CANCELADO. Você, R$2000: CANCELADO." ✂️
**Pedido R$3000**: "Mas eu já tava chegando…"
**Cleanup**: "Ninguém mais quer você, amor. Segue o baile." 💅
**Pedido R$1000**: "Tela, mostra R$1000!"
**Tela**: "Escolheu R$1000, mostro R$1000. Que alívio." ✅
= 👆 Valor escolhido: R$1000
= ✂️ Pedidos cancelados pelo cleanup: 2 (R$3000 e R$2000)
= 📨 Respostas que chamaram `setData`: só a de R$1000
= 📺 Tela mostra: R$1000 ✅

## 💻 Traduzindo pro código
```tsx
useEffect(() => {
  const controller = new AbortController();
  fetchOffers(amount, controller.signal)      // 🏃 sai buscando
    .then(setData)                            // 📺 atualiza a tela
    .catch((e) => { if (e.name !== 'AbortError') throw e; });
  return () => controller.abort();            // ✂️ cleanup: cancela este pedido quando amount mudar
}, [amount]);
```

| No lab | Resultado |
| --- | --- |
| Sem cancelamento | A tela mostra R$3000 com R$1000 escolhido (bug) |
| Com `AbortController` | A tela mostra R$1000 |

O **cleanup** roda antes do próximo effect (quando `amount` muda) e quando o componente sai da tela. Em produção, TanStack Query já cancela e descarta respostas antigas.

## 🎤 Pra entrevista
"Quando o effect depende de um valor que muda rápido, uma resposta antiga pode chegar depois da nova e sobrescrever a tela: é uma race condition. Eu cancelo a requisição anterior no cleanup do effect com `AbortController` (ou ignoro com uma flag). Em produção, uso TanStack Query, que já faz isso."
