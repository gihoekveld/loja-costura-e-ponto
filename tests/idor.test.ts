import { describe, it, expect } from 'vitest';
import { getOrderByIdForUser } from '../src/lib/db/orders';

describe('Proteção Contra IDOR (Insecure Direct Object Reference)', () => {
  it('deve retornar o pedido quando a consulta pertence ao usuário autenticado', async () => {
    const orderId = 'ord_mariana_01';
    const userId = '01M5X8JGNFH9M96N9DDBB4MCAN'; // Dono legítimo do pedido

    const order = await getOrderByIdForUser(orderId, userId);
    expect(order).not.toBeNull();
    expect(order?.id).toBe(orderId);
    expect(order?.user_id).toBe(userId);
  });

  it('deve BLOQUEAR e retornar null se um usuário tentar acessar o pedido de outro usuário (IDOR Attempt)', async () => {
    const orderId = 'ord_mariana_01'; // Pedido de Mariana
    const attackerUserId = '01M5X8JGNJ2HSDPP3FQ0XSQYTF'; // Usuário diferente tentando acessar diretamente pela URL

    const order = await getOrderByIdForUser(orderId, attackerUserId);
    expect(order).toBeNull(); // Bloqueado no servidor!
  });
});

