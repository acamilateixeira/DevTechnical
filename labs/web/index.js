// Labs que rodam no navegador. O código de cada um fica em labs/web/<id>/ (arquivos reais,
// que o app carrega e deixa editar). Aqui ficam só os textos e as ligações com as perguntas.
//
// kind: 'js' roda o módulo; 'react' renderiza o `export default` como componente.
// preview: mostra a "tela" do lab. lanes: colunas iniciais da linha do tempo.
// instrument: 'eventloop' marca cada console.log com a fase do event loop.

export const labs = [
  {
    id: 'event-loop',
    cat: 'typescript', kind: 'js', instrument: 'eventloop', main: 'main.js',
    story: { file: 'story.pt.md', author: 'Camila Teixeira' },
    lanes: ['Síncrono (call stack)', 'Microtasks', 'Macrotasks (timers)'],
    questions: ['js-event-loop', 'node-event-loop-blocking'],
    title: { pt: 'Event loop: em que ordem o JavaScript roda', en: 'Event loop: the order JavaScript runs in' },
    summary: { pt: 'Veja cada linha cair em síncrono, microtask ou macrotask.', en: 'Watch each line land in sync, microtask, or macrotask.' },
    what: {
      pt: `O JavaScript tem **uma fila de trabalho só para ele** (uma thread). Pense num caixa de banco com três filas:

- **Síncrono**: quem já está no balcão. O código roda de cima para baixo até acabar.
- **Microtasks**: a fila preferencial. Tudo que vem de \`Promise.then\`, \`queueMicrotask\` e o que está **depois de um \`await\`**.
- **Macrotasks**: a fila normal. \`setTimeout\`, \`setInterval\`, eventos de clique, respostas de rede.

A regra do caixa: termina o atendimento atual, depois atende **toda** a fila preferencial, e só então chama **uma** pessoa da fila normal. Depois volta a olhar a preferencial.`,
      en: `JavaScript has **one work line just for itself** (one thread). Picture a bank teller with three lines:

- **Synchronous**: whoever is already at the counter. Code runs top to bottom until it ends.
- **Microtasks**: the priority line. Everything from \`Promise.then\`, \`queueMicrotask\`, and whatever comes **after an \`await\`**.
- **Macrotasks**: the regular line. \`setTimeout\`, \`setInterval\`, click events, network responses.

The teller's rule: finish the current customer, then serve the **whole** priority line, and only then call **one** person from the regular line. Then check the priority line again.`,
    },
    watch: {
      pt: 'Na **linha do tempo**, cada `console.log` aparece na coluna da fase em que rodou. Repare que `B` (setTimeout de 0 ms) vem por último, mesmo sendo "0 ms", e que `F` (depois do `await`) cai em microtask.',
      en: 'In the **timeline**, each `console.log` appears in the column of the phase it ran in. Notice that `B` (a 0 ms setTimeout) comes last, even at "0 ms", and that `F` (after the `await`) lands in microtasks.',
    },
    try: [
      { pt: 'Dentro do `setTimeout`, adicione `Promise.resolve().then(() => console.log("H"))`. Onde o H aparece? (Antes de qualquer outro timer: a fila preferencial é olhada depois de cada macrotask.)', en: 'Inside the `setTimeout`, add `Promise.resolve().then(() => console.log("H"))`. Where does H appear? (Before any other timer: the priority line is checked after every macrotask.)' },
      { pt: 'Apague a linha `await null`. O F passa a sair logo depois do E, na coluna Síncrono. Por quê? (Uma função `async` roda síncrona até o primeiro `await`; sem `await`, nada pausa.)', en: 'Delete the `await null` line. F now prints right after E, in the Synchronous column. Why? (An `async` function runs synchronously until its first `await`; without `await`, nothing pauses.)' },
      { pt: 'Troque `await null` por `await sleep(0)`. O F muda de coluna. Por quê? (`sleep` usa setTimeout.)', en: 'Replace `await null` with `await sleep(0)`. F changes column. Why? (`sleep` uses setTimeout.)' },
      { pt: 'Crie dois `setTimeout`, um de 10 ms e um de 0 ms, e veja a ordem e a coluna "ms" com o tempo real.', en: 'Create two `setTimeout`s, one at 10 ms and one at 0 ms, and check the order and the real time in the "ms" column.' },
      { pt: 'Coloque um loop pesado no síncrono: `const fim = Date.now() + 500; while (Date.now() < fim) {}`. Veja que o B só roda depois de ~500 ms: é isso que "travar o event loop" significa.', en: 'Add a heavy synchronous loop: `const end = Date.now() + 500; while (Date.now() < end) {}`. B only runs after ~500 ms: that is what "blocking the event loop" means.' },
    ],
  },

  {
    id: 'debounce',
    story: { file: 'story.pt.md' },
    cat: 'typescript', kind: 'js', preview: true, setup: 'setup.js', main: 'main.js',
    lanes: ['Usuário', 'Debounce', 'API'],
    questions: ['js-closures-this'],
    title: { pt: 'Closure e debounce: buscar só quando a pessoa para de digitar', en: 'Closures and debounce: search only when the user stops typing' },
    summary: { pt: 'Compare quantas chamadas à API cada campo de busca faz.', en: 'Compare how many API calls each search box makes.' },
    what: {
      pt: `**Closure** é uma função que "leva junto" as variáveis de onde nasceu. Pense numa mochila: a função \`debounce\` cria a variável \`timer\` e devolve uma função nova que carrega essa mochila. Toda vez que você chama a função nova, ela mexe no **mesmo** \`timer\`.

**Debounce** usa isso: cada tecla cancela o timer anterior e agenda outro. A busca só acontece quando passam 300 ms sem nenhuma tecla, como um elevador que só fecha a porta quando ninguém mais entra.`,
      en: `A **closure** is a function that "carries" the variables from where it was born. Think of a backpack: \`debounce\` creates the \`timer\` variable and returns a new function carrying that backpack. Every call to the new function touches the **same** \`timer\`.

**Debounce** uses this: each keystroke cancels the previous timer and schedules another. The search only happens after 300 ms with no keystrokes, like an elevator that only closes its door when nobody else is coming in.`,
    },
    watch: {
      pt: 'Clique em **Simular alguém digitando**. Nos contadores, o campo sem debounce chama a API 11 vezes (uma por letra); o com debounce, 1 vez. Na linha do tempo, veja a coluna Debounce disparando só no fim.',
      en: 'Click **Simulate someone typing**. In the counters, the box without debounce calls the API 11 times (once per letter); the debounced one, once. In the timeline, the Debounce column fires only at the end.',
    },
    try: [
      { pt: 'Mude `ESPERA_MS` para 50. Como as letras chegam a cada 80 ms, o debounce passa a disparar várias vezes. Por quê?', en: 'Set `ESPERA_MS` to 50. Since letters arrive every 80 ms, the debounce now fires several times. Why?' },
      { pt: 'Quebre a closure: mova `let timer;` para DENTRO da função devolvida. Agora cada chamada tem o próprio timer e nada é cancelado.', en: 'Break the closure: move `let timer;` INSIDE the returned function. Now each call has its own timer and nothing is cancelled.' },
      { pt: 'Escreva um `throttle` (roda no máximo 1 vez a cada X ms) e use no lugar do debounce. Compare a contagem.', en: 'Write a `throttle` (runs at most once every X ms) and use it instead of debounce. Compare the count.' },
    ],
  },
  {
    id: 'react-keys',
    story: { file: 'story.pt.md' },
    cat: 'react', kind: 'react', preview: true, main: 'main.tsx',
    lanes: ['Usuário'],
    questions: ['react-reconciliation-keys'],
    title: { pt: 'Keys em listas: por que o índice embaralha seus dados', en: 'Keys in lists: why the index scrambles your data' },
    summary: { pt: 'Escreva num item, adicione outro no topo e veja o texto pular de lugar.', en: 'Type in an item, add another at the top, and watch the text jump.' },
    what: {
      pt: `Quando a lista muda, o React precisa saber **qual item é qual** entre um render e outro para reaproveitar o que já existe na tela (inclusive o texto digitado num campo). Quem diz isso é a \`key\`.

Pense em crachás numa sala: se o crachá é "a pessoa da cadeira 1" (o **índice**), quando alguém senta na cadeira 1 o crachá passa para a pessoa errada. Se o crachá tem o **nome** (o **id**), não importa onde ela senta.`,
      en: `When a list changes, React needs to know **which item is which** across renders to reuse what is already on screen (including text typed in an input). The \`key\` tells it.

Think of name badges in a room: if the badge says "person in chair 1" (the **index**), when someone new sits in chair 1 the badge goes to the wrong person. If the badge has a **name** (the **id**), it does not matter where they sit.`,
    },
    watch: {
      pt: 'Com `key={index}`: escreva "oi" no campo da Ana e clique em **Adicionar no topo**. O "oi" fica na primeira linha, agora de outra pessoa. Marque a caixa (`key={item.id}`) e repita: o texto acompanha a Ana.',
      en: 'With `key={index}`: type "hi" in Ana\'s input and click **Add to top**. The "hi" stays on the first row, now someone else\'s. Tick the box (`key={item.id}`) and repeat: the text follows Ana.',
    },
    try: [
      { pt: 'Teste o botão **Inverter ordem** nos dois modos.', en: 'Try **Reverse order** in both modes.' },
      { pt: 'Apague o `key=` inteiro e rode. O console mostra o aviso do React: "Each child in a list should have a unique key".', en: 'Delete the `key=` entirely and run. The console shows React\'s warning: "Each child in a list should have a unique key".' },
      { pt: 'Use `key={Math.random()}`. Agora todo render recria os campos e o texto some sempre. Por quê?', en: 'Use `key={Math.random()}`. Now every render recreates the inputs and the text always disappears. Why?' },
    ],
  },
  {
    id: 'react-effect-race',
    story: { file: 'story.pt.md' },
    cat: 'react', kind: 'react', preview: true, setup: 'setup.js', main: 'main.tsx',
    lanes: ['Componente', 'API'],
    questions: ['react-useeffect-pitfalls', 'react-hooks-catalog'],
    title: { pt: 'useEffect e race condition: a resposta antiga que sobrescreve a nova', en: 'useEffect and race conditions: the old response that overwrites the new one' },
    summary: { pt: 'Clique rápido e veja a tela mostrar o valor errado. Depois corrija com AbortController.', en: 'Click fast and watch the screen show the wrong value. Then fix it with AbortController.' },
    what: {
      pt: `\`useEffect\` roda depois do render para falar com o mundo de fora, aqui buscando ofertas na API. Quando \`amount\` muda, o effect roda de novo e sai **outra** requisição.

Se você pede três pizzas seguidas em lugares diferentes, a que chega por último não é necessariamente a do último pedido. Sem cancelar as anteriores, quem chega por último "vence" e a tela mostra dados velhos. A **função de cleanup** (o \`return\` do effect) roda antes do próximo effect: é o lugar de cancelar o pedido anterior com \`AbortController\`.`,
      en: `\`useEffect\` runs after render to talk to the outside world, here fetching offers from the API. When \`amount\` changes, the effect runs again and **another** request goes out.

If you order three pizzas in a row from different places, the last to arrive is not necessarily the last order. Without cancelling earlier ones, whoever arrives last "wins" and the screen shows stale data. The **cleanup function** (the effect's \`return\`) runs before the next effect: that is where you cancel the previous request with \`AbortController\`.`,
    },
    watch: {
      pt: 'Clique em **Clicar rápido**. Na linha do tempo, as respostas chegam em ordem diferente dos pedidos e o último `setData` (vermelho) é de um valor antigo. Ligue o AbortController: as requisições antigas aparecem como CANCELADAS e a tela fica certa.',
      en: 'Click **Click fast**. In the timeline, responses arrive in a different order than requests and the last `setData` (red) is for an old value. Turn on AbortController: old requests show as CANCELLED and the screen is right.',
    },
    try: [
      { pt: 'Tire `amount` do array de dependências (`[cancelar]`). O effect não roda mais quando você troca o valor: a tela fica parada.', en: 'Remove `amount` from the dependency array (`[cancelar]`). The effect no longer runs when you change the value: the screen freezes.' },
      { pt: 'Comente a linha `controller.abort()` no cleanup e repita com a caixa marcada. Volta o bug.', en: 'Comment out `controller.abort()` in the cleanup and repeat with the box ticked. The bug is back.' },
      { pt: 'Coloque `trace("Componente", "render")` no corpo do `Offers` para ver cada render na linha do tempo.', en: 'Put `trace("Componente", "render")` in the body of `Offers` to see each render in the timeline.' },
    ],
  },
  {
    id: 'react-rerenders',
    story: { file: 'story.pt.md' },
    cat: 'react', kind: 'react', preview: true, main: 'main.tsx',
    lanes: [],
    questions: ['react-usereducer-context', 'react-state-management', 'react-performance-memo'],
    title: { pt: 'Re-renders: useReducer, Context e memo na prática', en: 'Re-renders: useReducer, Context and memo in practice' },
    summary: { pt: 'Veja quem re-renderiza sem precisar e conserte separando os Contexts.', en: 'See who re-renders needlessly and fix it by splitting Contexts.' },
    what: {
      pt: `Um **re-render** é o React chamar a função do componente de novo. Ele acontece quando o estado do componente muda, quando o pai re-renderiza, ou quando um **Context** que ele lê muda.

Context é como um alto-falante: todo mundo que está ouvindo (\`useContext\`) reage a qualquer anúncio, mesmo que não seja com ele. Se você coloca \`{ state, dispatch }\` num objeto novo a cada render, o "anúncio" muda sempre. \`React.memo\` evita re-render quando as props são iguais, mas não protege contra Context.`,
      en: `A **re-render** is React calling the component function again. It happens when the component's state changes, when its parent re-renders, or when a **Context** it reads changes.

Context is like a loudspeaker: everyone listening (\`useContext\`) reacts to every announcement, even if it is not for them. If you put \`{ state, dispatch }\` in a new object every render, the "announcement" always changes. \`React.memo\` skips re-renders when props are equal, but does not protect against Context.`,
    },
    watch: {
      pt: 'Clique em **+ item** algumas vezes. Com `MODO = "unico"`, o BotaoAdicionar pisca e o contador dele sobe a cada clique, mesmo sem mostrar nada que mudou. O Rodapé nunca pisca (memo e não lê Context).',
      en: 'Click **+ item** a few times. With `MODO = "unico"`, BotaoAdicionar flashes and its counter rises on every click, even though nothing it shows changed. The footer never flashes (memo and no Context).',
    },
    try: [
      { pt: 'Mude para `MODO = "separado"` e rode. Agora o BotaoAdicionar só lê o `dispatch`, que nunca muda: o contador dele para.', en: 'Switch to `MODO = "separado"` and run. Now BotaoAdicionar only reads `dispatch`, which never changes: its counter stops.' },
      { pt: 'Clique em **trocar tema**. A Lista re-renderiza mesmo sem usar o tema. Por quê? (Ela lê o estado inteiro.) Como uma store com seletor resolveria? Veja o lab "Mini Zustand".', en: 'Click **change theme**. The List re-renders even though it does not use the theme. Why? (It reads the whole state.) How would a store with selectors fix it? See the "Mini Zustand" lab.' },
      { pt: 'Tire o `memo(...)` do Rodapé. Ele passa a re-renderizar junto com o App.', en: 'Remove `memo(...)` from the footer. It now re-renders along with App.' },
    ],
  },
  {
    id: 'mini-zustand',
    story: { file: 'story.pt.md' },
    cat: 'react', kind: 'react', preview: true, main: 'main.tsx',
    lanes: ['Store'],
    questions: ['react-redux-zustand-code', 'react-state-management'],
    title: { pt: 'Mini Zustand: uma store global com seletores em 20 linhas', en: 'Mini Zustand: a global store with selectors in 20 lines' },
    summary: { pt: 'Construa por dentro o que Zustand e Redux fazem e veja só quem precisa re-renderizar.', en: 'Build what Zustand and Redux do internally and see only who needs to re-render.' },
    what: {
      pt: `Zustand e o \`useSelector\` do Redux guardam o estado **fora** do React. Cada componente se inscreve dizendo exatamente qual pedaço quer (o **seletor**), por exemplo \`s => s.busca\`. Quando o estado muda, a store avisa todo mundo, mas cada componente só re-renderiza se o **seu** pedaço mudou.

É como assinar só a seção de esportes do jornal: a redação publica tudo, mas você só recebe quando muda o que você assinou. Por baixo, o React usa \`useSyncExternalStore\`.`,
      en: `Zustand and Redux's \`useSelector\` keep state **outside** React. Each component subscribes saying exactly which piece it wants (the **selector**), e.g. \`s => s.busca\`. When state changes, the store notifies everyone, but each component only re-renders if **its** piece changed.

It is like subscribing only to the sports section of a newspaper: the newsroom publishes everything, but you only get notified when your section changes. Underneath, React uses \`useSyncExternalStore\`.`,
    },
    watch: {
      pt: 'Digite na busca: só o contador do CampoBusca sobe. Troque o serviço: só o SeletorServico. Na linha do tempo, cada `set(...)` da store aparece.',
      en: 'Type in the search box: only CampoBusca\'s counter rises. Change the service: only SeletorServico. In the timeline, every store `set(...)` appears.',
    },
    try: [
      { pt: 'No CampoBusca, troque o seletor por `useFiltros((s) => s)` (a store inteira). Agora ele re-renderiza com qualquer mudança.', en: 'In CampoBusca, change the selector to `useFiltros((s) => s)` (the whole store). Now it re-renders on any change.' },
      { pt: 'Use `useFiltros((s) => ({ busca: s.busca }))`. Dá erro de loop infinito: o seletor cria um objeto novo a cada chamada. É por isso que o Zustand tem `useShallow`.', en: 'Use `useFiltros((s) => ({ busca: s.busca }))`. You get an infinite-loop error: the selector creates a new object each call. That is why Zustand has `useShallow`.' },
      { pt: 'Adicione um filtro novo (ex.: `periodo`) com sua ação e um componente para ele.', en: 'Add a new filter (e.g. `periodo`) with its action and a component for it.' },
    ],
  },
  {
    id: 'idempotency',
    story: { file: 'story.pt.md' },
    cat: 'api', kind: 'js', setup: 'setup.js', main: 'main.js',
    lanes: ['Cliente', 'Rede', 'Servidor', 'Banco'],
    questions: ['api-idempotency', 'laravel-queues-payments'],
    title: { pt: 'Idempotência: não cobrar duas vezes quando a rede falha', en: 'Idempotency: never charge twice when the network fails' },
    summary: { pt: 'A rede perde respostas, o cliente tenta de novo e o cartão é cobrado 3 vezes. Conserte.', en: 'The network loses responses, the client retries, and the card is charged 3 times. Fix it.' },
    what: {
      pt: `O cliente manda "cobre R$150". O servidor **cobra**, mas a resposta se perde no caminho. Para o cliente, parece que falhou, então ele tenta de novo (retry). Resultado: duas, três cobranças.

A solução é a **Idempotency-Key**: o cliente gera um código único por intenção ("este pagamento") e manda o **mesmo** código em todas as tentativas. O servidor anota o código junto com a resposta; se o código voltar, devolve a resposta guardada **sem cobrar de novo**. Como o número do pedido no delivery: ligar duas vezes com o mesmo número não gera duas pizzas.`,
      en: `The client sends "charge R$150". The server **charges**, but the response gets lost on the way. To the client it looks like a failure, so it retries. Result: two, three charges.

The fix is the **Idempotency-Key**: the client generates a unique code per intent ("this payment") and sends the **same** code on every attempt. The server records the code with the response; if the code comes back, it returns the saved response **without charging again**. Like an order number for delivery: calling twice with the same number does not get you two pizzas.`,
    },
    watch: {
      pt: 'Rode como está: o contador **Cobranças no cartão** fica em 3 e a coluna Banco mostra três INSERTs. Depois `USAR_CHAVE = true`: o Servidor responde "chave já vista" e as cobranças ficam em 1.',
      en: 'Run as is: the **Cobranças no cartão** counter ends at 3 and the Banco column shows three INSERTs. Then `USAR_CHAVE = true`: the server answers "key already seen" and charges stay at 1.',
    },
    try: [
      { pt: 'Com `USAR_CHAVE = true`, ligue `NOVA_CHAVE_POR_TENTATIVA = true`. As cobranças voltam a duplicar: a chave precisa ser por **intenção**, não por tentativa.', en: 'With `USAR_CHAVE = true`, turn on `NOVA_CHAVE_POR_TENTATIVA = true`. Charges duplicate again: the key must be per **intent**, not per attempt.' },
      { pt: 'No cliente, mude o valor na segunda tentativa (`valor + 1` quando `i > 1`). O servidor recusa com 422: mesma chave com dados diferentes.', en: 'In the client, change the amount on the second attempt (`valor + 1` when `i > 1`). The server refuses with 422: same key, different data.' },
      { pt: 'No setup, mude `PERDER_RESPOSTAS` para 5. O cliente desiste depois de 4 tentativas: veja o backoff (100, 200, 400 ms) na coluna Cliente.', en: 'In the setup, set `PERDER_RESPOSTAS` to 5. The client gives up after 4 attempts: see the backoff (100, 200, 400 ms) in the Cliente column.' },
    ],
  },
  {
    id: 'lost-update',
    story: { file: 'story.pt.md' },
    cat: 'data', kind: 'js', setup: 'setup.js', main: 'main.js',
    lanes: ['Gestor A', 'Gestor B'],
    questions: ['db-isolation-locks', 'payments-card-lifecycle'],
    title: { pt: 'Transações e locks: dois gestores aprovando ao mesmo tempo', en: 'Transactions and locks: two managers approving at the same time' },
    summary: { pt: 'Orçamento de R$1000, duas viagens de R$800 aprovadas juntas. Veja o lost update e as três correções.', en: 'A R$1000 budget, two R$800 trips approved together. See the lost update and three fixes.' },
    what: {
      pt: `Uma **transação** agrupa operações no banco que valem tudo ou nada (BEGIN … COMMIT). Mas transação sozinha não impede que duas pessoas **leiam o mesmo valor** ao mesmo tempo.

Imagine duas pessoas olhando o mesmo saldo de R$1000 em telas diferentes. As duas pensam "cabe R$800", as duas aprovam, e a segunda escrita apaga a primeira: o **lost update**. Correções:

- **SELECT FOR UPDATE** (lock pessimista): quem lê primeiro "tranca" a linha; o outro espera e lê o saldo já atualizado.
- **Update atômico**: a própria condição \`WHERE saldo >= 800\` decide no banco, numa operação só.`,
      en: `A **transaction** groups database operations that are all-or-nothing (BEGIN … COMMIT). But a transaction alone does not stop two people **reading the same value** at once.

Picture two people looking at the same R$1000 balance on different screens. Both think "R$800 fits", both approve, and the second write erases the first: a **lost update**. Fixes:

- **SELECT FOR UPDATE** (pessimistic lock): whoever reads first "locks" the row; the other waits and reads the updated balance.
- **Atomic update**: the condition \`WHERE saldo >= 800\` itself decides inside the database, in one operation.`,
    },
    watch: {
      pt: 'Com `sem-lock`, as colunas Gestor A e Gestor B leem 1000 quase ao mesmo tempo e as duas fazem UPDATE: 2 viagens aprovadas com só R$1000. Com `for-update`, o Gestor B mostra "esperou Xms pelo lock" e recusa.',
      en: 'With `sem-lock`, the Gestor A and Gestor B columns both read 1000 at nearly the same time and both UPDATE: 2 trips approved with only R$1000. With `for-update`, Gestor B shows "waited Xms for the lock" and refuses.',
    },
    try: [
      { pt: 'Teste `MODO = "atomico"`: uma operação só no banco, sem SELECT antes.', en: 'Try `MODO = "atomico"`: a single database operation, no SELECT first.' },
      { pt: 'Com `for-update`, coloque `await sleep(500)` depois do `selectForUpdate` (como se chamasse uma API externa dentro da transação). Veja o Gestor B esperando muito mais: por isso não se faz chamada externa com transação aberta.', en: 'With `for-update`, add `await sleep(500)` after `selectForUpdate` (as if calling an external API inside the transaction). Gestor B waits much longer: that is why you never call external services with a transaction open.' },
      { pt: 'Mude os valores para 400 e 400. Agora as duas cabem: os três modos aprovam as duas, e o saldo final deve ser 200.', en: 'Change the amounts to 400 and 400. Now both fit: all three modes approve both, and the final balance must be 200.' },
    ],
  },
  {
    id: 'cache-stampede',
    story: { file: 'story.pt.md' },
    cat: 'data', kind: 'js', setup: 'setup.js', main: 'main.js',
    lanes: ['Usuário 1', 'Usuário 2', 'Usuário 3', 'Cache', 'Banco'],
    questions: ['redis-cache-patterns'],
    title: { pt: 'Cache-aside e cache stampede: 50 usuários, quantas queries?', en: 'Cache-aside and cache stampede: 50 users, how many queries?' },
    summary: { pt: 'O cache expira e 50 requisições batem no banco juntas. Resolva com single-flight.', en: 'The cache expires and 50 requests hit the database together. Fix it with single-flight.' },
    what: {
      pt: `**Cache-aside**: olha no cache (Redis); se não tiver, busca no banco e guarda no cache com prazo de validade (**TTL**). As próximas leituras são rápidas.

O problema aparece quando uma chave muito acessada **expira**: todo mundo que chega naquele instante encontra o cache vazio e vai ao banco ao mesmo tempo. Isso é o **cache stampede** (estouro da boiada). A correção (**single-flight**) é simples: o primeiro que não achou vai buscar; os outros **esperam a mesma busca** em vez de abrir outra.`,
      en: `**Cache-aside**: check the cache (Redis); if missing, load from the database and store it in the cache with an expiry (**TTL**). Later reads are fast.

The problem shows up when a very popular key **expires**: everyone arriving at that moment finds the cache empty and hits the database at once. That is a **cache stampede**. The fix (**single-flight**) is simple: the first one that missed goes to fetch; the others **wait for that same fetch** instead of starting another.`,
    },
    watch: {
      pt: 'Rode como está: **Queries no banco = 50** (a coluna Banco enche de vermelho). Com `SINGLE_FLIGHT = true`: 1 query, e o contador "Esperaram a busca de outro" mostra 49. A segunda leva de 50 usuários vem toda do cache.',
      en: 'Run as is: **Queries no banco = 50** (the Banco column fills with red). With `SINGLE_FLIGHT = true`: 1 query, and "Esperaram a busca de outro" shows 49. The second wave of 50 users is served entirely from cache.',
    },
    try: [
      { pt: 'Mude `TTL_MS` para 100 e coloque `await sleep(300)` entre as duas levas no `run`. O cache expira de novo: veja a segunda leva ir ao banco.', en: 'Set `TTL_MS` to 100 and add `await sleep(300)` between the two waves in `run`. The cache expires again: watch the second wave go to the database.' },
      { pt: 'Por que o `rand(0, 1000)` no TTL (jitter) ajuda quando há milhares de chaves criadas juntas?', en: 'Why does `rand(0, 1000)` in the TTL (jitter) help when thousands of keys are created together?' },
      { pt: 'Simule uma escrita: depois da primeira leva, `await cache.del("produto:42")` e veja a próxima leitura buscar de novo (invalidação).', en: 'Simulate a write: after the first wave, `await cache.del("produto:42")` and watch the next read fetch again (invalidation).' },
    ],
  },
  {
    id: 'outbox',
    story: { file: 'story.pt.md' },
    cat: 'messaging', kind: 'js', setup: 'setup.js', main: 'main.js',
    lanes: ['API', 'Relay', 'RabbitMQ', 'Consumidor'],
    questions: ['mq-outbox-pattern', 'mq-rabbitmq-concepts', 'laravel-queues-payments'],
    title: { pt: 'Outbox: salvar no banco e avisar a fila sem perder nem duplicar', en: 'Outbox: save to the database and notify the queue without losing or duplicating' },
    summary: { pt: 'Derrube o processo em pontos diferentes e veja eventos sumirem ou chegarem duas vezes.', en: 'Crash the process at different points and watch events vanish or arrive twice.' },
    what: {
      pt: `Ao aprovar uma viagem, o sistema precisa (1) salvar no banco e (2) avisar outros serviços pela fila (RabbitMQ), por exemplo para mandar um e-mail. Fazer as duas coisas separadas é o **dual write**: se o processo cair entre uma e outra, o banco diz "aprovada" e ninguém fica sabendo.

O **Outbox** resolve guardando o aviso numa tabela **na mesma transação** do dado: ou salva os dois, ou nenhum. Um processo separado (o **relay**) lê essa tabela e publica na fila. Se o relay cair depois de publicar e antes de anotar, ele publica de novo: por isso o **consumidor** precisa ignorar repetidas (**idempotente**).`,
      en: `When approving a trip, the system must (1) save to the database and (2) notify other services through the queue (RabbitMQ), for example to send an email. Doing them separately is **dual write**: if the process crashes in between, the database says "approved" and nobody hears about it.

The **Outbox** fixes this by storing the notification in a table **in the same transaction** as the data: either both are saved or neither. A separate process (the **relay**) reads that table and publishes to the queue. If the relay crashes after publishing and before marking it, it publishes again: that is why the **consumer** must ignore repeats (be **idempotent**).`,
    },
    watch: {
      pt: 'Rode como está (`dual-write` + queda depois do commit): o status vira APROVADA, mas **E-mails enviados = 0**: o evento se perdeu. Troque para `outbox`: o Relay publica alguns ms depois e o e-mail sai.',
      en: 'Run as is (`dual-write` + crash after commit): status becomes APROVADA, but **E-mails enviados = 0**: the event was lost. Switch to `outbox`: the Relay publishes a few ms later and the email goes out.',
    },
    try: [
      { pt: '`MODO = "outbox"` e `QUEDA = "depois-de-publicar"`: o relay cai depois de publicar, reinicia e publica de novo. São enviados 2 e-mails.', en: '`MODO = "outbox"` and `QUEDA = "depois-de-publicar"`: the relay crashes after publishing, restarts, and publishes again. 2 emails go out.' },
      { pt: 'Agora `DEDUPE = true`: o consumidor reconhece o mesmo ID e ignora. 1 e-mail. Isso é "at-least-once + idempotência".', en: 'Now `DEDUPE = true`: the consumer recognizes the same ID and ignores it. 1 email. That is "at-least-once + idempotency".' },
      { pt: 'Com `dual-write`, inverta a ordem: publique ANTES da transação e faça a transação falhar (`throw` dentro dela). O e-mail sai para uma aprovação que não existe.', en: 'With `dual-write`, swap the order: publish BEFORE the transaction and make it fail (`throw` inside). The email goes out for an approval that does not exist.' },
    ],
  },
  {
    id: 'resilience',
    story: { file: 'story.pt.md' },
    cat: 'architecture', kind: 'js', setup: 'setup.js', main: 'main.js',
    lanes: ['API', 'Alpha', 'Beta', 'Gamma', 'Breaker'],
    questions: ['arch-resilience-partial'],
    title: { pt: 'Resiliência: timeout, resposta parcial e circuit breaker', en: 'Resilience: timeouts, partial responses and circuit breakers' },
    summary: { pt: 'Um provedor lento derruba o tempo de todas as respostas. Proteja a API.', en: 'One slow provider drags down every response time. Protect the API.' },
    what: {
      pt: `A API consulta três provedores **em paralelo** (\`Promise.allSettled\`). O Beta é lento e falha metade das vezes.

- **Timeout por provedor**: não esperar o Beta mais que 400 ms. Responder com o que chegou é a **resposta parcial** (degradação graciosa).
- **Circuit breaker** (disjuntor): depois de 2 falhas seguidas, para de chamar o Beta por um tempo e falha na hora, sem gastar os 400 ms. Depois tenta de novo.

Como o disjuntor da sua casa: quando um aparelho dá curto, ele desarma só aquele circuito para não queimar a casa toda.`,
      en: `The API calls three providers **in parallel** (\`Promise.allSettled\`). Beta is slow and fails half the time.

- **Per-provider timeout**: never wait for Beta longer than 400 ms. Answering with what arrived is the **partial response** (graceful degradation).
- **Circuit breaker**: after 2 failures in a row, stop calling Beta for a while and fail immediately, without spending the 400 ms. Then try again.

Like the breaker panel at home: when one appliance shorts, it trips only that circuit so the whole house does not burn.`,
    },
    watch: {
      pt: 'Na coluna API, cada requisição termina em ~400 ms com "falharam: Beta". Depois de 2 falhas, a coluna Breaker mostra "ABRE" e as próximas respostas ficam rápidas (~200 ms) porque o Beta nem é chamado.',
      en: 'In the API column, each request ends in ~400 ms with "failed: Beta". After 2 failures, the Breaker column shows "OPENS" and the following responses get fast (~200 ms) because Beta is not even called.',
    },
    try: [
      { pt: '`TIMEOUT_MS = 5000` e `USAR_BREAKER = false`: veja o **Tempo médio** subir para segundos. Todo usuário espera o mais lento.', en: '`TIMEOUT_MS = 5000` and `USAR_BREAKER = false`: watch **Tempo médio** climb to seconds. Every user waits for the slowest.' },
      { pt: 'No setup, deixe o Beta rápido e sem falhas (`latencia: [80, 150], falha: 0`). O breaker nunca abre.', en: 'In the setup, make Beta fast and reliable (`latencia: [80, 150], falha: 0`). The breaker never opens.' },
      { pt: 'Coloque `falha: 1` nos três provedores: a API responde 503 (nenhuma oferta).', en: 'Set `falha: 1` on all three providers: the API answers 503 (no offers).' },
    ],
  },
  {
    id: 'dataloader',
    story: { file: 'story.pt.md' },
    cat: 'api', kind: 'js', setup: 'setup.js', main: 'main.js',
    lanes: ['Banco'],
    questions: ['graphql-n-plus-one', 'api-rest-vs-graphql'],
    title: { pt: 'GraphQL N+1 e DataLoader: de 51 queries para 2', en: 'GraphQL N+1 and DataLoader: from 51 queries to 2' },
    summary: { pt: 'Veja o resolver rodar uma vez por item e junte tudo num lote.', en: 'Watch the resolver run once per item and batch it all.' },
    what: {
      pt: `Em GraphQL cada campo tem uma função que busca o valor, o **resolver**. Ao listar 50 viagens pedindo o \`requester\` de cada uma, o resolver de \`requester\` roda **50 vezes**, cada uma com sua query: 1 (lista) + 50 = **N+1**.

O **DataLoader** é como um garçom que, em vez de ir à cozinha a cada pedido, anota os pedidos da mesa toda e vai uma vez só. Ele junta todos os \`load(id)\` feitos no mesmo instante (usa uma **microtask**, igual ao lab do event loop) e faz uma query \`WHERE id IN (...)\`.`,
      en: `In GraphQL each field has a function that fetches its value, the **resolver**. Listing 50 trips with each one's \`requester\` runs the \`requester\` resolver **50 times**, each with its own query: 1 (list) + 50 = **N+1**.

**DataLoader** is like a waiter who, instead of going to the kitchen for every order, writes down the whole table's orders and goes once. It collects every \`load(id)\` made in the same instant (using a **microtask**, like in the event loop lab) and runs one \`WHERE id IN (...)\` query.`,
    },
    watch: {
      pt: 'Sem DataLoader: **Queries no banco = 51** e a coluna Banco mostra uma query por usuário. Com `USAR_DATALOADER = true`: **2 queries** (a lista e um `IN` com os 10 usuários distintos).',
      en: 'Without DataLoader: **Queries no banco = 51** and the Banco column shows one query per user. With `USAR_DATALOADER = true`: **2 queries** (the list and one `IN` with the 10 distinct users).',
    },
    try: [
      { pt: 'No `criarDataLoader`, troque `queueMicrotask` por `setTimeout(..., 0)`. Continua funcionando? E com `setTimeout(..., 50)`, o que muda no tempo?', en: 'In `criarDataLoader`, swap `queueMicrotask` for `setTimeout(..., 0)`. Does it still work? And with `setTimeout(..., 50)`, what changes in timing?' },
      { pt: 'Quebre a ordem: troque `porId.get(x.id)` por `linhas[i]` (com o índice do forEach). Os nomes vêm trocados: a resposta precisa vir na ordem dos pedidos.', en: 'Break the order: replace `porId.get(x.id)` with `linhas[i]` (using the forEach index). Names come back swapped: results must follow the request order.' },
      { pt: 'Por que o loader é criado por requisição (`criarContexto`) e não uma vez só para o servidor inteiro?', en: 'Why is the loader created per request (`criarContexto`) and not once for the whole server?' },
    ],
  },
  {
    id: 'tdd',
    story: { file: 'story.pt.md' },
    cat: 'testing', kind: 'js', main: 'main.js',
    lanes: [],
    questions: ['test-tdd-code', 'test-pyramid-strategy', 'phpunit-tdd-service'],
    title: { pt: 'TDD: vermelho, verde, refatorar', en: 'TDD: red, green, refactor' },
    summary: { pt: 'Uma regra de negócio com testes que rodam aqui. Quebre a regra e veja o teste ficar vermelho.', en: 'A business rule with tests running right here. Break the rule and watch a test turn red.' },
    what: {
      pt: `**TDD** (desenvolvimento guiado por testes) é escrever o teste **antes** do código:

1. **Vermelho**: escreva um teste para o próximo comportamento e veja falhar (prova que o teste testa algo).
2. **Verde**: escreva o mínimo de código para passar.
3. **Refatorar**: melhore nomes e estrutura com os testes protegendo.

Cada teste é uma frase do tipo "dado isto, espero aquilo". Aqui a regra é: pode aprovar a viagem se cabe no orçamento e no limite do aprovador. É uma **função pura**, por isso o teste não precisa de banco nem de mock.`,
      en: `**TDD** (test-driven development) means writing the test **before** the code:

1. **Red**: write a test for the next behavior and watch it fail (proves the test tests something).
2. **Green**: write the minimum code to pass.
3. **Refactor**: improve names and structure with the tests protecting you.

Each test is a sentence like "given this, I expect that". Here the rule is: a trip can be approved if it fits the budget and the approver's limit. It is a **pure function**, so the test needs no database or mock.`,
    },
    watch: {
      pt: 'O painel **Testes** mostra cada teste com ✓ verde ou ✗ vermelho e o motivo da falha.',
      en: 'The **Tests** panel shows each test with a green ✓ or a red ✗ and the reason it failed.',
    },
    try: [
      { pt: 'Troque `>` por `>=` na linha do limite do aprovador. Qual teste fica vermelho? Ele documenta uma regra combinada com o PO.', en: 'Change `>` to `>=` on the approver-limit line. Which test turns red? It documents a rule agreed with the PO.' },
      { pt: 'Ciclo completo: escreva um teste novo "recusa viagem de mais de 30 dias" (vai falhar), adicione o campo `dias` e a regra, e veja ficar verde.', en: 'Full cycle: write a new test "refuses trips longer than 30 days" (it will fail), add a `dias` field and the rule, and watch it go green.' },
      { pt: 'Apague `!Number.isInteger(custoCentavos) ||`. Qual teste pega o problema do dinheiro com casas decimais?', en: 'Delete `!Number.isInteger(custoCentavos) ||`. Which test catches the decimal-money problem?' },
    ],
  },
  {
    id: 'xss',
    story: { file: 'story.pt.md' },
    cat: 'security', kind: 'react', preview: true, main: 'main.tsx',
    lanes: ['Usuário', 'Atacante'],
    questions: ['sec-owasp-web', 'php-security-pdo-password'],
    title: { pt: 'XSS no React: quando o texto do usuário vira código', en: 'XSS in React: when user text becomes code' },
    summary: { pt: 'Publique um comentário malicioso e veja onde o script do atacante roda.', en: 'Post a malicious comment and see where the attacker\'s script runs.' },
    what: {
      pt: `**XSS** é quando um atacante consegue rodar JavaScript na **sua** página, por exemplo escondendo um script dentro de um comentário. Rodando na sua página, o script age como o usuário logado.

O React protege por padrão: o que você coloca entre \`{ }\` é tratado como **texto**, nunca como HTML. A proteção some quando você usa \`dangerouslySetInnerHTML\` (o nome é um aviso!). Se precisar mostrar HTML vindo do usuário, **sanitize** antes (em produção: DOMPurify), removendo scripts e atributos como \`onerror\`.`,
      en: `**XSS** is when an attacker manages to run JavaScript on **your** page, for example by hiding a script inside a comment. Running on your page, the script acts as the logged-in user.

React protects you by default: whatever you put inside \`{ }\` is treated as **text**, never as HTML. The protection disappears when you use \`dangerouslySetInnerHTML\` (the name is a warning!). If you must render user HTML, **sanitize** it first (in production: DOMPurify), removing scripts and attributes like \`onerror\`.`,
    },
    watch: {
      pt: 'Clique em **Colar comentário malicioso** e depois em **Publicar**. No quadro 1 aparece o texto cru (seguro). No 2 aparece "SCRIPT DO ATACANTE RODOU" e a coluna Atacante registra o ataque. No 3 a imagem fica, mas o script foi removido.',
      en: 'Click **Paste malicious comment**, then **Publish**. Box 1 shows the raw text (safe). Box 2 shows "ATTACKER SCRIPT RAN" and the Atacante column logs the attack. In box 3 the image stays but the script was removed.',
    },
    try: [
      { pt: 'Publique o comentário inicial (com `<b>`). No quadro 1 as tags aparecem como texto; no 3, o negrito funciona e continua seguro.', en: 'Publish the initial comment (with `<b>`). In box 1 the tags show as text; in box 3 the bold works and stays safe.' },
      { pt: 'Escreva `<a href="javascript:alert(1)">clique</a>`. A sanitização remove o `href`? Leia a função `sanitizar`.', en: 'Type `<a href="javascript:alert(1)">click</a>`. Does sanitization remove the `href`? Read the `sanitizar` function.' },
      { pt: 'Pense: por que guardar o token de login num cookie `httpOnly` limita o estrago de um XSS?', en: 'Think: why does keeping the login token in an `httpOnly` cookie limit the damage of an XSS?' },
    ],
  },
];
