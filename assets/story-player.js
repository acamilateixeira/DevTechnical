// Mini vídeo animado de uma história.
// Tudo é calculado a partir do tempo (render(t)), então o mesmo player serve para assistir no site
// e para gravar o MP4 quadro a quadro (scripts/render-videos.mjs). Palco fixo de 1280×720, escalado.
//
// Linha do tempo: abertura → elenco → para cada cena: título, falas (digitando), avisos e o painel
// "📋 Como está agora" → resposta da entrevista → fim.

import { findCast, STATE, SPEECH, COLORS, inline } from './story.js';
import { escapeHtml } from './md.js';

const LAND = { w: 1280, h: 720 };
const PORT = { w: 720, h: 1180 }; // celular: conversa em cima, painel embaixo

const T = {
  pt: { cast: 'Quem é quem', state: '📋 Como está agora', stateWait: 'o painel aparece quando o programa muda', interview: '🎤 Pra falar na entrevista',
    end: 'Agora rode o lab e treine a pergunta', play: 'Assistir', pause: 'Pausar', restart: 'Do começo', speed: 'Velocidade', voice: '🔊 Narração', full: 'Tela cheia', scene: 'Cena' },
  en: { cast: 'Who is who', state: '📋 State right now', stateWait: 'the panel shows up when the program changes', interview: '🎤 For the interview',
    end: 'Now run the lab and practice the question', play: 'Play', pause: 'Pause', restart: 'Restart', speed: 'Speed', voice: '🔊 Narration', full: 'Fullscreen', scene: 'Scene' },
};

const plain = (s) => s.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1').replace(/_\((.+?)\)_/g, '($1)');
const readTime = (s) => Math.min(9, Math.max(2.4, 1.4 + plain(s).length / 17));
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => 1 - Math.pow(1 - clamp01(x), 3);

/** Transforma a história em eventos com início e duração (segundos). */
export function buildTimeline(story) {
  const ev = [];
  let t = 0;
  const add = (e) => { e.start = t; t += e.dur; ev.push(e); };
  add({ type: 'intro', dur: 3.6 });
  add({ type: 'cast', dur: Math.min(9, 1.6 + story.cast.length * 0.45 + 2.4) });
  story.scenes.forEach((sc, si) => {
    add({ type: 'scene', title: sc.title, si, dur: 1.7 });
    let rows = [];
    const flushState = () => { if (rows.length) { add({ type: 'state', rows, si, dur: 2.2 + rows.length * 0.25 }); rows = []; } };
    for (const line of sc.lines) {
      const st = line.match(STATE);
      if (st) { rows.push([st[1], st[2].trim(), st[3].trim()]); continue; }
      flushState();
      const m = line.match(SPEECH);
      if (m) add({ type: 'line', who: m[1], dir: m[2] || '', text: m[3], si, dur: readTime(m[3]) });
      else if (line.startsWith('> ')) add({ type: 'banner', text: line.slice(2), si, dur: 2.6 });
    }
    flushState();
  });
  if (story.interview) add({ type: 'interview', text: story.interview.replace(/^"|"$/g, ''), dur: Math.min(18, 3 + plain(story.interview).length / 22) });
  add({ type: 'end', dur: 3 });
  return { events: ev, duration: t };
}

/** Quebra o HTML de um elemento em palavras, para o efeito de digitação. */
function wordSpans(el) {
  const out = [];
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.append(w); return; }
          const s = document.createElement('span'); s.className = 'pw'; s.textContent = w; out.push(s); frag.append(s);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    }
  };
  walk(el);
  return out;
}

/**
 * Monta o player. opts: { lang, capture (sem controles, para gravar), autoplay, title, meta }
 * Devolve { seek(t), play(), pause(), duration, destroy() }.
 */
export function mountPlayer(container, story, opts = {}) {
  const lang = opts.lang || 'pt';
  const portrait = !opts.capture && (opts.portrait ?? (container.clientWidth || 1280) < 640);
  const { w: W, h: H } = portrait ? PORT : LAND;
  const t = T[lang];
  const { events, duration } = buildTimeline(story);
  const who = (name) => findCast(story, name);
  const ci = (c) => (c ? `c${c.i % COLORS}` : 'cx');

  container.innerHTML = `
    <div class="pl ${opts.capture ? 'pl-capture' : ''}">
      <div class="pl-viewport"><div class="pl-stage${portrait ? ' pl-portrait' : ''}" style="width:${W}px;height:${H}px">
        <div class="pl-top"><span class="pl-title">🎬 ${inline(story.title)}</span><span class="pl-scene"></span><span class="pl-brand">DevTechnical</span></div>
        <div class="pl-chat"></div>
        <aside class="pl-panel"><div class="pl-panel-title">${t.state}</div><div class="pl-rows"><p class="pl-wait">${t.stateWait}</p></div></aside>
        <div class="pl-cast">${story.cast.map((c, i) => `<div class="pl-ava c${i % COLORS}" data-i="${i}" title="${escapeHtml(c.name)}"><span>${c.emoji}</span></div>`).join('')}</div>
        <div class="pl-overlay"></div>
        <div class="pl-bar"><span></span></div>
      </div></div>
      ${opts.capture ? '' : `
      <div class="pl-controls">
        <button type="button" class="btn primary pl-play">▶ ${t.play}</button>
        <button type="button" class="btn ghost pl-restart" title="${t.restart}">⟲</button>
        <input type="range" class="pl-seek" min="0" max="${duration.toFixed(2)}" step="0.05" value="0" aria-label="timeline" />
        <span class="pl-time">0:00</span>
        <select class="pl-speed" aria-label="${t.speed}"><option value="0.75">0,75×</option><option value="1" selected>1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option></select>
        <label class="pl-voice"><input type="checkbox" /> ${t.voice}</label>
        <button type="button" class="btn ghost pl-full" title="${t.full}">⛶</button>
      </div>`}
    </div>`;

  const root = container.querySelector('.pl');
  const stage = root.querySelector('.pl-stage');
  const viewport = root.querySelector('.pl-viewport');
  const chat = stage.querySelector('.pl-chat');
  const rowsEl = stage.querySelector('.pl-rows');
  const overlay = stage.querySelector('.pl-overlay');
  const sceneEl = stage.querySelector('.pl-scene');
  const bar = stage.querySelector('.pl-bar span');
  const avas = [...stage.querySelectorAll('.pl-ava')];

  // escala o palco para caber no container
  const fit = () => {
    const w = viewport.clientWidth || W;
    const s = w / W;
    stage.style.transform = `scale(${s})`;
    viewport.style.height = `${H * s}px`;
  };
  const ro = new ResizeObserver(fit); ro.observe(viewport); fit();

  // cache dos elementos de fala (montados uma vez, digitação liga palavra por palavra)
  const lineEls = new Map();
  const lineEl = (e) => {
    if (lineEls.has(e)) return lineEls.get(e);
    const c = who(e.who);
    const el = document.createElement('div');
    el.className = `pl-line ${ci(c)}`;
    el.innerHTML = `<span class="pl-line-ava">${c ? c.emoji : '💬'}</span><div class="pl-bubble">
      <div class="pl-who"><strong>${inline(e.who)}</strong>${c?.code ? ` <span class="pl-code">${inline(c.code)}</span>` : ''}${e.dir ? ` <em>(${inline(e.dir)})</em>` : ''}</div>
      <div class="pl-say">${inline(e.text)}</div></div>`;
    const words = wordSpans(el.querySelector('.pl-say'));
    const rec = { el, words };
    lineEls.set(e, rec);
    return rec;
  };

  let lastRowsKey = '';
  const renderRows = (stateEvents, current) => {
    if (!stateEvents.length) { if (lastRowsKey !== 'wait') { rowsEl.innerHTML = `<p class="pl-wait">${t.stateWait}</p>`; lastRowsKey = 'wait'; } return; }
    const last = stateEvents[stateEvents.length - 1];
    const prev = stateEvents.length > 1 ? stateEvents[stateEvents.length - 2] : null;
    const prevMap = new Map((prev?.rows || []).map(([, l, v]) => [l, v]));
    const norm = (v) => (v || '').replace(/\s*\([^)]*\)/g, '').trim();
    const key = `${events.indexOf(last)}`;
    if (key !== lastRowsKey) {
      rowsEl.innerHTML = last.rows.map(([emoji, label, value]) => {
        const changed = prev && prevMap.has(label) ? norm(prevMap.get(label)) !== norm(value) : !!prev && !prevMap.has(label);
        return `<div class="pl-row${changed ? ' changed' : ''}"><div class="pl-row-l">${emoji} ${inline(label)}</div><div class="pl-row-v">${inline(value || '—')}</div></div>`;
      }).join('');
      lastRowsKey = key;
    }
    // destaque do que mudou: forte no começo do evento, suave depois
    const fresh = current === last ? ease((tNow - last.start) / 0.5) : 1;
    rowsEl.style.setProperty('--hl', current === last ? String(1 - 0.6 * clamp01((tNow - last.start - 1.2) / 1)) : '0.4');
    rowsEl.style.opacity = String(0.4 + 0.6 * fresh);
  };

  let tNow = 0;
  function render(time) {
    tNow = Math.max(0, Math.min(duration, time));
    const idx = Math.max(0, events.findIndex((e) => tNow < e.start + e.dur));
    const cur = events[idx === -1 ? events.length - 1 : idx];
    const local = tNow - cur.start;
    bar.style.width = `${(tNow / duration) * 100}%`;

    // cena atual no topo
    const sceneEv = [...events].reverse().find((e) => e.type === 'scene' && e.start <= tNow);
    sceneEl.textContent = sceneEv && !['intro', 'cast', 'interview', 'end'].includes(cur.type) ? `🎬 ${plain(sceneEv.title)}` : '';

    // overlays: abertura, elenco, título da cena, aviso, entrevista, fim
    let ov = '';
    let ovOpacity = 0;
    if (cur.type === 'intro') {
      ovOpacity = 1 - clamp01((local - cur.dur + 0.4) / 0.4);
      const a = ease(local / 0.6);
      ov = `<div class="pl-card pl-intro" style="opacity:${a};transform:translateY(${(1 - a) * 24}px)">
        <div class="pl-intro-title">${inline(story.title)}</div>
        ${story.setting ? `<div class="pl-intro-setting">📍 ${inline(story.setting)}</div>` : ''}
        ${opts.meta ? `<div class="pl-intro-meta">${escapeHtml(opts.meta)}</div>` : ''}</div>`;
    } else if (cur.type === 'cast') {
      ovOpacity = 1 - clamp01((local - cur.dur + 0.4) / 0.4);
      const n = story.cast.length;
      const small = n > 8;
      ov = `<div class="pl-card pl-castcard${small ? ' small' : ''}"><div class="pl-card-h">🎭 ${t.cast}</div><div class="pl-castgrid">${story.cast.map((c, i) => {
        const a = ease((local - 0.5 - i * 0.45) / 0.35);
        return `<div class="pl-castitem c${i % COLORS}" style="opacity:${a};transform:scale(${0.85 + 0.15 * a})"><span class="pl-castemoji">${c.emoji}</span><div><strong>${inline(c.name)}</strong>${c.code ? `<span class="pl-code">${inline(c.code)}</span>` : ''}<span class="pl-castwho">${inline(c.who)}</span></div></div>`;
      }).join('')}</div></div>`;
    } else if (cur.type === 'scene') {
      const a = ease(local / 0.35) * (1 - clamp01((local - cur.dur + 0.35) / 0.35));
      ovOpacity = a;
      ov = `<div class="pl-scenecard" style="transform:scale(${0.92 + 0.08 * a})">🎬 ${inline(cur.title)}</div>`;
    } else if (cur.type === 'banner') {
      const a = ease(local / 0.3) * (1 - clamp01((local - cur.dur + 0.3) / 0.3));
      ovOpacity = a;
      ov = `<div class="pl-banner" style="transform:scale(${0.9 + 0.1 * a})">${inline(cur.text)}</div>`;
    } else if (cur.type === 'interview') {
      ovOpacity = 1;
      const a = ease(local / 0.5);
      const shown = Math.floor(plain(cur.text).length * clamp01((local - 0.4) / Math.max(1, cur.dur - 3.2)));
      ov = `<div class="pl-card pl-interview" style="opacity:${a}"><div class="pl-card-h">${t.interview}</div><div class="pl-int-text">${escapeHtml(plain(cur.text).slice(0, shown))}<span class="pl-caret">▍</span></div></div>`;
    } else if (cur.type === 'end') {
      ovOpacity = ease(local / 0.4);
      ov = `<div class="pl-card pl-end"><div class="pl-intro-title">${inline(story.title)}</div><div class="pl-intro-setting">▶ ${t.end}</div><div class="pl-brand-big">DevTechnical</div></div>`;
    }
    if (overlay._html !== ov) { overlay.innerHTML = ov; overlay._html = ov; }
    overlay.style.opacity = String(ovOpacity);
    overlay.style.setProperty('--o', '1');
    overlay.classList.toggle('dim', ['intro', 'cast', 'interview', 'end'].includes(cur.type));
    overlay.classList.toggle('soft', ['scene', 'banner'].includes(cur.type));

    // conversa: últimas falas até agora
    const spoken = events.filter((e) => e.type === 'line' && e.start <= tNow);
    const curScene = cur.si ?? (cur.type === 'scene' ? cur.si : -1);
    const visible = spoken.filter((e) => e.si === curScene).slice(-4); // cada cena começa com a conversa limpa
    const want = new Set(visible.map(lineEl).map((r) => r.el));
    [...chat.children].forEach((ch) => { if (!want.has(ch)) ch.remove(); });
    visible.forEach((e, k) => {
      const rec = lineEl(e);
      if (rec.el.parentNode !== chat || chat.children[k] !== rec.el) chat.insertBefore(rec.el, chat.children[k] || null);
      const age = visible.length - 1 - k;
      const isCur = e === cur;
      const enter = ease((tNow - e.start) / 0.3);
      rec.el.style.opacity = String((age === 0 ? 1 : age === 1 ? 0.7 : 0.45) * enter);
      rec.el.style.transform = `translateY(${(1 - enter) * 18}px)`;
      rec.el.classList.toggle('speaking', isCur);
      const typed = isCur ? clamp01((local - 0.15) / Math.max(0.6, cur.dur * 0.55)) : 1;
      const nWords = Math.ceil(rec.words.length * typed);
      rec.words.forEach((w, i) => { w.style.opacity = i < nWords ? '1' : '0'; });
    });

    // elenco embaixo: quem já falou acende, quem fala agora cresce
    const speakingIdx = cur.type === 'line' ? who(cur.who)?.i : -1;
    const spokeSet = new Set(spoken.map((e) => who(e.who)?.i));
    avas.forEach((a, i) => {
      a.classList.toggle('on', spokeSet.has(i));
      a.classList.toggle('now', i === speakingIdx);
    });

    // painel técnico
    const states = events.filter((e) => e.type === 'state' && e.start <= tNow && e.si === curScene); // painel da cena atual
    renderRows(states, cur);
    stage.querySelector('.pl-panel').classList.toggle('pulse', cur.type === 'state' && local < 0.8);

    if (timeEl) timeEl.textContent = `${fmt(tNow)} / ${fmt(duration)}`;
    if (seekEl && !seeking) seekEl.value = tNow.toFixed(2);
    onEvent(cur);
  }
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // ---- reprodução (só no site) ----
  const playBtn = root.querySelector('.pl-play');
  const seekEl = root.querySelector('.pl-seek');
  const timeEl = root.querySelector('.pl-time');
  const speedEl = root.querySelector('.pl-speed');
  const voiceEl = root.querySelector('.pl-voice input');
  let playing = false; let raf = 0; let last = 0; let seeking = false;
  let lastEvent = null; let speaking = false;

  const voiceOn = () => voiceEl?.checked && 'speechSynthesis' in window;
  function onEvent(e) {
    if (e === lastEvent) return;
    lastEvent = e;
    if (!playing || !voiceOn()) return;
    const text = e.type === 'line' ? `${plain(e.who)}: ${plain(e.text)}` : e.type === 'banner' ? plain(e.text) : e.type === 'scene' ? plain(e.title) : e.type === 'interview' ? plain(e.text) : e.type === 'intro' ? plain(story.title) : '';
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();
    if (!clean) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
    u.rate = Number(speedEl?.value || 1);
    speaking = true;
    u.onend = u.onerror = () => { speaking = false; };
    speechSynthesis.speak(u);
  }

  const tick = (now) => {
    const dt = (now - last) / 1000; last = now;
    const cur = events.find((e) => tNow < e.start + e.dur) || events[events.length - 1];
    // com narração, espera a voz terminar antes de ir para o próximo evento
    const atEnd = tNow + dt * Number(speedEl?.value || 1) >= cur.start + cur.dur;
    if (!(voiceOn() && speaking && atEnd)) render(tNow + dt * Number(speedEl?.value || 1));
    if (tNow >= duration) { pause(); return; }
    raf = requestAnimationFrame(tick);
  };
  function play() {
    if (tNow >= duration) render(0);
    playing = true; last = performance.now(); lastEvent = null;
    if (playBtn) playBtn.textContent = `⏸ ${t.pause}`;
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    playing = false; cancelAnimationFrame(raf);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (playBtn) playBtn.textContent = `▶ ${t.play}`;
  }
  playBtn?.addEventListener('click', () => (playing ? pause() : play()));
  root.querySelector('.pl-restart')?.addEventListener('click', () => { render(0); lastEvent = null; if (!playing) play(); });
  seekEl?.addEventListener('input', () => { seeking = true; render(Number(seekEl.value)); });
  seekEl?.addEventListener('change', () => { seeking = false; lastEvent = null; });
  voiceEl?.addEventListener('change', () => { if (!voiceEl.checked && 'speechSynthesis' in window) speechSynthesis.cancel(); lastEvent = null; });
  root.querySelector('.pl-full')?.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen(); else root.requestFullscreen?.();
  });
  stage.addEventListener('click', () => { if (!opts.capture) (playing ? pause() : play()); });
  root.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); playing ? pause() : play(); } });

  render(0);
  if (opts.autoplay) play();
  return {
    seek: render, play, pause, duration,
    destroy() { pause(); ro.disconnect(); container.innerHTML = ''; },
  };
}
