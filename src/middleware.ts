import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security/headers';
import { verifyCsrf } from '@/lib/security/csrf';

const SESSION_COOKIE_NAME = 'auth_session';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Aplicar Headers de Segurança HTTP
  applySecurityHeaders(response.headers);

  // 2. Proteção contra CSRF para requisições de mutação (exceto automações e cron em /api/cron)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const isCron = request.nextUrl.pathname.startsWith('/api/cron');
    if (!isCron && !verifyCsrf(request)) {
      return NextResponse.json(
        { error: 'Requisição rejeitada por validação de segurança (CSRF invalid origin).' },
        { status: 403, headers: response.headers }
      );
    }
  }

  // 3. Proteção Server-Side de Rotas Autenticadas (permite /admin/banco com autenticação própria via senha)
  const pathname = request.nextUrl.pathname;
  const protectedRoutes = ['/account', '/orders', '/checkout', '/admin'];

  const isProtectedRoute =
    protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) && !pathname.startsWith('/admin/banco');

  if (isProtectedRoute) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export default middleware;

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto arquivos estáticos, _next, imagens, favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
