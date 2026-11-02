import Scarica from './componenti/Scarica';
import { chiediAN8n } from '../lib/n8n';

export const dynamic = 'force-dynamic';

// Le date arrivano già in ora italiana ("2026-11-09 08:15:00", oppure solo "2026-11-02"
// per l'export del lunedì): si mostrano così come sono, senza conversioni di fuso.
const data = (d) => {
  if (!d) return 'mai';
  const s = String(d);
  const conOra = s.length > 10;
  return new Date(`${s.slice(0, 10)}T${conOra ? s.slice(11, 19) : '00:00:00'}Z`).toLocaleString('it-IT', {
    timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric',
    ...(conOra ? { hour: '2-digit', minute: '2-digit' } : {})
  });
};

export default async function Panoramica() {
  let campagne = [];
  let storico = [];
  let errore = '';
  try {
    [{ campagne }, { storico }] = await Promise.all([chiediAN8n('panoramica'), chiediAN8n('storico')]);
  } catch (e) {
    errore = e.message;
  }
  const totaleNuovi = campagne.reduce((s, c) => s + c.nuovi, 0);

  return (
    <main>
      <header>
        <div>
          <h1>Leads</h1>
          <span className="tenue">Contatti nuovi delle campagne prospect, pronti per Mailup.</span>
        </div>
        <form action="/api/logout" method="post"><button className="secondario">Esci</button></form>
      </header>

      {errore && <p className="scheda errore">Non riesco a leggere i dati da n8n: {errore}</p>}

      <div className="griglia">
        {campagne.map(c => (
          <section className="scheda" key={c.campagna}>
            <strong>{c.etichetta}</strong>
            <div className="numero">{c.nuovi}</div>
            <div className="tenue">contatti nuovi da scaricare</div>
            <div className="tenue">Già scaricati: {c.scaricati} · ultimo download: {data(c.ultimo_download)}</div>
            <div className="azioni">
              <Scarica campagna={c.campagna} testo="Scarica nuovi" disattivo={!c.nuovi} />
            </div>
          </section>
        ))}
      </div>

      {campagne.length > 1 && (
        <div className="azioni">
          <Scarica campagna="tutte" testo={`Scarica tutti i nuovi (${totaleNuovi})`} disattivo={!totaleNuovi} />
          <span className="tenue">Un solo file con un foglio per campagna.</span>
        </div>
      )}

      <h2>Storico dei download</h2>
      {storico.length ? (
        <div className="tabella">
          <table>
            <thead><tr><th>Data</th><th>Campagna</th><th>Contatti</th><th></th></tr></thead>
            <tbody>
              {storico.map(s => (
                <tr key={`${s.campagna}|${s.download}`}>
                  <td>{data(s.download)}</td>
                  <td>{s.etichetta}</td>
                  <td>{s.contatti}</td>
                  <td><a className="pulsante secondario" href={`/api/riscarica?campagna=${encodeURIComponent(s.campagna)}&download=${encodeURIComponent(s.download)}`}>Riscarica</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="tenue">Ancora nessun download.</p>}
    </main>
  );
}
