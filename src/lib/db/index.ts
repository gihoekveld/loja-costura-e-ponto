export interface D1PreparedStatement {
  bind(...args: any[]): D1PreparedStatement;
  all<T = any>(): Promise<{ results: T[]; success: boolean }>;
  first<T = any>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
}

export interface D1DatabaseBinding {
  prepare(query: string): D1PreparedStatement;
}

/**
 * Wrapper de Prepared Statement compatível com a API Cloudflare D1
 * executando sobre o SQLite nativo local do Wrangler (.wrangler/state/v3/d1).
 */
class LocalD1PreparedStatement implements D1PreparedStatement {
  private db: any;
  private query: string;
  private boundArgs: any[];

  constructor(db: any, query: string, boundArgs: any[] = []) {
    this.db = db;
    this.query = query;
    this.boundArgs = boundArgs;
  }

  bind(...args: any[]): D1PreparedStatement {
    return new LocalD1PreparedStatement(this.db, this.query, args);
  }

  private sanitizeArgs(): any[] {
    return this.boundArgs.map((arg) => {
      if (arg === undefined) return null;
      if (typeof arg === 'boolean') return arg ? 1 : 0;
      return arg;
    });
  }

  async all<T = any>(): Promise<{ results: T[]; success: boolean }> {
    try {
      const stmt = this.db.prepare(this.query);
      const rows = stmt.all(...this.sanitizeArgs());
      return { results: rows as T[], success: true };
    } catch (err) {
      console.error('Erro na query D1 (all):', this.query, err);
      return { results: [], success: false };
    }
  }

  async first<T = any>(colName?: string): Promise<T | null> {
    try {
      const stmt = this.db.prepare(this.query);
      const row = stmt.get(...this.sanitizeArgs());
      if (!row) return null;
      if (colName) return (row as any)[colName] ?? null;
      return row as T;
    } catch (err) {
      console.error('Erro na query D1 (first):', this.query, err);
      return null;
    }
  }

  async run(): Promise<{ success: boolean }> {
    try {
      const stmt = this.db.prepare(this.query);
      stmt.run(...this.sanitizeArgs());
      return { success: true };
    } catch (err) {
      console.error('Erro na query D1 (run):', this.query, err);
      return { success: false };
    }
  }
}

/**
 * Conexão direta com o Banco de Dados Cloudflare D1 em ambiente local.
 * Localização oficial do Wrangler: .wrangler/state/v3/d1/miniflare-D1DatabaseObject/
 */
class LocalD1Database implements D1DatabaseBinding {
  private db: any = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      const nodeRequire = (globalThis as any).__non_webpack_require__ || eval('require');
      const { DatabaseSync } = nodeRequire('node:sqlite');
      const fsMod = nodeRequire('fs');
      const pathMod = nodeRequire('path');

      const d1Dir = pathMod.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
      if (!fsMod.existsSync(d1Dir)) {
        fsMod.mkdirSync(d1Dir, { recursive: true });
      }

      // Procurar pelo arquivo .sqlite do banco sec-store-db do Wrangler D1
      const files = fsMod.readdirSync(d1Dir).filter((f: string) => f.endsWith('.sqlite'));
      let dbPath: string;

      if (files.length > 0) {
        // Seleciona o banco D1 local mais recente do Wrangler
        const latest = files
          .map((f: string) => ({ f, mtime: fsMod.statSync(pathMod.join(d1Dir, f)).mtimeMs }))
          .sort((a: any, b: any) => b.mtime - a.mtime)[0].f;
        dbPath = pathMod.join(d1Dir, latest);
      } else {
        // Arquivo padrão do banco sec-store-db
        dbPath = pathMod.join(d1Dir, 'f83cf21531c8c5332438dc9a727071127fab133398f8b0061a6c798a222e794b.sqlite');
      }

      this.db = new DatabaseSync(dbPath);

      // Se as tabelas do D1 ainda não existirem, aplica automaticamente os scripts de migrations
      const checkStmt = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      const usersTable = checkStmt.get();
      if (!usersTable) {
        this.applyMigrations(pathMod, fsMod);
      }
    } catch (err) {
      console.error('Falha ao inicializar banco D1 SQLite local:', err);
    }
  }

  private applyMigrations(pathMod: any, fsMod: any) {
    const migrationsDir = pathMod.join(process.cwd(), 'database', 'migrations');
    if (!fsMod.existsSync(migrationsDir)) return;

    const files = fsMod.readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      try {
        const sqlPath = pathMod.join(migrationsDir, file);
        const sqlContent = fsMod.readFileSync(sqlPath, 'utf8');
        this.db.exec(sqlContent);
      } catch (err) {
        console.warn(`Aviso ao aplicar migração ${file}:`, err);
      }
    }
  }

  prepare(query: string): D1PreparedStatement {
    return new LocalD1PreparedStatement(this.db, query);
  }
}

const globalForD1 = globalThis as unknown as { __localD1Instance?: LocalD1Database };
if (!globalForD1.__localD1Instance || !(globalForD1.__localD1Instance instanceof LocalD1Database)) {
  globalForD1.__localD1Instance = new LocalD1Database();
}
const localD1Instance = globalForD1.__localD1Instance;

export function getDb(): D1DatabaseBinding {
  try {
    // 1. Em ambiente Cloudflare Pages/Workers, utiliza o binding oficial do D1
    if (typeof process === 'undefined' || process.env.VITEST !== 'true') {
      const cloudflareRequestContextSymbol = Symbol.for('__cloudflare-request-context__');
      const ctx = (globalThis as any)[cloudflareRequestContextSymbol];
      if (ctx && ctx.env && ctx.env.DB) {
        return ctx.env.DB as unknown as D1DatabaseBinding;
      }
    }
  } catch (e) {
    // Fora do contexto de requisição da Cloudflare
  }

  // 2. Em ambiente de desenvolvimento local (next dev) e testes, conecta-se diretamente
  // ao arquivo SQLite do Cloudflare D1 em .wrangler/state/v3/d1
  return localD1Instance;
}
