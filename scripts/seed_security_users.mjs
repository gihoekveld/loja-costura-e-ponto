import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;

// 1. Carregar variáveis de ambiente do .env ou .env.local
function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
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
  console.error('ERRO: DATA_ENCRYPTION_KEY ou CPF_HASH_PEPPER não foram encontrados no ambiente (.env).');
  process.exit(1);
}

// 2. Funções de Criptografia (100% compatíveis com Web Crypto da aplicação)
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
  const ciphertext = Buffer.concat([cipher.update(clean, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `aes-gcm:${iv.toString('hex')}:${Buffer.concat([ciphertext, tag]).toString('hex')}`;
}

// 3. Gerador de ULID (Crockford Base32 - 26 caracteres)
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

// 4. Gerador de CPF Brasileiro Válido
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

// 5. Tabelas auxiliares para dados realistas
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

async function generateUsers() {
  console.log('--- Iniciando Geração de Usuários ---');
  console.log('DATA_ENCRYPTION_KEY utilizada:', DATA_ENCRYPTION_KEY.slice(0, 8) + '...');
  console.log('CPF_HASH_PEPPER utilizado:', CPF_HASH_PEPPER.slice(0, 8) + '...\n');


  // Gerar 100 usuários com senhas desconhecidas e ID ULID
  const users = [];
  const usedEmails = new Set([]);
  const usedCpfs = new Set([]);

  for (let i = 1; i <= 100; i++) {
    const ulidId = generateUlid();

    // Senha aleatória desconhecida de 32 caracteres (descartada após hash PBKDF2)
    const secretRandomPassword = crypto.randomBytes(24).toString('base64url');
    const pwdHash = hashPassword(secretRandomPassword);

    // Gerar CPF válido único
    let cpf = generateValidCpf();
    while (usedCpfs.has(cpf.replace(/\D/g, ''))) {
      cpf = generateValidCpf();
    }
    usedCpfs.add(cpf.replace(/\D/g, ''));

    const cHash = hashCpf(cpf);
    const cEnc = encryptCpf(cpf);

    // Nome e e-mail único
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

  console.log(`Gerados com sucesso:`);
  console.log(`- 2 usuários conhecidos: ${mariana.id} (Mariana) e ${admin.id} (Admin)`);
  console.log(`- 100 usuários com ID ULID e senhas aleatórias desconhecidas (total ${users.length} usuários)\n`);

  // 6. Atualizar database/migrations/02_seed.sql com os novos hashes dos conhecidos
  const seedSqlPath = path.resolve('database/migrations/02_seed.sql');
  if (fs.existsSync(seedSqlPath)) {
    let seedContent = fs.readFileSync(seedSqlPath, 'utf8');

    // Substituir bloco da Mariana
    seedContent = seedContent.replace(
      /'(usr_mariana_001|[0-9A-Z]{26})',\s*'Mariana Silva[^']+',\s*'mariana@ateliecostura\.com\.br',\s*'pbkdf2:[^']+',\s*'[^']+',\s*'aes-gcm:[^']+',/,
      `'${mariana.id}',\n    'Mariana Silva - Ateliê Ponto de Ouro',\n    'mariana@ateliecostura.com.br',\n    '${mariana.password_hash}',\n    '${mariana.cpf_hash}',\n    '${mariana.cpf_encrypted}',`
    );

    // Substituir bloco do Admin
    seedContent = seedContent.replace(
      /'(usr_admin_001|[0-9A-Z]{26})',\s*'Administrador Costura[^']+',\s*'admin@costuraeponto\.com\.br',\s*'pbkdf2:[^']+',\s*'[^']+',\s*'aes-gcm:[^']+',/,
      `'${admin.id}',\n    'Administrador Costura & Ponto',\n    'admin@costuraeponto.com.br',\n    '${admin.password_hash}',\n    '${admin.cpf_hash}',\n    '${admin.cpf_encrypted}',`
    );

    // Substituir o pedido da Mariana para apontar para o novo ULID
    seedContent = seedContent.replace(
      /\('ord_mariana_01',\s*'[^']+'/,
      `('ord_mariana_01', '${mariana.id}'`
    );

    fs.writeFileSync(seedSqlPath, seedContent, 'utf8');
    console.log(`[OK] IDs ULID e Hashes dos usuários conhecidos atualizados em database/migrations/02_seed.sql`);
  }

  // 7. Escrever arquivo de migração SQL: database/migrations/03_seed_users.sql
  const migration03Path = path.resolve('database/migrations/03_seed_users.sql');
  const valuesStatements = users.map(u => {
    const esc = (val) => val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
    return `(${esc(u.id)}, ${esc(u.name)}, ${esc(u.email)}, ${esc(u.password_hash)}, ${esc(u.cpf_hash)}, ${esc(u.cpf_encrypted)}, ${esc(u.phone)}, ${esc(u.cep)}, ${esc(u.street)}, ${esc(u.number)}, ${esc(u.complement)}, ${esc(u.neighborhood)}, ${esc(u.city)}, ${esc(u.state)}, ${esc(u.role)})`;
  }).join(',\n');

  const migrationSql = `-- Migration 0003: Carga de 100 Usuários com ULID e Hashes Criptográficos
INSERT INTO users (
    id, name, email, password_hash, cpf_hash, cpf_encrypted,
    phone, cep, street, number, complement, neighborhood, city, state, role
) VALUES 
${valuesStatements}
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    cpf_hash = EXCLUDED.cpf_hash,
    cpf_encrypted = EXCLUDED.cpf_encrypted;
`;

  fs.writeFileSync(migration03Path, migrationSql, 'utf8');
  console.log(`[OK] Arquivo de migração gerado: database/migrations/03_seed_users.sql`);

  // 8. Inserir diretamente no PostgreSQL se o banco estiver acessível
  const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'costura_user'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'costura_ponto_db'}`;

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 3000
  });

  try {
    const client = await pool.connect();
    console.log('\nConectado ao PostgreSQL com sucesso! Inserindo registros no banco...');

    let inserted = 0;
    for (const u of users) {
      await client.query(
        `INSERT INTO users (
          id, name, email, password_hash, cpf_hash, cpf_encrypted,
          phone, cep, street, number, complement, neighborhood, city, state, role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          cpf_hash = EXCLUDED.cpf_hash,
          cpf_encrypted = EXCLUDED.cpf_encrypted;`,
        [u.id, u.name, u.email, u.password_hash, u.cpf_hash, u.cpf_encrypted, u.phone, u.cep, u.street, u.number, u.complement, u.neighborhood, u.city, u.state, u.role]
      );
      inserted++;
    }

    client.release();
    await pool.end();
    console.log(`[SUCESSO] ${inserted} usuários sincronizados diretamente no PostgreSQL!`);
  } catch (err) {
    await pool.end();
    console.log('\n[AVISO] Não foi possível conectar ao PostgreSQL neste momento (' + err.message + ').');
    console.log('O arquivo SQL database/migrations/03_seed_users.sql foi criado e será aplicado automaticamente quando o container PostgreSQL subir via Docker Compose.');
  }

  console.log('\n--- Processo Concluído com Sucesso ---');
}

generateUsers().catch(err => {
  console.error('Falha na execução do seed:', err);
  process.exit(1);
});
