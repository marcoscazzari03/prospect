import ExcelJS from 'exceljs';

// Colonne dell'Excel, nello stesso ordine della scheda Mailup.
const COLONNE = [
  ['Nome', 'nome'], ['Cognome', 'cognome'], ['Azienda', 'azienda'], ['Ruolo', 'ruolo'],
  ['Settore', 'settore'], ['Email', 'email'], ['Paese', 'paese'],
  ['Settore Le Fonti', 'settore_lefonti'], ['Comunità 1', 'comunita1'], ['Comunità 2', 'comunita2']
];
// Colonne che solo alcune campagne hanno (es. avvocati): nel foglio solo se almeno una riga le ha.
const FACOLTATIVE = [['Città', 'citta'], ['Specializzazione', 'specializzazione'], ['Apertura 1', 'apertura1'], ['Apertura 2', 'apertura2']];

// Un foglio per campagna (con "tutte" le campagne finiscono nello stesso file, su fogli diversi).
export async function creaExcel(righe) {
  const libro = new ExcelJS.Workbook();
  const perCampagna = {};
  for (const r of righe) (perCampagna[r.etichetta || r.campagna] ??= []).push(r);
  for (const [nome, elenco] of Object.entries(perCampagna)) {
    const foglio = libro.addWorksheet(nome.slice(0, 31));
    const colonne = [...COLONNE, ...FACOLTATIVE.filter(([, campo]) => elenco.some(r => r[campo]))];
    foglio.columns = colonne.map(([intestazione, campo]) => ({ header: intestazione, key: campo, width: 22 }));
    foglio.getRow(1).font = { bold: true };
    elenco.forEach(r => foglio.addRow(r));
  }
  if (!libro.worksheets.length) libro.addWorksheet('Vuoto');
  return Buffer.from(await libro.xlsx.writeBuffer());
}

export function nomeFile(campagna, download) {
  const quando = String(download).replace(/[^0-9]/g, '').slice(0, 12);
  return `Leads_${campagna}_${quando}.xlsx`;
}

export function rispostaExcel(buffer, nome) {
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nome}"`,
      'Cache-Control': 'no-store'
    }
  });
}
