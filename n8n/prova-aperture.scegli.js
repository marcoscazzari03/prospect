// Per ogni campagna con le frasi su misura: gli ultimi 25 lead di Prospect AI con email e sito.
const PER_CAMPAGNA = 25;
const campagne = $('GitHub - Campagne con aperture').all().map(i => i.json);
const fogli = $input.all().map(i => i.json);
const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const out = [];
campagne.forEach((c, i) => {
  const [testa = [], ...righe] = fogli[i]?.values || [];
  const col = (h) => testa.findIndex(x => pulito(x).toLowerCase() === h.toLowerCase());
  const k = { nome: col('Nome'), azienda: col('Azienda'), ruolo: col('Ruolo'), paese: col('Paese'), sito: col('Sito'), email: col('Email certa') };
  const scelte = righe.filter(r => pulito(r[k.email]) && pulito(r[k.sito])).slice(-PER_CAMPAGNA);
  for (const r of scelte) {
    out.push({ json: {
      campagna: c.campagna, etichetta: c.etichetta, modello: c.modello, contesto: c.contesto, riserva: c.riserva, prompt: c.prompt,
      nome: pulito(r[k.nome]), azienda: pulito(r[k.azienda]), ruolo: pulito(r[k.ruolo]), paese: pulito(r[k.paese]),
      sito: /^https?:\/\//i.test(pulito(r[k.sito])) ? pulito(r[k.sito]) : 'https://' + pulito(r[k.sito])
    } });
  }
});
return out;
