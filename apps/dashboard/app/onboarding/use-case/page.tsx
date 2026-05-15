import { asc, eventScales, notificationUseCases, db } from "@trynotifly/db";
import UseCaseForm from "@/components/onboarding/Use-Case-Form";

const [useCases, scales] = await Promise.all([
  db.query.notificationUseCases.findMany({
    where: (table, { eq }) => eq(table.isActive, true),
    orderBy: asc(notificationUseCases.sortOrder),
  }),

  db.query.eventScales.findMany({
    orderBy: asc(eventScales.sortOrder),
  }),
]);

export default function UseCasePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.16),transparent_26%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.08),transparent_28%)]" />

        <div className="absolute inset-0 opacity-[0.04]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-size-[72px_72px]" />
        </div>
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        {/* LEFT SIDE */}
        <section className="hidden border-r border-white/6 lg:flex">
          <div className="flex h-full w-full flex-col gap-16 px-12 py-10">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-lime-500/20 bg-lime-500/10 backdrop-blur-xl">
                <div className="absolute inset-0 bg-linear-to-br from-lime-400/20 to-transparent" />

                <div className="relative h-2.5 w-2.5 rounded-full bg-lime-400 shadow-[0_0_24px_rgba(132,204,22,0.8)]" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  TryNotifly
                </h2>

                <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-zinc-500">
                  Workspace onboarding
                </p>
              </div>
            </div>

            {/* Hero */}
            <div className="max-w-lg">
              <div className="mb-6 inline-flex items-center rounded-full border border-lime-500/20 bg-lime-500/8 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-lime-300">
                Step 03 · Use Case
              </div>

              <h1 className="text-5xl font-semibold leading-[0.96] tracking-tighter xl:text-6xl flex items-start gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <p>Configure</p>
                  <p>notification</p>
                </div>
                <br />
                <p className="p-0 m-0">flows.</p>
              </h1>

              <p className="mt-7 max-w-md text-[15px] leading-7 text-zinc-400">
                Tailor routing, infrastructure defaults, and delivery
                recommendations for your organization at scale.
              </p>
            </div>

            {/* Preview */}
            <div className="relative mt-auto overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.025] p-5 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.03] via-transparent to-transparent" />

              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Notification Stack
                    </p>

                    <h3 className="mt-2 text-base font-medium">
                      Multi-channel orchestration
                    </h3>
                  </div>

                  <div className="rounded-full border border-lime-500/20 bg-lime-500/10 px-3 py-1 text-xs text-lime-300">
                    Optimized
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/6 bg-black/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-zinc-400">
                        Delivery routing
                      </span>

                      <span className="text-sm text-lime-300">Active</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full w-[84%] rounded-full bg-lime-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/6 bg-black/40 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                        Throughput
                      </p>

                      <p className="mt-3 text-2xl font-semibold">1.2M</p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Events / month
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/6 bg-black/40 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                        Reliability
                      </p>

                      <p className="mt-3 text-2xl font-semibold text-lime-300">
                        99.99%
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Delivery uptime
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="relative flex items-center justify-center px-6 py-8 lg:px-12">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />

          <div className="relative z-10 w-full max-w-3xl">
            <div className="rounded-[30px] border border-white/8 bg-white/[0.025] p-8 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              <UseCaseForm useCases={useCases} eventScales={scales} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
