import type { Metadata, Viewport } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import Link from "next/link";
import { logout } from "./actions";
import { cartCount, readCart } from "@/lib/cart";
import { getSession } from "@/lib/session";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const script = Dancing_Script({ subsets: ["latin"], weight: ["700"], variable: "--font-display" });

export const metadata: Metadata = {
  title: { default: "Lucas-Check Sporting Goods", template: "%s · Lucas-Check" },
  description: "A demo sporting goods store: browse gear, fill a cart and place mock orders.",
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, cart] = await Promise.all([getSession(), readCart()]);
  const items = cartCount(cart);
  const nav = "rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

  return (
    <html lang="en" className={`${inter.variable} ${script.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <div className="bg-slate-900 px-4 py-2 text-center text-xs text-slate-200">
          Demo store: nothing here is for sale and no payment is ever taken.
        </div>
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3">
            <Link href="/" className="mr-auto font-display text-2xl text-brand-600 dark:text-brand-100">
              Lucas-Check
            </Link>
            <Link href="/products" className={nav}>Shop</Link>
            {session ? (
              <>
                <Link href="/account" className={nav}>{session.name.split(" ")[0]}</Link>
                {session.isAdmin && <Link href="/admin" className={nav}>Admin</Link>}
                <form action={logout}>
                  <button className={nav}>Log out</button>
                </form>
              </>
            ) : (
              <Link href="/login" className={nav}>Log in</Link>
            )}
            <Link href="/cart" className={`${nav} inline-flex items-center gap-1.5`} aria-label={`Cart, ${items} items`}>
              Cart
              <span className="min-w-5 rounded-full bg-slate-900 px-1.5 text-center text-xs leading-5 text-white tabular-nums dark:bg-white dark:text-slate-900">
                {items}
              </span>
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-xs text-slate-500 dark:text-slate-400">
            <span>Lucas-Check began as a COSC 304 group project (Group 4), rebuilt as a showcase.</span>
            <a href="https://github.com/dhairyab0069/LucasCheck" className="hover:underline">Source on GitHub</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
