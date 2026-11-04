// Frasi su misura: controllo (max 100 caratteri, solo ASCII, niente saluti o frasi vietate);
// se qualcosa non va, frasi di riserva della campagna. Le due frasi si aggiungono alla riga da salvare.
__VALIDA__
const { riga } = $('Prepara frasi su misura').item.json;
const testo = ($json.output || []).flatMap(o => o.content || []).find(c => c.type === 'output_text')?.text || '';
const v = validaAperture(testo, CFG.aperture.riserva, riga.Azienda);
return { json: { ...riga, 'Apertura 1': v.apertura1, 'Apertura 2': v.apertura2, 'Tipo apertura': v.tipo_apertura } };
