**`PedidoController`** (fazendo TUDO): "Eu valido, calculo imposto, salvo no banco e mando e-mail!" 🤹

**S (Responsabilidade Única)**: "E quando o imposto mudar, quando o e-mail mudar, quando o banco mudar… você muda por QUATRO motivos. Separa!" ✂️

**Checkout** (cheio de `if`): "Se for pix… senão se for cartão… senão se for boleto…"

**O (Aberto/Fechado)**: "Pra cada meio de pagamento novo você mexe em mim? Cria uma CLASSE nova que segue a interface `MeioDePagamento` e me deixa em paz." 🚪

**`ReadOnlyRepository`** (fingindo ser um repositório normal): "Tenho o método `save()`… mas lanço 'não suportado'." 🤥

**L (Liskov)**: "Quem usa repositório espera que `save()` funcione. Se você não honra o contrato, não finja ser um." 🙅

**`UsuarioService`** (com 30 métodos): "Quem só quer ler o nome tem que depender de mim inteiro."

**I (Segregação de Interfaces)**: "Interfaces pequenas por papel: `LeitorDeUsuario`, `RedefinidorDeSenha`." 🧩

**Regra de aprovação**: "Eu chamo o MySQL direto…"

**D (Inversão de Dependência)**: "Dependa de uma **interface** de repositório. Aí no teste te dão uma versão em memória e, se o banco mudar, você nem percebe." 🔌

**Arquiteto empolgado**: "ENTÃO VOU CRIAR INTERFACE PRA TUDO!"

**SOLID**: "Calma. Abstração sem necessidade também é custo." 😅

**🧠 Moral da história para entrevista**

"SOLID ataca acoplamento: SRP = um motivo para mudar; OCP = estender sem editar; LSP = honrar o contrato; ISP = interfaces pequenas; DIP = regra depende de abstração, não de detalhe. É ferramenta, não regra: abstração sem necessidade é custo."
