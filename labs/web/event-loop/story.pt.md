# 🎉 A balada do Event Loop

> Uma balada com duas filas: a fila VIP e a fila normal. O Event Loop é o segurança da porta e decide quem fala quando.

## 🎭 Elenco
- 🗣️ **A** · `console.log('A')` · código normal: fala na hora, de cima pra baixo
- ⏰ **B** · `setTimeout(..., 0)` · timer: "0ms" não é agora, é "quando chegar a vez" (fila normal, a macrotask)
- 🤞 **C** · `Promise.then()` · o que roda quando uma promessa é cumprida (fila VIP, a microtask)
- 🎫 **D** · `queueMicrotask()` · entra direto na fila VIP, sem precisar de promessa
- 🏃‍♀️ **E** · `async function` · função assíncrona: começa a rodar na hora, até o primeiro `await`
- ✋ **`await null`** · `await` · pausa SÓ a função dela e manda o resto pra fila VIP
- 😭 **F** · `console.log` depois do `await` · o resto da função E, que foi parar na fila VIP
- 😎 **G** · `console.log('G')` · código normal, a última linha do script
- 🕴️ **Event Loop** · event loop · o segurança: termina o normal, esvazia a fila VIP, depois chama 1 da fila normal
- 💎 **Microtask** · microtask · quem está na fila VIP
- 🎟️ **Macrotask** · macrotask · quem está na fila normal

## 🎬 Cena 1 · O código síncrono, de cima pra baixo
**A**: "CHEGUEI! Sou o primeiro da fila mesmo! VOU FALAR AGORA!"
= 📤 Saída (console): A
= ▶️ Rodando agora: código síncrono (linha do A)
= 💎 Fila VIP (microtasks): (vazia)
= 🎟️ Fila normal (macrotasks): (vazia)
= ⏸️ Pausado: nada
= ⏳ Falta: as linhas B, C, D, E e G do script
**B**: "EU TAMBÉM QUERO FALAR! DAQUI A 0ms!"
**Event Loop**: "CALMA, APRESSADO! 0ms não significa agora! Vai esperar sua vez na fila dos timers!"
= 📤 Saída (console): A
= ▶️ Rodando agora: código síncrono (linha do B: só agenda o timer)
= 💎 Fila VIP (microtasks): (vazia)
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: nada
= ⏳ Falta: as linhas C, D, E e G
**C**: "MINHA PROMISE JÁ FOI RESOLVIDA! Eu prometi uma parada e agora quero executar meu `.then()`!"
**Event Loop**: "Beleza! Entra na fila VIP das microtasks!"
= 📤 Saída (console): A
= ▶️ Rodando agora: código síncrono (linha do C: só agenda o `.then`)
= 💎 Fila VIP (microtasks): C
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: nada
= ⏳ Falta: as linhas D, E e G
**D**: "EU TAMBÉM QUERO ENTRAR NA FILA VIP!"
**Event Loop** _(desconfiado)_: "Mas cadê sua Promise?"
**D**: "NÃO TENHO PROMISE NENHUMA! 😂 Eu posso entrar diretamente na fila das microtasks!"
= 📤 Saída (console): A
= ▶️ Rodando agora: código síncrono (linha do D)
= 💎 Fila VIP (microtasks): C, D
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: nada
= ⏳ Falta: as linhas E e G
**E**: "SOU ASSÍNCRONA, MAS FUI CHAMADA AGORA! NÃO VOU ESPERAR NINGUÉM! VOU COMEÇAR A FALAR!"
= 📤 Saída (console): A E
= ▶️ Rodando agora: a função E, até o primeiro `await`
= 💎 Fila VIP (microtasks): C, D
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: nada
= ⏳ Falta: o `await null` e a linha G
**`await null`**: "ESPERAAAA, APRESSADA! ✋ Você já falou o que tinha antes de mim! Agora pausa essa função! O restante vai para a fila VIP das microtasks!"
**F**: "UAI, MAS EU NEM FALEI AINDA! 😭"
**`await null`**: "POIS VAI ESPERAR! C e D chegaram primeiro na fila VIP!"
= 📤 Saída (console): A E
= ▶️ Rodando agora: o `await` pausou a função E e o script continua
= 💎 Fila VIP (microtasks): C, D, F (o resto da função E)
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: a função E, no `await`
= ⏳ Falta: a linha G
**G**: "Enquanto essa galera tá nessa confusão, EU VOU FAZER O MEU! Não dependo de ninguém!"
= 📤 Saída (console): A E G
= ▶️ Rodando agora: fim do script
= 💎 Fila VIP (microtasks): C, D, F
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: a função E, no `await`
= ⏳ Falta: esvaziar a fila VIP inteira, depois chamar a fila normal
> 🚨 ACABOU O CÓDIGO SÍNCRONO! A FILA VIP FOI LIBERADA!

## 🎬 Cena 2 · A fila VIP (microtasks)
**C**: "EU ENTREI PRIMEIRO! MINHA VEZ!"
= 📤 Saída (console): A E G C
= ▶️ Rodando agora: microtask C
= 💎 Fila VIP (microtasks): D, F
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: a função E, no `await`
= ⏳ Falta: D e F na fila VIP, depois B
**D**: "EU SOU O SEGUNDO! NEM PRECISEI DE PROMISE!"
= 📤 Saída (console): A E G C D
= ▶️ Rodando agora: microtask D
= 💎 Fila VIP (microtasks): F
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: a função E, no `await`
= ⏳ Falta: F na fila VIP, depois B
**F**: "FINALMENTE! O `await` me segurou, mas agora posso falar!"
= 📤 Saída (console): A E G C D F
= ▶️ Rodando agora: microtask F: a função E volta do `await` e termina
= 💎 Fila VIP (microtasks): (vazia)
= 🎟️ Fila normal (macrotasks): B
= ⏸️ Pausado: nada
= ⏳ Falta: a fila normal: B
> ⏰ FILA VIP VAZIA! AGORA É A VEZ DOS TIMERS!

## 🎬 Cena 3 · A fila normal (macrotasks)
**B**: "E EU, GENTE?! 😭 ERA PRA SER 0ms!"
**Event Loop**: "AGORA É SUA VEZ! Mas não se empolga! Se você criar microtasks, elas vão ser executadas antes do próximo timer!"
**B**: "FINALMENTE! 😂"
= 📤 Saída (console): A E G C D F B
= ▶️ Rodando agora: macrotask B (o timer)
= 💎 Fila VIP (microtasks): (vazia)
= 🎟️ Fila normal (macrotasks): (vazia)
= ⏸️ Pausado: nada
= ⏳ Falta: nada: o programa terminou

## 🧠 Moral da história
**A**: "Nós, os síncronos (A, E e G): estamos aqui! Vamos trabalhar primeiro!"
**Microtask**: "Estamos na fila VIP! Quando os síncronos terminarem, É NOSSA VEZ!"
**B**: "Nós, os timers: SOBROU PRA GENTE ESPERAR! 😭"
**Event Loop**: "EU ORGANIZO ESSA BAGUNÇA! Primeiro termina o código síncrono, depois esvazio a fila das microtasks. Aí executo a próxima macrotask e verifico as microtasks de novo. E ASSIM CONTINUA!"
**`await null`**: "EU NÃO PARO O PROGRAMA INTEIRO, NÃO! Só pauso a minha função. O RESTO QUE SE VIRE!" 😂

## 💻 Traduzindo pro código
```js
console.log('A');                                       // A  → síncrono
setTimeout(() => console.log('B'), 0);                  // B  → fila normal (macrotask)
Promise.resolve().then(() => console.log('C'));         // C  → fila VIP (microtask)
queueMicrotask(() => console.log('D'));                 // D  → fila VIP (microtask)
(async () => {
  console.log('E');                                     // E  → síncrono (até o 1º await)
  await null;                                           // await null → pausa a função
  console.log('F');                                     // F  → fila VIP (microtask)
})();
console.log('G');                                       // G  → síncrono
// Saída: A E G C D F B
```

| Ordem | Fila | Quem |
| --- | --- | --- |
| 1 | Código síncrono (executa primeiro) | A, E, G |
| 2 | Microtasks (fila VIP) | C, D, F |
| 3 | Timer / macrotask (depois das microtasks) | B |

## ➕ Parte 2 · Quem define a fila?
**Microtask**: "SOU DA FILA VIP! Assim que o código atual terminar, QUERO EXECUTAR ANTES DA PRÓXIMA MACROTASK!"
**Macrotask**: "EU TAMBÉM QUERO EXECUTAR!"
**Event Loop**: "BELEZA, MAS PRIMEIRO VOU ESVAZIAR A FILA VIP!"

Quem define se é microtask ou macrotask é a **API que agenda a tarefa**, não o tempo que ela demora nem a importância dela.

| Microtasks (fila VIP) | Macrotasks (fila normal) |
| --- | --- |
| `Promise.then()` | `setTimeout()` |
| `Promise.catch()` | `setInterval()` |
| `Promise.finally()` | Eventos como `click` |
| `queueMicrotask()` | Mensagens de `MessageChannel` |
| Continuação após `await` | Tarefas de I/O, dependendo do ambiente |
| `MutationObserver` | `setImmediate` (Node) |

Exemplo: `setTimeout(() => console.log("A"), 0); Promise.resolve().then(() => console.log("B")); queueMicrotask(() => console.log("C")); console.log("D");` → resultado **D → B → C → A**.

**Por que existem duas filas?** Microtasks continuam trabalhos agendados para acontecer logo após o código atual, antes da próxima tarefa. Macrotasks executam tarefas novas, como callbacks de timers e eventos.

**A pegadinha**: uma microtask pode demorar 10 segundos e uma macrotask pode durar 1 milissegundo. Isso não muda a classificação delas.

**Regra para decorar**: não é o Event Loop que olha uma função e decide se ela merece a fila VIP. A API usada para agendá-la determina em qual fila ela entra.

## ➕ Três detalhes que o recrutador chato pergunta depois
- **O `.then()` só entra na fila quando a Promise resolve.** `fetch(url).then(fn)`: enquanto a rede não responde, o `fn` não está em fila nenhuma. Quando a resposta chega (uma macrotask/I/O), a Promise resolve e só então o `fn` entra na fila VIP.
- **Microtask demorada trava tudo.** Como a fila VIP é esvaziada inteira antes de qualquer timer, clique ou redesenho da tela, uma microtask lenta (ou uma microtask que agenda outra sem parar) congela a página. Microtask é prioridade, não é "segundo plano".
- **No Node existe uma fila ainda mais VIP: `process.nextTick`**, que roda antes das Promises (veja o lab Node 01).

## 🎤 Pra entrevista
"O JavaScript roda todo o código síncrono primeiro. Depois o event loop esvazia a fila inteira de microtasks (`.then`, `queueMicrotask`, a continuação depois de um `await`) e só então executa uma macrotask (timer, evento, I/O), voltando a esvaziar as microtasks depois de cada uma. Quem decide a fila é a API que agendou, não o tempo. Por isso a saída é A E G, depois C D F, e por último B."
