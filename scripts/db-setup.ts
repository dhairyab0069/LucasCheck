// Creates the tables and demo data in the Postgres at DATABASE_URL.
//   npm run db:setup            create if missing
//   npm run db:setup -- --reset drop everything and start over
// The app also does the "create if missing" step by itself on first request.
import pg from "pg";
import { DROP_SQL, SCHEMA_SQL, seed } from "../src/lib/schema.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL first (see .env.example).");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
});
await client.connect();
try {
  if (process.argv.includes("--reset")) await client.query(DROP_SQL);
  const { rows } = await client.query("SELECT to_regclass('public.product')::text AS exists");
  if (rows[0].exists) {
    console.log("Tables already exist; nothing to do (pass --reset to recreate).");
  } else {
    await client.query("BEGIN");
    await client.query(SCHEMA_SQL);
    await seed(client);
    await client.query("COMMIT");
    console.log("Created the schema and demo data.");
  }
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  throw err;
} finally {
  await client.end();
}
