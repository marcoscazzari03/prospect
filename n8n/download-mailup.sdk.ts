import { workflow, node, trigger, sticky, expr, ifElse } from '@n8n/workflow-sdk';

// Pagina web per scaricare gli Excel settimanali per Mailup (tabella prospect_export_righe).
// Il percorso contiene una chiave segreta, che non sta nella repo (pubblica): qui solo un segnaposto.
const RIGHE = { __rl: true, mode: 'id', value: 'R9wNDMOmHDGj7Hi5', cachedResultName: 'prospect_export_righe' };

const pagina = trigger({
  type: 'n8n-nodes-base.webhook', version: 2.1,
  config: {
    name: 'Pagina Mailup',
    position: [0, 0],
    parameters: { httpMethod: 'GET', path: 'prospect-mailup-__CHIAVE__', authentication: 'basicAuth', responseMode: 'responseNode', options: { ignoreBots: true } },
    credentials: { httpBasicAuth: { id: 'oyD57JlzRLFdKCdg', name: 'Download Mailup' } }
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
    parameters: { jsCode: "// Con ?campagna=...&settimana=... restituisce le righe per l'Excel;\n// senza parametri prepara la pagina con l'elenco delle settimane.\nconst q = $('Pagina Mailup').first().json.query || {};\nconst righe = $input.all().map(i => i.json).filter(r => r.email);\n\nif (q.campagna && q.settimana) {\n  const scelte = righe.filter(r => r.campagna === q.campagna && r.settimana === q.settimana);\n  if (scelte.length) {\n    return scelte.map(r => ({\n      json: { Nome: r.nome, Cognome: r.cognome, Azienda: r.azienda, Ruolo: r.ruolo,\n              Settore: r.settore, Email: r.email, Paese: r.paese }\n    }));\n  }\n}\n\n// Tutte le campagne seguite dall'export (tabella di stato), anche senza righe nuove.\nconst campagne = $('Leggi stato').all().map(i => i.json).filter(s => s.campagna)\n  .map(s => ({ campagna: s.campagna, etichetta: s.etichetta || s.campagna }));\nconst settimane = {};\nfor (const r of righe) {\n  if (!campagne.some(c => c.campagna === r.campagna)) campagne.push({ campagna: r.campagna, etichetta: r.etichetta });\n  const s = settimane[r.settimana] ??= { settimana: r.settimana, totale: 0, conteggi: {} };\n  s.totale++;\n  s.conteggi[r.campagna] = (s.conteggi[r.campagna] || 0) + 1;\n}\ncampagne.sort((a, b) => a.etichetta.localeCompare(b.etichetta));\n\nconst dati = { campagne, settimane: Object.values(settimane).sort((a, b) => b.settimana.localeCompare(a.settimana)) };\nconst html = \"<!DOCTYPE html>\\n<html lang=\\\"it\\\">\\n<head>\\n<meta charset=\\\"utf-8\\\">\\n<meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1\\\">\\n<meta name=\\\"robots\\\" content=\\\"noindex, nofollow\\\">\\n<title>Export Mailup</title>\\n<style>\\n  :root {\\n    --sfondo: #f6f7f9; --carta: #ffffff; --testo: #1d2330; --tenue: #667085; --bordo: #e4e7ec;\\n    --accento: #2f5bea; --accento-testo: #ffffff; --vuoto: #98a2b3;\\n  }\\n  @media (prefers-color-scheme: dark) {\\n    :root {\\n      --sfondo: #111418; --carta: #1a1f26; --testo: #e6e8eb; --tenue: #9aa4b2; --bordo: #2a313b;\\n      --accento: #6d8cff; --accento-testo: #0d1117; --vuoto: #5b6573;\\n    }\\n  }\\n  * { box-sizing: border-box; }\\n  body { margin: 0; background: var(--sfondo); color: var(--testo);\\n         font: 16px/1.5 system-ui, -apple-system, \\\"Segoe UI\\\", Roboto, sans-serif; }\\n  main { max-width: 760px; margin: 0 auto; padding: 32px 16px 48px; }\\n  h1 { font-size: 24px; margin: 0 0 4px; }\\n  .sotto { color: var(--tenue); margin: 0 0 28px; }\\n  .settimana { background: var(--carta); border: 1px solid var(--bordo); border-radius: 12px;\\n               padding: 16px 18px; margin-bottom: 14px; }\\n  .settimana h2 { font-size: 16px; margin: 0 0 12px; }\\n  .settimana h2 small { color: var(--tenue); font-weight: 400; margin-left: 6px; }\\n  .riga { display: flex; align-items: center; justify-content: space-between; gap: 12px;\\n          padding: 10px 0; border-top: 1px solid var(--bordo); }\\n  .riga:first-of-type { border-top: 0; }\\n  .campagna { font-weight: 600; }\\n  .conta { color: var(--tenue); font-size: 14px; }\\n  a.scarica { background: var(--accento); color: var(--accento-testo); text-decoration: none;\\n              padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 14px; white-space: nowrap; }\\n  a.scarica:focus-visible { outline: 3px solid var(--accento); outline-offset: 2px; }\\n  .nessuno { color: var(--vuoto); font-size: 14px; }\\n  .vuota { background: var(--carta); border: 1px dashed var(--bordo); border-radius: 12px;\\n           padding: 24px; color: var(--tenue); text-align: center; }\\n</style>\\n</head>\\n<body>\\n<main>\\n  <h1>Export Mailup</h1>\\n  <p class=\\\"sotto\\\">I prospect nuovi di ogni campagna, una settimana per riga. Nuovo export ogni lunedì alle 08:00.</p>\\n  <div id=\\\"elenco\\\"></div>\\n</main>\\n<script id=\\\"dati\\\" type=\\\"application/json\\\">__DATI__</script>\\n<script>\\n  const dati = JSON.parse(document.getElementById('dati').textContent);\\n  const elenco = document.getElementById('elenco');\\n  const testo = (tag, cls, t) => { const e = document.createElement(tag); if (cls) e.className = cls; e.textContent = t; return e; };\\n  const data = (s) => new Date(s + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });\\n\\n  if (!dati.settimane.length) {\\n    elenco.appendChild(testo('div', 'vuota', 'Ancora nessun export: il primo arriva lunedì alle 08:00.'));\\n  }\\n  for (const s of dati.settimane) {\\n    const box = testo('section', 'settimana', '');\\n    const h = testo('h2', '', 'Lunedì ' + data(s.settimana));\\n    h.appendChild(testo('small', '', s.totale + ' contatti'));\\n    box.appendChild(h);\\n    for (const c of dati.campagne) {\\n      const n = s.conteggi[c.campagna] || 0;\\n      const riga = testo('div', 'riga', '');\\n      const info = document.createElement('div');\\n      info.appendChild(testo('div', 'campagna', c.etichetta));\\n      info.appendChild(testo('div', 'conta', n === 1 ? '1 contatto' : n + ' contatti'));\\n      riga.appendChild(info);\\n      if (n) {\\n        const a = testo('a', 'scarica', 'Scarica Excel');\\n        a.href = '?campagna=' + encodeURIComponent(c.campagna) + '&settimana=' + encodeURIComponent(s.settimana);\\n        riga.appendChild(a);\\n      } else {\\n        riga.appendChild(testo('span', 'nessuno', 'nessun contatto nuovo'));\\n      }\\n      box.appendChild(riga);\\n    }\\n    elenco.appendChild(box);\\n  }\\n</script>\\n</body>\\n</html>\\n\".replace('__DATI__', JSON.stringify(dati).replace(/</g, '\\\\u003c'));\nreturn [{ json: { html } }];\n" }
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

const nota = sticky('## Download Mailup\nPagina web con gli export settimanali per Mailup (uno per campagna, creati da **Prospect | Strumenti | Export Mailup settimanale**). Il pulsante «Scarica Excel» scarica il file della settimana.\n\nAccesso con utente e password (credenziale **Download Mailup**) e link con una chiave segreta: **non condividerlo** fuori dal team. Sorgente: `n8n/download-mailup.template.ts` della repo **prospect** (la chiave vera è solo qui su n8n).', [pagina, prepara], { color: 7 });

export default workflow('prospect-download-mailup', 'Prospect | Strumenti | Download Mailup')
  .add(pagina)
  .to(leggiStato)
  .to(leggiRighe)
  .to(prepara)
  .to(eFile.onTrue(excel.to(inviaFile)).onFalse(inviaPagina))
  .add(nota);
