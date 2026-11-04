// Schede da leggere per ogni campagna: Prospect AI e Mailup (settori e comunità), Esclusioni se ci sono marchi nuovi.
const cfg = $('GitHub - Regole settori').first().json;
const out = [];
for (const c of cfg.campagne) {
  for (const scheda of ['Prospect AI', 'Mailup']) out.push({ json: { campagna: c.campagna, foglio_id: c.foglio_id, scheda, intervallo: encodeURIComponent(`'${scheda}'!A:Z`) } });
  if (c.esclusioni_nuove.length) out.push({ json: { campagna: c.campagna, foglio_id: c.foglio_id, scheda: 'Esclusioni', intervallo: encodeURIComponent("'Esclusioni'!A:Z") } });
}
return out;
