import { workflow, node, trigger, sticky, expr, ifElse } from '@n8n/workflow-sdk';

// Pagina web per scaricare gli Excel settimanali per Mailup (tabella prospect_export_righe).
// Il percorso contiene una chiave segreta, che non sta nella repo (pubblica): qui solo un segnaposto.
const RIGHE = { __rl: true, mode: 'id', value: 'R9wNDMOmHDGj7Hi5', cachedResultName: 'prospect_export_righe' };

const pagina = trigger({
  type: 'n8n-nodes-base.webhook', version: 2.1,
  config: {
    name: 'Pagina Mailup',
    position: [0, 0],
    parameters: { httpMethod: 'GET', path: 'prospect-mailup-__CHIAVE__', responseMode: 'responseNode', options: { ignoreBots: true } }
  },
  output: [{ query: {} }]
});

const STATO = { __rl: true, mode: 'id', value: '6uYSjDtswew1752T', cachedResultName: 'prospect_export_stato' };

const leggiStato = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Leggi stato',
    position: [220, 0],
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: STATO, returnAll: true }
  },
  output: [{ campagna: 'startup', etichetta: 'Startup', ultima_riga: 62 }]
});

const leggiRighe = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Leggi export',
    position: [440, 0],
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: RIGHE, returnAll: true }
  },
  output: [{ settimana: '2026-11-02', campagna: 'startup', etichetta: 'Startup', email: 'nome@azienda.com' }]
});

const prepara = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: {
    name: 'Prepara pagina o file',
    position: [660, 0],
    parameters: { jsCode: __CODICE_PAGINA__ }
  },
  output: [{ html: '<html></html>' }]
});

const eFile = ifElse({
  version: 2.2,
  config: {
    name: 'È un download?',
    position: [880, 0],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'f1', leftValue: expr('{{ $json.html }}'), rightValue: '', operator: { type: 'string', operation: 'notExists', singleValue: true } }],
        combinator: 'and'
      },
      options: {}
    }
  },
  output: [{ Email: 'nome@azienda.com' }]
});

const excel = node({
  type: 'n8n-nodes-base.convertToFile', version: 1.2,
  config: {
    name: 'Crea Excel',
    position: [1100, -100],
    parameters: {
      operation: 'xlsx',
      binaryPropertyName: 'data',
      options: {
        fileName: expr('Mailup_{{ $("Pagina Mailup").first().json.query.campagna }}_{{ $("Pagina Mailup").first().json.query.settimana }}.xlsx'),
        sheetName: 'Mailup',
        headerRow: true
      }
    }
  },
  output: [{}]
});

const inviaFile = node({
  type: 'n8n-nodes-base.respondToWebhook', version: 1.5,
  config: {
    name: 'Invia Excel',
    position: [1320, -100],
    parameters: {
      respondWith: 'binary',
      responseDataSource: 'set',
      inputFieldName: 'data',
      options: {
        responseHeaders: {
          entries: [
            { name: 'Content-Type', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            { name: 'Content-Disposition', value: expr('attachment; filename="Mailup_{{ $("Pagina Mailup").first().json.query.campagna }}_{{ $("Pagina Mailup").first().json.query.settimana }}.xlsx"') },
            { name: 'Cache-Control', value: 'no-store' }
          ]
        }
      }
    }
  },
  output: [{}]
});

const inviaPagina = node({
  type: 'n8n-nodes-base.respondToWebhook', version: 1.5,
  config: {
    name: 'Invia pagina',
    position: [1100, 100],
    parameters: {
      respondWith: 'text',
      responseBody: expr('{{ $json.html }}'),
      options: {
        responseHeaders: {
          entries: [
            { name: 'Content-Type', value: 'text/html; charset=utf-8' },
            { name: 'Cache-Control', value: 'no-store' },
            { name: 'X-Robots-Tag', value: 'noindex, nofollow' }
          ]
        }
      }
    }
  },
  output: [{}]
});

const nota = sticky('## Download Mailup\nPagina web con gli export settimanali per Mailup (uno per campagna, creati da **Prospect | Strumenti | Export Mailup settimanale**). Il pulsante «Scarica Excel» scarica il file della settimana.\n\nIl link contiene una chiave segreta: **non condividerlo** fuori dal team. Sorgente: `n8n/download-mailup.template.ts` della repo **prospect** (la chiave vera è solo qui su n8n).', [pagina, prepara], { color: 7 });

export default workflow('prospect-download-mailup', 'Prospect | Strumenti | Download Mailup')
  .add(pagina)
  .to(leggiStato)
  .to(leggiRighe)
  .to(prepara)
  .to(eFile.onTrue(excel.to(inviaFile)).onFalse(inviaPagina))
  .add(nota);
