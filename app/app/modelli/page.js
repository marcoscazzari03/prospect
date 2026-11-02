import Modello from '../componenti/Modello';
import { modelli } from '../../lib/modelli';

export const metadata = { title: 'Modelli email | Leads' };

export default function Modelli() {
  return (
    <main>
      <header>
        <div>
          <h1>Modelli email</h1>
          <span className="tenue">Le email Le Fonti Awards® di ogni campagna, con anteprima.</span>
        </div>
        <a className="pulsante secondario" href="/">Torna ai contatti</a>
      </header>
      <p className="tenue">
        Da completare prima dell&apos;invio: il <strong>link al modulo</strong> di candidatura.
        Le frasi su misura (Asia PMI, Startup) e la specializzazione (Avvocati) arrivano nei fogli quando le attiviamo nelle campagne.
      </p>
      {modelli.map(m => <Modello key={m.campagna} modello={m} />)}
    </main>
  );
}
