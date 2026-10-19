import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { card } from "@/components/ui";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: rawNext } = await searchParams;
  const next = rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";
  if (await getSession()) redirect(next);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-center text-3xl font-bold">Log in</h1>
      <div className={`${card} mt-8 p-6`}>
        <LoginForm next={next} />
      </div>
      <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        <p className="font-semibold">Demo accounts</p>
        <ul className="mt-1 space-y-0.5">
          <li><code>arnold</code> / <code>test</code> (store admin)</li>
          <li><code>bobby</code> / <code>bobby</code></li>
          <li><code>beth</code> / <code>test</code></li>
        </ul>
      </div>
    </div>
  );
}
