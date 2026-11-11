# 🧰 Os cinco conselhos da tia SOLID

> Um sistema de pedidos cresceu na base do "depois eu arrumo". A tia SOLID veio fazer uma visita.

## 🎭 Elenco
- 🤹 **Faz-tudo** · `PedidoController` gigante · valida, calcula imposto, salva e manda e-mail
- ✂️ **S** · Single Responsibility · "uma classe, um motivo pra mudar"
- 🚪 **O** · Open/Closed · "estende sem mexer no que já funciona"
- 🤥 **Impostor** · `ReadOnlyRepository` com `save()` que lança erro · finge ser o que não é
- 🙅 **L** · Liskov Substitution · "quem substitui tem que honrar o contrato"
- 🐘 **Interfaceçona** · `UsuarioService` com 30 métodos · todo mundo depende dela inteira
- 🧩 **I** · Interface Segregation · "interfaces pequenas, por papel"
- 🔌 **D** · Dependency Inversion · "a regra depende de uma abstração, não do MySQL"
- 🤓 **Arquiteto empolgado** · quem quer interface pra tudo

- 🛒 **Checkout** · o código de pagamento cheio de `if`
- 📏 **Regra de aprovação** · uma regra de negócio · grudada no MySQL
- 👵 **Tia SOLID** · os cinco princípios juntos · a voz da experiência
## 🎬 Cena 1 · O faz-tudo
**Faz-tudo**: "Eu valido, calculo imposto, salvo no banco e mando e-mail! Sou multitarefa!" 🤹
**S**: "Meu bem, quando o imposto mudar, o e-mail mudar ou o banco mudar, você muda por QUATRO motivos. Separa isso aí." ✂️
= 🤹 Responsabilidades do controller: 4 (validar, imposto, salvar, e-mail)
= ✂️ Depois do S: 4 classes, 1 motivo para mudar cada

## 🎬 Cena 2 · O checkout cheio de if
**Checkout**: "Se for Pix… senão se for cartão… senão se for boleto…"
**O**: "E pra cada forma de pagamento nova você vai mexer aqui de novo? Cria uma classe nova que segue o contrato `MeioDePagamento` e deixa o checkout em paz." 🚪
**Impostor**: "Eu sou um repositório! Tenho `save()`… mas ele lança 'não suportado'." 🤥
**L**: "Quem usa repositório espera que `save()` funcione. Se não honra o contrato, não finge ser um." 🙅
= 🔀 `if` por forma de pagamento: 3 (e crescendo)
= 🚪 Depois do O: 1 classe por forma; o checkout não muda
= 🤥 `ReadOnlyRepository.save()`: lança erro → quebra o L

## 🎬 Cena 3 · A interfaceçona e o banco grudado
**Interfaceçona**: "Quem só quer ler o nome do usuário tem que depender dos meus 30 métodos." 🐘
**I**: "Quebra em pedaços: `LeitorDeUsuario`, `RedefinidorDeSenha`. Cada um pega só o que usa." 🧩
**Regra de aprovação**: "Eu chamo o MySQL direto, é mais rápido."
**D**: "Depende de uma interface de repositório. No teste te dão uma versão em memória e, se o banco mudar, você nem fica sabendo." 🔌
**Arquiteto empolgado**: "ENTÃO VOU CRIAR INTERFACE PRA TUDO! ATÉ PRO `console.log`!" 🤓
**Tia SOLID**: "Calma, filho. Abstração sem necessidade também é custo." 😅
= 🐘 Métodos da interface: 30
= 🧩 Depois do I: `LeitorDeUsuario` (1) e `RedefinidorDeSenha` (1)
= 🔌 Depois do D: a regra depende de `Repositorio`, não do MySQL

## 💻 Traduzindo pro código
```ts
interface MeioDePagamento { cobrar(valor: Money): Promise<Recibo>; }      // 🚪 O + 🔌 D
class Pix implements MeioDePagamento { /* ... */ }
class Cartao implements MeioDePagamento { /* ... */ }                     // nova forma = nova classe

class Checkout {
  constructor(private readonly meios: Map<string, MeioDePagamento>) {}   // depende da abstração
  pagar(tipo: string, valor: Money) { return this.meios.get(tipo)!.cobrar(valor); }
}

interface LeitorDeUsuario { buscarNome(id: string): Promise<string>; }   // 🧩 I: pequena e por papel
```

| Letra | Em uma frase | Sintoma de que falta |
| --- | --- | --- |
| S | Um motivo para mudar | Classe que mexe em tudo |
| O | Estender sem editar | `if/else` por tipo crescendo |
| L | Honrar o contrato | Subclasse que lança "não suportado" |
| I | Interfaces pequenas | Classe implementando método que não usa |
| D | Regra depende de abstração | Regra que importa o driver do banco |

## 🎤 Pra entrevista
"SOLID ataca acoplamento: SRP é ter um motivo para mudar; OCP é estender sem editar o que funciona; LSP é a subclasse honrar o contrato; ISP é ter interfaces pequenas por papel; DIP é a regra de negócio depender de abstração, não de detalhe. É ferramenta, não dogma: abstração sem necessidade também é custo."
