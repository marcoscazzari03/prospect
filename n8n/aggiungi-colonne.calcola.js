// Per ogni scheda: colonne richieste che mancano nell'intestazione (riga 1),
// da scrivere subito dopo l'ultima colonna esistente. Non tocca le altre righe.
const richieste = $('GitHub - Elenco colonne').all().map(i => i.json);
const intestazioni = $('Google - Intestazione').all().map(i => i.json);
const lettera = (n) => { let s = ''; for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };

const out = [];
richieste.forEach((r, i) => {
  const testa = (intestazioni[i]?.values || [[]])[0] || [];
  const presenti = new Set(testa.map(h => String(h).trim()));
  const mancanti = r.colonne.filter(c => !presenti.has(c));
  if (!mancanti.length) return;
  const da = lettera(testa.length);
  const a = lettera(testa.length + mancanti.length - 1);
  out.push({ json: {
    campagna: r.campagna, scheda: r.scheda, foglio_id: r.foglio_id, mancanti,
    intervallo: `'${r.scheda}'!${da}1:${a}1`, corpo: { values: [mancanti] }
  } });
});
return out;
