import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Mail,
  MessageSquareText,
} from "lucide-react";

const metrics = [
  {
    label: "Total sent",
    value: "128,420",
    change: "+18.2%",
  },
  {
    label: "Delivered",
    value: "124,908",
    change: "97.2%",
  },
  {
    label: "Failed",
    value: "1,204",
    change: "0.9%",
  },
];

const logs = [
  {
    channel: "Email",
    event: "Order confirmation sent",
    status: "Delivered",
    icon: Mail,
  },
  {
    channel: "SMS",
    event: "OTP verification sent",
    status: "Delivered",
    icon: MessageSquareText,
  },
  {
    channel: "Email",
    event: "Invoice email bounced",
    status: "Failed",
    icon: AlertTriangle,
  },
];

export function DashboardPreview() {
  return (
    <section className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Unified dashboard</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Monitor every notification from one place
          </h2>

          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Track delivery, failures, usage and channel performance without
            switching between multiple providers.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="border-b bg-background px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-muted" />
              <span className="size-3 rounded-full bg-muted" />
              <span className="size-3 rounded-full bg-muted" />
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border bg-background p-5"
                  >
                    <p className="text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-sm text-primary">{metric.change}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border bg-background p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Channel performance</h3>
                    <p className="text-sm text-muted-foreground">
                      Last 30 days
                    </p>
                  </div>

                  <BarChart3 className="size-5 text-primary" />
                </div>

                <div className="space-y-4">
                  {[
                    ["Email", "92%"],
                    ["SMS", "84%"],
                    ["WhatsApp", "76%"],
                    ["Push", "68%"],
                  ].map(([label, width]) => (
                    <div key={label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="text-muted-foreground">{width}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Live notification logs</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time delivery events
                  </p>
                </div>

                <Activity className="size-5 text-primary" />
              </div>

              <div className="space-y-3">
                {logs.map((log) => {
                  const Icon = log.icon;
                  const isFailed = log.status === "Failed";

                  return (
                    <div
                      key={log.event}
                      className="rounded-2xl border bg-card p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{log.channel}</p>
                            <span
                              className={
                                isFailed
                                  ? "text-xs font-medium text-destructive"
                                  : "text-xs font-medium text-primary"
                              }
                            >
                              {log.status}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {log.event}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Webhooks and analytics update automatically as events are
                    processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
