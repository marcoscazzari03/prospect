# prospect

Ricerca automatica di prospect per i **Le Fonti Awards** con n8n: un **motore comune** e una **configurazione per ogni campagna**.

Ogni campagna ha il suo workflow su n8n, il suo foglio Google e il suo orario, ma il codice è uno solo: una correzione al motore arriva a tutte le campagne con un deploy.

**Obiettivi comuni:**

1. il maggior numero possibile di prospect al giorno;
2. il minor costo possibile in API (OpenAI, RocketReach).

**Regola fissa:** nel foglio finiscono **solo persone con email**.

Lo stato operativo (campagne attive, ID, orari, decisioni, prossimi passi) è in [OPERATIVO.md](OPERATIVO.md).

## Campagne

| Campagna | Cartella | Target | Workflow n8n | Orario |
|---|---|---|---|---|
| Singapore, Malesia, Indonesia | [`campagne/asia-pmi`](campagne/asia-pmi) | PMI e aziende private: founder, CEO, manager con potere decisionale | **Prospect \| Asia PMI \| Ricerca** (`f03lATvrzkJYAOw6`) | 03:00 · 15:00 |
| Avvocati penalisti | [`campagne/avvocati`](campagne/avvocati) | Titolari di studio penale, 34 paesi europei (esclusi FR, DE, IT) | **Prospect \| Avvocati \| Ricerca** (`rKUcaJepe2momTLB`) | 06:00 · 18:00 |
| Startup | [`campagne/startup`](campagne/startup) | Startup piccole in tutta Europa: fondatore o CEO | **Prospect \| Startup \| Ricerca** (da creare) | 09:00 · 21:00 |

Gli orari sono sfalsati perché tutte le campagne usano lo stesso account RocketReach (circa 70 ricerche l'ora).

## Come funziona un workflow

Uguale per tutte le campagne (cambiano solo le impostazioni):

1. **Archivio e temi**: legge dal foglio prospect, scartati, temi ed esclusioni; sceglie 5 temi a rotazione (paesi bilanciati).
2. **Ricerca AI**: 5 ricerche OpenAI con web search, una per tema; output recuperato anche se malformato.
3. **Aggiorna temi**: uso, candidati e nuovi trovati per ogni tema.
4. **Riprova e deduplica**: riprende i "Da riprovare", scarta chi è già in archivio (per persona e, se la campagna lo chiede, per azienda / dominio).
5. **Filtro grandi aziende**: scheda Esclusioni + forme societarie da quotata.
6. **Email dal sito (gratis)**: homepage, pagina contatti e, se serve, una terza pagina (note legali, Impressum, privacy). Preferita l'email col nome della persona, poi la generica.
7. **Tetto RocketReach**: max N ricerche per esecuzione, solo nei paesi scelti, precedenza ai "Da riprovare".
8. **RocketReach**: ricerca della persona e controllo dell'esito; solo email professionali validate.
9. **Salvataggio**: Prospect AI, Mailup, Scartati, e una riga di statistiche nel Log.

Ogni foglio Google ha sei schede: **Prospect AI**, **Mailup**, **Scartati**, **Log**, **Temi**, **Esclusioni**. Temi ed Esclusioni si modificano direttamente dal foglio (`NO` in "Attivo" per spegnere una riga).

## Contenuto della repo

| Percorso | Cosa contiene |
|---|---|
| `motore/codice/*.js` | Codice comune dei nodi Code. `estrai-email.template.js` genera i nodi "Estrai email…"; `pagine-homepage.snippet.js` sceglie le pagine da controllare. |
| `motore/modello-n8n.json` | Struttura dei nodi (export di "Prospect \| Asia PMI \| Ricerca" del 7 ottobre 2026). Non va modificato a mano. |
| `motore/build.py` | Genera un workflow per campagna: modello + codice + impostazioni + prompt. |
| `motore/test/replay.js` | Riesegue il codice di due versioni sugli stessi dati di un'esecuzione reale e confronta i risultati. |
| `campagne/<id>/campagna.json` | Impostazioni della campagna (vedi sotto). |
| `campagne/<id>/prompt/` | Prompt e system message della ricerca AI. |
| `campagne/<id>/data/` | Temi ed esclusioni iniziali (usati solo per creare il foglio). |
| `campagne/<id>/nota.md` | Nota sul canvas di n8n. |
| `campagne/<id>/ROADMAP.md` | Stato dei lavori, misure e prossimi passi della campagna. |
| `dist/<id>.json` | Istantanea generata del workflow: è quella che va su n8n. |
| `dist/deploy.json` | Campagne che il deploy porta su n8n. |
| `n8n/*.sdk.ts` | Sorgenti dei workflow di servizio: **Prospect \| Strumenti \| Deploy da GitHub**, **Prospect \| Strumenti \| Setup foglio**. |

## Impostazioni di una campagna (`campagna.json`)

Parte generale: nome e ID del workflow n8n, `deploy` (se il deploy lo aggiorna), orario (`trigger`), foglio Google, colonne, `accept_language`, `terza_pagina`, descrizioni dei gruppi di nodi.

Parte `motore` (finisce nel codice dei nodi come blocco `CFG`):

| Chiave | Significato |
|---|---|
| `fuso_orario` | Fuso delle date nel foglio. |
| `lotti`, `target_lotto` | Ricerche AI per esecuzione e candidati chiesti per ricerca. |
| `settore_default`, `temi_riserva` | Valori usati se la scheda Temi è vuota. |
| `un_contatto_per_azienda` | Deduplica anche per dominio del sito: mai due persone della stessa azienda. |
| `campi_extra` | Colonne in più chieste all'AI, come `[colonna, campo_ai]` (es. `["Città", "citta"]`). |
| `colonna_data`, `mailup_paese` | Colonna Data in Prospect AI, colonna Paese in Mailup. |
| `forme_societarie` | Parole da ignorare nel nome azienda per la deduplica (regex). |
| `forme_quotate` | Forme societarie da escludere: `{se, tranne, motivo}`. |
| `siti_non_ufficiali` | Domini in più da non considerare sito ufficiale (directory, database…). |
| `email_generiche`, `email_gratuite` | Caselle generiche e domini di email gratuite in più rispetto alla lista comune. |
| `paesi_rocketreach` | Paesi in cui usare RocketReach (`null` = tutti). |
| `tetto_rocketreach` | Ricerche RocketReach massime per esecuzione. |
| `max_tentativi` | Dopo quanti rinvii un "Da riprovare" diventa "Abbandonato" (`null` = mai). |
| `max_riprova` | "Da riprovare" ripresi al massimo per esecuzione. |

## Come modificare

1. Modificare `motore/codice/`, `campagne/<id>/` o `motore/build.py`.
2. `python3 motore/build.py` per rigenerare `dist/`.
3. Se è cambiato il codice del motore, controllare che le campagne attive non cambino comportamento senza volerlo (vedi [CLAUDE.md](CLAUDE.md), "Verifica").
4. Commit e push su `main`.
5. Su n8n eseguire **Prospect \| Strumenti \| Deploy da GitHub**: aggiorna i workflow delle campagne in `dist/deploy.json`.

Se si modifica un workflow direttamente su n8n, riportare la modifica nei sorgenti, altrimenti il deploy successivo la cancella.

## Nuova campagna

1. Copiare una cartella di `campagne/` e adattare `campagna.json`, prompt, temi, esclusioni e nota.
2. `python3 motore/build.py`.
3. Su n8n: eseguire **Prospect \| Strumenti \| Setup foglio** con la nuova campagna nel nodo "Campagna" (una sola volta: crea un file nuovo), poi copiare l'ID del foglio in `foglio.id`.
4. Creare il workflow su n8n, metterne l'ID in `id_n8n`, `"deploy": true`, rigenerare, push, deploy.
5. Scegliere un orario lontano almeno un'ora da quelli delle altre campagne (RocketReach).
