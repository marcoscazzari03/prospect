// Controllo delle frasi (come nel motore) e celle da scrivere, raggruppate per foglio Google.
const campagne = Object.fromEntries($('GitHub - Campagne con aperture').all().map(i => [i.json.campagna, i.json]));
const contatti = $('Scegli contatti').all().map(i => i.json);
const perFoglio = {};
const conta = {};
let token = 0;
$input.all().forEach((item, i) => {
  const l = contatti[i];
  const risp = item.json || {};
  const testo = (risp.output || []).flatMap(o => o.content || []).find(c => c.type === 'output_text')?.text || '';
  const v = validaAperture(testo, campagne[l.campagna].riserva, l.azienda);
  token += (risp.usage?.input_tokens || 0) + (risp.usage?.output_tokens || 0);
  const k = `${l.campagna} ${v.tipo_apertura}`; conta[k] = (conta[k] || 0) + 1;
  const d = (perFoglio[l.foglio_id] ??= []);
  d.push({ range: l.celle_mailup.a1, values: [[v.apertura1]] }, { range: l.celle_mailup.a2, values: [[v.apertura2]] });
  if (l.celle_pa) {
    d.push({ range: l.celle_pa.a1, values: [[v.apertura1]] }, { range: l.celle_pa.a2, values: [[v.apertura2]] });
    if (l.celle_pa.tipo) d.push({ range: l.celle_pa.tipo, values: [[v.tipo_apertura]] });
  }
});
return Object.entries(perFoglio).map(([foglio_id, data], i) => ({ json: {
  foglio_id, corpo: { valueInputOption: 'RAW', data },
  ...(i === 0 ? { riepilogo: { contatti: contatti.length, per_tipo: conta, token_totali: token } } : {})
} }));
