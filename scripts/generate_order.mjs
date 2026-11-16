import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;

function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let value = trimmed.slice(eqIdx + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

loadEnv();

const PAYMENT_METHODS = ['pix', 'pix', 'cartao_credito', 'cartao_credito', 'boleto'];
const STATUS_WEIGHTS = ['paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'pending', 'pending', 'cancelled'];

async function run() {
  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'costura_user'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'costura_ponto_db'}`;

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();

  try {
    let userRes = await client.query(
      `SELECT id, name, street, number, complement, neighborhood, city, state, cep
       FROM users WHERE role = 'customer' ORDER BY RANDOM() LIMIT 1`
    );
    if (userRes.rowCount === 0) {
      userRes = await client.query(
        `SELECT id, name, street, number, complement, neighborhood, city, state, cep
         FROM users ORDER BY RANDOM() LIMIT 1`
      );
    }
    const customer = userRes.rows[0];
    if (!customer) throw new Error('Nenhum usuário encontrado no banco.');

    const itemCount = Math.floor(Math.random() * 3) + 1;
    const prodRes = await client.query(
      `SELECT id, name, price FROM products ORDER BY RANDOM() LIMIT $1`,
      [itemCount]
    );
    if (prodRes.rowCount === 0) throw new Error('Nenhum produto encontrado no banco.');

    const orderId = `ord_${crypto.randomBytes(8).toString('hex')}`;
    const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
    const status = STATUS_WEIGHTS[Math.floor(Math.random() * STATUS_WEIGHTS.length)];

    const shippingAddress = `${customer.street || 'Rua das Flores'}, ${customer.number || '100'}${
      customer.complement ? ' - ' + customer.complement : ''
    } - ${customer.neighborhood || 'Centro'}, ${customer.city || 'São Paulo'}/${customer.state || 'SP'} - CEP ${
      customer.cep || '01000-000'
    } (Destinatário: ${customer.name})`;

    let total = 0;
    const items = [];
    for (const prod of prodRes.rows) {
      const qty = Math.floor(Math.random() * 3) + 1;
      const unitPrice = Number(prod.price) || 29.9;
      total += qty * unitPrice;
      items.push({
        id: `item_${crypto.randomBytes(7).toString('hex')}`,
        order_id: orderId,
        product_id: prod.id,
        product_name: prod.name,
        quantity: qty,
        unit_price: Number(unitPrice.toFixed(2)),
      });
    }
    total = Number(total.toFixed(2));

    await client.query('BEGIN');
    await client.query(
      `INSERT INTO orders (id, user_id, total, status, shipping_address, payment_method, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [orderId, customer.id, total, status, shippingAddress, paymentMethod]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [item.id, item.order_id, item.product_id, item.quantity, item.unit_price]
      );
    }
    await client.query('COMMIT');

    const countRes = await client.query('SELECT COUNT(*)::int as total FROM orders');
    console.log(
      JSON.stringify({
        success: true,
        created_order: { id: orderId, customer: customer.name, total, status, paymentMethod, itemsCount: items.length },
        totalOrdersInDatabase: countRes.rows[0].total,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Erro ao gerar pedido:', err.message);
  process.exit(1);
});

