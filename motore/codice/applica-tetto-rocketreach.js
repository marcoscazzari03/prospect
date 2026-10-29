// RocketReach solo nei paesi dove trova email (null = tutti i paesi).
// Gli altri vanno negli Scartati senza ricerca.
const PAESI_ROCKETREACH = CFG.paesi_rocketreach;

// Tetto alle ricerche RocketReach per esecuzione: RocketReach ha un
// limite orario (~70 ricerche). Precedenza ai prospect ripresi da
// 'Da riprovare'; chi resta fuori va negli Scartati come 'Da riprovare'.
const TETTO = CFG.tetto_rocketreach;

const norm = (v) => String(v ?? '').trim().toLowerCase();

const ripresi = new Set();
try {
  for (const it of $('Aggiungi da riprovare').all()) {
    if (it.json.stato_lotto !== 'RIPROVA') continue;
    const candidati = JSON.parse(it.json.output || '{}').candidati || [];
    for (const c of candidati) ripresi.add(norm(c?.nome));
  }
} catch {}

const ordinati = $input.all()
  .map((it, i) => ({
    it,
    i,
    paeseOk: !PAESI_ROCKETREACH || PAESI_ROCKETREACH.includes(String(it.json.Paese || '')),
    prio: ripresi.has(norm(it.json.Nome)) ? 0 : 1
  }))
  .sort((a, b) => b.paeseOk - a.paeseOk || a.prio - b.prio || a.i - b.i);

let pos = 0;
return ordinati.map(x => ({
  json: {
    ...x.it.json,
    rr_paese_escluso: !x.paeseOk,
    entro_tetto_rr: x.paeseOk && pos++ < TETTO
  },
  pairedItem: { item: x.i }
}));
