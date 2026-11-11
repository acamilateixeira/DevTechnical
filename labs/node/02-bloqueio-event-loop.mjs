// LAB NODE 02: travando o event loop (e destravando com worker_threads)
// Rode:  node labs/node/02-bloqueio-event-loop.mjs
//        node labs/node/02-bloqueio-event-loop.mjs --worker
//
// Sobe um servidor HTTP com duas rotas:
//   GET /rapido  → responde na hora
//   GET /pesado  → faz ~1,5 s de cálculo (CPU-bound)
// Depois, o próprio script chama /pesado e, ao mesmo tempo, dispara /rapido a cada 100 ms.
// Sem worker: o /rapido fica preso esperando o cálculo. Com --worker: continua rápido.

import http from 'node:http';
import { fork } from 'node:child_process';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { monitorEventLoopDelay } from 'node:perf_hooks';

// O servidor roda num PROCESSO separado do cliente de teste. Se fossem o mesmo processo,
// o cliente também ficaria travado e a medição seria enganosa.

function calculoPesado(ms = 1500) {
  const fim = Date.now() + ms;
  let x = 0;
  while (Date.now() < fim) x += Math.sqrt(x + 1); // ocupa a CPU sem parar
  return x;
}

const usarWorker = process.argv.includes('--worker');

if (!isMainThread) {
  // ---- dentro do worker (outra thread do processo do servidor)
  parentPort.on('message', () => parentPort.postMessage(calculoPesado()));
} else if (process.argv.includes('--servidor')) {
  // ---- processo do SERVIDOR
  const worker = usarWorker ? new Worker(new URL(import.meta.url), { argv: ['--worker'] }) : null;
  const noWorker = () => new Promise((resolve) => { worker.once('message', resolve); worker.postMessage('go'); });
  const atraso = monitorEventLoopDelay({ resolution: 10 });
  atraso.enable();

  const server = http.createServer(async (req, res) => {
    if (req.url === '/pesado') {
      const r = usarWorker ? await noWorker() : calculoPesado();
      return res.end(`pesado ok ${r.toFixed(0)}\n`);
    }
    if (req.url === '/atraso') return res.end(String(Math.round(atraso.max / 1e6)));
    res.end('rapido ok\n');
  });
  server.listen(0, () => process.send({ port: server.address().port }));
  process.on('message', (m) => { if (m === 'sair') { worker?.terminate(); server.close(); process.exit(0); } });
} else {
  // ---- processo do CLIENTE de teste
  const servidor = fork(new URL(import.meta.url), ['--servidor', ...(usarWorker ? ['--worker'] : [])]);
  const { port } = await new Promise((r) => servidor.once('message', r));
  const url = (p) => `http://localhost:${port}${p}`;
  console.log(`Modo: ${usarWorker ? 'COM worker_threads' : 'SEM worker (cálculo no event loop)'}\n`);

  const t0 = Date.now();
  const pesado = fetch(url('/pesado')).then(() => console.log(`  /pesado terminou em ${Date.now() - t0}ms`));

  const tempos = [];
  const rapidos = [];
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 100));
    const ini = Date.now();
    rapidos.push(fetch(url('/rapido')).then(() => tempos.push(Date.now() - ini)));
  }
  await Promise.all([pesado, ...rapidos]);
  const atrasoMax = await (await fetch(url('/atraso'))).text();

  console.log(`  /rapido (10 chamadas durante o cálculo): ${tempos.map((t) => t + 'ms').join(', ')}`);
  console.log(`  pior /rapido: ${Math.max(...tempos)}ms`);
  console.log(`  atraso máximo do event loop no servidor: ${atrasoMax}ms`);
  console.log(usarWorker
    ? '\n→ O cálculo rodou em outra thread; o event loop ficou livre para responder.'
    : '\n→ Enquanto o cálculo roda, NADA mais é atendido: o /rapido fica esperando. Rode de novo com --worker.');
  servidor.send('sair');
}
