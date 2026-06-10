export function PricingSkeleton() {
  return (
    <>
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto h-10 w-80 animate-pulse rounded-full bg-white/10" />
        <div className="mx-auto mt-8 h-16 w-full max-w-2xl animate-pulse rounded-2xl bg-white/10" />
        <div className="mx-auto mt-5 h-6 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <div className="h-11 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="h-11 w-48 animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-190 animate-pulse rounded-3xl border border-white/10 bg-white/4"
          />
        ))}
      </div>
    </>
  );
}
