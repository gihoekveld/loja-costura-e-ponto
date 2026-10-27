import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

async function checkAccess(request: NextRequest): Promise<boolean> {
  // 1. Verifica se está logado como admin
  try {
    const user = await getSessionUser();
    if (user && user.role === 'admin') {
      return true;
    }
  } catch {
    // Continua para verificar senha
  }

  // 2. Verifica senha de acesso configurada
  const expectedPassword = (process.env.PROFESSOR_PASSWORD || 'senha123').trim();
  const url = new URL(request.url);
  const fromQuery = (url.searchParams.get('senha') || url.searchParams.get('password') || '').trim();
  if (fromQuery && fromQuery === expectedPassword) {
    return true;
  }

  const authHeader = (request.headers.get('authorization') || '').trim();
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
    if (token === expectedPassword) return true;
  }

  const customHeader = (request.headers.get('x-professor-password') || '').trim();
  if (customHeader && customHeader === expectedPassword) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  const authorized = await checkAccess(request);
  if (!authorized) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Faça login como admin ou forneça a senha (?senha=senha123).',
      },
      { status: 401 }
    );
  }

  try {
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

    return NextResponse.json({
      success: true,
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
    });
  } catch (error: any) {
    console.error('Erro na API admin/database:', error);
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
