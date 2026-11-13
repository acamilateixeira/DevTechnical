// Defesa de um desafio técnico de carteira digital (PHP 7.4 + Laravel 8 + MySQL 8):
// as perguntas que um avaliador faz no code review sobre dinheiro, livro-razão, concorrência,
// banco, erros, sessão, datas, Docker e escopo.

export default [
  {
    id: 'wallet-money-bigint-decimal',
    cat: 'payments', type: 'concept', jobs: ['desafio-carteira', 'php-fintech'],
    tags: ['bigint', 'DECIMAL', 'centavos', 'cents', 'value object', 'imutável', 'immutable', 'Money'],
    q: {
      pt: 'Por que guardar dinheiro em centavos num bigint e não em DECIMAL(15,2), que também é exato? E por que o objeto Money é imutável e confere "maior que zero" se o formulário já valida?',
      en: 'Why store money as cents in a bigint and not as DECIMAL(15,2), which is also exact? And why is the Money object immutable and checking "greater than zero" if the form already validates it?',
    },
    code: {
      src: `
final class Money
{
    /** @var int */
    private $cents;

    public function add(Money $other): Money
    {
        return new Money($this->cents + $other->cents); // devolve um novo, não muda o atual
    }

    public function assertPositive(): Money
    {
        if ($this->cents <= 0) {
            throw InvalidAmount::notPositive();          // vale para tela, comando, fila e teste
        }
        return $this;
    }
}`,
    },
    a: {
      pt: `**bigint × DECIMAL:** no banco, os dois são exatos. A diferença está no PHP:
- O PHP não tem tipo decimal. Uma coluna \`DECIMAL\` chega como **string**, e fazer conta com ela exige \`bcmath\` ou uma biblioteca, ou converter para float, que é justamente o erro que eu quero evitar.
- Com \`bigint\` o valor chega como \`int\`: soma e comparação são exatas, rápidas e iguais em qualquer banco.

Se o avaliador defender o DECIMAL, eu concordo que ele é exato e mais legível em relatórios SQL. Eu escolheria DECIMAL(19,4) com uma biblioteca como a brick/money quando houver **frações de centavo** (juros, câmbio, rateio). Para depósito e transferência em reais, centavos inteiros resolvem com menos peças.

**Imutável:** \`add()\` e \`subtract()\` devolvem um objeto novo. Se o mesmo valor é usado no débito de uma carteira e no crédito da outra, ninguém consegue alterá-lo no meio do caminho por engano. É o comportamento de um value object: dois \`Money\` com o mesmo valor são iguais, e não "o mesmo objeto que mudou".

**"Maior que zero" em dois lugares:**
- O Form Request valida para dar a mensagem certa no campo certo.
- O \`Money\` garante a regra **em qualquer porta de entrada**: um comando Artisan, um job, um teste, uma API futura. Se a regra estivesse só no formulário, um comando que chamasse a action direto poderia transferir zero ou valor negativo.`,
      en: `**bigint × DECIMAL:** in the database both are exact. The difference is in PHP:
- PHP has no decimal type. A \`DECIMAL\` column arrives as a **string**, and doing math with it needs \`bcmath\` or a library, or a float conversion, which is exactly the error I want to avoid.
- With \`bigint\` the value arrives as an \`int\`: addition and comparison are exact, fast, and the same in any database.

If the reviewer argues for DECIMAL, I agree it is exact and easier to read in SQL reports. I would pick DECIMAL(19,4) with a library like brick/money when there are **fractions of a cent** (interest, FX, splitting). For deposits and transfers in reais, integer cents do the job with fewer moving parts.

**Immutable:** \`add()\` and \`subtract()\` return a new object. If the same amount is used for one wallet's debit and the other's credit, nobody can change it halfway by mistake. That is how a value object behaves: two \`Money\` with the same amount are equal, not "the same object that changed".

**"Greater than zero" in two places:**
- The Form Request validates to show the right message on the right field.
- \`Money\` enforces the rule **at every entry point**: an Artisan command, a job, a test, a future API. If the rule lived only in the form, a command calling the action directly could transfer zero or a negative amount.`,
    },
    follow: [
      { pt: 'Quando você trocaria para DECIMAL(19,4)?', en: 'When would you switch to DECIMAL(19,4)?' },
      { pt: 'O que acontece com um int de 64 bits somando valores muito grandes? Como o Money se protege?', en: 'What happens to a 64-bit int when adding very large values? How does Money protect itself?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: `app/ValueObjects/Money.php` e `tests/Unit/ValueObjects/MoneyTest.php`. Abra o teste de imutabilidade e o de saldo negativo + depósito na hora de responder.',
      en: 'In the wallet take-home: `app/ValueObjects/Money.php` and `tests/Unit/ValueObjects/MoneyTest.php`. Open the immutability test and the negative-balance + deposit test when answering.',
    },
    flags: {
      pt: '"Uso float com round() no final." Ou não saber que o PHP recebe DECIMAL como string.',
      en: '"I use float and round() at the end." Or not knowing PHP receives DECIMAL as a string.',
    },
  },

  {
    id: 'wallet-ledger-reversal',
    cat: 'payments', type: 'architecture', jobs: ['desafio-carteira', 'php-fintech', 'backend-php-node'],
    tags: ['livro-razão', 'ledger', 'estorno', 'reversal', 'soft delete', 'reconciliação', 'reconciliation'],
    q: {
      pt: 'Por que a reversão cria uma operação nova em vez de apagar a original ou usar soft delete? Mostre no extrato um depósito, um gasto e o estorno do depósito. E por que a reconciliação só avisa e não corrige sozinha?',
      en: 'Why does a reversal create a new operation instead of deleting the original or using soft delete? Show a deposit, a spend, and the deposit\'s reversal on the statement. And why does reconciliation only warn instead of fixing things itself?',
    },
    a: {
      pt: `O sistema guarda o **livro-razão**: cada operação gera lançamentos de + e − que nunca são editados nem apagados. O saldo da carteira é uma cópia rápida da soma desses lançamentos.

**Por que não apagar nem usar soft delete:** apagar o depósito não desfaz o que aconteceu depois. A pessoa já gastou o dinheiro, e o saldo deixaria de bater com o histórico. Além disso, sumiria o registro de quem reverteu, quando e por quê.

**Estorno** é uma operação nova, no sentido contrário, ligada à original (\`reverses_id\`, único, para não reverter duas vezes):

| Lançamento | Valor | Saldo |
|---|---|---|
| Depósito | + R$ 100 | 100 |
| Transferência para Ana | − R$ 80 | 20 |
| Estorno do depósito (motivo) | − R$ 100 | **−80** |
| Depósito | + R$ 100 | 20 |

É daí que vem o "saldo negativo por algum motivo" do enunciado: o estorno não confere saldo, porque está corrigindo um erro, e o próximo depósito soma.

**Por que a reconciliação só avisa:** ela compara o saldo com a soma dos lançamentos e registra a divergência como log CRITICAL. Corrigir sozinha seria mexer em dinheiro sem saber a causa: um bug, uma intervenção manual no banco, um ataque. A correção é um comando separado (\`wallet:reverse {uuid} --reason=\`), feito por uma pessoa depois de investigar, com motivo registrado.`,
      en: `The system keeps a **ledger**: each operation creates + and − entries that are never edited or deleted. The wallet balance is a fast copy of the sum of those entries.

**Why not delete or soft delete:** deleting the deposit does not undo what happened next. The person already spent the money, and the balance would stop matching the history. The record of who reversed it, when, and why would also disappear.

**A reversal** is a new operation in the opposite direction, linked to the original (\`reverses_id\`, unique, so nothing is reversed twice):

| Entry | Amount | Balance |
|---|---|---|
| Deposit | + R$ 100 | 100 |
| Transfer to Ana | − R$ 80 | 20 |
| Deposit reversal (reason) | − R$ 100 | **−80** |
| Deposit | + R$ 100 | 20 |

That is where the challenge's "negative balance for some reason" comes from: the reversal does not check the balance because it is fixing a mistake, and the next deposit adds up.

**Why reconciliation only warns:** it compares the balance with the sum of the entries and logs any mismatch as CRITICAL. Fixing it automatically would mean moving money without knowing the cause: a bug, a manual database change, an attack. The fix is a separate command (\`wallet:reverse {uuid} --reason=\`), run by a person after investigating, with the reason recorded.`,
    },
    follow: [
      { pt: 'Quem pode pedir o estorno de uma transferência? E o risco de o remetente reverter depois de receber o que comprou?', en: 'Who can request a transfer reversal? What about the sender reversing after receiving what they bought?' },
      { pt: 'Como você garante que uma operação não é revertida duas vezes, mesmo com dois pedidos simultâneos?', en: 'How do you ensure an operation is not reversed twice, even with two simultaneous requests?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: plano técnico §5 a §7 (livro-razão, estorno, reconciliação). Até a reversão estar no código, apresente como desenho, não como entregue.',
      en: 'In the wallet take-home: technical plan §5 to §7 (ledger, reversal, reconciliation). Until reversal is in the code, present it as design, not as delivered.',
    },
    flags: {
      pt: '"Reverto apagando a transação e recalculando o saldo." Ou corrigir divergência automaticamente sem investigar.',
      en: '"I reverse by deleting the transaction and recalculating the balance." Or auto-fixing mismatches without investigating.',
    },
  },

  {
    id: 'wallet-lock-then-idempotency',
    cat: 'data', type: 'code', jobs: ['desafio-carteira', 'php-fintech', 'backend-php-node'],
    tags: ['idempotência', 'idempotency', 'lockForUpdate', 'SELECT FOR UPDATE', 'REPEATABLE READ', 'UNIQUE', 'deadlock'],
    q: {
      pt: 'Na transferência, a chave de idempotência é conferida depois de travar as carteiras. Por que essa ordem resolve o clique duplo simultâneo? Descreva as duas requisições ao mesmo tempo. E por que só isso não basta no MySQL com REPEATABLE READ?',
      en: 'In the transfer, the idempotency key is checked after locking the wallets. Why does that order solve a simultaneous double click? Walk through both requests at once. And why is that alone not enough in MySQL with REPEATABLE READ?',
    },
    code: {
      src: `
return DB::transaction(function () use ($payerId, $payeeId, $amount, $key, $hash) {
    // 1. trava as duas carteiras SEMPRE em ordem de id (evita deadlock A→B × B→A)
    $wallets = Wallet::whereIn('id', [$payerId, $payeeId])
        ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

    // 2. só depois confere a chave, com leitura que trava (vê o último commit)
    $existing = Transaction::where('created_by', $payerId)
        ->where('idempotency_key', $key)->lockForUpdate()->first();
    if ($existing) {
        if ($existing->request_hash !== $hash) {
            throw IdempotencyKeyMismatch::for($key);
        }
        return $existing;                                 // repetição: devolve a mesma
    }

    $wallets[$payerId]->debit($amount);                   // InsufficientBalance se faltar
    $wallets[$payeeId]->credit($amount);
    // grava a transação (UNIQUE created_by + idempotency_key), 2 lançamentos e os saldos
}, 3);`,
    },
    a: {
      pt: `**As duas requisições ao mesmo tempo (mesma chave):**
1. A e B abrem a transação. A trava as carteiras primeiro.
2. B tenta travar as mesmas linhas e **espera** A terminar.
3. A confere a chave: não existe. Debita, credita, grava e faz COMMIT. A trava é liberada.
4. B ganha a trava, confere a chave: **agora existe**. Devolve a operação de A sem mexer em dinheiro.

Se a conferência viesse **antes** da trava, as duas leriam "não existe" ao mesmo tempo e seguiriam em frente.

**Por que só isso não basta no REPEATABLE READ (padrão do InnoDB):** uma leitura comum usa um *snapshot* criado na primeira leitura comum da transação. Se B fez qualquer SELECT normal antes de esperar a trava, o snapshot dela é anterior ao COMMIT de A, e uma conferência comum da chave ainda "não vê" a operação de A. Por isso:
- a conferência usa **leitura com trava** (\`lockForUpdate()\`), que sempre lê a versão mais recente gravada;
- o \`UNIQUE (created_by, idempotency_key)\` é a **garantia final**: se mesmo assim B tentar inserir, o banco recusa, a transação inteira de B é desfeita (nenhum saldo muda) e a action busca e devolve a operação existente.

A chave também fica ligada ao conteúdo (\`request_hash\`): a mesma chave com outro valor é erro, não repetição.`,
      en: `**Both requests at once (same key):**
1. A and B open their transactions. A locks the wallets first.
2. B tries to lock the same rows and **waits** for A.
3. A checks the key: not found. Debits, credits, writes, and COMMITs. The lock is released.
4. B gets the lock and checks the key: **now it exists**. It returns A's operation without moving money.

If the check came **before** the lock, both would read "not found" at the same time and go ahead.

**Why that alone is not enough under REPEATABLE READ (InnoDB's default):** a plain read uses a *snapshot* created at the transaction's first plain read. If B ran any normal SELECT before waiting for the lock, its snapshot predates A's COMMIT, and a plain key check still "does not see" A's operation. So:
- the check uses a **locking read** (\`lockForUpdate()\`), which always reads the latest committed version;
- \`UNIQUE (created_by, idempotency_key)\` is the **final guarantee**: if B still tries to insert, the database refuses, B's whole transaction rolls back (no balance changes), and the action fetches and returns the existing operation.

The key is also tied to the content (\`request_hash\`): the same key with another amount is an error, not a repeat.`,
    },
    follow: [
      { pt: 'Por que travar as carteiras em ordem de id? O que acontece sem isso numa transferência A→B e outra B→A ao mesmo tempo?', en: 'Why lock wallets in id order? What happens without it with an A→B and a B→A transfer at the same time?' },
      { pt: 'O que o terceiro argumento de DB::transaction($fn, 3) faz?', en: 'What does the third argument of DB::transaction($fn, 3) do?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: diagrama da transferência (plano §3.5) e §6. No TripFlow você já usa Idempotency-Key com resposta salva e lock sem segurar a transação durante a chamada externa: é a mesma ideia em outro contexto.',
      en: 'In the wallet take-home: the transfer diagram (plan §3.5) and §6. In TripFlow you already use an Idempotency-Key with a stored response and a lock that does not hold the transaction during the external call: the same idea in another context.',
    },
    flags: {
      pt: 'Conferir a chave antes de travar, ou confiar só na conferência sem UNIQUE no banco.',
      en: 'Checking the key before locking, or relying on the check alone without a UNIQUE constraint.',
    },
  },

  {
    id: 'wallet-crash-mid-transfer',
    cat: 'data', type: 'concept', jobs: ['desafio-carteira', 'php-fintech', 'backend-php-node'],
    tags: ['atomicidade', 'atomicity', 'ACID', 'rollback', 'DB::transaction', 'afterCommit', 'teste de falha'],
    q: {
      pt: 'O servidor cai no meio de uma transferência, depois do débito e antes do crédito. O que fica gravado no banco? Como você prova isso num teste?',
      en: 'The server crashes in the middle of a transfer, after the debit and before the credit. What is left in the database? How do you prove it in a test?',
    },
    code: {
      src: `
public function test_falha_no_meio_nao_grava_nada(): void
{
    [$ana, $bia] = $this->duasCarteiras(saldoDaAna: 10000);

    // exemplo: força uma exceção depois do débito, antes do crédito
    $this->app->bind(LedgerWriter::class, FailingAfterFirstEntry::class);

    try {
        app(TransferMoney::class)->execute($ana->user, $bia->user->email, Money::ofCents(5000), 'chave-1');
    } catch (SimulatedCrash $e) {
    }

    $this->assertSame(10000, $ana->fresh()->balance->cents());
    $this->assertSame(0, $bia->fresh()->balance->cents());
    $this->assertDatabaseCount('transactions', 0);
    $this->assertDatabaseCount('ledger_entries', 0);
}`,
    },
    a: {
      pt: `**Nada.** Operação, lançamentos e saldos são gravados dentro do mesmo \`DB::transaction\`. Se o processo PHP morre antes do COMMIT, a conexão cai e o MySQL desfaz tudo. Se o servidor do banco cai, na volta o InnoDB usa o *undo log* para desfazer o que não chegou a ser confirmado. Ou foi tudo, ou não foi nada: é o **A** do ACID.

**Como provar:** não dá para derrubar o servidor no teste, mas dá para simular o efeito, que é uma exceção no meio da transação. O teste força uma falha depois do primeiro lançamento e confere que o saldo das duas carteiras não mudou e que não sobrou operação nem lançamento.

**Cuidado com o que fica fora do banco:** eventos e logs de "transferência concluída" só podem sair **depois** do COMMIT (eventos com \`afterCommit\`). Senão um log diria que a transferência aconteceu e o banco diria que não. E uma chamada a serviço externo dentro da transação não é desfeita pelo rollback: esse é outro problema, resolvido com estados e reconciliação.`,
      en: `**Nothing.** The operation, the entries, and the balances are written inside the same \`DB::transaction\`. If the PHP process dies before COMMIT, the connection drops and MySQL rolls everything back. If the database server crashes, InnoDB uses the *undo log* on restart to roll back what was never committed. All or nothing: the **A** in ACID.

**How to prove it:** you cannot crash the server in a test, but you can simulate the effect, which is an exception mid-transaction. The test forces a failure after the first entry and checks that neither wallet's balance changed and that no operation or entry was left behind.

**Watch what lives outside the database:** "transfer completed" events and logs may only go out **after** COMMIT (events with \`afterCommit\`). Otherwise a log would say the transfer happened while the database says it did not. And a call to an external service inside the transaction is not undone by the rollback: that is a different problem, solved with states and reconciliation.`,
    },
    follow: [
      { pt: 'E se o COMMIT foi feito mas a resposta HTTP nunca chegou ao navegador? O que a pessoa vê e o que a idempotência resolve?', en: 'What if COMMIT happened but the HTTP response never reached the browser? What does the person see and what does idempotency solve?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: o teste de falha no meio é o que prova a resposta. Se ainda não existir, diga que está previsto e mostre o `DB::transaction` da action.',
      en: "In the wallet take-home: the mid-way failure test is what proves the answer. If it does not exist yet, say it is planned and show the action's `DB::transaction`.",
    },
    flags: {
      pt: '"Gravo o débito, depois o crédito, e se der erro eu desfaço o débito no catch."',
      en: '"I save the debit, then the credit, and if something fails I undo the debit in the catch."',
    },
  },

  {
    id: 'db-least-privilege-ledger',
    cat: 'security', type: 'concept', jobs: ['desafio-carteira', 'php-fintech', 'backend-php-node'],
    tags: ['GRANT', 'privilégio mínimo', 'least privilege', 'ON DELETE', 'RESTRICT', 'CASCADE', 'auditoria', 'audit'],
    q: {
      pt: 'O usuário do banco da aplicação não tem UPDATE nem DELETE na tabela de lançamentos. Isso impede que um bug corrompa o livro-razão? E um invasor? Onde termina essa proteção? E por que as chaves estrangeiras das operações não têm ON DELETE CASCADE?',
      en: 'The application\'s database user has no UPDATE or DELETE on the ledger table. Does that stop a bug from corrupting the ledger? What about an attacker? Where does that protection end? And why do the operations\' foreign keys have no ON DELETE CASCADE?',
    },
    code: {
      src: `
-- migrator: cria e altera tabelas (só nas migrações e nos testes)
GRANT ALL PRIVILEGES ON wallet.* TO 'migrator'@'%';

-- app: só o necessário
GRANT SELECT, INSERT, UPDATE ON wallet.wallets      TO 'app'@'%';
GRANT SELECT, INSERT, UPDATE ON wallet.transactions TO 'app'@'%';
GRANT SELECT, INSERT         ON wallet.ledger_entries TO 'app'@'%';  -- sem UPDATE e sem DELETE`,
    },
    a: {
      pt: `**Contra bug: sim, protege.** Se algum código tentar editar ou apagar um lançamento, o MySQL recusa com erro de permissão. O livro-razão só recebe linhas novas mesmo que a aplicação erre.

**Contra invasor, em parte:**
- Protege contra quem entra **pelas credenciais da aplicação**, como numa injeção de SQL: com o usuário \`app\`, não dá para apagar o histórico.
- **Não protege** contra quem tem a credencial do \`migrator\`, do root ou acesso ao servidor do banco, nem contra um backup restaurado de propósito.

**Onde termina:** é uma camada, não uma garantia absoluta. As próximas seriam credenciais do \`migrator\` fora do ambiente da aplicação, log de auditoria do banco, backups imutáveis e, se o risco justificar, encadear um hash de cada lançamento com o anterior para detectar alteração.

**Sem ON DELETE CASCADE:** o argumento é de negócio. Apagar um usuário ou uma carteira **não pode** apagar o histórico financeiro em cascata: as operações também são da outra pessoa da transferência, e registros financeiros têm prazo de guarda. Por isso a FK fica \`RESTRICT\` (o padrão): o banco impede apagar uma carteira que tem operações. Para "sair" do sistema, a conta é desativada, não apagada.

Um detalhe que costuma cair: \`SELECT ... FOR UPDATE\` exige SELECT **e** UPDATE (ou DELETE) na tabela travada. Por isso \`wallets\` e \`transactions\` têm UPDATE, e o livro-razão, que nunca é travado, não precisa.`,
      en: `**Against bugs: yes.** If any code tries to edit or delete an entry, MySQL refuses with a permission error. The ledger only gets new rows even if the application gets it wrong.

**Against attackers, partly:**
- It protects against someone who gets in **with the application's credentials**, as in SQL injection: with the \`app\` user, history cannot be deleted.
- It does **not** protect against someone holding the \`migrator\` or root credentials or access to the database server, nor against a backup restored on purpose.

**Where it ends:** it is one layer, not an absolute guarantee. Next layers would be keeping \`migrator\` credentials out of the application environment, database audit logs, immutable backups, and, if the risk justifies it, chaining a hash of each entry with the previous one to detect tampering.

**No ON DELETE CASCADE:** the argument is a business one. Deleting a user or a wallet **must not** cascade-delete financial history: the operations also belong to the other side of the transfer, and financial records have retention periods. So the FK stays \`RESTRICT\` (the default): the database blocks deleting a wallet that has operations. To "leave" the system, the account is deactivated, not deleted.

A detail that often comes up: \`SELECT ... FOR UPDATE\` requires SELECT **and** UPDATE (or DELETE) on the locked table. That is why \`wallets\` and \`transactions\` have UPDATE, and the ledger, which is never locked, does not need it.`,
    },
    follow: [
      { pt: 'Os testes rodam com qual usuário? Como você prova que o usuário app realmente não consegue editar um lançamento?', en: 'Which user do the tests run as? How do you prove the app user really cannot edit an entry?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: `docker/mysql/init/01-databases-and-users.sql` (cria `migrator` e `app`) e `docker/mysql/grants.sql` (permissões do `app`, aplicadas depois das migrações).',
      en: 'In the wallet take-home: `docker/mysql/init/01-databases-and-users.sql` (creates `migrator` and `app`) and `docker/mysql/grants.sql` (the `app` grants, applied after migrations).',
    },
    flags: {
      pt: 'Aplicação conectando como root. Ou "ON DELETE CASCADE para não dar erro ao apagar usuário".',
      en: 'The application connecting as root. Or "ON DELETE CASCADE so deleting a user does not fail".',
    },
  },

  {
    id: 'laravel-renderable-exceptions',
    cat: 'php', type: 'lib', jobs: ['desafio-carteira', 'php-fintech'],
    tags: ['exceptions', 'report()', 'render()', 'Handler', 'logs', 'WARNING', 'ERROR', 'dontReport'],
    q: {
      pt: 'Qual a diferença entre um erro de negócio e um bug? Se a exceção de "saldo insuficiente" não tivesse report(), o que apareceria no log, e por que isso seria ruim?',
      en: 'What is the difference between a business error and a bug? If the "insufficient balance" exception had no report(), what would show up in the log, and why would that be bad?',
    },
    code: {
      src: `
abstract class WalletException extends DomainException
{
    abstract public function errorCode(): string;      // ex.: "insufficient_balance"

    public function report(): void                     // log curto, sem stack trace
    {
        Log::warning('wallet.' . $this->errorCode(), $this->context());
    }

    public function render(Request $request)           // volta ao formulário com a mensagem
    {
        if ($request->expectsJson()) {
            return response()->json(['error' => ['code' => $this->errorCode(), 'message' => $this->getMessage()]], 422);
        }
        return back()->withInput($request->except('password'))->withErrors([$this->field() => $this->getMessage()]);
    }
}`,
    },
    a: {
      pt: `**Erro de negócio** é a regra funcionando: a pessoa pediu algo que não pode (transferir sem saldo, reverter duas vezes). É esperado, acontece todo dia e tem resposta para ela.
**Bug** é o sistema falhando: uma exceção que ninguém previu. Precisa de investigação.

**Sem \`report()\`:** o Laravel trataria "saldo insuficiente" como qualquer exceção não tratada. Cada tentativa viraria um log **ERROR com stack trace inteiro**. Isso é ruim porque:
- enche o log de ruído e esconde os bugs de verdade no meio;
- dispara alertas de erro por algo normal, e o time aprende a ignorar alerta;
- aumenta o volume e o custo dos logs.

**Com \`report()\` e \`render()\`** (renderable exceptions, recurso nativo do Laravel 8):
- o erro de negócio vira um log **WARNING** curto, com um código estável (\`wallet.insufficient_balance\`) e contexto, que dá para contar e acompanhar;
- a pessoa volta ao formulário com a mensagem e com o que já tinha digitado (422 em JSON);
- o \`Handler\` fica limpo, e o bug de verdade continua indo como ERROR, com stack trace e \`request_id\`.

Alternativa que eu conheço: \`$dontReport\` no Handler. Ela silencia de vez, e eu prefiro o WARNING porque um pico de "saldo insuficiente" também é sinal de algo (um bug de saldo, um ataque de teste de cartões).`,
      en: `A **business error** is the rule working: the person asked for something not allowed (transferring without balance, reversing twice). It is expected, happens every day, and has an answer for them.
A **bug** is the system failing: an exception nobody planned for. It needs investigating.

**Without \`report()\`:** Laravel would treat "insufficient balance" like any unhandled exception. Every attempt would become an **ERROR log with a full stack trace**. That is bad because:
- it floods the log with noise and hides real bugs;
- it fires error alerts for something normal, and the team learns to ignore alerts;
- it increases log volume and cost.

**With \`report()\` and \`render()\`** (renderable exceptions, native in Laravel 8):
- the business error becomes a short **WARNING** with a stable code (\`wallet.insufficient_balance\`) and context, which can be counted and tracked;
- the person goes back to the form with the message and what they had typed (422 for JSON);
- the \`Handler\` stays clean, and real bugs still go out as ERROR, with stack trace and \`request_id\`.

An alternative I know: \`$dontReport\` in the Handler. It silences them completely, and I prefer the WARNING because a spike of "insufficient balance" is also a signal (a balance bug, a card-testing attack).`,
    },
    follow: [
      { pt: 'Que dados você nunca colocaria no contexto desse log?', en: 'What data would you never put in that log\'s context?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: `app/Exceptions/Wallet/WalletException.php`. Mostre o log JSON de um erro de negócio com `make logs`.',
      en: "In the wallet take-home: `app/Exceptions/Wallet/WalletException.php`. Show a business error's JSON log with `make logs`.",
    },
    flags: {
      pt: 'try/catch em todo controller devolvendo a mesma mensagem genérica, ou logar erro de negócio como ERROR.',
      en: 'try/catch in every controller returning the same generic message, or logging business errors as ERROR.',
    },
  },

  {
    id: 'web-session-cookie-flags',
    cat: 'security', type: 'concept', jobs: ['desafio-carteira', 'php-fintech', 'backend-php-node'],
    tags: ['cookie', 'Secure', 'HttpOnly', 'SameSite', 'HSTS', 'sessão', 'session hijacking'],
    q: {
      pt: 'Se o cookie de sessão não for Secure em produção, que ataque fica possível? Por que o HttpOnly sozinho não resolve? E para que serve o SameSite?',
      en: 'If the session cookie is not Secure in production, what attack becomes possible? Why doesn\'t HttpOnly alone solve it? And what is SameSite for?',
    },
    code: {
      src: `
// config/session.php
'secure'    => env('SESSION_SECURE_COOKIE'),  // true em produção (só HTTPS)
'http_only' => true,                          // JavaScript não lê o cookie
'same_site' => 'lax',                         // não vai em POST vindo de outro site`,
    },
    a: {
      pt: `**Sem \`Secure\`**, o navegador também manda o cookie em requisições **HTTP** sem criptografia. Numa rede aberta (Wi-Fi público), basta a pessoa abrir um link \`http://\` do site, ou um atacante forçar essa troca (*SSL stripping*), para o cookie trafegar em texto puro. Quem copia o cookie entra na sessão sem senha: é o **sequestro de sessão** (*session hijacking*). Numa carteira, isso é transferir o dinheiro de outra pessoa.

**HttpOnly** resolve outro problema: impede que JavaScript leia o cookie (\`document.cookie\`). Protege contra um XSS que tente roubar a sessão, mas **não** contra alguém que intercepta o cookie na rede. Um protege o cookie dentro do navegador, o outro no caminho.

**SameSite=lax** faz o navegador não mandar o cookie em POST vindo de outro site. É uma camada contra CSRF, junto com o token CSRF que o Laravel já coloca nos formulários.

Completa o conjunto: HTTPS obrigatório com HSTS (o navegador nem tenta HTTP), sessão regenerada no login e invalidada no logout. No Laravel, \`SESSION_SECURE_COOKIE=true\` em produção; em desenvolvimento local fica \`false\` porque o ambiente é HTTP.`,
      en: `**Without \`Secure\`**, the browser also sends the cookie over unencrypted **HTTP** requests. On an open network (public Wi-Fi), the person just has to open an \`http://\` link to the site, or an attacker forces that downgrade (*SSL stripping*), and the cookie travels in plain text. Whoever copies it gets into the session without a password: **session hijacking**. In a wallet, that means moving someone else\'s money.

**HttpOnly** solves a different problem: it stops JavaScript from reading the cookie (\`document.cookie\`). It protects against XSS trying to steal the session, but **not** against someone intercepting the cookie on the network. One protects the cookie inside the browser, the other on the way.

**SameSite=lax** makes the browser not send the cookie on a POST coming from another site. It is a layer against CSRF, alongside the CSRF token Laravel already adds to forms.

Rounding it out: mandatory HTTPS with HSTS (the browser never even tries HTTP), session regenerated on login and invalidated on logout. In Laravel, \`SESSION_SECURE_COOKIE=true\` in production; in local development it stays \`false\` because the environment is HTTP.`,
    },
    follow: [
      { pt: 'Por que regenerar o id da sessão no login?', en: 'Why regenerate the session id on login?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: `config/session.php` e `SESSION_SECURE_COOKIE` no `.env.example`. Explique por que fica `false` só no ambiente local.',
      en: 'In the wallet take-home: `config/session.php` and `SESSION_SECURE_COOKIE` in `.env.example`. Explain why it is `false` only locally.',
    },
    flags: {
      pt: 'Achar que HttpOnly torna o cookie "seguro" em qualquer cenário.',
      en: 'Believing HttpOnly makes the cookie "secure" in every scenario.',
    },
  },

  {
    id: 'datetime-utc-timezones',
    cat: 'data', type: 'concept', jobs: ['desafio-carteira', 'php-fintech', 'backend-php-node'],
    tags: ['UTC', 'fuso horário', 'timezone', 'TIMESTAMP', 'DATETIME', 'horário de verão', 'DST', 'Carbon'],
    q: {
      pt: 'Por que gravar datas em UTC e não no horário de Brasília? Que bug o \'timezone\' => \'+00:00\' na conexão do MySQL evita, e em que tipo de coluna ele aparece? E por que o fuso de exibição é uma configuração e não um setTimezone em cada view?',
      en: 'Why store dates in UTC and not in Brasília time? What bug does \'timezone\' => \'+00:00\' on the MySQL connection prevent, and in which column type does it show up? And why is the display time zone a config value instead of a setTimezone in each view?',
    },
    code: {
      src: `
// config/app.php
'timezone' => 'UTC',                       // o que a aplicação grava e calcula
'display_timezone' => 'America/Sao_Paulo', // só para mostrar

// config/database.php (conexão mysql)
'timezone' => '+00:00',                    // a sessão do MySQL também fala UTC

// na view
{{ $transaction->created_at->setTimezone(config('app.display_timezone'))->format('d/m/Y H:i') }}`,
    },
    a: {
      pt: `**Por que UTC:** UTC não tem horário de verão nem muda por decisão política. Com horário local:
- numa volta do horário de verão, a mesma hora existe duas vezes, e a ordem de duas operações fica ambígua;
- servidores, bancos e serviços em regiões diferentes gravariam horas diferentes para o mesmo instante;
- cálculos de duração e de "operações das últimas 24 horas" erram na troca.

Gravo e calculo em UTC e converto **só na hora de mostrar**.

**O \`+00:00\` na conexão:** a coluna \`TIMESTAMP\` do MySQL converte do fuso **da sessão** para UTC ao gravar, e de UTC para o fuso da sessão ao ler. Se a sessão estivesse no fuso do servidor (ex.: −03:00) e a aplicação mandasse a hora em UTC, o MySQL trataria aquela hora como −03:00 e guardaria três horas deslocadas. Com a sessão em \`+00:00\`, ninguém converte nada. \`DATETIME\` guarda o texto como veio, sem conversão, então o bug aparece no \`TIMESTAMP\`, que é o tipo que o \`$table->timestamps()\` cria no MySQL.

**\`display_timezone\` como configuração:** fica num lugar só. Se a regra mudar (outro fuso, fuso por usuário), muda-se um valor, e não dezenas de views. Também evita esquecer a conversão numa tela, e o teste consegue conferir a exibição.`,
      en: `**Why UTC:** UTC has no daylight saving time and does not change by political decision. With local time:
- when DST ends, the same hour exists twice, and the order of two operations becomes ambiguous;
- servers, databases, and services in different regions would store different times for the same instant;
- duration math and "operations in the last 24 hours" go wrong around the switch.

I store and compute in UTC and convert **only when displaying**.

**The \`+00:00\` on the connection:** MySQL's \`TIMESTAMP\` column converts from the **session\'s** time zone to UTC on write, and from UTC to the session\'s zone on read. If the session were in the server\'s zone (e.g. −03:00) and the application sent UTC times, MySQL would treat that time as −03:00 and store it three hours off. With the session at \`+00:00\`, nobody converts anything. \`DATETIME\` stores the text as given, with no conversion, so the bug shows up in \`TIMESTAMP\`, which is the type \`$table->timestamps()\` creates in MySQL.

**\`display_timezone\` as config:** it lives in one place. If the rule changes (another zone, per-user zones), one value changes, not dozens of views. It also avoids forgetting the conversion on some screen, and tests can check the display.`,
    },
    follow: [
      { pt: 'Qual a diferença entre TIMESTAMP e DATETIME no MySQL além da conversão? (limite de 2038)', en: 'What is the difference between TIMESTAMP and DATETIME in MySQL besides conversion? (the 2038 limit)' },
    ],
    anchor: {
      pt: "No desafio da carteira: `config/app.php` (`timezone` e `display_timezone`) e `config/database.php` (`'timezone' => '+00:00'` nas duas conexões).",
      en: "In the wallet take-home: `config/app.php` (`timezone` and `display_timezone`) and `config/database.php` (`'timezone' => '+00:00'` on both connections).",
    },
    flags: {
      pt: '"Coloco o timezone da aplicação como America/Sao_Paulo e pronto."',
      en: '"I set the application time zone to America/Sao_Paulo and that\'s it."',
    },
  },

  {
    id: 'docker-uid-ci-portability',
    cat: 'devops', type: 'concept', jobs: ['desafio-carteira', 'php-fintech', 'backend-php-node'],
    tags: ['Docker', 'UID', 'GID', 'root', 'macOS', 'Windows', 'WSL2', '.gitattributes', 'eol=lf', 'CI'],
    q: {
      pt: 'Por que o container roda com o seu UID e não como root? No macOS o usuário cai no grupo dialout (GID 20): isso é perigoso? E por que o CI passar não prova que roda na máquina de quem avalia, inclusive no Windows?',
      en: 'Why does the container run with your UID and not as root? On macOS the user lands in the dialout group (GID 20): is that dangerous? And why does a passing CI not prove it runs on the reviewer\'s machine, including on Windows?',
    },
    code: {
      src: `
# Dockerfile: usuário com o UID/GID de quem roda o make
ARG UID=1000
ARG GID=1000
RUN group="$(getent group "\${GID}" | cut -d: -f1)" \\
 && if [ -z "\${group}" ]; then addgroup -g "\${GID}" app && group=app; fi \\
 && adduser -D -u "\${UID}" -G "\${group}" app

# .gitattributes: LF em qualquer sistema
* text=auto eol=lf`,
    },
    a: {
      pt: `**Por que o seu UID:** o código fica montado do seu computador para dentro do container. Tudo que o container cria (\`vendor/\`, \`storage/\`, cache, logs) aparece na sua máquina com o dono do processo. Como root, esses arquivos seriam do root: você não conseguiria editar nem apagar sem \`sudo\`, e o próximo \`composer install\` fora do container falharia por permissão. Rodar sem root também reduz o estrago se algo dentro do container for explorado.

**GID 20 no macOS:** o grupo principal no Mac costuma ser o 20 (\`staff\`), e no Alpine o 20 já existe com o nome \`dialout\`, que dá acesso a portas seriais. Dentro do container não há porta serial nenhuma mapeada, então o nome não dá permissão real. O que importa é o número: os arquivos ficam com o mesmo grupo da sua máquina.

**O CI passou × funciona na máquina de quem avalia:** o CI prova só o ambiente que ele executa. O runner do GitHub é Linux com outro UID e GID, por isso o problema do GID 20 nunca apareceria lá. Para outro sistema, é preciso testar nele ou documentar o caminho.

**\`eol=lf\`:** \`text=auto\` sozinho normaliza para LF **no repositório**, mas no Windows, com \`core.autocrlf=true\`, o checkout volta para CRLF. Scripts de shell no container quebram (\`/bin/sh^M\`) e o PHP-CS-Fixer reprova o PSR-12. \`eol=lf\` força LF também no checkout.

**Windows:** o runner Windows do GitHub roda containers Windows, não Linux. Ele não reproduz o Docker Desktop com WSL2 de quem avalia. O caminho suportado é WSL2 + Docker Desktop, e está no README. Sem WSL, o Docker Desktop precisa de Hyper-V. Sem nada disso, eu explicaria a limitação e mostraria na minha máquina ou numa VM, sem prometer suporte que não testei.`,
      en: `**Why your UID:** the code is mounted from your computer into the container. Everything the container creates (\`vendor/\`, \`storage/\`, cache, logs) shows up on your machine owned by the process\'s user. As root, those files would belong to root: you could not edit or delete them without \`sudo\`, and the next \`composer install\` outside the container would fail on permissions. Not running as root also limits the damage if something inside the container is exploited.

**GID 20 on macOS:** the primary group on a Mac is usually 20 (\`staff\`), and on Alpine 20 already exists as \`dialout\`, which grants access to serial ports. No serial port is mapped into the container, so the name grants nothing real. What matters is the number: files keep the same group as on your machine.

**CI passed × works on the reviewer\'s machine:** CI only proves the environment it runs. The GitHub runner is Linux with a different UID and GID, so the GID 20 issue would never show up there. For another OS, you have to test on it or document the path.

**\`eol=lf\`:** \`text=auto\` alone normalizes to LF **in the repository**, but on Windows with \`core.autocrlf=true\` the checkout goes back to CRLF. Shell scripts in the container break (\`/bin/sh^M\`) and PHP-CS-Fixer fails PSR-12. \`eol=lf\` forces LF on checkout too.

**Windows:** GitHub\'s Windows runner runs Windows containers, not Linux ones. It does not reproduce the reviewer\'s Docker Desktop with WSL2. The supported path is WSL2 + Docker Desktop, and it is in the README. Without WSL, Docker Desktop needs Hyper-V. Without either, I would explain the limitation and demo on my machine or a VM, without promising support I have not tested.`,
    },
    follow: [
      { pt: 'O que muda na imagem de produção em relação à de desenvolvimento?', en: 'What changes in the production image compared to the development one?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: `docker/php/Dockerfile`, `Makefile` (`HOST_UID`/`HOST_GID`), `.gitattributes` e o job `ambiente-docker` do CI. O TripFlow também roda inteiro em containers: use os dois.',
      en: "In the wallet take-home: `docker/php/Dockerfile`, `Makefile` (`HOST_UID`/`HOST_GID`), `.gitattributes`, and the CI's `ambiente-docker` job. TripFlow also runs fully in containers: use both.",
    },
    flags: {
      pt: '"Funciona na minha máquina e o CI passou, então funciona em qualquer lugar."',
      en: '"It works on my machine and CI passed, so it works everywhere."',
    },
  },

  {
    id: 'laravel-actions-no-repositories',
    cat: 'principles', type: 'architecture', jobs: ['desafio-carteira', 'php-fintech'],
    tags: ['Actions', 'casos de uso', 'use cases', 'Repository', 'Eloquent', 'SOLID', 'DIP', 'rich model'],
    q: {
      pt: 'Por que separar as operações em actions e não deixar tudo no controller? Por que não criar repositórios sobre o Eloquent? Onde está, e onde não está, cada princípio do SOLID no seu código?',
      en: 'Why split operations into actions instead of keeping everything in the controller? Why not add repositories on top of Eloquent? Where is, and where isn\'t, each SOLID principle in your code?',
    },
    a: {
      pt: `**Actions:** cada operação (\`DepositMoney\`, \`TransferMoney\`, \`ReverseTransaction\`) é uma classe com um método. O controller só valida, chama a action e responde. Ganhos:
- a mesma operação serve à tela, a um comando Artisan, a uma fila ou a uma API futura;
- dá para testar a regra sem HTTP;
- a regra do saldo fica num lugar só: o model \`Wallet\` (\`credit\`, \`debit\`), e não espalhada entre controller, model e view.

\`app/Actions\` é a mesma convenção dos pacotes oficiais Fortify e Jetstream, então quem conhece Laravel reconhece.

**Sem repositórios:** o Eloquent já é a camada de acesso a dados. Uma interface \`WalletRepository\` com implementação Eloquent dobraria as classes sem mudar o comportamento, e os testes de integração usam o banco real de qualquer jeito. É uma escolha consciente: se o domínio crescer ou precisar trocar a persistência, o próximo passo seria interfaces no domínio e implementação na infraestrutura.

**SOLID, com honestidade:**
- **S:** cada action faz uma coisa; o controller não tem regra.
- **O:** uma operação nova é uma classe nova, sem editar as que existem.
- **L:** toda exceção de negócio estende \`WalletException\` e é tratada do mesmo jeito.
- **I:** Form Request por ação, Policy por recurso.
- **D: não reivindico.** As actions dependem de classes concretas (Eloquent) de propósito. O container injeta as actions nos controllers, o que facilita testar, mas injetar uma classe concreta não é inversão de dependência.`,
      en: `**Actions:** each operation (\`DepositMoney\`, \`TransferMoney\`, \`ReverseTransaction\`) is a class with one method. The controller only validates, calls the action, and responds. Gains:
- the same operation serves the screen, an Artisan command, a queue, or a future API;
- the rule can be tested without HTTP;
- the balance rule lives in one place: the \`Wallet\` model (\`credit\`, \`debit\`), not spread across controller, model, and view.

\`app/Actions\` is the same convention used by the official Fortify and Jetstream packages, so anyone who knows Laravel recognizes it.

**No repositories:** Eloquent already is the data access layer. A \`WalletRepository\` interface with an Eloquent implementation would double the classes without changing behavior, and integration tests use the real database anyway. It is a deliberate choice: if the domain grows or persistence must change, the next step would be interfaces in the domain and implementations in infrastructure.

**SOLID, honestly:**
- **S:** each action does one thing; the controller holds no rules.
- **O:** a new operation is a new class, without editing existing ones.
- **L:** every business exception extends \`WalletException\` and is handled the same way.
- **I:** one Form Request per action, one Policy per resource.
- **D: I do not claim it.** Actions depend on concrete classes (Eloquent) on purpose. The container injects actions into controllers, which helps testing, but injecting a concrete class is not dependency inversion.`,
    },
    follow: [
      { pt: 'Que sinal faria você introduzir repositórios e interfaces?', en: 'What signal would make you introduce repositories and interfaces?' },
    ],
    anchor: {
      pt: 'Você trabalha com Laravel no Grupo Mysa: compare com como o time organiza regra de negócio lá. No desafio da carteira, a estrutura está no plano técnico §3.',
      en: 'You work with Laravel at Grupo Mysa: compare with how the team organizes business rules there. In the wallet take-home, the structure is in the technical plan §3.',
    },
    flags: {
      pt: 'Dizer que usa "todos os princípios do SOLID" sem conseguir apontar onde. Ou repositório que só repassa chamadas ao Eloquent.',
      en: 'Claiming to use "all SOLID principles" without pointing to where. Or a repository that only forwards calls to Eloquent.',
    },
  },

  {
    id: 'project-scope-tradeoffs',
    cat: 'agile', type: 'behavioral', jobs: ['desafio-carteira', 'php-fintech'],
    tags: ['escopo', 'scope', 'trade-off', 'Laravel 8', 'composer audit', 'priorização', 'prioritization', 'nuvem', 'cloud'],
    q: {
      pt: 'Por que Laravel 8, se ele tem avisos de segurança sem correção? O que você cortou do plano, por que os cortes não comprometem o que o desafio avalia, e por que não publicou na nuvem?',
      en: 'Why Laravel 8 if it has unpatched security advisories? What did you cut from the plan, why do the cuts not affect what the challenge evaluates, and why did you not deploy to the cloud?',
    },
    a: {
      pt: `**Laravel 8 em 30 segundos:** o ambiente-alvo pedia PHP 7.4+, e o Laravel 8 é o último que roda nele. O Composer bloqueia a instalação por avisos sem correção na série 8. Em vez de desligar a verificação, liberei **cada aviso pelo ID, com motivo**, e analisei o impacto: o crítico é do login por token, que o projeto não usa; o que afeta (quebra de linha na regra de e-mail) recebe uma regra extra no cadastro, com teste. Para produção, eu recomendaria atualizar, e o ADR mostra o que muda.

**Cortes:** priorizei o que o enunciado pede e o que é avaliado: dinheiro certo, concorrência, reversão, erros, segurança e testes. Cortei prints automáticos, Kubernetes e matriz de bancos, que são vitrine e não mudam se o dinheiro está correto. Entre o teste de concorrência e o rate limit, fico com a concorrência: é o núcleo do problema, e o limite do login já vem pronto no Breeze.

**Traduções copiadas, sem o pacote:** evitei uma dependência a mais e conflitos de versão com PHP 7.4. A desvantagem é que as traduções não se atualizam sozinhas.

**Nuvem:** o desafio pede o app rodando no dia, não publicado. Publicar traria custo contínuo e configuração externa que poderia quebrar perto da entrevista. Deixei tudo reproduzível com \`make up\` e \`make test\` e registrei num ADR como seria publicar e o que ainda faltaria. Isso também deixa claro que eu **não** demonstro experiência prática com nuvem neste projeto.`,
      en: `**Laravel 8 in 30 seconds:** the target environment asked for PHP 7.4+, and Laravel 8 is the last version that runs on it. Composer blocks the install because of unpatched advisories in the 8 series. Instead of turning the check off, I allowed **each advisory by ID, with a reason**, and assessed the impact: the critical one is token auth, which the project does not use; the one that applies (line breaks in the email rule) gets an extra rule in registration, with a test. For production I would recommend upgrading, and the ADR shows what changes.

**Cuts:** I prioritized what the brief asks and what is evaluated: correct money, concurrency, reversal, errors, security, and tests. I cut automatic screenshots, Kubernetes, and a database matrix, which are showcase items and do not change whether the money is right. Between the concurrency test and rate limiting, I pick concurrency: it is the heart of the problem, and the login limit already comes with Breeze.

**Translations copied, package removed:** I avoided one more dependency and version conflicts with PHP 7.4. The downside is that translations no longer update by themselves.

**Cloud:** the challenge asks for the app running on the day, not deployed. Deploying would add ongoing cost and external setup that could break close to the interview. I kept everything reproducible with \`make up\` and \`make test\` and wrote an ADR on how deployment would work and what would still be missing. That also makes clear I do **not** demonstrate hands-on cloud experience in this project.`,
    },
    follow: [
      { pt: 'Com mais uma semana, o que você faria primeiro?', en: 'With one more week, what would you do first?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: ADR 0007 (versão e avisos) e ADR 0008 (nuvem). Diga com clareza o que foi feito e o que ficou como plano.',
      en: 'In the wallet take-home: ADR 0007 (version and advisories) and ADR 0008 (cloud). Say clearly what was done and what stayed as a plan.',
    },
    flags: {
      pt: 'Esconder o que não fez, ou apresentar um corte como se fosse feito.',
      en: 'Hiding what was not done, or presenting a cut as if it were done.',
    },
  },
];
