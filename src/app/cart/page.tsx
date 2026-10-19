import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { checkout, removeFromCart, updateQuantity } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink, Notice, PageHeader, card } from "@/components/ui";
import { MAX_QUANTITY, readCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { getSession } from "@/lib/session";
import { cartLines } from "@/lib/store";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, session, cart] = await Promise.all([searchParams, getSession(), readCart()]);
  const lines = await cartLines(cart);
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Find something you like in the shop.</p>
        <ButtonLink href="/products" className="mt-6">Start shopping</ButtonLink>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Your cart" />
      {error && <div className="mb-6"><Notice tone="error">{error}</Notice></div>}
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ul className={`${card} divide-y divide-slate-200 dark:divide-slate-800`}>
          {lines.map((line) => (
            <li key={line.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-100 dark:ring-slate-800">
                {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="64px" className="object-contain p-1 mix-blend-multiply" />}
              </div>
              <div className="min-w-32 flex-1">
                <Link href={`/products/${line.id}`} className="font-semibold hover:underline">{line.name}</Link>
                <p className="text-sm text-slate-500 tabular-nums">{formatMoney(line.price)} each</p>
              </div>
              <form action={updateQuantity} className="flex items-center gap-2">
                <input type="hidden" name="productId" value={line.id} />
                <label className="sr-only" htmlFor={`qty-${line.id}`}>Quantity of {line.name}</label>
                <input
                  id={`qty-${line.id}`}
                  name="quantity"
                  type="number"
                  min={1}
                  max={MAX_QUANTITY}
                  defaultValue={line.quantity}
                  className="w-16 rounded-lg border border-slate-300 bg-transparent px-2 py-1.5 text-center tabular-nums dark:border-slate-700"
                />
                <SubmitButton variant="ghost" pendingText="…">Update</SubmitButton>
              </form>
              <span className="w-24 text-right font-semibold tabular-nums">{formatMoney(line.subtotal)}</span>
              <form action={removeFromCart}>
                <input type="hidden" name="productId" value={line.id} />
                <SubmitButton variant="ghost" pendingText="…">Remove</SubmitButton>
              </form>
            </li>
          ))}
        </ul>

        <aside className={`${card} h-fit space-y-4 p-6`}>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(total)}</span>
          </div>
          {session ? (
            <>
              <p className="text-sm text-slate-500">Ordering as {session.name}. This is a mock checkout: no payment is taken.</p>
              <form action={checkout}>
                <SubmitButton pendingText="Placing order…" className="w-full">Place order</SubmitButton>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500">Log in to place your order.</p>
              <ButtonLink href="/login?next=/cart" className="w-full">Log in to check out</ButtonLink>
            </>
          )}
          <Link href="/products" className="block text-center text-sm font-medium text-slate-600 hover:underline dark:text-slate-300">
            Continue shopping
          </Link>
        </aside>
      </div>
    </>
  );
}
