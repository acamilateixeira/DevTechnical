**Redis** (o cache): "Eu guardo o produto 42 por 5 segundos (TTL). Quem pedir, eu respondo na hora." ⚡

**Banco**: "E eu fico de boa, porque o Redis me poupa." 😌

**Relógio**: "⏰ 5 segundos. O produto 42 EXPIROU no Redis."

**50 usuários** (chegando JUNTOS): "QUERO O PRODUTO 42!"

**Redis**: "Não tenho mais! Vão buscar no banco!"

**50 usuários** (correndo pro banco ao mesmo tempo): "BANCO! BANCO! BANCO! BANCO!…" 🐃🐃🐃🐃

**Banco**: "50 QUERIES IGUAIS AO MESMO TEMPO?! 😵" **← cache stampede (estouro da boiada)**

**Agora com single-flight:**

**Usuário 1**: "Não tem no cache. Vou eu buscar no banco." 🏃

**Usuário 2**: "Também não achei… mas alguém já está buscando?"

**Single-flight**: "Está sim, o Usuário 1. **Espera a mesma busca dele**, não abre outra." 🤝

**Usuários 2 a 50**: "Beleza, a gente espera junto." ⏳

**Banco**: "1 query só. Assim dá." 😌

**Usuário 1**: "Voltei! Guardei no Redis por 5 s **+ um pouquinho aleatório** (jitter), pra várias chaves não expirarem todas no mesmo segundo." 🎲

**🧠 Moral da história para entrevista**

"Cache-aside: busca no cache; se não tiver, busca no banco e grava com TTL. Quando uma chave popular expira, todo mundo vai ao banco junto (stampede). Evito deixando só um recalcular (single-flight/lock), com TTL com jitter e renovação antecipada."
