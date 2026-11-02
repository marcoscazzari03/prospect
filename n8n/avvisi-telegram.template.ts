import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

// Avvisi Telegram per le campagne prospect: chiamato dalle campagne quando 3 o piu ricerche AI
// falliscono o non arriva nessun candidato, e da n8n (Error Trigger) quando un workflow si blocca.
// La chat Telegram non sta nella repo (pubblica): qui solo un segnaposto.
const TELEGRAM = { telegramApi: { id: 'ViG2xY39vHIjhiV9', name: 'Telegram' } };

const daCampagna = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger', version: 1.1,
  config: { name: 'Chiamato da una campagna', position: [0, 0], parameters: { inputSource: 'passthrough' } },
  output: [{ tipo: 'esecuzione', workflow: 'Prospect | Startup | Ricerca', esecuzione: '1', lotti: 5, lotti_falliti: 5, candidati: 0, salvati: 0, errore: 'OpenAI: Rate limit reached' }]
});

const errore = trigger({
  type: 'n8n-nodes-base.errorTrigger', version: 1,
  config: { name: 'Workflow bloccato', position: [0, 220] },
  output: [{ execution: { id: '1', lastNodeExecuted: 'Nodo', error: { message: 'errore' } }, workflow: { id: 'a', name: 'Workflow' } }]
});

const prova = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Messaggio di prova', position: [0, 440] },
  output: [{}]
});

const esempio = node({
  type: 'n8n-nodes-base.set', version: 3.4,
  config: {
    name: 'Esempio di avviso',
    position: [220, 440],
    parameters: {
      assignments: {
        assignments: [
          { id: 'e1', name: 'tipo', type: 'string', value: 'esecuzione' },
          { id: 'e2', name: 'workflow', type: 'string', value: 'PROVA - Prospect | Startup | Ricerca' },
          { id: 'e3', name: 'workflow_id', type: 'string', value: '' },
          { id: 'e4', name: 'esecuzione', type: 'string', value: '0' },
          { id: 'e5', name: 'lotti', type: 'number', value: 5 },
          { id: 'e6', name: 'lotti_falliti', type: 'number', value: 5 },
          { id: 'e7', name: 'candidati', type: 'number', value: 0 },
          { id: 'e8', name: 'salvati', type: 'number', value: 0 },
          { id: 'e9', name: 'errore', type: 'string', value: 'OpenAI: Rate limit reached (messaggio di prova)' }
        ]
      },
      options: {}
    }
  },
  output: [{ tipo: 'esecuzione' }]
});

const messaggio = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: {
    name: 'Prepara messaggio',
    position: [440, 220],
    parameters: { mode: 'runOnceForEachItem', jsCode: __CODICE_MESSAGGIO__ }
  },
  output: [{ testo: 'messaggio' }]
});

const invia = node({
  type: 'n8n-nodes-base.telegram', version: 1.2,
  config: {
    name: 'Invia su Telegram',
    position: [660, 220],
    parameters: {
      chatId: '__CHAT_ID__',
      text: expr('{{ $json.testo }}'),
      additionalFields: { parse_mode: 'HTML', appendAttribution: false, disable_web_page_preview: true }
    },
    credentials: TELEGRAM
  },
  output: [{}]
});

const nota = sticky('## Avvisi Telegram\nManda un messaggio Telegram quando una campagna prospect va male: 3 o più ricerche AI fallite o nessun candidato (chiamato dalle campagne), oppure quando un workflow si blocca con un errore (Error Trigger, impostato come Error workflow delle campagne).\n\n**Messaggio di prova**: esecuzione manuale per controllare che il bot scriva nella chat giusta.\n\nSorgente: n8n/avvisi-telegram.template.ts della repo **prospect** (la chat vera è solo qui su n8n).', [daCampagna, invia], { color: 7 });

export default workflow('prospect-avvisi-telegram', 'Prospect | Strumenti | Avvisi Telegram')
  .add(daCampagna)
  .to(messaggio)
  .to(invia)
  .add(errore)
  .to(messaggio)
  .add(prova)
  .to(esempio)
  .to(messaggio)
  .add(nota);
