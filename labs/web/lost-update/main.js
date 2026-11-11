// LOST UPDATE: dois gestores aprovam viagens AO MESMO TEMPO contra o mesmo orçamento (R$1000).
// Cada viagem custa R$800, então só UMA deveria ser aprovada.
// Troque MODO e rode de novo.

const MODO = 'sem-lock'; // 'sem-lock' | 'for-update' | 'atomico'

async function aprovarViagem(gestor, valor) {
  return transacao(gestor, async (tx) => {
    if (MODO === 'atomico') {
      return tx.debitarSeHouverSaldo('cc1', valor);
    }

    const cc = MODO === 'for-update'
      ? await tx.selectForUpdate('cc1')   // trava a linha: o outro espera
      : await tx.select('cc1');           // só lê: o outro lê o MESMO valor

    if (cc.saldo < valor) {
      trace(gestor, `saldo ${cc.saldo} < ${valor}: recusa`, 'good');
      return false;
    }
    await tx.update('cc1', cc.saldo - valor);
    return true;
  });
}

export async function run() {
  const [a, b] = await Promise.all([          // as duas "requisições" chegam juntas
    aprovarViagem('Gestor A', 800),
    aprovarViagem('Gestor B', 800),
  ]);
  const aprovadas = [a, b].filter(Boolean).length;
  stat('Viagens aprovadas', aprovadas);
  stat('Saldo final no banco', tabela.cc1.saldo);
  stat('Dinheiro gasto de verdade', 800 * aprovadas);
  if (aprovadas > 1) log(`ERRO: aprovou ${aprovadas} viagens (R$${800 * aprovadas}) com só R$1000. O banco diz saldo ${tabela.cc1.saldo}: uma escrita apagou a outra.`);
  else log(`Certo: só ${aprovadas} viagem aprovada, saldo ${tabela.cc1.saldo}.`);
}
