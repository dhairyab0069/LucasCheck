import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderCard } from "@/components/order-card";
import { ButtonLink, PageHeader, card } from "@/components/ui";
import { getSession } from "@/lib/session";
import { getCustomer, listOrders } from "@/lib/store";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  const [customer, orders] = await Promise.all([getCustomer(session.customerId), listOrders({ customerId: session.customerId })]);
  if (!customer) redirect("/login");

  const fields: [string, string][] = [
    ["Customer id", String(customer.id)],
    ["Username", customer.userId],
    ["Name", `${customer.firstName} ${customer.lastName}`],
    ["Email", customer.email],
    ["Phone", customer.phone],
    ["Address", [customer.address, customer.city, customer.state, customer.postalCode].filter(Boolean).join(", ")],
    ["Country", customer.country],
  ];

  return (
    <>
      <PageHeader title={`Hi, ${customer.firstName}`} />
      <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
        <section className={`${card} h-fit p-6`}>
          <h2 className="font-bold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2 className="mb-4 font-bold">Your orders</h2>
          {orders.length ? (
            <div className="space-y-4">{orders.map((o) => <OrderCard key={o.id} order={o} />)}</div>
          ) : (
            <div className={`${card} p-8 text-center text-slate-500`}>
              No orders yet.
              <div className="mt-4"><ButtonLink href="/products">Start shopping</ButtonLink></div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
