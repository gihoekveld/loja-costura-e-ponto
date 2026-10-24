

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { checkoutSchema } from '@/lib/validation/schemas';
import { getProductById, updateProductStock } from '@/lib/db/products';
import { createOrder } from '@/lib/db/orders';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString } from '@/lib/security/sanitize';


export async function POST(request: NextRequest) {
  try {
    // 1. Exigir autenticação obrigatória do servidor
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Você precisa estar autenticado para finalizar a compra.' },
        { status: 401 }
      );
    }

    // 2. Rate Limiting por usuário
    const rateLimit = await checkRateLimit(`checkout:${user.id}`, 5, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas de checkout. Aguarde 1 minuto.' },
        { status: 429 }
      );
    }

    // 3. Validação estrita de Schema (Zod)
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Dados de checkout inválidos' },
        { status: 400 }
      );
    }

    const { items, name, cpf, address, number, city, state, cep, paymentMethod } = result.data;

    // 4. SEGURANÇA CRÍTICA: Re-validação total de preços e estoque no SERVIDOR
    let serverCalculatedTotal = 0;
    const validatedOrderItems: { productId: string; quantity: number; unitPrice: number }[] = [];

    for (const item of items) {
      // Consultar produto no D1 para obter o preço real
      const product = await getProductById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `O produto solicitado (ID: ${item.productId}) não existe no catálogo.` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}, Solicitado: ${item.quantity}` },
          { status: 400 }
        );
      }

      // NUNCA confiar no preço enviado pelo navegador do cliente. Usar o preço do banco!
      const realUnitPrice = Number(product.price);
      serverCalculatedTotal += realUnitPrice * item.quantity;

      validatedOrderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: realUnitPrice,
      });
    }

    const formattedAddress = sanitizeString(
      `${address}, ${number} - ${city}/${state} - CEP ${cep} (Destinatário: ${name}, CPF: ${cpf})`
    );

    // 5. Simulação de Pagamento Fictício
    if (paymentMethod === 'credit_card_declined') {
      // Registrar pedido cancelado sem dar baixa no estoque
      const failedOrder = await createOrder(
        user.id,
        validatedOrderItems,
        serverCalculatedTotal,
        formattedAddress,
        'cartao_credito_recusado',
        'cancelled'
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Transação recusada pela operadora fictícia de cartão de crédito. Teste de falha executado com sucesso.',
          orderId: failedOrder.id,
        },
        { status: 400 }
      );
    }

    // 6. Atualizar estoque no D1 para cada item
    for (const item of validatedOrderItems) {
      await updateProductStock(item.productId, item.quantity);
    }

    const orderStatus = paymentMethod === 'pix' ? 'pending' : 'paid';

    // 7. Criar Pedido no D1
    const order = await createOrder(
      user.id,
      validatedOrderItems,
      serverCalculatedTotal,
      formattedAddress,
      paymentMethod,
      orderStatus
    );

    return NextResponse.json({
      success: true,
      message: paymentMethod === 'pix' 
        ? 'Pedido registrado via Pix Fictício! Aguardando confirmação.' 
        : 'Pagamento fictício aprovado e pedido concluído com sucesso!',
      order,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno ao processar o checkout.' },
      { status: 500 }
    );
  }
}
