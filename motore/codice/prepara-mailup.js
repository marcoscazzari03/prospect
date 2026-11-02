// Nel foglio Mailup vogliamo solo prospect con una email certa
// (non quelle RocketReach di un altro dominio, da verificare a mano).
const pulito = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');

return $input.all()
  .map(i => i.json)
  .filter(j => pulito(j['Email certa']) && j['Stato email'] !== 'EMAIL DA VERIFICARE')
  .map(j => ({
    json: {
      Nome: pulito(j['Nome Mailup']),
      Cognome: pulito(j['Cognome Mailup']),
      Azienda: pulito(j.Azienda),
      Ruolo: pulito(j.Ruolo),
      Settore: pulito(j.Settore),
      'Settore Le Fonti': pulito(j['Settore Le Fonti']),
      'Comunità 1': pulito(j['Comunità 1']),
      'Comunità 2': pulito(j['Comunità 2']),
      Email: pulito(j['Email certa']),
      ...(CFG.mailup_paese ? { Paese: pulito(j.Paese) } : {})
    }
  }));
