"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Mail } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import {
  AuthBottomLink,
  AuthErrorBlock,
  AuthHeader,
  AuthInput,
  AuthShell,
  AuthSubmitButton,
  FieldShell,
} from "@/components/auth";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");

    const validatedFields = forgotPasswordSchema.safeParse({ email });

    if (!validatedFields.success) {
      const firstError =
        validatedFields.error.issues[0]?.message || "Invalid form data";
      setError(firstError);
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      setSent(true);
      toast.success(
        "If an account exists for this email, a reset link is on its way.",
      );
    } catch {
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthHeader
        eyebrow="03 · Forgot password"
        title={sent ? "Check your inbox" : "Forgot your password?"}
        description={
          sent
            ? `If an account exists for ${email || "that address"}, we just sent a reset link. It's valid for 30 minutes.`
            : "Enter the email you signed up with and we'll send you a secure link to reset your password."
        }
      />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FieldShell htmlFor="email" label="Work email">
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            icon={<Mail className="size-4" strokeWidth={2} />}
          />
        </FieldShell>

        <AuthErrorBlock error={error} />

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Sending reset link…"
          disabled={loading}
        >
          {sent ? "Resend reset link" : "Send reset link"}
        </AuthSubmitButton>
      </form>

      <AuthBottomLink
        prompt="Remembered it?"
        href="/signin"
        cta="Back to sign in"
      />
    </AuthShell>
  );
}
