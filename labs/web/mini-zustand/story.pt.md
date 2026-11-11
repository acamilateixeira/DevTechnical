**Store** (guardando o estado fora do React): "Eu tenho TUDO: `busca`, `servico`, `nivel`. Quem quiser alguma coisa, se inscreve e me diz o QUÊ quer."

**CampoBusca**: "Eu quero só a `busca`." *(seletor: `s => s.busca`)*

**SeletorServico**: "Eu quero só o `servico`."

**BotaoNivel**: "Eu quero só o `nivel`."

**Usuária** (digita "a" na busca)

**Store**: "MUDEI! Vou avisar TODO MUNDO que se inscreveu!" 📣

**CampoBusca**: "Meu pedaço mudou? `''` → `'a'`. MUDOU! Me redesenho." ✅

**SeletorServico**: "Meu pedaço mudou? `'trips-api'` → `'trips-api'`. Igual (`===`). Volto a dormir." 😴

**BotaoNivel**: "Igual também. Zzz." 😴

**CampoBusca** (com um seletor que cria objeto novo: `s => ({ busca: s.busca })`): "Meu pedaço mudou? `{busca:'a'}` → `{busca:'a'}`… são objetos DIFERENTES (não é o mesmo `===`)! MUDOU! E de novo! E de novo!" 🔁💥

**Zustand**: "É por isso que eu tenho o `useShallow`: ele compara campo a campo."

**🧠 Moral da história para entrevista**

"Zustand e o `useSelector` do Redux guardam o estado fora do React. Cada componente assina só a fatia que usa (seletor) e só re-renderiza quando essa fatia muda, comparando por `===`. Por baixo, é o `useSyncExternalStore` do React."
