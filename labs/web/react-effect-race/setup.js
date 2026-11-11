// ===== Bastidores =====
// API falsa de ofertas. De propósito, valores maiores demoram MAIS para responder
// (como uma rede instável): assim a resposta antiga pode chegar depois da nova.
let numeroDaRequisicao = 0;

function fetchOffers(amount, signal) {
  const n = ++numeroDaRequisicao;
  const latencia = { 1000: 200, 2000: 800, 3000: 1400 }[amount] ?? 500;
  trace('API', `#${n} pediu ofertas para R$${amount} (vai levar ${latencia}ms)`);
  stat.inc('Requisições enviadas');
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      trace('API', `#${n} respondeu R$${amount}`);
      resolve({ amount, offers: [`Banco A: ${(amount * 1.05).toFixed(0)}`, `Banco B: ${(amount * 1.08).toFixed(0)}`] });
    }, latencia);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      trace('API', `#${n} CANCELADA`, 'good');
      stat.inc('Requisições canceladas');
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}
