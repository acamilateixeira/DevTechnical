# 🐌 O primo lerdo que atrasa a família toda

> A API vai buscar ofertas de crédito em três bancos parceiros. Dois são rapidinhos. O terceiro… é o Beta.

## 🎭 Elenco
- 🖥️ **API** · `Promise.allSettled([...])` · quem pergunta pros três ao mesmo tempo e monta a resposta
- ⚡ **Alpha** · provedor rápido · responde em 100ms
- ⚡ **Gamma** · provedor rápido · responde em 150ms
- 🐌 **Beta** · provedor lento e instável · demora segundos e às vezes devolve erro 500
- ⏱️ **Cronômetro** · `TIMEOUT_MS = 400` · o tempo máximo que a API espera cada um
- 🔌 **Disjuntor** · `CircuitBreaker` · depois de falhas seguidas, para de chamar o Beta por um tempo
- 👩 **Bia** · a usuária · quem fica olhando a tela carregar

## 🎬 Cena 1 · Esperando todo mundo
**API**: "Bora ver ofertas! Liguei pros três ao mesmo tempo." 📞📞📞
**Alpha**: "Toma, 100ms!" ⚡
**Gamma**: "Toma, 150ms!" ⚡
**Beta**: "Hmmm… deixa eu ver… peraí, tô procurando o óculos… 3 segundos… e… erro 500." 🐌💥
**Bia**: "TRÊS SEGUNDOS PRA ISSO?! Vou no concorrente!" 😤
> 🚨 A tela é tão lenta quanto o mais lento da turma.
= 📞 Provedores chamados: Alpha, Gamma e Beta, em paralelo
= ⏱️ Tempo da resposta: ~3 s (espera o mais lento) ❌
= 📦 Ofertas devolvidas: 2 (o Beta deu erro 500)

## 🎬 Cena 2 · Com cronômetro
**Cronômetro**: "Cada um tem 400ms. Passou disso, a gente segue sem você."
**Beta**: "Mas eu ia—"
**Cronômetro**: "TEMPO! ⏱️"
**API**: "Respondo com Alpha e Gamma e aviso que o Beta não veio." ✂️
**Bia**: "Duas ofertas em meio segundo? Tá ótimo."
= ⏱️ Timeout por provedor: 400ms
= ⏱️ Tempo da resposta: ~400ms ✅
= ✂️ Resposta: parcial: Alpha e Gamma, Beta marcado como falha

## 🎬 Cena 3 · Com disjuntor
**Disjuntor**: "Beta falhou duas vezes seguidas? DESARMEI. Por 1,5 s ninguém liga pro Beta: eu já respondo 'indisponível' na hora, sem gastar os 400ms." 🔌
**Bia**: "Ficou rapidinho de novo!" ⚡
**Disjuntor** _(1,5 s depois, desconfiado)_: "Vou deixar passar UMA ligação de teste pro Beta…"
**Beta**: "Voltei! Oferta em 120ms, novinho em folha!"
**Disjuntor**: "Tá bom, tá perdoado. Religado." ✅
= 🔌 Disjuntor do Beta: ABERTO por 1,5 s (2 falhas seguidas)
= 🚫 Chamadas evitadas: todas no período aberto
= ⏱️ Tempo da resposta: ~150ms (nem espera o timeout) ✅
= 🔁 Depois: meio-aberto: 1 chamada de teste deu certo → FECHADO

## 💻 Traduzindo pro código
```js
const comTimeout = (p, ms) => Promise.race([p, sleep(ms).then(() => { throw new Error('timeout'); })]);

const resultados = await Promise.allSettled([                 // 📞 os três ao mesmo tempo
  comTimeout(alpha(), TIMEOUT_MS),
  comTimeout(gamma(), TIMEOUT_MS),
  breakerBeta.chamar(() => comTimeout(beta(), TIMEOUT_MS)),   // 🔌 aberto? falha na hora
]);
const ofertas = resultados.filter((r) => r.status === 'fulfilled'); // ✂️ resposta parcial
```

| Estado do disjuntor | O que acontece |
| --- | --- |
| Fechado | Chama normalmente e conta as falhas |
| Aberto | Não chama; falha na hora |
| Meio-aberto | Deixa passar 1 chamada de teste; se der certo, fecha |

Retry só em operação idempotente, com backoff e jitter, senão você vira o próprio estouro da boiada no provedor que já está mal.

## 🎤 Pra entrevista
"Uma dependência lenta não pode derrubar tudo. Chamo as dependências em paralelo com timeout por dependência, devolvo resposta parcial quando faz sentido, faço retry só em operação idempotente com backoff exponencial e jitter, e uso circuit breaker para parar de chamar quem está falhando e testar a volta aos poucos (half-open)."
