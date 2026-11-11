# 📮 A viagem aprovada que ninguém ficou sabendo

> O João pediu uma viagem a trabalho. A gestora aprovou. Agora alguém precisa mandar o e-mail avisando.

## 🎭 Elenco
- 🖥️ **API** · `aprovarViagem()` · quem aprova e salva no banco
- 🗄️ **Banco** · `db.viagens` · onde a aprovação fica gravada
- 🐰 **Coelho** · RabbitMQ · `rabbit.publish()` · o carteiro que leva o recado pros outros serviços
- 📝 **Bilhetinho** · linha na tabela `outbox` · o recado "avisar: viagem aprovada", salvo junto com a aprovação
- 🚴 **Relay** · `relay()` · o motoboy que passa de tempos em tempos, pega os bilhetinhos e entrega pro Coelho
- 📧 **E-mail** · o consumidor da fila · manda o e-mail pro João
- 🛑 **Dedupe** · tabela de mensagens já processadas · lembra quais recados já foram atendidos
- 💥 **Queda** · `talvezCair()` · o servidor caindo na pior hora possível

- 🧳 **João** · quem pediu a viagem · só quer o e-mail
## 🎬 Cena 1 · Gravar e avisar separado
**API**: "Aprovei! Salvei no banco. COMMIT! ✅ Agora vou chamar o Coelho…"
**Queda**: 💥
**Banco**: "Aqui tá APROVADA, bonitinha."
**Coelho**: "Aprovada? Ninguém me falou nada, não."
**E-mail**: "Então não mando nada."
**João**: "Minha viagem foi aprovada há três dias e EU DESCOBRI PELO CRACHÁ DO AEROPORTO?!" 😤
> 🚨 O banco e o carteiro não combinam entre si: dual write.
= 🗄️ Banco: viagem APROVADA
= 🐰 RabbitMQ: nenhuma mensagem ❌
= 📧 E-mails enviados: 0 ❌

## 🎬 Cena 2 · Com bilhetinho
**API**: "Agora, na MESMA transação, eu salvo a aprovação E um bilhetinho na outbox. Ou vão os dois, ou nenhum." 📝
**Queda**: 💥 _(caiu de novo, logo depois do commit)_
**Relay** _(passando de moto)_: "Opa, bilhetinho não entregue! Leva, Coelho!" 📮
**E-mail**: "Recebi! Mandei o e-mail pro João." 📧
**João**: "Agora sim! Partiu Floripa!" ✈️
= 🗄️ Banco: viagem APROVADA + bilhetinho na outbox (mesma transação)
= 🚴 Relay: achou 1 bilhetinho e publicou
= 📧 E-mails enviados: 1 ✅
= 📝 Bilhetinho: publicado, marcado com `publicadoEm`

## 🎬 Cena 3 · O motoboy esquecido
**Relay**: "Agora deixa eu marcar o bilhetinho como entregue e—"
**Queda**: 💥
**Relay** _(reiniciado, sem lembrar de nada)_: "Bilhetinho não marcado? ENTREGA DE NOVO!" 📮
**E-mail** _(sem dedupe)_: "Recebi de novo! Mandei de novo!" 📧📧
**João**: "Por que eu recebi dois e-mails? Foram duas viagens? Oba!"
**Dedupe**: "Calma, João. Esse ID de recado já foi atendido. Ignoro o repetido." 🛑
= 📝 Bilhetinho: publicado, mas NÃO marcado (caiu antes)
= 🐰 Mensagens publicadas: 2 (o relay reenviou)
= 📧 E-mails sem dedupe: 2 ❌
= 🛑 E-mails com dedupe: 1 ✅ (o ID repetido foi ignorado)

## 💻 Traduzindo pro código
```js
// ❌ dual write: se cair entre as duas linhas, o evento some
await db.transacao(() => { viagem.status = 'APROVADA'; });
await rabbit.publish(evento);

// ✅ outbox: dado + bilhetinho na MESMA transação
await db.transacao(() => {
  viagem.status = 'APROVADA';
  db.outbox.push({ ...evento, publicadoEm: null });    // 📝
});

// 🚴 relay (outro processo): publica e só depois marca
for (const msg of pendentes) { await rabbit.publish(msg); msg.publicadoEm = Date.now(); }

// 🛑 consumidor idempotente
if (jaProcessadas.has(msg.id)) return;                 // repetida: ignora
```

| `MODO` + `QUEDA` no lab | Resultado |
| --- | --- |
| `dual-write` + `depois-do-commit` | Aprovada, nenhum e-mail |
| `outbox` + `depois-do-commit` | 1 e-mail |
| `outbox` + `depois-de-publicar` | 2 e-mails (sem dedupe) |
| o mesmo + `DEDUPE = true` | 1 e-mail |

## 🎤 Pra entrevista
"Banco e fila não participam da mesma transação, então gravar num e publicar no outro é um dual write que perde eventos. Com o padrão outbox, gravo o evento numa tabela na mesma transação do dado e um relay (ou CDC, como o Debezium) publica depois. Isso garante at-least-once: a mensagem pode chegar repetida, então o consumidor precisa ser idempotente, deduplicando pelo ID."
