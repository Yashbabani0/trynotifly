"use client";

import { useActionState } from "react";
import { ActionMessage } from "@/components/dashboard/action-message";

type State = {
  ok: boolean;
  message: string;
};

export function ServerActionForm({
  action,
  children,
  className,
}: {
  action: (previousState: State, formData: FormData) => Promise<State>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, { ok: false, message: "" });

  return (
    <form action={formAction} className={className}>
      {children}
      <ActionMessage state={state} />
    </form>
  );
}
