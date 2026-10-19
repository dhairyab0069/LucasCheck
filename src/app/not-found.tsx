import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-6xl text-brand-600 dark:text-brand-100">404</p>
      <h1 className="mt-4 text-2xl font-bold">That page isn&apos;t here</h1>
      <p className="mt-2 text-slate-500">Links from the old site (like <code>listprod.jsp</code>) now go to the new pages.</p>
      <ButtonLink href="/" className="mt-6">Back to the store</ButtonLink>
    </div>
  );
}
