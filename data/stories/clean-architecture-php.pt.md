**Regra de negócio** 💎 ("não se paga fatura já paga"): "Eu sou o coração do sistema. Não quero saber de Laravel, SQL Server nem HTTP."

**Caso de uso `PagarFatura`** 🎬: "Eu orquestro: busco a fatura, peço pra ela se pagar, salvo e aviso quem precisa. Mas eu só conheço **interfaces**: 'alguém que guarda faturas', 'alguém que publica eventos'."

**Eloquent** 🧰: "Eu sou um desses 'alguéns': implemento a interface `FaturaRepository`."

**Controller** 🚪: "E eu só traduzo HTTP pra chamar o caso de uso. Nada de regra aqui dentro."

**Regra da dependência** ⬇️: "Todo mundo aponta PRA DENTRO. O de fora conhece o de dentro; o de dentro nunca conhece o de fora."

**Empresa**: "Vamos sair do CodeIgniter pro Laravel!"

**Regra de negócio**: "Pode ir, eu vou junto sem mudar uma linha. Só troca a casca." 😎

**Teste** 🧪: "E eu testo a regra em milissegundos, sem subir banco."

**Tela de cadastro simples** 📝: "Eu também preciso de quatro camadas?"

**Arquiteta experiente**: "Não. Clean Architecture onde a regra é rica (pagamentos, faturas). No resto, simples." 😅

**🧠 Moral da história para entrevista**

"Clean Architecture é a regra da dependência: domínio e casos de uso no centro, sem conhecer framework, banco ou HTTP; infraestrutura implementa interfaces (portas). Ganho testabilidade e posso trocar framework sem reescrever a regra. Aplico onde o domínio é rico."
