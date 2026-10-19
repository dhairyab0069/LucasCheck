import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addToCart } from "@/app/actions";
import { ProductImage } from "@/components/product-card";
import { SubmitButton } from "@/components/submit-button";
import { formatMoney } from "@/lib/format";
import { getProduct } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

async function load({ params }: Props) {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? getProduct(id) : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const product = await load(props);
  return { title: product?.name ?? "Product not found" };
}

export default async function ProductPage(props: Props) {
  const product = await load(props);
  if (!product) notFound();

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <ProductImage product={product} sizes="(min-width: 768px) 50vw, 100vw" priority />
      <div className="flex flex-col justify-center">
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="text-sm font-medium uppercase tracking-wide text-brand-600 hover:underline dark:text-brand-100">
          {product.category}
        </Link>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-4 text-3xl font-semibold tabular-nums">{formatMoney(product.price)}</p>
        {product.description && <p className="mt-4 text-slate-600 dark:text-slate-300">{product.description}</p>}
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {product.stock > 0 ? `${product.stock} in stock at the main warehouse` : "Out of stock"} · Product #{product.id}
        </p>
        <form action={addToCart} className="mt-8 flex flex-wrap gap-3">
          <input type="hidden" name="productId" value={product.id} />
          <SubmitButton pendingText="Adding…">Add to cart</SubmitButton>
          <Link href="/products" className="inline-flex items-center px-3 text-sm font-medium text-slate-600 hover:underline dark:text-slate-300">
            Continue shopping
          </Link>
        </form>
      </div>
    </div>
  );
}
