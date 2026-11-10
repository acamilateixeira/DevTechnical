export default [
  {
    id: 'test-pyramid-strategy',
    cat: 'testing', type: 'concept', jobs: ['elastic', 'brainrocket', 'frontend', 'cv'],
    tags: ['test pyramid', 'unit', 'integration', 'e2e', 'testing trophy', 'mocks', 'flaky'],
    q: {
      pt: 'Qual sua estratégia de testes numa aplicação full stack? O que você mocka e o que não mocka?',
      en: 'What is your testing strategy for a full stack application? What do you mock and what do you not mock?',
    },
    a: {
      pt: `Penso em **confiança por custo**, não em percentual de cobertura.

- **Unitários** para regras de domínio puras (cálculos, máquinas de estado, validações): rápidos, muitos, sem mock porque a regra não tem I/O.
- **Integração** é onde está a maior parte do valor no back-end: endpoint + banco real (Testcontainers ou banco de teste em transação) + filas. Pegam erro de SQL, migration, serialização e transação, que mocks escondem.
- **Componentes** no front com React Testing Library: testar como o usuário usa (\`getByRole\`, \`userEvent\`), não detalhes de implementação. MSW para simular a API na camada de rede.
- **E2E** com Playwright só para os fluxos críticos (login, checkout, aprovação), porque são caros e mais instáveis.
- **Contrato** (Pact) quando há serviços de times diferentes.

**O que mocko**: o que não controlo e é lento ou não determinístico (APIs de terceiros, e-mail, relógio, aleatoriedade). **O que não mocko**: meu próprio banco e meu próprio código interno, porque mock demais testa o mock e quebra a cada refatoração.

Testes instáveis (flaky) são bug: quarentena, investigação e correção, nunca "roda de novo até passar". Cobertura serve para achar áreas sem teste, não como meta.`,
      en: `I think in terms of **confidence per cost**, not coverage percentage.

- **Unit tests** for pure domain rules (calculations, state machines, validation): fast, numerous, no mocks because the rule has no I/O.
- **Integration tests** are where most backend value lives: endpoint + real database (Testcontainers or a test database in a transaction) + queues. They catch SQL, migration, serialization, and transaction bugs that mocks hide.
- **Component tests** on the frontend with React Testing Library: test how users use it (\`getByRole\`, \`userEvent\`), not implementation details. MSW to fake the API at the network layer.
- **E2E** with Playwright only for critical flows (login, checkout, approval), because they are expensive and flakier.
- **Contract tests** (Pact) when services belong to different teams.

**What I mock**: what I do not control and what is slow or nondeterministic (third-party APIs, email, the clock, randomness). **What I do not mock**: my own database and my own internal code, because over-mocking tests the mock and breaks on every refactor.

Flaky tests are bugs: quarantine, investigate, and fix them, never "rerun until green". Coverage helps find untested areas; it is not a target.`,
    },
    follow: [
      { pt: 'Como você testaria uma condição de corrida?', en: 'How would you test a race condition?' },
      { pt: 'TDD: você pratica? Quando faz sentido e quando não?', en: 'TDD: do you practice it? When does it make sense and when not?' },
    ],
    flags: {
      pt: '"Exijo 100% de cobertura." Ou testar o estado interno do componente em vez do comportamento.',
      en: '"I require 100% coverage." Or testing a component\'s internal state instead of its behavior.',
    },
    anchor: {
      pt: 'Evidências reais: PHPUnit e Jest na Sicoob; Vitest + Vue Test Utils no portfólio; testes de políticas e migrações no PostgreSQL no Bora; testes de isolamento entre tenants no TripFlow; race detector do Go no CI do GEMP; demo contra o servidor rodando no CI do MeterTrail. É um portfólio de testes forte: use.',
      en: 'Real evidence: PHPUnit and Jest at Sicoob; Vitest + Vue Test Utils in your portfolio; PostgreSQL policy and migration tests in Bora; tenant isolation tests in TripFlow; Go race detector in GEMP\'s CI; a demo against the running server in MeterTrail\'s CI. That is a strong testing portfolio: use it.',
    },
  },
  {
    id: 'test-tdd-code',
    cat: 'testing', type: 'code', jobs: ['brainrocket', 'elastic'],
    tags: ['TDD', 'red green refactor', 'Jest', 'Vitest', 'unit test'],
    q: {
      pt: 'Faça ao vivo, em TDD, uma função que valida se uma viagem pode ser aprovada (orçamento e limite do aprovador). Narre os passos.',
      en: 'Live, using TDD, write a function that checks whether a trip can be approved (budget and approver limit). Narrate the steps.',
    },
    code: {
      src: `
// 1) RED: o teste mais simples que falha
describe('canApprove', () => {
  it('approves when cost fits budget and approver limit', () => {
    expect(canApprove({ costCents: 500, budgetCents: 1000, approverLimitCents: 800 }))
      .toEqual({ ok: true });
  });

  it('rejects when cost exceeds remaining budget', () => {
    expect(canApprove({ costCents: 1200, budgetCents: 1000, approverLimitCents: 5000 }))
      .toEqual({ ok: false, reason: 'BUDGET_EXCEEDED' });
  });

  it('rejects when cost exceeds approver limit', () => {
    expect(canApprove({ costCents: 900, budgetCents: 1000, approverLimitCents: 800 }))
      .toEqual({ ok: false, reason: 'APPROVER_LIMIT' });
  });

  it.each([0, -1])('rejects non-positive cost %i', (costCents) => {
    expect(canApprove({ costCents, budgetCents: 1000, approverLimitCents: 800 }).ok).toBe(false);
  });
});

// 2) GREEN: o mínimo para passar   3) REFACTOR: nomes, union de resultado
type Decision = { ok: true } | { ok: false; reason: 'INVALID_COST' | 'BUDGET_EXCEEDED' | 'APPROVER_LIMIT' };

export function canApprove(i: { costCents: number; budgetCents: number; approverLimitCents: number }): Decision {
  if (!Number.isInteger(i.costCents) || i.costCents <= 0) return { ok: false, reason: 'INVALID_COST' };
  if (i.costCents > i.budgetCents) return { ok: false, reason: 'BUDGET_EXCEEDED' };
  if (i.costCents > i.approverLimitCents) return { ok: false, reason: 'APPROVER_LIMIT' };
  return { ok: true };
}`,
    },
    a: {
      pt: `Ciclo **Red → Green → Refactor**:

1. **Red**: escrevo o teste do caso mais simples e vejo falhar (prova que o teste testa algo).
2. **Green**: escrevo o mínimo de código para passar, mesmo que ingênuo.
3. **Refactor**: com o teste verde, melhoro nomes e estrutura sem mudar comportamento.
4. Repito com o próximo caso: orçamento estourado, limite do aprovador, e os casos de borda (zero, negativo, igual ao limite).

Enquanto narro, mostro as decisões: dinheiro em centavos inteiros, resultado como union discriminada com **motivo** (a UI precisa explicar a recusa), ordem das validações e o que acontece no limite exato (\`<=\` vs \`<\`), que eu perguntaria ao entrevistador como faria ao PO.

TDD funciona muito bem para regras de negócio e correção de bugs (primeiro o teste que reproduz o bug). É menos útil em exploração de UI ou spikes, onde eu escrevo os testes depois que o design estabiliza.`,
      en: `The **Red → Green → Refactor** cycle:

1. **Red**: write the test for the simplest case and watch it fail (proves the test tests something).
2. **Green**: write the minimum code to pass, even if naive.
3. **Refactor**: with the test green, improve names and structure without changing behavior.
4. Repeat with the next case: budget exceeded, approver limit, and edge cases (zero, negative, exactly at the limit).

While narrating, I surface decisions: money as integer cents, the result as a discriminated union with a **reason** (the UI must explain the rejection), validation order, and what happens exactly at the limit (\`<=\` vs \`<\`), which I would ask the interviewer just as I would ask the PO.

TDD works very well for business rules and bug fixes (first the test that reproduces the bug). It is less useful for UI exploration or spikes, where I write tests once the design settles.`,
    },
    follow: [
      { pt: 'Como você faria esse teste se o orçamento viesse do banco?', en: 'How would you test this if the budget came from the database?' },
      { pt: 'O que é property-based testing e onde usaria?', en: 'What is property-based testing and where would you use it?' },
    ],
    flags: {
      pt: 'Escrever todo o código e depois os testes dizendo que é TDD. Ou não perguntar sobre o caso de borda do limite exato.',
      en: 'Writing all the code first and then the tests while calling it TDD. Or not asking about the exact-limit edge case.',
    },
    anchor: {
      pt: 'A regra é parecida com a do TripFlow (orçamento do centro de custo na aprovação). Diga se você escreveu esses testes antes ou depois do código: honestidade aqui é sinal de maturidade.',
      en: 'The rule mirrors TripFlow (cost-center budget on approval). Say whether you wrote those tests before or after the code: honesty here signals maturity.',
    },
  },
  {
    id: 'cicd-pipeline',
    cat: 'testing', type: 'lib', jobs: ['elastic', 'brainrocket', 'cv'],
    tags: ['CI/CD', 'GitHub Actions', 'GitLab CI', 'Docker', 'feature flags', 'canary', 'blue-green'],
    q: {
      pt: 'Desenhe o pipeline de CI/CD ideal para um serviço Node + React. Como você faz deploy sem medo numa sexta-feira?',
      en: 'Design the ideal CI/CD pipeline for a Node + React service. How do you deploy on a Friday without fear?',
    },
    a: {
      pt: `**CI em cada PR** (rápido, < 10 min): install com cache → lint + typecheck → testes unitários e de integração (banco em container) → build → scan de dependências e segredos (Dependabot, CodeQL, gitleaks) → preview deploy do front. Branch protegida: PR só entra com CI verde e review.

**CD na main**: build de uma **imagem imutável** (Docker, tag = SHA do commit) que é **promovida** entre ambientes, nunca reconstruída → migrations compatíveis com a versão anterior (expand/contract) → deploy em staging com smoke e E2E dos fluxos críticos → produção.

Deploy sem medo vem de **reduzir o raio de explosão e o tempo de recuperação**:

- Deploys pequenos e frequentes.
- **Feature flags**: separar deploy de release; ligar para 1% dos usuários, desligar sem deploy.
- **Canary** ou blue-green com rollback automático baseado em métricas (taxa de erro, p99).
- Observabilidade por versão e alertas por SLO.
- Rollback ensaiado, em um clique.

As métricas DORA medem isso: frequência de deploy, lead time de mudança, taxa de falha de mudança e tempo de recuperação.`,
      en: `**CI on every PR** (fast, < 10 min): cached install → lint + typecheck → unit and integration tests (database in a container) → build → dependency and secret scanning (Dependabot, CodeQL, gitleaks) → frontend preview deploy. Protected branch: a PR merges only with green CI and a review.

**CD on main**: build an **immutable image** (Docker, tagged with the commit SHA) that is **promoted** across environments, never rebuilt → migrations compatible with the previous version (expand/contract) → deploy to staging with smoke and E2E tests on critical flows → production.

Fearless deploys come from **shrinking blast radius and recovery time**:

- Small, frequent deploys.
- **Feature flags**: decouple deploy from release; enable for 1% of users, turn off without a deploy.
- **Canary** or blue-green with automatic rollback based on metrics (error rate, p99).
- Per-version observability and SLO-based alerts.
- A rehearsed, one-click rollback.

DORA metrics measure exactly this: deploy frequency, lead time for changes, change failure rate, and time to restore.`,
    },
    follow: [
      { pt: 'Como você faz uma migration que remove uma coluna sem downtime?', en: 'How do you run a migration that drops a column without downtime?' },
      { pt: 'Onde ficam os segredos no pipeline?', en: 'Where do secrets live in the pipeline?' },
    ],
    flags: {
      pt: '"Não faço deploy na sexta." É compreensível, mas o sênior ataca a causa: deploy arriscado demais.',
      en: '"I do not deploy on Fridays." Understandable, but a senior attacks the cause: deploys that are too risky.',
    },
    anchor: {
      pt: 'GitLab CI/CD e Docker na Sicoob. No portfólio: workflows de CI, deploy no GitHub Pages, validação de PR, revisão por IA e Dependabot. GEMP e MeterTrail rodam testes no GitHub Actions. O próprio DevTechnical tem pipeline de validação + deploy. Fale do que montou, não de teoria.',
      en: 'GitLab CI/CD and Docker at Sicoob. In your portfolio: CI workflows, GitHub Pages deploys, PR validation, AI review, and Dependabot. GEMP and MeterTrail run tests on GitHub Actions. DevTechnical itself has a validation + deploy pipeline. Talk about what you built, not theory.',
    },
  },
];
