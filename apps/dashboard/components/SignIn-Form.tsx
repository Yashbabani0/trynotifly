"use client";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null,
  );

  const signInSchema = z.object({
    email: z.email("Please enter a valid email address"),

    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");

    const validatedFields = signInSchema.safeParse({
      email,
      password,
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
      await authClient.signIn.email(
        { email, password },
        {
          onSuccess: () => {
            toast.success("Signed in successfully");
            router.push("/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      );
    } catch {
      toast.error("An error occurred while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithProvider(provider: "google" | "github") {
    if (oauthLoading) return;
    setOauthLoading(provider);

    try {
      await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
    } catch {
      toast.error(
        `An error occurred while signing in with ${provider}. Please try again.`,
      );
    } finally {
      setOauthLoading(null);
    }
  }
  return (
    <div className="w-80 h-120 border-2 mx-auto rounded-2xl flex flex-col items-center justify-center gap-4 mt-20 p-6">
      <button
        onClick={() => signInWithProvider("google")}
        disabled={oauthLoading !== null}
        className="w-full border-2 py-2 cursor-pointer"
      >
        {oauthLoading === "google"
          ? "Signing in with Google..."
          : "Sign in with Google"}
      </button>
      <button
        onClick={() => signInWithProvider("github")}
        disabled={oauthLoading !== null}
        className="w-full border-2 py-2 cursor-pointer"
      >
        {oauthLoading === "github"
          ? "Signing in with GitHub..."
          : "Sign in with GitHub"}
      </button>

      <div className="w-full">
        <p className="text-center my-4">or</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 py-2"
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 py-2"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="w-full border-2 py-2 cursor-pointer">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
