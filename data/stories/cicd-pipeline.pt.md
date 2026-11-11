**Dev**: "Abri o PR!"

**CI** 🤖: "Lint ✅, tipos ✅, testes ✅, build ✅, procurei segredo vazado ✅, dependência vulnerável ✅. Pode revisar."

**Revisora** 👀: "Aprovado!"

**CD** 🚚: "Construí UMA imagem, com a etiqueta do commit. A MESMA imagem vai pra homologação e depois pra produção. Nada de recompilar no caminho."

**Migration** 🗄️: "E eu sou compatível com a versão antiga e com a nova ao mesmo tempo, porque durante o deploy as duas rodam juntas."

**Feature flag** 🎚️: "O código novo está em produção, mas DESLIGADO. Ligo pra 1% dos usuários."

**Canary** 🐤: "Eu sou a versão nova recebendo 5% do tráfego. Se a taxa de erro subir…"

**Rollback automático** ⏪: "…eu volto pra versão anterior sozinho, em segundos."

**Dev**: "Então posso fazer deploy na sexta?" 😏

**Pipeline**: "Com deploy pequeno, flag, canary e rollback testado… pode. O medo vem de deploy grande e sem volta."

**DORA** 📊: "E eu meço se vocês estão melhorando: frequência de deploy, tempo até produção, taxa de falha e tempo pra recuperar."

**🧠 Moral da história para entrevista**

"CI rápido em todo PR (lint, tipos, testes, build, scans); imagem imutável promovida entre ambientes; migrations compatíveis (expand/contract); feature flags separando deploy de release; canary com rollback por métrica. Deploy sem medo é reduzir o raio de explosão e o tempo de recuperação."
