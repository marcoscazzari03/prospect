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
      url: 'https://api.github.com/repos/marcoscazzari03/prospect/contents/campagne/avvocati/campagna.json?ref=main',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Accept', value: 'application/vnd.github.raw+json' }, { name: 'User-Agent', value: 'n8n-prospect' }] },
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ motore: { specializzazione: { parole: [], riserva: 'criminal defence' } } }]
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
    parameters: { jsCode: __CODICE_COMPILA__ }
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

const nota = sticky('## Compila specializzazione avvocati\nUna tantum: per gli avvocati gia nel foglio riempie le celle vuote di **Specializzazione** (Prospect AI e Mailup, ricavata dal vecchio Settore con le parole chiave di campagne/avvocati/campagna.json) e di **Città** nella scheda Mailup (da Prospect AI, stessa email). Nessuna chiamata AI. Scrive solo celle vuote. Non eseguire mentre gira la campagna avvocati (06:00, 18:00).', [impostazioni, scrivi], { color: 7 });

export default workflow('prospect-compila-avvocati', 'Prospect | Strumenti | Compila specializzazione avvocati')
  .add(avvio)
  .to(impostazioni)
  .to(prospectAI)
  .to(mailup)
  .to(calcola)
  .to(scrivi)
  .add(nota);
