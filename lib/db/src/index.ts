import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _pool: pg.Pool | undefined;
let _db: ReturnType<typeof drizzle> | undefined;

function getPool(): pg.Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

function getDb() {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

/** Lazy proxy — crashes only when actually used, not at import time */
export const pool = new Proxy({} as pg.Pool, {
  get(_, prop) {
    return Reflect.get(getPool(), prop);
  },
});

/** Lazy proxy — crashes only when actually used, not at import time */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export * from "./schema";
