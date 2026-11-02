import { NextResponse } from 'next/server';
import { COOKIE, sessioneValida } from './lib/sessione';

// Tutte le pagine richiedono il login, tranne la pagina di accesso.
export async function middleware(richiesta) {
  const { pathname } = richiesta.nextUrl;
  if (pathname === '/login' || pathname === '/api/login') return NextResponse.next();
  if (await sessioneValida(richiesta.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ errore: 'accesso richiesto' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', richiesta.url));
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'] };
