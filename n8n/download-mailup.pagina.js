// Con ?campagna=...&settimana=... restituisce le righe per l'Excel;
// senza parametri prepara la pagina con l'elenco delle settimane.
const q = $('Pagina Mailup').first().json.query || {};
const righe = $input.all().map(i => i.json).filter(r => r.email);

if (q.campagna && q.settimana) {
  const scelte = righe.filter(r => r.campagna === q.campagna && r.settimana === q.settimana);
  if (scelte.length) {
    return scelte.map(r => ({
      json: { Nome: r.nome, Cognome: r.cognome, Azienda: r.azienda, Ruolo: r.ruolo,
              Settore: r.settore, Email: r.email, Paese: r.paese }
    }));
  }
}

// Tutte le campagne seguite dall'export (tabella di stato), anche senza righe nuove.
const campagne = $('Leggi stato').all().map(i => i.json).filter(s => s.campagna)
  .map(s => ({ campagna: s.campagna, etichetta: s.etichetta || s.campagna }));
const settimane = {};
for (const r of righe) {
  if (!campagne.some(c => c.campagna === r.campagna)) campagne.push({ campagna: r.campagna, etichetta: r.etichetta });
  const s = settimane[r.settimana] ??= { settimana: r.settimana, totale: 0, conteggi: {} };
  s.totale++;
  s.conteggi[r.campagna] = (s.conteggi[r.campagna] || 0) + 1;
}
campagne.sort((a, b) => a.etichetta.localeCompare(b.etichetta));

const dati = { campagne, settimane: Object.values(settimane).sort((a, b) => b.settimana.localeCompare(a.settimana)) };
const html = __HTML_PAGINA__.replace('__DATI__', JSON.stringify(dati).replace(/</g, '\\u003c'));
return [{ json: { html } }];
