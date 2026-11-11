# ⌨️ A moça que ligava a cada letra

> A Bia está digitando "react hooks" na busca. Do outro lado, a API atende o telefone.

## 🎭 Elenco
- 👩‍💻 **Bia** · evento `input` · quem digita: cada tecla dispara um evento
- 🤪 **Campo afobado** · listener sem debounce · liga pra API a cada letra
- 😌 **Campo tranquilo** · `buscarDepois = debounce(fn, 300)` · espera a Bia parar de digitar antes de ligar
- ☎️ **API** · `searchApi()` · o servidor de busca, que atende cada ligação
- 🎒 **`timer`** · `let timer` (a closure) · a variável que fica guardada na mochila da função entre uma tecla e outra
- 🚦 **Throttle** · `throttle(fn, ms)` · o primo: deixa passar no máximo uma chamada a cada X ms

## 🎬 Cena 1 · O campo afobado
**Bia** _(digitando)_: "R… E… A… C… T…"
**Campo afobado**: "LETRA NOVA? LIGA PRA API! OUTRA? LIGA DE NOVO! 📞📞📞"
**API**: "Alô? 'r'. Alô? 're'. Alô? 'rea'… MOÇA, PELO AMOR, FORAM 11 LIGAÇÕES PRA UMA PALAVRA SÓ! 😩"
> 🚨 11 buscas, e 10 delas ninguém queria.

## 🎬 Cena 2 · O campo tranquilo
**Bia**: "R… E… A…"
**Campo tranquilo**: "Calma, minha filha. Vou esperar 300ms. Se vier outra letra antes, eu rasgo o timer e começo a contar de novo."
**`timer`** _(de dentro da mochila)_: "E eu fico guardadinho aqui! Toda tecla mexe NESTE MESMO timer, por isso dá pra cancelar o anterior." 🎒
**Bia**: "…H-O-O-K-S." _(para de digitar)_
**Campo tranquilo**: "Um, dois, três… 300ms de silêncio! AGORA SIM: uma ligação, com a palavra inteira."
**API**: "Isso sim é educação! 🙏"

## 🎬 Cena 3 · Chega o primo
**Throttle**: "Eu sou diferente, viu? Não espero ninguém parar. Deixo passar UMA ligação a cada X ms, e o resto espera a próxima janela."
**Campo tranquilo**: "Então você é bom pra quê?"
**Throttle**: "Pra rolagem e pra quando a pessoa fica redimensionando a tela feito doida. 🌀"

## 💻 Traduzindo pro código
```js
function debounce(fn, ms) {
  let timer;                       // 🎒 a mochila (closure)
  return (...args) => {
    clearTimeout(timer);           // rasga o timer anterior
    timer = setTimeout(() => fn(...args), ms); // começa a contar de novo
  };
}
const buscarDepois = debounce(searchApi, 300);   // o campo tranquilo
input.addEventListener('input', (e) => buscarDepois(e.target.value));
```

| | Quando executa | Uso típico |
| --- | --- | --- |
| Debounce | Só depois que as chamadas param por X ms | Busca, autosave |
| Throttle | No máximo 1 vez a cada X ms | Scroll, resize |

**Closure** é a função lembrar das variáveis de onde nasceu: o `timer` continua vivo entre uma tecla e outra porque mora dentro da função que o `debounce` devolveu.

## 🎤 Pra entrevista
"Closure é quando uma função guarda acesso às variáveis do escopo onde foi criada. O debounce usa isso: guarda o `timer` e, a cada chamada, cancela o anterior e agenda outro, então só executa depois que as chamadas param por X ms. Throttle limita a no máximo uma execução a cada X ms. Debounce para busca, throttle para scroll e resize."
