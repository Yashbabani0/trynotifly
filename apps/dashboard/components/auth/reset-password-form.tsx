"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/onboarding/schemas";
import { InlineNotice, TextField, Toast } from "./form-field";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setNotice(null);
    const result = await authClient.resetPassword({
      newPassword: values.password,
      token: values.token,
    });

    if (result.error) {
      setNotice(result.error.message ?? "Could not reset password.");
      return;
    }

    router.replace("/signIn");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Toast tone="error" message={notice} />
      {notice ? <InlineNotice tone="error">{notice}</InlineNotice> : null}
      {!token ? (
        <InlineNotice tone="error">This reset link is missing a token.</InlineNotice>
      ) : null}
      <input type="hidden" {...form.register("token")} />
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <TextField
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting || !token}>
        {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
