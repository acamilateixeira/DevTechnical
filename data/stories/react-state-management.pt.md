# 🏠 Cada coisa no seu lugar

> A tela de viagens tem um monte de "estado". O dev guardava tudo na mesma gaveta e nada se achava.

## 🎭 Elenco
- 🌐 **Lista de viagens** · dado da API · mora no servidor; a tela só tem uma cópia, que pode ficar velha
- 🗃️ **Despensa inteligente** · TanStack Query (ou SWR, Apollo) · busca, guarda em cache, atualiza e deduplica o server state
- 🔗 **Bilhete na porta** · estado na URL (`?status=pendente`) · sobrevive ao F5 e dá pra mandar o link
- 🪟 **Modal aberto** · `useState` · coisa de um componente só
- 🌙 **Tema escuro** · Context · global, mas quase nunca muda
- 🛒 **Carrinho cheio de regra** · Zustand ou Redux Toolkit · global, muda toda hora, muita gente lê
- 🦖 **Redux da vovó** · store guardando resposta da API · sincronizava tudo na mão

- 🐻 **Zustand** · `create()` + seletor · a store global pequena e rápida
## 🎬 Cena 1 · A gaveta bagunçada
**Redux da vovó**: "Eu guardo TUDO: a lista da API, o filtro, o modal, o tema… e sincronizo na mão!" 🦖
**Lista de viagens**: "Vovó, eu fiquei velha há 10 minutos e ninguém me atualizou." 🌐
**Despensa inteligente**: "Deixa comigo, querida: eu busco, guardo, atualizo quando a aba volta pro foco, cancelo e não busco duas vezes a mesma coisa." 🗃️
**Despensa inteligente** _(baixinho)_: "Uns 80% do seu 'estado global' era só cache do servidor, viu?" 😏
= 🦖 No store do Redux: lista da API, filtro, modal, tema (tudo junto)
= 🌐 Lista de viagens: desatualizada há 10 min ❌
= 🗃️ Com TanStack Query: cache + refetch no foco + dedupe ✅

## 🎬 Cena 2 · Cada um na sua casa
**Bilhete na porta**: "Eu sou o filtro 'só pendentes'. Moro na URL: aperta F5 e eu continuo aqui, manda o link e a Bia vê o mesmo filtro." 🔗
**Modal aberto**: "Eu sou só desse componente. `useState` e pronto, não incomodo ninguém." 🪟
**Tema escuro**: "Eu sou de todo mundo, mas mudo uma vez na vida. Context me resolve." 🌙
**Carrinho cheio de regra**: "Eu mudo toda hora e tem um monte de componente me olhando…" 🛒
**Zustand**: "Então vem comigo: cada um assina só o pedaço que usa, e só quem precisa redesenha."
= 🔗 Filtro: na URL: `?status=pendente`
= 🪟 Modal: `useState` no componente
= 🌙 Tema: Context
= 🛒 Carrinho: Zustand com seletores

## 💻 Traduzindo pro código
```tsx
const { data: viagens } = useQuery({ queryKey: ['viagens', status], queryFn: buscarViagens }); // 🗃️
const [params, setParams] = useSearchParams(); const status = params.get('status');            // 🔗
const [aberto, setAberto] = useState(false);                                                   // 🪟
const tema = useContext(TemaContext);                                                          // 🌙
const total = useCarrinho((s) => s.total);                                                     // 🛒 seletor
```

| Tipo de estado | Onde mora | Ferramenta |
| --- | --- | --- |
| Server state | No servidor (a tela tem cópia) | TanStack Query, SWR, Apollo |
| URL state | Na query string | Router (`useSearchParams`) |
| Local | No componente | `useState`, `useReducer` |
| Global que muda pouco | Na árvore | Context |
| Global que muda muito | Fora do React | Zustand, Redux Toolkit |

## 🎤 Pra entrevista
"Separo o estado pela natureza: server state com TanStack Query, SWR ou Apollo; estado de URL na query string, para sobreviver ao F5 e ser compartilhável; estado local com `useState`; global de cliente com Context se muda pouco, e Zustand ou Redux Toolkit com seletores se muda muito. Muito 'estado global' antigo era só cache de servidor."
