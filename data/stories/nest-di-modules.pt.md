**`ApproveTripUseCase`**: "Pra trabalhar eu preciso de um repositório de viagens e de um barramento de eventos."

**Jeito antigo** (criando tudo sozinho): "`new TypeOrmTripRepository(new Connection(...))`… e no teste? Vou ter que subir um banco de verdade? 😩"

**Container de injeção de dependência do Nest** 🤵: "Deixa comigo. Você só **declara no construtor** do que precisa. Eu monto e te entrego pronto."

**Módulo**: "E eu digo pro container: quando alguém pedir `TripRepository`, entrega o `TypeOrmTripRepository`."

**Teste** 🧪: "E quando EU estiver rodando, entrega um repositório falso em memória, por favor."

**Container**: "Feito. O caso de uso nem percebe a troca." 😉

**Requisição HTTP** passando pelo Nest: "Middleware 👋 → Guard (pode entrar?) 🛂 → Interceptor ⏱️ → Pipe (dados válidos?) 🧪 → Controller → Interceptor de novo → se der erro, Exception Filter 🧯."

**Laravel** (do outro lado da rua): "Ué, eu faço igualzinho: service container, middleware, Form Request, policies." 😏

**🧠 Moral da história para entrevista**

"No Nest eu declaro dependências no construtor e o container de IoC monta e injeta; módulos dizem qual implementação entregar. Isso facilita trocar implementação no teste (Dependency Inversion). O ciclo é middleware → guard → interceptor → pipe → handler → filter, e mapeia quase um para um no Laravel."
