import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

// Porta su n8n le istantanee generate da motore/build.py, per tutte le campagne
// elencate in dist/deploy.json (quelle con "deploy": true in campagna.json).
const REPO = 'https://api.github.com/repos/marcoscazzari03/prospect/contents';
const REF = 'main';
const HEADERS = { parameters: [{ name: 'Accept', value: 'application/vnd.github.raw+json' }, { name: 'User-Agent', value: 'n8n-prospect' }] };

const avvio = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Avvio manuale', position: [0, 0] },
  output: [{}]
});

const leggiElenco = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Elenco campagne',
    position: [220, 0],
    parameters: {
      url: `${REPO}/dist/deploy.json?ref=${REF}`,
      sendHeaders: true,
      headerParameters: HEADERS,
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ campagna: 'avvocati', workflow: 'Prospect | Avvocati | Ricerca', id_n8n: 'rKUcaJepe2momTLB', file: 'dist/avvocati.json' }]
});

const leggiIstantanea = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.5,
  config: {
    name: 'GitHub - Istantanea workflow',
    position: [440, 0],
    parameters: {
      url: expr(`${REPO}/{{ $json.file }}?ref=${REF}`),
      sendHeaders: true,
      headerParameters: HEADERS,
      options: { response: { response: { responseFormat: 'json' } } }
    }
  },
  output: [{ name: 'Prospect | Avvocati | Ricerca', nodes: [], connections: {}, settings: {} }]
});

const aggiorna = node({
  type: 'n8n-nodes-base.n8n', version: 1,
  config: {
    name: 'Aggiorna workflow della campagna',
    position: [660, 0],
    parameters: {
      resource: 'workflow',
      operation: 'update',
      workflowId: { __rl: true, mode: 'id', value: expr("{{ $('GitHub - Elenco campagne').item.json.id_n8n }}") },
      workflowObject: expr('{{ JSON.stringify({ name: $json.name, nodes: $json.nodes, connections: $json.connections, settings: $json.settings }) }}')
    },
    credentials: { n8nApi: { id: 'ZF0e7oXtMU8MHCse', name: 'n8n account' } }
  },
  output: [{ id: 'rKUcaJepe2momTLB', name: 'Prospect | Avvocati | Ricerca' }]
});

const nota = sticky('## Deploy da GitHub (tutte le campagne)\nCopia su n8n le istantanee `dist/<campagna>.json` della repo **prospect** (generate da `motore/build.py`) nei workflow elencati in `dist/deploy.json`.\n\nUna campagna entra nell\'elenco con `"deploy": true` nel suo `campagna.json`.\n\nI gruppi di nodi non passano dall\'API: vanno reimpostati a parte.', [leggiElenco, aggiorna], { color: 7 });

export default workflow('prospect-deploy', 'Prospect | Strumenti | Deploy da GitHub')
  .add(avvio)
  .to(leggiElenco)
  .to(leggiIstantanea)
  .to(aggiorna)
  .add(nota);
