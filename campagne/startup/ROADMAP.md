# Roadmap: Prospect Startup | Search

Startup **piccole** in **tutta Europa**: per ogni startup un solo contatto, il **fondatore o CEO**. Per i Le Fonti Awards.

Obiettivi: **più prospect al giorno** e **meno costi API**. Nel foglio finiscono solo persone con email.

Legenda: ✅ fatto · 🔄 in corso · ⏳ da fare · 💡 idea da valutare

## Cosa intendiamo per "startup piccola"

Scritto nel prompt (`prompt/prompt.txt`), da correggere se serve:

- fondata di solito negli ultimi 8 anni;
- bootstrapped, pre-seed, seed o al massimo una piccola Series A;
- raccolta totale indicativamente **sotto i 5 milioni di euro**; niente Series B, niente round sopra i 10 milioni, niente unicorni;
- team fino a circa 50 persone;
- esclusi agenzie e software house su commessa, fondi, acceleratori, spin-off di grandi aziende.

## Fase 0: Preparazione ✅

- ✅ `campagna.json`: un contatto per startup (deduplica per dominio), colonne in più **Città**, **Anno fondazione**, **Fase**; Data e Paese come per gli avvocati.
- ✅ **Temi:** 47 nicchie in 34 paesi europei (Italia, Germania 4; Francia, Regno Unito, Spagna 3; Paesi Bassi, Polonia 2; tutti gli altri 1), scritte nella lingua locale.
- ✅ **Esclusioni:** circa 110 tra scale-up e unicorni europei noti (Revolut, Klarna, N26, Satispay, Bending Spoons…), Big Four, grandi aziende e consulenze. Un marchio di una sola parola esclude solo se coincide col nome o col dominio.
- ✅ Siti non ufficiali in più: Crunchbase, Dealroom, F6S, Wellfound, Product Hunt, Sifted, StartupItalia, Medium, Notion, GitHub…
- ✅ Email generiche in più tipiche delle startup: team@, hi@, hey@, founders@, hello@ (già comune).
- ✅ RocketReach in tutti i paesi, **max 40 ricerche** per esecuzione (meno degli altri finché non sappiamo quanto rende), **max 3 tentativi** a persona.
- ✅ Orario proposto: **09:00 e 21:00** (lontano da 03, 06, 15, 18 delle altre campagne).

## Fase 1: Avvio ⏳

- ⏳ Su n8n: **Prospect | Setup foglio** con campagna `startup` → foglio **TEST | Prospect Startup | Search**. Copiare l'ID in `foglio.id`.
- ⏳ Creare il workflow **Prospect Startup | Search**, ID in `id_n8n`, `"deploy": true`, deploy.
- ⏳ Prima esecuzione manuale: controllare a mano 20 prospect (davvero startup piccole? fondatore / CEO giusto? email giusta?).
- ⏳ Attivazione automatica.

## Fase 2: Misura ⏳

- ⏳ Dopo 4–6 esecuzioni, dal Log: % email dal sito, quota nominative, email RocketReach / ricerche **per paese**. Se RocketReach rende poco in alcuni paesi, limitarlo (`paesi_rocketreach`) come per gli avvocati.
- ⏳ Resa dei temi (scheda Temi): spegnere quelli esauriti, aggiungerne nei paesi che rendono.

## Misure

| Data | Esecuzione | Candidati AI | Nuovi | Email da sito (nominative) | Email RocketReach | Salvati | Scartati | Note |
|---|---|---|---|---|---|---|---|---|
