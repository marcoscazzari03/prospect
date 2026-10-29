// Niente ricerca RocketReach in questa esecuzione:
// - paese dove RocketReach non trova email: scarto definitivo;
// - oltre il tetto: 'Da riprovare', viene ripreso dopo.
return {
  json: {
    ...$json,
    'Email RocketReach': '',
    'Email RocketReach tutte': '',
    'LinkedIn RocketReach': '',
    'Stato RocketReach': $json.rr_paese_escluso ? 'NO ROCKETREACH (PAESE)' : 'RINVIATO (TETTO)'
  }
};
