**Banco** 🚰 (com 5 milhões de linhas): "Vou mandar tudo!"

**Sem stream**: "Me dá TUDO de uma vez que eu monto o CSV na memória." 🪣

**Memória do servidor**: "5 MILHÕES DE LINHAS?! VOU ESTOURAR!" 💥

**Com stream (a mangueira)**: "Não. A água vai passando aos poucos: linha a linha do banco → vira CSV → vai pro usuário."

**Cliente com internet lenta** 🐢: "Calma… eu bebo devagar…"

**Banco sem backpressure**: "NÃO QUERO SABER, CONTINUO JORRANDO!" 🚿

**Buffer no meio do caminho**: "Tá acumulando tudo aqui em mim… 💦💦💦" *(a memória sobe)*

**Com backpressure (`pipeline`)**: "Cliente lento? `write()` devolveu `false`: FECHA A TORNEIRA um pouco. Quando ele beber (`drain`), abre de novo." 🚰✋

**Memória**: "Agora sim, estável." 😌

**🧠 Moral da história para entrevista**

"Com streams eu processo dados em pedaços, sem carregar tudo na memória. Backpressure é o consumidor lento freando o produtor rápido; `stream.pipeline` faz isso sozinho e ainda propaga erro e fecha tudo se o cliente desconectar. Veja o lab Node 03."
