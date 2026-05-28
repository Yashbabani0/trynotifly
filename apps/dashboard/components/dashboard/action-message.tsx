"use client";

export function ActionMessage({
  state,
}: {
  state: {
    ok: boolean;
    message: string;
  };
}) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={
        state.ok
          ? "rounded-md border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
          : "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      }
      role="status"
    >
      {state.message}
    </p>
  );
}
