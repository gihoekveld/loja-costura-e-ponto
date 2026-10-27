import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { hashPassword, hashCpf, encryptCpf } from '@/lib/auth/crypto';

export const dynamic = 'force-dynamic';

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function generateUlid(timestamp = Date.now()): string {
  let timeStr = '';
  let time = timestamp;
  for (let i = 9; i >= 0; i--) {
    timeStr = CROCKFORD_BASE32[time % 32] + timeStr;
    time = Math.floor(time / 32);
  }

  const bytes = crypto.randomBytes(10);
  let randStr = '';
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < bytes.length; i++) {
    buffer = (buffer << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      randStr += CROCKFORD_BASE32[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  return timeStr + randStr;
}

function generateValidCpf(): string {
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  let sum1 = 0;
  for (let i = 0; i < 9; i++) sum1 += digits[i] * (10 - i);
  let rev1 = 11 - (sum1 % 11);
  if (rev1 >= 10) rev1 = 0;
  digits.push(rev1);

  let sum2 = 0;
  for (let i = 0; i < 10; i++) sum2 += digits[i] * (11 - i);
  let rev2 = 11 - (sum2 % 11);
  if (rev2 >= 10) rev2 = 0;
  digits.push(rev2);

  const clean = digits.join('');
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

const FIRST_NAMES = [
  'Lucas', 'Gabriel', 'Matheus', 'Felipe', 'Rodrigo', 'Bruno', 'Leonardo', 'Thiago', 'Rafael', 'Guilherme',
  'Beatriz', 'Camila', 'Juliana', 'Larissa', 'Leticia', 'Fernanda', 'Carolina', 'Aline', 'Renata', 'Patricia',
  'Carlos', 'Eduardo', 'Alexandre', 'Gustavo', 'Diego', 'Vinicius', 'Daniel', 'Marcelo', 'Fernando', 'Ricardo',
  'Amanda', 'Bianca', 'Daniela', 'Gabriela', 'Jessica', 'Luana', 'Natalia', 'Priscila', 'Sabrina', 'Vanessa',
  'Andre', 'Caio', 'Danilo', 'Fabio', 'Igor', 'Leandro', 'Marcos', 'Renato', 'Vitor', 'Willian',
  'Ana', 'Bruna', 'Claudia', 'Debora', 'Elena', 'Flavia', 'Helena', 'Isabela', 'Laura', 'Manuela',
  'Mariana', 'Clara', 'Sofia', 'Alice', 'Arthur', 'Bernardo', 'Heitor', 'Davi', 'Lorenzo', 'Theo'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas',
  'Cardoso', 'Ramos', 'Teixeira', 'Santana', 'Moura', 'Cavalcanti', 'Monteiro', 'Dantas', 'Barros'
];

const LOCATIONS = [
  { city: 'São Paulo', state: 'SP', cep: '01310-100', street: 'Avenida Paulista', neighborhood: 'Bela Vista' },
  { city: 'Campinas', state: 'SP', cep: '13010-000', street: 'Rua Barão de Jaguara', neighborhood: 'Centro' },
  { city: 'Santos', state: 'SP', cep: '11010-010', street: 'Avenida Ana Costa', neighborhood: 'Gonzaga' },
  { city: 'Ribeirão Preto', state: 'SP', cep: '14010-000', street: 'Rua Álvares Cabral', neighborhood: 'Centro' },
  { city: 'Rio de Janeiro', state: 'RJ', cep: '20040-002', street: 'Avenida Rio Branco', neighborhood: 'Centro' },
  { city: 'Niterói', state: 'RJ', cep: '24020-005', street: 'Rua Gavião Peixoto', neighborhood: 'Icaraí' },
  { city: 'Belo Horizonte', state: 'MG', cep: '30130-100', street: 'Avenida Afonso Pena', neighborhood: 'Funcionários' },
  { city: 'Curitiba', state: 'PR', cep: '80020-010', street: 'Rua das Flores', neighborhood: 'Centro' },
  { city: 'Porto Alegre', state: 'RS', cep: '90010-150', street: 'Rua dos Andradas', neighborhood: 'Centro Histórico' },
  { city: 'Florianópolis', state: 'SC', cep: '88010-000', street: 'Rua Felipe Schmidt', neighborhood: 'Centro' },
  { city: 'São Bernardo do Campo', state: 'SP', cep: '09710-000', street: 'Rua Marechal Deodoro', neighborhood: 'Centro' },
  { city: 'Santo André', state: 'SP', cep: '09015-000', street: 'Rua Coronel Oliveira Lima', neighborhood: 'Centro' },
  { city: 'Osasco', state: 'SP', cep: '06010-000', street: 'Rua Antônio Agú', neighborhood: 'Centro' }
];

function isAuthorized(request: NextRequest): boolean {
  const expectedKey = (process.env.CRON_SECRET || process.env.PROFESSOR_PASSWORD || 'senha123').trim();

  const url = new URL(request.url);
  const fromQuery = (url.searchParams.get('key') || url.searchParams.get('senha') || url.searchParams.get('token') || '').trim();
  if (fromQuery && fromQuery === expectedKey) {
    return true;
  }

  const headerKey = (request.headers.get('x-cron-key') || request.headers.get('x-professor-password') || '').trim();
  if (headerKey && headerKey === expectedKey) {
    return true;
  }

  const authHeader = (request.headers.get('authorization') || '').trim();
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
    if (token === expectedKey) return true;
  }

  // Permite chamadas locais diretas se nenhuma chave for exigida estritamente
  const host = request.headers.get('host') || '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    // Permite chamadas locais de curl na própria máquina sem bloquear
    return true;
  }

  return false;
}

async function handleUserGeneration() {
  const db = getDb();

  // 1. Gerar atributos únicos
  const ulidId = generateUlid();
  const rawPassword = crypto.randomBytes(16).toString('base64url');
  const passwordHash = await hashPassword(rawPassword);

  let cpf = generateValidCpf();
  let cpfHash = await hashCpf(cpf);

  // Garantir que não haja colisão de CPF no banco
  let existing = await db.query('SELECT id FROM users WHERE cpf_hash = $1 LIMIT 1', [cpfHash]);
  while (existing.rowCount > 0) {
    cpf = generateValidCpf();
    cpfHash = await hashCpf(cpf);
    existing = await db.query('SELECT id FROM users WHERE cpf_hash = $1 LIMIT 1', [cpfHash]);
  }

  const cpfEncrypted = await encryptCpf(cpf);

  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const fullName = `${firstName} ${lastName}`;

  let cleanEmailName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const email = `${cleanEmailName}.${ulidId.slice(-6).toLowerCase()}@ateliecliente.com.br`;

  const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const phone = `(${Math.floor(Math.random() * 80 + 11)}) 9${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 8999 + 1000)}`;
  const streetNumber = String(Math.floor(Math.random() * 950 + 10));
  const complement = Math.random() > 0.5 ? `Apto ${Math.floor(Math.random() * 120 + 10)}` : null;

  // 2. Inserir no PostgreSQL
  await db.query(
    `INSERT INTO users (
      id, name, email, password_hash, cpf_hash, cpf_encrypted,
      phone, cep, street, number, complement, neighborhood, city, state, role, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)`,
    [
      ulidId,
      fullName,
      email,
      passwordHash,
      cpfHash,
      cpfEncrypted,
      phone,
      loc.cep,
      loc.street,
      streetNumber,
      complement,
      loc.neighborhood,
      loc.city,
      loc.state,
      'customer'
    ]
  );

  // 3. Obter contagem atualizada de usuários
  const countRes = await db.query('SELECT COUNT(*)::int as total FROM users');
  const totalUsers = countRes.results[0]?.total ?? 0;

  return {
    success: true,
    message: 'Usuário incremental criado com sucesso no PostgreSQL.',
    created_user: {
      id: ulidId,
      name: fullName,
      email,
      cpf_hash: cpfHash,
      cpf_encrypted: cpfEncrypted,
      city: loc.city,
      state: loc.state,
      phone,
      role: 'customer',
      created_at: new Date().toISOString()
    },
    totalUsersInDatabase: totalUsers,
    timestamp: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Forneça a chave via ?key=senha123 ou cabeçalho x-cron-key.'
      },
      { status: 401 }
    );
  }

  try {
    const result = await handleUserGeneration();
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao gerar usuário via cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao inserir usuário no banco PostgreSQL.',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Forneça a chave via ?key=senha123 ou cabeçalho x-cron-key.'
      },
      { status: 401 }
    );
  }

  try {
    const result = await handleUserGeneration();
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao gerar usuário via cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao inserir usuário no banco PostgreSQL.',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
