# 📦 A encomenda sem etiqueta

> Chegou um pacote da API na portaria do TypeScript. Ninguém sabe o que tem dentro.

## 🎭 Elenco
- 📦 **Pacote** · `await res.json()` · o dado que veio de fora: pode ser qualquer coisa
- 😎 **Porteiro largado** · `any` · deixa entrar e usar de qualquer jeito, sem conferir nada
- 🕵️ **Porteira desconfiada** · `unknown` · deixa entrar, mas só deixa usar depois de conferir o que é
- 🔍 **Conferência** · `typeof x === 'string'` (narrowing) · o jeito de provar o tipo antes de usar
- 🧪 **Zod** · `schema.parse(dado)` · o raio-X: confere um objeto grande campo por campo, em tempo de execução
- 🚫 **Impossível** · `never` · o tipo que nenhum valor pode ter: denuncia o caso esquecido
- 🆕 **'cancelada'** · novo valor na union `Status` · o status novo que ninguém tratou

- 🟦 **TypeScript** · o compilador · confere os tipos antes de rodar
- 👨‍💻 **Dev** · quem escreveu o código
## 🎬 Cena 1 · O porteiro largado
**Pacote**: "Oi, gente! Nem eu sei o que eu sou."
**Porteiro largado**: "Relaxa, comigo você pode ser TUDO! Quer `.toUpperCase()`? Manda! Se quebrar, quebra em produção, às 3 da manhã, problema de quem tá de plantão." 😎
**TypeScript** _(tapando os olhos)_: "Com o `any` eu não vejo nada, não sei de nada." 🙈
> 🚨 `any` desliga a checagem: o erro só aparece em produção.

## 🎬 Cena 2 · A porteira desconfiada
**Porteira desconfiada**: "Pode entrar, meu bem, mas USAR só depois de eu conferir."
**Conferência**: "É string? Então pode usar como string."
**Zod**: "E se for um objetão, deixa comigo que eu passo no raio-X campo por campo." 🧪
**Pacote**: "Que chique, me senti num aeroporto."

## 🎬 Cena 3 · O status esquecido
**'cancelada'**: "Oi, sou o status novo! Cheguei no `switch`…"
**Impossível**: "Ninguém te tratou? Então você caiu em mim, e em mim NADA pode cair. BUILD QUEBRADO! Vai lá tratar ela!" 🚨
**Dev**: "Ainda bem que quebrou aqui e não no cliente." 😮‍💨

## 💻 Traduzindo pro código
```ts
const dado: unknown = await res.json();              // 📦 + 🕵️
if (typeof dado === 'string') dado.toUpperCase();    // 🔍 só depois de conferir

const Trip = z.object({ id: z.string(), status: z.enum(['aberta', 'aprovada', 'cancelada']) });
const trip = Trip.parse(dado);                        // 🧪 valida em runtime

function rotulo(s: Status) {
  switch (s) {
    case 'aberta': return 'Aberta';
    case 'aprovada': return 'Aprovada';
    default: { const nuncaAcontece: never = s; return nuncaAcontece; } // 🚫 'cancelada' quebra o build aqui
  }
}
```

| Tipo | Aceita | Deixa usar sem conferir? |
| --- | --- | --- |
| `any` | Tudo | Sim (perigoso) |
| `unknown` | Tudo | Não: obriga a estreitar |
| `never` | Nada | Serve para provar que todos os casos foram tratados |

## 🎤 Pra entrevista
"`any` desliga a checagem; `unknown` aceita qualquer valor mas obriga a estreitar o tipo antes de usar, por isso é o certo para dados de fora; `never` é o tipo impossível, usado para garantir que todos os casos de uma union foram tratados. Como tipos não existem em runtime, dado externo eu valido com Zod."
