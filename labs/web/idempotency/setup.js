// ===== Bastidores =====
// "Banco de dados" em memória e uma rede que PERDE a resposta de algumas requisições:
// o servidor processa, mas a resposta não chega ao cliente (o cliente vê um timeout).

const db = {
  cobrancas: [],                       // cada item = uma cobrança no cartão
  idempotencia: new Map(),             // Idempotency-Key → { status, body, hash }
};

function cobrarCartao(valor) {
  db.cobrancas.push(valor);
  stat('Cobranças no cartão', db.cobrancas.length);
  trace('Banco', `INSERT cobrança R$${valor} (total: ${db.cobrancas.length})`, db.cobrancas.length > 1 ? 'bad' : 'good');
}

// A rede: chama o servidor e, nas primeiras PERDER_RESPOSTAS tentativas, perde a resposta.
const PERDER_RESPOSTAS = 2;
let tentativa = 0;
async function rede(servidor, req) {
  tentativa++;
  stat('Tentativas do cliente', tentativa);
  trace('Rede', `POST /payments (tentativa ${tentativa}) key=${req.headers['Idempotency-Key'] ?? '—'}`);
  await sleep(60);
  const res = await servidor(req);
  if (tentativa <= PERDER_RESPOSTAS) {
    await sleep(60);
    trace('Rede', `resposta ${res.status} PERDIDA no caminho (cliente vê timeout)`, 'bad');
    throw new Error('timeout');
  }
  trace('Rede', `resposta ${res.status} chegou`, 'good');
  return res;
}
