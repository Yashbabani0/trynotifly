export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
        <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded-md bg-muted" />
        <div className="mt-8 space-y-3">
          <div className="h-11 animate-pulse rounded-lg bg-muted" />
          <div className="h-11 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </main>
  );
}
