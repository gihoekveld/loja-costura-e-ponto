import { getDb } from './index';
import { Order, OrderItem } from '@/types';
import { generateRandomToken } from '@/lib/auth/crypto';

export async function createOrder(
  userId: string,
  items: { productId: string; quantity: number; unitPrice: number }[],
  total: number,
  shippingAddress: string,
  paymentMethod: string,
  status: 'pending' | 'paid' | 'cancelled' = 'paid'
): Promise<Order> {
  const db = getDb();
  const orderId = `ord_${generateRandomToken(12)}`;

  // 1. Inserir Pedido principal
  await db
    .prepare('INSERT INTO orders (id, user_id, total, status, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(orderId, userId, total, status, shippingAddress, paymentMethod)
    .run();

  // 2. Inserir Itens do Pedido com preço unitário obtido exclusivamente do servidor
  const createdItems: OrderItem[] = [];
  for (const item of items) {
    const itemId = `item_${generateRandomToken(10)}`;
    await db
      .prepare('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)')
      .bind(itemId, orderId, item.productId, item.quantity, item.unitPrice)
      .run();

    createdItems.push({
      id: itemId,
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    });
  }

  return {
    id: orderId,
    user_id: userId,
    total,
    status,
    shipping_address: shippingAddress,
    payment_method: paymentMethod,
    created_at: new Date().toISOString(),
    items: createdItems,
  };
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const db = getDb();
  const { results: orders } = await db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<Order>();

  return orders || [];
}

/**
 * Consulta de Pedido com Proteção IDOR (Broken Access Control).
 * Garante estritamente no SQL que `id = ? AND user_id = ?`.
 */
export async function getOrderByIdForUser(orderId: string, userId: string): Promise<Order | null> {
  const db = getDb();
  const order = await db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .bind(orderId, userId)
    .first<Order>();

  if (!order) {
    return null;
  }

  const { results: items } = await db
    .prepare(
      'SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?'
    )
    .bind(orderId)
    .all<OrderItem>();

  order.items = items || [];
  return order;
}

/**
 * Consulta de todos os pedidos da loja exclusiva para Administradores
 */
export async function getAllOrders(): Promise<Order[]> {
  const db = getDb();
  const { results: orders } = await db
    .prepare('SELECT * FROM orders ORDER BY created_at DESC')
    .all<Order>();

  return orders || [];
}

/**
 * Atualização de status de pedido exclusivo para Administradores
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'paid' | 'cancelled'
): Promise<boolean> {
  const db = getDb();
  const res = await db
    .prepare('UPDATE orders SET status = ? WHERE id = ?')
    .bind(status, orderId)
    .run();

  return res.success;
}
