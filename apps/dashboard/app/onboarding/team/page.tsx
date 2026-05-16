import TeamInviteForm from "@/components/onboarding/Team-Invite-Form";

export default function TeamInvitePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.08),transparent_28%)]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.055]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden border-r border-white/10 lg:block">
            <div className="flex h-full flex-col px-14 py-10">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-lime-500/20 bg-lime-500/15 shadow-[0_0_60px_rgba(132,204,22,0.18)]">
                  <div className="size-2.5 rounded-full bg-lime-400" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    TryNotifly
                  </h2>

                  <p className="mt-1 text-xs uppercase tracking-[0.32em] text-zinc-500">
                    Workspace onboarding
                  </p>
                </div>
              </div>

              <div className="mt-28 max-w-2xl">
                <div className="mb-7 inline-flex items-center rounded-full border border-lime-500/20 bg-lime-500/10 px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.32em] text-lime-300">
                  Step 04 · Team
                </div>

                <h1 className="max-w-[720px] text-6xl font-semibold leading-[0.95] tracking-[-0.055em] text-white xl:text-7xl">
                  Invite your team,
                  <br />
                  or keep moving solo.
                </h1>

                <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
                  Bring developers, operators, and product teammates into your
                  workspace. You can skip this step and invite people later from
                  settings.
                </p>
              </div>

              <div className="mt-auto rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 shadow-2xl shadow-black/40 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                      Collaboration setup
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-white">
                      Team-ready workspace
                    </h3>
                  </div>

                  <span className="rounded-full border border-lime-500/20 bg-lime-500/10 px-3 py-1 text-xs font-medium text-lime-300">
                    Optional
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-400">Role controls</p>
                      <p className="text-sm font-medium text-lime-300">
                        Admin / Member / Viewer
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-400">Invite expiry</p>
                      <p className="text-sm font-medium text-white">7 days</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-400">Access model</p>
                      <p className="text-sm font-medium text-white">
                        Organization scoped
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-14">
            <div className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-black/70 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-8 lg:p-10">
              <TeamInviteForm />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
