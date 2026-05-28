"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpInput } from "@/lib/onboarding/schemas";
import { InlineNotice, TextField, Toast } from "./form-field";

export function SignUpForm() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpInput) {
    setNotice(null);
    const result = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/onboarding",
    });

    if (result.error) {
      setNotice(result.error.message ?? "Could not create account.");
      return;
    }

    setNotice("Account created. Redirecting...");
    router.replace("/onboarding");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Toast tone={notice?.startsWith("Account") ? "success" : "error"} message={notice} />
      {notice ? (
        <InlineNotice tone={notice.startsWith("Account") ? "success" : "error"}>
          {notice}
        </InlineNotice>
      ) : null}
      <TextField
        label="Name"
        autoComplete="name"
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />
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
        autoComplete="new-password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
