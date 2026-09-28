import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";

/**
 * Boots an in-memory Postgres (PGlite) that mimics the parts of Supabase the
 * migrations rely on: the anon/authenticated/service_role roles, the auth
 * schema and auth.uid(). Then applies every migration in supabase/migrations.
 */
export async function createTestDb() {
  const db = new PGlite({ extensions: { pg_trgm } });

  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;

    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid
    $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;

    -- Supabase grants broad table privileges by default and relies on RLS.
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
    grant usage on schema public to anon, authenticated, service_role;
  `);

  const dir = path.join(process.cwd(), "supabase", "migrations");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(path.join(dir, file), "utf8"));
  }

  return db;
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;

/** Run `fn` as a Supabase role, optionally as a signed-in user. */
export async function as<T>(
  db: TestDb,
  role: "anon" | "authenticated" | "service_role",
  userId: string | null,
  fn: () => Promise<T>,
): Promise<T> {
  const claims = JSON.stringify(userId ? { sub: userId, role } : { role });
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [claims]);
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role`);
    await db.query(`select set_config('request.jwt.claims', '', false)`);
  }
}

export async function createUser(db: TestDb, id: string, email: string) {
  await db.query(`insert into auth.users (id, email) values ($1, $2)`, [id, email]);
}
