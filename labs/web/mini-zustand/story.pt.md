# 🍕 A pizzaria que só avisa quem pediu

> Uma pizzaria que guarda todos os pedidos num quadro fora da cozinha. Cada cliente só quer saber da própria pizza.

## 🎭 Elenco
- 🧑‍🍳 **Store** · `create()` · a pizzaria: guarda o estado fora do React e avisa quem se inscreveu
- 🔎 **CampoBusca** · `useFiltros((s) => s.busca)` · cliente que só quer saber da `busca`
- 🗂️ **SeletorServico** · `useFiltros((s) => s.servico)` · cliente que só quer saber do `servico`
- 🔴 **BotaoNivel** · `useFiltros((s) => s.nivel)` · cliente que só quer saber do `nivel`
- 🍽️ **Seletor** · `(s) => s.busca` · o pedido: diz qual pedaço do estado o componente quer
- 🟰 **`===`** · comparação por referência · o garçom que confere se o pedaço mudou
- 🧾 **`useShallow`** · comparação campo a campo · o garçom caprichoso que confere item por item

## 🎬 Cena 1 · Cada um pede a sua fatia
**Store**: "Tenho TUDO aqui: busca, serviço e nível. Quem quiser alguma coisa, se inscreve e diz o QUÊ."
**CampoBusca**: "Quero só a busca."
**SeletorServico**: "Só o serviço, por favor."
**BotaoNivel**: "Só o nível. E sem cebola."
= 🧑‍🍳 Estado na store: busca: "" · servico: "trips-api" · nivel: "todos"
= 📝 Inscritos (listeners): CampoBusca → busca · SeletorServico → servico · BotaoNivel → nivel
= 🔄 Renders: 1 de cada (o primeiro)

## 🎬 Cena 2 · A Bia digita "a"
**Store**: "MUDOU ALGUMA COISA! Vou avisar TODO MUNDO que se inscreveu!" 📣
**`===`** _(conferindo a busca)_: "`''` virou `'a'`. Mudou!"
**CampoBusca**: "Então me redesenho." ✅
**`===`** _(conferindo o serviço)_: "`'trips-api'` e `'trips-api'`. Igualzinho."
**SeletorServico**: "Volto a dormir." 😴
**BotaoNivel**: "Também. Zzz." 😴
= 🧑‍🍳 Estado na store: busca: "a" · servico: "trips-api" · nivel: "todos"
= 📣 Avisados: os 3 inscritos
= 🔄 Re-renderizou: só o CampoBusca ("" !== "a")
= 😴 Não re-renderizou: SeletorServico e BotaoNivel (valor igual por ===)

## 🎬 Cena 3 · O pedido que sempre parece novo
**CampoBusca**: "Agora quero assim: `{ busca }`, embrulhado num objeto."
**`===`**: "`{busca:'a'}` e `{busca:'a'}`… são duas caixas DIFERENTES! Mudou!"
**CampoBusca**: "Me redesenho! E de novo! E DE NOVO!" 🔁💥
**`useShallow`**: "Deixa comigo: eu abro a caixa e comparo campo por campo. Igual? Ninguém acorda."
= 🍽️ Seletor: `s => ({ busca: s.busca })` (objeto novo a cada leitura)
= 🟰 Comparação: `{busca:"a"} === {busca:"a"}` → false
= 🔄 Renders do CampoBusca: em loop ❌ (o React avisa: "getSnapshot should be cached")
= 🧾 Com `useShallow`: compara campo a campo → re-renderiza só quando muda ✅

## 💻 Traduzindo pro código
```ts
function create(init) {
  let state; const listeners = new Set();
  const set = (partial) => { state = { ...state, ...partial }; listeners.forEach((l) => l()); }; // 📣 avisa todo mundo
  state = init(set, () => state);
  const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
  return (selector) => useSyncExternalStore(subscribe, () => selector(state)); // 🟰 re-renderiza se o pedaço mudar (===)
}
const busca = useFiltros((s) => s.busca);           // ✅ string: compara bem
const ruim  = useFiltros((s) => ({ busca: s.busca })); // ❌ objeto novo a cada leitura
const bom   = useFiltros(useShallow((s) => ({ busca: s.busca, nivel: s.nivel }))); // ✅
```

O Zustand de verdade e o `useSelector` do Redux funcionam assim por dentro. A peça do React que faz isso é o `useSyncExternalStore`.

## 🎤 Pra entrevista
"Zustand e o `useSelector` do Redux guardam o estado fora do React. Cada componente assina só a fatia que usa com um seletor e só re-renderiza quando essa fatia muda, comparando por `===`. Por baixo é o `useSyncExternalStore`. Seletor que cria objeto novo re-renderiza sempre; para isso existe o `useShallow`."
