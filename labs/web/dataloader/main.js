// GRAPHQL N+1 e DATALOADER
// Query do cliente:  { trips { id titulo requester { nome } } }
// O resolver de "requester" roda UMA VEZ POR VIAGEM. Sem DataLoader: 1 + 50 queries.
// Mude USAR_DATALOADER para true e compare o contador.

const USAR_DATALOADER = false;

// ---- Mini DataLoader: junta todos os load(id) do mesmo instante numa query só ----
function criarDataLoader(buscarVarios) {
  let fila = [];                                   // [{ id, resolve }]
  const cache = new Map();                         // memoiza por requisição
  return {
    load(id) {
      if (cache.has(id)) return cache.get(id);
      const p = new Promise((resolve) => {
        fila.push({ id, resolve });
        if (fila.length === 1) {
          // agenda o "lote" para depois que TODOS os resolvers deste tick rodarem (microtask!)
          queueMicrotask(async () => {
            const lote = fila; fila = [];
            const ids = [...new Set(lote.map((x) => x.id))];
            const linhas = await buscarVarios(ids);
            const porId = new Map(linhas.map((l) => [l.id, l]));
            lote.forEach((x) => x.resolve(porId.get(x.id) ?? null)); // mesma ordem dos pedidos
          });
        }
      });
      cache.set(id, p);
      return p;
    },
  };
}

// ---- Resolvers (como no Apollo Server) ----
function criarContexto() {   // um contexto (e um loader) POR REQUISIÇÃO
  return {
    usuarioPorId: criarDataLoader((ids) =>
      sql.query(`SELECT * FROM users WHERE id IN (${ids.join(', ')})`, () => usuarios.filter((u) => ids.includes(u.id)))),
  };
}

const resolvers = {
  Query: {
    trips: () => sql.query('SELECT * FROM trips LIMIT 50', () => viagens),
  },
  Trip: {
    requester: (trip, ctx) => USAR_DATALOADER
      ? ctx.usuarioPorId.load(trip.requesterId)
      : sql.query(`SELECT * FROM users WHERE id = '${trip.requesterId}'`, () => usuarios.find((u) => u.id === trip.requesterId)),
  },
};

// ---- Um "executor GraphQL" simplificado ----
export async function run() {
  const ctx = criarContexto();
  const t0 = performance.now();
  const trips = await resolvers.Query.trips();
  const resposta = await Promise.all(trips.map(async (t) => ({
    id: t.id, titulo: t.titulo, requester: { nome: (await resolvers.Trip.requester(t, ctx)).nome },
  })));
  stat('Tempo (ms)', Math.round(performance.now() - t0));
  stat('Viagens na resposta', resposta.length);
  log('Primeiros itens da resposta:', JSON.stringify(resposta.slice(0, 2)));
}
