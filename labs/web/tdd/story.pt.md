# 🚦 O teste que furou a fila

> Segunda-feira, daily. O PO chega com regra nova e a dev já está com os dedos no teclado.

## 🎭 Elenco
- 📋 **PO** · quem define a regra de negócio · sabe o que pode e o que não pode
- 👩‍💻 **Dev** · quem escreve `podeAprovar()` · apressadinha
- ✋ **Teste** · `test('...', () => expect(...))` · no TDD, nasce ANTES do código
- 🔴 **Vermelho** · teste falhando · prova que o teste testa alguma coisa
- 🟢 **Verde** · teste passando · o mínimo de código pra cumprir o que o teste pede
- 🧹 **Faxina** · refatorar · melhorar o código com os testes de guarda-costas
- 📏 **Caso de borda** · `custo === limite` · a pergunta que ninguém tinha feito

## 🎬 Cena 1 · Quem chega primeiro
**PO**: "Regra nova: o gestor só aprova viagem que caiba no orçamento E no limite dele."
**Dev**: "Já tô codando!" ⌨️
**Teste** _(se jogando na frente do teclado)_: "PERAÍ, MENINA! No TDD eu nasço primeiro!" ✋
**Teste**: "Custo 500, orçamento 1000, limite 800: espero aprovado."
**Vermelho**: "FALHOU! A função nem existe!" 🔴
**Dev**: "Tá, faço o MÍNIMO pra passar."
**Verde**: "Passou!" 🟢
= 🧪 Testes: 1
= 🔴 Falhando: 0 (o primeiro falhou e depois passou)
= 🟢 Passando: 1
= 📄 Regras no código: só `return { ok: true }`

## 🎬 Cena 2 · Um teste de cada vez
**Teste**: "Custo 1200 com orçamento 1000? Espero 'sem orçamento'."
**Vermelho**: 🔴
**Dev**: "Acrescento esse `if` aqui."
**Verde**: 🟢
**Caso de borda**: "E se o custo for EXATAMENTE igual ao limite? Aprova ou não aprova?"
**Dev**: "…sei lá, uai."
**Teste**: "ENTÃO PERGUNTA PRO PO, CRIATURA!" 🗣️
**PO**: "Igual ao limite pode."
**Caso de borda**: "Então vou morar aqui pra sempre lembrando todo mundo disso." 📜🟢
= 🧪 Testes: 3 (aprova · sem orçamento · no limite)
= 🟢 Passando: 3
= 📏 Regra combinada com o PO: custo === limite → aprova

## 🎬 Cena 3 · A faxina e o alarme
**Faxina**: "Tudo verde? Agora eu arrumo os nomes e organizo a bagunça. Se eu quebrar algo, os testes gritam." 🧹
**Dev** _(seis meses depois, trocando `>` por `>=` sem querer)_: "Pronto, só uma mexidinha…"
**Caso de borda**: "EI! O PO DISSE QUE NO LIMITE PODE!" 🔴🚨
**Dev**: "Obrigada por existir." 🥹
= 🧹 Refatoração: nomes melhores, mesmo comportamento
= 🐛 Mudança acidental: `>` virou `>=`
= 🔴 Falhando: 1: "aprova exatamente no limite" ✅ pegou o bug

## 💻 Traduzindo pro código
```js
describe('podeAprovar', () => {
  test('aprova quando cabe no orçamento e no limite', () => {          // ✋ nasce primeiro
    expect(podeAprovar({ custoCentavos: 500, orcamentoCentavos: 1000, limiteAprovadorCentavos: 800 }))
      .toEqual({ ok: true });
  });
  test('aprova exatamente no limite (regra combinada com o PO)', () => { // 📏 caso de borda
    expect(podeAprovar({ custoCentavos: 800, orcamentoCentavos: 800, limiteAprovadorCentavos: 800 }).ok).toBe(true);
  });
});

function podeAprovar({ custoCentavos, orcamentoCentavos, limiteAprovadorCentavos }) {   // 🟢 o mínimo
  if (custoCentavos > orcamentoCentavos) return { ok: false, motivo: 'SEM_ORCAMENTO' };
  if (custoCentavos > limiteAprovadorCentavos) return { ok: false, motivo: 'ACIMA_DO_LIMITE' };
  return { ok: true };
}
```

| Passo | O que você faz |
| --- | --- |
| 🔴 Vermelho | Escreve o teste do próximo comportamento e vê falhar |
| 🟢 Verde | Escreve o mínimo de código para passar |
| 🧹 Refatorar | Melhora o código sem mudar o comportamento |

No lab, troque um `>` por `>=` na regra e rode: o teste do limite fica vermelho.

## 🎤 Pra entrevista
"TDD é vermelho, verde, refatorar: escrevo o teste do próximo comportamento, vejo falhar, faço o mínimo para passar e melhoro o código com os testes me protegendo. Os casos de borda viram documentação viva da regra combinada com o PO, e o teste falhando prova que ele testa alguma coisa."
