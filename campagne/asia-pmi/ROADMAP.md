# Roadmap: Prospect | Search (Singapore, Malesia, Indonesia)

Obiettivi: **più prospect al giorno** e **meno costi API**. Nel foglio finiscono solo persone con email.

Legenda: ✅ fatto · 🔄 in corso · ⏳ da fare · 💡 idea da valutare

## 📌 Da ricordare

- Il workflow **Prospect | Search** (`f03lATvrzkJYAOw6`) è attivo alle **03:00 e 15:00** (ora italiana).
- Fino al passaggio al motore comune gira con il codice del 7 ottobre 2026 (export in `motore/modello-n8n.json`).
- Singapore A / B / C e i vecchi workflow "Singapore | …" sono spenti: non riaccenderli senza ricontrollare gli orari RocketReach.

## Fase 1: Passaggio al motore comune 🔄

- ✅ Impostazioni della campagna in `campagna.json` (forme societarie Pte Ltd / Sdn Bhd, esclusione Tbk / Berhad / plc, fuso Asia/Singapore, Accept-Language inglese / malese / indonesiano, email generiche e gratuite locali) e prompt originale in `prompt/`.
- ✅ Istantanea generata: `dist/asia-pmi.json`. Cosa cambia rispetto a oggi è in OPERATIVO.md, "Riorganizzazione".
- ⏳ Prova manuale su n8n e confronto col Log delle ultime esecuzioni (email da sito, email nominative, RocketReach).
- ⏳ Se i numeri sono uguali o migliori: `"deploy": true` in `campagna.json`, rigenerare, deploy.

## Fase 2: Da valutare dopo il passaggio 💡

- 💡 **Un contatto per azienda** (`un_contatto_per_azienda`): niente crediti RocketReach spesi su una seconda persona della stessa azienda.
- 💡 **Max 3 tentativi** per i "Da riprovare" (`max_tentativi`), come per gli avvocati.
- 💡 **RocketReach per paese:** misurare email / ricerche per Singapore, Malesia e Indonesia (come per gli avvocati, dove rendeva quasi solo nel Regno Unito).
- 💡 Prompt più corto (meno token), come per gli avvocati.
