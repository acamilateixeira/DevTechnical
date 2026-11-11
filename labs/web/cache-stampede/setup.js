// ===== Bastidores =====
// Um "Redis" (Map com expiração) e um "banco" lento que conta quantas queries recebeu.

const redis = new Map(); // chave → { valor, expiraEm }
const cache = {
  async get(k) {
    await sleep(2);
    const item = redis.get(k);
    if (!item || item.expiraEm < Date.now()) return null;
    return item.valor;
  },
  async set(k, valor, ttlMs) { await sleep(2); redis.set(k, { valor, expiraEm: Date.now() + ttlMs }); },
  async del(k) { redis.delete(k); },
};

let queriesNoBanco = 0;
async function bancoBuscarProduto(id) {
  queriesNoBanco++;
  stat('Queries no banco', queriesNoBanco);
  trace('Banco', `SELECT produto ${id} (query nº ${queriesNoBanco})`, queriesNoBanco > 1 ? 'bad' : '');
  await sleep(300); // query pesada
  return { id, nome: 'Notebook', preco: 4999 };
}
