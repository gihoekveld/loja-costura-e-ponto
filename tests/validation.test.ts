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
});
