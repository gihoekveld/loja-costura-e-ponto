/**
 * Utilitários de higienização de entrada para prevenção contra Reflected/Stored XSS.
 */

export function escapeHtml(unsafeStr: string): string {
  if (typeof unsafeStr !== 'string') return '';
  return unsafeStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return escapeHtml(input.trim());
}
