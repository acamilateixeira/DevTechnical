// OUTBOX: como garantir que "salvei no banco" SEMPRE vira "avisei os outros serviços".
// Combine MODO e QUEDA e observe os contadores "E-mails enviados" e o status final.
//
// Cenários para testar:
//   dual-write + depois-do-commit   → viagem aprovada, mas ninguém fica sabendo (evento perdido)
//   outbox     + depois-do-commit   → o relay publica depois: nada se perde
//   outbox     + depois-de-publicar → mensagem sai 2x; com DEDUPE=false, 2 e-mails
//   outbox     + depois-de-publicar + DEDUPE=true → 1 e-mail só

const MODO = 'dual-write';         // 'dual-write' | 'outbox'
const QUEDA = 'depois-do-commit';    // 'nenhuma' | 'depois-do-commit' | 'depois-de-publicar'
const DEDUPE = false;              // o consumidor ignora mensagens repetidas?

// ---------- API: aprovar viagem ----------
async function aprovarViagem(id) {
  const evento = { id: uuid(), tipo: 'viagem.aprovada', payload: { viagemId: id } };

  if (MODO === 'dual-write') {
    await db.transacao('API', async () => { db.viagens[id].status = 'APROVADA'; });
    talvezCair('depois-do-commit', 'API');
    await rabbit.publish(evento);              // se cair antes daqui, o evento some
  } else {
    await db.transacao('API', async () => {
      db.viagens[id].status = 'APROVADA';
      db.outbox.push({ ...evento, publicadoEm: null }); // MESMA transação
      trace('API', 'INSERT na outbox');
    });
    talvezCair('depois-do-commit', 'API');
  }
  trace('API', '200 OK para o usuário', 'good');
}

// ---------- Relay: lê a outbox e publica (processo separado) ----------
async function relay() {
  for (const msg of db.outbox.filter((m) => !m.publicadoEm)) {
    trace('Relay', `publicando ${msg.id.slice(0, 8)}`);
    await rabbit.publish(msg);
    talvezCair('depois-de-publicar', 'Relay');  // caiu antes de marcar como publicado
    msg.publicadoEm = Date.now();
    trace('Relay', 'marcou como publicado');
  }
}

// ---------- Consumidor: envia o e-mail para o solicitante ----------
rabbit.consume(async (msg) => {
  if (DEDUPE) {
    if (db.processadas.has(msg.id)) { trace('Consumidor', `já processei ${msg.id.slice(0, 8)}: ignora`, 'good'); return; }
    db.processadas.add(msg.id);   // na vida real: INSERT com constraint UNIQUE(message_id)
  }
  stat.inc('E-mails enviados');
  trace('Consumidor', `📧 e-mail "viagem aprovada" (msg ${msg.id.slice(0, 8)})`, stat.get('E-mails enviados') > 1 ? 'bad' : 'good');
});

export async function run() {
  stat('E-mails enviados', 0);
  try { await aprovarViagem('v1'); } catch (e) { log(e.message); }

  if (MODO === 'outbox') {
    for (let ciclo = 1; ciclo <= 3; ciclo++) {   // o relay roda de tempos em tempos (e reinicia se cair)
      await sleep(150);
      try { await relay(); } catch (e) { log(e.message, '→ o relay reinicia no próximo ciclo'); }
    }
  }
  await sleep(200);
  stat('Status da viagem no banco', db.viagens.v1.status);
  log(`Viagem: ${db.viagens.v1.status}. E-mails enviados: ${stat.get('E-mails enviados')} (o certo é 1).`);
}
