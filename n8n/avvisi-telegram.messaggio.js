// Testo del messaggio Telegram. Due casi:
// 1) chiamato da una campagna (tipo = esecuzione): ricerche AI fallite o nessun candidato;
// 2) Error Trigger: il workflow si e bloccato con un errore.
const j = $json;
const N8N = 'https://lefonti.app.n8n.cloud';
const q = '\u0022'; // virgolette per i link HTML
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ora = $now.setZone('Europe/Rome').toFormat('dd/MM HH:mm');

const consiglio = (errore) => {
  const e = String(errore || '');
  if (/rate limit|quota|insufficient|billing|credit/i.test(e)) {
    return 'Probabile credito OpenAI esaurito o limite di spesa raggiunto: platform.openai.com, Settings, Billing.';
  }
  if (/401|unauthori[sz]ed|invalid api key|incorrect api key/i.test(e)) {
    return 'Chiave API non valida: controllare la credenziale su n8n.';
  }
  if (/timeout|timed out|ECONNRESET|ETIMEDOUT|503|502|overloaded/i.test(e)) {
    return 'Servizio esterno lento o non raggiungibile: di solito si risolve da solo alla prossima esecuzione.';
  }
  return '';
};

let righe;
if (j.tipo === 'esecuzione') {
  const link = j.workflow_id ? `${N8N}/workflow/${j.workflow_id}/executions/${j.esecuzione}` : '';
  const tutte = Number(j.lotti_falliti) >= Number(j.lotti);
  righe = [
    `${tutte ? '🔴' : '🟠'} <b>${esc(j.workflow)}</b> · ${ora}`,
    `Ricerche AI fallite: <b>${j.lotti_falliti} su ${j.lotti}</b> · candidati: ${j.candidati} · salvati: ${j.salvati}`
  ];
  if (j.errore) righe.push(`Errore: ${esc(j.errore)}`);
  const c = consiglio(j.errore) ||
    (Number(j.candidati) === 0 && !Number(j.lotti_falliti) ? 'L’AI non ha restituito candidati: controllare temi e prompt.' : '');
  if (c) righe.push(`👉 ${esc(c)}`);
  if (link) righe.push(`<a href=${q}${link}${q}>Apri l’esecuzione ${esc(j.esecuzione)}</a>`);
} else {
  const ex = j.execution || {};
  const wf = j.workflow || {};
  const errore = ex.error?.message || ex.error?.description || 'errore sconosciuto';
  righe = [
    `❌ <b>${esc(wf.name || 'Workflow')}</b> si è bloccato · ${ora}`,
    `Nodo: ${esc(ex.lastNodeExecuted || '?')}`,
    `Errore: ${esc(errore)}`
  ];
  const c = consiglio(errore);
  if (c) righe.push(`👉 ${esc(c)}`);
  if (ex.url) righe.push(`<a href=${q}${ex.url}${q}>Apri l’esecuzione ${esc(ex.id || '')}</a>`);
}

return { json: { testo: righe.join('\n') } };
