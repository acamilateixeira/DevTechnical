// MINI ZUSTAND: uma store global com seletores em ~20 linhas.
// É assim que Zustand (e o useSelector do Redux) funcionam por dentro:
// a store guarda o estado fora do React e cada componente assina SÓ a fatia que usa.
import { useSyncExternalStore, useRef, useEffect } from 'react';

function create<T>(init: (set: (partial: Partial<T>) => void, get: () => T) => T) {
  let state: T;
  const listeners = new Set<() => void>();
  const set = (partial: Partial<T>) => {
    state = { ...state, ...partial };           // estado novo (imutável)
    trace('Store', `set(${JSON.stringify(partial)})`);
    listeners.forEach((l) => l());              // avisa quem assinou
  };
  state = init(set, () => state);
  const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
  // O hook: o componente re-renderiza só se o valor SELECIONADO mudar (comparação por ===)
  return <S,>(selector: (s: T) => S) => useSyncExternalStore(subscribe, () => selector(state));
}

// ---- a store dos filtros de uma tela de logs ----
type Filtros = {
  servico: string; busca: string; nivel: 'todos' | 'erro';
  setServico: (s: string) => void; setBusca: (b: string) => void; alternarNivel: () => void;
};
const useFiltros = create<Filtros>((set, get) => ({
  servico: 'trips-api', busca: '', nivel: 'todos',
  setServico: (servico) => set({ servico }),
  setBusca: (busca) => set({ busca }),
  alternarNivel: () => set({ nivel: get().nivel === 'todos' ? 'erro' : 'todos' }),
}));

function useRenders(nome: string) {
  const n = useRef(0); n.current++;
  useEffect(() => { stat(`Renders: ${nome}`, n.current); });
  return n.current;
}

function CampoBusca() {
  const busca = useFiltros((s) => s.busca);          // assina só "busca"
  const setBusca = useFiltros((s) => s.setBusca);
  const n = useRenders('CampoBusca');
  return <div className="card">CampoBusca (renders {n}) <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="digite" /></div>;
}

function SeletorServico() {
  const servico = useFiltros((s) => s.servico);      // assina só "servico"
  const setServico = useFiltros((s) => s.setServico);
  const n = useRenders('SeletorServico');
  return <div className="card">SeletorServico (renders {n}){' '}
    <select value={servico} onChange={(e) => setServico(e.target.value)}>
      <option>trips-api</option><option>billing</option><option>auth</option>
    </select></div>;
}

function BotaoNivel() {
  const nivel = useFiltros((s) => s.nivel);
  const alternar = useFiltros((s) => s.alternarNivel);
  const n = useRenders('BotaoNivel');
  return <div className="card">BotaoNivel (renders {n}) <button onClick={alternar}>nível: {nivel}</button></div>;
}

export default function App() {
  return (
    <div>
      <p className="muted">Digite na busca e veja nos contadores: só o CampoBusca re-renderiza.</p>
      <CampoBusca />
      <SeletorServico />
      <BotaoNivel />
    </div>
  );
}
