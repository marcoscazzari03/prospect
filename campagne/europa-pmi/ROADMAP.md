# Europa PMI — roadmap

Decisa il 13 novembre 2026 (utente): PMI private in tutta Europa **esclusa l'Italia**; fatturato fino a **50 milioni di euro** (stessa dimensione di Asia PMI); **tutti i settori**; contatto: **CEO, fondatore, titolare o amministratore delegato, uno per azienda**; email in **inglese** con frasi su misura; orari **00:00 e 12:00** (liberi per RocketReach).

- [x] 1. Repo: `campagna.json` (base Startup per l'Europa, comunità come Asia PMI: 03 CEO Internazionali + tematica / 01 Business), prompt, 41 temi in 29 paesi (`data/temi.csv`), esclusioni (grandi aziende, Big Four e reti, scale-up della campagna Startup).
- [ ] 2. Setup foglio (ok): crea il file Google *Prospect | Europa PMI | Search* (schede, temi, esclusioni); poi `foglio.id` in campagna.json. **Prima di questo passo `dist/europa-pmi.json` punta al foglio del modello (Asia): non va deployato.**
- [ ] 3. Workflow su n8n (ok): creazione di un workflow vuoto nel progetto, `id_n8n` in campagna.json, `deploy: true`, deploy (lo riempie dalla repo), **non attivo**.
- [ ] 4. Giro di prova manuale (ok): 5 ricerche AI; controllo settori, città, ruoli, una persona per azienda, frasi.
- [ ] 5. Attivazione alle 00:00 e 12:00 (ok).
- [ ] 6. Prime esecuzioni: misure nel Log (salvati, email dal sito, RocketReach, costi).
