"""Genera il codice SDK dei workflow "Strumenti" che contengono codice o pagine lunghe.

Uso:  python3 n8n/build-strumenti.py
Scrive n8n/export-mailup.sdk.ts e n8n/download-mailup.sdk.ts (da validare e caricare su n8n).
La chiave segreta del link di download NON e nella repo (e pubblica): nel sorgente c'e
__CHIAVE__, il valore vero e solo nel workflow su n8n.
"""
import json
import os

QUI = os.path.dirname(os.path.abspath(__file__))


def leggi(*parti):
    with open(os.path.join(QUI, *parti), encoding='utf-8') as f:
        return f.read()


def schema(colonne):
    return json.dumps([{'id': c, 'displayName': c, 'required': False, 'defaultMatch': False, 'display': True,
                        'type': t, 'canBeUsedToMatch': True} for c, t in colonne])


SCHEMI = {
    '__SCHEMA_RIGHE__': schema([(c, 'string') for c in
                                ['settimana', 'campagna', 'etichetta', 'nome', 'cognome', 'azienda', 'ruolo', 'settore', 'email', 'paese']]),
    '__SCHEMA_PARTENZA__': schema([('campagna', 'string'), ('email', 'string'), ('data', 'string')]),
    '__SCHEMA_STATO__': schema([('campagna', 'string'), ('etichetta', 'string'), ('ultima_riga', 'number'), ('ultimo_export', 'string')]),
}

for nome in ['export-mailup', 'download-mailup']:
    ts = leggi(f'{nome}.template.ts')
    pagina = leggi('download-mailup.pagina.js').replace(
        '__HTML_PAGINA__', json.dumps(leggi('pagine', 'download-mailup.html'), ensure_ascii=False))
    ts = ts.replace('__CODICE_CALCOLA__', json.dumps(leggi('export-mailup.calcola.js'), ensure_ascii=False))
    ts = ts.replace('__CODICE_PAGINA__', json.dumps(pagina, ensure_ascii=False))
    for k, v in SCHEMI.items():
        ts = ts.replace(k, v)
    with open(os.path.join(QUI, f'{nome}.sdk.ts'), 'w', encoding='utf-8') as f:
        f.write(ts)
    print(f'n8n/{nome}.sdk.ts')
