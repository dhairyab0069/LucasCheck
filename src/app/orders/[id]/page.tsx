import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrderCard } from "@/components/order-card";
import { ButtonLink, Notice, PageHeader } from "@/components/ui";
import { getSession } from "@/lib/session";
import { listOrders } from "@/lib/store";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const [{ id }, { placed }] = await Promise.all([params, searchParams]);
  const session = await getSession();
  if (!session) redirect(`/login?next=/orders/${encodeURIComponent(id)}`);

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();
  const [order] = await listOrders({ orderId });
  // Customers can only see their own orders; admins can see all.
  if (!order || (order.customerId !== session.customerId && !session.isAdmin)) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={`Order #${order.id}`} />
      {placed && (
        <div className="mb-6">
          <Notice tone="success">Order placed. It will ship soon, {order.customerName.split(" ")[0]}. Your reference number is #{order.id}.</Notice>
        </div>
      )}
      <OrderCard order={order} showCustomer={session.isAdmin} />
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/products">Keep shopping</ButtonLink>
        <ButtonLink href="/account" variant="secondary">All your orders</ButtonLink>
      </div>
    </div>
  );
}
