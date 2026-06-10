import { Pool } from 'pg';

function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL is missing. Please set your PostgreSQL connection string.');
  }

  return dbUrl;
}

export class PostgresDb {
  private pool: Pool | null = null;

  async init() {
    const connectionString = getDatabaseUrl();

    let host = 'unknown';
    try {
      host = new URL(connectionString).hostname;
    } catch {}

    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1';

    this.pool = new Pool({
      connectionString,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    });

    try {
      const client = await this.pool.connect();
      client.release();
      console.log('Connected to PostgreSQL successfully');
    } catch (err) {
      console.error('Error connecting to PostgreSQL:', err);
      throw err;
    }

    await this.createTables();
  }

  private async createTables() {
    if (!this.pool) return;

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        category TEXT NOT NULL,
        date DATE NOT NULL,
        receipt_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        monthly_limit DECIMAL(12, 2) NOT NULL,
        month INTEGER,
        year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
      CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    `);

    const catCount = await this.pool.query('SELECT COUNT(*) as count FROM categories');

    if (parseInt(catCount.rows[0].count) === 0) {
      const defaultCats = ['Food', 'Shopping', 'Rent', 'Entertainment', 'Utilities', 'Transport', 'Other'];

      for (const cat of defaultCats) {
        await this.pool.query('INSERT INTO categories (user_id, name) VALUES (0, $1)', [cat]);
      }
    }
  }

  async run(query: string, params: any[] = []) {
    if (!this.pool) throw new Error('Database not initialized');

    const pgQuery = this.convertQuery(query);

    let finalQuery = pgQuery;
    if (query.toUpperCase().startsWith('INSERT') && !pgQuery.toUpperCase().includes('RETURNING')) {
      finalQuery += ' RETURNING id';
    }

    const result = await this.pool.query(finalQuery, params);

    return {
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount,
    };
  }

  async get(query: string, params: any[] = []) {
    if (!this.pool) throw new Error('Database not initialized');

    const pgQuery = this.convertQuery(query);
    const result = await this.pool.query(pgQuery, params);

    return result.rows[0] || null;
  }

  async all(query: string, params: any[] = []) {
    if (!this.pool) throw new Error('Database not initialized');

    const pgQuery = this.convertQuery(query);
    const result = await this.pool.query(pgQuery, params);

    return result.rows;
  }

  async exec(query: string) {
    if (!this.pool) throw new Error('Database not initialized');

    return this.pool.query(query);
  }

  private convertQuery(query: string): string {
    let index = 1;
    return query.replace(/\?/g, () => `$${index++}`);
  }
}

let dbInstance: PostgresDb | null = null;

export async function initDb() {
  if (!dbInstance) {
    dbInstance = new PostgresDb();
    await dbInstance.init();
  }

  return dbInstance;
}
