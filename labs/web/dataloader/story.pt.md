**Cliente**: "Quero 50 viagens, cada uma com o nome de quem pediu." 📋

**Resolver de `trips`**: "SELECT das 50 viagens. Pronto!" *(1 query)*

**Resolver de `requester`** (rodando UMA VEZ POR VIAGEM): "Viagem 1? Busco o usuário 1 no banco. Viagem 2? Busco o usuário 2. Viagem 3? Busco o usuário 3…" 🏃🏃🏃

**Banco**: "51 QUERIES?! E metade é do mesmo usuário! 😵" **← N+1**

**Agora com DataLoader (o garçom esperto):**

**DataLoader** 🧑‍🍳: "Não vou à cozinha a cada pedido. Vou **anotar** todos os pedidos da mesa nesse instante…"

**Resolvers**: "Usuário 1! Usuário 2! Usuário 1! Usuário 3! Usuário 2!…"

**DataLoader**: "Anotado. Tirei os repetidos: usuários 1, 2, 3… 10. Agora sim, UMA ida à cozinha: `WHERE id IN (1..10)`." *(ele espera o fim do tick com uma **microtask**, igualzinho ao lab do event loop!)*

**Banco**: "2 queries no total. 🙏"

**DataLoader**: "E entrego cada prato **na ordem em que me pediram**, senão o usuário 1 recebe o nome do 2." 🍽️

**DataLoader** (sobre si mesmo): "Ah, e eu nasço e morro **em cada requisição**: se eu fosse um só para o servidor inteiro, guardaria dados de um usuário e mostraria pra outro."

**🧠 Moral da história para entrevista**

"Em GraphQL cada campo tem um resolver; numa lista, o resolver roda uma vez por item e gera N+1 queries. O **DataLoader** junta os `load(id)` do mesmo tick numa query com `IN`, devolve na ordem pedida e é criado por requisição."
