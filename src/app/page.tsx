import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ButtonLink } from "@/components/ui";
import { listCategories, listProducts } from "@/lib/store";

const FEATURED = ["Running Shoes", "Hockey Stick", "Hoodie", "Pre-workout"];

export default async function Home() {
  const [categories, products] = await Promise.all([listCategories(), listProducts({})]);
  const featured = FEATURED.map((name) => products.find((p) => p.name === name)).filter((p) => p !== undefined);

  return (
    <div className="space-y-16">
      <section className="hero-gradient -mt-4 overflow-hidden rounded-3xl px-6 py-16 text-white sm:px-12 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Sporting goods</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-tight drop-shadow sm:text-7xl">Welcome to Lucas-Check</h1>
        <p className="mt-4 max-w-xl text-lg text-white/90">
          Gear for the rink, the court, the gym and the snow. {products.length} products across {categories.length} categories.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/products" className="bg-white! text-slate-900! hover:bg-white/90!">Start shopping</ButtonLink>
          <ButtonLink href="/login" variant="secondary" className="border-white/60 text-white hover:border-white">Log in</ButtonLink>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Shop by category</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((name) => (
            <Link
              key={name}
              href={`/products?category=${encodeURIComponent(name)}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Popular right now</h2>
          <Link href="/products" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-100">See all</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
