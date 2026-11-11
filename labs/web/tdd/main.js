// TDD: escreva o teste, veja falhar (vermelho), faça passar (verde), melhore (refatorar).
// Os testes rodam quando você aperta Rodar. Experimente quebrar a regra e ver qual teste fica vermelho.

// ---------- a regra (código de produção) ----------
function podeAprovar({ custoCentavos, orcamentoCentavos, limiteAprovadorCentavos }) {
  if (!Number.isInteger(custoCentavos) || custoCentavos <= 0) return { ok: false, motivo: 'CUSTO_INVALIDO' };
  if (custoCentavos > orcamentoCentavos) return { ok: false, motivo: 'SEM_ORCAMENTO' };
  if (custoCentavos > limiteAprovadorCentavos) return { ok: false, motivo: 'ACIMA_DO_LIMITE' };
  return { ok: true };
}

// ---------- os testes ----------
describe('podeAprovar', () => {
  test('aprova quando cabe no orçamento e no limite do aprovador', () => {
    expect(podeAprovar({ custoCentavos: 500, orcamentoCentavos: 1000, limiteAprovadorCentavos: 800 })).toEqual({ ok: true });
  });
  test('recusa quando passa do orçamento', () => {
    expect(podeAprovar({ custoCentavos: 1200, orcamentoCentavos: 1000, limiteAprovadorCentavos: 5000 }))
      .toEqual({ ok: false, motivo: 'SEM_ORCAMENTO' });
  });
  test('recusa quando passa do limite do aprovador', () => {
    expect(podeAprovar({ custoCentavos: 900, orcamentoCentavos: 1000, limiteAprovadorCentavos: 800 }))
      .toEqual({ ok: false, motivo: 'ACIMA_DO_LIMITE' });
  });
  test('aprova exatamente no limite (regra combinada com o PO)', () => {
    expect(podeAprovar({ custoCentavos: 800, orcamentoCentavos: 800, limiteAprovadorCentavos: 800 }).ok).toBe(true);
  });
  test('recusa custo zero ou negativo', () => {
    expect(podeAprovar({ custoCentavos: 0, orcamentoCentavos: 1000, limiteAprovadorCentavos: 800 }).motivo).toBe('CUSTO_INVALIDO');
    expect(podeAprovar({ custoCentavos: -5, orcamentoCentavos: 1000, limiteAprovadorCentavos: 800 }).motivo).toBe('CUSTO_INVALIDO');
  });
  test('recusa valor quebrado (dinheiro é sempre em centavos inteiros)', () => {
    expect(podeAprovar({ custoCentavos: 10.5, orcamentoCentavos: 1000, limiteAprovadorCentavos: 800 }).ok).toBe(false);
  });
});
