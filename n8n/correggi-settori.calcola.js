// Righe gia salvate: se il Settore Le Fonti e uno dei settori "da controllare" ma il settore scritto
// dall'AI parla di software/AI, diventa Internet & Applications Services e le comunità si ricalcolano
// (stesse regole del motore). Scrive solo le celle che cambiano. Aggiunge alla scheda Esclusioni i marchi mancanti.
const cfg = $('GitHub - Regole settori').first().json;
const SW = cfg.settori_software;
const SW_PAROLE = new RegExp(SW.parole, 'i');
const schede = $('Elenca schede').all().map(i => i.json);
const valori = $input.all().map(i => i.json.values || []);
const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const lettera = (n) => { let s = ''; for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };
const ITALIA = /^(italia|italy)$/i;
const comunita = (regole, settore, paese) => {
  const tematica = cfg.comunita_tematiche[settore] || '';
  const scegli = (regola, riserva) =>
    regola === 'tematica' ? (tematica || riserva || '') :
    regola === 'ceo_per_paese' ? (ITALIA.test(pulito(paese)) ? '02 Comunità di CEO' : '03 Comunità di CEO Internazionali') :
    (regola || '');
  const prima = scegli(regole.principale, regole.principale_riserva);
  const seconda = scegli(regole.seconda, regole.seconda_riserva);
  return [prima, seconda === prima ? '' : seconda];
};

const perFoglio = {};
const riepilogo = [];
schede.forEach((s, i) => {
  const c = cfg.campagne.find(x => x.campagna === s.campagna);
  const [testa = [], ...righe] = valori[i];
  const col = (h) => testa.findIndex(x => pulito(x).toLowerCase() === h.toLowerCase());
  const dati = (perFoglio[s.foglio_id] ??= []);

  if (s.scheda === 'Esclusioni') {
    const kNome = col('Nome o marchio');
    const kAttivo = col('Attivo');
    const norm = (v) => pulito(v).toLowerCase();
    const presenti = new Set(righe.map(r => norm(r[kNome])));
    const mancanti = c.esclusioni_nuove.filter(m => !presenti.has(norm(m)));
    mancanti.forEach((m, j) => {
      const riga = testa.map((h, k) => k === kNome ? m : k === kAttivo ? 'SI' : (pulito(h).toLowerCase() === 'motivo' || pulito(h).toLowerCase() === 'note') ? 'Grande rete internazionale (non PMI)' : '');
      dati.push({ range: `'Esclusioni'!A${righe.length + 2 + j}:${lettera(testa.length - 1)}${righe.length + 2 + j}`, values: [riga] });
    });
    riepilogo.push({ campagna: s.campagna, scheda: s.scheda, esclusioni_aggiunte: mancanti });
    return;
  }

  const k = { settore: col('Settore'), lf: col('Settore Le Fonti'), c1: col('Comunità 1'), c2: col('Comunità 2'), paese: col('Paese'), azienda: col('Azienda') };
  if (k.lf < 0 || k.settore < 0) { riepilogo.push({ campagna: s.campagna, scheda: s.scheda, errore: 'colonne mancanti' }); return; }
  const cambi = [];
  righe.forEach((r, j) => {
    const lf = pulito(r[k.lf]);
    if (!SW.settori_da_controllare.includes(lf) || !SW_PAROLE.test(pulito(r[k.settore]))) return;
    const riga = j + 2;
    const [c1, c2] = comunita(c.comunita, SW.settore, k.paese >= 0 ? r[k.paese] : '');
    dati.push({ range: `'${s.scheda}'!${lettera(k.lf)}${riga}`, values: [[SW.settore]] });
    if (k.c1 >= 0) dati.push({ range: `'${s.scheda}'!${lettera(k.c1)}${riga}`, values: [[c1]] });
    if (k.c2 >= 0) dati.push({ range: `'${s.scheda}'!${lettera(k.c2)}${riga}`, values: [[c2]] });
    cambi.push(`${pulito(r[k.azienda])}: ${lf} -> ${SW.settore} (${pulito(r[k.settore])})`);
  });
  riepilogo.push({ campagna: s.campagna, scheda: s.scheda, righe: righe.length, corrette: cambi.length, esempi: cambi.slice(0, 40) });
});

const out = Object.entries(perFoglio).filter(([, d]) => d.length)
  .map(([foglio_id, data]) => ({ json: { foglio_id, corpo: { valueInputOption: 'RAW', data } } }));
return out.length ? out.map((o, i) => (i === 0 ? { json: { ...o.json, riepilogo } } : o)) : [{ json: { foglio_id: '', corpo: null, riepilogo } }];
