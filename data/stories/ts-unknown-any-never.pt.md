**Dado vindo da API** 📦: "Oi! Não sei bem o que eu sou."

**`any`** 😎: "Relaxa, comigo você pode ser TUDO. Quer chamar `.toUpperCase()`? Chama! Se quebrar, quebra em produção, problema de quem estiver de plantão."

**TypeScript**: "Com o `any` eu fecho os olhos. 🙈"

**`unknown`** 🕵️: "Comigo não. Você pode ser qualquer coisa, sim, mas **antes de usar eu vou conferir**. `typeof` é string? Aí sim, pode usar como string."

**Zod** 🧪: "E se for um objeto grande, eu confiro campo por campo pra você."

**`never`** 🚫: "E eu sou o tipo **impossível**: nenhum valor cabe em mim. Se alguém criar um status novo e esquecer de tratar no `switch`, eu viro erro de compilação e aviso na hora!"

**Status novo `'cancelada'`**: "Cheguei sem ninguém me tratar…"

**`never`**: "BUILD QUEBRADO! Trata ela aí!" 🚨

**🧠 Moral da história para entrevista**

"`any` desliga a checagem; `unknown` aceita tudo mas obriga a estreitar o tipo antes de usar (é o certo para dados de fora); `never` é o tipo impossível, usado para garantir que todos os casos de uma union foram tratados. E tipos não existem em runtime: dado de fora se valida com Zod."
