# 🎟️ A balada, o crachá e o ingresso

> A Camila quer entrar no sistema e aprovar uma viagem. Na porta tem segurança, e cada um confere uma coisa diferente.

## 🎭 Elenco
- 🪪 **Recepção** · autenticação · confere QUEM você é (login e senha, Google, biometria)
- 🛂 **Segurança da área VIP** · autorização · decide o que você PODE fazer, sempre no servidor
- 🍪 **Pulseirinha** · sessão com cookie `httpOnly` · o servidor guarda quem é você; você só leva um número
- 🎟️ **Ingresso assinado** · JWT · tudo escrito no próprio ingresso, com assinatura: ninguém consulta lista
- ⏱️ **Ingresso de 15 minutos** · access token · vale pouco tempo pra estrago ser pequeno
- 🔄 **Ficha de troca** · refresh token rotativo · troca por ingresso novo e é trocada a cada uso
- 🔑 **Procuração** · OAuth 2.0 / OIDC ("Entrar com Google") · deixa um app agir por você sem saber sua senha
- 🧩 **Senha de uso único** · PKCE · protege o fluxo em app de navegador e celular, onde não dá pra guardar segredo
- 🦹 **Penetra** · o atacante

- 👩 **Camila** · a usuária · quer entrar e aprovar uma viagem
- 📱 **App de viagens** · um app de terceiros · quer acessar a agenda dela
## 🎬 Cena 1 · Quem é e o que pode
**Camila**: "Oi, sou a Camila, minha senha é…"
**Recepção**: "Confirmado: você é a Camila." 🪪
**Camila**: "Então vou aprovar a viagem do centro de custo de Marketing!"
**Segurança da área VIP**: "Opa, opa. Ser a Camila não te faz gestora de Marketing. Aqui não." 🛂
= 🪪 Autenticação: ✅ é a Camila
= 🛂 Autorização para Marketing: ❌ 403 (ela não é gestora dali)

## 🎬 Cena 2 · Pulseirinha ou ingresso?
**Pulseirinha**: "Eu guardo seu cadastro no servidor e te dou só um número. Quer expulsar alguém? Apago no servidor e pronto." 🍪
**Ingresso assinado**: "Eu tenho tudo escrito em mim, ninguém precisa consultar lista. Mas se me roubarem, valho até a validade…" 🎟️
**Penetra**: "Vou ler o que tá escrito no ingresso!"
**Ingresso assinado**: "Pode ler, sou só CODIFICADO, não criptografado. Só não consegue me ALTERAR, por causa da assinatura." ✍️
**Ingresso de 15 minutos**: "Por isso eu duro pouquinho." ⏱️
**Ficha de troca**: "E eu te dou um ingresso novo, mas a cada uso eu também sou trocada. Se alguém aparecer com uma ficha velha, cancelo a família inteira." 🔄🚨
= 🍪 Sessão: id no cookie `HttpOnly`; estado no servidor; revoga na hora
= 🎟️ JWT: payload legível, assinatura impede alterar
= ⏱️ Access token: 15 min
= 🔄 Refresh token: trocado a cada uso; reuso → derruba a família

## 🎬 Cena 3 · Entrar com Google
**App de viagens**: "Posso ver sua agenda do Google pra sugerir datas?"
**Procuração**: "Pode, mas sem a senha dela. Eu te dou uma autorização limitada, só pra agenda." 🔑
**Senha de uso único**: "E como você é um app de navegador e não sabe guardar segredo, eu protejo a troca do código." 🧩
= 🔑 Fluxo: Authorization Code + PKCE
= 📱 O app recebeu: token só com o escopo de agenda
= 🔒 A senha da Camila: nunca passou pelo app ✅

## 💻 Traduzindo pro código
```http
# 🍪 sessão
Set-Cookie: sid=8f2c...; HttpOnly; Secure; SameSite=Lax

# 🎟️ JWT: header.payload.assinatura (o payload é só base64, qualquer um lê)
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjYW1pbGEiLCJleHAiOjE3MzE...
```
```ts
// 🛂 autorização sempre no servidor, por recurso
if (!user.gerenciaCentroDeCusto(viagem.centroDeCustoId)) throw new ForbiddenException();
```

| | Sessão com cookie | JWT |
| --- | --- | --- |
| Onde fica o estado | No servidor | No próprio token |
| Revogar | Fácil (apaga a sessão) | Difícil (espera expirar) |
| Bom para | Web tradicional, BFF | APIs entre serviços, mobile |

## 🎤 Pra entrevista
"Autenticação diz quem é; autorização diz o que pode, e é sempre checada no servidor, por recurso. Sessão com cookie `httpOnly` é simples e revogável; JWT é autocontido mas difícil de revogar, então uso access token curto com refresh token rotativo. Para SPA, Authorization Code com PKCE ou um BFF que guarda os tokens no servidor. OAuth delega acesso; OIDC acrescenta a identidade."
