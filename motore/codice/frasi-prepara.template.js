// Frasi su misura (fase C): richiesta a OpenAI per ogni contatto con email, dal testo della
// homepage (scaricata qui sopra). Prompt in motore/aperture/prompt.txt, impostazioni in campagna.json -> aperture.
__TESTO_SITO__
const riga = $('Ha email?').item.json;
const testo = testoSito($json.html);
const A = CFG.aperture;
const prompt = CFG.aperture_prompt
  .replace(/{{azienda}}/g, riga.Azienda || '')
  .replace(/{{paese}}/g, riga.Paese || '')
  .replace(/{{contesto}}/g, A.contesto)
  .replace(/{{testo}}/g, testo || '(empty)');
return { json: {
  riga,
  richiesta: { model: A.modello, input: prompt, text: { format: { type: 'json_object' } },
    ...(A.ragionamento ? { reasoning: { effort: A.ragionamento } } : {}) }
} };
