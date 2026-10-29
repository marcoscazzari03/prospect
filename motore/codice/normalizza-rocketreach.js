const prospect = $('Email certa trovata?').item.json;
const rr = $json;

const testoErrore = String(rr.response ?? rr.detail ?? rr.message ?? '');
const rateLimit = /rate limit/i.test(testoErrore);
const inCorso = ['progress', 'searching', 'waiting', 'queued', 'not queued']
  .includes(String(rr.status ?? '').toLowerCase());

const emails = Array.isArray(rr.emails) ? rr.emails : [];

// Prendiamo SOLO email professionali realmente validate
const valideProfessionali = emails.filter(e =>
  e &&
  e.email &&
  e.type === 'professional' &&
  e.smtp_valid === 'valid'
);

// Preferiamo quella consigliata da RocketReach
let emailRocketReach = '';

if (
  rr.recommended_professional_email &&
  valideProfessionali.some(e => e.email === rr.recommended_professional_email)
) {
  emailRocketReach = rr.recommended_professional_email;
} else if (valideProfessionali.length) {
  emailRocketReach = valideProfessionali[0].email;
}

// L'email RocketReach vale solo se e dell'azienda del prospect: stesso dominio
// del sito, stesso nome con un'altra estensione (es. foliume.io / foliume.com)
// o dominio che contiene il nome del sito o dell'azienda (es. thelionparcel.com
// per lionparcel.com). Altrimenti puo essere di un'altra persona o di un altro
// lavoro: resta nel foglio come "da verificare" ma non va in Mailup.
const SUFFISSI = /\.(co|com|org|net|gov|ac|edu|ltd|plc|or|go|sch|mil)\.[a-z]{2}$/;
const host = (v) => String(v ?? '').trim().toLowerCase()
  .replace(/^https?:\/\//, '').replace(/^\/\//, '')
  .split('/')[0].split('?')[0].split('#')[0]
  .replace(/^www\./, '').replace(/:\d+$/, '');
const nomeDominio = (h) => {
  const parti = h.replace(SUFFISSI, '.x').split('.');
  return parti.length >= 2 ? parti[parti.length - 2] : '';
};
const dominioSito = host(prospect.Sito);
const dominioEmail = emailRocketReach.split('@')[1] || '';
const compatto = (v) => String(v ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '');
const contiene = (a, b) => b.length >= 4 && a.includes(b);
const nomeEmail = compatto(nomeDominio(dominioEmail));
const nomeSito = compatto(nomeDominio(dominioSito));
const nomeAzienda = compatto(prospect.Azienda);
const stessaAzienda = Boolean(dominioEmail) && (
  (dominioSito && (
    dominioEmail === dominioSito ||
    dominioEmail.endsWith('.' + dominioSito) ||
    dominioSito.endsWith('.' + dominioEmail))) ||
  (nomeEmail.length >= 3 && nomeEmail === nomeSito) ||
  contiene(nomeEmail, nomeSito) || contiene(nomeSito, nomeEmail) ||
  (nomeEmail.length >= 3 && nomeEmail === nomeAzienda) ||
  contiene(nomeAzienda, nomeEmail) || contiene(nomeEmail, nomeAzienda)
);

// RATE LIMIT e RICERCA NON COMPLETATA finiscono negli Scartati
// come 'Da riprovare' e vengono ripresi all'esecuzione successiva.
let stato;
if (emailRocketReach) stato = stessaAzienda ? 'EMAIL VALIDATA' : 'EMAIL DA VERIFICARE';
else if (rateLimit) stato = 'RATE LIMIT';
else if (inCorso) stato = 'RICERCA NON COMPLETATA';
else if (rr.detail) stato = 'PERSONA NON TROVATA';
else stato = 'NESSUNA EMAIL VALIDA';

return {
  json: {
    ...prospect,
    'Email RocketReach': emailRocketReach,
    'Email RocketReach tutte': valideProfessionali.map(e => e.email).join(', '),
    'LinkedIn RocketReach': rr.linkedin_url || '',
    'Stato RocketReach': stato
  }
};
