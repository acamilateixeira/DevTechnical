**A** (`console.log`): "CHEGUEI! Sou o primeiro da fila mesmo! VOU FALAR AGORA!"

**B** (`setTimeout`): "EU TAMBÉM QUERO FALAR! DAQUI A 0ms!"

**Event Loop**: "CALMA, APRESSADO! 0ms não significa agora! Vai esperar sua vez na fila dos timers!"

**C** (`Promise.then`): "MINHA PROMISE JÁ FOI RESOLVIDA! Eu prometi uma parada e agora quero executar meu `.then()`!"

**Event Loop**: "Beleza! Entra na fila VIP das microtasks!"

**D** (`queueMicrotask`): "EU TAMBÉM QUERO ENTRAR NA FILA VIP!"

**Event Loop**: "Mas cadê sua Promise?"

**D**: "NÃO TENHO PROMISE NENHUMA! 😂 Eu posso entrar diretamente na fila das microtasks!"

**E** (`async`): "SOU ASSÍNCRONA, MAS FUI CHAMADA AGORA! NÃO VOU ESPERAR NINGUÉM! VOU COMEÇAR A FALAR!"

**`await null`**: "ESPERAAAA, APRESSADA! ✋ Você já falou o que tinha antes de mim! Agora pausa essa função! O restante vai para a fila VIP das microtasks!"

**F** (`console.log` depois do `await`): "UAI, MAS EU NEM FALEI AINDA! 😭"

**`await`**: "POIS VAI ESPERAR! C e D chegaram primeiro na fila VIP!"

**G** (`console.log`): "Enquanto essa galera tá nessa confusão, EU VOU FAZER O MEU! Não dependo de ninguém!"

**🚨 ACABOU O CÓDIGO SÍNCRONO! A FILA VIP FOI LIBERADA!**

**C** (`Promise.then`): "EU ENTREI PRIMEIRO! MINHA VEZ!"

**D** (`queueMicrotask`): "EU SOU O SEGUNDO! NEM PRECISEI DE PROMISE!"

**F** (`console.log` depois do `await`): "FINALMENTE! O `await` me segurou, mas agora posso falar!"

**⏰ AGORA É A VEZ DOS TIMERS!**

**B** (`setTimeout`): "E EU, GENTE?! 😭 ERA PRA SER 0ms!"

**Event Loop**: "AGORA É SUA VEZ! Mas não se empolga! Se você criar microtasks, elas vão ser executadas antes do próximo timer!"

**B**: "FINALMENTE! 😂"

| Ordem | Fila | Quem |
| --- | --- | --- |
| 1 | Código síncrono (executa primeiro) | A, E, G |
| 2 | Microtasks (fila VIP) | C, D, F |
| 3 | Timer / macrotask (depois das microtasks) | B |

**🧠 Moral da história para entrevista**

- **Síncronos**: "Estamos aqui! Vamos trabalhar primeiro!"
- **Microtasks**: "Estamos na fila VIP! Quando os síncronos terminarem, É NOSSA VEZ!"
- **Timers**: "SOBROU PRA GENTE ESPERAR! 😭"
- **Event Loop**: "EU ORGANIZO ESSA BAGUNÇA! Primeiro termina o código síncrono, depois esvazio a fila das microtasks. Aí executo a próxima macrotask e verifico as microtasks de novo. E ASSIM CONTINUA!"
- **E o `await`?** "EU NÃO PARO O PROGRAMA INTEIRO, NÃO! Só pauso a minha função. O RESTO QUE SE VIRE!" 😂

**📌 Parte 2: quem define a fila?**

Quem define se é microtask ou macrotask é a **API que agenda a tarefa**, não o tempo que ela demora nem a importância dela.

**Microtask**: "SOU DA FILA VIP! Assim que o código atual terminar, QUERO EXECUTAR ANTES DA PRÓXIMA MACROTASK!"

**Macrotask**: "EU TAMBÉM QUERO EXECUTAR!"

**Event Loop**: "BELEZA, MAS PRIMEIRO VOU ESVAZIAR A FILA VIP!"

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

**➕ Três detalhes que o recrutador chato pergunta depois**

- **O `.then()` só entra na fila quando a Promise resolve.** `fetch(url).then(fn)`: enquanto a rede não responde, o `fn` não está em fila nenhuma. Quando a resposta chega (uma macrotask/I/O), a Promise resolve e só então o `fn` entra na fila VIP.
- **Microtask demorada trava tudo.** Como a fila VIP é esvaziada inteira antes de qualquer timer, clique ou redesenho da tela, uma microtask lenta (ou uma microtask que agenda outra sem parar) congela a página. Microtask é prioridade, não é "segundo plano".
- **No Node existe uma fila ainda mais VIP: `process.nextTick`**, que roda antes das Promises (veja o lab Node 01).
