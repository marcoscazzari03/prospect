import { workflow, node, trigger, sticky, expr, ifElse } from '@n8n/workflow-sdk';

// API per la app web leads.stagira.it: panoramica, scarica nuovi, storico, download passati.
// Protetta da una chiave segreta (intestazione x-chiave-app) che non sta nella repo.
const GOOGLE = { googleSheetsOAuth2Api: { id: 'ZayuDfh1wxejgzop', name: 'Spreadsheet ads.lefonti@gmail.com' } };
const PARTENZA = { __rl: true, mode: 'id', value: '5PNFQ2Od1xTZlZ4P', cachedResultName: 'prospect_export_partenza' };
const RIGHE = { __rl: true, mode: 'id', value: 'R9wNDMOmHDGj7Hi5', cachedResultName: 'prospect_export_righe' };

const richiesta = trigger({
  type: 'n8n-nodes-base.webhook', version: 2.1,
  config: {
    name: 'Richiesta app',
    position: [0, 0],
    parameters: { httpMethod: 'POST', path: 'prospect-app-api', responseMode: 'responseNode', options: {} }
  },
  output: [{ headers: {}, body: { azione: 'panoramica' } }]
});

const chiave = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Controlla chiave', position: [220, 0], parameters: { jsCode: 'return [{ json: { autorizzato: false } }];' } },
  output: [{ autorizzato: true }]
});

const autorizzato = ifElse({
  version: 2.2,
  config: {
    name: 'Autorizzato?',
    position: [440, 0],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
        conditions: [{ id: 'a1', leftValue: expr('{{ $json.autorizzato }}'), rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      },
      options: {}
    }
  },
  output: [{ autorizzato: true }]
});

const negato = node({
  type: 'n8n-nodes-base.respondToWebhook', version: 1.5,
  config: {
    name: 'Accesso negato',
    position: [660, 200],
    parameters: { respondWith: 'json', responseBody: '{ "ok": false, "errore": "non autorizzato" }', options: { responseCode: 401 } }
  },
  output: [{}]
});

const elenco = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Elenco campagne',
    position: [660, 0],
    executeOnce: true,
    parameters: {
      url: 'https://api.github.com/repos/marcoscazzari03/prospect/contents/dist/campagne.json?ref=main',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Accept', value: 'application/vnd.github.raw+json' }, { name: 'User-Agent', value: 'n8n-prospect' }] },
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ campagna: 'startup', etichetta: 'Startup', scheda: 'Mailup', foglio_id: 'abc' }]
});

const scheda = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'Google - Scheda Mailup',
    position: [880, 0],
    parameters: {
      url: expr("https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values/{{ encodeURIComponent($json.scheda + '!A:Z') }}"),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ values: [['Nome', 'Cognome', 'Azienda', 'Ruolo', 'Settore', 'Email', 'Paese']] }]
});

const leggiPartenza = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Leggi email di partenza',
    position: [1100, 0],
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: PARTENZA, returnAll: true }
  },
  output: [{ campagna: 'startup', email: 'nome@azienda.com' }]
});

const leggiDownload = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Leggi download',
    position: [1320, 0],
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: RIGHE, returnAll: true }
  },
  output: [{ settimana: '2026-11-02 18:30:00', campagna: 'startup', email: 'nome@azienda.com' }]
});

const esegui = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Esegui azione', position: [1540, 0], parameters: { jsCode: 'return [{ json: { risposta: {}, righe: [] } }];' } },
  output: [{ risposta: { ok: true }, righe: [] }]
});

const daSalvare = ifElse({
  version: 2.2,
  config: {
    name: 'Righe da salvare?',
    position: [1760, 0],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 's1', leftValue: expr('{{ $json.righe.length > 0 }}'), rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      },
      options: {}
    }
  },
  output: [{ righe: [] }]
});

const dividi = node({
  type: 'n8n-nodes-base.splitOut', version: 1,
  config: { name: 'Una riga per contatto', position: [1980, -120], parameters: { fieldToSplitOut: 'righe', options: {} } },
  output: [{ email: 'nome@azienda.com' }]
});

const salva = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Salva download',
    position: [2200, -120],
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: RIGHE,
      columns: {
        mappingMode: 'defineBelow',
        value: {
          settimana: expr('{{ $json.settimana }}'), campagna: expr('{{ $json.campagna }}'), etichetta: expr('{{ $json.etichetta }}'),
          nome: expr('{{ $json.nome }}'), cognome: expr('{{ $json.cognome }}'), azienda: expr('{{ $json.azienda }}'),
          ruolo: expr('{{ $json.ruolo }}'), settore: expr('{{ $json.settore }}'), email: expr('{{ $json.email }}'),
          paese: expr('{{ $json.paese }}'), settore_lefonti: expr('{{ $json.settore_lefonti }}'),
          comunita1: expr('{{ $json.comunita1 }}'), comunita2: expr('{{ $json.comunita2 }}')
        },
        schema: [{"id": "settimana", "displayName": "settimana", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "campagna", "displayName": "campagna", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "etichetta", "displayName": "etichetta", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "nome", "displayName": "nome", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "cognome", "displayName": "cognome", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "azienda", "displayName": "azienda", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "ruolo", "displayName": "ruolo", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "settore", "displayName": "settore", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "email", "displayName": "email", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "paese", "displayName": "paese", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "settore_lefonti", "displayName": "settore_lefonti", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "comunita1", "displayName": "comunita1", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}, {"id": "comunita2", "displayName": "comunita2", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true}]
      },
      options: { optimizeBulk: true }
    }
  },
  output: [{}]
});

const rispondiSalvato = node({
  type: 'n8n-nodes-base.respondToWebhook', version: 1.5,
  config: {
    name: 'Rispondi (download salvato)',
    position: [2420, -120],
    executeOnce: true,
    parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify($('Esegui azione').first().json.risposta) }}"), options: {} }
  },
  output: [{}]
});

const rispondi = node({
  type: 'n8n-nodes-base.respondToWebhook', version: 1.5,
  config: {
    name: 'Rispondi',
    position: [1980, 120],
    parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json.risposta) }}'), options: {} }
  },
  output: [{}]
});

const nota = sticky('## API App leads.stagira.it\nRiceve le richieste dell app web (Vercel) e risponde con: panoramica delle campagne, contatti nuovi da scaricare (salvati come nuovo download), storico, righe di un download passato.\n\nProtetta da una chiave segreta (intestazione x-chiave-app): la chiave vera è solo qui e su Vercel. Sorgente: n8n/api-app.template.ts della repo **prospect**.', [richiesta, esegui], { color: 7 });

export default workflow('prospect-api-app', 'Prospect | Strumenti | API App')
  .add(richiesta)
  .to(chiave)
  .to(autorizzato
    .onTrue(elenco.to(scheda).to(leggiPartenza).to(leggiDownload).to(esegui)
      .to(daSalvare.onTrue(dividi.to(salva).to(rispondiSalvato)).onFalse(rispondi)))
    .onFalse(negato))
  .add(nota);
