"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Lock } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { passwordSchema } from "@/lib/auth/password-validations";
import { cn } from "@/lib/utils";
import {
  AuthBottomLink,
  AuthErrorBlock,
  AuthHeader,
  AuthInput,
  AuthShell,
  AuthSubmitButton,
  FieldShell,
  PasswordChecklist,
  PasswordToggle,
  getPasswordRuleStates,
} from "@/components/auth";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRules = useMemo(
    () => getPasswordRuleStates(password),
    [password],
  );
  const allRulesMet = passwordRules.every((r) => r.met);
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!token) {
      toast.error("This reset link is invalid or expired.");
      return;
    }

    setError("");

    const validatedFields = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validatedFields.success) {
      const firstError =
        validatedFields.error.issues[0]?.message || "Invalid form data";
      setError(firstError);
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      await authClient.resetPassword({ newPassword: password, token });
      setSuccess(true);
      toast.success("Password reset successfully. Redirecting to sign in…");
      setTimeout(() => router.replace("/signin"), 1200);
    } catch {
      toast.error(
        "This reset link is invalid or expired. Request a new password reset email.",
      );
    } finally {
      setLoading(false);
    }
  }

  // Invalid token — show a clear, friendly recovery prompt.
  if (!token) {
    return (
      <AuthShell>
        <AuthHeader
          eyebrow="04 · Reset password"
          title="This link won't work"
          description="This reset link is invalid or expired. Request a new password reset email to continue."
        />
        <Link
          href="/forgot-password"
          className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-[13.5px] font-semibold tracking-tight text-primary-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-primary/90 active:translate-y-px"
          style={{
            boxShadow:
              "inset 0 1px 0 0 color-mix(in oklch, white 20%, transparent), 0 1px 0 0 color-mix(in oklch, black 30%, transparent)",
          }}
        >
          Request a new link
        </Link>
        <AuthBottomLink
          prompt="Remembered it?"
          href="/signin"
          cta="Back to sign in"
        />
      </AuthShell>
    );
  }

  // Success state — short confirmation before redirect.
  if (success) {
    return (
      <AuthShell>
        <AuthHeader
          eyebrow="04 · Reset password"
          title="Password updated"
          description="Your password has been reset. Redirecting you to sign in…"
        />
        <AuthBottomLink
          prompt="Taking too long?"
          href="/signin"
          cta="Go to sign in"
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthHeader
        eyebrow="04 · Reset password"
        title="Set a new password"
        description="Choose a strong password you haven't used before. We'll sign all your other sessions out for safety."
      />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FieldShell
          htmlFor="password"
          label="New password"
          hint={
            password.length > 0 ? (
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.14em] uppercase transition-colors",
                  allRulesMet ? "text-primary" : "text-muted-foreground",
                )}
              >
                {allRulesMet ? "strong" : "weak"}
              </span>
            ) : null
          }
        >
          <AuthInput
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            disabled={loading}
            icon={<Lock className="size-4" strokeWidth={2} />}
            trailing={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            }
          />
          <PasswordChecklist
            value={password}
            visible={passwordFocused || password.length > 0}
          />
        </FieldShell>

        <FieldShell
          htmlFor="confirmPassword"
          label="Confirm password"
          hint={
            confirmPassword.length > 0 ? (
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.14em] uppercase transition-colors",
                  passwordsMatch ? "text-primary" : "text-destructive/80",
                )}
              >
                {passwordsMatch ? "match" : "mismatch"}
              </span>
            ) : null
          }
        >
          <AuthInput
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            icon={<Lock className="size-4" strokeWidth={2} />}
            trailing={
              <PasswordToggle
                visible={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />
            }
          />
        </FieldShell>

        <AuthErrorBlock error={error} />

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Resetting password…"
          disabled={loading}
        >
          Reset password
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
