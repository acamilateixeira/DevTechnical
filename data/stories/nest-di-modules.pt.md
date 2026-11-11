# 🤵 O mordomo que entrega tudo pronto

> Um caso de uso chegou pra trabalhar e precisa de ferramentas. Ele pode montar tudo sozinho… ou chamar o mordomo.

## 🎭 Elenco
- 🧑‍💼 **Caso de uso** · `ApproveTripUseCase` · a regra: aprovar uma viagem
- 🗃️ **Repositório** · interface `TripRepository` · "alguém que guarda viagens", sem dizer qual banco
- 🐘 **Repositório de verdade** · `TypeOrmTripRepository` · a implementação que fala com o banco
- 🧸 **Repositório de brinquedo** · `InMemoryTripRepository` · a implementação falsa, em memória, para teste
- 🤵 **Mordomo** · o container de injeção de dependência do Nest · monta as dependências e entrega prontas
- 📒 **Lista do mordomo** · `@Module({ providers: [...] })` · diz qual implementação entregar pra cada pedido
- 🧪 **Teste** · `Test.createTestingModule()` · pede pro mordomo trocar a peça de verdade pela de brinquedo

## 🎬 Cena 1 · Fazendo tudo sozinho
**Caso de uso**: "Preciso de um repositório. Vou criar: `new TypeOrmTripRepository(new Connection(...))`…"
**Teste**: "E pra me rodar? Vou ter que subir um banco de verdade, com Docker e tudo?" 😩
**Caso de uso**: "…é."
**Teste**: "Fui."
= 🧑‍💼 Quem cria o repositório: o próprio caso de uso (`new`)
= 🧪 Para testar: precisa de banco de verdade ❌

## 🎬 Cena 2 · Chama o mordomo
**Mordomo**: "Patrão, você só diz no construtor DO QUE precisa. Eu monto e te entrego prontinho." 🤵
**Lista do mordomo**: "Quando alguém pedir `TripRepository`, entrega o Repositório de verdade."
**Caso de uso**: "Que vida boa. Nem sei de onde veio, só uso."
= 📒 Provider registrado: `TRIP_REPOSITORY` → `TypeOrmTripRepository`
= 🤵 Quem cria: o container do Nest
= 🧑‍💼 O caso de uso conhece: só a interface `TripRepository`

## 🎬 Cena 3 · Dia de teste
**Teste**: "Mordomo, hoje entrega o Repositório de brinquedo, por favor."
**Mordomo**: "Pois não." _(troca a peça)_
**Caso de uso**: "Ué, mudou alguma coisa? Nem percebi." 😉
**Teste**: "Rodei em 3 milissegundos, sem banco. Tô chique."
= 🧸 Provider no teste: `InMemoryTripRepository` (via `overrideProvider`)
= 🧑‍💼 Código do caso de uso: não mudou
= ⏱️ Tempo do teste: ~3ms, sem banco ✅

## 💻 Traduzindo pro código
```ts
@Injectable()
export class ApproveTripUseCase {
  constructor(@Inject(TRIP_REPOSITORY) private readonly trips: TripRepository) {} // pede, não cria
}

@Module({
  providers: [ApproveTripUseCase, { provide: TRIP_REPOSITORY, useClass: TypeOrmTripRepository }], // 📒
})
export class TripsModule {}

const mod = await Test.createTestingModule({ providers: [ApproveTripUseCase] }) // 🧪
  .overrideProvider(TRIP_REPOSITORY).useValue(new InMemoryTripRepository())     // 🧸
  .compile();
```

| Etapa de uma requisição no Nest | Para que serve |
| --- | --- |
| Middleware | Logs, correlação, CORS |
| Guard | Pode entrar? (autenticação e permissão) |
| Interceptor | Antes e depois do handler (tempo, cache, formato) |
| Pipe | Valida e transforma os dados |
| Controller → caso de uso | A regra |
| Exception filter | Transforma erro em resposta HTTP |

No Laravel é quase igual: service container, middleware, Form Request e policies.

## 🎤 Pra entrevista
"No Nest eu declaro as dependências no construtor e o container de IoC monta e injeta; os módulos dizem qual implementação entregar para cada token. Isso é Dependency Inversion: o caso de uso depende de uma interface, então no teste troco por uma implementação em memória. O ciclo da requisição é middleware, guard, interceptor, pipe, handler e exception filter."
