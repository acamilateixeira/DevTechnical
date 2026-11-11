# 🍽️ O prato feito e o monte-seu-prato

> A tela de detalhes da viagem está com fome: quer a viagem, quem pediu e o centro de custo.

## 🎭 Elenco
- 📱 **Tela** · o front-end · quer exatamente 3 informações
- 🍛 **Restaurante PF** · REST (`GET /trips/1`, `GET /users/7`…) · cada rota é um prato pronto, com tudo que vem nele
- 🥗 **Monte seu prato** · GraphQL (`POST /graphql`) · o cliente escolhe os campos num pedido só
- 🍟 **Sobra no prato** · over-fetching · veio campo que a tela não pediu
- 🏪 **Marmita pronta na geladeira** · cache HTTP / CDN · guarda a resposta de um `GET` pelo endereço
- 🦹 **Espertinho** · query profunda demais · pede `amigos { amigos { amigos … } } }` até travar
- 🛑 **Segurança** · limite de profundidade e complexidade · barra pedido caro demais

- 👨‍🍳 **Cozinha** · resolvers no servidor · quem prepara cada campo pedido
## 🎬 Cena 1 · No restaurante PF
**Tela**: "Quero a viagem, quem pediu e o centro de custo."
**Restaurante PF**: "Prato 1: viagem. Prato 2: usuário. Prato 3: centro de custo. Três idas até a cozinha!"
**Tela**: "E o prato 1 veio com 40 acompanhamentos, eu só queria 3…" 🍟
**Marmita pronta na geladeira**: "Mas olha: como cada prato tem endereço fixo, eu guardo o `GET /trips/1` e entrego sem nem incomodar a cozinha." 🏪
= 🍛 Requisições HTTP: 3 (`/trips/1`, `/users/7`, `/cost-centers/3`)
= 🍟 Campos recebidos: ~40 (a tela usa 3) → over-fetching
= 🏪 Cache HTTP / CDN: funciona (GET por URL) ✅

## 🎬 Cena 2 · No monte-seu-prato
**Monte seu prato**: "Me diz EXATAMENTE o que quer, num pedido só."
**Tela**: "Título da viagem, nome de quem pediu e nome do centro de custo."
**Monte seu prato**: "Saindo! Uma ida só e só o que você pediu." 🥗
**Tela**: "Tô apaixonada." 😍
**Marmita pronta na geladeira**: "Pena que é tudo POST pro mesmo endereço. Não consigo guardar nada. Me sinto inútil." 😢
= 🥗 Requisições HTTP: 1 (`POST /graphql`)
= 🎯 Campos recebidos: 3, exatamente os pedidos ✅
= 🏪 Cache HTTP / CDN: não ajuda (POST no mesmo endereço) ❌

## 🎬 Cena 3 · O espertinho
**Espertinho**: "Quero meus amigos, os amigos deles, os amigos dos amigos deles…"
**Segurança**: "Opa, opa. Profundidade máxima 5, complexidade máxima 1000. Próximo!" 🛑
**Cozinha**: "E cada campo tem um resolver, viu? Cuidado com o N+1." _(→ lab do DataLoader)_
= 🦹 Query recebida: `friends` aninhado 8 níveis
= 🛑 Limites: profundidade 5 · complexidade 1000
= 🚫 Resultado: recusada antes de rodar

## 💻 Traduzindo pro código
```http
# 🍛 REST: 3 idas
GET /trips/1
GET /users/7
GET /cost-centers/3
```
```graphql
# 🥗 GraphQL: 1 ida, só o que a tela usa
query {
  trip(id: 1) { title requester { name } costCenter { name } }
}
```

| | REST | GraphQL |
| --- | --- | --- |
| Pedidos | Vários endpoints | Um endpoint, uma query |
| Campos | O servidor decide | O cliente decide |
| Cache HTTP/CDN | Natural (por URL) | Difícil (tudo POST) |
| Cuidados | Versionamento, over-fetching | N+1, queries caras, autorização por campo |

## 🎤 Pra entrevista
"REST é simples, tem cache HTTP natural e observabilidade por rota; GraphQL deixa o cliente pedir exatamente os campos numa requisição, ótimo para front-ends ricos, mas perde o cache HTTP e exige cuidado com N+1, limite de profundidade e autorização por campo. Uso REST para APIs públicas e integrações e GraphQL como BFF de telas complexas."
