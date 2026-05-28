"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { InlineNotice, SelectField, TextField } from "@/components/auth/form-field";
import { inviteMemberAction } from "@/app/(dashboard)/dashboard/settings/team/actions";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/lib/onboarding/schemas";

export function InviteMemberForm() {
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  function submit(values: InviteMemberInput) {
    setNotice(null);
    startTransition(async () => {
      const result = await inviteMemberAction(values);

      setNotice({
        tone: result.ok ? "success" : "error",
        message: result.message,
      });

      if (result.ok) {
        form.reset({
          email: "",
          role: "member",
        });
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
      {notice ? <InlineNotice tone={notice.tone}>{notice.message}</InlineNotice> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <TextField
          label="Email"
          type="email"
          placeholder="teammate@example.com"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <SelectField
          label="Role"
          error={form.formState.errors.role?.message}
          {...form.register("role")}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </SelectField>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send invitation"}
      </Button>
    </form>
  );
}
