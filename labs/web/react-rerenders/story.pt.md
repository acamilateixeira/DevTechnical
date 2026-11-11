# 📢 O condomínio do megafone

> Um condomínio onde o síndico avisa tudo no megafone. Uns moradores precisam ouvir, outros só queriam dormir.

## 🎭 Elenco
- 📢 **Síndico** · `<Tudo.Provider value={{ state, dispatch }}>` · o Context: quando o valor muda, avisa todo mundo que está ouvindo
- 📋 **Lista** · `Lista` (lê os itens) · moradora que realmente precisa saber das novidades
- 🔘 **Botão** · `BotaoAdicionar` (usa só o `dispatch`) · morador que só quer o interfone, que nunca muda
- 🎧 **Rodapé** · `Rodape` com `memo` · morador de fone de ouvido: só acorda se as props dele mudarem
- 🤫 **Síndico do dispatch** · `<Dispatch.Provider>` · um segundo Context, só com o `dispatch`: nunca grita
- 🎯 **Mini Zustand** · store com seletor · a vizinha do lab ao lado, que entrega só o recado que cada um pediu

## 🎬 Cena 1 · Um megafone só
**Síndico**: "ATENÇÃO, CONDOMÍNIO! CHEGOU ITEM NOVO NO CARRINHO!" 📢
**Lista**: "Opa, isso é comigo. Vou me atualizar." ✅
**Botão** _(de pijama)_: "Mas eu só uso o interfone, que NUNCA muda… por que você me acordou?! 😩"
**Síndico**: "Porque você tá ouvindo o megafone, e o megafone grita pra todo mundo. E tem mais: o recado `{ state, dispatch }` é um papel NOVO a cada vez. Pra mim, SEMPRE mudou."
**Rodapé** _(de fone)_: "Eu? Minhas props são as mesmas. Nem acordei." 😴
> 🚨 O Botão re-renderizou à toa.

## 🎬 Cena 2 · Dois megafones
**Síndico**: "OS ITENS MUDARAM!"
**Lista**: "Ouvi, me atualizo." ✅
**Síndico do dispatch** 🤫: "Eu nunca grito nada. O `dispatch` do `useReducer` é sempre o mesmo, então não tenho novidade."
**Botão** _(ouvindo só o síndico do dispatch)_: "FINALMENTE, UMA NOITE DE SONO! 😌"

## 🎬 Cena 3 · A troca de tema
**Síndico**: "MUDOU O TEMA PRA ESCURO!"
**Lista**: "Ué, por que EU acordei? Eu nem uso o tema!"
**Mini Zustand** _(passando no corredor)_: "Porque você ouve o estado INTEIRO, querida. Comigo você assina só o pedaço que usa. Passa lá no meu lab." 😏

## 💻 Traduzindo pro código
```tsx
// ❌ um Context com objeto novo a cada render: todo leitor re-renderiza
<Tudo.Provider value={{ state, dispatch }}>

// ✅ estado e dispatch separados: quem só despacha não re-renderiza
<Dispatch.Provider value={dispatch}>   {/* 🤫 nunca muda */}
  <Estado.Provider value={state}>      {/* 📢 muda quando o estado muda */}

const Rodape = memo(function Rodape() { /* 🎧 só re-renderiza se as props mudarem */ });
```

| Técnica | O que resolve |
| --- | --- |
| Separar Context de estado e de dispatch | Quem só dispara ações para de re-renderizar |
| `useMemo` no `value` | Evita objeto novo a cada render do Provider |
| `memo` | Pula o render se as props forem iguais |
| Store com seletor (Zustand, Redux) | Cada componente re-renderiza só pela fatia que usa |

Para ver quem re-renderizou: React DevTools → Profiler → "Highlight updates when components render".

## 🎤 Pra entrevista
"Todo componente que lê um Context re-renderiza quando o valor muda, e um objeto criado no `value` muda a cada render. Para evitar re-render à toa, separo estado e dispatch em Contexts diferentes, memorizo o `value` e uso `memo` onde mede diferença. Se preciso de seleção fina, uso uma store com seletores, como Zustand ou Redux. E confirmo no Profiler do React DevTools antes de otimizar."
