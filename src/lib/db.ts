// One small query interface over two drivers:
// - DATABASE_URL set  → a real Postgres (Neon, Supabase, …) through `pg`
// - DATABASE_URL unset → PGlite, an in-memory Postgres compiled to WASM, seeded
//   on first use. Zero setup for previews; data resets on every cold start.
import "server-only";
import { DROP_SQL, SCHEMA_SQL, seed } from "./schema";

export interface Queryable {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

interface Driver extends Queryable {
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
}

export const isDemoDatabase = !process.env.DATABASE_URL;

async function createDriver(): Promise<Driver> {
  if (isDemoDatabase) {
    const { PGlite } = await import("@electric-sql/pglite");
    const db = await PGlite.create();
    return {
      query: (sql, params) => db.query(sql, params),
      exec: async (sql) => void (await db.exec(sql)),
      transaction: (fn) => db.transaction((tx) => fn(tx)),
    } as Driver;
  }

  const { Pool } = await import("pg");
  const url = process.env.DATABASE_URL!;
  const pool = new Pool({
    connectionString: url,
    // Serverless functions are short-lived: keep few connections per instance.
    max: 3,
    idleTimeoutMillis: 10_000,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
  });
  pool.on("error", (err) => console.error("[db] idle client error", err));
  return {
    query: (sql, params) => pool.query(sql, params),
    exec: async (sql) => void (await pool.query(sql)),
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn(client as unknown as Queryable);
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },
  } as Driver;
}

/** Creates the tables and demo data if the database is empty. */
export async function setupDatabase(driver: Driver, { reset = false } = {}) {
  if (reset) await driver.exec(DROP_SQL);
  const { rows } = await driver.query<{ exists: string | null }>(
    "SELECT to_regclass('public.product')::text AS exists",
  );
  if (rows[0]?.exists && !reset) return;
  await driver.exec(SCHEMA_SQL);
  await driver.transaction((tx) => seed(tx));
  console.info(`[db] created schema and demo data (${isDemoDatabase ? "PGlite" : "Postgres"})`);
}

// Cache across hot reloads in dev and across requests in one serverless instance.
const globalForDb = globalThis as unknown as { lucasDb?: Promise<Driver> };

export function getDb(): Promise<Driver> {
  globalForDb.lucasDb ??= createDriver()
    .then(async (driver) => {
      await setupDatabase(driver);
      return driver;
    })
    .catch((err) => {
      globalForDb.lucasDb = undefined; // retry on the next request
      throw err;
    });
  return globalForDb.lucasDb;
}

export async function query<T = Record<string, unknown>>(sql: string, params?: unknown[]) {
  const db = await getDb();
  return (await db.query<T>(sql, params)).rows;
}
