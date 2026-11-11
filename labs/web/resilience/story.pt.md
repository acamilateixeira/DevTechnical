**API**: "Preciso de ofertas de crédito. Vou perguntar pros três provedores **ao mesmo tempo**." 📞📞📞

**Alpha**: "Oferta em 100ms!" ⚡

**Gamma**: "Oferta em 150ms!" ⚡

**Beta**: "Hmmm… deixa eu ver… peraí… 3 segundos… e… erro 500." 🐌💥

**Usuária**: "POR QUE A TELA DEMOROU 3 SEGUNDOS?! 😤"

**Agora com timeout por provedor:**

**API**: "Cada um tem **400ms**. Passou disso, sigo sem você."

**Beta**: "Mas eu ia—"

**API**: "TIMEOUT. Respondo com Alpha e Gamma e aviso que o Beta falhou." **← resposta parcial** ✂️

**Agora com circuit breaker (o disjuntor):**

**Breaker do Beta**: "Duas falhas seguidas? **Desarmei.** Pelos próximos 1,5 s ninguém liga pro Beta: eu respondo 'indisponível' na hora, sem gastar os 400ms." 🔌

**Usuária**: "Ficou rápido de novo!" ⚡

**Breaker** (depois de 1,5 s): "Vou deixar passar UMA chamada de teste pro Beta… (half-open)"

**Beta**: "Voltei! Oferta em 120ms!"

**Breaker**: "Rearmado. Pode ligar pro Beta normalmente." ✅

**🧠 Moral da história para entrevista**

"Um dependente lento não pode derrubar tudo. Chamo em paralelo com **timeout por dependência**, devolvo **resposta parcial**, faço retry só em operação idempotente com backoff e jitter, e uso **circuit breaker** para parar de chamar quem está falhando."
