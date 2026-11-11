// ===== Bastidores =====
// Banco (com transação), RabbitMQ (fila em memória) e um jeito de simular o processo "caindo".

const db = {
  viagens: { v1: { id: 'v1', status: 'PENDENTE' } },
  outbox: [],                    // { id, tipo, payload, publicadoEm }
  processadas: new Set(),        // tabela de deduplicação do consumidor
  async transacao(nome, fn) {
    trace(nome, 'BEGIN');
    await sleep(40);
    const snapshot = JSON.stringify({ v: this.viagens, o: this.outbox });
    try { await fn(); await sleep(40); trace(nome, 'COMMIT', 'good'); }
    catch (e) { const s = JSON.parse(snapshot); this.viagens = s.v; this.outbox = s.o; trace(nome, 'ROLLBACK', 'bad'); throw e; }
  },
};

const rabbit = {
  consumidores: [],
  async publish(msg) {
    await sleep(30);
    trace('RabbitMQ', `recebeu ${msg.tipo} (id ${msg.id.slice(0, 8)})`);
    stat.inc('Mensagens entregues pelo RabbitMQ');
    for (const c of this.consumidores) setTimeout(() => c(msg), 20);
  },
  consume(fn) { this.consumidores.push(fn); },
};

let jaCaiu = new Set();
function talvezCair(ponto, onde) {
  if (QUEDA === ponto && !jaCaiu.has(ponto)) {
    jaCaiu.add(ponto);
    trace(onde, `💥 PROCESSO CAIU (${ponto})`, 'bad');
    throw new Error(`${onde} caiu em "${ponto}"`);
  }
}
