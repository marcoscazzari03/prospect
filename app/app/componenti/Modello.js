'use client';
import { useState } from 'react';
import { esempioPer } from '../../lib/modelli';

// Divide il testo in parti normali e campi [campo]: i campi sono evidenziati.
function Testo({ testo, valori, vista }) {
  const parti = testo.split(/(\[[a-z0-9]+\])/g);
  return parti.map((p, i) => {
    const m = p.match(/^\[([a-z0-9]+)\]$/);
    if (!m || !(m[1] in valori)) return <span key={i}>{p}</span>;
    return <mark key={i} className="campo">{vista === 'campi' ? p : valori[m[1]]}</mark>;
  });
}

export default function Modello({ modello }) {
  const [lingua, setLingua] = useState('en');
  const [vista, setVista] = useState('esempio');
  const testo = modello[lingua];
  const valori = esempioPer(modello, lingua);

  return (
    <section className="scheda modello">
      <div className="riga-titolo">
        <strong>{modello.etichetta}</strong>
        <div className="interruttori">
          <div role="group" aria-label="Lingua">
            <button className={lingua === 'en' ? '' : 'secondario'} onClick={() => setLingua('en')}>Inglese</button>
            <button className={lingua === 'it' ? '' : 'secondario'} onClick={() => setLingua('it')}>Italiano</button>
          </div>
          <div role="group" aria-label="Vista">
            <button className={vista === 'esempio' ? '' : 'secondario'} onClick={() => setVista('esempio')}>Esempio</button>
            <button className={vista === 'campi' ? '' : 'secondario'} onClick={() => setVista('campi')}>Campi</button>
          </div>
        </div>
      </div>
      <p className="tenue">{modello.nota}</p>
      {lingua === 'it' && <p className="tenue">Traduzione per lettura interna: l&apos;email si invia in inglese.</p>}

      <div className="email">
        <div className="oggetto"><span className="tenue">Oggetto</span> <Testo testo={testo.oggetto} valori={valori} vista={vista} /></div>
        {testo.testo.map((p, i) => <p key={i}><Testo testo={p} valori={valori} vista={vista} /></p>)}
      </div>

      <p className="tenue">
        Campi MailUp: {Object.entries(modello.campi).map(([k, v]) => `[${k}] = ${v}`).join(' · ')}.
        {vista === 'esempio' && ' Nell’esempio i dati sono inventati.'}
      </p>
    </section>
  );
}
