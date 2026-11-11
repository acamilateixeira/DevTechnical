**Checkout** 🛒: "Eu só quero alguém que saiba `cobrar()`. Não me interessa se é Pix ou cartão."

**Interface `MeioDePagamento`** 📜 (o contrato): "Quem assinar comigo PROMETE ter `cobrar()`. Não digo como. E uma classe pode assinar vários contratos."

**Classe abstrata `PagamentoComTaxa`** 🏗️ (a planta da casa): "Eu já venho com parte pronta: calculo o total com taxa. Só falta cada filho dizer QUAL taxa e COMO processar. Ninguém mora em mim direto, só nas casas construídas a partir de mim. E cada classe só pode ter UMA planta."

**Trait `RegistraLog`** 🧩 (o kit pronto): "Eu sou um pacote de métodos que qualquer classe pode 'colar', mesmo sem parentesco."

**`Pix`** e **`CartaoDeCredito`**: "Os dois sabemos `cobrar()`, cada um do seu jeito!"

**Checkout**: "Então tanto faz quem vier: eu chamo `cobrar()` e funciona." **← polimorfismo** 🎭

**Boleto** (chegando depois): "Posso entrar?"

**Checkout**: "Assina o contrato e entra. Nem preciso mudar." 😎

**🧠 Moral da história para entrevista**

"Interface é contrato (várias por classe); classe abstrata é contrato + código comum (herança única); trait é reuso horizontal de métodos. Polimorfismo é o mesmo código funcionando com classes diferentes que seguem o mesmo contrato, o que permite adicionar comportamento sem mexer em quem usa."
