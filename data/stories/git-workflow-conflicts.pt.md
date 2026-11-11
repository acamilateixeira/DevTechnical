**Main** 🌳: "Eu sou a linha oficial."

**Sua branch** 🌿: "Saí da main na segunda. Hoje é sexta e a main andou 20 commits…"

**Merge** 🤝: "Eu junto as duas e registro um commit dizendo 'aqui se juntaram'. A história fica como aconteceu."

**Rebase** ✂️: "Eu pego seus commits e **reaplico em cima** da main atual, como se você tivesse começado hoje. Fica tudo em linha reta."

**Rebase**: "Mas eu reescrevo a história, então só me usa na SUA branch, que ninguém mais usa."

**Conflito** ⚔️: "Você e a Bia mudaram a MESMA linha. Quem vence?"

**Dev apressada**: "A minha, óbvio!"

**Git**: "Calma! Lê o que a Bia quis fazer, conversa com ela, junta as duas intenções e roda os testes." 🗣️

**Produção** 🔥: "BUG URGENTE!"

**Hotfix** 🚑: "Eu saio da versão que está **em produção**, não da develop (que tem coisa não testada). Corrijo, publico, e depois levo a correção de volta pra develop."

**`git push --force` na main** 😈: "Posso?"

**Todo mundo**: "NÃO!" (`--force-with-lease`, e só na sua branch.)

**🧠 Moral da história para entrevista**

"Merge preserva o histórico; rebase deixa linear mas reescreve, então só na minha branch. Conflito se resolve entendendo a intenção das duas mudanças e rodando os testes. Hotfix sai da versão em produção e volta para a linha de desenvolvimento. `revert` em branch compartilhada, `reset` só local."
