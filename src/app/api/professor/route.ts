import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest, bodyPassword?: string): boolean {
  const expectedPassword = process.env.PROFESSOR_PASSWORD || 'senha123';

  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('senha') || url.searchParams.get('password');
  if (fromQuery && fromQuery.trim() === expectedPassword.trim()) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (token === expectedPassword.trim()) return true;
  }

  const customHeader = request.headers.get('x-professor-password');
  if (customHeader && customHeader.trim() === expectedPassword.trim()) {
    return true;
  }

  if (bodyPassword && bodyPassword.trim() === expectedPassword.trim()) {
    return true;
  }

  return false;
}

async function fetchDatabaseData() {
  const db = getDb();

  const [productsRes, usersRes, ordersRes, orderItemsRes, sessionsRes] = await Promise.all([
    db.query(`
      SELECT id, name, description, price, stock, category, image_url, created_at 
      FROM products 
      ORDER BY created_at DESC
    `),
    db.query(`
      SELECT id, name, email, role, phone, cep, street, number, complement, neighborhood, city, state, cpf_hash, cpf_encrypted, created_at 
      FROM users 
      ORDER BY created_at DESC
    `),
    db.query(`
      SELECT id, user_id, total, status, shipping_address, payment_method, created_at 
      FROM orders 
      ORDER BY created_at DESC
    `),
    db.query(`
      SELECT oi.id, oi.order_id, oi.product_id, p.name AS product_name, oi.quantity, oi.unit_price 
      FROM order_items oi 
      LEFT JOIN products p ON p.id = oi.product_id 
      ORDER BY oi.id ASC
    `),
    db.query(`
      SELECT id, user_id, expires_at, created_at 
      FROM sessions 
      ORDER BY created_at DESC
    `),
  ]);

  return {
    database: 'costura_ponto_db',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || '5432',
    timestamp: new Date().toISOString(),
    stats: {
      totalProducts: productsRes.rowCount,
      totalUsers: usersRes.rowCount,
      totalOrders: ordersRes.rowCount,
      totalOrderItems: orderItemsRes.rowCount,
      totalSessions: sessionsRes.rowCount,
    },
    tables: {
      products: productsRes.results,
      users: usersRes.results,
      orders: ordersRes.results,
      order_items: orderItemsRes.results,
      sessions: sessionsRes.results,
    },
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Forneça a senha correta via ?senha=... ou cabeçalho x-professor-password.',
      },
      { status: 401 }
    );
  }

  try {
    const data = await fetchDatabaseData();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('Erro ao buscar dados para o professor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao consultar banco de dados PostgreSQL.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let bodyPassword = '';
  try {
    const body = await request.json();
    bodyPassword = body?.password || body?.senha || '';
  } catch {
    // Body vazio ou não-JSON
  }

  if (!isAuthorized(request, bodyPassword)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Senha incorreta.',
      },
      { status: 401 }
    );
  }

  try {
    const data = await fetchDatabaseData();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('Erro ao buscar dados para o professor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao consultar banco de dados PostgreSQL.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
