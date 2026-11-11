export default [
  {
    id: 'react-reconciliation-keys',
    cat: 'react', type: 'concept', jobs: ['sr-observability', 'sr-node-react', 'frontend'],
    tags: ['reconciliation', 'virtual dom', 'keys', 'fiber', 'render'],
    q: {
      pt: 'Como funciona a reconciliação no React? Por que usar o índice do array como `key` é um problema?',
      en: 'How does reconciliation work in React? Why is using the array index as a `key` a problem?',
    },
    a: {
      pt: `A cada render o React produz uma nova árvore de elementos e compara com a anterior (diffing). Duas heurísticas tornam isso O(n): elementos de **tipos diferentes** geram subárvores novas, e em listas a \`key\` identifica qual item é qual entre renders. Depois da comparação, o React aplica no DOM só o que mudou (commit). Com o Fiber, esse trabalho pode ser fatiado e priorizado (concurrent rendering).

A \`key\` precisa ser **estável e única entre irmãos**. Com o índice, ao inserir, remover ou reordenar itens, o React associa o estado ao item errado: um input preenchido "pula" para a linha de baixo, animações quebram e componentes são remontados à toa. O índice só é aceitável em lista estática, sem estado local e que nunca reordena.

Truque útil: mudar a \`key\` de um componente de propósito força o React a remontá-lo e zerar o estado (ex.: \`<Form key={userId} />\`).`,
      en: `On every render React produces a new element tree and compares it with the previous one (diffing). Two heuristics make this O(n): elements of **different types** produce brand-new subtrees, and in lists the \`key\` tells React which item is which across renders. After diffing, React applies only what changed to the DOM (commit). With Fiber, that work can be split and prioritized (concurrent rendering).

The \`key\` must be **stable and unique among siblings**. With the index, inserting, removing, or reordering items makes React attach state to the wrong item: a filled input "jumps" to the next row, animations break, and components remount for nothing. The index is only acceptable for a static list with no local state that never reorders.

Useful trick: changing a component's \`key\` on purpose forces React to remount it and reset its state (e.g. \`<Form key={userId} />\`).`,
    },
    follow: [
      { pt: 'Um re-render sempre gera mudança no DOM? O que dispara um re-render?', en: 'Does every re-render touch the DOM? What triggers a re-render?' },
      { pt: 'O que muda com o React Compiler em relação a memoização manual?', en: 'What does the React Compiler change about manual memoization?' },
    ],
    flags: {
      pt: '"O Virtual DOM é mais rápido que o DOM." Ele não é mágico: é um mecanismo para calcular o mínimo de mudanças. Também é red flag usar `Math.random()` como key.',
      en: '"The Virtual DOM is faster than the DOM." It is not magic: it is a way to compute the minimal set of changes. Using `Math.random()` as a key is also a red flag.',
    },
    anchor: {
      pt: 'Listas de corridas e motoristas no Bora (React Native usa o mesmo reconciliador) mudam em tempo real pelo Supabase Realtime: são o cenário perfeito para explicar por que a key precisa ser o ID do registro.',
      en: 'Ride and driver lists in Bora (React Native uses the same reconciler) change in real time through Supabase Realtime: the perfect setting to explain why the key must be the record ID.',
    },
  },
  {
    id: 'react-useeffect-pitfalls',
    cat: 'react', type: 'code', jobs: ['sr-observability', 'sr-node-react', 'frontend'],
    tags: ['useEffect', 'race condition', 'AbortController', 'cleanup', 'data fetching'],
    q: {
      pt: 'Este componente busca dados num `useEffect`. Encontre os bugs e reescreva como faria em produção.',
      en: 'This component fetches data in a `useEffect`. Find the bugs and rewrite it the way you would in production.',
    },
    code: [
      {
        label: { pt: 'Código do recrutador', en: "Interviewer's code" },
        src: `
function Offers({ amount }) {
  const [offers, setOffers] = useState([]);
  useEffect(async () => {
    const res = await fetch('/api/offers?amount=' + amount);
    setOffers(await res.json());
  });
  return offers.map((o) => <Offer {...o} />);
}`,
      },
      {
        label: { pt: 'Versão corrigida', en: 'Fixed version' },
        src: `
type State =
  | { status: 'loading' }
  | { status: 'ok'; offers: Offer[] }
  | { status: 'error'; error: string };

function Offers({ amount }: { amount: number }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetch(\`/api/offers?amount=\${encodeURIComponent(amount)}\`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json() as Promise<Offer[]>;
      })
      .then((offers) => setState({ status: 'ok', offers }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', error: err.message });
      });

    return () => controller.abort(); // cancela a requisição anterior
  }, [amount]);

  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <ErrorBox message={state.error} />;
  return state.offers.map((o) => <Offer key={o.id} {...o} />);
}`,
      },
    ],
    a: {
      pt: `Bugs do original:

- \`useEffect\` não pode receber função \`async\`: ela retorna uma Promise, e o React espera que o retorno seja a função de cleanup.
- Sem array de dependências o effect roda **a cada render**, e como ele faz \`setOffers\`, entra em loop infinito.
- **Race condition**: se \`amount\` muda rápido, a resposta antiga pode chegar depois da nova e sobrescrevê-la. O \`AbortController\` no cleanup resolve.
- \`fetch\` não rejeita em 404/500: é preciso checar \`res.ok\`.
- Sem estados de loading e erro, sem \`key\` na lista, e concatenação de query string sem encoding.

Em produção eu normalmente nem escreveria isso à mão: usaria **TanStack Query** (ou SWR, ou os loaders do framework), que já resolvem cache, deduplicação, cancelamento, retry e revalidação. O ponto sênior é saber o que a lib resolve por baixo.`,
      en: `Bugs in the original:

- \`useEffect\` cannot take an \`async\` function: it returns a Promise, while React expects the return value to be the cleanup function.
- Without a dependency array the effect runs **on every render**, and since it calls \`setOffers\`, it loops forever.
- **Race condition**: if \`amount\` changes quickly, an old response can arrive after the new one and overwrite it. An \`AbortController\` in the cleanup fixes it.
- \`fetch\` does not reject on 404/500: you must check \`res.ok\`.
- No loading or error states, no \`key\` on the list, and query string concatenation without encoding.

In production I usually would not hand-write this: I would use **TanStack Query** (or SWR, or the framework's loaders), which already handle caching, deduplication, cancellation, retry, and revalidation. The senior point is knowing what the library solves under the hood.`,
    },
    follow: [
      { pt: 'Por que o effect roda duas vezes em desenvolvimento com StrictMode?', en: 'Why does the effect run twice in development under StrictMode?' },
      { pt: 'Quando você NÃO precisa de useEffect? ("You might not need an effect")', en: 'When do you NOT need useEffect? ("You might not need an effect")' },
    ],
    flags: {
      pt: 'Resolver o loop desligando o lint de dependências, ou usar uma flag `isMounted` sem cancelar a requisição.',
      en: 'Fixing the loop by disabling the dependency lint, or using an `isMounted` flag without actually cancelling the request.',
    },
    anchor: {
      pt: 'O GEMP trata exatamente isso no back e no front: o cancelamento do cliente interrompe a busca (context.Context em Go) e a UI diferencia espera, parcial, indisponível e falha de rede. Conecte o AbortController do front ao cancelamento no servidor.',
      en: 'GEMP handles exactly this on both sides: client cancellation stops the search (context.Context in Go) and the UI distinguishes loading, partial, unavailable, and network failure. Connect the frontend AbortController to server-side cancellation.',
    },
  },
  {
    id: 'react-performance-memo',
    cat: 'react', type: 'concept', jobs: ['sr-observability', 'frontend', 'sr-node-react'],
    tags: ['useMemo', 'useCallback', 'React.memo', 'profiler', 'virtualization', 'performance'],
    q: {
      pt: 'Uma tela com uma tabela de 10 mil linhas de logs está lenta. Como você investiga e o que faz? Quando `useMemo`/`useCallback` ajudam de verdade?',
      en: 'A screen with a 10,000-row log table is slow. How do you investigate and what do you do? When do `useMemo`/`useCallback` actually help?',
    },
    a: {
      pt: `**Medir antes de otimizar.** React DevTools Profiler para ver quais componentes renderizam e por quê; aba Performance do Chrome para ver se o custo é script, layout ou paint; Web Vitals (INP) para a interação.

Ações, da mais impactante para a menos:

- **Virtualização** (TanStack Virtual, react-window): renderizar só as ~30 linhas visíveis em vez de 10 mil nós no DOM. Para logs isso costuma resolver 90% do problema.
- **Paginação ou streaming no servidor**: não trazer 10 mil linhas se o usuário vê 50.
- **Colocar o estado perto de quem usa**: um filtro no topo da página não deveria re-renderizar cada linha.
- \`useTransition\`/\`useDeferredValue\` para manter a digitação no filtro responsiva enquanto a lista recalcula.
- Mover parse pesado para um Web Worker.

\`React.memo\` evita re-render quando as props não mudam (comparação rasa). \`useMemo\`/\`useCallback\` só ajudam quando (1) o cálculo é realmente caro, ou (2) você precisa de **referência estável** para um filho memoizado ou para dependências de effect. Fora disso, adicionam custo e ruído. Com o React Compiler boa parte disso fica automática.`,
      en: `**Measure before optimizing.** React DevTools Profiler to see which components render and why; Chrome's Performance tab to see whether the cost is scripting, layout, or paint; Web Vitals (INP) for the interaction.

Actions, from highest to lowest impact:

- **Virtualization** (TanStack Virtual, react-window): render only the ~30 visible rows instead of 10,000 DOM nodes. For logs this usually solves 90% of the problem.
- **Server-side pagination or streaming**: do not fetch 10,000 rows when the user sees 50.
- **Colocate state**: a filter at the top of the page should not re-render every row.
- \`useTransition\`/\`useDeferredValue\` to keep typing in the filter responsive while the list recomputes.
- Move heavy parsing to a Web Worker.

\`React.memo\` skips re-rendering when props are unchanged (shallow comparison). \`useMemo\`/\`useCallback\` only help when (1) the computation is truly expensive, or (2) you need a **stable reference** for a memoized child or an effect dependency. Otherwise they add cost and noise. With the React Compiler much of this becomes automatic.`,
    },
    follow: [
      { pt: 'O que é INP e como ele substituiu o FID?', en: 'What is INP and how did it replace FID?' },
      { pt: 'Virtualização quebra acessibilidade ou o Ctrl+F do navegador? Como mitigar?', en: 'Does virtualization break accessibility or browser Ctrl+F? How do you mitigate it?' },
    ],
    flags: {
      pt: '"Coloco useMemo em tudo por garantia." Ou começar a otimizar sem medir.',
      en: '"I wrap everything in useMemo just in case." Or optimizing without measuring first.',
    },
    anchor: {
      pt: 'Em vagas de observabilidade (Kibana, Streams) esse é o cenário real: muito dado de log na tela. No Livit você mediu pressão de memória no macOS e ajustou quadros e efeitos: cite como prova de que você mede antes de otimizar.',
      en: 'In observability roles (Kibana, Streams) this is the real scenario: lots of log data on screen. In Livit you measured macOS memory pressure and adjusted frames and effects: cite it as proof you measure before optimizing.',
    },
  },
  {
    id: 'react-state-management',
    cat: 'react', type: 'architecture', jobs: ['sr-observability', 'sr-node-react', 'frontend'],
    tags: ['state management', 'Redux', 'Zustand', 'Context', 'server state', 'TanStack Query'],
    q: {
      pt: 'Context, Redux Toolkit, Zustand ou TanStack Query: como você decide onde vive cada tipo de estado numa aplicação grande?',
      en: 'Context, Redux Toolkit, Zustand, or TanStack Query: how do you decide where each kind of state lives in a large app?',
    },
    a: {
      pt: `Eu separo o estado por **natureza**, não por lib:

- **Server state** (dados que vêm da API): TanStack Query/SWR/Apollo. Ele precisa de cache, invalidação, revalidação e deduplicação, coisas que um store global não dá de graça. A maior parte do "estado global" de apps antigos com Redux era, na verdade, cache de servidor.
- **URL state** (filtros, página, aba): na query string. Fica compartilhável e sobrevive ao refresh.
- **Estado local de UI** (modal aberto, input): \`useState\` no componente.
- **Estado global de cliente** (tema, sessão, carrinho, editor complexo): Context para coisas que mudam pouco; Zustand ou Redux Toolkit quando muda com frequência ou tem lógica complexa, porque Context re-renderiza todos os consumidores a cada mudança.

Redux Toolkit se justifica com muitas atualizações cruzadas, necessidade de devtools/time-travel ou time grande que precisa de um padrão rígido. Zustand é menor e mais simples para o resto.`,
      en: `I split state by its **nature**, not by library:

- **Server state** (data from the API): TanStack Query/SWR/Apollo. It needs caching, invalidation, revalidation, and deduplication, which a global store does not give you for free. Most of the "global state" in older Redux apps was actually server cache.
- **URL state** (filters, page, tab): in the query string. It becomes shareable and survives refresh.
- **Local UI state** (open modal, input): \`useState\` in the component.
- **Global client state** (theme, session, cart, a complex editor): Context for things that rarely change; Zustand or Redux Toolkit when it changes often or has complex logic, because Context re-renders every consumer on each change.

Redux Toolkit pays off with many cross-cutting updates, a need for devtools/time travel, or a large team that needs a strict pattern. Zustand is smaller and simpler for the rest.`,
    },
    follow: [
      { pt: 'Como evitar que um Context re-renderize a árvore inteira?', en: 'How do you stop a Context from re-rendering the whole tree?' },
      { pt: 'Como você faria optimistic update com rollback?', en: 'How would you do an optimistic update with rollback?' },
    ],
    flags: {
      pt: 'Colocar resposta de API num store global e sincronizar à mão. Ou "uso Redux em todo projeto".',
      en: 'Putting API responses in a global store and syncing them by hand. Or "I use Redux on every project".',
    },
    anchor: {
      pt: 'No seu portfólio o idioma vive num composable (`useLanguage`) e no Bora o estado de presença vem do Realtime do Supabase: dois exemplos reais de "estado de cliente" vs "estado de servidor". Se usou Redux/Zustand no trabalho, diga onde; se não, diga que conhece os trade-offs e não invente.',
      en: 'In your portfolio, language lives in a composable (`useLanguage`) and in Bora presence comes from Supabase Realtime: two real examples of client state vs server state. If you used Redux/Zustand at work, say where; if not, say you know the trade-offs and do not invent experience.',
    },
  },
  {
    id: 'react-custom-hook',
    cat: 'react', type: 'code', jobs: ['frontend', 'sr-observability'],
    tags: ['custom hook', 'useSyncExternalStore', 'localStorage', 'hooks rules'],
    q: {
      pt: 'Escreva um hook `useLocalStorage` reutilizável e explique as regras dos hooks.',
      en: 'Write a reusable `useLocalStorage` hook and explain the rules of hooks.',
    },
    code: {
      src: `
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial; // modo privado, JSON corrompido, SSR
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* cota cheia ou storage bloqueado: segue só em memória */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// uso
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');`,
    },
    a: {
      pt: `Custom hook é só uma função que começa com \`use\` e chama outros hooks, para extrair **lógica com estado** reutilizável (não UI).

Detalhes que mostram senioridade no código acima: inicialização preguiçosa no \`useState\` (lê o storage uma vez só), \`try/catch\` porque o localStorage pode lançar exceção (modo privado, cota, SSR) e \`as const\` para tipar a tupla.

**Regras dos hooks:** só chamar no nível superior (nunca dentro de if, loop ou depois de return antecipado) e só dentro de componentes ou outros hooks. O motivo: o React identifica cada hook pela **ordem de chamada** em cada render; se a ordem muda, o estado vai para o hook errado.

Para sincronizar entre abas eu ouviria o evento \`storage\`, ou usaria \`useSyncExternalStore\`, que é a forma oficial de assinar fontes externas sem tearing no concurrent rendering.`,
      en: `A custom hook is just a function whose name starts with \`use\` and that calls other hooks, to extract reusable **stateful logic** (not UI).

Details that show seniority in the code above: lazy initialization in \`useState\` (reads storage only once), \`try/catch\` because localStorage can throw (private mode, quota, SSR), and \`as const\` to type the tuple.

**Rules of hooks:** only call them at the top level (never inside ifs, loops, or after an early return) and only from components or other hooks. The reason: React identifies each hook by its **call order** on every render; if the order changes, state goes to the wrong hook.

To sync across tabs I would listen to the \`storage\` event, or use \`useSyncExternalStore\`, the official way to subscribe to external sources without tearing under concurrent rendering.`,
    },
    follow: [
      { pt: 'Como você testaria esse hook?', en: 'How would you test this hook?' },
      { pt: 'O que acontece com esse hook num Server Component do Next.js?', en: 'What happens to this hook inside a Next.js Server Component?' },
    ],
    flags: {
      pt: 'Ler o localStorage no corpo do componente a cada render, ou ignorar que ele pode lançar exceção.',
      en: 'Reading localStorage in the component body on every render, or ignoring that it can throw.',
    },
    anchor: {
      pt: 'Este próprio DevTechnical guarda progresso e rascunhos no localStorage com try/catch. E o seu portfólio lembra a escolha de idioma: mesmo padrão, em Vue (composable ≈ custom hook).',
      en: 'This very DevTechnical app stores progress and drafts in localStorage with try/catch. Your portfolio also remembers the language choice: same pattern in Vue (a composable ≈ a custom hook).',
    },
  },
  {
    id: 'next-rendering-strategies',
    cat: 'react', type: 'architecture', jobs: ['sr-node-react', 'frontend'],
    tags: ['Next.js', 'SSR', 'SSG', 'ISR', 'RSC', 'Server Components', 'hydration'],
    q: {
      pt: 'CSR, SSR, SSG, ISR e React Server Components no Next.js: qual a diferença e como você escolhe para cada página?',
      en: 'CSR, SSR, SSG, ISR, and React Server Components in Next.js: what is the difference and how do you choose per page?',
    },
    a: {
      pt: `- **CSR**: o servidor manda um HTML vazio e o JS monta tudo no browser. Bom para áreas logadas muito interativas (dashboards); ruim para SEO e primeiro carregamento.
- **SSR**: HTML gerado a cada requisição. Dados sempre frescos e personalizados, mas custa servidor e TTFB.
- **SSG**: HTML gerado no build. Rapidíssimo via CDN, ideal para conteúdo que muda pouco (docs, landing).
- **ISR**: SSG que revalida em segundo plano por tempo ou sob demanda (\`revalidateTag\`). Bom para catálogo de produtos.
- **Server Components (App Router)**: componentes que rodam só no servidor, acessam dados direto e **não mandam JS** para o cliente. Componentes com interatividade são marcados com \`'use client'\`. Com streaming e \`Suspense\`, partes lentas carregam depois sem bloquear a página.

**Hydration** é o React "anexar" eventos ao HTML vindo do servidor; um erro de hydration acontece quando o HTML do servidor difere do primeiro render do cliente (ex.: usar \`Date.now()\` ou \`window\` no render).

Escolha: página pública e estável → SSG/ISR; personalizada por usuário → SSR/RSC dinâmico; app logado muito interativo → RSC no shell e client components nas partes interativas.`,
      en: `- **CSR**: the server sends empty HTML and JS builds everything in the browser. Good for highly interactive logged-in areas (dashboards); bad for SEO and first load.
- **SSR**: HTML generated per request. Always fresh and personalized data, but it costs server time and TTFB.
- **SSG**: HTML generated at build time. Extremely fast via CDN, ideal for content that rarely changes (docs, landing pages).
- **ISR**: SSG that revalidates in the background on a timer or on demand (\`revalidateTag\`). Good for product catalogs.
- **Server Components (App Router)**: components that run only on the server, fetch data directly, and **ship no JS** to the client. Interactive components are marked \`'use client'\`. With streaming and \`Suspense\`, slow parts load later without blocking the page.

**Hydration** is React attaching event handlers to server-rendered HTML; a hydration error happens when the server HTML differs from the client's first render (e.g. using \`Date.now()\` or \`window\` during render).

Choosing: public, stable page → SSG/ISR; per-user page → SSR/dynamic RSC; highly interactive logged-in app → RSC for the shell, client components for interactive parts.`,
    },
    follow: [
      { pt: 'O que são Server Actions e quais os riscos de segurança?', en: 'What are Server Actions and what are their security risks?' },
      { pt: 'Como funciona o cache do `fetch` no App Router e como você invalida?', en: 'How does `fetch` caching work in the App Router and how do you invalidate it?' },
    ],
    flags: {
      pt: 'Dizer que usou Next.js em produção se não usou. Vagas Node/React costumam pedir Next: honestidade + domínio do conceito vale mais que um "sim" que cai no segundo follow-up.',
      en: 'Claiming production Next.js if you have not used it. Node/React roles often ask for Next: honesty plus a solid grasp of the concepts beats a "yes" that collapses on the second follow-up.',
    },
    anchor: {
      pt: 'Seu portfólio e o DevTechnical são SPAs estáticas no GitHub Pages (equivalente a SSG sem framework). Laravel com Blade é SSR clássico, que você usa no trabalho. Diga: "Em produção trabalhei com SSR no Laravel e SPAs em React/Vue; estudei o App Router e entendo quando usar cada estratégia."',
      en: 'Your portfolio and DevTechnical are static SPAs on GitHub Pages (SSG-like, no framework). Laravel with Blade is classic SSR, which you use at work. Say: "In production I have worked with SSR in Laravel and SPAs in React/Vue; I have studied the App Router and understand when to use each strategy."',
    },
  },
  {
    id: 'react-accessibility',
    cat: 'react', type: 'concept', jobs: ['sr-observability', 'frontend'],
    tags: ['a11y', 'accessibility', 'WCAG', 'ARIA', 'keyboard', 'focus'],
    q: {
      pt: 'A vaga fala em componentes acessíveis. O que você verifica ao construir um dropdown ou modal acessível?',
      en: 'The role mentions accessible components. What do you check when building an accessible dropdown or modal?',
    },
    a: {
      pt: `Primeiro, **HTML semântico antes de ARIA**: \`<button>\` em vez de \`<div onClick>\`, \`<label>\` ligado ao input, \`<dialog>\` quando possível. A primeira regra do ARIA é não usar ARIA se um elemento nativo resolve.

Para um **modal**: foco vai para dentro ao abrir, fica preso dentro (focus trap), \`Esc\` fecha, foco volta para o botão que abriu, \`role="dialog"\` + \`aria-modal\` + \`aria-labelledby\`, e o conteúdo de fundo fica inerte (\`inert\`).

Para um **dropdown/combobox**: navegação por setas, Enter/Espaço selecionam, \`aria-expanded\`, \`aria-activedescendant\` ou foco gerenciado, e anúncio do item ativo para leitores de tela.

Além disso: contraste WCAG AA (4,5:1 para texto), foco visível, não depender só de cor, respeitar \`prefers-reduced-motion\`. Testo com teclado, com VoiceOver/NVDA e automatizo o básico com axe (jest-axe, Playwright + axe). Para componentes complexos, prefiro bases testadas como Radix, React Aria ou o EUI da própria Elastic, que segue essas práticas.`,
      en: `First, **semantic HTML before ARIA**: \`<button>\` instead of \`<div onClick>\`, a \`<label>\` tied to its input, \`<dialog>\` when possible. The first rule of ARIA is not to use ARIA when a native element does the job.

For a **modal**: focus moves inside on open, stays trapped inside (focus trap), \`Esc\` closes it, focus returns to the button that opened it, \`role="dialog"\` + \`aria-modal\` + \`aria-labelledby\`, and background content becomes inert (\`inert\`).

For a **dropdown/combobox**: arrow-key navigation, Enter/Space to select, \`aria-expanded\`, \`aria-activedescendant\` or managed focus, and announcing the active option to screen readers.

Plus: WCAG AA contrast (4.5:1 for text), visible focus, never relying on color alone, respecting \`prefers-reduced-motion\`. I test with the keyboard and VoiceOver/NVDA, and automate the basics with axe (jest-axe, Playwright + axe). For complex components I prefer battle-tested bases like Radix, React Aria, or Elastic's own EUI, which follows these practices.`,
    },
    follow: [
      { pt: 'Como você testaria acessibilidade num pipeline de CI?', en: 'How would you test accessibility in a CI pipeline?' },
      { pt: 'O que é uma região `aria-live` e quando usar?', en: 'What is an `aria-live` region and when do you use it?' },
    ],
    flags: {
      pt: '"Acessibilidade é colocar alt nas imagens." Ou nunca ter navegado no próprio produto só com teclado.',
      en: '"Accessibility means adding alt text to images." Or never having navigated your own product with only a keyboard.',
    },
    anchor: {
      pt: 'Seu portfólio tem link "pular para o conteúdo", rótulos de navegação e de idioma (`skip`, `navLabel`, `language` no copy.ts): mostre isso. O DevTechnical também usa `aria-pressed`, `aria-live` e foco visível.',
      en: 'Your portfolio has a "skip to content" link plus navigation and language labels (`skip`, `navLabel`, `language` in copy.ts): show it. DevTechnical also uses `aria-pressed`, `aria-live`, and visible focus.',
    },
  },
  {
    id: 'apollo-client-cache',
    cat: 'react', type: 'lib', jobs: ['sr-node-react'],
    tags: ['Apollo Client', 'normalized cache', 'fetchPolicy', 'optimistic response', 'cache update'],
    q: {
      pt: 'Como funciona o cache normalizado do Apollo Client? Depois de aprovar uma viagem, como a lista na tela se atualiza sem refetch?',
      en: "How does Apollo Client's normalized cache work? After approving a trip, how does the on-screen list update without a refetch?",
    },
    code: {
      src: `
const APPROVE = gql\`
  mutation Approve($id: ID!) {
    approveTrip(id: $id) {
      ... on ApproveTripSuccess { trip { id status } }   # id + campo alterado → cache se atualiza
      ... on BudgetExceeded { message remainingCents }
    }
  }\`;

const [approve] = useMutation(APPROVE, {
  optimisticResponse: ({ id }) => ({
    approveTrip: { __typename: 'ApproveTripSuccess', trip: { __typename: 'Trip', id, status: 'APPROVED' } },
  }),
  // a viagem precisa sair da lista "pendentes": isso o cache não adivinha
  update(cache, { data }) {
    const trip = data?.approveTrip?.trip;
    if (!trip) return;
    cache.modify({
      fields: {
        trips(existing, { readField }) {
          return { ...existing, edges: existing.edges.filter((e) => readField('id', e.node) !== trip.id) };
        },
      },
    });
  },
});

const { data } = useQuery(TRIPS, { variables: { status: 'PENDING' }, fetchPolicy: 'cache-and-network' });`,
    },
    a: {
      pt: `O Apollo **normaliza** a resposta: cada objeto vira uma entrada única no cache, identificada por \`__typename\` + \`id\` (ex.: \`Trip:42\`). Consultas guardam referências. Se uma mutation devolve \`Trip:42\` com \`status\` novo, **todas** as telas que mostram essa viagem re-renderizam sozinhas.

O que o cache **não** sabe: que um item deve entrar ou sair de uma **lista** (uma viagem aprovada deixa de ser pendente, um item criado deve aparecer). Para isso: \`update\` com \`cache.modify\`/\`writeQuery\`, \`refetchQueries\` (simples, mas faz requisição) ou \`typePolicies\` com \`merge\` para paginação.

- **optimisticResponse**: a UI muda na hora; se a mutation falhar, o Apollo desfaz.
- **fetchPolicy**: \`cache-first\` (padrão), \`cache-and-network\` (mostra o cache e revalida), \`network-only\`, \`no-cache\`.
- **typePolicies**: \`keyFields\` quando o id tem outro nome e \`merge\` para concatenar páginas de \`trips\`.

Comparando com TanStack Query: o Apollo atualiza por **entidade** automaticamente; o TanStack trabalha por **chave de consulta** e você invalida as chaves afetadas. O segundo é mais simples de raciocinar, o primeiro evita refetches.`,
      en: `Apollo **normalizes** responses: each object becomes a single cache entry identified by \`__typename\` + \`id\` (e.g. \`Trip:42\`). Queries store references. If a mutation returns \`Trip:42\` with a new \`status\`, **every** screen showing that trip re-renders on its own.

What the cache does **not** know: that an item should enter or leave a **list** (an approved trip is no longer pending, a created item should appear). For that: \`update\` with \`cache.modify\`/\`writeQuery\`, \`refetchQueries\` (simple, but makes a request), or \`typePolicies\` with \`merge\` for pagination.

- **optimisticResponse**: the UI changes immediately; if the mutation fails, Apollo rolls it back.
- **fetchPolicy**: \`cache-first\` (default), \`cache-and-network\` (show cache and revalidate), \`network-only\`, \`no-cache\`.
- **typePolicies**: \`keyFields\` when the id has another name, and \`merge\` to concatenate pages of \`trips\`.

Compared with TanStack Query: Apollo updates per **entity** automatically; TanStack works per **query key** and you invalidate the affected keys. The latter is simpler to reason about; the former avoids refetches.`,
    },
    follow: [
      { pt: 'O que acontece se a query não pedir o campo `id`?', en: 'What happens if the query does not request the `id` field?' },
      { pt: 'Como você tipa as queries do Apollo em TypeScript? (GraphQL Codegen)', en: 'How do you type Apollo queries in TypeScript? (GraphQL Codegen)' },
    ],
    flags: {
      pt: '"Dou refetch em tudo depois de cada mutation." Funciona, mas mostra que você não entende o cache.',
      en: '"I refetch everything after every mutation." It works, but shows you do not understand the cache.',
    },
    anchor: {
      pt: 'Apollo não está no seu CV. O raciocínio de "estado do servidor vs estado do cliente" e de UI que reflete o estado real você já aplica no GEMP e no Bora. Um front em React + Apollo consumindo uma API GraphQL própria fecharia essa lacuna para vagas que pedem GraphQL.',
      en: 'Apollo is not on your CV. You already apply the "server state vs client state" reasoning and a UI that reflects real state in GEMP and Bora. A React + Apollo frontend consuming your own GraphQL API would close this gap for roles that ask for GraphQL.',
    },
  },
  {
    id: 'next-server-actions-security',
    cat: 'react', type: 'code', jobs: ['sr-node-react', 'frontend'],
    tags: ['Next.js', 'Server Actions', 'revalidatePath', 'Zod', 'security', 'App Router'],
    q: {
      pt: 'Implemente uma Server Action no Next.js que aprova uma viagem. Quais os riscos de segurança que muita gente esquece?',
      en: 'Implement a Next.js Server Action that approves a trip. Which security risks do many people forget?',
    },
    code: {
      src: `
// app/trips/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const Input = z.object({ tripId: z.string().uuid() });

export async function approveTrip(_prev: unknown, formData: FormData) {
  const session = await auth();                       // 1. autenticação DENTRO da action
  if (!session) return { ok: false, error: 'UNAUTHENTICATED' };

  const parsed = Input.safeParse({ tripId: formData.get('tripId') }); // 2. validar: é endpoint público
  if (!parsed.success) return { ok: false, error: 'INVALID_INPUT' };

  const result = await approveTripUseCase(parsed.data.tripId, session.user); // 3. regra + autorização
  if (!result.ok) return result;

  revalidatePath('/trips');                           // 4. invalida o cache da página
  return { ok: true };
}

// app/trips/approve-button.tsx
'use client';
export function ApproveButton({ tripId }: { tripId: string }) {
  const [state, action, pending] = useActionState(approveTrip, null);
  return (
    <form action={action}>
      <input type="hidden" name="tripId" value={tripId} />
      <button disabled={pending}>{pending ? 'Approving…' : 'Approve'}</button>
      {state?.ok === false && <p role="alert">{state.error}</p>}
    </form>
  );
}`,
    },
    a: {
      pt: `Uma Server Action é uma função que roda no servidor, chamada de um formulário ou componente cliente. O Next gera um **endpoint POST público** para ela, e é daí que vêm os riscos:

- **Autenticação e autorização dentro da action**: estar numa página protegida não protege a action; qualquer um pode chamá-la direto com o ID dela.
- **Validar todo input** (Zod): o tipo TypeScript do parâmetro não existe em runtime.
- **Não confiar em campos ocultos** para permissão (\`userId\`, \`role\`, \`price\`): sempre derivar do servidor.
- **Não vazar dados**: o retorno é serializado para o cliente; não devolver objetos inteiros do banco.
- Rate limit em actions caras e cuidado com closures que capturam variáveis sensíveis (o Next criptografa, mas não é lugar para segredo).

O Next protege contra CSRF comparando \`Origin\` e \`Host\` e só aceita POST, mas configurações de proxy podem interferir.

Funcionalidades: \`useActionState\` dá estado e pending; o formulário funciona sem JS (progressive enhancement); \`revalidatePath\`/\`revalidateTag\` invalidam o cache após a mudança. Para APIs consumidas por outros clientes (mobile, parceiros), continuo preferindo um Route Handler ou API separada.`,
      en: `A Server Action is a function that runs on the server, called from a form or client component. Next generates a **public POST endpoint** for it, and that is where the risks come from:

- **Authentication and authorization inside the action**: sitting on a protected page does not protect the action; anyone can call it directly with its ID.
- **Validate every input** (Zod): the parameter's TypeScript type does not exist at runtime.
- **Never trust hidden fields** for permissions (\`userId\`, \`role\`, \`price\`): always derive them on the server.
- **Do not leak data**: the return value is serialized to the client; do not return whole database objects.
- Rate-limit expensive actions and beware closures that capture sensitive variables (Next encrypts them, but it is no place for secrets).

Next protects against CSRF by comparing \`Origin\` and \`Host\` and only accepting POST, but proxy setups can interfere.

Features: \`useActionState\` provides state and pending; the form works without JS (progressive enhancement); \`revalidatePath\`/\`revalidateTag\` invalidate the cache after the change. For APIs consumed by other clients (mobile, partners), I still prefer a Route Handler or a separate API.`,
    },
    follow: [
      { pt: 'Server Action ou Route Handler: quando cada um?', en: 'Server Action or Route Handler: when to use each?' },
      { pt: 'Como você faria optimistic UI com `useOptimistic`?', en: 'How would you do optimistic UI with `useOptimistic`?' },
    ],
    flags: {
      pt: '"A página já exige login, então a action está protegida." Esse é exatamente o erro.',
      en: '"The page already requires login, so the action is protected." That is exactly the mistake.',
    },
    anchor: {
      pt: 'Next.js é lacuna no CV. A regra "autorizar no servidor, a partir do usuário autenticado" você aplica no TripFlow (escopo por empresa) e no Bora (políticas no PostgreSQL). Use isso como prova do raciocínio, deixando claro que o Next em si você estudou.',
      en: 'Next.js is a gap on your CV. You apply the "authorize on the server from the authenticated user" rule in TripFlow (company scoping) and Bora (PostgreSQL policies). Use that as proof of reasoning, while being clear you have studied Next itself.',
    },
  },
  {
    id: 'mui-theming-performance',
    cat: 'react', type: 'lib', jobs: ['sr-node-react', 'frontend', 'cv'],
    tags: ['Material UI', 'MUI', 'theme', 'sx', 'styled', 'design system', 'bundle size'],
    q: {
      pt: 'A vaga pede Material (MUI). Como você estrutura o tema de uma aplicação grande e evita que o MUI pese ou fique lento?',
      en: 'The role asks for Material (MUI). How do you structure the theme of a large app and keep MUI from getting heavy or slow?',
    },
    code: {
      src: `
// theme.ts — uma fonte da verdade para cores, tipografia, espaçamento e variações
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette { brand: Palette['primary'] }
  interface PaletteOptions { brand?: PaletteOptions['primary'] }
}

export const theme = createTheme({
  cssVariables: true,                          // tema como CSS vars → dark mode sem re-render geral
  colorSchemes: { light: true, dark: true },
  palette: { brand: { main: '#b8620f' } },
  shape: { borderRadius: 10 },
  typography: { fontFamily: 'IBM Plex Sans, system-ui, sans-serif' },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
  },
});

// Componente do design system: encapsula o MUI, expõe uma API pequena
export const StatusChip = ({ status }: { status: TripStatus }) => (
  <Chip size="small" label={labels[status]} color={colorByStatus[status]} />
);

// imports por caminho ou named imports com tree-shaking
import Button from '@mui/material/Button';`,
    },
    a: {
      pt: `**Tema como design system**: \`createTheme\` centraliza paleta, tipografia, espaçamento, breakpoints e \`components\` (defaultProps e styleOverrides). Customizações recorrentes vão para o tema, não para \`sx\` espalhado. Estendo os tipos do tema com *module augmentation* para cores próprias continuarem tipadas. Com \`cssVariables\`, o dark mode troca variáveis CSS em vez de recalcular estilos.

**Camada própria por cima do MUI**: componentes como \`StatusChip\` e \`PageHeader\` encapsulam o MUI e expõem uma API pequena. Facilita consistência, troca de versão e testes.

**Estilo**: \`sx\` para ajustes pontuais; \`styled()\` para componentes reutilizados (o \`sx\` é recalculado a cada render, então evito objetos \`sx\` grandes em listas com milhares de itens).

**Performance e tamanho**: imports com tree-shaking, \`@mui/icons-material\` importando ícone a ícone (o barrel pode deixar o build de dev muito lento), DataGrid com virtualização para tabelas grandes, lazy loading de telas pesadas e medir com bundle analyzer. Em SSR (Next), configurar o cache do Emotion ou o pacote de integração com App Router para evitar flash de estilos.

**Acessibilidade**: o MUI segue WAI-ARIA, mas \`aria-label\` em IconButton, contraste do tema e foco visível continuam sendo responsabilidade de quem usa.`,
      en: `**Theme as a design system**: \`createTheme\` centralizes palette, typography, spacing, breakpoints, and \`components\` (defaultProps and styleOverrides). Recurring customizations go into the theme, not scattered \`sx\`. I extend theme types with *module augmentation* so custom colors stay typed. With \`cssVariables\`, dark mode swaps CSS variables instead of recomputing styles.

**Own layer on top of MUI**: components like \`StatusChip\` and \`PageHeader\` wrap MUI and expose a small API. That helps consistency, version upgrades, and testing.

**Styling**: \`sx\` for one-off tweaks; \`styled()\` for reused components (\`sx\` is recomputed on every render, so I avoid big \`sx\` objects in lists with thousands of items).

**Performance and size**: tree-shakable imports, \`@mui/icons-material\` imported icon by icon (the barrel can make dev builds very slow), DataGrid with virtualization for large tables, lazy-loaded heavy screens, and measuring with a bundle analyzer. With SSR (Next), configure the Emotion cache or the App Router integration package to avoid a flash of unstyled content.

**Accessibility**: MUI follows WAI-ARIA, but \`aria-label\` on IconButton, theme contrast, and visible focus remain the user's responsibility.`,
    },
    follow: [
      { pt: 'Como você migraria um projeto do MUI v4 (makeStyles/JSS) para a versão atual?', en: 'How would you migrate a project from MUI v4 (makeStyles/JSS) to the current version?' },
      { pt: 'MUI ou Tailwind + Radix? Quais os trade-offs?', en: 'MUI or Tailwind + Radix? What are the trade-offs?' },
    ],
    flags: {
      pt: 'Sobrescrever estilos com `!important` e classes globais em vez de usar o tema.',
      en: 'Overriding styles with `!important` and global classes instead of using the theme.',
    },
    anchor: {
      pt: 'Material-UI está no seu portfólio (Front-end: "Material-UI · Chart.js") e no perfil da Proxify, usado com React. Prepare um exemplo concreto de onde usou: que tela, que componentes, o que customizou no tema.',
      en: 'Material-UI is on your portfolio (Front end: "Material-UI · Chart.js") and your Proxify profile, used with React. Prepare a concrete example of where you used it: which screen, which components, what you customized in the theme.',
    },
  },
  {
    id: 'rtl-msw-component-test',
    cat: 'react', type: 'code', jobs: ['frontend', 'sr-observability', 'sr-node-react'],
    tags: ['React Testing Library', 'MSW', 'userEvent', 'Jest', 'Vitest', 'async testing'],
    q: {
      pt: 'Escreva o teste de um componente que lista ofertas da API e mostra erro quando a API falha. Por que testar pelo comportamento e não pela implementação?',
      en: 'Write a test for a component that lists offers from the API and shows an error when the API fails. Why test behavior and not implementation?',
    },
    code: {
      src: `
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/offers', () =>
    HttpResponse.json([{ id: 'a1', provider: 'Alpha', totalCents: 105000 }])),
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('shows offers ranked by total cost', async () => {
  render(<Offers amount={1000} />);
  expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
  expect(await screen.findByRole('listitem')).toHaveTextContent('Alpha');
});

test('shows a retryable error when the API fails', async () => {
  server.use(http.get('/api/offers', () => new HttpResponse(null, { status: 503 })));
  const user = userEvent.setup();
  render(<Offers amount={1000} />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/unavailable/i);

  server.resetHandlers();                                       // a API volta
  await user.click(screen.getByRole('button', { name: /try again/i }));
  expect(await screen.findByRole('listitem')).toBeInTheDocument();
});`,
    },
    a: {
      pt: `**Testar pelo comportamento**: o teste interage como o usuário (encontra por *role* e nome acessível, clica com \`userEvent\`) e verifica o que aparece na tela. Assim ele sobrevive a refatorações (trocar \`useState\` por TanStack Query não quebra nada) e ainda valida acessibilidade de graça: se não dá para achar o botão por \`getByRole('button', { name })\`, leitor de tela também não acha.

**MSW** intercepta na camada de rede: o componente usa o \`fetch\` real e o teste controla as respostas. É mais realista que mockar o módulo de API e o mesmo handler serve para Storybook e desenvolvimento. \`onUnhandledRequest: 'error'\` evita chamadas esquecidas.

**Assíncrono**: \`findBy*\` espera o elemento aparecer; \`waitFor\` para asserções que mudam com o tempo; nunca \`setTimeout\` no teste. Prioridade de queries: \`getByRole\` > \`getByLabelText\` > \`getByText\` > \`getByTestId\` (último recurso).

Cobrir: carregando, sucesso, vazio, erro e a ação de tentar de novo. Não testar detalhes como estado interno, nomes de classes CSS ou número de renders.`,
      en: `**Test behavior**: the test interacts like a user (finds elements by *role* and accessible name, clicks with \`userEvent\`) and checks what appears on screen. That survives refactors (swapping \`useState\` for TanStack Query breaks nothing) and validates accessibility for free: if you cannot find the button via \`getByRole('button', { name })\`, neither can a screen reader.

**MSW** intercepts at the network layer: the component uses the real \`fetch\` and the test controls responses. It is more realistic than mocking the API module, and the same handlers serve Storybook and local development. \`onUnhandledRequest: 'error'\` catches forgotten calls.

**Async**: \`findBy*\` waits for the element; \`waitFor\` for assertions that change over time; never \`setTimeout\` in a test. Query priority: \`getByRole\` > \`getByLabelText\` > \`getByText\` > \`getByTestId\` (last resort).

Cover: loading, success, empty, error, and the retry action. Do not test details like internal state, CSS class names, or render counts.`,
    },
    follow: [
      { pt: 'Qual a diferença entre `getBy`, `queryBy` e `findBy`?', en: 'What is the difference between `getBy`, `queryBy`, and `findBy`?' },
      { pt: 'Quando um teste de componente não basta e você vai para Playwright?', en: 'When is a component test not enough so you move to Playwright?' },
    ],
    flags: {
      pt: 'Testar `wrapper.state()` ou usar `data-testid` em tudo. Ou mockar o `useEffect`.',
      en: 'Testing `wrapper.state()` or putting `data-testid` on everything. Or mocking `useEffect`.',
    },
    anchor: {
      pt: 'Você usou Jest na Sicoob e Vitest + Vue Test Utils no portfólio, com a mesma filosofia (Testing Library existe para Vue também). Os estados testados aqui são os do GEMP (carregando, parcial, indisponível, falha de rede): adicionar esses testes ao GEMP vira evidência direta.',
      en: 'You used Jest at Sicoob and Vitest + Vue Test Utils in your portfolio, with the same philosophy (Testing Library exists for Vue too). The states tested here are GEMP\'s (loading, partial, unavailable, network failure): adding these tests to GEMP becomes direct evidence.',
    },
  },
  {
    id: 'react-hooks-catalog',
    cat: 'react', type: 'concept', jobs: ['frontend', 'sr-observability', 'sr-node-react'],
    tags: ['hooks', 'useState', 'useReducer', 'useRef', 'useLayoutEffect', 'useId', 'useTransition', 'use', 'useOptimistic'],
    q: {
      pt: 'Passe pelos hooks do React e diga quando você usa cada um: useState, useReducer, useRef, useEffect, useLayoutEffect, useMemo, useCallback, useContext, useId, useTransition, useDeferredValue e os do React 19.',
      en: 'Walk through React\'s hooks and say when you use each: useState, useReducer, useRef, useEffect, useLayoutEffect, useMemo, useCallback, useContext, useId, useTransition, useDeferredValue, and the React 19 ones.',
    },
    a: {
      pt: `**Estado**

- \`useState\`: valor local simples. Atualização com função (\`setX(x => x + 1)\`) quando depende do anterior.
- \`useReducer\`: quando a próxima transição depende de várias partes do estado ou há muitas ações (formulário complexo, máquina de estados). A lógica fica numa função pura, fácil de testar.
- \`useRef\`: valor mutável que **não dispara render** (id de timer, valor anterior, último callback) e referência a nó do DOM. Se a tela precisa mostrar o valor, é estado, não ref.
- \`useContext\`: lê um valor da árvore sem prop drilling. Todo consumidor re-renderiza quando o valor muda.

**Efeitos**

- \`useEffect\`: sincronizar com algo **fora do React** (assinatura, timer, API do browser, requisição) depois da pintura. Não serve para derivar estado nem para reagir a eventos do usuário (isso vai no handler).
- \`useLayoutEffect\`: igual, mas antes da pintura; para medir layout e evitar flicker (tooltip posicionado). Bloqueia a pintura, então com moderação.
- \`useSyncExternalStore\`: assinar stores externos (Redux, Zustand, \`matchMedia\`) sem tearing.

**Performance**

- \`useMemo\`/\`useCallback\`: cálculo caro ou referência estável para filho memoizado ou dependência de effect. O React Compiler automatiza boa parte.
- \`useTransition\`: marcar uma atualização como não urgente (\`startTransition\`) e ter \`isPending\`; a digitação continua fluida.
- \`useDeferredValue\`: versão "atrasada" de um valor que você não controla (prop de busca), para a lista pesada renderizar depois.

**Outros**: \`useId\` para ids estáveis entre servidor e cliente (\`htmlFor\`, \`aria-describedby\`); \`useImperativeHandle\` para expor métodos via ref (raro).

**React 19**: \`use()\` lê uma Promise ou Context (pode ser chamado condicionalmente; integra com Suspense); \`useActionState\` para estado de formulário/ação com pending; \`useFormStatus\` lê o status do form pai; \`useOptimistic\` mostra o resultado esperado enquanto a ação roda.`,
      en: `**State**

- \`useState\`: a simple local value. Use the updater form (\`setX(x => x + 1)\`) when it depends on the previous value.
- \`useReducer\`: when the next transition depends on several pieces of state or there are many actions (complex form, state machine). Logic lives in a pure function that is easy to test.
- \`useRef\`: a mutable value that **does not trigger renders** (timer id, previous value, latest callback) and a reference to a DOM node. If the screen must show it, it is state, not a ref.
- \`useContext\`: reads a value from the tree without prop drilling. Every consumer re-renders when the value changes.

**Effects**

- \`useEffect\`: synchronize with something **outside React** (subscription, timer, browser API, request) after paint. Not for deriving state or reacting to user events (those go in handlers).
- \`useLayoutEffect\`: same, but before paint; for measuring layout and avoiding flicker (a positioned tooltip). It blocks paint, so use sparingly.
- \`useSyncExternalStore\`: subscribe to external stores (Redux, Zustand, \`matchMedia\`) without tearing.

**Performance**

- \`useMemo\`/\`useCallback\`: an expensive calculation or a stable reference for a memoized child or effect dependency. The React Compiler automates much of this.
- \`useTransition\`: mark an update as non-urgent (\`startTransition\`) and get \`isPending\`; typing stays smooth.
- \`useDeferredValue\`: a "lagging" version of a value you do not control (a search prop), so the heavy list renders later.

**Others**: \`useId\` for ids stable across server and client (\`htmlFor\`, \`aria-describedby\`); \`useImperativeHandle\` to expose methods through a ref (rare).

**React 19**: \`use()\` reads a Promise or Context (may be called conditionally; works with Suspense); \`useActionState\` for form/action state with pending; \`useFormStatus\` reads the parent form's status; \`useOptimistic\` shows the expected result while the action runs.`,
    },
    follow: [
      { pt: 'Por que mudar um `useRef` não atualiza a tela? Quando isso é exatamente o que você quer?', en: 'Why does changing a `useRef` not update the screen? When is that exactly what you want?' },
      { pt: 'Qual a diferença prática entre `useTransition` e debounce?', en: 'What is the practical difference between `useTransition` and debouncing?' },
    ],
    flags: {
      pt: 'Usar `useEffect` para tudo, inclusive para copiar props em estado ou reagir a cliques. Ou guardar em `useRef` algo que precisa aparecer na tela.',
      en: 'Using `useEffect` for everything, including copying props into state or reacting to clicks. Or storing in `useRef` something that must appear on screen.',
    },
    anchor: {
      pt: 'Você usa React com TypeScript nas interfaces da Sicoob e do Grupo Mysa, e o equivalente em Vue (ref, computed, watch, composables) no portfólio. Mapear "useState ≈ ref, useMemo ≈ computed, useEffect ≈ watch" mostra domínio do modelo mental, não só da sintaxe.',
      en: 'You use React with TypeScript for interfaces at Sicoob and Grupo Mysa, and the Vue equivalent (ref, computed, watch, composables) in your portfolio. Mapping "useState ≈ ref, useMemo ≈ computed, useEffect ≈ watch" shows mastery of the mental model, not just syntax.',
    },
  },
  {
    id: 'react-usereducer-context',
    cat: 'react', type: 'code', jobs: ['frontend', 'sr-observability', 'sr-node-react'],
    tags: ['useReducer', 'Context', 'state machine', 're-render', 'split context', 'dispatch'],
    q: {
      pt: 'Implemente o estado de um carrinho com `useReducer` + Context de forma que um botão "adicionar" não re-renderize a lista inteira.',
      en: 'Implement cart state with `useReducer` + Context so that an "add" button does not re-render the whole list.',
    },
    code: {
      src: `
type Item = { id: string; name: string; priceCents: number; qty: number };
type State = { items: Item[] };
type Action =
  | { type: 'added'; item: Omit<Item, 'qty'> }
  | { type: 'removed'; id: string }
  | { type: 'qtyChanged'; id: string; qty: number };

export function cartReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'added': {
      const found = state.items.find((i) => i.id === action.item.id);
      return found
        ? { items: state.items.map((i) => (i.id === found.id ? { ...i, qty: i.qty + 1 } : i)) }
        : { items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case 'removed':
      return { items: state.items.filter((i) => i.id !== action.id) };
    case 'qtyChanged':
      return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i)) };
  }
}

// Dois contexts: quem só despacha não re-renderiza quando o estado muda
const CartState = createContext<State | null>(null);
const CartDispatch = createContext<Dispatch<Action> | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  return (
    <CartDispatch.Provider value={dispatch}>{/* dispatch é estável */}
      <CartState.Provider value={state}>{children}</CartState.Provider>
    </CartDispatch.Provider>
  );
}

export const useCartDispatch = () => {
  const d = useContext(CartDispatch);
  if (!d) throw new Error('useCartDispatch must be used inside CartProvider');
  return d;
};

// AddButton lê só o dispatch → não re-renderiza a cada mudança do carrinho
const AddButton = memo(({ product }: { product: Product }) => {
  const dispatch = useCartDispatch();
  return <button onClick={() => dispatch({ type: 'added', item: product })}>Add</button>;
});`,
    },
    a: {
      pt: `**Por que \`useReducer\`**: as transições do carrinho (adicionar existente, remover, mudar quantidade com mínimo 1) ficam numa **função pura** com ações nomeadas por evento. Ela é testável sem renderizar nada, e a union de \`Action\` faz o TypeScript checar cada caso.

**O problema do Context**: quando o \`value\` muda, **todo** consumidor re-renderiza, mesmo que só use uma parte. Soluções:

- **Separar estado e dispatch** em dois contexts: \`dispatch\` do \`useReducer\` tem identidade estável, então componentes que só disparam ações (botões) não re-renderizam. Com \`memo\`, o \`AddButton\` também ignora renders do pai.
- Não criar objetos novos no \`value\` a cada render (\`value={{ state, dispatch }}\` sem \`useMemo\` re-renderiza tudo sempre).
- Dividir contexts por domínio (carrinho ≠ usuário ≠ tema).
- Se ainda precisar de **seleção fina** ("re-renderize só se a quantidade deste item mudar"), Context não oferece seletores: aí entram Zustand, Redux Toolkit ou \`useSyncExternalStore\`.

Confiro o resultado no React DevTools com "Highlight updates" e no Profiler.`,
      en: `**Why \`useReducer\`**: the cart transitions (add existing, remove, change quantity with a minimum of 1) live in a **pure function** with event-named actions. It is testable without rendering anything, and the \`Action\` union lets TypeScript check every case.

**The Context problem**: when \`value\` changes, **every** consumer re-renders, even if it uses only part of it. Fixes:

- **Split state and dispatch** into two contexts: \`useReducer\`'s \`dispatch\` has a stable identity, so components that only dispatch (buttons) do not re-render. With \`memo\`, \`AddButton\` also ignores parent renders.
- Do not create new objects in \`value\` every render (\`value={{ state, dispatch }}\` without \`useMemo\` re-renders everything every time).
- Split contexts by domain (cart ≠ user ≠ theme).
- If you still need **fine-grained selection** ("re-render only if this item's quantity changes"), Context has no selectors: that is where Zustand, Redux Toolkit, or \`useSyncExternalStore\` come in.

I verify the result in React DevTools with "Highlight updates" and in the Profiler.`,
    },
    follow: [
      { pt: 'Como você testaria o `cartReducer`?', en: 'How would you test `cartReducer`?' },
      { pt: 'Onde ficaria a sincronização do carrinho com o servidor?', en: 'Where would cart syncing with the server live?' },
    ],
    flags: {
      pt: '`value={{ state, dispatch }}` criado a cada render. Ou um único Context gigante com o estado de toda a aplicação.',
      en: '`value={{ state, dispatch }}` created on every render. Or one giant Context holding the whole app\'s state.',
    },
    anchor: {
      pt: 'Carrinho é seu domínio: e-commerce nacional no Grupo Mysa. Se o front de lá usa algum padrão de estado (Context, Redux, Vuex/Pinia), descreva como é e o que melhoraria. Transições com estado mínimo validado também aparecem no TripFlow (máquina de estados da viagem).',
      en: 'A cart is your domain: nationwide e-commerce at Grupo Mysa. If the frontend there uses a state pattern (Context, Redux, Vuex/Pinia), describe it and what you would improve. Validated state transitions also show up in TripFlow (the trip state machine).',
    },
  },
  {
    id: 'react-redux-zustand-code',
    cat: 'react', type: 'code', jobs: ['sr-node-react', 'frontend', 'sr-observability'],
    tags: ['Redux Toolkit', 'createSlice', 'selectors', 'Zustand', 'RTK Query', 'immutability', 'Immer'],
    q: {
      pt: 'Mostre o mesmo estado de filtros implementado em Redux Toolkit e em Zustand. O que muda na prática e como cada um evita re-renders?',
      en: 'Show the same filter state implemented in Redux Toolkit and in Zustand. What changes in practice and how does each avoid re-renders?',
    },
    code: [
      {
        label: { pt: 'Redux Toolkit', en: 'Redux Toolkit' },
        src: `
const filtersSlice = createSlice({
  name: 'filters',
  initialState: { service: null as string | null, level: 'all' as Level, query: '' },
  reducers: {
    serviceSelected(state, action: PayloadAction<string | null>) {
      state.service = action.payload;      // parece mutação, mas o Immer gera um novo objeto
    },
    queryChanged(state, action: PayloadAction<string>) { state.query = action.payload; },
    reset: () => initialState,
  },
});
export const { serviceSelected, queryChanged, reset } = filtersSlice.actions;

export const store = configureStore({ reducer: { filters: filtersSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;

// seletor: o componente só re-renderiza se ESTE valor mudar (comparação por ===)
const selectService = (s: RootState) => s.filters.service;
const service = useSelector(selectService);
const dispatch = useDispatch();
dispatch(serviceSelected('trips-api'));

// derivação memoizada
const selectActiveFilterCount = createSelector([(s: RootState) => s.filters],
  (f) => [f.service, f.level !== 'all', f.query].filter(Boolean).length);`,
      },
      {
        label: { pt: 'Zustand', en: 'Zustand' },
        src: `
type FiltersStore = {
  service: string | null; level: Level; query: string;
  selectService: (s: string | null) => void;
  setQuery: (q: string) => void;
  reset: () => void;
};

export const useFilters = create<FiltersStore>()(devtools((set) => ({
  service: null, level: 'all', query: '',
  selectService: (service) => set({ service }),
  setQuery: (query) => set({ query }),
  reset: () => set({ service: null, level: 'all', query: '' }),
})));

// mesma ideia de seletor
const service = useFilters((s) => s.service);
const selectService = useFilters((s) => s.selectService);
// vários campos: useShallow evita re-render quando o objeto é novo mas os valores iguais
const { level, query } = useFilters(useShallow((s) => ({ level: s.level, query: s.query })));`,
      },
    ],
    a: {
      pt: `Os dois resolvem **estado global de cliente** com **seletores**: o componente assina só a fatia que lê e re-renderiza apenas quando ela muda (comparação por referência). Esse é o ganho sobre Context.

**Redux Toolkit**: fluxo explícito (ação → reducer puro → novo estado), \`createSlice\` com Immer (escrita "mutável" que gera estado imutável), \`createSelector\` para derivações memoizadas, middleware (thunks, listeners), **Redux DevTools** com histórico de ações e time-travel, e **RTK Query** para server state. Ótimo para times grandes e fluxos complexos que precisam de rastreabilidade. Custo: mais estrutura.

**Zustand**: um hook com estado e ações juntos, sem provider, quase sem boilerplate, e com middlewares (\`devtools\`, \`persist\`, \`immer\`). Ótimo para estado global de tamanho médio. Custo: menos convenção; o time precisa de disciplina para não virar um saco de setters.

Armadilhas comuns aos dois: seletor que retorna **objeto ou array novo** a cada chamada (re-render infinito ou constante; usar \`useShallow\` ou \`createSelector\`), guardar dado de servidor no store em vez de usar TanStack Query/RTK Query, e guardar estado derivado em vez de calcular.

Nos dois, filtros de uma tela de logs eu provavelmente colocaria na **URL**; o store faz sentido quando o estado é compartilhado por partes distantes e não precisa ser compartilhável por link.`,
      en: `Both solve **global client state** with **selectors**: a component subscribes only to the slice it reads and re-renders only when that slice changes (reference comparison). That is the win over Context.

**Redux Toolkit**: explicit flow (action → pure reducer → new state), \`createSlice\` with Immer ("mutable" writes that produce immutable state), \`createSelector\` for memoized derivations, middleware (thunks, listeners), **Redux DevTools** with action history and time travel, and **RTK Query** for server state. Great for large teams and complex flows that need traceability. Cost: more structure.

**Zustand**: one hook holding state and actions together, no provider, almost no boilerplate, with middlewares (\`devtools\`, \`persist\`, \`immer\`). Great for mid-sized global state. Cost: less convention; the team needs discipline so it does not become a bag of setters.

Pitfalls shared by both: a selector returning a **new object or array** on every call (constant or infinite re-renders; use \`useShallow\` or \`createSelector\`), storing server data in the store instead of TanStack Query/RTK Query, and storing derived state instead of computing it.

For a log screen's filters I would likely use the **URL** in either case; a store makes sense when state is shared by distant parts of the tree and does not need to be shareable by link.`,
    },
    follow: [
      { pt: 'Por que `useSelector(s => ({ a: s.a, b: s.b }))` causa re-render a cada ação?', en: 'Why does `useSelector(s => ({ a: s.a, b: s.b }))` re-render on every action?' },
      { pt: 'Como você testaria um slice do Redux e uma store do Zustand?', en: 'How would you test a Redux slice and a Zustand store?' },
    ],
    flags: {
      pt: 'Mutar o estado fora do Immer (`state.items.push` num reducer Redux "clássico") ou selecionar o store inteiro com `useFilters()` sem seletor.',
      en: 'Mutating state outside Immer (`state.items.push` in a "classic" Redux reducer) or selecting the whole store with `useFilters()` without a selector.',
    },
    anchor: {
      pt: 'Se você usou Redux, Vuex ou Pinia em algum projeto da Sicoob ou do Grupo Mysa, diga qual e para quê. Se não, a resposta honesta é: "uso estado local e de servidor bem separados; conheço Redux Toolkit e Zustand e escolho pelo tamanho do problema". Um exemplo pequeno no GitHub (filtros do PulseOps em Zustand, por exemplo) daria evidência.',
      en: 'If you used Redux, Vuex, or Pinia on any Sicoob or Grupo Mysa project, say which and for what. If not, the honest answer is: "I keep local and server state clearly separated; I know Redux Toolkit and Zustand and choose by the size of the problem". A small GitHub example (PulseOps filters in Zustand, say) would provide evidence.',
    },
  },
  {
    id: 'react-derived-state-antipatterns',
    cat: 'react', type: 'code', jobs: ['frontend', 'sr-observability', 'sr-node-react'],
    tags: ['derived state', 'lifting state', 'useEffect anti-pattern', 'single source of truth', 'controlled components'],
    q: {
      pt: 'O que há de errado neste componente? Explique estado derivado, "lifting state up" e por que copiar props em estado é um anti-padrão.',
      en: 'What is wrong with this component? Explain derived state, lifting state up, and why copying props into state is an anti-pattern.',
    },
    code: [
      {
        label: { pt: 'Código do recrutador', en: "Interviewer's code" },
        src: `
function TripList({ trips }: { trips: Trip[] }) {
  const [filter, setFilter] = useState('');
  const [visible, setVisible] = useState<Trip[]>(trips);  // cópia da prop
  const [total, setTotal] = useState(0);                  // valor derivado
  const [selected, setSelected] = useState<Trip | null>(null); // objeto inteiro

  useEffect(() => {
    setVisible(trips.filter((t) => t.title.includes(filter)));
  }, [trips, filter]);

  useEffect(() => {
    setTotal(visible.reduce((s, t) => s + t.costCents, 0));
  }, [visible]);
  // ...
}`,
      },
      {
        label: { pt: 'Versão corrigida', en: 'Fixed version' },
        src: `
function TripList({ trips }: { trips: Trip[] }) {
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null); // guarda o ID

  // derivado: calculado no render, sempre consistente
  const visible = useMemo(
    () => trips.filter((t) => t.title.toLowerCase().includes(filter.toLowerCase())),
    [trips, filter],
  );
  const totalCents = visible.reduce((s, t) => s + t.costCents, 0);
  const selected = trips.find((t) => t.id === selectedId) ?? null; // nunca fica desatualizado
  // ...
}`,
      },
    ],
    a: {
      pt: `**Regra**: se um valor pode ser **calculado** a partir de props ou de outro estado, ele não é estado. Calcule durante o render.

Problemas do original:

- \`visible\` e \`total\` são **derivados** guardados em estado e sincronizados com effects. Isso causa renders extras (render → effect → set → render de novo → outro effect), um frame mostrando dado velho e risco de dessincronizar se alguém esquecer uma dependência.
- \`selected\` guarda o **objeto**: se \`trips\` for atualizado (status mudou), o selecionado continua com a cópia antiga. Guarde o **ID** e derive o objeto.
- \`useState(trips)\` só usa a prop na **montagem**: se o pai mandar outra lista, o estado não acompanha. Copiar prop em estado só faz sentido para valor inicial explícito (\`initialValue\`), e, para reiniciar, use \`key\`.

\`useMemo\` entra só se o filtro for caro (milhares de itens); a soma é barata e fica direto no render.

**Lifting state up**: quando dois irmãos precisam do mesmo estado (o filtro na barra e a lista), o estado sobe para o **ancestral comum** e desce como props, mantendo uma única fonte da verdade. Se subir demais e causar prop drilling, aí sim Context, store ou URL.

Relacionado: **componente controlado** (o pai é dono do valor via \`value\` + \`onChange\`) vs **não controlado** (o DOM guarda o valor, lido por ref ou \`FormData\`). Escolha um por campo; misturar gera o aviso "changing an uncontrolled input to be controlled".`,
      en: `**Rule**: if a value can be **computed** from props or other state, it is not state. Compute it during render.

Problems in the original:

- \`visible\` and \`total\` are **derived** values stored in state and synced with effects. That causes extra renders (render → effect → set → render again → another effect), a frame showing stale data, and a risk of desync if someone forgets a dependency.
- \`selected\` stores the **object**: if \`trips\` updates (a status changed), the selection keeps the old copy. Store the **ID** and derive the object.
- \`useState(trips)\` only uses the prop on **mount**: if the parent sends another list, state does not follow. Copying a prop into state only makes sense for an explicit initial value (\`initialValue\`), and to reset it, use a \`key\`.

\`useMemo\` comes in only if the filter is expensive (thousands of items); the sum is cheap and stays inline in render.

**Lifting state up**: when two siblings need the same state (the filter in the toolbar and the list), the state moves to their **closest common ancestor** and flows down as props, keeping a single source of truth. If it climbs too far and causes prop drilling, then Context, a store, or the URL.

Related: a **controlled component** (the parent owns the value through \`value\` + \`onChange\`) vs **uncontrolled** (the DOM holds the value, read by ref or \`FormData\`). Pick one per field; mixing them triggers the "changing an uncontrolled input to be controlled" warning.`,
    },
    follow: [
      { pt: 'Como você reiniciaria o estado interno de um formulário quando o usuário selecionado muda?', en: 'How would you reset a form\'s internal state when the selected user changes?' },
      { pt: 'Quando você guardaria um valor derivado mesmo assim?', en: 'When would you store a derived value anyway?' },
    ],
    flags: {
      pt: '"Uso um useEffect para manter os dois estados em sincronia." Isso é a descrição do problema, não da solução.',
      en: '"I use a useEffect to keep both states in sync." That describes the problem, not the solution.',
    },
    anchor: {
      pt: 'No Bora você separou solicitação de atribuição e guardou referências, não cópias, para o solicitante e o trajeto não se perderem quando o motorista muda: é o mesmo princípio de "guardar o ID, derivar o resto", aplicado ao modelo de dados.',
      en: 'In Bora you separated requests from assignments and kept references, not copies, so the requester and route are never lost when the driver changes: the same "store the ID, derive the rest" principle, applied to the data model.',
    },
  },
  {
    id: 'react-devtools-debugging',
    cat: 'react', type: 'lib', jobs: ['frontend', 'sr-observability', 'sr-node-react'],
    tags: ['React DevTools', 'Profiler', 'flamegraph', 'highlight updates', 'why did this render', 'Redux DevTools', 'TanStack Query Devtools'],
    q: {
      pt: 'Um usuário diz que digitar no filtro da tela está travando. Mostre como você usa o React DevTools (Components e Profiler) para achar a causa.',
      en: 'A user says typing in the screen\'s filter feels laggy. Show how you use React DevTools (Components and Profiler) to find the cause.',
    },
    a: {
      pt: `**1. Reproduzir e medir.** Abro o **Profiler**, clico em gravar, digito algumas letras e paro. Nas configurações ativo **"Record why each component rendered while profiling"**.

**2. Ler a gravação.**

- Cada barra no topo é um **commit**; barras altas e amarelas são commits caros.
- **Flamegraph**: a árvore do commit, com largura pelo tempo de render; cinza significa que o componente não renderizou nesse commit.
- **Ranked**: os componentes mais lentos primeiro.
- Clicando num componente: tempo em cada commit e **por que renderizou** ("props changed: onSelect", "hook 2 changed", "parent rendered", "context changed").

**3. Diagnósticos típicos e correções.**

- Toda a lista renderiza a cada tecla porque o estado do filtro está no pai da lista → mover o estado para baixo, \`useDeferredValue\` na lista ou virtualizar.
- Linhas memoizadas renderizam com "props changed: onSelect" → a função é recriada a cada render; \`useCallback\` ou passar o id.
- "Context changed" em componentes que nem usam o valor alterado → dividir o Context ou usar store com seletor.
- Commit rápido no React, mas a tela ainda trava → o problema está fora do React: aba **Performance** do Chrome (long tasks, layout, parse pesado).

**Aba Components**: inspecionar e **editar** props, estado e hooks ao vivo (os hooks aparecem numerados e com nome para custom hooks), ver "rendered by" (quem renderizou o componente), ir para o código-fonte, e ativar **"Highlight updates when components render"** para ver em tempo real o que pisca a cada tecla. \`useDebugValue\` dá um rótulo legível a custom hooks.

Ferramentas complementares: **Redux DevTools** (ações, diff de estado, time-travel; funciona também com o middleware \`devtools\` do Zustand) e **TanStack Query Devtools** (cache, status de cada query, refetch). Em produção, o Profiler só funciona com o build de profiling; para medir usuários reais, Web Vitals (INP) e a API \`<Profiler onRender>\`.`,
      en: `**1. Reproduce and measure.** I open the **Profiler**, start recording, type a few letters, and stop. In settings I enable **"Record why each component rendered while profiling"**.

**2. Read the recording.**

- Each bar at the top is a **commit**; tall yellow bars are expensive commits.
- **Flamegraph**: the commit's tree, with width by render time; gray means the component did not render in that commit.
- **Ranked**: the slowest components first.
- Clicking a component: its time in each commit and **why it rendered** ("props changed: onSelect", "hook 2 changed", "parent rendered", "context changed").

**3. Typical diagnoses and fixes.**

- The whole list renders on every keystroke because the filter state lives in the list's parent → move state down, \`useDeferredValue\` on the list, or virtualize.
- Memoized rows render with "props changed: onSelect" → the function is recreated every render; \`useCallback\` or pass the id.
- "Context changed" on components that do not use the changed value → split the Context or use a store with selectors.
- React commits are fast but the screen still lags → the problem is outside React: Chrome's **Performance** tab (long tasks, layout, heavy parsing).

**Components tab**: inspect and **edit** props, state, and hooks live (hooks appear numbered, with names for custom hooks), see "rendered by" (who rendered the component), jump to source, and enable **"Highlight updates when components render"** to see in real time what flashes on each keystroke. \`useDebugValue\` gives custom hooks a readable label.

Complementary tools: **Redux DevTools** (actions, state diffs, time travel; also works with Zustand's \`devtools\` middleware) and **TanStack Query Devtools** (cache, each query's status, refetch). In production the Profiler only works with the profiling build; to measure real users, Web Vitals (INP) and the \`<Profiler onRender>\` API.`,
    },
    follow: [
      { pt: 'O Profiler mostra que o componente renderizou, mas a tela não mudou. Isso é um problema?', en: 'The Profiler shows a component rendered but the screen did not change. Is that a problem?' },
      { pt: 'Como você mediria isso com usuários reais em produção?', en: 'How would you measure this with real users in production?' },
    ],
    flags: {
      pt: 'Sair espalhando `memo`/`useMemo` sem abrir o Profiler. Ou só usar `console.log` dentro do componente para "contar renders".',
      en: 'Sprinkling `memo`/`useMemo` everywhere without opening the Profiler. Or only using `console.log` inside the component to "count renders".',
    },
    anchor: {
      pt: 'Seu hábito de medir antes de otimizar aparece no Livit (pressão de memória do macOS ajustando quadros e efeitos). Antes da entrevista, abra o front do GEMP (React) com o React DevTools e grave um Profiler de verdade: falar do que você viu na sua própria app convence mais que teoria. No portfólio (Vue), o Vue DevTools tem as abas equivalentes de componentes e performance.',
      en: 'Your habit of measuring before optimizing shows in Livit (macOS memory pressure adjusting frames and effects). Before the interview, open GEMP\'s React frontend with React DevTools and record a real Profiler session: describing what you saw in your own app convinces more than theory. For your Vue portfolio, Vue DevTools has equivalent component and performance tabs.',
    },
  },
];
