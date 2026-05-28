"use client";

import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New password and confirmation do not match.",
    path: ["confirmPassword"],
  });

function messageFromError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = Reflect.get(error, "message");
    if (typeof message === "string" && message) {
      return message;
    }
  }

  return "Could not update password.";
}

export function PasswordUpdateForm({ hasPassword }: { hasPassword: boolean }) {
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const parsed = passwordSchema.safeParse({
      currentPassword: String(formData.get("currentPassword") ?? ""),
      newPassword: String(formData.get("newPassword") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });

    if (!parsed.success) {
      setMessage({
        tone: "error",
        text: parsed.error.issues[0]?.message ?? "Check your password fields.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await authClient.changePassword({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      });

      if (response.error) {
        throw response.error;
      }

      event.currentTarget.reset();
      setMessage({
        tone: "success",
        text: "Password updated. Other sessions were revoked.",
      });
    } catch (error) {
      setMessage({ tone: "error", text: messageFromError(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!hasPassword ? (
        <div className="rounded-md border border-amber-600/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          This account currently signs in with OAuth only. Use password reset to add a password login.
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type={showPasswords ? "text" : "password"}
            autoComplete="current-password"
            disabled={!hasPassword || submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            disabled={!hasPassword || submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            disabled={!hasPassword || submitting}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!hasPassword || submitting}>
          {submitting ? "Updating..." : "Update password"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPasswords((current) => !current)}
        >
          {showPasswords ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
          {showPasswords ? "Hide" : "Show"} passwords
        </Button>
      </div>
      {message ? (
        <p
          className={
            message.tone === "success"
              ? "rounded-md border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
              : "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
          role="status"
        >
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
