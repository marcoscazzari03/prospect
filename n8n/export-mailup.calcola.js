// Contatti nuovi della scheda Mailup di ogni campagna, riconosciuti dall'email
// (non dalla posizione: si possono cancellare o riordinare righe della scheda).
// Gia visti = email registrate alla partenza + email gia esportate (anche da
// un'altra campagna). Prima volta per una campagna: registra come gia viste
// tutte le email presenti nella scheda, senza esportarle.
const campagne = $('GitHub - Elenco campagne').all().map(i => i.json);
const fogli = $('Google - Scheda Mailup').all().map(i => i.json);
const partenza = $('Leggi email di partenza').all().map(i => i.json).filter(r => r.campagna);
const gia = new Set([
  ...partenza.map(r => r.email),
  ...$('Leggi email esportate').all().map(i => i.json.email)
].map(e => String(e ?? '').trim().toLowerCase()).filter(Boolean));
const conPartenza = new Set(partenza.map(r => r.campagna));

const oggi = $now.setZone('Europe/Rome');
const settimana = oggi.toFormat('yyyy-MM-dd');
const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');

const out = [];

campagne.forEach((c, i) => {
  const [testa = [], ...corpo] = fogli[i]?.values || [];
  const col = (nome) => testa.findIndex(h => pulito(h).toLowerCase() === nome);
  const k = {
    nome: col('nome'), cognome: col('cognome'), azienda: col('azienda'), ruolo: col('ruolo'),
    settore: col('settore'), email: col('email'), paese: col('paese')
  };
  const val = (r, campo) => (k[campo] >= 0 ? pulito(r[k[campo]]) : '');

  if (!conPartenza.has(c.campagna)) {
    // Segnaposto: la campagna ha la sua partenza anche se la scheda e vuota.
    out.push({ tipo: 'partenza', campagna: c.campagna, email: '', data: oggi.toFormat('yyyy-MM-dd HH:mm') });
    for (const r of corpo) {
      const email = val(r, 'email').toLowerCase();
      if (!email || gia.has(email)) continue;
      gia.add(email);
      out.push({ tipo: 'partenza', campagna: c.campagna, email, data: oggi.toFormat('yyyy-MM-dd HH:mm') });
    }
    out.push({ tipo: 'stato', campagna: c.campagna, etichetta: c.etichetta, ultima_riga: corpo.length,
               ultimo_export: `partenza ${settimana}` });
    return;
  }

  for (const r of corpo) {
    const email = val(r, 'email').toLowerCase();
    if (!email || gia.has(email)) continue;
    gia.add(email);
    out.push({
      tipo: 'riga', settimana, campagna: c.campagna, etichetta: c.etichetta,
      nome: val(r, 'nome'), cognome: val(r, 'cognome'), azienda: val(r, 'azienda'), ruolo: val(r, 'ruolo'),
      settore: val(r, 'settore'), email, paese: val(r, 'paese')
    });
  }
  out.push({ tipo: 'stato', campagna: c.campagna, etichetta: c.etichetta, ultima_riga: corpo.length, ultimo_export: settimana });
});

return out.map(json => ({ json }));
