// KEYS EM LISTAS
// Cada item tem um <input> (o React guarda o que você digitou ligado à "identidade" do item).
// A identidade é a `key`. Troque entre key = índice e key = id e repita o teste.
import { useState } from 'react';

type Item = { id: number; nome: string };
let proximoId = 4;

export default function App() {
  const [itens, setItens] = useState<Item[]>([
    { id: 1, nome: 'Ana' }, { id: 2, nome: 'Bruno' }, { id: 3, nome: 'Carla' },
  ]);
  const [usarId, setUsarId] = useState(false);

  const adicionarNoTopo = () => {
    const novo = { id: proximoId++, nome: ['Davi', 'Eva', 'Fábio', 'Gil'][proximoId % 4] };
    trace('Usuário', `adicionou ${novo.nome} no topo`);
    setItens([novo, ...itens]);
  };

  return (
    <div>
      <p>
        <label>
          <input type="checkbox" checked={usarId} onChange={(e) => setUsarId(e.target.checked)} />
          {' '}usar <code>key=&#123;item.id&#125;</code> (desmarcado = <code>key=&#123;index&#125;</code>)
        </label>
      </p>
      <p className="muted">1) Escreva algo no campo da Ana. 2) Clique em "Adicionar no topo". Veja para onde o texto foi.</p>
      <button onClick={adicionarNoTopo}>Adicionar no topo</button>
      <button onClick={() => setItens([...itens].reverse())}>Inverter ordem</button>
      <ul>
        {itens.map((item, index) => (
          <li key={usarId ? item.id : index} className="card">
            <strong>{item.nome}</strong> (id {item.id}){' '}
            <input placeholder={`nota sobre ${item.nome}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
