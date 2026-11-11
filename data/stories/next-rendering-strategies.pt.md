**Usuária**: "Quero ver a página!"

**CSR** 🧱 (monta em casa): "Te mando uma caixa vazia e o manual (o JavaScript). Você monta aí no navegador." *(tela branca até montar)*

**SSR** 🍳 (prato feito na hora): "Eu preparo o HTML no servidor A CADA pedido e te entrego pronto. Sempre fresquinho, mas me dá trabalho toda vez."

**SSG** 🥪 (marmita pronta): "Eu preparei tudo no build. Te entrego na hora pela CDN. Mas se o conteúdo mudar, só no próximo build."

**ISR** 🔄 (marmita que se renova): "Eu sou a marmita, mas de tempos em tempos (ou quando avisam) preparo uma nova em segundo plano."

**Server Components** 🧑‍🍳: "Eu cozinho no servidor, busco os dados direto lá e **não mando JavaScript** pro navegador. Só os pedaços interativos vão como `'use client'`."

**Hydration** 💧: "Chegou o HTML pronto do servidor? Eu passo ligando os botões (os eventos) nele."

**`Date.now()` no render**: "No servidor eu era 10:00:00; no navegador, 10:00:01…"

**Hydration**: "HTML diferente! ERRO DE HYDRATION!" 💥

**🧠 Moral da história para entrevista**

"Página pública e estável → SSG/ISR; personalizada por usuário → SSR ou RSC dinâmico; app logado muito interativo → RSC no esqueleto e client components nas partes interativas. Hydration é ligar os eventos no HTML do servidor; erro de hydration é HTML diferente entre servidor e primeiro render."
