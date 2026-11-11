// LAB NODE 03: streams e backpressure
// Rode:  node labs/node/03-streams-backpressure.mjs            (ignora o backpressure)
//        node labs/node/03-streams-backpressure.mjs --pipeline (usa stream.pipeline)
//
// Gera 300 mil linhas de CSV para um destino LENTO (simula a rede de um cliente devagar).
// Sem respeitar o backpressure, tudo se acumula na memória. Com pipeline, o produtor espera.

import { Readable, Writable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const LINHAS = 300_000;
const usarPipeline = process.argv.includes('--pipeline');
let pico = 0;
const mb = () => { const v = process.memoryUsage().rss / 1024 / 1024; pico = Math.max(pico, v); return v.toFixed(0) + ' MB'; };

// Destino lento: a cada 50 pedaços, para 1 ms (como uma conexão ruim)
let recebidas = 0;
const destinoLento = new Writable({
  highWaterMark: 16 * 1024,          // "buffer" de 16 KB: passou disso, write() devolve false
  write(chunk, _enc, done) { recebidas++; if (recebidas % 50) done(); else setTimeout(done, 1); },
});

// Produtor: as linhas do "banco"
function* linhasDoBanco() {
  for (let i = 1; i <= LINHAS; i++) yield { id: i, titulo: `Viagem ${i}`, status: i % 3 ? 'APROVADA' : 'PENDENTE' };
}

const paraCsv = new Transform({
  objectMode: true,
  transform(l, _e, done) { done(null, `${l.id},${l.titulo},${l.status}\n`); },
});

const medidor = setInterval(() => console.log(`  memória: ${mb()}  | linhas já entregues ao destino: ${recebidas}`), 500);
console.log(`Modo: ${usarPipeline ? 'pipeline (respeita backpressure)' : 'write() ignorando o retorno'}\n  memória inicial: ${mb()}`);

if (usarPipeline) {
  await pipeline(Readable.from(linhasDoBanco()), paraCsv, destinoLento);
} else {
  let ignorados = 0;
  for (const l of linhasDoBanco()) {
    const ok = destinoLento.write(`${l.id},${l.titulo},${l.status}\n`); // devolve false = "espera!"
    if (!ok) ignorados++;                                                // ...mas a gente ignora
  }
  console.log(`  o produtor terminou na hora e ignorou ${ignorados} pedidos de "espera". Tudo está na memória agora.`);
  destinoLento.end();
  await new Promise((r) => destinoLento.on('finish', r));
}
clearInterval(medidor);
console.log(`\nFim. Pico de memória: ${pico.toFixed(0)} MB. Rode o outro modo e compare.`);
// EXPERIMENTE: aumente LINHAS para 1_000_000 sem --pipeline (cuidado com a memória!).
