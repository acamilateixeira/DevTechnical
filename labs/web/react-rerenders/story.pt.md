**Context** (com um megafone 📢): "ATENÇÃO, TODO MUNDO QUE ESTÁ ME OUVINDO! O VALOR MUDOU!"

**Lista**: "Opa, eu mostro os itens, preciso me atualizar mesmo." ✅

**BotaoAdicionar**: "Mas eu só uso o `dispatch`, que NUNCA muda… por que estou me redesenhando?! 😩"

**Context**: "Porque você está ouvindo o megafone, e o megafone grita pra todo mundo. E pior: o `{ state, dispatch }` é um **objeto novo a cada render**, então pra mim SEMPRE mudou."

**Rodapé** (com `memo`, sem ouvir o Context): "Eu? Tô de fone. Minhas props não mudaram, então nem acordo." 😴

**Agora com dois Contexts separados:**

**Context do estado** 📢: "OS ITENS MUDARAM!"

**Lista**: "Ouvi, me atualizo." ✅

**Context do dispatch** 🤫: "Eu nunca grito nada, porque o `dispatch` do `useReducer` é sempre o mesmo."

**BotaoAdicionar** (ouvindo só o Context do dispatch): "FINALMENTE DESCANSO! 😌"

**Usuária** (clica em "trocar tema"): …

**Lista**: "Por que EU me redesenhei? Eu nem uso o tema!"

**Mini Zustand** (passando no corredor): "Porque você ouve o estado INTEIRO. Comigo você assina só a parte que usa (o **seletor**). Vai lá no meu lab." 😏

**🧠 Moral da história para entrevista**

"Todo componente que lê um Context re-renderiza quando o valor muda. Para evitar re-render à toa: separo estado e dispatch em Contexts diferentes, não crio objeto novo no `value`, e uso `memo`. Se precisar de seleção fina, uso uma store com seletores (Zustand, Redux)."
