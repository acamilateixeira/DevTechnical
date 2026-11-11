**Usuária**: "Sou a Camila, minha senha é…"

**Autenticação** 🪪: "Confirmado: você é a Camila."

**Autorização** 🛂: "E eu decido o que a Camila PODE fazer. Ser a Camila não te deixa aprovar viagem de outro centro de custo."

**Sessão com cookie** 🍪: "Guardo seu crachá no servidor e te dou só um número num cookie `httpOnly`. Quer sair? Apago no servidor e pronto."

**JWT** 🎟️: "Eu sou um ingresso assinado: tudo escrito em mim, ninguém precisa consultar o banco. Mas… se roubarem, valho até a validade."

**Hacker**: "Vou ler o que tem no JWT!"

**JWT**: "Pode ler, sou só **codificado**, não criptografado. Só não consegue me ALTERAR, por causa da assinatura." ✍️

**Access token** ⏱️: "Por isso eu duro só 15 minutos."

**Refresh token** 🔄: "E eu renovo o access, mas a cada uso eu mesmo sou trocado. Se alguém usar um refresh antigo, derrubo a família toda." 🚨

**OAuth / "Entrar com Google"** 🔑: "Eu deixo um app acessar algo em seu nome sem ele saber sua senha. O OIDC me acrescenta a parte de 'quem é você'."

**PKCE**: "E eu protejo esse fluxo em apps de navegador e celular, onde não dá pra guardar segredo."

**🧠 Moral da história para entrevista**

"Autenticação diz quem é; autorização diz o que pode, sempre no servidor. Sessão com cookie `httpOnly` é simples e revogável; JWT é autocontido mas difícil de revogar, então access curto + refresh rotativo. Para SPA, Authorization Code + PKCE ou um BFF que guarda os tokens no servidor."
