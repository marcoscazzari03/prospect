import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

// Compila una volta, per gli avvocati gia nel foglio, le colonne nuove vuote: Specializzazione
// (dal vecchio Settore, regole in campagne/avvocati/campagna.json) e Città nella scheda Mailup.
// Nessuna chiamata AI. Si puo rieseguire: scrive solo le celle vuote.
const GOOGLE = { googleSheetsOAuth2Api: { id: 'ZayuDfh1wxejgzop', name: 'Spreadsheet ads.lefonti@gmail.com' } };
const FOGLIO = '1g0XfNM3vj5icNmfeEROydjFKHERVh5jqgRPo_nHO0Bs';

const avvio = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Avvio manuale', position: [0, 0] },
  output: [{}]
});

const impostazioni = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Impostazioni avvocati',
    position: [220, 0],
    parameters: {
      url: 'https://api.github.com/repos/marcoscazzari03/prospect/contents/dist/compila-avvocati.json?ref=main',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Accept', value: 'application/vnd.github.raw+json' }, { name: 'User-Agent', value: 'n8n-prospect' }] },
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ specializzazione: { parole: [], riserva: 'criminal defence' }, citta_inglese: { Praga: 'Prague' } }]
});

const prospectAI = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Prospect AI',
    position: [440, 0],
    parameters: {
      url: 'https://sheets.googleapis.com/v4/spreadsheets/' + FOGLIO + '/values/%27Prospect%20AI%27!A%3AZ',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ values: [['Nome', 'Settore', 'Specializzazione']] }]
});

const mailup = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Mailup',
    position: [660, 0],
    parameters: {
      url: 'https://sheets.googleapis.com/v4/spreadsheets/' + FOGLIO + '/values/Mailup!A%3AZ',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ values: [['Nome', 'Settore', 'Email', 'Città', 'Specializzazione']] }]
});

const calcola = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: {
    name: 'Calcola valori',
    position: [880, 0],
    parameters: { jsCode: "// Per i contatti avvocati gia presenti (nessuna chiamata AI):\n// - Specializzazione (Prospect AI e Mailup): solo celle vuote, dal \"Settore\" con le parole chiave di campagna.json;\n// - Città (Prospect AI e Mailup): celle vuote di Mailup prese da Prospect AI (stessa email), e\n//   nomi tradotti in inglese con motore/liste/citta-inglese.json (es. Praga -> Prague).\n// Impostazioni da dist/compila-avvocati.json (generato da motore/build.py).\nconst imp = $('GitHub - Impostazioni avvocati').first().json;\nconst cfg = imp.specializzazione;\nconst CITTA_EN = new Map(Object.entries(imp.citta_inglese).map(([k, v]) => [k.toLowerCase(), v]));\nconst inglese = (c) => CITTA_EN.get(String(c ?? '').trim().toLowerCase()) || c;\nconst parole = cfg.parole.map(([rx, v]) => [new RegExp(rx, 'i'), v]);\nconst spec = (testo) => {\n  for (const [rx, v] of parole) if (rx.test(String(testo ?? ''))) return v;\n  return cfg.riserva;\n};\n\nconst pulito = (v) => String(v ?? '').trim().replace(/\\s+/g, ' ');\nconst lettera = (n) => { let s = ''; for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };\nconst scheda = (nome) => {\n  const [testa = [], ...righe] = $(nome).first().json.values || [];\n  const col = (h) => testa.findIndex(x => pulito(x).toLowerCase() === h.toLowerCase());\n  return { testa, righe, col };\n};\n\nconst pa = scheda('Google - Prospect AI');\nconst mu = scheda('Google - Mailup');\nconst NOME_PA = 'Prospect AI';\nconst NOME_MU = 'Mailup';\n\nconst manca = [];\nfor (const [s, n, cols] of [[pa, NOME_PA, ['Settore', 'Specializzazione', 'Città', 'Email certa']], [mu, NOME_MU, ['Settore', 'Specializzazione', 'Città', 'Email']]]) {\n  for (const c of cols) if (s.col(c) < 0) manca.push(`${n}: ${c}`);\n}\nif (manca.length) throw new Error(`Colonne mancanti (eseguire prima Aggiungi colonne): ${manca.join(', ')}`);\n\n// Città per email, da Prospect AI.\nconst cittaPerEmail = new Map();\nfor (const r of pa.righe) {\n  const email = pulito(r[pa.col('Email certa')]).toLowerCase();\n  const citta = inglese(pulito(r[pa.col('Città')]));\n  if (email && citta && !cittaPerEmail.has(email)) cittaPerEmail.set(email, citta);\n}\n\n// Colonna intera (dalla riga 2 all'ultima letta): i valori nuovi solo dove la cella e vuota;\n// \"correggi\" (se c'e) puo cambiare un valore gia presente (per le città: traduzione in inglese).\nconst colonna = (s, nomeScheda, intestazione, calcola, correggi) => {\n  const k = s.col(intestazione);\n  let compilate = 0;\n  let corrette = 0;\n  const valori = s.righe.map(r => {\n    const attuale = pulito(r[k]);\n    if (attuale) {\n      const nuovo = correggi ? correggi(attuale) : attuale;\n      if (nuovo !== attuale) corrette++;\n      return [nuovo];\n    }\n    const nuovo = calcola(r);\n    if (nuovo) compilate++;\n    return [nuovo || ''];\n  });\n  const L = lettera(k);\n  return { range: `'${nomeScheda}'!${L}2:${L}${s.righe.length + 1}`, values: valori, compilate, corrette, scheda: nomeScheda, colonna: intestazione };\n};\n\nconst blocchi = [\n  colonna(pa, NOME_PA, 'Specializzazione', r => spec(r[pa.col('Settore')])),\n  colonna(mu, NOME_MU, 'Specializzazione', r => spec(r[mu.col('Settore')])),\n  colonna(pa, NOME_PA, 'Città', () => '', inglese),\n  colonna(mu, NOME_MU, 'Città', r => cittaPerEmail.get(pulito(r[mu.col('Email')]).toLowerCase()) || '', inglese)\n].filter(b => b.values.length);\n\n// Riepilogo (conteggi per valore) per controllare il risultato senza aprire il foglio.\nconst conta = (b) => b.values.reduce((m, [v]) => (m[v || '(vuota)'] = (m[v || '(vuota)'] || 0) + 1, m), {});\nreturn [{\n  json: {\n    corpo: { valueInputOption: 'RAW', data: blocchi.map(({ range, values }) => ({ range, values })) },\n    riepilogo: blocchi.map(b => ({ scheda: b.scheda, colonna: b.colonna, righe: b.values.length, compilate_ora: b.compilate, corrette_ora: b.corrette, valori: conta(b) }))\n  }\n}];\n" }
  },
  output: [{ corpo: { valueInputOption: 'RAW', data: [] }, riepilogo: [] }]
});

const scrivi = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Scrivi colonne',
    position: [1100, 0],
    parameters: {
      method: 'POST',
      url: 'https://sheets.googleapis.com/v4/spreadsheets/' + FOGLIO + '/values:batchUpdate',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.corpo) }}'),
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ totalUpdatedCells: 0 }]
});

const nota = sticky('## Compila specializzazione avvocati\nUna tantum: per gli avvocati gia nel foglio riempie le celle vuote di **Specializzazione** (Prospect AI e Mailup, ricavata dal vecchio Settore con le parole chiave di campagne/avvocati/campagna.json) e di **Città** nella scheda Mailup (da Prospect AI, stessa email); traduce in inglese le città scritte in italiano o in lingua locale (motore/liste/citta-inglese.json). Nessuna chiamata AI. Specializzazione: solo celle vuote. Non eseguire mentre gira la campagna avvocati (06:00, 18:00).', [impostazioni, scrivi], { color: 7 });

export default workflow('prospect-compila-avvocati', 'Prospect | Strumenti | Compila specializzazione avvocati')
  .add(avvio)
  .to(impostazioni)
  .to(prospectAI)
  .to(mailup)
  .to(calcola)
  .to(scrivi)
  .add(nota);
