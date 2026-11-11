// RE-RENDERS, CONTEXT E MEMO
// Cada caixa pisca e conta quantas vezes RENDERIZOU. Clique nos botões e observe
// quem re-renderiza sem precisar. Depois mude MODO e repita.
import { createContext, memo, useContext, useReducer, useRef, useEffect } from 'react';

// 'unico'   → um Context só com { state, dispatch } criado a cada render
// 'separado'→ dois Contexts: estado e dispatch separados (dispatch nunca muda)
const MODO: 'unico' | 'separado' = 'unico';

type State = { itens: string[]; tema: 'claro' | 'escuro' };
type Action = { type: 'adicionou'; item: string } | { type: 'trocouTema' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'adicionou': return { ...state, itens: [...state.itens, action.item] };
    case 'trocouTema': return { ...state, tema: state.tema === 'claro' ? 'escuro' : 'claro' };
  }
}

const Tudo = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);
const Estado = createContext<State | null>(null);
const Dispatch = createContext<((a: Action) => void) | null>(null);

// Lê só o que precisa conforme o modo
const useDispatchCarrinho = () => (MODO === 'unico' ? useContext(Tudo)!.dispatch : useContext(Dispatch)!);
const useEstado = () => (MODO === 'unico' ? useContext(Tudo)!.state : useContext(Estado)!);

// Contador de renders + "flash" visual (mostra o que re-renderizou)
function useRenderCount(nome: string) {
  const n = useRef(0);
  const el = useRef<HTMLDivElement>(null);
  n.current++;
  useEffect(() => {
    stat(`Renders: ${nome}`, n.current);
    trace(nome, `render #${n.current}`);
    el.current?.classList.remove('flash'); void el.current?.offsetWidth; el.current?.classList.add('flash');
  });
  return { n: n.current, el };
}

const BotaoAdicionar = memo(function BotaoAdicionar() {
  const dispatch = useDispatchCarrinho();
  const { n, el } = useRenderCount('BotaoAdicionar');
  return <div ref={el} className="card">BotaoAdicionar (renders: {n}){' '}
    <button onClick={() => dispatch({ type: 'adicionou', item: `item ${Date.now() % 1000}` })}>+ item</button></div>;
});

const Lista = memo(function Lista() {
  const { itens } = useEstado();
  const { n, el } = useRenderCount('Lista');
  return <div ref={el} className="card">Lista (renders: {n}): {itens.join(', ') || 'vazia'}</div>;
});

const Rodape = memo(function Rodape() {
  const { n, el } = useRenderCount('Rodape');
  return <div ref={el} className="card">Rodapé estático, não usa o estado (renders: {n})</div>;
});

export default function App() {
  const [state, dispatch] = useReducer(reducer, { itens: [], tema: 'claro' });
  const tudo = { state, dispatch }; // objeto NOVO a cada render
  const conteudo = (
    <>
      <p className="muted">Modo: <code>{MODO}</code> · tema: {state.tema}{' '}
        <button onClick={() => dispatch({ type: 'trocouTema' })}>trocar tema</button></p>
      <BotaoAdicionar />
      <Lista />
      <Rodape />
    </>
  );
  return MODO === 'unico'
    ? <Tudo.Provider value={tudo}>{conteudo}</Tudo.Provider>
    : <Dispatch.Provider value={dispatch}><Estado.Provider value={state}>{conteudo}</Estado.Provider></Dispatch.Provider>;
}
