# Roadmap: Prospect | Avvocati | Ricerca

Obiettivi: **più prospect al giorno** e **meno costi API**. Nel foglio finiscono solo persone con email, una per studio: il titolare.
Lavoriamo sulla copia di test. Ciò che funziona si misura nel Log prima di renderlo stabile.

Legenda: ✅ fatto · 🔄 in corso · ⏳ da fare · 💡 idea da valutare

---

## 📌 Da ricordare

- Dal 9 ottobre 2026 il workflow è **attivo** e gira da solo alle **06:00 e 18:00**.
- **Regola pratica RocketReach:** non lanciare esecuzioni a meno di un'ora da Singapore A/B/C (00:00, 12:00) e da Prospect | Asia PMI | Ricerca (03:00, 15:00): stesso account, circa 70 ricerche l'ora.
- Il workflow "Setup foglio" è già stato eseguito: **non rilanciarlo** (creerebbe un secondo file).

- Dal 29 ottobre 2026 la campagna vive nella repo **prospect** (`campagne/avvocati`), generata dal motore comune. La repo `prospect-avvocati` è archiviata. Il workflow generato è identico a quello attivo (verificato sui dati dell'esecuzione 4133).

## Fase 0: Setup ✅

- ✅ Copia del workflow base "Prospect | Asia PMI | Ricerca" (`f03lATvrzkJYAOw6`) salvata (oggi in `motore/modello-n8n.json` della repo prospect).
- ✅ Foglio Google separato **TEST | Prospect Avvocati | Search** creato dal workflow "Setup foglio", con le sei schede (Prospect AI, Mailup, Scartati, Log, Temi, Esclusioni).
- ✅ Workflow **Prospect | Avvocati | Ricerca** creato su n8n e collegato al nuovo foglio.
- ✅ Success Monitor rimosso (nella copia base era già scollegato).
- ✅ Sorgenti in repo (oggi `motore/codice`, `campagne/avvocati/prompt`, `motore/build.py` della repo prospect) e workflow **Deploy da GitHub** per portare su n8n le modifiche senza copiarle a mano.

## Fase 1: Adattamento agli avvocati penalisti ✅

- ✅ **Temi:** 69 nicchie in 34 paesi europei (esclusi Francia, Germania e Italia), divise per città o specializzazione e scritte nella lingua locale ("abogado penalista", "strafrechtadvocaat", "adwokat karnista"…). Più nicchie dove il mercato è più grande (Regno Unito 10, Spagna 7, Polonia 4…).
- ✅ **Rotazione:** 5 temi per esecuzione, al massimo 1 per paese (con 34 paesi ogni esecuzione tocca 5 paesi diversi).
- ✅ **Prompt AI** riscritto e accorciato (circa metà dei caratteri del base → meno token per ogni passo di ricerca):
  - solo avvocati che fanno davvero penale;
  - **un contatto per studio, il titolare**: l'avvocato stesso se lo studio è individuale; fondatore / managing partner / senior partner / name partner se è associato. Esclusi associati, praticanti, of counsel;
  - esclusi grandi studi, Big Four, PM e giudici, ordini e associazioni;
  - nuovi campi: tipo studio (individuale / associato), città, pagina contatti del sito (se l'AI l'ha già vista, senza ricerche apposta).
- ✅ **Esclusioni:** circa 115 grandi studi (internazionali e top nazionali dei paesi target) + Big Four. Lasciati fuori di proposito i boutique penali noti (es. Kingsley Napley, Peters & Peters): sono buoni prospect.

## Fase 2: Meno costi, più email gratis ✅ (da misurare)

- ✅ **Deduplica per studio (dominio del sito):** mai due contatti dello stesso studio, né nella stessa esecuzione né rispetto all'archivio. Niente crediti RocketReach spesi su un secondo socio.
- ✅ **Siti non ufficiali scartati prima** (LinkedIn, directory di avvocati, pagine gialle…): non si scarica nulla e non si paga RocketReach su siti senza email dello studio.
- ✅ **Email dal sito su tre pagine, tutte gratis:**
  1. homepage;
  2. pagina contatti (o quella indicata dall'AI);
  3. note legali / Impressum / aviso legal / privacy: in Europa i professionisti devono indicare l'email sul sito (direttiva e-commerce), quindi spesso è lì.
  - Se il sito è in JavaScript e non ha link leggibili, si provano i percorsi tipici del paese (`/contacto`, `/kontakt`, `/impressum`…).
  - La terza pagina si scarica solo se manca ancora un'email nominativa o generica.
- ✅ **Scelta dell'email:** prima quella col nome del titolare, poi la generica dello studio (info@, kanzlei@, despacho@…), poi le altre. Il tipo è scritto nella colonna "Tipo email" (SITO - NOMINATIVA / GENERICA / ALTRA EMAIL / EMAIL GRATUITA / PRIVACY, oppure ROCKETREACH VALIDATA).
- ✅ **Email gratuite e degli ordini forensi** (gmail, hotmail, `adv.oa.pt`, `icam.es`, `icab.cat`…) accettate solo se compaiono in un link mailto del sito ufficiale: molti avvocati individuali usano queste caselle.
- ✅ Email offuscate riconosciute anche in forma "nome [at] studio [dot] es"; scartati indirizzi finti (noreply, example, immagini tipo logo@2x.png).
- ✅ **RocketReach:** tetto di 60 ricerche per esecuzione (come il base), precedenza ai "Da riprovare".
- ✅ **Max 3 tentativi a persona:** al terzo rinvio la persona va negli Scartati come "Abbandonato" e non viene più ripresa. Colonna nuova nel Log: "Abbandonati dopo tentativi".
- ✅ I "Da riprovare" il cui studio è già in archivio con un'altra persona non vengono più ripresi.

## Fase 3: Misura 🔄

- ✅ Prima esecuzione manuale di verifica (3475, vedi Misure): 75 salvati su 101 nuovi, **74% di email gratis dal sito**, 0 lotti falliti, durata 8 min.
- ✅ Correzioni dopo la 3475:
  - scartate le email segnaposto ("etunimi.sukunimi@", "firstname.lastname@"…);
  - un'email con lo stesso cognome ma un altro nome (es. un familiare nello studio) non conta più come nominativa;
  - la pagina 2 / 3 non punta più a feed, CSS, news o ancore della homepage; percorsi tipici aggiunti per Finlandia, Regno Unito, Irlanda, Ungheria (impresszum), Grecia, Balcani;
  - riconosciute come generiche anche ugyved@, web@, kontor@, advokatbyra@.
- ✅ **RocketReach solo per il Regno Unito** (11 ottobre, regola concordata dopo 4 esecuzioni automatiche): in totale 8 email su 95 ricerche (8%), ma 7 su 23 nel Regno Unito (30%) e 1 su 72 in tutti gli altri paesi. Negli altri paesi chi non ha email sul sito va direttamente negli Scartati ("RocketReach non usato per il paese"), senza ricerca. Nuova colonna nel Log: "Senza RocketReach (paese)". Per aggiungere un paese: `motore.paesi_rocketreach` in `campagne/avvocati/campagna.json`.
- ⏳ Gli scartati senza email (26 nella 3475) sono soprattutto siti fatti con costruttori in JavaScript o con solo il modulo di contatto: valutare se vale la pena un servizio di rendering (a pagamento) o accettare la perdita.
- ⏳ Dopo 4–6 esecuzioni guardare nel Log:
  - % di email dal sito e quota di email nominative;
  - email RocketReach / ricerche RocketReach, per paese (Scartati + Prospect AI hanno la colonna Paese);
  - % di nuovi candidati per tema (scheda Temi).
- ✅ Attivazione automatica (06:00 e 18:00) dal 9 ottobre 2026.

## Fase 3b: Affidabilità ⏳ (ora nel motore comune: vale per tutte le campagne)

- ⏳ **Avviso se tutti i lotti AI falliscono** (email o Telegram): dal 12 al 19 ottobre il workflow ha girato 14 volte senza produrre nulla per un blocco OpenAI e nessuno se n'è accorto.
- ⏳ **Non consumare i temi quando il lotto va in errore:** oggi "Prepara aggiornamento temi" segna il tema come usato anche se l'AI non ha risposto; 49 temi sono stati "bruciati" nel blocco.

## Fase 4: Più prospect al giorno ⏳

- ⏳ **Scelta dei temi in base alla resa:** dare la precedenza alle nicchie con più "Nuovi totali / Candidati totali" e più email; spegnere quelle esaurite.
- ⏳ **Terza esecuzione alle 21:00** (proposta, da approvare): con RocketReach solo nel Regno Unito il limite orario non è più un vincolo; costo stimato +0,3 $ al giorno per circa +60 prospect.
- 💡 **Partire dagli albi degli ordini forensi:** molti ordini (es. ICAM, Ordem dos Advogados, NOvA, Law Society, Naczelna Rada Adwokacka) hanno motori di ricerca pubblici per specializzazione. Scaricarli via HTTP è gratis; l'AI servirebbe solo per scegliere i titolari, senza ricerca web.
- 💡 **Lotti da 30: per ora no.** Nelle prime 5 esecuzioni i lotti hanno restituito in media 18 candidati su 25 (paesi piccoli 5–12): l'AI non arriva già oggi al tetto, alzarlo renderebbe poco. Meglio più esecuzioni o più temi per i paesi grandi.

## Fase 5: Costi RocketReach ⏳

- ⏳ Valutare se RocketReach rende sugli avvocati: per studi individuali europei la copertura potrebbe essere bassa. Se il rapporto email / ricerche resta sotto il 20–25%, provare:
  - RocketReach solo per alcuni paesi (es. Regno Unito, Irlanda, Paesi Bassi, paesi nordici);
  - oppure niente RocketReach e solo email dal sito.
- 💡 Prima di RocketReach, provare un controllo gratuito delle email probabili (nome.cognome@dominio) con un servizio di verifica SMTP a basso costo.

---

## Misure

| Data | Esecuzione | Candidati AI | Nuovi | Email da sito (nominative) | Email RocketReach | Salvati | Scartati | Costo | Note |
|---|---|---|---|---|---|---|---|---|---|
| 2026-10-09 | 3488 | 63 | 61 (97%) | 50 (12 nominative) | 4 / 11 (tutte UK) | 54 | 7 | – | Temi MT01, UK02, BG01, EE01, PT02. Durata 6 min. |
| 2026-10-10 | 3513 | 104 | 98 (94%) | 68 (13 nominative) | 1 / 30 | 69 | 29 | – | Temi UK10, ES03, GR01, AT01, CZ01. Durata 7 min. |
| 2026-10-10 | 3539 | 112 | 109 (97%) | 70 (21 nominative) | 0 / 39 | 70 | 39 | – | Temi PL03, GR02, ES04, SK01, NO01. Spagna, Grecia, Polonia: 0 email RocketReach. Durata 8 min. |
| 2026-10-11 | 3567 | 62 | 62 (100%) | 47 (20 nominative) | 3 / 15 (2 UK, 1 NL) | 50 | 12 | – | Temi NL03, LT01, RO02, UK04, RS01. Durata 6 min. **Totale 4 esecuzioni automatiche: 243 salvati (~120 al giorno), 71% email dal sito, RocketReach 8/95.** Da qui RocketReach solo UK. |
| 2026-10-11 → 12 | 3581, 3583 | 184 | 158 | 119 (38 nominative) | 0 / 2 (solo UK) | 119 | 39 | – | Prime esecuzioni con RocketReach solo UK: 37 scartati senza ricerca negli altri paesi. |
| 2026-10-12 18:00 → 19 06:00 | 3585 … 3837 (14 esecuzioni) | 0 | 0 | 0 | 0 | **0** | 0 | 0 | **Blocco OpenAI per 7 giorni:** tutti i lotti in errore "OpenAI: Rate limit reached" (quasi certamente credito / limite dell'account OpenAI). Nessun avviso: il Log mostrava solo "Lotti falliti 5". 49 temi segnati come usati senza risultati. |
| 2026-10-19 → 21 | 3864, 3885, 3905, 3932 | 354 | 343 | 245 (61 nominative) | 3 / 15 (solo UK) | 248 | 95 | – | Ripartito da solo il 19/10 alle 18:00. |
| 2026-10-09 | 3475 | 103 | 101 (98%) | 75 (24 nominative, 44 generiche, 7 altre) | 0 / 26 ricerche | **75** | 26 | non misurato (prompt più corto del base, ~0,3 $ stimati) | Prima esecuzione, archivio vuoto. Temi: SE01, FI01, IE02, UK07, HU02. Salvati: Svezia 21/25, Irlanda 19/23, Finlandia 13/22, Regno Unito 12/17, Ungheria 10/14. 67 studi associati, 34 individuali. Durata 8 min. |
