export default [
  {
    id: 'docker-node-multistage',
    cat: 'devops', type: 'code', jobs: ['sr-node-react', 'sr-observability', 'cv'],
    tags: ['Docker', 'Dockerfile', 'multi-stage', 'image size', 'non-root', 'layer cache'],
    q: {
      pt: 'Escreva um Dockerfile de produção para uma API Node com TypeScript. O que torna uma imagem boa: tamanho, segurança, cache de build?',
      en: 'Write a production Dockerfile for a TypeScript Node API. What makes an image good: size, security, build cache?',
    },
    code: {
      src: `
# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                                  # camada cacheada enquanto o lockfile não muda

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev   # remove devDependencies após compilar

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node                                   # nunca rodar como root
EXPOSE 3000
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]             # repassa SIGTERM e coleta zumbis
CMD ["node", "dist/main.js"]                # node direto, não "npm start"`,
    },
    a: {
      pt: `**Multi-stage build**: um estágio instala tudo e compila; o estágio final copia só o \`dist\` e as dependências de produção. A imagem final não leva compilador, código-fonte nem devDependencies, o que reduz tamanho e superfície de ataque.

**Cache de camadas**: copiar \`package.json\` + lockfile e rodar \`npm ci\` **antes** de copiar o código. Assim, mudar uma linha do código não reinstala dependências. Um \`.dockerignore\` (node_modules, .git, .env, testes) evita invalidar o cache e vazar segredos.

**Segurança**: imagem base pequena e fixada em versão (alpine, distroless ou \`-slim\`), \`USER node\` em vez de root, nada de segredo em \`ENV\` ou camada (usar secrets do orquestrador ou BuildKit \`--mount=type=secret\`), scan de vulnerabilidades (Trivy, Docker Scout) no CI.

**Runtime**: \`node\` direto ou via \`tini\` como PID 1, para o \`SIGTERM\` chegar ao processo e o graceful shutdown funcionar; \`npm start\` pode engolir o sinal. Healthcheck para o orquestrador saber se o container está vivo.

A mesma imagem, identificada pelo SHA do commit, é promovida de staging para produção; só a configuração muda (12-factor).`,
      en: `**Multi-stage build**: one stage installs everything and compiles; the final stage copies only \`dist\` and production dependencies. The final image carries no compiler, source, or devDependencies, which shrinks size and attack surface.

**Layer caching**: copy \`package.json\` + lockfile and run \`npm ci\` **before** copying the code. That way a one-line code change does not reinstall dependencies. A \`.dockerignore\` (node_modules, .git, .env, tests) avoids cache busting and leaking secrets.

**Security**: a small base image pinned to a version (alpine, distroless, or \`-slim\`), \`USER node\` instead of root, no secrets in \`ENV\` or layers (use orchestrator secrets or BuildKit \`--mount=type=secret\`), and vulnerability scanning (Trivy, Docker Scout) in CI.

**Runtime**: \`node\` directly or through \`tini\` as PID 1, so \`SIGTERM\` reaches the process and graceful shutdown works; \`npm start\` can swallow the signal. A healthcheck lets the orchestrator know the container is alive.

The same image, tagged with the commit SHA, is promoted from staging to production; only configuration changes (12-factor).`,
    },
    follow: [
      { pt: 'Alpine pode dar problema com dependências nativas. Por quê, e o que você usaria no lugar?', en: 'Alpine can cause trouble with native dependencies. Why, and what would you use instead?' },
      { pt: 'Como você rodaria a API, o MySQL, o Redis e o RabbitMQ localmente?', en: 'How would you run the API, MySQL, Redis, and RabbitMQ locally?' },
    ],
    flags: {
      pt: 'Imagem com `FROM node:latest`, rodando como root, com `.env` copiado para dentro. Ou `COPY . .` antes do `npm install`.',
      en: 'An image `FROM node:latest`, running as root, with `.env` copied inside. Or `COPY . .` before `npm install`.',
    },
    anchor: {
      pt: 'Docker aparece na Sicoob (deploy, Linux, investigação de incidentes) e no TripFlow (PHP 8.3 + MySQL + Redis + RabbitMQ em containers, com demo no Codespaces). Abra o Dockerfile e o compose do TripFlow antes da entrevista e explique as escolhas que estão lá.',
      en: 'Docker shows up at Sicoob (deployment, Linux, incident investigation) and in TripFlow (PHP 8.3 + MySQL + Redis + RabbitMQ in containers, with a Codespaces demo). Open TripFlow\'s Dockerfile and compose file before the interview and explain the choices in them.',
    },
  },
  {
    id: 'k8s-core-concepts',
    cat: 'devops', type: 'concept', jobs: ['sr-node-react', 'sr-observability'],
    tags: ['Kubernetes', 'pod', 'deployment', 'service', 'probes', 'HPA', 'requests and limits', 'rolling update'],
    q: {
      pt: 'Explique os objetos principais do Kubernetes e o que acontece num rolling update de uma API Node. Por que pods morrem com OOMKilled?',
      en: 'Explain Kubernetes\' core objects and what happens during a rolling update of a Node API. Why do pods die with OOMKilled?',
    },
    code: {
      src: `
apiVersion: apps/v1
kind: Deployment
metadata: { name: trips-api }
spec:
  replicas: 3
  strategy:
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }   # sobe 1 novo antes de derrubar 1 velho
  selector: { matchLabels: { app: trips-api } }
  template:
    metadata: { labels: { app: trips-api } }
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: ghcr.io/acme/trips-api:3f2c1ab              # SHA, nunca :latest
          ports: [{ containerPort: 3000 }]
          envFrom: [{ configMapRef: { name: trips-config } }, { secretRef: { name: trips-secrets } }]
          resources:
            requests: { cpu: 250m, memory: 256Mi }           # usado pelo scheduler
            limits:   { memory: 512Mi }                      # passou disso → OOMKilled
          readinessProbe: { httpGet: { path: /ready, port: 3000 }, periodSeconds: 5 }
          livenessProbe:  { httpGet: { path: /health, port: 3000 }, initialDelaySeconds: 15 }`,
    },
    a: {
      pt: `- **Pod**: a menor unidade; um ou mais containers que compartilham rede e volumes. É efêmero.
- **Deployment**: declara quantas réplicas de um pod devem existir e como atualizá-las; gerencia ReplicaSets.
- **Service**: IP e DNS estáveis que balanceiam entre os pods saudáveis (selecionados por label). **Ingress**/Gateway expõe HTTP para fora.
- **ConfigMap/Secret**: configuração separada da imagem.
- **HPA**: escala réplicas por CPU, memória ou métrica customizada (ex.: tamanho da fila).
- StatefulSet para bancos e brokers; Job/CronJob para tarefas.

**Rolling update**: o Deployment cria pods da versão nova; cada um só recebe tráfego quando a **readiness probe** passa; então um pod antigo recebe \`SIGTERM\`, sai do Service, termina as requisições e encerra. Com \`maxUnavailable: 0\` a capacidade nunca cai. Se a nova versão não fica pronta, o rollout trava e \`kubectl rollout undo\` volta.

**Liveness vs readiness**: readiness diz "posso receber tráfego"; liveness diz "estou travado, me reinicie". Liveness que checa o banco é armadilha: se o banco cai, todos os pods reiniciam em loop.

**OOMKilled**: o container passou do \`limits.memory\` e o kernel matou o processo. Em Node, o heap do V8 não respeita o limite do container por padrão em versões antigas: ajustar \`--max-old-space-size\` abaixo do limite, investigar vazamento e dimensionar \`requests\` de forma realista. Limite de CPU causa **throttling** (lentidão), não morte.`,
      en: `- **Pod**: the smallest unit; one or more containers sharing network and volumes. It is ephemeral.
- **Deployment**: declares how many replicas of a pod should exist and how to update them; it manages ReplicaSets.
- **Service**: a stable IP and DNS name load-balancing across healthy pods (selected by label). **Ingress**/Gateway exposes HTTP externally.
- **ConfigMap/Secret**: configuration kept out of the image.
- **HPA**: scales replicas by CPU, memory, or a custom metric (e.g. queue depth).
- StatefulSet for databases and brokers; Job/CronJob for tasks.

**Rolling update**: the Deployment creates new-version pods; each one receives traffic only once its **readiness probe** passes; then an old pod gets \`SIGTERM\`, leaves the Service, drains requests, and exits. With \`maxUnavailable: 0\` capacity never drops. If the new version never becomes ready, the rollout stalls and \`kubectl rollout undo\` rolls back.

**Liveness vs readiness**: readiness says "I can take traffic"; liveness says "I am stuck, restart me". A liveness probe that checks the database is a trap: if the database goes down, every pod restarts in a loop.

**OOMKilled**: the container exceeded \`limits.memory\` and the kernel killed the process. In Node, older V8 versions do not size the heap to the container limit by default: set \`--max-old-space-size\` below the limit, look for leaks, and size \`requests\` realistically. A CPU limit causes **throttling** (slowness), not death.`,
    },
    follow: [
      { pt: 'Como você faria uma migration de banco junto com um rolling update?', en: 'How would you run a database migration alongside a rolling update?' },
      { pt: 'Como escalaria consumidores de fila no Kubernetes? (KEDA)', en: 'How would you scale queue consumers in Kubernetes? (KEDA)' },
    ],
    flags: {
      pt: 'Dizer que tem experiência com Kubernetes em produção sem ter. Muitas vagas listam K8s como "nice to have": conceito sólido + honestidade bastam.',
      en: 'Claiming production Kubernetes experience you do not have. Many roles list K8s as a nice-to-have: solid concepts plus honesty are enough.',
    },
    anchor: {
      pt: 'Kubernetes não está no seu CV. Ponte honesta: você já fez deploy com Docker e GitLab CI na Sicoob e trabalha com AWS e Azure. O PulseOps e o portfolio-infra são o lugar natural para praticar (por exemplo, k3s numa VM do Oracle Cloud Always Free). Diga só o que já tiver feito de fato.',
      en: 'Kubernetes is not on your CV. Honest bridge: you have deployed with Docker and GitLab CI at Sicoob and work with AWS and Azure. PulseOps and portfolio-infra are the natural place to practice (e.g. k3s on an Oracle Cloud Always Free VM). Only claim what you have actually done.',
    },
  },
];
