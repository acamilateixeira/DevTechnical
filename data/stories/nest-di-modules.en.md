# 🤵 The butler who hands everything over ready

> A use case showed up for work and needs tools. It can build everything itself… or call the butler.

## 🎭 Cast
- 🧑‍💼 **Use case** · `ApproveTripUseCase` · the rule: approve a trip
- 🗃️ **Repository** · `TripRepository` interface · "someone who stores trips", without saying which database
- 🐘 **Real repository** · `TypeOrmTripRepository` · the implementation that talks to the database
- 🧸 **Toy repository** · `InMemoryTripRepository` · the fake, in-memory implementation for tests
- 🤵 **Butler** · Nest's dependency injection container · builds the dependencies and hands them over ready
- 📒 **Butler's list** · `@Module({ providers: [...] })` · says which implementation to deliver for each request
- 🧪 **Test** · `Test.createTestingModule()` · asks the butler to swap the real piece for the toy one

## 🎬 Scene 1 · Doing it all alone
**Use case**: "I need a repository. I'll create it: `new TypeOrmTripRepository(new Connection(...))`…"
**Test**: "And to run me? I'll have to spin up a real database, with Docker and everything?" 😩
**Use case**: "…yes."
**Test**: "I'm out."
= 🧑‍💼 Who creates the repository: the use case itself (`new`)
= 🧪 To test: needs a real database ❌

## 🎬 Scene 2 · Call the butler
**Butler**: "Sir, just say in the constructor WHAT you need. I'll build it and hand it over ready." 🤵
**Butler's list**: "When someone asks for `TripRepository`, deliver the real repository."
**Use case**: "What a life. I don't even know where it came from, I just use it."
= 📒 Registered provider: `TRIP_REPOSITORY` → `TypeOrmTripRepository`
= 🤵 Who creates it: Nest's container
= 🧑‍💼 The use case knows: only the `TripRepository` interface

## 🎬 Scene 3 · Test day
**Test**: "Butler, today please deliver the toy repository."
**Butler**: "Certainly." _(swaps the piece)_
**Use case**: "Huh, did something change? Didn't notice." 😉
**Test**: "I ran in 3 milliseconds, no database. Fancy."
= 🧸 Provider in the test: `InMemoryTripRepository` (via `overrideProvider`)
= 🧑‍💼 Use case code: unchanged
= ⏱️ Test time: ~3ms, no database ✅

## 💻 Translating to code
```ts
@Injectable()
export class ApproveTripUseCase {
  constructor(@Inject(TRIP_REPOSITORY) private readonly trips: TripRepository) {} // asks, doesn't create
}

@Module({
  providers: [ApproveTripUseCase, { provide: TRIP_REPOSITORY, useClass: TypeOrmTripRepository }], // 📒
})
export class TripsModule {}

const mod = await Test.createTestingModule({ providers: [ApproveTripUseCase] }) // 🧪
  .overrideProvider(TRIP_REPOSITORY).useValue(new InMemoryTripRepository())     // 🧸
  .compile();
```

| Step of a Nest request | What it's for |
| --- | --- |
| Middleware | Logs, correlation, CORS |
| Guard | Can you come in? (authentication and permission) |
| Interceptor | Before and after the handler (timing, cache, format) |
| Pipe | Validates and transforms data |
| Controller → use case | The rule |
| Exception filter | Turns errors into HTTP responses |

Laravel is almost the same: service container, middleware, Form Requests, and policies.

## 🎤 For the interview
"In Nest I declare dependencies in the constructor and the IoC container builds and injects them; modules say which implementation to deliver for each token. That's Dependency Inversion: the use case depends on an interface, so in tests I swap in an in-memory implementation. The request cycle is middleware, guard, interceptor, pipe, handler, and exception filter."
