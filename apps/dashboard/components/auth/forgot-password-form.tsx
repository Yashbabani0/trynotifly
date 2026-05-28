"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/onboarding/schemas";
import { InlineNotice, TextField, Toast } from "./form-field";

export function ForgotPasswordForm() {
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setNotice(null);
    const result = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });

    if (result.error) {
      setNotice({
        tone: "error",
        message: result.error.message ?? "Could not send reset instructions.",
      });
      return;
    }

    setNotice({
      tone: "success",
      message: "If an account exists, reset instructions have been sent.",
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Toast tone={notice?.tone} message={notice?.message ?? null} />
      {notice ? <InlineNotice tone={notice.tone}>{notice.message}</InlineNotice> : null}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
