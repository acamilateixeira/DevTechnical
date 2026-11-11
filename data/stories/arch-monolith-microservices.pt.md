# 🏠 A casa grande e o condomínio

> Uma empresa cresceu. O time de faturas está brigando com o time de viagens pra conseguir publicar.

## 🎭 Elenco
- 🏠 **Casarão** · monolito · tudo numa aplicação só, um banco, um deploy
- 🏘️ **Condomínio** · microsserviços · cada time com seu serviço, seu banco e seu deploy
- 🧾 **Time de faturas** · um time de produto · quer publicar no seu ritmo
- 🌐 **Interfone** · a rede entre os serviços (HTTP, filas) · às vezes falha, demora ou perde recado
- 💔 **Transação** · `BEGIN ... COMMIT` · não atravessa serviços: vira saga com eventos
- 🔦 **Detetive** · tracing distribuído (OpenTelemetry) · segue uma requisição passando por várias casas
- 🧟 **Monolito distribuído** · serviços acoplados · o pior dos dois mundos
- 🏢 **Prédio de apartamentos** · monolito modular · uma aplicação só, com paredes bem definidas entre os módulos
- 🌳 **Figueira** · Strangler Fig · tira um pedaço do casarão de cada vez, sem demolir tudo

## 🎬 Cena 1 · No casarão
**Casarão**: "Aqui mora todo mundo: viagens, faturas, usuários. Uma transação resolve tudo, um deploy só."
**Time de faturas**: "Mas toda vez que eu quero publicar, tenho que esperar o time de viagens terminar a reforma deles…" 😩

## 🎬 Cena 2 · Mudança pro condomínio
**Condomínio**: "Cada time com sua casa, seu banco, seu deploy!"
**Time de faturas**: "LIBERDADE! 🎉"
**Interfone**: "Agora vocês só conversam por mim. E eu às vezes falho, demoro, perco recado." 😈
**Transação**: "E eu não atravesso muro. Vão ter que se virar com saga, eventos e consistência eventual." 💔
**Detetive**: "E pra achar um bug, agora eu preciso seguir a pista por 6 casas." 🔦
**Monolito distribuído** _(arrastando correntes)_: "E se as casas ainda dependerem umas das outras pra tudo e precisarem fazer deploy juntas… eu apareço." 🧟

## 🎬 Cena 3 · O meio-termo
**Prédio de apartamentos**: "Que tal começar comigo? Um prédio só, mas cada apartamento com parede e porta próprias."
**Figueira**: "E se um apartamento crescer demais, eu ajudo ele a se mudar aos pouquinhos, sem derrubar o prédio." 🌳
**Time de faturas**: "Gostei. Dá pra ter paz sem pagar o aluguel do condomínio inteiro."

## 💻 Traduzindo pro código
```
src/
  modules/
    trips/      # 🏢 cada módulo com seu domínio, seus casos de uso e sua API pública
    invoices/   #    outro módulo só conversa por essa API ou por eventos, nunca pela tabela do vizinho
    users/
```

| | Monolito modular | Microsserviços |
| --- | --- | --- |
| Deploy | Um | Um por serviço |
| Transação | Normal | Saga e consistência eventual |
| Depurar | Stack trace | Tracing distribuído |
| Custo de operação | Baixo | Alto (rede, contratos, observabilidade) |
| Resolve | Organização do código | Times independentes e escala separada |

## 🎤 Pra entrevista
"Microsserviços resolvem um problema de organização, times publicando de forma independente, não de tecnologia. Custam rede, consistência eventual, tracing e contratos entre serviços. Começo com um monolito modular com fronteiras claras e extraio um serviço quando há motivo concreto, aos poucos, com Strangler Fig."
