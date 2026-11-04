import { NextResponse } from 'next/server';
import { chiediAN8n } from '../../../lib/n8n';
import { creaExcel, rispostaExcel } from '../../../lib/excel';

export const maxDuration = 60;

// Storico completo: tutti i contatti con email di tutte le campagne, con lo stato. Non segna nulla.
export async function GET() {
  try {
    const { righe = [] } = await chiediAN8n('tutto');
    const quando = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' })
      .format(new Date()).replace(/[^0-9]/g, '');
    return rispostaExcel(await creaExcel(righe), `Storico_completo_${quando}.xlsx`);
  } catch (e) {
    return NextResponse.json({ errore: e.message }, { status: 502 });
  }
}
