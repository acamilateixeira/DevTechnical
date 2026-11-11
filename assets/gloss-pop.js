// Balão das definições do glossário.
// Um balão só, com position: fixed, posicionado por JavaScript para NUNCA sair da tela:
// cabe abaixo do termo? abre abaixo; senão, acima; senão, no lado com mais espaço e com rolagem.
// Na horizontal, fica sempre dentro da área visível (inclusive com zoom e dentro da gaveta das histórias).
// Mouse: abre ao passar por cima. Toque: abre e fecha ao tocar. Teclado: abre no foco, fecha com Esc.

const GAP = 8;     // distância do termo
const MARGIN = 8;  // distância mínima da borda da tela

let pop = null;
let current = null;
let hideTimer = null;
let pointerFocus = false; // foco que veio de um toque/clique: quem decide é o click

function viewport() {
  const v = window.visualViewport;
  return v
    ? { left: v.offsetLeft, top: v.offsetTop, width: v.width, height: v.height }
    : { left: 0, top: 0, width: document.documentElement.clientWidth, height: window.innerHeight };
}

function ensurePop(container) {
  if (!pop) {
    pop = document.createElement('div');
    pop.className = 'gloss-float';
    pop.setAttribute('role', 'tooltip');
    pop.id = 'gloss-float';
    pop.addEventListener('pointerenter', () => clearTimeout(hideTimer));
    pop.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') scheduleHide(); });
    pop.addEventListener('click', (e) => { if (e.target.closest('a')) hide(); });
  }
  // Dentro de um <dialog> aberto, o balão precisa morar no dialog (camada de cima), senão fica por baixo.
  if (pop.parentElement !== container) container.append(pop);
  return pop;
}

function place(term) {
  const vp = viewport();
  const r = term.getBoundingClientRect();
  // Termo quebrado em duas linhas: usa o primeiro pedaço.
  const rect = term.getClientRects()[0] || r;
  pop.style.maxWidth = `${Math.min(360, vp.width - MARGIN * 2)}px`;
  pop.style.maxHeight = '';
  pop.style.left = '0px';
  pop.style.top = '0px';
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;

  const spaceBelow = vp.top + vp.height - rect.bottom - GAP - MARGIN;
  const spaceAbove = rect.top - vp.top - GAP - MARGIN;
  let top;
  if (h <= spaceBelow) top = rect.bottom + GAP;
  else if (h <= spaceAbove) top = rect.top - GAP - h;
  else if (spaceBelow >= spaceAbove) { top = rect.bottom + GAP; pop.style.maxHeight = `${Math.max(80, spaceBelow)}px`; }
  else { pop.style.maxHeight = `${Math.max(80, spaceAbove)}px`; top = rect.top - GAP - pop.offsetHeight; }

  let left = rect.left;
  const maxLeft = vp.left + vp.width - MARGIN - w;
  left = Math.max(vp.left + MARGIN, Math.min(left, maxLeft));

  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(Math.max(vp.top + MARGIN, top))}px`;
}

function show(term) {
  clearTimeout(hideTimer);
  const src = term.querySelector(':scope > .gloss-pop');
  if (!src) return;
  const container = term.closest('dialog[open]') || document.body;
  ensurePop(container);
  pop.innerHTML = src.innerHTML;
  pop.dataset.dark = term.closest('.recruiter') ? '0' : '1';
  pop.hidden = false;
  current = term;
  term.setAttribute('aria-describedby', 'gloss-float');
  place(term);
}

function hide() {
  clearTimeout(hideTimer);
  if (pop) pop.hidden = true;
  current?.removeAttribute('aria-describedby');
  current = null;
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hide, 180); // dá tempo de levar o mouse até o balão para clicar no link
}

export function initGlossPopover() {
  document.addEventListener('pointerdown', () => { pointerFocus = true; setTimeout(() => { pointerFocus = false; }, 400); }, true);
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const term = e.target.closest?.('.term');
    if (term && term !== current) show(term);
    else if (term) clearTimeout(hideTimer);
  });
  document.addEventListener('pointerout', (e) => {
    if (e.pointerType !== 'mouse') return;
    const term = e.target.closest?.('.term');
    if (term && term === current && !term.contains(e.relatedTarget) && !pop?.contains(e.relatedTarget)) scheduleHide();
  });
  // Toque (celular/tablet): toca no termo abre; toca de novo ou fora, fecha.
  document.addEventListener('click', (e) => {
    if (pop && pop.contains(e.target)) return;
    const term = e.target.closest?.('.term');
    if (term && !e.target.closest('a')) {
      if (term === current && !pop.hidden && e.pointerType !== 'mouse') hide(); else show(term);
      return;
    }
    if (current) hide();
  });
  document.addEventListener('focusin', (e) => {
    const term = e.target.closest?.('.term');
    if (term && !pointerFocus) show(term);
  });
  document.addEventListener('focusout', (e) => {
    const term = e.target.closest?.('.term');
    if (term && term === current && !pop?.contains(e.relatedTarget)) scheduleHide();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) hide(); });
  // Rolar, mudar o tamanho da janela ou dar zoom: reposiciona (ou fecha se o termo saiu da tela).
  const reflow = () => {
    if (!current || !pop || pop.hidden) return;
    if (!current.isConnected) return hide();
    const r = current.getBoundingClientRect();
    const vp = viewport();
    if (r.bottom < vp.top || r.top > vp.top + vp.height) return hide();
    place(current);
  };
  window.addEventListener('scroll', reflow, { passive: true, capture: true });
  window.addEventListener('resize', reflow);
  window.visualViewport?.addEventListener('resize', reflow);
  window.visualViewport?.addEventListener('scroll', reflow);
  window.addEventListener('hashchange', hide);
}
