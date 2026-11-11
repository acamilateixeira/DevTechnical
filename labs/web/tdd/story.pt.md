**PO**: "Regra nova: o gestor só aprova viagem que caiba no orçamento E no limite dele."

**Dev apressada**: "Já vou codando!" ⌨️

**Teste** (pulando na frente): "PERAÍ! No TDD **eu nasço primeiro**!" ✋

**Teste 1**: "Dado custo 500, orçamento 1000 e limite 800, espero `ok: true`." *(roda)* 🔴 **VERMELHO**: "a função nem existe!"

**Dev**: "Faço o MÍNIMO pra passar." 🟢 **VERDE**

**Teste 2**: "Custo 1200 com orçamento 1000? Espero `SEM_ORCAMENTO`." 🔴

**Dev**: "Acrescento esse `if`." 🟢

**Teste 3**: "Custo exatamente igual ao limite: aprova ou não?"

**Dev**: "…não sei."

**Teste 3**: "ENTÃO PERGUNTA PRO PO!" 🗣️

**PO**: "Igual ao limite pode."

**Teste 3**: "Então vou ficar aqui pra sempre documentando isso." 📜 🟢

**Refatorar** 🧹: "Agora que está tudo verde, posso melhorar nomes e organizar o código. Se eu quebrar algo, os testes gritam."

**Dev, meses depois**, trocando `>` por `>=` sem querer: …

**Teste 3**: 🔴 "EI! O PO DISSE QUE NO LIMITE PODE!" 🚨

**🧠 Moral da história para entrevista**

"TDD é **vermelho → verde → refatorar**: escrevo o teste do próximo comportamento, vejo falhar, faço o mínimo para passar e melhoro com os testes me protegendo. Os casos de borda viram documentação viva da regra combinada com o PO."
