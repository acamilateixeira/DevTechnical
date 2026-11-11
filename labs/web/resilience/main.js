// RESILIÊNCIA: timeout por provedor, resposta parcial e circuit breaker.
// A API consulta 3 provedores em paralelo. O Beta é lento e falha muito.
// Sem proteção, toda requisição espera o Beta. Mude os valores e compare "Tempo médio".

const TIMEOUT_MS = 400;        // tente 5000 para ver o efeito de "esperar o mais lento"
const USAR_BREAKER = true;     // tente false: o Beta continua sendo chamado sempre

// Circuit breaker: depois de N falhas seguidas, "abre" e para de chamar por um tempo.
class CircuitBreaker {
  constructor(nome, { falhasParaAbrir = 2, tempoAbertoMs = 1500 } = {}) {
    Object.assign(this, { nome, falhasParaAbrir, tempoAbertoMs, falhas: 0, abertoAte: 0 });
  }
  async chamar(fn) {
    if (Date.now() < this.abertoAte) {
      stat.inc('Chamadas evitadas pelo breaker');
      trace('Breaker', `${this.nome} ABERTO: falha rápido sem chamar`, 'good');
      throw new Error(`${this.nome} circuito aberto`);
    }
    try {
      const r = await fn();
      if (this.falhas) trace('Breaker', `${this.nome} voltou: fecha o circuito`, 'good');
      this.falhas = 0;
      return r;
    } catch (e) {
      if (++this.falhas >= this.falhasParaAbrir) {
        this.abertoAte = Date.now() + this.tempoAbertoMs;
        trace('Breaker', `${this.nome}: ${this.falhas} falhas seguidas → ABRE por ${this.tempoAbertoMs}ms`, 'bad');
      }
      throw e;
    }
  }
}
const breakers = Object.fromEntries(Object.keys(PROVEDORES).map((n) => [n, new CircuitBreaker(n)]));

function comTimeout(nome) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return chamarProvedor(nome, controller.signal).finally(() => clearTimeout(timer));
}

async function buscarOfertas(numero) {
  const t0 = performance.now();
  trace('API', `requisição ${numero}`);
  const nomes = Object.keys(PROVEDORES);
  const resultados = await Promise.allSettled(nomes.map((nome) =>
    USAR_BREAKER ? breakers[nome].chamar(() => comTimeout(nome)) : comTimeout(nome)));

  const ofertas = resultados.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const falharam = nomes.filter((_, i) => resultados[i].status === 'rejected');
  const ms = Math.round(performance.now() - t0);
  stat.inc('Requisições');
  stat('Tempo total somado (ms)', (stat.get('Tempo total somado (ms)') || 0) + ms);
  stat('Tempo médio (ms)', Math.round(stat.get('Tempo total somado (ms)') / stat.get('Requisições')));
  if (!ofertas.length) { trace('API', `503: nenhuma oferta (${ms}ms)`, 'bad'); return; }
  if (falharam.length) stat.inc('Respostas parciais');
  trace('API', `${ofertas.length} ofertas${falharam.length ? `, falharam: ${falharam.join(', ')}` : ''} (${ms}ms)`, falharam.length ? '' : 'good');
}

export async function run() {
  for (let i = 1; i <= 8; i++) {
    await buscarOfertas(i);
    await sleep(150);
  }
}
