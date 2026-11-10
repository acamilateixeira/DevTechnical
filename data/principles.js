export default [
  {
    id: 'solid-all-five',
    cat: 'principles', type: 'code', jobs: ['elastic', 'brainrocket', 'frontend', 'cv'],
    tags: ['SOLID', 'SRP', 'OCP', 'LSP', 'ISP', 'DIP'],
    q: {
      pt: 'Explique os cinco princípios SOLID com um exemplo real para cada um. Não vale a definição de livro.',
      en: 'Explain all five SOLID principles with a real example for each. Textbook definitions do not count.',
    },
    code: {
      label: { pt: 'Um exemplo que cobre SRP, OCP e DIP de uma vez', en: 'One example covering SRP, OCP, and DIP at once' },
      src: `
// OCP + DIP: novas formas de notificar sem tocar no caso de uso
interface Notifier {
  notify(to: User, message: string): Promise<void>;
}
class EmailNotifier implements Notifier { /* SMTP */ }
class SlackNotifier implements Notifier { /* webhook */ }

// SRP: só coordena a aprovação; não sabe de SQL, HTTP ou e-mail
class ApproveTrip {
  constructor(
    private readonly trips: TripRepository,   // abstração (DIP)
    private readonly notifiers: Notifier[],   // extensível (OCP)
  ) {}

  async execute(tripId: string, approver: User) {
    const trip = await this.trips.byId(tripId);
    trip.approve(approver);                   // regra mora na entidade
    await this.trips.save(trip);
    await Promise.all(this.notifiers.map((n) => n.notify(trip.requester, 'Trip approved')));
  }
}

// LSP violado: quem usa ReadonlyRepository espera que save() funcione
class CachedTripRepository implements TripRepository {
  save(): Promise<void> { throw new Error('not supported'); } // ❌ quebra o contrato
}`,
    },
    a: {
      pt: `- **S, Single Responsibility**: um módulo deve ter **um motivo para mudar**, ou seja, responder a um ator do negócio. Um controller que valida, calcula imposto, grava e manda e-mail muda por quatro motivos. Separo em validação, caso de uso, repositório e notificação.
- **O, Open/Closed**: aberto para extensão, fechado para modificação. Adicionar um novo meio de pagamento ou de notificação deveria ser uma nova classe que implementa a interface, não mais um \`else if\` num método de 300 linhas.
- **L, Liskov Substitution**: um subtipo precisa honrar o contrato do tipo base. O exemplo clássico é \`Quadrado extends Retângulo\`; o real é uma implementação que lança "não suportado" num método da interface, ou que exige pré-condições mais fortes.
- **I, Interface Segregation**: clientes não devem depender de métodos que não usam. Em vez de um \`UserService\` gigante, interfaces pequenas por papel (\`UserReader\`, \`PasswordResetter\`). Em React, props enxutas em vez de passar o objeto inteiro.
- **D, Dependency Inversion**: módulos de alto nível (regras) dependem de abstrações, não de detalhes (banco, framework, API). Isso permite testar o caso de uso com um repositório em memória e trocar o provedor sem tocar na regra.

O ponto sênior: SOLID é uma ferramenta contra acoplamento, não uma regra para criar interface para tudo. Abstração sem segunda implementação nem necessidade de teste é custo.`,
      en: `- **S, Single Responsibility**: a module should have **one reason to change**, meaning it answers to one business actor. A controller that validates, calculates tax, saves, and sends email changes for four reasons. I split it into validation, use case, repository, and notification.
- **O, Open/Closed**: open for extension, closed for modification. Adding a new payment or notification method should be a new class implementing the interface, not another \`else if\` in a 300-line method.
- **L, Liskov Substitution**: a subtype must honor the base type's contract. The classic example is \`Square extends Rectangle\`; the real one is an implementation throwing "not supported" for an interface method, or demanding stronger preconditions.
- **I, Interface Segregation**: clients should not depend on methods they do not use. Instead of a giant \`UserService\`, small role interfaces (\`UserReader\`, \`PasswordResetter\`). In React, lean props instead of passing the whole object.
- **D, Dependency Inversion**: high-level modules (rules) depend on abstractions, not details (database, framework, API). That lets you test the use case with an in-memory repository and swap the provider without touching the rule.

The senior point: SOLID is a tool against coupling, not a rule to add an interface for everything. An abstraction with no second implementation and no testing need is pure cost.`,
    },
    follow: [
      { pt: 'Me dê um exemplo em que aplicar SOLID à risca piorou o código.', en: 'Give me an example where following SOLID strictly made the code worse.' },
      { pt: 'Qual a diferença entre Dependency Inversion e Dependency Injection?', en: 'What is the difference between Dependency Inversion and Dependency Injection?' },
    ],
    flags: {
      pt: 'Recitar as siglas sem exemplo. Ou dizer que SRP é "uma classe deve fazer uma coisa só" (é sobre motivo de mudança).',
      en: 'Reciting the acronyms without examples. Or saying SRP means "a class should do only one thing" (it is about reasons to change).',
    },
    anchor: {
      pt: 'Seu CV da Sicoob diz que você aplicou SOLID e código modular com PHPUnit e Jest. O GEMP tem a interface `Provider` separando a comparação da origem das ofertas: isso é DIP + OCP em produção de portfólio. Tenha um "antes e depois" de refatoração de legado pronto.',
      en: 'Your Sicoob CV says you applied SOLID and modular code with PHPUnit and Jest. GEMP has a `Provider` interface separating comparison from where offers come from: DIP + OCP in a portfolio project. Have a legacy refactoring "before and after" ready.',
    },
  },
  {
    id: 'ddd-core-concepts',
    cat: 'principles', type: 'concept', jobs: ['brainrocket', 'elastic', 'cv'],
    tags: ['DDD', 'bounded context', 'aggregate', 'ubiquitous language', 'value object', 'domain events'],
    q: {
      pt: 'O que é DDD na prática? Explique bounded context, agregado, value object, linguagem ubíqua e eventos de domínio.',
      en: 'What is DDD in practice? Explain bounded context, aggregate, value object, ubiquitous language, and domain events.',
    },
    code: {
      src: `
// Value object: imutável, comparado por valor, valida a si mesmo
class Money {
  private constructor(readonly cents: number, readonly currency: 'BRL' | 'EUR') {
    if (!Number.isInteger(cents) || cents < 0) throw new Error('invalid amount');
  }
  static of(cents: number, currency: 'BRL' | 'EUR') { return new Money(cents, currency); }
  add(o: Money) {
    if (o.currency !== this.currency) throw new Error('currency mismatch');
    return new Money(this.cents + o.cents, this.currency);
  }
}

// Agregado: Trip é a raiz; ninguém muda o status por fora
class Trip {
  private events: DomainEvent[] = [];
  private constructor(readonly id: string, private status: 'PENDING' | 'APPROVED' | 'REJECTED',
                      readonly cost: Money) {}

  approve(by: Approver) {
    if (this.status !== 'PENDING') throw new DomainError('Only pending trips can be approved');
    if (!by.canApprove(this.cost)) throw new DomainError('Approval limit exceeded');
    this.status = 'APPROVED';
    this.events.push(new TripApproved(this.id, by.id));
  }
  pullEvents() { const e = this.events; this.events = []; return e; }
}`,
    },
    a: {
      pt: `DDD é focar o design no **domínio de negócio** e na colaboração com especialistas. Tem uma parte estratégica e uma tática.

**Estratégico**

- **Linguagem ubíqua**: os mesmos termos na conversa com o negócio, no código, nos testes e no banco. Se o negócio diz "solicitação" e "atribuição", o código não deveria dizer \`Order\` e \`Job\`.
- **Bounded context**: fronteira onde um modelo e sua linguagem são consistentes. "Cliente" em Vendas (lead, oportunidade) não é o mesmo "Cliente" em Faturamento (CNPJ, impostos). Cada contexto tem seu modelo; a integração usa tradução (anti-corruption layer).
- **Context map**: como os contextos se relacionam (cliente-fornecedor, conformista, ACL).

**Tático**

- **Entidade**: tem identidade que persiste no tempo.
- **Value object**: definido pelos valores, imutável (Money, Email, Período). Elimina obsessão por primitivos.
- **Agregado**: grupo de objetos com uma **raiz** que garante as invariantes; é a unidade de consistência transacional. Referencie outros agregados por ID e mantenha-os pequenos.
- **Eventos de domínio**: fatos que aconteceram (\`TripApproved\`), usados para desacoplar efeitos colaterais e integrar contextos.
- **Repositório**: persistência por agregado.

DDD vale para domínios complexos. Para um CRUD simples é cerimônia demais.`,
      en: `DDD means centering design on the **business domain** and collaborating with domain experts. It has a strategic part and a tactical part.

**Strategic**

- **Ubiquitous language**: the same terms in conversations with the business, in code, tests, and the database. If the business says "request" and "assignment", the code should not say \`Order\` and \`Job\`.
- **Bounded context**: a boundary within which a model and its language stay consistent. "Customer" in Sales (lead, opportunity) is not the same "Customer" in Billing (tax ID, taxes). Each context owns its model; integration translates (anti-corruption layer).
- **Context map**: how contexts relate (customer-supplier, conformist, ACL).

**Tactical**

- **Entity**: has an identity that persists over time.
- **Value object**: defined by its values, immutable (Money, Email, DateRange). Kills primitive obsession.
- **Aggregate**: a cluster of objects with a **root** that enforces invariants; it is the unit of transactional consistency. Reference other aggregates by ID and keep them small.
- **Domain events**: facts that happened (\`TripApproved\`), used to decouple side effects and integrate contexts.
- **Repository**: persistence per aggregate.

DDD pays off in complex domains. For a simple CRUD it is too much ceremony.`,
    },
    follow: [
      { pt: 'Qual a diferença entre evento de domínio e evento de integração?', en: 'What is the difference between a domain event and an integration event?' },
      { pt: 'Como você descobre os bounded contexts de um sistema legado?', en: 'How do you discover the bounded contexts of a legacy system?' },
    ],
    flags: {
      pt: '"DDD é organizar pastas em domain/application/infra." Isso é estrutura, não design orientado a domínio.',
      en: '"DDD is organizing folders into domain/application/infra." That is structure, not domain-driven design.',
    },
    anchor: {
      pt: 'O Bora tem um exemplo perfeito de modelagem de domínio: você separou **solicitação** de **atribuição** (o solicitante e o trajeto ficam com a solicitação mesmo quando muda o motorista) e **vínculo operacional** de **presença** (aprovado e offline são coisas diferentes). Integração Salesforce ↔ ERP é bounded context com tradução na prática.',
      en: 'Bora has a perfect domain-modeling example: you separated **request** from **assignment** (requester and route stay with the request when the driver changes) and **operational membership** from **presence** (approved and offline are different things). Salesforce ↔ ERP integration is bounded contexts with translation in practice.',
    },
  },
  {
    id: 'clean-code-review',
    cat: 'principles', type: 'code', jobs: ['elastic', 'brainrocket', 'frontend'],
    tags: ['Clean Code', 'code review', 'refactoring', 'naming', 'code smells'],
    q: {
      pt: 'Faça o code review deste trecho como faria num PR de um colega júnior. O que você comenta e como?',
      en: 'Review this snippet as you would on a junior colleague\'s PR. What do you comment on, and how?',
    },
    code: [
      {
        label: { pt: 'PR do colega', en: "Colleague's PR" },
        src: `
async function proc(d: any) {
  let r = [];
  for (let i = 0; i < d.length; i++) {
    if (d[i].s == 1 && d[i].v > 0) {
      if (d[i].t == 'A') {
        r.push({ ...d[i], v: d[i].v * 0.9 });
      } else {
        r.push({ ...d[i], v: d[i].v * 0.95 });
      }
    }
  }
  await fetch('https://api.x.com/save', { method: 'POST', body: JSON.stringify(r) });
  return r;
}`,
      },
      {
        label: { pt: 'Depois do refactor', en: 'After refactoring' },
        src: `
const DISCOUNT_BY_TIER = { A: 0.10, B: 0.05 } as const;

type Order = { status: OrderStatus; valueCents: number; tier: keyof typeof DISCOUNT_BY_TIER };

export function applyTierDiscounts(orders: readonly Order[]): Order[] {
  return orders
    .filter((o) => o.status === OrderStatus.Active && o.valueCents > 0)
    .map((o) => ({ ...o, valueCents: Math.round(o.valueCents * (1 - DISCOUNT_BY_TIER[o.tier])) }));
}

// I/O separado da regra pura → a regra é testável sem mock
export async function saveDiscountedOrders(orders: readonly Order[], api: OrdersApi) {
  return api.save(applyTierDiscounts(orders));
}`,
      },
    ],
    a: {
      pt: `Comentários, do mais ao menos importante:

- **Regra misturada com I/O**: a função calcula e chama a API. Separar a regra pura (testável sem mock) do efeito colateral.
- **Sem tratamento de erro no fetch** e URL fixa no código: falha silenciosa e impossível de configurar por ambiente.
- **Números mágicos** (\`1\`, \`'A'\`, \`0.9\`): a regra de negócio fica escondida. Constantes nomeadas ou enum.
- **Nomes** (\`proc\`, \`d\`, \`r\`, \`s\`, \`v\`): o código deveria contar a intenção.
- \`any\` e \`==\`: perde tipagem e tem coerção implícita.
- **Dinheiro em float**: arredondamento errado; usar centavos inteiros.
- Aninhamento: \`filter\`/\`map\` ou early return deixam o fluxo linear.
- Falta teste para os dois descontos e para valor zero.

**Como** comentar importa tanto quanto o quê: distinguir bloqueante de sugestão (prefixos como "nit:"), perguntar antes de afirmar ("aqui o tier pode vir fora de A/B?"), explicar o porquê com link, elogiar o que está bom e, se forem muitos pontos, conversar em vez de deixar 40 comentários. O objetivo é melhorar o código e o colega, não ganhar a discussão.`,
      en: `Comments, from most to least important:

- **Rule mixed with I/O**: the function computes and calls the API. Separate the pure rule (testable without mocks) from the side effect.
- **No error handling on fetch** and a hardcoded URL: silent failure and impossible to configure per environment.
- **Magic numbers** (\`1\`, \`'A'\`, \`0.9\`): the business rule is hidden. Named constants or an enum.
- **Names** (\`proc\`, \`d\`, \`r\`, \`s\`, \`v\`): code should reveal intent.
- \`any\` and \`==\`: lost typing and implicit coercion.
- **Money as floats**: rounding errors; use integer cents.
- Nesting: \`filter\`/\`map\` or early returns make the flow linear.
- Missing tests for both discounts and for zero values.

**How** you comment matters as much as what: distinguish blocking from suggestions (prefixes like "nit:"), ask before asserting ("can the tier ever be outside A/B?"), explain the why with a link, praise what is good, and if there are many points, talk instead of leaving 40 comments. The goal is to improve the code and the colleague, not to win.`,
    },
    follow: [
      { pt: 'O colega discorda de um comentário seu e você acha que está certa. O que faz?', en: 'Your colleague disagrees with one of your comments and you think you are right. What do you do?' },
      { pt: 'O que você automatiza para não discutir estilo em code review?', en: 'What do you automate so code review is not about style?' },
    ],
    flags: {
      pt: 'Focar só em estilo (ponto e vírgula, espaços) e não ver o I/O misturado nem o float em dinheiro.',
      en: 'Focusing only on style (semicolons, spacing) and missing the mixed I/O and floats for money.',
    },
    anchor: {
      pt: 'Você fez code review na Sicoob, e seu portfólio tem template de PR, workflow de validação de PR e revisão assistida por IA no GitHub Actions. O GEMP e o TripFlow guardam dinheiro em centavos inteiros: cite isso no ponto do float.',
      en: 'You did code review at Sicoob, and your portfolio has a PR template, a PR validation workflow, and AI-assisted review in GitHub Actions. GEMP and TripFlow store money as integer cents: mention it on the float point.',
    },
  },
  {
    id: 'design-patterns-real',
    cat: 'principles', type: 'concept', jobs: ['brainrocket', 'elastic', 'cv'],
    tags: ['design patterns', 'Strategy', 'Adapter', 'Observer', 'Factory', 'Repository', 'Decorator'],
    q: {
      pt: 'Quais design patterns você usa de verdade no dia a dia? Dê um exemplo concreto de cada.',
      en: 'Which design patterns do you actually use day to day? Give a concrete example of each.',
    },
    a: {
      pt: `Os que aparecem em código real, com o problema que resolvem:

- **Strategy**: trocar um algoritmo em runtime sem \`if/else\` crescente. Cálculo de frete por transportadora, regras de desconto, provedores de crédito.
- **Adapter**: fazer uma API externa caber na interface do seu domínio. Integração com Salesforce, gateways de pagamento, SDKs de terceiros. Combinado com anti-corruption layer.
- **Repository**: isolar a persistência para o domínio não conhecer SQL/ORM.
- **Factory**: centralizar criação complexa ou com variações (criar o notificador certo por canal).
- **Observer / Pub-Sub**: eventos de domínio, listeners do Laravel, EventEmitter do Node, o próprio modelo de estado do React.
- **Decorator / Middleware**: adicionar comportamento em camadas (cache, retry, logging, métricas) sem mudar a classe original. Middlewares do Express/Laravel são isso.
- **Template Method / Hooks**: um fluxo fixo com pontos de extensão.
- **Singleton**: com cuidado; normalmente o container de DI gerencia o ciclo de vida, o que evita estado global difícil de testar.

O ponto sênior: pattern é vocabulário para comunicar uma solução, não uma meta. Uso quando o problema aparece, não para "deixar preparado".`,
      en: `The ones that show up in real code, with the problem each solves:

- **Strategy**: swap an algorithm at runtime without a growing \`if/else\`. Shipping cost per carrier, discount rules, credit providers.
- **Adapter**: make an external API fit your domain's interface. Salesforce integration, payment gateways, third-party SDKs. Combined with an anti-corruption layer.
- **Repository**: isolate persistence so the domain knows nothing about SQL/ORM.
- **Factory**: centralize complex or variant creation (build the right notifier per channel).
- **Observer / Pub-Sub**: domain events, Laravel listeners, Node's EventEmitter, React's state model itself.
- **Decorator / Middleware**: layer behavior (caching, retry, logging, metrics) without changing the original class. Express/Laravel middleware is exactly that.
- **Template Method / Hooks**: a fixed flow with extension points.
- **Singleton**: carefully; usually the DI container manages lifetimes, which avoids hard-to-test global state.

The senior point: a pattern is vocabulary to communicate a solution, not a goal. I use one when the problem shows up, not "just in case".`,
    },
    follow: [
      { pt: 'Qual a diferença entre Adapter, Facade e Proxy?', en: 'What is the difference between Adapter, Facade, and Proxy?' },
      { pt: 'Que anti-pattern você mais encontrou em legado?', en: 'Which anti-pattern have you run into most in legacy code?' },
    ],
    flags: {
      pt: 'Listar os 23 do GoF sem nenhum exemplo vivido.',
      en: 'Listing all 23 GoF patterns without a single lived example.',
    },
    anchor: {
      pt: 'GEMP: `Provider` é Strategy/Adapter para cada provedor de crédito. Integrações Salesforce ↔ ERP ↔ e-commerce no Grupo Mysa são Adapters e ACL. TripFlow: Repository + eventos de domínio na outbox. Middlewares e listeners do Laravel você usa no trabalho.',
      en: 'GEMP: `Provider` is Strategy/Adapter for each credit provider. Salesforce ↔ ERP ↔ e-commerce integrations at Grupo Mysa are Adapters and an ACL. TripFlow: Repository + domain events in the outbox. You use Laravel middleware and listeners at work.',
    },
  },
];
