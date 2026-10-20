import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { generateRandomToken } from './crypto';
import { User, Session } from '@/types';

export const SESSION_COOKIE_NAME = 'auth_session';
export const SESSION_TTL_SECONDS = 86400; // 24 horas

/**
 * Cria uma nova sessão segura para o usuário e grava o cookie HttpOnly.
 */
export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const sessionId = generateRandomToken(32); // 256 bits de entropia aleatória
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;

  // Gravar sessão no banco D1
  await db
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, userId, expiresAt)
    .run();

  // Definir cookie HttpOnly seguro
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true, // Proteção contra roubo via XSS no cliente
    secure: process.env.NODE_ENV === 'production', // Transmissão somente sobre HTTPS em prod
    sameSite: 'lax', // Proteção contra CSRF
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  return sessionId;
}

/**
 * Obtém e valida o usuário da sessão ativa a partir do cookie HTTP.
 */
export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const db = getDb();
    const session = await db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .bind(sessionToken)
      .first<Session>();

    if (!session) {
      return null;
    }

    // Verificar se a sessão expirou
    if (Date.now() > session.expires_at) {
      await destroySession();
      return null;
    }

    // Buscar dados atualizados do usuário
    const user = await db
      .prepare('SELECT id, name, email, role, phone, cep, street, number, complement, neighborhood, city, state, created_at FROM users WHERE id = ?')
      .bind(session.user_id)
      .first<User>();

    return user;

  } catch (error) {
    return null;
  }
}

/**
 * Encerra a sessão ativa removendo do D1 e invalidando o cookie HTTP.
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      const db = getDb();
      await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionToken).run();
    }

    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  } catch (error) {
    // Tratamento silencioso
  }
}
