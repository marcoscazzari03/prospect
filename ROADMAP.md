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

## Fase 3: Malesia e Indonesia ⏳

- ⏳ Lotti per paese: SG / MY / ID.
- ⏳ Normalizzazione dei nomi azienda con le forme locali: Sdn Bhd, Bhd, PT, Tbk.
- ⏳ Lingua delle richieste HTTP e fonti locali (anche in Bahasa).
- ⏳ Un solo workflow per tutti i paesi, al posto delle copie A / B / C.

## Fase 4: Qualità PMI ⏳

- ⏳ Filtro "no multinazionali" anche dopo l'AI, non solo nel prompt.
  - Forma societaria:
    - **Singapore:** Pte Ltd = privata.
    - **Malesia:** Sdn Bhd = privata; Bhd da sola = pubblica.
    - **Indonesia:** Tbk = quotata.
  - Lista di esclusione per domini e gruppi grandi.
- ⏳ Controllo prima di RocketReach: niente crediti spesi su aziende che verrebbero scartate comunque.

## Fase 5: Costi RocketReach ⏳

- ⏳ Tetto di ricerche RocketReach per esecuzione.
  - RocketReach ha anche un **limite orario**: "Lookup hourly rate limit reached" dopo circa 70 ricerche in un'ora.
  - Una singola esecuzione (~40–50 ricerche) ci sta, ma Singapore A/B/C in parallelo no.
  - Chi viene respinto finisce comunque in "Da riprovare".
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
| 2026-10-07 | 3362 | 126 | **121 (96%)** + 11 ripresi | 84 | 7 / 29 ricerche riuscite (+19 respinte) | **91** | 22 (+19 da riprovare) | da confermare | **Prima esecuzione con rotazione dei temi** (T24 VC/PE, T30 healthtech, T03 IP law, T11 accounting, T18 compliance): duplicati dal 38% al 4%. RocketReach: "Lookup hourly rate limit reached" dopo circa 70 ricerche nell'ultima ora (3 esecuzioni di fila). Durata 10 min. |
