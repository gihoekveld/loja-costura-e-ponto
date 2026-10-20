import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      cep: user.cep,
      street: user.street,
      number: user.number,
      complement: user.complement,
      neighborhood: user.neighborhood,
      city: user.city,
      state: user.state,
    },
  });
}

