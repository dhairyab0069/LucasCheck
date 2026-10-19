import Link from "next/link";
import type { ComponentProps } from "react";

const button =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: `${button} bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200`,
  secondary: `${button} border border-slate-300 hover:border-slate-500 dark:border-slate-700 dark:hover:border-slate-400`,
  ghost: `${button} px-3 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white`,
};

export function ButtonLink({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles }) {
  return <Link className={`${buttonStyles[variant]} ${className}`} {...props} />;
}

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {children}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  const tones = {
    info: "border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-700/40 dark:bg-brand-700/10 dark:text-brand-100",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </p>
  );
}

export const card = "rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
