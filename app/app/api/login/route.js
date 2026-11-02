import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { COOKIE, DURATA_SECONDI, creaSessione } from '../../../lib/sessione';

// Limite ai tentativi sbagliati (per indirizzo, finché il server resta acceso).
const tentativi = new Map();
const MAX = 5;
const BLOCCO_MS = 10 * 60 * 1000;

const uguali = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function POST(richiesta) {
  const ip = richiesta.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'sconosciuto';
  const stato = tentativi.get(ip) || { n: 0, fino: 0 };
  if (stato.fino > Date.now()) {
    return NextResponse.json({ errore: 'Troppi tentativi: riprova tra qualche minuto.' }, { status: 429 });
  }

  const { password } = await richiesta.json().catch(() => ({}));
  const attesa = process.env.APP_PASSWORD || '';
  if (!attesa || !password || !uguali(password, attesa)) {
    stato.n += 1;
    if (stato.n >= MAX) Object.assign(stato, { n: 0, fino: Date.now() + BLOCCO_MS });
    tentativi.set(ip, stato);
    await new Promise(r => setTimeout(r, 800));
    return NextResponse.json({ errore: 'Password sbagliata.' }, { status: 401 });
  }

  tentativi.delete(ip);
  const risposta = NextResponse.json({ ok: true });
  risposta.cookies.set(COOKIE, await creaSessione(), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: DURATA_SECONDI
  });
  return risposta;
}
