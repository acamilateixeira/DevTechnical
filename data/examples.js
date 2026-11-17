// Exemplos genéricos e curtos: uma situação do dia a dia ou um caso concreto qualquer
// que ajuda a lembrar o conceito. Servem para qualquer pessoa; não citam empresas nem currículos.
export const examples = {
  'js-event-loop': {
    pt: 'Num restaurante, o garçom (a thread) anota um pedido e já vai para a próxima mesa. Os recados urgentes do gerente (microtasks, como `Promise.then`) são lidos antes do próximo pedido da fila (macrotasks, como `setTimeout`).',
    en: 'In a restaurant, the waiter (the thread) takes an order and moves on to the next table. The manager\'s urgent notes (microtasks, like `Promise.then`) are read before the next order in line (macrotasks, like `setTimeout`).',
  },
  'ts-unknown-any-never': {
    pt: '`any` é uma caixa sem etiqueta que você abre sem olhar. `unknown` é a mesma caixa, mas você precisa conferir o que tem dentro antes de usar. `never` é uma caixa que nunca chega, como o retorno de uma função que sempre lança erro.',
    en: '`any` is an unlabeled box you open without looking. `unknown` is the same box, but you must check what is inside before using it. `never` is a box that never arrives, like the return of a function that always throws.',
  },
  'ts-generics-utility': {
    pt: '`groupBy(alunos, "turma")` devolve `{ A: [...], B: [...] }`. O genérico garante que "turma" é mesmo um campo de aluno; se você digitar "turmaa", o editor já reclama.',
    en: '`groupBy(students, "class")` returns `{ A: [...], B: [...] }`. The generic makes sure "class" really is a student field; type "clas" and the editor complains right away.',
  },
  'js-closures-this': {
    pt: 'Debounce é o elevador que espera alguns segundos sem ninguém apertar o botão para fechar a porta. A closure é a memória do elevador de quando foi o último clique.',
    en: 'Debounce is the elevator that waits a few seconds with no one pressing the button before closing the door. The closure is the elevator\'s memory of when the last press happened.',
  },
  'ts-shared-contract-zod': {
    pt: 'Front e back usam o mesmo "molde" do formulário de cadastro: se o back passa a exigir telefone, o front deixa de compilar até mostrar o campo.',
    en: 'Front end and back end share the same "mold" for the sign-up form: if the back end starts requiring a phone number, the front end stops compiling until it shows the field.',
  },
  'react-reconciliation-keys': {
    pt: 'Numa lista de tarefas, você apaga a primeira. Com o índice como `key`, o React acha que a tarefa 2 virou a 1 e o texto digitado no campo vai parar na tarefa errada. Com o `id`, cada item continua sendo ele mesmo.',
    en: 'In a to-do list, you delete the first item. With the index as `key`, React thinks task 2 became task 1, and the text typed in the input ends up on the wrong task. With the `id`, each item stays itself.',
  },
  'react-useeffect-pitfalls': {
    pt: 'Você digita "ca" e depois "casa" na busca. A resposta de "ca" chega por último e sobrescreve a de "casa". Cancelar a busca antiga (AbortController) resolve.',
    en: 'You type "ca" and then "cat" in the search box. The response for "ca" arrives last and overwrites the one for "cat". Cancelling the old request (AbortController) fixes it.',
  },
  'react-performance-memo': {
    pt: 'Num livro de 10 mil páginas você não lê tudo para achar um capítulo: abre só as páginas visíveis. Virtualizar a tabela é isso; `useMemo` é anotar o resultado de uma conta cara para não refazer.',
    en: 'In a 10,000-page book you do not read everything to find a chapter: you open only the visible pages. Virtualizing the table is that; `useMemo` is writing down the result of an expensive calculation so you do not redo it.',
  },
  'react-state-management': {
    pt: 'Numa loja online: o texto digitado na busca é estado local; o usuário logado vai no Context; a lista de produtos vinda da API fica com o TanStack Query; o carrinho, que muda em várias telas, pode ir num store (Zustand/Redux).',
    en: 'In an online store: the text typed in the search box is local state; the logged-in user goes in Context; the product list from the API lives in TanStack Query; the cart, changed from many screens, can go in a store (Zustand/Redux).',
  },
  'react-custom-hook': {
    pt: '`const [tema, setTema] = useLocalStorage("tema", "claro")`: o usuário escolhe modo escuro, fecha a aba e, ao voltar, o site lembra.',
    en: '`const [theme, setTheme] = useLocalStorage("theme", "light")`: the user picks dark mode, closes the tab and, when they come back, the site remembers.',
  },
  'next-rendering-strategies': {
    pt: 'Num blog: o post antigo é SSG (impresso uma vez); a home com "mais lidos" é ISR (reimpressa a cada hora); o painel do autor logado é SSR ou CSR (feito na hora para cada pessoa).',
    en: 'On a blog: an old post is SSG (printed once); the home page with "most read" is ISR (reprinted every hour); the logged-in author\'s dashboard is SSR or CSR (made on demand for each person).',
  },
  'react-accessibility': {
    pt: 'Teste sem mouse: abra o modal só com Tab e Enter, feche com Esc e veja se o foco volta para o botão que o abriu. Se você se perder, um usuário de leitor de tela também se perde.',
    en: 'Test without a mouse: open the modal with Tab and Enter only, close it with Esc and check that focus returns to the button that opened it. If you get lost, a screen reader user gets lost too.',
  },
  'apollo-client-cache': {
    pt: 'O cache guarda cada pedido uma vez só, pelo id. Se a mutation "aprovar pedido 42" devolve o pedido 42 com status novo, todas as telas que mostram esse pedido se atualizam sozinhas.',
    en: 'The cache stores each order only once, by id. If the "approve order 42" mutation returns order 42 with its new status, every screen showing that order updates by itself.',
  },
  'next-server-actions-security': {
    pt: 'Uma Server Action é como uma porta dos fundos da API: o botão pode estar escondido na tela, mas qualquer um pode chamar a ação direto. Por isso ela confere de novo quem está logado e se pode aprovar.',
    en: 'A Server Action is like a back door into the API: the button may be hidden on screen, but anyone can call the action directly. That is why it checks again who is logged in and whether they may approve.',
  },
  'mui-theming-performance': {
    pt: 'O tema é a paleta da casa: troca a cor primária num lugar e todos os botões mudam. Importar só os componentes usados evita carregar a loja inteira para comprar um parafuso.',
    en: 'The theme is the house palette: change the primary color in one place and every button changes. Importing only the components you use avoids carrying the whole store home to buy one screw.',
  },
  'rtl-msw-component-test': {
    pt: 'O teste age como o usuário: "vejo a lista de ofertas?" e "se a API cair, vejo a mensagem de erro?". O MSW é um ator que finge ser a API, com sucesso num teste e falha no outro.',
    en: 'The test acts like the user: "do I see the offer list?" and "if the API fails, do I see the error message?". MSW is an actor pretending to be the API, succeeding in one test and failing in another.',
  },
  'react-hooks-catalog': {
    pt: 'Num formulário de cadastro: `useState` para cada campo, `useRef` para focar o primeiro campo, `useEffect` para buscar as cidades do estado escolhido, `useMemo` para filtrar uma lista grande.',
    en: 'In a sign-up form: `useState` for each field, `useRef` to focus the first field, `useEffect` to fetch the cities of the chosen state, `useMemo` to filter a large list.',
  },
  'react-usereducer-context': {
    pt: 'O carrinho tem duas tomadas separadas: uma só para ler os itens, outra só para os botões que mudam. O botão "adicionar" usa só a segunda e não acende de novo quando a lista muda.',
    en: 'The cart has two separate outlets: one just for reading the items, another just for the buttons that change them. The "add" button uses only the second one and does not re-render when the list changes.',
  },
  'react-redux-zustand-code': {
    pt: 'Filtro de preço e categoria numa loja: no Redux você descreve a ação ("mudou a categoria") e o reducer muda o estado; no Zustand você chama `setCategoria("livros")` direto. Os dois fazem o componente ouvir só o pedaço que usa.',
    en: 'Price and category filters in a store: in Redux you describe the action ("category changed") and the reducer updates state; in Zustand you call `setCategory("books")` directly. Both let the component listen only to the slice it uses.',
  },
  'react-derived-state-antipatterns': {
    pt: 'Guardar "nome completo" num estado separado de "nome" e "sobrenome" é como anotar a soma numa folha e as parcelas em outra: um dia você muda uma parcela e esquece da soma. Calcule na hora.',
    en: 'Keeping "full name" in its own state apart from "first" and "last" name is like writing the total on one sheet and the parts on another: one day you change a part and forget the total. Compute it on the fly.',
  },
  'react-devtools-debugging': {
    pt: 'O Profiler é a câmera lenta: você grava digitando uma letra e vê que a tabela inteira renderizou de novo. Aí sabe onde mexer.',
    en: 'The Profiler is slow motion: you record typing one letter and see the whole table re-rendered. Now you know where to act.',
  },
  'node-event-loop-blocking': {
    pt: 'Node é um único caixa de banco muito rápido que só anota e repassa os pedidos. Se ele parar para contar moedas na mão (um cálculo pesado), a fila inteira espera.',
    en: 'Node is a single, very fast bank teller who only writes down and forwards requests. If they stop to count coins by hand (a heavy calculation), the whole line waits.',
  },
  'node-streams-backpressure': {
    pt: 'Encher um balde com mangueira: se o balde (o cliente) enche devagar, você fecha um pouco a torneira (backpressure) em vez de deixar a água transbordar na memória.',
    en: 'Filling a bucket with a hose: if the bucket (the client) fills slowly, you close the tap a bit (backpressure) instead of letting water overflow into memory.',
  },
  'node-error-handling-shutdown': {
    pt: 'Fechar uma loja direito: tranca a porta para clientes novos, atende quem já está dentro e só depois apaga a luz. Graceful shutdown é isso quando o container recebe SIGTERM.',
    en: 'Closing a shop properly: lock the door to new customers, serve those already inside, and only then turn off the lights. That is graceful shutdown when the container gets SIGTERM.',
  },
  'nest-di-modules': {
    pt: 'Injeção de dependência é pedir um café sem ter que construir a máquina: o serviço de pedidos diz "preciso de um repositório" e o Nest entrega um pronto (ou um falso, no teste).',
    en: 'Dependency injection is ordering a coffee without building the machine: the order service says "I need a repository" and Nest hands one over (or a fake one, in tests).',
  },
  'nest-guard-decorator-test': {
    pt: 'O guard é o segurança da porta: `@Roles("admin")` na rota de apagar usuário é a lista de convidados; quem não está nela recebe 403.',
    en: 'The guard is the bouncer: `@Roles("admin")` on the delete-user route is the guest list; anyone not on it gets a 403.',
  },
  'nest-microservices-rabbitmq': {
    pt: '`@MessagePattern` é ligar e esperar resposta ("qual o estoque do item 7?"). `@EventPattern` é deixar um recado ("pedido criado") sem esperar ninguém responder.',
    en: '`@MessagePattern` is calling and waiting for an answer ("what is the stock of item 7?"). `@EventPattern` is leaving a message ("order created") without waiting for a reply.',
  },
  'api-rest-vs-graphql': {
    pt: 'REST é um cardápio de pratos prontos; GraphQL é o buffet em que você monta o prato. Um app de celular que precisa de só 3 campos se dá bem com GraphQL; uma API pública simples, com REST e cache HTTP.',
    en: 'REST is a menu of ready dishes; GraphQL is the buffet where you build your plate. A mobile app needing only 3 fields does well with GraphQL; a simple public API does well with REST and HTTP caching.',
  },
  'graphql-n-plus-one': {
    pt: 'Ir ao mercado uma vez para cada ingrediente da receita (N+1) em vez de levar a lista inteira numa ida só. O DataLoader junta os pedidos e faz uma consulta só.',
    en: 'Going to the market once per recipe ingredient (N+1) instead of taking the whole list in one trip. DataLoader batches the requests into a single query.',
  },
  'api-idempotency': {
    pt: 'Apertar o botão do elevador cinco vezes não chama cinco elevadores. A chave de idempotência faz o mesmo com o pagamento: a segunda tentativa recebe a resposta da primeira.',
    en: 'Pressing the elevator button five times does not call five elevators. The idempotency key does the same for a payment: the second attempt gets the first attempt\'s answer.',
  },
  'api-websockets-scale': {
    pt: 'Placar de um jogo ao vivo: o servidor só precisa falar, então SSE basta. Um chat, em que os dois lados falam, pede WebSocket. Com vários servidores, um Redis repassa a mensagem para quem está conectado em outro.',
    en: 'A live game scoreboard: only the server talks, so SSE is enough. A chat, where both sides talk, needs WebSocket. With several servers, Redis relays the message to users connected elsewhere.',
  },
  'api-pagination-compat': {
    pt: 'Offset é "pule 40 e me dê 20": se entrou um item novo no topo, você vê um repetido. Cursor é "me dê os 20 depois do item X": funciona como um marcador de livro.',
    en: 'Offset is "skip 40 and give me 20": if a new item lands on top, you see a duplicate. Cursor is "give me the 20 after item X": it works like a bookmark.',
  },
  'graphql-schema-apollo-server': {
    pt: 'Um schema de biblioteca: `livros(first: 10, after: "cursor")` para listar e `emprestarLivro(id)` que devolve o livro ou um erro "LIVRO_INDISPONIVEL". A regra de negócio fica num serviço, não no resolver.',
    en: 'A library schema: `books(first: 10, after: "cursor")` to list and `borrowBook(id)` returning the book or a "BOOK_UNAVAILABLE" error. The business rule lives in a service, not in the resolver.',
  },
  'socketio-auth-redis-adapter': {
    pt: 'Um prédio com várias portarias: cada porteiro (servidor) confere o crachá na entrada e coloca a pessoa na sala do andar dela. O Redis é o interfone que avisa todas as portarias ao mesmo tempo.',
    en: 'A building with several front desks: each doorman (server) checks the badge at the door and sends the person to their floor\'s room. Redis is the intercom that reaches every desk at once.',
  },
  'db-isolation-locks': {
    pt: 'Duas pessoas sacam R$ 100 ao mesmo tempo de uma conta com R$ 150. Sem trava, as duas veem R$ 150 e o saldo fica negativo. Com `SELECT ... FOR UPDATE`, a segunda espera a primeira terminar.',
    en: 'Two people withdraw $100 at the same time from an account with $150. Without a lock, both see $150 and the balance goes negative. With `SELECT ... FOR UPDATE`, the second waits for the first to finish.',
  },
  'db-indexes-explain': {
    pt: 'Um índice composto é a lista telefônica ordenada por cidade, depois bairro, depois nome. Ela ajuda a achar "cidade + bairro", mas não ajuda a achar só pelo nome.',
    en: 'A composite index is a phone book sorted by city, then neighborhood, then name. It helps find "city + neighborhood", but not just by name.',
  },
  'db-mongo-vs-sql': {
    pt: 'Um post de blog com seus comentários cabe num documento só (Mongo, embutido). Já pedidos, clientes e estoque que se cruzam o tempo todo pedem tabelas relacionadas e transações (SQL).',
    en: 'A blog post with its comments fits in one document (Mongo, embedded). Orders, customers and stock that cross-reference all the time call for related tables and transactions (SQL).',
  },
  'redis-cache-patterns': {
    pt: 'Cache-aside é a cola na geladeira: antes de ir ao banco, olha a cola. Stampede é a cola sumir e 100 pessoas irem ao banco ao mesmo tempo; um lock deixa só uma ir e as outras esperam.',
    en: 'Cache-aside is the note on the fridge: before going to the database, check the note. A stampede is the note vanishing and 100 people hitting the database at once; a lock lets one go while the rest wait.',
  },
  'mongo-aggregation-esr': {
    pt: 'A agregação é uma linha de montagem: filtra (`$match`) só os pedidos pagos do mês, agrupa (`$group`) por loja e soma, depois ordena. Filtrar primeiro deixa a esteira mais curta.',
    en: 'An aggregation is an assembly line: filter (`$match`) only this month\'s paid orders, group (`$group`) by store and sum, then sort. Filtering first makes the line shorter.',
  },
  'mongo-replication-consistency': {
    pt: 'Replica set é ter cópias do mesmo caderno com colegas. Write concern "majority" é só dizer "anotado" quando a maioria copiou. A shard key é como dividir os cadernos: por cliente, e não por data, para não lotar um só.',
    en: 'A replica set is keeping copies of the same notebook with classmates. Write concern "majority" means saying "noted" only after most have copied it. The shard key is how you split notebooks: by customer, not by date, so one does not fill up.',
  },
  'mq-outbox-pattern': {
    pt: 'Você salva o pedido e, na mesma transação, anota "avisar a loja" numa caixa de saída. Um carteiro lê a caixa e entrega. Se o sistema cair, o recado continua lá e ninguém é esquecido.',
    en: 'You save the order and, in the same transaction, write "notify the store" in an outbox. A mail carrier reads the box and delivers. If the system crashes, the note is still there and nobody is forgotten.',
  },
  'mq-rabbitmq-concepts': {
    pt: 'A exchange é a agência dos correios, as filas são as caixas postais e o binding é a regra "cartas do bairro X vão para a caixa Y". A dead-letter queue é a seção de cartas que não puderam ser entregues.',
    en: 'The exchange is the post office, queues are mailboxes, and a binding is the rule "letters for district X go to box Y". The dead-letter queue is the shelf of letters that could not be delivered.',
  },
  'arch-monolith-microservices': {
    pt: 'Monolito é uma casa só; microsserviços é um condomínio. No condomínio cada casa reforma sem atrapalhar a outra, mas aparecem portaria, interfone e encanamento entre elas para cuidar.',
    en: 'A monolith is a single house; microservices are a gated community. Each house can be renovated without disturbing the others, but now there is a gate, an intercom and plumbing between them to maintain.',
  },
  'arch-resilience-partial': {
    pt: 'Um comparador de passagens consulta três companhias. Se uma demora, você mostra as outras duas com "preço indisponível" para a terceira, em vez de deixar a tela carregando 30 segundos.',
    en: 'A flight comparison site queries three airlines. If one is slow, you show the other two with "price unavailable" for the third instead of keeping the screen loading for 30 seconds.',
  },
  'arch-system-design-logs': {
    pt: 'Como os correios: os serviços jogam cartas numa fila (Kafka), centros de triagem processam e guardam numa busca indexada (Elasticsearch), e o painel consulta só o que interessa. Logs velhos vão para um depósito barato.',
    en: 'Like a postal system: services drop letters into a queue (Kafka), sorting centers process them and store them in an indexed search (Elasticsearch), and the dashboard queries only what matters. Old logs go to cheap storage.',
  },
  'arch-multitenancy': {
    pt: 'Um prédio de escritórios: todos usam o mesmo elevador e a mesma portaria, mas cada empresa só abre a própria sala. No banco, cada linha tem `tenant_id` e toda consulta filtra por ele (ou o banco filtra com RLS).',
    en: 'An office building: everyone shares the elevator and front desk, but each company only opens its own room. In the database, each row has a `tenant_id` and every query filters by it (or the database does it with RLS).',
  },
  'solid-all-five': {
    pt: 'Uma loja: a classe de pedido não manda e-mail (S); adicionar Pix não mexe no código do cartão (O); um "pagamento grátis" não quebra quem espera um pagamento (L); quem só lê não implementa escrita (I); o pedido depende de "um meio de pagamento", não do banco X (D).',
    en: 'A store: the order class does not send emails (S); adding a new payment method does not touch the card code (O); a "free payment" does not break code expecting a payment (L); read-only clients do not implement writes (I); the order depends on "a payment method", not on bank X (D).',
  },
  'ddd-core-concepts': {
    pt: 'Numa escola, "aluno" na secretaria tem matrícula e mensalidade; na biblioteca tem empréstimos. São dois contextos com o mesmo nome. O agregado "Turma" garante a regra "no máximo 30 alunos".',
    en: 'At a school, a "student" at the front office has enrollment and fees; at the library they have loans. Two contexts with the same name. The "Class" aggregate enforces the rule "at most 30 students".',
  },
  'clean-code-review': {
    pt: 'Em vez de "isso está errado", escreva: "e se a lista vier vazia? Acho que o `items[0]` quebra aqui; que tal retornar cedo?". Pergunta, motivo e sugestão.',
    en: 'Instead of "this is wrong", write: "what if the list is empty? I think `items[0]` breaks here; how about returning early?". Question, reason and suggestion.',
  },
  'design-patterns-real': {
    pt: 'Strategy: calcular frete por Correios ou transportadora com a mesma interface. Adapter: uma tomada de três pinos para usar um gateway de pagamento com API diferente. Observer: "quando o pedido for pago, avise o estoque e o e-mail".',
    en: 'Strategy: compute shipping via mail or courier through the same interface. Adapter: a plug adapter to use a payment gateway with a different API. Observer: "when the order is paid, notify stock and email".',
  },
  'test-pyramid-strategy': {
    pt: 'Num carro: muitos testes de peça (unitários), alguns testes do motor montado (integração) e poucos test-drives completos (E2E). Você mocka o posto de gasolina (serviço externo), não o próprio motor.',
    en: 'In a car: many part tests (unit), some tests of the assembled engine (integration) and a few full test drives (E2E). You mock the gas station (external service), not the engine itself.',
  },
  'test-tdd-code': {
    pt: 'Primeiro o teste "reembolso de R$ 50 com limite de R$ 100 é aprovado" falha, depois você escreve o mínimo para passar. Em seguida "R$ 150 é recusado". Um caso de cada vez.',
    en: 'First the test "a $50 refund with a $100 limit is approved" fails, then you write the minimum to pass. Then "$150 is rejected". One case at a time.',
  },
  'cicd-pipeline': {
    pt: 'Como um checklist de piloto antes de decolar: lint, testes, build e deploy em etapas. O feature flag é o interruptor que desliga a novidade sem precisar pousar o avião.',
    en: 'Like a pilot\'s pre-flight checklist: lint, tests, build and a staged deploy. A feature flag is the switch that turns off the new feature without landing the plane.',
  },
  'docker-node-multistage': {
    pt: 'Multi-stage é cozinhar numa cozinha grande e levar para a mesa só o prato pronto: as ferramentas de build ficam para trás e a imagem final fica pequena.',
    en: 'Multi-stage is cooking in a big kitchen and bringing only the finished dish to the table: the build tools stay behind and the final image is small.',
  },
  'k8s-core-concepts': {
    pt: 'Rolling update é trocar os pneus de um ônibus um de cada vez com ele andando: um pod novo só recebe passageiros quando a readiness diz que está pronto, e aí um velho sai.',
    en: 'A rolling update is swapping a bus\'s tires one at a time while it keeps driving: a new pod only takes passengers once readiness says it is ready, then an old one leaves.',
  },
  'obs-three-pillars': {
    pt: 'Num carro: o painel com velocidade é a métrica, a caixa-preta com o que aconteceu é o log, e o GPS com o caminho completo da viagem é o trace.',
    en: 'In a car: the dashboard speed is the metric, the black box recording what happened is the log, and the GPS showing the whole route is the trace.',
  },
  'obs-slo-alerting': {
    pt: 'SLO "99,9% dos pedidos respondem em menos de 1 s" deixa uns 43 minutos de falha por mês: é o error budget. Acordar alguém só quando esse orçamento está acabando rápido.',
    en: 'An SLO of "99.9% of requests answer under 1 s" leaves about 43 minutes of failure per month: that is the error budget. Wake someone up only when that budget is burning fast.',
  },
  'obs-frontend-reactflow': {
    pt: 'Como um fluxograma de receita: cada caixa é uma etapa (filtrar, transformar, enviar) e as setas ligam saídas a entradas. A tela guarda só nós e arestas; validar "não pode ligar a saída na própria entrada" fica numa função testável.',
    en: 'Like a recipe flowchart: each box is a step (filter, transform, send) and arrows connect outputs to inputs. The screen only stores nodes and edges; validating "you cannot connect an output to its own input" lives in a testable function.',
  },
  'elasticsearch-fundamentals': {
    pt: 'O índice invertido é o índice remissivo no fim do livro: "cachorro → páginas 3, 47". `text` quebra a frase em palavras para busca; `keyword` guarda o valor inteiro, como um código de CEP, para filtro exato.',
    en: 'An inverted index is the index at the back of a book: "dog → pages 3, 47". `text` splits sentences into words for searching; `keyword` stores the whole value, like a zip code, for exact filtering.',
  },
  'otel-node-instrumentation': {
    pt: 'É colocar um rastreador numa encomenda: cada parada (API, banco, fila) registra hora e duração, e o mesmo código de rastreio aparece nos logs. Um span manual marca a etapa "calcular desconto".',
    en: 'It is putting a tracker on a parcel: each stop (API, database, queue) records time and duration, and the same tracking code shows up in the logs. A manual span marks the "compute discount" step.',
  },
  'sec-owasp-web': {
    pt: 'O React escapa texto, então `<script>` num comentário vira texto. Mas `dangerouslySetInnerHTML` ou um link `href="javascript:..."` reabrem a porta. E trocar o id na URL para ver o pedido de outra pessoa (IDOR) o React não impede.',
    en: 'React escapes text, so a `<script>` in a comment becomes plain text. But `dangerouslySetInnerHTML` or an `href="javascript:..."` link reopen the door. And changing the id in the URL to see someone else\'s order (IDOR) is not something React prevents.',
  },
  'sec-auth-jwt-oauth': {
    pt: 'JWT é o crachá de evento: quem confere só olha o selo, sem ligar para a organização, mas não dá para cancelar antes de vencer. Sessão é a pulseira com número que a portaria confere numa lista e pode invalidar na hora.',
    en: 'A JWT is an event badge: whoever checks it only looks at the seal without calling the organizer, but it cannot be revoked before it expires. A session is a numbered wristband the door checks against a list and can cancel instantly.',
  },
  'laravel-request-lifecycle': {
    pt: 'Uma requisição no Laravel é uma linha de montagem: entra no `index.php`, passa pelos middlewares (autenticação, CSRF), chega ao controller e volta pelo mesmo caminho. O container é o almoxarifado que entrega a peça pedida.',
    en: 'A Laravel request is an assembly line: it enters `index.php`, goes through the middlewares (auth, CSRF), reaches the controller and returns the same way. The container is the stockroom that hands over the requested part.',
  },
  'salesforce-governor-limits': {
    pt: 'Um trigger que faz uma consulta por registro é como um caixa que chama o gerente para cada item da compra: com 200 itens, estoura o limite. Junte os ids e faça uma consulta só para o lote.',
    en: 'A trigger that runs one query per record is like a cashier calling the manager for every item: with 200 items, the limit blows up. Collect the ids and run one query for the whole batch.',
  },
  'scrum-ceremonies-estimation': {
    pt: 'Planning poker com uma tela de login: todos mostram a carta ao mesmo tempo; quem deu 2 e quem deu 8 explicam. Às vezes um lembrou da recuperação de senha que ninguém viu.',
    en: 'Planning poker for a login screen: everyone shows their card at once; whoever said 2 and whoever said 8 explain. Sometimes one of them remembered the password reset nobody else saw.',
  },
  'behavioral-incident-star': {
    pt: 'Estrutura STAR num caso qualquer: "o checkout caiu numa sexta (Situação); eu era responsável pelo serviço (Tarefa); reverti o deploy e achei o erro na migração (Ação); voltou em 15 min e criamos um teste para isso (Resultado)".',
    en: 'STAR structure on any case: "checkout went down on a Friday (Situation); I owned the service (Task); I rolled back the deploy and found the bug in the migration (Action); it was back in 15 min and we added a test for it (Result)".',
  },
  'behavioral-technical-disagreement': {
    pt: '"O time queria trocar o banco no meio do projeto. Eu discordei, levei números de quanto tempo levaria e propus testar numa parte pequena primeiro. Decidimos juntos e, quando a decisão foi outra, segui com ela."',
    en: '"The team wanted to switch databases mid-project. I disagreed, brought numbers on how long it would take and proposed trying it on a small part first. We decided together, and when the call went the other way, I committed to it."',
  },
  'behavioral-ai-tools': {
    pt: 'Use a IA como um estagiário rápido: ela escreve o rascunho de um teste ou de uma função, e você lê o diff, roda os testes e confere os casos de borda antes de aceitar. Nunca cole segredo nem dado de cliente.',
    en: 'Use AI like a fast intern: it drafts a test or a function, and you read the diff, run the tests and check the edge cases before accepting. Never paste secrets or customer data.',
  },
  'behavioral-why-senior': {
    pt: 'Quem muda de linguagem leva junto o que não depende dela: um motorista experiente que troca de carro já sabe dirigir na chuva, só precisa aprender onde ficam os botões.',
    en: 'Someone switching languages brings what does not depend on the language: an experienced driver in a new car already knows how to drive in the rain, they just need to learn where the buttons are.',
  },
  'php-oop-abstract-interface-trait': {
    pt: 'Interface é o contrato "todo meio de pagamento tem `pagar()`". Classe abstrata é a planta de casa com parte já construída. Trait é um kit de ferramentas que várias classes podem pegar emprestado, como "gerar log".',
    en: 'An interface is the contract "every payment method has `pay()`". An abstract class is a house blueprint with part already built. A trait is a toolkit several classes can borrow, like "write a log".',
  },
  'php-7-to-8-features': {
    pt: '`match` é um `switch` que não esquece o `break` e devolve valor. O nullsafe `$pedido?->cliente?->nome` evita uma escada de `if`. Enums trocam constantes soltas como `STATUS_PAGO = 2`.',
    en: '`match` is a `switch` that never forgets `break` and returns a value. Nullsafe `$order?->customer?->name` avoids a ladder of `if`s. Enums replace loose constants like `STATUS_PAID = 2`.',
  },
  'php-comparison-money': {
    pt: 'Em float, `0.1 + 0.2` dá `0.30000000000000004`. Em mil cobranças de R$ 0,10 isso vira centavos perdidos. Guardando 10 centavos como o inteiro `10`, a conta fecha sempre.',
    en: 'In floating point, `0.1 + 0.2` is `0.30000000000000004`. Over a thousand 10-cent charges that becomes lost cents. Storing 10 cents as the integer `10`, the math always adds up.',
  },
  'codeigniter3-architecture': {
    pt: 'A URL `/produtos/ver/7` vira "controller Produtos, método ver, parâmetro 7". O controller pede ao model os dados e entrega para a view montar a página: uma recepção que encaminha cada visitante à sala certa.',
    en: 'The URL `/products/view/7` becomes "Products controller, view method, parameter 7". The controller asks the model for data and hands it to the view to build the page: a front desk routing each visitor to the right room.',
  },
  'laravel-queues-payments': {
    pt: 'O caixa recebe o pagamento e já libera o cliente; o recibo por e-mail e o aviso ao estoque vão para uma fila de tarefas que outros funcionários fazem em seguida. Se um falhar, tenta de novo sem refazer o pagamento.',
    en: 'The cashier takes the payment and lets the customer go; the email receipt and the stock notice go to a task queue that other workers handle next. If one fails, it retries without redoing the payment.',
  },
  'php-security-pdo-password': {
    pt: 'Com prepared statement, o nome digitado `\' OR 1=1 --` é tratado como texto, não como comando. Senha vai com `password_hash`, que é um moedor: dá para conferir se a carne é a mesma, mas não desmoer.',
    en: 'With a prepared statement, a typed name like `\' OR 1=1 --` is treated as text, not as a command. Passwords go through `password_hash`, which is a grinder: you can check whether it is the same meat, but you cannot un-grind it.',
  },
  'sql-three-databases': {
    pt: 'Pegar os 10 primeiros: `LIMIT 10` no MySQL e no PostgreSQL, `TOP 10` (ou `OFFSET ... FETCH`) no SQL Server. Mesma ideia, sotaques diferentes, como "biscoito" e "bolacha".',
    en: 'Getting the first 10 rows: `LIMIT 10` in MySQL and PostgreSQL, `TOP 10` (or `OFFSET ... FETCH`) in SQL Server. Same idea, different accents, like "soda" and "pop".',
  },
  'sql-live-query-faturas': {
    pt: 'Na biblioteca: listar quem tem livro atrasado há mais de 30 dias e quantos. É um `JOIN` de pessoas com empréstimos, `WHERE devolvido IS NULL AND prazo < hoje - 30`, `GROUP BY` pessoa.',
    en: 'At a library: list who has a book over 30 days late and how many. It is a `JOIN` of people with loans, `WHERE returned IS NULL AND due < today - 30`, `GROUP BY` person.',
  },
  'docker-php-dev-env': {
    pt: 'O docker-compose é a marmita completa: Nginx, PHP e banco já na mesma caixa. Quem entra no time roda `docker compose up` e tem o mesmo ambiente, sem "na minha máquina funciona".',
    en: 'docker-compose is a full lunchbox: Nginx, PHP and the database in the same box. A new teammate runs `docker compose up` and gets the same environment, no more "works on my machine".',
  },
  'git-workflow-conflicts': {
    pt: 'Merge junta duas histórias e registra o encontro; rebase reescreve a sua como se tivesse começado depois. Hotfix: um galho a partir da versão em produção, só com a correção, sem levar o que ainda está em teste.',
    en: 'Merge joins two histories and records where they met; rebase rewrites yours as if it started later. Hotfix: a branch from the production version with only the fix, leaving behind what is still in testing.',
  },
  'java-basics-for-php-dev': {
    pt: 'Em Java, `"oi" == "oi"` pode dar falso porque compara se é o mesmo objeto, como perguntar se é o mesmo papel; `.equals()` pergunta se está escrito a mesma coisa.',
    en: 'In Java, `"hi" == "hi"` can be false because it checks whether it is the same object, like asking whether it is the same sheet of paper; `.equals()` asks whether the same thing is written on it.',
  },
  'clean-architecture-php': {
    pt: 'O caso de uso "pagar conta" é o miolo da casa e não sabe se a porta é web, terminal ou fila. Trocar o banco é trocar a fechadura: o miolo não muda.',
    en: 'The "pay bill" use case is the core of the house and does not know whether the door is web, CLI or a queue. Switching databases is changing the lock: the core stays the same.',
  },
  'payments-card-lifecycle': {
    pt: 'No hotel: a autorização é o bloqueio de R$ 500 no check-in; a captura é a cobrança real no check-out; o estorno devolve; o chargeback é o cliente reclamar no banco; a conciliação é conferir o extrato com as diárias.',
    en: 'At a hotel: authorization is the $500 hold at check-in; capture is the real charge at check-out; a refund gives money back; a chargeback is the guest disputing with the bank; reconciliation is matching the statement with the nights stayed.',
  },
  'phpunit-tdd-service': {
    pt: 'Boleto de R$ 100 pago 10 dias atrasado: um teste para a multa de 2% (R$ 2), outro para os juros do período e um para "pago no dia: sem encargo". O teste do dia exato do vencimento costuma achar o bug.',
    en: 'A $100 bill paid 10 days late: one test for the 2% fine ($2), another for interest over the period and one for "paid on the due date: no charge". The test for the exact due date usually finds the bug.',
  },
  'legacy-production-bug': {
    pt: 'Antes de mexer, reproduza: pegue um caso que dá errado e escreva um teste que mostra o erro. É como o mecânico que primeiro ouve o barulho do carro antes de abrir o motor.',
    en: 'Before changing anything, reproduce it: take a failing case and write a test that shows the bug. Like a mechanic who first listens to the noise before opening the engine.',
  },
  'gcp-services-map': {
    pt: 'É o mesmo bairro com placas diferentes: EC2 ↔ Compute Engine, RDS ↔ Cloud SQL, S3 ↔ Cloud Storage, Lambda/Fargate ↔ Cloud Run. Uma app PHP em container vai bem no Cloud Run com Cloud SQL.',
    en: 'Same neighborhood, different street signs: EC2 ↔ Compute Engine, RDS ↔ Cloud SQL, S3 ↔ Cloud Storage, Lambda/Fargate ↔ Cloud Run. A containerized PHP app runs well on Cloud Run with Cloud SQL.',
  },
  'behavioral-company-fit': {
    pt: 'Um roteiro de 3 frases serve para qualquer um: quem você é ("dev back-end há X anos"), o que faz de melhor ("manter sistemas críticos estáveis") e por que esta empresa ("o produto resolve um problema que já vivi").',
    en: 'A 3-sentence script works for anyone: who you are ("back-end dev for X years"), what you do best ("keeping critical systems stable") and why this company ("the product solves a problem I have lived").',
  },
  'algo-top-k-frequent': {
    pt: 'Contar votos de uma eleição: um dicionário conta cada nome (O(n)) e depois você pega os K mais votados, ordenando ou com um heap.',
    en: 'Counting election votes: a dictionary counts each name (O(n)) and then you take the top K, by sorting or with a heap.',
  },
  'algo-classic-hackerrank': {
    pt: 'Parênteses balanceados é uma pilha de pratos: cada `(` empilha, cada `)` tira um. Se faltar prato ou sobrar no fim, está errado. Two sum é anotar "preciso de 7" num dicionário e conferir cada número que passa.',
    en: 'Balanced parentheses is a stack of plates: each `(` pushes, each `)` pops one. If a plate is missing or left over at the end, it is wrong. Two sum is writing "I need 7" in a dictionary and checking each number as it passes.',
  },
  'obs-alerting-design': {
    pt: 'Um alarme de fumaça com regra: "mais de 50 erros em 5 minutos". Ele conta numa janela que anda, dispara uma vez, não fica tocando a cada segundo e avisa quando a fumaça some.',
    en: 'A smoke alarm with a rule: "more than 50 errors in 5 minutes". It counts over a moving window, fires once, does not ring every second and tells you when the smoke clears.',
  },
  'behavioral-proud-project-deepdive': {
    pt: 'Escolha um projeto em que você sabe responder "por quê" em três níveis: por que essa arquitetura, o que você trocaria hoje e o que deu errado no caminho. Ex.: "um sistema de agendamento; escolhi fila porque o envio de lembretes travava a tela".',
    en: 'Pick a project where you can answer "why" three levels deep: why that architecture, what you would change today and what went wrong along the way. E.g.: "a booking system; I chose a queue because sending reminders froze the screen".',
  },
  'behavioral-remote-async': {
    pt: 'Uma mensagem assíncrona boa se lê sem reunião: contexto, o que você tentou, a pergunta e até quando precisa. "Deploy do pagamento falha no passo X; tentei Y e Z; posso reverter ou alguém tem ideia até amanhã 10h?"',
    en: 'A good async message reads without a meeting: context, what you tried, the question and when you need it. "Payment deploy fails at step X; tried Y and Z; should I roll back, or does anyone have an idea by 10 a.m. tomorrow?"',
  },
  'behavioral-relocation-consultancy': {
    pt: 'Mostre que pesquisou com números: custo de aluguel na cidade, tipo de visto, tempo do processo e por que aquele lugar. "Já fiz as contas" convence mais do que "sempre quis morar fora".',
    en: 'Show you did the research with numbers: rent in that city, visa type, how long the process takes and why that place. "I have run the numbers" convinces more than "I always wanted to live abroad".',
  },
  'wallet-money-bigint-decimal': {
    pt: 'R$ 12,34 guardado como `1234` centavos: soma de inteiros nunca arredonda. Um objeto `Dinheiro` impede somar real com dólar sem querer, como uma calculadora que recusa misturar moedas.',
    en: '$12.34 stored as `1234` cents: integer addition never rounds. A `Money` object prevents adding reais to dollars by accident, like a calculator that refuses to mix currencies.',
  },
  'wallet-ledger-reversal': {
    pt: 'No extrato do banco, um estorno aparece como uma linha nova de +R$ 50, e a compra de -R$ 50 continua lá. Apagar a linha original seria arrancar uma página do livro-caixa.',
    en: 'On a bank statement, a refund shows up as a new +$50 line, and the -$50 purchase stays there. Deleting the original line would be tearing a page out of the ledger.',
  },
  'wallet-lock-then-idempotency': {
    pt: 'Duas pessoas chegam com a mesma senha de atendimento. Se a conferência "essa senha já foi atendida?" acontece antes de entrar na sala trancada, as duas passam. Trancando primeiro, a segunda vê que já foi atendida.',
    en: 'Two people show up with the same ticket number. If the check "has this ticket been served?" happens before entering the locked room, both get through. Locking first, the second sees it was already served.',
  },
  'wallet-crash-mid-transfer': {
    pt: 'Na transação, débito e crédito são um pacote: ou os dois são gravados, ou nenhum. Se a luz cai no meio, o banco desfaz o débito ao voltar, como um caixa eletrônico que devolve o cartão sem sacar.',
    en: 'In a transaction, debit and credit are one package: both are saved or neither is. If the power goes out midway, the database undoes the debit on restart, like an ATM returning your card without dispensing.',
  },
  'db-least-privilege-ledger': {
    pt: 'O caixa da loja pode registrar vendas, mas não apagar o livro-caixa. Se ele errar (ou um bug errar), o erro vira um lançamento de correção visível, e não uma linha que some.',
    en: 'A store cashier can record sales but cannot erase the ledger. If they make a mistake (or a bug does), it becomes a visible correcting entry, not a line that disappears.',
  },
  'laravel-renderable-exceptions': {
    pt: '"Saldo insuficiente" é como "produto esgotado": normal, mostra uma mensagem e não chama o técnico. Um erro de divisão por zero é a máquina quebrada: precisa ir para o log e alertar alguém.',
    en: '"Insufficient balance" is like "out of stock": normal, show a message, no need to call a technician. A division-by-zero error is a broken machine: it must go to the log and alert someone.',
  },
  'web-session-cookie-flags': {
    pt: 'Cookie sem `Secure` é mandar a chave de casa num cartão-postal: num Wi-Fi público, qualquer um no caminho lê. `HttpOnly` só impede que scripts da página peguem a chave, não quem lê o cartão.',
    en: 'A cookie without `Secure` is mailing your house key on a postcard: on public Wi-Fi, anyone along the way can read it. `HttpOnly` only stops page scripts from taking the key, not someone reading the postcard.',
  },
  'datetime-utc-timezones': {
    pt: 'Uma reunião marcada "às 10h" entre São Paulo e Lisboa só fica certa se você grava num relógio comum (UTC) e converte na tela de cada um. Horário de verão em um lugar e não no outro é o bug clássico.',
    en: 'A meeting "at 10 a.m." between São Paulo and Lisbon only works if you store it on a shared clock (UTC) and convert on each person\'s screen. Daylight saving in one place but not the other is the classic bug.',
  },
  'docker-uid-ci-portability': {
    pt: 'Se o container roda como root, os arquivos que ele cria na sua pasta ficam "do administrador" e você não consegue apagar. Rodando com o seu usuário, o que ele cria é seu.',
    en: 'If the container runs as root, the files it creates in your folder belong to "the administrator" and you cannot delete them. Running as your own user, what it creates is yours.',
  },
  'laravel-actions-no-repositories': {
    pt: 'Uma action é uma receita com nome: `TransferirSaldo` faz uma coisa só e pode ser usada pelo controller, por um comando ou por um teste. Um repositório em cima do Eloquent costuma ser uma embalagem em volta de outra embalagem.',
    en: 'An action is a named recipe: `TransferBalance` does one thing and can be used by a controller, a command or a test. A repository on top of Eloquent is often a wrapper around another wrapper.',
  },
  'project-scope-tradeoffs': {
    pt: 'Numa mudança com prazo, você leva primeiro cama, fogão e geladeira; os quadros ficam para depois. Dizer o que cortou e por quê mostra mais critério do que fingir que fez tudo.',
    en: 'Moving house on a deadline, you take the bed, stove and fridge first; the paintings come later. Saying what you cut and why shows more judgment than pretending you did everything.',
  },
  'webhook-idempotent-signature': {
    pt: 'O carteiro entrega a mesma carta registrada três vezes. Você confere a assinatura (é mesmo do banco?) e o número do registro: se já recebeu, agradece e não processa de novo.',
    en: 'The mail carrier delivers the same registered letter three times. You check the signature (is it really from the bank?) and the tracking number: if you already have it, you say thanks and do not process it again.',
  },
  'order-state-machine': {
    pt: 'Um pedido é como um semáforo com regras: de "pago" pode ir para "enviado", mas de "cancelado" nunca vai para "enviado". O código lista as setas permitidas e recusa as outras.',
    en: 'An order is like a traffic light with rules: from "paid" it can go to "shipped", but from "cancelled" it never goes to "shipped". The code lists the allowed arrows and rejects the rest.',
  },
  'migration-php-to-node-strangler': {
    pt: 'Reformar uma ponte sem fechar o trânsito: você constrói faixas novas ao lado e desvia os carros aos poucos. O padrão strangler manda uma rota de cada vez para o serviço novo, com volta fácil.',
    en: 'Renovating a bridge without closing traffic: you build new lanes alongside and divert cars little by little. The strangler pattern sends one route at a time to the new service, with an easy way back.',
  },
  'external-call-vs-db-transaction': {
    pt: 'Uma transação do banco não desfaz uma ligação telefônica. Se cobrou no gateway e o banco falhou, você precisa de um registro "cobrança pendente" antes e de uma rotina que confere e corrige depois.',
    en: 'A database transaction cannot undo a phone call. If the gateway charged and the database failed, you need a "pending charge" record first and a routine that checks and fixes things afterwards.',
  },
  'async-fiscal-emission-retry-dlq': {
    pt: 'Se a gráfica está fechada, a loja não deixa o cliente esperando: entrega o pedido e manda imprimir o recibo depois. A fila tenta de novo com intervalos crescentes e, se nada der certo, separa o caso para alguém olhar.',
    en: 'If the print shop is closed, the store does not keep the customer waiting: it hands over the order and has the receipt printed later. The queue retries with growing intervals and, if nothing works, sets the case aside for someone to review.',
  },
  'idempotency-transaction-exactly-once': {
    pt: 'O carteiro pode entregar a mesma carta duas vezes (at-least-once). Você não controla o carteiro, mas pode anotar "carta 123 já lida": o efeito acontece uma vez só. Isso é idempotência.',
    en: 'The mail carrier may deliver the same letter twice (at-least-once). You cannot control the carrier, but you can note "letter 123 already read": the effect happens only once. That is idempotency.',
  },
  'finance-business-metrics-tracing': {
    pt: 'Além de CPU e erros, olhe o que o negócio sente: pagamentos aprovados por minuto, tempo até o recibo, fila parada. Um id de correlação é a etiqueta que segue a encomenda do PHP para a fila e para o Node.',
    en: 'Beyond CPU and errors, watch what the business feels: approved payments per minute, time to receipt, a stuck queue. A correlation id is the tag that follows the parcel from PHP to the queue to Node.',
  },
  'perf-measure-before-optimize': {
    pt: 'Antes de comprar um carro mais rápido, cronometre o trajeto e veja onde perde tempo: talvez seja um semáforo só. Meça antes, mude uma coisa, meça depois com os mesmos dados.',
    en: 'Before buying a faster car, time the commute and see where you lose time: maybe it is a single traffic light. Measure first, change one thing, measure again with the same data.',
  },
  'php-streaming-large-files': {
    pt: 'Ler um arquivo de milhões de linhas é como beber de um bebedouro: um gole por vez (`fgets`, generator), e não tentar encher a boca com o galão inteiro (`file()` ou `json_decode` de tudo).',
    en: 'Reading a file with millions of lines is like drinking from a fountain: one sip at a time (`fgets`, a generator), not trying to fill your mouth with the whole jug (`file()` or `json_decode` on everything).',
  },
  'php-exceptions-assertions': {
    pt: 'Idade negativa passada pelo seu próprio código: `InvalidArgumentException` (bug de quem chamou). CSV com coluna faltando: exceção de dado inválido com a linha (culpa do arquivo). Disco cheio: `RuntimeException` (o mundo falhou).',
    en: 'A negative age passed by your own code: `InvalidArgumentException` (the caller\'s bug). A CSV missing a column: an invalid-data exception with the line number (the file\'s fault). Disk full: `RuntimeException` (the world failed).',
  },
  'php-static-analysis-strict': {
    pt: 'Sem `strict_types`, `somar("5", 3)` vira 8 em silêncio. Com ele, o PHP recusa. O PHPStan é o corretor que lê o texto antes de publicar e avisa "aqui pode vir null".',
    en: 'Without `strict_types`, `add("5", 3)` silently becomes 8. With it, PHP refuses. PHPStan is the proofreader who reads before publishing and warns "this could be null here".',
  },
  'testing-parsers-cli-boundaries': {
    pt: 'Para um leitor de CSV: arquivo vazio, só cabeçalho, linha com vírgula dentro de aspas, acento, linha em branco no fim e um arquivo enorme. O script de terminal é testado pelo código de saída e pelo que imprime.',
    en: 'For a CSV reader: empty file, header only, a line with a comma inside quotes, accented characters, a blank line at the end and a huge file. A CLI script is tested by its exit code and by what it prints.',
  },
  'node-ssrf-user-url': {
    pt: 'É como um porteiro que busca encomendas em qualquer endereço que o visitante escrever. Se alguém escreve "a sala do cofre do próprio prédio" (`http://169.254.169.254` ou `localhost`), o porteiro abre. Só aceite endereços permitidos.',
    en: 'It is like a doorman who fetches packages from any address a visitor writes. If someone writes "the building\'s own vault room" (`http://169.254.169.254` or `localhost`), the doorman opens it. Only accept allowed addresses.',
  },
  'data-anonymization-non-prod': {
    pt: 'Para ensaiar uma peça você usa atores, não as pessoas reais: troca nome, CPF e e-mail por dados falsos com o mesmo formato, mantendo os valores e datas que reproduzem o bug.',
    en: 'To rehearse a play you use actors, not the real people: swap names, tax ids and emails for fake data with the same format, keeping the amounts and dates that reproduce the bug.',
  },
};
