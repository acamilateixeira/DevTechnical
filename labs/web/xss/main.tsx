// XSS: quando texto do usuário vira HTML.
// O React ESCAPA o que você coloca entre { } — então o comentário aparece como texto.
// dangerouslySetInnerHTML desliga essa proteção. Teste com o comentário malicioso.
import { useState } from 'react';

const MALICIOSO = `Ótima viagem! <img src="nao-existe.png" onerror="trace('Atacante', 'script injetado RODOU: poderia ler dados e agir como você', 'bad'); this.insertAdjacentHTML('afterend', '<b style=color:red> ⚠ SCRIPT DO ATACANTE RODOU</b>')">`;

// Uma sanitização simples só para demonstração. Em produção use DOMPurify.
function sanitizar(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.body.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((a) => { if (a.name.startsWith('on') || a.value.trim().toLowerCase().startsWith('javascript:')) el.removeAttribute(a.name); });
    if (['SCRIPT', 'IFRAME', 'OBJECT'].includes(el.tagName)) el.remove();
  });
  return doc.body.innerHTML;
}

export default function App() {
  const [comentario, setComentario] = useState('Adorei o hotel <b>perto da praia</b>!');
  const [publicado, setPublicado] = useState('');

  return (
    <div>
      <textarea rows={3} style={{ width: '100%' }} value={comentario} onChange={(e) => setComentario(e.target.value)} />
      <p>
        <button onClick={() => setComentario(MALICIOSO)}>Colar comentário malicioso</button>
        <button onClick={() => { setPublicado(comentario); trace('Usuário', 'publicou o comentário'); }}>Publicar</button>
      </p>

      <div className="card"><strong>1. Seguro: {'{comentario}'}</strong>
        <p>{publicado}</p></div>

      <div className="card"><strong>2. Perigoso: dangerouslySetInnerHTML sem sanitizar</strong>
        <p dangerouslySetInnerHTML={{ __html: publicado }} /></div>

      <div className="card"><strong>3. dangerouslySetInnerHTML + sanitização</strong>
        <p dangerouslySetInnerHTML={{ __html: sanitizar(publicado) }} /></div>
    </div>
  );
}
