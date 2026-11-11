# 🦹 O comentário que tinha um bicho dentro

> Um site de viagens com comentários dos clientes. Um "cliente" muito educado deixa um elogio ao hotel.

## 🎭 Elenco
- 🦹 **Pilantra** · o atacante · esconde código dentro do texto do comentário
- 🖼️ **Isca** · `<img src=x onerror="...">` · a imagem quebrada que dispara o script quando falha
- 🛡️ **Mural seguro** · `<p>{comentario}</p>` · o React escapando: mostra tudo como texto
- 🕳️ **Mural sem porteiro** · `dangerouslySetInnerHTML` · cola o HTML direto na página
- 🧹 **Peneira** · sanitizar (DOMPurify) · tira `<script>`, `onerror`, `javascript:` e deixa o resto
- 🌐 **Navegador** · o browser · obedece o HTML que recebe
- 🍪 **Biscoito** · cookie `httpOnly` · a sessão, que o JavaScript não consegue ler

- ⚛️ **React** · a biblioteca · escapa tudo, a não ser que mandem não escapar
## 🎬 Cena 1 · O elogio "inocente"
**Pilantra**: "Ótima viagem! Adorei o hotel! E aqui uma imagenzinha de presente…" _(com a isca escondida)_ 😇
**Mural seguro**: "Chegou texto? Mostro como TEXTO. Os `<` e `>` viram letrinhas na tela. Não executo nada." 🛡️
**Pilantra**: "Droga, meu código apareceu na tela feito bobo." 😒
= 📝 Comentário: texto + `<img src=x onerror=...>`
= 🛡️ Quadro 1 (`{comentario}`): mostra as tags como texto; nada roda ✅
= 😈 Scripts do atacante executados: 0

## 🎬 Cena 2 · O mural sem porteiro
**Mural sem porteiro**: "Chegou HTML? Colo direto na página, sem nem olhar!"
**Navegador**: "Opa, uma imagem! Vou carregar… não existe… então rodo o `onerror`!"
**Isca**: "DEU CERTO! O script do Pilantra tá rodando!" 💥
**Pilantra**: "Agora tô DENTRO da página, com a Bia logada. Posso ler a tela, fazer pedidos no nome dela…" 😈
**React** _(revirando os olhos)_: "Eu avisei, gente. Tá escrito DANGEROUSLY no nome!" 🙄
> 🚨 Texto do usuário virou código: isso é XSS.
= 🕳️ Quadro 2 (`dangerouslySetInnerHTML`): HTML colado na página
= 😈 Scripts do atacante executados: 1 ❌ (pelo `onerror`)
= 🔓 O script consegue: ler a tela e fazer pedidos como a Bia

## 🎬 Cena 3 · Com peneira e biscoito blindado
**Peneira**: "Chegou HTML? Antes de mostrar, passo na peneira: tchau `<script>`, tchau `onerror`, tchau `javascript:`. O negrito pode ficar, é gente boa." 🧹
**Pilantra**: "Sobrou só a imagem quebrada. Que fase." 😭
**Biscoito**: "E mesmo se algum script entrasse, não ia conseguir me ler. JavaScript não encosta em mim." 🍪🔒
= 🧹 Quadro 3 (sanitizado): `onerror` e `<script>` removidos; `<b>` mantido
= 😈 Scripts do atacante executados: 0 ✅
= 🍪 Cookie de sessão: `HttpOnly`: invisível para o JavaScript

## 💻 Traduzindo pro código
```tsx
<p>{comentario}</p>                                            {/* 🛡️ React escapa: vira texto */}
<p dangerouslySetInnerHTML={{ __html: comentario }} />          {/* 🕳️ executa a isca */}
<p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comentario) }} /> {/* 🧹 peneirado */}
```
```http
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax     # 🍪 o JS não lê
Content-Security-Policy: script-src 'self'                  # só roda script do próprio site
```

| Lugar perigoso no React | Por quê |
| --- | --- |
| `dangerouslySetInnerHTML` | Cola HTML sem escapar |
| `<a href={url}>` com `javascript:` | O clique executa código |
| Libs que mexem no DOM direto | Passam por fora do React |

## 🎤 Pra entrevista
"XSS é quando texto do usuário vira código na página de outra pessoa. O React escapa tudo que vai entre chaves, então o risco aparece com `dangerouslySetInnerHTML`, `href` com `javascript:` e bibliotecas que mexem no DOM direto. Se preciso mostrar HTML do usuário, sanitizo com DOMPurify, e uso CSP e cookie `httpOnly` como defesa em profundidade."
