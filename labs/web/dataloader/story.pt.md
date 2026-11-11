# 🍽️ O garçom que ia à cozinha a cada pedido

> Um restaurante lotado. A mesa grande pediu 50 pratos, e cada prato precisa do nome de quem pediu.

## 🎭 Elenco
- 🙋 **Cliente** · a query `{ trips { requester { nome } } }` · a mesa que faz o pedido grandão
- 🧾 **Garçom das viagens** · resolver de `trips` · busca as 50 viagens de uma vez
- 🏃 **Garçom afobado** · resolver de `requester` · roda UMA VEZ POR VIAGEM e vai à cozinha a cada uma
- 👨‍🍳 **Cozinha** · o banco de dados · cada ida é uma query
- 🧑‍💼 **Garçom esperto** · `DataLoader` · anota tudo da mesa, tira os repetidos e vai à cozinha uma vez só
- 📝 **Bloquinho** · `queueMicrotask()` · o momento em que ele fecha o bloquinho: no fim do tick, quando todo mundo já pediu

## 🎬 Cena 1 · O garçom afobado
**Cliente**: "Quero 50 viagens, cada uma com o nome de quem pediu." 📋
**Garçom das viagens**: "50 viagens, saindo! Uma ida só." ✅
**Garçom afobado**: "Viagem 1? Corro na cozinha buscar o usuário 1! Viagem 2? Corro buscar o 2! Viagem 3? O 1 de novo! Corro!" 🏃🏃🏃
**Cozinha**: "51 IDAS?! E metade é pro MESMO usuário! Para de me fazer de besta!" 😵
> 🚨 1 query da lista + 1 por item: é o N+1.

## 🎬 Cena 2 · O garçom esperto
**Garçom esperto**: "Eu não vou à cozinha a cada pedido. Vou anotar tudo que a mesa pedir agora…"
**Garçom afobado** _(gritando os pedidos)_: "Usuário 1! Usuário 2! Usuário 1! Usuário 3! Usuário 2!…"
**Bloquinho**: "Todo mundo já pediu? Fechei!" 📝
**Garçom esperto**: "Tirei os repetidos: usuários 1 a 10. Agora sim, UMA ida à cozinha com a lista inteira."
**Cozinha**: "2 idas no total. Deus te abençoe." 🙏
**Garçom esperto**: "E entrego cada prato na ordem em que pediram, senão o usuário 1 recebe o nome do 2 e dá briga." 🍽️

## 🎬 Cena 3 · Ele não é eterno
**Cliente**: "Você lembra de mim amanhã?"
**Garçom esperto**: "Nem pensar. Eu nasço e morro em cada requisição. Se eu fosse um só pro restaurante inteiro, ia servir o prato de um cliente pra outro." 🙅

## 💻 Traduzindo pro código
```js
const loader = new DataLoader(async (ids) => {            // 🧑‍💼 garçom esperto (1 por requisição)
  const rows = await db.query('SELECT * FROM users WHERE id = ANY($1)', [ids]); // 👨‍🍳 uma ida só
  const porId = new Map(rows.map((u) => [u.id, u]));
  return ids.map((id) => porId.get(id) ?? null);          // 🍽️ mesma ordem dos pedidos
});

const resolvers = {
  Trip: { requester: (trip) => loader.load(trip.requesterId) }, // 🏃 ainda roda por viagem, mas só anota
};
```

| `USAR_DATALOADER` no lab | Queries no banco |
| --- | --- |
| `false` | 51 |
| `true` | 2 |

O "fechar o bloquinho" é uma microtask, igualzinho à fila VIP do lab do event loop: ele espera todos os resolvers do mesmo tick pedirem.

## 🎤 Pra entrevista
"Em GraphQL cada campo tem um resolver; numa lista, o resolver do campo filho roda uma vez por item e gera N+1 queries. O DataLoader junta os `load(id)` do mesmo tick numa query com `IN`, deduplica, devolve na ordem pedida e é criado por requisição, para o cache não vazar dados entre usuários."
