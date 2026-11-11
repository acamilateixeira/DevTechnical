# 🚚 Deploy na sexta? Pode, se for assim

> A dev abriu um PR com uma mudança no checkout. Entre o PR e o cliente tem uma linha de montagem inteira.

## 🎭 Elenco
- 👩‍💻 **Dev** · quem abriu o PR · louca pra ver no ar
- 🤖 **Fiscal da esteira** · CI (GitHub Actions) · roda lint, tipos, testes, build e varreduras em todo PR
- 👀 **Revisora** · code review · mais um par de olhos
- 📀 **Caixa lacrada** · imagem Docker imutável, com a tag do commit · a MESMA vai pra homologação e produção
- 🗄️ **Migração educada** · migration compatível (expand/contract) · funciona com a versão velha e a nova ao mesmo tempo
- 🎚️ **Interruptor** · feature flag · o código está em produção, mas desligado
- 🐤 **Canarinho** · canary release · a versão nova recebendo só 5% do tráfego
- ⏪ **Botão de voltar** · rollback automático · volta pra versão anterior se a métrica piorar
- 📊 **Boletim** · métricas DORA · mostra se o time está melhorando

- 🏭 **Esteira** · o pipeline inteiro (CI + CD) · a linha de montagem do PR até produção
## 🎬 Cena 1 · A esteira
**Dev**: "Abri o PR!"
**Fiscal da esteira**: "Lint ✅, tipos ✅, testes ✅, build ✅, procurei senha vazada ✅, dependência com falha ✅. Pode revisar." 🤖
**Revisora**: "Aprovado, mas renomeia essa variável `x2`, pelo amor." 👀
**Caixa lacrada**: "Fui construída UMA vez, com a etiqueta do commit. A mesma caixa vai pra homologação e depois pra produção. Nada de recompilar no caminho." 📀
= 🤖 CI: lint ✅ · tipos ✅ · testes ✅ · build ✅ · scans ✅
= 📀 Imagem: `app:3f9c2e1` (tag = commit)
= 🌍 Onde está: homologação

## 🎬 Cena 2 · Entrando no ar sem susto
**Migração educada**: "Eu sou compatível com a versão velha e a nova, porque durante o deploy as duas rodam juntas." 🗄️
**Interruptor**: "O código novo tá lá, mas DESLIGADO. Ligo pra 1% dos usuários primeiro." 🎚️
**Canarinho**: "Eu sou a versão nova pegando 5% do tráfego. Se a taxa de erro subir…" 🐤
**Botão de voltar**: "…eu volto pra versão anterior sozinho, em segundos." ⏪
= 🗄️ Migration: expand: coluna nova opcional, a velha continua
= 🎚️ Feature flag: ligada para 1%
= 🐤 Canary: 5% do tráfego na versão nova
= ⏪ Rollback automático: se o erro passar de 1%

## 🎬 Cena 3 · A pergunta proibida
**Dev**: "Então posso fazer deploy na sexta às 17h?" 😏
**Esteira**: "Com deploy pequeno, interruptor, canarinho e botão de voltar testado… pode. O medo vem de deploy gigante e sem volta."
**Boletim**: "E eu conto se vocês estão melhorando: quantas vezes publicam, quanto demora do commit ao ar, quantas mudanças dão problema e quanto demora pra consertar." 📊
= 📊 Frequência de deploy: várias vezes por dia
= ⏱️ Lead time: horas
= 💥 Taxa de falha: baixa (deploys pequenos)
= ♻️ Tempo de recuperação: minutos (rollback)

## 💻 Traduzindo pro código
```yaml
# .github/workflows/ci.yml
on: [pull_request]
jobs:
  ci:                                      # 🤖
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run lint && npm run typecheck && npm test
      - run: docker build -t app:${{ github.sha }} .   # 📀 tag = commit
```
```ts
if (flags.isEnabled('novo-checkout', { userId })) return novoCheckout(); // 🎚️
```

| Métrica DORA | Pergunta |
| --- | --- |
| Frequência de deploy | Quantas vezes publicamos? |
| Lead time | Quanto demora do commit à produção? |
| Taxa de falha | Quantos deploys dão problema? |
| Tempo de recuperação | Quanto demora para voltar ao normal? |

## 🎤 Pra entrevista
"CI rápido em todo PR com lint, tipos, testes, build e varreduras; uma imagem imutável promovida entre ambientes; migrations compatíveis com expand/contract; feature flags separando deploy de release; canary com rollback automático por métrica. Deploy sem medo é diminuir o raio de explosão e o tempo de recuperação, medido pelas métricas DORA."
