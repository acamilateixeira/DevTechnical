**Tela do app**: "Preciso da viagem, de quem pediu e do centro de custo."

**REST** 🍽️ (restaurante à la carte com pratos prontos): "Prato 1: `GET /trips/1`. Prato 2: `GET /users/7`. Prato 3: `GET /cost-centers/3`. Três viagens até a cozinha."

**Tela**: "E o prato 1 veio com 40 campos, eu só queria 3…" *(over-fetching)*

**GraphQL** 🥗 (monte seu prato): "Me diz EXATAMENTE o que quer, num pedido só: `{ trip { title requester { name } costCenter { name } } }`."

**Tela**: "Uau, uma ida só e só o que eu pedi!" 😍

**Cache HTTP / CDN** 🗄️: "Mas com o REST eu guardava `GET /trips/1` e respondia sem nem incomodar o servidor. No GraphQL é tudo POST pro mesmo `/graphql`… não consigo ajudar." 😢

**Banco**: "E cada campo do GraphQL tem um resolver… cuidado com o N+1, hein!" *(→ lab DataLoader)*

**Hacker** 🦹: "E se eu pedir `amigos { amigos { amigos { amigos … } } }`?"

**GraphQL**: "Limite de profundidade e complexidade. Próximo!" 🛑

**🧠 Moral da história para entrevista**

"REST é simples, tem cache HTTP e observabilidade por rota; GraphQL deixa o cliente pedir exatamente os campos numa requisição, ótimo para front-ends ricos, mas perde cache HTTP e exige cuidado com N+1 e queries caras. Escolho REST para APIs públicas e integrações e GraphQL como BFF de telas complexas."
