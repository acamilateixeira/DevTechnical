// ===== Bastidores =====
// Uma "API de busca" falsa: cada chamada aparece na linha do tempo e conta no contador.
async function searchApi(term, origem) {
  stat.inc(`Chamadas à API (${origem})`);
  trace('API', `buscou "${term}" (${origem})`);
  await sleep(120); // finge a latência da rede
  return [`${term} 1`, `${term} 2`];
}

// Monta a tela: dois campos de busca, um sem debounce e um com.
document.getElementById('root').innerHTML = `
  <p><button id="simular">Simular alguém digitando "react hooks"</button></p>
  <label>Sem debounce <input id="sem" placeholder="digite aqui"></label>
  <p class="muted" id="res-sem"></p>
  <label>Com debounce <input id="com" placeholder="digite aqui"></label>
  <p class="muted" id="res-com"></p>`;
