# 🐃 O estouro da boiada na padaria

> Uma padaria famosa pelo pão de queijo. A vitrine (o cache) mostra a fornada pronta; a cozinha (o banco) faz pão do zero.

## 🎭 Elenco
- 🪟 **Vitrine** · Redis · `cache.get()` · o cache: responde na hora, mas cada fornada vale só 5 s (o TTL)
- 👨‍🍳 **Cozinha** · `bancoBuscarProduto()` · o banco de dados: faz certinho, mas devagar e com fila
- ⏰ **Relógio** · `TTL_MS` · avisa quando a fornada na vitrine venceu
- 🐃 **Boiada** · 50 chamadas a `getProduto(42)` ao mesmo tempo · os clientes que chegam todos juntos
- 🤝 **Single-flight** · `emAndamento` (um `Map` de promises) · o porteiro que deixa só um ir à cozinha e o resto espera junto
- 🎲 **Jitter** · `TTL_MS + rand(0, 1000)` · um tempinho aleatório pra nem toda fornada vencer no mesmo segundo

- 🙋 **Cliente 1** · a primeira requisição que achou a vitrine vazia · vai à cozinha
- 🧍 **Cliente 2** · a segunda requisição · espera a busca do Cliente 1
- 👥 **Clientes 2 a 50** · as outras requisições · esperam juntas
## 🎬 Cena 1 · Tudo tranquilo
**Vitrine**: "Pão de queijo 42 aqui, quentinho! Quem pedir, levo na hora." ⚡
**Cozinha** _(tomando um cafezinho)_: "Ô beleza, a vitrine me poupa de tudo." 😌

## 🎬 Cena 2 · Venceu a fornada
**Relógio**: "Deu 5 segundos! A fornada 42 VENCEU!" ⏰
**Boiada** _(50 pessoas entrando juntas)_: "QUERO O 42!"
**Vitrine**: "Acabou! Vai lá na cozinha!"
**Boiada**: "COZINHA! COZINHA! COZINHA! COZINHA!…" 🐃🐃🐃🐃
**Cozinha** _(derrubando o café)_: "50 PEDIDOS IGUAIS AO MESMO TEMPO?! EU SÓ TENHO UM FORNO, GENTE!" 😵
> 🚨 Cache stampede: todo mundo foi ao banco pela mesma coisa.

## 🎬 Cena 3 · Com porteiro
**Cliente 1**: "Acabou na vitrine? Deixa que eu vou na cozinha." 🏃
**Cliente 2**: "Também não achei… mas tem alguém indo?"
**Single-flight**: "Tem, o Cliente 1. Espera a MESMA fornada dele, não abre outro pedido." 🤝
**Clientes 2 a 50**: "Beleza, a gente espera junto. Alguém trouxe baralho?" 🃏
**Cozinha**: "Um pedido só. Assim dá pra trabalhar." 😌
**Cliente 1**: "Voltei! E botei na vitrine por 5 segundos e mais um tiquinho aleatório."
**Jitter**: "É pra fornada do 42 e a do 43 não vencerem no mesmo segundo e começar tudo de novo." 🎲

## 💻 Traduzindo pro código
```js
async function getProduto(id) {
  const noCache = await cache.get(`produto:${id}`);          // 🪟 olha a vitrine
  if (noCache) return noCache;
  if (emAndamento.has(id)) return emAndamento.get(id);       // 🤝 alguém já foi? espera a mesma promise
  const busca = (async () => {
    const produto = await bancoBuscarProduto(id);            // 👨‍🍳 vai à cozinha
    await cache.set(`produto:${id}`, produto, TTL_MS + rand(0, 1000)); // 🎲 TTL com jitter
    return produto;
  })();
  emAndamento.set(id, busca);
  try { return await busca; } finally { emAndamento.delete(id); }
}
```

| `SINGLE_FLIGHT` no lab | Queries no banco |
| --- | --- |
| `false` | 50 |
| `true` | 1 |

Entre servidores diferentes, o mesmo porteiro vira um lock no Redis (`SET chave NX PX`). Outra saída é renovar a chave quente antes de ela vencer.

## 🎤 Pra entrevista
"Cache-aside: busco no cache; se não tiver, busco no banco e gravo com TTL. Quando uma chave popular expira, todo mundo vai ao banco junto: é o cache stampede. Evito deixando só uma requisição recalcular (single-flight ou lock distribuído), colocando jitter no TTL e renovando chaves quentes antes de expirarem."
