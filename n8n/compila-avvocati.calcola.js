// Compila, per i contatti avvocati gia presenti, le colonne nuove rimaste vuote:
// - Prospect AI: Specializzazione (dal "Settore" scritto dall'AI, con le parole chiave di campagna.json);
// - Mailup: Specializzazione (dal suo "Settore") e Città (presa da Prospect AI, stessa email).
// Scrive solo le celle vuote: i valori gia presenti restano. Nessuna chiamata AI.
const cfg = $('GitHub - Impostazioni avvocati').first().json.motore.specializzazione;
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
  const citta = pulito(r[pa.col('Città')]);
  if (email && citta && !cittaPerEmail.has(email)) cittaPerEmail.set(email, citta);
}

// Colonna intera (dalla riga 2 all'ultima letta), con i valori nuovi solo dove la cella e vuota.
const colonna = (s, nomeScheda, intestazione, calcola) => {
  const k = s.col(intestazione);
  let compilate = 0;
  const valori = s.righe.map(r => {
    const attuale = pulito(r[k]);
    if (attuale) return [attuale];
    const nuovo = calcola(r);
    if (nuovo) compilate++;
    return [nuovo || ''];
  });
  const L = lettera(k);
  return { range: `'${nomeScheda}'!${L}2:${L}${s.righe.length + 1}`, values: valori, compilate, scheda: nomeScheda, colonna: intestazione };
};

const blocchi = [
  colonna(pa, NOME_PA, 'Specializzazione', r => spec(r[pa.col('Settore')])),
  colonna(mu, NOME_MU, 'Specializzazione', r => spec(r[mu.col('Settore')])),
  colonna(mu, NOME_MU, 'Città', r => cittaPerEmail.get(pulito(r[mu.col('Email')]).toLowerCase()) || '')
].filter(b => b.values.length);

// Riepilogo (conteggi per valore) per controllare il risultato senza aprire il foglio.
const conta = (b) => b.values.reduce((m, [v]) => (m[v || '(vuota)'] = (m[v || '(vuota)'] || 0) + 1, m), {});
return [{
  json: {
    corpo: { valueInputOption: 'RAW', data: blocchi.map(({ range, values }) => ({ range, values })) },
    riepilogo: blocchi.map(b => ({ scheda: b.scheda, colonna: b.colonna, righe: b.values.length, compilate_ora: b.compilate, valori: conta(b) }))
  }
}];
