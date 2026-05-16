import ChannelsForm from "@/components/onboarding/Channels-Form";

export default function ChannelsPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.08),transparent_30%)]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
          <header className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-500/25 bg-lime-500/15 shadow-[0_0_50px_rgba(132,204,22,0.16)]">
              <div className="h-2.5 w-2.5 rounded-full bg-lime-400 shadow-[0_0_18px_rgba(132,204,22,0.95)]" />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                TryNotifly
              </h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.34em] text-zinc-500">
                Workspace onboarding
              </p>
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center">
            <ChannelsForm />
          </div>
        </main>
      </div>
    </div>
  );
}
