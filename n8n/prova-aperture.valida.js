// Risultato della prova: frasi controllate (o di riserva) e token usati, per stimare il costo.
const richieste = $('Testo del sito').all().map(i => i.json);
return $input.all().map((item, i) => {
  const r = richieste[i];
  const risp = item.json || {};
  const testo = (risp.output || []).flatMap(o => o.content || []).find(c => c.type === 'output_text')?.text || '';
  const v = validaAperture(testo, r.riserva, r.azienda);
  return { json: {
    campagna: r.campagna, azienda: r.azienda, sito: r.sito, testo_caratteri: r.testo_caratteri,
    ...v, errore_openai: risp.error?.message || '',
    token_input: risp.usage?.input_tokens || 0, token_output: risp.usage?.output_tokens || 0
  } };
});
