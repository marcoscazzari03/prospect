import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

// Crea una tantum il foglio Google di una campagna nuova, con schede, intestazioni,
// temi ed esclusioni iniziali presi dalla repo GitHub prospect.
// Prima di eseguirlo: impostare la campagna nel nodo "Campagna".
const RAW = 'https://raw.githubusercontent.com/marcoscazzari03/prospect/main/campagne';
const GOOGLE = { googleSheetsOAuth2Api: { id: 'ZayuDfh1wxejgzop', name: 'Spreadsheet ads.lefonti@gmail.com' } };

const avvio = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Avvio manuale', position: [0, 0] },
  output: [{}]
});

const campagna = node({
  type: 'n8n-nodes-base.set', version: 3.4,
  config: {
    name: 'Campagna',
    position: [220, 0],
    parameters: {
      assignments: { assignments: [{ id: 'c1', name: 'campagna', type: 'string', value: 'startup' }] },
      options: {}
    }
  },
  output: [{ campagna: 'startup' }]
});

const leggiCfg = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - campagna.json',
    position: [440, 0],
    parameters: {
      url: expr(`${RAW}/{{ $json.campagna }}/campagna.json`),
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ foglio: { nome: 'TEST | Prospect Startup | Search', schede: {} }, colonne_prospect: [], colonne_mailup: [], colonne_scartati: [] }]
});

const leggiTemi = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Temi iniziali',
    position: [660, 0],
    parameters: {
      url: expr(`${RAW}/{{ $('Campagna').first().json.campagna }}/data/temi.csv`),
      options: { response: { response: { responseFormat: 'text', outputPropertyName: 'csv' } } }
    }
  },
  output: [{ csv: 'ID,Paese,Settore,Tema,Attivo' }]
});

const leggiEsclusioni = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Esclusioni iniziali',
    position: [880, 0],
    executeOnce: true,
    parameters: {
      url: expr(`${RAW}/{{ $('Campagna').first().json.campagna }}/data/esclusioni.csv`),
      options: { response: { response: { responseFormat: 'text', outputPropertyName: 'csv' } } }
    }
  },
  output: [{ csv: 'Nome o marchio,Categoria,Attivo' }]
});

const preparaDati = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: {
    name: 'Prepara schede',
    position: [1100, 0],
    parameters: {
      jsCode: "// Schede del foglio (gid fissi, il workflow le usa per gid) con le colonne\n// prese da campagne/<campagna>/campagna.json; Log uguale per tutte le campagne.\nconst cfg = $('GitHub - campagna.json').first().json;\nconst LOG = [\"Data ora\", \"Execution ID\", \"Lotti\", \"Lotti falliti\", \"Lotti recuperati\", \"Candidati AI\", \"Scartati deduplica\", \"Nuovi candidati\", \"% nuovi\", \"Email da sito\", \"Email sito nominative\", \"Lookup RocketReach\", \"RocketReach non trovati\", \"Email da RocketReach\", \"Salvati Prospect AI\", \"Scartati senza email\", \"Righe Mailup\", \"Riprovati da Scartati\", \"Ricontrolli RocketReach\", \"RocketReach rate limit\", \"Da riprovare\", \"Rinviati tetto RocketReach\", \"Senza RocketReach (paese)\", \"Escluse grandi aziende\", \"Abbandonati dopo tentativi\"];\nconst TEMI = ['ID', 'Paese', 'Settore', 'Tema', 'Attivo', 'Ultimo uso', 'Usi', 'Candidati totali', 'Nuovi totali', 'Ultimo esito'];\nconst ESCLUSIONI = ['Nome o marchio', 'Categoria', 'Attivo'];\nconst colonne = {\n  'Prospect AI': cfg.colonne_prospect,\n  'Mailup': cfg.colonne_mailup,\n  'Scartati': cfg.colonne_scartati,\n  'Log': LOG,\n  'Temi': TEMI,\n  'Esclusioni': ESCLUSIONI\n};\n\n// CSV con campi tra virgolette.\nconst parseCsv = (testo) => {\n  const righe = [];\n  let riga = [], campo = '', q = false;\n  const s = String(testo).replace(/\\r/g, '');\n  for (let i = 0; i < s.length; i++) {\n    const c = s[i];\n    if (q) {\n      if (c === '\"' && s[i + 1] === '\"') { campo += '\"'; i++; }\n      else if (c === '\"') q = false;\n      else campo += c;\n    } else if (c === '\"') q = true;\n    else if (c === ',') { riga.push(campo); campo = ''; }\n    else if (c === '\\n') { riga.push(campo); righe.push(riga); riga = []; campo = ''; }\n    else campo += c;\n  }\n  if (campo || riga.length) { riga.push(campo); righe.push(riga); }\n  const [testa, ...corpo] = righe.filter(r => r.some(Boolean));\n  return corpo.map(r => Object.fromEntries(testa.map((h, k) => [h, r[k] ?? ''])));\n};\n\nconst temi = parseCsv($('GitHub - Temi iniziali').first().json.csv);\nconst esclusioni = parseCsv($('GitHub - Esclusioni iniziali').first().json.csv);\nconst schede = Object.entries(cfg.foglio.schede);\n\nconst data = schede.map(([titolo]) => {\n  const cols = colonne[titolo];\n  const extra = titolo === 'Temi' ? temi : titolo === 'Esclusioni' ? esclusioni : [];\n  return { range: `'${titolo}'!A1`, values: [cols, ...extra.map(r => cols.map(c => r[c] ?? ''))] };\n});\n\nreturn [{\n  json: {\n    creazione: {\n      properties: { title: cfg.foglio.nome, locale: 'it_IT', timeZone: 'Europe/Rome' },\n      sheets: schede.map(([title, gid]) => ({ properties: { sheetId: gid, title, gridProperties: { frozenRowCount: 1 } } }))\n    },\n    valori: { valueInputOption: 'RAW', data },\n    temi: temi.length,\n    esclusioni: esclusioni.length\n  }\n}];"
    }
  },
  output: [{ creazione: {}, valori: {}, temi: 47, esclusioni: 110 }]
});

const creaFoglio = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Crea foglio Google',
    position: [1320, 0],
    parameters: {
      method: 'POST',
      url: 'https://sheets.googleapis.com/v4/spreadsheets',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.creazione) }}')
    },
    credentials: GOOGLE
  },
  output: [{ spreadsheetId: 'abc', spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/abc/edit' }]
});

const scriviValori = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Scrivi intestazioni, Temi ed Esclusioni',
    position: [1540, 0],
    parameters: {
      method: 'POST',
      url: expr('https://sheets.googleapis.com/v4/spreadsheets/{{ $json.spreadsheetId }}/values:batchUpdate'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{{ JSON.stringify($('Prepara schede').first().json.valori) }}")
    },
    credentials: GOOGLE
  },
  output: [{ spreadsheetId: 'abc', totalUpdatedRows: 10 }]
});

const nota = sticky('## Setup foglio (una tantum per campagna)\nCrea il file Google della campagna scelta nel nodo **Campagna** (nome, schede e colonne da `campagne/<campagna>/campagna.json` della repo **prospect**; temi ed esclusioni da `data/`).\n\n**Ogni esecuzione crea un file nuovo**: eseguirlo una sola volta per campagna, poi copiare l\'ID del file in `foglio.id` di campagna.json.', [campagna, scriviValori], { color: 7 });

export default workflow('prospect-setup-foglio', 'Prospect | Strumenti | Setup foglio')
  .add(avvio)
  .to(campagna)
  .to(leggiCfg)
  .to(leggiTemi)
  .to(leggiEsclusioni)
  .to(preparaDati)
  .to(creaFoglio)
  .to(scriviValori)
  .add(nota);
