import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { PageHeader, buttonStyles } from "@/components/ui";
import { listCategories, listProducts } from "@/lib/store";

export const metadata: Metadata = { title: "Shop" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const search = params.q?.trim().slice(0, 50) || undefined;
  const categories = await listCategories();
  const category = categories.includes(params.category ?? "") ? params.category : undefined;
  const products = await listProducts({ search, category });

  const heading = [search && `matching “${search}”`, category && `in ${category}`].filter(Boolean).join(" ");

  return (
    <>
      <PageHeader title="Shop" />
      <form role="search" className="mb-8 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          defaultValue={category ?? ""}
          className="rounded-full border border-slate-300 bg-transparent px-4 py-2.5 text-sm dark:border-slate-700"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className="sr-only" htmlFor="q">Search products</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Search products"
          className="min-w-0 flex-1 basis-48 rounded-full border border-slate-300 bg-transparent px-4 py-2.5 text-sm dark:border-slate-700"
        />
        <button className={buttonStyles.primary}>Search</button>
        {(search || category) && <Link href="/products" className={buttonStyles.ghost}>Clear</Link>}
      </form>

      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"} {heading}
      </p>
      {products.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <p className="py-16 text-center text-slate-500">Nothing found. Try another search.</p>
      )}
    </>
  );
}
