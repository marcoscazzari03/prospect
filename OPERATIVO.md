# Stato operativo

Aggiornato: **29 ottobre 2026**. Da aggiornare dopo ogni lavoro: è la memoria tra una sessione e l'altra.

## Campagne

| Campagna | Workflow n8n | Stato | Orario (Italia) | Foglio Google | RocketReach |
|---|---|---|---|---|---|
| `asia-pmi`: Singapore, Malesia, Indonesia | **Prospect \| Search** (`f03lATvrzkJYAOw6`) | ✅ attivo, ancora con il **codice vecchio** (non generato dal motore). Copia di prova col motore: **PROVA \| Prospect \| Search (motore)** (`J3E4SmCKEZTz5JGM`), mai da attivare | 03:00 · 15:00 | TEST \| Prospect \| Search (`1mSipsEIoCcARMJj6PBnh1tkFVxYmLiBNcUnXRtSmiE4`) | tutti i paesi, max 60 |
| `avvocati`: penalisti in Europa | **Prospect Avvocati \| Search** (`rKUcaJepe2momTLB`) | ✅ attivo dal 9 ottobre | 06:00 · 18:00 | TEST \| Prospect Avvocati \| Search (`1g0XfNM3vj5icNmfeEROydjFKHERVh5jqgRPo_nHO0Bs`) | solo Regno Unito, max 60 |
| `startup`: startup piccole in Europa | **Prospect Startup \| Search** (`iXkSFJOLpJq8gl3D`) | ✅ attivo dal 29 ottobre (prima esecuzione manuale: 62 salvati) | 09:00 · 21:00 | TEST \| Prospect Startup \| Search (`1ZohqcRYehq3dHvYeiqWtRs_hq1Vg23cqBrC_jlxId0M`) | tutti i paesi, max 40 |

Su n8n i tre workflow delle campagne sono nel progetto **Leads Workflows** (`n8nd82fLpdlt3Dl6`), con le credenziali condivise (dal 29 ottobre). I workflow di servizio sono ancora nel progetto personale.

Account usati da tutti i workflow: Google Sheets `Spreadsheet ads.lefonti@gmail.com`, OpenAI `OpenAi account` (modello `gpt-5.6-luna` con web search), RocketReach `RocketReach API`.

**Orari RocketReach** (un solo account, circa 70 ricerche l'ora): 03, 06, 09, 15, 18, 21. Singapore A / B / C (00:00 e 12:00) sono **spenti** dal 7 ottobre: se si riaccendono, ricontrollare gli orari.

## Workflow di servizio

| Workflow | Stato |
|---|---|
| **Prospect \| Deploy da GitHub** (`dfcTpLlJ3RyHO8BR`, sorgente `n8n/deploy.sdk.ts`) | ✅ creato il 29 ottobre: aggiorna tutti i workflow in `dist/deploy.json` (primo deploy: esecuzione 4138) |
| **Prospect \| Setup foglio** (`GPtrh61BOYhfp8Mc`, sorgente `n8n/setup-foglio.sdk.ts`) | ✅ creato il 29 ottobre: già eseguito per `startup` (4137). **Ogni esecuzione crea un file nuovo** |
| Prospect Avvocati \| Deploy da GitHub (`ukFESbZg52G35hja`) | vecchio, punta alla repo `prospect-avvocati`: da archiviare dopo il primo deploy col nuovo |
| Prospect Avvocati \| Setup foglio (`wzJfijNP6pvbBDJ3`) | vecchio, già eseguito: non rilanciare |
| Prospect Avvocati \| Leggi foglio (`UmI6VimWGam2nA8K`) | sola lettura del foglio avvocati, per i resoconti |

## Riorganizzazione (29 ottobre 2026)

Le campagne ora condividono un motore unico (`motore/`) e si distinguono solo per `campagne/<id>/`.

- **Avvocati:** il workflow generato dal motore è **identico** a quello attivo: stessi nodi, collegamenti, impostazioni e fogli. Il codice dei nodi, rieseguito sui dati reali dell'esecuzione 4133, dà gli stessi risultati in tutti i 15 nodi modificati. Il deploy non cambia il comportamento.
- **Asia (Singapore, Malesia, Indonesia):** il workflow attivo gira ancora col codice di prima. La versione generata dal motore (`dist/asia-pmi.json`) gli porta le migliorie fatte per gli avvocati:
  - email dal sito più precise: email offuscate (`nome [at] azienda [dot] com`), segnaposto e indirizzi finti scartati, email gratuite (gmail, yahoo.com.sg, singnet…) accettate se sono in un link mailto del sito;
  - **preferita l'email col nome della persona**, poi la generica (oggi è il contrario: prima info@, poi quella personale). Scartate jobs@, careers@, hr@;
  - **terza pagina** (privacy / note legali) se manca ancora l'email: gratis, solo richieste HTTP in più;
  - siti non ufficiali scartati prima (LinkedIn, Crunchbase, directory…): niente RocketReach sprecato;
  - nel Log, le colonne in più degli avvocati (Email sito nominative, Senza RocketReach (paese), Abbandonati dopo tentativi).
  
  Restano come oggi: deduplica per persona (non per azienda), RocketReach in tutti i paesi, "Da riprovare" senza limite di tentativi, stessi foglio, orari e prompt.
  **Da fare prima di attivarla:** una prova manuale e il confronto col Log.
- **Startup:** campagna nuova, vedi `campagne/startup/ROADMAP.md`.

## Prossimi passi

1. ✅ Ramo unito su `main`; workflow di servizio creati; avvocati ripubblicati dal motore (identici, ancora attivi).
2. ✅ **Startup:** attiva dal 29 ottobre alle 09:00 e 21:00. Dopo 4–6 esecuzioni: misure nella ROADMAP della campagna.
3. 🔄 **Asia:** prova manuale della copia `PROVA | Prospect | Search (motore)`, confronto col Log, poi `"deploy": true` (e togliere `prova`) e deploy; archiviare la copia di prova.
4. ⏳ Archiviare i vecchi **Prospect Avvocati | Deploy da GitHub** e **Setup foglio** (puntano alla repo `prospect-avvocati`).
5. ⏳ **Avviso se tutti i lotti AI falliscono** (email o Telegram), nel motore: vale per tutte le campagne. Dal 12 al 19 ottobre gli avvocati hanno girato 14 volte a vuoto per un blocco OpenAI e nessuno se n'è accorto.
6. ⏳ **Non consumare i temi quando il lotto AI va in errore** (motore, tutte le campagne).
7. ⏳ Capire l'errore dell'esecuzione **4119** di Prospect | Search (28 ottobre, 03:00): le esecuzioni prima e dopo sono andate bene.
8. 💡 Rendere private le repo `prospect` e `prospect-avvocati`: contengono ID di fogli e workflow (nessuna password). Se `prospect` diventa privata, il deploy da GitHub ha bisogno di un token.
