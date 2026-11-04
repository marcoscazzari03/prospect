import { NextResponse } from 'next/server';
import { chiediAN8n } from '../../../lib/n8n';
import { creaExcel, rispostaExcel } from '../../../lib/excel';

export const maxDuration = 60;

// Excel dell'anteprima: gli stessi contatti nuovi di "Scarica", ma NON vengono segnati come scaricati.
export async function GET(richiesta) {
  const campagna = richiesta.nextUrl.searchParams.get('campagna') || 'tutte';
  try {
    const { righe = [] } = await chiediAN8n('anteprima', { campagna });
    const quando = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' })
      .format(new Date()).replace(/[^0-9]/g, '');
    return rispostaExcel(await creaExcel(righe), `Anteprima_${campagna}_${quando}.xlsx`);
  } catch (e) {
    return NextResponse.json({ errore: e.message }, { status: 502 });
  }
}
