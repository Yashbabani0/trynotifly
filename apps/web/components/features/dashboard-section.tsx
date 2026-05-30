import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const stats = [
  { label: "Sent", value: "128.4k" },
  { label: "Delivered", value: "97.2%" },
  { label: "Failed", value: "0.9%" },
];

const logs = [
  {
    title: "Order confirmation",
    channel: "Email",
    status: "Delivered",
    icon: CheckCircle2,
  },
  {
    title: "OTP verification",
    channel: "SMS",
    status: "Delivered",
    icon: CheckCircle2,
  },
  {
    title: "Invoice notification",
    channel: "Email",
    status: "Failed",
    icon: XCircle,
  },
  {
    title: "Shipping update",
    channel: "WhatsApp",
    status: "Queued",
    icon: Clock,
  },
];

export function DashboardSection() {
  return (
    <section className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Dashboard</p>

            <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Monitor delivery without switching tools
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              View live logs, channel analytics, delivery failures and usage
              from one unified dashboard.
            </p>
          </div>

          <div className="rounded-3xl border bg-card p-4 shadow-sm">
            <div className="rounded-2xl border bg-background p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Notification overview</h3>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>

                <BarChart3 className="size-5 text-primary" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium">Live logs</h4>
                  <Activity className="size-4 text-primary" />
                </div>

                <div className="space-y-3">
                  {logs.map((log) => {
                    const Icon = log.icon;

                    return (
                      <div
                        key={log.title}
                        className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{log.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.channel}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {log.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
