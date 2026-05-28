"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { signInSchema, type SignInInput } from "@/lib/onboarding/schemas";
import { InlineNotice, TextField, Toast } from "./form-field";

export function SignInForm({ callbackURL = "/onboarding" }: { callbackURL?: string }) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInInput) {
    setNotice(null);
    const result = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL,
    });

    if (result.error) {
      setNotice(result.error.message ?? "Could not sign in.");
      return;
    }

    setNotice("Signed in. Redirecting...");
    router.replace(callbackURL);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Toast tone={notice?.startsWith("Signed") ? "success" : "error"} message={notice} />
      {notice ? (
        <InlineNotice tone={notice.startsWith("Signed") ? "success" : "error"}>
          {notice}
        </InlineNotice>
      ) : null}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
