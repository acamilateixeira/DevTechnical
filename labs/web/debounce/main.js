// DEBOUNCE + CLOSURE
// debounce devolve uma NOVA função. A variável `timer` fica guardada dentro dela
// (isso é a closure): cada chamada cancela o timer anterior e agenda outro.

function debounce(fn, ms) {
  let timer; // vive na closure, compartilhada entre as chamadas
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const ESPERA_MS = 300;

// Sem debounce: cada tecla dispara uma busca
document.getElementById('sem').addEventListener('input', async (e) => {
  stat.inc('Teclas digitadas');
  trace('Usuário', `tecla → "${e.target.value}"`);
  const r = await searchApi(e.target.value, 'sem debounce');
  document.getElementById('res-sem').textContent = r.join(', ');
});

// Com debounce: só busca quando a pessoa para de digitar por ESPERA_MS
const buscarDepois = debounce(async (term) => {
  trace('Debounce', `passou ${ESPERA_MS}ms sem tecla → busca`);
  const r = await searchApi(term, 'com debounce');
  document.getElementById('res-com').textContent = r.join(', ');
}, ESPERA_MS);

document.getElementById('com').addEventListener('input', (e) => {
  trace('Usuário', `tecla → "${e.target.value}"`);
  buscarDepois(e.target.value);
});

// Botão que digita nos dois campos, letra por letra
document.getElementById('simular').addEventListener('click', async () => {
  const texto = 'react hooks';
  for (const campo of ['sem', 'com']) {
    const el = document.getElementById(campo);
    el.value = '';
    for (const letra of texto) {
      el.value += letra;
      el.dispatchEvent(new Event('input'));
      await sleep(80); // 80ms entre letras: alguém digitando rápido
    }
  }
});
