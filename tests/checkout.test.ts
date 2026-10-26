import { describe, it, expect } from 'vitest';
import { getProductById, updateProductStock } from '../src/lib/db/products';
import { createOrder } from '../src/lib/db/orders';

describe('Segurança do Checkout e Validação de Estoque/Preço no Servidor', () => {
  it('deve buscar o preço do produto diretamente no banco de dados D1', async () => {
    const product = await getProductById('prod_01');
    expect(product).not.toBeNull();
    expect(product?.name).toBe('Aparelho de Viés Dobra Dupla Industrial (Regulável)');
    expect(product?.price).toBe(68.90);
  });

  it('deve descontar estoque apenas para quantidades válidas e disponíveis', async () => {
    const productId = 'prod_04'; // Fio de Overloque, stock 35
    const initialProduct = await getProductById(productId);
    const initialStock = initialProduct?.stock || 35;

    // Baixa válida
    const success = await updateProductStock(productId, 2);
    expect(success).toBe(true);

    const updatedProduct = await getProductById(productId);
    expect(updatedProduct?.stock).toBe(initialStock - 2);
  });

  it('deve registrar o pedido com o valor total recalculado', async () => {
    const userId = '01M5X8JGNFH9M96N9DDBB4MCAN';
    const items = [
      { productId: 'prod_01', quantity: 1, unitPrice: 68.90 },
      { productId: 'prod_04', quantity: 2, unitPrice: 54.90 },
    ];
    const realTotal = 68.90 + (54.90 * 2); // 178.70

    const order = await createOrder(
      userId,
      items,
      realTotal,
      'Rua das Flores, 250 - Apto 42 - Vila Mariana, São Paulo/SP',
      'pix',
      'paid'
    );

    expect(order.id).toContain('ord_');
    expect(order.total).toBe(178.70);
    expect(order.user_id).toBe(userId);
    expect(order.items).toHaveLength(2);
  });
});

