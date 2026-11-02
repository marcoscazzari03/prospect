# App leads.stagira.it

App web privata (un solo utente) per vedere i contatti nuovi delle campagne prospect e scaricarli in Excel.
Ogni contatto si scarica **una sola volta**; lo storico permette di riscaricare un file passato.

- **Frontend e login**: questa cartella (Next.js), pubblicata su **Vercel** (*Root Directory* = `app`).
- **Dati**: n8n, workflow **Prospect | Strumenti | API App** (sorgente `n8n/api-app.*`), protetto da una chiave segreta.

## Variabili segrete su Vercel (Settings → Environment Variables)

| Nome | Cosa contiene |
|---|---|
| `APP_PASSWORD` | la password per entrare (scelta da Marco) |
| `SESSION_SECRET` | una stringa casuale lunga (firma il cookie di accesso) |
| `N8N_API_URL` | l'indirizzo del webhook dell'API su n8n (Production URL del nodo "Richiesta app") |
| `N8N_API_KEY` | la chiave segreta condivisa con il workflow API App su n8n |

Nessuna di queste va scritta nel codice o nella repo.

## Sicurezza

- Tutte le pagine richiedono il login (cookie firmato, 30 giorni); le API rispondono 401 senza login.
- Dopo 5 password sbagliate l'indirizzo viene bloccato per 10 minuti.
- Pagine non indicizzate (robots.txt, `X-Robots-Tag`, meta robots).
- La chiave verso n8n resta lato server: il browser non la vede mai.

## Sviluppo locale

```bash
npm install
N8N_API_URL=… N8N_API_KEY=… SESSION_SECRET=… APP_PASSWORD=… npx next dev
```
