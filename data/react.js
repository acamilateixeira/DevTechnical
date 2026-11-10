export default [
  {
    id: 'react-reconciliation-keys',
    cat: 'react', type: 'concept', jobs: ['elastic', 'brainrocket', 'frontend'],
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
    cat: 'react', type: 'code', jobs: ['elastic', 'brainrocket', 'frontend'],
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
    cat: 'react', type: 'concept', jobs: ['elastic', 'frontend', 'brainrocket'],
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
      pt: 'Para a Elastic (Kibana, Streams) esse é o cenário real: muito dado de log na tela. No Livit você mediu pressão de memória no macOS e ajustou quadros e efeitos: cite como prova de que você mede antes de otimizar.',
      en: 'For Elastic (Kibana, Streams) this is the real scenario: lots of log data on screen. In Livit you measured macOS memory pressure and adjusted frames and effects: cite it as proof you measure before optimizing.',
    },
  },
  {
    id: 'react-state-management',
    cat: 'react', type: 'architecture', jobs: ['elastic', 'brainrocket', 'frontend'],
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
    cat: 'react', type: 'code', jobs: ['frontend', 'elastic'],
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
    cat: 'react', type: 'architecture', jobs: ['brainrocket', 'frontend'],
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
      pt: 'Dizer que usou Next.js em produção se não usou. A BrainRocket pede Next explicitamente: honestidade + domínio do conceito vale mais que um "sim" que cai no segundo follow-up.',
      en: 'Claiming production Next.js if you have not used it. BrainRocket asks for Next explicitly: honesty plus a solid grasp of the concepts beats a "yes" that collapses on the second follow-up.',
    },
    anchor: {
      pt: 'Seu portfólio e o DevTechnical são SPAs estáticas no GitHub Pages (equivalente a SSG sem framework). Laravel com Blade é SSR clássico, que você usa no trabalho. Diga: "Em produção trabalhei com SSR no Laravel e SPAs em React/Vue; estudei o App Router e entendo quando usar cada estratégia."',
      en: 'Your portfolio and DevTechnical are static SPAs on GitHub Pages (SSG-like, no framework). Laravel with Blade is classic SSR, which you use at work. Say: "In production I have worked with SSR in Laravel and SPAs in React/Vue; I have studied the App Router and understand when to use each strategy."',
    },
  },
  {
    id: 'react-accessibility',
    cat: 'react', type: 'concept', jobs: ['elastic', 'frontend'],
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
];
