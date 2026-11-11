# 🚦 The test that cut in line

> Monday stand-up. The PO shows up with a new rule and the dev already has her fingers on the keyboard.

## 🎭 Cast
- 📋 **PO** · whoever defines the business rule · knows what's allowed and what isn't
- 👩‍💻 **Dev** · writes `podeAprovar()` · in a hurry
- ✋ **Test** · `test('...', () => expect(...))` · in TDD, it's born BEFORE the code
- 🔴 **Red** · a failing test · proves the test actually tests something
- 🟢 **Green** · a passing test · the minimum code to do what the test asks
- 🧹 **Cleanup** · refactoring · improving the code with the tests as bodyguards
- 📏 **Edge case** · `cost === limit` · the question nobody had asked

## 🎬 Scene 1 · Who goes first
**PO**: "New rule: a manager can only approve a trip that fits the budget AND their limit."
**Dev**: "Already coding!" ⌨️
**Test** _(jumping in front of the keyboard)_: "HOLD IT, GIRL! In TDD I'm born first!" ✋
**Test**: "Cost 500, budget 1000, limit 800: I expect approved."
**Red**: "FAILED! The function doesn't even exist!" 🔴
**Dev**: "Fine, I'll do the MINIMUM to pass."
**Green**: "Passed!" 🟢

## 🎬 Scene 2 · One test at a time
**Test**: "Cost 1200 with a 1000 budget? I expect 'no budget'."
**Red**: 🔴
**Dev**: "I'll add this `if` here."
**Green**: 🟢
**Edge case**: "What if the cost is EXACTLY the limit? Approve or not?"
**Dev**: "…no idea."
**Test**: "THEN ASK THE PO, WOMAN!" 🗣️
**PO**: "Equal to the limit is allowed."
**Edge case**: "Then I'll live here forever reminding everyone of that." 📜🟢

## 🎬 Scene 3 · The cleanup and the alarm
**Cleanup**: "All green? Now I'll fix the names and tidy up the mess. If I break something, the tests will scream." 🧹
**Dev** _(six months later, changing `>` to `>=` by accident)_: "There, just a tiny tweak…"
**Edge case**: "HEY! THE PO SAID THE LIMIT IS ALLOWED!" 🔴🚨
**Dev**: "Thank you for existing." 🥹

## 💻 Translating to code
```js
describe('podeAprovar', () => {
  test('approves when it fits the budget and the limit', () => {       // ✋ born first
    expect(podeAprovar({ custoCentavos: 500, orcamentoCentavos: 1000, limiteAprovadorCentavos: 800 }))
      .toEqual({ ok: true });
  });
  test('approves exactly at the limit (rule agreed with the PO)', () => { // 📏 edge case
    expect(podeAprovar({ custoCentavos: 800, orcamentoCentavos: 800, limiteAprovadorCentavos: 800 }).ok).toBe(true);
  });
});

function podeAprovar({ custoCentavos, orcamentoCentavos, limiteAprovadorCentavos }) {   // 🟢 the minimum
  if (custoCentavos > orcamentoCentavos) return { ok: false, motivo: 'SEM_ORCAMENTO' };
  if (custoCentavos > limiteAprovadorCentavos) return { ok: false, motivo: 'ACIMA_DO_LIMITE' };
  return { ok: true };
}
```

| Step | What you do |
| --- | --- |
| 🔴 Red | Write the test for the next behavior and watch it fail |
| 🟢 Green | Write the minimum code to pass |
| 🧹 Refactor | Improve the code without changing behavior |

In the lab, change a `>` to `>=` in the rule and run it: the limit test turns red.

## 🎤 For the interview
"TDD is red, green, refactor: I write the test for the next behavior, watch it fail, do the minimum to pass, and improve the code with the tests protecting me. Edge cases become living documentation of the rule agreed with the PO, and seeing the test fail proves it tests something."
