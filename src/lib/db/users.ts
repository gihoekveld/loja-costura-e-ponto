import { getDb } from './index';
import { User } from '@/types';
import { generateRandomToken } from '@/lib/auth/crypto';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  cpfHash: string;
  cpfEncrypted: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  role?: 'customer' | 'admin';
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = getDb();
  // Query estritamente parametrizada (Prepared Statement) contra SQL Injection
  const user = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first<User>();
  return user;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = getDb();
  const user = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<User>();
  return user;
}

export async function findUserByCpfHash(cpfHash: string): Promise<User | null> {
  const db = getDb();
  const user = await db
    .prepare('SELECT * FROM users WHERE cpf_hash = ?')
    .bind(cpfHash)
    .first<User>();
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  const db = getDb();
  const res = await db
    .prepare('SELECT id, name, email, cpf_hash, cpf_encrypted, phone, cep, street, number, complement, neighborhood, city, state, role, created_at FROM users ORDER BY created_at DESC')
    .all<User>();
  return res.results || [];
}

export async function createUser(data: CreateUserData): Promise<User> {
  const db = getDb();
  const userId = `usr_${generateRandomToken(12)}`;
  const cleanEmail = data.email.toLowerCase().trim();
  const role = data.role || 'customer';
  const complement = data.complement?.trim() || '';

  await db
    .prepare(
      `INSERT INTO users (
        id, name, email, password_hash, cpf_hash, cpf_encrypted,
        phone, cep, street, number, complement, neighborhood, city, state, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      userId,
      data.name.trim(),
      cleanEmail,
      data.passwordHash,
      data.cpfHash,
      data.cpfEncrypted,
      data.phone.trim(),
      data.cep.trim(),
      data.street.trim(),
      data.number.trim(),
      complement,
      data.neighborhood.trim(),
      data.city.trim(),
      data.state.trim().toUpperCase(),
      role
    )
    .run();

  return {
    id: userId,
    name: data.name.trim(),
    email: cleanEmail,
    cpf_hash: data.cpfHash,
    cpf_encrypted: data.cpfEncrypted,
    phone: data.phone.trim(),
    cep: data.cep.trim(),
    street: data.street.trim(),
    number: data.number.trim(),
    complement: complement,
    neighborhood: data.neighborhood.trim(),
    city: data.city.trim(),
    state: data.state.trim().toUpperCase(),
    role: role,
  };
}

