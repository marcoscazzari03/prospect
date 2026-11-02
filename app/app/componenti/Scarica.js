'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Pulsante "Scarica nuovi": chiede il file, lo salva sul computer e aggiorna la pagina.
export default function Scarica({ campagna, testo, disattivo }) {
  const [stato, setStato] = useState({ attesa: false, messaggio: '', errore: false });
  const router = useRouter();

  async function scarica() {
    setStato({ attesa: true, messaggio: '', errore: false });
    try {
      const r = await fetch('/api/scarica', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campagna })
      });
      const tipo = r.headers.get('Content-Type') || '';
      if (!tipo.includes('spreadsheet')) {
        const json = await r.json().catch(() => ({}));
        if (json.vuoto) return setStato({ attesa: false, messaggio: 'Nessun contatto nuovo da scaricare.', errore: false });
        throw new Error(json.errore || 'Download non riuscito.');
      }
      const nome = (r.headers.get('Content-Disposition') || '').match(/filename="([^"]+)"/)?.[1] || 'leads.xlsx';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(await r.blob());
      link.download = nome;
      link.click();
      URL.revokeObjectURL(link.href);
      setStato({ attesa: false, messaggio: `Scaricato: ${nome}`, errore: false });
      router.refresh();
    } catch (e) {
      setStato({ attesa: false, messaggio: e.message, errore: true });
    }
  }

  return (
    <>
      <button onClick={scarica} disabled={stato.attesa || disattivo}>{stato.attesa ? 'Preparo il file…' : testo}</button>
      {stato.messaggio && <p className={`messaggio ${stato.errore ? 'errore' : 'ok'}`}>{stato.messaggio}</p>}
    </>
  );
}
