"use client";

import { useEffect } from "react";
import { buttonStyles } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-slate-500">
        Please try again.{error.digest && <> Reference: <code>{error.digest}</code></>}
      </p>
      <button onClick={reset} className={`${buttonStyles.primary} mt-6`}>Try again</button>
    </div>
  );
}
