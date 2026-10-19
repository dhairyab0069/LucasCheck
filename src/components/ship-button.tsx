"use client";

import { useActionState } from "react";
import { ship } from "@/app/actions";
import { SubmitButton } from "./submit-button";

export function ShipButton({ orderId }: { orderId: number }) {
  const [state, action] = useActionState(ship, undefined);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="orderId" value={orderId} />
      <SubmitButton variant="secondary" pendingText="Shipping…" className="px-4 py-1.5">Ship</SubmitButton>
      {state?.error && <p role="alert" className="max-w-64 text-right text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
