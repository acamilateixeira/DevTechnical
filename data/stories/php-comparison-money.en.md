# 🪙 Where did the R$3.17 go?

> Month-end at the lender. The accountant added up a million transactions and the total doesn't match. R$3.17 vanished.

## 🎭 Cast
- 🤝 **Whatever** · `==` · converts types before comparing: `'1' == '01'` is true
- 🧐 **Strict** · `===` · same type AND same value, otherwise different
- 🎈 **Balloon** · `float` · stores 0.1 "more or less": `0.1 + 0.2` gives `0.30000000000000004`
- 🧾 **Accountant** · the month-end close · the one who finds the hole
- 🪙 **Coin** · integer cents (`int`) · stores 10000 instead of 100.00: no rounding error
- ➗ **Installments** · splitting R$100 into 3 · the cent that vanishes if nobody's careful
- 🧮 **Precision calculator** · `bcmath` (or `brick/money`) · exact decimals and an agreed rounding rule

- 📈 **2.99% interest** · `$amount * 0.0299` · the math that never comes out round
## 🎬 Scene 1 · The two comparers
**Whatever**: "`'1'` and `'01'`? Equal! `null` and `false`? Equal too! I'm easygoing." 🤝
**Strict**: "Same type AND same value, or it's not equal. In money code, only me." 🧐
**Whatever**: "Ugh, so uptight."
**Strict**: "Not uptight. Responsible."

## 🎬 Scene 2 · The hole
**Balloon**: "I store 0.1… more or less, okay? Nobody's perfect." 🎈
**Accountant**: "I added up a million transactions and R$3.17 vanished. WHERE DID IT GO, PEOPLE?!" 🧾😱
**Coin**: "With me it's 10000 instead of 100.00. Integers have no rounding error, babe." 🪙

## 🎬 Scene 3 · The runaway cent
**Installments**: "R$100 in 3 payments: 33.33 + 33.33 + 33.33 = 99.99. A cent vanished!" ➗
**Coin**: "Do it like this: 3334 + 3333 + 3333 = 10000. The first installment takes the leftover cent." ✅
**2.99% interest**: "What about me? I never come out round."
**Precision calculator**: "I do it with exact decimals and the rounding rule the business agreed on." 🧮

## 💻 Translating to code
```php
var_dump('1' == '01');       // true   🤝
var_dump('1' === '01');      // false  🧐
var_dump(0.1 + 0.2 == 0.3);  // false  🎈

// 🪙 money in integer cents
$totalCents = 10000;

// ➗ installments that add up exactly to the total
function splitInstallments(int $totalCents, int $n): array {
    $base = intdiv($totalCents, $n);
    $rest = $totalCents % $n;
    return array_map(fn ($i) => $base + ($i < $rest ? 1 : 0), range(0, $n - 1)); // [3334, 3333, 3333]
}

// 🧮 interest with precision
$interest = bcmul('10000', '0.0299', 4);  // "299.0000"
```

| Where to store money | Good? |
| --- | --- |
| `float` | ❌ rounding errors |
| Cents as `int` / `BIGINT` | ✅ |
| `DECIMAL(15,2)` in the database | ✅ |
| `bcmath` / `brick/money` for math | ✅ |

## 🎤 For the interview
"`==` converts types before comparing; `===` compares type and value, so in payments I always use strict. Floats can't represent 0.1 exactly, so money lives in integer cents or DECIMAL, math goes through bcmath or a money library, rounding is explicit, and installments add up exactly to the total."
