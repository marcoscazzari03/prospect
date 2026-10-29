// Riesegue i nodi Code di due versioni di un workflow sugli stessi dati di
// un'esecuzione reale e confronta i risultati nodo per nodo.
//
// Uso: node motore/test/replay.js <fixture.json> <vecchio.json> <nuovo.json>
//
// fixture.json = { executionId, runData: { "<nodo>": [ { data: { main: [[{ json, pairedItem }]] } } ] } }
// (dati di n8n: contengono nomi ed email reali, NON metterli nella repo).
//
// I nodi "Estrai email ..." prendono l'HTML scaricato dal nodo HTTP, che non
// e nei dati salvati: per loro si usa un HTML di prova uguale per le due versioni.

const fs = require('fs');
const assert = require('assert');

const [fixturePath, vecchioPath, nuovoPath] = process.argv.slice(2);
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const run = fixture.runData;
const codici = (p) => Object.fromEntries(JSON.parse(fs.readFileSync(p, 'utf8')).nodes
  .filter(n => n.parameters && n.parameters.jsCode)
  .map(n => [n.name, n.parameters.jsCode]));
const vecchio = codici(vecchioPath);
const nuovo = codici(nuovoPath);

const uscita = (nodo, ramo = 0) => {
  const r = run[nodo];
  if (!r) throw new Error(`nodo ${nodo} non eseguito nei dati`);
  return (r[0].data.main[ramo] || []).map(i => ({ json: i.json, pairedItem: i.pairedItem }));
};

const finto$now = {
  setZone: (z) => ({ toFormat: (f) => `ADESSO(${z}|${f})` })
};

// Esegue un nodo Code. modo: 'tutti' (runOnceForAllItems) oppure 'ognuno'.
function esegui(js, modo, input, extra = {}) {
  const $ = (nome) => {
    if (extra.nodi && extra.nodi[nome]) return extra.nodi[nome];
    return {
      all: (ramo = 0) => JSON.parse(JSON.stringify(uscita(nome, ramo))),
      first: () => JSON.parse(JSON.stringify(uscita(nome)[0])),
      get item() { return JSON.parse(JSON.stringify(uscita(nome)[extra.indice ?? 0])); }
    };
  };
  const f = new Function('$', '$input', '$json', '$now', '$execution', '$itemIndex', js);
  const $execution = { id: fixture.executionId };
  if (modo === 'tutti') {
    const $input = { all: () => JSON.parse(JSON.stringify(input)), first: () => JSON.parse(JSON.stringify(input[0])) };
    const out = f($, $input, undefined, finto$now, $execution, 0);
    return out.map(o => o.json);
  }
  return input.map((it, i) => {
    const e = { ...extra, indice: i };
    const $i = (nome) => {
      if (e.nodi && e.nodi[nome]) return e.nodi[nome](i);
      return {
        all: (ramo = 0) => JSON.parse(JSON.stringify(uscita(nome, ramo))),
        first: () => JSON.parse(JSON.stringify(uscita(nome)[0])),
        get item() { return JSON.parse(JSON.stringify(uscita(nome)[i])); }
      };
    };
    const o = new Function('$', '$input', '$json', '$now', '$execution', '$itemIndex', js)(
      $i, { item: it }, JSON.parse(JSON.stringify(it.json)), finto$now, $execution, i);
    return o.json;
  });
}

const casi = [
  ['Prepara archivio', 'tutti', () => uscita('Read Esclusioni')],
  ['Genera 5 Lotti', 'tutti', () => uscita('Prepara archivio'), { casuale: true }],
  ['Normalizza output AI', 'ognuno', () => uscita('Ricerca prospect AI')],
  ['Prepara aggiornamento temi', 'tutti', () => uscita('Normalizza output AI')],
  ['Aggiungi da riprovare', 'tutti', () => uscita('Normalizza output AI')],
  ['Deduplica e prepara righe', 'tutti', () => uscita('Aggiungi da riprovare')],
  ['Controllo grandi aziende', 'ognuno', () => uscita('Deduplica e prepara righe')],
  ['Applica tetto RocketReach', 'tutti', () => uscita('Email certa trovata?', 1)],
  ['Rinvia (tetto RocketReach)', 'ognuno', () => uscita('Entro tetto RocketReach?', 1)],
  ['Prepara righe finali', 'ognuno', () => uscita('Riunisci risultati finali')],
  ['Prepara Mailup', 'tutti', () => uscita('Ha email?', 0)],
  ['Calcola statistiche', 'tutti', () => uscita('Prepara Mailup')],
];

// HTML di prova per i nodi "Estrai email": email del dominio (con nome, generica,
// privacy), gratuite in mailto, offuscate, segnaposto, link a contatti e note legali.
const htmlProva = (p) => {
  const dom = String(p.Sito || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const [nome = 'x', ...resto] = String(p.Nome || '').toLowerCase().split(/\s+/);
  const cognome = resto.pop() || 'y';
  return `<a href="/contact">Contact</a><a href="/impressum">Impressum</a><a href="/news/x">News</a>
    <a href="mailto:${nome}.${cognome}@${dom}">${nome}</a> info@${dom} privacy@${dom} team@${dom}
    hello [at] ${dom.replace('.', ' [dot] ')} <a href="mailto:${cognome}@gmail.com">g</a>
    firstname.lastname@${dom} logo@2x.png noreply@${dom} ${nome}@yahoo.com.sg`;
};

let errori = 0;
const confronta = (nome, a, b) => {
  try {
    assert.deepStrictEqual(b, a);
    console.log(`OK      ${nome} (${a.length} item)`);
  } catch (e) {
    errori++;
    console.log(`DIVERSO ${nome}`);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
        console.log('  vecchio:', JSON.stringify(a[i]).slice(0, 400));
        console.log('  nuovo:  ', JSON.stringify(b[i]).slice(0, 400));
        break;
      }
    }
  }
};

for (const [nome, modo, input, opz = {}] of casi) {
  if (!vecchio[nome] || !nuovo[nome]) { console.log(`--      ${nome} (manca in una versione)`); continue; }
  let a, b;
  if (opz.casuale) {
    // Math.random fissato: stessa sequenza per le due versioni.
    const orig = Math.random;
    let s = 1; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
    a = esegui(vecchio[nome], modo, input());
    s = 1;
    b = esegui(nuovo[nome], modo, input());
    Math.random = orig;
  } else {
    a = esegui(vecchio[nome], modo, input());
    b = esegui(nuovo[nome], modo, input());
  }
  confronta(nome, a, b);
}

// Nodi "Estrai email": stesso prospect (dalla deduplica) e stesso HTML di prova.
const prospect = uscita('Deduplica e prepara righe');
const conHtml = prospect.map(p => ({ json: { html: htmlProva(p.json) } }));
for (const [nome, sorgente] of [['Estrai email homepage', 'Deduplica e prepara righe'],
                                ['Estrai email pagina secondaria', 'Ha pagina secondaria?'],
                                ['Estrai email terza pagina', 'Serve terza pagina?']]) {
  if (!vecchio[nome] || !nuovo[nome]) { console.log(`--      ${nome} (manca in una versione)`); continue; }
  const nodi = { [sorgente]: (i) => ({ item: JSON.parse(JSON.stringify({ json: { ...prospect[i].json, 'Pagina da controllare': prospect[i].json.Sito + '/contact', 'Pagina da controllare 2': prospect[i].json.Sito + '/impressum' } })) }) };
  const a = esegui(vecchio[nome], 'ognuno', conHtml, { nodi });
  const b = esegui(nuovo[nome], 'ognuno', conHtml, { nodi });
  confronta(nome + ' (HTML di prova)', a, b);
}

console.log(errori ? `\n${errori} nodi con risultati diversi` : '\nNessuna differenza: stessi risultati.');
process.exit(errori ? 1 : 0);
