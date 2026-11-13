# Europa PMI — roadmap

Decisa il 13 novembre 2026 (utente): PMI private in tutta Europa **esclusa l'Italia**; fatturato fino a **50 milioni di euro** (stessa dimensione di Asia PMI); **tutti i settori**; contatto: **CEO, fondatore, titolare o amministratore delegato, uno per azienda**; email in **inglese** con frasi su misura; orari **00:00 e 12:00** (liberi per RocketReach).

- [x] 1. Repo: `campagna.json` (base Startup per l'Europa, comunità come Asia PMI: 03 CEO Internazionali + tematica / 01 Business), prompt, 41 temi in 29 paesi (`data/temi.csv`), esclusioni (grandi aziende, Big Four e reti, scale-up della campagna Startup).
- [x] 2. Setup foglio (13 nov, esecuzione 4459): file *Prospect | Europa PMI | Search* `1rWod1281ZoPVvUYHreqgTtHxyuZ8Q65pm5nIE9ovwGU` (41 temi, 137 esclusioni).
- [x] 3. Workflow su n8n (13 nov): `StWwuSUputmE8fO8`, riempito dal deploy 4460 (60 nodi), **non attivo**. Il deploy ha toccato solo Europa PMI (le altre campagne messe temporaneamente a `deploy: false`, poi rimesse a `true`).
- [ ] 4. Giro di prova manuale (ok, in corso: esecuzione 4461): 5 ricerche AI; controllo settori, città, ruoli, una persona per azienda, frasi.
- [ ] 5. Attivazione alle 00:00 e 12:00 (ok).
- [ ] 6. Prime esecuzioni: misure nel Log (salvati, email dal sito, RocketReach, costi).
