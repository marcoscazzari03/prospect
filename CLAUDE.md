# Istruzioni per Claude: cervello operativo dei prospect

Questa repo è il centro operativo di tutte le campagne di ricerca prospect per i Le Fonti Awards. Ogni sessione Claude che ci lavora parte da qui.

## All'inizio di ogni sessione

1. Leggere [OPERATIVO.md](OPERATIVO.md): campagne, ID n8n, orari, regole, decisioni prese, prossimi passi.
2. Se il lavoro riguarda una campagna, leggere anche `campagne/<id>/ROADMAP.md`.
3. Per lo stato reale guardare n8n (strumenti MCP n8n): esecuzioni recenti, errori, nodi. La repo dice cosa *dovrebbe* girare, n8n dice cosa gira davvero.

## Regole fisse

- Si scrive in italiano, in modo semplice (l'utente non è uno sviluppatore).
- Nel foglio finiscono **solo persone con email**.
- Obiettivi: **più prospect al giorno** e **meno costi API** (OpenAI, RocketReach). Ogni proposta va misurata nel Log prima di diventare stabile.
- **Il codice si modifica nella repo, non su n8n.** Poi `python3 motore/build.py`, commit, push su `main`, deploy con **Prospect | Strumenti | Deploy da GitHub**. Una modifica fatta solo su n8n viene cancellata dal deploy successivo.
- **RocketReach:** un solo account per tutte le campagne, circa 70 ricerche l'ora. Mai due campagne a meno di un'ora di distanza. Gli orari sono in OPERATIVO.md.
- **Setup foglio:** ogni esecuzione crea un file Google nuovo. Eseguirlo solo per una campagna nuova, una volta.
- **Su n8n non si cambia niente senza il passaggio esplicito dell'utente** (regola dell'utente, 29 ottobre 2026): niente deploy, creazione o modifica di workflow, tabelle o credenziali, esecuzioni, attivazioni, archiviazioni, nuovi fogli. Prima si prepara tutto nella repo, si spiega cosa cambierà e si aspetta l'ok per quella specifica azione.
- Dopo ogni lavoro aggiornare OPERATIVO.md (e la ROADMAP della campagna): è la memoria tra una sessione e l'altra.

## Verifica di una modifica al motore

Il motore è condiviso: una modifica cambia tutte le campagne.

1. `python3 motore/build.py`
2. Prendere i dati di un'esecuzione reale della campagna (n8n MCP `get_workflow_execution` con `includeData`, **senza** i nodi HTTP che contengono l'HTML) e salvarli fuori dalla repo (scratchpad), nel formato `{ executionId, runData }`.
3. `node motore/test/replay.js <dati.json> <istantanea prima> dist/<id>.json`: riesegue il codice delle due versioni sugli stessi dati. "Nessuna differenza" = comportamento invariato. Le differenze devono essere solo quelle volute.
4. I dati delle esecuzioni contengono nomi ed email reali: **non metterli mai nella repo** (è pubblica).

## Dove sono le cose

- Codice comune: `motore/codice/`. Le impostazioni della campagna arrivano nel codice come `CFG.<chiave>` (vedi README, "Impostazioni di una campagna").
- Prompt AI: `campagne/<id>/prompt/`.
- Workflow generati: `dist/`. Non modificarli a mano.
- Workflow di servizio n8n: `n8n/`.
- La vecchia repo `prospect-avvocati` è archiviata: la campagna avvocati vive qui in `campagne/avvocati`.
