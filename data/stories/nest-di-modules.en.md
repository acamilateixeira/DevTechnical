**`ApproveTripUseCase`**: "To work I need a trip repository and an event bus."

**The old way** (creating everything yourself): "`new TypeOrmTripRepository(new Connection(...))`… and in tests? Do I have to start a real database? 😩"

**Nest's dependency injection container** 🤵: "Leave it to me. You just **declare in the constructor** what you need. I build it and hand it over ready."

**Module**: "And I tell the container: when someone asks for `TripRepository`, give them `TypeOrmTripRepository`."

**Test** 🧪: "And when I'M running, give them an in-memory fake repository, please."

**Container**: "Done. The use case doesn't even notice the swap." 😉

**HTTP request** going through Nest: "Middleware 👋 → Guard (may I enter?) 🛂 → Interceptor ⏱️ → Pipe (valid data?) 🧪 → Controller → Interceptor again → if it fails, Exception Filter 🧯."

**Laravel** (across the street): "Huh, I do exactly the same: service container, middleware, Form Request, policies." 😏

**🧠 Interview takeaway**

"In Nest I declare dependencies in the constructor and the IoC container builds and injects them; modules say which implementation to provide. That makes swapping implementations in tests easy (Dependency Inversion). The lifecycle is middleware → guard → interceptor → pipe → handler → filter, and maps almost one-to-one to Laravel."
