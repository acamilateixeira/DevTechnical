// EVENT LOOP: em que ordem as coisas rodam?
// Cada console.log aparece na linha do tempo na coluna da FASE em que rodou:
//   Síncrono   → o código "normal", de cima para baixo
//   Microtasks → .then(), queueMicrotask() e o que vem depois de um await
//   Macrotasks → setTimeout / setInterval

console.log('A: começo do script');

setTimeout(() => console.log('B: setTimeout 0ms'), 0);

Promise.resolve().then(() => console.log('C: Promise.then'));

queueMicrotask(() => console.log('D: queueMicrotask'));

(async () => {
  console.log('E: dentro da função async, antes do await');
  await null;
  console.log('F: depois do await (virou microtask)');
})();

console.log('G: fim do script');

// Resultado esperado: A E G | C D F | B
// Regra: termina TODO o síncrono → esvazia TODAS as microtasks → só então 1 macrotask.
