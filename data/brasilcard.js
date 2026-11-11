// Bloco da vaga Full Stack Pleno (PHP) na Brasil Card (instituição de pagamentos).
// Requisitos da vaga: PHP 7.4+, HTML/CSS/JS, Java, SQL Server/MySQL/PostgreSQL, CodeIgniter 3+,
// Laravel, Docker, Git. Diferenciais: Kubernetes, Clean Architecture, DDD, TDD, GCP.

export default [
  {
    id: 'php-oop-abstract-interface-trait',
    cat: 'php', type: 'code', jobs: ['brasilcard', 'cv'],
    tags: ['POO', 'OOP', 'interface', 'abstract class', 'trait', 'polimorfismo', 'herança', 'composição'],
    reported: {
      pt: 'Sim. "Diferença entre classe abstrata e interface" e "explique polimorfismo" aparecem em relatos de entrevistas para pleno no Brasil (TabNews) e em quase toda lista de PHP.',
      en: 'Yes. "Abstract class vs interface" and "explain polymorphism" show up in reports of mid-level interviews in Brazil (TabNews) and in nearly every PHP list.',
    },
    q: {
      pt: 'Qual a diferença entre classe abstrata, interface e trait em PHP? Mostre polimorfismo num exemplo de meios de pagamento.',
      en: 'What is the difference between an abstract class, an interface, and a trait in PHP? Show polymorphism with a payments example.',
    },
    code: {
      src: `
<?php
declare(strict_types=1);

// Interface: um CONTRATO. Diz o que fazer, não como. Uma classe pode implementar várias.
interface MeioDePagamento
{
    public function cobrar(int $valorCentavos): Cobranca;
}

// Classe abstrata: contrato + código comum. Não pode ser instanciada. Herança única.
abstract class PagamentoComTaxa implements MeioDePagamento
{
    public function cobrar(int $valorCentavos): Cobranca
    {
        $total = $valorCentavos + $this->taxa($valorCentavos);   // passo comum
        return $this->processar($total);                         // passo específico
    }

    abstract protected function taxa(int $valorCentavos): int;
    abstract protected function processar(int $totalCentavos): Cobranca;
}

// Trait: "copia e cola" de métodos em várias classes, sem herança (reuso horizontal).
trait RegistraLog
{
    protected function log(string $msg): void { error_log(static::class . ': ' . $msg); }
}

final class CartaoDeCredito extends PagamentoComTaxa
{
    use RegistraLog;
    protected function taxa(int $v): int { return intdiv($v * 3, 100); }      // 3%
    protected function processar(int $t): Cobranca { $this->log("autorizando $t"); return new Cobranca($t, 'cartao'); }
}

final class Pix implements MeioDePagamento
{
    public function cobrar(int $valorCentavos): Cobranca { return new Cobranca($valorCentavos, 'pix'); }
}

// Polimorfismo: o checkout não sabe (nem precisa saber) qual meio é.
function finalizarCompra(MeioDePagamento $meio, int $valor): Cobranca
{
    return $meio->cobrar($valor);
}

finalizarCompra(new Pix(), 10000);            // R$100,00
finalizarCompra(new CartaoDeCredito(), 10000); // R$103,00`,
    },
    a: {
      pt: `- **Interface**: só o contrato (assinaturas públicas, constantes). Uma classe pode implementar **várias**. Serve para dizer "qualquer coisa que saiba cobrar" sem amarrar a uma implementação (é a base do DIP do SOLID).
- **Classe abstrata**: contrato **mais** código compartilhado e estado (propriedades). Não pode ser instanciada e a herança é **única**. Boa para um fluxo comum com pontos que mudam (Template Method, como \`cobrar\` acima).
- **Trait**: reaproveita métodos entre classes que não têm relação de herança. O PHP "cola" o código na classe. Bom para comportamentos transversais pequenos (log, timestamps); trait demais vira acoplamento escondido.

**Polimorfismo**: o mesmo código (\`finalizarCompra\`) funciona com objetos de classes diferentes, porque todos respeitam o mesmo contrato. Para adicionar boleto, crio uma classe nova sem mexer no checkout (OCP).

Detalhes que mostram domínio: \`final\` para impedir herança onde não faz sentido, \`declare(strict_types=1)\` para não aceitar conversões silenciosas, e preferir **composição** (receber um objeto pronto) a herança profunda.`,
      en: `- **Interface**: only the contract (public signatures, constants). A class can implement **many**. It says "anything that can charge" without tying you to an implementation (the basis of SOLID's DIP).
- **Abstract class**: contract **plus** shared code and state (properties). Cannot be instantiated and inheritance is **single**. Good for a common flow with varying steps (Template Method, like \`cobrar\` above).
- **Trait**: reuses methods across unrelated classes. PHP "pastes" the code into the class. Good for small cross-cutting behaviors (logging, timestamps); too many traits become hidden coupling.

**Polymorphism**: the same code (\`finalizarCompra\`) works with objects of different classes because they all honor the same contract. To add boleto, I create a new class without touching checkout (OCP).

Details that show mastery: \`final\` to block inheritance where it makes no sense, \`declare(strict_types=1)\` to reject silent conversions, and preferring **composition** (receiving a ready object) over deep inheritance.`,
    },
    follow: [
      { pt: 'Quando você escolheria herança e quando composição?', en: 'When would you choose inheritance and when composition?' },
      { pt: 'O que acontece se duas traits tiverem um método com o mesmo nome?', en: 'What happens if two traits have a method with the same name?' },
    ],
    flags: {
      pt: '"Interface e classe abstrata são a mesma coisa." Ou usar herança só para reaproveitar código entre classes que não têm relação.',
      en: '"Interfaces and abstract classes are the same thing." Or using inheritance just to reuse code between unrelated classes.',
    },
    anchor: {
      pt: 'Você usa isso em Laravel no Grupo Mysa e usou na Sicoob (SOLID, código modular). No GEMP, a interface `Provider` é exatamente esse polimorfismo: a comparação não sabe de qual provedor vem a oferta.',
      en: 'You use this in Laravel at Grupo Mysa and did at Sicoob (SOLID, modular code). In GEMP the `Provider` interface is exactly this polymorphism: the comparison does not know which provider the offer came from.',
    },
  },
  {
    id: 'php-7-to-8-features',
    cat: 'php', type: 'code', jobs: ['brasilcard'],
    tags: ['PHP 7.4', 'PHP 8', 'typed properties', 'match', 'enum', 'readonly', 'nullsafe', 'named arguments', 'strict_types'],
    q: {
      pt: 'A vaga pede PHP 7.4+. O que mudou do 7.4 para o 8.x que você usa no dia a dia? E como você migraria um sistema legado do 7.4 para o 8?',
      en: 'The role asks for PHP 7.4+. What changed from 7.4 to 8.x that you use day to day? And how would you migrate a legacy system from 7.4 to 8?',
    },
    code: {
      src: `
<?php
declare(strict_types=1);

// 7.4: propriedades tipadas, arrow functions, ??=
class Cliente { public ?string $email = null; }
$cfg['timeout'] ??= 30;
$ativos = array_filter($clientes, fn ($c) => $c->ativo);

// 8.0: constructor promotion, union types, named arguments, nullsafe, match
final class Transacao
{
    public function __construct(
        public readonly string $id,          // 8.1: readonly
        public readonly int $valorCentavos,
        public readonly Status $status,      // 8.1: enum
    ) {}
}

$cidade = $cliente?->endereco?->cidade;     // nullsafe: sem "if (x !== null)" em cascata

$descricao = match ($transacao->status) {   // match: estrito (===), sem break, devolve valor
    Status::Autorizada => 'Aguardando captura',
    Status::Capturada  => 'Paga',
    Status::Estornada  => 'Devolvida',
};                                          // caso faltando → UnhandledMatchError

enum Status: string { case Autorizada = 'A'; case Capturada = 'C'; case Estornada = 'E'; }

new DateTime(timezone: new DateTimeZone('America/Sao_Paulo')); // named arguments

// 8.0 mudou comparações: '0' == false continua true, mas 0 == 'abc' agora é FALSE (era true no 7.x)`,
    },
    a: {
      pt: `**PHP 7.4**: propriedades tipadas, arrow functions (\`fn\`), operador \`??=\`, preloading do OPcache.

**PHP 8.0**: constructor promotion, union types, named arguments, nullsafe \`?->\`, \`match\`, atributos (\`#[...]\`), JIT e, importante, **comparação string × número mais sã** (\`0 == 'abc'\` passou a ser \`false\`). Vários warnings viraram \`TypeError\`/\`ValueError\`.

**PHP 8.1+**: \`enum\`, \`readonly\`, fibers, \`never\`; 8.2 classes readonly e depreciação de propriedades dinâmicas; 8.3 constantes tipadas e \`json_validate\`.

**Migração segura de um legado 7.4 → 8**:

1. Rodar a suíte de testes que existir; se não houver, criar **testes de caracterização** nos fluxos críticos (o que o sistema faz hoje, certo ou errado).
2. Análise estática: **PHPStan**/Psalm e **Rector** (aplica as mudanças de sintaxe automaticamente), \`PHPCompatibility\` no PHP_CodeSniffer.
3. Atualizar dependências via Composer (CodeIgniter 3 só roda bem no PHP 8 a partir da 3.1.13).
4. Subir em **Docker** com a versão nova, ligar \`error_reporting(E_ALL)\` em homologação e caçar depreciações nos logs.
5. Deploy gradual e com rollback fácil (uma instância primeiro).

Em pagamentos, a mudança de comparação é o ponto mais perigoso: um \`==\` que "funcionava" pode mudar de resultado.`,
      en: `**PHP 7.4**: typed properties, arrow functions (\`fn\`), the \`??=\` operator, OPcache preloading.

**PHP 8.0**: constructor promotion, union types, named arguments, nullsafe \`?->\`, \`match\`, attributes (\`#[...]\`), JIT and, importantly, **saner string × number comparison** (\`0 == 'abc'\` became \`false\`). Many warnings became \`TypeError\`/\`ValueError\`.

**PHP 8.1+**: \`enum\`, \`readonly\`, fibers, \`never\`; 8.2 readonly classes and deprecated dynamic properties; 8.3 typed constants and \`json_validate\`.

**Safely migrating legacy 7.4 → 8**:

1. Run the existing test suite; if there is none, write **characterization tests** for critical flows (what the system does today, right or wrong).
2. Static analysis: **PHPStan**/Psalm and **Rector** (applies syntax changes automatically), \`PHPCompatibility\` for PHP_CodeSniffer.
3. Update dependencies via Composer (CodeIgniter 3 only runs well on PHP 8 from 3.1.13).
4. Run the new version in **Docker**, enable \`error_reporting(E_ALL)\` in staging, and hunt deprecations in the logs.
5. Gradual deploy with easy rollback (one instance first).

In payments, the comparison change is the riskiest part: a \`==\` that "worked" may change its result.`,
    },
    follow: [
      { pt: 'O que `declare(strict_types=1)` muda exatamente?', en: 'What exactly does `declare(strict_types=1)` change?' },
      { pt: 'Para que servem o OPcache e o JIT? O JIT ajuda numa API web comum?', en: 'What are OPcache and JIT for? Does JIT help a typical web API?' },
    ],
    flags: {
      pt: 'Não saber nenhuma novidade do PHP 8 trabalhando com PHP hoje. Ou "migro mudando a versão no servidor e vejo o que quebra".',
      en: 'Not knowing any PHP 8 feature while working with PHP today. Or "I migrate by changing the server version and seeing what breaks".',
    },
    anchor: {
      pt: 'Seu TripFlow está em PHP 8.3 + Laravel 12 com Larastan/PHPStan nível 8: mostre os recursos do PHP 8 que você usou lá. A modernização de legado na Sicoob (refatoração, bugs, hotfixes) e na ZR System é a história para "como migraria".',
      en: 'Your TripFlow runs PHP 8.3 + Laravel 12 with Larastan/PHPStan level 8: show the PHP 8 features you used there. Legacy modernization at Sicoob (refactoring, bugs, hotfixes) and ZR System is your story for "how would you migrate".',
    },
  },
  {
    id: 'php-comparison-money',
    cat: 'payments', type: 'code', jobs: ['brasilcard'],
    tags: ['==', '===', 'type juggling', 'float', 'dinheiro', 'bcmath', 'centavos', 'arredondamento'],
    q: {
      pt: 'Numa instituição de pagamentos: qual a diferença entre `==` e `===` em PHP, e por que nunca guardar dinheiro em float? Como você calcula 3 parcelas de R$100,00?',
      en: 'At a payments company: what is the difference between `==` and `===` in PHP, and why never store money as a float? How do you split R$100.00 into 3 installments?',
    },
    code: {
      src: `
<?php
var_dump('1' == '01');      // true  (comparação "frouxa" converte os dois para número)
var_dump('1' === '01');     // false (estrita: tipo e valor)
var_dump(null == false);    // true
var_dump(0.1 + 0.2 == 0.3); // false! float não representa 0,1 exatamente
var_dump(in_array('abc', [0]));        // PHP 7: true / PHP 8: false
var_dump(in_array('abc', [0], true));  // sempre use o modo estrito

// Dinheiro em CENTAVOS inteiros
function parcelar(int $totalCentavos, int $parcelas): array
{
    $base = intdiv($totalCentavos, $parcelas);       // 3333
    $resto = $totalCentavos % $parcelas;             // 1 centavo sobrando
    $resultado = array_fill(0, $parcelas, $base);
    $resultado[0] += $resto;                         // a 1ª parcela absorve a diferença
    return $resultado;                               // [3334, 3333, 3333] → soma 10000
}

// Juros/percentuais: bcmath com escala definida e arredondamento explícito
$juros = bcmul('10000', '0.0299', 2);   // "299.00" (string, sem erro de float)`,
    },
    a: {
      pt: `**\`==\`** compara com conversão de tipos ("type juggling"): \`'1' == '01'\` é \`true\`, \`null == false\` é \`true\`. **\`===\`** compara tipo **e** valor, sem conversão. Em código de pagamento uso sempre \`===\`, \`in_array(..., true)\`, \`match\` (que é estrito) e \`strict_types\`.

**Float** guarda números em binário e não representa exatamente valores como 0,1: \`0.1 + 0.2 == 0.3\` é \`false\`. Somando milhares de transações, os centavos "somem" ou "aparecem". Por isso:

- Valores em **centavos inteiros** (\`int\`/\`BIGINT\`) ou \`DECIMAL(15,2)\` no banco, nunca \`FLOAT\`.
- Contas com juros e taxas em **bcmath** (strings com escala definida) ou numa biblioteca de dinheiro (\`brick/money\`, \`moneyphp\`), com **regra de arredondamento explícita** (meio para cima, bancário) combinada com o negócio.
- **Parcelamento**: dividir em inteiros e distribuir o resto (geralmente na primeira parcela), garantindo que a soma das parcelas é exatamente o total.

Um value object \`Money\` (valor + moeda, imutável) concentra essas regras e evita misturar centavos com reais.`,
      en: `**\`==\`** compares with type conversion ("type juggling"): \`'1' == '01'\` is \`true\`, \`null == false\` is \`true\`. **\`===\`** compares type **and** value, with no conversion. In payment code I always use \`===\`, \`in_array(..., true)\`, \`match\` (which is strict), and \`strict_types\`.

**Floats** store numbers in binary and cannot represent values like 0.1 exactly: \`0.1 + 0.2 == 0.3\` is \`false\`. Summing thousands of transactions, cents "vanish" or "appear". Therefore:

- Amounts as **integer cents** (\`int\`/\`BIGINT\`) or \`DECIMAL(15,2)\` in the database, never \`FLOAT\`.
- Interest and fees with **bcmath** (strings with a fixed scale) or a money library (\`brick/money\`, \`moneyphp\`), with an **explicit rounding rule** (half-up, banker's) agreed with the business.
- **Installments**: divide as integers and distribute the remainder (usually on the first installment), guaranteeing the installments add up exactly to the total.

A \`Money\` value object (amount + currency, immutable) centralizes these rules and avoids mixing cents with reais.`,
    },
    follow: [
      { pt: 'Onde a diferença de 1 centavo vai: primeira ou última parcela? Quem decide?', en: 'Where does the 1-cent difference go: first or last installment? Who decides?' },
      { pt: 'Como você testaria a função de parcelamento?', en: 'How would you test the installment function?' },
    ],
    flags: {
      pt: '`round($valor * 1.0299, 2)` com float em cálculo financeiro, ou coluna `FLOAT` para saldo.',
      en: '`round($valor * 1.0299, 2)` with floats in financial math, or a `FLOAT` column for balances.',
    },
    anchor: {
      pt: 'Você trabalhou em sistemas financeiros na Sicoob, e GEMP e TripFlow guardam dinheiro em centavos inteiros. Esta é uma pergunta em que você tem prova concreta: cite os dois.',
      en: 'You worked on financial systems at Sicoob, and GEMP and TripFlow store money as integer cents. You have concrete proof for this one: cite both.',
    },
  },
  {
    id: 'codeigniter3-architecture',
    cat: 'php', type: 'lib', jobs: ['brasilcard'],
    tags: ['CodeIgniter 3', 'MVC', 'Query Builder', 'hooks', 'libraries', 'helpers', 'CSRF', 'XSS'],
    reported: {
      pt: 'Pergunta típica de vagas que mantêm sistemas em CodeIgniter 3: estrutura MVC, Query Builder, hooks, libraries e helpers, e a diferença para o Laravel aparecem em todas as listas de entrevista de CodeIgniter.',
      en: 'Typical for roles maintaining CodeIgniter 3 systems: MVC structure, Query Builder, hooks, libraries and helpers, and the difference from Laravel appear in every CodeIgniter interview list.',
    },
    q: {
      pt: 'A vaga pede CodeIgniter 3 e Laravel. Como funciona uma requisição no CodeIgniter 3, quais as peças (controllers, models, libraries, helpers, hooks) e o que muda em relação ao Laravel?',
      en: 'The role asks for CodeIgniter 3 and Laravel. How does a request flow in CodeIgniter 3, what are the pieces (controllers, models, libraries, helpers, hooks), and how does it differ from Laravel?',
    },
    code: {
      src: `
<?php
// application/config/routes.php
$route['faturas/(:num)'] = 'faturas/ver/$1';

// application/controllers/Faturas.php
class Faturas extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('fatura_model');     // carregamento explícito (sem injeção automática)
        $this->load->library('session');
        $this->load->helper('url');
    }

    public function ver(int $id)
    {
        $clienteId = $this->session->userdata('cliente_id');
        $fatura = $this->fatura_model->doCliente($id, $clienteId);  // filtra pelo dono (evita IDOR)
        if (!$fatura) show_404();
        $this->load->view('faturas/ver', ['fatura' => $fatura]);   // na view: html_escape()
    }
}

// application/models/Fatura_model.php
class Fatura_model extends CI_Model
{
    public function doCliente(int $id, int $clienteId)
    {
        return $this->db->select('id, vencimento, total_centavos, status')
            ->where('id', $id)
            ->where('cliente_id', $clienteId)     // Query Builder escapa os valores (bindings)
            ->get('faturas')
            ->row();
    }
}

// Transação no CI3
$this->db->trans_start();
$this->db->insert('pagamentos', $dados);
$this->db->update('faturas', ['status' => 'PAGA'], ['id' => $faturaId]);
$this->db->trans_complete();
if ($this->db->trans_status() === false) { /* rollback já feito; logar e avisar */ }`,
    },
    a: {
      pt: `**Fluxo no CI3**: \`index.php\` (front controller) → \`CodeIgniter.php\` carrega config e **hooks** (\`pre_system\`, \`pre_controller\`, \`post_controller_constructor\`…) → o **Router** mapeia a URL para \`Controller/método/parâmetros\` (\`config/routes.php\`) → o controller carrega **models**, **libraries** e **helpers** com \`$this->load\` → renderiza a **view** → **Output** (com cache opcional) envia a resposta.

**Peças**:

- **Models**: acesso a dados, normalmente com o **Query Builder** (\`$this->db->where()->get()\`), que usa bindings e protege de SQL injection.
- **Libraries**: classes (session, form_validation, email, upload) ou suas próprias em \`application/libraries\`.
- **Helpers**: funções soltas (url, form, html_escape).
- **Hooks**: pontos para rodar código no meio do ciclo (log, autenticação global), o equivalente a middleware.
- **Segurança**: \`csrf_protection\` no config, \`html_escape()\` na saída, \`form_validation\`. O \`xss_clean\` de entrada é considerado ultrapassado; o correto é escapar na saída.

**CI3 × Laravel**: o CI3 é leve e simples, sem namespaces nem Composer obrigatório, sem container de injeção de dependência, sem ORM completo, migrations limitadas e sem filas nativas. O Laravel traz Eloquent, migrations, filas, eventos, injeção de dependência, middleware, testes integrados e um ecossistema enorme.

**Manter e modernizar**: mantenho o CI3 estável (testes de caracterização, PHP 8 com o CI 3.1.13), coloco regras novas em classes de domínio puras, testáveis com PHPUnit, e migro aos poucos por rota (Strangler Fig): rotas novas no Laravel ou CI4 atrás do mesmo proxy, até o CI3 poder ser desligado.`,
      en: `**CI3 flow**: \`index.php\` (front controller) → \`CodeIgniter.php\` loads config and **hooks** (\`pre_system\`, \`pre_controller\`, \`post_controller_constructor\`…) → the **Router** maps the URL to \`Controller/method/params\` (\`config/routes.php\`) → the controller loads **models**, **libraries**, and **helpers** with \`$this->load\` → renders the **view** → **Output** (with optional caching) sends the response.

**Pieces**:

- **Models**: data access, usually through the **Query Builder** (\`$this->db->where()->get()\`), which uses bindings and prevents SQL injection.
- **Libraries**: classes (session, form_validation, email, upload) or your own in \`application/libraries\`.
- **Helpers**: plain functions (url, form, html_escape).
- **Hooks**: points to run code mid-lifecycle (logging, global auth), the equivalent of middleware.
- **Security**: \`csrf_protection\` in config, \`html_escape()\` on output, \`form_validation\`. Input \`xss_clean\` is considered outdated; the right approach is escaping on output.

**CI3 vs Laravel**: CI3 is light and simple, with no namespaces or mandatory Composer, no dependency injection container, no full ORM, limited migrations, and no native queues. Laravel brings Eloquent, migrations, queues, events, dependency injection, middleware, built-in testing, and a huge ecosystem.

**Maintaining and modernizing**: keep CI3 stable (characterization tests, PHP 8 with CI 3.1.13), put new rules in pure domain classes testable with PHPUnit, and migrate gradually by route (Strangler Fig): new routes in Laravel or CI4 behind the same proxy until CI3 can be switched off.`,
    },
    follow: [
      { pt: 'Como você escreveria um teste automatizado para um controller CI3?', en: 'How would you write an automated test for a CI3 controller?' },
      { pt: 'Onde você colocaria uma regra de negócio que hoje está no controller?', en: 'Where would you put a business rule that currently lives in a controller?' },
    ],
    flags: {
      pt: '"CodeIgniter é ultrapassado, eu reescreveria tudo em Laravel." A vaga é de manutenção contínua: reescrever tudo de uma vez é o maior risco possível num sistema de pagamentos.',
      en: '"CodeIgniter is outdated, I would rewrite everything in Laravel." The role is ongoing maintenance: a big-bang rewrite is the biggest possible risk in a payments system.',
    },
    anchor: {
      pt: 'Na ZR System você evoluiu um sistema legado em PHP com arquitetura MVC, preservando o que já estava em uso: é exatamente o trabalho desta vaga. CodeIgniter não aparece no seu CV; se não usou, a ponte honesta é: "trabalho com Laravel e com PHP MVC legado; o CI3 é o mesmo modelo, mais enxuto, e já mantive legado sem quebrar a operação".',
      en: 'At ZR System you evolved a legacy PHP MVC system while preserving what was already in use: exactly the work this role describes. CodeIgniter is not on your CV; if you have not used it, the honest bridge: "I work with Laravel and legacy PHP MVC; CI3 is the same model, leaner, and I have maintained legacy without breaking operations".',
    },
  },
  {
    id: 'laravel-queues-payments',
    cat: 'php', type: 'code', jobs: ['brasilcard', 'cv'],
    tags: ['Laravel', 'queues', 'jobs', 'Horizon', 'retry', 'backoff', 'ShouldBeUnique', 'failed jobs', 'idempotência'],
    q: {
      pt: 'Depois que um pagamento é confirmado, o sistema precisa gerar o comprovante, mandar e-mail e avisar o ERP. Como você faz isso no Laravel sem travar a requisição e sem duplicar nada se o job rodar duas vezes?',
      en: 'After a payment is confirmed, the system must generate the receipt, send an email, and notify the ERP. How do you do it in Laravel without blocking the request and without duplicating anything if the job runs twice?',
    },
    code: {
      src: `
<?php
// app/Jobs/NotificarErpPagamento.php
class NotificarErpPagamento implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $timeout = 30;

    public function __construct(public readonly int $pagamentoId) {}

    public function uniqueId(): string { return (string) $this->pagamentoId; } // não enfileira 2x

    public function backoff(): array { return [10, 30, 60, 300]; }            // segundos entre tentativas

    public function handle(ErpClient $erp): void
    {
        $pagamento = Pagamento::findOrFail($this->pagamentoId);
        if ($pagamento->erp_notificado_em) return;            // idempotente: já foi, não faz de novo

        $erp->enviarPagamento($pagamento, idempotencyKey: "pag-{$pagamento->id}");
        $pagamento->update(['erp_notificado_em' => now()]);
    }

    public function failed(Throwable $e): void
    {
        Log::error('ERP não recebeu pagamento', ['pagamento' => $this->pagamentoId, 'erro' => $e->getMessage()]);
        // alerta para o time; o job fica em failed_jobs para reprocessar (php artisan queue:retry)
    }
}

// No serviço, DEPOIS do commit da transação
DB::transaction(function () use ($pagamento) {
    $pagamento->confirmar();
    NotificarErpPagamento::dispatch($pagamento->id)->afterCommit();
});`,
    },
    a: {
      pt: `**Filas** tiram da requisição o que é lento ou depende de terceiros: o usuário recebe a resposta na hora e um **worker** (\`php artisan queue:work\`, gerenciado pelo **Horizon** com Redis) processa depois.

Cuidados que fazem diferença num sistema de pagamentos:

- **Despachar depois do commit** (\`afterCommit\`): se a transação fizer rollback, o job não sai. Para garantia total, o padrão outbox.
- **Retentativas com backoff** (\`$tries\`, \`backoff()\`) e \`$timeout\`, porque o ERP vai cair em algum momento.
- **Idempotência**: filas entregam **pelo menos uma vez**; o job pode rodar duas vezes (timeout, deploy no meio). Ele checa se já fez (\`erp_notificado_em\`) e manda uma chave de idempotência para o ERP. \`ShouldBeUnique\` evita enfileirar duplicado, mas não substitui a checagem.
- **Jobs pequenos e separados** (comprovante, e-mail, ERP): um falhar não impede os outros.
- **Falha definitiva**: \`failed()\` loga e alerta; a tabela \`failed_jobs\` permite reprocessar com \`queue:retry\`.
- **Monitorar**: tamanho da fila, tempo de espera e jobs falhos no Horizon.
- Passar o **ID** e não o objeto inteiro, para o job ler o estado atual do banco.`,
      en: `**Queues** move slow or third-party work out of the request: the user gets an immediate response and a **worker** (\`php artisan queue:work\`, managed by **Horizon** with Redis) processes it later.

Details that matter in a payments system:

- **Dispatch after commit** (\`afterCommit\`): if the transaction rolls back, the job never goes out. For full guarantees, the outbox pattern.
- **Retries with backoff** (\`$tries\`, \`backoff()\`) and \`$timeout\`, because the ERP will go down at some point.
- **Idempotency**: queues deliver **at least once**; the job may run twice (timeout, a deploy mid-run). It checks whether the work is done (\`erp_notificado_em\`) and sends an idempotency key to the ERP. \`ShouldBeUnique\` avoids duplicate enqueuing but does not replace the check.
- **Small, separate jobs** (receipt, email, ERP): one failing does not block the others.
- **Permanent failure**: \`failed()\` logs and alerts; the \`failed_jobs\` table allows reprocessing with \`queue:retry\`.
- **Monitor**: queue size, wait time, and failed jobs in Horizon.
- Pass the **ID**, not the whole object, so the job reads the current database state.`,
    },
    follow: [
      { pt: 'O que acontece com os jobs em andamento durante um deploy? (`queue:restart`)', en: 'What happens to in-flight jobs during a deploy? (`queue:restart`)' },
      { pt: 'Como você testaria que o job é despachado? (`Queue::fake()`)', en: 'How would you test that the job is dispatched? (`Queue::fake()`)' },
    ],
    flags: {
      pt: 'Chamar o ERP direto dentro da requisição (e da transação). Ou retry sem nenhuma checagem de "já fiz isso?".',
      en: 'Calling the ERP directly inside the request (and the transaction). Or retrying with no "have I already done this?" check.',
    },
    anchor: {
      pt: 'Integrações com ERP são o seu dia a dia no Grupo Mysa (ERP ↔ Salesforce ↔ e-commerce). No TripFlow você tem Redis, RabbitMQ, outbox e consumidor que deduplica: é a mesma ideia, em produção de portfólio. Abra o lab "Outbox" e o "Idempotência" antes da entrevista.',
      en: 'ERP integrations are your daily work at Grupo Mysa (ERP ↔ Salesforce ↔ e-commerce). TripFlow has Redis, RabbitMQ, an outbox, and a deduplicating consumer: same idea in a portfolio project. Open the "Outbox" and "Idempotency" labs before the interview.',
    },
  },
  {
    id: 'php-security-pdo-password',
    cat: 'security', type: 'code', jobs: ['brasilcard'],
    tags: ['SQL injection', 'PDO', 'prepared statements', 'password_hash', 'XSS', 'htmlspecialchars', 'CSRF', 'PCI'],
    q: {
      pt: 'Mostre como você protege um código PHP contra SQL injection, XSS e senhas vazadas. O que nunca pode aparecer num log de uma empresa de cartões?',
      en: 'Show how you protect PHP code against SQL injection, XSS, and leaked passwords. What must never appear in a log at a card company?',
    },
    code: {
      src: `
<?php
// ❌ SQL injection: o texto do usuário vira parte do comando
$sql = "SELECT * FROM clientes WHERE cpf = '" . $_GET['cpf'] . "'";   // cpf = ' OR '1'='1

// ✅ Prepared statement com PDO: o valor vai separado do comando
$stmt = $pdo->prepare('SELECT id, nome FROM clientes WHERE cpf = :cpf');
$stmt->execute(['cpf' => $cpf]);

// ✅ Senha: hash lento com salt automático (bcrypt/argon2), nunca md5/sha1
$hash = password_hash($senha, PASSWORD_DEFAULT);
if (password_verify($tentativa, $hash)) { /* ok */ }
if (password_needs_rehash($hash, PASSWORD_DEFAULT)) { /* atualiza no login */ }

// ✅ XSS: escapar na SAÍDA, conforme o contexto
echo htmlspecialchars($comentario, ENT_QUOTES, 'UTF-8');   // Blade: {{ $comentario }}  CI3: html_escape()

// ✅ Mascarar dado sensível antes de logar
function mascararCartao(string $pan): string { return str_repeat('*', strlen($pan) - 4) . substr($pan, -4); }
$logger->info('compra autorizada', ['cartao' => mascararCartao($pan), 'valor' => $valorCentavos]);`,
    },
    a: {
      pt: `- **SQL injection**: nunca concatenar entrada em SQL. Usar **prepared statements** (PDO, Query Builder do CI3, Eloquent), que mandam o valor separado do comando. Nomes de colunas/ordenação vindos do usuário passam por uma **lista permitida**.
- **XSS**: escapar na **saída** com \`htmlspecialchars\` (Blade \`{{ }}\` e \`html_escape\` do CI3 já fazem); cuidado com \`{!! !!}\` e com JSON dentro de \`<script>\`. Content Security Policy como defesa extra.
- **CSRF**: token em todo formulário que altera dados (Laravel e CI3 têm nativo) e cookies \`SameSite\`.
- **Senhas**: \`password_hash\`/\`password_verify\` (bcrypt ou argon2), nunca md5/sha1, nunca guardar em texto.
- **Segredos**: em variáveis de ambiente/secret manager, nunca no Git.

**Logs em empresa de cartões** (PCI DSS): nunca o **número completo do cartão** (PAN), **CVV**, senha, trilha da tarja ou token de acesso. O PAN aparece mascarado (só os 4 últimos dígitos) e dados pessoais (CPF) também mascarados, por LGPD. O CVV não pode ser armazenado nem depois de autorizado. O ideal é a aplicação nem tocar no número do cartão: **tokenização** pelo processador.`,
      en: `- **SQL injection**: never concatenate input into SQL. Use **prepared statements** (PDO, CI3 Query Builder, Eloquent), which send the value separately from the command. Column/sort names from users go through an **allowlist**.
- **XSS**: escape on **output** with \`htmlspecialchars\` (Blade \`{{ }}\` and CI3 \`html_escape\` do it); beware \`{!! !!}\` and JSON inside \`<script>\`. Content Security Policy as an extra defense.
- **CSRF**: a token on every form that changes data (Laravel and CI3 have it built in) and \`SameSite\` cookies.
- **Passwords**: \`password_hash\`/\`password_verify\` (bcrypt or argon2), never md5/sha1, never plain text.
- **Secrets**: in environment variables/a secret manager, never in Git.

**Logs at a card company** (PCI DSS): never the **full card number** (PAN), **CVV**, password, magnetic-stripe data, or access tokens. The PAN appears masked (last 4 digits only) and personal data (CPF) masked too, per LGPD. The CVV cannot be stored even after authorization. Ideally the application never touches the card number at all: **tokenization** by the processor.`,
    },
    follow: [
      { pt: 'O que é PCI DSS e o que muda no seu dia a dia de dev?', en: 'What is PCI DSS and what changes in your day-to-day as a developer?' },
      { pt: 'Por que `md5($senha)` é inseguro mesmo com salt?', en: 'Why is `md5($password)` insecure even with a salt?' },
    ],
    flags: {
      pt: 'Usar `addslashes`/`mysql_real_escape_string` como proteção principal. Ou logar o request inteiro de pagamento "para debugar".',
      en: 'Using `addslashes`/`mysql_real_escape_string` as the main protection. Or logging the whole payment request "for debugging".',
    },
    anchor: {
      pt: 'Sistemas financeiros na Sicoob: fale de como dados sensíveis eram tratados lá (mascaramento, acesso restrito, auditoria), sem expor nada confidencial. Veja o lab "XSS" para a parte de front.',
      en: 'Financial systems at Sicoob: talk about how sensitive data was handled there (masking, restricted access, auditing), without exposing anything confidential. See the "XSS" lab for the front-end part.',
    },
  },
  {
    id: 'sql-three-databases',
    cat: 'data', type: 'concept', jobs: ['brasilcard', 'cv'],
    tags: ['SQL Server', 'MySQL', 'PostgreSQL', 'T-SQL', 'IDENTITY', 'AUTO_INCREMENT', 'SERIAL', 'isolamento', 'stored procedure'],
    q: {
      pt: 'A vaga cita SQL Server, MySQL e PostgreSQL. Quais diferenças práticas você precisa lembrar ao trabalhar com os três no mesmo sistema?',
      en: 'The role lists SQL Server, MySQL, and PostgreSQL. Which practical differences do you need to keep in mind when working with all three in the same system?',
    },
    code: {
      src: `
-- Limitar linhas
SELECT TOP 10 * FROM faturas ORDER BY vencimento;                 -- SQL Server
SELECT * FROM faturas ORDER BY vencimento LIMIT 10;                -- MySQL / PostgreSQL
SELECT * FROM faturas ORDER BY vencimento OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY; -- SQL Server 2012+ / padrão

-- Chave autoincremento
id INT IDENTITY(1,1) PRIMARY KEY                                   -- SQL Server
id BIGINT AUTO_INCREMENT PRIMARY KEY                               -- MySQL
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY                 -- PostgreSQL (ou BIGSERIAL)

-- Pegar o id inserido
INSERT ... ; SELECT SCOPE_IDENTITY();                              -- SQL Server (ou OUTPUT INSERTED.id)
INSERT ... ; SELECT LAST_INSERT_ID();                              -- MySQL
INSERT ... RETURNING id;                                           -- PostgreSQL

-- Data/hora atual e concatenação
GETDATE()  /  'a' + 'b'                                            -- SQL Server
NOW()      /  CONCAT('a', 'b')                                     -- MySQL
NOW()      /  'a' || 'b'                                           -- PostgreSQL

-- Upsert
MERGE INTO ...                                                     -- SQL Server
INSERT ... ON DUPLICATE KEY UPDATE ...                             -- MySQL
INSERT ... ON CONFLICT (id) DO UPDATE ...                          -- PostgreSQL`,
    },
    a: {
      pt: `A base (SQL, joins, índices, transações) é a mesma; as diferenças que causam bug são de **dialeto e comportamento**:

- **Sintaxe**: \`TOP\` × \`LIMIT\`, \`IDENTITY\` × \`AUTO_INCREMENT\` × \`IDENTITY/SERIAL\`, \`SCOPE_IDENTITY\` × \`LAST_INSERT_ID\` × \`RETURNING\`, upsert (\`MERGE\` × \`ON DUPLICATE KEY\` × \`ON CONFLICT\`), funções de data e concatenação.
- **Isolamento e locks**: o padrão do SQL Server é Read Committed **com locks de leitura** (leituras podem esperar escritas) a menos que se ligue o RCSI (versionamento); PostgreSQL usa MVCC (leitura não bloqueia escrita); MySQL/InnoDB usa Repeatable Read por padrão.
- **Case e collation**: MySQL e SQL Server costumam comparar texto sem diferenciar maiúsculas (depende da collation); PostgreSQL diferencia. Um \`WHERE email = ?\` pode ter resultado diferente.
- **Tipos**: dinheiro em \`DECIMAL(15,2)\` nos três (no SQL Server, evito o tipo \`MONEY\`); datas com fuso: \`DATETIMEOFFSET\` × \`TIMESTAMP\` (sem fuso) × \`TIMESTAMPTZ\`.
- **Procedures**: SQL Server e sistemas legados usam muita **stored procedure** (T-SQL); PostgreSQL tem funções em PL/pgSQL.
- **No PHP**: PDO com drivers diferentes (\`pdo_sqlsrv\`, \`pdo_mysql\`, \`pdo_pgsql\`). Laravel e CI3 abstraem o básico, mas SQL "cru" precisa ser escrito para o banco certo.

Para integrar os três, deixo cada sistema dono do seu banco e integro por API/eventos, em vez de queries cruzadas.`,
      en: `The basics (SQL, joins, indexes, transactions) are the same; the differences that cause bugs are **dialect and behavior**:

- **Syntax**: \`TOP\` vs \`LIMIT\`, \`IDENTITY\` vs \`AUTO_INCREMENT\` vs \`IDENTITY/SERIAL\`, \`SCOPE_IDENTITY\` vs \`LAST_INSERT_ID\` vs \`RETURNING\`, upserts (\`MERGE\` vs \`ON DUPLICATE KEY\` vs \`ON CONFLICT\`), date functions and concatenation.
- **Isolation and locks**: SQL Server's default is Read Committed **with read locks** (reads may wait for writes) unless RCSI (versioning) is enabled; PostgreSQL uses MVCC (reads never block writes); MySQL/InnoDB defaults to Repeatable Read.
- **Case and collation**: MySQL and SQL Server usually compare text case-insensitively (depending on collation); PostgreSQL is case-sensitive. A \`WHERE email = ?\` can return different results.
- **Types**: money as \`DECIMAL(15,2)\` in all three (in SQL Server I avoid the \`MONEY\` type); timestamps with time zones: \`DATETIMEOFFSET\` vs \`TIMESTAMP\` (no zone) vs \`TIMESTAMPTZ\`.
- **Procedures**: SQL Server and legacy systems use lots of **stored procedures** (T-SQL); PostgreSQL has PL/pgSQL functions.
- **In PHP**: PDO with different drivers (\`pdo_sqlsrv\`, \`pdo_mysql\`, \`pdo_pgsql\`). Laravel and CI3 abstract the basics, but raw SQL must be written for the right database.

To integrate all three, I let each system own its database and integrate via APIs/events instead of cross-database queries.`,
    },
    follow: [
      { pt: 'Uma tela trava às vezes no SQL Server enquanto um relatório roda. O que pode ser e como investigaria?', en: 'A screen sometimes hangs on SQL Server while a report runs. What could it be and how would you investigate?' },
      { pt: 'Quando você colocaria lógica numa stored procedure?', en: 'When would you put logic in a stored procedure?' },
    ],
    flags: {
      pt: '"SQL é tudo igual." Ou não saber o que é collation quando uma busca por e-mail falha em produção.',
      en: '"SQL is all the same." Or not knowing what collation is when an email lookup fails in production.',
    },
    anchor: {
      pt: 'Você trabalhou com os três: SQL Server e MySQL na Sicoob, MySQL na ZR System e no TripFlow, PostgreSQL no Bora (Supabase, com testes de RLS) e ainda Oracle/PL/SQL na Easy Process. Poucos candidatos de pleno têm isso: cite um caso real de diferença que já te pegou.',
      en: 'You have used all three: SQL Server and MySQL at Sicoob, MySQL at ZR System and in TripFlow, PostgreSQL in Bora (Supabase, with RLS tests), plus Oracle/PL/SQL at Easy Process. Few mid-level candidates have that: cite a real difference that once bit you.',
    },
  },
  {
    id: 'sql-live-query-faturas',
    cat: 'data', type: 'code', jobs: ['brasilcard'],
    tags: ['SQL', 'JOIN', 'GROUP BY', 'HAVING', 'LEFT JOIN', 'window function', 'subquery', 'live coding'],
    reported: {
      pt: 'Escrever SQL ao vivo é comum em vagas PHP pleno no Brasil: joins, agrupamento e "explique indexação" aparecem nos relatos.',
      en: 'Writing SQL live is common in mid-level PHP roles in Brazil: joins, grouping, and "explain indexing" appear in reports.',
    },
    q: {
      pt: 'SQL ao vivo: tabelas `clientes`, `faturas` (cliente_id, vencimento, total_centavos, pago_em). Liste os clientes com faturas vencidas e não pagas, o total devido e há quantos dias está a mais antiga. Depois: clientes sem nenhuma fatura.',
      en: 'Live SQL: tables `clientes`, `faturas` (cliente_id, vencimento, total_centavos, pago_em). List customers with overdue unpaid invoices, the total owed, and how many days the oldest one is overdue. Then: customers with no invoices at all.',
    },
    code: {
      src: `
-- 1) Inadimplentes (PostgreSQL / MySQL; no SQL Server troque CURRENT_DATE por CAST(GETDATE() AS date))
SELECT c.id,
       c.nome,
       COUNT(*)                               AS faturas_vencidas,
       SUM(f.total_centavos)                  AS total_devido_centavos,
       MIN(f.vencimento)                      AS vencimento_mais_antigo,
       CURRENT_DATE - MIN(f.vencimento)       AS dias_em_atraso      -- MySQL: DATEDIFF(CURRENT_DATE, MIN(f.vencimento))
FROM clientes c
JOIN faturas f ON f.cliente_id = c.id
WHERE f.pago_em IS NULL
  AND f.vencimento < CURRENT_DATE
GROUP BY c.id, c.nome
HAVING SUM(f.total_centavos) > 0          -- HAVING filtra DEPOIS de agrupar; WHERE filtra antes
ORDER BY dias_em_atraso DESC;

-- 2) Clientes sem fatura: LEFT JOIN + IS NULL (ou NOT EXISTS)
SELECT c.id, c.nome
FROM clientes c
LEFT JOIN faturas f ON f.cliente_id = c.id
WHERE f.id IS NULL;

-- 3) Bônus: última fatura de cada cliente com window function
SELECT *
FROM (
  SELECT f.*, ROW_NUMBER() OVER (PARTITION BY f.cliente_id ORDER BY f.vencimento DESC) AS rn
  FROM faturas f
) x
WHERE rn = 1;

-- Índice que ajuda a consulta 1:
CREATE INDEX idx_faturas_abertas ON faturas (pago_em, vencimento, cliente_id);`,
    },
    a: {
      pt: `Raciocínio em voz alta (é isso que avaliam):

1. **Filtrar antes de agrupar** no \`WHERE\`: só faturas não pagas e vencidas.
2. **Agrupar** por cliente com \`COUNT\`, \`SUM\`, \`MIN\`. Toda coluna do \`SELECT\` que não é agregada vai no \`GROUP BY\`.
3. \`HAVING\` filtra o resultado **já agrupado** (ex.: total acima de X); \`WHERE\` não enxerga agregações.
4. **Clientes sem fatura**: \`LEFT JOIN\` mantém todos os clientes e preenche a fatura com \`NULL\` quando não existe; filtrar \`f.id IS NULL\`. \`NOT EXISTS\` é equivalente e às vezes mais claro.
5. **Window functions** (\`ROW_NUMBER() OVER (PARTITION BY ...)\`) resolvem "o último de cada grupo" sem subquery correlacionada.

Depois, **performance**: com milhões de faturas, um índice que comece pelas colunas de filtro, conferido com \`EXPLAIN\`. E as diferenças de dialeto: datas (\`DATEDIFF\` no MySQL e no SQL Server; subtração no PostgreSQL), \`LIMIT\` × \`TOP\`.

Pergunte antes de escrever: "pago_em nulo significa não pago? Pagamento parcial existe?" Perguntar requisito em live coding conta pontos.`,
      en: `Reasoning out loud (that is what they assess):

1. **Filter before grouping** in \`WHERE\`: only unpaid, overdue invoices.
2. **Group** by customer with \`COUNT\`, \`SUM\`, \`MIN\`. Every non-aggregated \`SELECT\` column goes in \`GROUP BY\`.
3. \`HAVING\` filters the **already grouped** result (e.g. total above X); \`WHERE\` cannot see aggregates.
4. **Customers without invoices**: \`LEFT JOIN\` keeps every customer and fills invoice columns with \`NULL\` when none exist; filter \`f.id IS NULL\`. \`NOT EXISTS\` is equivalent and sometimes clearer.
5. **Window functions** (\`ROW_NUMBER() OVER (PARTITION BY ...)\`) solve "the latest per group" without a correlated subquery.

Then **performance**: with millions of invoices, an index starting with the filter columns, verified with \`EXPLAIN\`. And dialect differences: dates (\`DATEDIFF\` in MySQL and SQL Server; subtraction in PostgreSQL), \`LIMIT\` vs \`TOP\`.

Ask before writing: "does a null pago_em mean unpaid? Do partial payments exist?" Asking about requirements in live coding earns points.`,
    },
    follow: [
      { pt: 'Qual a diferença entre INNER JOIN, LEFT JOIN e o que acontece com NULL num COUNT(coluna)?', en: 'What is the difference between INNER JOIN and LEFT JOIN, and what happens to NULLs in COUNT(column)?' },
      { pt: 'Se pagamentos parciais existirem (tabela `pagamentos`), como muda a consulta?', en: 'If partial payments exist (a `pagamentos` table), how does the query change?' },
    ],
    flags: {
      pt: 'Colocar condição de agregação no WHERE, ou trazer tudo para o PHP e somar num foreach.',
      en: 'Putting an aggregate condition in WHERE, or loading everything into PHP and summing in a foreach.',
    },
    anchor: {
      pt: 'Relatórios gerenciais em Oracle na Easy Process e extrações de dados são sua prova. Treine escrevendo a consulta no papel em 10 minutos, falando em voz alta.',
      en: 'Management reports in Oracle at Easy Process and data extracts are your proof. Practice writing the query on paper in 10 minutes, talking out loud.',
    },
  },
  {
    id: 'docker-php-dev-env',
    cat: 'devops', type: 'code', jobs: ['brasilcard', 'cv'],
    tags: ['Docker', 'docker compose', 'php-fpm', 'nginx', 'volumes', 'Xdebug', 'ambiente de desenvolvimento'],
    q: {
      pt: 'A vaga pede "ambiente de desenvolvimento com Docker". Monte um docker-compose para uma aplicação PHP com Nginx, PHP-FPM e MySQL, e explique imagem, container, volume e rede.',
      en: 'The role asks for a "Docker development environment". Build a docker-compose for a PHP app with Nginx, PHP-FPM, and MySQL, and explain image, container, volume, and network.',
    },
    code: {
      src: `
# docker-compose.yml
services:
  app:                                   # PHP-FPM: roda o código PHP
    build: { context: ., dockerfile: docker/php/Dockerfile }
    volumes: ['./:/var/www/html']       # bind mount: edita no seu editor, reflete na hora
    environment:
      DB_HOST: db                       # o nome do serviço vira o hostname na rede do compose
      XDEBUG_MODE: debug
    depends_on:
      db: { condition: service_healthy }

  web:                                   # Nginx: recebe HTTP e repassa .php para o app:9000
    image: nginx:1.27-alpine
    ports: ['8080:80']                  # porta do seu computador : porta do container
    volumes:
      - ./:/var/www/html:ro
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro

  db:
    image: mysql:8.4
    environment: { MYSQL_DATABASE: app, MYSQL_ROOT_PASSWORD: secret }
    volumes: ['dbdata:/var/lib/mysql']  # volume nomeado: os dados sobrevivem ao "down"
    healthcheck: { test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost'], interval: 5s, retries: 10 }

volumes:
  dbdata:

# docker/php/Dockerfile
# FROM php:8.3-fpm
# RUN apt-get update && apt-get install -y libzip-dev && docker-php-ext-install pdo_mysql zip \\
#  && pecl install xdebug && docker-php-ext-enable xdebug
# COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
# WORKDIR /var/www/html`,
    },
    a: {
      pt: `- **Imagem**: a receita pronta e imutável (sistema + PHP + extensões). Construída a partir de um Dockerfile.
- **Container**: uma imagem rodando, isolada. Pode ser apagado e recriado a qualquer momento.
- **Volume**: onde ficam dados que precisam sobreviver ao container (o banco). **Bind mount** liga uma pasta do seu computador ao container (o código, para editar e ver na hora).
- **Rede**: o compose cria uma rede onde os serviços se acham pelo **nome** (\`DB_HOST=db\`), sem IP.

Por que isso importa: **todo mundo roda o mesmo ambiente** (mesma versão de PHP, extensões e banco que produção), o novato sobe o projeto com um \`docker compose up\`, e dá para testar a migração para PHP 8 trocando uma linha.

Detalhes de quem já usou de verdade: PHP-FPM e Nginx em containers separados (o Nginx repassa \`.php\` para \`app:9000\`), \`healthcheck\` + \`depends_on: service_healthy\` para o app não subir antes do banco, **Xdebug** só no ambiente de dev, Composer dentro do container, \`.env\` fora do Git, e a imagem de **produção** diferente da de dev (sem Xdebug, código copiado na imagem, não montado).

Comandos do dia a dia: \`docker compose up -d\`, \`logs -f app\`, \`exec app php artisan migrate\`, \`down\` (e \`down -v\` apaga os volumes, cuidado).`,
      en: `- **Image**: the ready-made, immutable recipe (OS + PHP + extensions). Built from a Dockerfile.
- **Container**: an image running, isolated. It can be deleted and recreated at any time.
- **Volume**: where data that must outlive the container lives (the database). A **bind mount** links a folder on your machine to the container (the code, to edit and see changes instantly).
- **Network**: compose creates a network where services find each other by **name** (\`DB_HOST=db\`), no IPs.

Why it matters: **everyone runs the same environment** (same PHP version, extensions, and database as production), a newcomer starts the project with one \`docker compose up\`, and you can test a PHP 8 migration by changing one line.

Details from real use: PHP-FPM and Nginx in separate containers (Nginx forwards \`.php\` to \`app:9000\`), \`healthcheck\` + \`depends_on: service_healthy\` so the app does not start before the database, **Xdebug** only in dev, Composer inside the container, \`.env\` out of Git, and a **production** image different from dev (no Xdebug, code copied into the image, not mounted).

Everyday commands: \`docker compose up -d\`, \`logs -f app\`, \`exec app php artisan migrate\`, \`down\` (and \`down -v\` deletes volumes, careful).`,
    },
    follow: [
      { pt: 'O app não conecta no banco com `localhost`. Por quê?', en: 'The app cannot connect to the database using `localhost`. Why?' },
      { pt: 'Como você configura o Xdebug com breakpoint no VS Code/PhpStorm dentro do container?', en: 'How do you set up Xdebug with breakpoints in VS Code/PhpStorm inside the container?' },
    ],
    flags: {
      pt: 'Confundir imagem com container, ou guardar os dados do banco dentro do container sem volume.',
      en: 'Confusing images with containers, or keeping database data inside the container without a volume.',
    },
    anchor: {
      pt: 'Docker na Sicoob (deploy, Linux, incidentes) e o TripFlow inteiro em containers (PHP 8.3, MySQL, Redis, RabbitMQ), com demo no Codespaces. Abra o compose do TripFlow e explique cada serviço: é a melhor prova possível.',
      en: 'Docker at Sicoob (deployment, Linux, incidents) and all of TripFlow in containers (PHP 8.3, MySQL, Redis, RabbitMQ), with a Codespaces demo. Open TripFlow\'s compose file and explain each service: the best proof you can offer.',
    },
  },
  {
    id: 'git-workflow-conflicts',
    cat: 'testing', type: 'concept', jobs: ['brasilcard', 'cv'],
    tags: ['Git', 'merge', 'rebase', 'conflito', 'Git Flow', 'trunk-based', 'revert', 'reset', 'cherry-pick', 'hotfix'],
    q: {
      pt: 'Explique merge × rebase, como você resolve um conflito e como faz um hotfix urgente em produção sem levar junto o que ainda não foi homologado.',
      en: 'Explain merge vs rebase, how you resolve a conflict, and how you ship an urgent production hotfix without dragging along unreleased work.',
    },
    code: {
      src: `
# Trabalhar numa branch e manter atualizada
git switch -c feat/estorno-parcial
git fetch origin
git rebase origin/main            # reaplica SEUS commits em cima da main (histórico linear)
# conflito? edite os arquivos, depois:
git add arquivo.php && git rebase --continue      # ou git rebase --abort para desistir

# Merge: junta preservando o histórico das duas linhas (cria um commit de merge)
git switch main && git merge --no-ff feat/estorno-parcial

# HOTFIX: sai da versão que está EM PRODUÇÃO (tag), não da develop
git switch -c hotfix/juros-arredondamento v2.14.0
# ...corrige, testa, abre PR...
git tag v2.14.1                    # deploy dessa tag
git switch develop && git cherry-pick <sha-do-fix>   # leva a correção para a linha de desenvolvimento

# Desfazer
git revert <sha>                   # cria um commit que desfaz: seguro em branch compartilhada
git reset --hard <sha>             # reescreve o histórico: só na SUA branch local
git push --force-with-lease        # se precisar forçar, nunca --force puro`,
    },
    a: {
      pt: `- **Merge** junta duas linhas preservando o histórico como aconteceu (com commit de merge). Seguro e rastreável.
- **Rebase** reaplica seus commits em cima da base nova: histórico linear e limpo, mas **reescreve** os commits. Regra de ouro: rebase só em branch **sua** que ninguém mais usa; nunca na \`main\` compartilhada.

**Conflito**: o Git não sabe qual mudança vale quando duas pessoas mexem nas mesmas linhas. Resolvo **entendendo a intenção** das duas mudanças (lendo o PR da outra pessoa ou conversando com ela, não só "aceitar a minha"), rodo os testes e só então continuo. Conflitos grandes indicam branch longa demais: PRs pequenos e frequentes evitam.

**Hotfix**: crio a branch a partir do que está **em produção** (a tag da versão), corrijo com teste, faço deploy dessa versão e depois levo a correção para a linha de desenvolvimento (merge ou cherry-pick), senão o bug volta no próximo release.

**Desfazer**: \`revert\` (seguro em branch compartilhada, cria um commit inverso) × \`reset\` (reescreve, só local). Se precisar forçar push na sua branch, \`--force-with-lease\`.

Também: mensagens de commit claras (Conventional Commits), proteção da \`main\` com PR + CI + review, e Git Flow (develop, release, hotfix) × trunk-based (tudo na main com feature flags) conforme o time.`,
      en: `- **Merge** joins two lines preserving history as it happened (with a merge commit). Safe and traceable.
- **Rebase** replays your commits on top of the new base: a clean, linear history, but it **rewrites** the commits. Golden rule: rebase only **your own** branch that nobody else uses; never the shared \`main\`.

**Conflicts**: Git cannot tell which change wins when two people edit the same lines. I resolve them by **understanding the intent** of both changes (reading the other PR or talking to its author, not just "accept mine"), run the tests, and only then continue. Big conflicts signal branches that live too long: small, frequent PRs avoid them.

**Hotfix**: branch from what is **in production** (the release tag), fix it with a test, deploy that version, then bring the fix back to the development line (merge or cherry-pick), otherwise the bug returns in the next release.

**Undoing**: \`revert\` (safe on shared branches, creates an inverse commit) vs \`reset\` (rewrites, local only). If you must force-push your own branch, \`--force-with-lease\`.

Also: clear commit messages (Conventional Commits), a protected \`main\` with PR + CI + review, and Git Flow (develop, release, hotfix) vs trunk-based (everything on main with feature flags) depending on the team.`,
    },
    follow: [
      { pt: 'Você commitou uma senha no repositório e já fez push. O que faz?', en: 'You committed a password and already pushed. What do you do?' },
      { pt: 'O que é `git bisect` e quando ele salva o dia?', en: 'What is `git bisect` and when does it save the day?' },
    ],
    flags: {
      pt: '`git push --force` na main. Ou resolver conflito apagando a mudança do colega sem conversar.',
      en: '`git push --force` on main. Or resolving a conflict by deleting a colleague\'s change without talking.',
    },
    anchor: {
      pt: 'Hotfixes em produção na Sicoob (GitLab CI/CD) e GitLab Issue Boards. No seu portfólio há template de PR, validação de PR e proteção com CI: são evidências de fluxo de Git maduro.',
      en: 'Production hotfixes at Sicoob (GitLab CI/CD) and GitLab Issue Boards. Your portfolio has a PR template, PR validation, and CI protection: evidence of a mature Git workflow.',
    },
  },
  {
    id: 'java-basics-for-php-dev',
    cat: 'php', type: 'concept', jobs: ['brasilcard'],
    tags: ['Java', 'JVM', 'tipagem estática', 'exceptions', 'checked', 'collections', 'equals', 'hashCode', 'Spring'],
    reported: {
      pt: 'Perguntas de Java básico aparecem em relatos de entrevistas pleno no Brasil: "== vs .equals()", "classe abstrata vs interface", "uma classe pode implementar várias interfaces?".',
      en: 'Basic Java questions appear in reports of mid-level interviews in Brazil: "== vs .equals()", "abstract class vs interface", "can a class implement multiple interfaces?".',
    },
    q: {
      pt: 'A vaga pede PHP e também Java. Para quem vem do PHP: o que muda em Java? Explique JVM, tipagem, `==` × `.equals()`, exceptions checked × unchecked e as coleções principais.',
      en: 'The role asks for PHP and also Java. Coming from PHP: what changes in Java? Explain the JVM, typing, `==` vs `.equals()`, checked vs unchecked exceptions, and the main collections.',
    },
    code: {
      src: `
// Java: tipagem estática, tudo dentro de classes, compilado para bytecode e rodado na JVM
public final class Fatura {
    private final long id;
    private final BigDecimal total;          // dinheiro: BigDecimal (nunca double)

    public Fatura(long id, BigDecimal total) { this.id = id; this.total = total; }

    @Override public boolean equals(Object o) {          // igualdade de VALOR
        return o instanceof Fatura f && f.id == this.id;
    }
    @Override public int hashCode() { return Long.hashCode(id); }   // obrigatório junto com equals
}

String a = new String("pix"), b = new String("pix");
a == b;          // false: compara REFERÊNCIA (são objetos diferentes)
a.equals(b);     // true: compara o conteúdo

// Checked exception: o compilador OBRIGA a tratar ou declarar (throws)
public String lerArquivo(Path p) throws IOException { return Files.readString(p); }
// Unchecked (RuntimeException): não obriga (IllegalArgumentException, NullPointerException)

List<Fatura> lista = new ArrayList<>();          // ordenada, aceita repetidos
Map<Long, Fatura> porId = new HashMap<>();       // chave → valor (usa hashCode/equals)
Set<String> ufs = new HashSet<>();               // sem repetidos
Optional<Fatura> f = repositorio.buscar(10L);    // em vez de devolver null`,
    },
    a: {
      pt: `**Execução**: Java é compilado (\`javac\`) para **bytecode** e roda na **JVM**, que otimiza o código em tempo de execução (JIT) e tem **garbage collector**. O processo fica de pé (como um servidor Node), diferente do PHP-FPM, que começa "do zero" a cada requisição.

**Tipagem estática e forte**: todo tipo é conhecido na compilação; muitos erros que no PHP só aparecem em produção, no Java nem compilam. Tudo vive dentro de classes; interfaces e classes abstratas funcionam como no PHP (uma classe estende **uma** e implementa **várias** interfaces).

**\`==\` × \`.equals()\`**: em objetos, \`==\` compara **referência** (é o mesmo objeto na memória?) e \`.equals()\` compara **conteúdo**. Para strings, use sempre \`.equals()\`. Quem sobrescreve \`equals\` também sobrescreve \`hashCode\`, senão \`HashMap\`/\`HashSet\` se comportam errado.

**Exceptions**: *checked* (\`IOException\`) o compilador obriga a tratar ou declarar com \`throws\`; *unchecked* (\`RuntimeException\`) não.

**Coleções**: \`List\` (\`ArrayList\`), \`Map\` (\`HashMap\`), \`Set\` (\`HashSet\`), e \`Optional\` para evitar \`null\`. Dinheiro em **\`BigDecimal\`**.

No ecossistema, **Spring Boot** é o equivalente ao Laravel (injeção de dependência, web, JPA/Hibernate ≈ Eloquent), e Maven/Gradle ≈ Composer.`,
      en: `**Execution**: Java is compiled (\`javac\`) to **bytecode** and runs on the **JVM**, which optimizes code at runtime (JIT) and has a **garbage collector**. The process stays up (like a Node server), unlike PHP-FPM, which starts "from scratch" on every request.

**Static, strong typing**: every type is known at compile time; many errors that only surface in production in PHP do not even compile in Java. Everything lives inside classes; interfaces and abstract classes work as in PHP (a class extends **one** and implements **many** interfaces).

**\`==\` vs \`.equals()\`**: for objects, \`==\` compares **references** (is it the same object in memory?) and \`.equals()\` compares **content**. For strings, always use \`.equals()\`. Whoever overrides \`equals\` also overrides \`hashCode\`, or \`HashMap\`/\`HashSet\` misbehave.

**Exceptions**: *checked* (\`IOException\`) must be handled or declared with \`throws\`; *unchecked* (\`RuntimeException\`) need not.

**Collections**: \`List\` (\`ArrayList\`), \`Map\` (\`HashMap\`), \`Set\` (\`HashSet\`), and \`Optional\` to avoid \`null\`. Money as **\`BigDecimal\`**.

In the ecosystem, **Spring Boot** is the Laravel equivalent (dependency injection, web, JPA/Hibernate ≈ Eloquent), and Maven/Gradle ≈ Composer.`,
    },
    follow: [
      { pt: 'Por que `0.1 + 0.2` também dá problema em Java, e como o `BigDecimal` resolve?', en: 'Why does `0.1 + 0.2` also misbehave in Java, and how does `BigDecimal` fix it?' },
      { pt: 'Uma classe Java pode implementar várias interfaces? E estender várias classes?', en: 'Can a Java class implement multiple interfaces? Extend multiple classes?' },
    ],
    flags: {
      pt: 'Dizer que tem experiência forte em Java sem ter. Para pleno PHP, Java costuma ser apoio: seja honesta sobre o nível e mostre que os conceitos você domina.',
      en: 'Claiming strong Java experience you do not have. For a PHP mid-level role, Java is usually supporting: be honest about your level and show you master the concepts.',
    },
    anchor: {
      pt: 'Você tem C#/ASP.NET da Sicoob, que é muito parecido com Java (JVM ≈ CLR, tipagem estática, interfaces, exceptions). Ponte honesta: "Java eu uso em nível básico; C# e TypeScript me deram a base de tipagem estática, então leio e mantenho código Java com tranquilidade".',
      en: 'You have C#/ASP.NET from Sicoob, which is very similar to Java (JVM ≈ CLR, static typing, interfaces, exceptions). Honest bridge: "I use Java at a basic level; C# and TypeScript gave me the static-typing foundation, so I can read and maintain Java code comfortably".',
    },
  },

  {
    id: 'clean-architecture-php',
    cat: 'architecture', type: 'code', jobs: ['brasilcard', 'brainrocket'],
    tags: ['Clean Architecture', 'casos de uso', 'regra de dependência', 'ports and adapters', 'hexagonal', 'DDD', 'Laravel'],
    q: {
      pt: 'A vaga cita Clean Architecture e DDD como diferencial. Como você organizaria o caso de uso "pagar fatura" num projeto Laravel (ou CodeIgniter) seguindo Clean Architecture?',
      en: 'The role lists Clean Architecture and DDD as a plus. How would you organize the "pay invoice" use case in a Laravel (or CodeIgniter) project following Clean Architecture?',
    },
    code: {
      src: `
<?php
// Domain/ — regras puras: não conhece Laravel, banco nem HTTP
final class Fatura
{
    public function __construct(
        public readonly int $id,
        private Money $saldoDevedor,
        private StatusFatura $status,
    ) {}

    public function pagar(Money $valor): PagamentoRegistrado
    {
        if ($this->status === StatusFatura::Paga) throw new FaturaJaPaga($this->id);
        if ($valor->maiorQue($this->saldoDevedor)) throw new ValorAcimaDoDevido($this->id);
        $this->saldoDevedor = $this->saldoDevedor->menos($valor);
        if ($this->saldoDevedor->ehZero()) $this->status = StatusFatura::Paga;
        return new PagamentoRegistrado($this->id, $valor);        // evento de domínio
    }
}

interface FaturaRepository { public function porId(int $id): Fatura; public function salvar(Fatura $f): void; }

// Application/ — o caso de uso orquestra; depende só de INTERFACES (portas)
final class PagarFatura
{
    public function __construct(private FaturaRepository $faturas, private Transacao $tx, private Eventos $eventos) {}

    public function executar(int $faturaId, Money $valor): void
    {
        $this->tx->executar(function () use ($faturaId, $valor) {
            $fatura = $this->faturas->porId($faturaId);
            $evento = $fatura->pagar($valor);
            $this->faturas->salvar($fatura);
            $this->eventos->registrar($evento);                     // outbox
        });
    }
}

// Infrastructure/ — detalhes: Eloquent, SQL Server, filas (implementam as interfaces)
final class EloquentFaturaRepository implements FaturaRepository { /* ... */ }

// Http/ — o controller só traduz HTTP → caso de uso
final class PagamentoController
{
    public function store(PagarFaturaRequest $r, PagarFatura $pagar): JsonResponse
    {
        $pagar->executar($r->integer('fatura_id'), Money::centavos($r->integer('valor_centavos')));
        return response()->json(status: 201);
    }
}
// AppServiceProvider: $this->app->bind(FaturaRepository::class, EloquentFaturaRepository::class);`,
    },
    a: {
      pt: `A ideia central é a **regra de dependência**: o código de dentro (regras de negócio) não conhece o de fora (framework, banco, HTTP, filas). As dependências apontam **para dentro**.

Camadas, de dentro para fora:

- **Domínio**: entidades e value objects com as regras (\`Fatura::pagar\` sabe que não se paga fatura já paga). Sem Laravel, testável com PHPUnit puro em milissegundos.
- **Aplicação (casos de uso)**: orquestra um fluxo (\`PagarFatura\`): busca, chama o domínio, salva, publica o evento. Depende de **interfaces** (portas) como \`FaturaRepository\`.
- **Infraestrutura (adaptadores)**: implementações concretas: Eloquent, Query Builder do CI3, SQL Server, Redis, filas.
- **Entrada**: controllers, comandos de console e consumidores de fila só traduzem o mundo externo para o caso de uso.

Ganhos: trocar banco ou framework sem reescrever regra, testar regra sem banco, e o caso de uso reaproveitado por HTTP, fila e comando. É assim também que se **migra do CI3 para o Laravel**: o domínio vai junto, só a casca muda.

Ressalva de quem já aplicou: para CRUD simples isso é cerimônia demais. Aplico onde a regra é rica (pagamentos, faturas, limites de crédito) e mantenho simples o resto. DDD complementa: \`Fatura\` é um **agregado**, \`Money\` um **value object**, \`PagamentoRegistrado\` um **evento de domínio**.`,
      en: `The core idea is the **dependency rule**: inner code (business rules) knows nothing about the outer code (framework, database, HTTP, queues). Dependencies point **inward**.

Layers, inside out:

- **Domain**: entities and value objects holding the rules (\`Fatura::pagar\` knows a paid invoice cannot be paid). No Laravel; testable with plain PHPUnit in milliseconds.
- **Application (use cases)**: orchestrates a flow (\`PagarFatura\`): load, call the domain, save, publish the event. Depends on **interfaces** (ports) like \`FaturaRepository\`.
- **Infrastructure (adapters)**: concrete implementations: Eloquent, CI3 Query Builder, SQL Server, Redis, queues.
- **Entry points**: controllers, console commands, and queue consumers only translate the outside world into the use case.

Benefits: swap database or framework without rewriting rules, test rules without a database, and reuse the use case from HTTP, queues, and commands. It is also how you **migrate from CI3 to Laravel**: the domain moves along, only the shell changes.

A practitioner's caveat: for simple CRUD this is too much ceremony. I apply it where rules are rich (payments, invoices, credit limits) and keep the rest simple. DDD complements it: \`Fatura\` is an **aggregate**, \`Money\` a **value object**, \`PagamentoRegistrado\` a **domain event**.`,
    },
    follow: [
      { pt: 'Onde fica a validação: no Form Request, no caso de uso ou na entidade?', en: 'Where does validation live: the Form Request, the use case, or the entity?' },
      { pt: 'Como você garante, no CI, que o domínio não importa nada do Laravel? (testes de arquitetura)', en: 'How do you ensure in CI that the domain imports nothing from Laravel? (architecture tests)' },
    ],
    flags: {
      pt: 'Desenhar as quatro camadas sem saber explicar a regra de dependência. Ou "Clean Architecture é ter pastas Domain/Application/Infra".',
      en: 'Drawing the four layers without being able to explain the dependency rule. Or "Clean Architecture means having Domain/Application/Infra folders".',
    },
    anchor: {
      pt: 'O TripFlow usa Pest com testes de arquitetura e Larastan nível 8: é a prova de que você não só conhece a teoria, como faz o CI barrar dependência na direção errada. O caso de uso de aprovação com lock e outbox é o exemplo para contar.',
      en: 'TripFlow uses Pest with architecture tests and Larastan level 8: proof that you not only know the theory but make CI block dependencies in the wrong direction. Its approval use case with locking and an outbox is the example to tell.',
    },
  },
  {
    id: 'payments-card-lifecycle',
    cat: 'payments', type: 'architecture', jobs: ['brasilcard'],
    noGloss: ['authz'],   // aqui "autorização" é da compra no cartão, não de permissão
    tags: ['autorização', 'captura', 'estorno', 'chargeback', 'fatura', 'conciliação', 'private label', 'limite de crédito', 'PCI DSS'],
    q: {
      pt: 'Explique o ciclo de uma compra no cartão: autorização, captura, estorno, fatura, chargeback e conciliação. Como você modelaria isso no banco para não perder nem duplicar dinheiro?',
      en: 'Explain the lifecycle of a card purchase: authorization, capture, refund, statement, chargeback, and reconciliation. How would you model it in the database so money is never lost or duplicated?',
    },
    a: {
      pt: `**Ciclo de uma compra** (cartão de crédito, inclusive *private label*, o cartão de loja que a Brasil Card emite):

1. **Autorização**: na hora da compra, o emissor verifica cartão, senha, limite disponível e regras antifraude, e **reserva** o valor no limite. Ainda não é uma dívida.
2. **Captura (confirmação)**: o lojista confirma a venda; a transação vira lançamento. Autorizações não capturadas expiram e devolvem o limite.
3. **Cancelamento × estorno**: cancelar antes da captura libera o limite; estornar depois gera um **lançamento de crédito** (total ou parcial) na fatura. Nunca se apaga a transação original.
4. **Fatura**: no fechamento, as transações do ciclo viram a fatura (com parcelas, juros e encargos de atraso); o pagamento abate o saldo e **restaura o limite**.
5. **Chargeback**: o portador contesta; o valor é estornado provisoriamente e o lojista pode contestar.
6. **Conciliação**: comparar diariamente o que o sistema registrou com os arquivos da adquirente/processadora e do banco. Diferenças viram pendências investigadas.

**Modelagem para não perder nem duplicar**:

- **Livro-razão (ledger) imutável**: cada movimento é um lançamento (débito/crédito) com valor em centavos; correções são **novos lançamentos**, nunca \`UPDATE\` no valor. O saldo é a soma (ou um saldo materializado, atualizado na mesma transação).
- **Idempotência** em toda mensagem externa (ID da transação da rede/processadora com constraint única).
- **Máquina de estados** explícita (AUTORIZADA → CAPTURADA → ESTORNADA…) com transições validadas.
- **Transação + lock** ao mexer no limite, para duas compras simultâneas não estourarem o limite.
- **Auditoria**: quem, quando e por quê, e nunca guardar PAN/CVV (PCI DSS: tokenização).`,
      en: `**Purchase lifecycle** (credit card, including *private label*, the store card Brasil Card issues):

1. **Authorization**: at purchase time, the issuer checks the card, PIN, available limit, and anti-fraud rules, and **holds** the amount against the limit. It is not a debt yet.
2. **Capture (confirmation)**: the merchant confirms the sale; the transaction becomes a posting. Uncaptured authorizations expire and release the limit.
3. **Void vs refund**: voiding before capture releases the limit; refunding afterwards creates a **credit posting** (full or partial) on the statement. The original transaction is never deleted.
4. **Statement**: at closing, the cycle's transactions form the statement (with installments, interest, and late fees); payment reduces the balance and **restores the limit**.
5. **Chargeback**: the cardholder disputes; the amount is provisionally credited and the merchant may contest.
6. **Reconciliation**: daily comparison of what the system recorded against the acquirer/processor and bank files. Differences become investigated exceptions.

**Modeling so nothing is lost or duplicated**:

- **Immutable ledger**: each movement is a posting (debit/credit) in cents; corrections are **new postings**, never an \`UPDATE\` on the amount. The balance is the sum (or a materialized balance updated in the same transaction).
- **Idempotency** on every external message (the network/processor transaction ID under a unique constraint).
- An explicit **state machine** (AUTHORIZED → CAPTURED → REFUNDED…) with validated transitions.
- **Transaction + lock** when touching the limit, so two simultaneous purchases cannot exceed it.
- **Auditing**: who, when, and why, and never storing PAN/CVV (PCI DSS: tokenization).`,
    },
    follow: [
      { pt: 'Duas compras chegam ao mesmo tempo e só há limite para uma. O que acontece no seu modelo?', en: 'Two purchases arrive at once and the limit only covers one. What happens in your model?' },
      { pt: 'A conciliação mostrou uma transação na processadora que não existe no seu sistema. Como você investiga?', en: 'Reconciliation shows a transaction at the processor that does not exist in your system. How do you investigate?' },
    ],
    flags: {
      pt: 'Atualizar o saldo com `UPDATE saldo = saldo - x` sem histórico de lançamentos. Ou apagar a transação para "estornar".',
      en: 'Updating the balance with `UPDATE balance = balance - x` without a postings history. Or deleting the transaction to "refund" it.',
    },
    anchor: {
      pt: 'Sicoob (cooperativas de crédito) é a sua experiência mais próxima desse domínio: fale do cuidado com consistência que você aprendeu lá ("consistência antes de velocidade", como diz seu portfólio). O lab "Transações e locks" mostra o limite sendo estourado e a correção.',
      en: 'Sicoob (credit unions) is your closest experience to this domain: talk about the consistency discipline you learned there ("consistency before speed", as your portfolio says). The "Transactions and locks" lab shows the limit being exceeded and the fix.',
    },
  },
  {
    id: 'phpunit-tdd-service',
    cat: 'testing', type: 'code', jobs: ['brasilcard', 'cv'],
    tags: ['PHPUnit', 'Pest', 'TDD', 'mock', 'test double', 'teste de caracterização', 'data provider'],
    q: {
      pt: 'TDD é diferencial na vaga. Escreva em PHPUnit os testes do cálculo de encargos de uma fatura em atraso (multa de 2% + juros de 1% ao mês pro rata) e mostre como testar um serviço que depende do banco.',
      en: 'TDD is a plus for the role. Write PHPUnit tests for late-fee calculation on an overdue invoice (2% fine + 1% monthly interest pro rata) and show how to test a service that depends on the database.',
    },
    code: {
      src: `
<?php
use PHPUnit\\Framework\\Attributes\\DataProvider;
use PHPUnit\\Framework\\TestCase;

final class EncargosAtrasoTest extends TestCase
{
    #[DataProvider('casos')]
    public function test_calcula_encargos(int $valor, int $diasAtraso, int $esperado): void
    {
        self::assertSame($esperado, (new EncargosAtraso())->calcular($valor, $diasAtraso));
    }

    public static function casos(): array
    {
        return [
            'em dia não cobra nada'        => [10000, 0, 0],
            '1 dia: multa 200 + juros 3'    => [10000, 1, 203],    // 1%/30 dias ≈ 0,0333% ao dia
            '30 dias: multa 200 + juros 100'=> [10000, 30, 300],
            'arredonda para baixo'         => [999, 10, 23],      // 19,98 + 3,33 → 23
        ];
    }

    public function test_rejeita_dias_negativos(): void
    {
        $this->expectException(InvalidArgumentException::class);
        (new EncargosAtraso())->calcular(10000, -1);
    }
}

final class EncargosAtraso
{
    public function calcular(int $valorCentavos, int $diasAtraso): int
    {
        if ($diasAtraso < 0) throw new InvalidArgumentException('dias negativos');
        if ($diasAtraso === 0) return 0;
        $multa = intdiv($valorCentavos * 2, 100);
        $juros = intdiv($valorCentavos * $diasAtraso, 100 * 30);
        return $multa + $juros;
    }
}

// Serviço com dependência: troque o repositório por um "fake" em memória
final class CobrarAtrasoTest extends TestCase
{
    public function test_lanca_encargo_na_fatura_vencida(): void
    {
        $repo = new FaturaRepositoryEmMemoria([new Fatura(id: 1, valor: 10000, vencimento: '2026-10-01')]);
        $servico = new CobrarAtraso($repo, new EncargosAtraso(), relogio: new RelogioFixo('2026-10-31'));

        $servico->executar(1);

        self::assertSame(300, $repo->porId(1)->encargosCentavos);
    }
}`,
    },
    a: {
      pt: `**TDD** na prática: escrevo o caso mais simples ("em dia não cobra nada"), vejo falhar, implemento o mínimo, e vou adicionando casos (1 dia, 30 dias, arredondamento, entrada inválida). Cada caso de borda que discuto com o PO vira uma linha do **data provider**, que funciona como documentação viva da regra.

Pontos que mostram maturidade no exemplo:

- \`assertSame\` (estrito) em vez de \`assertEquals\`.
- Dinheiro em centavos e **regra de arredondamento explícita** no teste.
- **Relógio injetado** (\`RelogioFixo\`): teste que depende de \`date('Y-m-d')\` quebra no dia seguinte (é flaky).
- Para o serviço que depende do banco: um **fake em memória** do repositório para o teste unitário, e um **teste de integração** separado com banco real (Docker, SQLite em memória ou transação revertida no fim, como o \`RefreshDatabase\` do Laravel).
- **Mock** (PHPUnit \`createMock\`, Mockery) só para o que eu não controlo: gateway de pagamento, e-mail, ERP.

**Em código legado sem testes**: antes de mexer, escrevo **testes de caracterização**, que registram o comportamento atual (mesmo que esquisito) para eu não quebrar nada sem perceber, e só então refatoro.`,
      en: `**TDD** in practice: I write the simplest case ("on time charges nothing"), watch it fail, implement the minimum, and keep adding cases (1 day, 30 days, rounding, invalid input). Each edge case I discuss with the PO becomes a row in the **data provider**, which works as living documentation of the rule.

Signs of maturity in the example:

- \`assertSame\` (strict) instead of \`assertEquals\`.
- Money in cents and an **explicit rounding rule** in the test.
- An **injected clock** (\`RelogioFixo\`): a test depending on \`date('Y-m-d')\` breaks the next day (it is flaky).
- For the database-dependent service: an **in-memory fake** repository for the unit test, plus a separate **integration test** with a real database (Docker, in-memory SQLite, or a transaction rolled back at the end, like Laravel's \`RefreshDatabase\`).
- **Mocks** (PHPUnit \`createMock\`, Mockery) only for what I do not control: payment gateway, email, ERP.

**In legacy code without tests**: before changing anything I write **characterization tests** that capture current behavior (even if odd) so I do not break anything unknowingly, and only then refactor.`,
    },
    follow: [
      { pt: 'Qual a diferença entre mock, stub e fake?', en: 'What is the difference between a mock, a stub, and a fake?' },
      { pt: 'Como você rodaria esses testes no pipeline do GitLab/GitHub?', en: 'How would you run these tests in a GitLab/GitHub pipeline?' },
    ],
    flags: {
      pt: 'Teste que usa a data de hoje, ou mockar o próprio banco em tudo e nunca ter um teste de integração.',
      en: 'Tests that depend on today\'s date, or mocking the database everywhere and never having an integration test.',
    },
    anchor: {
      pt: 'PHPUnit na Sicoob; Pest (inclusive testes de arquitetura) e teste de concorrência com duas conexões MySQL no TripFlow. O lab "TDD" do app roda esse ciclo ao vivo em JavaScript: pratique lá e traduza para PHP.',
      en: 'PHPUnit at Sicoob; Pest (including architecture tests) and a two-connection MySQL concurrency test in TripFlow. The app\'s "TDD" lab runs this cycle live in JavaScript: practice there and translate to PHP.',
    },
  },
  {
    id: 'legacy-production-bug',
    cat: 'php', type: 'behavioral', jobs: ['brasilcard', 'cv'],
    tags: ['bug em produção', 'legado', 'debug', 'Xdebug', 'logs', 'teste de caracterização', 'hotfix', 'manutenção'],
    reported: {
      pt: 'A vaga fala em "manutenção contínua de software existente, corrigindo bugs". "Como você investiga um bug em produção" é uma das perguntas mais comuns para esse perfil.',
      en: 'The role mentions "continuous maintenance of existing software, fixing bugs". "How do you investigate a production bug" is one of the most common questions for this profile.',
    },
    q: {
      pt: 'Chega um chamado: "alguns clientes estão vendo o valor da fatura errado". O sistema é PHP legado, sem testes. Passo a passo, o que você faz?',
      en: 'A ticket arrives: "some customers see the wrong invoice amount". The system is legacy PHP with no tests. Step by step, what do you do?',
    },
    a: {
      pt: `1. **Entender e medir o impacto**: quais clientes, desde quando, qual a diferença de valor, se está crescendo. Em fatura, já envolvo o responsável do negócio: pode precisar suspender a emissão ou avisar o atendimento.
2. **Conter** antes de corrigir, se o dano está aumentando (feature flag, parar o job de fechamento, rollback do último deploy se coincidir).
3. **Reproduzir** com um caso real: pegar um cliente afetado e um não afetado e comparar os dados. Olhar **logs**, o histórico do Git (\`git log\`/\`blame\` no trecho; o que mudou recentemente?), dados no banco e, localmente em Docker com uma cópia anonimizada, **Xdebug** com breakpoint.
4. **Achar a causa raiz**, não só o sintoma: arredondamento com float, \`==\` frouxo, fuso horário no corte da fatura, query sem \`ORDER BY\`, condição de corrida entre dois jobs…
5. **Escrever um teste que falha** reproduzindo o bug (teste de caracterização no legado), corrigir até passar, e rodar os testes do entorno.
6. **Corrigir os dados afetados** com script revisado, em transação, com backup e registro do que mudou. Em dinheiro, nada de \`UPDATE\` manual no banco de produção sem revisão.
7. **Deploy** como hotfix a partir da versão em produção, acompanhando logs e métricas depois.
8. **Comunicar e aprender**: atualizar o chamado, explicar ao negócio em linguagem simples e fazer um postmortem sem culpados (alerta novo, validação, teste).`,
      en: `1. **Understand and size the impact**: which customers, since when, how large the difference, whether it is growing. With invoices, I bring in the business owner early: issuing may need to pause or support may need a heads-up.
2. **Contain** before fixing if the damage is growing (feature flag, pause the closing job, roll back the last deploy if it coincides).
3. **Reproduce** with a real case: take an affected and an unaffected customer and compare the data. Check **logs**, Git history (\`git log\`/\`blame\` on the code; what changed recently?), database data and, locally in Docker with an anonymized copy, **Xdebug** with breakpoints.
4. **Find the root cause**, not just the symptom: float rounding, loose \`==\`, time zone at statement cutoff, a query without \`ORDER BY\`, a race between two jobs…
5. **Write a failing test** reproducing the bug (a characterization test in legacy), fix it until it passes, and run the surrounding tests.
6. **Fix the affected data** with a reviewed script, in a transaction, with a backup and a record of what changed. With money, no manual \`UPDATE\` on production without review.
7. **Deploy** as a hotfix from the production version, watching logs and metrics afterwards.
8. **Communicate and learn**: update the ticket, explain it to the business in plain words, and run a blameless postmortem (new alert, validation, test).`,
    },
    follow: [
      { pt: 'Você não consegue reproduzir localmente. E agora?', en: 'You cannot reproduce it locally. Now what?' },
      { pt: 'Como você corrige os dados de 3 mil faturas com segurança?', en: 'How do you safely fix the data of 3,000 invoices?' },
    ],
    flags: {
      pt: 'Ir direto ao código e "consertar" sem reproduzir nem medir o impacto. Ou corrigir o dado na mão em produção.',
      en: 'Jumping straight into code and "fixing" it without reproducing or sizing the impact. Or editing data by hand in production.',
    },
    anchor: {
      pt: 'Sustentação em produção é o seu dia a dia: hotfixes e investigação de incidentes na Sicoob, legado PHP MVC na ZR System, sustentação no Grupo Mysa. Prepare um caso real nesse roteiro (STAR) com 2 minutos.',
      en: 'Production support is your daily work: hotfixes and incident investigation at Sicoob, legacy PHP MVC at ZR System, support at Grupo Mysa. Prepare one real case in this outline (STAR) in 2 minutes.',
    },
  },
  {
    id: 'gcp-services-map',
    cat: 'devops', type: 'concept', jobs: ['brasilcard'],
    tags: ['GCP', 'Cloud Run', 'GKE', 'Cloud SQL', 'Pub/Sub', 'Cloud Storage', 'Secret Manager', 'IAM', 'AWS', 'Azure'],
    q: {
      pt: 'Serviços GCP são diferencial. Se você conhece AWS e Azure, como faria o deploy de uma aplicação PHP com banco e filas no Google Cloud?',
      en: 'GCP services are a plus. If you know AWS and Azure, how would you deploy a PHP application with a database and queues on Google Cloud?',
    },
    a: {
      pt: `Os conceitos são os mesmos nas três nuvens; muda o nome:

| Necessidade | GCP | AWS | Azure |
| --- | --- | --- | --- |
| Rodar container sem gerenciar servidor | **Cloud Run** | App Runner / ECS Fargate | Container Apps |
| Kubernetes gerenciado | **GKE** | EKS | AKS |
| Banco relacional gerenciado (MySQL, PostgreSQL, SQL Server) | **Cloud SQL** | RDS | Azure SQL / Database for MySQL |
| Fila / pub-sub | **Pub/Sub**, Cloud Tasks | SQS / SNS | Service Bus |
| Arquivos | **Cloud Storage** | S3 | Blob Storage |
| Segredos | **Secret Manager** | Secrets Manager | Key Vault |
| Permissões | **IAM** + service accounts | IAM roles | Entra ID / managed identity |
| Logs e métricas | **Cloud Logging / Monitoring** | CloudWatch | Azure Monitor |

Para uma aplicação PHP: imagem Docker publicada no **Artifact Registry** pelo CI → **Cloud Run** (escala sozinho, inclusive a zero) ou **GKE** se a empresa já usa Kubernetes → **Cloud SQL** conectado por conector/IP privado → segredos no **Secret Manager** → workers de fila como outro serviço Cloud Run consumindo **Pub/Sub** → logs estruturados indo para o Cloud Logging.

Cuidados: cada serviço com uma **service account** de permissões mínimas, banco sem IP público, e região próxima dos usuários (\`southamerica-east1\`, São Paulo).`,
      en: `The concepts are the same across the three clouds; only the names change:

| Need | GCP | AWS | Azure |
| --- | --- | --- | --- |
| Run containers without managing servers | **Cloud Run** | App Runner / ECS Fargate | Container Apps |
| Managed Kubernetes | **GKE** | EKS | AKS |
| Managed relational DB (MySQL, PostgreSQL, SQL Server) | **Cloud SQL** | RDS | Azure SQL / Database for MySQL |
| Queue / pub-sub | **Pub/Sub**, Cloud Tasks | SQS / SNS | Service Bus |
| Files | **Cloud Storage** | S3 | Blob Storage |
| Secrets | **Secret Manager** | Secrets Manager | Key Vault |
| Permissions | **IAM** + service accounts | IAM roles | Entra ID / managed identity |
| Logs and metrics | **Cloud Logging / Monitoring** | CloudWatch | Azure Monitor |

For a PHP app: a Docker image pushed to **Artifact Registry** by CI → **Cloud Run** (autoscaling, even to zero) or **GKE** if the company already runs Kubernetes → **Cloud SQL** connected via connector/private IP → secrets in **Secret Manager** → queue workers as another Cloud Run service consuming **Pub/Sub** → structured logs flowing into Cloud Logging.

Care points: each service with a least-privilege **service account**, no public IP on the database, and a region close to users (\`southamerica-east1\`, São Paulo).`,
    },
    follow: [
      { pt: 'Cloud Run ou GKE: como você escolhe?', en: 'Cloud Run or GKE: how do you choose?' },
      { pt: 'Como uma aplicação PHP stateless lida com sessão e uploads quando há várias instâncias?', en: 'How does a stateless PHP app handle sessions and uploads with multiple instances?' },
    ],
    flags: {
      pt: 'Dizer que tem experiência em GCP sem ter. É diferencial, não requisito: mostrar que mapeia o que já sabe é suficiente.',
      en: 'Claiming GCP experience you do not have. It is a plus, not a requirement: showing you can map what you already know is enough.',
    },
    anchor: {
      pt: 'Você tem AWS (Grupo Mysa) e Azure (Sicoob). Frase pronta: "Em produção usei AWS e Azure; GCP eu conheço pelo mapeamento dos serviços, e a parte que importa (containers, banco gerenciado, filas, IAM) é a mesma".',
      en: 'You have AWS (Grupo Mysa) and Azure (Sicoob). Ready line: "In production I have used AWS and Azure; I know GCP through service mapping, and what matters (containers, managed databases, queues, IAM) is the same".',
    },
  },
  {
    id: 'behavioral-brasilcard-fit',
    cat: 'agile', type: 'behavioral', jobs: ['brasilcard'],
    tags: ['RH', 'gestor', 'onde se vê em 5 anos', 'por que a empresa', 'pretensão salarial', 'pleno', 'remoto'],
    reported: {
      pt: 'Sim. Nos relatos da própria Brasil Card no Glassdoor, a entrevista com RH e depois com o gestor perguntou "Como você se vê daqui 5 anos?", "Como conheceu a empresa?" e sobre experiência, formação e trabalho atual.',
      en: 'Yes. In Brasil Card\'s own Glassdoor reports, the HR interview followed by the manager interview asked "Where do you see yourself in 5 years?", "How did you learn about the company?" and about experience, education, and current job.',
    },
    q: {
      pt: 'Entrevista com o gestor: "Fale de você. Por que a Brasil Card? Onde você se vê em 5 anos? Você tem experiência de sênior, por que uma vaga pleno?"',
      en: 'Manager interview: "Tell me about yourself. Why Brasil Card? Where do you see yourself in 5 years? You have senior-level experience, why a mid-level role?"',
    },
    a: {
      pt: `**Fale de você (90 s)**: presente → passado → por que esta vaga. "Sou desenvolvedora full stack com 5 anos em sistemas financeiros, ERP e e-commerce. Hoje trabalho com PHP/Laravel, integrações e Salesforce no Grupo Mysa. Antes, três anos na Sicoob com sistemas de cooperativas de crédito em PHP/Laravel, SQL Server e Docker. O que mais gosto é manter sistemas críticos funcionando e evoluindo sem quebrar a operação, que é o que esta vaga descreve."

**Por que a Brasil Card**: algo específico e verdadeiro. É uma instituição de pagamentos (domínio onde consistência importa e onde você já tem vivência), stack que você domina (PHP, Laravel, SQL Server, MySQL, Docker), trabalho remoto e um sistema real com usuários reais. Pesquise antes: produtos (cartão private label, conta digital), há quanto tempo existe, quantas lojas parceiras.

**Daqui a 5 anos**: crescimento ligado à empresa, sem soar como "vou embora": "quero ser referência técnica no domínio de pagamentos do time, ajudando a modernizar o legado e a formar outras pessoas".

**Sênior em vaga pleno**: sem se desvalorizar nem parecer que está de passagem. "Quero estar num domínio financeiro com essa stack; o nível do cargo importa menos que o problema. Sei que a experiência ajuda a entregar rápido e espero crescer aqui por mérito." Se perguntarem salário, tenha uma **faixa** pesquisada para pleno PHP remoto e responda com ela.

**Como conheceu a empresa**: resposta honesta e curta (plataforma de vagas) + o que te chamou atenção na descrição.`,
      en: `**Tell me about yourself (90 s)**: present → past → why this role. "I am a full stack developer with 5 years in financial systems, ERP, and e-commerce. Today I work with PHP/Laravel, integrations, and Salesforce at Grupo Mysa. Before that, three years at Sicoob on credit-union systems in PHP/Laravel, SQL Server, and Docker. What I enjoy most is keeping critical systems running and evolving without breaking operations, which is what this role describes."

**Why Brasil Card**: something specific and true. A payments institution (a domain where consistency matters and where you have experience), a stack you master (PHP, Laravel, SQL Server, MySQL, Docker), remote work, and a real system with real users. Research first: products (private label card, digital account), company age, partner stores.

**In 5 years**: growth tied to the company, without sounding like "I will leave": "I want to be a technical reference in the team's payments domain, helping modernize the legacy and mentoring others".

**Senior in a mid-level role**: neither undervalue yourself nor seem to be passing through. "I want to be in a financial domain with this stack; the title matters less than the problem. I know my experience helps me deliver fast and I expect to grow here on merit." If asked about salary, have a researched **range** for remote mid-level PHP and answer with it.

**How did you learn about us**: short and honest (job platform) + what caught your attention in the description.`,
    },
    follow: [
      { pt: 'Qual foi o maior desafio técnico do seu trabalho atual?', en: 'What was the biggest technical challenge in your current job?' },
      { pt: 'Você trabalha bem sozinha, remota? Como se organiza?', en: 'Do you work well alone, remotely? How do you organize yourself?' },
    ],
    flags: {
      pt: 'Responder "onde se vê em 5 anos" com "em outra empresa/no exterior". Ou falar mal do emprego atual.',
      en: 'Answering "where in 5 years" with "at another company/abroad". Or badmouthing your current job.',
    },
    anchor: {
      pt: 'Use os dados reais do seu portfólio: 5 anos, Sicoob (financeiro), Grupo Mysa (atual), ZR System (legado PHP MVC), Easy Process (Oracle). Ensaie em voz alta com o cronômetro de 3 minutos do app.',
      en: 'Use the real facts from your portfolio: 5 years, Sicoob (finance), Grupo Mysa (current), ZR System (legacy PHP MVC), Easy Process (Oracle). Rehearse out loud with the app\'s 3-minute timer.',
    },
  },
];
