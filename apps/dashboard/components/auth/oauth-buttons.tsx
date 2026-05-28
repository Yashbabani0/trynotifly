"use client";

import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { InlineNotice } from "./form-field";

type Provider = "google" | "github";

export function OAuthButtons({ callbackURL = "/onboarding" }: { callbackURL?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: Provider) {
    setError(null);
    setLoadingProvider(provider);

    const result = await authClient.signIn.social({
      provider,
      callbackURL,
      errorCallbackURL: "/signIn",
      newUserCallbackURL: callbackURL,
    });

    if (result.error) {
      setError(result.error.message ?? `Could not continue with ${provider}.`);
      setLoadingProvider(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => signIn("google")}
          disabled={Boolean(loadingProvider)}
          className="w-full"
        >
          <IconBrandGoogle size={18} />
          {loadingProvider === "google" ? "Opening..." : "Google"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => signIn("github")}
          disabled={Boolean(loadingProvider)}
          className="w-full"
        >
          <IconBrandGithub size={18} />
          {loadingProvider === "github" ? "Opening..." : "GitHub"}
        </Button>
      </div>
    </div>
  );
}
