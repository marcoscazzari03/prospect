// Richiesta a OpenAI per ogni contatto (come nel motore): prompt e impostazioni da dist/aperture.json.
const campagne = Object.fromEntries($('GitHub - Campagne con aperture').all().map(i => [i.json.campagna, i.json]));
const contatti = $('Scegli contatti').all().map(i => i.json);
return $input.all().map((item, i) => {
  const l = contatti[i];
  const c = campagne[l.campagna];
  const testo = testoSito(item.json.html);
  const prompt = c.prompt.replace(/{{azienda}}/g, l.azienda).replace(/{{paese}}/g, l.paese)
    .replace(/{{contesto}}/g, c.contesto).replace(/{{testo}}/g, testo || '(empty)');
  return { json: { richiesta: { model: c.modello, input: prompt, text: { format: { type: 'json_object' } },
    ...(c.ragionamento ? { reasoning: { effort: c.ragionamento } } : {}) } } };
});
