**Especialista do negócio**: "O solicitante abre uma **solicitação**; o despacho faz a **atribuição** de um motorista."

**Código antigo**: "Aqui chamamos tudo de `Order` e `Job`." 🤷

**Linguagem ubíqua** 🗣️: "Então o código fala outra língua que o negócio! Usa as MESMAS palavras: `Solicitacao`, `Atribuicao`."

**Vendas**: "Pra mim, cliente é um lead com oportunidade."

**Faturamento**: "Pra mim, cliente é CNPJ, endereço fiscal e impostos."

**Bounded context** 🗺️: "Os dois têm razão, cada um no seu território. Cada contexto tem o seu modelo de cliente; na fronteira, a gente traduz."

**`Money(100, 'BRL')`** 💰 (value object): "Não tenho ID. Sou definido pelo meu valor, sou imutável e não deixo ninguém me criar negativo."

**`Viagem`** (agregado, a raiz) 👑: "Ninguém muda meu status por fora! Quer aprovar? Fala comigo: `viagem.aprovar()`. Eu confiro as regras."

**`ViagemAprovada`** (evento de domínio) 📣: "Aconteceu! Quem se interessar (e-mail, ERP), que reaja."

**CRUD simples**: "E eu? Também preciso de tudo isso?"

**DDD**: "Não. Eu vale a pena onde o domínio é complexo." 😅

**🧠 Moral da história para entrevista**

"DDD é desenhar o código pelo domínio: linguagem ubíqua, bounded contexts com tradução nas fronteiras, agregados que protegem as invariantes, value objects imutáveis e eventos de domínio. Vale para domínios complexos; para CRUD simples é cerimônia demais."
