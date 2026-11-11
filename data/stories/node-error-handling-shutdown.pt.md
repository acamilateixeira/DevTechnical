**Kubernetes** 🚢: "Deploy novo chegando! Servidor antigo, **SIGTERM**: hora de sair."

**Servidor sem graceful shutdown**: "TCHAU!" 💀 *(morre na hora)*

**3 usuários no meio de uma compra**: "ERRO?! Só porque teve deploy?!" 😡

**Servidor com graceful shutdown**: "Ouvi o SIGTERM. Calma, vou sair direitinho:"

1. "Readiness, avisa o balanceador que **não recebo mais gente nova**." 🚫
2. "Termino quem já está sendo atendido." ⏳
3. "Fecho a conexão com o banco e com a fila (sem confirmar mensagem que não processei)." 🔌
4. "Agora sim: tchau!" 👋

**Kubernetes**: "E se você enrolar demais (30 s), eu te tiro à força com SIGKILL." ⏰

**Erro de bug** 🐛 (`unhandledRejection`): "Ninguém me tratou…"

**Servidor**: "Estado desconhecido? Melhor eu reiniciar limpo do que continuar meio quebrado. Logo o erro e morro; o Kubernetes sobe outro." ♻️

**🧠 Moral da história para entrevista**

"Separo erros esperados (viram 4xx) de bugs (500 genérico + log com trace ID). No SIGTERM: readiness falha, `server.close()` termina as requisições em andamento, fecho banco e filas e saio, antes do prazo do orquestrador. Veja o lab Node 04."
