// LAB NODE 04: graceful shutdown (encerrar sem derrubar quem está sendo atendido)
// Rode:  node labs/node/04-graceful-shutdown.mjs              (com graceful shutdown)
//        node labs/node/04-graceful-shutdown.mjs --sem-graceful
//
// É o que acontece num deploy: o Kubernetes/Docker manda SIGTERM para o processo antigo.
// O script sobe um servidor (processo filho), faz 3 requisições lentas (1 s cada) e,
// no meio delas, manda SIGTERM. Com graceful shutdown, as 3 terminam; sem, elas morrem.

import http from 'node:http';
import { fork } from 'node:child_process';

const semGraceful = process.argv.includes('--sem-graceful');

if (process.argv.includes('--servidor')) {
  // ---------------- SERVIDOR ----------------
  let pronto = true;
  const server = http.createServer(async (req, res) => {
    if (req.url === '/health/ready') { res.statusCode = pronto ? 200 : 503; return res.end(); }
    console.log(`  [servidor] começou ${req.url}`);
    await new Promise((r) => setTimeout(r, 1000));      // trabalho lento (banco, API externa…)
    res.end(`ok ${req.url}\n`);
    console.log(`  [servidor] terminou ${req.url}`);
  });
  server.listen(0, () => process.send(server.address().port));

  if (!semGraceful) {
    process.on('SIGTERM', () => {
      console.log('  [servidor] SIGTERM recebido → readiness falha, para de aceitar conexões novas, termina as atuais');
      pronto = false;
      server.close(() => {                               // espera as requisições em andamento
        console.log('  [servidor] todas terminaram; fechando banco/filas e saindo');
        process.exit(0);
      });
      setTimeout(() => { console.log('  [servidor] passou do prazo: saindo à força'); process.exit(1); }, 8000).unref();
    });
  }
  // Sem o handler, o padrão do Node para SIGTERM é morrer NA HORA.
} else {
  // ---------------- CLIENTE DE TESTE ----------------
  console.log(`Modo: ${semGraceful ? 'SEM graceful shutdown' : 'COM graceful shutdown'}\n`);
  const filho = fork(new URL(import.meta.url), ['--servidor', ...(semGraceful ? ['--sem-graceful'] : [])]);
  const port = await new Promise((r) => filho.once('message', r));

  const pedir = (p) => fetch(`http://localhost:${port}${p}`)
    .then((r) => r.text()).then((t) => `✓ ${t.trim()}`)
    .catch((e) => `✗ ${p} FALHOU (${e.cause?.code ?? e.message})`);

  const reqs = ['/pedido-1', '/pedido-2', '/pedido-3'].map(pedir);
  await new Promise((r) => setTimeout(r, 300));          // as 3 já estão em andamento
  console.log('  [deploy] enviando SIGTERM para o servidor antigo');
  filho.kill('SIGTERM');

  const resultados = await Promise.all(reqs);
  console.log('\nResultado para os usuários:');
  resultados.forEach((r) => console.log('  ' + r));
  console.log(semGraceful
    ? '\n→ Os usuários receberam erro só porque houve um deploy.'
    : '\n→ Nenhum usuário percebeu o deploy.');
}
// EXPERIMENTE: diminua o prazo de 8000 para 500 ms e veja o "saindo à força".
