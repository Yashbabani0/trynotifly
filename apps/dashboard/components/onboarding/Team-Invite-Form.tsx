"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowRight, Check, Mail, Plus, Trash2, UserRound } from "lucide-react";
import { z } from "zod";
import clsx from "clsx";

const roleOptions = [
  {
    value: "admin",
    label: "Admin",
    description: "Manage workspace settings and team members.",
  },
  {
    value: "member",
    label: "Member",
    description: "Create, edit, and manage notification workflows.",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access for reports and monitoring.",
  },
] as const;

type InviteRole = (typeof roleOptions)[number]["value"];

type InviteRow = {
  id: string;
  email: string;
  role: InviteRole;
};

const inviteSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.email("Enter a valid email address."),
        role: z.enum(["admin", "member", "viewer"]),
      }),
    )
    .max(10, "You can invite up to 10 teammates at once."),
});

function createInviteRow(role: InviteRole = "member"): InviteRow {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    email: "",
    role,
  };
}

export default function TeamInviteForm() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [defaultRole, setDefaultRole] = useState<InviteRole>("member");
  const [invites, setInvites] = useState<InviteRow[]>([
    createInviteRow("member"),
  ]);

  const validInviteCount = useMemo(() => {
    return invites.filter((invite) => invite.email.trim().length > 0).length;
  }, [invites]);

  function updateInvite(id: string, value: Partial<InviteRow>) {
    setInvites((current) =>
      current.map((invite) =>
        invite.id === id
          ? {
              ...invite,
              ...value,
            }
          : invite,
      ),
    );
  }

  function selectDefaultRole(role: InviteRole) {
    setDefaultRole(role);

    setInvites((current) =>
      current.map((invite) => ({
        ...invite,
        role,
      })),
    );
  }

  function addInvite() {
    if (invites.length >= 10) {
      toast.error("You can invite up to 10 teammates at once.");
      return;
    }

    setInvites((current) => [...current, createInviteRow(defaultRole)]);
  }

  function removeInvite(id: string) {
    setInvites((current) => {
      if (current.length === 1) {
        return [createInviteRow(defaultRole)];
      }

      return current.filter((invite) => invite.id !== id);
    });
  }

  async function submitInvites(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanedInvites = invites
      .map((invite) => ({
        email: invite.email.trim().toLowerCase(),
        role: invite.role,
      }))
      .filter((invite) => invite.email.length > 0);

    if (cleanedInvites.length === 0) {
      toast.error("Add at least one teammate email or skip this step.");
      return;
    }

    const validatedFields = inviteSchema.safeParse({
      invites: cleanedInvites,
    });

    if (!validatedFields.success) {
      const firstError =
        validatedFields.error.issues[0]?.message || "Invalid invite details.";

      toast.error(firstError);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/onboarding/team/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedFields.data),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Failed to send invitations.");
          return;
        }

        toast.success(
          data.sentCount === 1
            ? "Invitation sent successfully."
            : `${data.sentCount} invitations sent successfully.`,
        );

        router.push("/onboarding/channels");
      } catch {
        toast.error("Failed to send invitations.");
      }
    });
  }

  async function skipTeamInvite() {
    if (isPending) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/onboarding/team/skip", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Failed to skip team invite.");
          return;
        }

        router.push("/onboarding/channels");
      } catch {
        toast.error("Failed to skip team invite.");
      }
    });
  }

  return (
    <div className="w-full">
      <div className="mb-9">
        <div className="mb-5 inline-flex items-center rounded-full border border-lime-500/20 bg-lime-500/10 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-lime-300">
          Step 04 · Team
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.035em] text-white md:text-4xl">
              Invite your teammates
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-400">
              Add teammates now so your workspace is ready for shared
              notification workflows. This step is optional.
            </p>
          </div>

          <button
            type="button"
            onClick={skipTeamInvite}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-50"
          >
            Skip for now
            <ArrowRight className="ml-2 size-4" />
          </button>
        </div>
      </div>

      <form onSubmit={submitInvites} className="space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-sm font-medium text-white">Team members</p>

              <p className="mt-1 text-sm text-zinc-500">
                Invite up to 10 people. They will receive an email invite.
              </p>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-zinc-400 sm:block">
              {validInviteCount} pending
            </div>
          </div>

          <div className="space-y-3">
            {invites.map((invite, index) => {
              return (
                <div
                  key={invite.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 transition-all duration-200 focus-within:border-lime-500/30 focus-within:bg-lime-500/[0.025]"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_220px_44px] lg:items-end">
                    <div>
                      <label
                        htmlFor={`invite-email-${invite.id}`}
                        className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500"
                      >
                        <Mail className="size-3.5" />
                        Email {index + 1}
                      </label>

                      <input
                        id={`invite-email-${invite.id}`}
                        type="email"
                        value={invite.email}
                        onChange={(e) =>
                          updateInvite(invite.id, {
                            email: e.target.value,
                          })
                        }
                        placeholder="teammate@company.com"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-lime-500/40 focus:bg-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`invite-role-${invite.id}`}
                        className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500"
                      >
                        <UserRound className="size-3.5" />
                        Role
                      </label>

                      <select
                        id={`invite-role-${invite.id}`}
                        value={invite.role}
                        onChange={(e) =>
                          updateInvite(invite.id, {
                            role: e.target.value as InviteRole,
                          })
                        }
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-200 focus:border-lime-500/40 focus:bg-black"
                      >
                        {roleOptions.map((role) => (
                          <option
                            key={role.value}
                            value={role.value}
                            className="bg-black text-white"
                          >
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeInvite(invite.id)}
                      className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-500 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                      aria-label="Remove invite"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addInvite}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-lime-500/30 hover:bg-lime-500/10 hover:text-lime-300"
          >
            <Plus className="mr-2 size-4" />
            Add another teammate
          </button>
        </div>

        <div>
          <div className="mb-5">
            <p className="text-sm font-medium text-white">Role permissions</p>

            <p className="mt-1 text-sm text-zinc-500">
              Choose the least privileged role your teammate needs.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {roleOptions.map((role) => {
              const isActive = defaultRole === role.value;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => selectDefaultRole(role.value)}
                  className={clsx(
                    "group rounded-2xl border p-4 text-left transition-all duration-200",
                    "hover:border-lime-500/30 hover:bg-lime-500/[0.04]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40",
                    isActive
                      ? "border-lime-500/30 bg-lime-500/[0.07]"
                      : "border-white/10 bg-white/[0.025]",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-white">
                      {role.label}
                    </h3>

                    <span
                      className={clsx(
                        "inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                        isActive
                          ? "border-lime-400 bg-lime-400 text-black"
                          : "border-white/10 bg-black text-transparent group-hover:border-lime-500/30",
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-zinc-500">
                    {role.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            Step 4 of 6 · Workspace onboarding
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={skipTeamInvite}
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-50"
            >
              Skip
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-lime-400 px-6 text-sm font-semibold text-black transition-all duration-200 hover:bg-lime-300 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send invites"}
              {!isPending && <ArrowRight className="ml-2 size-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
