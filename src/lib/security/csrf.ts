import { NextRequest } from 'next/server';

/**
 * Validação de Origem / Referer para proteção contra Cross-Site Request Forgery (CSRF).
 */
export function verifyCsrf(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  let origin = request.headers.get('origin');
  if (!origin) {
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        origin = new URL(referer).origin;
      } catch {
        return false;
      }
    }
  }

  const host = request.headers.get('host');

  if (!origin || !host) {
    // Se faltarem headers críticos em requisições de mutação, bloqueia
    return false;
  }

  try {
    const originUrl = new URL(origin);
    // 1. Correspondência exata do host
    if (originUrl.host === host) {
      return true;
    }
    // 2. Equivalência localhost e 127.0.0.1 em dev
    if (
      (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') &&
      (host.startsWith('localhost') || host.startsWith('127.0.0.1'))
    ) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
