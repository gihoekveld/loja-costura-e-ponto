export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAllOrders, updateOrderStatus } from '@/lib/db/orders';


export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Área restrita ao administrador.' },
        { status: 403 }
      );
    }

    const orders = await getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar pedidos da loja.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Área restrita ao administrador.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !['pending', 'paid', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Deve ser pending, paid ou cancelled.' },
        { status: 400 }
      );
    }

    const success = await updateOrderStatus(orderId, status);
    if (!success) {
      return NextResponse.json({ error: 'Falha ao atualizar status do pedido.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, orderId, status });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar pedido.' }, { status: 500 });
  }
}
