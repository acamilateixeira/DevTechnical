**Dado da API** (lista de viagens) 🌐: "Eu moro no servidor. A tela só tem uma CÓPIA de mim, que pode ficar velha."

**TanStack Query** 🗃️: "Deixa comigo: eu busco, guardo em cache, atualizo quando volta o foco, cancelo e deduplico. Isso é **server state**."

**Filtro "só pendentes"** 🔗: "Eu moro na **URL**: `?status=pendente`. Assim dá pra compartilhar o link e sobrevivo ao F5."

**Modal aberto** 🪟: "Eu sou só desse componente. `useState` e pronto."

**Tema escuro** 🌙: "Eu sou global mas mudo pouco: **Context** resolve."

**Carrinho com 15 regras** 🛒: "Eu mudo toda hora e muita gente me lê…"

**Zustand / Redux Toolkit** 🏪: "Então vem comigo: cada componente assina só o pedaço que usa (seletor)."

**App antigo com Redux** 🦖: "Eu guardava a resposta da API no store e sincronizava tudo na mão…"

**TanStack Query**: "…e 80% do seu 'estado global' era cache de servidor. Eu cuido disso agora." 😏

**🧠 Moral da história para entrevista**

"Separo o estado pela natureza: server state com TanStack Query/SWR/Apollo; estado de URL na query string; estado local com `useState`; global de cliente com Context se muda pouco, Zustand ou Redux Toolkit se muda muito e precisa de seletores."
