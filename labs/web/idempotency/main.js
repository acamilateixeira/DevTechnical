// IDEMPOTÊNCIA: como não cobrar duas vezes quando a rede falha e o cliente tenta de novo.
// Rode como está e veja o contador "Cobranças no cartão". Depois mude USAR_CHAVE para true.

const USAR_CHAVE = false;          // o servidor verifica a Idempotency-Key?
const NOVA_CHAVE_POR_TENTATIVA = false; // bug comum: gerar uma chave nova a cada retry

// ---------- SERVIDOR ----------
async function servidorPagamentos(req) {
  const key = req.headers['Idempotency-Key'];
  const hash = JSON.stringify(req.body);

  if (USAR_CHAVE && key) {
    const salvo = db.idempotencia.get(key);
    if (salvo) {
      if (salvo.hash !== hash) {
        trace('Servidor', 'mesma chave com dados diferentes → 422', 'bad');
        return { status: 422, body: { error: 'key reused with different payload' } };
      }
      trace('Servidor', `chave já vista → devolve a resposta salva (sem cobrar de novo)`, 'good');
      return salvo.response;
    }
  }

  trace('Servidor', `processando pagamento de R$${req.body.valor}`);
  cobrarCartao(req.body.valor);
  const response = { status: 201, body: { ok: true, valor: req.body.valor } };
  if (USAR_CHAVE && key) {
    // na vida real: INSERT com constraint UNIQUE(key) na mesma transação da cobrança
    db.idempotencia.set(key, { hash, response });
  }
  return response;
}

// ---------- CLIENTE ----------
async function pagarComRetry(valor) {
  let key = uuid(); // uma chave por INTENÇÃO de pagamento
  for (let i = 1; i <= 4; i++) {
    if (NOVA_CHAVE_POR_TENTATIVA) key = uuid();
    try {
      const res = await rede(servidorPagamentos, { headers: { 'Idempotency-Key': key }, body: { valor } });
      trace('Cliente', `sucesso: ${res.status}`, 'good');
      return res;
    } catch {
      const espera = 100 * 2 ** (i - 1); // backoff exponencial: 100, 200, 400…
      trace('Cliente', `falhou, tentando de novo em ${espera}ms`);
      await sleep(espera);
    }
  }
  trace('Cliente', 'desistiu', 'bad');
}

export async function run() {
  await pagarComRetry(150);
  log(`Cobranças no cartão: ${db.cobrancas.length} (o certo é 1)`);
}
