import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/format";
import type { OrderSummary } from "@/lib/store";
import { card } from "./ui";

export function OrderStatus({ shippedAt }: { shippedAt: string | null }) {
  return shippedAt ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      Shipped {formatDate(shippedAt)}
    </span>
  ) : (
    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">Processing</span>
  );
}

export function OrderCard({ order, showCustomer, actions }: { order: OrderSummary; showCustomer?: boolean; actions?: React.ReactNode }) {
  return (
    <article className={`${card} p-5`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/orders/${order.id}`} className="font-semibold hover:underline">Order #{order.id}</Link>
          <p className="text-sm text-slate-500">
            {formatDate(order.date)}
            {showCustomer && <> · {order.customerName} (customer #{order.customerId})</>}
          </p>
        </div>
        <div className="flex items-start gap-3">
          <OrderStatus shippedAt={order.shippedAt} />
          {actions}
        </div>
      </header>
      <table className="mt-4 w-full text-sm">
        <thead className="sr-only">
          <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {order.items.map((item) => (
            <tr key={item.productId}>
              <td className="py-1.5"><Link href={`/products/${item.productId}`} className="hover:underline">{item.productName}</Link></td>
              <td className="py-1.5 text-right text-slate-500 tabular-nums">{item.quantity} × {formatMoney(item.price)}</td>
              <td className="w-28 py-1.5 text-right tabular-nums">{formatMoney(item.quantity * item.price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="pt-3 text-right font-semibold">Total</td>
            <td className="pt-3 text-right font-semibold tabular-nums">{formatMoney(order.total)}</td>
          </tr>
        </tfoot>
      </table>
    </article>
  );
}
