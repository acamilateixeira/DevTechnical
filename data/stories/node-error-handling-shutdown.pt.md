# 👋 O servidor que sabia sair de fininho

> Deploy às 15h numa terça. O Kubernetes vai trocar o servidor antigo pelo novo, com gente no meio de compra.

## 🎭 Elenco
- 🚢 **Kubernetes** · o orquestrador · manda o aviso de saída e, se demorar, arranca na marra
- 📨 **Aviso** · sinal `SIGTERM` · "hora de sair, mas com educação"
- 🔪 **Arrancada** · sinal `SIGKILL` · "acabou o tempo": mata na hora, sem conversa
- 🚦 **Plaquinha** · readiness probe · avisa o balanceador se o servidor aceita gente nova
- 🚪 **Porta** · `server.close()` · para de aceitar conexões novas e termina as que estão em andamento
- 🐛 **Bug solto** · `unhandledRejection` · uma Promise que deu erro e ninguém tratou
- 🛒 **Clientes** · requisições em andamento · gente no meio da compra

- 💀 **Servidor sem modos** · sem graceful shutdown · morre na hora
- 🤵 **Servidor educado** · com graceful shutdown · sai direitinho
## 🎬 Cena 1 · Sai sem avisar
**Kubernetes**: "Servidor velho, chegou o aviso. Hora de sair."
**Servidor sem modos**: "TCHAU!" 💀 _(morre na hora)_
**Clientes**: "ERRO?! Só porque teve deploy?! Eu tava pagando!" 😡
> 🚨 Requisições cortadas no meio.
= 📨 Sinal recebido: SIGTERM
= 💀 Processo: morreu na hora
= 🛒 Requisições em andamento: 3 cortadas (`UND_ERR_SOCKET`) ❌

## 🎬 Cena 2 · Sai de fininho
**Servidor educado**: "Recebi o aviso. Calma, vou sair direitinho."
**Plaquinha**: "Virei pra 'FECHADO'. Balanceador, não manda mais ninguém pra cá." 🚫
**Porta**: "Não entra ninguém novo, mas quem já tá aqui dentro termina a compra." ⏳
**Servidor educado**: "Agora fecho o banco e a fila, sem confirmar mensagem que eu não terminei." 🔌
**Servidor educado**: "Prontinho. Tchau, gente!" 👋
**Kubernetes**: "Muito bem. Mas se você enrolar mais de 30 segundos, eu te arranco na marra." 🔪⏰
= 🚦 Readiness: 503: fora do balanceador
= 🚪 `server.close()`: sem conexões novas; as 3 em andamento terminaram ✅
= 🔌 Banco e fila: fechados
= ⏰ Tempo usado: dentro dos 30 s (antes do SIGKILL)

## 🎬 Cena 3 · O bug solto
**Bug solto**: "Dei erro e ninguém me tratou…" 🐛
**Servidor educado**: "Estado desconhecido? Melhor reiniciar limpinho do que seguir meio quebrado. Anoto o erro no log e saio."
**Kubernetes**: "Pode deixar que eu subo outro." ♻️
= 🐛 Evento: `unhandledRejection`
= 📝 Log: erro fatal com stack
= ♻️ Processo: `exit(1)`; o Kubernetes sobe outro

## 💻 Traduzindo pro código
```js
let fechando = false;
app.get('/ready', (req, res) => res.status(fechando ? 503 : 200).end()); // 🚦

process.on('SIGTERM', async () => {                // 📨
  fechando = true;                                 // 🚦 para de receber gente nova
  server.close(async () => {                       // 🚪 termina quem já entrou
    await db.end(); await channel.close();         // 🔌 fecha banco e fila
    process.exit(0);                               // 👋
  });
  setTimeout(() => process.exit(1), 25_000).unref(); // antes do SIGKILL do Kubernetes (30 s)
});

process.on('unhandledRejection', (err) => {        // 🐛
  logger.fatal({ err }, 'bug não tratado');
  process.exit(1);                                 // ♻️ o orquestrador sobe outro
});
```

| Tipo de erro | Exemplo | Resposta |
| --- | --- | --- |
| Esperado | Dado inválido, sem permissão | 4xx com mensagem clara |
| Bug | `undefined is not a function` | 500 genérico + log com trace ID |

No lab Node 04: com graceful shutdown todas as requisições terminam; sem ele, `UND_ERR_SOCKET`.

## 🎤 Pra entrevista
"Separo erros esperados, que viram 4xx, de bugs, que viram 500 genérico com log e trace ID. No `SIGTERM` faço a readiness falhar, chamo `server.close()` para terminar as requisições em andamento, fecho banco e filas e saio antes do prazo do orquestrador. Em `unhandledRejection` logo e encerro o processo, porque o estado ficou desconhecido."
