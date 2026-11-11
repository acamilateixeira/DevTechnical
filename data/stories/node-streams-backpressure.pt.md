# 🚰 A mangueira e o copo pequeno

> A Bia pediu um relatório com 5 milhões de linhas no 3G do interior. O servidor precisa mandar sem se afogar.

## 🎭 Elenco
- 🚰 **Caixa d'água** · o banco com 5 milhões de linhas · a fonte dos dados
- 🪣 **Balde** · `const linhas = await db.findAll()` · carrega TUDO na memória antes de mandar
- 🐍 **Mangueira** · stream (`Readable` → `Transform` → `Writable`) · passa os dados aos pouquinhos
- 🥤 **Copinho** · o cliente com internet lenta · bebe devagar
- 💦 **Poça** · o buffer interno · onde a água acumula quando ninguém fecha a torneira
- ✋ **Freio** · backpressure (`write()` devolve `false`, evento `drain`) · fecha a torneira quando o copo está cheio
- 🔧 **Encanador** · `stream.pipeline()` · liga tudo, freia sozinho e fecha tudo se der erro

- 🧠 **Memória** · a RAM do servidor · quem estoura se tudo for carregado de uma vez
## 🎬 Cena 1 · O balde
**Balde**: "Me dá TUDO de uma vez que eu monto o CSV aqui!" 🪣
**Caixa d'água**: "5 milhões de linhas saindo!"
**Memória**: "SOCORRO, VOU ESTOURAR!" 💥
> 🚨 Carregar tudo na memória derruba o servidor.

## 🎬 Cena 2 · A mangueira sem freio
**Mangueira**: "Deixa comigo: linha a linha, do banco pro CSV, do CSV pra Bia."
**Copinho** 🐢: "Calma, gente… eu bebo devagar…"
**Caixa d'água**: "NÃO QUERO SABER, CONTINUO JORRANDO!" 🚿
**Poça**: "Tá acumulando tudo aqui em mim… 💦💦💦" _(a memória sobe de novo)_

## 🎬 Cena 3 · Com freio
**Copinho**: "Tô cheio!" _(o `write()` devolveu `false`)_
**Freio**: "FECHA A TORNEIRA um pouco!" ✋
**Copinho**: "Pronto, bebi." _(evento `drain`)_
**Freio**: "Pode abrir de novo."
**Encanador**: "E se a Bia fechar o navegador no meio, eu fecho todos os canos sozinho, sem vazamento." 🔧
**Memória**: "Agora sim, estável feito coqueiro." 😌

## 💻 Traduzindo pro código
```js
import { pipeline } from 'node:stream/promises';

app.get('/export.csv', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  await pipeline(                       // 🔧 freia sozinho e propaga erro
    db.streamQuery('SELECT * FROM trips'), // 🚰 lê aos poucos
    toCsv(),                            // 🐍 transforma linha a linha
    res,                                // 🥤 o cliente
  );
});
```

| Jeito | Memória com 5 milhões de linhas |
| --- | --- |
| Balde (`findAll`) | Cresce até estourar |
| Stream sem backpressure | Cresce no buffer |
| `pipeline` | Estável |

No lab Node 03 dá para ver: 131 MB sem freio vs 71 MB com `pipeline`.

## 🎤 Pra entrevista
"Com streams eu processo dados em pedaços, sem carregar tudo na memória. Backpressure é o consumidor lento freando o produtor rápido: o `write()` devolve `false` e o produtor espera o `drain`. O `stream.pipeline` faz isso sozinho e ainda propaga erro e fecha tudo se o cliente desconectar."
