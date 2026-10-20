/**
 * Módulo de Criptografia de Alta Segurança utilizando Web Crypto API.
 * Totalmente compatível com Cloudflare Workers e ambientes Edge.
 */

// Converter ArrayBuffer para string Hexadecimal
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Converter string Hexadecimal para Uint8Array
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Comparação em Tempo Constante para evitar Ataques de Cronometragem (Timing Attacks)
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Gera um token aleatório seguro de alta entropia.
 */
export function generateRandomToken(bytesLength = 32): string {
  const array = new Uint8Array(bytesLength);
  crypto.getRandomValues(array);
  return bufferToHex(array.buffer);
}

/**
 * Gera hash de senha utilizando PBKDF2 com SHA-256 e 100.000 iterações.
 * Formato retornado: pbkdf2:iterations:saltHex:hashHex
 */
export async function hashPassword(password: string): Promise<string> {
  const iterations = 100000;
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 32 bytes
  );

  const saltHex = bufferToHex(salt.buffer);
  const hashHex = bufferToHex(derivedBits);

  return `pbkdf2:${iterations}:${saltHex}:${hashHex}`;
}

/**
 * Verifica se a senha em texto claro corresponde ao hash armazenado no formato pbkdf2:iterations:saltHex:hashHex.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false;
    }

    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const originalHashHex = parts[3];

    const saltBytes = hexToBuffer(saltHex);
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes.buffer as ArrayBuffer,
        iterations: iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const computedHashHex = bufferToHex(derivedBits);
    return timingSafeEqual(computedHashHex, originalHashHex);
  } catch (error) {
    return false;
  }
}

// =========================================================================
// Gerenciamento Criptográfico de Dados Sensíveis: CPF (LGPD / Segurança)
// =========================================================================

const CPF_HASH_PEPPER = 'costura_ponto_cpf_pepper_2026';
const DEFAULT_ENCRYPTION_SECRET = 'costura-ponto-secure-aes-master-key-2026!';

/**
 * Remove formatação do CPF, mantendo apenas dígitos numéricos.
 */
export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Formata dígitos numéricos no padrão 000.000.000-00.
 */
export function formatCpf(cpf: string): string {
  const clean = normalizeCpf(cpf);
  if (clean.length !== 11) return cpf;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

/**
 * Mascara o CPF para exibição segura ao usuário (ex: 123.***.***-01).
 */
export function maskCpf(cpf: string): string {
  const clean = normalizeCpf(cpf);
  if (clean.length !== 11) return '***.***.***-**';
  return `${clean.slice(0, 3)}.***.***-${clean.slice(9, 11)}`;
}

/**
 * Validação algorítmica de CPF brasileiro (dígitos verificadores).
 */
export function isValidCpf(cpf: string): boolean {
  const clean = normalizeCpf(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // Rejeitar 000.000.000-00, 111.111.111-11, etc.

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

/**
 * 1. HASH DETERMINÍSTICO DE CPF:
 * Utilizado para busca exata e indexação no banco de dados D1 (Painel do Administrador)
 * sem necessidade de decriptografar todos os registros da tabela.
 * 
 * Saída: Hexadecimal SHA-256 (64 caracteres) com Pepper.
 */
export async function hashCpf(cpf: string): Promise<string> {
  const clean = normalizeCpf(cpf);
  const encoder = new TextEncoder();
  const data = encoder.encode(`${CPF_HASH_PEPPER}:${clean}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Deriva uma chave AES-GCM de 256 bits a partir do segredo mestre da aplicação.
 */
async function getAesKey(): Promise<CryptoKey> {
  const secret = (typeof process !== 'undefined' && process.env?.DATA_ENCRYPTION_KEY) || DEFAULT_ENCRYPTION_SECRET;
  const encoder = new TextEncoder();
  const rawKeyMaterial = await crypto.subtle.digest('SHA-256', encoder.encode(secret));

  return crypto.subtle.importKey(
    'raw',
    rawKeyMaterial,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 2. CRIPTOGRAFIA REVERSÍVEL DE CPF (AES-256-GCM):
 * Utilizado para guardar o dado confidencial cifrado e permitir a posterior recuperação
 * (descriptografia) para emissão de Nota Fiscal (NF-e/DANFE) e obrigações fiscais.
 * 
 * Formato retornado: aes-gcm:<iv_hex>:<ciphertext_and_tag_hex>
 */
export async function encryptCpf(cpf: string): Promise<string> {
  const clean = normalizeCpf(cpf);
  const key = await getAesKey();
  const iv = new Uint8Array(12); // Vetor de inicialização padrão NIST de 96 bits para AES-GCM
  crypto.getRandomValues(iv);

  const encoder = new TextEncoder();
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoder.encode(clean)
  );

  const ivHex = bufferToHex(iv.buffer);
  const cipherHex = bufferToHex(encryptedBuffer);

  return `aes-gcm:${ivHex}:${cipherHex}`;
}

/**
 * Descriptografa o CPF cifrado com AES-256-GCM para uso em notas fiscais e relatórios autorizados.
 */
export async function decryptCpf(encryptedData: string): Promise<string> {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3 || parts[0] !== 'aes-gcm') {
      throw new Error('Formato de dados criptografados inválido');
    }

    const ivBytes = hexToBuffer(parts[1]);
    const cipherBytes = hexToBuffer(parts[2]);
    const key = await getAesKey();

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes.buffer as ArrayBuffer,
      },
      key,
      cipherBytes.buffer as ArrayBuffer
    );

    const decoder = new TextDecoder();
    const cleanDigits = decoder.decode(decryptedBuffer);
    return formatCpf(cleanDigits);
  } catch (err) {
    throw new Error('Falha na descriptografia dos dados sensíveis');
  }
}

