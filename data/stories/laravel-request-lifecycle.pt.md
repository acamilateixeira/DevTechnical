**Requisição** ✉️: "Cheguei! `POST /faturas/10/pagar`."

**`public/index.php`** 🚪 (a portaria): "Bem-vinda! Vou acordar o Laravel."

**Service providers** 🧰: "Já arrumamos tudo: banco, filas, rotas, e registramos no container quem é quem."

**Middlewares** 👮 (as catracas): "Está logada? (auth) Não está mandando pedido demais? (throttle) Pode passar."

**Router** 🗺️: "`POST /faturas/{id}/pagar`? Isso é com o `PagamentoController@store`."

**Form Request** 🧪: "Antes do controller, eu valido os dados e confiro se ela PODE pagar essa fatura."

**Container** 🤵: "O controller precisa do `PagarFatura`? Eu monto e entrego (injeção de dependência)."

**Controller**: "Chamo o caso de uso e devolvo 201."

**Resposta** 📬: "Voltando pelas mesmas catracas (middlewares) até o usuário."

**Eloquent** (dentro do caso de uso, listando 50 faturas com cliente): "Uma query pra lista… e mais uma por cliente…" 😬

**`with('cliente')`**: "Junta tudo: 2 queries." ✅

**🧠 Moral da história para entrevista**

"`index.php` → service providers → middlewares globais e de rota → router → Form Request (valida e autoriza) → controller com dependências injetadas pelo container → resposta volta pelos middlewares. No Eloquent, evito N+1 com `with()` e `preventLazyLoading()` em dev."
