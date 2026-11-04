import { workflow, node, trigger, sticky, expr, ifElse } from '@n8n/workflow-sdk';

// Il codice dei nodi Code si carica dai file n8n/correggi-settori.elenca.js e n8n/correggi-settori.calcola.js.
// Corregge nelle righe gia salvate (Prospect AI e Mailup) i settori sbagliati delle aziende di software
// e ricalcola le comunità; aggiunge alla scheda Esclusioni i marchi nuovi. Nessuna chiamata AI.
const GOOGLE = { googleSheetsOAuth2Api: { id: 'ZayuDfh1wxejgzop', name: 'Spreadsheet ads.lefonti@gmail.com' } };

const avvio = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Avvio manuale', position: [0, 0] },
  output: [{}]
});

const regole = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Regole settori',
    position: [220, 0],
    parameters: {
      url: 'https://api.github.com/repos/marcoscazzari03/prospect/contents/dist/correggi-settori.json?ref=main',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Accept', value: 'application/vnd.github.raw+json' }, { name: 'User-Agent', value: 'n8n-prospect' }] },
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ campagne: [], settori_software: {}, comunita_tematiche: {} }]
});

const elenca = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Elenca schede', position: [440, 0], parameters: { jsCode: 'return [];' } },
  output: [{ campagna: 'startup', foglio_id: 'abc', scheda: 'Mailup' }]
});

const leggi = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Leggi scheda',
    position: [660, 0],
    parameters: {
      url: expr('https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values/{{ $json.intervallo }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ values: [['Azienda', 'Settore', 'Settore Le Fonti']] }]
});

const calcola = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Calcola correzioni', position: [880, 0], parameters: { jsCode: 'return [];' } },
  output: [{ foglio_id: 'abc', corpo: { valueInputOption: 'RAW', data: [] }, riepilogo: [] }]
});

const daScrivere = ifElse({
  version: 2.2,
  config: {
    name: 'Qualcosa da scrivere?',
    position: [1100, 0],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'q1', leftValue: expr('{{ $json.foglio_id }}'), rightValue: '', operator: { type: 'string', operation: 'notEmpty', singleValue: true } }],
        combinator: 'and'
      },
      options: {}
    }
  },
  output: [{ foglio_id: 'abc' }]
});

const scrivi = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Scrivi correzioni',
    position: [1320, -100],
    parameters: {
      method: 'POST',
      url: expr('https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values:batchUpdate'),
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

const niente = node({
  type: 'n8n-nodes-base.noOp', version: 1,
  config: { name: 'Niente da correggere', position: [1320, 100] },
  output: [{}]
});

const nota = sticky('## Correggi settori\nSolo manuale. Nelle schede Prospect AI e Mailup delle campagne con settore libero (Startup, Asia PMI): se il Settore Le Fonti e Legal, Financial, Banking, Insurance, Fiscal, Capital Markets o Information & Research ma il settore scritto dall AI parla di software/AI, lo cambia in Internet & Applications Services e ricalcola le comunità. Aggiunge alla scheda Esclusioni i marchi nuovi di campagna.json. Regole in dist/correggi-settori.json della repo **prospect**. Si puo rieseguire.', [regole, scrivi], { color: 7 });

export default workflow('prospect-correggi-settori', 'Prospect | Strumenti | Correggi settori')
  .add(avvio)
  .to(regole)
  .to(elenca)
  .to(leggi)
  .to(calcola)
  .to(daScrivere.onTrue(scrivi).onFalse(niente))
  .add(nota);
