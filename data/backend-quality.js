// Backend sênior: qualidade e desempenho com evidência. Arquivos grandes em stream, otimização medida,
// exceções com significado, análise estática, testes de borda, SSRF e dados anonimizados fora de produção.

export default [
  {
    id: 'perf-measure-before-optimize',
    cat: 'architecture', type: 'concept', jobs: ['backend-php-node', 'sr-node-react'],
    tags: ['performance', 'benchmark', 'profiling', 'gargalo', 'bottleneck', 'regressão', 'regression', 'Xdebug', 'Blackfire'],
    q: {
      pt: 'Um processo em lote ficou lento. Como você otimiza com evidência, e não no palpite? Como prova que a otimização não mudou o resultado, e o que escreve no commit?',
      en: 'A batch process got slow. How do you optimize with evidence instead of guesswork? How do you prove the optimization did not change the result, and what do you write in the commit?',
    },
    a: {
      pt: `**1. Medir antes de mexer.** Uma entrada fixa e realista (ex.: o mesmo arquivo de produção anonimizado, sempre o mesmo), o tempo total e o pico de memória (\`memory_get_peak_usage\`, \`--inspect\` no Node), e um *profiler* (Xdebug/Blackfire/SPX no PHP, \`--cpu-prof\` ou clinic no Node) para ver **onde** o tempo vai.

**2. Achar o gargalo de verdade.** Um exemplo clássico: um parser que descarta os bytes lidos com \`substr()\` a cada caractere copia o buffer inteiro toda vez. O custo cresce com o tamanho do buffer, e o buffer maior fica mais lento, ao contrário do esperado.

**3. Mudar uma coisa só.** No exemplo: guardar um **offset** do próximo byte não lido, descartar o já lido só ao carregar um bloco novo, e varrer com funções nativas (\`strcspn\`, \`strspn\`, \`strpos\`).

**4. Provar que o resultado é o mesmo.** Comparar a saída nova com a antiga para a mesma entrada (idealmente byte a byte) e acrescentar **testes de regressão nas bordas** que a mudança tocou: valores que atravessam o limite do buffer, escapes, UTF-8, linhas maiores que o buffer.

**5. Medir de novo e dizer o que mudou de lugar.** Ex.: o parser cai de 100 s para 5 s, mas o processo inteiro só de 150 s para 55 s: agora o gargalo é outra parte (a geração de dados), e isso orienta o próximo passo.

**No commit:** o problema, a causa, a solução, os números antes e depois com a entrada usada, a garantia de comportamento e os testes adicionados. Quem revisa consegue conferir sem precisar perguntar.

Responder "colocaria cache" ou "usaria Redis" sem saber onde está o gargalo é o erro típico.`,
      en: `**1. Measure before touching anything.** A fixed, realistic input (e.g. the same anonymized production file, always the same), total time and peak memory (\`memory_get_peak_usage\`, \`--inspect\` in Node), and a *profiler* (Xdebug/Blackfire/SPX in PHP, \`--cpu-prof\` or clinic in Node) to see **where** the time goes.

**2. Find the real bottleneck.** A classic case: a parser that drops consumed bytes with \`substr()\` on every character copies the whole buffer each time. Cost grows with buffer size, so the bigger buffer is slower, the opposite of what you would expect.

**3. Change one thing.** In the example: keep an **offset** of the next unread byte, drop consumed bytes only when loading a new block, and scan with native functions (\`strcspn\`, \`strspn\`, \`strpos\`).

**4. Prove the result is the same.** Compare new and old output for the same input (ideally byte by byte) and add **regression tests at the edges** the change touched: values crossing the buffer boundary, escapes, UTF-8, lines longer than the buffer.

**5. Measure again and say where the bottleneck moved.** E.g. the parser drops from 100 s to 5 s, but the full run only from 150 s to 55 s: now another part (data generation) is the bottleneck, which guides the next step.

**In the commit:** the problem, the cause, the fix, before/after numbers with the input used, the behavior guarantee, and the tests added. A reviewer can verify without asking.

Answering "I would add a cache" or "use Redis" without knowing where the bottleneck is, is the typical mistake.`,
    },
    follow: [
      { pt: 'Como você evita que o benchmark engane (cache aquecido, máquina diferente, uma execução só)?', en: 'How do you keep the benchmark honest (warm caches, different machine, a single run)?' },
    ],
    anchor: {
      pt: 'Use um caso seu em que você mediu antes e depois (uma query, um N+1, um relatório lento). Se não tiver números guardados, diga como mediria, sem inventar valores.',
      en: 'Use a case of yours where you measured before and after (a query, an N+1, a slow report). If you have no numbers saved, say how you would measure, without inventing values.',
    },
    flags: {
      pt: 'Otimizar sem medir, ou trocar a implementação sem provar que a saída é a mesma.',
      en: 'Optimizing without measuring, or swapping the implementation without proving the output is the same.',
    },
  },

  {
    id: 'php-streaming-large-files',
    cat: 'php', type: 'code', jobs: ['backend-php-node', 'php-fintech'],
    tags: ['generator', 'yield', 'stream', 'SplFileObject', 'fgetcsv', 'memória', 'memory', 'arquivo grande', 'large file', 'checkpoint'],
    q: {
      pt: 'Todo dia chega um arquivo de conciliação com milhões de linhas (ou um JSON de vários GB). Como você processa isso em PHP sem estourar a memória e conseguindo retomar se cair no meio?',
      en: 'Every day a reconciliation file with millions of rows arrives (or a multi-GB JSON). How do you process it in PHP without running out of memory and being able to resume if it crashes midway?',
    },
    code: {
      src: `
/** @return \\Generator<int, array<string, string>> uma linha por vez, sem carregar o arquivo */
function readRows(string $path): \\Generator
{
    $file = new \\SplFileObject($path, 'r');
    $header = $file->fgetcsv();
    while (!$file->eof()) {
        $row = $file->fgetcsv();
        if ($row === [null] || $row === false) {
            continue;                                   // linha em branco
        }
        yield $file->key() => array_combine($header, $row);
    }
}

$lastLine = Checkpoint::get('conciliacao-2026-11-13');   // retoma de onde parou
$batch = [];
foreach (readRows($path) as $line => $row) {
    if ($line <= $lastLine) {
        continue;
    }
    $batch[] = $row;
    if (count($batch) === 1000) {
        DB::transaction(function () use ($batch, $line) {
            Settlement::upsertByExternalId($batch);     // idempotente pelo id da transação
            Checkpoint::save('conciliacao-2026-11-13', $line);
        });
        $batch = [];
    }
}
// ...último lote e memory_get_peak_usage() no log`,
    },
    a: {
      pt: `**Memória constante, não proporcional ao arquivo:**
- Ler **por linha ou por bloco** (\`SplFileObject\`, \`fgetcsv\`, \`fgets\`), nunca \`file_get_contents\` nem \`file()\` no arquivo inteiro.
- Entregar os registros com um **generator** (\`yield\`): quem consome recebe um por vez, e só um fica na memória.
- Para JSON enorme, \`json_decode\` do arquivo inteiro está fora: usar um parser incremental ou navegar sob demanda (ler só o elemento pedido, guardando a posição em bytes de cada um).
- Escrever em blocos (buffer de escrita), não linha a linha no disco.
- Conferir com \`memory_get_peak_usage()\` no log: o pico precisa ficar estável quando o arquivo dobra.

**Retomar se cair:**
- Processar em **lotes** (ex.: 1.000 linhas), cada um numa transação.
- Gravar um **checkpoint** (a última linha confirmada) **na mesma transação** do lote.
- Cada registro é **idempotente** pelo id externo (\`UNIQUE\` + upsert). Se o lote for reprocessado, nada é baixado em dobro.

**No Node, o equivalente:** \`fs.createReadStream\` + \`readline\` ou um parser em stream, com \`stream.pipeline\` para respeitar o *backpressure* (não ler mais rápido do que se consegue gravar).`,
      en: `**Constant memory, not proportional to the file:**
- Read **by line or by block** (\`SplFileObject\`, \`fgetcsv\`, \`fgets\`), never \`file_get_contents\` or \`file()\` on the whole file.
- Hand out records with a **generator** (\`yield\`): the consumer gets one at a time, and only one lives in memory.
- For huge JSON, \`json_decode\` on the whole file is out: use an incremental parser or navigate on demand (read only the requested element, keeping each one's byte position).
- Write in blocks (a write buffer), not line by line to disk.
- Check \`memory_get_peak_usage()\` in the log: the peak must stay flat when the file doubles.

**Resume after a crash:**
- Process in **batches** (e.g. 1,000 rows), each in one transaction.
- Store a **checkpoint** (the last committed line) **in the same transaction** as the batch.
- Each record is **idempotent** by its external id (\`UNIQUE\` + upsert). If a batch is reprocessed, nothing is settled twice.

**The Node equivalent:** \`fs.createReadStream\` + \`readline\` or a streaming parser, with \`stream.pipeline\` to respect *backpressure* (do not read faster than you can write).`,
    },
    follow: [
      { pt: 'Por que o checkpoint precisa estar na mesma transação do lote?', en: 'Why must the checkpoint be in the same transaction as the batch?' },
      { pt: 'Um generator pode ser percorrido duas vezes? E se precisar contar as linhas antes?', en: 'Can a generator be iterated twice? What if you need to count rows first?' },
    ],
    anchor: {
      pt: 'Se você já importou planilhas, arquivos de ERP ou integrações em lote (Sicoob, ZR System, Grupo Mysa), conte o volume real e como evitou duplicidade. Se nunca passou de arquivos pequenos, apresente como desenho.',
      en: 'If you have imported spreadsheets, ERP files, or batch integrations (Sicoob, ZR System, Grupo Mysa), tell the real volume and how you avoided duplicates. If you never went past small files, present it as design.',
    },
    flags: {
      pt: '`file_get_contents` + `json_decode` no arquivo inteiro, ou reprocessar o arquivo do começo sem idempotência.',
      en: '`file_get_contents` + `json_decode` on the whole file, or reprocessing from the start without idempotency.',
    },
  },

  {
    id: 'php-exceptions-assertions',
    cat: 'php', type: 'concept', jobs: ['backend-php-node', 'php-fintech', 'desafio-carteira'],
    tags: ['exceptions', 'InvalidArgumentException', 'UnexpectedValueException', 'RuntimeException', 'LogicException', 'assert', 'zend.assertions', 'JSON_THROW_ON_ERROR'],
    q: {
      pt: 'Que exceção você lança para argumento inválido, dado externo mal formado, falha de I/O e uso errado da sua classe? Quando usar assert() em vez de throw? E o que uma boa mensagem de erro precisa ter?',
      en: 'Which exception do you throw for an invalid argument, malformed external data, an I/O failure, and misuse of your class? When do you use assert() instead of throw? And what does a good error message need?',
    },
    code: {
      src: `
$data = fread($handle, $size);
if ($data === false) {                                   // nunca ignorar retorno de I/O
    throw new RuntimeException(sprintf('Failed to read the file at position %d.', $position));
}

if ($char !== ':') {                                     // dado externo fora do formato
    throw new UnexpectedValueException(sprintf(
        'Invalid JSON object at position %d (expected ":", received "%s").', $position, $char,
    ));
}

try {
    $spec = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    throw new InvalidArgumentException('Invalid modifications spec: ' . $e->getMessage(), 0, $e); // mantém a causa
}

assert($this->position >= 0);                            // invariante interna: desligada em produção
// assert($this->save());                                // ERRADO: efeito colateral some em produção`,
    },
    a: {
      pt: `**O tipo diz de quem é a culpa:**
- \`InvalidArgumentException\`: quem chamou passou algo errado (tipo, faixa, formato de parâmetro).
- \`UnexpectedValueException\` / \`DomainException\`: o dado veio de fora e não segue o formato ou a regra (JSON inválido, valor fora do domínio).
- \`RuntimeException\`: o ambiente falhou (disco, rede, permissão). Não é culpa de quem chamou.
- \`LogicException\`: uso errado da API, ex.: escrever num objeto que é somente leitura.
- Exceções próprias do negócio (saldo insuficiente) estendem uma base comum, com código estável.

**Mensagem boa:** o que era esperado, o que veio e **onde** (posição, campo, id). "Erro ao processar" obriga alguém a reproduzir o problema para entender.

**Encadear a causa:** ao traduzir uma exceção, passar a original como \`$previous\`. O stack trace continua contando a história.

**\`assert()\` × \`throw\`:**
- \`throw\` para o que **pode** acontecer: entrada externa, I/O, regra de negócio.
- \`assert()\` para invariantes internas que só quebram se o próprio código tiver bug. Fica ligado em desenvolvimento e teste (\`zend.assertions=1\`) e desligado em produção (\`-1\`, sem custo).
- **Nunca colocar efeito colateral dentro do \`assert\`** (\`assert($this->save())\`, ou uma leitura de arquivo na mensagem): em produção ele não roda, e o comportamento muda.

**Retornos de I/O:** \`fread\`, \`fwrite\`, \`fseek\` e \`json_decode\` sem \`JSON_THROW_ON_ERROR\` retornam \`false\` ou \`null\` em silêncio. Sempre conferir. Se o caminho de falha é difícil de testar, marcar a exclusão de cobertura com honestidade, em vez de ignorar o retorno.`,
      en: `**The type says whose fault it is:**
- \`InvalidArgumentException\`: the caller passed something wrong (type, range, parameter format).
- \`UnexpectedValueException\` / \`DomainException\`: data came from outside and breaks the format or rule (invalid JSON, out-of-domain value).
- \`RuntimeException\`: the environment failed (disk, network, permission). Not the caller's fault.
- \`LogicException\`: API misuse, e.g. writing to a read-only object.
- Business exceptions (insufficient balance) extend a common base with a stable code.

**A good message:** what was expected, what arrived, and **where** (position, field, id). "Processing error" forces someone to reproduce the problem to understand it.

**Chain the cause:** when translating an exception, pass the original as \`$previous\`. The stack trace keeps telling the story.

**\`assert()\` × \`throw\`:**
- \`throw\` for what **can** happen: external input, I/O, business rules.
- \`assert()\` for internal invariants that only break if your own code has a bug. On in development and tests (\`zend.assertions=1\`), off in production (\`-1\`, zero cost).
- **Never put side effects inside \`assert\`** (\`assert($this->save())\`, or a file read in the message): in production it does not run, and behavior changes.

**I/O returns:** \`fread\`, \`fwrite\`, \`fseek\`, and \`json_decode\` without \`JSON_THROW_ON_ERROR\` return \`false\` or \`null\` silently. Always check. If the failure path is hard to test, mark the coverage exclusion honestly instead of ignoring the return.`,
    },
    follow: [
      { pt: 'Por que `catch (\\Throwable $e) { return null; }` é perigoso?', en: 'Why is `catch (\\Throwable $e) { return null; }` dangerous?' },
    ],
    anchor: {
      pt: 'No desafio da carteira: `WalletException` (erro de negócio com código estável) separada de bug. Mostre também onde você confere retorno ou usa exceção nativa com o tipo certo.',
      en: 'In the wallet take-home: `WalletException` (business error with a stable code) separated from bugs. Also show where you check returns or use a native exception of the right type.',
    },
    flags: {
      pt: 'Lançar sempre `\\Exception` genérica, mensagem sem contexto, ou engolir a causa.',
      en: 'Always throwing a generic `\\Exception`, a message with no context, or swallowing the cause.',
    },
  },

  {
    id: 'php-static-analysis-strict',
    cat: 'testing', type: 'lib', jobs: ['backend-php-node', 'php-fintech'],
    tags: ['strict_types', 'PHPStan', 'Larastan', 'Psalm', 'PHP_CodeSniffer', 'PSR-12', 'composer validate', 'CI', 'baseline'],
    q: {
      pt: 'O que declare(strict_types=1) muda de verdade? O que um PHPStan no nível máximo pega que um nível baixo deixa passar? E como você coloca isso num código legado sem parar o time?',
      en: 'What does declare(strict_types=1) actually change? What does PHPStan at the max level catch that a low level misses? And how do you introduce it into legacy code without stopping the team?',
    },
    a: {
      pt: `**\`strict_types=1\`:** vale **por arquivo**, para as chamadas feitas naquele arquivo. Desliga a conversão automática de escalares em argumentos e retornos: passar \`"10"\` onde a função espera \`int\` vira \`TypeError\`, em vez de virar 10 em silêncio. Pega cedo o valor que veio do banco ou do request como string. Não muda nada em tempo de compilação nem valida o conteúdo de arrays.

**PHPStan por nível (resumindo):**
- Níveis baixos: classes, métodos e funções que não existem, número de argumentos.
- Médios: tipos de retorno e de parâmetros, código morto, valores possivelmente nulos.
- Altos (até o 10, ou \`max\`): \`mixed\` não tratado, tipos de arrays e generics (\`array<string, Money>\`, \`int<0, max>\`), comparações sempre verdadeiras. Com \`strict-rules\`, proíbe atalhos como comparação frouxa (\`==\`) e conversões implícitas.
- No Laravel, o **Larastan** ensina ao PHPStan o que é mágico do framework (Eloquent, facades).

**Em código legado, sem parar o time:**
1. Começar num nível baixo que passe, ou gerar uma **baseline** (\`phpstan analyse --generate-baseline\`): os erros antigos ficam registrados, e só os **novos** quebram o CI.
2. Subir um nível por vez, pelos módulos mais críticos (dinheiro primeiro).
3. \`strict_types\` arquivo por arquivo, começando pelo código novo e pelas classes de domínio, com testes cobrindo.
4. Cada \`ignoreErrors\` com o motivo escrito ao lado. "Nível 10" com supressões sem explicação é marketing.

**Junto, no CI:** \`composer validate --strict\`, estilo (PHP_CodeSniffer ou PHP-CS-Fixer em PSR-12) e um analisador de dependências (declarada e não usada, ou usada e não declarada).`,
      en: `**\`strict_types=1\`:** applies **per file**, to calls made from that file. It turns off automatic scalar coercion for arguments and returns: passing \`"10"\` where an \`int\` is expected becomes a \`TypeError\` instead of silently becoming 10. It catches early the value that came from the database or request as a string. It does nothing at compile time and does not validate array contents.

**PHPStan by level (summary):**
- Low levels: classes, methods, and functions that do not exist, argument counts.
- Mid: return and parameter types, dead code, possibly-null values.
- High (up to 10, or \`max\`): unhandled \`mixed\`, array types and generics (\`array<string, Money>\`, \`int<0, max>\`), always-true comparisons. With \`strict-rules\` it forbids shortcuts like loose comparison (\`==\`) and implicit conversions.
- In Laravel, **Larastan** teaches PHPStan the framework's magic (Eloquent, facades).

**In legacy code, without stopping the team:**
1. Start at a low level that passes, or generate a **baseline** (\`phpstan analyse --generate-baseline\`): old errors are recorded, and only **new** ones break CI.
2. Raise one level at a time, starting with the most critical modules (money first).
3. \`strict_types\` file by file, starting with new code and domain classes, with tests covering them.
4. Every \`ignoreErrors\` entry with its reason written next to it. "Level 10" with unexplained suppressions is marketing.

**Alongside, in CI:** \`composer validate --strict\`, style (PHP_CodeSniffer or PHP-CS-Fixer on PSR-12), and a dependency analyser (declared but unused, or used but undeclared).`,
    },
    follow: [
      { pt: 'Qual nível você usa hoje e o que precisaria para subir?', en: 'Which level do you use today and what would it take to raise it?' },
    ],
    anchor: {
      pt: 'O TripFlow usa Larastan/PHPStan nível 8, e a carteira usa nível 5: saiba dizer por que cada um e o que impediria subir a carteira (PHP 7.4, tempo, Eloquent mágico).',
      en: 'TripFlow uses Larastan/PHPStan level 8, and the wallet uses level 5: be ready to say why each, and what blocks raising the wallet (PHP 7.4, time, Eloquent magic).',
    },
    flags: {
      pt: '"Coloquei nível máximo e ignorei os erros que apareceram."',
      en: '"I set the max level and ignored the errors that showed up."',
    },
  },

  {
    id: 'testing-parsers-cli-boundaries',
    cat: 'testing', type: 'code', jobs: ['backend-php-node', 'php-fintech'],
    tags: ['PHPUnit', 'data provider', 'TestDox', 'CoversClass', 'teste de borda', 'boundary test', 'proc_open', 'teste funcional', 'functional test'],
    q: {
      pt: 'Como você testa um parser ou um script de linha de comando que processa arquivos? Que casos escolhe, e como testa o executável de verdade e não só as classes?',
      en: 'How do you test a parser or a command-line script that processes files? Which cases do you pick, and how do you test the real executable, not just the classes?',
    },
    code: {
      src: `
#[CoversClass(Parser::class)]
#[TestDox('Parser')]
final class ParserTest extends TestCase
{
    public static function invalidInputs(): iterable
    {
        yield 'array sem fechamento' => ['[1, 2'];
        yield 'vírgula sem valor'    => ['[1,]'];
        yield 'arquivo vazio'        => [''];
    }

    #[DataProvider('invalidInputs')]
    public function test_recusa_entrada_invalida(string $input): void
    {
        $this->expectException(UnexpectedValueException::class);
        (new Parser($this->stream($input), readBufferSize: 4))->parseAll(); // buffer pequeno: força as bordas
    }
}

// o executável, num processo separado
$process = proc_open([PHP_BINARY, 'bin/anonymize', '--input', $in], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
$stderr = stream_get_contents($pipes[2]);
$this->assertSame(1, proc_close($process));
$this->assertStringContainsString('Invalid modifications spec', $stderr);`,
    },
    a: {
      pt: `**Que casos:**
- **Válidos típicos** e **inválidos** (sem fechamento, vírgula sem valor, tipo errado, arquivo vazio, só espaços).
- **Bordas da implementação**, não só do formato: com um buffer pequeno de propósito nos testes, valores que **atravessam o limite do buffer** (escapes, aspas, UTF-8 de vários bytes, números com expoente, linha maior que o buffer).
- Um teste de **regressão** para cada bug corrigido, com o nome do caso.

**Como organizar:**
- **Data providers com nome** (\`yield 'vírgula sem valor' => [...]\`): quando falha, o relatório diz qual caso.
- Atributos do PHPUnit 10: \`#[CoversClass]\` (o que o teste cobre de verdade), \`#[TestDox]\` (relatório legível), \`#[Small]\`/\`#[Large]\` (separar rápidos de lentos).
- Pular com motivo quando o ambiente não permite (ex.: teste de permissão rodando como root), em vez de deixar o teste falso-verde.

**O executável de verdade:**
- Rodar o script **num processo separado** (\`proc_open\` ou Symfony Process) e conferir **código de saída**, STDOUT e STDERR, com arquivos temporários criados no \`setUp\` e apagados no \`tearDown\`.
- Um **teste funcional** que instala o pacote como um usuário instalaria (\`composer require\` num diretório limpo) e o usa. Pega erro de autoload, de arquivo faltando no pacote e de \`bin\` mal configurado, que teste unitário nenhum pega.`,
      en: `**Which cases:**
- **Typical valid** and **invalid** inputs (unclosed, trailing comma, wrong type, empty file, whitespace only).
- **Implementation edges**, not just format ones: with a deliberately small buffer in tests, values that **cross the buffer boundary** (escapes, quotes, multi-byte UTF-8, numbers with exponents, a line longer than the buffer).
- A **regression** test for each fixed bug, with the case's name.

**How to organize:**
- **Named data providers** (\`yield 'trailing comma' => [...]\`): when one fails, the report says which case.
- PHPUnit 10 attributes: \`#[CoversClass]\` (what the test really covers), \`#[TestDox]\` (readable report), \`#[Small]\`/\`#[Large]\` (split fast from slow).
- Skip with a reason when the environment does not allow it (e.g. a permission test running as root), instead of a false green.

**The real executable:**
- Run the script **in a separate process** (\`proc_open\` or Symfony Process) and check **exit code**, STDOUT, and STDERR, with temp files created in \`setUp\` and removed in \`tearDown\`.
- A **functional test** that installs the package the way a user would (\`composer require\` in a clean directory) and uses it. It catches autoload errors, files missing from the package, and a misconfigured \`bin\`, which no unit test catches.`,
    },
    follow: [
      { pt: 'Como você testaria um comando Artisan da mesma forma?', en: 'How would you test an Artisan command the same way?' },
    ],
    anchor: {
      pt: 'Na carteira: o teste do `wallet:reconcile` e os data providers do `MoneyTest`. Se ainda não houver teste do comando, diga como faria com `artisan()` e com processo separado.',
      en: 'In the wallet: the `wallet:reconcile` test and the `MoneyTest` data providers. If the command test does not exist yet, say how you would do it with `artisan()` and with a separate process.',
    },
    flags: {
      pt: 'Testar só o caminho feliz com um arquivo de exemplo, ou nunca rodar o executável.',
      en: 'Testing only the happy path with one sample file, or never running the executable.',
    },
  },

  {
    id: 'node-ssrf-user-url',
    cat: 'security', type: 'code', jobs: ['backend-php-node', 'sr-node-react'],
    tags: ['SSRF', 'fetch', 'URL', 'allowlist', 'IP privado', 'private IP', 'redirect', 'timeout', 'Buffer.from'],
    q: {
      pt: 'Uma rota recebe uma URL do cliente e o servidor baixa o arquivo dela (ex.: o comprovante ou a imagem de um produto). Que risco isso abre, e como você protege?',
      en: 'A route receives a URL from the client and the server downloads the file from it (e.g. a receipt or a product image). What risk does that open, and how do you protect it?',
    },
    code: {
      src: `
import { lookup } from 'node:dns/promises';
import net from 'node:net';

const ALLOWED_HOSTS = new Set(['cdn.parceiro.com.br']);

async function safeFetch(rawUrl: string): Promise<Buffer> {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) throw new BadRequest('URL not allowed');

  const { address } = await lookup(url.hostname);           // confere o IP de destino
  if (isPrivate(address)) throw new BadRequest('URL not allowed');

  const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(5000) });
  const size = Number(res.headers.get('content-length') ?? 0);
  if (!res.ok || size > 5 * 1024 * 1024) throw new BadRequest('Invalid file');
  return Buffer.from(await res.arrayBuffer());               // Buffer.from, nunca new Buffer()
}`,
    },
    a: {
      pt: `**O risco é SSRF (*Server-Side Request Forgery*):** o atacante manda uma URL que aponta para dentro da sua rede, e o **seu servidor** faz a requisição por ele:
- \`http://169.254.169.254/...\`: metadados da nuvem, de onde dá para tirar credenciais;
- \`http://localhost:6379\` ou um painel interno sem autenticação;
- varrer portas internas pelo tempo de resposta.

**Proteções, em camadas:**
1. **Allowlist** de domínios (e só \`https\`), quando o caso permite. É a mais forte.
2. Sem allowlist: **resolver o DNS e recusar IP privado, loopback, link-local e metadados** (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, ::1, fc00::/7). Conferir o IP na hora de conectar, por causa de *DNS rebinding* (o nome muda de IP entre a checagem e a conexão).
3. **Redirects**: desligar, ou validar cada salto de novo.
4. **Timeout e limite de tamanho**: senão um arquivo infinito ou um servidor lento prendem o processo.
5. Na rede: o serviço que baixa arquivos sai por um proxy de saída ou numa rede sem acesso aos serviços internos.
6. Erros genéricos para o cliente, sem devolver o corpo da resposta interna.

**Detalhe de Node:** \`new Buffer(...)\` é API antiga, depreciada por segurança. Usar \`Buffer.from\` / \`Buffer.alloc\`.

**Melhor ainda,** quando dá: em vez de o servidor buscar a URL, o cliente envia o arquivo, ou recebe uma URL pré-assinada para enviar direto ao storage.`,
      en: `**The risk is SSRF (*Server-Side Request Forgery*):** the attacker sends a URL pointing inside your network, and **your server** makes the request for them:
- \`http://169.254.169.254/...\`: cloud metadata, a source of credentials;
- \`http://localhost:6379\` or an internal dashboard with no auth;
- scanning internal ports by response time.

**Layered protections:**
1. A domain **allowlist** (and \`https\` only) when the use case allows. The strongest option.
2. Without an allowlist: **resolve DNS and reject private, loopback, link-local, and metadata IPs** (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, ::1, fc00::/7). Check the IP at connect time, because of *DNS rebinding* (the name changes IP between check and connect).
3. **Redirects**: turn them off, or validate each hop again.
4. **Timeout and size limit**: otherwise an endless file or a slow server holds the process.
5. Network: the service that downloads files goes out through an egress proxy or a network with no access to internal services.
6. Generic errors to the client, never echoing the internal response body.

**Node detail:** \`new Buffer(...)\` is an old API, deprecated for security reasons. Use \`Buffer.from\` / \`Buffer.alloc\`.

**Even better,** when possible: instead of the server fetching the URL, the client uploads the file, or gets a pre-signed URL to upload straight to storage.`,
    },
    follow: [
      { pt: 'O que é DNS rebinding e por que validar só o hostname não basta?', en: 'What is DNS rebinding and why is validating only the hostname not enough?' },
    ],
    anchor: {
      pt: 'Integrações com sistemas externos (ERP, Salesforce, e-commerce) são a sua vivência: conte como validava o que vinha de fora. SSRF em si, se nunca tratou, apresente como estudo.',
      en: 'Integrations with external systems (ERP, Salesforce, e-commerce) are your experience: tell how you validated what came in from outside. If you never dealt with SSRF itself, present it as study.',
    },
    flags: {
      pt: '`fetch(req.body.url)` direto, sem allowlist, timeout nem limite.',
      en: '`fetch(req.body.url)` directly, with no allowlist, timeout, or limit.',
    },
  },

  {
    id: 'data-anonymization-non-prod',
    cat: 'security', type: 'architecture', jobs: ['backend-php-node', 'php-fintech'],
    tags: ['LGPD', 'anonimização', 'anonymization', 'dump', 'homologação', 'staging', 'Faker', 'dados pessoais', 'personal data'],
    q: {
      pt: 'O time precisa reproduzir em homologação um bug de cobrança que só acontece com dados de produção. Como você leva esses dados sem expor clientes?',
      en: 'The team needs to reproduce, in staging, a billing bug that only happens with production data. How do you bring that data over without exposing customers?',
    },
    a: {
      pt: `**Princípio:** dado pessoal real não sai de produção. Para fora vai uma cópia **anonimizada**, gerada de forma controlada (LGPD: minimização e finalidade).

**Como gerar:**
- Anonimizar **o arquivo do dump em stream**, antes de restaurar em qualquer lugar. Transformar o dump enquanto ele passa (\`mysqldump | anonimizador | mysql\`) é muito mais rápido do que restaurar e rodar \`UPDATE\` em massa: o \`UPDATE\` paga índices, checagem de unicidade e log, e por um tempo o banco de homologação fica com dados reais.
- Uma **especificação versionada** por tabela e coluna: nome, CPF, e-mail, telefone, endereço, cartão (últimos dígitos), observações livres.
- **Manter o que o bug precisa:** formato válido (CPF com dígito verificador correto), **unicidade** onde há índice único (e-mail), **relações** entre tabelas (a mesma pessoa vira o mesmo nome falso em todas as tabelas, por exemplo com um mapeamento determinístico a partir do id), e os valores financeiros e datas que reproduzem o bug.
- **Semente fixa** no gerador de dados falsos, para o resultado ser reproduzível entre execuções.
- Texto livre (observações, comentários) é o lugar onde dados pessoais se escondem: limpar ou substituir.

**Controles:** quem pode gerar, log de geração, o dump bruto nunca sai do ambiente de produção, e apagar a cópia depois do uso.

**Quando nem isso basta:** reproduzir com um caso sintético montado a partir do que o log mostra (ids, valores, sequência de eventos), sem copiar a base.`,
      en: `**Principle:** real personal data does not leave production. What goes out is an **anonymized** copy, produced in a controlled way (LGPD/GDPR: minimization and purpose).

**How to produce it:**
- Anonymize **the dump file as a stream**, before restoring anywhere. Transforming the dump as it flows (\`mysqldump | anonymizer | mysql\`) is much faster than restoring and running mass \`UPDATE\`s: the \`UPDATE\` pays for indexes, uniqueness checks, and logs, and for a while the staging database holds real data.
- A **versioned spec** per table and column: name, tax id, email, phone, address, card (last digits), free-text notes.
- **Keep what the bug needs:** valid format (tax ids with a correct check digit), **uniqueness** where there is a unique index (email), **relations** across tables (the same person becomes the same fake name everywhere, e.g. via a deterministic mapping from the id), and the financial values and dates that reproduce the bug.
- A **fixed seed** in the fake data generator, so the result is reproducible across runs.
- Free text (notes, comments) is where personal data hides: clean or replace it.

**Controls:** who may generate it, a generation log, the raw dump never leaves production, and the copy is deleted after use.

**When even that is not enough:** reproduce with a synthetic case built from what the logs show (ids, amounts, event sequence), without copying the database.`,
    },
    follow: [
      { pt: 'Como manter a mesma pessoa com o mesmo nome falso em várias tabelas?', en: 'How do you keep the same person with the same fake name across tables?' },
    ],
    anchor: {
      pt: 'Na carteira, o `DemoSeeder` cria dados de demonstração sem ninguém real. Se já precisou de dados de produção para depurar em algum trabalho, conte como foi feito e o que faria diferente.',
      en: 'In the wallet, the `DemoSeeder` creates demo data with no real people. If you ever needed production data to debug at work, tell how it was done and what you would do differently.',
    },
    flags: {
      pt: 'Restaurar o dump de produção em homologação "só por um dia".',
      en: 'Restoring the production dump in staging "just for a day".',
    },
  },
];
