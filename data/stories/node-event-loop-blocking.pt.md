**Node** (garçom único do restaurante) 🧑‍🍳: "Sou um só, mas dou conta de mil mesas: anoto o pedido, entrego pra cozinha (o sistema operacional / libuv) e vou atender a próxima mesa enquanto cozinham."

**Mesa 1**: "Quero um dado do banco." → **Node**: "Pedido feito, já volto!" 🏃

**Mesa 2**: "Quero um arquivo." → **Node**: "Pedido feito, já volto!" 🏃

**Mesa 3** (CPU-bound): "Quero que VOCÊ calcule 10 milhões de contas, aqui na minha frente."

**Node**: "…tá bom." 🧮🧮🧮 *(parado na mesa 3 por 1,5 s)*

**Mesas 4 a 1000**: "GARÇOM?! GARÇOM?! 😤 Era só um copo d'água!" **← event loop bloqueado**

**Worker thread** 👷: "Me passa essa conta pesada. Eu calculo na outra sala e te aviso quando terminar."

**Node**: "Valeu! Voltei a atender todo mundo." 😌

**🧠 Moral da história para entrevista**

"O JavaScript roda numa thread só, mas I/O é delegado à libuv e ao sistema operacional, por isso o Node aguenta milhares de conexões. Cálculo pesado (CPU-bound) trava o event loop inteiro: tiro da requisição com `worker_threads`, fila + worker, ou mais processos. Veja o lab Node 02 rodando."
