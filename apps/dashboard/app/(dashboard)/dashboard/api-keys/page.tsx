"use client";

import { useEffect, useMemo, useState } from "react";
import { IconCopy, IconKey, IconTrash } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ApiKeyRecord = {
  id: string;
  name: string;
  type: "LIVE" | "TEST";
  prefix: string;
  status: "ACTIVE" | "INACTIVE" | "REVOKED";
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt?: string | null;
};

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error?: { code: string; message: string; details?: unknown } };

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    const message =
      payload && !payload.success
        ? payload.error?.message ?? "Request failed."
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return payload.data;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusVariant(status: ApiKeyRecord["status"]) {
  if (status === "ACTIVE") {
    return "default" as const;
  }

  if (status === "REVOKED") {
    return "destructive" as const;
  }

  return "outline" as const;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"TEST" | "LIVE">("TEST");
  const [createdKey, setCreatedKey] = useState<{ rawKey: string; apiKey: ApiKeyRecord } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCount = useMemo(
    () => apiKeys.filter((key) => key.status === "ACTIVE").length,
    [apiKeys],
  );

  async function loadApiKeys() {
    setError(null);
    const data = await fetch("/api/api-keys", { cache: "no-store" }).then(
      handleResponse<{ apiKeys: ApiKeyRecord[] }>,
    );
    setApiKeys(data.apiKeys);
  }

  async function createApiKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const data = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      }).then(handleResponse<{ apiKey: ApiKeyRecord; rawKey: string }>);

      setApiKeys((current) => [data.apiKey, ...current]);
      setCreatedKey(data);
      setName("");
      setType("TEST");
      setCreateOpen(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create API key.");
    } finally {
      setCreating(false);
    }
  }

  async function revokeApiKey(key: ApiKeyRecord) {
    if (!window.confirm(`Revoke ${key.name}? Existing clients using this key will stop working.`)) {
      return;
    }

    setRevokingId(key.id);
    setError(null);

    try {
      const data = await fetch(`/api/api-keys/${key.id}`, {
        method: "DELETE",
      }).then(handleResponse<{ apiKey: ApiKeyRecord | null }>);

      if (data.apiKey) {
        setApiKeys((current) =>
          current.map((item) => (item.id === key.id ? data.apiKey! : item)),
        );
      }
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Could not revoke API key.");
    } finally {
      setRevokingId(null);
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApiKeys()
        .catch((loadError) => {
          setError(loadError instanceof Error ? loadError.message : "Could not load API keys.");
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Developer</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">API keys</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create organization-scoped test and live keys. Secrets are shown only once.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconKey className="size-4" />
              Create API key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>
                Choose a label and environment. API keys inherit organization channel access.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createApiKey} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Production server"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select value={type} onValueChange={(value) => setType(value as "TEST" | "LIVE")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEST">Test</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating || !name.trim()}>
                  {creating ? "Creating..." : "Create key"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active keys</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total keys</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{apiKeys.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Live keys</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {apiKeys.filter((key) => key.type === "LIVE").length}
          </CardContent>
        </Card>
      </section>

      {createdKey ? (
        <Card className="border-amber-600/60 bg-amber-500/10">
          <CardHeader>
            <CardTitle>Copy this key now</CardTitle>
            <p className="text-sm text-muted-foreground">
              You won’t be able to see it again after you leave or refresh this page.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-md border border-border bg-background px-3 py-2 font-mono text-xs">
              {createdKey.rawKey}
            </code>
            <Button type="button" onClick={() => void copy(createdKey.rawKey)}>
              <IconCopy className="size-4" />
              Copy key
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Keys</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="py-14 text-center">
              <h3 className="text-lg font-semibold">No API keys yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a test key for development or a live key for production traffic.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-xs">{key.prefix}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(key.status)}>{key.status.toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell>{key.type.toLowerCase()}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(key.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(key.lastUsedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => void revokeApiKey(key)}
                        disabled={key.status === "REVOKED" || revokingId === key.id}
                      >
                        <IconTrash className="size-4" />
                        {revokingId === key.id ? "Revoking" : "Revoke"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
