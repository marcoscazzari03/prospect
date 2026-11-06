// Modelli delle email Le Fonti Awards per campagna (bozze approvate il 2 novembre 2026).
// Campi MailUp tra parentesi quadre. "esempio" serve solo per l'anteprima: dati inventati.
// Le stesse bozze, con note, sono in email/ nella radice della repo.

const LINK_MODULO = 'www.lefontiawards.com/application/';
const SELEZIONE = 'www.lefontiawards.com/selection/';

const chiusuraEn = [
  `If you would like to apply, you can complete the online application form: ${LINK_MODULO}`,
  `For details about the selection criteria and regulations, please visit: ${SELEZIONE}`,
  'Should you require further information, simply reply to this email and a member of our team will get back to you personally.'
];
const chiusuraIt = [
  `Se desidera candidarsi, può compilare il modulo online: ${LINK_MODULO}`,
  `Per i criteri di selezione e il regolamento: ${SELEZIONE}`,
  'Per qualsiasi informazione, risponda semplicemente a questa email: un membro del nostro team la ricontatterà personalmente.'
];
const communityEn = 'Beyond the recognition, Le Fonti Awards® open the door to an International Business Community of more than 10.5 million people, where new connections, collaborations and ideas can take shape.';
const communityIt = 'Oltre al riconoscimento, i Le Fonti Awards® aprono le porte a una Business Community internazionale di oltre 10,5 milioni di persone, dove nascono nuovi contatti, collaborazioni e idee.';

export const modelli = [
  {
    campagna: 'avvocati',
    etichetta: 'Avvocati',
    nota: 'Email classica per i penalisti, resa mirata dalla città dello studio.',
    campi: {
      nome: 'Nome', azienda: 'Studio', citta: 'Città'
    },
    esempio: { nome: 'Sophie', azienda: 'Martens Advocaten', citta: 'Antwerp' },
    en: {
      oggetto: '[nome], Le Fonti Awards® 2026: applications are open for criminal law firms',
      testo: [
        'Dear [nome],',
        'Applications are officially open for the Le Fonti Awards®, a prestigious international award celebrating excellence in business and in the legal profession. We are reaching out because of [azienda]\'s work in criminal law in [citta].',
        'For over 15 years, Le Fonti Awards® have recognised outstanding law firms and practitioners alongside leading companies and professionals, through events held in major business hubs around the world, including Milan, New York, London, Dubai, Singapore and Hong Kong. This year\'s edition also highlights excellence in criminal law.',
        'Beyond the recognition, Le Fonti Awards® open the door to an International Business Community of more than 10.5 million people, including a dedicated community of criminal lawyers, where new connections, collaborations and ideas can take shape.',
        ...chiusuraEn
      ]
    },
    it: {
      oggetto: '[nome], Le Fonti Awards® 2026: candidature aperte per gli studi di diritto penale',
      testo: [
        'Gentile [nome],',
        'le candidature ai Le Fonti Awards®, prestigioso premio internazionale che celebra l\'eccellenza nel mondo delle imprese e della professione legale, sono ufficialmente aperte. La contattiamo per il lavoro di [azienda] nel diritto penale a [citta].',
        'Da oltre 15 anni i Le Fonti Awards® premiano studi legali e professionisti di eccellenza insieme ad aziende e professionisti di primo piano, con eventi nei principali centri d\'affari del mondo, tra cui Milano, New York, Londra, Dubai, Singapore e Hong Kong. L\'edizione di quest\'anno dà spazio anche all\'eccellenza nel diritto penale.',
        'Oltre al riconoscimento, i Le Fonti Awards® aprono le porte a una Business Community internazionale di oltre 10,5 milioni di persone, che comprende una comunità dedicata agli avvocati penalisti, dove nascono nuovi contatti, collaborazioni e idee.',
        ...chiusuraIt
      ]
    }
  },
  {
    campagna: 'asia-pmi',
    etichetta: 'Asia PMI',
    nota: 'Si apre con due frasi su misura scritte dall\'AI solo con fatti del sito ufficiale (max 100 caratteri ciascuna). Se il sito non basta, frase standard di riserva.',
    campi: { nome: 'Nome', azienda: 'Azienda', apertura1: 'Apertura 1', apertura2: 'Apertura 2' },
    esempio: {
      nome: 'Daniel', azienda: 'Tookitaki',
      apertura1: 'We noticed FinCense, Tookitaki\'s AML and fraud prevention platform for APAC banks.',
      apertura2: 'Monitoring over 100 billion transactions for 30+ institutions is a remarkable achievement.'
    },
    en: {
      oggetto: '[nome], an invitation for [azienda] to the Le Fonti Awards®',
      testo: [
        'Dear [nome],',
        '[apertura1] [apertura2]',
        'This is why we would like to invite [azienda] to apply for the Le Fonti Awards®, a prestigious international award celebrating business excellence.',
        'For over 15 years, Le Fonti Awards® have recognised excellence across different sectors, bringing together leading professionals, companies and emerging brands through events held in major business hubs around the world, including Singapore, Hong Kong, Dubai, London, New York and Milan.',
        communityEn,
        ...chiusuraEn
      ]
    },
    it: {
      oggetto: '[nome], un invito per [azienda] ai Le Fonti Awards®',
      testo: [
        'Gentile [nome],',
        '[apertura1] [apertura2]',
        'Per questo vorremmo invitare [azienda] a candidarsi ai Le Fonti Awards®, prestigioso premio internazionale che celebra l\'eccellenza nel mondo delle imprese.',
        'Da oltre 15 anni i Le Fonti Awards® premiano l\'eccellenza in diversi settori, riunendo professionisti, aziende di primo piano e marchi emergenti con eventi nei principali centri d\'affari del mondo, tra cui Singapore, Hong Kong, Dubai, Londra, New York e Milano.',
        communityIt,
        ...chiusuraIt
      ]
    },
    esempioIt: {
      apertura1: 'Abbiamo notato FinCense, la piattaforma di Tookitaki contro riciclaggio e frodi per le banche dell\'Asia-Pacifico.',
      apertura2: 'Monitorare oltre 100 miliardi di transazioni per più di 30 istituti è un risultato notevole.'
    }
  },
  {
    campagna: 'startup',
    etichetta: 'Startup',
    nota: 'Stessa struttura di Asia PMI: due frasi su misura dal sito ufficiale, accento su fondatori e aziende emergenti.',
    campi: { nome: 'Nome', azienda: 'Azienda', apertura1: 'Apertura 1', apertura2: 'Apertura 2' },
    esempio: {
      nome: 'Marta', azienda: 'FreshCast',
      apertura1: 'We noticed FreshCast, which helps small retailers cut food waste with demand forecasting.',
      apertura2: 'Growing from a Lisbon pilot to 200 stores in two years is impressive.'
    },
    en: {
      oggetto: '[nome], Le Fonti Awards® is looking for Europe\'s most promising startups',
      testo: [
        'Dear [nome],',
        '[apertura1] [apertura2]',
        'This is why we would like to invite [azienda] to apply for the Le Fonti Awards®, a prestigious international award celebrating business excellence and the most innovative emerging companies.',
        'For over 15 years, Le Fonti Awards® have recognised excellence across different sectors, bringing together founders, leading professionals, companies and emerging brands through events held in major business hubs around the world, including Milan, London, New York, Dubai, Singapore and Hong Kong.',
        'Beyond the recognition, Le Fonti Awards® open the door to an International Business Community of more than 10.5 million people, where new connections, collaborations and ideas can take shape: a valuable stage for a growing company.',
        ...chiusuraEn
      ]
    },
    it: {
      oggetto: '[nome], i Le Fonti Awards® cercano le startup più promettenti d\'Europa',
      testo: [
        'Gentile [nome],',
        '[apertura1] [apertura2]',
        'Per questo vorremmo invitare [azienda] a candidarsi ai Le Fonti Awards®, prestigioso premio internazionale che celebra l\'eccellenza nel mondo delle imprese e le aziende emergenti più innovative.',
        'Da oltre 15 anni i Le Fonti Awards® premiano l\'eccellenza in diversi settori, riunendo fondatori, professionisti, aziende di primo piano e marchi emergenti con eventi nei principali centri d\'affari del mondo, tra cui Milano, Londra, New York, Dubai, Singapore e Hong Kong.',
        'Oltre al riconoscimento, i Le Fonti Awards® aprono le porte a una Business Community internazionale di oltre 10,5 milioni di persone, dove nascono nuovi contatti, collaborazioni e idee: una vetrina preziosa per un\'azienda in crescita.',
        ...chiusuraIt
      ]
    },
    esempioIt: {
      apertura1: 'Abbiamo notato FreshCast, che aiuta i piccoli negozi a ridurre lo spreco alimentare con le previsioni di domanda.',
      apertura2: 'Passare da un progetto pilota a Lisbona a 200 negozi in due anni è un risultato notevole.'
    }
  }
,
  {
    campagna: 'avvocati-specializzazione',
    etichetta: 'Avvocati (versione precedente, con specializzazione)',
    nota: 'Versione usata fino al 5 novembre: oltre alla città cita la specializzazione dello studio (colonna Specializzazione dell\'Excel). Su MailUp richiede anche il campo specializzazione.',
    campi: { nome: 'Nome', azienda: 'Studio', specializzazione: 'Specializzazione', citta: 'Città' },
    esempio: { nome: 'Sophie', azienda: 'Martens Advocaten', specializzazione: 'white-collar crime', citta: 'Antwerp' },
    en: {
      oggetto: '[nome], Le Fonti Awards® 2026: recognising excellence in [specializzazione]',
      testo: [
        'Dear [nome],',
        'Applications are officially open for the Le Fonti Awards®, a prestigious international award celebrating excellence in business and in the legal profession. We are reaching out because of [azienda]\'s work in [specializzazione] in [citta].',
        'For over 15 years, Le Fonti Awards® have recognised outstanding law firms and practitioners alongside leading companies and professionals, through events held in major business hubs around the world, including Milan, New York, London, Dubai, Singapore and Hong Kong. This year\'s edition also highlights excellence in criminal law, including [specializzazione].',
        'Beyond the recognition, Le Fonti Awards® open the door to an International Business Community of more than 10.5 million people, including a dedicated community of criminal lawyers, where new connections, collaborations and ideas can take shape.',
        ...chiusuraEn
      ]
    },
    it: {
      oggetto: '[nome], Le Fonti Awards® 2026: premiamo l\'eccellenza in [specializzazione]',
      testo: [
        'Gentile [nome],',
        'le candidature ai Le Fonti Awards®, prestigioso premio internazionale che celebra l\'eccellenza nel mondo delle imprese e della professione legale, sono ufficialmente aperte. La contattiamo per il lavoro di [azienda] in [specializzazione] a [citta].',
        'Da oltre 15 anni i Le Fonti Awards® premiano studi legali e professionisti di eccellenza insieme ad aziende e professionisti di primo piano, con eventi nei principali centri d\'affari del mondo, tra cui Milano, New York, Londra, Dubai, Singapore e Hong Kong. L\'edizione di quest\'anno dà spazio anche all\'eccellenza nel diritto penale, in ambiti come [specializzazione].',
        'Oltre al riconoscimento, i Le Fonti Awards® aprono le porte a una Business Community internazionale di oltre 10,5 milioni di persone, che comprende una comunità dedicata agli avvocati penalisti, dove nascono nuovi contatti, collaborazioni e idee.',
        ...chiusuraIt
      ]
    }
  }
];

// Esempio per l'italiano: aperture tradotte e, per gli avvocati, la città in italiano.
export const esempioPer = (m, lingua) => {
  if (lingua !== 'it') return m.esempio;
  const it = { ...m.esempio, ...(m.esempioIt || {}) };
  if (m.campagna === 'avvocati') Object.assign(it, { citta: 'Anversa' });
  if (m.campagna === 'avvocati-specializzazione') Object.assign(it, { specializzazione: "penale d'impresa", citta: 'Anversa' });
  return it;
};
