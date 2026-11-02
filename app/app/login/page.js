'use client';

import { useState } from 'react';

export default function Accesso() {
  const [errore, setErrore] = useState('');
  const [attesa, setAttesa] = useState(false);

  async function entra(evento) {
    evento.preventDefault();
    setAttesa(true);
    setErrore('');
    const password = new FormData(evento.currentTarget).get('password');
    const r = await fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password })
    });
    if (r.ok) {
      window.location.href = '/';
      return;
    }
    setErrore((await r.json().catch(() => ({}))).errore || 'Accesso non riuscito.');
    setAttesa(false);
  }

  return (
    <main>
      <form className="scheda accesso" onSubmit={entra}>
        <h1>Leads</h1>
        <p className="tenue">Accesso riservato.</p>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
        <button type="submit" disabled={attesa}>{attesa ? 'Accesso…' : 'Entra'}</button>
        {errore && <p className="messaggio errore">{errore}</p>}
      </form>
    </main>
  );
}
