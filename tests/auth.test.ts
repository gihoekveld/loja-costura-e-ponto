import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  timingSafeEqual,
  generateRandomToken,
  normalizeCpf,
  formatCpf,
  hashCpf,
  encryptCpf,
  decryptCpf,
  isValidCpf,
} from '../src/lib/auth/crypto';

describe('Módulo de Criptografia & Autenticação (Web Crypto API)', () => {
  it('deve gerar hash PBKDF2 e verificar senha correta', async () => {
    const password = 'SenhaSegura123!';
    const hash = await hashPassword(password);

    expect(hash).toContain('pbkdf2:100000:');
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('deve rejeitar senha incorreta', async () => {
    const password = 'SenhaSegura123!';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword('SenhaErrada999!', hash);
    expect(isValid).toBe(false);
  });

  it('deve comparar strings em tempo constante (timingSafeEqual)', () => {
    expect(timingSafeEqual('abcdef', 'abcdef')).toBe(true);
    expect(timingSafeEqual('abcdef', 'abcdeg')).toBe(false);
    expect(timingSafeEqual('abcdef', 'abc')).toBe(false);
  });

  it('deve gerar tokens com entropia aleatória de tamanho customizado', () => {
    const token1 = generateRandomToken(32);
    const token2 = generateRandomToken(32);

    expect(token1).toHaveLength(64); // 32 bytes em hex = 64 caracteres
    expect(token1).not.toBe(token2);
  });

  it('deve normalizar e formatar CPF corretamente', () => {
    expect(normalizeCpf('123.456.789-01')).toBe('12345678901');
    expect(formatCpf('12345678901')).toBe('123.456.789-01');
  });

  it('deve gerar hash determinístico de CPF para busca no banco de dados', async () => {
    const cpf1 = '123.456.789-00';
    const cpf2 = '12345678900'; // Sem pontuação

    const hash1 = await hashCpf(cpf1);
    const hash2 = await hashCpf(cpf2);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2); // Determinístico: mesma entrada gera exatamente o mesmo hash para SELECT exato
  });

  it('deve encriptar com AES-256-GCM e decriptografar recuperando o CPF original para Nota Fiscal', async () => {
    const originalCpf = '529.982.247-25';
    const encrypted = await encryptCpf(originalCpf);

    expect(encrypted).toMatch(/^aes-gcm:[a-f0-9]{24}:[a-f0-9]+/);
    expect(encrypted).not.toContain('52998224725'); // O texto claro não pode vazar

    const decrypted = await decryptCpf(encrypted);
    expect(decrypted).toBe('529.982.247-25');
  });

  it('deve gerar hashes estáticos para os usuários seed', async () => {
    const marianaPass = await hashPassword('Costura2026!');
    const marianaCpfHash = await hashCpf('234.567.890-12');
    const marianaCpfEnc = await encryptCpf('234.567.890-12');

    const adminPass = await hashPassword('AdminCostura2026!');
    const adminCpfHash = await hashCpf('111.222.333-44');
    const adminCpfEnc = await encryptCpf('111.222.333-44');

    console.log('SEED_MARIANA_PASS:', marianaPass);
    console.log('SEED_MARIANA_CPF_HASH:', marianaCpfHash);
    console.log('SEED_MARIANA_CPF_ENC:', marianaCpfEnc);
    console.log('SEED_ADMIN_PASS:', adminPass);
    console.log('SEED_ADMIN_CPF_HASH:', adminCpfHash);
    console.log('SEED_ADMIN_CPF_ENC:', adminCpfEnc);

    expect(await verifyPassword('Costura2026!', marianaPass)).toBe(true);
    expect(await verifyPassword('AdminCostura2026!', adminPass)).toBe(true);
    expect(await decryptCpf(marianaCpfEnc)).toBe('234.567.890-12');
    expect(await decryptCpf(adminCpfEnc)).toBe('111.222.333-44');
  });
});


