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
    parameters: { mode: 'runOnceForEachItem', jsCode: "// Testo del messaggio Telegram. Due casi:\n// 1) chiamato da una campagna (tipo = esecuzione): ricerche AI fallite o nessun candidato;\n// 2) Error Trigger: il workflow si e bloccato con un errore.\nconst j = $json;\nconst N8N = 'https://lefonti.app.n8n.cloud';\nconst q = '\\u0022'; // virgolette per i link HTML\nconst esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');\nconst ora = $now.setZone('Europe/Rome').toFormat('dd/MM HH:mm');\n\nconst consiglio = (errore) => {\n  const e = String(errore || '');\n  if (/rate limit|quota|insufficient|billing|credit/i.test(e)) {\n    return 'Probabile credito OpenAI esaurito o limite di spesa raggiunto: platform.openai.com, Settings, Billing.';\n  }\n  if (/401|unauthori[sz]ed|invalid api key|incorrect api key/i.test(e)) {\n    return 'Chiave API non valida: controllare la credenziale su n8n.';\n  }\n  if (/timeout|timed out|ECONNRESET|ETIMEDOUT|503|502|overloaded/i.test(e)) {\n    return 'Servizio esterno lento o non raggiungibile: di solito si risolve da solo alla prossima esecuzione.';\n  }\n  return '';\n};\n\nlet righe;\nif (j.tipo === 'esecuzione') {\n  const link = j.workflow_id ? `${N8N}/workflow/${j.workflow_id}/executions/${j.esecuzione}` : '';\n  const tutte = Number(j.lotti_falliti) >= Number(j.lotti);\n  righe = [\n    `${tutte ? '🔴' : '🟠'} <b>${esc(j.workflow)}</b> · ${ora}`,\n    `Ricerche AI fallite: <b>${j.lotti_falliti} su ${j.lotti}</b> · candidati: ${j.candidati} · salvati: ${j.salvati}`\n  ];\n  if (j.errore) righe.push(`Errore: ${esc(j.errore)}`);\n  const c = consiglio(j.errore) ||\n    (Number(j.candidati) === 0 && !Number(j.lotti_falliti) ? 'L’AI non ha restituito candidati: controllare temi e prompt.' : '');\n  if (c) righe.push(`👉 ${esc(c)}`);\n  if (link) righe.push(`<a href=${q}${link}${q}>Apri l’esecuzione ${esc(j.esecuzione)}</a>`);\n} else {\n  const ex = j.execution || {};\n  const wf = j.workflow || {};\n  const errore = ex.error?.message || ex.error?.description || 'errore sconosciuto';\n  righe = [\n    `❌ <b>${esc(wf.name || 'Workflow')}</b> si è bloccato · ${ora}`,\n    `Nodo: ${esc(ex.lastNodeExecuted || '?')}`,\n    `Errore: ${esc(errore)}`\n  ];\n  const c = consiglio(errore);\n  if (c) righe.push(`👉 ${esc(c)}`);\n  if (ex.url) righe.push(`<a href=${q}${ex.url}${q}>Apri l’esecuzione ${esc(ex.id || '')}</a>`);\n}\n\nreturn { json: { testo: righe.join('\\n') } };\n" }
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
