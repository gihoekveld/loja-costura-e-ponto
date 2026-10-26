import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;

// =========================================================================
// 1. CARREGAR VARIÁVEIS DE AMBIENTE
// =========================================================================
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

const DATA_ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY;
const CPF_HASH_PEPPER = process.env.CPF_HASH_PEPPER;

if (!DATA_ENCRYPTION_KEY || !CPF_HASH_PEPPER) {
  console.error('\x1b[31m[ERRO CRÍTICO]\x1b[0m DATA_ENCRYPTION_KEY ou CPF_HASH_PEPPER não foram encontrados no arquivo .env.');
  console.error('Certifique-se de que o arquivo .env está configurado na raiz do projeto.');
  process.exit(1);
}

// =========================================================================
// 2. FUNÇÕES DE CRIPTOGRAFIA (COMPATÍVEIS COM WEB CRYPTO API / LGPD)
// =========================================================================
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `pbkdf2:100000:${salt.toString('hex')}:${hash.toString('hex')}`;
}

function hashCpf(cpf) {
  const clean = cpf.replace(/\D/g, '');
  return crypto.createHash('sha256').update(`${CPF_HASH_PEPPER}:${clean}`).digest('hex');
}

function encryptCpf(cpf) {
  const clean = cpf.replace(/\D/g, '');
  const rawKey = crypto.createHash('sha256').update(DATA_ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(12); // NIST 96-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', rawKey, iv);
  const ct = Buffer.concat([cipher.update(clean, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `aes-gcm:${iv.toString('hex')}:${Buffer.concat([ct, tag]).toString('hex')}`;
}

// =========================================================================
// 3. GERADORES DE ULID E CPF VÁLIDO
// =========================================================================
const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function generateUlid(timestamp = Date.now()) {
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

function generateValidCpf() {
  const digits = [];
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

// =========================================================================
// 4. TABELAS DE DADOS REALISTAS
// =========================================================================
const FIRST_NAMES = [
  'Lucas', 'Gabriel', 'Matheus', 'Felipe', 'Rodrigo', 'Bruno', 'Leonardo', 'Thiago', 'Rafael', 'Guilherme',
  'Beatriz', 'Camila', 'Juliana', 'Larissa', 'Leticia', 'Fernanda', 'Carolina', 'Aline', 'Renata', 'Patricia',
  'Carlos', 'Eduardo', 'Alexandre', 'Gustavo', 'Diego', 'Vinicius', 'Daniel', 'Marcelo', 'Fernando', 'Ricardo',
  'Amanda', 'Bianca', 'Daniela', 'Gabriela', 'Jessica', 'Luana', 'Natalia', 'Priscila', 'Sabrina', 'Vanessa',
  'Andre', 'Caio', 'Danilo', 'Fabio', 'Igor', 'Leandro', 'Marcos', 'Renato', 'Vitor', 'Willian',
  'Ana', 'Bruna', 'Claudia', 'Debora', 'Elena', 'Flavia', 'Helena', 'Isabela', 'Laura', 'Manuela'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas'
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
  { city: 'Florianópolis', state: 'SC', cep: '88010-000', street: 'Rua Felipe Schmidt', neighborhood: 'Centro' }
];

// =========================================================================
// 5. GERAÇÃO DOS 100 REGISTROS + USUÁRIOS CONHECIDOS
// =========================================================================
function buildUsersPayload() {
  const mariana = {
    id: '01M5X8JGNFH9M96N9DDBB4MCAN',
    name: 'Mariana Silva - Ateliê Ponto de Ouro',
    email: 'mariana@ateliecostura.com.br',
    password_hash: hashPassword('Costura2026!'),
    cpf_hash: hashCpf('234.567.890-12'),
    cpf_encrypted: encryptCpf('234.567.890-12'),
    phone: '(11) 98765-4321',
    cep: '04012-000',
    street: 'Rua das Flores',
    number: '250',
    complement: 'Apto 42',
    neighborhood: 'Vila Mariana',
    city: 'São Paulo',
    state: 'SP',
    role: 'customer'
  };

  const admin = {
    id: '01M5X8JGNJ2HSDPP3FQ0XSQYTF',
    name: 'Administrador Costura & Ponto',
    email: 'admin@costuraeponto.com.br',
    password_hash: hashPassword('AdminCostura2026!'),
    cpf_hash: hashCpf('111.222.333-44'),
    cpf_encrypted: encryptCpf('111.222.333-44'),
    phone: '(11) 3222-1000',
    cep: '03104-002',
    street: 'Rua da Mooca',
    number: '1540',
    complement: 'Galpão Ateliê',
    neighborhood: 'Mooca',
    city: 'São Paulo',
    state: 'SP',
    role: 'admin'
  };

  const users = [mariana, admin];
  const usedEmails = new Set([mariana.email, admin.email]);
  const usedCpfs = new Set(['23456789012', '11122233344']);

  for (let i = 1; i <= 100; i++) {
    const ulidId = generateUlid();

    // Senha aleatória e desconhecida (24 bytes criptográficos, descartada pós-hash)
    const secretRandomPassword = crypto.randomBytes(24).toString('base64url');
    const pwdHash = hashPassword(secretRandomPassword);

    let cpf = generateValidCpf();
    while (usedCpfs.has(cpf.replace(/\D/g, ''))) {
      cpf = generateValidCpf();
    }
    usedCpfs.add(cpf.replace(/\D/g, ''));

    const cHash = hashCpf(cpf);
    const cEnc = encryptCpf(cpf);

    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;
    
    let cleanEmailName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    cleanEmailName = cleanEmailName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let email = `${cleanEmailName}.${ulidId.slice(-6).toLowerCase()}@ateliecliente.com.br`;
    while (usedEmails.has(email)) {
      email = `${cleanEmailName}.${generateUlid().slice(-6).toLowerCase()}@ateliecliente.com.br`;
    }
    usedEmails.add(email);

    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const phone = `(${Math.floor(Math.random() * 80 + 11)}) 9${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 8999 + 1000)}`;
    const streetNumber = String(Math.floor(Math.random() * 950 + 10));

    users.push({
      id: ulidId,
      name: fullName,
      email,
      password_hash: pwdHash,
      cpf_hash: cHash,
      cpf_encrypted: cEnc,
      phone,
      cep: loc.cep,
      street: loc.street,
      number: streetNumber,
      complement: Math.random() > 0.5 ? `Sala ${Math.floor(Math.random() * 50 + 1)}` : null,
      neighborhood: loc.neighborhood,
      city: loc.city,
      state: loc.state,
      role: 'customer'
    });
  }

  return users;
}

// =========================================================================
// 6. CONEXÃO COM RETRY E INSERÇÃO EM LOTE NO BANCO DE DADOS
// =========================================================================
async function connectWithRetry(pool, maxAttempts = 5, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = await pool.connect();
      return client;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      console.log(`\x1b[33m[Tentativa ${attempt}/${maxAttempts}]\x1b[0m Aguardando banco de dados responder em ${delayMs / 1000}s...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

async function runDailySeed() {
  const startTime = Date.now();
  console.log('\n=============================================================');
  console.log('🔄 COSTURA & PONTO — CARGA DIÁRIA DE USUÁRIOS NO BANCO');
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
  console.log('=============================================================\n');

  const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'costura_user'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'costura_ponto_db'}`;

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    max: 5
  });

  let client;
  try {
    client = await connectWithRetry(pool, 5, 2000);
    console.log('\x1b[32m✔ Conectado ao PostgreSQL com sucesso!\x1b[0m');

    // Garantir que a tabela users existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        cpf_hash VARCHAR(64) NOT NULL,
        cpf_encrypted TEXT NOT NULL,
        phone VARCHAR(32),
        cep VARCHAR(16) NOT NULL,
        street VARCHAR(255) NOT NULL,
        number VARCHAR(32) NOT NULL,
        complement VARCHAR(255),
        neighborhood VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        state VARCHAR(32) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Gerando dados criptográficos dos 100 usuários com ULID...');
    const users = buildUsersPayload();

    console.log('Iniciando transação em lote no PostgreSQL...');
    await client.query('BEGIN');

    const insertSql = `
      INSERT INTO users (
        id, name, email, password_hash, cpf_hash, cpf_encrypted,
        phone, cep, street, number, complement, neighborhood, city, state, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        cpf_hash = EXCLUDED.cpf_hash,
        cpf_encrypted = EXCLUDED.cpf_encrypted;
    `;

    for (const u of users) {
      await client.query(insertSql, [
        u.id, u.name, u.email, u.password_hash, u.cpf_hash, u.cpf_encrypted,
        u.phone, u.cep, u.street, u.number, u.complement, u.neighborhood, u.city, u.state, u.role
      ]);
    }

    await client.query('COMMIT');
    const elapsed = Date.now() - startTime;

    // Estatísticas finais
    const countRes = await client.query('SELECT COUNT(*) as total FROM users');
    const totalInDb = countRes.rows[0].total;

    console.log('\n\x1b[32m✔ CARGA DIÁRIA CONCLUÍDA COM SUCESSO!\x1b[0m');
    console.log(`• Registros processados: ${users.length} (Mariana + Admin + 100 novos usuários)`);
    console.log(`• Total de usuários ativos no banco: ${totalInDb}`);
    console.log(`• Tempo de execução: ${elapsed}ms\n`);

  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    console.error('\n\x1b[31m✖ FALHA NA EXECUÇÃO DO SEED DIÁRIO:\x1b[0m', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runDailySeed();
