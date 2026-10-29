// Righe nuove della scheda Mailup di ogni campagna, dall'ultimo export in poi.
// Prima volta per una campagna: si segna solo il punto di partenza (nessuna riga).
// Le email gia esportate (anche da un'altra campagna) non vengono ripetute.
const campagne = $('GitHub - Elenco campagne').all().map(i => i.json);
const fogli = $('Google - Scheda Mailup').all().map(i => i.json);
const stato = Object.fromEntries($('Leggi stato').all()
  .filter(i => i.json.campagna)
  .map(i => [i.json.campagna, i.json]));
const esportate = new Set($('Leggi email esportate').all()
  .map(i => String(i.json.email ?? '').trim().toLowerCase())
  .filter(Boolean));

const settimana = $now.setZone('Europe/Rome').toFormat('yyyy-MM-dd');
const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');

const righe = [];
const nuovoStato = [];

campagne.forEach((c, i) => {
  const [testa = [], ...corpo] = fogli[i]?.values || [];
  const col = (nome) => testa.findIndex(h => pulito(h).toLowerCase() === nome);
  const k = {
    nome: col('nome'), cognome: col('cognome'), azienda: col('azienda'), ruolo: col('ruolo'),
    settore: col('settore'), email: col('email'), paese: col('paese')
  };
  const val = (r, campo) => (k[campo] >= 0 ? pulito(r[k[campo]]) : '');
  const totale = corpo.length;

  const prima = stato[c.campagna];
  if (!prima) {
    nuovoStato.push({ campagna: c.campagna, etichetta: c.etichetta, ultima_riga: totale, ultimo_export: `partenza ${settimana}` });
    return;
  }

  const da = Math.min(Number(prima.ultima_riga) || 0, totale);
  for (const r of corpo.slice(da)) {
    const email = val(r, 'email').toLowerCase();
    if (!email || esportate.has(email)) continue;
    esportate.add(email);
    righe.push({
      tipo: 'riga', settimana, campagna: c.campagna, etichetta: c.etichetta,
      nome: val(r, 'nome'), cognome: val(r, 'cognome'), azienda: val(r, 'azienda'), ruolo: val(r, 'ruolo'),
      settore: val(r, 'settore'), email, paese: val(r, 'paese')
    });
  }
  nuovoStato.push({ campagna: c.campagna, etichetta: c.etichetta, ultima_riga: totale, ultimo_export: settimana });
});

return [...righe, ...nuovoStato.map(s => ({ tipo: 'stato', ...s }))].map(json => ({ json }));
