// ===== Bastidores =====
// Um "banco" em memória com transações, latência e lock de linha (SELECT ... FOR UPDATE).
// Cada transação aparece na sua própria coluna da linha do tempo.

const tabela = { cc1: { id: 'cc1', saldo: 1000 } }; // centro de custo com R$1000 de orçamento
const filasDeLock = new Map();                       // id da linha → promise de quem está com o lock
const LATENCIA = 60;

async function transacao(nome, fn) {
  const meusLocks = [];
  const tx = {
    async select(id) {
      await sleep(LATENCIA);
      trace(nome, `SELECT saldo → ${tabela[id].saldo}`);
      return { ...tabela[id] };
    },
    async selectForUpdate(id) {
      trace(nome, 'SELECT ... FOR UPDATE (pede o lock)');
      const anterior = filasDeLock.get(id) ?? Promise.resolve();
      let liberar;
      const meu = new Promise((r) => (liberar = r));
      filasDeLock.set(id, anterior.then(() => meu));
      const inicio = performance.now();
      await anterior;                                 // espera quem está com o lock terminar
      const esperou = performance.now() - inicio;
      if (esperou > 5) trace(nome, `esperou ${esperou.toFixed(0)}ms pelo lock`, 'good');
      meusLocks.push(liberar);
      await sleep(LATENCIA);
      trace(nome, `pegou o lock, saldo → ${tabela[id].saldo}`);
      return { ...tabela[id] };
    },
    async update(id, saldo) {
      await sleep(LATENCIA);
      trace(nome, `UPDATE saldo = ${saldo}`);
      tabela[id].saldo = saldo;
    },
    // UPDATE ... SET saldo = saldo - :v WHERE id = :id AND saldo >= :v  (tudo de uma vez, no banco)
    async debitarSeHouverSaldo(id, valor) {
      await sleep(LATENCIA);
      const ok = tabela[id].saldo >= valor;
      if (ok) tabela[id].saldo -= valor;
      trace(nome, `UPDATE ... WHERE saldo >= ${valor} → ${ok ? '1 linha' : '0 linhas'}`, ok ? 'good' : '');
      return ok;
    },
  };
  trace(nome, 'BEGIN');
  try {
    const r = await fn(tx);
    trace(nome, 'COMMIT');
    return r;
  } finally {
    meusLocks.forEach((liberar) => liberar());     // locks só saem no fim da transação
  }
}
