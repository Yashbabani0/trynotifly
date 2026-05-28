"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconBuilding, IconCheck, IconSparkles } from "@tabler/icons-react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  InlineNotice,
  SelectField,
  TextField,
  Toast,
} from "@/components/auth/form-field";
import {
  channelOptions,
  expectedVolumeOptions,
  experienceLevelOptions,
  industryOptions,
  platformUseOptions,
  teamRoleOptions,
  teamSizeOptions,
  timezoneOptions,
  useCaseOptions,
} from "@/lib/onboarding/options";
import {
  organizationStepSchema,
  profileStepSchema,
  type OrganizationStepInput,
  type ProfileStepInput,
} from "@/lib/onboarding/schemas";
import { slugify } from "@/lib/onboarding/format";
import type { OnboardingState } from "@/lib/onboarding/service";
import { saveOrganizationStep, saveProfileStep } from "@/app/(onboarding)/onboarding/actions";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "ORGANIZATION",
    title: "Workspace",
    description: "Create your organization",
    icon: IconBuilding,
  },
  {
    id: "PROFILE",
    title: "Profile",
    description: "Personalize setup",
    icon: IconSparkles,
  },
  {
    id: "COMPLETE",
    title: "Ready",
    description: "Open dashboard",
    icon: IconCheck,
  },
] as const;

type StepId = (typeof steps)[number]["id"];

function stepIndex(step: StepId) {
  return steps.findIndex((item) => item.id === step);
}

function OptionList({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}

export function OnboardingFlow({ state }: { state: OnboardingState }) {
  const initialStep = state.step === "COMPLETE" ? "PROFILE" : state.step;
  const [activeStep, setActiveStep] = useState<Exclude<StepId, "COMPLETE">>(
    initialStep,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const organizationForm = useForm<OrganizationStepInput>({
    resolver: zodResolver(organizationStepSchema),
    defaultValues: {
      name: state.organization?.name ?? "",
      slug: state.organization?.slug ?? "",
      industry: state.organization?.industry ?? "",
      useCase: state.organization?.useCase ?? "",
      teamSize: state.organization?.teamSize ?? "",
      timezone: state.organization?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      website: state.organization?.website ?? "",
    },
  });

  const profileForm = useForm<ProfileStepInput>({
    resolver: zodResolver(profileStepSchema),
    defaultValues: {
      platformUse: state.answers.platformUse ?? "",
      expectedVolume: state.answers.expectedVolume ?? "",
      preferredChannels:
        state.answers.preferredChannels?.split(",").filter(Boolean) as ProfileStepInput["preferredChannels"] | undefined ??
        ["EMAIL"],
      teamRole: state.answers.teamRole ?? "",
      experienceLevel: state.answers.experienceLevel ?? "",
    },
  });

  const currentStepIndex = useMemo(() => stepIndex(activeStep), [activeStep]);

  function updateSlugFromName(value: string) {
    const currentSlug = organizationForm.getValues("slug");

    if (!currentSlug || currentSlug === slugify(organizationForm.getValues("name"))) {
      organizationForm.setValue("slug", slugify(value), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  async function submitOrganization(values: OrganizationStepInput) {
    setNotice(null);
    startTransition(async () => {
      const result = await saveOrganizationStep(values);

      if (!result.ok) {
        setNotice(result.message ?? "Could not save workspace.");
        return;
      }

      setNotice("Workspace saved. Continue with profile details.");
      setActiveStep("PROFILE");
    });
  }

  async function submitProfile(values: ProfileStepInput) {
    setNotice(null);
    startTransition(async () => {
      const result = await saveProfileStep(values);

      if (result && !result.ok) {
        setNotice(result.message ?? "Could not complete onboarding.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <Toast
          tone={notice?.includes("saved") ? "success" : "default"}
          message={notice}
        />
        <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div>
            <p className="text-sm text-muted-foreground">TryNotifly setup</p>
            <h1 className="mt-2 text-2xl font-semibold">Launch checklist</h1>
          </div>

          <div className="mt-8 space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const complete = index < currentStepIndex;
              const active = index === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex gap-3 rounded-xl border p-3 transition-all",
                    active
                      ? "border-primary/40 bg-primary/10"
                      : complete
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-border bg-background",
                  )}
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            Your progress is saved after every step, so refreshing this page will
            resume from where you left off.
          </div>
        </aside>

        <section className="flex items-center">
          <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            {notice ? (
              <div className="mb-5">
                <InlineNotice>{notice}</InlineNotice>
              </div>
            ) : null}

            {activeStep === "ORGANIZATION" ? (
              <form
                onSubmit={organizationForm.handleSubmit(submitOrganization)}
                className="animate-in fade-in-0 slide-in-from-right-2 space-y-5 duration-300"
              >
                <div>
                  <h2 className="text-2xl font-semibold">Create your workspace</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This workspace owns your API keys, sending domains, credits,
                    and team access.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Organization name"
                    error={organizationForm.formState.errors.name?.message}
                    {...organizationForm.register("name", {
                      onChange: (event) => updateSlugFromName(event.target.value),
                    })}
                  />
                  <TextField
                    label="Workspace slug"
                    error={organizationForm.formState.errors.slug?.message}
                    {...organizationForm.register("slug")}
                  />
                  <SelectField
                    label="Industry"
                    error={organizationForm.formState.errors.industry?.message}
                    {...organizationForm.register("industry")}
                  >
                    <option value="">Select industry</option>
                    {industryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Primary use case"
                    error={organizationForm.formState.errors.useCase?.message}
                    {...organizationForm.register("useCase")}
                  >
                    <option value="">Select use case</option>
                    {useCaseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Team size"
                    error={organizationForm.formState.errors.teamSize?.message}
                    {...organizationForm.register("teamSize")}
                  >
                    <option value="">Select team size</option>
                    {teamSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Timezone"
                    error={organizationForm.formState.errors.timezone?.message}
                    {...organizationForm.register("timezone")}
                  >
                    <option value="">Select timezone</option>
                    {timezoneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <div className="sm:col-span-2">
                    <TextField
                      label="Website"
                      placeholder="https://example.com"
                      error={organizationForm.formState.errors.website?.message}
                      {...organizationForm.register("website")}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Logo upload can be connected to storage later. The schema is
                  ready through the existing organization logo field.
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? "Saving..." : "Save and continue"}
                  </Button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={profileForm.handleSubmit(submitProfile)}
                className="animate-in fade-in-0 slide-in-from-right-2 space-y-6 duration-300"
              >
                <div>
                  <h2 className="text-2xl font-semibold">Personalize TryNotifly</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    These answers help shape defaults for channels, limits, and
                    first-run recommendations.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="What will you use it for?"
                    error={profileForm.formState.errors.platformUse?.message}
                    {...profileForm.register("platformUse")}
                  >
                    <option value="">Select use</option>
                    {platformUseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Expected volume"
                    error={profileForm.formState.errors.expectedVolume?.message}
                    {...profileForm.register("expectedVolume")}
                  >
                    <option value="">Select volume</option>
                    {expectedVolumeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Your role"
                    error={profileForm.formState.errors.teamRole?.message}
                    {...profileForm.register("teamRole")}
                  >
                    <option value="">Select role</option>
                    {teamRoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Experience level"
                    error={profileForm.formState.errors.experienceLevel?.message}
                    {...profileForm.register("experienceLevel")}
                  >
                    <option value="">Select experience</option>
                    {experienceLevelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                </div>

                <OptionList
                  label="Preferred channels"
                  error={profileForm.formState.errors.preferredChannels?.message}
                >
                  {channelOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        value={option.value}
                        className="size-4 accent-primary"
                        {...profileForm.register("preferredChannels")}
                      />
                      {option.label}
                    </label>
                  ))}
                </OptionList>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setActiveStep("ORGANIZATION")}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? "Completing..." : "Complete onboarding"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
