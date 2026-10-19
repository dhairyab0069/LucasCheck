import Image from "next/image";
import Link from "next/link";
import { addToCart } from "@/app/actions";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/store";
import { SubmitButton } from "./submit-button";
import { card } from "./ui";

export function ProductImage({ product, sizes, priority }: { product: Product; sizes: string; priority?: boolean }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-slate-100 dark:ring-slate-800">
      {product.imageUrl ? (
        <Image src={product.imageUrl} alt={product.name} fill sizes={sizes} priority={priority} className="object-contain p-4 mix-blend-multiply" />
      ) : null}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={`${card} group flex flex-col p-3 transition hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-black/40`}>
      <Link href={`/products/${product.id}`} className="block">
        <ProductImage product={product} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
        <div className="px-1 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{product.category}</p>
          <h3 className="mt-1 font-semibold group-hover:underline">{product.name}</h3>
        </div>
      </Link>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 px-1 pt-3">
        <span className="font-semibold tabular-nums">{formatMoney(product.price)}</span>
        <form action={addToCart}>
          <input type="hidden" name="productId" value={product.id} />
          <SubmitButton variant="secondary" pendingText="Adding…" className="px-4 py-1.5">
            Add to cart
          </SubmitButton>
        </form>
      </div>
    </article>
  );
}
