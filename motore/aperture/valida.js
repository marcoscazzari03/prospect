// Controllo delle frasi su misura: JSON valido, "affidabile", massimo 100 caratteri, solo ASCII
// (MailUp: 200 byte per campo). Se qualcosa non va: frasi di riserva della campagna.
const ascii = (s) => String(s ?? '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[‘’‛]/g, "'").replace(/[“”]/g, '"')
  .replace(/[–—]/g, '-').replace(/…/g, '...')
  .replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
const validaAperture = (risposta, riserva, azienda) => {
  let dati = null;
  try { dati = JSON.parse(String(risposta ?? '').replace(/^```(json)?|```$/g, '').trim()); } catch { dati = null; }
  const a1 = ascii(dati?.apertura1);
  const a2 = ascii(dati?.apertura2);
  const problemi = [];
  if (!dati) problemi.push('risposta non valida');
  else if (dati.affidabile === false) problemi.push('sito poco chiaro');
  for (const [nome, f] of [['apertura1', a1], ['apertura2', a2]]) {
    if (dati && !f) problemi.push(`${nome} vuota`);
    if (f.length > 100) problemi.push(`${nome} troppo lunga (${f.length})`);
    if (/!|\[|\]|http/i.test(f)) problemi.push(`${nome} con caratteri non ammessi`);
  }
  const usaRiserva = problemi.length > 0;
  const metti = (s) => ascii(String(s).replace(/\[azienda\]/g, azienda || 'your company'));
  return {
    apertura1: usaRiserva ? metti(riserva[0]) : a1,
    apertura2: usaRiserva ? metti(riserva[1]) : a2,
    tipo_apertura: usaRiserva ? 'RISERVA' : 'SU MISURA',
    motivo_riserva: problemi.join('; '),
    fatti_usati: ascii(dati?.fatti_usati).slice(0, 300)
  };
};
