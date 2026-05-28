"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconBrandGithub, IconBrandGoogle, IconLink, IconUnlink } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ConnectedAccount = {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: Date | string;
};

const providers = [
  {
    id: "google",
    label: "Google",
    icon: IconBrandGoogle,
  },
  {
    id: "github",
    label: "GitHub",
    icon: IconBrandGithub,
  },
] as const;

function providerLabel(providerId: string) {
  if (providerId === "credential") {
    return "Password";
  }

  return providers.find((provider) => provider.id === providerId)?.label ?? providerId;
}

function messageFromError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = Reflect.get(error, "message");
    if (typeof message === "string" && message) {
      return message;
    }
  }

  return "Account action failed.";
}

export function ConnectedAccountsClient({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const connectedProviders = new Set(accounts.map((account) => account.providerId));
  const hasPassword = connectedProviders.has("credential");

  async function linkProvider(provider: "google" | "github") {
    setPendingProvider(provider);
    setMessage(null);

    try {
      const response = await authClient.linkSocial({
        provider,
        callbackURL: "/dashboard/account/connected-accounts",
      });

      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      setMessage({ tone: "error", text: messageFromError(error) });
      setPendingProvider(null);
    }
  }

  async function unlink(account: ConnectedAccount) {
    const loginMethodsAfterUnlink = accounts.filter((item) => item.id !== account.id);
    const removesOnlyLoginMethod = loginMethodsAfterUnlink.length === 0;

    if (removesOnlyLoginMethod && !hasPassword) {
      setMessage({
        tone: "error",
        text: "Add a password or another OAuth provider before disconnecting your only login method.",
      });
      return;
    }

    if (!window.confirm(`Disconnect ${providerLabel(account.providerId)}?`)) {
      return;
    }

    setPendingProvider(account.providerId);
    setMessage(null);

    try {
      const response = await authClient.unlinkAccount({
        providerId: account.providerId,
        accountId: account.accountId,
      });

      if (response.error) {
        throw response.error;
      }

      setMessage({ tone: "success", text: `${providerLabel(account.providerId)} disconnected.` });
      router.refresh();
    } catch (error) {
      setMessage({ tone: "error", text: messageFromError(error) });
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((provider) => {
          const Icon = provider.icon;
          const connected = connectedProviders.has(provider.id);
          return (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <Icon className="size-5" />
                <div>
                  <p className="font-medium">{provider.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {connected ? "Connected to this account" : "Not connected"}
                  </p>
                </div>
              </div>
              {connected ? (
                <Badge variant="secondary">Connected</Badge>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void linkProvider(provider.id)}
                  disabled={pendingProvider === provider.id}
                >
                  <IconLink className="size-4" />
                  Link
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{providerLabel(account.providerId)}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {account.providerId}:{account.accountId}
              </p>
            </div>
            {account.providerId === "credential" ? (
              <Badge variant="outline">Password login</Badge>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void unlink(account)}
                disabled={pendingProvider === account.providerId}
              >
                <IconUnlink className="size-4" />
                Disconnect
              </Button>
            )}
          </div>
        ))}
      </div>

      {message ? (
        <p
          className={
            message.tone === "success"
              ? "rounded-md border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
              : "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
          role="status"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
