// Solo l'app leads.stagira.it conosce la chiave (variabile segreta su Vercel e qui su n8n).
const chiave = String($json.headers?.['x-chiave-app'] || '');
return [{ json: { autorizzato: chiave.length > 20 && chiave === '__CHIAVE_APP__' } }];
