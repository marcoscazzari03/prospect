// Richiesta a OpenAI per ogni lead: prompt di motore/aperture/prompt.txt con il testo della homepage.
const lead = $('Scegli lead').all().map(i => i.json);
return $input.all().map((item, i) => {
  const l = lead[i];
  const testo = testoSito(item.json.html);
  const prompt = l.prompt
    .replace(/{{azienda}}/g, l.azienda).replace(/{{nome}}/g, l.nome).replace(/{{ruolo}}/g, l.ruolo)
    .replace(/{{paese}}/g, l.paese).replace(/{{contesto}}/g, l.contesto).replace(/{{testo}}/g, testo || '(empty)');
  return { json: { ...l, prompt: undefined, testo_caratteri: testo.length,
    richiesta: { model: l.modello, input: prompt, text: { format: { type: 'json_object' } } } } };
});
