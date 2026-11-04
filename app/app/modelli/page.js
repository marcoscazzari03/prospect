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
        I campi tra parentesi quadre sono le colonne dell&apos;Excel scaricato dall&apos;app (su MailUp: apertura1, apertura2, specializzazione, citta). Candidature: www.lefontiawards.com/application/
      </p>
      {modelli.map(m => <Modello key={m.campagna} modello={m} />)}
    </main>
  );
}
