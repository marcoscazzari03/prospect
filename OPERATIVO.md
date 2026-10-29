# Stato operativo

Aggiornato: **29 ottobre 2026**. Da aggiornare dopo ogni lavoro: è la memoria tra una sessione e l'altra.

## Campagne

| Campagna | Workflow n8n | Stato | Orario (Italia) | Foglio Google | RocketReach |
|---|---|---|---|---|---|
| `asia-pmi`: Singapore, Malesia, Indonesia | **Prospect \| Asia PMI \| Ricerca** (`f03lATvrzkJYAOw6`) | ✅ attivo; **dal 29 ottobre generato dal motore comune** (prova 4148: 51 salvati, 68% email dal sito, 23 ricerche RocketReach). Versione precedente salvata in `motore/modello-n8n.json` | Asia PMI \| PROVA motore** (`J3E4SmCKEZTz5JGM`), mai da attivare | 03:00 · 15:00 | TEST \| Prospect \| Search (`1mSipsEIoCcARMJj6PBnh1tkFVxYmLiBNcUnXRtSmiE4`) | tutti i paesi, max 60 |
| `avvocati`: penalisti in Europa | **Prospect \| Avvocati \| Ricerca** (`rKUcaJepe2momTLB`) | ✅ attivo dal 9 ottobre | 06:00 · 18:00 | TEST \| Prospect Avvocati \| Search (`1g0XfNM3vj5icNmfeEROydjFKHERVh5jqgRPo_nHO0Bs`) | solo Regno Unito, max 60 |
| `startup`: startup piccole in Europa | **Prospect \| Startup \| Ricerca** (`iXkSFJOLpJq8gl3D`) | ✅ attivo dal 29 ottobre (prima esecuzione manuale: 62 salvati) | 09:00 · 21:00 | TEST \| Prospect Startup \| Search (`1ZohqcRYehq3dHvYeiqWtRs_hq1Vg23cqBrC_jlxId0M`) | tutti i paesi, max 40 |

Su n8n i tre workflow delle campagne sono nel progetto **Leads Workflows** (`n8nd82fLpdlt3Dl6`), con le credenziali condivise (dal 29 ottobre). Nello stesso progetto ci sono anche Deploy da GitHub e Setup foglio. **Nomi:** `Prospect | <campagna o Strumenti> | <funzione>`; il nome di una campagna si cambia in `campagna.json` (`nome_workflow`), altrimenti il deploy lo riporta indietro. I fogli Google hanno ancora i nomi vecchi (`TEST | Prospect … | Search`).

Account usati da tutti i workflow: Google Sheets `Spreadsheet ads.lefonti@gmail.com`, OpenAI `OpenAi account` (modello `gpt-5.6-luna` con web search), RocketReach `RocketReach API`.

**Orari RocketReach** (un solo account, circa 70 ricerche l'ora): 03, 06, 09, 15, 18, 21. Singapore A / B / C (00:00 e 12:00) sono **spenti** dal 7 ottobre: se si riaccendono, ricontrollare gli orari.

## Workflow di servizio

| Workflow | Stato |
|---|---|
| **Prospect \| Strumenti \| Deploy da GitHub** (`dfcTpLlJ3RyHO8BR`, sorgente `n8n/deploy.sdk.ts`) | ✅ creato il 29 ottobre: aggiorna tutti i workflow in `dist/deploy.json` (primo deploy: esecuzione 4138) |
| **Prospect \| Strumenti \| Setup foglio** (`GPtrh61BOYhfp8Mc`, sorgente `n8n/setup-foglio.sdk.ts`) | ✅ creato il 29 ottobre: già eseguito per `startup` (4137). **Ogni esecuzione crea un file nuovo** |
| Prospect Avvocati \| Deploy da GitHub, Setup foglio, Leggi foglio | 🗄️ archiviati il 29 ottobre (puntavano alla vecchia repo `prospect-avvocati`) |

## Export Mailup settimanale

- **Prospect | Strumenti | Export Mailup settimanale** (`8BUuXswSFV3JHWs7`): ✅ attivo, ogni **lunedì alle 08:00**. Legge la scheda **Mailup** dei fogli delle campagne in `dist/campagne.json` (generato da `motore/build.py`: entra ogni campagna con `id_n8n`), prende le righe nuove dall'ultimo export, toglie le email già esportate (anche tra campagne diverse) e le salva nella tabella n8n `prospect_export_righe` (`R9wNDMOmHDGj7Hi5`). Fin dove è arrivato per ogni foglio: tabella `prospect_export_stato` (`6uYSjDtswew1752T`).
- **Punto di partenza: 29 ottobre 2026, 11:29** (esecuzione 4141): Asia 2.036 righe, Avvocati 1.278, Startup 62. Il primo export (lunedì 2 novembre) contiene solo le righe arrivate dopo.
- **Prospect | Strumenti | Download Mailup** (`n6dqEqH9MuWpslT3`): ✅ attivo. Pagina web con una riga per settimana e un pulsante «Scarica Excel» per campagna (colonne Nome, Cognome, Azienda, Ruolo, Settore, Email, Paese). **Il link contiene una chiave segreta e NON è nella repo** (pubblica): si trova nel nodo "Pagina Mailup" del workflow (Production URL). **Protetta da utente e password** (credenziale n8n **Download Mailup**, Basic Auth, dal 29 ottobre: senza password risponde 401). Blocca anche i programmi automatici (403 senza user-agent da browser). Per cambiare la password: modificare la credenziale su n8n. 💡 In futuro: app su Vercel con dominio proprio e login Google aziendale.
- Sorgenti: `n8n/export-mailup.*`, `n8n/download-mailup.*`, `n8n/pagine/download-mailup.html`; `python3 n8n/build-strumenti.py` rigenera gli `.sdk.ts`. Nota: il validatore n8n non accetta apostrofi nei commenti `//` del codice SDK né funzioni freccia fuori dai jsCode.

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
3. ✅ **Asia:** passata al motore comune il 29 ottobre dopo la prova 4148 (51 salvati, in linea con le esecuzioni precedenti 48–61, con meno ricerche RocketReach). Copia di prova archiviata. Da controllare nel Log le prime esecuzioni automatiche (la prima: 29 ottobre, 15:00). Nota per i deploy: n8n rifiuta l'aggiornamento se un riquadro (gruppo di nodi) del workflow su n8n contiene nodi che la nuova versione toglie; in quel caso togliere i riquadri (`setNodeGroups` vuoto), rifare il deploy e rimettere i riquadri di `dist/<campagna>.json`.
4. ✅ Vecchi workflow avvocati archiviati; nomi uniformati a **Prospect | <campagna o Strumenti> | <funzione>** (29 ottobre).
5. ✅ **RocketReach: email di un'altra persona o azienda** (29 ottobre). L'email RocketReach vale solo se il dominio è quello del sito, ha lo stesso nome con un'altra estensione, o contiene il nome del sito o dell'azienda. Altrimenti il prospect resta in Prospect AI con tipo email **ROCKETREACH - DA VERIFICARE** e **non va in Mailup** (né nell'export del lunedì). Misura su 88 email RocketReach di 24 esecuzioni: 7 da verificare (8%), quasi tutte davvero di un'altra azienda (es. `@bakernet.com` per uno studio indonesiano, `@edinburgh.gov.uk`). Nessun costo o chiamata API in più.
6. ⏳ **Avviso se tutti i lotti AI falliscono** (email o Telegram), nel motore: vale per tutte le campagne. Dal 12 al 19 ottobre gli avvocati hanno girato 14 volte a vuoto per un blocco OpenAI e nessuno se n'è accorto.
7. ⏳ **Non consumare i temi quando il lotto AI va in errore** (motore, tutte le campagne).
8. ⏳ Capire l'errore dell'esecuzione **4119** di Prospect | Asia PMI | Ricerca (28 ottobre, 03:00): le esecuzioni prima e dopo sono andate bene.
9. 💡 Rendere private le repo `prospect` e `prospect-avvocati`: contengono ID di fogli e workflow (nessuna password). Se `prospect` diventa privata, il deploy da GitHub ha bisogno di un token.
