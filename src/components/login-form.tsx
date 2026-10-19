"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";
import { SubmitButton } from "./submit-button";
import { Notice } from "./ui";

const input = "mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 dark:border-slate-700";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <label className="block text-sm font-medium">
        Username
        <input name="username" defaultValue={state?.username} key={state?.username} autoComplete="username" required maxLength={20} className={input} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" autoComplete="current-password" required maxLength={64} className={input} />
      </label>
      <SubmitButton pendingText="Logging in…" className="w-full">Log in</SubmitButton>
    </form>
  );
}
