import { getDb } from './index';
import { Product } from '@/types';
import { generateRandomToken } from '@/lib/auth/crypto';

export async function getAllProducts(): Promise<Product[]> {
  const db = getDb();
  const { results } = await db.prepare('SELECT * FROM products ORDER BY category, name ASC').all<Product>();
  return results || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getDb();
  const product = await db
    .prepare('SELECT * FROM products WHERE id = ?')
    .bind(id)
    .first<Product>();
  return product;
}

export async function updateProductStock(id: string, quantity: number): Promise<boolean> {
  const db = getDb();
  // Baixa no estoque com validação atômica de estoque mínimo suficiente no banco
  const res = await db
    .prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?')
    .bind(quantity, id, quantity)
    .run();
  return res.success;
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const db = getDb();
  const id = `prod_${generateRandomToken(8)}`;
  await db
    .prepare('INSERT INTO products (id, name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, product.name, product.description, product.price, product.stock, product.category, product.image_url || null)
    .run();

  return {
    id,
    ...product,
  };
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id'>>
): Promise<boolean> {
  const db = getDb();
  const existing = await getProductById(id);
  if (!existing) return false;

  const name = updates.name ?? existing.name;
  const description = updates.description ?? existing.description;
  const price = updates.price !== undefined ? Number(updates.price) : existing.price;
  const stock = updates.stock !== undefined ? Number(updates.stock) : existing.stock;
  const category = updates.category ?? existing.category;
  const imageUrl = updates.image_url ?? existing.image_url;

  const res = await db
    .prepare('UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?')
    .bind(name, description, price, stock, category, imageUrl, id)
    .run();

  return res.success;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = getDb();
  const res = await db
    .prepare('DELETE FROM products WHERE id = ?')
    .bind(id)
    .run();
  return res.success;
}
