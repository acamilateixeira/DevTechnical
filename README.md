# DevTechnical

> 🇧🇷 Simulador de entrevista técnica sênior, bilíngue (PT/EN) · 🇬🇧 [English below](#english)

**Site:** https://acamilateixeira.github.io/DevTechnical/

Um recrutador chato, em forma de app. Ele faz perguntas técnicas de nível sênior sobre a stack que aparece no meu currículo e no [portfólio](https://acamilateixeira.github.io/camilat/), e sobre o que as vagas-alvo pedem: Elastic (Senior Full Stack, Observability), BrainRocket (Senior Full Stack Node/React) e vagas de Frontend Sênior em React.

## Como funciona

- **Entrevista**: uma pergunta por vez, sorteada com prioridade para as que eu ainda não respondi ou em que tirei nota baixa. Respondo em voz alta ou escrevo (o rascunho fica no navegador), com cronômetro opcional de 3 minutos.
- **Resposta modelo**: explicação completa, código quando a pergunta pede, ferramentas/libs/técnicas para citar, métricas que provam domínio, follow-ups que o recrutador faria, red flags (o que não dizer) e como ancorar a resposta na minha experiência real, sem inventar.
- **Nota objetiva**: cada pergunta tem um checklist com os pontos que uma resposta 100% precisa cobrir. Marco só o que eu realmente disse e a nota sai daí: **≥ 80% acerto, 40–79% parcial, < 40% erro**.
- **Progresso**: nota média, % de acerto/parcial/erro no geral e por tema, tema mais forte e tema para estudar primeiro.
- **Estudo**: todas as perguntas com busca e filtros por vaga, tema e tipo.

O progresso fica só no `localStorage` do navegador; não há back-end nem coleta de dados.

## Conteúdo

49 perguntas e 251 pontos de rubrica, todos em português e inglês:

| Tema | Exemplos |
| --- | --- |
| JavaScript & TypeScript | event loop, `unknown`/`never`, generics, closures |
| React & Next.js | reconciliação e keys, `useEffect`, performance, estado, acessibilidade, SSR/RSC |
| Node.js & NestJS | event loop bloqueado, streams e backpressure, graceful shutdown, DI no Nest |
| APIs | REST vs GraphQL, N+1 e DataLoader, idempotência, WebSockets, paginação e compatibilidade |
| Dados | isolamento e locks, índices e `EXPLAIN`, MongoDB vs SQL, padrões de cache com Redis |
| Mensageria | outbox, RabbitMQ vs Kafka |
| Arquitetura | monolito vs microsserviços, resiliência, system design de ingestão de logs, multi-tenancy |
| Princípios | SOLID, DDD, Clean Code em code review, design patterns |
| Testes & CI/CD | estratégia, TDD ao vivo, pipeline e deploy seguro |
| Observabilidade | logs/métricas/traces, SLO e alertas, React Flow |
| Segurança | OWASP, autenticação (JWT, OAuth/OIDC, PKCE) |
| PHP & Laravel / Salesforce | ciclo do Laravel e Eloquent, governor limits no Apex |
| Scrum & comportamental | Scrum e estimativa, incidente (STAR), discordância técnica, IA, "por que sênior?" |

## Estrutura

```
index.html            # casca da página
assets/app.js         # modos entrevista, estudo e progresso; nota e persistência
assets/md.js          # markdown mínimo que escapa HTML
assets/styles.css     # tema claro/escuro, responsivo
data/meta.js          # vagas, temas, tipos e textos da interface (PT/EN)
data/<tema>.js        # perguntas por tema
data/rubrics.js       # checklist, ferramentas e métricas por pergunta
scripts/validate.mjs  # valida o banco (campos bilíngues, ids, rubricas)
```

Sem build e sem dependências: o site é HTML, CSS e JavaScript em módulos ES.

## Rodar localmente

```bash
python3 -m http.server 8000   # ou qualquer servidor estático
# abrir http://localhost:8000
node scripts/validate.mjs     # valida o banco de perguntas
```

## Adicionar uma pergunta

1. Inclua o objeto no arquivo do tema em `data/` (`id`, `cat`, `type`, `jobs`, `q`, `a`, `follow`, `flags`, `anchor` e, se for o caso, `code`), sempre com `pt` e `en`.
2. Inclua a rubrica com o mesmo `id` em `data/rubrics.js` (3+ pontos, ferramentas e métricas).
3. Rode `node scripts/validate.mjs`. O CI roda a mesma validação em todo PR e publica no GitHub Pages a cada push na `main`.

---

## English

**Site:** https://acamilateixeira.github.io/DevTechnical/

A picky interviewer, as an app. It asks senior-level technical questions about the stack on my CV and [portfolio](https://acamilateixeira.github.io/camilat/), and about what my target roles require: Elastic (Senior Full Stack, Observability), BrainRocket (Senior Full Stack Node/React), and Senior React Frontend roles.

- **Interview**: one question at a time, weighted toward questions I have not answered or scored low on, with an optional 3-minute timer and a draft saved in the browser.
- **Model answer**: full explanation, code where needed, tools/libraries/techniques to mention, metrics that prove mastery, the interviewer's follow-ups, red flags, and how to anchor the answer in my real experience without inventing any.
- **Objective score**: each question has a checklist of points a 100% answer must cover. I tick only what I actually said: **≥ 80% correct, 40–79% partial, < 40% wrong**.
- **Progress**: average score and correct/partial/wrong percentages, overall and per topic, plus strongest and weakest topic.
- **Study**: every question with search and filters by role, topic, and type.

49 questions and 251 rubric points in Portuguese and English. No build step, no dependencies, no backend: progress lives only in the browser's `localStorage`. Run it with any static server and validate the question bank with `node scripts/validate.mjs`.
