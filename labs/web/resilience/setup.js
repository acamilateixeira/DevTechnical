// ===== Bastidores =====
// Três provedores de crédito falsos. Mude latência e taxa de falha à vontade.
const PROVEDORES = {
  Alpha: { latencia: [80, 150], falha: 0 },
  Beta:  { latencia: [1500, 3000], falha: 0.5 },   // lento e instável
  Gamma: { latencia: [100, 200], falha: 0 },
};

function chamarProvedor(nome, signal) {
  const cfg = PROVEDORES[nome];
  const ms = rand(cfg.latencia[0], cfg.latencia[1]);
  stat.inc(`Chamadas reais a ${nome}`);
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      if (Math.random() < cfg.falha) { trace(nome, `erro 500 (${ms}ms)`, 'bad'); reject(new Error(`${nome} 500`)); }
      else { trace(nome, `oferta em ${ms}ms`); resolve({ provedor: nome, taxa: (1 + Math.random() * 2).toFixed(2) + '%' }); }
    }, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); trace(nome, 'cancelado (timeout)', 'bad'); reject(new Error(`${nome} timeout`)); });
  });
}
