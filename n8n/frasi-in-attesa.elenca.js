// Per ogni campagna con le frasi su misura: schede Prospect AI e Mailup da leggere.
const out = [];
for (const c of $('GitHub - Campagne con aperture').all().map(i => i.json)) {
  for (const scheda of ['Prospect AI', 'Mailup']) {
    out.push({ json: { campagna: c.campagna, foglio_id: c.foglio_id, scheda, intervallo: encodeURIComponent(`'${scheda}'!A:Z`) } });
  }
}
return out;
