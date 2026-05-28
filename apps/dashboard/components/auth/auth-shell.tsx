import Link from "next/link";

export function AuthShell({
  title,
  description,
  footer,
  oauth,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  oauth?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <section className="hidden min-h-screen flex-1 border-r border-border bg-muted/30 p-10 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-lg font-semibold">
          TryNotifly
        </Link>
        <div className="max-w-md">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Notification infrastructure
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Build reliable customer messaging from day one.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Configure your workspace, choose channels, and ship transactional
            notifications with clear guardrails.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Email, SMS, push, WhatsApp, and in-app delivery in one control plane.
        </p>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center px-4 py-10 lg:w-[520px]">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
            {oauth ? (
              <div className="mt-6">
                {oauth}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    or
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </div>
            ) : null}
            <div className={oauth ? "" : "mt-6"}>{children}</div>
          </div>
          <div className="mt-5 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}
