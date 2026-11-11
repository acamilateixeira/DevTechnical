# 🗺️ Cada um fala a sua língua

> Uma empresa de transporte corporativo. O pessoal do negócio fala uma coisa, o código diz outra, e ninguém se entende.

## 🎭 Elenco
- 👷‍♀️ **Especialista** · a pessoa do negócio · sabe como o trabalho funciona de verdade
- 🤷 **Código antigo** · classes `Order` e `Job` · nomes que ninguém do negócio usa
- 🗣️ **Dicionário** · linguagem ubíqua · as MESMAS palavras no negócio e no código
- 🗺️ **Territórios** · bounded contexts (Vendas, Faturamento) · cada área com o seu modelo e o seu significado
- 💰 **Dinheiro** · value object `Money(100, 'BRL')` · sem ID, definido pelo valor, imutável
- 👑 **Rainha** · agregado `Viagem` (a raiz) · ninguém muda nada dela por fora; protege as regras
- 📣 **Fofoqueiro** · evento de domínio `ViagemAprovada` · avisa que algo importante aconteceu
- 😴 **CRUD** · um cadastro simples · não precisa de nada disso

- 💼 **Vendas** · bounded context de Vendas · cliente = lead
- 🧾 **Faturamento** · bounded context de Faturamento · cliente = CNPJ e imposto
- 👨‍💻 **Dev** · quem escreve o código
- 🧭 **DDD** · Domain-Driven Design · a abordagem toda
## 🎬 Cena 1 · Ninguém se entende
**Especialista**: "O solicitante abre uma solicitação; o despacho faz a atribuição de um motorista."
**Código antigo**: "Aqui é tudo `Order` e `Job`, ué." 🤷
**Dicionário**: "Então o código fala outra língua! Usa as MESMAS palavras: `Solicitacao`, `Atribuicao`." 🗣️
= 🗣️ No negócio: Solicitação, Atribuição
= 🤷 No código antes: `Order`, `Job`
= ✅ No código depois: `Solicitacao`, `Atribuicao`

## 🎬 Cena 2 · O que é um cliente?
**Vendas**: "Cliente pra mim é um lead com oportunidade."
**Faturamento**: "Pra mim é CNPJ, endereço fiscal e imposto."
**Territórios**: "Os dois têm razão, cada um no seu pedaço do mapa. Na fronteira a gente traduz." 🗺️
= 🗺️ Bounded contexts: Vendas e Faturamento
= 💼 "Cliente" em Vendas: lead com oportunidade
= 🧾 "Cliente" em Faturamento: CNPJ, endereço fiscal, impostos

## 🎬 Cena 3 · As regras do reino
**Dinheiro**: "Não tenho documento. Sou o que valho, não mudo, e não deixo ninguém me criar negativo." 💰
**Dev**: "Vou mudar o status da viagem direto na tabela…"
**Rainha**: "NO MEU REINO NÃO! Quer aprovar? Fala comigo: `viagem.aprovar()`. Eu confiro se pode." 👑
**Fofoqueiro**: "APROVOU! Quem se interessar, e-mail, ERP, que reaja!" 📣
**CRUD** _(bocejando)_: "E eu, preciso de rainha, fofoqueiro e território?"
**DDD**: "Não, querido. Eu valho a pena onde o domínio é complicado." 😅
= 💰 `Money`: imutável, sem ID, nunca negativo
= 👑 Status da `Viagem`: PENDENTE → APROVADA (só por `aprovar()`)
= 📣 Eventos publicados: `ViagemAprovada`

## 💻 Traduzindo pro código
```ts
class Money {                                          // 💰 value object
  private constructor(readonly centavos: number, readonly moeda: 'BRL') {}
  static of(centavos: number) { if (centavos < 0) throw new Error('negativo'); return new Money(centavos, 'BRL'); }
}

class Viagem {                                         // 👑 raiz do agregado
  private status: 'PENDENTE' | 'APROVADA' = 'PENDENTE';
  private eventos: DomainEvent[] = [];
  aprovar(por: Gestor) {
    if (this.status !== 'PENDENTE') throw new Error('só pendente pode ser aprovada');
    this.status = 'APROVADA';
    this.eventos.push(new ViagemAprovada(this.id, por.id)); // 📣
  }
}
```

| Conceito | Em uma frase |
| --- | --- |
| Linguagem ubíqua | As mesmas palavras no negócio e no código |
| Bounded context | Um território onde cada palavra tem um significado só |
| Entidade | Tem identidade (ID) e muda ao longo do tempo |
| Value object | Definido pelo valor, imutável |
| Agregado | Grupo alterado só pela raiz, que protege as regras |
| Evento de domínio | Algo importante que aconteceu, no passado |

## 🎤 Pra entrevista
"DDD é desenhar o código pelo domínio: linguagem ubíqua, bounded contexts com tradução nas fronteiras, agregados que protegem as invariantes e só mudam pela raiz, value objects imutáveis e eventos de domínio para avisar outros contextos. Vale para domínios complexos; para CRUD simples é cerimônia demais."
