import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, checkoutSchema } from '../src/lib/validation/schemas';
import { escapeHtml, sanitizeString } from '../src/lib/security/sanitize';

describe('Validação de Schemas Zod & Sanitização XSS', () => {
  it('deve validar dados corretos de cadastro', () => {
    const validData = {
      name: 'Mariana Silva Ateliê',
      email: 'mariana@ateliecostura.com.br',
      password: 'SenhaSegura123',
      cpf: '234.567.890-12',
      phone: '(11) 98765-4321',
      cep: '04012-000',
      street: 'Rua das Flores',
      number: '250',
      complement: 'Apto 42',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      state: 'SP',
    };
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar e-mails inválidos ou senhas fracas no cadastro', () => {
    const invalidEmail = {
      name: 'Mariana',
      email: 'email-invalido',
      password: 'Senha123',
      cpf: '12345678901',
      phone: '11999999999',
      cep: '01000-000',
      street: 'Rua A',
      number: '10',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
    };
    expect(registerSchema.safeParse(invalidEmail).success).toBe(false);

    const weakPass = {
      name: 'Mariana',
      email: 'mariana@teste.com',
      password: '123',
      cpf: '12345678901',
      phone: '11999999999',
      cep: '01000-000',
      street: 'Rua A',
      number: '10',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
    };
    expect(registerSchema.safeParse(weakPass).success).toBe(false);
  });


  it('deve higienizar caracteres de injeção XSS', () => {
    const unsafeHtml = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(unsafeHtml);
    expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('deve validar dados de checkout com cartão de crédito de teste de 16 dígitos', () => {
    const validCheckout = {
      items: [{ productId: 'prod_01', quantity: 2 }],
      name: 'Mariana Silva',
      cpf: '234.567.890-12',
      address: 'Rua das Flores',
      number: '250',
      city: 'São Paulo',
      state: 'SP',
      cep: '04012-000',
      paymentMethod: 'credit_card_approved',
      cardNumber: '4000 0000 0000 0010',
      cardHolder: 'MARIANA SILVA',
      cardExp: '12/28',
      cardCvv: '123',
      installments: 3,
    };
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });
});
