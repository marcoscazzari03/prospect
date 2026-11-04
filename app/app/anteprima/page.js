import { chiediAN8n } from '../../lib/n8n';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Anteprima | Leads' };

// Colonne mostrate: quelle che servono per controllare i contatti prima di scaricarli.
const COLONNE = [
  ['Nome', r => `${r.nome} ${r.cognome}`.trim()], ['Azienda', r => r.azienda], ['Ruolo', r => r.ruolo],
  ['Paese', r => r.paese], ['Città', r => r.citta], ['Settore Le Fonti', r => r.settore_lefonti],
  ['Comunità 1', r => r.comunita1], ['Comunità 2', r => r.comunita2], ['Specializzazione', r => r.specializzazione],
  ['Email', r => r.email]
];

export default async function Anteprima({ searchParams }) {
  const { campagna = 'tutte' } = await searchParams;
  let righe = [];
  let errore = '';
  try {
    ({ righe = [] } = await chiediAN8n('anteprima', { campagna }));
  } catch (e) {
    errore = e.message;
  }
  // Solo le colonne con almeno un valore (es. Specializzazione solo per gli avvocati).
  const colonne = COLONNE.filter(([, v]) => righe.some(r => v(r)));
  const etichetta = righe[0]?.etichetta || (campagna === 'tutte' ? 'Tutte le campagne' : campagna);

  return (
    <main className="larga">
      <header>
        <div>
          <h1>Anteprima · {campagna === 'tutte' ? 'Tutte le campagne' : etichetta}</h1>
          <span className="tenue">{righe.length} contatti nuovi. Anteprima ed Excel dell&apos;anteprima non li segnano come scaricati: restano &quot;nuovi&quot; finché non usi Scarica nuovi.</span>
        </div>
        <div className="navigazione">
          {righe.length > 0 && <a className="pulsante" href={`/api/anteprima-excel?campagna=${encodeURIComponent(campagna)}`}>Scarica Excel dell&apos;anteprima</a>}
          <a className="pulsante secondario" href="/">Torna ai contatti</a>
        </div>
      </header>
      {errore && <p className="scheda errore">Non riesco a leggere i dati da n8n: {errore}</p>}
      {!errore && !righe.length && <p className="tenue">Nessun contatto nuovo.</p>}
      {righe.length > 0 && (
        <div className="tabella">
          <table>
            <thead><tr>{campagna === 'tutte' && <th>Campagna</th>}{colonne.map(([h]) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {righe.map(r => (
                <tr key={r.email}>
                  {campagna === 'tutte' && <td>{r.etichetta}</td>}
                  {colonne.map(([h, v]) => <td key={h}>{v(r)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
