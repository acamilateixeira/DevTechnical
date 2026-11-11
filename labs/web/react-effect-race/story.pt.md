**Usuária** (clicando rápido): "Quero ver ofertas de R$3000… não, R$2000… não, R$1000!"

**`useEffect`**: "`amount` mudou! Saio buscando. 🏃" *(três vezes, uma pra cada clique)*

**Pedido de R$3000**: "Vou demorar 1,4 s, a rede tá lenta pra mim…"

**Pedido de R$2000**: "Eu demoro 0,8 s."

**Pedido de R$1000**: "Eu sou rapidinho: 0,2 s!"

**Pedido de R$1000** (chegando primeiro): "CHEGUEI! `setData(1000)`!" ✅

**Pedido de R$2000** (chegando depois): "CHEGUEI! `setData(2000)`!" 😬

**Pedido de R$3000** (chegando por último): "CHEGUEI! `setData(3000)`! EU VENCI!" 🏆

**Tela**: "Você escolheu R$1000, mas estou mostrando R$3000. 🤡" **← race condition**

**Agora com AbortController e cleanup:**

**Cleanup** (o `return` do effect): "Antes de cada busca nova, eu passo cancelando a anterior. **Você, R$3000: CANCELADO. Você, R$2000: CANCELADO.**" ✂️

**Pedido de R$3000**: "Mas eu ia chegar…"

**Cleanup**: "Ninguém mais quer você, amor. 💅"

**Tela**: "Escolheu R$1000, mostro R$1000." ✅

**🧠 Moral da história para entrevista**

"Quando o effect depende de um valor que muda rápido, uma resposta antiga pode chegar depois da nova e sobrescrever a tela. Eu cancelo a requisição anterior no **cleanup** com `AbortController`. Em produção, uso TanStack Query, que já faz isso."
