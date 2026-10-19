import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrderCard } from "@/components/order-card";
import { ShipButton } from "@/components/ship-button";
import { Notice, PageHeader, card } from "@/components/ui";
import { isDemoDatabase } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getSession } from "@/lib/session";
import { listOrders, salesByDay } from "@/lib/store";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!session.isAdmin) notFound();

  const [sales, orders] = await Promise.all([salesByDay(), listOrders()]);
  const revenue = sales.reduce((sum, d) => sum + d.total, 0);
  const pending = orders.filter((o) => !o.shippedAt).length;

  return (
    <>
      <PageHeader title="Admin" />
      {isDemoDatabase && (
        <div className="mb-6">
          <Notice>Running on the in-memory demo database: new orders and shipments reset when the server restarts.</Notice>
        </div>
      )}
      <dl className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Revenue", formatMoney(revenue)],
          ["Orders", String(orders.length)],
          ["Waiting to ship", String(pending)],
        ].map(([label, value]) => (
          <div key={label} className={`${card} p-5`}>
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <section className={`${card} h-fit p-5`}>
          <h2 className="font-bold">Sales by day</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500"><th className="py-1 font-medium">Date (UTC)</th><th className="py-1 text-right font-medium">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.map((d) => (
                <tr key={d.day}>
                  <td className="py-1.5 tabular-nums">{d.day}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatMoney(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2 className="mb-4 font-bold">All orders</h2>
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} showCustomer actions={o.shippedAt ? null : <ShipButton orderId={o.id} />} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
