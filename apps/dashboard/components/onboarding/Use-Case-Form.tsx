"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Check } from "lucide-react";
import { z } from "zod";
import clsx from "clsx";

const schema = z.object({
  primaryUseCaseId: z.string().min(1),
  eventScaleId: z.string().min(1),
});

interface UseCase {
  id: string;
  title: string;
  description: string;
}

interface EventScale {
  id: string;
  label: string;
}

interface Props {
  useCases: UseCase[];
  eventScales: EventScale[];
}

export default function UseCaseForm({ useCases, eventScales }: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [primaryUseCaseId, setPrimaryUseCaseId] = useState(
    useCases[0]?.id || "",
  );

  const [eventScaleId, setEventScaleId] = useState(eventScales[0]?.id || "");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validatedFields = schema.safeParse({
      primaryUseCaseId,
      eventScaleId,
    });

    if (!validatedFields.success) {
      toast.error("Please complete all onboarding fields.");

      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/onboarding/use-case", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            primaryUseCaseId,
            eventScaleId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Failed to update onboarding.");

          return;
        }

        toast.success("Use case updated successfully.");

        router.push("/onboarding/team");
      } catch {
        toast.error("Failed to update onboarding preferences.");
      }
    });
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center rounded-full border border-lime-500/20 bg-lime-500/10 px-4 py-1 text-[11px] uppercase tracking-[0.26em] text-lime-300">
          Step 03 · Use Case
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          What are you building?
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-400">
          Configure your workspace defaults, infrastructure recommendations, and
          notification workflows.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div>
          <div className="mb-5">
            <p className="text-sm font-medium text-white">Primary use case</p>

            <p className="mt-1 text-sm text-zinc-500">
              Select the workflow closest to your stack.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {useCases.map((useCase) => {
              const isActive = primaryUseCaseId === useCase.id;

              return (
                <button
                  key={useCase.id}
                  type="button"
                  onClick={() => setPrimaryUseCaseId(useCase.id)}
                  className={clsx(
                    "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200",
                    isActive
                      ? "border-lime-500/30 bg-lime-500/8"
                      : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/4",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[15px] font-medium text-white">
                        {useCase.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {useCase.description}
                      </p>
                    </div>

                    <div
                      className={clsx(
                        "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                        isActive
                          ? "border-lime-500/40 bg-lime-500 text-black"
                          : "border-white/10 bg-black/30",
                      )}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-5">
            <p className="text-sm font-medium text-white">
              Estimated monthly events
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Helps optimize scaling recommendations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {eventScales.map((scale) => {
              const isActive = eventScaleId === scale.id;

              return (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() => setEventScaleId(scale.id)}
                  className={clsx(
                    "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "border-lime-500/30 bg-lime-500/8 text-lime-300"
                      : "border-white/10 bg-white/2 text-zinc-400 hover:border-white/20 hover:text-white",
                  )}
                >
                  {scale.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <p className="text-sm text-zinc-500">
            Step 3 of 6 · Workspace onboarding
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-lime-400 px-6 text-sm font-medium text-black transition-all duration-200 hover:bg-lime-300 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
