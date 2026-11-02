import { NextResponse } from 'next/server';
import { chiediAN8n } from '../../../lib/n8n';
import { creaExcel, nomeFile, rispostaExcel } from '../../../lib/excel';

export const maxDuration = 60;

// Riscarica un download passato (non cambia nulla su n8n).
export async function GET(richiesta) {
  const campagna = richiesta.nextUrl.searchParams.get('campagna') || '';
  const download = richiesta.nextUrl.searchParams.get('download') || '';
  try {
    const { righe } = await chiediAN8n('download', { campagna, download });
    return rispostaExcel(await creaExcel(righe), nomeFile(campagna, download));
  } catch (e) {
    return NextResponse.json({ errore: e.message }, { status: 502 });
  }
}
