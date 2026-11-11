**Monolito** 🏠 (uma casa grande): "Tudo mora aqui: viagens, faturas, usuários. Uma transação resolve tudo. Um deploy só."

**Time de faturas**: "Mas toda vez que eu quero publicar, preciso esperar o time de viagens…" 😩

**Microsserviços** 🏘️ (um condomínio): "Cada time com sua casa, seu banco, seu deploy!"

**Time de faturas**: "Liberdade! 🎉"

**Rede** 🌐 (entre as casas): "Agora vocês conversam por mim. E às vezes eu falho, demoro, perco mensagem." 😈

**Transação** 💔: "E eu não atravesso casas. Vão ter que usar saga, eventos e consistência eventual."

**Observabilidade**: "E pra achar um bug, agora vocês precisam de tracing passando por 6 casas." 🔦

**Monolito distribuído** 🧟: "E se as casas ainda dependerem umas das outras pra tudo e precisarem subir juntas, eu sou o pior dos dois mundos."

**Monolito modular** 🏢 (um prédio com apartamentos): "Que tal começar comigo? Uma casa só, mas com paredes bem definidas. Se um apartamento crescer muito, ele se muda depois (Strangler Fig)."

**🧠 Moral da história para entrevista**

"Microsserviços resolvem um problema de organização (times independentes), não de tecnologia. Custam rede, consistência eventual, tracing e contratos. Começo com um monolito modular com fronteiras claras e extraio um serviço quando há motivo concreto, aos poucos, com Strangler Fig."
