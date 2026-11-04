// API dell'app leads.stagira.it. Azioni (campo "azione" nel corpo della richiesta):
// - panoramica: per ogni campagna contatti nuovi pronti, gia scaricati, ultimo download;
// - scarica: contatti mai scaricati di una campagna (o "tutte"), da salvare come nuovo download;
// - anteprima: gli stessi contatti di "scarica", solo da vedere (NON vengono segnati come scaricati);
// - storico: elenco dei download fatti (campagna, data, numero contatti);
// - download: righe di un download passato, per riscaricarlo.
// Nuovi = email della scheda Mailup non registrate alla partenza e mai scaricate (anche da altre campagne).
const corpo = $('Richiesta app').first().json.body || {};
const azione = String(corpo.azione || '');
const campagne = $('GitHub - Elenco campagne').all().map(i => i.json);
const fogli = $('Google - Scheda Mailup').all().map(i => i.json);
const partenza = $('Leggi email di partenza').all().map(i => i.json).filter(r => r.campagna);
const scaricate = $('Leggi download').all().map(i => i.json).filter(r => r.email);

const minuscolo = (e) => String(e ?? '').trim().toLowerCase();
const gia = new Set([...partenza.map(r => r.email), ...scaricate.map(r => r.email)].map(minuscolo).filter(Boolean));
const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const adesso = $now.setZone('Europe/Rome');

// Righe nuove della scheda Mailup di una campagna (aggiorna "visti" per non ripetere email tra campagne).
const nuoveDi = (c, i, visti) => {
  const [testa = [], ...corpoFoglio] = fogli[i]?.values || [];
  const col = (nome) => testa.findIndex(h => pulito(h).toLowerCase() === nome);
  const k = {
    nome: col('nome'), cognome: col('cognome'), azienda: col('azienda'), ruolo: col('ruolo'),
    settore: col('settore'), email: col('email'), paese: col('paese'),
    settore_lefonti: col('settore le fonti'), comunita1: col('comunità 1'), comunita2: col('comunità 2'),
    citta: col('città'), specializzazione: col('specializzazione'),
    apertura1: col('apertura 1'), apertura2: col('apertura 2')
  };
  const val = (r, campo) => (k[campo] >= 0 ? pulito(r[k[campo]]) : '');
  const out = [];
  for (const r of corpoFoglio) {
    const email = minuscolo(val(r, 'email'));
    if (!email || visti.has(email)) continue;
    visti.add(email);
    out.push({
      campagna: c.campagna, etichetta: c.etichetta,
      nome: val(r, 'nome'), cognome: val(r, 'cognome'), azienda: val(r, 'azienda'), ruolo: val(r, 'ruolo'),
      settore: val(r, 'settore'), email, paese: val(r, 'paese'),
      settore_lefonti: val(r, 'settore_lefonti'), comunita1: val(r, 'comunita1'), comunita2: val(r, 'comunita2'),
      citta: val(r, 'citta'), specializzazione: val(r, 'specializzazione'),
      apertura1: val(r, 'apertura1'), apertura2: val(r, 'apertura2')
    });
  }
  return out;
};

// Download passati raggruppati per campagna e data (colonna "settimana" della tabella).
const gruppi = {};
for (const r of scaricate) {
  const g = gruppi[`${r.campagna}|${r.settimana}`] ??= { campagna: r.campagna, etichetta: r.etichetta, download: r.settimana, contatti: 0 };
  g.contatti++;
}
const storico = Object.values(gruppi).sort((a, b) => String(b.download).localeCompare(String(a.download)));

let risposta = { ok: true, azione };
let righe = [];

if (azione === 'panoramica') {
  const visti = new Set(gia);
  risposta.campagne = campagne.map((c, i) => {
    const mie = storico.filter(g => g.campagna === c.campagna);
    return {
      campagna: c.campagna, etichetta: c.etichetta,
      nuovi: nuoveDi(c, i, visti).length,
      scaricati: mie.reduce((s, g) => s + g.contatti, 0),
      ultimo_download: mie[0]?.download || ''
    };
  });
} else if (azione === 'scarica') {
  const scelta = String(corpo.campagna || '');
  const download = adesso.toFormat('yyyy-MM-dd HH:mm:ss');
  const visti = new Set(gia);
  campagne.forEach((c, i) => {
    const nuove = nuoveDi(c, i, visti);
    if (scelta === 'tutte' || scelta === c.campagna) righe.push(...nuove.map(r => ({ ...r, settimana: download })));
  });
  if (scelta !== 'tutte' && !campagne.some(c => c.campagna === scelta)) {
    risposta = { ok: false, errore: `campagna sconosciuta: ${scelta}` };
    righe = [];
  } else {
    risposta.download = download;
    risposta.righe = righe;
  }
} else if (azione === 'anteprima') {
  const scelta = String(corpo.campagna || '');
  const visti = new Set(gia);
  const elenco = [];
  campagne.forEach((c, i) => {
    const nuove = nuoveDi(c, i, visti);
    if (scelta === 'tutte' || scelta === c.campagna) elenco.push(...nuove);
  });
  risposta.righe = elenco;
} else if (azione === 'storico') {
  risposta.storico = storico;
} else if (azione === 'download') {
  risposta.righe = scaricate
    .filter(r => r.campagna === corpo.campagna && String(r.settimana) === String(corpo.download))
    .map(({ id, createdAt, updatedAt, ...r }) => r);
} else {
  risposta = { ok: false, errore: `azione sconosciuta: ${azione}` };
}

return [{ json: { risposta, righe } }];
