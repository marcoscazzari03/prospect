import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

// Il codice dei nodi Code si carica dai file: Scegli lead = n8n/prova-aperture.scegli.js;
// Testo del sito = motore/aperture/testo-sito.js + n8n/prova-aperture.richiesta.js;
// Controlla frasi = motore/aperture/valida.js + n8n/prova-aperture.valida.js.
// Prova delle frasi su misura (fase C): ultimi 25 lead per campagna (Startup, Asia PMI), homepage,
// due frasi da OpenAI, controllo. Non scrive su fogli o tabelle: il risultato resta nell esecuzione.
const GOOGLE = { googleSheetsOAuth2Api: { id: 'ZayuDfh1wxejgzop', name: 'Spreadsheet ads.lefonti@gmail.com' } };
const OPENAI = { openAiApi: { id: 'ZQVz3FqwCrCMFcB9', name: 'OpenAi account' } };

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
  output: [{ campagna: 'startup', foglio_id: 'abc', scheda: 'Prospect AI', modello: 'gpt-5.6-luna', contesto: '', riserva: ['a', 'b'], prompt: 'p' }]
});

const foglio = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Prospect AI',
    position: [440, 0],
    parameters: {
      url: expr("https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values/{{ encodeURIComponent($json.scheda + '!A:Z') }}"),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ values: [['Nome', 'Azienda', 'Sito', 'Email certa']] }]
});

const scegli = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Scegli lead', position: [660, 0], parameters: { jsCode: 'return [];' } },
  output: [{ campagna: 'startup', azienda: 'Azienda', sito: 'https://azienda.com' }]
});

const homepage = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'HTTP - Homepage',
    position: [880, 0],
    parameters: {
      url: expr('{{ $json.sito }}'),
      sendHeaders: true,
      headerParameters: { parameters: [
        { name: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' },
        { name: 'Accept-Language', value: 'en;q=1.0,*;q=0.5' }
      ] },
      options: {
        batching: { batch: { batchSize: 10, batchInterval: 200 } },
        response: { response: { neverError: true, responseFormat: 'text', outputPropertyName: 'html' } },
        timeout: 10000
      }
    }
  },
  output: [{ html: '<html></html>' }]
});

const richiesta = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Testo del sito', position: [1100, 0], parameters: { jsCode: 'return [];' } },
  output: [{ richiesta: { model: 'gpt-5.6-luna', input: 'x' } }]
});

const openai = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'OpenAI - Frasi su misura',
    position: [1320, 0],
    parameters: {
      method: 'POST',
      url: 'https://api.openai.com/v1/responses',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'openAiApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
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

const valida = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Controlla frasi', position: [1540, 0], parameters: { jsCode: 'return [];' } },
  output: [{ apertura1: 'a', apertura2: 'b', tipo_apertura: 'SU MISURA' }]
});

const nota = sticky('## Prova aperture (fase C)\nSolo manuale. Prende gli ultimi 25 lead con email di Startup e Asia PMI, legge la homepage e chiede a OpenAI le due frasi su misura (prompt in motore/aperture/prompt.txt della repo **prospect**), poi le controlla (max 100 caratteri, solo ASCII, frasi di riserva se il sito non basta).\n\n**Non scrive** su fogli o tabelle: i risultati sono nell esecuzione (nodo Controlla frasi). Costo: circa 50 chiamate OpenAI.', [campagne, valida], { color: 7 });

export default workflow('prospect-prova-aperture', 'Prospect | Strumenti | Prova aperture')
  .add(avvio)
  .to(campagne)
  .to(foglio)
  .to(scegli)
  .to(homepage)
  .to(richiesta)
  .to(openai)
  .to(valida)
  .add(nota);
