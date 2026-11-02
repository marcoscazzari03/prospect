import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

// Aggiunge in fondo alla riga di intestazione delle schede le colonne richieste
// (dist/colonne.json della repo prospect) che mancano. Si puo rieseguire: se ci sono gia, non fa nulla.
const GOOGLE = { googleSheetsOAuth2Api: { id: 'ZayuDfh1wxejgzop', name: 'Spreadsheet ads.lefonti@gmail.com' } };

const avvio = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Avvio manuale', position: [0, 0] },
  output: [{}]
});

const elenco = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Elenco colonne',
    position: [220, 0],
    parameters: {
      url: 'https://api.github.com/repos/marcoscazzari03/prospect/contents/dist/colonne.json?ref=main',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Accept', value: 'application/vnd.github.raw+json' }, { name: 'User-Agent', value: 'n8n-prospect' }] },
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ campagna: 'startup', foglio_id: 'abc', scheda: 'Mailup', colonne: ['Settore Le Fonti'] }]
});

const intestazione = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Intestazione',
    position: [440, 0],
    parameters: {
      url: expr("https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values/{{ encodeURIComponent($json.scheda + '!1:1') }}"),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ values: [['Nome', 'Email']] }]
});

const calcola = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: {
    name: 'Colonne mancanti',
    position: [660, 0],
    parameters: { jsCode: __CODICE_COLONNE__ }
  },
  output: [{ campagna: 'startup', scheda: 'Mailup', intervallo: 'Mailup!H1:J1', corpo: { values: [['Settore Le Fonti']] } }]
});

const scrivi = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Scrivi intestazione',
    position: [880, 0],
    parameters: {
      method: 'PUT',
      url: expr("https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values/{{ encodeURIComponent($json.intervallo) }}?valueInputOption=RAW"),
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
  output: [{ updatedRange: 'Mailup!H1:J1', updatedCells: 3 }]
});

const nota = sticky('## Aggiungi colonne\nAggiunge in fondo alla riga 1 delle schede Prospect AI e Mailup le colonne richieste dalla repo **prospect** (dist/colonne.json) che ancora mancano. Le schede ignorano i dati delle colonne che non hanno, per questo va eseguito **prima** del deploy che le usa.\n\nSi può rieseguire: se le colonne ci sono già, non fa nulla. Non tocca le righe dei dati.', [elenco, scrivi], { color: 7 });

export default workflow('prospect-aggiungi-colonne', 'Prospect | Strumenti | Aggiungi colonne')
  .add(avvio)
  .to(elenco)
  .to(intestazione)
  .to(calcola)
  .to(scrivi)
  .add(nota);
