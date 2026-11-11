# DevTechnical

> 🇧🇷 Simulador de entrevista técnica sênior, bilíngue (PT/EN) · 🇬🇧 [English below](#english)

**Site:** https://acamilateixeira.github.io/DevTechnical/

Um recrutador chato, em forma de app. Ele faz perguntas técnicas sobre a stack que aparece no meu currículo e no [portfólio](https://acamilateixeira.github.io/camilat/), e sobre o que as vagas-alvo pedem: Elastic (Senior Full Stack, Observability), BrainRocket (Senior Full Stack Node/React), KWAN (consultoria em Portugal), vagas de Frontend Sênior em React e Brasil Card (Full Stack Pleno PHP).

## Como funciona

O caminho sugerido é **ver funcionando → explicar com suas palavras → responder a pergunta**:

- **Comece aqui**: como é um processo seletivo sênior e como estudar com o app, um tema por vez.
- **Laboratório**: 14 exemplos que rodam no navegador, sem instalar nada. Cada um explica o conceito com uma analogia e tem código editável, botão **Rodar**, contadores, uma **linha do tempo** mostrando o que rodou em cada parte do sistema (cliente, API, banco, fila…) e quando, além de uma lista "Experimente mudar". Mais 5 labs de Node.js para rodar no terminal (servidor HTTP, threads, SIGTERM e SQLite reais). Detalhes em [`labs/node/README.md`](labs/node/README.md).
- **Glossário**: 224 termos técnicos em linguagem simples. Nas respostas e nos labs, a definição curta aparece **entre parênteses** na primeira vez que o termo surge (dá para desligar no botão "( ) definições") e tocar no termo mostra a explicação maior.

- **Entrevista**: uma pergunta por vez, sorteada com prioridade para as que eu ainda não respondi ou em que tirei nota baixa. Respondo em voz alta ou escrevo (o rascunho fica no navegador), com cronômetro opcional de 3 minutos.
- **Resposta modelo**: explicação completa, código quando a pergunta pede, ferramentas/libs/técnicas para citar, métricas que provam domínio, follow-ups que o recrutador faria, red flags (o que não dizer) e como ancorar a resposta na minha experiência real, sem inventar.
- **Nota objetiva**: cada pergunta tem um checklist com os pontos que uma resposta 100% precisa cobrir. Marco só o que eu realmente disse e a nota sai daí: **≥ 80% acerto, 40–79% parcial, < 40% erro**.
- **Progresso**: nota média, % de acerto/parcial/erro no geral e por tema, tema mais forte e tema para estudar primeiro.
- **Estudo**: todas as perguntas com busca e filtros por vaga, tema e tipo.

O progresso fica só no `localStorage` do navegador; não há back-end nem coleta de dados.

## Conteúdo

92 perguntas e 473 pontos de rubrica, todos em português e inglês. O lote 2 cobre as lacunas entre o meu CV e as vagas (GraphQL/Apollo, NestJS, MongoDB, Next.js, Docker/Kubernetes, Elasticsearch, OpenTelemetry), sempre indicando com honestidade o que é estudo e o que é experiência.

| Tema | Exemplos |
| --- | --- |
| JavaScript & TypeScript | event loop, `unknown`/`never`, generics, closures, contrato compartilhado com Zod |
| React & Next.js | reconciliação e keys, `useEffect`, performance, estado, acessibilidade, SSR/RSC, Server Actions, cache do Apollo Client, Material UI, testes com RTL + MSW, catálogo de hooks, `useReducer` + Context, Redux Toolkit vs Zustand, estado derivado, depuração com React DevTools |
| Node.js & NestJS | event loop bloqueado, streams e backpressure, graceful shutdown, DI no Nest, guards com teste, microsserviços com RabbitMQ |
| APIs | REST vs GraphQL, N+1 e DataLoader, schema no Apollo Server, idempotência, WebSockets e Socket.IO, paginação e compatibilidade |
| Dados | isolamento e locks, índices e `EXPLAIN`, MongoDB vs SQL, agregação e replicação no MongoDB, padrões de cache com Redis |
| Mensageria | outbox, RabbitMQ vs Kafka |
| Arquitetura | monolito vs microsserviços, resiliência, system design de ingestão de logs, multi-tenancy |
| Princípios | SOLID, DDD, Clean Code em code review, design patterns |
| Testes & CI/CD | estratégia, TDD ao vivo, pipeline e deploy seguro |
| Docker & Kubernetes | Dockerfile multi-stage, objetos do K8s, rolling update, probes, OOMKilled |
| Observabilidade | logs/métricas/traces, SLO e alertas, React Flow, fundamentos do Elasticsearch, OpenTelemetry no Node |
| Segurança | OWASP, autenticação (JWT, OAuth/OIDC, PKCE) |
| PHP & Laravel / Salesforce | ciclo do Laravel e Eloquent, governor limits no Apex |
| Scrum & comportamental | Scrum e estimativa, incidente (STAR), discordância técnica, IA, "por que sênior?", projeto que te orgulha, trabalho remoto assíncrono, realocação e consultoria |
| Meios de pagamento | `==` × `===` e dinheiro em centavos, ciclo da compra no cartão (autorização, captura, estorno, chargeback, conciliação) |
| Algoritmos (live coding) | top-K de logs, two sum, parênteses balanceados, anagramas, com complexidade |

### Vaga Brasil Card (Full Stack Pleno PHP)

Filtre por **Vaga → Brasil Card** para ver as 39 perguntas ligadas aos requisitos e diferenciais da vaga: POO em PHP, novidades do PHP 7.4 → 8, CodeIgniter 3 × Laravel, filas no Laravel, segurança (PDO, senhas, PCI DSS), diferenças entre SQL Server, MySQL e PostgreSQL, SQL ao vivo, Docker para PHP, Git, Java para quem vem do PHP, Clean Architecture, TDD com PHPUnit, bug em produção no legado, GCP e a entrevista com RH e gestor.

### Isso é perguntado de verdade?

Perguntas marcadas com **✓ relatada** têm evidência pública de que aparecem em entrevistas reais; a resposta abre com a fonte. A pesquisa (Glassdoor, TabNews e guias públicos do processo da Elastic) está registrada em [`data/evidence.js`](data/evidence.js). Resumo do que os relatos descrevem:

- **Elastic**: triagem com RH, rodadas técnicas com problemas "fáceis estilo LeetCode", concorrência e system design, exercício com code review ao vivo, comportamental "mais sério que o esperado" (STAR) e aprofundamento na sua experiência.
- **BrainRocket**: conversa com recrutador, teste no HackerRank, entrevista técnica com o head da área e perguntas sobre realocação.
- **KWAN**: RH (motivo para ir a Portugal, valores, inglês), teste técnico de 1 hora na sua linguagem, entrevista com especialista e depois com o cliente.
- **Brasil Card**: os relatos públicos são de outras áreas, mas mostram o formato: contato rápido do RH, entrevista com recrutador e depois com o gestor ("onde se vê em 5 anos?", "como conheceu a empresa?").
- **PHP pleno no Brasil**: "como o Laravel processa uma requisição", classe abstrata × interface, polimorfismo, SOLID, design patterns, índices e live coding.

## Histórias

Conceito abstrato fica mais fácil quando vira conversa engraçada. Cada lab e 28 perguntas têm uma **história em forma de diálogo**, em português e em inglês, mostrada antes da resposta modelo e terminando com a frase pronta para a entrevista. As perguntas ligadas a um lab usam a história do lab, então 47 das 92 perguntas têm história. A do event loop foi escrita por mim.

## Laboratório

| Lab | Tipo | O que mostra |
| --- | --- | --- |
| Event loop | JS | Cada `console.log` cai na coluna síncrono, microtask ou macrotask; inclui "a história do event loop" em forma de conversa |
| Closure e debounce | JS + tela | 11 chamadas à API sem debounce contra 1 com debounce |
| Keys em listas | React | O texto digitado "pula" de item com `key={index}` |
| useEffect e race condition | React | A resposta antiga sobrescreve a nova; `AbortController` corrige |
| Re-renders | React | Context único vs separado, `memo` e contadores de render |
| Mini Zustand | React | Store com seletores em 20 linhas (`useSyncExternalStore`) |
| Idempotência | JS | Rede perde respostas: 3 cobranças sem `Idempotency-Key`, 1 com |
| Transações e locks | JS | Lost update com duas aprovações; `FOR UPDATE` e update atômico |
| Cache stampede | JS | 50 queries no banco sem single-flight, 1 com |
| Outbox | JS | Evento perdido no dual write; duplicado sem consumidor idempotente |
| Resiliência | JS | Timeout por provedor, resposta parcial e circuit breaker |
| N+1 e DataLoader | JS | 51 queries contra 2 |
| TDD | JS + testes | Testes que rodam na página: quebre a regra e veja ficar vermelho |
| XSS | React | `{texto}` seguro, `dangerouslySetInnerHTML` executando script, sanitização |

O código de cada lab fica em `labs/web/<id>/` (arquivos reais, editáveis no site e no repositório). Eles rodam num `iframe` isolado com React 19 e o compilador do TypeScript empacotados em `assets/vendor/` (ver [`assets/vendor/README.md`](assets/vendor/README.md)), então funcionam sem internet além do próprio site.

## Estrutura

```
index.html            # casca da página
assets/app.js         # modos entrevista, estudo e progresso; nota e persistência
assets/lab.js         # motor do Laboratório: editor, iframe isolado, linha do tempo, contadores
assets/gloss.js       # anota termos do glossário no texto (definição entre parênteses)
assets/start.js       # página "Comece aqui"
assets/glossary-page.js # página do glossário
assets/vendor/        # React 19 e TypeScript empacotados para rodar os labs
assets/md.js          # markdown mínimo que escapa HTML
assets/styles.css     # tema claro/escuro, responsivo
data/meta.js          # vagas, temas, tipos e textos da interface (PT/EN)
data/<tema>.js        # perguntas por tema
data/rubrics.js       # checklist, ferramentas e métricas por pergunta
data/glossary.js      # 225 termos com definição curta e longa (PT/EN)
data/brasilcard.js    # perguntas da vaga Brasil Card (PHP pleno)
data/research.js      # perguntas acrescentadas a partir de relatos reais
data/evidence.js      # fontes da pesquisa e vagas extras por pergunta
data/stories/         # histórias das perguntas: <id>.pt.md + <id>.en.md e index.js
labs/web/             # labs do navegador: index.js (textos) + código e história (story.pt.md, story.en.md) de cada lab
labs/node/            # labs para rodar com Node 22.13+
scripts/validate.mjs  # valida perguntas, rubricas, labs, histórias (pt + en) e glossário
```

Sem build e sem dependências para instalar: o site é HTML, CSS e JavaScript em módulos ES.

## Rodar localmente

```bash
python3 -m http.server 8000   # ou qualquer servidor estático
# abrir http://localhost:8000
node scripts/validate.mjs     # valida o banco de perguntas
```

## Adicionar uma pergunta

1. Inclua o objeto no arquivo do tema em `data/` (`id`, `cat`, `type`, `jobs`, `q`, `a`, `follow`, `flags`, `anchor` e, se for o caso, `code`), sempre com `pt` e `en`.
2. Inclua a rubrica com o mesmo `id` em `data/rubrics.js` (3+ pontos, ferramentas e métricas).
3. Opcional: escreva a história em `data/stories/<id>.pt.md` e `<id>.en.md` e inclua o id em `data/stories/index.js`.
4. Rode `node scripts/validate.mjs`. O CI roda a mesma validação em todo PR e publica no GitHub Pages a cada push na `main`.

---

## English

**Site:** https://acamilateixeira.github.io/DevTechnical/

A picky interviewer, as an app. It asks senior-level technical questions about the stack on my CV and [portfolio](https://acamilateixeira.github.io/camilat/), and about what my target roles require: Elastic (Senior Full Stack, Observability), BrainRocket (Senior Full Stack Node/React), and Senior React Frontend roles.

- **Interview**: one question at a time, weighted toward questions I have not answered or scored low on, with an optional 3-minute timer and a draft saved in the browser.
- **Model answer**: full explanation, code where needed, tools/libraries/techniques to mention, metrics that prove mastery, the interviewer's follow-ups, red flags, and how to anchor the answer in my real experience without inventing any.
- **Objective score**: each question has a checklist of points a 100% answer must cover. I tick only what I actually said: **≥ 80% correct, 40–79% partial, < 40% wrong**.
- **Progress**: average score and correct/partial/wrong percentages, overall and per topic, plus strongest and weakest topic.
- **Stories**: every lab and 28 questions have a funny dialogue-style story, in Portuguese and English, shown before the model answer and ending with the one-line interview answer (47 of 92 questions in total).
- **Study**: every question with search and filters by role, topic, and type.
- **Start here**: what a senior hiring process looks like and how to study with the app.
- **Lab**: 14 in-browser examples (editable code, Run button, counters, and a timeline showing what ran in each part of the system and when) plus 5 Node.js labs for the terminal ([`labs/node/README.md`](labs/node/README.md)).
- **Glossary**: 224 terms in plain language; the short definition appears in parentheses the first time a term shows up (toggle with "( ) definitions").
- **Is this really asked?**: questions marked **✓ reported** have public evidence (Glassdoor, TabNews, Elastic process guides) that they come up in real interviews; sources live in [`data/evidence.js`](data/evidence.js). There is also a dedicated set for the Brasil Card mid-level PHP role.

92 questions and 473 rubric points in Portuguese and English, including a second batch on the gaps between my CV and the target roles (GraphQL/Apollo, NestJS, MongoDB, Next.js, Docker/Kubernetes, Elasticsearch, OpenTelemetry). No build step, no dependencies, no backend: progress lives only in the browser's `localStorage`. Run it with any static server and validate the question bank with `node scripts/validate.mjs`.
