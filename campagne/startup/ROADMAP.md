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

## Fase 1: Avvio 🔄

- ✅ Foglio **TEST | Prospect Startup | Search** (`1ZohqcRYehq3dHvYeiqWtRs_hq1Vg23cqBrC_jlxId0M`) creato il 29 ottobre con Setup foglio (esecuzione 4137): 47 temi, 110 esclusioni.
- ✅ Workflow **Prospect Startup | Search** (`iXkSFJOLpJq8gl3D`) creato e riempito dal deploy (esecuzione 4138).
- ✅ Prima esecuzione manuale (4139): 62 salvati su 75 nuovi. Controllo: 61 su 62 pre-seed / seed / bootstrapped, fondati quasi tutti 2019–2025, sempre fondatore o CEO.
- ⏳ Attivazione automatica (09:00 e 21:00): da confermare.
- ⏳ **Email nominative:** solo 5 su 62 dal sito; 42 generiche, alcune poco utili (support@, sales@, privacy@). Idea: se dal sito arriva solo una generica, provare comunque RocketReach (rende il 38%) per avere l'email del fondatore. Costa più crediti: da decidere dopo qualche esecuzione.

## Fase 2: Misura ⏳

- ⏳ Dopo 4–6 esecuzioni, dal Log: % email dal sito, quota nominative, email RocketReach / ricerche **per paese**. Se RocketReach rende poco in alcuni paesi, limitarlo (`paesi_rocketreach`) come per gli avvocati.
- ⏳ Resa dei temi (scheda Temi): spegnere quelli esauriti, aggiungerne nei paesi che rendono.

## Misure

| Data | Esecuzione | Candidati AI | Nuovi | Email da sito (nominative) | Email RocketReach | Salvati | Scartati | Note |
|---|---|---|---|---|---|---|---|---|
| 2026-10-29 | 4139 (manuale) | 76 | 75 (99%) | 54 (5 nominative, 42 generiche) | 8 / 21 (38%) | **62** | 13 | Temi ES01, HU01, LV01, SK01, EE01: tutti 100% nuovi. Durata 8,5 min. |
