// Per i contatti avvocati gia presenti (nessuna chiamata AI):
// - Specializzazione (Prospect AI e Mailup): solo celle vuote, dal "Settore" con le parole chiave di campagna.json;
// - Città (Prospect AI e Mailup): celle vuote di Mailup prese da Prospect AI (stessa email), e
//   nomi tradotti in inglese con motore/liste/citta-inglese.json (es. Praga -> Prague).
// Impostazioni da dist/compila-avvocati.json (generato da motore/build.py).
const imp = $('GitHub - Impostazioni avvocati').first().json;
const cfg = imp.specializzazione;
const CITTA_EN = new Map(Object.entries(imp.citta_inglese).map(([k, v]) => [k.toLowerCase(), v]));
const inglese = (c) => CITTA_EN.get(String(c ?? '').trim().toLowerCase()) || c;
const parole = cfg.parole.map(([rx, v]) => [new RegExp(rx, 'i'), v]);
const spec = (testo) => {
  for (const [rx, v] of parole) if (rx.test(String(testo ?? ''))) return v;
  return cfg.riserva;
};

const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const lettera = (n) => { let s = ''; for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };
const scheda = (nome) => {
  const [testa = [], ...righe] = $(nome).first().json.values || [];
  const col = (h) => testa.findIndex(x => pulito(x).toLowerCase() === h.toLowerCase());
  return { testa, righe, col };
};

const pa = scheda('Google - Prospect AI');
const mu = scheda('Google - Mailup');
const NOME_PA = 'Prospect AI';
const NOME_MU = 'Mailup';

const manca = [];
for (const [s, n, cols] of [[pa, NOME_PA, ['Settore', 'Specializzazione', 'Città', 'Email certa']], [mu, NOME_MU, ['Settore', 'Specializzazione', 'Città', 'Email']]]) {
  for (const c of cols) if (s.col(c) < 0) manca.push(`${n}: ${c}`);
}
if (manca.length) throw new Error(`Colonne mancanti (eseguire prima Aggiungi colonne): ${manca.join(', ')}`);

// Città per email, da Prospect AI.
const cittaPerEmail = new Map();
for (const r of pa.righe) {
  const email = pulito(r[pa.col('Email certa')]).toLowerCase();
  const citta = inglese(pulito(r[pa.col('Città')]));
  if (email && citta && !cittaPerEmail.has(email)) cittaPerEmail.set(email, citta);
}

// Colonna intera (dalla riga 2 all'ultima letta): i valori nuovi solo dove la cella e vuota;
// "correggi" (se c'e) puo cambiare un valore gia presente (per le città: traduzione in inglese).
const colonna = (s, nomeScheda, intestazione, calcola, correggi) => {
  const k = s.col(intestazione);
  let compilate = 0;
  let corrette = 0;
  const valori = s.righe.map(r => {
    const attuale = pulito(r[k]);
    if (attuale) {
      const nuovo = correggi ? correggi(attuale) : attuale;
      if (nuovo !== attuale) corrette++;
      return [nuovo];
    }
    const nuovo = calcola(r);
    if (nuovo) compilate++;
    return [nuovo || ''];
  });
  const L = lettera(k);
  return { range: `'${nomeScheda}'!${L}2:${L}${s.righe.length + 1}`, values: valori, compilate, corrette, scheda: nomeScheda, colonna: intestazione };
};

const blocchi = [
  colonna(pa, NOME_PA, 'Specializzazione', r => spec(r[pa.col('Settore')])),
  colonna(mu, NOME_MU, 'Specializzazione', r => spec(r[mu.col('Settore')])),
  colonna(pa, NOME_PA, 'Città', () => '', inglese),
  colonna(mu, NOME_MU, 'Città', r => cittaPerEmail.get(pulito(r[mu.col('Email')]).toLowerCase()) || '', inglese)
].filter(b => b.values.length);

// Riepilogo (conteggi per valore) per controllare il risultato senza aprire il foglio.
const conta = (b) => b.values.reduce((m, [v]) => (m[v || '(vuota)'] = (m[v || '(vuota)'] || 0) + 1, m), {});
return [{
  json: {
    corpo: { valueInputOption: 'RAW', data: blocchi.map(({ range, values }) => ({ range, values })) },
    riepilogo: blocchi.map(b => ({ scheda: b.scheda, colonna: b.colonna, righe: b.values.length, compilate_ora: b.compilate, corrette_ora: b.corrette, valori: conta(b) }))
  }
}];
