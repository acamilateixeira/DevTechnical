# 🍳 O restaurante do Next.js

> A Bia abriu a página. Tem cinco cozinheiros no Next.js e cada um entrega a página de um jeito.

## 🎭 Elenco
- 🙋 **Bia** · o navegador · quer ver a página AGORA
- 🧱 **Kit pra montar em casa** · CSR (client-side rendering) · manda uma caixa vazia e o manual (o JavaScript); o navegador monta
- 🍳 **Prato feito na hora** · SSR (`dynamic`, `cache: 'no-store'`) · prepara o HTML no servidor A CADA pedido
- 🥪 **Marmita pronta** · SSG (gerado no build) · tudo pronto antes; sai na hora pela CDN
- 🔄 **Marmita que se renova** · ISR (`revalidate`) · a marmita, mas de tempos em tempos prepara uma nova em segundo plano
- 🧑‍🍳 **Chef de cozinha** · React Server Components · cozinha no servidor, busca dado lá mesmo e não manda JavaScript pro navegador
- 🎛️ **Garçom interativo** · `'use client'` · os pedaços com botão, estado e evento
- 💧 **Eletricista** · hydration · liga os botões (os eventos) no HTML que veio pronto do servidor
- ⏰ **Relógio desencontrado** · `Date.now()` no render · dá um valor no servidor e outro no navegador

## 🎬 Cena 1 · Os cinco cozinheiros
**Bia**: "Quero ver a página!"
**Kit pra montar em casa**: "Te mando a caixa vazia e o manual. Monta aí." _(tela branca até terminar)_ 🧱
**Bia**: "Tô olhando pro nada há 3 segundos…"
**Prato feito na hora**: "Eu preparo o HTML no servidor pra cada pedido. Sempre fresquinho, mas dá trabalho toda vez." 🍳
**Marmita pronta**: "Eu deixei tudo pronto no build. Sai na hora, mas se o conteúdo mudar, só no próximo build." 🥪
**Marmita que se renova**: "Eu sou a marmita, mas a cada tanto tempo faço uma nova sem ninguém esperar." 🔄
= 🧱 CSR: HTML vazio + JS; tela branca até montar
= 🍳 SSR: HTML pronto a cada pedido
= 🥪 SSG: HTML pronto no build, servido pela CDN
= 🔄 ISR: SSG refeito a cada `revalidate` segundos

## 🎬 Cena 2 · O chef
**Chef de cozinha**: "Eu cozinho no servidor, busco o dado direto do banco e não mando nem uma linha de JavaScript pro navegador." 🧑‍🍳
**Garçom interativo**: "E só os pedaços com botão vão comigo, marcados com `'use client'`." 🎛️
**Eletricista**: "Chegou o HTML pronto? Eu passo ligando os botões nele." 💧
= 🧑‍🍳 Server Components: dados buscados no servidor; 0 KB de JS no cliente
= 🎛️ Client Components: só os botões, com `'use client'`
= 💧 Hydration: liga os eventos no HTML que já veio pronto

## 🎬 Cena 3 · O relógio desencontrado
**Relógio desencontrado**: "No servidor eu era 10:00:00. No navegador, 10:00:01…" ⏰
**Eletricista**: "O HTML não bate com o que eu esperava! ERRO DE HYDRATION!" 💥
**Chef de cozinha**: "Coloca a hora num `useEffect`, que só roda no navegador, e acabou a briga."
= ⏰ HTML do servidor: 10:00:00
= ⏰ Primeiro render no navegador: 10:00:01
= 💥 Resultado: erro de hydration
= ✅ Correção: hora dentro do `useEffect`

## 💻 Traduzindo pro código
```tsx
// 🧑‍🍳 Server Component (padrão no App Router): busca no servidor, zero JS no cliente
export default async function TripsPage() {
  const trips = await db.trip.findMany();
  return <TripList trips={trips} />;
}

// 🔄 ISR: refaz no máximo a cada 60 s
export const revalidate = 60;
// 🍳 SSR: sempre na hora
export const dynamic = 'force-dynamic';

// 🎛️ só a parte interativa vai pro cliente
'use client';
export function ApproveButton({ id }: { id: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);           // ⏰ hora só no navegador: sem erro de hydration
  return <button onClick={() => approve(id)}>Aprovar</button>;
}
```

| Página | Estratégia |
| --- | --- |
| Pública e estável (blog, landing) | SSG / ISR |
| Personalizada por usuário | SSR ou Server Component dinâmico |
| App logado muito interativo | Server Components no esqueleto + client components nas partes interativas |

## 🎤 Pra entrevista
"Página pública e estável vai com SSG ou ISR; personalizada por usuário, com SSR ou Server Component dinâmico; app logado muito interativo, com Server Components no esqueleto e client components só nas partes interativas, para mandar menos JavaScript. Hydration é ligar os eventos no HTML do servidor; erro de hydration é o HTML do servidor diferente do primeiro render no cliente."
