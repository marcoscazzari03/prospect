# prospect

Workflow n8n per la ricerca automatica di prospect per i **Le Fonti Awards** nel Sud-Est asiatico.

**Obiettivo:** trovare PMI (non multinazionali) di **Singapore, Malesia e Indonesia** in linea con i Le Fonti Awards, con due priorità:

1. il maggior numero possibile di prospect al giorno;
2. il minor costo possibile in API (OpenAI, RocketReach).

**Regola fissa:** nel foglio prospect finiscono **solo persone con email**. Va bene anche un'email aziendale generica (info@, contact@) trovata sul sito ufficiale.

La roadmap con lo stato dei lavori e i prossimi passi è in [ROADMAP.md](ROADMAP.md).

## Contenuto

| File | Cosa contiene |
|---|---|
| `workflows/singapore-a-legal-professional-services.json` | Export originale di "Singapore A \| Legal + Professional Services" (produzione). Resta come riferimento e non va modificato. |
| `workflows/prospect-search.json` | "Prospect \| Search": la copia di lavoro su cui facciamo le modifiche. È un'istantanea dell'ultima versione salvata su n8n. |

## Ambienti

| | Produzione | Test |
|---|---|---|
| Workflow n8n | Singapore A / B / C (attivi) | Prospect \| Search (`f03lATvrzkJYAOw6`, disattivato) |
| Google Sheets | "Singapore \| Score Articoli a Pagamento" | "TEST \| Prospect \| Search" |
| Monitor | Success / Error Monitor | nessuno |

Il file di test (account `ads.lefonti@gmail.com`) ha quattro schede:

- **Prospect AI**: prospect con email;
- **Mailup**: gli stessi prospect, nel formato per Mailup;
- **Scartati**: chi non ha email. Se il motivo è "Da riprovare", la persona viene ripresa all'esecuzione successiva;
- **Log**: una riga di statistiche per ogni esecuzione;
- **Temi**: le nicchie di ricerca. A ogni esecuzione ne vengono usate 5, a rotazione. Si possono aggiungere righe o spegnerle scrivendo `NO` in "Attivo".

Nel repository:

- `data/temi-iniziali.csv` contiene l'elenco iniziale delle nicchie.

## Come aggiornare l'istantanea

Dopo ogni modifica su n8n, la versione aggiornata del workflow va esportata in `workflows/prospect-search.json` e salvata con un commit. In questo modo GitHub segue n8n.
