// useEffect + RACE CONDITION
// Clique rápido em 3000 → 2000 → 1000. Sem cancelamento, a resposta que chega por último
// vence, mesmo sendo de um pedido antigo. Ligue o AbortController e repita.
import { useEffect, useState } from 'react';

type Result = { amount: number; offers: string[] };

function Offers({ amount, cancelar }: { amount: number; cancelar: boolean }) {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    trace('Componente', `effect rodou para R$${amount}`);

    fetchOffers(amount, cancelar ? controller.signal : undefined)
      .then((r) => {
        trace('Componente', `setData(R$${r.amount})`, r.amount === amount ? 'good' : 'bad');
        setData(r);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') throw err; // cancelado: ignora de propósito
      });

    // cleanup: roda ANTES do próximo effect (quando `amount` muda)
    return () => {
      trace('Componente', `cleanup do effect de R$${amount}`);
      controller.abort();
    };
  }, [amount, cancelar]);

  const errado = data && data.amount !== amount;
  return (
    <div className="card">
      <p>Você escolheu: <strong>R${amount}</strong> {loading && <span className="muted">(carregando…)</span>}</p>
      <p>A tela mostra ofertas de: <strong className={errado ? 'bad' : 'good'}>R${data?.amount ?? '—'}</strong></p>
      {errado && <p className="bad">BUG: a resposta antiga chegou por último e sobrescreveu a nova.</p>}
      <ul>{data?.offers.map((o) => <li key={o}>{o}</li>)}</ul>
    </div>
  );
}

export default function App() {
  const [amount, setAmount] = useState(1000);
  const [cancelar, setCancelar] = useState(false);
  const clicarRapido = async () => {
    for (const v of [3000, 2000, 1000]) { setAmount(v); await sleep(150); }
  };
  return (
    <div>
      <label>
        <input type="checkbox" checked={cancelar} onChange={(e) => setCancelar(e.target.checked)} />
        {' '}cancelar a requisição anterior com AbortController
      </label>
      <p>
        {[1000, 2000, 3000].map((v) => <button key={v} onClick={() => setAmount(v)}>R${v}</button>)}
        <button onClick={clicarRapido}>Clicar rápido: 3000 → 2000 → 1000</button>
      </p>
      <Offers amount={amount} cancelar={cancelar} />
    </div>
  );
}
