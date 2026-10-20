export const SECURITY_HEADERS = {
  // Prevenção contra injeção XSS e inclusão de scripts maliciosos não autorizados
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';",
  // Impede que navegadores adivinhem o MIME-type de arquivos
  'X-Content-Type-Options': 'nosniff',
  // Proteção contra Clickjacking
  'X-Frame-Options': 'DENY',
  // Controle de vazamento de URLs no cabeçalho Referer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Bloqueio de acesso a recursos de hardware sensíveis do navegador
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  // Força HTTPS em produção
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export function applySecurityHeaders(headers: Headers): Headers {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return headers;
}
