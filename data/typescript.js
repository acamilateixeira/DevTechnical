export default [
  {
    id: 'js-event-loop',
    cat: 'typescript', type: 'code', jobs: ['elastic', 'brainrocket', 'frontend'],
    tags: ['event loop', 'microtask', 'macrotask', 'promise', 'setTimeout'],
    q: {
      pt: 'Qual a ordem de saída deste código e por quê? Explique microtasks e macrotasks.',
      en: 'What does this code print, in what order, and why? Explain microtasks vs macrotasks.',
    },
    code: {
      label: { pt: 'O recrutador cola isso no chat:', en: 'The interviewer pastes this in the chat:' },
      src: `
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
queueMicrotask(() => console.log('D'));
(async () => {
  console.log('E');
  await null;
  console.log('F');
})();
console.log('G');
// Saída / Output: A E G C D F B`,
    },
    a: {
      pt: `Saída: **A E G C D F B**.

- O código síncrono roda primeiro na call stack: \`A\`, depois \`E\` (o corpo de uma função async roda síncrono até o primeiro \`await\`), depois \`G\`.
- Quando a stack esvazia, o event loop drena **toda** a fila de microtasks antes de pegar a próxima macrotask. Microtasks: callbacks de Promise (\`then\`), \`queueMicrotask\` e a continuação após \`await\`. Elas entram na ordem em que foram agendadas: \`C\`, \`D\`, \`F\`.
- Só então roda a macrotask do \`setTimeout\` (\`B\`). \`setTimeout(fn, 0)\` significa "no mínimo 0 ms", nunca "agora".

Consequência prática: um loop que agenda microtasks infinitamente trava a renderização do browser, porque o render só acontece entre macrotasks.`,
      en: `Output: **A E G C D F B**.

- Synchronous code runs first on the call stack: \`A\`, then \`E\` (an async function body runs synchronously until its first \`await\`), then \`G\`.
- Once the stack is empty, the event loop drains the **entire** microtask queue before taking the next macrotask. Microtasks are Promise callbacks (\`then\`), \`queueMicrotask\`, and the continuation after \`await\`. They run in scheduling order: \`C\`, \`D\`, \`F\`.
- Only then does the \`setTimeout\` macrotask run (\`B\`). \`setTimeout(fn, 0)\` means "at least 0 ms", never "now".

Practical consequence: code that keeps scheduling microtasks forever starves rendering, because the browser only paints between macrotasks.`,
    },
    follow: [
      { pt: 'E no Node.js, onde entra `process.nextTick` e `setImmediate` nessa ordem?', en: 'And in Node.js, where do `process.nextTick` and `setImmediate` fit in that order?' },
      { pt: 'Como você quebraria um processamento pesado de 200 ms para não travar a UI?', en: 'How would you split a 200 ms CPU-heavy task so it does not freeze the UI?' },
    ],
    flags: {
      pt: 'Dizer que `setTimeout(..., 0)` executa "imediatamente" ou que JavaScript é "multithread". Também é ruim acertar a saída sem conseguir explicar a regra das duas filas.',
      en: 'Saying `setTimeout(..., 0)` runs "immediately" or that JavaScript is "multithreaded". Getting the output right without explaining the two-queue rule also looks weak.',
    },
    anchor: {
      pt: 'No Livit Live Controller você reduziu a frequência de polling do painel em segundo plano e ajustou quadros conforme a pressão de memória: é o mesmo raciocínio de não monopolizar o loop. Para dividir trabalho pesado: `requestIdleCallback`, fatiar com `setTimeout`/`scheduler.yield()` ou mover para um Web Worker.',
      en: 'In Livit Live Controller you reduced background polling and adapted frame rate to memory pressure: same reasoning about not hogging the loop. To split heavy work: `requestIdleCallback`, chunk with `setTimeout`/`scheduler.yield()`, or move it to a Web Worker.',
    },
  },
  {
    id: 'ts-unknown-any-never',
    cat: 'typescript', type: 'concept', jobs: ['elastic', 'brainrocket', 'frontend'],
    tags: ['any', 'unknown', 'never', 'type safety', 'narrowing'],
    q: {
      pt: 'Qual a diferença entre `any`, `unknown` e `never`? Quando cada um aparece num código sênior?',
      en: 'What is the difference between `any`, `unknown` and `never`? When does each belong in senior-level code?',
    },
    a: {
      pt: `- \`any\` desliga o type checker: aceita tudo e pode ser usado como qualquer coisa. Ele "contamina" o que toca. Num código sênior quase só aparece em fronteiras com libs mal tipadas, isolado e comentado.
- \`unknown\` é o top type seguro: aceita qualquer valor, mas você **não pode usar** sem antes estreitar o tipo (typeof, instanceof, type guard ou validação com Zod). É o tipo certo para \`JSON.parse\`, \`catch (e)\` e dados de rede.
- \`never\` é o bottom type: nenhum valor cabe nele. Aparece em funções que nunca retornam (throw, loop infinito) e, principalmente, em **checagem de exaustividade** de unions discriminadas: se alguém adicionar um novo caso, o build quebra.`,
      en: `- \`any\` switches the type checker off: it accepts anything and can be used as anything. It "infects" whatever it touches. In senior code it mostly shows up at the boundary with badly typed libraries, isolated and commented.
- \`unknown\` is the safe top type: it accepts any value, but you **cannot use** it until you narrow it (typeof, instanceof, a type guard, or validation with Zod). It is the right type for \`JSON.parse\`, \`catch (e)\`, and network data.
- \`never\` is the bottom type: no value fits. It shows up in functions that never return (throw, infinite loop) and, most importantly, in **exhaustiveness checks** on discriminated unions: if someone adds a new case, the build fails.`,
    },
    code: {
      src: `
type Status =
  | { kind: 'loading' }
  | { kind: 'partial'; offers: Offer[]; failed: string[] }
  | { kind: 'ok'; offers: Offer[] }
  | { kind: 'error'; message: string };

function label(s: Status): string {
  switch (s.kind) {
    case 'loading': return 'Loading…';
    case 'partial': return \`\${s.offers.length} offers, \${s.failed.join(', ')} failed\`;
    case 'ok': return \`\${s.offers.length} offers\`;
    case 'error': return s.message;
    default: {
      const exhaustive: never = s; // novo "kind" sem tratamento = erro de compilação
      return exhaustive;
    }
  }
}

function parse(raw: string): Offer[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('invalid payload');
  return data.map(toOffer); // toOffer valida cada item
}`,
    },
    follow: [
      { pt: 'Por que o tipo de `e` em `catch (e)` é `unknown` com `useUnknownInCatchVariables`?', en: 'Why is `e` in `catch (e)` typed `unknown` under `useUnknownInCatchVariables`?' },
      { pt: 'Tipos do TypeScript existem em runtime? Como você valida o body de uma API então?', en: 'Do TypeScript types exist at runtime? How do you validate an API body then?' },
    ],
    flags: {
      pt: '"Uso `any` quando o tipo fica complicado." Ou achar que tipar o retorno de um `fetch` como `User` garante que os dados são um `User`: o TS não valida nada em runtime.',
      en: '"I use `any` when the type gets complicated." Or believing that typing a `fetch` result as `User` guarantees the data is a `User`: TS validates nothing at runtime.',
    },
    anchor: {
      pt: 'O GEMP diferencia espera, resposta parcial, indisponibilidade e falha de rede no front em React/TS: isso é exatamente uma union discriminada com checagem de exaustividade. Use como exemplo concreto.',
      en: 'GEMP distinguishes loading, partial results, unavailability, and network failure in the React/TS UI: that is exactly a discriminated union with an exhaustiveness check. Use it as your concrete example.',
    },
  },
  {
    id: 'ts-generics-utility',
    cat: 'typescript', type: 'code', jobs: ['elastic', 'brainrocket', 'frontend'],
    tags: ['generics', 'utility types', 'Partial', 'Pick', 'keyof', 'mapped types'],
    q: {
      pt: 'Escreva uma função genérica `groupBy` tipada e explique `keyof`, mapped types e os utility types que você mais usa.',
      en: 'Write a typed generic `groupBy` and explain `keyof`, mapped types, and the utility types you use most.',
    },
    code: {
      src: `
function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T) => K,
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

const byStatus = groupBy(trips, (t) => t.status); // Record<TripStatus, Trip[]>

// Mapped type: torna todas as props opcionais e só-leitura
type DraftOf<T> = { readonly [P in keyof T]?: T[P] };

// Utility types do dia a dia
type CreateTripDTO = Omit<Trip, 'id' | 'createdAt'>;
type TripPatch = Partial<Pick<Trip, 'title' | 'budgetCents'>>;
type Handler = Parameters<typeof onSubmit>[0];
type Saved = Awaited<ReturnType<typeof saveTrip>>;`,
    },
    a: {
      pt: `Generics permitem escrever código reutilizável sem perder a informação de tipo: o \`T\` é inferido no ponto de uso. A restrição \`K extends PropertyKey\` garante que a chave serve como índice de objeto.

- \`keyof T\` produz a union das chaves de \`T\`.
- Mapped types (\`{ [P in keyof T]: ... }\`) transformam cada propriedade; é assim que \`Partial\`, \`Readonly\` e \`Record\` são implementados.
- Os que mais uso: \`Pick\`/\`Omit\` para DTOs, \`Partial\` para PATCH, \`Record\` para dicionários, \`ReturnType\`/\`Parameters\`/\`Awaited\` para derivar tipos de funções sem duplicar, e \`satisfies\` para checar um objeto contra um tipo sem perder a inferência literal.

O princípio sênior: **derive tipos de uma fonte única** (schema, função ou constante) em vez de duplicá-los à mão.`,
      en: `Generics let you write reusable code without losing type information: \`T\` is inferred at the call site. The \`K extends PropertyKey\` constraint guarantees the key can index an object.

- \`keyof T\` yields the union of \`T\`'s keys.
- Mapped types (\`{ [P in keyof T]: ... }\`) transform each property; that is how \`Partial\`, \`Readonly\`, and \`Record\` are implemented.
- The ones I use most: \`Pick\`/\`Omit\` for DTOs, \`Partial\` for PATCH, \`Record\` for dictionaries, \`ReturnType\`/\`Parameters\`/\`Awaited\` to derive types from functions instead of duplicating them, and \`satisfies\` to check an object against a type without losing literal inference.

The senior principle: **derive types from a single source of truth** (a schema, function, or constant) instead of duplicating them by hand.`,
    },
    follow: [
      { pt: 'Qual a diferença entre `interface` e `type`? Quando você escolhe cada um?', en: 'What is the difference between `interface` and `type`? When do you pick each?' },
      { pt: 'O que é um conditional type com `infer`? Dê um exemplo.', en: 'What is a conditional type with `infer`? Give an example.' },
    ],
    flags: {
      pt: 'Escrever `function groupBy(items: any[], key: string): any`. Ou responder "nunca precisei de generics, uso as libs".',
      en: 'Writing `function groupBy(items: any[], key: string): any`. Or answering "I never needed generics, I just use libraries".',
    },
    anchor: {
      pt: 'Seu portfólio (camilat) tem `types.ts` com tipos bilíngues `{ pt, en }` reaproveitados em experiência e projetos. É um exemplo honesto de modelar uma vez e reusar.',
      en: 'Your portfolio (camilat) has a `types.ts` with bilingual `{ pt, en }` types reused across experience and projects. It is an honest example of modeling once and reusing.',
    },
  },
  {
    id: 'js-closures-this',
    cat: 'typescript', type: 'code', jobs: ['frontend', 'brainrocket'],
    tags: ['closure', 'this', 'arrow function', 'debounce', 'stale closure'],
    q: {
      pt: 'O que é closure? Implemente um `debounce` e explique o bug clássico de "stale closure" no React.',
      en: 'What is a closure? Implement `debounce` and explain the classic "stale closure" bug in React.',
    },
    code: {
      src: `
function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined; // vive na closure
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Stale closure no React
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);      // ❌ "count" foi capturado como 0 para sempre
      // setCount(c => c + 1);  // ✅ updater funcional lê o valor atual
    }, 1000);
    return () => clearInterval(id);
  }, []); // dependências vazias congelam a closure
  return <span>{count}</span>;
}`,
    },
    a: {
      pt: `Closure é a função "lembrar" das variáveis do escopo onde foi criada, mesmo depois que esse escopo terminou. No \`debounce\`, \`timer\` fica privado dentro da closure e é compartilhado entre chamadas.

**Stale closure** no React: cada render cria novas funções que capturam os valores *daquele* render. Se um effect com \`[]\` cria um intervalo, o callback fica preso ao \`count\` do primeiro render. Soluções: updater funcional (\`setCount(c => c + 1)\`), declarar as dependências corretamente, ou guardar o valor mais recente num \`useRef\`.

Sobre \`this\`: funções normais definem \`this\` por **como são chamadas**; arrow functions herdam o \`this\` léxico. Por isso arrow functions resolvem o problema de callbacks perdendo o contexto.`,
      en: `A closure is a function "remembering" the variables of the scope where it was created, even after that scope has finished. In \`debounce\`, \`timer\` stays private inside the closure and is shared across calls.

**Stale closure** in React: each render creates new functions that capture the values of *that* render. If an effect with \`[]\` sets an interval, the callback is stuck with the first render's \`count\`. Fixes: a functional updater (\`setCount(c => c + 1)\`), declaring dependencies correctly, or keeping the latest value in a \`useRef\`.

About \`this\`: regular functions bind \`this\` by **how they are called**; arrow functions inherit lexical \`this\`. That is why arrow functions fix callbacks losing their context.`,
    },
    follow: [
      { pt: 'Qual a diferença entre debounce e throttle? Onde você usaria cada um?', en: 'What is the difference between debounce and throttle? Where would you use each?' },
      { pt: 'Closures podem causar vazamento de memória? Como?', en: 'Can closures cause memory leaks? How?' },
    ],
    flags: {
      pt: 'Desligar a regra `react-hooks/exhaustive-deps` "porque ela reclama demais". Isso é exatamente o que gera stale closures.',
      en: 'Disabling the `react-hooks/exhaustive-deps` rule "because it complains too much". That is exactly what produces stale closures.',
    },
    anchor: {
      pt: 'Busca com debounce é um caso comum em telas de ERP/e-commerce como as do Grupo Mysa. Se você usou, cite a tela e o motivo (reduzir chamadas à API). Se não lembrar de um caso específico, explique o conceito sem inventar.',
      en: 'Debounced search is common in ERP/e-commerce screens like the ones at Grupo Mysa. If you used it, name the screen and the reason (fewer API calls). If you cannot recall a specific case, explain the concept without inventing one.',
    },
  },
];
