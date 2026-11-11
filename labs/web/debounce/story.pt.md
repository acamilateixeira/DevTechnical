**Usuária** (digitando "react hooks"): "R… E… A… C… T…"

**Campo sem debounce**: "LETRA NOVA? CHAMA A API! LETRA NOVA? CHAMA A API DE NOVO!" 📞📞📞

**API**: "MOÇA, FORAM 11 LIGAÇÕES PRA UMA PALAVRA SÓ! 😩"

**Campo com debounce**: "Calma. Eu vou esperar 300ms. Se chegar outra letra antes disso, eu **jogo fora o timer** e começo a contar de novo."

**`timer`** (a variável dentro da closure): "E eu fico guardadinho na mochila da função! Toda chamada mexe NO MESMO timer, por isso consigo cancelar o anterior." 🎒

**Usuária**: "…H-O-O-K-S." *(para de digitar)*

**Debounce**: "300ms de silêncio! AGORA SIM: uma chamada só, com a palavra inteira."

**API**: "ISSO SIM É EDUCAÇÃO! 🙏"

**Throttle** (primo do debounce, entrando na conversa): "Eu sou diferente: não espero parar. Deixo passar no máximo **uma** chamada a cada X ms. Sirvo pra scroll e redimensionar a tela."

**🧠 Moral da história para entrevista**

- **Closure**: "a função lembra as variáveis de onde nasceu; o `timer` fica guardado entre uma chamada e outra."
- **Debounce**: "só executa depois que as chamadas param por X ms (busca)."
- **Throttle**: "executa no máximo uma vez a cada X ms (scroll, resize)."
