**Cliente** (o app): "Servidor, cobra R$150 no cartão, por favor!"

**Servidor**: "Cobrei! ✅ Toma a resposta: 201 Created!"

**Rede** (comendo a resposta no caminho): "Nhac. 😋"

**Cliente** (esperando…): "Não veio resposta. Deve ter dado erro. VOU TENTAR DE NOVO!" 🔁

**Servidor**: "Pedido novo de R$150? Cobrei de novo! ✅"

**Rede**: "Nhac. 😋"

**Cliente**: "DE NOVO!"

**Servidor**: "Cobrei de novo! ✅"

**Cartão da cliente**: "R$450?! EU SÓ COMPREI UMA COISA! 😱"

**Agora com Idempotency-Key:**

**Cliente**: "Cobra R$150. Meu número de pedido é **abc-123**." 🎫

**Servidor**: "Primeira vez que vejo abc-123: cobro e **anoto o número junto com a resposta**."

**Rede**: "Nhac. 😋"

**Cliente**: "Cobra R$150, pedido **abc-123**." *(o MESMO número)*

**Servidor**: "abc-123? Já fiz esse! Não cobro de novo: só te devolvo a mesma resposta que eu tinha guardado." 📋

**Cartão**: "R$150. Certinho." 😌

**Cliente esperta demais** (gerando número novo a cada tentativa): "Pedido **xyz-999**!"

**Servidor**: "Número novo = pedido novo = cobro de novo. A chave tem que ser da **intenção de pagar**, não da tentativa!" 🤦

**🧠 Moral da história para entrevista**

"Retries são inevitáveis porque a rede perde respostas. O cliente manda uma **Idempotency-Key** por intenção de operação; o servidor grava a chave com constraint única junto com a resposta e, se ela voltar, devolve a resposta salva sem executar de novo."
