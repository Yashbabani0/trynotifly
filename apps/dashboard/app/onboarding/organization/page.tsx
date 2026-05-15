import OrganizationForm from "@/components/onboarding/Organization-Form";

export default function OrganizationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Left side */}
        <div className="hidden lg:flex w-1/2 border-r border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#84cc1615,transparent_35%)]" />

          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative z-10 flex flex-col justify-between p-14 w-full">
            <div>
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl border border-lime-400/30 bg-lime-400/10 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-lime-400" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    TryNotifly
                  </h2>

                  <p className="text-xs text-zinc-500 uppercase tracking-[0.25em]">
                    Organization Setup
                  </p>
                </div>
              </div>

              <div className="mt-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                  <div className="size-2 rounded-full bg-lime-400" />
                  Step 01 · Organization
                </div>

                <h1 className="mt-8 text-6xl font-semibold leading-[1.05] tracking-tight">
                  Create your
                  <span className="block text-lime-400">
                    organization.
                  </span>
                </h1>

                <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
                  Configure your workspace identity, billing profile, and
                  operational setup before sending notifications at scale.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  onboarding.status
                </span>

                <span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-400">
                  Active
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    Organization profile
                  </span>

                  <span className="text-white">Pending</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    Billing configuration
                  </span>

                  <span className="text-white">Pending</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    Notification channels
                  </span>

                  <span className="text-white">Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-16">
          <OrganizationForm />
        </div>
      </div>
    </div>
  );
}