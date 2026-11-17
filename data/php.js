export default [
  {
    id: 'laravel-request-lifecycle',
    cat: 'php', type: 'lib', jobs: ['cv'],
    tags: ['Laravel', 'service container', 'Eloquent', 'queues', 'N+1', 'middleware'],
    q: {
      pt: 'Explique o ciclo de uma requisição no Laravel, o service container e como você evita problemas de performance com Eloquent.',
      en: 'Explain the Laravel request lifecycle, the service container, and how you avoid Eloquent performance problems.',
    },
    code: {
      src: `
// N+1 → eager loading
$trips = Trip::with(['requester:id,name', 'costCenter'])
    ->where('company_id', $companyId)
    ->latest()
    ->cursorPaginate(50);

// Em dev, falha alto quando houver lazy loading
Model::preventLazyLoading(! app()->isProduction());

// Lote grande sem estourar memória
Trip::where('status', 'pending')->chunkById(1000, function ($trips) {
    $trips->each(fn ($t) => ExpireTrip::dispatch($t->id)); // fila, não síncrono
});

// Binding de interface → implementação (DIP)
$this->app->bind(PaymentGateway::class, StripeGateway::class);`,
    },
    a: {
      pt: `**Ciclo**: \`public/index.php\` → bootstrap do app → **HTTP Kernel** carrega service providers e roda a pilha de middleware global → **Router** encontra a rota e roda o middleware de rota (auth, throttle) → **Form Request** valida e autoriza → controller (que deveria delegar a um service/action) → resposta passa de volta pelos middlewares → \`terminate\`.

**Service container**: o IoC do Laravel. Resolve dependências do construtor por reflexão (autowiring), permite \`bind\`/\`singleton\` de interfaces para implementações e é a base para trocar implementações em teste. **Service providers** registram e configuram esses bindings.

**Performance com Eloquent**:

- N+1: \`with()\`, \`load()\`, \`withCount()\` e \`preventLazyLoading()\` em dev.
- Selecionar só as colunas necessárias; \`chunkById\`/\`lazyById\`/\`cursor()\` para lotes grandes.
- Índices conferidos com \`EXPLAIN\`; Debugbar ou Telescope para ver queries por requisição.
- Trabalho pesado em **filas** (Horizon com Redis), com \`ShouldBeUnique\`, retries e backoff.
- Cache de config/rotas/views no deploy, OPcache, e Octane quando faz sentido.
- Transações (\`DB::transaction\`) com \`lockForUpdate()\` para concorrência.`,
      en: `**Lifecycle**: \`public/index.php\` → app bootstrap → the **HTTP Kernel** loads service providers and runs the global middleware stack → the **Router** matches the route and runs route middleware (auth, throttle) → a **Form Request** validates and authorizes → the controller (which should delegate to a service/action) → the response flows back through middleware → \`terminate\`.

**Service container**: Laravel's IoC. It resolves constructor dependencies via reflection (autowiring), supports \`bind\`/\`singleton\` from interfaces to implementations, and underpins swapping implementations in tests. **Service providers** register and configure those bindings.

**Eloquent performance**:

- N+1: \`with()\`, \`load()\`, \`withCount()\`, and \`preventLazyLoading()\` in dev.
- Select only the columns you need; \`chunkById\`/\`lazyById\`/\`cursor()\` for large batches.
- Indexes verified with \`EXPLAIN\`; Debugbar or Telescope to see queries per request.
- Heavy work in **queues** (Horizon with Redis), with \`ShouldBeUnique\`, retries, and backoff.
- Config/route/view caching on deploy, OPcache, and Octane when it fits.
- Transactions (\`DB::transaction\`) with \`lockForUpdate()\` for concurrency.`,
    },
    follow: [
      { pt: 'Qual a diferença entre `chunk` e `chunkById`? Por que `chunk` pode pular registros?', en: 'What is the difference between `chunk` and `chunkById`? Why can `chunk` skip records?' },
      { pt: 'Onde você coloca regra de negócio num projeto Laravel grande?', en: 'Where do you put business rules in a large Laravel project?' },
    ],
    flags: {
      pt: 'Controllers gordos com toda a regra e queries dentro. Ou não conhecer o N+1 do Eloquent sendo sua stack principal.',
      en: 'Fat controllers holding every rule and query. Or not knowing Eloquent N+1 when it is your main stack.',
    },
  },
  {
    id: 'salesforce-governor-limits',
    cat: 'php', type: 'lib', jobs: ['cv'],
    tags: ['Salesforce', 'Apex', 'governor limits', 'bulkification', 'triggers', 'LWC', 'integration'],
    q: {
      pt: 'Salesforce: o que são governor limits e como você escreve um trigger Apex que não quebra com carga em massa?',
      en: 'Salesforce: what are governor limits and how do you write an Apex trigger that does not break under bulk loads?',
    },
    code: {
      src: `
// ❌ SOQL dentro do loop: estoura o limite de 100 queries com 200 registros
trigger OpportunityTrigger on Opportunity (after update) {
    for (Opportunity o : Trigger.new) {
        Account a = [SELECT Id, Tier__c FROM Account WHERE Id = :o.AccountId];
    }
}

// ✅ Bulkificado: 1 query, 1 DML, lógica num handler
trigger OpportunityTrigger on Opportunity (after update) {
    OpportunityHandler.afterUpdate(Trigger.new, Trigger.oldMap);
}

public with sharing class OpportunityHandler {
    public static void afterUpdate(List<Opportunity> news, Map<Id, Opportunity> olds) {
        Set<Id> accountIds = new Set<Id>();
        for (Opportunity o : news) {
            if (o.StageName == 'Closed Won' && olds.get(o.Id).StageName != 'Closed Won') {
                accountIds.add(o.AccountId);
            }
        }
        if (accountIds.isEmpty()) return;
        List<Account> toUpdate = new List<Account>();
        for (Account a : [SELECT Id, Tier__c FROM Account WHERE Id IN :accountIds]) {
            a.Tier__c = 'Customer';
            toUpdate.add(a);
        }
        update toUpdate;
    }
}`,
    },
    a: {
      pt: `O Salesforce é multi-tenant, então impõe **governor limits** por transação para nenhum cliente monopolizar recursos: 100 queries SOQL (síncrono), 150 operações DML, 50 mil linhas retornadas, tempo de CPU de 10 s, limites de heap e de callouts.

Triggers recebem **até 200 registros por lote** (data loader, integrações, importações). Regras:

- **Bulkificar**: nunca SOQL ou DML dentro de loop. Coletar IDs num \`Set\`, uma query com \`IN\`, montar listas e fazer um DML.
- **Um trigger por objeto** delegando para uma classe handler (testável, ordem controlada) e só agir quando o campo relevante mudou (\`Trigger.oldMap\`).
- Evitar recursão (flags estáticas) e cuidar da ordem de execução com Flows.
- Processamento pesado em **Queueable/Batch Apex**; integrações com callout assíncrono, Platform Events ou MuleSoft.
- \`with sharing\` para respeitar permissões do usuário.
- Testes com cobertura mínima de 75% para deploy, testando com 200 registros.

O paralelo com back-end tradicional: é o mesmo problema do N+1, só que com punição imediata (exceção) em vez de lentidão.`,
      en: `Salesforce is multi-tenant, so it enforces per-transaction **governor limits** so no customer hogs resources: 100 SOQL queries (synchronous), 150 DML operations, 50,000 rows returned, 10 s of CPU time, plus heap and callout limits.

Triggers receive **up to 200 records per batch** (data loader, integrations, imports). Rules:

- **Bulkify**: never SOQL or DML inside a loop. Collect IDs into a \`Set\`, run one query with \`IN\`, build lists, and do one DML.
- **One trigger per object** delegating to a handler class (testable, controlled order), and act only when the relevant field changed (\`Trigger.oldMap\`).
- Prevent recursion (static flags) and mind the execution order with Flows.
- Heavy work in **Queueable/Batch Apex**; integrations via async callouts, Platform Events, or MuleSoft.
- \`with sharing\` to respect user permissions.
- Tests with the minimum 75% coverage required for deployment, testing with 200 records.

The parallel with traditional backends: it is the same N+1 problem, but punished immediately (an exception) instead of with slowness.`,
    },
    follow: [
      { pt: 'Quando você usa Flow em vez de Apex?', en: 'When do you use a Flow instead of Apex?' },
      { pt: 'Como você integrou Salesforce com o ERP? Síncrono ou assíncrono?', en: 'How did you integrate Salesforce with the ERP? Sync or async?' },
    ],
    flags: {
      pt: 'Não saber o que é bulkificação dizendo que trabalha com Apex e triggers.',
      en: 'Not knowing bulkification while claiming to work with Apex and triggers.',
    },
  },
];
