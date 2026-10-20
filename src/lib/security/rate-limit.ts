import { getDb } from '@/lib/db';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Limitador de Taxa (Rate Limiter) com janela deslizante gravado no D1.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + windowSeconds;
  const rateLimitKey = `rl:${key}`;

  try {
    const existing = await db
      .prepare('SELECT count, expires_at FROM rate_limits WHERE key = ?')
      .bind(rateLimitKey)
      .first<{ count: number; expires_at: number }>();

    if (!existing) {
      await db
        .prepare('INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)')
        .bind(rateLimitKey, expiresAt)
        .run();

      return {
        success: true,
        remaining: maxRequests - 1,
        resetSeconds: windowSeconds,
      };
    }

    // Se o registro expirou, reseta a contagem
    if (now > existing.expires_at) {
      await db
        .prepare('DELETE FROM rate_limits WHERE key = ?')
        .bind(rateLimitKey)
        .run();

      await db
        .prepare('INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)')
        .bind(rateLimitKey, expiresAt)
        .run();

      return {
        success: true,
        remaining: maxRequests - 1,
        resetSeconds: windowSeconds,
      };
    }

    // Se ainda está na janela de tempo
    if (existing.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetSeconds: existing.expires_at - now,
      };
    }

    // Incrementar contagem
    await db
      .prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?')
      .bind(rateLimitKey)
      .run();

    return {
      success: true,
      remaining: maxRequests - (existing.count + 1),
      resetSeconds: existing.expires_at - now,
    };
  } catch (error) {
    // Em caso de exceção de banco de dados, permite requisição com fallback gracioso
    return {
      success: true,
      remaining: 1,
      resetSeconds: windowSeconds,
    };
  }
}
