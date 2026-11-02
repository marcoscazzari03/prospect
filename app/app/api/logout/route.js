import { NextResponse } from 'next/server';
import { COOKIE } from '../../../lib/sessione';

export async function POST(richiesta) {
  const risposta = NextResponse.redirect(new URL('/login', richiesta.url), { status: 303 });
  risposta.cookies.delete(COOKIE);
  return risposta;
}
