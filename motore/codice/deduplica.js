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

const parse = (raw) => {
  if (typeof raw !== 'string') return null;
  let s = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const host = (sito) => String(sito ?? '').trim().toLowerCase()
  .replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  .split('/')[0].split('?')[0].split('#')[0].trim();

// Chiave dell'azienda / studio = dominio del sito (con CFG.un_contatto_per_azienda: un contatto per dominio).
const chiaveDominio = (sito) => {
  const s = String(sito ?? '').trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/^www\./, '');
  const [h, primo] = s.split(/[?#]/)[0].split('/');
  if (!h) return '';
  return ['sites.google.com', 'linktr.ee'].includes(h) && primo ? `${h}/${primo}` : h;
};

// Siti che non sono il sito ufficiale dell'azienda / studio (+ quelli della campagna).
const NON_UFFICIALI = new RegExp('(^|\\.)(' + [
  'linkedin|facebook|instagram|twitter|x|youtube|tiktok|google|goo|yelp|trustpilot|doctolib|abogados365|legal500|chambers|chambersandpartners|lawyers|justia|avvo|solicitors|lawsociety|thelawyer|iclg|martindale|bestlawyers|doyleslegal|leaders?league|wikipedia|kompass|europages|infobel|paginasamarillas|yellowpages|gelbeseiten|pagesjaunes|herold|panoramafirm|firmy|zlatestranky',
  ...CFG.siti_non_ufficiali
].join('|') + ')\\.[a-z.]+$');

const cleanNamePart = (v) => String(v ?? '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '');

const prefissiDaIgnorare = new Set([
  'dr', 'doctor', 'mr', 'mrs', 'ms', 'miss', 'prof', 'professor', 'sir', 'madam', 'md',
  'avv', 'avvocato', 'me', 'maitre', 'mag', 'mgr', 'mec', 'adw', 'adv', 'lic', 'ldo', 'lda',
  'dra', 'jur', 'kc', 'qc', 'mjur', 'ing', 'judr', 'phdr', 'mudr'
]);

const generaEmail = (nomeCompleto, dominio) => {
  if (!nomeCompleto || !dominio) return [];
  const parti = String(nomeCompleto).trim().split(/\s+/).map(cleanNamePart).filter(Boolean);
  while (parti.length > 1 && prefissiDaIgnorare.has(parti[0])) parti.shift();
  if (!parti.length) return [];
  const first = parti[0];
  if (parti.length === 1) return [`${first}@${dominio}`];
  const last = parti[parti.length - 1];
  return [`${first}.${last}@${dominio}`, `${first}@${dominio}`, `${first.charAt(0)}${last}@${dominio}`];
};

// Settore Le Fonti (uno dei settori ufficiali) e Comunità di appartenenza.
// Il settore scelto dall'AI vale se è nella lista; altrimenti si usano le parole chiave
// sul testo dell'AI; se nessuna regola vale: "Other".
const SETTORI = new Map(CFG.settori.map(s => [s.toLowerCase(), s]));
const PAROLE = CFG.parole_settori.map(([rx, s]) => [new RegExp(rx, 'i'), s]);
// Rete di sicurezza (motore/liste/settori-software.json): un'azienda di software o AI che lavora
// per banche, studi legali, assicurazioni... non e del loro settore (es. legaltech -> Internet & Applications Services).
const SW = CFG.settori_software;
const SW_PAROLE = new RegExp(SW.parole, 'i');
const correggiSoftware = (settore, testo) =>
  SW.settori_da_controllare.includes(settore) && SW_PAROLE.test(String(testo ?? '')) ? SW.settore : settore;
const settoreLeFonti = (scelto, testo) => {
  if (CFG.settore_fisso) return CFG.settore_fisso;
  const esatto = SETTORI.get(String(scelto ?? '').trim().toLowerCase());
  if (esatto) return correggiSoftware(esatto, testo);
  const t = `${scelto ?? ''} ${testo ?? ''}`;
  for (const [rx, s] of PAROLE) if (rx.test(t)) return correggiSoftware(s, testo);
  return 'Other';
};
const ITALIA = /^(italia|italy)$/i;
const comunita = (settore, paese) => {
  const r = CFG.comunita;
  const tematica = CFG.comunita_tematiche[settore] || '';
  const scegli = (regola, riserva) =>
    regola === 'tematica' ? (tematica || riserva || '') :
    regola === 'ceo_per_paese' ? (ITALIA.test(String(paese ?? '').trim()) ? '02 Comunità di CEO' : '03 Comunità di CEO Internazionali') :
    (regola || '');
  const prima = scegli(r.principale, r.principale_riserva);
  const seconda = scegli(r.seconda, r.seconda_riserva);
  return [prima, seconda === prima ? '' : seconda];
};

// Specializzazione (solo campagne che la usano, es. avvocati): valore della lista scelto dall'AI;
// altrimenti parole chiave sul settore scritto dall'AI; altrimenti il valore di riserva.
const SPEC = CFG.specializzazione;
const SPEC_VALORI = SPEC ? new Map(SPEC.valori.map(v => [v.toLowerCase(), v])) : new Map();
const SPEC_PAROLE = SPEC ? SPEC.parole.map(([rx, v]) => [new RegExp(rx, 'i'), v]) : [];
const specializzazione = (scelta, testo) => {
  const esatta = SPEC_VALORI.get(String(scelta ?? '').trim().toLowerCase());
  if (esatta) return esatta;
  const t = `${scelta ?? ''} ${testo ?? ''}`;
  for (const [rx, v] of SPEC_PAROLE) if (rx.test(t)) return v;
  return SPEC.riserva;
};

// Città in inglese per le email (es. Praga -> Prague, Warszawa -> Warsaw): lista in motore/liste/citta-inglese.json.
const CITTA_EN = new Map(Object.entries(CFG.citta_inglese).map(([k, v]) => [k.toLowerCase(), v]));
const cittaInglese = (c) => CITTA_EN.get(String(c ?? '').trim().toLowerCase()) || c;

const archivio = $('Prepara archivio').first().json;
const visti = new Set(archivio.chiavi_esistenti || []);
const nomiVisti = new Set(archivio.nomi_esistenti || []);
const dominiVisti = new Set(archivio.domini_esistenti || []);

const nuovi = [];

for (const item of $input.all()) {
  const dati = parse(item.json.output);
  if (!dati || !Array.isArray(dati.candidati)) continue;

  for (const c of dati.candidati) {
    const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');

    const nome = pulito(c?.nome);
    const azienda = pulito(c?.azienda);
    const nomeN = norm(nome);
    const aziendaN = normCompany(azienda) || norm(azienda);
    if (!nomeN || !aziendaN) continue;

    // Solo il ruolo richiesto dalla campagna (es. avvocati: il fondatore / titolare dello studio).
    if (CFG.ruolo_richiesto && !new RegExp(CFG.ruolo_richiesto, 'i').test(pulito(c?.ruolo))) continue;

    // Persona o nome + studio gia presenti
    const key = `${nomeN}|${aziendaN}`;
    if (visti.has(key) || nomiVisti.has(nomeN)) continue;

    const fonte = typeof c?.fonte === 'string' && /^https?:\/\//i.test(c.fonte.trim())
      ? c.fonte.trim()
      : '';
    if (!fonte) continue;

    const sito = c?.sito ? String(c.sito).trim() : '';
    const dominio = host(sito);
    if (!sito || !dominio || NON_UFFICIALI.test(dominio)) continue;

    // Azienda / studio gia contattato (o gia preso in questa esecuzione)
    const studio = chiaveDominio(sito);
    if (CFG.un_contatto_per_azienda && dominiVisti.has(studio)) continue;

    const paginaContatti = typeof c?.pagina_contatti === 'string' &&
      /^https?:\/\//i.test(c.pagina_contatti.trim()) &&
      host(c.pagina_contatti) === dominio
        ? c.pagina_contatti.trim()
        : '';

    visti.add(key);
    nomiVisti.add(nomeN);
    dominiVisti.add(studio);

    const settoreAI = pulito(c?.settore) || CFG.settore_default;
    const settoreLF = settoreLeFonti(c?.settore_lefonti, settoreAI);
    const [comunita1, comunita2] = comunita(settoreLF, c?.paese);

    nuovi.push({
      json: {
        'Nome': nome,
        'Nome Mailup': pulito(c?.nome_proprio),
        'Cognome Mailup': pulito(c?.cognome),
        'Azienda': azienda,
        'Ruolo proposto': pulito(c?.ruolo),
        // Colonne in piu della campagna (es. Tipo studio, Città), dal campo dell'AI.
        ...Object.fromEntries(CFG.campi_extra.map(([colonna, campo]) =>
          [colonna, colonna === 'Città' ? cittaInglese(pulito(c?.[campo])) : pulito(c?.[campo])])),
        'Paese': pulito(c?.paese),
        'Settore': settoreAI,
        ...(SPEC ? { [SPEC.colonna]: specializzazione(c?.[SPEC.campo], settoreAI) } : {}),
        'Settore Le Fonti': settoreLF,
        'Comunità 1': comunita1,
        'Comunità 2': comunita2,
        'Sito': sito,
        'Email probabile/i': generaEmail(nome, dominio).join(', '),
        'Fonte analizzata': fonte,
        'Pagina contatti AI': paginaContatti,
        'Tentativi precedenti': Number(c?.tentativi) || 0
      }
    });
  }
}

return nuovi;
