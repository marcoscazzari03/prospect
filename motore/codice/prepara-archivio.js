const norm = (v) => String(v ?? '')
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Forme societarie e parole generiche da ignorare nel nome azienda (per campagna).
const FORME = new RegExp(`\\b(${CFG.forme_societarie})\\b`, 'g');
const normCompany = (v) => norm(v)
  .replace(FORME, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Chiave dell'azienda / studio = dominio del sito.
// Sulle piattaforme condivise conta anche il primo pezzo del percorso.
const chiaveDominio = (sito) => {
  const s = String(sito ?? '').trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/^www\./, '');
  const [host, primo] = s.split(/[?#]/)[0].split('/');
  if (!host) return '';
  return ['sites.google.com', 'linktr.ee'].includes(host) && primo ? `${host}/${primo}` : host;
};

const chiavi = new Set();
const nomi = new Set();
const domini = new Set();
const tentativi = {};

// Archivio = prospect salvati + scartati definitivi.
// Gli scartati 'Da riprovare' NON bloccano: vengono ripresi,
// ma contiamo quante volte sono gia stati rinviati.
const scartati = $('Read Scartati').all();

for (const i of scartati) {
  if (!String(i.json['Motivo scarto'] ?? '').startsWith('Da riprovare')) continue;
  const n = norm(i.json.Nome);
  if (n) tentativi[n] = (tentativi[n] || 0) + 1;
}

const righe = [
  ...$('Read Prospect').all(),
  ...scartati.filter(i =>
    !String(i.json['Motivo scarto'] ?? '').startsWith('Da riprovare')
  )
];

for (const item of righe) {
  const nome = norm(item.json.Nome);
  const azienda = normCompany(item.json.Azienda);
  const dominio = chiaveDominio(item.json.Sito);
  if (dominio) domini.add(dominio);
  if (!nome) continue;
  nomi.add(nome);
  if (azienda) chiavi.add(`${nome}|${azienda}`);
}

return [{
  json: {
    chiavi_esistenti: [...chiavi],
    nomi_esistenti: [...nomi],
    domini_esistenti: [...domini],
    tentativi_rr: tentativi,
    totale_esistenti: nomi.size
  }
}];
