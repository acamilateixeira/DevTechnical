# 🪑 A dança das cadeiras do React

> Uma sala de aula com cadeiras numeradas. Cada aluno tem um caderninho com anotações em cima da mesa.

## 🎭 Elenco
- 👧 **Ana** · `{ id: 1, nome: 'Ana' }` · um item da lista
- 👦 **Davi** · item novo no topo · o aluno que chega atrasado e senta na primeira cadeira
- 📓 **Caderninho** · o `<input>` de cada item · o estado que o React guarda ligado ao crachá
- 🧑‍🏫 **React** · o reconciliador · o professor: decide de quem é cada caderninho olhando o crachá
- 🪪 **Crachá** · a `key` · a identidade de cada item entre um render e outro
- 🎲 **`Math.random()`** · `key={Math.random()}` · o palhaço que troca todos os crachás a cada render

## 🎬 Cena 1 · Crachá com número da cadeira (`key={index}`)
**React**: "Bom dia! Pra eu saber quem é quem, cada um usa um crachá. Hoje o crachá é o número da cadeira: 0, 1, 2."
**Ana** _(cadeira 0)_: "Escrevi 'oi' no meu caderninho!"
**Davi** _(entrando esbaforido)_: "Desculpa o atraso, professor! Vou sentar na cadeira 0." _(todo mundo escorrega uma cadeira)_
**React**: "Crachá 'cadeira 0' continua existindo, então o caderninho com 'oi' continua na cadeira 0… que agora é do Davi."
**Davi**: "Uai, quem escreveu 'oi' no MEU caderno?!"
**Ana**: "ERA MEU, SEU LADRÃO DE CADERNO! 😭"
> 🚨 O estado ficou com a cadeira, não com a pessoa.
= 📋 Lista na tela: cadeira 0: Davi · 1: Ana · 2: Bruno · 3: Carla
= 🪪 `key` usada: o índice (0, 1, 2, 3)
= 📓 Texto "oi": ficou na key 0, que agora é o Davi ❌

## 🎬 Cena 2 · Crachá com o nome (`key={item.id}`)
**React**: "Mudança de regra: agora o crachá é o nome de vocês."
**Davi**: "Sentei na cadeira 0 de novo, tá?"
**React**: "Crachá 'Davi' é novo? Caderninho novinho pra você. Crachá 'Ana' mudou de cadeira? Levo o caderninho dela junto." ✅
**Ana** _(abraçando o caderno)_: "Meu 'oi' tá aqui. Paz na Terra." 🕊️
= 📋 Lista na tela: Davi, Ana, Bruno, Carla
= 🪪 `key` usada: o id (4, 1, 2, 3)
= 📓 Texto "oi": continua com a Ana (key 1) ✅
= 🆕 Criado do zero: só o Davi (key 4)

## 🎬 Cena 3 · O palhaço
**`Math.random()`**: "E se eu der um crachá novo pra todo mundo a cada render? Kkkkk"
**React**: "Aí eu acho que a sala inteira é gente nova e jogo TODOS os caderninhos no lixo, toda vez." 🗑️
**Ana**: "Professor, expulsa ele."
= 🪪 `key` usada: `Math.random()`: nova a cada render
= 🗑️ Itens recriados por render: todos (4 de 4)
= 📓 Texto digitado: perdido em todo render ❌

## 💻 Traduzindo pro código
```tsx
// ❌ crachá = cadeira: o estado fica na posição
{itens.map((item, index) => (
  <li key={index}>
    <strong>{item.nome}</strong> <input />  {/* 📓 o caderninho */}
  </li>
))}

// ✅ crachá = nome: o estado acompanha o item
{itens.map((item) => (
  <li key={item.id}>
    <strong>{item.nome}</strong> <input />
  </li>
))}
```

| Key | Inserir no topo / reordenar | Quando dá pra usar |
| --- | --- | --- |
| `index` | Estado vai pro item errado | Lista fixa que nunca muda de ordem |
| `item.id` | Estado acompanha o item | Sempre que houver um ID estável |
| `Math.random()` | Recria tudo, perde todo estado | Nunca |

## 🎤 Pra entrevista
"A `key` é a identidade de cada item entre renders: o React usa ela para decidir qual componente (e qual estado) corresponde a qual item. Precisa ser estável e única, como o ID do registro. Com o índice, ao inserir, remover ou reordenar, o estado vai parar no item errado; com chave aleatória, tudo é recriado a cada render."
