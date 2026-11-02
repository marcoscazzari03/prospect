import { NextResponse } from 'next/server';
import { chiediAN8n } from '../../../lib/n8n';
import { creaExcel, nomeFile, rispostaExcel } from '../../../lib/excel';

export const maxDuration = 60;

// Scarica i contatti mai scaricati di una campagna (o di tutte): n8n li segna come scaricati.
export async function POST(richiesta) {
  const { campagna } = await richiesta.json().catch(() => ({}));
  try {
    const { righe, download } = await chiediAN8n('scarica', { campagna });
    if (!righe.length) return NextResponse.json({ vuoto: true });
    return rispostaExcel(await creaExcel(righe), nomeFile(campagna, download));
  } catch (e) {
    return NextResponse.json({ errore: e.message }, { status: 502 });
  }
}
