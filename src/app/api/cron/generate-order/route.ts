import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function cleanPassword(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

function isAuthorized(request: NextRequest): boolean {
  const validKeys = new Set(['senha123']);
  const cronSecret = cleanPassword(process.env.CRON_SECRET);
  const profPwd = cleanPassword(process.env.PROFESSOR_PASSWORD);
  if (cronSecret) validKeys.add(cronSecret);
  if (profPwd) validKeys.add(profPwd);

  const searchParams = request.nextUrl.searchParams;
  const fromQuery = cleanPassword(searchParams.get('key') || searchParams.get('senha') || searchParams.get('token'));
  if (fromQuery && validKeys.has(fromQuery)) {
    return true;
  }

  const headerKey = cleanPassword(request.headers.get('x-cron-key') || request.headers.get('x-professor-password'));
  if (headerKey && validKeys.has(headerKey)) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const rawToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const token = cleanPassword(rawToken);
    if (token && validKeys.has(token)) return true;
  }

  const host = request.headers.get('host') || '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return true;
  }

  return false;
}

const PAYMENT_METHODS = ['pix', 'pix', 'cartao_credito', 'cartao_credito', 'boleto'];
const STATUS_WEIGHTS: ('paid' | 'pending' | 'cancelled')[] = [
  'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid',
  'pending', 'pending',
  'cancelled',
];

async function handleOrderGeneration() {
  const db = getDb();

  // 1. Selecionar um cliente aleatório do banco
  let userRes = await db.query(
    `SELECT id, name, email, street, number, complement, neighborhood, city, state, cep
     FROM users
     WHERE role = 'customer'
     ORDER BY RANDOM()
     LIMIT 1`
  );

  if (userRes.rowCount === 0) {
    userRes = await db.query(
      `SELECT id, name, email, street, number, complement, neighborhood, city, state, cep
       FROM users
       ORDER BY RANDOM()
       LIMIT 1`
    );
  }

  const customer = userRes.results[0];
  if (!customer) {
    throw new Error('Nenhum usuário encontrado no banco para associar ao pedido.');
  }

  // 2. Selecionar de 1 a 3 produtos aleatórios
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const prodRes = await db.query(
    `SELECT id, name, price, stock
     FROM products
     ORDER BY RANDOM()
     LIMIT $1`,
    [itemCount]
  );

  if (prodRes.rowCount === 0) {
    throw new Error('Nenhum produto encontrado no banco para gerar itens do pedido.');
  }

  const orderId = `ord_${crypto.randomBytes(8).toString('hex')}`;
  const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
  const status = STATUS_WEIGHTS[Math.floor(Math.random() * STATUS_WEIGHTS.length)];

  const shippingAddress = `${customer.street || 'Rua das Flores'}, ${customer.number || '100'}${
    customer.complement ? ' - ' + customer.complement : ''
  } - ${customer.neighborhood || 'Centro'}, ${customer.city || 'São Paulo'}/${customer.state || 'SP'} - CEP ${
    customer.cep || '01000-000'
  } (Destinatário: ${customer.name})`;

  // 3. Calcular itens e total do pedido
  const orderItems: {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[] = [];

  let total = 0;
  for (const prod of prodRes.results) {
    const qty = Math.floor(Math.random() * 3) + 1;
    const unitPrice = Number(prod.price) || 29.9;
    total += qty * unitPrice;

    orderItems.push({
      id: `item_${crypto.randomBytes(7).toString('hex')}`,
      order_id: orderId,
      product_id: prod.id,
      product_name: prod.name,
      quantity: qty,
      unit_price: Number(unitPrice.toFixed(2)),
    });
  }

  total = Number(total.toFixed(2));

  // 4. Inserir Pedido e Itens no PostgreSQL
  await db.query(
    `INSERT INTO orders (
      id, user_id, total, status, shipping_address, payment_method, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
    [orderId, customer.id, total, status, shippingAddress, paymentMethod]
  );

  for (const item of orderItems) {
    await db.query(
      `INSERT INTO order_items (
        id, order_id, product_id, quantity, unit_price
      ) VALUES ($1, $2, $3, $4, $5)`,
      [item.id, item.order_id, item.product_id, item.quantity, item.unit_price]
    );
  }

  const [ordersCountRes, itemsCountRes] = await Promise.all([
    db.query('SELECT COUNT(*)::int as total FROM orders'),
    db.query('SELECT COUNT(*)::int as total FROM order_items'),
  ]);

  return {
    success: true,
    message: 'Pedido incremental e itens criados com sucesso no PostgreSQL.',
    created_order: {
      id: orderId,
      user_id: customer.id,
      customer_name: customer.name,
      total,
      status,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      items: orderItems,
      created_at: new Date().toISOString(),
    },
    totalOrdersInDatabase: ordersCountRes.results[0]?.total ?? 0,
    totalOrderItemsInDatabase: itemsCountRes.results[0]?.total ?? 0,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Forneça a chave via ?key=senha123 ou cabeçalho x-cron-key.',
      },
      { status: 401 }
    );
  }

  try {
    const result = await handleOrderGeneration();
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao gerar pedido via cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao inserir pedido no banco PostgreSQL.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Forneça a chave via ?key=senha123 ou cabeçalho x-cron-key.',
      },
      { status: 401 }
    );
  }

  try {
    const result = await handleOrderGeneration();
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao gerar pedido via cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao inserir pedido no banco PostgreSQL.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

