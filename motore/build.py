"""Costruisce i workflow n8n delle campagne a partire dal motore comune.

Uso:  python3 motore/build.py            (tutte le campagne)
      python3 motore/build.py avvocati   (una sola campagna)

Legge  motore/modello-n8n.json            (struttura dei nodi: export di "Prospect | Asia PMI | Ricerca")
       motore/codice/*.js                 (codice comune dei nodi Code)
       campagne/<id>/campagna.json        (impostazioni della campagna)
       campagne/<id>/prompt/*.txt         (prompt della ricerca AI)
       campagne/<id>/nota.md              (nota sul canvas)
Scrive dist/<id>.json                     (istantanea del workflow, quella che va su n8n).

Nei nodi Code il riferimento CFG.<chiave> diventa un blocco `const CFG = {...}`
in testa al codice, con le sole chiavi usate da quel nodo.
"""
import copy
import json
import os
import re
import sys

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOTORE = os.path.join(RADICE, 'motore')
CODICE = os.path.join(MOTORE, 'codice')
CAMPAGNE = os.path.join(RADICE, 'campagne')
DIST = os.path.join(RADICE, 'dist')

TRIGGER_MODELLO = 'Ogni 12 ore | 03:00 - 15:00'
RIMOSSI = {'Fine salvataggi', 'Prepara notifica successo', 'Call Singapore V3.3 | Success Monitor'}

CODICE_NODI = {
    'Prepara archivio': 'prepara-archivio.js',
    'Genera 5 Lotti': 'genera-lotti.js',
    'Normalizza output AI': 'normalizza-output-ai.js',
    'Prepara aggiornamento temi': 'prepara-aggiornamento-temi.js',
    'Aggiungi da riprovare': 'aggiungi-da-riprovare.js',
    'Deduplica e prepara righe': 'deduplica.js',
    'Controllo grandi aziende': 'controllo-grandi-aziende.js',
    'Prepara esclusa': 'prepara-esclusa.js',
    'Applica tetto RocketReach': 'applica-tetto-rocketreach.js',
    'Rinvia (tetto RocketReach)': 'rinvia-tetto-rocketreach.js',
    'Prospect non trovato RocketReach': 'prospect-non-trovato-rocketreach.js',
    'Normalizza RocketReach': 'normalizza-rocketreach.js',
    'Prepara righe finali': 'prepara-righe-finali.js',
    'Prepara Mailup': 'prepara-mailup.js',
    'Calcola statistiche': 'calcola-statistiche.js',
}

LETTURE_SCRITTURE = [('Read Prospect', 'Prospect AI'), ('Read Scartati', 'Scartati'), ('Read Temi', 'Temi'),
                     ('Read Esclusioni', 'Esclusioni'), ('Append - Prospect', 'Prospect AI'),
                     ('Append - Mailup', 'Mailup'), ('Append - Scartati', 'Scartati'),
                     ('Append - Log', 'Log'), ('Update - Temi', 'Temi')]


def leggi(*parti):
    with open(os.path.join(*parti), encoding='utf-8') as f:
        return f.read()


def campagne():
    return sorted(d for d in os.listdir(CAMPAGNE) if os.path.isfile(os.path.join(CAMPAGNE, d, 'campagna.json')))


def carica(id_campagna):
    cfg = json.loads(leggi(CAMPAGNE, id_campagna, 'campagna.json'))
    cfg['id'] = id_campagna
    return cfg


def liste_comuni():
    """Liste uguali per tutte le campagne (motore/liste), disponibili nel codice come CFG.<chiave>."""
    righe = lambda f: [r for r in leggi(MOTORE, 'liste', f).split('\n') if r.strip()]
    return {
        'settori': righe('settori.txt'),
        'parole_settori': [[x['parole'], x['settore']] for x in json.loads(leggi(MOTORE, 'liste', 'parole-chiave-settori.json'))],
        'comunita_tematiche': json.loads(leggi(MOTORE, 'liste', 'comunita-tematiche.json')),
        'citta_inglese': json.loads(leggi(MOTORE, 'liste', 'citta-inglese.json')),
    }


def con_cfg(js, cfg):
    """Mette in testa al codice le impostazioni della campagna usate dal nodo."""
    chiavi = sorted(set(re.findall(r'\bCFG\.([a-z_]+)', js)))
    if not chiavi:
        return js
    valori = {**liste_comuni(), **cfg['motore']}
    mancanti = [k for k in chiavi if k not in valori]
    if mancanti:
        raise KeyError(f"{cfg['id']}: in campagna.json manca motore.{', motore.'.join(mancanti)}")
    righe = [f'  {json.dumps(k)}: {json.dumps(valori[k], ensure_ascii=False)}' for k in chiavi]
    testa = (f"// Impostazioni della campagna \"{cfg['id']}\": generate da motore/build.py,\n"
             f"// si cambiano in campagne/{cfg['id']}/campagna.json (non qui).\n"
             'const CFG = {\n' + ',\n'.join(righe) + '\n};\n\n')
    return testa + js


def codice(file, cfg):
    return con_cfg(leggi(CODICE, file).rstrip() + '\n', cfg)


def codice_estrai(fase, cfg):
    t = leggi(CODICE, 'estrai-email.template.js')
    if fase == 'home':
        r = {'__SORGENTE__': 'Deduplica e prepara righe', '__FASE__': 'HOMEPAGE',
             '__CAMPO_FONTE__': 'prospect.Sito',
             '//__PAGINE__': leggi(CODICE, 'pagine-homepage.snippet.js').rstrip()}
    elif fase == 'p2':
        pagine = ("// La terza pagina serve solo se manca ancora un'email nominativa o generica.\n"
                  "if (basta) out['Pagina da controllare 2'] = '';") if cfg['terza_pagina'] else \
                 "out['Pagina da controllare 2'] = '';"
        r = {'__SORGENTE__': 'Ha pagina secondaria?', '__FASE__': 'PAGINA 2',
             '__CAMPO_FONTE__': "prospect['Pagina da controllare']", '//__PAGINE__': pagine}
    else:
        r = {'__SORGENTE__': 'Serve terza pagina?', '__FASE__': 'PAGINA 3',
             '__CAMPO_FONTE__': "prospect['Pagina da controllare 2']", '//__PAGINE__': ''}
    for k, v in r.items():
        t = t.replace(k, v)
    t = t.replace('\n\n\n\nreturn', '\n\nreturn').replace('\n\n\nreturn', '\n\nreturn')
    return con_cfg(t, cfg)


def schema(colonne):
    return [{'id': c, 'displayName': c, 'required': False, 'defaultMatch': False, 'display': True,
             'type': 'string', 'canBeUsedToMatch': True} for c in colonne]


def foglio(params, f, scheda):
    params['documentId'] = {'__rl': True, 'mode': 'list', 'value': f['id'], 'cachedResultName': f['nome'],
                            'cachedResultUrl': f"https://docs.google.com/spreadsheets/d/{f['id']}/edit"}
    gid = f['schede'][scheda]
    params['sheetName'] = {'__rl': True, 'mode': 'list', 'value': gid, 'cachedResultName': scheda,
                           'cachedResultUrl': f"https://docs.google.com/spreadsheets/d/{f['id']}/edit#gid={gid}"}


def motivo_scarto(cfg):
    """Espressione del motivo di scarto (scheda Scartati)."""
    m = cfg['motore']
    rinvio = "'Da riprovare (limite RocketReach)'"
    if m.get('max_tentativi'):
        n = m['max_tentativi']
        rinvio = (f"((Number($json['Tentativi precedenti']) || 0) + 1 >= {n} "
                  f"? 'Abbandonato: RocketReach non raggiunto dopo {n} tentativi' "
                  f": 'Da riprovare (limite RocketReach)')")
    return ("={{ String($json['Stato RocketReach'] || '').startsWith('ESCLUSA') "
            "? 'Esclusa: grande azienda - ' + String($json['Stato RocketReach']).slice(9) "
            ": (['RATE LIMIT', 'RICERCA NON COMPLETATA', 'RINVIATO (TETTO)'].includes($json['Stato RocketReach']) "
            f"? {rinvio} "
            ": ($json['Stato RocketReach'] === 'NO ROCKETREACH (PAESE)' "
            "? 'Nessuna email sul sito (RocketReach non usato per il paese)' "
            ": 'Nessuna email trovata (sito + RocketReach)')) }}")


def build(cfg):
    m = cfg['motore']
    modello = json.loads(leggi(MOTORE, 'modello-n8n.json'))
    nodi = {n['name']: copy.deepcopy(n) for n in modello['nodes'] if n['name'] not in RIMOSSI}

    # Trigger
    trigger = cfg['trigger']['nome']
    t = nodi.pop(TRIGGER_MODELLO)
    t['name'] = trigger
    t['parameters'] = {'rule': {'interval': [{'field': 'cronExpression', 'expression': cfg['trigger']['cron']}]}}
    nodi[trigger] = t

    for nome, file in CODICE_NODI.items():
        nodi[nome]['parameters']['jsCode'] = codice(file, cfg)
    nodi['Estrai email homepage']['parameters']['jsCode'] = codice_estrai('home', cfg)
    nodi['Estrai email pagina secondaria']['parameters']['jsCode'] = codice_estrai('p2', cfg)

    agente = nodi['Ricerca prospect AI']['parameters']
    agente['text'] = leggi(CAMPAGNE, cfg['id'], 'prompt', 'prompt.txt').rstrip() + '\n'
    agente['options'] = {'systemMessage': leggi(CAMPAGNE, cfg['id'], 'prompt', 'system.txt').rstrip()}

    # Foglio Google (se manca, restano quelli del modello)
    if cfg.get('foglio'):
        for nome, scheda in LETTURE_SCRITTURE:
            foglio(nodi[nome]['parameters'], cfg['foglio'], scheda)
    if cfg.get('colonne_prospect'):
        nodi['Append - Prospect']['parameters']['columns']['schema'] = schema(cfg['colonne_prospect'])
    if cfg.get('colonne_mailup'):
        nodi['Append - Mailup']['parameters']['columns']['schema'] = schema(cfg['colonne_mailup'])

    for nome in ['HTTP - Homepage', 'HTTP - Pagina secondaria']:
        for h in nodi[nome]['parameters']['headerParameters']['parameters']:
            if h['name'] == 'Accept-Language':
                h['value'] = cfg['accept_language']

    # Scartati: data nel fuso della campagna, motivo, colonne in piu.
    ass = nodi['Prepara scartati']['parameters']['assignments']['assignments']
    for a in ass:
        if a['name'] == 'Data':
            a['value'] = f"={{{{ $now.setZone('{m['fuso_orario']}').toFormat('yyyy-MM-dd') }}}}"
        if a['name'] == 'Motivo scarto':
            a['value'] = motivo_scarto(cfg)
    ass += [{'id': f's{13 + k}', 'name': colonna, 'type': 'string', 'value': f"={{{{ $json['{colonna}'] }}}}"}
            for k, (colonna, _) in enumerate(m['campi_extra'])]

    conn = copy.deepcopy(modello['connections'])
    for r in RIMOSSI:
        conn.pop(r, None)
    for src in list(conn):
        for typ in conn[src]:
            conn[src][typ] = [[c for c in uscita if c['node'] not in RIMOSSI] for uscita in conn[src][typ]]
    conn[trigger] = conn.pop(TRIGGER_MODELLO)

    def link(a, b, ia=0, ib=0):
        uscite = conn.setdefault(a, {}).setdefault('main', [])
        while len(uscite) <= ia:
            uscite.append([])
        uscite[ia].append({'node': b, 'type': 'main', 'index': ib})

    gruppi = [g for g in modello['nodeGroups'] if not g['name'].startswith('Success Monitor')]

    # Terza pagina (note legali / Impressum / privacy) se manca ancora l'email.
    if cfg['terza_pagina']:
        sposta = 672
        for n in nodi.values():
            if n['position'][0] >= 4400:
                n['position'] = [n['position'][0] + sposta, n['position'][1]]

        se2 = copy.deepcopy(nodi['Ha pagina secondaria?'])
        se2.update(name='Serve terza pagina?', id='b7c1e2d3-0a4f-4b6e-9c21-7d3e5f6a8b90', position=[4400, -176])
        se2['parameters']['conditions']['conditions'][0].update(
            id='c2d3e4f5-1b2c-4d3e-8f4a-5b6c7d8e9f01', leftValue='={{ $json["Pagina da controllare 2"] }}')
        nodi[se2['name']] = se2

        http3 = copy.deepcopy(nodi['HTTP - Pagina secondaria'])
        http3.update(name='HTTP - Terza pagina', id='d3e4f5a6-2c3d-4e4f-9a5b-6c7d8e9f0a12', position=[4624, -352])
        http3['parameters']['url'] = '={{ $json["Pagina da controllare 2"] }}'
        nodi[http3['name']] = http3

        estrai3 = copy.deepcopy(nodi['Estrai email pagina secondaria'])
        estrai3.update(name='Estrai email terza pagina', id='e4f5a6b7-3d4e-4f5a-8b6c-7d8e9f0a1b23', position=[4848, -352])
        estrai3['parameters']['jsCode'] = codice_estrai('p3', cfg)
        nodi[estrai3['name']] = estrai3

        nodi['Riunisci risultati email']['parameters'] = {'numberInputs': 3}

        conn['Estrai email pagina secondaria'] = {'main': [[]]}
        link('Estrai email pagina secondaria', 'Serve terza pagina?')
        link('Serve terza pagina?', 'HTTP - Terza pagina', 0)
        link('Serve terza pagina?', 'Riunisci risultati email', 1, 2)
        link('HTTP - Terza pagina', 'Estrai email terza pagina')
        link('Estrai email terza pagina', 'Riunisci risultati email', 0, 0)

        for g in gruppi:
            if g['name'].startswith('6 '):
                g['nodeNames'] += ['Serve terza pagina?', 'HTTP - Terza pagina', 'Estrai email terza pagina']

    for g in gruppi:
        numero = g['name'].split(' ')[0]
        if numero in cfg.get('descrizioni_gruppi', {}):
            g['description'] = cfg['descrizioni_gruppi'][numero]

    # Avviso Telegram se l'esecuzione va male (motore/avvisi.json): 3+ ricerche AI fallite
    # o nessun candidato. Chiama "Prospect | Strumenti | Avvisi Telegram" senza aspettarlo.
    avvisi = json.loads(leggi(MOTORE, 'avvisi.json'))
    if avvisi.get('workflow_id'):
        x, y = nodi['Calcola statistiche']['position']
        nodi['Serve un avviso?'] = {
            'id': 'a1b2c3d4-0001-4a5b-8c6d-avviso000001', 'name': 'Serve un avviso?',
            'type': 'n8n-nodes-base.if', 'typeVersion': 2.2, 'position': [x + 208, y + 224],
            'parameters': {'conditions': {
                'options': {'caseSensitive': True, 'leftValue': '', 'typeValidation': 'loose', 'version': 2},
                'conditions': [{'id': 'av1', 'operator': {'type': 'boolean', 'operation': 'true', 'singleValue': True},
                                'leftValue': "={{ Number($json['Lotti falliti']) >= %d || Number($json['Candidati AI']) === 0 }}"
                                             % avvisi['lotti_falliti_minimi'], 'rightValue': ''}],
                'combinator': 'and'}, 'options': {}}}
        nodi['Prepara avviso'] = {
            'id': 'a1b2c3d4-0002-4a5b-8c6d-avviso000002', 'name': 'Prepara avviso',
            'type': 'n8n-nodes-base.set', 'typeVersion': 3.4, 'position': [x + 416, y + 224],
            'parameters': {'assignments': {'assignments': [
                {'id': 'p1', 'name': 'tipo', 'type': 'string', 'value': 'esecuzione'},
                {'id': 'p2', 'name': 'workflow', 'type': 'string', 'value': cfg['nome_workflow']},
                {'id': 'p3', 'name': 'workflow_id', 'type': 'string', 'value': cfg.get('id_n8n') or ''},
                {'id': 'p4', 'name': 'esecuzione', 'type': 'string', 'value': '={{ $execution.id }}'},
                {'id': 'p5', 'name': 'lotti', 'type': 'number', 'value': "={{ $json['Lotti'] }}"},
                {'id': 'p6', 'name': 'lotti_falliti', 'type': 'number', 'value': "={{ $json['Lotti falliti'] }}"},
                {'id': 'p7', 'name': 'candidati', 'type': 'number', 'value': "={{ $json['Candidati AI'] }}"},
                {'id': 'p8', 'name': 'salvati', 'type': 'number', 'value': "={{ $json['Salvati Prospect AI'] }}"},
                {'id': 'p9', 'name': 'errore', 'type': 'string',
                 'value': "={{ $('Aggiungi da riprovare').all().map(i => i.json.errore).filter(Boolean)[0] || '' }}"}]},
                'options': {}}}
        nodi['Avviso Telegram'] = {
            'id': 'a1b2c3d4-0003-4a5b-8c6d-avviso000003', 'name': 'Avviso Telegram',
            'type': 'n8n-nodes-base.executeWorkflow', 'typeVersion': 1.2, 'position': [x + 624, y + 224],
            'parameters': {'workflowId': {'__rl': True, 'mode': 'id', 'value': avvisi['workflow_id']},
                           'options': {'waitForSubWorkflow': False}}}
        link('Calcola statistiche', 'Serve un avviso?')
        link('Serve un avviso?', 'Prepara avviso')
        link('Prepara avviso', 'Avviso Telegram')
        # n8n vuole riquadri con una sola uscita: l'avviso sta nello stesso riquadro del Log.
        for g in gruppi:
            if g['name'].startswith('13 '):
                g['name'] = '13 · Log e avviso'
                g['nodeNames'] += ['Serve un avviso?', 'Prepara avviso', 'Avviso Telegram']
                # n8n accetta descrizioni dei riquadri di massimo 145 caratteri.
                g['description'] = ('Statistiche nella scheda Log; avviso Telegram se 3+ ricerche AI falliscono '
                                    'o non arriva nessun candidato.')

    nota = nodi['Nota: come funziona']
    nota['parameters'].update(content=leggi(CAMPAGNE, cfg['id'], 'nota.md').rstrip(), height=420, width=1240)

    ordine = [trigger] + [n['name'] for n in modello['nodes'] if n['name'] in nodi and n['name'] != TRIGGER_MODELLO]
    ordine += [n for n in nodi if n not in ordine]

    settings = {'executionOrder': 'v1'}
    if cfg.get('fuso_workflow'):
        settings['timezone'] = cfg['fuso_workflow']
    settings['callerPolicy'] = 'workflowsFromSameOwner'
    if avvisi.get('workflow_id'):
        # Se il workflow si blocca con un errore, n8n avvisa lo stesso workflow degli avvisi.
        settings['errorWorkflow'] = avvisi['workflow_id']

    return {
        'name': cfg['nome_workflow'],
        'nodes': [nodi[n] for n in ordine],
        'connections': conn,
        'nodeGroups': [{'name': g['name'], 'nodeNames': g['nodeNames'], 'description': g.get('description', '')}
                       for g in gruppi],
        'settings': settings,
    }


def scrivi(nome, dati):
    with open(os.path.join(DIST, nome), 'w', encoding='utf-8') as f:
        json.dump(dati, f, ensure_ascii=False, indent=2)
        f.write('\n')


if __name__ == '__main__':
    scelte = sys.argv[1:] or campagne()
    os.makedirs(DIST, exist_ok=True)
    for c in scelte:
        cfg = carica(c)
        wf = build(cfg)
        scrivi(f'{c}.json', wf)
        print(f'{c}: {len(wf["nodes"])} nodi -> dist/{c}.json')
        # Copia di prova: stesso workflow con un altro nome, solo esecuzioni manuali.
        if cfg.get('prova'):
            scrivi(f'{c}-prova.json', {**wf, 'name': cfg['prova']['nome']})
            print(f'{c}: copia di prova -> dist/{c}-prova.json')

    # Elenco letto dal workflow "Prospect | Strumenti | Deploy da GitHub": solo le campagne
    # con un workflow su n8n e "deploy": true in campagna.json.
    elenco = []
    for c in campagne():
        cfg = carica(c)
        if cfg.get('id_n8n') and cfg.get('deploy'):
            elenco.append({'campagna': c, 'workflow': cfg['nome_workflow'], 'id_n8n': cfg['id_n8n'], 'file': f'dist/{c}.json'})
        if cfg.get('prova'):
            elenco.append({'campagna': c + ' (prova)', 'workflow': cfg['prova']['nome'], 'id_n8n': cfg['prova']['id_n8n'],
                           'file': f'dist/{c}-prova.json'})
    scrivi('deploy.json', elenco)
    print('deploy:', ', '.join(x['campagna'] for x in elenco) or 'nessuna campagna')

    # Elenco letto dal workflow "Prospect | Strumenti | Export Mailup settimanale":
    # foglio Google di ogni campagna con un workflow su n8n (scheda "Mailup").
    modello = json.loads(leggi(MOTORE, 'modello-n8n.json'))
    mailup_modello = next(n for n in modello['nodes'] if n['name'] == 'Append - Mailup')['parameters']['documentId']['value']
    export = []
    for c in campagne():
        cfg = carica(c)
        if not cfg.get('id_n8n'):
            continue
        export.append({'campagna': c, 'etichetta': cfg['etichetta'], 'scheda': 'Mailup',
                       'foglio_id': cfg['foglio']['id'] if cfg.get('foglio') else mailup_modello})
    scrivi('campagne.json', export)

    # Orari dei giri (ora italiana) per la app web: "prossimo giro" sulle schede delle campagne.
    orari = {}
    for c in campagne():
        cfg = carica(c)
        cron = (cfg.get('trigger') or {}).get('cron', '').split()
        if cfg.get('id_n8n') and len(cron) == 5 and cron[0].isdigit():
            orari[c] = sorted(f'{int(h):02d}:{int(cron[0]):02d}' for h in cron[1].split(','))
    with open(os.path.join(RADICE, 'app', 'lib', 'orari.json'), 'w', encoding='utf-8') as f:
        json.dump(orari, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('orari app:', orari)
    print('export Mailup:', ', '.join(x['campagna'] for x in export))

    # Elenco letto dal workflow "Prospect | Strumenti | Aggiungi colonne": colonne che devono
    # esistere nell'intestazione delle schede (le schede ignorano le colonne che non hanno).
    colonne = [{'campagna': x['campagna'], 'foglio_id': x['foglio_id'], 'scheda': scheda, 'colonne': cols}
               for x in export for scheda, cols in carica(x['campagna']).get('colonne_nuove', {}).items()]
    scrivi('colonne.json', colonne)

    # Letto dal workflow "Prospect | Strumenti | Prova aperture": campagne con le frasi su misura.
    scrivi('aperture.json', [{'campagna': x['campagna'], 'etichetta': x['etichetta'], 'foglio_id': x['foglio_id'],
                               'scheda': 'Prospect AI', **carica(x['campagna'])['motore']['aperture'],
                               'prompt': leggi(MOTORE, 'aperture', 'prompt.txt')}
                              for x in export if carica(x['campagna'])['motore'].get('aperture')])

    # Letto dallo strumento "Prospect | Strumenti | Compila specializzazione avvocati".
    scrivi('compila-avvocati.json', {'specializzazione': carica('avvocati')['motore']['specializzazione'],
                                     'citta_inglese': liste_comuni()['citta_inglese']})
    print('colonne da garantire:', len(colonne), 'schede')
