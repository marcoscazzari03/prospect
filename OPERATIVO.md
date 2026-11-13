# Stato operativo

Aggiornato: **6 novembre 2026**. Da aggiornare dopo ogni lavoro: è la memoria tra una sessione e l'altra.

## ▶️ Riparti da qui (leggere per primo)

**Dal 4 novembre l'utente apre una sessione nuova ogni giorno** (le sessioni lunghe perdono il collegamento a n8n: il connettore scade e non si ricarica a metà conversazione). Ogni sessione:
1. legge questo file e `CLAUDE.md`;
2. controlla subito che gli strumenti n8n funzionino (una lettura, es. ultime esecuzioni). Se n8n "richiede autorizzazione": dirlo all'utente (claude.ai → Impostazioni → Connettori → n8n → disconnetti e ricollega, poi **nuova sessione**);
3. guarda i giri dall'ultima sessione (esito, numeri, settori e città: la priorità dell'utente) e lo dice in breve all'utente;
4. a fine lavoro aggiorna questa sezione ("Stato" e "In sospeso").

**Stato al 4 novembre (sera)**
- Campagne attive: Asia PMI (03:00, 15:00) versione `3cacf6e6-226f-42ea-93a5-09a88ce23e71`; Startup (09:00, 21:00) `375ba59e-19b6-4b26-bb57-1eef7435964b` (dal 6 novembre, frasi "We noticed"); Avvocati (06:00, 18:00) `0a7bf89a-2f03-4aff-9554-e3123bcafd94`. Tutte con Settore Le Fonti + Comunità, città in inglese, regola "software → Internet & Applications Services"; Avvocati con Specializzazione; Asia e Startup con **frasi su misura** (Apertura 1/2).
- App **https://prospect-gilt.vercel.app** (password su Vercel): Scarica nuovi, Anteprima (Excel che non segna nulla), Scarica storico completo, storico dei download, Modelli email. API App su n8n versione `8f1c1db0-d10e-4c81-b585-9ea5955a3068`.
- 4 novembre 14:30: l'utente ha scaricato dall'app tutti i 465 contatti in attesa (Asia 161, Avvocati 101, Startup 203). Campi MailUp creati (`apertura1`, `apertura2`, `citta`); **primo invio con i nuovi template programmato per la notte del 5 novembre**. Primo giro con frasi dal motore (Asia 4 nov 15:00): 33 nuovi, 29 su misura, 4 riserva.
- Email: 3 modelli approvati dal capo (in `email/` e nell'app), link candidatura `https://lefontiawards.com/application/`. **Dal 5 novembre la mail Avvocati non usa più la specializzazione** (decisione dell'utente): oggetto "…applications are open for criminal law firms", testo "…[azienda]'s work in criminal law in [citta]". La colonna Specializzazione resta nei fogli e nell'Excel (utile per filtrare). Nella pagina Modelli dell'app c'è anche la **versione precedente con specializzazione** (sotto Startup), per riferimento. Campi MailUp da creare: `apertura1`, `apertura2`, `citta`.
- Nessun resoconto automatico mattutino (cancellato su richiesta dell'utente).

- **6 novembre: frasi su misura al plurale** (richiesta utente): la frase 1 inizia con **"We noticed [azienda]…"** (prima "I came across"); frasi di riserva "We noticed [azienda] while researching…". Prompt `motore/aperture/prompt.txt`, riserve in `campagna.json`, rete di sicurezza in `motore/aperture/valida.js`, correzione delle frasi già scritte in **Correggi settori** (`n8n/correggi-settori.calcola.js`). Replay: nessuna differenza sui dati di prova. **Fatto (6 novembre): deploy 4392** (Asia `3cacf6e6-226f-42ea-93a5-09a88ce23e71`, Startup `375ba59e-19b6-4b26-bb57-1eef7435964b`, Avvocati invariato) e **Correggi settori 4393**: frasi già scritte portate al plurale (Asia 335 Prospect AI / 337 Mailup, Startup 495 / 488). Contatti in attesa: tutti "We noticed" (Asia 161, Startup 285).

- **7 novembre, 03:05: Asia esecuzione 4399 bloccata** nel nodo "Estrai email homepage" ("Task execution aborted because runner became unresponsive": il motore dei nodi Code di n8n si è fermato, quasi certamente su una homepage enorme). Unico errore su 17 giri dal 5 novembre; i contatti di quel giro non sono stati salvati. Correzione pronta nella repo (`motore/codice/estrai-email.template.js`: pagine oltre 600.000 caratteri ridotte a inizio + fine). Replay: nessuna differenza. **Da fare (ok): deploy.**

- **11 novembre: avvocati, un solo nome per studio** (chiarito dall'utente: qualsiasi ruolo — fondatore, managing partner, CEO… — ma mai due persone dello stesso studio; se più fondatori/soci, uno solo). Il motore lo faceva già (un contatto per dominio del sito); prompt avvocati rafforzato ("UNA SOLA persona, mai due nomi dello stesso studio; di preferenza il fondatore"). Il filtro "solo fondatori" provato e poi tolto (`ruolo_richiesto: null`). Replay: nessuna differenza. File dell'utente `Leads_avvocati_202611101153`: 287 studi tutti diversi (i polacchi "Kancelaria Adwokacka …" = "studio legale …", 32 studi diversi), nessuno doppio con lo storico. **Da fare (ok): deploy** (insieme alla correzione "pagine enormi").

**In sospeso (in ordine)**
1. Controllare i primi giri con le frasi su misura generate dal motore (dal 4 novembre 15:00) e i settori dopo la correzione software.
2. ✅ (5 novembre) Punto di ripristino `ripristino-2026-11-05`; export del lunedì e pagina Download Mailup **disattivati**.
3. Confermare col capo la frase sulle categorie del premio (penale / aziende emergenti) nei modelli.
4. Contatti delle grandi reti già salvati in Asia (RSM, Andersen, Forvis Mazars, Crowe…): l'utente decide se toglierli dalla scheda Mailup.
5. **Europa PMI** (decisa il 13 novembre, sostituisce l'idea "Italia PMI"): tutta Europa esclusa l'Italia, fatturato fino a 50 M€, tutti i settori, CEO/fondatore/titolare/amministratore delegato uno per azienda, email in inglese con frasi su misura, giri 00:00 e 12:00. Foglio `1rWod1281ZoPVvUYHreqgTtHxyuZ8Q65pm5nIE9ovwGU`, workflow **Prospect \| Europa PMI \| Ricerca** (`StWwuSUputmE8fO8`) creato e deployato, **spento**. Giro di prova 4461 (13 nov): 85 salvati, 5 paesi, nessuna italiana, una persona per azienda. Poi correzioni (settori, varietà città, RocketReach se il sito dà solo info@: opzione `rocketreach_se_generica`, solo Europa PMI) caricate col deploy 4463. **Da fare: attivazione alle 00:00/12:00 (serve l'ok).** Nota: il deploy di Europa PMI non ha portato alle altre campagne le modifiche in attesa (taglio pagine enormi, prompt avvocati): partiranno al prossimo deploy completo.
6. Più avanti: repo privata (token GitHub), "non consumare i temi quando il lotto AI fallisce", storico completo da dividere quando supera ~4 MB.


## 🛟 Punto di ripristino: versioni funzionanti del 5 novembre 2026

Dichiarate funzionanti dall'utente il 5 novembre (primo invio MailUp con i nuovi template programmato per la notte). Se qualcosa va storto si torna a queste versioni: su n8n ogni workflow conserva la cronologia delle versioni (strumento MCP `restore_workflow_version`, oppure workflow → menu → *Version history* → ripristina → pubblica). Per le campagne c'è anche l'istantanea nella repo: ramo git **`ripristino-2026-11-05`** (`dist/<campagna>.json`, da rimettere con il deploy). Il punto precedente resta nel ramo `ripristino-2026-11-02`.

| Workflow | ID | Versione funzionante | Stato |
|---|---|---|---|
| Prospect \| Asia PMI \| Ricerca | `f03lATvrzkJYAOw6` | `968b216b-3aed-4880-b978-4963af1a27b2` | attivo 03:00 · 15:00 (frasi su misura) |
| Prospect \| Avvocati \| Ricerca | `rKUcaJepe2momTLB` | `0a7bf89a-2f03-4aff-9554-e3123bcafd94` | attivo 06:00 · 18:00 (specializzazione, città) |
| Prospect \| Startup \| Ricerca | `iXkSFJOLpJq8gl3D` | `ad834204-4353-4db0-a8a1-a8e0eef4b20f` | attivo 09:00 · 21:00 (frasi su misura) |
| Prospect \| Strumenti \| Avvisi Telegram | `cOTn9YehQThgLc3y` | `043d6ce0-ad92-4cff-8ed9-1ca558d03062` | attivo |
| Prospect \| Strumenti \| API App | `B5pNQHB32c8PiTyw` | `8f1c1db0-d10e-4c81-b585-9ea5955a3068` | attivo (webhook con chiave, app Vercel) |
| Prospect \| Strumenti \| Deploy da GitHub | `dfcTpLlJ3RyHO8BR` | `5eba5e13-51ff-4566-9d65-0dc50d063587` | manuale |
| Prospect \| Strumenti \| Aggiungi colonne | `AtE5Ney79dkoEQEq` | `4ecc016b-ef75-4841-a473-5e8df421bdcb` | manuale |
| Prospect \| Strumenti \| Setup foglio | `GPtrh61BOYhfp8Mc` | `a47c4571-dbf0-4308-948a-49df1d5802fa` | manuale |
| Prospect \| Strumenti \| Correggi settori | `mopbqmV8nS3PJbxz` | `29dd96b7-dc7e-4587-adc2-33ce9f684ab3` | manuale (eseguito: 4282) |
| Prospect \| Strumenti \| Compila specializzazione avvocati | `OpnxAAqppiIzBmSp` | `8ae57f07-a92b-4811-a0c2-fa7fcbff15bc` | manuale, una tantum (4257, 4261) |
| Prospect \| Strumenti \| Frasi contatti in attesa | `CpGg4j5I6GVMIMmJ` | `d96b3707-9f57-4b26-99bd-b8d5f73cd447` | manuale, una tantum (4330–4332) |
| Prospect \| Strumenti \| Prova aperture | `Pu0E1gx3zaoZ72XC` | `3af2fa66-e9b0-4bcd-8c4f-2eb0479f3021` | manuale, solo prova |
| Prospect \| Strumenti \| Export Mailup settimanale | `8BUuXswSFV3JHWs7` | `a5a9970a-9ff9-4103-b1bd-4f7acab059e1` | **disattivato il 5 novembre** (sostituito dall'app) |
| Prospect \| Strumenti \| Download Mailup | `n6dqEqH9MuWpslT3` | `906937a3-87c9-4c1b-987c-6f191e7ed988` | **disattivato il 5 novembre** (sostituito dall'app) |

App Vercel: https://prospect-gilt.vercel.app (codice `app/` su `main`). Tabelle n8n in uso: `prospect_export_righe` (`R9wNDMOmHDGj7Hi5`, download dell'app), `prospect_export_partenza` (`5PNFQ2Od1xTZlZ4P`, email già inviate prima dell'app), `prospect_export_stato` (`6uYSjDtswew1752T`, usata solo dal vecchio export).

## Campagne

| Campagna | Workflow n8n | Stato | Orario (Italia) | Foglio Google | RocketReach |
|---|---|---|---|---|---|
| `asia-pmi`: Singapore, Malesia, Indonesia | **Prospect \| Asia PMI \| Ricerca** (`f03lATvrzkJYAOw6`) | ✅ attivo; **dal 29 ottobre generato dal motore comune** (prova 4148: 51 salvati, 68% email dal sito, 23 ricerche RocketReach). Versione precedente salvata in `motore/modello-n8n.json` | Asia PMI \| PROVA motore** (`J3E4SmCKEZTz5JGM`), mai da attivare | 03:00 · 15:00 | TEST \| Prospect \| Search (`1mSipsEIoCcARMJj6PBnh1tkFVxYmLiBNcUnXRtSmiE4`) | tutti i paesi, max 60 |
| `avvocati`: penalisti in Europa | **Prospect \| Avvocati \| Ricerca** (`rKUcaJepe2momTLB`) | ✅ attivo dal 9 ottobre | 06:00 · 18:00 | TEST \| Prospect Avvocati \| Search (`1g0XfNM3vj5icNmfeEROydjFKHERVh5jqgRPo_nHO0Bs`) | solo Regno Unito, max 60 |
| `startup`: startup piccole in Europa | **Prospect \| Startup \| Ricerca** (`iXkSFJOLpJq8gl3D`) | ✅ attivo dal 29 ottobre (prima esecuzione manuale: 62 salvati) | 09:00 · 21:00 | TEST \| Prospect Startup \| Search (`1ZohqcRYehq3dHvYeiqWtRs_hq1Vg23cqBrC_jlxId0M`) | tutti i paesi, max 40 |
| `europa-pmi`: PMI in Europa (esclusa Italia), fino a 50 M€ | **Prospect \| Europa PMI \| Ricerca** (`StWwuSUputmE8fO8`) | ⏸️ spento, prova manuale 13 novembre | 00:00 · 12:00 | Prospect \| Europa PMI \| Search (`1rWod1281ZoPVvUYHreqgTtHxyuZ8Q65pm5nIE9ovwGU`) | tutti i paesi, max 40 |

Su n8n i tre workflow delle campagne sono nel progetto **Leads Workflows** (`n8nd82fLpdlt3Dl6`), con le credenziali condivise (dal 29 ottobre). Nello stesso progetto ci sono anche Deploy da GitHub e Setup foglio. **Nomi:** `Prospect | <campagna o Strumenti> | <funzione>`; il nome di una campagna si cambia in `campagna.json` (`nome_workflow`), altrimenti il deploy lo riporta indietro. I fogli Google hanno ancora i nomi vecchi (`TEST | Prospect … | Search`).

Account usati da tutti i workflow: Google Sheets `Spreadsheet ads.lefonti@gmail.com`, OpenAI `OpenAi account` (modello `gpt-5.6-luna` con web search), RocketReach `RocketReach API`.

**Orari RocketReach** (un solo account, circa 70 ricerche l'ora): 03, 06, 09, 15, 18, 21. Singapore A / B / C (00:00 e 12:00) sono **spenti** dal 7 ottobre: se si riaccendono, ricontrollare gli orari.

## Workflow di servizio

| Workflow | Stato |
|---|---|
| **Prospect \| Strumenti \| Deploy da GitHub** (`dfcTpLlJ3RyHO8BR`, sorgente `n8n/deploy.sdk.ts`) | ✅ creato il 29 ottobre: aggiorna tutti i workflow in `dist/deploy.json` (primo deploy: esecuzione 4138) |
| **Prospect \| Strumenti \| Setup foglio** (`GPtrh61BOYhfp8Mc`, sorgente `n8n/setup-foglio.sdk.ts`) | ✅ creato il 29 ottobre: già eseguito per `startup` (4137). **Ogni esecuzione crea un file nuovo** |
| **Prospect \| Strumenti \| API App** (`B5pNQHB32c8PiTyw`, sorgente `n8n/api-app.*`) | ✅ creato e pubblicato il 2 novembre: dati per l'app leads.stagira.it. Indirizzo `https://lefonti.app.n8n.cloud/webhook/prospect-app-api`; la chiave (`x-chiave-app`) è solo nel nodo "Controlla chiave" e su Vercel |
| Prospect Avvocati \| Deploy da GitHub, Setup foglio, Leggi foglio | 🗄️ archiviati il 29 ottobre (puntavano alla vecchia repo `prospect-avvocati`) |

## Export Mailup settimanale

- **Prospect | Strumenti | Export Mailup settimanale** (`8BUuXswSFV3JHWs7`): ✅ attivo, ogni **lunedì alle 08:00**. Legge la scheda **Mailup** dei fogli delle campagne in `dist/campagne.json` (generato da `motore/build.py`: entra ogni campagna con `id_n8n`), prende le righe nuove dall'ultimo export, toglie le email già esportate (anche tra campagne diverse) e le salva nella tabella n8n `prospect_export_righe` (`R9wNDMOmHDGj7Hi5`). Fin dove è arrivato per ogni foglio: tabella `prospect_export_stato` (`6uYSjDtswew1752T`).
- **I contatti nuovi si riconoscono dall'email, non dalla riga** (dal 29 ottobre, 12:26): si possono cancellare o riordinare righe della scheda Mailup senza problemi. Tutte le email presenti nelle tre schede Mailup il 29 ottobre alle 12:26 (esecuzione 4153: Asia 983 email, Avvocati 1.278, Startup 62) sono registrate nella tabella `prospect_export_partenza` (`5PNFQ2Od1xTZlZ4P`) e **non verranno mai esportate**: il primo export (lunedì 2 novembre) contiene solo i contatti arrivati dopo. Una campagna nuova, alla prima esecuzione, registra allo stesso modo le email che ha già.
- **Non cancellare righe da Prospect AI** (è il database contro i doppioni): una persona cancellata può essere ritrovata e salvata di nuovo.
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

## Avvisi Telegram (dal 2 novembre 2026)

- **Prospect | Strumenti | Avvisi Telegram** (`cOTn9YehQThgLc3y`): manda un messaggio dal bot **n8n Workflow Monitor** (`@n8n_singapore_monitor_bot`, credenziale **Telegram**, condivisa con il progetto) nella chat di Marco (l'ID della chat è solo su n8n).
- Quando: 🔴 tutte le ricerche AI fallite · 🟠 3 o più su 5 fallite · nessun candidato (`motore/avvisi.json`, chiamato dalle campagne dopo "Calcola statistiche") · ❌ workflow bloccato da un errore (impostazione **Error workflow** delle tre campagne). Il messaggio dice errore, consiglio (es. credito OpenAI) e link all'esecuzione.
- Vecchio **Singapore V1.3.2 | Error Monitor** archiviato il 2 novembre (sostituito da Avvisi Telegram). Anche **Singapore V3.3 | Success Monitor** archiviato (dall'utente).
- **Messaggio di prova**: esecuzione manuale del workflow (prova 4212 del 2 novembre: arrivato).
- Collegati alle tre campagne il 2 novembre (deploy 4214): 56 nodi ciascuna, riquadro **13 · Log e avviso**, Error workflow impostato. Nota per i deploy: n8n vuole riquadri con **una sola uscita** e descrizioni di **max 145 caratteri**; se il deploy è rifiutato per un riquadro, toglierlo su n8n, rifare il deploy e rimetterlo.
- Motivo: dal 30 ottobre ~12:00 al 2 novembre le tre campagne non hanno trovato nessuno per **credito OpenAI esaurito** ("OpenAI: Rate limit reached"); nessuno se n'era accorto. Il 2 novembre ricaricati **20 $** su OpenAI: da misurare quanto durano.

## Progetto App web leads.stagira.it (deciso il 2 novembre 2026)

App web su **Vercel**, dominio **leads.stagira.it**: panoramica delle campagne, **scarica nuovi** (Excel con solo i contatti mai scaricati, che poi vengono segnati come scaricati), **storico** dei download con possibilità di riscaricare. n8n resta il motore (fogli, conteggi, Excel); l'app parla con n8n tramite webhook protetti da chiave segreta. Codice in `app/` della repo prospect (Vercel: *Root Directory* = `app`).

Checklist:
- [x] 1. Utente: hosting → **Vercel** (nota: il piano gratuito Hobby è solo per uso non commerciale; per uso aziendale serve Pro, circa 20 $/mese).
- [x] 2. Utente: accesso **solo per Marco** → login con **password personale** (salvata solo nelle variabili segrete di Vercel), sessione ricordata 30 giorni, blocco dopo troppi tentativi, pagina non indicizzata.
- [x] 3. Utente: l'**export del lunedì si spegne** quando l'app funziona (anche la pagina Download Mailup).
- [x] 4. Utente: DNS di stagira.it su **Keliweb**.
- [x] 5. Utente: account Vercel collegato a GitHub (repo `marcoscazzari03/prospect`).
- [x] 6. Claude: workflow **Prospect | Strumenti | API App** (`B5pNQHB32c8PiTyw`) creato e pubblicato il 2 novembre (sorgente `n8n/api-app.*`: azioni panoramica, scarica, storico, download; chiave segreta nell'intestazione `x-chiave-app`). Aggiunte le colonne settore_lefonti, comunita1, comunita2 alla tabella `prospect_export_righe`. Provato sull'indirizzo vero: chiave sbagliata → 401; panoramica e storico corretti (l'export di stamattina risulta come primo download: Asia 110, Avvocati 45, Startup 97; nuovi 0); riscarica avvocati → 45 righe. "Scarica" non provato apposta (segnerebbe i contatti come scaricati). I download dell'app usano la stessa tabella dell'export del lunedì: nessun contatto già esportato viene riproposto.
- [x] 7. Claude: app in `app/` (Next.js 15: login con password, panoramica, scarica nuovi / tutti, storico con riscarica), provata in locale con un finto n8n e un browser automatico, poi con l'API vera (2 novembre). Istruzioni in `app/README.md`.
- [x] 8. Utente (2 novembre): app pubblicata su Vercel con le variabili segrete. **Dominio: `prospect-gilt.vercel.app`** (deciso di tenere quello di Vercel; leads.stagira.it e DNS Keliweb non servono).
- Deciso il 2 novembre: per Asia la colonna **Paese** in Mailup resta assente (`mailup_paese: false`), quindi nell'Excel dell'app è vuota. Va bene così.
- [x] 9b. **Anteprima** (4 novembre): pulsanti "Anteprima" e "Anteprima di tutti" scaricano direttamente l'Excel (dal 4 novembre); pulsante "Scarica Excel dell'anteprima" (route `/api/anteprima-excel`, file `Anteprima_<campagna>_<data>.xlsx`, non segna nulla); pulsante "Anteprima" su ogni campagna e "Anteprima di tutti" → pagina `/anteprima` con la tabella dei contatti nuovi, senza segnarli come scaricati. Azione `anteprima` nell'API App (versione `5e08a80a-2c57-4e9c-bf29-80766749189c`); provata sull'API vera (avvocati 101 righe, conteggi invariati).
- [x] 9c. **Scarica storico completo** (4 novembre): pulsante nell'app → `/api/storico-excel` → azione `tutto` dell'API (tutti i contatti delle schede Mailup, colonna Stato: già inviato prima dell'app / scaricato il … / nuovo; non segna nulla). Provato sull'API vera: 3.040 contatti, risposta ~1,3 MB in ~4 s. Limite Vercel ~4,5 MB: ci si arriva tra oltre un anno, poi dividere per campagna o anno.
- [ ] 9. Insieme: prova completa; poi spegnimento della pagina Download Mailup / export del lunedì (se deciso).
- [ ] 10. ⏸️ **Rinviata** (2 novembre) — repo prospect **privata**. Prima serve un **token GitHub di sola lettura** (fine-grained, solo repo prospect, Contents: Read-only) salvato su n8n come credenziale Header Auth **GitHub prospect (lettura)** (`Authorization: Bearer …`) e collegato ai workflow che leggono da GitHub: Export Mailup settimanale, Deploy da GitHub, Aggiungi colonne, Setup foglio (quest'ultimo legge da raw.githubusercontent: passare all'API). Le campagne di ricerca non leggono da GitHub.

## Progetto Comunità, Settore e Apertura (approvato il 29 ottobre 2026)

Tre colonne nuove per ogni lead: **Comunità di appartenenza** (una delle 15 comunità Le Fonti), **Settore** (lista dell'utente, in arrivo), **Apertura** (due righe su misura in **inglese**, solo da fatti presenti sul sito ufficiale; **solo per Startup e Asia PMI**, non per Avvocati: impostazione per campagna). Il settore scritto oggi dall'AI resta in Prospect AI come **Settore AI**. Email ai lead: **in inglese**.

Comunità di appartenenza: 01 Comunità Business · 02 Comunità di CEO · 03 Comunità di CEO Internazionali · 04 Comunità di CEO Regionali · 05 Comunità Pharma · 06 Comunità Sostenibilità · 07 Comunità di Innovazione e Tecnologia · 08 Comunità di Avvocati · 09 Comunità di Avvocati Penalisti · 10 Comunità di Diritto del Lavoro · 11 Comunità Risorse Umane · 12 Comunità Operazioni Straordinarie · 13 Comunità di Fiscalisti · 14 Comunità del Marketing · 15 Comunità dell'Asset Management.

Checklist (in ordine):

**A · Preparazione (nessuna modifica a n8n)**
- [x] 1. Utente: lista dei settori (52 settori, 2 novembre) → `motore/liste/settori.txt`; comunità → `motore/liste/comunita.txt`.
- [ ] 2. Utente: risposte.
  - ✅ Lingua delle email: inglese.
  - ✅ **Fino a 2 comunità per lead** (comunità principale + eventuale seconda).
  - ✅ Apertura su misura solo per Startup e Asia PMI.
  - ✅ Template: **uno per campagna** (3: Asia PMI e Startup con le due frasi su misura, Avvocati classico); template per comunità solo dove i numeri lo giustificano, dopo 3–4 settimane di dati.
  - ✅ Limite MailUp: **200 byte per campo** (help MailUp "Campi anagrafici"): ~200 caratteri inglesi semplici (1 byte), meno con accenti e simboli (2–4 byte); pagine più vecchie e PDF 2017 dicono ~100 caratteri. 39 campi personalizzabili. Scelta prudente valida in ogni caso: Quindi: **apertura1** e **apertura2**, due frasi in inglese di **max 100 caratteri** ciascuna (senza accenti, virgolette curve o trattini lunghi); **Comunità 1**, **Comunità 2**, **Settore** come campi separati. Nel template: `[apertura1] [apertura2]`.
- [x] 3. Claude: analisi dei "Settore AI" (2 novembre). L'AI scrive settori liberi: Asia 1.946 diciture diverse su 2.207 lead, Startup 157 su 163, Avvocati quasi tutto "Diritto penale". Tabella fissa impraticabile → **regole a parole chiave** (`motore/liste/parole-chiave-settori.json`) come rete di sicurezza: riconducono ai 52 settori il 94% (Asia) e il 99% (Avvocati, Startup). Per i lead nuovi l'AI sceglierà direttamente dalla lista.
- [x] 4. Claude: proposta di regole per la Comunità di appartenenza in `motore/liste/regole-comunita.md` (2 novembre), con la distribuzione stimata.
- [x] 5. Utente: regole approvate il 2 novembre (startup italiane → 02 CEO; banche/finanza/assicurazioni → 15; 04 e 12 non usate).

**B · Comunità e Settore sui lead nuovi**
- [x] 6. Claude (2 novembre, nella repo): prompt Startup e Asia con il campo `settore_lefonti` (lista dei 52); Avvocati con settore fisso Legal Services. Nel motore (deduplica) il calcolo di **Settore Le Fonti** (lista → parole chiave → "Other") e **Comunità 1 / Comunità 2** dalle regole in `campagna.json` (`comunita`). Liste in `motore/liste/`.
- [x] 7. Claude: verifica sui dati reali (avvocati 4133: unica differenza le 3 colonne nuove). Colonne aggiunte ai fogli il 2 novembre con **Prospect | Strumenti | Aggiungi colonne** (`AtE5Ney79dkoEQEq`, esecuzione 4215): Settore Le Fonti, Comunità 1, Comunità 2 in Prospect AI e Mailup dei tre fogli. Deploy delle tre campagne il 2 novembre (4216).
- [x] 8. Controllo del 4 novembre (giri 4267–4277, tutti riusciti, nessun avviso). **Città in inglese: ok.** **Specializzazione avvocati: ok** (l'AI ora sceglie white-collar, tax, financial, road traffic…). **Settori: difetto** nelle Startup (e qualche caso Asia): aziende di **software** messe nel settore dei loro clienti (WalliD identità digitale → Financial Services; Outlex legaltech → Legal Services; Talky Labs software contabile → Financial; Visor.ai, Sorsera, RivalSense → Information & Research), con comunità sbagliate nei primi casi. Asia: tra le "PMI" anche grandi reti (RSM, Andersen, Forvis Mazars, Crowe). App: 465 contatti nuovi (Asia 161, Avvocati 101, Startup 203), nessun download ancora.
- [x] 8b. Correzione settori (4 novembre): regola nei prompt Startup e Asia (Legal/Financial/Banking/Insurance/Fiscal/Capital Markets solo se l'azienda fornisce lei il servizio; software → Internet & Applications Services; Information & Research solo per ricerche e dati) + rete di sicurezza nel motore (`motore/liste/settori-software.json`). **Deploy 4281**: Avvocati `0a7bf89a-2f03-4aff-9554-e3123bcafd94`, Asia `2e8b4b9c-1fe5-4403-8bd6-83158dcc0384`, Startup `599efc9e-b047-4c68-8e0c-fb07f287360b`. Strumento **Prospect | Strumenti | Correggi settori** (`mopbqmV8nS3PJbxz`, `n8n/correggi-settori.*`), esecuzione 4282: **Startup 27 righe corrette in Prospect AI e 26 in Mailup** (legaltech, software contabili/finanziari, SaaS e AI → Internet & Applications Services, comunità ricalcolate); Asia 0 righe da correggere; **11 grandi reti aggiunte alle Esclusioni di Asia** (RSM, Andersen, Forvis Mazars, Mazars, Crowe, Grant Thornton, BDO, Baker Tilly, Moore Global, Nexia, Mazars Indonesia; Big Four e Baker McKenzie c'erano già). I contatti delle grandi reti già salvati restano nel foglio.
- [x] 9. Claude: deploy sulle tre campagne (2 novembre, con ok). Da fare: nuovo punto di ripristino quando l'utente conferma che funziona.

**C · Apertura (due righe su misura)**
- Deciso il 2 novembre: la fase C parte **dopo** il controllo delle prime righe della fase B (punto 8, 3 novembre).
- [~] 10. Claude (2 novembre, nella repo): generatore pronto. Prompt `motore/aperture/prompt.txt` (inglese, solo fatti della homepage, max 100 caratteri a frase, solo ASCII, niente clienti o superlativi inventati, "affidabile": false se il sito non basta); testo della homepage `motore/aperture/testo-sito.js`; controllo e frasi di riserva `motore/aperture/valida.js`; impostazioni per campagna in `campagna.json` → `motore.aperture` (contesto, frasi di riserva, modello gpt-5.6-luna; avvocati: null). `dist/aperture.json` generato da build.py.
- [~] 11. Prova su 50 lead con **Prospect | Strumenti | Prova aperture** (`Pu0E1gx3zaoZ72XC`, non scrive da nessuna parte). Esecuzione 4263 (prompt v1): 46/50 su misura ma con difetti (saluti e "Mr/Ms" indovinati, frasi meccaniche, fatti fuori tema), ~950 token in entrata e ~740 in uscita per lead. **Esecuzione 4264 (prompt v2**, niente saluti/titoli/commenti, controlli più severi, ragionamento "low"): **44/50 su misura**, 6 di riserva, nessun errore; ~1.000 token in entrata e ~220 in uscita per lead. PDF con le 50 email inviato all'utente (solo nello scratchpad: contiene nomi di aziende reali). **In attesa: giudizio dell'utente e del capo**; costo reale da leggere su platform.openai.com → Usage (2 novembre, 15:56 e 16:00 circa).
- Deciso il 2 novembre (utente): **piena libertà sulle frasi** (prova v2 approvata). **Fondamentale: non sbagliare SETTORI e CITTÀ** — ogni controllo deve verificare prima questi due.
- [x] 12. **Attivazione (4 novembre, opzione B)**. Nel motore (solo campagne con `motore.aperture`) 4 nodi tra "Ha email?" e i salvataggi: HTTP - Homepage frasi → Prepara frasi su misura → OpenAI - Frasi su misura → Aggiungi frasi su misura (`motore/codice/frasi-*.template.js`; se OpenAI non risponde: frasi di riserva). Colonne create con Aggiungi colonne (4328): Prospect AI `Apertura 1`, `Apertura 2`, `Tipo apertura`; Mailup `Apertura 1`, `Apertura 2`. **Deploy 4329**: Asia `968b216b-3aed-4880-b978-4963af1a27b2`, Startup `ad834204-4353-4db0-a8a1-a8e0eef4b20f` (60 nodi); Avvocati invariato (`0a7bf89a-…`). API App con `apertura1`, `apertura2` (tabella + codice, versione `24322c5c-0fff-41a2-b87a-ef96f21499ff`). Contatti in attesa: **Prospect | Strumenti | Frasi contatti in attesa** (`CpGg4j5I6GVMIMmJ`), esecuzione 4330. Esito: 4330 (timeout dei siti, quasi tutte riserve) → strumento corretto (5 siti alla volta, 20 s, max 50 contatti per esecuzione) → 4331 (si è fermata per memoria ma **aveva già scritto**) → 4332 (ritentati i rimasti). **Risultato finale sui 364 contatti in attesa: 341 frasi su misura (Asia 149, Startup 192), 23 di riserva** (siti che non rispondono; segnati "RISERVA (ritentato)" in Prospect AI).


**D · Export e MailUp**
- [ ] 13. Claude: Excel del lunedì con Comunità, Settore, Apertura (eventuale file per comunità).
- [ ] 14. Utente con guida: campi personalizzati e template MailUp con [apertura]; invio di prova.
- [ ] 15. Insieme: primo invio vero e confronto con l'invio classico.

**Dopo:** 16. ✅ Avviso automatico se un workflow fallisce (fatto il 2 novembre, vedi "Avvisi Telegram").

## Analisi giornaliere

Attività programmata delle 9:30 creata e poi **cancellata il 4 novembre su richiesta dell'utente** (non serve il resoconto mattutino). I controlli si fanno quando l'utente li chiede.
Nota: il 4 novembre il connettore n8n di questa sessione è scaduto; riautorizzarlo da claude.ai → Impostazioni → Connettori vale per le sessioni nuove.

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
10. ⏳ **Bozze email per il capo** (richiesta del 2 novembre): una per Avvocati (classica), Asia PMI e Startup (con `[apertura1] [apertura2]`), in inglese. Servono dall'utente: email usate finora, scopo (invito, candidatura, finalisti…), dati evento (edizione, data, città, categorie, eventuale costo), mittente/firma/link, regole del capo.
11. ⏳ **Nuova campagna Italia PMI** (decisa il 2 novembre, si parte **dopo** il controllo della fase B del 3 novembre). Copia di `asia-pmi` adattata: siti e forme societarie italiane (Srl, Spa…), escluse quotate e startup (le fa già la campagna startup), **PEC scartate**. Orari liberi per RocketReach: **00:00 o 12:00**. Decisioni dell'utente da prendere: dimensione/settori/regioni; ruoli (titolare, AD, CEO, DG); comunità principale (02 CEO o 04 CEO Regionali); lingua email (italiano?). Percorso: repo → prova su ~50 lead (ok) → setup foglio (ok) → workflow e attivazione (ok).
12. 🔄 **Avvocati: specializzazione e città nell'email** (approvato il 2 novembre dopo la riunione col capo: modello email piaciuto, lista approvata, città sì). Una sola specializzazione per studio, valori in inglese: white-collar crime · tax crime · financial crime and anti-money laundering · corruption and fraud · cybercrime · environmental and workplace safety offences · medical liability · crimes against the person · drug offences · road traffic offences · extradition and international criminal law · criminal defence (se il sito non specifica).
   - ✅ Colonne aggiunte ai fogli Avvocati (Aggiungi colonne, esecuzione 4242): Prospect AI → **Specializzazione** (S); Mailup → **Città** (K) e **Specializzazione** (L).
   - ✅ Prompt Avvocati + motore (campo `specializzazione` dalla lista in `campagna.json` → `motore.specializzazione`, parole chiave di riserva sul Settore, riserva "criminal defence"; Specializzazione in Prospect AI; Città e Specializzazione in Mailup con `motore.mailup_extra`). Replay: uniche differenze le colonne nuove; Asia e Startup identiche. **Deploy 2 novembre (esecuzione 4254)**: Avvocati `361a26cf-7da0-4339-9f2e-5461f0496f79`, Asia `68228043-74c2-468a-8f07-354189e93e03`, Startup `0891601b-359b-4fd9-bc95-a5d1b6a56892`. Versioni precedenti (fase B, per tornare indietro): Avvocati `f0cde904-0f9f-4c49-b81a-2f7db40fc8ba`, Asia `7fe62f21-8f4f-4a3d-988c-ac246764c6e5`, Startup `fa5985d7-3ac6-4647-a47f-2fac96224366`. Nota: i "Da riprovare" ricalcolano la specializzazione dal Settore.
   - ✅ Contatti già presenti: **Prospect | Strumenti | Compila specializzazione avvocati** (`OpnxAAqppiIzBmSp`, sorgente `n8n/compila-avvocati.*`), esecuzione 4257: 1.323 righe in Prospect AI e in Mailup. Specializzazione: criminal defence 974, white-collar crime 263, tax crime 31, financial crime/AML 24, road traffic 13, extradition/international 8, corruption and fraud 7, cybercrime 2, crimes against the person 1. Città in Mailup: tutte compilate.
   - ✅ **Città in inglese** (2 novembre): lista `motore/liste/citta-inglese.json` (89 nomi italiani o locali → inglese), applicata dal motore alla colonna Città (avvocati e startup) e chiesta nei prompt avvocati e startup. Replay: cambia solo la Città; Asia identica. **Deploy 4260**: Avvocati `b096a501-af9b-47a2-8d56-af277a831bc3`, Asia `9d60ea9e-376b-481d-9651-46a3b9d00878`, Startup `f19fc618-93c0-4db0-8a48-b17edbfaf617`. Strumento Compila aggiornato (legge `dist/compila-avvocati.json`) ed eseguito (4261): **287 città corrette** in Prospect AI e in Mailup. Restano nomi con accenti già corretti in inglese (Málaga, Reykjavík, Malmö…).
   - ✅ API App aggiornata e pubblicata (versione `cec54ecc-0a0d-471b-b523-9aabd3efd6cd`): colonne `citta` e `specializzazione` nella tabella `prospect_export_righe` e nei download; l'Excel dell'app le mostra quando ci sono.
   - ✅ App: pagina **Modelli email** (`/modelli`) con anteprima dei 3 modelli, inglese/italiano, esempio/campi (sorgente `app/lib/modelli.js`; bozze e PDF in `email/`).
