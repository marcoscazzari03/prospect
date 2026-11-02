import Scarica from './componenti/Scarica';
import { chiediAN8n } from '../lib/n8n';

export const dynamic = 'force-dynamic';

const data = (d) => (d ? new Date(String(d).replace(' ', 'T')).toLocaleString('it-IT', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : 'mai');

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
