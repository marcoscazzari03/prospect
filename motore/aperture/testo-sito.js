// Testo leggibile della homepage per le frasi su misura: titolo, descrizione, titoli e
// testo visibile (senza script, stili, menu e cookie banner), al massimo ~3.000 caratteri.
const testoSito = (html) => {
  let h = String(html ?? '');
  const prendi = (rx) => (h.match(rx) || [])[1] || '';
  const titolo = prendi(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descrizione = prendi(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    prendi(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  h = h
    .replace(/<(script|style|noscript|svg|nav|footer|form|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*(cookie|consent|gdpr)[^>]*>[\s\S]*?<\/(div|section)>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|h\d|li|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'")
    .replace(/&[a-z]+;/gi, ' ');
  const righe = h.split('\n').map(r => r.replace(/\s+/g, ' ').trim()).filter(r => r.length > 25);
  const visti = new Set();
  const uniche = righe.filter(r => !visti.has(r) && visti.add(r));
  const pulisci = (s) => String(s).replace(/\s+/g, ' ').trim();
  return [pulisci(titolo), pulisci(descrizione), ...uniche].filter(Boolean).join('\n').slice(0, 3000);
};
