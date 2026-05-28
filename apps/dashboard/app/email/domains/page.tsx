"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Toast } from "@/components/auth/form-field";
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

export default function DomainsPage() {
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingDomain, setRefreshingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DomainStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [page, setPage] = useState(1);
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
      }).then(
        handleResponse<{
          domain: EmailDomain;
        }>,
      );
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

  useEffect(() => {
    const timer = window.setTimeout(() => setPage(1), 0);

    return () => window.clearTimeout(timer);
  }, [query, statusFilter, sortKey]);

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
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredDomains.length / pageSize));
  const paginatedDomains = filteredDomains.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      const timer = window.setTimeout(() => setPage(totalPages), 0);

      return () => window.clearTimeout(timer);
    }
  }, [page, totalPages]);

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
    <main className="min-h-screen bg-background text-foreground">
      <Toast tone={toast?.tone} message={toast?.message ?? null} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Dashboard / Email</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Sending domains</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage SES identities, DKIM, SPF, DMARC, and custom MAIL FROM setup for your workspace.
            </p>
          </div>
          <Link
            href="/email/domains/add"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Add domain
          </Link>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total domains", stats.total],
            ["Ready", stats.ready],
            ["Needs action", stats.pending],
            ["Failed", stats.failed],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search domains or MAIL FROM"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring transition placeholder:text-muted-foreground focus:ring-2"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as DomainStatus | "all")}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring transition focus:ring-2"
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
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring transition focus:ring-2"
            >
              <option value="createdAt">Newest first</option>
              <option value="domain">Domain A-Z</option>
              <option value="lastCheckedAt">Last checked</option>
              <option value="domainStatus">Status</option>
            </select>
            <button
              type="button"
              onClick={() => void loadDomains()}
              className="h-10 rounded-md border border-border px-4 text-sm font-semibold hover:bg-accent"
            >
              Refresh list
            </button>
          </div>
        </section>

        {error ? (
          <div className="rounded-lg border border-red-700 bg-red-600/10 p-4 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <section className="overflow-x-auto rounded-lg border border-border bg-card">
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
              <Link
                href="/email/domains/add"
                className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                Add domain
              </Link>
            </div>
          ) : (
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Domain</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">SES</th>
                  <th className="px-4 py-3 font-medium">DKIM</th>
                  <th className="px-4 py-3 font-medium">SPF</th>
                  <th className="px-4 py-3 font-medium">DMARC</th>
                  <th className="px-4 py-3 font-medium">MAIL FROM</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Last checked</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDomains.map((domain) => {
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
                    <tr key={domain.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-4 align-top">
                        <Link href={`/email/domains/${encodeURIComponent(domain.domain)}`} className="font-medium hover:underline">
                          {domain.domain}
                        </Link>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {domain.provider ?? "AWS SES"} · {domain.mailFromDomain ?? `mail.${domain.domain}`}
                        </p>
                        {!domain.sendingEnabled ? (
                          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                            Action required: {summary.pending.join(", ") || summary.failed.join(", ")}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <StatusBadge status={summary.domainStatus} />
                      </td>
                      <td className="px-4 py-4 align-top"><StatusBadge status={summary.sesIdentityStatus} /></td>
                      <td className="px-4 py-4 align-top"><StatusBadge status={summary.dkimStatus} /></td>
                      <td className="px-4 py-4 align-top"><StatusBadge status={summary.spfStatus} /></td>
                      <td className="px-4 py-4 align-top"><StatusBadge status={summary.dmarcStatus} /></td>
                      <td className="px-4 py-4 align-top"><StatusBadge status={mailFromStatus} /></td>
                      <td className="px-4 py-4 align-top text-muted-foreground">{formatDate(domain.createdAt)}</td>
                      <td className="px-4 py-4 align-top text-muted-foreground">{formatDate(domain.lastCheckedAt)}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/email/domains/${encodeURIComponent(domain.domain)}`}
                            className="h-8 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => void refreshDomain(domain.domain)}
                            disabled={refreshingDomain === domain.domain}
                            className="h-8 rounded-md border border-border px-3 text-xs font-medium hover:bg-accent disabled:opacity-50"
                          >
                            {refreshingDomain === domain.domain ? "Checking" : "Verify"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteDomain(domain.domain)}
                            disabled={deletingDomain === domain.domain}
                            className="h-8 rounded-md border border-red-700/50 px-3 text-xs font-medium text-red-700 hover:bg-red-600/10 dark:text-red-200 disabled:opacity-50"
                          >
                            {deletingDomain === domain.domain ? "Deleting" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {filteredDomains.length > pageSize ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredDomains.length)} of {filteredDomains.length}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <span className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
