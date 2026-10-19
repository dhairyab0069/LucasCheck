import { isDemoDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** For uptime checks: confirms the database answers. */
export async function GET() {
  try {
    const [{ products }] = await query<{ products: number }>("SELECT count(*)::int AS products FROM product");
    return Response.json({ ok: true, database: isDemoDatabase ? "demo (PGlite)" : "postgres", products });
  } catch (err) {
    console.error("[health] database check failed", err);
    return Response.json({ ok: false }, { status: 503 });
  }
}
