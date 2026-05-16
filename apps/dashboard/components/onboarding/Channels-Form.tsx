"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Check,
  Mail,
  MessageCircle,
  MessageSquare,
  Megaphone,
  MonitorSmartphone,
  Smartphone,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

type ChannelId = "email" | "marketing_email" | "sms" | "whatsapp" | "push";

type ChannelTypeId =
  | "transactional"
  | "otp"
  | "auth"
  | "marketing"
  | "promotional"
  | "service"
  | "alerts"
  | "engagement"
  | "updates";

type ChannelOption = {
  id: ChannelId;
  title: string;
  description: string;
  icon: React.ElementType;
  types: {
    id: ChannelTypeId;
    label: string;
    description: string;
    complianceNote?: string;
  }[];
};

const CHANNEL_OPTIONS: ChannelOption[] = [
  {
    id: "email",
    title: "Email",
    description:
      "Receipts, invoices, alerts, verification, and product updates.",
    icon: Mail,
    types: [
      {
        id: "transactional",
        label: "Transactional",
        description: "Receipts, invoices, order updates, and account notices.",
      },
      {
        id: "auth",
        label: "Authentication",
        description: "Verification links, password reset, and security alerts.",
      },
      {
        id: "alerts",
        label: "System alerts",
        description: "Operational alerts, incidents, and monitoring events.",
      },
    ],
  },
  {
    id: "marketing_email",
    title: "Marketing Email",
    description:
      "Campaigns, newsletters, lifecycle flows, and product education.",
    icon: Megaphone,
    types: [
      {
        id: "marketing",
        label: "Marketing",
        description: "Newsletters, product launches, and nurture campaigns.",
      },
      {
        id: "engagement",
        label: "Customer engagement",
        description: "Lifecycle, retention, onboarding, and win-back flows.",
      },
      {
        id: "updates",
        label: "Product updates",
        description: "Feature announcements and educational broadcasts.",
      },
    ],
  },
  {
    id: "sms",
    title: "SMS",
    description: "OTP, transactional, service, and promotional SMS routing.",
    icon: MessageSquare,
    types: [
      {
        id: "otp",
        label: "OTP",
        description: "Login OTP, payment OTP, and one-time verification codes.",
        complianceNote: "India: DLT template and registered sender required.",
      },
      {
        id: "transactional",
        label: "Transactional",
        description: "Critical account, order, billing, and delivery messages.",
        complianceNote:
          "India: transactional route and approved template needed.",
      },
      {
        id: "service",
        label: "Service",
        description:
          "User-requested service updates and important notifications.",
        complianceNote:
          "India: consent and DLT classification should be mapped.",
      },
      {
        id: "promotional",
        label: "Promotional",
        description: "Offers, campaigns, discounts, and marketing broadcasts.",
        complianceNote:
          "India: promotional route, consent, and time-window rules apply.",
      },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Utility, authentication, and marketing conversations.",
    icon: MessageCircle,
    types: [
      {
        id: "auth",
        label: "Authentication",
        description: "Login codes and identity verification flows.",
      },
      {
        id: "transactional",
        label: "Utility / Transactional",
        description: "Order, payment, shipping, and account updates.",
      },
      {
        id: "marketing",
        label: "Marketing",
        description: "Promotions, offers, re-engagement, and campaigns.",
      },
      {
        id: "service",
        label: "Service conversations",
        description: "Support and user-initiated service conversations.",
      },
    ],
  },
  {
    id: "push",
    title: "App Push",
    description: "Mobile and web push for alerts, reminders, and engagement.",
    icon: Smartphone,
    types: [
      {
        id: "transactional",
        label: "Transactional",
        description: "Order, billing, account, and delivery status updates.",
      },
      {
        id: "alerts",
        label: "Alerts",
        description: "Realtime alerts, incidents, reminders, and monitoring.",
      },
      {
        id: "marketing",
        label: "Marketing",
        description: "Campaigns, promotions, and re-engagement pushes.",
      },
      {
        id: "engagement",
        label: "Engagement",
        description: "Lifecycle nudges, onboarding, and retention flows.",
      },
    ],
  },
];

type SelectedChannels = Record<ChannelId, ChannelTypeId[]>;

const createEmptySelection = (): SelectedChannels => ({
  email: [],
  marketing_email: [],
  sms: [],
  whatsapp: [],
  push: [],
});

export default function ChannelsForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedChannels, setSelectedChannels] =
    useState<SelectedChannels>(createEmptySelection);

  const selectedChannelCount = useMemo(() => {
    return Object.values(selectedChannels).filter((types) => types.length > 0)
      .length;
  }, [selectedChannels]);

  const selectedTypeCount = useMemo(() => {
    return Object.values(selectedChannels).reduce(
      (total, types) => total + types.length,
      0,
    );
  }, [selectedChannels]);

  const allSelected = useMemo(() => {
    return CHANNEL_OPTIONS.every((channel) => {
      const selectedTypes = selectedChannels[channel.id];

      return channel.types.every((type) => selectedTypes.includes(type.id));
    });
  }, [selectedChannels]);

  const hasSelection = selectedTypeCount > 0;

  function toggleChannel(channel: ChannelOption) {
    setSelectedChannels((current) => {
      const currentTypes = current[channel.id];
      const allTypeIds = channel.types.map((type) => type.id);

      const shouldSelectAll = currentTypes.length !== allTypeIds.length;

      return {
        ...current,
        [channel.id]: shouldSelectAll ? allTypeIds : [],
      };
    });
  }

  function toggleType(channelId: ChannelId, typeId: ChannelTypeId) {
    setSelectedChannels((current) => {
      const currentTypes = current[channelId];
      const isSelected = currentTypes.includes(typeId);

      return {
        ...current,
        [channelId]: isSelected
          ? currentTypes.filter((id) => id !== typeId)
          : [...currentTypes, typeId],
      };
    });
  }

  function selectAll() {
    setSelectedChannels(() => {
      return CHANNEL_OPTIONS.reduce((acc, channel) => {
        acc[channel.id] = channel.types.map((type) => type.id);
        return acc;
      }, createEmptySelection());
    });
  }

  function clearAll() {
    setSelectedChannels(createEmptySelection());
  }

  function handleSkip() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/onboarding/channels/skip", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error ?? "Failed to skip channels");
          return;
        }

        router.push("/onboarding/first-event");
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  function handleSubmit() {
    if (!hasSelection) {
      toast.error("Select at least one channel or skip this step");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/onboarding/channels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channels: selectedChannels,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error ?? "Failed to save channels");
          return;
        }

        toast.success("Channels saved");
        router.push("/onboarding/first-event");
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <section className="w-full max-w-5xl rounded-[2rem] border border-white/10 bg-black/70 p-5 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-8 lg:p-10">
      <div className="mb-8">
        <div className="inline-flex rounded-full border border-lime-500/20 bg-lime-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.28em] text-lime-400">
          Step 05 · Channels
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Select your channels
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
              Choose every channel and message type you expect to send. SMS,
              WhatsApp, and email categories are stored separately because
              pricing, templates, and compliance rules differ by type.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={allSelected ? clearAll : selectAll}
              className="h-11 rounded-xl border-white/10 bg-white/[0.03] px-4 text-white hover:bg-white/[0.06] hover:text-white"
            >
              {allSelected ? "Clear all" : "Select all"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Bell className="h-4 w-4 text-lime-400" />
            <p className="text-xs uppercase tracking-[0.22em]">Channels</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">
            {selectedChannelCount}
            <span className="ml-1 text-sm font-normal text-zinc-500">
              / {CHANNEL_OPTIONS.length}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Zap className="h-4 w-4 text-lime-400" />
            <p className="text-xs uppercase tracking-[0.22em]">Types</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">
            {selectedTypeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <MonitorSmartphone className="h-4 w-4 text-lime-400" />
            <p className="text-xs uppercase tracking-[0.22em]">Setup</p>
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-300">
            {hasSelection
              ? "Routing profile ready"
              : "No channels selected yet"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {CHANNEL_OPTIONS.map((channel) => {
          const Icon = channel.icon;
          const selectedTypes = selectedChannels[channel.id];
          const isChannelSelected = selectedTypes.length > 0;
          const isFullChannelSelected =
            selectedTypes.length === channel.types.length;

          return (
            <div
              key={channel.id}
              className={cn(
                "rounded-[1.5rem] border bg-white/[0.018] p-4 transition-all duration-200 sm:p-5",
                isChannelSelected
                  ? "border-lime-500/35 bg-lime-500/[0.045]"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]",
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <button
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className="group flex flex-1 items-start gap-4 text-left"
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all",
                      isChannelSelected
                        ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 group-hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span>
                    <span className="block text-lg font-semibold text-white">
                      {channel.title}
                    </span>
                    <span className="mt-1 block max-w-2xl text-sm leading-6 text-zinc-400">
                      {channel.description}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
                    isFullChannelSelected
                      ? "border-lime-500 bg-lime-500 text-black"
                      : isChannelSelected
                        ? "border-lime-500/60 bg-lime-500/10 text-lime-400"
                        : "border-white/15 bg-black text-transparent hover:border-white/30",
                  )}
                  aria-label={`Toggle ${channel.title}`}
                >
                  {isFullChannelSelected ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : isChannelSelected ? (
                    <span className="h-2 w-2 rounded-full bg-lime-400" />
                  ) : null}
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {channel.types.map((type) => {
                  const isSelected = selectedTypes.includes(type.id);

                  return (
                    <button
                      key={`${channel.id}-${type.id}`}
                      type="button"
                      onClick={() => toggleType(channel.id, type.id)}
                      className={cn(
                        "group rounded-2xl border p-4 text-left transition-all duration-200",
                        isSelected
                          ? "border-lime-500/40 bg-lime-500/[0.08]"
                          : "border-white/10 bg-black/35 hover:border-white/20 hover:bg-white/[0.025]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">{type.label}</p>
                          <p className="mt-1 text-sm leading-6 text-zinc-500">
                            {type.description}
                          </p>
                        </div>

                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                            isSelected
                              ? "border-lime-500 bg-lime-500 text-black"
                              : "border-white/15 bg-black text-transparent group-hover:border-white/30",
                          )}
                        >
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          ) : null}
                        </span>
                      </div>

                      {type.complianceNote ? (
                        <p className="mt-3 rounded-xl border border-lime-500/15 bg-lime-500/[0.045] px-3 py-2 text-xs leading-5 text-lime-200/80">
                          {type.complianceNote}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            Step 5 of 6 · Workspace onboarding
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleSkip}
              className="h-12 rounded-xl border-white/10 bg-white/[0.03] px-7 text-white hover:bg-white/[0.06] hover:text-white"
            >
              Skip
            </Button>

            <Button
              type="button"
              disabled={isPending || !hasSelection}
              onClick={handleSubmit}
              className="h-12 rounded-xl bg-lime-500 px-8 font-semibold text-black hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
