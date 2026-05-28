"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Toast } from "@/components/auth/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDate,
  getSummary,
  StatusBadge,
  type DomainStatus,
  type EmailDomain,
} from "@/components/domains/domain-shared";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error?: { code: string; message: string; details?: unknown } };

type SortKey = "domain" | "createdAt" | "lastCheckedAt" | "domainStatus";

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

export function DashboardDomainsList({
  canManage,
}: {
  canManage: boolean;
}) {
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingDomain, setRefreshingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DomainStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [toast, setToast] = useState<{ tone: "default" | "success" | "error"; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDomains() {
    setError(null);
    const data = await fetch("/api/domains", { cache: "no-store" }).then(
      handleResponse<{ domains: EmailDomain[] }>,
    );
    setDomains(data.domains);
  }

  async function refreshDomain(domain: string) {
    setRefreshingDomain(domain);
    setError(null);

    try {
      const data = await fetch(`/api/domains/${encodeURIComponent(domain)}/check`, {
        method: "POST",
      }).then(handleResponse<{ domain: EmailDomain }>);
      const summary = getSummary(data.domain);
      setDomains((current) =>
        current.map((item) => (item.domain === domain ? data.domain : item)),
      );
      setToast({
        tone: summary.domainStatus === "ready" ? "success" : summary.domainStatus === "failed" ? "error" : "default",
        message: summary.message,
      });
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : "Could not refresh domain.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setRefreshingDomain(null);
    }
  }

  async function deleteDomain(domain: string) {
    if (!window.confirm(`Delete ${domain}? This removes the SES identity and DNS setup from TryNotifly.`)) {
      return;
    }

    setDeletingDomain(domain);
    setError(null);

    try {
      await fetch(`/api/domains/${encodeURIComponent(domain)}`, {
        method: "DELETE",
      }).then(handleResponse<{ deleted: boolean; domain: string }>);
      setDomains((current) => current.filter((item) => item.domain !== domain));
      setToast({ tone: "success", message: "Domain deleted." });
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Could not delete domain.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setDeletingDomain(null);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDomains()
        .catch((loadError) => {
          const message = loadError instanceof Error ? loadError.message : "Could not load domains.";
          setError(message);
          setToast({ tone: "error", message });
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredDomains = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...domains]
      .filter((domain) => {
        const summary = getSummary(domain);
        const matchesQuery =
          !normalizedQuery ||
          domain.domain.toLowerCase().includes(normalizedQuery) ||
          domain.mailFromDomain?.toLowerCase().includes(normalizedQuery);
        const matchesStatus = statusFilter === "all" || summary.domainStatus === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortKey === "domain") {
          return a.domain.localeCompare(b.domain);
        }

        if (sortKey === "domainStatus") {
          return getSummary(a).domainStatus.localeCompare(getSummary(b).domainStatus);
        }

        const aDate = sortKey === "lastCheckedAt" ? a.lastCheckedAt : a.createdAt;
        const bDate = sortKey === "lastCheckedAt" ? b.lastCheckedAt : b.createdAt;

        return new Date(bDate ?? 0).getTime() - new Date(aDate ?? 0).getTime();
      });
  }, [domains, query, sortKey, statusFilter]);

  const stats = useMemo(() => {
    const summaries = domains.map(getSummary);

    return {
      total: domains.length,
      ready: summaries.filter((summary) => summary.domainStatus === "ready").length,
      pending: summaries.filter(
        (summary) =>
          summary.domainStatus === "dns_pending" || summary.domainStatus === "partially_verified",
      ).length,
      failed: summaries.filter((summary) => summary.domainStatus === "failed").length,
    };
  }, [domains]);

  return (
    <div className="flex flex-col gap-6">
      <Toast tone={toast?.tone} message={toast?.message ?? null} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total domains", stats.total],
          ["Ready", stats.ready],
          ["Needs action", stats.pending],
          ["Failed", stats.failed],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search domains or MAIL FROM"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as DomainStatus | "all")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="ready">Ready</option>
              <option value="partially_verified">Partially verified</option>
              <option value="dns_pending">DNS pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="createdAt">Newest first</option>
              <option value="domain">Domain A-Z</option>
              <option value="lastCheckedAt">Last checked</option>
              <option value="domainStatus">Status</option>
            </select>
            <Button type="button" variant="outline" onClick={() => void loadDomains()}>
              Refresh list
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : filteredDomains.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-semibold">No domains found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first sending domain or adjust the filters.
              </p>
              {canManage ? (
                <Button asChild className="mt-5">
                  <Link href="/dashboard/organization/domains/add">Add domain</Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SES</TableHead>
                  <TableHead>DKIM</TableHead>
                  <TableHead>SPF</TableHead>
                  <TableHead>DMARC</TableHead>
                  <TableHead>MAIL FROM</TableHead>
                  <TableHead>Last checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDomains.map((domain) => {
                  const summary = getSummary(domain);
                  const mailFromStatus =
                    summary.mailFromMxStatus === "verified" && summary.mailFromSpfStatus === "verified"
                      ? "verified"
                      : summary.mailFromMxStatus === "failed" || summary.mailFromSpfStatus === "failed"
                        ? "failed"
                        : summary.mailFromMxStatus === "not_configured" ||
                            summary.mailFromSpfStatus === "not_configured"
                          ? "not_configured"
                          : "pending";

                  return (
                    <TableRow key={domain.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/organization/domains/${encodeURIComponent(domain.domain)}`}
                          className="font-medium hover:underline"
                        >
                          {domain.domain}
                        </Link>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {domain.provider ?? "AWS SES"} · {domain.mailFromDomain ?? `mail.${domain.domain}`}
                        </p>
                      </TableCell>
                      <TableCell><StatusBadge status={summary.domainStatus} /></TableCell>
                      <TableCell><StatusBadge status={summary.sesIdentityStatus} /></TableCell>
                      <TableCell><StatusBadge status={summary.dkimStatus} /></TableCell>
                      <TableCell><StatusBadge status={summary.spfStatus} /></TableCell>
                      <TableCell><StatusBadge status={summary.dmarcStatus} /></TableCell>
                      <TableCell><StatusBadge status={mailFromStatus} /></TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(domain.lastCheckedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/organization/domains/${encodeURIComponent(domain.domain)}`}>
                              View
                            </Link>
                          </Button>
                          {canManage ? (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void refreshDomain(domain.domain)}
                                disabled={refreshingDomain === domain.domain}
                              >
                                {refreshingDomain === domain.domain ? "Checking" : "Verify"}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => void deleteDomain(domain.domain)}
                                disabled={deletingDomain === domain.domain}
                              >
                                {deletingDomain === domain.domain ? "Deleting" : "Delete"}
                              </Button>
                            </>
                          ) : (
                            <Badge variant="outline">Read only</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
