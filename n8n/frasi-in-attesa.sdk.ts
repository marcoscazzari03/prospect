import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

// Il codice dei nodi Code si carica dai file: Elenca schede = n8n/frasi-in-attesa.elenca.js; Scegli contatti =
// n8n/frasi-in-attesa.scegli.js; Testo del sito = motore/aperture/testo-sito.js + n8n/frasi-in-attesa.richiesta.js;
// Controlla e prepara = motore/aperture/valida.js + n8n/frasi-in-attesa.scrivi.js.
// Frasi su misura per i contatti Asia PMI e Startup gia salvati ma non ancora scaricati (opzione B del 4 novembre).
const GOOGLE = { googleSheetsOAuth2Api: { id: 'ZayuDfh1wxejgzop', name: 'Spreadsheet ads.lefonti@gmail.com' } };
const OPENAI = { openAiApi: { id: 'ZQVz3FqwCrCMFcB9', name: 'OpenAi account' } };
const PARTENZA = { __rl: true, mode: 'id', value: '5PNFQ2Od1xTZlZ4P', cachedResultName: 'prospect_export_partenza' };
const RIGHE = { __rl: true, mode: 'id', value: 'R9wNDMOmHDGj7Hi5', cachedResultName: 'prospect_export_righe' };

const avvio = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Avvio manuale', position: [0, 0] },
  output: [{}]
});

const campagne = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Campagne con aperture',
    position: [220, 0],
    parameters: {
      url: 'https://api.github.com/repos/marcoscazzari03/prospect/contents/dist/aperture.json?ref=main',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Accept', value: 'application/vnd.github.raw+json' }, { name: 'User-Agent', value: 'n8n-prospect' }] },
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ campagna: 'startup', foglio_id: 'abc', modello: 'gpt-5.6-luna', contesto: '', riserva: ['a', 'b'], prompt: 'p' }]
});

const partenza = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Leggi email di partenza', position: [440, 0], executeOnce: true, alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: PARTENZA, returnAll: true }
  },
  output: [{ campagna: 'startup', email: 'nome@azienda.com' }]
});

const download = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Leggi download', position: [660, 0], executeOnce: true, alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: RIGHE, returnAll: true }
  },
  output: [{ campagna: 'startup', email: 'nome@azienda.com' }]
});

const elenca = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Elenca schede', position: [880, 0], parameters: { jsCode: 'return [];' } },
  output: [{ campagna: 'startup', foglio_id: 'abc', scheda: 'Mailup', intervallo: 'Mailup' }]
});

const leggi = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Leggi scheda', position: [1100, 0],
    parameters: {
      url: expr('https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values/{{ $json.intervallo }}'),
      authentication: 'predefinedCredentialType', nodeCredentialType: 'googleSheetsOAuth2Api', options: {}
    },
    credentials: GOOGLE
  },
  output: [{ values: [['Email', 'Apertura 1']] }]
});

const scegli = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Scegli contatti', position: [1320, 0], parameters: { jsCode: 'return [];' } },
  output: [{ campagna: 'startup', sito: 'https://azienda.com', azienda: 'Azienda' }]
});

const homepage = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'HTTP - Homepage', position: [1540, 0], onError: 'continueRegularOutput',
    parameters: {
      url: expr('{{ $json.sito }}'),
      sendHeaders: true,
      headerParameters: { parameters: [
        { name: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' },
        { name: 'Accept-Language', value: 'en;q=1.0,*;q=0.5' }
      ] },
      options: {
        batching: { batch: { batchSize: 5, batchInterval: 1000 } },
        response: { response: { neverError: true, responseFormat: 'text', outputPropertyName: 'html' } },
        timeout: 20000
      }
    }
  },
  output: [{ html: '<html></html>' }]
});

const richiesta = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Testo del sito', position: [1760, 0], parameters: { jsCode: 'return [];' } },
  output: [{ richiesta: { model: 'gpt-5.6-luna', input: 'x' } }]
});

const openai = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'OpenAI - Frasi su misura', position: [1980, 0], onError: 'continueRegularOutput',
    parameters: {
      method: 'POST', url: 'https://api.openai.com/v1/responses',
      authentication: 'predefinedCredentialType', nodeCredentialType: 'openAiApi',
      sendBody: true, contentType: 'json', specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.richiesta) }}'),
      options: {
        batching: { batch: { batchSize: 5, batchInterval: 1000 } },
        response: { response: { neverError: true } },
        timeout: 90000
      }
    },
    credentials: OPENAI
  },
  output: [{ output: [], usage: { input_tokens: 0, output_tokens: 0 } }]
});

const prepara = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Controlla e prepara', position: [2200, 0], parameters: { jsCode: 'return [];' } },
  output: [{ foglio_id: 'abc', corpo: { valueInputOption: 'RAW', data: [] } }]
});

const scrivi = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Scrivi frasi', position: [2420, 0],
    parameters: {
      method: 'POST',
      url: expr('https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values:batchUpdate'),
      authentication: 'predefinedCredentialType', nodeCredentialType: 'googleSheetsOAuth2Api',
      sendBody: true, contentType: 'json', specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.corpo) }}'),
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ totalUpdatedCells: 0 }]
});

const nota = sticky('## Frasi per i contatti in attesa\nSolo manuale, una tantum. Per i contatti di Asia PMI e Startup gia nella scheda Mailup ma non ancora scaricati e senza Apertura 1: legge la homepage, chiede a OpenAI le due frasi su misura (stesse regole del motore), le controlla e le scrive in Mailup e Prospect AI. Circa una chiamata OpenAI per contatto. Non eseguire mentre girano Asia o Startup.', [campagne, scrivi], { color: 7 });

export default workflow('prospect-frasi-in-attesa', 'Prospect | Strumenti | Frasi contatti in attesa')
  .add(avvio)
  .to(campagne)
  .to(partenza)
  .to(download)
  .to(elenca)
  .to(leggi)
  .to(scegli)
  .to(homepage)
  .to(richiesta)
  .to(openai)
  .to(prepara)
  .to(scrivi)
  .add(nota);
