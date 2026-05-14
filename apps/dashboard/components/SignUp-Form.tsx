"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Lock, Mail, User2 } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { passwordSchema } from "@/lib/auth/password-validations";
import { cn } from "@/lib/utils";
import {
  AuthBottomLink,
  AuthDivider,
  AuthErrorBlock,
  AuthHeader,
  AuthInput,
  AuthShell,
  AuthSubmitButton,
  FieldShell,
  OAuthGroup,
  type OAuthProvider,
  PasswordChecklist,
  PasswordToggle,
  getPasswordRuleStates,
} from "@/components/auth";

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),
    email: z.email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

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
    setError("");

    const validatedFields = signUpSchema.safeParse({
      name,
      email,
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
      await authClient.signUp.email(
        { name, email, password },
        {
          onSuccess: async () => {
            localStorage.setItem("pending_verification_email", email);
            toast.success("Account created successfully");
            router.push("/verify-email");
          },
          onError: (ctx) => {
            setError(ctx.error.message);
            toast.error(ctx.error.message);
          },
        },
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithProvider(provider: OAuthProvider) {
    if (oauthLoading) return;
    setOauthLoading(provider);
    try {
      await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
    } catch {
      toast.error(`An error occurred while signing up with ${provider}.`);
    } finally {
      setOauthLoading(null);
    }
  }

  const isBusy = loading || oauthLoading !== null;

  return (
    <AuthShell>
      <AuthHeader
        eyebrow="01 · Create account"
        title="Create your account"
        description="Start sending in under five minutes. Free for development — no credit card required."
      />

      <OAuthGroup
        loadingProvider={oauthLoading}
        disabled={isBusy}
        onSelect={signUpWithProvider}
      />

      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FieldShell htmlFor="name" label="Full name">
          <AuthInput
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isBusy}
            icon={<User2 className="size-4" strokeWidth={2} />}
          />
        </FieldShell>

        <FieldShell htmlFor="email" label="Work email">
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBusy}
            icon={<Mail className="size-4" strokeWidth={2} />}
          />
        </FieldShell>

        <FieldShell
          htmlFor="password"
          label="Password"
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
            disabled={isBusy}
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
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isBusy}
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
          loadingLabel="Creating your account…"
          disabled={isBusy}
        >
          Create account
        </AuthSubmitButton>

        <p className="pt-1 text-center text-[11.5px] leading-relaxed text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <AuthBottomLink
        prompt="Already have an account?"
        href="/signin"
        cta="Sign in"
      />
    </AuthShell>
  );
}
