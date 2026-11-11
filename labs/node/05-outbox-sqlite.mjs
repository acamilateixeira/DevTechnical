// LAB NODE 05: Outbox com banco de verdade (SQLite embutido no Node 22+)
// Rode:  node labs/node/05-outbox-sqlite.mjs
//        node labs/node/05-outbox-sqlite.mjs --cair-relay   (relay cai depois de publicar)
//        node labs/node/05-outbox-sqlite.mjs --cair-relay --sem-dedupe
//
// Aqui as garantias vêm do BANCO, como em produção:
//   - a mudança de status e o evento são gravados na MESMA transação (BEGIN/COMMIT)
//   - o consumidor deduplica com uma constraint UNIQUE (INSERT falha se já processou)

import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

const cairRelay = process.argv.includes('--cair-relay');
const dedupe = !process.argv.includes('--sem-dedupe');

const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE viagens (id TEXT PRIMARY KEY, status TEXT NOT NULL);
  CREATE TABLE outbox (id TEXT PRIMARY KEY, tipo TEXT, payload TEXT, publicado_em TEXT);
  CREATE TABLE mensagens_processadas (message_id TEXT PRIMARY KEY);  -- UNIQUE por ser PK
  INSERT INTO viagens VALUES ('v1', 'PENDENTE');
`);

// ---------- API ----------
function aprovarViagem(id) {
  db.exec('BEGIN');
  try {
    const r = db.prepare("UPDATE viagens SET status = 'APROVADA' WHERE id = ? AND status = 'PENDENTE'").run(id);
    if (r.changes !== 1) throw new Error('viagem não está pendente');
    db.prepare('INSERT INTO outbox (id, tipo, payload) VALUES (?, ?, ?)')
      .run(randomUUID(), 'viagem.aprovada', JSON.stringify({ viagemId: id }));
    db.exec('COMMIT');
    console.log('[API]        COMMIT: viagem APROVADA + evento na outbox (mesma transação)');
  } catch (e) {
    db.exec('ROLLBACK');
    console.log('[API]        ROLLBACK:', e.message);
  }
}

// ---------- "RabbitMQ" ----------
const fila = [];
const publicar = (msg) => { fila.push(msg); console.log(`[RabbitMQ]   recebeu ${msg.tipo} ${msg.id.slice(0, 8)}`); };

// ---------- Relay ----------
let relayJaCaiu = false;
function rodarRelay() {
  const pendentes = db.prepare('SELECT * FROM outbox WHERE publicado_em IS NULL').all();
  for (const msg of pendentes) {
    publicar(msg);
    if (cairRelay && !relayJaCaiu) {
      relayJaCaiu = true;
      console.log('[Relay]      💥 caiu depois de publicar e ANTES de marcar como publicado');
      return;
    }
    db.prepare("UPDATE outbox SET publicado_em = datetime('now') WHERE id = ?").run(msg.id);
    console.log('[Relay]      marcou como publicado');
  }
}

// ---------- Consumidor ----------
let emails = 0;
function consumir() {
  while (fila.length) {
    const msg = fila.shift();
    if (dedupe) {
      try {
        db.prepare('INSERT INTO mensagens_processadas VALUES (?)').run(msg.id);  // falha se repetida
      } catch {
        console.log(`[Consumidor] ${msg.id.slice(0, 8)} já processada (UNIQUE barrou) → ack e ignora`);
        continue;
      }
    }
    emails++;
    console.log(`[Consumidor] 📧 e-mail enviado (${emails})`);
  }
}

aprovarViagem('v1');
aprovarViagem('v1');          // segunda aprovação: o WHERE status = 'PENDENTE' impede
rodarRelay(); consumir();     // 1º ciclo (pode cair)
rodarRelay(); consumir();     // relay reiniciou: 2º ciclo

const status = db.prepare("SELECT status FROM viagens WHERE id = 'v1'").get().status;
console.log(`\nViagem: ${status} | e-mails enviados: ${emails} (o certo é 1)`);
if (emails > 1) console.log('→ Mensagem entregue 2x (at-least-once) e o consumidor não era idempotente.');
