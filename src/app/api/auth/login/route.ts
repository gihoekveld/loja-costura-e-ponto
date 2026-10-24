

import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation/schemas';
import { findUserByEmail } from '@/lib/db/users';
import { verifyPassword } from '@/lib/auth/crypto';
import { createSession } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';


export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting por IP para conter força bruta (Brute-Force Attack)
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit(`login:${clientIp}`, 5, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas incorretas. Conta temporariamente bloqueada por 1 minuto.' },
        { status: 429 }
      );
    }

    // 2. Validação do Schema
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Credenciais inválidas' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 3. Buscar Usuário
    const user = await findUserByEmail(email);

    // Mensagem padronizada e idêntica para impedir Enumeração de Usuários (User Enumeration Protection)
    const invalidCredentialsError = 'Credenciais inválidas. Verifique seu e-mail e senha.';

    if (!user || !user.password_hash) {
      // Executa simulação de verificação para mitigar ataques de cronometragem
      await verifyPassword(password, 'pbkdf2:100000:00000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000');
      return NextResponse.json({ error: invalidCredentialsError }, { status: 401 });
    }

    // 4. Verificar Hash da Senha com Tempo Constante
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: invalidCredentialsError }, { status: 401 });
    }

    // 5. Criar Sessão Segura e Cookie HttpOnly
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno ao processar o login.' },
      { status: 500 }
    );
  }
}
