

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

    const { items, name, cpf, address, number, city, state, cep, paymentMethod, cardNumber } = result.data;

    const isCard = paymentMethod === 'credit_card' || paymentMethod === 'credit_card_approved';
    const cleanCard = cardNumber ? cardNumber.replace(/\D/g, '') : '';

    if (isCard && cleanCard.length > 0 && cleanCard.length !== 16) {
      return NextResponse.json(
        { error: 'O número do cartão de crédito deve conter 16 dígitos (ex: 4000 0000 0000 0010).' },
        { status: 400 }
      );
    }

    // 4. SEGURANÇA CRÍTICA: Re-validação total de preços e estoque no SERVIDOR
    let serverCalculatedTotal = 0;
    const validatedOrderItems: { productId: string; quantity: number; unitPrice: number }[] = [];

    for (const item of items) {
      // Consultar produto no PostgreSQL para obter o preço real
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

    // 5. Simulação de Pagamento Fictício (Recusado para testes de falha)
    if (paymentMethod === 'credit_card_declined' || (isCard && cleanCard.endsWith('0002'))) {
      // Registrar pedido cancelado sem dar baixa no estoque
      const failedOrder = await createOrder(
        user.id,
        validatedOrderItems,
        serverCalculatedTotal,
        formattedAddress,
        'cartao_recusado',
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

    // 6. Atualizar estoque no PostgreSQL para cada item
    for (const item of validatedOrderItems) {
      await updateProductStock(item.productId, item.quantity);
    }

    const orderStatus = paymentMethod === 'pix' ? 'pending' : 'paid';
    const last4 = cleanCard ? cleanCard.slice(-4) : '0010';
    const recordedPaymentMethod = isCard ? 'cartao_credito' : paymentMethod;

    // 7. Criar Pedido no PostgreSQL
    const order = await createOrder(
      user.id,
      validatedOrderItems,
      serverCalculatedTotal,
      formattedAddress,
      recordedPaymentMethod,
      orderStatus
    );

    return NextResponse.json({
      success: true,
      message: paymentMethod === 'pix' 
        ? 'Pedido registrado via Pix Fictício! Aguardando confirmação.' 
        : `Pagamento aprovado com sucesso no cartão de teste (final ${last4})! Pedido concluído.`,
      order,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno ao processar o checkout.' },
      { status: 500 }
    );
  }
}
