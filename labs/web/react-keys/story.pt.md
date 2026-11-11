**Ana, Bruno e Carla** estão sentados nas cadeiras 0, 1 e 2. Cada um tem um caderninho (o `<input>`) com anotações.

**React**: "Pra eu saber quem é quem, cada um usa um **crachá** (a `key`)."

**Com `key={index}`** os crachás são o **número da cadeira**: "cadeira 0", "cadeira 1", "cadeira 2".

**Ana** (cadeira 0): "Escrevi 'oi' no meu caderninho!"

**Davi** chega e senta na **cadeira 0**, empurrando todo mundo uma cadeira pra frente.

**React**: "Crachá 'cadeira 0' continua existindo, então o caderninho com 'oi' continua na cadeira 0… que agora é do Davi!" 😬

**Davi**: "Uai, quem escreveu 'oi' no MEU caderno?!"

**Ana**: "ERA MEU! 😭"

**Agora com `key={item.id}`** os crachás têm o **nome**: "Ana", "Bruno", "Carla".

**Davi** chega e senta na cadeira 0.

**React**: "Crachá novo 'Davi'? Crio um caderninho novo pra ele. Crachá 'Ana' mudou de cadeira? Levo o caderninho dela junto!" ✅

**`Math.random()`** (aparecendo do nada): "E se eu der um crachá novo pra todo mundo a cada render?"

**React**: "Aí eu acho que todo mundo é gente nova e jogo TODOS os caderninhos fora toda vez! 🗑️"

**🧠 Moral da história para entrevista**

"A `key` é a identidade de cada item entre um render e outro. Ela precisa ser **estável e única**, como o ID do registro. Com o índice, ao inserir, remover ou reordenar, o estado vai parar no item errado."
