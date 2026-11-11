# 🪙 Cadê os R$3,17?

> Fim do mês na financeira. O contador somou um milhão de transações e o total não bate. Sumiram R$3,17.

## 🎭 Elenco
- 🤝 **Tanto-faz** · `==` · converte os tipos antes de comparar: `'1' == '01'` é verdadeiro
- 🧐 **Rigoroso** · `===` · mesmo tipo E mesmo valor, senão é diferente
- 🎈 **Balão** · `float` · guarda 0,1 "mais ou menos": `0.1 + 0.2` dá `0.30000000000000004`
- 🧾 **Contador** · o fechamento do mês · quem descobre o buraco
- 🪙 **Moedinha** · centavos inteiros (`int`) · guarda 10000 em vez de 100,00: sem erro de arredondamento
- ➗ **Parcelamento** · dividir R$100 em 3 · o centavo que some se ninguém cuidar
- 🧮 **Calculadora de precisão** · `bcmath` (ou `brick/money`) · conta com decimais exatos e arredondamento combinado

- 📈 **Juros de 2,99%** · `$valor * 0.0299` · a conta que nunca dá redonda
## 🎬 Cena 1 · Os dois comparadores
**Tanto-faz**: "`'1'` e `'01'`? Iguais! `null` e `false`? Iguais também! Sou da paz." 🤝
**Rigoroso**: "Mesmo tipo E mesmo valor, senão não é igual. Em código de dinheiro, só eu." 🧐
**Tanto-faz**: "Credo, que chato."
**Rigoroso**: "Chato não, responsável."
= 🤝 `'1' == '01'`: `true`
= 🧐 `'1' === '01'`: `false`
= 🤝 `null == false`: `true`

## 🎬 Cena 2 · O buraco
**Balão**: "Eu guardo 0,1… mais ou menos, tá? Ninguém é perfeito." 🎈
**Contador**: "Somei um milhão de transações e sumiram R$3,17. CADÊ, GENTE?!" 🧾😱
**Moedinha**: "Comigo é 10000 em vez de 100,00. Inteiro não tem erro de arredondamento, mô." 🪙
= 🎈 `0.1 + 0.2`: `0.30000000000000004`
= 🧾 Diferença no mês (float): R$3,17 ❌
= 🪙 Em centavos inteiros: diferença R$0,00 ✅

## 🎬 Cena 3 · O centavo fujão
**Parcelamento**: "R$100 em 3 vezes: 33,33 + 33,33 + 33,33 = 99,99. Sumiu um centavo!" ➗
**Moedinha**: "Faz assim: 3334 + 3333 + 3333 = 10000. A primeira parcela fica com o centavo que sobrou." ✅
**Juros de 2,99%**: "E eu, que não dá conta redonda?"
**Calculadora de precisão**: "Eu faço com decimais exatos e com a regra de arredondamento que o negócio combinou." 🧮
= ➗ R$100 ÷ 3 com float: 33,33 × 3 = 99,99 ❌
= 🪙 Em centavos: [3334, 3333, 3333] = 10000 ✅
= 🧮 Juros 2,99% com bcmath: `bcmul('10000', '0.0299', 4)` = 299.0000

## 💻 Traduzindo pro código
```php
var_dump('1' == '01');       // true   🤝
var_dump('1' === '01');      // false  🧐
var_dump(0.1 + 0.2 == 0.3);  // false  🎈

// 🪙 dinheiro em centavos inteiros
$totalCentavos = 10000;

// ➗ parcelas que somam exatamente o total
function parcelar(int $totalCentavos, int $n): array {
    $base = intdiv($totalCentavos, $n);
    $resto = $totalCentavos % $n;
    return array_map(fn ($i) => $base + ($i < $resto ? 1 : 0), range(0, $n - 1)); // [3334, 3333, 3333]
}

// 🧮 juros com precisão
$juros = bcmul('10000', '0.0299', 4);     // "299.0000"
```

| Onde guardar dinheiro | Bom? |
| --- | --- |
| `float` | ❌ erro de arredondamento |
| Centavos em `int` / `BIGINT` | ✅ |
| `DECIMAL(15,2)` no banco | ✅ |
| `bcmath` / `brick/money` para contas | ✅ |

## 🎤 Pra entrevista
"`==` converte tipos antes de comparar; `===` compara tipo e valor, então em pagamentos uso sempre o estrito. Float não representa 0,1 exatamente, então dinheiro fica em centavos inteiros ou DECIMAL, as contas vão com bcmath ou uma biblioteca de dinheiro, o arredondamento é explícito e as parcelas somam exatamente o total."
