// ===== Bastidores =====
// Um banco com 50 viagens e 10 usuários. Cada query conta no contador e aparece na linha do tempo.
const usuarios = Array.from({ length: 10 }, (_, i) => ({ id: `u${i + 1}`, nome: `Pessoa ${i + 1}` }));
const viagens = Array.from({ length: 50 }, (_, i) => ({ id: `t${i + 1}`, titulo: `Viagem ${i + 1}`, requesterId: `u${(i % 10) + 1}` }));

const sql = {
  async query(texto, resultado) {
    stat.inc('Queries no banco');
    if (stat.get('Queries no banco') <= 12) trace('Banco', texto);
    await sleep(20);
    return resultado();
  },
};
