

import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation/schemas';
import { findUserByEmail, findUserByCpfHash, createUser } from '@/lib/db/users';
import { hashPassword, hashCpf, encryptCpf } from '@/lib/auth/crypto';

import { createSession } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';


export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting por IP para impedir ataques de cadastro em massa
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit(`register:${clientIp}`, 5, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas de cadastro. Por favor, aguarde 1 minuto.' },
        { status: 429 }
      );
    }

    // 2. Leitura e Validação de Schema
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Dados de cadastro inválidos' },
        { status: 400 }
      );
    }

    const { name, email, password, cpf, phone, cep, street, number, complement, neighborhood, city, state } = result.data;

    // 3. Verificar se o e-mail já está cadastrado
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Não foi possível concluir o cadastro com os dados informados. Verifique se você já possui cadastro.' },
        { status: 400 }
      );
    }

    // 4. Tratamento Criptográfico do CPF:
    // a) Hash determinístico para buscas e indexação rápida no D1
    // b) Criptografia AES-256-GCM reversível para geração de NF-e
    const cpfHash = await hashCpf(cpf);
    const cpfEncrypted = await encryptCpf(cpf);

    // Verificar se já existe conta associada a este CPF via hash determinístico
    const existingCpfUser = await findUserByCpfHash(cpfHash);
    if (existingCpfUser) {
      return NextResponse.json(
        { error: 'Este CPF já está cadastrado em nosso sistema. Faça login para continuar.' },
        { status: 400 }
      );
    }

    // 5. Hash seguro da senha com PBKDF2 Web Crypto API (100.000 iterações)
    const passwordHash = await hashPassword(password);

    // 6. Salvar cliente completo no banco D1
    const user = await createUser({
      name,
      email,
      passwordHash,
      cpfHash,
      cpfEncrypted,
      phone,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      role: 'customer',
    });

    // 7. Autenticar automaticamente criando sessão e cookie HttpOnly
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cep: user.cep,
        city: user.city,
        state: user.state,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor ao processar o cadastro.' },
      { status: 500 }
    );
  }

}
