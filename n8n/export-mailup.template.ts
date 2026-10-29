import { workflow, node, trigger, sticky, expr, ifElse } from '@n8n/workflow-sdk';

// Ogni lunedi alle 08:00: righe nuove della scheda Mailup di ogni campagna
// (elenco in dist/campagne.json della repo prospect) salvate nella tabella
// prospect_export_righe, da cui la pagina "Download Mailup" crea gli Excel.
const GOOGLE = { googleSheetsOAuth2Api: { id: 'ZayuDfh1wxejgzop', name: 'Spreadsheet ads.lefonti@gmail.com' } };
const STATO = { __rl: true, mode: 'id', value: '6uYSjDtswew1752T', cachedResultName: 'prospect_export_stato' };
const RIGHE = { __rl: true, mode: 'id', value: 'R9wNDMOmHDGj7Hi5', cachedResultName: 'prospect_export_righe' };

const lunedi = trigger({
  type: 'n8n-nodes-base.scheduleTrigger', version: 1.2,
  config: {
    name: 'Ogni lunedì | 08:00',
    position: [0, 0],
    parameters: { rule: { interval: [{ field: 'cronExpression', expression: '0 8 * * 1' }] } }
  },
  output: [{}]
});

const elenco = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Elenco campagne',
    position: [220, 0],
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
    position: [440, 0],
    parameters: {
      url: expr("https://sheets.googleapis.com/v4/spreadsheets/{{ $json.foglio_id }}/values/{{ encodeURIComponent($json.scheda + '!A:Z') }}"),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      options: {}
    },
    credentials: GOOGLE
  },
  output: [{ range: 'Mailup!A1:G3', values: [['Nome', 'Cognome', 'Azienda', 'Ruolo', 'Settore', 'Email', 'Paese']] }]
});

const leggiStato = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Leggi stato',
    position: [660, 0],
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: STATO, returnAll: true }
  },
  output: [{ campagna: 'startup', ultima_riga: 62, ultimo_export: '2026-11-02' }]
});

const leggiEsportate = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Leggi email esportate',
    position: [880, 0],
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: RIGHE, returnAll: true }
  },
  output: [{ email: 'nome@azienda.com' }]
});

const calcola = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: {
    name: 'Calcola righe nuove',
    position: [1100, 0],
    parameters: { jsCode: __CODICE_CALCOLA__ }
  },
  output: [{ tipo: 'riga', settimana: '2026-11-02', campagna: 'startup', email: 'nome@azienda.com' }]
});

const eRiga = ifElse({
  version: 2.2,
  config: {
    name: 'È una riga?',
    position: [1320, 0],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
        conditions: [{ id: 'r1', leftValue: expr('{{ $json.tipo }}'), rightValue: 'riga', operator: { type: 'string', operation: 'equals' } }],
        combinator: 'and'
      },
      options: {}
    }
  },
  output: [{ tipo: 'riga' }]
});

const salvaRighe = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Salva righe della settimana',
    position: [1540, -100],
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
          paese: expr('{{ $json.paese }}')
        },
        schema: __SCHEMA_RIGHE__
      },
      options: { optimizeBulk: true }
    }
  },
  output: [{}]
});

const salvaStato = node({
  type: 'n8n-nodes-base.dataTable', version: 1.1,
  config: {
    name: 'Aggiorna stato',
    position: [1540, 100],
    parameters: {
      resource: 'row',
      operation: 'upsert',
      dataTableId: STATO,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'campagna', condition: 'eq', keyValue: expr('{{ $json.campagna }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { campagna: expr('{{ $json.campagna }}'), etichetta: expr('{{ $json.etichetta }}'), ultima_riga: expr('{{ $json.ultima_riga }}'), ultimo_export: expr('{{ $json.ultimo_export }}') },
        schema: __SCHEMA_STATO__
      },
      options: {}
    }
  },
  output: [{}]
});

const nota = sticky('## Export Mailup settimanale\nOgni **lunedì alle 08:00** prende le righe nuove della scheda **Mailup** di ogni campagna (elenco: `dist/campagne.json` della repo **prospect**) e le salva nella tabella `prospect_export_righe`, una "settimana" per esecuzione. Le email già esportate non si ripetono.\n\nGli Excel si scaricano dalla pagina del workflow **Prospect | Strumenti | Download Mailup**.\n\nPrima esecuzione per una campagna: segna solo il punto di partenza (tabella `prospect_export_stato`).', [elenco, calcola], { color: 7 });

export default workflow('prospect-export-mailup', 'Prospect | Strumenti | Export Mailup settimanale')
  .add(lunedi)
  .to(elenco)
  .to(scheda)
  .to(leggiStato)
  .to(leggiEsportate)
  .to(calcola)
  .to(eRiga.onTrue(salvaRighe).onFalse(salvaStato))
  .add(nota);
