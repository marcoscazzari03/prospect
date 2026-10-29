# Roadmap: Prospect | Asia PMI | Ricerca (Singapore, Malesia, Indonesia)

Obiettivi: **più prospect al giorno** e **meno costi API**. Nel foglio finiscono solo persone con email.

Legenda: ✅ fatto · 🔄 in corso · ⏳ da fare · 💡 idea da valutare

## 📌 Da ricordare

- Il workflow **Prospect | Asia PMI | Ricerca** (`f03lATvrzkJYAOw6`) è attivo alle **03:00 e 15:00** (ora italiana).
- Dal 29 ottobre 2026 è generato dal motore comune. La versione precedente (codice del 7 ottobre) è in `motore/modello-n8n.json`.
- Singapore A / B / C e i vecchi workflow "Singapore | …" sono spenti: non riaccenderli senza ricontrollare gli orari RocketReach.

## Fase 1: Passaggio al motore comune ✅

- ✅ Impostazioni della campagna in `campagna.json` (forme societarie Pte Ltd / Sdn Bhd, esclusione Tbk / Berhad / plc, fuso Asia/Singapore, Accept-Language inglese / malese / indonesiano, email generiche e gratuite locali) e prompt originale in `prompt/`.
- ✅ Istantanea generata: `dist/asia-pmi.json`. Cosa cambia rispetto a oggi è in OPERATIVO.md, "Riorganizzazione".
- ✅ Prova manuale (esecuzione 4148, 29 ottobre) sulla copia di prova: 74 nuovi, 50 email dal sito (68%, prima 53–65%), 3 nominative, RocketReach 1 email su 23 ricerche (prima 26–42 ricerche), **51 salvati** (prima 48–61).
- ✅ Passaggio fatto il 29 ottobre: `"deploy": true`, deploy sul workflow attivo, copia di prova archiviata.
- ⏳ Controllare il Log delle prime 4–6 esecuzioni automatiche.

## Fase 2: Da valutare dopo il passaggio 💡

- 💡 **Un contatto per azienda** (`un_contatto_per_azienda`): niente crediti RocketReach spesi su una seconda persona della stessa azienda.
- 💡 **Max 3 tentativi** per i "Da riprovare" (`max_tentativi`), come per gli avvocati.
- 💡 **RocketReach per paese:** misurare email / ricerche per Singapore, Malesia e Indonesia (come per gli avvocati, dove rendeva quasi solo nel Regno Unito).
- 💡 Prompt più corto (meno token), come per gli avvocati.
