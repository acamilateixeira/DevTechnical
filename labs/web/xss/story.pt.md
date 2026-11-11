**Atacante** 🦹: "Vou deixar um comentário 'inocente': `Ótima viagem! <img src=x onerror="roubarTudo()">`"

**Quadro 1, `{comentario}`**: "Chegou texto? Mostro como TEXTO. Os `<` e `>` viram símbolos na tela. Não executo nada." 🛡️

**Atacante**: "Droga, apareceu meu código na tela feito bobo. 😒"

**Quadro 2, `dangerouslySetInnerHTML`** (sem sanitizar): "Chegou HTML? Coloco direto na página!"

**Navegador**: "Opa, uma imagem! Vou carregar `x`… não existe… então rodo o `onerror`!"

**Script do atacante**: "RODEI! Agora estou DENTRO da sua página, com a sessão da usuária logada. Posso ler a tela, fazer pedidos em nome dela…" 😈 **← XSS**

**React** (olhando o nome da propriedade): "Eu avisei: está escrito **dangerously** no nome!" 🙄

**Quadro 3, `dangerouslySetInnerHTML` + sanitização**: "Chegou HTML? Antes de mostrar, passo na peneira: tiro `<script>`, tiro `onerror`, tiro `javascript:`. O negrito pode ficar." 🧹

**Atacante**: "Sobrou só a imagem quebrada. 😭"

**Cookie `httpOnly`** (do lado de fora): "E mesmo se algum script entrasse, ele não conseguiria me ler: JavaScript não tem acesso a mim." 🍪🔒

**🧠 Moral da história para entrevista**

"O React escapa tudo que vai entre `{ }`, então texto do usuário vira texto. O risco aparece com `dangerouslySetInnerHTML`, `href` com `javascript:` e libs que mexem no DOM direto. Se precisar mostrar HTML do usuário, sanitizo (DOMPurify), e uso CSP e cookie `httpOnly` como defesa em profundidade."
