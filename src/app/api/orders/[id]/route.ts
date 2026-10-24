

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getOrderByIdForUser } from '@/lib/db/orders';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    const orderId = params.id;

    // Proteção IDOR: Garante no servidor que o pedido pertence ao usuário autenticado
    const order = await getOrderByIdForUser(orderId, user.id);

    if (!order) {
      // Retorna 404 neutro sem indicar se o ID existe ou pertence a outro usuário
      return NextResponse.json(
        { error: 'Pedido não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do pedido.' },
      { status: 500 }
    );
  }
}
