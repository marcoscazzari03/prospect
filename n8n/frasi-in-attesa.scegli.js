// Contatti "in attesa" (nella scheda Mailup, mai scaricati e non registrati alla partenza) senza Apertura 1,
// oppure con la frase di riserva (Tipo apertura = RISERVA in Prospect AI): si riprova a leggere il sito.
// Sito e riga di Prospect AI si trovano con l'email. Un elemento per contatto.
const campagne = $('GitHub - Campagne con aperture').all().map(i => i.json);
const schede = $('Elenca schede').all().map(i => i.json);
const valori = $input.all().map(i => i.json.values || []);
const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const minuscolo = (v) => pulito(v).toLowerCase();
const gia = new Set([
  ...$('Leggi email di partenza').all().map(i => i.json.email),
  ...$('Leggi download').all().map(i => i.json.email)
].map(minuscolo).filter(Boolean));
const lettera = (n) => { let s = ''; for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };
const tabella = (c, scheda) => {
  const i = schede.findIndex(s => s.campagna === c.campagna && s.scheda === scheda);
  const [testa = [], ...righe] = valori[i] || [];
  const col = (h) => testa.findIndex(x => pulito(x).toLowerCase() === h.toLowerCase());
  return { righe, col };
};
const out = [];
for (const c of campagne) {
  const pa = tabella(c, 'Prospect AI');
  const mu = tabella(c, 'Mailup');
  const k = { a1: mu.col('Apertura 1'), a2: mu.col('Apertura 2'), email: mu.col('Email') };
  const p = { a1: pa.col('Apertura 1'), a2: pa.col('Apertura 2'), tipo: pa.col('Tipo apertura'), email: pa.col('Email certa'),
    sito: pa.col('Sito'), azienda: pa.col('Azienda'), paese: pa.col('Paese') };
  if ([k.a1, k.a2, k.email, p.a1, p.a2, p.email, p.sito].some(x => x < 0)) throw new Error(`${c.campagna}: mancano colonne (eseguire prima Aggiungi colonne)`);
  const inPA = new Map();
  pa.righe.forEach((r, j) => { const e = minuscolo(r[p.email]); if (e && !inPA.has(e)) inPA.set(e, { r, riga: j + 2 }); });
  mu.righe.forEach((r, j) => {
    const email = minuscolo(r[k.email]);
    const x = inPA.get(email);
    const riserva = x && p.tipo >= 0 && pulito(x.r[p.tipo]) === 'RISERVA';
    if (!email || gia.has(email) || (pulito(r[k.a1]) && !riserva)) return;
    const sito = x ? pulito(x.r[p.sito]) : '';
    out.push({ json: {
      campagna: c.campagna, foglio_id: c.foglio_id, email, sito: sito ? (/^https?:\/\//i.test(sito) ? sito : 'https://' + sito) : '',
      azienda: x ? pulito(x.r[p.azienda]) : '', paese: x ? pulito(x.r[p.paese]) : '',
      celle_mailup: { a1: `'Mailup'!${lettera(k.a1)}${j + 2}`, a2: `'Mailup'!${lettera(k.a2)}${j + 2}` },
      celle_pa: x ? { a1: `'Prospect AI'!${lettera(p.a1)}${x.riga}`, a2: `'Prospect AI'!${lettera(p.a2)}${x.riga}`,
        tipo: p.tipo >= 0 ? `'Prospect AI'!${lettera(p.tipo)}${x.riga}` : '' } : null
    } });
  });
}
return out;
