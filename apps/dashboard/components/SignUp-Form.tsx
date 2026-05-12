"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

import { authClient } from "@/lib/auth/auth-client";

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),

    email: z.email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),

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

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null,
  );

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
        {
          name,
          email,
          password,
        },
        {
          onSuccess: () => {
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

  async function signUpWithProvider(provider: "google" | "github") {
    if (oauthLoading) return;

    setOauthLoading(provider);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch {
      toast.error(`An error occurred while signing up with ${provider}.`);
    } finally {
      setOauthLoading(null);
    }
  }

  return (
    <div className="w-96 border-2 mx-auto rounded-2xl flex flex-col items-center justify-center gap-4 mt-20 p-6">
      <h1 className="text-2xl font-semibold">Create Account</h1>

      <button
        onClick={() => signUpWithProvider("google")}
        disabled={oauthLoading !== null}
        className="w-full border-2 py-2 cursor-pointer rounded-lg"
      >
        {oauthLoading === "google"
          ? "Signing up with Google..."
          : "Continue with Google"}
      </button>

      <button
        onClick={() => signUpWithProvider("github")}
        disabled={oauthLoading !== null}
        className="w-full border-2 py-2 cursor-pointer rounded-lg"
      >
        {oauthLoading === "github"
          ? "Signing up with GitHub..."
          : "Continue with GitHub"}
      </button>

      <div className="w-full">
        <p className="text-center my-4">or</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 py-2 px-3 rounded-lg"
              placeholder="John Doe"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 py-2 px-3 rounded-lg"
              placeholder="john@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 py-2 px-3 rounded-lg"
              placeholder="********"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-2 py-2 px-3 rounded-lg"
              placeholder="********"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full border-2 py-2 cursor-pointer rounded-lg"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/signin" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
