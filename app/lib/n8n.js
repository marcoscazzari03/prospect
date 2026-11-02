// Tutte le richieste a n8n passano da qui, lato server: la chiave non arriva mai al browser.
export async function chiediAN8n(azione, dati = {}) {
  const risposta = await fetch(process.env.N8N_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-chiave-app': process.env.N8N_API_KEY || '' },
    body: JSON.stringify({ azione, ...dati }),
    cache: 'no-store'
  });
  const json = await risposta.json().catch(() => ({ ok: false, errore: `risposta non valida da n8n (${risposta.status})` }));
  if (!risposta.ok || !json.ok) throw new Error(json.errore || `errore n8n (${risposta.status})`);
  return json;
}
