# 🧑‍🍳 O garçom que parou pra fazer conta

> Um restaurante com mil mesas e UM garçom só. E ele dá conta, desde que ninguém peça pra ele fazer conta de cabeça.

## 🎭 Elenco
- 🧑‍🍳 **Garçom** · a thread principal do Node (o event loop) · anota pedidos e entrega pratos, um de cada vez
- 🔥 **Cozinha** · libuv e o sistema operacional · faz o I/O (banco, arquivo, rede) enquanto o garçom segue atendendo
- 🍽️ **Mesa do banco** · `await db.query()` · pedido de I/O: o garçom passa pra cozinha e vai embora
- 🧮 **Mesa da conta** · laço de CPU (`for` de 10 milhões, `JSON.parse` gigante, bcrypt síncrono) · prende o garçom na mesa
- 😤 **Mesas 4 a 1000** · as outras requisições · esperando até um copo d'água
- 👷 **Ajudante** · `worker_threads` · resolve a conta pesada em outra sala, em paralelo

## 🎬 Cena 1 · O garçom voando
**Garçom**: "Sou um só, mas dou conta de mil mesas: anoto, passo pra cozinha e vou pra próxima."
**Mesa do banco**: "Quero um dado do banco!"
**Garçom**: "Anotado, cozinha tá fazendo, já volto!" 🏃
**Cozinha**: "Pode deixar, a gente avisa quando ficar pronto." 🔥

## 🎬 Cena 2 · A mesa da conta
**Mesa da conta**: "Quero que VOCÊ calcule 10 milhões de contas. Aqui. Na minha frente."
**Garçom**: "…tá bom, né." 🧮🧮🧮 _(parado 1,5 s na mesma mesa)_
**Mesas 4 a 1000**: "GARÇOM?! GARÇOOOM?! Era só um copo d'água, meu Deus!" 😤
> 🚨 Event loop bloqueado: ninguém mais é atendido.

## 🎬 Cena 3 · Chama o ajudante
**Ajudante**: "Me passa essa conta. Eu faço na outra sala e te aviso quando terminar." 👷
**Garçom**: "Valeu, parceiro! Voltei a voar." 😌
**Mesas 4 a 1000**: "Até que enfim, hein."

## 💻 Traduzindo pro código
```js
app.get('/relatorio', async (req, res) => {
  const dados = await db.query('SELECT ...');      // 🍽️ I/O: não trava, vai pra cozinha
  // ❌ CPU no garçom: trava todo mundo
  // const total = calcularPesado(dados);
  // ✅ CPU no ajudante
  const total = await rodarNoWorker('./calculo.js', dados);  // 👷 worker_threads
  res.json({ total });
});
```

| Trabalho | Exemplo | No Node |
| --- | --- | --- |
| I/O-bound | Banco, HTTP, arquivo | Ótimo: não trava |
| CPU-bound | Loop grande, compressão, hash síncrono | Trava o event loop: use worker, fila ou outro processo |

No lab Node 02 dá para ver: 1410 ms de espera com o garçom preso vs 10 ms com o ajudante.

## 🎤 Pra entrevista
"O JavaScript do Node roda numa thread só, mas o I/O é delegado à libuv e ao sistema operacional, por isso ele aguenta milhares de conexões. Trabalho de CPU pesado trava o event loop inteiro e todas as requisições esperam. Tiro esse trabalho da requisição com `worker_threads`, com uma fila e um worker separado ou com mais processos, e monitoro o event loop lag."
