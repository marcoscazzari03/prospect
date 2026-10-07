# Roadmap: Prospect Claude | Search

Obiettivi: **più prospect al giorno** e **meno costi API**. Nel foglio finiscono solo persone con email.
Lavoriamo sulla copia di test. In produzione si porta solo ciò che è stato misurato nel Log.

Legenda: ✅ fatto · 🔄 in corso · ⏳ da fare · 💡 idea da valutare

---

## Fase 0: Setup ✅

- ✅ Export dell'originale "Singapore A | Legal + Professional Services" salvato su GitHub.
- ✅ Copia "Prospect Claude | Search" creata su n8n, verificata identica all'originale.
- ✅ Collegata al file Google Sheets di test "TEST | Prospect Claude | Search".
- ✅ Success Monitor ed Error Monitor scollegati dalla copia.

## Fase 1: Affidabilità e misura ✅

- ✅ **Solo prospect con email** in "Prospect AI" e "Mailup". Gli altri vanno nella scheda **Scartati**.
- ✅ La deduplica legge anche gli Scartati: chi è già stato scartato non viene ripagato.
- ✅ **Bug corretto:** i prospect che RocketReach non trova (nessun ID) andavano persi. Ora finiscono negli Scartati.
- ✅ **Output AI robusto:**
  - un lotto in errore o in timeout non blocca più l'intera esecuzione;
  - un JSON troncato viene recuperato candidato per candidato.
- ✅ **Scheda Log:** una riga per esecuzione con candidati, duplicati, email da sito e da RocketReach, salvati, scartati e riprovati.
- ✅ **RocketReach:**
  - ricerche una alla volta ogni 5 s;
  - controllo dello stato dopo 20 s, con un secondo controllo dopo 30 s.
- ✅ **"Da riprovare":** chi viene respinto per il limite di frequenza viene ripreso all'esecuzione successiva (max 20), senza una nuova ricerca AI.

## Fase 2: Più prospect a parità di costo 🔄

- ✅ Seconda esecuzione reale (3359):
  - RocketReach ora funziona (15 email da 41 ricerche, nessun errore per limite di frequenza);
  - i duplicati sono già al 38%.
- ✅ **Rotazione dei temi.** Alla 2ª esecuzione il 38% dei candidati pagati era già in archivio, perché i 5 temi fissi riportano sempre gli stessi nomi.
  - Ora c'è la scheda **Temi** nel file di test, con 52 nicchie su legal, servizi professionali, finanza/fintech, tech, industria, consumer e liste di premi. L'elenco iniziale è in `data/temi-iniziali.csv`.
  - A ogni esecuzione vengono scelte le 5 nicchie attive usate meno di recente.
  - Per ogni nicchia vengono aggiornati Ultimo uso, Usi, Candidati totali, Nuovi totali e Ultimo esito.
  - Per spegnere una nicchia basta scrivere `NO` in "Attivo".
- ✅ Prima esecuzione reale con la rotazione (3362): 96% di candidati nuovi (contro il 62% della 3359) e 91 salvati.
- ⏳ **Scelta dei temi in base alla resa.** Quando avremo abbastanza dati (Nuovi totali / Candidati totali per tema), dare la precedenza alle nicchie che rendono di più e spegnere quelle esaurite.
- ⏳ **Partire da liste.**
  - Fonti: classifiche di premi per PMI, liste di finalisti, elenchi di camere di commercio.
  - Le pagine si scaricano gratis via HTTP.
  - L'AI serve solo a estrarre i nomi, senza ricerca web, oppure con meno ricerche.
- ⏳ **Dimensione dei lotti:** valutare 10–15 candidati per lotto invece di 25, se il Log mostra timeout o lotti recuperati.

## Fase 3: Malesia e Indonesia 🔄

- ✅ Scheda Temi estesa: 24 nicchie per la Malesia (M01–M24) e 24 per l'Indonesia (I01–I24), oltre alle 52 di Singapore.
- ✅ La rotazione bilancia i paesi: al massimo 2 lotti per paese a ogni esecuzione.
- ✅ Prompt e system message usano il paese del lotto, con le forme societarie:
  - **Singapore:** preferire Pte Ltd; escluse le società quotate SGX.
  - **Malesia:** preferire Sdn Bhd; escluse le Berhad/Bhd pubbliche e le GLC.
  - **Indonesia:** preferire PT; escluse le Tbk quotate e le BUMN.
- ✅ Ricerca della pagina contatti anche in malese e indonesiano (kontak, hubungi-kami, tentang-kami, tim-kami…); intestazione della lingua per lo scaricamento delle pagine estesa a malese e indonesiano.
- ✅ Colonna **Paese** in Prospect AI e Scartati.
- ✅ Prima esecuzione reale con SG / MY / ID (3365): 97% di candidati nuovi.
  - Email dal sito: Malesia 48% e Indonesia 42%, contro il 54% di Singapore.
  - Funziona, ma servirà RocketReach per completare.
- ⏳ Normalizzazione dei nomi azienda con le forme locali (Sdn Bhd, PT, Tbk), per una deduplica per azienda più precisa. Oggi la deduplica per nome della persona già copre la maggior parte dei casi.
- ⏳ Un solo workflow per tutti i paesi, al posto delle copie A / B / C (in pratica questo workflow lo è già).

## Fase 4: Qualità PMI ✅ (versione prudente)

Decisione: **escludere solo le grandi aziende palesi.** Niente stime dell'AI su dimensioni o dipendenti, per non perdere PMI valide a causa di un errore di calcolo.

- ✅ **Scheda Esclusioni** nel file di test, modificabile, con circa 80 marchi: Big Four, consulenza globale, grandi studi legali, banche, assicurazioni, big tech, conglomerati.
  - Un marchio viene riconosciuto **dal dominio del sito** (per esempio deloitte.com, grab.com).
  - Oppure dal nome, ma solo se il marchio è di 2 o più parole o se il nome coincide esattamente.
  - Così "Apple Dental Clinic" o "Meta Solutions Sdn Bhd" **non** vengono esclusi.
  - Per disattivare una riga basta scrivere `NO` in "Attivo".
- ✅ **Forme societarie da quotata:** Tbk (Indonesia), Berhad/Bhd senza Sdn (Malesia), plc.
- ✅ Il controllo avviene **prima** della ricerca email e di RocketReach, quindi nessun credito speso sugli esclusi.
  - Gli esclusi vanno negli Scartati con "Esclusa: grande azienda - …" (definitivo).
  - Il Log ha una colonna nuova, "Escluse grandi aziende".
- 💡 In futuro, se servirà: segnalare (senza escludere) i casi dubbi in una colonna "Da verificare".

## Fase 5: Costi RocketReach ⏳

- ✅ **Tetto di 60 ricerche RocketReach per esecuzione.**
  - RocketReach ha anche un limite orario (circa 70 ricerche in un'ora).
  - Precedenza ai "Da riprovare", ripresi fino a 40 per esecuzione per smaltire l'arretrato.
  - Chi supera il tetto va in "Da riprovare" come "RINVIATO (TETTO)", senza chiamate a RocketReach.
  - Il Log ha una colonna nuova, "Rinviati tetto RocketReach".
  - Regola pratica: **non lanciare esecuzioni a meno di un'ora l'una dall'altra.**
- ⏳ Valutare se il rapporto email trovate / crediti spesi giustifica RocketReach, o se basta il sito (oggi circa il 64% delle email arriva gratis dal sito).

## Fase 6: Passaggio in produzione ⏳

- ⏳ Portare le modifiche validate su Singapore A / B / C, oppure sostituirli con il workflow unico.
- ⏳ **Da verificare:** A / B / C partono tutti alle 00:00 e alle 12:00 sullo stesso account RocketReach. Probabilmente anche in produzione RocketReach viene respinto per il limite di frequenza.
  - Serve attivare l'accesso MCP sui workflow di produzione per leggere le esecuzioni.
- ⏳ Ricollegare Success Monitor ed Error Monitor.

---

## Misure

| Data | Esecuzione | Candidati AI | Nuovi | Email da sito | Email RocketReach | Salvati | Scartati | Costo | Note |
|---|---|---|---|---|---|---|---|---|---|
| 2026-10-07 | 3356 | 125 | 112 (90%) | 72 | 0 / 40 ricerche | 72 | 40 | ~0,33 $ (OpenAI, ~0,005 $ per salvato) | Prima esecuzione, archivio vuoto. RocketReach respinto per limite di frequenza (25 ricerche + 8 controlli). |
| 2026-10-07 | 3359 | 126 | 78 (62%) + 20 ripresi | 57 | 15 / 41 ricerche | 72 | 26 | ~0,33 $ (OpenAI, ~0,005 $ per salvato) | Dopo il rallentamento: 0 errori per limite di frequenza; tutti i controlli completati al primo tentativo. **38% di duplicati già alla 2ª esecuzione**: i temi fissi ripetono gli stessi nomi. Durata 8 min 20 s. |
| 2026-10-07 | 3362 | 126 | **121 (96%)** + 11 ripresi | 84 | 7 / 29 ricerche riuscite (+19 respinte) | **91** | 22 (+19 da riprovare) | ~0,42 $ (~0,0046 $ per salvato) | **Prima esecuzione con rotazione dei temi** (T24 VC/PE, T30 healthtech, T03 IP law, T11 accounting, T18 compliance): duplicati dal 38% al 4%. RocketReach: "Lookup hourly rate limit reached" dopo circa 70 ricerche nell'ultima ora (3 esecuzioni di fila). Durata 10 min. |
| 2026-10-07 | 3365 | 108 | 105 (97%) + 19 ripresi | 51 | 0 / 73 (**tutte respinte, limite orario**) | 51 | 0 (+73 da riprovare) | ~0,43 $ (~0,0084 $ per salvato, RocketReach fermo) | **Prima esecuzione SG / MY / ID** (T50, T52, M06, M08, I20). Email dal sito: SG 21/39 (54%), MY 20/42 (48%), ID 10/24 (42%). RocketReach fermo per il limite orario: è partita 11 min dopo la 3362. Durata 11 min 30 s. |
