import { SignJWT, jwtVerify } from 'jose';

// Sessione firmata in un cookie: dopo il login vale 30 giorni.
export const COOKIE = 'sessione';
export const DURATA_SECONDI = 30 * 24 * 60 * 60;

const segreto = () => new TextEncoder().encode(process.env.SESSION_SECRET || '');

export async function creaSessione() {
  return new SignJWT({ utente: 'marco' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURATA_SECONDI}s`)
    .sign(segreto());
}

export async function sessioneValida(token) {
  if (!token || !process.env.SESSION_SECRET) return false;
  try {
    await jwtVerify(token, segreto());
    return true;
  } catch {
    return false;
  }
}
