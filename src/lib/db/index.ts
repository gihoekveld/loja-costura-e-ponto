import { Pool, PoolConfig } from 'pg';

export interface DatabasePreparedStatement {
  bind(...args: any[]): DatabasePreparedStatement;
  all<T = any>(): Promise<{ results: T[]; success: boolean }>;
  first<T = any>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
}

export interface DatabaseBinding {
  prepare(query: string): DatabasePreparedStatement;
  query<T = any>(sql: string, params?: any[]): Promise<{ results: T[]; rowCount: number }>;
}

/**
 * Converte placeholders do SQLite (`?`) para o padrão posicional do PostgreSQL (`$1`, `$2`, ...)
 */
function convertPlaceholders(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

/**
 * Normaliza tipos retornados pelo Postgres (ex: colunas NUMERIC que o node-pg retorna como string)
 */
function normalizeRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const normalized: any = { ...row };
  for (const key of Object.keys(normalized)) {
    if (key === 'price' || key === 'total' || key === 'unit_price') {
      if (normalized[key] !== null && normalized[key] !== undefined) {
        normalized[key] = Number(normalized[key]);
      }
    }
  }
  return normalized;
}

class PostgresPreparedStatement implements DatabasePreparedStatement {
  private pool: Pool;
  private query: string;
  private boundArgs: any[];

  constructor(pool: Pool, query: string, boundArgs: any[] = []) {
    this.pool = pool;
    this.query = query;
    this.boundArgs = boundArgs;
  }

  bind(...args: any[]): DatabasePreparedStatement {
    return new PostgresPreparedStatement(this.pool, this.query, args);
  }

  private sanitizeArgs(): any[] {
    return this.boundArgs.map((arg) => {
      if (arg === undefined) return null;
      return arg;
    });
  }

  async all<T = any>(): Promise<{ results: T[]; success: boolean }> {
    try {
      const pgSql = convertPlaceholders(this.query);
      const res = await this.pool.query(pgSql, this.sanitizeArgs());
      const results = (res.rows || []).map(normalizeRow) as T[];
      return { results, success: true };
    } catch (err) {
      console.error('Erro na consulta PostgreSQL (all):', this.query, err);
      return { results: [], success: false };
    }
  }

  async first<T = any>(colName?: string): Promise<T | null> {
    try {
      const pgSql = convertPlaceholders(this.query);
      const res = await this.pool.query(pgSql, this.sanitizeArgs());
      if (!res.rows || res.rows.length === 0) return null;
      const row = normalizeRow(res.rows[0]);
      if (colName) return (row as any)[colName] ?? null;
      return row as T;
    } catch (err) {
      console.error('Erro na consulta PostgreSQL (first):', this.query, err);
      return null;
    }
  }

  async run(): Promise<{ success: boolean }> {
    try {
      const pgSql = convertPlaceholders(this.query);
      await this.pool.query(pgSql, this.sanitizeArgs());
      return { success: true };
    } catch (err) {
      console.error('Erro na consulta PostgreSQL (run):', this.query, err);
      return { success: false };
    }
  }
}

class PostgresDatabase implements DatabaseBinding {
  private pool: Pool;

  constructor(config?: PoolConfig) {
    const connectionString =
      process.env.DATABASE_URL ||
      `postgresql://${process.env.PGUSER || 'costura_user'}:${process.env.PGPASSWORD || 'costura_secret_2026'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'costura_ponto_db'}`;

    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ...config,
    });

    this.pool.on('error', (err) => {
      console.error('Erro inesperado no Pool do PostgreSQL:', err);
    });
  }

  prepare(query: string): DatabasePreparedStatement {
    return new PostgresPreparedStatement(this.pool, query);
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<{ results: T[]; rowCount: number }> {
    const res = await this.pool.query(sql, params);
    return {
      results: (res.rows || []).map(normalizeRow) as T[],
      rowCount: res.rowCount ?? 0,
    };
  }

  getPool(): Pool {
    return this.pool;
  }
}

// Aliases para manter compatibilidade com códigos anteriores
export type D1PreparedStatement = DatabasePreparedStatement;
export type D1DatabaseBinding = DatabaseBinding;

const globalForPg = globalThis as unknown as { __pgDatabaseInstance?: PostgresDatabase };

export function getDb(): DatabaseBinding {
  if (!globalForPg.__pgDatabaseInstance) {
    globalForPg.__pgDatabaseInstance = new PostgresDatabase();
  }
  return globalForPg.__pgDatabaseInstance;
}
