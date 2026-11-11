// CACHE-ASIDE e CACHE STAMPEDE
// 50 usuários abrem a página do produto no mesmo instante em que o cache acabou de expirar.
// Sem proteção, os 50 vão ao banco. Mude SINGLE_FLIGHT para true e compare "Queries no banco".

const SINGLE_FLIGHT = false;
const TTL_MS = 5000;
const emAndamento = new Map(); // chave → Promise da busca que já está rodando

async function getProduto(id, usuario) {
  const chave = `produto:${id}`;

  // 1. tenta o cache
  const noCache = await cache.get(chave);
  if (noCache) { stat.inc('Respostas do cache'); return noCache; }
  if (usuario <= 3) trace(`Usuário ${usuario}`, 'cache miss');

  // 2. single-flight: se alguém já está buscando, espera a MESMA promise
  if (SINGLE_FLIGHT && emAndamento.has(chave)) {
    stat.inc('Esperaram a busca de outro');
    return emAndamento.get(chave);
  }

  // 3. busca no banco e guarda no cache
  const busca = (async () => {
    const produto = await bancoBuscarProduto(id);
    const ttl = TTL_MS + rand(0, 1000);  // jitter: chaves não expiram todas juntas
    await cache.set(chave, produto, ttl);
    trace('Cache', `SET ${chave} (TTL ${ttl}ms)`);
    return produto;
  })();
  if (SINGLE_FLIGHT) emAndamento.set(chave, busca);
  try { return await busca; } finally { emAndamento.delete(chave); }
}

export async function run() {
  const usuarios = Array.from({ length: 50 }, (_, i) => i + 1);
  const t0 = performance.now();
  await Promise.all(usuarios.map((u) => getProduto(42, u)));
  stat('Tempo total (ms)', Math.round(performance.now() - t0));

  // uma segunda leva, com o cache já quente
  await Promise.all(usuarios.map((u) => getProduto(42, u + 50)));
  log(`Queries no banco: ${queriesNoBanco}. Com single-flight, deveria ser 1.`);
}
