# 🛋️ A vida de uma compra no cartão da loja

> A Dona Cida foi na loja de móveis e se apaixonou por um sofá de R$2000. Ela tem o cartão da loja.

## 🎭 Elenco
- 👵 **Dona Cida** · a portadora do cartão · decidida, até mudar de ideia
- 📟 **Maquininha** · o terminal (POS) · pergunta pro emissor se pode
- 🏦 **Emissor** · quem emitiu o cartão (o papel da Brasil Card) · decide se aprova e cuida do limite e da fatura
- 🔒 **Reserva** · autorização · segura o valor no limite; ainda não é dívida
- ✅ **Confirmação** · captura · a venda se confirma e vira lançamento na fatura
- ↩️ **Devolução** · estorno · um lançamento NOVO de crédito, nunca apagar a compra
- 📅 **Fechamento** · ciclo da fatura · junta compras, parcelas, juros e estornos do mês
- 💸 **Pagamento** · a Dona Cida pagando a fatura · abate o saldo e devolve o limite
- ⚖️ **Contestação** · chargeback · "não reconheço essa compra"
- 🔍 **Conferente** · conciliação · todo dia compara o sistema com os arquivos da processadora e do banco

- 🏬 **Loja** · o lojista · confirma a venda
- 👴 **Seu Zé** · outro portador · não reconhece uma compra
- 👯 **Duas compras ao mesmo tempo** · transações simultâneas · disputando o mesmo limite
- 🗄️ **Banco** · o banco de dados · trava o limite
## 🎬 Cena 1 · A compra
**Dona Cida**: "Vou levar esse sofá no cartão da loja, minha filha!" 🛋️
**Maquininha**: "Emissor, posso?"
**Emissor**: "Cartão válido, senha certa, antifraude tranquilo, limite de R$3000… AUTORIZADO. Seguro R$2000 do limite." 🔒
**Reserva**: "Por enquanto eu só seguro, ainda não é dívida."
**Loja**: "Venda confirmada!"
**Confirmação**: "Agora sim, virou lançamento na fatura." ✅
**Reserva** _(esquecida, em outra loja)_: "E se o lojista nunca me confirmar?"
**Emissor**: "Depois de uns dias você expira e o limite volta, meu bem." ⏳
= 💳 Limite total: R$3000
= 🔒 Reservado (autorizado): R$0 (já capturado)
= 🧾 Na fatura: compra R$2000
= 💳 Limite disponível: R$1000

## 🎬 Cena 2 · O arrependimento
**Dona Cida** _(uma semana depois)_: "O sofá não passou na porta. Desisti!"
**Devolução**: "Não apago a compra! Crio um lançamento NOVO de R$2000 de crédito. A história fica toda registradinha." ↩️
**Fechamento**: "Dia 10 eu fecho: junto compras, parcelas, juros e devoluções do ciclo." 📅
**Pagamento**: "Dona Cida pagou? Abato o saldo e devolvo o limite." 💸
= 🧾 Lançamentos: compra +R$2000 · estorno −R$2000
= 📅 Saldo da fatura: R$0
= 💳 Limite disponível: R$3000 (voltou)

## 🎬 Cena 3 · Os perrengues
**Seu Zé**: "Não reconheço essa compra de R$900 em Fortaleza!"
**Contestação**: "Estorno provisório e o lojista pode contestar com o comprovante." ⚖️
**Conferente** _(7h da manhã, com café)_: "O que o sistema registrou bate com o arquivo da processadora e do banco? Diferença de R$12? Investigar!" 🔍
**Duas compras ao mesmo tempo** _(limite só pra uma)_: "Quem ganha?"
**Banco**: "Transação com trava no limite: a segunda espera e é recusada." 🔒
= ⚖️ Chargeback do Seu Zé: crédito provisório de R$900; lojista pode contestar
= 🔍 Conciliação: diferença de R$12 aberta para investigar
= 🔒 Duas compras ao mesmo tempo: 1 autorizada, 1 negada (trava no limite)

## 💻 Traduzindo pro código
```sql
-- livro-razão imutável: nada se apaga, tudo é lançamento novo (em centavos)
CREATE TABLE lancamentos (
  id BIGINT PRIMARY KEY,
  cartao_id BIGINT NOT NULL,
  tipo VARCHAR(20) NOT NULL,        -- COMPRA, ESTORNO, PAGAMENTO, JUROS, CHARGEBACK
  valor_centavos BIGINT NOT NULL,   -- positivo = débito, negativo = crédito
  idempotency_key VARCHAR(64) UNIQUE,
  criado_em TIMESTAMP NOT NULL
);

-- 🔒 autorização: reserva o limite sem estourar, mesmo com duas compras simultâneas
UPDATE cartoes SET limite_disponivel = limite_disponivel - 200000
WHERE id = :id AND limite_disponivel >= 200000;   -- 0 linhas = negado
```

| Etapa | O que acontece com o limite | O que vai pra fatura |
| --- | --- | --- |
| Autorização | Reserva | Nada ainda |
| Captura | Continua usado | Compra |
| Estorno | Volta | Crédito (lançamento novo) |
| Pagamento | Volta | Pagamento |
| Chargeback | Volta (provisório) | Crédito provisório |

Nunca guardar número completo do cartão nem CVV (PCI DSS).

## 🎤 Pra entrevista
"Autorização reserva limite; captura confirma; estorno e chargeback são novos lançamentos, nunca exclusões; a fatura junta o ciclo e o pagamento devolve o limite; a conciliação diária confere tudo com a processadora e o banco. Modelo como um livro-razão imutável em centavos, com idempotência, máquina de estados, trava no limite e sem guardar PAN ou CVV."
