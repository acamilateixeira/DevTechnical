// LAB NODE 01: a ordem do event loop no Node.js
// Rode: node labs/node/01-event-loop-node.cjs
//
// O Node tem duas filas "VIP" que rodam antes de qualquer timer:
//   1. process.nextTick  (a mais prioritária de todas)
//   2. microtasks de Promise (then, await, queueMicrotask)
// Depois vêm as FASES do event loop: timers (setTimeout) → poll (I/O) → check (setImmediate).
//
// (Este arquivo é .cjs de propósito. Em módulos ES (.mjs / "type": "module"), o código do
// topo já roda DENTRO de uma microtask, então as Promises passam na frente do nextTick.
// Rode a versão ESM no fim para ver a diferença: é uma ótima curiosidade de entrevista.)

const { readFile } = require('node:fs');

const t0 = performance.now();
const log = (fase, msg) => console.log(`${(performance.now() - t0).toFixed(1).padStart(6)}ms  ${fase.padEnd(22)} ${msg}`);

log('síncrono', '1. começo');
setTimeout(() => log('timers', '6. setTimeout 0'), 0);
setImmediate(() => log('check', '7. setImmediate'));
Promise.resolve().then(() => log('microtask (Promise)', '4. Promise.then'));
process.nextTick(() => log('nextTick', '3. process.nextTick'));
queueMicrotask(() => log('microtask (Promise)', '5. queueMicrotask'));

// Dentro de um callback de I/O, setImmediate SEMPRE vem antes do setTimeout:
// depois da fase "poll" (I/O) a próxima fase é "check" (setImmediate).
readFile(__filename, () => {
  log('poll (I/O)', '8. leu o arquivo');
  setTimeout(() => log('timers', '10. setTimeout dentro do I/O'), 0);
  setImmediate(() => log('check', '9. setImmediate dentro do I/O'));
});

log('síncrono', '2. fim do script');

// No topo do script, a ordem entre "6. setTimeout 0" e "7. setImmediate" pode variar entre
// execuções (depende de quanto o processo levou para iniciar). Dentro do I/O (8 → 9 → 10),
// a ordem é sempre a mesma.
//
// EXPERIMENTE:
//  - Dentro do nextTick, agende outro nextTick. Ele roda antes da Promise? (sim)
//  - Rode 5 vezes e veja se 6 e 7 trocam de lugar.
//  - Copie este arquivo para teste.mjs, troque o require por import e rode: o 3 vai para depois do 5.
